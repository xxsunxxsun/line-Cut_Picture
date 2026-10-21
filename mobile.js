// 手機下載相容處理（各頁共用）
(function () {
  const ua = navigator.userAgent;

  // LINE 內建瀏覽器不能下載檔案：加上 openExternalBrowser=1，LINE 會改用手機的預設瀏覽器開啟
  if (/\bLine\//i.test(ua) && !/[?&]openExternalBrowser=1\b/.test(location.search)) {
    const url = new URL(location.href);
    url.searchParams.set('openExternalBrowser', '1');
    location.replace(url.toString());
    return;
  }

  // Facebook / Instagram / Messenger 的內建瀏覽器沒有辦法自動跳轉，只能提示
  const inApp = /FBAN|FBAV|FB_IAB|Instagram|Messenger/i.test(ua);
  if (inApp) {
    document.addEventListener('DOMContentLoaded', () => {
      const bar = document.createElement('div');
      bar.style.cssText = 'position:sticky;top:0;z-index:999;width:100%;background:#fff3e0;color:#bf360c;' +
        'border-bottom:2px solid #ffb74d;padding:10px 16px;font-size:15px;line-height:1.5;text-align:center;';
      bar.innerHTML = '⚠️ 這個 App 內建的瀏覽器<b>無法下載圖片</b>。請點右上角「⋯」選單，選「<b>用瀏覽器開啟</b>」（Chrome）。';
      document.body.prepend(bar);
    });
  }
})();

// data: 網址轉成 Blob
function dataURLToBlob(url) {
  const [head, b64] = url.split(',');
  const mime = (head.match(/data:([^;]+)/) || [])[1] || 'application/octet-stream';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// 用 Blob 網址下載檔案（安卓 Chrome 對 data: 網址下載常常失敗）
function saveFile(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

// 能不能用系統分享選單分享圖片檔（安卓 Chrome 可以）
function canShareFiles() {
  try {
    const f = new File([new Uint8Array(1)], 't.png', { type: 'image/png' });
    return !!(navigator.canShare && navigator.canShare({ files: [f] }));
  } catch (e) {
    return false;
  }
}

// 頁面上所有 data: 下載連結，一律改走 Blob 下載
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[download]');
  if (!a || !a.href.startsWith('data:')) return;
  e.preventDefault();
  saveFile(dataURLToBlob(a.href), a.getAttribute('download') || 'image.png');
});
