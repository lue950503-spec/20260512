let video;
let noCamera = false;
let errorMsg = '';
let faceMesh;
let faces = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    noCamera = true;
    errorMsg = '此瀏覽器不支援攝影機';
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(async () => {
      video = createCapture(VIDEO);
      video.hide();
      faceMesh = await ml5.faceMesh({ maxFaces: 1 });
      faceMesh.detectStart(video, gotFaces);
    })
    .catch(err => {
      noCamera = true;
      if (err.name === 'NotFoundError') {
        errorMsg = '找不到攝影機裝置';
      } else if (err.name === 'NotAllowedError') {
        errorMsg = '請允許瀏覽器存取攝影機';
      } else {
        errorMsg = '無法開啟攝影機：' + err.message;
      }
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

  push();
  translate(width / 2, height / 2);
  scale(-1, 1);
  imageMode(CENTER);
  image(video, 0, 0, width * 0.5, height * 0.5);

  // 繪製耳垂的耳環
  if (faces.length > 0 && video.width > 0) {
    // 177 為右耳垂（畫面的左側），361 為左耳垂（畫面的右側）
    let earlobes = [faces[0].keypoints[177], faces[0].keypoints[361]];
    
    fill(255, 255, 0); // 設定為黃色
    noStroke();
    
    for (let ear of earlobes) {
      if (!ear) continue;
      
      // 將特徵點相對於原始影像的座標，映射到目前畫布中縮放及置中後的座標
      let x = map(ear.x, 0, video.width, -width * 0.25, width * 0.25);
      let y = map(ear.y, 0, video.height, -height * 0.25, height * 0.25);
      
      // 由耳垂位置往下畫出三個圓圈，營造耳環效果
      for (let i = 1; i <= 3; i++) {
        circle(x, y + i * 15, 10); // 間距 15，直徑 10
      }
    }
  }
  pop();

  // 在畫布上方置中繪製標題文字
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textAlign(CENTER, TOP); // 設定對齊方式為置中、靠上對齊
  textSize(32); // 設定第一行文字大小
  text("414730936 陸柏安", width / 2, 30);
  textSize(24); // 設定第二行文字大小
  text("作品為影像辨識_耳環臉譜", width / 2, 70);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
