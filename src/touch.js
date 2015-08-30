var _ = require('lodash');

module.exports = touchHandler;

function touchHandler(el) {
    var currentTouch,
        currentX,
        callbacks = {};

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

        var touch = findTouch(event.touches, currentTouch);

        if (!touch) { return; }

        callback('move', currentX - touch.clientX);
    }

    function endHandler(event) {
        var touch = findTouch(event.changedTouches, currentTouch);

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
    return _.findWhere(touches, { identifier: touch.identifier });
}
