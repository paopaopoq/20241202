let angle = 0;
let opacity = 0;
let fadeIn = true;
let colors = [
  [255, 0, 0],    // 紅色
  [255, 165, 0],  // 橙色
  [255, 255, 0],  // 黃色
  [0, 255, 0],    // 綠色
  [0, 0, 255],    // 藍色
  [238, 130, 238] // 紫色
];

// 煙火粒子系統
let fireworks = [];

// 新增滑鼠互動相關變數
let particles = [];
let mouseWaveEffect = [];
const WAVE_POINTS = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(windowWidth * 0.04);
  background(0);
  
  // 初始化波浪效果點
  for (let i = 0; i < WAVE_POINTS; i++) {
    mouseWaveEffect.push({
      x: 0,
      y: 0,
      size: map(i, 0, WAVE_POINTS, 50, 5),
      alpha: map(i, 0, WAVE_POINTS, 255, 0)
    });
  }
}

function draw() {
  background(0, 25);
  
  // 更新波浪效果點的位置
  let prevX = mouseWaveEffect[0].x;
  let prevY = mouseWaveEffect[0].y;
  mouseWaveEffect[0].x = mouseX;
  mouseWaveEffect[0].y = mouseY;
  
  for (let i = 1; i < mouseWaveEffect.length; i++) {
    let temp = {
      x: mouseWaveEffect[i].x,
      y: mouseWaveEffect[i].y
    };
    mouseWaveEffect[i].x = prevX;
    mouseWaveEffect[i].y = prevY;
    prevX = temp.x;
    prevY = temp.y;
  }
  
  // 顯示波浪效果
  noFill();
  for (let i = 0; i < mouseWaveEffect.length; i++) {
    let p = mouseWaveEffect[i];
    stroke(255, p.alpha * 0.5);
    circle(p.x, p.y, p.size);
  }
  
  // 控制透明度的淡入淡出
  if (fadeIn) {
    opacity += 2;
    if (opacity >= 255) fadeIn = false;
  } else {
    opacity -= 2;
    if (opacity <= 0) fadeIn = true;
  }
  
  // 簡單的上下浮動效果
  angle += 0.05;
  let yOffset = sin(angle) * 15;
  
  // 隨機產生新煙火（恢復原本的自動煙火）
  if (random(1) < 0.03) {
    fireworks.push(new Firework());
  }
  
  // 更新和顯示所有煙火
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
  
  // 顯示固定位置的文字
  let text1 = "淡江大學";
  for (let i = 0; i < text1.length; i++) {
    let colorIndex = (i + floor(frameCount/30)) % colors.length;
    let c = colors[colorIndex];
    let xPos = width/2 - (text1.length * 30) + i * 60;
    let yPos = height/2 - 50 + yOffset;
    fill(c[0], c[1], c[2], opacity);
    text(text1[i], xPos, yPos);
  }
  
  let text2 = "教育科技學系";
  for (let i = 0; i < text2.length; i++) {
    let colorIndex = (i + 2 + floor(frameCount/30)) % colors.length;
    let c = colors[colorIndex];
    let xPos = width/2 - (text2.length * 30) + i * 60;
    let yPos = height/2 + 50 + yOffset;
    fill(c[0], c[1], c[2], opacity);
    text(text2[i], xPos, yPos);
  }
  
  // 新增學號姓名
  let text3 = "413730200林家妤";
  textSize(windowWidth * 0.025); // 較小的文字大小
  for (let i = 0; i < text3.length; i++) {
    let colorIndex = (i + 4 + floor(frameCount/30)) % colors.length;
    let c = colors[colorIndex];
    let xPos = width/2 - (text3.length * 20) + i * 40;
    let yPos = height/2 + 120 + yOffset; // 在教育科技學系下方
    fill(c[0], c[1], c[2], opacity);
    text(text3[i], xPos, yPos);
  }
  textSize(windowWidth * 0.04); // 恢復原本的文字大小
}

// 新增滑鼠點擊事件
function mousePressed() {
  // 在滑鼠點擊位置產生煙火
  fireworks.push(new Firework(mouseX, mouseY));
}

// 煙火粒子類別
class Particle {
  constructor(x, y, color, isFirework) {
    this.pos = createVector(x, y);
    this.isFirework = isFirework;
    this.lifespan = 255;
    this.color = color;
    
    if (this.isFirework) {
      this.vel = createVector(0, random(-12, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }
    this.acc = createVector(0, 0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.isFirework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(RGB);
    if (!this.isFirework) {
      strokeWeight(2);
      stroke(this.color[0], this.color[1], this.color[2], this.lifespan);
    } else {
      strokeWeight(4);
      stroke(this.color[0], this.color[1], this.color[2]);
    }
    point(this.pos.x, this.pos.y);
  }
}

// 煙火類別
class Firework {
  constructor(targetX, targetY) {
    this.color = random(colors);
    if (targetX && targetY) {
      // 滑鼠點
      this.targetX = targetX;
      this.targetY = targetY;
    } else {
      // 隨機位置
      this.targetX = random(width);
      this.targetY = random(height/3);
    }
    this.firework = new Particle(random(width), height, this.color, true);
    this.exploded = false;
    this.particles = [];
    
    // 計算發射角度
    let angle = atan2(this.targetY - height, this.targetX - this.firework.pos.x);
    let speed = 12;
    this.firework.vel = createVector(cos(angle) * speed, sin(angle) * speed);
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(createVector(0, 0.2));
      this.firework.update();

      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(createVector(0, 0.2));
      this.particles[i].update();

      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    for (let i = 0; i < 100; i++) {
      const p = new Particle(this.firework.pos.x, this.firework.pos.y, this.color, false);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }
  }
}

// 視窗調整大小時重新設置畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  textSize(windowWidth * 0.04);
}