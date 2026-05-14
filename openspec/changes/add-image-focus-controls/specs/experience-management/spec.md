## MODIFIED Requirements

### Requirement: Experience discovery
El sistema MUST permitir mostrar experiencias con imagenes y metadatos de foco para superficies recortadas.

#### Scenario: Experience cover focus
- **GIVEN** una experiencia con foto de portada
- **WHEN** un usuario ajusta el foco de la portada
- **THEN** el sistema MUST guardar coordenadas porcentuales de foco para esa portada

#### Scenario: Experience gallery focus metadata
- **GIVEN** una experiencia con fotos existentes en galeria
- **WHEN** un usuario ajusta el foco de una foto de galeria
- **THEN** el sistema MUST guardar el foco asociado al nombre de archivo
