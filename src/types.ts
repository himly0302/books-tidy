export interface BookRaw {
  folderName: string;
  folderPath: string;
  pics: string[];
}

export interface BookInfo {
  id: string;
  name: string;
  author: string;
  type: string;
  pic: string;
  picUrl?: string;
  bd_link?: string;
  brief: string;
  sourceFolder: string;
  addedAt: string;
}

export interface BooksDatabase {
  books: BookInfo[];
}

export interface AIAnalysisResult {
  name: string;
  author: string;
  type: string;
  brief: string;
}

export interface CopyrightCheckResult {
  folderName: string;
  status: 'public_domain' | 'copyrighted' | 'uncertain';
  reason: string;
}

export interface TidyOptions {
  input: string;
  output: string;
  force?: boolean;
}

export interface AnalyzeOptions {
  input: string;
}
