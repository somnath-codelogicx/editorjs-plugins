export default class List {
	constructor(data) {
		this.data = data
		this._elements = { wrapper: null }
		this.CSS = {
			baseBlock: 'cdx-block',
      wrapper: 'cdx-list',
      wrapperOrdered: 'cdx-list--ordered',
      wrapperUnordered: 'cdx-list--unordered',
      item: 'cdx-list__item',
		}
	}

	async render() {
    this._elements.wrapper = await this.makeMainTag(this.data.style)

    if (this.data.items.length) {
      this.data.items.forEach(async (item) => {
				const child = await this._make('li', this.CSS.item, { innerHTML: item })
        this._elements.wrapper.appendChild(child)
      });
    } else {
			const child = await this._make('li', this.CSS.item)
      this._elements.wrapper.appendChild(child)
    }

    return this._elements.wrapper;
  }

	async makeMainTag(style) {
		const styleClass = style === 'ordered' ? this.CSS.wrapperOrdered : this.CSS.wrapperUnordered;
		const tag = style === 'ordered' ? 'ol' : 'ul';
		const t = await this._make(tag, [this.CSS.baseBlock, this.CSS.wrapper, styleClass])
		return t
  }

	_make(tagName, classNames = null, attributes = {}) {
		return new Promise((resolve) => {
			const el = document.createElement(tagName)
			el.classList.add(...classNames)
	
			for (const attrName in attributes) {
				el[attrName] = attributes[attrName]
			}
	
			resolve(el)
		})
  }
}