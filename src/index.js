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
  /**@type {Map<number,number>} */
  #bucketStack = new Map();
  #bucketIteration = 0;
  #bucketIterationHead = 0;
  /**@type {Required<options>} */
  #options;

  /**
   * @param {number} value
   * @param {options} options
   */
  constructor(value, options) {
    this.#options = { ...default_opt, ...options };

    this.#bucketStack.set(this.#bucketIteration, value);
    this.#bucketIterationHead = this.#bucketIteration;
    this.#bucketIteration++;
  }

  /**
   * Returns the value of the head of the bucket stack
   */
  get value() {
    return this.#bucketStack.get(this.#bucketIterationHead);
  }

  /**
   * Returns the bucket stack
   */
  get stack() {
    return [...this.#bucketStack.values()];
  }

  /**
   * Writes a new value to the bucket stack, returns a promise that resolves when the duration has elapsed
   * @param {number} value
   */
  write(value) {
    if (typeof value != "number") return;
    const local_previous_bucket_index = this.#bucketIteration - 1;
    this.#bucketIterationHead = this.#bucketIteration;
    const local_bucket_index = this.#bucketIteration++;
    let local_value = this.#bucketStack.get(local_previous_bucket_index) ?? value;
    this.#bucketStack.set(local_bucket_index, local_value);
    const local_start = performance.now();

    const easing_function =
      typeof this.#options.easing === "function"
        ? this.#options.easing
        : easing_functions[this.#options.easing];

    /**@type {Promise<number>} */
    return new Promise((res) => {
      /**@param {number} now */
      const iterate = (now) => {
        const local_elapsed = now - local_start;
        if (local_elapsed > this.#options.duration) {
          local_value = value;
          this.#bucketStack.set(local_bucket_index, local_value);

          let previousIteration = local_bucket_index - 1;
          this.#bucketStack.delete(previousIteration);

          res(local_bucket_index);
          return;
        }
        local_value = interpolate(
          this.#bucketStack?.get(local_previous_bucket_index) ?? value,
          value,
          easing_function(local_elapsed / this.#options.duration)
        );
        this.#bucketStack.set(local_bucket_index, local_value);
        requestAnimationFrame(iterate);
      };
      requestAnimationFrame(iterate);
    });
  }
}
