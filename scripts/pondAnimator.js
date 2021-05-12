//controls related
pondvars = {
    'mouseX': 0,
    'mouseY': 0,
    'myFish': [],
    'fishNum': 6,
    'lastTargetUpdateTime]': null,
    'mobileMouse': null,
    'lastRefresh': null,
    'colors': [
        [237, 84, 38],
        [232, 208, 130],
        [72, 78, 82]
    ],
    'baseMSPerFrame': 16,
    // variables for canvas optimization: only clear necessary pixels
    'min': [0, 0],
    'max': [0, 0]
}

//random integer from min (inclusive) to max (exclusive)
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//each part of the Fish body
class FishChunk {

    finTilt = Math.PI * 1.5 / 2;

    constructor(location, size, alpha, velocity, finSize, color) {
        this.location = location;
        this.surfaceLocation = this.location.clone();
        this.size = size; //radius of the "chunk"
        this.alpha = alpha;
        this.velocity = velocity;
        this.finSize = finSize;
        this.color = color;
    }

    draw() {
        let ctx = globals['pondContext'];
        ctx.strokeStyle =
            "rgb(" +
            this.color[0] + ", " +
            this.color[1] + ", " +
            this.color[2] + "," +
            this.alpha + ")";
        ctx.fillStyle = ctx.strokeStyle;

        let x = this.location.x,
            y = this.location.y;


        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2, true);
        ctx.stroke();
        let drew_bounds = 10 + this.size;

        if (this.finSize !== 0) {
            let n = this.velocity.normalize();
            //has a fin
            let lDir = n.rotate(-1 * this.finTilt),
                rDir = n.rotate(this.finTilt);
            let lStem = this.location.add(lDir.mult(this.size)),
                rStem = this.location.add(rDir.mult(this.size));

            let theta = 0.8;
            let l1 = lStem.add(lDir.rotate(theta).mult(this.finSize)),
                l2 = lStem.add(lDir.rotate(-1 * theta).mult(this.finSize)),
                r1 = rStem.add(rDir.rotate(-1 * theta).mult(this.finSize)),
                r2 = rStem.add(rDir.rotate(theta).mult(this.finSize));

            ctx.beginPath();
            ctx.moveTo(l1.x, l1.y);
            ctx.lineTo(l2.x, l2.y);
            ctx.lineTo(r1.x, r1.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.closePath();
            ctx.stroke();

            drew_bounds = drew_bounds + this.finSize;

            /*
            ctx.beginPath();
            ctx.moveTo(lStem.x, lStem.y);
            ctx.lineTo(l1.x, l1.y);
            ctx.arc(lStem.x, lStem.y, this.finSize, lDir.angle() - theta, lDir.angle() + theta);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(rStem.x, rStem.y);
            ctx.lineTo(r1.x, r1.y);
            ctx.arc(rStem.x, rStem.y, this.finSize, rDir.angle() - theta, rDir.angle() + theta);
            ctx.stroke();*/
        }

        let minX = this.location.x - drew_bounds,
            minY = this.location.y - drew_bounds,
            maxX = this.location.x + drew_bounds,
            maxY = this.location.y + drew_bounds;

        pondvars['min'] = [
            Math.min(pondvars['min'][0], minX),
            Math.min(pondvars['min'][1], minY),
        ]

        pondvars['max'] = [
            Math.max(pondvars['max'][0], maxX),
            Math.max(pondvars['max'][1], maxY),
        ]
    }
}

class Fish {
    constructor(id) {
        //shape related
        let size_const = 1 + Math.random();
        this.chunks = new Array();
        this.numSeg = 25;
        let finPos = 0.2,
            finSize = 0.0625 * 96 * size_const,
            masterWidth = 0.0625 * 96 * globals['pixelDensity'] * size_const; //inch -> px defined as 1/96th of an inch
        this.color = pondvars['colors'][id % pondvars['colors'].length];

        //time related
        this.loopLength = Math.floor((20 + Math.random() * 10) * size_const); //the larger the Fish, the slower it moves
        this.fCount = Math.floor(Math.random() * this.loopLength);

        //force/movement related
        // - small elasticity means the fish respond less sensatively to the target
        this.elasticConstant = (0.00075 + Math.random() * 0.001) * size_const;
        // - small tilting means the fish wiggle less
        this.tilting = 0.4 * (1 + Math.random() / size_const);
        this.maxVel = (3 + Math.random() * 0.5) * size_const;

        //default location
        let seed = new Vec2(random(0, globals['width']), random(0, globals['height']));

        //add chunks to the Fish body
        for (let i = 0; i < this.numSeg; i++) {
            let t = i / this.numSeg;
            let fin = 0;
            if (t >= finPos && finSize != 0) {
                fin = finSize;
                finSize = 0;
            }

            this.chunks.push(new FishChunk(
                seed.clone(), //location
                masterWidth * Math.abs(
                    Math.cos(
                        Math.PI * t / 1.1 - 0.5
                    )
                ), //size formula
                1.0 * Math.abs(Math.sin(Math.PI / 1 * t)), //alpha formula
                new Vec2(0, 0), //velocity
                fin, // fin size
                this.color, //Fish color
            ));
        }
    }

