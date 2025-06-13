// --- Data ---

const GAMES = [
  {
    key: "wordle",
    title: "Wordle",
    price: 0,
    desc: "Errate das Wort",
    generator: getWordleWord,
    onePerDay: true,
  },
  {
    key: "emoji",
    title: "Emoji Quiz",
    price: 3,
    desc: "Emojis erraten",
    generator: getEmojiQuiz,
    onePerDay: true,
  },
  {
    key: "codeheist",
    title: "Code Heist",
    price: 9,
    desc: "Errate die Zahl",
    generator: getCodeHeist,
    onePerDay: true,
  },
  {
    key: "sudoku",
    title: "Sudoku",
    price: 9,
    desc: "6x6 Sudoku",
    generator: getSudoku,
    onePerDay: true,
  },
  {
    key: "guessnumber",
    title: "Guess the Number",
    price: 12,
    desc: "Zahl erraten",
    generator: getGuessNumber,
    onePerDay: true,
  },
  {
    key: "memorize",
    title: "Memorize",
    price: 12,
    desc: "Farbreihenfolge merken",
    generator: getMemorize,
    onePerDay: true,
  },
  {
    key: "coinfall",
    title: "Coin Fall",
    price: 21,
    desc: "Fange Münzen, vermeide Bomben",
    generator: getCoinFall,
    onePerDay: true,
  },
  {
    key: "typeracer",
    title: "Type Racer",
    price: 30,
    desc: "Text schnell abtippen",
    generator: getTypeRacer,
    onePerDay: true,
  },
  {
    key: "circle",
    title: "Draw a Perfect Circle",
    price: 30,
    desc: "Zeichne einen Kreis",
    generator: getDrawCircle,
    onePerDay: true,
  },
  {
    key: "wrongcolor",
    title: "Find The Wrong Color",
    price: 60,
    desc: "Finde die falsche Farbe",
    generator: getWrongColor,
    onePerDay: true,
  },
  {
    key: "tictactoe",
    title: "Tic Tac Toe",
    price: 60,
    desc: "Tic Tac Toe gegen KI",
    generator: getTicTacToe,
    onePerDay: true,
  },
  {
    key: "viergewinnt",
    title: "Vier gewinnt",
    price: 60,
    desc: "Vier gewinnt gegen KI",
    generator: getVierGewinnt,
    onePerDay: true,
  },
  {
    key: "flagquiz",
    title: "Flag Quiz",
    price: 69,
    desc: "Flagge erraten",
    generator: getFlagQuiz,
    onePerDay: true,
  },
  {
    key: "logoguessr",
    title: "Logo Guessr",
    price: 69,
    desc: "Logo erraten",
    generator: getLogoGuessr,
    onePerDay: true,
  },
  {
    key: "mazerunner",
    title: "Maze Runner",
    price: 72,
    desc: "Labyrinth meistern",
    generator: getMazeRunner,
    onePerDay: true,
  },
];

// --- LocalStorage helpers ---

function getProfile() {
  let pf = localStorage.getItem("dailyGamesProfile");
  if (!pf) {
    pf = {
      stars: 1000,
      unlocked: { wordle: true },
      highscores: {},
      daily: {},
      login: { last: "", streak: 0 },
    };
    localStorage.setItem("dailyGamesProfile", JSON.stringify(pf));
  } else {
    pf = JSON.parse(pf);
  }
  // Migrations
  if (!pf.unlocked) pf.unlocked = { wordle: true };
  if (!pf.highscores) pf.highscores = {};
  if (!pf.daily) pf.daily = {};
  if (!pf.login) pf.login = { last: "", streak: 0 };
  return pf;
}
function saveProfile(pf) {
  localStorage.setItem("dailyGamesProfile", JSON.stringify(pf));
}
// --- Login Streak logic ---
function handleLoginStreak() {
  let pf = getProfile();
  let now = new Date();
  let today = now.toISOString().slice(0, 10);
  let last = pf.login.last;
  let streak = pf.login.streak || 0;
  if (last !== today) {
    // Check if yesterday
    let y = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    if (last === y) {
      streak++;
    } else {
      streak = 1;
    }
    pf.stars += streak;
    pf.login = { last: today, streak };
    saveProfile(pf);
    showNotification(`Login-Serie: +${streak} ⭐`);
  }
  updateHeader();
}
function updateHeader() {
  let pf = getProfile();
  document.getElementById("stars").textContent = pf.stars;
  document.getElementById("login-streak").textContent = `Login-Serie: ${pf.login.streak} Tag${pf.login.streak === 1 ? "" : "e"}`;
}

// --- Menu / Unlock ---

function renderMenu() {
  let pf = getProfile();
  let menu = document.getElementById("games-menu");
  menu.innerHTML = "";
  for (let i = 0; i < GAMES.length; i += 2) {
    let row = document.createElement("div");
    row.style.display = "flex";
    row.style.width = "100%";
    row.style.gap = "1rem";
    for (let j = 0; j < 2; j++) {
      let g = GAMES[i + j];
      if (!g) break;
      let card = document.createElement("div");
      card.className = "game-card" + (pf.unlocked[g.key] ? "" : " locked");
      card.innerHTML = `
        <div class="game-title">${g.title}</div>
        <div class="game-price">${g.price > 0 && !pf.unlocked[g.key] ? g.price + " ⭐" : ""}</div>
        <div class="game-unlock">${pf.unlocked[g.key] ? "" : "🔒"}</div>
        <div class="game-highscore">Highscore: ${pf.highscores[g.key] ?? "-"}</div>
      `;
      if (!pf.unlocked[g.key]) {
        let buy = document.createElement("button");
        buy.className = "game-buy-btn";
        buy.textContent = "Freischalten";
        buy.onclick = () => unlockGame(g.key, g.price);
        card.appendChild(buy);
      } else {
        let play = document.createElement("button");
        play.className = "game-play-btn";
        play.textContent = "Spielen";
        play.onclick = () => showGame(g.key);
        // Can only play once per day
        if (g.onePerDay && pf.daily[g.key]?.date === todayISO()) play.disabled = true;
        card.appendChild(play);
      }
      row.appendChild(card);
    }
    menu.appendChild(row);
  }
}

function unlockGame(key, price) {
  let pf = getProfile();
  if (pf.unlocked[key]) return;
  if (pf.stars < price) {
    showNotification("Nicht genug Sterne!");
    return;
  }
  pf.stars -= price;
  pf.unlocked[key] = true;
  saveProfile(pf);
  updateHeader();
  renderMenu();
  showNotification("Spiel freigeschaltet!");
}

