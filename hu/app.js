const defs=[
  ['datingReward','연애 보상'],
  ['gongAffection','공의 애정'],
  ['suAffection','수의 애정'],
  ['loveIntensity','사랑의 크기'],
  ['dailyLife','일상·생활'],
  ['vulnerability','약한 모습'],
  ['outsiderView','주변인 시선'],
  ['relationshipProgress','관계 진전'],
  ['canonSupplement','본편 보완'],
  ['stableHappiness','안정된 행복']
];
const rewardKeys=defs.map(d=>d[0]);
const relationMap={'썸':'earlyDating','연애 초반':'earlyDating','안정된 연애':'stableDating','반동거':'semiCohabiting','동거':'cohabiting','결혼':'married'};
const stageOrder={earlyDating:0,stableDating:1,semiCohabiting:2,cohabiting:3,married:4};
const detailDefs={
  omegaverse:[['pheromone','페로몬'],['heatRut','히트·러트'],['imprinting','각인'],['secondaryGenderManagement','형질 관리'],['pheromoneDetectableByPartner','상대의 페로몬 감지'],['institutionalizedSecondaryGender','형질 제도'],['secondaryGenderChange','후천적 형질 변화'],['formalSecondaryGenderTesting','공식 형질 검사'],['partnerRegistration','파트너 등록']],
  guideverse:[['exclusivePairSystem','전속 페어'],['matchingScore','매칭률'],['runawayRisk','폭주 위험'],['organizationSystem','센터·기관'],['contactGuiding','접촉 가이딩']],
  hunter:[['dungeonGate','던전·게이트'],['guildSystem','길드'],['gradeOrRankingSystem','등급·랭킹'],['publicHunter','공개 헌터'],['publicMissionInfo','공개 임무 정보']],
  beast:[['scentSensitivity','체향·후각'],['partialTraits','귀·꼬리 등 부분 발현'],['territorialInstinct','영역 본능'],['packCulture','무리 문화'],['fullTransform','완전 수인화'],['speciesCustoms','종족 관습']]
};

const LOCK_KEY='bl-hankkeut-hu-settings-lock-v1';
const SURVEY_LOCK_KEY='bl-hankkeut-hu-survey-lock-v1';
const state={
  world:'modern',sub:'omegaverse',cohabit:'no',publicity:'no',details:new Set(),recent:[],
  locked:false,surveyLocked:false,affectionDirection:'same',leadDirection:'equal',
  jobContext:'',couplePoint:'',forbiddenBehavior:'',canonMaterial:'',roleSwap:false
};

