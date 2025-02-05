"use strict";


function gui_init(canvas, options) {

	const env = {
		components: null,
		ctx: null,
		cto: null,
		options: options
	}

	env.components = []
	env.ctx = canvas.getContext("2d")
	env.cto = new OffscreenCanvas(canvas.width / options.scale, canvas.height / options.scale).getContext('2d')

	// canvas.addEventListener('mousemove', gui_onevent.bind(env))
	canvas.addEventListener("mousedown", gui_onevent.bind(env))
	canvas.addEventListener("mouseup", gui_onevent.bind(env))

	return env
}


function gui_create(env, options) {

	if(typeof options.class === "undefined") {
		return
	}

	let component = null
	if(options.class === "button") {
		component = {
			class: options.class,
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			text: "",
			state: "default",
			onmousemove: null,
			onmousedown: null,
			onmouseup: null,
			onmouseclick: null,
		}
		if(typeof options.x !== "undefined") component.x = options.x
		if(typeof options.y !== "undefined") component.y = options.y
		if(typeof options.text !== "undefined") component.text = options.text
	}
	else if(options.class === "text") {
		component = {
			class: options.class,
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			text: "",
			onmousemove: null,
			onmousedown: null,
			onmouseup: null,
			onmouseclick: null,
		}
		if(typeof options.x !== "undefined") component.x = options.x
		if(typeof options.y !== "undefined") component.y = options.y
		if(typeof options.text !== "undefined") component.text = options.text
	}
	else if(options.class === "dialog") {
		component = {
			class: options.class,
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			title: "",
			text: "",
			components: [],
			onok: null,
			oncancel: null,
		}
		if(typeof options.x !== "undefined") component.x = options.x
		if(typeof options.y !== "undefined") component.y = options.y
		if(typeof options.w !== "undefined") component.w = options.w
		if(typeof options.h !== "undefined") component.h = options.h
		if(typeof options.title !== "undefined") component.title = options.title
		if(typeof options.text !== "undefined") component.text = options.text
	}

	env.components.push(component)
	return component
}


function gui_onevent(evt) {

	const env = this

	if(evt instanceof MouseEvent) {

		const x = Math.floor((evt.clientX - evt.target.offsetLeft) / settings.scale);
		const y = Math.floor((evt.clientY - evt.target.offsetTop) / settings.scale);

		const handler = `on${evt.type}`;
		const buttons = env.components.filter(c => c.class === 'button');
		const comps = env.components.filter(c => c[handler] !== null);

		if(evt.type === "mousedown") {
			for(let c of buttons) {
				if(c.x < x && x < c.x + c.w && c.y < y && y < c.y + c.h) {
					c.state = "down";
				}
			}
		}

		if(evt.type === "mouseup") {
			for(let c of buttons) {
				if(c.x < x && x < c.x + c.w && c.y < y && y < c.y + c.h) {
					c.state = "default";
				}
			}
		}
		
		for(let c of comps) {
			if(c.x < x && x < c.x + c.w && c.y < y && y < c.y + c.h) {
				c[handler](evt);
			}
		}
	}
}


function gui_render(env) {
	
	for(let c of env.components) {
		// env.cto.save();
		if(c.class === "button") {
			draw_button(env, c);
		}
		else if(c.class === "text") {
			draw_text(env, c);
		}
		else if(c.class === "dialog") {
			draw_dialog(env, c);
		}
		// env.cto.restore();
	}

	return env.cto;
}


