1. Estructura general de navegación

Como el sistema será interno y con usuarios autenticados, conviene una estructura tipo panel administrativo.

1.1 Layout general sugerido
A. Sidebar lateral

Con accesos principales:

Inicio / Dashboard
Estaciones
Actores
Productos
Experiencias
Imperdibles
Usuarios
Roles
Carga masiva
Mi perfil
B. Header superior

Con:

buscador global
nombre de la estación actual cuando aplique
notificaciones o pendientes
usuario logueado
botón de cerrar sesión
C. Área central de contenido

Donde se renderiza cada pantalla.

2. Mapa de pantallas del sistema

Te sugiero estas pantallas base.

2.1 Acceso
Pantalla de login
2.2 Inicio
Dashboard principal
2.3 Estaciones
Listado de estaciones
Crear estación
Editar estación
Detalle de estación
2.4 Actores
Listado de actores
Crear actor
Editar actor
Detalle de actor
2.5 Productos
Listado de productos
Crear producto
Editar producto
Detalle de producto
2.6 Experiencias
Listado de experiencias
Crear experiencia
Editar experiencia
Detalle de experiencia
2.7 Imperdibles
Listado de imperdibles
Crear imperdible
Editar imperdible
Detalle de imperdible
2.8 Administración
Listado de usuarios
Crear usuario
Editar usuario
Detalle de usuario
Listado de roles
Gestión de permisos/roles (si querés hacerlo visible en UI desde el inicio)
2.9 Datos iniciales
Pantalla de carga masiva / semillas
2.10 Perfil
Mi perfil
3. Definición de cada pantalla
3.1 Pantalla de login
Objetivo

Permitir el ingreso al sistema mediante Google.

Componentes
logo del sistema
nombre del sistema
texto breve descriptivo
botón “Iniciar sesión con Google”
mensaje de error si el usuario no existe o está inactivo
Comportamiento
si el login es exitoso y el usuario existe + está activo, redirige al dashboard
si no, muestra acceso denegado
3.2 Dashboard principal
Objetivo

Dar una vista rápida del estado del sistema.

Componentes sugeridos
tarjeta con total de estaciones
tarjeta con total de actores
tarjeta con total de productos
tarjeta con total de experiencias
tarjeta con total de imperdibles
tarjeta con contenido en borrador
tarjeta con contenido en revisión
accesos rápidos:
crear estación
crear actor
crear producto
crear experiencia
crear imperdible
listado breve de últimos registros modificados
listado breve de pendientes de revisión
Valor UI

Esta pantalla ayuda mucho a administradores y revisores.

3.3 Listado de estaciones
Objetivo

Consultar y administrar las estaciones.

Componentes
título de pantalla
botón “Nueva estación”
tabla o grilla de estaciones
filtros:
nombre
localidad
estado
columnas sugeridas:
nombre
localidad
estado
fecha de actualización
acciones
Acciones por fila
ver detalle
editar
desactivar
3.4 Crear estación
Objetivo

Dar de alta una estación.

Campos sugeridos
nombre
localidad
descripción general
mapas / referencias
coordenadas generales
estado inicial
Botones
guardar borrador
guardar y continuar
cancelar
3.5 Editar estación

Muy similar a crear estación, pero mostrando:

historial básico
fecha de creación
última actualización
usuario que editó por última vez
3.6 Detalle de estación
Objetivo

Ser la pantalla eje del sistema.

Esta pantalla debería funcionar casi como una ficha integral de la estación.

Estructura sugerida
Encabezado
nombre de estación
localidad
estado
botones:
editar estación
desactivar
volver al listado
Tabs o secciones internas
Información general
Actores
Productos
Experiencias
Imperdibles
Multimedia / mapa
Historial
Ventaja

Esta pantalla evita perder contexto.

3.7 Listado de actores
Objetivo

Consultar todos los actores cargados.

Filtros
nombre
tipo de actor
estación
estado
Columnas sugeridas
nombre
tipo
estación
contacto
estado
actualización
acciones
Acción importante

Conviene que el botón “Nuevo actor” primero pida seleccionar:

estación
tipo de actor
3.8 Crear actor

Acá tenés dos caminos UI posibles:

Opción A: formulario único dinámico

Primero elegís tipo:

artesano
productor
hospedaje
gastronómico
guía de turismo

Y luego aparecen campos específicos.

Opción B: pantallas separadas por tipo
Crear artesano
Crear productor
Crear hospedaje
etc.
Recomendación

Para el MVP, formulario único dinámico.
Es más simple de mantener y reutiliza mejor.

Secciones del formulario
datos comunes
datos específicos según tipo
contacto
ubicación
fotos
observaciones internas
3.9 Editar actor

Igual que crear, pero mostrando:

estado
trazabilidad
relación con estación
3.10 Detalle de actor
Componentes
nombre
tipo de actor
estación asociada
descripción
contacto
ubicación
galería de fotos
información específica del subtipo
productos relacionados
experiencias relacionadas
imperdibles relacionados
3.11 Listado de productos
Filtros
nombre
categoría
estación
actor
estado
Columnas
nombre
categoría
estación
actor asociado
estado
acciones
3.12 Crear producto
Campos
nombre
categoría
descripción
estación
actores relacionados
fotos
estado
UI importante

Primero elegir estación, luego filtrar actores de esa estación.

3.13 Editar producto

