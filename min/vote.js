const baseURL="https://when-tho.web.app/api/";async function addVote(e,t,o){const n={poll:e,name:t,votes:o};return await fetch(`${baseURL}vote`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vote:n})}),!0}function redirectOut(){window.location.replace(`${window.location.origin}/cities/`)}const eventId=new URL(window.location.href).searchParams.get("event");if(!eventId||eventId.length<4)throw redirectOut(),new Error("Invalid event id");function getDays(e){const t=[];return e.forEach(o=>{const n=new Date(o),c={hourNum:n.getHours(),hourName:n.toLocaleTimeString(void 0,{hour:"numeric"}).toLowerCase(),timestamp:o,chunk:0};(c.hourName.endsWith(" am")||c.hourName.endsWith(" pm"))&&(c.hourName=c.hourName.replace(" ",""));const s=n.getDay(),a=t.findIndex(({weekdayNum:r})=>r===s);if(a>=0){const r=t[a].times[t[a].times.length-1];r.hourNum===c.hourNum-1?c.chunk=r.chunk:c.chunk=r.chunk+1,t[a].times.push(c),Array.isArray(t[a].chunks[c.chunk])?t[a].chunks[c.chunk].push(c):t[a].chunks.push([c])}else{const r=n.toLocaleDateString(void 0,{weekday:"long"});t.push({weekdayNum:s,weekdayName:r,times:[c],chunks:[[c]]})}}),t.sort((o,n)=>o.weekdayNum-n.weekdayNum),t}const voteToSubmit={};let isReady=!1;const getElem=e=>document.getElementById(e),dayTemplate=getElem("day-template"),chunkTemplate=getElem("chunk-template"),chunkHeaderTemplate=getElem("chunk-header-template"),hourTemplate=getElem("hour-template"),daysContainer=getElem("days"),submitBtn=getElem("submit"),modal=getElem("modal"),nameForm=getElem("name-form"),givenNameInput=getElem("given-name"),cloneDay=()=>dayTemplate.content.cloneNode(!0),cloneChunk=()=>chunkTemplate.content.cloneNode(!0),cloneChunkHeader=()=>chunkHeaderTemplate.content.cloneNode(!0),cloneHour=()=>hourTemplate.content.cloneNode(!0),nameRegEx=/[\p{L} ]+/gu;function isValidTimeStampNumber(e){return typeof e=="number"&&!Number.isNaN(e)&&Number.isSafeInteger(e)&&e>16e11}function isValidVoteNumber(e){return typeof e=="number"&&!Number.isNaN(e)&&Number.isSafeInteger(e)&&e>=0&&e<=3}function isValidVote(e){return Object.entries(e).every(([t,o])=>typeof t=="string"&&isValidTimeStampNumber(Number(t))&&isValidVoteNumber(o))}nameForm.addEventListener("submit",async e=>{e.preventDefault(),nameForm.querySelector('button[type="submit"]').disabled=!0;const t=document.createElement("div");t.id="loader",t.className="show",nameForm.appendChild(t);const o=givenNameInput.value;if(!nameRegEx.test(o)||!isValidVote(voteToSubmit))return!1;try{await addVote(eventId,o,voteToSubmit)&&(window.location.href=`${window.location.origin}/poll/?event=${eventId}`)}catch(n){console.warn(n)}return!1}),submitBtn.addEventListener("click",()=>{isReady&&(modal.className="show",submitBtn.disabled=!0)});function checkVotes(){isReady=Object.values(voteToSubmit).every(e=>e>=0),submitBtn.disabled=!isReady,submitBtn.title=isReady?"":"Please vote for all time slots"}function getHourDiv(e,t,o){const n=cloneHour();n.id=`hour-${t}`,n.querySelector(".hour").textContent=e;const c=n.querySelectorAll(".vote-btn");return c.forEach((s,a)=>{s.addEventListener("click",r=>{const i=r.currentTarget;c.forEach(l=>{l.classList.remove("selected"),l.classList.add("unselected")}),i.classList.remove("unselected"),i.classList.add("selected");const u=getElem(`set-${o}`);u&&u.value!==a.toString()&&(u.value=""),voteToSubmit[t]=a,checkVotes()})}),n}function getChunkHeaderDiv(e){const t=cloneChunkHeader(),o=t.querySelector("select");return o.id=`set-${e}`,o.addEventListener("change",n=>{const{value:c}=n.target;getElem(e).querySelectorAll(`.vote-${c}`).forEach(a=>{a.click()})}),t}function getChunkDiv(e,t){const o=cloneChunk(),n=e[0].chunk,c=`chunk-${t}-${n}`;if(e.length>1){const a=getChunkHeaderDiv(c);o.querySelector(".chunk-header").appendChild(a)}const s=o.querySelector(".chunk-body");return s.id=c,e.forEach(({hourName:a,timestamp:r})=>{s.appendChild(getHourDiv(a,r,c))}),o}function getDayDiv(e,t){const o=cloneDay();o.querySelector("h4").textContent=e.weekdayName;const n=o.querySelector(".chunks");return e.chunks.forEach(c=>{n.appendChild(getChunkDiv(c,t))}),o}function render(e){document.title=`Vote: "${e.name}" \u2022 Say When`,getElem("event-name").textContent=`"${e.name}"`,getElem("loader").className="hide";const t=[...e.timestamps];t.sort((n,c)=>n-c),t.forEach(n=>{voteToSubmit[n]=-1}),getDays(t).forEach((n,c)=>{daysContainer.appendChild(getDayDiv(n,c))})}function isPoll(e){return typeof e.name=="string"&&e.name.length>1&&Array.isArray(e.timestamps)&&e.timestamps.every(isValidTimeStampNumber)}function getKey(e){return`poll--${e}`}function getBackup(e){const t=window.localStorage.getItem(getKey(e));if(t){const o=JSON.parse(t);if(isPoll(o))return o}return!1}function setBackup(e,t){window.localStorage.setItem(getKey(e),JSON.stringify(t))}async function getPoll(e){const t=getBackup(e);if(t)return t;const o=await fetch(`${baseURL}poll?id=${e}`),{poll:n}=await o.json();return setBackup(n),n}getPoll(eventId).then(render).catch(console.warn);
