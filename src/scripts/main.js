"use strict";

import "../sass/main.scss";
// IMPORTS
import { url } from "./config.js";

import {
  addSong,
  data,
  deletePlaylist,
  deletePlaylistCoverImage,
  getAllPlaylists,
  getAllPresets,
  getAllSongs,
  getUserData,
  recordHistory,
  registerLike,
  removeSong,
  renderUserMedia,
  reportAudio,
  savePlaylist,
  windowManager,
} from "./serverConnection.js";

import { audio, audioManipulator, eqBtn } from "./audioProcessor.js";

import {
  singleMatchCheck,
  shuffle,
  clickAnywhereToBring,
  scrollResponder,
  playlistCardMaker,
  songCardMaker,
  referenceCardMaker,
  cleanupSignupWindow,
  savedPlaylistCardMaker,
  presetCardMaker,
  timeFormatter2,
  dateFormatter,
  addSongCardMaker,
} from "./utilities.js";

import { addHistoryCard } from "./historyManager.js";

import {
  initDraggableWindow,
  initDraggableFilterTags,
  initSeekbar,
  updateVolumeBar,
  initVolumebar,
  initPlaybackSpeedSlider,
  initFftSizeSlider,
  initVolumeBoostSlider,
  initLFOFrequencySlider,
} from "./draggableUi.js";

import {
  settingsProfile,
  loadSettings,
  initSettingsOptions,
  initThemeColorBtns,
  initSettingsToggleBtn,
  initVisualizerColorOptions,
  audioProfile,
  initSettingsInput,
  initChooseLFOWaveform,
} from "./settings.js";

import { deShufflePlaylists, shufflePlaylists } from "./shuffle.js";

import { initChromecast, loadForCasting } from "./cast.js";

import { initLyrics, lyricsStatus } from "./lyricsProcessor.js";

import { initKeyHandler } from "./keyShortcuts.js";

import { initLRCGenerator } from "./lrcGenerator.js";

import { initUserOperations } from "./login.js";

import {
  editTags,
  mediaListeners,
  mediaLoader,
  showConfirmationModal,
} from "./mediaOperation.js";

import { initAIChat } from "./aiChat.js";
import { initComments } from "./comments.js";
import { initReport } from "./report.js";

// *************************************************************
// DOM ELEMENT SELECTION
// *************************************************************

const container = document.querySelector(".container");
const divider = document.querySelector(".divider");
const leftSection = document.querySelector(".left");

const searchInput = document.querySelector(".input");
const allSongsDisplayer = document.querySelector(".all-songs-display");
const likedSongsDisplayer = document.querySelector(".liked-songs-display");

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
const playlistSection = document.querySelector(".playlist");

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
const lyricsBtn = document.querySelector(".show-lyrics");

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

const lyricsBox = document.querySelector(".lyrics-box");

const settingsBtn = document.querySelector(".settings");
const settingsEl = document.querySelector(".main-settings");
const settingsTabs = document.querySelectorAll(".settings-tab-btn");
const settingsSections = document.querySelectorAll(".right-settings-container");
const themeColorBtns = document.querySelectorAll(".theme-color");
const visColorBtns = document.querySelectorAll(".visualizer-color");
const speedTrack = document.querySelector(".playback-rate-track");
const speedThumb = document.querySelector(".playback-rate-thumb");
const speedFill = document.querySelector(".playback-rate-fill");
const fftTrack = document.querySelector(".fft-track");
const fftThumb = document.querySelector(".fft-thumb");
const fftFill = document.querySelector(".fft-fill");
const gainTrack = document.querySelector(".gain-track");
const gainThumb = document.querySelector(".gain-thumb");
const gainFill = document.querySelector(".gain-fill");
const lfoTrack = document.querySelector(".lfo-track");
const lfoThumb = document.querySelector(".lfo-thumb");
const lfoFill = document.querySelector(".lfo-fill");

const allCloseOkBtns = document.querySelectorAll(".ok-close-btn");

const toggleShuffleBtn = document.querySelector(".shuffle-toggle");

// FOR TABS AND MOBILES
const leftSongSectionBtn = document.querySelector(".song-section-btn");
const rightPlaylistSectionBtn = document.querySelector(".left-section-exit");

const playlistEditContainer = document.querySelector(".edit-playlist");
const playlistEditImgWarn = document.querySelector(".playlist-edit-img-warn");
const playlistEditImgEl = document.querySelector(".edit-playlist__img");
const playlistEditImgInput = document.getElementById("edit-playlistcover");
const allEditTags = document.querySelectorAll(".edit-playlist__tag");
const playlistEditTitleInput = document.getElementById(
  "edit-playlisttitle-input"
);
const playlistEditDescInput = document.querySelector(".edit-description-input");
const playlistEditAccessInput = document.getElementById(
  "edit-playlistaccess-input"
);
const loadingText = document.querySelector(".loading-window__text");
const errorText = document.querySelector(".error-window__text");
const confirmText = document.querySelector(".confirmation-window__text");

// *************************************************************
// INITIAL STATE VARIABLE DECLARATIONS
// *************************************************************

let isPlaylistLoop = false;
let isSongLoop = false;

let allTabIsOpen = true;
let likedTabIsOpen = false;

let currentBtn = null;
let currentSongUrl = null;
let currentCardImg = null;

let currentPlaylistBtn = null;
let currentPlaylistCardEl = null;

