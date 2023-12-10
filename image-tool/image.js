/* eslint-disable prettier/prettier */
export default class Image {
  constructor({ data, api, config, readOnly, block }) {
    this.api = api
    this.config = config
    this.data = {
      url: data.url ? data.url : '',
      height: data.height ? data.height : ( config.height ? config.height : '100%' ),
      width: data.width ? data.width : ( config.width ? config.width : '100%' ),
      position: data.position ? data.position : ( config.position ? config.position : 'center' ), // start|center|end
    };
    this.warpper = undefined
    this.isImageCreated = false
    this.settings = [
      {
        name: 'height',
        icon: `<div style="display: flex; justify-content: center; align-items: center; padding: 0px 4px;">
                  <label style="font-size: 15px;font-style: inherit;width: 60px;">Height</label>
                  <input
                    type="text"
                    value="${this.data.height}"
                    title="height"
                    style="width: 113px;margin-left: 4px;border: none;outline: none;font-size: 15px;padding: 0px 8px;"
                    placeholder="In px or in %"
                  >
                </div>
              `,
      },
      {
        name: 'width',
        icon: `<div style="display: flex; justify-content: center; align-items: center; padding: 0px 4px;">
                  <label style="font-size: 15px;font-style: inherit;width: 60px;">Width</label>
                  <input
                    type="text"
                    value="${this.data.width}"
                    title="height"
                    style="width: 113px;margin-left: 4px;border: none;outline: none;font-size: 15px;padding: 0px 8px;"
                    placeholder="In px or in %"
                  >
                </div>
              `,
      },
      {
        name: 'position',
        icon: `<div style="display: flex;align-items: center;padding: 0px 4px;cursor:default;">
                <span style="width: 60px;">Align</span>
                <div class="image-alignment-container" style="width: 113px;display: flex;justify-content: space-around;align-items: center;">
                  <i class="fa fa-align-left" data-align="start"></i>
                  <i class="fa fa-align-center" data-align="center"></i>
                  <i class="fa fa-align-right" data-align="end"></i>
                </div>
              </div>
              `,
      },
    ]
  }

  /**
   * Creates a tool box icon with text for the block.
   */
  static get toolbox() {
    return {
      title: 'Image',
      icon: '<i class="fa fa-image" style="font-size: 15px;"></i>',
    }
  }

  /**
   * Make this block as read only supported
   */
  static get isReadOnlySupported() {
    return true
  }

  /**
   * Automatic sanitize config
   */
  static get sanitize(){
    return {
      url: false, // disallow HTML
    }
  }

  /**
   * Configurations for paste event.
   */
  static get pasteConfig() {
    return {
      tags: ['IMG'],
      files: {
        mimeTypes: ['image/*'],
        extensions: ['gif', 'jpg', 'png', 'jpeg'],
      },
      patterns: {
        image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i,
      },
    }
  }

  /**
   * Handles the editor paste event.
   * @param {Object} event
   */
  onPaste(event) {
    switch (event.type) {
      case 'tag':
        this._createImage(event.detail.data.src)
        break
      case 'file':
        /* We need to read file here as base64 string */
        // eslint-disable-next-line no-case-declarations
        const reader = new FileReader()
        reader.onload = (loadEvent) => {
          this._createImage(loadEvent.target.result)
        }
        reader.readAsDataURL(event.detail.file)
        break
      case 'pattern':
        this._createImage(event.detail.data)
        break
    }
  }

  /**
   * Creates the wrapper element for image.
   * @returns {Element}
   */
  render() {
    if (this.data && this.data.url) {
      const html = `<div></div>`
      this.warpper = this._generateDomElementFromHtmlString(html)
      this._createImage(this.data.url)
    } else {
      const html = `
      <div
        style="margin: 8px 0px;cursor:pointer;border-radius: 8px;min-height: 250px;border: 2px dashed #b7b7b7;display: flex;justify-content: center;align-items: center;color: #818181;"
      >
        <span class="message-container">Select Image</span>
        <input
          type="file"
          style="display: none;"
          accept="image/png, image/gif, image/jpeg, image/jpg"
        />
      </div>
      `
      this.warpper = this._generateDomElementFromHtmlString(html)
      this.warpper.addEventListener('click', (event) => {
        if (this.warpper.querySelector(`input[type="file"]`))
          this.warpper.querySelector(`input[type="file"]`).click()
      })
      this.warpper
        .querySelector(`input[type="file"]`)
        .addEventListener('change', (event) => {
          this._uploadImage(event.target.files[0])
        })
    }
    return this.warpper
  }

