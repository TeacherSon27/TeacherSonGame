const API_BASE = "./api/leaderboard";
const BACKEND = (() => {
  const config = window.WHATS_WRONG_CONFIG?.backend || {};
  return {
    mode: config.mode || "auto",
    supabaseUrl: (config.supabaseUrl || "").replace(/\/$/, ""),
    supabaseAnonKey: config.supabaseAnonKey || ""
  };
})();
const LOCAL_STORAGE_SCORES_KEY = "whats-wrong-local-scores-v1";

function hasSupabaseBackend() {
  return BACKEND.mode === "supabase" && BACKEND.supabaseUrl && BACKEND.supabaseAnonKey;
}

function localScoresStore() {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalScoresStore(scores) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(scores));
  } catch {
    // Ignore local storage write failures.
  }
  return scores;
}

function normalizeSupabaseScores(scores) {
  return scores.map((entry) => ({
    id: entry.id,
    name: entry.name,
    score: Number(entry.score || 0),
    correctAnswers: Number(entry.correct_answers || 0),
    playedAt: Number(entry.played_at || Date.now()),
    live: Boolean(entry.live)
  }));
}

function toSupabaseScore(entry) {
  return {
    id: entry.id,
    name: entry.name,
    score: Number(entry.score || 0),
    correct_answers: Number(entry.correctAnswers || 0),
    played_at: Number(entry.playedAt || Date.now()),
    live: Boolean(entry.live)
  };
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: BACKEND.supabaseAnonKey,
    Authorization: `Bearer ${BACKEND.supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function supabaseEndpoint(path) {
  return `${BACKEND.supabaseUrl}/rest/v1/${path}`;
}

const LEVELS = [
  {
    id: 1,
    label: "Level 1",
    mode: "Multiple Choice",
    duration: 120,
    points: { firstTry: 10, secondTry: 6 }
  },
  {
    id: 2,
    label: "Level 2",
    mode: "Picture Match",
    duration: 300,
    points: { firstTry: 20, secondTry: 12 }
  },
  {
    id: 3,
    label: "Level 3",
    mode: "Sentence Rearrangement",
    duration: 600,
    points: { firstTry: 30, secondTry: 18 }
  }
];

const CUSTOM_IMAGE_VERSION = "20260330b";

const SCENE_IMAGES = {
  fever: `./assets/custom-whats-wrong/fever.png?v=${CUSTOM_IMAGE_VERSION}`,
  toothache: `./assets/custom-whats-wrong/toothache.png?v=${CUSTOM_IMAGE_VERSION}`,
  footHurts: `./assets/custom-whats-wrong/foot-hurts.png?v=${CUSTOM_IMAGE_VERSION}`,
  handHurts: `./assets/custom-whats-wrong/hand-hurts.png?v=${CUSTOM_IMAGE_VERSION}`,
  handsHurt: `./assets/custom-whats-wrong/hands-hurt.png?v=${CUSTOM_IMAGE_VERSION}`,
  headache: `./assets/custom-whats-wrong/headache.png?v=${CUSTOM_IMAGE_VERSION}`,
  stomachache: `./assets/custom-whats-wrong/stomachache.png?v=${CUSTOM_IMAGE_VERSION}`,
  runnyNose: `./assets/custom-whats-wrong/runny-nose.png?v=${CUSTOM_IMAGE_VERSION}`,
  soreThroat: `./assets/custom-whats-wrong/sore-throat.png?v=${CUSTOM_IMAGE_VERSION}`,
  legHurts: `./assets/custom-whats-wrong/leg-hurts.png?v=${CUSTOM_IMAGE_VERSION}`,
  eyeHurtsFemale: `./assets/custom-whats-wrong/eye-hurts-female.png?v=${CUSTOM_IMAGE_VERSION}`,
  eyeHurtsMale: `./assets/custom-whats-wrong/eye-hurts-male.png?v=${CUSTOM_IMAGE_VERSION}`
};

const BODY_IMAGES = {
  eye: `./assets/custom-whats-wrong/one-eye.png?v=${CUSTOM_IMAGE_VERSION}`,
  hands: `./assets/custom-whats-wrong/two-hands.png?v=${CUSTOM_IMAGE_VERSION}`,
  arm: `./assets/custom-whats-wrong/three-arms.png?v=${CUSTOM_IMAGE_VERSION}`,
  foot: `./assets/custom-whats-wrong/two-feet.png?v=${CUSTOM_IMAGE_VERSION}`,
  leg: `./assets/custom-whats-wrong/five-legs.png?v=${CUSTOM_IMAGE_VERSION}`,
  ear: `./assets/custom-whats-wrong/ear-hurts.png?v=${CUSTOM_IMAGE_VERSION}`
};

const PDF_REFERENCE_IMAGES = {
  twoHands: `./assets/custom-whats-wrong/two-hands.png?v=${CUSTOM_IMAGE_VERSION}`,
  threeArms: `./assets/custom-whats-wrong/three-arms.png?v=${CUSTOM_IMAGE_VERSION}`,
  twoFeet: `./assets/custom-whats-wrong/two-feet.png?v=${CUSTOM_IMAGE_VERSION}`,
  fiveLegs: `./assets/custom-whats-wrong/five-legs.png?v=${CUSTOM_IMAGE_VERSION}`,
  handHurtsEmoji: `./assets/custom-whats-wrong/hand-hurts.png?v=${CUSTOM_IMAGE_VERSION}`,
  footHurtsEmoji: `./assets/custom-whats-wrong/foot-hurts.png?v=${CUSTOM_IMAGE_VERSION}`,
  handsAndLegsBoy: `./assets/custom-whats-wrong/hands-and-legs-hurt.png?v=${CUSTOM_IMAGE_VERSION}`
};

const SCENE_CARD_IMAGES = {
  rianaFever: `./assets/custom-whats-wrong/male-headache.png?v=${CUSTOM_IMAGE_VERSION}`,
  seniorToothache: `./assets/custom-whats-wrong/female-headache.png?v=${CUSTOM_IMAGE_VERSION}`,
  selenaFootHurts: SCENE_IMAGES.legHurts,
  austinHandsHurt: SCENE_IMAGES.handsHurt,
  rianaHeadache: SCENE_IMAGES.headache,
  kheviaStomachache: `./assets/custom-whats-wrong/female-stomachache.png?v=${CUSTOM_IMAGE_VERSION}`,
  austinRunnyNose: `./assets/custom-whats-wrong/female-runny-nose.png?v=${CUSTOM_IMAGE_VERSION}`,
  theySoreThroat: `./assets/custom-whats-wrong/group-sick.png?v=${CUSTOM_IMAGE_VERSION}`,
  seniorHandHurts: SCENE_IMAGES.handHurts,
  rianaHandHurts: SCENE_IMAGES.handHurts,
  francoLegHurts: `./assets/custom-whats-wrong/male-hands-and-legs-hurt.png?v=${CUSTOM_IMAGE_VERSION}`,
  hisHandsLegsHurt: `./assets/custom-whats-wrong/hands-and-legs-hurt.png?v=${CUSTOM_IMAGE_VERSION}`,
  theirHandsHurt: SCENE_IMAGES.handsHurt,
  christinaEyeHurts: `./assets/custom-whats-wrong/female-foot-hurts.png?v=${CUSTOM_IMAGE_VERSION}`,
  francoEyesHurt: `./assets/custom-whats-wrong/female-sore-throat.png?v=${CUSTOM_IMAGE_VERSION}`,
  yesSheRunnyNose: `./assets/custom-whats-wrong/male-fever.png?v=${CUSTOM_IMAGE_VERSION}`,
  noSheStomachache: `./assets/custom-whats-wrong/female-stomachache.png?v=${CUSTOM_IMAGE_VERSION}`,
  yesHeFever: SCENE_IMAGES.fever,
  noHeToothache: `./assets/custom-whats-wrong/female-headache.png?v=${CUSTOM_IMAGE_VERSION}`,
  yesTheyRunnyNose: SCENE_IMAGES.runnyNose,
  noTheyHeadache: SCENE_IMAGES.headache
};

const IMAGE_PRELOAD_URLS = Array.from(
  new Set([
    ...Object.values(SCENE_IMAGES),
    ...Object.values(BODY_IMAGES),
    ...Object.values(PDF_REFERENCE_IMAGES),
    ...Object.values(SCENE_CARD_IMAGES)
  ])
);

const SCENES = {
  rianaFever: sceneCard("Riana", "She has a fever.", "female", ["🤒", "🌡️"], "", SCENE_CARD_IMAGES.rianaFever),
  seniorToothache: sceneCard("Senior", "He has a toothache.", "male", ["🦷", "😖"], "", SCENE_CARD_IMAGES.seniorToothache),
  selenaFootHurts: sceneCard("Selena", "Her leg hurts.", "female", ["🦵", "⚡"], "", SCENE_CARD_IMAGES.selenaFootHurts),
  austinHandsHurt: sceneCard("Austin", "His hands hurt.", "male", ["🙌", "⚡"], "", SCENE_CARD_IMAGES.austinHandsHurt),
  rianaHeadache: sceneCard("Riana", "She has a headache.", "female", ["🤕", "💫"], "", SCENE_CARD_IMAGES.rianaHeadache),
  kheviaStomachache: sceneCard("Khevia", "She has a stomachache.", "female", ["🤢", "💚"], "", SCENE_CARD_IMAGES.kheviaStomachache),
  austinRunnyNose: sceneCard("Austin", "I have a runny nose.", "male", ["🤧", "💧"], "", SCENE_CARD_IMAGES.austinRunnyNose),
  theySoreThroat: sceneCard("Group", "They have a sore throat.", "group", ["😷", "🗣️"], "", SCENE_CARD_IMAGES.theySoreThroat),
  seniorHandHurts: sceneCard("Senior", "My hand hurts.", "male", ["✋", "⚡"], "", SCENE_CARD_IMAGES.seniorHandHurts),
  rianaHandHurts: sceneCard("Riana", "Her hand hurts.", "female", ["✋", "⚡"], "", SCENE_CARD_IMAGES.rianaHandHurts),
  francoLegHurts: sceneCard("Franco", "His foot hurts.", "male", ["🦶", "⚡"], "", SCENE_CARD_IMAGES.francoLegHurts),
  hisHandsLegsHurt: sceneCard("Austin", "His hands and legs hurt.", "male", ["🙌", "🦵"], "", SCENE_CARD_IMAGES.hisHandsLegsHurt),
  theirHandsHurt: sceneCard("Team", "Their hands hurt.", "group", ["🙌", "✨"], "", SCENE_CARD_IMAGES.theirHandsHurt),
  christinaEyeHurts: sceneCard("Christina", "Her eye hurts.", "female", ["👁️", "⚡"], "", SCENE_CARD_IMAGES.christinaEyeHurts),
  francoEyesHurt: sceneCard("Franco", "My eyes hurt.", "male", ["👀", "⚡"], "", SCENE_CARD_IMAGES.francoEyesHurt),
  yesSheRunnyNose: sceneCard("Selena", "Yes, she does.", "female", ["🤧", "✅"], "", SCENE_CARD_IMAGES.yesSheRunnyNose),
  noSheStomachache: sceneCard("Khevia", "No, she doesn't. She has a stomachache.", "female", ["🤢", "❌"], "", SCENE_CARD_IMAGES.noSheStomachache),
  yesHeFever: sceneCard("Austin", "Yes, he does.", "male", ["🤒", "✅"], "", SCENE_CARD_IMAGES.yesHeFever),
  noHeToothache: sceneCard("Senior", "No, he doesn't. He has a toothache.", "male", ["🦷", "❌"], "", SCENE_CARD_IMAGES.noHeToothache),
  yesTheyRunnyNose: sceneCard("Pair", "Yes, they do.", "group", ["🤧", "✅"], "", SCENE_CARD_IMAGES.yesTheyRunnyNose),
  noTheyHeadache: sceneCard("Group", "No, they don't. They have a headache.", "group", ["🤕", "❌"], "", SCENE_CARD_IMAGES.noTheyHeadache)
};

const MC_QUESTIONS = [
  mcQuestion("How many? 1 eye.", ["There is one eye.", "There are one eye.", "There is two eyes.", "There are two eyes."], "There is one eye.", "G5 Co-teaching 1"),
  mcQuestion("How many? 2 hands.", ["There are two hands.", "There is two hands.", "There are two hand.", "There is one hand."], "There are two hands.", "G5 Co-teaching 1"),
  mcQuestion("What's wrong with her?", ["She has a fever.", "Her has a fever.", "She have a fever.", "She is fever."], "She has a fever.", "G5 - L2"),
  mcQuestion("What's wrong with him?", ["He has a toothache.", "His has a toothache.", "He have a toothache.", "He has tooth hurts."], "He has a toothache.", "G5 - L2"),
  mcQuestion("What's wrong with her?", ["Her leg hurts.", "She leg hurts.", "Her leg hurt.", "Her leg have hurt."], "Her leg hurts.", "G5 - L2"),
  mcQuestion("What's wrong with him?", ["His hands hurt.", "He hands hurt.", "His hands hurts.", "His hand hurt."], "His hands hurt.", "G5 - L2"),
  mcQuestion("Does she have a runny nose?", ["Yes, she does.", "Yes, she do.", "No, she does.", "No, she don't."], "Yes, she does.", "G5 - L2"),
  mcQuestion("Does he have a fever?", ["No, he doesn't. He has a toothache.", "No, she doesn't.", "Yes, he don't.", "He has a fever no."], "No, he doesn't. He has a toothache.", "G5 - L2"),
  mcQuestion("Do you have a toothache?", ["Yes, I do.", "Yes, I does.", "No, you don't.", "I do yes a toothache."], "Yes, I do.", "G5 - L2"),
  mcQuestion("Do they have a fever?", ["No, they don't. They have a headache.", "No, they doesn't.", "Yes, they has.", "They don't fever."], "No, they don't. They have a headache.", "G5 - L2"),
  mcQuestion("What's wrong?", ["I have a headache.", "I have headaches.", "My headache hurt.", "I are headache."], "I have a headache.", "G5 - MIDTERM"),
  mcQuestion("What's wrong?", ["I have a stomachache.", "I am a stomachache.", "My stomach hurts ache.", "I has a stomachache."], "I have a stomachache.", "G5 - MIDTERM")
];

const PICTURE_QUESTIONS = [
  pictureQuestion("What’s wrong with her?", "rianaFever", ["rianaFever", "seniorToothache", "selenaFootHurts", "austinHandsHurt"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with him?", "seniorToothache", ["seniorToothache", "rianaHeadache", "kheviaStomachache", "francoLegHurts"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong?", "selenaFootHurts", ["selenaFootHurts", "rianaHandHurts", "christinaEyeHurts", "kheviaStomachache"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong?", "austinHandsHurt", ["austinHandsHurt", "francoLegHurts", "seniorHandHurts", "francoEyesHurt"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong?", "rianaHeadache", ["rianaHeadache", "rianaFever", "selenaFootHurts", "christinaEyeHurts"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with her?", "kheviaStomachache", ["kheviaStomachache", "rianaFever", "rianaHeadache", "selenaFootHurts"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with you?", "austinRunnyNose", ["austinRunnyNose", "seniorHandHurts", "francoEyesHurt", "kheviaStomachache"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with them?", "theySoreThroat", ["theySoreThroat", "theirHandsHurt", "yesTheyRunnyNose", "noTheyHeadache"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with you?", "seniorHandHurts", ["seniorHandHurts", "austinHandsHurt", "rianaHandHurts", "francoLegHurts"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong?", "rianaHandHurts", ["rianaHandHurts", "christinaEyeHurts", "selenaFootHurts", "rianaHeadache"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with him?", "francoLegHurts", ["francoLegHurts", "seniorHandHurts", "austinHandsHurt", "seniorToothache"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong?", "hisHandsLegsHurt", ["hisHandsLegsHurt", "theirHandsHurt", "theySoreThroat", "francoEyesHurt"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with them?", "theirHandsHurt", ["theirHandsHurt", "hisHandsLegsHurt", "theySoreThroat", "yesTheyRunnyNose"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with her?", "christinaEyeHurts", ["christinaEyeHurts", "rianaHandHurts", "rianaHeadache", "rianaFever"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("What’s wrong with you?", "francoEyesHurt", ["francoEyesHurt", "austinRunnyNose", "seniorHandHurts", "christinaEyeHurts"], "Pick the matching scene card.", "G5 - L2"),
  pictureQuestion("Does she have a runny nose?", "yesSheRunnyNose", ["yesSheRunnyNose", "noSheStomachache", "rianaFever", "kheviaStomachache"], "Pick the best answer card.", "G5 - L2"),
  pictureQuestion("Does he have a fever?", "noHeToothache", ["noHeToothache", "yesHeFever", "seniorToothache", "austinHandsHurt"], "Pick the best answer card.", "G5 - L2"),
  pictureQuestion("Do they have a runny nose?", "yesTheyRunnyNose", ["yesTheyRunnyNose", "noTheyHeadache", "theirHandsHurt", "theySoreThroat"], "Pick the best answer card.", "G5 - L2"),
  pictureQuestion("Do they have a fever?", "noTheyHeadache", ["noTheyHeadache", "yesTheyRunnyNose", "rianaHeadache", "theySoreThroat"], "Pick the best answer card.", "G5 - L2"),
  pictureQuestion("Does he have a fever?", "yesHeFever", ["yesHeFever", "noHeToothache", "rianaFever", "seniorToothache"], "Pick the best answer card.", "G5 - L2")
];

const SCRAMBLE_QUESTIONS = [
  scrambleQuestion("There is one eye.", "G5 Co-teaching 1"),
  scrambleQuestion("There are two hands.", "G5 Co-teaching 1"),
  scrambleQuestion("There are three arms.", "G5 Co-teaching 1"),
  scrambleQuestion("There are two feet.", "G5 Co-teaching 1"),
  scrambleQuestion("There are five legs.", "G5 Co-teaching 1"),
  scrambleQuestion("My hand hurts.", "G5 Co-teaching 1"),
  scrambleQuestion("My feet hurt.", "G5 Co-teaching 1"),
  scrambleQuestion("My nose hurts.", "G5 Co-teaching 1"),
  scrambleQuestion("I have a fever.", "G5 - MIDTERM"),
  scrambleQuestion("I have a sore throat.", "G5 - MIDTERM"),
  scrambleQuestion("I have a runny nose.", "G5 - MIDTERM"),
  scrambleQuestion("I have a headache.", "G5 - MIDTERM"),
  scrambleQuestion("I have a stomachache.", "G5 - MIDTERM"),
  scrambleQuestion("She has a fever.", "G5 - L2"),
  scrambleQuestion("He has a toothache.", "G5 - L2"),
  scrambleQuestion("Her leg hurts.", "G5 - L2"),
  scrambleQuestion("His hands hurt.", "G5 - L2"),
  scrambleQuestion("She has a headache.", "G5 - L2"),
  scrambleQuestion("She has a stomachache.", "G5 - L2"),
  scrambleQuestion("They have a sore throat.", "G5 - L2"),
  scrambleQuestion("Her hand hurts.", "G5 - L2"),
  scrambleQuestion("His foot hurts.", "G5 - L2"),
  scrambleQuestion("His hands and legs hurt.", "G5 - L2"),
  scrambleQuestion("Their hands hurt.", "G5 - L2"),
  scrambleQuestion("Her eye hurts.", "G5 - L2"),
  scrambleQuestion("Does she have a runny nose?", "G5 - L2"),
  scrambleQuestion("Yes, she does.", "G5 - L2"),
  scrambleQuestion("No, she doesn't. She has a stomachache.", "G5 - L2"),
  scrambleQuestion("Do you have a toothache?", "G5 - L2"),
  scrambleQuestion("No, they don't. They have a headache.", "G5 - L2"),
  scrambleQuestion("Do they have a fever?", "G5 - L2"),
  scrambleQuestion("Yes, they do.", "G5 - L2")
];

const QUESTION_BANKS = {
  1: MC_QUESTIONS,
  2: PICTURE_QUESTIONS,
  3: SCRAMBLE_QUESTIONS
};

const LANGUAGE_BANK = [
  "She has a fever.",
  "He has a toothache.",
  "Her leg hurts.",
  "His hands hurt.",
  "They have a sore throat.",
  "Her hand hurts.",
  "His foot hurts.",
  "His hands and legs hurt.",
  "Their hands hurt.",
  "Her eye hurts.",
  "Does she have a runny nose?",
  "Yes, she does.",
  "No, he doesn't. He has a toothache.",
  "Do you have a toothache?",
  "Yes, I do.",
  "Do they have a fever?",
  "No, they don't. They have a headache."
];

const state = {
  currentPlayer: "",
  currentPlayerEntryId: "",
  currentLevelIndex: 0,
  currentStageIndex: 0,
  levelOrder: [0, 1, 2],
  completedLevelIds: [],
  currentQuestionIndex: 0,
  currentQuestion: null,
  currentQuestions: [],
  score: 0,
  correctAnswers: 0,
  attemptsUsed: 0,
  selectedChoice: null,
  selectedPicture: null,
  optionOrder: [],
  bankWords: [],
  answerWords: [],
  revealCorrect: false,
  dragItem: null,
  gameActive: false,
  awaitingNext: false,
  stageTimeLeft: LEVELS[0].duration,
  timerId: null,
  nextQuestionTimeoutId: null,
  soundOn: true,
  leaderboardRefreshId: null,
  scores: [],
  scoresLoaded: false,
  syncInFlight: false,
  currentPlayerSynced: false,
  remoteMissingCount: 0
};

const ui = {
  playerForm: document.getElementById("playerForm"),
  playerName: document.getElementById("playerName"),
  startLevel: document.getElementById("startLevel"),
  soundToggle: document.getElementById("soundToggle"),
  roadmapCards: [...document.querySelectorAll(".roadmap-card")],
  playerValue: document.getElementById("playerValue"),
  levelValue: document.getElementById("levelValue"),
  scoreValue: document.getElementById("scoreValue"),
  timeValue: document.getElementById("timeValue"),
  attemptsValue: document.getElementById("attemptsValue"),
  progressValue: document.getElementById("progressValue"),
  promptTitle: document.getElementById("promptTitle"),
  promptSource: document.getElementById("promptSource"),
  modePill: document.getElementById("modePill"),
  scorePill: document.getElementById("scorePill"),
  timerBar: document.getElementById("timerBar"),
  questionArea: document.getElementById("questionArea"),
  restartButton: document.getElementById("restartButton"),
  resetGameButton: document.getElementById("resetGameButton"),
  resetButton: document.getElementById("resetButton"),
  checkButton: document.getElementById("checkButton"),
  celebrationLayer: document.getElementById("celebrationLayer"),
  feedback: document.getElementById("feedback"),
  leaderboard: document.getElementById("leaderboard"),
  languageBank: document.getElementById("languageBank"),
  qrImage: document.getElementById("qrImage"),
  shareLink: document.getElementById("shareLink")
};

let lastLeaderboardSnapshot = "";
const preloadedImages = new Set();
const leaderboardVisualState = {
  positions: new Map(),
  scores: new Map()
};

function mcQuestion(prompt, choices, answer, source) {
  return { type: "mc", prompt, choices, answer, source };
}

function pictureQuestion(prompt, answer, options, helper, source) {
  return { type: "picture", prompt, answer, options, helper, source };
}

function scrambleQuestion(text, source) {
  return {
    type: "scramble",
    prompt: "Put the sentence in the correct order.",
    answer: text,
    hint: hintQuestionFor(text),
    source,
    tokens: splitSentence(text),
    visual: scrambleVisualFor(text)
  };
}

function sceneCard(title, text, role, icons, footer = "", image = "") {
  return { title, text, role, icons, footer, image };
}

function visualCard(label, image, alt) {
  return { kind: "image", label, image, alt };
}

function repeatVisual(label, image, alt, count) {
  return { kind: "repeat", label, image, alt, count };
}

function imageMarkup(src, alt, className, fallbackTitle, fallbackText = "") {
  return `
    <div class="image-shell">
      <img class="${className}" src="${src}" alt="${escapeHtml(alt)}" data-src-base="${escapeHtml(src)}" loading="eager" decoding="sync" fetchpriority="high">
      <div class="image-fallback">
        <strong>${escapeHtml(fallbackTitle)}</strong>
        ${fallbackText ? `<span>${escapeHtml(fallbackText)}</span>` : ""}
      </div>
    </div>
  `;
}

function preloadImage(src) {
  if (!src || preloadedImages.has(src)) {
    return;
  }
  preloadedImages.add(src);
  const image = new Image();
  image.loading = "eager";
  image.decoding = "sync";
  image.src = src;
}

function preloadQuestionImages(question) {
  if (!question) {
    return;
  }
  if (question.type === "picture") {
    preloadImage(SCENES[question.answer]?.image);
    question.options.forEach((option) => preloadImage(SCENES[option]?.image));
    return;
  }
  if (question.type === "scramble") {
    preloadImage(question.visual?.image);
  }
}

function warmImageAssets() {
  IMAGE_PRELOAD_URLS.forEach(preloadImage);
}

function retryImageSource(src) {
  if (!src) {
    return src;
  }
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}retry=${Date.now()}`;
}

