export class StackNode {
  #value;
  prev;
  next;

  /**
   * @param {number} value
   * @param {StackNode | undefined} prev
   * @param {StackNode | undefined} next
   */
  constructor(value, prev, next) {
    this.#value = value;
    this.prev = prev;
    this.next = next;
  }

  get value() {
    return this.#value;
  }
  set value(value) {
    this.#value = value;
  }
}

export class Stack {
  /**@type {StackNode | undefined} */
  #head;
  /**@type {StackNode | undefined} */
  #tail;

  constructor() {}

  get head() {
    return this.#head;
  }
  get tail() {
    return this.#tail;
  }

  /**
   * @param {number} value
   */
  push(value) {
    let node = new StackNode(value, this.#head, undefined);

    if (!this.#tail) this.#tail = node;
    if (this.#head) this.#head.next = node;

    this.#head = node;

    return node;
  }

  /**
   * @param {StackNode | undefined} node
   */
  delete(node) {
    let prev = node?.prev;
    let next = node?.next;

    if (node == this.#tail) {
      this.#tail = next;
    }
    if (node == this.#head) {
      this.#head = prev;
    }

    if (prev) {
      prev.next = next;
    }
    if (next) {
      next.prev = prev;
    }

    return node;
  }

  get elements() {
    let next = this.#tail;

    /**@type {StackNode[]} */
    let elements = [];

    while (next) {
      elements.push(next);
      next = next.next;
    }

    return elements;
  }
}
