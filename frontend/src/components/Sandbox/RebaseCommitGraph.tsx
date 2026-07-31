import React, { useState } from "react";
import { GitCommit, ArrowUp, ArrowDown, Edit3, Trash2, Check, Sparkles } from "lucide-react";

export interface RebaseCommit {
  hash: string;
  message: string;
  author: string;
  files_changed?: string[];
  action?: "pick" | "reword" | "edit" | "squash" | "fixup" | "drop";
  new_message?: string;
}

interface RebaseCommitGraphProps {
  commits: RebaseCommit[];
  onCommitActionChange: (index: number, action: RebaseCommit["action"], newMessage?: string) => void;
  onMoveCommit: (fromIndex: number, toIndex: number) => void;
  readOnly?: boolean;
}

export const RebaseCommitGraph: React.FC<RebaseCommitGraphProps> = ({
  commits,
  onCommitActionChange,
  onMoveCommit,
  readOnly = false,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempMessage, setTempMessage] = useState<string>("");

  const handleStartReword = (index: number, currentMsg: string) => {
    setEditingIndex(index);
    setTempMessage(currentMsg);
  };

  const handleSaveReword = (index: number) => {
    onCommitActionChange(index, "reword", tempMessage);
    setEditingIndex(null);
  };

  const getActionBadge = (action: RebaseCommit["action"] = "pick") => {
    switch (action) {
      case "pick":
        return { label: "pick", bg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30" };
      case "reword":
        return { label: "reword", bg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/30" };
      case "edit":
        return { label: "edit", bg: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30" };
      case "squash":
        return { label: "squash", bg: "bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/30" };
      case "fixup":
        return { label: "fixup", bg: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/30" };
      case "drop":
        return { label: "drop", bg: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30 line-through opacity-70" };
      default:
        return { label: "pick", bg: "bg-surface-low text-muted border-black/10 dark:border-[#2e2924]" };
    }
  };

  return (
    <div className="w-full space-y-4">
      {commits.map((commit, idx) => {
        const currentAction = commit.action || "pick";
        const badge = getActionBadge(currentAction);
        const isEditing = editingIndex === idx;

        return (
          <div key={commit.hash || idx} className="relative flex items-start gap-3 sm:gap-4 group">
            {/* Connecting Vertical Line */}
            {idx < commits.length - 1 && (
              <div className="absolute left-4 sm:left-5 top-10 bottom-0 w-0.5 bg-black/10 dark:bg-[#2e2924] z-0" />
            )}

            {/* Commit Node Icon */}
            <div
              className={`relative z-10 p-2 sm:p-2.5 rounded-xl border-2 transition-all shrink-0 ${
                currentAction === "drop"
                  ? "bg-slate-200 dark:bg-black/50 text-slate-400 border-slate-300 dark:border-slate-800"
                  : currentAction === "squash"
                  ? "bg-purple-500/10 text-purple-500 border-purple-500/30"
                  : "bg-white dark:bg-[#151411] text-indigo-500 dark:text-indigo-400 border-black/10 dark:border-[#2e2924] shadow-card-sm"
              }`}
            >
              <GitCommit className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            {/* Commit Card Container */}
            <div
              className={`flex-1 p-3.5 sm:p-4 bg-white dark:bg-[#151411] border-2 rounded-2xl transition-all shadow-card-sm ${
                currentAction === "drop"
                  ? "border-rose-500/20 bg-rose-500/5 opacity-60"
                  : currentAction === "squash"
                  ? "border-purple-500/30 bg-purple-500/5"
                  : "border-black/10 dark:border-[#2e2924] hover:border-indigo-500/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {commit.hash.substring(0, 7)}
                    </span>

                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>

                    <span className="text-xs text-slate-400 font-medium">
                      by {commit.author}
                    </span>

                    {idx === 0 && (
                      <span className="text-[10px] font-mono font-black text-amber-500 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                        HEAD
                      </span>
                    )}
                  </div>

                  {/* Commit Message / Reword Editor */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={tempMessage}
                        onChange={(e) => setTempMessage(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-surface-low dark:bg-[#0f0e0c] border border-indigo-500/50 rounded-xl font-mono text-xs outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveReword(idx)}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`text-xs sm:text-sm font-bold ${
                        currentAction === "drop" ? "line-through text-slate-400" : "text-text dark:text-[#f0ebe2]"
                      }`}
                    >
                      {commit.new_message || commit.message}
                    </p>
                  )}

                  {commit.files_changed && commit.files_changed.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span>Files:</span>
                      {commit.files_changed.map((f) => (
                        <span key={f} className="underline opacity-80">{f}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rebase Action Control Buttons */}
                {!readOnly && (
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-[#2e2924]">
                    {/* Action Selector Pills */}
                    {(["pick", "reword", "squash", "drop"] as const).map((act) => (
                      <button
                        key={act}
                        onClick={() => {
                          if (act === "reword") {
                            handleStartReword(idx, commit.new_message || commit.message);
                          } else {
                            onCommitActionChange(idx, act);
                          }
                        }}
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                          currentAction === act
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-surface-low dark:bg-[#0f0e0c] text-slate-500 hover:text-text dark:hover:text-white border border-black/5 dark:border-[#2e2924]"
                        }`}
                      >
                        {act}
                      </button>
                    ))}

                    {/* Move Up / Down Controls */}
                    <div className="flex items-center gap-0.5 ml-1 border-l border-black/10 dark:border-[#2e2924] pl-1.5">
                      <button
                        disabled={idx === 0}
                        onClick={() => onMoveCommit(idx, idx - 1)}
                        title="Move commit up"
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-text disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === commits.length - 1}
                        onClick={() => onMoveCommit(idx, idx + 1)}
                        title="Move commit down"
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-text disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
