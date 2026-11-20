#!/usr/bin/env python3
"""Собирает src/* в два файла: dist/artifact.html (фрагмент для Artifact) и dist/vnmap.html (самостоятельный файл)."""
import json, re, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
DIST = os.path.join(ROOT, 'dist')
os.makedirs(DIST, exist_ok=True)

JS_ORDER = ['util.js', 'merge.js', 'i18n.js', 'model.js', 'geom.js', 'canvas.js', 'modal.js', 'nodemodal.js',
            'script.js', 'text.js', 'effects.js', 'flags.js', 'jumps.js', 'condbuilder.js', 'members.js', 'files.js', 'registry.js', 'compiler.js', 'extras.js', 'guireg.js', 'translate.js', 'tlui.js', 'build.js', 'tools.js', 'toolsmenu.js', 'playeng.js', 'player.js', 'autorun.js', 'endguide.js','voicesheet.js', 'testlog.js', 'gamemode.js', 'analysis.js', 'layout.js', 'mappdf.js', 'notes.js', 'palette.js','palintent.js','replicas.js','rename.js','checks.js','branchstats.js','varstate.js','charpage.js','resources.js', 'weight.js', 'assetprod.js', 'recipes.js', 'snippets.js', 'customcode.js', 'codeedit.js', 'cmedit.js', 'codelang.js', 'codehint.js', 'hintenv.js', 'ide.js', 'digest.js', 'prose.js','branches.js','brlink.js','texted.js','docimport.js','winctl.js','docedit.js','pull.js','lazyfiles.js','ghopen.js', 'helptools.js', 'desktop.js', 'rpsdk.js','rpyimport.js', 'launcher.js', 'shellupd.js', 'drive.js', 'collab.js', 'sharefile.js', 'github.js', 'review.js', 'acl.js', 'tasks.js', 'whodid.js', 'notify.js', 'aicore.js', 'aiset.js', 'aihw.js', 'aichat.js', 'aiask.js', 'diag.js', 'metrics.js', 'minilint.js', 'filenames.js', 'fitbox.js', 'ctrlproj.js', 'statshub.js', 'syncchip.js', 'uimode.js', 'dock.js', 'winbar.js', 'satellite.js', 'uipresets.js', 'lessons.js', 'tour.js', 'walks.js', 'walks2.js', 'snapshots.js', 'app.js']

def kebab(s):
    return re.sub(r'([A-Z])', lambda m: '-' + m.group(1).lower(), s)

themes = json.load(open(os.path.join(SRC, 'themes.json'), encoding='utf-8'))

def css_vars(t):
    out = []
    for k, v in t.items():
        if k == 'colors':
            for cn, cv in v.items():
                out.append(f'--c-{cn}:{cv};')
        else:
            out.append(f'--{kebab(k)}:{v};')
    return ''.join(out)

tokens = (
    ':root{' + css_vars(themes['dark']) + 'color-scheme:dark}\n'
    '@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){' + css_vars(themes['light']) + 'color-scheme:light}}\n'
    ':root[data-theme="light"]{' + css_vars(themes['light']) + 'color-scheme:light}\n'
    ':root[data-theme="dark"]{' + css_vars(themes['dark']) + 'color-scheme:dark}\n'
)

css = open(os.path.join(SRC, 'style.css'), encoding='utf-8').read()
css = css.replace('/*TOKENS*/', tokens)

js_parts = []
for f in JS_ORDER:
    p = os.path.join(SRC, f)
    if not os.path.exists(p):
        print('ОШИБКА: в JS_ORDER указан файл, которого нет:', f, file=sys.stderr)
        sys.exit(1)
    js_parts.append(f'/* ==== {f} ==== */\n' + open(p, encoding='utf-8').read())