// --- Game Play ---

function showGame(key) {
  let pf = getProfile();
  let g = GAMES.find(x => x.key === key);
  if (!g) return;
  document.getElementById("games-menu").style.display = "none";
  let c = document.getElementById("game-container");
  c.innerHTML = "";
  c.classList.add("visible");
  document.getElementById("back-btn").classList.add("visible");
  // Only allow once per day
  if (g.onePerDay) {
    let today = todayISO();
    if (pf.daily[key]?.date === today) {
      c.innerHTML = `<div>Du hast dieses Spiel heute schon gespielt.<br>Neues Spiel ab 0 Uhr.</div>`;
      return;
    }
  }
  // Start game
  g.generator(c, key, pf);
}

document.getElementById("back-btn").onclick = () => {
  document.getElementById("games-menu").style.display = "flex";
  document.getElementById("game-container").classList.remove("visible");
  document.getElementById("back-btn").classList.remove("visible");
  renderMenu();
};

// --- Notification ---

function showNotification(msg) {
  let noti = document.createElement("div");
  noti.style.position = "fixed";
  noti.style.top = "17px";
  noti.style.left = "50%";
  noti.style.transform = "translateX(-50%)";
  noti.style.background = "#333";
  noti.style.color = "#fff";
  noti.style.fontSize = "1.1rem";
  noti.style.padding = "0.8rem 1.7rem";
  noti.style.borderRadius = "8px";
  noti.style.zIndex = 1001;
  noti.style.boxShadow = "0 2px 12px rgba(0,0,0,0.25)";
  noti.textContent = msg;
  document.body.appendChild(noti);
  setTimeout(() => noti.remove(), 2200);
}

// --- Utility ---

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function setHighscore(key, score) {
  let pf = getProfile();
  pf.highscores[key] = Math.max(score, pf.highscores[key] ?? 0);
  saveProfile(pf);
  updateHeader();
}
function finishGame(key, score, win) {
  let pf = getProfile();
  // Only once per day
  pf.daily[key] = { date: todayISO(), score, win: !!win };
  setHighscore(key, score);
  if (win) {
    pf.stars += 3;
    showNotification("+3 ⭐ für das Lösen!");
  }
  saveProfile(pf);
  updateHeader();
  renderMenu();
  setTimeout(() => document.getElementById("back-btn").click(), 1800);
}

// --- Word Lists & Data ---

const WORDLE_WORDS = shuffle([
  "apfel","banane","katze","tisch","stuhl","lampe","hosen","sonne","wolke","fisch",
  "brot","milch","kaese","auto","radar","radio","papst","blume","hemd","glas","ofen",
  "kabel","kerze","pizza","nudel","honig","stahl","suppe","messer","gabel","lachs",
  "sanduhr","regen","fluss","insel","palme","tiger","adler","weide","birne","birke",
  "zebra","karre","krone","fuchs","wurst","kerze","sturm","schaf","hund","ente"
]);
let _wordleIdx = getDailyRandomIdx("wordle", WORDLE_WORDS.length);

const EMOJI_QUIZ = shuffle([
  {q: "🌍🦍", a: "planet der affen"}, {q: "🍕🍽️", a: "pizza essen"},
  {q: "🐍🥚", a: "schlangenei"}, {q: "👑🦁", a: "könig der löwen"},
  {q: "🐟🍟", a: "fisch und chips"}, {q: "🧊🏔️", a: "eisberg"},
  {q: "🎩🪄", a: "zauberhut"}, {q: "🍎🍏", a: "apfel und birne"},
  {q: "🎬🍿", a: "kino"}, {q: "🚗💨", a: "schnelles auto"},
  {q: "🌞😎", a: "sonnig"}, {q: "🐘🚿", a: "duschender elefant"},
  {q: "🦄🌈", a: "einhorn"}, {q: "🐇🎩", a: "hase im hut"},
  {q: "🦆🦢", a: "vögel"}, {q: "🌭🍔", a: "fast food"},
  {q: "🗺️🔍", a: "schatzsuche"}, {q: "🕷️🕸️", a: "spinnennetz"},
  {q: "🥚🐣", a: "ei und kücken"}, {q: "🍞🧀", a: "käsebrot"},
  {q: "🐧❄️", a: "pinguin"}, {q: "🐻‍❄️☃️", a: "eisbär"}, {q: "🐲🔥", a: "drache"},
  {q: "🍺🍻", a: "bier"}, {q: "🍇🍷", a: "wein"}, {q: "🍫🍦", a: "dessert"},
  {q: "🍔🍟", a: "burger und pommes"}, {q: "🐝🍯", a: "honigbiene"},
  {q: "🚲🏁", a: "radrennen"}, {q: "🎤🎧", a: "musik"}, {q: "📚📝", a: "lernen"},
  {q: "🎮👾", a: "videospiel"}, {q: "✈️🌎", a: "reisen"},
  {q: "👨‍🍳👩‍🍳", a: "kochen"}, {q: "🏆🥇", a: "gewinner"},
  {q: "🐔🍗", a: "hähnchen"}, {q: "🐳🌊", a: "wal im meer"},
  {q: "🥦🥕", a: "gemüse"}, {q: "🍰🎂", a: "kuchen"},
  {q: "🦸‍♂️🦸‍♀️", a: "superhelden"}, {q: "🎅🎁", a: "weihnachten"},
  {q: "🐉🎆", a: "drachenfest"}, {q: "🌹🌷", a: "blumen"},
  {q: "🐺🌕", a: "werwolf"}, {q: "🦉🌙", a: "eule bei nacht"},
  {q: "🎸🎤", a: "rockband"}, {q: "🏖️🌴", a: "strandurlaub"},
  {q: "🍿🎥", a: "film"}, {q: "🎂🎉", a: "geburtstag"}
]);

