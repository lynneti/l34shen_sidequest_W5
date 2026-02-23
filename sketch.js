/*
Week 5 — Reflective / Meditative Camera Scroll (Bounded)

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows
Hold SHIFT: slow walk (pacing)
Goal:
- World larger than screen
- Camera follows player with smooth motion (meditative)
- Hidden symbols for the camera to “discover”
*/

let p = { x: 300, y: 300, s: 3 }; // player in world coords
let cam = { x: 0, y: 0 }; // camera top-left in world coords
let camTarget = { x: 0, y: 0 }; // where camera wants to be

const W = 2400,
  H = 1600; // world size
const viewW = 800,
  viewH = 480; // viewport size

// hidden symbols (bonus)
let symbols = [];
const REVEAL_RADIUS = 120;

function setup() {
  createCanvas(viewW, viewH);
  textFont("sans-serif");
  textSize(14);

  // place small “discoverables” across the world
  // (hand-placed-ish but deterministic)
  for (let i = 0; i < 14; i++) {
    let sx = 200 + ((i * 160) % (W - 400));
    let sy = 180 + ((i * 230) % (H - 360));
    symbols.push({
      x: sx,
      y: sy,
      found: false,
      kind: i % 3, // 0,1,2 => different symbol types
    });
  }
}

function draw() {
  // --- pacing controls ---
  const slow = keyIsDown(SHIFT);
  const speed = slow ? 1.6 : 3.0;

  // --- update player ---
  let dx =
    (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) -
    (keyIsDown(LEFT_ARROW) || keyIsDown(65));

  let dy =
    (keyIsDown(DOWN_ARROW) || keyIsDown(83)) -
    (keyIsDown(UP_ARROW) || keyIsDown(87));

  const len = max(1, abs(dx) + abs(dy)); // cheap diagonal normalize

  // Clamp player so they cannot leave the world
  p.x = constrain(p.x + (dx / len) * speed, 0, W);
  p.y = constrain(p.y + (dy / len) * speed, 0, H);

  // --- camera target centres on player, then clamps to world bounds ---
  camTarget.x = constrain(p.x - width / 2, 0, W - width);
  camTarget.y = constrain(p.y - height / 2, 0, H - height);

  // --- smooth camera easing (meditative motion) ---
  // smaller = floaty + calm, bigger = snappier
  const ease = 0.06;
  cam.x = lerp(cam.x, camTarget.x, ease);
  cam.y = lerp(cam.y, camTarget.y, ease);

  // --- soft “breathing” drift (tiny!) to evoke calm ---
  const t = millis() * 0.0006;
  const driftX = sin(t) * 2.0;
  const driftY = cos(t * 0.9) * 2.0;

  background(220);

  // --- parallax backdrop (gentle) ---
  push();
  translate(-cam.x * 0.45 + driftX * 0.3, -cam.y * 0.45 + driftY * 0.3);
  noStroke();
  fill(232);
  rect(0, 0, W, H);

  // distant dots like “stars / floating memories”
  for (let i = 0; i < 90; i++) {
    let x = (i * 110) % W;
    let y = (i * 83) % H;
    fill(210, 210, 210, 160);
    circle(x, y, 34);
  }
  pop();

  // --- main world layer ---
  push();
  translate(-cam.x + driftX, -cam.y + driftY);

  // subtle grid
  stroke(240);
  for (let x = 0; x <= W; x += 160) line(x, 0, x, H);
  for (let y = 0; y <= H; y += 160) line(0, y, W, y);

  // soft landmarks (gives the world “meaning”)
  // big quiet circles as meditation “stations”
  noStroke();
  for (let i = 0; i < 8; i++) {
    let lx = 250 + i * 270;
    let ly = 300 + (i % 3) * 320;
    fill(200, 210, 220, 120);
    circle(lx, ly, 200);
  }

  // obstacles (same as yours)
  fill(170, 190, 210);
  for (let i = 0; i < 30; i++) {
    const x = (i * 280) % W,
      y = (i * 180) % H;
    rect(x + 40, y + 40, 80, 80, 10);
  }

  // hidden symbols (reveal when close)
  for (let s of symbols) {
    const d = dist(p.x, p.y, s.x, s.y);

    if (d < REVEAL_RADIUS) {
      // reveal strength
      const a = map(d, REVEAL_RADIUS, 0, 0, 255, true);

      // “found” if you get really close
      if (d < 28) s.found = true;

      drawSymbol(s.x, s.y, s.kind, a, s.found);
    }
  }

  // player
  fill(50, 110, 255);
  rect(p.x - 12, p.y - 12, 24, 24, 5);

  pop();

  // --- vignette / mood overlay (screen space) ---
  drawVignette();

  // HUD
  fill(20);
  noStroke();
  const foundCount = symbols.filter((s) => s.found).length;
  text(
    `Pos: ${p.x | 0}, ${p.y | 0}  Found: ${foundCount}/${symbols.length}  (SHIFT = slow)`,
    12,
    20,
  );
}

// -------- helper drawings --------

function drawSymbol(x, y, kind, alpha, found) {
  push();
  translate(x, y);
  noFill();
  strokeWeight(2);

  if (found) {
    stroke(80, 140, 255, 220);
  } else {
    stroke(50, 50, 50, alpha);
  }

  // small variations so it feels like “different discoveries”
  if (kind === 0) {
    // spiral-ish circle
    circle(0, 0, 26);
    arc(0, 0, 18, 18, PI * 0.2, PI * 1.5);
  } else if (kind === 1) {
    // diamond
    beginShape();
    vertex(0, -14);
    vertex(14, 0);
    vertex(0, 14);
    vertex(-14, 0);
    endShape(CLOSE);
    circle(0, 0, 6);
  } else {
    // “moon”
    arc(0, 0, 26, 26, -PI / 2, PI / 2);
    arc(6, 0, 18, 18, -PI / 2, PI / 2);
  }

  pop();
}

function drawVignette() {
  noStroke();
  for (let i = 0; i < 24; i++) {
    const a = map(i, 0, 23, 0, 12); // was 70 (too strong)
    fill(0, a);
    rect(i, i, width - i * 2, height - i * 2);
  }
}
