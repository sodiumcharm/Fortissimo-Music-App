import { eqSetter, createKnob } from "./draggableUi.js";
import { audioProfile, settingsProfile } from "./settings.js";
import { presetCardMaker, valueToPercentage } from "./utilities.js";
import {
  createPreset,
  data,
  deletePreset,
  importPreset,
  removeImportedPreset,
  windowManager,
} from "./serverConnection.js";

const loadingText = document.querySelector(".loading-window__text");
const errorText = document.querySelector(".error-window__text");
const confirmText = document.querySelector(".confirmation-window__text");

export const audio = document.querySelector(".audio-player");
export const eqBtn = document.querySelector(".eq-btn");

export const canvas = document.querySelector(".canvas");

const eqContainer = document.querySelector(".equalizer-box");
const subBassTrack = document.querySelector(".sub-bass-track");
const subBassThumb = document.querySelector(".sub-bass-thumb");

const bassTrack = document.querySelector(".bass-track");
const bassThumb = document.querySelector(".bass-thumb");

const lowmidTrack = document.querySelector(".lowmid-track");
const lowmidThumb = document.querySelector(".lowmid-thumb");

const midTrack = document.querySelector(".mid-track");
const midThumb = document.querySelector(".mid-thumb");

const highmidTrack = document.querySelector(".highmid-track");
const highmidThumb = document.querySelector(".highmid-thumb");

const trebleTrack = document.querySelector(".treble-track");
const trebleThumb = document.querySelector(".treble-thumb");

const brillianceTrack = document.querySelector(".brilliance-track");
const brillianceThumb = document.querySelector(".brilliance-thumb");

const airTrack = document.querySelector(".air-track");
const airThumb = document.querySelector(".air-thumb");

let eqEnabled = false;
const eqToggleBtn = document.querySelector(".eq-toggle");
const presetDropDown = document.querySelector(".preset-display");
const presetDisplay = document.querySelector(".preset-displayer");
const presetBtnBox = document.querySelector(".preset-btns");

const displaySharedPresets = document.querySelector(".display-shared-presets");
const sharedPresetContainer = document.querySelector(
  ".shared-presets__container"
);
const importedPresetContainer = document.querySelector(
  ".imported-presets__container"
);
const presetNameInput = document.getElementById("preset-name-input");
const createPresetForPublish = document.querySelector(".create-preset__btn");
const captureBtn = document.querySelector(".capture-eq");
const publishedPresetContainer = document.querySelector(
  ".published-presets__container"
);

const eqPresets = {
  pop: {
    subBass: 4,
    bass: 3,
    lowMid: 2,
    mid: 2,
    highMid: 3,
    treble: 4,
    brilliance: 5,
    air: 4,
  },
  rock: {
    subBass: 6,
    bass: 4,
    lowMid: 2,
    mid: 0,
    highMid: 2,
    treble: 3,
    brilliance: 4,
    air: 4,
  },
  jazz: {
    subBass: 2,
    bass: 2,
    lowMid: 3,
    mid: 4,
    highMid: 3,
    treble: 2,
    brilliance: 2,
    air: 1,
  },
  bassBoost: {
    subBass: 12,
    bass: 10,
    lowMid: 6,
    mid: 0,
    highMid: -2,
    treble: -4,
    brilliance: -6,
    air: -6,
  },
  vocal: {
    subBass: -2,
    bass: -2,
    lowMid: 1,
    mid: 4,
    highMid: 6,
    treble: 3,
    brilliance: 1,
    air: 0,
  },
  classical: {
    subBass: 2,
    bass: 1,
    lowMid: 0,
    mid: 1,
    highMid: 2,
    treble: 3,
    brilliance: 3,
    air: 2,
  },
  night: {
    subBass: 0,
    bass: 0,
    lowMid: -2,
    mid: -4,
    highMid: -6,
    treble: -10,
    brilliance: -12,
    air: -15,
  },
  trebleBoost: {
    subBass: -4,
    bass: -4,
    lowMid: -2,
    mid: 0,
    highMid: 2,
    treble: 6,
    brilliance: 8,
    air: 10,
  },
};

