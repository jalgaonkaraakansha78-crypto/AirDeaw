const videoElement = document.getElementById('webcam');
const drawCanvas = document.getElementById('drawCanvas');
const feedbackCanvas = document.getElementById('feedbackCanvas');
const drawCtx = drawCanvas.getContext('2d');
const feedbackCtx = feedbackCanvas.getContext('2d');

videoElement.addEventListener('loadeddata', () => {
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;

  drawCanvas.width = feedbackCanvas.width = width;
  drawCanvas.height = feedbackCanvas.height = height;
});

let prevX = null;
let prevY = null;

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  feedbackCtx.clearRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const indexTip = results.multiHandLandmarks[0][8];
    const x = indexTip.x * feedbackCanvas.width;
    const y = indexTip.y * feedbackCanvas.height;

    // Draw fingertip circle
    feedbackCtx.beginPath();
    feedbackCtx.arc(x, y, 5, 0, 2 * Math.PI);
    feedbackCtx.fillStyle = 'cyan';
    feedbackCtx.fill();

    // Draw line on persistent canvas
    if (prevX !== null && prevY !== null) {
      drawCtx.beginPath();
      drawCtx.strokeStyle = 'cyan';
      drawCtx.lineWidth = 4;
      drawCtx.moveTo(prevX, prevY);
      drawCtx.lineTo(x, y);
      drawCtx.stroke();
    }

    prevX = x;
    prevY = y;
  } else {
    prevX = null;
    prevY = null;
  }
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();