import { createClient } from '@supabase/supabase-js';
import { Skill, SkillPack } from '@/types/skills';
import { INITIAL_SKILLS, INITIAL_PACKS } from './seed-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

const LOCAL_STORAGE_SKILLS_KEY = 'skillshub_custom_skills';
const LOCAL_STORAGE_PACKS_KEY = 'skillshub_custom_packs';

export async function fetchSkills(): Promise<{ skills: Skill[]; isCloud: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return { skills: data as Skill[], isCloud: true };
      }
    } catch {
      // Fallback if network or table error
    }
  }

  // Local/Offline fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge initial with custom
        const mergedMap = new Map<string, Skill>();
        INITIAL_SKILLS.forEach(s => mergedMap.set(s.id, s));
        parsed.forEach((s: Skill) => mergedMap.set(s.id, s));
        return { skills: Array.from(mergedMap.values()), isCloud: false };
      } catch {
        // fallback
      }
    }
  }

  return { skills: INITIAL_SKILLS, isCloud: false };
}

export async function saveSkill(skill: Omit<Skill, 'id' | 'created_at'>): Promise<Skill> {
  const newSkill: Skill = {
    ...skill,
    id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([skill])
        .select()
        .single();

      if (!error && data) {
        return data as Skill;
      }
    } catch {
      // Fallback to local
    }
  }

  // Save in local storage
  if (typeof window !== 'undefined') {
    const current = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
    const list: Skill[] = current ? JSON.parse(current) : [];
    list.unshift(newSkill);
    localStorage.setItem(LOCAL_STORAGE_SKILLS_KEY, JSON.stringify(list));
  }

  return newSkill;
}

export async function deleteSkill(skillId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('skills').delete().eq('id', skillId);
    } catch {
      // ignore
    }
  }

  if (typeof window !== 'undefined') {
    const current = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
    if (current) {
      const list: Skill[] = JSON.parse(current);
      const filtered = list.filter(s => s.id !== skillId);
      localStorage.setItem(LOCAL_STORAGE_SKILLS_KEY, JSON.stringify(filtered));
    }
  }

  return true;
}

export async function fetchPacks(): Promise<SkillPack[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('packs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as SkillPack[];
      }
    } catch {
      // Fallback
    }
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_PACKS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const map = new Map<string, SkillPack>();
        INITIAL_PACKS.forEach(p => map.set(p.id, p));
        parsed.forEach((p: SkillPack) => map.set(p.id, p));
        return Array.from(map.values());
      } catch {
        // fallback
      }
    }
  }

  return INITIAL_PACKS;
}

export async function savePack(pack: Omit<SkillPack, 'id' | 'created_at'>): Promise<SkillPack> {
  const newPack: SkillPack = {
    ...pack,
    id: `pack-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('packs')
        .insert([pack])
        .select()
        .single();

      if (!error && data) {
        return data as SkillPack;
      }
    } catch {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    const current = localStorage.getItem(LOCAL_STORAGE_PACKS_KEY);
    const list: SkillPack[] = current ? JSON.parse(current) : [];
    list.unshift(newPack);
    localStorage.setItem(LOCAL_STORAGE_PACKS_KEY, JSON.stringify(list));
  }

  return newPack;
}
