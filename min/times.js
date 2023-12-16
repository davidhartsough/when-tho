typeof citiesData>"u"&&console.warn("NO DATA");const cities=citiesData||[];cities.length===0&&console.warn("NO CITIES");function getCityById(e){return cities.find(({link:t})=>t===e)}const getEl=e=>document.getElementById(e);function getTomorrow(e=6){const t=new Date;return t.setDate(t.getDate()+1),t.setHours(e),t.setMinutes(0),t.setMilliseconds(0),t}function getTimeNumFromZone(e){return Number(new Intl.DateTimeFormat("en-US",{timeZone:e,hour:"numeric",hour12:!1}).format(getTomorrow()))-1}const{searchParams}=new URL(window.location.href),columns=[{tzNum:5,titles:["[You]"],busy:searchParams.get("b0")==="1"}],keyNums=["1","2","3","4","5"];keyNums.forEach(e=>{const t=searchParams.get(`c${e}`);if(t){const n=getCityById(t);if(n){const o=getTimeNumFromZone(n.tz),i=n.city,c=searchParams.get(`b${e}`)==="1",s=columns.findIndex(({tzNum:r})=>r===o);s>=0?(columns[s].titles.push(i),c&&(columns[s].busy=!0)):columns.push({tzNum:o,titles:[i],busy:c})}}});function renderTitles(e,t){return t===0?`<p>[You] <span id="approx-loc">...</span> ${e.length>1?` / ${e.slice(1).join(" / ")}`:""}</p>`:`<p>${e.join(" / ")}</p>`}function renderHeader(e,t){return`
  <div class="col col-header">
  ${renderTitles(e,t)}
  </div>`}const headersHTML=columns.map(({titles:e},t)=>renderHeader(e,t)).join(`
`),headersDiv=getEl("headers");headersDiv.innerHTML=headersHTML;const hours=["1am","2am","3am","4am","5am","6am","7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm","9pm","10pm","11pm","12am"];function renderHour(e){const t=e<=23?hours[e]:hours[e-24];return`
    <div class="hour h-${t}">
      <p>${t}</p>
    </div>
  `}function renderColumn(e,t,n){return`
    <div class="col ${e?"busy":"free"}">
      ${renderHour(t+n)}
    </div>
  `}function renderRow(e){return`
    <div class="row" id="hour-${e}" onclick="selectHour(${e})">
      ${columns.map(({busy:t,tzNum:n})=>renderColumn(t,n,e)).join(`
`)}
      <div class="selected-overlay"></div>
    </div>
  `}const rows=hours.map((e,t)=>renderRow(t)).join(`
`),tztDiv=getEl("tzt");tztDiv.innerHTML=rows;const selectedHours=[],hiddenInput=getEl("h"),submitButton=getEl("submit-btn");function updateHiddenInput(){selectedHours.length>0?(selectedHours.sort((e,t)=>e-t),hiddenInput.value=selectedHours.join("-"),submitButton.disabled=!1):submitButton.disabled=!0}function selectHour(e){const t=getEl(`hour-${e}`),n=selectedHours.indexOf(e);n>=0?(selectedHours.splice(n,1),t.classList.remove("selected")):(selectedHours.push(e),t.classList.add("selected")),updateHiddenInput()}selectHour.name!=="selectHour"&&(console.warn("ERROR"),selectHour(0));
