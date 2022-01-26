const functions = require("firebase-functions");

// sendgrid sdk
const sgMail = require("@sendgrid/mail");

// initalize database sdk with firebase admin
const admin = require("firebase-admin");
admin.initalizeApp(functions.config().firebase);
var database = admin.database();

// function to on 2 min cron tab to send msg using sendgrid api
exports.scheduledEmail = functions.pubsub
  .schedule("every 2 minutes")
  .onRun(context => {
    // take a snapshot of email list to see who still wishes to revcieve notifications
    var ref = database.ref("email_list");
    ref.once("value").then(function(snapshot) {
      var sendEmail = snapshot.child("info@saferschoolsolutions.com").val();
      // check if user info@saferschoolsolutions.com still wishes to revcieve msgs
      if (sendEmail) {
        // message to be passed to sendgrid wrapper
        const msg = {
          to: "info@saferschoolsolutions.com",
          from: "gdamota@sandiego.edu",
          subject: "BACKEND DEVELOPER PERFORMANCE TASK",
          text:
            "this is a test email. If you no longer wish to revcieve these emails please reply with 'STOP' in the subject line",
          html:
            "<strong>If you no longer wish to revcieve these emails please reply with 'STOP' in the subject line</strong>"
        };
        sgMail.setApiKey(
          "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"
        );

        // use sendgrid client to send email
        sgMail
          .send(msg)
          .then(() => {
            console.log("Email sent");
          })
          .catch(error => {
            console.error(error);
          });
      }
    });
    // return nothing from cronjob
    return null;
  });

// http callable function to unsubscribe users from mailing list based on snedgrid webhook call
exports.unsubscribeEmail = functions.https.onRequest((req, res) => {
  // log body of post request made by sendgrid webhook
  console.log(req.query.text);
  // in a more fleshed out version rather than the email addr being hardcoded it would be the query text posted from sendgrids webhook
  database.ref("email_list/info@saferschoolsolutions.com").set(false);
  return "Successfully unsubscribed";
});
