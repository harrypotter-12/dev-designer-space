(function () {
  function orrery() {
    var canvas = document.getElementById("solar-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var planets = [
      { name: "Mercury", period: 28, rx: 0.22, ry: 0.09, size: 7, color: "#d9c7a2", phase: 0.4 },
      { name: "Venus", period: 44, rx: 0.34, ry: 0.14, size: 11, color: "#e2b15a", phase: 2.1 },
      { name: "Earth", period: 64, rx: 0.46, ry: 0.19, size: 12, color: "#6eb6f0", phase: 4.2 },
      { name: "Mars", period: 88, rx: 0.58, ry: 0.24, size: 9, color: "#e07a4c", phase: 1.2 }
    ];
    var start = performance.now();

    function draw(now) {
      var w = canvas.width;
      var h = canvas.height;
      var cx = w / 2;
      var cy = h / 2 + 10;
      var t = reduce ? 0 : (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      var glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 70);
      glow.addColorStop(0, "rgba(255, 214, 120, 0.95)");
      glow.addColorStop(0.45, "rgba(255, 140, 40, 0.35)");
      glow.addColorStop(1, "rgba(255, 120, 20, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();

      planets.forEach(function (planet) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * planet.rx, h * planet.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(198, 220, 236, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      var sun = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 22);
      sun.addColorStop(0, "#fff4c4");
      sun.addColorStop(0.55, "#ffb03a");
      sun.addColorStop(1, "#e26a12");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();

      var spots = planets.map(function (planet) {
        var angle = planet.phase + (Math.PI * 2 * t) / planet.period;
        return {
          planet: planet,
          x: cx + Math.cos(angle) * w * planet.rx,
          y: cy + Math.sin(angle) * h * planet.ry
        };
      });

      spots.forEach(function (spot) {
        var planet = spot.planet;
        var x = spot.x;
        var y = spot.y;
        var body = ctx.createRadialGradient(x - planet.size * 0.35, y - planet.size * 0.35, 1, x, y, planet.size);
        body.addColorStop(0, "#ffffff");
        body.addColorStop(0.35, planet.color);
        body.addColorStop(1, "#1a120c");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(x, y, planet.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.font = "600 28px sans-serif";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(5, 8, 16, 0.9)";
      ctx.fillStyle = "#f4fbff";
      spots.forEach(function (spot) {
        var label = spot.planet.name;
        var width = ctx.measureText(label).width;
        var x = spot.x + spot.planet.size + 10;
        var y = spot.y;
        if (x + width > w - 12) x = spot.x - spot.planet.size - 10 - width;
        if (y < 18) y = 18;
        if (y > h - 18) y = h - 18;
        ctx.strokeText(label, x, y);
        ctx.fillText(label, x, y);
      });

      if (!reduce) requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  function game() {
    var canvas = document.getElementById("game-canvas");
    var scoreEl = document.getElementById("game-score");
    var bestEl = document.getElementById("game-best");
    var restart = document.getElementById("game-restart");
    if (!canvas || !scoreEl || !restart) return;
    var BEST_KEY = "portfolio-rocket-best";
    var best = 0;
    try {
      best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
    } catch (error) {
      best = 0;
    }
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    var rocket = { x: 120, y: H / 2 };
    var rocks = [];
    var score = 0;
    var alive = true;
    var spawn = 0.4;
    var pointerY = null;
    var keys = {};
    var pad = { left: false, right: false };
    var last = 0;
    var leftButton = document.getElementById("game-left");
    var rightButton = document.getElementById("game-right");

    function rememberBest() {
      if (score <= best) return;
      best = score;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch (error) {
        /* private mode can block storage; the score still shows this visit */
      }
    }

    function paintScore() {
      rememberBest();
      scoreEl.textContent = alive ? "Score " + score : "Score " + score + " — hit";
      if (bestEl) bestEl.textContent = "Best " + best;
    }

    function reset() {
      rocket.y = H / 2;
      rocks = [];
      score = 0;
      alive = true;
      spawn = 0.4;
      paintScore();
    }

    function canvasY(clientY) {
      var rect = canvas.getBoundingClientRect();
      return ((clientY - rect.top) / rect.height) * H;
    }

    canvas.addEventListener("pointermove", function (event) {
      pointerY = canvasY(event.clientY);
    });
    canvas.addEventListener("pointerdown", function (event) {
      pointerY = canvasY(event.clientY);
      canvas.focus();
    });
    canvas.addEventListener("keydown", function (event) {
      var move = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"];
      if (move.indexOf(event.key) === -1 && move.indexOf(event.key.toLowerCase()) === -1) return;
      keys[event.key.toLowerCase()] = true;
      event.preventDefault();
    });
    canvas.addEventListener("keyup", function (event) {
      keys[event.key.toLowerCase()] = false;
    });
    restart.addEventListener("click", function () {
      reset();
      canvas.focus();
    });

    function holdButton(button, which) {
      if (!button) return;
      function down(event) {
        pad[which] = true;
        event.preventDefault();
      }
      function up() {
        pad[which] = false;
      }
      button.addEventListener("pointerdown", down);
      button.addEventListener("pointerup", up);
      button.addEventListener("pointercancel", up);
      button.addEventListener("pointerleave", up);
    }
    holdButton(leftButton, "left");
    holdButton(rightButton, "right");

    function drawRocket() {
      var x = rocket.x;
      var y = rocket.y;
      ctx.fillStyle = "#ff8a1e";
      ctx.beginPath();
      ctx.moveTo(x - 34, y);
      ctx.lineTo(x - 18, y - 7);
      ctx.lineTo(x - 18, y + 7);
      ctx.fill();
      ctx.fillStyle = "#d7e2ec";
      ctx.beginPath();
      ctx.moveTo(x + 22, y);
      ctx.lineTo(x - 16, y - 12);
      ctx.lineTo(x - 16, y + 12);
      ctx.fill();
      ctx.fillStyle = "#6eb6f0";
      ctx.beginPath();
      ctx.arc(x - 2, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8aa0b3";
      ctx.beginPath();
      ctx.moveTo(x - 16, y - 8);
      ctx.lineTo(x - 28, y - 16);
      ctx.lineTo(x - 8, y - 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 16, y + 8);
      ctx.lineTo(x - 28, y + 16);
      ctx.lineTo(x - 8, y + 8);
      ctx.fill();
    }

    function frame(now) {
      var dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
      last = now;
      if (alive) {
        var thrusting = keys.arrowup || keys.w || keys.arrowdown || keys.s || pad.left || pad.right;
        if (keys.arrowup || keys.w || pad.left) rocket.y -= 240 * dt;
        if (keys.arrowdown || keys.s || pad.right) rocket.y += 240 * dt;
        if (!thrusting && pointerY !== null) rocket.y += (pointerY - rocket.y) * Math.min(1, dt * 10);
        rocket.y = Math.max(36, Math.min(H - 36, rocket.y));
        spawn -= dt;
        if (spawn <= 0) {
          rocks.push({
            x: W + 24,
            y: 36 + Math.random() * (H - 72),
            r: 16 + Math.random() * 18,
            speed: 150 + Math.random() * 110
          });
          spawn = 0.75 + Math.random() * 0.45;
        }
        for (var i = rocks.length - 1; i >= 0; i--) {
          rocks[i].x -= rocks[i].speed * dt;
          if (rocks[i].x < -40) {
            rocks.splice(i, 1);
            score += 1;
            paintScore();
            continue;
          }
          if (Math.hypot(rocks[i].x - rocket.x, rocks[i].y - rocket.y) < rocks[i].r + 18) {
            alive = false;
            paintScore();
          }
        }
      }

      ctx.clearRect(0, 0, W, H);
      rocks.forEach(function (rock) {
        var body = ctx.createRadialGradient(rock.x - 4, rock.y - 4, 2, rock.x, rock.y, rock.r);
        body.addColorStop(0, "#d5dde6");
        body.addColorStop(1, "#5c6874");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
        ctx.fill();
      });
      drawRocket();
      if (!alive) {
        ctx.fillStyle = "rgba(5, 7, 13, 0.45)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ffffff";
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Hit", W / 2, H / 2 - 8);
        ctx.font = "16px sans-serif";
        ctx.fillText("Press Restart to play again", W / 2, H / 2 + 22);
      }
      requestAnimationFrame(frame);
    }

    reset();
    requestAnimationFrame(frame);
  }

  orrery();
  game();
})();
