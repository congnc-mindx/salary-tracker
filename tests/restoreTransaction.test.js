import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {importPlan,stableJSON,createBackup,COLLECTIONS} from '../src/services/dataTransfer/backupModel.js';
const code=(await readFile(new URL('../src/services/dataTransfer/backupService.js',import.meta.url),'utf8')).replace(/^import[\s\S]*?;\n/gm,'');
let context;
const prelude='const {getIncomeContext,importPlan,stableJSON,doc,runTransaction,validateCatalog}=globalThis.__restoreDependencies;\n';
globalThis.__restoreDependencies={getIncomeContext:()=>({db:{}}),importPlan,stableJSON,doc:(_, ...path)=>path.join('/'),validateCatalog:()=>{},runTransaction:async(_,callback)=>{const staged=[];await callback({get:async ref=>{context.reads.push(ref);const data=context.existing.get(ref);return{exists:()=>data!==undefined,data:()=>data}},set:(ref,data)=>{assert.equal(context.reads.length,context.expectedReads);staged.push([ref,data]);}});if(context.fail)throw new Error('network error');context.commits.push(...staged);}};
const {restoreBackup}=await import('data:text/javascript;base64,'+Buffer.from(prelude+code).toString('base64'));
delete globalThis.__restoreDependencies;
const backup=()=>createBackup(Object.fromEntries(COLLECTIONS.map(n=>[n,[]])),'owner');
const entry={id:'e',data:{type:'makeup',datetime:'2026-11-09T19:00',status:'confirmed',hours:1,studentCount:1}};
function fixture(){const incoming=backup(),current=backup();incoming.collections.extras=[entry];context={existing:new Map(),reads:[],expectedReads:1,commits:[]};return{incoming,current};}
test('restore reads all targets first and commits expected owner paths',async()=>{const {incoming,current}=fixture();const plan=await restoreBackup('owner',incoming,current,'missing');assert.equal(plan.added,1);assert.deepEqual(context.commits,[['users/owner/extras/e',entry.data]]);});
test('a concurrent new record aborts missing-only restore without overwriting',async()=>{const {incoming,current}=fixture();context.existing.set('users/owner/extras/e',{...entry.data,note:'new edit'});await assert.rejects(restoreBackup('owner',incoming,current,'missing'),/đã thay đổi/);assert.equal(context.commits.length,0);});
test('a changed existing record aborts update mode',async()=>{const {incoming,current}=fixture();current.collections.extras=[entry];context.existing.set('users/owner/extras/e',{...entry.data,note:'modified'});await assert.rejects(restoreBackup('owner',incoming,current,'update'),/đã thay đổi/);assert.equal(context.commits.length,0);});
test('transaction failure is propagated and never reported as a successful commit',async()=>{const {incoming,current}=fixture();context.fail=true;await assert.rejects(restoreBackup('owner',incoming,current,'missing'),/network error/);assert.equal(context.commits.length,0);});
