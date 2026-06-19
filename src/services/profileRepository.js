import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

import { SAFE_APP_ID } from '../constants/app';
import { PROFILE_SCHEMA_VERSION } from '../constants/skatingx';
import { createMetadata, updateMetadata, withProfileMetadataDefaults } from '../utils/firestoreMetadata';
import { requireUid } from '../utils/validation';

export const getProfileDocRef = (db, uid) => (
  doc(db, 'artifacts', SAFE_APP_ID, 'users', requireUid(uid), 'profile', 'main')
);

export const subscribeToProfile = (db, uid, onData, onError) => {
  const userRef = getProfileDocRef(db, uid);

  return onSnapshot(userRef, (docSnap) => {
    onData(docSnap.exists() ? withProfileMetadataDefaults(docSnap.data(), uid, PROFILE_SCHEMA_VERSION) : null);
  }, onError);
};

export const saveProfilePatch = async (db, uid, patch) => {
  const userRef = getProfileDocRef(db, uid);
  const safeUid = requireUid(uid);
  const existingProfile = patch?.createdAt ? null : await getDoc(userRef);
  const hasExistingCreatedAt = patch?.createdAt || existingProfile?.data()?.createdAt;
  const profilePatch = {
    ...patch,
    ...(hasExistingCreatedAt
      ? updateMetadata(safeUid, PROFILE_SCHEMA_VERSION)
      : createMetadata(safeUid, PROFILE_SCHEMA_VERSION)),
  };

  return setDoc(userRef, profilePatch, { merge: true });
};
