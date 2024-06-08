import { Stack } from "./stack.js";

const easing_functions = {
  /**@param {number} x */
  linear: (x) => x,
};

/**@typedef {(x:number)=>number} EasingFunction */

/**@typedef {"linear"} BuiltInEasingFunctions */

/**
 * @typedef {Object} options
 * @prop {number} [duration]
 * @prop {BuiltInEasingFunctions | EasingFunction} [easing]
 */

/**
 * @param {number} a
 * @param {number} b
 * @param {number} f
 */
function interpolate(a, b, f) {
  return a * (1 - f) + b * f;
}

/**@type {Required<options>} */
const default_opt = {
  duration: 100,
  easing: "linear",
};

export default class Bucket {
  #bucketStack = new Stack();

  /**@type {Required<options>} */
  #options;

  /**
   * @param {number} value
   * @param {options} options
   */
  constructor(value, options) {
    this.#options = { ...default_opt, ...options };
    this.#bucketStack.push(value);
  }

  /**
   * Returns the value of the head of the bucket stack
   */
  get value() {
    return this.#bucketStack.head?.value;
  }

  /**
   * Returns the bucket stack
   */
  get stack() {
    return this.#bucketStack.elements.map((node) => node.value);
  }

  /**
   * Writes a new value to the bucket stack, returns a promise that resolves when the duration has elapsed
   * @param {number} value
   */
  write(value) {
    if (typeof value != "number") return;

    let localValue = this.#bucketStack.head?.value ?? value;
    const localNode = this.#bucketStack.push(localValue);

    const localStartTime = performance.now();

    const easing_function =
      typeof this.#options.easing === "function"
        ? this.#options.easing
        : easing_functions[this.#options.easing];

    /**@type {Promise<number>} */
    return new Promise((res) => {
      /**@param {number} now */
      const iterate = (now) => {
        const localElapsedTime = now - localStartTime;

        if (localElapsedTime > this.#options.duration) {
          localValue = value;
          localNode.value = localValue;

          this.#bucketStack.delete(localNode.prev);

          res(localNode);
          return;
        }
        let prevValue = localNode.prev?.value ?? value;
        localValue = interpolate(
          prevValue,
          value,
          easing_function(localElapsedTime / this.#options.duration)
        );
        localNode.value = localValue;

        requestAnimationFrame(iterate);
      };
      requestAnimationFrame(iterate);
    });
  }
}
