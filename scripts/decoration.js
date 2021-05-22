let root = "./preview/thumbnail/"
    //each flavor has pictures of n images
    //under the root directory
let source = {
    'l': 4,
    'm': 6,
    's': 8
}

class Leaf {
    constructor(img) {
        let reference = Math.max(globals['width'], globals['height']);
        this.baseSize = Math.min(1024, reference * 0.8);
        let flavor = "llmmss".charAt(Math.floor(Math.random() * 6)).toString();
        this.src = root + flavor + Math.floor(Math.random() * source[flavor] + 1) + '.png';
        //exclude bottom left corner
        let corner = Math.floor(Math.random() * 3);
        let dev = (this.baseSize / -2) + 'px';

        this.img = img;
        switch (corner) {
            case 0:
                this.img.style.left = dev;
                this.img.style.top = dev;
                break;
            case 1:
                this.img.style.right = dev;
                this.img.style.top = dev;
                break;
            case 2:
                this.img.style.right = dev;
                this.img.style.bottom = dev;
                break;
        }
        this.img.style.width = this.baseSize + 'px';
        this.img.style.height = this.img.style.width;
        if (!globals['isMobile']) {
            this.img.onmouseover = () => {
                this.img.style.width = (this.baseSize - 5) + 'px';
                this.img.style.height = this.img.style.width;
            }
            this.img.onmouseout = () => {
                this.img.style.width = (this.baseSize) + 'px';
                this.img.style.height = this.img.style.width;
            }
        }
        this.img.src = this.src;
    }
}

let collection = [];

async function initLeaves() {
    collection = [];
    let leaves = document.querySelectorAll(".deco.leaf");
    for (let i = 0; i < leaves.length; i++) {
        collection.push(new Leaf(leaves[i]));
    }
}