(function () {
  function closestButton(el) {
    return el && el.closest ? el.closest("button") : null;
  }

  var driveModes = [
    {
      key: "eco",
      label: "ECO",
      icon: "https://www.figma.com/api/mcp/asset/efe87e96-3d63-448a-932a-fae931b5b708",
    },
    {
      key: "normal",
      label: "NORMAL",
      icon: "https://www.figma.com/api/mcp/asset/3334ed65-b136-44f0-8dc8-261a4bfa07e5",
    },
    {
      key: "sport",
      label: "SPORT",
      icon: "https://www.figma.com/api/mcp/asset/fb61e296-daec-44d3-ac30-5fe772c3b180",
    },
  ];

  var activeDriveIndex = 1;
  var notifyTimer = null;

  function showNotification(title, text) {
    var note = document.querySelector("[data-notification]");
    if (!note) return;
    var titleEl = note.querySelector(".notification__title");
    var textEl = note.querySelector(".notification__text");
    if (titleEl) titleEl.textContent = title || "Title";
    if (textEl) textEl.textContent = text || "Text";

    note.hidden = false;
    if (notifyTimer) window.clearTimeout(notifyTimer);
    notifyTimer = window.setTimeout(function () {
      note.hidden = true;
    }, 2200);
  }

  function setPage(page) {
    var pages = document.querySelectorAll(".page[data-page]");
    pages.forEach(function (p) {
      p.hidden = p.getAttribute("data-page") !== page;
    });
    document.documentElement.setAttribute("data-page", page);

    var navButtons = document.querySelectorAll("button[data-nav-to]");
    navButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-nav-to") === page ? "true" : "false");
    });
  }

  function updateDriveSelector() {
    var selector = document.querySelector("[data-drive-selector]");
    if (!selector) return;

    var items = selector.querySelectorAll("[data-drive-mode]");
    items.forEach(function (item, index) {
      var mode = driveModes[index];
      var isActive = index === activeDriveIndex;
      var img = item.querySelector("img");
      var label = item.querySelector(".range-selector__label");

      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", isActive ? "true" : "false");
      item.setAttribute("aria-label", mode.label);
      item.setAttribute("data-drive-mode", mode.key);
      if (img) img.src = mode.icon;
      if (label) label.textContent = mode.label;
    });
  }

  function initWidgetsWheel() {
    var widgets = document.querySelector(".widgets");
    if (!widgets) return;
    widgets.addEventListener(
      "wheel",
      function (evt) {
        if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX)) {
          widgets.scrollLeft += evt.deltaY;
          evt.preventDefault();
        }
      },
      { passive: false }
    );
  }

  function init() {
    var activeNav = document.querySelector('button[data-nav-to][aria-pressed="true"]');
    if (activeNav) setPage(activeNav.getAttribute("data-nav-to"));

    updateDriveSelector();
    initWidgetsWheel();

    if (window.REEV && window.REEV.features) {
      if (window.REEV.features.favorites) window.REEV.features.favorites();
      if (window.REEV.features.voiceAssistant) window.REEV.features.voiceAssistant();
      if (window.REEV.features.musicWidget) window.REEV.features.musicWidget();
    }
  }

  document.addEventListener("click", function (e) {
    var btn = closestButton(e.target);
    if (!btn) return;

    if (btn.classList && btn.classList.contains("settings-menu__item")) {
      var groupCol = btn.closest("[data-settings-group]");
      if (groupCol) {
        var items = groupCol.querySelectorAll(".settings-menu__item");
        items.forEach(function (it) {
          it.setAttribute("aria-pressed", it === btn ? "true" : "false");
        });
      }
      return;
    }

    var navTo = btn.getAttribute("data-nav-to");
    if (navTo) {
      setPage(navTo);
      return;
    }

    var driveMode = btn.getAttribute("data-drive-mode");
    if (driveMode) {
      var nextIndex = driveModes.findIndex(function (mode) {
        return mode.key === driveMode;
      });
      if (nextIndex === -1) return;
      activeDriveIndex = nextIndex;
      updateDriveSelector();
      return;
    }

    var toggle = btn.getAttribute("data-toggle");
    if (toggle === "toggle") {
      var pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!pressed));
      if (btn.hasAttribute("data-notify")) {
        var label = btn.getAttribute("aria-label") || btn.textContent || "Action";
        showNotification(label.trim(), "Updated");
      }
    }
  });

  init();
})();
