// Theme toggle
function toggleDarkMode() {
  const html = document.documentElement;
  const icon = document.getElementById("themeIcon");
  html.classList.toggle("dark");
  icon.setAttribute("data-lucide", html.classList.contains("dark") ? "moon" : "sun");
  lucide.createIcons();
}

lucide.createIcons();

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const editCanvas = document.getElementById("editCanvas");
const editCtx = editCanvas.getContext("2d");
const editorModal = document.getElementById("editorModal");
const upload = document.getElementById("upload");

const frameSelector = document.getElementById("frameSelector");

let frame = new Image();
let currentFrame = "default";
let framePaths = {
  default: "frames/bg.webp",
  flag: "frames/bg_flag.webp",
  text: "frames/bg_text.webp",
};

let userImg = new Image();
userImg.crossOrigin = "anonymous";

let imgX = 150, imgY = 150;
let isDragging = false;
let startX, startY;
let scale = 1;
let rotation = 0;

function setFrame(type) {
  currentFrame = type;
  frame.src = framePaths[type];
  frame.crossOrigin = "anonymous";
  frame.onload = () => {
    drawEditCanvas();
    drawMainCanvas();
  };
}

function drawCanvas(context, image) {
  context.clearRect(0, 0, 300, 300);
  context.drawImage(frame, 0, 0, 300, 300);
  if (image && image.complete && image.naturalWidth !== 0) {
    context.save();
    context.beginPath();
    context.arc(150, 150, 130, 0, Math.PI * 2);
    context.closePath();
    context.clip();
    context.translate(150, 150);
    context.rotate(rotation);
    const size = 300 * scale;
    context.drawImage(image, -size / 2 + (imgX - 150), -size / 2 + (imgY - 150), size, size);
    context.restore();
  }
}

function drawMainCanvas() {
  canvas.style.opacity = 0.5;
  drawCanvas(ctx, userImg);
  setTimeout(() => canvas.style.opacity = 1, 100);
}

function drawEditCanvas() {
  drawCanvas(editCtx, userImg);
}

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    userImg = img;
    resetImage();
    drawEditCanvas();
    editorModal.showModal();
  };
  img.src = URL.createObjectURL(file);
});

editCanvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDragging = true;
});

editCanvas.addEventListener("mousemove", (e) => {
  if (isDragging && userImg) {
    const dx = e.offsetX - startX;
    const dy = e.offsetY - startY;
    imgX += dx;
    imgY += dy;
    startX = e.offsetX;
    startY = e.offsetY;
    drawEditCanvas();
  }
});

editCanvas.addEventListener("mouseup", () => isDragging = false);
editCanvas.addEventListener("mouseleave", () => isDragging = false);

function zoom(factor) {
  scale *= factor;
  drawEditCanvas();
}

function rotateImage() {
  rotation += Math.PI / 8;
  drawEditCanvas();
}

function resetImage() {
  scale = 1;
  rotation = 0;
  imgX = 150;
  imgY = 150;
  drawEditCanvas();
}

function applyChanges() {
  drawMainCanvas();
  editorModal.close();
  showOutputUI();
}

function showOutputUI() {
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('finalButtons').classList.remove('hidden');
}

function startOver() {
  location.reload();
}

function backToEdit() {
  editorModal.showModal();
  document.getElementById("finalButtons").classList.add("hidden");
  drawEditCanvas();
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "solidarity-profile.png";
  link.href = canvas.toDataURL();
  link.click();
}

async function fetchAvatar(platform) {
  const username = prompt("Enter your " + platform + " username:")?.trim();
  if (!username) return;
  try {
    const url = `https://unavatar.io/${platform}/${username}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Avatar not found");
    loadImage(url);
  } catch (err) {
    alert("Failed to fetch avatar from " + platform + ". Make sure the username is correct or try again later.");
  }
}

function loadImage(src) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.loading = "eager";
  img.onload = () => {
    userImg = img;
    resetImage();
    drawEditCanvas();
    editorModal.showModal();
  };
  img.src = src;
}

frame.onload = () => {
  userImg.onload = drawMainCanvas;
  if (userImg.complete) drawMainCanvas();
};

frameSelector?.addEventListener("change", (e) => {
  setFrame(e.target.value);
});

// Browser check
const ua = navigator.userAgent || navigator.vendor || window.opera;
const inAppBrowser = /FBAN|FBAV|Instagram|Line|Twitter/i.test(ua);
if (inAppBrowser) {
  document.getElementById("browserWarning").classList.remove("hidden");
}
