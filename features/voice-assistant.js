(function () {
  window.REEV = window.REEV || {};
  window.REEV.features = window.REEV.features || {};

  window.REEV.features.voiceAssistant = function initVoiceAssistant() {
    var button = document.querySelector("[data-va-button]");
    if (!button) return null;

    var timers = [];
    var state = "default";

    function clearTimers() {
      while (timers.length) {
        window.clearInterval(timers.pop());
      }
    }

    function setLabel(nextState) {
      if (nextState === "activated") {
        button.setAttribute("aria-label", "Voice assistant. Listening");
        return;
      }
      button.setAttribute("aria-label", "Voice assistant. Idle");
    }

    function setState(nextState) {
      state = nextState;
      button.setAttribute("data-va-state", nextState);
      button.setAttribute("aria-pressed", nextState === "default" ? "false" : "true");
      setLabel(nextState);
    }

    function runFlow() {
      clearTimers();
      setState("activated");
    }

    function reset() {
      clearTimers();
      setState("default");
    }

    button.addEventListener("click", function (evt) {
      if (state === "default") {
        runFlow();
        return;
      }

      var close = evt.target && evt.target.closest ? evt.target.closest("[data-va-close]") : null;
      if (close) reset();
    });

    button.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        if (state === "default") {
          runFlow();
        } else {
          reset();
        }
      }
      if (evt.key === "Escape") {
        evt.preventDefault();
        reset();
      }
    });

    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape" && state !== "default") {
        reset();
      }
    });

    setState("default");
    return { reset: reset, setState: setState };
  };
})();
