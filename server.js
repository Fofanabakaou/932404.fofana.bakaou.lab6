// Лабораторная работа №6, вариант 20 — «API статуса сервера» (расширенный)
// Фофана Бакау, гр. 932404

const express = require('express'); // внешний модуль (установлен через npm)
const path = require('path');       // встроенный модуль Node.js: работа с путями
const os = require('os');           // встроенный модуль Node.js: сведения об ОС
 
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Логирование каждого запроса (middleware)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next(); // передаём запрос дальше
});

// 2. Раздача статических файлов (HTML, CSS, JS, иконки) из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Вспомогательная функция: байты -> мегабайты (2 знака после запятой)
const toMB = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

// Сбор метрик сервера
function getStatus(details) {
  const mem = process.memoryUsage();
  const status = {
    uptimeSeconds: Math.round(process.uptime()), // сколько секунд работает процесс
    memoryUsageMB: toMB(mem.rss),                // память, занятая процессом
    cpuCount: os.cpus().length,                  // количество ядер процессора
    timestamp: new Date().toISOString()          // время ответа в формате ISO
  };

  // Расширенный ответ, если передан query-параметр ?details=true
  if (details) {
    status.memory = {
      rssMB: toMB(mem.rss),
      heapTotalMB: toMB(mem.heapTotal),
      heapUsedMB: toMB(mem.heapUsed),
      externalMB: toMB(mem.external)
    };
    status.cpuModel = os.cpus()[0]?.model || 'unknown';
    status.platform = os.platform();
    status.nodeVersion = process.version;
  }
  return status;
}

// 3. Маршруты страниц
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// 4. API: GET /api/status  (query-параметр ?details=true)
app.get('/api/status', (req, res) => {
  const details = req.query.details === 'true';
  res.json(getStatus(details));
});

// 5. API: GET /api/status/:metric  (параметр маршрута)
//    например /api/status/uptime, /api/status/memory, /api/status/cpu
app.get('/api/status/:metric', (req, res) => {
  const metric = req.params.metric;
  const s = getStatus(false);
  const map = {
    uptime: { uptimeSeconds: s.uptimeSeconds },
    memory: { memoryUsageMB: s.memoryUsageMB },
    cpu: { cpuCount: s.cpuCount }
  };
  if (!map[metric]) {
    return res.status(404).json({ error: 'Unknown metric', allowed: Object.keys(map) });
  }
  res.json({ ...map[metric], timestamp: s.timestamp });
});

// 6. Всё остальное — 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 7. Запуск сервера
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}: http://localhost:${PORT}`);
});
