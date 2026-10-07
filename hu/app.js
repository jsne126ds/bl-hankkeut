const defs=[
  ['datingReward','연애 보상','본편에서 두 사람이 연인이 된 뒤의 모습이 충분히 나왔나요?'],
  ['gongAffection','공의 애정','공이 먼저 표현하거나 매달리거나 필요로 하는 모습이 충분히 나왔나요?'],
  ['suAffection','수의 애정','수가 먼저 표현하거나 매달리거나 필요로 하는 모습이 충분히 나왔나요?'],
  ['loveIntensity','사랑의 크기','서로가 서로를 얼마나 중요하게 여기고 있는지 충분히 드러났나요?'],
  ['dailyLife','일상·생활','데이트·휴일·여행·식사·귀가·동거처럼 둘이 함께 생활하는 모습이 충분히 나왔나요?'],
  ['vulnerability','약한 모습','공·수 모두 아픔·취함·피로·불안 등 평소보다 약해진 모습을 충분히 보여 줬나요?'],
  ['outsiderView','주변인 시선','가족·친구·동료 등이 두 사람의 관계를 알거나 바라보는 장면이 충분히 나왔나요?'],
  ['relationshipProgress','관계의 다음 단계','동거·결혼·이사·진로·미래 계획 등 관계가 더 나아가는 모습이 충분히 나왔나요?'],
  ['canonSupplement','본편 보완','다른 인물의 시점, 생략된 장면, 약속·대사·장소처럼 본편에서 보여 줄 만한 부분을 충분히 다뤘나요?'],
  ['stableHappiness','안정된 행복','본편의 갈등이 끝난 뒤 두 사람이 편안하고 행복하게 지내는 모습이 충분히 나왔나요?']
];

const labels={1:'보완하지 않아도 됨',2:'조금 보완하면 좋음',3:'한 번쯤 보완하고 싶음',4:'외전에서 꽤 중요하게 보완하고 싶음',5:'외전에서 꼭 보완하고 싶음'};
const priorityWeights={1:2,2:3,3:5,4:8,5:12};
const relationMap={'썸':'earlyDating','연애 초반':'earlyDating','안정된 연애':'stableDating','반동거':'semiCohabiting','동거':'cohabiting','결혼':'married'};
const stageOrder={earlyDating:0,stableDating:1,semiCohabiting:2,cohabiting:3,married:4};
const detailDefs={
  omegaverse:[['pheromone','페로몬'],['heatRut','히트·러트'],['imprinting','각인'],['secondaryGenderManagement','형질 관리'],['pheromoneDetectableByPartner','상대의 페로몬 감지'],['institutionalizedSecondaryGender','형질 제도'],['secondaryGenderChange','후천적 형질 변화'],['formalSecondaryGenderTesting','공식 형질 검사'],['partnerRegistration','파트너 등록']],
  guideverse:[['exclusivePairSystem','전속 페어'],['matchingScore','매칭률'],['runawayRisk','폭주 위험'],['organizationSystem','센터·기관'],['contactGuiding','접촉 가이딩']],
  hunter:[['dungeonGate','던전·게이트'],['guildSystem','길드'],['gradeOrRankingSystem','등급·랭킹'],['publicHunter','공개 헌터'],['publicMissionInfo','공개 임무 정보']],
  beast:[['scentSensitivity','체향·후각'],['partialTraits','귀·꼬리 등 부분 발현'],['territorialInstinct','영역 본능'],['packCulture','무리 문화'],['fullTransform','완전 수인화'],['speciesCustoms','종족 관습']]
};

const LOCK_KEY='bl-hankkeut-hu-settings-lock-v1';
const CHECKLIST_LOCK_KEY='bl-hankkeut-hu-checklist-lock-v1';
const state={world:'modern',sub:'omegaverse',cohabit:'no',publicity:'no',checks:{},details:new Set(),recent:[],locked:false,checklistLocked:false,roleSwap:false};
defs.forEach(d=>state.checks[d[0]]={enabled:false,priority:3});

