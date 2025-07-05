"use strict";

import { audio, audioManipulator, eqBtn } from "./audioProcessor.js";
import { singleMatchCheck, timeFormatter } from "./utilities.js";
import { addHistoryCard } from "./historyManager.js";

// *************************************************************
// DOM ELEMENT SELECTION
// *************************************************************

const container = document.querySelector(".container");
const divider = document.querySelector(".divider");
const leftSection = document.querySelector(".left");

const searchInput = document.querySelector(".input");
const allSongsDisplayer = document.querySelector(".all-songs-display");
const likedSongsDisplayer = document.querySelector(".liked-songs-display");

const url = "https://music-backend-4gc1.onrender.com";
const loadingUI = document.querySelector(".loading-ui");
const overlay = document.querySelector(".overlay");
const errorNote = document.querySelector(".error-note");
const retryLoadBtn = document.querySelector(".err-btn");

const searchByVoiceBtn = document.querySelector(".search-mic-btn");

const historyCont = document.querySelector(".history-container");
const historyBtn = document.querySelector(".history-toggle");

const allCloseBtns = document.querySelectorAll(".close-btn");

const filterContainer = document.querySelector(".filter-tags");

const songsContainer = document.querySelector(".songlist");
const playlistContainer = document.querySelector(".cardContainer");
const songsSection = document.querySelector(".songs-section");

const allSongsTabBtn = document.querySelector(".all-songs-btn");
const likedSongsTabBtn = document.querySelector(".liked-song-btn");

const songConTitle = document.querySelector(".song-control-title");
const songConArtist = document.querySelector(".song-control-author");
const songConImg = document.querySelector(".control-img");
const songPlayBtn = document.querySelector(".control-btn-play");

const playbarSwipeBtn = document.querySelector(".playbar-close-btn");
const seekbar = document.querySelector(".seekbar");
const seekbarThumb = document.querySelector(".bar-circle");
const seekbarProgressFill = document.querySelector(".progress-fill");
const bufferedBar = document.querySelector(".buffered-bar");

const volumeBar = document.querySelector(".volume-bar");
const volumeFill = document.querySelector(".volume-fill");
const volumeThumb = document.querySelector(".volume-circle");
const volumeIconCont = document.querySelector(".speaker-iconbox");

const currentTimeEl = document.querySelector(".current-time");
const totalDurationEl = document.querySelector(".total-time");

const playbar = document.querySelector(".playbar");
const playNextBtn = document.querySelector(".play-next");
const playPrevBtn = document.querySelector(".play-prev");

const playlistLoopBtn = document.querySelector(".playlist-loop-btn");
const songLoopBtn = document.querySelector(".song-loop-btn");

const equalizerBox = document.querySelector(".equalizer-box");

const playlistBox = document.querySelector(".playlist-detail-box");
const playlistCoverImg = document.querySelector(".playlist-cover-img");
const playlistHeading = document.querySelector(".playlist-heading");
const playlistDescription = document.querySelector(".playlist-desc");
const playlistUserImg = document.querySelector(".playlist-account-img");
const playlistUsername = document.querySelector(".playlist-username");
const exitPlaylistBtn = document.querySelector(".exit-playlistbox");
const savePlaylistBtn = document.querySelector(".save-playlistbox");

// *************************************************************
// INITIAL STATE VARIABLES
// *************************************************************

let isPlaylistLoop = false;
let isSongLoop = false;

let allTabIsOpen = true;
let likedTabIsOpen = false;

let isDown = false;
let startX;
let scrollLeft;

let currentBtn = null;
let currentSongUrl = null;
let currentCardImg = null;
let isDragging = false;
let isDraggingVolume = false;
let isDraggingUi = false;
let currentPlaylistBtn = null;
let currentPlaylistCardEl = null;

let currentFloatingMenu = null;

let currentRefBtn = null;
let currentRefCardImg = null;
let currentRefSongUrl = null;

let currentPlaylistId = null;
let playbarSwipedDown = false;

let playlistCardBtnPressed = false;

// *************************************************************
// FUNCTION EXPRESSIONS FOR UI MODIFICATIONS
// *************************************************************