let currentFloatingMenu = null;

let currentRefBtn = null;
let currentRefCardImg = null;
let currentRefSongUrl = null;

let currentPlaylistId = null;
let playbarSwipedDown = false;

let playlistCardBtnPressed = false;

let isShuffled = false;

let currentPlaylistType = "all";

const insertedSongIds = [];
const insertedPlaylistIds = [];
const insertedRefCards = [];
let songData;

const songForCasting = {
  url: "",
  title: "",
  artist: "",
  coverImg: "",
  playlistName: "",
  platform: "Fortissimo",
};

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

const settingsManager = function (action) {
  if (action === "hide") {
    overlay.classList.add("hidden");
    settingsEl.classList.add("hidden");
  } else if (action === "show") {
    overlay.classList.remove("hidden");
    settingsEl.classList.remove("hidden");
  }
};

const lyricsManager = function (action) {
  if (action === "hide") {
    overlay.classList.add("hidden");
    lyricsBox.classList.add("hidden");
  } else if (action === "show") {
    overlay.classList.remove("hidden");
    lyricsBox.classList.remove("hidden");
  }
};

// *************************************************************
// FUNCTION EXPRESSIONS FOR CHANGING SONGS
// *************************************************************

// 1. [****nextSongLoader() is a function which plays next song card of the currently active song card****]

const nextSongLoader = function () {
  // check if a playlist is currently active
  if (currentPlaylistId) {
    // DOM, take the current song url and please give me the currently active song Reference card
    const currentSongRefCard = document.querySelector(
      `[data-refurl="${currentSongUrl}"]`
    );

    // DOM, give me all song reference cards which belong to the same playlist where current reference card is playing
    const currentPlaylistRefSongs = document.querySelectorAll(
      `[data-refplaylist="${currentSongRefCard.dataset.refplaylist}"]`
    );

    // Determining the index of currently playing ref card
    let currentSongIndex = Array.from(currentPlaylistRefSongs).indexOf(
      currentSongRefCard
    );

    // Update (increment) the index value by one
    currentSongIndex++;

    // Decrease the index back to 0 if index exceeds the length of current playlist songs array to implement a loop effect
    if (currentSongIndex >= currentPlaylistRefSongs.length)
      currentSongIndex = 0;

    // Give me the next ref song card of the currently playing card based on the updated index
    const nextSongCard = currentPlaylistRefSongs[currentSongIndex];

    // Click the next song card to play it
    nextSongCard.click();
  }
};

// 2. [****prevSongLoader() is a function which plays the previous song card of the currently active song card****]

const prevSongLoader = function () {
  if (currentPlaylistId) {
    // DOM, take the current song url and please give me the currently active song Reference card
    const currentSongRefCard = document.querySelector(
      `[data-refurl="${currentSongUrl}"]`
    );

    // DOM, give me all song reference cards which belong to the same playlist where current reference card is playing
    const currentPlaylistRefSongs = document.querySelectorAll(
      `[data-refplaylist="${currentSongRefCard.dataset.refplaylist}"]`
    );

    // Determining the index of currently playing ref card
    let currentSongIndex = Array.from(currentPlaylistRefSongs).indexOf(
      currentSongRefCard
    );

    // Update (Decrement) the index value by one
    currentSongIndex--;

    // Increase the index back to the last index number if index exceeds length 0 of current playlist songs array to implement a loop effect
    if (currentSongIndex < 0)
      currentSongIndex = currentPlaylistRefSongs.length - 1;

    // Give me the previous ref song card of the currently playing card based on the updated index
    const nextSongCard = currentPlaylistRefSongs[currentSongIndex];

    // Click the previous song card to play it
    nextSongCard.click();
  }
};

// 3. [****currentSongLoader() is a function which plays the current song card again****]

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

  const resultPlaylistArr = [];

  const searchData = [];

  const searchPlaylistData = [];

  const searchSongs = function () {
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
  };

  const searchPlaylists = function () {
    playlistTargets.forEach((card) => {
      if (
        singleMatchCheck(
          searchText.split(" "),
          card.dataset.playlistname.toLowerCase().split(" ")
        )
      ) {
        card.classList.remove("hide");
        resultPlaylistArr.push(card);
      } else {
        card.classList.add("hide");
      }
    });
  };

  searchSongs();

  if (resultArr.length === 0) {
    data.songData.forEach((obj) => {
      if (
        singleMatchCheck(
          searchText.split(" "),
          obj.title.toLowerCase().split(" ")
        )
      ) {
        searchData.push(obj);
      }
    });

    if (searchData.length > 0) {
      songLoader(searchData, songsContainer, "global", "all");

      searchSongs();
    }
  }

  searchPlaylists();

  if (resultPlaylistArr.length === 0) {
    data.playlistData.forEach((obj) => {
      if (
        singleMatchCheck(
          searchText.split(" "),
          obj.title.toLowerCase().split(" ")
        )
      ) {
        searchPlaylistData.push(obj);
      }
    });

    if (searchPlaylistData.length > 0) {
      playlistLoader(searchPlaylistData, "all");

      searchPlaylists();
    }
  }

  if (allTabIsOpen) {
    allSongsDisplayer.textContent = `Results (${resultArr.length})`;
  } else if (likedTabIsOpen) {
    likedSongsDisplayer.textContent = `Results (${resultArr.length})`;
  }
};

