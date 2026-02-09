(function () {
  window.REEV = window.REEV || {};
  window.REEV.features = window.REEV.features || {};

  window.REEV.features.favorites = function initFavorites() {
    var sheet = document.querySelector("[data-favorites-sheet]");
    var topbar = document.querySelector(".topbar");
    var topbarHandle = document.querySelector(".topbar__handle");
    var closebar = document.querySelector("[data-favorites-close]");
    var timeEl = document.querySelector(".topbar__time");
    var dateEl = document.querySelector(".topbar__date");

    var open = false;
    var drag = false;
    var startY = 0;
    var defaultTime = timeEl ? timeEl.textContent : "";
    var defaultDate = dateEl ? dateEl.textContent : "";

    function setTopbar(openNow) {
      if (!timeEl || !dateEl) return;
      if (openNow) {
        timeEl.textContent = "20:26";
        dateEl.textContent = "Fr, 13 November";
      } else {
        timeEl.textContent = defaultTime;
        dateEl.textContent = defaultDate;
      }
    }

    function setOpen(next) {
      open = !!next;
      if (!sheet) return;
      sheet.hidden = false;
      sheet.setAttribute("data-open", open ? "true" : "false");
      sheet.setAttribute("aria-hidden", open ? "false" : "true");
      document.documentElement.setAttribute("data-fav-open", open ? "true" : "false");
      setTopbar(open);
    }

    function syncTab(tabKey) {
      var tabs = document.querySelectorAll("[data-favorites-tab]");
      tabs.forEach(function (t) {
        var active = t.getAttribute("data-favorites-tab") === tabKey;
        t.setAttribute("aria-selected", active ? "true" : "false");
      });

      var views = document.querySelectorAll("[data-favorites-view]");
      views.forEach(function (v) {
        var active = v.getAttribute("data-favorites-view") === tabKey;
        v.hidden = !active;
      });

      var tabsRoot = document.querySelector(".favorites-tabs");
      if (tabsRoot) tabsRoot.classList.toggle("tabs--right", tabKey === "notifications");
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
      }
    }

    function onPointerDown(evt) {
      var target = evt.target;
      if (!target) return;
      var handle = target.closest && target.closest(".topbar__handle, [data-favorites-close]");
      if (!handle) return;
      drag = true;
      startY = evt.clientY;
    }

    function onPointerMove(evt) {
      if (!drag) return;
      var dy = evt.clientY - startY;
      if (!open && dy > 40) {
        setOpen(true);
        drag = false;
      }
      if (open && dy < -40) {
        setOpen(false);
        drag = false;
      }
    }

    function onPointerUp() {
      drag = false;
    }

    function onKeyDown(evt) {
      if (evt.key === "Escape") setOpen(false);
    }

    if (topbar) topbar.addEventListener("click", onTopbarClick);
    if (topbarHandle) topbarHandle.addEventListener("click", onHandleClick);
    document.addEventListener("click", onDocClick);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("keydown", onKeyDown);

    syncTab("favorites");
    setOpen(false);

    return { setOpen: setOpen, syncTab: syncTab, isOpen: function () { return open; } };
  };
})();
