import { useState, useEffect } from "react";
import { X, FileText, Folder } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSkillDocument, type ManagedSkill, type SkillDocument } from "../lib/tauri";

interface Props {
  skill: ManagedSkill | null;
  onClose: () => void;
}

export function SkillDetailPanel({ skill, onClose }: Props) {
  const [doc, setDoc] = useState<SkillDocument | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!skill) {
      setDoc(null);
      return;
    }
    setLoading(true);
    getSkillDocument(skill.id)
      .then(setDoc)
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [skill]);

  if (!skill) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-[#0F0F14] border-l border-[#1C1C24] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#1C1C24]">
          <div className="min-w-0 mr-3">
            <h2 className="text-[14px] font-semibold text-zinc-100 truncate">{skill.name}</h2>
            {skill.description && (
              <p className="text-[12px] text-zinc-600 mt-0.5 line-clamp-2">{skill.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 p-1.5 rounded-[4px] hover:bg-[#1C1C24] transition-colors outline-none shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-5 py-2.5 border-b border-[#1C1C24] flex items-center gap-4 text-[11px] text-zinc-600">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3" />
            {doc?.filename || "—"}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Folder className="w-3 h-3 shrink-0" />
            <span className="font-mono truncate">{skill.central_path}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
          {loading ? (
            <div className="text-[12px] text-zinc-600 text-center mt-12">加载中...</div>
          ) : doc ? (
            <article className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-200 prose-p:text-zinc-500 prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-[#1C1C24] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#0C0C10] prose-pre:border prose-pre:border-[#1C1C24]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {doc.content}
              </ReactMarkdown>
            </article>
          ) : (
            <div className="text-[12px] text-zinc-600 text-center mt-12">没有找到文档文件</div>
          )}
        </div>
      </div>
    </div>
  );
}
