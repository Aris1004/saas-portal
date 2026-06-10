/* ═══════════════════════════════════════════
   AI 포털 디자인 피커 — design_picker.js
   portal.html에 <script src="design_picker.js"> 한 줄만 추가
   기존 코드 0줄 변경. 헤더 높이 불변.
════════════════════════════════════════════ */
(function(){
'use strict';

/* ──────────────────────────────────────
   21 ANIMATION FUNCTIONS (자기완결형)
────────────────────────────────────── */
function anim1(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0;
  var ofc=document.createElement('canvas');ofc.width=W;ofc.height=H;
  var o=ofc.getContext('2d');
  o.font='300 '+Math.round(H*.45)+'px Orbitron,monospace';
  o.textAlign='center';o.textBaseline='middle';o.fillStyle='#fff';o.fillText('AI 포털',W/2,H/2);
  var id=o.getImageData(0,0,W,H),tg=[];
  for(var y=0;y<H;y+=3)for(var x=0;x<W;x+=3)if(id.data[(y*W+x)*4+3]>80)tg.push({x:x,y:y});
  var pts=[];
  tg.forEach(function(t){pts.push({x:Math.random()*W,y:Math.random()*H,tx:t.x,ty:t.y,vx:0,vy:0,r:.9+Math.random()*.7,h:185+Math.random()*30,type:1})});
  for(var i=0;i<100;i++)pts.push({x:Math.random()*W,y:Math.random()*H,tx:Math.random()*W,ty:Math.random()*H,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2,r:.4+Math.random()*.5,h:180+Math.random()*60,type:0});
  (function draw(){
    ctx.fillStyle='rgba(0,3,14,.14)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';
    pts.forEach(function(p){
      if(p.type===1){var dx=p.tx-p.x,dy=p.ty-p.y;p.vx=(p.vx+dx*.065)*.86;p.vy=(p.vy+dy*.065)*.86}
      else{p.vx+=(Math.random()-.5)*.35;p.vy+=(Math.random()-.5)*.35;p.vx*=.94;p.vy*=.94;if(Math.random()<.008){p.tx=Math.random()*W;p.ty=Math.random()*H}}
      p.x+=p.vx;p.y+=p.vy;
      var dist=p.type===1?Math.sqrt((p.tx-p.x)*(p.tx-p.x)+(p.ty-p.y)*(p.ty-p.y)):99;
      var bright=p.type===1?Math.max(0,1-dist/50):.25;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r+bright*.8,0,Math.PI*2);
      ctx.fillStyle='hsla('+p.h+',100%,'+(55+bright*35)+'%,'+(.45+bright*.55)+')';ctx.fill();
    });
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim2(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0;
  var sparks=[];for(var i=0;i<20;i++)sparks.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*1.2,vy:(Math.random()-.5)*.8,hue:Math.random()<.5?335:200,r:.6+Math.random()*1.2,p:Math.random()*Math.PI*2});
  (function draw(){
    ctx.fillStyle='rgba(6,0,12,.1)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;
    var tg=ctx.createLinearGradient(0,0,0,H*.4);tg.addColorStop(0,'rgba(255,45,120,.12)');tg.addColorStop(1,'transparent');ctx.fillStyle=tg;ctx.fillRect(0,0,W,H*.4);
    ctx.beginPath();for(var x=0;x<=W;x+=2){var y=H*.5+Math.sin(x/W*Math.PI*6+t*.03)*8+Math.cos(x/W*Math.PI*3+t*.02)*5;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.strokeStyle='rgba(255,45,120,.18)';ctx.lineWidth=1.5;ctx.stroke();
    sparks.forEach(function(s){s.p+=.06;s.x+=s.vx;s.y+=s.vy;if(s.x<0||s.x>W)s.vx*=-1;if(s.y<0||s.y>H)s.vy*=-1;var g=.4+.6*(Math.sin(s.p)+1)/2;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.shadowColor='hsl('+s.hue+',100%,65%)';ctx.shadowBlur=14;ctx.fillStyle='hsla('+s.hue+',100%,68%,'+(.5+.5*g)+')';ctx.fill();ctx.shadowBlur=0});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim3(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height;
  var CHARS='01アイウエオカキクケコABCDEF0123456789';
  var cols=Math.floor(W/14),drops=[];for(var i=0;i<cols;i++)drops.push(Math.random()*H/16|0);
  (function draw(){
    ctx.fillStyle='rgba(0,8,2,.18)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';ctx.font='bold 13px monospace';
    for(var i=0;i<drops.length;i++){var ch=CHARS[Math.floor(Math.random()*CHARS.length)],x=i*14,y=drops[i]*16;ctx.fillStyle='rgba(180,255,180,.95)';ctx.shadowColor='#00ff66';ctx.shadowBlur=8;ctx.fillText(ch,x,y);ctx.shadowBlur=0;for(var k=1;k<4;k++){var ty=y-k*16;if(ty>0){ctx.fillStyle='rgba(0,200,80,'+(0.3-k*.07)+')';ctx.fillText(CHARS[Math.floor(Math.random()*CHARS.length)],x,ty)}}if(drops[i]*16>H&&Math.random()>.95)drops[i]=0;drops[i]++}
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim4(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,arcs=[],t=0;
  function spawnArc(){var x=Math.random()*W,y=Math.random()*H,branches=[];function addB(sx,sy,ang,d,maxD){if(d>=maxD)return;var len=15+Math.random()*35,ex=sx+Math.cos(ang)*len,ey=sy+Math.sin(ang)*len;branches.push({sx:sx,sy:sy,ex:ex,ey:ey,a:.7-d*.11,w:1.2-d*.15});if(Math.random()<.65)addB(ex,ey,ang+(Math.random()-.5)*1.8,d+1,maxD);if(Math.random()<.35)addB(ex,ey,ang+(Math.random()-.5)*2.8,d+1,maxD)}addB(x,y,Math.random()*Math.PI*2,0,5);arcs.push({branches:branches,life:0,maxLife:25+Math.random()*40})}
  for(var i=0;i<8;i++)spawnArc();
  (function draw(){
    ctx.fillStyle='rgba(8,0,18,.12)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;if(t%15===0)spawnArc();while(arcs.length>22)arcs.shift();
    arcs.forEach(function(arc){arc.life++;var frac=arc.life/arc.maxLife,fade=frac<.15?frac/.15:1-((frac-.15)/.85);arc.branches.forEach(function(b){ctx.beginPath();ctx.moveTo(b.sx,b.sy);ctx.lineTo(b.ex,b.ey);ctx.strokeStyle='rgba(210,100,255,'+b.a*fade*.75+')';ctx.lineWidth=b.w;ctx.stroke();ctx.strokeStyle='rgba(180,60,255,'+b.a*fade*.35+')';ctx.lineWidth=b.w*4;ctx.stroke()})});
    arcs=arcs.filter(function(a){return a.life<a.maxLife});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim5(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0;
  var bands=[{h:'120,50,220',ph:0,amp:20,freq:3,yRatio:.1,thick:.18},{h:'0,210,170',ph:1.2,amp:18,freq:4,yRatio:.22,thick:.16},{h:'50,140,255',ph:2.1,amp:22,freq:2.5,yRatio:.34,thick:.18},{h:'200,70,230',ph:.7,amp:16,freq:5,yRatio:.46,thick:.14},{h:'0,180,255',ph:1.8,amp:20,freq:3.5,yRatio:.58,thick:.16},{h:'100,255,180',ph:3.0,amp:18,freq:4.5,yRatio:.7,thick:.14},{h:'255,120,200',ph:.4,amp:15,freq:2,yRatio:.82,thick:.12},{h:'180,220,255',ph:2.5,amp:12,freq:6,yRatio:.92,thick:.1}];
  (function draw(){
    ctx.clearRect(0,0,W,H);t+=.005;
    bands.forEach(function(b){var yBase=H*b.yRatio;ctx.beginPath();ctx.moveTo(0,H);for(var x=0;x<=W;x+=3){var y=yBase+Math.sin(x/W*Math.PI*b.freq+t+b.ph)*b.amp+Math.cos(x/W*Math.PI*(b.freq*.7)+t*.8)*b.amp*.5;ctx.lineTo(x,y)}ctx.lineTo(W,H);ctx.closePath();var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba('+b.h+',0)');g.addColorStop(b.yRatio,'rgba('+b.h+','+b.thick+')');g.addColorStop(1,'rgba('+b.h+',0)');ctx.fillStyle=g;ctx.fill()});
    requestAnimationFrame(draw);
  })();
}
function anim6(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,shards=[];
  for(var i=0;i<35;i++){var n=3+Math.floor(Math.random()*5),pts=[],r=6+Math.random()*30;for(var j=0;j<n;j++){var a=j/n*Math.PI*2+Math.random()*.6;pts.push({x:Math.cos(a)*r*(.4+Math.random()*.8),y:Math.sin(a)*r*(.4+Math.random()*.8)})}shards.push({x:Math.random()*W,y:Math.random()*H,rot:Math.random()*Math.PI*2,rs:(Math.random()-.5)*.015,pts:pts,hue:Math.random()*360,sat:80+Math.random()*20,alpha:.06+Math.random()*.12})}
  (function draw(){
    ctx.fillStyle='rgba(3,3,16,.08)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t+=.01;
    shards.forEach(function(s){s.rot+=s.rs;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);ctx.beginPath();ctx.moveTo(s.pts[0].x,s.pts[0].y);s.pts.forEach(function(p){ctx.lineTo(p.x,p.y)});ctx.closePath();var hue=(s.hue+t*30)%360;ctx.fillStyle='hsla('+hue+','+s.sat+'%,88%,'+s.alpha+')';ctx.fill();ctx.strokeStyle='hsla('+hue+',100%,95%,'+(s.alpha*2.5)+')';ctx.lineWidth=.7;ctx.stroke();ctx.restore()});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim7(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0;
  var stars=[];for(var i=0;i<300;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:.2+Math.random()*2.2,p:Math.random()*Math.PI*2,spd:.01+Math.random()*.06,hue:40+Math.random()*40});
  var nebulas=[{x:W*.15,y:H*.5,r:80,h:220},{x:W*.5,y:H*.4,r:100,h:270},{x:W*.82,y:H*.55,r:75,h:200},{x:W*.35,y:H*.7,r:60,h:250}];
  (function draw(){
    ctx.fillStyle='rgba(1,0,6,.08)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;
    nebulas.forEach(function(n){n.x+=Math.sin(t*.003+n.h)*.1;var g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);g.addColorStop(0,'hsla('+n.h+',60%,25%,.16)');g.addColorStop(.5,'hsla('+n.h+',70%,15%,.1)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill()});
    stars.forEach(function(s){s.p+=s.spd;var g=.25+.75*(Math.sin(s.p)+1)/2;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='hsla('+s.hue+',70%,'+(70+g*25)+'%,'+(.2+.75*g)+')';ctx.fill()});
    if(t%300<80){var prog=(t%300)/80,sy=H*.2;var sg=ctx.createLinearGradient(-20+prog*(W+80),sy,prog*(W+80),sy);sg.addColorStop(0,'transparent');sg.addColorStop(1,'rgba(255,220,120,.8)');ctx.strokeStyle=sg;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-20+prog*(W+80),sy);ctx.lineTo(prog*(W+80),sy);ctx.stroke()}
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim8(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0;
  function noise(x,y,t2){return Math.sin(x*2.1+t2)*Math.cos(y*1.8+t2*.7)+Math.sin(x*3.7+y*2.3+t2*1.1)*.5+Math.cos(x*1.2-y*3.1+t2*.9)*.3}
  (function draw(){
    ctx.fillStyle='rgba(8,5,0,.08)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t+=.012;
    var step=18;for(var y=0;y<H;y+=step)for(var x=0;x<W;x+=step){var n=noise(x/W*4,y/H*4,t),n2=noise(x/W*6+1.3,y/H*6+0.7,t*1.2),intensity=(n+1)/2*(n2+1)/2;if(intensity>.45){var gx=ctx.createRadialGradient(x,y,0,x,y,step*.8),a=(.15+intensity*.25)*(.8+.2*Math.sin(t*3+x*.05));gx.addColorStop(0,'rgba(255,'+(150+Math.floor(intensity*80))+',0,'+a+')');gx.addColorStop(1,'transparent');ctx.fillStyle=gx;ctx.beginPath();ctx.arc(x,y,step*.8,0,Math.PI*2);ctx.fill()}}
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim9(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,nodes=[];
  var cols=Math.floor(W/55),rows=4;for(var ry=0;ry<rows;ry++)for(var cx=0;cx<cols;cx++)nodes.push({ox:(cx+.5)*W/cols,oy:(ry+.5)*H/rows,x:0,y:0,p:Math.random()*Math.PI*2,spd:.02+Math.random()*.04,amp:8+Math.random()*12});
  (function draw(){
    ctx.fillStyle='rgba(0,4,14,.1)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;
    nodes.forEach(function(n){n.p+=n.spd;n.x=n.ox+Math.cos(n.p)*n.amp;n.y=n.oy+Math.sin(n.p*1.3)*n.amp*.6});
    for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<W/cols*1.8){ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle='rgba(80,160,255,'+((1-d/(W/cols*1.8))*.45)+')';ctx.lineWidth=.8;ctx.stroke()}}
    nodes.forEach(function(n){ctx.beginPath();ctx.arc(n.x,n.y,2.5,0,Math.PI*2);ctx.fillStyle='rgba(120,200,255,.7)';ctx.shadowColor='rgba(80,160,255,.8)';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim10(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,CX=W/2,CY=H/2,particles=[];
  for(var i=0;i<120;i++){var r=25+Math.random()*W*.48;particles.push({ang:Math.random()*Math.PI*2,r:r,spd:.025+Math.random()*.04,rSpd:.12+Math.random()*.45,size:1+Math.random()})}
  for(var i=0;i<40;i++)particles.push({ang:i/40*Math.PI*2,r:W*.42+Math.random()*30,spd:.01,rSpd:.08,size:.7});
  (function draw(){
    ctx.fillStyle='rgba(10,4,0,.1)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';
    var cg=ctx.createRadialGradient(CX,CY,0,CX,CY,60);cg.addColorStop(0,'rgba(255,180,0,.08)');cg.addColorStop(1,'transparent');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(CX,CY,60,0,Math.PI*2);ctx.fill();
    particles.forEach(function(p){p.ang+=p.spd;p.r-=p.rSpd;if(p.r<6){p.r=25+Math.random()*W*.48;p.ang=Math.random()*Math.PI*2}var px=CX+Math.cos(p.ang)*p.r,py=CY+Math.sin(p.ang)*p.r*.38,frac=Math.max(0,1-p.r/(W*.5)),hue=30+frac*20,l=55+frac*20;ctx.beginPath();ctx.arc(px,py,p.size+frac*1.2,0,Math.PI*2);ctx.fillStyle='hsla('+hue+',100%,'+l+'%,'+(.15+.8*frac)+')';ctx.fill()});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim11(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,nodes=[],pulses=[];
  for(var i=0;i<55;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,r:1.5+Math.random()*2,pulse:0});
  function firePulse(){var i=Math.floor(Math.random()*nodes.length),j=Math.floor(Math.random()*nodes.length);if(i===j)return;var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y;if(Math.sqrt(dx*dx+dy*dy)<W*.32)pulses.push({si:i,ti:j,prog:0,spd:.025+Math.random()*.03,done:false})}
  for(var i=0;i<8;i++)firePulse();
  (function draw(){
    ctx.fillStyle='rgba(0,4,18,.1)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;if(t%18===0)firePulse();while(pulses.length>30)pulses.shift();
    for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<W*.25){ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle='rgba(0,180,255,'+((1-d/(W*.25))*.16)+')';ctx.lineWidth=.6;ctx.stroke()}}
    pulses.forEach(function(p){if(p.done)return;p.prog+=p.spd;var n0=nodes[p.si],n1=nodes[p.ti],px=n0.x+(n1.x-n0.x)*p.prog,py=n0.y+(n1.y-n0.y)*p.prog,g=ctx.createRadialGradient(px,py,0,px,py,10);g.addColorStop(0,'rgba(0,240,255,.95)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,10,0,Math.PI*2);ctx.fill();if(p.prog>=1){nodes[p.ti].pulse=1;p.done=true}});
    pulses=pulses.filter(function(p){return!p.done});
    nodes.forEach(function(n){if(n.pulse>0)n.pulse=Math.max(0,n.pulse-.05);var g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*(2+n.pulse*7));g.addColorStop(0,'rgba(0,240,255,'+(.75+n.pulse*.25)+')');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(n.x,n.y,n.r*(1+n.pulse*4),0,Math.PI*2);ctx.fill()});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim12(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,scanY=0,glitchBands=[],gTimer=0;
  (function draw(){
    ctx.fillStyle='rgba(2,8,14,.09)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;
    for(var y=0;y<H;y+=4){ctx.fillStyle='rgba(160,230,255,.018)';ctx.fillRect(0,y,W,1.5)}
    scanY=(scanY+1.8)%H;var sg=ctx.createLinearGradient(0,scanY-10,0,scanY+10);sg.addColorStop(0,'transparent');sg.addColorStop(.5,'rgba(160,230,255,.22)');sg.addColorStop(1,'transparent');ctx.fillStyle=sg;ctx.fillRect(0,scanY-10,W,20);
    gTimer++;if(gTimer>35&&Math.random()<.05){gTimer=0;glitchBands=[];for(var i=0;i<1+Math.floor(Math.random()*3);i++)glitchBands.push({y:Math.random()*H,h:3+Math.random()*14,shift:(Math.random()-.5)*20,life:5+Math.floor(Math.random()*8)})}
    glitchBands=glitchBands.filter(function(b){return--b.life>0});
    glitchBands.forEach(function(b){try{var bd=ctx.getImageData(0,b.y,W,b.h);for(var i=0;i<bd.data.length;i+=4){bd.data[i]=Math.min(255,bd.data[i]+25);bd.data[i+2]=Math.max(0,bd.data[i+2]-18)}ctx.putImageData(bd,b.shift,b.y)}catch(e){}ctx.fillStyle='rgba(160,240,255,.05)';ctx.fillRect(0,b.y,W,b.h)});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim13(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,STEPS=Math.floor(W/20);
  (function draw(){
    ctx.fillStyle='rgba(0,8,6,.1)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t+=.028;
    for(var i=0;i<STEPS;i++){var x=i/(STEPS-1)*W,phase=i/STEPS*Math.PI*4-t,y1=H/2+Math.sin(phase)*H*.26,y2=H/2+Math.sin(phase+Math.PI)*H*.26,d1=.5+.5*Math.sin(phase),d2=.5+.5*Math.sin(phase+Math.PI);
      if(i%3===0){var alpha=(d1+d2)*.14+.04,hue=i%6<3?160:195;ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x,y2);ctx.strokeStyle='hsla('+hue+',80%,65%,'+alpha+')';ctx.lineWidth=1.5;ctx.stroke();ctx.beginPath();ctx.arc(x,(y1+y2)/2,2,0,Math.PI*2);ctx.fillStyle='hsla('+hue+',100%,80%,'+(alpha*2)+')';ctx.fill()}
      if(i<STEPS-1){var x2=(i+1)/(STEPS-1)*W,np1=H/2+Math.sin((i+1)/STEPS*Math.PI*4-t)*H*.26,np2=H/2+Math.sin((i+1)/STEPS*Math.PI*4-t+Math.PI)*H*.26;ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x2,np1);ctx.strokeStyle='rgba(0,255,180,'+d1*.85+')';ctx.lineWidth=1+d1*2.2;ctx.stroke();ctx.beginPath();ctx.moveTo(x,y2);ctx.lineTo(x2,np2);ctx.strokeStyle='rgba(0,200,255,'+d2*.85+')';ctx.lineWidth=1+d2*2.2;ctx.stroke()}}
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim14(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,embers=[];
  function spawn(){embers.push({x:Math.random()*W,y:H+4,vx:(Math.random()-.5)*.9,vy:-(1.3+Math.random()*2.8),life:1,decay:.006+Math.random()*.013,r:1+Math.random()*2.5,big:Math.random()<.15})}
  for(var i=0;i<80;i++){spawn();embers[i].y=Math.random()*H;embers[i].life=Math.random()}
  (function draw(){
    ctx.fillStyle='rgba(12,2,0,.09)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';if(embers.length<160)spawn();
    embers.forEach(function(e){e.life-=e.decay;e.x+=e.vx;e.y+=e.vy;e.vx+=(Math.random()-.5)*.09;var l=e.life,hue=l>.7?55:l>.4?28:l>.2?14:4,lum=l>.7?92:l>.4?72:l>.2?55:40,r=e.r*(e.big?2.6:1);ctx.beginPath();ctx.arc(e.x,e.y,r*l,0,Math.PI*2);ctx.fillStyle='hsla('+hue+',100%,'+lum+'%,'+(l*.88)+')';ctx.fill();if(e.big&&l>.3){var g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,r*5);g.addColorStop(0,'rgba(255,80,0,'+l*.1+')');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,r*5,0,Math.PI*2);ctx.fill()}});
    embers=embers.filter(function(e){return e.life>0&&e.y>-10});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim15(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,bolts=[];
  function mkBolt(x1,y1,x2,y2,d){if(d<=0)return[[x1,y1,x2,y2]];var mx=(x1+x2)/2+(Math.random()-.5)*(Math.abs(x2-x1)+Math.abs(y2-y1))*.42,my=(y1+y2)/2+(Math.random()-.5)*(Math.abs(x2-x1)+Math.abs(y2-y1))*.42,r=mkBolt(x1,y1,mx,my,d-1).concat(mkBolt(mx,my,x2,y2,d-1));if(Math.random()<.28)r=r.concat(mkBolt(mx,my,mx+(Math.random()-.5)*55,my+(Math.random()-.5)*38,d-2));return r}
  function spawnBolt(){var ex=Math.random()<.5?Math.random()*W*.3:W*(.7+Math.random()*.3);bolts.push({segs:mkBolt(ex,0,W/2+(Math.random()-.5)*W*.3,H/2+(Math.random()-.5)*H*.4,5),life:1,decay:.08+Math.random()*.1})}
  spawnBolt();
  (function draw(){
    ctx.fillStyle='rgba(4,4,18,.09)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;if(t%42===0)spawnBolt();while(bolts.length>5)bolts.shift();
    bolts.forEach(function(b){b.life-=b.decay;var f=Math.max(0,b.life);if(f>.8){ctx.fillStyle='rgba(200,210,255,'+f*.06+')';ctx.fillRect(0,0,W,H)}b.segs.forEach(function(s){ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);ctx.strokeStyle='rgba(255,255,255,'+f*.9+')';ctx.lineWidth=1.4;ctx.stroke();ctx.strokeStyle='rgba(180,210,255,'+f*.35+')';ctx.lineWidth=5;ctx.stroke()})});
    bolts=bolts.filter(function(b){return b.life>0});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim16(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,packets=[],traces=[];
  var N=10+Math.floor(W/75);for(var i=0;i<N;i++){var segs=[],cx=Math.random()*W,cy=Math.random()*H;for(var j=0;j<5;j++){var horiz=Math.random()<.5,len=20+Math.random()*(horiz?W*.18:H*.28),ex=cx+(horiz?(Math.random()<.5?1:-1)*len:0),ey=cy+(horiz?0:(Math.random()<.5?1:-1)*len);ex=Math.max(5,Math.min(W-5,ex));ey=Math.max(5,Math.min(H-5,ey));segs.push([cx,cy,ex,ey]);cx=ex;cy=ey}traces.push({segs:segs,hue:120+Math.floor(Math.random()*50)})}
  function spawnPkt(){var tr=traces[Math.floor(Math.random()*traces.length)];packets.push({tr:tr,si:0,prog:0,spd:.028+Math.random()*.04})}
  for(var i=0;i<10;i++)spawnPkt();
  (function draw(){
    ctx.fillStyle='rgba(0,6,2,.09)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;if(t%22===0&&packets.length<25)spawnPkt();
    traces.forEach(function(tr){tr.segs.forEach(function(s){ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);ctx.strokeStyle='rgba(0,'+tr.hue+',50,.07)';ctx.lineWidth=1;ctx.stroke()})});
    packets.forEach(function(pk){var seg=pk.tr.segs[pk.si];if(!seg)return;pk.prog+=pk.spd;if(pk.prog>=1){pk.si=(pk.si+1)%pk.tr.segs.length;pk.prog=0}var x=seg[0]+(seg[2]-seg[0])*pk.prog,y=seg[1]+(seg[3]-seg[1])*pk.prog,g=ctx.createRadialGradient(x,y,0,x,y,9);g.addColorStop(0,'rgba(80,255,120,.95)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill()});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim17(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,BARS=72,freqs=[];
  for(var i=0;i<BARS;i++)freqs.push({f:.4+Math.random()*3.2,ph:Math.random()*Math.PI*2,amp:.3+Math.random()*.7});
  (function draw(){
    ctx.fillStyle='rgba(3,0,14,.1)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t+=.042;
    var bw=W/BARS,mid=H/2;
    for(var i=0;i<BARS;i++){var f=freqs[i],h=(Math.abs(Math.sin(f.f*t+f.ph))*f.amp+Math.abs(Math.sin(f.f*.65*t+f.ph+1.2))*f.amp*.5)*mid*.88,hue=(i/BARS*240+t*18)%360,x=i*bw;var g=ctx.createLinearGradient(0,mid-h,0,mid);g.addColorStop(0,'hsla('+hue+',100%,68%,.92)');g.addColorStop(1,'hsla('+hue+',100%,45%,.28)');ctx.fillStyle=g;ctx.fillRect(x+1,mid-h,bw-2,h);var rg=ctx.createLinearGradient(0,mid,0,mid+h*.5);rg.addColorStop(0,'hsla('+hue+',100%,45%,.16)');rg.addColorStop(1,'transparent');ctx.fillStyle=rg;ctx.fillRect(x+1,mid,bw-2,h*.5)}
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim18(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,arcs=[],CX=W/2,CY=H/2;
  function spawnArc(){var ang=Math.random()*Math.PI*2,len=40+Math.random()*Math.min(W,H)*.38,segs=[],cx=CX,cy=CY;for(var i=0;i<6;i++){var nf=(i+1)/6,ex=CX+Math.cos(ang)*len*nf+(Math.random()-.5)*len*.32,ey=CY+Math.sin(ang)*len*nf+(Math.random()-.5)*len*.32;segs.push([cx,cy,ex,ey]);cx=ex;cy=ey}arcs.push({segs:segs,life:1,decay:.07+Math.random()*.1,hue:260+Math.random()*60})}
  for(var i=0;i<5;i++)spawnArc();
  (function draw(){
    ctx.fillStyle='rgba(2,0,12,.09)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;if(t%8===0)spawnArc();while(arcs.length>22)arcs.shift();
    var cg=ctx.createRadialGradient(CX,CY,0,CX,CY,55);cg.addColorStop(0,'rgba(200,160,255,'+(.14+.07*Math.sin(t*.09))+')');cg.addColorStop(1,'transparent');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(CX,CY,55,0,Math.PI*2);ctx.fill();
    arcs.forEach(function(a){a.life-=a.decay;var f=Math.max(0,a.life);a.segs.forEach(function(s){ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);ctx.strokeStyle='hsla('+a.hue+',100%,82%,'+f*.82+')';ctx.lineWidth=1.2;ctx.stroke()})});
    arcs=arcs.filter(function(a){return a.life>0});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim19(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,blobs=[],wisps=[];
  function spawnBlob(){blobs.push({x:W*.1+Math.random()*W*.8,y:H*.1+Math.random()*H*.8,r:0,maxR:28+Math.random()*58,spd:.35+Math.random()*.55,hue:235+Math.random()*65,life:1,decay:.003+Math.random()*.005})}
  function spawnWisp(){var pts=[],cx=Math.random()*W,cy=H*.5+(Math.random()-.5)*H*.3;for(var i=0;i<9;i++){cx+=(Math.random()-.5)*38;cy+=(Math.random()-.5)*22;pts.push([cx,cy])}wisps.push({pts:pts,life:1,decay:.007,hue:245+Math.random()*45})}
  for(var i=0;i<8;i++){spawnBlob();blobs[i].r=blobs[i].maxR*Math.random()}for(var i=0;i<4;i++)spawnWisp();
  (function draw(){
    ctx.fillStyle='rgba(3,2,10,.06)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;if(t%55===0)spawnBlob();if(t%75===0)spawnWisp();
    blobs.forEach(function(b){b.r=Math.min(b.r+b.spd,b.maxR);b.life-=b.decay;var g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);g.addColorStop(0,'hsla('+b.hue+',60%,55%,'+b.life*.18+')');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()});
    blobs=blobs.filter(function(b){return b.life>0});
    wisps.forEach(function(w){w.life-=w.decay;if(w.pts.length<2)return;ctx.beginPath();ctx.moveTo(w.pts[0][0],w.pts[0][1]);for(var i=1;i<w.pts.length;i++)ctx.lineTo(w.pts[i][0],w.pts[i][1]);ctx.strokeStyle='hsla('+w.hue+',50%,72%,'+w.life*.11+')';ctx.lineWidth=2+w.life*3.5;ctx.stroke()});
    wisps=wisps.filter(function(w){return w.life>0});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim20(cv){
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,t=0,CX=W/2,CY=H/2,particles=[];
  for(var i=0;i<200;i++){var ang=Math.random()*Math.PI*2,r=H*.16+Math.random()*W*.46;particles.push({ang:ang,r:r,spd:.009+Math.random()*.024,rD:.04+Math.random()*.18,hue:215+Math.random()*65,sz:.8+Math.random()*1.5})}
  (function draw(){
    ctx.fillStyle='rgba(1,0,8,.08)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='screen';t++;
    particles.forEach(function(p){p.ang+=p.spd;p.r-=p.rD*.015;if(p.r<H*.1){p.r=H*.16+Math.random()*W*.44;p.ang=Math.random()*Math.PI*2}var px=CX+Math.cos(p.ang)*p.r,py=CY+Math.sin(p.ang)*p.r*.28,frac=1-Math.max(0,(p.r-H*.1))/(W*.45);ctx.beginPath();ctx.arc(px,py,p.sz*(1+frac*.5),0,Math.PI*2);ctx.fillStyle='hsla('+p.hue+',90%,72%,'+(.18+frac*.7)+')';ctx.fill()});
    var ringR=H*.13;for(var i=0;i<3;i++){ctx.beginPath();ctx.ellipse(CX,CY,ringR+i*2.5,ringR*.28+i*.5,0,0,Math.PI*2);ctx.strokeStyle='rgba('+(155+i*22)+','+(175+i*18)+',255,'+(.48-i*.13)+')';ctx.lineWidth=2.2-i*.5;ctx.stroke()}
    var shadow=ctx.createRadialGradient(CX,CY,0,CX,CY,ringR*.88);shadow.addColorStop(0,'rgba(0,0,0,.96)');shadow.addColorStop(1,'rgba(0,0,0,.35)');ctx.fillStyle=shadow;ctx.beginPath();ctx.ellipse(CX,CY,ringR*.88,ringR*.88*.28,0,0,Math.PI*2);ctx.fill();
    [[-1,.065],[1,.065]].forEach(function(d){var jg=ctx.createLinearGradient(CX,CY,CX,CY+d[0]*H*.5);jg.addColorStop(0,'rgba(160,200,255,'+d[1]+')');jg.addColorStop(1,'transparent');ctx.fillStyle=jg;ctx.beginPath();ctx.moveTo(CX-6,CY);ctx.quadraticCurveTo(CX-22,CY+d[0]*H*.25,CX-4,CY+d[0]*H*.5);ctx.lineTo(CX+4,CY+d[0]*H*.5);ctx.quadraticCurveTo(CX+22,CY+d[0]*H*.25,CX+6,CY);ctx.closePath();ctx.fill()});
    ctx.globalCompositeOperation='source-over';requestAnimationFrame(draw);
  })();
}
function anim21(cv){ /* CLASSIC GOLD — CSS only */ }

var FN=[null,anim1,anim2,anim3,anim4,anim5,anim6,anim7,anim8,anim9,anim10,anim11,anim12,anim13,anim14,anim15,anim16,anim17,anim18,anim19,anim20,anim21];

/* ──────────────────────────────────────
   DESIGN CSS OVERRIDES (21개)
────────────────────────────────────── */
// 각 항목: [이름, 설명, CSS override 문자열]
// CSS override = 헤더 요소들 스타일 변경 (기존 CSS에 !important로 덮어씀)
// null이면 원본 유지 (21번 CLASSIC)
var DS = [
  null, // index 0 unused
  // 1 PARTICLE SWARM
  {nm:'PARTICLE SWARM',de:'입자 군집이 텍스트 형성 · 스프링 물리',bg:'rgba(0,3,14,.35)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;color:transparent!important;background:none!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;animation:none!important;font-weight:300!important;letter-spacing:.4em!important}.hdr-eyebrow{color:rgba(0,200,255,.4)!important}.hdr-sub{color:rgba(0,180,255,.35)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(0,210,255,.6) 20%,rgba(0,210,255,.6) 80%,transparent)!important;box-shadow:0 0 8px rgba(0,200,255,.4)!important}.orn-gem{background:#00d8ff!important;box-shadow:0 0 10px rgba(0,200,255,.7)!important}'},
  // 2 DEEP NEON
  {nm:'DEEP NEON',de:'이중 네온 스트로크+블룸 · 핑크·블루',bg:'rgba(6,0,12,.5)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;color:transparent!important;background:none!important;-webkit-text-fill-color:transparent!important;-webkit-text-stroke:2px #ff2d78!important;text-shadow:0 0 8px #ff2d78,0 0 20px #ff2d78,0 0 45px rgba(255,45,120,.6)!important;animation:none!important;font-weight:900!important}.hdr-eyebrow{color:rgba(255,45,120,.45)!important}.hdr-sub{color:rgba(0,180,255,.4)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(255,45,120,.7) 20%,rgba(255,45,120,.7) 80%,transparent)!important;box-shadow:0 0 12px rgba(255,45,120,.5)!important}.orn-gem{background:#ff2d78!important;box-shadow:0 0 12px rgba(255,45,120,.9)!important}'},
  // 3 MATRIX BURN
  {nm:'MATRIX BURN',de:'매트릭스 코드 레인 · 그린 텍스트 번오프',bg:'rgba(0,8,2,.38)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;color:#00ff66!important;background:none!important;-webkit-text-fill-color:#00ff66!important;text-shadow:0 0 8px #00ff66,0 0 22px rgba(0,255,100,.8),0 0 50px rgba(0,255,80,.4)!important;animation:none!important}.hdr-eyebrow{color:rgba(0,200,80,.45)!important}.hdr-sub{color:rgba(0,180,60,.4)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(0,255,90,.6) 20%,rgba(0,255,90,.6) 80%,transparent)!important;box-shadow:0 0 10px rgba(0,255,90,.4)!important}.orn-gem{background:#00ff66!important;box-shadow:0 0 10px rgba(0,255,100,.8)!important}'},
  // 4 PLASMA FORK
  {nm:'PLASMA FORK',de:'프랙탈 번개 방전 · 퍼플 플라즈마',bg:'rgba(8,0,18,.45)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;color:#e8c0ff!important;background:none!important;-webkit-text-fill-color:#e8c0ff!important;text-shadow:0 0 10px rgba(180,80,255,1),0 0 25px rgba(160,60,255,.8),0 0 55px rgba(130,40,220,.5)!important;animation:none!important;font-weight:300!important}.hdr-eyebrow{color:rgba(180,80,255,.45)!important}.hdr-sub{color:rgba(160,70,255,.38)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(180,80,255,.65) 20%,rgba(180,80,255,.65) 80%,transparent)!important;box-shadow:0 0 12px rgba(180,80,255,.5)!important}.orn-gem{background:#c050ff!important;box-shadow:0 0 12px rgba(180,80,255,.8)!important}'},
  // 5 AURORA WAVE
  {nm:'AURORA WAVE',de:'8겹 오로라 밴드 · 그라디언트 흐름',bg:'rgba(5,0,16,.28)',
   css:'.hdr-title{font-family:"Exo 2",sans-serif!important;font-weight:100!important;letter-spacing:.45em!important;background:linear-gradient(135deg,#cc80ff 0%,#00ffd0 35%,#44aaff 65%,#ff88cc 100%)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;filter:drop-shadow(0 0 20px rgba(120,200,255,.6))!important;animation:none!important}.hdr-eyebrow{color:rgba(150,200,255,.45)!important}.hdr-sub{color:rgba(140,180,255,.38)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(120,200,255,.45) 20%,rgba(120,200,255,.45) 80%,transparent)!important;box-shadow:none!important}.orn-gem{background:linear-gradient(135deg,#cc80ff,#00ffd0)!important;box-shadow:0 0 10px rgba(100,200,255,.6)!important}'},
  // 6 CRYSTAL PRISM
  {nm:'CRYSTAL PRISM',de:'크리스탈 샤드 폭풍 · 프리즘 색상 순환',bg:'rgba(3,3,16,.32)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:700!important;background:linear-gradient(120deg,#fff 0%,#aaffff 20%,#fff 40%,#ffffaa 60%,#ffaaff 80%,#aaaaff 100%)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;animation:dp-crystalShift 3s linear infinite!important}.hdr-eyebrow{color:rgba(200,220,255,.4)!important}.hdr-sub{color:rgba(180,200,255,.35)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(200,230,255,.5) 20%,rgba(200,230,255,.5) 80%,transparent)!important;box-shadow:none!important}.orn-gem{background:linear-gradient(135deg,#fff,#cff)!important;box-shadow:0 0 10px rgba(200,230,255,.7)!important}'},
  // 7 COSMOS DEEP
  {nm:'COSMOS DEEP',de:'300+ 별+성운 · 황금빛 우주 성간',bg:'rgba(1,0,6,.35)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:300!important;color:#f5e060!important;background:none!important;-webkit-text-fill-color:#f5e060!important;text-shadow:0 0 10px rgba(245,210,60,1),0 0 28px rgba(240,180,30,.8),0 0 60px rgba(220,150,0,.4)!important;animation:none!important}.hdr-eyebrow{color:rgba(240,200,50,.4)!important}.hdr-sub{color:rgba(220,180,40,.38)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(240,200,50,.55) 20%,rgba(240,200,50,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(240,200,50,.4)!important}.orn-gem{background:#f5e060!important;box-shadow:0 0 12px rgba(240,200,50,.8)!important}'},
  // 8 LIQUID GOLD
  {nm:'LIQUID GOLD',de:'황금 에너지 펄스 · 메탈릭 글로우',bg:'rgba(8,5,0,.4)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:900!important;color:#ffd700!important;background:none!important;-webkit-text-fill-color:#ffd700!important;text-shadow:0 0 6px #ffbb00,0 0 18px rgba(255,180,0,.9),0 0 40px rgba(255,140,0,.6)!important;animation:dp-goldPulse 2s ease-in-out infinite!important}.hdr-eyebrow{color:rgba(255,180,0,.45)!important}.hdr-sub{color:rgba(240,160,0,.38)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(255,180,0,.65) 20%,rgba(255,180,0,.65) 80%,transparent)!important;box-shadow:0 0 12px rgba(255,160,0,.5)!important}.orn-gem{background:#ffd700!important;box-shadow:0 0 14px rgba(255,200,0,.9)!important}'},
  // 9 QUANTUM MESH
  {nm:'QUANTUM MESH',de:'양자 와이어프레임 · 신경망 위상',bg:'rgba(0,4,14,.38)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:300!important;color:#a0d8ff!important;background:none!important;-webkit-text-fill-color:#a0d8ff!important;text-shadow:0 0 8px rgba(100,180,255,1),0 0 22px rgba(80,160,255,.8),0 0 50px rgba(60,130,255,.5)!important;animation:dp-meshPulse 4s ease-in-out infinite!important;letter-spacing:.4em!important}.hdr-eyebrow{color:rgba(100,170,255,.42)!important}.hdr-sub{color:rgba(90,160,255,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(80,160,255,.55) 20%,rgba(80,160,255,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(80,160,255,.4)!important}.orn-gem{background:#60aaff!important;box-shadow:0 0 10px rgba(80,160,255,.7)!important}'},
  // 10 VORTEX COLLAPSE
  {nm:'VORTEX COLLAPSE',de:'에너지 소용돌이 붕괴 · 황금 나선',bg:'rgba(10,4,0,.42)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:700!important;color:#ff9900!important;background:none!important;-webkit-text-fill-color:#ff9900!important;text-shadow:0 0 8px #ff9900,0 0 22px rgba(255,140,0,.9),0 0 50px rgba(255,100,0,.6)!important;animation:none!important}.hdr-eyebrow{color:rgba(255,140,0,.42)!important}.hdr-sub{color:rgba(240,120,0,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(255,140,0,.65) 20%,rgba(255,140,0,.65) 80%,transparent)!important;box-shadow:0 0 12px rgba(255,120,0,.5)!important}.orn-gem{background:#ff9900!important;box-shadow:0 0 14px rgba(255,140,0,.9)!important}'},
  // 11 NEURAL PULSE
  {nm:'NEURAL PULSE',de:'시냅스 발화 · 신경망 전기 신호',bg:'rgba(0,4,18,.4)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:300!important;color:#00f0ff!important;background:none!important;-webkit-text-fill-color:#00f0ff!important;text-shadow:0 0 8px #00d8ff,0 0 22px rgba(0,200,255,.8),0 0 50px rgba(0,160,255,.5)!important;animation:none!important;letter-spacing:.4em!important}.hdr-eyebrow{color:rgba(0,200,255,.42)!important}.hdr-sub{color:rgba(0,180,255,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(0,200,255,.55) 20%,rgba(0,200,255,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(0,180,255,.4)!important}.orn-gem{background:#00e8ff!important;box-shadow:0 0 12px rgba(0,200,255,.8)!important}'},
  // 12 GLITCH SCAN
  {nm:'GLITCH SCAN',de:'홀로그램 스캔라인 · RGB 채널 글리치',bg:'rgba(2,8,14,.38)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:700!important;color:#e0f8ff!important;background:none!important;-webkit-text-fill-color:#e0f8ff!important;text-shadow:0 0 6px #aaeeff,0 0 18px rgba(180,240,255,.7)!important;animation:none!important;letter-spacing:.35em!important}.hdr-eyebrow{color:rgba(160,230,255,.42)!important}.hdr-sub{color:rgba(140,210,255,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(160,230,255,.5) 20%,rgba(160,230,255,.5) 80%,transparent)!important;box-shadow:none!important}.orn-gem{background:#c0f0ff!important;box-shadow:0 0 10px rgba(150,220,255,.7)!important}'},
  // 13 DNA HELIX
  {nm:'DNA HELIX',de:'이중 나선 회전 · 생명 코드 시각화',bg:'rgba(0,8,6,.38)',
   css:'.hdr-title{font-family:"Exo 2",sans-serif!important;font-weight:200!important;color:#00ffcc!important;background:none!important;-webkit-text-fill-color:#00ffcc!important;text-shadow:0 0 8px #00ffaa,0 0 22px rgba(0,240,160,.8)!important;animation:none!important;letter-spacing:.5em!important}.hdr-eyebrow{color:rgba(0,220,150,.42)!important}.hdr-sub{color:rgba(0,200,130,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(0,220,150,.55) 20%,rgba(0,220,150,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(0,200,140,.4)!important}.orn-gem{background:#00ffcc!important;box-shadow:0 0 12px rgba(0,220,160,.8)!important}'},
  // 14 EMBER STORM
  {nm:'EMBER STORM',de:'불씨 상승 폭풍 · 고열 파티클',bg:'rgba(12,2,0,.45)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:700!important;color:#ff6600!important;background:none!important;-webkit-text-fill-color:#ff6600!important;text-shadow:0 0 8px #ff4400,0 0 22px rgba(255,80,0,.9),0 0 50px rgba(255,50,0,.6)!important;animation:none!important}.hdr-eyebrow{color:rgba(255,100,0,.42)!important}.hdr-sub{color:rgba(240,80,0,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(255,80,0,.65) 20%,rgba(255,80,0,.65) 80%,transparent)!important;box-shadow:0 0 12px rgba(255,60,0,.5)!important}.orn-gem{background:#ff4400!important;box-shadow:0 0 14px rgba(255,80,0,.9)!important}'},
  // 15 LIGHTNING STRIKE
  {nm:'LIGHTNING STRIKE',de:'백색 번개 방전 · 하늘을 가르는 전압',bg:'rgba(4,4,18,.4)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:900!important;color:#fff!important;background:none!important;-webkit-text-fill-color:#fff!important;text-shadow:0 0 4px #fff,0 0 12px rgba(200,220,255,1),0 0 30px rgba(150,180,255,.8)!important;animation:none!important;letter-spacing:.3em!important}.hdr-eyebrow{color:rgba(180,200,255,.42)!important}.hdr-sub{color:rgba(160,180,255,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(180,200,255,.55) 20%,rgba(180,200,255,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(160,180,255,.4)!important}.orn-gem{background:#e0eaff!important;box-shadow:0 0 12px rgba(180,200,255,.8)!important}'},
  // 16 CIRCUIT FLOW
  {nm:'CIRCUIT FLOW',de:'PCB 회로 흐름 · 데이터 패킷 트레이스',bg:'rgba(0,6,2,.38)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:300!important;color:#22ff88!important;background:none!important;-webkit-text-fill-color:#22ff88!important;text-shadow:0 0 6px #00ee66,0 0 18px rgba(0,230,100,.8)!important;animation:none!important;letter-spacing:.4em!important}.hdr-eyebrow{color:rgba(0,220,100,.42)!important}.hdr-sub{color:rgba(0,200,80,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(0,220,100,.55) 20%,rgba(0,220,100,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(0,200,80,.4)!important}.orn-gem{background:#22ff88!important;box-shadow:0 0 12px rgba(0,220,100,.8)!important}'},
  // 17 SPECTRUM WAVE
  {nm:'SPECTRUM WAVE',de:'주파수 스펙트럼 · 멀티컬러 EQ',bg:'rgba(3,0,14,.38)',
   css:'.hdr-title{font-family:"Exo 2",sans-serif!important;font-weight:200!important;background:linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;filter:drop-shadow(0 0 18px rgba(120,100,255,.5))!important;animation:none!important;letter-spacing:.45em!important}.hdr-eyebrow{color:rgba(150,120,255,.42)!important}.hdr-sub{color:rgba(130,100,255,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff)!important;opacity:.45!important;box-shadow:none!important}.orn-gem{background:linear-gradient(135deg,#ff6b6b,#c77dff)!important;box-shadow:0 0 10px rgba(150,100,255,.7)!important}'},
  // 18 TESLA ARC
  {nm:'TESLA ARC',de:'테슬라 코일 방전 · 중심 플라즈마',bg:'rgba(2,0,12,.4)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:300!important;color:#cc99ff!important;background:none!important;-webkit-text-fill-color:#cc99ff!important;text-shadow:0 0 8px rgba(180,120,255,1),0 0 22px rgba(160,90,255,.8),0 0 50px rgba(130,60,220,.5)!important;animation:none!important;letter-spacing:.4em!important}.hdr-eyebrow{color:rgba(180,120,255,.42)!important}.hdr-sub{color:rgba(160,100,255,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(160,100,255,.55) 20%,rgba(160,100,255,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(160,100,255,.4)!important}.orn-gem{background:#c080ff!important;box-shadow:0 0 12px rgba(180,100,255,.8)!important}'},
  // 19 INK DIFFUSE
  {nm:'INK DIFFUSE',de:'잉크 확산 · 보이드 속 부드러운 안개',bg:'rgba(3,2,10,.42)',
   css:'.hdr-title{font-family:"Exo 2",sans-serif!important;font-weight:100!important;color:rgba(220,215,255,.9)!important;background:none!important;-webkit-text-fill-color:rgba(220,215,255,.9)!important;text-shadow:0 0 30px rgba(180,160,255,.4)!important;animation:none!important;letter-spacing:.55em!important}.hdr-eyebrow{color:rgba(180,160,255,.38)!important}.hdr-sub{color:rgba(160,140,240,.3)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(180,160,255,.35) 20%,rgba(180,160,255,.35) 80%,transparent)!important;box-shadow:none!important}.orn-gem{background:rgba(200,180,255,.6)!important;box-shadow:0 0 8px rgba(180,160,255,.5)!important}'},
  // 20 EVENT HORIZON
  {nm:'EVENT HORIZON',de:'블랙홀 포톤링 · 강착 원반 소용돌이',bg:'rgba(1,0,8,.45)',
   css:'.hdr-title{font-family:Orbitron,monospace!important;font-weight:700!important;color:#6688ff!important;background:none!important;-webkit-text-fill-color:#6688ff!important;text-shadow:0 0 8px rgba(80,100,255,1),0 0 22px rgba(60,80,255,.9),0 0 50px rgba(40,60,220,.6)!important;animation:none!important;letter-spacing:.35em!important}.hdr-eyebrow{color:rgba(100,130,255,.42)!important}.hdr-sub{color:rgba(80,110,255,.36)!important}.hdr-rule,.hdr-rule-bot{background:linear-gradient(90deg,transparent,rgba(80,120,255,.55) 20%,rgba(80,120,255,.55) 80%,transparent)!important;box-shadow:0 0 10px rgba(80,100,255,.4)!important}.orn-gem{background:#5577ff!important;box-shadow:0 0 12px rgba(80,120,255,.8)!important}'},
  // 21 CLASSIC GOLD (원본 — CSS 초기화)
  {nm:'CLASSIC GOLD ★',de:'현재 포털 원본 — Georgia 황금 그라디언트',bg:'transparent',css:''}
];

/* ──────────────────────────────────────
   PICKER UI 빌드
────────────────────────────────────── */
function buildUI(){
  // 스타일 인젝션
  var styleEl=document.createElement('style');
  styleEl.textContent=[
    /* 보조 keyframes */
    '@keyframes dp-crystalShift{0%{filter:drop-shadow(0 0 15px rgba(200,230,255,.5)) hue-rotate(0deg)}100%{filter:drop-shadow(0 0 15px rgba(200,230,255,.5)) hue-rotate(360deg)}}',
    '@keyframes dp-goldPulse{0%,100%{text-shadow:0 0 6px #ffbb00,0 0 18px rgba(255,180,0,.9),0 0 40px rgba(255,140,0,.6)}50%{text-shadow:0 0 10px #ffcc00,0 0 28px rgba(255,200,0,1),0 0 60px rgba(255,160,0,.7)}}',
    '@keyframes dp-meshPulse{0%,100%{opacity:1}50%{opacity:.75}}',
    /* 🎨 버튼 */
    '#dp-btn{position:fixed;top:16px;right:20px;z-index:9990;width:34px;height:34px;border-radius:50%;background:rgba(200,150,30,.14);border:1px solid rgba(200,150,30,.35);color:rgba(200,150,30,.85);font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;backdrop-filter:blur(8px);padding:0}',
    '#dp-btn:hover{background:rgba(200,150,30,.3);color:#e8b830;border-color:rgba(200,150,30,.6)}',
    /* 오버레이 */
    '#dp-modal{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);backdrop-filter:blur(14px);align-items:center;justify-content:center;overflow-y:auto;padding:12px;box-sizing:border-box}',
    '#dp-modal.open{display:flex}',
    /* 카드 */
    '#dp-card{width:min(860px,94vw);border:1px solid rgba(200,150,30,.2);border-radius:10px;overflow:hidden;background:rgba(4,2,0,.92);box-shadow:0 20px 80px rgba(0,0,0,.95);max-height:calc(100dvh - 24px);overflow-y:auto}',
    /* 미리보기 */
    '#dp-prev-wrap{position:relative;height:168px;overflow:hidden;background:url(klimt_tree.jpg) center 35%/cover;isolation:isolate}',
    '#dp-prev-wrap canvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}',
    '#dp-prev-text{position:relative;z-index:5;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}',
    '#dp-gr-top,#dp-gr-bot{position:absolute;left:0;right:0;z-index:6}',
    '#dp-gr-top{top:13px}#dp-gr-bot{bottom:13px}',
    '.dp-gr-line{height:1px;width:100%}.dp-gr-gem{position:absolute;top:-3.5px;left:50%;transform:translateX(-50%) rotate(45deg);width:7px;height:7px}',
    '#dp-eye{font-size:8px;letter-spacing:4px;font-family:monospace;margin-bottom:4px;text-transform:uppercase}',
    '#dp-ttl{font-size:clamp(22px,3vw,40px);font-weight:300;letter-spacing:.35em}',
    '#dp-sub{font-size:8px;letter-spacing:3px;font-family:monospace;margin-top:4px}',
    /* 컨트롤 바 */
    '#dp-ctrl{display:flex;align-items:center;gap:10px;padding:14px 16px;border-top:1px solid rgba(200,150,30,.1)}',
    '#dp-ctrl button{cursor:pointer;border:1px solid rgba(200,150,30,.25);border-radius:3px;background:rgba(200,150,30,.06);color:rgba(200,150,30,.7);font-family:monospace;letter-spacing:1px;transition:all .15s;white-space:nowrap}',
    '#dp-ctrl button:hover{background:rgba(200,150,30,.2);color:#e8b830}',
    '#dp-prev-btn,#dp-next-btn{padding:6px 12px;font-size:13px}',
    '#dp-apply{padding:7px 18px;font-size:10px;letter-spacing:2px;flex-shrink:0}',
    '#dp-close-btn{padding:6px 10px;font-size:13px;margin-left:auto}',
    '#dp-info{flex:1;text-align:center}',
    '#dp-num{font-size:9px;letter-spacing:4px;color:rgba(200,150,30,.35);font-family:monospace}',
    '#dp-name{font-size:13px;letter-spacing:5px;color:rgba(200,150,30,.75);font-family:Orbitron,monospace;text-transform:uppercase}',
    '#dp-desc{font-size:9px;letter-spacing:1px;color:rgba(200,150,30,.3);font-family:monospace;margin-top:3px}',
    /* 슬라이더 행 */
    '#dp-sliders{display:flex;align-items:center;gap:14px;padding:10px 16px 12px;border-top:1px solid rgba(200,150,30,.07)}',
    '#dp-sliders label{display:flex;align-items:center;gap:6px;font-size:13px;letter-spacing:1px;color:rgba(200,150,30,.95);font-family:monospace;white-space:nowrap;font-weight:700}',
    '#dp-sliders input[type=range]{width:100px;accent-color:rgba(200,150,30,.7);cursor:pointer;height:3px}',
    '#dp-reset{cursor:pointer;border:1px solid rgba(200,150,30,.25);border-radius:3px;background:rgba(200,150,30,.06);color:rgba(200,150,30,.6);font-family:monospace;letter-spacing:1px;font-size:9px;padding:5px 10px;transition:all .15s;margin-left:auto}',
    '#dp-reset:hover{background:rgba(200,150,30,.2);color:#e8b830}',
    /* 헤더 캔버스 호스트 */
    '#dp-hdr-cv-host{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0}',
    /* ── 반응형: 스마트폰 펼쳤을 때 (폴드5 메인 ~690px) ── */
    '@media(max-width:700px){',
      '#dp-btn{top:10px;right:auto;left:10px;width:42px;height:42px;font-size:18px}',
      '#dp-card{width:96vw}',
      '#dp-prev-wrap{height:clamp(90px,22vw,140px)}',
      '#dp-eye,#dp-num,#dp-desc{display:none}',
      '#dp-ctrl{flex-wrap:wrap;gap:8px;padding:10px 12px}',
      '#dp-prev-btn,#dp-next-btn{padding:12px 18px;font-size:16px;flex:1;text-align:center}',
      '#dp-apply{order:3;flex:1 0 100%;padding:12px;font-size:12px;text-align:center}',
      '#dp-close-btn{padding:12px 14px;margin-left:0}',
      '#dp-info{order:2;width:100%;flex:1 0 100%;padding:4px 0}',
      '#dp-sliders{flex-wrap:wrap;gap:8px 12px;padding:8px 12px 12px}',
      '#dp-sliders input[type=range]{width:min(150px,34vw)}',
      '#dp-sliders label{font-size:12px}',
      '#dp-reset{font-size:11px;padding:10px 14px;margin-left:0}',
    '}',
    /* ── 폴드5 커버(접었을 때) ~344px ── */
    '@media(max-width:430px){',
      '#dp-prev-wrap{height:80px}',
      '#dp-ttl{font-size:18px!important;letter-spacing:.15em!important}',
      '#dp-ctrl button{font-size:14px}',
      '#dp-sliders{flex-direction:column;gap:6px}',
      '#dp-sliders label{width:100%;justify-content:space-between;white-space:normal}',
      '#dp-sliders input[type=range]{flex:1;min-width:0;width:auto}',
    '}'
  ].join('');
  document.head.appendChild(styleEl);

  // HTML 빌드
  var root=document.createElement('div');root.id='dp-root';
  root.innerHTML=[
    '<button id="dp-btn">🎨</button>',
    '<div id="dp-modal">',
      '<div id="dp-card">',
        '<div id="dp-prev-wrap">',
          '<canvas id="dp-cv"></canvas>',
          '<div id="dp-gr-top"><div class="dp-gr-line" id="dp-rule-top"></div><div class="dp-gr-gem" id="dp-gem-top"></div></div>',
          '<div id="dp-prev-text">',
            '<div id="dp-eye">Gustav Klimt · AI SaaS Control Tower</div>',
            '<div id="dp-ttl">AI 포털</div>',
            '<div id="dp-sub">황금빛 원클릭 서비스 컨트롤</div>',
          '</div>',
          '<div id="dp-gr-bot"><div class="dp-gr-line" id="dp-rule-bot-p"></div><div class="dp-gr-gem" id="dp-gem-bot"></div></div>',
        '</div>',
        '<div id="dp-ctrl">',
          '<button id="dp-prev-btn">◀</button>',
          '<div id="dp-info"><div id="dp-num"></div><div id="dp-name"></div><div id="dp-desc"></div></div>',
          '<button id="dp-next-btn">▶</button>',
          '<button id="dp-apply">✔ 이 디자인 적용</button>',
          '<button id="dp-close-btn">✕</button>',
        '</div>',
        '<div id="dp-sliders">',
          '<label>OPACITY <input type="range" id="dp-opacity" min="0" max="100" value="80"></label>',
          '<label>BRIGHT <input type="range" id="dp-bright" min="10" max="200" value="100"></label>',
          '<label>HEADER DIM <input type="range" id="dp-hdim" min="0" max="90" value="0"></label>',
          '<button id="dp-reset">↺ 초기화</button>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(root);
}

/* ──────────────────────────────────────
   PICKER 로직
────────────────────────────────────── */
var curIdx=1, animId=null, pickerAnimId=null;

function updatePickerPreview(n){
  var d=DS[n];
  // 번호 표시
  document.getElementById('dp-num').textContent='0'+n;
  document.getElementById('dp-name').textContent=d.nm;
  document.getElementById('dp-desc').textContent=d.de;

  // 룰/젬 색상
  var ruleEl=document.getElementById('dp-rule-top');
  var ruleBot=document.getElementById('dp-rule-bot-p');
  var gemTop=document.getElementById('dp-gem-top');
  var gemBot=document.getElementById('dp-gem-bot');
  var eyeEl=document.getElementById('dp-eye');
  var ttlEl=document.getElementById('dp-ttl');
  var subEl=document.getElementById('dp-sub');
  var wrap=document.getElementById('dp-prev-wrap');

  // 배경 오버레이 색
  wrap.style.background='url(klimt_tree.jpg) center 35%/cover';

  // 타이틀 스타일 리셋 후 적용
  var titleStyles={
    1: {color:'transparent',font:"Orbitron,monospace",weight:'300',stroke:'none',shadow:'none',grad:null,ls:'.4em'},
    2: {color:'transparent',font:"Orbitron,monospace",weight:'900',stroke:'2px #ff2d78',shadow:'0 0 8px #ff2d78,0 0 20px #ff2d78',grad:null,ls:'.3em'},
    3: {color:'#00ff66',font:"Orbitron,monospace",weight:'400',stroke:'none',shadow:'0 0 8px #00ff66,0 0 22px rgba(0,255,100,.8)',grad:null,ls:'.3em'},
    4: {color:'#e8c0ff',font:"Orbitron,monospace",weight:'300',stroke:'none',shadow:'0 0 10px rgba(180,80,255,1),0 0 25px rgba(160,60,255,.8)',grad:null,ls:'.35em'},
    5: {color:'transparent',font:'"Exo 2",sans-serif',weight:'100',stroke:'none',shadow:'none',grad:'linear-gradient(135deg,#cc80ff,#00ffd0 35%,#44aaff 65%,#ff88cc)',ls:'.45em'},
    6: {color:'transparent',font:"Orbitron,monospace",weight:'700',stroke:'none',shadow:'none',grad:'linear-gradient(120deg,#fff,#aaffff 20%,#fff 40%,#ffffaa 60%,#ffaaff 80%,#aaaaff)',ls:'.3em'},
    7: {color:'#f5e060',font:"Orbitron,monospace",weight:'300',stroke:'none',shadow:'0 0 10px rgba(245,210,60,1),0 0 28px rgba(240,180,30,.8)',grad:null,ls:'.35em'},
    8: {color:'#ffd700',font:"Orbitron,monospace",weight:'900',stroke:'none',shadow:'0 0 6px #ffbb00,0 0 18px rgba(255,180,0,.9),0 0 40px rgba(255,140,0,.6)',grad:null,ls:'.3em'},
    9: {color:'#a0d8ff',font:"Orbitron,monospace",weight:'300',stroke:'none',shadow:'0 0 8px rgba(100,180,255,1),0 0 22px rgba(80,160,255,.8)',grad:null,ls:'.4em'},
    10:{color:'#ff9900',font:"Orbitron,monospace",weight:'700',stroke:'none',shadow:'0 0 8px #ff9900,0 0 22px rgba(255,140,0,.9)',grad:null,ls:'.3em'},
    11:{color:'#00f0ff',font:"Orbitron,monospace",weight:'300',stroke:'none',shadow:'0 0 8px #00d8ff,0 0 22px rgba(0,200,255,.8)',grad:null,ls:'.4em'},
    12:{color:'#e0f8ff',font:"Orbitron,monospace",weight:'700',stroke:'none',shadow:'0 0 6px #aaeeff,0 0 18px rgba(180,240,255,.7)',grad:null,ls:'.35em'},
    13:{color:'#00ffcc',font:'"Exo 2",sans-serif',weight:'200',stroke:'none',shadow:'0 0 8px #00ffaa,0 0 22px rgba(0,240,160,.8)',grad:null,ls:'.5em'},
    14:{color:'#ff6600',font:"Orbitron,monospace",weight:'700',stroke:'none',shadow:'0 0 8px #ff4400,0 0 22px rgba(255,80,0,.9)',grad:null,ls:'.3em'},
    15:{color:'#fff',font:"Orbitron,monospace",weight:'900',stroke:'none',shadow:'0 0 4px #fff,0 0 12px rgba(200,220,255,1),0 0 30px rgba(150,180,255,.8)',grad:null,ls:'.3em'},
    16:{color:'#22ff88',font:"Orbitron,monospace",weight:'300',stroke:'none',shadow:'0 0 6px #00ee66,0 0 18px rgba(0,230,100,.8)',grad:null,ls:'.4em'},
    17:{color:'transparent',font:'"Exo 2",sans-serif',weight:'200',stroke:'none',shadow:'none',grad:'linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff)',ls:'.45em'},
    18:{color:'#cc99ff',font:"Orbitron,monospace",weight:'300',stroke:'none',shadow:'0 0 8px rgba(180,120,255,1),0 0 22px rgba(160,90,255,.8)',grad:null,ls:'.4em'},
    19:{color:'rgba(220,215,255,.9)',font:'"Exo 2",sans-serif',weight:'100',stroke:'none',shadow:'0 0 30px rgba(180,160,255,.4)',grad:null,ls:'.55em'},
    20:{color:'#6688ff',font:"Orbitron,monospace",weight:'700',stroke:'none',shadow:'0 0 8px rgba(80,100,255,1),0 0 22px rgba(60,80,255,.9)',grad:null,ls:'.35em'},
    21:{color:'transparent',font:"Georgia,serif",weight:'400',stroke:'none',shadow:'none',grad:'linear-gradient(135deg,#fde68a,#f4ab20 20%,#fbbf24 45%,#f9f02c 60%,#d97706 80%,#fde68a)',ls:'5px'}
  };
  var ruleColors={1:'rgba(0,210,255,.6)',2:'rgba(255,45,120,.7)',3:'rgba(0,255,90,.6)',4:'rgba(180,80,255,.65)',5:'rgba(120,200,255,.45)',6:'rgba(200,230,255,.5)',7:'rgba(240,200,50,.55)',8:'rgba(255,180,0,.65)',9:'rgba(80,160,255,.55)',10:'rgba(255,140,0,.65)',11:'rgba(0,200,255,.55)',12:'rgba(160,230,255,.5)',13:'rgba(0,220,150,.55)',14:'rgba(255,80,0,.65)',15:'rgba(180,200,255,.55)',16:'rgba(0,220,100,.55)',17:'rgba(120,80,255,.45)',18:'rgba(160,100,255,.55)',19:'rgba(180,160,255,.35)',20:'rgba(80,120,255,.55)',21:'rgba(244,171,32,.7)'};
  var gemColors={1:'#00d8ff',2:'#ff2d78',3:'#00ff66',4:'#c050ff',5:'linear-gradient(135deg,#cc80ff,#00ffd0)',6:'linear-gradient(135deg,#fff,#cff)',7:'#f5e060',8:'#ffd700',9:'#60aaff',10:'#ff9900',11:'#00e8ff',12:'#c0f0ff',13:'#00ffcc',14:'#ff4400',15:'#e0eaff',16:'#22ff88',17:'linear-gradient(135deg,#ff6b6b,#c77dff)',18:'#c080ff',19:'rgba(200,180,255,.6)',20:'#5577ff',21:'linear-gradient(135deg,#fde68a,#d97706)'};
  var eyeColors={1:'rgba(0,200,255,.45)',2:'rgba(255,45,120,.45)',3:'rgba(0,200,80,.45)',4:'rgba(180,80,255,.45)',5:'rgba(150,200,255,.45)',6:'rgba(200,220,255,.4)',7:'rgba(240,200,50,.4)',8:'rgba(255,180,0,.45)',9:'rgba(100,170,255,.42)',10:'rgba(255,140,0,.42)',11:'rgba(0,200,255,.42)',12:'rgba(160,230,255,.42)',13:'rgba(0,220,150,.42)',14:'rgba(255,100,0,.42)',15:'rgba(180,200,255,.42)',16:'rgba(0,220,100,.42)',17:'rgba(150,120,255,.42)',18:'rgba(180,120,255,.42)',19:'rgba(180,160,255,.38)',20:'rgba(100,130,255,.42)',21:'rgba(218,165,32,.55)'};

  var ts=titleStyles[n];
  ttlEl.style.cssText='position:relative;z-index:5;font-family:'+ts.font+';font-weight:'+ts.weight+';letter-spacing:'+ts.ls+';font-size:clamp(22px,3vw,40px)';
  if(ts.grad){ttlEl.style.background=ts.grad;ttlEl.style.webkitBackgroundClip='text';ttlEl.style.webkitTextFillColor='transparent';ttlEl.style.textShadow='none'}
  else{ttlEl.style.background='none';ttlEl.style.webkitBackgroundClip='';ttlEl.style.webkitTextFillColor=ts.color;ttlEl.style.color=ts.color;ttlEl.style.textShadow=ts.shadow}
  if(ts.stroke&&ts.stroke!=='none'){ttlEl.style.webkitTextStroke=ts.stroke}else{ttlEl.style.webkitTextStroke='none'}

  var rc=ruleColors[n];
  [ruleEl,ruleBot].forEach(function(el){el.style.cssText='height:1px;width:100%;background:linear-gradient(90deg,transparent,'+rc+' 20%,'+rc+' 80%,transparent)'});
  var gc=gemColors[n];
  [gemTop,gemBot].forEach(function(el){el.style.cssText='position:absolute;top:-3.5px;left:50%;transform:translateX(-50%) rotate(45deg);width:7px;height:7px;background:'+gc});
  eyeEl.style.cssText='position:relative;z-index:5;font-size:8px;letter-spacing:4px;font-family:monospace;margin-bottom:4px;text-transform:uppercase;color:'+eyeColors[n];
  subEl.style.cssText='position:relative;z-index:5;font-size:8px;letter-spacing:3px;font-family:monospace;margin-top:4px;color:'+eyeColors[n];

  // dim 오버레이 (클림트 배경 위, canvas 아래 — z-index:0)
  var prevDim=document.getElementById('dp-prev-dim');
  if(!prevDim){prevDim=document.createElement('div');prevDim.id='dp-prev-dim';prevDim.style.cssText='position:absolute;inset:0;z-index:0;pointer-events:none';wrap.insertBefore(prevDim,wrap.firstChild)}
  var dimV=parseFloat(localStorage.getItem('portal-hdim')||'0');
  prevDim.style.background='rgba(0,0,0,'+dimV+')';
  // BRIGHT → 미리보기 전체 밝기
  var brPrev=parseFloat(localStorage.getItem('portal-br')||'1.0');
  wrap.style.filter='brightness('+brPrev+')';

  // 배경 오버레이 — 클림트 배경 노출을 위해 transparent 고정
  var bgCover=document.getElementById('dp-bg-cover');
  if(!bgCover){bgCover=document.createElement('div');bgCover.id='dp-bg-cover';bgCover.style.cssText='position:absolute;inset:0;z-index:1';wrap.insertBefore(bgCover,wrap.firstChild)}
  bgCover.style.background='transparent';

  // 기존 canvas 제거 → 이전 RAF 루프 무력화
  var oldCv=document.getElementById('dp-cv');
  if(oldCv)oldCv.remove();
  var cv=document.createElement('canvas');
  cv.id='dp-cv';
  cv.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:lighten;z-index:2';
  wrap.appendChild(cv);
  cv.width=wrap.offsetWidth||860;
  cv.height=168;
  if(n!==21)FN[n](cv);
}

function openPicker(){
  document.getElementById('dp-modal').classList.add('open');
  updatePickerPreview(curIdx);
}
function closePicker(){
  document.getElementById('dp-modal').classList.remove('open');
}

/* ──────────────────────────────────────
   실제 포털 헤더에 적용
────────────────────────────────────── */
function applyDesign(n){
  var hdr=document.querySelector('header');
  if(!hdr)return;

  // 기존 canvas 제거 → 이전 RAF 루프 무력화
  var oldHost=document.getElementById('dp-hdr-cv-host');
  if(oldHost)oldHost.remove();
  hdr.style.position='relative';

  // 헤더에 클림트 배경 직접 설정 → mix-blend-mode:screen이 같은 stacking context에서 작동
  if(n===21){
    hdr.style.backgroundImage='';
    hdr.style.backgroundSize='';
    hdr.style.backgroundPosition='';
    hdr.style.backgroundAttachment='';
    hdr.style.webkitMaskImage='';
    hdr.style.webkitMaskComposite='';
    hdr.style.maskImage='';
    hdr.style.maskComposite='';
  }else{
    hdr.style.backgroundImage='url(klimt_tree.jpg)';
    hdr.style.backgroundSize='cover';
    hdr.style.backgroundPosition='center 35%';
    hdr.style.backgroundAttachment='fixed';
    // 헤더 박스 경계선 제거 — 상하좌우 가장자리 투명 페이드
    var msk=[
      'linear-gradient(to right,transparent 0%,black 4%,black 96%,transparent 100%)',
      'linear-gradient(to bottom,transparent 0%,black 10%,black 80%,transparent 100%)'
    ].join(',');
    hdr.style.webkitMaskImage=msk;
    hdr.style.webkitMaskComposite='destination-in';
    hdr.style.maskImage=msk;
    hdr.style.maskComposite='intersect';
  }

  var host=document.createElement('canvas');
  host.id='dp-hdr-cv-host';
  host.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;mix-blend-mode:lighten';
  hdr.insertBefore(host,hdr.firstChild);

  // 캔버스 크기 설정
  host.width=hdr.offsetWidth||1200;
  host.height=hdr.offsetHeight||200;

  // 배경 dim 오버레이 (canvas 아래, z-index:-1)
  var bgHost=document.getElementById('dp-hdr-bg');
  if(!bgHost){bgHost=document.createElement('div');bgHost.id='dp-hdr-bg';bgHost.style.cssText='position:absolute;inset:0;z-index:-1;pointer-events:none';hdr.insertBefore(bgHost,hdr.firstChild)}
  var dimV=parseFloat(localStorage.getItem('portal-hdim')||'0');
  bgHost.style.background='rgba(0,0,0,'+dimV+')';
  // BRIGHT → 헤더 전체 밝기 (배경 + 이펙트 모두). OPACITY와 완전히 다른 효과.
  var brV=parseFloat(localStorage.getItem('portal-br')||'1.0');
  hdr.style.filter='brightness('+brV+')';

  // CSS override 인젝션
  var ovStyle=document.getElementById('dp-override');
  if(!ovStyle){ovStyle=document.createElement('style');ovStyle.id='dp-override';document.head.appendChild(ovStyle)}
  ovStyle.textContent=DS[n].css;

  // OPACITY → 이펙트(canvas) 투명도만 조절
  var op=parseFloat(localStorage.getItem('portal-op')||'0.8');
  host.style.opacity=op;

  // 애니메이션 실행 (21번은 CSS only)
  if(n!==21)FN[n](host);

  // 저장
  localStorage.setItem('portal-design',n);
  curIdx=n;
  closePicker();
}

function resetDesign(){
  var hdr=document.querySelector('header');
  if(hdr){
    var old=document.getElementById('dp-hdr-cv-host');
    if(old)old.remove();
    hdr.style.backgroundImage='';
    hdr.style.backgroundSize='';
    hdr.style.backgroundPosition='';
    hdr.style.backgroundAttachment='';
    hdr.style.webkitMaskImage='';
    hdr.style.webkitMaskComposite='';
    hdr.style.maskImage='';
    hdr.style.maskComposite='';
  }
  var ov=document.getElementById('dp-override');
  if(ov)ov.textContent='';
  localStorage.removeItem('portal-design');
  localStorage.removeItem('portal-op');
  localStorage.removeItem('portal-br');
  localStorage.removeItem('portal-hdim');
  // 슬라이더 기본값 복원
  var opEl=document.getElementById('dp-opacity');
  var brEl=document.getElementById('dp-bright');
  var hdimEl=document.getElementById('dp-hdim');
  if(opEl)opEl.value=80;
  if(brEl)brEl.value=100;
  if(hdimEl)hdimEl.value=0;
  // dim 오버레이 + 헤더 필터 초기화
  var bg=document.getElementById('dp-hdr-bg');
  if(bg)bg.style.background='rgba(0,0,0,0)';
  var hdrR=document.querySelector('header');
  if(hdrR)hdrR.style.filter='';
}

/* ──────────────────────────────────────
   초기화
────────────────────────────────────── */
function init(){
  buildUI();

  // 이벤트 바인딩
  document.getElementById('dp-btn').addEventListener('click',openPicker);
  document.getElementById('dp-close-btn').addEventListener('click',closePicker);
  document.getElementById('dp-modal').addEventListener('click',function(e){if(e.target===this)closePicker()});
  document.getElementById('dp-prev-btn').addEventListener('click',function(){curIdx=curIdx<=1?21:curIdx-1;updatePickerPreview(curIdx)});
  document.getElementById('dp-next-btn').addEventListener('click',function(){curIdx=curIdx>=21?1:curIdx+1;updatePickerPreview(curIdx)});
  document.getElementById('dp-apply').addEventListener('click',function(){applyDesign(curIdx)});
  document.getElementById('dp-reset').addEventListener('click',resetDesign);

  // 슬라이더 — 실시간 canvas 반영 + localStorage 저장
  document.getElementById('dp-opacity').addEventListener('input',function(){
    var v=this.value/100;
    localStorage.setItem('portal-op',v);
    // 실제 헤더 + 미리보기 동시 반영
    var hdrCv=document.getElementById('dp-hdr-cv-host');
    if(hdrCv)hdrCv.style.opacity=v;
    var prevCv=document.getElementById('dp-cv');
    if(prevCv)prevCv.style.opacity=v;
  });
  document.getElementById('dp-bright').addEventListener('input',function(){
    var v=this.value/100;
    localStorage.setItem('portal-br',v);
    // 실제 헤더 전체 밝기 + 미리보기 wrap 밝기 동시 반영
    var hdrEl=document.querySelector('header');
    if(hdrEl)hdrEl.style.filter='brightness('+v+')';
    var wrapEl=document.getElementById('dp-prev-wrap');
    if(wrapEl)wrapEl.style.filter='brightness('+v+')';
  });
  document.getElementById('dp-hdim').addEventListener('input',function(){
    var v=this.value/100;
    localStorage.setItem('portal-hdim',v);
    // 실제 헤더 dim + 미리보기 dim 동시 반영
    var bg=document.getElementById('dp-hdr-bg');
    if(bg)bg.style.background='rgba(0,0,0,'+v+')';
    var prevDim=document.getElementById('dp-prev-dim');
    if(prevDim)prevDim.style.background='rgba(0,0,0,'+v+')';
  });

  // 저장된 슬라이더 값 복원
  var savedOp=localStorage.getItem('portal-op');
  var savedBr=localStorage.getItem('portal-br');
  var savedHdim=localStorage.getItem('portal-hdim');
  if(savedOp)document.getElementById('dp-opacity').value=Math.round(parseFloat(savedOp)*100);
  if(savedBr){
    document.getElementById('dp-bright').value=Math.round(parseFloat(savedBr)*100);
    var hdr3=document.querySelector('header');
    if(hdr3)hdr3.style.filter='brightness('+savedBr+')';
  }
  if(savedHdim){
    document.getElementById('dp-hdim').value=Math.round(parseFloat(savedHdim)*100);
    var prevDim=document.getElementById('dp-prev-dim');
    if(prevDim)prevDim.style.background='rgba(0,0,0,'+savedHdim+')';
  }

  // 저장된 디자인 불러오기
  var saved=parseInt(localStorage.getItem('portal-design')||'0',10);
  if(saved>=1&&saved<=21){
    curIdx=saved;
    setTimeout(function(){applyDesign(saved)},300);
  }

  // 폴드 전환(접힘↔펼침) 감지 → canvas 크기 재조정
  var _resizeTimer=null;
  window.addEventListener('resize',function(){
    clearTimeout(_resizeTimer);
    _resizeTimer=setTimeout(function(){
      var hdrCv=document.getElementById('dp-hdr-cv-host');
      var hdr=document.querySelector('header');
      if(hdrCv&&hdr){
        hdrCv.width=hdr.offsetWidth||window.innerWidth;
        hdrCv.height=hdr.offsetHeight||120;
      }
    },200);
  });
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{setTimeout(init,100)}

})();
