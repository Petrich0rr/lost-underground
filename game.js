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
    garden: { w: 2172, h: 724, frames: null, floor: 0.77, depth: 0.02, minX: 200 },
    quarry: { w: 2172, h: 724, frames: null, floor: 0.87, depth: 0.04 },
    tunnels: { w: 2172, h: 724, frames: null, floor: 0.83, depth: 0.04 },
    dungeon: { w: 2172, h: 724, frames: null, floor: 0.84, depth: 0.04 },
    dungeon2: { w: 2172, h: 724, frames: null, floor: 0.83, depth: 0.04 },
    dungeon3: { w: 2172, h: 724, frames: null, floor: 0.83, depth: 0.04 },
    dungeon4: { w: 2172, h: 724, frames: null, floor: 0.83, depth: 0.04 },
    upper1: { w: 2172, h: 724, frames: null, floor: 0.82, depth: 0.03 },
    upper2: { w: 2172, h: 724, frames: null, floor: 0.82, depth: 0.03 },
    upper3: { w: 2172, h: 724, frames: null, floor: 0.82, depth: 0.03 },
    earthen: { w: 2172, h: 724, frames: null, floor: 0.85, depth: 0.05 },
    surface: { w: 2172, h: 724, frames: null, floor: 0.74, depth: 0.02, minX: 400 }
  };
  function room() { return ROOMS[g.room]; }
  // Leftmost walkable x for this room. Most rooms use 60; the garden
  // and the surface have a floating ledge on the left, so they stop
  // at the stairs where solid ground starts.
  function roomMinX() { return room().minX || 60; }
  var SYLVIA_WALK = ["assets/sylvia-walk-01.png", "assets/sylvia-walk-02.png", "assets/sylvia-walk-03.png", "assets/sylvia-walk-04.png", "assets/sylvia-walk-05.png", "assets/sylvia-walk-06.png", "assets/sylvia-walk-07.png", "assets/sylvia-walk-08.png"];
  var SYLVIA_IDLE_SRC = "assets/sylvia-idle.png";
  var RAY_WALK = ["assets/ray-walk-01.png", "assets/ray-walk-02.png", "assets/ray-walk-03.png", "assets/ray-walk-04.png", "assets/ray-walk-05.png", "assets/ray-walk-06.png", "assets/ray-walk-07.png", "assets/ray-walk-08.png"];
  var RAY_IDLE_SRC = "assets/ray-idle.png";
  var BG_SRCS = ["assets/bg-bar-01.jpg", "assets/bg-bar-02.jpg", "assets/bg-bar-03.jpg"];

  // "?v=92" forces a fresh download: missions, the Vicky drink
  // cutscene and the Mayor cutscene art, and the Mayor appearing
  // from Day 2. A browser that cached ?v=83 picks it up.
  function loadImg(src) { var img = new Image(); img.src = src + "?v=92"; return img; }

  var canvas = document.getElementById("game");
  var wrap = document.getElementById("gameWrap");
  var ctx = canvas.getContext("2d");

  var sylviaWalkImgs = SYLVIA_WALK.map(loadImg);
  var sylviaIdleImg = loadImg(SYLVIA_IDLE_SRC);
  var rayWalkImgs = RAY_WALK.map(loadImg);
  var rayIdleImg = loadImg(RAY_IDLE_SRC);
  var kissImg = loadImg("assets/kiss.png");
  var proposeKneelImgs = ["assets/propose-kneel-01.png", "assets/propose-kneel-02.png", "assets/propose-kneel-03.png", "assets/propose-kneel-04.png", "assets/propose-kneel-05.png", "assets/propose-kneel-06.png"].map(loadImg);
  proposeAskImg = loadImg("assets/propose-ask.png");
  proposeSurpriseImgs = ["assets/propose-surprise-01.png", "assets/propose-surprise-02.png", "assets/propose-surprise-03.png"].map(loadImg);
  proposeYesImg = loadImg("assets/propose-yes.png");
  proposeEmbraceImg = loadImg("assets/propose-embrace.png");
  var rescueImgs = ["assets/rescue-01.png", "assets/rescue-02.png", "assets/rescue-03.png", "assets/rescue-04.png", "assets/rescue-05.png", "assets/rescue-06.png", "assets/rescue-07.png", "assets/rescue-08.png"].map(loadImg);
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
  // Eve, Sylvia's best friend and Char's granddaughter. She wanders
  // the Shopping District street. Four walk frames (facing right),
  // a standing pose, and talk, surprised and laughing poses.
  var eveWalkImgs = ["assets/eve-walk-01.png", "assets/eve-walk-02.png", "assets/eve-walk-03.png", "assets/eve-walk-04.png"].map(loadImg);
  var eveIdleImg = loadImg("assets/eve-idle.png");
  var eveTalkImg = loadImg("assets/eve-talk.png");
  var eveSurprisedImg = loadImg("assets/eve-surprised.png");
  var eveLaughImg = loadImg("assets/eve-laugh.png");
  // Alexis, one of the wealthiest in the underground, spoiled and
  // bitchy, lowkey after Ray. She wanders the Shopping District
  // street and goes to the clothing store and the bar often. Four
  // walk frames (facing right), a standing pose, and talk, surprised
  // and laughing poses.
  var alexisWalkImgs = ["assets/alexis-walk-01.png", "assets/alexis-walk-02.png", "assets/alexis-walk-03.png", "assets/alexis-walk-04.png"].map(loadImg);
  var alexisIdleImg = loadImg("assets/alexis-idle.png");
  var alexisTalkImg = loadImg("assets/alexis-talk.png");
  var alexisSurprisedImg = loadImg("assets/alexis-surprised.png");
  var alexisLaughImg = loadImg("assets/alexis-laugh.png");
  // Priya, an Indian gym girlie, always running and staying fit,
  // cool and admirable and sweet, always ready with health advice
  // and tips for staying healthy even in the underground. She runs
  // around the Shopping District street and the Flooded Cistern.
  // Four run frames (facing right), a running stance for her pause,
  // and talk, surprised and laughing poses.
  var priyaRunImgs = ["assets/priya-run-01.png", "assets/priya-run-02.png", "assets/priya-run-03.png", "assets/priya-run-04.png"].map(loadImg);
  var priyaIdleImg = loadImg("assets/priya-idle.png");
  var priyaTalkImg = loadImg("assets/priya-talk.png");
  var priyaSurprisedImg = loadImg("assets/priya-surprised.png");
  var priyaLaughImg = loadImg("assets/priya-laugh.png");
  // Diego, Mexican, super flirty and popular, but bros with Ray.
  // He is always in the bar, sometimes stepping out to the
  // Shopping District street. Four walk frames (facing right), a
  // standing pose, and talk, surprised and laughing poses.
  var diegoWalkImgs = ["assets/diego-walk-01.png", "assets/diego-walk-02.png", "assets/diego-walk-03.png", "assets/diego-walk-04.png"].map(loadImg);
  var diegoIdleImg = loadImg("assets/diego-idle.png");
  var diegoTalkImg = loadImg("assets/diego-talk.png");
  var diegoSurprisedImg = loadImg("assets/diego-surprised.png");
  var diegoLaughImg = loadImg("assets/diego-laugh.png");
  // Dr. Kian, a Persian hot doctor who cures people in the
  // underground. He is a gentle man and very pure hearted. He walks
  // around the Shopping District street but is mostly in the bar.
  // Four walk frames (facing right), a standing pose, and talk,
  // surprised and laughing poses.
  var kianWalkImgs = ["assets/kian-walk-01.png", "assets/kian-walk-02.png", "assets/kian-walk-03.png", "assets/kian-walk-04.png"].map(loadImg);
  var kianIdleImg = loadImg("assets/kian-idle.png");
  var kianTalkImg = loadImg("assets/kian-talk.png");
  var kianSurprisedImg = loadImg("assets/kian-surprised.png");
  var kianLaughImg = loadImg("assets/kian-laugh.png");
  // Yuto, a Japanese sexy nerd that loves reading. He is always
  // teaching people something new and interesting facts. He is a bit
  // cocky and egoistic, but in a hot way. He wanders the Shopping
  // District street and the bar. Four walk frames (facing right), a
  // standing pose, and talk, surprised and laughing poses.
  var yutoWalkImgs = ["assets/yuto-walk-01.png", "assets/yuto-walk-02.png", "assets/yuto-walk-03.png", "assets/yuto-walk-04.png"].map(loadImg);
  var yutoIdleImg = loadImg("assets/yuto-idle.png");
  var yutoTalkImg = loadImg("assets/yuto-talk.png");
  var yutoSurprisedImg = loadImg("assets/yuto-surprised.png");
  var yutoLaughImg = loadImg("assets/yuto-laugh.png");
  // Mayor Adler, the mayor of the whole underground city. He looks evil
  // but is actually a sweetheart who just does not know how to
  // speak. He is trying his best. He is constantly in the bar and
  // walks slow with his cane. Four walk frames (facing right), a
  // standing pose, and talk, surprised and laughing poses.
  var adlerWalkImgs = ["assets/adler-walk-01.png", "assets/adler-walk-02.png", "assets/adler-walk-03.png", "assets/adler-walk-04.png"].map(loadImg);
  var adlerIdleImg = loadImg("assets/adler-idle.png");
  var adlerTalkImg = loadImg("assets/adler-talk.png");
  var adlerSurprisedImg = loadImg("assets/adler-surprised.png");
  var adlerLaughImg = loadImg("assets/adler-laugh.png");
  // Cutscene art: Vicky serving drinks at the bar, and the Mayor
  // talking to Sylvia and Ray. Both are full-screen backdrops
  // for their cutscenes, drawn at full height with the sides cropped.
  var vickyCutsceneImg = loadImg("assets/cutscene-vicky.jpg");
  var mayorCutsceneImg = loadImg("assets/cutscene-mayor.jpg");
  // Mika, a Filipina girl who lives in the Flooded Cistern. Four
  // walk frames (facing right), a standing pose, talk, surprised
  // and laughing poses, and a sitting pose: she is mostly sitting
  // down, so sitting is her rest pose.
  var mikaWalkImgs = ["assets/mika-walk-01.png", "assets/mika-walk-02.png", "assets/mika-walk-03.png", "assets/mika-walk-04.png"].map(loadImg);
  var mikaIdleImg = loadImg("assets/mika-idle.png");
  var mikaTalkImg = loadImg("assets/mika-talk.png");
  var mikaSurprisedImg = loadImg("assets/mika-surprised.png");
  var mikaLaughImg = loadImg("assets/mika-laugh.png");
  var mikaSitImg = loadImg("assets/mika-sit.png");
  // X, a hooded stranger who stays at the bottom of the dungeon (the
  // Court of Justice). Four walk frames (facing right), a standing
  // pose, talk, surprised and laughing poses. Nobody has ever seen
  // him, and he does not say much, but he knows a lot of secrets.
  var xWalkImgs = ["assets/x-walk-01.png", "assets/x-walk-02.png", "assets/x-walk-03.png", "assets/x-walk-04.png"].map(loadImg);
  var xIdleImg = loadImg("assets/x-idle.png");
  var xTalkImg = loadImg("assets/x-talk.png");
  var xSurprisedImg = loadImg("assets/x-surprised.png");
  var xLaughImg = loadImg("assets/x-laugh.png");
  // Sylvia's surprised pose, for the first time she sees X.
  var sylviaSurprisedImg = loadImg("assets/sylvia-pose-surprised.png");
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
  var gardenImg = loadImg("assets/bg-secret-garden.jpg");
  var quarryImg = loadImg("assets/bg-quarry.jpg");
  var tunnelsImg = loadImg("assets/bg-tunnels.jpg");
  var dungeonImg = loadImg("assets/bg-dungeon.jpg");
  var dungeon2Img = loadImg("assets/bg-dungeon2.jpg");
  var dungeon3Img = loadImg("assets/bg-dungeon3.jpg");
  var dungeon4Img = loadImg("assets/bg-dungeon4.jpg");
  // Dungeon monsters: four cuties who live in the Ancient Dungeon.
  // Each has 4 frames that cycle as it moves, hops, or bobs.
  var monsterKeyknightImgs = [loadImg("assets/monster-keyknight-01.png"), loadImg("assets/monster-keyknight-02.png"), loadImg("assets/monster-keyknight-03.png"), loadImg("assets/monster-keyknight-04.png")];
  var monsterCandlepupImgs = [loadImg("assets/monster-candlepup-01.png"), loadImg("assets/monster-candlepup-02.png"), loadImg("assets/monster-candlepup-03.png"), loadImg("assets/monster-candlepup-04.png")];
  var monsterBiteyrockImgs = [loadImg("assets/monster-biteyrock-01.png"), loadImg("assets/monster-biteyrock-02.png"), loadImg("assets/monster-biteyrock-03.png"), loadImg("assets/monster-biteyrock-04.png")];
  var monsterBellghostImgs = [loadImg("assets/monster-bellghost-01.png"), loadImg("assets/monster-bellghost-02.png"), loadImg("assets/monster-bellghost-03.png"), loadImg("assets/monster-bellghost-04.png")];
  var coinImgs = [loadImg("assets/coin-01.png"), loadImg("assets/coin-02.png"), loadImg("assets/coin-03.png"), loadImg("assets/coin-04.png")];
  var heartFullImg = loadImg("assets/heart-full.png");
  var heartHalfImg = loadImg("assets/heart-half.png");
  var heartEmptyImg = loadImg("assets/heart-empty.png");
  var shadowImg = loadImg("assets/shadow.png");
  var glowBlueImg = loadImg("assets/glow-blue.png");
  var energyBgImg = loadImg("assets/energy-bg.png");
  var energyFillImg = loadImg("assets/energy-fill.png");
  var energyFillLowImg = loadImg("assets/energy-fill-low.png");
  // Treasure chest opening: closed, slightly open, open with coins,
  // open with more coins and a sparkle. All on one common canvas,
  // bottom-aligned, so the lid rises and the base stays put.
  var chestImgs = [loadImg("assets/chest-01.png"), loadImg("assets/chest-02.png"), loadImg("assets/chest-03.png"), loadImg("assets/chest-04.png")];
  var upper1Img = loadImg("assets/bg-upper1.jpg");
  var upper2Img = loadImg("assets/bg-upper2.jpg");
  var upper3Img = loadImg("assets/bg-upper3.jpg");
  var earthenImg = loadImg("assets/bg-earthen-tunnel.jpg");
  var surfaceImg = loadImg("assets/bg-surface.jpg");
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
  // The midair descent: Ray and Sylvia jumping down to the tunnels,
  // holding hands. Shown full screen while they fall through the
  // secret passage under the arcade floor.
  var descentImg = loadImg("assets/descent.jpg");
  var rayCrouchImg = loadImg("assets/ray-crouch.png");

  // ---- Outfits and hairstyles (v87) ----
  // Sylvia and Ray can buy outfits at Char's fashion store and
  // hairstyles at Mikey's salon, then change into what they own at
  // the closet in their room (the chamber). What they wear now is
  // the default, always free to change back to.
  var SHOP_ITEMS = [
    { id: "olive", who: "sylvia", kind: "outfit", name: "Olive Pantsuit", price: 20, desc: "A sharp olive suit. Sylvia's power look." },
    { id: "corset", who: "sylvia", kind: "outfit", name: "White Corset Outfit", price: 20, desc: "A white corset with a ruffle skirt and white boots." },
    { id: "black", who: "sylvia", kind: "outfit", name: "Black Exclusive Set", price: 60, desc: "The exclusive set. Black crop top and shorts, sunglasses, buns and a checkered bag. The most expensive piece in the store." },
    { id: "brownsuit", who: "ray", kind: "outfit", name: "Brown Suit", price: 25, desc: "A tailored brown suit. Ray cleans up well." },
    { id: "lightblue", who: "ray", kind: "outfit", name: "Light Blue Casual", price: 20, desc: "A light blue shirt and white pants. Easy and cool." },
    { id: "ponytail", who: "sylvia", kind: "hair", name: "Golden Ponytail", price: 15, desc: "Sylvia's hair up in a high golden ponytail." },
    { id: "straight", who: "sylvia", kind: "hair", name: "Straight Blonde", price: 15, desc: "Sylvia's hair worn long and straight." },
    { id: "fluffy", who: "ray", kind: "hair", name: "Fluffy Afro", price: 15, desc: "Ray's hair big and fluffy." },
    { id: "bandana", who: "ray", kind: "hair", name: "Black Bandana", price: 10, desc: "A black bandana for Ray." }
  ];
  function shopItem(id) { for (var i = 0; i < SHOP_ITEMS.length; i++) if (SHOP_ITEMS[i].id === id) return SHOP_ITEMS[i]; return null; }
  function ownsItem(id) { return g.look.owned.indexOf(id) >= 0; }
  function buyItem(id) {
    var it = shopItem(id);
    if (!it || ownsItem(id) || g.coinCount < it.price) return false;
    g.coinCount -= it.price;
    g.look.owned.push(id);
    saveGame();
    return true;
  }
  // Equip an outfit or a hairstyle from the closet. The Black
  // Exclusive Set comes with the buns, so putting it on sets her
  // hair to buns; changing her hair away from buns while wearing
  // it takes the set off again, back to her blue dress.
  function equipItem(id) {
    var it = shopItem(id);
    if (!it) return;
    if (it.kind === "outfit") {
      if (it.who === "sylvia") {
        g.look.sylviaOutfit = id;
        if (id === "black") g.look.sylviaHair = "buns";
        else if (g.look.sylviaHair === "buns") g.look.sylviaHair = "wavy";
      } else {
        g.look.rayOutfit = id;
      }
    } else {
      if (it.who === "sylvia") {
        g.look.sylviaHair = id;
        if (g.look.sylviaOutfit === "black" && id !== "buns") g.look.sylviaOutfit = "default";
      } else {
        g.look.rayHair = id;
      }
    }
    preloadLook();
    saveGame();
  }
  function equipDefault(who, kind) {
    if (who === "sylvia") {
      if (kind === "outfit") g.look.sylviaOutfit = "default";
      else g.look.sylviaHair = "wavy";
    } else {
      if (kind === "outfit") g.look.rayOutfit = "default";
      else g.look.rayHair = "afro";
    }
    preloadLook();
    saveGame();
  }
  // Sprite lookup for the current look. Each getter returns the
  // outfit image when it exists and has loaded, and the default
  // outfit's sprite otherwise, so the characters never vanish
  // while a new outfit is still downloading. The Olive walk, front
  // and back views and its stance and kick were only drawn with
  // wavy hair, so a ponytail or straight-haired Olive still walks
  // in wavy; her idle and poses do change with her hair.
  var outfitImgCache = {};
  function outfitImg(path) {
    if (!outfitImgCache[path]) outfitImgCache[path] = loadImg(path);
    return outfitImgCache[path];
  }
  function sylviaOutfitPath(kind, num) {
    var outfit = g.look.sylviaOutfit, hair = g.look.sylviaHair;
    if (outfit === "default") return null;
    if (outfit === "black") hair = "buns";
    else if (hair === "buns") hair = "wavy";
    var has = {
      corset: { walk: 1, front: 1, back: 1, idle: 1, crouch: 1, surprised: 1, climb: 1 },
      olive: { walk: 1, front: 1, back: 1, idle: 1, crouch: 1, surprised: 1, climb: 1, stance: 1, kick: 1 },
      black: { walk: 1, front: 1, back: 1, idle: 1, crouch: 1, surprised: 1, climb: 1, stance: 1, kick: 1 }
    }[outfit];
    if (!has || !has[kind]) return null;
    if (outfit === "olive" && (kind === "walk" || kind === "front" || kind === "back" || kind === "stance" || kind === "kick")) hair = "wavy";
    var base = "assets/sylvia-" + outfit + "-" + kind + "-" + hair;
    if (num) base += "-" + ("0" + num).slice(-2);
    return base + ".png";
  }
  function sylviaLookImg(kind, num, fallback) {
    var p = sylviaOutfitPath(kind, num);
    if (!p) return fallback;
    var img = outfitImg(p);
    return (img.complete && img.naturalWidth !== 0) ? img : fallback;
  }
  function sylviaWalk(i) { return sylviaLookImg("walk", i + 1, sylviaWalkImgs[i]); }
  function sylviaIdle() { return sylviaLookImg("idle", 0, sylviaIdleImg); }
  function sylviaFront(i) { return sylviaLookImg("front", i + 1, sylviaFrontWalkImgs[i]); }
  function sylviaBack(i) { return sylviaLookImg("back", i + 1, sylviaBackWalkImgs[i]); }
  function sylviaStance() { return sylviaLookImg("stance", 0, sylviaStanceImg); }
  function sylviaKick() { return sylviaLookImg("kick", 0, sylviaKickImg); }
  function sylviaCrouch() { return sylviaLookImg("crouch", 0, sylviaCrouchImg); }
  function sylviaSurprised() { return sylviaLookImg("surprised", 0, sylviaSurprisedImg); }
  function sylviaClimb() { return sylviaLookImg("climb", 0, sylviaClimbImg); }
  // Ray's combat and talk poses live in the Light Blue sheets under
  // different file names (combat-stance, combat-punch, pose-reach,
  // pose-crossed, pose-crouch). The Brown Suit has no combat art, so
  // it falls back to his default tank-top poses.
  var RAY_SLOT_FILE = { stance: "combat-stance", punch: "combat-punch", reach: "pose-reach", talk: "pose-crossed", "talk-shy": "pose-crossed", crouch: "pose-crouch" };
  function rayOutfitPath(kind, num) {
    var outfit = g.look.rayOutfit, hair = g.look.rayHair;
    if (outfit === "default") return null;
    var has = {
      brownsuit: { walk: 1, front: 1, back: 1, idle: 1 },
      lightblue: { walk: 1, front: 1, back: 1, idle: 1, stance: 1, punch: 1, reach: 1, talk: 1, "talk-shy": 1, crouch: 1 }
    }[outfit];
    if (!has || !has[kind]) return null;
    var fileKind = RAY_SLOT_FILE[kind] || kind;
    var base = "assets/ray-" + outfit + "-" + fileKind + "-" + hair;
    if (num) base += "-" + ("0" + num).slice(-2);
    return base + ".png";
  }
  function rayLookImg(kind, num, fallback) {
    var p = rayOutfitPath(kind, num);
    if (!p) return fallback;
    var img = outfitImg(p);
    return (img.complete && img.naturalWidth !== 0) ? img : fallback;
  }
  function rayWalk(i) { return rayLookImg("walk", i + 1, rayWalkImgs[i]); }
  function rayIdle() { return rayLookImg("idle", 0, rayIdleImg); }
  function rayFront(i) { return rayLookImg("front", i + 1, rayFrontWalkImgs[i]); }
  function rayBack(i) { return rayLookImg("back", i + 1, rayBackWalkImgs[i]); }
  function rayStance() { return rayLookImg("stance", 0, rayStanceImg); }
  function rayPunch() { return rayLookImg("punch", 0, rayPunchImg); }
  function rayReach() { return rayLookImg("reach", 0, rayReachImg); }
  function rayTalk() { return rayLookImg("talk", 0, rayTalkImg); }
  function rayTalkShy() { return rayLookImg("talk-shy", 0, rayTalkShyImg); }
  function rayCrouch() { return rayLookImg("crouch", 0, rayCrouchImg); }
  // Start downloading the current look's sprites so they are ready
  // by the time the closet or shop panel closes.
  function preloadLook() {
    var kinds = ["walk", "front", "back", "idle", "stance", "kick", "crouch", "surprised", "climb"];
    var i, p;
    for (i = 0; i < kinds.length; i++) {
      p = sylviaOutfitPath(kinds[i], 1);
      if (p) outfitImg(p);
      p = rayOutfitPath(kinds[i], 1);
      if (p) outfitImg(p);
    }
    for (i = 1; i <= 8; i++) {
      p = sylviaOutfitPath("walk", i); if (p) outfitImg(p);
      p = rayOutfitPath("walk", i); if (p) outfitImg(p);
    }
  }

  // The pink scooter Gunner sells, and the four riding frames of
  // Ray driving with Sylvia in front. The scooter is parked on the
  // shopping street after you buy it, and you ride it together.
  var scooterImg = loadImg("assets/scooter.png");
  var scooterRideImgs = ["assets/scooter-ride-01.png", "assets/scooter-ride-02.png", "assets/scooter-ride-03.png", "assets/scooter-ride-04.png"].map(loadImg);
  ROOMS.bar.frames = bgImgs;
  ROOMS.chamber.frames = [chamberImg];
  ROOMS.subway.frames = [subwayImg];
  ROOMS.shopping.frames = [shoppingImg];
  ROOMS.repair.frames = [repairImg];
  ROOMS.clothing.frames = [clothingImg];
  ROOMS.salon.frames = [salonImg];
  ROOMS.arcade.frames = [arcadeImg];
  ROOMS.cistern.frames = [cisternImg];
  ROOMS.garden.frames = [gardenImg];
  ROOMS.quarry.frames = [quarryImg];
  ROOMS.tunnels.frames = [tunnelsImg];
  ROOMS.dungeon.frames = [dungeonImg];
  ROOMS.dungeon2.frames = [dungeon2Img];
  ROOMS.dungeon3.frames = [dungeon3Img];
  ROOMS.dungeon4.frames = [dungeon4Img];
  ROOMS.upper1.frames = [upper1Img];
  ROOMS.upper2.frames = [upper2Img];
  ROOMS.upper3.frames = [upper3Img];
  ROOMS.earthen.frames = [earthenImg];
  ROOMS.surface.frames = [surfaceImg];
  // Scattered junk on the floor of the deep underground rooms.
  // x is world px, d is depth across the floor band (0 back, 1
  // front), h is the height in canvas px. name and text make a prop
  // readable: walk up and press E or I to inspect it. The papers
  // can hint at the way up; the rest is just trash down here.
  var PROPS = {
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
    quarry: [],
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
    // Eve, Sylvia's best friend and Char's granddaughter. She only
    // ever stands and walks on the Shopping District street, never
    // anywhere else. laughT counts down a laugh after she says
    // something funny; surprisedT counts down her greeting surprise.
    eve: { x: 1200, dir: -1, pause: 120, walk: 0, depth: 0, vdir: 0, laughT: 0, surprisedT: 0 },
    // Alexis, one of the wealthiest in the underground, spoiled and
    // bitchy, lowkey after Ray. She wanders the Shopping District
    // street and goes to the clothing store and the bar often, so her
    // room rotates between the three when Sylvia is not with her.
    // roomT counts down to her next move; laughT and surprisedT are
    // her talk poses, like Eve's.
    alexis: { x: 1400, dir: 1, pause: 120, walk: 0, depth: 0, room: "shopping", roomT: 3000, laughT: 0, surprisedT: 0 },
    // Priya, an Indian gym girlie, always running and staying fit,
    // cool and admirable and sweet, always ready with health advice.
    // She runs around the Shopping District street and the Flooded
    // Cistern, so her room rotates between the two when Sylvia is
    // not with her. roomT counts down to her next move; laughT and
    // surprisedT are her talk poses, like Eve's and Alexis's.
    priya: { x: 1400, dir: 1, pause: 60, walk: 0, depth: 0, room: "shopping", roomT: 3000, laughT: 0, surprisedT: 0 },
    // Diego, Mexican, super flirty and popular, but bros with Ray.
    // He is always in the bar, sometimes stepping out to the
    // Shopping District street, so his room rotates between the two
    // when Sylvia is not with him. roomT counts down to his next
    // move; laughT and surprisedT are his talk poses, like the
    // others'.
    diego: { x: 900, dir: 1, pause: 120, walk: 0, depth: 0, room: "bar", roomT: 3000, laughT: 0, surprisedT: 0 },
    // Dr. Kian, a Persian hot doctor who cures people in the
    // underground. He is a gentle man and very pure hearted. He
    // walks around the Shopping District street but is mostly in the
    // bar, so his room rotates between the two, weighted toward the
    // bar, when Sylvia is not with him. roomT counts down to his
    // next move; laughT and surprisedT are his talk poses, like the
    // others'.
    kian: { x: 850, dir: 1, pause: 120, walk: 0, depth: 0, room: "shopping", roomT: 3000, laughT: 0, surprisedT: 0 },
    // Yuto, a Japanese sexy nerd that loves reading. He is always
    // teaching people something new and interesting facts. He is a
    // bit cocky and egoistic, but in a hot way. He wanders the
    // Shopping District street and the bar, so his room rotates
    // between the two when Sylvia is not with him. roomT counts
    // down to his next move; laughT and surprisedT are his talk
    // poses, like the others'.
    yuto: { x: 900, dir: 1, pause: 120, walk: 0, depth: 0, room: "shopping", roomT: 3000, laughT: 0, surprisedT: 0 },
    // Mayor Adler, the mayor of the whole underground city. He looks evil
    // but is actually a sweetheart who just does not know how to
    // speak. He is trying his best. He is constantly in the bar, so
    // he never changes rooms (no roomT); he just walks slow with his
    // cane, back and forth. laughT and surprisedT are his talk
    // poses, like the others'.
    adler: { x: 700, dir: 1, pause: 120, walk: 0, depth: 0, room: "bar", laughT: 0, surprisedT: 0 },
    // Mika: she lives in the Flooded Cistern and never leaves it, so
    // she never changes rooms (no roomT). She wanders it slowly and
    // sits down whenever she pauses, because she is mostly sitting
    // down. sitting is her rest pose; sitT counts how long she has
    // been paused, and she sits once it passes 90 ticks. She starts
    // sitting, by the water at x 1350.
    mika: { x: 1350, dir: 1, pause: 300, walk: 0, depth: 0, room: "cistern", laughT: 0, surprisedT: 0, sitting: true, sitT: 0 },
    // X: he stays at the bottom of the dungeon (the Court of Justice)
    // and never leaves it, so he never changes rooms (no roomT). He
    // wanders it slowly, hooded, saying almost nothing.
    stranger: { x: 1000, dir: 1, pause: 120, walk: 0, depth: 0, room: "dungeon4", laughT: 0, surprisedT: 0 },
    // Sylvia's first sight of X: she is surprised, and shows it once.
    xSeen: false, sylviaSurprisedT: 0,
    kiss: { active: false, t: 0 },
    attack: { active: false, t: 0, cooldown: 0 },
    talk: { open: false, idx: -1 },
    ownerTalk: { open: false, idx: -1, key: null },
    kidTalk: { open: false, idx: -1, key: null },
    eveTalk: { open: false, idx: -1 },
    alexisTalk: { open: false, idx: -1 },
    priyaTalk: { open: false, idx: -1 },
    diegoTalk: { open: false, idx: -1 },
    kianTalk: { open: false, idx: -1 },
    yutoTalk: { open: false, idx: -1 },
    adlerTalk: { open: false, idx: -1 },
    mikaTalk: { open: false, idx: -1 },
    strangerTalk: { open: false, idx: -1 },
    // Talking to Ray: open while the conversation runs. step 0 is
    // Ray's opening line (Sylvia's turn to pick a reply), step 1 is
    // Sylvia's line showing, step 2 is Ray's reply showing.
    rayTalk: { open: false, step: 0, rayIdx: -1, choice: -1, sylIdx: -1, replyIdx: -1, choiceLines: [-1, -1, -1, -1] },
    // Reading a piece of junk on the floor: open while the little
    // bubble shows what it says. The papers can hint at the way up;
    // the rest is just trash down here.
    propRead: { open: false, name: "", text: "", x: 0, img: "" },
    // The room she was in last tick, so a room change shows the
    // little intro line for the new place.
    lastRoom: null,
    hp: 100, hpMax: 100,
    // Energy: Sylvia's stamina for the day. It drains very slowly
    // while she is awake (about 25 minutes to empty) and refills
    // when she sleeps. At zero she walks slower and cannot run.
    // day counts the mornings; it
    // goes up by one every time she wakes up. started stays false
    // on the title screen, so the world waits until she picks
    // Continue or New Game.
    energy: 100, energyMax: 100, day: 1, started: false,
    // Dungeon monsters and coins: the monsters live only in the
    // Ancient Dungeon and are spawned fresh each time she enters it.
    // A monster drops 1 coin when it dies, picked up by walking over
    // it. monsterHits counts monster hits toward losing a heart (3
    // hits = one heart). hurtT is a brief invulnerability after a
    // hit. kissHealT is the cooldown before a kiss can heal again.
    monsters: [], coins: [], coinCount: 0, monsterHits: 0, hurtT: 0, kissHealT: 0,
    fountainWished: false, fountainMsg: "", fountainMsgT: 0,
    gardenUnlocked: false, mayorCutsceneDone: false,
    mayorCutscene: { active: false, step: 0, t: 0 },
    // Vicky's drink cutscene: the first mission, talking to her
    // at the bar. One time only.
    vickyCutsceneDone: false,
    vickyCutscene: { active: false, step: 0, t: 0 },
    // Missions: the story in order, from talking to Vicky to the
    // proposal on the Surface. missionsDone is a set of completed
    // mission ids; the current one is the first not yet done.
    missionsDone: {},
    missionsOpen: false,
    subwayUnlocked: false, dungeonCleared: {},
    xCutsceneDone: false, xCutscene: { active: false, step: 0, t: 0 },
    arcadeMinigameDone: false, subwayPuzzlesDone: false,
    // The quarry crystal mission: five glowing crystals in the
    // Crystal Quarry. Gather them all and the iron door opens.
    crystals: [0, 1, 2, 3, 4], crystalCount: 0, quarryMissionDone: false,
    jumpT: 0,
    visited: { chamber: true, shopping: true },
    fountainSecret: null, secretOpen: false,
    chestsOpened: {}, chestOpen: null, chestMsg: "", chestMsgT: 0,
    dungeonMsg: "", dungeonMsgT: 0,
    chestLayout: [], chestDay: 1,
    homeWalk: { active: false, t: 0 },
    // The proposal on the Surface: once, when they walk all the way
    // to the right edge of the outside, Ray proposes. proposal holds
    // the cutscene (step 0 Ray asks, 1 Sylvia surprised, 2 she says
    // yes, 3 the kiss). proposed stays true after so it only ever
    // happens once.
    proposal: { active: false, step: 0, t: 0 },
    proposed: false,
    // The rescue: when her health or her energy runs out, Sylvia
    // collapses and Ray carries her home. Dr. Kian is waiting in
    // the chamber, says his piece, then walks out. phase is carry
    // (the animation), kian (his lines), or leave (he walks out).
    rescue: { active: false, phase: "carry", t: 0, line: 0, kianX: 900 },
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
    dungeonControls: { open: false, seen: false },
    // Gunner's pink scooter: owned once you buy it from his shop for
    // $0, riding while the two of them are on it together, x is where
    // it is parked on the shopping street, frame is the riding
    // animation frame. The shop is open while the shop panel shows.
    scooter: { owned: false, riding: false, x: 280, frame: 0, room: "shopping" },
    shopOpen: false,
    // True while the sleep confirm panel shows: she has to say yes
    // before sleeping, because sleeping moves to the next day.
    sleepConfirmOpen: false,
    // Char's fashion shop: the store is empty right now (the gown
    // and bandana were removed). The fashion state stays in the
    // save so old saves still load. fashionOpen is true while
    // the fashion panel shows.
    fashion: { gownOwned: false, gownOn: false, bandanaOwned: false, bandanaOn: false },
    fashionOpen: false,
    // Outfits and hairstyles (v87): what Sylvia and Ray are wearing
    // right now, and which shop items they own. "default" is the blue
    // dress and black tank they started in, always free to change
    // back to. salonOpen / closetOpen are true while those panels show.
    look: { sylviaOutfit: "default", sylviaHair: "wavy", rayOutfit: "default", rayHair: "afro", owned: [] },
    salonOpen: false,
    closetOpen: false,
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
  // Her head in the bar art sits a little right of where she stands,
  // so the talk bubble points at her head, not at her feet.
  var VICKY_HEAD_X = 585;
  // Vicky's drink cutscene: the first mission. She has poured drinks
  // here forever, she tells them the stairs go up, the Mayor comes
  // tomorrow, and the drinks are on her. Kept short so each step
  // fits two rows in the story bubble.
  var VICKY_CUTSCENE_LINES = [
    "A new face! Sit, sit. I have poured drinks here since I could reach the top shelf.",
    "My mom worked this bar before me. Her mom before that. We never leave.",
    "The stairs to the right? They go up. Nobody ever comes back to tell me what is up there.",
    "But the Mayor will be here tomorrow. Come back and ask him. He knows things.",
    "Furthest I have ever been is the Flooded Cistern, past the shops. Now, drinks are on me."
  ];
  // After the cutscene, talking to Vicky again is short and warm.
  var VICKY_AFTER_LINES = [
    "Drinks are on me, hon. You two look like you need one.",
    "The Mayor was in here again. He talks a lot when he drinks. You should listen.",
    "You are still here? Go on. The stairs are not going anywhere. Probably."
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
  // Eve, Sylvia's best friend and Char's granddaughter. She wanders
  // the Shopping District street, fun and bubbly and always uplifting.
  // She laughs after her jokes, so a new line sets her laugh timer.
  var EVE_LINES = [
    "Sylvia! Oh my god, hi! I was just thinking about you. I always think about you. That is what best friends do.",
    "Grandma Char says my dress is too shiny for the underground. I told her the underground is too dark for ME.",
    "You and Ray are so cute it hurts. Like, my teeth hurt. In a good way. Mostly.",
    "I walked the whole street today and I did not trip once. In these boots. Somebody give me a medal.",
    "If we ever get out of here, first thing I am doing is finding a mirror in real sunlight. I bet I look AMAZING in it.",
    "Ray tried to carry three shopping bags at once yesterday. Three. He dropped two. I laughed so hard I cried.",
    "People say the underground is depressing. I say it just needs better lighting and a disco ball. I am the disco ball.",
    "Vicky poured me a drink and said 'on the house.' I said 'girl, we LIVE in the house.' She did not laugh. I laughed enough for both of us.",
    "Char taught me everything about fashion. Rule one: if the dress does not sparkle, why are you even wearing it?",
    "No matter what happens down here, we have each other. And I have this dress. We are going to be just fine."
  ];
  function eveNear() { return g.room === "shopping" && Math.abs(g.px - g.eve.x) < 150; }
  function eveTalkLine() {
    var first = !g.eveTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * EVE_LINES.length); }
    while (EVE_LINES.length > 1 && idx === g.eveTalk.idx);
    g.eveTalk.idx = idx; g.eveTalk.open = true;
    if (first) {
      // Greeting: she is surprised and delighted to see Sylvia.
      g.eve.surprisedT = 45;
      g.eve.laughT = 0;
    } else {
      // She laughs after her jokes: show the laughing pose for a bit.
      g.eve.laughT = 90;
      g.eve.surprisedT = 0;
    }
  }
  // Alexis, one of the wealthiest in the underground, very spoiled
  // and bitchy, lowkey after Ray. She wanders the Shopping District
  // street and goes to the clothing store and the bar often.
  var ALEXIS_LINES = [
    "Oh, Sylvia. Still wearing that same blue dress? How... loyal of you.",
    "I own three fur stoles. Three. Down here. Do you know how hard that is? Of course you do not.",
    "Ray is so strong. It is a shame he spends all his time following you around like a lost puppy.",
    "Char's shop is cute. I bought half of it last week. She did not even blink.",
    "I only come to the bar because Vicky is the only one who pours my drink correctly. Everyone else is an amateur.",
    "I am the wealthiest person in the underground. I do not brag. I just state facts.",
    "You and Ray are... sweet. In a tragic, sewer kind of way.",
    "If I wanted Ray, I could have him. I am just being polite. For now.",
    "This dress cost more than your whole room. But do not feel bad. Most things do.",
    "You are lucky, Sylvia. Ray is a catch. I would know. I have been fishing."
  ];
  function alexisNear() { return g.room === g.alexis.room && Math.abs(g.px - g.alexis.x) < 150; }
  function alexisTalkLine() {
    var first = !g.alexisTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * ALEXIS_LINES.length); }
    while (ALEXIS_LINES.length > 1 && idx === g.alexisTalk.idx);
    g.alexisTalk.idx = idx; g.alexisTalk.open = true;
    if (first) {
      // Greeting: she is surprised to see Sylvia, then the mask goes
      // back on.
      g.alexis.surprisedT = 45;
      g.alexis.laughT = 0;
    } else {
      // She laughs after her little jabs, because of course she does.
      g.alexis.laughT = 90;
      g.alexis.surprisedT = 0;
    }
  }
  // Priya, an Indian gym girlie, always running and staying fit,
  // cool and admirable and sweet. She loves giving health advice and
  // tips for staying healthy even in the underground. She runs around
  // the Shopping District street and the Flooded Cistern.
  var PRIYA_LINES = [
    "Hey! You are Sylvia, right? I am Priya. I run this whole underground, literally. Want a lap with me?",
    "Okay, real talk: the air down here is stale, so breathe deep through your nose and out slow. Your lungs will thank you.",
    "You do not need a gym to stay strong. Squats, push-ups, planks. Ten minutes a day and your body stays yours.",
    "Drink water even when you are not thirsty. Down here the damp tricks you into thinking you are hydrated. You are not.",
    "Stretch after every run, or your legs will hate you tomorrow. I learned that the hard way, twice.",
    "Sleep is a workout too. Your muscles rebuild while you rest, so do not skip it just because the underground never sleeps.",
    "Ray looks strong, but I bet he skips leg day. Tell him Priya said so.",
    "The cistern water is NOT for drinking, no matter how clear it looks. I have seen things in there. Trust me.",
    "A little sunlight would fix half our problems, but until then, move your body and eat something green. It counts.",
    "You have good energy, Sylvia. Keep moving, keep breathing, and this place cannot wear you down."
  ];
  function priyaNear() { return g.room === g.priya.room && Math.abs(g.px - g.priya.x) < 150; }
  function priyaTalkLine() {
    var first = !g.priyaTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * PRIYA_LINES.length); }
    while (PRIYA_LINES.length > 1 && idx === g.priyaTalk.idx);
    g.priyaTalk.idx = idx; g.priyaTalk.open = true;
    if (first) {
      // Greeting: she is surprised to see Sylvia, then she is all
      // smiles and advice.
      g.priya.surprisedT = 45;
      g.priya.laughT = 0;
    } else {
      // She laughs after her tips, warm and encouraging.
      g.priya.laughT = 90;
      g.priya.surprisedT = 0;
    }
  }
  // Diego, Mexican, super flirty and popular, but bros with Ray.
  // He is always in the bar, sometimes stepping out to the Shopping
  // District street. He flirts with everyone, but he would never
  // cross Ray.
  var DIEGO_LINES = [
    "Well, well. Sylvia. Ray talks about you all the time, you know. All. The. Time.",
    "I am Diego. The most popular guy in the underground. Do not argue, it is just a fact.",
    "Ray is my bro. We have been through everything down here. So you are family now too.",
    "You look good, Sylvia. Do not tell Ray I said that. Actually, tell him. He will laugh.",
    "I flirt with everyone. It is my nature. But you? You are off limits. Bros before... well, you know.",
    "Vicky pours the best drinks in the underground, and I should know, I have tried them all.",
    "Ray and I once got lost in the tunnels for three days. We came out laughing. That is what bros do.",
    "You want to get out of here? Then you need charm, luck, and a guy like me. I have all three.",
    "Alexis keeps trying to steal Ray. I told her: not while I am breathing, hermosa.",
    "Stay close to Ray, Sylvia. He is the best of us. And I am the second best. Obviously."
  ];
  function diegoNear() { return g.room === g.diego.room && Math.abs(g.px - g.diego.x) < 150; }
  function diegoTalkLine() {
    var first = !g.diegoTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * DIEGO_LINES.length); }
    while (DIEGO_LINES.length > 1 && idx === g.diegoTalk.idx);
    g.diegoTalk.idx = idx; g.diegoTalk.open = true;
    if (first) {
      // Greeting: he is surprised to see Sylvia, then the charm
      // turns right back on.
      g.diego.surprisedT = 45;
      g.diego.laughT = 0;
    } else {
      // He laughs after his lines, smooth and unbothered.
      g.diego.laughT = 90;
      g.diego.surprisedT = 0;
    }
  }
  // Dr. Kian, a Persian hot doctor who cures people in the
  // underground. He is a gentle man and very pure hearted. He walks
  // around the Shopping District street but is mostly in the bar.
  var KIAN_LINES = [
    "Hello, Sylvia. I am Dr. Kian. If you or Ray ever feel unwell, please come to me. No charge. I am a doctor, not a merchant.",
    "The air down here is hard on the lungs. I see it every day. Breathe slowly, drink water, and rest when you can.",
    "I became a doctor to help people. The underground needs that more than anywhere. So here I am.",
    "Ray is strong, but even strong men get hurt. I have patched him up more times than he will admit.",
    "If you feel dizzy or your chest hurts, do not ignore it. Come find me. I would rather check and find nothing than miss something.",
    "I keep a small kit with me at all times. Bandages, herbs, a little of everything. You never know who will need it.",
    "The people here are kind, even in the dark. That is what keeps me going.",
    "Sylvia, you have a good heart. I can tell. Take care of it, and of yourself.",
    "Sleep is the best medicine I know. Your body heals while you rest. Do not skip it.",
    "One day we will all see the sun again. Until then, I will keep everyone healthy. That is my promise."
  ];
  var KIAN_RESCUE_LINES = [
    "Ray carried you all the way home. You were out cold, Sylvia.",
    "You need rest. Real rest. No more pushing yourself until you drop.",
    "Be careful down there. The dungeon does not forgive, and neither does exhaustion.",
    "I will be going now. Sleep, eat something, and take it slow tomorrow."
  ];
  // The Mayor, drunk in the bar from Day 2, slips up and tells them
  // where the hidden garden is. This is the only way the garden
  // unlocks. It plays when Sylvia talks to him, not on walking in.
  var MAYOR_CUTSCENE_LINES = [
    "Sylvia! Ray! Sit, sit. The Mayor of the whole underground city is allowed a few drinks.",
    "You want to know something? There is a garden. A real one, blooming in the dark, past the Flooded Cistern. Go right, past the water, and there it is.",
    "Do not tell anyone I told you. I am the Mayor. I know things. Now go. I am... very busy. With this drink."
  ];
  // X, appearing for the first time once the whole dungeon is
  // cleared. He sees great potential in them, and he is the one who
  // unlocks the subway, hinting that the bar leads to it.
  var X_CUTSCENE_LINES = [
    "You cleared the Court. All of it. I have been watching from the dark.",
    "I see great potential in you. Both of you. More than anyone who has come down here before.",
    "The subway is open to you now. It has been locked for longer than you have been alive.",
    "The bar leads to it. The stairs at the far end of the bar. Go. And do not look back."
  ];
  function kianNear() { return g.room === g.kian.room && Math.abs(g.px - g.kian.x) < 150; }
  function kianTalkLine() {
    var first = !g.kianTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * KIAN_LINES.length); }
    while (KIAN_LINES.length > 1 && idx === g.kianTalk.idx);
    g.kianTalk.idx = idx; g.kianTalk.open = true;
    if (first) {
      // Greeting: he is surprised to see Sylvia, then he is all
      // warmth and care.
      g.kian.surprisedT = 45;
      g.kian.laughT = 0;
    } else {
      // He laughs after his lines, gentle and warm.
      g.kian.laughT = 90;
      g.kian.surprisedT = 0;
    }
  }
  // Yuto, a Japanese sexy nerd that loves reading. He is always
  // teaching people something new and interesting facts. He is a bit
  // cocky and egoistic, but in a hot way. He wanders the Shopping
  // District street and the bar.
  var YUTO_LINES = [
    "Ah, Sylvia. You are just in time. I was about to explain why honey never spoils. Three thousand year old honey, still edible. Fascinating, no?",
    "Did you know octopuses have three hearts? Two stop beating when they swim. I know things like this. It is a gift and a curse.",
    "I have read over two thousand books. Ask me anything. Anything at all. I will know it. Probably.",
    "The underground has its own ecosystem, you know. Fungi, blind fish, things that glow. I have catalogued most of it. Most.",
    "People think being smart is about knowing everything. It is not. It is about knowing where to look. And I always know where to look.",
    "Ray is strong, but strength is not everything. A sharp mind beats a strong arm. I have told him this many times. He pretends not to listen.",
    "Fun fact: your brain uses about twenty percent of your energy, even though it is only two percent of your weight. Mine uses more. Obviously.",
    "I could teach you something new every day for a year and never repeat myself. That is not a boast. It is a fact.",
    "Books are the only way out of here that does not need a door. You should try one sometime. I can recommend a few.",
    "You are smarter than you look, Sylvia. Do not tell anyone I said that. I have a reputation to maintain."
  ];
  function yutoNear() { return g.room === g.yuto.room && Math.abs(g.px - g.yuto.x) < 150; }
  function yutoTalkLine() {
    var first = !g.yutoTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * YUTO_LINES.length); }
    while (YUTO_LINES.length > 1 && idx === g.yutoTalk.idx);
    g.yutoTalk.idx = idx; g.yutoTalk.open = true;
    if (first) {
      // Greeting: he is surprised to see Sylvia, then he is all
      // smug and ready to teach her something.
      g.yuto.surprisedT = 45;
      g.yuto.laughT = 0;
    } else {
      // He laughs after his lines, cocky and pleased with himself.
      g.yuto.laughT = 90;
      g.yuto.surprisedT = 0;
    }
  }
  // Mayor Adler, the mayor of the whole underground city. He looks evil
  // but is actually a sweetheart who just does not know how to
  // speak. He is trying his best.
  var ADLER_LINES = [
    "Hmph. State your business, young lady. ...Ah. It is Sylvia, is it not? Yes. Well. Carry on, then.",
    "I am the Mayor. Of the whole underground city. Every tunnel, every shop, every... bar stool. It is a very important job. Someone must do it. ...It is me. I do it.",
    "You look like trouble. Good trouble, I think. I am still deciding. Do not rush me.",
    "I did not smile at you. That was... a facial malfunction. Pay it no mind.",
    "I signed seventeen decrees this morning. Seventeen. ...I do not remember what they said. But they were signed. Officially.",
    "I gave a speech once. It lasted four hours. Nobody stayed. I consider it a success. I spoke very clearly.",
    "If anyone bothers you down here, you tell me. I will... I will have strong words with them. Very strong. The strongest.",
    "I am not evil. I have been told my face says otherwise. My face is wrong. I am working on it.",
    "Ahem. As Mayor, I officially declare you... welcome here. There. I said it. Do not make a fuss.",
    "My cane is not a weapon. It is a walking stick. ...Though it could be a weapon. If it had to be. It does not have to be. Please stop looking at it."
  ];
  var MIKA_LINES = [
    "Oh! Hi! Nobody ever comes to talk to me. ...I mean, hi! I'm Mika!",
    "I live here, by the water. It's not much, but it's mine. And the water sings at night, did you know?",
    "I don't have much, but I have a warm smile and two good ears. Both are free, if you want them.",
    "People walk past me like I'm part of the wall. But you stopped. That means a lot, you know?",
    "I found a shiny bottle cap yesterday. It's my favourite thing I own. ...I don't own many things.",
    "If you're ever lonely, come sit with me. I have all the time in the world, and I am very good company. I think.",
    "You and Ray look happy together. ...I hope I find that someday. A person who stops and says hi.",
    "The cistern is quiet, but it's home. The water keeps me company when no one else does.",
    "I made a flower out of paper once. It fell apart in the damp. ...I keep making them anyway.",
    "Thank you for talking to me. Really. You have no idea how much a hello means down here."
  ];
  // X does not say much, but he seems to know a lot of secrets, of
  // both the underworld and the land above. Nobody knows how old he is.
  var STRANGER_LINES = [
    "...You found the bottom. Most people stop at the third level. You did not.",
    "I have been here longer than the stones. The stones do not remember me. I remember them.",
    "The surface is not a story. It is real. I have seen the sky. Once. It was... bright.",
    "Do not trust the quiet down here. The quiet is where the old things listen.",
    "You carry the sun in your pocket and you do not know it yet. Keep walking up.",
    "The mayor does not know I am here. Nobody knows I am here. That is how I like it.",
    "You look at her like she is the way out. She is. But the way out is not a door.",
    "I know every secret this city keeps. Ask me one. I may answer. I may not.",
    "Age? I stopped counting when the first tunnel collapsed. That was a long time ago.",
    "When you reach the top, do not look back. The dark follows those who hesitate."
  ];
  function mikaNear() { return g.room === g.mika.room && Math.abs(g.px - g.mika.x) < 150; }
  function mikaTalkLine() {
    var first = !g.mikaTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * MIKA_LINES.length); }
    while (MIKA_LINES.length > 1 && idx === g.mikaTalk.idx);
    g.mikaTalk.idx = idx; g.mikaTalk.open = true;
    if (first) {
      // Greeting: she is surprised anyone stopped to talk to her,
      // then she lights up, warm and a little shy.
      g.mika.surprisedT = 45;
      g.mika.laughT = 0;
    } else {
      // She laughs after her lines, delighted someone is listening.
      g.mika.laughT = 90;
      g.mika.surprisedT = 0;
    }
  }
  function strangerNear() { return g.room === g.stranger.room && dungeonCleared() && Math.abs(g.px - g.stranger.x) < 150; }
  function strangerTalkLine() {
    var first = !g.strangerTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * STRANGER_LINES.length); }
    while (STRANGER_LINES.length > 1 && idx === g.strangerTalk.idx);
    g.strangerTalk.idx = idx; g.strangerTalk.open = true;
    if (first) {
      // Greeting: he is surprised to be spoken to, then he goes still.
      g.stranger.surprisedT = 45;
      g.stranger.laughT = 0;
    } else {
      // He barely reacts after his lines, just a small gesture.
      g.stranger.laughT = 90;
      g.stranger.surprisedT = 0;
    }
  }
  // The Mayor only appears from the second day, so he is not in
  // the bar on Day 1 at all.
  function mayorHere() { return g.day >= 2; }
  function adlerNear() { return mayorHere() && g.room === g.adler.room && Math.abs(g.px - g.adler.x) < 150; }
  function adlerTalkLine() {
    var first = !g.adlerTalk.open;
    var idx;
    do { idx = Math.floor(Math.random() * ADLER_LINES.length); }
    while (ADLER_LINES.length > 1 && idx === g.adlerTalk.idx);
    g.adlerTalk.idx = idx; g.adlerTalk.open = true;
    if (first) {
      // Greeting: he is surprised to see Sylvia, then he tries his
      // best to sound official and welcoming.
      g.adler.surprisedT = 45;
      g.adler.laughT = 0;
    } else {
      // He laughs after his lines, a gruff little chuckle, pleased
      // with himself for speaking well.
      g.adler.laughT = 90;
      g.adler.surprisedT = 0;
    }
  }
  function kidLines(key) {
    if (key === "dino") return KUSH_LINES;
    if (key === "cup") return LIA_LINES;
    return JAMIE_LINES;
  }
  function vickyNear() { return g.room === "bar" && Math.abs(g.px - VICKY_X) < 140; }
  function talkLine() {
    var idx;
    do { idx = Math.floor(Math.random() * VICKY_AFTER_LINES.length); }
    while (VICKY_AFTER_LINES.length > 1 && idx === g.talk.idx);
    g.talk.idx = idx; g.talk.open = true;
  }
  // Talking to Vicky: the first time, it is the drink cutscene
  // (the first mission). After that, her short lines.
  function talkToVicky() {
    if (!g.vickyCutsceneDone) {
      startVickyCutscene();
      if (g.vickyCutscene.active) return;
    }
    talkLine();
  }
  // Talking to the Mayor: from Day 2, the first time it is the
  // drunk garden cutscene (the second mission). After that, his
  // regular lines.
  function talkToMayor() {
    if (!g.mayorCutsceneDone && g.day >= 2) {
      startMayorCutscene();
      if (g.mayorCutscene.active) return;
    }
    adlerTalkLine();
  }
  function pressT() {
    if (g.proposal.active) { advanceProposal(); return; }
    if (g.rescue.active) { advanceRescue(); return; }
    if (g.mayorCutscene.active) { advanceMayorCutscene(); return; }
    if (g.vickyCutscene.active) { advanceVickyCutscene(); return; }
    if (g.xCutscene.active) { advanceXCutscene(); return; }
    if (g.kiss.active || g.climb.active || g.inspect.active || g.portal.active || g.scooter.riding) return;
    if (g.propRead.open) { closePropRead(); return; }
    if (g.talk.open) { talkLine(); return; }
    if (g.ownerTalk.open) { ownerTalkLine(g.ownerTalk.key); return; }
    if (g.kidTalk.open) { kidTalkLine(g.kidTalk.key); return; }
    if (g.eveTalk.open) { eveTalkLine(); return; }
    if (g.alexisTalk.open) { alexisTalkLine(); return; }
    if (g.priyaTalk.open) { priyaTalkLine(); return; }
    if (g.diegoTalk.open) { diegoTalkLine(); return; }
    if (g.kianTalk.open) { kianTalkLine(); return; }
    if (g.yutoTalk.open) { yutoTalkLine(); return; }
    if (g.adlerTalk.open) { adlerTalkLine(); return; }
    if (g.mikaTalk.open) { mikaTalkLine(); return; }
    if (g.strangerTalk.open) { strangerTalkLine(); return; }
    if (g.rayTalk.open) { advanceRayTalk(); return; }
    // One conversation at a time: the room's own NPC wins, and Ray
    // is the fallback when nobody else is near to talk to.
    if (vickyNear()) { talkToVicky(); return; }
    var key = ownerNear();
    if (key) { ownerTalkLine(key); return; }
    var kid = kidNear();
    if (kid) { kidTalkLine(kid); return; }
    if (eveNear()) { eveTalkLine(); return; }
    if (alexisNear()) { alexisTalkLine(); return; }
    if (priyaNear()) { priyaTalkLine(); return; }
    if (diegoNear()) { diegoTalkLine(); return; }
    if (kianNear()) { kianTalkLine(); return; }
    if (yutoNear()) { yutoTalkLine(); return; }
    if (adlerNear()) { talkToMayor(); return; }
    if (mikaNear()) { mikaTalkLine(); return; }
    if (strangerNear()) { strangerTalkLine(); return; }
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
  function kidsNear() {
    if (g.room !== "arcade") return [];
    var keys = ["gamer", "dino", "cup"];
    var out = [];
    for (var i = 0; i < keys.length; i++) {
      if (Math.abs(g.px - g.kids[keys[i]].x) < 150) out.push(keys[i]);
    }
    return out;
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
    if (g.embrace.active || g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.propRead.open || g.climb.active || g.inspect.active || g.portal.active || g.scooter.riding || g.attack.cooldown > 0) return;
    g.attack.active = true; g.attack.t = 0; g.attack.cooldown = 40;
    g.ray.fight.active = true; g.ray.fight.t = 0; g.ray.pause = 0;
  }
  function fightTargetX() {
    // When monsters are about, he runs at the nearest one, ahead of
    // her, instead of a fixed point in front of her.
    if (isDungeonRoom(g.room) && g.monsters.length > 0) {
      var best = null, bestD = 1e9;
      for (var i = 0; i < g.monsters.length; i++) {
        var d = Math.abs(g.monsters[i].x - g.px);
        if (d < bestD) { bestD = d; best = g.monsters[i]; }
      }
      if (best) return best.x;
    }
    return g.px + g.facing * 70;
  }
  // Doors: the bar's left edge leads to the chamber. Each room's door
  // back is on the side you came in through. Going UP uses the stairs,
  // not the edge: walk to the staircase and press E to climb it.
  var EXITS = {
    bar: { left: "chamber", right: "shopping" },
    chamber: { right: "bar" },
    subway: { left: "bar" },
    shopping: { left: "chamber", right: "cistern" },
    repair: { left: "shopping" },
    clothing: { left: "shopping" },
    salon: { left: "shopping" },
    arcade: { left: "shopping" },
    cistern: { left: "shopping", right: "garden" },
    garden: { left: "cistern" },
    quarry: { left: "arcade", right: "tunnels" },
    // The tunnels have no edge exits on purpose: going home is a
    // choice (press E at the left edge), not an automatic walk-out.
    tunnels: {},
    dungeon: { left: "tunnels" },
    dungeon2: { left: "dungeon", right: "dungeon3" },
    dungeon3: { left: "dungeon2", right: "dungeon4" },
    dungeon4: { left: "dungeon3" },
    upper1: { left: "subway" },
    upper2: { left: "upper1" },
    upper3: { left: "upper2" },
    earthen: { left: "upper3", right: "surface" },
    surface: { left: "earthen" }
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
    upper2: { baseX: 1900, topX: 2100, to: "upper3", label: "Go up the stairs to Upper Level 3", btn: "Up the stairs" },
    upper3: { baseX: 1900, topX: 2100, to: "earthen", label: "Go up the stairs to the Earthen Tunnel", btn: "Up the stairs" }
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
    // The subway stays sealed until X unlocks it, after the whole
    // dungeon is cleared. The subway stairs stay sealed until the
    // puzzles down there are solved.
    if (key === "bar" && !g.subwayUnlocked) { showDungeonMsg("The stairs are sealed. The dungeon must be finished first."); return; }
    if (key === "subway" && !g.subwayPuzzlesDone) { showDungeonMsg("The stairs are sealed by a puzzle. Something here needs solving first."); return; }
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
    if (exits.left && g.px <= roomMinX() + 30) return "left";
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
    if (to === "garden") return "Go to the Secret Garden";
    if (to === "earthen") return "Go back down to the Earthen Tunnel";
    if (to === "surface") return "Go to the Surface";
    if (to === "upper3") return "Back to Upper Level 3";
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
    // No "Press E to" here: walking through an edge door is
    // automatic now, so the prompt just names the destination.
    var to = EXITS[g.room][doorSide()];
    if (to === "bar") return "Go back to the bar";
    if (to === "shopping") return "Go back to the street";
    return doorLabel();
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
  // The dungeon controls card: the first time she walks into any
  // dungeon room in a session, a card pops up with the fight
  // controls, and the world waits until she closes it.
  function openDungeonControls() {
    if (g.dungeonControls.open) return;
    g.dungeonControls.open = true;
    var pop = document.getElementById("dungeonControlsPopup");
    if (pop) pop.hidden = false;
  }
  function closeDungeonControls() {
    g.dungeonControls.open = false;
    var pop = document.getElementById("dungeonControlsPopup");
    if (pop) pop.hidden = true;
  }
  function maybeShowDungeonControls() {
    if (!isDungeonRoom(g.room) || g.dungeonControls.seen) return;
    g.dungeonControls.seen = true;
    openDungeonControls();
  }
  // The closet in their room (the chamber), between the vanity and
  // the bed: walk up and press E to open it. Everything they own
  // from Char's fashion store and Mikey's salon is in here, plus
  // the blue dress and black tank they started in, always free to
  // change back to.
  var CLOSET_X = 550, CLOSET_RANGE = 90;
  function closetNear() {
    return g.room === "chamber" && Math.abs(g.px - CLOSET_X) < CLOSET_RANGE;
  }
  function openCloset() {
    if (g.closetOpen) return;
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.mirror.active || g.photo.active) return;
    if (!closetNear()) return;
    g.talk.open = false; g.ownerTalk.open = false;
    g.closetOpen = true;
    var panel = document.getElementById("closetPanel");
    if (panel) panel.hidden = false;
    refreshClosetPanel();
  }
  function closeCloset() {
    g.closetOpen = false;
    var panel = document.getElementById("closetPanel");
    if (panel) panel.hidden = true;
  }
  // A preview picture for a shop item: the idle sprite for that
  // outfit in its base hair, or for a hairstyle the idle sprite of
  // another outfit that shows the hair.
  function itemPreview(it) {
    if (it.kind === "outfit") {
      if (it.who === "sylvia") return "assets/sylvia-" + it.id + "-idle-" + (it.id === "black" ? "buns" : "wavy") + ".png";
      return "assets/ray-" + it.id + "-idle-afro.png";
    }
    if (it.who === "sylvia") return "assets/sylvia-corset-idle-" + it.id + ".png";
    return "assets/ray-lightblue-idle-" + it.id + ".png";
  }
  function isWearing(id) {
    var it = shopItem(id);
    if (!it) return false;
    if (it.kind === "outfit") return (it.who === "sylvia" ? g.look.sylviaOutfit : g.look.rayOutfit) === id;
    return (it.who === "sylvia" ? g.look.sylviaHair : g.look.rayHair) === id;
  }
  function isDefaultWorn(who, kind) {
    if (who === "sylvia") return kind === "outfit" ? g.look.sylviaOutfit === "default" : g.look.sylviaHair === "wavy";
    return kind === "outfit" ? g.look.rayOutfit === "default" : g.look.rayHair === "afro";
  }
  // One row in a shop or closet list: preview, name, description,
  // price, and a button. The button's data-id and data-act are
  // handled by the panel click listener set up at the bottom.
  function shopRowHTML(it, btnLabel, btnDisabled) {
    return '<div class="fashionItem"><img src="' + itemPreview(it) + '?v=92" alt="' + it.name + '"><div><div class="shopCardName">' + it.name + '</div><div class="shopCardText">' + it.desc + '</div><div class="shopCardPrice">' + it.price + ' coins</div><button class="shopBuyBtn" type="button" data-id="' + it.id + '" data-act="shop"' + (btnDisabled ? ' disabled' : '') + '>' + btnLabel + '</button></div></div>';
  }
  function refreshFashionPanel() {
    var box = document.getElementById("fashionItems");
    var note = document.getElementById("fashionNote");
    if (note) note.textContent = "You have " + g.coinCount + " coins. Wear what you buy from the closet in your room.";
    if (!box) return;
    var html = "";
    SHOP_ITEMS.forEach(function (it) {
      if (it.kind !== "outfit") return;
      var label, dis = false;
      if (isWearing(it.id)) { label = "Wearing"; dis = true; }
      else if (ownsItem(it.id)) { label = "Wear it"; }
      else { label = "Buy it for " + it.price + " coins"; dis = g.coinCount < it.price; }
      html += shopRowHTML(it, label, dis);
    });
    box.innerHTML = html;
  }
  function openSalon() {
    if (g.salonOpen) return;
    g.salonOpen = true;
    g.ownerTalk.open = false;
    var panel = document.getElementById("salonPanel");
    if (panel) panel.hidden = false;
    refreshSalonPanel();
  }
  function closeSalon() {
    g.salonOpen = false;
    var panel = document.getElementById("salonPanel");
    if (panel) panel.hidden = true;
  }
  function refreshSalonPanel() {
    var box = document.getElementById("salonItems");
    var note = document.getElementById("salonNote");
    if (note) note.textContent = "You have " + g.coinCount + " coins. Wear what you buy from the closet in your room.";
    if (!box) return;
    var html = "";
    SHOP_ITEMS.forEach(function (it) {
      if (it.kind !== "hair") return;
      var label, dis = false;
      if (isWearing(it.id)) { label = "Wearing"; dis = true; }
      else if (ownsItem(it.id)) { label = "Wear it"; }
      else { label = "Buy it for " + it.price + " coins"; dis = g.coinCount < it.price; }
      html += shopRowHTML(it, label, dis);
    });
    box.innerHTML = html;
  }
  function refreshClosetPanel() {
    var box = document.getElementById("closetItems");
    var note = document.getElementById("closetNote");
    if (note) note.textContent = "Everything you own, plus what you started in. Tap Wear to change.";
    if (!box) return;
    function rowFor(who, kind, id, name, desc, img) {
      var worn = id ? isWearing(id) : isDefaultWorn(who, kind);
      var label = worn ? "Wearing" : "Wear";
      var dis = worn;
      return '<div class="fashionItem"><img src="' + img + '?v=92" alt="' + name + '"><div><div class="shopCardName">' + name + '</div><div class="shopCardText">' + desc + '</div><button class="shopBuyBtn" type="button" data-id="' + (id || ("default-" + who + "-" + kind)) + '" data-act="closet"' + (dis ? ' disabled' : '') + '>' + label + '</button></div></div>';
    }
    var html = "";
    html += '<div class="shopCardName">Sylvia</div>';
    html += rowFor("sylvia", "outfit", null, "Blue Dress", "Her blue dress. The default.", "assets/sylvia-idle.png");
    SHOP_ITEMS.forEach(function (it) {
      if (it.who === "sylvia" && it.kind === "outfit" && ownsItem(it.id)) html += rowFor("sylvia", "outfit", it.id, it.name, it.desc, itemPreview(it));
    });
    html += rowFor("sylvia", "hair", null, "Long Wavy Hair", "Her long wavy blonde hair. The default.", "assets/sylvia-idle.png");
    SHOP_ITEMS.forEach(function (it) {
      if (it.who === "sylvia" && it.kind === "hair" && ownsItem(it.id)) html += rowFor("sylvia", "hair", it.id, it.name, it.desc, itemPreview(it));
    });
    html += '<div class="shopCardName">Ray</div>';
    html += rowFor("ray", "outfit", null, "Black Tank", "His black tank top. The default.", "assets/ray-idle.png");
    SHOP_ITEMS.forEach(function (it) {
      if (it.who === "ray" && it.kind === "outfit" && ownsItem(it.id)) html += rowFor("ray", "outfit", it.id, it.name, it.desc, itemPreview(it));
    });
    html += rowFor("ray", "hair", null, "Short Afro", "His short natural afro. The default.", "assets/ray-idle.png");
    SHOP_ITEMS.forEach(function (it) {
      if (it.who === "ray" && it.kind === "hair" && ownsItem(it.id)) html += rowFor("ray", "hair", it.id, it.name, it.desc, itemPreview(it));
    });
    box.innerHTML = html;
  }
  // One click handler for the three panels. A shop button either
  // buys the item or wears it if it is already owned; a closet
  // button wears it (or switches back to the default).
  function onShopPanelClick(e) {
    var b = e.target.closest ? e.target.closest("[data-id]") : null;
    if (!b) return;
    var id = b.getAttribute("data-id"), act = b.getAttribute("data-act");
    if (act === "shop") {
      if (ownsItem(id)) { equipItem(id); refreshFashionPanel(); refreshSalonPanel(); }
      else if (buyItem(id)) { refreshFashionPanel(); refreshSalonPanel(); }
    } else if (act === "closet") {
      if (id.indexOf("default-") === 0) {
        var parts = id.split("-");
        equipDefault(parts[1], parts[2]);
      } else {
        equipItem(id);
      }
      refreshClosetPanel();
    }
  }
  // The world map. The map button (top left, under the HP hearts)
  // opens it: the whole underground world, blurred behind, with
  // Sylvia's and Ray's heads pinned at their current room.
  // Fractions of the map image (1672x941).
  var MAP_PINS = {
    chamber:  { x: 0.125, y: 0.575 },
    bar:      { x: 0.45,  y: 0.625 },
    shopping: { x: 0.45,  y: 0.57 },
    repair:   { x: 0.37,  y: 0.60 },
    clothing: { x: 0.40,  y: 0.57 },
    salon:    { x: 0.49,  y: 0.57 },
    arcade:   { x: 0.55,  y: 0.60 },
    subway:   { x: 0.18,  y: 0.385 },
    cistern:  { x: 0.73,  y: 0.61 },
    garden:   { x: 0.90,  y: 0.46 },
    quarry:   { x: 0.19,  y: 0.81 },
    tunnels:  { x: 0.50,  y: 0.85 },
    dungeon:  { x: 0.84,  y: 0.77 },
    dungeon2: { x: 0.88,  y: 0.82 },
    dungeon3: { x: 0.90,  y: 0.88 },
    dungeon4: { x: 0.92,  y: 0.94 },
    upper1:   { x: 0.56,  y: 0.37 },
    upper2:   { x: 0.58,  y: 0.25 },
    upper3:   { x: 0.57,  y: 0.13 },
    earthen:  { x: 0.67,  y: 0.11 },
    surface:  { x: 0.92,  y: 0.09 }
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
    garden: "Secret Garden",
    quarry: "Crystal Quarry",
    tunnels: "Old Service Tunnels",
    dungeon: "Ancient Dungeon",
    dungeon2: "The Crypt",
    dungeon3: "The Cages",
    dungeon4: "The Court of Justice",
    upper1: "Upper Level 1",
    upper2: "Upper Level 2",
    upper3: "Upper Level 3",
    earthen: "The Earthen Tunnel",
    surface: "The Surface"
  };
  // The world map comes in 20 pre-rendered variants: each one has the
  // places she has not visited yet pixelated out, so the hidden part is
  // baked into the art instead of a blur pasted on top. MAP_HIDDEN
  // lists, per variant, the regions it hides. The hub (room, bar,
  // shops) and the Surface are clear in every variant. Variants 5 and
  // 9 are the same picture, so the picker always lands on 5.
  var MAP_HIDDEN = [
    [], // 0: everything clear
    ["upper3"], // 1
    ["upper3", "upper2"], // 2
    ["upper3", "upper2", "upper1"], // 3
    ["upper3", "upper2", "upper1", "subway"], // 4
    ["upper3", "upper2", "upper1", "subway", "quarry", "tunnels", "dungeon"], // 5
    ["upper3", "upper2", "upper1", "subway", "dungeon"], // 6
    ["upper3", "upper2", "upper1", "subway", "quarry"], // 7
    ["upper3", "upper2", "upper1", "subway", "quarry", "dungeon"], // 8
    ["upper3", "upper2", "upper1", "subway", "quarry", "tunnels", "dungeon"], // 9: same as 5
    ["upper3", "upper2", "upper1", "subway", "garden", "quarry", "tunnels", "dungeon"], // 10
    ["upper3", "upper2", "upper1", "subway", "garden", "cistern", "quarry", "tunnels", "dungeon"], // 11: all hidden
    ["upper3", "upper2", "upper1", "subway", "garden"], // 12
    ["upper3", "upper2", "upper1", "subway", "garden", "cistern"], // 13
    ["upper3", "upper2", "upper1", "subway", "garden", "cistern", "quarry"], // 14
    ["upper3", "upper2", "upper1", "subway", "garden", "cistern", "quarry", "dungeon"], // 15
    ["upper3", "upper2", "upper1", "subway", "garden", "cistern", "dungeon"], // 16
    ["upper3", "upper2", "upper1", "subway", "garden", "dungeon"], // 17
    ["upper3", "upper2", "upper1", "subway", "garden", "quarry", "dungeon"], // 18
    ["upper3", "upper2", "upper1", "subway", "garden", "quarry"] // 19
  ];
  function mapRegionVisited(r) {
    // The dungeon region covers all four dungeon levels.
    if (r === "dungeon") return !!(g.visited.dungeon || g.visited.dungeon2 || g.visited.dungeon3 || g.visited.dungeon4);
    return !!g.visited[r];
  }
  function mapVariant() {
    var regions = ["garden", "cistern", "quarry", "tunnels", "dungeon", "subway", "upper1", "upper2", "upper3"];
    var unvisited = [];
    for (var i = 0; i < regions.length; i++) {
      if (!mapRegionVisited(regions[i])) unvisited.push(regions[i]);
    }
    // Pick the variant that hides every unvisited region and the
    // fewest extra ones, so the map never shows a place she has not
    // been to, but reveals as much as it can. Variant 11 hides
    // everything, so there is always a safe pick.
    var best = 11, bestExtra = 99;
    for (var v = 0; v < MAP_HIDDEN.length; v++) {
      var hide = MAP_HIDDEN[v];
      var ok = true;
      for (var j = 0; j < unvisited.length; j++) {
        if (hide.indexOf(unvisited[j]) === -1) { ok = false; break; }
      }
      if (!ok) continue;
      var extra = hide.length - unvisited.length;
      if (extra < bestExtra) { best = v; bestExtra = extra; }
    }
    return best;
  }
  function updateMapImage() {
    var img = document.getElementById("mapImg");
    if (!img) return;
    var v = mapVariant();
    img.src = "assets/map-" + (v < 10 ? "0" + v : "" + v) + ".jpg?v=83";
  }
  function markVisited(room) {
    if (!room || !ROOMS[room]) return;
    g.visited[room] = true;
  }
  function openMap() {
    if (g.mirror.active || g.photo.active || g.dungeonControls.open || g.map.active) return;
    g.map.active = true;
    updateMapImage();
    renderMissions();
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
  // Missions: the story in order. The button at the top left opens
  // the list; the current mission is the first one not yet done.
  function openMissions() {
    if (g.mirror.active || g.photo.active || g.dungeonControls.open || g.map.active || g.missionsOpen) return;
    g.missionsOpen = true;
    renderMissions();
    var pop = document.getElementById("missionsPanel");
    if (pop) pop.hidden = false;
  }
  function closeMissions() {
    g.missionsOpen = false;
    var pop = document.getElementById("missionsPanel");
    if (pop) pop.hidden = true;
  }
  function renderMissions() {
    var cur = currentMission();
    var html = "";
    for (var i = 0; i < MISSIONS.length; i++) {
      var m = MISSIONS[i];
      var done = !!g.missionsDone[m.id];
      var isCur = cur && cur.id === m.id;
      var cls = done ? "missionDone" : (isCur ? "missionCurrent" : "missionNext");
      var mark = done ? "✓" : (isCur ? "→" : "·");
      html += '<div class="missionRow ' + cls + '"><span class="missionMark">' + mark + '</span><div><div class="missionTitle">' + (i + 1) + ". " + m.title + '</div><div class="missionHint">' + m.hint + '</div></div></div>';
    }
    // The same list lives in two places: the standalone missions
    // panel and the right side of the world map popup.
    var list = document.getElementById("missionsList");
    if (list) list.innerHTML = html;
    var mapList = document.getElementById("mapMissionsList");
    if (mapList) mapList.innerHTML = html;
  }
  // Dev shortcut: jump straight to a room from the world map. Tap
  // anywhere on the map and they go to the room nearest that spot.
  // For developing and testing, so she can hop around without
  // walking the whole route every time.
  function teleportToRoom(roomKey) {
    if (!ROOMS[roomKey]) return;
    if (roomKey === "garden" && !g.gardenUnlocked) return;
    if (roomKey === "subway" && !g.subwayUnlocked) return;
    closeMap();
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.eveTalk.open = false; g.alexisTalk.open = false; g.priyaTalk.open = false; g.diegoTalk.open = false; g.kianTalk.open = false; g.yutoTalk.open = false; g.adlerTalk.open = false; g.mikaTalk.open = false; g.strangerTalk.open = false; g.rayTalk.open = false;
    g.propRead.open = false; hidePropPanel();
    g.mirror.active = false; g.photo.active = false; g.dungeonControls.open = false; g.inspect.active = false;
    g.climb.active = false; g.portal.active = false; g.kiss.active = false;
    g.embrace.active = false; g.sleeping = false; g.ray.inBed = false;
    g.proposal.active = false;
    // Jumping away on the map leaves the scooter parked back at the
    // street entrance, so it is never left riding in another room.
    if (g.scooter.riding) { g.scooter.riding = false; g.scooter.x = SCOOTER_X; g.scooter.room = "shopping"; }
    g.room = roomKey;
    markVisited(roomKey);
    onEnterRoom(roomKey);
    updateMapImage();
    if (isDungeonRoom(roomKey)) spawnMonsters();
    else clearMonsters();
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
  // floor are hidden passages down to the Old Service Tunnels. Walk over
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
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.portal.active) return;
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
    if (!g.arcadeMinigameDone) return;
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
  // ---- Aqueduct Pinball: the arcade minigame ----
  // The pinball machine in the arcade (the one with the aqueduct
  // backglass) opens a pop-up game on her playfield art. Launch the
  // ball, flip it with the flippers, and light all four round
  // bumpers to win. Winning gives the hint that unlocks the arches
  // in the arcade floor, and finishes the arcade mission.
  var PINBALL_X = 795, PINBALL_RANGE = 110;
  var pinballImg = loadImg("assets/pinball-playfield.jpg");
  // PINBALL-TEST-START
  // The playfield is drawn on a 600x900 canvas (the art is 2:3), so
  // every position below is in that canvas's pixels.
  var PB_W = 600, PB_H = 900;
  var PB_BALL_R = 9;
  var PB_GRAV = 1500, PB_MAXV = 1400, PB_WALL_E = 0.65;
  var PB_L = 33, PB_R = 567, PB_T = 86, PB_DRAIN_Y = 815;
  var PB_BUMPERS = [
    { x: 140, y: 164, r: 22 },
    { x: 434, y: 164, r: 22 },
    { x: 229, y: 313, r: 22 },
    { x: 461, y: 343, r: 22 }
  ];
  var PB_POSTS = [
    { x: 318, y: 234, r: 7 },
    { x: 360, y: 378, r: 7 },
    { x: 300, y: 558, r: 7 }
  ];
  var PB_SLINGS = [
    { ax: 75, ay: 640, bx: 150, by: 700 },
    { ax: 525, ay: 640, bx: 450, by: 700 }
  ];
  var PB_GUIDES = [
    { ax: 33, ay: 690, bx: 123, by: 750 },
    { ax: 567, ay: 690, bx: 432, by: 750 }
  ];
  var PB_ROLLS = [
    { x: 63, y: 261 }, { x: 84, y: 288 }, { x: 93, y: 324 },
    { x: 90, y: 360 }, { x: 450, y: 504 }, { x: 444, y: 540 }
  ];
  var PB_FLIP_LEN = 110, PB_FLIP_SPEED = 21;
  var PB_BALLS = 5;
  var PB_FLIP_L = { x: 123, y: 750, rest: 0.384, active: -0.559 };
  var PB_FLIP_R = { x: 432, y: 750, rest: 2.758, active: 3.700 };
  var PB_LAUNCH_X = 420, PB_LAUNCH_Y = 695;
  var PB_WIN_COINS = 25;
  var PB_WIN_SCORE = 500;
  function pbNewState() {
    return {
      active: false, phase: "ready", score: 0, balls: PB_BALLS,
      lit: [false, false, false, false],
      bumpT: [0, 0, 0, 0], slingT: [0, 0], rollT: [0, 0, 0, 0, 0, 0],
      ball: { x: PB_LAUNCH_X, y: PB_LAUNCH_Y, vx: 0, vy: 0 },
      flipL: { angle: PB_FLIP_L.rest, angVel: 0, held: false },
      flipR: { angle: PB_FLIP_R.rest, angVel: 0, held: false },
      stuckT: 0
    };
  }
  function pbLaunch(pb) {
    if (!pb.active || pb.phase !== "ready") return;
    pb.phase = "playing";
    pb.ball.x = PB_LAUNCH_X; pb.ball.y = PB_LAUNCH_Y;
    pb.ball.vx = -80; pb.ball.vy = -1250;
  }
  function pbFlipMove(f, def, dt) {
    var target = f.held ? def.active : def.rest;
    var diff = target - f.angle;
    var maxStep = PB_FLIP_SPEED * dt;
    if (Math.abs(diff) <= maxStep) { f.angVel = diff / dt; f.angle = target; }
    else { var dir = diff > 0 ? 1 : -1; f.angVel = dir * PB_FLIP_SPEED; f.angle += dir * maxStep; }
  }
  function pbSegBounce(pb, seg, e) {
    var b = pb.ball;
    var abx = seg.bx - seg.ax, aby = seg.by - seg.ay;
    var len2 = abx * abx + aby * aby;
    var t = len2 > 0 ? ((b.x - seg.ax) * abx + (b.y - seg.ay) * aby) / len2 : 0;
    if (t < 0) t = 0; if (t > 1) t = 1;
    var cx = seg.ax + abx * t, cy = seg.ay + aby * t;
    var dx = b.x - cx, dy = b.y - cy;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d >= PB_BALL_R || d < 0.001) return false;
    var nx = dx / d, ny = dy / d;
    b.x = cx + nx * PB_BALL_R; b.y = cy + ny * PB_BALL_R;
    var vn = b.vx * nx + b.vy * ny;
    if (vn >= 0) return false;
    b.vx -= (1 + e) * vn * nx;
    b.vy -= (1 + e) * vn * ny;
    return true;
  }
  function pbFlipperCollide(pb, def, f) {
    var b = pb.ball;
    var tx = def.x + PB_FLIP_LEN * Math.cos(f.angle);
    var ty = def.y + PB_FLIP_LEN * Math.sin(f.angle);
    var abx = tx - def.x, aby = ty - def.y;
    var len2 = abx * abx + aby * aby;
    var t = len2 > 0 ? ((b.x - def.x) * abx + (b.y - def.y) * aby) / len2 : 0;
    if (t < 0) t = 0; if (t > 1) t = 1;
    var cx = def.x + abx * t, cy = def.y + aby * t;
    var dx = b.x - cx, dy = b.y - cy;
    var d = Math.sqrt(dx * dx + dy * dy);
    var hitR = PB_BALL_R + 2;
    if (d >= hitR) return;
    var nx, ny;
    if (d > 0.001) { nx = dx / d; ny = dy / d; }
    else { nx = -Math.sin(f.angle); ny = Math.cos(f.angle); if (ny > 0) { nx = -nx; ny = -ny; } }
    b.x = cx + nx * hitR; b.y = cy + ny * hitR;
    var rx = cx - def.x, ry = cy - def.y;
    var svx = f.angVel * -ry, svy = f.angVel * rx;
    var rvn = (b.vx - svx) * nx + (b.vy - svy) * ny;
    if (rvn < 0) {
      // While the flipper is swinging, the ball bounces off it with a
      // kick. While it is still, the ball just settles on it (no
      // bounce), so she can trap the ball and time her flip.
      var e = Math.abs(f.angVel) > 5 ? 0.35 : 0;
      b.vx -= (1 + e) * rvn * nx;
      b.vy -= (1 + e) * rvn * ny;
    }
  }
  function pbSubstep(pb, dt) {
    pbFlipMove(pb.flipL, PB_FLIP_L, dt);
    pbFlipMove(pb.flipR, PB_FLIP_R, dt);
    if (pb.phase === "ready" || pb.phase === "won" || pb.phase === "lost") return null;
    var b = pb.ball;
    b.vy += PB_GRAV * dt;
    var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (sp > PB_MAXV) { b.vx *= PB_MAXV / sp; b.vy *= PB_MAXV / sp; }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < PB_L + PB_BALL_R) { b.x = PB_L + PB_BALL_R; b.vx = Math.abs(b.vx) * PB_WALL_E; }
    if (b.x > PB_R - PB_BALL_R) { b.x = PB_R - PB_BALL_R; b.vx = -Math.abs(b.vx) * PB_WALL_E; }
    if (b.y < PB_T + PB_BALL_R) { b.y = PB_T + PB_BALL_R; b.vy = Math.abs(b.vy) * PB_WALL_E; }
    var i, j, r;
    for (i = 0; i < PB_BUMPERS.length; i++) {
      var bp = PB_BUMPERS[i];
      var dx = b.x - bp.x, dy = b.y - bp.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      var minD = bp.r + PB_BALL_R;
      if (d < minD && d > 0.001) {
        var nx = dx / d, ny = dy / d;
        b.x = bp.x + nx * minD; b.y = bp.y + ny * minD;
        var vn = b.vx * nx + b.vy * ny;
        if (vn < 0) {
          b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny;
          b.vx += nx * 420; b.vy += ny * 420;
          pb.score += 50;
          pb.bumpT[i] = 12;
          if (pb.score >= PB_WIN_SCORE) { pb.phase = "won"; return "won"; }
          if (!pb.lit[i]) {
            pb.lit[i] = true;
            var all = true;
            for (var k = 0; k < 4; k++) if (!pb.lit[k]) all = false;
            if (all) { pb.phase = "won"; return "won"; }
          }
        }
      }
    }
    for (j = 0; j < PB_POSTS.length; j++) {
      var pp = PB_POSTS[j];
      var pdx = b.x - pp.x, pdy = b.y - pp.y;
      var pd = Math.sqrt(pdx * pdx + pdy * pdy);
      var pmin = pp.r + PB_BALL_R;
      if (pd < pmin && pd > 0.001) {
        var pnx = pdx / pd, pny = pdy / pd;
        b.x = pp.x + pnx * pmin; b.y = pp.y + pny * pmin;
        var pvn = b.vx * pnx + b.vy * pny;
        if (pvn < 0) {
          b.vx -= 1.8 * pvn * pnx; b.vy -= 1.8 * pvn * pny;
          pb.score += 5;
        }
      }
    }
    for (var s = 0; s < PB_SLINGS.length; s++) {
      if (pbSegBounce(pb, PB_SLINGS[s], 0.9) && pb.slingT[s] <= 0) {
        pb.score += 25; pb.slingT[s] = 20;
        if (pb.score >= PB_WIN_SCORE) { pb.phase = "won"; return "won"; }
      }
    }
    for (var g2 = 0; g2 < PB_GUIDES.length; g2++) pbSegBounce(pb, PB_GUIDES[g2], 0.6);
    pbFlipperCollide(pb, PB_FLIP_L, pb.flipL);
    pbFlipperCollide(pb, PB_FLIP_R, pb.flipR);
    for (r = 0; r < PB_ROLLS.length; r++) {
      var rp = PB_ROLLS[r];
      var rdx = b.x - rp.x, rdy = b.y - rp.y;
      if (rdx * rdx + rdy * rdy < 256 && pb.rollT[r] <= 0) {
        pb.score += 10; pb.rollT[r] = 45;
        if (pb.score >= PB_WIN_SCORE) { pb.phase = "won"; return "won"; }
      }
    }
    if (b.y > PB_DRAIN_Y) {
      pb.balls -= 1;
      if (pb.balls <= 0) { pb.phase = "lost"; return "lost"; }
      pb.ball.x = PB_LAUNCH_X; pb.ball.y = PB_LAUNCH_Y;
      pb.ball.vx = 0; pb.ball.vy = 0;
      pb.phase = "ready";
      return "drained";
    }
    var spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (spd < 25 && b.y < 600) {
      pb.stuckT += 1;
      if (pb.stuckT > 150) {
        b.vx = (Math.random() < 0.5 ? -1 : 1) * 120;
        b.vy = -220;
        pb.stuckT = 0;
      }
    } else pb.stuckT = 0;
    return null;
  }
  function pbStep(pb, dt) {
    for (var i = 0; i < 4; i++) if (pb.bumpT[i] > 0) pb.bumpT[i] -= 1;
    for (var j = 0; j < 2; j++) if (pb.slingT[j] > 0) pb.slingT[j] -= 1;
    for (var r = 0; r < PB_ROLLS.length; r++) if (pb.rollT[r] > 0) pb.rollT[r] -= 1;
    var ev = null;
    for (var s = 0; s < 2; s++) {
      ev = pbSubstep(pb, dt / 2);
      if (ev) return ev;
    }
    return null;
  }
  // PINBALL-TEST-END
  var pinball = pbNewState();
  function pinballNear() {
    return g.room === "arcade" && Math.abs(g.px - PINBALL_X) < PINBALL_RANGE;
  }
  function pinballReset() {
    pinball = pbNewState();
    pinball.active = true;
    var m = document.getElementById("pinballMsg");
    if (m) m.hidden = true;
    var rb = document.getElementById("pinballRetryBtn");
    if (rb) rb.hidden = true;
    pinballUpdateHUD();
    pinballDraw();
  }
  function openPinball() {
    if (pinball.active) return;
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.portal.active || g.scooter.riding || g.propRead.open || g.mirror.active || g.map.active || g.photo.active || g.dungeonControls.open || g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.secretOpen || g.chestOpen) return;
    if (!pinballNear()) return;
    keys.left = keys.right = keys.up = keys.down = keys.fast = false;
    var pop = document.getElementById("pinballPopup");
    if (pop) pop.hidden = false;
    pinballReset();
  }
  function closePinball() {
    pinball.active = false;
    keys.left = keys.right = keys.up = keys.down = keys.fast = false;
    var pop = document.getElementById("pinballPopup");
    if (pop) pop.hidden = true;
  }
  function pinballWon() {
    var m = document.getElementById("pinballMsg");
    var allLit = true;
    for (var i = 0; i < 4; i++) if (!pinball.lit[i]) allLit = false;
    var how = allLit ? "All four bumpers lit!" : pinball.score + " points!";
    if (!g.arcadeMinigameDone) {
      g.coinCount += PB_WIN_COINS;
      setArcadeMinigameDone();
      if (m) { m.hidden = false; m.textContent = how + " The machine clicks open a little drawer: a note inside reads \u201CThe arches in the floor are the way down.\u201D You got the hint, and +" + PB_WIN_COINS + " coins."; }
    } else {
      if (m) { m.hidden = false; m.textContent = how + " Nice playing."; }
    }
  }
  function pinballLost() {
    var m = document.getElementById("pinballMsg");
    if (m) { m.hidden = false; m.textContent = "Out of balls. So close. Play again?"; }
    var rb = document.getElementById("pinballRetryBtn");
    if (rb) rb.hidden = false;
  }
  function pinballUpdateHUD() {
    var s = document.getElementById("pinballScore");
    if (s) s.textContent = pinball.score;
    var b = document.getElementById("pinballBalls");
    if (b) b.textContent = "\u25CF".repeat(pinball.balls) + "\u25CB".repeat(Math.max(0, PB_BALLS - pinball.balls));
    var u = document.getElementById("pinballBumpers");
    if (u) {
      var n = 0;
      for (var i = 0; i < 4; i++) if (pinball.lit[i]) n++;
      u.textContent = n + "/4 bumpers";
    }
    var lb = document.getElementById("pinballLaunchBtn");
    if (lb) lb.hidden = pinball.phase !== "ready";
  }
  function pbDrawFlipper(c, def, angle) {
    var tx = def.x + PB_FLIP_LEN * Math.cos(angle);
    var ty = def.y + PB_FLIP_LEN * Math.sin(angle);
    c.strokeStyle = "#3a3a4a"; c.lineWidth = 16; c.lineCap = "round";
    c.beginPath(); c.moveTo(def.x, def.y); c.lineTo(tx, ty); c.stroke();
    c.strokeStyle = "#d8d8e8"; c.lineWidth = 11; c.lineCap = "round";
    c.beginPath(); c.moveTo(def.x, def.y); c.lineTo(tx, ty); c.stroke();
    c.strokeStyle = "#ffffff"; c.lineWidth = 3; c.lineCap = "round";
    c.beginPath(); c.moveTo(def.x, def.y); c.lineTo(tx, ty); c.stroke();
    c.fillStyle = "#8a8a9a";
    c.beginPath(); c.arc(def.x, def.y, 5, 0, Math.PI * 2); c.fill();
  }
  function pinballDraw() {
    var cv = document.getElementById("pinballCanvas");
    if (!cv) return;
    var c = cv.getContext("2d");
    if (!c) return;
    c.clearRect(0, 0, PB_W, PB_H);
    if (pinballImg && pinballImg.complete && pinballImg.naturalWidth > 0) {
      c.drawImage(pinballImg, 0, 0, PB_W, PB_H);
    } else {
      c.fillStyle = "#1a1030"; c.fillRect(0, 0, PB_W, PB_H);
    }
    var i, j;
    for (i = 0; i < PB_BUMPERS.length; i++) {
      var bp = PB_BUMPERS[i];
      if (pinball.lit[i]) {
        var pulse = 0.55 + 0.25 * Math.sin(Date.now() / 300 + i);
        var g2 = c.createRadialGradient(bp.x, bp.y, 4, bp.x, bp.y, bp.r + 22);
        g2.addColorStop(0, "rgba(255,215,119," + pulse + ")");
        g2.addColorStop(1, "rgba(255,215,119,0)");
        c.fillStyle = g2;
        c.beginPath(); c.arc(bp.x, bp.y, bp.r + 22, 0, Math.PI * 2); c.fill();
        c.strokeStyle = "rgba(255,240,180,0.95)"; c.lineWidth = 3;
        c.beginPath(); c.arc(bp.x, bp.y, bp.r + 3, 0, Math.PI * 2); c.stroke();
      } else if (pinball.bumpT[i] > 0) {
        c.strokeStyle = "rgba(255,240,180,0.7)"; c.lineWidth = 2;
        c.beginPath(); c.arc(bp.x, bp.y, bp.r + 3, 0, Math.PI * 2); c.stroke();
      }
    }
    for (j = 0; j < PB_ROLLS.length; j++) {
      if (pinball.rollT[j] > 0) {
        var rp = PB_ROLLS[j];
        c.fillStyle = "rgba(255,215,119,0.8)";
        c.beginPath(); c.arc(rp.x, rp.y, 8, 0, Math.PI * 2); c.fill();
      }
    }
    pbDrawFlipper(c, PB_FLIP_L, pinball.flipL.angle);
    pbDrawFlipper(c, PB_FLIP_R, pinball.flipR.angle);
    var b = pinball.ball;
    var bg = c.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, PB_BALL_R);
    bg.addColorStop(0, "#ffffff"); bg.addColorStop(0.6, "#c8c8d8"); bg.addColorStop(1, "#6a6a7a");
    c.fillStyle = bg;
    c.beginPath(); c.arc(b.x, b.y, PB_BALL_R, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(0,0,0,0.5)"; c.lineWidth = 1;
    c.beginPath(); c.arc(b.x, b.y, PB_BALL_R, 0, Math.PI * 2); c.stroke();
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
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    g.propRead.open = true; g.propRead.name = p.name; g.propRead.text = p.text; g.propRead.x = p.x; g.propRead.img = p.img ? p.img.src : "";
    // Crouch down to read it, the same as pressing I.
    g.inspect.active = true; g.inspect.phase = "look"; g.inspect.arch = null; g.inspect.t = 0;
    g.facing = g.px < p.x ? 1 : -1;
    g.ray.dir = g.ray.x < p.x ? 1 : -1;
    showPropPanel();
  }
  function closePropRead() { g.propRead.open = false; g.propRead.name = ""; g.propRead.text = ""; hidePropPanel(); }
  function drawPropPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.inspect.active || g.portal.active || g.propRead.open) return;
    // A door prompt wins over a junk prompt when Sylvia stands near
    // both, so the two texts never draw on top of each other.
    if (portalNear() || ironDoorNear()) return;
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
    subway: "Looks like an old abandoned subway...",
    shopping: "It's beautiful here, but it could be better.",
    repair: "It smells like oil and rust in here.",
    clothing: "Char's shop. It smells like perfume and big dreams.",
    salon: "Mikey's place. Hairspray, gossip, and good lighting.",
    arcade: "The arcade never really turns off.",
    cistern: "The water is still. Too still.",
    garden: "A hidden garden, blooming in the dark. It smells like rain and wisteria.",
    quarry: "Pretty crystals. And a little bit wrong.",
    tunnels: "The tunnels smell like damp earth and old metal.",
    dungeon: "Something bad happened here. You can feel it.",
    dungeon2: "Tombs and candles. Something is buried down here.",
    dungeon3: "Cages hang from the ceiling. Best not to look inside.",
    dungeon4: "A ruined courtroom. Justice is blind, but she is watching.",
    upper1: "Upper Level 1. Blue, cold, and the air feels thinner.",
    upper2: "Upper Level 2. Violet and quiet. Too quiet.",
    upper3: "Upper Level 3. White and bright. And it watches you.",
    earthen: "A cramped earthen tunnel. The air smells like soil and roots. Almost there.",
    surface: "The sun. The sky. We finally made it out."
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
    // The item itself, big, below the text box, so she sees what she
    // is reading about.
    var imgBox = document.getElementById("propImage");
    var imgEl = document.getElementById("propImageImg");
    if (imgBox && imgEl && g.propRead.img) {
      imgEl.src = g.propRead.img;
      imgBox.hidden = false;
    }
  }
  function hidePropPanel() {
    var panel = document.getElementById("propPanel");
    if (panel) panel.hidden = true;
    var imgBox = document.getElementById("propImage");
    if (imgBox) imgBox.hidden = true;
  }
  function startInspect() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.portal.active || g.scooter.riding) return;
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
    // The arcade arches only open up after the pinball machine
    // gives her a hint: win the pinball game first, then the
    // arches open and she can inspect them and jump down.
    if (ax !== null && !g.arcadeMinigameDone) { showDungeonMsg("This arch needs a hint first."); return; }
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.eveTalk.open = false; g.alexisTalk.open = false; g.priyaTalk.open = false; g.diegoTalk.open = false; g.kianTalk.open = false; g.yutoTalk.open = false; g.adlerTalk.open = false; g.mikaTalk.open = false; g.strangerTalk.open = false;
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
      // They land in the Old Service Tunnels.
      g.inspect.active = false;
      g.room = "tunnels";
      markVisited("tunnels");
      onEnterRoom("tunnels");
      updateMapImage();
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
  var STONE_DOOR_X = 1955, STONE_DOOR_RANGE = 110;
  // The dungeon and its deeper levels all share the monsters.
  function isDungeonRoom(r) { return r === "dungeon" || r === "dungeon2" || r === "dungeon3" || r === "dungeon4"; }
  function stoneDoorNear() {
    return g.room === "dungeon" && Math.abs(g.px - STONE_DOOR_X) < STONE_DOOR_RANGE;
  }
  function ironDoorNear() {
    return g.room === "tunnels" && Math.abs(g.px - IRON_DOOR_X) < IRON_DOOR_RANGE;
  }
  function enterDungeon2() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!stoneDoorNear()) return;
    // The way deeper is locked until every monster on this level is gone.
    if (g.monsters.length > 0) { showDungeonMsg("Clear all the monsters first!"); return; }
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.eveTalk.open = false; g.alexisTalk.open = false; g.priyaTalk.open = false; g.diegoTalk.open = false; g.kianTalk.open = false; g.yutoTalk.open = false; g.adlerTalk.open = false; g.mikaTalk.open = false; g.strangerTalk.open = false;
    g.room = "dungeon2";
    markVisited("dungeon2");
    onEnterRoom("dungeon2");
    updateMapImage();
    spawnMonsters();
    g.px = 110; g.facing = 1; g.depth = 0;
    g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
    g.camX = 0;
    saveGame();
  }
  function drawStoneDoorPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!stoneDoorNear()) return;
    var x = STONE_DOOR_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = g.monsters.length > 0 ? "Clear all the monsters first!" : "Press E to go deeper";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(20,10,30,0.72)";
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y - 13, tw + 20, 26, 13);
    else ctx.rect(x - tw / 2 - 10, y - 13, tw + 20, 26);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, y + 5);
    ctx.restore();
  }
  function drawIronDoorPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!ironDoorNear()) return;
    var x = IRON_DOOR_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = (!g.quarryMissionDone && !g.dungeonCleared.dungeon) ? "The iron door is sealed" : "Press E to go to Dungeon";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(20,10,30,0.72)";
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y - 13, tw + 20, 26, 13);
    else ctx.rect(x - tw / 2 - 10, y - 13, tw + 20, 26);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, y + 5);
    ctx.restore();
  }
  function enterDungeonFromIronDoor() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!ironDoorNear()) return;
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.eveTalk.open = false; g.alexisTalk.open = false; g.priyaTalk.open = false; g.diegoTalk.open = false; g.kianTalk.open = false; g.yutoTalk.open = false; g.adlerTalk.open = false; g.mikaTalk.open = false; g.strangerTalk.open = false;
    // The iron door stays sealed until the quarry crystals are
    // gathered (unless she has already cleared the first level,
    // so an older save is never locked out of the dungeon).
    if (!g.quarryMissionDone && !g.dungeonCleared.dungeon) { showDungeonMsg("The iron door is sealed. The crystals in the Crystal Quarry hum — gather them first."); return; }
    g.room = "dungeon";
    markVisited("dungeon");
    onEnterRoom("dungeon");
    updateMapImage();
    spawnMonsters();
    g.px = 110; g.facing = 1; g.depth = 0;
    g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
    g.camX = 0;
  }
  // The round blue tunnel mouth in the Old Service Tunnels: the
  // dark arch with the teal glow, on the left side, right where you
  // first walk in from the quarry. Going through it takes them to
  // the Crystal Quarry. No tunnel image, no pop up, just the door.
  // The big stone door in the Ancient Dungeon is NOT this: it is
  // for more dungeon levels later.
  var PORTAL_X = 700, PORTAL_RANGE = 110;
  function portalNear() {
    return g.room === "tunnels" && Math.abs(g.px - PORTAL_X) < PORTAL_RANGE;
  }
  function drawPortalPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!portalNear()) return;
    var x = PORTAL_X * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to go to the Crystal Quarry";
    var tw = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(20,10,30,0.72)";
    if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 10, y - 13, tw + 20, 26, 13);
    else ctx.rect(x - tw / 2 - 10, y - 13, tw + 20, 26);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, y + 5);
    ctx.restore();
  }
  function goThroughPortal() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active) return;
    if (!portalNear()) return;
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.eveTalk.open = false; g.alexisTalk.open = false; g.priyaTalk.open = false; g.diegoTalk.open = false; g.kianTalk.open = false; g.yutoTalk.open = false; g.adlerTalk.open = false; g.mikaTalk.open = false; g.strangerTalk.open = false;
    // Through the blue tunnel mouth to the Crystal Quarry.
    g.room = "quarry";
    markVisited("quarry");
    onEnterRoom("quarry");
    updateMapImage();
    g.px = 110; g.facing = 1; g.depth = 0;
    g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
    g.camX = 0;
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
      markVisited(c.to);
      onEnterRoom(c.to);
      updateMapImage();
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
      markVisited(c.to);
      onEnterRoom(c.to);
      updateMapImage();
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
    markVisited("bar");
    onEnterRoom("bar");
    updateMapImage();
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
    markVisited(key);
    onEnterRoom(key);
    updateMapImage();
    g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
    // You walk in the shop door, on the left side of the room, facing in.
    g.px = 110; g.facing = 1;
    g.ray.x = 60; g.ray.dir = 1;
    resize();
    g.camX = 0;
  }
  // Going home from the Old Service Tunnels is a choice, not an
  // accident: walking to the left edge no longer whisks them home.
  // Walk to the left edge and press E (or tap Go home) to go home.
  var TUNNELS_HOME_RANGE = 90;
  function tunnelsHomeNear() {
    return g.room === "tunnels" && g.px <= roomMinX() + TUNNELS_HOME_RANGE;
  }
  function goHomeFromTunnels() {
    if (!tunnelsHomeNear()) return;
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active || g.propRead.open) return;
    g.talk.open = false; g.ownerTalk.open = false;
    g.room = "chamber";
    markVisited("chamber");
    onEnterRoom("chamber");
    updateMapImage();
    if (g.scooter.riding) g.scooter.room = "chamber";
    g.depth = 0; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0; g.ray.fight.active = false;
    // Same arrival as the old left-edge exit: in through the
    // chamber's right side, by the bar door.
    g.px = room().w - 110; g.facing = -1;
    g.ray.x = room().w - 60; g.ray.dir = -1;
    g.camX = Math.max(0, worldW() - g.w);
    saveGame();
  }
  function switchRoom() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.propRead.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active || g.homeWalk.active || g.proposal.active) return;
    var side = doorSide();
    if (!side) return;
    var from = g.room;
    var to = EXITS[g.room][side];
    // Going deeper in the dungeon is locked until this level's
    // monsters are all gone. Going back up is always open.
    if (isDungeonRoom(from) && isDungeonRoom(to) && DUNGEON_ORDER[to] > DUNGEON_ORDER[from] && g.monsters.length > 0) {
      showDungeonMsg("Clear all the monsters first!");
      return;
    }
    // The garden stays shut until the Mayor tells them where it is,
    // in the bar cutscene.
    if (from === "cistern" && to === "garden" && !g.gardenUnlocked) {
      showDungeonMsg("The way is dark. You do not know where the garden is yet.");
      return;
    }
    g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.eveTalk.open = false; g.alexisTalk.open = false; g.priyaTalk.open = false; g.diegoTalk.open = false; g.kianTalk.open = false; g.yutoTalk.open = false; g.adlerTalk.open = false; g.mikaTalk.open = false; g.strangerTalk.open = false;
    g.room = to;
    markVisited(to);
    onEnterRoom(to);
    updateMapImage();
    if (g.scooter.riding) g.scooter.room = to;
    if (isDungeonRoom(to)) spawnMonsters();
    else if (isDungeonRoom(from)) clearMonsters();
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
    } else if (from === "bar" && to === "shopping") {
      // Out through the bar door, onto the street in front of it.
      g.px = BEER_DOOR_X; g.facing = -1;
      g.ray.x = BEER_DOOR_X - 60; g.ray.dir = -1;
    } else if (from === "earthen" && to === "surface") {
      // Coming out of the tunnel, they start at the top of the stone
      // steps that climb out onto the terrace, not at the left edge.
      g.px = SURFACE_STAIRS_X; g.facing = 1;
      g.ray.x = SURFACE_STAIRS_X - 60; g.ray.dir = 1;
    } else if (enterRight) {
      g.px = room().w - 110; g.facing = -1;
      g.ray.x = room().w - 60; g.ray.dir = -1;
    } else {
      g.px = 110; g.facing = 1;
      g.ray.x = 60; g.ray.dir = 1;
    }
    if (g.px < roomMinX()) { g.px = roomMinX() + 10; g.facing = 1; }
    if (g.ray.x < roomMinX()) { g.ray.x = roomMinX(); g.ray.dir = 1; }
    resize();
    if ((SHOPS[from] && to === "shopping") || (from === "bar" && to === "shopping")) {
      g.camX = Math.max(0, Math.min(worldW() - g.w, g.px * scale() - g.w * 0.38));
    } else if (from === "earthen" && to === "surface") {
      g.camX = 0;
    } else {
      g.camX = (from === "shopping" && to === "chamber") || enterRight ? Math.max(0, worldW() - g.w) : 0;
    }
    saveGame();
  }
  // Where you come out on the Surface: the top of the stone steps
  // that climb out of the tunnel, not the left edge of the screen.
  var SURFACE_STAIRS_X = 600;
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
  function wakeUp() {
    g.sleeping = false; g.ray.inBed = false;
    // Waking up starts a new day, fully rested, and saves. A new day
    // means a fresh roll of treasure chests, and the scooter always
    // comes home: every morning it is parked back at the Shopping
    // District, its home spot, no matter where she left it.
    g.day += 1;
    g.energy = g.energyMax;
    rollChests();
    g.scooter.riding = false;
    g.scooter.room = "shopping";
    g.scooter.x = SCOOTER_X;
    saveGame();
  }
  function tryEnter() {
    if (g.rescue.active) { advanceRescue(); return; }
    if (g.embrace.active) return;
    if (g.proposal.active) { advanceProposal(); return; }
    if (g.mayorCutscene.active) { advanceMayorCutscene(); return; }
    if (g.vickyCutscene.active) { advanceVickyCutscene(); return; }
    if (g.xCutscene.active) { advanceXCutscene(); return; }
    if (g.sleeping) { wakeUp(); return; }
    if (g.photo.active) { closePhoto(); return; }
    if (g.dungeonControls.open) { closeDungeonControls(); return; }
    if (g.propRead.open) { closePropRead(); return; }
    if (g.scooter.riding) { dismountScooter(); return; }
    if (photoNear()) { openPhoto(); return; }
    if (closetNear()) { openCloset(); return; }
    if (bedNear()) { openSleepConfirm(); return; }
    if (vanityNear()) { enterMirror(); return; }
    if (windowNear()) { climbOutWindow(); return; }
    if (stairsNear()) { climbStairs(); return; }
    if (beerDoorNear()) { enterBarFromBeerDoor(); return; }
    var shop = shopNear();
    if (shop) { enterShop(shop); return; }
    if (scooterNear()) { mountScooter(); return; }
    if (tunnelsHomeNear()) { goHomeFromTunnels(); return; }
    var prop = propNear();
    if (prop) { readProp(prop); return; }
    if (pinballNear()) { openPinball(); return; }
    if (inspectNear()) { startInspect(); return; }
    if (fountainNear()) { makeWish(); return; }
    if (chestNear()) { openChest(); return; }
    if (gardenDoorNear()) { startHomeWalk(); return; }
    if (ironDoorNear()) { enterDungeonFromIronDoor(); return; }
    if (stoneDoorNear()) { enterDungeon2(); return; }
    if (portalNear()) { goThroughPortal(); return; }
  }
  // The action list: when several commands are available at once,
  // list them all as buttons so she can see every action and choose,
  // instead of stacking them into one button that hides the rest.
  // The first button is what E does (tryEnter's priority order).
  // Tapping a button runs just that action. Edge doors are not in
  // the list: walking through them is automatic now. Talking is in
  // the same list too, one button per person nearby, so the old
  // single Talk button no longer hides anyone or sits on top of
  // this list. Ray is the fallback: he only shows when nobody else
  // is near to talk to.
  function addTalkActions(acts) {
    if (g.kiss.active || g.climb.active || g.inspect.active || g.portal.active || g.scooter.riding) return;
    if (g.propRead.open) return;
    // A talk already open: the only talk action is Next, which
    // advances the conversation that is running.
    if (g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open) {
      acts.push({ id: "talk-next", label: "Next", run: pressT });
      return;
    }
    if (vickyNear()) acts.push({ id: "talk-vicky", label: "Talk to Vicky", run: talkToVicky });
    var ow = ownerNear();
    if (ow) acts.push({ id: "talk-owner-" + ow, label: "Talk to " + OWNERS[ow].name, run: function () { ownerTalkLine(ow); } });
    var kids = kidsNear();
    for (var i = 0; i < kids.length; i++) {
      (function (k) { acts.push({ id: "talk-kid-" + k, label: "Talk to " + KIDS[k].name, run: function () { kidTalkLine(k); } }); })(kids[i]);
    }
    if (eveNear()) acts.push({ id: "talk-eve", label: "Talk to Eve", run: eveTalkLine });
    if (alexisNear()) acts.push({ id: "talk-alexis", label: "Talk to Alexis", run: alexisTalkLine });
    if (priyaNear()) acts.push({ id: "talk-priya", label: "Talk to Priya", run: priyaTalkLine });
    if (diegoNear()) acts.push({ id: "talk-diego", label: "Talk to Diego", run: diegoTalkLine });
    if (kianNear()) acts.push({ id: "talk-kian", label: "Talk to Dr. Kian", run: kianTalkLine });
    if (yutoNear()) acts.push({ id: "talk-yuto", label: "Talk to Yuto", run: yutoTalkLine });
    if (adlerNear()) acts.push({ id: "talk-adler", label: "Talk to Mayor Adler", run: talkToMayor });
    if (mikaNear()) acts.push({ id: "talk-mika", label: "Talk to Mika", run: mikaTalkLine });
    if (strangerNear()) acts.push({ id: "talk-stranger", label: "Talk to X", run: strangerTalkLine });
    if (acts.length === 0 && rayNear()) acts.push({ id: "talk-ray", label: "Talk to Ray", run: rayTalkLine });
  }
  var lastActionIds = "";
  function updateActionList() {
    var list = document.getElementById("actionList");
    if (!list) return;
    if (g.climb.active || g.portal.active || g.homeWalk.active || g.proposal.active || g.mayorCutscene.active || g.vickyCutscene.active || g.xCutscene.active || g.mirror.active || g.map.active || g.photo.active || g.dungeonControls.open || g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.secretOpen || g.chestOpen || g.kiss.active || pinball.active) { list.hidden = true; lastActionIds = ""; return; }
    var acts = [];
    if (g.sleeping) {
      acts.push({ id: "wake", label: "Get up", run: wakeUp });
    } else if (g.propRead.open) {
      acts.push({ id: "putdown", label: "Put it down", run: closePropRead });
    } else if (g.scooter.riding) {
      acts.push({ id: "dismount", label: "Get off the scooter", run: dismountScooter });
    } else {
      addTalkActions(acts);
      if (photoNear()) acts.push({ id: "photo", label: "Look at the photo", run: openPhoto });
      if (closetNear()) acts.push({ id: "closet", label: "Open the closet", run: openCloset });
      if (bedNear()) acts.push({ id: "bed", label: "Go to bed", run: openSleepConfirm });
      if (vanityNear()) acts.push({ id: "mirror", label: "Look in the mirror", run: enterMirror });
      if (windowNear()) acts.push({ id: "window", label: "Climb out the window", run: climbOutWindow });
      var st = stairsNear();
      if (st) acts.push({ id: "stairs", label: STAIRS[st].btn, run: climbStairs });
      if (beerDoorNear()) acts.push({ id: "beer", label: "Enter the bar", run: enterBarFromBeerDoor });
      var sh = shopNear();
      if (sh) acts.push({ id: "shop", label: SHOPS[sh].btn, run: function () { enterShop(sh); } });
      if (scooterNear()) acts.push({ id: "scooter", label: "Ride the scooter", run: mountScooter });
      var pr = propNear();
      if (pr) acts.push({ id: "prop", label: "Inspect", run: function () { readProp(pr); } });
      if (pinballNear()) acts.push({ id: "pinball", label: "Play pinball", run: openPinball });
      if (inspectNear() && g.arcadeMinigameDone) acts.push({ id: "arch", label: g.inspect.active ? "Go down" : "Inspect", run: startInspect });
      if (fountainNear() && !g.fountainWished) acts.push({ id: "fountain", label: "Make a wish", run: makeWish });
      if (fountainNear() && g.fountainWished && !g.fountainSecret) acts.push({ id: "fountain", label: "Ask the fountain", run: makeWish });
      if (chestNear()) acts.push({ id: "chest", label: "Open the chest", run: openChest });
      if (gardenDoorNear()) acts.push({ id: "homedoor", label: "Go home", run: startHomeWalk });
      if (ironDoorNear()) acts.push({ id: "iron", label: "Dungeon", run: enterDungeonFromIronDoor });
    if (stoneDoorNear()) acts.push({ id: "stone", label: "Go deeper", run: enterDungeon2 });
      if (portalNear()) acts.push({ id: "portal", label: "Go to the quarry", run: goThroughPortal });
      if (crystalNear()) acts.push({ id: "jump", label: "Jump up and grab it", run: tryJump });
      if (tunnelsHomeNear()) acts.push({ id: "tunnelshome", label: "Go home", run: goHomeFromTunnels });
    }
    var ids = acts.map(function (a) { return a.id + ":" + a.label; }).join("|");
    if (ids === lastActionIds) { list.hidden = acts.length === 0; return; }
    lastActionIds = ids;
    list.innerHTML = "";
    for (var i = 0; i < acts.length; i++) {
      (function (a) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = a.label;
        b.addEventListener("click", function (e) { e.stopPropagation(); a.run(); });
        list.appendChild(b);
      })(acts[i]);
    }
    list.hidden = acts.length === 0;
  }
  // Jumping: a little hop, straight up. She can jump to grab a
  // crystal in the quarry, or just for fun. It is only a hop, so it
  // never moves her sideways or through a door.
  var JUMP_DUR = 28;
  function tryJump() {
    if (g.jumpT > 0 || g.sleeping || g.kiss.active || g.climb.active || g.inspect.active || g.portal.active || g.homeWalk.active || g.proposal.active || g.mayorCutscene.active || g.vickyCutscene.active || g.xCutscene.active || g.mirror.active || g.map.active || g.photo.active || g.dungeonControls.open || g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.secretOpen || g.chestOpen || g.scooter.riding || g.embrace.active) return;
    g.jumpT = 1;
  }
  function kissNear() { return Math.abs(g.px - g.ray.x) < 130; }
  function tryKiss() {
    if (g.embrace.active || g.sleeping || g.kiss.active || g.climb.active || g.inspect.active || g.portal.active || g.rayTalk.open || g.propRead.open || g.scooter.riding || !kissNear()) return;
    g.kiss.active = true; g.kiss.t = 0;
    // A kiss restores one heart, if she is hurt and the last healing
    // kiss was a few seconds ago, so it cannot be spammed to full.
    if (g.hp < g.hpMax && g.kissHealT <= 0) {
      g.hp = Math.min(g.hpMax, g.hp + 20);
      g.kissHealT = 300;
    }
  }
  // Gunner's pink scooter. He sells it from his repair shop for $20
  // in gold coins (dropped by dungeon monsters). Once bought it is
  // parked at the entrance
  // of the shopping district street, and the two of them can ride it
  // together, faster than running, with the headlight lighting the
  // way ahead. It travels everywhere with them now: riding through
  // an edge door carries it into the next room. Get off to climb
  // stairs or to go through a shop, bar, or iron door.
  var SCOOTER_X = 280, SCOOTER_RANGE = 110, SCOOTER_PRICE = 20;
  function scooterNear() {
    return g.scooter.room === g.room && g.scooter.owned && !g.scooter.riding && Math.abs(g.px - g.scooter.x) < SCOOTER_RANGE;
  }
  function mountScooter() {
    if (!scooterNear()) return;
    g.scooter.riding = true;
    g.scooter.x = g.px;
    g.scooter.frame = 0;
    g.ray.x = g.px; g.ray.dir = g.facing;
    g.ray.pause = 0; g.ray.fight.active = false;
  }
  function dismountScooter() {
    if (!g.scooter.riding) return;
    g.scooter.riding = false;
    g.scooter.x = g.px;
    g.scooter.room = g.room;
    g.ray.x = g.px - g.facing * 70; g.ray.dir = g.facing;
    if (g.ray.x < roomMinX()) g.ray.x = roomMinX();
    if (g.ray.x > room().w - 60) g.ray.x = room().w - 60;
  }
  // Gunner's shop: a little panel over the game. Buying the scooter
  // is $0 for now, and it appears parked on the street right away.
  function openShop() {
    if (g.shopOpen) return;
    g.shopOpen = true;
    g.ownerTalk.open = false;
    var panel = document.getElementById("shopPanel");
    if (panel) panel.hidden = false;
    var buy = document.getElementById("shopBuyBtn");
    if (buy) {
      buy.disabled = g.scooter.owned || g.coinCount < SCOOTER_PRICE;
      buy.textContent = g.scooter.owned ? "Already yours" : "Buy it for $20";
    }
    var note = document.getElementById("shopNote");
    if (note) {
      if (g.scooter.owned) note.textContent = "You own the pink scooter. It is parked outside on the street.";
      else if (g.coinCount < SCOOTER_PRICE) note.textContent = "You need 20 coins. You have " + g.coinCount + ". Beat dungeon monsters to earn more.";
      else note.textContent = "You have " + g.coinCount + " coins.";
    }
  }
  function closeShop() {
    g.shopOpen = false;
    var panel = document.getElementById("shopPanel");
    if (panel) panel.hidden = true;
  }
  // Sleeping asks first, because it moves to the next day. The panel
  // names the day she will wake up on; saying yes puts her to bed.
  function openSleepConfirm() {
    if (g.sleepConfirmOpen) return;
    g.sleepConfirmOpen = true;
    var panel = document.getElementById("sleepPanel");
    if (panel) panel.hidden = false;
    var txt = document.getElementById("sleepText");
    if (txt) txt.textContent = "You will wake up on Day " + (g.day + 1) + " with full health and energy.";
  }
  function closeSleepConfirm() {
    g.sleepConfirmOpen = false;
    var panel = document.getElementById("sleepPanel");
    if (panel) panel.hidden = true;
  }
  function confirmSleep() { closeSleepConfirm(); goToBed(); }
  function buyScooter() {
    if (g.scooter.owned) return;
    if (g.coinCount < SCOOTER_PRICE) return;
    g.coinCount -= SCOOTER_PRICE;
    g.scooter.owned = true;
    g.scooter.riding = false;
    g.scooter.x = SCOOTER_X;
    g.scooter.room = "shopping";
    var buy = document.getElementById("shopBuyBtn");
    if (buy) { buy.disabled = true; buy.textContent = "Already yours"; }
    var note = document.getElementById("shopNote");
    if (note) note.textContent = "You own the pink scooter. It is parked outside on the street.";
    saveGame();
  }
  // Char's fashion shop: outfits for Sylvia and Ray, bought with
  // gold coins. Buying does not put it on; wear it from the closet
  // in their room, or tap Wear it right here.
  function openFashion() {
    if (g.fashionOpen) return;
    g.fashionOpen = true;
    g.ownerTalk.open = false;
    var panel = document.getElementById("fashionPanel");
    if (panel) panel.hidden = false;
    refreshFashionPanel();
  }
  function closeFashion() {
    g.fashionOpen = false;
    var panel = document.getElementById("fashionPanel");
    if (panel) panel.hidden = true;
  }
  // The wishing fountain in the Secret Garden. The fountain's
  // central column is at world x 1475 in the 2172-wide room (measured
  // from the art with marker lines). Walk up and press E to make a
  // wish: five gold coins rise from the fountain, one time only, to
  // help save for the $20 scooter. A soft golden shimmer marks it so
  // it is easy to find.
  var FOUNTAIN_X = 1475, FOUNTAIN_RANGE = 110, FOUNTAIN_COINS = 100, SECRET_PRICE = 100;
  function fountainNear() {
    return g.room === "garden" && Math.abs(g.px - FOUNTAIN_X) < FOUNTAIN_RANGE;
  }
  function makeWish() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.portal.active || g.scooter.riding || g.propRead.open || g.secretOpen) return;
    // First wish: the garden gives 100 coins. After that, the fountain
    // offers one secret, for 100 coins, one question, once ever.
    if (!g.fountainWished) {
      g.fountainWished = true;
      g.coinCount += FOUNTAIN_COINS;
      g.fountainMsg = "+100 coins! The garden heard your wish.";
      g.fountainMsgT = 180;
      completeMission("fountain");
      saveGame();
      return;
    }
    if (g.fountainSecret) {
      g.fountainMsg = "The fountain has told you its one secret.";
      g.fountainMsgT = 120;
      return;
    }
    openSecret();
  }
  // The fountain's one secret. Three questions, and it answers the one
  // she picks, but only once ever. The fountain does not know their
  // names, and its answers never use them.
  var SECRET_QUESTIONS = {
    why: "Why doesn't anyone try to go up?",
    rumours: "Is it really bright and sunny up there?",
    how: "How do we get out?"
  };
  var SECRET_ANSWERS = {
    why: "Because the ones who tried never came back, and the ones who stayed told the story until it became a warning. The way up is long and dark, and fear is a heavier chain than any locked door.",
    rumours: "Yes. The sky is wider than any room you have ever stood in, and the sun is warmer than any lamp. It is real. I have seen it in the dreams of the water.",
    how: "Up. The way is longer than you think, and I will not count its steps for you. The door at the end is not locked. It is the courage that is locked, not the door."
  };
  function openSecret() {
    g.secretOpen = true;
    refreshSecretPanel();
    var p = document.getElementById("secretPanel");
    if (p) p.hidden = false;
  }
  function closeSecret() {
    g.secretOpen = false;
    var p = document.getElementById("secretPanel");
    if (p) p.hidden = true;
  }
  function refreshSecretPanel() {
    var q1 = document.getElementById("secretQ1");
    var q2 = document.getElementById("secretQ2");
    var q3 = document.getElementById("secretQ3");
    var txt = document.getElementById("secretText");
    var note = document.getElementById("secretNote");
    var closeBtn = document.getElementById("secretCloseBtn");
    var qs = document.getElementById("secretQuestions");
    if (!q1 || !txt || !note || !closeBtn || !qs) return;
    if (g.fountainSecret) {
      // The one secret is spent: show the answer she picked.
      qs.hidden = true;
      txt.textContent = SECRET_ANSWERS[g.fountainSecret];
      note.textContent = "";
      closeBtn.textContent = "Close";
      return;
    }
    qs.hidden = false;
    txt.textContent = "It will answer one question, but only once ever. It asks 100 coins in return.";
    var afford = g.coinCount >= SECRET_PRICE;
    q1.disabled = !afford;
    q2.disabled = !afford;
    q3.disabled = !afford;
    note.textContent = afford ? "You have " + g.coinCount + " coins." : "You have " + g.coinCount + " coins. You need 100.";
    closeBtn.textContent = "Not now";
  }
  function askSecret(q) {
    if (g.fountainSecret) return;
    if (g.coinCount < SECRET_PRICE) return;
    g.coinCount -= SECRET_PRICE;
    g.fountainSecret = q;
    refreshSecretPanel();
    saveGame();
  }
  function drawFountainGlow() {
    // A soft golden shimmer over the fountain basin, so it is easy
    // to find. It fades out once the wish is made.
    if (g.room !== "garden" || g.fountainSecret) return;
    var pulse = 0.20 + 0.12 * Math.sin(Date.now() / 500);
    var x = FOUNTAIN_X * scale() - g.camX;
    var y = groundY() - 6;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#ffd977";
    ctx.beginPath();
    ctx.ellipse(x, y, 70, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = pulse * 1.6;
    ctx.fillStyle = "#fff3c4";
    ctx.beginPath();
    ctx.ellipse(x, y, 34, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawFountainPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.portal.active || g.scooter.riding || g.secretOpen) return;
    if (!fountainNear() || g.fountainSecret) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = g.fountainWished ? "Press E to ask the fountain" : "Press E to make a wish";
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
  function drawFountainMsg() {
    if (g.fountainMsgT <= 0 || !g.fountainMsg) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 64;
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.fountainMsgT / 60);
    ctx.font = "700 14px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd977";
    ctx.fillText(g.fountainMsg, x, y);
    ctx.restore();
  }
  // Treasure chests: every morning a fresh set appears, 0 to 2 per
  // area, at random spots, so some days a place has none at all.
  // Inspect one and it opens, granting a random 3 to 20 gold coins,
  // once per chest per day. The spots below are the candidates; the
  // ones with a chest today live in g.chestLayout.
  var CHEST_RANGE = 110;
  var CHEST_SPOTS = [
    { id: "subway-0", room: "subway", x: 450, d: 0.5 },
    { id: "subway-1", room: "subway", x: 850, d: 0.7 },
    { id: "subway-2", room: "subway", x: 1150, d: 0.6 },
    { id: "subway-3", room: "subway", x: 1450, d: 0.6 },
    { id: "quarry-0", room: "quarry", x: 500, d: 0.6 },
    { id: "quarry-1", room: "quarry", x: 900, d: 0.5 },
    { id: "quarry-2", room: "quarry", x: 1250, d: 0.7 },
    { id: "quarry-3", room: "quarry", x: 1600, d: 0.7 },
    { id: "garden-0", room: "garden", x: 350, d: 0.6 },
    { id: "garden-1", room: "garden", x: 700, d: 0.5 },
    { id: "garden-2", room: "garden", x: 1000, d: 0.7 },
    { id: "garden-3", room: "garden", x: 1800, d: 0.5 },
    { id: "tunnels-0", room: "tunnels", x: 200, d: 0.6 },
    { id: "tunnels-1", room: "tunnels", x: 450, d: 0.5 },
    { id: "tunnels-2", room: "tunnels", x: 850, d: 0.5 },
    { id: "tunnels-3", room: "tunnels", x: 1570, d: 0.8 }
  ];
  function chestActive(c) {
    // A chest spot only has a chest today if it is in today's layout.
    return g.chestLayout.indexOf(c.id) !== -1;
  }
  function rollChests() {
    // Roll today's chests: each of the four areas gets 0, 1 or 2,
    // at random spots. Some days a place has none at all.
    var layout = [];
    var rooms = ["subway", "quarry", "garden", "tunnels"];
    for (var r = 0; r < rooms.length; r++) {
      var spots = CHEST_SPOTS.filter(function (c) { return c.room === rooms[r]; });
      var n = Math.floor(Math.random() * 3); // 0, 1 or 2
      for (var i = spots.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = spots[i]; spots[i] = spots[j]; spots[j] = tmp;
      }
      for (var k = 0; k < n; k++) layout.push(spots[k].id);
    }
    g.chestLayout = layout;
    g.chestDay = g.day;
    g.chestsOpened = {};
  }
  function chestNear() {
    // Nearest unopened chest in this room, within range.
    var best = null, bestD = 1e9;
    for (var i = 0; i < CHEST_SPOTS.length; i++) {
      var c = CHEST_SPOTS[i];
      if (c.room !== g.room || !chestActive(c) || g.chestsOpened[c.id]) continue;
      var dx = Math.abs(g.px - c.x);
      if (dx < CHEST_RANGE && dx < bestD) { best = c; bestD = dx; }
    }
    return best;
  }
  function openChest() {
    // Guards mirror makeWish: nothing else going on.
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.portal.active || g.scooter.riding || g.propRead.open) return;
    if (g.chestOpen) return;
    var c = chestNear();
    if (!c) return;
    g.chestOpen = { id: c.id, t: 0 };
  }
  function drawChests() {
    // Chests in this room, today only. Unopened ones sit closed; the
    // one opening cycles its frames; opened ones stay open with the
    // coins showing.
    var dr = depthRange();
    for (var i = 0; i < CHEST_SPOTS.length; i++) {
      var c = CHEST_SPOTS[i];
      if (c.room !== g.room || !chestActive(c)) continue;
      var img = chestImgs[0];
      if (g.chestsOpened[c.id]) img = chestImgs[3];
      else if (g.chestOpen && g.chestOpen.id === c.id) img = chestImgs[Math.min(3, Math.floor(g.chestOpen.t / 12))];
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      var h = g.h * 0.11 * (0.92 + 0.08 * c.d);
      var w = h * img.naturalWidth / img.naturalHeight;
      var x = c.x * scale() - g.camX;
      var y = groundY() - dr * (1 - c.d);
      ctx.drawImage(img, x - w / 2, y - h, w, h);
    }
  }
  function drawChestGlow() {
    // A soft golden shimmer under unopened chests, so they are easy
    // to find. It fades out once a chest is opened.
    for (var i = 0; i < CHEST_SPOTS.length; i++) {
      var c = CHEST_SPOTS[i];
      if (c.room !== g.room || !chestActive(c) || g.chestsOpened[c.id]) continue;
      var pulse = 0.20 + 0.12 * Math.sin(Date.now() / 500 + i);
      var x = c.x * scale() - g.camX;
      var y = groundY() - depthRange() * (1 - c.d);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#ffd977";
      ctx.beginPath();
      ctx.ellipse(x, y, 40, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = pulse * 1.6;
      ctx.fillStyle = "#fff3c4";
      ctx.beginPath();
      ctx.ellipse(x, y, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  function drawChestPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.portal.active || g.scooter.riding) return;
    if (!chestNear()) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to open the chest";
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
  function drawChestMsg() {
    if (g.chestMsgT <= 0 || !g.chestMsg) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 64;
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.chestMsgT / 60);
    ctx.font = "700 14px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd977";
    ctx.fillText(g.chestMsg, x, y);
    ctx.restore();
  }
  function drawDungeonMsg() {
    if (g.dungeonMsgT <= 0 || !g.dungeonMsg) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 64;
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.dungeonMsgT / 60);
    ctx.font = "700 14px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffd977";
    ctx.fillText(g.dungeonMsg, x, y);
    ctx.restore();
  }
  // The stone arch doorway on the right of the Secret Garden. Its
  // dark opening is centred at world x 2025 in the 2172-wide room
  // (measured from the art with marker lines). It is more like a
  // portal: press E (or tap Go home) and they walk up into the open
  // doorway together, backs to the camera, and arrive in the
  // chamber. It is the second way home, beside the blue tunnel mouth
  // in the Old Service Tunnels. Walking into it does NOT start it;
  // it needs E, like the portal.
  var GARDEN_DOOR_X = 2025, GARDEN_DOOR_RANGE = 90;
  function gardenDoorNear() {
    return g.room === "garden" && Math.abs(g.px - GARDEN_DOOR_X) < GARDEN_DOOR_RANGE;
  }
  function startHomeWalk() {
    if (g.sleeping || g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.embrace.active || g.climb.active || g.inspect.active || g.portal.active || g.homeWalk.active || g.scooter.riding || g.propRead.open) return;
    if (!gardenDoorNear()) return;
    g.talk.open = false; g.ownerTalk.open = false;
    g.homeWalk.active = true; g.homeWalk.t = 0;
    g.ray.x = g.px - 70; g.ray.dir = 1; g.ray.depth = g.depth; g.ray.vdir = -1;
    g.facing = 1;
  }
  function updateHomeWalk() {
    // They walk up into the open doorway together, backs to the
    // camera, drifting to the centre of the arch as they go, then
    // arrive home. They go up, not to the right: the doorway is an
    // opening they step into, like a portal.
    g.homeWalk.t += 1;
    g.px += (GARDEN_DOOR_X - g.px) * 0.05;
    g.depth -= 1.2;
    if (g.depth < -depthRange()) g.depth = -depthRange();
    g.ray.x = g.px - 70;
    g.ray.depth = g.depth;
    g.ray.vdir = -1; g.ray.dir = 1;
    g.walk += 0.3; g.ray.walk += 0.3;
    if (g.homeWalk.t >= 90) {
      g.homeWalk.active = false;
      g.room = "chamber";
      markVisited("chamber");
      onEnterRoom("chamber");
      updateMapImage();
      g.px = 110; g.facing = 1; g.depth = 0;
      g.ray.x = 60; g.ray.dir = 1; g.ray.depth = 0; g.ray.vdir = 0; g.ray.pause = 0;
      g.camX = 0;
      resize();
    }
  }
  function drawGardenDoorGlow() {
    // A soft warm glow in the dark doorway, so it reads as a way
    // through, not just a dead end.
    if (g.room !== "garden") return;
    var pulse = 0.14 + 0.08 * Math.sin(Date.now() / 500);
    var x = GARDEN_DOOR_X * scale() - g.camX;
    var y = groundY() - sylviaH() * 0.45;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#ffd977";
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawGardenDoorPrompt() {
    if (g.kiss.active || g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open || g.climb.active || g.portal.active || g.homeWalk.active || g.scooter.riding) return;
    if (!gardenDoorNear()) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to go home";
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
  function drawScooter() {
    // The parked scooter, wherever it was left, waiting to be ridden.
    if (g.scooter.room !== g.room || !g.scooter.owned || g.scooter.riding) return;
    if (!scooterImg || !scooterImg.complete || scooterImg.naturalWidth === 0) return;
    // Sized so the parked scooter is the same width as the scooter
    // in the riding frames, so mounting it does not shrink it.
    // Smaller now (0.58, was 0.68): Erika said it was a tad big.
    var h = sylviaH() * 0.58;
    var w = h * (scooterImg.naturalWidth / scooterImg.naturalHeight);
    var x = g.scooter.x * scale() - g.camX;
    var feetY = groundY() + 2;
    shadow(x, feetY, w);
    ctx.save();
    ctx.drawImage(scooterImg, x - w / 2, feetY - h, w, h);
    ctx.restore();
  }
  function drawScooterRide() {
    // The two of them on the scooter together: Ray driving, Sylvia
    // in front. The frames cycle while moving. The headlight throws
    // a soft light ahead in the direction they are facing.
    var imgs = scooterRideImgs;
    var img = imgs[g.scooter.frame % imgs.length];
    if (!img || !img.complete || img.naturalWidth === 0) img = imgs[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    // Smaller now (0.98, was 1.15): Erika said riding it was a tad big.
    var h = sylviaH() * 0.98;
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + g.depth;
    var x = g.px * scale() - g.camX;
    // The headlight: a soft warm glow ahead of the scooter, in the
    // direction they are facing. It is the scooter's light, not the
    // characters glowing. A round glow whose gradient fades all the
    // way to transparent at its edge, so there is no hard rim.
    var hx = x + g.facing * w * 0.52;
    var hy = feetY - h * 0.62;
    ctx.save();
    var grad = ctx.createRadialGradient(hx, hy, 4, hx, hy, w * 0.8);
    grad.addColorStop(0, "rgba(255, 238, 175, 0.20)");
    grad.addColorStop(0.5, "rgba(255, 236, 170, 0.08)");
    grad.addColorStop(1, "rgba(255, 236, 170, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(hx, hy, w * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    if (g.facing === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  function drawScooterPrompt() {
    if (g.scooter.riding || !scooterNear()) return;
    var x = g.px * scale() - g.camX;
    var y = groundY() - sylviaH() - 34;
    ctx.save();
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "center";
    var label = "Press E to ride the scooter";
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

  // Saving: the whole run lives in one localStorage slot, so the
  // game remembers the day, her health and energy, her coins, where
  // she is, the scooter, the fountain wish and the proposal. It
  // saves on its own whenever she wakes up, changes rooms, buys the
  // scooter, makes a wish, or finishes the proposal, so closing the
  // tab never loses a day. NPCs wander on their own, so their spots
  // are not saved; they start fresh where they belong.
  var SAVE_KEY = "lostUndergroundSaveV1";
  // The save object: one shape for the autosave slot and for files,
  // so a file and the autosave are interchangeable.
  function buildSaveObject() {
    return {
      day: g.day, hp: g.hp, energy: g.energy, coinCount: g.coinCount,
      room: g.room, px: g.px, depth: g.depth, facing: g.facing,
      scooterOwned: g.scooter.owned, scooterRoom: g.scooter.room, scooterX: g.scooter.x,
      fountainWished: g.fountainWished, fountainSecret: g.fountainSecret, visited: Object.keys(g.visited), proposed: g.proposed,
      gardenUnlocked: g.gardenUnlocked, mayorCutsceneDone: g.mayorCutsceneDone,
      vickyCutsceneDone: g.vickyCutsceneDone, missionsDone: Object.keys(g.missionsDone),
      subwayUnlocked: g.subwayUnlocked, dungeonCleared: g.dungeonCleared,
      xCutsceneDone: g.xCutsceneDone, arcadeMinigameDone: g.arcadeMinigameDone,
      subwayPuzzlesDone: g.subwayPuzzlesDone,
      crystals: g.crystals.slice(), crystalCount: g.crystalCount, quarryMissionDone: g.quarryMissionDone,
      chestsOpened: Object.keys(g.chestsOpened),
      chestLayout: g.chestLayout, chestDay: g.chestDay,
      fashion: { gownOwned: g.fashion.gownOwned, gownOn: g.fashion.gownOn, bandanaOwned: g.fashion.bandanaOwned, bandanaOn: g.fashion.bandanaOn },
      look: { sylviaOutfit: g.look.sylviaOutfit, sylviaHair: g.look.sylviaHair, rayOutfit: g.look.rayOutfit, rayHair: g.look.rayHair, owned: g.look.owned.slice() }
    };
  }
  function saveGame() {
    if (!g.started) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(buildSaveObject()));
    } catch (e) { /* storage unavailable: the game still plays */ }
  }
  // Download the current progress as a file, so she can keep as many
  // saves as she likes and load an old one back even after starting
  // a new game. Works mid-game and from the title screen.
  function exportSave() {
    var data = null;
    if (g.started) data = buildSaveObject();
    else data = loadSave();
    if (!data) { showSaveMsg("Nothing to save yet."); return; }
    try {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "lost-underground-save-day" + (data.day || 1) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      showSaveMsg("Saved to a file. Keep it safe!");
    } catch (e) { showSaveMsg("Could not save that file."); }
  }
  function showSaveMsg(text) {
    var el = document.getElementById("saveMsg");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    setTimeout(function () { el.hidden = true; }, 3500);
  }
  // Load a save file back: read it, check it looks like a save, put
  // it into the world, write it to the autosave slot too (so Continue
  // picks it up), and start.
  function importSaveFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || typeof data.day !== "number" || !data.room || !ROOMS[data.room]) throw new Error("not a save");
        applySave(data);
        saveGame();
        startGame();
        showSaveMsg("Loaded your save file. Welcome back!");
      } catch (e) {
        showSaveMsg("That file is not a Lost Underground save.");
      }
    };
    reader.onerror = function () { showSaveMsg("Could not read that file."); };
    reader.readAsText(file);
  }
  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* no-op */ }
  }
  // Put a saved run back into the world: her spot, her day, her
  // coins and the scooter, and Ray beside her. Monsters and loose
  // coins are not saved; the dungeon spawns fresh when she enters.
  function applySave(s) {
    if (!s) return;
    g.day = s.day || 1;
    g.hp = (typeof s.hp === "number") ? s.hp : g.hpMax;
    g.energy = (typeof s.energy === "number") ? s.energy : g.energyMax;
    g.coinCount = s.coinCount || 0;
    g.room = s.room || "chamber";
    g.px = (typeof s.px === "number") ? s.px : 950;
    g.depth = s.depth || 0;
    g.facing = s.facing || 1;
    g.ray.x = g.px + 70; g.ray.depth = g.depth; g.ray.dir = g.facing;
    g.scooter.owned = !!s.scooterOwned;
    g.scooter.room = s.scooterRoom || "shopping";
    g.scooter.x = (typeof s.scooterX === "number") ? s.scooterX : SCOOTER_X;
    g.fountainWished = !!s.fountainWished;
    g.fountainSecret = s.fountainSecret || null;
    g.gardenUnlocked = !!s.gardenUnlocked;
    g.mayorCutsceneDone = !!s.mayorCutsceneDone;
    g.vickyCutsceneDone = !!s.vickyCutsceneDone;
    g.missionsDone = {};
    (s.missionsDone || []).forEach(function (id) { g.missionsDone[id] = true; });
    g.subwayUnlocked = !!s.subwayUnlocked;
    g.dungeonCleared = s.dungeonCleared || {};
    g.xCutsceneDone = !!s.xCutsceneDone;
    g.arcadeMinigameDone = !!s.arcadeMinigameDone;
    g.subwayPuzzlesDone = !!s.subwayPuzzlesDone;
    g.crystals = Array.isArray(s.crystals) ? s.crystals.slice() : [0, 1, 2, 3, 4];
    g.crystalCount = s.crystalCount || 0;
    g.quarryMissionDone = !!s.quarryMissionDone;
    g.visited = { chamber: true, shopping: true };
    (s.visited || []).forEach(function (r) { g.visited[r] = true; });
    g.visited[g.room] = true;
    updateMapImage();
    if (s.chestDay === s.day && Array.isArray(s.chestLayout)) {
      g.chestDay = s.chestDay;
      g.chestLayout = s.chestLayout.slice();
      g.chestsOpened = {};
      (s.chestsOpened || []).forEach(function (id) { g.chestsOpened[id] = true; });
    } else {
      // Old save without chest data, or the day moved on: roll a
      // fresh set for today.
      rollChests();
    }
    g.proposed = !!s.proposed;
    if (s.fashion) {
      g.fashion.gownOwned = !!s.fashion.gownOwned;
      g.fashion.gownOn = !!s.fashion.gownOn;
      g.fashion.bandanaOwned = !!s.fashion.bandanaOwned;
      g.fashion.bandanaOn = !!s.fashion.bandanaOn;
    }
    if (s.look) {
      g.look.sylviaOutfit = s.look.sylviaOutfit || "default";
      g.look.sylviaHair = s.look.sylviaHair || "wavy";
      g.look.rayOutfit = s.look.rayOutfit || "default";
      g.look.rayHair = s.look.rayHair || "afro";
      g.look.owned = (s.look.owned || []).slice();
      preloadLook();
    }
    g.monsters = []; g.coins = [];
    g.lastRoom = null;
    g.camX = 0;
    resize();
  }
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
    // The shadow is a picture now, not a canvas fill. Canvas fills
    // kept picking up the energy bar's colour (the green shadow the
    // player saw), and a picture cannot be tinted by another fill.
    // Same fix as the pink heart images in v67.
    if (shadowImg && shadowImg.complete && shadowImg.naturalWidth > 0) {
      var sw = w * 0.64, sh = 12;
      ctx.drawImage(shadowImg, x - sw / 2, feetY + 4 - sh / 2, sw, sh);
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(x, feetY + 4, w * 0.32, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // The Crystal Quarry makes them glow a soft blue, but only in
  // there. An image, not a canvas fill, so the energy-bar fill bug
  // cannot tint it. Drawn behind the sprite, like an aura.
  function drawQuarryGlow(x, cy, w, h) {
    if (g.room !== "quarry") return;
    if (!glowBlueImg || !glowBlueImg.complete || glowBlueImg.naturalWidth === 0) return;
    var gw = w * 2.2;
    var gh = h * 1.3;
    ctx.drawImage(glowBlueImg, x - gw / 2, cy - gh / 2, gw, gh);
  }

  // Dungeon monsters: Key Knight, Candle Pup, Bitey Rock, Bell Ghost.
  // They live only in the Ancient Dungeon. Each one takes 2 hits to
  // kill (Sylvia's kick or Ray's punch) and drops 1 coin when it dies.
  // A monster hit on Sylvia counts toward a heart: 3 hits from any of
  // them cost her one heart (20 HP). Kissing Ray restores one heart.
  // h is the monster's height as a fraction of the canvas height, so
  // they are big enough for her high kick to reach, and they hop and
  // bob up into the kick as they move.
  var MONSTERS = {
    keyknight: { imgs: monsterKeyknightImgs, h: 0.13, speed: 0.5, hop: 0.07 },
    candlepup: { imgs: monsterCandlepupImgs, h: 0.12, speed: 0.9, hop: 0.12 },
    biteyrock: { imgs: monsterBiteyrockImgs, h: 0.14, speed: 0.4, hop: 0.13 },
    bellghost: { imgs: monsterBellghostImgs, h: 0.13, speed: 0.6, hop: 0.05 }
  };
  // One monster type per dungeon level, each with its own toughness,
  // damage rhythm and reward. Level 1 is the graveyard (Bitey Rock):
  // half a heart every 5 attacks, 2 coins, 2 hits to kill. Level 2 is
  // the Crypt (Candle Pup): half a heart every 3 attacks, 5 coins,
  // 3 hits. Level 3 is the Cages (Key Knight): half a heart every 2
  // attacks, 8 coins, 4 hits. Level 4 is the Court (Bell Ghost): a
  // whole heart every 2 attacks, 15 coins, 5 hits.
  var DUNGEON_LEVELS = {
    dungeon:  { type: "biteyrock", hp: 2, coins: 2, hitsPerDamage: 5, damage: 10 },
    dungeon2: { type: "candlepup", hp: 3, coins: 5, hitsPerDamage: 3, damage: 10 },
    dungeon3: { type: "keyknight", hp: 4, coins: 8, hitsPerDamage: 2, damage: 10 },
    dungeon4: { type: "bellghost", hp: 5, coins: 15, hitsPerDamage: 2, damage: 20 }
  };
  // The dungeon levels in order, deepest last. Going deeper is locked
  // until every monster on the current level is gone. Going back up
  // is always open. At the very bottom, clearing the level is also
  // what makes X show himself.
  var DUNGEON_ORDER = { dungeon: 0, dungeon2: 1, dungeon3: 2, dungeon4: 3 };
  function dungeonCleared() {
    return isDungeonRoom(g.room) && g.monsters.length === 0;
  }
  function dungeonAllCleared() {
    return g.dungeonCleared.dungeon && g.dungeonCleared.dungeon2 && g.dungeonCleared.dungeon3 && g.dungeonCleared.dungeon4;
  }
  // Missions: the story in the best order, from talking to Vicky
  // to the proposal on the Surface. Two of them cannot be finished
  // yet: the arcade's secret needs the minigame (Erika is building
  // it), and the subway stairs need the puzzles (not built yet).
  // A mission completes when its moment happens, even out of order;
  // the current one is simply the first not yet done.
  var MISSIONS = [
    { id: "vicky", title: "Talk to Vicky", hint: "Vicky has been pouring drinks at the bar forever. Go say hi.", room: "bar" },
    { id: "mayor", title: "Talk to the Mayor", hint: "The Mayor will be at the bar tomorrow. He knows things.", room: "bar" },
    { id: "garden", title: "Find the Secret Garden", hint: "Past the Flooded Cistern, past the shopping district. The Mayor let it slip.", room: "garden" },
    { id: "fountain", title: "Make a wish", hint: "The fountain in the garden grants one wish.", room: "garden" },
    { id: "arcade", title: "The arcade's secret", hint: "The arcade's arches hide a way down. Find the hint that opens them.", room: "arcade" },
    { id: "quarry", title: "Crystals in the quarry", hint: "The Crystal Quarry hums. Gather the five glowing crystals.", room: "quarry" },
    { id: "dungeon", title: "Clear the dungeon", hint: "Gather the quarry crystals to open the iron door, then clear every level.", room: "dungeon4" },
    { id: "x", title: "Meet X", hint: "Something waits at the bottom of the dungeon.", room: "dungeon4" },
    { id: "subway", title: "Solve the subway puzzles", hint: "The stairs in the Forgotten Subway are sealed by a puzzle.", room: "subway" },
    { id: "surface", title: "Reach the Surface", hint: "Up through the Upper Levels and the Earthen Tunnel.", room: "surface" },
    { id: "proposal", title: "The proposal", hint: "Walk to the edge of the world with Ray.", room: "surface" }
  ];
  function missionDone(id) { return !!g.missionsDone[id]; }
  function currentMission() {
    for (var i = 0; i < MISSIONS.length; i++) {
      if (!g.missionsDone[MISSIONS[i].id]) return MISSIONS[i];
    }
    return null;
  }
  function completeMission(id) {
    if (g.missionsDone[id]) return;
    var m = null;
    for (var i = 0; i < MISSIONS.length; i++) if (MISSIONS[i].id === id) m = MISSIONS[i];
    if (!m) return;
    g.missionsDone[id] = true;
    showDungeonMsg("Mission complete: " + m.title);
    saveGame();
  }
  // Entering a room can finish a mission: the garden, and the Surface.
  function onEnterRoom(roomKey) {
    if (roomKey === "garden") completeMission("garden");
    if (roomKey === "surface") completeMission("surface");
    maybeShowDungeonControls();
  }
  // The two gates that are not built yet: when the arcade minigame
  // and the subway puzzles are built, they call these, which unlock
  // the way and finish the mission.
  function setArcadeMinigameDone() {
    g.arcadeMinigameDone = true;
    completeMission("arcade");
    saveGame();
  }
  function setSubwayPuzzlesDone() {
    g.subwayPuzzlesDone = true;
    completeMission("subway");
    saveGame();
  }
  function showDungeonMsg(text) {
    g.dungeonMsg = text;
    g.dungeonMsgT = 180;
  }
  function spawnMonsters() {
    g.monsters = [];
    g.coins = [];
    g.monsterHits = 0;
    var lvl = DUNGEON_LEVELS[g.room] || DUNGEON_LEVELS.dungeon;
    for (var i = 0; i < 8; i++) {
      g.monsters.push({
        type: lvl.type,
        x: 350 + i * 200 + Math.random() * 80,
        depth: -Math.random() * depthRange() * 0.8,
        dir: Math.random() < 0.5 ? -1 : 1,
        pause: Math.random() * 120,
        walk: 0,
        hp: lvl.hp,
        hopT: Math.floor(Math.random() * 90),
        hitT: 0,
        atkT: 0
      });
    }
  }
  function clearMonsters() { g.monsters = []; g.coins = []; }
  function monsterH(m) { return g.h * MONSTERS[m.type].h; }
  function updateMonsters() {
    if (!isDungeonRoom(g.room)) return;
    for (var i = g.monsters.length - 1; i >= 0; i--) {
      var m = g.monsters[i];
      var def = MONSTERS[m.type];
      if (m.hitT > 0) m.hitT -= 1;
      if (m.atkT > 0) m.atkT -= 1;
      m.hopT += 1;
      // Chase Sylvia when she is close, wander when she is far.
      var dx = g.px - m.x;
      var chasing = Math.abs(dx) < 350 && !g.sleeping && !g.kiss.active;
      if (m.pause > 0) { m.pause -= 1; }
      else {
        if (chasing) {
          m.dir = dx > 0 ? 1 : -1;
          m.x += m.dir * def.speed * 1.6;
          var dd = g.depth - m.depth;
          m.depth += Math.max(-0.8, Math.min(0.8, dd));
        } else {
          m.x += m.dir * def.speed;
          m.walk += 0.3;
          if (Math.random() < 0.002) m.pause = 60 + Math.random() * 120;
        }
        if (m.x < 150) { m.x = 150; m.dir = 1; m.pause = 60 + Math.random() * 120; }
        else if (m.x > room().w - 150) { m.x = room().w - 150; m.dir = -1; m.pause = 60 + Math.random() * 120; }
      }
      // Attack: close to Sylvia, its cooldown ready, and she is not
      // briefly invulnerable from a recent hit.
      if (Math.abs(m.x - g.px) < 80 && Math.abs(m.depth - g.depth) < 20 && m.atkT <= 0 && g.hurtT <= 0 && !g.sleeping && !g.kiss.active) {
        m.atkT = 120;
        g.hurtT = 60;
        var lvl = DUNGEON_LEVELS[g.room] || DUNGEON_LEVELS.dungeon;
        g.monsterHits += 1;
        if (g.monsterHits >= lvl.hitsPerDamage) {
          g.monsterHits = 0;
          g.hp = Math.max(0, g.hp - lvl.damage);
        }
        // Shove the monster back so it does not sit on top of her.
        m.x += (m.x < g.px ? -1 : 1) * 50;
      }
    }
    // Coins spin on the floor; walking over one picks it up.
    for (var j = g.coins.length - 1; j >= 0; j--) {
      var c = g.coins[j];
      if (Math.abs(c.x - g.px) < 60 && Math.abs(c.depth - g.depth) < 20) {
        g.coins.splice(j, 1);
        g.coinCount += 1;
      }
    }
    // Glowing crystals in the quarry; walking into one picks it up.
    // No depth check: she just has to reach the crystal. Gather all
    // five and the iron door in the tunnels opens.
    if (g.room === "quarry" && !g.quarryMissionDone) {
      for (var k = g.crystals.length - 1; k >= 0; k--) {
        var sp = CRYSTAL_SPOTS[g.crystals[k]];
        if (!sp) continue;
        if (Math.abs(sp.x - g.px) < 70) {
          g.crystals.splice(k, 1);
          g.crystalCount += 1;
          // She jumps up to snatch it as she grabs it.
          if (g.jumpT <= 0) g.jumpT = 1;
          if (g.crystalCount >= QUARRY_CRYSTALS_NEEDED) {
            g.quarryMissionDone = true;
            completeMission("quarry");
            showDungeonMsg("The crystals sing together. The iron door in the tunnels is open now.");
            saveGame();
          } else {
            showDungeonMsg("Crystal " + g.crystalCount + " of " + QUARRY_CRYSTALS_NEEDED + ".");
          }
        }
      }
    }
  }
  function hitMonsters(fromX, facing, fromDepth) {
    // Sylvia's kick or Ray's punch lands: any monster in front of the
    // attacker, within reach and on the same depth band, takes a hit.
    // When its level's hit count is spent it dies and drops that
    // level's coins in a little cluster where it fell.
    for (var i = g.monsters.length - 1; i >= 0; i--) {
      var m = g.monsters[i];
      var dx = m.x - fromX;
      if (facing === 1 ? (dx < 0 || dx > 150) : (dx > 0 || dx < -150)) continue;
      if (Math.abs(m.depth - fromDepth) > 30) continue;
      m.hp -= 1;
      m.hitT = 12;
      m.x += facing * 30;
      if (m.hp <= 0) {
        var lvl = DUNGEON_LEVELS[g.room] || DUNGEON_LEVELS.dungeon;
        for (var k = 0; k < lvl.coins; k++) {
          g.coins.push({ x: m.x + (Math.random() * 100 - 50), depth: m.depth });
        }
        g.monsters.splice(i, 1);
        // The level is cleared the moment its last monster falls.
        // This is what the subway unlock counts on.
        if (g.monsters.length === 0) {
          g.dungeonCleared[g.room] = true;
          if (dungeonAllCleared()) completeMission("dungeon");
        }
      }
    }
  }
  function drawMonsters() {
    if (!isDungeonRoom(g.room)) return;
    for (var i = 0; i < g.monsters.length; i++) {
      var m = g.monsters[i];
      var def = MONSTERS[m.type];
      var imgs = def.imgs;
      var img = imgs[Math.floor(m.hopT / 12) % imgs.length];
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      var h = monsterH(m);
      var w = h * (img.naturalWidth / img.naturalHeight);
      // Jump high: the pup hops, the rock bounces, the knight jumps
      // too, and the ghost floats high and bobs in the air. The lift
      // carries them up into her high kick.
      var lift = 0;
      if (m.type === "keyknight") {
        var kh = m.hopT % 100;
        lift = kh < 40 ? Math.sin(kh / 40 * Math.PI) * g.h * def.hop : 0;
      } else if (m.type === "candlepup") {
        var ph = m.hopT % 90;
        lift = ph < 35 ? Math.sin(ph / 35 * Math.PI) * g.h * def.hop : 0;
      } else if (m.type === "biteyrock") {
        var bh = m.hopT % 110;
        lift = bh < 40 ? Math.sin(bh / 40 * Math.PI) * g.h * def.hop : 0;
      } else {
        lift = g.h * 0.15 + Math.sin(m.hopT * 0.08) * g.h * def.hop;
      }
      var groundFeetY = groundY() + m.depth;
      var feetY = groundFeetY - lift;
      var x = m.x * scale() - g.camX;
      shadow(x, groundFeetY, w);
      ctx.save();
      if (m.hitT > 0 && m.hitT % 4 < 2) ctx.globalAlpha = 0.4;
      ctx.translate(x, feetY - h / 2);
      if (m.dir === -1) ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }
  // The quarry crystal mission: five glowing crystals scattered
  // across the Crystal Quarry. Walk over one to pick it up; gather
  // all five and the iron door in the tunnels opens.
  var QUARRY_CRYSTALS_NEEDED = 5;
  var CRYSTAL_SPOTS = [
    { x: 300, d: 0.7 },
    { x: 700, d: 0.4 },
    { x: 1100, d: 0.8 },
    { x: 1500, d: 0.3 },
    { x: 1900, d: 0.6 }
  ];
  function crystalNear() {
    // True when an uncollected crystal is close enough to jump for.
    if (g.room !== "quarry" || g.quarryMissionDone) return false;
    for (var i = 0; i < g.crystals.length; i++) {
      var s = CRYSTAL_SPOTS[g.crystals[i]];
      if (s && Math.abs(s.x - g.px) < 120) return true;
    }
    return false;
  }
  function drawCrystals() {
    if (g.room !== "quarry" || g.quarryMissionDone) return;
    var dr = depthRange();
    var pulse = 0.65 + 0.3 * Math.sin(Date.now() / 400);
    for (var i = 0; i < g.crystals.length; i++) {
      var s = CRYSTAL_SPOTS[g.crystals[i]];
      if (!s) continue;
      var img = propCrystalImg;
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      var h = g.h * 0.13;
      var w = h * (img.naturalWidth / img.naturalHeight);
      var depth = -(1 - s.d) * dr;
      var feetY = groundY() + depth;
      var x = s.x * scale() - g.camX;
      // The crystals float just above the floor, bobbing gently.
      var floatY = feetY - 12 + Math.sin(Date.now() / 500 + i * 1.7) * 5;
      shadow(x, feetY, w);
      // A strong blue glow, layered twice so it reads clearly blue,
      // not just another pale thing on the floor.
      drawQuarryGlow(x, floatY - h / 2, w * 2.0, h * 1.5);
      drawQuarryGlow(x, floatY - h / 2, w * 2.0, h * 1.5);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.drawImage(img, x - w / 2, floatY - h, w, h);
      ctx.restore();
    }
  }
  function drawCoins() {
    for (var i = 0; i < g.coins.length; i++) {
      var c = g.coins[i];
      var img = coinImgs[Math.floor(g.time / 8) % coinImgs.length];
      if (!img || !img.complete || img.naturalWidth === 0) continue;
      var h = g.h * 0.08;
      var w = h * (img.naturalWidth / img.naturalHeight);
      var feetY = groundY() + c.depth;
      var x = c.x * scale() - g.camX;
      shadow(x, feetY, w);
      ctx.drawImage(img, x - w / 2, feetY - h, w, h);
    }
  }
  function drawSylvia() {
    if (g.climb.active && g.climb.sylHidden) return;
    if (g.inspect.active) {
      // Inspecting the secret spot: she crouches down to look at it.
      // Once they jump, she is in the descent art, not on the floor.
      if (g.inspect.phase === "drop") return;
      var iimg = sylviaCrouch();
      if (!iimg || !iimg.complete || iimg.naturalWidth === 0) iimg = sylviaIdle();
      if (!iimg || !iimg.complete || iimg.naturalWidth === 0) return;
      var it = (g.depth + depthRange()) / depthRange();
      var ih = sylviaH() * 0.62 * (0.92 + 0.08 * it);
      var iw = ih * (iimg.naturalWidth / iimg.naturalHeight);
      var ifeet = groundY() + g.depth;
      var ix = g.px * scale() - g.camX;
      shadow(ix, ifeet, iw);
      drawQuarryGlow(ix, ifeet - ih / 2, iw, ih);
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
        ? sylviaWalk(Math.floor(g.walk / 3) % 8)
        : (g.climb.t > 115 ? sylviaClimb() : sylviaIdle());
      if (!cimg || !cimg.complete || cimg.naturalWidth === 0) cimg = sylviaIdle();
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
    if (g.sylviaSurprisedT > 0) {
      // She just saw X for the first time: her surprised pose.
      img = sylviaSurprised();
    } else if (g.attack.active) {
      // Stance, then the high kick, then back to stance.
      img = (g.attack.t >= 8 && g.attack.t < 22) ? sylviaKick() : sylviaStance();
    } else if (keys.up || g.homeWalk.active) { img = sylviaBack(Math.floor(g.walk / 6) % 2); }
    else if (keys.down) { img = sylviaFront(Math.floor(g.walk / 6) % 2); }
    else {
      img = moving ? sylviaWalk(Math.floor(g.walk / 3) % 8) : sylviaIdle();
    }
    if (!img || !img.complete || img.naturalWidth === 0) img = sylviaIdle();
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (g.depth + depthRange()) / depthRange(); // 0 back, 1 front
    var h = sylviaH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + g.depth;
    var x = g.px * scale() - g.camX;
    // Jumping: she rises in a little hop and comes back down.
    // The shadow stays on the ground where she left it.
    var jumpH = 0;
    if (g.jumpT > 0) jumpH = Math.sin((g.jumpT / JUMP_DUR) * Math.PI) * sylviaH() * 0.22;
    shadow(x, feetY, w);
    drawQuarryGlow(x, feetY - jumpH - h / 2, w, h);
    ctx.save();
    ctx.translate(x, feetY - jumpH - h / 2);
    // Sylvia's walk frames face right, so flip them when she faces left.
    // Her stance and kick face right too, so they flip as well, and she
    // attacks the way she is facing. Front and back views are never flipped.
    if (g.facing === -1 && img !== sylviaIdle() && img !== sylviaSurprised() && !keys.up && !keys.down) ctx.scale(-1, 1);
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

  // The proposal on the Surface. When they walk all the way to the
  // right edge of the outside, Ray gets down on one knee. The four
  // proposal frames are Erika's art (Ray kneeling with the ring,
  // Sylvia surprised), drawn together as one picture, and the lines
  // are short and romantic: he asks, she is surprised, she says
  // yes, then they kiss.
  var PROPOSAL_LINES = [
    { who: "RAY", lines: ["Sylvia. We made it out together.", "I want every sunrise after this one with you.", "Will you marry me?"] },
    { who: "SYLVIA", lines: ["Ray... is that a ring?", "Are you really asking me?"] },
    { who: "SYLVIA", lines: ["Yes! Yes, a thousand times, yes!"] },
    { who: "", lines: ["She said yes!"] }
  ];
  function surfaceEdgeNear() {
    return g.room === "surface" && g.px >= room().w - 90;
  }
  function startProposal() {
    if (g.proposed || g.proposal.active) return;
    if (g.sleeping || g.kiss.active || g.embrace.active) return;
    if (g.climb.active || g.inspect.active || g.homeWalk.active) return;
    if (g.scooter.riding || g.propRead.open || g.mirror.active) return;
    if (g.photo.active || g.dungeonControls.open || g.map.active || g.missionsOpen || g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.secretOpen || g.chestOpen) return;
    if (g.rescue.active || g.mayorCutscene.active || g.vickyCutscene.active || g.xCutscene.active) return;
    if (g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open) return;
    g.proposal.active = true;
    g.proposal.step = 0;
    g.proposal.t = 0;
    // Ray stands beside her for the moment.
    g.ray.x = g.px - 70;
    g.ray.dir = 1;
    g.ray.depth = g.depth;
  }
  function advanceProposal() {
    if (!g.proposal.active) return;
    if (g.proposal.step === 0 && g.proposal.t < 90) { g.proposal.t = 90; return; }
    g.proposal.step += 1;
    g.proposal.t = 0;
    if (g.proposal.step > 3) endProposal();
  }
  function endProposal() {
    g.proposal.active = false;
    g.proposed = true;
    completeMission("proposal");
    saveGame();
  }
  // The Mayor's garden cutscene: from Day 2, when Sylvia talks to
  // him in the bar, the Mayor is drunk and slips up about the hidden
  // garden. After it, the garden is unlocked. One time only.
  function startMayorCutscene() {
    if (g.mayorCutsceneDone || g.mayorCutscene.active) return;
    if (g.sleeping || g.kiss.active || g.embrace.active) return;
    if (g.climb.active || g.inspect.active || g.homeWalk.active) return;
    if (g.scooter.riding || g.propRead.open || g.mirror.active) return;
    if (g.photo.active || g.dungeonControls.open || g.map.active || g.missionsOpen || g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.secretOpen || g.chestOpen) return;
    if (g.proposal.active || g.rescue.active || g.vickyCutscene.active || g.xCutscene.active) return;
    if (g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open) return;
    g.mayorCutscene.active = true;
    g.mayorCutscene.step = 0;
    g.mayorCutscene.t = 0;
    g.adler.dir = g.px < g.adler.x ? -1 : 1;
    g.ray.dir = g.adler.x < g.ray.x ? -1 : 1;
    g.ray.pause = 9999;
  }
  function advanceMayorCutscene() {
    if (!g.mayorCutscene.active) return;
    g.mayorCutscene.step += 1;
    g.mayorCutscene.t = 0;
    if (g.mayorCutscene.step >= MAYOR_CUTSCENE_LINES.length) endMayorCutscene();
  }
  function endMayorCutscene() {
    g.mayorCutscene.active = false;
    g.mayorCutsceneDone = true;
    g.gardenUnlocked = true;
    g.ray.pause = 0;
    completeMission("mayor");
    saveGame();
  }
  // Vicky's drink cutscene: the first mission. She has poured drinks
  // here forever, she tells them the stairs go up, the Mayor comes
  // tomorrow, and the drinks are on her. One time only.
  function startVickyCutscene() {
    if (g.vickyCutsceneDone || g.vickyCutscene.active) return;
    if (g.sleeping || g.kiss.active || g.embrace.active) return;
    if (g.climb.active || g.inspect.active || g.homeWalk.active) return;
    if (g.scooter.riding || g.propRead.open || g.mirror.active) return;
    if (g.photo.active || g.dungeonControls.open || g.map.active || g.missionsOpen || g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.secretOpen || g.chestOpen) return;
    if (g.proposal.active || g.rescue.active || g.mayorCutscene.active || g.xCutscene.active) return;
    if (g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open) return;
    g.vickyCutscene.active = true;
    g.vickyCutscene.step = 0;
    g.vickyCutscene.t = 0;
    g.ray.dir = VICKY_X > g.ray.x ? 1 : -1;
    g.ray.pause = 9999;
  }
  function advanceVickyCutscene() {
    if (!g.vickyCutscene.active) return;
    g.vickyCutscene.step += 1;
    g.vickyCutscene.t = 0;
    if (g.vickyCutscene.step >= VICKY_CUTSCENE_LINES.length) endVickyCutscene();
  }
  function endVickyCutscene() {
    g.vickyCutscene.active = false;
    g.vickyCutsceneDone = true;
    g.ray.pause = 0;
    completeMission("vicky");
    saveGame();
  }
  // X's appearance: once the whole dungeon is cleared, he shows
  // himself in the Court, and they are both shocked to see him. He
  // tells them the subway is open now, and that the bar leads to it.
  function startXCutscene() {
    if (g.xCutsceneDone || g.xCutscene.active) return;
    if (g.sleeping || g.kiss.active || g.embrace.active) return;
    if (g.climb.active || g.inspect.active || g.homeWalk.active) return;
    if (g.scooter.riding || g.propRead.open || g.mirror.active) return;
    if (g.photo.active || g.dungeonControls.open || g.map.active || g.missionsOpen || g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.secretOpen || g.chestOpen) return;
    if (g.proposal.active || g.rescue.active || g.mayorCutscene.active || g.vickyCutscene.active) return;
    if (g.talk.open || g.ownerTalk.open || g.kidTalk.open || g.eveTalk.open || g.alexisTalk.open || g.priyaTalk.open || g.diegoTalk.open || g.kianTalk.open || g.yutoTalk.open || g.adlerTalk.open || g.mikaTalk.open || g.strangerTalk.open || g.rayTalk.open) return;
    g.xCutscene.active = true;
    g.xCutscene.step = 0;
    g.xCutscene.t = 0;
    g.xSeen = true;
    g.sylviaSurprisedT = 9999;
    g.facing = g.px < g.stranger.x ? 1 : -1;
    g.ray.dir = g.stranger.x < g.ray.x ? -1 : 1;
    g.ray.pause = 9999;
  }
  function advanceXCutscene() {
    if (!g.xCutscene.active) return;
    g.xCutscene.step += 1;
    g.xCutscene.t = 0;
    if (g.xCutscene.step > 3) endXCutscene();
  }
  function endXCutscene() {
    g.xCutscene.active = false;
    g.xCutsceneDone = true;
    g.subwayUnlocked = true;
    g.sylviaSurprisedT = 90;
    g.ray.pause = 0;
    completeMission("x");
    saveGame();
  }
  function startRescue() {
    if (g.rescue.active) return;
    if (g.sleeping || g.proposal.active || g.mayorCutscene.active || g.vickyCutscene.active || g.xCutscene.active || g.climb.active || g.inspect.active || g.homeWalk.active) return;
    if (g.kiss.active || g.embrace.active || g.mirror.active || g.map.active || g.missionsOpen || g.photo.active || g.dungeonControls.open) return;
    if (g.shopOpen || g.fashionOpen || g.salonOpen || g.closetOpen || g.sleepConfirmOpen || g.chestOpen) return;
    if (g.portal.active) return;
    g.rescue.active = true;
    g.rescue.phase = "carry";
    g.rescue.t = 0;
    g.rescue.line = 0;
    if (g.scooter.riding) { g.scooter.riding = false; g.scooter.room = g.room; g.scooter.x = g.px; }
  }
  function updateRescue() {
    if (!g.rescue.active) return;
    g.rescue.t += 1;
    if (g.rescue.phase === "carry") {
      if (g.rescue.t >= 240) {
        clearMonsters();
        g.room = "chamber";
        g.px = 950; g.facing = -1; g.depth = 0;
        g.ray.x = 1020; g.ray.dir = -1; g.ray.depth = 0; g.ray.pause = 0; g.ray.fight.active = false;
        g.hp = g.hpMax; g.energy = g.energyMax; g.monsterHits = 0; g.hurtT = 0;
        // Passing out costs her the rest of the day: she wakes up
        // the next morning, with a fresh roll of chests and the
        // scooter back home, just like waking up from sleep.
        g.day += 1;
        rollChests();
        g.scooter.riding = false;
        g.scooter.room = "shopping";
        g.scooter.x = SCOOTER_X;
        g.camX = 0;
        g.rescue.phase = "kian";
        g.rescue.t = 0;
        g.rescue.line = 0;
        g.rescue.kianX = 900;
        saveGame();
      }
    } else if (g.rescue.phase === "leave") {
      g.rescue.kianX -= 1.4;
      if (g.rescue.kianX <= 40 || g.rescue.t > 300) endRescue();
    }
  }
  function advanceRescue() {
    if (!g.rescue.active) return;
    if (g.rescue.phase === "carry") { g.rescue.t = 240; return; }
    if (g.rescue.phase === "kian") {
      g.rescue.line += 1;
      g.rescue.t = 0;
      if (g.rescue.line >= KIAN_RESCUE_LINES.length) {
        g.rescue.phase = "leave";
        g.rescue.t = 0;
      }
    }
  }
  function endRescue() {
    g.rescue.active = false;
    g.rescue.phase = "carry";
    g.rescue.t = 0;
    g.rescue.line = 0;
    saveGame();
  }
  function drawRescue() {
    ctx.fillStyle = "rgba(5,4,12,0.94)";
    ctx.fillRect(0, 0, g.w, g.h);
    var frame = rescueImgs[Math.floor(g.rescue.t / 15) % rescueImgs.length];
    if (frame && frame.complete && frame.naturalWidth > 0) {
      var h = g.h * 0.62;
      var w = h * (frame.naturalWidth / frame.naturalHeight);
      var cx = g.w / 2;
      var feetY = groundY() + g.depth - 6;
      shadow(cx, feetY, w);
      ctx.drawImage(frame, cx - w / 2, feetY - h, w, h);
    }
    ctx.save();
    ctx.font = "italic 17px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("Ray carries Sylvia home...", g.w / 2, g.h - 28);
    ctx.restore();
  }
  function drawRescueKian() {
    if (!g.rescue.active) return;
    if (g.rescue.phase !== "kian" && g.rescue.phase !== "leave") return;
    if (g.room !== "chamber") return;
    var img = g.rescue.phase === "leave" ? kianWalkImgs[Math.floor(g.time / 12) % kianWalkImgs.length] : kianTalkImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var h = rayH();
    var w = h * (img.naturalWidth / img.naturalHeight);
    var x = g.rescue.kianX * scale() - g.camX;
    var feetY = groundY();
    ctx.save();
    if (g.rescue.phase === "leave") {
      ctx.translate(x, feetY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -h, w, h);
    } else {
      ctx.drawImage(img, x - w / 2, feetY - h, w, h);
    }
    ctx.restore();
  }
  function drawRescueBubble() {
    if (!g.rescue.active || g.rescue.phase !== "kian") return;
    var line = KIAN_RESCUE_LINES[g.rescue.line];
    if (!line) return;
    var cx = g.w / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    var nameW = ctx.measureText("DR. KIAN").width;
    ctx.font = "16px 'Open Sans', sans-serif";
    var lineW = ctx.measureText(line).width;
    var maxW = Math.min(440, g.w - 60);
    var bw = Math.min(maxW, Math.max(nameW, lineW)) + 36;
    var bh = 24 + 22 + 18;
    var bx = cx - bw / 2;
    var by = 56;
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.strokeStyle = "#d9c7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 10, by + bh);
    ctx.lineTo(cx + 10, by + bh);
    ctx.lineTo(cx, by + bh + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7a5fd0";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.fillText("DR. KIAN", cx, by + 20);
    ctx.fillStyle = "#222";
    ctx.font = "16px 'Open Sans', sans-serif";
    // Wrap the line if it is wider than the bubble.
    var words = line.split(" ");
    var lines = [], cur = "";
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + " " + words[i] : words[i];
      if (ctx.measureText(test).width > bw - 36 && cur) { lines.push(cur); cur = words[i]; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], cx, by + 42 + j * 20);
    ctx.restore();
  }
  // A top-centre story bubble, like the rescue's: the speaker's name
  // in colour at the top, the line wrapped below it. Used by the
  // Mayor's garden cutscene and by X's appearance.
  function drawStoryBubble(name, line, nameColor) {
    if (!line) return;
    var cx = g.w / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    var nameW = ctx.measureText(name).width;
    ctx.font = "16px 'Open Sans', sans-serif";
    var lineW = ctx.measureText(line).width;
    var maxW = Math.min(440, g.w - 60);
    var bw = Math.min(maxW, Math.max(nameW, lineW)) + 36;
    // Wrap the line first, then size the bubble to fit however many
    // rows it needs, so a long line never spills past the bottom.
    var words = line.split(" ");
    var lines = [], cur = "";
    for (var k = 0; k < words.length; k++) {
      var test = cur ? cur + " " + words[k] : words[k];
      if (ctx.measureText(test).width > bw - 36 && cur) { lines.push(cur); cur = words[k]; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    var bh = 24 + lines.length * 20 + 8;
    var bx = cx - bw / 2;
    var by = 56;
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.strokeStyle = "#d9c7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 10, by + bh);
    ctx.lineTo(cx + 10, by + bh);
    ctx.lineTo(cx, by + bh + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = nameColor;
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.fillText(name, cx, by + 20);
    ctx.fillStyle = "#222";
    ctx.font = "16px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], cx, by + 42 + j * 20);
    ctx.restore();
  }
  // A cutscene backdrop: the art drawn full height, cropped on the
  // sides, like the room backgrounds. The story bubble goes on top.
  function drawCutsceneImage(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var w = g.h * (img.naturalWidth / img.naturalHeight);
    ctx.drawImage(img, (g.w - w) / 2, 0, w, g.h);
  }
  function drawVickyCutsceneBubble() {
    if (!g.vickyCutscene.active) return;
    drawCutsceneImage(vickyCutsceneImg);
    drawStoryBubble("VICKY", VICKY_CUTSCENE_LINES[g.vickyCutscene.step], "#d6336c");
  }
  function drawMayorCutsceneBubble() {
    if (!g.mayorCutscene.active) return;
    drawCutsceneImage(mayorCutsceneImg);
    drawStoryBubble("MAYOR ADLER", MAYOR_CUTSCENE_LINES[g.mayorCutscene.step], "#7a5fd0");
  }
  function drawXCutsceneBubble() {
    if (!g.xCutscene.active) return;
    drawStoryBubble("X", X_CUTSCENE_LINES[g.xCutscene.step], "#5a4a8a");
  }
  function drawProposal() {
    // One picture per beat now: step 0 Ray slowly gets down on one
    // knee over six frames, then holds out the ring (silent until the
    // ring is out); step 1 Sylvia's surprised reaction cycles;
    // step 2 they stand together happy, step 3 the embrace, with
    // hearts above it.
    var feetY = groundY() + g.depth - 6;
    var cx = g.w / 2;
    if (g.proposal.step === 0) {
      // Ray slowly gets down on one knee, one smooth frame at a time,
      // then holds out the ring and stays there. He does not talk
      // until the ring is out.
      var frame = g.proposal.t < 90 ? proposeKneelImgs[Math.min(5, Math.floor(g.proposal.t / 15))] : proposeAskImg;
      if (frame && frame.complete && frame.naturalWidth > 0) {
        var h = g.h * 0.62;
        var w = h * (frame.naturalWidth / frame.naturalHeight);
        shadow(cx, feetY, w);
        ctx.drawImage(frame, cx - w / 2, feetY - h, w, h);
      }
    } else if (g.proposal.step === 1) {
      var frame = proposeSurpriseImgs[Math.floor(g.proposal.t / 20) % 3];
      if (frame && frame.complete && frame.naturalWidth > 0) {
        var h = g.h * 0.62;
        var w = h * (frame.naturalWidth / frame.naturalHeight);
        shadow(cx, feetY, w);
        ctx.drawImage(frame, cx - w / 2, feetY - h, w, h);
      }
    } else if (g.proposal.step === 2) {
      var frame = proposeYesImg;
      if (frame && frame.complete && frame.naturalWidth > 0) {
        var h = g.h * 0.62;
        var w = h * (frame.naturalWidth / frame.naturalHeight);
        shadow(cx, feetY, w);
        ctx.drawImage(frame, cx - w / 2, feetY - h, w, h);
      }
    } else {
      if (proposeEmbraceImg && proposeEmbraceImg.complete && proposeEmbraceImg.naturalWidth > 0) {
        var kh = g.h * 0.62;
        var kw = kh * (proposeEmbraceImg.naturalWidth / proposeEmbraceImg.naturalHeight);
        shadow(cx, feetY, kw);
        ctx.drawImage(proposeEmbraceImg, cx - kw / 2, feetY - kh, kw, kh);
      }
      var hy = feetY - g.h * 0.62 - 24 + Math.sin(g.proposal.t * 0.12) * 4;
      drawHeart(cx - 34, hy, 10 + Math.sin(g.proposal.t * 0.2) * 2, "#ff5c8a");
      drawHeart(cx + 30, hy - 10, 8 + Math.sin(g.proposal.t * 0.2 + 1) * 2, "#ff7aa2");
      drawHeart(cx, hy - 22, 12 + Math.sin(g.proposal.t * 0.2 + 2) * 2, "#ff5c8a");
    }
    // The line, in a white bubble at the top, like the talk bubbles.
    // He does not talk while he is getting down, so the bubble stays
    // hidden until the ring is out (step 0, t >= 90).
    if (g.proposal.step === 0 && g.proposal.t < 90) return;
    var step = PROPOSAL_LINES[g.proposal.step];
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    var nameW = step.who ? ctx.measureText(step.who).width : 0;
    ctx.font = "16px 'Open Sans', sans-serif";
    var lineW = 0;
    for (var i = 0; i < step.lines.length; i++) {
      lineW = Math.max(lineW, ctx.measureText(step.lines[i]).width);
    }
    var bw = Math.max(nameW, lineW) + 36;
    var bh = (step.who ? 24 : 6) + step.lines.length * 22 + 18;
    var bx = cx - bw / 2;
    var by = 56;
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.strokeStyle = "#d9c7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 14);
    else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();
    // Tail pointing down toward the two of them.
    ctx.beginPath();
    ctx.moveTo(cx - 10, by + bh);
    ctx.lineTo(cx + 10, by + bh);
    ctx.lineTo(cx, by + bh + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    var ty = by + 20;
    if (step.who) {
      ctx.fillStyle = "#7a4fd0";
      ctx.font = "700 13px 'Open Sans', sans-serif";
      ctx.fillText(step.who, cx, ty);
      ty += 22;
    }
    ctx.fillStyle = "#222";
    ctx.font = "16px 'Open Sans', sans-serif";
    for (var j = 0; j < step.lines.length; j++) {
      ctx.fillText(step.lines[j], cx, ty);
      ty += 22;
    }
    // The nudge to continue.
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    var hint = g.proposal.step < 3 ? "Press E to continue" : "Press E to finish";
    var hw = ctx.measureText(hint).width;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cx - hw / 2 - 10, by + bh + 22, hw + 20, 24, 12);
    else ctx.rect(cx - hw / 2 - 10, by + bh + 22, hw + 20, 24);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(hint, cx, by + bh + 39);
    ctx.restore();
  }

  function drawRay() {
    var r = g.ray;
    if (r.inBed) return; // under the covers with her
    if (g.climb.active && g.climb.rayHidden) return;
    if (g.inspect.active) {
      // Inspecting the secret spot: he crouches down beside her.
      // Once they jump, he is in the descent art, not on the floor.
      if (g.inspect.phase === "drop") return;
      var riimg = rayCrouch();
      if (!riimg || !riimg.complete || riimg.naturalWidth === 0) riimg = rayIdle();
      if (!riimg || !riimg.complete || riimg.naturalWidth === 0) return;
      var rit = (r.depth + depthRange()) / depthRange();
      var rih = rayH() * 0.62 * (0.92 + 0.08 * rit);
      var riw = rih * (riimg.naturalWidth / riimg.naturalHeight);
      var rifeet = groundY() + r.depth - 6;
      var rix = r.x * scale() - g.camX;
      shadow(rix, rifeet, riw);
      drawQuarryGlow(rix, rifeet - rih / 2, riw, rih);
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
      var timg = (g.rayTalk.step >= 1 && (g.rayTalk.choice === 2 || g.rayTalk.choice === 3)) ? rayTalkShy() : rayTalk();
      if (!timg || !timg.complete || timg.naturalWidth === 0) timg = rayIdle();
      if (!timg || !timg.complete || timg.naturalWidth === 0) return;
      var tt = (r.depth + depthRange()) / depthRange();
      var th = rayH() * (0.92 + 0.08 * tt);
      var tw = th * (timg.naturalWidth / timg.naturalHeight);
      var tfeet = groundY() + r.depth - 6;
      var tx = r.x * scale() - g.camX;
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
        ? rayWalk(Math.floor(r.walk / 3) % 8)
        : (g.climb.t > 80 ? rayReach()
          : rayWalk(Math.floor(r.walk / 3) % 8));
      if (!rimg || !rimg.complete || rimg.naturalWidth === 0) rimg = rayIdle();
      if (!rimg || !rimg.complete || rimg.naturalWidth === 0) return;
      var rt = (r.depth + depthRange()) / depthRange();
      var rh = rayH() * (0.92 + 0.08 * rt);
      var rw = rh * (rimg.naturalWidth / rimg.naturalHeight);
      var rfeet = groundY() + r.depth - 6 + g.climb.rayY;
      var rx = r.x * scale() - g.camX;
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
      img = nearTarget ? rayPunch()
        : rayWalk(Math.floor(r.walk / 3) % 8);
    } else if (r.vdir === -1) { img = rayBack(Math.floor(r.walk / 6) % 2); }
    else if (r.vdir === 1) { img = rayFront(Math.floor(r.walk / 6) % 2); }
    else {
      img = walking ? rayWalk(Math.floor(r.walk / 3) % 8) : rayIdle();
    }
    if (!img || !img.complete || img.naturalWidth === 0) img = rayIdle();
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (r.depth + depthRange()) / depthRange(); // 0 back, 1 front
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + r.depth - 6;
    var x = r.x * scale() - g.camX;
    shadow(x, feetY, w);
    drawQuarryGlow(x, feetY - h / 2, w, h);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Ray's frames face right, so flip them when he faces left.
    // His punch goes the same way Sylvia faces, so it matches her kick.
    // His walk frames flip by the way he is actually moving, so he never
    // moonwalks while running to her side. Front and back views are never flipped.
    var sideView = r.fight.active || r.vdir === 0;
    if (sideView && img === rayPunch()) { if (g.facing === -1) ctx.scale(-1, 1); }
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

  // Eve, Sylvia's best friend and Char's granddaughter. She only
  // appears on the Shopping District street, wandering it like the
  // owners wander their shops. While talking she shows her surprised
  // pose for the greeting, her talk pose for the line, and her
  // laughing pose right after a joke.
  function drawEve() {
    if (g.room !== "shopping") return;
    var ev = g.eve;
    var talking = g.eveTalk.open;
    var walking = !talking && ev.pause <= 0;
    var img;
    if (talking && ev.surprisedT > 0) img = eveSurprisedImg;
    else if (talking && ev.laughT > 0) img = eveLaughImg;
    else if (talking) img = eveTalkImg;
    else img = walking ? eveWalkImgs[Math.floor(ev.walk / 6) % eveWalkImgs.length] : eveIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = eveIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (ev.depth + depthRange()) / depthRange();
    var h = sylviaH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + ev.depth - 6;
    var x = ev.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Her walk frames face right, so flip them when she walks left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (walking && ev.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Alexis, one of the wealthiest in the underground, spoiled and
  // bitchy, lowkey after Ray. She appears in whichever room she is
  // in right now: the Shopping District street, the clothing store,
  // or the bar. While talking she shows her surprised pose for the
  // greeting, her talk pose for the line, and her laughing pose
  // right after one of her little jabs.
  function drawAlexis() {
    if (g.room !== g.alexis.room) return;
    var ax = g.alexis;
    var talking = g.alexisTalk.open;
    var walking = !talking && ax.pause <= 0;
    var img;
    if (talking && ax.surprisedT > 0) img = alexisSurprisedImg;
    else if (talking && ax.laughT > 0) img = alexisLaughImg;
    else if (talking) img = alexisTalkImg;
    else img = walking ? alexisWalkImgs[Math.floor(ax.walk / 6) % alexisWalkImgs.length] : alexisIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = alexisIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (ax.depth + depthRange()) / depthRange();
    var h = sylviaH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + ax.depth - 6;
    var x = ax.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Her walk frames face right, so flip them when she walks left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (walking && ax.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Priya, an Indian gym girlie, always running and staying fit.
  // She appears in whichever room she is in right now: the Shopping
  // District street or the Flooded Cistern. She runs, not walks, so
  // her run frames cycle while she moves. While talking she shows
  // her surprised pose for the greeting, her talk pose for the line,
  // and her laughing pose right after a tip.
  function drawPriya() {
    if (g.room !== g.priya.room) return;
    var pr = g.priya;
    var talking = g.priyaTalk.open;
    var running = !talking && pr.pause <= 0;
    var img;
    if (talking && pr.surprisedT > 0) img = priyaSurprisedImg;
    else if (talking && pr.laughT > 0) img = priyaLaughImg;
    else if (talking) img = priyaTalkImg;
    else img = running ? priyaRunImgs[Math.floor(pr.walk / 6) % priyaRunImgs.length] : priyaIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = priyaIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (pr.depth + depthRange()) / depthRange();
    var h = sylviaH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + pr.depth - 6;
    var x = pr.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Her run frames face right, so flip them when she runs left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (running && pr.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Diego, Mexican, super flirty and popular, but bros with Ray. He
  // appears in whichever room he is in right now: the bar, or the
  // Shopping District street when he steps out. He is a guy, so he
  // is drawn at Ray's height. While talking he shows his surprised
  // pose for the greeting, his talk pose for the line, and his
  // laughing pose right after one of his lines.
  function drawDiego() {
    if (g.room !== g.diego.room) return;
    var dg = g.diego;
    var talking = g.diegoTalk.open;
    var walking = !talking && dg.pause <= 0;
    var img;
    if (talking && dg.surprisedT > 0) img = diegoSurprisedImg;
    else if (talking && dg.laughT > 0) img = diegoLaughImg;
    else if (talking) img = diegoTalkImg;
    else img = walking ? diegoWalkImgs[Math.floor(dg.walk / 6) % diegoWalkImgs.length] : diegoIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = diegoIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (dg.depth + depthRange()) / depthRange();
    // Diego is a tiny bit shorter than Ray: not everyone is the same height.
    var h = rayH() * 0.94 * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + dg.depth - 6;
    var x = dg.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // His walk frames face right, so flip them when he walks left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (walking && dg.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Dr. Kian, a Persian hot doctor who cures people in the
  // underground. He is a gentle man and very pure hearted. He
  // appears in whichever room he is in right now: mostly the bar,
  // sometimes the Shopping District street. He is a guy, so he is
  // drawn at Ray's height. While talking he shows his surprised
  // pose for the greeting, his talk pose for the line, and his
  // laughing pose right after one of his lines.
  function drawKian() {
    if (g.room !== g.kian.room) return;
    var kn = g.kian;
    var talking = g.kianTalk.open;
    var walking = !talking && kn.pause <= 0;
    var img;
    if (talking && kn.surprisedT > 0) img = kianSurprisedImg;
    else if (talking && kn.laughT > 0) img = kianLaughImg;
    else if (talking) img = kianTalkImg;
    else img = walking ? kianWalkImgs[Math.floor(kn.walk / 6) % kianWalkImgs.length] : kianIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = kianIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (kn.depth + depthRange()) / depthRange();
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + kn.depth - 6;
    var x = kn.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // His walk frames face right, so flip them when he walks left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (walking && kn.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Yuto, a Japanese sexy nerd that loves reading. He is always
  // teaching people something new and interesting facts. He is a bit
  // cocky and egoistic, but in a hot way. He appears in whichever
  // room he is in right now: the Shopping District street or the
  // bar. He is a guy, so he is drawn at Ray's height. While talking
  // he shows his surprised pose for the greeting, his talk pose for
  // the line, and his laughing pose right after one of his lines.
  function drawYuto() {
    if (g.room !== g.yuto.room) return;
    var yt = g.yuto;
    var talking = g.yutoTalk.open;
    var walking = !talking && yt.pause <= 0;
    var img;
    if (talking && yt.surprisedT > 0) img = yutoSurprisedImg;
    else if (talking && yt.laughT > 0) img = yutoLaughImg;
    else if (talking) img = yutoTalkImg;
    else img = walking ? yutoWalkImgs[Math.floor(yt.walk / 6) % yutoWalkImgs.length] : yutoIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = yutoIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (yt.depth + depthRange()) / depthRange();
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + yt.depth - 6;
    var x = yt.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // His walk frames face right, so flip them when he walks left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (walking && yt.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // Mayor Adler, the mayor of the whole underground city. He looks evil
  // but is actually a sweetheart who just does not know how to
  // speak. He is trying his best. He is constantly in the bar. He
  // is a guy, so he is drawn at Ray's height. While talking he
  // shows his surprised pose for the greeting, his talk pose for
  // the line, and his laughing pose right after one of his lines.
  function drawAdler() {
    if (!mayorHere() || g.room !== g.adler.room) return;
    var ad = g.adler;
    var talking = g.adlerTalk.open;
    var walking = !talking && ad.pause <= 0;
    var img;
    if (talking && ad.surprisedT > 0) img = adlerSurprisedImg;
    else if (talking && ad.laughT > 0) img = adlerLaughImg;
    else if (talking) img = adlerTalkImg;
    else img = walking ? adlerWalkImgs[Math.floor(ad.walk / 6) % adlerWalkImgs.length] : adlerIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = adlerIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (ad.depth + depthRange()) / depthRange();
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + ad.depth - 6;
    var x = ad.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // His walk frames face right, so flip them when he walks left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (walking && ad.dir === -1) ctx.scale(-1, 1);
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
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    ctx.drawImage(embraceImg, -w / 2, -h / 2, w, h);
    ctx.restore();
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
    // Speech bubble just above Vicky, tail pointing down to her head.
    if (!g.talk.open) return;
    var vx = VICKY_HEAD_X * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(VICKY_AFTER_LINES[g.talk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("VICKY").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, vx - bw / 2));
    var by = g.h * 0.41 - bh - 12;
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
  function drawEveTalk() {
    // Speech bubble above Eve, tail pointing down to her. Mirrors
    // the owners' and kids' bubbles.
    if (!g.eveTalk.open) return;
    var ev = g.eve;
    var ex = ev.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(EVE_LINES[g.eveTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("EVE").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("EVE", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  function drawAlexisTalk() {
    // Speech bubble above Alexis, tail pointing down to her. Mirrors
    // Eve's bubble. She can be in the shopping street, the clothing
    // store or the bar, so her position is her own room's x.
    if (!g.alexisTalk.open) return;
    var ax = g.alexis;
    var ex = ax.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(ALEXIS_LINES[g.alexisTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("ALEXIS").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("ALEXIS", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  function drawPriyaTalk() {
    // Speech bubble above Priya, tail pointing down to her. Mirrors
    // Alexis's bubble. She can be in the shopping street or the
    // cistern, so her position is her own room's x.
    if (!g.priyaTalk.open) return;
    var pr = g.priya;
    var ex = pr.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(PRIYA_LINES[g.priyaTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("PRIYA").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("PRIYA", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  function drawDiegoTalk() {
    // Speech bubble above Diego, tail pointing down to him. Mirrors
    // Priya's bubble. He can be in the bar or the shopping street,
    // so his position is his own room's x.
    if (!g.diegoTalk.open) return;
    var dg = g.diego;
    var ex = dg.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(DIEGO_LINES[g.diegoTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("DIEGO").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("DIEGO", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  function drawKianTalk() {
    // Speech bubble above Dr. Kian, tail pointing down to him.
    // Mirrors Diego's bubble. He can be in the bar or the shopping
    // street, so his position is his own room's x.
    if (!g.kianTalk.open) return;
    var kn = g.kian;
    var ex = kn.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(KIAN_LINES[g.kianTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("DR. KIAN").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("DR. KIAN", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  function drawYutoTalk() {
    // Speech bubble above Yuto, tail pointing down to him. Mirrors
    // Dr. Kian's bubble. He can be in the bar or the shopping
    // street, so his position is his own room's x.
    if (!g.yutoTalk.open) return;
    var yt = g.yuto;
    var ex = yt.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(YUTO_LINES[g.yutoTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("YUTO").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("YUTO", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  function drawAdlerTalk() {
    // Speech bubble above Mayor Adler, tail pointing down to him.
    // Mirrors Yuto's bubble. He is always in the bar, so his
    // position is the bar's x.
    if (!g.adlerTalk.open) return;
    var ad = g.adler;
    var ex = ad.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(ADLER_LINES[g.adlerTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("MAYOR ADLER").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("MAYOR ADLER", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  // Mika, a Filipina girl who lives in the Flooded Cistern. She is
  // mostly sitting down, so her rest pose is the sitting one: she
  // sits a moment after she stops, and stays sitting for the rest
  // of her long pause. When she talks she stands up, surprised at
  // first that anyone stopped, then warm and laughing. She is a
  // girl, so she is drawn at Sylvia's height. Sitting, she is
  // shorter: the sitting pose is 0.68 as tall as her standing one.
  function drawMika() {
    if (g.room !== g.mika.room) return;
    var mk = g.mika;
    var talking = g.mikaTalk.open;
    var walking = !talking && mk.pause <= 0;
    var sitting = !talking && !walking && mk.sitting;
    var img;
    if (talking && mk.surprisedT > 0) img = mikaSurprisedImg;
    else if (talking && mk.laughT > 0) img = mikaLaughImg;
    else if (talking) img = mikaTalkImg;
    else if (sitting) img = mikaSitImg;
    else img = walking ? mikaWalkImgs[Math.floor(mk.walk / 6) % mikaWalkImgs.length] : mikaIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = mikaIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (mk.depth + depthRange()) / depthRange();
    var h = sylviaH() * (sitting ? 0.68 : 1) * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + mk.depth - 6;
    var x = mk.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // Her walk frames face right, so flip them when she walks left.
    // The idle, talk, surprised, laugh and sitting poses are front
    // views, never flipped.
    if (walking && mk.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  function drawMikaTalk() {
    // Speech bubble above Mika, tail pointing down to her.
    // Mirrors Adler's bubble. She is always in the cistern, so her
    // position is the cistern's x.
    if (!g.mikaTalk.open) return;
    var mk = g.mika;
    var ex = mk.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(MIKA_LINES[g.mikaTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("MIKA").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("MIKA", bx + 16, by + 20);
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], bx + 16, by + 42 + j * 18);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = "600 11px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("T for more", bx + bw - 14, by + bh - 8);
    ctx.restore();
  }
  // X, the hooded stranger at the bottom of the dungeon. He is Ray's
  // height, walks slowly, and never leaves the Court of Justice.
  function drawStranger() {
    if (g.room !== g.stranger.room) return;
    // X only shows himself once every monster on this level is gone.
    if (!dungeonCleared()) return;
    var st = g.stranger;
    var talking = g.strangerTalk.open;
    var walking = !talking && st.pause <= 0;
    var img;
    if (talking && st.surprisedT > 0) img = xSurprisedImg;
    else if (talking && st.laughT > 0) img = xLaughImg;
    else if (talking) img = xTalkImg;
    else img = walking ? xWalkImgs[Math.floor(st.walk / 6) % xWalkImgs.length] : xIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) img = xIdleImg;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var t = (st.depth + depthRange()) / depthRange();
    var h = rayH() * (0.92 + 0.08 * t);
    var w = h * (img.naturalWidth / img.naturalHeight);
    var feetY = groundY() + st.depth - 6;
    var x = st.x * scale() - g.camX;
    shadow(x, feetY, w);
    ctx.save();
    ctx.translate(x, feetY - h / 2);
    // His walk frames face right, so flip them when he walks left.
    // The idle, talk, surprised and laugh poses are front views,
    // never flipped.
    if (walking && st.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  function drawStrangerTalk() {
    // Speech bubble above X, tail pointing down to him. Mirrors
    // Mika's bubble. He is always in the Court of Justice, so his
    // position is the dungeon4 x.
    if (!g.strangerTalk.open) return;
    var st = g.stranger;
    var ex = st.x * scale() - g.camX;
    var maxW = Math.min(g.w * 0.6, 420);
    ctx.save();
    ctx.font = "400 14px 'Open Sans', sans-serif";
    var lines = wrapText(STRANGER_LINES[g.strangerTalk.idx], maxW - 32);
    var bw = 0;
    ctx.font = "700 12px 'Open Sans', sans-serif";
    bw = Math.max(bw, ctx.measureText("X").width);
    ctx.font = "400 14px 'Open Sans', sans-serif";
    for (var i = 0; i < lines.length; i++) bw = Math.max(bw, ctx.measureText(lines[i]).width);
    bw = Math.min(maxW, bw + 32);
    var bh = 24 + lines.length * 18 + 20;
    var bx = Math.max(8, Math.min(g.w - bw - 8, ex - bw / 2));
    var by = g.h * 0.32 - bh - 12;
    if (by < 8) by = 8;
    var tx = Math.max(bx + 18, Math.min(bx + bw - 18, ex));
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
    ctx.fillText("X", bx + 16, by + 20);
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
  // Health hearts, drawn as pink heart images. They are pictures,
  // not canvas fills, so nothing else on the top row can tint one.
  function drawHp() {
    ctx.save();
    ctx.font = "700 11px 'Open Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("HP", 14, 26);
    // The hearts are images now, not canvas fills, so no fill color
    // from anywhere else in the HUD can ever tint one. Full = solid
    // pink, half = light pink, empty = a faint pink heart.
    for (var i = 0; i < 5; i++) {
      var full = g.hp >= (i + 1) * 20;
      var half = !full && g.hp > i * 20;
      var cx = 44 + i * 24, cy = 22;
      var hImg = full ? heartFullImg : half ? heartHalfImg : heartEmptyImg;
      if (hImg && hImg.complete && hImg.naturalWidth > 0) {
        ctx.drawImage(hImg, cx - 10, cy - 10, 20, 20);
      } else {
        drawHeart(cx, cy, 9, full ? "#ff5b8f" : half ? "#ff8fb5" : "rgba(255,91,143,0.25)");
      }
    }
    // Coins sit beside the hearts on the top row, small and set well
    // apart from the fifth heart so the gold coin never reads as a
    // yellow heart.
    var coinImg = coinImgs[0];
    if (coinImg && coinImg.complete && coinImg.naturalWidth > 0) {
      var ch2 = 14;
      var cw2 = ch2 * (coinImg.naturalWidth / coinImg.naturalHeight);
      ctx.drawImage(coinImg, 190, 15, cw2, ch2);
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.fillText(String(g.coinCount), 209, 27);
    ctx.restore();
  }
  // Energy bar and day count. The bar sits beside the health bar
  // on the top row, just after the coin count, so the health and
  // energy read as one strip. The day sits on a second row at the
  // top right. The bar is gold and drains slowly; when it is low
  // it pulses to nudge her toward bed.
  function drawEnergyAndDay() {
    ctx.save();
    ctx.font = "700 11px 'Open Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    // The energy label starts just after the hearts, and the bar
    // sits beside them on the top row. The bar is pictures now, not
    // canvas fills: the green fill kept tinting everything drawn
    // after it (the fifth heart, the shadow, the prompt pills), so
    // there is no green fill left in the game at all.
    ctx.fillText("E", 235, 27);
    var bx = 253, by = 14, bh = 16;
    var bw = Math.max(50, Math.min(100, g.w - 267));
    if (energyBgImg && energyBgImg.complete && energyBgImg.naturalWidth > 0) {
      ctx.drawImage(energyBgImg, bx, by, bw, bh);
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 8);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
    }
    var frac = Math.max(0, Math.min(1, g.energy / g.energyMax));
    var pulse = g.energy <= 20 ? 0.55 + 0.45 * Math.sin(g.time * 0.15) : 1;
    var fillImg = g.energy <= 20 ? energyFillLowImg : energyFillImg;
    if (frac > 0) {
      ctx.globalAlpha = pulse;
      if (fillImg && fillImg.complete && fillImg.naturalWidth > 0) {
        ctx.drawImage(fillImg, bx + 1, by + 1, Math.max(2, (bw - 2) * frac), bh - 2);
      } else {
        ctx.fillStyle = g.energy <= 20 ? "#ff9e3e" : "#58c96b";
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx + 1, by + 1, Math.max(2, (bw - 2) * frac), bh - 2, 7);
        else ctx.rect(bx + 1, by + 1, Math.max(2, (bw - 2) * frac), bh - 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "700 13px 'Open Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Day " + g.day, g.w - 14, 47);
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
    if (key === "bar" && !g.subwayUnlocked) label = "The stairs are sealed";
    else if (key === "subway" && !g.subwayPuzzlesDone) label = "The stairs are sealed by a puzzle";
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
  // Debug overlay, enabled with ?debug=1 in the URL. Draws the
  // live values that decide whether the characters are drawn, so a
  // vanishing bug can be caught in the act instead of guessed at.
  var DEBUG = /[?&]debug=1/.test(window.location.search);
  function drawDebug() {
    if (!DEBUG) return;
    var sx = g.px * scale() - g.camX;
    var rx = g.ray.x * scale() - g.camX;
    var moving = keys.left || keys.right || keys.up || keys.down;
    var wimg = sylviaWalkImgs[Math.floor(g.walk / 3) % sylviaWalkImgs.length];
    var lines = [
      "px=" + Math.round(g.px) + " camX=" + Math.round(g.camX) + " scale=" + scale().toFixed(3) + " w=" + g.w + " h=" + g.h,
      "sylX=" + Math.round(sx) + " rayX=" + Math.round(rx) + " depth=" + g.depth.toFixed(1) + " room=" + g.room,
      "walk=" + g.walk.toFixed(1) + " moving=" + moving + " climb=" + g.climb.active + "/" + g.climb.sylHidden,
      "walkImg ok=" + (!!wimg && wimg.complete && wimg.naturalWidth !== 0) + " idle ok=" + (!!sylviaIdleImg && sylviaIdleImg.complete && sylviaIdleImg.naturalWidth !== 0),
      "rayWalk ok=" + (!!rayWalkImgs[0] && rayWalkImgs[0].complete && rayWalkImgs[0].naturalWidth !== 0) + " rayIdle ok=" + (!!rayIdleImg && rayIdleImg.complete && rayIdleImg.naturalWidth !== 0)
    ];
    ctx.save();
    ctx.font = "700 13px monospace";
    ctx.textAlign = "left";
    for (var i = 0; i < lines.length; i++) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(8, 8 + i * 18, ctx.measureText(lines[i]).width + 8, 16);
      ctx.fillStyle = "#ffff00";
      ctx.fillText(lines[i], 12, 20 + i * 18);
    }
    ctx.restore();
  }
  function draw() {
    if (g.mirror.active) { drawMirror(); return; }
    if (g.inspect.active && g.inspect.phase === "drop") { drawDescent(); return; }
    drawBg();
    drawProps();
    drawChests();
    drawCoins();
    drawCrystals();
    drawScooter();
    drawArchGlow();
    drawFountainGlow();
    drawChestGlow();
    drawGardenDoorGlow();
    drawHp();
    drawEnergyAndDay();
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
  drawStoneDoorPrompt();
    drawPortalPrompt();
    drawScooterPrompt();
    drawFountainPrompt();
    drawChestPrompt();
    drawGardenDoorPrompt();
    if (g.kiss.active) { drawKiss(); drawTalk(); drawOwnerTalk(); drawKidTalk(); drawEveTalk(); drawAlexisTalk(); drawPriyaTalk(); drawDiegoTalk(); drawKianTalk(); drawYutoTalk(); drawAdlerTalk(); drawMikaTalk(); drawStrangerTalk(); return; }
    if (g.embrace.active) { drawEmbrace(); drawTalk(); drawOwnerTalk(); drawKidTalk(); drawEveTalk(); drawAlexisTalk(); drawPriyaTalk(); drawDiegoTalk(); drawKianTalk(); drawYutoTalk(); drawAdlerTalk(); drawMikaTalk(); drawStrangerTalk(); return; }
    if (g.proposal.active) { drawProposal(); return; }
    if (g.rescue.active && g.rescue.phase === "carry") { drawRescue(); return; }
    if (g.scooter.riding) drawScooterRide();
    else drawRay();
    drawChar();
    drawMikey();
    drawGunner();
    drawArcadeKids();
    drawEve();
    drawAlexis();
    drawPriya();
    drawDiego();
    drawKian();
    drawYuto();
    drawAdler();
    drawMika();
    drawStranger();
    drawMonsters();
    if (!g.scooter.riding && !g.sleeping) drawSylvia();
    drawTalk();
    drawOwnerTalk();
    drawKidTalk();
    drawEveTalk();
    drawAlexisTalk();
    drawPriyaTalk();
    drawDiegoTalk();
    drawKianTalk();
    drawYutoTalk();
    drawAdlerTalk();
    drawMikaTalk();
    drawStrangerTalk();
    drawRescueKian();
    drawRescueBubble();
    drawVickyCutsceneBubble();
    drawMayorCutsceneBubble();
    drawXCutsceneBubble();
    drawRayTalk();
    drawFountainMsg();
    drawChestMsg();
    drawDungeonMsg();
    drawDebug();
  }

  function tick() {
    requestAnimationFrame(tick);
    g.time += 1;
    if (g.jumpT > 0) { g.jumpT += 1; if (g.jumpT > JUMP_DUR) g.jumpT = 0; }
    // The title screen: the world waits until she picks Continue
    // or New Game. The chamber still draws behind it.
    if (!g.started) { draw(); return; }
    // A new room means a new first impression: show the little
    // intro line for the place she just walked into.
    if (g.room !== g.lastRoom) {
      g.lastRoom = g.room; showRoomIntro();
    }
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
      var eBtn2 = document.getElementById("actionList");
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
      var eBtnM = document.getElementById("actionList");
      if (eBtnM) eBtnM.hidden = true;
      var aBtnM = document.getElementById("attackBtn");
      if (aBtnM) aBtnM.hidden = true;
      draw();
      return;
    }
    if (g.photo.active) {
      // Looking at the framed photo: the popup blurs the game behind
      // it. Nothing moves until she puts it back.
      var eBtnP = document.getElementById("actionList");
      if (eBtnP) eBtnP.hidden = true;
      var aBtnP = document.getElementById("attackBtn");
      if (aBtnP) aBtnP.hidden = true;
      draw();
      return;
    }
    if (g.dungeonControls.open) {
      // The dungeon controls card is up: the world waits until she
      // closes it, so nothing can hit her while she reads.
      var eBtnD = document.getElementById("actionList");
      if (eBtnD) eBtnD.hidden = true;
      var aBtnD = document.getElementById("attackBtn");
      if (aBtnD) aBtnD.hidden = true;
      draw();
      return;
    }
    if (g.shopOpen) {
      // Gunner's shop is open: the panel is over the game. Nothing
      // moves until she buys or closes it.
      var eBtnS = document.getElementById("actionList");
      if (eBtnS) eBtnS.hidden = true;
      var aBtnS = document.getElementById("attackBtn");
      if (aBtnS) aBtnS.hidden = true;
      var sBtnS = document.getElementById("shopBtn");
      if (sBtnS) sBtnS.hidden = true;
      draw();
      return;
    }
    if (g.fashionOpen) {
      // Char's fashion shop is open: the panel is over the game.
      // Nothing moves until she buys, wears, or closes it.
      var eBtnF = document.getElementById("actionList");
      if (eBtnF) eBtnF.hidden = true;
      var aBtnF = document.getElementById("attackBtn");
      if (aBtnF) aBtnF.hidden = true;
      var fBtnF = document.getElementById("fashionBtn");
      if (fBtnF) fBtnF.hidden = true;
      draw();
      return;
    }
    if (g.sleepConfirmOpen) {
      // The sleep confirm is open: the panel is over the game.
      // Nothing moves until she says yes or not yet.
      var eBtnSleep = document.getElementById("actionList");
      if (eBtnSleep) eBtnSleep.hidden = true;
      var aBtnSleep = document.getElementById("attackBtn");
      if (aBtnSleep) aBtnSleep.hidden = true;
      var sBtnSleep = document.getElementById("shopBtn");
      if (sBtnSleep) sBtnSleep.hidden = true;
      var fBtnSleep = document.getElementById("fashionBtn");
      if (fBtnSleep) fBtnSleep.hidden = true;
      draw();
      return;
    }
    if (g.secretOpen) {
      // The fountain's secret panel is open: the panel is over the
      // game. Nothing moves until she asks or walks away.
      var eBtnSecret = document.getElementById("actionList");
      if (eBtnSecret) eBtnSecret.hidden = true;
      var aBtnSecret = document.getElementById("attackBtn");
      if (aBtnSecret) aBtnSecret.hidden = true;
      var sBtnSecret = document.getElementById("shopBtn");
      if (sBtnSecret) sBtnSecret.hidden = true;
      var fBtnSecret = document.getElementById("fashionBtn");
      if (fBtnSecret) fBtnSecret.hidden = true;
      draw();
      return;
    }
    if (pinball.active) {
      // The pinball machine is open: the world waits behind the
      // popup while the ball, flippers and bumpers run.
      var eBtnPb = document.getElementById("actionList");
      if (eBtnPb) eBtnPb.hidden = true;
      var aBtnPb = document.getElementById("attackBtn");
      if (aBtnPb) aBtnPb.hidden = true;
      var ev = pbStep(pinball, 1 / 60);
      if (ev === "won") pinballWon();
      else if (ev === "lost") pinballLost();
      pinballDraw();
      pinballUpdateHUD();
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
    if (g.eveTalk.open) {
      if (g.room !== "shopping" || Math.abs(g.px - g.eve.x) > 180) g.eveTalk.open = false;
    }
    if (g.alexisTalk.open) {
      if (g.room !== g.alexis.room || Math.abs(g.px - g.alexis.x) > 180) g.alexisTalk.open = false;
    }
    if (g.priyaTalk.open) {
      if (g.room !== g.priya.room || Math.abs(g.px - g.priya.x) > 180) g.priyaTalk.open = false;
    }
    if (g.diegoTalk.open) {
      if (g.room !== g.diego.room || Math.abs(g.px - g.diego.x) > 180) g.diegoTalk.open = false;
    }
    if (g.kianTalk.open) {
      if (g.room !== g.kian.room || Math.abs(g.px - g.kian.x) > 180) g.kianTalk.open = false;
    }
    if (g.yutoTalk.open) {
      if (g.room !== g.yuto.room || Math.abs(g.px - g.yuto.x) > 180) g.yutoTalk.open = false;
    }
    if (g.adlerTalk.open) {
      if (g.room !== g.adler.room || Math.abs(g.px - g.adler.x) > 180) g.adlerTalk.open = false;
    }
    if (g.mikaTalk.open) {
      if (g.room !== g.mika.room || Math.abs(g.px - g.mika.x) > 180) g.mikaTalk.open = false;
    }
    if (g.strangerTalk.open) {
      if (g.room !== g.stranger.room || Math.abs(g.px - g.stranger.x) > 180) g.strangerTalk.open = false;
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
    var shopBtn = document.getElementById("shopBtn");
    if (shopBtn) {
      // Gunner's shop: only while his talk bubble is open, so she
      // talks to him first, then opens his shop from the chat.
      shopBtn.hidden = !(g.ownerTalk.open && g.ownerTalk.key === "gunner" && !g.shopOpen);
    }
    var fashionBtn = document.getElementById("fashionBtn");
    if (fashionBtn) {
      // Char's fashion shop: only while her talk bubble is open, so
      // she talks to Char first, then opens the shop from the chat.
      fashionBtn.hidden = !(g.ownerTalk.open && g.ownerTalk.key === "char" && !g.fashionOpen);
    }
    var salonBtn = document.getElementById("salonBtn");
    if (salonBtn) {
      // Mikey's salon: only while his talk bubble is open, so she
      // talks to Mikey first, then opens the salon from the chat.
      salonBtn.hidden = !(g.ownerTalk.open && g.ownerTalk.key === "mikey" && !g.salonOpen);
    }
    updateActionList();
    if (g.climb.active) {
      // Climbing out the window: the climb drives them both, and
      // nothing else moves until they are through.
      updateClimb();
      draw();
      return;
    }
    if (g.inspect.active) {
      // Inspecting the secret spot, then jumping down to the tunnels.
      // The inspect drives them both, and nothing else moves until
      // they land.
      updateInspect();
      draw();
      return;
    }
    if (g.homeWalk.active) {
      // Walking home through the garden door together: the walk
      // drives them both, and nothing else moves until they arrive.
      updateHomeWalk();
      draw();
      return;
    }
    if (g.proposal.active) {
      // The proposal cutscene on the Surface: the art and the lines
      // play, and nothing else moves until it is done.
      g.proposal.t += 1;
      draw();
      return;
    }
    if (g.mayorCutscene.active) {
      // The Mayor's garden cutscene in the bar: his lines play, and
      // nothing else moves until it is done.
      g.mayorCutscene.t += 1;
      draw();
      return;
    }
    if (g.vickyCutscene.active) {
      // Vicky's drink cutscene at the bar: her lines play, and
      // nothing else moves until it is done.
      g.vickyCutscene.t += 1;
      draw();
      return;
    }
    if (g.xCutscene.active) {
      // X's appearance in the Court: his lines play, and nothing else
      // moves until it is done.
      g.xCutscene.t += 1;
      draw();
      return;
    }
    if (g.rescue.active) {
      // The rescue: the carry animation, then Dr. Kian in the
      // chamber, then he walks out. Nothing else moves until it ends.
      updateRescue();
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
      // Resting recovers her HP and her energy while the sleep gif
      // plays. Waking up tops her energy off and starts a new day.
      if (g.hp < g.hpMax) g.hp = Math.min(g.hpMax, g.hp + 0.5);
      if (g.energy < g.energyMax) g.energy = Math.min(g.energyMax, g.energy + 0.5);
      // A movement key wakes her up, and then walks as normal.
      if (keys.left || keys.right || keys.up || keys.down) wakeUp();
    }
    // Energy drains slowly while she is awake: 1 point every
    // 6 seconds, so a full bar lasts about 10 minutes. It does not
    // drain while she sleeps, or while a menu or cutscene holds her.
    if (!g.sleeping) g.energy = Math.max(0, g.energy - 1 / 360);
    // Out of health or out of energy, she collapses and Ray carries
    // her home. Either one reaching zero starts the rescue.
    if ((g.hp <= 0 || g.energy <= 0) && !g.rescue.active) startRescue();
    // Out of energy she walks slower and cannot run (Space does
    // nothing). The scooter still goes its own speed.
    var tired = g.energy <= 0 && !g.scooter.riding;
    var speed = g.scooter.riding ? (keys.fast ? 10 : 7) : (tired ? 1.1 : (keys.fast ? 4.4 : 2.2));
    if (keys.left) { g.px -= speed; g.facing = -1; }
    if (keys.right) { g.px += speed; g.facing = 1; }
    if (keys.up) { g.depth -= speed * 0.5; }
    if (keys.down) { g.depth += speed * 0.5; }
    if (g.px < roomMinX()) g.px = roomMinX();
    if (g.px > room().w - 60) g.px = room().w - 60;
    if (g.depth < -depthRange()) g.depth = -depthRange();
    if (g.depth > 0) g.depth = 0;
    // Walking to the edge of a room takes you to the next scene, no
    // E needed. Stairs still need E to climb. Riding the scooter
    // through an edge carries it along (switchRoom moves its room).
    if ((keys.left && doorSide() === "left") || (keys.right && doorSide() === "right")) switchRoom();
    // The end of the road: walking all the way to the right of the
    // Surface, the outside, starts the proposal cutscene. It only
    // ever happens once, and not while riding the scooter.
    if (!g.proposed && !g.proposal.active && !g.scooter.riding && keys.right && surfaceEdgeNear()) startProposal();
    // The garden door is E-gated like a portal, so walking into it
    // does nothing on its own. Press E (or tap Go home) to go home.
    if (keys.left || keys.right || keys.up || keys.down) g.walk += keys.fast ? 0.6 : 0.3;
    // Camera follows Sylvia across the bar.
    var target = g.px * scale() - g.w * 0.38;
    if (target < 0) target = 0;
    if (target > worldW() - g.w) target = worldW() - g.w;
    g.camX += (target - g.camX) * 0.12;
    if (g.fountainMsgT > 0) g.fountainMsgT -= 1;
    if (g.chestOpen) {
      // The chest lid rises over 48 ticks, then the coins spill out:
      // a random 3 to 20, once per chest, and it saves.
      g.chestOpen.t += 1;
      if (g.chestOpen.t >= 48) {
        var n = 3 + Math.floor(Math.random() * 18);
        g.coinCount += n;
        g.chestsOpened[g.chestOpen.id] = true;
        g.chestMsg = "+" + n + " coins!";
        g.chestMsgT = 180;
        g.chestOpen = null;
        saveGame();
      }
    }
    if (g.chestMsgT > 0) g.chestMsgT -= 1;
    if (g.dungeonMsgT > 0) g.dungeonMsgT -= 1;
    if (g.attack.cooldown > 0) g.attack.cooldown -= 1;
    if (g.hurtT > 0) g.hurtT -= 1;
    if (g.kissHealT > 0) g.kissHealT -= 1;
    if (g.attack.active) {
      g.attack.t += 1;
      // The high kick extends at t 8: that is when it connects.
      if (g.attack.t === 8) hitMonsters(g.px, g.facing, g.depth);
      if (g.attack.t >= 30) g.attack.active = false;
    }
    // Ray: when monsters are about he does not wait for her to
    // attack, he runs ahead of her and fights them himself. Otherwise
    // he fights with her when she attacks, follows her when she gets
    // far away (or into another room), and wanders when they are close.
    var r = g.ray;
    if (g.scooter.riding) {
      // On the scooter together: he rides on the back, and the
      // riding frames cycle while they move.
      r.x = g.px; r.dir = g.facing; r.depth = g.depth;
      if (keys.left || keys.right) g.scooter.frame = Math.floor(g.time / 4) % 4;
      else g.scooter.frame = 0;
    } else if (g.sleeping) {
      // He is in bed with her; he does not move, fight, or wander.
    } else if (g.rayTalk.open) {
      // Talking to her: he stands still and faces her.
      r.dir = g.px < r.x ? -1 : 1;
    } else if (!r.fight.active && isDungeonRoom(g.room) && g.monsters.length > 0 && !g.kiss.active && !g.embrace.active && !g.climb.active && !g.proposal.active && !g.rescue.active) {
      // Monsters are about: he runs ahead of her and fights them
      // himself, right away, and keeps going while any are left.
      r.fight.active = true;
      r.fight.t = 0;
      r.pause = 0;
    } else if (r.fight.active) {
      r.fight.t += 1;
      // His punch lands mid-fight: monsters in front of him take a hit.
      if (r.fight.t === 30) hitMonsters(r.x, r.dir, r.depth);
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
      if (r.x < 120) { r.x = 120; r.dir = 1; r.pause = 60 + Math.random() * 120; } else if (r.x > room().w - 120) { r.x = room().w - 120; r.dir = -1; r.pause = 60 + Math.random() * 120; }
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
        if (o.x < 150) { o.x = 150; o.dir = 1; o.pause = 60 + Math.random() * 120; } else if (o.x > room().w - 150) { o.x = room().w - 150; o.dir = -1; o.pause = 60 + Math.random() * 120; }
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
        if (m.x < 150) { m.x = 150; m.dir = 1; m.pause = 60 + Math.random() * 120; } else if (m.x > room().w - 150) { m.x = room().w - 150; m.dir = -1; m.pause = 60 + Math.random() * 120; }
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
        if (n.x < 150) { n.x = 150; n.dir = 1; n.pause = 60 + Math.random() * 120; } else if (n.x > room().w - 150) { n.x = room().w - 150; n.dir = -1; n.pause = 60 + Math.random() * 120; }
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
          if (kd.x < 150) { kd.x = 150; kd.dir = 1; kd.pause = 60 + Math.random() * 120; } else if (kd.x > room().w - 150) { kd.x = room().w - 150; kd.dir = -1; kd.pause = 60 + Math.random() * 120; }
          else if (Math.random() < 0.002) { kd.pause = 90 + Math.random() * 150; }
        }
      }
    }
    // Eve: she only stands and walks on the Shopping District street,
    // never anywhere else. She wanders it slowly, pausing to window
    // shop, and turns at the ends. While talking she stands still and
    // faces Sylvia; her laugh and surprise timers count down here.
    var ev = g.eve;
    if (ev.laughT > 0) ev.laughT -= 1;
    if (ev.surprisedT > 0) ev.surprisedT -= 1;
    if (g.room === "shopping" && !g.eveTalk.open) {
      if (ev.pause > 0) { ev.pause -= 1; }
      else {
        ev.x += ev.dir * 0.8;
        ev.walk += 0.3;
        if (ev.x < 150) { ev.x = 150; ev.dir = 1; ev.pause = 60 + Math.random() * 120; } else if (ev.x > room().w - 150) { ev.x = room().w - 150; ev.dir = -1; ev.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { ev.pause = 90 + Math.random() * 150; }
      }
    }
    if (g.eveTalk.open) ev.dir = g.px < ev.x ? -1 : 1; // face Sylvia
    // Alexis: she wanders the Shopping District street and goes to
    // the clothing store often, so her room rotates between the two.
    // She only moves rooms when her talk is closed
    // and Sylvia is not in her room, so she never vanishes in front
    // of Sylvia. While talking she stands still and faces Sylvia;
    // her laugh and surprise timers count down here.
    var ax = g.alexis;
    if (ax.laughT > 0) ax.laughT -= 1;
    if (ax.surprisedT > 0) ax.surprisedT -= 1;
    if (!g.alexisTalk.open && g.room !== ax.room) {
      ax.roomT -= 1;
      if (ax.roomT <= 0) {
        var aRooms = ["shopping", "clothing"];
        var aNext;
        do { aNext = aRooms[Math.floor(Math.random() * aRooms.length)]; }
        while (aNext === ax.room);
        ax.room = aNext;
        ax.x = 200; ax.dir = 1; ax.pause = 60;
        ax.roomT = 2700 + Math.floor(Math.random() * 4500); // 45-120s
      }
    }
    if (g.room === ax.room && !g.alexisTalk.open) {
      if (ax.pause > 0) { ax.pause -= 1; }
      else {
        ax.x += ax.dir * 0.8;
        ax.walk += 0.3;
        if (ax.x < 150) { ax.x = 150; ax.dir = 1; ax.pause = 60 + Math.random() * 120; } else if (ax.x > room().w - 150) { ax.x = room().w - 150; ax.dir = -1; ax.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { ax.pause = 90 + Math.random() * 150; }
      }
    }
    if (g.alexisTalk.open) ax.dir = g.px < ax.x ? -1 : 1; // face Sylvia
    // Priya: she runs around the Shopping District street and the
    // Flooded Cistern, so her room rotates between the two. She only
    // moves rooms when her talk is closed and Sylvia is not in her
    // room, so she never vanishes in front of Sylvia. She RUNS, not
    // walks: 1.6 world px per tick, twice the owners' pace, and her
    // run frames cycle faster too. Her pauses are short, because she
    // is always running. While talking she stands still and faces
    // Sylvia; her laugh and surprise timers count down here.
    var pr = g.priya;
    if (pr.laughT > 0) pr.laughT -= 1;
    if (pr.surprisedT > 0) pr.surprisedT -= 1;
    if (!g.priyaTalk.open && g.room !== pr.room) {
      pr.roomT -= 1;
      if (pr.roomT <= 0) {
        var pRooms = ["shopping", "cistern"];
        var pNext;
        do { pNext = pRooms[Math.floor(Math.random() * pRooms.length)]; }
        while (pNext === pr.room);
        pr.room = pNext;
        pr.x = 200; pr.dir = 1; pr.pause = 30;
        pr.roomT = 2700 + Math.floor(Math.random() * 4500); // 45-120s
      }
    }
    if (g.room === pr.room && !g.priyaTalk.open) {
      if (pr.pause > 0) { pr.pause -= 1; }
      else {
        pr.x += pr.dir * 1.6;
        pr.walk += 0.5;
        if (pr.x < 150) { pr.x = 150; pr.dir = 1; pr.pause = 30 + Math.random() * 60; } else if (pr.x > room().w - 150) { pr.x = room().w - 150; pr.dir = -1; pr.pause = 30 + Math.random() * 60; }
        else if (Math.random() < 0.001) { pr.pause = 30 + Math.random() * 60; }
      }
    }
    if (g.priyaTalk.open) pr.dir = g.px < pr.x ? -1 : 1; // face Sylvia
    // Diego: he is always in the bar, sometimes stepping out to the
    // Shopping District street, so his room rotates between the two.
    // He only moves rooms when his talk is closed and Sylvia is not
    // in his room, so he never vanishes in front of Sylvia. While
    // talking he stands still and faces Sylvia; his laugh and
    // surprise timers count down here.
    var dg = g.diego;
    if (dg.laughT > 0) dg.laughT -= 1;
    if (dg.surprisedT > 0) dg.surprisedT -= 1;
    if (!g.diegoTalk.open && g.room !== dg.room) {
      dg.roomT -= 1;
      if (dg.roomT <= 0) {
        var dRooms = ["bar", "shopping"];
        var dNext;
        do { dNext = dRooms[Math.floor(Math.random() * dRooms.length)]; }
        while (dNext === dg.room);
        dg.room = dNext;
        dg.x = 200; dg.dir = 1; dg.pause = 60;
        dg.roomT = 2700 + Math.floor(Math.random() * 4500); // 45-120s
      }
    }
    if (g.room === dg.room && !g.diegoTalk.open) {
      if (dg.pause > 0) { dg.pause -= 1; }
      else {
        dg.x += dg.dir * 0.8;
        dg.walk += 0.3;
        if (dg.x < 150) { dg.x = 150; dg.dir = 1; dg.pause = 60 + Math.random() * 120; } else if (dg.x > room().w - 150) { dg.x = room().w - 150; dg.dir = -1; dg.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { dg.pause = 90 + Math.random() * 150; }
      }
    }
    if (g.diegoTalk.open) dg.dir = g.px < dg.x ? -1 : 1; // face Sylvia
    // Dr. Kian: he walks around the Shopping District street and
    // stays there. While talking he stands still and faces Sylvia;
    // his laugh and surprise timers count down here.
    var kn = g.kian;
    if (kn.laughT > 0) kn.laughT -= 1;
    if (kn.surprisedT > 0) kn.surprisedT -= 1;
    if (g.room === kn.room && !g.kianTalk.open) {
      if (kn.pause > 0) { kn.pause -= 1; }
      else {
        kn.x += kn.dir * 0.8;
        kn.walk += 0.3;
        if (kn.x < 150) { kn.x = 150; kn.dir = 1; kn.pause = 60 + Math.random() * 120; } else if (kn.x > room().w - 150) { kn.x = room().w - 150; kn.dir = -1; kn.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { kn.pause = 90 + Math.random() * 150; }
      }
    }
    if (g.kianTalk.open) kn.dir = g.px < kn.x ? -1 : 1; // face Sylvia
    // Yuto: he wanders the Shopping District street and stays
    // there. While talking he stands still and faces Sylvia; his
    // laugh and surprise timers count down here.
    var yt = g.yuto;
    if (yt.laughT > 0) yt.laughT -= 1;
    if (yt.surprisedT > 0) yt.surprisedT -= 1;
    if (g.room === yt.room && !g.yutoTalk.open) {
      if (yt.pause > 0) { yt.pause -= 1; }
      else {
        yt.x += yt.dir * 0.8;
        yt.walk += 0.3;
        if (yt.x < 150) { yt.x = 150; yt.dir = 1; yt.pause = 60 + Math.random() * 120; } else if (yt.x > room().w - 150) { yt.x = room().w - 150; yt.dir = -1; yt.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { yt.pause = 90 + Math.random() * 150; }
      }
    }
    if (g.yutoTalk.open) yt.dir = g.px < yt.x ? -1 : 1; // face Sylvia
    // Mayor Adler: he is constantly in the bar, guarding it, so he
    // never changes rooms. He walks slow with his cane, half the
    // speed of the others. While talking he stands still and faces
    // Sylvia; his laugh and surprise timers count down here.
    var ad = g.adler;
    if (ad.laughT > 0) ad.laughT -= 1;
    if (ad.surprisedT > 0) ad.surprisedT -= 1;
    if (mayorHere() && g.room === ad.room && !g.adlerTalk.open) {
      if (ad.pause > 0) { ad.pause -= 1; }
      else {
        ad.x += ad.dir * 0.4;
        ad.walk += 0.15;
        if (ad.x < 150) { ad.x = 150; ad.dir = 1; ad.pause = 60 + Math.random() * 120; } else if (ad.x > room().w - 150) { ad.x = room().w - 150; ad.dir = -1; ad.pause = 60 + Math.random() * 120; }
        else if (Math.random() < 0.002) { ad.pause = 90 + Math.random() * 150; }
      }
    }
    if (g.adlerTalk.open) ad.dir = g.px < ad.x ? -1 : 1; // face Sylvia
    // Mika: she lives in the Flooded Cistern and never leaves it, so
    // she never changes rooms. She is sitting down about 90% of the
    // time: her pauses are very long (15 to 30 seconds) and she only
    // walks for a couple of seconds between them, sitting the moment
    // she stops. While talking she stands still and faces Sylvia; her
    // laugh and surprise timers count down here.
    var mk = g.mika;
    if (mk.laughT > 0) mk.laughT -= 1;
    if (mk.surprisedT > 0) mk.surprisedT -= 1;
    if (g.room === mk.room && !g.mikaTalk.open) {
      if (mk.pause > 0) {
        mk.pause -= 1;
        // She sits the moment she stops, and stays sitting for the
        // rest of her very long pause.
        mk.sitting = true;
      } else {
        mk.sitting = false; mk.sitT = 0;
        mk.x += mk.dir * 0.5;
        mk.walk += 0.3;
        if (mk.x < 150) { mk.x = 150; mk.dir = 1; mk.pause = 900 + Math.random() * 900; } else if (mk.x > room().w - 150) { mk.x = room().w - 150; mk.dir = -1; mk.pause = 900 + Math.random() * 900; }
        else if (Math.random() < 0.008) { mk.pause = 900 + Math.random() * 900; }
      }
    }
    if (g.mikaTalk.open) mk.dir = g.px < mk.x ? -1 : 1; // face Sylvia
    // X: he never leaves the Court of Justice. He wanders it slowly,
    // hooded, and stands still and faces Sylvia while talking.
    var st = g.stranger;
    if (st.laughT > 0) st.laughT -= 1;
    if (st.surprisedT > 0) st.surprisedT -= 1;
    if (g.room === st.room && !g.strangerTalk.open) {
      if (st.pause > 0) { st.pause -= 1; }
      else {
        st.x += st.dir * 0.4;
        st.walk += 0.15;
        if (st.x < 150) { st.x = 150; st.dir = 1; st.pause = 60 + Math.random() * 150; } else if (st.x > room().w - 150) { st.x = room().w - 150; st.dir = -1; st.pause = 60 + Math.random() * 150; }
        else if (Math.random() < 0.002) { st.pause = 90 + Math.random() * 150; }
      }
    }
    if (g.strangerTalk.open) st.dir = g.px < st.x ? -1 : 1; // face Sylvia
    // The first time the whole dungeon is cleared and X shows
    // himself in the Court, it is a cutscene: they are both shocked
    // and turn to face him, and he tells them the subway is open.
    if (!g.xCutsceneDone && g.room === "dungeon4" && dungeonCleared() && dungeonAllCleared()) startXCutscene();
    if (g.sylviaSurprisedT > 0 && !g.xCutscene.active) g.sylviaSurprisedT -= 1;
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
    updateMonsters();
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
    if (pinball.active) {
      if (e.code === "ArrowLeft" || e.code === "KeyZ" || e.code === "KeyA") { pinball.flipL.held = true; e.preventDefault(); return; }
      if (e.code === "ArrowRight" || e.code === "KeyX" || e.code === "KeyD") { pinball.flipR.held = true; e.preventDefault(); return; }
      if (e.code === "Space") { pbLaunch(pinball); e.preventDefault(); return; }
      if (e.code === "Escape") { closePinball(); return; }
      return;
    }
    if (e.code === "KeyK") { tryKiss(); return; }
    if (e.code === "KeyH") { tryAttack(); return; }
    if (e.code === "KeyJ") { tryJump(); return; }
    if (e.code === "KeyE") { if (g.proposal.active) { advanceProposal(); return; } tryEnter(); return; }
    if (e.code === "KeyI") { startInspect(); return; }
    if (e.code === "KeyT") { if (g.proposal.active) { advanceProposal(); return; } pressT(); return; }
    if (e.code === "KeyM") { if (g.mirror.active) manifest(); return; }
    if (e.code === "Digit1" || e.code === "Digit2" || e.code === "Digit3" || e.code === "Digit4") {
      if (g.rayTalk.open && g.rayTalk.step === 0) {
        pickRayChoice(e.code === "Digit1" ? 0 : e.code === "Digit2" ? 1 : e.code === "Digit3" ? 2 : 3);
        return;
      }
    }
    if (e.code === "Escape") { if (g.mirror.active) { exitMirror(); return; } if (g.photo.active) { closePhoto(); return; } if (g.dungeonControls.open) { closeDungeonControls(); return; } if (g.map.active) { closeMap(); return; } if (g.missionsOpen) { closeMissions(); return; } if (g.sleepConfirmOpen) { closeSleepConfirm(); return; } if (g.secretOpen) { closeSecret(); return; } if (g.propRead.open) { closePropRead(); g.inspect.active = false; return; } if (g.inspect.active && g.inspect.phase === "look") { g.inspect.active = false; return; } if (g.rayTalk.open) { closeRayTalk(); return; } g.talk.open = false; g.ownerTalk.open = false; g.kidTalk.open = false; g.eveTalk.open = false; g.alexisTalk.open = false; g.priyaTalk.open = false; return; }
    if (g.mirror.active) return;
    if (g.photo.active) return;
    if (g.dungeonControls.open) return;
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
  window.addEventListener("keyup", function (e) {
    if (pinball.active) {
      if (e.code === "ArrowLeft" || e.code === "KeyZ" || e.code === "KeyA") { pinball.flipL.held = false; return; }
      if (e.code === "ArrowRight" || e.code === "KeyX" || e.code === "KeyD") { pinball.flipR.held = false; return; }
      return;
    }
    setKey(e.code, false);
  });
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
      if (dt < 250 && moved < 12) {
        if (g.proposal.active) { advanceProposal(); pointerDownAt = 0; return; }
    if (g.rescue.active) { advanceRescue(); pointerDownAt = 0; return; }
    if (g.mayorCutscene.active) { advanceMayorCutscene(); pointerDownAt = 0; return; }
    if (g.vickyCutscene.active) { advanceVickyCutscene(); pointerDownAt = 0; return; }
    if (g.xCutscene.active) { advanceXCutscene(); pointerDownAt = 0; return; }
        tryAttack();
      }
    }
    pointerDownAt = 0;
  }
  canvas.addEventListener("pointerup", pointerEnd);
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
  var manifestBtn = document.getElementById("manifestBtn");
  if (manifestBtn) manifestBtn.addEventListener("click", function (e) { e.stopPropagation(); manifest(); });
  var mirrorCloseBtn = document.getElementById("mirrorCloseBtn");
  if (mirrorCloseBtn) mirrorCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); exitMirror(); });
  var photoPopup = document.getElementById("photoPopup");
  if (photoPopup) photoPopup.addEventListener("click", function (e) { e.stopPropagation(); closePhoto(); });
  var dcPopup = document.getElementById("dungeonControlsPopup");
  if (dcPopup) dcPopup.addEventListener("click", function (e) { if (e.target === dcPopup) { e.stopPropagation(); closeDungeonControls(); } });
  var dcBtn = document.getElementById("dungeonControlsCloseBtn");
  if (dcBtn) dcBtn.addEventListener("click", function (e) { e.stopPropagation(); closeDungeonControls(); });
  var mapBtn = document.getElementById("mapBtn");
  if (mapBtn) mapBtn.addEventListener("click", function (e) { e.stopPropagation(); openMap(); });
  var mapPopup = document.getElementById("mapPopup");
  if (mapPopup) mapPopup.addEventListener("click", function (e) { e.stopPropagation(); closeMap(); });
  var missionsBtn = document.getElementById("missionsBtn");
  if (missionsBtn) missionsBtn.addEventListener("click", function (e) { e.stopPropagation(); openMissions(); });
  var missionsPanel = document.getElementById("missionsPanel");
  if (missionsPanel) missionsPanel.addEventListener("click", function (e) { e.stopPropagation(); closeMissions(); });
  var missionsCard = document.getElementById("missionsCard");
  if (missionsCard) missionsCard.addEventListener("click", function (e) { e.stopPropagation(); });
  var missionsCloseBtn = document.getElementById("missionsCloseBtn");
  if (missionsCloseBtn) missionsCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); closeMissions(); });
  var mapWrap = document.getElementById("mapWrap");
  if (mapWrap) mapWrap.addEventListener("click", function (e) { e.stopPropagation(); mapJump(e); });
  var mapMissions = document.getElementById("mapMissions");
  if (mapMissions) mapMissions.addEventListener("click", function (e) { e.stopPropagation(); });
  var shopBtn = document.getElementById("shopBtn");
  if (shopBtn) shopBtn.addEventListener("click", function (e) { e.stopPropagation(); openShop(); });
  var shopBuyBtn = document.getElementById("shopBuyBtn");
  if (shopBuyBtn) shopBuyBtn.addEventListener("click", function (e) { e.stopPropagation(); buyScooter(); });
  var shopCloseBtn = document.getElementById("shopCloseBtn");
  if (shopCloseBtn) shopCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); closeShop(); });
  var fashionBtn = document.getElementById("fashionBtn");
  if (fashionBtn) fashionBtn.addEventListener("click", function (e) { e.stopPropagation(); openFashion(); });
  var fashionCloseBtn = document.getElementById("fashionCloseBtn");
  if (fashionCloseBtn) fashionCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); closeFashion(); });
  var salonBtn = document.getElementById("salonBtn");
  if (salonBtn) salonBtn.addEventListener("click", function (e) { e.stopPropagation(); openSalon(); });
  var salonCloseBtn = document.getElementById("salonCloseBtn");
  if (salonCloseBtn) salonCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); closeSalon(); });
  var closetCloseBtn = document.getElementById("closetCloseBtn");
  if (closetCloseBtn) closetCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); closeCloset(); });
  ["fashionPanel", "salonPanel", "closetPanel"].forEach(function (pid) {
    var p = document.getElementById(pid);
    if (p) p.addEventListener("click", onShopPanelClick);
  });
  var pinballCanvas = document.getElementById("pinballCanvas");
  if (pinballCanvas) {
    pinballCanvas.addEventListener("pointerdown", function (e) {
      e.stopPropagation();
      if (!pinball.active) return;
      var r = pinballCanvas.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      if (x < 0.5) pinball.flipL.held = true;
      else pinball.flipR.held = true;
    });
    pinballCanvas.addEventListener("pointerup", function (e) { e.stopPropagation(); pinball.flipL.held = false; pinball.flipR.held = false; });
    pinballCanvas.addEventListener("pointerleave", function (e) { pinball.flipL.held = false; pinball.flipR.held = false; });
    pinballCanvas.addEventListener("pointercancel", function (e) { pinball.flipL.held = false; pinball.flipR.held = false; });
  }
  var pinballLaunchBtn = document.getElementById("pinballLaunchBtn");
  if (pinballLaunchBtn) pinballLaunchBtn.addEventListener("click", function (e) { e.stopPropagation(); pbLaunch(pinball); });
  var pinballRetryBtn = document.getElementById("pinballRetryBtn");
  if (pinballRetryBtn) pinballRetryBtn.addEventListener("click", function (e) { e.stopPropagation(); pinballReset(); });
  var pinballCloseBtn = document.getElementById("pinballCloseBtn");
  if (pinballCloseBtn) pinballCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); closePinball(); });
  var pinballPopup = document.getElementById("pinballPopup");
  if (pinballPopup) pinballPopup.addEventListener("click", function (e) { e.stopPropagation(); closePinball(); });
  var pinballCard = document.getElementById("pinballCard");
  if (pinballCard) pinballCard.addEventListener("click", function (e) { e.stopPropagation(); });
  var sleepConfirmBtn = document.getElementById("sleepConfirmBtn");
  if (sleepConfirmBtn) sleepConfirmBtn.addEventListener("click", function (e) { e.stopPropagation(); confirmSleep(); });
  var sleepCancelBtn = document.getElementById("sleepCancelBtn");
  if (sleepCancelBtn) sleepCancelBtn.addEventListener("click", function (e) { e.stopPropagation(); closeSleepConfirm(); });
  var secretQ1 = document.getElementById("secretQ1");
  if (secretQ1) secretQ1.addEventListener("click", function (e) { e.stopPropagation(); askSecret("why"); });
  var secretQ2 = document.getElementById("secretQ2");
  if (secretQ2) secretQ2.addEventListener("click", function (e) { e.stopPropagation(); askSecret("rumours"); });
  var secretQ3 = document.getElementById("secretQ3");
  if (secretQ3) secretQ3.addEventListener("click", function (e) { e.stopPropagation(); askSecret("how"); });
  var secretCloseBtn = document.getElementById("secretCloseBtn");
  if (secretCloseBtn) secretCloseBtn.addEventListener("click", function (e) { e.stopPropagation(); closeSecret(); });
  // The title screen: Continue when a save exists, New Game always.
  // The world waits behind it until she picks one.
  var titleScreen = document.getElementById("titleScreen");
  var continueBtn = document.getElementById("continueBtn");
  var newGameBtn = document.getElementById("newGameBtn");
  var saveInfo = document.getElementById("saveInfo");
  function startGame() {
    g.started = true;
    if (titleScreen) titleScreen.hidden = true;
    saveGame();
  }
  if (titleScreen) {
    var existing = loadSave();
    if (continueBtn) {
      if (existing) {
        continueBtn.hidden = false;
        if (saveInfo) saveInfo.textContent = "Day " + (existing.day || 1) + " · " + (existing.coinCount || 0) + " coins" + (existing.proposed ? " · engaged" : "");
      } else {
        continueBtn.hidden = true;
        if (saveInfo) saveInfo.textContent = "No saved game yet.";
      }
      continueBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var sv = loadSave();
        if (sv) applySave(sv);
        startGame();
      });
    }
    if (newGameBtn) newGameBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      clearSave();
      g.visited = { chamber: true, shopping: true };
      g.missionsDone = {};
      g.vickyCutsceneDone = false;
      g.mayorCutsceneDone = false;
      g.gardenUnlocked = false;
      g.subwayUnlocked = false;
      g.dungeonCleared = {};
      g.xCutsceneDone = false;
      g.arcadeMinigameDone = false;
      g.subwayPuzzlesDone = false;
      g.crystals = [0, 1, 2, 3, 4];
      g.crystalCount = 0;
      g.quarryMissionDone = false;
      g.look = { sylviaOutfit: "default", sylviaHair: "wavy", rayOutfit: "default", rayHair: "afro", owned: [] };
      updateMapImage();
      rollChests();
      startGame();
    });
    var exportSaveBtn = document.getElementById("exportSaveBtn");
    if (exportSaveBtn) exportSaveBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      exportSave();
    });
    var importSaveBtn = document.getElementById("importSaveBtn");
    var saveFileInput = document.getElementById("saveFileInput");
    if (importSaveBtn && saveFileInput) {
      importSaveBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        saveFileInput.click();
      });
      saveFileInput.addEventListener("change", function () {
        if (saveFileInput.files && saveFileInput.files[0]) importSaveFile(saveFileInput.files[0]);
        saveFileInput.value = "";
      });
    }
  }
  // The little save button in the corner, for saving mid-game.
  var saveFileBtn = document.getElementById("saveFileBtn");
  if (saveFileBtn) saveFileBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    exportSave();
  });
  canvas.addEventListener("pointercancel", pointerEnd);
  canvas.addEventListener("pointerleave", pointerEnd);
})();
