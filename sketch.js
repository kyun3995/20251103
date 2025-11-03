let questions = [];
let currentSet = [];
let currentIndex = 0;
let selected = -1;
let score = 0;
let state = 'menu'; // menu, quiz, results
let startBtn, exportBtn, nextBtn, restartBtn;
let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight); // 全螢幕
  textFont('Arial');
  initQuestions();
  layoutUI();
}

function draw() {
  background(30);
  fill(255);
  noStroke();
  if (state === 'menu') {
    titleScreen();
  } else if (state === 'quiz') {
    quizScreen();
  } else if (state === 'results') {
    resultsScreen();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layoutUI();
}

function layoutUI() {
  // 依目前畫面大小重新配置按鈕位置與大小
  startBtn = new Button(width/2 - 160, height/2 - 40, 320, 60, '開始測驗');
  exportBtn = new Button(width/2 - 160, height/2 + 40, 320, 60, '匯出題庫為 CSV');
  nextBtn = new Button(width - 180, height - 90, 140, 60, '下一題');
  restartBtn = new Button(width/2 - 100, height - 110, 200, 60, '重新測驗');
}

function titleScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text('測驗系統 (p5.js)', width/2, height/4);
  textSize(16);
  text('每次測驗從題庫中亂數抽取 4 題。答題完會顯示成績與回饋，結果畫面有互動動畫。', width/2, height/4 + 40);
  startBtn.display();
  exportBtn.display();
}

function initQuestions() {
  // 內建題庫 (可自由擴充)
  questions = [
    {q:'下列哪一個是 HTML 的標記？', choices:['<js>','<html>','{html}','(html)'], answer:1, fb:'HTML 文件使用 <> 來包裹標籤，像 <html>.'},
    {q:'JavaScript 的變數宣告關鍵字是哪一個？', choices:['var','def','letit','dim'], answer:0, fb:'var 或 let、const 都可用於宣告變數，var 為早期寫法。'},
    {q:'CSS 用來設定背景顏色的屬性是？', choices:['color','bgcolor','background-color','font-color'], answer:2, fb:'background-color 用來設定元素的背景顏色。'},
    {q:'HTTP 常見的成功狀態碼為？', choices:['200','404','500','302'], answer:0, fb:'200 代表成功 (OK)。'},
    {q:'git 用來做什麼？', choices:['版本控制','資料庫','編輯圖片','網路連線'], answer:0, fb:'git 是分散式版本控制系統。'},
    {q:'p5.js 是基於哪個語言？', choices:['Python','JavaScript','Ruby','C#'], answer:1, fb:'p5.js 是以 JavaScript 為基礎的視覺程式庫。'},
    {q:'哪一個不是資料結構？', choices:['陣列','樹','堆疊','HTTP'], answer:3, fb:'HTTP 是通訊協定，不是資料結構。'},
    {q:'在程式中使用迴圈主要是為了？', choices:['重複執行','減少變數','增加延遲','加速網路'], answer:0, fb:'迴圈可用來重複執行區塊程式碼。'}
  ];
}

function startQuiz() {
  currentSet = shuffleArray(questions).slice(0,4);
  currentIndex = 0;
  selected = -1;
  score = 0;
  state = 'quiz';
}

function quizScreen() {
  let q = currentSet[currentIndex];
  fill(220);
  textAlign(LEFT, TOP);
  textSize(20);
  text('第 ' + (currentIndex+1) + ' 題 / 4', 40, 20);
  textSize(32);
  // 自適應題目寬度
  let margin = min(80, width * 0.05);
  text(q.q, margin, 60, width - margin*2);
  // 顯示選項
  for (let i=0;i<q.choices.length;i++){
    let x = margin+20;
    let y = 140 + i*80;
    let w = width - (margin+40);
    let h = 60;
    stroke(200);
    if (i === selected) {
      fill(100,150,255);
    } else {
      fill(40);
    }
    rect(x, y, w, h, 8);
    fill(255);
    noStroke();
    textSize(20);
    textAlign(LEFT, CENTER);
    text((i+1)+'. '+ q.choices[i], x+18, y+h/2);
  }
  // 下一題 按鈕 (或提交)
  nextBtn.display();
  textSize(16);
  fill(180);
  text('點選選項後按「下一題」送出答案。', margin, height-40);
}

