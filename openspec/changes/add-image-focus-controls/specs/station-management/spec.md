## MODIFIED Requirements

### Requirement: Station multimedia
El sistema MUST permitir registrar imagenes de estaciones con metadatos de foco para superficies recortadas.

#### Scenario: Station cover focus
- **GIVEN** una estacion con foto de portada
- **WHEN** un usuario ajusta el foco de la portada
- **THEN** el sistema MUST guardar coordenadas porcentuales de foco para esa portada

#### Scenario: Station gallery focus metadata
- **GIVEN** una estacion con fotos existentes en galeria
- **WHEN** un usuario ajusta el foco de una foto de galeria
- **THEN** el sistema MUST guardar el foco asociado al nombre de archivo
