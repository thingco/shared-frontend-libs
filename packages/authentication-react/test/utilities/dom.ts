import { JSDOM } from "jsdom";

const { window } = new JSDOM("<html><body></body></html>");

export function setupFakeDom() {
	// @ts-ignore
	global.window = window;
	global.document = window.document;
	global.navigator = window.navigator;
	global.getComputedStyle = window.getComputedStyle;
	// @ts-expect-error "This is not how requestAnimationFrame actually functions"
	global.requestAnimationFrame = null;
}


export function resetFakeDom() {
	window.document.title = "";
	window.document.head.innerHTML = "";
	window.document.body.innerHTML = "<main></main>";
}
