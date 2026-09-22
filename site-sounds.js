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

  function thrust() {
    var audio = context();
    if (!audio) return;
    var now = audio.currentTime;
    var duration = 0.22;
    var rumble = audio.createOscillator();
    var rumbleFilter = audio.createBiquadFilter();
    var rumbleGain = audio.createGain();
    rumble.type = "triangle";
    rumble.frequency.setValueAtTime(78, now);
    rumble.frequency.exponentialRampToValueAtTime(46, now + duration);
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 160;
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.07, now + 0.03);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(audio.destination);
    rumble.start(now);
    rumble.stop(now + duration + 0.02);

    var hissDuration = 0.12;
    var count = Math.floor(audio.sampleRate * hissDuration);
    var buffer = audio.createBuffer(1, count, audio.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < count; i++) data[i] = Math.random() * 2 - 1;
    var noise = audio.createBufferSource();
    var hissFilter = audio.createBiquadFilter();
    var hissGain = audio.createGain();
    noise.buffer = buffer;
    hissFilter.type = "highpass";
    hissFilter.frequency.value = 1800;
    hissGain.gain.setValueAtTime(0.0001, now);
    hissGain.gain.exponentialRampToValueAtTime(0.03, now + 0.015);
    hissGain.gain.exponentialRampToValueAtTime(0.0001, now + hissDuration);
    noise.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(audio.destination);
    noise.start(now);
    noise.stop(now + hissDuration + 0.02);
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
    thrust();
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
