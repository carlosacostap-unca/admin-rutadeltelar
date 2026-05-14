## Why

Los actores necesitan publicar canales digitales de contacto mas alla de telefono y email. Esto permite registrar enlaces oficiales de Facebook, Instagram y pagina web sin mezclar esos datos en la descripcion u observaciones.

## What Changes

- Agregar campos opcionales de URL para Facebook, Instagram y pagina web en actores.
- Permitir cargar y editar esos enlaces desde los formularios de actores.
- Mostrar los enlaces disponibles en el detalle del actor como links externos.
- Documentar la estructura de datos y dejar un script reproducible para actualizar PocketBase de forma no destructiva.

## Capabilities

### New Capabilities

### Modified Capabilities
- `actor-management`: incorpora enlaces sociales y web dentro del conjunto comun de datos de contacto de actores.

## Impact

- PocketBase: coleccion `actores` con tres campos URL opcionales.
- Codigo: tipos TypeScript, formularios de crear/editar actor y vista de detalle.
- Documentacion: estructura de base de datos y tareas OpenSpec.
