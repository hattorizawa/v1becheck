(function () {
  window.REEV = window.REEV || {};
  window.REEV.features = window.REEV.features || {};

  window.REEV.features.volume = function initVolume() {
    var value = 0.62;
    var button = document.querySelector(".bottombar__volume");
    var panel = document.querySelector(".volume-panel");
    var slider = document.querySelector("[data-volume-slider]");
    var handle = document.querySelector("[data-volume-handle]");

    var dragOffset = 0;
    var dragging = false;

    function clamp(v, min, max) {
      return Math.min(max, Math.max(min, v));
    }

    function syncPanel() {
      if (!button || !panel) return;
      panel.hidden = button.getAttribute("aria-pressed") !== "true";
    }

    function render() {
      if (!panel || !slider) return;
      value = clamp(value, 0, 1);
      panel.style.setProperty("--volume", String(value));
      slider.setAttribute("aria-valuenow", String(Math.round(value * 100)));

      if (handle) {
        var sliderRect = slider.getBoundingClientRect();
        var handleRect = handle.getBoundingClientRect();
        var handleHeight = handleRect.height || 620;
        var topMin = 160;
        var topMax = sliderRect.height - 16 - handleHeight;
        var top = topMin + (1 - value) * (topMax - topMin);
        handle.style.top = Math.round(top) + "px";
      }
    }

    function setFromPointer(evt) {
      if (!slider) return;
      var rect = slider.getBoundingClientRect();
      var handleHeight = (handle && handle.getBoundingClientRect().height) || 620;
      var topMin = 160;
      var topMax = rect.height - 16 - handleHeight;
      var y = evt.clientY - rect.top - dragOffset;
      var top = clamp(y, topMin, topMax);
      value = clamp(1 - (top - topMin) / (topMax - topMin), 0, 1);
      render();
    }

    if (handle) {
      handle.addEventListener("pointerdown", function (evt) {
        dragging = true;
        var rect = handle.getBoundingClientRect();
        dragOffset = evt.clientY - rect.top;
        setFromPointer(evt);
        handle.setPointerCapture && handle.setPointerCapture(evt.pointerId);
      });
      handle.addEventListener("pointermove", function (evt) {
        if (!dragging) return;
        setFromPointer(evt);
      });
      handle.addEventListener("pointerup", function (evt) {
        dragging = false;
        handle.releasePointerCapture && handle.releasePointerCapture(evt.pointerId);
      });
    }

    document.addEventListener("pointerdown", function (evt) {
      if (!slider || !handle) return;
      var onHandle = evt.target && evt.target.closest ? evt.target.closest("[data-volume-handle]") : null;
      if (onHandle) return;
      var onSlider = evt.target && evt.target.closest ? evt.target.closest("[data-volume-slider]") : null;
      if (!onSlider) return;
      dragging = true;
      dragOffset = (handle && handle.getBoundingClientRect().height) / 2;
      setFromPointer(evt);
      slider.setPointerCapture && slider.setPointerCapture(evt.pointerId);
    });

    document.addEventListener("pointermove", function (evt) {
      if (!dragging) return;
      setFromPointer(evt);
    });

    document.addEventListener("pointerup", function (evt) {
      if (!dragging) return;
      dragging = false;
      slider && slider.releasePointerCapture && slider.releasePointerCapture(evt.pointerId);
    });

    syncPanel();
    render();

    return { syncPanel: syncPanel, render: render };
  };
})();
