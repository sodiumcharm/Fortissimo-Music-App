export const singleMatchCheck = function (arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    const value = arr1[i];

    for (let j = 0; j < arr2.length; j++) {
      if (arr2[j] === value || arr2[j].startsWith(value)) return true;
    }
  }

  return false;
};

export const timeFormatter = function (time) {
  if (isNaN(time)) return "00:00";

  const minute = String(Math.trunc(time / 60)).padStart(2, "0");
  const seconds = String(Math.trunc(time % 60)).padStart(2, "0");

  return `${minute}:${seconds}`;
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
