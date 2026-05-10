## Purpose

Definir comentarios y puntuaciones asociados a entidades de contenido cuando las colecciones correspondientes esten disponibles.

## Requirements

### Requirement: Entity comments
El sistema MUST soportar comentarios asociados a estaciones, actores, productos, experiencias e imperdibles cuando exista la coleccion `comentarios`.

#### Scenario: Create comment
- **GIVEN** una entidad de contenido existente
- **WHEN** un usuario agrega un comentario
- **THEN** el sistema MUST guardar tipo de entidad, id de entidad, texto del comentario, autor y fecha

#### Scenario: List comments
- **GIVEN** comentarios asociados a una entidad
- **WHEN** el usuario abre la seccion de feedback de esa entidad
- **THEN** el sistema MUST listar los comentarios relacionados con esa entidad

### Requirement: Entity ratings
El sistema MUST soportar puntuaciones asociadas a entidades de contenido cuando exista la coleccion `puntuaciones`.

#### Scenario: Create rating
- **GIVEN** una entidad de contenido existente
- **WHEN** un usuario agrega una puntuacion
- **THEN** el sistema MUST guardar tipo de entidad, id de entidad, valor numerico, comentario opcional, autor y fecha

#### Scenario: List ratings
- **GIVEN** puntuaciones asociadas a una entidad
- **WHEN** el usuario abre la seccion de feedback
- **THEN** el sistema MUST listar las puntuaciones relacionadas

### Requirement: Optional collection handling
El sistema MUST tratar comentarios y puntuaciones como capacidades dependientes de la existencia de sus colecciones PocketBase.

#### Scenario: Missing feedback collection
- **GIVEN** una coleccion de feedback no disponible
- **WHEN** el sistema intenta cargar feedback
- **THEN** el sistema MUST degradar la experiencia sin impedir consultar la entidad principal
