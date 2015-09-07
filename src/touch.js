import { findWhere } from 'lodash';

export default touchHandler;

function touchHandler(el) {
    const callbacks = {};

    let currentTouch;
    let currentX;

    el.addEventListener('touchstart', startHandler);
    el.addEventListener('touchmove', moveHandler);
    el.addEventListener('touchleave', endHandler);
    el.addEventListener('touchend', endHandler);
    el.addEventListener('touchcancel', endHandler);

    function startHandler(event) {
        if (currentTouch) { return; }

        currentTouch = event.changedTouches[0];
        currentX = currentTouch.clientX;
    }

    function moveHandler(event) {
        event.preventDefault();

        const touch = findTouch(event.touches, currentTouch);

        if (!touch) { return; }

        callback('move', currentX - touch.clientX);
    }

    function endHandler(event) {
        const touch = findTouch(event.changedTouches, currentTouch);

        if (!touch) { return; }

        callback('end', currentX - touch.clientX);
        currentTouch = null;
    }

    function registerHandler(type, fn) {
        callbacks[type] = fn;
    }

    function callback(type, value) {
        if (callbacks[type]) {
            callbacks[type](value);
        }
    }

    return {
        on: registerHandler
    };
}

function findTouch(touches, touch) {
    return findWhere(touches, { identifier: touch.identifier });
}