const TYPE_RACER_TEXTS = shuffle([
  "Schnell wie der Blitz tippte er den Satz.",
  "Die Sonne scheint heute besonders hell.",
  "Ein perfekter Tag für ein neues Spiel.",
  "Programmieren macht mit Freunden mehr Spaß.",
  "Der Sommer kommt mit großen Schritten.",
  "Das Leben ist wie ein Puzzle, jedes Teil zählt.",
  "Wer früh aufsteht, fängt den Wurm.",
  "Übung macht den Meister.",
  "Täglich ein Spiel hält den Kopf fit.",
  "Mit Geduld kommt man ans Ziel.",
  "Ein Lächeln kostet nichts.",
  "Jeder Tag ist eine neue Chance.",
  "Gemeinsam sind wir stark.",
  "Die beste Zeit ist jetzt.",
  "Man lernt nie aus.",
  "Wissen ist Macht.",
  "Gib niemals auf.",
  "Träume groß und arbeite hart.",
  "Erfolg ist kein Zufall.",
  "Zeit ist kostbar.",
  "Lachen ist die beste Medizin.",
  "Sei mutig und neugierig.",
  "Nichts ist unmöglich.",
  "Genieße den Moment.",
  "Freunde sind das Beste am Leben.",
  "Neue Herausforderungen machen Spaß.",
  "Kreativität kennt keine Grenzen.",
  "Spielend lernen macht Freude.",
  "Probleme sind zum Lösen da.",
  "Jeder fängt mal klein an.",
  "Zusammen macht alles mehr Spaß.",
  "Versuch macht klug.",
  "Erfolg beginnt mit dem ersten Schritt.",
  "Das Ziel ist der Weg.",
  "Manchmal ist weniger mehr.",
  "Gute Laune ist ansteckend.",
  "Schritt für Schritt zum Ziel.",
  "Die Zukunft beginnt heute.",
  "Vertrauen ist wichtig.",
  "Man wächst mit seinen Aufgaben.",
  "Neugier ist der Anfang von allem.",
  "Jede Reise beginnt mit einem Schritt.",
  "Selbst kleine Erfolge zählen.",
  "Spaß ist die beste Motivation.",
  "Worte können Wunder wirken.",
  "Jeder Tag ist ein Geschenk.",
  "Auch Fehler bringen einen weiter.",
  "Aufgeben ist keine Option.",
  "Der Weg ist das Ziel.",
  "Jeder ist seines Glückes Schmied."
]);

const FLAG_QUIZ = shuffle([
  ["Deutschland", "🇩🇪"], ["Frankreich", "🇫🇷"], ["Italien", "🇮🇹"], ["Spanien", "🇪🇸"], ["Portugal", "🇵🇹"], ["Schweiz", "🇨🇭"], ["Österreich", "🇦🇹"],
  ["Griechenland", "🇬🇷"], ["Niederlande", "🇳🇱"], ["Belgien", "🇧🇪"], ["Schweden", "🇸🇪"], ["Norwegen", "🇳🇴"], ["Finnland", "🇫🇮"], ["Dänemark", "🇩🇰"],
  ["England", "🇬🇧"], ["Irland", "🇮🇪"], ["Polen", "🇵🇱"], ["Tschechien", "🇨🇿"], ["Russland", "🇷🇺"], ["USA", "🇺🇸"], ["Kanada", "🇨🇦"], ["Brasilien", "🇧🇷"],
  ["Argentinien", "🇦🇷"], ["Australien", "🇦🇺"], ["Neuseeland", "🇳🇿"], ["Japan", "🇯🇵"], ["China", "🇨🇳"], ["Südkorea", "🇰🇷"], ["Indien", "🇮🇳"],
  ["Türkei", "🇹🇷"], ["Mexiko", "🇲🇽"], ["Ägypten", "🇪🇬"], ["Südafrika", "🇿🇦"], ["Marokko", "🇲🇦"], ["Saudi-Arabien", "🇸🇦"], ["Vereinigte Arabische Emirate", "🇦🇪"],
  ["Singapur", "🇸🇬"], ["Thailand", "🇹🇭"], ["Vietnam", "🇻🇳"], ["Indonesien", "🇮🇩"], ["Malaysia", "🇲🇾"], ["Philippinen", "🇵🇭"], ["Pakistan", "🇵🇰"],
  ["Bangladesch", "🇧🇩"], ["Nigeria", "🇳🇬"], ["Kenia", "🇰🇪"], ["Tansania", "🇹🇿"], ["Chile", "🇨🇱"], ["Peru", "🇵🇪"]
]);

