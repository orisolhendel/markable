
const toggleAnimCb = outer => {
    const cb = document.getElementById (outer.id.replace(/_outer/i, ""));
    cb.click();
    animateCb (outer, cb);
}

const animateCb = (outer, cb) => {
    const direction = (cb.checked ? 1 : -1);

    const inner = document.getElementById (outer.id.replace(/_outer/i, "_inner"));
    const intLeft = parseInt (inner.style.left.replace (/px/i, ""));
    if (direction === 1 && intLeft >= 30) {
        outer.style.border = "4px solid #ff8888";
        inner.style.backgroundColor = "#ff8888";
        clearInterval (outer.interval);
        return;
    }
    if (direction === -1 && intLeft <= 6) {
        outer.style.border = "4px solid #cccccc";
        inner.style.backgroundColor = "#cccccc";
        clearInterval (outer.interval);
        return;
    }

    inner.style.left = (intLeft + direction) + "px";
    outer.interval = setTimeout (() => {animateCb(outer, cb)}, 10);
}

const mark_cb_get_cb_from_outer = outer => {
    return document.getElementById (outer.id.replace(/_outer/i, ""));
}

const mark_cb_get_inner_from_outer = outer => {
    return document.getElementById (outer.id.replace(/_outer/i, "_inner"));
}

const mark_cb_get_outer_from_cb = cb => {
    return document.getElementById (`${cb.id}_outer`);
}