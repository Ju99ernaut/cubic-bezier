# Cubic Bezier

>Cubic bezier curve editor based on [cubic-bezier.com](https://cubic-bezier.com/) modified to be easily customizable for embeding into other webapps.

[DEMO](https://codepen.io/ju99ernaut/pen/JjXzLoq)

## Quickstart

### HTML
```html
<head>
	<meta charset="utf-8" />
    <title>cubic-bezier</title>
    <link href="https://unpkg.com/cubic-bezier-editor/dist/css/cubic-bezier-editor.min.css" rel="stylesheet">
    <script src="https://unpkg.com/cubic-bezier-editor"></script>
</head>
<body></body>
```

### JS
```js
const bezierEditor = cubicBezier({
    /* Your options */
});
bezierEditor.init();
```

### CSS
```css
* {
	margin: 0;
}

body {
	background: rgb(46, 42, 42);
	font-family: 'Helvetica Neue', sans-serif;
	line-height: 1.4;
}
```

## Options

| Option | Description | Type | Default |
|-|-|-|-
| `appendTo` | Element or selector to append the editor | `HTMLElement` or `string` | `<body></body>` |
| `width` | width of the canvas, `height = width * 2`  | `number` | `150` |
| `default` | editor default values | `string` | `.25, .1, .25, 1` |
| `bezierThickness` | bezier curve thickness | `number` | `.015` |
| `handleThickness` | handle thickness | `number` | `.01` |
| `bezierColor` | bezier curve color | `string` | `#aaa4aa` |
| `handleColor` | handle color | `string` | `rgba(0,255,0,.6)` |
| `arrowKeys` | allow moving handle with arrow keys | `boolean` | `true` |
| `onClick` | when canvas is clicked move the closest handle to mouse position | `boolean` | `true` |
| `predefined` | predefined curves | `object` | `{'ease': '.25,.1,.25,1','linear': '0,0,1,1','ease-in': '.42,0,1,1','ease-out': '0,0,.58,1','ease-in-out': '.42,0,.58,1'}` |
| `padding` | canvas padding | `array` or `number` | `[.25, 0]` |
| `bezierLibrary` | bezier library options `width and height apply to each library item` | `object` | `{width:30,height:30,handleColor:'rgba(0,255,0,.6)',bezierColor:'#aaa4aa',handleThickness:.01,bezierThickness:.015}` |
| `input` | show input | `boolean` | `true` |
| `preview` | show preview animation | `boolean` | `true` |
| `duration` | preview animation duration | `number` | `1.5` |

## Reference
```js
cubicBezier.getValueArrayNum(bezier);//[0.25, 0.1, 0.25, 1]
cubicBezier.getValueArray(bezier);//[".25", " .1", " .25", " 1"]
cubicBezier.getValueString(bezier);//'.42,0,.58,1'
cubicBezier.getCss(bezier);//'cubic-bezier(.42,0,.58,1)'
cubicBezier.getDuration(bezier);//1.5
cubicBezier.checkCoordinates([".25", " .1", " .25", " 1"]);//true
```

## Download

* CDN
    * `https://unpkg.com/cubic-bezier-editor`
* NPM
    * `npm i cubic-bezier-editor`
* GIT 
    * `git clone https://github.com/Ju99ernaut/cubic-bezier.git`

## Usage

Browser
```js
<link href="https://unpkg.com/cubic-bezier-editor/dist/css/cubic-bezier-editor.min.css" rel="stylesheet">
<script src="https://unpkg.com/cubic-bezier-editor"></script>

<script>
    const bezierEditor = cubicBezier({
        /* Your options */
    });
    bezierEditor.init();
</script>
```

Modern Javascript
```js
import cubicBezier from 'cubic-bezier-editor';
import 'cubic-bezier-editor/dist/css/cubic-bezier-editor.min.css';

const bezierEditor = cubicBezier({
    /* Your options */
});
bezierEditor.init();
```

## Development

Clone repository

```sh
$ git clone https://github.com/Ju99ernaut/cubic-bezier.git
$ cd cubic-bezier
```

Install dependencies

```sh
$ npm i
```

Start dev server

```sh
$ npm start
```

Build

```sh
$ npm run build
```

## License

MIT