import {initializeApp} from 'firebase-admin/app';
import {getFirestore,FieldPath} from 'firebase-admin/firestore';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {defineString} from 'firebase-functions/params';
import {expiredReviewPatch} from './reviewRetention.js';
initializeApp();
const owner=defineString('MINDX_OWNER_UID',{description:'UID chủ sở hữu MindX (giống VITE_FIREBASE_OWNER_UID)'});
export const cleanupMindxReviews=onSchedule({schedule:'every 60 minutes',timeZone:'Asia/Ho_Chi_Minh',region:'asia-southeast1',maxInstances:1},async()=>{
 const uid=owner.value();
 if(!uid || uid.includes('/'))throw new Error('Invalid owner UID');
 const db=getFirestore();
 let cursor;
 while(true){
  let query=db.collection('users').doc(uid).collection('courses').orderBy(FieldPath.documentId()).limit(100);
  if(cursor)query=query.startAfter(cursor);
  const page=await query.get();
  if(page.empty)break;
  for(const doc of page.docs){
   if(!Object.keys(expiredReviewPatch(doc.data())).length)continue;
   await db.runTransaction(async tx=>{
    const fresh=await tx.get(doc.ref);if(!fresh.exists)return;
    const patch=expiredReviewPatch(fresh.data());
    if(Object.keys(patch).length)tx.update(doc.ref,patch);
   });
  }
  cursor=page.docs.at(-1);
 }
});
