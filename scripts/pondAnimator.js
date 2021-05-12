//controls related
pondvars = {
    'mouseX': 0,
    'mouseY': 0,
    'myFish': [],
    'fishNum': 3,
    'lastTargetUpdateTime]': null,
    'mobileMouse': null,
    'lastRefresh': null,
}

//random integer from min (inclusive) to max (exclusive)
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//simple 2d vector class, expand if necessary
//all the class methods do not modify the vector itself,
//and creates another vector
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    //rotate counter clockwise
    rotate(theta) {
        return new Vec2(
            Math.cos(theta) * this.x - Math.sin(theta) * this.y,
            Math.sin(theta) * this.x + Math.cos(theta) * this.y
        );
    }

    //add to vector
    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    mult(scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    }
    dot(other) {
        return other.x * this.x + other.y * this.y;
    }
    normalize() {
        let temp = this.norm();
        return new Vec2(this.x / temp, this.y / temp);
    }
    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    angleFrom(other) {
        return this.angle() - other.angle();
    }

    distFrom(other) {
        return this.add(other.mult(-1)).norm();
    }

    toString() {
        return "(" + this.x + "," + this.y + ")";
    }
}

//each part of the fish body
class fishChunk {
    constructor(location, size, alpha, velocity, finSize) {
        this.location = location;
        this.size = size; //radius of the "chunk"
        this.alpha = alpha;
        this.velocity = velocity;
        this.finSize = finSize;
    }

    draw() {
        let ctx = globals['pondContext'];
        ctx.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";

        ctx.beginPath();
        ctx.arc(this.location.x, this.location.y,
            this.size, 0, Math.PI * 2, true);

        ctx.fill();

        if (this.finSize != 0) {
            //has a fin
            let leftward = this.velocity.rotate(Math.PI / 2).normalize();
            let rightward = this.velocity.rotate(Math.PI / -2).normalize();

            let front = this.velocity.normalize().mult(this.size);

            leftward = leftward.mult(this.finSize).add(this.location).add(front.mult(-1));
            rightward = rightward.mult(this.finSize).add(this.location).add(front.mult(-1));

            front = front.add(this.location);

            ctx.beginPath();
            ctx.moveTo(front.x, front.y);
            ctx.lineTo(leftward.x, leftward.y);
            ctx.lineTo(this.location.x, this.location.y);
            ctx.lineTo(rightward.x, rightward.y);
            ctx.lineTo(front.x, front.y);
            ctx.fill();
        }
    }
}

class fish {
    constructor() {
        //shape related
        this.chunks = new Array();
        this.numSeg = 20;
        this.finSize = [5, 3];
        this.masterWidth = 0.4;

        //time related
        this.fCount = 0 + random(0, 30);
        this.loopLength = 30 + random(-20, 20);

        //force/movement related
        this.elasticConstant = 0.001 + Math.random() * 0.001;
        this.gravity = new Vec2(-0.00001, 0);
        this.tilting = 0.1 + Math.random() * 0.1;
        this.maxVel = 3 + Math.random() * 0.2;

        //default location
        let seed = new Vec2(random(0, globals['width']), random(0, globals['height']));

        //add chunks to the fish body
        for (let i = 0; i < this.numSeg; i++) {

            //decide if current chunk has fin
            let hasFin = 0;
            if (Math.floor(i / this.numSeg * 10) / 10 == 0.2) {
                hasFin = 1;
            } else if (Math.floor(i / this.numSeg * 10) / 10 == 0.6) {
                hasFin = 2;
            }

            let t = i / this.numSeg

            this.chunks.push(new fishChunk(
                seed.clone(), //location
                this.masterWidth * Math.pow((i - this.numSeg * 1.4) / (0.5 * this.numSeg), 2), //size formula
                1.0 * Math.abs(Math.sin(Math.PI / 1 * t)), //alpha formula
                new Vec2(0, 0), //velocity
                hasFin != 0 ? this.finSize[hasFin - 1] : 0 //finSize
            ));
        }
    }

