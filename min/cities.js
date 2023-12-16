typeof citiesData>"u"&&console.warn("NO DATA");const cities=citiesData||[];cities.length===0&&console.warn("NO CITIES");function getCityById(t){return cities.find(({link:i})=>i===t)}function searchCities(t){return cities.filter(({search:i})=>i.some(e=>e.startsWith(t)))}const getEl=t=>document.getElementById(t);function getElements(t){const i=getEl(`city-input-${t}`),e=getEl(`c${t}`),s=getEl(`busy-box-${t}`),c=getEl(`b${t}`),n=getEl(`city-options-${t}`);return{inputElement:i,hiddenInput:e,busyBoxDiv:s,busyBox:c,optionsDiv:n}}function selectCityOption(t,i){const{inputElement:e,hiddenInput:s,busyBoxDiv:c,busyBox:n,optionsDiv:l}=getElements(t),o=getCityById(i);o&&(l.innerHTML="",s.value=i,e.value=o.city,c.style.opacity="1",n.disabled=!1)}selectCityOption.name!=="selectCityOption"&&(console.warn("ERROR"),selectCityOption("",""));function getCityOptionHTML(t,i){return`
    <div class="city-option" id="${t}--${i.link}" onclick="selectCityOption(${t}, '${i.link}')">
      ${i.city}, ${i.country}
    </div>
  `}function initComboBox(t){const{inputElement:i,hiddenInput:e,busyBoxDiv:s,busyBox:c,optionsDiv:n}=getElements(t),l=o=>{const d=o.map(a=>getCityOptionHTML(t,a)).join(`
`);n.innerHTML=`<div class="city-options">${d}</div>`};i.addEventListener("input",o=>{const d=o.target.value;if(e.value!==""&&(e.value="",s.style.opacity="0.25",c.disabled=!0),d.length>=2){const a=d.toLowerCase(),u=searchCities(a);l(u)}else n.innerHTML=""})}initComboBox(1);let curr=2;const moreDiv=getEl("more"),addBtn=getEl("add");function renderCitySelect(){const t=document.createElement("div");t.className="city-select",t.id=`city-select-${curr}`,t.innerHTML=`
    <div class="city-search">
      <input
        type="text"
        id="city-input-${curr}"
        autocomplete="off"
        placeholder="Search for a city"
      />
      <div id="city-options-${curr}"></div>
    </div>
    <input type="hidden" name="c${curr}" id="c${curr}" />
    <div id="busy-box-${curr}">
      <label for="b${curr}" class="busy-box">
        <input type="checkbox" id="b${curr}" name="b${curr}" value="1" />
        Busy 9-5
      </label>
    </div>
  `,moreDiv.appendChild(t),initComboBox(curr),curr+=1,curr===5&&(addBtn.style.display="none")}addBtn.addEventListener("click",renderCitySelect);
