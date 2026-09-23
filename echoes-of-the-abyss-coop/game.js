(() => {
"use strict";
const C=document.querySelector("#game"),X=C.getContext("2d"),W=C.width,H=C.height;
const $=s=>document.querySelector(s), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rnd=(a,b)=>a+Math.random()*(b-a), irnd=(a,b)=>Math.floor(rnd(a,b+1));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y), pick=a=>a[Math.floor(Math.random()*a.length)];
const keys={}, mouse={x:W/2,y:H/2,down:false,right:false};
const SAVE="echoesAbyssRebornV1", META="echoesAbyssMetaV2", SETTINGS="echoesAbyssSettingsV2";
let game=null, last=performance.now();
let coop=null, coopBuildMeta=null;

const ACCESSORIES=[
 {id:'cap',slot:'hat',name:'Casquette',free:true}, {id:'round',slot:'face',name:'Lunettes rondes',free:true},
 {id:'party',slot:'hat',name:'Chapeau de fête',challenge:'first_boss'}, {id:'crown',slot:'hat',name:'Couronne',challenge:'clean_boss'},
 {id:'viking',slot:'hat',name:'Casque viking',challenge:'axe_master'}, {id:'goggles',slot:'face',name:'Lunettes laser',challenge:'laser_line'},
 {id:'wizard',slot:'hat',name:'Chapeau de mage',challenge:'element_master'}, {id:'flower',slot:'hat',name:'Fleur',challenge:'explorer'},
 {id:'monocle',slot:'face',name:'Monocle maudit',challenge:'cursed'}, {id:'halo',slot:'hat',name:'Auréole',challenge:'three_bosses'}
];
const CHALLENGES=[
 {id:'first_boss',name:'Premier gardien',desc:'Vaincre un boss.',goal:1,accessory:'party'},
 {id:'clean_boss',name:'Intouchable',desc:'Vaincre un boss sans subir de dégâts pendant son combat.',goal:1,accessory:'crown'},
 {id:'axe_master',name:'Maître de la hache',desc:'Éliminer 25 ennemis à la hache dans une expédition.',goal:25,accessory:'viking'},
 {id:'laser_line',name:'Alignement parfait',desc:'Toucher 3 ennemis avec un seul tir de laser.',goal:1,accessory:'goggles'},
 {id:'element_master',name:'Alchimiste',desc:'Déclencher 10 surcharges Feu + Foudre dans une expédition.',goal:10,accessory:'wizard'},
 {id:'explorer',name:'Au plus profond',desc:'Atteindre l’étage 5.',goal:5,accessory:'flower'},
 {id:'cursed',name:'Le prix du pouvoir',desc:'Porter 3 reliques maudites différentes dans une expédition.',goal:3,accessory:'monocle'},
 {id:'three_bosses',name:'Cycle accompli',desc:'Vaincre 3 boss dans une expédition.',goal:3,accessory:'halo'}
];
function unlockedAccessory(id){const a=ACCESSORIES.find(a=>a.id===id);return id==='none'||!!a&&(a.free||loadMeta().achievements?.includes(a.challenge));}
function challengeProgress(id){const s=game?.stats||{};return ({first_boss:s.bosses||0,clean_boss:s.cleanBoss?1:0,axe_master:s.weaponKills?.axe||0,laser_line:s.laserTriple?1:0,element_master:s.combos||0,explorer:game?.floor||0,cursed:new Set((game?.player.passives||[]).filter(n=>CURSES.some(c=>c[0]===n))).size,three_bosses:s.bosses||0})[id]||0;}
function checkChallenges(){
 if(coop?.active)return;
 if(!game)return;const m=loadMeta(),owned=m.achievements||[],won=CHALLENGES.filter(c=>!owned.includes(c.id)&&challengeProgress(c.id)>=c.goal);if(!won.length)return;
 m.achievements=[...owned,...won.map(c=>c.id)];try{localStorage.setItem(META,JSON.stringify(m));}catch{return;}
 game.newAccessories=[...(game.newAccessories||[]),...won.map(c=>ACCESSORIES.find(a=>a.id===c.accessory).name)];
 game.achievementUntil=performance.now()+7000;$('#achievementToast').textContent='ACCESSOIRE DÉBLOQUÉ · '+won.map(c=>ACCESSORIES.find(a=>a.id===c.accessory).name).join(' · ');
}
function challengesMenu(){
 if(game)game.paused=true;const m=loadMeta();showModal(`<div class="eyebrow">DÉFIS & ACCESSOIRES</div><h2>La garde-robe des héros</h2><p>Les accessoires débloqués sont conservés après la mort. Les objectifs chiffrés se font dans une seule expédition.</p><div class="challenge-grid">${CHALLENGES.map(c=>{const done=m.achievements?.includes(c.id),a=ACCESSORIES.find(a=>a.id===c.accessory);return `<article class="challenge-card ${done?'complete':''}"><canvas data-accessory-preview="${a.id}" width="80" height="90"></canvas><h3>${c.name}</h3><p>${c.desc}</p><strong>${done?'✓ Débloqué':Math.min(c.goal,challengeProgress(c.id))+' / '+c.goal}</strong><small>Récompense : ${a.name}</small></article>`}).join('')}</div><button id="challengeBack">Retour</button>`);renderAccessoryPreviews();$('#challengeBack').onclick=()=>{if(game)pauseMenu();else hideModal();};
}
function drawAccessories(ctx,look){
 ctx.save();ctx.shadowBlur=0;ctx.lineWidth=1.3;ctx.strokeStyle='#162431';const hat=look.hat||'none',face=look.face||'none';
 const poly=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.stroke();};
 if(hat==='cap'){ctx.fillStyle='#ecb16d';ctx.beginPath();ctx.arc(0,-24,11,Math.PI,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillRect(-12,-25,29,4);}
 if(hat==='party'){poly([[-10,-25],[0,-41],[10,-25]],'#f092b7');ctx.fillStyle='#ffdf85';ctx.fillRect(-4,-31,4,3);ctx.beginPath();ctx.arc(0,-41,2.2,0,7);ctx.fill();}
 if(hat==='crown'){poly([[-13,-33],[-6,-29],[0,-37],[6,-29],[13,-33],[10,-23],[-10,-23]],'#efcf75');ctx.fillStyle='#e07f80';ctx.fillRect(-2,-29,4,4);}
 if(hat==='viking'){poly([[-12,-24],[-9,-32],[0,-36],[9,-32],[12,-24]],'#c1d0d6');poly([[-9,-30],[-19,-35],[-16,-25],[-10,-24]],'#e7d8b8');poly([[9,-30],[19,-35],[16,-25],[10,-24]],'#e7d8b8');}
 if(hat==='wizard'){poly([[-13,-24],[0,-44],[7,-31],[12,-24]],'#b39aea');ctx.fillStyle='#edcb79';ctx.fillRect(-14,-25,28,4);ctx.fillRect(-1,-34,3,3);}
 if(hat==='flower'){for(let i=0;i<5;i++){ctx.fillStyle='#f6a1ca';ctx.beginPath();ctx.arc(10+Math.cos(i*7/5)*4,-27+Math.sin(i*7/5)*4,3,0,7);ctx.fill();}ctx.fillStyle='#fce589';ctx.beginPath();ctx.arc(10,-27,2.5,0,7);ctx.fill();}
 if(hat==='halo'){ctx.strokeStyle='#f8df87';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-35,12,3,0,0,7);ctx.stroke();}
 if(face==='round'){ctx.strokeStyle='#f1d69b';ctx.lineWidth=1.4;for(const x of [-5,5]){ctx.beginPath();ctx.arc(x,-6,4.5,0,7);ctx.stroke();}ctx.beginPath();ctx.moveTo(-1,-6);ctx.lineTo(1,-6);ctx.stroke();}
 if(face==='goggles'){ctx.fillStyle='#1c3446';ctx.fillRect(-12,-11,24,10);ctx.strokeStyle='#84def3';ctx.strokeRect(-11,-10,22,8);ctx.fillStyle='#93e8ff';ctx.fillRect(-8,-8,6,4);ctx.fillRect(2,-8,6,4);}
 if(face==='monocle'){ctx.strokeStyle='#e7c778';ctx.beginPath();ctx.arc(5,-6,5.5,0,7);ctx.moveTo(10,-2);ctx.lineTo(12,10);ctx.stroke();}
 ctx.restore();
}
function renderAccessoryPreviews(){document.querySelectorAll?.('[data-accessory-preview]').forEach(c=>{const id=c.dataset.accessoryPreview,a=ACCESSORIES.find(a=>a.id===id),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);drawCreature('player',40,51,53,0,null,{head:'mint',body:'mint',[a.slot]:id},ctx);});}

const APPEARANCE='echoesAbyssAppearanceV1';
const CHARACTER_COLORS=[
 {id:'mint',name:'Menthe',hex:'#65e0d1'}, {id:'red',name:'Rouge',hex:'#f27e79'},
 {id:'blue',name:'Bleu',hex:'#71aaff'}, {id:'green',name:'Vert',hex:'#8bd278'},
 {id:'gold',name:'Or',hex:'#edc66e'}, {id:'purple',name:'Violet',hex:'#b695f3'},
 {id:'pink',name:'Rose',hex:'#ed96c9'}, {id:'white',name:'Blanc',hex:'#e2e9ec'},
 {id:'orange',name:'Orange',hex:'#f3a66c'}, {id:'slate',name:'Ardoise',hex:'#8795ac'}
];
function normalizeLook(value){return {head:CHARACTER_COLORS.some(c=>c.id===value?.head)?value.head:'mint',body:CHARACTER_COLORS.some(c=>c.id===value?.body)?value.body:'mint',...Object.fromEntries(['hat','face'].filter(slot=>ACCESSORIES.some(a=>a.slot===slot&&a.id===value?.[slot])).map(slot=>[slot,value[slot]]))};}
function loadLook(){try{const look=normalizeLook(JSON.parse(localStorage.getItem(APPEARANCE)));for(const slot of ["hat","face"])if(look[slot]&&!unlockedAccessory(look[slot]))delete look[slot];return look;}catch{return normalizeLook(null);}}
let playerLook=loadLook();
function saveLook(value){const next=normalizeLook(value);if(["hat","face"].some(slot=>next[slot]&&!unlockedAccessory(next[slot])))return false;try{localStorage.setItem(APPEARANCE,JSON.stringify(next));playerLook=next;return true;}catch{return false;}}
function lookColor(id){return CHARACTER_COLORS.find(c=>c.id===id)||CHARACTER_COLORS[0];}
function shadeColor(hex,factor){return '#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*factor).toString(16).padStart(2,'0')).join('');}
function customization(){
 if(game)game.paused=true;let draft={...playerLook};
 const palette=part=>CHARACTER_COLORS.map(c=>`<button type="button" class="color-choice" data-part="${part}" data-color="${c.id}" aria-label="${part==='head'?'Tête':'Corps'} : ${c.name}" aria-pressed="${draft[part]===c.id}"><span class="color-dot" style="background:${c.hex}"></span><span>${c.name}</span><span class="color-check" aria-hidden="true">✓</span></button>`).join('');
 showModal(`<div class="eyebrow">TON PERSONNAGE · TES COULEURS</div><h2>Personnalisation</h2><p>La même silhouette, 100 combinaisons. Choisis séparément la tête et le corps.</p><div class="custom-layout"><div class="custom-preview"><canvas id="characterPreview" width="280" height="300" aria-label="Aperçu du personnage"></canvas><p id="lookSummary"></p><small>Apparence gratuite · Aucun effet sur les statistiques</small></div><div class="custom-palettes"><h3 id="headHeading">Couleur de la tête</h3><div class="color-grid" role="group" aria-labelledby="headHeading">${palette('head')}</div><h3 id="bodyHeading">Couleur du corps</h3><div class="color-grid" role="group" aria-labelledby="bodyHeading">${palette('body')}</div></div></div><div class="accessory-picker"><h3>Accessoires</h3><p>Casquette et lunettes rondes offertes. Les autres se gagnent dans Défis & accessoires.</p>${['hat','face'].map(slot=>`<label for="accessory-${slot}">${slot==='hat'?'Chapeau':'Lunettes'}</label><select id="accessory-${slot}" data-accessory-slot="${slot}"><option value="none">Aucun</option>${ACCESSORIES.filter(a=>a.slot===slot).map(a=>`<option value="${a.id}" ${draft[slot]===a.id?'selected':''} ${unlockedAccessory(a.id)?'':'disabled'}>${a.name}${unlockedAccessory(a.id)?'':' — Défi : '+CHALLENGES.find(c=>c.id===a.challenge).name}</option>`).join('')}</select>`).join('')}</div><p id="lookStatus" role="status"></p><div class="custom-actions"><button id="lookReset">Apparence d’origine</button><button id="lookCancel">Annuler</button><button id="lookSave">Enregistrer l’apparence</button></div>`);
 function refresh(){
  $('#modalCard').querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(draft[b.dataset.part]===b.dataset.color)));
  const canvas=$('#characterPreview'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#091821';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#7ba69b33';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(140,251,90,17,0,0,Math.PI*2);ctx.stroke();drawCreature('player',140,155,152,0,null,draft,ctx);
  $('#lookSummary').textContent=`Tête : ${lookColor(draft.head).name} · Corps : ${lookColor(draft.body).name}`;
 }
 $('#modalCard').onclick=e=>{const b=e.target.closest('[data-color]');if(!b)return;draft[b.dataset.part]=b.dataset.color;refresh();};
 const close=()=>{if(game)pauseMenu();else hideModal();};
 for(const slot of ['hat','face'])$('#accessory-'+slot).onchange=e=>{if(unlockedAccessory(e.target.value)){if(e.target.value==='none')delete draft[slot];else draft[slot]=e.target.value;refresh();}};$('#lookReset').onclick=()=>{draft=normalizeLook(null);for(const slot of ['hat','face'])$('#accessory-'+slot).value='none';refresh();};$('#lookCancel').onclick=close;
 $('#lookSave').onclick=()=>{if(saveLook(draft))close();else $('#lookStatus').textContent='Impossible de sauvegarder : vérifie le stockage du navigateur puis réessaie.';};refresh();
}

// Images fournies par le joueur. Elles sont chargées depuis le dossier assets/.
const SPRITE_PATHS={
 player:"assets/hugo.jpeg",
 slime:"assets/peter.jpg",
 skeleton:"assets/skeleton.jpg",
 archer:"assets/skeleton.jpg",
 bat:"assets/speed.jpg",
 mage:"assets/Witch_BE.webp",
 tank:"assets/Gragas_Rendu.webp",
 boss:"assets/boss.JPG"
};
const SPRITES={};
for(const [name,src] of Object.entries(SPRITE_PATHS)){
 const img=new Image();img.src=src;SPRITES[name]=img;
}

const WEAPON_SPRITE_PATHS={
 sword:"assets/weapon_sword.png",
 great:"assets/weapon_great.png",
 bow:"assets/weapon_bow.png",
 staff:"assets/weapon_staff.png",
 daggers:"assets/weapon_daggers.png",
 laser:"assets/icons/ray-gun.svg",axe:"assets/icons/battle-axe.svg"
};
const WEAPON_SPRITES={};
for(const [name,src] of Object.entries(WEAPON_SPRITE_PATHS)){
 const img=new Image();img.src=src;WEAPON_SPRITES[name]=img;
}

const RARITIES=[
 {n:"Commun",c:"#c9c9c9",m:1},{n:"Peu commun",c:"#6bd66b",m:1.15},{n:"Rare",c:"#5a9cff",m:1.35},
 {n:"Épique",c:"#b56cff",m:1.6},{n:"Légendaire",c:"#ffb33f",m:2}
];
const WEAPONS={
 sword:{name:"Épée",kind:"melee",damage:18,rate:.38,range:72,arc:1.7,knock:130},
 great:{name:"Grande épée",kind:"melee",damage:36,rate:.78,range:92,arc:1.45,knock:260},
 bow:{name:"Arc",kind:"ranged",damage:16,rate:.48,speed:650,knock:80},
 staff:{name:"Bâton du néant",kind:"magic",damage:20,rate:.55,speed:500,knock:60},
 daggers:{name:"Dagues",kind:"melee",damage:10,rate:.18,range:55,arc:1.25,knock:70},
 laser:{name:"Canon laser",kind:"laser",damage:240,rate:.8,charge:1.4,range:1100,width:12,knock:60},
 axe:{name:"Hache du tourbillon",kind:"melee",damage:52,rate:1.1,range:105,arc:Math.PI*2,knock:230,moveMul:.75}
};
const PASSIVES=[
 ["Anneau fendu","+6% critique",p=>p.crit+=.06],["Bottes du rôdeur","+9% vitesse",p=>p.speed*=1.09],
 ["Cœur de pierre","+22 PV max",p=>{p.maxHp+=22;p.hp+=22}],["Amulette rouge","+12% dégâts",p=>p.damageMul*=1.12],
 ["Cape spectrale","+5% esquive",p=>p.dodge+=.05],["Relique sanglante","+3% vol de vie",p=>p.lifesteal+=.03],
 ["Œil du chasseur","+20% dégâts critiques",p=>p.critMul+=.2],["Gants véloces","+12% vitesse d'attaque",p=>p.attackMul*=1.12],
 ["Rune du vent","Dash récupère plus vite",p=>p.dashCdMax*=.88],["Carquois double","+1 projectile",p=>p.extraProj++],
 ["Cendre vive","Les attaques enflamment pendant 3 s",p=>p.element=1],["Égide ancienne","+3 armure",p=>p.armor+=3],
 ["Fiole verte","+15% soins",p=>p.healMul*=1.15],["Pièce maudite","+20% or",p=>p.goldMul*=1.2],
 ["Crâne explosif","Explosion tous les 8 kills",p=>p.explodeEvery=Math.max(4,p.explodeEvery-2)]
];
const CURSES=[
 ['Pacte de verre','+65% dégâts · CONTREPARTIE : −30% PV maximum',p=>{p.damageMul*=1.65;p.maxHp=Math.max(1,Math.round(p.maxHp*.7));p.hp=Math.min(p.hp,p.maxHp);}],
 ['Bourse du chaos','+75% or · CONTREPARTIE : +18 points de chance d’élites dans les prochaines salles (maximum 85%)',p=>{p.goldMul*=1.75;p.eliteBonus=(p.eliteBonus||0)+.18;}],
 ['Sang du berserker','+45% vitesse d’attaque · CONTREPARTIE : −35% efficacité des soins',p=>{p.attackMul*=1.45;p.healMul*=.65;}],
 ['Bottes du sacrifice','+30% vitesse · CONTREPARTIE : +30% dégâts reçus avant armure',p=>{p.speed*=1.3;p.incomingMul=(p.incomingMul||1)*1.3;}],
 ['Éclat instable','+40% dégâts · CONTREPARTIE : +30% recharge des sorts et pouvoirs',p=>{p.damageMul*=1.4;p.cooldownMul=(p.cooldownMul||1)*1.3;}]
];
const ALL_PASSIVES=[...PASSIVES,...CURSES];
function isCurse(name){return CURSES.some(c=>c[0]===name);}
function makeCurseDrop(x,y){const available=CURSES.filter(c=>!game.player.passives.includes(c[0]));return available.length?{type:'passive',item:pick(available),x,y,r:13,taken:false,rarity:3}:makeDrop(x,y,'rare');}
const UPGRADES=[
 ["Fureur","+20% dégâts",p=>p.damageMul*=1.2],["Agilité","+10% vitesse",p=>p.speed*=1.1],
 ["Vitalité","+25 PV maximum",p=>{p.maxHp+=25;p.hp+=25}],["Frénésie","+15% vitesse d'attaque",p=>p.attackMul*=1.15],
 ["Précision","+5% critique",p=>p.crit+=.05],["Pas spectral","Dash + rapide",p=>{p.dashCdMax*=.85;p.dashPower*=1.08}],
 ["Second souffle","Récupère 25% PV",p=>p.heal(p.maxHp*.25)],["Échos","+1 projectile",p=>p.extraProj++],
 ["Onde","+20% dégâts de zone",p=>p.aoe+=.2],["Sangsue","+3% vol de vie",p=>p.lifesteal+=.03]
];
const ENEMY={slime:[36,70,8],skeleton:[48,92,11],archer:[35,78,9],bat:[24,150,7],mage:[42,75,12],tank:[105,48,16],wraith:[32,125,10],sentinel:[80,62,14],bomber:[28,105,19],oracle:[55,55,11]};

