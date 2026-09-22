// Night Garden makes a different small world each time the page starts or "New Walk" is pressed.
const garden = document.querySelector("#garden");
const light = document.querySelector("#light");
const secretsLayer = document.querySelector("#secrets-layer");
const foundCount = document.querySelector("#found-count");
const totalCount = document.querySelector("#total-count");
const sceneName = document.querySelector("#scene-name");
const sceneDescription = document.querySelector("#scene-description");
const hint = document.querySelector("#hint");
const completion = document.querySelector("#completion");
const restart = document.querySelector("#restart");
const introScreen = document.querySelector("#intro-screen");
const rulesDialog = document.querySelector("#rules-dialog");
const openRules = document.querySelector("#open-rules");
const beginWalk = document.querySelector("#begin-walk");
const audio = document.querySelector("#ambient-audio");
const bellSound = document.querySelector("#bell-sound");
const successSound = document.querySelector("#success-sound");
const introAudio = document.querySelector("#intro-audio");
const soundButton = document.querySelector("#sound-button");
const beamLabel = document.querySelector("#beam-label");
const meter = document.querySelectorAll(".beam-meter i");

const places = [
  { id: "trail", name: "Forest Trail", description: "A narrow path winds between the trees." },
  { id: "pond", name: "Moon Pond", description: "Something small is moving below the water lilies." },
  { id: "grove", name: "Hidden Grove", description: "The old trees leave very little light on the ground." }
];
const seasons = ["spring", "summer", "autumn", "winter"];
const seasonNames = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" };
const times = ["dawn", "day", "dusk"];
const timeNames = { dawn: "Dawn", day: "Daylight", dusk: "Twilight" };
const possibleSecrets = [
  ["✿", "moon flower", "flower"], ["✦", "firefly", "firefly"], ["@", "little snail", "snail"],
  ["♟", "glowing mushroom", "mushroom"], ["♢", "moth", "moth"], ["●", "jewel beetle", "beetle"],
  ["♙", "garden ghost", "ghost"], ["☾", "sleeping frog", "frog"], ["❋", "wild clover", "flower"],
  ["◒", "round pebble", "pebble"], ["♧", "tiny fern", "fern"], ["✧", "star seed", "firefly"],
  ["◉", "watchful owl", "owl"], ["♠", "curled leaf", "leaf"], ["◌", "dew drop", "dew"],
  ["☘", "lucky sprig", "fern"], ["☄", "fallen star", "firefly"], ["♜", "old garden key", "key"],
  ["♛", "night crown flower", "flower"], ["◍", "small seed pod", "seed"],
  ["♤", "shadow leaf", "leaf"], ["✾", "wild bloom", "flower"], ["♁", "earth stone", "pebble"],
  ["⌇", "rain beetle", "beetle"], ["♨", "misty mushroom", "mushroom"]
];
const tracks = [
  "audio/622423__szegvari__jazz-piano-bar-relax-mood-pianist-cinematic-atmo-music-mastered.wav",
  "audio/725416__lovescotch__its-alright.wav",
  "audio/580516__szegvari__relax-ambient-sea-music-short.wav"
];

let mouseX = -1000, mouseY = -1000, beamSize = 230, found = 0, secretButtons = [];
let soundWanted = false;
const minBeam = 120, maxBeam = 390, discoveryTime = 800;
const pick = (items) => items[Math.floor(Math.random() * items.length)];

// Keep success feedback softer than the ambient garden music.
successSound.volume = 0.16;
bellSound.volume = 0.28;
introAudio.volume = 0.22;

function updateBeam() {
  light.style.width = `${beamSize}px`; light.style.height = `${beamSize}px`;
  const level = Math.round(((beamSize - minBeam) / (maxBeam - minBeam)) * 4) + 1;
  meter.forEach((bar, index) => bar.classList.toggle("on", index < level));
  beamLabel.textContent = level <= 2 ? "FOCUSED" : level >= 4 ? "WIDE BEAM" : "MID BEAM";
}

function makeSecretButton(secret, left, top) {
  const [symbol, name, kind] = secret;
  const button = document.createElement("button");
  button.className = `secret kind-${kind}`;
  button.dataset.name = name; button.dataset.timeInLight = "0";
  button.setAttribute("aria-label", `Hidden ${name}`);
  button.style.left = `${left}%`; button.style.top = `${top}%`;
  button.innerHTML = `<span class="secret-art">${symbol}</span><span class="label">${name}</span>`;
  button.addEventListener("focus", () => discover(button));
  return button;
}

function makeRandomSecrets(total) {
  // There are exactly 25 possible objects. Each walk draws only a small random set.
  const selected = [...possibleSecrets].sort(() => Math.random() - 0.5).slice(0, total);
  const usedPositions = [];
  selected.forEach((secret) => {
    let left, top, attempts = 0;
    do { left = 6 + Math.random() * 86; top = 19 + Math.random() * 62; attempts++; }
    while (usedPositions.some(pos => Math.hypot(pos.left - left, pos.top - top) < 9) && attempts < 80);
    usedPositions.push({ left, top });
    const button = makeSecretButton(secret, left, top);
    secretsLayer.append(button); secretButtons.push(button);
  });
}

