export function _generateDomElementFromHtmlString (html) {
	return new Promise((resolve) => {
		resolve(new DOMParser().parseFromString(html, "text/html").body.firstElementChild)
	})
}