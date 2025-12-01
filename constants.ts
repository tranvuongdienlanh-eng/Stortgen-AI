import { Genre, Perspective } from './types';

export const GENRES = [
  { value: Genre.ROMANCE, label: 'Ngôn tình (Romance)', icon: 'fa-heart' },
  { value: Genre.HORROR, label: 'Truyện ma (Horror)', icon: 'fa-ghost' },
  { value: Genre.COMEDY, label: 'Hài hước (Comedy)', icon: 'fa-face-laugh-squint' },
  { value: Genre.BUSINESS, label: 'Kinh doanh (Business)', icon: 'fa-briefcase' },
  { value: Genre.BUDDHIST, label: 'Phật pháp (Buddhist)', icon: 'fa-dharmachakra' },
  { value: Genre.HISTORY, label: 'Lịch sử (History)', icon: 'fa-landmark' },
];

export const PERSPECTIVES = [
  { value: Perspective.FIRST_PERSON, label: 'Ngôi thứ nhất (Tự sự)' },
  { value: Perspective.THIRD_PERSON, label: 'Ngôi thứ ba (Người kể chuyện)' },
];

export const LANGUAGES = [
  { value: 'Vietnamese', label: 'Tiếng Việt' },
  { value: 'English', label: 'English' },
  { value: 'Chinese', label: '中文 (Chinese)' },
  { value: 'Japanese', label: '日本語 (Japanese)' },
  { value: 'Korean', label: '한국어 (Korean)' },
  { value: 'French', label: 'Français' },
  { value: 'Spanish', label: 'Español' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Russian', label: 'Русский' },
  { value: 'Italian', label: 'Italiano' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'Thai', label: 'ไทย (Thai)' },
  { value: 'Indonesian', label: 'Bahasa Indonesia' },
  { value: 'Hindi', label: 'हिन्दी (Hindi)' },
  { value: 'Arabic', label: 'العربية (Arabic)' },
];
