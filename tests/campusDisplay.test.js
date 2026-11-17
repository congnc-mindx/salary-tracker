import test from 'node:test';
import assert from 'node:assert/strict';
import {configureCampusCodes,getCampusCode,getCourseTitle,getCampusPayrollCodes,getPayrollCampusAliases} from '../src/utils/courseDisplay.js';
test('custom campus code applies to titles, avoids duplicate prefix, resets between accounts',()=>{
 configureCampusCodes({'ocean park':'OP','co so moi':'NEW'});
 assert.equal(getCampusCode('Ocean Park'),'OP');
 assert.equal(getCourseTitle({campus:'Ocean Park',code:'JSB14'}),'OP-JSB14');
 assert.equal(getCourseTitle({campus:'Ocean Park',code:'OP-JSB14'}),'OP-JSB14');
 configureCampusCodes();
 assert.equal(getCampusCode('Ocean Park'),'OCP');
});

test('payroll campus defaults and saved codes resolve consistently and reset',()=>{
 configureCampusCodes({'long bien':'LB'});
 assert.equal(getCampusCode('Long Biên'),'VHRS');
 assert.equal(getCourseTitle({campus:'Long Biên',code:'LB-C4K-JSB14-HB'}),'VHRS-JSB14-HB');
 assert.equal(getCourseTitle({campus:'Long Biên',code:'VHRS-ROB-PREI02'}),'VHRS-PREI02');
 assert.deepEqual(getPayrollCampusAliases(['Minh Khai','Long Biên','Nguyễn Văn Cừ','Oceanpark']),{'505MK':'MK','HN-VHRS':'VHRS','98NVC':'NVC','OCEANPARK1':'OCP'});
 configureCampusCodes({'minh khai':'MK2'},{'minh khai':['505MK','NEW-MK']});
 assert.equal(getPayrollCampusAliases(['Minh Khai'])['NEW-MK'],'MK2');
 configureCampusCodes({}, {'minh khai':[]});
 assert.deepEqual(getCampusPayrollCodes('Minh Khai'),[]);
 configureCampusCodes();
 assert.deepEqual(getCampusPayrollCodes('Minh Khai'),['505MK']);
});
