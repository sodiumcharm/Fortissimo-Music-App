import WaveSurfer from "wavesurfer.js";
import { jsPDF } from "jspdf";
import {
  timeFormatter,
  lrcTimeFormatter,
  insertAtCursor,
  fileSizeConverter, percentageToValue, valueToPercentage,
  initDragResponse
} from "./utilities.js";

const fileInput = document.getElementById("file-input");
const fileDisplayer = document.querySelector(".file-display");
const sizeDisplayer = document.querySelector(".size-display");
const lrcSeekbar = document.querySelector(".lrc-seekbar");
const lrcPlay = document.querySelector(".lrc-play");
const lrcCurrentTime = document.querySelector(".lrc-currenttime");
const lrcDuration = document.querySelector(".lrc-duration");
const lrcDecrement = document.querySelector(".lrc-decrement");
const lrcIncrement = document.querySelector(".lrc-increment");
const captureBtn = document.querySelector(".capture");
const editor = document.querySelector(".editor");
const downloadBtn = document.querySelector(".download-lrc");
const renameInput = document.querySelector(".lrc-generator__rename");
const titleInput = document.querySelector(".lrc-generator__title");
const lrcFormatBtn = document.querySelector(".format-lrc-btn");
const pdfFormatBtn = document.querySelector(".format-pdf-btn");
const allFormatBtns = document.querySelectorAll(".format-btn");
const speedTrack = document.querySelector('.lrc-generator__track');
const speedThumb = document.querySelector('.lrc-generator__thumb');
const speedFill = document.querySelector('.lrc-generator__fill');
const speedDisplay = document.querySelector('.playbackrate-display');

let format = "pdf";

export const initLRCGenerator = function () {
  const styles = getComputedStyle(document.documentElement);
  const waveColor = styles.getPropertyValue("--primary-color");
  const progressColor = styles.getPropertyValue("--secondary-color");

  const height = lrcSeekbar.getBoundingClientRect().height;

  const wavesurfer = WaveSurfer.create({
    container: ".lrc-seekbar",
    waveColor,
    progressColor,
    height,
    responsive: true,
    barWidth: 2,
    cursorWidth: 3,
    cursorColor: "#fff",
  });

  fileInput.addEventListener("change", function () {
    const audioFile = fileInput.files[0];

    console.log(audioFile);

    if (!audioFile) return;

    const size = `${fileSizeConverter(audioFile.size, "mb")}MB`;

    fileDisplayer.textContent = audioFile ? audioFile.name : "No File";

    sizeDisplayer.textContent = audioFile ? size : "0MB";

    const url = URL.createObjectURL(audioFile);

    wavesurfer.stop();

    wavesurfer.empty();

    lrcPlay.innerHTML = '<ion-icon name="play"></ion-icon>';

    wavesurfer.load(url);

    wavesurfer.on("ready", function () {
      console.log(`Waveform ready!`);
    });

    renameInput.value = "MyLyrics";
  });

  wavesurfer.on("audioprocess", function () {
    lrcCurrentTime.textContent = timeFormatter(wavesurfer.getCurrentTime());
    lrcDuration.textContent = timeFormatter(wavesurfer.getDuration());
  });

  lrcPlay.addEventListener("click", function () {
    wavesurfer.playPause();

    if (wavesurfer.isPlaying()) {
      lrcPlay.innerHTML = '<ion-icon name="pause"></ion-icon>';
    } else {
      lrcPlay.innerHTML = '<ion-icon name="play"></ion-icon>';
    }
  });

  lrcDecrement.addEventListener("click", function () {
    const currentTime = wavesurfer.getCurrentTime();

    wavesurfer.setTime(currentTime - 10);
  });

  lrcIncrement.addEventListener("click", function () {
    const currentTime = wavesurfer.getCurrentTime();

    wavesurfer.setTime(currentTime + 10);
  });

  captureBtn.addEventListener("click", function () {
    const currentTime = wavesurfer.getCurrentTime();

    const timestamp = lrcTimeFormatter(currentTime);

    insertAtCursor(editor, timestamp);
  });

  const max = 2.5;
  const min = 0.5;

  const updateSpeed = function(value) {
    const percent = valueToPercentage(value, min, max);

    speedThumb.style.left = `${percent}%`;
    speedFill.style.width = `${percent}%`;
  }

  updateSpeed(1.0);

  const updateSpeedForDrag = function(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    const rect = speedTrack.getBoundingClientRect();

    const offsetX = clientX - rect.left;

    let percent = offsetX / rect.width;

    percent = Math.max(0, Math.min(1, percent)) * 100;

    const value = percentageToValue(percent, min, max);

    updateSpeed(value);

    wavesurfer.setPlaybackRate(value);

    speedDisplay.textContent = `${value.toFixed(1)}x`;
  }

  initDragResponse([updateSpeedForDrag, updateSpeedForDrag, 0], speedTrack);

  lrcFormatBtn.addEventListener("click", function () {
    format = "lrc";

    allFormatBtns.forEach((btn) => {
      btn.classList.remove("format--active");
    });

    this.classList.add("format--active");
  });

  pdfFormatBtn.addEventListener("click", function () {
    format = "pdf";

    allFormatBtns.forEach((btn) => {
      btn.classList.remove("format--active");
    });

    this.classList.add("format--active");
  });

  downloadBtn.addEventListener("click", function () {
    const lrcText = editor.value;

    if (lrcText.trim() === "") return;

    const fileName =
      renameInput.value.trim() === "" ? "MyLyrics" : renameInput.value;

    const title =
      titleInput.value.trim() === "" ? "My Lyrics" : titleInput.value;

    if (format === "lrc") {
      const lrcFormat = new Blob([lrcText], { type: "text/plain" });

      const downloadUrl = URL.createObjectURL(lrcFormat);

      const a = document.createElement("a");

      a.href = downloadUrl;

      a.download = `${fileName}.lrc`;

      a.click();

      URL.revokeObjectURL(downloadUrl);
    } else if (format === "pdf") {
      const doc = new jsPDF();

      const lines = lrcText.split("\n");

      let y = 20;

      doc.setFontSize(16);

      doc.setFont('helvetica', 'bold');

      doc.text(title, 105, 10, { align: "center" });

      doc.setFontSize(12);

      doc.setFont('helvetica', 'normal');

      lines.forEach((line, i) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }

        doc.text(line, 10, y);

        y += 10;
      });

      doc.save(`${fileName}.pdf`);
    }
  });
};
