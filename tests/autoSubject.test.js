import test from 'node:test';
import assert from 'node:assert/strict';
import {inferCourseSubject} from '../src/pages/ReviewsPage/reviewsModel.js';
import {candidateSessions} from '../src/pages/SalaryPage/reconciliation/detailModel.js';
test('class codes infer templates without manual selection',()=>{for(const [code,id] of [['GI','GI'],['GI02','GI'],['NVC-JSB14','JSB'],['MK-C4K-PTB44','PTB'],[' ocp-prei02 ','PREI']])assert.equal(inferCourseSubject(code),id);assert.equal(inferCourseSubject('UNKNOWN99'),'');});
test('renamed catalog codes retain stable template IDs via aliases',()=>{const catalog=[{id:'arm',category:'robotics',subjects:[{id:'stable',code:'ARMB',aliases:['ARM'],name:''}]}];assert.equal(inferCourseSubject('OCP-ARMB05',catalog),'stable');assert.equal(inferCourseSubject('ARM05',catalog),'stable');});
test('matching candidates stay inside source campus for each work type',()=>{const sessions=[{id:'a',campus:'MK',type:'makeup'},{id:'b',campus:'NVC',type:'makeup'},{id:'c',campus:'MK',type:'substitute'}];assert.deepEqual(candidateSessions(sessions,{campus:'MK'},'makeup').map(e=>e.id),['a']);assert.deepEqual(candidateSessions(sessions,{campus:'MK'},'substitute').map(e=>e.id),['c']);});
