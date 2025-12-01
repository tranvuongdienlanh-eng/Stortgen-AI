export enum Genre {
  ROMANCE = 'Romance (Ngôn tình)',
  HORROR = 'Horror/Ghost (Truyện ma)',
  COMEDY = 'Comedy (Hài hước)',
  BUSINESS = 'Business (Kinh doanh)',
  BUDDHIST = 'Buddhist/Dharma (Phật pháp)',
  HISTORY = 'History (Lịch sử)',
}

export enum Perspective {
  FIRST_PERSON = 'First Person (Tôi/Tự sự)',
  THIRD_PERSON = 'Third Person (Tác giả/Ngôi thứ 3)',
}

export interface StoryConfig {
  prompt: string;
  languages: string[];
  genre: Genre;
  perspective: Perspective;
  characterCount: number;
  podcastDurationMinutes: number;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface GeneratedStoryResult {
  title: string;
  content: string;
  groundingSources?: GroundingSource[];
  podcastDurationMinutes: number;
}