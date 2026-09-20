import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AndroidFileNode } from '../types';
import { 
  Folder, FolderOpen, FileCode, FileText, Save, RefreshCw, 
  Check, AlertCircle, Search, GitBranch, ArrowUpRight, Code2
} from 'lucide-react';

interface AndroidEditorProps {
  onBack?: () => void;
}

export const AndroidEditor: React.FC<AndroidEditorProps> = ({ onBack }) => {
  const [fileTree, setFileTree] = useState<AndroidFileNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('app/src/main/res/values/strings.xml');
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoadingTree, setIsLoadingTree] = useState<boolean>(true);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'app': true,
    'app/src': true,
    'app/src/main': true,
    'app/src/main/java': true,
    'app/src/main/java/com': true,
    'app/src/main/java/com/ext': true,
    'app/src/main/java/com/ext/techapp': true,
    'app/src/main/java/com/ext/techapp/thirukkural': true,
    'app/src/main/res': true,
    'app/src/main/res/values': true,
  });
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [gitStatus, setGitStatus] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Tree and Git Status
  const loadTree = async () => {
    setIsLoadingTree(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/android/tree');
      const data = await res.json();
      if (data.tree) {
        setFileTree(data.tree);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load Android file tree');
    } finally {
      setIsLoadingTree(false);
    }

    try {
      const gitRes = await fetch('/api/android/git-status');
      const gitData = await gitRes.json();
      setGitStatus(gitData.status || '');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  // Load File Content when selectedFilePath changes
  const loadFile = async (path: string) => {
    setIsLoadingFile(true);
    setErrorMsg(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/android/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setFileContent(data.content);
        setOriginalContent(data.content);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load file content');
    } finally {
      setIsLoadingFile(false);
    }
  };

  useEffect(() => {
    if (selectedFilePath) {
      loadFile(selectedFilePath);
    }
  }, [selectedFilePath]);

  // Save File
  const handleSave = async () => {
    if (!selectedFilePath) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/android/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedFilePath, content: fileContent }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalContent(fileContent);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // Refresh git status
        const gitRes = await fetch('/api/android/git-status');
        const gitData = await gitRes.json();
        setGitStatus(gitData.status || '');
      } else {
        setErrorMsg(data.error || 'Failed to save');
      }
    } catch (err: any) {
      setErrorMsg('Error saving file');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFilePath, fileContent]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const isModified = fileContent !== originalContent;

  // Render tree node recursively
  const renderNode = (node: AndroidFileNode, depth = 0) => {
    const isExpanded = !!expandedFolders[node.path];
    const isDir = node.type === 'directory';
    const isSelected = selectedFilePath === node.path;

    if (
      treeSearch &&
      !node.name.toLowerCase().includes(treeSearch.toLowerCase()) &&
      (!node.children || !hasMatchingChild(node, treeSearch))
    ) {
      return null;
    }

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => {
            if (isDir) {
              toggleFolder(node.path);
            } else {
              setSelectedFilePath(node.path);
            }
          }}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`flex items-center gap-1.5 py-1 pr-2 rounded-md text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-amber-600/20 text-amber-300 font-semibold'
              : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
          }`}
        >
          {isDir ? (
            isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            )
          ) : node.name.endsWith('.java') || node.name.endsWith('.kt') ? (
            <FileCode className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          ) : node.name.endsWith('.xml') ? (
            <FileText className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
          )}

          <span className="truncate flex-1 font-mono">{node.name}</span>
          {!isDir && node.size !== undefined && (
            <span className="text-[10px] text-stone-500 font-mono">
              {node.size > 1024 ? `${(node.size / 1024).toFixed(0)}k` : `${node.size}b`}
            </span>
          )}
        </div>

        {isDir && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  function hasMatchingChild(node: AndroidFileNode, search: string): boolean {
    if (!node.children) return false;
    return node.children.some(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        hasMatchingChild(c, search)
    );
  }

  // Quick jump presets
  const quickJumpFiles = [
    { label: 'strings.xml', path: 'app/src/main/res/values/strings.xml' },
    { label: 'NavigationActivity.java', path: 'app/src/main/java/com/ext/techapp/thirukkural/NavigationActivity.java' },
    { label: 'ItemDetailActivity.java', path: 'app/src/main/java/com/ext/techapp/thirukkural/ItemDetailActivity.java' },
    { label: 'CoupletsXMLParser.java', path: 'app/src/main/java/com/ext/techapp/thirukkural/xml/CoupletsXMLParser.java' },
    { label: 'AndroidManifest.xml', path: 'app/src/main/AndroidManifest.xml' },
    { label: 'build.gradle', path: 'app/build.gradle' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              ← குறள்கள்
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-stone-900 font-sans flex items-center gap-2">
                Android Source Code Editor
                <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono px-2 py-0.5 rounded font-normal">
                  /android
                </span>
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              View, edit, and modify your original GitHub repository files directly in this workspace.
            </p>
          </div>
        </div>

        {/* Quick jump pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-stone-400 font-medium mr-1">Quick Open:</span>
          {quickJumpFiles.map((item) => (
            <button
              key={item.path}
              onClick={() => setSelectedFilePath(item.path)}
              className={`px-2 py-1 rounded-md font-mono transition-colors ${
                selectedFilePath === item.path
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: File Tree on Left, Code Area on Right */}
      <div className="bg-stone-950 rounded-2xl border border-stone-800 shadow-xl overflow-hidden flex flex-col lg:flex-row h-[720px]">
        {/* Left Panel: File Explorer */}
        <div className="w-full lg:w-72 bg-stone-900 border-b lg:border-b-0 lg:border-r border-stone-800 flex flex-col h-64 lg:h-full flex-shrink-0">
          <div className="p-3 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              Repository Files
            </span>
            <button
              onClick={loadTree}
              className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              title="Refresh tree"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Input */}
          <div className="p-2 border-b border-stone-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-stone-500 pointer-events-none" />
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="Filter files..."
                className="w-full pl-7 pr-2 py-1 bg-stone-950 text-xs text-stone-200 rounded border border-stone-800 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Tree Scroll List */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {isLoadingTree ? (
              <div className="p-4 text-center text-xs text-stone-500">Loading files...</div>
            ) : fileTree.length > 0 ? (
              fileTree.map((node) => renderNode(node))
            ) : (
              <div className="p-4 text-center text-xs text-stone-500">No files found</div>
            )}
          </div>

          {/* Git Status Footer */}
          {gitStatus && (
            <div className="p-2.5 bg-stone-950 border-t border-stone-800 text-[11px] font-mono text-amber-400">
              <div className="flex items-center gap-1 mb-1 text-stone-400 font-bold">
                <GitBranch className="w-3 h-3 text-amber-500" />
                <span>Modified Files:</span>
              </div>
              <pre className="text-stone-300 max-h-16 overflow-y-auto whitespace-pre-wrap">{gitStatus}</pre>
            </div>
          )}
        </div>

        {/* Right Panel: Code Editor Area */}
        <div className="flex-1 flex flex-col h-full bg-stone-950 overflow-hidden">
          {/* Editor Action Bar */}
          <div className="bg-stone-900 px-4 py-2.5 border-b border-stone-800 flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="font-mono text-stone-400 truncate">
                {selectedFilePath || 'No file selected'}
              </span>
              {isModified && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  ● Unsaved
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => loadFile(selectedFilePath)}
                disabled={isLoadingFile}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-medium transition-colors flex items-center gap-1.5"
                title="Discard changes and reload from disk"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFile ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reload</span>
              </button>

              <button
                id="save-android-file-btn"
                onClick={handleSave}
                disabled={isSaving || !selectedFilePath || !isModified}
                className={`px-3 py-1 rounded font-medium transition-all flex items-center gap-1.5 ${
                  saveSuccess
                    ? 'bg-emerald-600 text-white'
                    : isModified
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
                title="Save changes to disk (Ctrl+S)"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save File'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="bg-rose-950/70 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Textarea Code Editor */}
          <div className="flex-1 relative flex overflow-hidden">
            {isLoadingFile ? (
              <div className="flex-1 flex items-center justify-center text-stone-500 text-sm font-mono">
                Loading file content...
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                id="android-code-editor"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 bg-stone-950 text-stone-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none select-text selection:bg-amber-500/30 selection:text-amber-200"
                placeholder="Select a file from the explorer on the left to view and edit its code..."
              />
            )}
          </div>

          {/* Editor Status Bar */}
          <div className="bg-stone-900/90 px-4 py-1.5 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
            <div className="flex items-center gap-3">
              <span>Lines: {fileContent ? fileContent.split('\n').length : 0}</span>
              <span>Characters: {fileContent.length}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500">
              <span>Ctrl+S / Cmd+S to save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
