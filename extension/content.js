(function(){
const style=document.createElement("style")
style.textContent=`
#utc-converter-panel{
position:fixed;bottom:16px;right:16px;background:rgba(15,23,42,0.98);color:white;
padding:12px 16px;border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.05);
z-index:999999;min-width:150px;backdrop-filter:blur(12px);line-height:1.4;
}
#utc-converter-panel .header{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:500}
#utc-converter-panel .time-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;gap:16px}
#utc-converter-panel .time-val{color:#38bdf8;font-size:18px;font-weight:600;font-variant-numeric:tabular-numeric;letter-spacing:-0.5px}
#utc-converter-panel .tz-label{font-size:9px;color:#64748b;font-weight:500}
#utc-converter-panel .tz-val{font-size:10px;color:#94a3b8;margin-top:2px;text-align:center;font-weight:500}
#utc-converter-panel .close{position:absolute;top:8px;right:10px;cursor:pointer;color:#475569;font-size:16px;line-height:1;opacity:0.6;transition:opacity 0.2s}
#utc-converter-panel .close:hover{opacity:1;color:#fff}
.utc-hover-panel{
position:fixed;background:rgba(15,23,42,0.95);color:white;padding:10px 14px;
border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(56,189,248,0.3);
z-index:9999999;display:none;backdrop-filter:blur(12px);min-width:120px;text-align:center;
}
.utc-hover-panel .utc-label{color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px}
.utc-hover-panel .utc-time{color:#38bdf8;font-weight:700;font-size:18px;letter-spacing:-0.5px}
.utc-hover-panel .copy-hint{color:#22c55e;font-size:10px;display:block;margin-top:6px;font-weight:500}
`
document.head.appendChild(style)

const localTz=Intl.DateTimeFormat().resolvedOptions().timeZone||"America/New_York"

const panel=document.createElement("div")
panel.id="utc-converter-panel"
panel.innerHTML=`
<div class="close" id="utcPanelClose">×</div>
<div class="header">Current Time</div>
<div class="time-row">
  <span class="tz-label">UTC</span>
  <span class="time-val" id="utcTimeDisplay">--:--</span>
</div>
<div class="time-row">
  <span class="tz-label" id="localTzLabel">Local</span>
  <span class="time-val" id="localTimeDisplay">--:--</span>
</div>
<div class="tz-val" id="tzDisplay"></div>
`
document.body.appendChild(panel)

const hoverPanel=document.createElement("div")
hoverPanel.className="utc-hover-panel"
hoverPanel.innerHTML=`<span class="utc-label">UTC</span><span class="utc-time"></span><span class="copy-hint">Click to copy</span>`
document.body.appendChild(hoverPanel)

let currentUTC=null
let hoverX=0,hoverY=0

function formatTime(date,tz){
return new Intl.DateTimeFormat("en-US",{
hour:"numeric",minute:"2-digit",second:"2-digit",hour12:true,
timeZone:tz
}).format(date)
}

function formatTzName(tz){
return tz.replace(/_/g," ")
}

function parseTimeInText(text){
const match=text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i)
if(match){
let h=parseInt(match[1]), min=parseInt(match[2]), s=match[3]?parseInt(match[3]):0
const mer=match[4]?match[4].toLowerCase():null
if(mer){
if(mer==="pm"&&h!==12)h+=12
if(mer==="am"&&h===12)h=0
return{h,min,sec:s,original:match[0],mer:mer}
}
return{h,min,sec:s,original:match[0],mer:null}
}
return null
}

function findTimezoneInText(text){
const upper=text.toUpperCase()
if(upper.includes("EDT")||upper.includes("EST "))return"ET"
if(upper.includes("CDT")||upper.includes("CST "))return"CT"
if(upper.includes("MDT")||upper.includes("MST "))return"MT"
if(upper.includes("PDT")||upper.includes("PST "))return"PT"
if(upper.includes("UTC")||upper.includes("GMT"))return"UTC"
return null
}

function showHoverPanel(x,y,utc){
currentUTC=utc
hoverX=x
hoverY=y
hoverPanel.querySelector(".utc-time").textContent=utc
hoverPanel.style.left=(x+15)+"px"
hoverPanel.style.top=(y+15)+"px"
hoverPanel.style.display="block"
}

function hideHoverPanel(){
hoverPanel.style.display="none"
currentUTC=null
}

hoverPanel.addEventListener("click",function(e){
e.stopPropagation()
if(currentUTC){
navigator.clipboard.writeText(currentUTC)
hoverPanel.querySelector(".utc-time").textContent="Copied!"
hoverPanel.querySelector(".copy-hint").textContent=""
setTimeout(function(){
hoverPanel.querySelector(".utc-time").textContent=currentUTC||""
hoverPanel.querySelector(".copy-hint").textContent="Click to copy"
},1500)
}
})

hoverPanel.addEventListener("mouseenter",function(){
hoverPanel.style.display="block"
})

hoverPanel.addEventListener("mouseleave",function(){
hideHoverPanel()
})

let lastTimeEl=null

document.addEventListener("mouseover",function(e){
if(e.target===hoverPanel||hoverPanel.contains(e.target))return

if(lastTimeEl&&(e.target===lastTimeEl||lastTimeEl.contains(e.target))){
return
}
lastTimeEl=null

if(e.target.tagName==="TIME"){
const dt=e.target.getAttribute("datetime")
if(dt){
const d=new Date(dt)
if(!isNaN(d)){
lastTimeEl=e.target
showHoverPanel(hoverX,hoverY,formatTime(d,"UTC"))
return
}
}
}

const txt=e.target.textContent||e.target.innerText||""
if(txt&&txt.length>5&&txt.length<80){
const timeData=parseTimeInText(txt)
if(timeData&&timeData.h>=0&&timeData.h<=23){
const tzFound=findTimezoneInText(txt)
let utcStr
if(tzFound){
const offsets={ET:-4,CT:-5,MT:-6,PT:-7,UTC:0}
const offset=offsets[tzFound]||0
let hour=timeData.h-offset
if(hour<0)hour+=24
if(hour>=24)hour-=24
const ampm=hour>=12?"PM":"AM"
const hour12=hour%12
utcStr=(hour12===0?12:hour12)+":"+timeData.min.toString().padStart(2,"0")+" "+ampm
}else{
const now=new Date()
const offset=-now.getTimezoneOffset()/60
let hour=timeData.h-offset
if(hour<0)hour+=24
if(hour>=24)hour-=24
const ampm=hour>=12?"PM":"AM"
const hour12=Math.floor(hour)%12
utcStr=(hour12===0?12:hour12)+":"+timeData.min.toString().padStart(2,"0")+" "+ampm
}
lastTimeEl=e.target
showHoverPanel(hoverX,hoverY,utcStr)
}
}
},true)

document.addEventListener("mousemove",function(e){
hoverX=e.pageX
hoverY=e.pageY
},true)

document.addEventListener("mouseout",function(e){
if(e.target===hoverPanel||hoverPanel.contains(e.target))return
if(lastTimeEl&&(e.target===lastTimeEl||lastTimeEl.contains(e.target))){
if(!hoverPanel.matches(":hover")){
setTimeout(function(){
if(!hoverPanel.matches(":hover")){
hideHoverPanel()
lastTimeEl=null
}
},300)
}
}
},true)

let storageReady=true

function update(){
const now=new Date()
const utcStr=formatTime(now,"UTC")
const localStr=formatTime(now,localTz)
document.getElementById("utcTimeDisplay").textContent=utcStr
document.getElementById("localTimeDisplay").textContent=localStr
document.getElementById("localTzLabel").textContent=formatTzName(localTz).split("/").pop()
document.getElementById("tzDisplay").textContent=formatTzName(localTz)

if(storageReady){
try{
chrome.storage.sync.get(["selectedTimezone","panelVisible"],function(r){
if(chrome.runtime&&chrome.runtime.lastError){
storageReady=false
return
}
try{
if(r.selectedTimezone){
document.getElementById("tzDisplay").textContent=formatTzName(r.selectedTimezone)
}
if(r.panelVisible===false){
panel.style.display="none"
}else{
panel.style.display="block"
}
}catch(e){storageReady=false}
})
}catch(e){
storageReady=false
}
}
}

update()
setInterval(update,1000)

document.getElementById("utcPanelClose").addEventListener("click",function(){
panel.style.display="none"
try{
chrome.storage.sync.set({panelVisible:false})
}catch(e){storageReady=false}
})

try{
chrome.runtime.onMessage.addListener(function(msg){
if(!chrome.runtime)return
if(msg.type==="showUtcPanel"){
panel.style.display="block"
try{chrome.storage.sync.set({panelVisible:true})}catch(e){storageReady=false}
}else if(msg.type==="hideUtcPanel"){
panel.style.display="none"
try{chrome.storage.sync.set({panelVisible:false})}catch(e){storageReady=false}
}
})
}catch(e){}
})()
