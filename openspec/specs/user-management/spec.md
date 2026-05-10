## Purpose

Definir la administracion interna de usuarios, roles y estado de acceso al sistema.

## Requirements

### Requirement: User records
El sistema MUST administrar usuarios internos con nombre, email, estado activo, roles, observaciones y trazabilidad temporal.

#### Scenario: Create user
- **GIVEN** un administrador autenticado
- **WHEN** crea un usuario
- **THEN** el sistema MUST guardar nombre, email, estado activo y al menos un rol
- **AND** registrar fecha de creacion y actualizacion

#### Scenario: Update user
- **GIVEN** un administrador autenticado
- **WHEN** modifica un usuario existente
- **THEN** el sistema MUST actualizar los campos editables
- **AND** conservar el identificador unico del usuario

### Requirement: User activation
El sistema MUST permitir activar y desactivar usuarios para controlar el acceso sin eliminar su historial.

#### Scenario: Deactivate user
- **GIVEN** un administrador autenticado
- **WHEN** desactiva un usuario
- **THEN** el sistema MUST impedir futuros inicios de sesion de ese usuario
- **AND** conservar sus datos historicos

#### Scenario: Reactivate user
- **GIVEN** un usuario desactivado
- **WHEN** un administrador lo reactiva
- **THEN** el sistema MUST permitir que vuelva a iniciar sesion si su autenticacion de Google es valida

### Requirement: Role assignment
El sistema MUST permitir asignar uno o mas roles validos a cada usuario.

#### Scenario: Multiple roles
- **GIVEN** un administrador autenticado
- **WHEN** asigna roles a un usuario
- **THEN** el sistema MUST aceptar combinaciones de `admin`, `editor`, `revisor` y `consultor`

#### Scenario: Invalid role
- **GIVEN** una solicitud de guardado de usuario
- **WHEN** incluye un rol fuera del conjunto permitido
- **THEN** el sistema MUST rechazar o impedir la asignacion del rol invalido

### Requirement: Last login tracking
El sistema MUST actualizar la fecha de ultimo ingreso cuando un usuario inicia sesion correctamente.

#### Scenario: Successful login timestamp
- **GIVEN** un usuario activo autenticado con Google
- **WHEN** el inicio de sesion se completa
- **THEN** el sistema MUST guardar `last_login` con la fecha y hora actuales
