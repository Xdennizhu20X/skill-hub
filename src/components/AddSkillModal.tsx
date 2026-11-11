'use client';

import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Loader2, 
  ArrowRight, 
  FileJson, 
  MessageSquare, 
  Upload,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { ScrapedRepoResult, ScrapedSkillItem, Skill, CategoryType } from '@/types/skills';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { toast } from 'sonner';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkills: (skills: Omit<Skill, 'id' | 'created_at'>[]) => void;
}

function guessLockfileCategory(skillName: string, repo: string): CategoryType {
  const combined = `${skillName} ${repo}`.toLowerCase();
  if (/\b(security|audit|vulnerability|pen-test|auth|cve)\b/.test(combined)) return 'security';
  if (/\b(anti-slop|antislop|code-hygiene|clean-code|linter)\b/.test(combined)) return 'clean-code';
  if (/\b(animate|animation|spring|motion|choreograph)\b/.test(combined)) return 'animation';
  if (/\b(apple-design|design|ui|ux|polish)\b/.test(combined)) return 'design';
  if (/\b(mobile|native|expo|react-native|gestures)\b/.test(combined)) return 'mobile';
  if (/\b(testing|break-ui|qa|stress)\b/.test(combined)) return 'testing';
  if (/\b(sonner|toast|react|frontend)\b/.test(combined)) return 'frontend';
  return 'other';
}

