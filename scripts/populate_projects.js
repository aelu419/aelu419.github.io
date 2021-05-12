blockvars = {
    'majorHeight': 320,
    'minorHeight': 160,
}

function populateProjects() {
    let template = globals['projT'];
    if (template === null) {
        return;
    }
    // fetch list of major projects
    let projs = major
    console.log('projects: ' + projs);


}