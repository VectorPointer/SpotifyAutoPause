console.log('content.js cargado');

let intervalId = null;
let contextInvalidated = false;
let lastStatus = null;

function isMediaPlaying() {
  const mediaEls = document.querySelectorAll('video, audio');
  for (const el of mediaEls) {
    if (!el.paused && !el.muted && el.readyState > 2) return true;
  }
  return false;
}

function isSpotifyTab() {
  return window.location.hostname.includes('spotify.com');
}

function sendMediaStatus() {
  if (contextInvalidated) return;
  try {
    const playing = isMediaPlaying();
    // Solo envía si es Spotify y está reproduciendo
    if (isSpotifyTab() && !playing) return;
    if (playing !== lastStatus) {
      console.log('Enviando MEDIA_STATUS:', playing);
      chrome.runtime.sendMessage({ type: 'MEDIA_STATUS', playing });
      lastStatus = playing;
    }
  } catch (err) {
    contextInvalidated = true;
    if (intervalId) clearInterval(intervalId);
    console.warn('Extension context invalidated, interval cleared.');
  }
}

intervalId = setInterval(sendMediaStatus, 500);