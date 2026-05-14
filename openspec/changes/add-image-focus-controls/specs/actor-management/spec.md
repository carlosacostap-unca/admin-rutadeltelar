## MODIFIED Requirements

### Requirement: Actor location and multimedia
El sistema MUST permitir registrar ubicacion, multimedia y metadatos de foco de imagenes de actores cuando aplique.

#### Scenario: Actor cover focus
- **GIVEN** un actor con foto de portada
- **WHEN** un usuario ajusta el foco de la portada
- **THEN** el sistema MUST guardar coordenadas porcentuales de foco
- **AND** permitir que vistas recortadas usen ese foco para evitar ocultar el sujeto principal

#### Scenario: Actor gallery focus metadata
- **GIVEN** un actor con fotos existentes en galeria
- **WHEN** un usuario ajusta el foco de una foto de galeria
- **THEN** el sistema MUST guardar el foco asociado al nombre de archivo
- **AND** usar foco centrado cuando una foto no tenga metadatos configurados
