(function () {
  var canvas = document.getElementById("starfield");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var layers = [
    { count: 48, speed: 6, drift: 1.5, size: 1, alpha: 0.28 },
    { count: 26, speed: 11, drift: -2.2, size: 1.25, alpha: 0.42 },
    { count: 12, speed: 18, drift: 3, size: 1.6, alpha: 0.55 }
  ];
  var stars = [];

  function build() {
    stars = [];
    layers.forEach(function (layer) {
      for (var i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          speed: layer.speed,
          drift: layer.drift,
          size: layer.size,
          alpha: layer.alpha * (0.65 + Math.random() * 0.35)
        });
      }
    });
  }

  function resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function wrap(value) {
    if (value < 0) return value + 1;
    if (value > 1) return value - 1;
    return value;
  }

  var last = 0;
  function frame(now) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    ctx.clearRect(0, 0, width, height);
    stars.forEach(function (star) {
      if (!reduce) {
        star.y = wrap(star.y - (star.speed * dt) / height);
        star.x = wrap(star.x + (star.drift * dt) / width);
      }
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = "#e7f2ff";
      ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
    });
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(frame);
  }

  build();
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
})();
