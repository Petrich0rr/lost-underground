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
    arcade: { w: 2172, h: 724, frames: null, floor: 0.83, depth: 0.05 },
    garden: { w: 1179, h: 393, frames: null, floor: 0.81, depth: 0.03 }
  };
  function room() { return ROOMS[g.room]; }
  var SYLVIA_WALK = ["assets/sylvia-walk-01.png", "assets/sylvia-walk-02.png", "assets/sylvia-walk-03.png", "assets/sylvia-walk-04.png", "assets/sylvia-walk-05.png", "assets/sylvia-walk-06.png", "assets/sylvia-walk-07.png", "assets/sylvia-walk-08.png"];
  var SYLVIA_IDLE_SRC = "assets/sylvia-idle.png";
  var RAY_WALK = ["assets/ray-walk-01.png", "assets/ray-walk-02.png", "assets/ray-walk-03.png", "assets/ray-walk-04.png", "assets/ray-walk-05.png", "assets/ray-walk-06.png", "assets/ray-walk-07.png", "assets/ray-walk-08.png"];
  var RAY_IDLE_SRC = "assets/ray-idle.png";
  var BG_SRCS = ["assets/bg-bar-01.jpg", "assets/bg-bar-02.jpg", "assets/bg-bar-03.jpg"];

  // "?v=4" forces a fresh download after the climb animation and
  // Sylvia's new walk cycle, so a browser that cached the old
  // sprites picks up the new ones.
  function loadImg(src) { var img = new Image(); img.src = src + "?v=4"; return img; }

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
  var rayReachImg = loadImg("assets/ray-reach.png");
  var sylviaClimbImg = loadImg("assets/sylvia-pose-sneak.png");
  // The golden mirror at the chamber vanity: she blinks, and when
  // she manifests she shuts her eyes and says an affirmation.
  var mirrorOpenImg = loadImg("assets/mirror-open.jpg");
  var mirrorHalfImg = loadImg("assets/mirror-half.jpg");
  var mirrorClosedImg = loadImg("assets/mirror-closed.jpg");
  var charWalkImgs = ["assets/owner-walk-01.png", "assets/owner-walk-02.png", "assets/owner-walk-03.png", "assets/owner-walk-04.png"].map(loadImg);
  var charIdleImg = loadImg("assets/owner-idle.png");
  var charTalkImg = loadImg("assets/owner-talk.png");
  var mikeyWalkImgs = ["assets/mikey-walk-01.png", "assets/mikey-walk-02.png", "assets/mikey-walk-03.png", "assets/mikey-walk-04.png"].map(loadImg);
  var mikeyIdleImg = loadImg("assets/mikey-idle.png");
  var mikeyTalkImg = loadImg("assets/mikey-talk.png");
  var gunnerWalkImgs = ["assets/gunner-walk-01.png", "assets/gunner-walk-02.png", "assets/gunner-walk-03.png", "assets/gunner-walk-04.png"].map(loadImg);
  var gunnerIdleImg = loadImg("assets/gunner-idle.png");
  var gunnerTalkImg = loadImg("assets/gunner-talk.png");
  // The arcade kids: three regulars who stay in the arcade. Each has
  // an idle portrait and a 4-frame side walk, all facing right.
  var arcadeGamerWalkImgs = ["assets/arcade-gamer-walk-01.png", "assets/arcade-gamer-walk-02.png", "assets/arcade-gamer-walk-03.png", "assets/arcade-gamer-walk-04.png"].map(loadImg);
  var arcadeGamerIdleImg = loadImg("assets/arcade-gamer-idle.png");
  var arcadeDinoWalkImgs = ["assets/arcade-dino-walk-01.png", "assets/arcade-dino-walk-02.png", "assets/arcade-dino-walk-03.png", "assets/arcade-dino-walk-04.png"].map(loadImg);
  var arcadeDinoIdleImg = loadImg("assets/arcade-dino-idle.png");
  var arcadeCupWalkImgs = ["assets/arcade-cup-walk-01.png", "assets/arcade-cup-walk-02.png", "assets/arcade-cup-walk-03.png", "assets/arcade-cup-walk-04.png"].map(loadImg);
  var arcadeCupIdleImg = loadImg("assets/arcade-cup-idle.png");
  var bgImgs = BG_SRCS.map(loadImg);
  var chamberImg = loadImg("assets/bg-chamber.jpg");
  var sleepImgs = ["assets/sleep-01.jpg", "assets/sleep-02.jpg"].map(loadImg);
  var subwayImg = loadImg("assets/bg-subway.jpg");
  var shoppingImg = loadImg("assets/bg-shopping.jpg");
  var repairImg = loadImg("assets/shop-repair.jpg");
  var clothingImg = loadImg("assets/shop-clothing.jpg");
  var salonImg = loadImg("assets/shop-salon.jpg");
  var arcadeImg = loadImg("assets/shop-arcade.jpg");
  var gardenImg = loadImg("assets/bg-garden.jpg");
  ROOMS.bar.frames = bgImgs;
  ROOMS.chamber.frames = [chamberImg];
  ROOMS.subway.frames = [subwayImg];
  ROOMS.shopping.frames = [shoppingImg];
  ROOMS.repair.frames = [repairImg];
  ROOMS.clothing.frames = [clothingImg];
  ROOMS.salon.frames = [salonImg];
  ROOMS.arcade.frames = [arcadeImg];
  ROOMS.garden.frames = [gardenImg];

  var keys = { up: false, down: false, left: false, right: false, fast: false };
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
    // The arcade kids: three regulars who only ever stand and walk in
    // the arcade, never anywhere else.
    kids: {
      gamer: { x: 400, dir: 1, pause: 120, walk: 0 },
      dino: { x: 1000, dir: -1, pause: 60, walk: 0 },
      cup: { x: 1600, dir: 1, pause: 180, walk: 0 }
    },
    kiss: { active: false, t: 0 },
    attack: { active: false, t: 0, cooldown: 0 },
    talk: { open: false, idx: -1 },
    ownerTalk: { open: false, idx: -1, key: null },
    hp: 100, hpMax: 100,
    sleeping: false,
    embrace: { active: false, t: 0, cooldown: 0 },
    // Climbing out the chamber window, or up a staircase: Ray goes
    // first out the window and reaches back for her; on stairs they
    // climb up together. While it plays, the two of them are driven
    // by the climb, not by the keys.
    climb: { active: false, t: 0, kind: null, to: null, baseX: 0, topX: 0, rayStartX: 0, sylStartX: 0, rayY: 0, sylY: 0, rayHidden: false, sylHidden: false },
    // The mirror at the vanity: active while she is looking into it,
    // blink counts a blink in progress, blinkT counts down to the
    // next blink, and manifesting holds her eyes shut on an
    // affirmation for a few seconds.
    mirror: { active: false, blink: 0, blinkT: 200, manifesting: false, manifestT: 0, affirmIdx: 0 }
  };
  // Her affirmations, said to the mirror with her eyes shut. She is
  // girl bossy but shy, and every one of them is optimistic: her life
  // is about to get better, she and Ray are getting out of the
  // sewers, and they will live happily on land, with children up there.
  var AFFIRMATIONS = [
    "My life is about to get so much better. I can feel it.",
    "Ray and I are getting out of these sewers. We will live up there, in the sun.",
    "One day we will have a little house on land. With a garden. And maybe little ones running around.",
    "I am going to make it out of here. I am stronger than this place.",
    "Up there, Ray and I will be happy. Really happy. I know it.",
    "I deserve a life in the light. And I am going to go get it.",
    "Our children will grow up under the sky, not under stone. I will make that happen.",
    "I might be shy, but I am not small. I am going to build a beautiful life up there."
  ];
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
  // Char, the clothing store owner: a fashion diva with a fur coat and
  // a cigar. Dramatic, knows her worth, dresses the whole district.
  var CHAR_LINES = [
    "That blue dress? Divine. I could sell it ten times over down here.",
    "Darling, fashion does not stop just because we are underground.",
    "A lady never rushes a cigar. Or a fitting.",
    "Everything here is one of a kind. Mostly because I made it.",
    "Your boy has shoulders like a coat rack. Bring him by, I will dress him.",
    "The canal ruins the hems. Worth it.",
    "Up there they wear beige. Beige! I would rather stay.",
    "I have dressed three generations of this district. Ask anyone.",
    "You walk like you own the street. Good. Never let them see you hurry.",
    "Vicky pours a fine drink. I only go for the lighting. It is very flattering."
  ];
  // Mikey, the salon owner: fun, loud, obsessed with hair and style.
  // Best chairs underground, worst tips, free gossip.
  var MIKEY_LINES = [
    "Your hair is gorgeous, but I could give it layers that would start a riot.",
    "Best chairs underground. The mirrors are older than the district.",
    "Style is not about money, babe. It is about commitment.",
    "Your man has great hair for a guy who clearly never thinks about it. Unfair.",
    "I have been cutting hair down here since I was sixteen. The tips are terrible, the gossip is free.",
    "Do not let the canal water touch your hair. Trust me on this one.",
    "Upstairs? They have salons with windows. Windows! Imagine the lighting.",
    "Vicky is my best customer. She tips in stories.",
    "You have main character energy. Sit in my chair sometime and I will make it official.",
    "The arcade kids come in here with the wildest hair. I love them."
  ];
  // Gunner, the repair shop owner: warm, handy, keeps the district
  // running. Fixes anything, paid in pie by Vicky.
  var GUNNER_LINES = [
    "If it is broken, I can fix it. If it is not broken, give me ten minutes.",
    "Every tool in here has a story. Most of them involve someone saying watch this.",
    "I have kept this district running for years. Pipes, gears, doors, you name it.",
    "Your fella looks handy. If he ever wants work, my bench is always open.",
    "You look like trouble in a good way. The kind that needs a sturdy door.",
    "The canal floods the lower gears twice a year. I have the waders ready.",
    "The stairs up? I oiled the hinges myself. They will hold.",
    "Vicky's bar runs on my repairs. She pays me in pie. Fair trade.",
    "The garden above the subway? Beautiful place. The waterfall keeps my gears wet, but I cannot complain.",
    "The arcade machines break more than anything else down here. The kids play hard."
  ];
  function ownerLines(key) {
    if (key === "char") return CHAR_LINES;
    if (key === "mikey") return MIKEY_LINES;
    return GUNNER_LINES;
  }
  function vickyNear() { return g.room === "bar" && Math.abs(g.px - VICKY_X) < 140; }
  function talkLine() {
    var idx;
    do { idx = Math.floor(Math.random() * VICKY_LINES.length); }
    while (VICKY_LINES.length > 1 && idx === g.talk.idx);
    g.talk.idx = idx; g.talk.open = true;
  }
  function pressT() {
    if (g.kiss.active || g.climb.active) return;
    if (g.talk.open) { talkLine(); return; }
    if (g.ownerTalk.open) { ownerTalkLine(g.ownerTalk.key); return; }
    if (vickyNear()) talkLine();
    var key = ownerNear();
    if (key) ownerTalkLine(key);
  }
  // The shop owners. Walk up to one and press T to talk: they stop and
  // show their talking pose for a few seconds. No dialogue lines yet.
  var OWNERS = {
    char: { room: "clothing", name: "Char" },
    mikey: { room: "salon", name: "Mikey" },
    gunner: { room: "repair", name: "Gunner" }
  };
  function ownerNear() {
    for (var key in OWNERS) {
      var o = OWNERS[key];
      if (g.room === o.room && Math.abs(g.px - g[key].x) < 150) return key;
    }
    return null;
  }
  function ownerTalkLine(key) {
    var lines = ownerLines(key);
    var idx;
    do { idx = Math.floor(Math.random() * lines.length); }
    while (lines.length > 1 && idx === g.ownerTalk.idx && g.ownerTalk.key === key);
    g.ownerTalk.idx = idx; g.ownerTalk.open = true; g.ownerTalk.key = key;
    var o = g[key];
    o.dir = g.px < o.x ? -1 : 1; // face Sylvia
  }
  function tryAttack() {
    if (g.embrace.active || g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.climb.active || g.attack.cooldown > 0) return;
    g.attack.active = true; g.attack.t = 0; g.attack.cooldown = 40;
    g.ray.fight.active = true; g.ray.fight.t = 0; g.ray.pause = 0;
  }
  function fightTargetX() { return g.px + g.facing * 70; }
  // Doors: the bar's left edge leads to the chamber. Each room's door
  // back is on the side you came in through. Going UP uses the stairs,
  // not the edge: walk to the staircase and press E to climb it.
  var EXITS = {
    bar: { left: "chamber" },
    chamber: { right: "bar" },
    subway: { left: "bar" },
    shopping: { left: "chamber" },
    repair: { left: "shopping" },
    clothing: { left: "shopping" },
    salon: { left: "shopping" },
    arcade: { left: "shopping" },
    garden: { left: "subway" }
  };
  // The staircases that go up: the bar's stone stairs on the right
  // climb to the Forgotten subway, and the subway's wide stairs on
  // the right climb to the garden. Walk to the foot of the stairs
  // and press E, and they climb up together.
  var STAIRS = {
    bar: { baseX: 1070, topX: 1150, to: "subway", label: "Go up the stairs to the Forgotten subway", btn: "Up the stairs" },
    subway: { baseX: 1980, topX: 2120, to: "garden", label: "Go up the stairs to the garden", btn: "Up the stairs" }
  };
  var STAIR_RANGE = 90;
  function stairsNear() {
    var s = STAIRS[g.room];
    if (!s) return null;
    return Math.abs(g.px - s.baseX) < STAIR_RANGE ? g.room : null;
  }
  function climbStairs() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.embrace.active || g.climb.active) return;
    var key = stairsNear();
    if (!key) return;
    g.talk.open = false; g.ownerTalk.open = false;
    var s = STAIRS[key];
    g.climb.active = true; g.climb.t = 0; g.climb.kind = "stairs"; g.climb.to = s.to;
    g.climb.baseX = s.baseX; g.climb.topX = s.topX;
    g.climb.rayStartX = g.ray.x; g.climb.sylStartX = g.px;
    g.climb.rayY = 0; g.climb.sylY = 0;
    g.climb.rayHidden = false; g.climb.sylHidden = false;
  }
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
    if (g.room === "garden" && to === "subway") return "Go back down to the subway";
    if (to === "chamber") return "Enter your chamber";
    if (to === "subway") return "Go up to the Forgotten subway";
    if (to === "garden") return "Go up to the garden";
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
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.embrace.active || g.climb.active) return;
    g.talk.open = false; g.ownerTalk.open = false;
    // Cute climb: Ray goes out first, then reaches back for her,
    // and she climbs up to his hand. The room switches at the end.
    g.climb.active = true; g.climb.t = 0; g.climb.kind = "window"; g.climb.to = "shopping";
    g.climb.rayStartX = g.ray.x; g.climb.sylStartX = g.px;
    g.climb.rayY = 0; g.climb.sylY = 0;
    g.climb.rayHidden = false; g.climb.sylHidden = false;
  }
  // The makeup desk on the left wall of the chamber (world x, in the
  // 1672-wide room). Walk up to it and look in the golden mirror:
  // she blinks once in a while, and the Manifest button shuts her
  // eyes while she says an affirmation.
  var VANITY_X = 300, VANITY_RANGE = 110;
  function vanityNear() {
    return g.room === "chamber" && Math.abs(g.px - VANITY_X) < VANITY_RANGE;
  }
  function enterMirror() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.embrace.active || g.climb.active || g.mirror.active) return;
    if (!vanityNear()) return;
    g.talk.open = false; g.ownerTalk.open = false;
    g.mirror.active = true;
    g.mirror.blink = 0; g.mirror.blinkT = 180 + Math.random() * 120;
    g.mirror.manifesting = false; g.mirror.manifestT = 0;
  }
  function exitMirror() {
    g.mirror.active = false;
    g.mirror.manifesting = false;
  }
  function manifest() {
    if (!g.mirror.active) return;
    g.mirror.affirmIdx = Math.floor(Math.random() * AFFIRMATIONS.length);
    g.mirror.manifesting = true; g.mirror.manifestT = 0;
    g.mirror.blink = 0;
  }
  // One climb, in phases (ticks, 60 a second): Ray runs to the
  // window (0-40), climbs up through it (40-80), then leans back in
  // and reaches for her (80-115). She walks to the window (115-145)
  // and climbs up to his hand (145-180), and then they are out.
  function updateClimb() {
    var c = g.climb;
    c.t += 1;
    if (c.kind === "stairs") { updateStairClimb(); return; }
    var rise = g.h * 0.27; // the window sill above the floor
    if (c.t <= 40) {
      var k = c.t / 40;
      g.ray.dir = (WINDOW_X - 30 - c.rayStartX) >= 0 ? 1 : -1;
      g.ray.x = c.rayStartX + (WINDOW_X - 30 - c.rayStartX) * k;
      g.ray.walk += 1; g.ray.pause = 0;
    } else if (c.t <= 80) {
      var k2 = (c.t - 40) / 40;
      g.ray.x = WINDOW_X - 30; g.ray.dir = 1;
      c.rayY = -rise * k2;
      g.ray.walk += 1;
      if (c.t === 80) c.rayHidden = true;
    } else if (c.t <= 115) {
      c.rayHidden = false;
      g.ray.x = WINDOW_X - 10; g.ray.dir = -1;
      c.rayY = -rise * 0.80;
    } else if (c.t <= 145) {
      var k4 = (c.t - 115) / 30;
      g.px = c.sylStartX + (WINDOW_X - 95 - c.sylStartX) * k4;
      g.facing = 1; g.walk += 1;
    } else if (c.t <= 180) {
      var k5 = (c.t - 145) / 35;
      g.px = WINDOW_X - 95; g.facing = 1;
      c.sylY = -rise * k5;
      g.walk += 1;
      if (c.t === 180) c.sylHidden = true;
    } else {
      c.active = false;
      c.rayY = 0; c.sylY = 0; c.rayHidden = false; c.sylHidden = false;
      g.room = c.to;
      g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
      g.px = 110; g.facing = 1;
      g.ray.x = 60; g.ray.dir = 1;
      resize();
      g.camX = 0;
      return;
    }
    // Keep the camera on the window while they climb.
    var target = WINDOW_X * scale() - g.w * 0.38;
    if (target < 0) target = 0;
    if (target > worldW() - g.w) target = worldW() - g.w;
    g.camX += (target - g.camX) * 0.12;
  }
  // Climbing a staircase together: they walk to the foot of the
  // stairs (0-30), then climb up them side by side (30-90), rising
  // as they go up and to the right, and at the top they are through.
  function updateStairClimb() {
    var c = g.climb;
    var rise = g.h * 0.30; // how high the top of the stairs sits
    if (c.t <= 30) {
      var k = c.t / 30;
      g.px = c.sylStartX + (c.baseX - c.sylStartX) * k;
      g.facing = 1; g.walk += 1;
      g.ray.dir = (c.baseX - 60 - c.rayStartX) >= 0 ? 1 : -1;
      g.ray.x = c.rayStartX + (c.baseX - 60 - c.rayStartX) * k;
      g.ray.walk += 1; g.ray.pause = 0;
    } else if (c.t <= 90) {
      var k2 = (c.t - 30) / 60;
      g.px = c.baseX + (c.topX - c.baseX) * k2;
      g.facing = 1; g.walk += 1;
      g.ray.x = (c.baseX - 60) + (c.topX - c.baseX) * k2;
      g.ray.dir = 1; g.ray.walk += 1;
      c.sylY = -rise * k2;
      c.rayY = -rise * k2;
      if (c.t === 90) { c.sylHidden = true; c.rayHidden = true; }
    } else {
      c.active = false;
      c.rayY = 0; c.sylY = 0; c.rayHidden = false; c.sylHidden = false;
      g.room = c.to;
      g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
      g.px = 110; g.facing = 1;
      g.ray.x = 60; g.ray.dir = 1;
      resize();
      g.camX = 0;
      return;
    }
    // Keep the camera on the stairs while they climb.
    var target = c.topX * scale() - g.w * 0.38;
    if (target < 0) target = 0;
    if (target > worldW() - g.w) target = worldW() - g.w;
    g.camX += (target - g.camX) * 0.12;
  }
  // The bar door in the Shopping District (world x, in the 2172-wide
  // street). The beer mug over the double doors marks the tavern, and
  // the bar already exists, so this door just leads there.
  var BEER_DOOR_X = 1558, BEER_DOOR_RANGE = 110;
  function beerDoorNear() {
    return g.room === "shopping" && Math.abs(g.px - BEER_DOOR_X) < BEER_DOOR_RANGE;
  }
  function enterBarFromBeerDoor() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.embrace.active) return;
    g.talk.open = false; g.ownerTalk.open = false;
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
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.embrace.active) return;
    g.talk.open = false; g.ownerTalk.open = false;
    g.room = key;
    g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
    // You walk in the shop door, on the left side of the room, facing in.
    g.px = 110; g.facing = 1;
    g.ray.x = 60; g.ray.dir = 1;
    resize();
    g.camX = 0;
  }
  function switchRoom() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.embrace.active || g.climb.active) return;
    var side = doorSide();
    if (!side) return;
    var from = g.room;
    var to = EXITS[g.room][side];
    g.talk.open = false; g.ownerTalk.open = false;
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
    g.attack.active = false; g.talk.open = false; g.ownerTalk.open = false;
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
    if (vanityNear()) { enterMirror(); return; }
    if (windowNear()) { climbOutWindow(); return; }
    if (stairsNear()) { climbStairs(); return; }
    if (beerDoorNear()) { enterBarFromBeerDoor(); return; }
    var shop = shopNear();
    if (shop) { enterShop(shop); return; }
    if (atDoor()) switchRoom();
  }
  function kissNear() { return Math.abs(g.px - g.ray.x) < 130; }
  function tryKiss() {
    if (g.embrace.active || g.sleeping || g.kiss.active || g.climb.active || !kissNear()) return;
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
    if (g.climb.active && g.climb.sylHidden) return;
    if (g.climb.active) {
      // Climbing a staircase: she walks up in her side walk frames,
      // rising as she goes. Out the window she waits, then climbs in
      // the sneak pose.
      var cimg = g.climb.kind === "stairs"
        ? sylviaWalkImgs[Math.floor(g.walk / 3) % sylviaWalkImgs.length]
        : (g.climb.t > 115 ? sylviaClimbImg : sylviaIdleImg);
      if (!cimg || !cimg.complete || cimg.naturalWidth === 0) cimg = sylviaIdleImg;
      if (!cimg || !cimg.complete || cimg.naturalWidth === 0) return;
      var ct = (g.depth + depthRange()) / depthRange();
      var ch = sylviaH() * (0.92 + 0.08 * ct);
      var cw = ch * (cimg.naturalWidth / cimg.naturalHeight);
      var cfeet = groundY() + g.depth + g.climb.sylY;
      var cx = g.px * scale() - g.camX;
      shadow(cx, cfeet, cw);
      ctx.save();
      ctx.translate(cx, cfeet - ch / 2);
      if (g.climb.kind === "stairs" && g.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(cimg, -cw / 2, -ch / 2, cw, ch);
      ctx.restore();
      return;
    }
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
    // Her stance and kick face right too, so they flip as well, and she
    // attacks the way she is facing. Front and back views are never flipped.
    if (g.facing === -1 && img !== sylviaIdleImg && !keys.up && !keys.down) ctx.scale(-1, 1);
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
    if (g.climb.active && g.climb.rayHidden) return;
    if (g.climb.active) {
      // Climbing a staircase: he walks up in his walk frames, right
      // behind her. Out the window he runs to it and climbs up in his
      // walk frames, then leans back in and reaches for her.
      var rimg = g.climb.kind === "stairs"
        ? rayWalkImgs[Math.floor(r.walk / 3) % rayWalkImgs.length]
        : (g.climb.t > 80 ? rayReachImg
          : rayWalkImgs[Math.floor(r.walk / 3) % rayWalkImgs.length]);
      if (!rimg || !rimg.complete || rimg.naturalWidth === 0) rimg = rayIdleImg;
      if (!rimg || !rimg.complete || rimg.naturalWidth === 0) return;
      var rt = (r.depth + depthRange()) / depthRange();
      var rh = rayH() * (0.92 + 0.08 * rt);
      var rw = rh * (rimg.naturalWidth / rimg.naturalHeight);
      var rfeet = groundY() + r.depth - 6 + g.climb.rayY;
      var rx = r.x * scale() - g.camX;
      if (rx < -rw || rx > g.w + rw) return;
      shadow(rx, rfeet, rw);
      ctx.save();
      ctx.translate(rx, rfeet - rh / 2);
      // The reach faces right, so flip it when he reaches left for
      // her. The walk frames face right, flip when he runs left.
      if (g.climb.kind === "window" && g.climb.t > 80) ctx.scale(-1, 1);
      else if (r.dir === -1) ctx.scale(-1, 1);
      ctx.drawImage(rimg, -rw / 2, -rh / 2, rw, rh);
      ctx.restore();
      return;
    }
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
    // His punch goes the same way Sylvia faces, so it matches her kick.
    // His walk frames flip by the way he is actually moving, so he never
    // moonwalks while running to her side. Front and back views are never flipped.
    var sideView = r.fight.active || r.vdir === 0;
    if (sideView && img === rayPunchImg) { if (g.facing === -1) ctx.scale(-1, 1); }
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
    var img;
    if (g.ownerTalk.open && g.ownerTalk.key === "char") img = charTalkImg;
    else img = walking ? charWalkImgs[Math.floor(o.walk / 6) % charWalkImgs.length] : charIdleImg;
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
    var img;
    if (g.ownerTalk.open && g.ownerTalk.key === "mikey") img = mikeyTalkImg;
    else img = walking ? mikeyWalkImgs[Math.floor(m.walk / 6) % mikeyWalkImgs.length] : mikeyIdleImg;
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
    var img;
    if (g.ownerTalk.open && g.ownerTalk.key === "gunner") img = gunnerTalkImg;
    else img = walking ? gunnerWalkImgs[Math.floor(n.walk / 6) % gunnerWalkImgs.length] : gunnerIdleImg;
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

  // The arcade kids: three regulars who only ever appear in the
  // arcade, standing still or walking around it. They never leave it.
  // They are kids, so they are a bit shorter than Sylvia.
  function drawArcadeKids() {
    if (g.room !== "arcade") return;
    var imgs = {
      gamer: { walk: arcadeGamerWalkImgs, idle: arcadeGamerIdleImg },
      dino: { walk: arcadeDinoWalkImgs, idle: arcadeDinoIdleImg },
      cup: { walk: arcadeCupWalkImgs, idle: arcadeCupIdleImg }
    };
    var keys = ["gamer", "dino", "cup"];
    for (var i = 0; i < keys.length; i++) {
      var k = g.kids[keys[i]];
      var walking = k.pause <= 0;
      var img = walking ? imgs[keys[i]].walk[Math.floor(k.walk / 6) % imgs[keys[i]].walk.length] : imgs[keys[i]].idle;
      if (!img || !img.complete || img.naturalWidth === 0) img = imgs[keys[i]].idle;
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      var t = (0 + depthRange()) / depthRange(); // depth stays 0, full height
      var h = sylviaH() * 0.85 * (0.92 + 0.08 * t);
      var w = h * (img.naturalWidth / img.naturalHeight);
      var feetY = groundY() - 6;
      var x = k.x * scale() - g.camX;
      if (x < -w || x > g.w + w) continue;
      shadow(x, feetY, w);
      ctx.save();
      ctx.translate(x, feetY - h / 2);
      // Their walk frames face right, so flip them when they walk left.
      // The idle is a three-quarter front view, never flipped.
      if (walking && k.dir === -1) ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
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
  function drawOwnerTalk() {
    // Speech bubble above the shop owner Sylvia is talking to,
    // tail pointing down to them. Mirrors Vicky's bubble.
    if (!g.ownerTalk.open) return;
    var key = g.ownerTalk.key;
    var o = g[key];
    var name = OWNERS[key].name.toUpperCase();
    var ox = o.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(ownerLines(key)[g.ownerTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText(name).width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ox - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ox));
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
    ctx.fillText(name, bx + 16, by + 20);
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
  function drawStairPrompt() {
    if (g.kiss.active || g.talk.open || g.climb.active) return;
    var key = stairsNear();
    if (!key) return;
    var x = STAIRS[key].baseX * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to " + STAIRS[key].label.charAt(0).toLowerCase() + STAIRS[key].label.slice(1);
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
  function drawWindowPrompt() {
    if (g.kiss.active || g.talk.open || g.climb.active) return;
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
  function drawVanityPrompt() {
    if (g.kiss.active || g.talk.open || g.climb.active || g.mirror.active) return;
    if (!vanityNear()) return;
    var x = VANITY_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to look in the mirror";
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
  // The golden mirror, full screen: she blinks once in a while, and
  // while she manifests she keeps her eyes shut on an affirmation.
  function drawMirror() {
    var img = mirrorOpenImg;
    if (g.mirror.manifesting) img = mirrorClosedImg;
    else if (g.mirror.blink > 0) {
      var b = g.mirror.blink;
      if (b <= 3 || b >= 10) img = mirrorHalfImg;
      else img = mirrorClosedImg;
    }
    if (img && img.complete && img.naturalWidth > 0) {
      var s = Math.max(g.w / img.naturalWidth, g.h / img.naturalHeight);
      var w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (g.w - w) / 2, (g.h - h) / 2, w, h);
    } else {
      ctx.fillStyle = "#1a0f1e";
      ctx.fillRect(0, 0, g.w, g.h);
    }
    if (g.mirror.manifesting) {
      var text = AFFIRMATIONS[g.mirror.affirmIdx];
      ctx.save();
      ctx.font = "italic 600 17px Georgia, serif";
      ctx.textAlign = "center";
      var maxW = g.w * 0.78;
      var words = text.split(" ");
      var lines = [], cur = "";
      for (var i = 0; i < words.length; i++) {
        var test = cur ? cur + " " + words[i] : words[i];
        if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = words[i]; }
        else cur = test;
      }
      if (cur) lines.push(cur);
      var lh = 24, pad = 16;
      var boxH = lines.length * lh + pad * 2;
      var boxY = g.h - boxH - 24;
      ctx.fillStyle = "rgba(20, 10, 30, 0.72)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(g.w * 0.11 - 10, boxY, g.w * 0.78 + 20, boxH, 14);
      else ctx.rect(g.w * 0.11 - 10, boxY, g.w * 0.78 + 20, boxH);
      ctx.fill();
      ctx.fillStyle = "#ffe9f2";
      for (var j = 0; j < lines.length; j++) {
        ctx.fillText(lines[j], g.w / 2, boxY + pad + lh * (j + 1) - 6);
      }
      ctx.restore();
    }
    ctx.save();
    ctx.font = "700 12px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var hint = "Press M to manifest  ·  Esc to step away";
    var hw = ctx.measureText(hint).width;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(g.w / 2 - hw / 2 - 10, 8, hw + 20, 20, 10);
    else ctx.rect(g.w / 2 - hw / 2 - 10, 8, hw + 20, 20);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(hint, g.w / 2, 22);
    ctx.restore();
  }
  function draw() {
    if (g.mirror.active) { drawMirror(); return; }
    drawBg();
    drawHp();
    drawVickyPrompt();
    drawDoorPrompt();
    drawBedPrompt();
    drawWindowPrompt();
    drawVanityPrompt();
    drawStairPrompt();
    drawBeerDoorPrompt();
    drawShopPrompt();
    if (g.kiss.active) { drawKiss(); drawTalk(); drawOwnerTalk(); return; }
    if (g.embrace.active) { drawEmbrace(); drawTalk(); drawOwnerTalk(); return; }
    drawRay();
    drawChar();
    drawMikey();
    drawGunner();
    drawArcadeKids();
    if (!g.sleeping) drawSylvia();
    drawTalk();
    drawOwnerTalk();
  }

  function tick() {
    requestAnimationFrame(tick);
    g.time += 1;
    if (g.mirror.active) {
      // Looking in the mirror: she blinks once in a while, and
      // while she manifests she keeps her eyes shut on an
      // affirmation. Nothing else moves until she steps away.
      if (g.mirror.manifesting) {
        g.mirror.manifestT += 1;
        if (g.mirror.manifestT > 260) { g.mirror.manifesting = false; g.mirror.blinkT = 120 + Math.random() * 120; }
      } else if (g.mirror.blink > 0) {
        g.mirror.blink += 1;
        if (g.mirror.blink > 12) { g.mirror.blink = 0; g.mirror.blinkT = 180 + Math.random() * 180; }
      } else {
        g.mirror.blinkT -= 1;
        if (g.mirror.blinkT <= 0) g.mirror.blink = 1;
      }
      var mBtn = document.getElementById("manifestBtn");
      if (mBtn) { mBtn.hidden = false; mBtn.textContent = g.mirror.manifesting ? "Manifesting..." : "Manifest"; }
      var mcBtn = document.getElementById("mirrorCloseBtn");
      if (mcBtn) mcBtn.hidden = false;
      var tBtn2 = document.getElementById("talkBtn");
      if (tBtn2) tBtn2.hidden = true;
      var eBtn2 = document.getElementById("enterBtn");
      if (eBtn2) eBtn2.hidden = true;
      var aBtn2 = document.getElementById("attackBtn");
      if (aBtn2) aBtn2.hidden = true;
      draw();
      return;
    }
    var mBtn0 = document.getElementById("manifestBtn");
    if (mBtn0) mBtn0.hidden = true;
    var mcBtn0 = document.getElementById("mirrorCloseBtn");
    if (mcBtn0) mcBtn0.hidden = true;
    if (g.talk.open && !vickyNear() && Math.abs(g.px - VICKY_X) > 180) g.talk.open = false;
    if (g.ownerTalk.open) {
      var otk = g.ownerTalk.key;
      if (g.room !== OWNERS[otk].room || Math.abs(g.px - g[otk].x) > 180) g.ownerTalk.open = false;
    }
    var talkBtn = document.getElementById("talkBtn");
    if (talkBtn) {
      var nearOwner = ownerNear();
      if (vickyNear()) { talkBtn.hidden = false; talkBtn.textContent = g.talk.open ? "Next" : "Talk to Vicky"; }
      else if (g.ownerTalk.open) { talkBtn.hidden = false; talkBtn.textContent = "Next"; }
      else if (nearOwner) { talkBtn.hidden = false; talkBtn.textContent = "Talk to " + OWNERS[nearOwner].name; }
      else talkBtn.hidden = true;
    }
    var enterBtn = document.getElementById("enterBtn");
    if (enterBtn) {
      if (g.climb.active) { enterBtn.hidden = true; }
      else if (g.sleeping) { enterBtn.hidden = false; enterBtn.textContent = "Get up"; }
      else if (bedNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Go to bed"; }
      else if (vanityNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Look in the mirror"; }
      else if (windowNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Climb out the window"; }
      else if (stairsNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = STAIRS[stairsNear()].btn; }
      else if (beerDoorNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Enter the bar"; }
      else if (shopNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = SHOPS[shopNear()].btn; }
      else if (atDoor() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = doorLabel(); }
      else enterBtn.hidden = true;
    }
    if (g.climb.active) {
      // Climbing out the window: the climb drives them both, and
      // nothing else moves until they are through.
      updateClimb();
      draw();
      return;
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
    var speed = keys.fast ? 4.4 : 2.2;
    if (keys.left) { g.px -= speed; g.facing = -1; }
    if (keys.right) { g.px += speed; g.facing = 1; }
    if (keys.up) { g.depth -= speed * 0.5; }
    if (keys.down) { g.depth += speed * 0.5; }
    if (g.px < 60) g.px = 60;
    if (g.px > room().w - 60) g.px = room().w - 60;
    if (g.depth < -depthRange()) g.depth = -depthRange();
    if (g.depth > 0) g.depth = 0;
    if (keys.left || keys.right || keys.up || keys.down) g.walk += keys.fast ? 0.6 : 0.3;
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
      // He runs too when she is running, so he can still catch her.
      r.x += r.dir * (keys.fast ? 5.2 : 2.6);
      r.walk += keys.fast ? 2 : 1;
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
    if (g.room === "clothing" && !(g.ownerTalk.open && g.ownerTalk.key === "char")) {
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
    if (g.room === "salon" && !(g.ownerTalk.open && g.ownerTalk.key === "mikey")) {
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
    if (g.room === "repair" && !(g.ownerTalk.open && g.ownerTalk.key === "gunner")) {
      if (n.pause > 0) { n.pause -= 1; }
      else {
        n.x += n.dir * 0.8;
        n.walk += 0.3;
        if (n.x < 150 || n.x > room().w - 150) { n.dir *= -1; n.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { n.pause = 90 + Math.random() * 150; }
      }
    }
    // The arcade kids: they only stand and walk in the arcade, never
    // anywhere else. They wander it slowly, pausing by the machines,
    // and turn at the walls.
    if (g.room === "arcade") {
      var kidKeys = ["gamer", "dino", "cup"];
      for (var ki = 0; ki < kidKeys.length; ki++) {
        var kd = g.kids[kidKeys[ki]];
        if (kd.pause > 0) { kd.pause -= 1; }
        else {
          kd.x += kd.dir * 0.8;
          kd.walk += 0.3;
          if (kd.x < 150 || kd.x > room().w - 150) { kd.dir *= -1; kd.pause = 60 + Math.random() * 120; }
          else if (Math.random() < 0.002) { kd.pause = 90 + Math.random() * 150; }
        }
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
    else if (code === "Space") keys.fast = on;
    else return false;
    return true;
  }
  window.addEventListener("keydown", function (e) {
    if (e.code === "KeyK") { tryKiss(); return; }
    if (e.code === "KeyH") { tryAttack(); return; }
    if (e.code === "KeyE") { tryEnter(); return; }
    if (e.code === "KeyT") { pressT(); return; }
    if (e.code === "KeyM") { if (g.mirror.active) manifest(); return; }
    if (e.code === "Escape") { if (g.mirror.active) { exitMirror(); return; } g.talk.open = false; g.ownerTalk.open = false; return; }
    if (g.mirror.active) return;
    if (setKey(e.code, true)) {
      var r = canvas.getBoundingClientRect();
      if (r.bottom >= 0 && r.top <= window.innerHeight) e.preventDefault();
    }
  });
  window.addEventListener("keyup", function (e) { setKey(e.code, false); });
  // Touch and mouse: hold the left or right side of the bar to walk
  // that way. A quick tap or click, without holding, is an attack.
  var pointerDir = 0;
  var pointerDownAt = 0, pointerDownX = 0, pointerDownY = 0;
  function pointerMove(e) {
    var r = canvas.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * g.w;
    var sx = g.px * scale() - g.camX;
    pointerDir = x < sx ? -1 : 1;
    keys.left = pointerDir === -1;
    keys.right = pointerDir === 1;
  }
  canvas.addEventListener("pointerdown", function (e) {
    pointerDownAt = Date.now();
    pointerDownX = e.clientX; pointerDownY = e.clientY;
    pointerMove(e);
  });
  canvas.addEventListener("pointermove", function (e) { if (e.buttons) pointerMove(e); });
  function pointerEnd(e) {
    pointerDir = 0; keys.left = false; keys.right = false;
    if (e && e.clientX !== undefined && pointerDownAt) {
      var dt = Date.now() - pointerDownAt;
      var moved = Math.max(Math.abs(e.clientX - pointerDownX), Math.abs(e.clientY - pointerDownY));
      if (dt < 250 && moved < 12) tryAttack();
    }
    pointerDownAt = 0;
  }
  canvas.addEventListener("pointerup", pointerEnd);
  var talkBtn = document.getElementById("talkBtn");
  if (talkBtn) talkBtn.addEventListener("click", function (e) { e.stopPropagation(); pressT(); });
  var attackBtn = document.getElementById("attackBtn");
  if (attackBtn) attackBtn.addEventListener("click", function (e) { e.stopPropagation(); tryAttack(); });
  var enterBtn = document.getElementById("enterBtn");
  if (enterBtn) enterBtn.addEventListener("click", function (e) { e.stopPropagation(); tryEnter(); });
  var manifestBtn = document.getElementById("manifestBtn");
  if (manifestBtn) manifestBtn.addEventListener("click", function (e) { e.stopPropagation(); manifest(); });
  var mirrorCloseBtn = document.getElementById("mirrorCloseBtn");
  if (mirrorCloseBtn) mirrorCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); exitMirror(); });
  canvas.addEventListener("pointercancel", pointerEnd);
  canvas.addEventListener("pointerleave", pointerEnd);
})();
