// Lost Underground — a walk-around game, not a jump game.
// Sylvia walks the bar with WASD or arrow keys. Her boyfriend Ray
// just wanders the bar. No obstacles, no jumping, no score.
// The bar background is shown at full height, cropped only on the
// sides: the camera follows Sylvia across it, so it moves as she walks.
// No build step: open index.html from any static host.
(function () {
  var BG_W = 1179, BG_H = 503;
  var VIEW_W = BG_W * 0.60; // cropped window, full height, sides only
  var SYLVIA_WALK = ["assets/sylvia-walk-01.png", "assets/sylvia-walk-02.png", "assets/sylvia-walk-03.png", "assets/sylvia-walk-04.png", "assets/sylvia-walk-05.png", "assets/sylvia-walk-06.png", "assets/sylvia-walk-07.png", "assets/sylvia-walk-08.png"];
  var SYLVIA_IDLE_SRC = "assets/sylvia-idle.png";
  var RAY_WALK = ["assets/ray-walk-01.png", "assets/ray-walk-02.png", "assets/ray-walk-03.png", "assets/ray-walk-04.png", "assets/ray-walk-05.png", "assets/ray-walk-06.png", "assets/ray-walk-07.png", "assets/ray-walk-08.png"];
  var RAY_IDLE_SRC = "assets/ray-idle.png";
  var BG_SRCS = ["assets/bg-bar-01.jpg", "assets/bg-bar-02.jpg", "assets/bg-bar-03.jpg"];

  function loadImg(src) { var img = new Image(); img.src = src; return img; }

  var canvas = document.getElementById("game");
  var wrap = document.getElementById("gameWrap");
  var ctx = canvas.getContext("2d");

  var sylviaWalkImgs = SYLVIA_WALK.map(loadImg);
  var sylviaIdleImg = loadImg(SYLVIA_IDLE_SRC);
  var rayWalkImgs = RAY_WALK.map(loadImg);
  var rayIdleImg = loadImg(RAY_IDLE_SRC);
  var kissImg = loadImg("assets/kiss.png");
  var bgImgs = BG_SRCS.map(loadImg);

  var keys = { up: false, down: false, left: false, right: false };
  var g = {
    w: 0, h: 340, time: 0, camX: 0,
    // Sylvia, in bar-world pixels (bar is 1179 wide, 503 tall).
    px: 220, depth: 0, facing: 1, walk: 0,
    ray: { x: 700, dir: -1, pause: 0, walk: 0 },
    kiss: { active: false, t: 0 },
    talk: { open: false, idx: -1 }
  };
  var VICKY_X = 560; // the bartender in the background, behind the bar
  var VICKY_LINES = [
    "You're new. I can tell. The new ones always stare at the ceiling like it's gonna open up.",
    "If you're looking for a way out, take the stairs on the right. They go up. Nobody ever comes back down to tell me what's up there, though.",
    "I've been pouring drinks in this basement since I was old enough to reach the top shelf. My mom worked this bar before me. Her mom before that.",
    "House rules: no fighting, no crying, no asking about the stairs. Okay, you can ask about the stairs.",
    "Everybody down here is looking for the exit. Most of them just order another drink instead.",
    "That dress? Bold choice for a basement. I respect it.",
    "Ray's been in here three times this week looking for you. He's sweet. Don't tell him I said that.",
    "The tunnel past the jukebox leads out. Or deeper. Honestly, I've never checked. Somebody has to stay and pour.",
    "You two are cute. Gross, but cute.",
    "Been here most of my life. The taps have never once run dry. Weird, right?"
  ];
  function vickyNear() { return Math.abs(g.px - VICKY_X) < 140; }
  function talkLine() {
    var idx;
    do { idx = Math.floor(Math.random() * VICKY_LINES.length); }
    while (VICKY_LINES.length > 1 && idx === g.talk.idx);
    g.talk.idx = idx; g.talk.open = true;
  }
  function pressT() {
    if (g.kiss.active) return;
    if (g.talk.open) { talkLine(); return; }
    if (vickyNear()) talkLine();
  }
  function kissNear() { return Math.abs(g.px - g.ray.x) < 130; }
  function tryKiss() {
    if (g.kiss.active || !kissNear()) return;
    g.kiss.active = true; g.kiss.t = 0;
  }

  function scale() { return g.h / BG_H; }
  function worldW() { return BG_W * scale(); }
  function groundY() { return g.h - g.h * 0.10; }
  function depthRange() { return g.h * 0.08; }
  function sylviaH() { return g.h * 0.36; }
  function rayH() { return sylviaH() * 172 / 148; }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = wrap.clientWidth;
    // Full bar height, cropped on the sides only: the canvas aspect
    // matches the cropped window (707 x 503), so nothing zooms
    // vertically and nothing stretches.
    var h = Math.round(w * BG_H / VIEW_W);
    g.w = w; g.h = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  function drawBg() {
    var frame = bgImgs[Math.floor(g.time / 30) % bgImgs.length];
    ctx.fillStyle = "#0b0a18";
    ctx.fillRect(0, 0, g.w, g.h);
    if (!frame || !frame.complete || frame.naturalWidth === 0) return;
    // Drawn at the same scale in both directions, full height,
    // shifted left by the camera. No vertical zoom.
    ctx.drawImage(frame, -g.camX, 0, worldW(), g.h);
    var vg = ctx.createLinearGradient(0, 0, g.w, 0);
    vg.addColorStop(0, "rgba(0,0,0,0.3)"); vg.addColorStop(0.1, "rgba(0,0,0,0)"); vg.addColorStop(0.9, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, g.w, g.h);
  }

  function shadow(x, feetY, w) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(x, feetY + 4, w * 0.32, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSylvia() {
    var moving = keys.left || keys.right || keys.up || keys.down;
    var img = moving ? sylviaWalkImgs[Math.floor(g.walk / 3) % sylviaWalkImgs.length] : sylviaIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = sylviaIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (g.depth + depthRange()) / depthRange(); // 0 back, 1 front
    var h = sylviaH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + g.depth;
    var x = g.px * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Sylvia's walk frames face right, so flip them when she faces left.
    if (g.facing === -1 && img !== sylviaIdleImg) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function drawHeart(x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.5, x - s * 0.45, y - s * 1.1, x, y - s * 0.4);
    ctx.bezierCurveTo(x + s * 0.45, y - s * 1.1, x + s, y - s * 0.5, x, y + s * 0.35);
    ctx.fill();
  }

  function drawKiss() {
    // Erika's kiss artwork replaces both characters for the kiss.
    // In the image Sylvia is on the left and Ray on the right, so
    // flip it when Sylvia is on the right of Ray.
    if (!kissImg || !kissImg.complete || kissImg.naturalWidth === 0) return;
    var h = rayH();
    var w = h * (kissImg.naturalWidth / kissImg.naturalHeight);
    var feetY = groundY() - 6;
    var mx = (g.px + g.ray.x) / 2 * scale() - g.camX;
    shadow(mx, feetY, w);
    ctx.save();
    ctx.translate(mx, feetY - h / 2);
    if (g.px > g.ray.x) ctx.scale(-1, 1);
    ctx.drawImage(kissImg, -w / 2, -h / 2, w, h);
    ctx.restore();
    var my = feetY - h - 22 + Math.sin(g.kiss.t * 0.12) * 4;
    drawHeart(mx, my, 11 + Math.sin(g.kiss.t * 0.2) * 2, "#ff5c8a");
  }

  function drawRay() {
    var r = g.ray;
    var walking = r.pause <= 0;
    var img = walking ? rayWalkImgs[Math.floor(r.walk / 3) % rayWalkImgs.length] : rayIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = rayIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var h = rayH();
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() - 6;
    var x = r.x * scale() - g.camX;
    if (x < -w || x > g.w + w) return;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Ray's walk frames face right, so flip them when he walks left.
    if (walking && r.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (kissNear()) {
      var px = r.x * scale() - g.camX;
      ctx.save();
      ctx.font = "700 13px 'Open Sans', sans-serif";
      ctx.textAlign = "center";
      var label = "Press K";
      var tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px - tw / 2 - 10, groundY() - rayH() - 34, tw + 20, 24, 12);
      else ctx.rect(px - tw / 2 - 10, groundY() - rayH() - 34, tw + 20, 24);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, px, groundY() - rayH() - 17);
      ctx.restore();
    }
  }

  function wrapText(text, maxW) {
    var words = text.split(" ");
    var lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = words[i]; }
      else { line = test; }
    }
    if (line) lines.push(line);
    return lines;
  }
  function drawTalk() {
    if (!g.talk.open) return;
    var bx = 16, bw = g.w - 32, bh = 84, by = g.h - bh - 12;
    ctx.save();
    ctx.fillStyle = "rgba(10,8,24,0.92)";
    ctx.strokeStyle = "#0201a7"; ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#7aa2ff";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("VICKY", bx + 16, by + 22);
    ctx.fillStyle = "#ffffff";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(VICKY_LINES[g.talk.idx], bw - 32);
    for (var i = 0; i < lines.length; i++) ctx.fillText(lines[i], bx + 16, by + 44 + i * 18);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more, walk away to leave", bx + bw - 14, by + bh - 10);
    ctx.restore();
  }
  function drawVickyPrompt() {
    if (g.talk.open || !vickyNear()) return;
    var vx = VICKY_X * scale() - g.camX;
    var vy = g.h * 0.34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press T to talk";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(vx - tw / 2 - 10, vy, tw + 20, 24, 12);
    else ctx.rect(vx - tw / 2 - 10, vy, tw + 20, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, vx, vy + 17);
    ctx.restore();
  }
  function draw() {
    drawBg();
    drawVickyPrompt();
    if (g.kiss.active) { drawKiss(); drawTalk(); return; }
    drawRay();
    drawSylvia();
    drawTalk();
  }

  function tick() {
    requestAnimationFrame(tick);
    g.time += 1;
    if (g.talk.open && !vickyNear() && Math.abs(g.px - VICKY_X) > 180) g.talk.open = false;
    var talkBtn = document.getElementById("talkBtn");
    if (talkBtn) {
      if (vickyNear()) { talkBtn.hidden = false; talkBtn.textContent = g.talk.open ? "Next" : "Talk to Vicky"; }
      else talkBtn.hidden = true;
    }
    if (g.kiss.active) {
      g.kiss.t += 1;
      // Face each other and lean in until cheek to cheek.
      g.facing = g.ray.x > g.px ? 1 : -1;
      var gap = g.ray.x - g.px;
      if (Math.abs(gap) > 55) {
        var step = gap > 0 ? 0.8 : -0.8;
        g.px += step; g.ray.x -= step;
      }
      if (g.kiss.t >= 120) { g.kiss.active = false; g.ray.pause = 60; }
      draw();
      return;
    }
    var speed = 2.2;
    if (keys.left) { g.px -= speed; g.facing = -1; }
    if (keys.right) { g.px += speed; g.facing = 1; }
    if (keys.up) { g.depth -= speed * 0.5; }
    if (keys.down) { g.depth += speed * 0.5; }
    if (g.px < 60) g.px = 60;
    if (g.px > BG_W - 60) g.px = BG_W - 60;
    if (g.depth < -depthRange()) g.depth = -depthRange();
    if (g.depth > 0) g.depth = 0;
    if (keys.left || keys.right || keys.up || keys.down) g.walk += 0.3;
    // Camera follows Sylvia across the bar.
    var target = g.px * scale() - g.w * 0.38;
    if (target < 0) target = 0;
    if (target > worldW() - g.w) target = worldW() - g.w;
    g.camX += (target - g.camX) * 0.12;
    // Ray just wanders the bar.
    var r = g.ray;
    if (r.pause > 0) { r.pause -= 1; }
    else {
      r.x += r.dir * 0.9;
      r.walk += 0.3;
      if (r.x < 120 || r.x > BG_W - 120) { r.dir *= -1; r.pause = 60 + Math.random() * 120; }
      else if (Math.random() < 0.002) { r.pause = 90 + Math.random() * 150; }
    }
    draw();
  }
  requestAnimationFrame(tick);

  function setKey(code, on) {
    if (code === "ArrowLeft" || code === "KeyA") keys.left = on;
    else if (code === "ArrowRight" || code === "KeyD") keys.right = on;
    else if (code === "ArrowUp" || code === "KeyW") keys.up = on;
    else if (code === "ArrowDown" || code === "KeyS") keys.down = on;
    else return false;
    return true;
  }
  window.addEventListener("keydown", function (e) {
    if (e.code === "KeyK") { tryKiss(); return; }
    if (e.code === "KeyT") { pressT(); return; }
    if (e.code === "Escape") { g.talk.open = false; return; }
    if (setKey(e.code, true)) {
      var r = canvas.getBoundingClientRect();
      if (r.bottom >= 0 && r.top <= window.innerHeight) e.preventDefault();
    }
  });
  window.addEventListener("keyup", function (e) { setKey(e.code, false); });
  // Touch: hold the left or right side of the bar to walk that way.
  var pointerDir = 0;
  function pointerMove(e) {
    var r = canvas.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * g.w;
    var sx = g.px * scale() - g.camX;
    pointerDir = x < sx ? -1 : 1;
    keys.left = pointerDir === -1;
    keys.right = pointerDir === 1;
  }
  canvas.addEventListener("pointerdown", function (e) { pointerMove(e); });
  canvas.addEventListener("pointermove", function (e) { if (e.buttons) pointerMove(e); });
  function pointerEnd() { pointerDir = 0; keys.left = false; keys.right = false; }
  canvas.addEventListener("pointerup", pointerEnd);
  var talkBtn = document.getElementById("talkBtn");
  if (talkBtn) talkBtn.addEventListener("click", function (e) { e.stopPropagation(); pressT(); });
  canvas.addEventListener("pointercancel", pointerEnd);
  canvas.addEventListener("pointerleave", pointerEnd);
})();
