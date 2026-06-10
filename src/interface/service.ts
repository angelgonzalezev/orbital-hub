export interface IServiceReview {
  name: string;
  image: string;
  reviewContent: string;
  userRole: string;
}

export interface IService {
  id?: number;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  coverImg?: string;
  userReview?: IServiceReview;
  content?: string;
}