Mismo esquema de alta + trazabilidad.

3.14 Detalle de producto
Mostrar
nombre
categoría
descripción
estación
actores relacionados
fotos
estado
historial básico
3.15 Listado de experiencias
Filtros
título
categoría
estación
estado
Columnas
título
categoría
estación
responsable
estado
acciones
3.16 Crear experiencia
Campos
título
categoría
descripción
duración
recomendaciones
responsable
ubicación
fotos
estación
estado
3.17 Editar experiencia

Igual que crear.

3.18 Detalle de experiencia
Mostrar
título
categoría
descripción completa
duración
recomendaciones
responsable
ubicación
fotos
estación
estado
relaciones
3.19 Listado de imperdibles
Filtros
título
tipo
estación
prioridad
estado
Columnas
título
tipo
estación
prioridad
estado
acciones
3.20 Crear imperdible

Como definiste que es una entidad rica, conviene una pantalla bastante completa.

Campos
título
subtítulo
descripción completa
tipo de imperdible
motivo de destaque
estación
ubicación
latitud / longitud
duración sugerida
recomendaciones
accesibilidad
fotos
videos o enlaces
actor relacionado
producto relacionado
experiencia relacionada
horarios / disponibilidad
estacionalidad
prioridad
estado
3.21 Editar imperdible

Igual que crear + historial.

3.22 Detalle de imperdible
Mostrar
encabezado visual fuerte
tipo
motivo de destaque
descripción
ubicación
multimedia
relaciones con actores/productos/experiencias
prioridad
estacionalidad
estado
3.23 Listado de usuarios
Objetivo

Administración de acceso.

Filtros
nombre
correo
estado
rol
Columnas
nombre
correo
estado
roles
último acceso
acciones
Acciones
ver
editar
activar/desactivar
3.24 Crear usuario
Campos
nombre completo
correo electrónico
estado
roles
observaciones internas
Importante

No necesita contraseña porque el login será con Google.

3.25 Editar usuario
Permitir
cambiar estado
agregar/quitar roles
editar observaciones
revisar último acceso
3.26 Detalle de usuario
Mostrar
nombre
correo
estado
roles
permisos efectivos
fecha de alta
fecha de último acceso
creado por
observaciones
3.27 Listado de roles
Objetivo

Visualizar roles disponibles.

Columnas
nombre del rol
descripción
cantidad de usuarios asociados
estado
3.28 Gestión de permisos/roles

Esto puede ser:

MVP simple

Pantalla solo de consulta, donde ves:

rol
permisos incluidos
Evolución futura

Pantalla editable para construir permisos por rol.

Recomendación

En MVP: solo consulta.
La edición de permisos puede estar hardcodeada o administrada técnicamente al principio.

3.29 Pantalla de carga masiva / semillas
Objetivo

Permitir poblar el sistema con datos de prueba.

Componentes
explicación breve
selector de tipo de carga:
carga completa
solo estaciones
solo usuarios de prueba
botón “Ejecutar carga”
botón “Reinicializar entorno de prueba” (solo si lo querés habilitar)
resumen de resultados:
estaciones creadas
actores creados
productos creados
experiencias creadas
imperdibles creados
usuarios creados
errores
3.30 Mi perfil
Objetivo

Mostrar información del usuario autenticado.

Componentes
nombre
correo
foto de Google
roles asignados
último acceso
botón cerrar sesión
4. Qué pantallas necesita cada rol
Administrador

Ve todo:

dashboard
estaciones
actores
productos
experiencias
imperdibles
usuarios
roles
carga masiva
perfil
Editor

Ve:

dashboard
estaciones
actores
productos
experiencias
imperdibles
perfil

No ve:

usuarios
roles
carga masiva
Revisor

Ve:

dashboard
estaciones
actores
productos
experiencias
imperdibles
perfil

Pero con acciones especiales:

aprobar
rechazar
ver pendientes
Consultor

Ve:

dashboard simplificado
estaciones
actores
productos
experiencias
imperdibles
perfil

Sin botones de edición.

5. Propuesta de navegación ideal
Flujo principal de trabajo
Login
Dashboard
Listado de estaciones
Detalle de estación
Desde detalle de estación:
crear actor
crear producto
crear experiencia
crear imperdible
Recomendación importante

Aunque existan listados globales de Actores, Productos, Experiencias e Imperdibles, el trabajo real conviene hacerlo mucho desde la pantalla Detalle de estación, porque mantiene el contexto.

6. Recomendación de UI por complejidad
Para MVP

Te sugiero esta estrategia visual:

A. Listados con tabla

Para:

estaciones
actores
productos
experiencias
imperdibles
usuarios
B. Formularios en páginas dedicadas

No modales para todo.
Mejor páginas completas porque habrá muchos campos.

C. Detalles con tabs

Especialmente en estación.

D. Estados con badges visuales

Ejemplo:

Borrador
En revisión
Aprobado
Inactivo
7. Pantallas mínimas reales para MVP

Si querés empezar sin sobredimensionar, estas serían las esenciales:

Login
Dashboard
Listado de estaciones
Crear/editar estación
Detalle de estación
Listado de actores
Crear/editar actor
Listado de productos
Crear/editar producto
Listado de experiencias
Crear/editar experiencia
Listado de imperdibles
Crear/editar imperdible
Listado de usuarios
Crear/editar usuario
Mi perfil
Carga masiva