export interface ICaseStudyUserReview {
  userName: string;
  userImage: string;
  userRole: string;
  reviewText: string;
}

export interface ICaseStudy {
  id?: number;
  slug: string;
  title: string;
  description: string;
  featured?: boolean;
  before: string[];
  after: string[];
  thumbnail: string;
  keyFeatures: string[];
  userReview: ICaseStudyUserReview;
  result: string;
  content?: string;
}
