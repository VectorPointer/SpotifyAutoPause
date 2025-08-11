console.log('spotifyController.js inyectado');

(function () {
  if (window.spotifyAutoPause) return;

  function getPlayPauseButton() {
    let foundBtn = document.querySelector('[data-testid="control-button-playpause"]');
    if (foundBtn) return foundBtn;

    for (const frame of document.querySelectorAll('iframe')) {
      try {
        const frameBtn = frame.contentDocument?.querySelector('[data-testid="control-button-playpause"]');
        if (frameBtn) return frameBtn;
      } catch (e) {}
    }

    const findInShadow = (root) => {
      if (!root) return null;
      const btn = root.querySelector?.('[data-testid="control-button-playpause"]');
      if (btn) return btn;
      for (const el of root.querySelectorAll('*')) {
        if (el.shadowRoot) {
          const btnInShadow = findInShadow(el.shadowRoot);
          if (btnInShadow) return btnInShadow;
        }
      }
      console.log('Spotify: botón play/pause no encontrado');
      return null;
    };
    return findInShadow(document.body);
  }

  // Inicializa el botón global al cargar el script
  const btn = getPlayPauseButton();

  function isPlaying() {
    if (!btn) return false;
    const label = btn.getAttribute('aria-label')?.toLowerCase();
    console.log(label);
    if (label?.includes('pause') || label?.includes('pausa')) return true;
    if (label?.includes('play') || label?.includes('reproducir')) return false;
    const svg = btn.querySelector('svg');
    if (svg) {
      if (svg.innerHTML.toLowerCase().includes('pause') || svg.innerHTML.toLowerCase().includes('pausa')) return true;
      if (svg.innerHTML.toLowerCase().includes('play') || svg.innerHTML.toLowerCase().includes('reproducir')) return false;
    }
    return false;
  }

  window.spotifyAutoPause = {
    _pausedByExtension: false,
    isPlaying,
    pauseIfNeeded() {
      if (!btn) return false;
      if (this.isPlaying()) {
        btn.click();
        this._pausedByExtension = true;
        return true;
      }
      console.log(this.isPlaying());
      this._pausedByExtension = false;
      console.log('Spotify: No se pausa porque no estaba reproduciendo');
      return false;
    },
    resumeIfNeeded() {
      if (this._pausedByExtension) {
        if (!btn) return false;
        if (!this.isPlaying()) {
          btn.click();
          this._pausedByExtension = false;
          console.log('Spotify: botón play/pause clickeado (play)');
          return true;
        }
        console.log('Spotify ya estaba en play');
        return false;
      }
      console.log('Spotify: No se reanuda porque no fue pausado por la extensión o el usuario cambió el estado');
      return false;
    }
  };
})();

console.log('spotifyController.js cargado');