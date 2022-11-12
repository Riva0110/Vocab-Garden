const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const firestore = admin.firestore();

exports.onUserStatusChanged = functions.database
  .ref("/status/{uid}")
  .onUpdate(async (change, context) => {
    const eventStatus = change.after.val();

    const userStatusFirestoreRef = firestore.doc(`users/${context.params.uid}`);
    console.log(userStatusFirestoreRef);

    const statusSnapshot = await change.after.ref.once("value");
    const status = statusSnapshot.val();
    functions.logger.log(status, eventStatus);
    if (status.state_last_changed > eventStatus.state_last_changed) {
      return null;
    }

    eventStatus.state_last_changed = new Date(eventStatus.state_last_changed);

    return userStatusFirestoreRef.set(eventStatus, { merge: true });
  });