// Permanent equipment is bought once and applied only when a new run starts.
const SHOP_ITEMS=[
 {id:'charm',name:'Talisman du voyageur',price:1000,desc:'+15 PV maximum',apply:p=>{p.maxHp+=15;p.hp+=15}},
 {id:'gloves',name:'Gants de l’éclaireur',price:3000,desc:'+10% vitesse d’attaque',apply:p=>p.attackMul*=1.1},
 {id:'mail',name:'Cotte du sanctuaire',price:7500,desc:'+4 armure · +25 PV maximum',apply:p=>{p.armor+=4;p.maxHp+=25;p.hp+=25}},
 {id:'ruby',name:'Rubis de guerre',price:15000,desc:'+25% dégâts',apply:p=>p.damageMul*=1.25},
 {id:'boots',name:'Bottes du crépuscule',price:30000,desc:'+15% vitesse · recharge du dash −15%',apply:p=>{p.speed*=1.15;p.dashCdMax*=.85}},
 {id:'eye',name:'Œil des profondeurs',price:60000,desc:'+10 points de critique · +30% dégâts critiques',apply:p=>{p.crit+=.1;p.critMul+=.3}},
 {id:'crown',name:'Couronne du Roi déchu',price:100000,desc:'+60% dégâts · +100 PV maximum · +5 armure',legend:true,apply:p=>{p.damageMul*=1.6;p.maxHp+=100;p.hp+=100;p.armor+=5}},
 {id:'heart',name:'Cœur du Néant',price:500000,desc:'+100% dégâts · +40% vitesse d’attaque · +8% vol de vie',legend:true,apply:p=>{p.damageMul*=2;p.attackMul*=1.4;p.lifesteal+=.08}},
 {id:'abyss',name:'Héritage de l’Abîme',price:1000000,desc:'+200% dégâts · +300 PV maximum · +15 armure · +2 projectiles',legend:true,apply:p=>{p.damageMul*=3;p.maxHp+=300;p.hp+=300;p.armor+=15;p.extraProj+=2}}
];
const SHOP_WEAPONS=[
 {id:'unlock_axe',name:'Hache du tourbillon',weaponType:'axe',price:40000,desc:'Frappe à 360° · 52 dégâts de base · 1 attaque / 1,1 s. Déplacement −25% tant qu’elle est équipée.'},
 {id:'unlock_laser',name:'Canon laser',weaponType:'laser',price:80000,desc:'Maintiens le clic gauche : charge 1,4 s, puis rayon perforant de 240 dégâts de base. Récupération : 0,8 s.'}
];
const ITEM_ART={
 'Pacte de verre':'mineral-heart','Bourse du chaos':'coins','Sang du berserker':'bleeding-heart','Bottes du sacrifice':'leather-boot','Éclat instable':'crystal-cluster',
 'Anneau fendu':'big-diamond-ring','Bottes du rôdeur':'leather-boot','Cœur de pierre':'mineral-heart','Amulette rouge':'gem-necklace','Cape spectrale':'cloak','Relique sanglante':'bleeding-heart','Œil du chasseur':'eyeball','Gants véloces':'gauntlet','Rune du vent':'whirlwind','Carquois double':'quiver','Cendre vive':'flame','Égide ancienne':'round-shield','Fiole verte':'round-potion','Pièce maudite':'coins','Crâne explosif':'skull-crossed-bones',
 'Talisman du voyageur':'gem-necklace','Gants de l’éclaireur':'gauntlet','Cotte du sanctuaire':'chain-mail','Rubis de guerre':'crystal-cluster','Bottes du crépuscule':'leather-boot','Œil des profondeurs':'eyeball','Couronne du Roi déchu':'crown','Cœur du Néant':'bleeding-heart','Héritage de l’Abîme':'crystal-cluster','Boule de feu':'fireball','Chaîne de foudre':'lightning-trio','Éruption terrestre':'stone-pile','Canon laser':'ray-gun','Hache du tourbillon':'battle-axe'
};
const ITEM_SPRITES={};for(const icon of new Set(Object.values(ITEM_ART))){const img=new Image();img.src=`assets/icons/${icon}.svg`;ITEM_SPRITES[icon]=img;}
function itemIcon(name,cls='item-icon'){return `<img class="${cls}" src="assets/icons/${ITEM_ART[name]||'crystal-cluster'}.svg" alt="" aria-hidden="true">`;}
function attackSpeed(p){return p.attackMul*(p.weapon.extra==='speed'?1.12:1);}
function movementSpeed(p){return p.speed*(p.weapon.base.moveMul||1);}
function laserChargeTime(p){return Math.max(.25,p.weapon.base.charge/attackSpeed(p));}
function startingWeapons(m){return ['sword',...(m.bowUnlocked?['bow']:[]),...SHOP_WEAPONS.filter(w=>m.owned?.includes(w.id)).map(w=>w.weaponType)];}
function chooseStartingWeapon(type){const m=loadMeta();if(!startingWeapons(m).includes(type))return false;m.startWeapon=type;localStorage.setItem(META,JSON.stringify(m));return true;}
const SPELLS=[
 {id:'fireball',name:'Boule de feu',price:25000,key:'F',color:'#ff9757',damage:90,cd:4,desc:'F · Explosion : 90 dégâts, rayon 110. Brûlure : 18 dégâts/s pendant 3 s. Recharge : 4 s.'},
 {id:'lightning',name:'Chaîne de foudre',price:75000,key:'R',color:'#8cdfff',damage:100,cd:7,desc:'R · Jusqu’à 5 cibles : 100 dégâts sur la première, puis −20% par rebond. Étourdit 0,7 s (boss : 0,25 s). Recharge : 7 s. Sur une cible en feu : explosion supplémentaire de 60 dégâts (rayon 100).'},
 {id:'earth',name:'Éruption terrestre',price:150000,key:'T',color:'#c5b277',damage:140,cd:10,desc:'T · Pics au curseur (portée 300, rayon 120) : 140 dégâts et recul. Ralentit de 55% pendant 4 s (boss : 25%, 2 s), puis laser +25% dégâts. Protection totale pendant 1,5 s. Recharge : 10 s.'}
];
function redeemCheat(code){
 if(String(code).trim().toUpperCase()!=='ABYSSE10M')return 'Code inconnu. Pour tester : ABYSSE10M.';
 const m=loadMeta();m.bank=(m.bank||0)+10000000;
 try{localStorage.setItem(META,JSON.stringify(m));return 'Code activé : +10 000 000 pièces d’or en banque ! Achète tes objets et sorts, puis lance une nouvelle expédition.';}
 catch{return 'Impossible d’enregistrer le code : stockage du navigateur indisponible.';}
}
const money=n=>Math.floor(n||0).toLocaleString('fr-FR')+' PO',fmt=n=>Number(n.toFixed(2)).toLocaleString('fr-FR'),pct=n=>fmt(n*100)+'%';
function difficulty(floor){const n=Math.max(0,floor-1);return {hp:1.55**n,damage:1.23**n,speed:1+Math.min(.55,n*.045),gold:1.5**n};}
function applyOwned(p,m){for(const item of SHOP_ITEMS)if(m.owned?.includes(item.id)){item.apply(p);p.passives.push(item.name);}}
function awardGold(amount){if(coop?.active){for(const p of game.coopPlayers){const n=Math.round(amount*p.goldMul);p.gold+=n;game.stats.gold+=n;}return;}const n=Math.round(amount*game.player.goldMul);game.player.gold+=n;game.stats.gold+=n;}
function statCells(entries){return entries.map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('');}
function weaponStats(w,p){
 const damage=w.base.damage*w.bonus*(w.extra==='element'?1.1:1)*(p?.damageMul||1),speed=(p?.attackMul||1)*(w.extra==='speed'?1.12:1),charge=w.type==='laser'?Math.max(.25,w.base.charge/speed):0,cycle=charge+w.base.rate/speed,rate=1/cycle;
 const rows=[['Dégâts de base',fmt(w.base.damage*w.bonus)],['Dégâts par coup',fmt(damage)],['Attaques / seconde',fmt(rate)],['DPS hors critique',fmt(damage*rate)],['Type',w.type==='laser'?'Rayon perforant':w.type==='axe'?'Mêlée à 360°':w.base.kind==='melee'?'Corps à corps':w.base.kind==='magic'?'Magie':'Distance'],[w.base.range?'Portée':'Vitesse du projectile',w.base.range||w.base.speed]];
 if(w.type==='laser')rows.push(['Charge',fmt(charge)+' s'],['Récupération',fmt(w.base.rate/speed)+' s']);if(w.type==='axe')rows.push(['Déplacement','−25% (arme équipée)']);
 return `<div class="stat-grid">${statCells(rows)}</div><p>${({crit:'+6 points de critique',speed:'+12% vitesse d’attaque',life:'+3% vol de vie',element:'+10% dégâts élémentaires'})[w.extra]||'Aucun bonus secondaire'} · DPS par cible / projectile, hors pouvoirs.</p>`;
}

// Roulette: the balance and result are committed together before the visual spin.
const ROULETTE_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const ROULETTE_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
let rouletteBusy=false;
function rouletteColor(n){return n===0?'vert':ROULETTE_RED.has(n)?'rouge':'noir';}
function rouletteMultiplier(kind,number,result){if(kind==='number')return number===result?36:0;if(result===0)return 0;return (kind===rouletteColor(result)||(kind==='pair'&&result%2===0)||(kind==='impair'&&result%2===1))?2:0;}
function rouletteDraw(){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1),limit=4294967296-4294967296%37;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%37;}return Math.floor(Math.random()*37);}
function settleRoulette(stake,kind,number){
 if(rouletteBusy)return {error:'La roue tourne déjà.'};
 const m=loadMeta(),bank=m.bank||0;
 if(!Number.isSafeInteger(stake)||stake<1)return {error:'Choisis une mise entière d’au moins 1 PO.'};
 if(!['rouge','noir','pair','impair','number'].includes(kind)||kind==='number'&&(!Number.isInteger(number)||number<0||number>36))return {error:'Choisis un pari valide (numéro de 0 à 36).'};
 if(!Number.isSafeInteger(bank)||bank<stake)return {error:'Tu n’as pas assez de pièces d’or en banque.'};
 if(!Number.isSafeInteger(bank+stake*35))return {error:'Cette mise est trop élevée.'};
 const result=rouletteDraw(),payout=stake*rouletteMultiplier(kind,number,result);
 const round={stake,kind,number:kind==='number'?number:null,result,payout,net:payout-stake,time:Date.now()};
 m.bank=bank-stake+payout;m.rouletteLast=round;
 try{localStorage.setItem(META,JSON.stringify(m));}catch{return {error:'Impossible de sauvegarder : aucune pièce n’a été misée.'};}
 return round;
}
function rouletteResult(r){return `${r.result} · ${rouletteColor(r.result).toUpperCase()} — ${r.payout?'Gagné ! Versement : '+money(r.payout)+' (bénéfice : '+money(r.net)+').':'Perdu : '+money(r.stake)+'.'}`;}
function drawRoulette(canvas,rotation=0){
 const c=canvas.getContext('2d'),cx=210,cy=210,r=185,step=Math.PI*2/37;c.clearRect(0,0,420,420);c.save();c.translate(cx,cy);c.rotate(rotation);
 ROULETTE_ORDER.forEach((n,i)=>{const a=-Math.PI/2+(i-.5)*step;c.beginPath();c.moveTo(0,0);c.arc(0,0,r,a,a+step);c.closePath();c.fillStyle=n===0?'#257b64':ROULETTE_RED.has(n)?'#a63f4e':'#172b35';c.fill();c.strokeStyle='#c6a963';c.lineWidth=.6;c.stroke();c.save();c.rotate(a+step/2);c.translate(r-20,0);c.rotate(Math.PI/2);c.fillStyle='#fff1ca';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText(n,0,4);c.restore();});
 c.restore();c.beginPath();c.arc(cx,cy,70,0,Math.PI*2);c.fillStyle='#0c1c25';c.fill();c.strokeStyle='#e3c578';c.lineWidth=3;c.stroke();c.fillStyle='#e3c578';c.textAlign='center';c.font='28px serif';c.fillText('◇',cx,cy+1);c.font='11px sans-serif';c.fillText('L’ABÎME',cx,cy+25);c.beginPath();c.moveTo(cx-10,8);c.lineTo(cx+10,8);c.lineTo(cx,35);c.closePath();c.fill();
}
function rouletteMenu(){
 const m=loadMeta();showModal(`<div class="eyebrow">LE HASARD DES PROFONDEURS</div><h2>La Roulette de l’Abîme</h2><div class="roulette-layout"><div class="roulette-wheel"><canvas id="rouletteWheel" width="420" height="420" aria-label="Roulette à 37 cases, de 0 à 36"></canvas><p>Or fictif du jeu · 37 cases équiprobables</p></div><form id="rouletteForm"><p class="bank-balance">Banque : <span id="rouletteBank">${money(m.bank)}</span></p><label for="rouletteStake">Ta mise en PO</label><input id="rouletteStake" type="number" min="1" step="1" value="100" required><div class="roulette-presets">${[100,1000,10000].map(n=>`<button type="button" data-stake="${n}">${money(n)}</button>`).join('')}</div><label for="rouletteBet">Ton pari</label><select id="rouletteBet"><option value="rouge">Rouge · ×2</option><option value="noir">Noir · ×2</option><option value="pair">Pair · ×2</option><option value="impair">Impair · ×2</option><option value="number">Numéro exact · ×36</option></select><label id="rouletteNumberLabel" for="rouletteNumber" hidden>Numéro de 0 à 36</label><input id="rouletteNumber" type="number" min="0" max="36" step="1" value="0" hidden disabled><p class="roulette-rules">Multiplicateurs mise comprise. Le zéro fait perdre rouge, noir, pair et impair. Un numéro exact peut gagner sur le zéro.</p><button type="submit" id="rouletteSpin">Miser et lancer la roue</button></form></div><p id="rouletteStatus" role="status">${m.rouletteLast?'Dernier tirage : '+rouletteResult(m.rouletteLast):'Choisis ta mise et ton pari.'}</p><button id="rouletteBack">Retour au menu</button>`);
 const canvas=$('#rouletteWheel');drawRoulette(canvas,m.rouletteLast?-ROULETTE_ORDER.indexOf(m.rouletteLast.result)*Math.PI*2/37:0);
 $('#modalCard').querySelectorAll('[data-stake]').forEach(b=>b.onclick=()=>$('#rouletteStake').value=b.dataset.stake);
 $('#rouletteBet').onchange=()=>{const exact=$('#rouletteBet').value==='number';$('#rouletteNumber').hidden=!exact;$('#rouletteNumber').disabled=!exact;$('#rouletteNumberLabel').hidden=!exact;};
 $('#rouletteBack').onclick=()=>{if(!rouletteBusy)mainMenu();};
 $('#rouletteForm').onsubmit=e=>{
  e.preventDefault();if(rouletteBusy)return;const r=settleRoulette(Number($('#rouletteStake').value),$('#rouletteBet').value,Number($('#rouletteNumber').value));if(r.error){$('#rouletteStatus').textContent=r.error;return;}
  rouletteBusy=true;const controls=[...$('#modalCard').querySelectorAll('button,input,select')];controls.forEach(b=>b.disabled=true);$('#rouletteStatus').textContent='La roue tourne…';
  const start=performance.now(),duration=3800,angle=Math.PI*2*6-ROULETTE_ORDER.indexOf(r.result)*Math.PI*2/37;
  function animate(now){const t=Math.min(1,(now-start)/duration);drawRoulette(canvas,angle*(1-(1-t)**4));if(t<1){requestAnimationFrame(animate);return;}rouletteBusy=false;controls.forEach(b=>b.disabled=false);$('#rouletteBet').onchange();$('#rouletteBank').textContent=money(loadMeta().bank);$('#rouletteStatus').textContent=rouletteResult(r);$('#metaMoney').textContent=`Banque : ${money(loadMeta().bank)} · Éclats : ${loadMeta().shards||0}`;}
  requestAnimationFrame(animate);
 };
}

function bankShop(message=''){
 const m=loadMeta(),catalog=[...SHOP_ITEMS,...SHOP_WEAPONS,...SPELLS];showModal(`<div class="eyebrow">LE COMPTOIR DU SANCTUAIRE</div><h2>Boutique permanente</h2><p class="bank-balance">${money(m.bank)}</p><p>Achats uniques et cumulables, actifs à chaque <b>nouvelle expédition</b>.<br>Une partie sauvegardée garde son équipement actuel.</p><p class="currency-note">PO = pièces d’or · Tes soldes et achats sont conservés.</p><label class="loadout-label" for="startingWeapon">Arme de la prochaine expédition</label><select id="startingWeapon">${startingWeapons(m).map(type=>`<option value="${type}" ${(m.startWeapon||(m.bowUnlocked?'bow':'sword'))===type?'selected':''}>${WEAPONS[type].name}</option>`).join('')}</select><form id="cheatForm" class="cheat-form"><label for="cheatCode">Code de triche <small>Test : ABYSSE10M → +10 millions de pièces d’or (réutilisable)</small></label><div><input id="cheatCode" name="code" type="text" maxlength="30" placeholder="ABYSSE10M" autocomplete="off" spellcheck="false"><button type="submit">Activer le code</button></div></form><p role="status">${message}</p><div class="shop-grid">${catalog.map(it=>{const owned=m.owned?.includes(it.id),afford=(m.bank||0)>=it.price;return `<article class="shop-item ${it.legend?'legendary':''}"><small>${it.weaponType?'ARME DE DÉPART':it.key?'SORT PERMANENT · TOUCHE '+it.key:it.legend?'RELIQUE SUPRÊME':'ÉQUIPEMENT PERMANENT'}</small>${itemIcon(it.name,'shop-icon')}<h3>${it.name}</h3><p>${it.desc}</p><b class="price">${money(it.price)}</b><button data-shop="${it.id}" ${owned||!afford?'disabled':''}>${owned?'Acquis — actif au départ':afford?'Acheter':'Il manque '+money(it.price-(m.bank||0))}</button></article>`}).join('')}</div><button id="shopBack">Retour au menu</button>`);
 $('#startingWeapon').onchange=e=>{chooseStartingWeapon(e.target.value);};$('#cheatForm').onsubmit=e=>{e.preventDefault();bankShop(redeemCheat($('#cheatCode').value));};$('#shopBack').onclick=mainMenu;$('#modalCard').querySelectorAll('[data-shop]').forEach(b=>b.onclick=()=>{const it=catalog.find(x=>x.id===b.dataset.shop),m=loadMeta();if(!it||m.owned?.includes(it.id)||(m.bank||0)<it.price)return;m.bank-=it.price;m.owned=[...(m.owned||[]),it.id];if(it.weaponType)m.startWeapon=it.weaponType;try{localStorage.setItem(META,JSON.stringify(m));bankShop(it.name+' acheté !');}catch{bankShop('Achat non enregistré : stockage indisponible.');}});
}