const historyManager = function (action) {
  if (action === "hide") {
    overlay.classList.add("hidden");
    historyCont.classList.add("hidden");
  } else if (action === "show") {
    overlay.classList.remove("hidden");
    historyCont.classList.remove("hidden");
  }
};

const eqManager = function (action) {
  if (action === "hide") {
    overlay.classList.add("hidden");
    equalizerBox.classList.add("hidden");
  } else if (action === "show") {
    overlay.classList.remove("hidden");
    equalizerBox.classList.remove("hidden");
  }
};

const errorNoteManager = function (action) {
  if (action === "hide") {
    overlay.classList.add("hidden");
    errorNote.classList.add("hidden");
  } else if (action === "show") {
    overlay.classList.remove("hidden");
    errorNote.classList.remove("hidden");
  }
};

const updateSeekbar = function (percentage) {
  seekbarThumb.style.left = `${percentage}%`;
  seekbarProgressFill.style.width = `${percentage}%`;
};

const updateVolumeBar = function (percent) {
  volumeThumb.style.left = `${percent * 100}%`;
  volumeFill.style.width = `${percent * 100}%`;
};

const updateSeekForDrag = function (e) {
  const rect = seekbar.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const percentage = Math.max(0, Math.min(offsetX / rect.width, 1)); // clamp between 0 and 1

  const newTime = percentage * audio.duration;
  if (!isNaN(newTime)) {
    audio.currentTime = newTime;
  }

  // Move thumb and progress fill
  seekbarThumb.style.left = `${percentage * 100}%`;
  seekbarProgressFill.style.width = `${percentage * 100}%`;
};

const updateBuffered = function () {
  if (audio.buffered.length > 0) {
    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
    const duration = audio.duration;

    if (duration > 0) {
      const percentage = (bufferedEnd / duration) * 100;
      bufferedBar.style.width = `${percentage}%`;
    }
  }
};

const updateVolume = function (e) {
  const rect = volumeBar.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(offsetX / rect.width, 1)); // reverse for bottom-up control
  audio.volume = percent;

  // Update UI
  updateVolumeBar(percent);

  if (audio.volume === 0) {
    volumeIconCont.innerHTML = '<ion-icon name="volume-mute"></ion-icon>';
  } else if (audio.volume > 0 && audio.volume < 0.34) {
    volumeIconCont.innerHTML = '<ion-icon name="volume-low"></ion-icon>';
  } else if (audio.volume >= 0.34 && audio.volume < 0.68) {
    volumeIconCont.innerHTML = '<ion-icon name="volume-medium"></ion-icon>';
  } else {
    volumeIconCont.innerHTML = '<ion-icon name="volume-high"></ion-icon>';
  }
};

// *************************************************************
// FUNCTION EXPRESSIONS FOR CHANGING SONGS
// *************************************************************

const nextSongLoader = function () {
  if (currentPlaylistId) {
    const currentSongRefCard = document.querySelector(
      `[data-refurl="${currentSongUrl}"]`
    );

    const currentPlaylistRefSongs = document.querySelectorAll(
      `[data-refplaylist="${currentSongRefCard.dataset.refplaylist}"]`
    );

    let currentSongIndex = Array.from(currentPlaylistRefSongs).indexOf(
      currentSongRefCard
    );

    currentSongIndex++;
    if (currentSongIndex >= currentPlaylistRefSongs.length)
      currentSongIndex = 0;

    const nextSongCard = currentPlaylistRefSongs[currentSongIndex];

    nextSongCard.click();
  }
};

const prevSongLoader = function () {
  if (currentPlaylistId) {
    const currentSongRefCard = document.querySelector(
      `[data-refurl="${currentSongUrl}"]`
    );

    const currentPlaylistRefSongs = document.querySelectorAll(
      `[data-refplaylist="${currentSongRefCard.dataset.refplaylist}"]`
    );

    let currentSongIndex = Array.from(currentPlaylistRefSongs).indexOf(
      currentSongRefCard
    );

    currentSongIndex--;
    if (currentSongIndex < 0)
      currentSongIndex = currentPlaylistRefSongs.length - 1;

    const nextSongCard = currentPlaylistRefSongs[currentSongIndex];

    nextSongCard.click();
  }
};

