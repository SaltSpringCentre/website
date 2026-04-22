/**
 * Cloudflare Worker: Mailchimp -> Blog sync
 *
 * Triggered by Mailchimp's "Send" webhook. Pulls the campaign HTML from
 * Mailchimp's API, strips boilerplate chrome, converts to markdown, commits
 * a new post .md file to SaltSpringCentre/website/posts/ via GitHub API.
 * Blog auto-redeploys on push.
 *
 * Also accepts manual trigger via:
 *   GET ?campaign_id=<id>          (re-run for a specific campaign)
 *   GET ?campaign_id=<id>&force=1  (overwrite if file exists)
 *
 * Add secrets (Settings > Variables and Secrets):
 *   MAILCHIMP_API_KEY  = your Mailchimp API key
 *   MAILCHIMP_DC       = datacenter prefix (e.g. us12)
 *   GITHUB_TOKEN       = fine-scoped PAT, contents:read+write on the repo
 *   GITHUB_REPO        = "SaltSpringCentre/website"
 *
 * Mailchimp webhook setup:
 *   Audience > Settings > Webhooks > Create
 *   Callback URL = this worker's URL
 *   Event       = Send (under Campaign Activity)
 */

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) });
    }

    let campaignId = null;
    let force = false;

    if (request.method === 'GET') {
      const url = new URL(request.url);
      campaignId = url.searchParams.get('campaign_id');
      force = url.searchParams.get('force') === '1';
      if (!campaignId) {
        // Mailchimp pings GET on webhook setup to verify URL.
        return jsonResponse({ ok: true, msg: 'ready' }, 200, request);
      }
    } else if (request.method === 'POST') {
      const body = await request.text();
      const params = new URLSearchParams(body);
      const type = params.get('type');
      if (type !== 'campaign') {
        return jsonResponse({ ok: true, ignored: type }, 200, request);
      }
      campaignId = params.get('data[id]');
    } else {
      return new Response('Method not allowed', { status: 405 });
    }

    if (!campaignId) {
      return jsonResponse({ error: 'No campaign_id' }, 400, request);
    }

    const need = ['MAILCHIMP_API_KEY', 'MAILCHIMP_DC', 'GITHUB_TOKEN', 'GITHUB_REPO'];
    const missing = need.filter((k) => !env[k]);
    if (missing.length) {
      return jsonResponse({ error: 'Missing: ' + missing.join(',') }, 500, request);
    }

    try {
      const result = await processCampaign(campaignId, env, force);
      return jsonResponse(result, 200, request);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500, request);
    }
  }
};

async function processCampaign(campaignId, env, force) {
  const dc = env.MAILCHIMP_DC;
  const auth = 'Basic ' + btoa('any:' + env.MAILCHIMP_API_KEY);

  // If purely numeric, treat as Mailchimp's URL web_id and resolve to API id.
  if (/^\d+$/.test(campaignId)) {
    const apiId = await resolveWebId(campaignId, dc, auth);
    if (!apiId) {
      throw new Error(`No campaign found with web_id ${campaignId}`);
    }
    campaignId = apiId;
  }

  const metaRes = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/campaigns/${campaignId}`,
    { headers: { Authorization: auth } }
  );
  if (!metaRes.ok) {
    throw new Error(`Mailchimp meta ${metaRes.status}`);
  }
  const meta = await metaRes.json();

  const contentRes = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`,
    { headers: { Authorization: auth } }
  );
  if (!contentRes.ok) {
    throw new Error(`Mailchimp content ${contentRes.status}`);
  }
  const content = await contentRes.json();

  const settings = meta.settings || {};
  const subject = settings.subject_line || settings.title || 'Untitled';
  const author = settings.from_name || '';
  const sendTime = meta.send_time || meta.create_time || new Date().toISOString();
  const dateOnly = sendTime.split('T')[0];
  const slug = slugify(subject);
  const filename = `${dateOnly}-${slug}.md`;
  const path = `posts/${filename}`;

  const cleaned = stripMailchimpChrome(content.html || '');
  let markdown = htmlToMarkdown(cleaned);
  markdown = cleanMailchimpArtifacts(markdown);

  const dateForFm = sendTime.replace('T', ' ').replace(/Z$/, '');
  const fm = [
    '---',
    `title: ${jsonStr(subject)}`,
    `date: ${dateForFm}`,
    `slug: ${slug}`,
    `author: ${jsonStr(author)}`,
    `categories: ["Monthly Newsletter"]`,
    `source: mailchimp:${campaignId}`,
    '---',
    '',
    markdown,
    ''
  ].join('\n');

  const result = await commitFile(path, fm, `Newsletter: ${subject}`, env, force);

  const indexResult = await updateIndex({
    title: subject,
    date: dateForFm,
    slug,
    file: filename,
    author,
    excerpt: extractExcerpt(markdown),
    featured_image: extractFeaturedImage(markdown)
  }, env);

  return {
    ok: true,
    filename,
    subject,
    sentAt: sendTime,
    ...result,
    index: indexResult
  };
}

function cleanMailchimpArtifacts(md) {
  md = md.replace(/\*\|[^|]*\|\*/g, '');
  md = md.replace(/\[[^\]]*view (this )?email[^\]]*\]\([^)]*\)/gi, '');
  md = md.replace(/\[[^\]]*view in browser[^\]]*\]\([^)]*\)/gi, '');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function extractExcerpt(md) {
  let s = md
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (s.length > 220) {
    s = s.substring(0, 220).replace(/\s+\S*$/, '') + '...';
  }
  return s;
}

