PRD – Aplicación para Gestión de Estaciones
1. Información general del documento

Nombre tentativo del producto: Sistema de Gestión de Estaciones
Versión del documento: 1.1
Tipo de documento: Product Requirements Document (PRD)
Estado: Actualizado
Propósito: Definir objetivos, alcance, requerimientos funcionales y no funcionales, reglas de negocio, modelo conceptual y criterios de aceptación de una aplicación destinada a la carga, administración, validación y consulta interna de datos de estaciones.

2. Resumen del producto

La aplicación tendrá como propósito central permitir la creación, edición, organización, validación y consulta interna de información de estaciones asociadas a una ruta o red territorial.

Cada estación representará una localidad, punto de interés o nodo dentro de la ruta, y contendrá información estructurada sobre:

información general de la localidad;
actores relevantes;
productos;
experiencias;
imperdibles;
material multimedia;
ubicación geográfica.

La aplicación contará además con:

autenticación mediante cuentas de Google;
gestión administrativa de usuarios;
múltiples roles por usuario;
control de permisos;
trazabilidad de acciones;
carga masiva inicial de datos sintéticos.

El contenido será de uso interno, por lo que en esta versión no se contempla una vista pública.

3. Objetivo del producto

Diseñar e implementar una aplicación que permita:

crear y administrar estaciones;
registrar información homogénea y estructurada de cada estación;
gestionar actores locales y sus datos asociados;
registrar productos, experiencias e imperdibles;
adjuntar fotos, mapas y georreferenciación;
autenticar usuarios con Google;
permitir acceso solo a usuarios previamente creados y activos;
administrar usuarios, roles y permisos;
validar contenido y mantener trazabilidad;
poblar el sistema con datos sintéticos iniciales para pruebas y validación.
4. Problema que resuelve

Actualmente, la información de localidades, actores, productos y experiencias suele encontrarse:

dispersa en documentos, planillas o soportes heterogéneos;
incompleta o desactualizada;
sin criterios uniformes de carga;
difícil de consultar, validar o reutilizar.

Esto genera dificultades para:

construir una base de datos confiable;
mantener consistencia entre registros;
consultar información de forma ordenada;
reutilizar los datos en procesos de análisis, curaduría o difusión institucional.

La aplicación busca resolver este problema mediante una plataforma única de gestión interna de contenido estructurado, con acceso controlado y trazabilidad.

5. Alcance del producto

La aplicación abarcará, en esta versión, los siguientes módulos:

Gestión de estaciones.
Gestión de información general de la localidad.
Gestión de actores.
Gestión de productos.
Gestión de experiencias.
Gestión de imperdibles.
Gestión de fotos, mapas y georreferenciación.
Autenticación con Google.
Gestión administrativa de usuarios.
Gestión de roles y permisos.
Validación y trazabilidad de contenido.
Carga masiva inicial de datos sintéticos.
5.1 Fuera de alcance en esta versión

Quedan fuera de esta versión, salvo redefinición futura:

vista pública abierta del contenido;
reservas online;
pagos electrónicos;
comercio electrónico;
mensajería interna avanzada;
automatizaciones complejas con terceros;
analítica avanzada de uso;
publicación automática en portales externos.
6. Usuarios del sistema
6.1 Administrador general

Usuario con acceso total al sistema. Puede gestionar usuarios, roles, estaciones, contenido y configuraciones administrativas.

6.2 Editor de contenidos

Usuario encargado de crear y editar estaciones, actores, productos, experiencias e imperdibles.

6.3 Revisor o validador

Usuario encargado de revisar la calidad, integridad y consistencia de la información cargada antes de su aprobación interna.

6.4 Consultor

Usuario con permisos de visualización interna del contenido habilitado, sin capacidad de edición.

7. Definiciones cerradas del producto

Se establecen las siguientes definiciones para esta versión del sistema:

