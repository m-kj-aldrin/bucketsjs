export default class Bucket {
    /**
     * @param {number} value
     * @param {options} options
     */
    constructor(value: number, options: options);
    /**
     * Returns the value of the head of the bucket stack
     */
    get value(): number | undefined;
    /**
     * Returns the bucket stack
     */
    get stack(): number[];
    /**
     * Writes a new value to the bucket stack, returns a promise that resolves when the duration has elapsed
     * @param {number} value
     */
    write(value: number): Promise<any> | undefined;
    #private;
}
export type EasingFunction = (x: number) => number;
export type BuiltInEasingFunctions = "linear";
export type options = {
    duration?: number | undefined;
    easing?: "linear" | EasingFunction | undefined;
};
