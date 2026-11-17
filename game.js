// Lost Underground — a walk-around game, not a jump game.
// Sylvia walks left and right with A and D or the arrow keys, and
// forward and back on the floor with W and S. Her boyfriend Ray
// just wanders the bar. No obstacles, no jumping, no score.
// Four rooms: the bar, their chamber (far left edge of the bar),
// the Forgotten subway, up the stairs on the bar's right edge,
// and the Shopping District, out the chamber's canal window.
// Ray follows Sylvia between rooms.
// The bar background is shown at full height, cropped only on the
// sides: the camera follows Sylvia across it, so it moves as she walks.
// No build step: open index.html from any static host.
(function () {
  // Rooms: the bar (3 looping frames), their chamber, and the subway.
  // Each is shown at full height, cropped only on the sides.
  // One fixed canvas aspect (4:3) for every room, so the game
  // window never changes size when she walks into another room.
  var CANVAS_ASPECT = 4 / 3;
  var ROOMS = {
    bar: { w: 1179, h: 503, frames: null, floor: 0.90, depth: 0.08 },
    chamber: { w: 1672, h: 941, frames: null, floor: 0.90, depth: 0.06 },
    subway: { w: 2172, h: 724, frames: null, floor: 0.80, depth: 0.05 },
    shopping: { w: 2172, h: 724, frames: null, floor: 0.82, depth: 0.05 },
    repair: { w: 1774, h: 887, frames: null, floor: 0.79, depth: 0.05 },
    clothing: { w: 1983, h: 793, frames: null, floor: 0.80, depth: 0.05 },
    salon: { w: 1774, h: 887, frames: null, floor: 0.78, depth: 0.05 },
    arcade: { w: 2172, h: 724, frames: null, floor: 0.83, depth: 0.05 }
  };
  function room() { return ROOMS[g.room]; }
  var SYLVIA_WALK = ["assets/sylvia-walk-01.png", "assets/sylvia-walk-02.png", "assets/sylvia-walk-03.png", "assets/sylvia-walk-04.png", "assets/sylvia-walk-05.png", "assets/sylvia-walk-06.png", "assets/sylvia-walk-07.png", "assets/sylvia-walk-08.png"];
  var SYLVIA_IDLE_SRC = "assets/sylvia-idle.png";
  var RAY_WALK = ["assets/ray-walk-01.png", "assets/ray-walk-02.png", "assets/ray-walk-03.png", "assets/ray-walk-04.png", "assets/ray-walk-05.png", "assets/ray-walk-06.png", "assets/ray-walk-07.png", "assets/ray-walk-08.png"];
  var RAY_IDLE_SRC = "assets/ray-idle.png";
  var BG_SRCS = ["assets/bg-bar-01.jpg", "assets/bg-bar-02.jpg", "assets/bg-bar-03.jpg"];

  // "?v=3" forces a fresh download after the sprite cleanup and
  // Sylvia's new walk cycle, so a browser that cached the old
  // sprites picks up the new ones.
  function loadImg(src) { var img = new Image(); img.src = src + "?v=3"; return img; }

  var canvas = document.getElementById("game");
  var wrap = document.getElementById("gameWrap");
  var ctx = canvas.getContext("2d");

  var sylviaWalkImgs = SYLVIA_WALK.map(loadImg);
  var sylviaIdleImg = loadImg(SYLVIA_IDLE_SRC);
  var rayWalkImgs = RAY_WALK.map(loadImg);
  var rayIdleImg = loadImg(RAY_IDLE_SRC);
  var kissImg = loadImg("assets/kiss.png");
  var sylviaStanceImg = loadImg("assets/sylvia-stance.png");
  var sylviaKickImg = loadImg("assets/sylvia-kick.png");
  var sylviaCrouchImg = loadImg("assets/sylvia-crouch.png");
  var rayStanceImg = loadImg("assets/ray-stance.png");
  var sylviaFrontWalkImgs = ["assets/sylvia-front-walk-01.png", "assets/sylvia-front-walk-02.png"].map(loadImg);
  var sylviaBackWalkImgs = ["assets/sylvia-back-walk-01.png", "assets/sylvia-back-walk-02.png"].map(loadImg);
  var rayFrontWalkImgs = ["assets/ray-front-walk-01.png", "assets/ray-front-walk-02.png"].map(loadImg);
  var embraceImg = loadImg("assets/embrace.png");
  var rayBackWalkImgs = ["assets/ray-back-walk-01.png", "assets/ray-back-walk-02.png"].map(loadImg);
  var rayPunchImg = loadImg("assets/ray-punch.png");
  var charWalkImgs = ["assets/owner-walk-01.png", "assets/owner-walk-02.png", "assets/owner-walk-03.png", "assets/owner-walk-04.png"].map(loadImg);
  var charIdleImg = loadImg("assets/owner-idle.png");
  var mikeyWalkImgs = ["assets/mikey-walk-01.png", "assets/mikey-walk-02.png", "assets/mikey-walk-03.png", "assets/mikey-walk-04.png"].map(loadImg);
  var mikeyIdleImg = loadImg("assets/mikey-idle.png");
  var gunnerWalkImgs = ["assets/gunner-walk-01.png", "assets/gunner-walk-02.png", "assets/gunner-walk-03.png", "assets/gunner-walk-04.png"].map(loadImg);
  var gunnerIdleImg = loadImg("assets/gunner-idle.png");
  var bgImgs = BG_SRCS.map(loadImg);
  var chamberImg = loadImg("assets/bg-chamber.jpg");
  var sleepImgs = ["assets/sleep-01.jpg", "assets/sleep-02.jpg"].map(loadImg);
  var subwayImg = loadImg("assets/bg-subway.jpg");
  var shoppingImg = loadImg("assets/bg-shopping.jpg");
  var repairImg = loadImg("assets/shop-repair.jpg");
  var clothingImg = loadImg("assets/shop-clothing.jpg");
  var salonImg = loadImg("assets/shop-salon.jpg");
  var arcadeImg = loadImg("assets/shop-arcade.jpg");
  ROOMS.bar.frames = bgImgs;
  ROOMS.chamber.frames = [chamberImg];
  ROOMS.subway.frames = [subwayImg];
  ROOMS.shopping.frames = [shoppingImg];
  ROOMS.repair.frames = [repairImg];
  ROOMS.clothing.frames = [clothingImg];
  ROOMS.salon.frames = [salonImg];
  ROOMS.arcade.frames = [arcadeImg];

  var keys = { up: false, down: false, left: false, right: false };
  var g = {
    w: 0, h: 340, time: 0, camX: 0, room: "chamber",
    // Sylvia, in chamber-world pixels (chamber is 1672 wide, 941 tall).
    // She starts in her own room, by the bed, with Ray beside her.
    px: 950, depth: 0, facing: -1, walk: 0,
    ray: { x: 1020, dir: -1, pause: 0, walk: 0, depth: 0, vdir: 0, fight: { active: false, t: 0 } },
    // Char, the clothing store owner. She only ever stands and walks in
    // the clothing store, never anywhere else.
    char: { x: 1200, dir: -1, pause: 120, walk: 0, depth: 0, vdir: 0 },
    // Mikey, the salon owner. He only ever stands and walks in the
    // salon (the Style Studio), never anywhere else.
    mikey: { x: 900, dir: 1, pause: 120, walk: 0, depth: 0, vdir: 0 },
    // Gunner, the repair shop owner. He only ever stands and walks in
    // the repair shop, never anywhere else.
    gunner: { x: 900, dir: 1, pause: 120, walk: 0, depth: 0, vdir: 0 },
    kiss: { active: false, t: 0 },
    attack: { active: false, t: 0, cooldown: 0 },
    talk: { open: false, idx: -1 },
    hp: 100, hpMax: 100,
    sleeping: false,
    embrace: { active: false, t: 0, cooldown: 0 }
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
  function vickyNear() { return g.room === "bar" && Math.abs(g.px - VICKY_X) < 140; }
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
  function tryAttack() {
    if (g.embrace.active || g.sleeping || g.kiss.active || g.talk.open || g.attack.cooldown > 0) return;
    g.attack.active = true; g.attack.t = 0; g.attack.cooldown = 40;
    g.ray.fight.active = true; g.ray.fight.t = 0; g.ray.pause = 0;
  }
  function fightTargetX() { return g.px + g.facing * 70; }
  // Doors: the bar's left edge leads to the chamber, its right edge
  // (the stairs) leads up to the Forgotten subway. Each room's door
  // back to the bar is on the side you came in through.
  var EXITS = {
    bar: { left: "chamber", right: "subway" },
    chamber: { right: "bar" },
    subway: { left: "bar" },
    shopping: { left: "chamber" },
    repair: { left: "shopping" },
    clothing: { left: "shopping" },
    salon: { left: "shopping" },
    arcade: { left: "shopping" }
  };
  function doorSide() {
    var exits = EXITS[g.room];
    if (exits.left && g.px <= 90) return "left";
    if (exits.right && g.px >= room().w - 90) return "right";
    return null;
  }
  function atDoor() { return doorSide() !== null; }
  function doorLabel() {
    var to = EXITS[g.room][doorSide()];
    if (g.room === "shopping" && to === "chamber") return "Climb back in the window";
    if (to === "chamber") return "Enter your chamber";
    if (to === "subway") return "Go up to the Forgotten subway";
    if (to === "shopping") return "Back to the street";
    return "Back to the bar";
  }
  function doorPrompt() {
    var to = EXITS[g.room][doorSide()];
    if (to === "bar") return "Press E to go back to the bar";
    if (to === "shopping") return "Press E to go back to the street";
    return "Press E to " + doorLabel().charAt(0).toLowerCase() + doorLabel().slice(1);
  }
  // The canal window on the right wall of the chamber (world x,
  // in the 1672-wide room). Walking up to it offers a climb out
  // to the Shopping District, a neon canal street under the ground.
  var WINDOW_X = 1480, WINDOW_RANGE = 90;
  function windowNear() {
    return g.room === "chamber" && Math.abs(g.px - WINDOW_X) < WINDOW_RANGE;
  }
  function climbOutWindow() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.embrace.active) return;
    g.talk.open = false;
    g.room = "shopping";
    g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
    // You climb out on the left side of the street, facing the shops.
    g.px = 110; g.facing = 1;
    g.ray.x = 60; g.ray.dir = 1;
    resize();
    g.camX = 0;
  }
  // The bar door in the Shopping District (world x, in the 2172-wide
  // street). The beer mug over the double doors marks the tavern, and
  // the bar already exists, so this door just leads there.
  var BEER_DOOR_X = 1558, BEER_DOOR_RANGE = 110;
  function beerDoorNear() {
    return g.room === "shopping" && Math.abs(g.px - BEER_DOOR_X) < BEER_DOOR_RANGE;
  }
  function enterBarFromBeerDoor() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.embrace.active) return;
    g.talk.open = false;
    g.room = "bar";
    g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
    // You walk in through the bar door, on the right side of the room,
    // facing the bar and Vicky. Ray comes in just behind you.
    g.px = 850; g.facing = -1;
    g.ray.x = 900; g.ray.dir = -1;
    resize();
    g.camX = Math.max(0, Math.min(worldW() - g.w, g.px * scale() - g.w * 0.38));
  }
  // The four shop doors on the Shopping District street (world x, in
  // the 2172-wide street). Each leads to its own interior room.
  var SHOPS = {
    repair: { doorX: 390, label: "Enter the repair shop", btn: "Repair shop" },
    clothing: { doorX: 740, label: "Enter the clothing store", btn: "Clothing store" },
    salon: { doorX: 1090, label: "Enter the Style Studio", btn: "Style Studio" },
    arcade: { doorX: 1950, label: "Enter the arcade", btn: "Arcade" }
  };
  var SHOP_RANGE = 110;
  function shopNear() {
    if (g.room !== "shopping") return null;
    for (var key in SHOPS) {
      if (Math.abs(g.px - SHOPS[key].doorX) < SHOP_RANGE) return key;
    }
    return null;
  }
  function enterShop(key) {
    if (g.sleeping || g.kiss.active || g.talk.open || g.embrace.active) return;
    g.talk.open = false;
    g.room = key;
    g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
    // You walk in the shop door, on the left side of the room, facing in.
    g.px = 110; g.facing = 1;
    g.ray.x = 60; g.ray.dir = 1;
    resize();
    g.camX = 0;
  }
  function switchRoom() {
    if (g.kiss.active || g.talk.open || g.embrace.active) return;
    var side = doorSide();
    if (!side) return;
    var from = g.room;
    var to = EXITS[g.room][side];
    g.talk.open = false;
    g.room = to;
    g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
    // You come in through the opposite side of the door you left by.
    // Climbing back in from the Shopping District lands at the window.
    var enterRight = side === "left";
    if (from === "shopping" && to === "chamber") {
      g.px = WINDOW_X; g.facing = -1;
      g.ray.x = WINDOW_X - 60; g.ray.dir = -1;
    } else if (SHOPS[from] && to === "shopping") {
      // Walking out of a shop puts you on the street in front of its door.
      g.px = SHOPS[from].doorX; g.facing = 1;
      g.ray.x = SHOPS[from].doorX - 60; g.ray.dir = 1;
    } else if (enterRight) {
      g.px = room().w - 110; g.facing = -1;
      g.ray.x = room().w - 60; g.ray.dir = -1;
    } else {
      g.px = 110; g.facing = 1;
      g.ray.x = 60; g.ray.dir = 1;
    }
    resize();
    if (SHOPS[from] && to === "shopping") {
      g.camX = Math.max(0, Math.min(worldW() - g.w, g.px * scale() - g.w * 0.38));
    } else {
      g.camX = (from === "shopping" && to === "chamber") || enterRight ? Math.max(0, worldW() - g.w) : 0;
    }
  }
  // The bed in the chamber (world x, in the 1672-wide room).
  // Walking up to it offers a sleep, and sleeping recovers her HP.
  var BED_X = 826, BED_RANGE = 180;
  function bedNear() {
    return g.room === "chamber" && Math.abs(g.px - BED_X) < BED_RANGE;
  }
  function goToBed() {
    g.sleeping = true;
    g.attack.active = false; g.talk.open = false;
    // He gets in at the same time, wherever he is: no walking
    // over. He is at her side of the bed, under the covers.
    g.ray.fight.active = false; g.ray.pause = 0;
    g.ray.x = BED_X + 30; g.ray.depth = g.depth; g.ray.inBed = true;
  }
  function wakeUp() { g.sleeping = false; g.ray.inBed = false; }
  function tryEnter() {
    if (g.embrace.active) return;
    if (g.sleeping) { wakeUp(); return; }
    if (bedNear()) { goToBed(); return; }
    if (windowNear()) { climbOutWindow(); return; }
    if (beerDoorNear()) { enterBarFromBeerDoor(); return; }
    var shop = shopNear();
    if (shop) { enterShop(shop); return; }
    if (atDoor()) switchRoom();
  }
  function kissNear() { return Math.abs(g.px - g.ray.x) < 130; }
  function tryKiss() {
    if (g.embrace.active || g.sleeping || g.kiss.active || !kissNear()) return;
    g.kiss.active = true; g.kiss.t = 0;
  }

  function scale() { return g.h / room().h; }
  function worldW() { return room().w * scale(); }
  function groundY() { return g.h * room().floor; }
  function depthRange() { return g.h * room().depth; }
  // The new chamber is a taller room, so they are a touch bigger
  // in there than in the bar (0.44 vs 0.36), but not as big as
  // the 0.52 that was too much before.
  // Chamber scale 0.40: the new brick bedroom's furniture is drawn
  // closer to true size than the old amber room, so they stand a
  // little shorter here than the 0.44 that room needed.
  function sylviaH() { return g.h * (g.room === "chamber" ? 0.40 : 0.36); }
  function rayH() { return sylviaH() * 172 / 148; }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = wrap.clientWidth;
    // Fixed 4:3 canvas for every room, so the window never jumps
    // when she changes rooms. The background is still drawn at full
    // height with no vertical zoom; each room just shows a wider or
    // narrower window of itself, and nothing stretches.
    var h = Math.round(w / CANVAS_ASPECT);
    g.w = w; g.h = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  // Start in the chamber, with the camera already on Sylvia.
  g.camX = Math.max(0, Math.min(worldW() - g.w, g.px * scale() - g.w * 0.38));
  window.addEventListener("resize", resize);

  function drawBg() {
    var frames = room().frames;
    var frame = frames.length > 1 ? frames[Math.floor(g.time / 30) % frames.length] : frames[0];
    // Asleep in the chamber, both of them in bed: the two night
    // frames play, the blanket shifting subtly while they sleep
    // under it. Awake: the normal room.
    if (g.room === "chamber" && g.sleeping && g.ray.inBed) {
      var s0 = sleepImgs[0], s1 = sleepImgs[1];
      if (s0.complete && s0.naturalWidth !== 0 && s1.complete && s1.naturalWidth !== 0) {
        frame = sleepImgs[Math.floor(g.time / 60) % sleepImgs.length];
      }
    }
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
    var img;
    if (g.attack.active) {
      // Stance, then the high kick, then back to stance.
      img = (g.attack.t >= 8 && g.attack.t < 22) ? sylviaKickImg : sylviaStanceImg;
    } else if (keys.up) { img = sylviaBackWalkImgs[Math.floor(g.walk / 6) % sylviaBackWalkImgs.length]; }
    else if (keys.down) { img = sylviaFrontWalkImgs[Math.floor(g.walk / 6) % sylviaFrontWalkImgs.length]; }
    else {
      img = moving ? sylviaWalkImgs[Math.floor(g.walk / 3) % sylviaWalkImgs.length] : sylviaIdleImg;
    }
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
    // Front and back views are never flipped.
    if (g.facing === -1 && img !== sylviaIdleImg && !g.attack.active && !keys.up && !keys.down) ctx.scale(-1, 1);
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
    if (r.inBed) return; // under the covers with her
    var walking = r.pause <= 0;
    var img;
    if (r.fight.active) {
      var nearTarget = Math.abs(r.x - fightTargetX()) < 30;
      img = nearTarget ? rayPunchImg
        : rayWalkImgs[Math.floor(r.walk / 3) % rayWalkImgs.length];
    } else if (r.vdir === -1) { img = rayBackWalkImgs[Math.floor(r.walk / 6) % rayBackWalkImgs.length]; }
    else if (r.vdir === 1) { img = rayFrontWalkImgs[Math.floor(r.walk / 6) % rayFrontWalkImgs.length]; }
    else {
      img = walking ? rayWalkImgs[Math.floor(r.walk / 3) % rayWalkImgs.length] : rayIdleImg;
    }
    if (!img || !img.complete || img.naturalWidth === 0) img = rayIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (r.depth + depthRange()) / depthRange(); // 0 back, 1 front
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + r.depth - 6;
    var x = r.x * scale() - g.camX;
    if (x < -w || x > g.w + w) return;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Ray's frames face right, so flip them when he faces left.
    // When fighting he faces the same way Sylvia does, so his punch
    // goes the same direction as her kick, not back toward her.
    // Front and back views are never flipped.
    var sideView = r.fight.active || r.vdir === 0;
    if (sideView && r.fight.active) { if (g.facing === -1) ctx.scale(-1, 1); }
    else if (sideView && walking && r.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Char, the clothing store owner. She only appears in the clothing
  // store, standing still or walking around it. She never leaves the store.
  function drawChar() {
    if (g.room !== "clothing") return;
    var o = g.char;
    var walking = o.pause <= 0;
    var img = walking ? charWalkImgs[Math.floor(o.walk / 6) % charWalkImgs.length] : charIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = charIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (o.depth + depthRange()) / depthRange(); // 0 back, 1 front
    var h = sylviaH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + o.depth - 6;
    var x = o.x * scale() - g.camX;
    if (x < -w || x > g.w + w) return;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Her walk frames face left, so flip them when she walks right.
    // The idle is a three-quarter front view, never flipped.
    if (walking && o.dir === 1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Mikey, the salon owner. He only appears in the salon (the Style
  // Studio), standing still or walking around it. He never leaves it.
  function drawMikey() {
    if (g.room !== "salon") return;
    var m = g.mikey;
    var walking = m.pause <= 0;
    var img = walking ? mikeyWalkImgs[Math.floor(m.walk / 6) % mikeyWalkImgs.length] : mikeyIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = mikeyIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (m.depth + depthRange()) / depthRange(); // 0 back, 1 front
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + m.depth - 6;
    var x = m.x * scale() - g.camX;
    if (x < -w || x > g.w + w) return;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // His walk frames face right, so flip them when he walks left.
    // The idle is a three-quarter front view, never flipped.
    if (walking && m.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Gunner, the repair shop owner. He only appears in the repair shop,
  // standing still or walking around it. He never leaves it.
  function drawGunner() {
    if (g.room !== "repair") return;
    var n = g.gunner;
    var walking = n.pause <= 0;
    var img = walking ? gunnerWalkImgs[Math.floor(n.walk / 6) % gunnerWalkImgs.length] : gunnerIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = gunnerIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (n.depth + depthRange()) / depthRange(); // 0 back, 1 front
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + n.depth - 6;
    var x = n.x * scale() - g.camX;
    if (x < -w || x > g.w + w) return;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // His walk frames face right, so flip them when he walks left.
    // The idle is a three-quarter front view, never flipped.
    if (walking && n.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function drawEmbrace() {
    if (!embraceImg || !embraceImg.complete || embraceImg.naturalWidth === 0) {
      drawRay();
      if (!g.sleeping) drawSylvia();
      return;
    }
    // He is the taller one, behind her, so the pair is drawn at his height.
    var h = rayH();
    var w = h * (embraceImg.naturalWidth / embraceImg.naturalHeight);
    var feetY = groundY() + g.depth - 6;
    var x = g.px * scale() - g.camX;
    if (x < -w || x > g.w + w) return;
    shadow(x, feetY, w);
    ctx.drawImage(embraceImg, x - w / 2, feetY - h, w, h);
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
    // Speech bubble above Vicky, tail pointing down to her.
    if (!g.talk.open) return;
    var vx = VICKY_X * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(VICKY_LINES[g.talk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("VICKY").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, vx - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, vx));
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx - 9, by + bh - 2);
    ctx.lineTo(tx + 9, by + bh - 2);
    ctx.lineTo(tx, by + bh + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0201a7";
    ctx.font = "700 12px 'Open Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("VICKY", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
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
  function drawDoorPrompt() {
    if (g.kiss.active || g.talk.open || !atDoor()) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = doorPrompt();
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y, tw + 20, 24, 12);
    else ctx.rect(x - tw / 2 - 10, y, tw + 20, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x, y + 17);
    ctx.restore();
  }
  function drawHp() {
    ctx.save();
    ctx.font = "700 11px 'Open Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("HP", 14, 26);
    for (var i = 0; i < 5; i++) {
      var full = g.hp >= (i + 1) * 20;
      var half = !full && g.hp > i * 20;
      var cx = 44 + i * 24, cy = 22;
      drawHeart(cx, cy, 9, full ? "#ff5b8f" : half ? "#ff9ebb" : "rgba(255,255,255,0.25)");
    }
    ctx.restore();
  }
  function drawWindowPrompt() {
    if (g.kiss.active || g.talk.open) return;
    if (!windowNear()) return;
    var x = WINDOW_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to climb out the window";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y, tw + 20, 24, 12);
    else ctx.rect(x - tw / 2 - 10, y, tw + 20, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x, y + 17);
    ctx.restore();
  }
  function drawBeerDoorPrompt() {
    if (g.kiss.active || g.talk.open) return;
    if (!beerDoorNear()) return;
    var x = BEER_DOOR_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to go to the bar";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y, tw + 20, 24, 12);
    else ctx.rect(x - tw / 2 - 10, y, tw + 20, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x, y + 17);
    ctx.restore();
  }
  function drawShopPrompt() {
    if (g.kiss.active || g.talk.open) return;
    var key = shopNear();
    if (!key) return;
    var x = SHOPS[key].doorX * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to " + SHOPS[key].label.charAt(0).toLowerCase() + SHOPS[key].label.slice(1);
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y, tw + 20, 24, 12);
    else ctx.rect(x - tw / 2 - 10, y, tw + 20, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x, y + 17);
    ctx.restore();
  }
  function drawBedPrompt() {
    if (g.kiss.active || g.talk.open) return;
    if (!g.sleeping && !bedNear()) return;
    var x = BED_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = g.sleeping ? "Press E to get up" : "Press E to go to bed";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y, tw + 20, 24, 12);
    else ctx.rect(x - tw / 2 - 10, y, tw + 20, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x, y + 17);
    ctx.restore();
  }
  function draw() {
    drawBg();
    drawHp();
    drawVickyPrompt();
    drawDoorPrompt();
    drawBedPrompt();
    drawWindowPrompt();
    drawBeerDoorPrompt();
    drawShopPrompt();
    if (g.kiss.active) { drawKiss(); drawTalk(); return; }
    if (g.embrace.active) { drawEmbrace(); drawTalk(); return; }
    drawRay();
    drawChar();
    drawMikey();
    drawGunner();
    if (!g.sleeping) drawSylvia();
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
    var enterBtn = document.getElementById("enterBtn");
    if (enterBtn) {
      if (g.sleeping) { enterBtn.hidden = false; enterBtn.textContent = "Get up"; }
      else if (bedNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Go to bed"; }
      else if (windowNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Climb out the window"; }
      else if (beerDoorNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Enter the bar"; }
      else if (shopNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = SHOPS[shopNear()].btn; }
      else if (atDoor() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = doorLabel(); }
      else enterBtn.hidden = true;
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
    if (g.sleeping) {
      // Resting recovers her HP while the sleep gif plays.
      if (g.hp < g.hpMax) g.hp = Math.min(g.hpMax, g.hp + 0.5);
      // A movement key wakes her up, and then walks as normal.
      if (keys.left || keys.right || keys.up || keys.down) wakeUp();
    }
    var speed = 2.2;
    if (keys.left) { g.px -= speed; g.facing = -1; }
    if (keys.right) { g.px += speed; g.facing = 1; }
    if (keys.up) { g.depth -= speed * 0.5; }
    if (keys.down) { g.depth += speed * 0.5; }
    if (g.px < 60) g.px = 60;
    if (g.px > room().w - 60) g.px = room().w - 60;
    if (g.depth < -depthRange()) g.depth = -depthRange();
    if (g.depth > 0) g.depth = 0;
    if (keys.left || keys.right || keys.up || keys.down) g.walk += 0.3;
    // Camera follows Sylvia across the bar.
    var target = g.px * scale() - g.w * 0.38;
    if (target < 0) target = 0;
    if (target > worldW() - g.w) target = worldW() - g.w;
    g.camX += (target - g.camX) * 0.12;
    if (g.attack.cooldown > 0) g.attack.cooldown -= 1;
    if (g.attack.active) {
      g.attack.t += 1;
      if (g.attack.t >= 30) g.attack.active = false;
    }
    // Ray: fights with Sylvia when she attacks, follows her when she
    // gets far away (or into another room), wanders when they are close.
    var r = g.ray;
    if (g.sleeping) {
      // He is in bed with her; he does not move, fight, or wander.
    } else if (r.fight.active) {
      r.fight.t += 1;
      var tx = fightTargetX();
      var dx = tx - r.x;
      if (Math.abs(dx) > 25) {
        r.dir = dx > 0 ? 1 : -1;
        r.x += r.dir * 2.6;
        r.walk += 1;
      }
      if (r.fight.t >= 90) { r.fight.active = false; r.pause = 40; }
    } else if (Math.abs(r.x - g.px) > 320) {
      r.dir = r.x < g.px ? 1 : -1;
      r.x += r.dir * 2.6;
      r.walk += 1;
      r.pause = 0;
    } else if (r.pause > 0) { r.pause -= 1; }
    else {
      r.x += r.dir * 0.9;
      r.walk += 0.3;
      if (r.x < 120 || r.x > room().w - 120) { r.dir *= -1; r.pause = 60 + Math.random() * 120; }
      else if (Math.random() < 0.002) { r.pause = 90 + Math.random() * 150; }
    }
    // Ray walks forward and back with her, staying at her depth.
    var dd = g.depth - r.depth;
    var step = Math.max(-1.2, Math.min(1.2, dd));
    r.depth += step;
    r.vdir = step < -0.05 ? -1 : step > 0.05 ? 1 : 0;
    // Char, the clothing store owner: she only stands and walks in the
    // clothing store, never anywhere else. She wanders it slowly,
    // pausing to look at the racks, and turns at the walls.
    var o = g.char;
    if (g.room === "clothing") {
      if (o.pause > 0) { o.pause -= 1; }
      else {
        o.x += o.dir * 0.8;
        o.walk += 0.3;
        if (o.x < 150 || o.x > room().w - 150) { o.dir *= -1; o.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { o.pause = 90 + Math.random() * 150; }
      }
    }
    // Mikey, the salon owner: he only stands and walks in the salon,
    // never anywhere else. He wanders it slowly, pausing by the chairs,
    // and turns at the walls.
    var m = g.mikey;
    if (g.room === "salon") {
      if (m.pause > 0) { m.pause -= 1; }
      else {
        m.x += m.dir * 0.8;
        m.walk += 0.3;
        if (m.x < 150 || m.x > room().w - 150) { m.dir *= -1; m.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { m.pause = 90 + Math.random() * 150; }
      }
    }
    // Gunner, the repair shop owner: he only stands and walks in the
    // repair shop, never anywhere else. He wanders it slowly, pausing
    // by the workbench, and turns at the walls.
    var n = g.gunner;
    if (g.room === "repair") {
      if (n.pause > 0) { n.pause -= 1; }
      else {
        n.x += n.dir * 0.8;
        n.walk += 0.3;
        if (n.x < 150 || n.x > room().w - 150) { n.dir *= -1; n.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { n.pause = 90 + Math.random() * 150; }
      }
    }
    // When she is standing still and he wanders up right behind
    // her, he holds her for a few seconds, then wanders off again.
    if (g.embrace.cooldown > 0) g.embrace.cooldown -= 1;
    if (g.embrace.active) {
      g.embrace.t += 1;
      var still = !keys.left && !keys.right && !keys.up && !keys.down;
      if (!still || g.embrace.t >= 240) {
        g.embrace.active = false;
        g.embrace.cooldown = 600;
        r.pause = 30;
        r.dir = Math.random() < 0.5 ? -1 : 1;
      }
    } else if (g.room === "chamber" && !g.sleeping && !g.kiss.active && !g.attack.active && !g.talk.open
        && !r.fight.active && g.embrace.cooldown <= 0
        && !keys.left && !keys.right && !keys.up && !keys.down
        && Math.abs(r.x - g.px) < 55 && Math.abs(r.depth - g.depth) < 12) {
      g.embrace.active = true;
      g.embrace.t = 0;
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
    if (e.code === "KeyH") { tryAttack(); return; }
    if (e.code === "KeyE") { tryEnter(); return; }
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
  var attackBtn = document.getElementById("attackBtn");
  if (attackBtn) attackBtn.addEventListener("click", function (e) { e.stopPropagation(); tryAttack(); });
  var enterBtn = document.getElementById("enterBtn");
  if (enterBtn) enterBtn.addEventListener("click", function (e) { e.stopPropagation(); tryEnter(); });
  canvas.addEventListener("pointercancel", pointerEnd);
  canvas.addEventListener("pointerleave", pointerEnd);
})();
