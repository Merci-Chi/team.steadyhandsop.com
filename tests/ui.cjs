const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const manager={id:'manager',name:'Workspace Manager',email:'manager@example.com',active:true,role:'manager'},member={id:'member',name:'Team Member',email:'member@example.com',active:true,role:'member'};
const now=new Date().toISOString(),records={users:[manager,member],files:[{id:'f',parent:'t',name:'brief.txt'}],task:[{id:'t',title:'Task <safe>',description:'Discussion',assignee:'member',creator:'manager',status:'To do',due:'2020-01-01',priority:'High',created:now}],followup:[{id:'c',title:'Client A',phone:'+15555550123',assignee:'member',due:'2026-10-17',reason:'Proposal',status:'Awaiting call',creator:'member',created:now}],announcement:[{id:'a',title:'Update',description:'Team announcement',creator:'manager',created:now,acks:['member']}],channel:[{id:'general',title:'General'}],message:[{id:'m',channel:'general',text:'Hello team',creator:'member',created:now}],event:[{id:'e',title:'Team huddle',date:'2026-10-17',time:'10:00',description:'Team plans',creator:'manager',created:now}],comment:[{id:'comment',parent:'t',text:'A useful note',creator:'member',created:now}],notification:[{id:'n',title:'Task assignment',uid:'manager',target:'tasks/task/t',read:false,created:now}]};
const output={};
for(const role of ['manager','member'])for(const file of fs.readdirSync(__dirname+'/..').filter(x=>x.endsWith('.html'))){
 const pg=/data-page="([^"]+)"/.exec(fs.readFileSync(__dirname+'/../'+file,'utf8'))[1],body={dataset:{page:pg},className:'',innerHTML:''},modal={innerHTML:'',open:false,showModal(){this.open=true},close(){this.open=false}},toast={textContent:'',style:{}};
 const elements={'#modal':modal,'#toast':toast};const doc={body,activeElement:null,hidden:false,querySelector:s=>elements[s]||null,addEventListener:()=>{}};
 const ctx={document:doc,window:{lucide:{createIcons:()=>{}},addEventListener:()=>{}},location:{hash:''},localStorage:{getItem:()=>null,setItem:()=>{}},TeamData:{BrowserTeamService:class{request(){return new Promise(()=>{})}}},setInterval:()=>{},setTimeout:()=>{},clearTimeout:()=>{},Date,Math,JSON,String,console};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../js.js','utf8'),ctx);ctx.seed=records;ctx.person=role==='manager'?manager:member;
 vm.runInContext('me=person;state=structuredClone(seed);route()',Object.assign(ctx,{structuredClone}));
 assert.ok(body.innerHTML.includes('images/team-logo.png'));assert.ok(body.innerHTML.includes('class="app"'));assert.ok(!body.innerHTML.includes('undefined'));assert.ok(!body.innerHTML.includes('class="topbar"'));
 const order=['Tasks','Announcements','Chat','Calendar','Resources','Training','Demo','Timesheet','Team Directory'];let last=-1;const side=body.innerHTML.split('<nav class="admin-desktop-links"')[1].split('</nav>')[0];for(const label of order){const next=side.indexOf('>'+label,last+1);assert.ok(next>last,label);last=next;}
 if(pg==='tasks'){assert.ok(body.innerHTML.includes('Client follow-up calls'));assert.ok(body.innerHTML.includes('Task &lt;safe&gt;'));assert.ok(body.innerHTML.includes('Overdue'));vm.runInContext("openDetail('task','t')",ctx);assert.ok(modal.innerHTML.includes('Discussion'));assert.ok(modal.innerHTML.includes('brief.txt'));assert.ok(modal.innerHTML.includes('A useful note'));}
 if(pg==='announcements'){assert.equal(body.innerHTML.includes('New announcement'),role==='manager');assert.equal(body.innerHTML.includes('acknowledged · View team'),role==='manager');}
 if(pg==='chat'){assert.ok(body.innerHTML.includes('Hello team'));assert.ok(body.innerHTML.includes('type="file"'));}
 if(pg==='calendar'){assert.ok(body.innerHTML.includes('day-name'));assert.ok(body.innerHTML.includes('Previous month'));}
 if(['timesheet','directory','resources'].includes(pg)){assert.ok(body.innerHTML.includes('Under construction'));assert.ok(!body.innerHTML.includes('data-action="clock'));}
 vm.runInContext('profile()',ctx);assert.equal(modal.innerHTML.includes('Team access'),role==='manager');
 vm.runInContext('notifications()',ctx);assert.ok(modal.innerHTML.includes('Mark all as read'));assert.ok(modal.innerHTML.includes('tasks/task/t'));
 if(role==='manager')output[file]=body.innerHTML;
}
fs.writeFileSync(__dirname+'/../../team-complete-render.json',JSON.stringify(output));
console.log('PASS: all 7 pages for both roles, sidebar order, logo, task detail/discussion/files, permission-aware announcement/profile controls, chat files, calendar grid, notification links, placeholders, HTML escaping.');
