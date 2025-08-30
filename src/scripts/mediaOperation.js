import {
  createdPlaylistCardMaker,
  fileSizeConverter,
  presetCardMaker,
  savedPlaylistCardMaker,
  uploadedSongCardMaker,
} from "./utilities.js";
import {
  data,
  deleteAudioCoverImage,
  deleteLyrics,
  editAudio,
  windowManager,
  deleteAudio,
  uploadAudio,
  createPlaylist,
  editPlaylist,
} from "./serverConnection.js";
import { singleMatchCheck } from "./utilities.js";

const loadingText = document.querySelector(".loading-window__text");
const errorText = document.querySelector(".error-window__text");
const confirmText = document.querySelector(".confirmation-window__text");

const uploadedSongSearchInput = document.getElementById(
  "search-uploaded-songs"
);
const uploadedSongsContainer = document.querySelector(
  ".uploaded-songlist__list"
);

const savedPlaylistContainer = document.querySelector(
  ".saved-playlists__container"
);

const importedPresetContainer = document.querySelector(
  ".imported-presets__container"
);

const songEditSection = document.querySelector(".uploaded-songlist__edit");
const changeAudioImgBox = document.querySelector(
  ".uploaded-songlist__upload-imgbox"
);
const changeAudioImgEl = document.querySelector(
  ".uploaded-songlist__upload-img"
);
const changeAudioImgWarning = document.querySelector(".audio-change-img-warn");
const changeAudioImgRemove = document.querySelector(".remove-audiocover-btn");
const changeAudioImgInput = document.getElementById("edit-audio-cover-image");
const changeAudioLyricsBox = document.querySelector(
  ".uploaded-songlist__upload-lyricsbox"
);
const changeAudioImgLabel = document.querySelector(".change-audiocover-label");
const changeAudioLyricsText = document.querySelector(
  ".uploaded-songlist__upload-lyricsfile"
);
const changeAudioLyricsWarning = document.querySelector(
  ".audio-change-lyrics-warn"
);
const changeAudioLyricsRemove = document.querySelector(".remove-lyrics-btn");
const changeAudioLyricsLabel = document.querySelector(".change-lyrics-label");
const changeAudioLyricsInput = document.getElementById("edit-audio-lyrics");
const editAudioTitleInput = document.getElementById("change-audiotitle-input");
const editAudioArtistInput = document.getElementById("change-artist-input");
const editAudioPublicInput = document.getElementById(
  "change-audioaccess-input"
);
const saveAudioEdit = document.querySelector(".audio-save-changes");
const exitAudioEditBtn = document.querySelector(".uploaded-songlist__exit");
const audioUploadBox = document.querySelector(".upload-audio-box");
const audioUploadText = document.querySelector(".upload-audio-text");
const audioUploadWarning = document.querySelector(".audio-warn");
const audioUploadRemove = document.querySelector(".remove-audio-upload");
const audioUploadLabel = document.querySelector(".upload-audio-label");
const audioUploadInput = document.getElementById("upload-audio-file");
const audioUploadImgBox = document.querySelector(".upload-song__imgbox");
const audioUploadImgEl = document.querySelector(".upload-song__img");
const audioUploadImgWarning = document.querySelector(".audio-img-warn");
const audioUploadImgRemove = document.querySelector(
  ".remove-coverimage-upload"
);
const audioUploadImgLabel = document.querySelector(".upload-audiocover-label");
const audioUploadImgInput = document.getElementById("upload-audiocover");
const audioUploadLyricsBox = document.querySelector(".upload-lyrics-box");
const audioUploadLyricsText = document.querySelector(".upload-lyrics-text");
const audioUploadLyricsWarning = document.querySelector(".audio-lyrics-warn");
const audioUploadLyricsRemove = document.querySelector(".remove-lyrics-upload");
const audioUploadLyricsLabel = document.querySelector(".upload-lyrics-label");
const audioUploadLyricsInput = document.getElementById("upload-audio-lyrics");
const audioUploadTitleInput = document.getElementById(
  "upload-audiotitle-input"
);
const audioUploadArtistInput = document.getElementById("upload-artist-input");
const audioUploadAccessInput = document.getElementById(
  "upload-audioaccess-input"
);
const audioUploadMainBtn = document.querySelector(".audio-upload-main-btn");
const savedPlaylistSearchInput = document.getElementById(
  "search-saved-playlists"
);
const publishedPresetContainer = document.querySelector(
  ".published-presets__container"
);
const playlistUploadImgbox = document.querySelector(".create-playlist__imgbox");
const playlistUploadImg = document.querySelector(".create-playlist__img");
const playlistUploadImgWarning = document.querySelector(".playlist-img-warn");
const playlistUploadImgRemove = document.querySelector(".remove-playlistcover");
const playlistUploadLabel = document.querySelector(
  ".upload-playlistcover-label"
);
const playlistUploadInput = document.getElementById("upload-playlistcover");
const playlistUploadTitleInput = document.getElementById(
  "upload-playlisttitle-input"
);
const playlistUploadDescInput = document.querySelector(
  ".upload-description-input"
);
const playlistUploadAccessInput = document.getElementById(
  "upload-playlistaccess-input"
);
const createPlaylistBtn = document.querySelector(".create-playlist-btn");
const createPlaylistTagContainer = document.querySelector(
  ".create-playlist__tag-container"
);
const createdPlaylistsContainer = document.querySelector(
  ".created-playlists__container"
);
const playlistEditContainer = document.querySelector(".edit-playlist");
const playlistEditImgWarn = document.querySelector(".playlist-edit-img-warn");
const playlistEditImgEl = document.querySelector(".edit-playlist__img");
const playlistEditImgbox = document.querySelector(".edit-playlist__imgbox");
const playlistEditRemoveImg = document.querySelector(
  ".edit-remove-playlistcover"
);
const playlistEditImgLabel = document.querySelector(
  ".edit-playlistcover-label"
);
const playlistEditImgInput = document.getElementById("edit-playlistcover");
const playlistEditTagContainer = document.querySelector(
  ".edit-playlist__tag-container"
);
const allEditTags = document.querySelectorAll(".edit-playlist__tag");
const playlistEditTitleInput = document.getElementById(
  "edit-playlisttitle-input"
);
const playlistEditDescInput = document.querySelector(".edit-description-input");
const playlistEditAccessInput = document.getElementById(
  "edit-playlistaccess-input"
);
const playlistEditBtn = document.querySelector(".edit-playlist-btn");
const searchSongsInput = document.getElementById("search-songs-playlist");

