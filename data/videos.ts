export type Video = {
  slug: string;
  title: string;
  description: string;
  category: "銀髮長照" | "都更危老" | "婦幼安全" | "AI里政" | "毛孩友善" | "地方日常";
  type: "youtube" | "mp4";
  src: string;
  date: string;
};

export const videos: Video[] = [
  {
    slug: "hello-hululi",
    title: "永才想和大家一起做的事",
    description: "從傾聽開始，讓每一件里民關心的事都有回應。",
    category: "地方日常",
    type: "youtube",
    src: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    date: "2026-06-01"
  },
  {
    slug: "care-for-seniors",
    title: "讓長輩安心，也讓照顧者放心",
    description: "聊聊社區長照與日常陪伴可以怎麼做得更好。",
    category: "銀髮長照",
    type: "youtube",
    src: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    date: "2026-05-22"
  },
  {
    slug: "ai-local-service",
    title: "AI 也能讓里政更貼心",
    description: "用簡單工具整理需求、加快回覆，但溫度永遠由人來傳遞。",
    category: "AI里政",
    type: "youtube",
    src: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    date: "2026-05-15"
  }
];