class Particle{
 constructor(x,y,c,life=.5,s=3){this.x=x;this.y=y;this.c=c;this.life=this.max=life;this.vx=rnd(-130,130);this.vy=rnd(-130,130);this.s=s}
 update(dt){this.life-=dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.vx*=.94;this.vy*=.94}
 draw(){X.globalAlpha=clamp(this.life/this.max,0,1);X.fillStyle=this.c;X.fillRect(this.x,this.y,this.s,this.s);X.globalAlpha=1}
}
class FloatText{
 constructor(x,y,t,c="#fff"){Object.assign(this,{x,y,t,c,life:.8})}
 update(dt){this.life-=dt;this.y-=28*dt}
 draw(){X.globalAlpha=clamp(this.life/.8,0,1);X.fillStyle=this.c;X.font="bold 15px monospace";X.fillText(this.t,this.x,this.y);X.globalAlpha=1}
}
class Projectile{
 constructor(x,y,a,speed,damage,owner,c="#ddd",r=5,source=null){this.coopOwner=source?.coopOwner??game?.player.coopId;this.source=source;Object.assign(this,{x,y,px:x,py:y,a,speed,damage,owner,c,r,life:2.2,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed})}
 update(dt){
  this.life-=dt;this.px=this.x;this.py=this.y;this.x+=this.vx*dt;this.y+=this.vy*dt;
  if(!insideRoom(this.x,this.y,8)){this.life=0;return}
  if(this.owner==="player"){
   for(const e of game.enemies) if(!e.dead&&Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r){e.hit(this.damage,Math.atan2(this.vy,this.vx),90,this.source);this.life=0;break}
  } else if(Math.hypot(this.x-game.player.x,this.y-game.player.y)<this.r+game.player.r){game.player.hit(this.damage);this.life=0}
 }
 draw(){
  const a=Math.atan2(this.vy,this.vx);
  X.save();X.globalAlpha=.45;X.strokeStyle=this.c;X.lineWidth=this.r*.8;X.beginPath();X.moveTo(this.px,this.py);X.lineTo(this.x,this.y);X.stroke();X.globalAlpha=1;
  if(this.owner==="player"&&this.c==="#e7d5a1"){
   X.translate(this.x,this.y);X.rotate(a);X.strokeStyle="#f2dfae";X.lineWidth=3;X.beginPath();X.moveTo(-12,0);X.lineTo(9,0);X.stroke();
   X.fillStyle="#f2dfae";X.beginPath();X.moveTo(11,0);X.lineTo(4,-4);X.lineTo(4,4);X.closePath();X.fill();
  }else{
   X.shadowBlur=18;X.shadowColor=this.c;X.fillStyle=this.c;X.beginPath();X.arc(this.x,this.y,this.r,0,7);X.fill();X.shadowBlur=0;
  }
  X.restore();
 }
}
class Fireball extends Projectile{
 constructor(p,a,damage){super(p.x+Math.cos(a)*25,p.y+Math.sin(a)*25,a,520,damage,'player','#ff9757',11);this.life=1.4;this.exploded=false;}
 update(dt){
  if(this.exploded)return;this.life-=dt;this.px=this.x;this.py=this.y;this.x+=this.vx*dt;this.y+=this.vy*dt;
  burst(this.x,this.y,'#ff9757',1);
  if(this.life<=0||!insideRoom(this.x,this.y,12)||game.enemies.some(e=>!e.dead&&dist(this,e)<this.r+e.r))this.explode();
 }
 explode(){
  if(this.exploded)return;this.exploded=true;this.life=0;spellEffect({type:'fire',x:this.x,y:this.y,r:110,color:'#ff9757',life:.55});
  burst(this.x,this.y,'#ff9757',30);const targets=game.enemies.filter(e=>!e.dead&&dist(this,e)<110+e.r);
  for(const e of targets){e.hit(this.damage,Math.atan2(e.y-this.y,e.x-this.x),150,{element:"fire"});applyBurn(e,this.damage*.2);}
 }
}
function spellEffect(fx){game.spellEffects=game.spellEffects||[];game.spellEffects.push({...fx,max:fx.life});}
function spellNotice(text){game.toastText=text;game.toastUntil=performance.now()+2500;}
function updateSpellHud(){
 const p=game.player,html=SPELLS.map(s=>{const owned=p.spells.includes(s.id),cd=p.spellCd[s.id]||0;return `<button class="spell ${owned?'unlocked':''}" data-spell="${s.id}" ${!owned||cd>0?'disabled':''} style="--spell:${s.color}" title="${s.desc}"><kbd>${s.key}</kbd><b>${s.name}</b><small>${owned?cd>0?cd.toFixed(1)+' s':'PRÊT':'À ACHETER'}</small></button>`}).join('');
 // Only update labels when possible, so a cooldown tick cannot swallow a mouse click.
 if(!$('#spellBar').querySelector('[data-spell]'))$('#spellBar').innerHTML=html;
 else for(const s of SPELLS){const b=$('#spellBar').querySelector(`[data-spell="${s.id}"]`),owned=p.spells.includes(s.id),cd=p.spellCd[s.id]||0;b.disabled=!owned||cd>0;b.classList.toggle('unlocked',owned);b.querySelector('small').textContent=owned?cd>0?cd.toFixed(1)+' s':'PRÊT':'À ACHETER';}
}
function drawSpellEffects(){
 X.save();for(const fx of game.spellEffects||[]){const progress=1-fx.life/fx.max;X.globalAlpha=Math.max(0,1-progress);X.strokeStyle=fx.color;X.fillStyle=fx.color;X.lineWidth=3;X.shadowColor=fx.color;X.shadowBlur=18;
 if(fx.type==='laser'){X.lineCap='round';for(const [width,color] of [[24,fx.color+'44'],[12,fx.color],[4,'#ffffff']]){X.lineWidth=width;X.strokeStyle=color;X.beginPath();X.moveTo(fx.x,fx.y);X.lineTo(fx.endX,fx.endY);X.stroke();}}
 else if(fx.type==='lightning'){X.beginPath();fx.points.forEach((p,i)=>{if(!i)X.moveTo(p.x,p.y);else{const prev=fx.points[i-1];for(let j=1;j<5;j++)X.lineTo(prev.x+(p.x-prev.x)*j/5+(j%2?9:-9),prev.y+(p.y-prev.y)*j/5+(j%2?-7:7));X.lineTo(p.x,p.y);}});X.stroke();}
 else{X.beginPath();X.arc(fx.x,fx.y,fx.r*(.35+progress*.65),0,Math.PI*2);X.stroke();if(fx.type==='earth'){for(let i=0;i<9;i++){const a=i*Math.PI*2/9,x=fx.x+Math.cos(a)*fx.r*.65,y=fx.y+Math.sin(a)*fx.r*.45;X.beginPath();X.moveTo(x-12,y+10);X.lineTo(x,y-38*(1-progress*.6));X.lineTo(x+12,y+10);X.closePath();X.fill();}}}
 }X.restore();
}

class Weapon{
 constructor(type="sword",rar=0){this.type=type;this.rarity=rar;this.base=WEAPONS[type];this.bonus=rnd(.94,1.08)*RARITIES[rar].m;this.extra=Math.random()<.16?pick(["crit","speed","life","element"]):null}
 get name(){return `${RARITIES[this.rarity].n} · ${this.base.name}`}
 desc(){return `${this.name}\nDégâts: ${Math.round(this.base.damage*this.bonus)} · Cadence: ${((this.extra==="speed"?1.12:1)/(this.base.rate+(this.base.charge||0))).toFixed(2)}/s${this.type==="laser"?"\nCharge : 1,4 s de base · Rayon perforant":""}${this.type==="axe"?"\nFrappe à 360° · Déplacement −25%":""}${this.extra?`\nBonus: ${{crit:"+6 points de critique",speed:"+12% vitesse d’attaque",life:"+3% vol de vie",element:"+10% dégâts élémentaires"}[this.extra]}`:""}`}
}
class Player{
 constructor(){
  const meta=coopBuildMeta||loadMeta(); this.x=W/2;this.y=H/2;this.r=15;this.maxHp=100+(meta.hp||0)*5;this.hp=this.maxHp;this.speed=235;
  this.incomingMul=1;this.cooldownMul=1;this.eliteBonus=0;this.damageMul=1;this.attackMul=1;this.crit=.08;this.critMul=1.8;this.armor=1;this.level=1;this.xp=0;this.need=60;this.gold=0;
  this.weapon=new Weapon(startingWeapons(meta).includes(meta.startWeapon)?meta.startWeapon:meta.bowUnlocked?"bow":"sword",0);this.reserveWeapon=new Weapon("sword",0);if(this.weapon.type==="sword")this.reserveWeapon=new Weapon("bow",0);this.reserveCool=0;this.swapCd=0;this.laserCharge=0;this.cool=0;this.inv=0;this.dashCd=0;this.dashCdMax=1.15;this.dashPower=650;this.dashing=0;
  this.extraProj=0;this.aoe=0;this.lifesteal=0;this.dodge=0;this.element=0;this.healMul=1;this.goldMul=1;this.explodeEvery=10;this.passives=[];this.kills=0;
  applyOwned(this,meta);this.spells=SPELLS.filter(s=>meta.owned?.includes(s.id)).map(s=>s.id);this.spellCd={};this.souls=[0,0,0];this.soulCd=[0,0,0];this.selectedSoul=0;this.ward=0;this.walkT=0;this.isMoving=false;this.aim=0;this.attackAnim=0;this.attackAnimMax=.15;this.trailTimer=0;this.dashAngle=0;
 }
 heal(v){if(this.downed)return;this.hp=Math.min(this.maxHp,this.hp+v*this.healMul)}
 hit(d){
  if(this.downed||this.ward>0||this.inv>0||this.dashing>0||Math.random()<this.dodge)return;
  d=Math.max(1,d*(this.incomingMul||1)-this.armor);if(game.boss&&!game.boss.dead)game.boss.damageTaken=(game.boss.damageTaken||0)+d;this.hp-=d;this.inv=.55;game.shake=Math.max(game.shake,5);game.texts.push(new FloatText(this.x-10,this.y-24,`-${Math.round(d)}`,"#ff6b6b"));burst(this.x,this.y,"#c33",8);
  audio("hurt"); if(this.hp<=0){if(coop?.active)coopDown(this);else game.gameOver();}
 }
 gainXp(v){this.xp+=v;while(this.xp>=this.need){this.xp-=this.need;this.level++;this.need=Math.round(this.need*1.32);game.levelUp()}}
 update(dt){
  for(const id of Object.keys(this.spellCd))this.spellCd[id]=Math.max(0,this.spellCd[id]-dt);this.soulCd=this.soulCd.map(c=>Math.max(0,c-dt));this.ward=Math.max(0,this.ward-dt);this.cool-=dt;this.reserveCool=Math.max(0,(this.reserveCool||0)-dt);this.swapCd=Math.max(0,(this.swapCd||0)-dt);this.inv-=dt;this.dashCd-=dt;this.dashing-=dt;this.attackAnim=Math.max(0,this.attackAnim-dt);this.trailTimer-=dt;
  let dx=(keys.d||keys.arrowright?1:0)-(keys.q||keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.z||keys.w||keys.arrowup?1:0);let l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  this.isMoving=!!(dx||dy);if(this.isMoving)this.walkT+=dt*(this.dashing>0?18:9);
  this.aim=Math.atan2(mouse.y-this.y,mouse.x-this.x);
  const sp=this.dashing>0?this.dashPower*(this.weapon.base.moveMul||1):movementSpeed(this);moveEntity(this,(this.dashing>0?Math.cos(this.dashAngle):dx)*sp*dt,(this.dashing>0?Math.sin(this.dashAngle):dy)*sp*dt);
  if(this.dashing>0){
   if(this.trailTimer<=0){game.trails.push({x:this.x,y:this.y,life:.24,max:.24});this.trailTimer=.035}
   if(Math.random()<.78)game.particles.push(new Particle(this.x-rnd(-5,5),this.y-rnd(-5,5),"#6ccfff",.28,irnd(3,6)));
  }
  if(this.weapon.type==="laser")this.updateLaser(dt);else if(mouse.down)this.attack();if(mouse.right)this.castSoul();
 }
 attack(){
  if(this.cool>0||game.paused||this.weapon.type==="laser")return;const w=this.weapon.base,a=this.aim;this.cool=w.rate/(this.attackMul*(this.weapon.extra==="speed"?1.12:1));
  this.attackAnimMax=w.kind==="melee"?Math.min(.26,Math.max(.11,w.rate*.48)):.13;this.attackAnim=this.attackAnimMax;
  if(w.kind==="melee"){
   for(const e of game.enemies){if(e.dead)continue;let d=dist(this,e),da=Math.abs(angleDiff(a,Math.atan2(e.y-this.y,e.x-this.x)));if(d<w.range+e.r&&(w.arc>=Math.PI*2||da<w.arc/2))e.hit(this.damage(w.damage*this.weapon.bonus),a,w.knock,attackSource(this))}
   game.slashes.push({x:this.x,y:this.y,a,range:w.range,arc:w.arc,life:.18,max:.18,heavy:this.weapon.type==="great"||this.weapon.type==="axe"});
  }else{
   let count=1+this.extraProj;for(let i=0;i<count;i++){let off=(i-(count-1)/2)*.11;game.projectiles.push(new Projectile(this.x+Math.cos(a)*25,this.y+Math.sin(a)*25,a+off,w.speed,this.damage(w.damage*this.weapon.bonus),"player",w.kind==="magic"?"#9b70ff":"#e7d5a1",w.kind==="magic"?7:4,attackSource(this)))}
   if(w.kind==="magic")burst(this.x+Math.cos(a)*34,this.y+Math.sin(a)*34,"#9b70ff",5);
  }audio("attack");
 }
 damage(v){v*=this.weapon.extra==="element"?1.1:1;return Math.random()<Math.min(.85,this.crit+(this.weapon.extra==="crit"?.06:0))?v*this.damageMul*this.critMul:v*this.damageMul}
 dash(){
  if(this.dashCd>0)return;let dx=(keys.d||keys.arrowright?1:0)-(keys.q||keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.z||keys.w||keys.arrowup?1:0);if(!dx&&!dy){dx=Math.cos(this.aim);dy=Math.sin(this.aim)}
  this.dashAngle=Math.atan2(dy,dx);this.dashing=.16;this.dashCd=this.dashCdMax;this.trailTimer=0;burst(this.x,this.y,"#75d7ff",14)
 }
 draw(){
  const bob=this.isMoving&&this.dashing<=0?Math.sin(this.walkT)*2.2:0;
  const dashStretch=this.dashing>0?1.12:1;
  const tilt=this.dashing>0?Math.sin(this.dashAngle)*.09:Math.sin(this.walkT*.5)*.025;
  X.save();X.translate(this.x,this.y+bob);X.rotate(tilt);X.scale(dashStretch,1/dashStretch);
  X.shadowBlur=18;X.shadowColor="#4fa8d8";
  const blink=this.inv>0&&Math.floor(this.inv*15)%2;X.globalAlpha=blink?.45:1;
  drawCreature("player",0,0,44,this.walkT,"#65e0d1",this.look||playerLook);
  X.restore();X.globalAlpha=1;X.shadowBlur=0;
  drawEquippedWeapon(this,bob);
  if(this.weapon.type==='laser'&&this.laserCharge>0){const q=this.laserCharge/laserChargeTime(this),x=this.x+Math.cos(this.aim)*39,y=this.y+Math.sin(this.aim)*39;X.save();X.shadowBlur=14;X.shadowColor='#8feaff';X.fillStyle='#baf6ff';X.beginPath();X.arc(x,y,3+q*5,0,Math.PI*2);X.fill();X.restore();}
 }
}
Player.prototype.swapWeapon=function(fromInventory=false){
 if(!this.reserveWeapon||this.hp<=0||(game.paused&&!fromInventory)||this.swapCd>0)return false;
 [this.weapon,this.reserveWeapon]=[this.reserveWeapon,this.weapon];[this.cool,this.reserveCool]=[this.reserveCool||0,Math.max(0,this.cool)];this.laserCharge=0;this.attackAnim=0;this.swapCd=.18;mouse.down=false;saveRun();return true;
};
function attackSource(p){return {coopOwner:p.coopId,weapon:p.weapon.type,life:p.weapon.extra==='life'?.03:0,burn:p.element?12*p.damageMul:0};}
function hydrateWeapon(w){if(!w||!WEAPONS[w.type])return null;const weapon=Object.assign(new Weapon(w.type,w.rarity),w);weapon.base=WEAPONS[w.type];return weapon;}
function equipDrop(d){
 const p=game.player,old=p.weapon; p.laserCharge=0;
 if(!p.reserveWeapon){p.reserveWeapon=old;p.reserveCool=Math.max(0,p.cool);}else game.drops.push({type:'weapon',weapon:old,cool:Math.max(0,p.cool),x:clamp(p.x+45,85,W-85),y:p.y,r:13,taken:false});
 p.weapon=d.weapon;p.cool=Math.max(0,d.cool||0);p.attackAnim=0;
}
function drawWeaponSlots(){const p=game.player,html=`<div><small>ACTIVE</small><img src="${WEAPON_SPRITE_PATHS[p.weapon.type]}" alt=""><b>${p.weapon.base.name}</b></div><div><small>RÉSERVE</small>${p.reserveWeapon?`<img src="${WEAPON_SPRITE_PATHS[p.reserveWeapon.type]}" alt=""><b>${p.reserveWeapon.base.name}</b>`:'<b>Emplacement vide</b>'}</div><span>Tab · Échanger</span>`;if($('#weaponSlots').innerHTML!==html)$('#weaponSlots').innerHTML=html;}
function applyBurn(e,damage,source=null){if(e.dead||e.phaseShift>0)return;const wasBurning=e.burnLeft>0;e.burnLeft=3;e.burnTick=e.burnTick||.5;e.burnDamage=wasBurning?Math.max(e.burnDamage||0,damage):damage;e.burnSource=source;}
function overload(e,damage){
 if(e.dead||e.phaseShift>0||!(e.burnLeft>0))return false;e.burnLeft=0;e.burnDamage=0;
 game.stats.combos=(game.stats.combos||0)+1;checkChallenges();spellEffect({type:'fire',x:e.x,y:e.y,r:100,color:'#ffdf83',life:.6});burst(e.x,e.y,'#ffdf83',22);spellNotice('SURCHARGE · Feu + Foudre');
 const targets=game.enemies.filter(o=>!o.dead&&dist(e,o)<100+o.r);for(const o of targets)o.hit(damage,Math.atan2(o.y-e.y,o.x-e.x),100,{element:'overload'});return true;
}
function statusTick(e,dt){
 e.slowLeft=Math.max(0,(e.slowLeft||0)-dt);
 if(e.burnLeft>0){e.burnLeft=Math.max(0,e.burnLeft-dt);e.burnTick=(e.burnTick||.5)-dt;if(e.burnTick<=0){e.burnTick=.5;e.hit((e.burnDamage||0)*.5,0,0,{weapon:e.burnSource,element:'burn'});}}
 return e.dead||game.paused;
}
function enemySpeed(e){return e.speed*(e.slowLeft>0?(e instanceof Boss?.75:.45):1);}
function drawStatuses(e){if(e.dead)return;X.save();X.lineWidth=2;for(const [active,color,offset] of [[e.burnLeft>0,'#ff9856',4],[e.slowLeft>0,'#d5c486',8]])if(active){X.strokeStyle=color;X.beginPath();X.arc(e.x,e.y,e.r+offset,0,Math.PI*2);X.stroke();}X.restore();}
class Enemy{
 constructor(type,x,y,elite=false){
  this.type=type;this.x=x;this.y=y;this.r=type==="tank"?20:14;let [hp,sp,dmg]=ENEMY[type],scale=difficulty(game.floor).hp;
  this.maxHp=this.hp=hp*scale*(elite?1.9:1);this.speed=sp*difficulty(game.floor).speed;this.damage=dmg*difficulty(game.floor).damage*(elite?1.35:1);this.elite=elite;
  this.cool=rnd(.2,1);this.dead=false;this.flash=0;this.spawn=.5;this.phase=rnd(0,10);this.animT=rnd(0,10);this.hitKick=0
 }
 hit(d,a,k=80,source=null){
  if(this.dead||this.phaseShift>0)return;if(this instanceof Boss&&(this.bossPhase||1)===1&&this.hp>this.maxHp*.5)d=Math.min(d,this.hp-this.maxHp*.5);
  this.lastHitWeapon=source?.weapon||null;
  let crit=d>this.weaponBaseGuess()*1.5;if(this.dead)return;this.hp-=d;this.flash=.1;this.hitKick=.12;this.x+=Math.cos(a)*k*.035;this.y+=Math.sin(a)*k*.035;game.stats.damage+=d;
  game.texts.push(new FloatText(this.x,this.y-20,Math.round(d),crit?"#ffd85c":"#fff"));burst(this.x,this.y,this.elite?"#c85cff":"#c45b55",5);if(d>32)game.shake=Math.max(game.shake,4);
  const leech=game.player.lifesteal+(source?.life||0);if(leech)game.player.heal(Math.min(d,Math.max(0,this.hp+d))*leech); if(source?.burn&&!this.dead)applyBurn(this,source.burn,source.weapon);if(this.hp<=0)this.die();else if(this instanceof Boss&&(this.bossPhase||1)===1&&this.hp<=this.maxHp*.5)this.beginSecondPhase()
 }
 weaponBaseGuess(){return game.player.weapon.base.damage*game.player.damageMul}
 die(){
  if(this.dead)return;this.dead=true;game.player.kills++;game.stats.kills++;if(this.lastHitWeapon){game.stats.weaponKills=game.stats.weaponKills||{};game.stats.weaponKills[this.lastHitWeapon]=(game.stats.weaponKills[this.lastHitWeapon]||0)+1;}checkChallenges();if(coop?.active)for(const p of game.coopPlayers)coopAs(p,()=>p.gainXp(this.elite?32:14));else game.player.gainXp(this.elite?32:14);burst(this.x,this.y,this.elite?"#bf67ff":"#8e3e43",18);audio("death");
  if(Math.random()<.55){let n=irnd(2,8)*(this.elite?3:1);awardGold(n*30*difficulty(game.floor).gold)}
  if(Math.random()<(this.elite?.18:.055))game.drops.push(makeDrop(this.x,this.y));
  if(game.player.kills%game.player.explodeEvery===0){for(const e of game.enemies)if(!e.dead&&dist(this,e)<130)e.hit(25*(1+game.player.aoe),0,130);burst(this.x,this.y,"#ff9c44",28)}
  game.checkClear()
 }
 update(dt){
  if(this.dead||statusTick(this,dt))return;if(this.stun>0){this.stun=Math.max(0,this.stun-dt);return;}this.flash-=dt;this.spawn-=dt;this.cool-=dt;this.hitKick=Math.max(0,this.hitKick-dt);this.animT+=dt*(this.type==="bat"?12:6);if(this.spawn>0)return;
  const p=game.player,d=dist(this,p);if(d>560)return;let a=Math.atan2(p.y-this.y,p.x-this.x),dx=0,dy=0;
  if(this.type==="oracle"&&this.cool<=0){this.cool=3.3;for(let i=0;i<5;i++)game.projectiles.push(new Projectile(this.x,this.y,a+(i-2)*.23,220,this.damage,"enemy","#ba9dff",5));}
  if(this.type==="bomber"&&d<115&&this.cool<=0){this.cool=3;game.hazards.push({x:p.x,y:p.y,r:68,t:1.4,armed:.85,damage:this.damage});}
  if(this.type==="sentinel"&&this.cool<=0){this.cool=2.8;this.chargeAngle=a;this.charge=.65;}
  if(this.charge>0){this.charge-=dt;if(this.charge<.4)moveEntity(this,Math.cos(this.chargeAngle)*470*(this.slowLeft>0?.45:1)*dt,Math.sin(this.chargeAngle)*470*(this.slowLeft>0?.45:1)*dt);if(d<45)p.hit(this.damage);return;}
  if(this.type==="wraith"){a+=Math.sin(this.animT)*.6;}
  if(this.type==="archer"||this.type==="mage"||this.type==="oracle"){
   let desired=this.type==="archer"?260:220;if(d>desired+30){dx=Math.cos(a);dy=Math.sin(a)}else if(d<desired-35){dx=-Math.cos(a);dy=-Math.sin(a)}
   if(this.cool<=0&&d<480){this.cool=this.type==="mage"?1.25:1.45;game.projectiles.push(new Projectile(this.x,this.y,a,this.type==="mage"?330:390,this.damage,"enemy",this.type==="mage"?"#b35cff":"#e06b58",6));if(this.type==="mage"&&Math.random()<.3){this.x=clamp(this.x+rnd(-150,150),90,W-90);this.y=clamp(this.y+rnd(-110,110),90,H-90)}}
  } else {
   let wob=this.type==="bat"?Math.sin(performance.now()/180+this.phase)*.8:0;dx=Math.cos(a+wob);dy=Math.sin(a+wob);
   if(d<this.r+p.r+7&&this.cool<=0){p.hit(this.damage);this.cool=.8}
  }
  // séparation
  for(const o of game.enemies)if(o!==this&&!o.dead){let dd=dist(this,o);if(dd>0&&dd<this.r+o.r+8){dx+=(this.x-o.x)/dd*.6;dy+=(this.y-o.y)/dd*.6}}
  let l=Math.hypot(dx,dy)||1;moveEntity(this,dx/l*enemySpeed(this)*dt,dy/l*enemySpeed(this)*dt)
 }
 draw(){
  if(this.dead)return;
  const spawnScale=clamp(1-this.spawn*1.4,.2,1),bob=Math.sin(this.animT+this.phase)*(this.type==="bat"?4:1.5),hitScale=this.hitKick>0?1.12:1;
  const size=(this.type==="tank"?56:43)*spawnScale*hitScale;
  X.save();X.globalAlpha=clamp(1-this.spawn*1.5,.15,1);
  if(this.elite){X.shadowBlur=22+Math.sin(this.animT)*4;X.shadowColor="#c05cff"}
  if(this.flash>0){X.fillStyle="#fff";X.beginPath();X.arc(this.x,this.y+bob,this.r+5,0,Math.PI*2);X.fill()}
  drawCreature(this.type,this.x,this.y+bob,size,this.animT,this.elite?"#e2abff":null);
  X.shadowBlur=0;X.restore();
  let bw=Math.max(30,this.r*2.6);X.fillStyle="#211";X.fillRect(this.x-bw/2,this.y-size/2+bob-10,bw,5);X.fillStyle=this.elite?"#be5cff":"#d95353";X.fillRect(this.x-bw/2,this.y-size/2+bob-10,bw*clamp(this.hp/this.maxHp,0,1),5);X.globalAlpha=1
 }
}
function pointSegmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;if(!len)return dist(p,a);const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/len,0,1);return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function drawBossIntent(b){
 const a=b.action;X.save();X.strokeStyle='#ffbf85';X.fillStyle='#f99a5025';X.lineWidth=3;X.setLineDash([8,5]);
 if(b.phaseShift>0){X.strokeStyle='#fff1a4';X.beginPath();X.arc(b.x,b.y,b.r+18,0,Math.PI*2);X.stroke();}
 if(a?.type==='charge'){const length=b.bossPhase===2?255:190;X.beginPath();X.moveTo(b.x,b.y);X.lineTo(b.x+Math.cos(a.angle)*length,b.y+Math.sin(a.angle)*length);X.stroke();}
 const circles=a?.points||((a?.type==='shockwave')?[a]:[]);for(const q of circles){X.beginPath();X.arc(q.x,q.y,a.r,0,Math.PI*2);X.fill();X.stroke();}
 if(a?.type==='volley'){X.strokeStyle='#cfb4fa';X.beginPath();X.arc(b.x,b.y,62,0,Math.PI*2);X.stroke();}
 X.restore();
}
class Boss extends Enemy{
 constructor(kind,x,y){super("tank",x,y,true);this.kind=kind;this.r=34;this.maxHp=this.hp=505*difficulty(game.floor).hp;this.speed=65*difficulty(game.floor).speed;this.damage=22*difficulty(game.floor).damage;this.bossPhase=1;this.phaseShift=0;this.action=null;this.pattern=0;this.damageTaken=0;this.cool=1;this.special=2;this.name=["Chevalier Corrompu","Mage du Néant","Créature du Labyrinthe"][kind]}
 beginSecondPhase(){
  if(this.bossPhase===2)return;this.bossPhase=2;this.phaseShift=1.2;this.action=null;this.special=1;this.pattern=0;this.spiralBursts=0;
  spellNotice(`${this.name} · PHASE II — ${['Rage du chevalier','Constellation brisée','Prison de racines'][this.kind]}`);burst(this.x,this.y,'#f6ce86',30);
 }
 planAttack(){
  const p=game.player,phase=this.bossPhase||1,index=this.pattern||0;this.pattern=index+1;
  if(this.kind===0){this.action=phase===2&&index%2?{type:'shockwave',x:this.x,y:this.y,r:155,left:1}:{type:'charge',angle:Math.atan2(p.y-this.y,p.x-this.x),left:phase===2?.7:1,again:phase===2?1:0};}
  if(this.kind===1){this.action=phase===2&&index%2?{type:'sigils',points:[-125,0,125].map(dx=>({x:clamp(p.x+dx,115,W-115),y:clamp(p.y,115,H-115)})),r:60,left:1.1}:{type:'volley',left:.85};}
  if(this.kind===2){
   const points=phase===1?Array.from({length:3},()=>({x:rnd(130,W-130),y:rnd(130,H-130)})):index%2?Array.from({length:5},(_,i)=>{const a=Math.atan2(p.y-this.y,p.x-this.x);return{x:clamp(this.x+Math.cos(a)*(i+1)*75,110,W-110),y:clamp(this.y+Math.sin(a)*(i+1)*75,110,H-110)};}):Array.from({length:8},(_,i)=>({x:clamp(p.x+Math.cos(i*Math.PI/4)*130,110,W-110),y:clamp(p.y+Math.sin(i*Math.PI/4)*130,110,H-110)}));
   this.action={type:'roots',points,r:phase===2?43:50,left:1};
  }
 }
 resolveAttack(){
  const action=this.action,p=game.player;if(!action)return;this.action=null;
  if(action.type==='charge'){
   const from={x:this.x,y:this.y},distance=this.bossPhase===2?255:190;
   moveEntity(this,Math.cos(action.angle)*distance,Math.sin(action.angle)*distance);
   for(const target of coop?.active?game.coopPlayers.filter(p=>!p.downed):[p])if(pointSegmentDistance(target,from,this)<this.r+target.r+8)target.hit(this.damage*1.25);
   spellEffect({type:'laser',x:from.x,y:from.y,endX:this.x,endY:this.y,color:'#f59b77',life:.25});
   if(action.again&&!this.dead)this.action={type:'charge',angle:Math.atan2(p.y-this.y,p.x-this.x),left:.7,again:0};
  }
  if(action.type==='shockwave'){for(const target of coop?.active?game.coopPlayers.filter(p=>!p.downed):[p])if(dist(action,target)<action.r+target.r)target.hit(this.damage*1.3);spellEffect({type:'earth',x:action.x,y:action.y,r:action.r,color:'#f3b16f',life:.65});}
  if(action.type==='volley'){this.fireVolley(0);if(this.bossPhase===2){this.spiralBursts=2;this.spiralTimer=.3;}}
  if(action.points){for(const q of action.points){game.hazards.push({x:q.x,y:q.y,r:action.r,t:.4,armed:0,damage:this.damage});spellEffect({type:action.type==='roots'?'earth':'fire',x:q.x,y:q.y,r:action.r,color:this.kind===1?'#bc96f3':'#c2d897',life:.55});}}
  this.special=this.bossPhase===2?1.15:1.8;
 }
 fireVolley(offset){const count=this.bossPhase===2?12:8;for(let i=0;i<count;i++)game.projectiles.push(new Projectile(this.x,this.y,i*Math.PI*2/count+offset,220,this.damage*.65,'enemy','#bb94f4',6));}
 update(dt){
  if(this.dead||statusTick(this,dt))return;this.flash-=dt;this.animT+=dt*3.4;this.spawn-=dt;this.hitKick=Math.max(0,this.hitKick-dt);
  if((this.bossPhase||1)===1&&this.hp<=this.maxHp*.5)this.beginSecondPhase();
  if(this.phaseShift>0){this.phaseShift=Math.max(0,this.phaseShift-dt);return;}if(this.stun>0){this.stun=Math.max(0,this.stun-dt);return;}if(this.spawn>0)return;
  this.cool-=dt;
  if(this.spiralBursts>0){this.spiralTimer-=dt;if(this.spiralTimer<=0){this.fireVolley((3-this.spiralBursts)*.16);this.spiralBursts--;this.spiralTimer=.3;}}
  if(this.action){this.action.left-=dt;if(this.action.left<=0)this.resolveAttack();return;}
  this.special-=dt;if(this.special<=0){this.planAttack();return;}
  const p=game.player,a=Math.atan2(p.y-this.y,p.x-this.x),d=dist(this,p);
  if(this.kind!==1&&d>65)moveEntity(this,Math.cos(a)*enemySpeed(this)*dt,Math.sin(a)*enemySpeed(this)*dt);
  if(d<60&&this.cool<=0){p.hit(this.damage);this.cool=1;}
 }