const currentSongLoader = function () {
  const currentSongCard = document.querySelector(
    `[data-url="${currentSongUrl}"]`
  );

  currentSongCard.click();
};

// *************************************************************
// FUNCTION EXPRESSIONS FOR DOM LOADING
// *************************************************************

const handleSearch = function () {
  const searchText = searchInput.value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  let targets;

  if (allTabIsOpen) {
    targets = document.querySelectorAll(".song-card");
  } else if (likedTabIsOpen) {
    targets = document.querySelectorAll(".song-card.liked");
  }

  const playlistTargets = document.querySelectorAll(".card");

  if (searchText === "") {
    targets.forEach((card) => {
      card.classList.remove("hide");
    });

    playlistTargets.forEach((card) => {
      card.classList.remove("hide");
    });

    allSongsDisplayer.textContent = `All Songs`;
    likedSongsDisplayer.textContent = `Liked Songs`;

    return;
  }

  const resultArr = [];

  targets.forEach((card) => {
    if (
      singleMatchCheck(
        searchText.split(" "),
        card.dataset.name.toLowerCase().split(" ")
      )
    ) {
      card.classList.remove("hide");
      resultArr.push(card);
    } else {
      card.classList.add("hide");
    }
  });

  playlistTargets.forEach((card) => {
    if (
      singleMatchCheck(
        searchText.split(" "),
        card.dataset.playlistname.toLowerCase().split(" ")
      )
    ) {
      card.classList.remove("hide");
    } else {
      card.classList.add("hide");
    }
  });

  if (allTabIsOpen) {
    allSongsDisplayer.textContent = `Results (${resultArr.length})`;
  } else if (likedTabIsOpen) {
    likedSongsDisplayer.textContent = `Results (${resultArr.length})`;
  }
};

const songLoader = function (songs, container, context) {
  for (let obj of songs) {
    const html = `<div class="song-card flex align-center rounded bg-yel-grey-3" data-url="${
      url + obj.url
    }" data-name="${obj.title}" data-artist="${obj.artist}" data-img="${
      url + obj.img
    }" data-id="${obj.id}" data-context="${context}">
                <div class="song-card-imgbox">
                  <img src="${
                    url + obj.img
                  }" alt="Song Image" class="song-card-img" />
                </div>
                <div class="song-card-info">
                  <p class="song-card-name">${obj.title}</p>
                  <p class="song-card-artist">${obj.artist}</p>
                </div>
                <div class="like-container"><span class="mingcute--thumb-up-2-line"></span></div>
                <button class="song-card-play"><ion-icon name="play"></ion-icon></button>
              </div>`;

    container.insertAdjacentHTML("beforeend", html);
  }

  const songCards = document.querySelectorAll(".song-card");

  songCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      if (
        !e.target.classList.contains("like-container") &&
        !e.target.classList.contains("mingcute--thumb-up-2-line") &&
        !e.target.classList.contains("mingcute--thumb-up-2-fill")
      ) {
        const currentSongName = card.getAttribute("data-name");
        const currentArtistName = card.getAttribute("data-artist");
        const currentSongImg = card.getAttribute("data-img");
        const songUrl = card.getAttribute("data-url");
        const cardImg = card.querySelector(".song-card-imgbox");
        const btn = card.querySelector(".song-card-play");

        setTimeout(function () {
          const context = card.dataset.context;
          const triggeredBy = card.getAttribute("data-triggeredby");

          addHistoryCard(
            songUrl,
            currentSongName,
            currentArtistName,
            currentSongImg,
            context,
            triggeredBy
          );

          if (context === "global" && currentRefBtn) {
            currentRefBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
            currentPlaylistBtn.innerHTML =
              '<ion-icon class="icons card-play-icons" name="play"></ion-icon>';

            if (currentPlaylistCardEl)
              currentPlaylistCardEl.classList.remove("playlist--active");
            currentRefCardImg.classList.remove("rotate");
          }
        }, 0);

        setTimeout(function () {
          card.setAttribute("data-context", "global");
          card.removeAttribute("data-triggeredby");
        }, 1);

        songConTitle.textContent = currentSongName;
        songConArtist.textContent = currentArtistName;
        songConImg.src = currentSongImg;

        if (songUrl !== currentSongUrl) {
          if (currentBtn)
            currentBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
          if (currentCardImg) currentCardImg.classList.remove("rotate");
        }

        audio.src = songUrl;

        audio.play();

        updateVolumeBar(audio.volume);

        btn.innerHTML = '<ion-icon name="pause"></ion-icon>';
        songPlayBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
        cardImg.classList.add("rotate");
        currentSongUrl = songUrl;
        currentBtn = btn;
        currentCardImg = cardImg;

        playbar.classList.remove("hidden");
      }
    });
  });
};

