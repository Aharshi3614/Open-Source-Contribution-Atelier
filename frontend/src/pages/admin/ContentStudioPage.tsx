import React, { useState, useEffect } from "react";
import {
  FileText,
  Folder,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  Eye,
  Edit3,
  Sparkles,
  Check,
  Globe,
  Tag,
  Clock,
  ChevronRight,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Code2,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { MarkdownRenderer } from "../../components/ui/MarkdownRenderer";

export interface QuizItem {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface NoteItem {
  id: string;
  folderId: string;
  title: string;
  content: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  updatedAt: string;
  quizzes: QuizItem[];
}

export interface FolderItem {
  id: string;
  title: string;
}

const DEFAULT_FOLDERS: FolderItem[] = [
  { id: "folder-git", title: "Git & Version Control" },
  { id: "folder-[#open-source]", title: "Open Source Guidelines" },
  { id: "folder-devops", title: "DevOps & CI/CD" },
];

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: "note-1",
    folderId: "folder-git",
    title: "Git Rebase & Branching Quick Reference",
    content: `# Git Rebase & Branching Cheat Sheet

## 🚀 Key Commands

\`\`\`bash
# Create and switch to feature branch
git checkout -b feature/awesome-update

# Keep feature branch up-to-date with main
git fetch origin
git rebase origin/main

# Abort rebase if conflicts get complex
git rebase --abort
\`\`\`

> 💡 **Pro-Tip**: Always run \`git status\` before executing \`git rebase --continue\`.
`,
    tags: ["git", "rebase", "cli"],
    difficulty: "beginner",
    estimatedMinutes: 5,
    updatedAt: new Date().toISOString(),
    quizzes: [
      {
        id: 1,
        question: "What command safely aborts an in-progress git rebase?",
        options: ["git rebase --abort", "git reset --hard HEAD~1", "git checkout main", "git push --force"],
        answer: 0,
        explanation: "git rebase --abort returns your working branch to its pre-rebase state.",
      },
    ],
  },
  {
    id: "note-2",
    folderId: "folder-[#open-source]",
    title: "Maintainer Code Review & PR Tone Guide",
    content: `# Code Review & Communication Guidelines

## 📖 Best Practices for Pull Request Reviews

1. **Be Constructive & Specific**: Explain *why* a change is requested.
2. **Acknowledge Good Work**: Highlight well-written tests and clean architecture.
3. **Distinguish Nitpicks**: Mark non-blocking feedback as \`[nit]\`.

\`\`\`typescript
// Example: Constructive Feedback
// [nit]: Consider using optional chaining here to prevent null pointer exceptions
const userEmail = response?.data?.user?.email ?? "N/A";
\`\`\`
`,
    tags: ["code-review", "open-source"],
    difficulty: "intermediate",
    estimatedMinutes: 8,
    updatedAt: new Date().toISOString(),
    quizzes: [],
  },
];

