import { url } from "./config.js";
import { addHistoryCard } from "./historyManager.js";
import { mediaLoader } from "./mediaOperation.js";
import {
  chatTextMaker,
  cleanupLoginWindow,
  cleanupSignupWindow,
  createdPlaylistCardMaker,
  presetCardMaker,
  uploadedSongCardMaker,
} from "./utilities.js";

export const data = {
  userData: null,
  songData: null,
  playlistData: null,
  presetData: null,
  forgotPasswordEmail: null,
};

const siaBtn = document.querySelector(".sia-btn");
const overlay = document.querySelector(".overlay");
const loadingText = document.querySelector(".loading-window__text");
const errorText = document.querySelector(".error-window__text");
const confirmText = document.querySelector(".confirmation-window__text");
const userMenu = document.querySelector(".user-menu");
const profileBtnImg = document.querySelector(".user-profile-btn__img");
const mainProfileBtn = document.querySelector(".user-profile-btn");
const loginBoxBtn = document.querySelector(".btn-loginbox");
const mainProfileImage = document.querySelector(".user-menu__img");
const userFullnameDisplay = document.querySelector(".user-menu__fullname");
const userUsernameDisplay = document.querySelector(".user-menu__username");
const userEmailDisplay = document.querySelector(".user-menu__email-text");
const emailVerificationField = document.querySelector(".email-verify");
const uploadedSongsContainer = document.querySelector(
  ".uploaded-songlist__list"
);

const updateExistingDom = function (state) {
  const likedSongCards = document
    .querySelector(".songlist")
    .querySelectorAll(".liked");
  const songRefCards = document.querySelectorAll(".song-reference-card");
  const savedPlaylistCards = document
    .querySelector(".cardContainer")
    .querySelectorAll(".saved");

  const allSongCards = document.querySelectorAll(".song-card");
  const allPlaylistCards = document.querySelectorAll(".card");

  if (state === "logout") {
    if (likedSongCards.length > 0) {
      likedSongCards.forEach((card) => {
        card.classList.remove("liked");
        card.querySelector(
          ".like-container"
        ).innerHTML = `<span class="mingcute--thumb-up-2-line"></span>`;
      });
    }

    if (songRefCards.length > 0) {
      songRefCards.forEach((card) => {
        if (
          card.querySelector(".ref-like-container").innerHTML.includes("fill")
        ) {
          card.querySelector(
            ".ref-like-container"
          ).innerHTML = `<span class="mingcute--thumb-up-2-line"></span>`;
        }
      });
    }

    if (savedPlaylistCards.length > 0) {
      savedPlaylistCards.forEach((card) => {
        card.classList.remove("saved");
        card.querySelector(
          ".floating-save-btn"
        ).innerHTML = `<ion-icon class="floating-icons" name="bookmark-outline"></ion-icon>Save playlist`;
      });
    }
  }

  if (state === "login") {
    if (allSongCards.length > 0) {
      allSongCards.forEach((card) => {
        if (data.userData.likedSongs.includes(card.dataset.id)) {
          card.classList.add("liked");
          card.querySelector(
            ".like-container"
          ).innerHTML = `<span class="mingcute--thumb-up-2-fill"></span>`;
        }
      });
    }

    if (songRefCards.length > 0) {
      songRefCards.forEach((card) => {
        if (data.userData.likedSongs.includes(card.dataset.refid)) {
          card.querySelector(
            ".ref-like-container"
          ).innerHTML = `<span class="mingcute--thumb-up-2-fill"></span>`;
        }
      });
    }

    if (allPlaylistCards.length > 0) {
      allPlaylistCards.forEach((card) => {
        if (data.userData.savedPlaylists.includes(card.dataset.playlistid)) {
          card.classList.add("saved");
          card.querySelector(
            ".floating-save-btn"
          ).innerHTML = `<ion-icon class="floating-icons" name="bookmark"></ion-icon>Saved`;
        }
      });
    }
  }
};

const renderUserInfo = function (userdata) {
  data.userData = userdata;

  loginBoxBtn.classList.add("hide");

  if (userdata.profileImage) {
    profileBtnImg.src = userdata.profileImage;
    mainProfileImage.src = userdata.profileImage;
  } else {
    profileBtnImg.src = "/default-profile-img.webp";
    mainProfileImage.src = "/default-profile-img.webp";
  }

  document.querySelector(".ai-chat__chats").innerHTML = "";
  mainProfileBtn.classList.remove("hide");
  siaBtn.classList.remove("hide");
  userFullnameDisplay.textContent = userdata.fullname;
  userUsernameDisplay.textContent = userdata.username;

  if (!userdata.isEmailVerified) {
    userEmailDisplay.textContent = userdata.email;
    emailVerificationField.classList.remove("hide");
  } else {
    emailVerificationField.classList.add("hide");
  }

  updateExistingDom("login");
};