El acceso al sistema se realizará mediante autenticación con Google.
Solo podrán ingresar usuarios previamente creados y activados por un administrador.
No existirá auto-registro de usuarios.
No se restringirá el acceso por dominio de correo.
Un usuario podrá tener múltiples roles.
El contenido será de uso interno y no contará, por el momento, con vista pública.
Los imperdibles serán modelados como una entidad completa, con nivel de detalle equivalente al de las experiencias.
El sistema deberá contemplar una carga masiva inicial de datos sintéticos para pruebas y validación.
8. Modelo conceptual del producto

La entidad principal del sistema será la Estación.

Cada estación se organizará en las siguientes dimensiones:

8.1 Información general de la localidad
descripción de la localidad;
mapas.
8.2 Actores
artesanos;
productores;
hospedajes;
gastronómicos;
guías de turismo.
8.3 Productos
artesanía textil;
alfarería;
productos regionales;
circuitos guiados.
8.4 Experiencias
circuitos guiados;
experiencias de tejido;
otras experiencias.
8.5 Imperdibles
lugares, propuestas, actividades, atractivos o experiencias destacadas de la estación.
9. Requerimientos funcionales
9.1 Gestión de estaciones
RF-01. Crear estación

El sistema debe permitir crear una nueva estación.

RF-02. Editar estación

El sistema debe permitir modificar los datos de una estación existente.

RF-03. Desactivar estación

El sistema debe permitir desactivar una estación sin eliminarla físicamente.

RF-04. Listar estaciones

El sistema debe permitir listar las estaciones registradas.

RF-05. Buscar y filtrar estaciones

El sistema debe permitir buscar estaciones por nombre, localidad, categoría o estado.

9.2 Información general de la localidad
RF-06. Registrar descripción de la localidad

Cada estación debe permitir almacenar una descripción general de la localidad.

RF-07. Registrar mapas

Cada estación debe permitir asociar uno o más mapas o referencias cartográficas.

RF-08. Editar información general

La información general debe poder actualizarse en cualquier momento por usuarios autorizados.

9.3 Gestión de actores
RF-09. Registrar artesanos

Para cada artesano, el sistema debe permitir registrar:

biografía corta;
técnicas que realiza;
materiales que utiliza;
productos que ofrece;
posibilidad de visitas o demostraciones;
disponibilidad;
datos de contacto;
georreferenciación;
fotos.
RF-10. Registrar productores

Para cada productor, el sistema debe permitir registrar:

biografía corta;
rubro productivo;
productos que ofrece;
escala de producción;
modalidad de venta;
posibilidad de visitas;
datos de contacto;
georreferenciación;
fotos.
RF-11. Registrar hospedajes

Para cada hospedaje, el sistema debe permitir registrar:

descripción;
tipo de hospedaje;
capacidad;
servicios disponibles;
horarios de atención o check-in/check-out;
datos de contacto;
dirección;
georreferenciación;
fotos;
observaciones.
RF-12. Registrar gastronómicos

Para cada gastronómico, el sistema debe permitir registrar:

nombre del establecimiento;
tipo de propuesta gastronómica;
descripción;
especialidades;
platos o productos destacados;
días y horarios de atención;
modalidad de servicio;
datos de contacto;
dirección;
georreferenciación;
fotos;
servicios adicionales;
observaciones internas.
RF-13. Registrar guías de turismo

Para cada guía de turismo, el sistema debe permitir registrar:

nombre completo;
biografía corta;
especialidad;
idiomas;
tipo de recorridos que ofrece;
duración estimada de recorridos;
disponibilidad;
medios de contacto;
zona de cobertura;
punto de encuentro habitual;
matrícula, habilitación o acreditación;
fotos;
observaciones internas.
RF-14. Editar actores

El sistema debe permitir editar la información de cualquier actor registrado.

RF-15. Desactivar actores

El sistema debe permitir desactivar actores sin necesidad de borrarlos físicamente.

