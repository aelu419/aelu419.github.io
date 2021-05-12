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

    add(other) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }
    mult(scalar) {
        return new Vec2(this.x * scalar, this.y * scalar);
    }
    set(l) {
        return this.normalize().mult(l);
    }
    dot(other) {
        return other.x * this.x + other.y * this.y;
    }
    normalize() {
        let temp = this.norm();
        if (temp == 0) {
            return this.clone();
        }
        return new Vec2(this.x / temp, this.y / temp);
    }
    clampMin(min) {
        let n = this.norm();
        if (n < min) {
            return this.set(min);
        } else {
            return this.clone();
        }
    }
    clampMax(max) {
        let n = this.norm();
        if (n > max) {
            return this.set(max);
        } else {
            return this.clone();
        }
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