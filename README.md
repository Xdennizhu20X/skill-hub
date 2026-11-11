# SkillsHub ⚡

<p align="center">
  <img src="https://raw.githubusercontent.com/cloudflare/security-audit-skill/main/docs/assets/banner.png" alt="SkillsHub Banner" width="100%" style="border-radius: 12px;" onerror="this.style.display='none'" />
</p>

<p align="center">
  <strong>El Gestor y Estudio Arquitectónico Inteligente de Skills para Agentes de Código de IA</strong><br>
  <em>Diseñado para Claude Code, Antigravity CLI, Cursor, Codex y OpenCode.</em>
</p>

<p align="center">
  <a href="#-despliegue-en-1-clic-con-vercel">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.0-20232A?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/License-MIT-emerald?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/Craft-Emil_Kowalski_Polish-amber?style=flat-square" alt="Emil Polish" />
</p>

---

## 💡 El Problema que Resuelve

¿Te ha pasado que alguien te envía un enlace o skill genial por **WhatsApp**, Discord o Twitter, lo guardas en "Mensajes guardados" y jamás vuelves a encontrarlo cuando empiezas un proyecto nuevo?

**SkillsHub** convierte ese "cementerio de enlaces" en una biblioteca viva:
1. **Pega cualquier enlace o mensaje de WhatsApp:** El extractor lee el `README.md` o los archivos `SKILL.md` del repositorio, identifica las herramientas requeridas (`allowed-tools`), disparadores (*triggers*) y reglas clave.
2. **Audita tus proyectos existentes:** Sube tu archivo `skills-lock.json` para visualizar tu cobertura arquitectónica y descubrir qué capas esenciales te faltan (Seguridad, Calidad/Anti-Slop, Optimización Móvil).
3. **Instala Stacks Completos en 1 Clic:** Selecciona un Pack por Tipo de Proyecto y obtén comandos combinados optimizados para tu terminal o scripts directos de Windows/macOS.

---

## 🚀 Despliegue en 1-Clic con Vercel

Puedes desplegar tu propio centro de control de Skills en tu cuenta de Vercel completamente gratis:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU_USUARIO/skills-hub)

> **Nota:** SkillsHub funciona al instante sin necesidad de configurar ninguna base de datos (utiliza almacenamiento local con datos semilla integrados). Si deseas sincronización en la nube multidispositivo, solo agrega las variables de entorno de Supabase.

---

## ✨ Características Destacadas

### 1. Ingesta Inteligente & Parseo de WhatsApp (`/api/scrape`)
- Pega enlaces limpios de GitHub (`owner/repo`) o mensajes completos de chats de WhatsApp.
- Detección profunda de repositorios con múltiples skills (como `emilkowalski/skills` o `anti-slop`).
- Clasificación automática por categorías: *Seguridad*, *Diseño & UI*, *Animación & Motion*, *Anti-Slop*, *Mobile & Nativo*, *Frontend*, *Backend*, etc.

### 2. README Inteligente: Disparadores & Reglas Clave
- **🎯 Disparadores (Triggers):** Extrae automáticamente *cuándo* y *con qué prompts* debe activarse la skill (por ejemplo: "auditoría en endpoints", "animación de listas escalonadas", "prevenir zoom en móviles").
- **⚡ Reglas Clave & Guardrails:** Identifica restricciones obligatorias (`REQUIRED`, `FORBIDDEN`, `NEVER`, `ALWAYS`) para garantizar el cumplimiento de buenas prácticas.
- **Prompt Directo para Chats:** Botón de un solo clic que genera el prompt optimizado para usar la skill directamente en ChatGPT, Claude Web o Cursor sin necesidad de instalarla en consola.

### 3. Architecture Studio & Live Terminal
- **Blueprint Arquitectónico:** Visualiza en tiempo real las capas activas de tu proyecto: Capa de Seguridad, Capa de Calidad/Anti-Slop, Capa de UI Craft y Capa de Plataforma.
- **Terminal en Vivo Interactiva:** Simula la ejecución de los comandos de instalación combinados con sincronización instantánea y retroalimentación sonora táctil.
- **Exportación Versátil:** Genera y descarga archivos `AGENTS.md` para el contexto de tus agentes y scripts de PowerShell (`.ps1`) para Windows.

### 4. Packs por Tipo de Proyecto (1-Click Blueprints)
- 🎨 **Frontend UI Craft & Motion:** Microinteracciones, física de resortes, diseño Apple y filtro visual anti-slop.
- 🛡️ **Security, Hardening & Audit:** Blindaje para producción con Cloudflare Security Audit e higiene de código.
- 📱 **Mobile-First & Native Polish:** Resuelve viewport 100dvh, gestos 1:1 táctiles y soporte para Expo / React Native.
- ⚡ **Fullstack Next.js Production:** El set completo con seguridad, accesibilidad, toasts reactivos con Sonner y copywriting humano.

### 5. Auditoría Inversa con `skills-lock.json`
- Arrastra o pega tu archivo `skills-lock.json` desde cualquier proyecto existente.
- Evalúa tu nivel de cobertura en 4 dimensiones críticas.
- Detecta vulnerabilidades y brechas ausentes con sugerencias inmediatas y botón de un clic: *"Importar + Cerrar Brechas"*.

---

## 🤖 Agentes de IA Compatibles

SkillsHub genera instrucciones y comandos listos para cualquier entorno moderno de codificación con IA:

| Agente | Comando Generado | Integración |
|---|---|---|
| **Claude Code** | `claude skill add <repo> --skill <name>` | CLI nativo de Anthropic |
| **Antigravity CLI** | `agy skill add <repo> --skill <name>` | Configuración `.agent` y skills |
| **Cursor / Codex** | `agent skill add <repo> --skill <name>` | `.cursorrules` / prompts directos |
| **OpenCode / Pi** | `pi install git:github.com/<repo>` | Extensiones y plugins |
| **Universal CLI** | `npx skills add <repo> --skill <name>` | Instalador multiplataforma |

---

## 🛠️ Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/skills-hub.git
cd skills-hub

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗄️ Persistencia Dual (Local + Supabase Opcional)

Por defecto, SkillsHub opera en modo **Local-First**: tus datos, selecciones y notas se guardan en el navegador y arranca con un catálogo curado.

Si deseas persistencia en la nube y sincronización entre dispositivos:
1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ejecuta el script SQL ubicado en `supabase/schema.sql` en el SQL Editor de Supabase.
3. Configura tus variables de entorno en `.env.local` o en el panel de Vercel:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. SkillsHub detectará la conexión y activará el indicador **Cloud** automáticamente.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas sugerir una nueva skill preconfigurada, un nuevo pack arquitectónico o mejoras en el motor de análisis:

1. Haz un Fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-skill`).
3. Haz commit de tus cambios (`git commit -m 'feat: añadir skill xyz'`).
4. Haz push a la rama (`git push origin feature/nueva-skill`).
5. Abre un Pull Request.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Consulta el archivo `LICENSE` para más información.
