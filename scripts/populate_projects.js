blockvars = {
    'majorHeight': 320,
    'minorHeight': 160,
}

resLinks = {
    'thumbnails': './preview/thumbnail/',
    'videos': './preview/video/'
}

function populateProjects(parent, mWidth) {
    let template = globals['projT'];
    if (template === null) {
        return;
    }
    // fetch list of major projects
    let projs = major;
    //console.log('projects: ');

    let p = [];
    // projects are recorded in reverse cronological order
    // so we go from end to start, instead of in order
    for (let i = projs.length - 1; i >= 0; i--) {
        //console.log(projs[i]);
        let n = template.content.cloneNode(true);
        console.log(n);
        let media = n.querySelector('.media');
        media.src = resLinks['videos'] + projs[i]['name'] + '.webm';
        media.autoplay = true;
        media.loop = true;
        media.style.minHeight = '320px';
        console.log((0.5 * mWidth).toString() + 'px');
        media.style.maxWidth = (0.5 * mWidth).toString() + 'px';
        media.load();

        parent.appendChild(n);
    }
}