export const addHistoryCard = function (
  songUrl,
  songId,
  songName,
  artistName,
  cardImg,
  context,
  triggeredBy,
  playedAt = null
) {
  let now;

  if (playedAt) {
    now = new Date(playedAt);
  } else {
    now = new Date();
  }

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

  const defaultImg = '/default-profile-img.webp';

  if (context === "global") {
    const html = `<div class="history-card bg-yel-grey-3" data-histid="${songId}" data-histurl="${songUrl}" data-histcontext="${context}">
            <div class="history-card-imgbox">
              <img
                src="${cardImg || defaultImg}"
                alt="Song Image"
                class="song-card-img"
              />
            </div>
            <div class="history-card-info">
              <p class="history-card-name">${songName}</p>
              <p class="history-card-artist">${artistName}</p>
            </div>
            <p class="history-time-display">
              <span class="history-time">${time}</span>
              <span class="history-date">${day} ${month} ${year}</span>
            </p>
          </div>`;

    document.querySelectorAll(".history-card").forEach((el) => {
      if (songUrl === el.getAttribute("data-histurl")) {
        if (!el.closest(".history-playlist-card")) {
          el.remove();
        }
      }
    });

    document
      .querySelector(".history-list")
      .insertAdjacentHTML("afterbegin", html);
  } else if (context === "playlist") {
    const playlist = document.querySelector(
      `[data-playlistid="${triggeredBy}"]`
    );

    const playlistName = playlist.dataset.playlistname;
    const playlistImg = playlist.dataset.coverimg;

    const html = `<div class="history-playlist-card" data-superhisturl="${songUrl}" data-supertargetplaylist="${triggeredBy}">
            <div class="history-playlist-info">
              <div class="history-playlist-imgbox">
                <img
                  src="${playlistImg || defaultImg}"
                  alt="Playlist Image"
                  class="history-playlist-img"
                />
              </div>

              <p class="history-playlist-name">
                Played from
                "<span class="history-playlistname-display"
                  >${playlistName}</span
                >"
              </p>
            </div>

            <div class="history-playlist-container">
              <div class="history-card bg-yel-grey-3" data-histid="${songId}" data-histurl="${songUrl}" data-histcontext="${context}" data-targetplaylist="${triggeredBy}">
                <div class="history-card-imgbox">
                  <img
                    src="${cardImg}"
                    alt="Song Image"
                    class="song-card-img"
                  />
                </div>
                <div class="history-card-info">
                  <p class="history-card-name">${songName}</p>
                  <p class="history-card-artist">${artistName}</p>
                </div>
                <p class="history-time-display">
              <span class="history-time">${time}</span>
              <span class="history-date">${day} ${month} ${year}</span>
            </p>
              </div>
            </div>
          </div>`;

    document.querySelectorAll(".history-playlist-card").forEach((el) => {
      if (
        songUrl === el.getAttribute("data-superhisturl") &&
        triggeredBy === el.getAttribute("data-supertargetplaylist")
      ) {
        el.remove();
      }
    });

    document
      .querySelector(".history-list")
      .insertAdjacentHTML("afterbegin", html);
  }
};
