## Purpose

Definir el flujo editorial comun para estaciones, actores, productos, experiencias e imperdibles.

## Requirements

### Requirement: Editorial states
Las entidades principales de contenido MUST usar estados editoriales comunes: `borrador`, `en_revision`, `aprobado` e `inactivo`.

#### Scenario: Draft creation
- **GIVEN** un usuario con permisos de edicion
- **WHEN** crea contenido nuevo
- **THEN** el sistema MUST permitir guardarlo como `borrador`

#### Scenario: Submit for review
- **GIVEN** contenido en `borrador`
- **WHEN** un usuario con permisos de edicion lo envia a revision
- **THEN** el sistema MUST cambiar su estado a `en_revision`

#### Scenario: Approve content
- **GIVEN** contenido en `en_revision`
- **WHEN** un usuario con permisos de revision lo aprueba
- **THEN** el sistema MUST cambiar su estado a `aprobado`

#### Scenario: Reject content
- **GIVEN** contenido en `en_revision`
- **WHEN** un usuario con permisos de revision lo rechaza
- **THEN** el sistema MUST devolverlo a `borrador`
- **AND** registrar observaciones de revision cuando existan

#### Scenario: Deactivate content
- **GIVEN** contenido aprobado o vigente
- **WHEN** un usuario autorizado lo desactiva
- **THEN** el sistema MUST cambiar su estado a `inactivo`

### Requirement: Review observations
El sistema MUST permitir registrar observaciones de revision en entidades editoriales.

#### Scenario: Reviewer leaves observations
- **GIVEN** una entidad en revision
- **WHEN** un revisor agrega observaciones
- **THEN** el sistema MUST guardar `observaciones_revision`
- **AND** mostrarlas a usuarios con acceso al detalle o formulario correspondiente

### Requirement: Status-aware views
El sistema MUST ofrecer vistas operativas para contenido en borrador y contenido pendiente de revision.

#### Scenario: Drafts view
- **GIVEN** contenido en estado `borrador`
- **WHEN** el usuario abre la vista de borradores
- **THEN** el sistema MUST listar entidades pendientes de completar o enviar a revision

#### Scenario: Review queue
- **GIVEN** contenido en estado `en_revision`
- **WHEN** el usuario abre la vista de revision
- **THEN** el sistema MUST listar entidades pendientes de aprobacion o rechazo

### Requirement: Permission-aware workflow actions
El sistema MUST mostrar o ejecutar acciones de cambio de estado solo cuando el rol activo lo permite.

#### Scenario: Editor cannot approve
- **GIVEN** un usuario con rol activo `editor`
- **WHEN** consulta contenido en revision
- **THEN** el sistema MUST impedir aprobar o rechazar ese contenido

#### Scenario: Reviewer can approve
- **GIVEN** un usuario con rol activo `revisor`
- **WHEN** consulta contenido en revision
- **THEN** el sistema MUST permitir aprobar o rechazar ese contenido
