export interface IBlogPost {
  id?: number;
  slug: string;
  tag: string;
  author: string;
  authorImage: string;
  publishDate: string;
  title: string;
  description: string;
  thumbnail: string;
  readTime: string;
  content?: string;
  featured?: boolean;
}
