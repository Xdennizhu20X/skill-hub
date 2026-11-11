import { NextRequest, NextResponse } from 'next/server';
import { CategoryType, ScrapedRepoResult, ScrapedSkillItem } from '@/types/skills';

function extractGitHubUrlFromText(text: string): string | null {
  const trimmed = text.trim();

  // 1. Direct owner/repo
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Extract github.com URL from WhatsApp or mixed text
  const urlMatch = trimmed.match(/https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:[^\s)]*)?/i);
  if (urlMatch) {
    return urlMatch[0];
  }

  return null;
}

function parseGitHubUrl(input: string): { owner: string; repo: string; branch?: string; path?: string } | null {
  const extracted = extractGitHubUrlFromText(input);
  if (!extracted) return null;

  if (!extracted.startsWith('http')) {
    const [owner, repo] = extracted.split('/');
    return { owner, repo };
  }

  try {
    const url = new URL(extracted);
    if (!url.hostname.includes('github.com')) return null;
    
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');

    let branch: string | undefined;
    let path: string | undefined;

    if (parts[2] === 'tree' || parts[2] === 'blob') {
      branch = parts[3];
      path = parts.slice(4).join('/');
    }

    return { owner, repo, branch, path };
  } catch {
    return null;
  }
}

function detectTechnologies(text: string, topics: string[] = []): string[] {
  const combined = (text + ' ' + topics.join(' ')).toLowerCase();
  const techs: string[] = [];

  if (/\b(nextjs|next\.js)\b/i.test(combined)) techs.push('nextjs');
  if (/\b(react|reactjs)\b/i.test(combined)) techs.push('react');
  if (/\b(typescript|ts)\b/i.test(combined)) techs.push('typescript');
  if (/\b(swift|swiftui|ios)\b/i.test(combined)) techs.push('swift');
  if (/\b(expo|react-native)\b/i.test(combined)) techs.push('expo');
  if (/\b(tailwind|tailwindcss)\b/i.test(combined)) techs.push('tailwind');
  if (/\b(cloudflare|workers|d1|kv)\b/i.test(combined)) techs.push('cloudflare');
  if (/\b(python|py|fastapi|django)\b/i.test(combined)) techs.push('python');
  if (/\b(node|nodejs|express)\b/i.test(combined)) techs.push('node');

  return techs;
}

function parseAllowedTools(rawContent: string): string[] {
  const match = rawContent.match(/allowed-tools:\s*([^\n\r]+)/i);
  if (!match || !match[1]) return [];
  return match[1]
    .split(/[\s,]+/)
    .map(t => t.trim())
    .filter(Boolean);
}

