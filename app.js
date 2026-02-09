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
      key: "driving",
      label: "NORMAL",
      icon: "https://www.figma.com/api/mcp/asset/3334ed65-b136-44f0-8dc8-261a4bfa07e5",
    },
    {
      key: "energy",
      label: "ENERGY",
      icon: "https://www.figma.com/api/mcp/asset/fb61e296-daec-44d3-ac30-5fe772c3b180",
    },
  ];

  var activeDriveIndex = 1;
  var volume = null;

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

    var prev = (activeDriveIndex + driveModes.length - 1) % driveModes.length;
    var next = (activeDriveIndex + 1) % driveModes.length;

    var btnPrev = selector.querySelector('button[data-drive-action="prev"]');
    var btnNext = selector.querySelector('button[data-drive-action="next"]');
    var btnActive = selector.querySelector(".range-selector__active");

    var imgPrev = btnPrev && btnPrev.querySelector("img");
    var imgNext = btnNext && btnNext.querySelector("img");
    var imgActive = btnActive && btnActive.querySelector("img");
    var labelActive = btnActive && btnActive.querySelector(".range-selector__label");

    if (btnPrev) btnPrev.setAttribute("aria-label", driveModes[prev].label);
    if (btnNext) btnNext.setAttribute("aria-label", driveModes[next].label);
    if (btnActive) btnActive.setAttribute("aria-label", driveModes[activeDriveIndex].label);
    if (imgPrev) imgPrev.src = driveModes[prev].icon;
    if (imgNext) imgNext.src = driveModes[next].icon;
    if (imgActive) imgActive.src = driveModes[activeDriveIndex].icon;
    if (labelActive) labelActive.textContent = driveModes[activeDriveIndex].label;
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
      if (window.REEV.features.volume) volume = window.REEV.features.volume();
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

    var driveAction = btn.getAttribute("data-drive-action");
    if (driveAction === "prev") {
      activeDriveIndex = (activeDriveIndex + driveModes.length - 1) % driveModes.length;
      updateDriveSelector();
      return;
    }
    if (driveAction === "next") {
      activeDriveIndex = (activeDriveIndex + 1) % driveModes.length;
      updateDriveSelector();
      return;
    }

    var toggle = btn.getAttribute("data-toggle");
    if (toggle === "toggle") {
      var pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!pressed));
      if (btn.classList && btn.classList.contains("bottombar__volume")) {
        volume && volume.syncPanel && volume.syncPanel();
      }
    }
  });

  init();
})();
