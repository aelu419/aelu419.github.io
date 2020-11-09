var w, h;
//layout related
var myCanvas;
var myContext;
var myRect;
var myHeader;
var myHeaderContent;

var leafs;

var pixelDensity;

//a leaf decoration object for size adjustment
class Leaf {
  constructor(obj, px_size, left, top) {
    this.obj = obj;
    this.size = px_size;
    this.left = left;
    this.top = top;
  }

  adjust() {
    //dimension in screen px = device px / (device px per screen px)
    this.obj.style.width = Math.floor(this.size / pixelDensity).toString()+"px";
    this.obj.style.left = Math.floor(this.left / pixelDensity).toString()+"px";
    this.obj.style.top = Math.floor(this.top / pixelDensity).toString()+"px";
  }

  toString() {
    return this.size;
  }
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
    myCanvas.width = w * pixelDensity;
    myCanvas.height = h * pixelDensity;
    console.log("new canvas dimensions: " + myCanvas.width, myCanvas.height);
}

function updateDecorationDPI() {
  for (let i = 0; i < leafs.length; i++) {
    leafs[i].adjust();
  }
}

function initPage() {

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
    myBody = document.getElementById("body");
    let hoverHint = document.getElementById("hover_hint");

    //loaded correctly
    if (myCanvas && myContext && myHeader && myHeaderContent && myBody && hoverHint) {

      //get screen properties
      if (isMobile) {
        pixelDensity = window.devicePixelRatio;
        //mute hover hint
        hoverHint.style.display = "none";
      } else {
        pixelDensity = 1;
      }

      //start size initialization
      updateHeaderDimensions();

      //update body dimensions
      if (isMobile) {
        //full sized body block
        myBody.style.margin = "0px";
        myBody.style.padding = "5px";
      } else {
        //some margins (adopt stylesheet.css settings)
        myBody.style.borderRadius = "0px";
      }

      //mute everything related to hovering
      const hoverables = document.getElementsByClassName("content hovering_text");
      for (let i = 0; i < hoverables.length; i++) {
        hoverables[i].style.display = "none";
      }

      //grab leafs
      leafs = new Array();
      let leaf_objs_temp = document.getElementsByClassName("deco leaf");
      for (let i = 0; i < leaf_objs_temp.length; i++) {
        leafs.push(new Leaf(
          leaf_objs_temp[i],
          leaf_objs_temp[i].clientWidth,
          parseFloat(window.getComputedStyle(leaf_objs_temp[i],null).getPropertyValue("left")),
          parseFloat(window.getComputedStyle(leaf_objs_temp[i],null).getPropertyValue("top"))
        ));
        //console.log(parseFloat(window.getComputedStyle(leaf_objs_temp[i],null).getPropertyValue("left")),
        //parseFloat(window.getComputedStyle(leaf_objs_temp[i],null).getPropertyValue("top")));
      }

      updateDecorationDPI();

      //for upcoming resize
      window.addEventListener('resize', function() {
        updateHeaderDimensions();
      });
      myRect = myCanvas.getBoundingClientRect();
      //start shape-related stuff and kickstart animation
      startAnimation();
    }
    //something did not load into the document
    else {
      console.log("loading error");
    }
}
