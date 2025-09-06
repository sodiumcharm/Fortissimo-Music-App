import { audio } from "./audioProcessor.js";

export const lyricsStatus = {currentLyricsHandler: null};

export const initLyrics = function (lyricsUrl) {
  if (lyricsUrl === "null") return;

  const parseLyrics = function (lrc) {
    const lines = lrc.split("\n");

    const result = [];

    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

    for (let line of lines) {
      const match = timeRegex.exec(line);

      if (!match) continue;

      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3] || "0");

      const time = min * 60 + sec + ms / (ms >= 100 ? 1000 : 100);

      const text = line.replace(timeRegex, "").trim();

      result.push({ time, text });
    }

    return result;
  };

  const loadLyrics = async function () {
    const res = await fetch(lyricsUrl);

    const lrc = await res.text();

    return parseLyrics(lrc);
  };

  const renderLyrics = function (lyrics) {
    const lyricsContainer = document.querySelector(".lyrics-container");

    lyricsContainer.innerHTML = "";

    lyrics.forEach((line, i) => {
      const div = document.createElement("div");

      div.className = "lyric-line";

      div.dataset.index = i;

      div.dataset.time = line.time;

      div.textContent = line.text;

      lyricsContainer.appendChild(div);

      div.addEventListener("click", function () {
        const time = this.dataset.time;

        audio.currentTime = time;
      });
    });
  };

  const syncLyrics = function (lyrics, audio) {
    const lyricsContainer = document.querySelector(".lyrics-container");

    let currentIndex = -1;

    const onTimeUpdate = function () {
      const currentTime = audio.currentTime;
      
      for (let i = 0; i < lyrics.length; i++) {
        if (
          currentTime >= lyrics[i].time &&
          (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)
        ) {
          if (i !== currentIndex) {
            const oldActive = lyricsContainer.querySelector(".active");

            if (oldActive) oldActive.classList.remove("active");

            const newActive = lyricsContainer.querySelector(
              `[data-index="${i}"]`
            );

            if (newActive) {
              newActive.classList.add("active");

              newActive.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
            }

            currentIndex = i;
          }

          break;
        }
      }
    };

    if (lyricsStatus.currentLyricsHandler) {
      audio.removeEventListener("timeupdate", lyricsStatus.currentLyricsHandler);
    }

    lyricsStatus.currentLyricsHandler = onTimeUpdate;

    audio.addEventListener("timeupdate", onTimeUpdate);

    audio.addEventListener("ended", function () {
      audio.removeEventListener("timeupdate", onTimeUpdate);
    });
  };

  (async function () {
    const lyrics = await loadLyrics();

    renderLyrics(lyrics);

    syncLyrics(lyrics, audio);
  })();
};
