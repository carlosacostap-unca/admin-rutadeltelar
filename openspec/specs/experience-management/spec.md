## Purpose

Definir la gestion de experiencias turisticas o culturales asociadas a estaciones y actores responsables.

## Requirements

### Requirement: Experience CRUD
El sistema MUST permitir crear, listar, consultar, editar y desactivar experiencias.

#### Scenario: Create experience
- **GIVEN** un usuario con permisos de edicion
- **WHEN** crea una experiencia
- **THEN** el sistema MUST guardar titulo, categoria, estacion vinculada y estado
- **AND** permitir descripcion, duracion, recomendaciones, responsable, ubicacion y fotos

#### Scenario: Edit experience
- **GIVEN** una experiencia existente
- **WHEN** un usuario autorizado actualiza sus datos
- **THEN** el sistema MUST persistir los cambios
- **AND** actualizar trazabilidad temporal y de usuario cuando corresponda

### Requirement: Experience classification
El sistema MUST clasificar experiencias mediante categorias parametrizables.

#### Scenario: Assign category
- **GIVEN** una experiencia
- **WHEN** el usuario selecciona una categoria
- **THEN** el sistema MUST guardar la referencia a la categoria de experiencia

### Requirement: Responsible actor
El sistema MUST permitir asociar una experiencia con un actor responsable cuando exista.

#### Scenario: Assign responsible actor
- **GIVEN** una experiencia vinculada a una estacion
- **WHEN** el usuario selecciona un responsable
- **THEN** el sistema MUST guardar la relacion con el actor responsable
- **AND** mostrar su nombre en la ficha cuando la relacion este expandida

### Requirement: Experience discovery
El sistema MUST permitir consultar experiencias por criterios relevantes.

#### Scenario: Filter experiences
- **GIVEN** multiples experiencias cargadas
- **WHEN** el usuario filtra por titulo, categoria, estacion, responsable o estado
- **THEN** el sistema MUST mostrar las experiencias coincidentes

#### Scenario: Experience detail
- **GIVEN** una experiencia existente
- **WHEN** el usuario abre su detalle
- **THEN** el sistema MUST mostrar descripcion, duracion, recomendaciones, ubicacion, responsable, estacion, estado y fotos disponibles
