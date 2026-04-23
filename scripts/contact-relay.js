/**
 * Google Apps Script: SSCY Contact Form relay
 *
 * Receives POST from the sscy-contact Cloudflare Worker and sends the
 * email from info@saltspringcentre.com via GmailApp. Run as the SSCY
 * Google Workspace user that owns info@saltspringcentre.com so replies
 * land in the right inbox.
 *
 * Deploy:
 *   script.google.com -> New project (or add to existing SSCY Apps Script project)
 *   Paste this file
 *   Deploy -> New deployment -> Type: Web app
 *     Execute as: Me (info@saltspringcentre.com)
 *     Who has access: Anyone
 *   Copy the /exec URL and set it as CONTACT_RELAY_URL on the
 *   sscy-contact Cloudflare Worker.
 *
 * Update:
 *   Deploy -> Manage deployments -> edit existing -> New version -> Deploy
 *   (the same /exec URL keeps working; don't create a new deployment).
 */

var TO_ADDRESS = 'info@saltspringcentre.com';
var FROM_NAME = 'SSCY Website Contact Form';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var name = String(body.name || '').trim();
    var email = String(body.email || '').trim();
    var subject = String(body.subject || 'Website contact').trim();
    var message = String(body.message || '').trim();
    var ip = String(body.ip || '').trim();
    var userAgent = String(body.userAgent || '').trim();
    var submittedAt = String(body.submittedAt || '').trim();

    if (!name || !email || !message) {
      return json({ error: 'Missing fields' }, 400);
    }

    var body_text =
      'From: ' + name + ' <' + email + '>\n' +
      'Subject: ' + subject + '\n' +
      'Submitted: ' + submittedAt + '\n' +
      'IP: ' + ip + '\n' +
      'User Agent: ' + userAgent + '\n\n' +
      '----------\n\n' +
      message + '\n';

    GmailApp.sendEmail(TO_ADDRESS, '[Website] ' + subject, body_text, {
      name: FROM_NAME,
      replyTo: email
    });

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: err && err.message ? err.message : 'Unknown error' }, 500);
  }
}

function doGet(e) {
  // Mailchimp-style URL verification ping, or casual browser visit.
  return json({ ok: true, ready: true }, 200);
}

function json(obj, status) {
  // Apps Script doesn't expose HTTP status codes directly; the worker
  // interprets the JSON body. Status is included for debuggability.
  var out = Object.assign({}, obj, { _status: status || 200 });
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}
