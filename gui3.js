"use strict"


function imgui_create(canvas, options) {

	const env = {
		ctx: null,
		cto: null,
		options: null,
		active_id: 0,
		mouse: null,
	}
	env.options = options
	env.ctx = canvas.getContext("2d")
	env.cto = new OffscreenCanvas(canvas.width/options.scale, canvas.height/options.scale).getContext("2d")
	return env
}


// env includes predefined settings
// options include x, y, w, h, text
// mouse x, y, buttons
function imgui_button(env, options) {

	// determine state of the button
	const settings = env.options.button[component.state]

	const border = settings.border
	const bezel = settings.bezel
	const padding = settings.padding

	const x = options.x
	const y = options.y
	const text = options.text

	const cto = env.cto

	const t = {
		x: x + border + bezel + padding,
		y: y + border + bezel + padding + 1,
		text: text
	}
	let size = draw_text(env, t)
	ctx.lineCap = 'butt'

	// draw border
	cto.beginPath()
	cto.strokeStyle = settings.border_color
	cto.lineWidth = border
	// top line
	cto.moveTo(x + border, y + border / 2)
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + border / 2)
	// right line
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel + border / 2, y + border)
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel + border / 2, y + size.h + border + bezel + padding + padding + bezel)
	// bottom line
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel, y + size.h + border + bezel + padding + padding + bezel + border / 2)
	cto.lineTo(x + border, y + size.h + border + bezel + padding + padding + bezel + border / 2)
	// left line
	cto.moveTo(x + border / 2, y + size.h + border + bezel + padding + padding + bezel)
	cto.lineTo(x + border / 2, y + border)
	cto.stroke()

	// draw bezel
	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[0]
	cto.lineWidth = bezel
	// top line
	cto.moveTo(x + border, y + border + bezel / 2)
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + border + bezel / 2)
	// right line
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel / 2, y + border)
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel / 2, y + size.h + border + bezel + padding + padding)
	// left line
	cto.moveTo(x + border + bezel / 2, y + size.h + border + bezel + padding + padding + bezel)
	cto.lineTo(x + border + bezel / 2, y + border)
	cto.stroke()

	// draw bottom bezel
	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[1]
	cto.moveTo(x + size.w + border + bezel + padding + padding + bezel, y + size.h + border + bezel + padding + padding + bezel / 2)
	cto.lineTo(x + border, y + size.h + border + bezel + padding + padding + bezel / 2)
	cto.stroke()

	// draw top corners
	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[2]
	// top left
	cto.moveTo(x + border, y + border + bezel / 2)
	cto.lineTo(x + border + bezel, y + border + bezel / 2)
	// top right
	cto.moveTo(x + size.w + border + bezel + padding + padding, y + border + bezel / 2)
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + border + bezel / 2)
	cto.stroke()

	// draw bottom corners
	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[3]
	// bottom right
	cto.moveTo(x + border, y + size.h + border + bezel + padding + padding + bezel / 2)
	cto.lineTo(x + border + bezel, y + size.h + border + bezel + padding + padding + bezel / 2)
	// bottom right
	cto.moveTo(x + size.w + border + bezel + padding + padding, y + size.h + border + bezel + padding + padding + bezel / 2)
	cto.lineTo(x + size.w + border + bezel + padding + padding + bezel, y + size.h + border + bezel + padding + padding + bezel / 2)
	cto.stroke()

	const w = size.w + border + bezel + padding + padding + bezel
	const h = size.h + border + bezel + padding + padding + bezel + border
	ctx.drawImage(cto.canvas, options.x, options.y, w, h);

	return { clicked: false, w: w, h: h }
}


// env includes predefined settings
// options include x, y, w, h, text
// mouse x, y, buttons
function imgui_text(env, options) {

	const sh = 7
	const sy = 0
	const gap = 1

	const x = component.x
	const y = component.y
	const text = component.text

	const cto = env.cto

	let offset_x = 0
	let offset_y = 0
	let width = 0
	let height = 0

	for(let letter of text) {

		if(letter === '\n') {
			offset_y += sh
			offset_x = 0
		}
		else {

			let metrics = font_metrics[letter]

			// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
			let sx = metrics[0]
			let sw = metrics[1]

			let dx = x + offset_x
			let dy = y + offset_y
			let dw = sw
			let dh = sh
			offset_x += dw + gap

			cto.drawImage(font, sx, sy, sw, sh, dx, dy, dw, dh)
		}

		if(width < offset_x) {
			width = offset_x
		}
		if(height < offset_y) {
			height = offset_y
		}
	}

	height += sh
	width -= gap
	return { w: width, h: height }
}
