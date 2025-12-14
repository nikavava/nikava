// Enter button logic
document.getElementById("enter-btn").addEventListener("click", function() {
    document.querySelector(".main-content").style.display = "block";
    document.getElementById("enter-section").style.display = "none";

    const music = document.getElementById("bg-music");
    music.play().catch(err => console.log("Autoplay blocked:", err));

    startVisualizer(music);
});

// Background parallax effect
document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    document.body.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
});

// Cursor trail
document.addEventListener("mousemove", (e) => {
    const trail = document.createElement("div");
    trail.className = "trail";
    trail.style.left = e.pageX + "px";
    trail.style.top = e.pageY + "px";
    document.body.appendChild(trail);
    setTimeout(() => trail.remove(), 600);
});

// Click ripple
document.addEventListener("click", (e) => {
    const circle = document.createElement("div");
    circle.className = "click-circle";
    circle.style.left = (e.pageX - 25) + "px";
    circle.style.top = (e.pageY - 25) + "px";
    circle.style.width = "50px";
    circle.style.height = "50px";
    document.body.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
});

// Visualizer
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

    // store previous heights for smoothing
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

        const barWidth = (canvas.width / bufferLength) * 2; // spacing
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const rawHeight = dataArray[i] * 2; // boost responsiveness
            const barHeight = rawHeight * 0.7 + prevHeights[i] * 0.3; // smoothing
            prevHeights[i] = barHeight;

            // rainbow cycling colors
            ctx.fillStyle = `hsl(${(i * 10 + Date.now()/20) % 360}, 100%, 50%)`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 20;

            // Draw bar, then leave a space
            ctx.fillRect(x, canvas.height - barHeight, barWidth / 2, barHeight);
            x += barWidth;
        }
    }
    draw();
}

// Music selector logic
const music = document.getElementById("bg-music");
const selector = document.getElementById("music-selector");
const playPauseBtn = document.getElementById("play-pause-btn");

selector.addEventListener("change", (e) => {
    const wasPlaying = !music.paused;
    music.src = e.target.value;
    if (wasPlaying) {
        music.play().catch(err => console.log("Autoplay blocked:", err));
    }
});

// Play/Pause button logic
playPauseBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play().catch(err => console.log("Autoplay blocked:", err));
        playPauseBtn.textContent = "Pause";
    } else {
        music.pause();
        playPauseBtn.textContent = "Play";
    }
});

