export interface ITeamMemberContactInformation {
  email?: string;
  phoneNumber?: string;
}

export interface ITeamMemberSocial {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  dribbble?: string;
  behance?: string;
  github?: string;
  x?: string;
  twitter?: string;
}

export interface ITeamMember {
  id?: number;
  slug?: string;
  name: string;
  role: string;
  userImg: string;
  contactInformation?: ITeamMemberContactInformation;
  social?: ITeamMemberSocial;
  content?: string;
}