function lockButtonState(){
  const b=document.getElementById('settingsLock');
  if(!b)return;
  b.classList.toggle('active',state.locked);
  b.setAttribute('aria-pressed',String(state.locked));
  b.textContent=state.locked?'🔒 잠금됨':'🔓 잠금 안 됨';
  b.setAttribute('aria-label',state.locked?'작품 설정 잠금됨 — 클릭하면 잠금 해제':'작품 설정 잠금 안 됨 — 클릭하면 잠금');
  b.title=state.locked?'클릭하면 설정 잠금이 해제돼요.':'클릭하면 현재 설정을 저장하고 잠가요.';
}
function checklistLockButtonState(){
  const b=document.getElementById('checklistLock');
  if(!b)return;
  b.classList.toggle('active',state.checklistLocked);
  b.setAttribute('aria-pressed',String(state.checklistLocked));
  b.textContent=state.checklistLocked?'🔒 잠금됨':'🔓 잠금 안 됨';
  b.setAttribute('aria-label',state.checklistLocked?'체크리스트 잠금됨 — 클릭하면 잠금 해제':'체크리스트 잠금 안 됨 — 클릭하면 잠금');
  b.title=state.checklistLocked?'클릭하면 체크리스트 잠금이 해제돼요.':'클릭하면 현재 체크리스트를 저장하고 잠가요.';
}
function currentChecklist(){
  return Object.fromEntries(Object.entries(state.checks).map(([k,v])=>[k,{enabled:!!v.enabled,priority:Number(v.priority)||3}]));
}
function saveLockedChecklist(){
  if(!state.checklistLocked)return;
  try{localStorage.setItem(CHECKLIST_LOCK_KEY,JSON.stringify(currentChecklist()));}catch(e){console.warn('체크리스트 저장 실패',e);}
}
function clearLockedChecklist(){
  try{localStorage.removeItem(CHECKLIST_LOCK_KEY);}catch(e){console.warn('체크리스트 삭제 실패',e);}
}
function applyChecklistState(){
  document.querySelectorAll('.check-card').forEach(card=>{
    const key=card.dataset.key;
    const value=state.checks[key]||{enabled:false,priority:3};
    card.classList.toggle('enabled',value.enabled);
    card.querySelectorAll('.yn').forEach(x=>x.classList.toggle('active',value.enabled?x.dataset.on==='no':x.dataset.on==='yes'));
    card.querySelectorAll('.prio').forEach(x=>x.classList.toggle('active',+x.dataset.p===value.priority));
    const t=card.querySelector('.priority-text');
    if(t)t.textContent=`${value.priority} · ${labels[value.priority]}`;
  });
}
function restoreLockedChecklist(){
  let saved=null;
  try{
    const raw=localStorage.getItem(CHECKLIST_LOCK_KEY);
    if(raw)saved=JSON.parse(raw);
  }catch(e){console.warn('체크리스트 불러오기 실패',e);}
  state.checklistLocked=!!saved;
  if(saved){
    Object.keys(state.checks).forEach(k=>{
      const v=saved[k];
      state.checks[k]={enabled:!!v?.enabled,priority:Number(v?.priority)||3};
    });
    applyChecklistState();
  }
  checklistLockButtonState();
}

