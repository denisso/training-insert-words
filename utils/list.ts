class Node<T> {
  value: T;
  next: Node<T> | null;
  prev: Node<T> | null;
  constructor(value: T) {
    this.value = value;
    this.next = this.prev = null;
  }
}

export default class List<T> {
  length: number;
  tail: Node<T> | null = null;
  head: Node<T> | null = null;
  constructor() {
    this.length = 0;
  }
  append(value: T) {
    this.length++;
    const tail = new Node(value);
    if (this.tail) {
      tail.prev = this.tail;
      this.tail.next = tail;
    }
    this.tail = tail;
    return tail;
  }
  remove(node: Node<T>) {
    this.length--;

    if (node === this.head) {
      this.head = node.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
    } else if (node === this.tail) {
      this.tail = node.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
    } else {
      if (node.prev) {
        node.prev.next = node.next;
      }
      if (node.next) {
        node.next.prev = node.prev;
      }
    }
  }
}