 die(){if(this.dead)return;super.die();game.grantSoul(this.kind);game.stats.bosses++;if(this.damageTaken===0)game.stats.cleanBoss=true;checkChallenges();game.boss=null;game.room.cleared=true;game.room.locked=false;game.drops.push(makeDrop(this.x-25,this.y,"boss"));game.room.portal={x:this.x+30,y:this.y};game.drops.push({type:"exit",x:this.x+30,y:this.y,r:18});awardGold(1500*difficulty(game.floor).gold);game.bossChoice=true;game.projectiles=[];game.hazards=[];if(!game.paused)game.openBossChoice();audio("boss")}
 draw(){
  if(this.dead)return;
  drawBossIntent(this);const pulse=1+Math.sin(this.animT)*.035+(this.hitKick>0?.08:0),size=94*pulse;
  X.save();X.globalAlpha=clamp(1-this.spawn*1.5,.15,1);X.shadowBlur=30+Math.sin(this.animT)*7;X.shadowColor="#e34b62";
  X.strokeStyle="#b51835aa";X.lineWidth=3;X.beginPath();X.arc(this.x,this.y,53+Math.sin(this.animT)*5,0,Math.PI*2);X.stroke();
  if(this.flash>0){X.fillStyle="#fff";X.beginPath();X.arc(this.x,this.y,49,0,Math.PI*2);X.fill()}
  drawCreature(["knight","oracle","wraith"][this.kind],this.x,this.y,size,this.animT,["#efac79","#be9fff","#62dfc6"][this.kind]);
  X.restore();X.globalAlpha=1;
 }
}
class Room{
 constructor(x,y,type="normal"){this.gx=x;this.gy=y;this.type=type;this.visited=false;this.cleared=type==="start"||type==="shop";this.locked=false;this.spawned=false;this.chest=null;this.shop=null}
}
class DungeonGenerator{
 static make(floor){
  const rooms=new Map(),key=(x,y)=>x+","+y;let x=0,y=0;rooms.set(key(x,y),new Room(x,y,"start"));
  let target=9+Math.min(7,floor);for(let i=1;i<target;i++){let dirs=[[1,0],[-1,0],[0,1],[0,-1]],placed=false;for(let t=0;t<20&&!placed;t++){let [dx,dy]=pick(dirs),nx=x+dx,ny=y+dy;if(!rooms.has(key(nx,ny))){x=nx;y=ny;rooms.set(key(x,y),new Room(x,y,"enemy"));placed=true}else if(Math.random()<.35){x=nx;y=ny}}}
  let arr=[...rooms.values()],start=rooms.get("0,0");arr.sort((a,b)=>(Math.abs(b.gx)+Math.abs(b.gy))-(Math.abs(a.gx)+Math.abs(a.gy)));arr[0].type="boss";
  for(const r of arr.slice(1)){if(r===start)continue;let q=Math.random();r.type=q<.10?"shop":q<.22?"chest":q<.31?"trap":q<.40?"elite":"enemy"}
  return rooms
 }
}
class Game{
 constructor(floor=1){
  this.runId=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;this.floor=floor;this.rooms=DungeonGenerator.make(floor);this.room=this.rooms.get("0,0");this.room.visited=true;this.player=new Player();this.enemies=[];this.projectiles=[];this.particles=[];this.texts=[];this.slashes=[];this.trails=[];this.drops=[];this.hazards=[];this.paused=false;this.shake=0;this.start=performance.now();this.stats={kills:0,bosses:0,damage:0,gold:0};this.boss=null;this.enterRoom(this.room,true)
 }
 enterRoom(r,first=false){
  if(!first&&this.room)this.room.loot=this.drops.filter(d=>!d.taken&&d.type!=="exit");this.player.laserCharge=0;this.spellEffects=[];this.room=r;r.visited=true;this.enemies=[];this.projectiles=[];this.trails=[];this.drops=r.loot||[];this.hazards=[];this.boss=null;this.player.x=W/2;this.player.y=H/2;
  if(!r.spawned){r.spawned=true;if(r.type==="boss"){let b=new Boss((this.floor-1)%3,W/2,H/2-120);this.enemies=[b];this.boss=b;r.locked=true}
   else if(["enemy","elite","trap"].includes(r.type)){let n=irnd(4,6)+Math.min(8,Math.floor(this.floor/2));for(let i=0;i<n;i++){let types=Object.keys(ENEMY),e=new Enemy(pick(types),rnd(150,W-150),rnd(130,H-130),r.type==="elite"&&i===0||Math.random()<Math.min(.85,Math.min(.55,.025+(this.floor-1)*.045)+(this.player.eliteBonus||0)));this.enemies.push(e)}r.locked=true}
   else if(r.type==="chest"){r.chest={x:W/2,y:H/2-40,open:false,rare:Math.random()<.3}}
   else if(r.type==="shop"){r.shop=[makeDrop(W/2-150,H/2-30),makeDrop(W/2,H/2-30),makeCurseDrop(W/2+150,H/2-30)];for(const d of r.shop)d.price=Math.round((22+this.floor*4)*30*difficulty(this.floor).gold*RARITIES[d.weapon?.rarity||0].m)}
  }
  if(r.portal)this.drops.push({type:"exit",x:r.portal.x,y:r.portal.y,r:18});if(r.type==="trap")for(let i=0;i<5;i++)this.hazards.push({x:rnd(150,W-150),y:rnd(130,H-130),r:32,t:999,armed:0,spike:true});
  audio("room");saveRun()
 }
 checkClear(){if(this.enemies.every(e=>e.dead)){this.room.cleared=true;this.room.locked=false}}
 levelUp(){
  this.pendingLevels=(this.pendingLevels||0)+1;if(this.paused)return;this.openLevel();
 }
 openLevel(){
  this.pendingLevels--;this.levelChoice=true;this.paused=true;let opts=[...UPGRADES].sort(()=>Math.random()-.5).slice(0,3);showModal(`<h2>Niveau ${this.player.level}</h2><p>Choisis une amélioration.</p><div class="choices">${opts.map((u,i)=>`<button data-up="${i}"><b>${u[0]}</b><br><small>${u[1]}</small></button>`).join("")}</div>`);
  $("#modalCard").querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{opts[+b.dataset.up][2](this.player);this.levelChoice=false;hideModal();this.paused=false;audio("level");saveRun();if(this.pendingLevels>0)this.openLevel();else if(this.bossChoice)this.openBossChoice();else saveRun()})
 }
 update(dt){
  if(this.paused)return;for(const fx of this.spellEffects||[])fx.life-=dt;this.spellEffects=(this.spellEffects||[]).filter(fx=>fx.life>0);this.player.update(dt);if(this.paused)return;for(const e of this.enemies){e.update(dt);if(this.paused)return;}for(const p of this.projectiles){p.update(dt);if(this.paused)return;}for(const p of this.particles)p.update(dt);for(const t of this.texts)t.update(dt);for(const tr of this.trails)tr.life-=dt;
  this.projectiles=this.projectiles.filter(p=>p.life>0);this.particles=this.particles.filter(p=>p.life>0);this.texts=this.texts.filter(t=>t.life>0);this.trails=this.trails.filter(t=>t.life>0);this.slashes.forEach(s=>s.life-=dt);this.slashes=this.slashes.filter(s=>s.life>0);
  this.hazards=this.hazards.filter(h=>h.t>0);for(const h of this.hazards){h.t-=dt;if(h.armed>0)h.armed-=dt;if(h.t>0&&h.armed<=0&&dist(h,this.player)<h.r+this.player.r){this.player.hit(h.damage||(h.spike?10:16)*difficulty(this.floor).damage);h.armed=h.spike?.8:99}}
  if(this.paused)return;this.handleDoors();this.handleInteraction();this.shake*=.88;updateHud()
 }
 handleDoors(){
  if(this.room.locked)return;

  // moveEntity() bloque le centre du joueur a environ 80 px du bord.
  // On detecte donc le passage avant cette limite, uniquement face a une vraie ouverture.
  const edge=88, doorHalf=58;
  let dx=0,dy=0;
  const nearHorizontalDoor=Math.abs(this.player.y-H/2)<doorHalf;
  const nearVerticalDoor=Math.abs(this.player.x-W/2)<doorHalf;

  if(this.player.x<edge && nearHorizontalDoor) dx=-1;
  else if(this.player.x>W-edge && nearHorizontalDoor) dx=1;
  else if(this.player.y<edge && nearVerticalDoor) dy=-1;
  else if(this.player.y>H-edge && nearVerticalDoor) dy=1;
  if(!dx&&!dy)return;

  const nr=this.rooms.get((this.room.gx+dx)+","+(this.room.gy+dy));
  if(nr){
   this.enterRoom(nr);
   // Eloigne Hugo du seuil pour eviter un retour instantane dans la salle precedente.
   this.player.x=dx<0?W-115:dx>0?115:W/2;
   this.player.y=dy<0?H-115:dy>0?115:H/2;
  }
 }
 handleInteraction(){
  if(!keys.ePress)return;keys.ePress=false;
  if(this.room.chest&&!this.room.chest.open&&dist(this.player,this.room.chest)<70){this.room.chest.open=true;this.drops.push(makeDrop(this.room.chest.x,this.room.chest.y+35,this.room.chest.rare?"rare":null));audio("chest");saveRun();return;}
  const d=[...this.drops,...(this.room.shop||[])].filter(d=>!d.taken&&!d.bought&&(!coop?.active||d.type==="exit"||d.coopOwner===this.player.coopId)&&dist(this.player,d)<(d.price?60:55)).sort((a,b)=>dist(this.player,a)-dist(this.player,b))[0];
  if(!d)return;if(d.item&&isCurse(d.item[0])&&this.player.passives.includes(d.item[0])){spellNotice("Cette relique maudite est déjà liée à toi.");return;}if(d.type==='exit'){this.openBossChoice();return;}
  if(d.price){if(this.player.gold<d.price){spellNotice('Pas assez de pièces d’or.');return;}this.player.gold-=d.price;d.bought=true;}pickup(d);

 }
 nextFloor(){this.bossChoice=false;this.paused=false;hideModal();this.floor++;checkChallenges();let p=this.player,stats=this.stats,start=this.start;this.rooms=DungeonGenerator.make(this.floor);this.room=this.rooms.get("0,0");this.room.visited=true;this.enemies=[];this.projectiles=[];this.drops=[];this.hazards=[];this.enterRoom(this.room);this.player=p;this.stats=stats;this.start=start;this.player.x=W/2;this.player.y=H/2;audio("floor");saveRun()}
 gameOver(){
  this.paused=true;let secs=Math.floor((performance.now()-this.start)/1000),shards=Math.max(1,Math.floor(this.floor/2)+this.stats.bosses*3+Math.floor(this.stats.kills/20));let m=loadMeta();m.shards=(m.shards||0)+shards;localStorage.setItem(META,JSON.stringify(m));localStorage.removeItem(SAVE);
  showModal(`<h2>La nuit t'a englouti</h2><p>Étage atteint : <b>${this.floor}</b> · Ennemis : <b>${this.stats.kills}</b> · Boss : <b>${this.stats.bosses}</b></p><p>Survie : <b>${Math.floor(secs/60)}m ${secs%60}s</b> · Dégâts : <b>${Math.round(this.stats.damage)}</b> · Or récolté : <b>${this.stats.gold}</b></p><p>Éclats gagnés : <b>${shards}</b></p><button data-go="retry">Rejouer</button><button data-go="menu">Menu principal</button>`);
  $("#modalCard [data-go=retry]").onclick=()=>startGame();$("#modalCard [data-go=menu]").onclick=()=>mainMenu()
 }
 draw(){
  X.save();X.clearRect(0,0,W,H);const shake=JSON.parse(localStorage.getItem(SETTINGS)||'{"shake":true}').shake?this.shake:0;X.translate(rnd(-shake,shake),rnd(-shake,shake));drawRoom(this.room);
  for(const h of this.hazards)drawHazard(h);if(this.room.chest)drawChest(this.room.chest);if(this.room.shop)for(const d of this.room.shop)if(!d.bought)drawDrop(d);
  for(const d of this.drops)if(!d.taken)drawDrop(d);
  for(const tr of this.trails){X.save();X.globalAlpha=.28*(tr.life/tr.max);drawCreature("player",tr.x,tr.y,42,0,"#65d6ff");X.restore()}
  for(const e of this.enemies){e.draw();drawStatuses(e);}for(const p of this.projectiles)p.draw();this.player.draw();if(coop?.active)for(const p of this.coopPlayers||[])if(p!==this.player)p.draw();
  for(const s of this.slashes){let k=s.life/s.max;X.save();X.globalAlpha=k;X.strokeStyle=s.heavy?"#ffd27a":"#f3e2b4";X.lineWidth=s.heavy?9:5;X.shadowBlur=s.heavy?18:8;X.shadowColor=s.heavy?"#ff9a4a":"#f3e2b4";X.beginPath();X.arc(s.x,s.y,s.range,s.a-s.arc/2,s.a+s.arc/2);X.stroke();X.globalAlpha=k*.35;X.lineWidth=2;X.beginPath();X.arc(s.x,s.y,s.range+10,s.a-s.arc/2,s.a+s.arc/2);X.stroke();X.restore()}
  for(const p of this.particles)p.draw();for(const t of this.texts)t.draw();X.restore();drawLighting();drawAtmosphere();drawMinimap()
 }
}
function drawPortraitSprite(img,x,y,w,h,border="#fff",circle=true){
 X.save();
 if(circle){
  X.beginPath();X.arc(x,y,Math.min(w,h)/2,0,Math.PI*2);X.clip();
 }
 if(img&&img.complete&&img.naturalWidth){
  const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const sw=w/scale,sh=h/scale,sx=(img.naturalWidth-sw)/2,sy=(img.naturalHeight-sh)/2;
  X.drawImage(img,sx,sy,sw,sh,x-w/2,y-h/2,w,h);
 }else{
  X.fillStyle="#6e7585";X.fillRect(x-w/2,y-h/2,w,h);
 }
 X.restore();
 if(circle){X.save();X.strokeStyle=border;X.lineWidth=2;X.beginPath();X.arc(x,y,Math.min(w,h)/2,0,Math.PI*2);X.stroke();X.restore()}
}

