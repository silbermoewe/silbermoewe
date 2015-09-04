import { forEach } from 'lodash';
import win from './window-dimensions';

// init

setLanguage(window.localStorage.getItem('language') ||
    (window.navigator.language.indexOf('de') !== -1 ? 'de' : 'en'));

forEach(document.getElementsByClassName('language-switch'), addListeners);


function setLanguage(language) {
    document.documentElement.setAttribute('lang', language);
    window.localStorage.setItem('language', language);
    win.reflow();
}

function addListeners(element) {
    element.addEventListener('click', function (event) {
        setLanguage(event.target.getAttribute('data-lang'));
    });
}
