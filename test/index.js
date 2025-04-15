import Bucket, { EasingFunctions } from "../src/index.js"; // Assuming index.js is in ../src/

// const rand = (a=0, b=1) => Math.random() * (b - a) + a;
const rand = (min = -1, max = 1) =>
    min + Math.random() * (Math.abs(min) + Math.abs(max));

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Basic styling for visibility
canvas.style.border = "1px solid black";
canvas.style.display = "block"; // Prevents extra space below canvas
document.body.style.margin = "0"; // Remove default body margin

document.body.append(canvas);

// Function to resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize and listener for window resize
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Use a longer duration for a smoother train effect
const segmentDuration = 1000; // ms

const train = [...Array(32)].map((_, i) => {
    // Start train segments slightly offset initially for visual clarity
    const initialX = canvas.width / 2;
    const initialY = canvas.height / 2;
    return {
        // Give each segment a slightly different duration for more organic movement
        x: new Bucket(
            initialX,
            segmentDuration + rand(-100, 100),
            rand() > 0.8 ? EasingFunctions.easeInCubic : EasingFunctions.linear
        ),
        y: new Bucket(
            initialY,
            segmentDuration + rand(-100, 100),
            rand() > 0.8 ? EasingFunctions.easeInCubic : EasingFunctions.linear
        ),
    };
});

// --- Animation Logic ---

let readLoopActive = false; // Flag to track if the read loop is running
let readQue = [];

function read() {
    // If the flag is false, stop the loop
    if (!readLoopActive) return;

    // Update targets for segments 1 onwards to follow the previous one
    for (let i = 1; i < train.length; i++) {
        const current_t = train[i];
        const prev_t = train[i - 1];

        // Set target using the current value of the previous segment
        current_t.x.setTarget(prev_t.x.value);
        current_t.y.setTarget(prev_t.y.value);
    }

    requestAnimationFrame(read); // Continue the loop
}

let mx = 0;
let my = 0;

document.body.addEventListener("pointermove", (e) => {
    const { clientX, clientY } = e;
    mx = clientX;
    my = clientY;

    // // Only the head of the train follows the mouse directly
    // train[0].x.setTarget(clientX);
    // train[0].y.setTarget(clientY);

    // // Start the read loop if it's not already running
    // if (!readLoopActive) {
    //     readLoopActive = true;
    //     read();
    // }
});

let target = { x: canvas.width / 2, y: canvas.height / 2 };

const randChoice = /**@template {any[]} T @param {T} arr */ (arr) =>
    arr[Math.floor(Math.random() * arr.length)];

setInterval(() => {
    if (Math.random() > 0.9) {
        let f = 5;

        target.x += rand(-f, f);
        target.y += rand(-f, f);

        const randPart = train[0];

        randPart.x.setTarget(target.x, 700, EasingFunctions.easeOutQuad);
        randPart.y.setTarget(target.y, 700), EasingFunctions.easeOutQuad;

        if (!readLoopActive) {
            readLoopActive = true;
            read();
        }
    }
}, 10);

setInterval(() => {
    if (Math.random() > 0.7) {
        target.x += rand(-30, 30);
        target.y += rand(-30, 30);

        train[0].x.setTarget(target.x);
        train[0].y.setTarget(target.y);

        if (!readLoopActive) {
            readLoopActive = true;
            read();
        }
    }
}, 100);

setInterval(() => {
    if (Math.random() > 0.5) {
        target.x += rand(-80, 80);
        target.y += rand(-80, 80);

        train[0].x.setTarget(target.x);
        train[0].y.setTarget(target.y);

        if (!readLoopActive) {
            readLoopActive = true;
            read();
        }
    }
}, 500);

setInterval(() => {
    if (Math.random() > 0.8) {
        target.x += rand(-120, 120);
        target.y += rand(-120, 120);

        train[0].x.setTarget(target.x, 1500, EasingFunctions.easeInOutQuad);
        train[0].y.setTarget(target.y, 1500, EasingFunctions.easeInOutQuad);

        if (!readLoopActive) {
            readLoopActive = true;
            read();
        }
    }
}, 1000);

// Optional: Stop the read loop if the mouse leaves the window
// document.body.addEventListener("pointerleave", () => {
//     readLoopActive = false;
// });

// --- Drawing Logic ---

function draw() {
    let dx = (mx - target.x) / canvas.width;
    let dy = (my - target.y) / canvas.height;

    // console.log({ dx, dy });
    target.x += dx * 30 * Math.random() * 3;
    target.y += dy * 30 * Math.random() * 3;

    // target.x = (mx - target.x) * dx + target.x * (1 - dx);
    // target.y = (my - target.y) * dy + target.y * (1 - dy);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Need at least 3 points to draw quadratic curves reasonably
    if (train.length < 3) {
        // Fallback to drawing lines if less than 3 points
        if (train.length === 2) {
            ctx.beginPath();
            ctx.moveTo(train[0].x.value, train[0].y.value);
            ctx.lineTo(train[1].x.value, train[1].y.value);
            ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (train.length === 1) {
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(train[0].x.value, train[0].y.value, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        return;
    }

    // Store current point values for easier access
    const points = train.map((t) => ({ x: t.x.value, y: t.y.value }));

    ctx.beginPath();

    // Move to the first point
    ctx.moveTo(points[0].x, points[0].y);

    // Calculate the first midpoint (for the second point, using first as control)
    let midX = (points[0].x + points[1].x) / 2;
    let midY = (points[0].y + points[1].y) / 2;

    // Draw the first segment as a curve to the midpoint
    // Control point is points[0] (implicitly, as we move from it)
    // End point is the midpoint between points[0] and points[1]
    // This doesn't look quite right usually, often better to start with a line segment
    // Let's try a different approach: draw curves between midpoints.

    ctx.beginPath(); // Restart path for the midpoint strategy

    // 1. Move to the first point (P0)
    ctx.moveTo(points[0].x, points[0].y);

    // 2. Calculate the midpoint between P0 and P1 (M0)
    let mX = (points[0].x + points[1].x) / 2;
    let mY = (points[0].y + points[1].y) / 2;

    // 3. Draw a line to the first midpoint M0 (Handles the start of the curve)
    //    Alternatively, start the curve here if desired, but line often looks better.
    ctx.lineTo(mX, mY); // Optional: Comment this out if you prefer curve from start

    // 4. Loop through the inner points (P1 to Pn-1)
    //    For each point P(i), draw a quadratic curve to the midpoint M(i)
    //    using P(i) as the control point.
    for (let i = 1; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];

        // Calculate midpoint M(i) between P(i) and P(i+1)
        mX = (currentPoint.x + nextPoint.x) / 2;
        mY = (currentPoint.y + nextPoint.y) / 2;

        // Draw curve from the previous midpoint (or start line end)
        // to the current midpoint M(i), using P(i) as the control point.
        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, mX, mY);
    }

    // 5. Draw a line from the last calculated midpoint to the final point Pn
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y); // Connects the curve smoothly to the end

    // Style and stroke the path
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // --- Optional: Draw points at the original segment locations ---
    // ctx.fillStyle = 'blue';
    // points.forEach(p => {
    //    ctx.beginPath();
    //    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    //    ctx.fill();
    // });
    // --- End Optional ---
}

// --- Main Loop ---

function loop() {
    draw(); // Draw the current state
    requestAnimationFrame(loop); // Request the next frame
}

// Start the drawing loop
requestAnimationFrame(loop);