9.4 Gestión de productos
RF-16. Registrar productos

Cada estación debe permitir registrar productos vinculados a categorías predefinidas.

RF-17. Categorizar productos

El sistema debe permitir clasificar productos en:

artesanía textil;
alfarería;
productos regionales;
circuitos guiados.
RF-18. Describir productos

Cada producto debe permitir almacenar:

nombre;
descripción;
categoría;
fotos;
actor responsable;
estación asociada.
RF-19. Vincular productos con actores

El sistema debe permitir relacionar cada producto con uno o más actores responsables.

9.5 Gestión de experiencias
RF-20. Registrar experiencias

Cada estación debe permitir registrar experiencias asociadas a la misma.

RF-21. Categorizar experiencias

Las experiencias podrán clasificarse en:

circuitos guiados;
experiencias de tejido;
otras experiencias.
RF-22. Describir experiencias

Cada experiencia debe permitir registrar:

título;
descripción;
duración;
recomendaciones;
responsable;
ubicación;
fotos.
9.6 Gestión de imperdibles
RF-23. Registrar imperdibles

Cada estación debe permitir registrar imperdibles como una entidad completa y estructurada.

RF-24. Describir imperdibles

Cada imperdible debe permitir almacenar:

título;
subtítulo breve;
descripción completa;
tipo de imperdible;
motivo de destaque;
ubicación;
latitud;
longitud;
duración sugerida;
recomendaciones;
accesibilidad;
fotos;
videos o enlaces externos;
actor responsable o relacionado;
horarios o disponibilidad;
estacionalidad;
nivel de prioridad;
estación asociada.
RF-25. Priorizar imperdibles

El sistema debe permitir jerarquizar imperdibles según su relevancia dentro de la estación.

RF-26. Relacionar imperdibles

El sistema debe permitir relacionar un imperdible con actores, productos o experiencias, cuando corresponda.

9.7 Gestión de multimedia y georreferenciación
RF-27. Cargar fotos

El sistema debe permitir adjuntar fotos a estaciones, actores, productos, experiencias e imperdibles.

RF-28. Registrar georreferenciación

El sistema debe permitir registrar coordenadas geográficas cuando corresponda.

RF-29. Visualizar ubicaciones

El sistema debe permitir visualizar registros georreferenciados en mapa, si esta vista se implementa dentro del entorno interno.

9.8 Gestión de estados, validación y trazabilidad
RF-30. Guardar borradores

El sistema debe permitir guardar registros en estado borrador.

RF-31. Enviar a revisión

El sistema debe permitir que un contenido pase a estado de revisión.

RF-32. Aprobar contenido

El sistema debe permitir que un revisor o administrador apruebe un contenido.

RF-33. Rechazar contenido

El sistema debe permitir devolver contenido con observaciones para corrección.

RF-34. Registrar fechas

El sistema debe guardar fecha de creación y última actualización de los registros.

RF-35. Registrar trazabilidad de cambios

El sistema debe registrar qué usuario creó, modificó, revisó, aprobó o rechazó un contenido.

9.9 Autenticación con Google
RF-36. Iniciar sesión con Google

El sistema debe permitir a los usuarios autenticarse mediante su cuenta de Google.

RF-37. Validar usuario preexistente

El sistema debe permitir el acceso únicamente a usuarios que ya hayan sido registrados previamente y se encuentren activos.

RF-38. Asociar cuenta Google con usuario interno

El sistema debe validar que el correo autenticado en Google coincida con un usuario existente en la aplicación.

RF-39. Denegar acceso a usuarios no registrados

Si una persona inicia sesión con Google pero no posee una cuenta creada y activa en el sistema, el acceso debe ser rechazado.

RF-40. Cerrar sesión

El sistema debe permitir cerrar sesión de forma segura.

RF-41. Mantener sesión

El sistema debe mantener una sesión activa por un período razonable según la configuración definida.

