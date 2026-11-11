export type CategoryType = 
  | 'all'
  | 'security'
  | 'design'
  | 'animation'
  | 'clean-code'
  | 'mobile'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'testing'
  | 'prompting'
  | 'other';

export type TechnologyType =
  | 'all'
  | 'react'
  | 'nextjs'
  | 'typescript'
  | 'swift'
  | 'expo'
  | 'tailwind'
  | 'cloudflare'
  | 'python'
  | 'node';

export interface CategoryDef {
  id: CategoryType;
  label: string;
  iconName: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  title: string;
  repo: string;
  repo_url: string;
  skill_path?: string;
  description: string;
  category: CategoryType;
  tags: string[];
  technologies?: string[];
  allowed_tools?: string[];
  compatible_agents?: string[];
  author: string;
  install_command: string;
  raw_content?: string;
  is_favorite?: boolean;
  user_id?: string;
  created_at: string;
}

export interface SkillPack {
  id: string;
  title: string;
  description: string;
  skill_ids: string[];
  icon?: string;
  category: CategoryType;
  created_at: string;
  user_id?: string;
}

export interface ProjectStack {
  id: string;
  name: string;
  description?: string;
  skill_ids: string[];
  created_at: string;
}

export interface ScrapedSkillItem {
  name: string;
  title: string;
  description: string;
  category: CategoryType;
  tags: string[];
  technologies?: string[];
  allowed_tools?: string[];
  skill_path?: string;
  install_command: string;
}

export interface ScrapedRepoResult {
  repo: string;
  repo_url: string;
  owner: string;
  name: string;
  description: string;
  stars: number;
  detected_skills: ScrapedSkillItem[];
  raw_readme?: string;
}
