import { describe, expect, it } from "vitest";

import { normalizePracticeQuestion, type RawQuestion } from "@/lib/questions";

describe("questions", () => {
  it("normalizes question rows for frontend usage", () => {
    const raw: RawQuestion = {
      id: 1,
      slug: "implement-debounce",
      title: "实现防抖",
      level: "中等",
      category: "JavaScript",
      duration: "15 分钟",
      solved_count: null,
      description: "desc",
      starter_code: "function debounce(){}",
      test_script: "expect(1).toBe(1)",
      reference_solution: "",
    };

    const normalized = normalizePracticeQuestion(raw);
    expect(normalized.solvedCount).toBe("0 完成");
    expect(normalized.referenceSolution).toBe("暂未提供参考答案");
    expect(normalized.starterCode).toBe(raw.starter_code);
  });
});
