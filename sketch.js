let video;
let noCamera = false;
let errorMsg = '';
let faceMesh;
let faces = [];

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
}

function gotFaces(results) {
  faces = results;
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

  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  imageMode(CENTER);
  image(video, 0, 0, width * 0.5, height * 0.5);

  if (faces.length > 0 && vw > 0) {
    // 177 右耳垂，401 左耳垂（MediaPipe FaceMesh 標準索引）
    let earlobes = [faces[0].keypoints[177], faces[0].keypoints[401]];

    fill(255, 255, 0);
    noStroke();

    for (let ear of earlobes) {
      if (!ear) continue;

      let x = map(ear.x, 0, vw, -width * 0.25, width * 0.25);
      let y = map(ear.y, 0, vh, -height * 0.25, height * 0.25);

      for (let i = 1; i <= 3; i++) {
        circle(x, y + i * 15, 10);
      }
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