const LOGO_GUESSR = shuffle([
  {img:"https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", ans:"microsoft"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/5/51/Google.png", ans:"google"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/2f/Instagram_logo.svg", ans:"instagram"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg", ans:"twitter"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/0/08/YouTube_social_white_squircle_%282017%29.svg", ans:"youtube"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/6b/Wikipedia-logo-v2.svg", ans:"wikipedia"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/6e/Facebook_Logo_2023.png", ans:"facebook"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png", ans:"netflix"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/7/7e/DHL_Logo.svg", ans:"dhl"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/5/56/Adidas_Logo.svg", ans:"adidas"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/9/9b/McDonalds-Logo.svg", ans:"mcdonalds"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/1/19/Coca-Cola_logo.svg", ans:"coca cola"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/0/0e/Nike%2C_Inc.-Logo.svg", ans:"nike"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/24/Spotify_logo_with_text.svg", ans:"spotify"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/4/47/Apple_logo_black.svg", ans:"apple"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/a/a6/Amazon_logo.svg", ans:"amazon"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/6b/Pepsi_logo.svg", ans:"pepsi"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/7/78/Volkswagen_logo_2019.svg", ans:"volkswagen"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/0/02/Samsung_Logo.svg", ans:"samsung"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/3/3a/PlayStation_logo.svg", ans:"playstation"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/5/5e/Tesla_Motors.svg", ans:"tesla"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/6e/Red_Bull_logo.svg", ans:"red bull"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/1/14/Starbucks_Coffee_Logo.svg", ans:"starbucks"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/6b/BMW_logo_%282020%29.svg", ans:"bmw"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/2c/Puma_logo.svg", ans:"puma"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/2c/LinkedIn_logo_initials.png", ans:"linkedin"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/7/7f/Deutsche_Bahn_AG-Logo.svg", ans:"deutsche bahn"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/9/92/Lufthansa_Logo_2018.svg", ans:"lufthansa"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/1/1f/Vodafone_2017_logo.svg", ans:"vodafone"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/3/3e/Twitch_Logo.svg", ans:"twitch"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/69/Siemens-logo.svg", ans:"siemens"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/b/b4/Deutsche_Post_DHL_Group_logo.svg", ans:"deutsche post"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/26/Mercedes-Benz_logo_2010.svg", ans:"mercedes"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/6e/SAP-Logo.svg", ans:"sap"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/1/1e/Commerzbank_logo_2019.svg", ans:"commerzbank"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/6/6c/Deutsche_Telekom_2013_logo.svg", ans:"telekom"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/8/8e/Aldi_Nord_Logo.svg", ans:"aldi"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/8/8e/Lidl-Logo.svg", ans:"lidl"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/4/4f/Edeka-Logo.svg", ans:"edeka"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/21/REWE_Logo.svg", ans:"rewe"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/a/a0/OBI_Logo.svg", ans:"obi"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/7/74/Real_logo.svg", ans:"real"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/9/90/Bosch-Logo.svg", ans:"bosch"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/23/Volksbank_logo.svg", ans:"volksbank"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/9/98/Sparkasse_logo.svg", ans:"sparkasse"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/2/24/Kaufland-Logo.svg", ans:"kaufland"},
  {img:"https://upload.wikimedia.org/wikipedia/commons/4/4d/Penny_Logo.svg", ans:"penny"}
]);

// --- Helper for daily random index ---
function getDailyRandomIdx(key, len) {
  let today = todayISO();
  let pf = getProfile();
  if (!pf.dailyIdx) pf.dailyIdx = {};
  if (!pf.dailyIdx[key] || pf.dailyIdx[key]?.date !== today) {
    let prev = pf.dailyIdx[key]?.idx ?? -1;
    let idx;
    do {
      idx = Math.floor(Math.random() * len);
    } while (len > 1 && idx === prev);
    pf.dailyIdx[key] = { date: today, idx };
    saveProfile(pf);
  }
  return pf.dailyIdx[key].idx;
}
function shuffle(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Game Implementations ---
// 1. WORDLE
function getWordleWord(container, key, pf) {
  let word = WORDLE_WORDS[getDailyRandomIdx("wordle", WORDLE_WORDS.length)];
  let tries = 6, letters = word.length;
  let guesses = [];
  container.innerHTML = `<h3>Wordle (${letters} Buchstaben)</h3>
    <div id="wordle-board"></div>
    <form id="wordle-form">
      <input type="text" id="wordle-input" maxlength="${letters}" minlength="${letters}" autocomplete="off" autofocus style="text-transform:lowercase" placeholder="${"_".repeat(letters)}">
      <button type="submit">OK</button>
    </form>
    <div id="wordle-hint"></div>
  `;
  let board = container.querySelector("#wordle-board"), hint = container.querySelector("#wordle-hint");
  container.querySelector("#wordle-form").onsubmit = (e) => {
    e.preventDefault();
    let guess = container.querySelector("#wordle-input").value.toLowerCase();
    if (guess.length !== letters) {
      hint.textContent = "Bitte alle Buchstaben eingeben.";
      return;
    }
    guesses.push(guess);
    let row = "";
    for (let i = 0; i < letters; i++) {
      let c = guess[i], style = "";
      if (word[i] === c) style = "background:#7cfc98;color:#222;";
      else if (word.includes(c)) style = "background:#ffe066;color:#222;";
      else style = "background:#dedede;color:#888;";
      row += `<span style="display:inline-block;width:2ch;margin:0 1.5px;padding:2px 0;border-radius:4px;${style};font-weight:bold;text-align:center;">${c.toUpperCase()}</span>`;
    }
    board.innerHTML += `<div>${row}</div>`;
    if (guess === word) {
      hint.innerHTML = `Richtig! Das Wort war <b>${word.toUpperCase()}</b>`;
      finishGame(key, tries - guesses.length + 1, true);
      container.querySelector("#wordle-form").style.display = "none";
    } else if (guesses.length >= tries) {
      hint.innerHTML = `Leider verloren! Das Wort war <b>${word.toUpperCase()}</b>`;
      finishGame(key, 0, false);
      container.querySelector("#wordle-form").style.display = "none";
    } else {
      hint.textContent = `${tries - guesses.length} Versuche übrig.`;
    }
    container.querySelector("#wordle-input").value = "";
  };
}

// 2. EMOJI QUIZ
function getEmojiQuiz(container, key, pf) {
  let idx = getDailyRandomIdx("emoji", EMOJI_QUIZ.length);
  let {q, a} = EMOJI_QUIZ[idx];
  container.innerHTML = `<h3>Emoji Quiz</h3>
    <div style="font-size:2.3rem;text-align:center;">${q}</div>
    <form id="emoji-form">
      <input type="text" id="emoji-input" autocomplete="off" autofocus placeholder="Antwort">
      <button type="submit">OK</button>
    </form>
    <div id="emoji-hint"></div>
  `;
  container.querySelector("#emoji-form").onsubmit = (e) => {
    e.preventDefault();
    let user = container.querySelector("#emoji-input").value.toLowerCase().trim();
    if (user === a) {
      container.querySelector("#emoji-hint").textContent = "Richtig!";
      finishGame(key, 1, true);
    } else {
      container.querySelector("#emoji-hint").textContent = "Leider falsch. Die richtige Antwort war: " + a;
      finishGame(key, 0, false);
    }
  };
}

// 3. CODE HEIST (Zahlen-Wordle)
function getCodeHeist(container, key, pf) {
  let code = String(Math.floor(1000 + Math.random() * 9000));
  let tries = 6, guesses = [];
  container.innerHTML = `<h3>Code Heist (4-stellige Zahl)</h3>
    <div id="heist-board"></div>
    <form id="heist-form">
      <input type="number" id="heist-input" min="1000" max="9999" autocomplete="off" autofocus placeholder="Zahl eingeben">
      <button type="submit">OK</button>
    </form>
    <div id="heist-hint"></div>
  `;
  let board = container.querySelector("#heist-board"), hint = container.querySelector("#heist-hint");
  container.querySelector("#heist-form").onsubmit = (e) => {
    e.preventDefault();
    let guess = container.querySelector("#heist-input").value;
    if (guess.length !== 4) {
      hint.textContent = "Bitte 4-stellige Zahl.";
      return;
    }
    guesses.push(guess);
    let row = "";
    for (let i = 0; i < 4; i++) {
      let c = guess[i], style = "";
      if (code[i] === c) style = "background:#7cfc98;color:#222;";
      else if (code.includes(c)) style = "background:#ffe066;color:#222;";
      else style = "background:#dedede;color:#888;";
      row += `<span style="display:inline-block;width:2ch;margin:0 1.5px;padding:2px 0;border-radius:4px;${style};font-weight:bold;text-align:center;">${c}</span>`;
    }
    board.innerHTML += `<div>${row}</div>`;
    if (guess === code) {
      hint.textContent = "Code geknackt!";
      finishGame(key, tries - guesses.length + 1, true);
      container.querySelector("#heist-form").style.display = "none";
    } else if (guesses.length >= tries) {
      hint.textContent = `Game Over! Code war: ${code}`;
      finishGame(key, 0, false);
      container.querySelector("#heist-form").style.display = "none";
    } else {
      hint.textContent = `${tries - guesses.length} Versuche übrig.`;
    }
    container.querySelector("#heist-input").value = "";
  };
}

// 4. SUDOKU
function getSudoku(container, key, pf) {
  let {board, solution} = generateSudoku6x6();
  let html = `<h3>Sudoku 6x6</h3>
    <table id="sudoku-table" style="margin:auto;border-collapse:collapse;">`;
  for (let r = 0; r < 6; r++) {
    html += "<tr>";
    for (let c = 0; c < 6; c++) {
      html += `<td style="border:1px solid #aaa;padding:4px;">
        <input type="number" min="1" max="6" style="width:2.2em;text-align:center;" value="${board[r][c]||""}" ${(board[r][c]) ? "readonly" : "" } data-row="${r}" data-col="${c}">
      </td>`;
    }
    html += "</tr>";
  }
  html += `</table>
    <button id="sudoku-submit" style="margin-top:1rem;">Fertig!</button>
    <div id="sudoku-hint"></div>
  `;
  container.innerHTML = html;
  container.querySelector("#sudoku-submit").onclick = () => {
    let ok = true;
    let user = [];
    for (let r = 0; r < 6; r++) {
      user[r] = [];
      for (let c = 0; c < 6; c++) {
        let v = container.querySelector(`input[data-row="${r}"][data-col="${c}"]`).value;
        if (!v || v < 1 || v > 6) ok = false;
        user[r][c] = +v;
      }
    }
    if (!ok) {
      container.querySelector("#sudoku-hint").textContent = "Bitte alle Felder korrekt ausfüllen.";
      return;
    }
    if (JSON.stringify(user) === JSON.stringify(solution)) {
      container.querySelector("#sudoku-hint").textContent = "Richtig gelöst!";
      finishGame(key, 1, true);
    } else {
      container.querySelector("#sudoku-hint").textContent = "Leider falsch!";
      finishGame(key, 0, false);
    }
  };
}
function generateSudoku6x6() {
  // Generate a random valid 6x6 sudoku by backtracking, remove random cells
  let sol = Array.from({length:6},()=>Array(6).fill(0));
  let nums = [1,2,3,4,5,6];
  function fill(r=0,c=0) {
    if (r === 6) return true;
    let nextR = c===5 ? r+1 : r, nextC = c===5 ? 0 : c+1;
    let s = shuffle(nums);
    for (let n of s) {
      if (sol[r].includes(n)) continue;
      if (sol.some(row=>row[c]===n)) continue;
      let box = Math.floor(r/2)*2+Math.floor(c/3);
      let boxSet = [];
      for(let i=0;i<2;i++)for(let j=0;j<3;j++)boxSet.push(sol[Math.floor(r/2)*2+i][Math.floor(c/3)*3+j]);
      if (boxSet.includes(n)) continue;
      sol[r][c]=n;
      if (fill(nextR,nextC)) return true;
      sol[r][c]=0;
    }
    return false;
  }
  fill();
  let puzzle = sol.map(r=>r.slice());
  // Remove 10-14 random cells
  let cells = [];
  for (let r=0;r<6;r++) for (let c=0;c<6;c++) cells.push([r,c]);
  shuffle(cells).slice(0,Math.floor(10+Math.random()*5)).forEach(([r,c])=>puzzle[r][c]=0);
  return {board:puzzle,solution:sol};
}

// 5. GUESS THE NUMBER
function getGuessNumber(container, key, pf) {
  let num = Math.floor(1 + Math.random() * 100);
  let tries = 7;
  let guessCnt = 0;
  container.innerHTML = `<h3>Guess the Number (1-100)</h3>
    <form id="guess-form">
      <input type="number" id="guess-input" min="1" max="100" autocomplete="off" autofocus placeholder="Zahl">
      <button type="submit">OK</button>
    </form>
    <div id="guess-hint"></div>
  `;
  container.querySelector("#guess-form").onsubmit = (e) => {
    e.preventDefault();
    let v = +container.querySelector("#guess-input").value;
    guessCnt++;
    if (v === num) {
      container.querySelector("#guess-hint").textContent = `Richtig! Die Zahl war ${num}`;
      finishGame(key, tries-guessCnt+1, true);
    } else if (guessCnt >= tries) {
      container.querySelector("#guess-hint").textContent = `Leider verloren! Die Zahl war ${num}`;
      finishGame(key, 0, false);
    } else {
      container.querySelector("#guess-hint").textContent = v < num ? "Zu niedrig." : "Zu hoch.";
    }
    container.querySelector("#guess-input").value = "";
  };
}

// 6. MEMORIZE (Simon Game)
function getMemorize(container, key, pf) {
  let colors = ["red", "yellow", "blue", "green"];
  let seq = [];
  for (let i=0;i<5+Math.floor(Math.random()*3);i++) seq.push(colors[Math.floor(Math.random()*4)]);
  let step = 0, user = [], mode="show";
  container.innerHTML = `<h3>Memorize</h3>
    <div id="mem-seq" style="display:flex;gap:1rem;justify-content:center;"></div>
    <div id="mem-buttons" style="display:flex;gap:1rem;justify-content:center;margin:1rem 0;">
      ${colors.map(c=>`<button style="width:3rem;height:3rem;background:${c};border:none;border-radius:50%;" data-color="${c}"></button>`).join("")}
    </div>
    <div id="mem-hint"></div>
  `;
  let seqDiv = container.querySelector("#mem-seq");
  let hint = container.querySelector("#mem-hint");
  let btns = container.querySelectorAll('#mem-buttons button');
  function showSeq(idx=0) {
    mode = "show";
    btns.forEach(b=>b.disabled=true);
    if (idx < seq.length) {
      seqDiv.innerHTML = "";
      for (let i=0;i<=idx;i++) {
        seqDiv.innerHTML += `<span style="display:inline-block;width:2.5rem;height:2.5rem;background:${seq[i]};border-radius:50%;margin:0 3px;box-shadow:0 2px 8px #999;"></span>`;
      }
      setTimeout(()=>showSeq(idx+1), 700);
    } else {
      setTimeout(()=>{
        seqDiv.innerHTML = `<span style="color:#777;">Jetzt bist du dran!</span>`;
        mode = "input";
        btns.forEach(b=>b.disabled=false);
        user = [];
      }, 700);
    }
  }
  btns.forEach(b=>b.onclick = () => {
    if (mode!=="input") return;
    user.push(b.dataset.color);
    // Animate
    b.style.transform="scale(1.2)";
    setTimeout(()=>b.style.transform="",180);
    if (user[user.length-1] !== seq[user.length-1]) {
      hint.textContent = "Leider falsch!";
      finishGame(key, user.length-1, false);
      btns.forEach(x=>x.disabled=true);
      return;
    }
    if (user.length === seq.length) {
      hint.textContent = "Richtig!";
      finishGame(key, seq.length, true);
      btns.forEach(x=>x.disabled=true);
      return;
    }
  });
  showSeq(0);
}

// 7. COIN FALL
function getCoinFall(container, key, pf) {
  let score = 0, running = true, interval;
  const width = 7, height = 10;
  let item = newItem();
  let field = Array.from({length:height},()=>Array(width).fill(""));
  container.innerHTML = `<h3>Coin Fall</h3>
    <div id="cf-board" style="display:grid;grid-template-columns:repeat(${width},2.2rem);grid-gap:2px;margin:auto;"></div>
    <div id="cf-hint"></div>
  `;
  let board = container.querySelector("#cf-board");
  let hint = container.querySelector("#cf-hint");
  function draw() {
    let out = "";
    for (let y=0;y<height;y++)for(let x=0;x<width;x++) {
      let icon = field[y][x];
      out += `<div style="width:2.2rem;height:2.2rem;display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;background:#f0f0f0;border-radius:7px;border:1.5px solid #ccc;">${icon||""}</div>`;
    }
    // Draw falling item
    out = out.split("");
    let idx = item.y*width+item.x;
    out[idx] = `<div style="width:2.2rem;height:2.2rem;display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;background:#fffbe6;border-radius:7px;border:2px solid #a6c93b;">${item.type==="coin"?"🪙":"💣"}</div>`;
    board.innerHTML = out.join("");
    hint.textContent = "Score: "+score;
  }
  function move(dx) {
    if (!running) return;
    let nx = item.x+dx;
    if (nx>=0 && nx<width) item.x=nx;
    draw();
  }
  function tick() {
    if (!running) return;
    if (item.y+1 >= height) {
      if (item.type==="coin") score++;
      else {
        running=false;
        hint.textContent = `Game Over! Score: ${score}`;
        finishGame(key, score, score>0);
        clearInterval(interval);
        return;
      }
      item = newItem();
    } else item.y++;
    draw();
  }
  function newItem() {
    return {x:Math.floor(Math.random()*width),y:0,type:Math.random()<0.8?"coin":"bomb"};
  }
  document.addEventListener("keydown",onKey);
  function onKey(e) {
    if (!running) return;
    if (e.key==="ArrowLeft") move(-1);
    if (e.key==="ArrowRight") move(1);
  }
  board.onclick = e => {
    let rect = board.getBoundingClientRect();
    let mx = (e.clientX-rect.left)/rect.width;
    if (mx < 0.5) move(-1); else move(1);
  };
  interval = setInterval(tick, 700);
  draw();
  container._cleanup = () => {
    running = false;
    clearInterval(interval);
    document.removeEventListener("keydown",onKey);
  };
}

// 8. TYPE RACER
function getTypeRacer(container, key, pf) {
  let idx = getDailyRandomIdx("typeracer", TYPE_RACER_TEXTS.length);
  let target = TYPE_RACER_TEXTS[idx];
  let start, end;
  container.innerHTML = `<h3>Type Racer</h3>
    <div style="margin-bottom:1rem;font-size:1.2rem;border:1px solid #ccc;border-radius:7px;padding:1rem;background:#faf7f3;">${target}</div>
    <form id="type-form">
      <textarea id="type-input" rows="2" style="width:99%;" autocomplete="off" autofocus placeholder="Abschreiben..."></textarea>
      <button type="submit">Fertig</button>
    </form>
    <div id="type-hint"></div>
  `;
  let input = container.querySelector("#type-input");
  input.onfocus = () => { if (!start) start = Date.now(); };
  container.querySelector("#type-form").onsubmit = (e) => {
    e.preventDefault();
    end = Date.now();
    let v = input.value;
    if (v !== target) {
      container.querySelector("#type-hint").textContent = "Der Text stimmt nicht!";
      finishGame(key, 0, false);
    } else {
      let secs = ((end-start)/1000).toFixed(2);
      container.querySelector("#type-hint").textContent = `Richtig! Zeit: ${secs}s`;
      finishGame(key, Math.max(0,Math.floor(100-secs)), true);
    }
  };
}

// 9. DRAW CIRCLE
function getDrawCircle(container, key, pf) {
  container.innerHTML = `<h3>Draw a Perfect Circle</h3>
    <canvas id="circle-canvas" style="background:#f0f0f0;border-radius:50%;border:1.5px solid #ccc;touch-action:none;" width="280" height="280"></canvas>
    <div>
      <button id="circle-finish">Werten</button>
      <button id="circle-clear">Löschen</button>
    </div>
    <div id="circle-hint"></div>
  `;
  let canvas = container.querySelector("#circle-canvas"), ctx = canvas.getContext("2d");
  let drawing = false, points = [];
  canvas.onpointerdown = e => {
    drawing = true; points = [];
    ctx.clearRect(0,0,280,280);
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    points.push([e.offsetX, e.offsetY]);
  };
  canvas.onpointermove = e => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = "#1976d2";
    ctx.lineWidth = 3;
    ctx.stroke();
    points.push([e.offsetX, e.offsetY]);
  };
  canvas.onpointerup = e => { drawing = false; };
  container.querySelector("#circle-clear").onclick = ()=> {
    ctx.clearRect(0,0,280,280); points=[];
    container.querySelector("#circle-hint").textContent = "";
  };
  container.querySelector("#circle-finish").onclick = ()=>{
    if (points.length < 20) {
      container.querySelector("#circle-hint").textContent = "Bitte einen Kreis zeichnen!";
      return;
    }
    // Evaluate circle: center, radius, variance
    let xs = points.map(p=>p[0]), ys = points.map(p=>p[1]);
    let cx = xs.reduce((a,b)=>a+b,0)/xs.length;
    let cy = ys.reduce((a,b)=>a+b,0)/ys.length;
    let r = points.map(p=>Math.hypot(p[0]-cx,p[1]-cy)).reduce((a,b)=>a+b,0)/points.length;
    let score = Math.sqrt(points.map(p=>Math.pow(Math.hypot(p[0]-cx,p[1]-cy)-r,2)).reduce((a,b)=>a+b,0)/points.length);
    let percent = Math.max(0,100-Math.floor(score*2));
    container.querySelector("#circle-hint").textContent = `Kreis-Qualität: ${percent}%`;
    finishGame(key, percent, percent>70);
  };
}

// 10. FIND THE WRONG COLOR
function getWrongColor(container, key, pf) {
  let base = Math.floor(Math.random()*180)+40;
  let diff = 20+Math.floor(Math.random()*15);
  let grid = [];
  let right = Math.floor(Math.random()*16);
  for (let i=0;i<16;i++) grid.push(i===right?base+diff:base);
  container.innerHTML = `<h3>Find The Wrong Color</h3>
    <div style="display:grid;grid-template-columns:repeat(4,40px);grid-gap:8px;margin:auto;">${
      grid.map((v,i)=>`<div class="wrongcolor-cell" style="width:40px;height:40px;border-radius:7px;background:hsl(40,70%,${v}%);cursor:pointer;" data-idx="${i}"></div>`).join("")
    }</div>
    <div id="wrongcolor-hint"></div>
  `;
  container.querySelectorAll(".wrongcolor-cell").forEach(cell=>{
    cell.onclick = ()=>{
      if (+cell.dataset.idx === right) {
        container.querySelector("#wrongcolor-hint").textContent = "Richtig!";
        finishGame(key, 1, true);
      } else {
        container.querySelector("#wrongcolor-hint").textContent = "Leider falsch!";
        finishGame(key, 0, false);
      }
    };
  });
}

// 11. TIC TAC TOE
function getTicTacToe(container, key, pf) {
  let board = Array(9).fill("");
  let player = "X", ai = "O", over=false;
  container.innerHTML = `<h3>Tic Tac Toe</h3>
    <div id="ttt-board" style="display:grid;grid-template-columns:repeat(3,50px);grid-gap:6px;margin:auto;"></div>
    <div id="ttt-hint"></div>
  `;
  let ttt = container.querySelector("#ttt-board");
  let hint = container.querySelector("#ttt-hint");
  function render() {
    ttt.innerHTML = "";
    for (let i=0;i<9;i++) {
      ttt.innerHTML += `<div class="ttt-cell" style="width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#f0f0f0;border-radius:10px;cursor:pointer;border:2px solid #aaa;" data-idx="${i}">${board[i]}</div>`;
    }
    container.querySelectorAll(".ttt-cell").forEach(cell=>{
      cell.onclick = ()=>{
        if (over || board[cell.dataset.idx]) return;
        board[cell.dataset.idx]=player;
        check();
        if (!over) aiMove();
      };
    });
  }
  function aiMove() {
    // Simple AI: win > block > random
    let win = canWin(ai), block = canWin(player);
    let idx = win ?? block ?? board.findIndex(x=>!x);
    if (idx>=0) board[idx]=ai;
    check();
  }
  function canWin(p) {
    let lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let l of lines) {
      let vals = l.map(i=>board[i]);
      if (vals.filter(x=>x===p).length===2 && vals.includes("")) return l[vals.indexOf("")];
    }
    return null;
  }
  function check() {
    let lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let l of lines) {
      if (l.every(i=>board[i]==="X")) { hint.textContent="Du hast gewonnen!"; finishGame(key, 1, true); over=true; return;}
      if (l.every(i=>board[i]==="O")) { hint.textContent="KI gewinnt!"; finishGame(key, 0, false); over=true; return;}
    }
    if (board.every(x=>x)) { hint.textContent="Unentschieden!"; finishGame(key, 0, false); over=true; }
    render();
  }
  render();
}

