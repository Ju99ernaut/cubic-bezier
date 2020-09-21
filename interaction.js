/*
 * Copyright (c) 2013 Lea Verou. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

(function () {

	const self = window.bezierLibrary = {
		curves: {},

		render: function () {
			const items = $$('a', library);

			for (let i = items.length; i--;) {
				library.removeChild(items[i]);
			}

			for (let name in self.curves) {
				try {
					self.add(name, new CubicBezier(self.curves[name]));
				} catch (e) {
					console.error(e);
				}
			}
		},

		add: function (name, bezier) {
			const canvas = document.createElement('canvas')
			canvas.width = 30;
			canvas.height = 30;
			const a = document.createElement('a')
			//href: '#' + bezier.coordinates,
			a.title = name;
			a.bezier = bezier;
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
			button.classList = 'button';
			button.onclick = function (e) {
				e.stopPropagation();

				//?Remove prompt
				//if (confirm('Are you sure you want to delete this? There is no going back!')) {
				//	self.deleteItem(this.parentNode);
				//}
				self.deleteItem(this.parentNode);

				return false;
			};
			a.appendChild(button);

			a.bezierCanvas.plot(self.thumbnailStyle);

			a.onclick = this.selectThumbnail;

			//if (!/^a$/i.test(a.previousElementSibling.nodeName)) {
			//	a.onclick();
			//}
		},

		selectThumbnail: function () {
			//?currently sets preview but should set curve coordinates and update input
			const selected = $('.selected', this.parentNode);

			if (selected) {
				selected.classList.remove('selected');
				selected.bezierCanvas.plot(self.thumbnailStyle);
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
				handleColor: 'rgba(0,255,0,.6)',
				bezierColor: '#aaa4aa',
				handleThickness: .01,
				bezierThickness: .015
			});

			//var params = $$('.param', bezierCode),
			//	prettyOffsets = bezier.coordinates.toString().split(',');
			//for (var i = params.length; i--;) {
			//	params[i].textContent = prettyOffsets[i];
			//}
		},

		deleteItem: function (a) {
			const name = $('span', a).textContent;

			delete bezierLibrary.curves[name];

			bezierLibrary.save();

			library.removeChild(a);

			if (a.classList.contains('selected')) {
				$('a:first-of-type', library).onclick();
			}
		},

		save: function (curves) {
			localStorage.curves = JSON.stringify(curves || self.curves);
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

})();

/**
 * Init
 */

// Ensure global vars for ids (most browsers already do this anyway, so…)
//[
//	'values', 'curve', 'P1', 'P2', 'current', 'compare', 'duration',
//	'library', 'save', 'copy', 'copyoptionstoggle', 'copybuttons', 'copyoptions', 'copystatement', 'copycss', 'copyvalue', 'go', 'import', 'export', 'json', 'importexport'
//].forEach(function (id) {
//	window[id] = $('#' + id);
//});
[
	'values', 'curve', 'P1', 'P2', 'library', 'save'
].forEach(function (id) {
	window[id] = $('#' + id);
});

const ctx = curve.getContext("2d"),
	bezierCode = $('h1 code'),
	curveBoundingBox = curve.getBoundingClientRect(),
	bezierCanvas = new BezierCanvas(curve, null, [.25, 0]),
	//currentCanvas = new BezierCanvas(current, null, .15),
	//compareCanvas = new BezierCanvas(compare, null, .15),
	//favicon = document.createElement('canvas'),
	//faviconCtx = favicon.getContext('2d'),
	pixelDepth = window.devicePixelRatio || 1;

// Add predefined curves
if (!localStorage.curves) {
	bezierLibrary.save(CubicBezier.predefined);
}

bezierLibrary.curves = JSON.parse(localStorage.curves);

bezierLibrary.render();

//if (location.hash) {
//	.25,.1,.25,1
//	bezierCanvas.bezier = window.bezier = new CubicBezier(decodeURI(location.hash));
//
//	var offsets = bezierCanvas.offsets;
//
//	P1.style.prop(offsets[0]);
//	P2.style.prop(offsets[1]);
//}
bezierCanvas.bezier = window.bezier = new CubicBezier(".25, .1, .25, 1"); //?Change to input
const offsets = bezierCanvas.offsets;
P1.style.left = offsets[0]['left'];
P1.style.top = offsets[0]['top'];
P2.style.left = offsets[1]['left'];
P2.style.top = offsets[1]['top'];

//favicon.width = favicon.height = 16 * pixelDepth;

update();
//updateDelayed();

/**
 * Event handlers
 */
// Make the handles draggable
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
			//updateDelayed();

			return false;
		}
	};

