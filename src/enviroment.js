/*
 * Original work, Copyright (c) 2013 Lea Verou. All rights reserved.
 * Modified work, Copyright (c) 2020 Brendon Ngirazi. All rights reserved.
 *
 */

/**
 * Make the environment a bit friendlier
 */
export const $ = (expr, con) => {
        return (con || document).querySelector(expr);
    },
    $$ = (expr, con) => {
        return (con || document).querySelectorAll(expr);
    }

/**
 * Find browser prefix
 */
const prefixes = ['', '-moz-', '-ms-', '-o-', '-webkit-'];
export const prefix = (style => {
    for (var i = prefixes.length; i--;) {
        var prefix = prefixes[i];

        style.setProperty(prefix + 'transition', '1s', null);

        if (style.cssText) {
            return prefix;
        }
    }

    return null;
})(document.createElement('a').style);