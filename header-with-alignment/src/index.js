// import { GroupedEmojies } from './Emoies';
// import { GroupedEmojies } from "./Emoies";
const GroupedEmojies = require('./Emoies').GroupedEmojies

/**
 * Build styles
 */
require("./index.css").toString();

/**
 * @typedef {object} HeaderData
 * @description Tool's input and output data format
 * @property {string} text — Header's content
 * @property {number} level - Header's level from 1 to 6
 */

/**
 * @typedef {object} HeaderConfig
 * @description Tool's config from Editor
 * @property {string} placeholder — Block's placeholder
 * @property {number[]} levels — Heading levels
 * @property {number} defaultLevel — default level
 */

/**
 * Header block for the Editor.js.
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license MIT
 * @version 2.0.0
 */
class Header {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: HeaderData, config: HeaderConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   *   readOnly - read only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly;

    /**
     * Styles
     *
     * @type {object}
     */
    this._CSS = {
      block: this.api.styles.block,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: "ce-header",
      alignment: {
        left: "ce-header--left",
        center: "ce-header--center",
        right: "ce-header--right",
        justify: "ce-header--justify",
      },
    };
    this.CSS = {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
    };

    this.inlineToolSettings = [
      {
        name: "left",
        icon: `<i class="fa fa-align-left" data-align="start"></i>`,
      },
      {
        name: "center",
        icon: `<i class="fa fa-align-center" data-align="center"></i>`,
      },
      {
        name: "right",
        icon: `<i class="fa fa-align-right" data-align="end"></i>`,
      },
      {
        name: "justify",
        icon: `<i class="fa fa-align-justify" data-align="end"></i>`,
      },
    ];

    /**
     * Tool's settings passed from Editor
     *
     * @type {HeaderConfig}
     * @private
     */
    this._settings = config;

    /**
     * Block's data
     *
     * @type {HeaderData}
     * @private
     */
    this._data = this.normalizeData(data);

    /**
     * List of settings buttons
     *
     * @type {HTMLElement[]}
     */
    this.settingsButtons = [];

