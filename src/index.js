import bezierLibrary from './bezier-library';
import { $, prefix } from './enviroment';
import { CubicBezier, BezierCanvas } from './cubic-bezier';
import { predefined } from './consts';
import classes from './style.css';

/**
 * Returns cubicBezier
 * @param {Object} opts appendTo, width, default, bezierThickness, handleThickness, hanleColor, 
 * bezierColor, arrowKeyControls, onClick, predefined, padding, bezierLibrary, input, preview, duration,
 * transformPos
 */
export const cubicBezier = (options = {}) => {
    const opts = {
        ...{
            preview: true,
            input: true,
            width: 150,
            arrowKeyControls: true,
            onClick: true,
            onUpdate() {}
        },
        ...options
    };
    const self = {
        template: `<section class="curve-library" style="height:${opts.width*2}px;margin-left:${opts.width+30}px;"></section>
                    ${opts.preview ? '<div class="curve-preview-ball"></div>' : ''}
                    <div class="coordinate-plane">
                        <span class="control-point P0" data-point="P0"></span>
                        <button class="control-point curve-button P1" style="left:50px; top: 250px;" data-point="P1"></button>
                        <button class="control-point curve-button P2" style="left:250px; top: 250px;" data-point="P2"></button>
                        <span class="curve-control-point P3" data-point="P3"></span>
                        <canvas height="${opts.width*2}" width="${opts.width}" class="curve-canvas"></canvas>
                        ${opts.input ? '<input type="text" id="curve-input">' : ''}
                        <button class="curve-save">Save</button>
                    </div>`,
        onMouseDown() {
            const me = this;

            document.onmousemove = function drag(e) {
                const curveBoundingBox = self.curve.getBoundingClientRect();
                let x = e.pageX,
                    y = e.pageY,
                    left = curveBoundingBox.left,
                    top = curveBoundingBox.top;

                if (options.transformPos) {
                    const transform = options.transformPos(left, top);
                    left = transform.left;
                    top = transform.top;
                }

                if (x === 0 && y == 0)
                    return;

                // Constrain x
                x = Math.min(Math.max(left, x), left + curveBoundingBox.width);
                // Constrain y
                y = Math.min(Math.max(top, y), top + (curveBoundingBox.width * 2));

                me.style.left = x - left + 'px';
                me.style.top = y - top + 'px';

                self.update();
            };

            document.onmouseup = function() {
                me.focus();

                document.onmousemove = document.onmouseup = null;
            }
        },
        onKeyDown(evt) {
            const code = evt.keyCode;

            if (code >= 37 && code <= 40) {
                evt.preventDefault();

                // Arrow keys pressed
                const curveBoundingBox = self.curve.getBoundingClientRect(),
                    left = parseInt(this.style.left),
                    top = parseInt(this.style.top),
                    offset = 3 * (evt.shiftKey ? 10 : 1);

                let xMax = curveBoundingBox.left,
                    yMax = curveBoundingBox.top;

                if (options.transformPos) {
                    const transform = options.transformPos(xMax, yMax);
                    xMax = transform.left;
                    yMax = transform.top;
                }

                switch (code) {
                    case 37:
                        this.style.left = Math.min(Math.max(xMax, left - offset), xMax + curveBoundingBox.width) + 'px'
                        break;
                    case 38:
                        this.style.top = Math.min(Math.max(yMax, top - offset), yMax + (curveBoundingBox.width * 2)) + 'px';
                        break;
                    case 39:
                        this.style.left = Math.min(Math.max(xMax, left + offset), xMax + curveBoundingBox.width) + 'px';
                        break;
                    case 40:
                        this.style.top = Math.min(Math.max(yMax, top + offset), yMax + (curveBoundingBox.width * 2)) + 'px';
                        break;
                }

                self.update();

                return false;
            }
        },
        onClick(evt) {
            const curveBoundingBox = self.curve.getBoundingClientRect();
            let left = curveBoundingBox.left,
                top = curveBoundingBox.top;

            if (options.transformPos) {
                const transform = options.transformPos(left, top);
                left = transform.left;
                top = transform.top;
            }

            const x = evt.pageX - left,
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
            const curveBoundingBox = self.curve.getBoundingClientRect();
            let left = curveBoundingBox.left,
                top = curveBoundingBox.top;
            const height = curveBoundingBox.height;

            if (options.transformPos) {
                const transform = options.transformPos(left, top);
                left = transform.left;
                top = transform.top;
            }

            const x = evt.pageX - left,
                y = evt.pageY - top;

            this.parentNode.setAttribute('data-time', Math.round(100 * x / curveBoundingBox.width));
            this.parentNode.setAttribute('data-progression', Math.round(100 * (3 * height / 4 - y) / (height * .5)));
        },
        onSave() {
            const rawValues = this.bezierCanvas.bezier.coordinates + '';
            this.lib.add(rawValues, this.bezierCanvas.bezier);
            this.lib.curves[rawValues] = rawValues;
            this.lib.save();
        },
        onChange() {
            if (!self.checkCoordinates(this.value.split(','))) return;
            self.update(this.value);
            self.P1.style.left = self.bezierCanvas.offsets[0]['left'];
            self.P1.style.top = self.bezierCanvas.offsets[0]['top'];
            self.P2.style.left = self.bezierCanvas.offsets[1]['left'];
            self.P2.style.top = self.bezierCanvas.offsets[1]['top'];
        },
        runPreview() {
            //this.updateDelayed();
            if (this.ball.style.transform !== 'translateX(0px)')
                this.ball.style.transform = 'translateX(0px)';
            else
                this.ball.style.transform = `translateX(${opts.width - 10}px)`;
        },
        update(value = '') {
            // Redraw canvas
            this.bezierCanvas.bezier = new CubicBezier(value ||
                this.bezierCanvas.offsetsToCoordinates(this.P1)
                .concat(this.bezierCanvas.offsetsToCoordinates(this.P2))
            );

            this.bezierCanvas.plot({
                handleColor: opts.handleColor || 'rgba(0,255,0,.6)',
                bezierColor: opts.bezierColor || '#aaa4aa',
                handleThickness: opts.handleThickness || .01,
                bezierThickness: opts.bezierThickness || .015
            });

            this.input && (this.input.value = this.getValueString());
            this.ball && this.ball.style.setProperty(prefix + 'transition-timing-function', this.getValueCss(), null);
            opts.onUpdate(this);
            //this.updateDelayed();
        },
        updateDelayed() {
            if (history.pushState) {
                history.pushState(null, null, this.bezierCanvas.bezier.coordinates);
            }
        },
        getValueArrayNum() {
            return this.bezierCanvas.bezier.coordinates.toString().split(',').map(n => parseFloat(n));
        },
        getValueArray() {
            return this.bezierCanvas.bezier.coordinates.toString().split(',');
        },
        getValueString() {
            return this.bezierCanvas.bezier.coordinates.toString();
        },
        getValueCss() {
            return "cubic-bezier(" + this.bezierCanvas.bezier.coordinates.toString() + ")";
        },
        getDuration() {
            return (isNaN(this.duration = Math.round(this.duration * 10) / 10)) ? null : this.duration;
        },
        checkCoordinates(coordinates) {
            if (coordinates.length !== 4) return false;
            let valid = true;
            coordinates.forEach((c, i) => {
                if (isNaN(c) || (!(i % 2) && (c < 0 || c > 1))) {
                    console.log('Wrong coordinate at [' + i + '] (' + c + ')')
                    valid = false;
                } else if (isNaN(c) || ((i % 2) && (c < -.5 || c > 1.5))) {
                    console.log('Wrong coordinate at [' + i + '] (' + c + ')')
                    valid = false;
                }
            });
            return valid;
        },
        init() {
            const curveDisplay = document.createElement('div');
            curveDisplay.classList.add('curve-display');
            curveDisplay.innerHTML = this.template;
            curveDisplay.style.width = opts.width + 90 + 'px';
            if (opts.appendTo && typeof opts.appendChild === 'string')
                $(opts.appendTo).appendChild(curveDisplay)
            else
                (opts.appendTo && opts.appendTo.appendChild(curveDisplay)) ||
                document.body.appendChild(curveDisplay);

            this.el = curveDisplay;
            this.input = $('#curve-input', curveDisplay);
            this.curve = $('.curve-canvas', curveDisplay);
            this.P1 = $('.P1', curveDisplay);
            this.P2 = $('.P2', curveDisplay);
            this.library = $('.curve-library', curveDisplay);
            this.save = $('.curve-save', curveDisplay);
            this.duration = opts.duration || 1.5;
            this.ball = $('.curve-preview-ball', curveDisplay);
            this.ball && this.ball.style.setProperty(prefix + 'transition-duration', this.getDuration() + 's', null);
            this.bezierCanvas = new BezierCanvas(this.curve, null, opts.padding || [.25, 0]);
            this.P1.update = () => this.update();
            this.lib = bezierLibrary(this.library, this.bezierCanvas, this.P1, this.P2, opts.bezierLibrary);

            this.ctx = this.curve.getContext("2d");

            // Add predefined curves
            opts.clearStorage && localStorage.curves && localStorage.removeItem('curves');
            !localStorage.curves && this.lib.save(opts.predefined || predefined); //TODO storage api

            this.lib.curves = JSON.parse(localStorage.curves);

            this.lib.render();

            opts.default && this.checkCoordinates(opts.default.split(',')) || (opts.default = false);
            this.bezierCanvas.bezier = new CubicBezier(opts.default || ".25, .1, .25, 1");
            this.P1.style.left = this.bezierCanvas.offsets[0]['left'];
            this.P1.style.top = this.bezierCanvas.offsets[0]['top'];
            this.P2.style.left = this.bezierCanvas.offsets[1]['left'];
            this.P2.style.top = this.bezierCanvas.offsets[1]['top'];

            this.update();

            this.P1.onmousedown = this.P2.onmousedown = this.onMouseDown;
            this.P1.onkeydown = this.P2.onkeydown = opts.arrowKeyControls ? this.onKeyDown : null;
            this.curve.onclick = opts.onClick ? this.onClick : null;
            this.curve.onmousemove = this.onMouseMove;
            this.input && (this.input.onchange = this.onChange);
            this.ball && (this.ball.onclick = () => this.runPreview());
            this.save.onclick = e => this.onSave(e);
        }
    }
    return self;
}

window.cubicBezier = cubicBezier;