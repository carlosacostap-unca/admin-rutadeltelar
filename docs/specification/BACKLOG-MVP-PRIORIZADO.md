Backlog MVP priorizado – Aplicación para Gestión de Estaciones
1. Objetivo del MVP

El objetivo del MVP es contar con una primera versión funcional que permita:

acceder al sistema de forma segura con Google;
administrar usuarios y roles;
crear y gestionar estaciones;
registrar actores, productos, experiencias e imperdibles;
manejar estados internos de contenido;
consultar la información de forma ordenada;
poblar el sistema con datos sintéticos de prueba.
2. Criterio de priorización

Usaré estas categorías:

P0 – Crítico: indispensable para que el sistema funcione.
P1 – Alto: muy importante para que el MVP sea usable.
P2 – Medio: valioso, pero puede esperar una segunda iteración.
P3 – Deseable: mejora o evolución posterior.
3. Épicas del producto
Autenticación y acceso
Usuarios, roles y permisos
Gestión de estaciones
Gestión de actores
Gestión de productos
Gestión de experiencias
Gestión de imperdibles
Estados, revisión y trazabilidad
Consulta interna y navegación
Carga masiva inicial de datos sintéticos
4. Backlog priorizado por épica
Épica 1. Autenticación y acceso
US-01 – Login con Google

Prioridad: P0
Como usuario autorizado
Quiero iniciar sesión con mi cuenta de Google
Para acceder al sistema de forma segura.

Criterios de aceptación

Debe existir un botón “Iniciar sesión con Google”.
El sistema debe autenticarse mediante Google.
El sistema debe obtener el correo autenticado.
Si la autenticación falla, el acceso debe ser rechazado.
US-02 – Validación de usuario interno

Prioridad: P0
Como sistema
Quiero verificar que el usuario autenticado exista internamente y esté activo
Para permitir el acceso solo a usuarios habilitados.

Criterios de aceptación

Si el correo autenticado coincide con un usuario interno activo, se permite el ingreso.
Si el usuario no existe, el acceso se rechaza.
Si el usuario existe pero está inactivo, el acceso se rechaza.
Debe mostrarse un mensaje claro de acceso denegado.
US-03 – Cierre de sesión

Prioridad: P0
Como usuario autenticado
Quiero cerrar mi sesión
Para finalizar mi acceso de forma segura.

Criterios de aceptación

Debe existir una opción de cerrar sesión.
Al cerrar sesión, la sesión activa debe invalidarse.
El usuario debe volver a la pantalla de login.
Épica 2. Usuarios, roles y permisos
US-04 – Crear usuario

Prioridad: P0
Como administrador
Quiero crear manualmente un usuario
Para habilitarlo a usar la aplicación.

Criterios de aceptación

Solo un administrador puede crear usuarios.
Debe poder registrar nombre, correo, estado y observaciones internas.
Debe poder asignar al menos un rol al momento del alta.
El usuario creado debe quedar disponible para autenticarse.
US-05 – Activar o desactivar usuario

Prioridad: P0
Como administrador
Quiero activar o desactivar usuarios
Para controlar quién puede ingresar.

Criterios de aceptación

Debe poder cambiarse el estado de un usuario entre activo e inactivo.
Un usuario inactivo no debe poder ingresar al sistema.
El cambio debe quedar registrado.
US-06 – Asignar múltiples roles a un usuario

Prioridad: P0
Como administrador
Quiero asignar uno o más roles a un usuario
Para definir correctamente sus permisos.

Criterios de aceptación

Un usuario puede tener uno o varios roles.
Los roles pueden agregarse o quitarse.
Los permisos efectivos deben derivarse de todos los roles asignados.
US-07 – Listar usuarios

Prioridad: P1
Como administrador
Quiero ver el listado de usuarios
Para gestionarlos fácilmente.

Criterios de aceptación

Debe mostrarse una tabla o listado de usuarios.
Debe incluir nombre, correo, estado, roles y último acceso.
Debe permitir búsqueda y filtrado.
US-08 – Ver detalle de usuario

Prioridad: P1
Como administrador
Quiero consultar el detalle de un usuario
Para revisar su configuración.

