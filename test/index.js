import bucket from "../src/index.js";

const nTails = 128;

const mouse_x = bucket(300, 8000, {
  tail: nTails,
  easing: (x) => x * 4,
});

const mouse_y = bucket(500, 8000, {
  tail: nTails,
  easing: "linear",
});

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const ctx = canvas.getContext("2d");

let x = canvas.width / 2;
let y = canvas.height / 2;

/**@param {number} now */
function draw(now) {
  x += (Math.random() - 0.5) * 64;
  y += (Math.random() - 0.5) * 64;

  x = Math.min(canvas.width, Math.max(0, x));
  y = Math.min(canvas.height, Math.max(0, y));

  mouse_x.set(x);
  mouse_y.set(y);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const tail = { x: mouse_x.tail, y: mouse_y.tail };

  const segments = tail.x.map((_, i) => {
    i = tail.x.length - 1 - i;
    const pos = { x: tail.x[i], y: tail.y[i] };
    return pos;
  });

  segments.forEach((segment, i) => {
    ctx.beginPath();
    if (i == 0) {
      ctx.moveTo(segment.x, segment.y);

      return;
    } else {
      ctx.moveTo(segments[i - 1].x, segments[i - 1].y);
    }

    ctx.lineTo(segment.x, segment.y);

    let opacity = i / segments.length;
    ctx.strokeStyle = `hsla(0,50%,50%,${1 - opacity})`;

    ctx.stroke();
  });

  const firstSegment = segments[0];

  if (firstSegment) {
    ctx.beginPath();
    ctx.arc(firstSegment.x, firstSegment.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
