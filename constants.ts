import { Lesson } from './types';

export const LESSONS: Lesson[] = [
  {
    id: 'feb-10',
    date: '2월 10일',
    title: '문장 암기 (5 Sentences)',
    type: 'sentences',
    items: [
      { id: 1, english: "A cat rides on the kite.", korean: "고양이가 연을 타고 있어요." },
      { id: 2, english: "Ken bites the ice.", korean: "Ken이 얼음을 깨물어요." },
      { id: 3, english: "A rat hides in the rice.", korean: "쥐가 쌀 속에 숨어요." },
      { id: 4, english: "Five men run and hide.", korean: "다섯 남자가 뛰어가서 숨어요." },
      { id: 5, english: "A dog dives for the kite.", korean: "개가 연을 향해 다이빙해요." }
    ]
  },
  {
    id: 'feb-12',
    date: '2월 12일',
    title: '단어 암기 (Magic E Words)',
    type: 'words',
    items: [
      { id: 1, english: "hole", korean: "구멍" },
      { id: 2, english: "pole", korean: "막대기" },
      { id: 3, english: "bone", korean: "뼈" },
      { id: 4, english: "cone", korean: "원뿔 (아이스크림 콘)" },
      { id: 5, english: "nose", korean: "코" },
      { id: 6, english: "rose", korean: "장미" },
      { id: 7, english: "note", korean: "쪽지 / 메모" },
      { id: 8, english: "vote", korean: "투표하다" },
      { id: 9, english: "poke", korean: "찌르다" },
      { id: 10, english: "home", korean: "집" },
      { id: 11, english: "hope", korean: "희망 / 바라다" }
    ]
  }
];

export const COLORS = {
  primary: 'bg-green-500',
  secondary: 'bg-yellow-400',
  accent: 'bg-pink-400',
  text: 'text-gray-800'
};
