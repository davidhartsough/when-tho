function isValidTimeStampNumber(ts) {
  return (
    typeof ts === "number" && Number.isSafeInteger(ts) && ts > 1600000000000
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

export function getBackup(id) {
  const backup = window.localStorage.getItem(getKey(id));
  if (backup) {
    const poll = JSON.parse(backup);
    if (isPoll(poll)) return poll;
  }
  return false;
}

export function setBackup(id, poll) {
  window.localStorage.setItem(getKey(id), JSON.stringify(poll));
}
