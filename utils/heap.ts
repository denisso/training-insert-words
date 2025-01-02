export function comparatorMin<T>(a: T, b: T) {
  return a < b;
}

export function comparatorMax<T>(a: T, b: T) {
  return a > b;
}

export default class UHeap<T> {
  private heap: T[];
  private comparator: (a: T, b: T) => boolean;
  constructor(comparator: (a: T, b: T) => boolean) {
    this.heap = [];
    this.comparator = comparator;
  }
  insert(value: T) {
    this.heap.push(value);
    this.heapifyUp();
  }
  heapifyUp() {
    let currentIndex = this.heap.length - 1;
    while (currentIndex > 0) {
      const parentIndex = (currentIndex - 1) >> 1;
      if (this.comparator(this.heap[currentIndex], this.heap[parentIndex])) {
        const temp = this.heap[currentIndex];
        this.heap[currentIndex] = this.heap[parentIndex];
        this.heap[parentIndex] = temp;
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }
  remove() {
    const max = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    this.heapifyDown();
    return max;
  }
  heapifyDown() {
    let currentIndex = 0;
    while (true) {
      const leftChildIndex = (currentIndex << 1) + 1;
      const rightChildIndex = (currentIndex << 1) + 2;
      let smallestChildIndex = currentIndex;
      if (
        leftChildIndex < this.heap.length &&
        this.comparator(
          this.heap[leftChildIndex],
          this.heap[smallestChildIndex]
        )
      ) {
        smallestChildIndex = leftChildIndex;
      }
      if (
        rightChildIndex < this.heap.length &&
        this.comparator(
          this.heap[rightChildIndex],
          this.heap[smallestChildIndex]
        )
      ) {
        smallestChildIndex = rightChildIndex;
      }
      if (currentIndex !== smallestChildIndex) {
        const temp = this.heap[currentIndex];
        this.heap[currentIndex] = this.heap[smallestChildIndex];
        this.heap[smallestChildIndex] = temp;
        currentIndex = smallestChildIndex;
      } else {
        break;
      }
    }
  }
  size() {
    return this.heap.length;
  }
  peak() {
    return this.heap[0];
  }
}
