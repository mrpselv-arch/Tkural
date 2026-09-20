import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const ANDROID_DIR = path.resolve(process.cwd(), 'android');

// Health check endpoint for container probes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// High-fidelity native Tamil & English speech synthesis proxy
app.get('/api/tts', async (req, res) => {
  try {
    const rawText = (req.query.text as string) || '';
    const lang = (req.query.lang as string) || 'ta';
    
    // Clean up text: replace multiple spaces, remove special abbreviations that sound odd
    const cleanText = rawText
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    
    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to generate audio' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err.message || 'Speech generation failed' });
  }
});


// Helper to check if path is safely inside android directory
function isSafePath(targetPath: string): boolean {
  const resolved = path.resolve(ANDROID_DIR, targetPath);
  return resolved.startsWith(ANDROID_DIR);
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
}

function buildTree(dirPath: string, relativePath = ''): FileNode[] {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === '.gradle' || entry.name === 'build') {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: relPath,
        type: 'directory',
        children: buildTree(fullPath, relPath),
      });
    } else {
      let size = 0;
      try {
        size = fs.statSync(fullPath).size;
      } catch {
        // ignore
      }
      nodes.push({
        name: entry.name,
        path: relPath,
        type: 'file',
        size,
      });
    }
  }

  // Sort directories first, then files alphabetically
  return nodes.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });
}

// 1. Get file tree
app.get('/api/android/tree', (req, res) => {
  try {
    if (!fs.existsSync(ANDROID_DIR)) {
      return res.status(404).json({ error: 'Android directory not found' });
    }
    const tree = buildTree(ANDROID_DIR);
    res.json({ tree });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Read file content
app.get('/api/android/file', (req, res) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath || !isSafePath(filePath)) {
      return res.status(400).json({ error: 'Invalid or unsafe path' });
    }
    const fullPath = path.resolve(ANDROID_DIR, filePath);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      return res.status(404).json({ error: 'File not found' });
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content, path: filePath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Save file content
app.post('/api/android/file', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath || !isSafePath(filePath)) {
      return res.status(400).json({ error: 'Invalid or unsafe path' });
    }
    const fullPath = path.resolve(ANDROID_DIR, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    res.json({ success: true, path: filePath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Git status in android folder
app.get('/api/android/git-status', (req, res) => {
  exec('git status --short', { cwd: ANDROID_DIR }, (err, stdout) => {
    if (err) {
      return res.json({ status: '', clean: true });
    }
    res.json({ status: stdout.trim(), clean: stdout.trim().length === 0 });
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
