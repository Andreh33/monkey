# 🛴 MonkeyMotion · Monopatín Shop

Web oficial de **MonkeyMotion** — tienda especializada en venta y reparación de patinetes eléctricos en Tarragona.

> Calidad. Rapidez. Confianza. ⚡

---

## ✨ Highlights

- 🐵 Animación de entrada con un mono 3D que cruza la pantalla (Three.js + GLB)
- 🎨 Diseño dark-mode con paleta urbana (rojo lava + naranja eléctrico)
- 🛒 E-commerce completo con catálogo, carrito persistente y Stripe Payment Links
- 🔧 Sistema de solicitudes de reparación con panel admin
- 👥 Auth NextAuth con roles CLIENT y ADMIN
- 🗺️ Mapa Leaflet con tema dark integrado
- 🎬 Microinteracciones con Framer Motion

## 🧰 Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS + CSS Variables
- **Animaciones**: Framer Motion + GSAP
- **3D**: Three.js + React Three Fiber + Drei
- **Auth**: NextAuth.js (Credentials)
- **DB**: Prisma + SQLite (dev)
- **Pagos**: Stripe Payment Links
- **Forms**: React Hook Form + Zod
- **Carrito**: Zustand con persist
- **Mapa**: Leaflet + OpenStreetMap

## 🚀 Instalación

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 🔑 Credenciales seed

- **Admin**: `admin@monopatinshop.es` / `Monopatin2026!`
- **Cliente demo**: `cliente@demo.es` / `Demo1234!`

## 💳 Cómo añadir productos con Stripe Payment Links

1. Entra en [dashboard.stripe.com](https://dashboard.stripe.com) y crea un **Payment Link** para tu producto.
2. Copia la URL (algo como `https://buy.stripe.com/abc123...`).
3. En el panel admin (`/admin/productos/nuevo`), pega esa URL en el campo **"URL de Payment Link de Stripe"**.
4. El botón **"Comprar ahora"** del cliente abrirá ese link en una nueva pestaña.

## 🔧 Cómo gestionar solicitudes de reparación

1. Las solicitudes entran por el formulario de `/reparaciones`.
2. Aparecen en `/admin/reparaciones`.
3. Las nuevas se destacan con borde rojo (estado `NEW`).
4. Al hacer clic en una fila ves todos los detalles, puedes:
   - Cambiar el estado (NEW → CONTACTED → IN_PROGRESS → DONE)
   - Añadir notas internas
   - Llamar o escribir por WhatsApp directamente desde el panel

## 🐵 El mono 3D

- Modelo GLB en `public/modelo/source/dead-monkey-walk.glb`
- Componente: `src/components/layout/MonkeyWalker.tsx`
- Solo aparece **una vez por sesión** (sessionStorage `monkey_walked`)
- Cruza la pantalla de derecha a izquierda en ~6 segundos
- Si el modelo falla en cargar, fallback silencioso (no rompe nada)
- Para ajustar tamaño/posición: edita `position`, `scale` y `rotation` en `<Monkey />`

## 📁 Estructura

```
src/
├── app/                    # App router (rutas)
│   ├── admin/(panel)/      # Panel admin protegido
│   ├── api/                # API routes
│   ├── cuenta/             # Área cliente
│   ├── tienda/             # Catálogo + detalle
│   ├── reparaciones/       # Solicitud de reparación
│   ├── nosotros/, contacto/, login/, registro/, carrito/
│   └── page.tsx            # Home
├── components/
│   ├── layout/             # Navbar, Footer, Marquee, MonkeyWalker
│   ├── home/               # Secciones del home
│   ├── shop/               # ProductCard, Gallery, CartDrawer
│   ├── repair/             # RepairForm
│   ├── admin/              # ProductForm, ImageUploader, RepairRow…
│   └── shared/             # WhatsAppButton, Map, ScrollReveal
├── lib/                    # prisma, auth, utils, cart-store
├── types/                  # next-auth types
└── middleware.ts           # Protección de rutas
```

## 📜 Scripts

```bash
npm run dev          # Dev server
npm run build        # Build de producción (incluye prisma generate)
npm run start        # Serve build
npm run lint         # ESLint
npm run db:migrate   # Aplica migraciones
npm run db:seed      # Reset + seed con 6 patinetes y usuarios demo
npm run db:reset     # Resetea la DB
```

## ☁️ Deploy a Vercel

```bash
vercel --prod
```

### Variables de entorno en Vercel Dashboard

```
DATABASE_URL=...           # Ver nota abajo
NEXTAUTH_SECRET=<aleatorio largo>
NEXTAUTH_URL=https://<tu-dominio>.vercel.app
ADMIN_EMAIL=admin@monopatinshop.es
ADMIN_PASSWORD=Monopatin2026!
```

### ⚠️ Importante: SQLite en Vercel

SQLite **no funciona en producción en Vercel** porque el filesystem es efímero. Para producción real, migra a:

- **Vercel Postgres** (recomendado)
- **Neon** (PostgreSQL serverless)
- **Supabase** (PostgreSQL gestionado)

**Pasos para migrar:**

1. Crea la base de datos en el proveedor elegido.
2. Cambia `provider = "sqlite"` por `provider = "postgresql"` en `prisma/schema.prisma`.
3. Configura `DATABASE_URL` en Vercel con la URL del nuevo Postgres.
4. Añade un build hook que ejecute `prisma migrate deploy && tsx prisma/seed.ts` en el primer deploy.

Para una **demo visual sin login persistente**, el deploy con SQLite funciona como showcase pero la base de datos se reinicia en cada cold-start.

---

## 📞 Contacto del negocio

📍 C/ Jaume I, 5 · 43003 Tarragona
📞 643 27 47 56 / 616 686 593
🎵 [@monopatinshop](https://www.tiktok.com/@monopatinshop)

---

Hecho en Tarragona con energía urbana ⚡
