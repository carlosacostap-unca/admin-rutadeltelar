## Purpose

Definir la gestion de catalogos parametrizables utilizados por formularios, filtros y relaciones de contenido.

## Requirements

### Requirement: Supported catalogs
El sistema MUST administrar catalogos para tipos de actor, categorias y subcategorias de producto, tecnicas de producto, categorias de experiencia, tipos y prioridades de imperdible, y departamentos.

#### Scenario: Catalog overview
- **GIVEN** un usuario autorizado
- **WHEN** abre la vista de parametrizaciones
- **THEN** el sistema MUST mostrar los catalogos configurados disponibles para administracion

### Requirement: Catalog item structure
Cada item de catalogo MUST soportar nombre, estado activo y metadatos temporales cuando la coleccion los provea.

#### Scenario: Active catalog item
- **GIVEN** un item de catalogo activo
- **WHEN** se carga un selector de formulario
- **THEN** el sistema MUST poder presentarlo como opcion seleccionable

#### Scenario: Inactive catalog item
- **GIVEN** un item de catalogo inactivo
- **WHEN** se carga un selector de formulario
- **THEN** el sistema MUST evitar ofrecerlo como opcion para nuevos registros cuando el flujo filtra por activos

### Requirement: Parent child catalog relationships
El sistema MUST soportar relaciones padre-hijo para catalogos que lo requieran, especialmente subcategorias de producto.

#### Scenario: Product subcategory parent
- **GIVEN** una subcategoria de producto
- **WHEN** se consulta expandida
- **THEN** el sistema MUST exponer su categoria padre cuando exista

#### Scenario: Filter subcategories by category
- **GIVEN** una categoria de producto seleccionada
- **WHEN** el usuario elige subcategoria
- **THEN** el sistema MUST limitar las opciones a subcategorias correspondientes cuando esa relacion este disponible

### Requirement: Catalog use in content
El sistema MUST usar catalogos para mantener consistencia en formularios, listados y filtros.

#### Scenario: Actor type selector
- **GIVEN** un formulario de actor
- **WHEN** el usuario selecciona tipo
- **THEN** el sistema MUST usar el catalogo `tipos_actor`

#### Scenario: Product classification selectors
- **GIVEN** un formulario de producto
- **WHEN** el usuario selecciona categoria, subcategoria o tecnica
- **THEN** el sistema MUST usar los catalogos de producto correspondientes

#### Scenario: Imperdible selectors
- **GIVEN** un formulario de imperdible
- **WHEN** el usuario selecciona tipo o prioridad
- **THEN** el sistema MUST usar `tipos_imperdible` y `prioridades_imperdible`
