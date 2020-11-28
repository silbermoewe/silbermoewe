import { forEach } from 'lodash';
import { reCalc } from './elements';

const callbacks = [];

const win = {
    width: window.innerWidth,
    height: window.innerHeight,
    onResize: function (callback) {
        callbacks.push(callback);
    },
    reflow: resizeHandler,
};

export default win;

window.addEventListener('resize', resizeHandler);

function resizeHandler(event) {
    win.width = window.innerWidth;
    win.height = window.innerHeight;
    reCalc();
    forEach(callbacks, function (callback) {
        callback(event);
    });
}
