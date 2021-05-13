blockvars = {
    'majorHeight': 320,
    'minorHeight': 160,
}

resLinks = {
    'thumbnails': './preview/thumbnail/',
    'videos': './preview/video/'
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

async function load(vid, name) {
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
            }
        });
        UrlExists(poster, (exists) => {
            if (exists) {
                vid.poster = poster;
                vid.load();
            }
        })
    } catch (e) {
        console.log(e);
    }
}

function populateProjects(parent, mWidth) {
    let template = globals['projT'];
    if (template === null) {
        return;
    }
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
        media.style.maxWidth = (0.5 * mWidth).toString() + 'px';

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

        parent.appendChild(n);
        load(media, projs[i]['name']);
    }
}