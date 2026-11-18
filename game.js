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
    cistern: { w: 2172, h: 724, frames: null, floor: 0.77, depth: 0.02 },
    quarry: { w: 2172, h: 724, frames: null, floor: 0.87, depth: 0.04 },
    tunnels: { w: 2172, h: 724, frames: null, floor: 0.83, depth: 0.04 },
    dungeon: { w: 2172, h: 724, frames: null, floor: 0.84, depth: 0.04 },
    upper1: { w: 2172, h: 724, frames: null, floor: 0.82, depth: 0.03 },
    upper2: { w: 2172, h: 724, frames: null, floor: 0.82, depth: 0.03 },
    upper3: { w: 2172, h: 724, frames: null, floor: 0.82, depth: 0.03 }
  };
  function room() { return ROOMS[g.room]; }
  var SYLVIA_WALK = ["assets/sylvia-walk-01.png", "assets/sylvia-walk-02.png", "assets/sylvia-walk-03.png", "assets/sylvia-walk-04.png", "assets/sylvia-walk-05.png", "assets/sylvia-walk-06.png", "assets/sylvia-walk-07.png", "assets/sylvia-walk-08.png"];
  var SYLVIA_IDLE_SRC = "assets/sylvia-idle.png";
  var RAY_WALK = ["assets/ray-walk-01.png", "assets/ray-walk-02.png", "assets/ray-walk-03.png", "assets/ray-walk-04.png", "assets/ray-walk-05.png", "assets/ray-walk-06.png", "assets/ray-walk-07.png", "assets/ray-walk-08.png"];
  var RAY_IDLE_SRC = "assets/ray-idle.png";
  var BG_SRCS = ["assets/bg-bar-01.jpg", "assets/bg-bar-02.jpg", "assets/bg-bar-03.jpg"];

  // "?v=14" forces a fresh download after every room gets its own
  // little intro line at the top when she walks in, so a browser
  // that cached ?v=13 picks up the new code.
  function loadImg(src) { var img = new Image(); img.src = src + "?v=14"; return img; }

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
  var rayTalkImg = loadImg("assets/ray-talk.png");
  var rayTalkShyImg = loadImg("assets/ray-talk-shy.png");
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
  var cisternImg = loadImg("assets/bg-cistern.jpg");
  var quarryImg = loadImg("assets/bg-quarry.jpg");
  var tunnelsImg = loadImg("assets/bg-tunnels.jpg");
  var dungeonImg = loadImg("assets/bg-dungeon.jpg");
  var upper1Img = loadImg("assets/bg-upper1.jpg");
  var upper2Img = loadImg("assets/bg-upper2.jpg");
  var upper3Img = loadImg("assets/bg-upper3.jpg");
  // Random junk scattered around the underground: papers that can
  // hint at the way up, and the rest just trash. They only appear
  // in the deep underground rooms, never in the chamber, the shops
  // or the Upper Levels.
  var propPaperImg = loadImg("assets/prop-paper.png");
  var propNewspaperImg = loadImg("assets/prop-newspaper.png");
  var propTakeoutImg = loadImg("assets/prop-takeout.png");
  var propCanImg = loadImg("assets/prop-can.png");
  var propGlassImg = loadImg("assets/prop-glass.png");
  var propGrateImg = loadImg("assets/prop-grate.png");
  var propValveImg = loadImg("assets/prop-valve.png");
  var propBucketImg = loadImg("assets/prop-bucket.png");
  var propChainImg = loadImg("assets/prop-chain.png");
  var propLanternImg = loadImg("assets/prop-lantern.png");
  var propBundleImg = loadImg("assets/prop-bundle.png");
  var propKeyImg = loadImg("assets/prop-key.png");
  var propCassetteImg = loadImg("assets/prop-cassette.png");
  var propTokenImg = loadImg("assets/prop-token.png");
  var propBootImg = loadImg("assets/prop-boot.png");
  var propRubbleImg = loadImg("assets/prop-rubble.png");
  var propPuddleImg = loadImg("assets/prop-puddle.png");
  var propMushroomImg = loadImg("assets/prop-mushroom.png");
  var propCrystalImg = loadImg("assets/prop-crystal.png");
  var propSackImg = loadImg("assets/prop-sack.png");
  // The midair descent: Ray and Sylvia jumping down to the quarry,
  // holding hands. Shown full screen while they fall through the
  // secret passage under the arcade floor.
  var descentImg = loadImg("assets/descent.jpg");
  // The portal tunnel: a dark tunnel mouth with wooden beams and
  // fallen rocks. Shown full screen while they pass through it on
  // the way up from the Ancient Dungeon to the Flooded Cistern.
  var portalTunnelImg = loadImg("assets/portal-tunnel.jpg");
  var rayCrouchImg = loadImg("assets/ray-crouch.png");
  ROOMS.bar.frames = bgImgs;
  ROOMS.chamber.frames = [chamberImg];
  ROOMS.subway.frames = [subwayImg];
  ROOMS.shopping.frames = [shoppingImg];
  ROOMS.repair.frames = [repairImg];
  ROOMS.clothing.frames = [clothingImg];
  ROOMS.salon.frames = [salonImg];
  ROOMS.arcade.frames = [arcadeImg];
  ROOMS.cistern.frames = [cisternImg];
  ROOMS.quarry.frames = [quarryImg];
  ROOMS.tunnels.frames = [tunnelsImg];
  ROOMS.dungeon.frames = [dungeonImg];
  ROOMS.upper1.frames = [upper1Img];
  ROOMS.upper2.frames = [upper2Img];
  ROOMS.upper3.frames = [upper3Img];
  // Scattered junk on the floor of the deep underground rooms.
  // x is world px, d is depth across the floor band (0 back, 1
  // front), h is the height in canvas px. name and text make a prop
  // readable: walk up and press E or I to inspect it. The papers
  // can hint at the way up; the rest is just trash down here.
  var PROPS = {
    bar: [
      { img: propBucketImg, x: 180, d: 0.9, h: 52, name: "Rusty bucket", text: "A rusty bucket. It has seen better days." },
      { img: propPaperImg, x: 300, d: 0.6, h: 32, name: "Crumpled paper", text: "A crumpled paper ball. Someone wrote I HATE IT HERE on it, then crossed it out and wrote I hate it here again, smaller." },
      { img: propCanImg, x: 420, d: 0.8, h: 34, name: "Crushed can", text: "A crushed can. Someone was very thirsty down here once." },
      { img: propGlassImg, x: 720, d: 0.5, h: 32, name: "Broken glass", text: "Broken green glass. Careful where you step." },
      { img: propLanternImg, x: 950, d: 0.7, h: 60, name: "Old lantern", text: "A lantern with a blue flame. It still burns, somehow." }
    ],
    subway: [
      { img: propNewspaperImg, x: 300, d: 0.6, h: 48, name: "Soggy newspaper", text: "A soggy newspaper. The headline is smudged, but one line is still clear: THE SURFACE IS REAL. Three floors up, and the sky is waiting." },
      { img: propTakeoutImg, x: 650, d: 0.8, h: 50, name: "Takeout box", text: "An old takeout box. Whatever was in it has long since given up." },
      { img: propGrateImg, x: 1000, d: 0.5, h: 60, name: "Rusted grate", text: "A rusted grate. Something used to flow through here." },
      { img: propChainImg, x: 1300, d: 0.7, h: 40, name: "Broken chain", text: "A broken chain. Whatever it held is long gone." },
      { img: propRubbleImg, x: 1600, d: 0.6, h: 62, name: "Rubble", text: "A pile of rubble. The ceiling is always falling, a little at a time." },
      { img: propPuddleImg, x: 1800, d: 0.9, h: 40, name: "Dark puddle", text: "A still puddle. The water is dark and does not reflect much." }
    ],
    cistern: [
      { img: propBundleImg, x: 350, d: 0.6, h: 52, name: "Bundle of papers", text: "A bundle of old papers tied with string. The top sheet says: Upper Level 1 is blue and cold. Level 2 is violet and quiet. Level 3 is white, and it watches you." },
      { img: propValveImg, x: 750, d: 0.7, h: 62, name: "Valve wheel", text: "A rusted valve wheel. It has not turned in years." },
      { img: propBucketImg, x: 1150, d: 0.5, h: 52, name: "Rusty bucket", text: "A rusty bucket. It has seen better days." },
      { img: propMushroomImg, x: 1550, d: 0.8, h: 56, name: "Pale mushrooms", text: "Pale mushrooms growing on a rock. They glow faintly. Probably best not to eat them." },
      { img: propCrystalImg, x: 1900, d: 0.6, h: 58, name: "Pale crystals", text: "A cluster of pale crystals. They catch the light and throw it back in pieces." }
    ],
    quarry: [
      { img: propCrystalImg, x: 300, d: 0.7, h: 58, name: "Pale crystals", text: "A cluster of pale crystals. They catch the light and throw it back in pieces." },
      { img: propRubbleImg, x: 700, d: 0.5, h: 62, name: "Rubble", text: "A pile of rubble. The ceiling is always falling, a little at a time." },
      { img: propSackImg, x: 1100, d: 0.8, h: 60, name: "Torn sack", text: "A torn sack. Whatever was in it spilled out long ago." },
      { img: propPaperImg, x: 1450, d: 0.6, h: 32, name: "Torn page", text: "A torn page from someone's journal. The stairs past the subway go UP. Three levels. Blue, then violet, then white. The top one is where they keep the way out. Something guards it. Do not go unprepared." },
      { img: propBootImg, x: 1800, d: 0.7, h: 48, name: "Worn boot", text: "A worn boot with a hole in it. Someone walked a long way in this." }
    ],
    tunnels: [
      { img: propKeyImg, x: 300, d: 0.6, h: 44, name: "Old key", text: "An old key. It does not fit any door you know." },
      { img: propCassetteImg, x: 650, d: 0.8, h: 50, name: "Cracked cassette", text: "A cracked cassette tape. The music is gone, but the ribbon remembers." },
      { img: propTokenImg, x: 1000, d: 0.5, h: 44, name: "Arcade token", text: "An arcade token. It has a little machine stamped on it. Worthless up there, priceless down here." },
      { img: propBootImg, x: 1250, d: 0.7, h: 48, name: "Worn boot", text: "A worn boot with a hole in it. Someone walked a long way in this." },
      { img: propGlassImg, x: 1700, d: 0.6, h: 32, name: "Broken glass", text: "Broken green glass. Careful where you step." },
      { img: propBundleImg, x: 1950, d: 0.8, h: 52, name: "Bundle of papers", text: "A bundle of papers tied with string. It is just a shopping list. Milk, bread, candles, rope. The rope is underlined three times." }
    ],
    dungeon: [
      { img: propLanternImg, x: 300, d: 0.7, h: 60, name: "Old lantern", text: "A lantern with a blue flame. It still burns, somehow." },
      { img: propSackImg, x: 700, d: 0.8, h: 60, name: "Torn sack", text: "A torn sack. Whatever was in it spilled out long ago." },
      { img: propRubbleImg, x: 1100, d: 0.5, h: 62, name: "Rubble", text: "A pile of rubble. The ceiling is always falling, a little at a time." },
      { img: propNewspaperImg, x: 1450, d: 0.6, h: 48, name: "Wet newspaper", text: "A wet newspaper. The only readable bit is a crossword, half finished, and every answer is wrong." },
      { img: propValveImg, x: 1750, d: 0.6, h: 62, name: "Valve wheel", text: "A rusted valve wheel. It has not turned in years." }
    ]
  };

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
    kidTalk: { open: false, idx: -1, key: null },
    // Talking to Ray: open while the conversation runs. step 0 is
    // Ray's opening line (Sylvia's turn to pick a reply), step 1 is
    // Sylvia's line showing, step 2 is Ray's reply showing.
    rayTalk: { open: false, step: 0, rayIdx: -1, choice: -1, sylIdx: -1, replyIdx: -1, choiceLines: [-1, -1, -1, -1] },
    // Reading a piece of junk on the floor: open while the little
    // bubble shows what it says. The papers can hint at the way up;
    // the rest is just trash down here.
    propRead: { open: false, name: "", text: "", x: 0 },
    // The room she was in last tick, so a room change shows the
    // little intro line for the new place.
    lastRoom: null,
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
    mirror: { active: false, blink: 0, blinkT: 200, manifesting: false, manifestT: 0, affirmIdx: 0 },
    // The framed photo on the nightstand: active while she is looking
    // at it, popped up over a blurred game.
    photo: { active: false },
    map: { active: false },
    inspect: { active: false, t: 0, arch: 0, phase: "look" },
    // The portal tunnel: active while they pass through the tunnel
    // from the Ancient Dungeon up to the Flooded Cistern.
    portal: { active: false, t: 0 }
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
    "The Upper Levels above the subway? Beautiful place. The stairs keep my gears busy, but I cannot complain.",
    "The arcade machines break more than anything else down here. The kids play hard."
  ];
  function ownerLines(key) {
    if (key === "char") return CHAR_LINES;
    if (key === "mikey") return MIKEY_LINES;
    return GUNNER_LINES;
  }
  // The arcade kids. Kush is the boy with the dino plush: he loves
  // the underground but he is curious to see the land. Lia has the
  // ponytail and the cup: she really loves snacks and she is just
  // happy to have her friends. Jamie is the Asian bob girl with the
  // handheld game: very pessimistic about the underground, does not
  // really care about things, but she is chill. Kush and Lia are very
  // positive. Jamie is not.
  var KUSH_LINES = [
    "I love it down here. The arcade, the neon, all of it. But I wonder what the sky looks like.",
    "Up there they have real sun. Like, actual sun. I want to see it once.",
    "The underground is home. But home could have a window, you know?",
    "I beat the high score on the fighting game again. The machine knows my name now.",
    "Do you think it rains up there? Like water just falls from the sky? Wild.",
    "Lia brings the best snacks. I would follow her anywhere for a snack.",
    "Jamie says the underground is a trap. I say it is a really fun trap.",
    "One day I want to stand on land and feel grass. Is grass soft? I bet it is soft.",
    "The dino plush is my lucky charm. He has seen me win a hundred times.",
    "If we ever get out, I am bringing this arcade with me. All of it."
  ];
  var LIA_LINES = [
    "I brought snacks! Well, I ate most of them. But I brought the spirit of snacks.",
    "Kush and Jamie are the best. I am just happy we are all here together.",
    "A cup of tokens and my friends nearby. What more could a girl want?",
    "I found a snack machine that still works. Today is a good day.",
    "The underground is weird and dark, but my friends make it feel like home.",
    "Do you want a snack? I always have a snack. It is my whole thing.",
    "Jamie pretends she does not care, but she saved me a seat. She cares.",
    "Kush talks about the land a lot. I just hope there are snacks up there too.",
    "I am not worried about getting out. We have each other, and snacks. That is enough.",
    "You and Ray are so cute together. I am rooting for you two, obviously."
  ];
  var JAMIE_LINES = [
    "The underground is a dump. But it is our dump, I guess.",
    "Getting out? Sure. Whatever. I will believe it when I see the sun.",
    "I do not care about much, but I care about my high score. Do not touch it.",
    "Everyone is so positive down here. It is exhausting. I am going back to my game.",
    "The land? Probably just more stairs. Everything is stairs.",
    "Lia is too happy. Kush is too hopeful. I am the only realistic one here.",
    "I am not pessimistic. I am just not lying to myself.",
    "If we get out, cool. If not, the arcade still works. Either way.",
    "You want advice? Do not get your hopes up. It hurts less.",
    "I am chill. I am always chill. That is the whole point."
  ];
  function kidLines(key) {
    if (key === "dino") return KUSH_LINES;
    if (key === "cup") return LIA_LINES;
    return JAMIE_LINES;
  }
  function vickyNear() { return g.room === "bar" && Math.abs(g.px - VICKY_X) < 140; }
  function talkLine() {
    var idx;
    do { idx = Math.floor(Math.random() * VICKY_LINES.length); }
    while (VICKY_LINES.length > 1 && idx === g.talk.idx);
    g.talk.idx = idx; g.talk.open = true;
  }
  function pressT() {
    if (g.kiss.active || g.climb.active || g.inspect.active || g.portal.active) return;
    if (g.propRead.open) { closePropRead(); return; }
    if (g.talk.open) { talkLine(); return; }
    if (g.ownerTalk.open) { ownerTalkLine(g.ownerTalk.key); return; }
    if (g.kidTalk.open) { kidTalkLine(g.kidTalk.key); return; }
    if (g.rayTalk.open) { advanceRayTalk(); return; }
    // One conversation at a time: the room's own NPC wins, and Ray
    // is the fallback when nobody else is near to talk to.
    if (vickyNear()) { talkLine(); return; }
    var key = ownerNear();
    if (key) { ownerTalkLine(key); return; }
    var kid = kidNear();
    if (kid) { kidTalkLine(kid); return; }
    if (rayNear()) rayTalkLine();
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
  // The arcade kids. Walk up to one and press T to talk: they stop
  // and say something. The key is the asset key; the name is theirs.
  var KIDS = {
    gamer: { name: "Jamie" },
    dino: { name: "Kush" },
    cup: { name: "Lia" }
  };
  function kidNear() {
    if (g.room !== "arcade") return null;
    var keys = ["gamer", "dino", "cup"];
    for (var i = 0; i < keys.length; i++) {
      if (Math.abs(g.px - g.kids[keys[i]].x) < 150) return keys[i];
    }
    return null;
  }
  function kidTalkLine(key) {
    var lines = kidLines(key);
    var idx;
    do { idx = Math.floor(Math.random() * lines.length); }
    while (lines.length > 1 && idx === g.kidTalk.idx && g.kidTalk.key === key);
    g.kidTalk.idx = idx; g.kidTalk.open = true; g.kidTalk.key = key;
    var k = g.kids[key];
    k.dir = g.px < k.x ? -1 : 1; // face Sylvia
  }
  // Talking to Ray: he is the very protective manly type, devoted to
  // Sylvia. Walk up to him and press T. He speaks first, then Sylvia
  // talks back: she picks one of three replies (sweet, teasing, shy),
  // and Ray answers her in that same tone. A lot of lines, so the
  // same conversation almost never repeats.
  var RAY_LINES = [
    "Baby, I'll go wherever you go. You don't walk these tunnels alone. Not ever.",
    "I love you. That's not changing. Not down here, not up there, not anywhere.",
    "If anything down here so much as looks at you wrong, it answers to me.",
    "Stay close to me, baby. I've got you. I always do.",
    "You are the best thing that ever happened to me. Down here, up there, anywhere.",
    "I don't care how dark it gets. I'm not leaving your side.",
    "You're mine, baby. And I'm yours. That's how this works.",
    "I'd fight the whole underground for you. Don't ever doubt that.",
    "You look beautiful, even down here in the dark. Especially down here.",
    "When we get out, I'm taking you somewhere with real sun. Just us.",
    "I love the way you walk. Like you own every tunnel you step into.",
    "Don't worry about a thing, baby. I'll carry you if I have to.",
    "You're the strongest person I know. But you don't have to be strong alone.",
    "I like it when you stay close. Don't stop doing that.",
    "If we get lost, we get lost together. That's the deal.",
    "You make this place feel less like a basement and more like home.",
    "I'm not scared of the dark. I'm scared of losing you. That's different.",
    "Let me handle the scary parts. You just stay beautiful.",
    "I love you more than I did yesterday. And tomorrow I'll love you more than today.",
    "Whatever is up there waiting for us, we face it together. You and me.",
    "You know what I love about you? Everything. That's the whole list.",
    "Baby, hold my hand. I just like knowing you're right here.",
    "If anyone ever tries to come between us, they will regret it. I promise you that.",
    "You are my whole world, Sylvia. Down here, that world is just smaller.",
    "You look so good in that dress, baby. It should be illegal.",
    "Come here. I want to hold you properly.",
    "You have no idea what you do to me, do you?",
    "That dress... I love it. But I love what's underneath it more.",
    "Baby, you're driving me crazy tonight.",
    "I want you. Right here, right now. Don't look at me like that."
  ];
  // Sylvia talks back. Three tones she can answer him in, and a pool
  // of lines for each, so her reply is almost never the same twice.
  var SYLVIA_CHOICES = [
    { label: "I love you too", lines: [
      "I love you too, Ray. I know. I always know.",
      "You're the best thing down here. Don't ever forget it.",
      "I love you. Even when you're being all protective and growly.",
      "You make me feel safe. That's not a small thing.",
      "I love you too. Now stop looking at me like that, you're making me blush.",
      "I love you. You big, sweet, stubborn man."
    ]},
    { label: "My big protector", lines: [
      "My big protector. What would I do without you?",
      "So manly. So strong. So dramatic. I love it.",
      "Oh, is that your protective voice? I like it.",
      "You know I can handle myself, right? But keep going, it's cute.",
      "My hero. My big, growly, sweet hero.",
      "Careful, or I'll start calling you my bodyguard."
    ]},
    { label: "Stop it...", lines: [
      "Stop it... you're making me blush.",
      "Don't say that so loud. Someone might hear you.",
      "You're too much sometimes. In a good way. Mostly.",
      "I... I don't know what to say to that.",
      "Okay, okay. I heard you. Now stop staring at me like that.",
      "You're embarrassing me. Stop. Keep going."
    ]},
    { label: "Come here...", lines: [
      "Come here, handsome. I want you closer.",
      "Oh, is that so? Show me.",
      "You look pretty good yourself, you know.",
      "Kiss me, Ray. Stop talking and kiss me.",
      "I like it when you look at me like that.",
      "Come closer. I don't bite... much."
    ]}
  ];
  // Ray answers her in the same tone she picked.
  var RAY_REPLIES = [
    [ // she was sweet
      "Good. Because I'm not going anywhere, baby.",
      "I know you do. That's why I fight so hard for us.",
      "You're the reason I keep going. Don't forget that.",
      "Hearing you say that makes all of this worth it.",
      "I love you more. And I will win that argument every time.",
      "Come here. Let me hold you for a second.",
      "That's my girl. That's my whole world right there."
    ],
    [ // she was teasing
      "Dramatic? Me? Baby, I'm just getting started.",
      "You love it. Admit it. You love when I get all protective.",
      "Keep teasing me and I'll have to kiss you to shut you up.",
      "I'm only dramatic because you're worth being dramatic about.",
      "Careful, baby. I might just pick you up and carry you out of here.",
      "You think I'm cute? Wait until you see me fight for you.",
      "Tease me all you want. I'm still not letting you out of my sight."
    ],
    [ // she was shy
      "Hey. Look at me. You don't have to be shy with me. Ever.",
      "Blushing looks good on you. Don't hide it.",
      "I'll say it as loud as I want. I love you, and I don't care who hears.",
      "It's okay, baby. I know. You don't have to say it back perfectly.",
      "Come here. You don't have to be brave all the time. Not with me.",
      "You're cute when you're shy. Don't tell anyone I said that.",
      "Shy suits you. But I already know what's in that heart of yours."
    ],
    [ // she was flirty
      "Careful what you wish for, baby. I don't hold back.",
      "You have no idea how much I want you right now.",
      "Come here. Let me show you how much I love you.",
      "That look in your eyes... you're trouble, and I love it.",
      "Baby, you're going to be the death of me.",
      "I love it when you talk like that. Say it again.",
      "You want me closer? I'm already yours, baby. All yours."
    ]
  ];
  function rayNear() { return Math.abs(g.px - g.ray.x) < 150; }
  function rayTalkLine() {
    var idx;
    do { idx = Math.floor(Math.random() * RAY_LINES.length); }
    while (RAY_LINES.length > 1 && idx === g.rayTalk.rayIdx);
    g.rayTalk.rayIdx = idx; g.rayTalk.open = true; g.rayTalk.step = 0; g.rayTalk.choice = -1;
    // Fresh reply options every time: one random line from each
    // tone, shown on the four buttons around Sylvia's head.
    for (var ci = 0; ci < SYLVIA_CHOICES.length; ci++) {
      g.rayTalk.choiceLines[ci] = Math.floor(Math.random() * SYLVIA_CHOICES[ci].lines.length);
    }
    g.ray.dir = g.px < g.ray.x ? -1 : 1; // face Sylvia
  }
  function pickRayChoice(i) {
    if (!g.rayTalk.open || g.rayTalk.step !== 0) return;
    if (i < 0 || i >= SYLVIA_CHOICES.length) return;
    var repLines = RAY_REPLIES[i];
    g.rayTalk.choice = i;
    g.rayTalk.sylIdx = g.rayTalk.choiceLines[i]; // the line she saw on the button
    g.rayTalk.replyIdx = Math.floor(Math.random() * repLines.length);
    g.rayTalk.step = 1; // Sylvia's line is showing; T for Ray's reply
  }
  function advanceRayTalk() {
    if (!g.rayTalk.open) return;
    if (g.rayTalk.step === 1) { g.rayTalk.step = 2; return; } // Ray's reply
    if (g.rayTalk.step === 2) { rayTalkLine(); return; } // new opening
  }
  function closeRayTalk() { g.rayTalk.open = false; g.rayTalk.step = 0; g.rayTalk.choice = -1; }
  function tryAttack() {
    if (g.embrace.active || g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.propRead.open || g.climb.active || g.inspect.active || g.portal.active || g.attack.cooldown > 0) return;
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
    shopping: { left: "chamber", right: "cistern" },
    repair: { left: "shopping" },
    clothing: { left: "shopping" },
    salon: { left: "shopping" },
    arcade: { left: "shopping" },
    cistern: { left: "shopping" },
    quarry: { left: "arcade", right: "tunnels" },
    tunnels: { left: "quarry" },
    dungeon: { left: "tunnels" },
    upper1: { left: "subway" },
    upper2: { left: "upper1" },
    upper3: { left: "upper2" }
  };
  // The staircases that go up: the bar's stone stairs on the right
  // climb to the Forgotten subway, the subway's wide stairs on the
  // right climb to Upper Level 1, and each Upper Level's stairs on
  // the right climb to the next one up. Walk to the foot of the
  // stairs and press E, and they climb up together. To come back
  // down, walk to the left edge of an Upper Level.
  var STAIRS = {
    bar: { baseX: 1070, topX: 1150, to: "subway", label: "Go up the stairs to the Forgotten subway", btn: "Up the stairs" },
    subway: { baseX: 1980, topX: 2120, to: "upper1", label: "Go up the stairs to Upper Level 1", btn: "Up the stairs" },
    upper1: { baseX: 1900, topX: 2100, to: "upper2", label: "Go up the stairs to Upper Level 2", btn: "Up the stairs" },
    upper2: { baseX: 1900, topX: 2100, to: "upper3", label: "Go up the stairs to Upper Level 3", btn: "Up the stairs" }
  };
  var STAIR_RANGE = 90;
  function stairsNear() {
    var s = STAIRS[g.room];
    if (!s) return null;
    return Math.abs(g.px - s.baseX) < STAIR_RANGE ? g.room : null;
  }
  function climbStairs() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active) return;
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
    if (g.room === "upper1" && to === "subway") return "Go back down to the Forgotten subway";
    if (g.room === "upper2" && to === "upper1") return "Go back down to Upper Level 1";
    if (g.room === "upper3" && to === "upper2") return "Go back down to Upper Level 2";
    if (to === "cistern") return "Go to the Flooded Cistern";
    if (g.room === "dungeon" && to === "tunnels") return "Back to the Old Service Tunnels";
    if (to === "tunnels") return "Go to the Old Service Tunnels";
    if (to === "quarry") return "Back to the Crystal Quarry";
    if (to === "arcade") return "Back to the arcade";
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
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active) return;
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
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.mirror.active) return;
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
  // The framed photo on the nightstand, beside the bed: walk up to it
  // and press E and it pops up over the game, with the rest of the
  // screen blurred behind it. Esc or a tap puts it back.
  var PHOTO_X = 1050, PHOTO_RANGE = 40;
  function photoNear() {
    return g.room === "chamber" && Math.abs(g.px - PHOTO_X) < PHOTO_RANGE;
  }
  function openPhoto() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.mirror.active || g.photo.active) return;
    if (!photoNear()) return;
    g.talk.open = false; g.ownerTalk.open = false;
    g.photo.active = true;
    var pop = document.getElementById("photoPopup");
    if (pop) pop.hidden = false;
  }
  function closePhoto() {
    g.photo.active = false;
    var pop = document.getElementById("photoPopup");
    if (pop) pop.hidden = true;
  }
  // The world map. The map button (top left, under the HP hearts)
  // opens it: the whole underground world, blurred behind, with
  // Sylvia's and Ray's heads pinned at their current room.
  // Fractions of the map image (1672x941).
  var MAP_PINS = {
    chamber:  { x: 0.125, y: 0.575 },
    bar:      { x: 0.45,  y: 0.625 },
    shopping: { x: 0.425, y: 0.56 },
    repair:   { x: 0.37,  y: 0.60 },
    clothing: { x: 0.40,  y: 0.57 },
    salon:    { x: 0.49,  y: 0.57 },
    arcade:   { x: 0.55,  y: 0.60 },
    subway:   { x: 0.18,  y: 0.385 },
    cistern:  { x: 0.70,  y: 0.60 },
    quarry:   { x: 0.13,  y: 0.78 },
    tunnels:  { x: 0.50,  y: 0.80 },
    dungeon:  { x: 0.86,  y: 0.76 },
    upper1:   { x: 0.42,  y: 0.28 },
    upper2:   { x: 0.52,  y: 0.22 },
    upper3:   { x: 0.62,  y: 0.16 }
  };
  var MAP_ROOM_NAMES = {
    chamber: "Silvia & Ray's Room",
    bar: "The Neon Ruin Bar",
    shopping: "Underground Shopping District",
    repair: "The Repair Shop",
    clothing: "The Clothing Store",
    salon: "The Style Studio",
    arcade: "The Arcade",
    subway: "Forgotten Subway Platform",
    cistern: "Flooded Cistern",
    quarry: "Crystal Quarry",
    tunnels: "Old Service Tunnels",
    dungeon: "Ancient Dungeon",
    upper1: "Upper Level 1",
    upper2: "Upper Level 2",
    upper3: "Upper Level 3"
  };
  function openMap() {
    if (g.mirror.active || g.photo.active || g.map.active) return;
    g.map.active = true;
    var pin = MAP_PINS[g.room] || MAP_PINS.chamber;
    var ps = document.getElementById("pinSylvia");
    var pr = document.getElementById("pinRay");
    if (ps) { ps.style.left = (pin.x * 100) + "%"; ps.style.top = (pin.y * 100) + "%"; }
    if (pr) { pr.style.left = (pin.x * 100) + "%"; pr.style.top = (pin.y * 100) + "%"; }
    var cap = document.getElementById("mapCaption");
    if (cap) cap.textContent = MAP_ROOM_NAMES[g.room] || MAP_ROOM_NAMES.chamber;
    var pop = document.getElementById("mapPopup");
    if (pop) pop.hidden = false;
  }
  function closeMap() {
    g.map.active = false;
    var pop = document.getElementById("mapPopup");
    if (pop) pop.hidden = true;
  }
  // Dev shortcut: jump straight to a room from the world map. Tap
  // anywhere on the map and they go to the room nearest that spot.
  // For developing and testing, so she can hop around without
  // walking the whole route every time.
  function teleportToRoom(roomKey) {
    if (!ROOMS[roomKey]) return;
    closeMap();
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.rayTalk.open = false;
    g.propRead.open = false; hidePropPanel();
    g.mirror.active = false; g.photo.active = false; g.inspect.active = false;
    g.climb.active = false; g.portal.active = false; g.kiss.active = false;
    g.embrace.active = false; g.sleeping = false; g.ray.inBed = false;
    g.room = roomKey;
    g.px = 110; g.facing = 1; g.depth = 0;
    g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
    g.camX = 0;
  }
  function mapJump(e) {
    var wrap = document.getElementById("mapWrap");
    if (!wrap) return;
    var r = wrap.getBoundingClientRect();
    var fx = (e.clientX - r.left) / r.width;
    var fy = (e.clientY - r.top) / r.height;
    var best = null, bestD = Infinity;
    for (var k in MAP_PINS) {
      var p = MAP_PINS[k];
      var d = (p.x - fx) * (p.x - fx) + (p.y - fy) * (p.y - fy);
      if (d < bestD) { bestD = d; best = k; }
    }
    if (best) teleportToRoom(best);
  }
  // The secret under the arcade floor: three dark arches in the
  // floor are hidden passages down to the Crystal Quarry. Walk over
  // one and press I to inspect it. They crouch down and look, and
  // stay there while she decides. Press I again to jump down
  // together, or walk away (or Esc) to stand back up.
  var INSPECT_XS = [348, 1086, 1955], INSPECT_RANGE = 130;
  function inspectArch() {
    if (g.room !== "arcade") return null;
    var best = null, bd = 1e9;
    for (var i = 0; i < INSPECT_XS.length; i++) {
      var d = Math.abs(g.px - INSPECT_XS[i]);
      if (d < bd) { bd = d; best = INSPECT_XS[i]; }
    }
    return bd < INSPECT_RANGE ? best : null;
  }
  function inspectNear() { return inspectArch() !== null; }
  function drawInspectPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.climb.active || g.portal.active) return;
    // One small, quiet button down at the floor, right over the arch.
    // It stays subtle so the secret does not shout.
    var ax = g.inspect.active ? g.inspect.arch : inspectArch();
    if (ax === null) return;
    if (g.inspect.active && g.inspect.phase === "drop") return;
    var x = ax * scale() - g.camX;
    // The prompt sits down at the floor, right over the dark arch,
    // not up above her head, so it points at the spot to inspect.
    var y = groundY() + 30;
    ctx.save();
    ctx.font = "700 11px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = g.inspect.active ? "I · Go down" : "I · Inspect";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 8, y - 14, tw + 16, 20, 10);
    else ctx.rect(x - tw / 2 - 8, y - 14, tw + 16, 20);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(label, x, y);
    ctx.restore();
  }
  function drawProps() {
    var list = PROPS[g.room];
    if (!list) return;
    var dr = depthRange();
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var img = p.img;
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      var h = p.h * (0.92 + 0.08 * p.d);
      var w = h * img.naturalWidth / img.naturalHeight;
      var x = p.x * scale() - g.camX;
      var y = groundY() - dr * (1 - p.d);
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(img, x - w / 2, y - h, w, h);
      ctx.restore();
    }
  }
  function drawArchGlow() {
    // The secret arches under the arcade floor are easy to miss, so
    // each one gets a faint golden shimmer, so she can find where to
    // look. Subtle on purpose: it is still a secret, just findable.
    if (g.room !== "arcade") return;
    var pulse = 0.16 + 0.10 * Math.sin(Date.now() / 500);
    for (var i = 0; i < INSPECT_XS.length; i++) {
      var x = INSPECT_XS[i] * scale() - g.camX;
      var y = groundY() + 26;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#ffd977";
      ctx.beginPath();
      ctx.ellipse(x, y, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = pulse * 1.6;
      ctx.fillStyle = "#fff3c4";
      ctx.beginPath();
      ctx.ellipse(x, y, 12, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  var PROP_RANGE = 90;
  function propNear() {
    var list = PROPS[g.room];
    if (!list) return null;
    var best = null, bd = 1e9;
    for (var i = 0; i < list.length; i++) {
      var d = Math.abs(g.px - list[i].x);
      if (d < bd) { bd = d; best = list[i]; }
    }
    return bd < PROP_RANGE ? best : null;
  }
  function readProp(p) {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    g.propRead.open = true; g.propRead.name = p.name; g.propRead.text = p.text; g.propRead.x = p.x;
    // Crouch down to read it, the same as pressing I.
    g.inspect.active = true; g.inspect.phase = "look"; g.inspect.arch = null; g.inspect.t = 0;
    g.facing = g.px < p.x ? 1 : -1;
    g.ray.dir = g.ray.x < p.x ? 1 : -1;
    showPropPanel();
  }
  function closePropRead() { g.propRead.open = false; g.propRead.name = ""; g.propRead.text = ""; hidePropPanel(); }
  function drawPropPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.climb.active || g.inspect.active || g.portal.active || g.propRead.open) return;
    var p = propNear();
    if (!p) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var isPaper = /paper|newspaper/i.test(p.name);
    var label = isPaper ? "Press E to read it" : "Press E to look closer";
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
  // A little line when she walks into a new room, so each place
  // gets its own first impression. No box, no border, just the words
  // at the top of the screen for a few seconds, then they fade.
  var ROOM_INTRO = {
    bar: "This place reeks of cheap beer and old smoke.",
    chamber: "Our room. Small, warm, and ours.",
    subway: "It's very dark here. And very, very quiet.",
    shopping: "It's beautiful here, but it could be better.",
    repair: "It smells like oil and rust in here.",
    clothing: "Char's shop. It smells like perfume and big dreams.",
    salon: "Mikey's place. Hairspray, gossip, and good lighting.",
    arcade: "The arcade never really turns off.",
    cistern: "The water is still. Too still.",
    quarry: "Pretty crystals. And a little bit wrong.",
    tunnels: "The tunnels smell like damp earth and old metal.",
    dungeon: "Something bad happened here. You can feel it.",
    upper1: "Upper Level 1. Blue, cold, and the air feels thinner.",
    upper2: "Upper Level 2. Violet and quiet. Too quiet.",
    upper3: "Upper Level 3. White and bright. And it watches you."
  };
  var roomIntroTimer = null;
  function showRoomIntro() {
    var el = document.getElementById("roomIntro");
    if (!el) return;
    var line = ROOM_INTRO[g.room];
    if (!line) return;
    // If she is reading a piece of junk, the panel wins and the
    // intro waits for the next room.
    if (g.propRead.open) return;
    el.textContent = line;
    el.hidden = false;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
    if (roomIntroTimer) clearTimeout(roomIntroTimer);
    roomIntroTimer = setTimeout(function() {
      el.classList.remove("show");
      setTimeout(function() { el.hidden = true; }, 600);
    }, 5000);
  }
  function hideRoomIntro() {
    var el = document.getElementById("roomIntro");
    if (!el) return;
    if (roomIntroTimer) clearTimeout(roomIntroTimer);
    el.classList.remove("show");
    el.hidden = true;
  }
  function showPropPanel() {
    // The inspection words live in a DOM panel at the top of the
    // screen, not a canvas bubble: a frosted blue panel with a cool
    // glowing border, bigger text, so it reads clearly and stands out.
    // The room intro steps aside while she reads.
    hideRoomIntro();
    var panel = document.getElementById("propPanel");
    if (!panel) return;
    document.getElementById("propPanelName").textContent = g.propRead.name.toUpperCase();
    document.getElementById("propPanelText").textContent = g.propRead.text;
    panel.hidden = false;
  }
  function hidePropPanel() {
    var panel = document.getElementById("propPanel");
    if (panel) panel.hidden = true;
  }
  function startInspect() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.portal.active) return;
    // Already reading a piece of junk: I puts it back down and she
    // stands back up.
    if (g.propRead.open) { closePropRead(); g.inspect.active = false; return; }
    if (g.inspect.active && g.inspect.phase === "look") {
      // She is already crouched and looking. At an arch she jumps
      // down; anywhere else she just stands back up.
      if (g.inspect.arch !== null) { g.inspect.phase = "drop"; g.inspect.t = 0; return; }
      g.inspect.active = false; return;
    }
    if (g.inspect.active) return;
    // I is crouch and inspect, but only when there is something to
    // inspect. An arch, or a piece of junk on the floor. Anywhere
    // else there is nothing to look at, so no crouch.
    var ax = inspectArch();
    var prop = propNear();
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false;
    if (ax !== null) {
      // At a secret arch: crouch down and look at it.
      g.inspect.active = true; g.inspect.t = 0; g.inspect.phase = "look"; g.inspect.arch = ax;
      g.facing = g.px < ax ? 1 : -1;
      g.ray.dir = g.ray.x < ax ? 1 : -1;
    } else if (prop) {
      // Crouch down and read the junk on the floor. readProp sets
      // the crouch and opens the panel with what it says.
      readProp(prop);
    }
    // If it is neither an arch nor a piece of junk, there is nothing
    // to inspect here, so I does nothing and they stay standing.
  }
  function updateInspect() {
    g.inspect.t += 1;
    var t = g.inspect.t;
    if (g.inspect.phase === "look") {
      // They crouch down and look at the secret spot, deciding
      // whether to go down. Nothing happens until she presses I
      // again or walks away. If she just crouched to look around
      // (no arch), the camera stays where it is.
      if (g.inspect.arch !== null) g.camX = clampCam(g.inspect.arch * scale() - g.w * 0.38);
      return;
    }
    // phase === "drop": they jump down together, holding hands.
    if (t >= 90) {
      // They land in the Crystal Quarry.
      g.inspect.active = false;
      g.room = "quarry";
      g.px = 110; g.facing = 1; g.depth = 0;
      g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
      g.camX = 0;
      return;
    }
    // Midair: they are falling, holding hands. The descent art fills
    // the screen and drifts down as they drop.
  }
  function drawDescent() {
    if (!descentImg || !descentImg.complete || descentImg.naturalWidth === 0) return;
    ctx.save();
    ctx.fillStyle = "#0a060f";
    ctx.fillRect(0, 0, g.w, g.h);
    var s = Math.min(g.w / descentImg.naturalWidth, g.h / descentImg.naturalHeight);
    var dw = descentImg.naturalWidth * s;
    var dh = descentImg.naturalHeight * s;
    var drift = g.inspect.t / 90 * 40;
    ctx.drawImage(descentImg, (g.w - dw) / 2, (g.h - dh) / 2 + drift - 20, dw, dh);
    ctx.restore();
  }
  // The rusted iron door in the Old Service Tunnels: the way into the
  // Ancient Dungeon. The dungeon is NOT reached from the tunnels'
  // right edge, only through this door.
  var IRON_DOOR_X = 1440, IRON_DOOR_RANGE = 110;
  function ironDoorNear() {
    return g.room === "tunnels" && Math.abs(g.px - IRON_DOOR_X) < IRON_DOOR_RANGE;
  }
  function drawIronDoorPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!ironDoorNear()) return;
    var x = IRON_DOOR_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to go through the iron door";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(20,10,30,0.72)";
    roundRect(x - tw / 2 - 10, y - 13, tw + 20, 26, 13);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, y + 5);
    ctx.restore();
  }
  function enterDungeonFromIronDoor() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!ironDoorNear()) return;
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false;
    g.room = "dungeon";
    g.px = 110; g.facing = 1; g.depth = 0;
    g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
    g.camX = 0;
  }
  // The portal tunnel in the Ancient Dungeon: the big cracked stone
  // door on the far right. Going through it takes them up to the
  // Flooded Cistern, through the dark tunnel mouth.
  var PORTAL_X = 1955, PORTAL_RANGE = 110;
  function portalNear() {
    return g.room === "dungeon" && Math.abs(g.px - PORTAL_X) < PORTAL_RANGE;
  }
  function drawPortalPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!portalNear()) return;
    var x = PORTAL_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to go through the tunnel";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(20,10,30,0.72)";
    roundRect(x - tw / 2 - 10, y - 13, tw + 20, 26, 13);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, y + 5);
    ctx.restore();
  }
  function goThroughPortal() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!portalNear()) return;
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false;
    g.portal.active = true; g.portal.t = 0;
  }
  function updatePortal() {
    g.portal.t += 1;
    if (g.portal.t >= 90) {
      // They come out of the tunnel up in the Flooded Cistern.
      g.portal.active = false;
      g.room = "cistern";
      g.px = 110; g.facing = 1; g.depth = 0;
      g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
      g.camX = 0;
    }
  }
  function drawPortal() {
    if (!portalTunnelImg || !portalTunnelImg.complete || portalTunnelImg.naturalWidth === 0) return;
    ctx.save();
    ctx.fillStyle = "#060a08";
    ctx.fillRect(0, 0, g.w, g.h);
    var s = Math.min(g.w / portalTunnelImg.naturalWidth, g.h / portalTunnelImg.naturalHeight);
    var dw = portalTunnelImg.naturalWidth * s;
    var dh = portalTunnelImg.naturalHeight * s;
    ctx.drawImage(portalTunnelImg, (g.w - dw) / 2, (g.h - dh) / 2, dw, dh);
    ctx.restore();
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
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active) return;
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
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active) return;
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
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.rayTalk.open || g.propRead.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    var side = doorSide();
    if (!side) return;
    var from = g.room;
    var to = EXITS[g.room][side];
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false;
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
    if (g.photo.active) { closePhoto(); return; }
    if (g.propRead.open) { closePropRead(); return; }
    if (photoNear()) { openPhoto(); return; }
    if (bedNear()) { goToBed(); return; }
    if (vanityNear()) { enterMirror(); return; }
    if (windowNear()) { climbOutWindow(); return; }
    if (stairsNear()) { climbStairs(); return; }
    if (beerDoorNear()) { enterBarFromBeerDoor(); return; }
    var shop = shopNear();
    if (shop) { enterShop(shop); return; }
    var prop = propNear();
    if (prop) { readProp(prop); return; }
    if (inspectNear()) { startInspect(); return; }
    if (ironDoorNear()) { enterDungeonFromIronDoor(); return; }
    if (portalNear()) { goThroughPortal(); return; }
    if (atDoor()) switchRoom();
  }
  function kissNear() { return Math.abs(g.px - g.ray.x) < 130; }
  function tryKiss() {
    if (g.embrace.active || g.sleeping || g.kiss.active || g.climb.active || g.inspect.active || g.portal.active || g.rayTalk.open || g.propRead.open || !kissNear()) return;
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
    if (g.inspect.active) {
      // Inspecting the secret spot: she crouches down to look at it.
      // Once they jump, she is in the descent art, not on the floor.
      if (g.inspect.phase === "drop") return;
      var iimg = sylviaCrouchImg;
      if (!iimg || !iimg.complete || iimg.naturalWidth === 0) iimg = sylviaIdleImg;
      if (!iimg || !iimg.complete || iimg.naturalWidth === 0) return;
      var it = (g.depth + depthRange()) / depthRange();
      var ih = sylviaH() * 0.62 * (0.92 + 0.08 * it);
      var iw = ih * (iimg.naturalWidth / iimg.naturalHeight);
      var ifeet = groundY() + g.depth;
      var ix = g.px * scale() - g.camX;
      shadow(ix, ifeet, iw);
      ctx.save();
      ctx.translate(ix, ifeet - ih / 2);
      if (g.facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(iimg, -iw / 2, -ih / 2, iw, ih);
      ctx.restore();
      return;
    }
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
    if (g.inspect.active) {
      // Inspecting the secret spot: he crouches down beside her.
      // Once they jump, he is in the descent art, not on the floor.
      if (g.inspect.phase === "drop") return;
      var riimg = rayCrouchImg;
      if (!riimg || !riimg.complete || riimg.naturalWidth === 0) riimg = rayIdleImg;
      if (!riimg || !riimg.complete || riimg.naturalWidth === 0) return;
      var rit = (r.depth + depthRange()) / depthRange();
      var rih = rayH() * 0.62 * (0.92 + 0.08 * rit);
      var riw = rih * (riimg.naturalWidth / riimg.naturalHeight);
      var rifeet = groundY() + r.depth - 6;
      var rix = r.x * scale() - g.camX;
      if (rix < -riw || rix > g.w + riw) return;
      shadow(rix, rifeet, riw);
      ctx.save();
      ctx.translate(rix, rifeet - rih / 2);
      if (r.dir === -1) ctx.scale(-1, 1);
      ctx.drawImage(riimg, -riw / 2, -rih / 2, riw, rih);
      ctx.restore();
      return;
    }
    if (g.rayTalk.open) {
      // Talking to her: he shows his talking pose. Arms crossed and
      // serious by default. After Sylvia speaks, if she was shy or
      // flirty, he gets bashful and blushing. Front view, never flipped.
      var timg = (g.rayTalk.step >= 1 && (g.rayTalk.choice === 2 || g.rayTalk.choice === 3)) ? rayTalkShyImg : rayTalkImg;
      if (!timg || !timg.complete || timg.naturalWidth === 0) timg = rayIdleImg;
      if (!timg || !timg.complete || timg.naturalWidth === 0) return;
      var tt = (r.depth + depthRange()) / depthRange();
      var th = rayH() * (0.92 + 0.08 * tt);
      var tw = th * (timg.naturalWidth / timg.naturalHeight);
      var tfeet = groundY() + r.depth - 6;
      var tx = r.x * scale() - g.camX;
      if (tx < -tw || tx > g.w + tw) return;
      shadow(tx, tfeet, tw);
      ctx.save();
      ctx.translate(tx, tfeet - th / 2);
      ctx.drawImage(timg, -tw / 2, -th / 2, tw, th);
      ctx.restore();
      return;
    }
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
      var talking = g.kidTalk.open && g.kidTalk.key === keys[i];
      var walking = !talking && k.pause <= 0;
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
  function drawKidTalk() {
    // Speech bubble above the arcade kid Sylvia is talking to,
    // tail pointing down to them. Mirrors the owners' bubble.
    if (!g.kidTalk.open) return;
    var key = g.kidTalk.key;
    var k = g.kids[key];
    var name = KIDS[key].name.toUpperCase();
    var kx = k.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(kidLines(key)[g.kidTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText(name).width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, kx - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, kx));
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
  function drawRayTalk() {
    // Talking to Ray: a speech bubble above whoever is speaking, tail
    // pointing down to them. Ray's name is royal blue, Sylvia's is a
    // soft rose, so it is always clear who is talking.
    if (!g.rayTalk.open) return;
    var step = g.rayTalk.step;
    var text, name, color, ax;
    if (step === 1) {
      text = SYLVIA_CHOICES[g.rayTalk.choice].lines[g.rayTalk.sylIdx];
      name = "SYLVIA"; color = "#d6336c";
      ax = g.px * scale() - g.camX;
    } else if (step === 2) {
      text = RAY_REPLIES[g.rayTalk.choice][g.rayTalk.replyIdx];
      name = "RAY"; color = "#0201a7";
      ax = g.ray.x * scale() - g.camX;
    } else {
      text = RAY_LINES[g.rayTalk.rayIdx];
      name = "RAY"; color = "#0201a7";
      ax = g.ray.x * scale() - g.camX;
    }
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(text, maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText(name).width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ax - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ax));
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
    ctx.fillStyle = color;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(name, bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(step === 0 ? "Pick what Sylvia says below" : step === 1 ? "T for Ray's reply" : "T for more", bx + bw - 14, by + bh - 8);
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
    if (g.kiss.active || g.talk.open || g.photo.active || photoNear()) return;
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
    if (g.kiss.active || g.talk.open || g.climb.active || g.mirror.active || g.photo.active) return;
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
  function drawPhotoPrompt() {
    if (g.kiss.active || g.talk.open || g.climb.active || g.mirror.active || g.photo.active) return;
    if (!photoNear()) return;
    var x = PHOTO_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to look at the photo";
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
    if (g.inspect.active && g.inspect.phase === "drop") { drawDescent(); return; }
    if (g.portal.active) { drawPortal(); return; }
    drawBg();
    drawProps();
    drawArchGlow();
    drawHp();
    drawVickyPrompt();
    drawDoorPrompt();
    drawBedPrompt();
    drawWindowPrompt();
    drawVanityPrompt();
    drawPhotoPrompt();
    drawStairPrompt();
    drawBeerDoorPrompt();
    drawShopPrompt();
    drawInspectPrompt();
    drawPropPrompt();
    drawIronDoorPrompt();
    drawPortalPrompt();
    if (g.kiss.active) { drawKiss(); drawTalk(); drawOwnerTalk(); drawKidTalk(); return; }
    if (g.embrace.active) { drawEmbrace(); drawTalk(); drawOwnerTalk(); drawKidTalk(); return; }
    drawRay();
    drawChar();
    drawMikey();
    drawGunner();
    drawArcadeKids();
    if (!g.sleeping) drawSylvia();
    drawTalk();
    drawOwnerTalk();
    drawKidTalk();
    drawRayTalk();
  }

  function tick() {
    requestAnimationFrame(tick);
    g.time += 1;
    // A new room means a new first impression: show the little
    // intro line for the place she just walked into.
    if (g.room !== g.lastRoom) { g.lastRoom = g.room; showRoomIntro(); }
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
    if (g.map.active) {
      // The map is open: the world is blurred behind it. Nothing moves
      // until she closes it.
      var tBtnM = document.getElementById("talkBtn");
      if (tBtnM) tBtnM.hidden = true;
      var eBtnM = document.getElementById("enterBtn");
      if (eBtnM) eBtnM.hidden = true;
      var aBtnM = document.getElementById("attackBtn");
      if (aBtnM) aBtnM.hidden = true;
      draw();
      return;
    }
    if (g.photo.active) {
      // Looking at the framed photo: the popup blurs the game behind
      // it. Nothing moves until she puts it back.
      var tBtnP = document.getElementById("talkBtn");
      if (tBtnP) tBtnP.hidden = true;
      var eBtnP = document.getElementById("enterBtn");
      if (eBtnP) eBtnP.hidden = true;
      var aBtnP = document.getElementById("attackBtn");
      if (aBtnP) aBtnP.hidden = true;
      draw();
      return;
    }
    if (g.talk.open && !vickyNear() && Math.abs(g.px - VICKY_X) > 180) g.talk.open = false;
    if (g.ownerTalk.open) {
      var otk = g.ownerTalk.key;
      if (g.room !== OWNERS[otk].room || Math.abs(g.px - g[otk].x) > 180) g.ownerTalk.open = false;
    }
    if (g.kidTalk.open) {
      var ktk = g.kidTalk.key;
      if (g.room !== "arcade" || Math.abs(g.px - g.kids[ktk].x) > 180) g.kidTalk.open = false;
    }
    if (g.rayTalk.open && Math.abs(g.px - g.ray.x) > 180) closeRayTalk();
    if (g.propRead.open && Math.abs(g.px - g.propRead.x) > 180) closePropRead();
    // Sylvia's reply choices: four buttons around her head, only
    // while Ray has just spoken and it is her turn to answer him.
    // The four options are different every time: one random line
    // from each tone, so she never sees the same set twice.
    var rayChoices = document.getElementById("rayChoices");
    if (rayChoices) {
      if (g.rayTalk.open && g.rayTalk.step === 0) {
        rayChoices.hidden = false;
        var rBtns = rayChoices.querySelectorAll("button");
        for (var bi = 0; bi < rBtns.length && bi < SYLVIA_CHOICES.length; bi++) {
          rBtns[bi].textContent = SYLVIA_CHOICES[bi].lines[g.rayTalk.choiceLines[bi]];
        }
        // Center the choices on Sylvia's head, just above it.
        var headX = g.px * scale() - g.camX;
        var headTop = groundY() + g.depth - sylviaH();
        var cw = 360; // matches the CSS width of .rayChoices
        var cLeft = Math.max(cw / 2 + 8, Math.min(g.w - cw / 2 - 8, headX));
        rayChoices.style.left = cLeft + "px";
        var cTop = headTop - 10;
        rayChoices.style.top = cTop + "px";
        // Keep it on screen if her head is near the top.
        var ch = rayChoices.offsetHeight || 120;
        if (cTop - ch < 8) rayChoices.style.top = (ch + 8) + "px";
      } else {
        rayChoices.hidden = true;
      }
    }
    var talkBtn = document.getElementById("talkBtn");
    if (talkBtn) {
      var nearOwner = ownerNear();
      var nearKid = kidNear();
      if (vickyNear()) { talkBtn.hidden = false; talkBtn.textContent = g.talk.open ? "Next" : "Talk to Vicky"; }
      else if (g.ownerTalk.open) { talkBtn.hidden = false; talkBtn.textContent = "Next"; }
      else if (g.kidTalk.open) { talkBtn.hidden = false; talkBtn.textContent = "Next"; }
      else if (g.rayTalk.open) { talkBtn.hidden = false; talkBtn.textContent = "Next"; }
      else if (nearOwner) { talkBtn.hidden = false; talkBtn.textContent = "Talk to " + OWNERS[nearOwner].name; }
      else if (nearKid) { talkBtn.hidden = false; talkBtn.textContent = "Talk to " + KIDS[nearKid].name; }
      else if (rayNear()) { talkBtn.hidden = false; talkBtn.textContent = "Talk to Ray"; }
      else talkBtn.hidden = true;
    }
    var enterBtn = document.getElementById("enterBtn");
    if (enterBtn) {
      if (g.climb.active || g.portal.active) { enterBtn.hidden = true; }
      else if (g.sleeping) { enterBtn.hidden = false; enterBtn.textContent = "Get up"; }
      else if (photoNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Look at the photo"; }
      else if (bedNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Go to bed"; }
      else if (vanityNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Look in the mirror"; }
      else if (windowNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Climb out the window"; }
      else if (stairsNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = STAIRS[stairsNear()].btn; }
      else if (beerDoorNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Enter the bar"; }
      else if (shopNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = SHOPS[shopNear()].btn; }
      else if (propNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = g.propRead.open ? "Put it down" : "Inspect"; }
      else if (inspectNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = g.inspect.active ? "Go down" : "Inspect"; }
      else if (ironDoorNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Iron door"; }
      else if (portalNear() && !g.kiss.active) { enterBtn.hidden = false; enterBtn.textContent = "Through the tunnel"; }
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
    if (g.inspect.active) {
      // Inspecting the secret spot, then jumping down to the quarry.
      // The inspect drives them both, and nothing else moves until
      // they land.
      updateInspect();
      draw();
      return;
    }
    if (g.portal.active) {
      // Passing through the portal tunnel up to the Flooded Cistern.
      // The tunnel art fills the screen until they come out.
      updatePortal();
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
    } else if (g.rayTalk.open) {
      // Talking to her: he stands still and faces her.
      r.dir = g.px < r.x ? -1 : 1;
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
        if (g.kidTalk.open && g.kidTalk.key === kidKeys[ki]) continue;
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
    if (e.code === "KeyI") { startInspect(); return; }
    if (e.code === "KeyT") { pressT(); return; }
    if (e.code === "KeyM") { if (g.mirror.active) manifest(); return; }
    if (e.code === "Digit1" || e.code === "Digit2" || e.code === "Digit3" || e.code === "Digit4") {
      if (g.rayTalk.open && g.rayTalk.step === 0) {
        pickRayChoice(e.code === "Digit1" ? 0 : e.code === "Digit2" ? 1 : e.code === "Digit3" ? 2 : 3);
        return;
      }
    }
    if (e.code === "Escape") { if (g.mirror.active) { exitMirror(); return; } if (g.photo.active) { closePhoto(); return; } if (g.map.active) { closeMap(); return; } if (g.propRead.open) { closePropRead(); g.inspect.active = false; return; } if (g.inspect.active && g.inspect.phase === "look") { g.inspect.active = false; return; } if (g.rayTalk.open) { closeRayTalk(); return; } g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; return; }
    if (g.mirror.active) return;
    if (g.photo.active) return;
    if (g.map.active) return;
    if (g.inspect.active && g.inspect.phase === "look" && (e.code === "KeyW" || e.code === "KeyA" || e.code === "KeyS" || e.code === "KeyD" || e.code === "ArrowUp" || e.code === "ArrowDown" || e.code === "ArrowLeft" || e.code === "ArrowRight")) {
      // Walking away while looking: she stands back up and the
      // inspect is off. The key still goes through so she walks.
      g.inspect.active = false;
    }
    if (g.inspect.active) return;
    if (g.portal.active) return;
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
  var rayChoices = document.getElementById("rayChoices");
  if (rayChoices) {
    var rBtns = rayChoices.querySelectorAll("button");
    for (var bi = 0; bi < rBtns.length; bi++) {
      (function (idx) {
        rBtns[idx].addEventListener("click", function (e) { e.stopPropagation(); pickRayChoice(idx); });
      })(bi);
    }
  }
  var attackBtn = document.getElementById("attackBtn");
  if (attackBtn) attackBtn.addEventListener("click", function (e) { e.stopPropagation(); tryAttack(); });
  var enterBtn = document.getElementById("enterBtn");
  if (enterBtn) enterBtn.addEventListener("click", function (e) { e.stopPropagation(); tryEnter(); });
  var manifestBtn = document.getElementById("manifestBtn");
  if (manifestBtn) manifestBtn.addEventListener("click", function (e) { e.stopPropagation(); manifest(); });
  var mirrorCloseBtn = document.getElementById("mirrorCloseBtn");
  if (mirrorCloseBtn) mirrorCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); exitMirror(); });
  var photoPopup = document.getElementById("photoPopup");
  if (photoPopup) photoPopup.addEventListener("click", function (e) { e.stopPropagation(); closePhoto(); });
  var mapBtn = document.getElementById("mapBtn");
  if (mapBtn) mapBtn.addEventListener("click", function (e) { e.stopPropagation(); openMap(); });
  var mapPopup = document.getElementById("mapPopup");
  if (mapPopup) mapPopup.addEventListener("click", function (e) { e.stopPropagation(); closeMap(); });
  var mapWrap = document.getElementById("mapWrap");
  if (mapWrap) mapWrap.addEventListener("click", function (e) { e.stopPropagation(); mapJump(e); });
  canvas.addEventListener("pointercancel", pointerEnd);
  canvas.addEventListener("pointerleave", pointerEnd);
})();
