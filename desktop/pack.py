#!/usr/bin/env python3
"""Собирает «портативную» версию программы без npm: берёт официальный Electron с GitHub,
кладёт в него наше приложение и пакует в архив.

    python3 pack.py                 # Windows x64 и Linux x64
    python3 pack.py win-x64         # только Windows
    python3 pack.py win-arm64 linux-x64

Нужен только Python 3 и интернет (скачивается один раз, дальше берётся из .cache).
Установщики, значок в .exe и сборка для macOS делаются через npm: см. README.md.
"""
import hashlib, io, json, os, shutil, stat, sys, tarfile, urllib.request, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, '.cache')
OUT = os.path.join(HERE, 'release-portable')
PKG = json.load(open(os.path.join(HERE, 'package.json'), encoding='utf-8'))
VERSION = PKG['version']
ELECTRON = PKG['devDependencies']['electron'].lstrip('^~')
TARGETS = {'win-x64': 'win32-x64', 'win-arm64': 'win32-arm64', 'linux-x64': 'linux-x64'}
APP_FILES = ['main.js', 'preload.js', 'gdrive.js', 'updater.js']
OPTIONAL_FILES = ['google-oauth.json']   # ключ Google, если вы положили его рядом: см. README.md


def fetch(url, dest):
    print('  скачиваю', url)
    with urllib.request.urlopen(url, timeout=120) as r, open(dest + '.part', 'wb') as f:
        shutil.copyfileobj(r, f, 1 << 20)
    os.replace(dest + '.part', dest)


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def electron_zip(plat):
    os.makedirs(CACHE, exist_ok=True)
    base = f'https://github.com/electron/electron/releases/download/v{ELECTRON}'
    name = f'electron-v{ELECTRON}-{plat}.zip'
    sums = os.path.join(CACHE, f'SHASUMS256-v{ELECTRON}.txt')
    if not os.path.exists(sums):
        fetch(f'{base}/SHASUMS256.txt', sums)
    expected = None
    for line in open(sums, encoding='utf-8'):
        parts = line.split()
        if len(parts) == 2 and parts[1].lstrip('*') == name:
            expected = parts[0]
    if not expected:
        sys.exit(f'В списке контрольных сумм нет {name}')
    dest = os.path.join(CACHE, name)
    if not (os.path.exists(dest) and sha256(dest) == expected):
        fetch(f'{base}/{name}', dest)
    if sha256(dest) != expected:
        os.remove(dest)
        sys.exit(f'Контрольная сумма {name} не совпала, файл удалён. Попробуйте ещё раз.')
    return dest


def extract(zpath, target):
    """Распаковка с сохранением прав на запуск (zipfile.extractall их теряет)."""
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            p = os.path.join(target, info.filename)
            if info.is_dir():
                os.makedirs(p, exist_ok=True)
                continue
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with z.open(info) as src, open(p, 'wb') as dst:
                shutil.copyfileobj(src, dst, 1 << 20)
            mode = info.external_attr >> 16
            if mode:
                os.chmod(p, mode & 0o7777)


