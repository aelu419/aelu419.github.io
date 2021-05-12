/**
 * exhibit slabs on the right should do two things
 * 1. when peeked (navigation link hovered or itself hovered), protrude slightly
 * 2. when selected (navigation link clicked or itself clicked), show completely
 */


class Slab {
    /**
     * @param {Element} hook the list element that corresponds to the slab
     * @param {Element} content the slab itself
     */
    constructor(hook, content) {
        this.name = hook.innerText;
        this.hook = hook;
        this.content = content;
        this.hide();
        this.configure();
    }

    /**
     * register event listeners
     */
    configure = function() {
        this.content.addEventListener('mouseover', () => this.peek());
        this.hook.addEventListener('mouseover', () => this.peek());
        this.content.addEventListener('mouseout', () => this.unpeek());
        this.hook.addEventListener('mouseout', () => this.unpeek());
        this.content.addEventListener('click', () => this.show());
        this.hook.addEventListener('click', () => this.toggleHook());
    }

    WIDTHS = {
        "full": () => {
            let max_hook_width = 0;
            for (let i = 0; i < globals['slabs'].length; i++) {
                let h = globals['slabs'][i].hook;
                if (h.clientWidth > max_hook_width) {
                    max_hook_width = h.clientWidth;
                }
            }
            return (globals['width'] - 2 * max_hook_width).toString() + 'px';
        },
        "peek": "1in",
        "hide": "0.25in",
        "disappear": "0"
    };

    /**
     * peek at the slab
     */
    peek() {
        if (this.showing || globals['significant'] !== null) return;
        //console.log('peeking at ' + this.name);
        this.content.style.width = this.WIDTHS['peek'];
    }

    /**
     * stop peeking at the slab
     */
    unpeek() {
        if (this.showing) return;
        this.content.style.width = this.WIDTHS['hide'];
        //console.log('stopped peeking at ' + this.name);
    };

    /**
     * show the slab entirely
     */
    show() {
        if (this.showing) return;
        else this.showing = true;
        globals['significant'] = this;
        this.content.style.width = this.WIDTHS['full']();
        this.content.style.cursor = 'default';
        window.minimizeHeader();
        console.log('showing ' + this.name);
    };

    /**
     * hide the slab entirely
     */
    hide() {
        globals['significant'] = null;
        this.showing = false;
        this.content.innerHTML = '';
        this.content.style.cursor = 'pointer';
        this.content.style.width = this.WIDTHS['hide'];
        window.normalizeHeader();
        //console.log('hiding ' + this.name);
    };

    /**
     * toggle hook
     * - when the significant slab is not the current one, replace it with the current one
     * - otherwise, hide the current slab
     */
    toggleHook() {
        if (globals['significant'] === this) {
            this.hide();
        } else {
            if (globals['significant'] !== null) {
                globals['significant'].hide();
            }
            this.show();
        }
    }
}