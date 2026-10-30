export const DEFAULT_CATALOG = [
  ['scratch', 'Scratch', 'coding', ['SB','SA','SI']],
  ['game', 'Game', 'coding', ['GB','GA','GI']],
  ['python', 'Python', 'coding', ['PTB','PTA','PTI']],
  ['javascript', 'JavaScript', 'coding', ['JSB','JSA','JSI']],
  ['cs', 'Computer Science', 'coding', ['CSB','CSA','CSI']],
  ['pre', 'PRE', 'robotics', ['PREB','PREA','PREI']],
  ['arm', 'ARM', 'robotics', ['ARM']],
].map(([id,name,category,codes])=>({id,name,category,subjects:codes.map(code=>({id:code,code,name:''}))}));
export function getCatalog(settings = {}) { return settings.subjectCatalog || DEFAULT_CATALOG; }
export function catalogSubjects(catalog = DEFAULT_CATALOG) {
  return catalog.flatMap(group=>group.subjects.map(subject=>({...subject,category:group.category})));
}
export function subjectLabel(id, catalog = DEFAULT_CATALOG) {
  const subject=catalogSubjects(catalog).find(s=>s.id===id);
  return subject ? (subject.name ? `${subject.code} · ${subject.name}` : subject.code) : id;
}
export function catalogHasHomework(id,catalog=DEFAULT_CATALOG) {
  const subject=catalogSubjects(catalog).find(s=>s.id===id);
  return subject ? subject.category !== 'robotics' : !/^(PRE|ARM)/i.test(id || '');
}
export function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || catalog.length > 60) throw new Error('Tối đa 60 bộ môn.');
  const ids=new Set(), codes=new Set(), groups=new Set();
  for (const group of catalog) {
    if (!group.id || groups.has(group.id) || !group.name?.trim() || group.name.length>80 || !['coding','robotics'].includes(group.category)) throw new Error('Tên hoặc nhóm bộ môn không hợp lệ.');
    groups.add(group.id);
    if (!Array.isArray(group.subjects) || !group.subjects.length || group.subjects.length>30) throw new Error('Mỗi bộ môn cần từ 1 đến 30 học phần.');
    for (const s of group.subjects) {
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(s.id) || ids.has(s.id)) throw new Error('ID học phần bị trùng hoặc không hợp lệ.');
      if (!/^[A-Z][A-Z0-9]{0,15}$/.test(s.code) || codes.has(s.code)) throw new Error(`Mã học phần ${s.code || '(trống)'} bị trùng hoặc không hợp lệ.`);
      if (typeof s.name !== 'string' || s.name.length>80) throw new Error('Tên học phần tối đa 80 ký tự.');
      ids.add(s.id);codes.add(s.code);
      for (const alias of s.aliases || []) {
        if (!/^[A-Z][A-Z0-9]{0,15}$/.test(alias) || codes.has(alias)) throw new Error(`Mã ${alias} đang được dùng hoặc được giữ để liên kết lớp cũ.`);
        codes.add(alias);
      }
    }
  }
  return catalog;
}
