'use strict';
/* ====== ИИ-помощник: блок «ИИ-помощник» внизу вкладки «Подключения» в настройках (до 1.7.7 была отдельная вкладка «ИИ») ======
   Список поставщиков с короткой справкой («насколько это просто, что потребуется от вас и от компьютера»), ключ, адрес, модель и «Проверить связь».
   Цены и условия бесплатных уровней в тексте не называются (они часто меняются): есть кнопка «Сайт и условия». */

Object.assign(D, {
  'ui.tab.ai': ['ИИ', 'AI'], 'ui.conn.ai': ['ИИ-помощник', 'AI helper'], 'ai.pal': ['ИИ-помощник: подключение (настройки)', 'AI helper: connect (settings)'],
  'ai.intro': ['Помощник для кода: пишет и правит сниппеты, мини-игры и функции на Python и Ren\'Py, подсказывает, где что искать. Текст новеллы он не пишет и не переписывает, а любые изменения предлагает, и они попадают в проект только после вашего «Применить».', 'A helper for code: it writes and fixes snippets, mini-games and Python and Ren\'Py functions, and helps you find things. It does not write or rewrite the text of your novel, and it only proposes changes: they reach the project after you press Apply.'],
  'ai.priv': ['Ничего не отправляется само: запрос уходит поставщику, только когда вы сами его отправили. Выберите поставщика из списка: у каждого коротко написано, насколько это просто и что потребуется.', 'Nothing is sent by itself: a request goes to the provider only when you send it. Pick a provider from the list: each one says briefly how easy it is and what you will need.'],
  'ai.where.desktop': ['Ключи хранятся в программе в зашифрованном виде (средствами вашей системы), только на этом компьютере. В проект, на GitHub и на Диск они не попадают, а странице программы не показываются.', 'Keys are kept inside the app, encrypted by your system, on this computer only. They never go into the project, GitHub or Drive, and the app page never sees them.'],
  'ai.where.noenc': ['В этой системе нет шифрования хранилища: ключи лежат в файле, доступном только вашему пользователю. В проект, на GitHub и на Диск они не попадают.', 'This system has no storage encryption: keys are kept in a file readable only by your user. They never go into the project, GitHub or Drive.'],
  'ai.where.web': ['Это веб-версия: ключ хранится в этом браузере (в открытом виде) и отправляется поставщику прямо из браузера. Не вводите ключ на чужом компьютере. В настольной программе ключи шифруются, а запросы идут надёжнее.', 'This is the web version: the key is kept in this browser (in plain form) and is sent to the provider straight from the browser. Do not enter a key on someone else\'s computer. The desktop app encrypts keys and is more reliable.'],
  'ai.oldshell': ['Установленная оболочка программы старая: она не умеет связываться с ИИ. Скачайте свежую версию и установите поверх: проекты и входы сохранятся.', 'The installed app shell is old and cannot talk to AI services. Download the latest version and install it over the old one: your projects and sign-ins are kept.'],
  'ai.lvl.1': ['Просто', 'Easy'], 'ai.lvl.2': ['Средне', 'Medium'], 'ai.lvl.3': ['Сложнее', 'Harder'],
  'ai.tag.free': ['есть бесплатный уровень', 'has a free tier'], 'ai.tag.paid': ['платный', 'paid'], 'ai.tag.local': ['на вашем компьютере', 'on your computer'],
  'ai.use': ['Использовать', 'Use this'], 'ai.using': ['Используется', 'In use'],
  'ai.st.key': ['ключ сохранён', 'key saved'], 'ai.st.nokey': ['ключа нет', 'no key'], 'ai.st.local': ['локально', 'local'],
  'ai.need': ['Что потребуется', 'What you need'], 'ai.how': ['Как подключить', 'How to connect'], 'ai.warn': ['Подводные камни', 'Things to know'],
  'ai.f.addr': ['Адрес', 'Address'], 'ai.f.addr.h': ['Адрес сервера. Для своего компьютера и домашней сети подойдёт http, для интернета только https.', 'The server address. http is fine for your own computer and home network, only https for the internet.'],
  'ai.f.key': ['Ключ', 'Key'], 'ai.f.key.opt': ['Ключ (если нужен)', 'Key (if needed)'], 'ai.f.model': ['Модель', 'Model'],
  'ai.key.ph': ['вставьте ключ', 'paste the key'], 'ai.key.saved': ['сохранён (можно заменить)', 'saved (you can replace it)'],
  'ai.model.ph': ['выберите или впишите имя', 'pick one or type a name'], 'ai.model.refresh': ['Обновить список моделей', 'Refresh the model list'],
  'ai.model.h': ['Список приходит от самого поставщика после «Проверить связь».', 'The list comes from the provider itself after "Test connection".'],
  'ai.save': ['Сохранить', 'Save'], 'ai.key.del': ['Удалить ключ', 'Delete the key'], 'ai.test': ['Проверить связь', 'Test connection'], 'ai.test.busy': ['Проверяю…', 'Testing…'],
  'ai.open.keys': ['Открыть страницу ключей', 'Open the keys page'], 'ai.open.site': ['Сайт и условия', 'Site and terms'], 'ai.open.install': ['Скачать программу', 'Download the program'],
  'ai.saved': ['Сохранено', 'Saved'], 'ai.deleted': ['Ключ удалён', 'Key deleted'],
  'ai.t.ok': ['Связь есть. Модель {0} ответила: «{1}».', 'Connected. The model {0} replied: "{1}".'],
  'ai.t.ok.n': ['Связь есть. Моделей у поставщика: {2}. Модель {0} ответила: «{1}».', 'Connected. The provider has {2} models. The model {0} replied: "{1}".'],
  'ai.confirm.del': ['Удалить сохранённый ключ?', 'Delete the saved key?'],
  'ai.e.nokey': ['Сначала сохраните ключ.', 'Save the key first.'],
  'ai.e.badkeyfmt': ['Это не похоже на ключ: он состоит из латинских букв, цифр и знаков без пробелов, минимум 8 символов.', 'This does not look like a key: it is made of Latin letters, digits and signs without spaces, at least 8 characters.'],
  'ai.e.badkey': ['Поставщик не принял ключ (код {0}). Проверьте, что ключ скопирован целиком, не просрочен и у аккаунта есть доступ.{1}', 'The provider did not accept the key (code {0}). Check that the key is copied whole, is not expired, and that the account has access.{1}'],
  'ai.e.money': ['Не хватает денег на балансе поставщика (код 402).', 'There is not enough money on the provider balance (code 402).'],
  'ai.e.notfound': ['Не найдено (код 404): проверьте адрес и имя модели.{1}', 'Not found (code 404): check the address and the model name.{1}'],
  'ai.e.quota': ['Слишком много запросов или закончился лимит (код 429). Подождите немного или выберите другую модель.{1}', 'Too many requests or the limit is used up (code 429). Wait a little or pick another model.{1}'],
  'ai.e.badreq': ['Поставщик отклонил запрос: {1}', 'The provider rejected the request: {1}'],
  'ai.e.http': ['Неожиданный ответ поставщика (код {0}). {1}', 'Unexpected answer from the provider (code {0}). {1}'],
  'ai.e.server': ['Сервис поставщика сейчас не справляется (код {0}). Попробуйте позже.', 'The provider service is struggling right now (code {0}). Try again later.'],
  'ai.e.network': ['Нет связи с сервисом. Проверьте интернет. {1}', 'Cannot reach the service. Check your internet connection. {1}'],
  'ai.e.refused': ['Не удалось подключиться по адресу {2}. Запущена ли программа и верен ли адрес?', 'Could not connect to {2}. Is the program running, and is the address right?'],
  'ai.e.netweb': ['Браузер не смог выполнить запрос: нет интернета, неверный адрес, или сервис не разрешает запросы со страниц сайтов. В настольной программе такой проблемы нет.', 'The browser could not make the request: no internet, a wrong address, or the service does not allow requests from web pages. The desktop app does not have this problem.'],
  'ai.e.netweb.local': ['Браузер не смог подключиться к локальной программе. Она запущена? Для веб-версии ей нужно разрешить запросы с этой страницы (у Ollama это переменная OLLAMA_ORIGINS, у LM Studio галочка «Enable CORS»). В настольной программе этого не требуется.', 'The browser could not reach the local program. Is it running? For the web version it must allow requests from this page (Ollama: the OLLAMA_ORIGINS variable; LM Studio: the "Enable CORS" option). The desktop app does not need this.'],
  'ai.e.timeout': ['Ответа нет слишком долго. Попробуйте ещё раз.', 'No answer for too long. Try again.'],
  'ai.e.toobig': ['Ответ получился слишком длинным.', 'The answer turned out too long.'],
  'ai.e.empty': ['Модель вернула пустой ответ.', 'The model returned an empty answer.'],
  'ai.e.blocked': ['Поставщик не выдал ответ (сработали его ограничения: {1}).', 'The provider gave no answer (its filters stepped in: {1}).'],
  'ai.e.badreply': ['Ответ поставщика непонятен программе. Проверьте адрес.', 'The provider answer is not understood by the app. Check the address.'],
  'ai.e.nomodel': ['Укажите модель: выберите из списка или впишите имя.', 'Pick a model from the list or type its name.'],
  'ai.e.nobase': ['Укажите адрес сервиса.', 'Enter the service address.'],
  'ai.e.insecure': ['Адрес по http допустим только для своего компьютера и домашней сети.', 'An http address is only allowed for your own computer and home network.'],
  'ai.e.badbase': ['Адрес не подходит: он должен начинаться с http:// или https:// и не содержать логина и параметров.', 'The address is not valid: it must start with http:// or https:// and contain no login or parameters.'],
  'ai.e.busy': ['Слишком много запросов сразу. Подождите секунду.', 'Too many requests at once. Wait a second.'],
  'ai.e.oldshell': ['Установленная оболочка программы старая и не умеет связываться с ИИ.', 'The installed app shell is old and cannot talk to AI services.'],
  'ai.e.aborted': ['Остановлено.', 'Stopped.'],
  'ai.e.fail': ['Не получилось. {1}', 'It did not work. {1}'],
  /* справка по поставщикам: line — что это; need — что потребуется; steps — как подключить (через |); warn — подводные камни */
  'ai.p.gemini.n': ['Google Gemini', 'Google Gemini'],
  'ai.p.gemini.line': ['Модели Google. Самый простой старт: ключ за минуту, карта не нужна.', 'Google models. The easiest start: a key in a minute, no card needed.'],
  'ai.p.gemini.need': ['Аккаунт Google. Больше ничего.', 'A Google account. Nothing else.'],
  'ai.p.gemini.steps': ['Откройте страницу ключей (кнопка ниже) и войдите в аккаунт Google.|Нажмите «Create API key» и скопируйте ключ.|Вставьте его сюда, нажмите «Сохранить», затем «Проверить связь».', 'Open the keys page (button below) and sign in with your Google account.|Press "Create API key" and copy the key.|Paste it here, press "Save", then "Test connection".'],
  'ai.p.gemini.warn': ['Бесплатный уровень ограничен числом запросов в минуту и в день. На нём Google может использовать запросы для улучшения своих продуктов, поэтому не отправляйте то, что хотите сохранить в тайне. Доступен не во всех странах.', 'The free tier is limited in requests per minute and per day. On it Google may use requests to improve its products, so do not send anything you want to keep private. It is not available in every country.'],
  'ai.p.groq.n': ['Groq', 'Groq'],
  'ai.p.groq.line': ['Открытые модели (Llama, Qwen и другие) на очень быстром сервисе. Карта не нужна.', 'Open models (Llama, Qwen and others) on a very fast service. No card needed.'],
  'ai.p.groq.need': ['Вход через Google, GitHub или почту.', 'Sign in with Google, GitHub or email.'],
  'ai.p.groq.steps': ['Откройте страницу ключей (кнопка ниже) и войдите.|Нажмите «Create API Key», дайте имя и скопируйте ключ (он начинается с gsk_).|Вставьте его сюда, нажмите «Сохранить», затем «Проверить связь».', 'Open the keys page (button below) and sign in.|Press "Create API Key", give it a name and copy the key (it starts with gsk_).|Paste it here, press "Save", then "Test connection".'],
  'ai.p.groq.warn': ['Бесплатный уровень ограничен числом запросов в минуту и в день. Сервис закрыт для некоторых стран и регионов (тогда будет ошибка 403). Модели открытые, а не самые сильные.', 'The free tier is limited in requests per minute and per day. The service is closed to some countries and regions (you will get error 403). The models are open ones, not the strongest.'],
  'ai.p.openrouter.n': ['OpenRouter', 'OpenRouter'],
  'ai.p.openrouter.line': ['Один ключ ко многим моделям разных компаний. Есть бесплатные модели (в названии «:free»).', 'One key for many models from different companies. There are free models (their name ends with ":free").'],
  'ai.p.openrouter.need': ['Аккаунт (Google, GitHub или почта). Платные модели оплачиваются с баланса.', 'An account (Google, GitHub or email). Paid models are billed from your balance.'],
  'ai.p.openrouter.steps': ['Откройте страницу ключей (кнопка ниже) и войдите.|Создайте ключ (Create Key) и скопируйте его.|Вставьте его сюда, нажмите «Сохранить», затем «Проверить связь».|В поле «Модель» выберите ту, что оканчивается на :free, если не хотите платить.', 'Open the keys page (button below) and sign in.|Create a key (Create Key) and copy it.|Paste it here, press "Save", then "Test connection".|In the "Model" field pick one that ends with :free if you do not want to pay.'],
  'ai.p.openrouter.warn': ['У бесплатных моделей небольшие дневные лимиты, они бывают заняты и со временем меняются. Платные модели списывают деньги с баланса.', 'Free models have small daily limits, can be busy, and change over time. Paid models take money from your balance.'],
  'ai.p.deepseek.n': ['DeepSeek', 'DeepSeek'],
  'ai.p.deepseek.line': ['Модели для кода. Оплата по факту использования: бесплатного уровня нет, нужно пополнить баланс.', 'Models for code. Pay as you use: there is no free tier, you need to top up the balance.'],
  'ai.p.deepseek.need': ['Аккаунт на platform.deepseek.com и пополненный баланс.', 'An account on platform.deepseek.com and a topped-up balance.'],
  'ai.p.deepseek.steps': ['Зарегистрируйтесь на платформе (кнопка ниже).|Пополните баланс.|Создайте ключ в разделе API keys, вставьте его сюда, нажмите «Сохранить», затем «Проверить связь».', 'Register on the platform (button below).|Top up the balance.|Create a key in the API keys section, paste it here, press "Save", then "Test connection".'],
  'ai.p.deepseek.warn': ['Сервис китайской компании: запросы обрабатываются на её серверах, не отправляйте ничего секретного. Доступность и способы оплаты зависят от страны.', 'The service belongs to a Chinese company: requests are processed on its servers, so do not send anything secret. Availability and payment methods depend on the country.'],
  'ai.p.openai.n': ['OpenAI (GPT)', 'OpenAI (GPT)'],
  'ai.p.openai.line': ['Модели GPT. Платно: оплата с баланса.', 'GPT models. Paid: billed from your balance.'],
  'ai.p.openai.need': ['Аккаунт на platform.openai.com и баланс. Подписка ChatGPT для этого не подходит: API оплачивается отдельно.', 'An account on platform.openai.com and a balance. A ChatGPT subscription does not cover this: the API is billed separately.'],
  'ai.p.openai.steps': ['Откройте платформу (кнопка ниже) и войдите.|Пополните баланс в разделе Billing.|Создайте ключ (Create new secret key) и сразу скопируйте: потом его не покажут.|Вставьте его сюда, нажмите «Сохранить», затем «Проверить связь».', 'Open the platform (button below) and sign in.|Top up the balance in the Billing section.|Create a key (Create new secret key) and copy it at once: it will not be shown again.|Paste it here, press "Save", then "Test connection".'],
  'ai.p.openai.warn': ['Ключ показывается один раз. Деньги списываются с баланса за каждый запрос: поставьте лимит расходов, если такая возможность есть в настройках аккаунта. Доступно не во всех странах.', 'The key is shown only once. Money is taken from the balance for every request: set a spending limit if the account settings offer one. It is not available in every country.'],
  'ai.p.anthropic.n': ['Anthropic (Claude)', 'Anthropic (Claude)'],
  'ai.p.anthropic.line': ['Модели Claude, хорошо пишут код. Платно: оплата с баланса.', 'Claude models, good at code. Paid: billed from your balance.'],
  'ai.p.anthropic.need': ['Аккаунт на console.anthropic.com и баланс. Подписка на claude.ai для этого не подходит: API оплачивается отдельно.', 'An account on console.anthropic.com and a balance. A claude.ai subscription does not cover this: the API is billed separately.'],
  'ai.p.anthropic.steps': ['Откройте консоль (кнопка ниже) и войдите.|Пополните баланс в разделе Billing.|Создайте ключ (Create Key) и сразу скопируйте: потом его не покажут.|Вставьте его сюда, нажмите «Сохранить», затем «Проверить связь».', 'Open the console (button below) and sign in.|Top up the balance in the Billing section.|Create a key (Create Key) and copy it at once: it will not be shown again.|Paste it here, press "Save", then "Test connection".'],
  'ai.p.anthropic.warn': ['Ключ показывается один раз. Деньги списываются с баланса за каждый запрос. Доступно не во всех странах.', 'The key is shown only once. Money is taken from the balance for every request. It is not available in every country.'],
  'ai.p.ollama.n': ['Ollama (на вашем компьютере)', 'Ollama (on your computer)'],
  'ai.p.ollama.line': ['Модель работает у вас на компьютере: бесплатно, без интернета, запросы никуда не уходят.', 'The model runs on your computer: free, works offline, requests go nowhere.'],
  'ai.p.ollama.need': ['Установить Ollama и скачать модель (несколько гигабайт). Нужен достаточно мощный компьютер: на слабом ответы будут очень медленными.', 'Install Ollama and download a model (a few gigabytes). The computer must be fairly powerful: on a weak one answers are very slow.'],
  'ai.p.ollama.steps': ['Установите Ollama (кнопка ниже) и запустите её.|В терминале выполните команду ollama pull и имя модели для кода, например qwen2.5-coder:7b (список моделей на ollama.com/library).|Нажмите «Проверить связь»: адрес по умолчанию уже указан.', 'Install Ollama (button below) and start it.|In a terminal run ollama pull and the name of a code model, for example qwen2.5-coder:7b (the list is at ollama.com/library).|Press "Test connection": the default address is already filled in.'],
  'ai.p.ollama.warn': ['Для моделей в 7–8 млрд параметров ориентир такой: 16 ГБ оперативной памяти или видеокарта с 6 ГБ памяти; для больших нужно заметно больше. В веб-версии браузер может не пустить запрос: Ollama нужно разрешить адрес страницы (переменная OLLAMA_ORIGINS). В настольной программе этого не требуется.', 'For models of 7-8 billion parameters the rule of thumb is 16 GB of RAM or a graphics card with 6 GB of memory; bigger ones need noticeably more. In the web version the browser may block the request: Ollama must allow the page address (the OLLAMA_ORIGINS variable). The desktop app does not need this.'],
  'ai.p.lmstudio.n': ['LM Studio (на вашем компьютере)', 'LM Studio (on your computer)'],
  'ai.p.lmstudio.line': ['Программа с окнами для локальных моделей: проще Ollama, если не хочется терминала.', 'A program with windows for local models: simpler than Ollama if you do not like terminals.'],
  'ai.p.lmstudio.need': ['Установить LM Studio, скачать в ней модель и включить локальный сервер. Мощность компьютера нужна та же, что для Ollama.', 'Install LM Studio, download a model in it and turn on the local server. It needs the same computer power as Ollama.'],
  'ai.p.lmstudio.steps': ['Установите LM Studio (кнопка ниже) и запустите.|На вкладке поиска скачайте модель для кода (например, из семейства Qwen Coder).|Откройте вкладку Developer, загрузите модель и нажмите «Start server».|Нажмите «Проверить связь»: адрес по умолчанию уже указан.', 'Install LM Studio (button below) and start it.|On the search tab download a code model (for example from the Qwen Coder family).|Open the Developer tab, load the model and press "Start server".|Press "Test connection": the default address is already filled in.'],
  'ai.p.lmstudio.warn': ['Модель должна быть загружена в память, иначе запрос не пройдёт. Для веб-версии в настройках сервера включите «Enable CORS». В настольной программе этого не требуется.', 'The model must be loaded into memory, or the request fails. For the web version turn on "Enable CORS" in the server settings. The desktop app does not need this.'],
  'ai.p.custom.n': ['Другой сервис (как у OpenAI)', 'Another service (OpenAI-compatible)'],
  'ai.p.custom.line': ['Любой сервис с интерфейсом «как у OpenAI»: Mistral, Together, xAI, свой сервер и подобные.', 'Any service with an "OpenAI-like" interface: Mistral, Together, xAI, your own server and similar.'],
  'ai.p.custom.need': ['Адрес сервиса (обычно оканчивается на /v1), ключ и точное имя модели.', 'The service address (usually ending with /v1), a key and the exact model name.'],
  'ai.p.custom.steps': ['В документации сервиса найдите «OpenAI-compatible base URL» и вставьте его в поле «Адрес».|Вставьте ключ и впишите имя модели.|Нажмите «Сохранить», затем «Проверить связь».', 'In the service documentation find the "OpenAI-compatible base URL" and paste it into the "Address" field.|Paste the key and type the model name.|Press "Save", then "Test connection".'],
  'ai.p.custom.warn': ['Работает только с сервисами, повторяющими интерфейс OpenAI. Адрес по http допускается лишь для своего компьютера и домашней сети. Список моделей есть не у всех: тогда впишите имя вручную.', 'Works only with services that copy the OpenAI interface. An http address is allowed only for your own computer and home network. Not every service lists models: then type the name by hand.'],
});

