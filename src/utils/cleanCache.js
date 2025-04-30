import { cleanCache as realCleanCache } from 'components/CacheComponent';

export function cleanCache(cachePreKey) {
  const event = new CustomEvent('clean_cache', {
    detail: {
      cachePreKey,
    },
  });

  if (window.dispatchEvent) {
    window.dispatchEvent(event);
  } else {
    console.log('当前浏览器不支持dispatchEvent');
  }
}

export function initCleanCacheListener(prefix = '') {
  window.addEventListener('clean_cache', (e) => {
    const { detail = {} } = e;
    const { cachePreKey = '' } = detail;

    // 区分不同模块，避免多次执行
    if (cachePreKey.startsWith(prefix)) {
      realCleanCache(cachePreKey);
    }
  });
}
