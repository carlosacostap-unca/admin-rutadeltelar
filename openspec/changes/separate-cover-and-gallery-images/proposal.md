## Why

Las entidades con multimedia necesitan distinguir una imagen principal para tarjetas y listados de las imagenes complementarias que forman la galeria. Hoy estaciones ya modela esta separacion, pero actores, productos, experiencias e imperdibles usan un unico campo `fotos`, lo que hace que la primera imagen se use implicitamente como portada y oculte la intencion editorial.

## What Changes

- Separar la multimedia de entidades en una portada unica y una galeria de hasta cinco imagenes.
- Aplicar el modelo a todas las entidades con fotos: estaciones, actores, productos, experiencias e imperdibles.
- Mantener compatibilidad con registros existentes que solo tengan `fotos`.
- Usar la primera foto existente como portada fallback o migracion sugerida, y las restantes como galeria.
- Evitar que la portada se repita dentro de la galeria.
- Permitir en edicion elegir una foto ya cargada como portada o subir una nueva portada.
- Usar la portada en tarjetas, listados y resumenes visuales; usar la galeria en la vista de detalle.

## Capabilities

### New Capabilities

- `entity-media`: comportamiento transversal para portada y galeria en entidades con imagenes.

### Modified Capabilities

- `actor-management`: separar portada y galeria para actores.
- `station-management`: consolidar el comportamiento ya existente de portada y galeria, incluyendo compatibilidad legacy.
- `product-management`: separar portada y galeria para productos.
- `experience-management`: separar portada y galeria para experiencias.
- `imperdible-management`: separar portada y galeria para imperdibles.

## Impact

- PocketBase schema: nuevos campos de archivo para portada y galeria en entidades que hoy solo tienen `fotos`.
- Types: actualizar modelos TypeScript para `foto_portada` y `galeria_fotos`.
- Create/edit forms: separar controles de portada y galeria, con soporte de seleccionar portada desde imagenes existentes.
- Detail pages: mostrar portada y galeria en secciones distintas.
- Listing/card views: usar portada como imagen principal, con fallback a `fotos[0]`.
- Data migration/backfill: definir tratamiento para registros existentes con `fotos`.
- E2E tests: cubrir fallback legacy y renderizado separado en al menos una entidad representativa.
