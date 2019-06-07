import * as functions from 'firebase-functions';


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
   console.log(`helloWorld cloud function -> response: ${response}`);
   return;
});

exports.sendNotifications = functions.firestore.document('records/{recordId}')
    .onWrite(async (snap, context) => {

      const newValue = snap;
      console.log(`MD: sendNotifications cloud function -> newValue`, newValue);

      // perform desired operations ...
      // You may not need the recordId value but you have to keep the wildcard in the document path
    });

exports.myFunction = functions.https.onCall((data, context) => {
	console.log(`MD: cloud function myFunction -> data`, data);
});
