const leftButton = document.getElementsByClassName('mode-switch-bar-left')[0];
const rightButton = document.getElementsByClassName('mode-switch-bar-right')[0];

let nav = false;
let map = false;

window.addEventListener('hashchange', reset);

rightButton.addEventListener('click', function () {
    if (nav) {
        return reset();
    }

    toggleMap(true);
});

leftButton.addEventListener('click', function () {
    if (map) {
        return reset();
    }

    toggleNav(true);
});

function reset() {
    toggleMap(false);
    toggleNav(false);
}

function toggleMap(toggle) {
    map = toggle;
    document.body.classList.toggle('is-showing-map', toggle);
}

function toggleNav(toggle) {
    nav = toggle;
    document.body.classList.toggle('is-showing-nav', toggle);
}
