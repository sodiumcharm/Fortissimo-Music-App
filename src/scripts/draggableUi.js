import {
  timeFormatter,
  valueToPercentage,
  percentageToValue,
} from "./utilities.js";
import { audioProfile } from "./settings.js";
import { audio } from "./audioProcessor.js";

export const initDraggableWindow = function (divider, container, leftSection) {
  let isDraggingUi = false;

  const updateLeftWidth = function (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    const rect = container.getBoundingClientRect();

    const pointerRelativeXpos = clientX - rect.left;

    const leftWidth = (pointerRelativeXpos / rect.width) * 100;

    if (leftWidth > 26 && leftWidth < 48) {
      leftSection.style.width = `${leftWidth}%`;
    }
  };

  divider.addEventListener("mousedown", function (e) {
    e.preventDefault();
    isDraggingUi = true;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDraggingUi) return;
    updateLeftWidth(e);
  });

  document.addEventListener("mouseup", function () {
    isDraggingUi = false;
  });

  divider.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isDraggingUi = true;
  });

  document.addEventListener("touchmove", function (e) {
    if (!isDraggingUi) return;
    updateLeftWidth(e);
  });

  document.addEventListener("touchend", function () {
    isDraggingUi = false;
  });
};

export const initDraggableFilterTags = function (filterContainer) {
  let startX;
  let scrollLeft;
  let isDown = false;

  const initialUpdate = function (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    const rect = filterContainer.getBoundingClientRect();

    startX = clientX - rect.left;

    scrollLeft = filterContainer.scrollLeft;
  };

  const finalUpdate = function (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    const rect = filterContainer.getBoundingClientRect();

    const x = clientX - rect.left;

    const walk = x - startX;

    filterContainer.scrollLeft = scrollLeft - walk;
  };

  filterContainer.addEventListener("mousedown", function (e) {
    isDown = true;

    initialUpdate(e);
  });

  filterContainer.addEventListener("mousemove", function (e) {
    if (isDown) {
      finalUpdate(e);
    }
  });

  filterContainer.addEventListener("mouseup", function (e) {
    isDown = false;
  });

  filterContainer.addEventListener("mouseleave", function (e) {
    isDown = false;
  });

  filterContainer.addEventListener("touchstart", function (e) {
    isDown = true;
    initialUpdate(e);
  });

  filterContainer.addEventListener("touchmove", function (e) {
    if (isDown) {
      finalUpdate(e);
    }
  });

  filterContainer.addEventListener("touchend", function (e) {
    isDown = false;
  });
};

export const initSeekbar = function (
  audio,
  seekbar,
  seekbarThumb,
  seekbarProgressFill,
  bufferedBar,
  currentTimeEl,
  totalDurationEl
) {
  let isDragging = false;

  const updateSeekbar = function (percentage) {
    seekbarThumb.style.left = `${percentage}%`;
    seekbarProgressFill.style.width = `${percentage}%`;
  };

  const updateSeekForDrag = function (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX; // handle touch/mouse
    const rect = seekbar.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(offsetX / rect.width, 1)); // clamp between 0 and 1

    const newTime = percentage * audio.duration;
    if (!isNaN(newTime)) {
      audio.currentTime = newTime;
    }

    // Move thumb and progress fill
    seekbarThumb.style.left = `${percentage * 100}%`;
    seekbarProgressFill.style.width = `${percentage * 100}%`;
  };

  const updateBuffered = function () {
    if (audio.buffered.length > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const duration = audio.duration;

      if (duration > 0) {
        const percentage = (bufferedEnd / duration) * 100;
        bufferedBar.style.width = `${percentage}%`;
      }
    }
  };

  setInterval(updateBuffered, 500);

  audio.addEventListener("timeupdate", function () {
    if (!isDragging) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      updateSeekbar(percentage);
    }

    currentTimeEl.textContent = timeFormatter(audio.currentTime);
    totalDurationEl.textContent = timeFormatter(audio.duration);
  });

  // Mouse Pointer Event Based Seekbar Dragging

  seekbar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    updateSeekForDrag(e); // Update immediately
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateSeekForDrag(e);
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (isDragging) {
      isDragging = false;
    }
  });

  // Touch Event based Seekbar Dragging

  seekbar.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isDragging = true;
    updateSeekForDrag(e); // Update immediately
  });

  document.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (isDragging) {
      updateSeekForDrag(e);
    }
  });

  document.addEventListener("touchend", (e) => {
    if (isDragging) {
      isDragging = false;
    }
  });

  document.addEventListener("touchcancel", (e) => {
    if (isDragging) {
      isDragging = false;
    }
  });
};

export const updateVolumeBar = function (percent, volumeThumb, volumeFill) {
  volumeThumb.style.left = `${percent * 100}%`;
  volumeFill.style.width = `${percent * 100}%`;
};

export const initVolumebar = function (
  audio,
  volumeBar,
  volumeThumb,
  volumeFill,
  volumeIconCont
) {
  let isDraggingVolume = false;

  const updateVolumeBar = function (percent) {
    volumeThumb.style.left = `${percent * 100}%`;
    volumeFill.style.width = `${percent * 100}%`;
  };

  const updateVolume = function (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX; // handle touch/mouse
    const rect = volumeBar.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percent = Math.max(0, Math.min(offsetX / rect.width, 1)); // reverse for bottom-up control
    audio.volume = percent;

    // Update UI
    updateVolumeBar(percent);

    if (audio.volume === 0) {
      volumeIconCont.innerHTML = '<ion-icon name="volume-mute"></ion-icon>';
    } else if (audio.volume > 0 && audio.volume < 0.34) {
      volumeIconCont.innerHTML = '<ion-icon name="volume-low"></ion-icon>';
    } else if (audio.volume >= 0.34 && audio.volume < 0.68) {
      volumeIconCont.innerHTML = '<ion-icon name="volume-medium"></ion-icon>';
    } else {
      volumeIconCont.innerHTML = '<ion-icon name="volume-high"></ion-icon>';
    }
  };

  // Mouse Based

  volumeBar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDraggingVolume = true;
    updateVolume(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDraggingVolume) {
      updateVolume(e);
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (isDraggingVolume) {
      isDraggingVolume = false;
    }
  });

  // Touch Based

  volumeBar.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isDraggingVolume = true;
    updateVolume(e); // Update immediately
  });

  document.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (isDraggingVolume) {
      updateVolume(e);
    }
  });

  document.addEventListener("touchend", (e) => {
    if (isDraggingVolume) {
      isDraggingVolume = false;
    }
  });

  document.addEventListener("touchcancel", (e) => {
    if (isDraggingVolume) {
      isDraggingVolume = false;
    }
  });
};