function lockButtonState(){
  const b=document.getElementById('settingsLock');
  if(!b)return;
  b.classList.toggle('active',state.locked);
  b.setAttribute('aria-pressed',String(state.locked));
  b.textContent=state.locked?'🔒 잠금됨':'🔓 잠금 안 됨';
  b.setAttribute('aria-label',state.locked?'작품 설정 잠금됨 — 클릭하면 잠금 해제':'작품 설정 잠금 안 됨 — 클릭하면 잠금');
  b.title=state.locked?'클릭하면 설정 잠금이 해제돼요.':'클릭하면 현재 설정을 저장하고 잠가요.';
}
function surveyLockButtonState(){
  const b=document.getElementById('surveyLock');
  if(!b)return;
  b.classList.toggle('active',state.surveyLocked);
  b.setAttribute('aria-pressed',String(state.surveyLocked));
  b.textContent=state.surveyLocked?'🔒 잠금됨':'🔓 잠금 안 됨';
  b.setAttribute('aria-label',state.surveyLocked?'설문 잠금됨 — 클릭하면 잠금 해제':'설문 잠금 안 됨 — 클릭하면 잠금');
  b.title=state.surveyLocked?'클릭하면 설문 잠금이 해제돼요.':'클릭하면 현재 설문을 저장하고 잠가요.';
}
function currentSettings(){
  return {
    world:state.world,sub:state.sub,
    relation:document.getElementById('relation')?.value||'안정된 연애',
    cohabit:state.cohabit,publicity:state.publicity,details:[...state.details]
  };
}
function saveLockedSettings(){
  if(!state.locked)return;
  try{localStorage.setItem(LOCK_KEY,JSON.stringify(currentSettings()));}catch(e){console.warn('설정 저장 실패',e);}
}
function clearLockedSettings(){
  try{localStorage.removeItem(LOCK_KEY);}catch(e){console.warn('설정 삭제 실패',e);}
}
function currentSurvey(){
  return {
    affectionDirection:state.affectionDirection,
    leadDirection:state.leadDirection,
    jobContext:state.jobContext,
    couplePoint:state.couplePoint,
    forbiddenBehavior:state.forbiddenBehavior,
    canonMaterial:state.canonMaterial
  };
}
function saveLockedSurvey(){
  if(!state.surveyLocked)return;
  try{localStorage.setItem(SURVEY_LOCK_KEY,JSON.stringify(currentSurvey()));}catch(e){console.warn('설문 저장 실패',e);}
}
function clearLockedSurvey(){
  try{localStorage.removeItem(SURVEY_LOCK_KEY);}catch(e){console.warn('설문 삭제 실패',e);}
}
function setSegment(id,value){
  document.querySelectorAll(`#${id} button[data-v]`).forEach(b=>b.classList.toggle('active',b.dataset.v===value));
}
function setSettingsFromSaved(saved){
  if(!saved)return;
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
  try{const raw=localStorage.getItem(LOCK_KEY);if(raw)saved=JSON.parse(raw);}catch(e){console.warn('설정 불러오기 실패',e);}
  state.locked=!!saved;
  if(saved)setSettingsFromSaved(saved);
  lockButtonState();
}
function applySurveyState(){
  setSegment('affectionDirection',state.affectionDirection);
  setSegment('leadDirection',state.leadDirection);
  document.getElementById('jobContext').value=state.jobContext;
  document.getElementById('couplePoint').value=state.couplePoint;
  document.getElementById('forbiddenBehavior').value=state.forbiddenBehavior;
  document.getElementById('canonMaterial').value=state.canonMaterial;
}
function restoreLockedSurvey(){
  let saved=null;
  try{const raw=localStorage.getItem(SURVEY_LOCK_KEY);if(raw)saved=JSON.parse(raw);}catch(e){console.warn('설문 불러오기 실패',e);}
  state.surveyLocked=!!saved;
  if(saved){
    state.affectionDirection=saved.affectionDirection||'same';
    state.leadDirection=saved.leadDirection||'equal';
    state.jobContext=saved.jobContext||'';
    state.couplePoint=saved.couplePoint||'';
    state.forbiddenBehavior=saved.forbiddenBehavior||'';
    state.canonMaterial=saved.canonMaterial||'';
    applySurveyState();
  }
  surveyLockButtonState();
}

async function unpackData(){
  const parts=window.HU_DATA_PARTS||[];
  if(parts.length!==5||parts.some(x=>!x))throw new Error('데이터 파일을 불러오지 못했어요. 새로고침해 주세요.');
  if(!('DecompressionStream' in window))throw new Error('이 브라우저에서는 데이터 압축 해제를 지원하지 않아요. 최신 Chrome/Whale에서 열어 주세요.');
  const raw=parts.join('');
  const bin=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
  const stream=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}
const dataPromise=unpackData();

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
    b.type='button';b.className='chip';b.dataset.req=key;b.textContent=label;box.appendChild(b);
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
  renderDetails();saveLockedSettings();
});
exclusive('cohabit',v=>{
  if(document.getElementById('relation').value==='동거'&&v==='no'){
    state.cohabit='yes';setSegment('cohabit','yes');
  }else state.cohabit=v;
  saveLockedSettings();
});
exclusive('public',v=>{state.publicity=v;saveLockedSettings();});
exclusive('affectionDirection',v=>{state.affectionDirection=v;saveLockedSurvey();});
exclusive('leadDirection',v=>{state.leadDirection=v;saveLockedSurvey();});

