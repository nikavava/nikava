// === Language Switcher ===
const languages = ["en", "sv", "pl", "pt"];
const flags = {
  en: "/media/flag-en.png",
  sv: "/media/flag-sv.png",
  pl: "/media/flag-pl.png",
  pt: "/media/flag-pt.png"
};


let currentLangIndex = 0;

function setLanguage(lang) {
  document.querySelectorAll("[data-" + lang + "]").forEach(el => {
    el.textContent = el.getAttribute("data-" + lang);
  });
}

document.getElementById("lang-btn").addEventListener("click", () => {
  currentLangIndex = (currentLangIndex + 1) % languages.length;
  const lang = languages[currentLangIndex];
  document.getElementById("lang-flag").src = flags[lang];
  document.getElementById("lang-flag").alt = lang;
  setLanguage(lang);
  localStorage.setItem("siteLang", lang);
});

// === Music Player Setup ===
const music = document.getElementById("bg-music");
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const trackTitle = document.getElementById("track-title");
const progressBar = document.getElementById("progress-fill");

const tracks = [
  { src: "media/music1.ogg", title: "ふたりのきもちのほんとのひみつ" },
  { src: "media/music2.ogg", title: "ダンシング・ヒーロー" },
  { src: "media/music3.ogg", title: "Skrzydlate Ręce" },
  { src: "media/music4.ogg", title: "Love Taste" },
  { src: "media/music5.ogg", title: "Charm" }
];
let currentTrackIndex = 0;

function loadTrack(index) {
  music.src = tracks[index].src;
  trackTitle.textContent = tracks[index].title;
  currentTrackIndex = index;
}

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("siteLang");
  if (saved && languages.includes(saved)) {
    currentLangIndex = languages.indexOf(saved);
    document.getElementById("lang-flag").src = flags[saved];
    setLanguage(saved);
  } else {
    setLanguage("en");
  }

  // 🔹 Randomize the starting track
  currentTrackIndex = Math.floor(Math.random() * tracks.length);
  loadTrack(currentTrackIndex);
});


// === Enter Button Logic ===
document.getElementById("enter-btn").addEventListener("click", () => {
  document.querySelector(".main-content").style.display = "flex";
  document.getElementById("enter-section").style.display = "none";
  music.play().catch(err => console.log("Autoplay blocked:", err));
  startVisualizer(music);
});

// === Play/Pause Button ===
playPauseBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().catch(err => console.log("Autoplay blocked:", err));
  } else {
    music.pause();
  }
});

// === Next/Prev Buttons ===
nextBtn.addEventListener("click", () => {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(currentTrackIndex);
  music.play().catch(err => console.log("Autoplay blocked:", err));
});

prevBtn.addEventListener("click", () => {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
  music.play().catch(err => console.log("Autoplay blocked:", err));
});

// === Progress Bar ===
music.addEventListener("timeupdate", () => {
  const percent = (music.currentTime / music.duration) * 100;
  progressBar.style.width = percent + "%";
});

// === Play Button State ===
music.addEventListener("play", () => playPauseBtn.textContent = "⏸");
music.addEventListener("pause", () => playPauseBtn.textContent = "▶");
music.addEventListener("ended", () => playPauseBtn.textContent = "▶");

// === Background Parallax ===
let mouseX = 0, mouseY = 0;
document.addEventListener("mousemove", e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 60;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 60;
});

// === Cursor Trail ===
const trailCanvas = document.createElement("canvas");
trailCanvas.id = "cursor-trail";
document.body.appendChild(trailCanvas);
const trailCtx = trailCanvas.getContext("2d");

function resizeTrailCanvas() {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
}
resizeTrailCanvas();
window.addEventListener("resize", resizeTrailCanvas);

let trailPoints = [];
document.addEventListener("mousemove", e => {
  trailPoints.push({ x: e.clientX, y: e.clientY, time: Date.now() });
});

function drawTrail() {
  requestAnimationFrame(drawTrail);
  trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  const now = Date.now();
  const maxAge = 1000;
  trailPoints = trailPoints.filter(p => now - p.time < maxAge);
  if (trailPoints.length > 1) {
    for (let i = 1; i < trailPoints.length; i++) {
      const p1 = trailPoints[i - 1];
      const p2 = trailPoints[i];
      const age = now - p1.time;
      const alpha = 1 - age / maxAge;
      trailCtx.beginPath();
      trailCtx.moveTo(p1.x, p1.y);
      trailCtx.lineTo(p2.x, p2.y);
      trailCtx.strokeStyle = `rgba(255,255,255,${alpha})`;
      trailCtx.lineWidth = 2;
      trailCtx.stroke();
    }
  }
}
drawTrail();

// === Click Ripple ===
document.addEventListener("click", e => {
  const circle = document.createElement("div");
  circle.className = "click-circle";
  circle.style.left = (e.pageX - 25) + "px";
  circle.style.top = (e.pageY - 25) + "px";
  circle.style.width = "50px";
  circle.style.height = "50px";
  document.body.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
});

// === Visualizer ===
function startVisualizer(audioElement) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audioElement);
  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const canvas = document.getElementById("visualizer");
  const ctx = canvas.getContext("2d");
  let prevHeights = new Array(bufferLength).fill(0);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.25;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2;
    let x = 0;

    let averageFrequency = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    const bg = document.getElementById('bg-layer');
    if (bg) {
      const scale = 1 + (averageFrequency / 255) * 0.15;
      const xJitter = (averageFrequency / 255) * 6 + mouseX;
      const yJitter = (averageFrequency / 255) * 4 + mouseY;
      bg.style.transform = `scale(${scale}) translate(${xJitter}px, ${yJitter}px)`;
      const posX = 50 + (averageFrequency / 255) * 3 + (mouseX / 20) * 3;
      const posY = 50 + (averageFrequency / 255) * 2 + (mouseY / 20) * 2;
      bg.style.backgroundPosition = `${posX}% ${posY}%`;
    }

    for (let i = 0; i < bufferLength; i++) {
      const rawHeight = dataArray[i];
      const scaledHeight = Math.pow(rawHeight / 255, 3) * canvas.height;
      const barHeight = Math.min(scaledHeight * 0.7 + prevHeights[i] * 0.3, canvas.height);
      prevHeights[i] = barHeight;

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 5;
      ctx.fillRect(x, canvas.height - barHeight, barWidth / 3, barHeight);
      x += barWidth;
    }
  }
  draw();
}

// === SPA Toggle Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.querySelector(".main-content");

  // Only About and Contact are SPA sections
  const pages = {
    about: "about-section",
    contact: "contact-section"
  };

  function hideAllSections() {
    Object.values(pages).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  function showSection(sectionId) {
    mainContent.style.display = "none";
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) section.style.display = "flex";
  }

  // Attach events dynamically
  Object.keys(pages).forEach(key => {
    const btn = document.getElementById(`${key}-btn`);
    if (btn) {
      btn.addEventListener("click", e => {
        // Only intercept if href is "#"
        if (btn.getAttribute("href") === "#") {
          e.preventDefault();
          showSection(pages[key]);
        }
        // If href points to another page, let the browser handle it
      });
    }
  });

  // Back buttons return to main content
// Back buttons inside sections return to main content
document.querySelectorAll("#about-section .button, #contact-section .button").forEach(btn => {
  btn.addEventListener("click", () => {
    hideAllSections();
    mainContent.style.display = "flex";
  });
});

});
