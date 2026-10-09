/* Browser-synthesized foley. No speech, no narration, no audio downloads. */
class MovieSound {
  constructor(){this.context=null;this.master=null;this.enabled=true;this.noise=null;this.events=[];this.active=new Set()}
  start(){try{if(!this.context){const A=window.AudioContext||window.webkitAudioContext;this.context=new A();this.master=this.context.createGain();this.master.gain.value=this.enabled?.6:0;this.master.connect(this.context.destination);const count=this.context.sampleRate*2;this.noise=this.context.createBuffer(1,count,this.context.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<count;i++)data[i]=Math.random()*2-1}this.context.resume().catch(()=>{})}catch{}}
  mute(enabled){this.enabled=enabled;if(!enabled)this.stopAll();if(enabled)this.start();if(this.master)this.master.gain.setTargetAtTime(enabled?.6:0,this.context.currentTime,.04)}
  stopAll(){for(const source of this.active){try{source.stop()}catch{}}this.active.clear()}
  pause(){this.stopAll();this.context?.suspend().catch(()=>{})}
  tone(frequency,time,duration,volume,type='sine',endFrequency=null){const a=this.context,o=a.createOscillator(),v=a.createGain();o.type=type;o.frequency.setValueAtTime(frequency,time);if(endFrequency)o.frequency.exponentialRampToValueAtTime(endFrequency,time+duration);v.gain.setValueAtTime(.0001,time);v.gain.linearRampToValueAtTime(volume,time+.008);v.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(v);v.connect(this.master);this.active.add(o);o.onended=()=>this.active.delete(o);o.start(time);o.stop(time+duration+.025)}
  grain(time,duration,volume,frequency,type='bandpass',q=.8){const a=this.context,s=a.createBufferSource(),f=a.createBiquadFilter(),v=a.createGain();s.buffer=this.noise;f.type=type;f.frequency.value=frequency;f.Q.value=q;v.gain.setValueAtTime(.0001,time);v.gain.linearRampToValueAtTime(volume,time+.008);v.gain.exponentialRampToValueAtTime(.0001,time+duration);s.connect(f);f.connect(v);v.connect(this.master);this.active.add(s);s.onended=()=>this.active.delete(s);s.start(time,Math.random()*.7,duration);s.stop(time+duration+.025)}
  trigger(kind){this.events.push(kind);if(this.events.length>120)this.events.shift();if(!this.context||!this.enabled||this.context.state!=='running')return;const t=this.context.currentTime;
    if(kind==='knock'){this.tone(320,t,.14,.38,'sine',110);this.tone(790,t,.09,.12,'triangle',430);this.grain(t,.055,.25,1800,'bandpass',1.2)}
    if(kind==='crack'){[0,.018,.06,.12,.19].forEach((d,i)=>this.grain(t+d,.06+i*.015,.3-i*.035,2200+i*650,'highpass'));this.tone(180,t,.2,.13,'triangle',80)}
    if(kind==='rustle'){[0,.08,.17].forEach(d=>this.grain(t+d,.15,.08,1400,'highpass'))}
    if(kind==='step'){this.grain(t,.13,.045,650,'lowpass');this.tone(125,t,.09,.04,'sine',58)}
    if(kind==='eggMove'){this.grain(t,.12,.09,1000);this.tone(470,t,.07,.07,'sine',260)}
    if(kind==='water'){this.grain(t,.75,.075,1200,'lowpass');this.tone(490,t+.15,.14,.045,'sine',210);this.tone(690,t+.46,.12,.025,'sine',330)}
  }
}
window.MovieSound=MovieSound;
