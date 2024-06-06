/**
 * @param {number} value
 * @param {number} duration
 * @param {options} opt
 */
export default function _default(value: number, duration: number, opt?: options): {
    set: (new_value: number) => Promise<any> | undefined;
    readonly value: number;
    readonly tail: number[];
};
export type EasingFunction = (x: number) => number;
export type BuiltInEasingFunctions = "linear";
export type options = {
    easing?: "linear" | EasingFunction | undefined;
    tail?: number | undefined;
};
