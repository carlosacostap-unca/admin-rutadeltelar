# Estructura De La Base De Datos

## Propósito
Este documento describe la estructura de base de datos utilizada por el proyecto `admin-rutadeltelar`, tomando como referencia el estado actual del código y las colecciones consumidas desde la aplicación.

La aplicación usa **PocketBase** como backend, por lo que la “base de datos” se modela principalmente a través de **collections**, campos escalares, campos `relation`, arrays, archivos y algunos campos `json`.

## Alcance
Este documento resume:

- colecciones principales
- colecciones de catálogo
- relaciones entre entidades
- campos funcionales relevantes
- observaciones de implementación

No reemplaza la configuración real de PocketBase, pero sirve como guía funcional y técnica del modelo actual.

## Vista General

### Colecciones principales
- `users`
- `estaciones`
- `actores`
- `productos`
- `experiencias`
- `imperdibles`
- `auditoria`

### Colecciones de catálogo
- `tipos_actor`
- `categorias_producto`
- `subcategorias_producto`
- `tecnicas_producto`
- `categorias_experiencia`
- `tipos_imperdible`
- `prioridades_imperdible`
- `departamentos`

### Colecciones opcionales o previstas
- `comentarios`
- `puntuaciones`

Nota: el código contempla `comentarios` y `puntuaciones` desde el componente de feedback, pero su uso puede depender de si estas colecciones existen efectivamente en PocketBase.

---

## Relaciones Principales

### Estaciones
- Una `estacion` puede tener muchos `actores`
- Una `estacion` puede tener muchos `experiencias`
- Una `estacion` puede tener muchos `imperdibles`
- Un `producto` puede relacionarse con cero, una o varias `estaciones`

### Actores
- Un `actor` pertenece a una `estacion`
- Un `actor` puede relacionarse con muchos `productos`
- Un `actor` puede relacionarse con `imperdibles`
- Un `actor` puede ser `responsable` de una `experiencia`

### Productos
- Un `producto` tiene una `categoria`
- Un `producto` puede tener una `subcategoria`
- Un `producto` puede tener muchas `tecnicas`
- Un `producto` puede relacionarse con muchos `actores`
- Un `producto` puede relacionarse con cero, una o varias `estaciones`
- Un `producto` puede relacionarse con `imperdibles`

### Experiencias
- Una `experiencia` pertenece a una `estacion`
- Una `experiencia` tiene una `categoria`
- Una `experiencia` puede tener un `responsable` actor
- Una `experiencia` puede relacionarse con `imperdibles`

### Imperdibles
- Un `imperdible` pertenece a una `estacion`
- Un `imperdible` tiene un `tipo`
- Un `imperdible` tiene una `prioridad`
- Un `imperdible` puede relacionarse con muchos `actores`
- Un `imperdible` puede relacionarse con muchos `productos`
- Un `imperdible` puede relacionarse con muchas `experiencias`

---

## Colecciones Principales

## `users`
Representa usuarios internos del panel administrativo.

### Campos principales
- `name`: texto
- `email`: email
- `active`: boolean
- `roles`: array de strings
- `observations`: texto opcional
- `last_login`: fecha/hora opcional

### Roles utilizados
- `admin`
- `editor`
- `revisor`
- `consultor`

### Uso en la app
- autenticación
- autorización por rol
- trazabilidad de `created_by` y `updated_by`

---

## `estaciones`
Unidad territorial principal de la Ruta del Telar.

### Campos principales
- `nombre`: texto
- `eslogan`: texto opcional
- `posee_estacion_inaugurada`: boolean opcional
- `localidad`: texto
- `departamento`: relation a `departamentos`
- `descripcion_general`: texto opcional
- `latitud`: number opcional
- `longitud`: number opcional
- `foto_portada`: file opcional
- `galeria_fotos`: files opcional
- `fotos`: files opcional
- `estado`: string
- `observaciones_revision`: texto opcional
- `created_by`: relation a `users`
- `updated_by`: relation a `users`

### Estados utilizados
- `borrador`
- `en_revision`
- `aprobado`
- `inactivo`

### Relacionada con
- `actores`
- `productos`
- `experiencias`
- `imperdibles`

---

## `actores`
Entidades vinculadas a una estación: artesanos, productores, hospedajes, gastronómicos, guías, etc.

### Campos base
- `nombre`: texto
- `tipo`: relation a `tipos_actor`
- `estacion_id`: relation a `estaciones`
- `ubicado_en_estacion_inaugurada`: boolean opcional
- `descripcion`: texto opcional
- `contacto_telefono`: texto opcional
- `contacto_email`: texto opcional
- `ubicacion`: texto opcional
- `latitud`: number opcional
- `longitud`: number opcional
- `estado`: string
- `observaciones_revision`: texto opcional
- `observaciones`: texto opcional
- `fotos`: files opcional
- `created_by`: relation a `users`
- `updated_by`: relation a `users`

