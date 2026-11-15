# Карта новеллы (VNmap)

Конструктор визуальных новелл: карта сюжета, текст-редактор как в документе, сценарии, ресурсы и компилятор в Ren'Py.
Работает в браузере и как программа для компьютера (проекты в файлах `.vnmap`, хранение на Google Диске и GitHub).

## Скачать программу

Одна кнопка — сразу последняя версия, ничего докачивать не нужно:

| Система | Скачать | Как запустить |
|---|---|---|
| Windows | [**Установщик**](https://github.com/Gamers-U/VNmap/releases/latest/download/VNMap-win-x64-setup.exe) | запустить и пройти установку |
| Windows без установки | [Portable](https://github.com/Gamers-U/VNmap/releases/latest/download/VNMap-win-x64-portable.exe) | запустить двойным щелчком |
| macOS (Apple, M1 и новее) | [dmg](https://github.com/Gamers-U/VNmap/releases/latest/download/VNMap-mac-arm64.dmg) | перенести в «Программы»; первый раз — правой кнопкой → «Открыть» |
| macOS (Intel) | [dmg](https://github.com/Gamers-U/VNmap/releases/latest/download/VNMap-mac-x64.dmg) | то же |
| Linux | [AppImage](https://github.com/Gamers-U/VNmap/releases/latest/download/VNMap-linux-x86_64.AppImage) | сделать файл исполняемым и запустить |

Все файлы и описание версий — в разделе [Releases](https://github.com/Gamers-U/VNmap/releases/latest).
Windows может показать предупреждение SmartScreen: программа пока не подписана сертификатом. «Подробнее» → «Выполнить в любом случае».

## Номер версии

Версия записывается как **1.2.24**: «1.2» — линия оболочки (окно, работа с файлами, Диск, GitHub), «24» — номер обновления для неё.
В программе она видна на стартовом экране и в окне обновлений; там же отдельно показано, какая оболочка установлена.
Номер хранится в `version.json`; при новой линии оболочки (1.3) счёт обновлений начинается заново.

## Обновления

В программе откройте «Обновление программы» и вставьте ссылку на этот репозиторий: `https://github.com/Gamers-U/VNmap`.
Программа найдёт в последнем выпуске файл `vnmap-update-….zip`, проверит контрольную сумму и установит страницу, а если что-то
пойдёт не так — сама вернётся на встроенную версию. Установщик из Releases при этом всегда уже содержит последнюю версию страницы.

Файл `vnmap-update-….zip` заменяет только страницу программы. **Оболочку** он не меняет: если программа пишет, что нужна обновлённая оболочка,
один раз скачайте и запустите свежий установщик.

## Google Диск без собственного ключа у каждого

Входить через Google можно любым аккаунтом, если ключ приложения (`clientId`/`clientSecret`) вложен в программу.
Один раз, у владельца репозитория:
1. Google Cloud → «Google Auth Platform» → «Аудитория» → **Publish app** (иначе вход работает только для списка тестировщиков и слетает раз в 7 дней).
2. Репозиторий → Settings → Secrets and variables → Actions → **New repository secret**: имя `GOOGLE_OAUTH_JSON`, значение —
   `{"clientId": "….apps.googleusercontent.com", "clientSecret": "GOCSPX-…"}` (образец: `desktop/google-oauth.example.json`).
3. Следующий выпуск вложит ключ в программу: пользователям останется нажать «Войти через Google».

## Выпуск новой версии

Выпуск собирается сам. Когда в `main` попадает новая версия (изменился `version.json`), автосборка
(`.github/workflows/release.yml`) собирает страницу, установщики Windows/Linux/macOS и файл обновления и создаёт выпуск `v<версия>`
с текстом из `release-notes.md`. Если выпуск с таким номером уже есть, ничего не происходит.
Пересобрать вручную: Actions → «Релиз» → Run workflow → галочка «Пересобрать».

## Собрать из исходников

```
python3 build.py              # собирает dist/vnmap.html, dist/vnmap-update-….zip и desktop/app/index.html
cd desktop
npm install
npm start                     # запуск в окне
npm run dist:win              # установщики (то же: dist:mac, dist:linux) → desktop/release/
python3 pack.py               # портативные Windows/Linux без npm → desktop/release-portable/
```

Подробнее — в [desktop/README.md](desktop/README.md). Исходники страницы лежат в `src/`, оболочка (Electron) — в `desktop/`.
