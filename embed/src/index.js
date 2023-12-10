/* eslint-disable jsdoc/require-jsdoc */
import SERVICES from './services';
import './index.css';
import { debounce } from 'debounce';

export default class CustomEmbed {
  constructor({ data, api, readOnly }) {
    this.api = api;
    this._data = {};
    this.element = null;
    this.readOnly = readOnly;
    this.iframeContainer = null;
    this.iframe = null;
    this.data = data;
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
    ];
  }

  set data(data) {
    if (!(data instanceof Object)) {
      throw Error('CustomEmbed Tool data should be object');
    }

    const { service, source, embed, width, height, caption = '', position = 'center' } = data;

    this._data = {
      service: service || this.data.service,
      source: source || this.data.source,
      embed: embed || this.data.embed,
      width: width || this.data.width,
      height: height || this.data.height,
      caption: caption || this.data.caption || '',
      position: this.data.position || position,
    };

    const oldView = this.element;

    if (oldView) {
      oldView.parentNode.replaceChild(this.render(), oldView);
    }
  }

  get data() {
    if (this.element) {
      const caption = this.element.querySelector(`.${this.api.styles.input}`);

      this._data.caption = caption ? caption.innerHTML : '';
    }

    return this._data;
  }

  get CSS() {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      container: 'embed-tool',
      containerLoading: 'embed-tool--loading',
      preloader: 'embed-tool__preloader',
      caption: 'embed-tool__caption',
      url: 'embed-tool__url',
      content: 'embed-tool__content',
    };
  }

  render() {
    if (!this.data.service) {
      const container = document.createElement('div');

      this.element = container;

      return container;
    }

    const { html } = CustomEmbed.services[this.data.service];
    const container = document.createElement('div');
    const caption = document.createElement('div');
    const template = document.createElement('template');
    const preloader = this.createPreloader();

    container.classList.add(this.CSS.baseClass, this.CSS.container, this.CSS.containerLoading);
    caption.classList.add(this.CSS.input, this.CSS.caption);

    container.appendChild(preloader);

    caption.contentEditable = !this.readOnly;
    caption.dataset.placeholder = this.api.i18n.t('Enter a caption');
    caption.innerHTML = this.data.caption || '';

    template.innerHTML = html;
    this.iframeContainer = template.content.querySelector('div.embed-iframe-container');
    this.iframeContainer.style.display = 'flex';
    this.iframeContainer.style.justifyContent = this.data.position;

    this.iframe = template.content.querySelector('iframe');

    this.iframe.style.height = this.data.height;
    this.iframe.style.width = this.data.width;

    this.iframe.setAttribute('src', this.data.embed);
    this.iframe.classList.add(this.CSS.content);

    const embedIsReady = this.embedIsReady(container);

    container.appendChild(template.content.firstChild);

    embedIsReady
      .then(() => {
        container.classList.remove(this.CSS.containerLoading);
      });

    this.element = container;

    return container;
  }

  renderSettings() {
    const wrapper = document.createElement('div');

    // if (this.isImageCreated) {
    this.settings.forEach(tune => {
      const button = document.createElement('div');

      button.classList.add('cdx-settings-button');
      button.innerHTML = tune.icon;
      wrapper.appendChild(button);

      switch (tune.name) {
        case 'height':
          // eslint-disable-next-line no-case-declarations
          const inputHeight = button.querySelector(`input[type="text"]`);

          inputHeight.value = this.data.height;
          inputHeight.addEventListener('input', (event) => {
            const value = event.target.value;

            // eslint-disable-next-line no-useless-escape
            if (value && value.match(/\%|px$/g)) {
              this.data.height = value;
              this.iframe.style.height = value;
            }
          });
          break;
        case 'width':
          // eslint-disable-next-line no-case-declarations
          const inputWidth = button.querySelector(`input[type="text"]`);

          inputWidth.value = this.data.width;
          inputWidth.addEventListener('input', (event) => {
            const value = event.target.value;

            // eslint-disable-next-line no-useless-escape
            if (value && value.match(/\%|px$/g)) {
              this.data.width = value;
              this.iframe.style.width = value;
            }
          });
          break;
        case 'position':
          // eslint-disable-next-line no-case-declarations
          const inputAlignmentElements = button.querySelectorAll('.image-alignment-container i');

          inputAlignmentElements.forEach(ele => {
            const dataAlign = ele.getAttribute('data-align');

            ele.style = this._getEmbedAlignmentClass(dataAlign);
            if (this.data.position === dataAlign) {
              ele.classList.add('active');
            }

            ele.addEventListener('click', (event) => {
              this.data.position = event.target.getAttribute('data-align');
              this.iframeContainer.style.justifyContent = this.data.position;
              const actveAlignmentButton = button.querySelector('.image-alignment-container i.active');

              actveAlignmentButton.classList.remove('active');
              actveAlignmentButton.style = this._getEmbedAlignmentClass(actveAlignmentButton.getAttribute('data-align'));
              ele.classList.add('active');
              ele.style = this._getEmbedAlignmentClass(event.target.getAttribute('data-align'));
            });
          });
          break;
        default:
          button.addEventListener('click', () => {
            button.classList.toggle('cdx-settings-button--active');
          });
      }
    });

    // }
    return wrapper;
  }

  createPreloader() {
    const preloader = document.createElement('preloader');
    const url = document.createElement('div');

    url.textContent = this.data.source;

    preloader.classList.add(this.CSS.preloader);
    url.classList.add(this.CSS.url);

    preloader.appendChild(url);

    return preloader;
  }

  save() {
    return this.data;
  }

  onPaste(event) {
    const { key: service, data: url } = event.detail;

    const { regex, embedUrl, width, height, id = (ids) => ids.shift() } = CustomEmbed.services[service];
    const result = regex.exec(url).slice(1);
    const embed = embedUrl.replace(/<%= remote_id %>/g, id(result));

    this.data = {
      service,
      source: url,
      embed,
      width,
      height,
    };
  }

  static prepare({ config = {} }) {
    const { services = {} } = config;

    let entries = Object.entries(SERVICES);

    const enabledServices = Object
      .entries(services)
      .filter(([key, value]) => {
        return typeof value === 'boolean' && value === true;
      })
      .map(([ key ]) => key);

    const userServices = Object
      .entries(services)
      .filter(([key, value]) => {
        return typeof value === 'object';
      })
      .filter(([key, service]) => CustomEmbed.checkServiceConfig(service))
      .map(([key, service]) => {
        const { regex, embedUrl, html, height, width, id } = service;

        return [key, {
          regex,
          embedUrl,
          html,
          height,
          width,
          id,
        } ];
      });

    if (enabledServices.length) {
      entries = entries.filter(([ key ]) => enabledServices.includes(key));
    }

    entries = entries.concat(userServices);

    CustomEmbed.services = entries.reduce((result, [key, service]) => {
      if (!(key in result)) {
        result[key] = service;

        return result;
      }

      result[key] = Object.assign({}, result[key], service);

      return result;
    }, {});

    CustomEmbed.patterns = entries
      .reduce((result, [key, item]) => {
        result[key] = item.regex;

        return result;
      }, {});
  }

  static checkServiceConfig(config) {
    const { regex, embedUrl, html, height, width, id } = config;

    let isValid = regex && regex instanceof RegExp &&
      embedUrl && typeof embedUrl === 'string' &&
      html && typeof html === 'string';

    isValid = isValid && (id !== undefined ? id instanceof Function : true);
    isValid = isValid && (height !== undefined ? Number.isFinite(height) : true);
    isValid = isValid && (width !== undefined ? Number.isFinite(width) : true);

    return isValid;
  }

  static get pasteConfig() {
    return {
      patterns: CustomEmbed.patterns,
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  embedIsReady(targetNode) {
    const PRELOADER_DELAY = 450;

    let observer = null;

    return new Promise((resolve, reject) => {
      observer = new MutationObserver(debounce(resolve, PRELOADER_DELAY));
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      });
    }).then(() => {
      observer.disconnect();
    });
  }

  _getEmbedAlignmentClass(position) {
    if (this.data.position === position) {
      return 'cursor:pointer;color: black;';
    }

    return 'cursor:pointer;color: #9d9d9d;';
  }
}
