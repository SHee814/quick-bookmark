// 북마크 목록 로드 및 표시
async function loadBookmarks() {
  const bookmarks = await chrome.storage.sync.get('bookmarks')
  const bookmarkList = bookmarks.bookmarks || []
  const container = document.getElementById('bookmarkList')

  container.innerHTML = ''
  bookmarkList.forEach((bookmark, index) => {
    const bookmarkElement = document.createElement('div')
    bookmarkElement.className = 'bookmark-item'
    bookmarkElement.dataset.index = index
    bookmarkElement.innerHTML = `
      <div class="drag-handle">
        <svg width="8" height="16" viewBox="0 0 8 16" fill="currentColor">
          <circle cx="2" cy="2" r="2"/>
          <circle cx="6" cy="2" r="2"/>
          <circle cx="2" cy="8" r="2"/>
          <circle cx="6" cy="8" r="2"/>
          <circle cx="2" cy="14" r="2"/>
          <circle cx="6" cy="14" r="2"/>
        </svg>
      </div>
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

    const handle = bookmarkElement.querySelector('.drag-handle')
    handle.addEventListener('mousedown', () => {
      bookmarkElement.draggable = true
    })
    bookmarkElement.addEventListener('mouseup', () => {
      bookmarkElement.draggable = false
    })
    bookmarkElement.addEventListener('dragstart', handleDragStart)
    bookmarkElement.addEventListener('dragover', handleDragOver)
    bookmarkElement.addEventListener('drop', handleDrop)
    bookmarkElement.addEventListener('dragend', () => {
      bookmarkElement.draggable = false
    })
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

function handleDragStart(e) {
  e.target.classList.add('dragging')
  e.dataTransfer.setData('text/plain', e.target.dataset.index)
}

function handleDragOver(e) {
  e.preventDefault()
  const draggingItem = document.querySelector('.dragging')
  const items = [...document.querySelectorAll('.bookmark-item:not(.dragging)')]
  const nextItem = items.find((item) => {
    const rect = item.getBoundingClientRect()
    return e.clientY <= rect.top + rect.height / 2
  })

  if (nextItem) {
    nextItem.parentNode.insertBefore(draggingItem, nextItem)
  } else {
    document.getElementById('bookmarkList').appendChild(draggingItem)
  }
}

async function handleDrop(e) {
  e.preventDefault()
  const items = [...document.querySelectorAll('.bookmark-item')]
  const bookmarks = await chrome.storage.sync.get('bookmarks')
  const newBookmarks = items.map((item) => bookmarks.bookmarks[parseInt(item.dataset.index)])

  await chrome.storage.sync.set({ bookmarks: newBookmarks })
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
