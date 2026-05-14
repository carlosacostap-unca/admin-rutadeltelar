## MODIFIED Requirements

### Requirement: Experience discovery
El sistema MUST permitir consultar experiencias por criterios relevantes y distinguir portada de galeria.

#### Scenario: Filter experiences
- **GIVEN** multiples experiencias cargadas
- **WHEN** el usuario filtra por titulo, categoria, estacion, responsable o estado
- **THEN** el sistema MUST mostrar las experiencias coincidentes

#### Scenario: Experience detail
- **GIVEN** una experiencia existente
- **WHEN** el usuario abre su detalle
- **THEN** el sistema MUST mostrar descripcion, duracion, recomendaciones, ubicacion, responsable, estacion, estado, portada y galeria cuando existan

#### Scenario: Experience cover in summary views
- **GIVEN** una experiencia con `foto_portada` o fotos legacy
- **WHEN** el sistema muestra la experiencia en tarjetas, listados o resumenes visuales
- **THEN** el sistema MUST usar la portada explicita o la primera foto legacy como imagen principal

#### Scenario: Experience gallery excludes cover
- **GIVEN** una experiencia con portada y galeria
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST mostrar la galeria sin repetir la portada
