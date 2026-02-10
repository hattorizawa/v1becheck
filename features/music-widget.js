(function () {
  window.REEV = window.REEV || {};
  window.REEV.features = window.REEV.features || {};

  window.REEV.features.musicWidget = function initMusicWidget() {
    var card = document.querySelector("[data-music-card]");
    if (!card) return null;

    var cover = card.querySelector("[data-music-cover]");
    var title = card.querySelector("[data-music-title]");
    var subtitle = card.querySelector("[data-music-subtitle]");
    var sourceIcon = card.querySelector("[data-music-source-icon]");
    var favoriteButton = card.querySelector("[data-music-favorite]");
    var playToggleButton = card.querySelector("[data-music-play-toggle]");
    var playToggleIcon = card.querySelector("[data-music-play-icon]");
    var progressFill = card.querySelector("[data-music-progress-fill]");
    var currentTimeEl = card.querySelector("[data-music-time-current]");
    var totalTimeEl = card.querySelector("[data-music-time-total]");

    var pauseIcon = "https://www.figma.com/api/mcp/asset/0cf0cae0-a59f-4da1-b449-39b3ffda73f9";
    var playIcon =
      "https://www.figma.com/api/mcp/asset/629b1947-95a1-41e0-b084-f3f0e8cf0859";

    var sources = {
      bluetooth: {
        icon: "https://www.figma.com/api/mcp/asset/c94cd3ba-6935-4a12-a93c-bae4401476b7",
        cover: "https://www.figma.com/api/mcp/asset/35c13e6f-96b3-414a-a7fe-a9f26b19c883",
        title: "Rush",
        subtitle: "Masey Calvert",
      },
      usb: {
        icon: "https://www.figma.com/api/mcp/asset/96d5f611-8cfa-46d3-8470-969dde7f9b35",
        cover: "https://www.figma.com/api/mcp/asset/a30a135d-1abf-4e20-867f-40e0486e4030",
        title: "LANLAO KING",
        subtitle: "Skai isyourgod",
      },
      fm: {
        icon: "https://www.figma.com/api/mcp/asset/d39114f3-205f-4761-8a6a-4eae6638f6a7",
        cover: "https://www.figma.com/api/mcp/asset/d2edf7aa-6d85-4d59-9696-b6857f0ae433",
        title: "Rock Radio",
        subtitle: "95.20 FM",
      },
    };

    var pressTimer = null;
    var trackTimer = null;
    var trackDurationSec = 3 * 60 + 29;
    var currentSec = 0;
    var isPlaying = false;

    function formatTime(totalSec) {
      var safe = Math.max(0, totalSec | 0);
      var minutes = Math.floor(safe / 60);
      var seconds = safe % 60;
      return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    function renderTrack() {
      if (progressFill) {
        var width = (Math.min(currentSec, trackDurationSec) / trackDurationSec) * 100;
        progressFill.style.width = width + "%";
      }
      if (currentTimeEl) currentTimeEl.textContent = formatTime(currentSec);
      if (totalTimeEl) totalTimeEl.textContent = formatTime(trackDurationSec);
    }

    function stopTrackTimer() {
      if (trackTimer) {
        window.clearInterval(trackTimer);
        trackTimer = null;
      }
    }

    function startTrackTimer() {
      stopTrackTimer();
      trackTimer = window.setInterval(function () {
        currentSec += 1;
        if (currentSec >= trackDurationSec) {
          currentSec = trackDurationSec;
          renderTrack();
          syncPlayState(false);
          stopTrackTimer();
          return;
        }
        renderTrack();
      }, 1000);
    }

    function setSelectorOpen(nextOpen) {
      card.setAttribute("data-music-selector-open", nextOpen ? "true" : "false");
    }

    function setActiveOption(sourceKey) {
      var options = card.querySelectorAll("[data-music-set-source]");
      options.forEach(function (opt) {
        var isActive = opt.getAttribute("data-music-set-source") === sourceKey;
        opt.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    function setSource(sourceKey) {
      if (!sources[sourceKey]) return;
      card.setAttribute("data-music-source", sourceKey);
      if (cover) cover.src = sources[sourceKey].cover;
      if (title) title.textContent = sources[sourceKey].title;
      if (subtitle) subtitle.textContent = sources[sourceKey].subtitle;
      if (sourceIcon) sourceIcon.src = sources[sourceKey].icon;
      setActiveOption(sourceKey);
      if (favoriteButton && sourceKey !== "fm") {
        favoriteButton.setAttribute("data-favorite", "false");
        favoriteButton.setAttribute("aria-pressed", "false");
      }
      if (sourceKey !== "bluetooth") {
        stopTrackTimer();
        if (isPlaying) syncPlayState(false);
      } else if (isPlaying) {
        startTrackTimer();
      }
    }

    function getSource() {
      return card.getAttribute("data-music-source") || "bluetooth";
    }

    function syncPlayState(nextPlaying) {
      if (!playToggleButton || !playToggleIcon) return;
      isPlaying = nextPlaying;
      playToggleButton.setAttribute("data-playing", nextPlaying ? "true" : "false");
      playToggleButton.setAttribute("aria-label", nextPlaying ? "Pause" : "Play");
      playToggleButton.setAttribute("aria-pressed", "false");
      playToggleIcon.src = nextPlaying ? pauseIcon : playIcon;
      if (getSource() === "bluetooth") {
        if (nextPlaying) startTrackTimer();
        else stopTrackTimer();
      } else {
        stopTrackTimer();
      }
    }

    function flashPressed(button) {
      if (!button || !button.classList) return;
      button.classList.add("is-pressed");
      if (pressTimer) window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(function () {
        button.classList.remove("is-pressed");
      }, 140);
    }

    function onClick(evt) {
      var btn = evt.target && evt.target.closest ? evt.target.closest("button") : null;
      if (!btn) return;
      flashPressed(btn);

      if (btn.hasAttribute("data-music-open")) {
        evt.preventDefault();
        setActiveOption(getSource());
        setSelectorOpen(true);
        return;
      }

      if (btn.hasAttribute("data-music-close")) {
        evt.preventDefault();
        setSelectorOpen(false);
        return;
      }

      var nextSource = btn.getAttribute("data-music-set-source");
      if (nextSource) {
        evt.preventDefault();
        setSource(nextSource);
        setSelectorOpen(false);
        return;
      }

      if (btn.hasAttribute("data-music-play-toggle")) {
        evt.preventDefault();
        var isPlaying = btn.getAttribute("data-playing") === "true";
        if (!isPlaying && currentSec >= trackDurationSec) {
          currentSec = 0;
          renderTrack();
        }
        syncPlayState(!isPlaying);
        return;
      }

      if (btn.hasAttribute("data-music-favorite")) {
        evt.preventDefault();
        if (getSource() !== "fm") return;
        var selected = btn.getAttribute("data-favorite") === "true";
        btn.setAttribute("data-favorite", selected ? "false" : "true");
        btn.setAttribute("aria-pressed", selected ? "false" : "true");
      }
    }

    function onKeyDown(evt) {
      if (evt.key !== "Escape") return;
      if (card.getAttribute("data-music-selector-open") === "true") {
        evt.preventDefault();
        setSelectorOpen(false);
      }
    }

    card.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);

    setSource(getSource());
    setSelectorOpen(false);
    renderTrack();
    syncPlayState(false);

    return { setSource: setSource, setSelectorOpen: setSelectorOpen, syncPlayState: syncPlayState };
  };
})();
