(function(){
"use strict";
var $=function(s){return document.querySelector(s)},app=$("#app");
var LSK="kitaEnPlay1";var S;try{S=JSON.parse(localStorage.getItem(LSK))||{}}catch(e){S={}}
S.stars=S.stars||0;S.t=S.t||{};
function save(){try{localStorage.setItem(LSK,JSON.stringify(S))}catch(e){}}
function tp(id){return S.t[id]=S.t[id]||{lvl:4,c:0}}
/* ---- audio: one element reused (iOS friendly), queue ---- */
var au=new Audio(),q=[],last=[],playing=false;
function play(list,keep){if(!keep){q=[];}last=list.slice();q=q.concat(list);if(!keep||!playing)next();}
function next(){if(!q.length){playing=false;return}playing=true;au.src="assets/audio/"+q.shift()+".mp3";var p=au.play();if(p&&p.catch)p.catch(function(){playing=false})}
au.onended=function(){setTimeout(next,180)};au.onerror=function(){next()};
function stop(){q=[];au.pause();playing=false}
var instr=[];function say(list){instr=list;play(list)}
$("#replayBtn").onclick=function(){play(instr)};
$("#homeBtn").onclick=function(){stopRec();topics()};
/* ---- feedback ---- */
var fx=$("#fx");function burst(ch){fx.textContent=ch;fx.classList.remove("show");void fx.offsetWidth;fx.classList.add("show")}
var PRAISE=["en/x_great","en/x_yes","en/x_super","en/x_welldone"];
function star(n){S.stars+=n||1;$("#starN").textContent=S.stars;save()}
$("#starN").textContent=S.stars;
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function pic(w,topic){if(topic.id==="numbers"){var n=+w.e;return '<span class="num">'+n+'</span><span class="dots">'+Array(n+1).join("🍎")+'</span>'}return '<span class="pic">'+w.e+'</span>'}
function correct(topic){var t=tp(topic.id);t.c++;star();var grew=false;
  if(t.c%4===0&&t.lvl<topic.words.length){t.lvl=Math.min(topic.words.length,t.lvl+2);grew=true}save();return grew}
/* ---- screens ---- */
function home(){$("#homeBtn").hidden=true;app.innerHTML='<div class="title">English Play!</div><button class="big" id="go" aria-label="להתחיל">▶️</button>';
  $("#go").onclick=function(){topics()};instr=["he/welcome"];}
function topics(){$("#homeBtn").hidden=true;stop();
  app.innerHTML='<div class="grid">'+TOPICS.map(function(t,i){var p=tp(t.id);return '<button class="tile" data-i="'+i+'">'+t.icon+'<small>'+t.en+'</small>'+(t.isNew?'<span class="badge">✨</span>':'')+'<span class="st">'+(p.c?"⭐".repeat(Math.min(5,Math.ceil(p.c/4))):"")+'</span></button>'}).join("")+'</div>';
  app.querySelectorAll(".tile").forEach(function(b){b.onclick=function(){games(TOPICS[+b.dataset.i])}});
  say(["he/topics"]);}
function games(t){$("#homeBtn").hidden=false;
  app.innerHTML='<div class="title">'+t.icon+' '+t.en+'</div><div class="games"><button class="game g1" id="g1" aria-label="ללמוד">👂</button><button class="game g2" id="g2" aria-label="למצוא">👆</button><button class="game g3" id="g3" aria-label="להגיד">🎤</button></div>';
  $("#g1").onclick=function(){learn(t)};$("#g2").onclick=function(){find(t,0)};$("#g3").onclick=function(){speak(t,0)};
  say(["he/t_"+t.id,"en/t_"+t.id,"he/games"]);}
function words(t){return t.words.slice(0,tp(t.id).lvl)}
function learn(t){var ws=words(t),heard={};
  app.innerHTML='<div class="title">👂 '+t.en+'</div><div class="choices n'+(ws.length<=4?4:3)+'">'+ws.map(function(w,i){return '<button class="tile" data-i="'+i+'">'+pic(w,t)+'</button>'}).join("")+'</div>';
  app.querySelectorAll(".tile").forEach(function(b){b.onclick=function(){var w=ws[+b.dataset.i];play(["en/w_"+w.s]);b.classList.remove("ok");void b.offsetWidth;b.classList.add("ok");
    if(!heard[w.s]){heard[w.s]=1;if(Object.keys(heard).length===ws.length){setTimeout(function(){star();burst("🌟");play(["en/x_great","he/good"],true)},900)}}}});
  say(["he/learn"]);}
var ROUNDS=5;
function prog(r){var s="";for(var i=0;i<ROUNDS;i++)s+=i<r?"⭐":"⚪";return '<div class="progress">'+s+'</div>'}
function finish(t){burst("🏆");app.innerHTML='<div class="title">🏆</div><div class="row"><button class="round big2" id="again" aria-label="שוב">🔁</button><button class="round big2" id="back" aria-label="נושאים">🧩</button></div>';
  $("#again").onclick=function(){games(t)};$("#back").onclick=function(){topics()};say(["en/x_welldone","he/done"]);}
function find(t,r,first){if(r>=ROUNDS)return finish(t);var ws=words(t),n=Math.min(ws.length,r<2?3:4);
  var target=rnd(ws),others=shuffle(ws.filter(function(w){return w!==target})).slice(0,n-1),opts=shuffle(others.concat([target])),locked=false;
  app.innerHTML=prog(r)+'<div class="choices n'+n+'">'+opts.map(function(w,i){return '<button class="tile" data-i="'+i+'">'+pic(w,t)+'</button>'}).join("")+'</div>';
  app.querySelectorAll(".tile").forEach(function(b){b.onclick=function(){if(locked)return;var w=opts[+b.dataset.i];
    if(w===target){locked=true;b.classList.add("ok");burst("⭐");var grew=correct(t);play([rnd(PRAISE),"en/w_"+w.s].concat(grew?["he/newwords"]:[]));setTimeout(function(){find(t,r+1,true)},grew?3800:2200)}
    else{b.classList.remove("bad");void b.offsetWidth;b.classList.add("bad");play(["en/x_oops","en/q_"+target.s])}}});
  say((r===0&&!first?["he/find"]:[]).concat(["en/q_"+target.s]));}
/* ---- speech ---- */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,rec=null;
var ALT={one:["won","1","on"],two:["to","too","2","tu"],three:["3","tree","free"],four:["for","4","fore"],five:["5"],six:["6","sex","sax"],seven:["7"],eight:["8","ate","eat"],nine:["9","night","nein"],ten:["10","tan","then"],
 eye:["i","aye","eyes","hi"],ear:["ears","here","year"],mom:["mum","mommy","mama","mam"],dad:["daddy","dead","that"],right:["write","rite","ride"],sun:["son","sunny"],eat:["it","eight"],run:["ran","fun"],hat:["had","hut","cap"],bus:["boss"],car:["call","cart","care"],
 cow:["how","cows"],cat:["cut","kat"],dog:["doug","dock"],pear:["pair","bear","pier"],bike:["bite","bicycle"],plane:["airplane","play"],"ice cream":["ice-cream","icecream"],"teddy bear":["teddy"],socks:["sox","sock"],shoes:["shoe"],grapes:["grape"],blocks:["block"],
 red:["read","bread"],blue:["blew"],up:["app","op"],sing:["thing","sink"],snow:["know","no"],rain:["train","ran"],nose:["knows","no's"],hand:["and"],foot:["food","put"]};
function match(word,txt){txt=(" "+txt.toLowerCase().replace(/[^a-z0-9' -]/g," ")+" ");var c=[word].concat(ALT[word]||[]);return c.some(function(x){return txt.indexOf(" "+x+" ")>=0||txt.replace(/ /g,"").indexOf(x.replace(/ /g,""))>=0&&x.length>3})}
function stopRec(){if(rec){try{rec.abort()}catch(e){}rec=null}}
function speak(t,r){stopRec();if(r>=ROUNDS)return finish(t);var ws=words(t),w=rnd(ws),tries=0;
  var micOK=!!SR&&S.noMic!==true;
  app.innerHTML=prog(r)+'<div class="say"><div class="tile sayPic">'+pic(w,t)+'</div><div class="heard" id="heard"></div><div class="row">'+
    '<button class="round big2" id="hint" aria-label="להקשיב">👂</button>'+(micOK?'<button class="mic" id="mic" aria-label="מיקרופון">🎤</button>':'<button class="mic" id="selfok" aria-label="אמרתי" style="background:#ffcc33;box-shadow:0 10px 0 #d99a00">⭐</button>')+'</div></div>';
  var heard=$("#heard"),hintN=0;
  $("#hint").onclick=function(){hintN++;play(["en/w_"+w.s])};
  function win(){star();burst("⭐");var grew=correct(t);play([rnd(PRAISE),"en/w_"+w.s].concat(grew?["he/newwords"]:[]));setTimeout(function(){speak(t,r+1)},grew?3800:2300)}
  if(!micOK){$("#selfok").onclick=function(){$("#selfok").onclick=null;win()};say(["he/say_fb","en/w_"+w.s]);return}
  var mic=$("#mic");
  mic.onclick=function(){if(rec)return;stop();rec=new SR();rec.lang="en-US";rec.interimResults=false;rec.maxAlternatives=5;rec.continuous=false;var got=false;
    mic.classList.add("on");
    rec.onresult=function(e){got=true;var alts=[];for(var i=0;i<e.results.length;i++)for(var j=0;j<e.results[i].length;j++)alts.push(e.results[i][j].transcript);
      heard.textContent="🗣️ "+alts[0];if(alts.some(function(a){return match(w.w,a)})){mic.onclick=null;win()}else{tries++;
        if(tries>=3){play(["he/say_retry","en/w_"+w.s]);setTimeout(function(){star();burst("👍");speak(t,r+1)},3500)}else play(["he/say_retry","en/w_"+w.s])}};
    rec.onerror=function(e){if(e.error==="not-allowed"||e.error==="service-not-allowed"){S.noMic=true;save();play(["he/mic_block"]);setTimeout(function(){speak(t,r)},5500)}};
    rec.onend=function(){mic.classList.remove("on");rec=null;if(!got&&!S.noMic)play(["he/no_hear"])};
    try{rec.start()}catch(e){rec=null;mic.classList.remove("on")}};
  say((r===0?["he/say"]:[]));}
window.addEventListener("pagehide",stopRec);
home();
})();
