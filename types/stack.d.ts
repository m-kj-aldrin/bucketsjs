export class StackNode {
    /**
     * @param {number} value
     * @param {StackNode | undefined} prev
     * @param {StackNode | undefined} next
     */
    constructor(value: number, prev: StackNode | undefined, next: StackNode | undefined);
    prev: StackNode | undefined;
    next: StackNode | undefined;
    set value(value: number);
    get value(): number;
    #private;
}
export class Stack {
    get head(): StackNode | undefined;
    get tail(): StackNode | undefined;
    /**
     * @param {number} value
     */
    push(value: number): StackNode;
    /**
     * @param {StackNode | undefined} node
     */
    delete(node: StackNode | undefined): StackNode | undefined;
    get elements(): StackNode[];
    #private;
}
