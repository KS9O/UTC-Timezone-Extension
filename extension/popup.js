document.addEventListener("DOMContentLoaded",function(){
var timezoneAliases={
"PST":"America/Los_Angeles","PDT":"America/Los_Angeles",
"MST":"America/Denver","MDT":"America/Denver",
"CST":"America/Chicago","CDT":"America/Chicago",
"EST":"America/New_York","EDT":"America/New_York",
"GMT":"Etc/UTC","UTC":"Etc/UTC","JST":"Asia/Tokyo"
}
var defaultTimezones=[
"America/Adak","America/Anchorage","America/Boise","America/Chicago","America/Denver",
"America/Detroit","America/Indiana/Indianapolis","America/Indiana/Knox","America/Indiana/Marengo",
"America/Indiana/Petersburg","America/Indiana/Tell_City","America/Indiana/Vevay","America/Indiana/Vincennes",
"America/Indiana/Winamac","America/Juneau","America/Kentucky/Louisville","America/Kentucky/Monticello",
"America/Los_Angeles","America/Menominee","America/Metlakatla","America/New_York","America/Nome",
"America/North_Dakota/Beulah","America/North_Dakota/Center","America/North_Dakota/New_Salem",
"America/Phoenix","America/Sitka","America/Yakutat","America/Toronto","America/Vancouver",
"America/Winnipeg","America/Halifax","America/Regina","America/Edmonton","America/Calgary",
"America/Mexico_City","America/Cancun","America/Chihuahua","America/Hermosillo","America/Mazatlan",
"America/Monterrey","America/Tijuana","America/Bogota","America/Lima","America/Santiago",
"America/La_Paz","America/Caracas","America/Sao_Paulo","America/Buenos_Aires","America/Montevideo",
"Africa/Cairo","Africa/Casablanca","Africa/Johannesburg","Africa/Lagos","Africa/Nairobi",
"Asia/Baghdad","Asia/Bangkok","Asia/Dhaka","Asia/Dubai","Asia/Ho_Chi_Minh","Asia/Hong_Kong",
"Asia/Jakarta","Asia/Jerusalem","Asia/Karachi","Asia/Kolkata","Asia/Kuala_Lumpur","Asia/Manila",
"Asia/Riyadh","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Taipei","Asia/Tehran",
"Asia/Tokyo","Atlantic/Reykjavik","Australia/Adelaide","Australia/Brisbane","Australia/Melbourne",
"Australia/Perth","Australia/Sydney","Europe/Amsterdam","Europe/Athens","Europe/Belgrade",
"Europe/Berlin","Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Copenhagen",
"Europe/Dublin","Europe/Helsinki","Europe/Istanbul","Europe/Kiev","Europe/Lisbon","Europe/London",
"Europe/Madrid","Europe/Moscow","Europe/Oslo","Europe/Paris","Europe/Prague","Europe/Rome",
"Europe/Stockholm","Europe/Vienna","Europe/Warsaw","Europe/Zurich","Pacific/Auckland",
"Pacific/Fiji","Pacific/Guam","Pacific/Honolulu","Pacific/Samoa","UTC"
]
var timezones
try{
timezones=Intl.supportedValuesOf("timeZone")
}catch(e){
timezones=defaultTimezones
}
var selectedTimezone=Intl.DateTimeFormat().resolvedOptions().timeZone||"America/New_York"
var panelVisible=true

var search=document.getElementById("timezoneSearch")
var list=document.getElementById("timezoneList")
var datetimePopup=document.getElementById("datetimePopup")
var panelToggle=document.getElementById("panelToggle")

function formatTzName(tz){
return tz.replace(/_/g," ")
}

function renderList(filter){
list.style.display="block"
if(!filter){
list.innerHTML=""
timezones.slice(0,15).forEach(function(tz){
var div=document.createElement("div")
div.className="option"
div.textContent=formatTzName(tz)
div.style.cssText="padding:6px 8px;cursor:pointer;font-size:12px;border-bottom:1px solid #334155"
div.addEventListener("click",function(){
selectedTimezone=tz
search.value=formatTzName(tz)
list.style.display="none"
try{chrome.storage.sync.set({selectedTimezone:tz})}catch(e){}
})
list.appendChild(div)
})
return
}
list.innerHTML=""
var results=[]
var upper=filter.toUpperCase()
if(timezoneAliases[upper])results.push(timezoneAliases[upper])
results=results.concat(timezones.filter(function(tz){return tz.toLowerCase().includes(filter.toLowerCase())}))
results=results.slice(0,15)
results.forEach(function(tz){
var div=document.createElement("div")
div.className="option"
div.textContent=formatTzName(tz)
div.style.cssText="padding:6px 8px;cursor:pointer;font-size:12px;border-bottom:1px solid #334155"
div.addEventListener("click",function(){
selectedTimezone=tz
search.value=formatTzName(tz)
list.style.display="none"
try{chrome.storage.sync.set({selectedTimezone:tz})}catch(e){}
})
list.appendChild(div)
})
}

search.addEventListener("input",function(e){renderList(e.target.value)})
search.addEventListener("focus",function(e){renderList(e.target.value)})
search.addEventListener("blur",function(){setTimeout(function(){list.style.display="none"},200)})

document.getElementById("datetimeIcon").addEventListener("click",function(e){
e.stopPropagation()
datetimePopup.classList.toggle("show")
datetimePopup.style.left="10px"
datetimePopup.style.top="80px"
})
document.addEventListener("click",function(e){
if(!datetimePopup.contains(e.target)&&e.target.id!=="datetimeIcon"){
datetimePopup.classList.remove("show")
}
})

function formatTime(date,tz){
return new Intl.DateTimeFormat("en-US",{
hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:tz
}).format(date)
}

function parseCustomDateTime(input){
var patterns=[
/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i,
/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})/i,
/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i
]
for(var i=0;i<patterns.length;i++){
var m=input.match(patterns[i])
if(m){
if(i===0){
var d=new Date(m[3],m[1]-1,m[2],parseInt(m[4])+(m[7]&&m[7].toLowerCase()==="pm"&&parseInt(m[4])!==12?12:0),m[5],m[6]||0)
return isNaN(d)?null:d
}else if(i===1){
var d=new Date(m[1],m[2]-1,m[3],m[4],m[5],m[6]||0)
return isNaN(d)?null:d
}else if(i===2){
var d=new Date(m[3],new Date(m[1]+" 1").getMonth(),m[2],m[4],m[5])
return isNaN(d)?null:d
}else if(i===3){
var now=new Date()
var h=m[1],min=m[2],s=m[3]||0
var mer=m[4]&&m[4].toLowerCase()
var hour=parseInt(h)
if(mer==="pm"&&hour!==12)hour+=12
if(mer==="am"&&hour===12)hour=0
return new Date(now.getFullYear(),now.getMonth(),now.getDate(),hour,min,s)
}
}
}
return null
}

