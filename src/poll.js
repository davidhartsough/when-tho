function isValidVoteNumber(n) {
  return !Number.isNaN(n) && Number.isSafeInteger(n) && n >= 0 && n <= 3;
}

function redirectOut() {
  window.location.replace(`${window.location.origin}/cities/`);
}

const eventId = new URL(window.location.href).searchParams.get("event");
if (!eventId || eventId.length < 18) {
  redirectOut();
  throw new Error("Invalid event id");
}

const getEl = (id) => document.getElementById(id);

function getDays(timestamps, votes) {
  const days = [];
  timestamps.forEach((ts) => {
    const date = new Date(ts);
    const time = {
      hourName: date
        .toLocaleTimeString(undefined, { hour: "numeric" })
        .toLowerCase(),
      voters: [[], [], [], []],
    };
    votes.forEach((voter) => {
      const voteNumber = Number(voter.votes[ts]);
      const { name } = voter;
      if (isValidVoteNumber(voteNumber) && typeof name === "string") {
        time.voters[voteNumber].push(name);
      }
    });
    if (time.hourName.endsWith(" am") || time.hourName.endsWith(" pm")) {
      time.hourName = time.hourName.replace(" ", "");
    }
    const dayNum = date.getDay();
    const dayIndex = days.findIndex(({ weekdayNum }) => weekdayNum === dayNum);
    if (dayIndex >= 0) {
      days[dayIndex].times.push(time);
    } else {
      const weekdayName = date.toLocaleDateString(undefined, {
        weekday: "long",
      });
      days.push({
        weekdayNum: dayNum,
        weekdayName,
        times: [time],
      });
    }
  });
  days.sort((a, b) => a.weekdayNum - b.weekdayNum);
  return days;
}

const emojis = ["🟥", "🟨", "🟩", "🟦"];
const voteLabels = ["Busy", "Maybe", "Free", "Prefer"];

function renderVoters(voters, vote) {
  return `
    <p>
      <span class="emoji">${emojis[vote]} </span>
      <span><strong>${voteLabels[vote]}</strong>: </span>
      <span class="names">${voters.join(", ")}</span>
    </p>
  `;
}

function renderHour(hour, voters) {
  return `
    <div class="hour">
      <p class="title">${hour}</p>
      <div class="votes">
        ${voters
          .map((v, i) =>
            v.length > 0
              ? v.map(() => `<div class="vote vote-${i}"></div>`).join("\n")
              : null,
          )
          .filter((v) => v !== null)
          .join("\n")}
      </div>
      <div class="voters">
        ${voters
          .map((v, i) => (v.length > 0 ? renderVoters(v, i) : null))
          .filter((v) => v !== null)
          .join("\n")}
      </div>
    </div>
  `;
}

function renderDay(day) {
  return `
    <div class="day">
      <h4>${day.weekdayName}</h4>
      ${day.times
        .map(({ hourName, voters }) => renderHour(hourName, voters))
        .join("\n")}
    </div>
  `;
}

let timer;

function initShareButton(eventName) {
  const baseURL = "https://when-tho.web.app/";
  const url = `${window.location.origin}/vote/?event=${eventId}`;
  const shareButton = getEl("share");
  if (
    navigator &&
    navigator.canShare &&
    navigator.canShare({
      url: baseURL,
      text: "When are you free?",
      title: "when tho",
    })
  ) {
    const shareData = {
      url,
      text: `"${eventName}" • Let's plan! When are you free? Share your availability here.`,
      title: `"${eventName}" • when tho`,
    };
    shareButton.addEventListener("click", () => navigator.share(shareData));
  } else {
    shareButton.textContent = "Copy Vote Link";
    shareButton.addEventListener("click", () => {
      navigator.clipboard.writeText(url);
      shareButton.textContent = "✓ Got It!";
      clearTimeout(timer);
      timer = setTimeout(() => {
        shareButton.textContent = "Copy Vote Link";
      }, 3000);
    });
  }
}

function render(poll, votes) {
  document.title = `Poll: "${poll.name}" • when tho`;
  getEl("event-name").textContent = `"${poll.name}"`;
  getEl("loader").className = "hide";
  if (votes.length < 1) {
    getEl("error").innerHTML = `
      <p class="error">Unfortunately it looks like no one has voted in this poll yet.</p>
      <a href="/vote/?event=${eventId}">Please go cast your vote here.</a>
    `;
    return;
  }
  const timestamps = [...poll.timestamps];
  timestamps.sort((a, b) => a - b);
  const days = getDays(timestamps, votes);
  getEl("days").innerHTML = days.map(renderDay).join("\n");
  initShareButton(poll.name);
}

function isValidTimeStampNumber(ts) {
  return (
    typeof ts === "number" &&
    !Number.isNaN(ts) &&
    Number.isSafeInteger(ts) &&
    ts > 1600000000000
  );
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

const baseURL = "https://when-tho.web.app/api/";

async function getVotesOnly() {
  const res = await fetch(`${baseURL}votes?id=${eventId}&poll=false`);
  const { votes } = await res.json();
  return votes;
}

async function getPollAndVotes() {
  const backupPoll = getBackup(eventId);
  if (backupPoll) {
    const votes = await getVotesOnly();
    return {
      poll: backupPoll,
      votes,
    };
  }
  const res = await fetch(`${baseURL}votes?id=${eventId}&poll=true`);
  const { poll, votes } = await res.json();
  setBackup(poll);
  return { poll, votes };
}

async function initialize() {
  try {
    const { poll, votes } = await getPollAndVotes();
    render(poll, votes);
  } catch (err) {
    console.warn(err);
    redirectOut();
  }
}
initialize();