function chooseMusic() {
  audio.pause(); bellSound.pause(); successSound.pause(); successSound.currentTime = 0;
  audio.src = pick(tracks); audio.volume = 0.23; audio.load();
  if (soundWanted) audio.play().catch(() => { soundWanted = false; updateSoundButton(); });
}
function updateSoundButton() { soundButton.textContent = soundWanted ? "♪ SOUND ON" : "♪ SOUND OFF"; soundButton.setAttribute("aria-pressed", String(soundWanted)); }
soundButton.addEventListener("click", () => {
  soundWanted = !soundWanted;
  if (soundWanted) audio.play().catch(() => { soundWanted = false; });
  else { audio.pause(); bellSound.pause(); successSound.pause(); }
  updateSoundButton();
});

function newWalk() {
  const place = pick(places), season = pick(seasons), time = pick(times);
  garden.className = `scene-${place.id} season-${season} time-${time}`;
  sceneName.textContent = `${seasonNames[season]} · ${timeNames[time]} · ${place.name}`;
  sceneDescription.textContent = place.description;
  found = 0; secretButtons = []; secretsLayer.replaceChildren(); completion.classList.remove("show");
  const total = 5 + Math.floor(Math.random() * 4); // Inclusive range: 5 through 8.
  totalCount.textContent = total; foundCount.textContent = 0;
  hint.textContent = "Every new walk has a new map and new secrets.";
  makeRandomSecrets(total); chooseMusic();
}

garden.addEventListener("pointermove", (event) => {
  const box = garden.getBoundingClientRect(); mouseX = event.clientX - box.left; mouseY = event.clientY - box.top;
  light.style.left = `${mouseX}px`; light.style.top = `${mouseY}px`;
});
garden.addEventListener("pointerleave", () => { mouseX = -1000; mouseY = -1000; });
// A click is a browser-approved user gesture, so it can start the already-randomized track.
garden.addEventListener("pointerdown", () => {
  if (!soundWanted) { soundWanted = true; audio.play().catch(() => { soundWanted = false; }); updateSoundButton(); }
});
garden.addEventListener("wheel", (event) => {
  event.preventDefault(); beamSize = Math.max(minBeam, Math.min(maxBeam, beamSize - event.deltaY * 0.18)); updateBeam();
  hint.textContent = beamSize < 190 ? "Focused light reaches into the darkest corners." : "A wide beam helps you scan the garden.";
}, { passive: false });

function discover(button) {
  if (button.classList.contains("found")) return;
  button.classList.remove("active"); button.classList.add("found"); found += 1; foundCount.textContent = found;
  // Resetting currentTime lets the short bell play from its beginning for every discovery.
  if (soundWanted) { bellSound.currentTime = 0; bellSound.play().catch(() => {}); }
  hint.textContent = `You discovered the ${button.dataset.name}.`;
  if (found === secretButtons.length) {
    completion.classList.add("show"); hint.textContent = "This walk is complete. Try a new world.";
    if (soundWanted) {
      audio.pause();
      successSound.currentTime = 0;
      successSound.play().catch(() => {});
    }
  }
}
function checkSecrets() {
  secretButtons.forEach((button) => {
    if (button.classList.contains("found")) return;
    const box = button.getBoundingClientRect(), gardenBox = garden.getBoundingClientRect();
    const x = box.left - gardenBox.left + box.width / 2, y = box.top - gardenBox.top + box.height / 2;
    const distance = Math.hypot(mouseX - x, mouseY - y);
    if (distance < beamSize * 0.31) {
      button.classList.add("active"); button.dataset.timeInLight = Number(button.dataset.timeInLight) + 16;
      if (Number(button.dataset.timeInLight) > discoveryTime) discover(button);
    } else { button.classList.remove("active"); button.dataset.timeInLight = "0"; }
  });
  requestAnimationFrame(checkSecrets);
}
restart.addEventListener("click", newWalk);
// First click starts the supplied piano track and opens the short rules card.
openRules.addEventListener("click", () => {
  rulesDialog.classList.add("show");
  rulesDialog.setAttribute("aria-hidden", "false");
  introAudio.currentTime = 0;
  introAudio.play().catch(() => {});
});
// The second button enters the actual garden and switches from intro music to the random walk music.
beginWalk.addEventListener("click", () => {
  introAudio.pause();
  rulesDialog.classList.remove("show");
  rulesDialog.setAttribute("aria-hidden", "true");
  introScreen.classList.add("hide");
  soundWanted = true;
  updateSoundButton();
  newWalk();
});
updateBeam(); updateSoundButton(); newWalk(); checkSecrets();
