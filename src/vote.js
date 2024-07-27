const baseURL = "https://when-tho.web.app/api/";

async function addVote(eventId, name, votes) {
  const vote = { poll: eventId, name, votes };
  await fetch(`${baseURL}vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vote }),
  });
  return true;
}

function redirectOut() {
  window.location.replace(`${window.location.origin}/cities/`);
}

const eventId = new URL(window.location.href).searchParams.get("event");
console.log(eventId);
if (!eventId || eventId.length < 4) {
  console.warn("Invalid event id:", eventId);
  redirectOut();
  throw new Error("Invalid event id");
}

function getDays(timestamps) {
  const days = [];
  timestamps.forEach((ts) => {
    const date = new Date(ts);
    const time = {
      hourNum: date.getHours(),
      hourName: date
        .toLocaleTimeString(undefined, { hour: "numeric" })
        .toLowerCase(),
      timestamp: ts,
      chunk: 0,
    };
    if (time.hourName.endsWith(" am") || time.hourName.endsWith(" pm")) {
      time.hourName = time.hourName.replace(" ", "");
    }
    const dayNum = date.getDay();
    const dayIndex = days.findIndex(({ weekdayNum }) => weekdayNum === dayNum);
    if (dayIndex >= 0) {
      const prev = days[dayIndex].times[days[dayIndex].times.length - 1];
      if (prev.hourNum === time.hourNum - 1) {
        time.chunk = prev.chunk;
      } else {
        time.chunk = prev.chunk + 1;
      }
      days[dayIndex].times.push(time);
      if (Array.isArray(days[dayIndex].chunks[time.chunk])) {
        days[dayIndex].chunks[time.chunk].push(time);
      } else {
        days[dayIndex].chunks.push([time]);
      }
    } else {
      const weekdayName = date.toLocaleDateString(undefined, {
        weekday: "long",
      });
      days.push({
        weekdayNum: dayNum,
        weekdayName,
        times: [time],
        chunks: [[time]],
      });
    }
  });
  days.sort((a, b) => a.weekdayNum - b.weekdayNum);
  return days;
}

const voteToSubmit = {};
let isReady = false;

const getElem = (id) => document.getElementById(id);
const dayTemplate = getElem("day-template");
const chunkTemplate = getElem("chunk-template");
const chunkHeaderTemplate = getElem("chunk-header-template");
const hourTemplate = getElem("hour-template");
const daysContainer = getElem("days");
const submitBtn = getElem("submit");
const modal = getElem("modal");
const nameForm = getElem("name-form");
const givenNameInput = getElem("given-name");

const cloneDay = () => dayTemplate.content.cloneNode(true);
const cloneChunk = () => chunkTemplate.content.cloneNode(true);
const cloneChunkHeader = () => chunkHeaderTemplate.content.cloneNode(true);
const cloneHour = () => hourTemplate.content.cloneNode(true);

const nameRegEx = /[\p{L} ]+/gu;

function isValidTimeStampNumber(ts) {
  return (
    typeof ts === "number" &&
    !Number.isNaN(ts) &&
    Number.isSafeInteger(ts) &&
    ts > 1600000000000
  );
}
function isValidVoteNumber(n) {
  return (
    typeof n === "number" &&
    !Number.isNaN(n) &&
    Number.isSafeInteger(n) &&
    n >= 0 &&
    n <= 3
  );
}
function isValidVote(vote) {
  return Object.entries(vote).every(
    ([key, val]) =>
      typeof key === "string" &&
      isValidTimeStampNumber(Number(key)) &&
      isValidVoteNumber(val),
  );
}

nameForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  nameForm.querySelector(`button[type="submit"]`).disabled = true;
  const div = document.createElement("div");
  div.id = "loader";
  div.className = "show";
  nameForm.appendChild(div);
  const name = givenNameInput.value;
  if (!nameRegEx.test(name) || !isValidVote(voteToSubmit)) {
    return false;
  }
  try {
    const ok = await addVote(eventId, name, voteToSubmit);
    if (ok) {
      window.location.href = `${window.location.origin}/poll/?event=${eventId}`;
    }
  } catch (err) {
    console.warn(err);
  }
  return false;
});
submitBtn.addEventListener("click", () => {
  if (isReady) {
    modal.className = "show";
    submitBtn.disabled = true;
  }
});

function checkVotes() {
  isReady = Object.values(voteToSubmit).every((v) => v >= 0);
  submitBtn.disabled = !isReady;
  submitBtn.title = isReady ? "" : "Please vote for all time slots";
}

function getHourDiv(hourName, timestamp, id) {
  const clone = cloneHour();
  clone.id = `hour-${timestamp}`;
  clone.querySelector(".hour").textContent = hourName;
  const buttons = clone.querySelectorAll(".vote-btn");
  buttons.forEach((voteBtn, i) => {
    voteBtn.addEventListener("click", (ev) => {
      const btn = ev.currentTarget;
      buttons.forEach((b) => {
        b.classList.remove("selected");
        b.classList.add("unselected");
      });
      btn.classList.remove("unselected");
      btn.classList.add("selected");
      const select = getElem(`set-${id}`);
      if (select && select.value !== i.toString()) {
        select.value = "";
      }
      voteToSubmit[timestamp] = i;
      checkVotes();
    });
  });
  return clone;
}
function getChunkHeaderDiv(id) {
  const clone = cloneChunkHeader();
  const select = clone.querySelector("select");
  select.id = `set-${id}`;
  select.addEventListener("change", (ev) => {
    const { value } = ev.target;
    const chunkDiv = getElem(id);
    chunkDiv.querySelectorAll(`.vote-${value}`).forEach((btn) => {
      btn.click();
    });
  });
  return clone;
}
function getChunkDiv(chunk, dayIndex) {
  const clone = cloneChunk();
  const chunkNum = chunk[0].chunk;
  const id = `chunk-${dayIndex}-${chunkNum}`;
  if (chunk.length > 1) {
    const header = getChunkHeaderDiv(id);
    clone.querySelector(".chunk-header").appendChild(header);
  }
  const chunkBody = clone.querySelector(".chunk-body");
  chunkBody.id = id;
  chunk.forEach(({ hourName, timestamp }) => {
    chunkBody.appendChild(getHourDiv(hourName, timestamp, id));
  });
  return clone;
}
function getDayDiv(day, index) {
  const clone = cloneDay();
  clone.querySelector("h4").textContent = day.weekdayName;
  const chunkContainer = clone.querySelector(".chunks");
  day.chunks.forEach((chunk) => {
    chunkContainer.appendChild(getChunkDiv(chunk, index));
  });
  return clone;
}

function render(poll) {
  document.title = `Vote: "${poll.name}" • Say When`;
  getElem("event-name").textContent = `"${poll.name}"`;
  getElem("loader").className = "hide";
  const timestamps = [...poll.timestamps];
  timestamps.sort((a, b) => a - b);
  timestamps.forEach((ts) => {
    voteToSubmit[ts] = -1;
  });
  const days = getDays(timestamps);
  days.forEach((day, i) => {
    daysContainer.appendChild(getDayDiv(day, i));
  });
}

function isPoll(poll) {
  return (
    typeof poll.name === "string" &&
    poll.name.length > 1 &&
    Array.isArray(poll.timestamps) &&
    poll.timestamps.every(isValidTimeStampNumber)
  );
}

function getKey(id) {
  return `poll--${id}`;
}

function getBackup(id) {
  const backup = window.localStorage.getItem(getKey(id));
  if (backup) {
    const poll = JSON.parse(backup);
    if (isPoll(poll)) return poll;
  }
  return false;
}

function setBackup(id, poll) {
  window.localStorage.setItem(getKey(id), JSON.stringify(poll));
}

async function getPoll(id) {
  const backup = getBackup(id);
  if (backup) return backup;
  const res = await fetch(`${baseURL}poll?id=${id}`);
  const { poll } = await res.json();
  setBackup(poll);
  return poll;
}

getPoll(eventId).then(render).catch(console.warn);
