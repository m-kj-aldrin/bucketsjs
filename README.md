# Buckets

An time based interpolating stack, each element in the stack interpolates by it's previous element and it's set value. When an element has elapsed the set duration it's previous element is deleted keeping only alive elements in the stack.

**[demo](https://m-kj-aldrin.github.io/bucketsjs/)**

```shell
npm i @mkja/buckets
```

```javascript
import Bucket from "@mkja/buckets";

const rand = (a, b) => Math.random() * (b - a) + a;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

document.body.append(canvas);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const train = [...Array(32)].map((_, i) => {
    return {
        x: new Bucket(canvas.width / 2 + rand(-32, 32), 1024 + i * 32),
        y: new Bucket(canvas.height / 2 + rand(-32, 32), 1024 + i * 32),
    };
});

let lastRead = null;
function read() {
    if (lastRead == null) lastRead = performance.now();

    let now = performance.now();
    let elapsed = now - lastRead;

    if (elapsed >= 1024) {
        lastRead = null;
        return;
    }

    train.slice(1).forEach((t, i) => {
        i += 1;
        const prev_t = train[i - 1];

        t.x.setTarget(prev_t.x.value);
        t.y.setTarget(prev_t.y.value);
    });

    requestAnimationFrame(read);
}

document.body.addEventListener("pointermove", (e) => {
    const { clientX, clientY } = e;

    train[0].x.setTarget(clientX);
    train[0].y.setTarget(clientY);

    lastRead === null && read();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    train.forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x.value, t.y.value, 4, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
    });
}

let hz120 = 1000 / 120;
let timeStamp = performance.now();

function loop(t = 0) {
    let now = performance.now();
    let elapsed = now - timeStamp;

    if (elapsed >= hz120) {
        timeStamp = now;

        draw();
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

```
