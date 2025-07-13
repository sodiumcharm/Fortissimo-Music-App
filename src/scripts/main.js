"use strict";

// IMPORTS
import { url } from "./config.js";
import { audio, audioManipulator, eqBtn } from "./audioProcessor.js";
import {
  singleMatchCheck,
  clickAnywhereToBring,
  scrollResponder,
  playlistCardMaker,
  songCardMaker,
  referenceCardMaker,
} from "./utilities.js";
import { addHistoryCard } from "./historyManager.js";
import {
  initDraggableWindow,
  initDraggableFilterTags,
  initSeekbar,
  updateVolumeBar,
  initVolumebar,
} from "./draggableUi.js";
import { initSettingsOptions, initThemeColorBtns } from "./settings.js";

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

const settingsBtn = document.querySelector(".settings");
const settingsEl = document.querySelector(".main-settings");
const settingsTabs = document.querySelectorAll(".settings-tab-btn");
const settingsSections = document.querySelectorAll(".right-settings-container");
const themeColorBtns = document.querySelectorAll(".theme-color");

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

let currentPlaylistType = "all";

const insertedSongIds = [];
const insertedPlaylistIds = [];
let songData;

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
    songData.songs.forEach((obj) => {
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
    songData.playlists.forEach((obj) => {
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
  if (songId === 0) {
    if (batchSize !== "all") {
      let sizeCount = 0;

      for (let obj of songs) {
        if (!insertedSongIds.includes(obj.id) && sizeCount < batchSize) {
          sizeCount += 1;

          songCardMaker(obj, url, container, insertedSongIds, context);
        }
      }
    } else {
      for (let obj of songs) {
        if (!insertedSongIds.includes(obj.id)) {
          songCardMaker(obj, url, container, insertedSongIds, context);
        }
      }
    }
  } else if (songId !== 0) {
    for (let obj of songs) {
      if (!insertedSongIds.includes(obj.id) && songId === obj.id) {
        songCardMaker(obj, url, container, insertedSongIds, context);
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
          const id = card.getAttribute("data-id");
          const cardImg = card.querySelector(".song-card-imgbox");
          const btn = card.querySelector(".song-card-play");

          setTimeout(function () {
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

          updateVolumeBar(audio.volume, volumeThumb, volumeFill);

          btn.innerHTML = '<ion-icon name="pause"></ion-icon>';
          songPlayBtn.innerHTML = '<ion-icon name="pause"></ion-icon>';
          cardImg.classList.add("rotate");
          currentSongUrl = songUrl;
          currentBtn = btn;
          currentCardImg = cardImg;

          playbar.classList.remove("hidden");
        }
      });
    }
  });

  document.querySelectorAll(".like-container").forEach(function (btn) {
    if (btn.dataset.likelistener !== "added") {
      btn.setAttribute("data-likelistener", "added");

      btn.addEventListener("click", function () {
        const parentCard = btn.closest(".song-card");

        if (parentCard) {
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
            !insertedPlaylistIds.includes(playlist.id) &&
            currentSize < batchSize
          ) {
            currentSize++;

            playlistCardMaker(
              playlist,
              url,
              playlistContainer,
              insertedPlaylistIds
            );
          }
        });
      } else {
        playlists.forEach((playlist) => {
          if (!insertedPlaylistIds.includes(playlist.id)) {
            playlistCardMaker(
              playlist,
              url,
              playlistContainer,
              insertedPlaylistIds
            );
          }
        });
      }
    } else {
      if (batchSize !== "all") {
        let currentSize = 0;
        playlists.forEach((playlist) => {
          if (
            !insertedPlaylistIds.includes(playlist.id) &&
            currentSize < batchSize &&
            playlist.type.includes(type)
          ) {
            currentSize++;

            playlistCardMaker(
              playlist,
              url,
              playlistContainer,
              insertedPlaylistIds
            );
          }
        });
      } else {
        playlists.forEach((playlist) => {
          if (!insertedPlaylistIds.includes(playlist.id)) {
            playlistCardMaker(
              playlist,
              url,
              playlistContainer,
              insertedPlaylistIds
            );
          }
        });
      }
    }
  } else {
    playlists.forEach((playlist) => {
      if (
        !insertedPlaylistIds.includes(playlist.id) &&
        targetId === playlist.id
      ) {
        playlistCardMaker(
          playlist,
          url,
          playlistContainer,
          insertedPlaylistIds
        );
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

          const playlistId = playlistCard.getAttribute("data-playlistid");
          currentPlaylistId = playlistId;
          playlistBox.setAttribute("data-activatorid", playlistId);

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
    }
  });
};

const songReferenceLoader = function (songs, container, context) {
  for (let obj of songs) {
    referenceCardMaker(obj, url, container, context);
  }

  document.querySelectorAll(".song-reference-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (
        !e.target.classList.contains("ref-like-container") &&
        !e.target.classList.contains("mingcute--thumb-up-2-line") &&
        !e.target.classList.contains("mingcute--thumb-up-2-fill")
      ) {
        const refId = card.dataset.refid;

        if (!insertedSongIds.includes(Number(refId))) {
          songLoader(
            songData.songs,
            songsContainer,
            "global",
            undefined,
            Number(refId)
          );
        }

        document.querySelectorAll(".song-card").forEach((globalCard) => {
          if (refId === globalCard.dataset.id) {
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

const initApp = async function () {
  let res = await fetch(url + "/api/songs");

  songData = await res.json();

  errorNoteManager("hide");
  loadingUI.classList.add("hidden");

  songLoader(songData.songs, songsContainer, "global", 20);

  playlistLoader(songData.playlists, 30);

  songReferenceLoader(songData.songs, songsSection, "playlist");

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
      songLoader(songData.songs, songsContainer, "global", 20);
    }
  });

  playlistSection.addEventListener("scroll", function () {
    const scrollTop = this.scrollTop;

    const scrollHeight = this.scrollHeight;

    const rect = this.getBoundingClientRect();

    const containerHeight = rect.height;

    if (scrollTop + containerHeight >= scrollHeight - 200) {
      if (currentPlaylistType !== "all")
        playlistLoader(songData.playlists, 20, 0, currentPlaylistType);
      else playlistLoader(songData.playlists, 20);
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
            songData.songs,
            songsContainer,
            "global",
            undefined,
            Number(histId)
          );

          const newLoadedCard = document.querySelector(
            `[data-url="${historyUrl}"]`
          );

          newLoadedCard.click();
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

  historyBtn.addEventListener("click", function () {
    historyManager("show");
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
        if (
          JSON.parse(playlist.getAttribute("data-playlistType")).includes(
            targetType
          )
        ) {
          playlist.classList.remove("hide");
        } else {
          playlist.classList.add("hide");
        }
      } else {
        playlist.classList.remove("hide");
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

      if (targetGlobalSongCard) {
        targetGlobalSongCard.querySelector(".like-container").click();
      } else {
        songLoader(
          songData.songs,
          songsContainer,
          "global",
          undefined,
          Number(targetId)
        );

        const newLoadedCard = document.querySelector(`[data-id="${targetId}"]`);
        newLoadedCard.querySelector(".like-container").click();
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
      overlay.classList.add("hidden");
    });
  });

  settingsBtn.addEventListener("click", function () {
    settingsManager("show");
  });

  initSettingsOptions(settingsTabs, settingsSections);

  initThemeColorBtns(themeColorBtns);
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
    await initApp();
    audioManipulator();
  } catch (err) {
    console.log(err);

    loadingUI.classList.add("hidden");
    errorNoteManager("show");
  }
})();
