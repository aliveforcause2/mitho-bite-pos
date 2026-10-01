import React, { useState } from 'react';
import { FLUTTER_CODE_FILES, FlutterCodeFile } from '../data/flutterCodeSnippets';
import {
  FileCode,
  Copy,
  Check,
  Folder,
  ChevronRight,
  Code2,
  FileText,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('table_model');
  const [copied, setCopied] = useState<boolean>(false);

  const currentFile =
    FLUTTER_CODE_FILES.find((f) => f.id === selectedFileId) ||
    FLUTTER_CODE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([currentFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = currentFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Flutter Code Architecture
            </span>
            <span className="text-xs text-slate-400">Production-Ready Clean Dart Code</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Flutter Project Code & File Structure
          </h1>
          <p className="text-xs text-slate-400">
            Click any file below to inspect, review, or copy directly into your Flutter workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {currentFile.name}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split: Left File Explorer Tree, Right Code Preview */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar File Tree */}
        <div className="w-full md:w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-3 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40 border-b border-slate-800/80">
            Project Files (lib/)
          </div>

          <div className="p-2 space-y-1">
            {/* Group 1: Configuration */}
            <div className="px-2 pt-2 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Project Config & Entry
            </div>
            {FLUTTER_CODE_FILES.filter((f) => f.category === 'config').map((f) => (
              <FileTreeItem
                key={f.id}
                file={f}
                isSelected={selectedFileId === f.id}
                onSelect={() => setSelectedFileId(f.id)}
              />
            ))}

            {/* Group 2: Data Models */}
            <div className="px-2 pt-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              1. Data Models (lib/models)
            </div>
            {FLUTTER_CODE_FILES.filter((f) => f.category === 'models').map((f) => (
              <FileTreeItem
                key={f.id}
                file={f}
                isSelected={selectedFileId === f.id}
                onSelect={() => setSelectedFileId(f.id)}
              />
            ))}

            {/* Group 3: Service Layer */}
            <div className="px-2 pt-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              2. Backend Services (lib/services)
            </div>
            {FLUTTER_CODE_FILES.filter((f) => f.category === 'services').map((f) => (
              <FileTreeItem
                key={f.id}
                file={f}
                isSelected={selectedFileId === f.id}
                onSelect={() => setSelectedFileId(f.id)}
              />
            ))}

            {/* Group 4: State Management */}
            <div className="px-2 pt-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              3. State Provider (lib/providers)
            </div>
            {FLUTTER_CODE_FILES.filter((f) => f.category === 'providers').map((f) => (
              <FileTreeItem
                key={f.id}
                file={f}
                isSelected={selectedFileId === f.id}
                onSelect={() => setSelectedFileId(f.id)}
              />
            ))}

            {/* Group 5: Screens */}
            <div className="px-2 pt-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              4. Core Screens (lib/screens)
            </div>
            {FLUTTER_CODE_FILES.filter((f) => f.category === 'screens').map((f) => (
              <FileTreeItem
                key={f.id}
                file={f}
                isSelected={selectedFileId === f.id}
                onSelect={() => setSelectedFileId(f.id)}
              />
            ))}

            {/* Group 6: Thermal Slips & Widgets */}
            <div className="px-2 pt-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              5. Thermal & Slips (lib/widgets)
            </div>
            {FLUTTER_CODE_FILES.filter((f) => f.category === 'widgets').map((f) => (
              <FileTreeItem
                key={f.id}
                file={f}
                isSelected={selectedFileId === f.id}
                onSelect={() => setSelectedFileId(f.id)}
              />
            ))}

            {/* Group 7: Firestore & Seed */}
            <div className="px-2 pt-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
              6. Backend & Seed Rules
            </div>
            {FLUTTER_CODE_FILES.filter((f) => f.category === 'firestore').map((f) => (
              <FileTreeItem
                key={f.id}
                file={f}
                isSelected={selectedFileId === f.id}
                onSelect={() => setSelectedFileId(f.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Code Display Area */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* File Tab Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-white">
                {currentFile.path}
              </span>
            </div>
            <span className="text-xs text-slate-400 italic">
              {currentFile.description}
            </span>
          </div>

          {/* Code Viewer with Monospace & Line numbers */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs sm:text-sm text-slate-200">
            <pre className="leading-relaxed">
              <code>{currentFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileTreeItem: React.FC<{
  file: FlutterCodeFile;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ file, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
        isSelected
          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <FileCode
        className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}
      />
      <div className="flex-1 truncate">
        <div className="truncate">{file.name}</div>
        <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
      </div>
    </button>
  );
};
