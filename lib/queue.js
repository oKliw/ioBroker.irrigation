function Queue() {
    this.queue = [];

    var run = function () {
        let item = this.queue.shift();
        if(item) {
            item.callback();
        }
    };

    this.enqueue = function (owner, callback) {
        let isFirst = this.queue.length < 1;
        let found = false;
        for(let i = 0; i < this.queue.length; i++) {
            let item = this.queue[i];
            if(item.owner === owner){
                found = true;
                break;
            }
        }

        if(found === false) {
            this.queue.push({owner: owner, callback: callback});
        }

        if(isFirst) {
            run();
        }
    };

    this.dequeue = function (owner) {
        let index = null;
        for(let i = 0; i < this.queue.length; i++) {
            if(this.queue[i] === owner) {
                index = i;
                break;
            }
        }

        if(index) {
            this.queue.splice(index, 1);
        }

        run();
    }
}

module.exports = Queue;