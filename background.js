chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-bookmark') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      addBookmark(currentTab)
    })
  } else if (command === 'toggle-container') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleContainer' })
    })
  }
})

async function addBookmark(tab) {
  const bookmarks = await chrome.storage.sync.get('bookmarks')
  const bookmarkList = bookmarks.bookmarks || []

  // 최대 9개 제한 확인
  if (bookmarkList.length >= 9) {
    notifyContent('info', '북마크는 최대 9개까지만 저장할 수 있습니다.')
    return
  }

  // 중복 URL 확인
  if (bookmarkList.some((bookmark) => bookmark.url === tab.url)) {
    notifyContent('error', '이미 저장된 북마크입니다.')
    return
  }

  // 새 북마크 추가
  const newBookmark = {
    id: Date.now(),
    title: tab.title,
    url: tab.url,
    favicon: tab.favIconUrl,
    addedTime: new Date().toISOString(),
  }

  bookmarkList.push(newBookmark)
  await chrome.storage.sync.set({ bookmarks: bookmarkList })
  notifyContent('success', '북마크가 저장되었습니다.')
}

function notifyContent(type, message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showToast',
      type: type,
      message: message,
    })
  })
}
