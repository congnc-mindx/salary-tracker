import test from 'node:test';
import assert from 'node:assert/strict';
import { vietnamClock, buildAgenda } from '../src/components/dashboard/agendaModel.js';
const time = x => Date.parse(x);
test('Vietnam day switches exactly at 19:00, including year rollover', () => {
  assert.equal(vietnamClock(time('2026-12-31T11:59:59Z')).target,'2026-12-31');
  assert.equal(vietnamClock(time('2026-12-31T12:00:00Z')).target,'2027-01-01');
  assert.equal(vietnamClock(time('2027-01-01T17:00:00Z')).target,'2027-01-02');
});
test('agenda excludes leave, cancelled and covered, sorts time and keeps next date', () => {
  const events = ['planned','leave','covered','cancelled'].map((status,i) => ({id:i,kind:'class',date:'2026-11-14',time:'14:00',status}));
  events.push({id:5,kind:'class',date:'2026-11-14',time:'08:00',status:'confirmed'}, {id:6,kind:'class',date:'2026-11-16',time:'08:00',status:'planned'});
  const model = buildAgenda(events,time('2026-11-14T03:00:00Z'));
  assert.deepEqual(model.day.map(e=>e.id),[5,0]);
  assert.deepEqual(model.next.map(e=>e.id),[6]);
});
test('milestones use adjusted event dates and bounded horizon; weeks cross year', () => {
  const events = ['2026-12-31','2027-01-01','2027-01-13','2027-01-14'].map((date,i)=>({id:i,kind:'class',date,time:'10:00',sessionNo:5,status:'planned'}));
  events.push({id:'extra',isExtra:true,kind:'makeup',date:'2027-01-03',time:'08:00',status:'planned'});
  const model = buildAgenda(events,time('2026-12-31T05:00:00Z'));
  assert.deepEqual(model.milestones.map(e=>e.id),[1,2]);
  assert.equal(model.weeks[0].start,'2026-12-28');
  assert.equal(model.weeks[0].end,'2027-01-03');
  assert.equal(model.weeks[0].items.length,1);
  assert.equal(model.weeks[1].start,'2027-01-04');
});