const tags = [];
export const editTags = [];

export const showConfirmationModal = function (text = "Are you sure?") {
  return new Promise((resolve) => {
    const delWindow = document.querySelector(".del-confirm");
    document.querySelector(".del-confirm__text").textContent = text;

    delWindow.classList.remove("hidden");

    const yesBtn = document.querySelector(".del-yes");
    const noBtn = document.querySelector(".del-no");

    yesBtn.onclick = function () {
      delWindow.classList.add("hidden");
      resolve(true);
    };

    noBtn.onclick = function () {
      delWindow.classList.add("hidden");
      resolve(false);
    };
  });
};

// *************************************************************
// LOAD USER ACCOUNT MEDIA
// *************************************************************

export const mediaLoader = function () {
  if (!data.userData) return;

  uploadedSongsContainer.innerHTML = "";

  data.songData.forEach((song) => {
    if (data.userData.uploads.includes(song._id)) {
      uploadedSongCardMaker(song);
    }
  });

  savedPlaylistContainer.innerHTML = "";

  data.playlistData.forEach((playlist) => {
    if (data.userData.savedPlaylists.includes(playlist._id)) {
      savedPlaylistCardMaker(playlist);
    }
  });

  importedPresetContainer.innerHTML = "";

  data.presetData.forEach((preset) => {
    if (data.userData.importedPresets.includes(preset._id)) {
      presetCardMaker(preset, "imported-presets__container");
    }
  });

  publishedPresetContainer.innerHTML = "";

  data.presetData.forEach((preset) => {
    if (data.userData.publishedPresets.includes(preset._id)) {
      presetCardMaker(preset, "published-presets__container", true);
    }
  });

  createdPlaylistsContainer.innerHTML = "";

  data.playlistData.forEach((playlist) => {
    if (data.userData.createdPlaylists.includes(playlist._id)) {
      createdPlaylistCardMaker(playlist);
    }
  });
};

// *************************************************************
// EVENTLISTENERS FOR THE LOADED MEDIA
// *************************************************************

