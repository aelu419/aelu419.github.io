/**
 * global variables
 */
globals = {
    // overall display vars
    "width": 0,
    "height": 0,
    "pixelDensity": 1,
    "isMobile": false,
    // slabs
    "slabs": [], // slabs on the right
    "significant": null,
    // header related
    "header": null, // navigation panel on the left
    "headerText": null, // the div holding all the non-hook text in the panel
    // pond related
    "pondContext": null
};

window.onmousemove = ev => updateMouse(ev);
window.mobileCheck = function() {
    let check = false;
    (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


/**
 * when minimized header: let l = longest hook
 * 0 ~ 0.5h is left margin
 * 0.5h ~ 1.5h are hooks
 * 1.5h ~ 2.0h is right margin (between hooks and slab)
 */
window.minimizeHeader = function() {
    let hd = globals["header"];
    if (hd !== null) {
        // set left margin of panel according to longest hook width
        let max_hook_width = 0;
        for (let i = 0; i < globals["slabs"].length; i++) {
            let h = globals["slabs"][i].hook;
            if (h.clientWidth > max_hook_width) {
                max_hook_width = h.clientWidth;
            }
        }
        hd.style.marginLeft = (max_hook_width / 2.0).toString() + "px";

        // crop panel text based on longest hook width. This includes the right hook margin
        // in total, it is 1.5 * longest hook
        globals["headerText"].style.width = (1.5 * max_hook_width).toString() + "px";
    }
}

window.normalizeHeader = function() {
    let hd = globals["header"];
    if (hd !== null) {
        hd.style.marginLeft = "15%";
        let header_texts = document.querySelectorAll("#header_text *");
        let max_header_text_content_width = 0;
        for (let i = 0; i < header_texts.length; i++) {
            max_header_text_content_width = Math.max(header_texts[i].clientWidth, max_header_text_content_width);
        }
        globals["headerText"].style.width = max_header_text_content_width.toString() + "px";
    }
}

window.onresize = function() {
    globals["width"] = window.innerWidth;
    globals["height"] = window.innerHeight;
    globals["isMobile"] = window.mobileCheck();
    globals["pixelDensity"] = window.devicePixelRatio;

    //resize all slabs
    for (let i = 0; i < globals["slabs"].length; i++) {
        globals["slabs"][i].resize();
    }

    if (globals["significant"] !== null) {
        window.minimizeHeader();
    }

    if (globals["pondContext"].canvas !== null) {
        globals["pondContext"].canvas.width = Math.ceil(globals["width"] * globals["pixelDensity"]);
        globals["pondContext"].canvas.height = Math.ceil(globals["height"] * globals["pixelDensity"]);
    }
};

/**
 * upon page load:
 * 1. fetch necessary elements and construct objects
 * 2. initialize global variables
 * 3. kickstart processes
 */
window.onload = function() {

    // fetch all slabs
    // event registrations are handled within the Slab class
    let hooks = document.getElementsByClassName("hook");
    for (let i = 0; i < hooks.length; i++) {
        let slab = document.getElementById(hooks[i].innerText);
        if (slab !== null) {
            globals["slabs"].push(new Slab(hooks[i], slab));
        } else {
            console.log("slab called " + hooks[i].innerText + " cannot be found");
        }
    }

    // initialize header
    globals["header"] = document.getElementById("header");
    globals["headerText"] = document.getElementById("header_text");
    window.normalizeHeader();

    // fetch canvas
    globals["pondContext"] = document.getElementById("background").getContext("2d");

    // initialize element dimensions
    window.onresize();

    // start pond animation
    startAnimation();
};