import {
  deleteComment,
  getComments,
  likeComment,
  postComment,
  windowManager,
} from "./serverConnection.js";
import { commentCardMaker } from "./utilities.js";

export const initComments = function () {
  document
    .querySelector(".playbar-comment-btn")
    .addEventListener("click", async function () {
      const id = document
        .querySelector(".playbar")
        .getAttribute("data-audio-id");

      windowManager(".comments-box", "show");

      document
        .querySelector(".comments-container")
        .setAttribute("data-audio-id", id);

      const comments = await getComments(id);

      if (!comments) return;

      comments.forEach((comment) => {
        commentCardMaker(comment);
      });
    });

  document
    .querySelector(".comments__send-btn")
    .addEventListener("click", async function () {
      const text = document.getElementById("comment-input").value;

      if (text.trim() === "") return;

      const audioId = document
        .querySelector(".comments-container")
        .getAttribute("data-audio-id");

      const comment = await postComment(audioId, text);

      if (!comment) return;

      document.getElementById("comment-input").value = "";

      commentCardMaker(comment);
    });

  document
    .querySelector(".comments-container")
    .addEventListener("click", async function (e) {
      if (e.target.closest(".comment-card__like-btn")) {
        const parentCard = e.target.closest(".comment-card");

        const id = parentCard.getAttribute("data-id");

        const liked = await likeComment(id);

        if (liked) {
          parentCard.classList.add("liked");

          document.querySelector(".comment-card__like-num").textContent =
            Number(
              document.querySelector(".comment-card__like-num").textContent
            ) + 1;

          document.querySelector(
            ".comment-card__like-btn"
          ).innerHTML = `<span class="mingcute--thumb-up-2-fill"></span>`;
        } else {
          parentCard.classList.remove("liked");

          document.querySelector(".comment-card__like-num").textContent =
            Number(
              document.querySelector(".comment-card__like-num").textContent
            ) - 1;

          document.querySelector(
            ".comment-card__like-btn"
          ).innerHTML = `<span class="mingcute--thumb-up-2-line"></span>`;
        }
      }

      if (e.target.closest(".comment-card__delete")) {
        const parentCard = e.target.closest(".comment-card");

        const id = parentCard.getAttribute("data-id");

        const deleted = await deleteComment(id);

        if (!deleted) return;

        parentCard.classList.add("hidden");

        setTimeout(() => {
          parentCard.remove();
        }, 400);
      }
    });
};