function drawImageContain(img,x,y,w,h,alpha=1){
 if(!img||!img.complete||!img.naturalWidth)return;
 const s=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*s,dh=img.naturalHeight*s;
 X.save();X.globalAlpha*=alpha;X.drawImage(img,x-dw/2,y-dh/2,dw,dh);X.restore();
}
function drawEquippedWeapon(p,bob=0){
 const type=p.weapon.type,img=WEAPON_SPRITES[type];if(!img||!img.complete||!img.naturalWidth)return;
 const a=p.aim,attacking=p.attackAnim>0,progress=attacking?1-p.attackAnim/p.attackAnimMax:0;
 let rot=a,ox=30,oy=bob,w=58,h=58;
 if(type==="sword"){rot=a+1.92;w=42;h=74;ox=30}
 else if(type==="great"){rot=a+1.92;w=52;h=92;ox=34}
 else if(type==="daggers"){rot=a;w=66;h=28;ox=31}
 else if(type==="staff"){rot=a+Math.PI;w=86;h=28;ox=38}
 else if(type==="bow"){rot=a;w=38;h=56;ox=28}
 else if(type==="axe"){rot=a+Math.PI/4;w=42;h=42;ox=25;if(attacking)rot+=progress*Math.PI*2;}
 else if(type==="laser"){rot=a+Math.PI/4;w=40;h=40;ox=24;}
 if(attacking&&p.weapon.base.kind==="melee")rot+=(-.72+1.44*(progress*progress*(3-2*progress)));
 if(attacking&&p.weapon.base.kind!=="melee")ox-=Math.sin(progress*Math.PI)*7;
 const cx=p.x+Math.cos(a)*ox,cy=p.y+Math.sin(a)*ox+oy;
 X.save();X.translate(cx,cy);X.rotate(rot);X.shadowBlur=10;X.shadowColor=RARITIES[p.weapon.rarity].c;
 drawImageContain(img,0,0,w,h,1);X.restore();
}
function drawWeaponPickup(weapon,x,y,size=42){
 const img=WEAPON_SPRITES[weapon.type],c=RARITIES[weapon.rarity].c,bob=Math.sin(performance.now()/260+x*.02)*3;
 X.save();X.translate(x,y+bob);X.shadowBlur=16;X.shadowColor=c;X.fillStyle=c+"33";X.beginPath();X.arc(0,0,size*.48,0,Math.PI*2);X.fill();
 let rot=0,w=size,h=size;
 if(weapon.type==="sword"||weapon.type==="great"){rot=1.92;w=size*.68;h=size*1.22}
 else if(weapon.type==="daggers"){w=size*1.25;h=size*.55}
 else if(weapon.type==="staff"){rot=Math.PI;w=size*1.35;h=size*.48}
 else if(weapon.type==="bow"){w=size*.6;h=size*1.05}
 X.rotate(rot);drawImageContain(img,0,0,w,h);X.restore();
}
function angleDiff(a,b){return Math.atan2(Math.sin(a-b),Math.cos(a-b))}
function insideRoom(x,y,p=0){return x>55+p&&x<W-55-p&&y>55+p&&y<H-55-p}
function moveEntity(e,dx,dy){e.x=clamp(e.x+dx,65+e.r,W-65-e.r);e.y=clamp(e.y+dy,65+e.r,H-65-e.r)}
function burst(x,y,c,n){for(let i=0;i<n;i++)game.particles.push(new Particle(x,y,c,rnd(.2,.65),irnd(2,5)))}
function rarityRoll(boost=0){let r=Math.random()-boost;if(r<.015)return 4;if(r<.06)return 3;if(r<.18)return 2;if(r<.42)return 1;return 0}
function makeDrop(x,y,forced=null){
 let meta=loadMeta(),rar=forced==="boss"?Math.max(2,rarityRoll(.15+(meta.rare||0)*.01)):forced==="rare"?Math.max(1,rarityRoll(.08)):rarityRoll((meta.rare||0)*.01);
 if(Math.random()<.72||forced)return{type:"weapon",x,y,r:13,weapon:new Weapon(pick(Object.keys(WEAPONS)),rar),taken:false};
 if(Math.random()<.3)return makeCurseDrop(x,y);let it=pick(PASSIVES);return{type:"passive",x,y,r:13,item:it,taken:false,rarity:rar}
}
function pickup(d){
 if(d.type==="weapon"){equipDrop(d);game.texts.push(new FloatText(game.player.x-40,game.player.y-30,d.weapon.base.name,RARITIES[d.weapon.rarity].c))}
 else if(d.type==="passive"){d.item[2](game.player);game.player.passives.push(d.item[0]);game.texts.push(new FloatText(game.player.x-40,game.player.y-30,d.item[0],"#d9c06c"))}
 d.taken=true;checkChallenges();audio("pickup");saveRun()
}
function drawRoomLegacy(r){
 X.fillStyle="#11141b";X.fillRect(0,0,W,H);for(let y=60;y<H-60;y+=32)for(let x=60;x<W-60;x+=32){X.fillStyle=((x+y)/32)%2?"#1a1d25":"#171a21";X.fillRect(x,y,31,31)}
 X.fillStyle="#30313a";X.fillRect(0,0,W,58);X.fillRect(0,H-58,W,58);X.fillRect(0,0,58,H);X.fillRect(W-58,0,58,H);
 let dirs=[[1,0,W-62,H/2-42,65,84],[-1,0,0,H/2-42,65,84],[0,1,W/2-42,H-62,84,65],[0,-1,W/2-42,0,84,65]];
 for(const [dx,dy,x,y,w,h] of dirs)if(game.rooms.has((r.gx+dx)+","+(r.gy+dy))){X.fillStyle=r.locked?"#642e35":"#090b10";X.fillRect(x,y,w,h);if(r.locked){X.fillStyle="#a94d54";for(let i=0;i<5;i++)X.fillRect(x+(w>h?i*17:8),y+(h>w?i*17:8),w>h?5:w-16,h>w?5:h-16)}}
 X.fillStyle="#9a8a6655";X.font="14px monospace";X.fillText(({start:"SANCTUAIRE",boss:"SALLE DU BOSS",shop:"MARCHAND",chest:"TRÉSOR",trap:"PIÈGES",elite:"ÉLITE",enemy:"CRYPTES"}[r.type]||"CRYPTES"),70,88)
}
function drawChest(c){X.fillStyle=c.open?"#5c4630":c.rare?"#466da5":"#8c683a";X.fillRect(c.x-22,c.y-15,44,30);X.fillStyle="#d7b85c";X.fillRect(c.x-3,c.y-8,6,12)}
function nearestDrop(range){return [...game.drops,...(game.room.shop||[])].filter(d=>!d.taken&&!d.bought&&d.type!=='exit'&&(!coop?.active||d.coopOwner===game.player.coopId)&&dist(game.player,d)<range).sort((a,b)=>dist(game.player,a)-dist(game.player,b))[0];}
function drawDrop(d){
 if(coop?.active&&d.type!=="exit"&&d.coopOwner!==game.player.coopId)return;
 if(d.type==="exit"){X.strokeStyle="#c9b66b";X.lineWidth=5;X.beginPath();X.arc(d.x,d.y,18,0,7);X.stroke();X.fillStyle="#fff";X.fillText("E",d.x-4,d.y+5);return}
 if(d.type==="weapon")drawWeaponPickup(d.weapon,d.x,d.y,44);
 else{
  const c=isCurse(d.item[0])?"#ef877b":RARITIES[d.rarity||0].c,bob=Math.sin(performance.now()/300+d.x)*3,icon=ITEM_SPRITES[ITEM_ART[d.item[0]]];
  X.save();X.translate(d.x,d.y+bob);X.shadowBlur=13;X.shadowColor=c;X.fillStyle='#10202cee';X.strokeStyle=c;X.lineWidth=2;X.fillRect(-23,-23,46,46);X.strokeRect(-23,-23,46,46);X.shadowBlur=0;
  if(icon?.complete&&icon.naturalWidth)drawImageContain(icon,0,0,36,36);else{X.fillStyle=c;X.font='bold 20px Georgia';X.textAlign='center';X.fillText(d.item[0][0],0,7);}X.restore();
 }
 if(nearestDrop(95)===d){X.save();X.textAlign='center';X.font='12px sans-serif';const label=d.type==='weapon'?d.weapon.base.name:d.item[0],width=X.measureText(label).width+16;X.fillStyle='#071117e8';X.fillRect(d.x-width/2,d.y-48,width,21);X.fillStyle='#edf0da';X.fillText(label,d.x,d.y-33);X.restore();}
 if(d.price){X.fillStyle="#e9c45b";X.font="12px monospace";X.fillText(money(d.price),d.x-18,d.y+31)}
}
function drawHazard(h){let active=h.armed<=0;X.strokeStyle=active?"#d94b4b":"#754646";X.fillStyle=active?"#7f242455":"#341f1f55";X.lineWidth=3;X.beginPath();X.arc(h.x,h.y,h.r,0,7);X.fill();X.stroke();if(h.spike){X.fillStyle="#a66";X.fillText("▲",h.x-6,h.y+5)}}
function drawLighting(){let g=X.createRadialGradient(game.player.x,game.player.y,90,game.player.x,game.player.y,390);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.36)");X.fillStyle=g;X.fillRect(0,0,W,H)}
function drawMinimap(){
 let m=$("#minimap"),c=m.getContext("2d");c.clearRect(0,0,m.width,m.height);let rs=[...game.rooms.values()].filter(r=>r.visited),s=18,ox=90,oy=70;
 for(const r of rs){let x=ox+r.gx*s,y=oy+r.gy*s;c.fillStyle=r===game.room?"#e5c76d":r.type==="boss"?"#a33":r.cleared?"#526477":"#39404d";c.fillRect(x-6,y-6,12,12)}
}
function updateHud(){
 if(performance.now()>(game.achievementUntil||0))$("#achievementToast").textContent="";
 let p=game.player;$("#hpBar").style.width=(100*p.hp/p.maxHp)+"%";$("#hpText").textContent=`${Math.ceil(p.hp)}/${Math.round(p.maxHp)}`;$("#xpBar").style.width=(100*p.xp/p.need)+"%";$("#levelText").textContent="Niv. "+p.level;
 $("#goldText").textContent=money(p.gold);$("#floorText").textContent="Étage "+game.floor+" · Menace "+game.floor;$("#roomText").textContent="La Crypte Oubliée · "+({start:"Sanctuaire",enemy:"Crypte",boss:"Gardien",elite:"Élite",shop:"Marchand",chest:"Reliquaire",trap:"Pièges"}[game.room.type]);let n=game.enemies.filter(e=>!e.dead).length;$("#enemyText").textContent=game.room.locked?`${n} ennemi${n>1?"s":""} restant${n>1?"s":""}`:"";
 $("#weaponText").textContent=p.weapon.name+(p.weapon.type==='axe'?' · Déplacement −25%':'');$("#chargeHud").classList.toggle("hidden",p.weapon.type!=="laser");if(p.weapon.type==="laser"){$("#chargeFill").style.width=(100*p.laserCharge/laserChargeTime(p))+"%";$("#chargeText").textContent=p.cool>0?"Refroidissement · "+p.cool.toFixed(1)+" s":p.laserCharge>0?"Charge · "+Math.round(100*p.laserCharge/laserChargeTime(p))+"%":"Maintiens le clic gauche · Laser";}$("#dashText").textContent=p.dashCd>0?"Dash : "+p.dashCd.toFixed(1)+"s":"Dash : prêt";
 $("#bossHud").classList.toggle("hidden",!game.boss||game.boss.dead);if(game.boss&&!game.boss.dead){$("#bossName").textContent=game.boss.name+" · PHASE "+(game.boss.bossPhase===2?"II":"I")+(game.boss.phaseShift>0?" · TRANSFORMATION":"");$("#bossBar").style.width=(100*game.boss.hp/game.boss.maxHp)+"%"}
 updateSoulHud();updateSpellHud();drawWeaponSlots();
 // tooltip
 let near=nearestDrop(90);
 if(near){const tooltip=$('#tooltip'),name=near.type==='weapon'?near.weapon.base.name:near.item[0];tooltip.classList.remove('hidden');tooltip.style.left='';tooltip.style.top='';tooltip.innerHTML=`${near.type==='weapon'?`<img class="item-icon" src="${WEAPON_SPRITE_PATHS[near.weapon.type]}" alt="">`:itemIcon(name)}<b>${isCurse(name)?'⚠ RELIQUE MAUDITE · ':''}${name}</b><small>${near.type==='weapon'?near.weapon.desc().replace(/\n/g,'<br>'):near.item[1]}</small><strong>[E] ${near.price?'Acheter · '+money(near.price):'Ramasser'}</strong>`;}else $('#tooltip').classList.add('hidden');

}
function showModal(html){if(game)game.player.laserCharge=0;keys.ePress=false;$("#tooltip").classList.add("hidden");mouse.down=false;mouse.right=false;$("#modalCard").onclick=null;$("#modalCard").innerHTML=html;$("#modal").classList.remove("hidden");$("#modalCard").scrollTop=0;$("#modal").scrollTop=0}
function hideModal(){$("#modal").classList.add("hidden")}
function startGame(){game=null;$("#achievementToast").textContent="";hideModal();$("#mainMenu").classList.add("hidden");$("#hud").classList.remove("hidden");game=new Game(1);saveRun()}
function mainMenu(){game=null;$("#achievementToast").textContent="";hideModal();$("#hud").classList.add("hidden");$("#mainMenu").classList.remove("hidden");$("#metaMoney").textContent=`Banque : ${money(loadMeta().bank)} · Éclats : ${loadMeta().shards||0}`;$('[data-action="continue"]').disabled=!localStorage.getItem(SAVE)}
function loadMeta(){try{return JSON.parse(localStorage.getItem(META))||{shards:0}}catch{return{shards:0}}}
function oldSaveRun(){if(!game)return;let p=game.player;localStorage.setItem(SAVE,JSON.stringify({floor:game.floor,hp:p.hp,maxHp:p.maxHp,gold:p.gold,level:p.level,xp:p.xp,need:p.need,weapon:{type:p.weapon.type,rarity:p.weapon.rarity},stats:game.stats}))}
function oldContinueRun(){let s;try{s=JSON.parse(localStorage.getItem(SAVE))}catch{}if(!s)return startGame();startGame();game.floor=s.floor;game.rooms=DungeonGenerator.make(s.floor);game.room=game.rooms.get("0,0");game.room.visited=true;game.enterRoom(game.room);let p=game.player;p.hp=Math.min(s.hp,s.maxHp);p.maxHp=s.maxHp;p.gold=s.gold;p.level=s.level;p.xp=s.xp;p.need=s.need;p.weapon=new Weapon(s.weapon.type,s.weapon.rarity);game.stats=s.stats||game.stats}
function audio(name){/* Crochet audio volontairement sûr : aucun fichier externe requis. */ }
function pauseMenu(){if(!game)return;saveRun();game.paused=true;showModal(`<h2>Pause</h2><button data-p="resume">Reprendre</button><button data-p="restart">Recommencer</button><button data-p="challenges">Défis & accessoires</button><button data-p="customize">Personnaliser le personnage</button><button data-p="options">Options</button><button data-p="menu">Retour menu principal</button>`);let c=$("#modalCard");c.querySelector("[data-p=resume]").onclick=()=>{hideModal();game.paused=false};c.querySelector("[data-p=restart]").onclick=()=>startGame();c.querySelector("[data-p=challenges]").onclick=challengesMenu;c.querySelector("[data-p=customize]").onclick=customization;c.querySelector("[data-p=options]").onclick=options;c.querySelector("[data-p=menu]").onclick=mainMenu}
function options(){let st=JSON.parse(localStorage.getItem(SETTINGS)||'{"shake":true}');showModal(`<h2>Options</h2><p><label><input id="shakeOpt" type="checkbox" ${st.shake?"checked":""}> Screen shake</label></p><button id="saveOpt">Enregistrer</button>`);$("#saveOpt").onclick=()=>{localStorage.setItem(SETTINGS,JSON.stringify({shake:$("#shakeOpt").checked}));hideModal();if(game)game.paused=false}}
function help(){showModal(`<h2>Comment jouer</h2><p><span class="kbd">ZQSD</span> déplacement · <span class="kbd">Souris</span> viser · <span class="kbd">Clic gauche</span> attaquer</p><p><span class="kbd">E</span> interagir · <span class="kbd">Espace</span> dash · <span class="kbd">I</span> inventaire · <span class="kbd">M</span> carte · <span class="kbd">Échap</span> pause</p><p>Nettoie les salles pour déverrouiller les portes. Chaque boss vaincu offre son pouvoir : 1 / 2 / 3 pour choisir, clic droit pour lancer. Les pouvoirs se cumulent pendant la partie et gagnent un rang à chaque nouvelle victoire. Après un boss, encaisse ton or au menu ou poursuis la descente. E près du portail rouvre ce choix. La mort fait perdre l’or non encaissé. Les achats de la boutique sont permanents et appliqués aux nouvelles expéditions. Sorts achetés : F boule de feu, R foudre, T terre. Vise avec la souris ; chaque sort a sa propre recharge. Code de triche dans la boutique : ABYSSE10M (+10 millions de pièces d’or).</p><p>Tab échange l’arme active avec la réserve. En ramassant une troisième arme, l’ancienne arme active est posée au sol. Feu + Foudre : surcharge explosive. Terre + Laser : +25% dégâts sur une cible ralentie. Les reliques maudites ont un bonus et une contrepartie indiqués avant le ramassage.</p><p>Menu principal ou Pause → Personnaliser le personnage : 10 couleurs pour la tête et 10 pour le corps, avec aperçu. Les couleurs enregistrées s’appliquent aussi à une partie reprise.</p><p>Canon laser : maintiens le clic gauche pour charger, relâche pour annuler. Hache : frappe à 360°, déplacement et dash −25% tant qu’elle est équipée. Ces armes se trouvent en butin ou se débloquent dans la boutique pour démarrer avec.</p><p><a href="CREDITS-IMAGES.html" target="_blank" rel="noopener">Crédits des images</a></p><button id="closeHelp">Retour</button>`);$("#closeHelp").onclick=()=>hideModal()}
function metaMenu(){let m=loadMeta(),costHp=3+(m.hp||0)*2,costRare=5+(m.rare||0)*3;showModal(`<h2>Sanctuaire</h2><p>Éclats : <b>${m.shards||0}</b></p><button data-buy="hp">Vitalité permanente +5 PV (${costHp})</button><button data-buy="rare">Chance de rareté +1% (${costRare})</button><button data-buy="bow">Débloquer l'Arc de départ (8)</button><button id="metaBack">Retour</button>`);$("#metaBack").onclick=()=>hideModal();$("#modalCard").querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>{let mm=loadMeta(),k=b.dataset.buy,c=k==="hp"?3+(mm.hp||0)*2:k==="rare"?5+(mm.rare||0)*3:8;if((mm.shards||0)>=c){mm.shards-=c;if(k==="hp")mm.hp=(mm.hp||0)+1;if(k==="rare")mm.rare=(mm.rare||0)+1;if(k==="bow")mm.bowUnlocked=true;localStorage.setItem(META,JSON.stringify(mm));metaMenu()}})}
function inventory(){
 if(!game)return;game.paused=true;const p=game.player,w=p.weapon;
 const stats=weaponStats(w,p),counts={};for(const name of p.passives)counts[name]=(counts[name]||0)+1;
 showModal(`<div class="eyebrow">ÉQUIPEMENT & ATTRIBUTS</div><h2>Inventaire</h2>
 <div class="equipment"><img src="${WEAPON_SPRITE_PATHS[w.type]}" alt=""><div><h3 style="color:${RARITIES[w.rarity].c}">${w.name}</h3>${stats}</div></div>
 <div class="reserve-equipment"><h3>Arme en réserve</h3>${p.reserveWeapon?`<div class="equipment"><img src="${WEAPON_SPRITE_PATHS[p.reserveWeapon.type]}" alt=""><div><b>${p.reserveWeapon.name}</b><p>${p.reserveWeapon.desc().replace(/\n/g,'<br>')}</p></div></div><button id="invSwap">Échanger les armes (Tab en jeu)</button>`:'<p>Ramasse une seconde arme.</p>'}</div><h3>Statistiques actuelles</h3><div class="stat-grid">${statCells([
 ['PV',`${Math.ceil(p.hp)} / ${Math.round(p.maxHp)}`],['Armure',fmt(p.armor)],['Vitesse',fmt(movementSpeed(p))],['Critique',pct(Math.min(.85,p.crit+(w.extra==='crit'?.06:0)))],['Dégâts critiques','×'+fmt(p.critMul)],['Vol de vie',pct(p.lifesteal+(w.extra==='life'?.03:0))],['Esquive',pct(Math.min(1,p.dodge))],['Recharge dash',fmt(p.dashCdMax)+' s'],['Projectiles',1+p.extraProj],['Soins','×'+fmt(p.healMul)],['Gains d’or','×'+fmt(p.goldMul)],['Or en jeu',money(p.gold)],['Dégâts reçus','×'+fmt(p.incomingMul||1)],['Recharge des pouvoirs','×'+fmt(p.cooldownMul||1)],['Élites supplémentaires',pct(p.eliteBonus||0)]])}</div>
 <h3>Sorts achetés</h3><div class="inventory">${SPELLS.filter(s=>p.spells.includes(s.id)).map(s=>`<div class="slot" style="border-color:${s.color}">${itemIcon(s.name)}<b>${s.key} · ${s.name}</b><small>${s.desc}</small><small>Recharge actuelle : ${fmt(s.cd*(p.cooldownMul||1))} s · Dégâts actuels : ${fmt(s.damage*p.damageMul)}${s.id==='lightning'?' sur la première cible':''} · ${p.spellCd[s.id]>0?fmt(p.spellCd[s.id])+' s restantes':'Prêt'}</small></div>`).join('')||'<small>Achète des sorts au menu, puis lance une nouvelle expédition.</small>'}</div><h3>Objets passifs</h3><div class="inventory">${Object.entries(counts).map(([name,n])=>{const item=ALL_PASSIVES.find(x=>x[0]===name),shop=SHOP_ITEMS.find(x=>x.name===name);return `<div class="slot ${isCurse(name)?'cursed-item':''}">${itemIcon(name)}<b>${name}${n>1?' ×'+n:''}</b><small>${item?.[1]||shop?.desc||'Objet ancien'}</small>${n>1?'<small>Effet appliqué '+n+' fois</small>':''}</div>`}).join('')||'<small>Aucun objet passif.</small>'}</div><button id="invClose">Reprendre</button>`);
 if(p.reserveWeapon)$('#invSwap').onclick=()=>{p.swapCd=0;p.swapWeapon(true);inventory();};$('#invClose').onclick=()=>{hideModal();game.paused=false};
}
document.addEventListener("keydown",e=>{if(e.target?.matches?.("input,textarea,select")||e.target?.isContentEditable||e.ctrlKey||e.metaKey||e.altKey)return;let k=e.key.toLowerCase();keys[k]=true;if(k==="tab"&&game&&!game.paused){e.preventDefault();if(!e.repeat)game.player.swapWeapon();}const spell=SPELLS.find(s=>s.key.toLowerCase()===k);if(spell&&game&&!game.paused&&!e.repeat){e.preventDefault();game.player.castSpell(spell.id);}if(k==="e"&&game&&!game.paused&&!e.repeat)keys.ePress=true;if(e.code==="Space"&&game&&!game.paused){e.preventDefault();game.player.dash()}if(k==="escape"){if(game&&!game.paused)pauseMenu()}if(k==="i"&&game&&!game.paused)inventory();if(game&&!game.paused&&["1","2","3"].includes(k)&&game.player.souls[+k-1])game.player.selectedSoul=+k-1;if(k==="m")$("#minimap").style.transform=$("#minimap").style.transform?"":"scale(1.7) translate(-20px,15px)"});
document.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
C.addEventListener("mousemove",e=>{let r=C.getBoundingClientRect();mouse.x=(e.clientX-r.left)*W/r.width;mouse.y=(e.clientY-r.top)*H/r.height});
C.addEventListener("mousedown",e=>{if(e.button===0)mouse.down=true;if(e.button===2)mouse.right=true});document.addEventListener("mouseup",e=>{if(e.button===0)mouse.down=false;if(e.button===2)mouse.right=false});C.oncontextmenu=e=>e.preventDefault();
$("#mainMenu").addEventListener("click",e=>{let a=e.target.dataset.action;if(a==="new")startGame();if(a==="continue")continueRun();if(a==="options")options();if(a==="help")help();if(a==="meta")metaMenu();if(a==="shop")bankShop();if(a==="roulette")rouletteMenu();if(a==="coop")coopMenu();if(a==="customize")customization();if(a==="challenges")challengesMenu()});
function loop(t){if(coop?.active){coopFrame(t);requestAnimationFrame(loop);return;}let dt=Math.min(.033,(t-last)/1000);last=t;if(game){game.update(dt);game.draw()}requestAnimationFrame(loop)}requestAnimationFrame(loop);mainMenu();
const SOULS=[
 {name:"Brise-serment",icon:"Ⅰ",color:"#efac79",cd:8,desc:"Une onde circulaire frappe les ennemis proches et te protège pendant 1,2 seconde."},
 {name:"Constellation du néant",icon:"Ⅱ",color:"#ba9dff",cd:7,desc:"Une salve d’éclats traverse la salle dans la direction du curseur."},
 {name:"Marée spectrale",icon:"Ⅲ",color:"#62dfc6",cd:12,desc:"Une déflagration repousse les créatures et restaure tes points de vie."}
];
Player.prototype.castSoul=function(){
 const k=this.selectedSoul,rank=this.souls[k];if(!rank||this.soulCd[k]>0||game.paused)return;
 const s=SOULS[k];this.soulCd[k]=s.cd*(this.cooldownMul||1);const power=1+(rank-1)*.3;
 if(k===0){this.ward=1.2;for(const e of [...game.enemies])if(!e.dead&&dist(this,e)<190)e.hit(65*power*this.damageMul,Math.atan2(e.y-this.y,e.x-this.x),260);}
 if(k===1){for(let i=0;i<9;i++)game.projectiles.push(new Projectile(this.x,this.y,this.aim+(i-4)*.13,560,23*power*this.damageMul,"player",s.color,7));}
 if(k===2){this.heal(22*power);for(const e of [...game.enemies])if(!e.dead&&dist(this,e)<285)e.hit(38*power*this.damageMul,Math.atan2(e.y-this.y,e.x-this.x),180);}
 game.ripples=game.ripples||[];game.ripples.push({x:this.x,y:this.y,r:k===2?285:190,life:.65,color:s.color});burst(this.x,this.y,s.color,35);audio("level");
};
Game.prototype.grantSoul=function(k){
 this.player.souls[k]++;this.player.selectedSoul=k;this.player.soulCd[k]=0;this.player.heal(this.player.maxHp*.2);
 this.toastUntil=performance.now()+7500;this.toastText=`POUVOIR ABSORBÉ · ${SOULS[k].name} · Rang ${this.player.souls[k]} — Clic droit`;
 // The boss death completes its loot and statistics before the next save.
 queueMicrotask(()=>saveRun());
};
function updateSoulHud(){
 const p=game.player;
 $('#abilityText').textContent=p.souls.some(Boolean)?'Clic droit · '+SOULS[p.selectedSoul].name:'Vaincs un gardien pour absorber son pouvoir';
 const html=SOULS.map((s,k)=>`<button class="soul ${p.souls[k]?'unlocked':''} ${p.selectedSoul===k?'selected':''}" data-soul="${k}" ${p.souls[k]?'':'disabled'} title="${s.desc}" style="--soul:${s.color}"><kbd>${k+1}</kbd><span>${s.icon}</span><div><b>${s.name}</b><small>${!p.souls[k]?'Gardien '+(k+1):p.soulCd[k]>0?p.soulCd[k].toFixed(1)+' s':'PRÊT · RANG '+p.souls[k]}</small></div></button>`).join('');
 if($('#soulBar').innerHTML!==html)$('#soulBar').innerHTML=html;
 $('#toast').textContent=performance.now()<(game.toastUntil||0)?game.toastText:'';
}
$('#soulBar').onclick=e=>{const b=e.target.closest('[data-soul]');if(b&&game&&!game.paused&&game.player.souls[+b.dataset.soul])game.player.selectedSoul=+b.dataset.soul;};
function drawCreature(type,x,y,size,t,tint,appearance=playerLook,ctx=X){
 const colors={player:'#65e0d1',slime:'#83c77b',skeleton:'#d8cead',archer:'#c7b582',bat:'#ae8bcc',mage:'#b899f0',tank:'#b88975',wraith:'#71d8d5',sentinel:'#edbb76',bomber:'#ee8162',oracle:'#b99bfa',knight:'#efac79'};
 const look=normalizeLook(appearance),head=lookColor(look.head).hex,body=lookColor(look.body).hex;const c=type==='player'?body:tint||colors[type]||'#efac79';ctx.save();ctx.translate(x,y);ctx.scale(size/48,size/48);
 ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,19,20,7,0,0,7);ctx.fill();ctx.lineWidth=1.6;ctx.strokeStyle=c;ctx.fillStyle='#182c35';
 const poly=pts=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.stroke();};
 if(type==='slime'){ctx.fillStyle='#23483a';ctx.beginPath();ctx.ellipse(0,7,20,14+Math.sin(t)*2,0,Math.PI,Math.PI*2);ctx.lineTo(20,17);ctx.quadraticCurveTo(0,22,-20,17);ctx.closePath();ctx.fill();ctx.stroke();}
 else if(type==='bat'){const flap=Math.sin(t)*9;poly([[-3,0],[-27,-14+flap],[-20,9],[-8,6],[0,15],[8,6],[20,9],[27,-14+flap],[3,0],[0,-9]]);}
 else if(type==='bomber'){ctx.fillStyle='#532c28';ctx.beginPath();ctx.arc(0,3,17,0,7);ctx.fill();ctx.stroke();ctx.strokeStyle='#ffcc89';ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(5,-24);ctx.stroke();ctx.fillStyle='#ffdc99';ctx.fillRect(2,-26,5,5);}
 else if(type==='tank'||type==='sentinel'||type==='knight'){poly([[-21,-8],[-12,-17],[12,-17],[21,-8],[18,18],[-18,18]]);ctx.fillStyle='#344650';poly([[-10,-22],[10,-22],[12,-4],[0,4],[-12,-4]]);ctx.fillStyle=c;ctx.fillRect(-9,-11,18,3);if(type!=='tank'){poly([[-26,-1],[-14,-4],[-14,20],[-23,26],[-30,15]]);ctx.fillRect(24,-25,3,47);}}
 else{const spectral=['wraith','mage','oracle'].includes(type);ctx.fillStyle=type==='player'?shadeColor(body,.35):'#252b40';poly([[-8,-15],[8,-15],[15,3],[19,20],[7,16],[0,22],[-8,17],[-18,21],[-13,0]]);ctx.fillStyle=type==='player'?shadeColor(head,.25):'#0a1520';if(type==='player')ctx.strokeStyle=head;poly([[-11,-10],[0,-25],[11,-10],[9,1],[-9,1]]);if(spectral){ctx.strokeStyle=c;ctx.beginPath();ctx.ellipse(0,-22,17,5,0,0,7);ctx.stroke();}if(type==='archer'){ctx.beginPath();ctx.arc(21,0,19,-1.3,1.3);ctx.stroke();}if(type==='skeleton'){ctx.fillStyle='#d8cead';ctx.fillRect(-8,-15,16,12);ctx.fillRect(-5,2,10,3);ctx.fillRect(-6,8,12,3);}}
 ctx.shadowBlur=9;ctx.shadowColor=type==='player'?head:c;ctx.fillStyle=type==='player'?head:c;ctx.fillRect(-7,-7,4,3);ctx.fillRect(3,-7,4,3);if(type==='player')drawAccessories(ctx,look);ctx.restore();
}
function drawRoom(r){
 const palette=[['#101e26','#162831','#62c9bd'],['#1b182b','#25213a','#ad8ddd'],['#142622','#1b312b','#84c99f']][(game.floor-1)%3];
 X.fillStyle=palette[0];X.fillRect(0,0,W,H);
 for(let y=64;y<H-64;y+=48)for(let x=64;x<W-64;x+=64){X.fillStyle=((x/64+y/48)%3<1)?palette[1]:palette[0];X.fillRect(x+1,y+1,62,46);X.strokeStyle='#7dabb20c';X.strokeRect(x+1,y+1,62,46);}
 X.save();X.translate(W/2,H/2);X.strokeStyle=palette[2]+'25';X.lineWidth=2;
 for(const radius of [110,118,208]){X.beginPath();X.arc(0,0,radius,0,7);X.stroke();}
 for(let i=0;i<12;i++){X.save();X.rotate(i*Math.PI/6);X.strokeRect(145,-5,11,11);X.beginPath();X.moveTo(180,0);X.lineTo(200,0);X.stroke();X.restore();}X.restore();
 X.fillStyle='#091219';X.fillRect(0,0,W,60);X.fillRect(0,H-60,W,60);X.fillRect(0,0,60,H);X.fillRect(W-60,0,60,H);X.strokeStyle=palette[2]+'35';X.lineWidth=2;X.strokeRect(61,61,W-122,H-122);
 for(const x of [92,350,W-350,W-92])for(const y of [68,H-68]){X.fillStyle='#293943';X.fillRect(x-17,y-20,34,40);X.strokeStyle='#9cb9b344';X.strokeRect(x-17,y-20,34,40);const g=X.createRadialGradient(x,y,1,x,y,85);g.addColorStop(0,palette[2]+'40');g.addColorStop(1,palette[2]+'00');X.fillStyle=g;X.fillRect(x-85,y-85,170,170);X.fillStyle=palette[2];X.shadowBlur=16;X.shadowColor=palette[2];X.fillRect(x-3,y-7,6,14);X.shadowBlur=0;}
 for(const [dx,dy,x,y,w,h] of [[1,0,W-62,H/2-42,65,84],[-1,0,0,H/2-42,65,84],[0,1,W/2-42,H-62,84,65],[0,-1,W/2-42,0,84,65]])if(game.rooms.has((r.gx+dx)+','+(r.gy+dy))){X.fillStyle=r.locked?'#4a2732':'#163e40';X.fillRect(x,y,w,h);X.strokeStyle=r.locked?'#e4867d':palette[2];X.strokeRect(x+3,y+3,w-6,h-6);if(r.locked){for(let i=1;i<5;i++){X.fillStyle='#c7787366';X.fillRect(x+w*i/5,y,3,h);}}else{X.fillStyle=palette[2];X.font='22px Georgia';X.textAlign='center';X.fillText('◇',x+w/2,y+h/2+8);X.textAlign='left';}}
 X.fillStyle=palette[2]+'80';X.font='11px monospace';X.fillText(['LA CATHÉDRALE ENGLOUTIE','LES ARCHIVES DU NÉANT','LE JARDIN DES OUBLIÉS'][(game.floor-1)%3],85,H-84);
}
function drawAtmosphere(){
 const time=performance.now()/1000;X.save();
 for(let i=0;i<24;i++){X.globalAlpha=.12+Math.sin(time+i)*.08;X.fillStyle='#b0fff1';X.fillRect(85+(i*137)%1100+Math.sin(time*.3+i)*12,90+(i*83-time*7)%530,2,2);}X.globalAlpha=1;
 for(const e of game.enemies){if(e.dead)continue;if(e.charge>.4||(e instanceof Boss&&e.special<.7)){X.strokeStyle='#ff9d83';X.setLineDash([7,7]);X.lineWidth=2;X.beginPath();X.arc(e.x,e.y,e instanceof Boss?110:60,0,7);X.stroke();X.setLineDash([]);}}
 if(game.player.ward>0){X.strokeStyle='#efac79';X.lineWidth=3;X.beginPath();X.arc(game.player.x,game.player.y,35,0,7);X.stroke();}
 game.ripples=(game.ripples||[]).filter(r=>r.life>0);for(const r of game.ripples){if(!game.paused)r.life-=1/60;X.globalAlpha=Math.max(0,r.life/.65);X.strokeStyle=r.color;X.lineWidth=4;X.beginPath();X.arc(r.x,r.y,r.r*(1-r.life/.65),0,7);X.stroke();}X.restore();drawSpellEffects();
}
function saveRun(){
 if(coop?.active||!game||game.player.hp<=0)return;
 const p={...game.player,weapon:{...game.player.weapon}};
 const serialDrop=d=>({...d,item:d.item?d.item[0]:undefined});
 const rooms=[...game.rooms.entries()].map(([key,r])=>[key,{...r,shop:r.shop?.map(serialDrop),loot:r.loot?.map(serialDrop)}]);
 localStorage.setItem(SAVE,JSON.stringify({version:2,runId:game.runId,bossChoice:!!game.bossChoice,pendingLevels:(game.pendingLevels||0)+(game.levelChoice?1:0),floor:game.floor,player:p,stats:game.stats,rooms,roomKey:game.room.gx+','+game.room.gy,drops:game.drops.map(serialDrop),enemies:game.enemies.filter(e=>!e.dead),hazards:game.hazards,elapsed:performance.now()-game.start}));
}
function continueRun(){
 let s;try{s=JSON.parse(localStorage.getItem(SAVE));}catch{}if(!s||![1,2].includes(s.version)||loadMeta().settledRuns?.includes(s.runId))return startGame();
 startGame();game.runId=s.runId||game.runId;game.floor=s.floor;Object.assign(game.player,s.player);game.player.laserCharge=0;game.player.spells=s.player.spells||[];game.player.spellCd=s.player.spellCd||{};game.player.weapon=hydrateWeapon(s.player.weapon);game.player.reserveWeapon=hydrateWeapon(s.player.reserveWeapon);game.player.reserveCool=s.player.reserveCool||0;game.player.swapCd=0;
 const hydrate=d=>({...d,weapon:d.weapon?hydrateWeapon(d.weapon):undefined,item:d.item?ALL_PASSIVES.find(p=>p[0]===d.item):undefined});
 game.rooms=new Map(s.rooms.map(([key,r])=>[key,Object.assign(new Room(r.gx,r.gy,r.type),r,{shop:r.shop?.map(hydrate),loot:r.loot?.map(hydrate)})]));game.room=game.rooms.get(s.roomKey);game.stats=s.stats||{kills:0,bosses:0,damage:0,gold:0};game.start=performance.now()-(s.elapsed||0);game.drops=s.drops.map(hydrate);game.hazards=s.hazards||[];
 game.enemies=s.enemies.map(e=>Object.assign(e.kind!==undefined?new Boss(e.kind,e.x,e.y):new Enemy(e.type,e.x,e.y,e.elite),e));game.boss=game.enemies.find(e=>e instanceof Boss)||null;if(game.boss){const old=s.enemies.find(e=>e.kind!==undefined);if(old?.damageTaken===undefined)game.boss.damageTaken=1;}game.bossChoice=!!s.bossChoice;game.pendingLevels=s.pendingLevels||0;saveRun();if(game.pendingLevels)game.openLevel();else if(game.bossChoice)game.openBossChoice();
}
window.addEventListener('blur',()=>{for(const k of Object.keys(keys))delete keys[k];mouse.down=mouse.right=false;if(game&&!game.paused)pauseMenu();});
window.addEventListener('pagehide',()=>{if(game&&!game.paused)saveRun();});
// Small synthesized cues, enabled only after an intentional input.
let audioContext;
audio=function(name){try{if(!audioContext)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=name==='attack'?'triangle':'sine';o.frequency.value=({attack:190,hurt:85,death:120,level:620,boss:420,pickup:780,room:170,floor:330})[name]||250;g.gain.setValueAtTime(.018,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.12);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.13);}catch{}};
document.addEventListener('pointerdown',()=>{try{audioContext=audioContext||new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();}catch{}},{once:true});

