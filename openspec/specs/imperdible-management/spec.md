## Purpose

Definir la gestion de imperdibles como puntos, eventos o recomendaciones destacadas dentro de una estacion.

## Requirements

### Requirement: Imperdible CRUD
El sistema MUST permitir crear, listar, consultar, editar y desactivar imperdibles.

#### Scenario: Create imperdible
- **GIVEN** un usuario con permisos de edicion
- **WHEN** crea un imperdible
- **THEN** el sistema MUST guardar titulo, tipo, prioridad, estacion vinculada y estado
- **AND** permitir subtitulo, descripcion, ubicacion, recomendaciones, accesibilidad, fotos y enlaces de video

#### Scenario: Edit imperdible
- **GIVEN** un imperdible existente
- **WHEN** un usuario autorizado actualiza sus datos
- **THEN** el sistema MUST persistir cambios de contenido, relaciones, ubicacion y multimedia

### Requirement: Imperdible classification and priority
El sistema MUST clasificar imperdibles por tipo y prioridad parametrizables.

#### Scenario: Assign type and priority
- **GIVEN** un imperdible
- **WHEN** el usuario selecciona tipo y prioridad
- **THEN** el sistema MUST guardar ambas referencias
- **AND** mostrarlas en listados y detalle cuando esten disponibles

### Requirement: Imperdible relationships
El sistema MUST permitir relacionar imperdibles con actores, productos y experiencias.

#### Scenario: Related content
- **GIVEN** un imperdible con contenidos vinculados
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST mostrar actores, productos y experiencias relacionadas cuando existan

#### Scenario: Edit related content
- **GIVEN** un usuario con permisos de edicion
- **WHEN** modifica las relaciones de un imperdible
- **THEN** el sistema MUST guardar multiples referencias a actores, productos y experiencias

### Requirement: Imperdible event and location data
El sistema MUST soportar datos de evento, horarios, estacionalidad y ubicacion para imperdibles.

#### Scenario: Event date
- **GIVEN** un imperdible con fecha u hora de evento
- **WHEN** se guarda el registro
- **THEN** el sistema MUST persistir `fecha_hora_evento`

#### Scenario: Geolocated imperdible
- **GIVEN** un imperdible con coordenadas
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST exponer latitud, longitud y ubicacion textual

#### Scenario: Practical visit data
- **GIVEN** un imperdible cargado
- **WHEN** el usuario revisa su ficha
- **THEN** el sistema MUST mostrar duracion sugerida, horarios, estacionalidad, recomendaciones y accesibilidad cuando existan
