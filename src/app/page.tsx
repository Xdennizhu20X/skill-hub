'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { CategoryType, Skill, SkillPack } from '@/types/skills';
import { fetchSkills, fetchPacks, saveSkill, deleteSkill, savePack } from '@/lib/supabase';
import { INITIAL_SKILLS, INITIAL_PACKS } from '@/lib/seed-data';
import { Navbar } from '@/components/Navbar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SkillCard } from '@/components/SkillCard';
import { MultiSelectBar } from '@/components/MultiSelectBar';
import { AddSkillModal } from '@/components/AddSkillModal';
import { SkillDetailModal } from '@/components/SkillDetailModal';
import { PacksDrawer } from '@/components/PacksDrawer';
import { Sparkles, Terminal, Info, CheckSquare, Square, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [packs, setPacks] = useState<SkillPack[]>(INITIAL_PACKS);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPacksDrawerOpen, setIsPacksDrawerOpen] = useState<boolean>(false);
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const { skills: loadedSkills, isCloud: cloudStatus } = await fetchSkills();
        const loadedPacks = await fetchPacks();
        setSkills(loadedSkills);
        setPacks(loadedPacks);
        setIsCloud(cloudStatus);
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      all: skills.length,
      security: 0,
      design: 0,
      animation: 0,
      'clean-code': 0,
      mobile: 0,
      frontend: 0,
      backend: 0,
      devops: 0,
      testing: 0,
      prompting: 0,
      other: 0,
    };

    skills.forEach((s) => {
      if (counts[s.category] !== undefined) {
        counts[s.category]++;
      } else {
        counts.other++;
      }
    });

    return counts;
  }, [skills]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      // Category filter
      if (selectedCategory !== 'all' && skill.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = skill.name.toLowerCase().includes(q);
        const matchTitle = skill.title.toLowerCase().includes(q);
        const matchDesc = skill.description.toLowerCase().includes(q);
        const matchRepo = skill.repo.toLowerCase().includes(q);
        const matchTags = skill.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchDesc && !matchRepo && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [skills, selectedCategory, searchQuery]);

  // Selected Skills Objects
  const selectedSkillsObjects = useMemo(() => {
    return skills.filter((s) => selectedSkillIds.includes(s.id));
  }, [skills, selectedSkillIds]);

  // Toggle skill selection
  const handleToggleSelect = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  // Select all currently visible skills
  const handleSelectAllVisible = () => {
    const visibleIds = filteredSkills.map((s) => s.id);
    const allSelected = visibleIds.every((id) => selectedSkillIds.includes(id));

    if (allSelected) {
      // Unselect visible
      setSelectedSkillIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      const newSelected = Array.from(new Set([...selectedSkillIds, ...visibleIds]));
      setSelectedSkillIds(newSelected);
      toast.success(`${visibleIds.length} skills seleccionadas`);
    }
  };

  // Add new skills from GitHub Scraper
  const handleAddSkills = async (newSkills: Omit<Skill, 'id' | 'created_at'>[]) => {
    const addedList: Skill[] = [];
    for (const item of newSkills) {
      const saved = await saveSkill(item);
      addedList.push(saved);
    }
    setSkills((prev) => [...addedList, ...prev]);
  };

  // Delete skill
  const handleDeleteSkill = async (skillId: string) => {
    await deleteSkill(skillId);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  // Create Pack
  const handleCreatePack = async (packData: Omit<SkillPack, 'id' | 'created_at'>) => {
    const saved = await savePack(packData);
    setPacks((prev) => [saved, ...prev]);
  };

  // Update Skill Category
  const handleUpdateCategory = (skillId: string, newCategory: CategoryType) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, category: newCategory } : s))
    );
    if (detailSkill && detailSkill.id === skillId) {
      setDetailSkill({ ...detailSkill, category: newCategory });
    }
  };

  const areAllVisibleSelected =
    filteredSkills.length > 0 &&
    filteredSkills.every((s) => selectedSkillIds.includes(s.id));

  return (
    <main className="min-h-screen pb-28">
      {/* Navbar */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenPacksDrawer={() => setIsPacksDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCloud={isCloud}
        totalSkillsCount={skills.length}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Categories Bar */}
        <div className="mb-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Section Header & Bulk Action */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-200">
              {selectedCategory === 'all' ? 'Todas las Skills' : `Skills de ${selectedCategory}`}
            </h2>
            <span className="text-xs text-zinc-400">
              ({filteredSkills.length} encontradas)
            </span>
          </div>

          {/* Quick "Select all visible" button */}
          {filteredSkills.length > 0 && (
            <button
              onClick={handleSelectAllVisible}
              className="tap-active flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {areAllVisibleSelected ? (
                <>
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Deseleccionar esta categoría</span>
                </>
              ) : (
                <>
                  <Square className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Seleccionar todas las visibles ({filteredSkills.length})</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mb-3" />
            <p className="text-sm">Cargando catálogo de skills...</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <Layers className="h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-sm font-medium text-zinc-300">No se encontraron skills</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              {searchQuery
                ? `No hay resultados para "${searchQuery}". Intenta con otra palabra clave.`
                : 'No hay skills registradas en esta categoría aún.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="tap-active mt-4 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
            >
              Registrar nueva skill desde GitHub
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isSelected={selectedSkillIds.includes(skill.id)}
                onToggleSelect={handleToggleSelect}
                onViewDetails={setDetailSkill}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Multi-Select Command Generator Bar */}
      <MultiSelectBar
        selectedSkills={selectedSkillsObjects}
        onClearSelection={() => setSelectedSkillIds([])}
        onSaveAsPack={() => setIsPacksDrawerOpen(true)}
      />

      {/* Add Skill Modal (GitHub Scraping & Parsing) */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSkills={handleAddSkills}
      />

      {/* Skill Details Modal */}
      <SkillDetailModal
        skill={detailSkill}
        onClose={() => setDetailSkill(null)}
        onDeleteSkill={handleDeleteSkill}
        onUpdateCategory={handleUpdateCategory}
      />

      {/* Packs Drawer */}
      <PacksDrawer
        isOpen={isPacksDrawerOpen}
        onClose={() => setIsPacksDrawerOpen(false)}
        packs={packs}
        allSkills={skills}
        onSelectSkills={(ids) => setSelectedSkillIds(ids)}
        onCreatePack={handleCreatePack}
        initialSelectedSkillIds={selectedSkillIds}
      />
    </main>
  );
}
