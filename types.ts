export interface StudyItem {
  id: number;
  english: string;
  korean: string;
}

export interface Lesson {
  id: string;
  date: string;
  title: string;
  type: 'sentences' | 'words';
  items: StudyItem[];
}

export enum AppMode {
  MENU = 'MENU',
  LESSON_SELECT = 'LESSON_SELECT',
  STUDY_SENTENCES = 'STUDY_SENTENCES',
  STUDY_WORDS = 'STUDY_WORDS'
}
