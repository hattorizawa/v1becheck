(function () {
  window.REEV = window.REEV || {};
  window.REEV.features = window.REEV.features || {};

  window.REEV.features.volume = function initVolume() {
    var STORAGE_KEY = "reev_volume";

    var bottombar = document.querySelector(".bottombar");
    var button = document.querySelector(".bottombar__volume");
    var ui = document.querySelector("[data-bottom-volume-ui]");
    var slider = document.querySelector("[data-bottom-volume-slider]");
    var readout = document.querySelector("[data-bottom-volume-readout]");
    var valueEl = document.querySelector("[data-bottom-volume-value]");

    var open = false;
    var dragging = false;
    var autoCloseTimer = null;
    var volume = 100;

    function clampInt(v, min, max) {
      var n = Math.round(Number(v));
      if (!Number.isFinite(n)) n = min;
      return Math.min(max, Math.max(min, n));
    }

    function volumeToRatio(v) {
      return clampInt(v, 0, 100) / 100;
    }

    function setMutedState(isMuted) {
      if (button) button.classList.toggle("is-muted", !!isMuted);
    }

    function render() {
      if (!bottombar || !slider) return;
      var ratio = volumeToRatio(volume);
      var tone = Math.round(178 + ratio * 77);
      bottombar.style.setProperty("--volume", String(ratio));
      bottombar.style.setProperty("--volume-tone", String(tone));
      slider.setAttribute("aria-valuenow", String(volume));
      if (valueEl) valueEl.textContent = String(volume);
      setMutedState(volume <= 0);
    }

    function persist() {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(volume));
      } catch (e) {
        // ignore
      }
    }

    function load() {
      try {
        var stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored != null) volume = clampInt(parseInt(stored, 10), 0, 100);
      } catch (e) {
        // ignore
      }
    }

    function clearAutoClose() {
      if (!autoCloseTimer) return;
      window.clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    function armAutoClose() {
      clearAutoClose();
      autoCloseTimer = window.setTimeout(function () {
        setOpen(false);
      }, 10000);
    }

    function setOpen(next) {
      open = !!next;
      if (!bottombar || !button || !ui) return;

      if (open) {
        bottombar.setAttribute("data-mode", "volume");
        button.setAttribute("aria-pressed", "true");
        ui.hidden = false;
        if (readout) readout.hidden = false;
        armAutoClose();
        slider && slider.focus && slider.focus();
      } else {
        bottombar.removeAttribute("data-mode");
        button.setAttribute("aria-pressed", "false");
        ui.hidden = true;
        if (readout) readout.hidden = true;
        clearAutoClose();
      }
    }

    function setVolume(next, fromUser) {
      volume = clampInt(next, 0, 100);
      render();
      persist();
      if (open && fromUser) armAutoClose();
    }

    function setFromPointer(evt) {
      if (!slider) return;
      var rect = slider.getBoundingClientRect();
      var x = evt.clientX - rect.left;
      var ratio = rect.width ? x / rect.width : 0;
      ratio = Math.min(1, Math.max(0, ratio));
      setVolume(Math.round(ratio * 100), true);
    }

    function onButtonClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      setOpen(!open);
    }

    function onSliderPointerDown(evt) {
      if (!open) return;
      evt.preventDefault();
      dragging = true;
      setFromPointer(evt);
      slider.setPointerCapture && slider.setPointerCapture(evt.pointerId);
    }

    function onDocPointerMove(evt) {
      if (!dragging) return;
      setFromPointer(evt);
    }

    function onDocPointerUp(evt) {
      if (!dragging) return;
      dragging = false;
      slider && slider.releasePointerCapture && slider.releasePointerCapture(evt.pointerId);
    }

    function onSliderKeyDown(evt) {
      if (!open) return;
      var step = evt.shiftKey ? 5 : 1;
      if (evt.key === "ArrowLeft" || evt.key === "ArrowDown") {
        evt.preventDefault();
        setVolume(volume - step, true);
      }
      if (evt.key === "ArrowRight" || evt.key === "ArrowUp") {
        evt.preventDefault();
        setVolume(volume + step, true);
      }
      if (evt.key === "Home") {
        evt.preventDefault();
        setVolume(0, true);
      }
      if (evt.key === "End") {
        evt.preventDefault();
        setVolume(100, true);
      }
      if (evt.key === "Escape") {
        evt.preventDefault();
        setOpen(false);
      }
    }

    if (!bottombar || !button || !ui || !slider) return;

    load();
    render();
    setOpen(false);

    button.addEventListener("click", onButtonClick);
    slider.addEventListener("pointerdown", onSliderPointerDown);
    slider.addEventListener("keydown", onSliderKeyDown);
    document.addEventListener("pointermove", onDocPointerMove);
    document.addEventListener("pointerup", onDocPointerUp);

    return {
      setOpen: setOpen,
      setVolume: setVolume,
      getVolume: function () {
        return volume;
      },
    };
  };
})();
