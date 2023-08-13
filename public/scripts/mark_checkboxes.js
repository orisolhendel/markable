
const CB_CIRCLE_WIDTH = 25;

const toggleAnimCb = outer => {
    const cb = mark_cb_get_cb_from_outer (outer);
    cb.click();
    animateCb (outer, cb);
}

const animateCb = (outer, cb) => {
    const direction = (cb.checked ? 1 : -1);

    const inner = mark_cb_get_inner_from_outer (outer);
    const intSize = parseInt (inner.style.width.replace (/px/i, ""));

    inner.style.display = "";

    if (direction === 1 && intSize >= 16) {
        outer.style.border = "2px solid #ff0082";
        outer.style.backgroundColor = "#ffffff";
        if (mark_cb_get_text_from_outer(outer)) {
            mark_cb_get_text_from_outer(outer).style.backgroundColor = "#ffffff";
        }
        clearInterval (outer.interval);
        return;
    }
    if (direction === -1 && intSize <= 1) {
        outer.style.border = "2px solid #ffffff";
        outer.style.backgroundColor = "#f7f7f7";
        inner.style.display = "none";
        if (mark_cb_get_text_from_outer(outer)) {
            mark_cb_get_text_from_outer(outer).style.backgroundColor = "#f7f7f7";
        }
        clearInterval (outer.interval);
        return;
    }

    inner.style.width = (intSize + direction) + "px";
    inner.style.height = (intSize + direction) + "px";

    inner.style.left = `${(CB_CIRCLE_WIDTH - intSize) / 2 }px`;
    inner.style.top = `${(CB_CIRCLE_WIDTH - intSize) / 2}px`;

    outer.interval = setTimeout (() => {animateCb(outer, cb)}, 10);
}

const mark_cb_get_cb_from_outer = outer => {
    return $$(outer.id.replace(/_outer/i, ""));
}

const mark_cb_get_inner_from_outer = outer => {
    return $$(outer.id.replace(/_outer/i, "_inner"));
}

const mark_cb_get_outer_from_cb = cb => {
    return $$(`${cb.id}_outer`);
}

const mark_cb_get_text_from_outer = outer => {
    return $$(outer.id.replace(/_outer/i, "_text"));
}