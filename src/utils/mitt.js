import mitt from "mitt";

const emitter = mitt()

class Emitter {
    _id = null

    constructor(id) {
        this._id = id
    }

    send(type, name, ...args) {
        emitter[type](`${this._id}__${name}`, ...args)
    }

    on() {
        this.send('on', ...arguments)
    }

    emit() {
        this.send('emit', ...arguments)
    }

    off() {
        this.send('off', ...arguments)
    }
}

export default Emitter