export const eqSetter = function (track, thumb, eqBand, displayer) {
  let condition = false;

  const updateEqBar = function (e) {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY; // handle touch/mouse

    const rect = track.getBoundingClientRect();

    let offsetY = clientY - rect.top;

    offsetY = Math.max(0, Math.min(offsetY, rect.height));

    thumb.style.top = `${offsetY}px`;

    const percent = 1 - offsetY / rect.height;

    const gain = percent * 30 - 15;

    eqBand.gain.value = gain;

    document.querySelector(`${displayer}`).textContent = `${Math.round(
      eqBand.gain.value
    )}`.padStart(2, "0");
  };

  thumb.addEventListener("mousedown", function (e) {
    condition = true;
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (condition) {
      updateEqBar(e);
    }
  });

  document.addEventListener("mouseup", function () {
    condition = false;
  });

  thumb.addEventListener("touchstart", function (e) {
    condition = true;
    e.preventDefault();
  });

  document.addEventListener("touchmove", function (e) {
    if (condition) {
      updateEqBar(e);
    }
  });

  document.addEventListener("touchend", function () {
    condition = false;
  });

  document.addEventListener("touchcancel", function () {
    condition = false;
  });
};

export const createKnob = function (knobEl, gainNode, displayer) {
  let isDragging = false;
  let angle = 0;
  let startAngle = 0;
  let startPointerAngle = 0;

  const minAngle = -135;
  const maxAngle = 135;

  const updateRotation = function (newAngle) {
    angle = Math.max(minAngle, Math.min(maxAngle, newAngle));
    knobEl.style.transform = `rotate(${angle}deg)`;
    const gain = (angle - minAngle) / (maxAngle - minAngle);
    gainNode.gain.value = gain;
    displayer.textContent = `${(gain * 100).toFixed(0)}`.padStart(2, "0");
  };

  const getAngleFromEvent = function (event, rect) {
    const touch = event.touches ? event.touches[0] : event;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const rad = Math.atan2(dy, dx);
    let deg = rad * (180 / Math.PI) - 90;
    if (deg < -180) deg += 360;
    if (deg > 180) deg -= 360;
    return deg;
  };

  const startDrag = function (e) {
    isDragging = true;
    e.preventDefault();

    const rect = knobEl.getBoundingClientRect();
    startPointerAngle = getAngleFromEvent(e, rect);
    startAngle = angle;
  };

  const onDrag = function (e) {
    if (!isDragging) return;

    const rect = knobEl.getBoundingClientRect();
    const currentPointerAngle = getAngleFromEvent(e, rect);
    let angleDelta = currentPointerAngle - startPointerAngle;

    // Normalize to prevent jumps across -180/180
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;

    updateRotation(startAngle + angleDelta);
  };

  const endDrag = function () {
    isDragging = false;
  };

  // Mouse events
  knobEl.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", endDrag);

  // Touch events
  knobEl.addEventListener("touchstart", startDrag, { passive: false });
  document.addEventListener("touchmove", onDrag, { passive: false });
  document.addEventListener("touchend", endDrag);

  // Sync knob with gain node's initial value
  const gainValue = gainNode.gain.value; // should be between 0 and 1
  const initialAngle = minAngle + gainValue * (maxAngle - minAngle);
  updateRotation(initialAngle);
};

export const initPlaybackSpeedSlider = function (track, thumb) {
  const min = 0.5;
  const max = 2.5;
  let isDragging = false;
  const resetBtn = document.querySelector(".playback-rate-reset");

  const updatePlaybackRateUI = function (value) {
    const percent = valueToPercentage(value, min, max);

    document.querySelector(".playback-rate-thumb").style.left = `${percent}%`;

    document.querySelector(".playback-rate-fill").style.width = `${percent}%`;

    document.querySelector(
      ".playback-rate-display"
    ).textContent = `${value.toFixed(1)}`;
  };

  updatePlaybackRateUI(audioProfile.playbackRate);

  const updatePlaybackRateForDrag = function (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    const rect = track.getBoundingClientRect();

    const offsetX = clientX - rect.left;

    const percent = (offsetX / rect.width) * 100;

    let value = percentageToValue(percent, min, max);

    value = Math.max(0.5, Math.min(2.5, value));

    updatePlaybackRateUI(value);

    audio.playbackRate = value;

    audioProfile.playbackRate = value;
  };

  thumb.addEventListener("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) updatePlaybackRateForDrag(e);
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  thumb.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isDragging = true;
  });

  document.addEventListener("touchmove", function (e) {
    if (isDragging) updatePlaybackRateForDrag(e);
  });

  document.addEventListener("touchend", function () {
    isDragging = false;
  });

  resetBtn.addEventListener("click", () => {
    updatePlaybackRateUI(1);
    audio.playbackRate = 1;
    audioProfile.playbackRate = 1;
  });
};
