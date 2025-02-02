"use strict";

const App = {

	new: function(canvas, settings) {

		const obj = Object.create(this);
		obj._components = [];
		obj._settings = settings;
		obj._cto = new OffscreenCanvas(canvas.width / settings.scale, canvas.height / settings.scale).getContext('2d');

		canvas.addEventListener('mousemove', obj.dispatch_event.bind(obj));
		canvas.addEventListener('mousedown', obj.dispatch_event.bind(obj));
		canvas.addEventListener('mouseup', obj.dispatch_event.bind(obj));

		return obj;
	},


	dispatch_event: function(evt) {

		if(evt instanceof MouseEvent) {

			const x = Math.floor((evt.clientX - evt.target.offsetLeft) / settings.scale);
			const y = Math.floor((evt.clientY - evt.target.offsetTop) / settings.scale);

			if(evt.type === 'mousedown') {
				const comps = this._components.filter(c => Button.isPrototypeOf(c));
				for(let c of comps) {
					if(c._x < x && x < c._x + c._w && c._y < y && y < c._y + c._h) {
						c._state = 'down';
					}
				}
			}

			if(evt.type === 'mouseup') {
				const comps = this._components.filter(c => Button.isPrototypeOf(c));
				for(let c of comps) {
					if(c._x < x && x < c._x + c._w && c._y < y && y < c._y + c._h) {
						c._state = 'default';
					}
				}
			}

			const handler = `on${evt.type}`;
			const comps = this._components.filter(c => typeof c[handler] === 'function');
			for(let c of comps) {
				if(c._x < x && x < c._x + c._w && c._y < y && y < c._y + c._h) {
					c.onmousedown(evt);
				}
			}
		}
	},


	render: function() {

		this._cto.save();

		for(let c of this._components) {
			if(Button.isPrototypeOf(c)) {
				this.draw_button(c);
			}
			else if(Text.isPrototypeOf(c)) {
				this.draw_text(c);
			}
			else if(Dialog.isPrototypeOf(c)) {
				this._cto.restore();
				this.draw_dialog(c);
			}
		}

		return this._cto;
	},


	create(settings) {

		let comp = null;
		if(settings.type === 'button') {
			comp = Button.new(settings);
		}
		else if(settings.type === 'text') {
			comp = Text.new(settings);
		}
		else if(settings.type === 'dialog') {
			comp = Dialog.new(settings);
		}

		if(comp !== null) {
			this._components.push(comp);
		}
		return comp;
	},


	draw_button: function(button) {

		const settings = this._settings.button[button._state];

		const border = settings.border;
		const bezel = settings.bezel;
		const padding = settings.padding;

		const x = button._x;
		const y = button._y;
		const text = button._text;

		const cto = this._cto;

		const t = {
			_x: x + border + bezel + padding,
			_y: y + border + bezel + padding + 1,
			_text: text
		};
		let size = this.draw_text(t);
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

		button._w = size.w + border + bezel + padding + padding + bezel, y + border;
		button._h = size.h + border + bezel + padding + padding + bezel + border;
	},


	draw_text: function(component) {

		const sh = 7;
		const sy = 0;
		const gap = 1;

		const x = component._x;
		const y = component._y;
		const text = component._text;

		const cto = this._cto;

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
		return {w: width, h: height};
	},


	draw_dialog: function(dialog) {

		const border = 1;
		const padding = 2;
		const titlebar = 11;

		const x = dialog._x;
		const y = dialog._y;
		const text = dialog._text;

		const cto = this._cto;


		cto.fillStyle = '#2d2733';
		cto.fillRect(dialog._x + border / 2, dialog._y + border / 2, dialog._w, dialog._h);

		cto.strokeStyle = 'black';
		cto.strokeRect(dialog._x + border / 2, dialog._y + border / 2, dialog._w, dialog._h);

		// draw titlebar
		cto.fillStyle = '#e2dfe6';
		cto.fillRect(dialog._x + border, dialog._y + border, dialog._w - border, titlebar);

		cto.beginPath();
		cto.moveTo(dialog._x + border, dialog._y  + border / 2 + titlebar);
		cto.lineTo(dialog._x + dialog._w, dialog._y  + border / 2 + titlebar);
		cto.stroke();

		cto.beginPath();
		cto.strokeStyle = 'white';
		cto.moveTo(dialog._x + border, dialog._y + border + border / 2);
		cto.lineTo(dialog._x + dialog._w, dialog._y + border + border / 2);
		cto.stroke();

		cto.strokeStyle = 'black';
		cto.strokeRect(dialog._x + border / 2, dialog._y + border / 2, dialog._w, dialog._h);

		let t = {
			_x: x + border + padding,
			_y: y + border + padding,
			_text: dialog._title
		};
		this.draw_text(t);



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


}


const Button = {

	new: function(settings) {

		const obj = Object.create(this);

		obj._x = settings.x;
		obj._y = settings.y;
		obj._w = 0;
		obj._h = 0;
		obj._text = settings.text;
		obj._state = 'default';

		// events
		obj.onmousemove = null;
		obj.onmousedown = null;
		obj.onmouseup = null;
		obj.onmouseclick = null;

		return obj;
	}
}


const Text = {

	new: function(settings) {

		const obj = Object.create(this);

		obj._x = settings.x;
		obj._y = settings.y;
		obj._text = settings.text;

		// events
		obj.onmousemove = null;
		obj.onmousedown = null;
		obj.onmouseup = null;
		obj.onmouseclick = null;

		return obj;
	}
}


const Dialog = {

	new: function(settings) {

		const obj = Object.create(this);

		obj._x = settings.x;
		obj._y = settings.y;
		obj._w = settings.w;
		obj._h = settings.h;
		obj._title = settings.title;
		obj._text = settings.text;
		obj._components = [];
		obj.onok = null;
		obj.oncancel = null;

		return obj;
	}
}