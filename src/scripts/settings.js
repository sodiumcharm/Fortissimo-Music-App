import { canvas } from "./audioProcessor.js";

let visualizerIsOn = true;

export const settingsProfile = {
  theme: "1",
  visualizerIsOn: true,
  visualizerColor: "1",
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
  const updateVisualizerToggle = function (visualizerIsOn) {
    const thumb = document.querySelector(".toggle-switch__thumb");
    const overlay = document.querySelector(".overlay-vis");

    if (visualizerIsOn) {
      thumb.style.left = "100%";
      canvas.classList.remove("hidden");
      overlay.classList.add("hidden");
    } else {
      thumb.style.left = "0%";
      canvas.classList.add("hidden");
      overlay.classList.remove("hidden");
    }
  };

  updateVisualizerToggle(visualizerIsOn);

  settingsEl.addEventListener("click", function (e) {
    if (e.target.closest(".toggle-switch__track")) {
      visualizerIsOn = !visualizerIsOn;
      
      updateVisualizerToggle(visualizerIsOn);

      settingsProfile.visualizerIsOn = visualizerIsOn;

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
