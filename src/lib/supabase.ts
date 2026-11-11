import { createClient } from '@supabase/supabase-js';
import { Skill, SkillPack } from '@/types/skills';
import { INITIAL_SKILLS, INITIAL_PACKS } from './seed-data';

function sanitizeUrl(raw?: string): string | null {
  if (!raw) return null;
  let url = raw.trim();
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  } else if (!url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

const supabaseUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true },
      global: {
        headers: { 'x-application-name': 'SkillsHub' },
      },
    })
  : null;

const LOCAL_STORAGE_SKILLS_KEY = 'skillshub_custom_skills';
const LOCAL_STORAGE_PACKS_KEY = 'skillshub_custom_packs';

// Helper for timeout
async function withTimeout<T>(thenable: PromiseLike<T>, ms = 3500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timeout')), ms);
  });
  return Promise.race([Promise.resolve(thenable), timeoutPromise]).finally(() => clearTimeout(timer));
}

export async function fetchSkills(): Promise<{ skills: Skill[]; isCloud: boolean }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('skills')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (!error && data) {
        if (data.length > 0) {
          // Merge custom from cloud with initial
          const map = new Map<string, Skill>();
          INITIAL_SKILLS.forEach(s => map.set(s.id, s));
          (data as Skill[]).forEach(s => map.set(s.id, s));
          return { skills: Array.from(map.values()), isCloud: true };
        }
        return { skills: INITIAL_SKILLS, isCloud: true };
      } else if (error) {
        console.warn('Supabase fetch error, using local fallback:', error.message);
      }
    } catch (err) {
      console.warn('Supabase connection timeout/error:', err);
    }
  }

  // Local/Offline fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
      const { data, error } = await withTimeout(
        supabase
          .from('skills')
          .insert([skill])
          .select()
          .single(),
        4000
      );

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
      await withTimeout(supabase.from('skills').delete().eq('id', skillId), 3000);
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
      const { data, error } = await withTimeout(
        supabase
          .from('packs')
          .select('*')
          .order('created_at', { ascending: false }),
        3500
      );

      if (!error && data && data.length > 0) {
        const map = new Map<string, SkillPack>();
        INITIAL_PACKS.forEach(p => map.set(p.id, p));
        (data as SkillPack[]).forEach(p => map.set(p.id, p));
        return Array.from(map.values());
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
      const { data, error } = await withTimeout(
        supabase
          .from('packs')
          .insert([pack])
          .select()
          .single(),
        4000
      );

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
