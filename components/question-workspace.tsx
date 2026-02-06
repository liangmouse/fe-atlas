"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Clock3, Code2, Play, UserRound } from "lucide-react";
import type { Monaco } from "@monaco-editor/react";

import type { HandwriteChallenge } from "@/lib/content";
import { handwriteChallenges } from "@/lib/content";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type RunState = {
  passed: number;
  total: number;
  checks: boolean[];
  error?: string;
};

type LeftTab = "description" | "solution" | "submission";

async function runChallengeCode(code: string, testScript: string): Promise<RunState> {
  const executor = new Function(
    `"use strict"; return (async () => {\n${code}\n${testScript}\n})();`,
  ) as () => Promise<RunState>;
  return executor();
}

function setupMonaco(monaco: Monaco) {
  const compilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    typeRoots: ["node_modules/@types"],
  };

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
}

export function QuestionWorkspace({ challenge }: { challenge: HandwriteChallenge }) {
  const [leftTab, setLeftTab] = useState<LeftTab>("description");
  const [code, setCode] = useState(challenge.starterCode);
  const [runState, setRunState] = useState<RunState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const editorLanguage = useMemo(
    () => (challenge.category === "TypeScript" ? "typescript" : "javascript"),
    [challenge.category],
  );

  useEffect(() => {
    setCode(challenge.starterCode);
    setRunState(null);
  }, [challenge.slug, challenge.starterCode]);

  const execute = async () => {
    setIsRunning(true);
    try {
      const result = await runChallengeCode(code, challenge.testScript);
      setRunState(result);
    } catch (error) {
      setRunState({
        passed: 0,
        total: 0,
        checks: [],
        error: error instanceof Error ? error.message : "未知运行错误",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              atlasfrontend
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-slate-600 md:flex">
              <Link href="/">主页</Link>
              <Link href="/questions" className="font-medium text-slate-900">
                题库
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">练习模式</span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1800px] gap-3 p-3 lg:grid-cols-2">
        <article className="flex min-h-[calc(100vh-110px)] flex-col rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-1 border-b border-slate-200 px-3 py-2 text-sm">
            <button
              type="button"
              onClick={() => setLeftTab("description")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                leftTab === "description" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              描述
            </button>
            <button
              type="button"
              onClick={() => setLeftTab("solution")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                leftTab === "solution" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              解决方案
            </button>
            <button
              type="button"
              onClick={() => setLeftTab("submission")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                leftTab === "submission" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              提交
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-auto p-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{challenge.title}</h1>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">可练习</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <UserRound className="h-4 w-4" />
                  Yangshun 风格题目
                </div>
                <div className="flex items-center gap-1.5">
                  <Code2 className="h-4 w-4" />
                  {challenge.category}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {challenge.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {challenge.solvedCount}
                </div>
              </div>
            </div>

            {leftTab === "description" ? (
              <>
                {challenge.description.map((paragraph) => (
                  <p key={paragraph} className="text-[17px] leading-8 text-slate-700">
                    {paragraph}
                  </p>
                ))}

                <div>
                  <h2 className="mb-3 text-3xl font-bold">例子</h2>
                  <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm leading-7 text-slate-100">
                    <code>{challenge.example}</code>
                  </pre>
                </div>
              </>
            ) : null}

            {leftTab === "solution" ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                解题建议：先写最小可用版本，再覆盖 this/参数传递、边界时序与重复调用行为。
              </div>
            ) : null}

            {leftTab === "submission" ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                暂无历史提交。点击右下角“运行”先通过样例，再进行提交。
              </div>
            ) : null}
          </div>
        </article>

        <article className="flex min-h-[calc(100vh-110px)] flex-col rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="rounded bg-slate-900 px-3 py-1 text-white">代码</span>
              <span className="rounded px-3 py-1 text-slate-500">测试用例</span>
            </div>
            <button type="button" className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <ChevronDown className="h-4 w-4 rotate-90" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-b-xl bg-[#111827] text-slate-100">
            <MonacoEditor
              height="100%"
              language={editorLanguage}
              value={code}
              beforeMount={setupMonaco}
              onChange={(value) => setCode(value ?? "")}
              theme="vs-dark"
              loading={<div className="p-4 text-sm text-slate-300">编辑器加载中...</div>}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true,
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "smart",
                inlineSuggest: { enabled: true },
                scrollBeyondLastLine: false,
                padding: { top: 14, bottom: 14 },
                smoothScrolling: true,
              }}
            />
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-2">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Run tests / Console</span>
            </div>
            <div className="min-h-16 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {runState?.error ? `运行失败: ${runState.error}` : null}
              {!runState?.error && runState
                ? `通过 ${runState.passed}/${runState.total} 个测试`
                : "点击运行后展示测试结果"}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-1">{challenge.level}</span>
              <span>{challenge.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCode(challenge.starterCode)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                重置
              </button>
              <button
                type="button"
                onClick={execute}
                disabled={isRunning}
                className="inline-flex items-center gap-1 rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Play className="h-4 w-4" />
                {isRunning ? "运行中" : "运行"}
              </button>
            </div>
          </div>
        </article>
      </section>

      <aside className="mx-auto mb-4 flex max-w-[1800px] flex-wrap items-center gap-2 px-3">
        {handwriteChallenges.map((item) => (
          <Link
            key={item.slug}
            href={`/questions/${item.slug}`}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              item.slug === challenge.slug
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </aside>
    </main>
  );
}