export const audioManipulator = function () {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audio);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const booster = audioCtx.createGain();

  const analyser = audioCtx.createAnalyser();

  const monoSplitter = audioCtx.createChannelSplitter(2);
  const monoMerger = audioCtx.createChannelMerger(2);

  const lfoInducedGain = audioCtx.createGain();

  source.connect(analyser);
  analyser.connect(lfoInducedGain);
  lfoInducedGain.connect(booster);
  booster.connect(monoSplitter);
  monoMerger.connect(audioCtx.destination);

  // *************************************************************
  // MANAGING TREMOLO EFFECT
  // *************************************************************

  const lfo = audioCtx.createOscillator();

  lfo.start();

  const enableTremolo = function () {
    lfo.type = audioProfile.lfoType;

    lfoInducedGain.gain.value = 0.5;

    lfo.frequency.value = audioProfile.lfoFrequency;

    lfo.connect(lfoInducedGain.gain);
  };

  const disableTremolo = function () {
    lfoInducedGain.gain.value = 1;
    lfo.disconnect();
  };

  const tremoloManager = function () {
    requestAnimationFrame(tremoloManager);

    if (audioProfile.tremoloEnabled) enableTremolo();
    else disableTremolo();
  };

  // *************************************************************
  // MANAGING VOLUME NORMALISATION
  // *************************************************************

  const normalizationGain = audioCtx.createGain();

  normalizationGain.gain.value = 1;

  const normalizationAnalyser = audioCtx.createAnalyser();

  normalizationAnalyser.fftSize = 2048;

  const normalizationBuffer = new Uint8Array(normalizationAnalyser.fftSize);

  const estimateRMS = function () {
    normalizationAnalyser.getByteTimeDomainData(normalizationBuffer);
    let sum = 0;
    for (let i = 0; i < normalizationBuffer.length; i++) {
      const val = (normalizationBuffer[i] - 128) / 128;
      sum += val * val;
    }
    return Math.sqrt(sum / normalizationBuffer.length);
  };

  const normalizeVolumeLoop = function () {
    if (audioProfile.normalizeVolume) {
      const targetRMS = 0.05;
      const currentRMS = estimateRMS();
      if (currentRMS > 0.001) {
        let gain = targetRMS / currentRMS;
        gain = Math.max(0.5, Math.min(gain, 2.0)); // Clamp gain
        normalizationGain.gain.setTargetAtTime(gain, audioCtx.currentTime, 0.2);
      }
    } else {
      normalizationGain.gain.value = 1;
    }

    requestAnimationFrame(normalizeVolumeLoop);
  };

  const connectNormalization = function () {
    source.disconnect();
    source.connect(normalizationGain);
    normalizationGain.connect(normalizationAnalyser);
    normalizationGain.connect(analyser);
    normalizeVolumeLoop();
  };

  // *************************************************************
  // MANAGING VISUALIZER
  // *************************************************************

  const drawBars = function () {
    requestAnimationFrame(drawBars);

    analyser.fftSize = audioProfile.fftSize;

    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      let r, g, b;

      if (canvas.dataset.colorcode === "1") {
        r = 255;
        g = 200 - barHeight / 2;
        b = 50;
      } else if (canvas.dataset.colorcode === "2") {
        r = 120;
        g = 200 - barHeight / 2;
        b = 50;
      } else if (canvas.dataset.colorcode === "3") {
        r = 255 - barHeight / 2;
        g = 200;
        b = 255;
      } else if (canvas.dataset.colorcode === "4") {
        r = 255 - barHeight / 2;
        g = 220;
        b = 150;
      } else if (canvas.dataset.colorcode === "5") {
        r = 50;
        g = 150 - barHeight / 3;
        b = 255;
      } else if (canvas.dataset.colorcode === "6") {
        r = 200;
        g = 200 - barHeight;
        b = 150 + barHeight / 4;
      } else if (canvas.dataset.colorcode === "7") {
        r = 180 + barHeight / 5;
        g = 50;
        b = 255 - barHeight / 4;
      } else if (canvas.dataset.colorcode === "8") {
        r = 100 + barHeight / 2;
        g = 255 - barHeight / 3;
        b = 200 + barHeight / 5;
      } else if (canvas.dataset.colorcode === "9") {
        r = 120 + barHeight / 2;
        g = 220;
        b = 30 + barHeight / 5;
      } else if (canvas.dataset.colorcode === "10") {
        r = 180;
        g = 250 - barHeight / 2;
        b = 255;
      } else if (canvas.dataset.colorcode === "custom") {
        ctx.fillStyle = settingsProfile.customVisualizerColor;
      }

      if (
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].includes(
          canvas.dataset.colorcode
        )
      ) {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      }

      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  // *************************************************************
  // MANAGING VOLUME BOOSTING
  // *************************************************************

  const volumeBooster = function () {
    requestAnimationFrame(volumeBooster);
    booster.gain.value =
      audioProfile.castVolume === 0 ? 0 : audioProfile.boostValue;
  };

  // *************************************************************
  // MANAGING MONO MODE
  // *************************************************************

  const leftGainL = audioCtx.createGain();
  const leftGainR = audioCtx.createGain();
  const rightGainL = audioCtx.createGain();
  const rightGainR = audioCtx.createGain();

  const monoManager = function () {
    requestAnimationFrame(monoManager);

    const enableMono = function () {
      leftGainL.gain.value = 0.5;
      rightGainL.gain.value = 0.5;
      leftGainR.gain.value = 0.5;
      rightGainR.gain.value = 0.5;
    };

    const disableMono = function () {
      leftGainL.gain.value = 1;
      rightGainL.gain.value = 0;
      leftGainR.gain.value = 0;
      rightGainR.gain.value = 1;
    };

    if (audioProfile.monoEnabled) enableMono();
    else disableMono();
  };

  monoSplitter.connect(leftGainL, 0);
  monoSplitter.connect(rightGainL, 1);
  monoSplitter.connect(leftGainR, 0);
  monoSplitter.connect(rightGainR, 1);

  leftGainL.connect(monoMerger, 0, 0);
  rightGainL.connect(monoMerger, 0, 0);
  leftGainR.connect(monoMerger, 0, 1);
  rightGainR.connect(monoMerger, 0, 1);

  audio.onplay = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    connectNormalization();
    drawBars();
    volumeBooster();
    monoManager();
    tremoloManager();
  };

  // *************************************************************
  // MANAGING EQUALIZER AND STEREO VOLUME CONTROL
  // *************************************************************

  const createEQBand = function (
    audioCtx,
    frequency,
    Q = 1.0,
    initialGain = 0
  ) {
    const filter = audioCtx.createBiquadFilter();
    filter.type = "peaking";
    filter.frequency.value = frequency;
    filter.Q.value = Q;
    filter.gain.value = initialGain;
    return filter;
  };

  const splitter = audioCtx.createChannelSplitter(2);
  const merger = audioCtx.createChannelMerger(2);

  const leftGain = audioCtx.createGain();
  const rightGain = audioCtx.createGain();

  leftGain.gain.value = 1;
  rightGain.gain.value = 1;

  const connectStereoVolume = function () {
    splitter.connect(leftGain, 0); // Left channel
    splitter.connect(rightGain, 1); // Right channel

    leftGain.connect(merger, 0, 0); // Left → Left
    rightGain.connect(merger, 0, 1); // Right → Right

    merger.connect(audioCtx.destination); // Output
  };

  const disconnectStereoVolume = function () {
    splitter.disconnect();
    leftGain.disconnect();
    rightGain.disconnect();
    merger.disconnect();
  };

  const subBassEQ = createEQBand(audioCtx, 60);
  const bassEQ = createEQBand(audioCtx, 120);
  const lowMidEQ = createEQBand(audioCtx, 400);
  const midEQ = createEQBand(audioCtx, 1000);
  const highMidEQ = createEQBand(audioCtx, 2500);
  const trebleEQ = createEQBand(audioCtx, 6000);
  const brillianceEQ = createEQBand(audioCtx, 10000);
  const airEQ = createEQBand(audioCtx, 16000);

  const connectEQ = function () {
    // Always disconnect first to avoid multiple connections
    source.disconnect();
    normalizationGain.disconnect();
    normalizationAnalyser.disconnect();
    analyser.disconnect();
    lfoInducedGain.disconnect();
    booster.disconnect();
    disconnectStereoVolume();
    subBassEQ.disconnect();
    bassEQ.disconnect();
    lowMidEQ.disconnect();
    midEQ.disconnect();
    highMidEQ.disconnect();
    trebleEQ.disconnect();
    brillianceEQ.disconnect();
    airEQ.disconnect();

    // Chain all EQ bands
    source
      .connect(normalizationGain)
      .connect(normalizationAnalyser)
      .connect(analyser)
      .connect(lfoInducedGain)
      .connect(booster)
      .connect(subBassEQ)
      .connect(bassEQ)
      .connect(lowMidEQ)
      .connect(midEQ)
      .connect(highMidEQ)
      .connect(trebleEQ)
      .connect(brillianceEQ)
      .connect(airEQ)
      .connect(splitter);

    connectStereoVolume();
  };

  const disconnectEQ = function () {
    // Disconnect all nodes in the EQ chain
    source.disconnect();
    disconnectStereoVolume();
    subBassEQ.disconnect();
    bassEQ.disconnect();
    lowMidEQ.disconnect();
    midEQ.disconnect();
    highMidEQ.disconnect();
    trebleEQ.disconnect();
    brillianceEQ.disconnect();
    airEQ.disconnect();

    // Bypass EQ
    source
      .connect(normalizationGain)
      .connect(normalizationAnalyser)
      .connect(analyser)
      .connect(lfoInducedGain)
      .connect(booster)
      .connect(monoSplitter);

    monoMerger.connect(audioCtx.destination);
  };

  eqToggleBtn.addEventListener("click", () => {
    eqEnabled = !eqEnabled;

    if (eqEnabled) {
      connectEQ();
      eqToggleBtn.classList.add("btn--active");
      eqBtn.classList.remove("hidden");
    } else {
      disconnectEQ();
      eqToggleBtn.classList.remove("btn--active");
      eqBtn.classList.add("hidden");
    }
  });

  eqSetter(subBassTrack, subBassThumb, subBassEQ, ".sub-bass-display");

  eqSetter(bassTrack, bassThumb, bassEQ, ".bass-display");

  eqSetter(lowmidTrack, lowmidThumb, lowMidEQ, ".lowmid-display");

  eqSetter(midTrack, midThumb, midEQ, ".mid-display");

  eqSetter(highmidTrack, highmidThumb, highMidEQ, ".highmid-display");

  eqSetter(trebleTrack, trebleThumb, trebleEQ, ".treble-display");

  eqSetter(
    brillianceTrack,
    brillianceThumb,
    brillianceEQ,
    ".brilliance-display"
  );

  eqSetter(airTrack, airThumb, airEQ, ".air-display");

  presetDropDown.addEventListener("click", function () {
    presetBtnBox.classList.toggle("dropdown--hidden");
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".preset-display")) {
      presetBtnBox.classList.add("dropdown--hidden");
    }
  });

  const updateEQBarUI = function (dbGain, thumb, displayClass) {
    const displayer = document.querySelector(displayClass);
    const min = -15;
    const max = 15;

    const dbPercent = valueToPercentage(dbGain, min, max);
    const percent = 100 - dbPercent;

    thumb.style.top = `${percent}%`;
    displayer.textContent = `${Math.round(dbGain)}`.padStart(2, "0");
  };

  const applyPreset = function (preset) {
    subBassEQ.gain.value = preset.subBass;
    bassEQ.gain.value = preset.bass;
    lowMidEQ.gain.value = preset.lowMid;
    midEQ.gain.value = preset.mid;
    highMidEQ.gain.value = preset.highMid;
    trebleEQ.gain.value = preset.treble;
    brillianceEQ.gain.value = preset.brilliance;
    airEQ.gain.value = preset.air;

    updateEQBarUI(preset.subBass, subBassThumb, ".sub-bass-display");
    updateEQBarUI(preset.bass, bassThumb, ".bass-display");
    updateEQBarUI(preset.lowMid, lowmidThumb, ".lowmid-display");
    updateEQBarUI(preset.mid, midThumb, ".mid-display");
    updateEQBarUI(preset.highMid, highmidThumb, ".highmid-display");
    updateEQBarUI(preset.treble, trebleThumb, ".treble-display");
    updateEQBarUI(preset.brilliance, brillianceThumb, ".brilliance-display");
    updateEQBarUI(preset.air, airThumb, ".air-display");
  };

  eqContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("preset-btn")) {
      const btn = e.target;
      const btnName = e.target.textContent;
      presetDisplay.textContent = btnName;

      if (btn.dataset.preset === "pop") applyPreset(eqPresets.pop);
      else if (btn.dataset.preset === "rock") applyPreset(eqPresets.rock);
      else if (btn.dataset.preset === "jazz") applyPreset(eqPresets.jazz);
      else if (btn.dataset.preset === "bass-boost")
        applyPreset(eqPresets.bassBoost);
      else if (btn.dataset.preset === "vocal") applyPreset(eqPresets.vocal);
      else if (btn.dataset.preset === "classical")
        applyPreset(eqPresets.classical);
      else if (btn.dataset.preset === "night") applyPreset(eqPresets.night);
      else if (btn.dataset.preset === "treble-boost")
        applyPreset(eqPresets.trebleBoost);
    }
  });

  createKnob(
    document.querySelector(".left-knob"),
    leftGain,
    document.querySelector(".left-vol-display")
  );

  createKnob(
    document.querySelector(".right-knob"),
    rightGain,
    document.querySelector(".right-vol-display")
  );

  displaySharedPresets.addEventListener("click", function () {
    document.querySelector(".shared-presets").classList.remove("hidden");
  });

  sharedPresetContainer.addEventListener("click", async function (e) {
    if (
      e.target.closest(".preset-card") &&
      !e.target.closest(".preset-import-btn") &&
      !e.target.closest(".remove-import-btn")
    ) {
      const parentCard = e.target.closest(".preset-card");
      const id = parentCard.getAttribute("data-preset-id");

      for (const preset of data.presetData) {
        if (preset._id === id) {
          applyPreset(preset);
        }
      }
    }

    if (e.target.closest(".preset-import-btn")) {
      const parentCard = e.target.closest(".preset-card");
      const id = parentCard.getAttribute("data-preset-id");

      const imported = await importPreset(id);

      if (!imported) return;

      data.userData.importedPresets.push(id);

      for (const preset of data.presetData) {
        if (preset._id === id) {
          presetCardMaker(preset, "imported-presets__container");
        }
      }

      parentCard
        .querySelector(".preset-import-btn")
        .classList.add("collapse-hide");

      parentCard
        .querySelector(".remove-import-btn")
        .classList.remove("collapse-hide");

      confirmText.textContent = "Settings imported successfully.";
      windowManager(".confirmation-window", "show");
    }

    if (e.target.closest(".remove-import-btn")) {
      const parentCard = e.target.closest(".preset-card");
      const id = parentCard.getAttribute("data-preset-id");

      const removed = await removeImportedPreset(id);

      if (!removed) return;

      data.userData.importedPresets.splice(
        data.userData.importedPresets.indexOf(id),
        1
      );

      const target = importedPresetContainer.querySelector(
        `[data-preset-id="${id}"]`
      );

      target.classList.add("hidden");

      setTimeout(() => {
        target.remove();
      }, 400);

      parentCard
        .querySelector(".preset-import-btn")
        .classList.remove("collapse-hide");

      parentCard
        .querySelector(".remove-import-btn")
        .classList.add("collapse-hide");
    }
  });

  importedPresetContainer.addEventListener("click", function (e) {
    if (
      e.target.closest(".preset-card") &&
      !e.target.closest(".preset-import-btn") &&
      !e.target.closest(".remove-import-btn")
    ) {
      const parentCard = e.target.closest(".preset-card");
      const id = parentCard.getAttribute("data-preset-id");

      for (const preset of data.presetData) {
        if (preset._id === id) {
          applyPreset(preset);
        }
      }
    }

    if (e.target.closest(".remove-import-btn")) {
      const parentCard = e.target.closest(".preset-card");
      const id = parentCard.getAttribute("data-preset-id");

      const target = sharedPresetContainer.querySelector(
        `[data-preset-id="${id}"]`
      );

      const targetRemoveBtn = target.querySelector(".remove-import-btn");

      targetRemoveBtn.click();
    }
  });

  captureBtn.addEventListener("click", function () {
    windowManager(".create-preset", "show");
  });

  createPresetForPublish.addEventListener("click", async function () {
    const presetName = presetNameInput.value;

    if (presetName.trim() === "") return;

    const obj = {
      presetName,
      subBass: subBassEQ.gain.value,
      bass: bassEQ.gain.value,
      lowMid: lowMidEQ.gain.value,
      mid: midEQ.gain.value,
      highMid: highMidEQ.gain.value,
      treble: trebleEQ.gain.value,
      brilliance: brillianceEQ.gain.value,
      air: airEQ.gain.value,
    };

    loadingText.textContent = "Publishing settings";
    windowManager(".loading-window", "show");

    const created = await createPreset(obj);

    windowManager(".loading-window", "hide");

    if (!created) return;

    document.querySelector(".create-preset").classList.add("hidden");

    presetNameInput.value = "";

    confirmText.textContent = "Settings published";
    windowManager(".confirmation-window", "show");
  });

  publishedPresetContainer.addEventListener("click", async function (e) {
    if (
      !e.target.closest(".delete-preset-btn") &&
      e.target.closest(".preset-card")
    ) {
      const parentCard = e.target.closest(".preset-card");
      const id = parentCard.getAttribute("data-preset-id");

      for (const preset of data.presetData) {
        if (preset._id === id) {
          applyPreset(preset);
        }
      }
    }

    if (e.target.closest(".delete-preset-btn")) {
      const parentCard = e.target.closest(".preset-card");
      const id = parentCard.getAttribute("data-preset-id");

      const deleted = await deletePreset(id);

      if (!deleted) return;

      const target = sharedPresetContainer.querySelector(
        `[data-preset-id="${id}"]`
      );

      target.remove();

      parentCard.classList.add("hidden");

      setTimeout(() => {
        parentCard.remove();
      }, 400);
    }
  });
};
