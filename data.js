/* Browser-only persistence adapter. UI role checks are not a security boundary.
   Replace this service with an authenticated backend for real team deployment. */
(function(root){
'use strict';
const kinds=['task','followup','announcement','channel','message','event','comment','notification'];
const uuid=()=>crypto.randomUUID(), now=()=>new Date().toISOString();
function fresh(){const d={users:[],files:[],version:1};for(const k of kinds)d[k]=[];d.channel.push({id:'general',title:'General',creator:'system',created:now()});return d;}
function check(ok,message='Permission denied',status=403){if(!ok){const e=Error(message);e.status=status;throw e;}}
function publicUser(u){const {password,...rest}=u;return rest;}
async function hash(text,salt=crypto.randomUUID()){
 check(crypto.subtle,'This browser blocks cryptography for local files. Use a static HTTPS host to run the account demo.',400);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(text),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},key,256);
 return salt+':'+Array.from(new Uint8Array(bits),x=>x.toString(16).padStart(2,'0')).join('');
}
class IndexedStore{
 constructor(){this.opened=new Promise((resolve,reject)=>{const r=indexedDB.open('steady-hands-team-complete',1);r.onupgradeneeded=()=>r.result.createObjectStore('workspace');r.onblocked=()=>reject(Error('Browser storage is blocked by another open page. Close older copies and reload.'));r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Browser storage is unavailable. Allow site storage or use another browser.'));});}
 async change(fn){const db=await this.opened;return new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readwrite'),store=tx.objectStore('workspace'),r=store.get('state');let output;
 r.onsuccess=()=>{try{const d=r.result||fresh();output=fn(d);store.put(d,'state');}catch(e){reject(e);tx.abort();}};
 tx.oncomplete=()=>resolve(output);tx.onerror=()=>reject(tx.error||Error('Storage write failed. Browser storage may be full.'));tx.onabort=()=>reject(tx.error||Error('Storage transaction cancelled.'));});}
}
class FallbackStore{
 change(fn){const run=()=>{let d;try{d=JSON.parse(localStorage.getItem('steady-hands-complete-fallback')||'null')||fresh();}catch{throw Error('Local workspace data cannot be read.');}const result=fn(d);try{localStorage.setItem('steady-hands-complete-fallback',JSON.stringify(d));}catch{throw Error('Browser storage is full or blocked. The change was not saved. Remove the large attachment or use a static host with IndexedDB enabled.');}return result;};return typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request('steady-hands-fallback-write',run):Promise.resolve().then(run);}
}
class BrowserStore{
 constructor(){const indexed=new IndexedStore();this.selected=indexed.opened.then(()=>indexed,()=>new FallbackStore());}
 async change(fn){return (await this.selected).change(fn);}
}
class BrowserTeamService{
 constructor(store=new BrowserStore(),session=sessionStorage){this.store=store;this.session=session;}
 async request(path,p={}){
  let prepared=null,loginExpected=null;
  if(path==='setup'||(path==='users'&&p.action==='create')){
   check(typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=120,'Name is required (max 120 characters)',400);
   check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email||''),'Enter a valid email address',400);
   check(typeof p.password==='string'&&p.password.length>=12&&p.password.length<=256,'Use a password of 12–256 characters',400);
   prepared=await hash(p.password);
  }
  if(path==='login'){
   const candidate=await this.store.change(d=>d.users.find(u=>u.email===String(p.email||'').trim().toLowerCase()&&u.active));
   check(candidate,'Email or password is incorrect',401);
   loginExpected=await hash(String(p.password||''),candidate.password.split(':')[0]);
  }
  const result=await this.store.change(d=>{
   const uid=this.session.getItem('sh-team-session');const user=d.users.find(u=>u.id===uid&&u.active);
   if(path==='session')return {setup:d.users.length===0,user:user?publicUser(user):null};
   if(path==='setup'){
    check(d.users.length===0,'Workspace already configured',400);
    const u={id:uuid(),name:p.name.trim(),email:p.email.trim().toLowerCase(),password:prepared,role:'manager',active:true};d.users.push(u);return {user:publicUser(u),signIn:u.id};
   }
   if(path==='login'){
    const u=d.users.find(u=>u.email===String(p.email).trim().toLowerCase()&&u.active&&u.password===loginExpected);
    check(u,'Email or password is incorrect',401);return {user:publicUser(u),signIn:u.id};
   }
   check(user,'Please sign in to this browser workspace',401);const manager=user.role==='manager';
   const find=id=>{for(const kind of kinds){const r=d[kind].find(x=>x.id===id);if(r)return [kind,r];}throw Error('Record not found');};
   const notify=(uid,title,target)=>{if(uid)d.notification.push({id:uuid(),uid,title,target,read:false,created:now()});};
   const mentions=(text,target)=>{for(const u of d.users.filter(u=>u.active&&u.id!==user.id)){const email=u.email.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(new RegExp('@'+email+'(?![\\w.])','i').test(text))notify(u.id,'You were mentioned',target);}};
   if(path==='state'){const result={users:d.users.map(publicUser),files:d.files.map(({data,...f})=>f)};for(const k of kinds)result[k]=d[k].filter(r=>k!=='notification'||r.uid===user.id);return structuredClone(result);}
   if(path==='logout')return {signOut:true};
   if(path==='users'){
    check(manager);
    check(['manager','member'].includes(p.role),'Invalid role',400);
    if(p.action==='create'){
     check(!d.users.some(u=>u.email===p.email.trim().toLowerCase()),'Email already exists',400);
     d.users.push({id:uuid(),name:p.name.trim(),email:p.email.trim().toLowerCase(),password:prepared,role:p.role,active:true});
    }else{
     check(p.id!==user.id,'You cannot change your own access',400);const u=d.users.find(x=>x.id===p.id);check(u,'User not found',404);u.role=p.role;u.active=Boolean(p.active);
    }return {ok:true};
   }
   if(path==='read'){for(const n of d.notification)if(n.uid===user.id)n.read=true;return {ok:true};}
   if(path==='ack'){const [kind,r]=find(p.id);check(kind==='announcement','Invalid announcement',400);r.acks=[...new Set([...(r.acks||[]),user.id])];return {ok:true};}
   if(path==='save'){
    const kind=p.kind;check(kinds.includes(kind)&&kind!=='notification','Invalid record type',400);
    const fields={task:['title','description','assignee','due','status','priority'],followup:['title','phone','assignee','due','reason','status'],announcement:['title','description'],channel:['title'],message:['text','channel'],event:['title','description','date','time'],comment:['text','parent']}[kind];
    const r={};for(const key of fields){r[key]=String(p[key]||'');check(r[key].length<=20000,'Text is too long',400);}
    let old=null;
    if(p.id){const [oldKind,record]=find(p.id);check(oldKind===kind,'Invalid record',400);old=record;check(['task','followup','event','announcement'].includes(kind),'Record cannot be edited',400);check(manager||old.creator===user.id||old.assignee===user.id);}
    if(kind==='announcement')check(manager,'Only workspace managers can publish announcements');
    if(['task','followup','announcement','event','channel'].includes(kind))check(r.title.trim(),'Title is required',400);
    if(['message','comment'].includes(kind))check(r.text.trim(),'Text is required',400);
    if(kind==='message')check(find(r.channel)[0]==='channel','Channel not found',400);
    if(kind==='comment')check(['task','followup'].includes(find(r.parent)[0]),'Invalid discussion',400);
    if(['task','followup'].includes(kind)){
     const statuses=kind==='task'?['To do','In progress','Done']:['Awaiting call','No answer','Left voicemail','Rescheduled','Completed'];check(statuses.includes(r.status),'Invalid status',400);
     check(!r.assignee||d.users.some(u=>u.id===r.assignee&&u.active),'Choose an active assignee',400);
     check(!r.due||/^\d{4}-\d{2}-\d{2}$/.test(r.due),'Invalid follow-up/deadline date',400);
     if(kind==='task')check(['Low','Normal','High'].includes(r.priority),'Invalid priority',400);
     if(kind==='followup'){check(r.phone.trim()&&r.due&&r.reason.trim(),'Phone, follow-up date, and reason are required',400);}
    }
    if(kind==='event'){check(/^\d{4}-\d{2}-\d{2}$/.test(r.date),'Event date is required',400);check(!r.time||/^\d{2}:\d{2}$/.test(r.time),'Invalid time',400);}
    Object.assign(r,{id:old?.id||uuid(),creator:old?.creator||user.id,created:old?.created||now(),updated:now()});if(kind==='announcement')r.acks=[];
    if(old)d[kind]=d[kind].map(x=>x.id===old.id?r:x);else d[kind].push(r);
    if(kind==='followup'&&old&&(old.status!==r.status||old.due!==r.due))d.comment.push({id:uuid(),parent:r.id,text:`Follow-up updated: ${old.status} → ${r.status}; next date ${r.due}.`,creator:user.id,created:now(),system:true});
    if(['task','followup'].includes(kind)&&r.assignee!==user.id&&(!old||old.assignee!==r.assignee))notify(r.assignee,'Assigned to you: '+r.title,'tasks/'+kind+'/'+r.id);
    if(kind==='announcement')for(const u of d.users.filter(u=>u.active&&u.id!==user.id))notify(u.id,'Announcement: '+r.title,'announcements');
    if(['message','comment'].includes(kind))mentions(r.text,kind==='message'?'chat/'+r.channel:'tasks/'+find(r.parent)[0]+'/'+r.parent);
    return structuredClone(r);
   }
   if(path==='delete'){
    const [kind,r]=find(p.id);check(['task','followup','event','announcement'].includes(kind),'Cannot delete this item',400);check(manager||(kind!=='announcement'&&r.creator===user.id));
    const ids=[r.id,...d.comment.filter(x=>x.parent===r.id).map(x=>x.id)];d[kind]=d[kind].filter(x=>x.id!==r.id);d.comment=d.comment.filter(x=>!ids.includes(x.id));d.files=d.files.filter(x=>!ids.includes(x.parent));return {ok:true};
   }
   if(path==='upload'){
    const [kind,r]=find(p.parent);check(['task','followup','message','comment'].includes(kind),'Invalid attachment record',400);check(['task','followup'].includes(kind)||r.creator===user.id);
    check(typeof p.data==='string'&&p.data.length<=Math.ceil(10*1024*1024/3)*4,'Maximum file size is 10 MB',413);
    check(/^[A-Za-z0-9+/]*={0,2}$/.test(p.data),'Invalid file data',400);
    const name=String(p.name||'').split(/[\\/]/).pop().slice(0,180);check(name,'Filename is required',400);d.files.push({id:uuid(),parent:r.id,name,data:p.data,creator:user.id,created:now()});return {ok:true};
   }
   if(path==='download'){const f=d.files.find(x=>x.id===p.id);check(f,'File no longer available',404);return structuredClone(f);}
   throw Error('Unknown action');
  });
  if(result.signIn)this.session.setItem('sh-team-session',result.signIn);if(result.signOut)this.session.removeItem('sh-team-session');return result;
 }
}
if(typeof module!=='undefined')module.exports={BrowserTeamService,fresh};else root.TeamData={BrowserTeamService};
})(typeof window!=='undefined'?window:globalThis);