9.10 Gestión de usuarios
RF-42. Crear usuario

El sistema debe permitir que un administrador cree manualmente un usuario.

RF-43. Editar usuario

El sistema debe permitir modificar datos administrativos del usuario.

RF-44. Activar o desactivar usuario

El sistema debe permitir activar o desactivar usuarios sin eliminarlos físicamente.

RF-45. Listar usuarios

El sistema debe permitir visualizar usuarios registrados.

RF-46. Ver detalle de usuario

El sistema debe permitir consultar:

nombre;
correo electrónico;
estado;
roles;
fecha de alta;
último acceso;
observaciones internas.
RF-47. Buscar y filtrar usuarios

El sistema debe permitir buscar usuarios por nombre, correo, estado o rol.

RF-48. Registrar auditoría de acceso

El sistema debe registrar eventos relevantes de acceso y cambios administrativos.

9.11 Gestión de roles y permisos
RF-49. Asignar uno o varios roles

El sistema debe permitir asignar uno o más roles a un usuario.

RF-50. Modificar roles

El sistema debe permitir agregar o quitar roles a un usuario existente.

RF-51. Consultar permisos efectivos

El sistema debe permitir conocer los permisos resultantes de la combinación de roles asignados a un usuario.

RF-52. Restringir funcionalidades por rol

El sistema debe habilitar solo las funcionalidades correspondientes a los roles del usuario autenticado.

RF-53. Restringir operaciones sensibles

Solo usuarios autorizados podrán:

gestionar usuarios;
asignar roles;
aprobar contenido;
desactivar registros;
acceder a configuraciones administrativas.
RF-54. Validar permisos en backend

Los permisos deben controlarse también del lado del servidor, no solo en la interfaz.

9.12 Carga masiva inicial de datos sintéticos
RF-55. Importar carga masiva inicial

El sistema debe permitir la carga masiva inicial de datos desde un archivo estructurado o desde un proceso automatizado de siembra de datos.

RF-56. Generar datos sintéticos

La solución debe contemplar un mecanismo para generar datos sintéticos realistas de estaciones, actores, productos, experiencias e imperdibles.

RF-57. Mantener relaciones válidas

La carga masiva debe respetar las relaciones entre entidades, evitando registros huérfanos o inconsistentes.

RF-58. Cargar usuarios y roles de prueba

La carga masiva podrá incluir usuarios de prueba con roles predefinidos para validación funcional.

RF-59. Reejecutar la carga en entornos de prueba

La carga sintética debe poder ejecutarse de forma repetible en entornos de desarrollo o testing.

10. Roles sugeridos
10.1 Administrador general

Permisos:

acceso total al sistema;
gestión de usuarios;
gestión de roles;
alta, edición, desactivación y aprobación de contenido;
configuración general.
10.2 Editor de contenidos

Permisos:

crear y editar estaciones;
crear y editar actores, productos, experiencias e imperdibles;
guardar borradores;
enviar contenido a revisión.
10.3 Revisor / validador

Permisos:

revisar contenido;
aprobar o rechazar;
dejar observaciones;
consultar contenido en revisión.
10.4 Consultor

Permisos:

ver información habilitada internamente;
sin acceso de edición ni administración.
11. Reglas de negocio
RN-01

Toda estación debe tener al menos nombre y descripción general para existir.

RN-02

Toda estación puede contener múltiples actores, productos, experiencias e imperdibles.

RN-03

Todo actor debe estar vinculado a una estación.

RN-04

Todo producto debe estar vinculado a una estación y, cuando corresponda, a uno o más actores.

RN-05

Toda experiencia debe estar vinculada a una estación.

RN-06

Todo imperdible debe estar vinculado a una estación.

RN-07

La georreferenciación deberá expresarse en latitud y longitud.

RN-08

El acceso al sistema deberá realizarse mediante autenticación con Google.

RN-09

