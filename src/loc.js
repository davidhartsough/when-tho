const span = document.getElementById("approx-loc");

const backupKey = "my-approx-loc";
const getBackup = () => window.sessionStorage.getItem(backupKey) || null;
const setBackup = (val) => window.sessionStorage.setItem(backupKey, val);

function setText(text) {
  span.innerText = text;
}

async function getLocation() {
  const res = await fetch("https://geolocation-db.com/json/");
  const { city } = await res.json();
  if (city && typeof city === "string" && city.length > 0) {
    const approxLoc = `(near ${city})`;
    setBackup(approxLoc);
    setText(approxLoc);
  } else {
    setText("");
  }
}

if (span && span.innerText === "...") {
  const backup = getBackup();
  if (backup) {
    setText(backup);
  } else {
    try {
      getLocation();
    } catch {
      setText("");
    }
  }
}
