# Buckets

An time based interpolating stack, each element in the stack interpolates by it's previous element and it's set value. When an element has elapsed the set duration it's previous element is deleted keeping only alive elements in the stack.

```shell
npm i @mkja/buckets
```

```javascript
import Bucket from "@mkja/buckets";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

document.body.append(canvas);

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let mx = new Bucket(canvas.width / 2, 1000);
let my = new Bucket(canvas.height / 2, 1000);

document.body.addEventListener("pointermove", (e) => {
    const { clientX, clientY } = e;

    mx.setTarget(clientX);
    my.setTarget(clientY);
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath()
    ctx.roundRect(mx.value - 8, my.value - 8, 16, 16, 8);
    ctx.closePath()
    ctx.fill();
}

let timeStamp = performance.now();
function loop(t = 0) {
    let now = performance.now();
    let elapsed = now - timeStamp;

    if (elapsed >= 30) {
        timeStamp = now;

        draw();
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

```
