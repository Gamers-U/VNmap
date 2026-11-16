'use strict';
/* Мост между страницей и оболочкой. Страница получает только этот набор функций; путей для записи она не задаёт:
   пути возвращают системные диалоги, а запись в привязанный файл main.js делает сам. */
const { contextBridge, ipcRenderer, webUtils } = require('electron');

const call = (ch, ...a) => ipcRenderer.invoke(ch, ...a);
const listeners = { cmd: new Set(), open: new Set(), rp: new Set(), su: new Set() };
ipcRenderer.on('desk:cmd', (e, cmd, arg) => listeners.cmd.forEach(fn => { try { fn(cmd, arg); } catch (x) { console.error(x); } }));
ipcRenderer.on('desk:open', (e, file) => listeners.open.forEach(fn => { try { fn(file); } catch (x) { console.error(x); } }));
ipcRenderer.on('rp:evt', (e, ev) => listeners.rp.forEach(fn => { try { fn(ev); } catch (x) { console.error(x); } }));
ipcRenderer.on('su:evt', (e, ev) => listeners.su.forEach(fn => { try { fn(ev); } catch (x) { console.error(x); } }));
const sub = (set, fn) => { set.add(fn); return () => set.delete(fn); };

contextBridge.exposeInMainWorld('vnDesktop', {
  isDesktop: true,
  ready: () => call('desk:ready'),
  setLang: l => call('desk:setLang', l),
  setState: st => call('desk:setState', st),
  saveFile: (name, data) => call('desk:saveFile', name, data),
  saveProject: (name, data, saveAs) => call('desk:saveProject', name, data, !!saveAs),
  bind: p => call('desk:bind', p),
  unbind: () => call('desk:unbind'),
  stat: () => call('desk:stat'),
  openDialog: () => call('desk:openDialog'),
  readPath: p => call('desk:readPath', p),
  writeBuild: entries => call('desk:writeBuild', entries),
  showInFolder: p => call('desk:showInFolder', p),
  openExternal: u => call('desk:openExternal', u),
  closeNow: () => ipcRenderer.send('desk:closeNow'),
  recent: () => call('desk:recent'),
  recentForget: p => call('desk:recentForget', p),
  recentClear: () => call('desk:recentClear'),
  update: {
    info: () => call('upd:info'),
    pickFile: () => call('upd:pickFile'),
    fromUrl: (url, sha) => call('upd:fromUrl', url, sha || ''),
    apply: token => call('upd:apply', token),
    reset: () => call('upd:reset'),
  },
  pathForFile: f => { try { return webUtils.getPathForFile(f) || ''; } catch (e) { return ''; } },
  gd: {
    status: () => call('gd:status'),
    getConfig: () => call('gd:getConfig'),
    setConfig: c => call('gd:setConfig', c),
    signIn: () => call('gd:signIn'),
    cancelSignIn: () => call('gd:cancelSignIn'),
    signOut: () => call('gd:signOut'),
    about: () => call('gd:about'),
    find: f => call('gd:find', f),
    folder: (name, parentId, props) => call('gd:folder', name, parentId, props),
    update: (id, patch) => call('gd:update', id, patch),
    get: id => call('gd:get', id),
    trash: id => call('gd:trash', id),
    upload: o => call('gd:upload', o),
    download: id => call('gd:download', id),
  },
  gh: {
    status: () => call('gh:status'),
    setToken: tok => call('gh:setToken', tok),
    clearToken: () => call('gh:clearToken'),
    request: o => call('gh:request', o),
  },
  notify: {
    status: () => call('nt:status'),
    setTelegram: o => call('nt:setTelegram', o),
    setDiscord: o => call('nt:setDiscord', o),
    clear: which => call('nt:clear', which),
    find: () => call('nt:find'),
    send: (text, only) => call('nt:send', text, only),
    mine: memberId => call('nt:mine', memberId),
    farewell: f => call('nt:farewell', f),
  },
  snap: {
    info: () => call('sn:info'),
    save: o => call('sn:save', o),
    read: file => call('sn:read', file),
    remove: file => call('sn:remove', file),
  },
  shellUpdate: {
    check: () => call('su:check'),
    download: () => call('su:download'),
    apply: () => call('su:apply'),
    onProgress: fn => sub(listeners.su, fn),
  },
  renpy: {
    status: key => call('rp:status', key),
    pickSdk: () => call('rp:pickSdk'),
    clearSdk: () => call('rp:clearSdk'),
    pickProject: key => call('rp:pickProject', key),
    clearProject: key => call('rp:clearProject', key),
    write: (key, entries) => call('rp:write', key, entries),
    start: (key, kind, opts) => call('rp:start', key, kind, opts || {}),
    stop: id => call('rp:stop', id),
    onEvent: fn => sub(listeners.rp, fn),
  },
  onCommand: fn => sub(listeners.cmd, fn),
  onOpenFile: fn => sub(listeners.open, fn),
});
