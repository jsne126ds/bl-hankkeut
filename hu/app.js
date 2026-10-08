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
    ['workBusy',/출장|당직|야근|교대|밤샘|바쁨|바빠|과로|스케줄|근무 많|일 많|콜 많|시험기간|마감|야간작업|야간 작업|촬영 많|스케줄 빡빡/],
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
    ['banNoContact',/잠수|연락 차단|연락 끊|연락두절|차단하고 사라|말없이 사라/],
    ['banConfinement',/감금|가둬|가두|강제로 못 나가|외출 금지/],
    ['banWorkInterference',/임무 방해|업무 방해|일 방해|강제 휴식|일 못 하게|임무 못 하게/],
    ['vulnerable',/아픔|아프|취함|취해|불안|피곤|과로|밤샘|당직|울음|우는|약한 모습|부상/],
    ['daily',/일상|데이트|여행|식사|퇴근|귀가|주말|휴일|집안일|장보기|생활/],
    ['future',/결혼|동거|이사|미래|약속|진로|이직|승진|전근|복귀|퇴사|유학/],
    ['canonPeople',/직원|동료|가족|친구|형|누나|동생|상사|부하|팀장|환자|대표|전무|의사|교수|매니저/],
    ['canonPlace',/병원|회사|집|호텔|학교|길드|센터|별장|출장지|사무실|연수원/],
    ['canonObject',/반지|넥타이|벨트|선물|편지|사진|휴대폰|열쇠|차|옷|약속|호칭|대사|우산|장비|목도리/],
    ['canonEvent',/회식|시상식|레이드|회의|첫 고백|첫 데이트|가족 식사|촬영|마감/]
  ];
  for(const [name,re] of rules)if(has(re))concepts.add(name);

  // “같은 팀 아님”, “같은 직장 아님”처럼 앞 단어만 보면 반대로 읽히는 메모 보정
  if(/같은 (팀|직장|회사|병원|길드) (아님|아니|X|x)|서로 다른 (팀|직장|회사|병원|길드)/.test(raw)){
    concepts.delete('workTogether');
    concepts.add('workSeparate');
  }

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
  if(sig.concepts.has('banNoContact')
      && /잠수|연락.*(끊|차단|두절)|말없이.*사라|연락하지 않/.test(target))return true;
  if(sig.concepts.has('banConfinement')
      && /감금|가두|못 나가|외출.*금지|문을 잠그/.test(target))return true;
  if(sig.concepts.has('banWorkInterference')
      && /(임무|업무|일).*(방해|못 하게|막)|강제로.*(쉬|휴식)/.test(target))return true;

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
    if(/상대의 집|B의 집|A의 집|자기 집에 초대|집 열쇠를 건네|집 열쇠를 준다|같이 살자|동거를 제안|함께 살 집|자기 물건을 하나씩 두|상대 집에 자기 물건|집 계약 만료|앞으로 어디서 살지|어디서 살지 정|한쪽의 집 계약/.test(t))return true;
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

