'use client';

import React, { useState } from 'react';
import { CategoryType, Skill } from '@/types/skills';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Trash2, 
  Wrench, 
  Bot, 
  Tag, 
  Layers, 
  Code2 
} from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { toast } from 'sonner';

interface SkillSlideOverProps {
  skill: Skill | null;
  onClose: () => void;
  onDeleteSkill: (skillId: string) => void;
  onUpdateCategory: (skillId: string, newCategory: CategoryType) => void;
  onUpdateNotes: (skillId: string, notes: string) => void;
}

export function SkillSlideOver({
  skill,
  onClose,
  onDeleteSkill,
  onUpdateCategory,
  onUpdateNotes,
}: SkillSlideOverProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'readme'>('overview');
  const [notesText, setNotesText] = useState(skill?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Sync notes when skill changes
  React.useEffect(() => {
    setNotesText(skill?.notes || '');
  }, [skill]);

  if (!skill) return null;

  const getCommand = (format: 'skills' | 'claude' | 'cursor') => {
    if (format === 'skills') return skill.install_command;
    if (format === 'claude') return `claude skill add ${skill.repo} --skill ${skill.name}`;
    if (format === 'cursor') return `agent skill add ${skill.repo} --skill ${skill.name}`;
    return skill.install_command;
  };

  const handleCopy = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    toast.success(`Comando ${formatName} copiado al portapapeles`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar la skill "${skill.title}" de tu repositorio?`)) {
      onDeleteSkill(skill.id);
      toast.success('Skill eliminada de tu catálogo');
      onClose();
    }
  };

  const compatibleAgents = skill.compatible_agents || ['Claude Code', 'Cursor', 'Antigravity', 'Codex', 'OpenCode'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div 
          className="w-screen max-w-xl border-l border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Nav */}
          <div>
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white tracking-tight">{skill.title}</h2>
                  <select
                    value={skill.category}
                    onChange={(e) => {
                      const newCat = e.target.value as CategoryType;
                      onUpdateCategory(skill.id, newCat);
                      toast.success(`Categoría actualizada a: ${newCat}`);
                    }}
                    className="rounded-md bg-zinc-800/90 px-2 py-0.5 text-[11px] font-medium text-zinc-200 border border-zinc-700 focus:outline-none focus:border-emerald-500"
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

                <a
                  href={skill.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-mono transition-colors"
                >
                  <GithubIcon className="h-3.5 w-3.5" />
                  <span>{skill.repo}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <button
                onClick={onClose}
                className="tap-active rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 mt-4 border-b border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-emerald-400 text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Resumen & Instalación
              </button>
              {skill.raw_content && (
                <button
                  onClick={() => setActiveTab('readme')}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === 'readme'
                      ? 'border-emerald-400 text-white font-semibold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  README / Documentación
                </button>
              )}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="mt-5 space-y-5">
                {/* Personal Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Mis Notas Personales
                    </h4>
                    <button
                      onClick={() => {
                        setIsSavingNotes(true);
                        onUpdateNotes(skill.id, notesText);
                        toast.success('Notas guardadas');
                        setTimeout(() => setIsSavingNotes(false), 500);
                      }}
                      className="tap-active text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      {isSavingNotes ? 'Guardando...' : 'Guardar notas'}
                    </button>
                  </div>
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Escribe por qué guardaste esta skill, en qué proyectos la usaste o consejos rápidos..."
                    rows={3}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Propósito
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                    {skill.description}
                  </p>
                </div>

                {/* Allowed Tools */}
                {skill.allowed_tools && skill.allowed_tools.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Herramientas Requeridas (`allowed-tools`)</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.allowed_tools.map((tool, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-emerald-950/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-mono text-emerald-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compatible Agents */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Agentes Compatibles</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {compatibleAgents.map((agent, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-zinc-800/60 border border-zinc-700/60 px-2 py-0.5 text-[11px] text-zinc-300"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Installation Commands in multiple formats */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Comandos de Instalación</span>
                  </h4>

                  <div className="space-y-2">
                    {/* skills CLI */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span className="font-medium text-zinc-300">Universal (`npx skills`)</span>
                        <button
                          onClick={() => handleCopy(getCommand('skills'), 'skills')}
                          className="tap-active text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          {copiedFormat === 'skills' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedFormat === 'skills' ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      <code className="text-[11px] font-mono text-zinc-200 block truncate">
                        {getCommand('skills')}
                      </code>
                    </div>

                    {/* Direct Prompt */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                        <span className="font-medium text-amber-300">Prompt Directo (Sin Instalar)</span>
                        <button
                          onClick={() => {
                            const promptText = `Por favor aplica las siguientes directrices y reglas de craft para esta tarea:

# Skill: ${skill.title} (${skill.name})
Repositorio: ${skill.repo}
Categoría: ${skill.category}

## Propósito:
${skill.description}
${skill.raw_content ? `\n## Reglas e instrucciones detalladas:\n${skill.raw_content.slice(0, 2000)}` : ''}`;
                            navigator.clipboard.writeText(promptText);
                            toast.success('Prompt copiado para usar en ChatGPT / Claude Web / Cursor');
                          }}
                          className="tap-active text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copiar Prompt para Chats</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Copia las instrucciones de la skill para pegarlas en cualquier chat de IA sin necesidad de instalar en consola.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {skill.tags && skill.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      Etiquetas
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skill.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[11px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Full README */}
            {activeTab === 'readme' && skill.raw_content && (
              <div className="mt-5">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
                  {skill.raw_content}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-800 mt-6 flex items-center justify-between">
            <button
              onClick={handleDelete}
              className="tap-active flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Eliminar skill</span>
            </button>

            <button
              onClick={onClose}
              className="tap-active rounded-lg bg-zinc-800 px-4 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
            >
              Cerrar panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
