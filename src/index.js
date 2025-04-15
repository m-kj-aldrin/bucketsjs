// (Based on standard easing equations, e.g., from easings.net)

export const EasingFunctions = {
    /** Linear interpolation (no easing) */
    linear: (t) => t,

    /** Quadratic easing in */
    easeInQuad: (t) => t * t,
    /** Quadratic easing out */
    easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
    /** Quadratic easing in and out */
    easeInOutQuad: (t) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

    /** Cubic easing in */
    easeInCubic: (t) => t * t * t,
    /** Cubic easing out */
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    /** Cubic easing in and out */
    easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

    /** Sinusoidal easing in */
    easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
    /** Sinusoidal easing out */
    easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
    /** Sinusoidal easing in and out */
    easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

    /** Exponential easing in */
    easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    /** Exponential easing out */
    easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    /** Exponential easing in and out */
    easeInOutExpo: (t) =>
        t === 0
            ? 0
            : t === 1
            ? 1
            : t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2,
};

// Helper function for interpolation
const lerp = (a, b, t) => a * (1 - t) + b * t;

export default class Bucket {
    #default_duration;
    #default_easing;
    #static_value;

    /**
     * Represents a link in the interpolation chain.
     * @typedef {object} AnimationLink
     * @property {number} target - The target value *for this link*.
     * @property {number} start_time - The timestamp when this link was added.
     * @property {number} duration - The duration over which this link interpolates towards its target.
     * @property {function(number): number} easing - The easing function for this link.
     */

    /** @type {AnimationLink[]} */
    #stack = [];

    #TOLERANCE = 1e-5;

    /**
     * @param {number} value The initial value of the bucket.
     * @param {number} [defaultDuration=1000] The default duration in ms for transitions.
     * @param {function(number): number} [defaultEasing=EasingFunctions.linear] The default easing function to use.
     */
    constructor(
        value,
        defaultDuration = 1000,
        defaultEasing = EasingFunctions.linear // Default to linear
    ) {
        this.#static_value = value;
        this.#default_duration = Math.max(1, defaultDuration); // Ensure duration > 0
        this.#default_easing = defaultEasing; // Store the provided default
    }

    /**
     * Adds a new target to the end of the interpolation chain.
     * @param {number} target The target value this new link should eventually reach.
     * @param {number} [duration] Optional duration in ms. Uses instance default if omitted or invalid.
     * @param {function(number): number} [easing=this.#default_easing] Optional easing function. Uses instance default if omitted.
     */
    setTarget(target, duration, easing = this.#default_easing) {
        const now = performance.now();
        const effectiveDuration =
            duration !== undefined && duration > 0
                ? duration
                : this.#default_duration;

        if (effectiveDuration <= this.#TOLERANCE) {
            this.#static_value = target;
            this.#stack = [];
            return;
        }

        this.#stack.push({
            target: target,
            start_time: now,
            duration: effectiveDuration,
            easing: easing,
        });
    }

    /**
     * Calculates the current value by processing the interpolation chain.
     * Also cleans up completed links from the beginning of the chain.
     */
    get value() {
        const now = performance.now();

        let currentChainValue = this.#static_value;
        let firstActiveIndex = -1; // Index of the first link that hasn't finished yet

        for (let i = 0; i < this.#stack.length; i++) {
            const link = this.#stack[i];
            const elapsed = now - link.start_time;
            let t = Math.min(1, elapsed / link.duration); // Raw progress (0 to 1)

            const easingFunction = link.easing || EasingFunctions.linear;
            const easedT = easingFunction(t);

            currentChainValue = lerp(currentChainValue, link.target, easedT);

            if (t < 1.0 - this.#TOLERANCE) {
                if (firstActiveIndex === -1) {
                    firstActiveIndex = i;
                }
            }
        }

        if (firstActiveIndex > 0) {
            this.#static_value = this.#stack[firstActiveIndex - 1].target;
            this.#stack.splice(0, firstActiveIndex);
        } else if (firstActiveIndex === -1 && this.#stack.length > 0) {
            this.#static_value = this.#stack[this.#stack.length - 1].target;
            this.#stack = []; // Clear the stack
        }

        return currentChainValue;
    }

    /**
     * Checks if the bucket is currently interpolating (stack is not empty).
     * @returns {boolean} True if the chain is active, false otherwise.
     */
    isAnimating() {
        return this.#stack.length > 0;
    }

    /**
     * Instantly sets the value, clearing the entire interpolation chain.
     * @param {number} value The value to set immediately.
     */
    setValue(value) {
        this.#static_value = value;
        this.#stack = []; // Clear the chain
    }

    /**
     * Stops the animation chain, baking the current value into the static value.
     */
    stop() {
        const currentValue = this.value;
        this.#static_value = currentValue;
        this.#stack = [];
    }
}
