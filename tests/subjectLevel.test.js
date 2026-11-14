import test from 'node:test';
import assert from 'node:assert/strict';
import {subjectLevel,subjectLabel,DEFAULT_CATALOG} from '../src/pages/ReviewsPage/subjectCatalog.js';
test('B/A/I codes resolve consistently without changing subject IDs',()=>{
 for(const group of DEFAULT_CATALOG) for(const s of group.subjects){
  if(s.code==='ARM')continue;
  assert.equal(subjectLevel(s.code),({B:'Basic',A:'Advanced',I:'Intensive'})[s.code.at(-1)]);
 }
 assert.equal(subjectLabel('SB'),'SB · Basic');
 assert.equal(subjectLabel('SA'),'SA · Advanced');
 assert.equal(subjectLabel('SI'),'SI · Intensive');
 assert.equal(subjectLevel(' jsb '),'Basic');
 assert.equal(subjectLabel('ARM'),'ARM');
 assert.equal(subjectLabel('UNKNOWN'),'UNKNOWN');
});
