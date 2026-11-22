export const LEVELS = [['B','Basic'],['A','Advanced'],['I','Intensive']];
export function fixedLevels(subjects, makeId) {
 const used = new Set();
 const first = subjects[0]?.code || '';
 const prefix = /[BAI]$/.test(first) ? first.slice(0,-1) : first;
 return LEVELS.map(([suffix,name],index)=>{
  const previous=subjects.find(s=>!used.has(s.id) && s.code.endsWith(suffix)) || (index===0 ? subjects.find(s=>!used.has(s.id) && !/[BAI]$/.test(s.code)) : null);
  if(previous){used.add(previous.id);return {...previous,name};}
  return {id:makeId(),code:prefix ? prefix+suffix : '',name};
 });
}
