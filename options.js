// 북마크 목록 로드 및 표시
async function loadBookmarks() {
  const bookmarks = await chrome.storage.sync.get('bookmarks')
  const bookmarkList = bookmarks.bookmarks || []
  const container = document.getElementById('bookmarkList')

  container.innerHTML = ''
  bookmarkList.forEach((bookmark, index) => {
    const bookmarkElement = document.createElement('div')
    bookmarkElement.className = 'bookmark-item'
    bookmarkElement.innerHTML = `
      <img src="${bookmark.favicon || 'default-favicon.png'}" alt="${bookmark.title}">
      <div class="bookmark-info">
        <div class="bookmark-title">${bookmark.title}</div>
        <div class="bookmark-url">${bookmark.url}</div>
        <div class="bookmark-time">추가된 시간: ${new Date(
          bookmark.addedTime
        ).toLocaleString()}</div>
      </div>
      <button class="delete-btn" data-id="${bookmark.id}">삭제</button>
    `
    container.appendChild(bookmarkElement)
  })

  // 삭제 버튼 이벤트 리스너 추가
  document.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', deleteBookmark)
  })
}

// 북마크 삭제
async function deleteBookmark(event) {
  const bookmarkId = parseInt(event.target.dataset.id)
  const bookmarks = await chrome.storage.sync.get('bookmarks')
  const bookmarkList = bookmarks.bookmarks || []

  const updatedBookmarks = bookmarkList.filter((bookmark) => bookmark.id !== bookmarkId)
  await chrome.storage.sync.set({ bookmarks: updatedBookmarks })

  // 목록 다시 로드
  loadBookmarks()
}

// 초기 로드
document.addEventListener('DOMContentLoaded', loadBookmarks)

// 스토리지 변경 감지
chrome.storage.onChanged.addListener((changes) => {
  if (changes.bookmarks) {
    loadBookmarks()
  }
})
