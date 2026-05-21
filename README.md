# Parroquias SV — Sistema Sacramental

Sistema web para registro de sacramentos parroquiales (bautismos, confirmaciones, primeras comuniones y matrimonios), con impresión de constancias oficiales.

## Stack
- HTML + CSS + JavaScript vanilla
- Supabase (base de datos + autenticación)
- Vercel (despliegue)

## Setup

### 1. Crear proyecto en Supabase
1. Ir a https://supabase.com y crear una cuenta nueva
2. Crear un proyecto (ej: `parroquias-sv`)
3. Ir a **SQL Editor** y ejecutar todo el contenido de `database.sql`
4. Ir a **Authentication > Users > Invite user** y crear el usuario de la secretaría

### 2. Configurar credenciales
Editar `src/js/config.js` y reemplazar:
```js
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```
Los valores los encontrás en **Settings > API** en Supabase.

### 3. Desplegar en Vercel
1. Subir el proyecto a GitHub
2. Conectar repositorio en https://vercel.com
3. Deploy automático en cada push

## Estructura
```
parroquias-sv/
├── index.html              ← Login
├── vercel.json
├── database.sql            ← Ejecutar en Supabase
├── src/
│   ├── css/
│   │   ├── main.css        ← Estilos globales
│   │   └── print.css       ← Estilos de impresión
│   └── js/
│       ├── config.js       ← Credenciales Supabase
│       ├── auth.js         ← Manejo de sesión
│       ├── bautismos.js
│       ├── confirmaciones.js
│       ├── comuniones.js
│       └── matrimonios.js
└── pages/
    ├── dashboard.html
    ├── bautismos.html
    ├── confirmaciones.html
    ├── comuniones.html
    └── matrimonios.html
```
