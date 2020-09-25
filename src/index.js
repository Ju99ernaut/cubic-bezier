import bezierLibrary from './bezier-library';
import {
    $,
    prefix
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
 * bezierColor, arrowKeyControls, onClick, predefined, padding, bezierLibrary, input, preview, duration
 */
export const cubicBezier = (options = {}) => {
    const opts = {
        ...{
            preview: true,
            input: true,
            width: 150,
            arrowKeyControls: true,
            onClick: true
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

            this.input && (this.input.value = this.getValueString(this.bezierCanvas.bezier));
            this.ball.style.setProperty(prefix + 'transition-timing-function', this.getValueCss(this.bezierCanvas.bezier), null);
            //this.updateDelayed();
        },
        updateDelayed() {
            if (history.pushState) {
                history.pushState(null, null, this.bezierCanvas.bezier.coordinates);
            }
        },
        getValueArrayNum(bezier) {
            return bezier.coordinates.toString().split(',').map(n => parseFloat(n));
        },
        getValueArray(bezier) {
            return bezier.coordinates.toString().split(',');
        },
        getValueString(bezier) {
            return bezier.coordinates.toString();
        },
        getValueCss(bezier) {
            return "cubic-bezier(" + bezier.coordinates.toString() + ")";
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

            this.input = $('#curve-input', curveDisplay);
            this.curve = $('.curve-canvas', curveDisplay);
            this.P1 = $('.P1', curveDisplay);
            this.P2 = $('.P2', curveDisplay);
            this.library = $('.curve-library', curveDisplay);
            this.save = $('.curve-save', curveDisplay);
            this.duration = opts.duration || 1.5;
            this.ball = $('.curve-preview-ball', curveDisplay);
            this.ball.style.setProperty(prefix + 'transition-duration', this.getDuration() + 's', null);
            this.bezierCanvas = new BezierCanvas(this.curve, null, opts.padding || [.25, 0]);
            this.P1.update = () => this.update();
            this.lib = bezierLibrary(this.library, this.bezierCanvas, this.P1, this.P2, opts.bezierLibrary);

            this.ctx = this.curve.getContext("2d");
            this.curveBoundingBox = this.curve.getBoundingClientRect();

            // Add predefined curves
            opts.clearStorage && localStorage.curves && localStorage.removeItem('curves');
            !localStorage.curves && this.lib.save(opts.predefined || predefined); //TODO storage api

            this.lib.curves = JSON.parse(localStorage.curves);

            this.lib.render();

            opts.default && this.checkCoordinates(opts.default.split(',')) || (opts.default = false);
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
            this.input && (this.input.onchange = this.onChange);
            this.ball.onclick = () => this.runPreview();
            this.save.onclick = e => this.onSave(e);
        }
    }
    return self;
}

window.cubicBezier = cubicBezier;