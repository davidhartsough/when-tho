const getEl = (id) => document.getElementById(id);
const hoursInput = getEl("hours");
const daysInput = getEl("days");
const nameInput = getEl("event-name");

function isValidNumber(n, max = 24) {
  return !Number.isNaN(n) && Number.isSafeInteger(n) && n >= 0 && n < max;
}

function getNumsFromKebab(str, max = 24) {
  return str
    .split("-")
    .map(Number)
    .filter((n) => isValidNumber(n, max))
    .sort((a, b) => a - b);
}

function redirectOut() {
  window.location.replace(`${window.location.origin}/cities/`);
}

const keyNums = ["0", "1", "2", "3", "4", "5", "6"];

function setHiddenInputs() {
  const { searchParams } = new URL(window.location.href);
  const hoursParam = searchParams.get("h");
  if (!hoursParam || hoursParam.length < 1) {
    redirectOut();
    return;
  }
  const hours = getNumsFromKebab(hoursParam, 24);
  const days = [];
  keyNums.forEach((keyNum, index) => {
    const day = searchParams.get(`d${keyNum}`);
    if (day === "1") {
      days.push(index);
    }
  });
  if (days.length < 1) {
    redirectOut();
    return;
  }

  daysInput.value = days.join("-");
  hoursInput.value = hours.join("-");
}
setHiddenInputs();

function getTimestamps(days, hours) {
  const timestamps = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 1, 0);
  const tomorrowsWeekDay = tomorrow.getDay();
  days.forEach((dayNum) => {
    const date = new Date(tomorrow);
    if (dayNum > tomorrowsWeekDay) {
      date.setDate(date.getDate() + dayNum - tomorrowsWeekDay);
    } else if (dayNum < tomorrowsWeekDay) {
      date.setDate(date.getDate() + ((dayNum + (7 - tomorrowsWeekDay)) % 7));
    }
    hours.forEach((hourNum) => {
      date.setHours(hourNum);
      timestamps.push(date.getTime());
    });
  });
  return timestamps;
}

const submitButton = getEl("submit-btn");
function setLoading() {
  submitButton.disabled = true;
  getEl("loader").className = "show";
}

function getPoll() {
  const name = nameInput.value;
  const days = getNumsFromKebab(daysInput.value, 7);
  const hours = getNumsFromKebab(hoursInput.value, 24);
  const timestamps = getTimestamps(days, hours);
  return { name, timestamps };
}

async function addPoll(poll) {
  const res = await fetch("https://when-tho.web.app/api/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ poll }),
  });
  const { id } = await res.json();
  window.localStorage.setItem(`poll--${id}`, JSON.stringify(poll));
  return id;
}

async function savePoll(poll) {
  const pollId = await addPoll(poll);
  window.location.href = `${window.location.origin}/vote/?event=${pollId}`;
}

getEl("form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  setLoading();
  savePoll(getPoll());
  return false;
});
