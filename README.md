# Лабораторная работа №6. Node.js и Express — вариант 20

**Фофана Бакау, гр. 932404**

Тема: «API статуса сервера» (расширенный). Сервер на Express отдаёт статику, имеет маршруты `/`, `/about`, `/api/status` и работает как PWA (manifest + service worker, офлайн-режим).

## Запуск

```bash
npm install      # установить зависимости (express)
npm start        # запустить сервер
```

Открыть в браузере: http://localhost:3000

## Маршруты

| Маршрут | Что возвращает |
|---|---|
| `GET /` | главная страница (HTML) |
| `GET /about` | страница «О себе» (HTML) |
| `GET /api/status` | `{ uptimeSeconds, memoryUsageMB, cpuCount, timestamp }` |
| `GET /api/status?details=true` | то же + подробная память, модель CPU, ОС, версия Node |
| `GET /api/status/:metric` | одна метрика: `uptime`, `memory`, `cpu` |
| любой другой | `404 { error: "Not found" }` |

## Структура

```
lab6/
├── package.json       описание проекта и зависимости
├── server.js          сервер Express
└── public/            статические файлы
    ├── index.html     главная
    ├── about.html     о себе
    ├── style.css      стили
    ├── app.js         клиентский JS: регистрация SW, запрос к API
    ├── manifest.json  манифест PWA
    ├── sw.js          service worker (кеш, офлайн)
    └── icons/         иконки 192 и 512 px
```

## Проверка PWA

1. Открыть http://localhost:3000 в Chrome.
2. DevTools → Application → Manifest / Service Workers — всё зарегистрировано.
3. В адресной строке значок «Установить приложение».
4. DevTools → Network → Offline → обновить страницу — приложение работает из кеша.
