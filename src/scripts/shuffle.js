import { shuffle } from "./utilities.js";

const shuffleWithAnimation = function (elArray, recordedRects) {
  elArray.forEach((card) => {
    const lastRect = card.getBoundingClientRect();
    const firstRect = recordedRects.get(card);

    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;

    card.style.transform = `translate(${dx}px, ${dy}px)`;

    card.style.transition = "transform 0s";

    card.offsetHeight;

    card.style.transform = "";
    card.style.transition = "transform 500ms ease";
  });
};

export const shufflePlaylists = function () {
  const allRefCards = document.querySelectorAll(".song-reference-card");

  const orderedArr = Array.from(allRefCards);

  const recordedRects = new Map();

  orderedArr.forEach((card) => {
    recordedRects.set(card, card.getBoundingClientRect());
  });

  const shuffled = shuffle(orderedArr);

  shuffled.forEach((card) => {
    document.querySelector(".songs-section").appendChild(card);
  });

  shuffleWithAnimation(shuffled, recordedRects);
};

export const deShufflePlaylists = function (originalOrder) {
  const allRefCards = document.querySelectorAll(".song-reference-card");

  const unorderedArr = Array.from(allRefCards);

  const recordedRects = new Map();

  unorderedArr.forEach((card) => {
    recordedRects.set(card, card.getBoundingClientRect());
  });

  originalOrder.forEach((card) => {
    document.querySelector(".songs-section").appendChild(card);
  });

  shuffleWithAnimation(originalOrder, recordedRects);
};
