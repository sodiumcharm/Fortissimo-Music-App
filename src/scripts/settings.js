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