function markImageLoaded(image) {
  const shell = image.closest(".image-shell");
  image.classList.remove("is-hidden");
  if (shell) {
    shell.classList.add("is-loaded");
  }
}

function showImageFallback(image) {
  const shell = image.closest(".image-shell");
  if (shell) {
    shell.classList.remove("is-loaded");
  }
  image.classList.add("is-hidden");
}

function bindQuestionImages(root = ui.questionArea) {
  const images = root.querySelectorAll(".image-shell img");
  images.forEach((image) => {
    if (image.dataset.bound === "true") {
      return;
    }

    image.dataset.bound = "true";
    image.addEventListener("load", () => {
      if (image.naturalWidth > 0) {
        markImageLoaded(image);
      } else {
        showImageFallback(image);
      }
    });

    image.addEventListener("error", () => {
      if (image.dataset.retried !== "true") {
        image.dataset.retried = "true";
        image.src = retryImageSource(image.dataset.srcBase || image.currentSrc || image.src);
        return;
      }
      showImageFallback(image);
    });

    if (image.complete) {
      if (image.naturalWidth > 0) {
        markImageLoaded(image);
      } else if (image.currentSrc || image.src) {
        image.dispatchEvent(new Event("error"));
      }
    }
  });
}

function hintQuestionFor(text) {
  const overrides = {
    "Her leg hurts.": "What's wrong?",
    "His hands hurt.": "What's wrong?",
    "She has a headache.": "What's wrong?",
    "Her hand hurts.": "What's wrong?",
    "His hands and legs hurt.": "What's wrong?"
  };
  if (overrides[text]) {
    return overrides[text];
  }
  const normalized = text.toLowerCase();
  if (normalized.includes("one eye")) {
    return "How many eyes are there?";
  }
  if (normalized.includes("two hands")) {
    return "How many hands are there?";
  }
  if (normalized.includes("three arms")) {
    return "How many arms are there?";
  }
  if (normalized.includes("two feet")) {
    return "How many feet are there?";
  }
  if (normalized.includes("five legs")) {
    return "How many legs are there?";
  }
  if (normalized.startsWith("my ") || normalized.startsWith("i have")) {
    return "What's wrong with me?";
  }
  if (normalized.startsWith("she has") || normalized.startsWith("her ")) {
    return "What's wrong with her?";
  }
  if (normalized.startsWith("he has") || normalized.startsWith("his ")) {
    return "What's wrong with him?";
  }
  if (normalized.startsWith("they have") || normalized.startsWith("their ")) {
    return "What's wrong with them?";
  }
  if (normalized.startsWith("does she")) {
    return "What should you ask about her?";
  }
  if (normalized.startsWith("do you")) {
    return "What should you ask your partner?";
  }
  if (normalized.startsWith("do they")) {
    return "What should you ask about them?";
  }
  if (normalized.startsWith("yes") || normalized.startsWith("no")) {
    return "How should you answer this question?";
  }
  return "What sentence matches this picture?";
}

