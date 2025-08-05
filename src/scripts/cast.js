import { audioProfile } from "./settings.js";

export const initChromecast = function () {
  const waitForCastFramework = function (fn) {
    if (window.cast && cast.framework) {
      fn();
    } else {
      setTimeout(() => {
        waitForCastFramework(fn);
      }, 100);
    }
  };

  const initCastApi = function () {
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });
  };

  window["__onGCastApiAvailable"] = function (isAvailable) {
    if (isAvailable) {
      waitForCastFramework(initCastApi);
    } else {
      console.log("Cast is not available");
    }
  };
};

export const loadForCasting = async function (song) {
  const targetOverlay = document.querySelector(".overlay-gain");

  const targetIcon = document.querySelector(".playbar-cast-icon");

  const context = cast.framework.CastContext.getInstance();

  let session = await context.getCurrentSession();

  if (session) {
    const mediaInfo = new chrome.cast.media.MediaInfo(song.url, "audio/webm");

    const metadata = new chrome.cast.media.MusicTrackMediaMetadata();

    metadata.title = song.title;

    metadata.artist = song.artist;

    metadata.albumName = song.playlistName;

    metadata.images = [{ url: song.coverImg }];

    mediaInfo.metadata = metadata;

    const req = new chrome.cast.media.LoadRequest(mediaInfo);

    req.autoplay = true;

    session.loadMedia(req).then(
      () => console.log("Media loaded succesfully!"),
      (err) => console.error("Loading media failed! ", err)
    );

    audioProfile.castVolume = 0;
    targetOverlay.classList.remove("hidden");

    const deviceName = session.getCastDevice().friendlyName;

    const targetEl = document.querySelector(".input");

    targetEl.placeholder = `Casting to ${deviceName}`;

    setTimeout(() => {
      targetEl.placeholder = "Search music";
    }, 8000);

    targetIcon.classList.remove("hidden");
  } else {
    audioProfile.castVolume = null;

    targetOverlay.classList.add("hidden");
    
    targetIcon.classList.add("hidden");
  }
};