Player.prototype.updateLaser=function(dt){
 if(game.paused||this.weapon.type!=='laser'||!mouse.down||this.cool>0){this.laserCharge=0;return;}
 this.laserCharge+=dt;if(this.laserCharge+1e-9<laserChargeTime(this))return;
 this.laserCharge=0;this.cool=this.weapon.base.rate/attackSpeed(this);this.attackAnim=this.attackAnimMax=.25;
 const a=this.aim,dx=Math.cos(a),dy=Math.sin(a);let length=this.weapon.base.range;
 if(dx>1e-8)length=Math.min(length,(W-65-this.x)/dx);else if(dx< -1e-8)length=Math.min(length,(65-this.x)/dx);
 if(dy>1e-8)length=Math.min(length,(H-65-this.y)/dy);else if(dy< -1e-8)length=Math.min(length,(65-this.y)/dy);
 length=Math.max(0,length);spellEffect({type:'laser',x:this.x,y:this.y,endX:this.x+dx*length,endY:this.y+dy*length,color:'#8feaff',life:.35});
 const targets=game.enemies.filter(e=>{if(e.dead)return false;const along=(e.x-this.x)*dx+(e.y-this.y)*dy,across=Math.abs((e.x-this.x)*dy-(e.y-this.y)*dx);return along>=0&&along<=length&&across<this.weapon.base.width/2+e.r;});
 let hits=0;for(const e of targets){if(e.dead)continue;const rooted=e.slowLeft>0,before=e.hp;e.hit(this.damage(this.weapon.base.damage*this.weapon.bonus)*(rooted?1.25:1),a,this.weapon.base.knock,attackSource(this));if(e.hp<before)hits++;if(rooted&&e.hp<before){game.stats.laserEarth=(game.stats.laserEarth||0)+1;spellNotice("FRACTURE · Terre + Laser : +25% dégâts");}}if(hits>=3){game.stats.laserTriple=true;checkChallenges();}
 game.shake=Math.max(game.shake,5);audio('laser');
};