### Campos específicos por subtipo

#### Artesano
- `tecnicas`
- `materiales`
- `disponibilidad`
- `visitas_demostraciones`

#### Productor
- `rubro_productivo`
- `escala_produccion`
- `modalidad_venta`
- `visitas_demostraciones`

#### Compartido entre artesano y productor
- `productos_ofrecidos`

#### Hospedaje
- `tipo_hospedaje`
- `capacidad`
- `servicios`
- `horarios`

#### Gastronómico
- `tipo_propuesta`
- `especialidades`
- `platos_destacados`
- `modalidad_servicio`
- `servicios_adicionales`
- `horarios`

#### Guía de turismo
- `especialidad`
- `idiomas`
- `recorridos_ofrecidos`
- `duracion_recorridos`
- `zona_cobertura`
- `punto_encuentro`
- `acreditacion`
- `horarios`

### Estados utilizados
- `borrador`
- `en_revision`
- `aprobado`
- `inactivo`

### Relaciones funcionales
- pertenece a una `estacion`
- se vincula con `productos` a través de `productos.actores_relacionados`
- puede vincularse con `imperdibles`

---

## `productos`
Productos ofrecidos dentro de la ruta.

### Campos base
- `nombre`: texto
- `categoria`: relation a `categorias_producto`
- `subcategoria`: relation a `subcategorias_producto` opcional
- `tecnicas`: relation múltiple a `tecnicas_producto`
- `descripcion`: texto opcional
- `estacion_id`: relation legacy simple a `estaciones`
- `estaciones_relacionadas`: relation múltiple a `estaciones`
- `actores_relacionados`: relation múltiple a `actores`
- `fotos`: files opcional
- `estado`: string
- `observaciones_revision`: texto opcional
- `created_by`: relation a `users`
- `updated_by`: relation a `users`

### Notas importantes
- `estacion_id` sigue existiendo como compatibilidad legacy.
- La relación principal actual con estaciones es `estaciones_relacionadas`.
- La subcategoría depende funcionalmente de la categoría elegida.

### Estados utilizados
- `borrador`
- `en_revision`
- `aprobado`
- `inactivo`

### Relaciones funcionales
- categoría y subcategoría
- múltiples técnicas
- múltiples actores
- cero, una o varias estaciones
- puede vincularse con `imperdibles`

---

## `experiencias`
Experiencias turísticas o culturales ofrecidas en una estación.

### Campos principales
- `titulo`: texto
- `categoria`: relation a `categorias_experiencia`
- `descripcion`: texto opcional
- `duracion`: texto opcional
- `recomendaciones`: texto opcional
- `responsable`: relation a `actores` opcional
- `ubicacion`: texto opcional
- `estacion_id`: relation a `estaciones`
- `fotos`: files opcional
- `estado`: string
- `observaciones_revision`: texto opcional
- `created_by`: relation a `users`
- `updated_by`: relation a `users`

### Estados utilizados
- `borrador`
- `en_revision`
- `aprobado`
- `inactivo`

### Relaciones funcionales
- pertenece a una estación
- puede tener actor responsable
- puede vincularse con `imperdibles`

---

## `imperdibles`
Puntos, actividades, atractivos o eventos destacados de la ruta.

### Campos principales
- `titulo`: texto
- `subtitulo`: texto opcional
- `descripcion`: texto opcional
- `tipo`: relation a `tipos_imperdible`
- `fecha_hora_evento`: date opcional
- `ubicacion`: texto opcional
- `latitud`: number opcional
- `longitud`: number opcional
- `duracion_sugerida`: texto opcional
- `recomendaciones`: texto opcional
- `accesibilidad`: texto opcional
- `horarios`: texto opcional
- `estacionalidad`: texto opcional
- `prioridad`: relation a `prioridades_imperdible`
- `estacion_id`: relation a `estaciones`
- `actores_relacionados`: relation múltiple a `actores`
- `productos_relacionados`: relation múltiple a `productos`
- `experiencias_relacionadas`: relation múltiple a `experiencias`
- `fotos`: files opcional
- `videos_enlaces`: texto opcional
- `estado`: string
- `observaciones_revision`: texto opcional
- `created_by`: relation a `users`
- `updated_by`: relation a `users`

### Notas importantes
- Cuando el `tipo` corresponde a evento, la UI exige `fecha_hora_evento`.
- La app trabaja en horario local del navegador y guarda la fecha/hora en UTC.

### Estados utilizados
- `borrador`
- `en_revision`
- `aprobado`
- `inactivo`

---

## `auditoria`
Registro de trazabilidad de cambios.

