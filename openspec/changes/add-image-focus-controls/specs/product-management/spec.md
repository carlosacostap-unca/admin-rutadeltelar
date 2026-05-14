## MODIFIED Requirements

### Requirement: Product media
El sistema MUST permitir registrar imagenes de productos con metadatos de foco para superficies recortadas.

#### Scenario: Product cover focus
- **GIVEN** un producto con foto de portada
- **WHEN** un usuario ajusta el foco de la portada
- **THEN** el sistema MUST guardar coordenadas porcentuales de foco para esa portada

#### Scenario: Product gallery focus metadata
- **GIVEN** un producto con fotos existentes en galeria
- **WHEN** un usuario ajusta el foco de una foto de galeria
- **THEN** el sistema MUST guardar el foco asociado al nombre de archivo
