"use strict"


function imgui_create(canvas, settings) {

	const env = {
		ctx: null,
		cto: null,
		settings: null,
		next_id: 1,
		hot_id: 0,
		active_id: 0,
		mouse: { x: 0, y: 0, button: false, button_changed_state: false },
	}

	env.settings = settings
	// env.ctx = canvas.getContext("2d", { alpha: false })
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
	if(env.mouse.button_changed_state === true) {
		env.mouse.button_changed_state = false
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

	const is_hot =	options.x < env.mouse.x && env.mouse.x < options.x + w * env.settings.scale && 
					options.y < env.mouse.y && env.mouse.y < options.y + h * env.settings.scale

	if(is_hot) {
		env.hot_id = options.id
	}
	else if(env.hot_id === options.id) {
		env.hot_id = 0
	}
	if(env.hot_id === options.id && env.active_id === 0 && env.mouse.button === true && env.mouse.button_changed_state === true) {
		env.active_id = options.id
	}

	let state = "default"
	if(options.id === env.active_id) {
		state = "active"
	}
	const settings = env.settings.button[state]

	const x = 0
	const y = 0
	const cto = env.cto

	if(cto.lineCap !== "butt") {
		cto.lineCap = "butt"
	}

	cto.clearRect(x, y, w, h)

	// draw border
	const borderw = w - border
	const borderh = h - border
	const border12 = border / 2
	cto.beginPath()
	cto.strokeStyle = settings.border_color
	cto.lineWidth = border
	// top line
	cto.moveTo(x + border,	y + border12)
	cto.lineTo(x + borderw, y + border12)
	// right line
	cto.moveTo(x + borderw + border12, y + border)
	cto.lineTo(x + borderw + border12, y + borderh)
	// bottom line
	cto.moveTo(x + borderw, y + borderh + border12)
	cto.lineTo(x + border,	y + borderh + border12)
	// left line
	cto.moveTo(x + border12, y + borderh)
	cto.lineTo(x + border12, y + border)
	cto.stroke()

	// draw bezel
	const bezel12 = bezel / 2
	// draw bottom bezel
	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[1]
	cto.moveTo(x + borderw, y + borderh - bezel12)
	cto.lineTo(x + border, y + borderh - bezel12)
	cto.stroke()

	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[0]
	cto.lineWidth = bezel
	// left line
	cto.moveTo(x + border + bezel12, y + borderh)
	cto.lineTo(x + border + bezel12, y + border + bezel12)
	// top line
	// cto.moveTo(x + border + bezel12, y + border + bezel12)
	cto.lineTo(x + borderw - bezel12, y + border + bezel12)
	// right line
	// cto.moveTo(x + borderw - bezel12, y + border + bezel12)
	cto.lineTo(x + borderw - bezel12, y + borderh)
	cto.stroke()

	// fill inside borders
	cto.fillStyle = settings.background_color;
	cto.fillRect(x + border + bezel, y + border + bezel, borderw - border - border - bezel, borderh - border - border - bezel);

	// draw top corners
	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[2]
	// top left
	cto.moveTo(x + border + bezel12, y + border)
	cto.lineTo(x + border + bezel12, y + border + bezel12)
	// top right
	cto.moveTo(x + borderw - bezel12, y + border)
	cto.lineTo(x + borderw - bezel12, y + border + bezel12)
	cto.stroke()

	// draw bottom corners
	cto.beginPath()
	cto.strokeStyle = settings.bezel_colors[3]
	// bottom left
	cto.moveTo(x + border + bezel12, y + borderh)
	cto.lineTo(x + border + bezel12, y + borderh - bezel12)
	// bottom right
	cto.moveTo(x + borderw - bezel12, y + borderh)
	cto.lineTo(x + borderw - bezel12, y + borderh - bezel12)
	cto.stroke()

	text_opt.x = x + border + bezel + padding
	text_opt.y = y + border + bezel + padding + 1
	imgui_text(env, text_opt)

	env.ctx.drawImage(cto.canvas, x, y, w, h, options.x, options.y, options.w, options.h)

	const trigger = (env.active_id === options.id && env.hot_id === options.id && env.mouse.button === false)
	return trigger
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


function imgui_slider(env, options) {

	const text_opt = { x: 0, y: 0, text: `${options.value.current}` }
	let size = imgui_text_size(env, text_opt)

	const border = env.settings.slider.border
	const bezel = env.settings.slider.bezel
	const padding = env.settings.slider.padding
	const w = Math.floor(options.w / env.settings.scale) + ( options.w % env.settings.scale > 0 ? 1 : 0 )
	const h = size.h + border + bezel + padding + padding + bezel + border
	// options.w = w * env.settings.scale
	options.h = h * env.settings.scale

	const is_hot =	options.x < env.mouse.x && env.mouse.x < options.x + w * env.settings.scale && 
					options.y < env.mouse.y && env.mouse.y < options.y + h * env.settings.scale
	if(is_hot) {
		env.hot_id = options.id
	}
	else if(env.hot_id === options.id) {
		env.hot_id = 0
	}
	if(env.hot_id === options.id && env.active_id === 0 && env.mouse.button === true && env.mouse.button_changed_state === true) {
		env.active_id = options.id
	}

	let value = options.value.current
	if(env.active_id === options.id && env.mouse.button === true) {
		const offset = (env.mouse.x - options.x - border * env.settings.scale)
		const ratio = offset / (options.w - border * env.settings.scale * 2)
		value = Math.round(options.value.min + (options.value.max - options.value.min) * ratio)
		value = Math.max(value, options.value.min)
		value = Math.min(value, options.value.max)
	}

	let state = "default"
	const settings = env.settings.slider[state]

	const x = 0
	const y = 0
	const cto = env.cto

	if(cto.lineCap !== "butt") {
		cto.lineCap = "butt"
	}

	cto.clearRect(x, y, w, h)

	// draw border
	const borderw = w - border
	const borderh = h - border
	const border12 = border / 2
	cto.beginPath()
	cto.strokeStyle = settings.border_color
	cto.lineWidth = border
	// top line
	cto.moveTo(x + border,	y + border12)
	cto.lineTo(x + borderw, y + border12)
	// right line
	cto.moveTo(x + borderw + border12, y + border)
	cto.lineTo(x + borderw + border12, y + borderh)
	// bottom line
	cto.moveTo(x + borderw, y + borderh + border12)
	cto.lineTo(x + border,	y + borderh + border12)
	// left line
	cto.moveTo(x + border12, y + borderh)
	cto.lineTo(x + border12, y + border)
	cto.stroke()

	const bezel12 = bezel / 2
	// draw meter
	const mw = Math.floor((w - border - border) / (options.value.max - options.value.min) * (value - options.value.min))
	if(mw > 0) {
		cto.fillStyle = settings.meter_color;
		cto.fillRect(x + border + bezel, y + border + bezel, mw - border - bezel, borderh - border - border - bezel);

		cto.beginPath()
		cto.strokeStyle = settings.bezel_colors[0]
		cto.lineWidth = bezel
		// left line
		cto.moveTo(x + border + bezel12, y + borderh)
		cto.lineTo(x + border + bezel12, y + border + bezel12)
		// top line
		cto.moveTo(x + border + bezel12, y + border + bezel12)
		cto.lineTo(x + mw, y + border + bezel12)
		if(value === options.value.max) {
			// right line
			cto.moveTo(x + w - border - bezel12, y + border)
			cto.lineTo(x + w - border - bezel12, y + borderh)
		}
		cto.stroke()

		cto.beginPath()
		cto.strokeStyle = settings.bezel_colors[1]
		cto.lineWidth = bezel
		// top line
		cto.moveTo(x + border + bezel12, y + borderh - bezel12)
		cto.lineTo(x + mw, y + borderh - bezel12)
		cto.stroke()
	}

	// fill inside borders
	if(mw < (w - border - border)) {
		cto.fillStyle = settings.background_color;
		cto.fillRect(x + mw, y + border, w - mw - border, borderh - border);
	}


	// draw top corners
	cto.strokeStyle = settings.bezel_colors[2]
	// top left
	if(mw > 0) {
		cto.beginPath()
		cto.moveTo(x + border + bezel12, y + border)
		cto.lineTo(x + border + bezel12, y + border + bezel12)
		cto.stroke()
	}
	// top right
	if(mw == (w - border - border)) {
		cto.beginPath()
		cto.moveTo(x + borderw - bezel12, y + border)
		cto.lineTo(x + borderw - bezel12, y + border + bezel12)
		cto.stroke()
	}

	// draw bottom corners
	cto.strokeStyle = settings.bezel_colors[3]
	// bottom left
	if(mw > 0) {
		cto.beginPath()
		cto.moveTo(x + border + bezel12, y + borderh)
		cto.lineTo(x + border + bezel12, y + borderh - bezel12)
		cto.stroke()
	}
	// bottom right
	if(mw == (w - border - border)) {
		cto.beginPath()
		cto.moveTo(x + borderw - bezel12, y + borderh)
		cto.lineTo(x + borderw - bezel12, y + borderh - bezel12)
		cto.stroke()
	}

	text_opt.text = value.toString()
	text_opt.x = x + Math.floor((w - size.w) / 2)
	text_opt.y = y + border + bezel + padding + 1
	imgui_text(env, text_opt)

	// env.ctx.clearRect(options.x, options.y, options.w, options.h)
	env.ctx.drawImage(cto.canvas, x, y, w, h, options.x, options.y, options.w, options.h)
	return value
}

function imgui_generate_id(env) {
	const id = `id${env.next_id++}`
	return id
}