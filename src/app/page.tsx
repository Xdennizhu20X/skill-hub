'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { CategoryType, TechnologyType, Skill, SkillPack } from '@/types/skills';
import { fetchSkills, fetchPacks, saveSkill, deleteSkill, savePack, updateSkillNotes } from '@/lib/supabase';
import { INITIAL_SKILLS, INITIAL_PACKS } from '@/lib/seed-data';
import { isSoundEnabled, setSoundEnabled, playClickSound, playPopSound, playSuccessSound } from '@/lib/sound';
import { Navbar } from '@/components/Navbar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { TechFilter } from '@/components/TechFilter';
import { SkillCard } from '@/components/SkillCard';
import { ArchitectureStudio } from '@/components/ArchitectureStudio';
import { FloatingDock } from '@/components/FloatingDock';
import { AddSkillModal } from '@/components/AddSkillModal';
import { SkillSlideOver } from '@/components/SkillSlideOver';
import { PacksDrawer } from '@/components/PacksDrawer';
import { CommandPalette } from '@/components/CommandPalette';
import { ExploreModal } from '@/components/ExploreModal';
import { CompareModal } from '@/components/CompareModal';
import { CheckSquare, Square, Layers, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);
  const [packs, setPacks] = useState<SkillPack[]>(INITIAL_PACKS);
  const [isCloud, setIsCloud] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Innovation Settings: Studio vs Grid view & Sound feedback
  const [viewMode, setViewMode] = useState<'studio' | 'grid'>('studio');
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedTech, setSelectedTech] = useState<TechnologyType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Modals & Panels
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPacksDrawerOpen, setIsPacksDrawerOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial load
  useEffect(() => {
    setSoundActive(isSoundEnabled());
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

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playClickSound();
    toast.success(next ? 'Efectos sonoros táctiles activados' : 'Efectos sonoros silenciados');
  };

  const handleToggleViewMode = () => {
    playClickSound();
    setViewMode((prev) => (prev === 'studio' ? 'grid' : 'studio'));
  };

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

      // Technology filter
      if (selectedTech !== 'all') {
        const matchTech = skill.technologies?.includes(selectedTech);
        const matchTag = skill.tags?.some((t) => t.toLowerCase().includes(selectedTech));
        const matchDesc = skill.description.toLowerCase().includes(selectedTech);
        if (!matchTech && !matchTag && !matchDesc) {
          return false;
        }
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
  }, [skills, selectedCategory, selectedTech, searchQuery]);

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

  const handleRemoveSkill = (skillId: string) => {
    playPopSound(false);
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  // Select all currently visible skills
  const handleSelectAllVisible = () => {
    const visibleIds = filteredSkills.map((s) => s.id);
    const allSelected = visibleIds.every((id) => selectedSkillIds.includes(id));

    if (allSelected) {
      playPopSound(false);
      setSelectedSkillIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      playSuccessSound();
      const newSelected = Array.from(new Set([...selectedSkillIds, ...visibleIds]));
      setSelectedSkillIds(newSelected);
      toast.success(`${visibleIds.length} skills agregadas al stack`);
    }
  };

  // Add new skills from GitHub Scraper or Lockfile
  const handleAddSkills = async (newSkills: Omit<Skill, 'id' | 'created_at'>[]) => {
    const addedList: Skill[] = [];
    for (const item of newSkills) {
      const saved = await saveSkill(item);
      addedList.push(saved);
    }
    setSkills((prev) => [...addedList, ...prev]);
  };

  // Add single skill (from Explore modal)
  const handleAddSingleSkill = async (item: Omit<Skill, 'id' | 'created_at'>) => {
    const saved = await saveSkill(item);
    setSkills((prev) => [saved, ...prev]);
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

  // Update Personal Notes
  const handleUpdateNotes = async (skillId: string, notes: string) => {
    await updateSkillNotes(skillId, notes);
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, notes } : s))
    );
    if (detailSkill && detailSkill.id === skillId) {
      setDetailSkill({ ...detailSkill, notes });
    }
  };

  // Download helpers
  const handleDownloadAgentsMd = () => {
    playSuccessSound();
    let md = `# Instructions for AI Coding Agents (AGENTS.md)\n\n`;
    md += `This repository utilizes the following specialized architectural skill stack:\n\n`;
    md += `<!-- skills:start -->\n`;
    selectedSkillsObjects.forEach((s, idx) => {
      md += `### ${idx + 1}. ${s.title} (\`${s.name}\`)\n`;
      md += `- **Repository:** ${s.repo}\n`;
      md += `- **Category:** ${s.category}\n`;
      md += `- **Purpose:** ${s.description}\n`;
      if (s.allowed_tools && s.allowed_tools.length > 0) {
        md += `- **Allowed Tools:** ${s.allowed_tools.join(', ')}\n`;
      }
      md += `- **Install Command:** \`${s.install_command}\`\n\n`;
    });
    md += `<!-- skills:end -->\n\n`;
    md += `## Guidelines for AI Coding Agents\n`;
    md += `- Consult the skills above when planning and executing architectural or UI changes.\n`;
    md += `- Enforce clean design tokens, strict type safety, and verify functionality before finalizing.\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AGENTS.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Archivo AGENTS.md generado y descargado');
  };

  const handleDownloadPs1 = () => {
    playSuccessSound();
    const repoMap = new Map<string, string[]>();
    selectedSkillsObjects.forEach((s) => {
      const list = repoMap.get(s.repo) || [];
      list.push(s.name);
      repoMap.set(s.repo, list);
    });

    const lines: string[] = [
      '# SkillsHub Installer Script for Windows (PowerShell)',
      'Write-Host "==========================================" -ForegroundColor Cyan',
      'Write-Host "  Instalando Stack Arquitectonico de IA   " -ForegroundColor Cyan',
      'Write-Host "==========================================" -ForegroundColor Cyan',
      '',
    ];
    repoMap.forEach((skills, repo) => {
      lines.push(`Write-Host "-> Conectando con ${repo}..." -ForegroundColor Yellow`);
      lines.push(`npx skills add ${repo} --skill ${skills.join(' ')} -y`);
    });
    lines.push('');
    lines.push('Write-Host "¡Stack instalado exitosamente!" -ForegroundColor Green');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'install-stack.ps1';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Script install-stack.ps1 descargado');
  };

  const areAllVisibleSelected =
    filteredSkills.length > 0 &&
    filteredSkills.every((s) => selectedSkillIds.includes(s.id));

  // Dynamic ambient background glow color based on active category
  const getAmbientGlow = () => {
    switch (selectedCategory) {
      case 'security': return 'bg-gradient-to-b from-rose-950/25 via-transparent to-transparent';
      case 'design': return 'bg-gradient-to-b from-purple-950/25 via-transparent to-transparent';
      case 'animation': return 'bg-gradient-to-b from-amber-950/25 via-transparent to-transparent';
      case 'clean-code': return 'bg-gradient-to-b from-emerald-950/25 via-transparent to-transparent';
      case 'mobile': return 'bg-gradient-to-b from-blue-950/25 via-transparent to-transparent';
      default: return 'bg-gradient-to-b from-emerald-950/10 via-transparent to-transparent';
    }
  };

  return (
    <main className="min-h-screen relative pb-36">
      {/* Dynamic Ambient Glow overlay */}
      <div className={`pointer-events-none fixed inset-0 z-0 h-96 transition-colors duration-700 ${getAmbientGlow()}`} />

      {/* Navbar with ViewMode switcher and Sound controls */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenPacksDrawer={() => setIsPacksDrawerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenExploreModal={() => setIsExploreModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCloud={isCloud}
        totalSkillsCount={skills.length}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Categories Bar */}
        <div className="mb-2">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              playClickSound();
              setSelectedCategory(cat);
            }}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Tech Environment Filter Bar */}
        <div className="mb-5 pt-1">
          <TechFilter
            selectedTech={selectedTech}
            onSelectTech={(tech) => {
              playClickSound();
              setSelectedTech(tech);
            }}
          />
        </div>

        {/* Section Header & Bulk Action (in Grid mode) */}
        {viewMode === 'grid' && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-200">
                {selectedCategory === 'all' ? 'Todas las Skills' : `Skills de ${selectedCategory}`}
                {selectedTech !== 'all' && ` • ${selectedTech}`}
              </h2>
              <span className="text-xs text-zinc-400">
                ({filteredSkills.length} encontradas)
              </span>
            </div>

            {filteredSkills.length > 0 && (
              <button
                onClick={handleSelectAllVisible}
                className="tap-active flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {areAllVisibleSelected ? (
                  <>
                    <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Deseleccionar esta vista</span>
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
        )}

        {/* Studio View vs Grid View */}
        {viewMode === 'studio' ? (
          <ArchitectureStudio
            skills={filteredSkills}
            selectedSkills={selectedSkillsObjects}
            onToggleSelect={handleToggleSelect}
            onViewDetails={setDetailSkill}
            onClearSelection={() => {
              playPopSound(false);
              setSelectedSkillIds([]);
            }}
          />
        ) : filteredSkills.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <Layers className="h-10 w-10 text-zinc-600 mb-3" />
            <h3 className="text-sm font-medium text-zinc-300">No se encontraron skills</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              {searchQuery || selectedTech !== 'all'
                ? `No hay resultados para los filtros seleccionados.`
                : 'No hay skills registradas en esta categoría aún.'}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsExploreModalOpen(true)}
                className="tap-active rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white"
              >
                Explorar catálogo popular
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="tap-active rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
              >
                Registrar nueva skill
              </button>
            </div>
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

      {/* Floating Tactile Dock with Spring Physics (Raycast / macOS style) */}
      <FloatingDock
        selectedSkills={selectedSkillsObjects}
        onRemoveSkill={handleRemoveSkill}
        onClearSelection={() => {
          playPopSound(false);
          setSelectedSkillIds([]);
        }}
        onSaveAsPack={() => setIsPacksDrawerOpen(true)}
        onCompare={() => setIsCompareModalOpen(true)}
        onDownloadAgentsMd={handleDownloadAgentsMd}
        onDownloadPs1={handleDownloadPs1}
      />

      {/* Add Skill Modal (GitHub Scraping, WhatsApp text paste & Lockfile import) */}
      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSkills={handleAddSkills}
      />

      {/* Slide-over Sheet for Skill Details & Notes */}
      <SkillSlideOver
        skill={detailSkill}
        onClose={() => setDetailSkill(null)}
        onDeleteSkill={handleDeleteSkill}
        onUpdateCategory={handleUpdateCategory}
        onUpdateNotes={handleUpdateNotes}
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

      {/* Raycast-style Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        skills={skills}
        selectedSkillIds={selectedSkillIds}
        onToggleSelect={handleToggleSelect}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onViewSkill={(skill) => setDetailSkill(skill)}
      />

      {/* Explore Popular Skills Modal */}
      <ExploreModal
        isOpen={isExploreModalOpen}
        onClose={() => setIsExploreModalOpen(false)}
        existingSkills={skills}
        onAddSkill={handleAddSingleSkill}
      />

      {/* Side-by-Side Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        skills={selectedSkillsObjects}
      />
    </main>
  );
}
