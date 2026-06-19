export const requireUid = (uid) => {
  if (!uid || typeof uid !== 'string') {
    throw new Error('A valid Firebase uid is required.');
  }

  return uid;
};
