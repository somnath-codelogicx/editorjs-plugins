import { _generateDomElementFromHtmlString } from "../utils"

export default class LineBreak {
	constructor(data) {
		this.data = data
    this.warpper = undefined
	}

	async render() {
    const html = `
    <div class="editorjs-line-break" style="width: 100%;height: 100px;display: flex;justify-content: center;align-items: center;">
      <div style="height: 1px;width: 90%;background: #d9d9d9;"></div>
    </div>
    `
    this.warpper = await _generateDomElementFromHtmlString(html)
    return this.warpper
  }
}