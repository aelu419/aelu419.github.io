/**
 * exhibit slabs on the right should do two things
 * 1. when peeked (navigation link hovered or itself hovered), protrude slightly
 * 2. when selected (navigation link clicked or itself clicked), show completely
 */


let narrowHeaderMinPadding = 3;
let showSlabPadding = 20;

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
        /*
            note that full width does not include 'px', although it is measured in px
            this is for using it numerically elsewhere on the site
            ex. blocks
         */
        "full": () => {
            let max_hook_width = 0;
            for (let i = 0; i < globals['slabs'].length; i++) {
                let h = globals['slabs'][i].hook;
                if (h.clientWidth > max_hook_width) {
                    max_hook_width = h.clientWidth;
                }
            }
            if (globals['isMobile'] || globals['width'] < globals['height']) {
                return globals['width'] - 1 * max_hook_width - 2 * (showSlabPadding + narrowHeaderMinPadding); // 40 is for padding
            } else {
                return globals['width'] - 2 * max_hook_width - 2 * showSlabPadding;
            }
        },
        "peek": "1in",
        "hide": "0",
        "disappear": "0"
    };

    HOOK_ACCENT_COLOR = 'rgb(124, 145, 103)';

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
        //hide all other slabs
        for (let i = 0; i < globals['slabs'].length; i++) {
            let s = globals['slabs'][i];
            if (s !== this) {
                s.hide();
            }
        }

        switch (this.name) {
            case "projects":
                populateProjects(this.content, this.WIDTHS['full']());
                break;
            case "experiments":
                //this.content.style.padding = "5%";
                populateExperiments(this.content, this.WIDTHS['full']());
                break;
            case "about":
                populateAbout(this.content, this.WIDTHS['full']());
                break;
            default:
                console.log(this.name + " slab does not have any populate method");
        }

        //show current slab
        this.showing = true;
        globals['significant'] = this;
        this.content.style.width = this.WIDTHS['full']() + 'px';
        this.content.style.maxWidth = this.WIDTHS['full']() + 'px';
        this.content.style.padding = showSlabPadding + 'px';
        this.content.style.cursor = 'default';

        //set hook to accent color
        this.hook.style.color = this.HOOK_ACCENT_COLOR;
        window.minimizeHeader();
    };

    /**
     * hide the slab entirely
     */
    hide() {
        if (globals['significant'] === this) {
            globals['significant'] = null;
        }
        this.showing = false;
        this.content.innerHTML = '';
        this.content.style.cursor = 'pointer';
        this.content.style.padding = '0';
        this.content.style.width = this.WIDTHS['hide'];

        switch (this.name) {
            case "projects":
                break;
            case "experiments":
                //this.content.style.padding = "0";
                break;
            default:
                break;
        }

        //set hook to default color
        this.hook.style.color = document.getElementsByTagName('body')[0].style.color;
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

    resize() {
        if (this.showing) {
            this.content.style.width = this.WIDTHS['full']() + 'px';
        }
    }
}