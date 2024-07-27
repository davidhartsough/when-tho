function isValidVoteNumber(e){return!Number.isNaN(e)&&Number.isSafeInteger(e)&&e>=0&&e<=3}function redirectOut(){window.location.replace(`${window.location.origin}/cities/`)}const eventId=new URL(window.location.href).searchParams.get("event");if(console.log(eventId),!eventId||eventId.length<4)throw console.warn("Invalid event id:",eventId),redirectOut(),new Error("Invalid event id");const getEl=e=>document.getElementById(e);function getDays(e,n){const t=[];return e.forEach(o=>{const a=new Date(o),r={hourName:a.toLocaleTimeString(void 0,{hour:"numeric"}).toLowerCase(),voters:[[],[],[],[]]};n.forEach(i=>{const l=Number(i.votes[o]),{name:u}=i;isValidVoteNumber(l)&&typeof u=="string"&&r.voters[l].push(u)}),(r.hourName.endsWith(" am")||r.hourName.endsWith(" pm"))&&(r.hourName=r.hourName.replace(" ",""));const s=a.getDay(),c=t.findIndex(({weekdayNum:i})=>i===s);if(c>=0)t[c].times.push(r);else{const i=a.toLocaleDateString(void 0,{weekday:"long"});t.push({weekdayNum:s,weekdayName:i,times:[r]})}}),t.sort((o,a)=>o.weekdayNum-a.weekdayNum),t}const emojis=["\u{1F7E5}","\u{1F7E8}","\u{1F7E9}","\u{1F7E6}"],voteLabels=["Busy","Maybe","Free","Prefer"];function renderVoters(e,n){return`
    <p>
      <span class="emoji">${emojis[n]} </span>
      <span><strong>${voteLabels[n]}</strong>: </span>
      <span class="names">${e.join(", ")}</span>
    </p>
  `}function renderHour(e,n){return`
    <div class="hour">
      <p class="title">${e}</p>
      <div class="votes">
        ${n.map((t,o)=>t.length>0?t.map(()=>`<div class="vote vote-${o}"></div>`).join(`
`):null).filter(t=>t!==null).join(`
`)}
      </div>
      <div class="voters">
        ${n.map((t,o)=>t.length>0?renderVoters(t,o):null).filter(t=>t!==null).join(`
`)}
      </div>
    </div>
  `}function renderDay(e){return`
    <div class="day">
      <h4>${e.weekdayName}</h4>
      ${e.times.map(({hourName:n,voters:t})=>renderHour(n,t)).join(`
`)}
    </div>
  `}let timer;function initShareButton(e){const n="https://when-tho.web.app/",t=`${window.location.origin}/vote/?event=${eventId}`,o=getEl("share");if(navigator&&navigator.canShare&&navigator.canShare({url:n,text:"When are you free?",title:"when tho"})){const a={url:t,text:`"${e}" \u2022 Let's plan! When are you free? Share your availability here.`,title:`"${e}" \u2022 when tho`};o.addEventListener("click",()=>navigator.share(a))}else o.textContent="Copy Vote Link",o.addEventListener("click",()=>{navigator.clipboard.writeText(t),o.textContent="\u2713 Got It!",clearTimeout(timer),timer=setTimeout(()=>{o.textContent="Copy Vote Link"},3e3)})}function render(e,n){if(document.title=`Poll: "${e.name}" \u2022 when tho`,getEl("event-name").textContent=`"${e.name}"`,getEl("loader").className="hide",n.length<1){getEl("error").innerHTML=`
      <p class="error">Unfortunately it looks like no one has voted in this poll yet.</p>
      <a href="/vote/?event=${eventId}">Please go cast your vote here.</a>
    `;return}const t=[...e.timestamps];t.sort((a,r)=>a-r);const o=getDays(t,n);getEl("days").innerHTML=o.map(renderDay).join(`
`),initShareButton(e.name)}function isValidTimeStampNumber(e){return typeof e=="number"&&!Number.isNaN(e)&&Number.isSafeInteger(e)&&e>16e11}function isPoll(e){return typeof e.name=="string"&&e.name.length>1&&Array.isArray(e.timestamps)&&e.timestamps.every(isValidTimeStampNumber)}function getKey(e){return`poll--${e}`}function getBackup(e){const n=window.localStorage.getItem(getKey(e));if(n){const t=JSON.parse(n);if(isPoll(t))return t}return!1}function setBackup(e,n){window.localStorage.setItem(getKey(e),JSON.stringify(n))}const baseURL="https://when-tho.web.app/api/";async function getVotesOnly(){const e=await fetch(`${baseURL}votes?id=${eventId}&poll=false`),{votes:n}=await e.json();return n}async function getPollAndVotes(){const e=getBackup(eventId);if(e){const a=await getVotesOnly();return{poll:e,votes:a}}const n=await fetch(`${baseURL}votes?id=${eventId}&poll=true`),{poll:t,votes:o}=await n.json();return setBackup(t),{poll:t,votes:o}}async function initialize(){try{const{poll:e,votes:n}=await getPollAndVotes();render(e,n)}catch(e){console.warn(e),redirectOut()}}initialize();
