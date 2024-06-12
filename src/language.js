import win from './window-dimensions';

// init

setLanguage(window.localStorage.getItem('language') || (window.navigator.language.indexOf('de') !== -1 ? 'de' : 'en'));

Array.from(document.getElementsByClassName('language-switch')).forEach(addListener);

function setLanguage(language) {
    document.documentElement.setAttribute('lang', language);
    window.localStorage.setItem('language', language);
    win.reflow();
}

function addListener(element) {
    element.addEventListener('click', event => {
        const { lang } = event.target.dataset;
        if (lang) {
            setLanguage(lang);
        }
    });
}
