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

const MARKABLE_DEVICES = {
    web : Symbol("web"),
    mobile: Symbol("mobile")
  };

const markable_device = (screen.width > 1000) ? MARKABLE_DEVICES.web : MARKABLE_DEVICES.mobile; 