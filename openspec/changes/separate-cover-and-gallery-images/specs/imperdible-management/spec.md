## MODIFIED Requirements

### Requirement: Imperdible CRUD
El sistema MUST permitir crear, listar, consultar, editar y desactivar imperdibles con portada y galeria diferenciadas.

#### Scenario: Create imperdible
- **GIVEN** un usuario con permisos de edicion
- **WHEN** crea un imperdible
- **THEN** el sistema MUST guardar titulo, tipo, prioridad, estacion vinculada y estado
- **AND** permitir subtitulo, descripcion, ubicacion, recomendaciones, accesibilidad, portada, galeria y enlaces de video

#### Scenario: Edit imperdible
- **GIVEN** un imperdible existente
- **WHEN** un usuario autorizado actualiza sus datos
- **THEN** el sistema MUST persistir cambios de contenido, relaciones, ubicacion, portada y galeria

#### Scenario: Imperdible cover in summary views
- **GIVEN** un imperdible con `foto_portada` o fotos legacy
- **WHEN** el sistema muestra el imperdible en tarjetas, listados o resumenes visuales
- **THEN** el sistema MUST usar la portada explicita o la primera foto legacy como imagen principal

#### Scenario: Imperdible gallery excludes cover
- **GIVEN** un imperdible con portada y galeria
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST mostrar la galeria sin repetir la portada
