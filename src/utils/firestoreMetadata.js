import { SOURCE_APP } from '../constants/skatingx';

const createTimestamp = () => new Date().toISOString();

export const createMetadata = (uid, schemaVersion) => {
  const timestamp = createTimestamp();

  return {
    ownerUid: uid,
    sourceApp: SOURCE_APP,
    schemaVersion,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const updateMetadata = (uid, schemaVersion) => ({
  ownerUid: uid,
  sourceApp: SOURCE_APP,
  schemaVersion,
  updatedAt: createTimestamp(),
});

export const withProfileMetadataDefaults = (profile, uid, schemaVersion) => {
  const metadata = createMetadata(uid, schemaVersion);

  return {
    ...profile,
    ownerUid: profile?.ownerUid || metadata.ownerUid,
    sourceApp: profile?.sourceApp || metadata.sourceApp,
    schemaVersion: profile?.schemaVersion || metadata.schemaVersion,
    createdAt: profile?.createdAt || metadata.createdAt,
    updatedAt: profile?.updatedAt || metadata.updatedAt,
  };
};
