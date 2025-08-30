import { profileImage } from "./login.js";
import { data } from "./serverConnection.js";
import { marked } from "marked";

export const singleMatchCheck = function (arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    const value = arr1[i];

    for (let j = 0; j < arr2.length; j++) {
      if (arr2[j] === value || arr2[j].startsWith(value)) return true;
    }
  }

  return false;
};

export const valueToPercentage = function (value, min, max) {
  return ((value - min) / (max - min)) * 100;
};

export const percentageToValue = function (percent, min, max) {
  return min + (percent / 100) * (max - min);
};

export const timeFormatter = function (time) {
  if (isNaN(time)) return "00:00";

  const minute = String(Math.trunc(time / 60)).padStart(2, "0");
  const seconds = String(Math.trunc(time % 60)).padStart(2, "0");

  return `${minute}:${seconds}`;
};

export const timeFormatter2 = function (seconds) {
  if (isNaN(seconds)) return;

  const hours = Math.floor(seconds / 3600);
  const minute = Math.floor(seconds / 60) % 60;

  return `${hours}h ${minute}m`;
};

export const dateFormatter = function (date) {
  const now = new Date(date);

  const day = now.getDate();

  const month = now.toLocaleString("en-US", { month: "short" });

  const time = now
    .toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  const year = now.getFullYear();

  return `${time}, ${day} ${month} ${year}`;
};

export const lrcTimeFormatter = function (seconds) {
  const minute = String(Math.trunc(seconds / 60)).padStart(2, "0");

  const second = String(Math.trunc(seconds % 60)).padStart(2, "0");

  const centi = String(Math.trunc((seconds % 1) * 100)).padStart(2, "0");

  return `[${minute}:${second}.${centi}]`;
};

export const insertAtCursor = function (textarea, text) {
  const start = textarea.selectionStart;

  const end = textarea.selectionEnd;

  const before = textarea.value.slice(0, start);

  const after = textarea.value.slice(end);

  textarea.value = before + text + after;

  const newCursorPos = start + text.length;

  textarea.selectionStart = textarea.selectionEnd = newCursorPos;

  textarea.focus();
};

export const fileSizeConverter = function (bytes, targetUnit = "kb") {
  let result;

  if (targetUnit === "mb") {
    result = bytes / 1000000;
  }

  return result.toFixed(1);
};

export const toHexColor = function (color) {
  // If the input is already a hex code, return it directly
  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
    return color;
  }

  // If the input is in rgb(...) format
  const rgbMatch = color.match(
    /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
  );

  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    if ([r, g, b].every((val) => val >= 0 && val <= 255)) {
      return (
        "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
      );
    }
  }

  // Invalid input
  throw new Error("Invalid color format");
};

export const randomRGBGenerator = function () {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return `rgb(${r}, ${g}, ${b})`;
};