const playlistLoader = function (playlists) {
  playlists.forEach((playlist) => {
    const html = `<div class="card rounded" data-playlistid="${
      playlist.id
    }" data-playlistname="${
      playlist.title
    }" data-playlistType='${JSON.stringify(playlist.type)}' data-creator="${
      playlist.creator
    }" data-creatorimg="${url + playlist.creatorImg}" data-description="${
      playlist.description
    }" data-coverimg="${url + playlist.coverImg}" data-songs='${JSON.stringify(
      playlist.songs
    )}'>
                <div class="card-imgbox rounded">
                  <img src="${
                    url + playlist.coverImg
                  }" alt="Image" class="card-img" />

                  <button class="card-btn-play">
                    <ion-icon
                      class="icons card-play-icons"
                      name="play"
                    ></ion-icon>
                  </button>
                </div>
                <h2>${playlist.title}</h2>
                <p>
                  ${playlist.description}.
                </p>
                <div class="playlist-right-click hidden">
                  <button class="floating-btn floating-save-btn">
                    <ion-icon class="floating-icons" name="bookmark-outline"></ion-icon>Save playlist
                  </button>
                  <button class="floating-btn floating-creator-btn">
                    <ion-icon class="floating-icons" name="person-circle-outline"></ion-icon>Creator Info
                  </button>
                </div>
              </div>`;

    playlistContainer.insertAdjacentHTML("beforeend", html);
  });

  const playlistCards = document.querySelectorAll(".card");

  playlistCards.forEach((playlistCard) => {
    playlistCard.addEventListener("click", function (e) {
      if (
        !e.target.classList.contains("card-btn-play") &&
        !e.target.classList.contains("icons")
      ) {
        playlistCoverImg.src = playlistCard.dataset.coverimg;
        playlistHeading.textContent = playlistCard.dataset.playlistname;
        playlistDescription.textContent = playlistCard.dataset.description;
        playlistUserImg.src = playlistCard.dataset.creatorimg;
        playlistUsername.textContent = playlistCard.dataset.creator;

        if (!playlistCardBtnPressed) {
          playlistBox.classList.remove("hide-playlist");

          document.querySelector(".playlist").classList.add("stop-scroll");
        }

        if (playlistCard.classList.contains("saved")) {
          savePlaylistBtn.innerHTML =
            '<span class="mingcute--bookmark-fill"></span>';
        } else {
          savePlaylistBtn.innerHTML =
            '<span class="mingcute--bookmark-add-fill"></span>';
        }
        // playlistBox.classList.remove("hide-playlist");

        // document.querySelector(".playlist").classList.add("stop-scroll");

        // const songlist = JSON.parse(playlistCard.getAttribute("data-songs"));
        const playlistId = playlistCard.getAttribute("data-playlistid");
        currentPlaylistId = playlistId;
        playlistBox.setAttribute("data-activatorid", playlistId);

        // playlistDisplayer.innerHTML = playlistName;

        const allSongRefCards = songsSection.querySelectorAll(
          ".song-reference-card"
        );

        allSongRefCards.forEach((card) => {
          card.classList.add("hide");

          if (
            JSON.parse(playlistCard.dataset.songs).includes(
              Number(card.dataset.refid)
            )
          ) {
            card.classList.remove("hide");
          }
        });
      }
    });

    playlistCard.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      console.log(e);
      const floatingMenu = playlistCard.querySelector(".playlist-right-click");

      if (currentFloatingMenu) currentFloatingMenu.classList.add("hidden");

      currentFloatingMenu = floatingMenu;

      const rect = playlistCard.getBoundingClientRect();

      const offsetX = e.clientX - rect.left;

      const offsetY = e.clientY - rect.top;

      const leftPercent = (offsetX / rect.width) * 100;
      const topPercent = (offsetY / rect.height) * 100;

      floatingMenu.style.left = `${leftPercent}%`;
      floatingMenu.style.top = `${topPercent}%`;

      floatingMenu.classList.remove("hidden");
    });
  });
};

