## ADDED Requirements

### Requirement: Entity cover image
El sistema MUST support una imagen de portada unica para cada entidad con multimedia.

#### Scenario: Cover image for summary views
- **GIVEN** una entidad con `foto_portada`
- **WHEN** el sistema la muestra en tarjetas, listados o resumenes visuales
- **THEN** el sistema MUST usar `foto_portada` como imagen principal

#### Scenario: Legacy cover fallback
- **GIVEN** una entidad sin `foto_portada` y con imagenes legacy en `fotos`
- **WHEN** el sistema necesita mostrar una portada
- **THEN** el sistema MUST usar la primera imagen de `fotos` como fallback de portada

### Requirement: Entity image gallery
El sistema MUST support una galeria separada de imagenes complementarias para cada entidad con multimedia.

#### Scenario: Gallery excludes cover
- **GIVEN** una entidad con portada y galeria
- **WHEN** el usuario consulta la galeria
- **THEN** el sistema MUST mostrar solo imagenes de galeria y MUST NOT repetir la portada

#### Scenario: Gallery limit
- **GIVEN** un usuario edita o crea una entidad con multimedia
- **WHEN** agrega imagenes a la galeria
- **THEN** el sistema MUST permitir hasta cinco imagenes de galeria ademas de la portada

#### Scenario: Legacy gallery fallback
- **GIVEN** una entidad con imagenes legacy en `fotos`
- **WHEN** el sistema construye la galeria
- **THEN** el sistema MUST tratar las imagenes posteriores a la portada fallback como imagenes de galeria

### Requirement: Cover selection during edit
El sistema MUST permitir reemplazar o elegir la portada durante la edicion de una entidad con multimedia.

#### Scenario: Choose existing image as cover
- **GIVEN** una entidad con imagenes existentes
- **WHEN** el usuario elige una de esas imagenes como portada
- **THEN** el sistema MUST usar esa imagen como portada y excluirla de la galeria visible

#### Scenario: Upload new cover
- **GIVEN** una entidad con o sin portada existente
- **WHEN** el usuario sube una nueva imagen de portada
- **THEN** el sistema MUST guardar la nueva imagen como portada sin consumir cupos de galeria
