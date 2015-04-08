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

        if (!_.find(event.touches, currentTouch)) { return; }

        callback('move', currentX - currentTouch.clientX);
    }

    function endHandler(event) {
        if (!_.find(event.changedTouches, currentTouch)) { return; }

        callback('end', currentX - currentTouch.clientX);
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