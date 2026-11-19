import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarEventTitle} from '../src/components/calendar/calendarModel.js';
import {validatePayrollDocument} from '../src/pages/SalaryPage/reconciliation/validation.js';
test('calendar extra labels use the same short class format as lessons', () => {
  assert.equal(calendarEventTitle({isExtra:true,kind:'makeup',source:{classCode:'NVC-C4K-JSB14'}}), 'JSB14 · Dạy bù');
  assert.equal(calendarEventTitle({isExtra:true,kind:'judge',source:{classCode:'NVC-SEMI'}}), 'SEMI · Giám khảo');
  assert.equal(calendarEventTitle({kind:'class',title:'JSB45 · buổi 14'}), 'JSB45 · buổi 14');
  assert.equal(calendarEventTitle({isExtra:true,kind:'trial',source:{trialMode:'ONL'}}), 'Dạy TN · Online');
});
test('resolved payroll decisions can be saved with an empty optional note', () => {
  assert.equal(validatePayrollDocument('payrollRun_month_2026-11', {
    schemaVersion:1,complete:true,createdAt:1,month:'2026-11',teacher:'test',scope:[],rows:[],expected:[],aliases:{},links:{},decisions:{row:{status:'resolved',note:'',token:'test'}}
  }),true);
});
