// StorageManager 클래스
class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async get(key) {
    return new Promise((resolve) => {
      this.storage.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      this.storage.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  async getBookmarks() {
    const bookmarks = await this.get("bookmarks");
    return bookmarks || [];
  }

  async saveBookmarks(bookmarks) {
    await this.set("bookmarks", bookmarks);
  }

  async getCollections() {
    const collections = await this.get("collections");
    return (
      collections || [
        { id: "default", name: "기본 컬렉션", color: "#007AFF" },
        { id: "work", name: "업무", color: "#FF6B6B" },
        { id: "study", name: "학습", color: "#4ECDC4" },
        { id: "dev", name: "개발", color: "#45B7D1" },
        { id: "design", name: "디자인", color: "#96CEB4" },
        { id: "reference", name: "참고자료", color: "#FFEAA7" },
      ]
    );
  }

  async saveCollections(collections) {
    await this.set("collections", collections);
  }
}

// BookmarkManager 클래스
class BookmarkManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.bookmarks = [];
    this.collections = [];
    this.currentTab = null;
  }

  async initialize() {
    await this.loadBookmarks();
    await this.loadCollections();
  }

  async loadBookmarks() {
    this.bookmarks = await this.storageManager.getBookmarks();
  }

  async loadCollections() {
    this.collections = await this.storageManager.getCollections();
  }

  setCurrentTab(tab) {
    this.currentTab = tab;
  }

  async addBookmark(bookmarkData) {
    const newBookmark = {
      id: Date.now().toString(),
      title: bookmarkData.title,
      url: bookmarkData.url,
      favIconUrl: bookmarkData.favIconUrl,
      note: bookmarkData.note,
      collectionId: bookmarkData.collectionId,
      tags: bookmarkData.tags,
      highlight: bookmarkData.highlight,
      tabbed: bookmarkData.tabbed,
      favorite: bookmarkData.favorite,
      createdAt: new Date().toISOString(),
    };

    this.bookmarks.push(newBookmark);
    await this.storageManager.saveBookmarks(this.bookmarks);
    return newBookmark.id;
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// UI Manager 클래스
class UIManager {
  constructor(bookmarkManager, storageManager) {
    this.bookmarkManager = bookmarkManager;
    this.storageManager = storageManager;
    this.elements = {};
    this.currentTab = null;
  }

  initialize() {
    this.initializeElements();
    this.bindEvents();
    this.loadCurrentTabInfo();
  }

  initializeElements() {
    this.elements = {
      thumb: document.getElementById("bookmark-thumb"),
      title: document.getElementById("bookmark-title-view"),
      desc: document.getElementById("bookmark-desc"),
      note: document.getElementById("bookmark-note"),
      collection: document.getElementById("bookmark-collection"),
      url: document.getElementById("bookmark-url"),
      tags: document.getElementById("bookmark-tags"),
      saveBtn: document.getElementById("save-btn"),
      modal: document.querySelector(".bookmark-add-modal"),
      successMessage: document.getElementById("success-message"),
      highlightBtn: document.getElementById("highlight-btn"),
      tabBtn: document.getElementById("tab-btn"),
      favoriteBtn: document.getElementById("favorite-btn"),
    };
  }

  async loadCurrentTabInfo() {
    try {
      console.log("현재 탭 정보 로드 시작...");
      const queryOptions = { active: true, currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);

      console.log("탭 정보:", tab);

      if (tab && tab.url && tab.url.startsWith("http")) {
        this.currentTab = tab;
        this.updatePageInfo(tab);

        // 페이지 설명 가져오기 (비동기로 처리)
        this.getPageDescription(tab.id)
          .then((description) => {
            if (
              description &&
              description !== "페이지 설명을 가져올 수 없습니다."
            ) {
              this.elements.desc.textContent = description;
              console.log("페이지 설명 업데이트됨:", description);
            }
          })
          .catch((error) => {
            console.error("페이지 설명 가져오기 실패:", error);
            // 에러가 발생해도 기본 설명은 유지
          });

        await this.loadCollections();
      } else {
        console.log("유효하지 않은 탭:", tab);
        this.elements.desc.textContent =
          "현재 페이지 정보를 가져올 수 없습니다.";
      }
    } catch (error) {
      console.error("현재 탭 정보 로드 실패:", error);
      this.updatePageInfo({
        title: "알 수 없는 페이지",
        url: "https://example.com",
        favIconUrl: null,
      });
    }
  }

  async getPageDescription(tabId) {
    try {
      console.log("페이지 설명 가져오기 시작, 탭 ID:", tabId);

      // 먼저 탭이 완전히 로드되었는지 확인
      const tab = await chrome.tabs.get(tabId);
      console.log("탭 상태:", tab.status);

      if (tab.status !== "complete") {
        console.log("탭이 아직 로드 중입니다.");
        return "페이지가 아직 로드 중입니다...";
      }

      // 페이지의 메타 태그와 콘텐츠를 읽어오는 스크립트 실행
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          console.log("페이지 스크립트 실행됨");

          // 메타 설명 태그 확인
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc && metaDesc.content) {
            console.log("메타 설명 찾음:", metaDesc.content);
            return metaDesc.content;
          }

          // Open Graph 설명 확인
          const ogDesc = document.querySelector(
            'meta[property="og:description"]'
          );
          if (ogDesc && ogDesc.content) {
            console.log("OG 설명 찾음:", ogDesc.content);
            return ogDesc.content;
          }

          // Twitter 카드 설명 확인
          const twitterDesc = document.querySelector(
            'meta[name="twitter:description"]'
          );
          if (twitterDesc && twitterDesc.content) {
            console.log("Twitter 설명 찾음:", twitterDesc.content);
            return twitterDesc.content;
          }

          // 첫 번째 의미있는 텍스트 찾기
          const paragraphs = document.querySelectorAll("p");
          for (let p of paragraphs) {
            const text = p.textContent.trim();
            if (text.length > 20 && text.length < 200) {
              console.log("문단 텍스트 찾음:", text);
              return text;
            }
          }

          // 제목 태그들 확인
          const headings = document.querySelectorAll("h1, h2, h3");
          for (let heading of headings) {
            const text = heading.textContent.trim();
            if (text.length > 10 && text.length < 100) {
              console.log("제목 텍스트 찾음:", text);
              return text;
            }
          }

          console.log("설명을 찾을 수 없음");
          return "페이지 설명이 없습니다.";
        },
      });

