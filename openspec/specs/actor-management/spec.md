## Purpose

Definir la gestion de actores territoriales vinculados a estaciones, incluyendo subtipos como artesanos, productores, hospedajes, gastronomicos y guias.

## Requirements

### Requirement: Actor CRUD
El sistema MUST permitir crear, listar, consultar, editar y desactivar actores vinculados a una estacion.

#### Scenario: Create actor
- **GIVEN** un usuario con permisos de edicion
- **WHEN** crea un actor
- **THEN** el sistema MUST requerir nombre, tipo de actor, estacion vinculada y estado
- **AND** guardar los campos especificos disponibles para el subtipo seleccionado

#### Scenario: Edit actor
- **GIVEN** un actor existente
- **WHEN** un usuario autorizado modifica sus datos
- **THEN** el sistema MUST guardar los cambios
- **AND** conservar la relacion con la estacion seleccionada salvo que el usuario la modifique explicitamente

### Requirement: Actor subtype fields
El sistema MUST soportar campos diferenciados por subtipo de actor sin perder un conjunto comun de identificacion, contacto y ubicacion.

#### Scenario: Artisan actor
- **GIVEN** un actor de tipo artesano
- **WHEN** se guardan sus datos
- **THEN** el sistema MUST permitir registrar tecnicas, materiales, productos ofrecidos y visitas o demostraciones

#### Scenario: Producer actor
- **GIVEN** un actor de tipo productor
- **WHEN** se guardan sus datos
- **THEN** el sistema MUST permitir registrar rubro productivo, escala de produccion, modalidad de venta y productos ofrecidos

#### Scenario: Accommodation actor
- **GIVEN** un actor de tipo hospedaje
- **WHEN** se guardan sus datos
- **THEN** el sistema MUST permitir registrar tipo de hospedaje, capacidad, servicios, horarios y disponibilidad

#### Scenario: Gastronomy actor
- **GIVEN** un actor de tipo gastronomico
- **WHEN** se guardan sus datos
- **THEN** el sistema MUST permitir registrar tipo de propuesta, especialidades, platos destacados, modalidad de servicio y servicios adicionales

#### Scenario: Tourism guide actor
- **GIVEN** un actor de tipo guia de turismo
- **WHEN** se guardan sus datos
- **THEN** el sistema MUST permitir registrar especialidad, idiomas, recorridos, duracion, zona de cobertura, punto de encuentro y acreditacion

### Requirement: Actor listing and filtering
El sistema MUST permitir encontrar actores por criterios operativos.

#### Scenario: Filter actors
- **GIVEN** multiples actores cargados
- **WHEN** el usuario filtra por nombre, tipo, estacion o estado
- **THEN** el sistema MUST mostrar los actores coincidentes

#### Scenario: Display station context
- **GIVEN** un actor relacionado con una estacion
- **WHEN** aparece en listados o detalle
- **THEN** el sistema MUST mostrar la estacion relacionada cuando la informacion este disponible

### Requirement: Actor location and multimedia
El sistema MUST permitir registrar ubicacion y multimedia de actores cuando aplique.

#### Scenario: Actor geolocation
- **GIVEN** un actor con coordenadas
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST exponer latitud, longitud y ubicacion textual cuando existan

#### Scenario: Actor photos
- **GIVEN** un actor con fotos asociadas
- **WHEN** el usuario consulta su detalle
- **THEN** el sistema MUST mostrar o exponer las fotos registradas
