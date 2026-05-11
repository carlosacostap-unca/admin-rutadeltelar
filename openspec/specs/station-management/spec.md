## Purpose

Definir la gestion de estaciones como eje territorial del sistema Ruta del Telar.

## Requirements

### Requirement: Station CRUD
El sistema MUST permitir crear, listar, consultar, editar y desactivar estaciones.

#### Scenario: Create station
- **GIVEN** un usuario con permisos de edicion
- **WHEN** crea una estacion
- **THEN** el sistema MUST guardar nombre, localidad, estado inicial y datos territoriales disponibles
- **AND** asociar metadatos de creacion

#### Scenario: Edit station
- **GIVEN** una estacion existente
- **WHEN** un usuario con permisos de edicion actualiza sus datos
- **THEN** el sistema MUST persistir los cambios
- **AND** actualizar metadatos de modificacion

#### Scenario: Deactivate station
- **GIVEN** una estacion existente
- **WHEN** un usuario autorizado la desactiva
- **THEN** el sistema MUST cambiar su estado a `inactivo`
- **AND** conservar el registro para consulta historica

### Requirement: Station data model
Cada estacion MUST almacenar informacion general suficiente para identificarla, ubicarla y describirla.

#### Scenario: General information
- **GIVEN** una estacion
- **WHEN** se consulta su detalle
- **THEN** el sistema MUST exponer nombre, localidad, descripcion general y estado
- **AND** incluir eslogan, departamento, foto de portada, galeria, latitud y longitud cuando existan

#### Scenario: Geographic data
- **GIVEN** un formulario de estacion
- **WHEN** el usuario informa coordenadas
- **THEN** el sistema MUST guardar latitud y longitud como valores numericos
- **AND** permitir visualizar la ubicacion en componentes de mapa

### Requirement: Station listing
El sistema MUST ofrecer una vista de listado para consultar y administrar estaciones.

#### Scenario: Filter stations
- **GIVEN** multiples estaciones cargadas
- **WHEN** el usuario filtra por nombre, localidad o estado
- **THEN** el sistema MUST mostrar solo estaciones que coincidan con los filtros aplicados

#### Scenario: Row actions
- **GIVEN** una estacion en el listado
- **WHEN** el usuario revisa sus acciones disponibles
- **THEN** el sistema MUST ofrecer acceso a ver detalle, editar y desactivar segun permisos

### Requirement: Station detail hub
El sistema MUST presentar el detalle de estacion como ficha integral con sus contenidos relacionados.

#### Scenario: Detail sections
- **GIVEN** una estacion existente
- **WHEN** el usuario abre su detalle
- **THEN** el sistema MUST mostrar informacion general
- **AND** permitir acceder a actores, productos, experiencias, imperdibles, multimedia o mapa e historial relacionado

#### Scenario: Related content context
- **GIVEN** una estacion con contenidos asociados
- **WHEN** el usuario consulta las secciones relacionadas
- **THEN** el sistema MUST mantener visible el contexto de la estacion consultada