export function ContentStudioPage() {
  const [folders, setFolders] = useState<FolderItem[]>(() => {
    try {
      const saved = localStorage.getItem("atelier_notes_folders_v2");
      return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
    } catch {
      return DEFAULT_FOLDERS;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem("atelier_notes_items_v2");
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "quizzes" | "meta">("editor");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Auto-persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("atelier_notes_folders_v2", JSON.stringify(folders));
    } catch (e) {
      console.warn("Failed saving folders:", e);
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem("atelier_notes_items_v2", JSON.stringify(notes));
    } catch (e) {
      console.warn("Failed saving notes:", e);
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const updateActiveNote = (updates: Partial<NoteItem>) => {
    if (!activeNote) return;
    setSaveStatus("saving");
    const updatedNote = {
      ...activeNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? updatedNote : n)));

    setTimeout(() => {
      setSaveStatus("saved");
    }, 400);
  };

  const handleAddFolder = () => {
    const title = prompt("Folder Name:", "New Study Folder");
    if (!title) return;
    const newFolder: FolderItem = { id: `folder-${Date.now()}`, title };
    setFolders((prev) => [...prev, newFolder]);
    toast.success(`Folder "${title}" created!`);
  };

  const handleAddNote = (folderId: string) => {
    const title = prompt("Note Title:", "New Study Note");
    if (!title) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      folderId,
      title,
      content: `# ${title}\n\nStart typing your study notes or code snippets here...\n\n\`\`\`typescript\nfunction demo() {\n  return "Hello Atelier";\n}\n\`\`\`\n`,
      tags: ["notes"],
      difficulty: "beginner",
      estimatedMinutes: 5,
      updatedAt: new Date().toISOString(),
      quizzes: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    toast.success(`Note "${title}" created!`);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this study note?")) return;
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id && remaining.length > 0) {
      setActiveNoteId(remaining[0].id);
    }
    toast.success("Note removed");
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this folder and its notes?")) return;
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setNotes((prev) => prev.filter((n) => n.folderId !== id));
    toast.success("Folder removed");
  };

  const handleInsertFormatting = (prefix: string, suffix: string = "") => {
    if (!activeNote) return;
    const textarea = document.getElementById("note-content-editor") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = activeNote.content.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const newContent = activeNote.content.substring(0, start) + replacement + activeNote.content.substring(end);
    updateActiveNote({ content: newContent });
  };

  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeNote) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        updateActiveNote({ content });
        toast.success(`Imported "${file.name}" into note!`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportNotes = () => {
    const jsonStr = JSON.stringify({ folders, notes }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atelier-study-notes.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Study notes exported!");
  };

  return (
    <div className="w-full min-h-screen bg-surface dark:bg-[#0a0a0f] text-text dark:text-[#f0ebe2] space-y-6">
      {/* Top Banner Header */}
      <div className="w-full bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-black/50 border-2 border-black/10 dark:border-[#2e2924] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" /> Study Notes &amp; Cheat Sheets Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Private Markdown Notebook for Git Cheat Sheets, Code Snippets &amp; Annotations. Auto-Saved to Local Storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 dark:bg-black/40 border border-white/20 rounded-xl text-xs font-bold text-white">
            <Check className="w-3.5 h-3.5 text-green-400" />
            <span>{saveStatus === "saving" ? "Saving..." : "Auto-Saved"}</span>
          </div>

          <label className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" /> Import .md
            <input type="file" accept=".md,.txt" onChange={handleImportMarkdown} className="hidden" />
          </label>

          <button
            onClick={handleExportNotes}
            className="flex items-center gap-1.5 text-xs font-black px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Notes
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar: Folder & Notes Directory */}
        <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#151411] border-2 border-black/10 dark:border-[#2e2924] rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-[#2e2924]">
            <h2 className="font-black text-base text-text dark:text-[#f0ebe2] flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-500" /> Note Directory
            </h2>
            <button
              onClick={handleAddFolder}
              className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Folder
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {folders.map((folder) => {
              const folderNotes = notes.filter((n) => n.folderId === folder.id);
              const isCollapsed = collapsedFolders[folder.id];

              return (
                <div
                  key={folder.id}
                  className="border border-black/10 dark:border-[#2e2924] rounded-xl overflow-hidden bg-surface-low/30 dark:bg-black/20"
                >
                  <div className="flex items-center justify-between px-3 py-2 bg-surface-low dark:bg-[#1c1a16] border-b border-black/5 dark:border-[#2e2924]">
                    <button
                      onClick={() =>
                        setCollapsedFolders((prev) => ({
                          ...prev,
                          [folder.id]: !prev[folder.id],
                        }))
                      }
                      className="flex items-center gap-2 font-bold text-xs sm:text-sm text-text dark:text-[#f0ebe2] hover:text-indigo-400 transition-colors truncate flex-1 text-left"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{folder.title}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({folderNotes.length})
                      </span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleAddNote(folder.id)}
                        title="Add Note"
                        className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                        title="Delete Folder"
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-1.5 space-y-1">
                      {folderNotes.length === 0 ? (
                        <div className="text-xs text-slate-400 italic px-3 py-2">
                          No notes in this folder.
                        </div>
                      ) : (
                        folderNotes.map((note) => {
                          const isActive = note.id === activeNote?.id;
                          return (
                            <div
                              key={note.id}
                              onClick={() => setActiveNoteId(note.id)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                                isActive
                                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                                  : "hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{note.title}</span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNote(note.id, e)}
                                className={`p-1 rounded transition-colors ${
                                  isActive ? "hover:bg-indigo-700 text-white" : "text-slate-400 hover:text-red-500"
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Editor & Preview Panel */}
        <div className="flex-1 w-full min-w-0 bg-white dark:bg-[#151411] border-2 border-black/10 dark:border-[#2e2924] rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
          {activeNote ? (
            <>
              {/* Note Header & Tab Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-black/10 dark:border-[#2e2924]">
                <div className="flex flex-col gap-1 min-w-0 w-full sm:w-auto">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateActiveNote({ title: e.target.value })}
                    className="font-black text-xl sm:text-2xl bg-transparent text-text dark:text-[#f0ebe2] border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition-colors"
                  />
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(activeNote.updatedAt).toLocaleTimeString()}
                    </span>
                    <span>•</span>
                    <span>{activeNote.content.length} chars</span>
                  </div>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-1 bg-surface-low dark:bg-black/30 p-1 rounded-xl border border-black/10 dark:border-[#2e2924] shrink-0">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "editor"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editor
                  </button>

                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "preview"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Live Preview
                  </button>

                  <button
                    onClick={() => setActiveTab("meta")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "meta"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" /> Tags &amp; Meta
                  </button>

                  <button
                    onClick={() => setActiveTab("quizzes")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "quizzes"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Quiz ({activeNote.quizzes.length})
                  </button>
                </div>
              </div>

              {/* Tab 1: Code & Markdown Editor */}
              {activeTab === "editor" && (
                <div className="space-y-3">
                  {/* Quick Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 bg-surface-low dark:bg-[#1c1a16] p-1.5 rounded-xl border border-black/10 dark:border-[#2e2924]">
                    <button
                      onClick={() => handleInsertFormatting("# ")}
                      className="px-2.5 py-1 text-xs font-black rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => handleInsertFormatting("## ")}
                      className="px-2.5 py-1 text-xs font-black rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => handleInsertFormatting("**", "**")}
                      className="px-2.5 py-1 text-xs font-bold rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      Bold
                    </button>
                    <button
                      onClick={() => handleInsertFormatting("*", "*")}
                      className="px-2.5 py-1 text-xs italic font-bold rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      Italic
                    </button>
                    <button
                      onClick={() => handleInsertFormatting("\n\`\`\`typescript\n", "\n\`\`\`\n")}
                      className="px-2.5 py-1 text-xs font-mono rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold"
                    >
                      Code Block
                    </button>
                    <button
                      onClick={() => handleInsertFormatting("- ")}
                      className="px-2.5 py-1 text-xs font-bold rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      List
                    </button>
                    <button
                      onClick={() => handleInsertFormatting("> ")}
                      className="px-2.5 py-1 text-xs font-bold rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      Quote
                    </button>
                  </div>

                  <textarea
                    id="note-content-editor"
                    rows={18}
                    value={activeNote.content}
                    onChange={(e) => updateActiveNote({ content: e.target.value })}
                    placeholder="Write markdown notes or code snippets..."
                    className="w-full p-4 bg-surface-low/50 dark:bg-[#12110e] border-2 border-black/10 dark:border-[#2e2924] rounded-xl font-mono text-sm text-text dark:text-[#f0ebe2] outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed"
                  />
                </div>
              )}

              {/* Tab 2: Live HTML Markdown Preview */}
              {activeTab === "preview" && (
                <div className="p-4 bg-surface-low/30 dark:bg-[#12110e] border-2 border-black/10 dark:border-[#2e2924] rounded-xl min-h-[450px] max-h-[600px] overflow-y-auto">
                  <MarkdownRenderer content={activeNote.content} />
                </div>
              )}

              {/* Tab 3: Tags & Metadata */}
              {activeTab === "meta" && (
                <div className="space-y-4 p-2">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={activeNote.tags.join(", ")}
                      onChange={(e) =>
                        updateActiveNote({
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      className="w-full p-3 bg-surface-low dark:bg-[#1c1a16] border border-black/10 dark:border-[#2e2924] rounded-xl font-mono text-sm outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-400">
                        Difficulty Rating
                      </label>
                      <select
                        value={activeNote.difficulty}
                        onChange={(e) =>
                          updateActiveNote({
                            difficulty: e.target.value as any,
                          })
                        }
                        className="w-full p-3 bg-surface-low dark:bg-[#1c1a16] border border-black/10 dark:border-[#2e2924] rounded-xl font-bold text-sm outline-none"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase text-slate-400">
                        Estimated Reading Minutes
                      </label>
                      <input
                        type="number"
                        value={activeNote.estimatedMinutes}
                        onChange={(e) =>
                          updateActiveNote({ estimatedMinutes: Number(e.target.value) })
                        }
                        className="w-full p-3 bg-surface-low dark:bg-[#1c1a16] border border-black/10 dark:border-[#2e2924] rounded-xl font-bold text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Interactive Quiz Builder */}
              {activeTab === "quizzes" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-text dark:text-[#f0ebe2]">
                      Quiz Questions ({activeNote.quizzes.length})
                    </h3>
                    <button
                      onClick={() => {
                        const newQ: QuizItem = {
                          id: Date.now(),
                          question: "New Quiz Question?",
                          options: ["Option A", "Option B", "Option C", "Option D"],
                          answer: 0,
                          explanation: "Explanation for the correct answer.",
                        };
                        updateActiveNote({ quizzes: [...activeNote.quizzes, newQ] });
                        toast.success("Question added!");
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      + Add Question
                    </button>
                  </div>

                  {activeNote.quizzes.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm italic">
                      No quiz questions added to this note yet. Click "+ Add Question" to create self-test quizzes.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeNote.quizzes.map((quiz, qIdx) => (
                        <div
                          key={quiz.id}
                          className="p-4 bg-surface-low/50 dark:bg-[#12110e] border border-black/10 dark:border-[#2e2924] rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xs text-indigo-400">
                              Question #{qIdx + 1}
                            </span>
                            <button
                              onClick={() => {
                                const remaining = activeNote.quizzes.filter((q) => q.id !== quiz.id);
                                updateActiveNote({ quizzes: remaining });
                              }}
                              className="text-xs text-red-500 hover:underline font-bold"
                            >
                              Delete Question
                            </button>
                          </div>

                          <input
                            type="text"
                            value={quiz.question}
                            onChange={(e) => {
                              const updated = activeNote.quizzes.map((q) =>
                                q.id === quiz.id ? { ...q, question: e.target.value } : q
                              );
                              updateActiveNote({ quizzes: updated });
                            }}
                            className="w-full p-2 bg-white dark:bg-[#1a1714] border border-black/10 dark:border-[#2e2924] rounded-lg font-bold text-sm outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 text-sm">
              No note selected. Select a note from the left directory or click "+ Note" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentStudioPage;
