import { Skill } from "@/types/skills";

export interface PopularSkillDirectoryItem {
  name: string;
  title: string;
  repo: string;
  author: string;
  category: string;
  description: string;
  stars: string;
  tags: string[];
  install_command: string;
}

export const POPULAR_SKILLS_DIRECTORY: PopularSkillDirectoryItem[] = [
  {
    name: 'security-audit',
    title: 'Security Audit & Vulnerabilities',
    repo: 'cloudflare/security-audit-skill',
    author: 'cloudflare',
    category: 'security',
    description: 'Auditoría integral de vulnerabilidades, pen-testing y seguridad para código, APIs, CLI tools y microservicios.',
    stars: '2.4k',
    tags: ['security', 'audit', 'vulnerability', 'cloudflare'],
    install_command: 'npx skills add cloudflare/security-audit-skill',
  },
  {
    name: 'vercel-optimize',
    title: 'Vercel & Next.js Performance Optimizer',
    repo: 'vercel-labs/agent-skills',
    author: 'vercel-labs',
    category: 'frontend',
    description: 'Optimización de Core Web Vitals, Server Components, caching de Next.js y Edge middleware.',
    stars: '5.1k',
    tags: ['vercel', 'nextjs', 'performance', 'caching'],
    install_command: 'npx skills add vercel-labs/agent-skills --skill vercel-optimize',
  },
  {
    name: 'supabase-db-expert',
    title: 'Supabase RLS & Database Architect',
    repo: 'supabase/agent-skills',
    author: 'supabase',
    category: 'backend',
    description: 'Políticas estrictas de Row Level Security (RLS), índices optimizados en Postgres y diseño de esquemas relacionales.',
    stars: '3.8k',
    tags: ['supabase', 'postgres', 'rls', 'sql'],
    install_command: 'npx skills add supabase/agent-skills --skill supabase-db-expert',
  },
  {
    name: 'apple-design',
    title: 'Apple Design & Fluid Motion',
    repo: 'emilkowalski/skills',
    author: 'emilkowalski',
    category: 'design',
    description: 'Interfaces fluidas estilo iOS: resortes físicos, interacción interrumpible y tipografía óptica.',
    stars: '4.2k',
    tags: ['apple', 'design-engineering', 'gestures'],
    install_command: 'npx skills add emilkowalski/skills --skill apple-design',
  },
  {
    name: 'antislop-ui',
    title: 'Anti-Slop UI Craftsmanship',
    repo: 'miqdadbadjuber/anti-slop',
    author: 'miqdadbadjuber',
    category: 'clean-code',
    description: 'Filtro contra degradados cliché, sombras excesivas y diseño genérico generado por IA.',
    stars: '1.9k',
    tags: ['anti-slop', 'ui-craft', 'quality'],
    install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop-ui',
  },
  {
    name: 'tailwind-v4-expert',
    title: 'Tailwind CSS v4 Modern Theme',
    repo: 'tailwindlabs/skills',
    author: 'tailwindlabs',
    category: 'design',
    description: 'Directivas modernas de Tailwind CSS v4 con variables CSS nativas, temas fluidos y container queries.',
    stars: '3.1k',
    tags: ['tailwind', 'css', 'design-tokens'],
    install_command: 'npx skills add tailwindlabs/skills --skill tailwind-v4-expert',
  },
  {
    name: 'anthropic-tool-use',
    title: 'Anthropic Tool Use & Function Calling',
    repo: 'anthropics/skills',
    author: 'anthropics',
    category: 'prompting',
    description: 'Diseño de schemas de herramientas precisos, manejo de errores de llamada a funciones y prompts para Claude.',
    stars: '6.4k',
    tags: ['anthropic', 'claude', 'tool-use', 'agents'],
    install_command: 'npx skills add anthropics/skills --skill anthropic-tool-use',
  },
  {
    name: 'mobile-native',
    title: 'Mobile Native Web Polish',
    repo: 'emilkowalski/skills',
    author: 'emilkowalski',
    category: 'mobile',
    description: 'Ajustes esenciales para que una web app se sienta nativa en teléfonos móviles sin hover pegajoso ni destellos de tap.',
    stars: '4.2k',
    tags: ['mobile', 'responsive', 'touch'],
    install_command: 'npx skills add emilkowalski/skills --skill mobile-native',
  },
];
