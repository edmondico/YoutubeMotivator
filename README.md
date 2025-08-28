# 🎮 PokeBim Motivator

Una aplicación web motivacional completa diseñada especialmente para **PokeBim** (@PokeBim) para maximizar su productividad, mantener la motivación y crear contenido consistente para YouTube.

## ✨ Características Principales

### 📋 Gestión de Tareas Profesional
- **Sistema completo de tareas** con agregar, editar, eliminar y arrastrar
- **Sistema de prioridades** visual (Baja 🟢, Media 🟡, Alta 🟠, Urgente 🔴)
- **Categorías especializadas** para YouTubers (🎬 Creación, ✂️ Edición, 🔍 Investigación, 📢 Marketing, 📝 Otros)
- **Estimación y seguimiento de tiempo** con duración real
- **Filtros inteligentes** y búsqueda avanzada
- **Fechas límite y programación** con recordatorios automáticos

### 📅 Planificación Semanal Avanzada
- **Calendario semanal interactivo** con vista de 7 días
- **Drag & Drop** para programar tareas específicamente por día
- **Vista de tareas sin programar** para organizarlas fácilmente
- **Navegación fluida** entre semanas con botones de navegación
- **Resumen diario** con tiempo estimado y número de tareas
- **Vista responsiva** que funciona en móvil y desktop

### 🎯 Sistema de Gamificación
- **Sistema de niveles** con títulos PokéTuber (Novato → Maestro → Campeón)
- **Puntos de experiencia (XP)** por completar tareas
- **Logros desbloqueables** con recompensas visuales
- **Racha de días activos** para mantener consistencia
- **Celebraciones animadas** al completar tareas y subir de nivel

### 📺 Integración Real con YouTube
- **API de YouTube integrada** para datos reales del canal
- **Estadísticas en tiempo real** de suscriptores y vistas
- **Contador de días sin video** con mensajes motivacionales personalizados
- **Seguimiento automático** de crecimiento y métricas
- **Indicador de fuente de datos** (real vs simulado)
- **Actualización automática** cada 15 minutos con cache inteligente

### 💪 Motivación Inteligente
- **Mensajes contextuales** que cambian según la hora del día
- **Tips diarios rotativos** para mejorar el canal
- **Frases motivacionales** inspiradoras para mantenerse enfocado
- **Sistema de notificaciones** push y visuales
- **Centro de notificaciones** con recordatorios inteligentes
- **Celebraciones automáticas** por logros y metas cumplidas

### ⚙️ Configuración Completa y Objetivos
- **Objetivos personalizables** para vistas diarias, suscriptores, videos por semana
- **Metas con fechas límite** y seguimiento de progreso
- **Configuración de notificaciones** granular
- **Integración con YouTube API** mediante API key personal
- **Temas y colores personalizables** para la interfaz
- **Modo oscuro** disponible (próximamente)

### 💾 Gestión de Datos Avanzada  
- **Exportación completa** en formato JSON para backup
- **Exportar tareas a CSV** para análisis externo
- **Reportes de progreso** detallados en Markdown
- **Almacenamiento local automático** con persistencia
- **Cache inteligente** para datos de YouTube
- **Importación de backups** (próximamente)

### 🎨 Interfaz y Navegación
- **Diseño limpio y profesional** con Tailwind CSS
- **Animaciones fluidas** con Framer Motion para mejor UX
- **Sistema de navegación con tabs** (Dashboard, Calendario, Analíticas, Configuración)
- **Transiciones suaves** entre vistas con AnimatePresence
- **Tema inspirado en Pokémon** con emojis y colores vibrantes
- **Responsive design** completo para móvil y desktop
- **Componentes interactivos** con feedback visual inmediato

### 📊 Vista de Analíticas
- **Estadísticas detalladas** de tareas completadas y productividad
- **Gráficos de progreso** y métricas de rendimiento
- **Análisis de tiempo** invertido en diferentes categorías
- **Tasa de finalización** y promedios de duración
- **Insights sobre patrones** de trabajo y productividad

## 🚀 Stack Tecnológico

