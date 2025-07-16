import { canvas } from "./audioProcessor.js";

let visualizerIsOn = true;
let equalizerIsOn = false;

export const settingsProfile = {
  theme: "1",
  visualizerIsOn: true,
  visualizerColor: "1",
};

export const audioProfile = {
  playbackRate: 1,
  normalizeVolume: true,
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
  const visOverlay = document.querySelector(".overlay-vis");
  const eqOverlay = document.querySelector(".overlay-eq");

  const updateToggle = function (
    condition,
    thumbClass,
    canvas = null,
    overlay = null
  ) {
    const thumb = document.querySelector(thumbClass);

    if (condition) {
      thumb.style.left = "100%";
      canvas?.classList.remove("hidden");
      overlay?.classList.add("hidden");
    } else {
      thumb.style.left = "0%";
      canvas?.classList.add("hidden");
      overlay?.classList.remove("hidden");
    }
  };

  updateToggle(visualizerIsOn, ".visualizer-thumb", canvas, visOverlay);

  updateToggle(equalizerIsOn, ".equalizer-thumb", null, eqOverlay);

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

      updateToggle(
        equalizerIsOn,
        ".equalizer-thumb",
        null,
        eqOverlay
      );
    }

    if (e.target.closest(".settings-eq-unhide")) {
      const targetBtn = document.querySelector(".eq-btn");

      targetBtn.click();
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
