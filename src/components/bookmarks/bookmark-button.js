// src/components/bookmarks/bookmark-button.js
import { createEl, empty } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { addBookmark, removeBookmark, isBookmarked, getAllBookmarks } from "../../engines/bookmark-engine.js";
import { showToast } from "../common/toast.js";

function content(bookmarked) {
  return [icon(bookmarked ? "bookmark" : "bookmark", { class: bookmarked ? "ou-icon--active" : "" }), createEl("span", {}, [bookmarked ? "Bookmarked" : "Bookmark"])];
}

export function createBookmarkButton(subjectId, subSubjectId, lessonId) {
  let currentId = null;
  const button = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--secondary",
    on: {
      click: async () => {
        if (currentId) {
          await removeBookmark(currentId);
          currentId = null;
          empty(button);
          button.append(...content(false));
          showToast("Bookmark removed", "info");
        } else {
          const record = await addBookmark({ subjectId, subSubjectId, lessonId });
          currentId = record.id;
          empty(button);
          button.append(...content(true));
          showToast("Bookmarked", "success");
        }
      },
    },
  }, content(false));

  (async () => {
    const bookmarked = await isBookmarked(subjectId, subSubjectId, lessonId);
    if (bookmarked) {
      const all = await getAllBookmarks();
      const match = all.find((b) => b.subjectId === subjectId && b.subSubjectId === subSubjectId && b.lessonId === lessonId);
      currentId = match?.id || null;
      empty(button);
      button.append(...content(true));
    }
  })();

  return button;
}