export const shuffle = function (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

export const clickAnywhereToBring = function (e, elementToBring, parentEl) {
  const rect = parentEl.getBoundingClientRect();

  const offsetX = e.clientX - rect.left;

  const offsetY = e.clientY - rect.top;

  const leftPercent = (offsetX / rect.width) * 100;
  const topPercent = (offsetY / rect.height) * 100;

  elementToBring.style.left = `${leftPercent}%`;
  elementToBring.style.top = `${topPercent}%`;
};

export const scrollResponder = function (
  callback,
  container,
  threshold,
  callbackDependencyArr = null
) {
  container.addEventListener("scroll", function () {
    const scrollTop = this.scrollTop;

    const scrollHeight = this.scrollHeight;

    const rect = this.getBoundingClientRect();

    const containerHeight = rect.height;

    if (scrollTop + containerHeight >= scrollHeight - threshold) {
      if (callbackDependencyArr) callback(...callbackDependencyArr);
      else callback();
    }
  });
};

export const songCardMaker = function (
  obj,
  container,
  insertedSongIds,
  context
) {
  const lyrics = obj.lyrics ? obj.lyrics : null;

  let likeIcon = `<span class="mingcute--thumb-up-2-line"></span>`;
  let liked = "";

  if (data.userData) {
    if (data.userData.likedSongs.includes(obj._id)) {
      likeIcon = `<span class="mingcute--thumb-up-2-fill"></span>`;
      liked = "liked";
    } else {
      likeIcon = `<span class="mingcute--thumb-up-2-line"></span>`;
      liked = "";
    }
  }

  const defaultImg = "/default-profile-img.webp";

  const html = `<div class="song-card flex align-center rounded bg-yel-grey-3 ${liked}" data-url="${
    obj.audio
  }" data-name="${obj.title}" data-artist="${obj.artist}" data-img="${
    obj.coverImage
  }" data-id="${
    obj._id
  }" data-context="${context}" data-eventlistener="" data-lyrics="${lyrics}" data-likes="${
    obj.likes
  }" data-uploaded-on="${obj.createdAt}" data-uploader="${
    obj.uploader.fullname
  }" data-uploader-img="${obj.uploader.profileImage || defaultImg}">
                  <div class="song-card-imgbox">
                    <img src="${
                      obj.coverImage || defaultImg
                    }" alt="Song Image" class="song-card-img" />
                  </div>
                  <div class="song-card-info">
                    <p class="song-card-name">${obj.title}</p>
                    <p class="song-card-artist">${obj.artist}</p>
                  </div>
                  <div class="song-like">
                  <div class="like-container">
                    ${likeIcon}
                  </div>
                  <span class="like-num">${obj.likes}</span>
                </div>
                  <button class="song-card-play"><ion-icon name="play"></ion-icon></button>
                </div>`;

  container.insertAdjacentHTML("beforeend", html);

  insertedSongIds.push(obj._id);
};

export const playlistCardMaker = function (
  playlist,
  container,
  insertedPlaylistIds
) {
  let saveIcon =
    '<ion-icon class="floating-icons" name="bookmark-outline"></ion-icon>Save playlist';
  let saved = "";

  if (data.userData) {
    if (data.userData.savedPlaylists.includes(playlist._id)) {
      saveIcon =
        '<ion-icon class="floating-icons" name="bookmark"></ion-icon>Saved';
      saved = "saved";
    } else {
      saveIcon =
        '<ion-icon class="floating-icons" name="bookmark-outline"></ion-icon>Save playlist';
      saved = "";
    }
  }

  const defaultImg = "/default-profile-img.webp";

  const html = `<div class="card rounded ${saved}" data-playlistid="${
    playlist._id
  }" data-playlistname="${playlist.title}" data-playlistType='${
    playlist.genre
  }' data-creator="${playlist.creator.fullname}" data-creatorimg="${
    playlist.creator.profileImage
  }" data-description="${playlist.description}" data-coverimg="${
    playlist.coverImage
  }" data-songs='${JSON.stringify(
    playlist.songs
  )}' data-eventlistener="" data-saves="${
    playlist.saves
  }" data-total-duration="${playlist.totalDuration}">
                  <div class="card-imgbox rounded">
                    <img src="${
                      playlist.coverImage || defaultImg
                    }" alt="Image" class="card-img" />
  
                    <button class="card-btn-play" data-eventlistener="">
                      <ion-icon
                        class="icons card-play-icons"
                        name="play"
                      ></ion-icon>
                    </button>
                  </div>
                  <h2>${playlist.title}</h2>
                  <p>
                    ${playlist.description}
                  </p>
                  <div class="playlist-right-click hidden">
                    <button class="floating-btn floating-save-btn">
                      ${saveIcon}
                    </button>
                    <button class="floating-btn floating-creator-btn">
                      <ion-icon class="floating-icons" name="person-circle-outline"></ion-icon>Creator Info
                    </button>
                  </div>
                </div>`;

  container.insertAdjacentHTML("beforeend", html);
  insertedPlaylistIds.push(playlist._id);
};

export const referenceCardMaker = function (
  obj,
  container,
  context,
  insertedRefCards
) {
  let likeIcon = `<span class="mingcute--thumb-up-2-line"></span>`;

  if (data.userData) {
    if (data.userData.likedSongs.includes(obj._id)) {
      likeIcon = `<span class="mingcute--thumb-up-2-fill"></span>`;
    } else {
      likeIcon = `<span class="mingcute--thumb-up-2-line"></span>`;
    }
  }

  const defaultImg = "/default-profile-img.webp";

  const html = `<div class="song-reference-card flex align-center rounded bg-yel-grey-3" data-refname="${
    obj.title
  }" data-refid="${obj._id}" data-context="${context}" data-refurl="${
    obj.audio
  }" data-refplaylist="" data-eventlistener="">
                  <div class="song-card-imgbox">
                    <img src="${
                      obj.coverImage || defaultImg
                    }" alt="Song Image" class="song-card-img" />
                  </div>
                  <div class="song-card-info">
                    <p class="song-card-name">${obj.title}</p>
                    <p class="song-card-artist">${obj.artist}</p>
                  </div>
                  <div class="song-like">
                  <div class="ref-like-container">
                    ${likeIcon}
                  </div>
                  <span class="like-num">${obj.likes}</span>
                </div>
                  <button class="song-card-play"><ion-icon name="play"></ion-icon></button>
                </div>`;

  container.insertAdjacentHTML("beforeend", html);
  insertedRefCards.push(obj._id);
};

export const uploadedSongCardMaker = function (obj) {
  let accessIcon;

  if (obj.public === "true") {
    accessIcon = `<ion-icon name="earth"></ion-icon>`;
  } else if (obj.public === "false") {
    accessIcon = `<ion-icon name="lock-closed"></ion-icon>`;
  }

  const defaultImg = "/default-profile-img.webp";

  const html = `<div class="uploaded-songlist__card bg-yel-grey-2" data-audio-id="${
    obj._id
  }" data-audio-title="${obj.title}" data-audio-image="${
    obj.coverImage
  }" data-audio-artist="${obj.artist}" data-audio-public="${obj.public}">
            <div class="uploaded-songlist__card-info">
              <div class="uploaded-songlist__card-imgbox">
                <img
                  src="${obj.coverImage || defaultImg}"
                  class="uploaded-songlist__card-img"
                  alt="Cover Image"
                />
              </div>

              <div class="uploaded-songlist__card-name">
                <p class="uploaded-songlist__card-title">${obj.title}</p>
                <p class="uploaded-songlist__card-artist">${obj.artist}</p>
              </div>
            </div>

            <p class="uploaded-songlist__card-access">
              ${accessIcon}
            </p>

            <button class="uploaded-songlist__card-edit uploaded-song-edit">
              <ion-icon name="settings"></ion-icon>
            </button>
            <button class="uploaded-songlist__card-option">
              <ion-icon name="ellipsis-vertical"></ion-icon>
            </button>
            <div class="uploaded-songlist__card-options card-options hidden">
              <div class="uploaded-songlist__card-option-btn del-audiocover">Delete Cover</div>
              <div class="uploaded-songlist__card-option-btn del-lyrics">Delete Lyrics</div>
              <div class="uploaded-songlist__card-option-btn del-audio">Delete Song</div>
            </div>
          </div>`;

  document
    .querySelector(".uploaded-songlist__list")
    .insertAdjacentHTML("beforeend", html);
};

export const createdPlaylistCardMaker = function (obj) {
  let accessIcon;

  if (obj.public === "true") {
    accessIcon = `<ion-icon name="earth"></ion-icon>`;
  } else if (obj.public === "false") {
    accessIcon = `<ion-icon name="lock-closed"></ion-icon>`;
  }

  const defaultImg = "/default-profile-img.webp";

  const html = `<div class="created-playlists__card bg-yel-grey-2" data-playlist-id="${
    obj._id
  }" data-playlist-title="${obj.title}" data-playlist-desc="${
    obj.description
  }" data-playlist-image="${obj.coverImage}" data-playlist-public="${
    obj.public
  }" data-songs='${JSON.stringify(obj.songs)}'>
            <div class="created-playlists__card-info">
              <div class="created-playlists__card-imgbox">
                <img
                  src="${obj.coverImage || defaultImg}"
                  class="created-playlists__card-img"
                  alt="Cover Image"
                />
              </div>

              <div class="created-playlists__card-name">
                <p class="created-playlists__card-title">${obj.title}</p>
                <p class="created-playlists__card-songs">${
                  obj.songs.length
                } Songs & ${obj.saves} Saves</p>
              </div>
            </div>

            <p class="created-playlists__card-access">
              ${accessIcon}
            </p>

            <button class="created-playlists__card-edit created-playlist-edit">
              <ion-icon name="settings"></ion-icon>
            </button>
            <button class="created-playlists__card-option">
              <ion-icon name="ellipsis-vertical"></ion-icon>
            </button>
            <div class="created-playlists__card-options playlist-card-options hidden">
              <div class="created-playlists__card-option-btn del-playlistcover">Delete Cover</div>
              <div class="created-playlists__card-option-btn add-songs-in">Add Songs</div>
              <div class="created-playlists__card-option-btn del-playlist">Delete Playlist</div>
            </div>
          </div>`;

  document
    .querySelector(".created-playlists__container")
    .insertAdjacentHTML("beforeend", html);
};

export const addSongCardMaker = function (obj, songsArr) {
  const defaultImg = "/default-profile-img.webp";

  let removeIconHide, addIconHide;

  if (songsArr.includes(obj._id)) {
    removeIconHide = "";
    addIconHide = "hide";
  } else {
    removeIconHide = "hide";
    addIconHide = "";
  }

  const html = `<div class="add-song__card bg-yel-grey-2" data-add-id="${
    obj._id
  }" data-title="${obj.title}" data-duration="${obj.duration}">
            <div class="add-song__card-info">
              <div class="add-song__card-imgbox">
                <img
                  src="${obj.coverImage || defaultImg}"
                  alt="Cover Image"
                  class="add-song__card-img"
                />
              </div>

              <div class="add-song__card-name">
                <div class="add-song__card-title">${obj.title}</div>
                <p class="add-song__card-artist">${obj.artist}</p>
              </div>
            </div>

            <button class="add-song__btn add-this-song ${addIconHide}">
              <ion-icon name="add-circle-outline"></ion-icon>
            </button>
            <button class="add-song__btn remove-this-song ${removeIconHide}">
              <ion-icon name="remove-circle-outline"></ion-icon>
            </button>
          </div>`;

  document
    .querySelector(".created-playlists__songs")
    .insertAdjacentHTML("beforeend", html);
};

export const savedPlaylistCardMaker = function (obj) {
  const defaultImg = "/default-profile-img.webp";

  const html = `<div class="saved-playlists__card bg-yel-grey-2" data-saved-id="${
    obj._id
  }" data-saved-title="${obj.title}">
            <div class="saved-playlists__card-info">
              <div class="saved-playlists__card-imgbox">
                <img
                  src="${obj.coverImage || defaultImg}"
                  alt="Cover Image"
                  class="saved-playlists__card-img"
                />
              </div>

              <div class="saved-playlists__card-name">
                <div class="saved-playlists__card-title">${obj.title}</div>
                <div class="saved-playlists__card-creator">${
                  obj.creator.fullname
                }</div>
              </div>
            </div>

            <button class="saved-playlists__btn">
              <ion-icon name="remove-circle-outline"></ion-icon>
            </button>
          </div>`;

  document
    .querySelector(".saved-playlists__container")
    .insertAdjacentHTML("beforeend", html);
};

export const presetCardMaker = function (preset, container, user = false) {
  const defaultImg = "/default-profile-img.webp";

  let importHide = "";
  let removeImportHide = "collapse-hide";
  let deleteHide = "hide";

  if (data.userData) {
    if (data.userData.importedPresets.includes(preset._id)) {
      importHide = "collapse-hide";
      removeImportHide = "";
    }
  }

  if (user) {
    deleteHide = "";
    importHide = "hide";
    removeImportHide = "hide";
  }

  const html = `<div class="preset-card bg-yel-grey-2-1" data-preset-id="${
    preset._id
  }">
            <div class="preset-card__main">
              <p class="preset-card__name">${preset.presetName}</p>

              <div class="preset-card__user-info">
                <div class="preset-card__imgbox">
                  <img src="${
                    preset.creator.profileImage || defaultImg
                  }" alt="User" class="preset-card__img" />
                </div>
                <p class="preset-card__user">${preset.creator.fullname}</p>
              </div>

              <div class="preset-card__values">
                <p class="preset-card__value">
                  <span class="preset-card__value-name">60Hz</span
                  ><span class="p-sub-bass">${Math.trunc(preset.subBass)}</span>
                </p>
                <p class="preset-card__value">
                  <span class="preset-card__value-name">120Hz</span
                  ><span class="p-bass">${Math.trunc(preset.bass)}</span>
                </p>
                <p class="preset-card__value">
                  <span class="preset-card__value-name">400Hz</span
                  ><span class="p-lowmid">${Math.trunc(preset.lowMid)}</span>
                </p>
                <p class="preset-card__value">
                  <span class="preset-card__value-name">1kHz</span
                  ><span class="p-mid">${Math.trunc(preset.mid)}</span>
                </p>
                <p class="preset-card__value">
                  <span class="preset-card__value-name">2.5kHz</span
                  ><span class="p-highmid">${Math.trunc(preset.highMid)}</span>
                </p>
                <p class="preset-card__value">
                  <span class="preset-card__value-name">6kHz</span
                  ><span class="p-treble">${Math.trunc(preset.treble)}</span>
                </p>
                <p class="preset-card__value">
                  <span class="preset-card__value-name">10kHz</span
                  ><span class="p-brilliance">${Math.trunc(
                    preset.brilliance
                  )}</span>
                </p>
                <p class="preset-card__value">
                  <span class="preset-card__value-name">16kHz</span
                  ><span class="p-air">${Math.trunc(preset.air)}</span>
                </p>
              </div>
            </div>

            <div class="preset-card__btn-list">
              <button class="preset-card__btn delete-preset-btn ${deleteHide}">
                <ion-icon name="trash"></ion-icon>
              </button>
              <button class="preset-card__btn remove-import-btn ${removeImportHide}">
                <ion-icon name="log-out"></ion-icon>
              </button>
              <button class="preset-card__btn preset-import-btn ${importHide}">
                <ion-icon name="log-in"></ion-icon>
              </button>
            </div>
          </div>`;

  document.querySelector(`.${container}`).insertAdjacentHTML("beforeend", html);
};

export const chatTextMaker = function (type, message) {
  let html;

  message = marked(message);

  if (type === "sia") {
    html = `<div class="ai-chat__sia-chat">
                <p class="ai-chat__sia-chat-heading">SIA</p>
                <p class="ai-chat__sia-chat-text">
                  ${message}
                </p>
              </div>`;
  } else if (type === "user") {
    html = `<div class="ai-chat__user-chat bg-yel-grey-2">
                <p class="ai-chat__user-chat-heading">YOU</p>
                <p class="ai-chat__user-chat-text">
                  ${message}
                </p>
              </div>`;
  }

  document
    .querySelector(".ai-chat__chats")
    .insertAdjacentHTML("beforeend", html);
};

export const initDragResponse = function (fnArr, thumb) {
  let isDragging = false;

  thumb.addEventListener("mousedown", function (e) {
    e.preventDefault();
    isDragging = true;
    if (fnArr[0]) fnArr[0](e);
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      fnArr[1](e);
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    if (fnArr[2]) fnArr[2](e);
  });

  thumb.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isDragging = true;
    if (fnArr[0]) fnArr[0](e);
  });

  document.addEventListener("touchmove", function (e) {
    if (isDragging) {
      fnArr[1](e);
    }
  });

  document.addEventListener("touchend", function () {
    isDragging = false;
    if (fnArr[2]) fnArr[2](e);
  });
};