export function AddSkillModal({
  isOpen,
  onClose,
  onAddSkills,
}: AddSkillModalProps) {
  const [activeMode, setActiveMode] = useState<'url' | 'lockfile'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedResult, setScrapedResult] = useState<ScrapedRepoResult | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [lockfileJson, setLockfileJson] = useState('');

  // Lockfile Audit analysis
  const lockfileAudit = React.useMemo(() => {
    if (!lockfileJson.trim()) return null;
    try {
      const parsed = JSON.parse(lockfileJson.trim());
      const skillsObj = parsed.skills || parsed;
      if (typeof skillsObj !== 'object' || skillsObj === null) return null;

      const entries = Object.entries(skillsObj);
      if (entries.length === 0) return null;

      const counts = {
        security: 0,
        cleanCode: 0,
        designMotion: 0,
        mobile: 0,
        other: 0,
      };

      const parsedSkills: Array<{ name: string; repo: string; category: CategoryType }> = [];

      entries.forEach(([name, data]: [string, any]) => {
        const repo = data?.source || 'unknown/repo';
        const cat = guessLockfileCategory(name, repo);
        parsedSkills.push({ name, repo, category: cat });

        if (cat === 'security') counts.security++;
        else if (cat === 'clean-code') counts.cleanCode++;
        else if (cat === 'design' || cat === 'animation') counts.designMotion++;
        else if (cat === 'mobile') counts.mobile++;
        else counts.other++;
      });

      const gaps: Array<{
        title: string;
        description: string;
        recommended: Omit<Skill, 'id' | 'created_at'>;
      }> = [];

      if (counts.security === 0) {
        gaps.push({
          title: 'Sin blindaje de Seguridad / Auditoría',
          description: 'No hay skills para revisar vulnerabilidades, tokens ni endpoints.',
          recommended: {
            name: 'security-audit',
            title: 'Security Audit & Vulnerabilities',
            repo: 'cloudflare/security-audit-skill',
            repo_url: 'https://github.com/cloudflare/security-audit-skill',
            description: 'Revisión exhaustiva de vulnerabilidades y seguridad para código y APIs.',
            category: 'security',
            tags: ['security', 'audit', 'cloudflare'],
            author: 'cloudflare',
            install_command: 'npx skills add cloudflare/security-audit-skill',
            is_favorite: true,
          },
        });
      }

      if (counts.cleanCode === 0) {
        gaps.push({
          title: 'Sin filtros Anti-Slop ni calidad',
          description: 'Riesgo de código con comentarios redundantes y estilos genéricos de IA.',
          recommended: {
            name: 'antislop',
            title: 'Anti-Slop Core Filter',
            repo: 'miqdadbadjuber/anti-slop',
            repo_url: 'https://github.com/miqdadbadjuber/anti-slop',
            skill_path: 'skills/antislop/SKILL.md',
            description: 'Filtro esencial contra UI genérica de IA y degradados cliché.',
            category: 'clean-code',
            tags: ['anti-slop', 'craft'],
            author: 'miqdadbadjuber',
            install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop',
            is_favorite: true,
          },
        });
      }

      if (counts.mobile === 0) {
        gaps.push({
          title: 'Sin optimización Mobile / Touch',
          description: 'Posible hover pegajoso, autozoom en inputs y problemas con 100dvh.',
          recommended: {
            name: 'mobile-native',
            title: 'Mobile Native Web Polish',
            repo: 'emilkowalski/skills',
            repo_url: 'https://github.com/emilkowalski/skills',
            skill_path: 'skills/mobile-native/SKILL.md',
            description: 'Ajustes CSS y meta-tags para que una web app se sienta nativa.',
            category: 'mobile',
            tags: ['mobile', 'responsive'],
            author: 'emilkowalski',
            install_command: 'npx skills add emilkowalski/skills --skill mobile-native',
            is_favorite: true,
          },
        });
      }

      return {
        total: entries.length,
        counts,
        parsedSkills,
        gaps,
      };
    } catch {
      return null;
    }
  }, [lockfileJson]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setLockfileJson(content);
        toast.success(`Archivo "${file.name}" cargado`);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setScrapedResult(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Error al analizar el repositorio');
        setLoading(false);
        return;
      }

      setScrapedResult(data);
      setSelectedIndices(data.detected_skills.map((_: unknown, i: number) => i));
      toast.success(`Se encontraron ${data.detected_skills.length} skills en ${data.repo}`);
    } catch {
      toast.error('No se pudo conectar con el servidor para analizar el repositorio');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIndex = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSaveSelected = () => {
    if (!scrapedResult) return;

    const toSave: Omit<Skill, 'id' | 'created_at'>[] = selectedIndices.map((idx) => {
      const item: ScrapedSkillItem = scrapedResult.detected_skills[idx];
      return {
        name: item.name,
        title: item.title,
        repo: scrapedResult.repo,
        repo_url: scrapedResult.repo_url,
        skill_path: item.skill_path,
        description: item.description,
        category: item.category,
        tags: item.tags,
        technologies: item.technologies,
        allowed_tools: item.allowed_tools,
        author: scrapedResult.owner,
        install_command: item.install_command,
        raw_content: scrapedResult.raw_readme,
        is_favorite: false,
      };
    });

    onAddSkills(toSave);
    toast.success(`${toSave.length} skills agregadas a tu repositorio`);
    handleClose();
  };

  const handleImportLockfile = (withRecommendations = false) => {
    try {
      const parsed = JSON.parse(lockfileJson.trim());
      const skillsObj = parsed.skills || parsed;
      const imported: Omit<Skill, 'id' | 'created_at'>[] = [];

      Object.entries(skillsObj).forEach(([skillName, data]: [string, any]) => {
        const repo = data.source || 'unknown/repo';
        const formattedTitle = skillName
          .split(/[-_]/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const cat = guessLockfileCategory(skillName, repo);

        imported.push({
          name: skillName,
          title: formattedTitle,
          repo: repo,
          repo_url: `https://github.com/${repo}`,
          skill_path: data.skillPath,
          description: `Skill importada desde skills-lock.json (${skillName})`,
          category: cat,
          tags: [skillName, cat, 'lockfile'],
          author: repo.split('/')[0] || 'community',
          install_command: `npx skills add ${repo} --skill ${skillName}`,
          is_favorite: false,
        });
      });

      if (imported.length === 0) {
        toast.error('No se encontraron skills en el JSON ingresado');
        return;
      }

      // If user wants to close gaps as well, append recommended gap skills
      if (withRecommendations && lockfileAudit && lockfileAudit.gaps.length > 0) {
        lockfileAudit.gaps.forEach((gap) => {
          // Avoid duplicates
          if (!imported.some((s) => s.name === gap.recommended.name)) {
            imported.push(gap.recommended);
          }
        });
      }

      onAddSkills(imported);
      toast.success(
        withRecommendations
          ? `${imported.length} skills importadas (incluyendo recomendaciones para cerrar brechas)`
          : `${imported.length} skills importadas desde tu lockfile`
      );
      handleClose();
    } catch {
      toast.error('El formato JSON no es válido. Asegúrate de pegar el contenido completo de skills-lock.json');
    }
  };

  const handleClose = () => {
    setUrl('');
    setScrapedResult(null);
    setSelectedIndices([]);
    setLockfileJson('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <GithubIcon className="h-5 w-5 text-emerald-400" />
              <span>Registrar Skills</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Importa por enlace directo, mensaje de WhatsApp o archivo `skills-lock.json`.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-3 my-3 text-xs font-medium border-b border-zinc-800/80 pb-2">
          <button
            onClick={() => setActiveMode('url')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              activeMode === 'url'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span>Enlace de GitHub o WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveMode('lockfile')}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
              activeMode === 'lockfile'
                ? 'border-emerald-400 text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileJson className="h-3.5 w-3.5 text-amber-400" />
            <span>Importar skills-lock.json</span>
          </button>
        </div>

        {/* Mode: URL / WhatsApp */}
        {activeMode === 'url' && (
          <>
            <form onSubmit={handleAnalyze} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Pega un enlace de GitHub o el mensaje que te enviaron por WhatsApp..."
                className="flex-1 rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="tap-active flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <span>Analizar</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Examples */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
              <span>Ejemplos rápidos:</span>
              <button
                type="button"
                onClick={() => setUrl('https://github.com/cloudflare/security-audit-skill')}
                className="text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700"
              >
                cloudflare/security-audit-skill
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setUrl('https://github.com/emilkowalski/skills')}
                className="text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700"
              >
                emilkowalski/skills
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setUrl('https://github.com/miqdadbadjuber/anti-slop')}
                className="text-zinc-400 hover:text-emerald-400 underline decoration-zinc-700"
              >
                miqdadbadjuber/anti-slop
              </button>
            </div>

            {/* Results Area */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
              {scrapedResult && (
                <div>
                  {/* Repo Metadata Header */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-white">{scrapedResult.repo}</h3>
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        ★ {scrapedResult.stars}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{scrapedResult.description}</p>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
                      <span>Skills detectadas ({scrapedResult.detected_skills.length})</span>
                      <span>Selecciona las que desees guardar</span>
                    </div>

                    {scrapedResult.detected_skills.map((skill, idx) => {
                      const isChecked = selectedIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleIndex(idx)}
                          className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-emerald-500/60 bg-emerald-950/10'
                              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              isChecked
                                ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                                : 'border-zinc-700 bg-zinc-900'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-xs text-zinc-200">{skill.title}</span>
                              <select
                                value={skill.category}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const newCat = e.target.value as any;
                                  setScrapedResult((prev) => {
                                    if (!prev) return prev;
                                    const updated = [...prev.detected_skills];
                                    updated[idx] = { ...updated[idx], category: newCat };
                                    return { ...prev, detected_skills: updated };
                                  });
                                }}
                                className="text-[11px] font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500"
                              >
                                <option value="security">🛡️ Seguridad</option>
                                <option value="design">🎨 Diseño & UI</option>
                                <option value="animation">✨ Animación</option>
                                <option value="clean-code">🧼 Anti-Slop</option>
                                <option value="mobile">📱 Mobile</option>
                                <option value="frontend">🌐 Frontend</option>
                                <option value="backend">🗄️ Backend</option>
                                <option value="devops">☁️ DevOps</option>
                                <option value="testing">🧪 Testing</option>
                                <option value="prompting">🤖 Prompts</option>
                                <option value="other">📦 Otros</option>
                              </select>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                              {skill.description}
                            </p>

                            {/* Tech and tools chips */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {skill.allowed_tools && skill.allowed_tools.length > 0 && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1 rounded border border-emerald-800/40">
                                  tools: {skill.allowed_tools.join(', ')}
                                </span>
                              )}
                              {skill.technologies && skill.technologies.length > 0 && (
                                <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-1 rounded border border-cyan-800/40">
                                  {skill.technologies.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {scrapedResult && (
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {selectedIndices.length} de {scrapedResult.detected_skills.length} seleccionadas
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="tap-active rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSelected}
                    disabled={selectedIndices.length === 0}
                    className="tap-active rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    Guardar {selectedIndices.length} Skills
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Mode: Lockfile Import */}
        {activeMode === 'lockfile' && (
          <div className="space-y-3 mt-1 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                Pega el contenido o sube tu <code className="text-emerald-400 font-mono">skills-lock.json</code> para auditar tu cobertura arquitectónica:
              </p>
              <label className="tap-active cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-200 hover:text-white hover:bg-zinc-700">
                <Upload className="h-3.5 w-3.5 text-emerald-400" />
                <span>Subir archivo .json</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={lockfileJson}
              onChange={(e) => setLockfileJson(e.target.value)}
              placeholder={`{\n  "version": 2,\n  "skills": {\n    "animate": {\n      "source": "emilkowalski/skills"\n    }\n  }\n}`}
              className="w-full h-32 rounded-xl border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />

            {/* Reverse Audit Analysis Section */}
            {lockfileAudit && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">
                      Auditoría Inversa: {lockfileAudit.total} skills detectadas
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Cobertura: {4 - lockfileAudit.gaps.length}/4 Dimensiones
                  </span>
                </div>

                {/* Coverage Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className={`p-2 rounded-lg border text-center ${lockfileAudit.counts.security > 0 ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <span className="block text-[11px] font-medium">Seguridad</span>
                    <span className="text-sm font-semibold">{lockfileAudit.counts.security}</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${lockfileAudit.counts.cleanCode > 0 ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <span className="block text-[11px] font-medium">Anti-Slop</span>
                    <span className="text-sm font-semibold">{lockfileAudit.counts.cleanCode}</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${lockfileAudit.counts.designMotion > 0 ? 'bg-purple-950/20 border-purple-800/40 text-purple-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <span className="block text-[11px] font-medium">UI & Motion</span>
                    <span className="text-sm font-semibold">{lockfileAudit.counts.designMotion}</span>
                  </div>
                  <div className={`p-2 rounded-lg border text-center ${lockfileAudit.counts.mobile > 0 ? 'bg-blue-950/20 border-blue-800/40 text-blue-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    <span className="block text-[11px] font-medium">Mobile</span>
                    <span className="text-sm font-semibold">{lockfileAudit.counts.mobile}</span>
                  </div>
                </div>

                {/* Gaps Alert */}
                {lockfileAudit.gaps.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Brechas Detectadas ({lockfileAudit.gaps.length})</span>
                    </h4>
                    {lockfileAudit.gaps.map((gap, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-2.5 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-amber-200">{gap.title}</p>
                          <p className="text-zinc-400 text-[11px] mt-0.5">{gap.description}</p>
                          <p className="text-emerald-400 text-[11px] font-mono mt-1">
                            Recomendado: {gap.recommended.title} ({gap.recommended.name})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>¡Excelente! Tu stack cubre todas las capas esenciales de arquitectura.</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleClose}
                className="tap-active rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              {lockfileAudit && lockfileAudit.gaps.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleImportLockfile(true)}
                  className="tap-active flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/30 hover:bg-amber-900/40 px-3 py-1.5 text-xs font-semibold text-amber-200"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Importar + Cerrar Brechas (+{lockfileAudit.gaps.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleImportLockfile(false)}
                disabled={!lockfileJson.trim()}
                className="tap-active rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                Importar {lockfileAudit?.total ? `${lockfileAudit.total} Skills` : 'desde JSON'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
