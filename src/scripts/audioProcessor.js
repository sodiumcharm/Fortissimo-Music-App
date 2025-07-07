import { eqSetter, createKnob } from "./draggableUi.js";

export const audio = document.querySelector(".audio-player");
export const eqBtn = document.querySelector(".eq-btn");

const canvas = document.querySelector(".canvas");

const subBassTrack = document.querySelector(".sub-bass-track");
const subBassThumb = document.querySelector(".sub-bass-thumb");
let isDraggingSubBass = false;

const bassTrack = document.querySelector(".bass-track");
const bassThumb = document.querySelector(".bass-thumb");
let isDraggingBass = false;

const lowmidTrack = document.querySelector(".lowmid-track");
const lowmidThumb = document.querySelector(".lowmid-thumb");
let isDraggingLowmid = false;

const midTrack = document.querySelector(".mid-track");
const midThumb = document.querySelector(".mid-thumb");
let isDraggingMid = false;

const highmidTrack = document.querySelector(".highmid-track");
const highmidThumb = document.querySelector(".highmid-thumb");
let isDraggingHighmid = false;

const trebleTrack = document.querySelector(".treble-track");
const trebleThumb = document.querySelector(".treble-thumb");
let isDraggingTreble = false;

let eqEnabled = false;
const eqToggleBtn = document.querySelector(".eq-toggle");

export const audioManipulator = function () {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audio);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      const r = 255;
      const g = 200 - barHeight / 2;
      const b = 50;

      // const r = 120;
      // const g = 200 - barHeight / 2;
      // const b = 50;

      // const r = 255 - barHeight / 2;
      // const g = 200;
      // const b = 255;

      // const r = 255 - barHeight / 2;
      // const g = 220;
      // const b = 150;

      // const r = 50;
      // const g = 150 - barHeight / 3;
      // const b = 255;

      // const r = 30;
      // const g = 200 - barHeight / 2;
      // const b = 150 + barHeight / 4;

      // const r = 180 + barHeight / 5;
      // const g = 50;
      // const b = 255 - barHeight / 4;

      // const r = 100 + barHeight / 2;
      // const g = 255 - barHeight / 3;
      // const b = 200 + barHeight / 5;

      // const r = 120 + barHeight / 2;
      // const g = 220;
      // const b = 30 + barHeight / 5;

      // const r = 180;
      // const g = 250 - barHeight / 2;
      // const b = 255;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  audio.onplay = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    draw();
  };

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

  const connectEQ = function () {
    // Always disconnect first to avoid multiple connections
    source.disconnect();
    disconnectStereoVolume();
    subBassEQ.disconnect();
    bassEQ.disconnect();
    lowMidEQ.disconnect();
    midEQ.disconnect();
    highMidEQ.disconnect();
    trebleEQ.disconnect();

    // Chain all EQ bands
    source
      .connect(analyser)
      .connect(subBassEQ)
      .connect(bassEQ)
      .connect(lowMidEQ)
      .connect(midEQ)
      .connect(highMidEQ)
      .connect(trebleEQ)
      .connect(splitter);
    // .connect(audioCtx.destination);

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

    // Bypass EQ: connect source directly to destination
    source.connect(analyser).connect(audioCtx.destination);
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

  eqSetter(
    subBassTrack,
    subBassThumb,
    isDraggingSubBass,
    subBassEQ,
    ".sub-bass-display"
  );

  eqSetter(bassTrack, bassThumb, isDraggingBass, bassEQ, ".bass-display");

  eqSetter(
    lowmidTrack,
    lowmidThumb,
    isDraggingLowmid,
    lowMidEQ,
    ".lowmid-display"
  );

  eqSetter(midTrack, midThumb, isDraggingMid, midEQ, ".mid-display");

  eqSetter(
    highmidTrack,
    highmidThumb,
    isDraggingHighmid,
    highMidEQ,
    ".highmid-display"
  );

  eqSetter(
    trebleTrack,
    trebleThumb,
    isDraggingTreble,
    trebleEQ,
    ".treble-display"
  );

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
};