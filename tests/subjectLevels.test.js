import test from 'node:test';
import assert from 'node:assert/strict';
import {fixedLevels} from '../src/pages/ReviewsPage/subjectLevels.js';
test('new subject has exactly Basic Advanced Intensive',()=>{let n=0;const s=fixedLevels([],()=>`new${++n}`);assert.deepEqual(s.map(x=>x.name),['Basic','Advanced','Intensive']);assert.equal(new Set(s.map(x=>x.id)).size,3);});
test('existing IDs and aliases survive level ordering',()=>{const s=fixedLevels([{id:'i',code:'JSI',name:'',aliases:['OLDI']},{id:'b',code:'JSB',name:''},{id:'a',code:'JSA',name:''}],()=>{throw Error('unexpected');});assert.deepEqual(s.map(x=>x.id),['b','a','i']);assert.deepEqual(s[2].aliases,['OLDI']);});
test('single-level legacy ARM retains template identity and fills missing levels',()=>{let n=0;const s=fixedLevels([{id:'ARM',code:'ARMB',name:''}],()=>`new${++n}`);assert.equal(s[0].id,'ARM');assert.deepEqual(s.map(x=>x.code),['ARMB','ARMA','ARMI']);});