      console.log("스크립트 실행 결과:", results);

      if (results && results[0] && results[0].result) {
        const description = results[0].result;
        const finalDesc =
          description.length > 150
            ? description.substring(0, 150) + "..."
            : description;
        console.log("최종 설명:", finalDesc);
        return finalDesc;
      }

      console.log("스크립트 결과가 없음");
      return "페이지 설명을 가져올 수 없습니다.";
    } catch (error) {
      console.error("페이지 설명 스크립트 실행 실패:", error);

      // 에러 타입에 따른 대체 방법
      if (error.message.includes("Cannot access contents")) {
        return "이 페이지에서는 콘텐츠에 접근할 수 없습니다.";
      } else if (error.message.includes("Extension context invalidated")) {
        return "확장 프로그램을 다시 로드해주세요.";
      } else {
        return "페이지 설명을 가져올 수 없습니다.";
      }
    }
  }

  updatePageInfo(tab) {
    console.log("페이지 정보 업데이트:", tab);

    this.elements.title.textContent = tab.title || "새 페이지";
    this.elements.url.value = tab.url || "";

    if (tab.favIconUrl) {
      this.elements.thumb.innerHTML = `<img src="${tab.favIconUrl}" alt="favicon" style="width: 32px; height: 32px; border-radius: 6px;">`;
    } else {
      this.elements.thumb.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }

    // 탭 제목에서 간단한 설명 생성
    if (tab.title && tab.title.length > 10) {
      const simpleDesc =
        tab.title.length > 50 ? tab.title.substring(0, 50) + "..." : tab.title;
      this.elements.desc.textContent = simpleDesc;
    } else {
      this.elements.desc.textContent = "페이지 정보를 가져오는 중...";
    }
  }

  async loadCollections() {
    const collections = await this.storageManager.getCollections();
    this.elements.collection.innerHTML = "";

    collections.forEach((collection) => {
      const option = document.createElement("option");
      option.value = collection.id;
      option.textContent = collection.name;
      this.elements.collection.appendChild(option);
    });
  }

  bindEvents() {
    this.elements.saveBtn.addEventListener("click", () => this.saveBookmark());

    // 엔터키로 저장
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.saveBookmark();
      }
    });

    // 옵션 버튼들
    this.elements.highlightBtn.addEventListener("click", () => {
      this.elements.highlightBtn.classList.toggle("active");
    });

    this.elements.tabBtn.addEventListener("click", () => {
      this.elements.tabBtn.classList.toggle("active");
    });

    this.elements.favoriteBtn.addEventListener("click", () => {
      this.elements.favoriteBtn.classList.toggle("active");
    });
  }

  async saveBookmark() {
    if (!this.currentTab) {
      alert("현재 페이지 정보를 가져올 수 없습니다.");
      return;
    }

    const bookmarkData = {
      title: this.elements.title.textContent,
      url: this.elements.url.value,
      favIconUrl: this.currentTab.favIconUrl,
      note: this.elements.note.value,
      collectionId: this.elements.collection.value,
      tags: this.elements.tags.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      highlight: this.elements.highlightBtn.classList.contains("active"),
      tabbed: this.elements.tabBtn.classList.contains("active"),
      favorite: this.elements.favoriteBtn.classList.contains("active"),
    };

    try {
      this.elements.modal.classList.add("loading");
      await this.bookmarkManager.addBookmark(bookmarkData);
      this.showSuccessMessage();
      this.resetForm();
      console.log("북마크 저장됨:", bookmarkData);
    } catch (error) {
      console.error("북마크 저장 실패:", error);
      alert("북마크 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      this.elements.modal.classList.remove("loading");
    }
  }

  showSuccessMessage() {
    this.elements.successMessage.classList.add("show");
    setTimeout(() => {
      this.elements.successMessage.classList.remove("show");
    }, 3000);
  }

  resetForm() {
    this.elements.note.value = "";
    this.elements.tags.value = "";
    this.elements.collection.selectedIndex = 0;
    this.elements.highlightBtn.classList.remove("active");
    this.elements.tabBtn.classList.remove("active");
    this.elements.favoriteBtn.classList.remove("active");
  }
}

// 앱 초기화
document.addEventListener("DOMContentLoaded", async () => {
  console.log("BookmarkHub Extension 로드됨");

  const storageManager = new StorageManager();
  const bookmarkManager = new BookmarkManager(storageManager);
  const uiManager = new UIManager(bookmarkManager, storageManager);

  await bookmarkManager.initialize();
  uiManager.initialize();

  // 개발자 도구에서 사용할 수 있는 헬퍼 함수들
  window.showBookmarks = async () => {
    const bookmarks = await storageManager.getBookmarks();
    console.table(bookmarks);
  };

  window.clearBookmarks = async () => {
    await storageManager.saveBookmarks([]);
    console.log("모든 북마크가 삭제되었습니다.");
  };
});
