(()=>{
'use strict';
const $=id=>document.getElementById(id),c=$('film'),g=c.getContext('2d'),W=1600,H=900,S=DinoStory;
const atlas=new Image();atlas.src='assets/characters.png';
const eggAtlas=new Image(),walkAtlas=new Image(),backdrop=new Image();eggAtlas.src='assets/egg-props-v2.png';walkAtlas.src='assets/walk-v2.png';backdrop.src='assets/backgrounds-v2.png';
let loaded=false,state='intro',elapsed=0,clock=0,paused=false,started=false,sound=true,lastLine=-1,choice1=null,choice2=null,prev=performance.now();
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,ease=t=>{t=clamp(t);return t*t*(3-2*t)},hash=n=>{const t=Math.sin(n*127.1+311.7)*43758.5453;return t-Math.floor(t)};
const rgbMix=(a,b,t)=>'rgb('+a.map((v,i)=>Math.round(mix(v,b[i],t))).join(',')+')';
const foley=new MovieSound();
let firedEffects=new Set(),lastStep=-1;
function initAudio(){foley.start()}
function setSound(){sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'关闭音效':'开启音效');$('soundText').textContent=sound?'音效开启':'音效关闭';foley.mute(sound)}
function effects(){
  if(!started||paused||S[state].options||state==='end')return;
  const events={hatch:[[1.8,'eggMove']],stick:[[.75,'knock'],[1.5,'knock'],[2.25,'knock'],[2.3,'crack']],hand:[[.85,'crack'],[1.1,'rustle']],lake:[[.2,'water']]};
  for(const [i,event] of (events[state]||[]).entries())if(elapsed>=event[0]&&!firedEffects.has(i)){firedEffects.add(i);foley.trigger(event[1])}
  if(state==='search'||state==='return'||state==='momLooking'&&elapsed>=6.2){const pace=state==='return'?.28:.44,k=Math.floor(elapsed/pace);if(k!==lastStep){lastStep=k;foley.trigger('step')}}
}
function transition(next){foley.stopAll();state=next;elapsed=0;lastLine=-1;firedEffects=new Set();lastStep=-1;$('cover').hidden=next!=='intro';$('endPanel').hidden=next!=='end';$('choicePanel').hidden=true;$('subtitle').hidden=true;$('sceneName').textContent=S[next].name;const current=S[next];for(let i=0;i<4;i++){$('step'+i).classList.toggle('active',i===current.step);$('step'+i).classList.toggle('done',i<current.step)}
  if(current.options){$('choicePanel').hidden=false;$('choiceCount').textContent=current.choice?'第 '+current.choice+' / 2 次选择':'海龟指路 · 继续故事';$('question').textContent=current.question;$('choiceHint').textContent=current.hint;$('choices').replaceChildren();current.options.forEach((opt,i)=>{const b=document.createElement('button');b.className='choice';b.innerHTML='<i>'+opt.icon+'</i><div><strong>'+opt.title+'</strong><small>'+opt.detail+'</small></div><em>→</em>';b.setAttribute('aria-label',opt.title);b.addEventListener('click',()=>{if(current.choice===1)choice1=opt.id;if(current.choice===2)choice2=opt.id;initAudio();transition(opt.next)});$('choices').append(b)});$('statusText').textContent=current.choice?'故事等着你的第 '+current.choice+' 次选择':'点击「回去找妈妈」继续';$('playPause').disabled=true;}
  else{$('playPause').disabled=next==='intro'||next==='end';$('statusText').textContent=next==='intro'?'准备好了吗？':next==='end'?'故事结束 · 可以再试试另一条路':'正在播放 · '+current.name.split(' · ')[0]}
  if(next==='end'){$('endingText').textContent=choice2==='wait'?'小恐龙等到了妈妈。晚风里，两个身影紧紧靠在一起。':'谢谢海龟的帮助。小恐龙和妈妈，终于找到了彼此。';}
}
function start(){if(!loaded)return;started=true;paused=false;choice1=null;choice2=null;$('paused').hidden=true;$('playPause').textContent='Ⅱ';$('playPause').setAttribute('aria-label','暂停播放');initAudio();transition('hatch')}
function togglePause(){if(!started||S[state].options||state==='end')return;paused=!paused;$('paused').hidden=!paused;$('playPause').textContent=paused?'▶':'Ⅱ';$('playPause').setAttribute('aria-label',paused?'继续播放':'暂停播放');$('statusText').textContent=paused?'故事已暂停':'正在播放 · '+S[state].name.split(' · ')[0];if(paused)foley.pause();else if(sound)initAudio()}
$('start').addEventListener('click',start);$('replay').addEventListener('click',start);$('restart').addEventListener('click',()=>{started=false;paused=false;choice1=null;choice2=null;$('paused').hidden=true;foley.pause();transition('intro')});$('playPause').addEventListener('click',togglePause);$('resume').addEventListener('click',togglePause);$('sound').addEventListener('click',setSound);$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.player').requestFullscreen()}catch{$('statusText').textContent='当前浏览器暂不支持全屏'}});
document.addEventListener('keydown',e=>{if(e.target.closest('button,input,a'))return;if(e.code==='Space'){e.preventDefault();if(!started)start();else togglePause()}if(S[state].options&&/^[12]$/.test(e.key))$('choices').children[+e.key-1]?.click()});
function fill(color){g.fillStyle=color}function stroke(color,w=2){g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round'}
function shape(color,draw,line=null,w=2){g.beginPath();draw();fill(color);g.fill();if(line){stroke(line,w);g.stroke()}}
function ellipse(x,y,rx,ry,color,rot=0){g.beginPath();g.ellipse(x,y,rx,ry,rot,0,Math.PI*2);fill(color);g.fill()}
function curve(points,color,width){g.beginPath();g.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=6)g.bezierCurveTo(...points.slice(i,i+6));stroke(color,width);g.stroke()}
function leaf(x,y,len,rot,color){g.save();g.translate(x,y);g.rotate(rot);shape(color,()=>{g.moveTo(0,0);g.bezierCurveTo(-len*.32,-len*.4,-len*.35,-len*.8,0,-len);g.bezierCurveTo(len*.45,-len*.55,len*.28,-len*.15,0,0)});curve([0,0,0,-len*.25,5,-len*.7,0,-len*.9],color==='#294f3c'?'#51794b':'#ffffff25',1.7);g.restore()}
function tree(x,y,size,index,dark=false){g.save();g.translate(x,y);g.scale(size,size);shape(dark?'#3b5840':'#668365',()=>{g.moveTo(-22,0);g.bezierCurveTo(-15,-110,-27,-240,-10,-390);g.lineTo(20,-397);g.bezierCurveTo(5,-220,18,-80,35,0);g.closePath()});curve([4,-60,-5,-90,4,-190,0,-260],'#bad19b33',3);curve([0,-285,-32,-310,-79,-340,-105,-365],dark?'#3b5840':'#668365',13);curve([7,-240,25,-300,65,-330,75,-377],dark?'#3b5840':'#668365',13);const cols=dark?['#295c43','#34684a','#41764f']:['#668f65','#7ca071','#8aac7a'];for(let i=0;i<9;i++){const xx=(hash(index*9+i)-.5)*270,yy=-345-hash(index*4+i)*90;ellipse(xx,yy,68+hash(i+index)*28,55+hash(i+8)*25,cols[i%3],-.2)}g.restore()}
function fern(x,y,size,index,color='#477249'){g.save();g.translate(x,y);g.scale(size,size);const sway=Math.sin(clock*.7+index)*.025;for(let k=0;k<5;k++){g.save();g.rotate((k-2)*.37+sway);const len=85+hash(index+k)*75;curve([0,0,-8,-len*.3,4,-len*.7,0,-len],color,3);for(let j=1;j<9;j++){const yy=-j*len/9,ll=(1-j/10)*35;leaf(0,yy,ll,-1.1,color);leaf(0,yy,ll,1.1,color)}g.restore()}g.restore()}
function blossom(x,y,r,color){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,r*.43,r*.48,color,a)}ellipse(x,y,r*.26,r*.26,'#f3d782')}
function footprints(x,y,scale,angle,alpha=1){g.save();g.translate(x,y);g.rotate(angle);g.scale(scale,scale);g.globalAlpha=alpha;ellipse(0,0,13,19,'#9a906959');for(let i=0;i<3;i++)ellipse((i-1)*10,-19-Math.abs(i-1)*-3,5.5,8,'#9a906959', (i-1)*.3);g.restore()}
function environment(place,dusk=0){
  const sh=backdrop.naturalHeight/2,sw=backdrop.naturalWidth;
  const travel=place==='path'?Math.sin(elapsed*.22)*38:Math.sin(clock*.055)*6;
  g.drawImage(backdrop,0,place==='lake'?sh:0,sw,sh,-48-travel,-28,W+96,H+54);
  if(place==='path'||['choice2','missing','wait'].includes(state))for(let i=0;i<7;i++)footprints(600+i*95+(place==='path'?-elapsed*55:0),660+i%2*25,.65+i*.04,.9,.75);
  if(place==='lake'){g.save();g.globalAlpha=.12;for(let i=0;i<12;i++){const xx=530+hash(i)*730,yy=430+hash(i+9)*135;curve([xx,yy,xx+25,yy+Math.sin(clock*2+i)*3,xx+60,yy,xx+100,yy],'#fff9d4',1.5)}g.restore()}
  for(let i=0;i<22;i++){const x=(hash(i+9)*1600+clock*(3+hash(i)*8))%1600,y=180+hash(i+62)*620+Math.sin(clock+i)*12;ellipse(x,y,1.5+hash(i+6)*2,1.5+hash(i+6)*2,'#fffbd570')}
  if(dusk>0){g.save();g.globalAlpha=dusk*.28;fill('#ba684b');g.fillRect(0,0,W,H);g.globalAlpha=dusk*.19;fill('#27274b');g.fillRect(0,0,W,H);g.restore();if(dusk>.6){for(let i=0;i<13;i++){const x=140+hash(i)*1300,y=380+hash(i+7)*360;g.globalAlpha=(.4+Math.sin(clock*2+i)*.3)*(dusk-.5);ellipse(x,y,3,3,'#ffef9c')}g.globalAlpha=1}}
}
const eggBounds=[[94,82,470,597],[689,293,499,382],[71,795,490,348],[620,813,607,352]];
function prop(index,x,y,w,rotation=0,alpha=1){const [sx,sy,sw,sh]=eggBounds[index];g.save();g.translate(x,y);g.rotate(rotation);g.globalAlpha=alpha;g.drawImage(eggAtlas,sx,sy,sw,sh,-w/2,-w*sh/sw,w,w*sh/sw);g.restore()}
function nest(x=820,y=785){ellipse(x,y+17,235,36,'#514b3825');prop(3,x,y+48,460)}
function shell(x,y,w,open=0){prop(1,x,y,w);if(open<1)prop(2,x+open*w*1.3,y-w*.5-open*w*.72,w*.97,open*.5,1-ease((open-.83)/.17))}
function closedEgg(x,y,w,rotation=0){prop(0,x,y,w,rotation)}
function brokenShell(x,y){prop(1,x,y,180);prop(2,x+195,y+5,125,.7);for(let i=0;i<4;i++){g.save();g.translate(x-120+i*97,y+20+hash(i)*10);g.rotate(hash(i)*2);shape('#f3e7bd',()=>{g.moveTo(-14,3);g.lineTo(1,-10);g.lineTo(14,6);g.quadraticCurveTo(0,12,-14,3)},'#8f7752',1.5);g.restore()}}
function shards(x,y,t){if(t<0||t>1.4)return;for(let i=0;i<8;i++){const direction=(i-3.5)*.3,vx=Math.sin(direction)*180,vy=-80-hash(i)*170,yy=y+vy*t+220*t*t;g.save();g.translate(x+vx*t,Math.min(y+170,yy));g.rotate(t*(i-3));g.globalAlpha=1-ease((t-1)/.4);shape(i%2?'#f3e6bd':'#eee0b2',()=>{g.moveTo(-13,3);g.lineTo(2,-13);g.lineTo(16,8);g.lineTo(-2,10);g.closePath()},'#9c8563',1.7);g.restore()}}
function sprite(index,x,bottom,w,flip=false,rotation=0,bob=0){if(!loaded)return;const sw=atlas.naturalWidth/3,sh=atlas.naturalHeight/2,h=w*sh/sw;g.save();g.translate(x,bottom+bob);g.rotate(rotation);g.scale(1+Math.sin(clock*2.3)*.004,1+Math.sin(clock*2.3)*.008);if(flip)g.scale(-1,1);g.drawImage(atlas,index%3*sw,Math.floor(index/3)*sh,sw,sh,-w/2,-h,w,h);g.restore()}
function walk(x,bottom,w,flip=false,speed=1){const sw=walkAtlas.naturalWidth/4,sh=walkAtlas.naturalHeight/3,frame=Math.floor(elapsed*24*speed)%12,h=w*sh/sw;g.save();g.translate(x,bottom);if(flip)g.scale(-1,1);g.rotate(Math.sin(elapsed*9*speed)*.006);g.drawImage(walkAtlas,frame%4*sw,Math.floor(frame/4)*sh,sw,sh,-w/2,-h,w,h);g.restore()}
function shadow(x,y,w){ellipse(x,y,w*.37,w*.055,'#37593425')}
function stickProp(x,y,phase){g.save();g.translate(x,y);g.rotate(mix(-.82,.2,phase));g.translate(0,180);shape('#b08a59',()=>{g.moveTo(-12,0);g.lineTo(-6,-205);g.quadraticCurveTo(2,-224,15,-212);g.lineTo(20,-110);g.lineTo(15,0);g.closePath()},'#776a45',4);curve([3,-25,9,-50,1,-76,7,-135],'#d2ae75',4);g.restore()}
function handProp(x,y,phase){g.save();g.translate(x,y);g.rotate(-.25);shape('#f4caaa',()=>{g.moveTo(15,-110);g.lineTo(74,-100);g.lineTo(64,-22);g.bezierCurveTo(56,6,30,34,8,30);g.bezierCurveTo(-9,30,-23,12,-33,-7);g.bezierCurveTo(-41,-22,-23,-28,-13,-15);g.lineTo(0,-2);g.lineTo(-7,-76);g.quadraticCurveTo(-4,-98,9,-87);g.lineTo(13,-42);g.lineTo(14,-98);g.quadraticCurveTo(17,-111,28,-99);g.lineTo(32,-47);g.lineTo(35,-91);g.quadraticCurveTo(44,-108,51,-91);g.lineTo(52,-44);g.closePath()},'#c7997e',3);shape('#8ea4b1',()=>{g.moveTo(13,-112);g.lineTo(20,-176);g.lineTo(88,-174);g.lineTo(77,-104);g.closePath()},'#6c8998',3);g.restore()}
function hearts(x,y,amount){g.save();g.globalAlpha=clamp(amount);for(let i=0;i<4;i++){const xx=x+(i-1.5)*70,yy=y-Math.sin(clock+i)*12;g.save();g.translate(xx,yy);g.scale(.8,.8);shape('#e9b191',()=>{g.moveTo(0,10);g.bezierCurveTo(-32,-8,-23,-34,0,-17);g.bezierCurveTo(23,-34,32,-8,0,10)});g.restore()}g.restore()}
function characters(){const t=elapsed;const bob=Math.sin(clock*2.3)*3;
  if(state==='intro'){nest(1170,770);closedEgg(1170,770,305,Math.sin(clock*2)*.018);return}
  if(state==='choice1'){nest(820,535);sprite(0,810,540,340,false,0,bob);prop(1,825,540,260);prop(2,730,430,245,-.4);return}
  if(state==='choice2'){nest(820,550);brokenShell(820,555);sprite(2,810,560,340,false,0,bob);return}
  if(state==='hatch'){nest();const pulse=Math.pow(Math.max(0,Math.sin(t*4.2)),5),shake=Math.sin(t*21)*4*pulse;closedEgg(820+shake,785,310,Math.sin(t*4.2)*.045*pulse);if(t>4.5){g.save();g.globalAlpha=pulse*.6;curve([620,540,605,565,610,590,615,610],'#786947',4);curve([1030,515,1045,540,1040,570,1035,590],'#786947',4);g.restore()}return}
  if(state==='stick'||state==='hand'){
    nest();const byHand=state==='hand',opening=byHand?ease((t-.85)/2):ease((t-2.3)/.9),out=ease((t-2.7)/.8),escape=ease((t-3.2)/1.4);
    const babyX=800+escape*180,baseY=790;shadow(babyX,795,390);
    if(opening>.05)sprite(!byHand&&t>2.7?1:0,babyX,baseY+(1-out)*210,390,false,!byHand?Math.sin(t*4)*.025:0,bob);
    if(t<3.3)shell(820,790,310,opening*.999);else brokenShell(820,790);
    if(t<3.05){g.globalAlpha=1-ease((t-2.8)/.3);if(!byHand){const stroke=t<.4?0:Math.pow(Math.max(0,Math.cos((t-.75)*Math.PI*2/.75)),4),tipX=910-stroke*68,tipY=460+stroke*96;stickProp(tipX,tipY,stroke)}else handProp(925+opening*250,530-opening*180,t);g.globalAlpha=1}
    if(!byHand){shards(820,575,t-2.3);for(const hit of [.75,1.5,2.25]){const after=t-hit;if(after>=0&&after<.25){g.save();g.globalAlpha=1-after/.25;for(let i=0;i<5;i++){const a=-Math.PI+i*.55;curve([850+Math.cos(a)*30,560+Math.sin(a)*30,850+Math.cos(a)*40,560+Math.sin(a)*40,850+Math.cos(a)*48,560+Math.sin(a)*48,850+Math.cos(a)*55,560+Math.sin(a)*55],'#eec55f',3)}g.restore()}}}
    return;
  }
  if(state==='search'||state==='return'){const returning=state==='return',x=returning?mix(1080,540,ease(t/8)):mix(530,1070,ease(t/9));shadow(x,782,390);walk(x,795,430,returning,returning?1.25:1);return}
  if(['lake','turtle','goBack'].includes(state)){shadow(650,795,385);sprite(0,650,805,395,false,0,bob);shadow(1115,802,385);sprite(5,1115,816,395,false,state==='turtle'?Math.sin(t*2)*.017:0,bob/2);if(state==='turtle'){g.save();g.globalAlpha=.5;ellipse(1115,798,90,12,'#cfb68020');g.restore()}return}
  if(state==='momLooking'){nest();brokenShell(820,785);const mx=1050+Math.sin(t*1.2)*55;shadow(mx,800,610);sprite(4,mx,816,600,Math.sin(t*1.2)<0,0,bob);if(t>6.2){const x=mix(-100,570,ease((t-6.2)/2.8));walk(x,800,410,false,1.25)}return}
  if(['reunionWait','reunionSearch','end'].includes(state)){nest();brokenShell(760,785);const end=state==='end',e=end?1:ease(t/6),mx=mix(state==='reunionWait'?1240:1050,1055,e),bx=mix(state==='reunionSearch'?570:810,875,e);shadow(mx,809,650);sprite(4,mx,822,640,false,-.02,bob);shadow(bx,805,375);sprite(0,bx,822,380,false,-.06*e,bob);if(t>5||end)hearts(980,310,end?1:(t-5)/3);return}
  nest();brokenShell(820,790);let idx=['missing','choice2'].includes(state)?2:0;if(state==='wait'&&t>6||state==='waitMore')idx=2;shadow(810,788,390);sprite(idx,810,802,390,false,Math.sin(clock*1.2)*.02,bob);if(state==='waitMore'&&t>4.5){const mx=mix(1700,1240,ease((t-4.5)/3.5));sprite(4,mx,820,610,false,0,Math.sin(t*6)*4)}
}
function foreground(){const v=g.createRadialGradient(800,410,370,800,470,1100);v.addColorStop(0,'#12382900');v.addColorStop(1,'#12382925');fill(v);g.fillRect(0,0,W,H)}
function render(){if(!loaded)return;g.clearRect(0,0,W,H);let dusk=state==='wait'?ease(elapsed/12):['waitMore','reunionWait'].includes(state)||state==='end'&&choice2==='wait'?1:0;environment(S[state].place,dusk);characters();foreground();if(state==='hatch'&&elapsed<1.5){g.globalAlpha=1-ease(elapsed/1.5);fill('#ecedcf');g.fillRect(0,0,W,H);g.globalAlpha=1}}
function updateLine(){const lines=S[state].lines;if(!lines)return;let idx=0;for(let i=0;i<lines.length;i++)if(elapsed>=lines[i][0])idx=i;if(idx!==lastLine){lastLine=idx;$('subtitle').hidden=false;$('speaker').textContent=lines[idx][1];$('line').textContent=lines[idx][2];}}
let frameSample=[],frameCounter=0;
function frame(now){const raw=now-prev;frameSample.push(raw);if(frameSample.length>120)frameSample.shift();if(++frameCounter%60===0)c.setAttribute('data-render-fps',String(Math.round(1000/(frameSample.reduce((a,b)=>a+b,0)/frameSample.length))));const dt=Math.min((now-prev)/1000,1);prev=now;if(!paused){clock+=dt;if(started&&!S[state].options&&state!=='end'){elapsed+=dt;updateLine();if(elapsed>=S[state].duration)transition(S[state].next)}effects()}render();requestAnimationFrame(frame)}
let assetCount=0;function assetReady(){assetCount++;if(assetCount===4){loaded=true;$('start').disabled=false;$('start').innerHTML='<span>▶</span> 开始小电影';render()}}for(const im of [atlas,eggAtlas,walkAtlas,backdrop]){im.onload=assetReady;im.onerror=()=>{$('start').disabled=true;$('start').textContent='画面素材加载失败，请刷新重试';$('statusText').textContent='请确认电影素材完整'}};$('start').disabled=true;$('start').textContent='正在准备森林…';transition('intro');requestAnimationFrame(frame);
window.DinoFilm={getState:()=>({scene:state,elapsed,paused,choice1,choice2,loaded,soundEvents:foley.events.slice(),animationFrames:12}),scenes:S};
})();
