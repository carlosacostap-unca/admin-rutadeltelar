## MODIFIED Requirements

### Requirement: Station data model
Cada estacion MUST almacenar informacion general suficiente para identificarla, ubicarla, describirla y separar portada de galeria.

#### Scenario: General information
- **GIVEN** una estacion
- **WHEN** se consulta su detalle
- **THEN** el sistema MUST exponer nombre, localidad, descripcion general y estado
- **AND** incluir eslogan, departamento, foto de portada, galeria, latitud y longitud cuando existan

#### Scenario: Geographic data
- **GIVEN** un formulario de estacion
- **WHEN** el usuario informa coordenadas
- **THEN** el sistema MUST guardar latitud y longitud como valores numericos
- **AND** permitir visualizar la ubicacion en componentes de mapa

#### Scenario: Station legacy multimedia
- **GIVEN** una estacion sin `foto_portada` ni `galeria_fotos` y con imagenes legacy en `fotos`
- **WHEN** el sistema muestra su multimedia
- **THEN** el sistema MUST usar la primera foto legacy como portada y las restantes como galeria