function draw_button(env, component) {

	const settings = env.options.button[component.state];

	const border = settings.border;
	const bezel = settings.bezel;
	const padding = settings.padding;

	const x = component.x;
	const y = component.y;
	const text = component.text;

	const cto = env.cto;

	const t = {
		x: x + border + bezel + padding,
		y: y + border + bezel + padding + 1,
		text: text
	};
	let size = draw_text(env, t);
	cto.lineCap = 'butt';

	// draw border
	cto.beginPath();
	cto.strokeStyle = settings.border_color;
	cto.lineWidth = border;
	// top line
	cto.moveTo(x + border, y + border / 2);
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + border / 2);
	// right line
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel + border / 2, y + border);
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel + border / 2, y + size.h + border + bezel + padding + padding + bezel);
	// bottom line
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel, y + size.h + border + bezel + padding + padding + bezel + border / 2);
	cto.lineTo(x + border, y + size.h + border + bezel + padding + padding + bezel + border / 2);
	// left line
	cto.moveTo(x + border / 2, y + size.h + border + bezel + padding + padding + bezel);
	cto.lineTo(x + border / 2, y + border);
	cto.stroke();

	// draw bezel
	cto.beginPath();
	cto.strokeStyle = settings.bezel_colors[0];
	cto.lineWidth = bezel;
	// top line
	cto.moveTo(x + border, y + border + bezel / 2);
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + border + bezel / 2);
	// right line
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel / 2, y + border);
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel / 2, y + size.h + border + bezel + padding + padding);
	// left line
	cto.moveTo(x + border + bezel / 2, y + size.h + border + bezel + padding + padding + bezel);
	cto.lineTo(x + border + bezel / 2, y + border);
	cto.stroke();

	// draw bottom bezel
	cto.beginPath();
	cto.strokeStyle = settings.bezel_colors[1];
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel, y + size.h + border + bezel + padding + padding + bezel / 2);
	cto.lineTo(x + border, y + size.h + border + bezel + padding + padding + bezel / 2);
	cto.stroke();

	// draw top corners
	cto.beginPath();
	cto.strokeStyle = settings.bezel_colors[2];
	// top left
	cto.moveTo(x + border, y + border + bezel / 2);
	cto.lineTo(x + border + bezel, y + border + bezel / 2);
	// top right
	cto.moveTo(x + size.w + border + bezel + padding + padding, y + border + bezel / 2);
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + border + bezel / 2);
	cto.stroke();

	// draw bottom corners
	cto.beginPath();
	cto.strokeStyle = settings.bezel_colors[3];
	// bottom right
	cto.moveTo(x + border, y + size.h + border + bezel + padding + padding + bezel / 2);
	cto.lineTo(x + border + bezel, y + size.h + border + bezel + padding + padding + bezel / 2);
	// bottom right
	cto.moveTo(x + size.w + border + bezel + padding + padding, y + size.h + border + bezel + padding + padding + bezel / 2);
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + size.h + border + bezel + padding + padding + bezel / 2);
	cto.stroke();

	component.w = size.w + border + bezel + padding + padding + bezel, y + border;
	component.h = size.h + border + bezel + padding + padding + bezel + border;
}

function draw_text(env, component) {

	const sh = 7;
	const sy = 0;
	const gap = 1;

	const x = component.x;
	const y = component.y;
	const text = component.text;

	const cto = env.cto;

	let offset_x = 0;
	let offset_y = 0;
	let width = 0;
	let height = 0;

	for(let letter of text) {

		if(letter === '\n') {
			offset_y += sh;
			offset_x = 0;
		}
		else {

			let metrics = font_metrics[letter];

			// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
			let sx = metrics[0];
			let sw = metrics[1];

			let dx = x + offset_x;
			let dy = y + offset_y;
			let dw = sw;
			let dh = sh;
			offset_x += dw + gap;

			cto.drawImage(font, sx, sy, sw, sh, dx, dy, dw, dh);
		}

		if(width < offset_x) {
			width = offset_x;
		}
		if(height < offset_y) {
			height = offset_y;
		}
	}

	height += sh;
	width -= gap;
	return { w: width, h: height };
}


function draw_dialog(env, component) {

	const border = 1;
	const padding = 2;
	const titlebar = 11;

	const cto = env.cto;

	cto.fillStyle = '#2d2733';
	cto.roundRect(component.x + border / 2, component.y + border / 2, component.w, component.h, 3);

	cto.strokeStyle = 'black';
	cto.strokeRect(component.x + border / 2, component.y + border / 2, component.w, component.h);

	// draw titlebar
	cto.fillStyle = '#e2dfe6';
	cto.fillRect(component.x + border, component.y + border, component.w - border, titlebar);

	cto.beginPath();
	cto.moveTo(component.x + border, component.y  + border / 2 + titlebar);
	cto.lineTo(component.x + component.w, component.y  + border / 2 + titlebar);
	cto.stroke();

	cto.beginPath();
	cto.strokeStyle = 'white';
	cto.moveTo(component.x + border, component.y + border + border / 2);
	cto.lineTo(component.x + component.w, component.y + border + border / 2);
	cto.stroke();

	cto.strokeStyle = 'black';
	cto.strokeRect(component.x + border / 2, component.y + border / 2, component.w, component.h);

	let t = {
		x: component.x + border + padding,
		y: component.x + border + padding,
		text: component.title
	};

	draw_text(env, t);

	// // draw border
	// cto.beginPath();
	// cto.strokeStyle = settings.border_color;
	// cto.lineWidth = border;
	// // top line
	// cto.moveTo(x + border, y + border / 2);
	// cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + border / 2);
	// // right line
	// cto.moveTo(x + size.w + border + bezel + padding + padding + bezel + border / 2, y + border);
	// cto.lineTo(x + size.w + border + bezel + padding + padding + bezel + border / 2, y + size.h + border + bezel + padding + padding + bezel);
	// // bottom line
	// cto.moveTo(x + size.w + border + bezel + padding + padding + bezel, y + size.h + border + bezel + padding + padding + bezel + border / 2);
	// cto.lineTo(x + border, y + size.h + border + bezel + padding + padding + bezel + border / 2);
	// // left line
	// cto.moveTo(x + border / 2, y + size.h + border + bezel + padding + padding + bezel);
	// cto.lineTo(x + border / 2, y + border);
	// cto.stroke();
}