const songReferenceLoader = function (songs, container, context) {
  for (let obj of songs) {
    const html = `<div class="song-reference-card flex align-center rounded bg-yel-grey-3" data-refname="${
      obj.title
    }" data-refid="${obj.id}" data-context="${context}" data-refurl="${
      url + obj.url
    }" data-refplaylist="">
                <div class="song-card-imgbox">
                  <img src="${
                    url + obj.img
                  }" alt="Song Image" class="song-card-img" />
                </div>
                <div class="song-card-info">
                  <p class="song-card-name">${obj.title}</p>
                  <p class="song-card-artist">${obj.artist}</p>
                </div>
                <div class="like-container ref-like-container"><span class="mingcute--thumb-up-2-line"></span></div>
                <button class="song-card-play"><ion-icon name="play"></ion-icon></button>
              </div>`;

    container.insertAdjacentHTML("beforeend", html);
  }

  document.querySelectorAll(".song-reference-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (
        !e.target.classList.contains("ref-like-container") &&
        !e.target.classList.contains("mingcute--thumb-up-2-line") &&
        !e.target.classList.contains("mingcute--thumb-up-2-fill")
      ) {
        document.querySelectorAll(".song-card").forEach((globalCard) => {
          if (card.dataset.refid === globalCard.dataset.id) {
            globalCard.click();
            globalCard.setAttribute("data-context", `${card.dataset.context}`);

            const refUrl = card.dataset.refurl;
            const refBtn = card.querySelector(".song-card-play");
            const refCardImg = card.querySelector(".song-card-imgbox");

            if (refUrl !== currentRefSongUrl) {
              if (currentRefBtn)
                currentRefBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
              if (currentRefCardImg)
                currentRefCardImg.classList.remove("rotate");
            }

            refBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
            refCardImg.classList.add("rotate");
            currentRefBtn = refBtn;
            currentRefCardImg = refCardImg;
            currentRefSongUrl = refUrl;

            // card.setAttribute("data-refplaylist", currentPlaylistId);
            document.querySelectorAll(".song-reference-card").forEach((el) => {
              if (!el.classList.contains("hide")) {
                el.setAttribute("data-refplaylist", currentPlaylistId);
              }
            });

            if (currentPlaylistCardEl) {
              currentPlaylistCardEl.classList.remove("playlist--active");
            }

            const targetPlaylistId = card.dataset.refplaylist;

            const targetPlaylist = document.querySelector(
              `[data-playlistid="${targetPlaylistId}"]`
            );

            globalCard.setAttribute("data-triggeredby", `${targetPlaylistId}`);

            if (currentPlaylistBtn) {
              currentPlaylistBtn.innerHTML =
                '<ion-icon class="icons card-play-icons" name="play"></ion-icon>';
            }

            const targetPlaylistBtn =
              targetPlaylist.querySelector(".card-btn-play");
            targetPlaylistBtn.innerHTML =
              '<ion-icon class="icons card-play-icons" name="pause"></ion-icon>';
            currentPlaylistBtn = targetPlaylistBtn;

            currentPlaylistCardEl = targetPlaylist;
            targetPlaylist.classList.add("playlist--active");

            return;
          }
        });
      }
    });
  });
};

// *************************************************************
// MAIN FUNCTION FOR IMPLEMENTATION OF ALL FEATURES
// *************************************************************