export const passwordValidator = function (password, validationMethod = "ui") {
  const capitals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const smalls = "abcdefghijklmnopqrstuvwxyz";
  const specials = `~!@#$%^&*()_-+={}[]|\\:;"'<,>.?/`;
  const extractedCapitals = [];
  const extractedSmalls = [];
  const extractedSpecials = [];

  for (let char of password) {
    if (capitals.includes(char)) extractedCapitals.push(char);
    if (smalls.includes(char)) extractedSmalls.push(char);
    if (specials.includes(char)) extractedSpecials.push(char);
  }

  if (validationMethod === "ui") {
    const lengthWarning = document.querySelector(".length-warning");
    const capitalsWarning = document.querySelector(".capitals-warning");
    const smallsWarning = document.querySelector(".smalls-warning");
    const specialsWarning = document.querySelector(".specials-warning");
    const numbersWarning = document.querySelector(".numbers-warning");

    if (password.length < 8) {
      lengthWarning.classList.add("red-flag");
    } else {
      lengthWarning.classList.remove("red-flag");
    }

    if (extractedCapitals.length < 1) {
      capitalsWarning.classList.add("red-flag");
    } else {
      capitalsWarning.classList.remove("red-flag");
    }

    if (extractedSmalls.length < 1) {
      smallsWarning.classList.add("red-flag");
    } else {
      smallsWarning.classList.remove("red-flag");
    }

    if (extractedSpecials.length < 1) {
      specialsWarning.classList.add("red-flag");
    } else {
      specialsWarning.classList.remove("red-flag");
    }

    if (/\d/.test(password)) {
      numbersWarning.classList.remove("red-flag");
    } else {
      numbersWarning.classList.add("red-flag");
    }
  } else if (validationMethod === "returnOnly") {
    if (
      password.length < 8 ||
      extractedCapitals.length < 1 ||
      extractedSmalls.length < 1 ||
      extractedSpecials.length < 1 ||
      !/\d/.test(password)
    ) {
      return "rejected";
    } else {
      return "accepted";
    }
  }
};

