/* Точка входа библиотеки редактора кода. Всё, что нужно программе, отдаётся одним глобальным объектом CM6:
   CM6.state, CM6.view, CM6.commands, CM6.language, CM6.search, CM6.autocomplete, CM6.lint, CM6.highlight, CM6.minimap.
   Собирает GitHub Actions (.github/workflows/cm.yml) в cm/dist/cm6.js; build.py вкладывает файл в страницу. */
export * as state from '@codemirror/state';
export * as view from '@codemirror/view';
export * as commands from '@codemirror/commands';
export * as language from '@codemirror/language';
export * as search from '@codemirror/search';
export * as autocomplete from '@codemirror/autocomplete';
export * as lint from '@codemirror/lint';
export * as highlight from '@lezer/highlight';
export * as minimap from '@replit/codemirror-minimap';