// 12. VIER GEWINNT
function getVierGewinnt(container, key, pf) {
  let rows=6,cols=7, board=Array.from({length:rows},()=>Array(cols).fill(0)), over=false;
  container.innerHTML = `<h3>Vier gewinnt</h3>
    <div id="vg-board" style="display:grid;grid-template-columns:repeat(7,42px);grid-gap:3px;margin:auto;"></div>
    <div id="vg-hint"></div>
  `;
  let vg = container.querySelector("#vg-board");
  let hint = container.querySelector("#vg-hint");
  function render() {
    vg.innerHTML = "";
    for (let r=0;r<rows;r++)for(let c=0;c<cols;c++)
      vg.innerHTML += `<div class="vg-cell" style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:#e0e0e0;border-radius:50%;border:1.5px solid #aaa;cursor:pointer;" data-col="${c}">${board[r][c]===1?"🔴":board[r][c]===2?"🟡":""}</div>`;
    container.querySelectorAll(".vg-cell").forEach(cell=>{
      cell.onclick = ()=>{
        if (over) return;
        let c=+cell.dataset.col;
        let r=rows-1; while(r>=0 && board[r][c]) r--;
        if (r<0) return;
        board[r][c]=1;
        if (check(1)) { hint.textContent="Du hast gewonnen!"; finishGame(key, 1, true); over=true; return;}
        aiMove();
        if (check(2)) { hint.textContent="KI gewinnt!"; finishGame(key, 0, false); over=true; return;}
        if (board[0].every(x=>x)) { hint.textContent="Unentschieden!"; finishGame(key, 0, false); over=true;}
        render();
      };
    });
  }
  function aiMove() {
    // Simple AI: win > block > random
    let moves=[];
    for(let c=0;c<cols;c++){let r=rows-1;while(r>=0&&board[r][c])r--;if(r>=0)moves.push([r,c]);}
    shuffle(moves);
    for (let [r,c] of moves) {
      board[r][c]=2; if (check(2)) return; board[r][c]=0;
    }
    for (let [r,c] of moves) {
      board[r][c]=1; if (check(1)) { board[r][c]=2; return;} board[r][c]=0;
    }
    let move=moves[0]; if (move) board[move[0]][move[1]]=2;
  }
  function check(v) {
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(board[r][c]===v)
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)
        if([0,1,2,3].every(i=>board[r+dr*i]?.[c+dc*i]===v))return true;
    return false;
  }
  render();
}