Solo podrán ingresar usuarios previamente creados por un administrador.

RN-10

Un usuario autenticado no podrá operar si se encuentra inactivo.

RN-11

No habrá registro autónomo de usuarios desde la pantalla de login.

RN-12

No se restringirá el acceso por dominio de correo.

RN-13

Un usuario podrá tener múltiples roles.

RN-14

Los permisos efectivos surgirán de la unión de los permisos asociados a todos sus roles.

RN-15

Los permisos deben validarse tanto en el frontend como en el backend.

RN-16

Todo el contenido de la aplicación será de acceso interno y autenticado. No existirá, en esta versión, una vista pública para consulta abierta.

RN-17

Los estados de aprobación o publicación se interpretarán como estados internos del contenido, no como publicación pública externa.

RN-18

La eliminación física de usuarios o contenido no es obligatoria; se priorizará la desactivación lógica para mantener trazabilidad.

12. Requerimientos no funcionales
RNF-01. Usabilidad

La aplicación debe ser fácil de usar para perfiles no técnicos.

RNF-02. Accesibilidad

La interfaz debe contemplar criterios básicos de accesibilidad visual y de navegación.

RNF-03. Rendimiento

La carga, edición y consulta de información debe responder en tiempos adecuados.

RNF-04. Seguridad

La autenticación y autorización deben proteger adecuadamente los accesos y operaciones.

RNF-05. Integridad de datos

La aplicación debe preservar relaciones coherentes entre estaciones, actores, productos, experiencias e imperdibles.

RNF-06. Escalabilidad

La solución debe permitir incorporar nuevas categorías, tipos de actores, tipos de contenido o roles.

RNF-07. Compatibilidad

La aplicación debe funcionar correctamente en escritorio y móvil.

RNF-08. Trazabilidad

El sistema debe registrar quién creó, modificó, revisó, aprobó o rechazó cada contenido.

RNF-09. Protección de datos

La aplicación debe almacenar solo los datos necesarios del perfil autenticado y de la administración interna de usuarios.

RNF-10. Mantenibilidad

La arquitectura debe facilitar evoluciones futuras del modelo de datos y permisos.

RNF-11. Repetibilidad de datos de prueba

La carga sintética inicial debe poder ejecutarse de forma controlada y repetible en entornos no productivos.

13. Modelo de datos mínimo sugerido
13.1 Entidad Estación

Campos sugeridos:

id
nombre
localidad
descripción general
mapas
coordenadas generales
estado
fecha de creación
fecha de actualización
usuario creador
usuario actualizador
13.2 Entidad Actor

Campos comunes sugeridos:

id
tipo de actor
nombre o razón identificatoria
descripción breve
datos de contacto
dirección
localidad
latitud
longitud
fotos
redes sociales
estado
estación asociada
observaciones internas
fecha de creación
fecha de actualización
13.3 Entidad Artesano

Campos específicos sugeridos:

biografía corta
técnicas que realiza
materiales que utiliza
productos que ofrece
posibilidad de visitas o demostraciones
disponibilidad
13.4 Entidad Productor

Campos específicos sugeridos:

biografía corta
rubro productivo
productos que ofrece
escala de producción
modalidad de venta
posibilidad de visitas
13.5 Entidad Hospedaje

Campos específicos sugeridos:

descripción
tipo de hospedaje
capacidad
servicios disponibles
horarios de atención o check-in/check-out
observaciones
13.6 Entidad Gastronómico

Campos específicos sugeridos:

nombre del establecimiento
tipo de propuesta gastronómica
especialidades
platos o productos destacados
días y horarios de atención
modalidad de servicio
servicios adicionales
observaciones internas
13.7 Entidad Guía de Turismo

Campos específicos sugeridos:

nombre completo
biografía corta
especialidad
idiomas
tipo de recorridos
duración estimada
disponibilidad
zona de cobertura
punto de encuentro habitual
matrícula, habilitación o acreditación
observaciones internas
13.8 Entidad Producto

