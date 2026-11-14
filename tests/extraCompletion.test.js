import test from 'node:test';
import assert from 'node:assert/strict';
import {completeElapsedExtra} from '../src/utils/extraCompletion.js';
const item={id:'a',datetime:'2026-10-31T23:00:00+07:00',status:'planned'};
test('past extras finish at end time, including crossing midnight',()=>{
 assert.equal(completeElapsedExtra(item,2,Date.parse('2026-11-01T00:59:59+07:00')).status,'planned');
 assert.equal(completeElapsedExtra(item,2,Date.parse('2026-11-01T01:00:00+07:00')).status,'confirmed');
 assert.equal(item.status,'planned');
});
test('cancelled, leave and covered extras remain excluded; manual confirmation retained',()=>{
 for(const status of ['cancelled','leave','covered','confirmed']){
  const x={...item,status}; assert.equal(completeElapsedExtra(x,2,Date.parse('2026-11-14')),x);
 }
});
test('future reschedule becomes planned; invalid times do not auto complete',()=>{
 const now=Date.parse('2026-11-14');
 assert.equal(completeElapsedExtra({...item,datetime:'2099-01-01T10:00'},1,now).status,'planned');
 assert.equal(completeElapsedExtra({...item,datetime:'invalid'},1,now).status,'planned');
});