Criterios de aceptación

Debe mostrar datos administrativos completos.
Debe mostrar roles asignados.
Debe mostrar estado del usuario.
Debe mostrar fecha de alta y último acceso.
US-09 – Restringir funcionalidades según permisos

Prioridad: P0
Como sistema
Quiero mostrar y habilitar funciones según los roles del usuario
Para proteger operaciones sensibles.

Criterios de aceptación

Un consultor no debe ver acciones de edición.
Un editor no debe administrar usuarios.
Un revisor debe poder aprobar o rechazar contenido.
Un administrador debe acceder a todas las funciones.
La validación debe existir en frontend y backend.
Épica 3. Gestión de estaciones
US-10 – Crear estación

Prioridad: P0
Como editor o administrador
Quiero crear una estación
Para comenzar a cargar su información.

Criterios de aceptación

Debe poder cargarse al menos nombre y descripción general.
La estación debe guardarse con estado inicial.
La estación creada debe quedar disponible para completar sus módulos relacionados.
US-11 – Editar estación

Prioridad: P0
Como editor o administrador
Quiero editar una estación
Para mantener la información actualizada.

Criterios de aceptación

Debe poder modificarse la información básica de la estación.
El cambio debe quedar registrado con fecha y usuario.
US-12 – Listar estaciones

Prioridad: P0
Como usuario autenticado con permisos de consulta
Quiero ver un listado de estaciones
Para navegar la información del sistema.

Criterios de aceptación

Debe existir una vista de listado.
Debe mostrar información mínima identificatoria.
Debe permitir acceder al detalle de cada estación.
US-13 – Buscar y filtrar estaciones

Prioridad: P1
Como usuario autenticado
Quiero buscar y filtrar estaciones
Para encontrar rápidamente una estación específica.

Criterios de aceptación

Debe permitir buscar por nombre.
Debe permitir filtrar por estado y localidad.
US-14 – Desactivar estación

Prioridad: P1
Como administrador o usuario autorizado
Quiero desactivar una estación
Para retirarla del uso activo sin eliminarla.

Criterios de aceptación

La estación no debe eliminarse físicamente.
Debe conservarse su historial.
La estación desactivada debe distinguirse visualmente.
Épica 4. Gestión de actores
US-15 – Registrar actor base

Prioridad: P0
Como editor
Quiero registrar un actor asociado a una estación
Para documentar participantes relevantes de la localidad.

Criterios de aceptación

Debe poder seleccionarse el tipo de actor.
Todo actor debe quedar vinculado a una estación.
Debe registrar datos comunes mínimos.
US-16 – Registrar artesano

Prioridad: P1
Como editor
Quiero cargar artesanos con campos específicos
Para reflejar correctamente su perfil y actividad.

Criterios de aceptación

Debe permitir cargar biografía, técnicas, materiales, productos, visitas y disponibilidad.
US-17 – Registrar productor

Prioridad: P1
Como editor
Quiero cargar productores con campos específicos
Para reflejar correctamente su actividad.

Criterios de aceptación

Debe permitir cargar rubro, escala, modalidad de venta, productos y visitas.
US-18 – Registrar hospedaje

Prioridad: P1
Como editor
Quiero cargar hospedajes con campos específicos
Para registrar opciones de alojamiento asociadas a una estación.

Criterios de aceptación

Debe permitir cargar tipo, capacidad, servicios, horarios y ubicación.
US-19 – Registrar gastronómico

Prioridad: P1
Como editor
Quiero cargar establecimientos gastronómicos con campos específicos
Para documentar la oferta gastronómica local.

Criterios de aceptación

Debe permitir cargar tipo de propuesta, especialidades, platos destacados, horarios, modalidad y servicios adicionales.
US-20 – Registrar guía de turismo

Prioridad: P1
Como editor
Quiero cargar guías de turismo con campos específicos
Para registrar la oferta de recorridos y acompañamiento.

Criterios de aceptación

Debe permitir cargar especialidad, idiomas, recorridos, duración, disponibilidad, cobertura y acreditación.
US-21 – Editar y desactivar actor

Prioridad: P1
Como editor o administrador
Quiero editar y desactivar actores
Para mantener la base actualizada sin perder trazabilidad.