Campos sugeridos:

id
nombre
categoría
descripción
fotos
actor asociado o actores asociados
estación asociada
estado
fecha de creación
fecha de actualización
13.9 Entidad Experiencia

Campos sugeridos:

id
título
categoría
descripción
duración
recomendaciones
responsable
ubicación
fotos
estación asociada
estado
fecha de creación
fecha de actualización
13.10 Entidad Imperdible

Campos sugeridos:

id
título
subtítulo breve
descripción completa
tipo de imperdible
motivo de destaque
ubicación
latitud
longitud
duración sugerida
recomendaciones
accesibilidad
fotos
videos o enlaces externos
actor responsable o relacionado
horarios o disponibilidad
estacionalidad
nivel de prioridad
estación asociada
estado
fecha de creación
fecha de actualización
13.11 Entidad Usuario

Campos sugeridos:

id
nombre completo
correo electrónico
proveedor de autenticación
id externo de Google
foto de perfil
estado
fecha de alta
fecha de actualización
fecha de último acceso
usuario creador
observaciones internas
13.12 Entidad Rol

Campos sugeridos:

id
nombre
descripción
estado
13.13 Relación Usuario-Rol

Dado que un usuario puede tener múltiples roles, se recomienda una relación muchos a muchos mediante una entidad intermedia.

Campos sugeridos:

id
usuario_id
rol_id
fecha_asignacion
asignado_por
13.14 Entidad Permiso

Opcional, si se desea un esquema más flexible:

id
nombre
descripción
módulo asociado
14. Valores sugeridos para parametrización
14.1 Tipos de hospedaje
hotel
hostal
cabaña
casa de familia
camping
14.2 Tipo de propuesta gastronómica
restaurante
comedor
casa de comidas
cafetería
confitería
puesto gastronómico
cocina regional
14.3 Modalidad de servicio gastronómico
en salón
para llevar
por encargo
degustación
atención a grupos
14.4 Servicios adicionales gastronómicos
opción vegetariana
opción vegana
accesibilidad
sanitarios
estacionamiento
reservas
14.5 Especialidad de guía de turismo
turismo cultural
turismo rural
turismo natural
senderismo
patrimonio local
experiencias textiles
circuitos productivos
14.6 Idiomas
español
inglés
portugués
francés
otros
14.7 Tipos de imperdible
lugar emblemático
experiencia destacada
atractivo natural
atractivo cultural
propuesta gastronómica
taller o actividad artesanal
evento especial
circuito recomendado
15. Flujos principales
15.1 Alta de estación
El usuario ingresa al módulo de estaciones.
Selecciona “Crear estación”.
Completa los datos mínimos.
Guarda la estación.
El sistema habilita la carga del resto de la información.
15.2 Carga de actores
El usuario accede a una estación.
Ingresa al módulo de actores.
Selecciona el tipo de actor.
Completa la información correspondiente.
Adjunta fotos y ubicación.
Guarda el registro.
15.3 Carga de productos o experiencias
El usuario accede a la estación.
Selecciona el módulo correspondiente.
Completa los datos requeridos.
Relaciona actores si corresponde.
Guarda como borrador o envía a revisión.
15.4 Carga de imperdibles
El usuario accede a la estación.
Selecciona el módulo de imperdibles.
Registra el contenido completo del imperdible.
Relaciona actores, productos o experiencias si corresponde.
Guarda el registro y define su prioridad.
15.5 Revisión interna del contenido
El editor carga contenido.
El revisor accede al contenido pendiente.
Verifica completitud y consistencia.
Aprueba o devuelve con observaciones.
15.6 Inicio de sesión
El usuario accede a la pantalla de login.
Selecciona “Iniciar sesión con Google”.
Google autentica al usuario.
El sistema obtiene el correo autenticado.
El sistema verifica si existe un usuario interno activo con ese correo.
Si existe y está activo, el sistema carga sus roles y permisos.
Si no existe o está inactivo, el acceso se rechaza.
15.7 Alta administrativa de usuario
Un administrador accede al módulo de usuarios.
Selecciona la opción “Crear usuario”.
Carga nombre, correo y demás datos administrativos.
Asigna uno o varios roles.
Define el estado inicial del usuario.
Guarda el registro.
15.8 Asignación o modificación de roles
El administrador accede al módulo de usuarios.
Selecciona un usuario existente.
Agrega o quita roles.
El sistema recalcula los permisos efectivos del usuario.
15.9 Carga masiva inicial
Un usuario autorizado accede al mecanismo de carga masiva o ejecuta el proceso de siembra.
El sistema genera o importa datos sintéticos estructurados.
Se crean estaciones, actores, productos, experiencias, imperdibles y usuarios de prueba.
El sistema valida integridad y relaciones entre registros.
Los datos quedan disponibles para pruebas o validación interna.
16. Criterios de aceptación generales