// 13. FLAG QUIZ
function getFlagQuiz(container, key, pf) {
  let idx = getDailyRandomIdx("flagquiz", FLAG_QUIZ.length);
  let [name, flag] = FLAG_QUIZ[idx];
  container.innerHTML = `<h3>Flag Quiz</h3>
    <div style="font-size:4rem;text-align:center;">${flag}</div>
    <form id="flag-form">
      <input type="text" id="flag-input" autocomplete="off" autofocus placeholder="Land eingeben">
      <button type="submit">OK</button>
    </form>
    <div id="flag-hint"></div>
  `;
  container.querySelector("#flag-form").onsubmit = (e) => {
    e.preventDefault();
    let user = container.querySelector("#flag-input").value.toLowerCase().replace(/[\s\-]/g,"");
    let sol = name.toLowerCase().replace(/[\s\-]/g,"");
    if (user === sol) {
      container.querySelector("#flag-hint").textContent = "Richtig!";
      finishGame(key, 1, true);
    } else {
      container.querySelector("#flag-hint").textContent = "Leider falsch! Die Antwort war: "+name;
      finishGame(key, 0, false);
    }
  };
}

// 14. LOGO GUESSR
function getLogoGuessr(container, key, pf) {
  let idx = getDailyRandomIdx("logoguessr", LOGO_GUESSR.length);
  let data = LOGO_GUESSR[idx];
  container.innerHTML = `<h3>Logo Guessr</h3>
    <div style="margin:1rem auto;text-align:center;"><img src="${data.img}" alt="Logo" style="height:60px;max-width:130px;object-fit:contain;"></div>
    <form id="logo-form">
      <input type="text" id="logo-input" autocomplete="off" autofocus placeholder="Marke/Firma">
      <button type="submit">OK</button>
    </form>
    <div id="logo-hint"></div>
  `;
  container.querySelector("#logo-form").onsubmit = (e) => {
    e.preventDefault();
    let user = container.querySelector("#logo-input").value.toLowerCase().replace(/\s/g,"");
    let sol = data.ans.toLowerCase().replace(/\s/g,"");
    if (user === sol) {
      container.querySelector("#logo-hint").textContent = "Richtig!";
      finishGame(key, 1, true);
    } else {
      container.querySelector("#logo-hint").textContent = "Leider falsch! Die Antwort war: "+data.ans;
      finishGame(key, 0, false);
    }
  };
}

