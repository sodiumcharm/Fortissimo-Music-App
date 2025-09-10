import { reportAudio, windowManager } from "./serverConnection.js";

let reason = "Hateful or abusive content";
const confirmText = document.querySelector(".confirmation-window__text");

export const initReport = function () {
  document
    .querySelector(".report-box__container")
    .addEventListener("click", function (e) {
      if (e.target.closest(".report-box__option")) {
        document
          .querySelectorAll(".report-box__option")
          .forEach((el) => {
            el.classList.remove("option-active");
          });

        const parentOption = e.target.closest(".report-box__option");

        parentOption.classList.add("option-active");

        const reasonData = parentOption.getAttribute("data-reason");

        reason = reasonData;
      }
    });

    document.querySelector('.report-box__btn').addEventListener('click', async function() {
        const audioId = document.querySelector('.report-box').getAttribute('data-id');
        
        const reported = await reportAudio(audioId, reason);

        if (!reported) return;

        windowManager('.report-box', 'hide');

        confirmText.textContent = "Audio reported successfully."

        windowManager('.confirmation-window', 'show');
    })
};
