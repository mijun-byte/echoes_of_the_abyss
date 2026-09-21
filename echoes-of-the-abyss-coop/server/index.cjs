'use strict';
const http=require('node:http'),crypto=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');
function createRelay({origins=process.env.ALLOWED_ORIGINS||'https://mijun-byte.github.io,http://localhost:8080,http://127.0.0.1:8080',maxRooms=100}={}){
 const allowed=new Set(origins.split(',').map(s=>s.trim()).filter(Boolean)),rooms=new Map();
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.writeHead(req.url==='/health'?200:404);res.end(JSON.stringify(req.url==='/health'?{ok:true,protocol:1}:{error:'Not found'}));});
 const wss=new WebSocketServer({noServer:true,maxPayload:256*1024,perMessageDeflate:false});
 const send=(s,m)=>{if(s?.readyState===WebSocket.OPEN){if(s.bufferedAmount>1024*1024){s.close(1013,'Slow connection');return;}s.send(JSON.stringify(m));}};
 const fail=(s,message)=>send(s,{type:'error',message});
 function leave(s){const room=rooms.get(s.code);if(!room)return;rooms.delete(s.code);for(const peer of room.peers){peer.code=null;if(peer!==s){send(peer,{type:'ended',message:'Ton partenaire a quitté le salon. L’expédition coop est terminée.'});peer.close(1000);}}s.code=null;}
 server.on('upgrade',(req,socket,head)=>{if(req.url!=='/coop'||!allowed.has(req.headers.origin)||wss.clients.size>=maxRooms*2){socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return;}wss.handleUpgrade(req,socket,head,s=>wss.emit('connection',s,req));});
 wss.on('connection',s=>{
  s.alive=true;s.created=Date.now();s.window=Date.now();s.count=0;s.joinTries=0;
  s.on('pong',()=>s.alive=true);s.on('error',()=>{});s.on('close',()=>leave(s));
  s.on('message',(raw,binary)=>{
   if(binary)return s.close(1003);const now=Date.now();if(now-s.window>1000){s.window=now;s.count=0;}if(++s.count>90)return s.close(1008,'Rate limit');
   let m;try{m=JSON.parse(raw.toString());}catch{return s.close(1007);}if(!m||typeof m!=='object')return;
   if(m.type==='create'||m.type==='join'){
    if(s.code)return fail(s,'Tu es déjà dans un salon.');if(++s.joinTries>12)return s.close(1008);
    if(m.protocol!==1)return fail(s,'Versions incompatibles : actualisez tous les deux le jeu.');
    if(!m.profile||JSON.stringify(m.profile).length>4096)return fail(s,'Profil invalide.');
    if(m.type==='create'){
     if(rooms.size>=maxRooms)return fail(s,'Serveur complet, réessaie plus tard.');let code;do{code=crypto.randomBytes(5).toString('hex').toUpperCase();}while(rooms.has(code));
     s.code=code;s.role='host';s.profile=m.profile;rooms.set(code,{peers:[s],started:false});send(s,{type:'room',role:'host',code});
    }else{
     const code=typeof m.code==='string'?m.code.toUpperCase().trim():'';const room=rooms.get(code);if(!room||room.started||room.peers.length!==1)return fail(s,'Salon introuvable, complet ou déjà lancé.');
     s.code=code;s.role='guest';s.profile=m.profile;room.peers.push(s);send(s,{type:'room',role:'guest',code});for(const peer of room.peers)send(peer,{type:'ready',profiles:room.peers.map(p=>p.profile)});
    }return;
   }
   const room=rooms.get(s.code);if(!room)return;const other=room.peers.find(p=>p!==s);
   if(m.type==='start'&&s.role==='host'&&room.peers.length===2&&!room.started){room.started=true;for(const peer of room.peers)send(peer,{type:'start'});return;}
   if(!room.started)return;
   if(m.type==='input'&&s.role==='guest'){
    if(!m.data||JSON.stringify(m.data).length>2048)return s.close(1009);send(other,{type:'input',data:m.data});
   }else if(m.type==='state'&&s.role==='host'){if(!m.data||typeof m.data!=='object')return;send(other,{type:'state',data:m.data});}
  });
 });
 const timer=setInterval(()=>{for(const s of wss.clients){if(!s.alive||!s.code&&Date.now()-s.created>60000){s.terminate();continue;}s.alive=false;s.ping();}},15000);timer.unref();
 server.on('close',()=>clearInterval(timer));
 return {server,wss,rooms,close:()=>{clearInterval(timer);for(const s of wss.clients)s.terminate();wss.close();return new Promise(r=>server.close(r));}};
}
if(require.main===module){const app=createRelay();app.server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Abyss relay ready'));process.on('SIGTERM',()=>app.close().then(()=>process.exit(0)));}
module.exports={createRelay};