Player.prototype.castSpell=function(id){
 const s=SPELLS.find(s=>s.id===id);if(!s||!game||game.player!==this||game.paused||this.hp<=0||!this.spells.includes(id)||(this.spellCd[id]||0)>0)return false;
 const a=Math.atan2(mouse.y-this.y,mouse.x-this.x),damage=s.damage*this.damageMul;
 let chain=[];
 if(id==='lightning'){
  const candidates=game.enemies.filter(e=>!e.dead&&dist(this,e)<=600&&Math.abs(angleDiff(a,Math.atan2(e.y-this.y,e.x-this.x)))<.7);
  const target=candidates.sort((a,b)=>dist(a,mouse)-dist(b,mouse))[0];
  if(!target){spellNotice('Foudre : vise un ennemi à portée (600).');return false;}
  chain=[target];while(chain.length<5){const prev=chain[chain.length-1],next=game.enemies.filter(e=>!e.dead&&!chain.includes(e)&&dist(prev,e)<=240).sort((a,b)=>dist(prev,a)-dist(prev,b))[0];if(!next)break;chain.push(next);}
 }
 this.spellCd[id]=s.cd*(this.cooldownMul||1);
 if(id==='fireball')game.projectiles.push(new Fireball(this,a,damage));
 if(id==='lightning'){
  spellEffect({type:'lightning',points:[{x:this.x,y:this.y},...chain.map(e=>({x:e.x,y:e.y}))],color:s.color,life:.45});
  chain.forEach((e,i)=>{if(e.dead)return;overload(e,60*this.damageMul);if(e.dead)return;e.stun=Math.max(e.stun||0,e instanceof Boss?.25:.7);e.hit(damage*.8**i,a,20);});
 }
 if(id==='earth'){
  const range=Math.min(300,dist(this,mouse)),x=clamp(this.x+Math.cos(a)*range,80,W-80),y=clamp(this.y+Math.sin(a)*range,80,H-80);
  this.ward=Math.max(this.ward,1.5);spellEffect({type:'earth',x,y,r:120,color:s.color,life:.8});burst(x,y,s.color,25);
  const targets=game.enemies.filter(e=>!e.dead&&Math.hypot(e.x-x,e.y-y)<120+e.r);for(const e of targets){e.slowLeft=e instanceof Boss?2:4;e.hit(damage,Math.atan2(e.y-y,e.x-x),300,{element:"earth"});}
 }
 audio('level');updateSpellHud();saveRun();return true;
};
$('#spellBar').onclick=e=>{const b=e.target.closest('[data-spell]');if(b&&game&&!game.paused)game.player.castSpell(b.dataset.spell);};

Game.prototype.openBossChoice=function(){
 this.bossChoice=true;this.paused=true;saveRun();const next=difficulty(this.floor+1);
 showModal(`<div class="eyebrow">GARDIEN VAINCU · ÉTAGE ${this.floor}</div><h2>Jusqu’où descendras-tu ?</h2>${this.newAccessories?.length?`<p class="reward-notice">Accessoires débloqués : ${this.newAccessories.join(', ')} · À équiper dans Personnalisation.</p>`:''}<p>Ton pouvoir est absorbé. Récompense du boss incluse.</p><p class="bank-balance">${money(this.player.gold)} à encaisser</p><p>Étage suivant : PV ennemis ×${fmt(next.hp)}, dégâts ×${fmt(next.damage)} par rapport à l’étage 1.<br>Chaque étage : +55% PV, +23% dégâts et +50% or.</p><button id="bossContinue">Descendre à l’étage ${this.floor+1}</button><button id="bossLoot">Récupérer le butin / consulter l’inventaire</button><button id="bossBank">Encaisser et retourner au menu</button><small>Descendre abandonne le butin au sol. Encaisser termine l’expédition. En continuant, tu risques ton or : il est perdu à la mort. E près du portail rouvre ce choix.</small>`);
 $('#bossContinue').onclick=()=>this.nextFloor();$('#bossLoot').onclick=()=>{this.bossChoice=false;hideModal();this.paused=false;saveRun();};$('#bossBank').onclick=()=>this.cashOut();
};
Game.prototype.cashOut=function(){
 if(game!==this||!this.bossChoice||!this.room.portal||!this.room.cleared)return;
 const m=loadMeta();if(m.settledRuns?.includes(this.runId)){localStorage.removeItem(SAVE);mainMenu();return;}
 m.bank=(m.bank||0)+Math.floor(this.player.gold);m.shards=(m.shards||0)+Math.max(1,Math.floor(this.floor/2)+this.stats.bosses*3+Math.floor(this.stats.kills/20));
 // Persist balance and settlement together, before removing the run: reload cannot pay twice.
 m.settledRuns=[...(m.settledRuns||[]),this.runId];
 try{localStorage.setItem(META,JSON.stringify(m));localStorage.removeItem(SAVE);}catch{showModal('<h2>Encaissement interrompu</h2><p>Le stockage du navigateur est indisponible. Libère de la place puis réessaie.</p><button id="retryCash">Réessayer</button>');$('#retryCash').onclick=()=>this.cashOut();return;}
 mainMenu();bankShop('Expédition terminée : or et éclats encaissés.');
};