const appFunctionality = async function () {
  let res = await fetch(url + "/api/songs");

  let songData = await res.json();

  errorNoteManager("hide");
  loadingUI.classList.add("hidden");

  songLoader(songData.songs, songsContainer, "global");

  playlistLoader(songData.playlists);

  songReferenceLoader(songData.songs, songsSection, "playlist");

  const allSongCards = songsSection.querySelectorAll(".song-card");
  allSongCards.forEach((card) => {
    card.classList.add("hide");
  });

  document.querySelectorAll(".playlist-right-click").forEach((menu) => {
    menu.addEventListener("click", function (e) {
      e.stopPropagation();

      if (e.target.closest(".floating-save-btn")) {
        const parentCard = e.target.closest(".card");

        parentCard.classList.toggle("saved");

        if (parentCard.classList.contains("saved")) {
          e.target.closest(".floating-save-btn").innerHTML =
            '<ion-icon class="floating-icons" name="bookmark"></ion-icon>Saved';

          savePlaylistBtn.innerHTML =
            '<span class="mingcute--bookmark-fill"></span>';
        } else {
          e.target.closest(".floating-save-btn").innerHTML =
            '<ion-icon class="floating-icons" name="bookmark-outline"></ion-icon>Save playlist';

          savePlaylistBtn.innerHTML =
            '<span class="mingcute--bookmark-add-fill"></span>';
        }
      }
    });
  });

  savePlaylistBtn.addEventListener("click", function () {
    const activatorPlaylistId = playlistBox.dataset.activatorid;

    const targetPlaylistCard = document.querySelector(
      `[data-playlistid="${activatorPlaylistId}"]`
    );

    const targetSaveBtn =
      targetPlaylistCard.querySelector(".floating-save-btn");

    targetSaveBtn.click();
  });

  const allFloatingMenu = document.querySelectorAll(".playlist-right-click");

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".playlist-right-click")) {
      allFloatingMenu.forEach((menu) => {
        menu.classList.add("hidden");
      });
    }
  });

  document.addEventListener("contextmenu", function (e) {
    if (!e.target.closest(".card")) {
      allFloatingMenu.forEach((menu) => {
        menu.classList.add("hidden");
      });
    }
  });

  audio.addEventListener("ended", function () {
    currentBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
    songPlayBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
    currentBtn
      .closest(".song-card")
      .querySelector(".song-card-imgbox")
      .classList.remove("rotate");

    if (currentRefBtn) {
      currentRefBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
      currentRefCardImg.classList.remove("rotate");
    }

    audio.currentTime = 0;

    if (isSongLoop) currentSongLoader();

    if (isPlaylistLoop) nextSongLoader();
  });

  document
    .querySelector(".history-list")
    .addEventListener("click", function (e) {
      const card = e.target.closest(".history-card");
      if (!card) return;

      const historyUrl = card.dataset.histurl;

      if (card.getAttribute("data-histcontext") === "global") {
        const targetSongCard = document.querySelector(
          `[data-url="${historyUrl}"]`
        );

        if (targetSongCard) {
          targetSongCard.click();
        }
      }

      if (card.getAttribute("data-histcontext") === "playlist") {
        const targetSongRefCard = document.querySelector(
          `[data-refurl="${historyUrl}"]`
        );

        const targetPlaylistId = card.dataset.targetplaylist;
        const targetPlaylist = document.querySelector(
          `[data-playlistid="${targetPlaylistId}"]`
        );
        targetPlaylist.click();

        if (targetSongRefCard) {
          targetSongRefCard.click();
        }
      }

      historyManager("hide");
    });

  songPlayBtn.addEventListener("click", function () {
    if (!audio.paused) {
      if (songPlayBtn.innerHTML.includes("pause")) {
        songPlayBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
      } else {
        songPlayBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
      }

      if (currentBtn.innerHTML.includes("pause")) {
        currentBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
      } else {
        currentBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
      }

      if (currentRefBtn) {
        if (currentRefBtn.innerHTML.includes("pause")) {
          currentRefBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
        } else {
          currentRefBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
        }
      }

      audio.pause();
    } else {
      if (songPlayBtn.innerHTML.includes("play")) {
        songPlayBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
      } else {
        songPlayBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
      }

      if (currentBtn.innerHTML.includes("play")) {
        currentBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
      } else {
        currentBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
      }

      if (currentRefBtn) {
        if (currentRefBtn.innerHTML.includes("play")) {
          currentRefBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
        } else {
          currentRefBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
        }
      }

      audio.play();
    }
  });

  playNextBtn.addEventListener("click", function () {
    nextSongLoader();
  });

  playPrevBtn.addEventListener("click", function () {
    prevSongLoader();
  });

  playlistLoopBtn.addEventListener("click", function () {
    isPlaylistLoop = isPlaylistLoop === false ? true : false;
    playlistLoopBtn.classList.toggle("btn--active");

    songLoopBtn.classList.remove("btn--active");
    isSongLoop = false;
  });

  songLoopBtn.addEventListener("click", function () {
    isSongLoop = isSongLoop === false ? true : false;
    songLoopBtn.classList.toggle("btn--active");

    playlistLoopBtn.classList.remove("btn--active");
    isPlaylistLoop = false;
  });

  setInterval(updateBuffered, 500);

  audio.addEventListener("timeupdate", function () {
    if (!isDragging) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      updateSeekbar(percentage);
    }

    currentTimeEl.textContent = timeFormatter(audio.currentTime);
    totalDurationEl.textContent = timeFormatter(audio.duration);
  });

  seekbar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    updateSeekForDrag(e); // Update immediately
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateSeekForDrag(e);
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (isDragging) {
      updateSeekForDrag(e);
      isDragging = false;
    }
  });

  volumeBar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDraggingVolume = true;
    updateVolume(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDraggingVolume) {
      updateVolume(e);
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (isDraggingVolume) {
      updateVolume(e);
      isDraggingVolume = false;
    }
  });

  document.querySelectorAll(".card-btn-play").forEach((btn) => {
    btn.addEventListener("click", function () {
      playlistCardBtnPressed = true;

      const targetPlaylistCard = btn.closest(".card");

      targetPlaylistCard.click();

      const allSongRefCards = songsSection.querySelectorAll(
        ".song-reference-card"
      );

      for (let card of allSongRefCards) {
        if (!card.classList.contains("hide")) {
          card.click();
          break;
        }
      }

      if (!isPlaylistLoop) {
        playlistLoopBtn.click();
      }

      playlistCardBtnPressed = false;
    });
  });

  divider.addEventListener("mousedown", function () {
    isDraggingUi = true;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDraggingUi) return;

    const rect = container.getBoundingClientRect();

    const pointerRelativeXpos = e.clientX - rect.left;

    const leftWidth = (pointerRelativeXpos / rect.width) * 100;

    if (leftWidth > 26 && leftWidth < 48) {
      leftSection.style.width = `${leftWidth}%`;
    }
  });

  document.addEventListener("mouseup", function () {
    isDraggingUi = false;
    document.body.style.userSelect = "";
  });

  historyBtn.addEventListener("click", function () {
    historyManager("show");
  });

  eqBtn.addEventListener("click", function () {
    eqManager("show");
  });

  filterContainer.addEventListener("mousedown", function (e) {
    isDown = true;

    const rect = filterContainer.getBoundingClientRect();

    startX = e.clientX - rect.left;

    scrollLeft = filterContainer.scrollLeft;
  });

  filterContainer.addEventListener("mousemove", function (e) {
    if (isDown) {
      const rect = filterContainer.getBoundingClientRect();

      const x = e.clientX - rect.left;

      const walk = x - startX;

      filterContainer.scrollLeft = scrollLeft - walk;
    }
  });

  filterContainer.addEventListener("mouseup", function (e) {
    isDown = false;
  });

  filterContainer.addEventListener("mouseleave", function (e) {
    isDown = false;
  });

  filterContainer.addEventListener("click", function (e) {
    const sourceEl = e.target;

    if (sourceEl === filterContainer) return;

    document.querySelectorAll(".filter-tag").forEach((el) => {
      el.classList.remove("filter-active");
    });

    sourceEl.classList.add("filter-active");

    const targetType = sourceEl.getAttribute("data-genre");

    document.querySelectorAll(".card").forEach((playlist) => {
      if (targetType !== "all") {
        if (
          JSON.parse(playlist.getAttribute("data-playlistType")).includes(
            targetType
          )
        ) {
          playlist.style.display = "block";
        } else {
          playlist.style.display = "none";
        }
      } else {
        playlist.style.display = "block";
      }
    });
  });

  document.querySelectorAll(".like-container").forEach((btn) => {
    btn.addEventListener("click", function () {
      const parentCard = btn.closest(".song-card");

      const parentId = parentCard.getAttribute("data-id");

      const targetRefCard = document.querySelector(
        `[data-refid="${parentId}"]`
      );

      const targetRefLikeBtn = targetRefCard.querySelector(
        ".ref-like-container"
      );

      parentCard.classList.toggle("liked");

      if (parentCard.classList.contains("liked")) {
        btn.innerHTML = '<span class="mingcute--thumb-up-2-fill"></span>';
        targetRefLikeBtn.innerHTML =
          '<span class="mingcute--thumb-up-2-fill"></span>';
      } else {
        btn.innerHTML = '<span class="mingcute--thumb-up-2-line"></span>';
        targetRefLikeBtn.innerHTML =
          '<span class="mingcute--thumb-up-2-line"></span>';
      }
    });
  });

  document.querySelectorAll(".ref-like-container").forEach((btn) => {
    btn.addEventListener("click", function () {
      const parentRefCard = btn.closest(".song-reference-card");

      const targetId = parentRefCard.dataset.refid;

      const targetGlobalSongCard = document.querySelector(
        `[data-id="${targetId}"]`
      );

      targetGlobalSongCard.querySelector(".like-container").click();
    });
  });

  allSongsTabBtn.addEventListener("click", function () {
    allTabIsOpen = true;
    likedTabIsOpen = false;

    document.querySelectorAll(".left-window-tab").forEach(function (tab) {
      tab.classList.remove("active-left-windowtab");
    });

    this.classList.add("active-left-windowtab");

    document.querySelectorAll(".song-card").forEach((card) => {
      card.classList.remove("hide");
    });
  });

  likedSongsTabBtn.addEventListener("click", function () {
    allTabIsOpen = false;
    likedTabIsOpen = true;

    document.querySelectorAll(".left-window-tab").forEach(function (tab) {
      tab.classList.remove("active-left-windowtab");
    });

    this.classList.add("active-left-windowtab");

    document.querySelectorAll(".song-card").forEach((card) => {
      if (card.classList.contains("liked")) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });
  });

  let debounceTimer;

  searchInput.addEventListener("input", function (e) {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(function () {
      handleSearch();
    }, 400);
  });

  searchByVoiceBtn.addEventListener("click", function () {
    const speechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (speechRecognition) {
      const recognition = new speechRecognition();

      recognition.lang = "en-IN";

      recognition.interimResults = false;

      recognition.maxAlternatives = 1;

      recognition.start();

      searchByVoiceBtn.classList.add("listening");
      searchInput.placeholder = "Listening";

      recognition.onresult = function (e) {
        const transcript = e.results[0][0].transcript;

        searchInput.value = transcript;
      };

      recognition.onerror = function () {
        searchByVoiceBtn.classList.remove("listening");
        searchInput.placeholder = "Something went wrong!";
      };

      recognition.onend = function () {
        searchByVoiceBtn.classList.remove("listening");
        searchInput.placeholder = "Search music";
        handleSearch();
      };
    }
  });

  playbarSwipeBtn.addEventListener("click", function () {
    playbar.classList.toggle("swipedown-playbar");

    if (!playbarSwipedDown) {
      document
        .querySelector(".mingcute--arrows-down-line")
        .classList.add("icon-rotate");
      playbarSwipedDown = true;
    } else {
      document
        .querySelector(".mingcute--arrows-down-line")
        .classList.remove("icon-rotate");
      playbarSwipedDown = false;
    }
  });

  exitPlaylistBtn.addEventListener("click", function () {
    playlistBox.classList.add("hide-playlist");
    document.querySelector(".playlist").classList.remove("stop-scroll");
  });

  allCloseBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      btn.parentElement.classList.add("hidden");
      overlay.classList.add("hidden");
    });
  });
};

retryLoadBtn.addEventListener("click", async function () {
  errorNoteManager("hide");
});

window.addEventListener("online", function () {
  retryLoadBtn.click();
});

window.addEventListener("offline", function () {
  errorNoteManager("show");
});

(async function () {
  loadingUI.classList.remove("hidden");

  try {
    await appFunctionality();
    audioManipulator();
  } catch (err) {
    console.log(err);

    loadingUI.classList.add("hidden");
    errorNoteManager("show");
  }
})();