function scrambleVisualFor(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes("one eye")) {
    return repeatVisual("One eye", BODY_IMAGES.eye, "Eye", 1);
  }
  if (normalized.includes("two hands")) {
    return visualCard("Two hands", PDF_REFERENCE_IMAGES.twoHands, "Two hands");
  }
  if (normalized.includes("three arms")) {
    return visualCard("Three arms", PDF_REFERENCE_IMAGES.threeArms, "Three arms");
  }
  if (normalized.includes("two feet")) {
    return visualCard("Two feet", PDF_REFERENCE_IMAGES.twoFeet, "Two feet");
  }
  if (normalized.includes("five legs")) {
    return visualCard("Five legs", PDF_REFERENCE_IMAGES.fiveLegs, "Five legs");
  }
  if (normalized.includes("hands and legs hurt")) {
    return visualCard("Hands and legs hurt", PDF_REFERENCE_IMAGES.handsAndLegsBoy, "Hands and legs hurt");
  }
  if (normalized.includes("my hand hurts") || normalized.includes("her hand hurts")) {
    return visualCard("Hand hurts", PDF_REFERENCE_IMAGES.handHurtsEmoji, "Hand hurts");
  }
  if (normalized.includes("my feet hurt")) {
    return visualCard("Foot hurts", PDF_REFERENCE_IMAGES.footHurtsEmoji, "Foot hurts");
  }
  if (normalized.includes("her leg hurts")) {
    return visualCard("Leg hurts", SCENE_IMAGES.legHurts, "Leg hurts");
  }
  if (normalized.includes("his foot hurts")) {
    return visualCard("Foot hurts", SCENE_IMAGES.footHurts, "Foot hurts");
  }
  if (normalized.includes("hand hurts") || normalized.includes("hands hurt")) {
    return visualCard("Hands hurt", SCENE_IMAGES.handsHurt, "Hands hurt");
  }
  if (normalized.includes("feet hurt") || normalized.includes("foot hurts")) {
    return visualCard("Foot hurts", SCENE_IMAGES.footHurts, "Foot hurts");
  }
  if (normalized.includes("nose hurts") || normalized.includes("runny nose")) {
    return visualCard("Runny nose", SCENE_IMAGES.runnyNose, "Runny nose");
  }
  if (normalized.includes("fever")) {
    return visualCard("Fever", SCENE_IMAGES.fever, "Fever");
  }
  if (normalized.includes("sore throat")) {
    return visualCard("Sore throat", SCENE_IMAGES.soreThroat, "Sore throat");
  }
  if (normalized.includes("headache")) {
    return visualCard("Headache", SCENE_IMAGES.headache, "Headache");
  }
  if (normalized.includes("stomachache")) {
    return visualCard("Stomachache", SCENE_IMAGES.stomachache, "Stomachache");
  }
  if (normalized.includes("toothache")) {
    return visualCard("Toothache", SCENE_IMAGES.toothache, "Toothache");
  }
  if (normalized.includes("eye hurts")) {
    return visualCard("Eye hurts", SCENE_IMAGES.eyeHurtsFemale, "Eye hurts");
  }
  if (normalized.includes("they have a sore throat")) {
    return visualCard("Sore throat", SCENE_IMAGES.soreThroat, "Sore throat");
  }
  if (normalized.includes("yes, they do") || normalized.includes("yes, she does")) {
    return visualCard("Yes", SCENE_IMAGES.runnyNose, "Yes answer");
  }
  if (normalized.includes("no, she doesn't")) {
    return visualCard("Stomachache answer", SCENE_IMAGES.stomachache, "Stomachache answer");
  }
  if (normalized.includes("no, they don't")) {
    return visualCard("Headache answer", SCENE_IMAGES.headache, "Headache answer");
  }
  if (normalized.includes("do you have")) {
    return visualCard("Toothache question", SCENE_IMAGES.toothache, "Toothache");
  }
  return visualCard("Picture clue", SCENE_IMAGES.headache, "Picture clue");
}

