# SkillsHub ⚡

> **Repositorio y Gestor Inteligente de Skills para Agentes de IA (Claude Code, Cursor, Antigravity, Codex, etc.)**

SkillsHub resuelve el problema de los enlaces perdidos en WhatsApp y notas: registra repositorios de GitHub con un clic, extrae su README y skills automáticamente, te permite filtrar por categorías (Diseño, Animación, Anti-Slop, Mobile...) y generar comandos de instalación por lote para cualquier proyecto.

---

## ✨ Características Principales

1. **Ingesta Inteligente desde GitHub (`/api/scrape`):**
   - Pega cualquier enlace de GitHub o formato `owner/repo`.
   - Lee el `README.md` e inspecciona los archivos `SKILL.md` del repositorio.
   - Detecta sub-skills individuales (ej. las 15 skills de `emilkowalski/skills` o las 6 de `anti-slop`).
   - Sugiere categorías automáticas (*Diseño*, *Animación*, *Clean Code*, *Mobile*, etc.) y comandos listos para instalar.

2. **Stack Builder (Multi-selección Inteligente):**
   - Marca las casillas de las skills que necesitas para tu proyecto.
   - Genera comandos combinados optimizados:
     - `npx skills add repo1 --skill a b && npx skills add repo2 --skill c`
     - Soporte para **Claude Code**, **Cursor / Codex**, **Bash Script** y **JSON (`skills-lock.json`)**.
   - Botón *"Seleccionar todas las de esta categoría"* para armar stacks en 1 segundo.

3. **Packs Preconfigurados:**
   - **✨ Emil Kowalski Design & Motion Pack**: Microinteracciones, gestos y diseño de ingeniería.
   - **🛡️ Anti-Slop Production Clean Pack**: Código y UI limpios sin slop de IA, contraste WCAG y textos directos.
   - **📱 Mobile-First Native Web Pack**: UX móvil refinada sin hover pegajoso ni destellos de tap.
   - Posibilidad de crear y guardar tus propios Packs para nuevos proyectos.

4. **Diseñado con Emil Kowalski & Anti-Slop Principles:**
   - Paleta sobria y contrastada (WCAG AA).
   - Microinteracciones físicas con `active:scale-[0.98]` y respuesta táctil.
   - Mobile-First: Interfaz fluida y optimizada para agregar enlaces desde el smartphone.

5. **Multi-usuario y Persistencia Dual:**
   - **Modo Local:** Funciona inmediatamente sin configurar nada (guarda en el navegador y arranca con catálogo pre-cargado).
   - **Modo Cloud (Supabase):** Permite sincronización permanente en la nube y compartir tu catálogo con otros miembros del equipo.

---

## 🚀 Despliegue en Vercel (1-Click)

### Paso 1: Subir a GitHub
```bash
cd skills-hub
git add .
git commit -m "feat: initial commit of SkillsHub"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/skills-hub.git
git push -u origin main
```

### Paso 2: Importar en Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión.
2. Haz clic en **"Add New..."** > **"Project"** y selecciona tu repositorio `skills-hub`.
3. Haz clic en **Deploy**.

---

## 🗄️ Configuración de Supabase (Opcional, para Multi-usuario)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Entra en el **SQL Editor** de tu proyecto Supabase y ejecuta el script:
   - Archivo: `supabase/schema.sql`
3. En el panel de Vercel (o en tu `.env.local` para desarrollo local), añade las variables de entorno:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. ¡Listo! SkillsHub detectará automáticamente Supabase y cambiará al indicador **Cloud**.

---

## 💻 Desarrollo Local

```bash
cd skills-hub
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
