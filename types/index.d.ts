/**
 * @param {number} value
 * @param {number} duration
 * @param {typeof defauls_opt} opt
 */
export default function _default(value: number, duration: number, opt?: typeof defauls_opt): {
    set: (new_value: number) => Promise<any> | undefined;
    readonly value: number;
    readonly tail: number[];
};
declare namespace defauls_opt {
    let easing: string;
    let tail: number;
}
export {};
