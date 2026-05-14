## Why

Las portadas se usan en tarjetas, listados y vistas publicas donde la imagen se recorta para encajar en distintos formatos. Sin una indicacion editorial, esos recortes pueden cortar caras u objetos importantes.

La galeria tambien puede necesitar foco en casos puntuales, pero no debe convertir la carga normal de fotos en una tarea pesada.

## What Changes

- Agregar foco configurable para la foto de portada de entidades con imagenes.
- Agregar foco opcional por imagen de galeria ya guardada, usando metadatos por nombre de archivo.
- Usar valores por defecto centrados cuando no haya foco configurado.
- Permitir ajustar el foco desde el admin sin modificar el archivo original.
- Documentar el modelo para que la app publica pueda aplicar `object-position` al renderizar imagenes recortadas.

## Capabilities

### New Capabilities

### Modified Capabilities
- `actor-management`: permite definir foco de portada y, opcionalmente, foco de galeria para actores.
- `station-management`: permite definir foco de portada y, opcionalmente, foco de galeria para estaciones.
- `product-management`: permite definir foco de portada y, opcionalmente, foco de galeria para productos.
- `experience-management`: permite definir foco de portada y, opcionalmente, foco de galeria para experiencias.
- `imperdible-management`: permite definir foco de portada y, opcionalmente, foco de galeria para imperdibles.

## Impact

- PocketBase: nuevos campos numericos de foco de portada y un campo JSON de foco de galeria en colecciones con imagenes.
- UI admin: controles de foco en carga/edicion de multimedia.
- Tipos y helpers: nuevos metadatos compartidos para aplicar `object-position`.
- App publica: podra consumir los campos para evitar recortes problematicos.
