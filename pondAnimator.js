var w=-1, h; //dimention of canvas, w is set to negative to
             //force rawContentHeight refresh during onload
var mouseX = 0;
var mouseY = 0;
const myFish = new Array();
var fishNum = 3;

//layout related
var myCanvas;
var myContext;
var myRect;
var myHeader;
var myHeaderContent;

//display related
var lastFrameTime;
var isMobile = false;

//animation mechanics related
var mobileMouseSubstitute;

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
    myContext.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";

    myContext.beginPath();
    myContext.arc(this.location.x, this.location.y,
      this.size, 0, Math.PI * 2, true);

    myContext.fill();

    if (this.finSize != 0) {
      //has a fin
      let leftward = this.velocity.rotate(Math.PI / 2).normalize();
      let rightward = this.velocity.rotate(Math.PI / -2).normalize();

      let front = this.velocity.normalize().mult(this.size);

      leftward = leftward.mult(this.finSize).add(this.location).add(front.mult(-1));
      rightward = rightward.mult(this.finSize).add(this.location).add(front.mult(-1));

      front = front.add(this.location);

      myContext.beginPath();
      myContext.moveTo(front.x, front.y);
      myContext.lineTo(leftward.x, leftward.y);
      myContext.lineTo(this.location.x, this.location.y);
      myContext.lineTo(rightward.x, rightward.y);
      myContext.lineTo(front.x, front.y);
      myContext.fill();
    }
  }
}