const AIUI = { open: '', draft: {} };           // раскрытая карточка и несохранённые черновики полей (чтобы перерисовка не стирала набранное)
const aiDraft = id => AIUI.draft[id] || (AIUI.draft[id] = {});
function aiExt(url) { if (DESK) DESK.openExternal(url).catch(() => { }); else window.open(url, '_blank', 'noopener'); }
/** Понятный текст ошибки: { code, status, msg } → строка. */
function aiErrText(p, e) {
  e = e || {};
  let code = e.code || 'fail';
  if (code === 'netweb' && p && aiIsLocal(p)) code += '.local';
  if (!D['ai.e.' + code]) code = 'fail';
  const det = e.msg ? ' ' + e.msg : '';
  return t('ai.e.' + code, e.status || '', code === 'badkey' || code === 'notfound' || code === 'quota' ? (e.msg ? ' (' + e.msg + ')' : '') : det.trim(), p ? aiBase(p.id) : '').replace(/\s+$/, '');
}
function aiWhereText() {
  const sup = aiSupport();
  if (sup === 'web') return t('ai.where.web');
  return AIS.st && AIS.st.encrypted === false ? t('ai.where.noenc') : t('ai.where.desktop');
}

/** Карточка одного поставщика. repaint перерисовывает весь список (после смены выбора), upd — только эту карточку. */
function aiCard(p, repaint) {
  const on = aiCfg().prov === p.id, open = AIUI.open === p.id, hasKey = aiHasKey(p.id), tst = AIS.test[p.id] || null, dr = aiDraft(p.id);
  const card = h('div', { class: 'ai-card' + (on ? ' on' : '') + (open ? ' open' : ''), id: 'ai-' + p.id, 'data-prov': p.id });
  const upd = () => { const cur = document.getElementById('ai-' + p.id) || card; cur.replaceWith(aiCard(p, repaint)); };      // карточку могли уже заменить: ищем текущую
  const state = p.tag === 'local' ? t('ai.st.local') : p.keyOptional && !hasKey ? '' : hasKey ? t('ai.st.key') : t('ai.st.nokey');
  const head = h('div', { class: 'ai-head' },
    h('button', { class: 'ai-pick' + (on ? ' on' : ''), type: 'button', 'aria-pressed': String(on), title: on ? t('ai.using') : t('ai.use'), onclick: () => { aiSetProv(on ? '' : p.id); repaint(); } }, on ? icon('check', 13) : null),
    h('button', { class: 'ai-tog', type: 'button', 'aria-expanded': String(open), onclick: () => { AIUI.open = open ? '' : p.id; repaint(); } },
      h('span', { class: 'ai-name' }, t('ai.p.' + p.id + '.n')),
      h('span', { class: 'ai-lvl l' + p.lvl, 'data-tip': t('ai.how') }, t('ai.lvl.' + p.lvl)),
      h('span', { class: 'ai-tag ' + p.tag }, t('ai.tag.' + p.tag)),
      h('span', { class: 'ai-st' + (hasKey || p.tag === 'local' ? ' on' : '') }, on ? t('ai.using') : state),
      icon(open ? 'chevU' : 'chevD', 14)));
  card.append(head, h('div', { class: 'ai-line hint' }, t('ai.p.' + p.id + '.line')));
  if (!open) return card;
  const body = h('div', { class: 'ai-body' });
  body.append(h('div', { class: 'ai-sec' }, h('b', t('ai.need') + ': '), t('ai.p.' + p.id + '.need')));
  body.append(h('div', { class: 'ai-sec' }, h('b', t('ai.how')), h('ol', { class: 'ai-steps' }, ...t('ai.p.' + p.id + '.steps').split('|').map(s => h('li', s)))));
  body.append(h('div', { class: 'ai-sec ai-warn' }, icon('alert', 14), h('span', null, h('b', t('ai.warn') + ': '), t('ai.p.' + p.id + '.warn'))));
  const links = h('div', { class: 'nt-btns' });
  if (p.keyUrl) links.append(h('button', { class: 'btn sm', type: 'button', onclick: () => aiExt(p.keyUrl) }, icon('open', 13), t('ai.open.keys')));
  if (p.site) links.append(h('button', { class: 'btn sm', type: 'button', onclick: () => aiExt(p.site) }, icon('open', 13), t(p.siteKey || 'ai.open.site')));
  if (links.children.length) body.append(links);
  /* поля */
  let addr = null, key, model;
  if (p.own) {
    addr = h('input', { class: 'inp mono', type: 'text', id: 'ai-base-' + p.id, value: dr.base != null ? dr.base : aiBase(p.id), placeholder: p.base || 'https://…/v1', spellcheck: 'false', autocomplete: 'off' });
    addr.addEventListener('input', () => { dr.base = addr.value; });
  }
  key = h('input', { class: 'inp mono', type: 'password', id: 'ai-key-' + p.id, value: dr.key || '', placeholder: hasKey ? t('ai.key.saved') : t('ai.key.ph'), spellcheck: 'false', autocomplete: 'new-password' });
  key.addEventListener('input', () => { dr.key = key.value; });
  const listId = 'ai-models-' + p.id;
  model = h('input', { class: 'inp mono', type: 'text', id: 'ai-model-' + p.id, value: dr.model != null ? dr.model : aiModel(p.id), placeholder: t('ai.model.ph'), list: listId, spellcheck: 'false', autocomplete: 'off' });
  model.addEventListener('input', () => { dr.model = model.value; });
  model.addEventListener('change', () => { aiSetModel(p.id, model.value); dr.model = undefined; });
  const dl = h('datalist', { id: listId }, ...(AIS.models[p.id] || []).map(m => h('option', { value: m })));
  const msg = h('div', { class: 'ai-res' });
  const showRes = () => {
    const r = AIS.test[p.id];
    msg.className = 'ai-res' + (r && !r.busy ? (r.ok ? ' ok' : ' bad') : '');
    msg.replaceChildren(...(!r ? [] : r.busy ? [h('span', t('ai.test.busy'))] : [icon(r.ok ? 'check' : 'alert', 14), h('span', r.text)]));
  };
  showRes();
  const saveAll = async () => {
    try {
      if (p.own && addr && (dr.base != null) && dr.base.trim() !== aiBase(p.id)) { await aiSetBase(p.id, dr.base); dr.base = undefined; }
      if (dr.key) { await aiSetKey(p.id, dr.key); dr.key = ''; }
      if (dr.model != null) { aiSetModel(p.id, dr.model); dr.model = undefined; }
      AIS.test[p.id] = { ok: true, text: t('ai.saved') };
      upd();
    } catch (e) { AIS.test[p.id] = { ok: false, text: aiErrText(p, { code: e.aiCode || 'fail' }) }; showRes(); }
  };
  key.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveAll(); } });
  const refreshBtn = h('button', { class: 'btn sm', type: 'button', id: 'ai-refresh-' + p.id, 'data-tip': t('ai.model.refresh'), 'aria-label': t('ai.model.refresh'), onclick: async () => {
    const r = await aiListModels(p.id); if (r.ok) { if (!aiModel(p.id)) { const m = aiPickModel(p, r.models); if (m) aiSetModel(p.id, m); } dr.model = undefined; upd(); }
    else { AIS.test[p.id] = { ok: false, text: aiErrText(p, r.err) }; showRes(); }
  } }, icon('refresh', 14));
  body.append(h('div', { class: 'ai-fields' },
    addr ? field(t('ai.f.addr'), addr, t('ai.f.addr.h')) : null,
    field(p.keyOptional || p.own ? t('ai.f.key.opt') : t('ai.f.key'), key),
    field(t('ai.f.model'), h('div', { class: 'ai-mrow' }, model, dl, refreshBtn), t('ai.model.h'))));
  const test = h('button', { class: 'btn primary sm', type: 'button', id: 'ai-test-' + p.id, onclick: async () => {
    if (dr.key || (p.own && dr.base != null) || dr.model != null) { await saveAll(); }
    if (AIS.test[p.id] && AIS.test[p.id].busy) return;
    AIS.test[p.id] = { busy: true }; upd();
    const r = await aiTest(p.id);
    AIS.test[p.id] = r.ok
      ? { ok: true, text: r.models && r.models.length ? t('ai.t.ok.n', r.model, r.reply, r.models.length) : t('ai.t.ok', r.model, r.reply) }
      : { ok: false, text: aiErrText(p, r.err) };
    if (r.ok && !aiCfg().prov) aiSetProv(p.id);
    if (document.getElementById('ai-' + p.id)) { if (!aiCfg().prov || r.ok) repaint(); else upd(); }
  } }, icon('refresh', 14), t('ai.test'));
  if (tst && tst.busy) { test.disabled = true; test.lastChild.textContent = t('ai.test.busy'); }
  body.append(h('div', { class: 'nt-btns' },
    h('button', { class: 'btn sm', type: 'button', id: 'ai-save-' + p.id, onclick: saveAll }, t('ai.save')),
    test,
    hasKey ? h('button', { class: 'btn sm danger', type: 'button', id: 'ai-del-' + p.id, onclick: async () => {
      if (!await confirmDlg({ title: t('ai.confirm.del'), ok: t('ai.key.del'), danger: true })) return;
      try { await aiClearKey(p.id); if (aiCfg().prov === p.id) aiSetProv(''); AIS.test[p.id] = { ok: true, text: t('ai.deleted') }; repaint(); } catch (e) { AIS.test[p.id] = { ok: false, text: aiErrText(p, { code: e.aiCode || 'fail' }) }; showRes(); }
    } }, icon('trash', 13), t('ai.key.del')) : null), msg);
  card.append(body);
  return card;
}

function setAi(st, render) {
  const box = h('div', { class: 'nt-list ai-set', id: 'ai-set' }), sup = aiSupport();
  box.append(h('div', { class: 'hint' }, t('ai.intro')), h('div', { class: 'hint' }, t('ai.priv')));
  if (sup === 'oldshell') { box.append(h('div', { class: 'hint warn-t', id: 'ai-oldshell' }, t('ai.oldshell')), ghShellButtons()); return box; }
  const where = h('div', { class: 'hint ai-where' }, icon('lock', 14), h('span', aiWhereText()));
  const list = h('div', { class: 'ai-list' });
  const paint = () => { const y = st && st.body ? st.body.scrollTop : 0; list.replaceChildren(...AI_PROV.map(p => aiCard(p, paint))); if (st && st.body) st.body.scrollTop = y; };
  paint();
  aiRefresh().then(() => { if (list.isConnected) { where.lastChild.textContent = aiWhereText(); paint(); } });
  box.append(where, list);
  return box;
}
