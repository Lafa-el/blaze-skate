import { enableIndexedDbPersistence } from 'firebase/firestore';

import { db } from './firebaseApp';

export const initializeFirestorePersistence = () => {
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('离线缓存开启警告：可能开了多个相同网页标签。');
      } else if (err.code === 'unimplemented') {
        console.warn('离线缓存开启失败：当前浏览器内核不支持。');
      }
    });
  } catch (error) {
    console.error('离线缓存初始化异常', error);
  }
};