document.getElementById('sub').addEventListener('click',function(e){
  const b=e.target.closest('button[data-v]');if(!b)return;
  this.querySelectorAll('button[data-v]').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');state.sub=b.dataset.v;renderDetails();saveLockedSettings();
});
detailWrap.addEventListener('click',e=>{
  const b=e.target.closest('button[data-req]');if(!b)return;
  const k=b.dataset.req;
  if(state.details.has(k)){state.details.delete(k);b.classList.remove('active');}
  else{state.details.add(k);b.classList.add('active');}
  saveLockedSettings();
});
['jobContext','couplePoint','forbiddenBehavior','canonMaterial'].forEach(id=>{
  document.getElementById(id).addEventListener('input',e=>{
    state[id]=e.target.value;
    saveLockedSurvey();
  });
});

function profile(){
  return {
    relation:relationMap[document.getElementById('relation').value]||'stableDating',
    cohabit:state.cohabit,publicity:state.publicity,details:state.details
  };
}
function inStage(item,rel){
  const mn=stageOrder[item.relationStage?.min]??0;
  const mx=stageOrder[item.relationStage?.max]??4;
  const v=stageOrder[rel]??1;
  return v>=mn&&v<=mx;
}
function normalizeFreeText(text){
  return String(text||'')
    .replace(/[•●■▪︎▶︎→]+/g,' ')
    .replace(/[|]+/g,' / ')
    .replace(/\s*[:：]\s*/g,':')
    .replace(/\s+/g,' ')
    .trim();
}
function entries(text){
  const raw=String(text||'')
    .replace(/[•●■▪︎▶︎→]+/g,'\n')
    .replace(/[|]+/g,'/');
  return raw.split(/[\n,;·/]+/).map(x=>x.trim()).filter(Boolean);
}
function keywords(text){
  const stop=new Set([
    '그리고','하지만','그런데','정도','모습','상대','둘이','두 사람','하는','하지','않음','없음','있음','같은','때는','에게','에서','으로',
    '공은','수는','공이','수가','공','수','쪽','매우','조금','자주','많음','적음','느낌','성격','관계','직업','업무','변수','포인트'
  ]);
  return [...new Set(
    normalizeFreeText(text)
      .replace(/[^가-힣A-Za-z0-9\s]/g,' ')
      .split(/\s+/)
      .map(x=>x.trim())
      .filter(x=>x.length>=2&&!stop.has(x))
  )];
}
function analyzeFreeText(text){
  const raw=normalizeFreeText(text);
  const chunks=entries(text);
  const tokens=keywords(text);
  const has=re=>re.test(raw);
  const concepts=new Set();

  const rules=[
    ['workBusy',/출장|당직|야근|교대|밤샘|바쁨|바빠|과로|스케줄|근무 많|일 많|콜 많/],
    ['workTogether',/같은 직장|같은 회사|같은 병원|사내|직장 동료|같은 팀|같은 길드|같이 일|업무상 자주/],
    ['workSeparate',/다른 직장|서로 다른 직장|업무 접점 없|직장 다름/],
    ['publicPrivate',/공사 구분|밖에선|밖에서는|남들 앞|직장에선|회사에선|병원에선|공적인 자리/],
    ['outsider',/동료|직원|상사|부하|팀원|환자|고객|학생|가족|친구|주변인|길드원|멤버/],
    ['clingyGong',/(공[^\n,;/]{0,16}(매달|집착|적극|먼저|표현 많|애교|붙어))|((매달|집착|적극|먼저|애교)[^\n,;/]{0,8}공)/],
    ['clingySu',/(수[^\n,;/]{0,16}(매달|집착|적극|먼저|표현 많|애교|붙어))|((매달|집착|적극|먼저|애교)[^\n,;/]{0,8}수)/],
    ['reservedGong',/(공[^\n,;/]{0,16}(무심|표현 적|말 적|덤덤|절제))|((무심|덤덤|절제)[^\n,;/]{0,8}공)/],
    ['reservedSu',/(수[^\n,;/]{0,16}(무심|표현 적|말 적|덤덤|절제))|((무심|덤덤|절제)[^\n,;/]{0,8}수)/],
    ['banControl',/통제|행동 제한|간섭 심|감시|위치 추적|강요/],
    ['banPhone',/휴대폰|핸드폰|폰 검사|메시지 검사|연락처 검사|통화 기록/],
    ['banPublicFight',/공개.*싸|사람들 앞.*싸|직장.*싸|회사.*싸|병원.*싸|공개석상.*싸|언성 높/],
    ['vulnerable',/아픔|아프|취함|취해|불안|피곤|과로|밤샘|당직|울음|우는|약한 모습|부상/],
    ['daily',/일상|데이트|여행|식사|퇴근|귀가|주말|휴일|집안일|장보기|생활/],
    ['future',/결혼|동거|이사|미래|약속|진로|이직|승진|전근|복귀|퇴사|유학/],
    ['canonPeople',/직원|동료|가족|친구|형|누나|동생|상사|부하|환자|대표|전무|의사|교수/],
    ['canonPlace',/병원|회사|집|호텔|학교|길드|센터|별장|출장지|사무실|연수원/],
    ['canonObject',/반지|넥타이|벨트|선물|편지|사진|휴대폰|열쇠|차|옷|약속|호칭|대사/]
  ];
  for(const [name,re] of rules)if(has(re))concepts.add(name);

  return {raw,chunks,tokens,concepts};
}
function subjectiveSignals(){
  return {
    job:analyzeFreeText(state.jobContext),
    couple:analyzeFreeText(state.couplePoint),
    forbidden:analyzeFreeText(state.forbiddenBehavior),
    canon:analyzeFreeText(state.canonMaterial)
  };
}
function forbiddenConflict(text){
  const target=normalizeFreeText(text);
  const rule=state.forbiddenBehavior;
  const sig=analyzeFreeText(rule);

  if(sig.concepts.has('banControl')
      && /(질투|소유욕|불안).*(통제|간섭|제한|막|금지|감시)|일정에 간섭|행동을 제한|위치를 확인/.test(target))return true;
  if(sig.concepts.has('banPhone')
      && /휴대폰|핸드폰|메시지|연락처|통화 기록|폰을 확인/.test(target))return true;
  if(sig.concepts.has('banPublicFight')
      && /(공개|사람들 앞|직장|회사|병원|공식).*(싸우|다투|언성|감정적으로)|언성을 높/.test(target))return true;

  for(const phrase of entries(rule)){
    const clean=phrase.replace(/\s+/g,' ');
    if(clean.length>=2&&target.includes(clean))return true;
    const ks=keywords(phrase);
    if(ks.length>=2&&ks.filter(k=>target.includes(k)).length>=2)return true;
  }
  return false;
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
  if(p.relation==='married'&&/사귀자고|연애를 시작|고백을 받아|결혼하자고|프러포즈|동거를 제안|같이 살자/.test(t))return true;
  if(['cohabiting','married'].includes(p.relation)&&/처음으로 상대 집에|처음 집에 초대/.test(t))return true;
  return false;
}
function hardEligible(item,p){
  if(!inStage(item,p.relation))return false;
  if(item.canon?.requirement==='required')return false;
  if((item.requirements||[]).some(req=>!p.details.has(req)))return false;
  if(settingConflict(item,p))return false;
  if(forbiddenConflict(item.text))return false;
  if((item.boundaryRisk||0)>=3)return false;
  if((item.softConflicts||[]).includes('stableHappinessHigh')&&document.getElementById('relation').value==='결혼'&&state.couplePoint.includes('안정'))return false;
  return true;
}
function inferredCoreWeights(){
  const rel=document.getElementById('relation').value;
  const w={
    datingReward:3,gongAffection:2,suAffection:2,loveIntensity:2,dailyLife:2,
    vulnerability:1,outsiderView:1,relationshipProgress:1,canonSupplement:0,stableHappiness:2
  };

  if(state.affectionDirection==='gong')w.gongAffection+=5;
  else if(state.affectionDirection==='su')w.suAffection+=5;
  else{w.gongAffection+=2;w.suAffection+=2;w.loveIntensity+=2;}

  if(state.leadDirection==='gong')w.gongAffection+=2;
  else if(state.leadDirection==='su')w.suAffection+=2;
  else w.loveIntensity+=2;

  if(rel==='썸'){w.datingReward+=5;w.loveIntensity+=3;w.vulnerability+=2;}
  if(rel==='연애 초반'){w.datingReward+=5;w.loveIntensity+=3;w.vulnerability+=2;}
  if(rel==='안정된 연애'){w.dailyLife+=4;w.stableHappiness+=3;w.datingReward+=2;}
  if(rel==='반동거'){w.dailyLife+=5;w.stableHappiness+=3;w.relationshipProgress+=2;}
  if(rel==='동거'){w.dailyLife+=5;w.stableHappiness+=4;w.outsiderView+=2;}
  if(rel==='결혼'){w.stableHappiness+=6;w.dailyLife+=4;w.outsiderView+=2;}

  const sig=subjectiveSignals();
  const all=[sig.job,sig.couple,sig.canon];
  const hasConcept=name=>all.some(x=>x.concepts.has(name));

  if(sig.couple.concepts.has('clingyGong'))w.gongAffection+=4;
  if(sig.couple.concepts.has('clingySu'))w.suAffection+=4;
  if(sig.couple.concepts.has('reservedGong'))w.suAffection+=1;
  if(sig.couple.concepts.has('reservedSu'))w.gongAffection+=1;

  if(hasConcept('daily')||sig.job.concepts.has('workBusy'))w.dailyLife+=4;
  if(hasConcept('outsider')||sig.job.concepts.has('workTogether')||sig.couple.concepts.has('publicPrivate'))w.outsiderView+=3;
  if(hasConcept('vulnerable')||sig.job.concepts.has('workBusy'))w.vulnerability+=3;
  if(hasConcept('future'))w.relationshipProgress+=3;
  if(sig.canon.raw)w.canonSupplement+=4;
  return w;
}
function coreReward(){
  const weights=inferredCoreWeights();
  const pool=[];
  for(const [key,value] of Object.entries(weights)){
    const n=Math.max(0,Math.round(value));
    for(let i=0;i<n;i++)pool.push(key);
  }
  return pool[Math.floor(Math.random()*pool.length)]||'datingReward';
}
function textAffinity(item){
  const t=String(item.text||'');
  const sig=subjectiveSignals();
  let s=0;

  // 완전한 문장이 아니어도 토큰 단위로 직접 일치 가점
  s+=Math.min(5,sig.job.tokens.filter(k=>t.includes(k)).length)*2.2;
  s+=Math.min(4,sig.couple.tokens.filter(k=>t.includes(k)).length)*1.5;
  s+=Math.min(4,sig.canon.tokens.filter(k=>t.includes(k)).length)*2;

  // 짧은 메모/키워드에서 뽑은 의미군을 장면 의미와 연결
  if(sig.job.concepts.has('workBusy')
      && /업무|일정|근무|퇴근|출근|회의|출장|야근|시간이 없|바쁘|피곤/.test(t))s+=5;
  if(sig.job.concepts.has('outsider')
      && /동료|직원|주변|사람들|팀|직장|회사|병원|학교|센터|길드/.test(t))s+=4;
  if(sig.job.concepts.has('workTogether')
      && /업무|직장|회사|병원|동료|직원|공식|사람들 앞|둘만 남/.test(t))s+=4;
  if(sig.couple.concepts.has('publicPrivate')
      && /공식|직장|사람들 앞|둘만 남|비밀|공적인/.test(t))s+=4;
  if(sig.couple.concepts.has('clingyGong')||sig.couple.concepts.has('clingySu'))
      if(/붙잡|먼저|표현|찾아가|기다리|연락|보고 싶|매달/.test(t))s+=4;
  if(sig.couple.concepts.has('reservedGong')||sig.couple.concepts.has('reservedSu'))
      if(/말 대신|행동|챙기|조용히|아무 말 없이|덤덤/.test(t))s+=4;
  if(sig.couple.raw.match(/티격태격|장난|놀리/)
      && /장난|놀리|농담|티격|말다툼/.test(t))s+=4;

  return s;
}
function rewardScore(item,core){
  return (item.rewards?.[core]||0)*10;
}
function gradeBonus(g){return ({S:5,A:3,B:1,C:0,D:-2})[g]??0;}
function rewardSimilarity(a,b){
  if(!a||!b)return 0;
  let dot=0,aa=0,bb=0;
  for(const k of rewardKeys){
    const x=a.rewards?.[k]||0,y=b.rewards?.[k]||0;
    dot+=x*y;aa+=x*x;bb+=y*y;
  }
  return aa&&bb?dot/Math.sqrt(aa*bb):0;
}
function overlapCount(a,b){const bs=new Set(b||[]);return (a||[]).filter(x=>bs.has(x)).length;}
function coherenceScore(item,anchor){
  if(!anchor)return 0;
  let s=rewardSimilarity(item,anchor)*12;
  s+=Math.min(2,overlapCount(item.tone,anchor.tone))*1.5;
  s+=Math.min(2,overlapCount(item.emotions,anchor.emotions))*1.5;
  s-=Math.abs((item.eventIntensity||1)-(anchor.eventIntensity||1))*1.5;
  return s;
}
function dynamicRoleScore(item){
  const t=String(item.text||'');
  let s=0;
  const aActs=/A가|A는|A의|A에게서/.test(t);
  const bActs=/B가|B는|B의|B에게서/.test(t);

  // roleSwap이 정한 A/B 방향과 함께 사용해, 적극성·주도권이 실제 장면 주체에도 영향을 주게 한다.
  const gongToken=state.roleSwap?'B':'A';
  const suToken=state.roleSwap?'A':'B';
  const gongActs=gongToken==='A'?aActs:bActs;
  const suActs=suToken==='A'?aActs:bActs;

  if(state.affectionDirection==='gong'){if(gongActs)s+=3;if(suActs&&!gongActs)s-=1;}
  if(state.affectionDirection==='su'){if(suActs)s+=3;if(gongActs&&!suActs)s-=1;}
  if(state.leadDirection==='gong'){if(gongActs)s+=2;}
  if(state.leadDirection==='su'){if(suActs)s+=2;}
  return s;
}
function score(item,core,p,pattern,anchor){
  let s=rewardScore(item,core)+gradeBonus(item.grade)+coherenceScore(item,anchor)+textAffinity(item)+dynamicRoleScore(item);
  if(pattern&&item.corePattern===pattern)s+=8;
  if(state.world==='fantasy'&&item.subWorld?.includes(state.sub))s+=7;
  if(p.cohabit==='yes'&&item.cohabitation==='cohabitingPossible')s+=4;
  if(p.cohabit==='no'&&item.cohabitation==='nonCohabitingPreferred')s+=4;
  if(p.publicity==='no'&&item.publicity==='secretPreferred')s+=4;
  if(p.publicity==='yes'&&item.publicity==='publicPossible')s+=3;
  if(core==='stableHappiness'&&item.relationshipRisk>=3)s-=10;
  if(core==='dailyLife'&&item.eventIntensity>=4)s-=7;
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
  const by={};for(const x of base)(by[x.pool]||(by[x.pool]=[])).push(x);
  return by;
}
function outsiderChance(core){
  return core==='outsiderView'?.8:0;
}
function syntheticCanonAnchor(){
  const material=state.canonMaterial.trim();
  return {
    id:'SAFE_CANON_ANCHOR',pool:'payoff',
    text:material
      ?`본편의 ‘${material}’을 다시 활용하되 새로운 설정을 덧붙이지 않고, 당시에는 드러나지 않았던 감정이나 의미를 보여 준다.`
      :'본편에서 이미 나온 장면이나 약속 하나를 다시 보여 주되, 새로운 설정을 덧붙이지 않고 당시의 감정과 의미만 보완한다.',
    grade:'S',corePattern:'canonSafe',rewards:{canonSupplement:5,stableHappiness:2},
    tone:['calm'],emotions:['affection'],eventIntensity:1,relationshipRisk:0,boundaryRisk:0,recentRepeatKey:'canon_safe_anchor'
  };
}
function pickCoreAnchor(by,core,p,used){
  if(core==='canonSupplement'&&state.canonMaterial.trim())return syntheticCanonAnchor();
  const fallbackPools={
    outsiderView:['payoff','outsider','turn','action'],
    dailyLife:['payoff','action','ending'],
    stableHappiness:['payoff','ending','action'],
    relationshipProgress:['payoff','action','turn'],
    canonSupplement:['payoff','action','turn','ending'],
    vulnerability:['payoff','action','turn']
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
    if(x)used.add(x.id);return x;
  };
  const stageRank={suppression:1,action:2,expression:3,admission:4,resolution:5};
  const takeAction=minRank=>{
    const candidates=(by.action||[]).filter(x=>(stageRank[x.progressionStage]||2)>=minRank);
    let x=weightedPick(candidates,core,p,used,pattern,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,false,payoff);
    if(x)used.add(x.id);return x;
  };
  const start=take('start');
  const trigger=take('trigger');
  const action1=takeAction(1);
  const firstRank=stageRank[action1?.progressionStage]||2;
  const action2=Math.random()<.3?takeAction(firstRank):null;
  const turn=take('turn');
  const outsider=payoff?.pool==='outsider'?null:(Math.random()<outsiderChance(core)?take('outsider'):null);
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
  const start=trimPeriod(parts.start?.text),trigger=trimPeriod(parts.trigger?.text),payoff=String(parts.payoff?.text||'').trim();
  return applyNames([start,trigger,payoff].filter(Boolean).join(' → '));
}
function hasBatchim(word){
  const chars=Array.from(String(word||'').trim()),last=chars[chars.length-1]||'',code=last.charCodeAt(0);
  if(code<0xAC00||code>0xD7A3)return null;
  return (code-0xAC00)%28!==0;
}
function chooseJosa(name,particle){
  const batchim=hasBatchim(name);if(batchim===null)return particle;
  const pairs={'가':['이','가'],'이':['이','가'],'는':['은','는'],'은':['은','는'],'를':['을','를'],'을':['을','를'],'와':['과','와'],'과':['과','와']};
  const pair=pairs[particle];return pair?(batchim?pair[0]:pair[1]):particle;
}
function replaceRole(text,token,name){
  const re=new RegExp(token+'(가|이|는|은|를|을|와|과)?','g');
  return String(text??'').replace(re,(full,particle)=>name+(particle?chooseJosa(name,particle):''));
}
function applyNames(text){
  const a=state.roleSwap?'수':'공',b=state.roleSwap?'공':'수';
  return replaceRole(replaceRole(String(text??''),'A',a),'B',b);
}
function row(label,text,cls=''){
  return `<div class="result-row ${cls}"><div class="result-label">${esc(label)}</div><div class="result-text">${esc(applyNames(text))}</div></div>`;
}
function extractedPointLabels(){
  const sig=subjectiveSignals();
  const labels=[];
  const push=x=>{if(x&&!labels.includes(x))labels.push(x);};

  if(sig.job.concepts.has('workBusy'))push('바쁜 업무·엇갈리는 일정');
  if(sig.job.concepts.has('workTogether'))push('같은 업무 공간');
  if(sig.job.concepts.has('outsider'))push('직장 주변인 개입');
  if(sig.couple.concepts.has('publicPrivate'))push('공사 구분');
  if(sig.couple.concepts.has('clingyGong'))push('공의 적극적인 애정 표현');
  if(sig.couple.concepts.has('clingySu'))push('수의 적극적인 애정 표현');
  if(sig.couple.concepts.has('reservedGong'))push('표현이 적은 공');
  if(sig.couple.concepts.has('reservedSu'))push('표현이 적은 수');
  if(sig.canon.concepts.has('canonPeople'))push('본편 인물 재활용');
  if(sig.canon.concepts.has('canonPlace'))push('본편 장소 재활용');
  if(sig.canon.concepts.has('canonObject'))push('본편 오브제·대사 재활용');
  if(sig.forbidden.concepts.has('banControl'))push('통제 행동 제외');
  if(sig.forbidden.concepts.has('banPhone'))push('휴대폰 검사 제외');
  if(sig.forbidden.concepts.has('banPublicFight'))push('공개적인 다툼 제외');

  // 분류되지 않은 짧은 메모도 핵심 토큰으로 보조
  if(labels.length<3){
    for(const token of [...sig.job.tokens,...sig.couple.tokens,...sig.canon.tokens]){
      if(labels.length>=5)break;
      if(token.length>=2)push(token);
    }
  }
  return labels.slice(0,6);
}
function rewardExplanation(coreLabel){
  return `입력한 관계 단계·관계 역학과 주관식에서 추출한 핵심 포인트를 바탕으로 ‘${coreLabel}’ 방향이 잘 맞는 외전으로 골랐어요.`;
}
function decideRoleSwap(core){
  if(core==='gongAffection')return false;
  if(core==='suAffection')return true;
  if(state.affectionDirection==='gong')return false;
  if(state.affectionDirection==='su')return true;
  if(state.leadDirection==='gong')return false;
  if(state.leadDirection==='su')return true;
  return Math.random()<.5;
}

