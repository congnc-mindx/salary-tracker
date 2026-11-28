export const REVIEW_RETENTION_MS = 7 * 86400000;
export function expiredReviewPatch(course, now = Date.now()) {
 const patch={};
 for(const [no,review] of Object.entries(course.sessionReviews||{})) {
  const end=Number(review.completedAt);
  if(review.completed && end>0 && now>=end+REVIEW_RETENTION_MS && ['content','comments','homework'].some(k=>Object.hasOwn(review,k))) {
   patch[`sessionReviews.${no}`]={completed:true,completedAt:end,date:review.date||'',subject:review.subject||'',purgedAt:now};
  }
 }
 if(course.finalReviewCompleted && Number(course.finalReviewCompletedAt)>0 && now>=Number(course.finalReviewCompletedAt)+REVIEW_RETENTION_MS && course.finalReview) patch.finalReview=null;
 return patch;
}
