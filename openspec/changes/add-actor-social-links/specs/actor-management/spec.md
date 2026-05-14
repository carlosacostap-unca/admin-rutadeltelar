## MODIFIED Requirements

### Requirement: Actor subtype fields
El sistema MUST soportar campos diferenciados por subtipo de actor sin perder un conjunto comun de identificacion, contacto, enlaces digitales y ubicacion.

#### Scenario: Actor digital links
- **GIVEN** un actor con enlaces de Facebook, Instagram o pagina web
- **WHEN** un usuario crea, edita o consulta el actor
- **THEN** el sistema MUST permitir guardar esos enlaces como URLs opcionales
- **AND** mostrar como enlaces externos solo los valores disponibles
- **AND** conservar los enlaces vacios sin bloquear la carga del actor
