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
const LOCAL_STORAGE_DELETED_KEY = 'skillshub_deleted_ids';
const LOCAL_STORAGE_NOTES_KEY = 'skillshub_skill_notes';

// Helper for timeout protection
async function withTimeout<T>(thenable: PromiseLike<T>, ms = 3500): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timeout')), ms);
  });
  return Promise.race([Promise.resolve(thenable), timeoutPromise]).finally(() => clearTimeout(timer));
}

// Helper to sanitize payload for Supabase so non-standard columns don't break PostgREST
function prepareSupabasePayload(skills: Skill[]) {
  return skills.map((s) => ({
    name: s.name,
    title: s.title,
    repo: s.repo,
    repo_url: s.repo_url,
    skill_path: s.skill_path || null,
    description: s.description || '',
    category: s.category || 'other',
    tags: s.tags || [],
    author: s.author || 'community',
    install_command: s.install_command,
    raw_content: s.raw_content || null,
    notes: s.notes || null,
    is_public: true,
  }));
}

export async function fetchSkills(): Promise<{ skills: Skill[]; isCloud: boolean }> {
  // 1. Always load local custom skills and deleted ids from localStorage (synchronous source of truth)
  let localSkills: Skill[] = [];
  let deletedIds = new Set<string>();
  let notesMap: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
      if (saved) {
        localSkills = JSON.parse(saved);
      }
      const deleted = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
      if (deleted) {
        deletedIds = new Set(JSON.parse(deleted));
      }
      const notes = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);
      if (notes) {
        notesMap = JSON.parse(notes);
      }
    } catch (e) {
      console.warn('Error reading local skills cache:', e);
    }
  }

  // 2. Fetch from Supabase if configured
  let cloudSkills: Skill[] = [];
  let isCloudActive = false;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('skills')
          .select('*')
          .order('created_at', { ascending: false }),
        3500
      );

      if (!error && data) {
        cloudSkills = data as Skill[];
        isCloudActive = true;
      } else if (error) {
        console.warn('Supabase fetch error, maintaining local state:', error.message);
      }
    } catch (err) {
      console.warn('Supabase connection timeout or error, using local fallback:', err);
    }
  }

  // 3. Unified merge: INITIAL_SKILLS + Cloud Skills + Local Custom Skills
  const mergedMap = new Map<string, Skill>();

  // A. Initial seed skills (excluding any explicitly deleted by user)
  INITIAL_SKILLS.forEach((s) => {
    if (!deletedIds.has(s.id)) {
      mergedMap.set(s.id, { ...s, notes: notesMap[s.id] || s.notes });
    }
  });

  // B. Cloud skills (if cloud is active)
  cloudSkills.forEach((s) => {
    if (!deletedIds.has(s.id)) {
      mergedMap.set(s.id, { ...s, notes: notesMap[s.id] || s.notes });
    }
  });

  // C. Local custom skills (imported via lockfile or scraper - NEVER OVERWRITTEN)
  localSkills.forEach((s) => {
    if (!deletedIds.has(s.id)) {
      mergedMap.set(s.id, { ...s, notes: notesMap[s.id] || s.notes });
    }
  });

  return {
    skills: Array.from(mergedMap.values()),
    isCloud: isCloudActive,
  };
}

export async function saveSkills(skills: Omit<Skill, 'id' | 'created_at'>[]): Promise<Skill[]> {
  const preparedSkills: Skill[] = skills.map((skill) => ({
    ...skill,
    id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  }));

  // 1. Immediately persist to localStorage so data is NEVER lost on reload
  if (typeof window !== 'undefined') {
    try {
      const current = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
      const list: Skill[] = current ? JSON.parse(current) : [];
      const existingIds = new Set(list.map((s) => s.id));
      const toAdd = preparedSkills.filter((s) => !existingIds.has(s.id));
      const updated = [...toAdd, ...list];
      localStorage.setItem(LOCAL_STORAGE_SKILLS_KEY, JSON.stringify(updated));

      // Remove from deleted list if present
      const deleted = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
      if (deleted) {
        const deletedArr: string[] = JSON.parse(deleted);
        const filteredDeleted = deletedArr.filter((id) => !toAdd.some((s) => s.id === id));
        localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(filteredDeleted));
      }
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }

  // 2. Try to sync in batch with Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = prepareSupabasePayload(preparedSkills);
      await withTimeout(
        supabase
          .from('skills')
          .insert(payload),
        5000
      );
    } catch (err) {
      console.warn('Supabase batch insert failed, skills safely kept in local storage:', err);
    }
  }

  return preparedSkills;
}

