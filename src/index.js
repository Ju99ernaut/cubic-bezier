import bezierLibrary from './bezier-library';
import {
    $
} from './enviroment';
import {
    CubicBezier,
    BezierCanvas
} from './cubic-bezier';
import {
    predefined
} from './consts';
import classes from './style.css';

/**
 * Returns cubicBezier
 * @param {Object} opts appendTo, width, default, bezierThickness, handleThickness, hanleColor, 
 * bezierColor, arrowKeyControls, onClick, predefined, padding, bezierLibrary, input, preview, 
 */
export const cubicBezier = (options = {}) => {
    const opts = {
        ...{
            width: 150,
            arrowKeyControls: true,
            onClick: true
        },
        ...options
    };
    const self = {
        template: `<section class="curve-library" style="margin-left:${opts.width+30}px;"></section>
                    <div class="coordinate-plane">
                        <span class="control-point P0" data-point="P0"></span>
                        <button class="control-point curve-button P1" style="left:50px; top: 250px;" data-point="P1"></button>
                        <button class="control-point curve-button P2" style="left:250px; top: 250px;" data-point="P2"></button>
                        <span class="curve-control-point P3" data-point="P3"></span>
                        <canvas height="${opts.width*2}" width="${opts.width}" class="curve-canvas"></canvas>
                        <button class="curve-save">Save</button>
                    </div>`,
        onMouseDown() {
            const me = this;

            document.onmousemove = function drag(e) {
                let x = e.pageX,
                    y = e.pageY;
                const left = self.curveBoundingBox.left,
                    top = self.curveBoundingBox.top;

                if (x === 0 && y == 0) {
                    return;
                }

                // Constrain x
                x = Math.min(Math.max(left, x), left + self.curveBoundingBox.width);
                // Constrain y
                y = Math.min(Math.max(top, y), top + (self.curveBoundingBox.width * 2));
                //y = y > top + (curveBoundingBox.width * 2) ? top + (curveBoundingBox.width * 2) : y;
                //y = y < top ? y = top : y;

                me.style.left = x - left + 'px';
                me.style.top = y - top + 'px';

                self.update();
            };

            document.onmouseup = function () {
                me.focus();

                document.onmousemove = document.onmouseup = null;
            }
        },
        onKeyDown(evt) {
            const code = evt.keyCode;

            if (code >= 37 && code <= 40) {
                evt.preventDefault();

                // Arrow keys pressed
                const left = parseInt(this.style.left),
                    top = parseInt(this.style.top),
                    xMax = self.curveBoundingBox.left,
                    yMax = self.curveBoundingBox.top,
                    offset = 3 * (evt.shiftKey ? 10 : 1);

                switch (code) {
                    case 37:
                        this.style.left = Math.min(Math.max(xMax, left - offset), xMax + self.curveBoundingBox.width) + 'px'
                        break;
                    case 38:
                        this.style.top = Math.min(Math.max(yMax, top - offset), yMax + (self.curveBoundingBox.width * 2)) + 'px';
                        break;
                    case 39:
                        this.style.left = Math.min(Math.max(xMax, left + offset), xMax + self.curveBoundingBox.width) + 'px';
                        break;
                    case 40:
                        this.style.top = Math.min(Math.max(yMax, top + offset), yMax + (self.curveBoundingBox.width * 2)) + 'px';
                        break;
                }

                self.update();

                return false;
            }
        },
        onClick(evt) {
            const left = self.curveBoundingBox.left,
                top = self.curveBoundingBox.top,
                x = evt.pageX - left,
                y = evt.pageY - top;

            // Find which point is closer
            const distP1 = distance(x, y, parseInt(self.P1.style.left), parseInt(self.P1.style.top)),
                distP2 = distance(x, y, parseInt(self.P2.style.left), parseInt(self.P2.style.top)),
                pt = (distP1 < distP2 ? self.P1 : self.P2);

            pt.style.left = x + 'px';
            pt.style.top = y + 'px';

            self.update();

            function distance(x1, y1, x2, y2) {
                return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
            }
        },
        onMouseMove(evt) {
            const left = self.curveBoundingBox.left,
                top = self.curveBoundingBox.top,
                height = self.curveBoundingBox.height,
                x = evt.pageX - left,
                y = evt.pageY - top;

            this.parentNode.setAttribute('data-time', Math.round(100 * x / self.curveBoundingBox.width));
            this.parentNode.setAttribute('data-progression', Math.round(100 * (3 * height / 4 - y) / (height * .5)));
        },
        onSave() {
            const rawValues = this.bezierCanvas.bezier.coordinates + '';
            this.lib.add(rawValues, this.bezierCanvas.bezier);
            this.lib.curves[rawValues] = rawValues;
            this.lib.save();
        },
        update() {
            // Redraw canvas
            this.bezierCanvas.bezier = new CubicBezier(
                this.bezierCanvas.offsetsToCoordinates(this.P1)
                .concat(this.bezierCanvas.offsetsToCoordinates(this.P2))
            );

            this.bezierCanvas.plot({
                handleColor: opts.handleColor || 'rgba(0,255,0,.6)',
                bezierColor: opts.bezierColor || '#aaa4aa',
                handleThickness: opts.handleThickness || .01,
                bezierThickness: opts.bezierThickness || .015
            });

            //updateCopyInputs();
            //var params = $$('.param', bezierCode),
            //	prettyOffsets = bezier.coordinates.toString().split(',');
            //
            //for (var i = params.length; i--;) {
            //	params[i].textContent = prettyOffsets[i];
            //}
        },
        init() {
            const curveDisplay = document.createElement('div');
            curveDisplay.classList.add('curve-display');
            curveDisplay.innerHTML = this.template;
            (opts.appendTo && opts.appendTo.appendChild(curveDisplay)) ||
            document.body.appendChild(curveDisplay);

            this.values = $('.values', curveDisplay);
            this.curve = $('.curve-canvas', curveDisplay);
            this.P1 = $('.P1', curveDisplay);
            this.P2 = $('.P2', curveDisplay);
            this.library = $('.curve-library', curveDisplay);
            this.save = $('.curve-save', curveDisplay);
            this.bezierCanvas = new BezierCanvas(this.curve, null, opts.padding || [.25, 0]);
            this.lib = bezierLibrary(this.library, this.bezierCanvas, this.P1, this.P2, opts.bezierLibrary);

            this.ctx = this.curve.getContext("2d");
            //bezierCode = $('h1 code'),
            this.curveBoundingBox = this.curve.getBoundingClientRect();
            //pixelDepth = window.devicePixelRatio || 1;

            // Add predefined curves
            opts.clearStorage && localStorage.curves && localStorage.removeItem('curves');
            !localStorage.curves && this.lib.save(opts.predefined || predefined); //TODO storage api

            this.lib.curves = JSON.parse(localStorage.curves);

            this.lib.render();

            this.bezierCanvas.bezier = new CubicBezier(opts.default || ".25, .1, .25, 1"); //TODO Change to input
            this.P1.style.left = this.bezierCanvas.offsets[0]['left'];
            this.P1.style.top = this.bezierCanvas.offsets[0]['top'];
            this.P2.style.left = this.bezierCanvas.offsets[1]['left'];
            this.P2.style.top = this.bezierCanvas.offsets[1]['top'];

            this.update();

            this.P1.onmousedown = this.P2.onmousedown = this.onMouseDown;
            this.P1.onkeydown = this.P2.onkeydown = opts.arrowKeyControls ? this.onKeyDown : null;
            this.curve.onclick = opts.onClick ? this.onClick : null;
            this.curve.onmousemove = this.onMouseMove;
            this.save.onclick = e => this.onSave(e);
        }
    }
    return self;
}

cubicBezier().init();