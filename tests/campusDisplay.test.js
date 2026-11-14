import test from 'node:test';
import assert from 'node:assert/strict';
import {configureCampusCodes,getCampusCode,getCourseTitle} from '../src/utils/courseDisplay.js';
test('custom campus code applies to titles, avoids duplicate prefix, resets between accounts',()=>{
 configureCampusCodes({'ocean park':'OP','co so moi':'NEW'});
 assert.equal(getCampusCode('Ocean Park'),'OP');
 assert.equal(getCourseTitle({campus:'Ocean Park',code:'JSB14'}),'OP-JSB14');
 assert.equal(getCourseTitle({campus:'Ocean Park',code:'OP-JSB14'}),'OP-JSB14');
 configureCampusCodes();
 assert.equal(getCampusCode('Ocean Park'),'OCP');
});