//P1.onblur =
//	P2.onblur =
//	P1.onmouseup =
//	P2.onmouseup = updateDelayed;

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
	//updateDelayed();

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
//?Remove below not required
//copy.onclick = function () {
//	copystatement.select();
//	copystatement.setSelectionRange(0, 99999);
//	document.execCommand("copy");
//	copybuttons.classList.remove('copyoptions-open');
//	copybuttons.classList.add('copied');
//	copybuttons.addEventListener("animationend", handleCopyAnimationComplete, false);
//}
//handleOptionCopy = function () {
//	this.select();
//	this.setSelectionRange(0, 99999);
//	document.execCommand("copy");
//	copybuttons.classList.remove('copyoptions-open');
//	copybuttons.classList.add('copied');
//	copybuttons.addEventListener("animationend", handleCopyAnimationComplete, false);
//}
//
//function handleCopyAnimationComplete() {
//	copybuttons.removeEventListener("animationend", handleCopyAnimationComplete, false);
//	copybuttons.classList.remove('copied');
//}
//copycss.onclick = handleOptionCopy;
//copystatement.onclick = handleOptionCopy; //?Keep and modify this
//copyvalue.onclick = handleOptionCopy;
//copyoptionstoggle.onclick = function () {
//	copybuttons.classList.toggle('copyoptions-open');
//}
//?Remove above

save.onclick = function () {
	const rawValues = bezier.coordinates + '';
	bezierLibrary.add(rawValues, bezier);
	bezierLibrary.curves[rawValues] = rawValues;
	bezierLibrary.save();
};

//?Remove below not required
//go.onclick = function () {
//	updateDelayed();
//
//	current.classList.toggle('move');
//	compare.classList.toggle('move');
//};
//
//duration.oninput = function () {
//	var val = getDuration();
//	this.nextElementSibling.textContent = val + ' second' + (val == 1 ? '' : 's');
//	current.style.setProperty(prefix + 'transition-duration', val + 's', null);
//	compare.style.setProperty(prefix + 'transition-duration', val + 's', null);
//	updateCopyInputs();
//};
//
//window['import'].onclick = function () {
//	json.value = '';
//
//	importexport.className = 'import';
//
//	json.focus();
//};
//
//window['export'].onclick = function () {
//	json.value = localStorage.curves;
//
//
//	importexport.className = 'export';
//
//	json.focus();
//};
//
//// Close button
//importexport.elements[2].onclick = function () {
//	this.parentNode.removeAttribute('class');
//
//	return false;
//};
//
//importexport.onsubmit = function () {
//	if (this.className === 'import') {
//		var overwrite = !confirm('Add to current curves? Clicking “Cancel” will overwrite them with the new ones.');
//
//		try {
//			var newCurves = JSON.parse(json.value);
//		} catch (e) {
//			alert('Sorry mate, this doesn’t look like valid JSON so I can’t do much with it :(');
//			return false;
//		}
//
//		if (overwrite) {
//			bezierLibrary.curves = newCurves;
//		} else {
//			for (var name in newCurves) {
//				var i = 0,
//					newName = name;
//
//				while (bezierLibrary.curves[newName]) {
//					newName += '-' + ++i;
//				}
//
//				bezierLibrary.curves[newName] = newCurves[name];
//			}
//		}
//
//		bezierLibrary.render();
//		bezierLibrary.save();
//	}
//
//	this.removeAttribute('class');
//};
//
///**
// * Helper functions
// */
//
//function getDuration() {
//	return (isNaN(val = Math.round(duration.value * 10) / 10)) ? null : val;
//}
//?Remove above

function update() {
	// Redraw canvas
	bezierCanvas.bezier =
		//currentCanvas.bezier =
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

	//currentCanvas.plot({
	//	handleColor: 'rgba(255,255,255,.5)',
	//	bezierColor: 'white',
	//	handleThickness: .03,
	//	bezierThickness: .06
	//});


	//updateCopyInputs();
	//var params = $$('.param', bezierCode),
	//	prettyOffsets = bezier.coordinates.toString().split(',');
	//
	//for (var i = params.length; i--;) {
	//	params[i].textContent = prettyOffsets[i];
	//}
}

//?modify for value in copystatement
//function updateCopyInputs() {
//!copystatement.value = "cubic-bezier(" + bezier.coordinates.toString() + ")";
//copycss.value = getDuration() + "s cubic-bezier(" + bezier.coordinates.toString() + ")";
//copyvalue.value = bezier.coordinates.toString();
//var items = document.querySelectorAll('#copyoptions input');
//for (var i = items.length; i--;) {
//	//var width = copycss.value.length * 11;
//	items[i].style.width = width + 'px';
//}

//}

// For actions that can wait
function updateDelayed() {
	//bezier.applyStyle(current);

	const hash = '#' + bezier.coordinates,
		size = 16 * pixelDepth;

	//bezierCode.parentNode.href = hash;

	if (history.pushState) {
		history.pushState(null, null, hash);
	} else {
		location.hash = hash;
	}




	// Draw dynamic favicon
	//? Remove below favicon not needed
	//faviconCtx
	//	.clearRect(0, 0, size, size)
	//	.prop('fillStyle', '#0ab')
	//	.roundRect(0, 0, size, size, 2)
	//	.fill()
	//	.drawImage(current, 0, 0, size, size);
	//
	//
	//$('link[rel="shortcut icon"]').setAttribute('href', favicon.toDataURL());
	//
	//document.title = bezier + ' ✿ cubic-bezier.com';
	//? Remove above
}