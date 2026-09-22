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

  function blip(startFreq, endFreq, duration, type, volume) {
    var audio = context();
    if (!audio) return;
    var now = audio.currentTime;
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function play(kind) {
    if (!enabled) return;
    var nowMs = Date.now();
    if (nowMs - lastPlayed < 80) return;
    lastPlayed = nowMs;
    var audio = context();
    if (!audio) return;
    var start = function () {
      if (kind === "card") blip(420, 680, 0.07, "triangle", 0.045);
      else if (kind === "nav") blip(620, 880, 0.06, "sine", 0.04);
      else if (kind === "click") blip(280, 140, 0.05, "sine", 0.05);
      else blip(740, 980, 0.045, "sine", 0.03);
    };
    if (audio.state === "suspended") {
      audio.resume().then(start).catch(function () {});
    } else {
      start();
    }
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
