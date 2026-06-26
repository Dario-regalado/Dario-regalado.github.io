# Vanesa's Peluqueria

Sitio web estático para peluquería con Supabase backend y Cloudflare Pages.

## Stack

- HTML + CSS + JavaScript vainilla (sin frameworks, sin build tools)
- **Supabase** (base de datos + auth)
- **Cloudflare Pages** (hosting)
- ES Modules con `importmap`

## Estructura

```
/
├── index.html              # Página principal (servicios, contacto)
├── calendario.html         # Calendario público (horas ocupadas)
├── css/
│   ├── styles.css          # Estilos generales
│   ├── calendar.css        # Estilos del calendario
│   └── admin.css           # Estilos del panel admin
├── js/
│   ├── main.js             # Menú, año, service worker
│   ├── supabase.js         # Cliente Supabase
│   ├── auth.js             # Login/logout/session
│   ├── calendar.js         # Lógica del calendario público
│   ├── calendar-admin.js   # Lógica del calendario admin
│   └── admin-reservas.js   # CRUD de reservas
├── admin/
│   ├── index.html          # Login
│   ├── dashboard.html      # Panel principal
│   ├── reservas.html       # CRUD de reservas
│   └── calendario.html     # Calendario admin con detalle
├── fotos/
│   └── logo.ico            # Favicon
├── sw.js                   # Service Worker
└── manifest.webmanifest    # PWA manifest
```

## Base de datos (Supabase)

### Tabla `servicios`

| Columna  | Tipo         |
|----------|-------------|
| id       | int8 (PK)   |
| nombre   | text        |
| duracion | int4        |
| precio   | numeric     |
| activo   | bool        |

### Tabla `reservas`

| Columna        | Tipo         |
|---------------|-------------|
| id            | int8 (PK)   |
| nombre_cliente| text        |
| telefono      | text        |
| servicio_id   | int8 (FK → servicios.id) |
| fecha         | date        |
| horario_inicio| time        |
| observaciones | text        |
| created_at    | timestamptz |

## Desarrollo local

```bash
python -m http.server 3000
# Abrir http://localhost:3000/
```

## Admin

1. Crear usuario en Supabase Auth dashboard
2. Iniciar sesión en `/admin/`
3. Gestionar reservas (CRUD) y ver calendario con detalle

## Despliegue (Cloudflare Pages)

1. Conectar repositorio a Cloudflare Pages
2. Build command: vacío (es estático)
3. Build output: `/`
4. Variable de entorno: ninguna (las credenciales de Supabase van en el JS)
