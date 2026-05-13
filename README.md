# 🍄 Micelio Betania — Sistema de Información

Aplicación web integral para gestionar el **Piloto 10m² de Champiñón Blanco** en Betania, Alangasí.

## 🎯 Características

### 7 Módulos Integrados:

1. **📊 Dashboard** — Vista ejecutiva con KPIs, deadline, progreso del piloto
2. **📅 Cronograma** — 9 fases del piloto (26/03 → 28/05/2026) con seguimiento de estado
3. **👥 Proveedores (CRM)** — 10+ proveedores en Quito & Valle de los Chillos
4. **📦 Inventario** — 22 items críticos con urgencia, costos y deadlines
5. **🌡️ Registros** — Captura de T°, HR, CO₂ con validación de rangos por fase
6. **🔬 Trazabilidad** — Cosechas por lote/vuelta/estante (Premium/Comercial/Merma)
7. **💰 Costos & ROI** — 3 escenarios de inversión + proyección a 5 ciclos

### Funcionalidades:
- ✅ Edición en línea de proveedores (teléfonos, emails, precios)
- ✅ Estados de seguimiento (por-contactar → confirmado)
- ✅ Validación automática de parámetros ambientales por fase
- ✅ Cálculo automático de ingresos, mermas y márgenes
- ✅ Persistencia en LocalStorage (datos guardados en el navegador)
- ✅ Diseño responsive (móvil + escritorio)
- ✅ Paleta de colores micológica (tonos tierra/champiñón)

---

## 🚀 Cómo desplegar en Vercel

### Opción A: Desde GitHub (Recomendado)

1. **Subir el código a GitHub:**
   ```bash
   cd micelio-betania-si
   git init
   git add .
   git commit -m "Initial commit — Sistema Micelio Betania"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/micelio-betania-si.git
   git push -u origin main
   ```

2. **Ir a Vercel:**
   - Visita https://vercel.com/new
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `micelio-betania-si`
   - Click **Deploy** (Vercel detecta Next.js automáticamente)

3. **¡Listo!** En 1-2 minutos tendrás:
   - URL pública: `https://micelio-betania-si.vercel.app`
   - HTTPS automático
   - Deploy automático en cada push

### Opción B: Desde la línea de comandos

```bash
# Instalar Vercel CLI
npm i -g vercel

# Dentro del directorio del proyecto
cd micelio-betania-si
vercel

# Seguir las instrucciones (logarse si es primera vez)
# Vercel preguntará algunas cosas, acepta los defaults
```

### Opción C: Drag & drop

1. Construye localmente: `npm install && npm run build`
2. Comprime la carpeta `.next` y arrastra a https://vercel.com/new

---

## 💻 Cómo correr localmente

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Abre http://localhost:3000
```

---

## 📂 Estructura del proyecto

```
micelio-betania-si/
├── app/
│   ├── globals.css         # Estilos globales + paleta micológica
│   ├── layout.tsx          # Layout raíz
│   └── page.tsx            # Página principal con navegación
├── components/
│   ├── Sidebar.tsx         # Navegación lateral
│   ├── Dashboard.tsx       # Vista ejecutiva
│   ├── Cronograma.tsx      # Gestión de fases
│   ├── Proveedores.tsx     # CRM con edición en línea
│   ├── Inventario.tsx      # Tabla de compras
│   ├── Registros.tsx       # Captura ambiental
│   ├── Trazabilidad.tsx    # Cosechas y lotes
│   └── Costos.tsx          # Análisis financiero
├── data/
│   └── seed.ts             # Datos iniciales (fases, proveedores, inventario)
├── lib/
│   └── storage.ts          # Helper para LocalStorage
├── package.json
├── tailwind.config.js      # Paleta micológica personalizada
├── tsconfig.json
├── next.config.js
└── vercel.json             # Config de Vercel
```

---

## 🔄 Próximos pasos (escalamiento)

Cuando quieras subir el sistema al siguiente nivel:

### Fase 2 — Base de datos en la nube
- Cambiar LocalStorage por **Supabase** o **Neon (Postgres)**
- Acceso multi-usuario desde cualquier dispositivo
- Backup automático

### Fase 3 — Automatización
- **Telegram Bot:** Alertas cuando CO₂ sale del rango (similar a tu trading bot)
- **Cron jobs en Vercel:** Recordatorios de tareas críticas
- **Email:** Reportes diarios automáticos

### Fase 4 — Integraciones
- **Sincronización con Google Sheets** (para reportes)
- **API IoT:** Sensores conectados que reportan en tiempo real
- **QR codes:** Trazabilidad por bandeja escaneando QR

### Fase 5 — Multi-ciclo
- Comparativa entre ciclos (C1 vs C2 vs C3)
- Análisis predictivo de rendimiento
- Dashboard de inversionistas

---

## 🎨 Paleta de colores

- **Micelio** — Dorados/champiñón (#fdfbf7 → #3a2e22)
- **Tierra** — Marrones/sustrato (#faf8f5 → #2d251f)
- **Hongo** — Beiges/cuerpos fructíferos (#f8f7f4 → #26221a)

---

## 📞 Soporte

Documento confidencial · Micelio Betania × CBI Betania · 2026

Deadline del piloto: **28 de mayo de 2026**
