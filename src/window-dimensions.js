import { forEach } from 'lodash';
import { reCalc } from './elements';

const callbacks = [];

module.exports = {
    width: window.innerWidth,
    height: window.innerHeight,
    onResize: function (callback) {
        callbacks.push(callback);
    },
    reflow: resizeHandler
};

window.addEventListener('resize', resizeHandler);

function resizeHandler(event) {
    module.exports.width = window.innerWidth;
    module.exports.height = window.innerHeight;
    reCalc();
    forEach(callbacks, function (callback) {
        callback(event);
    });
}