export const isValidEmail = function (email) {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  email = email.trim();

  if (!email || typeof email !== "string") return false;

  if (email.length > 254) return false;

  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  const [localPart, domainPart] = email.split("@");

  if (localPart.length === 0 || localPart.length > 64) return false;

  if (domainPart.length === 0 || domainPart.length > 253) return false;

  if (email.includes("..")) return false;

  if (localPart.startsWith(".") || localPart.endsWith(".")) return false;

  if (
    domainPart.startsWith(".") ||
    domainPart.endsWith(".") ||
    domainPart.startsWith("-") ||
    domainPart.endsWith("-")
  ) {
    return false;
  }

  if (!emailRegex.test(email)) return false;

  if (!domainPart.includes(".")) return false;

  const domainLabels = domainPart.split(".");

  for (let label of domainLabels) {
    if (label.length === 0 || label.length > 63) return false;

    if (label.startsWith("-") || label.endsWith("-")) return false;
  }

  const tld = domainLabels[domainLabels.length - 1];

  if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;

  return true;
};

export const isValidName = function (name) {
  const numbers = "0123456789";
  const specials =
    '!"#$%&()*+,./:;<=>?@[\\]^_`{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´¶·¸¹º»¼½¾¿×÷';

  if (typeof name !== "string") return false;

  name = name.trim();

  if (name.length < 2 || name.length > 50) return false;

  for (let number of numbers) {
    if (name.includes(number)) return false;
  }

  for (let special of specials) {
    if (name.includes(special)) return false;
  }

  if (name.startsWith("-") || name.endsWith("-")) return false;

  return true;
};

