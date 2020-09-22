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

const cubicBezier = (opts = {}) => {
    const curveDisplay = document.createElement('div');
    curveDisplay.classList.add('curve-display');
    const template = `<section class="curve-library"></section>
    <div class="coordinate-plane">
        <span class="control-point P0" data-point="P0"></span>
        <button class="control-point button P1" style="left:50px; top: 250px;" data-point="P1"></button>
        <button class="control-point button P2" style="left:250px; top: 250px;" data-point="P2"></button>
        <span class="curve-control-point P3" data-point="P3"></span>
        <canvas height="300" width="150" class="curve-canvas"></canvas>
        <button class="save">Save</button>
    </div>`;
    curveDisplay.innerHTML = template;
    (opts.appendTo && opts.appendTo.appendChild(curveDisplay)) || document.body.appendChild(curveDisplay);

    const values = $('.values', curveDisplay);
    const curve = $('.curve-canvas', curveDisplay);
    const P1 = $('.P1', curveDisplay);
    const P2 = $('.P2', curveDisplay);
    const library = $('.curve-library', curveDisplay);
    const save = $('.save', curveDisplay);
    const bezierCanvas = new BezierCanvas(curve, null, [.25, 0]);
    const lib = bezierLibrary(library, bezierCanvas, P1, P2);

    const ctx = curve.getContext("2d"),
        //bezierCode = $('h1 code'),
        curveBoundingBox = curve.getBoundingClientRect();
    //pixelDepth = window.devicePixelRatio || 1;

    // Add predefined curves
    !localStorage.curves && lib.save(predefined); //!

    lib.curves = JSON.parse(localStorage.curves);

    lib.render();

    bezierCanvas.bezier = new CubicBezier(".25, .1, .25, 1"); //!Change to input
    //const bezier = bezierCanvas.bezier;
    const offsets = bezierCanvas.offsets;
    P1.style.left = offsets[0]['left'];
    P1.style.top = offsets[0]['top'];
    P2.style.left = offsets[1]['left'];
    P2.style.top = offsets[1]['top'];

    update();

    P1.onmousedown =
        P2.onmousedown = function () {
            const me = this;

            document.onmousemove = function drag(e) {
                let x = e.pageX,
                    y = e.pageY;
                const left = curveBoundingBox.left,
                    top = curveBoundingBox.top;

                if (x === 0 && y == 0) {
                    return;
                }

                // Constrain x
                x = Math.min(Math.max(left, x), left + curveBoundingBox.width);
                // Constrain y
                y = Math.min(Math.max(top, y), top + (curveBoundingBox.width * 2));
                //y = y > top + (curveBoundingBox.width * 2) ? top + (curveBoundingBox.width * 2) : y;
                //y = y < top ? y = top : y;

                me.style.left = x - left + 'px';
                me.style.top = y - top + 'px';

                update();
            };

            document.onmouseup = function () {
                me.focus();

                document.onmousemove = document.onmouseup = null;
            }
        };

    P1.onkeydown =
        P2.onkeydown = function (evt) {
            const code = evt.keyCode;

            if (code >= 37 && code <= 40) {
                evt.preventDefault();

                // Arrow keys pressed
                const left = parseInt(this.style.left),
                    top = parseInt(this.style.top),
                    offset = 3 * (evt.shiftKey ? 10 : 1);

                switch (code) {
                    case 37:
                        this.style.left = left - offset + 'px';
                        break;
                    case 38:
                        this.style.top = top - offset + 'px';
                        break;
                    case 39:
                        this.style.left = left + offset + 'px';
                        break;
                    case 40:
                        this.style.top = top + offset + 'px';
                        break;
                }

                update();

                return false;
            }
        };

    curve.onclick = function (evt) {
        const left = curveBoundingBox.left,
            top = curveBoundingBox.top,
            x = evt.pageX - left,
            y = evt.pageY - top;

        // Find which point is closer
        const distP1 = distance(x, y, parseInt(P1.style.left), parseInt(P1.style.top)),
            distP2 = distance(x, y, parseInt(P2.style.left), parseInt(P2.style.top)),
            pt = (distP1 < distP2 ? P1 : P2);

        pt.style.left = x + 'px';
        pt.style.top = y + 'px';

        update();

        function distance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
    };

    curve.onmousemove = function (evt) {
        const left = curveBoundingBox.left,
            top = curveBoundingBox.top,
            height = curveBoundingBox.height,
            x = evt.pageX - left,
            y = evt.pageY - top;

        this.parentNode.setAttribute('data-time', Math.round(100 * x / curveBoundingBox.width));
        this.parentNode.setAttribute('data-progression', Math.round(100 * (3 * height / 4 - y) / (height * .5)));
    };

    save.onclick = function () {
        const rawValues = bezierCanvas.bezier.coordinates + '';
        lib.add(rawValues, bezierCanvas.bezier);
        lib.curves[rawValues] = rawValues;
        lib.save();
    };

    function update() {
        // Redraw canvas
        bezierCanvas.bezier =
            window.bezier = new CubicBezier(
                bezierCanvas.offsetsToCoordinates(P1)
                .concat(bezierCanvas.offsetsToCoordinates(P2))
            );

        bezierCanvas.plot({
            handleColor: 'rgba(0,255,0,.6)',
            bezierColor: '#aaa4aa',
            handleThickness: .01,
            bezierThickness: .015
        });

        //updateCopyInputs();
        //var params = $$('.param', bezierCode),
        //	prettyOffsets = bezier.coordinates.toString().split(',');
        //
        //for (var i = params.length; i--;) {
        //	params[i].textContent = prettyOffsets[i];
        //}
    }
}

cubicBezier();