# Страховки сборки (после случая с ai.js, который не попал в установщик, и чтобы то же не вышло со страницей):
# 1) файл из src/ без записи в JS_ORDER молча не попал бы в программу; 2) повтор имени функции молча затёр бы первую (все файлы в одной области видимости)
_unlisted = sorted(x for x in os.listdir(SRC) if x.endswith('.js') and x not in JS_ORDER)
if _unlisted:
    print('ОШИБКА: файлы из src/ не подключены в JS_ORDER (в программу они не попадут):', ', '.join(_unlisted), file=sys.stderr)
    sys.exit(1)
_fn_at, _dups = {}, []
for f in JS_ORDER:
    _tpl = False                                  # внутри многострочной строки с обратными кавычками (например, текст скрипта оболочки) объявления не считаем
    for _ln in open(os.path.join(SRC, f), encoding='utf-8').read().split('\n'):
        if not _tpl:
            _m = re.match(r'(?:async\s+)?function\*?\s+([A-Za-z_$][\w$]*)', _ln)
            if _m:
                if _m.group(1) in _fn_at and _fn_at[_m.group(1)] != f: _dups.append(f'{_m.group(1)} ({_fn_at[_m.group(1)]} и {f})')
                _fn_at.setdefault(_m.group(1), f)
        if len(re.findall(r'(?<!\\)`', _ln)) % 2: _tpl = not _tpl
if _dups:
    print('ОШИБКА: одно имя функции объявлено в двух файлах:', '; '.join(_dups), file=sys.stderr)
    sys.exit(1)
# 3) один и тот же ключ перевода в двух местах: поздний молча затирает ранний (так «Диагностика» могла подменить заголовок «Выжимки для вычитки»)
_k_at, _kdups = {}, []
for f in JS_ORDER:
    for _blk in re.finditer(r"Object\.assign\(D,\s*\{(.*?)\n\}\);", open(os.path.join(SRC, f), encoding='utf-8').read(), re.S):
        for _k in re.findall(r"(?:^\s*|[{,]\s*)'([A-Za-z0-9_.\-]+)'\s*:\s*\[", _blk.group(1), re.M):
            if _k in _k_at: _kdups.append(f'{_k} ({_k_at[_k]} и {f})')
            else: _k_at[_k] = f
if _kdups:
    print('ОШИБКА: ключ перевода объявлен дважды (поздний затрёт ранний):', '; '.join(_kdups[:20]), file=sys.stderr)
    sys.exit(1)
js = '\n'.join(js_parts)
js = js.replace('/*THEMES*/null', json.dumps(themes, ensure_ascii=False))

# отметка сборки: по ней настольная версия отличает обновление от установленной страницы
import datetime, hashlib, zipfile
BUILD_ID = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d.%H%M')
# Версия для людей: <линия оболочки>.<номер обновления>, например 1.2.24. Хранится в version.json (номер повышается с каждым выпущенным обновлением).
_V = json.load(open(os.path.join(ROOT, 'version.json'), encoding='utf-8'))
APP_VERSION = f"{_V['line']}.{_V['update']}"
_PKG = os.path.join(ROOT, 'desktop', 'package.json')
_pk = open(_PKG, encoding='utf-8').read()
_pk2 = re.sub(r'("version"\s*:\s*")[^"]*(")', lambda m: m.group(1) + APP_VERSION + m.group(2), _pk, count=1)
if _pk2 != _pk: open(_PKG, 'w', encoding='utf-8').write(_pk2)    # оболочка и установщики несут тот же номер
SHELL_NEEDS = 1          # какой версии оболочки (bridge) нужна эта страница; растёт, только если без новой оболочки не обойтись
js = js.replace("'/*BUILD*/'", json.dumps(BUILD_ID)).replace("'/*VERSION*/'", json.dumps(APP_VERSION)).replace("'/*SHELLREV*/'", json.dumps(str(_V.get('shell', 0))))
STAMP = f'<meta name="vnmap-build" content="{BUILD_ID}" data-version="{APP_VERSION}" data-needs="{SHELL_NEEDS}">\n'

body = open(os.path.join(SRC, 'body.html'), encoding='utf-8').read()

fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">')

# Библиотека редактора кода (CodeMirror 6): собирает GitHub Actions в cm/dist/cm6.js; идёт отдельным <script> перед программой
# (так 'use strict' программы остаётся первым оператором своего скрипта). Нет файла: страница работает с прежним редактором кода.
_CM = os.path.join(ROOT, 'cm', 'dist', 'cm6.js')
if os.path.exists(_CM):
    CM_TAG = '\n<script>\n' + open(_CM, encoding='utf-8').read().replace('</script', '<\\/script') + '\n</script>'
else:
    CM_TAG = ''
    print('Предупреждение: cm/dist/cm6.js нет, редактор кода останется прежним', file=sys.stderr)

def make_fragment(js_text):
    return (
        '<title>Карта новеллы</title>\n' + fonts + '\n<style>\n' + css + '\n</style>\n' + body + CM_TAG +
        '\n<script>\n' + js_text + '\n</script>\n'
    )

def make_standalone(js_text):
    # в самостоятельном файле body должен быть настоящим <body>
    return (
        '<!doctype html>\n<html lang="ru" data-theme="dark">\n<head>\n<meta charset="utf-8">\n' + STAMP +
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<title>Карта новеллы</title>\n' + fonts + '\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + body + CM_TAG +
        '\n<script>\n' + js_text + '\n</script>\n</body>\n</html>\n'
    )

# шаблон «HTML-игры для тестеров»: сама страница без шаблона, сжатая и вложенная в итоговую страницу (первый проход без неё)
import gzip, base64
GAMETPL = "'/*GAMETPL*/'"
_tpl = make_standalone(js.replace(GAMETPL, "''"))
_b64 = base64.b64encode(gzip.compress(_tpl.encode('utf-8'), 9, mtime=0)).decode('ascii')
js = js.replace(GAMETPL, json.dumps(_b64))

fragment = make_fragment(js)
open(os.path.join(DIST, 'artifact.html'), 'w', encoding='utf-8').write(fragment)
standalone = make_standalone(js)
open(os.path.join(DIST, 'vnmap.html'), 'w', encoding='utf-8').write(standalone)
open(os.path.join(DIST, 'bundle.js'), 'w', encoding='utf-8').write(js)
print('built', len(fragment) // 1024, 'KB artifact;', len(standalone) // 1024, 'KB standalone')

# десктоп: та же страница, но без интернет-шрифтов (Inter лежит рядом в desktop/app/fonts)
DESK_APP = os.path.join(ROOT, 'desktop', 'app')
if os.path.isdir(os.path.join(DESK_APP, 'fonts')):
    local_font = ('<style>@font-face{font-family:"Inter";font-style:normal;font-weight:100 900;font-display:swap;'
                  'src:url("fonts/InterVariable.woff2") format("woff2")}</style>')
    assert fonts in standalone
    desk_html = standalone.replace(fonts, local_font)
    open(os.path.join(DESK_APP, 'index.html'), 'w', encoding='utf-8').write(desk_html)
    print('desktop page written, build', BUILD_ID, 'version', APP_VERSION)
    # файл для «Обновить» в настольной версии: index.html + update.json (контрольная сумма)
    raw = desk_html.encode('utf-8')
    meta = {'build': BUILD_ID, 'version': APP_VERSION, 'needs': SHELL_NEEDS, 'sha256': hashlib.sha256(raw).hexdigest()}
    upd = os.path.join(DIST, f'vnmap-update-{BUILD_ID}.zip')
    for old_zip in [f for f in os.listdir(DIST) if re.fullmatch(r'vnmap-update-\d{8}\.\d{4}\.zip', f)]:
        os.remove(os.path.join(DIST, old_zip))
    with zipfile.ZipFile(upd, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr('index.html', raw)
        z.writestr('update.json', json.dumps(meta, indent=1))
    print('update archive', os.path.basename(upd), os.path.getsize(upd) // 1024, 'KB')
