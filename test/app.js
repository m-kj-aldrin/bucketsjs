import bucket from "../bucket.js";

const nTails = 32;

const mouse_x = bucket(300, 8000, {
    tail: nTails,
});

const mouse_y = bucket(500, 8000, {
    tail: nTails,
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
        const pos = { x: tail.x[i], y: tail.y[i] };
        return pos;
    });

    ctx.beginPath();

    segments.forEach((segment, i) => {
        if (i == 0) {
            ctx.moveTo(segment.x, segment.y);

            return;
        }

        ctx.lineTo(segment.x, segment.y);
    });

    ctx.stroke();

    const firstSegment = segments[0];

    if (firstSegment) {
        ctx.beginPath();
        ctx.arc(firstSegment.x, firstSegment.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    const lastSegment = segments[segments.length - 1];

    if (lastSegment) {
        ctx.beginPath();
        ctx.arc(lastSegment.x, lastSegment.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