    draw() {
        //frame count
        this.fCount++;
        if (this.fCount > this.loopLength) {
            this.fCount = 0;
        }

        let t = this.fCount / this.loopLength; //"progress of current thing within a loop"

        for (let i = this.chunks.length - 1; i >= 0; i--) {
            let temp = this.chunks[i];
            //handle each chunk individually
            //drawing
            temp.draw();
        }

        //body movement
        for (let i = this.chunks.length - 1; i > 0; i--) {
            this.chunks[i].velocity = this.chunks[i - 1].velocity.clone();
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
        let headToTarget = target.add(this.chunks[0].location.mult(-1));

        //two types of forces
        let influence = headToTarget.mult(this.elasticConstant); //the "drag" from the user
        //influence = influence.add(this.gravity);
        let headTwist = headToTarget.clone(); //the twisting motion of the fish head itself
        headTwist = headTwist.rotate(Math.PI / 2).normalize().mult(Math.cos(2 * Math.PI * t) * this.tilting);

        this.chunks[0].velocity = this.chunks[0].velocity.add(influence);
        this.chunks[0].velocity = this.chunks[0].velocity.add(headTwist);

        if (this.chunks[0].location.y > globals['pondCanvas'].height) {
            this.chunks[0].velocity.y = Math.min(-1 * this.chunks[0].velocity.y,
                this.chunks[0].velocity.y
            );
        }
        if (this.chunks[0].location.y < 0) {
            this.chunks[0].velocity.y = Math.max(-1 * this.chunks[0].velocity.y,
                this.chunks[0].velocity.y
            );
        }
        if (this.chunks[0].location.x > globals['pondCanvas'].width) {
            this.chunks[0].velocity.x = Math.min(-1 * this.chunks[0].velocity.x,
                this.chunks[0].velocity.x
            );
        }
        if (this.chunks[0].location.x < 0) {
            this.chunks[0].velocity.x = Math.max(-1 * this.chunks[0].velocity.x,
                this.chunks[0].velocity.x
            );
        }

        if (this.chunks[0].velocity.norm() > this.maxVel) {
            this.chunks[0].velocity = this.chunks[0].velocity.normalize().mult(this.maxVel);
        }

        //update body location
        for (let i = 0; i < this.chunks.length; i++) {
            this.chunks[i].location = this.chunks[i].location.add(this.chunks[i].velocity);
        }

        //reset mobile mode target if necessary
        if (globals['isMobile']) {
            //spawn new target when this target is reached by one of the fish
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
    globals['pondContext'].clearRect(0, 0, globals['pondCanvas'].width, globals['pondCanvas'].height);
    for (let i = 0; i < pondvars['myFish'].length; i++) {
        pondvars['myFish'][i].draw();
    }

    //frame update too fast
    if (tTemp - pondvars['lastRefresh'] < 17) {
        //wait till frame passes
        setTimeout(function() {
            window.requestAnimationFrame(function() { drawFish(); });
        }, 17 - (tTemp - pondvars['lastRefresh']));
        return;
    } else { //frame update slower than 60 fps
        pondvars['lastRefresh'] = tTemp;
        window.requestAnimationFrame(function() { drawFish(); });
    }
}

//only called when the page is ran on mobile
function updateTarget() {
    //the constant terms is to make sure the target doesn't spawn at the borders
    pondvars['mobileMouse'] = new Vec2(
        Math.random() * (globals['width'] * pixelDensity - 200) + 100,
        Math.random() * (globals['height'] * pixelDensity - 200) + 100
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
    //initialize a bunch of fish
    for (let i = 0; i < pondvars['fishNum']; i++) {
        pondvars['myFish'].push(new fish());
    }
    //start animation
    pondvars['lastRefresh'] = Date.now();
    drawFish();
}