const songLoader = function (songs, container, context, batchSize, songId = 0) {
  const shuffledSongs = [];
  for (let obj of songs) {
    shuffledSongs.push(obj);
  }

  shuffle(shuffledSongs);

  if (songId === 0) {
    if (batchSize !== "all") {
      let sizeCount = 0;

      for (let obj of shuffledSongs) {
        if (!insertedSongIds.includes(obj._id) && sizeCount < batchSize) {
          sizeCount += 1;

          songCardMaker(obj, container, insertedSongIds, context);
        }
      }
    } else {
      for (let obj of shuffledSongs) {
        if (!insertedSongIds.includes(obj._id)) {
          songCardMaker(obj, container, insertedSongIds, context);
        }
      }
    }
  } else if (songId !== 0) {
    for (let obj of shuffledSongs) {
      if (!insertedSongIds.includes(obj._id) && songId === obj._id) {
        songCardMaker(obj, container, insertedSongIds, context);
      }
    }
  }

  const songCards = document.querySelectorAll(".song-card");

  songCards.forEach((card) => {
    if (card.dataset.eventlistener !== "added") {
      card.setAttribute("data-eventlistener", "added");

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
          const songLyrics = card.getAttribute("data-lyrics");
          const id = card.getAttribute("data-id");
          const cardImg = card.querySelector(".song-card-imgbox");
          const btn = card.querySelector(".song-card-play");
          const fullname = card.getAttribute("data-uploader");
          const likes = card.getAttribute("data-likes");
          const date = card.getAttribute("data-uploaded-on");
          const uploaderImg = card.getAttribute("data-uploader-img");

          setTimeout(async function () {
            const context = card.dataset.context;
            const triggeredBy = card.getAttribute("data-triggeredby");

            addHistoryCard(
              songUrl,
              id,
              currentSongName,
              currentArtistName,
              currentSongImg,
              context,
              triggeredBy
            );

            if (triggeredBy) {
              songForCasting.playlistName = document.querySelector(
                `[data-playlistid="${triggeredBy}"]`
              ).dataset.playlistname;
            }

            if (context === "global" && currentRefBtn) {
              currentRefBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
              currentPlaylistBtn.innerHTML =
                '<ion-icon class="icons card-play-icons" name="play"></ion-icon>';

              if (currentPlaylistCardEl)
                currentPlaylistCardEl.classList.remove("playlist--active");
              currentRefCardImg.classList.remove("rotate");
            }

            const histInfo = {
              audioId: id,
              playlistId: triggeredBy || null,
              context: context,
            };

            await recordHistory(histInfo);
          }, 0);

          setTimeout(function () {
            card.setAttribute("data-context", "global");
            card.removeAttribute("data-triggeredby");
          }, 1);

          document.querySelector(".playbar-user-img").src = uploaderImg;
          document.querySelector(".playbar-user-name").textContent = fullname;
          document.querySelector(".playbar-like-num").textContent = likes;
          document.querySelector(".playbar-user-published-on").textContent =
            dateFormatter(date);
          songConTitle.textContent = currentSongName;
          songConArtist.textContent = currentArtistName;
          songConImg.src = currentSongImg || `/default-profile-img.webp`;
          playbar.setAttribute("data-lyrics", songLyrics);
          playbar.setAttribute("data-playbartitle", currentSongName);
          playbar.setAttribute("data-artist", currentArtistName);
          playbar.setAttribute("data-audio-id", id);

          if (songUrl !== currentSongUrl) {
            if (currentBtn)
              currentBtn.innerHTML = '<ion-icon name="play"></ion-icon>';
            if (currentCardImg) currentCardImg.classList.remove("rotate");
          }

          audio.src = songUrl;

          audio.play();

          audio.playbackRate = audioProfile.playbackRate;

          updateVolumeBar(audio.volume);

          btn.innerHTML = '<ion-icon name="pause"></ion-icon>';
          songPlayBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
          cardImg.classList.add("rotate");
          currentSongUrl = songUrl;
          currentBtn = btn;
          currentCardImg = cardImg;

          playbar.classList.remove("hidden");

          // Casting
          songForCasting.url = songUrl;
          songForCasting.title = currentSongName;
          songForCasting.artist = currentArtistName;
          songForCasting.coverImg = currentSongImg;

          loadForCasting(songForCasting);

          if (songLyrics === "null") {
            lyricsBtn.classList.add("btn--inactive");
          } else {
            lyricsBtn.classList.remove("btn--inactive");
          }

          const lyricsContainer = document.querySelector(".lyrics-container");
          lyricsContainer.innerHTML = "";

          if (lyricsStatus.currentLyricsHandler) {
            audio.removeEventListener(
              "timeupdate",
              lyricsStatus.currentLyricsHandler
            );

            lyricsStatus.currentLyricsHandler = null;
          }
        }
      });
    }
  });

  document.querySelectorAll(".like-container").forEach(function (btn) {
    if (btn.dataset.likelistener !== "added") {
      btn.setAttribute("data-likelistener", "added");

      btn.addEventListener("click", async function () {
        const parentCard = btn.closest(".song-card");

        const cardLikeNum = parentCard.querySelector(".like-num");

        if (parentCard) {
          const parentId = parentCard.getAttribute("data-id");

          let targetRefCard = document.querySelector(
            `[data-refid="${parentId}"]`
          );

          if (!targetRefCard) {
            songReferenceLoader(null, songsSection, "playlist", parentId);

            targetRefCard = document.querySelector(
              `[data-refid="${parentId}"]`
            );

            targetRefCard.classList.add("hide");
          }

          const targetRefLikeBtn = targetRefCard.querySelector(
            ".ref-like-container"
          );

          const liked = await registerLike(parentId);

          if (liked === "rejected") return;

          if (liked) {
            parentCard.classList.add("liked");
            cardLikeNum.textContent = Number(cardLikeNum.textContent) + 1;
          } else {
            parentCard.classList.remove("liked");
            cardLikeNum.textContent = Number(cardLikeNum.textContent) - 1;
          }

          if (parentCard.classList.contains("liked")) {
            btn.innerHTML = '<span class="mingcute--thumb-up-2-fill"></span>';
            targetRefLikeBtn.innerHTML =
              '<span class="mingcute--thumb-up-2-fill"></span>';
          } else {
            btn.innerHTML = '<span class="mingcute--thumb-up-2-line"></span>';
            targetRefLikeBtn.innerHTML =
              '<span class="mingcute--thumb-up-2-line"></span>';
          }
        }
      });
    }
  });
};

