let video;
let noCamera = false;
let errorMsg = '';
let faceMesh;
let faces = [];
let handPose;
let hands = [];
let earrings = [];
let currentAccIndex = 0; // 對應的耳環圖片索引（0 代表 1 根手指）

function preload() {
  earrings.push(loadImage('pic/acc/acc1_ring.png'));
  earrings.push(loadImage('pic/acc/acc2_pearl.png'));
  earrings.push(loadImage('pic/acc/acc3_tassel.png'));
  earrings.push(loadImage('pic/acc/acc4_jade.png'));
  earrings.push(loadImage('pic/acc/acc5_phoenix.png'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 指定前鏡頭（手機預設可能是後鏡頭）
  video = createCapture({ video: { facingMode: 'user' } }, onVideoReady);
  video.elt.addEventListener('error', () => {
    noCamera = true;
    errorMsg = '無法開啟攝影機';
  });
  video.hide();
}

function onVideoReady() {
  // video 準備好之後再初始化 faceMesh
  faceMesh = ml5.faceMesh({ maxFaces: 1 }, () => {
    faceMesh.detectStart(video, gotFaces);
  });

  // 初始化 handPose 手勢辨識
  handPose = ml5.handPose({ maxHands: 1 }, () => {
    handPose.detectStart(video, gotHands);
  });
}

function gotFaces(results) {
  faces = results;
}

function gotHands(results) {
  hands = results;
}

// 判斷伸出了幾根手指
function getFingerCount(hand) {
  let count = 0;
  let kp = hand.keypoints;
  if (!kp) return 0;

  // 檢查食指、中指、無名指、小指 (指尖 y 座標小於第二指節 y 座標視為伸直)
  if (kp[8].y < kp[6].y) count++;
  if (kp[12].y < kp[10].y) count++;
  if (kp[16].y < kp[14].y) count++;
  if (kp[20].y < kp[18].y) count++;

  // 檢查大拇指 (根據左/右手判斷大拇指指尖 x 座標與指節的相對位置)
  let isLeft = hand.handedness === "Left";
  if ((isLeft && kp[4].x > kp[3].x) || (!isLeft && kp[4].x < kp[3].x)) {
    count++;
  }
  return count;
}

function draw() {
  background('#e7c6ff');

  if (noCamera) {
    fill(80);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text(errorMsg, width / 2, height / 2);
    return;
  }

  if (!video) return;

  // 使用實際影像解析度做座標映射
  let vw = video.elt.videoWidth || video.width;
  let vh = video.elt.videoHeight || video.height;

  // 偵測到手勢時，計算手指數量並切換對應的耳環圖片
  if (hands.length > 0) {
    let fingers = getFingerCount(hands[0]);
    if (fingers >= 1 && fingers <= 5) {
      currentAccIndex = fingers - 1; // 1根手指對應 index 0 (acc1_ring.png)
    }
  }

  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  imageMode(CENTER);
  image(video, 0, 0, width * 0.5, height * 0.5);

  if (faces.length > 0 && vw > 0) {
    // 177 右耳垂，401 左耳垂（MediaPipe FaceMesh 標準索引）
    let earlobes = [faces[0].keypoints[177], faces[0].keypoints[401]];

    for (let ear of earlobes) {
      if (!ear) continue;

      let x = map(ear.x, 0, vw, -width * 0.25, width * 0.25);
      let y = map(ear.y, 0, vh, -height * 0.25, height * 0.25);

      // 透過畫布比率計算往外與往上的移動量
      let shiftX = width * 0.015; // 左右位移比率 (1.5% 畫布寬度)
      let shiftY = height * 0.015; // 上下位移比率 (1.5% 畫布高度)
      let dirX = x < 0 ? -1 : 1; // 判斷位於畫面左側或右側來決定往外移的方向

      // 往外 (x + dirX * shiftX)、往上 (y - shiftY) 移動
      image(earrings[currentAccIndex], x + (dirX * shiftX), y - shiftY, 30, 45);
    }
  }
  pop();

  fill(0);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(32);
  text("414730936 陸柏安", width / 2, 30);
  textSize(24);
  text("作品為影像辨識_耳環臉譜", width / 2, 70);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
