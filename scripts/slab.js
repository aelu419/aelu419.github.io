let blockvars = {
    'majorHeight': 320,
    'minorHeight': 160,
}

let resLinks = {
    'thumbnails': './preview/thumbnail/',
    'videos': './preview/video/'
}

let cached = {
    'flavor': false,
    'projects': [],
    'experiments': [],
    'blogs': [],
    'about': []
}

function UrlExists(url, callback) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url);
    http.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            callback(this.status != 404);
        }
    };
    http.send();
}

async function load(vWrap, name, forceAutoplay) {
    vWrap.vid.autoplay = forceAutoplay || globals['isMobile'];
    if (vWrap.vid.readyState > 1)
        return;
    vWrap.addEventListener('error', (msg) => {
        console.log(msg);
    })
    let src = resLinks['videos'] + name + '.webm',
        poster = resLinks['thumbnails'] + name + '.jpeg';
    let initLoad = () => {
        //console.log('loading: ' + src);
        vWrap.vid.src = src;
        vWrap.vid.load();

        vWrap.clearEventListeners();

        if (!forceAutoplay) {
            vWrap.addEventListener('mouseover', e => {
                let playPromise = vWrap.vid.play();
                //console.log('playing: ' + name);
                if (playPromise != undefined) {
                    playPromise.then(_ => {})
                        .catch(error => {
                            console.log(error);
                        });
                }
            })

            vWrap.addEventListener('mouseout', e => {
                vWrap.vid.pause();
            })
        }
    };
    UrlExists(poster, (exists) => {
        if (exists) {
            vWrap.vid.poster = poster;
            UrlExists(src, (exists_) => {
                if (exists_) {

                    if (vWrap.vid.autoplay) {
                        initLoad();
                    } else {
                        vWrap.addEventListener('mouseover', initLoad);
                    }
                }
            })
        } else {
            initLoad();
        }
    })
}

function repopulateProjects(parent, mWidth) {
    for (let i = 0; i < cached['projects'].length; i++) {
        parent.append(cached['projects'][i].node);
    }
    let vids = parent.querySelectorAll('video');
    for (let i = 0; i < vids.length; i++) {
        let media = vids[i];
        if (globals['width'] >= globals['height']) {
            media.style.maxWidth = (0.5 * mWidth).toString() + 'px';
        } else {
            media.style.maxWidth = "100%";
        }
    }
}

function populateProjects(parent, mWidth) {
    let template = globals['projT'];
    let narrowOrNot = globals['width'] < globals['height'];
    if (narrowOrNot) {
        template = globals['projTN']
    }

    if (template === null) {
        return;
    }
    if (cached['projects'] !== null && cached['projects'].length > 0 && cached['flavor'] == narrowOrNot) {
        repopulateProjects(parent, mWidth);
        return;
    }

    cached['flavor'] = narrowOrNot;
    parent.innerHTML = null;
    template = template.content.querySelector('div');
    // fetch list of major projects
    let projs = major;
    //console.log('projects: ');

    // projects are recorded in reverse cronological order
    // so we go from end to start, instead of in order
    cached['projects'] = [];
    for (let i = projs.length - 1; i >= 0; i--) {
        //console.log(projs[i]);
        let n = document.importNode(template, true);
        //load media file
        let media = n.querySelector('.media');
        if (globals['width'] >= globals['height']) {
            media.style.maxWidth = (0.5 * mWidth).toString() + 'px';
        } else {
            media.style.maxWidth = "100%";
        }

        n.querySelector('h1.title').innerText = projs[i]['title'];
        n.querySelector('.role').innerText = projs[i]['role'];
        n.querySelector('.time').innerText = projs[i]['date'];
        n.querySelector('.summary').innerText = projs[i]['summary'];
        if (projs[i]['source'] !== null)
            n.querySelector('.source').href = projs[i]['source'];
        else
            n.querySelector('.source').style.display = 'none';
        if (projs[i]['release'] !== null)
            n.querySelector('.release').href = projs[i]['release'];
        else
            n.querySelector('.release').style.display = 'none';

        if (projs[i]['tag'] !== null) {
            let tagHolder = n.querySelector('div.tags>div');
            projs[i]['tag'].split(', ').forEach(element => {
                let t = document.createElement('p');
                t.className = "oneline";
                t.innerText = element;
                tagHolder.appendChild(t);
            });
        }

        let mWrap = new MediaWrapper(media, n);
        let nWrap = new NodeWrapper(n, { 'media': mWrap });
        parent.appendChild(n);
        load(mWrap, projs[i]['name']);
        cached['projects'].push(nWrap);
    }
}

function repopulateExperiments(parent, mWidth) {
    for (let i = 0; i < cached['experiments'].length; i++) {
        parent.appendChild(cached['experiments'][i].node);
        let vWrap = cached['experiments'][i].getExtra('media');
        if (vWrap !== null) {
            if (vWrap.vid.autoplay) {
                vWrap.vid.play();
            }
        }
    }
}

function populateExperiments(parent, mWidth) {
    if (cached['experiments'] !== null && cached['experiments'].length !== 0) {
        repopulateExperiments(parent, mWidth);
    } else {
        template = document.getElementById("experiment_block");
        template = template.content.querySelector("*");
        cached['experiments'] = [];
        for (let i = minor.length - 1; i > -1; i--) {
            let n = document.importNode(template, true);
            let mWrap = new MediaWrapper(n, n);
            let nWrap = new NodeWrapper(n, { 'media': mWrap });
            parent.appendChild(n);
            cached['experiments'].push(nWrap);
            load(mWrap, minor[i]['name'], true);
        }
    }
}

function repopulateAbout(parent, mWidth) {
    root = cached['about'][0];
    parent.appendChild(root.node);
}

function populateAbout(parent, mWidth) {
    if (cached['about'] !== null && cached['about'].length !== 0) {
        repopulateAbout(parent, mWidth);
    } else {
        template = document.getElementById("about_content").content.querySelector("*");
        let root = document.importNode(template, true);
        parent.appendChild(root);
        cached['about'] = [new NodeWrapper(root, {})];
    }
}