  /**
   * Handles block tool settings
   * @returns {Element}
   */
  renderSettings() {
    const wrapper = document.createElement('div')
    if (this.isImageCreated) {
      this.settings.forEach((tune) => {
        const button = document.createElement('div')

        button.classList.add('cdx-settings-button')
        button.innerHTML = tune.icon
        wrapper.appendChild(button)

        switch (tune.name) {
          case 'height':
            // eslint-disable-next-line no-case-declarations
            const inputHeight = button.querySelector(`input[type="text"]`)
            inputHeight.value = this.data.height
            inputHeight.addEventListener('input', (event) => {
              const value = event.target.value
              // eslint-disable-next-line no-useless-escape
              if (value && value.match(/\%|px$/g)) {
                this.data.height = value
                this._alterImageDimentions('height', value)
              }
            })
            break
          case 'width':
            // eslint-disable-next-line no-case-declarations
            const inputWidth = button.querySelector(`input[type="text"]`)
            inputWidth.value = this.data.width
            inputWidth.addEventListener('input', (event) => {
              const value = event.target.value
              // eslint-disable-next-line no-useless-escape
              if (value && value.match(/\%|px$/g)) {
                this.data.width = value
                this._alterImageDimentions('width', value)
              }
            })
            break
          case 'position':
            // eslint-disable-next-line no-case-declarations
            const inputAlignmentElements = button.querySelectorAll('.image-alignment-container i')
            inputAlignmentElements.forEach(ele => {
              const dataAlign = ele.getAttribute('data-align')
              ele.style = this._getImageAlignmentClass(dataAlign)
              if (this.data.position === dataAlign) ele.classList.add('active')

              ele.addEventListener('click', (event) => {
                this.data.position = event.target.getAttribute('data-align')
                this._setImageWrapperStyle()
                const actveAlignmentButton = button.querySelector('.image-alignment-container i.active')
                actveAlignmentButton.classList.remove('active')
                actveAlignmentButton.style = this._getImageAlignmentClass(actveAlignmentButton.getAttribute('data-align'))
                ele.classList.add('active')
                ele.style = this._getImageAlignmentClass(event.target.getAttribute('data-align'))
              })
            })
            break
          default:
            button.addEventListener('click', () => {
              button.classList.toggle('cdx-settings-button--active');
            })
        }
      });
    }
    return wrapper;
  }

  /**
   * Handles save fumctionality.
   * @param {Element} blockContent
   * @returns {Object}
   */
  save(blockContent){
    return Object.assign(this.data, {
      url: blockContent.querySelector('img') ? blockContent.querySelector('img').src : ''
    })
  }

  /**
   *
   * @param {Object} savedData
   * @returns {Boolean}
   */
  validate(savedData){
    // eslint-disable-next-line no-unneeded-ternary
    return !savedData.url.trim() ? false : true
  }

  /**
   * Creates an image element and append it to the editor block.
   * @param {string} url
   */
  _createImage(url) {
    this._toggleIsImageAdded()
    const image = document.createElement('img')
    image.style.width = this.data.width
    image.style.height = this.data.height
    image.src = url
    this.warpper.innerHTML = ''
    this._setImageWrapperStyle()
    this.warpper.appendChild(image)
  }

  /**
   * Generates dom element form the given HTML string.
   * @param {string} html
   * @returns {Element}
   */
  _generateDomElementFromHtmlString(html) {
    return new DOMParser().parseFromString(html, "text/html").body.firstElementChild
  }

  // eslint-disable-next-line require-await
  async _getBase64Data(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this._createImage(reader.result)
    };
    reader.onerror = function () {}
  }

  async _uploadImage(file) {
    const msgContainer = this.warpper.querySelector('.message-container')
    try {
      msgContainer.textContent = 'Uploading...'
      const formData = new FormData()
      formData.append('images[]', file)
      formData.append('upload_path', 'richtext_editor')
      const res = (await this.config.platformApi.Upload.$axios.post('/upload/image', formData)).data
      if (res.data.cdn && res.data.images[0]) {
        const imgPath = res.data.cdn + res.data.images[0]
        this._createImage(imgPath)
      } else {
        msgContainer.style.color = "#ed5e5e"
        msgContainer.textContent = 'Something went wrong.'
      }
    } catch (err) {
      msgContainer.style.color = "#ed5e5e"
      msgContainer.textContent = 'Something went wrong.'
    }
  }

  /**
   * Toggles image added status
   */
  _toggleIsImageAdded() {
    this.isImageCreated = true
  }

  /**
   * Updates the image dimentions.
   * @param {string} property - height, width
   * @param {string} value
   */
  _alterImageDimentions(property, value) {
    const image = this.warpper.querySelector('img')
    switch(property) {
      case 'height':
        image.style.height = value
        break
      case 'width':
        image.style.width = value
        break
    }
  }

  /**
   * Returns image alignment class.
   */
  _getImageAlignmentClass(position) {
    if (this.data.position === position) return "cursor:pointer;color: black;"
    return "cursor:pointer;color: #9d9d9d;"
  }

  /**
   * Set image wrapper style
   */
  _setImageWrapperStyle() {
    this.warpper.style = 'margin: 8px 0px; display: flex; justify-content: ' + this.data.position
  }
}
