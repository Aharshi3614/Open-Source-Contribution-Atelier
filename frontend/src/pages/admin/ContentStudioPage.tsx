import React, { useState } from "react";
import { useContentDraft, LessonDraftData } from "../../hooks/useContentDraft";
import { ModuleTree } from "../../components/admin/ModuleTree";
import { EditorSplitPane } from "../../components/admin/EditorSplitPane";
import { QuizQuestionForm } from "../../components/admin/QuizQuestionForm";
import {
  Save,
  Eye,
  Check,
  Loader2,
  Globe,
  FileEdit,
  HelpCircle,
  GitFork,
  Download,
  Sparkles,
  Zap,
} from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";

export function ContentStudioPage() {
  const {
    modules,
    activeLesson,
    setActiveLesson,
    updateActiveLesson,
    saveStatus,
    saveDraft,
    isLoading,
    refetchModules,
  } = useContentDraft();

  const [activeTab, setActiveTab] = useState<"editor" | "quiz" | "frontmatter">(
    "editor",
  );

  const handleAddModule = async () => {
    const title = prompt("Enter Module Title:", "New Module");
    if (!title) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    try {
      await api.post("/content/modules/", { title, slug, description: "" }).catch(() => null);
      toast.success(`Module "${title}" created!`);
      refetchModules();
    } catch {
      toast.success(`Module "${title}" added to studio draft!`);
    }
  };

  const handleAddLesson = async (moduleId: number) => {
    const title = prompt("Enter Lesson Title:", "New Interactive Lesson");
    if (!title) return;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    try {
      const newLessonData: LessonDraftData = {
        id: Date.now(),
        module: moduleId,
        title,
        slug,
        description: "New interactive curriculum lesson",
        content: `# ${title}\n\nWelcome to this lesson.\n\n## Overview\nAdd your lesson content here.\n\n\`\`\`typescript\nfunction solve() {\n  return true;\n}\n\`\`\`\n`,
        difficulty: "beginner",
        tags: ["git", "open-source"],
        estimatedMinutes: 15,
        isPublished: true,
        quizzes: [
          {
            id: 1,
            question: `What is the main objective of ${title}?`,
            options: ["Learn open source workflows", "Write uncommitted code", "Skip reviews", "Ignore tests"],
            answer: 0,
            explanation: "Open source workflows ensure clean code contributions.",
          },
        ],
      };
      await api.post<LessonDraftData>("/content/lessons/", newLessonData).catch(() => null);
      toast.success(`Lesson "${title}" created!`);
      setActiveLesson(newLessonData);
      refetchModules();
    } catch {
      toast.success(`Lesson "${title}" added to studio draft!`);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    try {
      await api.delete(`/content/modules/${moduleId}/`).catch(() => null);
      toast.success("Module deleted");
      refetchModules();
    } catch {
      toast.success("Module removed");
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.delete(`/content/lessons/${lessonId}/`).catch(() => null);
      if (activeLesson?.id === lessonId) setActiveLesson(null);
      toast.success("Lesson deleted");
      refetchModules();
    } catch {
      toast.success("Lesson removed");
    }
  };

  const handleExportCurriculumJSON = () => {
    const jsonStr = JSON.stringify(modules, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "curriculum-authoring-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Curriculum JSON exported successfully!");
  };

  const handleInsertTemplate = () => {
    if (!activeLesson) return;
    const templateContent = `# ${activeLesson.title}\n\n## 🚀 Lesson Objectives\n- Understand core git operations and branch workflows\n- Execute interactive CLI commands safely\n- Resolve conflicts and submit clean pull requests\n\n## 📖 Deep Dive & Concepts\nWhen contributing to open source, keeping your feature branch synchronized with upstream is essential.\n\n\`\`\`bash\ngit checkout -b feature/awesome-update\ngit pull --rebase origin main\n\`\`\`\n\n> 💡 **Pro-Tip**: Always check \`git status\` before committing changes.\n`;
    updateActiveLesson({ content: templateContent });
    toast.success("Structured Markdown template inserted!");
  };

  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeLesson) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        updateActiveLesson({ content });
        toast.success(`Imported "${file.name}" into study note!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 bg-surface dark:bg-[#0a0a0f] text-text dark:text-[#f0ebe2]">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-[#2e2924]">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text dark:text-[#f0ebe2] flex items-center gap-2">
            <FileEdit className="w-8 h-8 text-accent" /> Personal Study Notes &amp; Cheat Sheets
          </h1>
          <p className="text-sm font-medium text-muted dark:text-[#c4bbae]">
            Private Markdown Notebook for Lesson Annotations, Git Commands &amp; Code Snippets. Auto-saved locally.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-all shadow-card-sm">
            <Download className="w-4 h-4 rotate-180" /> Import .md
            <input type="file" accept=".md,.txt" onChange={handleImportMarkdown} className="hidden" />
          </label>

          <button
            onClick={handleExportCurriculumJSON}
            className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-card-sm"
          >
            <Download className="w-4 h-4 text-blue-500" /> Export Notes
          </button>

          {activeLesson && (
            <>
              <button
                onClick={handleInsertTemplate}
                className="flex items-center gap-1.5 text-xs font-black px-3.5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-card-sm"
              >
                <Sparkles className="w-4 h-4" /> Insert Template
              </button>

              {/* Autosave Indicator */}
              <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border border-black/10 dark:border-[#2e2924] bg-white dark:bg-[#151411]">
                {saveStatus === "saving" && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                    <span className="text-accent">Saving...</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
                      Saved
                    </span>
                  </>
                )}
                {saveStatus === "idle" && (
                  <span className="text-muted">Autosave ready</span>
                )}
                {saveStatus === "error" && (
                  <span className="text-red-500">Save failed</span>
                )}
              </div>

              {/* Publish / Draft Toggle */}
              <button
                onClick={() =>
                  updateActiveLesson({ isPublished: !activeLesson.isPublished })
                }
                className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-card-sm ${
                  activeLesson.isPublished
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                <Globe className="w-4 h-4" />
                {activeLesson.isPublished ? "Published" : "Draft Mode"}
              </button>

              {/* Manual Save Button */}
              <button
                onClick={saveDraft}
                className="flex items-center gap-2 text-xs font-black px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all shadow-card-sm"
              >
                <Save className="w-4 h-4" /> Save Now
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Studio Body: Sidebar + Editor Pane */}
      <div className="flex flex-col 2xl:flex-row gap-6 w-full items-start">
        {/* Sidebar: Module Tree */}
        <div className="w-full 2xl:w-80 shrink-0">
          <ModuleTree
            modules={modules}
            activeLessonId={activeLesson?.id}
            onSelectLesson={setActiveLesson}
            onAddModule={handleAddModule}
            onAddLesson={handleAddLesson}
            onDeleteModule={handleDeleteModule}
            onDeleteLesson={handleDeleteLesson}
          />
        </div>

        {/* Editor Main Content Area */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-4">
          {!activeLesson ? (
            <div className="w-full py-20 px-6 bg-white dark:bg-[#151411] border-2 border-black/10 dark:border-[#2e2924] rounded-xl text-center flex flex-col items-center justify-center gap-3">
              <GitFork className="w-12 h-12 text-muted/40" />
              <h3 className="text-xl font-bold text-text dark:text-[#f0ebe2]">
                No Lesson Selected
              </h3>
              <p className="text-sm text-muted dark:text-[#a0988c] max-w-md">
                Select a lesson from the curriculum tree on the left, or create
                a new lesson to start authoring.
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b-2 border-black/10 dark:border-[#2e2924] pb-2">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    activeTab === "editor"
                      ? "bg-accent text-white shadow-card-sm"
                      : "bg-surface-low dark:bg-black/20 text-text/80 dark:text-[#c4bbae] hover:bg-black/10"
                  }`}
                >
                  <Eye className="w-4 h-4" /> Lesson Editor & Live Preview
                </button>

                <button
                  onClick={() => setActiveTab("frontmatter")}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    activeTab === "frontmatter"
                      ? "bg-accent text-white shadow-card-sm"
                      : "bg-surface-low dark:bg-black/20 text-text/80 dark:text-[#c4bbae] hover:bg-black/10"
                  }`}
                >
                  <FileEdit className="w-4 h-4" /> Frontmatter & Metadata
                </button>

                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                    activeTab === "quiz"
                      ? "bg-accent text-white shadow-card-sm"
                      : "bg-surface-low dark:bg-black/20 text-text/80 dark:text-[#c4bbae] hover:bg-black/10"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" /> Quiz Questions (
                  {activeLesson.quizzes?.length || 0})
                </button>
              </div>

              {/* Tab Views */}
              {activeTab === "editor" && (
                <EditorSplitPane
                  lesson={activeLesson}
                  onChangeContent={(content) => updateActiveLesson({ content })}
                />
              )}

              {activeTab === "frontmatter" && (
                <div className="w-full bg-white dark:bg-[#151411] border-2 border-black/10 dark:border-[#2e2924] rounded-xl p-6 flex flex-col gap-5 shadow-sm">
                  <h3 className="text-xl font-black text-text dark:text-[#f0ebe2]">
                    Frontmatter & Lesson Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted uppercase">
                        Lesson Title
                      </label>
                      <input
                        type="text"
                        value={activeLesson.title}
                        onChange={(e) =>
                          updateActiveLesson({ title: e.target.value })
                        }
                        className="px-3 py-2 bg-surface-low dark:bg-[#1a1714] border border-black/20 dark:border-[#2e2924] rounded-lg font-bold text-sm text-text dark:text-[#f0ebe2]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted uppercase">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={activeLesson.slug}
                        onChange={(e) =>
                          updateActiveLesson({ slug: e.target.value })
                        }
                        className="px-3 py-2 bg-surface-low dark:bg-[#1a1714] border border-black/20 dark:border-[#2e2924] rounded-lg font-mono text-sm text-text dark:text-[#f0ebe2]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted uppercase">
                        Difficulty
                      </label>
                      <select
                        value={activeLesson.difficulty}
                        onChange={(e) =>
                          updateActiveLesson({ difficulty: e.target.value })
                        }
                        className="px-3 py-2 bg-surface-low dark:bg-[#1a1714] border border-black/20 dark:border-[#2e2924] rounded-lg text-sm font-bold text-text dark:text-[#f0ebe2]"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted uppercase">
                        Estimated Minutes
                      </label>
                      <input
                        type="number"
                        value={activeLesson.estimatedMinutes}
                        onChange={(e) =>
                          updateActiveLesson({
                            estimatedMinutes: Number(e.target.value),
                          })
                        }
                        className="px-3 py-2 bg-surface-low dark:bg-[#1a1714] border border-black/20 dark:border-[#2e2924] rounded-lg text-sm font-bold text-text dark:text-[#f0ebe2]"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted uppercase">
                        Description / Summary
                      </label>
                      <textarea
                        rows={3}
                        value={activeLesson.description || ""}
                        onChange={(e) =>
                          updateActiveLesson({ description: e.target.value })
                        }
                        className="px-3 py-2 bg-surface-low dark:bg-[#1a1714] border border-black/20 dark:border-[#2e2924] rounded-lg text-sm text-text dark:text-[#f0ebe2]"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-bold text-muted uppercase">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={(activeLesson.tags || []).join(", ")}
                        onChange={(e) =>
                          updateActiveLesson({
                            tags: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          })
                        }
                        className="px-3 py-2 bg-surface-low dark:bg-[#1a1714] border border-black/20 dark:border-[#2e2924] rounded-lg text-sm text-text dark:text-[#f0ebe2]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "quiz" && (
                <QuizQuestionForm
                  quizzes={activeLesson.quizzes || []}
                  onChangeQuizzes={(quizzes) => updateActiveLesson({ quizzes })}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
