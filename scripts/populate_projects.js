blockvars = {
    'majorHeight': 320,
    'minorHeight': 160,
}

resLinks = {
    'thumbnails': './preview/thumbnail/',
    'videos': './preview/video/'
}

cached = {
    'narrow': false,
    'projects': null
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
        console.log(msg, url, l);
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
    parent.innerHTML = cached['projects'];
    let vids = parent.querySelectorAll('video');
    for (let i = 0; i < vids.length; i++) {
        let media = vids[i];
        if (globals['width'] >= globals['height']) {
            media.style.maxWidth = (0.5 * mWidth).toString() + 'px';
        } else {
            media.style.maxWidth = "100%";
        }
        media.load();
    }
}

function populateProjects(parent, mWidth) {
    let template = globals['projT'];
    let narrowOrNot = globals['width'] < globals['height'];
    if (globals['width'] < globals['height']) {
        template = globals['projTN']
        cached['narrow'] = true;
    } else {
        cached['narrow'] = false;
    }

    if (template === null) {
        return;
    }
    if (cached['projects'] !== null && cached['narrow'] == narrowOrNot) {
        repopulateProjects(parent, mWidth);
        return;
    }
    cached['narrow'] = narrowOrNot;
    template = template.content.querySelector('div');
    // fetch list of major projects
    let projs = major;
    //console.log('projects: ');

    // projects are recorded in reverse cronological order
    // so we go from end to start, instead of in order
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
            let tagHolder = n.querySelector('div.tag');
            projs[i]['tag'].split(', ').forEach(element => {
                let t = document.createElement('p');
                t.className = 'tag';
                t.innerText = element;
                tagHolder.appendChild(t);
            });
        }

        parent.appendChild(n);
        load(media, projs[i]['name'], !narrowOrNot);
    }
}