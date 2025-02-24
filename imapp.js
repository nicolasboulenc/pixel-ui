"use strict"

window.addEventListener('load', window_on_load)

let env = null
let canvas = null
let slider_value = 80

const settings = {
	scale: 6,
	font: null,
	button: {
		border: 1,
		bezel: 1,
		padding: 3,
		default: {
			background_color: '#2d2733',
			border_color: '#070511',
			bezel_colors: ['#434048', '#1f1825', '#5e5965', '#393542'],
		},
		active: {
			background_color: '#2d2733',
			border_color: '#070511',
			bezel_colors: ['#27222a', '#2d2733', '#27222a', '#2d2733'],
		}
	},
	slider: {
		border: 1,
		bezel: 1,
		padding: 3,
		default: {
			background_color: '#2d2733',
			border_color: '#070511',
			bezel_colors: ['#c1c1c3', '#3d3d3d', '#5e5965', '#393542'],	// 0=top, left, right 1=bottom 2=top corners 3=bottom corners
			meter_color: '#aaa6ae'
		}
	}
}




function window_on_load(evt) {

	canvas = document.getElementById('canvas')
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight
	canvas.addEventListener("mousemove", canvas_on_mousemove)
	canvas.addEventListener("mousedown", canvas_on_mousedown)
	canvas.addEventListener("mouseup", canvas_on_mouseup)

	settings.font = typeof font !== "undefined" ? font : null
	env = imgui_create(canvas, settings)

	loop()
}


function loop(timestamp) {

	imgui_start(env)

	const button = { id: imgui_generate_id(env), x: 400, y: 400, text: "test" }
	if( imgui_button(env, button) ) {
		console.log("test")
	}
	// document.querySelector(".debug > .right").innerHTML = `x: ${button.x} y: ${button.y} w: ${button.w} h: ${button.h} `

	const slider = { id: imgui_generate_id(env), x: 100, y: 100, w: 612, value: { min: 0, max: 100, current: slider_value } }
	let v = imgui_slider(env, slider)
	if(v !== slider_value) {
		slider_value = v
		// console.log(slider_value)
	}

	imgui_finish(env)

	window.requestAnimationFrame(loop)
}


function canvas_on_mousemove(evt) {
	let brect = canvas.getBoundingClientRect()
	env.mouse.x = evt.clientX - brect.left
	env.mouse.y = evt.clientY - brect.top
	document.querySelector(".debug > .left").innerHTML = `x: ${env.mouse.x} y: ${env.mouse.y} b: ${env.mouse.button}`
}


function canvas_on_mousedown(evt) {
	let brect = canvas.getBoundingClientRect()
	env.mouse.x = evt.clientX - brect.left
	env.mouse.y = evt.clientY - brect.top
	env.mouse.button = true
	env.mouse.button_changed_state = true
	document.querySelector(".debug > .left").innerHTML = `x: ${env.mouse.x} y: ${env.mouse.y} b: ${env.mouse.button}`
}


function canvas_on_mouseup(evt) {
	let brect = canvas.getBoundingClientRect()
	env.mouse.x = evt.clientX - brect.left
	env.mouse.y = evt.clientY - brect.top
	env.mouse.button = false
	env.mouse.button_changed_state = true
	document.querySelector(".debug > .left").innerHTML = `x: ${env.mouse.x} y: ${env.mouse.y} b: ${env.mouse.button}`
}

