import test from 'node:test';
import assert from 'node:assert/strict';
import {expiredReviewPatch,REVIEW_RETENTION_MS as days} from '../src/pages/ReviewsPage/reviewRetention.js';
import {buildCompletedReviews} from '../src/pages/ReviewsPage/pendingReviewsModel.js';
test('only completed personal content expires, exactly after seven days',()=>{
 const c={sessionReviews:{1:{completed:true,completedAt:100,content:'a',comments:'b',homework:'c'},2:{completed:false,completedAt:100,comments:'keep'}},finalReviewCompleted:true,finalReviewCompletedAt:100,finalReview:{learning:'x'}};
 assert.deepEqual(expiredReviewPatch(c,days+99),{});
 const patch=expiredReviewPatch(c,days+100);
 assert.equal(patch['sessionReviews.1'].completed,true);
 assert.equal(patch['sessionReviews.1'].content,undefined);
 assert.equal(patch['sessionReviews.2'],undefined);
 assert.equal(patch.finalReview,null);
 assert.deepEqual(expiredReviewPatch({sessionReviews:{1:patch['sessionReviews.1']}},days+200),{});
});
test('undo cancels retention and unknown legacy dates do not delete content',()=>{
 assert.deepEqual(expiredReviewPatch({sessionReviews:{1:{completed:false,completedAt:1,content:'keep'},2:{completed:true,content:'keep'}},finalReviewCompleted:false,finalReviewCompletedAt:1,finalReview:{learning:'keep'}},days*2),{});
});
test('completed lessons remain findable even after a course ends or content expires',()=>{
 const course={id:'a',totalSessions:14,sessionReviews:{7:{completed:true,completedAt:1,purgedAt:2}}};
 const sessions=[{courseId:'a',sessionNo:7,date:'2026-01-10',startTime:'10:00',endTime:'12:00'},{courseId:'a',sessionNo:14,date:'2026-03-10',startTime:'10:00',endTime:'12:00'}];
 assert.equal(buildCompletedReviews([course],sessions,Date.now())[0].session.sessionNo,7);
});
