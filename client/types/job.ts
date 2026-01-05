export interface Job {
  id: string;
  date_posted: string;
  title: string;
  organization: string;
  organization_url: string;
  organization_logo: string;
  description_text?: string;
  locations_derived?: string[];
  employment_type?: string[];
  remote_derived?: boolean;
  url: string;
}
