// tests/engines/bookmark-engine.test.js
import test from "node:test";
import assert from "node:assert/strict";
import { groupByFolder } from "../../src/services/bookmark-service.js";

test("groupByFolder groups bookmarks, defaulting to Unsorted", async () => {
  const bookmarks = [
    { id: "1", folder: "Physics" },
    { id: "2", folder: "Physics" },
    { id: "3", folder: null },
  ];
  const groups = await groupByFolder(bookmarks);
  assert.equal(groups.Physics.length, 2);
  assert.equal(groups.Unsorted.length, 1);
});
