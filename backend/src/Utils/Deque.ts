export default class Deque<T>{
    public items: T[];

    constructor() {
        this.items = []
    }

    pushFront(item: T): void {
        this.items.unshift(item);
    }

    pushBack(item: T): void {
        this.items.push(item);
    }

    popFront(): T | undefined {
        return this.items.shift();
    }

    popBack(): T | undefined {
        return this.items.pop();
    }

    peekFront(): T | undefined {
        return this.items[0];
    }

    peekBack(): T | undefined {
        return this.items[this.items.length - 1];
    }

    size(): number {
        return this.items.length;
    }

    isEmpty(): boolean
    {
        return this.items.length === 0;
    }
}