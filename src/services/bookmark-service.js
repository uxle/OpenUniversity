// src/services/bookmark-service.js — thin business layer over bookmark-storage.

import { getAllBookmarks, addBookmark, removeBookmark } from "../storage/bookmark-storage.js";
import { eventBus } from "../core/event-bus.js";
import { EVENTS } from "../app/constants.js";

export { getAllBookmarks };

export async function bookmarkLesson(subjectId, subSubjectId, lessonId, folder = null) {
  const record = await addBookmark({ subjectId, subSubjectId, lessonId, folder });
  eventBus.emit(EVENTS.BOOKMARK_ADDED, record);
  return record;
}

export async function unbookmark(id) {
  await removeBookmark(id);
  eventBus.emit(EVENTS.BOOKMARK_REMOVED, { id });
}

export async function isBookmarked(subjectId, subSubjectId, lessonId) {
  const all = await getAllBookmarks();
  return all.some((b) => b.subjectId === subjectId && b.subSubjectId === subSubjectId && b.lessonId === lessonId);
}

export async function groupByFolder(bookmarks = null) {
  const all = bookmarks || await getAllBookmarks();
  return all.reduce((groups, bookmark) => {
    const key = bookmark.folder || "Unsorted";
    (groups[key] ||= []).push(bookmark);
    return groups;
  }, {});
}
