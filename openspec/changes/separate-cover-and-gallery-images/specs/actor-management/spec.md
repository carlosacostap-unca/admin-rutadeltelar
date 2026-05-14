## MODIFIED Requirements

### Requirement: Actor location and multimedia
El sistema MUST permitir registrar ubicacion, portada y galeria de actores cuando aplique.

#### Scenario: Actor geolocation
- **GIVEN** un actor con coordenadas
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST exponer latitud, longitud y ubicacion textual cuando existan

#### Scenario: Actor cover image
- **GIVEN** un actor con `foto_portada` o fotos legacy
- **WHEN** el sistema muestra el actor en tarjetas, listados o detalle
- **THEN** el sistema MUST usar la portada explicita o la primera foto legacy como imagen principal

#### Scenario: Actor gallery
- **GIVEN** un actor con imagenes de galeria o fotos legacy adicionales
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST mostrar una galeria separada que excluya la portada
