(function () {
  var canvas = document.getElementById("game3d-canvas");
  var scoreEl = document.getElementById("game3d-score");
  var bestEl = document.getElementById("game3d-best");
  var restart = document.getElementById("game3d-restart");
  var statusEl = document.getElementById("game3d-status");
  var leftButton = document.getElementById("game3d-left");
  var rightButton = document.getElementById("game3d-right");
  if (!canvas || !scoreEl || !restart) return;

  var BEST_KEY = "portfolio-rocket-3d-best";
  var best = 0;
  try {
    best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
  } catch (error) {
    best = 0;
  }

  var playerX = 0;
  var rocks = [];
  var stars = [];
  var score = 0;
  var lived = 0;
  var alive = true;
  var spawnIn = 0.35;
  var keys = {};
  var pad = { left: false, right: false };
  var pointers = {};
  var dragId = null;
  var targetX = null;
  var last = 0;
  var STAR_COUNT = 180;

  function soundOn() {
    return document.documentElement.getAttribute("data-sound") === "on";
  }

  function hitTone() {
    if (!soundOn()) return;
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!hitTone.ctx) hitTone.ctx = new AudioCtx();
    var audio = hitTone.ctx;
    if (audio.state === "suspended") audio.resume();
    var now = audio.currentTime;
    var osc = audio.createOscillator();
    var gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

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
    if (statusEl) statusEl.hidden = alive;
  }

  function rushNow() {
    return 1 + Math.min(2.4, lived / 14);
  }

  function makeStar(far) {
    return {
      x: (Math.random() * 2 - 1) * 9,
      y: (Math.random() * 2 - 1) * 5.5,
      z: far ? -38 - Math.random() * 6 : -1.5 - Math.random() * 36
    };
  }

  function makeRock() {
    return {
      x: (Math.random() * 2 - 1) * 1.55,
      y: (Math.random() * 2 - 1) * 0.12,
      z: -30 - Math.random() * 6,
      r: 0.28 + Math.random() * 0.22,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: 0.4 + Math.random() * 1.1,
      extra: Math.random() * 2.5
    };
  }

  function reset() {
    playerX = 0;
    targetX = null;
    rocks = [];
    score = 0;
    lived = 0;
    alive = true;
    spawnIn = 0.25;
    for (var i = 0; i < 3; i++) {
      var rock = makeRock();
      rock.z = -12 - i * 8;
      rock.x = i === 1 ? 1.15 : -1.15;
      rocks.push(rock);
    }
    if (!stars.length) {
      for (var s = 0; s < STAR_COUNT; s++) stars.push(makeStar(false));
    }
    paintScore();
  }

  function steerFromClient(clientX) {
    var rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    var t = (clientX - rect.left) / rect.width;
    targetX = Math.max(-1.7, Math.min(1.7, (t - 0.5) * 3.4));
  }

  function holdButton(button, which) {
    if (!button) return;
    button.addEventListener("pointerdown", function (event) {
      pointers[event.pointerId] = which;
      pad[which] = true;
      targetX = null;
      event.preventDefault();
    });
  }

  function releasePointer(event) {
    var which = pointers[event.pointerId];
    if (which) {
      delete pointers[event.pointerId];
      pad[which] = false;
      Object.keys(pointers).forEach(function (id) {
        if (pointers[id] === which) pad[which] = true;
      });
    }
    if (dragId === event.pointerId) dragId = null;
  }

  holdButton(leftButton, "left");
  holdButton(rightButton, "right");
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", releasePointer);

  canvas.addEventListener("pointerdown", function (event) {
    dragId = event.pointerId;
    steerFromClient(event.clientX);
    canvas.focus();
  });
  canvas.addEventListener("pointermove", function (event) {
    if (dragId !== event.pointerId) return;
    steerFromClient(event.clientX);
  });

  function keyName(event) {
    return (event.key || "").toLowerCase();
  }

  function onKey(event, down) {
    if (!event.target.closest || !event.target.closest("#rocket-game-3d")) return;
    var name = keyName(event);
    if (name !== "arrowleft" && name !== "arrowright" && name !== "a" && name !== "d") return;
    keys[name] = down;
    if (down) targetX = null;
    event.preventDefault();
  }

  document.addEventListener("keydown", function (event) { onKey(event, true); });
  document.addEventListener("keyup", function (event) { onKey(event, false); });
  restart.addEventListener("click", function () {
    reset();
    canvas.focus();
  });

  function update(dt) {
    var rush = rushNow();
    stars.forEach(function (star) {
      star.z += 10 * rush * dt;
      if (star.z > 3.6) {
        var next = makeStar(true);
        star.x = next.x;
        star.y = next.y;
        star.z = next.z;
      }
    });
    if (!alive) return;
    lived += dt;
    var steer = 0;
    if (keys.arrowleft || keys.a || pad.left) steer -= 1;
    if (keys.arrowright || keys.d || pad.right) steer += 1;
    if (steer !== 0) {
      playerX += steer * 2.5 * dt;
      targetX = null;
    } else if (targetX !== null) {
      playerX += (targetX - playerX) * Math.min(1, dt * 8);
    }
    playerX = Math.max(-1.7, Math.min(1.7, playerX));
    spawnIn -= dt;
    if (spawnIn <= 0) {
      rocks.push(makeRock());
      spawnIn = Math.max(0.32, (1.15 + Math.random() * 0.45) / rush);
    }
    for (var i = rocks.length - 1; i >= 0; i--) {
      var rock = rocks[i];
      rock.z += (7.5 + rock.extra) * rush * dt;
      rock.spin += rock.spinSpeed * dt;
      if (rock.z > 2.4) {
        rocks.splice(i, 1);
        score += 1;
        paintScore();
        continue;
      }
      var near = rock.z > 0.05 && rock.z < 0.85;
      var hit = Math.abs(rock.x - playerX) < rock.r * 0.72 + 0.12 && Math.abs(rock.y) < 0.28;
      if (near && hit) {
        alive = false;
        paintScore();
        hitTone();
      }
    }
  }

  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) {
      for (var r = 0; r < 4; r++) {
        o[c * 4 + r] =
          a[r] * b[c * 4] +
          a[4 + r] * b[c * 4 + 1] +
          a[8 + r] * b[c * 4 + 2] +
          a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }

  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2);
    var nf = 1 / (near - far);
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ];
  }

  function lookAt(eye, center, up) {
    var zx = eye[0] - center[0];
    var zy = eye[1] - center[1];
    var zz = eye[2] - center[2];
    var len = Math.hypot(zx, zy, zz) || 1;
    zx /= len; zy /= len; zz /= len;
    var xx = up[1] * zz - up[2] * zy;
    var xy = up[2] * zx - up[0] * zz;
    var xz = up[0] * zy - up[1] * zx;
    len = Math.hypot(xx, xy, xz) || 1;
    xx /= len; xy /= len; xz /= len;
    var yx = zy * xz - zz * xy;
    var yy = zz * xx - zx * xz;
    var yz = zx * xy - zy * xx;
    return [
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ];
  }

  function model(x, y, z, rotY, sx, sy, sz) {
    var c = Math.cos(rotY);
    var s = Math.sin(rotY);
    return [
      c * sx, 0, -s * sx, 0,
      0, sy, 0, 0,
      s * sz, 0, c * sz, 0,
      x, y, z, 1
    ];
  }

  function octahedron() {
    var p = [
      [0, 1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, -1, 0]
    ];
    var faces = [
      [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
      [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
    ];
    var data = [];
    faces.forEach(function (face) {
      face.forEach(function (index) {
        data.push(p[index][0], p[index][1], p[index][2]);
      });
    });
    return new Float32Array(data);
  }

  function rocketMesh() {
    return new Float32Array([
      0, 0.12, -0.85,  -0.16, 0.0, 0.15,  0.16, 0.0, 0.15,
      0, 0.12, -0.85,  0, -0.1, 0.15,  -0.16, 0.0, 0.15,
      0, 0.12, -0.85,  0.16, 0.0, 0.15,  0, -0.1, 0.15,
      0, -0.1, 0.15,  -0.16, 0.0, 0.15,  0.16, 0.0, 0.15,
      -0.05, 0.04, -0.28,  -0.12, 0.0, -0.05,  0.02, 0.05, -0.05,
      -0.16, 0.02, 0.02,  -0.38, -0.02, 0.32,  -0.05, -0.02, 0.22,
      0.16, 0.02, 0.02,  0.05, -0.02, 0.22,  0.38, -0.02, 0.32
    ]);
  }

  function flameMesh() {
    return new Float32Array([
      0, 0.05, 0.16,  -0.07, -0.04, 0.18,  0, -0.01, 0.72,
      0, 0.05, 0.16,  0, -0.01, 0.72,  0.07, -0.04, 0.18
    ]);
  }

  var gl = canvas.getContext("webgl", { alpha: false, antialias: true, depth: true });
  var gpu = null;
  if (gl) {
    var vertSrc = [
      "precision mediump float;",
      "attribute vec3 aPos;",
      "uniform mat4 uMvp;",
      "uniform float uPoint;",
      "void main(){",
      "  gl_Position = uMvp * vec4(aPos, 1.0);",
      "  gl_PointSize = uPoint > 0.5 ? clamp(120.0 / max(1.0, gl_Position.w), 1.2, 5.5) : 1.0;",
      "}"
    ].join("\n");
    var fragSrc = [
      "precision mediump float;",
      "uniform vec3 uColor;",
      "uniform float uPoint;",
      "void main(){",
      "  if (uPoint > 0.5) {",
      "    vec2 p = gl_PointCoord * 2.0 - 1.0;",
      "    if (dot(p, p) > 1.0) discard;",
      "  }",
      "  gl_FragColor = vec4(uColor, 1.0);",
      "}"
    ].join("\n");
    function compile(type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        canvas.dataset.glError = gl.getShaderInfoLog(shader) || "shader";
        return null;
      }
      return shader;
    }
    var vs = compile(gl.VERTEX_SHADER, vertSrc);
    var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (vs && fs) {
      var program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        canvas.dataset.glError = gl.getProgramInfoLog(program) || "link";
      }
      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gpu = {
          program: program,
          aPos: gl.getAttribLocation(program, "aPos"),
          uMvp: gl.getUniformLocation(program, "uMvp"),
          uColor: gl.getUniformLocation(program, "uColor"),
          uPoint: gl.getUniformLocation(program, "uPoint"),
          starBuf: gl.createBuffer(),
          rockBuf: gl.createBuffer(),
          rocketBuf: gl.createBuffer(),
          flameBuf: gl.createBuffer(),
          rockCount: octahedron().length / 3,
          rocketCount: rocketMesh().length / 3,
          flameCount: flameMesh().length / 3
        };
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.rockBuf);
        gl.bufferData(gl.ARRAY_BUFFER, octahedron(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.rocketBuf);
        gl.bufferData(gl.ARRAY_BUFFER, rocketMesh(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.flameBuf);
        gl.bufferData(gl.ARRAY_BUFFER, flameMesh(), gl.STATIC_DRAW);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0.02, 0.027, 0.05, 1);
      }
    }
  }

  var ctx2d = gl ? null : canvas.getContext("2d");
  canvas.dataset.renderer = gpu ? "webgl" : ctx2d ? "canvas" : "none";

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(2, Math.round((rect.width || canvas.clientWidth || 320) * dpr));
    var h = Math.max(2, Math.round((rect.height || w * 420 / 800) * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function viewMatrix() {
    return lookAt(
      [playerX * 0.12, 0.62, 3.55],
      [playerX * 0.5, 0.02, -8],
      [0, 1, 0]
    );
  }

  function drawMesh(buffer, count, mvp, color, points) {
    gl.useProgram(gpu.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(gpu.aPos);
    gl.vertexAttribPointer(gpu.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(gpu.uMvp, false, new Float32Array(mvp));
    gl.uniform3fv(gpu.uColor, color);
    gl.uniform1f(gpu.uPoint, points ? 1 : 0);
    gl.drawArrays(points ? gl.POINTS : gl.TRIANGLES, 0, count);
  }

  function drawGL(time) {
    resize();
    var aspect = canvas.width / Math.max(1, canvas.height);
    var proj = perspective(Math.PI / 3.1, aspect, 0.08, 80);
    var view = viewMatrix();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var starData = new Float32Array(stars.length * 3);
    stars.forEach(function (star, index) {
      starData[index * 3] = star.x;
      starData[index * 3 + 1] = star.y;
      starData[index * 3 + 2] = star.z;
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.starBuf);
    gl.bufferData(gl.ARRAY_BUFFER, starData, gl.DYNAMIC_DRAW);
    drawMesh(gpu.starBuf, stars.length, mul(proj, view), [0.92, 0.95, 1], true);
    rocks.forEach(function (rock) {
      var mvp = mul(proj, mul(view, model(rock.x, rock.y, rock.z, rock.spin, rock.r, rock.r * 0.82, rock.r * 1.05)));
      drawMesh(gpu.rockBuf, gpu.rockCount, mvp, [0.62, 0.68, 0.74], false);
    });
    var rocketM = mul(proj, mul(view, model(playerX, 0.02 + Math.sin(time * 0.004) * 0.03, 0.15, 0, 1.3, 1.3, 1.3)));
    drawMesh(gpu.rocketBuf, gpu.rocketCount, rocketM, [0.82, 0.88, 0.93], false);
    var flicker = 0.85 + Math.sin(time * 0.02) * 0.15;
    drawMesh(gpu.flameBuf, gpu.flameCount, rocketM, [1, 0.48 * flicker, 0.12], false);
  }

  function project(x, y, z) {
    var depth = 3.55 - z;
    if (depth < 0.2) return null;
    var f = canvas.height * 0.85;
    return {
      x: canvas.width / 2 + (x - playerX * 0.12) * f / depth,
      y: canvas.height / 2 - (y - 0.62) * f / depth,
      s: f / depth
    };
  }

  function draw2d() {
    resize();
    var g = ctx2d;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = "#05070d";
    g.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(function (star) {
      var p = project(star.x, star.y, star.z);
      if (!p) return;
      g.fillStyle = "#e7f2ff";
      g.fillRect(p.x, p.y, Math.max(1, 90 / (3.55 - star.z)), Math.max(1, 90 / (3.55 - star.z)));
    });
    rocks.forEach(function (rock) {
      var p = project(rock.x, rock.y, rock.z);
      if (!p) return;
      var radius = Math.max(4, rock.r * p.s * 0.55);
      g.fillStyle = "#9aa6b2";
      g.beginPath();
      g.arc(p.x, p.y, radius, 0, Math.PI * 2);
      g.fill();
    });
    var nose = project(playerX, 0.12, -0.5);
    var tail = project(playerX, -0.02, 1.05);
    if (nose && tail) {
      g.fillStyle = "#ff8a1e";
      g.beginPath();
      g.moveTo(tail.x, tail.y);
      g.lineTo(tail.x - 8, tail.y - 16);
      g.lineTo(tail.x + 8, tail.y - 16);
      g.fill();
      g.fillStyle = "#d5dee8";
      g.beginPath();
      g.moveTo(nose.x, nose.y);
      g.lineTo(tail.x - 16, tail.y);
      g.lineTo(tail.x + 16, tail.y);
      g.fill();
    }
  }

  function frame(now) {
    var dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016);
    last = now;
    update(dt);
    if (gpu) drawGL(now);
    else if (ctx2d) draw2d();
    requestAnimationFrame(frame);
  }

  reset();
  requestAnimationFrame(frame);
  window.addEventListener("resize", resize);
})();
