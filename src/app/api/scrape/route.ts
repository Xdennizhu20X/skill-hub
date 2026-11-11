import { NextRequest, NextResponse } from 'next/server';
import { CategoryType, ScrapedRepoResult, ScrapedSkillItem } from '@/types/skills';

function parseGitHubUrl(input: string): { owner: string; repo: string; branch?: string; path?: string } | null {
  const trimmed = input.trim();
  
  // Format: owner/repo
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    const [owner, repo] = trimmed.split('/');
    return { owner, repo };
  }

  try {
    const url = new URL(trimmed);
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

function guessCategory(text: string, topics: string[] = []): CategoryType {
  const combined = (text + ' ' + topics.join(' ')).toLowerCase();

  // 1. Security & Audits (High priority: pen-test, vulnerabilities, security reviews)
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

  // 4. Mobile & Native (React Native, Expo, iOS, Android, Touch)
  if (/\b(mobile|expo|react-native|ios|android|swift|kotlin|touch-action|gestures|haptics|viewport)\b/i.test(combined)) {
    return 'mobile';
  }

  // 5. Design & UI (Notice word boundaries: \bui\b and \bux\b so words like "guidance" or "suite" don't match!)
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
    .replace(/^#+\s+/gm, '') // Remove heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/[*_`]/g, '') // Remove bold/italic/code markers
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL de GitHub requerida' }, { status: 400 });
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'URL no válida. Ingresa un enlace de GitHub (ej. https://github.com/emilkowalski/skills o owner/repo)' },
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
      // README not found or network issue
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

        // Find all files ending in SKILL.md
        const skillFiles = tree.filter(f => f.type === 'blob' && f.path.toLowerCase().endsWith('skill.md'));

        for (const file of skillFiles) {
          // Path format example: skills/animate/SKILL.md or SKILL.md
          const parts = file.path.split('/');
          let skillName = '';
          if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === 'skill.md') {
            skillName = parts[parts.length - 2];
          } else {
            skillName = repo;
          }

          // Fetch first 500 characters of the SKILL.md to extract description from frontmatter
          let skillDesc = repoDescription;
          try {
            const rawSkillRes = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file.path}`
            );
            if (rawSkillRes.ok) {
              const rawText = await rawSkillRes.text();
              const descMatch = rawText.match(/description:\s*["']?([^"'\n\r]+)["']?/i);
              if (descMatch && descMatch[1]) {
                skillDesc = descMatch[1].trim();
              } else {
                // Find first non-empty paragraph
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
      raw_readme: readmeText.slice(0, 3000), // First 3000 chars of README
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al procesar el repositorio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
