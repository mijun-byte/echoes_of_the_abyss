'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {WebSocket}=require('ws'),{createRelay}=require('./index.cjs');
function read(s,type){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{s.off('message',on);reject(Error('Timeout '+type));},3000);function on(raw){const m=JSON.parse(raw);if(m.type===type){clearTimeout(timer);s.off('message',on);resolve(m);}}s.on('message',on);});}
async function socket(url,origin='http://test.local'){const s=new WebSocket(url,{origin});await new Promise((resolve,reject)=>{s.once('open',resolve);s.once('error',reject);});return s;}
const send=(s,m)=>s.send(JSON.stringify(m)),profile={name:'Test',look:{head:'mint',body:'mint'},meta:{}};
test('rooms, roles, isolation, capacity, disconnect and malformed packets',async()=>{
 const app=createRelay({origins:'http://test.local'});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const url='ws://127.0.0.1:'+app.server.address().port+'/coop';const sockets=[];
 try{
  const host=await socket(url);sockets.push(host);let msg=read(host,'room');send(host,{type:'create',protocol:1,profile});const room=await msg;assert.match(room.code,/^[0-9A-F]{10}$/);
  const guest=await socket(url);sockets.push(guest);msg=read(guest,'error');send(guest,{type:'join',protocol:1,code:'0000000000',profile});assert.match((await msg).message,/introuvable/);
  const readyH=read(host,'ready'),readyG=read(guest,'ready');send(guest,{type:'join',protocol:1,code:room.code,profile});await readyH;await readyG;
  const third=await socket(url);sockets.push(third);msg=read(third,'error');send(third,{type:'join',protocol:1,code:room.code,profile});assert.match((await msg).message,/complet/);
  const hstart=read(host,'start'),gstart=read(guest,'start');send(host,{type:'start'});await hstart;await gstart;
  msg=read(host,'input');send(guest,{type:'input',data:{keys:{d:true},seq:1}});assert.equal((await msg).data.keys.d,true);
  msg=read(guest,'state');send(host,{type:'state',data:{floor:2}});assert.equal((await msg).data.floor,2);
  let illicit=0;host.on('message',raw=>{if(JSON.parse(raw).type==='state')illicit++;});send(guest,{type:'state',data:{floor:999}});await new Promise(r=>setTimeout(r,30));assert.equal(illicit,0);
  const ended=read(host,'ended');guest.close();assert.match((await ended).message,/quitté/);assert.equal(app.rooms.size,0);
  const bad=await socket(url);sockets.push(bad);const closed=new Promise(r=>bad.once('close',r));bad.send('not-json');assert.equal(await closed,1007);
  await assert.rejects(socket(url,'http://evil.invalid'));
 }finally{for(const s of sockets)s.terminate();await app.close();}
});