### Campos principales
- `entidad`: texto
- `registro_id`: texto
- `accion`: texto
- `usuario`: relation o texto con id de usuario
- `rol_usuario`: texto
- `datos_anteriores`: json
- `datos_nuevos`: json

### Uso
- se registra al crear
- se registra al editar
- se registra al eliminar
- se usa para seguimiento interno

---

## Colecciones De Catálogo

## `tipos_actor`
Define los tipos de actor.

### Ejemplos
- artesano
- productor
- hospedaje
- gastronómico
- guía

### Campos
- `nombre`
- `activo`

---

## `categorias_producto`
Categorías principales de productos.

### Campos
- `nombre`
- `activo`

---

## `subcategorias_producto`
Subcategorías dependientes de `categorias_producto`.

### Campos
- `nombre`
- `activo`
- `categoria_padre`: relation a `categorias_producto`

### Regla funcional
- una subcategoría debe pertenecer a una categoría padre
- la UI de productos solo muestra subcategorías compatibles con la categoría elegida

---

## `tecnicas_producto`
Etiquetas o técnicas asociables a productos.

### Campos
- `nombre`
- `activo`

---

## `categorias_experiencia`
Categorías de experiencias.

### Campos
- `nombre`
- `activo`

---

## `tipos_imperdible`
Tipos de imperdibles.

### Ejemplos
- atractivo
- actividad
- evento

### Campos
- `nombre`
- `activo`

---

## `prioridades_imperdible`
Prioridad de un imperdible.

### Ejemplos
- alta
- media
- baja

### Campos
- `nombre`
- `activo`

---

## `departamentos`
Catálogo de departamentos.

### Campos
- `nombre`
- `activo`

---

## Colecciones Opcionales O En Discusión

## `comentarios`
Colección pensada para comentarios asociados a entidades.

### Campos previstos
- `entidad_tipo`
- `entidad_id`
- `comentario`
- `autor_nombre`
- `created`

### Estado
- su uso depende de si la colección existe efectivamente en PocketBase
- la aplicación tolera que no exista

---

## `puntuaciones`
Colección pensada para puntuaciones asociadas a entidades.

### Campos previstos
- `entidad_tipo`
- `entidad_id`
- `puntuacion`
- `comentario`
- `autor_nombre`
- `created`

### Estado
- su uso depende de si la colección existe efectivamente en PocketBase
- la aplicación tolera que no exista

---

## Convenciones Relevantes

### Estados editoriales
Las entidades de contenido usan mayormente estos estados:

- `borrador`
- `en_revision`
- `aprobado`
- `inactivo`

### Trazabilidad
Las entidades principales suelen incluir:

- `created`
- `updated`
- `created_by`
- `updated_by`

### Catálogos
Los catálogos usan normalmente:

- `nombre`
- `activo`

### Relaciones expandidas
La aplicación usa con frecuencia `expand` de PocketBase para:

- mostrar nombres legibles de catálogos
- resolver relaciones entre entidades
- mostrar autoría

---

## Resumen De Dependencias Entre Colecciones

### Contenido territorial
- `estaciones` <- `actores`
- `estaciones` <- `experiencias`
- `estaciones` <- `imperdibles`
- `estaciones` <- `productos.estacion_id`
- `estaciones` <- `productos.estaciones_relacionadas`

### Catálogos
- `actores.tipo` -> `tipos_actor`
- `productos.categoria` -> `categorias_producto`
- `productos.subcategoria` -> `subcategorias_producto`
- `productos.tecnicas` -> `tecnicas_producto`
- `experiencias.categoria` -> `categorias_experiencia`
- `imperdibles.tipo` -> `tipos_imperdible`
- `imperdibles.prioridad` -> `prioridades_imperdible`
- `estaciones.departamento` -> `departamentos`

### Relaciones entre contenidos
- `productos.actores_relacionados` -> `actores`
- `imperdibles.actores_relacionados` -> `actores`
- `imperdibles.productos_relacionados` -> `productos`
- `imperdibles.experiencias_relacionadas` -> `experiencias`
- `experiencias.responsable` -> `actores`

---

## Recomendaciones De Mantenimiento
- Mantener sincronizadas las relaciones bidireccionales gestionadas por UI, especialmente `productos.actores_relacionados`.
- Mantener `subcategorias_producto.categoria_padre` consistente para evitar subcategorías huérfanas.
- Si se decide usar `comentarios` y `puntuaciones`, documentar sus API Rules y su estrategia definitiva.
- Cuando se elimine la compatibilidad legacy, migrar completamente `productos.estacion_id` hacia `productos.estaciones_relacionadas`.

---

## Última Actualización
Documento generado en función del código actual del proyecto `admin-rutadeltelar`.