export const renderUserMedia = function () {
  document.querySelector(".history-list").innerHTML = "";

  data.userData.watchHistory
    .slice()
    .reverse()
    .forEach((histObj) => {
      const songUrl = histObj.audio.audio;
      const songId = histObj.audio._id;
      const songName = histObj.audio.title;
      const artist = histObj.audio.artist;
      const coverImg = histObj.audio.coverImage || "/default-profile-img.webp";
      const context = histObj.context;
      const playlistId = histObj.playedFromPlaylist;
      const playedAt = histObj.playedAt;

      addHistoryCard(
        songUrl,
        songId,
        songName,
        artist,
        coverImg,
        context,
        playlistId,
        playedAt
      );
    });

  if (data.songData && data.playlistData) mediaLoader();
};

const deRenderUserInfo = function (displayLogin = false) {
  data.userData = null;

  if (displayLogin) {
    windowManager(".login-box", "show");
  }

  document.querySelector(".ai-chat__chats").innerHTML = "";
  loginBoxBtn.classList.remove("hide");
  profileBtnImg.src = "/default-profile-img.webp";
  mainProfileImage.src = "/default-profile-img.webp";
  userMenu.classList.add("hidden");
  mainProfileBtn.classList.add("hide");
  siaBtn.classList.add("hide");
  userFullnameDisplay.textContent = "";
  userUsernameDisplay.textContent = "";
  userEmailDisplay.textContent = "";
  emailVerificationField.classList.remove("hide");

  document.querySelector(".history-list").innerHTML = "";

  uploadedSongsContainer.innerHTML = "";

  updateExistingDom("logout");
};

export const windowManager = function (className, action) {
  if (action === "hide") {
    overlay.classList.add("hidden");
    document.querySelector(className).classList.add("hidden");
  } else if (action === "show") {
    overlay.classList.remove("hidden");
    document.querySelector(className).classList.remove("hidden");
  }
};

