import { audio } from "./audioProcessor.js";
import { audioProfile } from "./settings.js";
import { updateVolumeBar } from "./draggableUi.js";

const keyPresses = new Set();

const isTyping = function (e) {
  const currentFocus = e.target.tagName.toLowerCase();

  return (
    currentFocus === "input" ||
    currentFocus === "textarea" ||
    e.target.isContentEditable
  );
};

export const initKeyHandler = function () {
  document.addEventListener("keydown", function (e) {
    console.log(e);

    if (isTyping(e)) return;

    keyPresses.add(e.key.toLowerCase());

    // HANDLING PLAY OR PAUSE

    if (e.key.toLowerCase() === " ") {
      e.preventDefault();

      const playbar = document.querySelector(".playbar");
      const playBtn = document.querySelector(".control-btn-play");

      if (playbar.classList.contains("hidden")) return;

      playBtn.click();
    }

    // HANDLING SEEKBAR

    if (
      e.key.toLowerCase() === "arrowright" ||
      e.key.toLowerCase() === "arrowleft"
    ) {
      e.preventDefault();

      if (!audio.src) return;

      if (e.key.toLowerCase() === "arrowright") audio.currentTime += 1;
      else if (e.key.toLowerCase() === "arrowleft") audio.currentTime -= 1;
    }

    if (
      (keyPresses.has("arrowright") && keyPresses.has("0")) ||
      (keyPresses.has("arrowleft") && keyPresses.has("0"))
    ) {
      e.preventDefault();

      if (!audio.src) return;

      if (keyPresses.has("arrowright") && keyPresses.has("0"))
        audio.currentTime += 10;
      if (keyPresses.has("arrowleft") && keyPresses.has("0"))
        audio.currentTime -= 10;
    }

    // HANDLING VOLUME

    if (e.key.toLowerCase() === "m") {
      e.preventDefault();

      if (!audioProfile.isMuted) {
        audio.volume = 0;
        updateVolumeBar(audio.volume, false);
      } else {
        audio.volume = audioProfile.currentVolume;
        updateVolumeBar(audio.volume, false);
      }

      audioProfile.isMuted = !audioProfile.isMuted;
    }

    if (
      e.key.toLowerCase() === "arrowup" ||
      e.key.toLowerCase() === "arrowdown"
    ) {
      e.preventDefault();

      if (e.key.toLowerCase() === "arrowup") {
        if (audio.volume <= 0.9) {
          audio.volume += 0.1;
        } else if (audio.volume > 0.9) {
          const diff = 1 - audio.volume;
          audio.volume += diff;
        }
      } else if (e.key.toLowerCase() === "arrowdown") {
        if (audio.volume >= 0.1) {
          audio.volume -= 0.1;
        } else if (audio.volume < 0.1) {
          audio.volume -= audio.volume;
        }
      }

      updateVolumeBar(audio.volume);
    }

    // LOOP HANDLING

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();

      const playlistLoopBtn = document.querySelector(".playlist-loop-btn");

      playlistLoopBtn.click();
    }

    if (keyPresses.has('s') && keyPresses.has('1')) {
      e.preventDefault();

      const songLoopBtn = document.querySelector(".song-loop-btn");

      songLoopBtn.click();
    }
  });

  document.addEventListener("keyup", function (e) {
    keyPresses.delete(e.key.toLowerCase());
  });
};
