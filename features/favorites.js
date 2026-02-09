(function () {
  window.REEV = window.REEV || {};
  window.REEV.features = window.REEV.features || {};

  window.REEV.features.favorites = function initFavorites() {
    var sheet = document.querySelector("[data-favorites-sheet]");
    var topbar = document.querySelector(".topbar");
    var topbarHandle = document.querySelector(".topbar__handle");
    var closebar = document.querySelector("[data-favorites-close]");
    var notificationsList = document.querySelector("[data-favorites-list]");
    var notificationsEmpty = document.querySelector("[data-favorites-empty]");
    var notificationsClear = document.querySelector("[data-favorites-clear]");
    var tabButtons = document.querySelectorAll("[data-favorites-tab]");
    var tabViews = document.querySelectorAll("[data-favorites-view]");

    var open = false;
    var drag = false;
    var startY = 0;
    var sliderDrag = null;
    var activeTab = "favorites";

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function setSliderValue(slider, nextValue) {
      if (!slider) return;
      var minFill = parseFloat(slider.getAttribute("data-min-fill") || "0") || 0;
      var value = clamp(nextValue, 0, 1);
      value = Math.max(value, minFill);
      value = clamp(value, 0, 1);
      slider.style.setProperty("--fill", String(value));
      slider.setAttribute("data-value", String(value));
      slider.setAttribute("aria-valuenow", String(Math.round(value * 100)));

      if (slider.getAttribute("data-slider-id") === "volume") {
        slider.classList.toggle("is-muted", value <= 0.001);
      }
    }

    function sliderValueFromEvent(slider, evt) {
      var rect = slider.getBoundingClientRect();
      var ratio = 1 - (evt.clientY - rect.top) / rect.height;
      return clamp(ratio, 0, 1);
    }

    function initSliders() {
      var sliders = document.querySelectorAll("[data-fav-slider]");
      sliders.forEach(function (slider) {
        var value = parseFloat(slider.getAttribute("data-value") || "0") || 0;
        setSliderValue(slider, value);

        slider.addEventListener("pointerdown", function (evt) {
          evt.preventDefault();
          sliderDrag = slider;
          setSliderValue(slider, sliderValueFromEvent(slider, evt));
        });

        slider.addEventListener("keydown", function (evt) {
          var step = evt.shiftKey ? 0.1 : 0.05;
          var valueNow = parseFloat(slider.getAttribute("data-value") || "0") || 0;
          if (evt.key === "ArrowUp" || evt.key === "ArrowRight") {
            evt.preventDefault();
            setSliderValue(slider, valueNow + step);
          }
          if (evt.key === "ArrowDown" || evt.key === "ArrowLeft") {
            evt.preventDefault();
            setSliderValue(slider, valueNow - step);
          }
          if (evt.key === "Home") {
            evt.preventDefault();
            setSliderValue(slider, 0);
          }
          if (evt.key === "End") {
            evt.preventDefault();
            setSliderValue(slider, 1);
          }
        });
      });
    }

    function setOpen(next) {
      open = !!next;
      if (!sheet) return;
      sheet.hidden = false;
      sheet.setAttribute("data-open", open ? "true" : "false");
      sheet.setAttribute("aria-hidden", open ? "false" : "true");
      document.documentElement.setAttribute("data-fav-open", open ? "true" : "false");
    }

    function syncTab(tabKey) {
      activeTab = tabKey;
      tabButtons.forEach(function (t) {
        var active = t.getAttribute("data-favorites-tab") === tabKey;
        t.setAttribute("aria-selected", active ? "true" : "false");
        t.classList.toggle("is-active", active);
      });

      tabViews.forEach(function (v) {
        var active = v.getAttribute("data-favorites-view") === tabKey;
        v.hidden = !active;
        v.classList.toggle("is-active", active);
      });

      var tabsRoot = document.querySelector(".favorites-tabs");
      if (tabsRoot) tabsRoot.classList.toggle("tabs--right", tabKey === "notifications");
      syncNotificationsState();
    }

    function syncNotificationsState() {
      var hasNotifications = !!(notificationsList && notificationsList.children.length);
      if (notificationsEmpty) {
        notificationsEmpty.hidden = !(activeTab === "notifications" && !hasNotifications);
      }
      if (notificationsClear) {
        notificationsClear.hidden = !(activeTab === "notifications" && hasNotifications);
      }
    }

    function onTopbarClick() {
      setOpen(!open);
    }

    function onHandleClick(evt) {
      evt.stopPropagation();
      setOpen(!open);
    }

    function onDocClick(evt) {
      var btn = evt.target && evt.target.closest ? evt.target.closest("button") : null;
      if (!btn) return;

      if (btn.hasAttribute("data-favorites-close")) {
        setOpen(false);
        return;
      }

      var tab = btn.getAttribute("data-favorites-tab");
      if (tab) {
        syncTab(tab);
        return;
      }

      if (btn.hasAttribute("data-favorites-clear")) {
        if (notificationsList) notificationsList.replaceChildren();
        syncNotificationsState();
        return;
      }

      if (btn.classList.contains("fav-tile")) {
        var isOn = btn.getAttribute("aria-pressed") === "true";
        var next = !isOn;
        btn.setAttribute("aria-pressed", next ? "true" : "false");
        btn.classList.toggle("is-on", next);
      }
    }

    function onPointerDown(evt) {
      var target = evt.target;
      if (!target) return;
      if (target.closest && target.closest("[data-fav-slider]")) return;

      var isInteractive = target.closest && target.closest("button, a, input, textarea, select");
      var fromTop = target.closest && target.closest(".topbar, .topbar__handle");
      var fromBottomHandle = target.closest && target.closest("[data-favorites-close]");
      var fromSheet = target.closest && target.closest("[data-favorites-sheet]");

      if (!open) {
        if (!fromTop) return;
      } else {
        if (!fromBottomHandle && (!fromSheet || isInteractive)) return;
      }

      drag = true;
      startY = evt.clientY;
    }

    function onPointerMove(evt) {
      if (sliderDrag) {
        setSliderValue(sliderDrag, sliderValueFromEvent(sliderDrag, evt));
        return;
      }
      if (!drag) return;
      var dy = evt.clientY - startY;
      if (!open && dy > 30) {
        setOpen(true);
        drag = false;
      }
      if (open && dy < -30) {
        setOpen(false);
        drag = false;
      }
    }

    function onPointerUp() {
      drag = false;
      sliderDrag = null;
    }

    function onKeyDown(evt) {
      if (evt.key === "Escape") setOpen(false);
    }

    if (topbar) topbar.addEventListener("click", onTopbarClick);
    if (topbarHandle) topbarHandle.addEventListener("click", onHandleClick);
    tabButtons.forEach(function (tabBtn) {
      function onTabActivate(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var tab = tabBtn.getAttribute("data-favorites-tab");
        if (tab) syncTab(tab);
      }
      tabBtn.addEventListener("click", onTabActivate);
      tabBtn.addEventListener("pointerup", onTabActivate);
    });
    if (notificationsClear) {
      notificationsClear.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (notificationsList) notificationsList.replaceChildren();
        syncNotificationsState();
      });
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("keydown", onKeyDown);

    syncTab("favorites");
    setOpen(false);
    initSliders();
    syncNotificationsState();

    return { setOpen: setOpen, syncTab: syncTab, isOpen: function () { return open; } };
  };
})();
