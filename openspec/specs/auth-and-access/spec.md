## Purpose

Definir el acceso interno al sistema, la autenticacion con Google, la vigencia de sesion y el control de acciones por roles.

## Requirements

### Requirement: Google authentication
El sistema MUST permitir iniciar sesion con Google mediante PocketBase y solo conceder acceso a usuarios internos autorizados.

#### Scenario: Successful login
- **GIVEN** un usuario registrado en la coleccion `users`
- **AND** el usuario esta activo
- **WHEN** inicia sesion con Google
- **THEN** el sistema MUST crear una sesion valida
- **AND** redirigir al usuario al dashboard

#### Scenario: Inactive user
- **GIVEN** un usuario registrado con `active = false`
- **WHEN** intenta iniciar sesion con Google
- **THEN** el sistema MUST denegar el acceso
- **AND** mostrar un mensaje de usuario inactivo o no autorizado

### Requirement: Session lifecycle
El sistema MUST mantener sesiones autenticadas con vencimiento controlado y cierre de sesion explicito.

#### Scenario: Expired session
- **GIVEN** una sesion iniciada hace mas de la duracion permitida
- **WHEN** el sistema valida el estado de autenticacion
- **THEN** el sistema MUST limpiar la sesion local
- **AND** redirigir al usuario a `/login`

#### Scenario: Logout
- **GIVEN** un usuario autenticado
- **WHEN** solicita cerrar sesion
- **THEN** el sistema MUST borrar credenciales y datos locales de rol activo
- **AND** redirigir al usuario a `/login`

### Requirement: Role based permissions
El sistema MUST restringir operaciones administrativas, editoriales y de revision segun los roles del usuario.

#### Scenario: User administration
- **GIVEN** un usuario autenticado
- **WHEN** intenta administrar usuarios
- **THEN** el sistema MUST permitir la accion solo si el usuario tiene rol `admin`

#### Scenario: Content editing
- **GIVEN** un usuario autenticado
- **WHEN** intenta crear o editar contenido
- **THEN** el sistema MUST permitir la accion solo si el usuario tiene rol `admin` o `editor`

#### Scenario: Content review
- **GIVEN** un usuario autenticado
- **WHEN** intenta aprobar, rechazar o revisar contenido
- **THEN** el sistema MUST permitir la accion solo si el usuario tiene rol `admin` o `revisor`

#### Scenario: Consultant access
- **GIVEN** un usuario con rol `consultor` sin roles superiores
- **WHEN** navega por el sistema
- **THEN** el sistema MUST tratarlo como usuario de consulta
- **AND** bloquear acciones de edicion, revision y administracion

### Requirement: Active role selection
El sistema MUST permitir que usuarios con multiples roles trabajen con un rol activo persistido localmente.

#### Scenario: Restore active role
- **GIVEN** un usuario con multiples roles
- **AND** existe un rol activo guardado localmente
- **WHEN** el sistema restaura la sesion
- **THEN** el sistema MUST usar el rol guardado si pertenece al usuario

#### Scenario: Fallback active role
- **GIVEN** un usuario con roles disponibles
- **AND** no hay rol activo valido guardado
- **WHEN** el sistema restaura la sesion
- **THEN** el sistema MUST seleccionar el primer rol del usuario como rol activo