Criterios de aceptación

Debe poder editarse cualquier actor.
Debe poder desactivarse sin borrado físico.
Épica 5. Gestión de productos
US-22 – Registrar producto

Prioridad: P1
Como editor
Quiero registrar productos asociados a una estación
Para documentar la oferta vinculada a la ruta.

Criterios de aceptación

Debe registrar nombre, descripción y categoría.
Debe quedar asociado a una estación.
US-23 – Vincular producto con actores

Prioridad: P1
Como editor
Quiero asociar un producto a uno o más actores
Para reflejar responsables o productores del producto.

Criterios de aceptación

Debe permitir seleccionar actores relacionados.
No debe quedar inconsistente respecto a la estación.
US-24 – Editar producto

Prioridad: P1
Como editor
Quiero modificar productos
Para corregir o actualizar información.

Criterios de aceptación

Debe poder editarse descripción, categoría, fotos y relaciones.
Épica 6. Gestión de experiencias
US-25 – Registrar experiencia

Prioridad: P1
Como editor
Quiero registrar experiencias
Para documentar actividades asociadas a una estación.

Criterios de aceptación

Debe registrar título, categoría, descripción, duración, recomendaciones y ubicación.
Debe asociarse a una estación.
US-26 – Editar experiencia

Prioridad: P1
Como editor
Quiero editar experiencias
Para mantenerlas actualizadas.

Criterios de aceptación

Debe poder modificarse cualquier dato editable de la experiencia.
Épica 7. Gestión de imperdibles
US-27 – Registrar imperdible

Prioridad: P1
Como editor
Quiero cargar imperdibles con entidad completa
Para destacar contenidos clave de cada estación.

Criterios de aceptación

Debe registrar título, descripción, tipo, motivo de destaque, ubicación y prioridad.
Debe asociarse a una estación.
US-28 – Relacionar imperdible con otras entidades

Prioridad: P2
Como editor
Quiero vincular un imperdible con actores, productos o experiencias
Para enriquecer su contexto.

Criterios de aceptación

Debe permitir relaciones opcionales con otras entidades.
Las relaciones deben ser consistentes.
US-29 – Editar y priorizar imperdible

Prioridad: P1
Como editor
Quiero editar y jerarquizar imperdibles
Para definir qué contenidos se destacan más.

Criterios de aceptación

Debe poder modificarse su información.
Debe poder establecerse una prioridad.
Épica 8. Estados, revisión y trazabilidad
US-30 – Guardar contenido en borrador

Prioridad: P0
Como editor
Quiero guardar contenido como borrador
Para continuar luego sin publicarlo internamente aún.

Criterios de aceptación

El registro debe poder guardarse en borrador.
Debe distinguirse visualmente de otros estados.
US-31 – Enviar contenido a revisión

Prioridad: P1
Como editor
Quiero enviar contenido a revisión
Para que un revisor lo evalúe.

Criterios de aceptación

Debe existir un cambio de estado a “en revisión”.
Solo contenido editable completo según reglas mínimas debe enviarse a revisión.
US-32 – Aprobar contenido

Prioridad: P1
Como revisor o administrador
Quiero aprobar contenido
Para marcarlo como validado internamente.

Criterios de aceptación

Solo roles autorizados pueden aprobar.
Debe registrarse usuario y fecha de aprobación.
US-33 – Rechazar contenido con observaciones

Prioridad: P1
Como revisor o administrador
Quiero rechazar contenido con observaciones
Para solicitar correcciones.

Criterios de aceptación

Debe poder cargarse una observación.
El contenido debe volver a un estado corregible.
US-34 – Registrar trazabilidad

Prioridad: P0
Como sistema
Quiero registrar quién crea, modifica, revisa o aprueba
Para mantener historial y control.

Criterios de aceptación

Debe registrarse usuario y fecha de eventos clave.
La información debe estar disponible para consulta administrativa.
Épica 9. Consulta interna y navegación
US-35 – Ver detalle de estación

Prioridad: P0
Como usuario autenticado
Quiero ingresar al detalle de una estación
Para consultar toda su información asociada.

Criterios de aceptación

