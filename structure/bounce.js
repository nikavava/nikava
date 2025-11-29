const dvd = document.getElementById("dvd");
let x = 100, y = 100;
let dx = 2, dy = 2;

function animate() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const imgW = dvd.offsetWidth;
  const imgH = dvd.offsetHeight;

  x += dx;
  y += dy;

  if (x + imgW >= w || x <= 0) dx *= -1;
  if (y + imgH >= h || y <= 0) dy *= -1;

  dvd.style.left = x + "px";
  dvd.style.top = y + "px";

  requestAnimationFrame(animate);
}

dvd.style.left = x + "px";
dvd.style.top = y + "px";
animate();
