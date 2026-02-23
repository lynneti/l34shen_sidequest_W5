/*
Week 5 — Example 2: Top-Down Camera Follow (Bounded)

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows

Goal:
- Camera follows player
- Camera is clamped so it never shows outside the world
*/

let p = { x: 300, y: 300, s: 3 }; // player in world coords
let cam = { x: 0, y: 0 }; // camera top-left in world coords

const W = 2400,
  H = 1600; // world size

const viewW = 800,
  viewH = 480; // canvas (viewport size)

function setup() {
  createCanvas(viewW, viewH);
  textFont("sans-serif");
  textSize(14);
}

function draw() {
  // --- update player ---
  let dx =
    (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) -
    (keyIsDown(LEFT_ARROW) || keyIsDown(65));

  let dy =
    (keyIsDown(DOWN_ARROW) || keyIsDown(83)) -
    (keyIsDown(UP_ARROW) || keyIsDown(87));

  const len = max(1, abs(dx) + abs(dy)); // cheap diagonal normalise

  // Clamp player so they cannot leave the world
  p.x = constrain(p.x + (dx / len) * p.s, 0, W);
  p.y = constrain(p.y + (dy / len) * p.s, 0, H);

  // --- camera centres on player, then clamps to world bounds ---
  cam.x = constrain(p.x - width / 2, 0, W - width);
  cam.y = constrain(p.y - height / 2, 0, H - height);

  background(220);

  // --- parallax backdrop (reduced motion? gate with a flag) ---
  push();
  translate(-cam.x * 0.5, -cam.y * 0.5);
  noStroke();
  fill(230);
  rect(0, 0, W, H); // far layer
  for (let i = 0; i < 80; i++) {
    fill(210);
    circle(i * 120, (i * 75) % H, 40);
  } // distant dots
  pop();

  // --- main world layer ---
  push();
  translate(-cam.x, -cam.y);

  // grid “tiles”
  stroke(240);
  fill(245);
  for (let x = 0; x <= W; x += 160) line(x, 0, x, H);
  for (let y = 0; y <= H; y += 160) line(0, y, W, y);

  // obstacles
  noStroke();
  fill(170, 190, 210);
  for (let i = 0; i < 30; i++) {
    const x = (i * 280) % W,
      y = (i * 180) % H;
    rect(x + 40, y + 40, 80, 80, 10);
  }

  // player
  fill(50, 110, 255);
  noStroke();
  rect(p.x - 12, p.y - 12, 24, 24, 5);

  pop();

  // HUD (screen space)
  fill(20);
  noStroke();
  text(`Pos: ${p.x | 0}, ${p.y | 0} Cam: ${cam.x | 0}, ${cam.y | 0}`, 12, 20);
}
