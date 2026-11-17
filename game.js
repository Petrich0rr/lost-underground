// Lost Underground — standalone vanilla JS game.
// Main character Sylvia, her boyfriend Ray (a head taller) wandering the bar.
// Sylvia moves with arrow keys / A and D and jumps with space; gravity 0.5,
// jump -13.5, forgiving hitboxes, all obstacles clearable.
// No build step: open index.html from any static host (Cloudflare Pages, GitHub Pages).
(function () {
  var HIGH_KEY = "erika-underground-high";
  var GRAVITY = 0.5;
  var JUMP_V = -13.5;
  var CHAR_X = 72;
  var CHAR_H = 148;
  var CHAR_W = 80;
  var RAY_H = 168;
  var FLOOR_H = 52;

  var RUN_SRCS = ["assets/sylvia-walk-01.png","assets/sylvia-walk-02.png","assets/sylvia-walk-03.png","assets/sylvia-walk-04.png","assets/sylvia-walk-05.png","assets/sylvia-walk-06.png","assets/sylvia-walk-07.png","assets/sylvia-walk-08.png"];
  var JUMP_SRC = "assets/sylvia-run.png";
  var IDLE_SRC = "assets/sylvia-idle.png";
  var FAIL_SRC = "assets/sylvia-surprised.png";
  var AVATAR_SRC = "assets/sylvia-idle.png";
  var RAY_WALK_SRCS = ["assets/ray-walk-01.png","assets/ray-walk-02.png","assets/ray-walk-03.png","assets/ray-walk-04.png","assets/ray-walk-05.png","assets/ray-walk-06.png","assets/ray-walk-07.png","assets/ray-walk-08.png"];
  var RAY_IDLE_SRC = "assets/ray-idle.png";
  var BG_SRCS = ["assets/bg-bar-01.jpg", "assets/bg-bar-02.jpg", "assets/bg-bar-03.jpg"];

  var OBSTACLE_DEFS = [
    { kind: "draw", draw: "stalagmite", h: 82, w: 52, weight: 3 },
    { kind: "draw", draw: "pillar", h: 62, w: 112, weight: 2 },
    { kind: "draw", draw: "rubble", h: 54, w: 92, weight: 3 },
    { kind: "draw", draw: "barrel", h: 70, w: 56, weight: 3 },
    { kind: "draw", draw: "brazier", h: 88, w: 46, weight: 2 },
    { kind: "sprite", src: "assets/obs-subway.png", h: 84, aspect: 217 / 202, weight: 2 },
    { kind: "sprite", src: "assets/obs-boxes.png", h: 57, aspect: 147 / 136, weight: 3 },
    { kind: "sprite", src: "assets/obs-barrier.png", h: 57, aspect: 148 / 133, weight: 3 },
    { kind: "sprite", src: "assets/obs-bin-black.png", h: 59, aspect: 111 / 146, weight: 2 },
    { kind: "sprite", src: "assets/obs-cone.png", h: 51, aspect: 97 / 117, weight: 3 }
  ];

  function loadHigh() {
    try { return Number(window.localStorage.getItem(HIGH_KEY)) || 0; } catch (e) { return 0; }
  }
  function loadImg(src) { var img = new Image(); img.src = src; return img; }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    ctx.fill();
  }

  var canvas = document.getElementById("game");
  var wrap = document.getElementById("gameWrap");
  var ctx = canvas.getContext("2d");
  var readyOverlay = document.getElementById("readyOverlay");
  var overOverlay = document.getElementById("overOverlay");
  var fireworksEl = document.getElementById("fireworks");
  var finalScoreEl = document.getElementById("finalScore");
  var bestLineEl = document.getElementById("bestLine");
  var bestFootEl = document.getElementById("bestFoot");
  var fwTimer = null;

  var avatarImg = loadImg(AVATAR_SRC);
  var runImgs = RUN_SRCS.map(loadImg);
  var jumpImg = loadImg(JUMP_SRC);
  var idleImg = loadImg(IDLE_SRC);
  var failImg = loadImg(FAIL_SRC);
  var rayWalkImgs = RAY_WALK_SRCS.map(loadImg);
  var rayIdleImg = loadImg(RAY_IDLE_SRC);
  var spriteImgs = new Map();
  OBSTACLE_DEFS.forEach(function (d) { if (d.kind === "sprite") spriteImgs.set(d.src, loadImg(d.src)); });
  var bgImgs = BG_SRCS.map(loadImg);

  var keys = { left: false, right: false };
  var g = { phase: "ready", y: 0, vy: 0, speed: 5.2, obstacles: [], distance: 0, score: 0, high: loadHigh(), run: 0, bgX: 0, time: 0, spawnIn: 90, w: 0, h: 340, px: CHAR_X, facing: 1, ray: { x: 420, dir: 1, pause: 0, walk: 0 } };
  bestFootEl.textContent = String(g.high);

  function groundY() { return g.h - FLOOR_H; }
  function charTop() { return groundY() - CHAR_H; }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = wrap.clientWidth;
    var h = 340;
    g.w = w; g.h = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (g.phase === "ready") g.y = charTop();
  }
  resize();
  window.addEventListener("resize", resize);

  function start() {
    g.phase = "playing"; g.y = charTop(); g.vy = 0; g.speed = 5.2; g.px = CHAR_X;
    g.obstacles = []; g.distance = 0; g.score = 0; g.run = 0; g.spawnIn = 80;
    readyOverlay.hidden = true; overOverlay.hidden = true; fireworksEl.hidden = true;
    if (fwTimer) window.clearTimeout(fwTimer);
  }
  function jump() {
    if (g.phase !== "playing") { start(); return; }
    if (g.y >= charTop() - 0.5) g.vy = JUMP_V;
  }
  function die() {
    g.phase = "over";
    var s = Math.floor(g.score);
    finalScoreEl.textContent = String(s);
    var prev = loadHigh();
    var newBest = s > prev && s > 0;
    if (newBest) {
      g.high = s;
      try { window.localStorage.setItem(HIGH_KEY, String(s)); } catch (e) {}
      bestFootEl.textContent = String(s);
      bestLineEl.textContent = "Best: " + s + " — new best!";
      fireworksEl.hidden = false;
      if (fwTimer) window.clearTimeout(fwTimer);
      fwTimer = window.setTimeout(function () { fireworksEl.hidden = true; }, 3500);
    } else {
      bestLineEl.textContent = "Best: " + Math.max(prev, s);
    }
    overOverlay.hidden = false;
  }
  function pickDef() {
    var pool = OBSTACLE_DEFS.filter(function (d) {
      if (d.kind !== "sprite") return true;
      var img = spriteImgs.get(d.src);
      return img && img.complete && img.naturalWidth > 0;
    });
    var use = pool.length ? pool : OBSTACLE_DEFS;
    var total = use.reduce(function (sum, d) { return sum + d.weight; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < use.length; i++) { roll -= use[i].weight; if (roll <= 0) return use[i]; }
    return use[use.length - 1];
  }
  function spawnObstacle() {
    var def = pickDef();
    var w = def.kind === "draw" ? def.w : Math.round(def.h * def.aspect);
    g.obstacles.push({ def: def, x: g.w + 20, y: groundY() - def.h, w: w, h: def.h });
  }
  function moving() { return keys.left || keys.right; }
  function frameImg() {
    if (g.phase === "over") return failImg;
    if (g.y < charTop() - 0.5) return jumpImg;
    if (moving() || g.phase === "playing") return runImgs[Math.floor(g.run / 2) % runImgs.length];
    return idleImg;
  }
  function drawAvatar() {
    var img = frameImg();
    if (!img || !img.complete || img.naturalWidth === 0) img = avatarImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var w = CHAR_H * (img.naturalWidth / img.naturalHeight);
    var jumping = g.y < charTop() - 0.5;
    var walking = img === runImgs[Math.floor(g.run / 2) % runImgs.length];
    // Sylvia's walk frames face left, so flip them when she faces right.
    var flip = walking && g.facing === 1;
    ctx.save();
    ctx.translate(g.px + CHAR_W / 2, g.y + CHAR_H / 2);
    ctx.rotate(jumping ? -0.12 : 0);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -CHAR_H / 2, w, CHAR_H);
    ctx.restore();
  }
  function drawRay() {
    var r = g.ray;
    var walking = r.pause <= 0;
    var img = walking ? rayWalkImgs[Math.floor(r.walk / 2) % rayWalkImgs.length] : rayIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = rayIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var w = RAY_H * (img.naturalWidth / img.naturalHeight);
    var y = groundY() - RAY_H;
    ctx.save();
    ctx.translate(r.x + w / 2, y + RAY_H / 2);
    // Ray's walk frames face right, so flip them when he walks left.
    if (walking && r.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -RAY_H / 2, w, RAY_H);
    ctx.restore();
  }
  function drawObstacle(o) {
    var x = o.x, y = o.y, w = o.w, h = o.h;
    if (o.def.kind === "sprite") {
      var img = spriteImgs.get(o.def.src);
      if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, w, h);
      return;
    }
    if (o.def.draw === "stalagmite") {
      ctx.fillStyle = "#8b839e";
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.5, y); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#6e6880";
      ctx.beginPath(); ctx.moveTo(x + w * 0.28, y + h); ctx.lineTo(x + w * 0.5, y + h * 0.35); ctx.lineTo(x + w * 0.62, y + h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#a9a2bd";
      ctx.beginPath(); ctx.moveTo(x + w * 0.42, y + h * 0.28); ctx.lineTo(x + w * 0.5, y); ctx.lineTo(x + w * 0.58, y + h * 0.28); ctx.closePath(); ctx.fill();
    } else if (o.def.draw === "pillar") {
      ctx.fillStyle = "#9a917f"; rr(ctx, x, y + 6, w, h - 12, 8);
      ctx.fillStyle = "#7d7466"; ctx.fillRect(x + 8, y + 6, 4, h - 12); ctx.fillRect(x + w - 14, y + 6, 4, h - 12);
      ctx.fillStyle = "#b5ac97"; ctx.fillRect(x, y, w, 10); ctx.fillRect(x, y + h - 10, w, 10);
      ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + 10); ctx.lineTo(x + w * 0.45, y + h - 10); ctx.stroke();
    } else if (o.def.draw === "rubble") {
      ctx.fillStyle = "#7c748c";
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.3, y + h * 0.25); ctx.lineTo(x + w * 0.55, y + h * 0.45); ctx.lineTo(x + w * 0.8, y + h * 0.1); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5d566e";
      ctx.beginPath(); ctx.arc(x + w * 0.32, y + h * 0.62, 9, 0, Math.PI * 2); ctx.arc(x + w * 0.68, y + h * 0.7, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#9d94ad";
      ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.4, 7, 0, Math.PI * 2); ctx.fill();
    } else if (o.def.draw === "barrel") {
      ctx.fillStyle = "#8a5a2e"; rr(ctx, x, y + 4, w, h - 8, 12);
      ctx.fillStyle = "#6e451f"; ctx.fillRect(x, y + h * 0.28, w, 5); ctx.fillRect(x, y + h * 0.62, w, 5);
      ctx.fillStyle = "#a9743c"; ctx.fillRect(x + 8, y + 4, 5, h - 8); ctx.fillRect(x + w - 16, y + 4, 5, h - 8);
      ctx.fillStyle = "#c98f4e"; ctx.fillRect(x + 4, y, w - 8, 6);
    } else if (o.def.draw === "brazier") {
      ctx.fillStyle = "#3a3348"; rr(ctx, x + w * 0.32, y + h * 0.55, w * 0.36, h * 0.45, 4);
      ctx.fillStyle = "#57506a"; rr(ctx, x + 2, y + h * 0.42, w - 4, 12, 6);
      var flick = Math.sin(g.time * 0.35 + x) * 3;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath(); ctx.moveTo(x + w * 0.5, y - 6 + flick); ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.3, x + w * 0.5, y + h * 0.42); ctx.quadraticCurveTo(x + w * 0.15, y + h * 0.3, x + w * 0.5, y - 6 + flick); ctx.fill();
      ctx.fillStyle = "#fde68a";
      ctx.beginPath(); ctx.arc(x + w * 0.5, y + h * 0.28, 6, 0, Math.PI * 2); ctx.fill();
    }
  }
  function drawBg() {
    // The bar, the starting place. Three frames looped so the bartender
    // and patrons move and the neon lights flicker. We never show the
    // full panorama at once: the camera shows a cropped window and pans
    // left across the bar as she walks, then loops back to the entrance.
    var frame = bgImgs[Math.floor(g.time / 14) % bgImgs.length];
    ctx.fillStyle = "#0b0a18";
    ctx.fillRect(0, 0, g.w, g.h);
    if (!frame || !frame.complete || frame.naturalWidth === 0) return;
    var imgW = frame.naturalWidth;
    var imgH = frame.naturalHeight;
    var viewW = Math.min(imgW * 0.64, imgW);
    var viewH = viewW * g.h / g.w;
    if (viewH > imgH) { viewH = imgH; viewW = viewH * g.w / g.h; }
    var panRange = Math.max(1, imgW - viewW);
    var panX = (g.bgX * 0.18) % panRange;
    var scale = g.w / viewW;
    var cropY = 365 - groundY() / scale;
    if (cropY < 0) cropY = 0;
    if (cropY > imgH - viewH) cropY = imgH - viewH;
    ctx.drawImage(frame, panX, cropY, viewW, viewH, 0, 0, g.w, g.h);
    var fg = ctx.createLinearGradient(0, groundY() - 30, 0, g.h);
    fg.addColorStop(0, "rgba(11,10,24,0)");
    fg.addColorStop(1, "rgba(11,10,24,0.35)");
    ctx.fillStyle = fg;
    ctx.fillRect(0, groundY() - 30, g.w, g.h - groundY() + 30);
    var vg = ctx.createLinearGradient(0, 0, g.w, 0);
    vg.addColorStop(0, "rgba(0,0,0,0.35)"); vg.addColorStop(0.12, "rgba(0,0,0,0)"); vg.addColorStop(0.88, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, g.w, g.h);
  }
  function draw() {
    drawBg();
    drawRay();
    g.obstacles.forEach(drawObstacle);
    drawAvatar();
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffffff"; ctx.font = "700 15px 'Open Sans', sans-serif"; ctx.textAlign = "right";
    ctx.fillText("SCORE " + String(Math.floor(g.score)).padStart(4, "0"), g.w - 16, 28);
    ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "600 13px 'Open Sans', sans-serif";
    ctx.fillText("BEST " + String(Math.max(g.high, Math.floor(g.score))).padStart(4, "0"), g.w - 16, 48);
    ctx.restore(); ctx.textAlign = "left";
  }
  function tick() {
    requestAnimationFrame(tick);
    g.time += 1;
    // Ray just wanders the bar, whatever Sylvia is doing.
    var r = g.ray;
    if (r.pause > 0) { r.pause -= 1; }
    else {
      r.x += r.dir * 0.7;
      r.walk += 0.12;
      if (r.x < 160 || r.x > g.w - 260) { r.dir *= -1; r.pause = 60 + Math.random() * 120; }
      else if (Math.random() < 0.002) { r.pause = 90 + Math.random() * 150; }
    }
    if ((g.phase === "ready" || g.phase === "playing") && moving()) {
      if (keys.left) { g.px -= 4.2; g.facing = -1; }
      if (keys.right) { g.px += 4.2; g.facing = 1; }
      if (g.px < 16) g.px = 16;
      if (g.px > g.w - 90) g.px = g.w - 90;
      if (g.phase === "ready") g.run += 1;
    }
    if (g.phase === "playing") {
      g.vy += GRAVITY; g.y += g.vy;
      if (g.y >= charTop()) { g.y = charTop(); g.vy = 0; }
      g.distance += g.speed; g.bgX += g.speed * 0.5; g.score = g.distance / 14;
      g.speed = Math.min(11, 5.2 + g.score * 0.004);
      g.run += g.speed * 0.12;
      g.spawnIn -= g.speed;
      if (g.spawnIn <= 0) { spawnObstacle(); g.spawnIn = 380 + Math.random() * 420; }
      g.obstacles.forEach(function (o) { o.x -= g.speed; });
      g.obstacles = g.obstacles.filter(function (o) { return o.x + o.w > -20; });
      var cx0 = g.px + 16, cx1 = g.px + CHAR_W - 16, cy0 = g.y + 6, cy1 = g.y + CHAR_H - 2;
      for (var i = 0; i < g.obstacles.length; i++) {
        var o = g.obstacles[i];
        var ocx0 = o.x + o.w * 0.15, ocx1 = o.x + o.w * 0.85;
        if (cx1 > ocx0 && cx0 < ocx1 && cy1 > o.y + 4 && cy0 < o.y + o.h) { die(); break; }
      }
    }
    draw();
  }
  requestAnimationFrame(tick);
  window.addEventListener("keydown", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") { keys.left = true; e.preventDefault(); return; }
    if (e.code === "ArrowRight" || e.code === "KeyD") { keys.right = true; e.preventDefault(); return; }
    var isJump = e.code === "Space" || e.code === "ArrowUp" || e.key === " " || e.key === "ArrowUp";
    if (!isJump) return;
    var r = canvas.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    e.preventDefault(); jump();
  });
  window.addEventListener("keyup", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
  });
  canvas.addEventListener("pointerdown", jump);
  document.getElementById("readyBtn").addEventListener("click", jump);
  document.getElementById("againBtn").addEventListener("click", function (e) { e.stopPropagation(); jump(); });
  overOverlay.addEventListener("pointerdown", jump);
})();
