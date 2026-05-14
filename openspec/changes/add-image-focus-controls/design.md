## Overview

El foco se guarda como coordenadas porcentuales `{ x, y }` en el rango 0 a 100. El valor por defecto es `{ x: 50, y: 50 }`, equivalente al centro visual de la imagen.

Para portada, el foco vive en campos dedicados del registro. Para galeria, se guarda un mapa opcional por nombre de archivo porque `galeria_fotos` es un campo multi-file simple.

## Data Model

Campos nuevos en `estaciones`, `actores`, `productos`, `experiencias` e `imperdibles`:

- `foto_portada_focus_x`: number opcional, 0 a 100.
- `foto_portada_focus_y`: number opcional, 0 a 100.
- `galeria_fotos_focus`: json opcional.

Ejemplo de `galeria_fotos_focus`:

```json
{
  "foto_abc123.jpg": { "x": 48, "y": 22 }
}
```

## UI Behavior

- La portada siempre puede ajustar foco cuando hay portada existente o nueva.
- Las fotos nuevas de galeria no tienen foco configurable hasta quedar guardadas, porque PocketBase puede cambiar el nombre final del archivo.
- Las fotos existentes de galeria pueden ajustar foco de manera opcional.
- Si no hay foco guardado, la UI y la app publica deben usar `50% 50%`.

## Rendering Guidance

Las superficies que recortan imagenes deben usar:

```css
object-fit: cover;
object-position: <x>% <y>%;
```

Las superficies que muestran la imagen completa pueden seguir usando `object-fit: contain` y no necesitan foco.

## Risks

- El foco de galeria queda asociado al nombre de archivo; al eliminar o reemplazar una imagen, ese metadato debe podarse.
- El selector de foco debe ser simple para no sumar carga editorial innecesaria.
