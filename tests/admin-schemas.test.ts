import { describe, expect, it } from "vitest";

import { questionFormSchema } from "@/lib/admin-schemas";

describe("admin schemas", () => {
  it("rejects invalid slug", () => {
    const parsed = questionFormSchema.safeParse({
      title: "测试题",
      slug: "Invalid Slug",
      description: "这是一个用于测试 schema 的合法描述内容",
      starterCode: "function a() {}",
      testScript: "expect(1).toBe(1)",
      referenceSolution: "function a(){ return 1 }",
      level: "初级",
      category: "JavaScript",
      duration: "15 分钟",
      isPublished: false,
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts valid payload", () => {
    const parsed = questionFormSchema.safeParse({
      title: "实现防抖",
      slug: "implement-debounce",
      description: "实现一个 debounce(fn, wait) 函数，支持 this 和参数透传。",
      starterCode: "function debounce(fn, wait) { return fn }",
      testScript: "const a = 1; expect(a).toBe(1)",
      referenceSolution: "function debounce(fn, wait) { return (...args) => fn(...args); }",
      level: "中等",
      category: "JavaScript",
      duration: "20 分钟",
      isPublished: true,
    });

    expect(parsed.success).toBe(true);
  });
});
