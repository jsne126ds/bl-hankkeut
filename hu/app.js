var defs=[
['datingReward','연애 보상','본편에서 두 사람이 연인이 된 뒤의 모습이 충분히 나오지 않았나요?'],
['gongAffection','공의 애정','공이 먼저 표현하거나 매달리거나 필요로 하는 모습이 부족했나요?'],
['suAffection','수의 애정','수가 먼저 표현하거나 매달리거나 필요로 하는 모습이 부족했나요?'],
['loveIntensity','사랑의 크기','질투·그리움·의존·우선순위처럼 사랑의 크기가 드러나는 장면이 부족했나요?'],
['dailyLife','일상·생활','데이트·휴일·여행·식사·귀가·동거처럼 둘이 함께 생활하는 모습이 부족했나요?'],
['vulnerability','약한 모습','아픔·취함·피로·불안 등 평소보다 약해진 모습을 충분히 보여 주지 않은 인물이 있나요?'],
['outsiderView','주변인 시선','가족·친구·동료 등이 두 사람의 관계를 알거나 바라보는 장면이 부족했나요?'],
['relationshipProgress','관계의 다음 단계','동거·결혼·이사·진로·미래 계획 등 관계가 더 나아갈 여지가 남아 있나요?'],
['canonSupplement','본편 보완','공·수의 다른 시점, 생략된 장면, 미회수 약속·대사·장소처럼 본편에서 덜 보여 준 부분이 있나요?'],
['stableHappiness','안정된 행복','본편의 갈등이 끝난 뒤 두 사람이 편안하고 행복하게 지내는 모습을 충분히 보여 주지 못했나요?']
];
var labels={1:'굳이 없어도 됨',2:'있으면 좋음',3:'한 번쯤 보고 싶음',4:'외전에서 꽤 중요함',5:'반드시 보여 주고 싶음'};
var state={world:'modern',sub:'omegaverse',checks:{},last:null};
defs.forEach(function(d){state.checks[d[0]]={enabled:false,priority:3};});
var list=document.getElementById('checkList');
defs.forEach(function(d,i){
  var card=document.createElement('div'); card.className='check-card'; card.dataset.key=d[0];
  var ps=''; for(var n=1;n<=5;n++) ps+='<button class="prio '+(n===3?'active':'')+'" data-p="'+n+'">'+n+'</button>';
  card.innerHTML='<div class="question"><strong>'+(i+1)+'. '+d[1]+'</strong><br>'+d[2]+'</div>'+
  '<div class="controls"><div class="yesno"><button class="yn active" data-on="no">아니요</button><button class="yn" data-on="yes">예</button></div>'+
  '<div class="priority"><div class="prio-wrap">'+ps+'</div><span class="priority-text">3 · '+labels[3]+'</span></div></div>';
  list.appendChild(card);
});
function exclusive(id,cb){
  var box=document.getElementById(id);
  box.addEventListener('click',function(e){
    var b=e.target.closest('button[data-v]'); if(!b)return;
    box.querySelectorAll('button').forEach(function(x){x.classList.remove('active');}); b.classList.add('active'); cb(b.dataset.v);
  });
}
exclusive('world',function(v){state.world=v;document.getElementById('subWrap').style.display=v==='fantasy'?'block':'none';});
exclusive('cohabit',function(){});
exclusive('public',function(){});
document.getElementById('sub').addEventListener('click',function(e){var b=e.target.closest('button[data-v]');if(!b)return;this.querySelectorAll('button').forEach(function(x){x.classList.remove('active');});b.classList.add('active');state.sub=b.dataset.v;});
list.addEventListener('click',function(e){
  var card=e.target.closest('.check-card'); if(!card)return; var key=card.dataset.key;
  var yn=e.target.closest('.yn');
  if(yn){var on=yn.dataset.on==='yes';state.checks[key].enabled=on;card.classList.toggle('enabled',on);card.querySelectorAll('.yn').forEach(function(x){x.classList.toggle('active',(x.dataset.on==='yes')===on);});return;}
  var p=e.target.closest('.prio');
  if(p){var n=+p.dataset.p;state.checks[key].priority=n;card.querySelectorAll('.prio').forEach(function(x){x.classList.toggle('active',+x.dataset.p===n);});card.querySelector('.priority-text').textContent=n+' · '+labels[n];}
});
var templates={
datingReward:['둘이 연애하는 하루','늘 상대가 먼저 찾아오던 연애에서 이번에는 반대쪽이 퇴근을 기다린다.','원래 있던 저녁 약속이 취소되지만 한쪽이 그냥 돌아가지 않는다.','연락도 하지 않은 채 회사 근처에서 기다리다 늦게 나온 상대와 마주친다.','왜 왔느냐는 질문에 “보고 싶어서.”라고 먼저 말한다.','특별한 데이트 없이 늦은 저녁만 먹고 헤어지며 다음 약속을 먼저 잡는다.'],
gongAffection:['먼저 움직이는 공','공이 별일 없이 수를 보러 간다.','평소라면 넘겼을 사소한 일이 공의 그리움을 건드린다.','공이 먼저 시간을 비우고 수의 동선을 맞춘다.','공이 이제는 이유를 만들지 않고 보고 싶었다고 인정한다.','수는 다음 약속을 공보다 먼저 달력에 적어 둔다.'],
suAffection:['먼저 움직이는 수','수가 늘 공이 찾아오던 장소로 먼저 향한다.','약속이 취소된 뒤 수가 집으로 가려다 방향을 바꾼다.','수는 공에게 알리지 않은 채 퇴근을 기다린다.','수가 “보고 싶어서 왔어.”라고 먼저 말한다.','헤어지기 전 수가 먼저 다음 약속을 잡는다.'],
loveIntensity:['생각보다 더 큰 마음','둘이 한동안 일정이 엇갈려 제대로 얼굴을 보지 못한다.','상대에게 호감을 보이는 제3자가 나타난다.','괜찮은 척하던 한쪽이 상대를 직접 데리러 간다.','결국 질투했다는 사실을 숨기지 않고 인정한다.','둘은 질투보다 서로의 우선순위를 확인한 채 일상으로 돌아간다.'],
dailyLife:['둘만의 생활','둘이 같은 공간에서 각자 자기 일을 하는 평범한 저녁을 보낸다.','상대 집에 자기 물건이 생각보다 많아졌다는 걸 깨닫는다.','장보기나 집안일을 자연스럽게 나눠 한다.','한쪽이 상대 집을 무심코 “우리 집”이라고 부른다.','새 물건 하나가 둘의 공동생활 속에 자연스럽게 자리를 잡는다.'],
vulnerability:['약한 모습을 맡기는 날','한쪽이 예상보다 지친 채 귀가한다.','괜찮은 척하지만 상대가 먼저 상태를 알아챈다.','평소라면 거절할 돌봄을 이번에는 받아들인다.','처음으로 “오늘은 혼자 있기 싫다”고 말한다.','다음 날 상대는 특별 취급하지 않고 평소처럼 곁에 남는다.'],
outsiderView:['주변이 먼저 알아챈 관계','둘이 가까운 친구나 동료들과 함께 시간을 보내게 된다.','주변인이 둘 사이를 직접 묻는다.','당사자들은 숨겼다고 생각한 습관이 밖에서 드러난다.','한쪽이 처음으로 상대를 자기 연인이라고 소개한다.','주변은 생각보다 담담하게 두 사람을 커플로 받아들인다.'],
relationshipProgress:['다음 단계로 가는 이야기','한쪽의 집 계약 만료나 이사 시점이 가까워진다.','앞으로 어디서 살지 현실적인 이야기가 시작된다.','농담으로 꺼낸 미래 이야기가 생각보다 진지해진다.','한쪽이 자연스럽게 “그럼 같이 살면 되잖아.”라고 말한다.','둘은 당장 모든 걸 확정하지 않아도 다음 단계를 함께 준비하기 시작한다.'],
canonSupplement:['본편에서 놓친 한 장면','본편에서 의미가 컸던 장소나 약속을 다시 떠올린다.','예전과 비슷한 상황이 다시 생긴다.','그때 하지 못했던 말을 이번에는 먼저 꺼낸다.','본편과 같은 순간에 정반대의 선택을 한다.','과거의 상처였던 장면이 현재의 평범한 행복으로 덮인다.'],
stableHappiness:['갈등이 끝난 뒤의 행복','둘이 아무 일정 없는 평범한 하루를 함께 보낸다.','예상 밖의 빈 시간이 생기지만 이번에는 아무 사건도 일어나지 않는다.','같이 밥을 먹고 각자 할 일을 하며 같은 공간에 머문다.','특별한 말 없이도 상대가 곁에 있는 것이 당연한 순간이 온다.','둘은 다음 날 평범하게 각자의 일상으로 돌아간다.']
};
function coreReward(){
  var pool=[]; defs.forEach(function(d){var c=state.checks[d[0]];var w=c.enabled?[1,2,4,7,10][c.priority-1]:1;for(var i=0;i<w;i++)pool.push(d[0]);});
  return pool[Math.floor(Math.random()*pool.length)];
}
function nameText(t){
  var g=document.getElementById('gong').value.trim()||'공';var s=document.getElementById('su').value.trim()||'수';
  return t.replace(/공(?=$|[\s.,!?·'’”\)\]}]|이|가|은|는|을|를|의|에|에게|보다|과|와|도|만)/g,g).replace(/수(?=$|[\s.,!?·'’”\)\]}]|이|가|은|는|을|를|의|에|에게|보다|과|와|도|만)/g,s);
}
function generate(){
  var k=coreReward(), t=templates[k].slice();
  if(state.world==='fantasy'){
    var flavor={omegaverse:'형질이나 본능이 아니라 서로를 선택한다는 의미가 드러난다.',guideverse:'가이딩이 필요하지 않은데도 서로를 찾는 관계가 드러난다.',hunter:'임무가 없는 평범한 시간이 오히려 가장 특별해진다.',beast:'종 특성이나 본능보다 개인의 선택이 더 중요해진다.'};
    t[4]=flavor[state.sub]||t[4];
  }
  state.last={key:k,data:t};
  document.getElementById('resultTitle').textContent=t[0];
  var lab=defs.find(function(d){return d[0]===k;})[1];
  document.getElementById('tags').innerHTML='<span class="tag">'+lab+'</span><span class="tag">'+(state.world==='modern'?'현대':document.querySelector('#sub .active').textContent)+'</span>';
  var names=['에피소드 한 줄 요약','시작 상황','촉발 사건','1차 장면','핵심 장면','마무리 장면'];
  var rows=[];
  rows.push([names[0],nameText(t[1]),'']);
  rows.push([names[1],nameText(t[1]),'']);
  rows.push([names[2],nameText(t[2]),'']);
  rows.push([names[3],nameText(t[3]),'']);
  rows.push([names[4],nameText(t[4]),'payoff']);
  rows.push(['독자 보상',lab+'을 중심으로 본편에서 덜 보여 준 관계 보상을 회수한다.','reward']);
  rows.push([names[5],nameText(t[5]),'']);
  document.getElementById('resultGrid').innerHTML=rows.map(function(r){return '<div class="result-row '+r[2]+'"><div class="result-label">'+r[0]+'</div><div class="result-text">'+r[1]+'</div></div>';}).join('');
  document.getElementById('result').classList.add('show');
  document.getElementById('result').scrollIntoView({behavior:'smooth',block:'start'});
}
function resetAll(){state.checks&&Object.keys(state.checks).forEach(function(k){state.checks[k]={enabled:false,priority:3};});document.querySelectorAll('.check-card').forEach(function(c){c.classList.remove('enabled');c.querySelectorAll('.yn').forEach(function(x){x.classList.toggle('active',x.dataset.on==='no');});c.querySelectorAll('.prio').forEach(function(x){x.classList.toggle('active',x.dataset.p==='3');});c.querySelector('.priority-text').textContent='3 · '+labels[3];});document.getElementById('result').classList.remove('show');}
document.getElementById('generate').onclick=generate;document.getElementById('again').onclick=generate;document.getElementById('reset').onclick=resetAll;