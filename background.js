let tabMediaStatus = {};
let lastGlobalPlaying = null; // Guarda el último estado global

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === 'MEDIA_STATUS') {
    tabMediaStatus[sender.tab.id] = msg.playing;
    console.log('background.js: Estado de pestañas:', tabMediaStatus);

    const spotifyTabs = await chrome.tabs.query({ url: '*://open.spotify.com/*' });

    // ¿Hay alguna pestaña reproduciendo?
    const anyPlaying = Object.values(tabMediaStatus).some(status => status);

    // Solo ejecuta acción si el estado global cambió
    if (anyPlaying !== lastGlobalPlaying) {
      lastGlobalPlaying = anyPlaying;

      for (const tab of spotifyTabs) {
        // Inyecta el script solo si no está presente
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => !!window.spotifyAutoPause
        });

        if (!result.result) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['spotifyController.js']
          });
          console.log('background.js: spotifyController.js inyectado en tab', tab.id);
        }

        if (anyPlaying) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              console.log('Intentando pausar desde background');
              if (window.spotifyAutoPause) window.spotifyAutoPause.pauseIfNeeded();
            }
          });
        } else {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              console.log('Intentando reanudar desde background');
              if (window.spotifyAutoPause) window.spotifyAutoPause.resumeIfNeeded();
            }
          });
        }
      }
    }
  }
});

// Limpia el estado cuando se cierra una pestaña
chrome.tabs.onRemoved.addListener(tabId => {
  delete tabMediaStatus[tabId];
});
