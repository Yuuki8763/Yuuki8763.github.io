// ⚠️ 關鍵：以後每次更新上傳 GitHub，請務必把這個版本號加 1 (例如改 rpg-v2, rpg-v3...)
const CACHE = 'rpg-v2'; 
const FILES = [
  '/',
  '/index.html',
  '/en/index.html'
];

// 1. 安裝階段
self.addEventListener('install', e => {
  self.skipWaiting(); // 強制新的 Service Worker 立即啟動，不要等玩家關掉瀏覽器
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
});

// 2. 啟動階段 (負責清理舊版快取)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // 如果發現舊版本的快取名稱，就把它刪除
          if (key !== CACHE) {
            console.log('[Service Worker] 刪除舊快取:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即接管所有開啟的網頁
  );
});

// 3. 攔截請求階段 (改為「網路優先」策略)
self.addEventListener('fetch', e => {
  e.respondWith(
    // 先嘗試去網路抓最新的檔案
    fetch(e.request)
      .catch(() => {
        // 如果網路斷線或抓取失敗，才退回使用快取 (這樣依然能離線遊玩)
        return caches.match(e.request);
      })
  );
});
