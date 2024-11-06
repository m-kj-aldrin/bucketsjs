export default class Bucket {
    #default_duration = 0;

    /** @type {{target:number,duration:number,start_time:number}[]} */
    #stack = [];

    /**@type {number|null} */
    #start_time = null;

    #static_value = 0;

    /**
     * @param {number} value
     * @param {number} duration n
     */
    constructor(value, duration) {
        this.#default_duration = duration;
        this.#static_value = value;
    }

    /**
     * @param {number} value
     * @param {number} [duration]
     */
    setTarget(value, duration = this.#default_duration) {
        const now = performance.now();

        if (this.#start_time === null) this.#start_time = now;

        this.#stack.push({ target: value, duration, start_time: now }) - 1;
    }

    get value() {
        let now = performance.now();

        let current_value = this.#stack.reduce((sum, target, i, arr) => {
            if (target.target == sum) return sum;

            let t = (now - target.start_time) / target.duration;

            if (t >= 1) {
                if (i > 0) {
                    delete arr[i - 1];
                }
                if (i == arr.length - 1) {
                    this.#stack = [];
                    this.#static_value = target.target;
                }
                return target.target;
            }
            sum = sum * (1 - t) + target.target * t;
            return sum;
        }, this.#static_value);

        return current_value;
    }
}
