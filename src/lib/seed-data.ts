import { CategoryDef, Skill, SkillPack } from "@/types/skills";

export const CATEGORIES: CategoryDef[] = [
  { id: 'all', label: 'Todas las Skills', iconName: 'Layers', description: 'Catálogo completo' },
  { id: 'security', label: 'Seguridad & Auditoría', iconName: 'ShieldAlert', description: 'Vulnerabilidades, pen-testing y seguridad' },
  { id: 'design', label: 'Diseño & UI', iconName: 'Palette', description: 'Craft visual, sistemas y polish' },
  { id: 'animation', label: 'Animación & Motion', iconName: 'Sparkles', description: 'Microinteracciones, resortes y gestos' },
  { id: 'clean-code', label: 'Anti-Slop & Calidad', iconName: 'ShieldCheck', description: 'Código limpio, sin slop ni ruido' },
  { id: 'mobile', label: 'Mobile & Nativo', iconName: 'Smartphone', description: 'Touch, viewport y UX móvil real' },
  { id: 'frontend', label: 'Frontend & Web', iconName: 'Globe', description: 'React, Next.js y ecosistema web' },
  { id: 'backend', label: 'Backend & APIs', iconName: 'Server', description: 'Servicios, bases de datos y arquitectura' },
  { id: 'devops', label: 'DevOps & Cloud', iconName: 'Cloud', description: 'Infraestructura, CI/CD y despliegue' },
  { id: 'testing', label: 'Testing & QA', iconName: 'CheckCircle2', description: 'Stress test y validación' },
  { id: 'prompting', label: 'Agentes & Prompts', iconName: 'Bot', description: 'Reglas y orquestación de IA' },
];