const playlistLoader = function (
  playlists,
  batchSize,
  targetId = 0,
  type = "all"
) {
  if (targetId === 0) {
    if (type === "all") {
      if (batchSize !== "all") {
        let currentSize = 0;
        playlists.forEach((playlist) => {
          if (
            !insertedPlaylistIds.includes(playlist._id) &&
            currentSize < batchSize
          ) {
            currentSize++;

            playlistCardMaker(playlist, playlistContainer, insertedPlaylistIds);
          }
        });
      } else {
        playlists.forEach((playlist) => {
          if (!insertedPlaylistIds.includes(playlist._id)) {
            playlistCardMaker(playlist, playlistContainer, insertedPlaylistIds);
          }
        });
      }
    } else {
      if (batchSize !== "all") {
        let currentSize = 0;
        playlists.forEach((playlist) => {
          if (
            !insertedPlaylistIds.includes(playlist._id) &&
            currentSize < batchSize &&
            playlist.genre.includes(type)
          ) {
            currentSize++;

            playlistCardMaker(playlist, playlistContainer, insertedPlaylistIds);
          }
        });
      } else {
        playlists.forEach((playlist) => {
          if (!insertedPlaylistIds.includes(playlist._id)) {
            playlistCardMaker(playlist, playlistContainer, insertedPlaylistIds);
          }
        });
      }
    }
  } else {
    playlists.forEach((playlist) => {
      if (
        !insertedPlaylistIds.includes(playlist._id) &&
        targetId === playlist._id
      ) {
        playlistCardMaker(playlist, playlistContainer, insertedPlaylistIds);
      }
    });
  }

  const playlistCards = document.querySelectorAll(".card");

  playlistCards.forEach((playlistCard) => {
    if (playlistCard.dataset.eventlistener !== "added") {
      playlistCard.setAttribute("data-eventlistener", "added");

      playlistCard.addEventListener("click", function (e) {
        if (
          !e.target.classList.contains("card-btn-play") &&
          !e.target.classList.contains("icons")
        ) {
          playlistCoverImg.src =
            playlistCard.dataset.coverimg || "/default-profile-img.webp";
          playlistHeading.textContent = playlistCard.dataset.playlistname;
          playlistDescription.textContent = playlistCard.dataset.description;
          playlistUserImg.src = playlistCard.dataset.creatorimg;
          playlistUsername.textContent = playlistCard.dataset.creator;

          document.querySelector(".saves-num").textContent =
            playlistCard.getAttribute("data-saves");
          document.querySelector(".playlist-duration-num").textContent =
            timeFormatter2(
              Number(playlistCard.getAttribute("data-total-duration"))
            );

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

          const songIdArr = JSON.parse(playlistCard.dataset.songs);

          songReferenceLoader(songIdArr, songsSection, "playlist");

          const playlistId = playlistCard.getAttribute("data-playlistid");
          currentPlaylistId = playlistId;
          playlistBox.setAttribute("data-activatorid", playlistId);

          const allSongRefCards = songsSection.querySelectorAll(
            ".song-reference-card"
          );

          allSongRefCards.forEach((card) => {
            card.classList.add("hide");

            if (songIdArr.includes(card.dataset.refid)) {
              card.classList.remove("hide");
            }
          });
        }
      });

      playlistCard.addEventListener("contextmenu", function (e) {
        e.preventDefault();

        const floatingMenu = playlistCard.querySelector(
          ".playlist-right-click"
        );

        if (currentFloatingMenu) currentFloatingMenu.classList.add("hidden");

        currentFloatingMenu = floatingMenu;

        clickAnywhereToBring(e, floatingMenu, playlistCard);

        floatingMenu.classList.remove("hidden");
      });
    }
  });

  document.querySelectorAll(".card-btn-play").forEach((btn) => {
    if (btn.dataset.eventlistener !== "added") {
      btn.setAttribute("data-eventlistener", "added");

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
    }
  });

  document.querySelectorAll(".playlist-right-click").forEach((menu) => {
    if (menu.dataset.eventlistener !== "added") {
      menu.setAttribute("data-eventlistener", "added");

      menu.addEventListener("click", async function (e) {
        e.stopPropagation();

        if (e.target.closest(".floating-save-btn")) {
          const parentCard = e.target.closest(".card");

          const saved = await savePlaylist(parentCard.dataset.playlistid);

          if (saved === "rejected") return;

          if (saved) {
            parentCard.classList.add("saved");

            if (data.userData) {
              data.playlistData.forEach((playlist) => {
                if (
                  playlist._id === parentCard.getAttribute("data-playlistid")
                ) {
                  savedPlaylistCardMaker(playlist);
                }
              });
            }
          } else {
            parentCard.classList.remove("saved");

            const savedCard = document
              .querySelector(".saved-playlists__container")
              .querySelector(
                `[data-saved-id="${parentCard.getAttribute(
                  "data-playlistid"
                )}"]`
              );

            if (savedCard) {
              savedCard.classList.add("hidden");
              setTimeout(() => {
                savedCard.remove();
              }, 400);
            }
          }

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
    }
  });
};

const songReferenceLoader = function (
  songIdArr = null,
  container,
  context,
  songId = 0
) {
  if (songIdArr !== null && songId === 0) {
    const songs = [];

    data.songData.forEach((song) => {
      if (songIdArr.includes(song._id)) {
        songs.push(song);
      }
    });

    for (let obj of songs) {
      if (!insertedRefCards.includes(obj._id)) {
        referenceCardMaker(obj, container, context, insertedRefCards);
      }
    }
  } else {
    for (let obj of data.songData) {
      if (!insertedRefCards.includes(obj._id) && obj._id === songId) {
        referenceCardMaker(obj, container, context, insertedRefCards);
      }
    }
  }

  document.querySelectorAll(".song-reference-card").forEach((card) => {
    if (card.dataset.eventlistener !== "added") {
      card.setAttribute("data-eventlistener", "added");

      card.addEventListener("click", function (e) {
        if (
          !e.target.classList.contains("ref-like-container") &&
          !e.target.classList.contains("mingcute--thumb-up-2-line") &&
          !e.target.classList.contains("mingcute--thumb-up-2-fill")
        ) {
          const refId = card.dataset.refid;

          if (!insertedSongIds.includes(Number(refId))) {
            songLoader(
              data.songData,
              songsContainer,
              "global",
              undefined,
              refId
            );
          }

          document.querySelectorAll(".song-card").forEach((globalCard) => {
            if (refId === globalCard.dataset.id) {
              globalCard.click();
              globalCard.setAttribute(
                "data-context",
                `${card.dataset.context}`
              );

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

              document
                .querySelectorAll(".song-reference-card")
                .forEach((el) => {
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

              globalCard.setAttribute(
                "data-triggeredby",
                `${targetPlaylistId}`
              );

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

      const likeBtn = card.querySelector(".ref-like-container");

      likeBtn.addEventListener("click", function () {
        const parentRefCard = this.closest(".song-reference-card");

        const targetId = parentRefCard.dataset.refid;

        const targetGlobalSongCard = document.querySelector(
          `[data-id="${targetId}"]`
        );

        if (targetGlobalSongCard) {
          targetGlobalSongCard.querySelector(".like-container").click();

          if (!data.userData) return;

          const likeNum = parentRefCard.querySelector(".like-num");

          if (likeBtn.innerHTML.includes("fill")) {
            likeNum.textContent = Number(likeNum.textContent) - 1;
          } else {
            likeNum.textContent = Number(likeNum.textContent) + 1;
          }
        } else {
          songLoader(
            data.songData,
            songsContainer,
            "global",
            undefined,
            targetId
          );

          const newLoadedCard = document.querySelector(
            `[data-id="${targetId}"]`
          );

          newLoadedCard.querySelector(".like-container").click();

          if (!data.userData) return;

          const likeNum = parentRefCard.querySelector(".like-num");

          if (likeBtn.innerHTML.includes("fill")) {
            likeNum.textContent = Number(likeNum.textContent) - 1;
          } else {
            likeNum.textContent = Number(likeNum.textContent) + 1;
          }
        }
      });
    }
  });
};

// *************************************************************
// MAIN FUNCTION FOR IMPLEMENTATION OF ALL FEATURES
// *************************************************************

const initApp = async function () {
  await getUserData();

  await getAllSongs();

  await getAllPlaylists();

  await getAllPresets();

  errorNoteManager("hide");
  loadingUI.classList.add("hidden");

  songLoader(data.songData, songsContainer, "global", 20);

  playlistLoader(data.playlistData, 30);

  data.presetData.forEach((preset) =>
    presetCardMaker(preset, "shared-presets__container")
  );

  if (data.userData) {
    renderUserMedia();

    // Ensuring all liked or important user media always loads no matter what

    const importantSongs = [];
    const importantPlaylists = [];

    data.songData.forEach((song) => {
      if (
        data.userData.likedSongs.includes(song._id) ||
        data.userData.uploads.includes(song._id)
      ) {
        importantSongs.push(song);
      }
    });

    songLoader(importantSongs, songsContainer, "global", "all");

    data.playlistData.forEach((playlist) => {
      if (
        data.userData.savedPlaylists.includes(playlist._id) ||
        data.userData.createdPlaylists.includes(playlist._id)
      ) {
        importantPlaylists.push(playlist);
      }
    });

    playlistLoader(importantPlaylists, "all");
  }

  const allSongCards = songsSection.querySelectorAll(".song-card");
  allSongCards.forEach((card) => {
    card.classList.add("hide");
  });

  initSeekbar(
    audio,
    seekbar,
    seekbarThumb,
    seekbarProgressFill,
    bufferedBar,
    currentTimeEl,
    totalDurationEl
  );

  initVolumebar(audio, volumeBar, volumeThumb, volumeFill, volumeIconCont);

  initDraggableWindow(divider, container, leftSection);

  initDraggableFilterTags(filterContainer);

  songsContainer.addEventListener("scroll", function () {
    const scrollTop = this.scrollTop;

    const scrollHeight = this.scrollHeight;

    const rect = this.getBoundingClientRect();

    const containerHeight = rect.height;

    if (scrollTop + containerHeight >= scrollHeight - 100 && !likedTabIsOpen) {
      songLoader(data.songData, songsContainer, "global", 20);
    }
  });

  playlistSection.addEventListener("scroll", function () {
    const scrollTop = this.scrollTop;

    const scrollHeight = this.scrollHeight;

    const rect = this.getBoundingClientRect();

    const containerHeight = rect.height;

    if (scrollTop + containerHeight >= scrollHeight - 200) {
      if (currentPlaylistType !== "all")
        playlistLoader(data.playlistData, 20, 0, currentPlaylistType);
      else playlistLoader(data.playlistData, 20);
    }
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

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".playlist-right-click")) {
      document.querySelectorAll(".playlist-right-click").forEach((menu) => {
        menu.classList.add("hidden");
      });
    }
  });

  document.addEventListener("contextmenu", function (e) {
    if (!e.target.closest(".card")) {
      document.querySelectorAll(".playlist-right-click").forEach((menu) => {
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

    if (isSongLoop) currentSongLoader();

    if (isPlaylistLoop) nextSongLoader();
  });

  document
    .querySelector(".history-list")
    .addEventListener("click", function (e) {
      const card = e.target.closest(".history-card");
      if (!card) return;

      const historyUrl = card.dataset.histurl;
      const histId = card.dataset.histid;

      if (card.getAttribute("data-histcontext") === "global") {
        const targetSongCard = document.querySelector(
          `[data-url="${historyUrl}"]`
        );

        if (targetSongCard) {
          targetSongCard.click();
        } else {
          songLoader(
            data.songData,
            songsContainer,
            "global",
            undefined,
            histId
          );

          const newLoadedCard = document.querySelector(
            `[data-url="${historyUrl}"]`
          );

          newLoadedCard.click();
        }
      }

      if (card.getAttribute("data-histcontext") === "playlist") {
        let targetSongRefCard = document.querySelector(
          `[data-refurl="${historyUrl}"]`
        );

        const refCardId = card.dataset.histid;

        const targetPlaylistId = card.dataset.targetplaylist;
        let targetPlaylist = document.querySelector(
          `[data-playlistid="${targetPlaylistId}"]`
        );
        if (targetPlaylist) {
          targetPlaylist.click();
        } else {
          playlistLoader(data.playlistData, "all", targetPlaylistId);

          targetPlaylist = document.querySelector(
            `[data-playlistid="${targetPlaylistId}"]`
          );

          targetPlaylist.click();
        }

        if (targetSongRefCard) {
          targetSongRefCard.click();
        } else {
          songReferenceLoader(null, songsSection, "playlist", refCardId);

          targetSongRefCard = document.querySelector(
            `[data-refurl="${historyUrl}"]`
          );

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

  document
    .querySelector(".control-imgbox")
    .addEventListener("click", function () {
      playbar.classList.add("expand");

      playbar.classList.add("bg-grey-2");
      playbar.classList.remove("bg-yel-grey-2-1");

      document.querySelector(".playbar-user-stats").classList.remove("hide");

      document.querySelector(".playbar-extra").classList.remove("hide");

      document.querySelector(".playbar-user-info").classList.remove("hide");

      document.querySelector(".playbar-minimize").classList.remove("hide");
    });

  document
    .querySelector(".playbar-minimize")
    .addEventListener("click", function () {
      playbar.classList.remove("expand");

      playbar.classList.remove("bg-grey-2");
      playbar.classList.add("bg-yel-grey-2-1");

      document.querySelector(".playbar-user-stats").classList.add("hide");

      document.querySelector(".playbar-extra").classList.add("hide");

      document.querySelector(".playbar-user-info").classList.add("hide");

      document.querySelector(".playbar-minimize").classList.add("hide");
    });

  document
    .querySelector(".playbar-10-next")
    .addEventListener("click", function () {
      if (!audio.src) return;
      audio.currentTime += 10;
    });

  document
    .querySelector(".playbar-10-prev")
    .addEventListener("click", function () {
      if (!audio.src) return;
      audio.currentTime -= 10;
    });

  document
    .querySelector(".playbar-report-btn")
    .addEventListener("click", async function () {
      windowManager('.report-box', 'show');

      const id = playbar.getAttribute('data-audio-id');

      document.querySelector('.report-box').setAttribute('data-id', id);
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

  historyBtn.addEventListener("click", function () {
    historyManager("show");
  });

  let originalOrder = document.querySelectorAll(".song-reference-card");

  toggleShuffleBtn.addEventListener("click", function () {
    if (isShuffled) {
      deShufflePlaylists(originalOrder);
    } else {
      originalOrder = document.querySelectorAll(".song-reference-card");

      shufflePlaylists();
    }

    isShuffled = !isShuffled;

    this.classList.toggle("btn--active");
  });

  eqBtn.addEventListener("click", function () {
    eqManager("show");
  });

  filterContainer.addEventListener("click", function (e) {
    const sourceEl = e.target;

    if (sourceEl === filterContainer) return;

    document.querySelectorAll(".filter-tag").forEach((el) => {
      el.classList.remove("filter-active");
    });

    sourceEl.classList.add("filter-active");

    const targetType = sourceEl.getAttribute("data-genre");

    currentPlaylistType = targetType;

    document.querySelectorAll(".card").forEach((playlist) => {
      if (targetType !== "all") {
        if (playlist.getAttribute("data-playlistType").includes(targetType)) {
          playlist.classList.remove("hide");
        } else {
          playlist.classList.add("hide");
        }
      } else {
        playlist.classList.remove("hide");
      }
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

      if (!btn.parentElement.classList.contains("signup-box")) {
        overlay.classList.add("hidden");
      }

      if (btn.parentElement.classList.contains("signup-box")) {
        cleanupSignupWindow();
      }

      if (btn.parentElement.classList.contains("comments-box")) {
        document.querySelector(".comments-container").innerHTML = "";
      }
    });
  });

  settingsBtn.addEventListener("click", function () {
    settingsManager("show");
  });

  leftSongSectionBtn.addEventListener("click", function () {
    leftSection.classList.add("bring-left");
  });

  rightPlaylistSectionBtn.addEventListener("click", function () {
    leftSection.classList.remove("bring-left");
  });

  lyricsBtn.addEventListener("click", function () {
    const songNameEl = document.querySelector(".lyrics-song-name");
    const artistEl = document.querySelector(".lyrics-song-artist");

    const title = playbar.dataset.playbartitle;
    const artist = playbar.dataset.artist;

    const lyricsUrl = playbar.dataset.lyrics;

    songNameEl.textContent = title;
    artistEl.textContent = artist;

    lyricsManager("show");

    initLyrics(lyricsUrl);
  });

  // CREATED PLAYLISTS

  document
    .querySelector(".created-playlists__container")
    .addEventListener("click", async function (e) {
      if (
        !e.target.closest(".created-playlist-edit") &&
        !e.target.closest(".created-playlists__card-option") &&
        !e.target.closest(".created-playlists__card-option-btn") &&
        e.target.closest(".created-playlists__card")
      ) {
        const id = e.target
          .closest(".created-playlists__card")
          .getAttribute("data-playlist-id");

        const targetCard = document
          .querySelector(".cardContainer")
          .querySelector(`[data-playlistid="${id}"]`);

        windowManager(".created-playlists", "hide");

        if (targetCard) {
          targetCard.click();
        } else {
          playlistLoader(data.playlistData, "all", id);

          const targetCard = document
            .querySelector(".cardContainer")
            .querySelector(`[data-playlistid="${id}"]`);

          targetCard.click();
        }
      }

      if (e.target.closest(".created-playlist-edit")) {
        document
          .querySelector(".created-playlists__exit")
          .classList.remove("hidden");
        const parentCard = e.target.closest(".created-playlists__card");

        const id = parentCard.getAttribute("data-playlist-id");
        const title = parentCard.getAttribute("data-playlist-title");
        const desc = parentCard.getAttribute("data-playlist-desc");
        const accessibility = parentCard.getAttribute("data-playlist-public");

        playlistEditContainer.setAttribute("data-playlist-id", id);
        playlistEditImgInput.value = "";
        playlistEditTitleInput.value = title;
        playlistEditDescInput.value = desc;
        playlistEditImgEl.src = "/default-profile-img.webp";

        allEditTags.forEach((tag) => {
          tag.classList.remove("tag--active");
        });

        editTags.length = 0;

        playlistEditImgWarn.classList.add("hidden");
        this.classList.add("hide");
        playlistEditContainer.classList.remove("hide");

        if (accessibility === "true") {
          playlistEditAccessInput.value = "Public";
        } else if (accessibility === "false") {
          playlistEditAccessInput.value = "Private";
        }
      }

      if (e.target.closest(".created-playlists__card-option")) {
        const parentCard = e.target.closest(".created-playlists__card");
        const targetOptionBox = parentCard.querySelector(
          ".playlist-card-options"
        );
        targetOptionBox.classList.toggle("hidden");
      }

      if (e.target.closest(".del-playlistcover")) {
        const parentCard = e.target.closest(".created-playlists__card");
        const id = parentCard.getAttribute("data-playlist-id");

        const confirmed = await showConfirmationModal(
          "Do you want to delete the cover image?"
        );
        if (!confirmed) return;

        loadingText.textContent = "Deleting cover image";

        windowManager(".loading-window", "show");

        const deleted = await deletePlaylistCoverImage(id);

        windowManager(".loading-window", "hide");

        if (!deleted) return;

        parentCard.querySelector(".created-playlists__card-img").src =
          "/default-profile-img.webp";
      }

      if (e.target.closest(".del-playlist")) {
        const parentCard = e.target.closest(".created-playlists__card");
        const id = parentCard.getAttribute("data-playlist-id");

        const confirmed = await showConfirmationModal(
          "Do you really want to delete the playlist?"
        );

        if (!confirmed) return;

        loadingText.textContent = "Deleting playlist";

        windowManager(".loading-window", "show");

        const deleted = await deletePlaylist(id);

        windowManager(".loading-window", "hide");

        if (!deleted) return;

        parentCard.classList.add("hidden");

        setTimeout(() => {
          parentCard.remove();
        }, 400);

        const targetCard = playlistContainer.querySelector(
          `[data-playlistid="${id}"]`
        );

        if (targetCard) targetCard.remove();

        data.playlistData.forEach((playlist) => {
          if (playlist._id === id) {
            data.playlistData.splice(data.playlistData.indexOf(playlist), 1);
          }
        });
      }

      if (e.target.closest(".add-songs-in")) {
        document
          .getElementById("search-songs-playlist")
          .classList.remove("hide");

        const parentCard = e.target.closest(".created-playlists__card");

        const songs = parentCard.getAttribute("data-songs");

        const id = parentCard.getAttribute("data-playlist-id");

        document
          .querySelector(".created-playlists__songs")
          .setAttribute("data-id", id);

        document
          .querySelector(".created-playlists__container")
          .classList.add("hide");

        document
          .querySelector(".created-playlists__exit")
          .classList.remove("hidden");

        document
          .querySelector(".created-playlists__songs")
          .classList.remove("hide");

        data.songData.forEach((song) => {
          addSongCardMaker(song, songs);
        });
      }
    });

  document
    .querySelector(".created-playlists__songs")
    .addEventListener("click", async function (e) {
      if (
        !e.target.closest(".add-this-song") &&
        !e.target.closest(".remove-this-song") &&
        e.target.closest(".add-song__card")
      ) {
        const id = e.target
          .closest(".add-song__card")
          .getAttribute("data-add-id");

        let targetCard = document
          .querySelector(".songlist")
          .querySelector(`[data-id="${id}"]`);

        if (targetCard) {
          targetCard.click();
        } else {
          songLoader(data.songData, songsContainer, "global", undefined, id);
          targetCard = document
            .querySelector(".songlist")
            .querySelector(`[data-id="${id}"]`);

          targetCard.click();
        }
      }

      if (e.target.closest(".add-this-song")) {
        const parentCard = e.target.closest(".add-song__card");
        const songId = parentCard.getAttribute("data-add-id");
        const playlistId = document
          .querySelector(".created-playlists__songs")
          .getAttribute("data-id");
        const duration = parentCard.getAttribute("data-duration");

        const added = await addSong(playlistId, songId);

        if (!added) return;

        parentCard.querySelector(".add-this-song").classList.add("hide");
        parentCard.querySelector(".remove-this-song").classList.remove("hide");

        const targetPlaylist = playlistContainer.querySelector(
          `[data-playlistid="${playlistId}"]`
        );

        if (targetPlaylist) {
          targetPlaylist.remove();
          insertedPlaylistIds.splice(
            insertedPlaylistIds.indexOf(playlistId),
            1
          );
        }

        data.playlistData.forEach((playlist) => {
          if (playlist._id === playlistId) {
            playlist.songs.push(songId);
            playlist.totalDuration += duration;
          }
        });

        playlistLoader(data.playlistData, "all", playlistId);
      }

      if (e.target.closest(".remove-this-song")) {
        const parentCard = e.target.closest(".add-song__card");
        const songId = parentCard.getAttribute("data-add-id");
        const playlistId = document
          .querySelector(".created-playlists__songs")
          .getAttribute("data-id");
        const duration = parentCard.getAttribute("data-duration");

        const removed = await removeSong(playlistId, songId);

        if (!removed) return;

        parentCard.querySelector(".add-this-song").classList.remove("hide");
        parentCard.querySelector(".remove-this-song").classList.add("hide");

        const targetPlaylist = playlistContainer.querySelector(
          `[data-playlistid="${playlistId}"]`
        );

        if (targetPlaylist) {
          targetPlaylist.remove();
          insertedPlaylistIds.splice(
            insertedPlaylistIds.indexOf(playlistId),
            1
          );
        }

        data.playlistData.forEach((playlist) => {
          if (playlist._id === playlistId) {
            playlist.songs.splice(playlist.songs.indexOf(songId), 1);
            playlist.totalDuration -= duration;
          }
        });

        playlistLoader(data.playlistData, "all", playlistId);
      }
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

  initUserOperations();

  initAIChat();

  loadSettings();

  initSettingsInput();

  initSettingsToggleBtn(settingsEl, settingsProfile);

  initSettingsOptions(settingsTabs, settingsSections);

  initThemeColorBtns(themeColorBtns, settingsProfile);

  initVisualizerColorOptions(visColorBtns, settingsProfile);

  initPlaybackSpeedSlider(speedTrack, speedThumb, speedFill);

  initFftSizeSlider(fftTrack, fftThumb, fftFill);

  initVolumeBoostSlider(gainTrack, gainThumb, gainFill);

  initLFOFrequencySlider(lfoTrack, lfoThumb, lfoFill);

  initChooseLFOWaveform();

  initChromecast();

  initComments();

  initReport();

  allCloseOkBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log("click");
      btn.parentElement.classList.add("hidden");
      overlay.classList.add("hidden");
    });
  });

  try {
    await initApp();

    mediaListeners();

    audioManipulator();

    initKeyHandler();

    initLRCGenerator();
  } catch (err) {
    console.log(err);

    loadingUI.classList.add("hidden");
    errorNoteManager("show");
  }
})();