function splitSentence(text) {
  return text.match(/[A-Za-z']+|[?.!,]/g) || [];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function currentLevel() {
  return LEVELS[state.currentLevelIndex];
}

function buildLevelOrder(startLevelId) {
  const startIndex = LEVELS.findIndex((level) => level.id === startLevelId);
  if (startIndex < 0) {
    return [0, 1, 2];
  }
  return LEVELS.map((_, index) => (startIndex + index) % LEVELS.length);
}

function setFeedback(message, tone = "") {
  ui.feedback.textContent = message;
  ui.feedback.className = `feedback ${tone}`.trim();
}

function playSound(kind) {
  if (!state.soundOn) {
    return;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return;
  }

  if (!playSound.ctx) {
    playSound.ctx = new AudioCtx();
  }

  const context = playSound.ctx;
  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  const patterns = {
    click: [
      [480, 0.04, "triangle"],
      [620, 0.03, "triangle"]
    ],
    good: [
      [520, 0.08, "sine"],
      [660, 0.08, "sine"],
      [820, 0.1, "sine"]
    ],
    bad: [
      [260, 0.08, "square"],
      [210, 0.1, "square"]
    ],
    level: [
      [440, 0.06, "triangle"],
      [660, 0.08, "triangle"],
      [880, 0.12, "triangle"]
    ],
    finish: [
      [523, 0.08, "sine"],
      [659, 0.08, "sine"],
      [784, 0.08, "sine"],
      [1047, 0.16, "sine"]
    ],
    tick: [[820, 0.03, "square"]]
  };

  const notes = patterns[kind] || patterns.click;
  let startAt = context.currentTime;

  notes.forEach(([frequency, duration, type]) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
    startAt += duration * 0.75;
  });
}

function burstConfetti() {
  ui.celebrationLayer.innerHTML = Array.from({ length: 16 }, (_, index) => {
    const left = Math.round(Math.random() * 100);
    const delay = (index * 0.03).toFixed(2);
    const duration = (0.8 + Math.random() * 0.8).toFixed(2);
    const hue = Math.round(Math.random() * 360);
    return `<span class="confetti" style="left:${left}%;--delay:${delay}s;--duration:${duration}s;--hue:${hue};"></span>`;
  }).join("");
  setTimeout(() => {
    ui.celebrationLayer.innerHTML = "";
  }, 1800);
}

function renderLanguageBank() {
  ui.languageBank.innerHTML = LANGUAGE_BANK.map((item) => `<span class="bank-chip">${escapeHtml(item)}</span>`).join("");
}

function updateRoadmap() {
  const activeLevelId = state.gameActive || state.currentQuestion ? currentLevel()?.id : Number(ui.startLevel.value || 1);
  ui.roadmapCards.forEach((card) => {
    const levelId = Number(card.dataset.levelId);
    card.classList.toggle("active", levelId === activeLevelId);
    card.classList.toggle("done", state.completedLevelIds.includes(levelId));
    card.setAttribute("aria-pressed", String(levelId === activeLevelId));
  });
}

function chooseStartLevel(levelId) {
  if (state.gameActive) {
    return;
  }
  ui.startLevel.value = String(levelId);
  updateStats();
}

function updateStats() {
  const previewLevel = LEVELS.find((item) => item.id === Number(ui.startLevel.value || 1)) || LEVELS[0];
  const level = state.gameActive || state.currentQuestion ? currentLevel() : previewLevel;
  const totalDuration = level?.duration ?? LEVELS[0].duration;
  const ratio = state.gameActive ? (totalDuration ? Math.max(0, state.stageTimeLeft) / totalDuration : 0) : 1;
  if (state.gameActive && state.currentPlayer && !state.currentPlayerEntryId) {
    state.currentPlayerEntryId = `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
  ui.playerValue.textContent = state.currentPlayer || "Waiting";
  ui.levelValue.textContent = level ? level.id : "-";
  ui.scoreValue.textContent = state.score;
  ui.timeValue.textContent = `${Math.max(0, state.gameActive ? state.stageTimeLeft : level.duration)}s`;
  ui.attemptsValue.textContent = state.gameActive ? Math.max(0, 2 - state.attemptsUsed) : 2;
  ui.progressValue.textContent = state.correctAnswers;
  ui.modePill.textContent = level ? level.mode : "Finished";
  ui.scorePill.textContent = level ? `Worth ${level.points.firstTry}/${level.points.secondTry}` : "Run Complete";
  ui.timerBar.style.width = `${Math.max(0, ratio) * 100}%`;
  updateRoadmap();
  syncCurrentPlayerEntry();
  renderLeaderboard();
}

function startTimer() {
  stopTimer();
  state.timerId = window.setInterval(() => {
    state.stageTimeLeft -= 1;
    if (state.stageTimeLeft <= 5 && state.stageTimeLeft > 0) {
      playSound("tick");
    }
    if (state.stageTimeLeft <= 0) {
      state.stageTimeLeft = 0;
      updateStats();
      advanceToNextLevel("Time's up for this stage.");
      return;
    }
    updateStats();
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function clearNextQuestionTimeout() {
  if (state.nextQuestionTimeoutId) {
    window.clearTimeout(state.nextQuestionTimeoutId);
    state.nextQuestionTimeoutId = null;
  }
}

function buildQuestionList(levelId) {
  return shuffle(QUESTION_BANKS[levelId]);
}

function showIdleState() {
  ui.promptTitle.textContent = "Enter a name and start the game.";
  ui.promptSource.textContent = "Choose any level to begin. The game will continue until all three levels are finished.";
  ui.questionArea.innerHTML = `<div class="empty-state large">Questions will appear here after the timed run starts.</div>`;
  ui.checkButton.classList.add("hidden");
  ui.resetButton.classList.add("hidden");
}

function startGame() {
  const playerName = ui.playerName.value.trim();
  const startLevelId = Number(ui.startLevel.value || 1);
  if (!playerName) {
    ui.playerName.focus();
    setFeedback("Students must enter their names before playing.", "warn");
    return;
  }

  stopTimer();
  clearNextQuestionTimeout();
  if (state.currentPlayerEntryId) {
    const previousEntryId = state.currentPlayerEntryId;
    removeEntryLocally(previousEntryId);
    deleteRemoteScore(previousEntryId)
      .then((scores) => {
        if (Array.isArray(scores)) {
          persistScores(scores);
        }
      })
      .catch(() => {
        setFeedback("The shared leaderboard is reconnecting. Your game can continue.", "warn");
      });
  }
  state.levelOrder = buildLevelOrder(startLevelId);
  state.currentStageIndex = 0;
  state.currentPlayer = playerName;
  state.currentPlayerEntryId = `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  state.currentLevelIndex = state.levelOrder[0];
  state.completedLevelIds = [];
  state.currentQuestionIndex = 0;
  state.currentQuestions = buildQuestionList(currentLevel().id);
  state.currentQuestion = state.currentQuestions[0];
  state.score = 0;
  state.correctAnswers = 0;
  state.attemptsUsed = 0;
  state.selectedChoice = null;
  state.selectedPicture = null;
  state.optionOrder = [];
  state.bankWords = [];
  state.answerWords = [];
  state.revealCorrect = false;
  state.gameActive = true;
  state.awaitingNext = false;
  state.stageTimeLeft = currentLevel().duration;
  state.currentPlayerSynced = false;
  state.remoteMissingCount = 0;
  syncCurrentPlayerEntry();
  prepareQuestionState();
  renderQuestion();
  updateStats();
  startTimer();
  playSound("level");
  setFeedback(`${currentLevel().label} started first. Finish all three levels to lock in the total score.`, "");
}

function clearCurrentRun(options = {}) {
  const { keepPlayerName = "" } = options;
  stopTimer();
  clearNextQuestionTimeout();
  state.currentQuestion = null;
  state.currentQuestions = [];
  state.currentQuestionIndex = 0;
  state.currentLevelIndex = 0;
  state.currentStageIndex = 0;
  state.levelOrder = buildLevelOrder(Number(ui.startLevel.value || 1));
  state.completedLevelIds = [];
  state.score = 0;
  state.correctAnswers = 0;
  state.attemptsUsed = 0;
  state.selectedChoice = null;
  state.selectedPicture = null;
  state.optionOrder = [];
  state.bankWords = [];
  state.answerWords = [];
  state.revealCorrect = false;
  state.gameActive = false;
  state.awaitingNext = false;
  state.stageTimeLeft = LEVELS[0].duration;
  state.currentPlayer = "";
  state.currentPlayerEntryId = "";
  state.currentPlayerSynced = false;
  state.remoteMissingCount = 0;
  ui.playerName.value = keepPlayerName;
  showIdleState();
  updateStats();
}

function removeEntryLocally(entryId) {
  if (!entryId) {
    return;
  }
  state.scores = loadScores().filter((entry) => entry.id !== entryId);
  state.scoresLoaded = true;
  lastLeaderboardSnapshot = snapshotScores(state.scores);
  if (state.currentPlayerEntryId === entryId) {
    state.currentPlayerSynced = false;
    state.remoteMissingCount = 0;
  }
  renderLeaderboard();
}

function resetLeaderboardVisuals() {
  leaderboardVisualState.positions = new Map();
  leaderboardVisualState.scores = new Map();
}

function restartCurrentPlayer() {
  const playerName = state.currentPlayer || ui.playerName.value.trim();
  if (!playerName) {
    setFeedback("Enter a player name first.", "warn");
    return;
  }

  const entryId = state.currentPlayerEntryId;
  if (entryId) {
    removeEntryLocally(entryId);
    deleteRemoteScore(entryId)
      .then((scores) => {
        if (Array.isArray(scores)) {
          persistScores(scores);
        }
      })
      .catch(() => {
        setFeedback("The shared leaderboard is reconnecting. Your game can continue.", "warn");
      });
  }
  clearCurrentRun({ keepPlayerName: "" });
  playSound("level");
  setFeedback(`${playerName} was removed from the leaderboard and reset. Other players stay live with their scores. Enter the name again, then press Start Game to rejoin.`, "good");
}

function resetEntireGame() {
  const code = window.prompt("Enter the reset code to remove every player and restart the whole game.");
  if (code === null) {
    return;
  }

  if (code.trim() !== "1433") {
    setFeedback("Wrong code. The full game was not reset.", "bad");
    playSound("bad");
    return;
  }

  resetLeaderboardVisuals();
  persistScores([], { sendRequest: resetRemoteScores });
  clearCurrentRun({ keepPlayerName: "" });
  renderLeaderboard();
  playSound("finish");
  setFeedback("The entire game has been reset and all players were removed.", "good");
}

function prepareQuestionState() {
  const question = state.currentQuestion;
  state.attemptsUsed = 0;
  state.selectedChoice = null;
  state.selectedPicture = null;
  state.optionOrder = [];
  state.bankWords = [];
  state.answerWords = [];
  state.revealCorrect = false;

  if (question?.type === "mc") {
    state.optionOrder = shuffle([...question.choices]);
  } else if (question?.type === "picture") {
    state.optionOrder = shuffle([...question.options]);
  } else if (question?.type === "scramble") {
    state.bankWords = shuffle([...question.tokens]);
  }
}

function renderQuestion() {
  const question = state.currentQuestion;
  preloadQuestionImages(question);

  if (!question) {
    ui.promptTitle.textContent = "The timed run is finished.";
    ui.promptSource.textContent = "Enter another name to play again.";
    ui.questionArea.innerHTML = `<div class="empty-state large">Great job! The total score has been saved to the leaderboard.</div>`;
    ui.checkButton.classList.add("hidden");
    ui.resetButton.classList.add("hidden");
    updateStats();
    return;
  }

  ui.promptTitle.textContent = question.prompt;
  ui.promptSource.textContent = question.helper ? `${question.helper} Source: ${question.source}` : `Source: ${question.source}`;
  ui.checkButton.classList.toggle("hidden", question.type !== "scramble");
  ui.resetButton.classList.toggle("hidden", question.type !== "scramble");

  if (question.type === "mc") {
    renderMultipleChoice(question);
  } else if (question.type === "picture") {
    renderPictureMatch(question);
  } else {
    renderScramble(question);
  }

  bindQuestionImages(ui.questionArea);
  updateStats();
}

function renderMultipleChoice(question) {
  ui.questionArea.innerHTML = `
    <div class="choice-grid">
      ${state.optionOrder
        .map((choice) => {
          const selected = state.selectedChoice === choice;
          const correct = state.revealCorrect && choice === question.answer;
          const wrong = state.revealCorrect && selected && choice !== question.answer;
          return `
            <button class="choice-card ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" type="button" data-choice="${escapeHtml(choice)}">
              <span class="choice-letter">${escapeHtml(String.fromCharCode(65 + state.optionOrder.indexOf(choice)))}</span>
              <span>${escapeHtml(choice)}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function roleIcon(role) {
  if (role === "female") {
    return "👩";
  }
  if (role === "male") {
    return "👨";
  }
  return "🧑‍🤝‍🧑";
}

function renderPictureMatch(question) {
  const promptScene = SCENES[question.answer];
  ui.questionArea.innerHTML = `
    <div class="picture-stage">
      <div class="picture-target-card">
        <div class="picture-target-copy">
          <span class="picture-target-label">Look At This Picture</span>
          <h4>${escapeHtml(question.prompt)}</h4>
          <p>${escapeHtml(question.helper || "Find the same picture in the choices below.")}</p>
        </div>
        <div class="picture-target-visual">
          ${
            promptScene?.image
              ? imageMarkup(promptScene.image, promptScene.text, "picture-target-image", "Picture clue", promptScene.text)
              : `<div class="scene-photo-fallback">${promptScene.icons.map((icon) => `<span>${icon}</span>`).join("")}</div>`
          }
        </div>
      </div>
      <div class="scene-grid">
      ${state.optionOrder
        .map((option) => {
          const scene = SCENES[option];
          const selected = state.selectedPicture === option;
          const correct = state.revealCorrect && option === question.answer;
          const wrong = state.revealCorrect && selected && option !== question.answer;
          return `
            <button class="scene-card ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" type="button" data-picture="${option}">
              <div class="scene-photo-wrap">
                ${
                  scene.image
                    ? imageMarkup(scene.image, scene.text, "scene-photo", scene.title, scene.text)
                    : `<div class="scene-photo-fallback">${scene.icons.map((icon) => `<span>${icon}</span>`).join("")}</div>`
                }
              </div>
              <div class="scene-top">
                <span class="avatar-badge">${roleIcon(scene.role)}</span>
                <strong>${escapeHtml(scene.title)}</strong>
              </div>
              <div class="scene-copy">
                <div class="scene-icons">${scene.icons.map((icon) => `<span>${icon}</span>`).join("")}</div>
              <p>${escapeHtml(scene.text)}</p>
              <small>${escapeHtml(scene.footer)}</small>
              </div>
            </button>
          `;
        })
        .join("")}
      </div>
    </div>
  `;
  bindQuestionImages(ui.questionArea);
}

function renderScramble(question) {
  const visual = question.visual;
  ui.questionArea.innerHTML = `
    <div class="workspace">
      <div class="scramble-target-card">
        <div class="picture-target-copy">
          <span class="picture-target-label">Use This Picture Clue</span>
          <h4>${escapeHtml(question.hint)}</h4>
          <p>Drag the words into the correct order to answer the hint with the matching sentence.</p>
        </div>
        <div class="picture-target-visual">
          ${
            visual.kind === "repeat"
              ? `<div class="repeat-visual repeat-count-${Math.min(visual.count, 5)}">${Array.from({ length: visual.count }, (_, index) => imageMarkup(visual.image, `${visual.alt} ${index + 1}`, "repeat-visual-image", visual.label, `${visual.count} ${visual.alt.toLowerCase()}${visual.count > 1 ? "s" : ""}`)).join("")}</div>`
              : imageMarkup(visual.image, visual.alt, "picture-target-image", visual.label, question.hint)
          }
        </div>
      </div>
      <div class="workspace-block">
        <p class="workspace-label">Scrambled words</p>
        <div id="wordBank" class="word-bank"></div>
      </div>
      <div class="workspace-block">
        <p class="workspace-label">Your sentence</p>
        <div id="answerTray" class="answer-tray"></div>
      </div>
    </div>
  `;

  const wordBank = document.getElementById("wordBank");
  const answerTray = document.getElementById("answerTray");

  wordBank.innerHTML = state.bankWords.length
    ? state.bankWords
        .map((word, index) => `<button class="word-tile bank" type="button" data-area="bank" data-index="${index}">${escapeHtml(word)}</button>`)
        .join("")
    : `<p class="empty-state">All words are in your sentence tray.</p>`;

  answerTray.innerHTML = state.answerWords.length
    ? state.answerWords
        .map((word, index) => `<button class="word-tile answer" type="button" data-area="answer" data-index="${index}">${escapeHtml(word)}</button>`)
        .join("")
    : `<p class="empty-state">Drag the words here in the correct order.</p>`;

  [...ui.questionArea.querySelectorAll(".word-tile")].forEach((button) => {
    button.addEventListener("pointerdown", handleTileDragStart);
  });
  bindQuestionImages(ui.questionArea);
}

function moveWordBetweenAreas(sourceArea, sourceIndex, targetArea, targetIndex = null) {
  const sourceList = sourceArea === "bank" ? state.bankWords : state.answerWords;
  const targetList = targetArea === "bank" ? state.bankWords : state.answerWords;
  if (!sourceList[sourceIndex]) {
    return;
  }

  const [word] = sourceList.splice(sourceIndex, 1);
  if (sourceArea === targetArea && targetIndex !== null && sourceIndex < targetIndex) {
    targetIndex -= 1;
  }
  if (targetIndex === null || targetIndex > targetList.length) {
    targetList.push(word);
  } else {
    targetList.splice(targetIndex, 0, word);
  }
}

function handleTileDragStart(event) {
  if (!state.gameActive || state.awaitingNext) {
    return;
  }

  const button = event.currentTarget;
  const area = button.dataset.area;
  const index = Number(button.dataset.index);
  const word = area === "bank" ? state.bankWords[index] : state.answerWords[index];
  if (!word) {
    return;
  }

  event.preventDefault();
  playSound("click");

  const rect = button.getBoundingClientRect();
  const ghost = button.cloneNode(true);
  ghost.classList.add("drag-ghost");
  ghost.style.width = `${rect.width}px`;
  ghost.style.left = `${rect.left}px`;
  ghost.style.top = `${rect.top}px`;
  document.body.appendChild(ghost);

  button.classList.add("dragging-source");
  state.dragItem = {
    area,
    index,
    word,
    ghost,
    sourceButton: button,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };

  updateDragGhostPosition(event.clientX, event.clientY);
  window.addEventListener("pointermove", handleTileDragMove);
  window.addEventListener("pointerup", handleTileDragEnd, { once: true });
}

function updateDragGhostPosition(clientX, clientY) {
  if (!state.dragItem?.ghost) {
    return;
  }
  state.dragItem.ghost.style.left = `${clientX - state.dragItem.offsetX}px`;
  state.dragItem.ghost.style.top = `${clientY - state.dragItem.offsetY}px`;
}

function handleTileDragMove(event) {
  updateDragGhostPosition(event.clientX, event.clientY);
}

function handleTileDragEnd(event) {
  window.removeEventListener("pointermove", handleTileDragMove);
  const dragItem = state.dragItem;
  state.dragItem = null;
  if (!dragItem) {
    return;
  }

  dragItem.sourceButton.classList.remove("dragging-source");
  dragItem.ghost.remove();

  const dropTarget = document.elementFromPoint(event.clientX, event.clientY);
  const tileTarget = dropTarget?.closest(".word-tile");
  const zoneTarget = dropTarget?.closest("#wordBank, #answerTray");

  if (!tileTarget && !zoneTarget) {
    renderScramble(state.currentQuestion);
    return;
  }

  const targetArea = tileTarget?.dataset.area || (zoneTarget?.id === "answerTray" ? "answer" : "bank");
  const targetIndex = tileTarget ? Number(tileTarget.dataset.index) : null;
  moveWordBetweenAreas(dragItem.area, dragItem.index, targetArea, targetIndex);
  renderScramble(state.currentQuestion);
}

function currentAnswerText() {
  return state.answerWords
    .map((word, index) => {
      if (index > 0 && /^[?.!,]$/.test(word)) {
        return word;
      }
      return `${index === 0 ? "" : " "}${word}`;
    })
    .join("");
}

function pointsForCurrentAttempt() {
  const level = currentLevel();
  return state.attemptsUsed === 0 ? level.points.firstTry : level.points.secondTry;
}

function awardPoints() {
  const points = pointsForCurrentAttempt();
  state.score += points;
  state.correctAnswers += 1;
  state.awaitingNext = true;
  updateStats();
  burstConfetti();
  playSound("good");
  return points;
}

function setNextQuestion() {
  state.currentQuestionIndex += 1;
  if (state.currentQuestionIndex >= state.currentQuestions.length) {
    advanceToNextLevel(`${currentLevel().label} is complete.`);
    return;
  }
  state.currentQuestion = state.currentQuestions[state.currentQuestionIndex];
  prepareQuestionState();
  renderQuestion();
}

function moveToNextQuestion() {
  clearNextQuestionTimeout();
  state.awaitingNext = false;
  setNextQuestion();
  setFeedback("Next question. Keep building your total score.", "");
}

function autoAdvanceToNextQuestion() {
  clearNextQuestionTimeout();
  state.nextQuestionTimeoutId = window.setTimeout(() => {
    state.nextQuestionTimeoutId = null;
    if (!state.gameActive && !state.currentQuestion) {
      return;
    }
    moveToNextQuestion();
  }, 1400);
}

function advanceToNextLevel(message) {
  stopTimer();
  clearNextQuestionTimeout();
  state.awaitingNext = false;
  if (currentLevel()) {
    state.completedLevelIds = [...new Set([...state.completedLevelIds, currentLevel().id])];
  }
  state.currentStageIndex += 1;

  if (state.currentStageIndex >= state.levelOrder.length) {
    finishGame();
    return;
  }

  state.currentLevelIndex = state.levelOrder[state.currentStageIndex];
  state.currentQuestionIndex = 0;
  state.currentQuestions = buildQuestionList(currentLevel().id);
  state.currentQuestion = state.currentQuestions[0];
  state.stageTimeLeft = currentLevel().duration;
  prepareQuestionState();
  renderQuestion();
  updateStats();
  startTimer();
  playSound("level");
  setFeedback(`${message} ${currentLevel().label} has started.`, "warn");
}

function revealAnswer(text) {
  state.revealCorrect = true;
  if (state.currentQuestion?.type === "scramble") {
    state.answerWords = [...state.currentQuestion.tokens];
    state.bankWords = [];
  }
  state.awaitingNext = true;
  renderQuestion();
  playSound("bad");
  setFeedback(`The correct answer is: ${text}`, "bad");
  autoAdvanceToNextQuestion();
}

function handleWrongAnswer(correctText) {
  if (state.attemptsUsed === 0) {
    state.attemptsUsed += 1;
    updateStats();
    playSound("click");
    setFeedback(`Not yet. One try left.`, "warn");
    return;
  }

  revealAnswer(correctText);
}

function submitMultipleChoice() {
  const question = state.currentQuestion;
  if (!state.selectedChoice) {
    setFeedback("Choose an answer first.", "warn");
    return;
  }

  if (state.selectedChoice === question.answer) {
    state.revealCorrect = true;
    const points = awardPoints();
    renderQuestion();
    setFeedback(`Correct! The correct answer is: ${question.answer} +${points} points.`, "good");
    autoAdvanceToNextQuestion();
    return;
  }

  handleWrongAnswer(question.answer);
}

function submitPictureMatch() {
  const question = state.currentQuestion;
  if (!state.selectedPicture) {
    setFeedback("Choose a picture card first.", "warn");
    return;
  }

  if (state.selectedPicture === question.answer) {
    state.revealCorrect = true;
    const points = awardPoints();
    renderQuestion();
    setFeedback(`Correct! The correct answer is: ${SCENES[question.answer].text} +${points} points.`, "good");
    autoAdvanceToNextQuestion();
    return;
  }

  handleWrongAnswer(SCENES[question.answer].text);
}

function submitScramble() {
  const answerText = currentAnswerText();
  if (!answerText) {
    setFeedback("Build the sentence first.", "warn");
    return;
  }

  if (answerText === state.currentQuestion.answer) {
    const points = awardPoints();
    setFeedback(`Correct! The correct answer is: ${state.currentQuestion.answer} +${points} points.`, "good");
    autoAdvanceToNextQuestion();
    return;
  }

  handleWrongAnswer(state.currentQuestion.answer);
}

function resetScramble() {
  if (!state.gameActive || state.currentQuestion?.type !== "scramble" || state.awaitingNext) {
    return;
  }
  state.bankWords = shuffle([...state.currentQuestion.tokens]);
  state.answerWords = [];
  playSound("click");
  renderScramble(state.currentQuestion);
  setFeedback("The words have been reset. Try again.", "");
}

function finishGame() {
  stopTimer();
  clearNextQuestionTimeout();
  state.gameActive = false;
  if (currentLevel()) {
    state.completedLevelIds = [...new Set([...state.completedLevelIds, currentLevel().id])];
  }
  state.currentQuestion = null;
  saveScore();
  renderLeaderboard();
  renderQuestion();
  updateStats();
  playSound("finish");
  burstConfetti();
  setFeedback(`${state.currentPlayer} finished with ${state.score} total points.`, "good");
}

function saveScore() {
  if (!state.currentPlayer || !state.currentPlayerEntryId) {
    return;
  }

  const nextScores = upsertScoreEntry(loadScores(), {
    id: state.currentPlayerEntryId,
    name: state.currentPlayer,
    score: state.score,
    correctAnswers: state.correctAnswers,
    playedAt: Date.now(),
    live: false
  });
  persistScores(nextScores, {
    sendRequest: () =>
      upsertRemoteScore({
        id: state.currentPlayerEntryId,
        name: state.currentPlayer,
        score: state.score,
        correctAnswers: state.correctAnswers,
        playedAt: Date.now(),
        live: false
      })
  });
}

function loadScores() {
  return [...state.scores];
}

function snapshotScores(scores = loadScores()) {
  return JSON.stringify(
    [...scores]
      .sort((left, right) => String(left.id).localeCompare(String(right.id)))
      .map((entry) => [entry.id, entry.name, entry.score, entry.correctAnswers, entry.live])
  );
}

function upsertScoreEntry(scores, entry) {
  const filteredScores = scores.filter((item) => item.id !== entry.id);
  filteredScores.push(entry);
  return filteredScores;
}

function persistScores(nextScores, options = {}) {
  const { sendRequest } = options;
  state.scores = [...nextScores];
  state.scoresLoaded = true;
  lastLeaderboardSnapshot = snapshotScores(nextScores);
  renderLeaderboard();
  if (typeof sendRequest === "function") {
    sendRequest()
      .then((scores) => {
        if (Array.isArray(scores)) {
          if (state.currentPlayerEntryId && scores.some((entry) => entry.id === state.currentPlayerEntryId)) {
            state.currentPlayerSynced = true;
            state.remoteMissingCount = 0;
          }
          persistScores(scores);
        }
      })
      .catch(() => {
        setFeedback("The shared leaderboard is reconnecting. Your game can continue.", "warn");
      });
  }
}

function syncCurrentPlayerEntry() {
  if (!state.currentPlayer || !state.currentPlayerEntryId) {
    return;
  }

  const entry = {
    id: state.currentPlayerEntryId,
    name: state.currentPlayer,
    score: state.score,
    correctAnswers: state.correctAnswers,
    playedAt: Date.now(),
    live: state.gameActive
  };
  const nextScores = upsertScoreEntry(loadScores(), entry);
  persistScores(nextScores, { sendRequest: () => upsertRemoteScore(entry) });
}

function renderLeaderboard() {
  const scores = loadScores()
    .sort((left, right) => right.score - left.score || right.correctAnswers - left.correctAnswers || left.playedAt - right.playedAt);

  if (!state.scoresLoaded) {
    ui.leaderboard.innerHTML = `<p class="empty-state">Loading the shared leaderboard...</p>`;
    return;
  }

  if (!scores.length) {
    ui.leaderboard.innerHTML = `<p class="empty-state">No shared scores yet. Start the first game to fill the leaderboard.</p>`;
    return;
  }

  ui.leaderboard.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Score</th>
          <th>Correct</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
        ${scores
          .map((entry, index) => {
            const previousPosition = leaderboardVisualState.positions.get(entry.id);
            const previousScore = leaderboardVisualState.scores.get(entry.id);
            const movedUp = previousPosition !== undefined && index < previousPosition;
            const movedDown = previousPosition !== undefined && index > previousPosition;
            const scoreChanged = previousScore !== undefined && entry.score > previousScore;
            const rowClasses = [movedUp ? "leaderboard-up" : "", movedDown ? "leaderboard-down" : "", scoreChanged ? "leaderboard-score-flash" : ""]
              .filter(Boolean)
              .join(" ");
            return `
              <tr class="${rowClasses}">
                <td>${index + 1}</td>
                <td>${escapeHtml(entry.name)} ${entry.live ? '<span class="live-badge">LIVE</span>' : ""} ${movedUp ? '<span class="rank-shift up">▲ Up</span>' : ""} ${movedDown ? '<span class="rank-shift down">▼ Down</span>' : ""}</td>
                <td class="${scoreChanged ? "score-pop" : ""}">${entry.score}</td>
                <td>${entry.correctAnswers}</td>
                <td>
                  <button class="remove-player-button" type="button" data-entry-id="${entry.id}">
                    Remove Player
                  </button>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  leaderboardVisualState.positions = new Map(scores.map((entry, index) => [entry.id, index]));
  leaderboardVisualState.scores = new Map(scores.map((entry) => [entry.id, entry.score]));
}

function removeLeaderboardEntry(entryId) {
  const code = window.prompt("Enter the remove code to delete this player.");
  if (code === null) {
    return;
  }

  if (code.trim() !== "143") {
    setFeedback("Wrong code. The player was not removed.", "bad");
    playSound("bad");
    return;
  }

  removeEntryLocally(entryId);
  deleteRemoteScore(entryId)
    .then((scores) => {
      if (Array.isArray(scores)) {
        persistScores(scores);
      }
    })
    .catch(() => {
      setFeedback("The shared leaderboard is reconnecting. Your game can continue.", "warn");
    });
  if (entryId === state.currentPlayerEntryId) {
    clearCurrentRun({ keepPlayerName: "" });
  }
  setFeedback("Player removed from the leaderboard.", "good");
  playSound("good");
}

function handleRemoteRemoval(scores) {
  if (!state.currentPlayerEntryId || !state.currentPlayerSynced) {
    return;
  }

  const playerStillExists = scores.some((entry) => entry.id === state.currentPlayerEntryId);
  if (playerStillExists) {
    state.remoteMissingCount = 0;
    return;
  }

  if (!state.currentPlayer) {
    return;
  }

  state.remoteMissingCount += 1;
  if (state.gameActive && state.remoteMissingCount < 4) {
    syncCurrentPlayerEntry();
    return;
  }

  if (!state.gameActive && state.remoteMissingCount < 4) {
    return;
  }

  clearCurrentRun({ keepPlayerName: "" });
  setFeedback("This player was removed from the leaderboard by the teacher.", "warn");
}

async function refreshLeaderboardIfNeeded() {
  if (state.syncInFlight) {
    return;
  }
  state.syncInFlight = true;
  try {
    const scores = await fetchRemoteScores();
    handleRemoteRemoval(scores);
    const currentSnapshot = snapshotScores(scores);
    if (currentSnapshot !== lastLeaderboardSnapshot) {
      state.scores = scores;
      state.scoresLoaded = true;
      lastLeaderboardSnapshot = currentSnapshot;
      renderLeaderboard();
      return;
    }
    state.scoresLoaded = true;
  } catch {
    state.scoresLoaded = true;
  } finally {
    state.syncInFlight = false;
  }
}

function startLeaderboardSync() {
  if (state.leaderboardRefreshId) {
    return;
  }
  state.leaderboardRefreshId = window.setInterval(() => {
    refreshLeaderboardIfNeeded();
  }, 500);
}

function fetchRemoteScores() {
  if (hasSupabaseBackend()) {
    return fetch(supabaseEndpoint("leaderboard_entries?select=*&limit=500"), {
      headers: supabaseHeaders(),
      cache: "no-store"
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed Supabase fetch"))))
      .then((scores) => (Array.isArray(scores) ? normalizeSupabaseScores(scores) : []));
  }

  return fetch(API_BASE, { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed leaderboard fetch"))))
    .then((scores) => (Array.isArray(scores) ? scores : []))
    .catch(() => localScoresStore());
}

function upsertRemoteScore(entry) {
  if (hasSupabaseBackend()) {
    return fetch(supabaseEndpoint("leaderboard_entries?on_conflict=id"), {
      method: "POST",
      headers: supabaseHeaders({
        Prefer: "resolution=merge-duplicates,return=representation"
      }),
      body: JSON.stringify([toSupabaseScore(entry)])
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed Supabase save"))))
      .then((scores) => (Array.isArray(scores) ? normalizeSupabaseScores(scores) : []))
      .then(() => fetchRemoteScores());
  }

  return fetch(`${API_BASE}/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ entry })
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed leaderboard save"))))
    .catch(() => {
      const scores = upsertScoreEntry(localScoresStore(), entry);
      return saveLocalScoresStore(scores);
    });
}

function deleteRemoteScore(entryId) {
  if (hasSupabaseBackend()) {
    return fetch(supabaseEndpoint(`leaderboard_entries?id=eq.${encodeURIComponent(entryId)}`), {
      method: "DELETE",
      headers: supabaseHeaders({
        Prefer: "return=representation"
      })
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed Supabase delete"))))
      .then(() => fetchRemoteScores());
  }

  return fetch(`${API_BASE}/${encodeURIComponent(entryId)}`, {
    method: "DELETE"
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed leaderboard delete"))))
    .catch(() => {
      const scores = localScoresStore().filter((entry) => entry.id !== entryId);
      return saveLocalScoresStore(scores);
    });
}

function resetRemoteScores() {
  if (hasSupabaseBackend()) {
    return fetchRemoteScores().then((scores) =>
      Promise.all(scores.map((entry) => deleteRemoteScore(entry.id))).then(() => [])
    );
  }

  return fetch(`${API_BASE}/reset`, {
    method: "POST"
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed leaderboard reset"))))
    .catch(() => {
      saveLocalScoresStore([]);
      return [];
    });
}

function currentPublicGameUrl() {
  return window.location.href.split("#")[0];
}

function setQrForUrl(url) {
  const safeUrl = url || currentPublicGameUrl();
  ui.shareLink.href = safeUrl;
  ui.shareLink.textContent = safeUrl;

  const localFallback = `./game-qr.svg?v=${encodeURIComponent(safeUrl)}`;
  ui.qrImage.onerror = () => {
    ui.qrImage.onerror = () => {};
    ui.qrImage.src = localFallback;
  };
  ui.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(safeUrl)}`;
}

function loadShareLink() {
  fetch("./share-url.txt")
    .then((response) => (response.ok ? response.text() : ""))
    .then((text) => {
      const url = text.trim() || currentPublicGameUrl();
      setQrForUrl(url);
    })
    .catch(() => {
      setQrForUrl(currentPublicGameUrl());
    });
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  ui.soundToggle.textContent = state.soundOn ? "Sound On" : "Sound Off";
  ui.soundToggle.setAttribute("aria-pressed", String(state.soundOn));
  playSound("click");
}

ui.playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startGame();
});

ui.startLevel.addEventListener("change", () => {
  if (!state.gameActive) {
    updateStats();
  }
});

ui.roadmapCards.forEach((card) => {
  card.addEventListener("click", () => {
    chooseStartLevel(Number(card.dataset.levelId));
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseStartLevel(Number(card.dataset.levelId));
    }
  });
});

ui.soundToggle.addEventListener("click", toggleSound);
ui.restartButton.addEventListener("click", restartCurrentPlayer);
ui.resetGameButton.addEventListener("click", resetEntireGame);
ui.checkButton.addEventListener("click", submitScramble);
ui.resetButton.addEventListener("click", resetScramble);

ui.questionArea.addEventListener("click", (event) => {
  const button = event.target.closest(".choice-card, .scene-card");
  if (!button || !state.gameActive || state.awaitingNext) {
    return;
  }

  playSound("click");

  if (button.classList.contains("choice-card")) {
    state.selectedChoice = button.dataset.choice;
    renderMultipleChoice(state.currentQuestion);
    submitMultipleChoice();
  } else if (button.classList.contains("scene-card")) {
    state.selectedPicture = button.dataset.picture;
    renderPictureMatch(state.currentQuestion);
    submitPictureMatch();
  }
});

ui.questionArea.addEventListener(
  "error",
  (event) => {
    const image = event.target.closest("img");
    if (!image) {
      return;
    }
    image.classList.add("is-hidden");
    const shell = image.closest(".image-shell");
    const fallback = shell?.querySelector(".image-fallback");
    if (fallback) {
      fallback.classList.remove("is-hidden");
    }
  },
  true
);

ui.leaderboard.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-player-button");
  if (!button) {
    return;
  }
  removeLeaderboardEntry(button.dataset.entryId);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

renderLanguageBank();
lastLeaderboardSnapshot = snapshotScores();
renderLeaderboard();
warmImageAssets();
loadShareLink();
showIdleState();
updateStats();
startLeaderboardSync();
refreshLeaderboardIfNeeded();
