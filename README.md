# Buckets

An time based interpolating stack, each element in the stack interpolates by it's previous element and it's target value.

```javascript
import Bucket from "@mkja/buckets";

const bucketX = new Bucket(0, { duration: 1000, easing: (x) => x * x });

const bucketY = new Bucket(0, { duration: 1000, easing: (x) => x * x });

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

canvas.addEventListener("mousemove", (e) => {
  let [x, y] = [e.clientX, e.clientY];
  bucketX.write(x);
  bucketY.write(y);
});

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const ctx = canvas.getContext("2d");

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const tail = { x: bucketX.stack, y: bucketY.stack };

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
    ctx.lineWidth = 1 + (1 - opacity) * 4;
    ctx.strokeStyle = `hsla(0,50%,50%,${1 - opacity})`;

    ctx.stroke();
  });

  const firstSegment = segments[0];

  if (firstSegment) {
    ctx.beginPath();
    ctx.arc(firstSegment.x, firstSegment.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(0,50%,50%)";
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
```
