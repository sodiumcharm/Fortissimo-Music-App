import { canvas } from "./audioProcessor.js";

let visualizerIsOn = true;

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

export const initThemeColorBtns = function (btns) {
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
    });
  });
};

export const initSettingsToggleBtn = function (settingsEl) {
  settingsEl.addEventListener("click", function (e) {
    if (e.target.closest(".toggle-switch__track")) {
      const track = e.target.closest(".toggle-switch__track");

      const targetThumb = track.querySelector(".toggle-switch__thumb");

      visualizerIsOn = !visualizerIsOn;

      const targetOverlay = document.querySelector(".overlay-vis");

      if (visualizerIsOn) {
        targetThumb.style.left = "100%";
        canvas.classList.remove("hidden");
        targetOverlay.classList.add("hidden");
      } else {
        targetThumb.style.left = "0%";
        canvas.classList.add("hidden");
        targetOverlay.classList.remove("hidden");
      }
    }
  });
};

export const initVisualizerColorOptions = function (visColorBtns) {
  visColorBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const colorCode = btn.dataset.color;

      canvas.setAttribute("data-colorcode", colorCode);

      visColorBtns.forEach((el) => {
        el.classList.remove("visualizer-color--active");
      });

      btn.classList.add("visualizer-color--active");
    });
  });
};