const episodeSeeds=[
  {
    id:'trip_disrupted',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['datingReward','dailyLife','gongAffection','suAffection','loveIntensity'],concepts:['workBusy','future'],
    title:'어렵게 맞춘 일정이 틀어지는 날',
    premise:'두 사람이 오래 전부터 맞춰 둔 일정이 갑작스러운 업무나 외부 사정으로 흔들린다.',
    variable:'취소할지 강행할지 결정해야 하는 상황에서, 둘이 중요하게 여기는 기준이 서로 다르다는 게 드러난다.',
    response:'A는 약속 자체보다 B가 무리하지 않는 쪽을 택하고, B는 그 선택이 단순한 양보가 아니라 둘의 시간을 오래 보고 내린 판단임을 알아차린다.',
    turn:'일정을 다시 짜는 과정에서 한쪽이 이미 몇 주 뒤까지 둘의 시간을 전제로 움직이고 있었다는 사실이 자연스럽게 드러난다.',
    payoff:'무산될 뻔한 계획보다 더 중요한 것은, 서로가 상대를 자신의 미래 일정 안에 기본값처럼 넣고 있다는 확인이다.',
    ending:'완벽한 일정 대신 둘만의 방식으로 바뀐 하루를 보내며 다음 계획을 다시 잡는다.'
  },
  {
    id:'work_crisis_support',scale:'사건형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['gongAffection','suAffection','vulnerability','loveIntensity'],concepts:['workBusy','outsider'],
    title:'일이 무너지는 날 옆에 남는 사람',
    premise:'한쪽의 업무에서 예상 밖의 문제가 터져 평소의 루틴이 완전히 깨진다.',
    variable:'도움을 받으면 약해 보일 것 같고, 혼자 버티자니 관계까지 밀어낼 수밖에 없는 상황이 된다.',
    response:'B가 버티려 할수록 A는 일을 대신 해결하려 들기보다 필요한 선만 지키며 옆에 남는다.',
    turn:'문제가 정리된 뒤 B는 A가 자신의 능력을 의심한 게 아니라 끝까지 스스로 해결할 수 있도록 자리를 지켜 줬다는 걸 깨닫는다.',
    payoff:'보호가 대신 해 주는 것이 아니라 무너지지 않도록 곁을 지키는 방식으로 드러난다.',
    ending:'다음 날 평소처럼 각자 일하러 가지만, 도움을 청해도 관계가 흔들리지 않는다는 신뢰가 남는다.'
  },
  {
    id:'public_event_mask',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['outsiderView','datingReward','loveIntensity'],concepts:['publicPrivate','outsider','workTogether'],
    title:'사람들 앞에서는 남처럼',
    premise:'둘이 함께 참석해야 하는 공식적인 자리나 단체 일정이 생긴다.',
    variable:'평소보다 더 철저하게 선을 지키는 바람에 오히려 주변인이 두 사람 사이의 미묘한 차이를 눈치챈다.',
    response:'A와 B는 들키지 않으려 할수록 서로의 상태를 너무 정확하게 챙기는 습관을 숨기기 어렵다.',
    turn:'주변인의 사소한 한마디로 둘만 알고 있던 생활 습관이 밖에서도 고스란히 드러났다는 걸 깨닫는다.',
    payoff:'관계를 직접 밝히지 않아도 오래된 친밀감은 행동에서 새어 나온다는 장면이 독자 보상이 된다.',
    ending:'행사가 끝난 뒤 둘만 남자 그제야 서로를 놀리며 긴장을 푼다.'
  },
  {
    id:'family_invitation',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['outsiderView','relationshipProgress','datingReward'],concepts:['outsider','future'],
    title:'가족 일정에 처음 들어가는 자리',
    premise:'한쪽에게 가족이나 오래된 지인과 함께하는 중요한 자리가 생기고, 자연스럽게 상대를 데려갈지 결정해야 한다.',
    variable:'초대 자체보다 어떤 관계로 소개할지가 더 어려운 문제가 된다.',
    response:'초대받은 쪽은 부담을 줄이려 뒤로 빠지려 하지만, 다른 쪽은 오히려 애매하게 숨기는 것이 더 싫다고 말한다.',
    turn:'자리에 참석한 뒤 주변인의 반응을 통해 두 사람이 생각한 것보다 이미 서로의 생활 깊숙이 들어와 있었다는 사실이 드러난다.',
    payoff:'둘의 관계가 사적인 감정에서 서로의 인간관계 안으로 한 단계 확장된다.',
    ending:'귀가하는 길에 다음에는 누구를 먼저 만나게 될지를 두고 가볍게 이야기한다.'
  },
  {
    id:'career_offer',scale:'관계 전환형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['relationshipProgress','loveIntensity','datingReward'],concepts:['future','workBusy'],
    title:'좋은 기회가 둘의 거리를 바꿀 때',
    premise:'한쪽에게 승진·이직·장기 프로젝트처럼 놓치기 어려운 기회가 생긴다.',
    variable:'기회 자체는 좋지만 생활 패턴이나 물리적 거리가 바뀔 가능성이 있어 혼자 결정하기 어렵다.',
    response:'상대는 붙잡거나 희생을 요구하지 않고, 먼저 그 선택을 했을 때 둘의 생활이 어떻게 달라질지를 함께 계산한다.',
    turn:'대화를 이어 가며 두 사람이 이미 중요한 결정을 개인의 문제보다 공동의 문제로 다루고 있다는 점이 드러난다.',
    payoff:'사랑을 증명하기 위해 기회를 포기하는 대신, 각자의 삶을 유지하면서도 관계를 계속 가져갈 방법을 선택한다.',
    ending:'결정이 끝난 뒤 둘만의 새 일정과 규칙을 정하며 변화 이후의 생활을 구체화한다.'
  },
  {
    id:'unexpected_free_day',scale:'일상형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['dailyLife','stableHappiness','datingReward'],concepts:['workBusy','daily'],
    title:'예고 없이 생긴 하루',
    premise:'바쁜 일정 사이에 우연히 둘 모두에게 비는 시간이 생긴다.',
    variable:'무언가 특별한 걸 해야 할 것 같지만 막상 하고 싶은 것이 서로 너무 소박하다.',
    response:'둘은 거창한 계획 대신 평소 미뤄 둔 사소한 일을 같이 처리하며 생활 취향의 차이를 발견한다.',
    turn:'특별한 데이트보다 같이 장을 보고 늦은 식사를 하는 시간이 더 편하다는 사실을 둘 다 인정하게 된다.',
    payoff:'연애의 이벤트가 아니라 같이 보내는 평범한 시간이 이미 보상처럼 느껴지는 관계를 보여 준다.',
    ending:'다음에 또 시간이 비면 뭘 할지 별 의미 없는 목록을 만들어 둔다.'
  },
  {
    id:'anniversary_mismatch',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['datingReward','gongAffection','suAffection','loveIntensity'],concepts:['daily'],
    title:'기념일을 기억하는 방식이 다를 때',
    premise:'두 사람이 같은 날을 서로 다른 의미로 기억하고 있었다는 사실이 드러난다.',
    variable:'한쪽은 아무렇지 않은 척하지만 다른 쪽은 이미 오래전부터 준비해 둔 것이 있다.',
    response:'준비한 쪽은 서운함을 따지기보다 왜 그 날을 기억했는지 설명하고, 상대는 자신이 몰랐던 관계의 시작점을 알게 된다.',
    turn:'둘이 중요하게 생각하는 순간이 다르다는 사실이 갈등이 아니라 서로의 기억을 새로 공유하는 계기가 된다.',
    payoff:'사랑의 크기를 같은 방식으로 증명하지 않아도 된다는 안정감이 남는다.',
    ending:'결국 둘만 아는 기념일이 하나 더 생긴다.'
  },
  {
    id:'friend_observes',scale:'이벤트형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['outsiderView','datingReward','loveIntensity'],concepts:['outsider'],
    title:'제삼자가 먼저 알아차리는 변화',
    premise:'오랜만에 만난 친구나 동료가 둘 중 한 사람의 달라진 습관을 먼저 알아차린다.',
    variable:'본인은 변한 게 없다고 생각하지만 상대와 관련된 선택만 유독 자연스럽게 바뀌어 있다.',
    response:'질문을 피하려다 오히려 평소 얼마나 상대를 기준으로 움직이는지가 더 선명해진다.',
    turn:'당사자보다 주변인이 먼저 “너 요즘 저 사람 기준으로 생각한다”고 짚어 낸다.',
    payoff:'연애 이후의 변화가 자기 인식이 아니라 타인의 시선을 통해 객관적으로 확인된다.',
    ending:'집에 돌아온 뒤 그 말을 전할지 말지 고민하다 결국 장난처럼 꺼내 놓는다.'
  },
  {
    id:'sick_day_reversal',scale:'사건형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['vulnerability','gongAffection','suAffection','dailyLife'],concepts:['vulnerable','workBusy'],
    title:'평소 돌보던 쪽이 먼저 쓰러지는 날',
    premise:'늘 상대를 챙기던 쪽이 예상치 못하게 컨디션을 잃어 역할이 뒤집힌다.',
    variable:'아픈 사람은 익숙하지 않은 돌봄을 부담스러워하고, 돌보는 사람은 과하게 굴지 않으려 애쓴다.',
    response:'상대가 필요로 하는 범위만 묻고 움직이면서 평소에는 보이지 않던 생활 습관과 약한 면을 보게 된다.',
    turn:'아픈 쪽이 무심코 평소에는 절대 하지 않을 부탁을 하고, 둘 다 그 말을 기억하게 된다.',
    payoff:'누가 더 강한지가 아니라 서로 약해질 수 있는 관계라는 점이 확인된다.',
    ending:'회복한 뒤 그날의 부탁을 놀림거리로 삼지만, 필요한 물건은 이미 서로의 집에 하나씩 늘어나 있다.'
  },
  {
    id:'home_problem',scale:'사건형',stages:['semiCohabiting','cohabiting','married'],
    cores:['dailyLife','relationshipProgress','stableHappiness'],concepts:['daily','future'],
    title:'함께 사는 생활에 문제가 생긴 날',
    premise:'집의 고장·공사·가구 문제처럼 생활 기반을 건드리는 일이 생긴다.',
    variable:'문제보다 서로 중요하게 생각하는 생활 기준이 달라 의외의 의견 차이가 생긴다.',
    response:'누가 맞는지 따지기보다 각자 포기하기 싫은 한 가지를 정하고 그 사이의 해법을 찾는다.',
    turn:'대화를 하다 보니 지금의 집이 단순한 거주지가 아니라 둘이 계속 같이 살 것을 전제로 꾸려지고 있었다는 점이 드러난다.',
    payoff:'로맨틱한 약속 대신 생활의 결정을 함께 내리는 모습으로 관계의 안정감이 보인다.',
    ending:'문제가 해결된 뒤 오히려 집 안에 둘만의 규칙 하나가 새로 생긴다.'
  },
  {
    id:'business_trip_overlap',scale:'사건형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['dailyLife','gongAffection','suAffection','outsiderView'],concepts:['workBusy','workTogether'],
    title:'업무 일정이 사적인 시간을 침범할 때',
    premise:'출장·행사·프로젝트 일정 때문에 두 사람의 사적인 약속이 업무와 겹친다.',
    variable:'같이 있는 시간이 늘어도 업무 때문에 연인처럼 행동할 수는 없다.',
    response:'공적인 자리에서는 서로 모르는 척하면서도 필요한 순간에만 정확하게 챙겨 주는 방식이 생긴다.',
    turn:'둘만 남은 짧은 시간에 누적된 피로와 서운함이 터지지만, 싸움보다 다음 일정에 대한 합의로 이어진다.',
    payoff:'연애와 일을 섞지 않으면서도 관계를 지킬 수 있는 둘만의 방식이 만들어진다.',
    ending:'업무가 끝난 뒤 짧게라도 둘만의 시간을 확보해 미뤄 둔 약속을 마무리한다.'
  },
  {
    id:'secret_exposed_small',scale:'사건형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['outsiderView','loveIntensity','datingReward'],concepts:['publicPrivate','outsider'],
    title:'숨기려던 관계가 작은 실수로 새어 나갈 때',
    premise:'둘만 알고 있어야 할 사소한 정보가 주변인 앞에서 자연스럽게 튀어나온다.',
    variable:'대놓고 들킨 것은 아니지만 상대를 너무 잘 아는 이유를 설명하기 어려운 상황이 된다.',
    response:'둘은 즉석에서 말을 맞추지만, 주변인은 오히려 그 호흡 자체를 수상하게 여긴다.',
    turn:'사건이 지나간 뒤 관계를 계속 숨길지, 일부에게는 알려도 될지 처음으로 현실적인 대화를 하게 된다.',
    payoff:'비밀을 유지하는 것보다 둘이 같은 선택을 하는지가 더 중요해졌다는 사실이 드러난다.',
    ending:'결론은 미루더라도 적어도 누구에게 먼저 말할지는 함께 정한다.'
  },
  {
    id:'past_place_return',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['canonSupplement','loveIntensity','datingReward'],concepts:['canonPlace','canonEvent','canonObject'],
    title:'본편의 장소로 다시 돌아가는 날',
    premise:'본편에서 의미가 있었던 장소나 사건과 연결된 공간을 우연히 다시 찾게 된다.',
    variable:'그때는 말하지 못했던 감정과 지금의 관계가 겹치며 같은 장소가 전혀 다르게 느껴진다.',
    response:'한쪽이 당시 자신이 무엇을 생각했는지 처음으로 말하고, 다른 쪽은 기억하고 있던 장면이 서로 달랐다는 걸 알게 된다.',
    turn:'본편 당시에는 오해했던 행동 하나가 지금 와서 전혀 다른 의미로 해석된다.',
    payoff:'새로운 설정을 만들지 않고 기존 장면의 감정적 의미만 확장한다.',
    ending:'같은 장소에서 이번에는 전과 다른 선택을 하며 장면을 닫는다.'
  },
  {
    id:'gift_returns',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['canonSupplement','gongAffection','suAffection','loveIntensity'],concepts:['canonObject'],
    title:'예전에 건넨 물건이 다시 등장할 때',
    premise:'본편에서 주고받았던 물건이나 선물이 예상하지 못한 순간 다시 등장한다.',
    variable:'건넨 사람은 이미 잊었다고 생각했지만 받은 사람은 계속 사용하거나 간직하고 있었다.',
    response:'왜 아직 가지고 있느냐는 질문이 과거의 감정과 지금의 관계를 비교하게 만든다.',
    turn:'물건 자체보다 그것을 버리지 못한 이유가 당시 말하지 못했던 마음과 연결돼 있었음이 드러난다.',
    payoff:'본편의 작은 오브제가 현재의 애정 확인으로 이어져 캐논을 재활용하는 보상이 생긴다.',
    ending:'그 물건은 다시 제자리로 돌아가거나 둘만의 새로운 용도로 남는다.'
  },
  {
    id:'promise_due',scale:'관계 전환형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['canonSupplement','relationshipProgress','loveIntensity'],concepts:['canonObject','future'],
    title:'예전에 한 약속을 지킬 차례',
    premise:'본편에서 가볍게 넘겼던 약속이나 미뤄 둔 계획을 실제로 실행할 시점이 온다.',
    variable:'그때와 지금은 상황이 달라져 약속을 그대로 지키는 것이 최선인지 다시 판단해야 한다.',
    response:'둘은 과거의 말을 의무처럼 따르지 않고, 왜 그 약속을 했는지부터 다시 확인한다.',
    turn:'약속의 문구보다 서로가 그 말을 기억하고 있었다는 사실 자체가 더 큰 의미가 된다.',
    payoff:'본편의 미회수 요소를 현재 관계에 맞게 다시 해석하면서 관계의 다음 단계로 연결한다.',
    ending:'예전 약속을 그대로 지키거나, 둘이 합의한 새로운 약속으로 바꿔 남긴다.'
  },
  {
    id:'guest_stays_over',scale:'이벤트형',stages:['semiCohabiting','cohabiting','married'],
    cores:['dailyLife','outsiderView','stableHappiness'],concepts:['outsider','daily'],
    title:'둘의 생활권에 손님이 들어오는 날',
    premise:'가족이나 친구가 잠시 머물거나 오래 시간을 보내게 되면서 둘만의 생활 리듬이 흔들린다.',
    variable:'평소에는 의식하지 않던 역할 분담과 습관이 제삼자 앞에서 그대로 드러난다.',
    response:'둘은 손님을 챙기면서도 자연스럽게 서로의 빈틈을 메워 주고, 주변인은 그 익숙함을 먼저 눈치챈다.',
    turn:'방문자가 두 사람을 이미 한 가구처럼 대하면서 당사자들이 오히려 그 말을 의식하게 된다.',
    payoff:'동거·결혼 이후의 안정된 생활이 주변인의 시선을 통해 구체적으로 보인다.',
    ending:'손님이 돌아간 뒤 다시 둘만 남은 집이 유난히 조용하게 느껴진다.'
  },
  {
    id:'misunderstood_schedule',scale:'사건형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['datingReward','loveIntensity','gongAffection','suAffection'],concepts:['workBusy'],
    title:'약속을 잊은 줄 알았던 날',
    premise:'한쪽의 연락이 늦어지거나 일정이 꼬여 중요한 약속을 잊은 것처럼 보인다.',
    variable:'기다린 쪽은 서운하지만 먼저 따지기 싫고, 늦은 쪽은 설명보다 해결을 우선한다.',
    response:'오해가 풀린 뒤 둘은 누가 더 잘못했는지를 따지는 대신 일정이 꼬였을 때 어떻게 알려 줄지를 정한다.',
    turn:'늦은 쪽이 사실 약속을 지키기 위해 다른 선택을 이미 해 두었다는 점이 뒤늦게 드러난다.',
    payoff:'사소한 오해를 큰 갈등으로 키우지 않고 관계의 운영 규칙을 하나 더 만드는 장면이 된다.',
    ending:'다음 약속에는 서로가 먼저 확인 메시지를 보내기로 하며 가볍게 마무리한다.'
  },
  {
    id:'one_side_jealous',scale:'사건형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['gongAffection','suAffection','loveIntensity'],concepts:['outsider'],
    title:'질투를 숨기려다 더 티 나는 날',
    premise:'주변인과의 자연스러운 친밀감 때문에 한쪽이 예상보다 크게 질투한다.',
    variable:'통제하거나 따지고 싶지는 않아 평소처럼 행동하려 하지만 오히려 태도가 어색해진다.',
    response:'상대는 질투를 문제 삼지 않고 무엇이 불편했는지를 먼저 묻고, 질투한 쪽은 감정을 인정하되 상대의 행동을 제한하지 않는다.',
    turn:'질투의 대상보다 자신이 상대에게 얼마나 확신을 받고 싶었는지가 더 중요한 문제였다는 걸 깨닫는다.',
    payoff:'소유가 아니라 확인을 요청하는 방식으로 질투를 처리하면서 관계의 안정감이 강화된다.',
    ending:'둘만의 사소한 신호나 표현 하나를 정해 비슷한 상황에서 쓰기로 한다.'
  },
  {
    id:'planned_surprise_fails',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['gongAffection','suAffection','datingReward'],concepts:['daily','outsider'],
    title:'준비한 이벤트가 계획대로 되지 않을 때',
    premise:'한쪽이 몰래 준비한 작은 이벤트나 선물이 예상치 못한 변수 때문에 망가질 위기에 놓인다.',
    variable:'숨기려 할수록 이상한 행동만 늘어나 상대가 오해하기 쉬운 상황이 된다.',
    response:'결국 계획이 들키지만 준비한 쪽의 서툰 과정 자체가 더 큰 애정 표현으로 남는다.',
    turn:'받는 쪽은 결과물보다 자신을 위해 얼마나 오래 준비했는지를 알게 된다.',
    payoff:'완벽한 이벤트가 아니라 실패한 준비 과정이 둘의 관계를 더 잘 보여 준다.',
    ending:'원래 계획과는 다른 방식으로 둘만의 기념을 남긴다.'
  },
  {
    id:'temporary_distance',scale:'관계 전환형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['loveIntensity','relationshipProgress','dailyLife'],concepts:['future','workBusy','workSeparate'],
    title:'잠시 떨어져 지내야 할 때',
    premise:'업무·학업·가족 사정 때문에 일정 기간 떨어져 지내야 할 가능성이 생긴다.',
    variable:'거리 자체보다 지금까지 당연하게 누리던 생활이 사라지는 것이 더 크게 느껴진다.',
    response:'둘은 막연히 괜찮을 거라고 넘기지 않고 연락 빈도, 만날 일정, 혼자 감당하지 않을 문제를 구체적으로 정한다.',
    turn:'준비 과정에서 서로가 어떤 순간에 가장 상대를 필요로 하는지가 처음으로 명확해진다.',
    payoff:'헤어짐의 불안보다 관계를 유지하기 위해 실제로 무엇을 할지 합의하는 장면이 중심이 된다.',
    ending:'떠나는 날보다 이미 정해 둔 다음 만남의 날짜를 확인하며 마무리한다.'
  },
  {
    id:'unexpected_recognition',scale:'사건형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['outsiderView','loveIntensity','datingReward'],concepts:['outsider','publicPrivate'],
    title:'관계를 모르는 사람이 둘을 연인처럼 볼 때',
    premise:'처음 보는 제삼자가 둘의 관계를 자연스럽게 연인으로 오해한다.',
    variable:'둘은 부정해야 할지 그냥 넘겨야 할지 순간적으로 판단이 엇갈린다.',
    response:'짧은 대응 뒤 각자 왜 그렇게 반응했는지 이야기하면서 공개 여부에 대한 온도 차이가 드러난다.',
    turn:'정작 관계를 아는 주변인보다 아무 정보 없는 사람이 더 쉽게 둘을 알아봤다는 점이 우습고도 신경 쓰인다.',
    payoff:'외부의 시선을 통해 둘의 친밀감이 얼마나 자연스럽게 드러나는지 확인된다.',
    ending:'다음부터는 비슷한 상황에서 어떻게 말할지 둘만의 답을 정한다.'
  },
  {
    id:'shared_responsibility',scale:'사건형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['relationshipProgress','dailyLife','loveIntensity'],concepts:['future','daily'],
    title:'둘이 함께 책임져야 할 일이 생길 때',
    premise:'집·공동 일정·중요한 물건처럼 둘이 함께 책임져야 하는 문제가 생긴다.',
    variable:'한쪽이 알아서 해결하려 하면서 역할이 한쪽으로 쏠리기 시작한다.',
    response:'상대는 도와주겠다는 말보다 무엇을 나눠 맡을지 구체적으로 제안한다.',
    turn:'책임을 나누는 방식에서 서로가 장기적으로 어떤 생활을 원하는지가 자연스럽게 드러난다.',
    payoff:'관계의 미래가 추상적인 약속이 아니라 실제 생활 운영으로 확인된다.',
    ending:'일이 끝난 뒤 다음부터 적용할 둘만의 역할 분담이 생긴다.'
  },
  {
    id:'old_conflict_echo',scale:'사건형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['canonSupplement','stableHappiness','loveIntensity'],concepts:['canonEvent'],
    title:'본편 갈등과 닮은 상황을 다시 만날 때',
    premise:'본편에서 크게 흔들렸던 사건과 비슷한 상황이 훨씬 작은 규모로 다시 찾아온다.',
    variable:'예전 같으면 오해했을 장면이지만 지금은 서로의 패턴을 이미 알고 있다.',
    response:'둘은 과거와 같은 실수를 반복하지 않고, 당시에는 하지 못했던 질문을 바로 꺼낸다.',
    turn:'같은 종류의 사건을 전혀 다른 방식으로 넘기면서 두 사람 모두 관계가 실제로 달라졌음을 체감한다.',
    payoff:'본편 갈등을 재탕하지 않고 성장한 관계를 대비해서 보여 주는 보상이 생긴다.',
    ending:'예전이라면 며칠 걸렸을 문제를 그날 안에 끝내고 평범한 일상으로 돌아간다.'
  },
  {
    id:'fantasy_system_change',scale:'사건형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['relationshipProgress','loveIntensity','outsiderView'],concepts:['future'],worlds:['fantasy'],
    title:'세계관 제도가 둘의 관계에 개입할 때',
    premise:'형질·매칭·길드·등급·종족 규칙처럼 세계관의 제도 하나가 두 사람의 생활에 직접 영향을 준다.',
    variable:'개인 감정과 별개로 공식 절차나 선택을 요구받으면서 관계를 어디까지 제도 안에 올릴지 결정해야 한다.',
    response:'둘은 제도에 끌려가기보다 자신들에게 필요한 부분과 거부할 부분을 분리해 선택한다.',
    turn:'공식적으로는 단순한 절차였던 선택이 둘 사이에서는 예상보다 큰 의미를 갖게 된다.',
    payoff:'세계관 설정이 장식이 아니라 관계의 다음 단계를 실제로 움직이는 사건이 된다.',
    ending:'절차가 끝난 뒤 둘만의 의미를 따로 부여하며 관계를 다시 정의한다.'
  },
  {
    id:'fantasy_emergency',scale:'사건형',stages:['earlyDating','stableDating','semiCohabiting','cohabiting','married'],
    cores:['vulnerability','gongAffection','suAffection','loveIntensity'],concepts:['vulnerable','workBusy'],worlds:['fantasy'],
    title:'능력이나 형질 때문에 예상 밖의 위기가 생길 때',
    premise:'능력·형질·감각·임무 같은 세계관 요소 때문에 한쪽에게 갑작스러운 이상 상황이 발생한다.',
    variable:'평소에는 통제 가능했던 문제가 상대 앞에서만 예외적으로 드러난다.',
    response:'상대는 해결사처럼 모든 걸 대신하지 않고, 본인이 통제권을 되찾을 수 있도록 필요한 선택지를 함께 정한다.',
    turn:'위기가 끝난 뒤 둘 사이에서만 가능한 신호나 대처 방식이 하나 생긴다.',
    payoff:'판타지 설정이 두 사람의 약점과 신뢰를 동시에 보여 주는 관계 장치가 된다.',
    ending:'다음에 같은 일이 생기면 어떻게 할지 둘만의 규칙을 정하며 끝낸다.'
  },
  {
    id:'fantasy_public_mission',scale:'이벤트형',stages:['stableDating','semiCohabiting','cohabiting','married'],
    cores:['outsiderView','datingReward','loveIntensity'],concepts:['outsider','publicPrivate','workTogether'],worlds:['fantasy'],
    title:'공적인 임무에서 관계를 숨겨야 할 때',
    premise:'둘이 같은 임무·행사·조직 일정에 참여하지만 사적인 관계는 드러낼 수 없는 상황이 된다.',
    variable:'서로를 특별 취급하지 않으려다 오히려 반응을 지나치게 의식하게 된다.',
    response:'둘은 공식적인 역할을 지키면서도 상대의 상태를 확인할 최소한의 신호를 정한다.',
    turn:'주변인이 그 신호를 우연히 알아차리면서 관계가 들킬 뻔한 순간이 생긴다.',
    payoff:'세계관의 공적 시스템과 사적인 관계가 충돌하면서 긴장감 있는 연애 보상이 생긴다.',
    ending:'임무가 끝난 뒤 공식적인 태도를 풀고 둘만의 방식으로 긴장을 해소한다.'
  }
];