    /**
     * Main Block wrapper
     *
     * @type {HTMLElement}
     * @private
     */
    this._element = this.getTag();
    this.emojiSettings = [
      {
        name: 'emoji',
        icon: `😀`
      },
    ],
    this.textCursorPosition = 0
  }

  /**
   * Normalize input data
   *
   * @param {HeaderData} data - saved data to process
   *
   * @returns {HeaderData}
   * @private
   */
  normalizeData(data) {
    const newData = {};

    if (typeof data !== "object") {
      data = {};
    }

    newData.text = data.text || "";
    newData.level = parseInt(data.level) || this.defaultLevel.number;
    newData.alignment = data.alignment || Header.DEFAULT_ALIGNMENT;

    return newData;
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLHeadingElement}
   * @public
   */
  render() {
    return this._element;
  }

  /**
   * @private
   * Click on the Settings Button
   * @param {string} tune — tune name from this.settings
   */
  _toggleTune(tune) {
    this._data.alignment = tune;
  }

  /**
   * Create Block's settings block
   *
   * @returns {HTMLElement}
   */
  renderSettings() {
    const holder = document.createElement("DIV");

    // do not add settings button, when only one level is configured
    if (this.levels.length <= 1) {
      return holder;
    }
    const alignmentContainer = document.createElement('div')
    alignmentContainer.classList.add('cdx-settings-button')
    alignmentContainer.style = "display: flex;align-items: center;padding: 0px 4px;cursor: default;"

    const alignmentLabelContainer = document.createElement('div')
    alignmentLabelContainer.classList.add('alignment-label-container')
    alignmentLabelContainer.innerHTML = "Allign"
    alignmentLabelContainer.style = "width: 60px;"

    const alignmentItemsContainer = document.createElement('div')
    alignmentItemsContainer.classList.add('alignment-items-container')
    alignmentItemsContainer.style = "width: 113px;display: flex;justify-content: space-around;align-items: center;"

    alignmentContainer.appendChild(alignmentLabelContainer)
    alignmentContainer.appendChild(alignmentItemsContainer)
    holder.appendChild(alignmentContainer)

    this.inlineToolSettings
      .map((tune) => {
        /**
         * buttonのdomを作成して、alignのtoggleをactiveに設定する
         * @type {HTMLDivElement}
         */
        const button = document.createElement("div");
        button.classList.add(this._CSS.settingsButton);
        button.innerHTML = tune.icon;

        button.classList.toggle(this.CSS.settingsButtonActive, tune.name === this.data.alignment);

        alignmentItemsContainer.appendChild(button);

        return button;
      })
      .forEach((element, index, elements) => {
        element.addEventListener("click", () => {
          this._toggleTune(this.inlineToolSettings[index].name);

          elements.forEach((el, i) => {
            const { name } = this.inlineToolSettings[i];
            el.classList.toggle(this.CSS.settingsButtonActive, name === this.data.alignment);
            //headerのdivにalignmentのclassをつける。
            this._element.classList.toggle(this._CSS.alignment[name], name === this.data.alignment);
          });
        });
      });

    const headerLevelContainer = document.createElement('div')
    headerLevelContainer.classList.add(this._CSS.settingsButton)
    headerLevelContainer.style = "width: 100%;justify-content: space-around;align-items: center;"
    holder.appendChild(headerLevelContainer)

    /** Add type selectors */
    this.levels.forEach((level) => {
      const selectTypeButton = document.createElement("div");

      // selectTypeButton.classList.add(this._CSS.settingsButton);

      /**
       * Highlight current level button
       */
      if (this.currentLevel.number === level.number) {
        selectTypeButton.classList.add(this._CSS.settingsButtonActive);
      }

      /**
       * Add SVG icon
       */
      selectTypeButton.innerHTML = level.svg;

      /**
       * Save level to its button
       */
      selectTypeButton.dataset.level = level.number;

      /**
       * Set up click handler
       */
      selectTypeButton.addEventListener("click", () => {
        this.setLevel(level.number);
      });

      /**
       * Append settings button to holder
       */
      headerLevelContainer.appendChild(selectTypeButton);

      /**
       * Save settings buttons
       */
      this.settingsButtons.push(selectTypeButton);
    });

    this.emojiSettings.forEach( tune => {
      switch(tune.name) {
        case 'emoji':
          const emojiContainer = document.createElement('div')
          const emojiSearchContainer = document.createElement('div')
          const emojiListWrapper = document.createElement('div')
          
          emojiContainer.classList.add('editor-emoji-container')
          emojiSearchContainer.classList.add('editor-emoji-search-container')
          emojiListWrapper.classList.add('editor-emoji-list-wrapper')
          
          GroupedEmojies.forEach(groups => {
            if (groups.emojies.length) {
              const emojiGroupNameContainer = document.createElement('div')
              const emojiListingContainer = document.createElement('ul')
  
              emojiGroupNameContainer.classList.add('editor-emoji-group-name-container')
              emojiListingContainer.classList.add('editor-emoji-listing-container')
  
              emojiGroupNameContainer.innerText = groups.group_name.split('-').map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(' ')
  
              groups.emojies.forEach(emoji => {
                const emojiCharacter = document.createElement('li')
                emojiCharacter.setAttribute('emoji-name', emoji.slug)
                emojiCharacter.classList.add('editor-emoji-icon')
                emojiCharacter.innerHTML = emoji.character
                emojiCharacter.addEventListener('click', (e) => {
                  const text = this._element.innerText
                  const tempText = [text.slice(0, this.textCursorPosition), emoji.character, text.slice(this.textCursorPosition)].join('');
                  this._element.innerText = tempText
                })
                emojiListingContainer.appendChild(emojiCharacter)
              })
              emojiListWrapper.appendChild(emojiGroupNameContainer)
              emojiListWrapper.appendChild(emojiListingContainer)
            }
          })
          
          emojiContainer.appendChild(emojiSearchContainer)
          emojiContainer.appendChild(emojiListWrapper)

          let button = document.createElement('div');
          button.classList.add('cdx-settings-button');
          button.innerHTML = tune.icon;
          button.addEventListener('click', (event) => {
            emojiContainer.classList.toggle('active')
          });

          holder.appendChild(button);
          holder.appendChild(emojiContainer)
          break;
      }
    })

    return holder;
  }

  _getCaretPosition(target) {
    if (target.isContentEditable || document.designMode === "on") { 
      const _range = document.getSelection().getRangeAt(0); 
      if (!_range.collapsed) { 
        return null; 
      } 
      const range = _range.cloneRange(); 
      const temp = document.createTextNode("\0"); 
      range.insertNode(temp); 
      const caretposition = target.innerText.indexOf("\0"); 
      temp.parentNode.removeChild(temp); 
      return caretposition; 
    }
  }

  /**
   * Callback for Block's settings buttons
   *
   * @param {number} level - level to set
   */
  setLevel(level) {
    this.data = {
      level: level,
      text: this.data.text,
      alignment: this.data.alignment,
    };

    /**
     * Highlight button by selected level
     */
    this.settingsButtons.forEach((button) => {
      button.classList.toggle(this._CSS.settingsButtonActive, parseInt(button.dataset.level) === level);
    });
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   *
   * @param {HeaderData} data - saved data to merger with current block
   * @public
   */
  merge(data) {
    const newData = {
      text: this.data.text + data.text,
      level: this.data.level,
      alignment: this.data.alignment,
    };

    this.data = newData;
  }

  /**
   * Validate Text block data:
   * - check for emptiness
   *
   * @param {HeaderData} blockData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(blockData) {
    return blockData.text.trim() !== "";
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLHeadingElement} toolsContent - Text tools rendered view
   * @returns {HeaderData} - saved data
   * @public
   */
  save(toolsContent) {
    return {
      text: toolsContent.innerHTML,
      level: this.currentLevel.number,
      alignment: this.data.alignment,
    };
  }

  /**
   * Allow Header to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      export: "text", // use 'text' property for other blocks
      import: "text", // fill 'text' property from other block's export string
    };
  }

  /**
   * Sanitizer Rules
   */
  static get sanitize() {
    return {
      level: false,
      text: {},
    };
  }

  /**
   * Returns true to notify core that read-only is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Get current Tools`s data
   *
   * @returns {HeaderData} Current data
   * @private
   */
  get data() {
    this._data.text = this._element.innerHTML;
    this._data.level = this.currentLevel.number;
    this._data.alignment = this._data.alignment || this._settings.defaultAlignment || Header.DEFAULT_ALIGNMENT;

    return this._data;
  }

  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {HeaderData} data — data to set
   * @private
   */
  set data(data) {
    this._data = this.normalizeData(data);

    /**
     * If level is set and block in DOM
     * then replace it to a new block
     */
    if (data.level !== undefined && this._element.parentNode) {
      /**
       * Create a new tag
       *
       * @type {HTMLHeadingElement}
       */
      const newHeader = this.getTag();

      /**
       * Save Block's content
       */
      newHeader.innerHTML = this._element.innerHTML;

      /**
       * Replace blocks
       */
      this._element.parentNode.replaceChild(newHeader, this._element);

      /**
       * Save new block to private variable
       *
       * @type {HTMLHeadingElement}
       * @private
       */
      this._element = newHeader;
    }

    /**
     * If data.text was passed then update block's content
     */
    if (data.text !== undefined) {
      this._element.innerHTML = this._data.text || "";
    }
  }

  /**
   * Get tag for target level
   * By default returns second-leveled header
   *
   * @returns {HTMLElement}
   */
  getTag() {
    /**
     * Create element for current Block's level
     */
    const tag = document.createElement(this.currentLevel.tag);

    /**
     * Add text to block
     */
    tag.innerHTML = this._data.text || "";

    /**
     * Add styles class
     */
    tag.classList.add(this._CSS.wrapper, this._CSS.alignment[this._data.alignment]);

    /**
     * Make tag editable
     */
    tag.contentEditable = this.readOnly ? "false" : "true";

    /**
     * Add Placeholder
     */
    // tag.dataset.placeholder = this.api.i18n.t(this._settings.placeholder || "");

    tag.addEventListener('click', (e) => {
      this.textCursorPosition = this._getCaretPosition(e.target)
    })
    tag.addEventListener('keyup', e => {
      this.textCursorPosition = this._getCaretPosition(e.target)
    })

    return tag;
  }

  /**
   * Get current level
   *
   * @returns {level}
   */
  get currentLevel() {
    let level = this.levels.find((levelItem) => levelItem.number === this._data.level);

    if (!level) {
      level = this.defaultLevel;
    }

    return level;
  }

  /**
   * Return default level
   *
   * @returns {level}
   */
  get defaultLevel() {
    /**
     * User can specify own default level value
     */
    if (this._settings.defaultLevel) {
      const userSpecified = this.levels.find((levelItem) => {
        return levelItem.number === this._settings.defaultLevel;
      });

      if (userSpecified) {
        return userSpecified;
      } else {
        console.warn("(ง'̀-'́)ง Heading Tool: the default level specified was not found in available levels");
      }
    }

    /**
     * With no additional options, there will be H2 by default
     *
     * @type {level}
     */
    return this.levels[1];
  }

  /**
   * @typedef {object} level
   * @property {number} number - level number
   * @property {string} tag - tag corresponds with level number
   * @property {string} svg - icon
   */

  /**
   * Available header levels
   *
   * @returns {level[]}
   */
  get levels() {
    const availableLevels = [
      {
        name: 'Heading 1',
        number: 1,
        tag: "H1",
        // svg: '<svg width="16" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.14 1.494V4.98h4.62V1.494c0-.498.098-.871.293-1.12A.927.927 0 0 1 7.82 0c.322 0 .583.123.782.37.2.246.3.62.3 1.124v9.588c0 .503-.101.88-.303 1.128a.957.957 0 0 1-.779.374.921.921 0 0 1-.77-.378c-.193-.251-.29-.626-.29-1.124V6.989H2.14v4.093c0 .503-.1.88-.302 1.128a.957.957 0 0 1-.778.374.921.921 0 0 1-.772-.378C.096 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.285.374A.922.922 0 0 1 1.06 0c.321 0 .582.123.782.37.199.246.299.62.299 1.124zm11.653 9.985V5.27c-1.279.887-2.14 1.33-2.583 1.33a.802.802 0 0 1-.563-.228.703.703 0 0 1-.245-.529c0-.232.08-.402.241-.511.161-.11.446-.25.854-.424.61-.259 1.096-.532 1.462-.818a5.84 5.84 0 0 0 .97-.962c.282-.355.466-.573.552-.655.085-.082.246-.123.483-.123.267 0 .481.093.642.28.161.186.242.443.242.77v7.813c0 .914-.345 1.371-1.035 1.371-.307 0-.554-.093-.74-.28-.187-.186-.28-.461-.28-.825z"/></svg>',
        // svg: `<i class="fa fa-h" style="font-style: inherit;font-size: 13px;"></i><i class="fa fa-1" style="font-style: inherit;font-size: 13px; margin-left: 4px;"></i>`
        // svg: `<svg style="width: 20px;" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <title>ic_fluent_text_header_1_20_regular</title> <desc>Created with Sketch.</desc> <g id="🔍-System-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_text_header_1_20_regular" fill="#212121" fill-rule="nonzero"> <path d="M16.5535,4.00284 C16.6124,4.00911 16.6682,4.02559 16.7192,4.0505 C16.7855,4.08275 16.8426,4.12877 16.8876,4.18416 C16.9609,4.27418 17.0024,4.38892 17,4.5094 L17,15.5 C17,15.7762 16.7761,16 16.5,16 C16.2239,16 16,15.7762 16,15.5 L16,6.73173 C15.4171,7.56559 14.6397,8.34115 13.7773,8.91604 C13.5476,9.06922 13.2371,9.00713 13.084,8.77736 C12.9308,8.5476 12.9929,8.23716 13.2226,8.08399 C14.5593667,7.19284056 15.6167667,5.78472898 15.9571622,4.60700075 L16.0097,4.40171 C16.0177,4.36158 16.0305,4.32319 16.0474,4.28716 C16.0807,4.21631 16.1296,4.15567 16.1888,4.10862 C16.2447,4.06415 16.3103,4.03138 16.3819,4.01404 C16.4369,4.00064 16.4948,3.99645 16.5535,4.00284 Z M9.5,4.00001 C9.77614,4.00001 10,4.22387 10,4.50001 L10,15.50001 C10,15.7762 9.77614,16.00001 9.5,16.00001 C9.22386,16.00001 9,15.7762 9,15.50001 L9,10.00001 L3,10.00001 L3,15.50001 C3,15.7762 2.77614,16.00001 2.5,16.00001 C2.22386,16.00001 2,15.7762 2,15.50001 L2,4.50001 C2,4.22387 2.22386,4.00001 2.5,4.00001 C2.77614,4.00001 3,4.22387 3,4.50001 L3,9.00001 L9,9.00001 L9,4.50001 C9,4.22387 9.22386,4.00001 9.5,4.00001 Z" id="🎨-Color"> </path> </g> </g> </g></svg>`,
        svg: `<span style="font-size: 14px;">H1</span>`,
      },
      {
        name: 'Heading 2',
        number: 2,
        tag: "H2",
        // svg: '<svg width="18" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.152 1.494V4.98h4.646V1.494c0-.498.097-.871.293-1.12A.934.934 0 0 1 7.863 0c.324 0 .586.123.786.37.2.246.301.62.301 1.124v9.588c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378c-.194-.251-.29-.626-.29-1.124V6.989H2.152v4.093c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378C.097 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.286.374A.929.929 0 0 1 1.066 0c.323 0 .585.123.786.37.2.246.3.62.3 1.124zm10.99 9.288h3.527c.351 0 .62.072.804.216.185.144.277.34.277.588 0 .22-.073.408-.22.56-.146.154-.368.23-.665.23h-4.972c-.338 0-.601-.093-.79-.28a.896.896 0 0 1-.284-.659c0-.162.06-.377.182-.645s.255-.478.399-.631a38.617 38.617 0 0 1 1.621-1.598c.482-.444.827-.735 1.034-.875.369-.261.676-.523.922-.787.245-.263.432-.534.56-.81.129-.278.193-.549.193-.815 0-.288-.069-.546-.206-.773a1.428 1.428 0 0 0-.56-.53 1.618 1.618 0 0 0-.774-.19c-.59 0-1.054.26-1.392.777-.045.068-.12.252-.226.554-.106.302-.225.534-.358.696-.133.162-.328.243-.585.243a.76.76 0 0 1-.56-.223c-.149-.148-.223-.351-.223-.608 0-.31.07-.635.21-.972.139-.338.347-.645.624-.92a3.093 3.093 0 0 1 1.054-.665c.426-.169.924-.253 1.496-.253.69 0 1.277.108 1.764.324.315.144.592.343.83.595.24.252.425.544.558.875.133.33.2.674.2 1.03 0 .558-.14 1.066-.416 1.523-.277.457-.56.815-.848 1.074-.288.26-.771.666-1.45 1.22-.677.554-1.142.984-1.394 1.29a3.836 3.836 0 0 0-.331.44z"/></svg>',
        // svg: `<i class="fa fa-h" style="font-style: inherit;font-size: 13px;"></i><i class="fa fa-2" style="font-style: inherit;font-size: 13px; margin-left: 4px;"></i>`
        // svg: `<svg style="width: 20px;" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <title>ic_fluent_text_header_2_20_regular</title> <desc>Created with Sketch.</desc> <g id="🔍-System-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_text_header_2_20_regular" fill="#212121" fill-rule="nonzero"> <path d="M9.5,4 C9.77614,4 10,4.22386 10,4.5 L10,15.5 C10,15.7761 9.77614,16 9.5,16 C9.22386,16 9,15.7761 9,15.5 L9,10 L3,10 L3,15.5 C3,15.7761 2.77614,16 2.5,16 C2.22386,16 2,15.7761 2,15.5 L2,4.5 C2,4.22386 2.22386,4 2.5,4 C2.77614,4 3,4.22386 3,4.5 L3,9 L9,9 L9,4.5 C9,4.22386 9.22386,4 9.5,4 Z M14.5,4 C15.7357,4 16.9028,4.56595 17.5472,5.53582 C18.2085,6.53127 18.2635,7.86601 17.4287,9.25725 C17.0078,9.95888 16.4214,10.5037 15.8137,10.9737 C15.6107667,11.1305667 15.4025889,11.2812556 15.1950926,11.4274556 L14.753,11.7349 C14.4886,11.9175 14.2322,12.0947 13.9841,12.2775 C12.9663,13.0275 12.198,13.7941 12.033,15 L17.5,15 C17.7761,15 18,15.2239 18,15.5 C18,15.7761 17.7761,16 17.5,16 L11.5,16 C11.2239,16 11,15.7761 11,15.5 C11,13.5038 12.1677,12.3738 13.3909,11.4725 L13.7878375,11.187725 L13.7878375,11.187725 L14.316,10.8213 C14.6233,10.6087 14.9204,10.4004 15.2019,10.1826 C15.7661,9.74632 16.2422,9.29112 16.5713,8.74275 C17.2365,7.63399 17.1324,6.71873 16.7142,6.08918 C16.279,5.43405 15.4461,5 14.5,5 C13.0567,5 12,6.24935 12,7.5 C12,7.77614 11.7761,8 11.5,8 C11.2239,8 11,7.77614 11,7.5 C11,5.75065 12.4523,4 14.5,4 Z" id="🎨-Color"> </path> </g> </g> </g></svg>`,
        svg: `<span style="font-size: 14px;">H2</span>`,
      },
      {
        name: 'Heading 3',
        number: 3,
        tag: "H3",
        // svg: '<svg width="18" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.152 1.494V4.98h4.646V1.494c0-.498.097-.871.293-1.12A.934.934 0 0 1 7.863 0c.324 0 .586.123.786.37.2.246.301.62.301 1.124v9.588c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378c-.194-.251-.29-.626-.29-1.124V6.989H2.152v4.093c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378C.097 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.286.374A.929.929 0 0 1 1.066 0c.323 0 .585.123.786.37.2.246.3.62.3 1.124zm11.61 4.919c.418 0 .778-.123 1.08-.368.301-.245.452-.597.452-1.055 0-.35-.12-.65-.36-.902-.241-.252-.566-.378-.974-.378-.277 0-.505.038-.684.116a1.1 1.1 0 0 0-.426.306 2.31 2.31 0 0 0-.296.49c-.093.2-.178.388-.255.565a.479.479 0 0 1-.245.225.965.965 0 0 1-.409.081.706.706 0 0 1-.5-.22c-.152-.148-.228-.345-.228-.59 0-.236.071-.484.214-.745a2.72 2.72 0 0 1 .627-.746 3.149 3.149 0 0 1 1.024-.568 4.122 4.122 0 0 1 1.368-.214c.44 0 .842.06 1.205.18.364.12.679.294.947.52.267.228.47.49.606.79.136.3.204.622.204.967 0 .454-.099.843-.296 1.168-.198.324-.48.64-.848.95.354.19.653.408.895.653.243.245.426.516.548.813.123.298.184.619.184.964 0 .413-.083.812-.248 1.198-.166.386-.41.73-.732 1.031a3.49 3.49 0 0 1-1.147.708c-.443.17-.932.256-1.467.256a3.512 3.512 0 0 1-1.464-.293 3.332 3.332 0 0 1-1.699-1.64c-.142-.314-.214-.573-.214-.777 0-.263.085-.475.255-.636a.89.89 0 0 1 .637-.242c.127 0 .25.037.367.112a.53.53 0 0 1 .232.27c.236.63.489 1.099.759 1.405.27.306.65.46 1.14.46a1.714 1.714 0 0 0 1.46-.824c.17-.273.256-.588.256-.947 0-.53-.145-.947-.436-1.249-.29-.302-.694-.453-1.212-.453-.09 0-.231.01-.422.028-.19.018-.313.027-.367.027-.25 0-.443-.062-.579-.187-.136-.125-.204-.299-.204-.521 0-.218.081-.394.245-.528.163-.134.406-.2.728-.2h.28z"/></svg>',
        // svg: `<i class="fa fa-h" style="font-style: inherit;font-size: 13px;"></i><i class="fa fa-3" style="font-style: inherit;font-size: 13px; margin-left: 4px;"></i>`
        // svg: `<svg style="width: 20px;" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --> <title>ic_fluent_text_header_3_20_regular</title> <desc>Created with Sketch.</desc> <g id="🔍-System-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_text_header_3_20_regular" fill="#212121" fill-rule="nonzero"> <path d="M9.5,4 C9.74545778,4 9.9496079,4.17687704 9.99194425,4.41012499 L10,4.5 L10,15.5 C10,15.7761 9.77614,16 9.5,16 C9.25454222,16 9.0503921,15.8230914 9.00805575,15.5898645 L9,15.5 L9,10 L3,10 L3,15.5 C3,15.7761 2.77614,16 2.5,16 C2.25454222,16 2.0503921,15.8230914 2.00805575,15.5898645 L2,15.5 L2,4.5 C2,4.22386 2.22386,4 2.5,4 C2.74545778,4 2.9496079,4.17687704 2.99194425,4.41012499 L3,4.5 L3,9 L9,9 L9,4.5 C9,4.22386 9.22386,4 9.5,4 Z M14.5,4 C16.7641,4 18,5.612 18,7 C18,7.60438 17.8798,8.48731 17.2849,9.22608 C17.0528,9.51432 16.7595,9.76726 16.3954,9.97019 C16.8092,10.1675 17.2088,10.4533 17.5077,10.8676 C17.8194,11.2995 18,11.8413 18,12.5 C18,13.7452 17.5791,14.6475 16.8826,15.2279 C16.2022,15.7949 15.3243,16 14.5,16 C13.7006,16 12.9701,15.8678 12.36,15.4865 C11.7397,15.0988 11.3034,14.4914 11.0257,13.6581 C10.9383,13.3961 11.0799,13.113 11.3419,13.0257 C11.6039,12.9383 11.887,13.0799 11.9744,13.3419 C12.1966,14.0086 12.5103,14.4012 12.89,14.6385 C13.2799,14.8822 13.7995,15 14.5,15 C15.1757,15 15.7979,14.8301 16.2424,14.4596 C16.6709,14.1025 17,13.5048 17,12.5 C17,12.0337 16.8757,11.7005 16.6968,11.4528 C16.5143,11.1998 16.253,11.006 15.9377,10.86 C15.2945,10.5622 14.5069,10.5 14,10.5 C13.7239,10.5 13.5,10.2761 13.5,10 C13.5,9.72386 13.7239,9.5 14,9.5 C15.4178,9.5 16.1312,9.06444 16.506,8.59892 C16.8975,8.11269 17,7.49562 17,7 C17,6.188 16.2359,5 14.5,5 C13.5944,5 13.0162,5.2782 12.6443,5.60208 C12.2632,5.93391 12.066,6.34286 11.9803,6.63893 C11.9036,6.9042 11.6263,7.05704 11.3611,6.98031 C11.0958,6.90358 10.943,6.62634 11.0197,6.36107 C11.1462,5.92381 11.4308,5.33276 11.9876,4.84792 C12.5535,4.35513 13.3693,4 14.5,4 Z" id="🎨-Color"> </path> </g> </g> </g></svg>`,
        svg: `<span style="font-size: 14px;">H3</span>`,
      },
      {
        name: 'Heading 4',
        number: 4,
        tag: "H4",
        // svg: '<svg width="20" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.152 1.494V4.98h4.646V1.494c0-.498.097-.871.293-1.12A.934.934 0 0 1 7.863 0c.324 0 .586.123.786.37.2.246.301.62.301 1.124v9.588c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378c-.194-.251-.29-.626-.29-1.124V6.989H2.152v4.093c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378C.097 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.286.374A.929.929 0 0 1 1.066 0c.323 0 .585.123.786.37.2.246.3.62.3 1.124zm13.003 10.09v-1.252h-3.38c-.427 0-.746-.097-.96-.29-.213-.193-.32-.456-.32-.788 0-.085.016-.171.048-.259.031-.088.078-.18.141-.276.063-.097.128-.19.195-.28.068-.09.15-.2.25-.33l3.568-4.774a5.44 5.44 0 0 1 .576-.683.763.763 0 0 1 .542-.212c.682 0 1.023.39 1.023 1.171v5.212h.29c.346 0 .623.047.832.142.208.094.313.3.313.62 0 .26-.086.45-.256.568-.17.12-.427.179-.768.179h-.41v1.252c0 .346-.077.603-.23.771-.152.168-.356.253-.612.253a.78.78 0 0 1-.61-.26c-.154-.173-.232-.427-.232-.764zm-2.895-2.76h2.895V4.91L12.26 8.823z"/></svg>',
        // svg: `<i class="fa fa-h" style="font-style: inherit;font-size: 13px;"></i><i class="fa fa-4" style="font-style: inherit;font-size: 13px; margin-left: 4px;"></i>`
        svg: `<span style="font-size: 14px;">H4</span>`,
      },
      {
        name: 'Heading 5',
        number: 5,
        tag: "H5",
        // svg: '<svg width="18" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.152 1.494V4.98h4.646V1.494c0-.498.097-.871.293-1.12A.934.934 0 0 1 7.863 0c.324 0 .586.123.786.37.2.246.301.62.301 1.124v9.588c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378c-.194-.251-.29-.626-.29-1.124V6.989H2.152v4.093c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378C.097 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.286.374A.929.929 0 0 1 1.066 0c.323 0 .585.123.786.37.2.246.3.62.3 1.124zm14.16 2.645h-3.234l-.388 2.205c.644-.344 1.239-.517 1.783-.517.436 0 .843.082 1.222.245.38.164.712.39.998.677.286.289.51.63.674 1.025.163.395.245.82.245 1.273 0 .658-.148 1.257-.443 1.797-.295.54-.72.97-1.276 1.287-.556.318-1.197.477-1.923.477-.813 0-1.472-.15-1.978-.45-.506-.3-.865-.643-1.076-1.031-.21-.388-.316-.727-.316-1.018 0-.177.073-.345.22-.504a.725.725 0 0 1 .556-.238c.381 0 .665.22.85.66.182.404.427.719.736.943.309.225.654.337 1.035.337.35 0 .656-.09.919-.272.263-.182.466-.431.61-.749.142-.318.214-.678.214-1.082 0-.436-.078-.808-.232-1.117a1.607 1.607 0 0 0-.62-.69 1.674 1.674 0 0 0-.864-.229c-.39 0-.67.048-.837.143-.168.095-.41.262-.725.5-.316.239-.576.358-.78.358a.843.843 0 0 1-.592-.242c-.173-.16-.259-.344-.259-.548 0-.022.025-.177.075-.463l.572-3.26c.063-.39.181-.675.354-.852.172-.177.454-.265.844-.265h3.595c.708 0 1.062.27 1.062.81a.711.711 0 0 1-.26.572c-.172.145-.426.218-.762.218z"/></svg>',
        // svg: `<i class="fa fa-h" style="font-style: inherit;font-size: 13px;"></i><i class="fa fa-5" style="font-style: inherit;font-size: 13px; margin-left: 4px;"></i>`
        svg: `<span style="font-size: 14px;">H5</span>`,
      },
      {
        name: 'Heading 6',
        number: 6,
        tag: "H6",
        // svg: '<svg width="18" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.152 1.494V4.98h4.646V1.494c0-.498.097-.871.293-1.12A.934.934 0 0 1 7.863 0c.324 0 .586.123.786.37.2.246.301.62.301 1.124v9.588c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378c-.194-.251-.29-.626-.29-1.124V6.989H2.152v4.093c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378C.097 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.286.374A.929.929 0 0 1 1.066 0c.323 0 .585.123.786.37.2.246.3.62.3 1.124zM12.53 7.058a3.093 3.093 0 0 1 1.004-.814 2.734 2.734 0 0 1 1.214-.264c.43 0 .827.08 1.19.24.365.161.684.39.957.686.274.296.485.645.635 1.048a3.6 3.6 0 0 1 .223 1.262c0 .637-.145 1.216-.437 1.736-.292.52-.699.926-1.221 1.218-.522.292-1.114.438-1.774.438-.76 0-1.416-.186-1.967-.557-.552-.37-.974-.919-1.265-1.645-.292-.726-.438-1.613-.438-2.662 0-.855.088-1.62.265-2.293.176-.674.43-1.233.76-1.676.33-.443.73-.778 1.2-1.004.47-.226 1.006-.339 1.608-.339.579 0 1.089.113 1.53.34.44.225.773.506.997.84.224.335.335.656.335.964 0 .185-.07.354-.21.505a.698.698 0 0 1-.536.227.874.874 0 0 1-.529-.18 1.039 1.039 0 0 1-.36-.498 1.42 1.42 0 0 0-.495-.655 1.3 1.3 0 0 0-.786-.247c-.24 0-.479.069-.716.207a1.863 1.863 0 0 0-.6.56c-.33.479-.525 1.333-.584 2.563zm1.832 4.213c.456 0 .834-.186 1.133-.56.298-.373.447-.862.447-1.468 0-.412-.07-.766-.21-1.062a1.584 1.584 0 0 0-.577-.678 1.47 1.47 0 0 0-.807-.234c-.28 0-.548.074-.804.224-.255.149-.461.365-.617.647a2.024 2.024 0 0 0-.234.994c0 .61.158 1.12.475 1.527.316.407.714.61 1.194.61z"/></svg>',
        // svg: `<i class="fa fa-h" style="font-style: inherit;font-size: 13px;"></i><i class="fa fa-6" style="font-style: inherit;font-size: 13px; margin-left: 4px;"></i>`
        svg: `<span style="font-size: 14px;">H6</span>`,
      },
    ];

    return this._settings.levels
      ? availableLevels.filter((l) => this._settings.levels.includes(l.number))
      : availableLevels;
  }

  /**
   * Handle H1-H6 tags on paste to substitute it with header Tool
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event) {
    const content = event.detail.data;

    /**
     * Define default level value
     *
     * @type {number}
     */
    let level = this.defaultLevel.number;

    switch (content.tagName) {
      case "H1":
        level = 1;
        break;
      case "H2":
        level = 2;
        break;
      case "H3":
        level = 3;
        break;
      case "H4":
        level = 4;
        break;
      case "H5":
        level = 5;
        break;
      case "H6":
        level = 6;
        break;
    }

    if (this._settings.levels) {
      // Fallback to nearest level when specified not available
      level = this._settings.levels.reduce((prevLevel, currLevel) => {
        return Math.abs(currLevel - level) < Math.abs(prevLevel - level) ? currLevel : prevLevel;
      });
    }

    this.data = {
      level,
      text: content.innerHTML,
      alignment: this._settings.defaultAlignment || Header.DEFAULT_ALIGNMENT,
    };
  }

  /**
   * Used by Editor.js paste handling API.
   * Provides configuration to handle H1-H6 tags.
   *
   * @returns {{handler: (function(HTMLElement): {text: string}), tags: string[]}}
   */
  static get pasteConfig() {
    return {
      tags: ["H1", "H2", "H3", "H4", "H5", "H6"],
    };
  }

  /**
   * Allowed header alignments
   */
  static get ALIGNMENTS() {
    return {
      left: "left",
      center: "center",
      right: "right",
      justify: "justify",
    };
  }

  /**
   * Default header alignment
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_ALIGNMENT() {
    return Header.ALIGNMENTS.left;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: require("./../assets/icon.svg").default,
      title: "Heading",
    };
  }
}

module.exports = Header;
