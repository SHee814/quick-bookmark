// 북마크 컨테이너 생성
const container = document.createElement('div')
container.className = 'qb-container hidden'
document.body.appendChild(container)

// 핸들 버튼 생성
const handle = document.createElement('div')
handle.className = 'qb-handle'
document.body.appendChild(handle)

// 북마크 컨테이너 토글 이벤트
handle.addEventListener('click', toggleContainer)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showToast') {
    showToast(request.type, request.message)
  }

  if (request.action === 'toggleContainer') {
    toggleContainer()
  }

  for (let i = 1; i <= 9; i++) {
    if (request.action === 'open-bookmark-' + i) {
      openBookmark(i - 1)
    }
  }
})

// 현재 선택된 북마크 인덱스
let selectedBookmarkIndex = -1

// 북마크 컨테이너 토글 함수
function toggleContainer() {
  container.classList.toggle('hidden')
  handle.classList.toggle('active')

  if (!container.classList.contains('hidden')) {
    // 컨테이너가 열릴 때 첫 번째 북마크 선택
    selectBookmark(0)
  } else {
    // 컨테이너가 닫힐 때 선택 해제
    selectBookmark(-1)
  }
}

// 북마크 선택 함수
function selectBookmark(index) {
  const bookmarks = container.querySelectorAll('.qb-bookmark')

  // 이전 선택 해제
  if (selectedBookmarkIndex !== -1 && bookmarks[selectedBookmarkIndex]) {
    bookmarks[selectedBookmarkIndex].classList.remove('selected')
  }

  // 새로운 선택
  selectedBookmarkIndex = index
  if (index !== -1 && bookmarks[index]) {
    bookmarks[index].classList.add('selected')
  }
}

// 키보드 이벤트 처리
document.addEventListener('keydown', (e) => {
  if (container.classList.contains('hidden')) return

  const bookmarks = container.querySelectorAll('.qb-bookmark')

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      if (selectedBookmarkIndex > 0) {
        selectBookmark(selectedBookmarkIndex - 1)
      }
      break
    case 'ArrowDown':
      e.preventDefault()
      if (selectedBookmarkIndex < bookmarks.length - 1) {
        selectBookmark(selectedBookmarkIndex + 1)
      }
      break
    case 'Enter':
      e.preventDefault()
      if (selectedBookmarkIndex !== -1) {
        openBookmark(selectedBookmarkIndex)
      }
      break
  }
})

// 북마크 열기 함수
async function openBookmark(index) {
  const bookmarks = await chrome.storage.sync.get('bookmarks')
  const bookmarkList = bookmarks.bookmarks || []
  if (bookmarkList[index]) {
    window.open(bookmarkList[index].url, '_blank')
  }
}

// 북마크 목록 업데이트
async function updateBookmarkList() {
  const bookmarks = await chrome.storage.sync.get('bookmarks')
  const bookmarkList = bookmarks.bookmarks || []

  container.innerHTML = ''
  bookmarkList.forEach((bookmark, index) => {
    const bookmarkElement = document.createElement('div')
    bookmarkElement.className = 'qb-bookmark'
    bookmarkElement.innerHTML = `
      <img src="${bookmark.favicon || 'default-favicon.png'}" alt="${bookmark.title}">
      <span class="qb-number">${index + 1}</span>
    `
    bookmarkElement.addEventListener('click', () => {
      selectBookmark(index)
      window.open(bookmark.url, '_blank')
    })
    container.appendChild(bookmarkElement)
  })

  // 컨테이너가 열려있는 상태면 첫 번째 항목 선택
  if (!container.classList.contains('hidden')) {
    selectBookmark(0)
  }
}

// 토스트 메시지 표시 함수
function showToast(type, message) {
  const toast = document.createElement('div')
  toast.className = `qb-toast ${type}`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.add('fade-out')
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// 초기 북마크 목록 로드
updateBookmarkList()

// 스토리지 변경 감지
chrome.storage.onChanged.addListener((changes) => {
  if (changes.bookmarks) {
    updateBookmarkList()
  }
})