class fish {
  constructor() {
    //shape related
    this.chunks = new Array();
    this.numSeg = 20;
    this.finSize = [8, 6];
    this.masterWidth = 0.4;

    //time related
    this.fCount = 0 + random(0, 30);
    this.loopLength = 30 + random(-20, 20);

    //force/movement related
    this.elasticConstant = 0.001 + Math.random() * 0.001;
    this.gravity = new Vec2(-0.00001, 0);
    this.tilting = 0.1 + Math.random() * 0.1;
    this.maxVel = 3+ Math.random() * 0.2;

    //default location
    let seed = new Vec2(random(0, w), random(0, h));

    //add chunks to the fish body
    for (let i = 0; i < this.numSeg; i++) {

      //decide if current chunk has fin
      let hasFin = 0;
      if (Math.floor(i / this.numSeg * 10) / 10 == 0.2) {
        hasFin = 1;
      } else if (Math.floor(i / this.numSeg * 10) / 10 == 0.6) {
        hasFin = 2;
      }

      let t = i/this.numSeg

      this.chunks.push(new fishChunk(
        seed.clone(), //location
        this.masterWidth * Math.pow((i - this.numSeg * 1.4) / (0.5 * this.numSeg), 2), //size formula
        1.0 * Math.cos(Math.PI / 2 * t), //alpha formula
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
    for (let i = this.chunks.length - 1; i > 0; i--){
      this.chunks[i].velocity = this.chunks[i-1].velocity.clone();
    }

    //moving & interaction of the head
    let target
    if (isMobile) {
      //one phone the program is controlled by random target points
      target = new Vec2(mobileMouseSubstitute.x, mobileMouseSubstitute.y);
    } else {
      //on computer the program is controlled by mouse
      target = new Vec2(mouseX, mouseY);
    }
    let headToTarget = target.add(this.chunks[0].location.mult(-1));

    //two types of forces
    let influence = headToTarget.mult(this.elasticConstant); //the "drag" from the user
    //influence = influence.add(this.gravity);
    let headTwist = headToTarget.clone(); //the twisting motion of the fish head itself
    headTwist = headTwist.rotate(Math.PI / 2).normalize().mult(Math.cos(2 * Math.PI * t) * this.tilting);

    this.chunks[0].velocity = this.chunks[0].velocity.add(influence);
    this.chunks[0].velocity = this.chunks[0].velocity.add(headTwist);

    if (this.chunks[0].location.y > h) {
      this.chunks[0].velocity.y = Math.min(
        -1 * this.chunks[0].velocity.y,
        this.chunks[0].velocity.y
      );
    }
    if (this.chunks[0].location.y < 0) {
      this.chunks[0].velocity.y = Math.max(
        -1 * this.chunks[0].velocity.y,
        this.chunks[0].velocity.y
      );
    }
    if (this.chunks[0].location.x > w) {
      this.chunks[0].velocity.x = Math.min(
        -1 * this.chunks[0].velocity.x,
        this.chunks[0].velocity.x
      );
    }
    if (this.chunks[0].location.x < 0) {
      this.chunks[0].velocity.x = Math.max(
        -1 * this.chunks[0].velocity.x,
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
    if(isMobile) {
      if (this.chunks[0].location.add(mobileMouseSubstitute.mult(-1)).norm() <= 50){
        updateTarget();
      }
    }
  }
}

//update mouse position from the head div
function updateMouse(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

//main draw function
function drawFish() {
  let tTemp = Date.now();
  myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
  for (let i = 0; i < myFish.length; i++) {
    myFish[i].draw();
  }

  //frame update too fast
  if (tTemp - lastFrameTime < 17) {
    //wait till frame passes
    setTimeout(function () {
      window.requestAnimationFrame(function(){drawFish();});
    }, 17 - (tTemp - lastFrameTime) );
    return;
  } else { //frame update slower than 60 fps
    lastFrameTime = tTemp;
    window.requestAnimationFrame(function(){drawFish();});
  }
}

//only called when the page is ran on mobile
function updateTarget() {
  mobileMouseSubstitute = new Vec2(
    Math.random() * w,
    Math.random() * h
  );
  console.log("target updated at " + mobileMouseSubstitute.toString())
}

//initialize variables and kick start animation
function init() {
  //decide which mode of control to use
  if (isMobile) {
    updateTarget();
  }
  //initialize a bunch of fish
  for (let i = 0; i < fishNum; i++) {
    myFish.push(new fish());
  }
  //start animation
  lastFrameTime = Date.now();
  drawFish();
}

//called during onload and every resize event
function updateHeaderDimensions() {
    console.log('header dimensions updated');

    //w is always updated to the full width of the window
    w = myHeader.clientWidth;

    let headerProportion;

    //mobile page prefers small header if it is sufficient to display everything
    if (isMobile) {
      headerProportion = 1.0/3.0;
    }
    //computer page prefers full screen
    else {
      headerProportion = 1.0;
    }

    let currHeight = myHeaderContent.clientHeight
      - parseFloat(window.getComputedStyle(myHeaderContent, null).getPropertyValue('padding-top'))
      - parseFloat(window.getComputedStyle(myHeaderContent, null).getPropertyValue('padding-bottom'));
    let minHeight = Math.floor(window.innerHeight * headerProportion);

    if (currHeight > minHeight) {
      //min height does not provide enough space to display header content
      //header height will not be adjusted
      h = currHeight;
      myHeader.style.minHeight = minHeight+"px";
    } else {
      //min height is sufficient for displaying the header contents
      let h_content = myHeaderContent.offsetHeight;
      let diff = minHeight - h_content;

      //content top margin should be at least as tall as bottom margin
      myHeaderContent.style.marginTop = Math.max(
        Math.floor(diff/2),
        myHeaderContent.style.marginBottom
      ).toString()+"px";

      h = minHeight;
      myHeader.style.height = minHeight+"px";
    }

    //decide if display downarrow or not, depending on how much space is left
    //after displaying header content
    const downArr = document.getElementById("downIcon");
    if (downArr) {
      if (currHeight - minHeight > -100) {
        //in this case, a down arrow is not needed for hinting
        downArr.style.display = "none";
      } else {
        //show the down arrow
        downArr.style.display = "inline";
      }
    }

    //set dimensions of canvas element
    myCanvas.width = w;
    myCanvas.height = h;
}

//entry point for this script
function startAnimation() {

  window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

  isMobile = window.mobileCheck();

  //fetch UI elements
  myCanvas = document.getElementById("pond");
  myContext = myCanvas.getContext('2d');
  myHeader = document.getElementById("header");
  myHeaderContent = document.getElementById("header_content");

  //loaded correctly
  if (myCanvas && myContext && myHeader && myHeaderContent) {
    //start size initialization
    updateHeaderDimensions();

    //for upcoming resize
    window.addEventListener('resize', function() {
      updateHeaderDimensions();
    });
    myRect = myCanvas.getBoundingClientRect();
    //start shape-related stuff and kickstart animation
    init();
  }
  //something did not load into the document
  else {
    console.log("loading error");
  }
}
