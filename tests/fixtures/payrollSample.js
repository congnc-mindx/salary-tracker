// Based on the supplied October rows; teacher identity is synthetic.
export const HEAD='STT\tCentre shortname\tType\tClass name\tTeacher name\tTeacher email\tUsername\tClass role/Office hour type\tStatus\tSlot time\tSlot duration\tStudent count\tNote\tPrice/h\tTotal';
export function sourceLine({id=1,centre='505MK',code='MK-JSB45',day=1,time='19:00',role='LEC',hours=2,students=8,price=160000,total=hours*price,email='teacher@example.test',note='',status='CHECKED'}){
 const date=new Date(Date.UTC(2026,9,day));const weekday=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getUTCDay()];return [id,centre,role==='Makeup'?'OFFICE_HOURS':'CLASS',code,'Giáo viên mẫu',email,'teacher',role,status,`${weekday} Oct ${String(day).padStart(2,'0')} 2026 ${time}:00 GMT+0700 (Indochina Time)`,hours,students,note,price.toLocaleString('en-US'),total.toLocaleString('en-US')].join('\t');
}
const records=[];
function add(ids,days,centre,code,time,role='LEC'){ids.forEach((id,i)=>records.push({id,day:days[i],centre,code,time,role}));}
add([10504,10609,10704,10793,10886],[1,8,15,22,29],'505MK','MK-JSB45','19:00');
add([10556],[4],'505MK','MK-C4K-GB81','08:00','Supply');
add([10590,10686,10784,10872],[5,12,19,26],'505MK','MK-C4K-PTB44','19:00');
records.push({id:10948,day:9,centre:'505MK',code:'MK-JSB45',time:'17:00',role:'Makeup',hours:1,price:120000,students:2},{id:10993,day:5,centre:'505MK',code:'MK-C4K-PTB44',time:'21:00',role:'Makeup',hours:2,price:160000,students:4});
add([13607,13655,13703,13748,13791],[3,10,17,24,31],'98NVC','NVC-JSB14','14:00');
add([13610,13657,13708,13752,13793],[3,10,17,24,31],'98NVC','NVC-C4K-GI26','16:00');
records.push({id:13806,day:27,centre:'98NVC',code:'NVC-JSB14',time:'17:00',role:'Makeup',hours:1,price:120000,students:3},{id:13814,day:16,centre:'98NVC',code:'NVC-C4K-GI26',time:'17:00',role:'Makeup',hours:1,price:120000,students:1});
add([15370,15385,15399,15408,15410],[4,11,18,25,27],'HN-VHRS','VHRS-JSI06-HB','19:00');
add([15978,16001,16025,16048,16076],[2,9,16,23,30],'Oceanpark1','OCP-C4K-GA04','19:00');
add([15979,16003],[3,10],'Oceanpark1','OCP-C4K-SI02','08:00');
add([15981,16006,16028,16053,16081],[3,10,17,24,31],'Oceanpark1','OCP-C4K-GB07','10:00');
add([15992,16014,16039,16064],[4,11,18,25],'Oceanpark1','OCP-ROB-PREI02','14:00');
add([15996,16018,16040,16066],[4,11,18,25],'Oceanpark1','OCP-C4K-GI02','16:00');
add([16036],[18],'Oceanpark1','OCP-ROB-PREA05','08:00','Supply');
export const SAMPLE=HEAD+'\n'+records.map(sourceLine).join('\n')+'\n11 Tháng Mười Một, 2026, 18:49\nNhấp vào đây để hoặc';
