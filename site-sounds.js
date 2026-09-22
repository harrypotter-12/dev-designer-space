(function () {
  var STORAGE_KEY = "portfolio-sound";
  var stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    stored = null;
  }

  var enabled = stored === "on";
  var ctx = null;
  var lastClick = 0;
  var lastWhoosh = 0;

  function context() {
    if (!ctx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    return ctx;
  }

  function clickTick() {
    var audio = context();
    if (!audio) return;
    var now = audio.currentTime;
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.02, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  function whoosh() {
    var audio = context();
    if (!audio) return;
    var now = audio.currentTime;
    var duration = 0.14;
    var count = Math.floor(audio.sampleRate * duration);
    var buffer = audio.createBuffer(1, count, audio.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < count; i++) data[i] = Math.random() * 2 - 1;
    var noise = audio.createBufferSource();
    var filter = audio.createBiquadFilter();
    var gain = audio.createGain();
    noise.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(480, now);
    filter.frequency.exponentialRampToValueAtTime(160, now + duration);
    filter.Q.value = 0.6;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  function playClick() {
    if (!enabled) return;
    var nowMs = Date.now();
    if (nowMs - lastClick < 80) return;
    lastClick = nowMs;
    var audio = context();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    clickTick();
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

  document.addEventListener("click", function (event) {
    if (event.target.closest("#sound-toggle")) return;
    if (event.target.closest("a, button")) playClick();
  });

  document.addEventListener("rocket-thrust", function () {
    if (!enabled) return;
    var nowMs = Date.now();
    if (nowMs - lastWhoosh < 180) return;
    lastWhoosh = nowMs;
    var audio = context();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    whoosh();
  });

  var toggle = document.getElementById("sound-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      remember(!enabled);
      if (enabled) playClick();
    });
  }
  paint();
})();