### Frontend Framework
- **Next.js 15** con App Router y Turbopack para desarrollo rápido
- **TypeScript** para type safety y mejor desarrollo
- **React 19** con hooks avanzados y estado optimizado

### UI y Styling
- **Tailwind CSS** para styling moderno y responsivo
- **Framer Motion** para animaciones fluidas y transiciones
- **Lucide React** para iconos consistentes y escalables
- **class-variance-authority** para variantes de componentes

### Funcionalidad Avanzada
- **@dnd-kit** para drag & drop funcional en el calendario
- **date-fns** para manejo robusto de fechas y localización
- **react-hook-form + yup** para formularios con validación
- **YouTube Data API v3** para integración real con canales

### Persistencia y Datos
- **localStorage** con persistencia automática y cache inteligente
- **JSON/CSV export** para backup y análisis de datos
- **Markdown generation** para reportes de progreso

## 🛠️ Instalación Local

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPO]
cd pokebim-motivator
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

5. **Configurar YouTube API (Opcional pero recomendado)**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la **YouTube Data API v3**
   - Crea credenciales (API Key)
   - En la app, ve a Configuración > Canal YouTube y agrega tu API Key
   - Agrega tu Channel ID (lo encuentras en la URL de tu canal)

## 🌐 Despliegue en Vercel

### Opción 1: Desde GitHub
1. Sube el código a un repositorio de GitHub
2. Conecta tu cuenta de GitHub con Vercel
3. Importa el repositorio en Vercel
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Haz clic en "Deploy"

### Opción 2: Desde CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar desde el directorio del proyecto
vercel

# Seguir las instrucciones en pantalla
```

### Opción 3: Arrastrar y soltar
1. Ejecuta `npm run build` para generar la build
2. Ve a [vercel.com](https://vercel.com)
3. Arrastra la carpeta `.next` a Vercel

## 🎯 Funcionalidades Destacadas

### 🔥 Para Creadores de Contenido como PokeBim:
- **Dashboard completo** con vista general de productividad
- **Planificación semanal visual** con drag & drop para organizar tareas
- **Trackeo en tiempo real** de métricas de YouTube
- **Gamificación completa** con niveles, XP y logros
- **Sistema de notificaciones** inteligente que te mantiene enfocado
- **Configuración granular** de objetivos personales y profesionales

### 📊 Datos y Métricas:
- **Integración real con YouTube API** para datos precisos
- **Datos simulados realistas** como fallback (Canal @PokeBim)
- **Métricas de productividad** con análisis detallado
- **Reportes exportables** para análisis externo
- **Cache inteligente** para optimizar rendimiento

## 🎯 Objetivos de la App

1. **Aumentar la consistencia** en la creación de contenido
2. **Gamificar la productividad** para hacerla más divertida
3. **Proveer feedback visual** sobre el progreso del canal
4. **Motivar diariamente** con mensajes personalizados
5. **Organizar tareas** de manera eficiente y visual

## 🔄 Próximas Funcionalidades

### ⭐ En Desarrollo
- [ ] **Importación de backups** para restaurar datos exportados
- [ ] **Integración con Google Calendar** para sincronizar tareas programadas
- [ ] **Modo oscuro completo** con toggle automático por hora
- [ ] **Gráficos interactivos** con Chart.js para analíticas avanzadas

### 🚀 Roadmap Futuro
- [ ] **Colaboración en equipo** para canales con múltiples creadores
- [ ] **Templates de tareas** para workflows comunes de YouTube
- [ ] **Integración con redes sociales** (Instagram, TikTok, Twitter)
- [ ] **Notificaciones push nativas** del navegador más avanzadas
- [ ] **Sincronización en la nube** para acceso multi-dispositivo
- [ ] **AI Assistant** para sugerencias de contenido y optimización
- [ ] **Integración con herramientas de edición** (Premiere, After Effects)
- [ ] **Marketplace de templates** y configuraciones compartidas

## 👨‍💻 Desarrollo

Creado específicamente para motivar a PokeBim en su journey como YouTuber, combinando gamificación, productividad y seguimiento de métricas en una experiencia visual y motivacional única.

---

**¡Que comience la aventura PokéTuber! 🚀✨**