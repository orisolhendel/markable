const $$ = id => {
    return document.getElementById (id);
}

const moveUp = () => {
    window.scrollTo(0, 0);
}

moveUp ();

const getAppMode = () => {
    return new URLSearchParams(window.location.search).get("mode");
}