export const isValidUsername = function (username) {
  const allowedChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  const numbers = "0123456789";

  if (typeof username !== "string") return false;

  username = username.trim();

  if (username.length < 3 || username.length > 20) return false;

  for (let char of username) {
    if (!allowedChars.includes(char)) return false;
  }

  if (numbers.includes(username[0])) return false;

  return true;
};

export const cleanupSignupWindow = function () {
  const signupPasswordInput = document.getElementById("password-input");
  const signupPasswordWarning = document.querySelector(".sup-password-warning");
  const signupFullnameWarning = document.querySelector(".sup-fullname-warning");
  const signupUsernameWarning = document.querySelector(".sup-username-warning");
  const signupEmailWarning = document.querySelector(".sup-email-warning");
  const signupFullnameInput = document.getElementById("fullname-input");
  const signupUsernameInput = document.getElementById("username-input");
  const signupEmailInput = document.getElementById("email-input");
  const signupImgWarning = document.querySelector(".signup-box__img-warning");
  const signupImg = document.querySelector(".signup-box__img");

  signupFullnameInput.value = "";
  signupUsernameInput.value = "";
  signupEmailInput.value = "";
  signupPasswordInput.value = "";
  signupFullnameWarning.classList.add("hidden");
  signupUsernameWarning.classList.add("hidden");
  signupEmailWarning.classList.add("hidden");
  signupPasswordWarning.classList.add("hidden");
  signupImgWarning.classList.add("hidden");
  signupImg.src = "/default-profile-img.webp";

  profileImage.currentProfileImage = null;
};

export const cleanupLoginWindow = function () {
  const loginIdentifierInput = document.getElementById("identifier");
  const loginPasswordInput = document.getElementById("login-password");
  const loginIdentifierWarning = document.querySelector(
    ".login-identifier-warning"
  );
  const loginPasswordWarning = document.querySelector(
    ".login-password-warning"
  );

  loginIdentifierInput.value = "";
  loginPasswordInput.value = "";
  loginIdentifierWarning.classList.add("hidden");
  loginPasswordWarning.classList.add("hidden");
};

export const otpCountDownTimer = function (targetClass) {
  const timerEl = document.querySelector(`.${targetClass}`);
  const overlay = document.querySelector(".ask-otp__overlay");

  let timeLeft = 60;

  const countdown = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}`.padStart(2, "0");
    overlay.classList.remove("hidden");

    if (timeLeft <= 0) {
      clearInterval(countdown);
      overlay.classList.add("hidden");
    }
  }, 1000);
};
