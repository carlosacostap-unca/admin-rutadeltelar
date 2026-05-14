## MODIFIED Requirements

### Requirement: Product listing and detail
El sistema MUST ofrecer vistas para buscar productos y consultar su ficha completa con portada y galeria diferenciadas.

#### Scenario: Filter products
- **GIVEN** multiples productos cargados
- **WHEN** el usuario filtra por nombre, categoria, estacion, actor o estado
- **THEN** el sistema MUST mostrar los productos coincidentes

#### Scenario: Product detail
- **GIVEN** un producto existente
- **WHEN** el usuario abre su detalle
- **THEN** el sistema MUST mostrar datos descriptivos, clasificacion, relaciones, estado, portada y galeria cuando existan

#### Scenario: Product cover in summary views
- **GIVEN** un producto con `foto_portada` o fotos legacy
- **WHEN** el sistema muestra el producto en tarjetas, listados o resumenes visuales
- **THEN** el sistema MUST usar la portada explicita o la primera foto legacy como imagen principal

#### Scenario: Product gallery excludes cover
- **GIVEN** un producto con portada y galeria
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST mostrar la galeria sin repetir la portada