async function generate(){
  const buttons=[document.getElementById('generate'),document.getElementById('again')];
  buttons.forEach(b=>{if(b)b.disabled=true;});
  const main=document.getElementById('generate');
  const old=main.textContent;main.textContent='외전 구성 중…';
  try{
    const data=await dataPromise;
    const p=profile();
    const core=coreReward();
    state.roleSwap=decideRoleSwap(core);
    const by=pools(data);
    const parts=chooseSequence(by,core,p);
    addRecent(parts);
    const coreLabel=defs.find(d=>d[0]===core)?.[1]||'관계 보상';
    document.getElementById('resultTitle').textContent=`${coreLabel} 중심 외전`;
    const worldLabel=state.world==='modern'?'현대':document.querySelector('#sub .active')?.textContent||'현대판타지';
    const tags=[coreLabel,worldLabel,document.getElementById('relation').value];
    document.getElementById('tags').innerHTML=[...new Set(tags)].map(x=>`<span class="tag">${esc(x)}</span>`).join('');
    const scene=[parts.action1?.text,parts.action2?.text,parts.outsider?.text].filter(Boolean).join(' ');
    const extracted=extractedPointLabels();
    const rows=[
      ['추천 외전 방향',coreLabel,'reward'],
      ...(extracted.length?[['반영한 핵심 포인트',extracted.join(' · '),'']]:[]),
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
    console.error(err);alert(`외전을 만드는 중 문제가 생겼어요. ${err.message}`);
  }finally{
    buttons.forEach(b=>{if(b)b.disabled=false;});main.textContent=old;
  }
}

function resetAll(){
  if(!state.locked){
    document.getElementById('relation').value='안정된 연애';
    state.world='modern';state.sub='omegaverse';state.cohabit='no';state.publicity='no';state.details.clear();
    setSegment('world','modern');setSegment('cohabit','no');setSegment('public','no');
    document.querySelectorAll('#sub button[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v==='omegaverse'));
    document.getElementById('subWrap').style.display='none';
    detailWrap.style.display='none';renderDetails();detailWrap.style.display='none';
  }
  if(!state.surveyLocked){
    state.affectionDirection='same';state.leadDirection='equal';
    state.jobContext='';state.couplePoint='';state.forbiddenBehavior='';state.canonMaterial='';
    applySurveyState();
  }
  state.recent=[];
  document.getElementById('result').classList.remove('show');
}

document.getElementById('settingsLock').addEventListener('click',()=>{
  state.locked=!state.locked;
  if(state.locked)saveLockedSettings();else clearLockedSettings();
  lockButtonState();
});
document.getElementById('surveyLock').addEventListener('click',()=>{
  state.surveyLocked=!state.surveyLocked;
  if(state.surveyLocked)saveLockedSurvey();else clearLockedSurvey();
  surveyLockButtonState();
});
document.getElementById('relation').addEventListener('change',()=>{
  if(document.getElementById('relation').value==='동거'){state.cohabit='yes';setSegment('cohabit','yes');}
  saveLockedSettings();
});

renderDetails();
detailWrap.style.display='none';
applySurveyState();
restoreLockedSettings();
restoreLockedSurvey();

document.getElementById('generate').onclick=generate;
document.getElementById('again').onclick=generate;
document.getElementById('reset').onclick=resetAll;
