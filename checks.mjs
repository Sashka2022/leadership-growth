import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('./dist/app.js',import.meta.url),'utf8');
function app(seed=null,broken=false){
 const nodes=new Map(),store=new Map(seed?[['leadership-growth-v1',JSON.stringify(seed)]]:[]),downloads=[];
 const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',hidden:true,classList:{toggle(){}},focus(){},scrollIntoView(){},setAttribute(){},addEventListener(){},appendChild(){},remove(){},click(){},showModal(){this.open=true},close(){this.open=false}});return nodes.get(selector)};
 const context=vm.createContext({console,Date,JSON,String,Number,Math,Blob,URL,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},localStorage:{getItem:k=>{if(broken)throw Error('blocked');return store.get(k)},setItem:(k,v)=>{if(broken)throw Error('blocked');store.set(k,v)}},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){},body:node('body'),createElement:()=>node('anchor')},window:{scrollTo(){},print(){}}});
 vm.runInContext(source,context);vm.runInContext('download=(...args)=>testDownloads.push(args)',Object.assign(context,{testDownloads:downloads}));
 return {run:s=>vm.runInContext(s,context),nodes,store,downloads};
}
const a=app();
for(let i=0;i<=7;i++){a.run(`go(${i})`);assert.match(a.nodes.get('#main').innerHTML,/<h1>/);}
a.run("data.route='autonomy'; data.fields.event='PRIVATE-EVENT'; data.fields.interpretation='PRIVATE-REFLECTION'; data.fields.closing='PRIVATE-CLOSING'; data.fields.change='PUBLIC-CHANGE'; data.fields.commitment='<script>bad()</script>'; save();");
const printed=a.run('planHTML()');assert.ok(printed.includes('PUBLIC-CHANGE'));for(const s of ['PRIVATE-EVENT','PRIVATE-REFLECTION','PRIVATE-CLOSING'])assert.ok(!printed.includes(s));assert.ok(!printed.includes('<script>'));assert.ok(printed.includes('&lt;script&gt;'));
a.run('exportPlan()');assert.equal(a.downloads[0][0],'כרטיס-החלטה.txt');assert.ok(a.downloads[0][1].includes('PUBLIC-CHANGE'));assert.ok(!a.downloads[0][1].includes('PRIVATE-REFLECTION'));
a.run('backup()');const backup=JSON.parse(a.downloads[1][1]);assert.equal(backup.data.fields.interpretation,'PRIVATE-REFLECTION');
const b=app(JSON.parse(a.store.get('leadership-growth-v1')));assert.equal(b.run('data.fields.change'),'PUBLIC-CHANGE');assert.equal(b.run('data.route'),'autonomy');
const c=app(null,true);assert.equal(c.nodes.get('#save-status').textContent,'השמירה אינה זמינה');c.run('go(7)');assert.match(c.nodes.get('#main').innerHTML,/מחשבה שהופכת לצעד/);
assert.equal(a.run('phases.reduce((n,p)=>n+p[1],0)'),12);
console.log('PASS: all screens render; progress restores; export excludes private reflections; HTML is escaped; backup retains notebook; blocked storage remains usable; rehearsal totals 12 minutes.');
