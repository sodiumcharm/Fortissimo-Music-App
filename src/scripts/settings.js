import { canvas } from "./audioProcessor.js";
import { randomRGBGenerator, toHexColor } from "./utilities.js";

let visualizerIsOn = true;
let equalizerIsOn = false;

export const settingsProfile = {
  theme: "1",
  visualizerIsOn: true,
  visualizerColor: "1",
  eyeCareMode: false,
};

export const audioProfile = {
  playbackRate: 1,
  normalizeVolume: true,
  fftSize: 256,
  boostValue: 1.0,
};

export const loadSettings = function () {
  const saved = localStorage.getItem("fortissimoSettings");

  if (saved) {
    const settings = JSON.parse(saved);

    const targetTheme = document.querySelector(
      `[data-themecode="${settings.theme}"]`
    );

    const targetVisualizerColor = document.querySelector(
      `[data-color="${settings.visualizerColor}"]`
    );

    visualizerIsOn = settings.visualizerIsOn;

    settingsProfile.visualizerIsOn = visualizerIsOn;

    settingsProfile.eyeCareMode = settings.eyeCareMode;

    if (settings.eyeCareMode) {
      document.body.classList.add('eye-care-mode');
    }

    document.addEventListener("DOMContentLoaded", () => {
      targetTheme.click();
      targetVisualizerColor.click();
    });
  }
};

const saveSettings = function (settingsProfile) {
  localStorage.setItem("fortissimoSettings", JSON.stringify(settingsProfile));
};

export const initSettingsOptions = function (settingsTabs, settingsSections) {
  settingsTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = tab.dataset.settingstab;

      settingsSections.forEach((section) => {
        if (section.classList.contains(`${tabName}-container`))
          section.classList.remove("hide");
        else section.classList.add("hide");
      });

      document.querySelectorAll(".settings-tab-btn").forEach((btn) => {
        btn.classList.remove("bg-yel-grey-3");
      });

      tab.classList.add("bg-yel-grey-3");
    });
  });
};

export const initThemeColorBtns = function (btns, settingsProfile) {
  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const primaryColor = btn.dataset.theme;

      const rgb = btn.dataset.rgb;

      const secondaryColor = btn.dataset.secondary;

      document.documentElement.style.setProperty(
        "--primary-color",
        primaryColor
      );
      document.documentElement.style.setProperty("--primary-rgb", rgb);
      document.documentElement.style.setProperty(
        "--secondary-color",
        secondaryColor
      );

      document.querySelectorAll(".theme-color").forEach(function (btnEl) {
        btnEl.classList.remove("theme--active");
      });

      btn.classList.add("theme--active");

      const themeCode = btn.dataset.themecode;
      settingsProfile.theme = themeCode;

      saveSettings(settingsProfile);
    });
  });
};

export const initSettingsToggleBtn = function (settingsEl, settingsProfile) {
  const visOverlay = document.querySelectorAll(".overlay-vis");
  const eqOverlay = document.querySelectorAll(".overlay-eq");

  const updateToggle = function (
    condition,
    thumbClass,
    canvas = null,
    overlays = null
  ) {
    const thumb = document.querySelector(thumbClass);

    if (condition) {
      thumb.style.left = "100%";
      canvas?.classList.remove("hidden");
      overlays?.forEach((el) => el.classList.add("hidden"));
    } else {
      thumb.style.left = "0%";
      canvas?.classList.add("hidden");
      overlays?.forEach((el) => el.classList.remove("hidden"));
    }
  };

  updateToggle(visualizerIsOn, ".visualizer-thumb", canvas, visOverlay);

  updateToggle(equalizerIsOn, ".equalizer-thumb", null, eqOverlay);

  updateToggle(settingsProfile.eyeCareMode, ".eyecare-thumb");

  settingsEl.addEventListener("click", function (e) {
    if (e.target.closest(".visualizer-toggle")) {
      visualizerIsOn = !visualizerIsOn;

      updateToggle(visualizerIsOn, ".visualizer-thumb", canvas, visOverlay);

      settingsProfile.visualizerIsOn = visualizerIsOn;

      saveSettings(settingsProfile);
    }

    if (e.target.closest(".normalization-toggle")) {
      audioProfile.normalizeVolume = !audioProfile.normalizeVolume;

      updateToggle(audioProfile.normalizeVolume, ".normalization-thumb");
    }

    if (e.target.closest(".equalizer-toggle-2")) {
      equalizerIsOn = !equalizerIsOn;

      const targetBtn = document.querySelector(".eq-toggle");

      targetBtn.click();

      updateToggle(equalizerIsOn, ".equalizer-thumb", null, eqOverlay);
    }

    if (e.target.closest(".settings-eq-unhide")) {
      const targetBtn = document.querySelector(".eq-btn");

      targetBtn.click();
    }

    if (e.target.closest(".eyecare-toggle")) {
      document.body.classList.toggle("eye-care-mode");

      settingsProfile.eyeCareMode = !settingsProfile.eyeCareMode;

      updateToggle(settingsProfile.eyeCareMode, ".eyecare-thumb");

      saveSettings(settingsProfile);
    }
  });
};

export const initVisualizerColorOptions = function (
  visColorBtns,
  settingsProfile
) {
  visColorBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const colorCode = btn.dataset.color;

      canvas.setAttribute("data-colorcode", colorCode);

      visColorBtns.forEach((el) => {
        el.classList.remove("visualizer-color--active");
      });

      btn.classList.add("visualizer-color--active");

      settingsProfile.visualizerColor = colorCode;

      saveSettings(settingsProfile);
    });
  });
};

export const initSettingsInput = function () {
  const applyBtn = document.querySelector(".apply-custom-color");
  const inputVisColor = document.querySelector(".input-vis-color");

  applyBtn.addEventListener("click", function () {
    let inputColor = inputVisColor.value;

    if (inputColor === "") {
      inputVisColor.value = randomRGBGenerator();

      inputColor = inputVisColor.value;
    }

    const validColor = toHexColor(inputColor);

    settingsProfile.customVisualizerColor = validColor;

    canvas.setAttribute("data-colorcode", "custom");

    settingsProfile.visualizerColor = "custom";
  });
};
