export class MinHeap {
  constructor() {
    this.items = [];
  }
  get size() {
    return this.items.length;
  }

  push(value) {
    const items = this.items;
    items.push(value);
    let index = items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (items[parent].cost <= value.cost) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = value;
  }

  pop() {
    const items = this.items;
    const first = items[0];
    const last = items.pop();
    if (!items.length) return first;
    let index = 0;
    while (index * 2 + 1 < items.length) {
      let child = index * 2 + 1;
      if (child + 1 < items.length && items[child + 1].cost < items[child].cost) child++;
      if (items[child].cost >= last.cost) break;
      items[index] = items[child];
      index = child;
    }
    items[index] = last;
    return first;
  }
}
