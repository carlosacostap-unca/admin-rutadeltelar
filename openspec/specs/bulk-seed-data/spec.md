## Purpose

Definir la carga masiva inicial de datos sinteticos para pruebas, validacion y demostracion del sistema.

## Requirements

### Requirement: Synthetic seed scope
El sistema MUST permitir poblar datos iniciales de prueba para estaciones, actores, productos, experiencias, imperdibles, catalogos y usuarios administrativos cuando el entorno lo requiera.

#### Scenario: Seed content
- **GIVEN** un entorno de prueba o validacion
- **WHEN** se ejecuta la carga inicial
- **THEN** el sistema MUST crear registros sinteticos suficientes para recorrer los flujos principales

#### Scenario: Seed catalogs
- **GIVEN** un entorno sin catalogos completos
- **WHEN** se ejecuta la carga inicial
- **THEN** el sistema MUST crear valores base para los catalogos utilizados por formularios y filtros

### Requirement: Seed data quality
Los datos sinteticos MUST representar localidades, actores y contenidos coherentes con la Ruta del Telar y el contexto territorial de Catamarca.

#### Scenario: Coherent station data
- **GIVEN** estaciones sinteticas creadas
- **WHEN** el usuario consulta sus fichas
- **THEN** el sistema MUST presentar nombres, localidades, departamentos y descripciones plausibles

#### Scenario: Coherent relationships
- **GIVEN** contenidos sinteticos creados
- **WHEN** el usuario consulta relaciones entre entidades
- **THEN** productos, experiencias, imperdibles y actores MUST estar vinculados a estaciones y entre si de forma consistente

### Requirement: Safe seed execution
La carga inicial MUST poder ejecutarse de forma controlada para evitar duplicaciones o corrupcion de datos.

#### Scenario: Controlled execution
- **GIVEN** un operador ejecuta un script de carga
- **WHEN** el script detecta datos existentes relevantes
- **THEN** el sistema MUST evitar duplicaciones evidentes o requerir una estrategia explicita de actualizacion
