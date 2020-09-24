/*
 * Original work, Copyright (c) 2013 Lea Verou. All rights reserved.
 * Modified work, Copyright (c) 2020 Brendon Ngirazi. All rights reserved.
 *
 */

import {
    $,
    $$
} from './enviroment';
import {
    CubicBezier,
    BezierCanvas
} from './cubic-bezier';

export default (library, bezierCanvas, P1, P2, opts = {}) => {
    const self = {
        curves: {},

        render() {
            const items = $$('a', library);

            for (let i = items.length; i--;) {
                library.removeChild(items[i]);
            }

            for (let name in this.curves) {
                try {
                    this.add(name, new CubicBezier(this.curves[name]));
                } catch (e) {
                    console.error(e);
                }
            }
        },

        add(name, bezier) {
            const canvas = document.createElement('canvas')
            canvas.width = opts.width || 30;
            canvas.height = opts.height || 30;
            const a = document.createElement('a');
            //href: '#' + bezier.coordinates,
            a.title = name;
            a.bezier = bezier;
            a.style.width = opts.width ? opts.width + 5 + 'px' : '35px';
            a.bezierCanvas = new BezierCanvas(canvas, bezier, .15);

            if (!bezier.applyStyle) console.log(bezier);
            bezier.applyStyle(a);

            library.insertBefore(a, $('footer', library));

            a.appendChild(canvas)

            const span = document.createElement('span');
            span.textContent = name;
            span.title = name;
            a.appendChild(span);

            const button = document.createElement('button');
            button.innerHTML = '×';
            button.title = 'Remove from library';
            button.classList = 'curve-button';
            button.addEventListener('click', function (e) {
                e.stopPropagation();

                //?Remove prompt
                //if (confirm('Are you sure you want to delete this? There is no going back!')) {
                //	self.deleteItem(this.parentNode);
                //}
                self.deleteItem(this.parentNode);

                return false;
            });
            a.appendChild(button);

            a.bezierCanvas.plot(this.thumbnailStyle);

            a.onclick = this.selectThumbnail;

            //if (!/^a$/i.test(a.previousElementSibling.nodeName)) {
            //	a.onclick();
            //}
        },

        selectThumbnail() {
            //?currently sets preview but should set curve coordinates and update input
            const selected = $('.selected', this.parentNode);

            if (selected) {
                selected.classList.remove('selected');
                selected.bezierCanvas.plot(this.thumbnailStyle);
            }

            this.classList.add('selected');

            //?Remove below
            /*
            this.bezierCanvas.plot(self.thumbnailStyleSelected);

            compare.style.cssText = this.style.cssText;

            compare.style.setProperty(prefix + 'transition-duration', getDuration() + 's', null);

            compareCanvas.bezier = this.bezier;

            compareCanvas.plot({
            handleColor: 'rgba(255,255,255,.5)',
            bezierColor: 'white',
            handleThickness: .03,
            bezierThickness: .06
            });
            */
            //?Remove above
            bezierCanvas.bezier = this.bezier;
            const offsets = bezierCanvas.offsets;
            P1.style.left = offsets[0]['left'];
            P1.style.top = offsets[0]['top'];
            P2.style.left = offsets[1]['left'];
            P2.style.top = offsets[1]['top'];

            bezierCanvas.plot({
                handleColor: opts.handleColor || 'rgba(0,255,0,.6)',
                bezierColor: opts.bezierColor || '#aaa4aa',
                handleThickness: opts.handleThickness || .01,
                bezierThickness: opts.bezierThickness || .015
            });

            //var params = $$('.param', bezierCode),
            //	prettyOffsets = bezier.coordinates.toString().split(',');
            //for (var i = params.length; i--;) {
            //	params[i].textContent = prettyOffsets[i];
            //}
        },

        deleteItem(a) {
            const name = $('span', a).textContent;

            delete this.curves[name];

            this.save();

            library.removeChild(a);

            if (a.classList.contains('selected')) {
                $('a:first-of-type', library).onclick();
            }
        },

        save(curves) {
            localStorage.curves = JSON.stringify(curves || this.curves);
        },

        thumbnailStyle: {
            handleColor: 'rgba(0,0,0,.3)',
            handleThickness: .018,
            bezierThickness: .032
        },

        thumbnailStyleSelected: {
            handleColor: 'rgba(255,255,255,.6)',
            bezierColor: 'white',
            handleThickness: .018,
            bezierThickness: .032
        }
    };

    return self;
}