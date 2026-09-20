export interface Couplet {
  id: number;
  chapterId: number;
  line1: string;
  line2: string;
  muva: string;
  solomon: string;
  kalaignar: string;
  englishLine1: string;
  englishLine2: string;
  explanation: string;
}

export interface Section {
  id: number;
  tamil: string;
  english: string;
}

export interface Iyal {
  tamil: string;
  english: string;
}

export interface Chapter {
  id: number;
  nameTamil: string;
  nameEnglish: string;
  section: Section;
  iyal: Iyal;
  startCouplet: number;
  endCouplet: number;
  couplets: Couplet[];
}

export interface ThirukkuralData {
  chapters: Chapter[];
}

export interface AndroidFileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: AndroidFileNode[];
}

export type TabType = 'reader' | 'daily' | 'search' | 'saved' | 'about' | 'android-editor';
export type CommentaryType = 'muva' | 'solomon' | 'kalaignar' | 'english' | 'all';
export type LanguageMode = 'ta' | 'en' | 'both';
