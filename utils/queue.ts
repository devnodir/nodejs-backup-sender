class Queue {
	constructor() {
		this.queue = [];
	}

	enqueue(element: any) {
		return this.queue.push(element);
	}

	dequeue() {
		if (this.queue.length > 0) {
			return this.queue.shift();
		}
	}

	peek() {
		return this.queue[0];
	}

	size() {
		return this.queue.length;
	}

	isEmpty() {
		return this.queue.length == 0;
	}

	clear() {
		this.queue = [];
	}

	queue: any[];
}
export default Queue;
