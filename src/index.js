const easing_functions = {
  linear: (x) => x,
};

/**@typedef {(x:number)=>number} EasingFunction */

/**@typedef {"linear"} BuiltInEasingFunctions */

/**
 * @typedef {Object} options
 * @prop {BuiltInEasingFunctions | EasingFunction} [easing]
 * @prop {number} [tail]
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
const defauls_opt = {
  easing: "linear",
  tail: 2,
};

/**
 * @param {number} value
 * @param {number} duration
 * @param {options} opt
 */
export default function (value, duration, opt = {}) {
  /**@type {Map<number,number>} */
  const target_bucket = new Map();
  let bucket_count = 0;

  /**@type {Required<options>} */
  let _opt = { ...defauls_opt, ...opt };

  /**@type {(x:number) => number} */
  let easing_function = easing_functions.linear;

  /**
   * @param {number} new_value
   */
  function set(new_value) {
    if (typeof new_value != "number") return;
    const local_previous_bucket_index = bucket_count - 1;
    const local_bucket_index = bucket_count++;

    let local_value = target_bucket.get(local_previous_bucket_index) ?? value;
    target_bucket.set(local_bucket_index, local_value);

    const local_start = performance.now();

    /**@type {Promise<number>} */
    return new Promise((res) => {
      /**@param {number} now */
      function iterate(now) {
        const local_elapsed = now - local_start;

        if (local_elapsed > duration) {
          local_value = new_value;
          target_bucket.set(local_bucket_index, local_value);

          if (local_bucket_index - (bucket_count - _opt.tail) < 0) {
            target_bucket.delete(local_bucket_index);
          }

          res(local_bucket_index);
          return;
        }

        local_value = interpolate(
          target_bucket?.get(local_previous_bucket_index) ?? value,
          new_value,
          easing_function(local_elapsed / duration)
        );

        target_bucket.set(local_bucket_index, local_value);

        requestAnimationFrame(iterate);
      }

      requestAnimationFrame(iterate);
    });
  }

  return {
    set,
    get value() {
      return target_bucket.get(bucket_count - 1) ?? value;
    },
    get tail() {
      return [...target_bucket.values()].slice(-_opt.tail);
    },
  };
}