La aplicación se considerará aceptada cuando permita:

crear, editar y administrar estaciones;
registrar información general de la localidad;
gestionar actores con atributos comunes y específicos;
registrar productos, experiencias e imperdibles;
adjuntar fotos, mapas y georreferenciación;
manejar estados internos de borrador, revisión y aprobación;
iniciar sesión con Google;
permitir acceso solo a usuarios creados y activos;
administrar usuarios con múltiples roles;
restringir funcionalidades según permisos;
mantener trazabilidad de accesos y cambios;
poblar el sistema con datos sintéticos iniciales consistentes.
17. Datos sintéticos sugeridos para la carga inicial

La carga inicial de prueba podrá generar, por ejemplo:

10 a 20 estaciones;
5 a 15 actores por estación;
productos en distintas categorías;
experiencias por estación;
2 a 5 imperdibles por estación;
usuarios administradores, editores, revisores y consultores;
usuarios con múltiples combinaciones de roles;
datos de georreferenciación ficticios válidos;
fotos o referencias simuladas para pruebas funcionales.
18. Riesgos y consideraciones
Puede haber inconsistencia si no se normalizan categorías y campos obligatorios.
Será importante definir validaciones mínimas por tipo de actor.
El uso de múltiples roles por usuario requerirá una definición clara de permisos acumulados.
La autenticación con Google exigirá una correcta asociación entre correo autenticado y usuario interno.
La carga sintética deberá diferenciarse claramente del entorno productivo real.
La ausencia de vista pública simplifica esta versión, pero conviene dejar preparada la arquitectura para una futura apertura.
19. Supuestos adoptados

Este PRD se construye bajo los siguientes supuestos:

la estación es la entidad principal del sistema;
la información se organiza jerárquicamente;
los actores tienen atributos comunes y también campos específicos por subtipo;
los imperdibles tienen un nivel de detalle equivalente al de las experiencias;
el sistema será de uso interno y autenticado;
la autenticación con Google será el mecanismo principal de login;
el alta de usuarios será enteramente administrativa;
se requerirá carga inicial sintética para pruebas y demostración.
20. Evoluciones futuras sugeridas

Como posibles siguientes etapas, la aplicación podría incorporar:

vista pública de estaciones;
mapa interactivo con filtros avanzados;
exportación de fichas en PDF;
panel de reportes;
carga masiva desde Excel o CSV administrable desde interfaz;
historial detallado de cambios;
integración con WhatsApp o redes;
flujos más complejos de aprobación;
panel específico para actores locales;
permisos más granulares por módulo o acción.
21. Estado de madurez del documento

Con las decisiones ya definidas, este PRD se encuentra en un estado adecuado para avanzar hacia:

backlog MVP;
historias de usuario;
casos de uso;
modelo entidad-relación;
diseño de base de datos;
arquitectura funcional y técnica.