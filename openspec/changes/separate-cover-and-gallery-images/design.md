## Context

El sistema administra entidades territoriales y de contenido con imagenes asociadas. Estaciones ya separa `foto_portada` y `galeria_fotos`, con fallback hacia el campo legacy `fotos`. Actores, productos, experiencias e imperdibles todavia almacenan todas las imagenes en `fotos`, por lo que la portada se infiere como la primera imagen y la galeria no queda diferenciada.

La aplicacion sigue trabajando contra una unica instancia de PocketBase durante esta etapa, por lo que el cambio debe ser compatible con datos existentes y no requerir migraciones destructivas para operar.

## Goals / Non-Goals

**Goals:**

- Unificar el modelo editorial de multimedia para estaciones, actores, productos, experiencias e imperdibles.
- Proveer una portada unica para tarjetas, listados y resumenes.
- Proveer una galeria separada de hasta cinco imagenes.
- Mantener lectura compatible de registros existentes que solo tienen `fotos`.
- Permitir elegir como portada una imagen existente o subir una nueva.
- Evitar duplicar la portada dentro de la galeria visible.

**Non-Goals:**

- No cambiar el proveedor de archivos ni agregar dependencias nuevas.
- No implementar procesamiento de imagenes, recorte, compresion ni ordenamiento avanzado de galeria.
- No migrar datos de produccion de forma destructiva.
- No cambiar permisos de edicion o revision existentes.

## Decisions

### Decision: Use explicit `foto_portada` and `galeria_fotos` fields

Las entidades con imagenes usaran:

- `foto_portada`: archivo unico opcional.
- `galeria_fotos`: arreglo de archivos opcional, maximo cinco.
- `fotos`: campo legacy de lectura/fallback mientras existan registros viejos.

Esto replica el patron ya presente en estaciones y evita inventar una convencion diferente por entidad.

Alternativa considerada: mantener solo `fotos` y guardar el nombre de la portada en un campo de texto. Se descarta porque mantiene una relacion debil entre archivos y portada, complica eliminaciones y no aprovecha validaciones de archivo de PocketBase.

### Decision: Legacy fallback is read-only compatibility

Para registros existentes, la UI tratara `fotos[0]` como portada fallback si `foto_portada` esta vacia, y `fotos.slice(1)` como galeria fallback si `galeria_fotos` esta vacia o incompleta. Al editar y guardar, el sistema puede escribir en los nuevos campos sin borrar automaticamente `fotos`, salvo cuando el usuario elimine explicitamente archivos.

Alternativa considerada: ejecutar una migracion inmediata que mueva todos los archivos. Se deja como tarea opcional/manual porque hoy se trabaja con una sola base y conviene minimizar riesgo.

### Decision: Gallery excludes cover in display

La portada no se mostrara duplicada dentro de la galeria. Si la portada proviene de una foto legacy o de una foto existente elegida por el usuario, la lista de galeria visible debe filtrarla.

Alternativa considerada: repetir portada en galeria para preservar "todas las fotos". Se descarta porque confunde la ficha editorial y genera duplicados visuales.

### Decision: Forms provide two paths for cover

En edicion, el usuario podra:

- subir una portada nueva;
- elegir una imagen existente como portada;
- eliminar o reemplazar la portada actual.

En creacion, el usuario podra subir portada y galeria por separado.

### Decision: Limit is 1 cover plus 5 gallery images

El limite actual de cinco imagenes pasa a aplicar a la galeria. La portada no consume un cupo de galeria.

## Risks / Trade-offs

- [Risk] PocketBase schema no tiene los campos nuevos en todas las colecciones -> Mitigation: documentar campos requeridos y validar manualmente antes de desplegar UI.
- [Risk] Registros existentes muestran duplicados si una misma imagen aparece en `foto_portada`, `galeria_fotos` y `fotos` -> Mitigation: deduplicar por nombre de archivo en helpers de lectura.
- [Risk] Elegir una imagen legacy como portada puede requerir copiar o mover archivos entre campos de PocketBase -> Mitigation: preferir comportamiento de seleccion basado en nombre existente cuando sea posible; si PocketBase requiere re-subida para campos separados, mantener fallback hasta que el usuario suba portada nueva.
- [Risk] Cambios repetidos en formularios similares pueden generar divergencia -> Mitigation: extraer helpers pequeños para resolver portada/galeria y, si el patron crece, considerar un componente reutilizable.

## Migration Plan

1. Agregar campos `foto_portada` y `galeria_fotos` a colecciones que aun no los tengan: actores, productos, experiencias e imperdibles.
2. Actualizar tipos TypeScript.
3. Implementar helpers de lectura:
   - portada = `foto_portada || fotos[0]`.
   - galeria = dedupe(`galeria_fotos + fotos legacy sin portada`).
4. Actualizar formularios create/edit para portada y galeria.
5. Actualizar detail/list/cards para usar portada y galeria separadas.
6. Opcional: ejecutar backfill manual controlado para copiar primera foto a `foto_portada` y restantes a `galeria_fotos`.

Rollback: mantener `fotos` sin borrar permite volver a la UI anterior si hiciera falta. Los nuevos campos son aditivos.

## Open Questions

- Confirmar nombres exactos de campos en PocketBase para colecciones nuevas: se propone `foto_portada` y `galeria_fotos`.
- Confirmar si se quiere una tarea posterior de backfill automatizado o si alcanza con fallback en UI por ahora.
