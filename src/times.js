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

const getEl = (id) => document.getElementById(id);

// #region Get Columns

function getTomorrow(hour = 6) {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour);
  date.setMinutes(0);
  date.setMilliseconds(0);
  return date;
}

// .toLocaleString("en-US", {timeZone: "America/New_York"});
function getTimeNumFromZone(tz) {
  return (
    Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        hour12: false,
      }).format(getTomorrow()),
    ) - 1
  );
}

const { searchParams } = new URL(window.location.href);

const columns = [
  {
    tzNum: 5,
    titles: ["[You]"],
    busy: searchParams.get("b0") === "1",
  },
];

const keyNums = ["1", "2", "3", "4", "5"];

keyNums.forEach((keyNum) => {
  const cityId = searchParams.get(`c${keyNum}`);
  if (cityId) {
    const cityData = getCityById(cityId);
    if (cityData) {
      const tzHourNum = getTimeNumFromZone(cityData.tz);
      const name = cityData.city;
      const busy = searchParams.get(`b${keyNum}`) === "1";
      const index = columns.findIndex(({ tzNum }) => tzNum === tzHourNum);
      if (index >= 0) {
        columns[index].titles.push(name);
        if (busy) {
          columns[index].busy = true;
        }
      } else {
        columns.push({
          tzNum: tzHourNum,
          titles: [name],
          busy,
        });
      }
    }
  }
});

// #endregion

// #region Headers

function renderTitles(titles, index) {
  if (index === 0) {
    return `<p>[You] <span id="approx-loc">...</span> ${
      titles.length > 1 ? ` / ${titles.slice(1).join(" / ")}` : ""
    }</p>`;
  }
  return `<p>${titles.join(" / ")}</p>`;
}
function renderHeader(titles, index) {
  return `
  <div class="col col-header">
  ${renderTitles(titles, index)}
  </div>`;
}
const headersHTML = columns
  .map(({ titles }, index) => renderHeader(titles, index))
  .join("\n");

const headersDiv = getEl("headers");
headersDiv.innerHTML = headersHTML;

// #endregion

// #region Table

const hours = [
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
  "12am",
];

function renderHour(hourNum) {
  const hourText = hourNum <= 23 ? hours[hourNum] : hours[hourNum - 24];
  return `
    <div class="hour h-${hourText}">
      <p>${hourText}</p>
    </div>
  `;
}

function renderColumn(busy, tzNum, hourIndex) {
  return `
    <div class="col ${busy ? "busy" : "free"}">
      ${renderHour(tzNum + hourIndex)}
    </div>
  `;
}

function renderRow(hourIndex) {
  return `
    <div class="row" id="hour-${hourIndex}" onclick="selectHour(${hourIndex})">
      ${columns
        .map(({ busy, tzNum }) => renderColumn(busy, tzNum, hourIndex))
        .join("\n")}
      <div class="selected-overlay"></div>
    </div>
  `;
}

const rows = hours.map((_, index) => renderRow(index)).join("\n");

const tztDiv = getEl("tzt");
tztDiv.innerHTML = rows;

// #endregion

// #region Select

const selectedHours = [];
const hiddenInput = getEl("h");
const submitButton = getEl("submit-btn");

function updateHiddenInput() {
  if (selectedHours.length > 0) {
    selectedHours.sort((a, b) => a - b);
    hiddenInput.value = selectedHours.join("-");
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
}

function selectHour(hourIndex) {
  const hourRowDiv = getEl(`hour-${hourIndex}`);
  const selectedIndex = selectedHours.indexOf(hourIndex);
  if (selectedIndex >= 0) {
    selectedHours.splice(selectedIndex, 1);
    hourRowDiv.classList.remove("selected");
  } else {
    selectedHours.push(hourIndex);
    hourRowDiv.classList.add("selected");
  }
  updateHiddenInput();
}
if (selectHour.name !== "selectHour") {
  console.warn("ERROR");
  selectHour(0);
}

// #endregion