export const getAllSongs = async function () {
  const res = await fetch(url + "/api/v1/audios/all-audios", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const audios = await res.json();

  data.songData = audios.data.audios;
};

export const getAllPlaylists = async function () {
  const res = await fetch(url + "/api/v1/playlists/all", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const playlists = await res.json();

  data.playlistData = playlists.data.playlists;
};

export const getAllPresets = async function () {
  const res = await fetch(url + "/api/v1/eq/all", {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const presets = await res.json();

  data.presetData = presets.data.presets;
};

export const sendSignupInfo = async function (form) {
  loadingText.textContent = "Signing Up";
  windowManager(".loading-window", "show");

  const res = await fetch(url + "/api/v1/users/signup", {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  windowManager(".loading-window", "hide");

  if (data.status === "fail" || data.status === "error") {
    errorText.textContent = data.message;
    windowManager(".error-window", "show");
  } else {
    windowManager(".signup-box", "hide");
    confirmText.textContent = "Sign up completed. You can login now.";
    windowManager(".confirmation-window", "show");

    cleanupSignupWindow();
  }
};

export const sendLoginInfo = async function (loginInfo) {
  loadingText.textContent = "Logging In";
  windowManager(".loading-window", "show");

  const res = await fetch(url + "/api/v1/users/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginInfo),
  });

  const loginData = await res.json();

  windowManager(".loading-window", "hide");

  if (loginData.status === "fail" || loginData.status === "error") {
    errorText.textContent = loginData.message;
    windowManager(".error-window", "show");
  } else {
    windowManager(".login-box", "hide");
    const userData = loginData.data.user;

    cleanupLoginWindow();

    renderUserInfo(userData);

    renderUserMedia();
  }
};

export const logoutUser = async function () {
  const logout = async function () {
    const res = await fetch(url + "/api/v1/users/logout", {
      method: "POST",
      credentials: "include",
    });

    return res;
  };

  let res = await logout();
  let resData = await res.json();

  if (res.status === 200) {
    deRenderUserInfo();
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await logout();
    resData = await res.json();

    if (res.status === 200) {
      deRenderUserInfo();
    } else if (res.status > 299) {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
    }
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
  }
};

export const refreshAccess = async function () {
  const res = await fetch(url + "/api/v1/users/refresh-access", {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  if (res.status > 299) {
    errorText.textContent = data.message;

    windowManager(".error-window", "show");

    await logoutUser();

    return false;
  }

  return true;
};

export const getUserData = async function () {
  const fetchUser = async function () {
    const res = await fetch(url + "/api/v1/users/me", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    return res;
  };

  let res = await fetchUser();

  let loginData = await res.json();

  if (res.status < 300) {
    const userData = loginData.data.user;

    renderUserInfo(userData);
  } else if (res.status === 405) {
    // refreshAccess and try again
    const refreshed = await refreshAccess();

    if (refreshed) {
      res = await fetchUser();

      loginData = await res.json();

      if (res.status < 300) {
        const userData = loginData.data.user;

        renderUserInfo(userData);
      }
    }
  }
};

export const recordHistory = async function (historyInfo) {
  const record = async function () {
    const res = await fetch(url + "/api/v1/audios/record-history", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(historyInfo),
    });

    return res;
  };

  let res = await record();
  let resData = await res.json();

  if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await record();

    if (res.status > 299) {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
    }
  } else if (res.status !== 401 && res.status > 299) {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
  }
};

export const registerLike = async function (audioId) {
  const register = async function () {
    const res = await fetch(url + `/api/v1/audios/like/${audioId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await register();
  let resData = await res.json();

  if (res.status === 200) {
    return resData.data.liked;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await register();
    resData = await res.json();

    if (res.status === 200) {
      return resData.data.liked;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return "rejected";
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
  }
};

export const requestOTP = async function (type, email = null) {
  const generateOTP = async function () {
    let route;

    if (type === "password") {
      route = "forgot-password";
    } else if (type === "email") {
      route = "request-email-otp";
    }

    const res = await fetch(url + `/api/v1/users/${route}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    return res;
  };

  let res = await generateOTP();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await generateOTP();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else if (res.status > 299) {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const verifyOTP = async function (type, otp, email = null) {
  const verify = async function () {
    let route;

    if (type === "password") {
      route = "verify-password-otp";
    } else if (type === "email") {
      route = "verify-email";
    }

    const res = await fetch(url + `/api/v1/users/${route}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, otp: otp }),
    });

    return res;
  };

  let res = await verify();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await verify();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else if (res.status > 299) {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const resetPassword = async function (email, password) {
  const reset = async function () {
    const res = await fetch(url + `/api/v1/users/password-reset`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, newPassword: password }),
    });

    return res;
  };

  let res = await reset();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const savePlaylist = async function (playlistId) {
  const save = async function () {
    const res = await fetch(url + `/api/v1/playlists/save/${playlistId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await save();
  let resData = await res.json();

  if (res.status === 200) {
    return resData.data.saved;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await save();
    resData = await res.json();

    if (res.status === 200) {
      return resData.data.saved;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return "rejected";
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
  }
};

export const changeProfileImage = async function (form) {
  const change = async function () {
    const res = await fetch(url + "/api/v1/users/change-profile-photo", {
      method: "PATCH",
      credentials: "include",
      body: form,
    });

    return res;
  };

  let res = await change();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await change();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else if (res.status === 403) {
    errorText.textContent = `Your email address ${data.userData.email} is not verified!`;
    windowManager(".error-window", "show");
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const removeProfileImage = async function () {
  const remove = async function () {
    const res = await fetch(url + "/api/v1/users/remove-profile-photo", {
      method: "DELETE",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    return res;
  };

  let res = await remove();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await remove();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else if (res.status === 403) {
    errorText.textContent = `Your email address ${data.userData.email} is not verified!`;
    windowManager(".error-window", "show");
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const changeName = async function (newName) {
  const change = async function () {
    const res = await fetch(url + "/api/v1/users/change-name", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({ newFullname: newName }),
    });

    return res;
  };

  let res = await change();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await change();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const changePassword = async function (oldPassword, newPassword) {
  const change = async function () {
    const res = await fetch(url + "/api/v1/users/change-password", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
    });

    return res;
  };

  let res = await change();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await change();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else if (res.status === 403) {
    errorText.textContent = `Your email address ${data.userData.email} is not verified!`;
    windowManager(".error-window", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const editAudio = async function (form) {
  const edit = async function () {
    const res = await fetch(url + "/api/v1/audios/edit", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: form,
    });

    return res;
  };

  let res = await edit();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await edit();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const deleteAudioCoverImage = async function (id) {
  const del = async function () {
    const res = await fetch(url + `/api/v1/audios/remove-cover/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await del();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await del();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const deleteLyrics = async function (id) {
  const del = async function () {
    const res = await fetch(url + `/api/v1/audios/remove-lyrics/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await del();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await del();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const deleteAudio = async function (id) {
  const del = async function () {
    const res = await fetch(url + `/api/v1/audios/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await del();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await del();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const uploadAudio = async function (form) {
  const upload = async function () {
    const res = await fetch(url + "/api/v1/audios/upload-music", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: form,
    });

    return res;
  };

  let res = await upload();
  let resData = await res.json();

  if (res.status === 200) {
    const createdAudio = resData.data.audio;
    data.songData.push(createdAudio);
    uploadedSongCardMaker(createdAudio);
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await upload();
    resData = await res.json();

    if (res.status === 200) {
      const createdAudio = resData.data.audio;
      data.songData.push(createdAudio);
      uploadedSongCardMaker(createdAudio);
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else if (res.status === 403) {
    errorText.textContent = `Your email address ${data.userData.email} is not verified!`;
    windowManager(".error-window", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const chatWithSia = async function (message) {
  const chat = async function () {
    const res = await fetch(url + "/api/v1/chatbot/chat", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({ message: message }),
    });

    return res;
  };

  let res = await chat();
  let resData = await res.json();

  if (res.status === 200) {
    chatTextMaker("sia", resData.data.reply);
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await chat();
    resData = await res.json();

    if (res.status === 200) {
      chatTextMaker("sia", resData.data.reply);
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const importPreset = async function (id) {
  const importThis = async function () {
    const res = await fetch(url + `/api/v1/eq/import/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await importThis();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await importThis();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const removeImportedPreset = async function (id) {
  const remove = async function () {
    const res = await fetch(url + `/api/v1/eq/remove/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await remove();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await remove();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const createPreset = async function (obj) {
  const create = async function () {
    const res = await fetch(url + `/api/v1/eq/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    return res;
  };

  let res = await create();
  let resData = await res.json();

  if (res.status === 200) {
    const presetObj = resData.data.preset;
    presetCardMaker(presetObj, "shared-presets__container");
    presetCardMaker(presetObj, "published-presets__container", true);
    data.presetData.push(presetObj);
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await create();
    resData = await res.json();

    if (res.status === 200) {
      const presetObj = resData.data.preset;
      presetCardMaker(presetObj, "shared-presets__container");
      presetCardMaker(presetObj, "published-presets__container", true);
      data.presetData.push(presetObj);
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else if (res.status === 403) {
    errorText.textContent = `Your email address ${data.userData.email} is not verified!`;
    windowManager(".error-window", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const deletePreset = async function (id) {
  const del = async function () {
    const res = await fetch(url + `/api/v1/eq/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await del();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await del();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const createPlaylist = async function (form) {
  const create = async function () {
    const res = await fetch(url + "/api/v1/playlists/create", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: form,
    });

    return res;
  };

  let res = await create();
  let resData = await res.json();

  if (res.status === 200) {
    data.playlistData.push(resData.data.playlist);
    createdPlaylistCardMaker(resData.data.playlist);
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await create();
    resData = await res.json();

    if (res.status === 200) {
      data.playlistData.push(resData.data.playlist);
      createdPlaylistCardMaker(resData.data.playlist);
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else if (res.status === 403) {
    errorText.textContent = `Your email address ${data.userData.email} is not verified!`;
    windowManager(".error-window", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const editPlaylist = async function (form) {
  const edit = async function () {
    const res = await fetch(url + "/api/v1/playlists/edit", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      body: form,
    });

    return res;
  };

  let res = await edit();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await edit();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const addSong = async function (playlistId, songId) {
  const add = async function () {
    const res = await fetch(url + "/api/v1/playlists/add-audio", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({ audioId: songId, playlistId: playlistId }),
    });

    return res;
  };

  let res = await add();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await add();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const removeSong = async function (playlistId, songId) {
  const remove = async function () {
    const res = await fetch(url + "/api/v1/playlists/remove-audio", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({ audioId: songId, playlistId: playlistId }),
    });

    return res;
  };

  let res = await remove();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await remove();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const deletePlaylistCoverImage = async function (id) {
  const del = async function () {
    const res = await fetch(url + `/api/v1/playlists/remove-cover/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await del();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await del();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const deletePlaylist = async function (id) {
  const del = async function () {
    const res = await fetch(url + `/api/v1/playlists/delete/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await del();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await del();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
};

export const reportAudio = async function(id) {
  const report = async function () {
    const res = await fetch(url + `/api/v1/audios/report/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    return res;
  };

  let res = await report();
  let resData = await res.json();

  if (res.status === 200) {
    return true;
  } else if (res.status === 405) {
    const refreshed = await refreshAccess();

    if (!refreshed) return;

    res = await report();
    resData = await res.json();

    if (res.status === 200) {
      return true;
    } else {
      errorText.textContent = resData.message;
      windowManager(".error-window", "show");
      return false;
    }
  } else if (res.status === 401) {
    windowManager(".login-box", "show");
    return false;
  } else {
    errorText.textContent = resData.message;
    windowManager(".error-window", "show");
    return false;
  }
}