function convertToUTC(){
var time=document.getElementById("localTime").value
if(!time){
document.getElementById("output").textContent="Enter a time"
document.getElementById("output").style.color="#f87171"
return
}
var parts=time.split(":")
var now=new Date()
var offset=-now.getTimezoneOffset()
var localMs=new Date(now.getFullYear(),now.getMonth(),now.getDate(),parseInt(parts[0]),parseInt(parts[1])).getTime()
var utcMs=localMs-(offset*60000)
var utcDate=new Date(utcMs)
var utcStr=formatTime(utcDate,"UTC")
showResult(utcStr)
}

function convertFromPopup(){
var date=document.getElementById("manualDate").value
var time=document.getElementById("manualTime").value
if(!date&&!time){
document.getElementById("output").textContent="Enter date or time"
document.getElementById("output").style.color="#f87171"
return
}
var now=new Date()
var offset=-now.getTimezoneOffset()
var d
if(date&&time){
d=new Date(date+"T"+time)
}else if(date){
d=new Date(date+"T00:00:00")
}else if(time){
var parts=time.split(":")
d=new Date(now.getFullYear(),now.getMonth(),now.getDate(),parseInt(parts[0]),parseInt(parts[1]))
}
if(d&&!isNaN(d)){
var utcMs=d.getTime()-offset*60000
var utcDate=new Date(utcMs)
var utcStr=formatTime(utcDate,"UTC")
showResult(utcStr)
datetimePopup.classList.remove("show")
}else{
document.getElementById("output").textContent="Invalid input"
document.getElementById("output").style.color="#f87171"
}
}

function convertCustom(){
var input=document.getElementById("customInput").value.trim()
if(!input){
document.getElementById("output").textContent="Enter a date/time"
document.getElementById("output").style.color="#f87171"
return
}
var now=new Date()
var offset=-now.getTimezoneOffset()
var d=parseCustomDateTime(input)
if(d&&!isNaN(d)){
var utcMs=d.getTime()-offset*60000
var utcDate=new Date(utcMs)
var utcStr=formatTime(utcDate,"UTC")
showResult(utcStr)
}else{
document.getElementById("output").textContent="Could not parse"
document.getElementById("output").style.color="#f87171"
}
}

function showResult(utcStr){
document.getElementById("output").textContent=utcStr
document.getElementById("output").style.color="#38bdf8"
navigator.clipboard.writeText(utcStr)
setTimeout(function(){document.getElementById("output").textContent="Copied!"
document.getElementById("output").style.color="#4ade80"},500)
}

document.getElementById("convertBtn").addEventListener("click",convertToUTC)
document.getElementById("convertFromPopup").addEventListener("click",convertFromPopup)
document.getElementById("convertCustomBtn").addEventListener("click",convertCustom)

panelToggle.addEventListener("click",function(){
panelVisible=!panelVisible
panelToggle.classList.toggle("on",panelVisible)
try{
chrome.storage.sync.set({panelVisible:panelVisible})
chrome.tabs.query({active:true,currentWindow:true},function(tabs){
if(tabs[0]){
chrome.tabs.sendMessage(tabs[0].id,{type:panelVisible?"showUtcPanel":"hideUtcPanel"},function(){})
}
})
}catch(e){}
})

try{
chrome.storage.sync.get(["selectedTimezone","panelVisible"],function(r){
if(r.selectedTimezone){
try{
new Intl.DateTimeFormat("en-US",{timeZone:r.selectedTimezone})
selectedTimezone=r.selectedTimezone
search.value=formatTzName(selectedTimezone)
}catch(e){selectedTimezone=Intl.DateTimeFormat().resolvedOptions().timeZone||"America/New_York"}
}else{
selectedTimezone=Intl.DateTimeFormat().resolvedOptions().timeZone||"America/New_York"
}
if(r.panelVisible!==undefined)panelVisible=r.panelVisible
panelToggle.classList.toggle("on",panelVisible)
chrome.tabs.query({active:true,currentWindow:true},function(tabs){
if(tabs[0]){
chrome.tabs.sendMessage(tabs[0].id,{type:panelVisible?"showUtcPanel":"hideUtcPanel"},function(){})
}
})
})
}catch(e){
}
})
