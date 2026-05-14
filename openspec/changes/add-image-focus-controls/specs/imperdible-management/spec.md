## MODIFIED Requirements

### Requirement: Imperdible multimedia
El sistema MUST permitir registrar imagenes de imperdibles con metadatos de foco para superficies recortadas.

#### Scenario: Imperdible cover focus
- **GIVEN** un imperdible con foto de portada
- **WHEN** un usuario ajusta el foco de la portada
- **THEN** el sistema MUST guardar coordenadas porcentuales de foco para esa portada

#### Scenario: Imperdible gallery focus metadata
- **GIVEN** un imperdible con fotos existentes en galeria
- **WHEN** un usuario ajusta el foco de una foto de galeria
- **THEN** el sistema MUST guardar el foco asociado al nombre de archivo
