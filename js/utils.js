(function (window) {
    'use strict';

    window.$ = function (selector, scope) {
        return (document || scope).querySelector(selector);
    };

    window.$all = function (selector, scope) {
        return (document || scope).querySelectorAll(selector);
    };

    window.$new = function (tag, options) {
        var element = document.createElement(tag);
        if (options.text) {
            element.appendChild(document.createTextNode(options.text));
        }
        if (options.class) {
            element.classList.add(options.class);
        }
        if (options.id) {
            element.id = options.id;
        }
        if (tag === 'input' && options.type) {
            element.type = options.type;
            if (options.type === 'checkbox' && options.checked) {
                element.checked = options.checked;
            }
        }
        return element;
    }

})(window);