export async function saveSkill(skill: Omit<Skill, 'id' | 'created_at'>): Promise<Skill> {
  const [saved] = await saveSkills([skill]);
  return saved;
}

export async function updateSkillNotes(skillId: string, notes: string): Promise<boolean> {
  // 1. Save to local storage notes map
  if (typeof window !== 'undefined') {
    try {
      const current = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY);
      const notesMap = current ? JSON.parse(current) : {};
      notesMap[skillId] = notes;
      localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(notesMap));

      // Also update directly in custom skills list if it exists there
      const skillsRaw = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
      if (skillsRaw) {
        const list: Skill[] = JSON.parse(skillsRaw);
        const updated = list.map((s) => (s.id === skillId ? { ...s, notes } : s));
        localStorage.setItem(LOCAL_STORAGE_SKILLS_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Error saving note locally:', e);
    }
  }

  // 2. Try Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await withTimeout(supabase.from('skills').update({ notes }).eq('id', skillId), 3000);
    } catch {
      // ignore
    }
  }

  return true;
}

export async function deleteSkill(skillId: string): Promise<boolean> {
  // 1. Mark as deleted locally so it never resurfaces
  if (typeof window !== 'undefined') {
    try {
      const deleted = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
      const deletedArr: string[] = deleted ? JSON.parse(deleted) : [];
      if (!deletedArr.includes(skillId)) {
        deletedArr.push(skillId);
        localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(deletedArr));
      }

      const current = localStorage.getItem(LOCAL_STORAGE_SKILLS_KEY);
      if (current) {
        const list: Skill[] = JSON.parse(current);
        const filtered = list.filter((s) => s.id !== skillId);
        localStorage.setItem(LOCAL_STORAGE_SKILLS_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('Error deleting locally:', e);
    }
  }

  // 2. Delete from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await withTimeout(supabase.from('skills').delete().eq('id', skillId), 3000);
    } catch {
      // ignore
    }
  }

  return true;
}

export async function fetchPacks(): Promise<SkillPack[]> {
  let localPacks: SkillPack[] = [];

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PACKS_KEY);
      if (saved) {
        localPacks = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading local packs:', e);
    }
  }

  let cloudPacks: SkillPack[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('packs')
          .select('*')
          .order('created_at', { ascending: false }),
        3500
      );

      if (!error && data) {
        cloudPacks = data as SkillPack[];
      }
    } catch {
      // ignore
    }
  }

  const map = new Map<string, SkillPack>();
  INITIAL_PACKS.forEach((p) => map.set(p.id, p));
  cloudPacks.forEach((p) => map.set(p.id, p));
  localPacks.forEach((p) => map.set(p.id, p));

  return Array.from(map.values());
}

export async function savePack(pack: Omit<SkillPack, 'id' | 'created_at'>): Promise<SkillPack> {
  const newPack: SkillPack = {
    ...pack,
    id: `pack-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  // 1. Save to local storage first
  if (typeof window !== 'undefined') {
    try {
      const current = localStorage.getItem(LOCAL_STORAGE_PACKS_KEY);
      const list: SkillPack[] = current ? JSON.parse(current) : [];
      list.unshift(newPack);
      localStorage.setItem(LOCAL_STORAGE_PACKS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Error saving pack locally:', e);
    }
  }

  // 2. Try Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await withTimeout(
        supabase
          .from('packs')
          .insert([{
            title: pack.title,
            description: pack.description,
            skill_ids: pack.skill_ids,
            icon: pack.icon || '✨',
            category: pack.category || 'other',
            is_public: true,
          }]),
        4000
      );
    } catch {
      // fallback
    }
  }

  return newPack;
}
