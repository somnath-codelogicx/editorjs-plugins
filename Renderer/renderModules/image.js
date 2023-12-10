import { _generateDomElementFromHtmlString } from "../utils"

export default class Image {
	constructor(data) {
		this.data = data
		this.warpper = undefined
	}

	async render() {
		const html = `<div></div>`
		this.wrapper = await _generateDomElementFromHtmlString(html)
		
		if (this.data && this.data.url) {
			await this._createImage()
		}
	
		return this.wrapper
	}
	
	_createImage () {
		return new Promise((resolve) => {
			const image = document.createElement('img')
			image.style.width = this.data.width
			image.style.height = this.data.height
			image.src = this.data.url
			this.wrapper.innerHTML = ''
			this.wrapper.style = 'margin: 8px 0px; display: flex; justify-content: ' + this.data.position
			this.wrapper.appendChild(image)
			resolve()
		})
	}
}