Debe mostrar información general.
Debe mostrar actores, productos, experiencias e imperdibles relacionados.
US-36 – Navegar módulos desde una estación

Prioridad: P1
Como usuario autenticado
Quiero navegar fácilmente entre los módulos de una estación
Para trabajar con eficiencia.

Criterios de aceptación

Debe existir navegación clara entre secciones.
Debe mantenerse el contexto de la estación activa.
US-37 – Visualizar ubicaciones georreferenciadas

Prioridad: P2
Como usuario autenticado
Quiero ver ubicaciones en mapa
Para comprender espacialmente los registros.

Criterios de aceptación

Debe mostrar coordenadas válidas en una vista de mapa interna.
Puede implementarse inicialmente de forma simple.
Épica 10. Carga masiva inicial de datos sintéticos
US-38 – Ejecutar carga inicial de datos sintéticos

Prioridad: P0
Como equipo administrador o técnico
Quiero poblar el sistema con datos sintéticos
Para disponer de información de prueba desde el inicio.

Criterios de aceptación

Debe crear estaciones, actores, productos, experiencias e imperdibles.
Debe respetar relaciones válidas entre entidades.
Debe poder ejecutarse en entornos no productivos.
US-39 – Incluir usuarios y roles de prueba

Prioridad: P1
Como equipo administrador o técnico
Quiero generar usuarios de prueba con roles variados
Para validar permisos y flujos de acceso.

Criterios de aceptación

Debe crear usuarios con distintos perfiles.
Debe incluir usuarios con múltiples roles.
US-40 – Reejecutar semillas de datos

Prioridad: P1
Como equipo técnico
Quiero volver a ejecutar la carga sintética
Para preparar rápidamente ambientes de desarrollo o testing.

Criterios de aceptación

La carga debe ser repetible.
Debe existir una estrategia clara para evitar inconsistencias.
5. Propuesta de corte MVP real
Incluido sí o sí en MVP

Estos ítems deberían entrar en la primera versión funcional:

US-01 a US-06
US-09
US-10 a US-12
US-15
US-22
US-25
US-27
US-30
US-34
US-35
US-38

Eso te deja un MVP que ya permite:

acceso seguro;
administración básica de usuarios y roles;
creación de estaciones;
carga mínima de entidades principales;
control básico de estados;
trazabilidad;
datos de prueba.
6. Segunda tanda recomendada
Para una iteración 2
US-07
US-08
US-13
US-14
US-16 a US-21
US-23
US-24
US-26
US-29
US-31 a US-33
US-36
US-39
US-40
7. Tercera tanda recomendada
Para una iteración 3
US-28
US-37
8. Backlog resumido en formato ejecutivo
P0 – Crítico
Login con Google
Validación de usuario interno activo
Cierre de sesión
Crear usuario
Activar/desactivar usuario
Asignar múltiples roles
Restringir funcionalidades por rol
Crear estación
Editar estación
Listar estaciones
Registrar actor base
Guardar borradores
Registrar trazabilidad
Ver detalle de estación
Ejecutar carga inicial de datos sintéticos
P1 – Alto
Listar y ver detalle de usuarios
Buscar estaciones
Desactivar estación
Registrar subtipos de actores
Registrar y editar productos
Registrar y editar experiencias
Registrar y priorizar imperdibles
Enviar a revisión
Aprobar y rechazar contenido
Navegar módulos por estación
Incluir usuarios de prueba
Reejecutar semillas
P2 – Medio
Relacionar imperdibles con otras entidades
Visualizar ubicaciones en mapa
9. Recomendación práctica de implementación

Te sugiero organizar el desarrollo en este orden:

Sprint 1
autenticación con Google
validación de usuario interno
gestión básica de usuarios y roles
layout base y navegación protegida
Sprint 2
CRUD de estaciones
detalle de estación
trazabilidad mínima
Sprint 3
CRUD básico de actores
CRUD básico de productos
CRUD básico de experiencias
CRUD básico de imperdibles
Sprint 4
flujo de borrador, revisión y aprobación
permisos por rol mejorados
filtros y listados administrativos
Sprint 5
carga masiva sintética
mejoras de navegación
pulido general