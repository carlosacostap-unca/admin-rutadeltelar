## Purpose

Definir la trazabilidad de cambios sobre entidades principales del sistema.

## Requirements

### Requirement: Audit record creation
El sistema MUST registrar auditoria al crear, editar o eliminar registros de contenido y administracion cuando se use el flujo auditado.

#### Scenario: Audited create
- **GIVEN** un usuario autenticado
- **WHEN** crea un registro mediante el flujo auditado
- **THEN** el sistema MUST crear un registro en `auditoria`
- **AND** guardar entidad, registro, accion, usuario, rol, datos anteriores nulos y datos nuevos

#### Scenario: Audited update
- **GIVEN** un usuario autenticado
- **WHEN** actualiza un registro mediante el flujo auditado
- **THEN** el sistema MUST guardar datos anteriores y datos nuevos en `auditoria`

#### Scenario: Audited delete
- **GIVEN** un usuario autenticado
- **WHEN** elimina un registro mediante el flujo auditado
- **THEN** el sistema MUST guardar la accion `eliminar`
- **AND** conservar los datos anteriores disponibles

### Requirement: Editorial action labels
El sistema MUST registrar acciones de auditoria especificas para transiciones editoriales reconocidas.

#### Scenario: Submit for review audit
- **GIVEN** un registro cambia de `borrador` a `en_revision`
- **WHEN** se guarda la actualizacion
- **THEN** la auditoria MUST registrar la accion `enviar_a_revision`

#### Scenario: Approve from review audit
- **GIVEN** un registro cambia de `en_revision` a `aprobado`
- **WHEN** se guarda la actualizacion
- **THEN** la auditoria MUST registrar la accion `aprobado_desde_revision`

#### Scenario: Reject to draft audit
- **GIVEN** un registro cambia de `en_revision` a `borrador`
- **WHEN** se guarda la actualizacion
- **THEN** la auditoria MUST registrar la accion `rechazar_a_borrador`

#### Scenario: Deactivate audit
- **GIVEN** un registro cambia de `aprobado` a `inactivo`
- **WHEN** se guarda la actualizacion
- **THEN** la auditoria MUST registrar la accion `desactivar`

### Requirement: Audit browsing
El sistema MUST permitir consultar registros de auditoria desde vistas de listado y detalle.

#### Scenario: Audit list
- **GIVEN** registros de auditoria existentes
- **WHEN** un usuario autorizado abre `/auditoria`
- **THEN** el sistema MUST mostrar un listado consultable de acciones registradas

#### Scenario: Audit detail
- **GIVEN** un registro de auditoria existente
- **WHEN** el usuario abre su detalle
- **THEN** el sistema MUST mostrar entidad, registro afectado, accion, usuario, rol y datos registrados
