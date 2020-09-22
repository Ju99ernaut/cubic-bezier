/*
 * Original work, Copyright (c) 2013 Lea Verou. All rights reserved.
 * Modified work, Copyright (c) 2020 Brendon Ngirazi. All rights reserved.
 *
 */

import {
    prefix
} from './enviroment';

export class CubicBezier {
    /**
     * CubicBezier
     * 
     * Create a cubic-bezier object instance
     * 
     * @param {Array} coordinates
     */
    constructor(coordinates) {
        this.isCoordinates(coordinates)
        this.coordinates = this.decodeCoordinates(coordinates);
        this.coordinates = this.coordinates.map(n => {
            return +n;
        });
        //this.checkCoordinates(this.coordinates);
        this.coordinates.toString = () => {
            return this.coordinates.map(this.prettifyNumber) + '';
        }
    };

    isCoordinates(coordinates) {
        if (!coordinates) {
            throw 'No offsets were defined';
        }
    }

    decodeCoordinates(coordinates) {
        if (typeof coordinates === 'string') {
            if (coordinates.indexOf('#') === 0) {
                coordinates = coordinates.slice(1);
            }

            return coordinates.split(',');
        } else {
            return coordinates;
        }
    }

    checkCoordinates(coordinates) {
        for (let i = 4; i--;) {
            let xy = coordinates[i];
            if (isNaN(xy) || (!(i % 2) && (xy < 0 || xy > 1))) {
                throw 'Wrong coordinate at ' + i + '(' + xy + ')';
            }
        }
    };

    prettifyNumber = val => {
        return (Math.round(val * 100) / 100 + '').replace(/^0\./, '.');
    };

    get P1() {
        return this.coordinates.slice(0, 2);
    };

    get P2() {
        return this.coordinates.slice(2);
    };

    // Clipped to the range 0-1
    get clipped() {
        let coordinates = this.coordinates.slice();

        for (let i = coordinates.length; i--;) {
            coordinates[i] = Math.max(0, Math.min(coordinates[i], 1));
        }

        return new this(coordinates);
    };

    get inRange() {
        let coordinates = this.coordinates;

        return Math.abs(coordinates[1] - .5) <= .5 && Math.abs(coordinates[3] - .5) <= .5;
    };

    toString() {
        return 'cubic-bezier(' + this.coordinates + ')';
    };

    applyStyle(element) {
        element.style.setProperty(prefix + 'transition-timing-function', this, null);
    };
}

export class BezierCanvas {
    constructor(canvas, bezier, padding) {
        this.canvas = canvas;
        this.bezier = bezier;
        this.padding = this.getPadding(padding);

        // Convert to a cartesian coordinate system with axes from 0 to 1
        const ctx = this.canvas.getContext('2d'),
            p = this.padding;

        ctx.scale(canvas.width * (1 - p[1] - p[3]), -canvas.height * (1 - p[0] - p[2]));
        ctx.translate(p[3] / (1 - p[1] - p[3]), -1 - p[0] / (1 - p[0] - p[2]));
    }

    get offsets() {
        const p = this.padding,
            w = this.canvas.width,
            h = this.canvas.height;

        return [{
            left: w * (this.bezier.coordinates[0] * (1 - p[3] - p[1]) - p[3]) + 'px',
            top: h * (1 - this.bezier.coordinates[1] * (1 - p[0] - p[2]) - p[0]) + 'px'
        }, {
            left: w * (this.bezier.coordinates[2] * (1 - p[3] - p[1]) - p[3]) + 'px',
            top: h * (1 - this.bezier.coordinates[3] * (1 - p[0] - p[2]) - p[0]) + 'px'
        }]
    };

    offsetsToCoordinates(element) {
        let p = this.padding;
        const w = this.canvas.width,
            h = this.canvas.height;

        // Convert padding percentage to actual padding
        p = p.map((a, i) => {
            return a * (i % 2 ? w : h)
        });

        return [
            (parseInt(element.style.left) - p[3]) / (w + p[1] + p[3]),
            (h - parseInt(element.style.top) - p[2]) / (h - p[0] - p[2])
        ];
    };

    plot(settings) {
        const xy = this.bezier.coordinates,
            ctx = this.canvas.getContext('2d');

        const defaultSettings = {
            handleColor: 'rgba(0,0,0,.6)',
            handleThickness: .008,
            bezierColor: 'black',
            bezierThickness: .02
        };

        settings || (settings = {});

        for (let setting in defaultSettings) {
            (setting in settings) || (settings[setting] = defaultSettings[setting]);
        }

        ctx.clearRect(-.5, -.5, 2, 2);

        // Draw control handles
        ctx.beginPath();
        ctx.fillStyle = settings.handleColor;
        ctx.lineWidth = settings.handleThickness;
        ctx.strokeStyle = settings.handleColor;

        ctx.moveTo(0, 0);
        ctx.lineTo(xy[0], xy[1]);
        ctx.moveTo(1, 1);
        ctx.lineTo(xy[2], xy[3]);

        ctx.stroke();
        ctx.closePath();

        const r = 1.5 * settings.handleThickness;
        ctx.beginPath();
        ctx.arc(xy[0], xy[1], r, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(xy[2], xy[3], r, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        // Draw bezier curve
        ctx.beginPath();
        ctx.lineWidth = settings.bezierThickness;
        ctx.strokeStyle = settings.bezierColor;
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(xy[0], xy[1], xy[2], xy[3], 1, 1);
        ctx.stroke();
        ctx.closePath();
    };

    getPadding(padding) {
        let p = typeof padding === 'number' ? [padding] : padding;

        if (p.length === 1) {
            p[1] = p[0];
        }

        if (p.length === 2) {
            p[2] = p[0];
        }

        if (p.length === 3) {
            p[3] = p[1];
        }

        return p;
    };
}