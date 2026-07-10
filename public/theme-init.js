// Set theme before first paint to avoid FOUC. External (not inline) so the CSP needs no script hash.
;(function () {
  try {
    var t = localStorage.getItem('vitrina_theme')
    document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark'
  } catch (e) {
    document.documentElement.dataset.theme = 'dark'
  }
})()
