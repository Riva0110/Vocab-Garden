import { database, logger } from "firebase-functions";
import { initializeApp, firestore as _firestore } from "firebase-admin";
initializeApp();

const firestore = _firestore();

export const onUserStatusChanged = database
  .ref("/status/{uid}")
  .onUpdate(async (change, context) => {
    const eventStatus = change.after.val();

    const userStatusFirestoreRef = firestore.doc(`users/${context.params.uid}`);

    const statusSnapshot = await change.after.ref.once("value");
    const status = statusSnapshot.val();
    logger.log(status, eventStatus);
    if (status.state_last_changed > eventStatus.state_last_changed) {
      return null;
    }

    eventStatus.state_last_changed = new Date(eventStatus.state_last_changed);

    return userStatusFirestoreRef.set(eventStatus, { merge: true });
  });
