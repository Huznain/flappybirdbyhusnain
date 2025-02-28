let bird;
let pipes = [];
let particles = []; // Array for particle effects
let score = 0;

function setup() {
  createCanvas(400, 600);
  bird = new Bird();
  pipes.push(new Pipe());
}

function draw() {
  // Draw gradient background
  drawGradientBackground();
  // Draw clouds
  drawClouds();
  
  // Update and display bird
  bird.update();
  bird.show();
  
  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isFinished()) {
      particles.splice(i, 1); // Remove particle if it's done
    }
  }
  
  // Add new pipes periodically
  if (frameCount % 100 === 0) {
    pipes.push(new Pipe());
  }
  
  // Manage pipes
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].update();
    pipes[i].show();
    if (pipes[i].hits(bird)) {
      console.log("Game Over! Score:", score);
      noLoop();
    }
    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
      score++;
    }
  }
  
  // Display score
  fill(255);
  textSize(20);
  text("Score: " + score, 10, 30);
}

function keyPressed() {
  if (keyCode === 32) { // Spacebar
    bird.up();
    // Add particles when bird jumps
    for (let i = 0; i < 10; i++) {
      particles.push(new Particle(bird.x, bird.y));
    }
  }
}

// Draw a gradient background for the sky
function drawGradientBackground() {
  let topColor = color(135, 206, 235); // Light blue
  let bottomColor = color(0, 150, 255); // Slightly darker blue
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(topColor, bottomColor, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

// Draw simple clouds
function drawClouds() {
  fill(255, 255, 255, 150); // Semi-transparent white
  noStroke();
  // Cloud 1
  ellipse(100, 100, 80, 50);
  ellipse(130, 100, 60, 40);
  ellipse(70, 100, 60, 40);
  // Cloud 2
  ellipse(300, 150, 100, 60);
  ellipse(340, 150, 80, 50);
  ellipse(260, 150, 70, 40);
}

class Bird {
  constructor() {
    this.y = height / 2;
    this.x = 64;
    this.velocity = 0;
    this.gravity = 0.5;
    this.jump = -10; // Adjusted jump height
  }
  
  show() {
    fill(255, 255, 0);
    ellipse(this.x, this.y, 32, 32);
    fill(255, 200, 0);
    ellipse(this.x - 10, this.y + 5, 15, 10);
    ellipse(this.x + 10, this.y + 5, 15, 10);
    fill(255, 165, 0);
    triangle(this.x + 16, this.y, this.x + 20, this.y - 4, this.x + 20, this.y + 4);
    fill(255);
    ellipse(this.x + 8, this.y - 8, 8, 8);
    fill(0);
    ellipse(this.x + 8, this.y - 8, 4, 4);
  }
  
  up() {
    this.velocity = this.jump;
  }
  
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    } else if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
}

class Pipe {
  constructor() {
    this.spacing = 150;
    this.top = random(height / 6, (3 / 4) * height);
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 50;
    this.speed = 2;
  }
  
  show() {
    fill(0, 200, 0);
    rect(this.x, 0, this.w, this.top);
    rect(this.x, height - this.bottom, this.w, this.bottom);
    fill(0, 255, 0);
    rect(this.x + 5, 0, this.w - 10, this.top);
    rect(this.x + 5, height - this.bottom, this.w - 10, this.bottom);
  }
  
  update() {
    this.x -= this.speed;
  }
  
  offscreen() {
    return this.x < -this.w;
  }
  
  hits(bird) {
    if (bird.y < this.top || bird.y > height - this.bottom) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    return false;
  }
}

// Particle class for jump effects
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1); // Random x velocity
    this.vy = random(-5, -1); // Random upward velocity
    this.alpha = 255; // Start fully opaque
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; // Fade out over time
  }
  
  show() {
    noStroke();
    fill(255, 255, 255, this.alpha); // White particles
    ellipse(this.x, this.y, 10);
  }
  
  isFinished() {
    return this.alpha <= 0; // Remove when fully faded
  }
}