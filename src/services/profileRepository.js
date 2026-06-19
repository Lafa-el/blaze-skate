import { doc, onSnapshot, setDoc } from 'firebase/firestore';

import { SAFE_APP_ID } from '../constants/app';

export const getProfileDocRef = (db, uid) => (
  doc(db, 'artifacts', SAFE_APP_ID, 'users', uid, 'profile', 'main')
);

export const subscribeToProfile = (db, uid, onData, onError) => {
  const userRef = getProfileDocRef(db, uid);

  return onSnapshot(userRef, (docSnap) => {
    onData(docSnap.exists() ? docSnap.data() : null);
  }, onError);
};

export const saveProfilePatch = (db, uid, patch) => {
  const userRef = getProfileDocRef(db, uid);

  return setDoc(userRef, patch, { merge: true });
};
