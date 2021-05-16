class NodeWrapper {
    constructor(node, extra) {
        this.node = node;
        this.extra = extra;
    }

    getExtra(key) {
        if (this.extra !== null && key in this.extra) {
            return this.extra[key];
        } else {
            console.log(key + ' is not in the extra data of ' + this);
            return null;
        }
    }
}

class ListenerWrapper {
    constructor(type, callback) {
        this.type = type;
        this.callback = callback;
    }
}

class MediaWrapper {
    constructor(vid, trigger) {
        this.vid = vid; //the video tag itself (or a video DOM obj)
        this.trigger = trigger; //trigger reacts to mouse controls
        this.listeners = [];
    }

    /**
     * wrapper function for Element's addEventListner
     * @param type 
     * @param callback 
     */
    addEventListener(type, callback) {
        if (callback !== null) {
            this.trigger.addEventListener(type, callback);
            this.listeners.push(new ListenerWrapper(type, callback));
        } else {
            console.log('null callback cannot be added');
        }
        //console.log(this.listeners);
    }

    clearEventListeners() {
        for (let i = 0; i < this.listeners.length; i++) {
            this.trigger.removeEventListener(
                this.listeners[i].type,
                this.listeners[i].callback
            )
        }
        this.listeners = [];
    }
}