// 15. MAZE RUNNER
function getMazeRunner(container, key, pf) {
  let level=1, size=4, maxTime=600, timeLeft=maxTime;
  let board, start, end, pos, path, solved=0, timer;
  container.innerHTML = `<h3>Maze Runner</h3>
    <div id="maze-timer"></div>
    <canvas id="maze-canvas" width="320" height="320" style="background:#fafafa;border:2px solid #bbb;touch-action:none;display:block;margin:auto;"></canvas>
    <div id="maze-hint"></div>
  `;
  let canvas = container.querySelector("#maze-canvas");
  let ctx = canvas.getContext("2d");
  function newLevel() {
    size = 3 + Math.floor(level/2);
    [board,start,end]=generateMaze(size);
    pos={...start}; path=[{...pos}];
    draw();
  }
  function draw() {
    ctx.clearRect(0,0,320,320);
    let w = 320/size;
    for (let r=0;r<size;r++)for(let c=0;c<size;c++) {
      ctx.strokeStyle="#999";
      ctx.strokeRect(c*w,r*w,w,w);
      if (board[r][c]===1) {
        ctx.fillStyle="#444";
        ctx.fillRect(c*w+2,r*w+2,w-4,w-4);
      }
    }
    // Start, End
    ctx.fillStyle="#b8e986"; ctx.fillRect(start.c*w+6,start.r*w+6,w-12,w-12);
    ctx.fillStyle="#ffc"; ctx.fillRect(end.c*w+6,end.r*w+6,w-12,w-12);
    // Path
    ctx.strokeStyle="#3498db"; ctx.lineWidth=4; ctx.beginPath();
    ctx.moveTo((path[0].c+0.5)*w,(path[0].r+0.5)*w);
    for (let p of path) ctx.lineTo((p.c+0.5)*w,(p.r+0.5)*w);
    ctx.stroke();
    // Player
    ctx.fillStyle="#ff5252"; ctx.beginPath();
    ctx.arc((pos.c+0.5)*w,(pos.r+0.5)*w,w/4,0,2*Math.PI); ctx.fill();
  }
  let swipeStart=null;
  canvas.onpointerdown = e => {
    swipeStart = {x:e.offsetX,y:e.offsetY};
  };
  canvas.onpointerup = e => {
    if (!swipeStart) return;
    let dx = e.offsetX-swipeStart.x, dy = e.offsetY-swipeStart.y;
    let dir;
    if (Math.abs(dx)>Math.abs(dy)) dir = dx>0?"R":"L";
    else dir = dy>0?"D":"U";
    move(dir);
    swipeStart=null;
  };
  function move(dir) {
    let dr=0,dc=0;
    if (dir==="L") dc=-1;
    if (dir==="R") dc=1;
    if (dir==="U") dr=-1;
    if (dir==="D") dr=1;
    let nr=pos.r,nc=pos.c;
    while (true) {
      let tr=nr+dr,tc=nc+dc;
      if (tr<0||tc<0||tr>=size||tc>=size||board[tr][tc]===1) break;
      nr=tr;nc=tc;
    }
    if (nr!==pos.r||nc!==pos.c) {
      pos.r=nr;pos.c=nc; path.push({...pos});
      if (pos.r===end.r&&pos.c===end.c) {
        solved++; level++; newLevel();
        container.querySelector("#maze-hint").textContent="Level "+level+"!";
      }
      draw();
    }
  }
  function tick() {
    timeLeft--;
    container.querySelector("#maze-timer").textContent = `Restzeit: ${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2,"0")}`;
    if (timeLeft<=0) {
      container.querySelector("#maze-hint").textContent = `Zeit abgelaufen! Level: ${level}`;
      finishGame(key, level-1, level>1);
      clearInterval(timer);
      canvas.onpointerdown = canvas.onpointerup = null;
    }
  }
  newLevel();
  timer = setInterval(tick, 1000);
}
// Maze generator: DFS
function generateMaze(size) {
  let grid=Array.from({length:size},()=>Array(size).fill(1));
  function carve(r,c) {
    grid[r][c]=0;
    shuffle([[0,1],[1,0],[0,-1],[-1,0]]).forEach(([dr,dc])=>{
      let nr=r+dr*2,nc=c+dc*2;
      if (nr>=0&&nc>=0&&nr<size&&nc<size&&grid[nr][nc]===1) {
        grid[r+dr][c+dc]=0;
        carve(nr,nc);
      }
    });
  }
  carve(0,0);
  let empty = [];
  for (let r=0;r<size;r++)for(let c=0;c<size;c++)if(grid[r][c]===0)empty.push([r,c]);
  let start={r:0,c:0}, end={r:size-1,c:size-1};
  return [grid,start,end];
}

// --- Init ---
handleLoginStreak();
updateHeader();
renderMenu();
