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
  addedAt: string;
}

export interface BooksDatabase {
  books: BookInfo[];
}

export interface AIAnalysisResult {
  name: string;
  author: string;
  type: string;
}

export interface TidyOptions {
  input: string;
  output: string;
}

export interface AnalyzeOptions {
  input: string;
}