    draw() {
        //frame count
        this.fCount = (this.fCount + 1) % this.loopLength;
        let t = this.fCount / this.loopLength; //"progress of current thing within a loop"

        for (let i = this.chunks.length - 1; i >= 0; i--) {
            let temp = this.chunks[i];
            //handle each chunk individually
            // - update fin wiggling
            if (temp.finSize !== 0)
                temp.finTilt = Math.PI / 1.5 + 0.6 * Math.sin(2 * Math.PI * t);

            //only draw half of the fish to save time
            if (temp.finSize !== 0 || i % 1 == 0) {
                temp.draw();
            }
        }

        //moving & interaction of the head
        let target
        if (globals['isMobile']) {
            //one phone the program is controlled by random target points
            target = new Vec2(pondvars['mobileMouse'].x, pondvars['mobileMouse'].y);
        } else {
            //on computer the program is controlled by mouse
            target = new Vec2(pondvars['mouseX'], pondvars['mouseY']);
        }
        let headToTarget = target.subtract(this.chunks[0].location);

        //two types of forces
        // 1. the "drag" from the user
        let influence = headToTarget.mult(this.elasticConstant);
        //influence = influence.add(this.gravity);
        // 2. the twisting motion of the Fish head itself
        let headTwist = headToTarget.rotate(Math.PI / 2).normalize().mult(Math.cos(2 * Math.PI * t) * this.tilting);

        this.chunks[0].velocity = this.chunks[0].velocity.add(influence);
        this.chunks[0].velocity = this.chunks[0].velocity.add(headTwist);

        /*
        handle edge cases
         */
        if (this.chunks[0].location.y > globals['pondContext'].canvas.height) {
            this.chunks[0].velocity.y = Math.min(-1 * this.chunks[0].velocity.y,
                this.chunks[0].velocity.y
            );
        }
        if (this.chunks[0].location.y < 0) {
            this.chunks[0].velocity.y = Math.max(-1 * this.chunks[0].velocity.y,
                this.chunks[0].velocity.y
            );
        }
        if (this.chunks[0].location.x > globals['pondContext'].canvas.width) {
            this.chunks[0].velocity.x = Math.min(-1 * this.chunks[0].velocity.x,
                this.chunks[0].velocity.x
            );
        }
        if (this.chunks[0].location.x < 0) {
            this.chunks[0].velocity.x = Math.max(-1 * this.chunks[0].velocity.x,
                this.chunks[0].velocity.x
            );
        }

        //update head motion
        this.chunks[0].velocity = this.chunks[0].velocity.clampMax(this.maxVel)
        this.chunks[0].location = this.chunks[0].location.add(this.chunks[0].velocity);
        this.chunks[0].surfaceLocation = this.chunks[0].location;

        /*
        propagate motion down through the body
        */
        //body movement
        for (let i = this.chunks.length - 1; i > 0; i--) {
            this.chunks[i].velocity = this.chunks[i - 1].velocity.clone();
        }
        for (let i = 1; i < this.chunks.length; i++) {
            this.chunks[i].location = this.chunks[i].location.add(this.chunks[i].velocity);
        }

        //reset mobile mode target if necessary
        if (globals['isMobile']) {
            //spawn new target when this target is reached by one of the Fish
            if (this.chunks[0].location.add(pondvars['mobileMouse'].mult(-1)).norm() <= 150 ||
                pondvars['lastRefresh'] - pondvars['lastTargetUpdateTime'] > 3000) { //spawn new target per 3 seconds
                updateTarget();
            }
        }
    }
}

//update mouse position from the head div
function updateMouse(e) {
    pondvars['mouseX'] = e.clientX;
    pondvars['mouseY'] = e.clientY;
}

//main draw function
function drawFish() {
    let tTemp = Date.now();
    if (pondvars['max'][0] === 0)
        globals['pondContext'].clearRect(0, 0, globals['pondContext'].canvas.width, globals['pondContext'].canvas.height);
    else
        globals['pondContext'].clearRect(
            pondvars['min'][0], pondvars['min'][1],
            pondvars['max'][0] - pondvars['min'][0], pondvars['max'][1] - pondvars['min'][1],
        )

    /*
    globals['pondContext'].strokeStyle = 'rgb(0, 0, 0)';
    globals['pondContext'].strokeRect(pondvars['min'][0], pondvars['min'][1],
        pondvars['max'][0] - pondvars['min'][0], pondvars['max'][1] - pondvars['min'][1], )
    */
    pondvars['min'] = [1000000, 1000000];
    pondvars['max'] = [0, 0];
    for (let i = 0; i < pondvars['myFish'].length; i++) {
        pondvars['myFish'][i].draw();
    }

    //frame update too fast, wait until next fixed interval
    //console.log(tTemp - pondvars['lastRefresh']);
    if (tTemp - pondvars['lastRefresh'] < pondvars['baseMSPerFrame']) {
        setTimeout(drawFish, pondvars['baseMSPerFrame'] - (tTemp - pondvars['lastRefresh']));
        return;
    } else { //frame update slow, start immediately
        pondvars['lastRefresh'] = tTemp;
        window.requestAnimationFrame(drawFish);
    }
}

//only called when the page is ran on mobile
function updateTarget() {
    //the constant terms is to make sure the target doesn't spawn at the borders
    pondvars['mobileMouse'] = new Vec2(
        Math.random() * (globals['width'] * globals['pixelDensity'] - 200) + 100,
        Math.random() * (globals['height'] * globals['pixelDensity'] - 200) + 100
    );
    console.log("target updated at " + pondvars['mobileMouse'].toString())
    pondvars['lastTargetUpdateTime'] = Date.now();
}

//initialize variables and kick start animation
function startAnimation() {
    //decide which mode of control to use
    if (globals['isMobile']) {
        updateTarget();
    }
    //initialize a bunch of Fish
    for (let i = 0; i < pondvars['fishNum']; i++) {
        pondvars['myFish'].push(new Fish(i));
    }
    //start animation
    pondvars['lastRefresh'] = Date.now();
    pondvars['lastTargetUpdateTime'] = Date.now();
    drawFish();
}