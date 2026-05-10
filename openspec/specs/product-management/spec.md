## Purpose

Definir la gestion de productos asociados a estaciones, actores, categorias, subcategorias y tecnicas.

## Requirements

### Requirement: Product CRUD
El sistema MUST permitir crear, listar, consultar, editar y desactivar productos.

#### Scenario: Create product
- **GIVEN** un usuario con permisos de edicion
- **WHEN** crea un producto
- **THEN** el sistema MUST guardar nombre, categoria, estado y descripcion cuando exista
- **AND** permitir relacionarlo con estaciones y actores

#### Scenario: Edit product
- **GIVEN** un producto existente
- **WHEN** un usuario autorizado modifica sus datos
- **THEN** el sistema MUST persistir categoria, subcategoria, tecnicas, relaciones y contenido multimedia actualizado

### Requirement: Product classification
El sistema MUST clasificar productos mediante categorias, subcategorias y tecnicas parametrizables.

#### Scenario: Category and subcategory
- **GIVEN** un producto
- **WHEN** se asigna categoria y subcategoria
- **THEN** el sistema MUST guardar ambas referencias
- **AND** la subcategoria MUST corresponder a la categoria padre cuando esa relacion exista

#### Scenario: Techniques
- **GIVEN** un producto artesanal o textil
- **WHEN** el usuario selecciona tecnicas
- **THEN** el sistema MUST permitir asociar multiples tecnicas de producto

### Requirement: Product relationships
El sistema MUST permitir vincular productos con estaciones y actores relevantes.

#### Scenario: Multiple related stations
- **GIVEN** un producto disponible en mas de una estacion
- **WHEN** el usuario asigna estaciones relacionadas
- **THEN** el sistema MUST guardar multiples relaciones con estaciones

#### Scenario: Related actors
- **GIVEN** un producto elaborado o comercializado por actores
- **WHEN** el usuario asigna actores relacionados
- **THEN** el sistema MUST guardar multiples relaciones con actores

### Requirement: Product listing and detail
El sistema MUST ofrecer vistas para buscar productos y consultar su ficha completa.

#### Scenario: Filter products
- **GIVEN** multiples productos cargados
- **WHEN** el usuario filtra por nombre, categoria, estacion, actor o estado
- **THEN** el sistema MUST mostrar los productos coincidentes

#### Scenario: Product detail
- **GIVEN** un producto existente
- **WHEN** el usuario abre su detalle
- **THEN** el sistema MUST mostrar datos descriptivos, clasificacion, relaciones, estado y fotos cuando existan
