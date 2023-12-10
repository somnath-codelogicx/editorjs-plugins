export default class Paragraph {
	constructor(data) {
		this.data = data
		this._element = null
		this._CSS = {
      block: 'cdx-block',
      wrapper: 'ce-paragraph'
    }
	}

	async render() {
		await this.drawView()
    return this._element;
  }

	drawView() {
		return new Promise((resolve) => {
			this._element = document.createElement('DIV');
			this._element.classList.add(this._CSS.wrapper, this._CSS.block);
			this._element.innerHTML = this.data.text || '';
			resolve()
		})
  }
}