export const mediaListeners = function () {
  // *************************************************************
  // FOR UPLOADED SONG LIST
  // *************************************************************

  uploadedSongSearchInput.addEventListener("input", function () {
    const allUploadAudios = document.querySelectorAll(
      ".uploaded-songlist__card"
    );
    setTimeout(() => {
      const searchInput = uploadedSongSearchInput.value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      allUploadAudios.forEach((card) => {
        if (
          singleMatchCheck(
            searchInput.split(" "),
            card.getAttribute("data-audio-title").toLowerCase().split(" ")
          )
        ) {
          card.classList.remove("hide");
        } else {
          card.classList.add("hide");
        }
      });
    }, 300);
  });

  uploadedSongsContainer.addEventListener("click", async function (e) {
    if (
      !e.target.closest(".uploaded-song-edit") &&
      !e.target.closest(".uploaded-songlist__card-option") &&
      !e.target.closest(".del-audiocover") &&
      !e.target.closest(".del-lyrics") &&
      !e.target.closest(".del-audio") &&
      e.target.closest(".uploaded-songlist__card")
    ) {
      const id = e.target
        .closest(".uploaded-songlist__card")
        .getAttribute("data-audio-id");

      const targetCard = document
        .querySelector(".songlist")
        .querySelector(`[data-id="${id}"]`);

      if (targetCard) targetCard.click();
    }

    if (e.target.closest(".uploaded-song-edit")) {
      exitAudioEditBtn.classList.remove("hidden");
      uploadedSongSearchInput.classList.add("hide");
      changeAudioImgEl.src = "/default-profile-img.webp";
      changeAudioImgInput.value = "";
      changeAudioLyricsInput.value = "";
      changeAudioImgWarning.classList.add("hidden");
      changeAudioLyricsWarning.classList.add("hidden");
      changeAudioLyricsText.textContent = "No File Chosen";

      uploadedSongSearchInput.classList.add("hide");
      songEditSection.classList.remove("collapse-hide");
      uploadedSongsContainer.classList.add("collapse-hide");

      const parentCard = e.target.closest(".uploaded-songlist__card");
      const id = parentCard.getAttribute("data-audio-id");
      const title = parentCard.getAttribute("data-audio-title");
      const artist = parentCard.getAttribute("data-audio-artist");
      const accessibility = parentCard.getAttribute("data-audio-public");

      songEditSection.setAttribute("data-current-id", id);

      editAudioTitleInput.value = title;
      editAudioArtistInput.value = artist;

      if (accessibility === "true") {
        editAudioPublicInput.value = "Public";
      } else if (accessibility === "false") {
        editAudioPublicInput.value = "Private";
      }
    }

    if (e.target.closest(".uploaded-songlist__card-option")) {
      const parentCard = e.target.closest(".uploaded-songlist__card");
      const targetOptionBox = parentCard.querySelector(".card-options");
      targetOptionBox.classList.toggle("hidden");
    }

    if (e.target.closest(".del-audiocover")) {
      const parentCard = e.target.closest(".uploaded-songlist__card");
      const id = parentCard.getAttribute("data-audio-id");

      const confirmed = await showConfirmationModal(
        "Do you really want to delete the cover image?"
      );

      if (!confirmed) return;

      loadingText.textContent = "Deleting cover image";

      windowManager(".loading-window", "show");

      const deleted = await deleteAudioCoverImage(id);

      windowManager(".loading-window", "hide");

      if (!deleted) return;

      parentCard.querySelector(".uploaded-songlist__card-img").src =
        "/default-profile-img.webp";
    }

    if (e.target.closest(".del-lyrics")) {
      const parentCard = e.target.closest(".uploaded-songlist__card");
      const id = parentCard.getAttribute("data-audio-id");

      const confirmed = await showConfirmationModal(
        "Do you really want to delete the lyrics?"
      );

      if (!confirmed) return;

      loadingText.textContent = "Deleting lyrics";

      windowManager(".loading-window", "show");

      await deleteLyrics(id);

      windowManager(".loading-window", "hide");
    }

    if (e.target.closest(".del-audio")) {
      const parentCard = e.target.closest(".uploaded-songlist__card");
      const id = parentCard.getAttribute("data-audio-id");

      const confirmed = await showConfirmationModal(
        "Do you really want to delete the song?"
      );

      if (!confirmed) return;

      loadingText.textContent = "Deleting audio";

      windowManager(".loading-window", "show");

      const deleted = await deleteAudio(id);

      windowManager(".loading-window", "hide");

      if (!deleted) return;

      parentCard.classList.add("collapse-hide");

      setTimeout(() => {
        parentCard.remove();
      }, 500);
    }
  });

  exitAudioEditBtn.addEventListener("click", function () {
    uploadedSongSearchInput.classList.remove("hide");
    songEditSection.classList.add("collapse-hide");
    uploadedSongsContainer.classList.remove("collapse-hide");
    this.classList.add("hidden");
  });

  changeAudioImgBox.addEventListener("click", function () {
    changeAudioImgLabel.click();
  });

  changeAudioImgInput.addEventListener("change", function () {
    const image = this.files[0];

    if (!image) return;

    changeAudioImgWarning.classList.add("hidden");

    const imageUrl = URL.createObjectURL(image);
    changeAudioImgEl.src = imageUrl;

    changeAudioImgEl.onload = function () {
      URL.revokeObjectURL(imageUrl);
    };
  });

  changeAudioImgRemove.addEventListener("click", function () {
    changeAudioImgWarning.classList.add("hidden");
    changeAudioImgEl.src = "/default-profile-img.webp";
    changeAudioImgInput.value = "";
  });

  changeAudioLyricsBox.addEventListener("click", function () {
    changeAudioLyricsLabel.click();
  });

  changeAudioLyricsInput.addEventListener("change", function () {
    const lrc = this.files[0];

    if (!lrc) return;

    changeAudioLyricsWarning.classList.add("hidden");

    changeAudioLyricsText.textContent = lrc.name;
  });

  changeAudioLyricsRemove.addEventListener("click", function () {
    changeAudioLyricsWarning.classList.add("hidden");
    changeAudioLyricsInput.value = "";
    changeAudioLyricsText.textContent = "No File Chosen";
  });

  saveAudioEdit.addEventListener("click", async function () {
    const id = songEditSection.getAttribute("data-current-id");
    const coverImage = changeAudioImgInput.files[0];
    const lrc = changeAudioLyricsInput.files[0];
    const title = editAudioTitleInput.value;
    const artist = editAudioArtistInput.value;
    const access = editAudioPublicInput.value;

    if (lrc && fileSizeConverter(lrc.size, "mb") > 2) {
      changeAudioLyricsWarning.textContent = "Too large file!";
      changeAudioLyricsWarning.classList.remove("hidden");
      return;
    }

    if (coverImage && fileSizeConverter(coverImage.size, "mb") > 5) {
      changeAudioImgWarning.textContent = "Max allowed size is 5MB!";
      changeAudioImgWarning.classList.remove("hidden");
      return;
    }

    const formdata = new FormData();

    formdata.append("id", id);

    if (coverImage) {
      formdata.append("coverImage", coverImage);
    }

    if (lrc) {
      formdata.append("lyrics", lrc);
    }

    if (title.trim() !== "") {
      formdata.append("title", title);
    }

    if (artist.trim() !== "") {
      formdata.append("artist", artist);
    }

    if (access.trim() !== "") {
      if (!["public", "private"].includes(access.toLowerCase())) {
        errorText.textContent =
          "Invalid accessibility input! It can be either public or private.";
        windowManager(".error-window", "show");
        return;
      }
    }

    if (access.trim() !== "") {
      if (access.toLowerCase() === "public") {
        formdata.append("access", "true");
      } else if (access.toLowerCase() === "private") {
        formdata.append("access", "false");
      }
    }

    loadingText.textContent = "Saving changes";

    windowManager(".loading-window", "show");

    const changed = await editAudio(formdata);

    windowManager(".loading-window", "hide");

    if (changed) {
      confirmText.textContent = "Changes are saved successfully.";
      windowManager(".confirmation-window", "show");
    }
  });

  // *************************************************************
  // FOR SONG UPLOAD LOGIC
  // *************************************************************

  audioUploadBox.addEventListener("click", function () {
    audioUploadLabel.click();
  });

  audioUploadInput.addEventListener("change", function () {
    const audio = this.files[0];

    if (!audio) return;

    audioUploadWarning.classList.add("hidden");

    audioUploadText.textContent = audio.name;
  });

  audioUploadRemove.addEventListener("click", function () {
    audioUploadWarning.classList.add("hidden");
    audioUploadInput.value = "";
    audioUploadText.textContent = "Add Audio File";
  });

  audioUploadImgBox.addEventListener("click", function () {
    audioUploadImgLabel.click();
  });

  audioUploadImgInput.addEventListener("change", function () {
    const image = this.files[0];

    if (!image) return;

    audioUploadImgWarning.classList.add("hidden");

    const imageUrl = URL.createObjectURL(image);
    audioUploadImgEl.src = imageUrl;

    audioUploadImgEl.onload = function () {
      URL.revokeObjectURL(imageUrl);
    };
  });

  audioUploadImgRemove.addEventListener("click", function () {
    audioUploadImgWarning.classList.add("hidden");
    audioUploadImgEl.src = "/default-profile-img.webp";
    audioUploadImgInput.value = "";
  });

  audioUploadLyricsBox.addEventListener("click", function () {
    audioUploadLyricsLabel.click();
  });

  audioUploadLyricsInput.addEventListener("change", function () {
    const lrc = this.files[0];

    if (!lrc) return;

    audioUploadLyricsWarning.classList.add("hidden");

    audioUploadLyricsText.textContent = lrc.name;
  });

  audioUploadLyricsRemove.addEventListener("click", function () {
    audioUploadLyricsWarning.classList.add("hidden");
    audioUploadLyricsInput.value = "";
    audioUploadLyricsText.textContent = "Add Lyrics File";
  });

  audioUploadMainBtn.addEventListener("click", async function () {
    const audio = audioUploadInput.files[0];
    const coverImage = audioUploadImgInput.files[0];
    const lrc = audioUploadLyricsInput.files[0];
    const title = audioUploadTitleInput.value;
    const artist = audioUploadArtistInput.value;
    const access = audioUploadAccessInput.value;

    if (audio && fileSizeConverter(audio.size, "mb") > 15) {
      audioUploadWarning.textContent = "Max allowed size 15MB!";
      audioUploadWarning.classList.remove("hidden");
      return;
    }

    if (lrc && fileSizeConverter(lrc.size, "mb") > 2) {
      audioUploadLyricsWarning.textContent = "Too large file!";
      audioUploadLyricsWarning.classList.remove("hidden");
      return;
    }

    if (coverImage && fileSizeConverter(coverImage.size, "mb") > 5) {
      audioUploadImgWarning.textContent = "Max allowed size 5MB!";
      audioUploadImgWarning.classList.remove("hidden");
      return;
    }

    if (
      !audio ||
      title.trim() === "" ||
      artist.trim() === "" ||
      access.trim() === ""
    ) {
      errorText.textContent =
        "Audio file, title, artist and accessibility fields are required!";
      windowManager(".error-window", "show");
      return;
    }

    if (!["public", "private"].includes(access.toLowerCase())) {
      errorText.textContent =
        "Invalid accessibility input! It can be either public or private.";
      windowManager(".error-window", "show");
      return;
    }

    const formdata = new FormData();

    formdata.append("audio", audio);

    if (coverImage) {
      formdata.append("coverImage", coverImage);
    }

    if (lrc) {
      formdata.append("lyrics", lrc);
    }

    formdata.append("title", title);

    formdata.append("artist", artist);

    if (access.toLowerCase() === "public") {
      formdata.append("public", "true");
    } else if (access.toLowerCase() === "private") {
      formdata.append("public", "false");
    }

    loadingText.textContent = "Uploading in progress";

    windowManager(".loading-window", "show");

    const uploaded = await uploadAudio(formdata);

    windowManager(".loading-window", "hide");

    if (!uploaded) return;

    confirmText.textContent = "Your audio was uploaded successfully.";
    windowManager(".confirmation-window", "show");

    audioUploadInput.value = "";
    audioUploadText.textContent = "Add Audio File";
    audioUploadImgEl.src = "/default-profile-img.webp";
    audioUploadImgInput.value = "";
    audioUploadLyricsInput.value = "";
    audioUploadLyricsText.textContent = "Add Lyrics File";
    audioUploadTitleInput.value = "";
    audioUploadArtistInput.value = "";
    audioUploadAccessInput.value = "";
  });

  // *************************************************************
  // FOR SAVED PLAYLISTS LIST
  // *************************************************************

  savedPlaylistSearchInput.addEventListener("input", function () {
    const allSavedPlaylists = document.querySelectorAll(
      ".saved-playlists__card"
    );

    setTimeout(() => {
      const searchInput = savedPlaylistSearchInput.value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      allSavedPlaylists.forEach((card) => {
        if (
          singleMatchCheck(
            searchInput.split(" "),
            card.getAttribute("data-saved-title").toLowerCase().split(" ")
          )
        ) {
          card.classList.remove("hide");
        } else {
          card.classList.add("hide");
        }
      });
    }, 300);
  });

  savedPlaylistContainer.addEventListener("click", function (e) {
    if (
      !e.target.closest(".saved-playlists__btn") &&
      e.target.closest(".saved-playlists__card")
    ) {
      const id = e.target
        .closest(".saved-playlists__card")
        .getAttribute("data-saved-id");

      const targetCard = document
        .querySelector(".cardContainer")
        .querySelector(`[data-playlistid="${id}"]`);

      if (targetCard) {
        targetCard.click();
        windowManager(".saved-playlists", "hide");
      }
    }

    if (e.target.closest(".saved-playlists__btn")) {
      const id = e.target
        .closest(".saved-playlists__card")
        .getAttribute("data-saved-id");

      const targetCard = document
        .querySelector(".cardContainer")
        .querySelector(`[data-playlistid="${id}"]`);

      if (!targetCard) return;

      const saveBtn = targetCard.querySelector(".floating-save-btn");

      saveBtn.click();
    }
  });

  // *************************************************************
  // FOR PLAYLIST CREATION
  // *************************************************************

  playlistUploadImgbox.addEventListener("click", function () {
    playlistUploadLabel.click();
  });

  playlistUploadInput.addEventListener("change", function () {
    const image = this.files[0];

    if (!image) return;

    playlistUploadImgWarning.classList.add("hidden");

    const imageUrl = URL.createObjectURL(image);
    playlistUploadImg.src = imageUrl;

    playlistUploadImg.onload = function () {
      URL.revokeObjectURL(imageUrl);
    };
  });

  playlistUploadImgRemove.addEventListener("click", function () {
    playlistUploadImgWarning.classList.add("hidden");
    playlistUploadImg.src = "/default-profile-img.webp";
    playlistUploadInput.value = "";
  });

  createPlaylistTagContainer.addEventListener("click", function (e) {
    if (!e.target.closest(".create-playlist__tag")) return;

    const tagName = e.target.getAttribute("data-tag-name");

    if (!tags.includes(tagName)) {
      tags.push(tagName);
      e.target.classList.add("tag--active");
    } else {
      tags.splice(tags.indexOf(tagName), 1);
      e.target.classList.remove("tag--active");
    }
  });

  createPlaylistBtn.addEventListener("click", async function () {
    const title = playlistUploadTitleInput.value;
    const description = playlistUploadDescInput.value;
    const access = playlistUploadAccessInput.value;
    const coverImage = playlistUploadInput.files[0];

    let genre = "null";

    if (tags.length > 0) {
      genre = tags.join(" ");
    }

    if (coverImage && fileSizeConverter(coverImage.size, "mb") > 5) {
      playlistUploadImgWarning.textContent = "Max allowed size 5MB!";
      playlistUploadImgWarning.classList.remove("hidden");
      return;
    }

    if (title.trim() === "" || access.trim() === "") {
      errorText.textContent =
        "Playlist title, and accessibility fields are required!";
      windowManager(".error-window", "show");
      return;
    }

    if (!["public", "private"].includes(access.toLowerCase())) {
      errorText.textContent =
        "Invalid accessibility input! It can be either public or private.";
      windowManager(".error-window", "show");
      return;
    }

    const formdata = new FormData();

    if (access.toLowerCase() === "public") {
      formdata.append("public", "true");
    } else if (access.toLowerCase() === "private") {
      formdata.append("public", "false");
    }

    formdata.append("title", title);

    formdata.append("genre", genre);

    if (description.trim() !== "") {
      formdata.append("description", description);
    }

    if (coverImage) {
      formdata.append("coverImage", coverImage);
    }

    loadingText.textContent = "Creating playlist";

    windowManager(".loading-window", "show");

    const created = await createPlaylist(formdata);

    windowManager(".loading-window", "hide");

    if (!created) return;

    confirmText.textContent = "Your playlist was created successfully.";
    windowManager(".confirmation-window", "show");

    playlistUploadImgWarning.classList.add("hidden");
    playlistUploadImg.src = "/default-profile-img.webp";
    playlistUploadInput.value = "";
    playlistUploadTitleInput.value = "";
    playlistUploadDescInput.value = "";
    playlistUploadAccessInput.value = "";
    tags.length = 0;

    document.querySelectorAll(".create-playlist__tag").forEach((tag) => {
      tag.classList.remove("tag--active");
    });
  });

  // *************************************************************
  // FOR CREATED PLAYLISTS
  // *************************************************************

  searchSongsInput.addEventListener("input", function () {
    const allSongs = document.querySelectorAll(".add-song__card");

    setTimeout(() => {
      const searchInput = searchSongsInput.value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      allSongs.forEach((card) => {
        if (
          singleMatchCheck(
            searchInput.split(" "),
            card.getAttribute("data-title").toLowerCase().split(" ")
          )
        ) {
          card.classList.remove("hide");
        } else {
          card.classList.add("hide");
        }
      });
    }, 300);
  });

  document
    .querySelector(".created-playlists__exit")
    .addEventListener("click", function () {
      this.classList.add("hidden");

      document.getElementById("search-songs-playlist").classList.add("hide");

      document.querySelector(".created-playlists__songs").innerHTML = "";

      document
        .querySelector(".created-playlists__container")
        .classList.remove("hide");

      document.querySelector(".created-playlists__songs").classList.add("hide");

      document.querySelector(".edit-playlist").classList.add("hide");
    });

  playlistEditImgbox.addEventListener("click", function () {
    playlistEditImgLabel.click();
  });

  playlistEditImgInput.addEventListener("change", function () {
    const image = this.files[0];

    if (!image) return;

    playlistEditImgWarn.classList.add("hidden");

    const imageUrl = URL.createObjectURL(image);
    playlistEditImgEl.src = imageUrl;

    playlistEditImgEl.onload = function () {
      URL.revokeObjectURL(imageUrl);
    };
  });

  playlistEditRemoveImg.addEventListener("click", function () {
    playlistEditImgWarn.classList.add("hidden");
    playlistEditImgEl.src = "/default-profile-img.webp";
    playlistEditImgInput.value = "";
  });

  playlistEditTagContainer.addEventListener("click", function (e) {
    if (!e.target.closest(".edit-playlist__tag")) return;

    const tagName = e.target.getAttribute("data-tag-name");

    if (!editTags.includes(tagName)) {
      editTags.push(tagName);
      e.target.classList.add("tag--active");
    } else {
      editTags.splice(editTags.indexOf(tagName), 1);
      e.target.classList.remove("tag--active");
    }
  });

  playlistEditBtn.addEventListener("click", async function () {
    const id = document
      .querySelector(".edit-playlist")
      .getAttribute("data-playlist-id");
    const title = playlistEditTitleInput.value;
    const description = playlistEditDescInput.value;
    const access = playlistEditAccessInput.value;
    const coverImage = playlistEditImgInput.files[0];

    let genre = "";

    if (editTags.length > 0) {
      genre = editTags.join(" ");
    }

    if (coverImage && fileSizeConverter(coverImage.size, "mb") > 5) {
      playlistEditImgWarn.textContent = "Max allowed size 5MB!";
      playlistEditImgWarn.classList.remove("hidden");
      return;
    }

    if (access.trim() !== "") {
      if (!["public", "private"].includes(access.toLowerCase())) {
        errorText.textContent =
          "Invalid accessibility input! It can be either public or private.";
        windowManager(".error-window", "show");
        return;
      }
    }

    const formdata = new FormData();

    formdata.append("id", id);

    if (access.trim() !== "") {
      if (access.toLowerCase() === "public") {
        formdata.append("access", "true");
      } else if (access.toLowerCase() === "private") {
        formdata.append("access", "false");
      }
    }

    if (title.trim() !== "") {
      formdata.append("title", title);
    }

    if (genre.trim() !== "") {
      formdata.append("genre", genre);
    }

    if (description.trim() !== "") {
      formdata.append("description", description);
    }

    if (coverImage) {
      formdata.append("coverImage", coverImage);
    }

    loadingText.textContent = "Saving changes";

    windowManager(".loading-window", "show");

    const changed = await editPlaylist(formdata);

    windowManager(".loading-window", "hide");

    if (!changed) return;

    confirmText.textContent = "Changes are saved successfully.";
    windowManager(".confirmation-window", "show");
  });
};