export const INITIAL_SKILLS: Skill[] = [
  // Cloudflare Security Skills
  {
    id: 'cloudflare-security-audit',
    name: 'security-audit',
    title: 'Security Audit & Vulnerabilities',
    repo: 'cloudflare/security-audit-skill',
    repo_url: 'https://github.com/cloudflare/security-audit-skill',
    description: 'Revisión exhaustiva de vulnerabilidades y seguridad para código, APIs, servicios, CLI tools y demonios. Ideal para auditorías y pen-tests.',
    category: 'security',
    tags: ['security', 'audit', 'vulnerability', 'cloudflare', 'pen-test'],
    author: 'cloudflare',
    triggers: [
      'auditoría de seguridad en endpoints y APIs',
      'revisión de vulnerabilidades y CVEs',
      'validación de tokens JWT y autenticación',
      'inspección antes de desplegar a producción'
    ],
    key_rules: [
      'REQUIRED: Validar saneamiento estricto en inputs de usuario',
      'NEVER: Exponer claves secretas o variables de entorno al cliente',
      'REQUIRED: Implementar headers de seguridad HTTP y control CORS',
      'FORBIDDEN: Confiar en validaciones exclusivas de frontend'
    ],
    install_command: 'npx skills add cloudflare/security-audit-skill',
    is_favorite: true,
    created_at: '2026-11-11T11:00:00Z',
  },
  // Emil Kowalski Design & Motion Skills
  {
    id: 'emil-animate',
    name: 'animate',
    title: 'Animate from Scratch',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/animate/SKILL.md',
    description: 'Construye animaciones desde cero tomando decisiones en orden de sensación: si debe animarse, curvas físicas, duración y salidas limpias.',
    category: 'animation',
    tags: ['animation', 'motion', 'transitions', 'springs'],
    author: 'emilkowalski',
    triggers: [
      'animar un componente o modal',
      'añadir transiciones suaves de entrada y salida',
      'hacer que una interfaz se sienta viva y fluida',
      'arreglar movimiento que se siente mecánico o rígido'
    ],
    key_rules: [
      'REQUIRED: Usar curvas físicas tipo resorte antes que lineales',
      'REQUIRED: Animar únicamente propiedades transform y opacity',
      'ALWAYS: Las animaciones deben ser 100% interrumpibles',
      'REQUIRED: Respetar la preferencia prefers-reduced-motion'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill animate',
    is_favorite: true,
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-apple-design',
    name: 'apple-design',
    title: 'Apple Design & Fluid Motion',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/apple-design/SKILL.md',
    description: 'Filosofía Apple de interfaces fluidas adaptada a la web: resortes físicos, interacción interrumpible, materiales translúcidos y tipografía óptica.',
    category: 'design',
    tags: ['apple', 'design-engineering', 'gestures', 'haptics'],
    author: 'emilkowalski',
    triggers: [
      'diseñar interfaces con estética Apple / iOS',
      'materiales translúcidos con desenfoque de fondo',
      'tipografía con espaciado y tracking óptico',
      'interacciones basadas en física y momentum'
    ],
    key_rules: [
      'ALWAYS: Mantener continuidad física sin saltos de fotogramas',
      'REQUIRED: Feedback háptico sutil y no invasivo',
      'FORBIDDEN: Decoraciones excesivas sin propósito funcional',
      'REQUIRED: Paleta monocromática refinada con acento intencional'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill apple-design',
    is_favorite: true,
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-design-eng',
    name: 'emil-design-eng',
    title: 'Emil Kowalski Design Engineering',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/emil-design-eng/SKILL.md',
    description: 'Cultura de diseño de ingeniería de Emil Kowalski: cómo los detalles invisibles se acumulan, estado :active en botones y belleza como ventaja.',
    category: 'design',
    tags: ['design-system', 'ui-polish', 'taste', 'craft'],
    author: 'emilkowalski',
    triggers: [
      'pulir interfaces a nivel de diseño de ingeniería',
      'afinar estados hover, active y focus',
      'mejorar la sensación táctil y micro-detalles',
      'elevar el estándar visual de componentes'
    ],
    key_rules: [
      'REQUIRED: Respuesta visual inmediata (<100ms) al presionar',
      'REQUIRED: Estados hover, active y focus siempre definidos',
      'ALWAYS: Prevenir desplazamientos de layout involuntarios',
      'REQUIRED: Los detalles invisibles deben sentirse aunque no se noten a simple vista'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill emil-design-eng',
    is_favorite: true,
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-gestures',
    name: 'gestures',
    title: 'Touch Gestures & Sheets',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/gestures/SKILL.md',
    description: 'Interacciones de arrastre (drag), swipe y bottom sheets que siguen el dedo 1:1, mantienen inercia y son 100% interrumpibles.',
    category: 'animation',
    tags: ['gestures', 'drag', 'sheets', 'vaul', 'touch'],
    author: 'emilkowalski',
    triggers: [
      'bottom sheets y drawers interactivos',
      'deslizar para descartar (swipe-to-dismiss)',
      'arrastrar elementos con inercia física (drag-to-reorder)',
      'interacción táctil que no sigue el dedo correctamente'
    ],
    key_rules: [
      'REQUIRED: El elemento debe seguir el cursor o dedo 1:1',
      'ALWAYS: Permitir atrapar el elemento a mitad de su animación',
      'REQUIRED: Inercia con desaceleración natural al soltar',
      'REQUIRED: touch-action: none o manipulation configurado correctamente'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill gestures',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-choreograph',
    name: 'choreograph',
    title: 'Motion Choreography & Stagger',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/choreograph/SKILL.md',
    description: 'Coordina múltiples elementos que animan juntos (listas escalonadas, héroes, transiciones modales) para que se lea como un movimiento natural.',
    category: 'animation',
    tags: ['choreography', 'stagger', 'orchestration', 'framer-motion'],
    author: 'emilkowalski',
    triggers: [
      'entradas escalonadas en listas o tarjetas',
      'transición coordinada entre pantallas o pasos',
      'animación de encabezados donde varios elementos coinciden',
      'sensación de que demasiadas cosas se mueven al mismo tiempo'
    ],
    key_rules: [
      'REQUIRED: Escalonamiento (stagger) sutil entre 20ms y 50ms',
      'ALWAYS: Un elemento ancla debe permanecer estable como punto de referencia',
      'FORBIDDEN: Animar más de 5 elementos en cascada no coordinada',
      'REQUIRED: La animación completa de entrada no debe exceder 400ms'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill choreograph',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-animation-performance',
    name: 'animation-performance',
    title: 'Animation Performance & 60fps',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/animation-performance/SKILL.md',
    description: 'Mantén las animaciones dentro del frame budget: propiedades solo compuestas (transform/opacity), fuera del hilo principal y sin layout shifts.',
    category: 'animation',
    tags: ['performance', '60fps', 'compositor', 'gpu'],
    author: 'emilkowalski',
    triggers: [
      'animaciones que dan tirones o pierden fotogramas',
      'decidir si usar CSS, WAAPI o JavaScript para movimiento',
      'optimizar uso de GPU y capas compuestas',
      'reducir recálculos de layout en el navegador'
    ],
    key_rules: [
      'REQUIRED: Mantenerse dentro del presupuesto de 16.6ms por fotograma',
      'FORBIDDEN: Animar propiedades que causen reflow (width, height, top, left)',
      'ALWAYS: Usar will-change únicamente cuando sea necesario y limpiarlo',
      'REQUIRED: Preferir el hilo del compositor frente al hilo principal'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill animation-performance',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-ask-sonner',
    name: 'ask-sonner',
    title: 'Sonner Toasts Guide',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/ask-sonner/SKILL.md',
    description: 'Guía definitiva de Sonner (la librería toast de React creada por Emil): promesas, temas oscuros, posicionamiento y feedback no invasivo.',
    category: 'frontend',
    tags: ['sonner', 'toasts', 'react', 'feedback'],
    author: 'emilkowalski',
    triggers: [
      'notificaciones toast en aplicaciones React / Next.js',
      'retroalimentación de promesas y operaciones asíncronas',
      'personalizar posición, temas y estilos de toasts',
      'evitar que los toasts tapen modales o menús'
    ],
    key_rules: [
      'REQUIRED: Incluir un único componente Toaster en el layout raíz',
      'ALWAYS: Utilizar toast.promise para feedback asíncrono de carga',
      'REQUIRED: Respetar el contraste y modo oscuro del sistema',
      'FORBIDDEN: Acumular más de 3 toasts simultáneos sin límite visual'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill ask-sonner',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-mobile-native',
    name: 'mobile-native',
    title: 'Mobile Native Web Polish',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/mobile-native/SKILL.md',
    description: 'Ajustes CSS y meta-tags para que una web app se sienta nativa: elimina hover pegajoso, destello de tap, bug de 100vh y zoom no deseado.',
    category: 'mobile',
    tags: ['mobile', 'pwa', 'responsive', 'touch-action'],
    author: 'emilkowalski',
    triggers: [
      'web app que se siente rígida o extraña en smartphones',
      'pantalla que hace zoom inesperado al tocar un campo de texto',
      'destellos grises o hover persistente tras tocar la pantalla',
      'problemas con la barra de navegación del navegador (100dvh)'
    ],
    key_rules: [
      'REQUIRED: Establecer touch-action: manipulation en elementos interactivos',
      'REQUIRED: Tamaño de fuente mínimo de 16px en campos input para evitar autozoom en iOS',
      'REQUIRED: Utilizar 100dvh en lugar de 100vh para contenedores a pantalla completa',
      'REQUIRED: Área táctil mínima de 44x44px en botones y controles'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill mobile-native',
    is_favorite: true,
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-break-ui',
    name: 'break-ui',
    title: 'Break UI Stress-Testing',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/break-ui/SKILL.md',
    description: 'Pon a prueba la UI con los peores datos: nombres de 100 letras, emails sin romper, ceros, miles de elementos, caracteres especiales y emojis.',
    category: 'testing',
    tags: ['stress-test', 'edge-cases', 'qa', 'layout'],
    author: 'emilkowalski',
    triggers: [
      'probar casos límite y estrés en un componente',
      'verificar resistencia ante nombres largos o sin espacios',
      'comprobar vistas cuando la lista está vacía o tiene miles de items',
      'validar soporte para caracteres unicode y emojis'
    ],
    key_rules: [
      'REQUIRED: Implementar desbordamiento con puntos suspensivos o wrapping seguro',
      'ALWAYS: Probar estados con cero elementos, un elemento y miles de elementos',
      'FORBIDDEN: Asumir que los textos siempre tendrán longitud moderada',
      'REQUIRED: Asegurar que los contenedores no se rompan ante cadenas sin espacios'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill break-ui',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'emil-animate-expo',
    name: 'animate-expo',
    title: 'Expo & React Native Animations',
    repo: 'emilkowalski/skills',
    repo_url: 'https://github.com/emilkowalski/skills',
    skill_path: 'skills/animate-expo/SKILL.md',
    description: 'Animaciones en React Native y Expo con Reanimated y Gesture Handler: ejecución en el hilo de UI, haptics y transiciones de pantalla suaves.',
    category: 'mobile',
    tags: ['react-native', 'expo', 'reanimated', 'haptics'],
    author: 'emilkowalski',
    triggers: [
      'animaciones en React Native o Expo',
      'gestos con Gesture Handler y Reanimated',
      'retroalimentación táctil con expo-haptics',
      'transiciones fluidas de pantalla con Expo Router'
    ],
    key_rules: [
      'REQUIRED: Ejecutar cálculos de animación directamente en el hilo de UI (worklets)',
      'FORBIDDEN: Pasar valores animados por el puente asíncrono de React Native',
      'ALWAYS: Combinar gestos con resortes físicos de Reanimated',
      'REQUIRED: Degradación elegante en dispositivos de menor potencia'
    ],
    install_command: 'npx skills add emilkowalski/skills --skill animate-expo',
    created_at: '2026-11-11T10:00:00Z',
  },

  // Anti-Slop Clean Code & UI Skills
  {
    id: 'antislop-core',
    name: 'antislop',
    title: 'Anti-Slop Core Filter',
    repo: 'miqdadbadjuber/anti-slop',
    repo_url: 'https://github.com/miqdadbadjuber/anti-slop',
    skill_path: 'skills/antislop/SKILL.md',
    description: 'Filtro esencial contra UI genérica de IA: exige un propósito real para cada técnica visual, elimina degradados cliché y eleva el nivel de artesanía.',
    category: 'clean-code',
    tags: ['anti-slop', 'design-quality', 'filter', 'craft'],
    author: 'miqdadbadjuber',
    triggers: [
      'evitar interfaces con aspecto genérico de IA',
      'evaluar el propósito funcional de cada decisión visual',
      'eliminar combinaciones excesivas de tendencias (glassmorphism + glow + grids)',
      'verificar que el producto mantenga identidad propia'
    ],
    key_rules: [
      'REQUIRED: Regla del propósito (R-31): cada técnica debe tener una justificación escrita',
      'FORBIDDEN: Carácter em dash (—) en cualquier texto generado (R-02)',
      'FORBIDDEN: Números, estadísticas o testimonios inventados sin fuente real (R-17, R-18, R-36)',
      'REQUIRED: Todo control interactivo debe tener una acción real o no existir (R-26)'
    ],
    install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop',
    is_favorite: true,
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'antislop-ui',
    name: 'antislop-ui',
    title: 'Anti-Slop UI Craftsmanship',
    repo: 'miqdadbadjuber/anti-slop',
    repo_url: 'https://github.com/miqdadbadjuber/anti-slop',
    skill_path: 'skills/antislop-ui/SKILL.md',
    description: 'Reglas visuales estrictas: adiós al degradado azul-púrpura genérico, sombras flotantes excesivas, redondez de pastilla en todo y falsos bentos.',
    category: 'design',
    tags: ['ui', 'color', 'elevation', 'typography', 'clean'],
    author: 'miqdadbadjuber',
    triggers: [
      'construir o editar cualquier interfaz web',
      'revisión de paleta de colores y consistencia de sombras',
      'evitar patrones de plantilla bento-grid sin contenido que lo justifique',
      'jerarquía visual con propósito'
    ],
    key_rules: [
      'REQUIRED: Máximo 2 a 3 colores base y 1 de acento (R-29)',
      'FORBIDDEN: Degradados azul a morado genéricos como color principal (R-01)',
      'FORBIDDEN: Convertir todos los elementos en pastillas redondeadas (R-11)',
      'REQUIRED: Dosis controlada de efectos (máximo 1 o 2 elementos con desenfoque o brillo) (R-10, R-13)'
    ],
    install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop-ui',
    is_favorite: true,
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'antislop-copywriting',
    name: 'antislop-copywriting',
    title: 'Anti-Slop Copy & Human Voice',
    repo: 'miqdadbadjuber/anti-slop',
    repo_url: 'https://github.com/miqdadbadjuber/anti-slop',
    skill_path: 'skills/antislop-copywriting/SKILL.md',
    description: 'Textos directos y humanos: elimina palabras vacías de IA ("unlock", "elevate", "cutting-edge"), afirmaciones infladas y testimonios falsos.',
    category: 'clean-code',
    tags: ['copywriting', 'human-voice', 'content', 'anti-buzzwords'],
    author: 'miqdadbadjuber',
    triggers: [
      'redactar titulares, subtítulos y llamados a la acción (CTAs)',
      'revisar tono y eliminar palabras vacías de marketing de IA',
      'comunicar beneficios reales sin exageraciones infundadas',
      'sustituir afirmaciones abstractas por hechos específicos'
    ],
    key_rules: [
      'FORBIDDEN: Palabras cliché como unlock, elevate, seamless, cutting-edge (R-16)',
      'FORBIDDEN: Carácter em dash (—) en prosa (R-02)',
      'REQUIRED: CTAs específicos orientados a la acción real del producto (R-15)',
      'ALWAYS: Mostrar evidencia concreta antes que promesas vacías'
    ],
    install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop-copywriting',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'antislop-human',
    name: 'antislop-human',
    title: 'Anti-Slop Accessibility & Human UI',
    repo: 'miqdadbadjuber/anti-slop',
    repo_url: 'https://github.com/miqdadbadjuber/anti-slop',
    skill_path: 'skills/antislop-human/SKILL.md',
    description: 'Accesibilidad real WCAG AA: contraste medido matemáticamente, estados de foco visibles, zonas táctiles de 44px+ y soporte para teclado.',
    category: 'clean-code',
    tags: ['accessibility', 'wcag', 'contrast', 'keyboard'],
    author: 'miqdadbadjuber',
    triggers: [
      'auditoría de accesibilidad WCAG AA',
      'verificación de ratio de contraste en textos',
      'navegación por teclado completa (Tab, Enter, Escape)',
      'indicadores visuales de foco claros'
    ],
    key_rules: [
      'REQUIRED: Ratio de contraste mínimo de 4.5:1 en texto normal (R-25)',
      'FORBIDDEN: Eliminar contorno de foco con outline: none sin reemplazo (R-32)',
      'REQUIRED: Navegación completa con teclado y cierre con Escape en modales (R-32)',
      'REQUIRED: Nombre accesible y etiquetas visibles en todos los campos (R-39)'
    ],
    install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop-human',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'antislop-layoutmobile',
    name: 'antislop-layoutmobile',
    title: 'Anti-Slop Real Responsive Reflow',
    repo: 'miqdadbadjuber/anti-slop',
    repo_url: 'https://github.com/miqdadbadjuber/anti-slop',
    skill_path: 'skills/antislop-layoutmobile/SKILL.md',
    description: 'Diseño móvil que refluye con propósito y no es simplemente la versión de escritorio apretada en 375px. Tipografía fluida y ritmo proporcional.',
    category: 'mobile',
    tags: ['responsive', 'mobile-layout', 'fluid-type', 'breakpoints'],
    author: 'miqdadbadjuber',
    triggers: [
      'diseño responsivo que refluye en pantallas pequeñas',
      'evitar desbordamiento horizontal y tarjetas que se cortan',
      'ritmo vertical equilibrado entre secciones en móvil',
      'ajustar tipografía fluida según el ancho de pantalla'
    ],
    key_rules: [
      'FORBIDDEN: Desbordamiento horizontal en cualquier resolución (R-03)',
      'REQUIRED: Área de toque cómoda en todos los controles móviles (44px+)',
      'ALWAYS: Probar diseño en puntos de ruptura reales de 375px y 414px',
      'REQUIRED: La versión móvil debe diseñarse como experiencia de primera clase'
    ],
    install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop-layoutmobile',
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'antislop-code',
    name: 'antislop-code',
    title: 'Anti-Slop Code Comments Hygiene',
    repo: 'miqdadbadjuber/anti-slop',
    repo_url: 'https://github.com/miqdadbadjuber/anti-slop',
    skill_path: 'skills/antislop-code/SKILL.md',
    description: 'Higiene de comentarios: elimina comentarios decorativos ("// Step 1", separadores con ====, TODOs vagos) y conserva solo lógica de negocio real.',
    category: 'clean-code',
    tags: ['code-hygiene', 'clean-comments', 'refactoring'],
    author: 'miqdadbadjuber',
    triggers: [
      'limpieza y refactorización de comentarios de código',
      'eliminar comentarios que repiten lo evidente (// inicializar variable)',
      'remover separadores ASCII decorativos',
      'mantener explicaciones de lógica de negocio esencial'
    ],
    key_rules: [
      'FORBIDDEN: Separadores decorativos con caracteres repetidos (==== o ----)',
      'FORBIDDEN: Comentarios que repiten lo que la siguiente línea ya expresa con claridad',
      'FORBIDDEN: TODOs vagos sin tarea concreta asignable',
      'NEVER: Modificar código ejecutable al limpiar comentarios'
    ],
    install_command: 'npx skills add miqdadbadjuber/anti-slop --skill antislop-code',
    created_at: '2026-11-11T10:00:00Z',
  },
];

export const INITIAL_PACKS: SkillPack[] = [
  {
    id: 'pack-ui-craft',
    title: '🎨 Frontend UI Craft & Motion',
    description: 'Stack definitivo de diseño de ingeniería: microinteracciones fluidas, resortes físicos, principios de Apple y filtro visual anti-slop.',
    category: 'design',
    icon: '🎨',
    skill_ids: ['emil-design-eng', 'emil-animate', 'emil-apple-design', 'antislop-ui', 'emil-choreograph'],
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'pack-security',
    title: '🛡️ Security, Hardening & Audit',
    description: 'Blindaje arquitectónico para producción: revisión de vulnerabilidades en APIs y endpoints con Cloudflare e higiene estricta de código.',
    category: 'security',
    icon: '🛡️',
    skill_ids: ['cloudflare-security-audit', 'antislop-code'],
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'pack-mobile',
    title: '📱 Mobile-First & Native Polish',
    description: 'Optimización móvil integral: soluciona el viewport 100dvh, gestos 1:1, soporte para Expo/React Native y reflow responsivo sin desbordamientos.',
    category: 'mobile',
    icon: '📱',
    skill_ids: ['emil-mobile-native', 'emil-animate-expo', 'antislop-layoutmobile', 'emil-gestures'],
    created_at: '2026-11-11T10:00:00Z',
  },
  {
    id: 'pack-fullstack',
    title: '⚡ Fullstack Next.js Production',
    description: 'El conjunto completo para aplicaciones modernas en producción: auditoría de seguridad, diseño de ingeniería, accesibilidad, toasts con Sonner y copy humano.',
    category: 'frontend',
    icon: '⚡',
    skill_ids: ['cloudflare-security-audit', 'emil-design-eng', 'antislop-ui', 'antislop-copywriting', 'emil-ask-sonner'],
    created_at: '2026-11-11T10:00:00Z',
  },
];
