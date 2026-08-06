// src/components/lesson/lesson-progress.js — mark-complete control.
import { createEl, empty } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { markLessonComplete } from "../../engines/progress-engine.js";
import { showToast } from "../common/toast.js";

function buttonContent(isComplete) {
  return [
    icon(isComplete ? "circle-check" : "circle"),
    createEl("span", {}, [isComplete ? "Completed" : "Mark as complete"]),
  ];
}

export function createLessonProgressControl(subjectId, subSubjectId, lessonId, { completed = false } = {}) {
  const status = createEl("span", { class: "ou-text-sm" }, [completed ? "Completed" : "Not completed"]);

  const button = createEl("button", {
    type: "button",
    class: ["ou-btn", completed ? "ou-btn--secondary" : "ou-btn--primary"],
    on: {
      click: async () => {
        await markLessonComplete(subjectId, subSubjectId, lessonId);
        status.textContent = "Completed";
        empty(button);
        button.append(...buttonContent(true));
        showToast("Progress saved", "success");
      },
    },
  }, buttonContent(completed));

  return createEl("div", { class: "ou-cluster" }, [button, status]);
}
