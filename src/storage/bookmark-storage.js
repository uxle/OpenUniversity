// src/storage/bookmark-storage.js — bookmarked lessons.
// Record shape: { id, lessonId, subjectId, subSubjectId, folder, createdAt }

import { getAll, put, remove } from "./indexed-db.js";
import { uid } from "../utils/ids.js";

export async function getAllBookmarks() {
  return getAll("bookmarks");
}

export async function addBookmark({ subjectId, subSubjectId, lessonId, folder = null }) {
  const record = {
    id: uid("bm"),
    subjectId, subSubjectId, lessonId, folder,
    createdAt: new Date().toISOString(),
  };
  await put("bookmarks", record);
  return record;
}

export async function removeBookmark(id) {
  return remove("bookmarks", id);
}
