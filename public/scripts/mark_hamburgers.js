
const hamb_states = {initial : 1, x: 2}

const hamb_get_upper_from_wrapper = wrapper => {
    return $$(wrapper.id.replace ("_wrapper", "_upper"));
}

const hamb_get_middle_from_wrapper = wrapper => {
    return $$(wrapper.id.replace ("_wrapper", "_middle"));
}

const hamb_get_lower_from_wrapper = wrapper => {
    return $$(wrapper.id.replace ("_wrapper", "_lower"));
}

const hamb_get_menu_from_wrapper = wrapper => {
    return $$(wrapper.id.replace ("_wrapper", "_menu"));
}

const toggle_hamb = hamb => {

    if (hamb.interval && hamb.interval !== -1) {
        console.log ("wait, I'm in the middle");
        return;
    }

    if (!hamb.state) {
        hamb.state = hamb_states.initial;
    }
    if (hamb.state === hamb_states.initial) {
        hamb_get_middle_from_wrapper(hamb).style.display = "none";
        hamb_get_upper_from_wrapper(hamb).degrees = 0;
        hamb_get_lower_from_wrapper(hamb).degrees = 0;
        hamb_get_upper_from_wrapper(hamb).level = 0;
        hamb_get_lower_from_wrapper(hamb).level = 24;
        hamb_get_menu_from_wrapper(hamb).style.display = "";
        hamb_get_menu_from_wrapper(hamb).pos = 0;
        hamb_interval_to_x (hamb);
    } else {
        hamb_get_middle_from_wrapper(hamb).style.display = "";
        hamb_get_upper_from_wrapper(hamb).degrees = 45;
        hamb_get_lower_from_wrapper(hamb).degrees = -45;
        hamb_get_upper_from_wrapper(hamb).level = 12;
        hamb_get_lower_from_wrapper(hamb).level = 12;
        hamb_get_menu_from_wrapper(hamb).style.display = "";
        hamb_get_menu_from_wrapper(hamb).pos = -250;
        hamb_interval_to_initial (hamb);
    }
}

const hamb_interval_to_x = hamb => {

    const upper = hamb_get_upper_from_wrapper (hamb);
    const lower = hamb_get_lower_from_wrapper (hamb);
    const menu = hamb_get_menu_from_wrapper(hamb);

    upper.degrees++;
    lower.degrees--;

    upper.level++;
    lower.level--;

    menu.pos -= 6;

    if (upper.level <= 12) {
        upper.style.top = `${upper.level}px`;
        lower.style.top = `${lower.level}px`;
    }

    if (menu.pos >= -250) {
        menu.style.left = `${menu.pos}px`;
    }

    upper.style.transform = `rotate(${upper.degrees}deg)`;
    lower.style.transform = `rotate(${lower.degrees}deg)`;

    if (upper.degrees >= 45) {
        menu.style.left = "-250px";
        clearTimeout (hamb.interval);
        hamb.interval = -1;
        hamb.state = hamb_states.x;
        return;
    }

    hamb.interval = window.setTimeout (() => hamb_interval_to_x(hamb), 6);
}

const hamb_interval_to_initial = hamb => {

    const upper = hamb_get_upper_from_wrapper (hamb);
    const lower = hamb_get_lower_from_wrapper (hamb);
    const menu = hamb_get_menu_from_wrapper(hamb);

    upper.degrees--
    lower.degrees++;

    upper.level--
    lower.level++

    menu.pos += 7;

    if (upper.level >= 0) {
        upper.style.top = `${upper.level}px`;
        lower.style.top = `${lower.level}px`;
    }

    if (menu.pos <= 70) {
        menu.style.left = `${menu.pos}px`;
    }

    upper.style.transform = `rotate(${upper.degrees}deg)`;
    lower.style.transform = `rotate(${lower.degrees}deg)`;

    if (upper.degrees <= 0) {
        menu.style.display = "none";
        clearTimeout (hamb.interval);
        hamb.interval = -1;
        hamb.state = hamb_states.initial;
        return;
    }

    hamb.interval = window.setTimeout (() => hamb_interval_to_initial(hamb), 6);
}
