export const hasClass = function (el: HTMLElement, cls: string) {
    return el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
};

export const addClass = function (el: HTMLElement, cls: string) {
    if (!hasClass(el, cls)) el.className += ' ' + cls;
};

export const removeClass = function (el: HTMLElement, cls: string) {
    if (hasClass(el, cls)) {
        const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
};

export const toggleClass = function (el: HTMLElement, cls: string) {
    if (hasClass(el, cls)) {
        removeClass(el, cls);
    } else {
        addClass(el, cls);
    }
};
