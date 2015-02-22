var _ = require('lodash');
var elements = require('./elements');
var callbacks = [];

module.exports = {
    width: window.innerWidth,
    height: window.innerHeight,
    onResize: function (callback) {
        callbacks.push(callback);
    },
    reflow: resizeHandler
};

window.addEventListener('resize', resizeHandler);

function resizeHandler () {
    module.exports.width = window.innerWidth;
    module.exports.height = window.innerHeight;
    elements.reCalc();
    _.each(callbacks, function (callback) {
        callback();
    });
}