function resultsScreen() {
  // 背景互動粒子
  for (let p of particles) {
    p.update();
    p.draw();
  }
  // 文字資訊
  fill(255);
  textAlign(CENTER, TOP);
  textSize(48);
  text('測驗結果', width/2, 30);
  textSize(26);
  let pct = nf((score / currentSet.length)*100, 0, 0);
  text('得分: ' + score + ' / ' + currentSet.length + '    (' + pct + '%)', width/2, 100);

  // 顯示每題回饋
  textAlign(LEFT, TOP);
  textSize(18);
  let y = 180;
  for (let i=0;i<currentSet.length;i++){
    let it = currentSet[i];
    let your = it._userAnswer;
    let correct = it.answer;
    let status = (your === correct) ? '✓ 正確' : '✗ 錯誤';
    fill(your === correct ? color(100,220,100) : color(255,120,120));
    let margin = min(80, width * 0.05);
    text((i+1)+'. '+it.q, margin, y, width - margin*2);
    fill(200);
    text('你的答案: ' + (your>=0 ? it.choices[your] : '未作答') + ' ('+status+')', margin+20, y+28);
    text('回饋: ' + it.fb, margin+20, y+56);
    y += 110;
  }
  restartBtn.display();
}

function mousePressed() {
  if (state === 'menu') {
    if (startBtn.contains(mouseX, mouseY)) {
      startQuiz();
    } else if (exportBtn.contains(mouseX, mouseY)) {
      exportCSV();
    }
  } else if (state === 'quiz') {
    // 選項點選
    let margin = min(80, width * 0.05);
    for (let i=0;i<currentSet[currentIndex].choices.length;i++){
      let x = margin+20;
      let y = 140 + i*80;
      let w = width - (margin+40);
      let h = 60;
      if (mouseX > x && mouseX < x+w && mouseY > y && mouseY < y+h) {
        selected = i;
      }
    }
    if (nextBtn.contains(mouseX, mouseY)) {
      submitAnswer();
    }
  } else if (state === 'results') {
    if (restartBtn.contains(mouseX, mouseY)) {
      state = 'menu';
      particles = [];
    }
  }
}

function submitAnswer() {
  let it = currentSet[currentIndex];
  it._userAnswer = selected;
  if (selected === it.answer) score++;
  selected = -1;
  currentIndex++;
  if (currentIndex >= currentSet.length) {
    // 結束，顯示結果
    spawnParticlesByScore();
    state = 'results';
  }
}

function exportCSV() {
  // 產生 CSV 字串：題目, 選項1..4, 答案索引, 回饋
  let lines = [];
  lines.push('question,choice1,choice2,choice3,choice4,answerIndex,feedback');
  for (let it of questions) {
    // escape quotes and commas by wrapping in double quotes and escaping inner quotes
    let row = [
      csvEscape(it.q),
      csvEscape(it.choices[0] || ''),
      csvEscape(it.choices[1] || ''),
      csvEscape(it.choices[2] || ''),
      csvEscape(it.choices[3] || ''),
      it.answer,
      csvEscape(it.fb || '')
    ];
    lines.push(row.join(','));
  }
  // 下載檔案（在瀏覽器環境）
  saveStrings(lines, 'questions.csv');
}

function csvEscape(s) {
  // 將 " 轉成 ""，並用 " 包起來
  return '"' + s.replace(/"/g, '""') + '"';
}

function shuffleArray(a) {
  let arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// UI 元件 - 簡單按鈕
class Button {
  constructor(x,y,w,h,label){
    this.x=x;this.y=y;this.w=w;this.h=h;this.label=label;
  }
  display(){
    stroke(200);
    fill(50);
    rect(this.x,this.y,this.w,this.h,8);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(min(22, this.w * 0.06));
    text(this.label,this.x+this.w/2,this.y+this.h/2);
  }
  contains(px,py){
    return px>this.x && px<this.x+this.w && py>this.y && py<this.y+this.h;
  }
}

// 粒子系統 (簡單彩帶)
class Particle {
  constructor(x,y, hue){
    this.pos = createVector(x,y);
    this.vel = p5.Vector.random2D().mult(random(1,6));
    this.acc = createVector(0,0.05);
    this.l = random(8,18);
    this.hue = hue;
    this.life = 255;
  }
  update(){
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.life -= 3;
    if (this.life < 0) this.life = 0;
    // 與滑鼠互動
    let m = createVector(mouseX, mouseY);
    let d = p5.Vector.sub(this.pos, m);
    if (d.mag() < 120) {
      d.setMag(2);
      this.pos.add(d);
    }
  }
  draw(){
    noStroke();
    colorMode(HSL, 360,100,100,255);
    fill(this.hue, 80, 60, this.life);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(frameCount * 0.02);
    rectMode(CENTER);
    rect(0,0,this.l*0.6,this.l, 3);
    pop();
    colorMode(RGB,255);
  }
}

function spawnParticlesByScore(){
  particles = [];
  let baseHue = map(score, 0, currentSet.length, 0, 140); // 0 (red) -> 140 (greenish)
  for (let i=0;i<120;i++){
    let x = random(width);
    let y = random(-50, height/2);
    particles.push(new Particle(x,y, baseHue + random(-20,20)));
  }
}

// 輔助函式：格式化數字
function nf(num, left, right) {
  return num.toFixed(right);
}
