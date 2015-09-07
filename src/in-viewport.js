export default function (elements, scrollPos, offset) {
    const inViewport = [];

    for (let i = elements.length - 1; i >= 0; i--) {
        if (!elements[i].hidden) {
            if (elements[i].offset < scrollPos) {
                inViewport.push(elements[i]);
                break;
            }

            if (elements[i].offset < scrollPos + offset) {
                inViewport.push(elements[i]);
            }
        }
    }

    return inViewport;
}