function parseTriggers(rawContent: string): string[] {
  const triggers: string[] = [];

  // 1. Look for explicit triggers line or section: "triggers on:", "use when:", "when to use:"
  const triggerPatterns = [
    /triggers\s+on\s*[:—–-]\s*([^\n\r]+)/i,
    /use\s+when\s*[:—–-]\s*([^\n\r]+)/i,
    /when\s+to\s+use\s*[:—–-]\s*([^\n\r]+)/i,
    /cuándo\s+usar\s*[:—–-]\s*([^\n\r]+)/i,
  ];

  for (const pattern of triggerPatterns) {
    const match = rawContent.match(pattern);
    if (match && match[1]) {
      const parts = match[1]
        .split(/[,;•|]+/)
        .map(t => t.trim().replace(/^["'`]|["'`]$/g, ''))
        .filter(t => t.length > 2 && t.length < 80);
      triggers.push(...parts);
    }
  }

  // 2. Look for bullet points under headings like ## Triggers, ## When to use
  const sectionMatch = rawContent.match(/##\s*(?:Triggers|When to use|Cuándo usar|Use Cases|Casos de uso)[\s\S]*?(?=\n##|$)/i);
  if (sectionMatch) {
    const lines = sectionMatch[0].split('\n');
    for (const line of lines) {
      const bulletMatch = line.match(/^\s*[-*+]\s+(.+)/);
      if (bulletMatch && bulletMatch[1]) {
        const cleaned = bulletMatch[1].replace(/[*_`]/g, '').trim();
        if (cleaned.length > 3 && cleaned.length < 90 && !triggers.includes(cleaned)) {
          triggers.push(cleaned);
        }
      }
    }
  }

  return Array.from(new Set(triggers)).slice(0, 6);
}

function parseKeyRules(rawContent: string): string[] {
  const rules: string[] = [];
  const lines = rawContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines starting with NEVER, ALWAYS, FORBIDDEN, REQUIRED, MUST, PROHIBIDO, SIEMPRE
    const ruleMatch = trimmed.match(/^[-*+]?\s*(?:\*\*)?(NEVER|ALWAYS|FORBIDDEN|REQUIRED|MUST|PROHIBIDO|SIEMPRE|OBLIGATORIO)[:\s\*\-]+([^\n\r]+)/i);
    if (ruleMatch && ruleMatch[2]) {
      const type = ruleMatch[1].toUpperCase();
      const content = ruleMatch[2].replace(/[*_`#]/g, '').trim();
      if (content.length > 5 && content.length < 120) {
        rules.push(`${type}: ${content}`);
      }
    } else {
      // Check for numbered rules like R-01, R-02 or Rule 1
      const rMatch = trimmed.match(/^[-*#\s]*(?:R-\d+|Rule\s+\d+|Regla\s+\d+)[:\s—–-]+([^\n\r]+)/i);
      if (rMatch && rMatch[1]) {
        const cleaned = rMatch[1].replace(/[*_`]/g, '').trim();
        if (cleaned.length > 5 && cleaned.length < 120) {
          rules.push(cleaned);
        }
      }
    }
  }

  return Array.from(new Set(rules)).slice(0, 6);
}

function guessCategory(text: string, topics: string[] = []): CategoryType {
  const combined = (text + ' ' + topics.join(' ')).toLowerCase();

  // 1. Security & Audits
  if (/\b(security|vulnerability|vulnerabilities|audit|pen-test|pentest|cve|exploit|hardening|auth|oauth|secret|encryption|firewall)\b/i.test(combined)) {
    return 'security';
  }

  // 2. Anti-Slop & Code Quality / Hygiene
  if (/\b(anti-slop|antislop|code-smell|refactoring|code-hygiene|linter|code-review)\b/i.test(combined)) {
    return 'clean-code';
  }

  // 3. Motion & Animation
  if (/\b(motion|animation|animations|spring|springs|transition|transitions|choreograph|choreography|framer-motion|keyframes)\b/i.test(combined)) {
    return 'animation';
  }

  // 4. Mobile & Native
  if (/\b(mobile|expo|react-native|ios|android|swift|kotlin|touch-action|gestures|haptics|viewport)\b/i.test(combined)) {
    return 'mobile';
  }

  // 5. Design & UI
  if (/\b(design|ui|ux|css|tailwind|palette|colors|typography|theme|styling|interface|component|components|glassmorphism|layout)\b/i.test(combined)) {
    return 'design';
  }

  // 6. DevOps & Cloud
  if (/\b(devops|docker|kubernetes|k8s|ci-cd|pipeline|deploy|deployment|terraform|cloudflare|aws|gcp|serverless)\b/i.test(combined)) {
    return 'devops';
  }

  // 7. Testing & QA
  if (/\b(test|testing|tests|qa|jest|vitest|playwright|cypress|stress-test|benchmark)\b/i.test(combined)) {
    return 'testing';
  }

  // 8. Prompting & AI Agents
  if (/\b(prompt|prompts|prompting|agent|agents|system-prompt|llm|claude|gemini|openai|antigravity)\b/i.test(combined)) {
    return 'prompting';
  }

  // 9. Frontend & Web
  if (/\b(frontend|react|nextjs|next\.js|vue|svelte|html|dom|browser)\b/i.test(combined)) {
    return 'frontend';
  }

  // 10. Backend & APIs
  if (/\b(backend|api|apis|server|database|databases|sql|postgres|postgresql|prisma|supabase|graphql|rest)\b/i.test(combined)) {
    return 'backend';
  }

  return 'other';
}

function cleanMarkdownText(md: string): string {
  return md
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Texto o enlace de GitHub requerido' }, { status: 400 });
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'No se encontró un enlace de GitHub válido en el texto. Puedes pegar un enlace directo o un mensaje de WhatsApp que contenga el enlace.' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillsHub-App',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch Repository Info
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return NextResponse.json({ error: `Repositorio no encontrado: ${owner}/${repo}` }, { status: 404 });
      }
      return NextResponse.json({ error: `Error de GitHub (${repoRes.status})` }, { status: repoRes.status });
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';
    const topics: string[] = repoData.topics || [];
    const stars: number = repoData.stargazers_count || 0;
    const repoDescription: string = repoData.description || 'Repositorio de skills para agentes de IA';

    // 2. Fetch README
    let readmeText = '';
    try {
      const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`);
      if (readmeRes.ok) {
        readmeText = await readmeRes.text();
      }
    } catch {
      // README not found
    }

    // 3. Search for SKILL.md files in repository tree
    const detectedSkills: ScrapedSkillItem[] = [];

    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
      );

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        const tree: Array<{ path: string; type: string }> = treeData.tree || [];

        const skillFiles = tree.filter(f => f.type === 'blob' && f.path.toLowerCase().endsWith('skill.md'));

        for (const file of skillFiles) {
          const parts = file.path.split('/');
          let skillName = '';
          if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === 'skill.md') {
            skillName = parts[parts.length - 2];
          } else {
            skillName = repo;
          }

          let skillDesc = repoDescription;
          let allowedTools: string[] = [];
          let triggers: string[] = [];
          let keyRules: string[] = [];

          try {
            const rawSkillRes = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`
            );
            if (rawSkillRes.ok) {
              const rawText = await rawSkillRes.text();
              allowedTools = parseAllowedTools(rawText);
              triggers = parseTriggers(rawText);
              keyRules = parseKeyRules(rawText);

              const descMatch = rawText.match(/description:\s*["']?([^"'\n\r]+)["']?/i);
              if (descMatch && descMatch[1]) {
                skillDesc = descMatch[1].trim();
              } else {
                const lines = rawText.split('\n').filter(l => !l.startsWith('---') && !l.startsWith('#') && l.trim().length > 10);
                if (lines[0]) {
                  skillDesc = cleanMarkdownText(lines[0].slice(0, 200));
                }
              }
            }
          } catch {
            // Keep default
          }

          const cat = guessCategory(skillName + ' ' + skillDesc, topics);
          const techs = detectTechnologies(skillName + ' ' + skillDesc, topics);
          const formattedTitle = skillName
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          detectedSkills.push({
            name: skillName,
            title: formattedTitle,
            description: skillDesc,
            category: cat,
            tags: [skillName, cat, owner],
            technologies: techs,
            allowed_tools: allowedTools,
            triggers: triggers.length > 0 ? triggers : undefined,
            key_rules: keyRules.length > 0 ? keyRules : undefined,
            skill_path: file.path,
            install_command: `npx skills add ${owner}/${repo} --skill ${skillName}`,
          });
        }
      }
    } catch {
      // Tree query failed
    }

    // 4. If no SKILL.md was found via tree, treat the repository itself as a skill
    if (detectedSkills.length === 0) {
      const cat = guessCategory(repo + ' ' + repoDescription, topics);
      const techs = detectTechnologies(repo + ' ' + repoDescription, topics);
      const allowedTools = parseAllowedTools(readmeText);
      const triggers = parseTriggers(readmeText);
      const keyRules = parseKeyRules(readmeText);
      const formattedTitle = repo
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      detectedSkills.push({
        name: repo,
        title: formattedTitle,
        description: repoDescription,
        category: cat,
        tags: [...topics.slice(0, 4), cat, owner].filter(Boolean),
        technologies: techs,
        allowed_tools: allowedTools,
        triggers: triggers.length > 0 ? triggers : undefined,
        key_rules: keyRules.length > 0 ? keyRules : undefined,
        install_command: `npx skills add ${owner}/${repo}`,
      });
    }

    const result: ScrapedRepoResult = {
      repo: `${owner}/${repo}`,
      repo_url: `https://github.com/${owner}/${repo}`,
      owner,
      name: repo,
      description: repoDescription,
      stars,
      detected_skills: detectedSkills,
      raw_readme: readmeText.slice(0, 4000),
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al procesar el repositorio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
