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
    'experiments': null,
    'blogs': null
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

async function load(vid, name, forceLoadPoster) {
    vid.addEventListener('error', (msg) => {
        console.log(msg);
    })
    try {
        let src = resLinks['videos'] + name + '.webm',
            poster = resLinks['thumbnails'] + name + '.jpeg';
        UrlExists(src, (exists) => {
            if (exists) {
                vid.src = src;
                vid.load();
            } else {
                UrlExists(poster, (exists) => {
                    if (exists) {
                        vid.poster = poster;
                        vid.load();
                    }
                })
            }
        });
        if (forceLoadPoster) {
            UrlExists(poster, (exists) => {
                if (exists) {
                    vid.poster = poster;
                    vid.load();
                }
            })
        }
    } catch (e) {
        console.log(e);
    }
}

function repopulateProjects(parent, mWidth) {
    for (let i = cached['projects'].length - 1; i >= 0; i--) {
        parent.append(cached['projects'][i]);
    }
    let vids = parent.querySelectorAll('video');
    for (let i = 0; i < vids.length; i++) {
        let media = vids[i];
        if (globals['width'] >= globals['height']) {
            media.style.maxWidth = (0.5 * mWidth).toString() + 'px';
        } else {
            media.style.maxWidth = "100%";
        }
        //media.load();
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
    cached['projects'] = new Array(projs.length);
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

        if (globals['isMobile']) {
            media.autoplay = true;
        } else {
            media.autoplay = false;
            n.addEventListener('mouseover', e => {
                let playPromise = n.querySelector('.media').play();
                if (playPromise != undefined) {
                    playPromise.then(_ => {})
                        .catch(error => {
                            console.log(error);
                        });
                }
            })

            n.addEventListener('mouseout', e => {
                n.querySelector('.media').pause();
            })
        }

        n.querySelector('.title').innerText = projs[i]['title'];
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
            let tagHolder = n.querySelector('div.tags div');
            projs[i]['tag'].split(', ').forEach(element => {
                let t = document.createElement('p');
                t.className = "oneline";
                t.innerText = element;
                tagHolder.appendChild(t);
            });
        }

        parent.appendChild(n);
        load(media, projs[i]['name'], !narrowOrNot);
        cached['projects'][i] = (n);
    }
}

function repopulateExperiments(parent, mWidth) {

}

function populateExperiments(parent, mWidth) {
    if (cached['experiments'] === null || cached['experiments'].length == 0) {
        repopulateExperiments(parent, mWidth);
    } else {
        for (let i = minor.length - 1; i > -1; i--) {
            console.log(minor[i]);
        }
    }
}