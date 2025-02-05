"use strict";

let ctx = null;

const font = new Image();
font.src = 'font2.png';
font.onload = function(evt) { console.log('font loaded.'); };

window.addEventListener('load', window_on_load);

const settings = {
	scale: 2,
	button: {
		default: {
			border: 1,
			border_color: '#070511',
			bezel: 1,
			bezel_colors: ['#434048', '#1f1825', '#5e5965', '#393542'],
			padding: 1
		},
		down: {
			border: 1,
			border_color: '#070511',
			bezel: 1,
			bezel_colors: ['#27222a', '#2d2733', '#27222a', '#2d2733'],
			padding: 1
		}
	}
};
let env = null;
let button1 = null

function window_on_load(evt) {

	const canvas = document.getElementById('canvas');
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	env = gui_init(canvas, settings);

	const dialog = gui_create(env, { class: "dialog", x: 70, y: 70, w: 100, h: 50, title: "Dialog box", text: "Would you like\nto do this?!" });
	dialog.onok = dialog_on_ok;
	dialog.oncancel = dialog_on_cancel;

	gui_create(env, { class: "text", x: 5, y: 5, text: "How are you today, Papa?" });

	button1 = gui_create(env, { class: "button", x: 5, y: 15, text: "Good, thank you." });
	button1.onmousedown = button1_on_mousedown;

	const button2 = gui_create(env, { class: "button", x: 5, y: 35, text: "Not very well, thank you." });
	button2.onmousedown = button2_on_mousedown;

	loop();
}


function loop(timestamp) {

	let cto = gui_render(env);
	ctx.drawImage(cto.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
	window.requestAnimationFrame(loop);
}


function button1_on_mousedown(evt) {
	console.log('Good, Thank You.')
}


function button2_on_mousedown(evt) {
	console.log('Not very well, thank you.');
}


function dialog_on_ok(evt) {
	console.log('Ok');
}


function dialog_on_cancel(evt) {
	console.log('Cancel');
}