// Two-player host-authoritative simulation. Solo save keys are never written here.
const COOP_PROTOCOL=1,COOP_PREFS='echoesCoopSettingsV1',COOP_RECEIPTS='coopSettled';
function coopEscape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function coopProfile(raw){
 const m=raw?.meta||{},ids=[...SHOP_ITEMS,...SHOP_WEAPONS,...SPELLS].map(s=>s.id);
 return {name:String(raw?.name||'Aventurier').slice(0,20),look:normalizeLook(raw?.look),meta:{hp:clamp(Math.floor(Number(m.hp)||0),0,100),rare:clamp(Math.floor(Number(m.rare)||0),0,100),bowUnlocked:!!m.bowUnlocked,startWeapon:Object.hasOwn(WEAPONS,m.startWeapon)?m.startWeapon:'sword',owned:Array.isArray(m.owned)?[...new Set(m.owned.filter(id=>ids.includes(id)))]:[]}};
}
function coopMenu(message=''){
 if(coop)return;let prefs={};try{prefs=JSON.parse(localStorage.getItem(COOP_PREFS))||{};}catch{}
 showModal(`<div class="eyebrow">ENSEMBLE DANS LES PROFONDEURS</div><h2>Coop en ligne</h2><p>Deux aventuriers, un donjon. Tes couleurs, accessoires et achats permanents te suivent.<br>Le butin et l’or sont individuels. Maintiens <b>E</b> près de ton partenaire à terre pour le réanimer.</p><div class="coop-form"><label for="coopName">Ton pseudo</label><input id="coopName" maxlength="20" value="${coopEscape(prefs.name||'Aventurier')}"><label for="coopServer">Adresse du serveur</label><input id="coopServer" placeholder="wss://ton-serveur.onrender.com/coop" value="${coopEscape(window.ABYSS_COOP_SERVER||prefs.url||'')}"><small>Vous devez utiliser le même serveur. L’adresse sera mémorisée sur cet appareil.</small><button id="coopCreate">Créer un salon privé</button><label for="coopCode">Code reçu de ton pote</label><input id="coopCode" maxlength="10" placeholder="EX. A1B2C3D4E5" autocomplete="off"><button id="coopJoin">Rejoindre le salon</button></div><p id="coopStatus" role="status">${coopEscape(message)}</p><p class="coop-note">Version coop 1 : l’hôte dirige les changements de salle et la décision après un boss. Les expéditions coop ne sont pas reprises après une déconnexion. Les défis cosmétiques se gagnent en solo.</p><button id="coopBack">Retour</button>`);
 $('#coopBack').onclick=mainMenu;$('#coopCreate').onclick=()=>coopConnect('create');$('#coopJoin').onclick=()=>coopConnect('join');
}
function coopSend(m){if(coop?.socket.readyState===1&&coop.socket.bufferedAmount<512*1024)coop.socket.send(JSON.stringify(m));}
function coopConnect(mode){
 const name=$('#coopName').value.trim()||'Aventurier',code=$('#coopCode').value.trim().toUpperCase();let url;
 try{url=new URL($('#coopServer').value.trim());if(!['wss:','ws:'].includes(url.protocol)||url.username||url.password||location.protocol==='https:'&&url.protocol!=='wss:')throw Error();}catch{$('#coopStatus').textContent='Indique une adresse wss:// valide (ws:// autorisé en local).';return;}
 if(mode==='join'&&!/^[0-9A-F]{10}$/.test(code)){$('#coopStatus').textContent='Le code du salon comporte 10 caractères.';return;}
 try{localStorage.setItem(COOP_PREFS,JSON.stringify({name,url:url.href}));}catch{}
 const localProfile=coopProfile({name,look:playerLook,meta:loadMeta()});
 const c=coop={socket:new WebSocket(url.href),active:false,role:null,profiles:null,localProfile,code:null,local:0,events:[],inputs:[{},{}],lastMessage:performance.now(),seq:0,lastSeq:-1,lastSend:0,lastFrame:performance.now(),uiKey:'',pauseOwner:null};
 $('#coopBack').onclick=()=>coopDisconnect();$('#coopStatus').textContent='Connexion au serveur…';$('#coopCreate').disabled=$('#coopJoin').disabled=true;
 c.timeout=setTimeout(()=>{if(coop===c&&!c.code)coopDisconnect('Le serveur ne répond pas. Vérifie son adresse et réessaie.');},45000);
 c.socket.onopen=()=>coopSend({type:mode,protocol:COOP_PROTOCOL,code,profile:localProfile});
 c.socket.onerror=()=>{if(coop===c)coopDisconnect('Connexion impossible. Vérifie que le serveur est lancé et accepte ce site.');};
 c.socket.onclose=()=>{if(coop===c)coopDisconnect('Connexion interrompue. Le solo reste disponible ; recréez un salon pour rejouer.');};
 c.socket.onmessage=e=>{
  if(coop!==c)return;c.lastMessage=performance.now();let m;try{m=JSON.parse(e.data);}catch{return;}
  if(m.type==='error'||m.type==='ended'){coopDisconnect(m.message);return;}
  if(m.type==='room'){clearTimeout(c.timeout);c.role=m.role;c.local=m.role==='host'?0:1;c.code=m.code;coopLobby();}
  if(m.type==='ready'){c.profiles=m.profiles.map(coopProfile);coopLobby();}
  if(m.type==='start')coopStart();
  if(m.type==='input'&&c.role==='host'&&c.active){const input=coopInput(m.data);if(input.seq>c.lastSeq){c.lastSeq=input.seq;c.lastInput=performance.now();c.inputs[1]=input;c.eventsRemote=(c.eventsRemote||[]).concat(input.events).slice(-30);}}
  if(m.type==='state'&&c.role==='guest'&&c.active)coopReceive(m.data);
 };
}
function coopLobbyPlayers(c){
 const profiles=c.profiles?[...c.profiles]:[null,null];profiles[c.local]??=c.localProfile;
 return profiles.map((profile,i)=>{const role=i===0?'HÔTE':'INVITÉ',mine=i===c.local?' · TOI':'',weapon=profile?WEAPONS[profile.meta.startWeapon]?.name||'Épée':'En attente';return `<article class="coop-player-card ${profile?'connected':'waiting'}"><span class="coop-player-role">${role}${mine}</span><canvas data-coop-lobby-avatar="${i}" width="180" height="180" aria-label="${profile?'Personnage de '+coopEscape(profile.name):'Emplacement libre'}"></canvas><h3>${profile?coopEscape(profile.name):'Emplacement libre'}</h3><p>${profile?'Arme de départ · '+coopEscape(weapon):'Ton partenaire apparaîtra ici'}</p><strong>${profile?'✓ PRÊT':'○ EN ATTENTE'}</strong></article>`;}).join('');
}
function renderCoopLobbyPlayers(c){
 const profiles=c.profiles?[...c.profiles]:[null,null];profiles[c.local]??=c.localProfile;
 document.querySelectorAll('[data-coop-lobby-avatar]').forEach(canvas=>{const profile=profiles[+canvas.dataset.coopLobbyAvatar],ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);const glow=ctx.createRadialGradient(90,92,8,90,92,86);glow.addColorStop(0,profile?'#315b57':'#26323b');glow.addColorStop(1,'#08151d');ctx.fillStyle=glow;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=profile?'#78c9b7':'#51616a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(90,149,55,11,0,0,Math.PI*2);ctx.stroke();if(profile)drawCreature('player',90,92,96,0,null,profile.look,ctx);else{ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(90,83,38,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#8da0a8';ctx.font='36px Georgia';ctx.textAlign='center';ctx.fillText('?',90,96);}});
}
function coopLobby(){
 const c=coop;if(!c)return;const ready=!!c.profiles,status=ready?c.role==='host'?'Les deux aventuriers sont prêts. Lance quand tu veux.':'Les deux aventuriers sont prêts. L’hôte va lancer la partie.':'Partage le code du salon et l’adresse du serveur avec ton partenaire.';
 showModal(`<div class="coop-lobby"><div class="eyebrow">SALON PRIVÉ · 2 JOUEURS</div><h2>Rassemblement des aventuriers</h2><div class="coop-lobby-code"><span>CODE DU SALON</span><strong class="coop-code">${c.code}</strong></div><div class="coop-lobby-grid">${coopLobbyPlayers(c)}</div><p class="coop-lobby-status">${status}</p><div class="coop-lobby-actions">${ready&&c.role==='host'?'<button id="coopStart">Lancer l’expédition à deux</button>':''}<button id="coopLeave">Quitter le salon</button></div></div>`);renderCoopLobbyPlayers(c);
 if($('#coopStart'))$('#coopStart').onclick=()=>{coopSend({type:'start'});$('#coopStart').disabled=true;$('#coopStart').textContent='Ouverture du passage…';};$('#coopLeave').onclick=()=>coopDisconnect();
}
function coopDisconnect(message=''){
 const c=coop;if(!c)return;clearInterval(c.netTimer);clearTimeout(c.timeout);if(game?.coopEnd?.cash&&!coopBank(game.coopEnd)){c.offline=true;c.socket.onclose=c.socket.onerror=c.socket.onmessage=null;c.socket.close();c.uiKey='';coopUI();return;}coop=null;c.socket.onclose=c.socket.onerror=c.socket.onmessage=null;c.socket.close();for(const k of Object.keys(keys))delete keys[k];mouse.down=mouse.right=false;$('#coopPanel')?.remove();mainMenu();if(message)coopMenu(message);
}
function coopAs(p,fn){const prev=game.player;game.player=p;try{return fn();}finally{game.player=prev;}}
function coopNearest(o){return game.coopPlayers.filter(p=>!p.downed).sort((a,b)=>dist(a,o)-dist(b,o))[0]||game.coopPlayers[0];}
function coopInput(raw={}){
 const pressed={};for(const key of ['w','a','s','d','z','q','arrowup','arrowdown','arrowleft','arrowright','e'])pressed[key]=raw.keys?.[key]===true;
 return {seq:Number.isSafeInteger(raw.seq)?raw.seq:0,keys:pressed,x:clamp(Number(raw.x)||W/2,0,W),y:clamp(Number(raw.y)||H/2,0,H),down:raw.down===true,right:raw.right===true,events:Array.isArray(raw.events)?raw.events.filter(e=>typeof e==='string'&&/^(dash|swap|interact|pause|resume|inventory|leave|loot|descend|bank|spell:(fireball|lightning|earth)|soul:[012]|upgrade:[0-2])$/.test(e)).slice(0,12):[]};
}
function coopStart(){
 const c=coop;if(!c?.profiles)return;c.active=true;c.lastFrame=c.lastMessage=performance.now();hideModal();$('#mainMenu').classList.add('hidden');$('#hud').classList.remove('hidden');
 for(const k of Object.keys(keys))delete keys[k];mouse.down=mouse.right=false;
 if(c.role==='host'){
  coopBuildMeta=c.profiles[0].meta;game=null;game=new Game(1);const p0=game.player;coopBuildMeta=c.profiles[1].meta;const p1=new Player();coopBuildMeta=null;
  game.coopPlayers=[p0,p1];game.coopPlayers.forEach((p,i)=>{p.coopId=i;p.look=c.profiles[i].look;p.name=c.profiles[i].name;p.x=W/2+(i?40:-40);p.pendingUp=0;p.downed=false;p.revive=0;});game.player=p0;coopPersonalLoot();
 }else{game=null;showModal('<h2>Entrée dans le donjon…</h2><p>Synchronisation avec l’hôte.</p>');}
 const panel=document.createElement('div');panel.id='coopPanel';panel.innerHTML='<span id="coopPartner"></span><button id="coopPause">Pause</button><button id="coopInventory">Inventaire</button><button id="coopExit">Quitter</button>';$('#gameShell').appendChild(panel);
 c.netTimer=setInterval(coopNetwork,66);coopNetwork();
 $('#coopPause').onclick=()=>c.events.push('pause');$('#coopInventory').onclick=()=>c.events.push('inventory');$('#coopExit').onclick=()=>coopDisconnect('Tu as quitté l’expédition coop. L’or non encaissé est perdu.');
}
function coopPersonalLoot(){
 function split(list){const copies=[];for(const d of list){if(d.type==='exit'||d.coopOwner!==undefined)continue;d.coopOwner=0;copies.push({...d,x:clamp(d.x+24,90,W-90),coopOwner:1,weapon:d.weapon?hydrateWeapon(d.weapon):undefined});}list.push(...copies);}
 split(game.drops);if(game.room.shop)split(game.room.shop);
}
function coopDown(p){p.hp=0;p.downed=true;p.revive=0;p.laserCharge=0;p.dashing=0;spellNotice(p.name+' est à terre ! Maintiens E à proximité.');if(game.coopPlayers.every(p=>p.downed))coopFinish(false);}
function coopFinish(cash){
 if(game.coopEnd)return;game.coopEnd={cash,id:game.runId,gold:game.coopPlayers.map(p=>cash?Math.floor(p.gold):0),floor:game.floor};game.paused=true;coop.pauseOwner=null;coopSend({type:'state',data:coopSerialize()});
}
function coopBank(end){
 if(!end.cash)return true;const m=loadMeta();if(m[COOP_RECEIPTS]?.includes(end.id))return true;
 const gold=end.gold[coop.local];if(!Number.isSafeInteger(gold)||gold<0)return false;
 m.bank=(m.bank||0)+gold;m[COOP_RECEIPTS]=[...(m[COOP_RECEIPTS]||[]),end.id];try{localStorage.setItem(META,JSON.stringify(m));return true;}catch{return false;}
}
function coopEvent(id,event){
 const c=coop,p=game.coopPlayers[id];if(!p||game.coopEnd)return;
 if(event==='pause'||event==='inventory'){if(c.pauseOwner===null&&!game.coopPlayers.some(p=>p.choices)&&!game.bossChoice){c.pauseOwner=id;c.pauseKind=event;}return;}
 if(event==='resume'){if(c.pauseOwner===id)c.pauseOwner=null;return;}
 if(event.startsWith('upgrade:')){const n=+event.split(':')[1],index=p.choices?.[n];if(index!==undefined){coopAs(p,()=>UPGRADES[index][2](p));delete p.choices;}return;}
 if(id===0&&game.bossChoice&&!game.coopPlayers.some(p=>p.choices)){
  if(event==='loot'){game.bossChoice=false;return;}if(event==='descend'){game.nextFloor();return;}if(event==='bank'){coopFinish(true);return;}
 }
 if(game.paused||p.downed)return;
 coopAs(p,()=>{if(event==='dash')p.dash();if(event==='swap')p.swapWeapon();if(event.startsWith('spell:'))p.castSpell(event.split(':')[1]);if(event.startsWith('soul:'))p.selectedSoul=+event.split(':')[1];if(event==='interact')coopInteract(p);});
}
function coopInteract(p){
 const partner=game.coopPlayers[1-p.coopId];if(partner.downed&&dist(p,partner)<75)return;
 if(game.drops.some(d=>d.type==='exit'&&dist(p,d)<55)){if(p.coopId===0)game.openBossChoice();else spellNotice('L’hôte décide de la suite au portail.');return;}
 keys.ePress=true;game.handleInteraction();coopPersonalLoot();
}
function coopTickPlayer(p,input,events,dt){
 const backupKeys={...keys},backupMouse={...mouse};for(const k of Object.keys(keys))delete keys[k];Object.assign(keys,input.keys);Object.assign(mouse,{x:input.x||W/2,y:input.y||H/2,down:!!input.down,right:!!input.right});
 try{coopAs(p,()=>{for(const event of events)coopEvent(p.coopId,event);if(!game.paused&&!p.downed)p.update(dt);});}finally{for(const k of Object.keys(keys))delete keys[k];Object.assign(keys,backupKeys);Object.assign(mouse,backupMouse);}
}
function coopPauseState(){
 for(const p of game.coopPlayers)if(p.pendingUp>0&&!p.choices){p.pendingUp--;p.choices=UPGRADES.map((_,i)=>i).sort(()=>Math.random()-.5).slice(0,3);}
 game.paused=!!(game.coopEnd||coop.pauseOwner!==null||game.bossChoice||game.coopPlayers.some(p=>p.choices));
}
function coopHostTick(dt,input){
 coopPauseState();coopTickPlayer(game.coopPlayers[0],input,input.events,dt);coopPauseState();const remote=coop.inputs[1]||{};const events=coop.eventsRemote||[];coop.eventsRemote=[];coopTickPlayer(game.coopPlayers[1],remote,events,dt);coopPauseState();
 if(game.paused)return;
 for(const fx of game.spellEffects||[])fx.life-=dt;game.spellEffects=(game.spellEffects||[]).filter(f=>f.life>0);
 for(const e of game.enemies){coopAs(coopNearest(e),()=>e.update(dt));if(game.coopEnd)return;}
 for(const shot of game.projectiles){const p=shot.owner==='player'?game.coopPlayers[shot.coopOwner??0]:coopNearest({x:shot.x+shot.vx*dt,y:shot.y+shot.vy*dt});coopAs(p,()=>shot.update(dt));if(game.coopEnd)return;}
 for(const a of ['particles','texts'])for(const p of game[a])p.update(dt);
 for(const a of ['trails','slashes'])for(const p of game[a])p.life-=dt;
 for(const a of ['particles','texts','trails','slashes','projectiles'])game[a]=game[a].filter(p=>p.life>0);
 for(const h of game.hazards){h.t-=dt;if(h.armed>0)h.armed-=dt;if(h.t>0&&h.armed<=0){let hit=false;for(const p of game.coopPlayers)if(!p.downed&&dist(h,p)<h.r+p.r){p.hit(h.damage||(h.spike?10:16)*difficulty(game.floor).damage);hit=true;}if(hit)h.armed=h.spike?.8:99;}}game.hazards=game.hazards.filter(h=>h.t>0);
 for(const p of game.coopPlayers){if(!p.downed)continue;const other=game.coopPlayers[1-p.coopId],held=other.coopId===0?input.keys?.e:remote.keys?.e;if(!other.downed&&held&&dist(other,p)<75){p.revive+=dt;if(p.revive>=2){p.downed=false;p.hp=Math.max(1,p.maxHp*.35);p.inv=2;p.revive=0;}}else p.revive=0;}
 coopPersonalLoot();game.player=game.coopPlayers[0];if(!game.player.downed&&game.coopPlayers.every(p=>!p.downed))game.handleDoors();game.shake*=.88;coopPauseState();
}
function coopSerialize(){
 const drop=d=>({...d,item:d.item?.[0],weapon:d.weapon?{...d.weapon,base:undefined}:undefined});
 return {runId:game.runId,floor:game.floor,players:game.coopPlayers.map(p=>({...p,weapon:{...p.weapon,base:undefined},reserveWeapon:p.reserveWeapon?{...p.reserveWeapon,base:undefined}:null})),stats:game.stats,rooms:[...game.rooms].map(([key,r])=>[key,{gx:r.gx,gy:r.gy,type:r.type,visited:r.visited,cleared:r.cleared,locked:r.locked}]),room:{...game.room,loot:undefined,shop:game.room.shop?.map(drop)},drops:game.drops.map(drop),enemies:game.enemies,projectiles:game.projectiles.map(p=>({...p,fire:p instanceof Fireball})),hazards:game.hazards,slashes:game.slashes,trails:game.trails.slice(-20),particles:game.particles.slice(-80),texts:game.texts.slice(-35),spellEffects:game.spellEffects||[],ripples:game.ripples||[],paused:game.paused,bossChoice:!!game.bossChoice,pauseOwner:coop.pauseOwner,pauseKind:coop.pauseKind,end:game.coopEnd||null};
}
function coopReceive(s){
 if(!s||!Array.isArray(s.players)||s.players.length!==2||!Array.isArray(s.rooms)||s.rooms.length>30)return;
 const proto=(v,p)=>Object.assign(Object.create(p),v),drop=d=>({...d,weapon:d.weapon?hydrateWeapon(d.weapon):undefined,item:d.item?ALL_PASSIVES.find(p=>p[0]===d.item):undefined});
 if(!game)game=Object.create(Game.prototype);
 game.runId=s.runId;game.floor=s.floor;game.coopPlayers=s.players.map(p=>{const player=proto(p,Player.prototype);player.weapon=hydrateWeapon(p.weapon);player.reserveWeapon=hydrateWeapon(p.reserveWeapon);return player;});game.player=game.coopPlayers[1];game.stats=s.stats;game.rooms=new Map(s.rooms);game.room={...s.room,shop:s.room.shop?.map(drop)};game.drops=s.drops.map(drop);game.enemies=s.enemies.map(e=>proto(e,e.kind!==undefined?Boss.prototype:Enemy.prototype));game.boss=game.enemies.find(e=>e.kind!==undefined&&!e.dead)||null;game.projectiles=s.projectiles.map(p=>proto(p,p.fire?Fireball.prototype:Projectile.prototype));game.particles=s.particles.map(p=>proto(p,Particle.prototype));game.texts=s.texts.map(p=>proto(p,FloatText.prototype));for(const k of ['hazards','slashes','trails','spellEffects','ripples','paused','bossChoice'])game[k]=s[k];game.coopEnd=s.end;game.shake=0;coop.pauseOwner=s.pauseOwner;coop.pauseKind=s.pauseKind;if(game.coopEnd?.cash)coopBank(game.coopEnd);
}
function coopNetwork(){
 const c=coop;if(!c?.active||c.offline)return;const now=performance.now();
 if(now-c.lastMessage>10000){coopDisconnect('Ton partenaire ou le serveur ne répond plus. La partie a été arrêtée.');return;}
 if(c.role==='host'){if(game)coopSend({type:'state',data:coopSerialize()});}
 else{const input=coopInput({seq:++c.seq,keys,x:mouse.x,y:mouse.y,down:mouse.down,right:mouse.right,events:c.events});c.events=[];coopSend({type:'input',data:input});}
}
function coopFrame(t){
 const c=coop;if(!c?.active)return;const dt=Math.max(0,Math.min(.05,(t-c.lastFrame)/1000));c.lastFrame=t;
 if(c.role==='host'&&!c.offline){const input=coopInput({keys,x:mouse.x,y:mouse.y,down:mouse.down,right:mouse.right,events:c.events});c.events=[];if(t-(c.lastInput||t)>600)c.inputs[1]={keys:{}};if(game)coopHostTick(dt,input);}
 if(!game)return;game.player=game.coopPlayers[c.local];
 // Smooth only visual positions on the guest. Authoritative positions stay intact.
 const original=game.coopPlayers.map(p=>({x:p.x,y:p.y})),roomKey=game.floor+':'+game.room.gx+','+game.room.gy;
 if(c.role==='guest'){
  if(c.viewRoom!==roomKey){c.viewRoom=roomKey;c.viewPlayers=original.map(p=>({...p}));}
  game.coopPlayers.forEach((p,i)=>{const v=c.viewPlayers[i],a=1-Math.exp(-dt*30);v.x+=(p.x-v.x)*a;v.y+=(p.y-v.y)*a;p.x=v.x;p.y=v.y;});
 }
 game.draw();coopDrawLabels();game.coopPlayers.forEach((p,i)=>Object.assign(p,original[i]));updateHud();coopUI();
 const partner=game.coopPlayers[1-c.local];$('#coopPartner').textContent=`${partner.name} · ${partner.downed?'À TERRE — maintiens E près de lui':Math.ceil(partner.hp)+' / '+Math.round(partner.maxHp)+' PV'} · Salon ${c.code}`;
}
function coopDrawLabels(){for(const p of game.coopPlayers){X.save();X.fillStyle=p.downed?'#ff9c97':p.coopId===coop.local?'#93e7d4':'#ecd188';X.textAlign='center';X.font='12px sans-serif';X.fillText(p.name+(p.downed?' · À TERRE':''),p.x,p.y-48-(p.coopId===1&&dist(game.coopPlayers[0],game.coopPlayers[1])<60?16:0));X.strokeStyle=p.coopId===coop.local?'#93e7d4':'#ecd188';X.lineWidth=1.5;X.beginPath();X.ellipse(p.x,p.y+24,17,5,0,0,Math.PI*2);X.stroke();if(p.downed){X.strokeStyle='#ffd085';X.lineWidth=4;X.beginPath();X.arc(p.x,p.y,28,-Math.PI/2,-Math.PI/2+Math.PI*2*p.revive/2);X.stroke();}X.restore();}}
function coopUI(){
 const c=coop,p=game.player,end=game.coopEnd;let key=end?'end':p.choices?'level:'+p.level:game.coopPlayers.some(p=>p.choices)?'waitlevel':game.bossChoice?'boss':c.pauseOwner!==null?'pause:'+c.pauseOwner+':'+c.pauseKind:'play';
 if(c.uiKey===key)return;c.uiKey=key;
 if(key==='play'){hideModal();return;}
 if(end){const ok=coopBank(end);showModal(`<h2>${end.cash?'Expédition encaissée':'Vous êtes tombés ensemble'}</h2><p>Étage ${end.floor} · ${game.stats.kills} ennemis vaincus</p><p>${end.cash?ok?money(end.gold[c.local])+' ajoutées à ta banque.':'Stockage indisponible : clique sur Réessayer avant de quitter.':'L’or de cette expédition est perdu. Tes achats et ta sauvegarde solo sont conservés.'}</p>${!ok?'<button id="coopRetryBank">Réessayer l’encaissement</button>':'<button id="coopEndBack">Retour au menu</button>'}`);if(!ok)$('#coopRetryBank').onclick=()=>{c.uiKey='';coopUI();};else $('#coopEndBack').onclick=()=>coopDisconnect();return;}
 if(p.choices){showModal(`<h2>Niveau ${p.level}</h2><p>Choisis ton amélioration. Le combat reprend après vos deux choix.</p><div class="choices">${p.choices.map((n,i)=>`<button data-coop-up="${i}"><b>${UPGRADES[n][0]}</b><br><small>${UPGRADES[n][1]}</small></button>`).join('')}</div>`);$('#modalCard').querySelectorAll('[data-coop-up]').forEach(b=>b.onclick=()=>{c.events.push('upgrade:'+b.dataset.coopUp);b.disabled=true;});return;}
 if(key==='waitlevel'){showModal('<h2>Ton partenaire choisit son amélioration…</h2><p>Le combat est en pause pour vous deux.</p>');return;}
 if(key==='boss'){showModal(`<h2>Gardien vaincu !</h2><p>Ton or : ${money(p.gold)}. Chacun recevra son propre solde en cas d’encaissement.</p>${c.local===0?'<button data-coop-event="descend">Descendre ensemble</button><button data-coop-event="loot">Récupérer le butin</button><button data-coop-event="bank">Encaisser pour vous deux</button>':'<p>L’hôte choisit la suite de votre expédition.</p>'}`);}
 else if(c.pauseOwner===c.local){showModal(`<h2>${c.pauseKind==='inventory'?'Ton équipement':'Pause partagée'}</h2>${c.pauseKind==='inventory'?`<h3>${p.weapon.name}</h3>${weaponStats(p.weapon,p)}<p>Réserve : ${p.reserveWeapon?.name||'aucune'}</p><div class="inventory">${p.passives.map(name=>`<div class="slot"><b>${name}</b><small>${ALL_PASSIVES.find(a=>a[0]===name)?.[1]||SHOP_ITEMS.find(a=>a.name===name)?.desc||''}</small></div>`).join('')}</div>`:'<p>Le combat est suspendu pour vous deux.</p>'}<button data-coop-event="resume">Reprendre ensemble</button>`);}
 else showModal('<h2>Ton partenaire a mis en pause</h2><p>Il peut reprendre avec Échap ou le bouton Reprendre.</p>');
 $('#modalCard').querySelectorAll('[data-coop-event]').forEach(b=>b.onclick=()=>{c.events.push(b.dataset.coopEvent);b.disabled=true;});
}
// Route input before solo listeners; actions are evaluated once by the host.
document.addEventListener('keydown',e=>{
 if(!coop?.active||e.target?.matches?.('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return;
 const k=e.key.toLowerCase();e.stopImmediatePropagation();if(['tab',' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys[k]=true;if(e.repeat)return;
 const map={' ':'dash',tab:'swap',e:'interact',f:'spell:fireball',r:'spell:lightning',t:'spell:earth','1':'soul:0','2':'soul:1','3':'soul:2',i:'inventory'};
 if(k==='escape'){coop.events.push(coop.pauseOwner===coop.local?'resume':'pause');return;}if(map[k])coop.events.push(map[k]);
},true);
window.addEventListener('blur',e=>{if(e.target!==window||!coop?.active)return;for(const k of Object.keys(keys))delete keys[k];mouse.down=mouse.right=false;if(coop.role==='host'&&coop.pauseOwner===null){coop.pauseOwner=0;coop.pauseKind='pause';if(game)game.paused=true;}else coop.events.push('pause');coopNetwork();},true);
const coopSoloPause=pauseMenu;pauseMenu=function(){if(coop?.active){coop.events.push('pause');return;}return coopSoloPause();};
const coopSoloLevel=Game.prototype.levelUp;Game.prototype.levelUp=function(){if(!coop?.active)return coopSoloLevel.call(this);this.player.pendingUp=(this.player.pendingUp||0)+1;};
const coopSoloBossChoice=Game.prototype.openBossChoice;Game.prototype.openBossChoice=function(){if(!coop?.active)return coopSoloBossChoice.call(this);this.bossChoice=true;this.paused=true;};
const coopSoloGrant=Game.prototype.grantSoul;Game.prototype.grantSoul=function(k){if(!coop?.active)return coopSoloGrant.call(this,k);for(const p of this.coopPlayers)coopAs(p,()=>coopSoloGrant.call(this,k));};
const coopSoloRoom=Game.prototype.enterRoom;Game.prototype.enterRoom=function(r,first=false){coopSoloRoom.call(this,r,first);if(!coop?.active||!this.coopPlayers)return;for(const e of this.enemies)if(!e.coopScaled){e.maxHp*=1.65;e.hp*=1.65;e.coopScaled=true;}for(const p of this.coopPlayers){p.x=W/2+(p.coopId?40:-40);p.y=H/2;p.laserCharge=0;}coopPersonalLoot();};
const coopSoloEquip=equipDrop;equipDrop=function(d){const before=game.drops.length;coopSoloEquip(d);if(coop?.active)for(const extra of game.drops.slice(before))extra.coopOwner=game.player.coopId;};
const coopSoloHit=Enemy.prototype.hit;Enemy.prototype.hit=function(d,a,k,source){if(!coop?.active)return coopSoloHit.call(this,d,a,k,source);const owner=source?.coopOwner??game.player.coopId;return coopAs(game.coopPlayers[owner]||game.player,()=>coopSoloHit.call(this,d,a,k,source));};
const coopSoloStatus=statusTick;statusTick=function(e,dt){if(!coop?.active||e.burnOwner===undefined)return coopSoloStatus(e,dt);return coopAs(game.coopPlayers[e.burnOwner],()=>coopSoloStatus(e,dt));};
const coopSoloBurn=applyBurn;applyBurn=function(e,d,source){coopSoloBurn(e,d,source);if(coop?.active)e.burnOwner=game.player.coopId;};
const coopSoloSpellClick=$('#spellBar').onclick;$('#spellBar').onclick=e=>{if(!coop?.active)return coopSoloSpellClick(e);const b=e.target.closest('[data-spell]');if(b)coop.events.push('spell:'+b.dataset.spell);};
const coopSoloSoulClick=$('#soulBar').onclick;$('#soulBar').onclick=e=>{if(!coop?.active)return coopSoloSoulClick(e);const b=e.target.closest('[data-soul]');if(b)coop.events.push('soul:'+b.dataset.soul);};

})();
