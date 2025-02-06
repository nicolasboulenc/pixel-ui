"use strict"


function imgui_create(canvas, settings) {

	const env = {
		ctx: null,
		cto: null,
		settings: null,
		next_id: 1,
		hot_id: 0,
		active_id: 0,
		mouse: { x: 0, y: 0, button: false },
	}

	env.settings = settings
	env.ctx = canvas.getContext("2d")
	env.ctx.imageSmoothingEnabled = false
	env.cto = new OffscreenCanvas(canvas.width/settings.scale, canvas.height/settings.scale).getContext("2d")
	return env
}


function imgui_start(env) {
	env.next_id = 1
}


function imgui_finish(env) {
	if(env.mouse.button === false) {
		env.active_id = 0
	}
}


// env includes predefined settings
// options include x, y, w, h, text
// mouse x, y, buttons
function imgui_button(env, options) {

	const text_opt = { x: 0, y: 0, text: options.text }
	let size = imgui_text_size(env, text_opt)

	const border = env.settings.button.border
	const bezel = env.settings.button.bezel
	const padding = env.settings.button.padding
	const w = size.w + border + bezel + padding + padding + bezel + border
	const h = size.h + border + bezel + padding + padding + bezel + border
	options.w = w * env.settings.scale
	options.h = h * env.settings.scale

	if( options.x < env.mouse.x && env.mouse.x < options.x + w * env.settings.scale && 
		options.y < env.mouse.y && env.mouse.y < options.y + h * env.settings.scale ) {
		env.hot_id = options.id
		if(env.active_id === 0 && env.mouse.button === true) {
			env.active_id = options.id
		}
	}

	let state = "default"
	if(options.id === env.active_id) {
		state = "active"
	}
	const settings = env.settings.button[state]

	const x = 0
	const y = 0
	const cto = env.cto

	cto.lineCap = 'butt'

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

	text_opt.x = x + border + bezel + padding
	text_opt.y = y + border + bezel + padding + 1
	imgui_text(env, text_opt)

	env.ctx.drawImage(cto.canvas, x, y, w, h, options.x, options.y, options.w, options.h)

	return (env.active_id === options.id && env.mouse.button === false)
}


// env includes predefined settings
// options include x, y, w, h, text
// mouse x, y, buttons
function imgui_text(env, options) {

	const sh = env.settings.font.sh
	const sy = env.settings.font.sy
	const gap = env.settings.font.gap
	const img = env.settings.font.img
	const metrics = env.settings.font.metrics

	const x = options.x
	const y = options.y
	const text = options.text

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
			// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
			let sx = metrics[letter][0]
			let sw = metrics[letter][1]

			let dx = x + offset_x
			let dy = y + offset_y
			let dw = sw
			let dh = sh
			offset_x += dw + gap

			cto.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
		}

		if(width < offset_x) {
			width = offset_x
		}
		if(height < offset_y) {
			height = offset_y
		}
	}

	options.h += sh
	options.w -= gap
	env.ctx.drawImage(cto.canvas, options.x, options.y, width, height);
}


function imgui_text_size(env, options) {

	// I dont think the width works on multiline

	let offset_x = 0
	let offset_y = 0

	for(let letter of options.text) {

		if(letter === '\n') {
			offset_y += env.settings.font.sh
			offset_x = 0
		}
		else {
			offset_x += env.settings.font.metrics[letter][1] + env.settings.font.gap
		}
	}

	const width = offset_x - env.settings.font.gap
	const height = offset_y + env.settings.font.sh
	return { w: width, h: height }
}


function imgui_generate_id(env) {
	const id = `id${env.next_id++}`
	return id
}