function currentSettings(){
  return {
    title:document.getElementById('title')?.value||'',
    gong:document.getElementById('gong')?.value||'',
    su:document.getElementById('su')?.value||'',
    world:state.world,
    sub:state.sub,
    relation:document.getElementById('relation')?.value||'안정된 연애',
    cohabit:state.cohabit,
    publicity:state.publicity,
    details:[...state.details]
  };
}
function saveLockedSettings(){
  if(!state.locked)return;
  try{localStorage.setItem(LOCK_KEY,JSON.stringify(currentSettings()));}catch(e){console.warn('설정 저장 실패',e);}
}
function clearLockedSettings(){
  try{localStorage.removeItem(LOCK_KEY);}catch(e){console.warn('설정 삭제 실패',e);}
}
function setSettingsFromSaved(saved){
  if(!saved)return;
  document.getElementById('title').value=saved.title||'';
  document.getElementById('gong').value=saved.gong||'';
  document.getElementById('su').value=saved.su||'';
  document.getElementById('relation').value=saved.relation||'안정된 연애';
  state.world=saved.world||'modern';
  state.sub=saved.sub||'omegaverse';
  state.cohabit=saved.cohabit||'no';
  state.publicity=saved.publicity||'no';
  setSegment('world',state.world);
  setSegment('cohabit',state.cohabit);
  setSegment('public',state.publicity);
  document.querySelectorAll('#sub button[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v===state.sub));
  document.getElementById('subWrap').style.display=state.world==='fantasy'?'block':'none';
  renderDetails();
  state.details=new Set(saved.details||[]);
  document.querySelectorAll('#details button[data-req]').forEach(b=>b.classList.toggle('active',state.details.has(b.dataset.req)));
}
function restoreLockedSettings(){
  let saved=null;
  try{
    const raw=localStorage.getItem(LOCK_KEY);
    if(raw)saved=JSON.parse(raw);
  }catch(e){console.warn('설정 불러오기 실패',e);}
  state.locked=!!saved;
  if(saved)setSettingsFromSaved(saved);
  lockButtonState();
}

async function unpackData(){
  const parts=window.HU_DATA_PARTS||[];
  if(parts.length!==5 || parts.some(x=>!x)) throw new Error('데이터 파일을 불러오지 못했어요. 새로고침해 주세요.');
  if(!('DecompressionStream' in window)) throw new Error('이 브라우저에서는 데이터 압축 해제를 지원하지 않아요. 최신 Chrome/Whale에서 열어 주세요.');
  const raw=parts.join('');
  const bin=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
  const stream=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}
const dataPromise=unpackData();

const list=document.getElementById('checkList');
defs.forEach((d,i)=>{
  const card=document.createElement('div');
  card.className='check-card';
  card.dataset.key=d[0];
  let ps='';
  for(let n=1;n<=5;n++) ps+=`<button class="prio ${n===3?'active':''}" data-p="${n}" type="button">${n}</button>`;
  card.innerHTML=`<div class="question"><strong>${i+1}. ${d[1]}</strong><br>${d[2]}</div><div class="controls"><div class="yesno"><button class="yn active" data-on="yes" type="button">예</button><button class="yn" data-on="no" type="button">아니요</button></div><div class="priority"><div class="prio-wrap">${ps}</div><span class="priority-text">3 · ${labels[3]}</span></div></div>`;
  list.appendChild(card);
});

const detailWrap=document.createElement('div');
detailWrap.id='detailWrap';
detailWrap.style.display='none';
detailWrap.innerHTML='<h3>세계관 세부 설정</h3><p class="desc" style="margin-bottom:10px">작품에 실제로 있는 설정만 골라 주세요. 선택하지 않은 요소는 결과에서 추정하지 않아요.</p><div class="chips" id="details"></div>';
document.getElementById('subWrap').insertAdjacentElement('afterend',detailWrap);

function renderDetails(){
  const box=document.getElementById('details');
  box.innerHTML='';
  state.details.clear();
  (detailDefs[state.sub]||[]).forEach(([key,label])=>{
    const b=document.createElement('button');
    b.type='button'; b.className='chip'; b.dataset.req=key; b.textContent=label; box.appendChild(b);
  });
  detailWrap.style.display=state.world==='fantasy'?'block':'none';
}

function exclusive(id,cb){
  const box=document.getElementById(id);
  box.addEventListener('click',e=>{
    const b=e.target.closest('button[data-v]');
    if(!b)return;
    box.querySelectorAll('button[data-v]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    cb(b.dataset.v);
  });
}

exclusive('world',v=>{
  state.world=v;
  document.getElementById('subWrap').style.display=v==='fantasy'?'block':'none';
  renderDetails();
  saveLockedSettings();
});
exclusive('cohabit',v=>{
  if(document.getElementById('relation').value==='동거'&&v==='no'){
    state.cohabit='yes';
    setSegment('cohabit','yes');
  }else{
    state.cohabit=v;
  }
  saveLockedSettings();
});
exclusive('public',v=>{state.publicity=v;saveLockedSettings();});

document.getElementById('sub').addEventListener('click',function(e){
  const b=e.target.closest('button[data-v]'); if(!b)return;
  this.querySelectorAll('button[data-v]').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); state.sub=b.dataset.v; renderDetails(); saveLockedSettings();
});

detailWrap.addEventListener('click',e=>{
  const b=e.target.closest('button[data-req]'); if(!b)return;
  const k=b.dataset.req;
  if(state.details.has(k)){state.details.delete(k);b.classList.remove('active');}
  else{state.details.add(k);b.classList.add('active');}
  saveLockedSettings();
});

list.addEventListener('click',e=>{
  const card=e.target.closest('.check-card'); if(!card)return;
  const key=card.dataset.key;
  const yn=e.target.closest('.yn');
  if(yn){
    const needsMore=yn.dataset.on==='no';
    state.checks[key].enabled=needsMore;
    card.classList.toggle('enabled',needsMore);
    card.querySelectorAll('.yn').forEach(x=>x.classList.toggle('active',x===yn));
    saveLockedChecklist();
    return;
  }
  const p=e.target.closest('.prio');
  if(p){
    const n=+p.dataset.p;
    state.checks[key].priority=n;
    card.querySelectorAll('.prio').forEach(x=>x.classList.toggle('active',+x.dataset.p===n));
    card.querySelector('.priority-text').textContent=`${n} · ${labels[n]}`;
    saveLockedChecklist();
  }
});

function profile(){
  return {
    relation:relationMap[document.getElementById('relation').value]||'stableDating',
    cohabit:state.cohabit,
    publicity:state.publicity,
    details:state.details
  };
}

function inStage(item,rel){
  const mn=stageOrder[item.relationStage?.min]??0;
  const mx=stageOrder[item.relationStage?.max]??4;
  const v=stageOrder[rel]??1;
  return v>=mn&&v<=mx;
}

function settingConflict(item,p){
  const t=String(item.text||'');
  if(p.cohabit==='yes'){
    if(['nonCohabitingOnly','nonCohabitingPreferred'].includes(item.cohabitation))return true;
    if(/상대의 집|B의 집|A의 집|자기 집에 초대|집 열쇠를 건네|집 열쇠를 준다|같이 살자|동거를 제안|함께 살 집|자기 물건을 하나씩 두|상대 집에 자기 물건/.test(t))return true;
  }
  if(p.cohabit==='no'){
    if(item.cohabitation==='cohabitingOnly')return true;
    if(/같이 사는 집|공동생활|둘의 집|우리 집이라고 부른다/.test(t))return true;
  }
  if(p.publicity==='yes'){
    if(item.publicity==='secretPreferred')return true;
    if(/관계를 숨기|비밀 연애|사귀는 사이냐고 묻|연인이라고 처음 소개|관계를 처음 밝|몰래 만나/.test(t))return true;
  }
  if(p.publicity==='no'){
    if(item.publicity==='publicRequired')return true;
    if(/공개 연애를 선언|공식 석상에서 연인|관계를 공개적으로 밝/.test(t))return true;
  }
  if(p.relation==='married'){
    if(/사귀자고|연애를 시작|고백을 받아|결혼하자고|프러포즈|동거를 제안|같이 살자/.test(t))return true;
  }
  if(['cohabiting','married'].includes(p.relation)&&/처음으로 상대 집에|처음 집에 초대/.test(t))return true;
  return false;
}

function hardEligible(item,p){
  if(!inStage(item,p.relation))return false;
  if(item.canon?.requirement==='required')return false;
  if((item.requirements||[]).some(req=>!p.details.has(req)))return false;
  if(settingConflict(item,p))return false;
  if((item.boundaryRisk||0)>=3)return false;
  if(state.checks.stableHappiness.enabled&&(item.softConflicts||[]).includes('stableHappinessHigh'))return false;
  return true;
}

function coreReward(){
  const active=defs.filter(d=>state.checks[d[0]].enabled);
  const source=active.length?active:defs;
  const pool=[];
  for(const d of source){
    const c=state.checks[d[0]];
    const w=active.length?priorityWeights[c.priority]:1;
    for(let i=0;i<w;i++)pool.push(d[0]);
  }
  return pool[Math.floor(Math.random()*pool.length)];
}

function rewardScore(item,core){
  let s=(item.rewards?.[core]||0)*8;
  const active=defs.filter(d=>state.checks[d[0]].enabled);
  for(const d of defs){
    const c=state.checks[d[0]];
    const r=item.rewards?.[d[0]]||0;
    if(c.enabled)s+=r*priorityWeights[c.priority]*0.55;
    else if(active.length)s-=r*0.7;
  }
  return s;
}
function gradeBonus(g){return ({S:5,A:3,B:1,C:0,D:-2})[g]??0;}
const rewardKeys=defs.map(d=>d[0]);
function rewardSimilarity(a,b){
  if(!a||!b)return 0;
  let dot=0,aa=0,bb=0;
  for(const k of rewardKeys){
    const x=a.rewards?.[k]||0,y=b.rewards?.[k]||0;
    dot+=x*y; aa+=x*x; bb+=y*y;
  }
  return aa&&bb?dot/Math.sqrt(aa*bb):0;
}
function overlapCount(a,b){
  const bs=new Set(b||[]);
  return (a||[]).filter(x=>bs.has(x)).length;
}
function coherenceScore(item,anchor){
  if(!anchor)return 0;
  let s=rewardSimilarity(item,anchor)*12;
  s+=Math.min(2,overlapCount(item.tone,anchor.tone))*1.5;
  s+=Math.min(2,overlapCount(item.emotions,anchor.emotions))*1.5;
  s-=Math.abs((item.eventIntensity||1)-(anchor.eventIntensity||1))*1.5;
  return s;
}

function score(item,core,p,pattern,anchor){
  let s=rewardScore(item,core)+gradeBonus(item.grade)+coherenceScore(item,anchor);
  if(pattern&&item.corePattern===pattern)s+=8;
  if(state.world==='fantasy'&&item.subWorld?.includes(state.sub))s+=7;
  if(p.cohabit==='yes'&&item.cohabitation==='cohabitingPossible')s+=4;
  if(p.cohabit==='no'&&item.cohabitation==='nonCohabitingPreferred')s+=4;
  if(p.publicity==='no'&&item.publicity==='secretPreferred')s+=4;
  if(p.publicity==='yes'&&item.publicity==='publicPossible')s+=3;
  if(state.checks.stableHappiness.enabled&&item.relationshipRisk>=3)s-=8;
  if(state.checks.dailyLife.enabled&&item.eventIntensity>=4)s-=6;
  if(state.recent.includes(item.recentRepeatKey))s-=10;
  return s;
}

function weightedPick(items,core,p,exclude=new Set(),pattern=null,strictCore=true,anchor=null){
  let eligible=items.filter(x=>!exclude.has(x.id)&&hardEligible(x,p));
  if(!eligible.length)return null;

  if(strictCore){
    const coreItems=eligible.filter(x=>(x.rewards?.[core]||0)>0);
    if(!coreItems.length)return null;
    eligible=coreItems;
  }

  if(pattern){
    const samePattern=eligible.filter(x=>x.corePattern===pattern);
    if(samePattern.length)eligible=samePattern;
  }

  const scored=eligible.map(x=>({x,s:score(x,core,p,pattern,anchor)})).sort((a,b)=>b.s-a.s);
  const top=scored.slice(0,Math.min(14,scored.length));
  const min=Math.min(...top.map(v=>v.s));
  let total=0;
  const rows=top.map(v=>{const w=Math.max(1,Math.round((v.s-min+2)*1.5));total+=w;return {...v,w};});
  let r=Math.random()*total;
  for(const v of rows){r-=v.w;if(r<=0)return v.x;}
  return rows[0].x;
}

function pools(data){
  const base=[...data.common];
  if(state.world==='fantasy')base.push(...(data[state.sub]||[]));
  const by={};
  for(const x of base)(by[x.pool]||(by[x.pool]=[])).push(x);
  return by;
}

function outsiderChance(){
  const c=state.checks.outsiderView;
  if(!c.enabled)return 0;
  return ({1:.2,2:.35,3:.5,4:.7,5:.9})[c.priority]||.5;
}

function syntheticCanonAnchor(){
  return {
    id:'SAFE_CANON_ANCHOR',
    pool:'payoff',
    text:'본편에서 이미 나온 장면이나 약속 하나를 다른 인물의 시점에서 다시 보여 주되, 새로운 설정을 덧붙이지 않고 당시의 감정과 의미만 보완한다.',
    grade:'S',
    corePattern:'canonSafe',
    rewards:{canonSupplement:5,stableHappiness:2},
    tone:['calm'],
    emotions:['affection'],
    eventIntensity:1,
    relationshipRisk:0,
    boundaryRisk:0,
    recentRepeatKey:'canon_safe_anchor'
  };
}
function pickCoreAnchor(by,core,p,used){
  const fallbackPools={
    outsiderView:['payoff','outsider','turn','action'],
    dailyLife:['payoff','action','ending'],
    stableHappiness:['payoff','ending','action'],
    relationshipProgress:['payoff','action','turn'],
    canonSupplement:['payoff','action','turn','ending']
  };
  const poolsToTry=fallbackPools[core]||['payoff'];
  for(const pool of poolsToTry){
    const x=weightedPick(by[pool]||[],core,p,used,null,true,null);
    if(x)return x;
  }
  if(core==='canonSupplement')return syntheticCanonAnchor();
  return weightedPick(by.payoff||[],core,p,used,null,false,null);
}

function chooseSequence(by,core,p){
  const used=new Set();

  const payoff=pickCoreAnchor(by,core,p,used);
  if(payoff)used.add(payoff.id);
  const pattern=payoff?.corePattern||null;

  const take=pool=>{
    let x=weightedPick(by[pool]||[],core,p,used,pattern,true,payoff);
    if(!x)x=weightedPick(by[pool]||[],core,p,used,null,true,payoff);
    if(!x)x=weightedPick(by[pool]||[],core,p,used,null,false,payoff);
    if(x)used.add(x.id);
    return x;
  };

  const stageRank={suppression:1,action:2,expression:3,admission:4,resolution:5};
  const takeAction=minRank=>{
    let candidates=(by.action||[]).filter(x=>(stageRank[x.progressionStage]||2)>=minRank);
    let x=weightedPick(candidates,core,p,used,pattern,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,false,payoff);
    if(x)used.add(x.id);
    return x;
  };

  const start=take('start');
  const trigger=take('trigger');
  const action1=takeAction(1);
  const firstRank=stageRank[action1?.progressionStage]||2;
  const action2=Math.random()<.3?takeAction(firstRank):null;
  const turn=take('turn');
  const outsider=payoff?.pool==='outsider'?null:(Math.random()<outsiderChance()?take('outsider'):null);
  const ending=take('ending');
  return {start,trigger,action1,action2,turn,outsider,payoff,ending};
}

function addRecent(parts){
  for(const x of Object.values(parts))if(x?.recentRepeatKey)state.recent.push(x.recentRepeatKey);
  state.recent=[...new Set(state.recent)].slice(-24);
}

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function trimPeriod(t){return String(t||'').trim().replace(/[.!?]+$/,'');}
function summary(parts){
  const start=trimPeriod(parts.start?.text);
  const trigger=trimPeriod(parts.trigger?.text);
  const payoff=String(parts.payoff?.text||'').trim();
  return applyNames([start,trigger,payoff].filter(Boolean).join(' → '));
}
function hasBatchim(word){
  const chars=Array.from(String(word||'').trim());
  const last=chars[chars.length-1]||'';
  const code=last.charCodeAt(0);
  if(code<0xAC00||code>0xD7A3)return null;
  return (code-0xAC00)%28!==0;
}
function chooseJosa(name,particle){
  const batchim=hasBatchim(name);
  if(batchim===null)return particle;
  const pairs={
    '가':['이','가'],
    '이':['이','가'],
    '는':['은','는'],
    '은':['은','는'],
    '를':['을','를'],
    '을':['을','를'],
    '와':['과','와'],
    '과':['과','와']
  };
  const pair=pairs[particle];
  return pair?(batchim?pair[0]:pair[1]):particle;
}
function replaceRole(text,token,name){
  const variable='가|이|는|은|를|을|와|과';
  const re=new RegExp(token+'('+variable+')?','g');
  return String(text??'').replace(re,(full,particle)=>{
    return name+(particle?chooseJosa(name,particle):'');
  });
}
function applyNames(text){
  const gong=document.getElementById('gong').value.trim()||'공';
  const su=document.getElementById('su').value.trim()||'수';
  const a=state.roleSwap?su:gong;
  const b=state.roleSwap?gong:su;
  return replaceRole(replaceRole(String(text??''),'A',a),'B',b);
}
function row(label,text,cls=''){
  return `<div class="result-row ${cls}"><div class="result-label">${esc(label)}</div><div class="result-text">${esc(applyNames(text))}</div></div>`;
}
function rewardExplanation(core){
  const top=defs
    .map(d=>({label:d[1],...state.checks[d[0]]}))
    .filter(x=>x.enabled)
    .sort((a,b)=>b.priority-a.priority)
    .slice(0,2)
    .map(x=>x.label);
  if(!top.length)return `${core}을 중심으로 본편 이후의 관계 보상을 자연스럽게 보여 주는 구성입니다.`;
  return `${top.join('·')}을 우선해, ${core}이 가장 선명하게 남도록 구성했어요.`;
}

async function generate(){
  const buttons=[document.getElementById('generate'),document.getElementById('again')];
  buttons.forEach(b=>{if(b)b.disabled=true;});
  const main=document.getElementById('generate');
  const old=main.textContent; main.textContent='외전 구성 중…';
  try{
    const data=await dataPromise;
    const p=profile();
    const core=coreReward();
    state.roleSwap=core==='suAffection'?true:core==='gongAffection'?false:Math.random()<.5;
    const by=pools(data);
    const parts=chooseSequence(by,core,p);
    addRecent(parts);
    const coreLabel=defs.find(d=>d[0]===core)?.[1]||'관계 보상';
    const title=document.getElementById('title').value.trim();
    const gong=document.getElementById('gong').value.trim();
    const su=document.getElementById('su').value.trim();
    document.getElementById('resultTitle').textContent=title?`${title} · ${coreLabel} 외전`:`${coreLabel} 중심 외전`;
    const worldLabel=state.world==='modern'?'현대':document.querySelector('#sub .active')?.textContent||'현대판타지';
    const tags=[coreLabel,worldLabel,document.getElementById('relation').value];
    if(gong&&su)tags.push(`${gong} × ${su}`);
    document.getElementById('tags').innerHTML=tags.map(x=>`<span class="tag">${esc(x)}</span>`).join('');
    const scene=[parts.action1?.text,parts.action2?.text,parts.outsider?.text].filter(Boolean).join(' ');
    const rows=[
      ['에피소드 한 줄 요약',summary(parts),''],
      ['시작 상황',parts.start?.text||'두 사람이 평범한 시간을 함께 보내기 시작한다.',''],
      ['촉발 사건',parts.trigger?.text||'사소한 계기로 평소와 다른 선택을 하게 된다.',''],
      ['1차 장면',scene||'두 사람이 서로의 반응을 확인하는 장면이 이어진다.',''],
      ['상황 변화',parts.turn?.text||'감춰 두던 마음이 예상보다 먼저 드러난다.',''],
      ['핵심 장면',parts.payoff?.text||'두 사람이 서로의 마음을 직접 확인한다.','payoff'],
      ['독자 보상',rewardExplanation(coreLabel),'reward'],
      ['마무리 장면',parts.ending?.text||'둘은 달라진 관계를 자연스럽게 일상 속에 남긴다.','']
    ];
    document.getElementById('resultGrid').innerHTML=rows.map(r=>row(...r)).join('');
    const result=document.getElementById('result');
    result.classList.add('show');
    result.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
    console.error(err);
    alert(`외전을 만드는 중 문제가 생겼어요. ${err.message}`);
  }finally{
    buttons.forEach(b=>{if(b)b.disabled=false;});
    main.textContent=old;
  }
}

function setSegment(id,value){
  document.querySelectorAll(`#${id} button[data-v]`).forEach(b=>b.classList.toggle('active',b.dataset.v===value));
}
function resetAll(){
  if(!state.locked){
    document.getElementById('title').value='';
    document.getElementById('gong').value='';
    document.getElementById('su').value='';
    document.getElementById('relation').value='안정된 연애';
    state.world='modern'; state.sub='omegaverse'; state.cohabit='no'; state.publicity='no'; state.details.clear();
    setSegment('world','modern'); setSegment('cohabit','no'); setSegment('public','no');
    document.querySelectorAll('#sub button[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v==='omegaverse'));
    document.getElementById('subWrap').style.display='none';
    detailWrap.style.display='none'; renderDetails(); detailWrap.style.display='none';
  }
  state.recent=[];
  if(!state.checklistLocked){
    Object.keys(state.checks).forEach(k=>state.checks[k]={enabled:false,priority:3});
    applyChecklistState();
  }
  document.getElementById('result').classList.remove('show');
}

document.getElementById('checklistLock').addEventListener('click',()=>{
  state.checklistLocked=!state.checklistLocked;
  if(state.checklistLocked)saveLockedChecklist();
  else clearLockedChecklist();
  checklistLockButtonState();
});

document.getElementById('settingsLock').addEventListener('click',()=>{
  state.locked=!state.locked;
  if(state.locked)saveLockedSettings();
  else clearLockedSettings();
  lockButtonState();
});
['title','gong','su'].forEach(id=>document.getElementById(id).addEventListener('input',saveLockedSettings));
document.getElementById('relation').addEventListener('change',()=>{
  if(document.getElementById('relation').value==='동거'){
    state.cohabit='yes';
    setSegment('cohabit','yes');
  }
  saveLockedSettings();
});
renderDetails();
detailWrap.style.display='none';
restoreLockedSettings();
restoreLockedChecklist();

document.getElementById('generate').onclick=generate;
document.getElementById('again').onclick=generate;
document.getElementById('reset').onclick=resetAll;
