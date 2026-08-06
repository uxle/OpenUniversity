// src/components/layout/breadcrumb.js — currently unused; the lesson
// reader page uses a single "← Back to X" link instead (see
// pages/lesson.js and .ou-back-link), matching the reference design.
// Left here, still functional, in case a full trail is wanted somewhere
// (e.g. deeper subject/sub-subject pages).
import { createEl } from "../../utils/dom.js";
import { buildBreadcrumb } from "../../engines/navigation-engine.js";

export async function createBreadcrumb(subjectId, subSubjectId, lessonId) {
  const trail = await buildBreadcrumb(subjectId, subSubjectId, lessonId);
  return createEl("nav", { "aria-label": "Breadcrumb" }, [
    createEl("ol", { role: "list", class: "ou-cluster" },
      trail.map((step, i) => createEl("li", {}, [
        i === trail.length - 1
          ? createEl("span", { "aria-current": "page" }, [step.label])
          : createEl("a", { href: `#${step.path}`, class: "ou-link" }, [step.label]),
        i < trail.length - 1 ? " / " : "",
      ]))
    ),
  ]);
}
