export default class LineBreak {
  constructor() {
    this.warpper = undefined
  }

  /**
   * Creates a tool box icon with text for the block.
   */
  static get toolbox() {
    return {
      title: 'Line Break',
      icon: '<i class="fa fa-ellipsis-h" style="font-size: 15px;"></i>',
    }
  }

  /**
   * Make this block as read only supported
   */
  static get isReadOnlySupported() {
    return true
  }

  /**
   * Creates the wrapper element for line break.
   * @returns {Element}
   */
  render() {
    const html = `
    <div class="editorjs-line-break" style="width: 100%;height: 100px;display: flex;justify-content: center;align-items: center;">
      <div style="height: 1px;width: 90%;background: #d9d9d9;"></div>
    </div>
    `
    this.warpper = this._generateDomElementFromHtmlString(html)
    return this.warpper
  }

  /**
   * Generates dom element form the given HTML string.
   * @param {string} html
   * @returns {Element}
   */
  _generateDomElementFromHtmlString(html) {
    return new DOMParser().parseFromString(html, 'text/html').body
      .firstElementChild
  }

  /**
   * Handles save fumctionality.
   * @param {Element} blockContent
   * @returns {Object}
   */
  save(blockContent) {
    return {}
  }
}
