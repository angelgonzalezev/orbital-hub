export interface IPosition {
  id?: number;
  slug: string;
  title: string;
  datePosted: string;
  expirationDate: string;
  location: string;
  offeredSalary: string;
  experience: string;
  qualification: string;
  shortDescription: string;
  employmentType: string[];
  jobSkills: string[];
  content?: string;
}
