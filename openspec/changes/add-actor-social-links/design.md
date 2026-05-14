## Overview

Se agregan tres campos independientes en la coleccion `actores`: `facebook_url`, `instagram_url` y `pagina_web_url`. Los tres son opcionales y guardan URLs completas para que la app admin y la app publica puedan tratarlos como enlaces listos para renderizar.

## Decisions

- Usar campos separados en lugar de un arreglo JSON: simplifica formularios, validacion y consumo desde la app publica.
- Usar el tipo `url` de PocketBase cuando este disponible: mantiene validacion de estructura a nivel de datos sin obligar a completar el campo.
- Mantener compatibilidad hacia atras: no se migran ni modifican registros existentes; los campos vacios simplemente no se muestran.
- Abrir enlaces externos con `target="_blank"` y `rel="noopener noreferrer"`.

## Data Model

- `actores.facebook_url`: URL opcional.
- `actores.instagram_url`: URL opcional.
- `actores.pagina_web_url`: URL opcional.

## UI

- Crear actor: bloque "Redes y web" despues de telefono/email.
- Editar actor: mismo bloque, precargado desde el registro.
- Detalle de actor: renderiza solo los enlaces existentes; si no hay ninguno, muestra estado vacio.

## Risks

- PocketBase puede rechazar URLs sin protocolo. La UI usa `type="url"` y placeholders con `https://` para orientar la carga.
- La app publica debe actualizar sus tipos y renderizado para consumir los nuevos campos cuando este cambio llegue al schema compartido.
