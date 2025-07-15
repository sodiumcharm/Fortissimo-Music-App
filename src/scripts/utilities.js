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
  return min + ((percent / 100) * (max - min));
};

export const timeFormatter = function (time) {
  if (isNaN(time)) return "00:00";

  const minute = String(Math.trunc(time / 60)).padStart(2, "0");
  const seconds = String(Math.trunc(time % 60)).padStart(2, "0");

  return `${minute}:${seconds}`;
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
  url,
  container,
  insertedSongIds,
  context
) {
  const html = `<div class="song-card flex align-center rounded bg-yel-grey-3" data-url="${
    url + obj.url
  }" data-name="${obj.title}" data-artist="${obj.artist}" data-img="${
    url + obj.img
  }" data-id="${obj.id}" data-context="${context}" data-eventlistener="">
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

  insertedSongIds.push(obj.id);
};

export const playlistCardMaker = function (
  playlist,
  url,
  container,
  insertedPlaylistIds
) {
  const html = `<div class="card rounded" data-playlistid="${
    playlist.id
  }" data-playlistname="${playlist.title}" data-playlistType='${JSON.stringify(
    playlist.type
  )}' data-creator="${playlist.creator}" data-creatorimg="${
    url + playlist.creatorImg
  }" data-description="${playlist.description}" data-coverimg="${
    url + playlist.coverImg
  }" data-songs='${JSON.stringify(playlist.songs)}' data-eventlistener="">
                  <div class="card-imgbox rounded">
                    <img src="${
                      url + playlist.coverImg
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

  container.insertAdjacentHTML("beforeend", html);
  insertedPlaylistIds.push(playlist.id);
};

export const referenceCardMaker = function (obj, url, container, context) {
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
};
