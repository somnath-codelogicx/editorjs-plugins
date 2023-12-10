/* eslint-disable no-useless-escape */
export default {
  vimeo: {
    regex: /(?:http[s]?:\/\/)?(?:www.)?(?:player.)?vimeo\.co(?:.+\/([^\/]\d+)(?:#t=[\d]+)?s?$)/,
    embedUrl: 'https://player.vimeo.com/video/<%= remote_id %>?title=0&byline=0',
    html: `<div class="embed-iframe-container">
            <iframe style="width:100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
          </div>`,
    height: '320px',
    width: '580px',
  },
  youtube: {
    regex: /(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be\/)|(?:youtube\.com)\/(?:v\/|u\/\w\/|embed\/|watch))(?:(?:\?v=)?([^#&?=]*))?((?:[?&]\w*=\w*)*)/,
    embedUrl: 'https://www.youtube.com/embed/<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe style="width:100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
          </div>`,
    height: '320px',
    width: '580px',
    id: ([id, params]) => {
      if (!params && id) {
        return id;
      }

      const paramsMap = {
        start: 'start',
        end: 'end',
        t: 'start',
        // eslint-disable-next-line camelcase
        time_continue: 'start',
        list: 'list',
      };

      params = params.slice(1)
        .split('&')
        .map(param => {
          const [name, value] = param.split('=');

          if (!id && name === 'v') {
            id = value;

            return null;
          }

          if (!paramsMap[name]) {
            return null;
          }

          if (value === 'LL' ||
            value.startsWith('RDMM') ||
            value.startsWith('FL')) {
            return null;
          }

          return `${paramsMap[name]}=${value}`;
        })
        .filter(param => !!param);

      return id + '?' + params.join('&');
    },
  },
  coub: {
    regex: /https?:\/\/coub\.com\/view\/([^\/\?\&]+)/,
    embedUrl: 'https://coub.com/embed/<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe style="width:100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
          </div>`,
    height: '320px',
    width: '580px',
  },
  vine: {
    regex: /https?:\/\/vine\.co\/v\/([^\/\?\&]+)/,
    embedUrl: 'https://vine.co/v/<%= remote_id %>/embed/simple/',
    html: `<div class="embed-iframe-container">
            <iframe style="width:100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
          </div>`,
    height: '320px',
    width: '580px',
  },
  imgur: {
    regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
    embedUrl: 'http://imgur.com/<%= remote_id %>/embed',
    html: `<div class="embed-iframe-container">
            <iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 100%; width: 100%;"></iframe>
          </div>`,
    height: '500px',
    width: '540px',
  },
  gfycat: {
    regex: /https?:\/\/gfycat\.com(?:\/detail)?\/([a-zA-Z]+)/,
    embedUrl: 'https://gfycat.com/ifr/<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe frameborder='0' scrolling='no' style="width:100%; height: 100%;" allowfullscreen ></iframe>
          </div>`,
    height: '436px',
    width: '580px',
  },
  'twitch-channel': {
    regex: /https?:\/\/www\.twitch\.tv\/([^\/\?\&]*)\/?$/,
    embedUrl: 'https://player.twitch.tv/?channel=<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe frameborder="0" allowfullscreen="true" scrolling="no" style="width:100%; height: 100%;"></iframe>
          </div>`,
    height: '366px',
    width: '600px',
  },
  'twitch-video': {
    regex: /https?:\/\/www\.twitch\.tv\/(?:[^\/\?\&]*\/v|videos)\/([0-9]*)/,
    embedUrl: 'https://player.twitch.tv/?video=v<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe frameborder="0" allowfullscreen="true" scrolling="no" style="width:100%; height: 100%;"></iframe>
          </div>`,
    height: '366px',
    width: '600px',
  },
  'yandex-music-album': {
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/?$/,
    embedUrl: 'https://music\.yandex\.ru/iframe/#album/<%= remote_id %>/',
    html: `<div class="embed-iframe-container">
            <iframe frameborder="0" style="border:none; width:100%; height: 100%;"></iframe>
          </div>`,
    height: '400px',
    width: '540px',
  },
  'yandex-music-track': {
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/track\/([0-9]*)/,
    embedUrl: 'https://music\.yandex\.ru/iframe/#track/<%= remote_id %>/',
    html: `<div class="embed-iframe-container">
            <iframe frameborder="0" style="width:100%; height: 100%;"></iframe>
          </div>`,
    height: '100px',
    width: '540px',
    id: (ids) => ids.join('/'),
  },
  'yandex-music-playlist': {
    regex: /https?:\/\/music\.yandex\.ru\/users\/([^\/\?\&]*)\/playlists\/([0-9]*)/,
    embedUrl: 'https://music\.yandex\.ru/iframe/#playlist/<%= remote_id %>/show/cover/description/',
    html: `<div class="embed-iframe-container">
            <iframe frameborder="0" style="border:none; width:100%; height: 100%;"></iframe>
          </div>`,
    height: '400px',
    width: '540px',
    id: (ids) => ids.join('/'),
  },
  codepen: {
    regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
    embedUrl: 'https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
    html: `<div class="embed-iframe-container">
            <iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; height: 100%;'></iframe>
          </div>`,
    height: '300px',
    width: '600px',
    id: (ids) => ids.join('/embed/'),
  },
  instagram: {
    regex: /https?:\/\/www\.instagram\.com\/p\/([^\/\?\&]+)\/?.*/,
    embedUrl: 'https://www.instagram.com/p/<%= remote_id %>/embed',
    html: `<div class="embed-iframe-container">
            <iframe style="width: 100%; height: 100%;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
          </div>`,
    height: '505px',
    width: '400px',
  },
  twitter: {
    regex: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+?.*)?$/,
    embedUrl: 'https://twitframe.com/show?url=https://twitter.com/<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe style="width: 100%; height: 100%;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
          </div>`,
    height: '600px',
    width: '600px',
    id: ids => ids.join('/status/'),
  },
  pinterest: {
    regex: /https?:\/\/([^\/\?\&]*).pinterest.com\/pin\/([^\/\?\&]*)\/?$/,
    embedUrl: 'https://assets.pinterest.com/ext/embed.html?id=<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;  height: 100%;'></iframe>
          </div>`,
    id: (ids) => {
      return ids[1];
    },
  },
  facebook: {
    regex: /https?:\/\/www.facebook.com\/([^\/\?\&]*)\/(.*)/,
    embedUrl: 'https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/<%= remote_id %>&width=500',
    html: `<div class="embed-iframe-container">
            <iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; height: 100%;'></iframe>
          </div>`,
    id: (ids) => {
      return ids.join('/');
    },
  },
  aparat: {
    regex: /(?:http[s]?:\/\/)?(?:www.)?aparat\.com\/v\/([^\/\?\&]+)\/?/,
    embedUrl: 'https://www.aparat.com/video/video/embed/videohash/<%= remote_id %>/vt/frame',
    html: `<div class="embed-iframe-container">
            <iframe style="width: 100%; height: 100%;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
          </div>`,
    height: '300px',
    width: '600px',
  },
  miro: {
    regex: /https:\/\/miro.com\/\S+(\S{12})\/(\S+)?/,
    embedUrl: 'https://miro.com/app/live-embed/<%= remote_id %>',
    html: `<div class="embed-iframe-container">
            <iframe style="width: 100%; height: 100%;" allowFullScreen frameBorder="0" scrolling="no"></iframe>
          </div>`,
  },
};