def put_app(res_dir):
    app = os.path.join(res_dir, 'app')
    if os.path.isdir(app):
        shutil.rmtree(app)
    os.makedirs(app)
    for f in APP_FILES:
        shutil.copy2(os.path.join(HERE, f), app)
    for f in OPTIONAL_FILES:
        if os.path.exists(os.path.join(HERE, f)):
            shutil.copy2(os.path.join(HERE, f), app)
            print('  в сборку добавлен', f)
    shutil.copytree(os.path.join(HERE, 'app'), os.path.join(app, 'app'))
    os.makedirs(os.path.join(app, 'build'))
    shutil.copy2(os.path.join(HERE, 'build', 'icon.png'), os.path.join(app, 'build'))
    json.dump({'name': 'vnmap', 'productName': PKG['productName'], 'version': VERSION, 'main': 'main.js'},
              open(os.path.join(app, 'package.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    try:
        os.remove(os.path.join(res_dir, 'default_app.asar'))
    except FileNotFoundError:
        pass


README_WIN = """Карта новеллы {v} (портативная версия)

Запуск: двойной щелчок по VNMap.exe. Устанавливать ничего не нужно, папку можно положить куда угодно.

Windows может показать предупреждение SmartScreen, потому что программа не подписана сертификатом:
нажмите «Подробнее», затем «Выполнить в любом случае».

Проекты сохраняются в файлы .vnmap (Ctrl+S). Рабочие данные программы лежат в %APPDATA%\\VNMap.
"""
README_LINUX = """Карта новеллы {v} (портативная версия)

Запуск: ./start.sh
Если система ругается на chrome-sandbox, запустите ./start.sh --no-sandbox.

Проекты сохраняются в файлы .vnmap (Ctrl+S). Рабочие данные программы лежат в ~/.config/VNMap.
"""


def pack_win(plat, name):
    work = os.path.join(OUT, f'_work-{plat}')
    shutil.rmtree(work, ignore_errors=True)
    top = os.path.join(work, 'VNMap')
    extract(electron_zip(TARGETS[plat]), top)
    os.replace(os.path.join(top, 'electron.exe'), os.path.join(top, 'VNMap.exe'))
    put_app(os.path.join(top, 'resources'))
    open(os.path.join(top, 'ПРОЧТИ МЕНЯ.txt'), 'w', encoding='utf-8-sig').write(README_WIN.format(v=VERSION))
    dest = os.path.join(OUT, name + '.zip')
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for root, _, files in os.walk(top):
            for f in sorted(files):
                full = os.path.join(root, f)
                z.write(full, os.path.relpath(full, work))
    shutil.rmtree(work)
    return dest


def pack_linux(plat, name):
    work = os.path.join(OUT, f'_work-{plat}')
    shutil.rmtree(work, ignore_errors=True)
    top = os.path.join(work, 'VNMap')
    extract(electron_zip(TARGETS[plat]), top)
    os.replace(os.path.join(top, 'electron'), os.path.join(top, 'vnmap'))
    put_app(os.path.join(top, 'resources'))
    start = os.path.join(top, 'start.sh')
    open(start, 'w', encoding='utf-8').write('#!/bin/sh\nDIR="$(cd "$(dirname "$0")" && pwd)"\nexec "$DIR/vnmap" "$@"\n')
    os.chmod(start, 0o755)
    open(os.path.join(top, 'README.txt'), 'w', encoding='utf-8').write(README_LINUX.format(v=VERSION))
    dest = os.path.join(OUT, name + '.tar.gz')
    with tarfile.open(dest, 'w:gz', compresslevel=6) as tf:
        tf.add(top, arcname='VNMap')
    shutil.rmtree(work)
    return dest


def pack_patch():
    """Файлы для замены внутри УЖЕ установленной портативной версии (папка resources/app): без скачивания Electron."""
    work = os.path.join(OUT, '_work-patch')
    shutil.rmtree(work, ignore_errors=True)
    put_app(work)                      # создаст work/app; нам нужно содержимое этой папки
    src = os.path.join(work, 'app')
    dest = os.path.join(OUT, f'VNMap-{VERSION}-shell-patch.zip')
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for root, _, files in os.walk(src):
            for f in sorted(files):
                full = os.path.join(root, f)
                z.write(full, os.path.relpath(full, src))
    shutil.rmtree(work)
    return dest


def main():
    want = sys.argv[1:] or ['win-x64', 'linux-x64']
    if want == ['patch']:
        os.makedirs(OUT, exist_ok=True)
        d = pack_patch(); print('готово:', d, f'({os.path.getsize(d) / 1024:.0f} КБ)'); return
    os.makedirs(OUT, exist_ok=True)
    if not os.path.exists(os.path.join(HERE, 'app', 'index.html')):
        sys.exit('Нет app/index.html. Сначала запустите python3 ../build.py')
    for plat in want:
        if plat not in TARGETS:
            sys.exit(f'Неизвестная платформа {plat}. Доступны: {", ".join(TARGETS)}')
        name = f'VNMap-{VERSION}-{plat}-portable'
        print('Собираю', name)
        dest = pack_win(plat, name) if plat.startswith('win') else pack_linux(plat, name)
        print('  готово:', dest, f'({os.path.getsize(dest) / 1048576:.0f} МБ)')
    print('Для macOS и установщиков используйте npm: см. README.md')


if __name__ == '__main__':
    main()
