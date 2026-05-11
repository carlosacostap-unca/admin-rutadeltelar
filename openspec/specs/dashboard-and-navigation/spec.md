## Purpose

Definir la navegacion principal del panel administrativo y las vistas resumidas de operacion.

## Requirements

### Requirement: Administrative layout
El sistema MUST presentar una interfaz interna con navegacion lateral, encabezado superior y area central de contenido.

#### Scenario: Sidebar navigation
- **GIVEN** un usuario autenticado
- **WHEN** visualiza el panel
- **THEN** el sistema MUST ofrecer accesos principales a dashboard, estaciones, actores, productos, experiencias, imperdibles, usuarios, auditoria, revision, borradores y parametrizaciones segun permisos

#### Scenario: Header context
- **GIVEN** un usuario autenticado
- **WHEN** visualiza el encabezado superior
- **THEN** el sistema MUST mostrar informacion contextual de usuario y acciones de sesion disponibles

### Requirement: Dashboard summary
El sistema MUST ofrecer un dashboard con indicadores y accesos rapidos para operar el contenido.

#### Scenario: Dashboard metrics
- **GIVEN** datos cargados en el sistema
- **WHEN** el usuario abre el dashboard
- **THEN** el sistema MUST mostrar resumenes de estaciones, actores, productos, experiencias, imperdibles, borradores y contenido en revision cuando los datos esten disponibles

#### Scenario: Quick actions
- **GIVEN** un usuario con permisos de edicion
- **WHEN** abre el dashboard
- **THEN** el sistema MUST ofrecer accesos rapidos para crear entidades principales

### Requirement: Route coverage
El sistema MUST mantener rutas administrativas para listados, creacion, detalle y edicion de entidades principales.

#### Scenario: Entity routes
- **GIVEN** un usuario autenticado
- **WHEN** navega por estaciones, actores, productos, experiencias, imperdibles o usuarios
- **THEN** el sistema MUST proveer rutas de listado, creacion, detalle y edicion segun la entidad y los permisos

#### Scenario: Unsupported access
- **GIVEN** un usuario sin permisos suficientes
- **WHEN** intenta acceder a una accion restringida
- **THEN** el sistema MUST bloquear la accion o redirigir a una vista permitida