function extractFeaturedImage(md) {
  const m = md.match(/!\[[^\]]*\]\(([^)\s]+)\)/);
  return m ? m[1] : '';
}

async function updateIndex(entry, env) {
  const indexPath = 'posts/index.json';
  const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${indexPath}`;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'sscy-mailchimp-sync',
    Accept: 'application/vnd.github.v3+json'
  };
  const getRes = await fetch(url, { headers });
  if (getRes.status !== 200) {
    return { skipped: 'no index.json' };
  }
  const meta = await getRes.json();
  const decoded = atob(meta.content.replace(/\n/g, ''));
  let posts;
  try {
    posts = JSON.parse(decoded);
  } catch (e) {
    return { error: 'index.json parse failed' };
  }
  const existingIdx = posts.findIndex((p) => p.slug === entry.slug);
  const merged = {
    title: entry.title,
    date: entry.date,
    slug: entry.slug,
    file: entry.file,
    author: entry.author,
    categories: ['Monthly Newsletter'],
    tags: [],
    excerpt: entry.excerpt
  };
  if (entry.featured_image) merged.featured_image = entry.featured_image;
  if (existingIdx >= 0) posts[existingIdx] = merged;
  else posts.push(merged);
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const newJson = JSON.stringify(posts, null, 2);
  const utf8 = new TextEncoder().encode(newJson);
  const base64 = bytesToBase64(utf8);
  const putBody = {
    message: `Index: ${entry.title}`,
    content: base64,
    branch: 'main',
    sha: meta.sha
  };
  const putRes = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(putBody)
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    return { error: `index PUT ${putRes.status}: ${err.substring(0, 120)}` };
  }
  return { updated: 'index.json' };
}

async function resolveWebId(webId, dc, auth) {
  // Mailchimp doesn't expose a direct web_id filter; page through campaigns.
  let offset = 0;
  const PAGE = 100;
  for (let i = 0; i < 50; i++) {
    const url = `https://${dc}.api.mailchimp.com/3.0/campaigns?count=${PAGE}&offset=${offset}&fields=campaigns.id,campaigns.web_id`;
    const r = await fetch(url, { headers: { Authorization: auth } });
    if (!r.ok) return null;
    const data = await r.json();
    const list = data.campaigns || [];
    for (const c of list) {
      if (String(c.web_id) === String(webId)) return c.id;
    }
    if (list.length < PAGE) return null;
    offset += PAGE;
  }
  return null;
}

function jsonStr(s) {
  return JSON.stringify(s || '');
}

function bytesToBase64(bytes) {
  // Use Node's Buffer (available in Workers via nodejs_compat flag).
  return Buffer.from(bytes).toString('base64');
}

function slugify(s) {
  return (s || 'newsletter')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60) || 'newsletter';
}

function stripMailchimpChrome(html) {
  let s = html;
  s = s.replace(/<head[\s\S]*?<\/head>/i, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Strip all HTML comments (catches MSO conditionals + leftover -->)
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/-->/g, '');

  // Truncate at the LAST occurrence of footer markers (footer is at bottom)
  const lower = s.toLowerCase();
  const footerMarkers = [
    'you are receiving this',
    'unsubscribe from this list',
    'no longer want to receive',
    'update your preferences',
    'permission reminder'
  ];
  let footerStart = -1;
  for (const m of footerMarkers) {
    const i = lower.lastIndexOf(m);
    if (i > 0 && (footerStart === -1 || i < footerStart)) footerStart = i;
  }
  if (footerStart > 0) {
    // Walk back to start of containing table or div
    let cut = s.lastIndexOf('<table', footerStart);
    if (cut < 0) cut = s.lastIndexOf('<div', footerStart);
    if (cut > 0) s = s.substring(0, cut);
    else s = s.substring(0, footerStart);
  }
  return s;
}

function htmlToMarkdown(html) {
  let md = html;
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  md = md.replace(
    /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi,
    '![$2]($1)'
  );
  md = md.replace(
    /<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi,
    '![$1]($2)'
  );
  md = md.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, '![]($1)');
  md = md.replace(
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    '[$2]($1)'
  );
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');
  md = md.replace(/<[^>]+>/g, '');
  md = decodeEntities(md);
  md = md.replace(/[ \t]+/g, ' ');
  md = md.replace(/\n[ \t]+/g, '\n');
  md = md.replace(/[ \t]+\n/g, '\n');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
}

async function commitFile(path, content, message, env, force) {
  const url = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'sscy-mailchimp-sync',
    Accept: 'application/vnd.github.v3+json'
  };

  // Check if file already exists
  let existingSha = null;
  const checkRes = await fetch(url, { headers });
  if (checkRes.status === 200) {
    const existing = await checkRes.json();
    existingSha = existing.sha;
    if (!force) {
      return { skipped: 'exists', path };
    }
  }

  const utf8 = new TextEncoder().encode(content);
  const base64 = bytesToBase64(utf8);
  const body = { message, content: base64, branch: 'main' };
  if (existingSha) body.sha = existingSha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub PUT ${putRes.status}: ${err.substring(0, 200)}`);
  }
  return { committed: path };
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(obj, status, request) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request)
    }
  });
}
