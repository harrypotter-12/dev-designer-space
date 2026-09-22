(function () {
  var STORAGE_KEY = "portfolio-sound";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    stored = null;
  }

  var enabled = stored === "on" || (stored !== "off" && !reduceMotion);
  var ctx = null;
  var lastPlayed = 0;

  function context() {
    if (!ctx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    return ctx;
  }

  function tick(volume) {
    var audio = context();
    if (!audio) return;
    var now = audio.currentTime;
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(640, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  function play(kind) {
    if (!enabled) return;
    var nowMs = Date.now();
    if (nowMs - lastPlayed < 70) return;
    lastPlayed = nowMs;
    var audio = context();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    if (kind === "click") tick(0.03);
    else tick(0.012);
  }

  function paint() {
    var button = document.getElementById("sound-toggle");
    if (!button) return;
    var icon = button.querySelector(".sound-icon");
    var label = button.querySelector(".sound-label");
    button.setAttribute("aria-pressed", enabled ? "true" : "false");
    button.setAttribute("aria-label", enabled ? "Mute sound" : "Turn sound on");
    button.classList.toggle("is-muted", !enabled);
    document.documentElement.setAttribute("data-sound", enabled ? "on" : "off");
    if (icon) icon.textContent = enabled ? "🔊" : "🔇";
    if (label) label.textContent = enabled ? "Sound on" : "Muted";
  }

  function remember(next) {
    enabled = next;
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch (error) {
      /* private mode can block storage; the button still works this visit */
    }
    paint();
  }

  document.addEventListener("pointerdown", function () {
    var audio = context();
    if (audio && audio.state === "suspended") audio.resume().catch(function () {});
  });

  document.addEventListener("mouseover", function (event) {
    if (event.target.closest("#sound-toggle")) return;
    var card = event.target.closest(".project-card");
    var nav = event.target.closest(".nav-link, .space-brand");
    var control = event.target.closest("a, button, .timeline-card, .depth-panel");
    var zone = card || nav || control;
    if (!zone) return;
    if (event.relatedTarget && zone.contains(event.relatedTarget)) return;
    if (card) play("card");
    else if (nav) play("nav");
    else play("hover");
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest("#sound-toggle")) return;
    var card = event.target.closest(".project-card");
    var nav = event.target.closest(".nav-link, .space-brand");
    var control = event.target.closest("a, button");
    if (card) play("card");
    else if (nav) play("nav");
    else if (control) play("click");
  });

  var toggle = document.getElementById("sound-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      remember(!enabled);
      if (enabled) play("click");
    });
  }
  paint();
})();
