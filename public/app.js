// Клиентский скрипт: регистрация service worker и загрузка статуса

// 1. Регистрация service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service worker зарегистрирован:', reg.scope))
      .catch((err) => console.error('Ошибка регистрации service worker:', err));
  });
}

// 2. Индикатор онлайн / офлайн
const net = document.getElementById('net');
function updateNet() {
  if (!net) return;
  net.textContent = navigator.onLine ? 'Онлайн' : 'Офлайн (данные из кеша)';
  net.classList.toggle('off', !navigator.onLine);
}
window.addEventListener('online', updateNet);
window.addEventListener('offline', updateNet);
updateNet();

// 3. Загрузка данных с /api/status (только на главной странице)
async function loadStatus() {
  const details = document.getElementById('details').checked;
  const url = details ? '/api/status?details=true' : '/api/status';
  try {
    const res = await fetch(url);
    const data = await res.json();
    document.getElementById('uptime').textContent = data.uptimeSeconds + ' с';
    document.getElementById('memory').textContent = data.memoryUsageMB + ' МБ';
    document.getElementById('cpu').textContent = data.cpuCount;
    document.getElementById('time').textContent = new Date(data.timestamp).toLocaleString('ru-RU');
    document.getElementById('json').textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    document.getElementById('json').textContent = 'Нет соединения с сервером и нет данных в кеше';
  }
}

if (document.getElementById('refresh')) {
  document.getElementById('refresh').addEventListener('click', loadStatus);
  document.getElementById('details').addEventListener('change', loadStatus);
  loadStatus();
}
