const easing_functions = {
  linear: (x) => x,
};

/**
 * @param {number} a
 * @param {number} b
 * @param {number} f
 */
function interpolate(a, b, f) {
  return a * (1 - f) + b * f;
}

const defauls_opt = {
  easing: "linear",
  tail: 1,
};

/**
 * @param {number} value
 * @param {number} duration
 * @param {typeof defauls_opt} opt
 */
export default function (value, duration, opt = {}) {
  /**@type {Map<number,number>} */
  const target_bucket = new Map();
  // target_bucket.set(0, value);
  let bucket_count = 0;

  opt = {
    ...defauls_opt,
    ...opt,
  };

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

          if (local_bucket_index - (bucket_count - opt.tail) < 0) {
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
      return [...target_bucket.values()].slice(-opt.tail);
    },
  };
}