const scaleBonus={일상형:0,이벤트형:4,사건형:6,'관계 전환형':7};
function seedText(seed){
  return [seed.title,seed.premise,seed.variable,seed.response,seed.turn,seed.payoff,seed.ending].join(' ');
}
function seedEligible(seed,core,p){
  const stage=p.relation;
  if(seed.stages&&!seed.stages.includes(stage))return false;
  if(seed.worlds&&seed.worlds.includes('fantasy')&&state.world!=='fantasy')return false;
  if(forbiddenConflict(seedText(seed)))return false;
  if(p.cohabit==='yes'&&/동거를 제안|같이 살자|처음으로 상대 집|집 열쇠를 건네/.test(seedText(seed)))return false;
  if(p.publicity==='yes'&&/관계를 숨기|비밀을 유지|들킬 뻔/.test(seedText(seed)))return false;
  return true;
}
function seedConceptScore(seed){
  const sig=subjectiveSignals();
  const concepts=new Set([...sig.job.concepts,...sig.couple.concepts,...sig.canon.concepts]);
  let s=0;
  for(const c of seed.concepts||[])if(concepts.has(c))s+=5;
  const tokens=[...sig.job.tokens,...sig.couple.tokens,...sig.canon.tokens];
  const text=seedText(seed);
  s+=Math.min(5,tokens.filter(t=>text.includes(t)).length)*1.5;
  return s;
}
function chooseEpisodeSeed(core,p){
  let candidates=episodeSeeds.filter(x=>seedEligible(x,core,p));
  if(!candidates.length)candidates=episodeSeeds.filter(x=>!x.worlds||!x.worlds.includes('fantasy'));
  const recentIds=new Set(state.recent.slice(-12));
  const rows=candidates.map(seed=>{
    let s=scaleBonus[seed.scale]||0;
    if(seed.cores?.includes(core))s+=14;
    else if(seed.cores?.some(k=>(k==='loveIntensity'&&['gongAffection','suAffection','datingReward'].includes(core))))s+=4;
    s+=seedConceptScore(seed);
    if(recentIds.has('seed:'+seed.id))s-=18;
    if(seed.scale==='일상형'&&state.recent.slice(-6).some(x=>x==='scale:일상형'))s-=6;
    return {seed,s};
  }).sort((a,b)=>b.s-a.s);
  const top=rows.slice(0,Math.min(10,rows.length));
  const min=Math.min(...top.map(x=>x.s));
  let total=0;
  const weighted=top.map(x=>{const w=Math.max(1,Math.round(x.s-min+2));total+=w;return {...x,w};});
  let r=Math.random()*total;
  for(const x of weighted){r-=x.w;if(r<=0)return x.seed;}
  return weighted[0]?.seed||candidates[0];
}
function episodeFromSeed(seed,core,p){
  const canon=state.canonMaterial.trim();
  const useCanon=canon&&seed.cores?.includes('canonSupplement');
  const rows={premise:seed.premise,variable:seed.variable,response:seed.response,turn:seed.turn,payoff:seed.payoff,ending:seed.ending};
  if(useCanon){
    rows.premise=\`본편에서 남겨 둔 ‘\${canon}’이 다시 등장하면서 현재의 두 사람에게 새로운 의미를 만든다. \${seed.premise}\`;
  }
  return rows;
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
function sceneWords(text){
  return keywords(String(text||''))
    .map(x=>x.replace(/(으로|에서|에게|부터|까지|처럼|보다|하고|하며|해서|했다|한다|된다|드러난다|보여준다)$/,''))
    .filter(x=>x.length>=2);
}
function sceneSimilarity(a,b){
  const ta=normalizeFreeText(a).replace(/[.!?]/g,'');
  const tb=normalizeFreeText(b).replace(/[.!?]/g,'');
  if(!ta||!tb)return 0;
  if(ta===tb)return 1;
  if(ta.length>=12&&tb.length>=12&&(ta.includes(tb)||tb.includes(ta)))return .95;

  const A=new Set(sceneWords(a)), B=new Set(sceneWords(b));
  if(!A.size||!B.size)return 0;
  let shared=0;
  for(const x of A)if(B.has(x))shared++;
  const overlap=shared/Math.min(A.size,B.size);
  const union=new Set([...A,...B]).size;
  const jaccard=union?shared/union:0;
  return Math.max(overlap*.9,jaccard);
}
function nearDuplicate(item,chosen){
  if(!item?.text)return false;
  return chosen.some(x=>x?.text&&sceneSimilarity(item.text,x.text)>=.68);
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
  const chosen=[];

  const payoff=pickCoreAnchor(by,core,p,used);
  if(payoff){used.add(payoff.id);chosen.push(payoff);}
  const pattern=payoff?.corePattern||null;

  const uniquePool=items=>{
    const all=items||[];
    const filtered=all.filter(x=>!nearDuplicate(x,chosen));
    return filtered.length?filtered:all;
  };
  const register=x=>{
    if(x){used.add(x.id);chosen.push(x);}
    return x;
  };
  const take=pool=>{
    const candidates=uniquePool(by[pool]||[]);
    let x=weightedPick(candidates,core,p,used,pattern,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,false,payoff);
    return register(x);
  };
  const stageRank={suppression:1,action:2,expression:3,admission:4,resolution:5};
  const takeAction=minRank=>{
    const base=(by.action||[]).filter(x=>(stageRank[x.progressionStage]||2)>=minRank);
    const candidates=uniquePool(base);
    let x=weightedPick(candidates,core,p,used,pattern,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,true,payoff);
    if(!x)x=weightedPick(candidates,core,p,used,null,false,payoff);
    return register(x);
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
  if(sig.canon.concepts.has('canonEvent'))push('본편 사건 재활용');
  if(sig.forbidden.concepts.has('banControl'))push('통제 행동 제외');
  if(sig.forbidden.concepts.has('banPhone'))push('휴대폰 검사 제외');
  if(sig.forbidden.concepts.has('banPublicFight'))push('공개적인 다툼 제외');
  if(sig.forbidden.concepts.has('banNoContact'))push('잠수·연락 차단 제외');
  if(sig.forbidden.concepts.has('banConfinement'))push('감금 행동 제외');
  if(sig.forbidden.concepts.has('banWorkInterference'))push('업무·임무 방해 제외');

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
    const p=profile();
    const core=coreReward();
    state.roleSwap=decideRoleSwap(core);
    const seed=chooseEpisodeSeed(core,p);
    const ep=episodeFromSeed(seed,core,p);
    state.recent.push('seed:'+seed.id,'scale:'+seed.scale);
    state.recent=state.recent.slice(-30);

    const coreLabel=defs.find(d=>d[0]===core)?.[1]||'관계 보상';
    document.getElementById('resultTitle').textContent=seed.title;
    const worldLabel=state.world==='modern'?'현대':document.querySelector('#sub .active')?.textContent||'현대판타지';
    const tags=[seed.scale,coreLabel,worldLabel,document.getElementById('relation').value];
    document.getElementById('tags').innerHTML=[...new Set(tags)].map(x=>\`<span class="tag">\${esc(x)}</span>\`).join('');

    const extracted=extractedPointLabels();
    const rows=[
      ['에피소드 규모',seed.scale,'reward'],
      ['추천 외전 방향',coreLabel,'reward'],
      ...(extracted.length?[['반영한 핵심 포인트',extracted.join(' · '),'']]:[]),
      ['사건 축',ep.premise,''],
      ['변수',ep.variable,''],
      ['관계 반응',ep.response,''],
      ['전환점',ep.turn,''],
      ['핵심 보상',ep.payoff,'payoff'],
      ['마무리',ep.ending,'']
    ];
    document.getElementById('resultGrid').innerHTML=rows.map(r=>row(...r)).join('');
    const result=document.getElementById('result');
    result.classList.add('show');
    result.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
    console.error(err);
    alert(\`외전을 만드는 중 문제가 생겼어요. \${err.message}\`);
  }finally{
    buttons.forEach(b=>{if(b)b.disabled=false;});
    main.textContent=old;
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
