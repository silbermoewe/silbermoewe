import getImageUrl from './get-image-url';

export default function (image) {
    const url = getImageUrl(image);

    if (url === image.url) {
        return;
    }

    image.url = url;

    const loadIndicator = document.createElement('img');
    loadIndicator.addEventListener('load', setSrc);
    loadIndicator.src = url;
    image.el.classList.add('is-loading');

    function setSrc() {
        image.el.style.backgroundImage = 'url(' + url + ')';
        image.el.classList.remove('is-loading');
        loadIndicator.removeEventListener('load', setSrc);
    }
}
