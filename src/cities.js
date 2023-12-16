// import cities from "./cities-data.js";
if (typeof citiesData === "undefined") {
  console.warn("NO DATA");
}
// eslint-disable-next-line no-undef
const cities = citiesData || [];
if (cities.length === 0) {
  console.warn("NO CITIES");
}

function getCityById(id) {
  return cities.find(({ link }) => link === id);
}

function searchCities(inputLowerCase) {
  return cities.filter(({ search }) =>
    search.some((t) => t.startsWith(inputLowerCase)),
  );
}

const getEl = (id) => document.getElementById(id);

// #region ComboBoxes

function getElements(num) {
  const inputElement = getEl(`city-input-${num}`);
  const hiddenInput = getEl(`c${num}`);
  const busyBoxDiv = getEl(`busy-box-${num}`);
  const busyBox = getEl(`b${num}`);
  const optionsDiv = getEl(`city-options-${num}`);
  return {
    inputElement,
    hiddenInput,
    busyBoxDiv,
    busyBox,
    optionsDiv,
  };
}

function selectCityOption(num, cityId) {
  const { inputElement, hiddenInput, busyBoxDiv, busyBox, optionsDiv } =
    getElements(num);
  const city = getCityById(cityId);
  if (city) {
    optionsDiv.innerHTML = "";
    hiddenInput.value = cityId;
    inputElement.value = city.city;
    busyBoxDiv.style.opacity = "1";
    busyBox.disabled = false;
  }
}
if (selectCityOption.name !== "selectCityOption") {
  console.warn("ERROR");
  selectCityOption("", "");
}

function getCityOptionHTML(num, c) {
  return `
    <div class="city-option" id="${num}--${c.link}" onclick="selectCityOption(${num}, '${c.link}')">
      ${c.city}, ${c.country}
    </div>
  `;
}

function initComboBox(num) {
  const { inputElement, hiddenInput, busyBoxDiv, busyBox, optionsDiv } =
    getElements(num);
  const renderOptions = (cityOptions) => {
    const optionsHTML = cityOptions
      .map((c) => getCityOptionHTML(num, c))
      .join("\n");
    optionsDiv.innerHTML = `<div class="city-options">${optionsHTML}</div>`;
  };
  inputElement.addEventListener("input", (ev) => {
    const textInput = ev.target.value;
    if (hiddenInput.value !== "") {
      hiddenInput.value = "";
      busyBoxDiv.style.opacity = "0.25";
      busyBox.disabled = true;
    }
    if (textInput.length >= 2) {
      const inputLowerCase = textInput.toLowerCase();
      const cityOptions = searchCities(inputLowerCase);
      renderOptions(cityOptions);
    } else {
      optionsDiv.innerHTML = "";
    }
  });
}

initComboBox(1);

// #endregion ComboBoxes

// #region AddButton

let curr = 2;
const moreDiv = getEl("more");
const addBtn = getEl("add");

function renderCitySelect() {
  const div = document.createElement("div");
  div.className = "city-select";
  div.id = `city-select-${curr}`;
  div.innerHTML = `
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
  `;
  moreDiv.appendChild(div);
  initComboBox(curr);
  curr += 1;
  if (curr === 5) {
    addBtn.style.display = "none";
  }
}

addBtn.addEventListener("click", renderCitySelect);

// #endregion AddButton
