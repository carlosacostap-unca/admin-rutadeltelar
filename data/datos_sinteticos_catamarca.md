# Datos Sintéticos - Ruta del Telar (Catamarca)

Este documento contiene datos de prueba coherentes y estructurados sobre el interior de la provincia de Catamarca, Argentina, enfocados en la temática de la **"Ruta del Telar"**.

> **⚠️ IMPORTANTE - ORDEN DE CARGA MANUAL:**
> Para mantener la integridad de las relaciones en la base de datos, debes dar de alta las entidades en el siguiente orden:
> 1. Estaciones (Nodos geográficos/pueblos)
> 2. Actores (Artesanos, Cooperativas - Requieren una Estación)
> 3. Productos (Requieren un Actor)
> 4. Experiencias (Requieren un Actor)
> 5. Imperdibles (Requieren una Estación)

---

## 1. ESTACIONES

Las estaciones son los puntos geográficos principales de la ruta.

### Estación 1: Belén
- **Nombre:** Belén (Cuna del Poncho)
- **Descripción:** Conocida como la "Cuna del Poncho", Belén es el corazón textil de Catamarca. Sus artesanos conservan técnicas ancestrales de hilado y tejido en telar criollo, utilizando finísimas fibras de vicuña, llama y oveja.
- **Provincia:** Catamarca
- **Ubicación (Lat/Lng):** -27.6514, -67.0275
- **Estado:** Aprobado

### Estación 2: Londres
- **Nombre:** Londres
- **Descripción:** La segunda ciudad más antigua del país. Su historia está profundamente ligada a las culturas originarias y a la llegada de los españoles. Es famosa por el cultivo de la nuez y sus telares de herencia indígena y colonial.
- **Provincia:** Catamarca
- **Ubicación (Lat/Lng):** -27.7167, -67.1333
- **Estado:** Aprobado

### Estación 3: Santa María
- **Nombre:** Santa María (Valles Calchaquíes)
- **Descripción:** Capital de los Valles Calchaquíes catamarqueños. Destaca por sus tejidos de guarda atada, sus cerámicas de estilo santamariano y su profunda herencia de la cultura diaguita.
- **Provincia:** Catamarca
- **Ubicación (Lat/Lng):** -26.6961, -66.0489
- **Estado:** Aprobado

---

## 2. ACTORES

Personas, talleres o cooperativas que mantienen viva la tradición. (Recuerda vincularlos a la Estación correspondiente).

### Actor 1: Asociación de Hilanderas y Tejedoras de Vicuña
- **Nombre:** Asociación de Hilanderas y Tejedoras de Vicuña
- **Tipo:** Cooperativa / Asociación
- **Descripción:** Un grupo de mujeres artesanas dedicadas al rescate, hilado y tejido de la fibra más fina del mundo: la vicuña. Trabajan de forma sustentable, respetando las prácticas ancestrales del "chaku" (esquila comunitaria en silvestría).
- **Estación a vincular:** Belén
- **Dirección:** Gral. Roca 345, Belén
- **Teléfono:** +54 3835 46-1234
- **Estado:** Aprobado

### Actor 2: Taller Textil "El Nogal"
- **Nombre:** Taller Textil "El Nogal"
- **Tipo:** Taller Familiar
- **Descripción:** Taller de la familia Gutiérrez, especializado en tintes naturales extraídos de la flora local (nogal, algarrobo, jarilla) y el tejido en telar rústico de mantas y alfombras de pura lana de oveja.
- **Estación a vincular:** Londres
- **Dirección:** Ruta Nacional 40, Km 4075, Londres
- **Teléfono:** +54 3835 48-9876
- **Estado:** Aprobado

### Actor 3: Cooperativa "Arañitas Hilanderas"
- **Nombre:** Cooperativa "Arañitas Hilanderas"
- **Tipo:** Cooperativa
- **Descripción:** Agrupación emblemática de los Valles Calchaquíes. Realizan tapices, ponchos y caminos de mesa utilizando la tradicional técnica de "guarda atada" o ikat, con motivos geométricos diaguitas.
- **Estación a vincular:** Santa María
- **Dirección:** San Martín 150, Santa María
- **Teléfono:** +54 3838 42-5555
- **Estado:** Aprobado

### Actor 4: Taller de Alfombras "La Rueca"
- **Nombre:** Taller de Alfombras "La Rueca"
- **Tipo:** Taller Familiar
- **Descripción:** Familia especializada en alfombras pesadas de llama y oveja. Trabajan con telares de grandes dimensiones, hilando la lana de forma rústica para mantener el volumen de la pieza.
- **Estación a vincular:** Belén
- **Dirección:** Barrio La Banda s/n, Belén
- **Teléfono:** +54 3835 41-2233
- **Estado:** Aprobado

### Actor 5: Familia Artesana "Los Cardones"
- **Nombre:** Familia Artesana "Los Cardones"
- **Tipo:** Taller Familiar
- **Descripción:** Tercera generación de artesanos que conservan diseños criollos. Famosos por la confección de alforjas, fajas y caminos de mesa, preservando las combinaciones de colores vibrantes y guardas simétricas.
- **Estación a vincular:** Londres
- **Dirección:** Calle Belgrano 500, Londres
- **Teléfono:** +54 3835 40-1122
- **Estado:** Aprobado

### Actor 6: Taller "Tierra Adentro"
- **Nombre:** Taller "Tierra Adentro"
- **Tipo:** Artesano Independiente
- **Descripción:** Espacio que combina el tejido tradicional de llama con la elaboración de cerámicas inspiradas en la cultura Condorhuasi. Promueven el uso de colores crudos y naturales.
- **Estación a vincular:** Santa María
- **Dirección:** Las Américas 210, Santa María
- **Teléfono:** +54 3838 49-7788
- **Estado:** Aprobado

---

## 3. PRODUCTOS

Bienes físicos elaborados por los actores. (Requieren vincularse a su respectivo Actor).

### Producto 1: Poncho de Vicuña Tradicional
- **Nombre:** Poncho de Vicuña Tradicional
- **Categoría:** Textil Indumentaria
- **Descripción:** Prenda de lujo tejida a mano en telar criollo. La fibra de vicuña le otorga una suavidad, ligereza y abrigo incomparables. Color natural (canela/habano). Tarda aproximadamente 6 meses en confeccionarse.
- **Materiales:** 100% Fibra de Vicuña hilada a mano.
- **Precio Referencial:** Consultar (Alta gama)
- **Actor a vincular:** Asociación de Hilanderas y Tejedoras de Vicuña
- **Estado:** Aprobado

### Producto 2: Manta de Oveja Teñida con Nogal
- **Nombre:** Manta de Oveja Teñida con Nogal
- **Categoría:** Textil Hogar
- **Descripción:** Manta rústica y pesada, ideal para el frío cordillerano o como elemento decorativo. Su color marrón oscuro y cálido es obtenido hirviendo cáscaras de nuez y hojas de nogal durante horas.
- **Materiales:** 100% Lana de oveja criolla, tintes naturales.
- **Precio Referencial:** $$ (Medio)
- **Actor a vincular:** Taller Textil "El Nogal"
- **Estado:** Aprobado

### Producto 3: Tapiz Diaguita en Guarda Atada
- **Nombre:** Tapiz Diaguita en Guarda Atada
- **Categoría:** Textil Decorativo
- **Descripción:** Tapiz mural donde se tiñe el hilo por secciones antes de tejerlo (técnica de Ikat). El patrón revela figuras escalonadas y cruces andinas típicas de la cultura Santa María.
- **Materiales:** Lana de oveja y llama, anilinas.
- **Precio Referencial:** $$-$$$ (Medio-Alto)
- **Actor a vincular:** Cooperativa "Arañitas Hilanderas"
- **Estado:** Aprobado

### Producto 4: Alfombra Rústica de Llama
- **Nombre:** Alfombra Rústica de Llama
- **Categoría:** Textil Hogar
- **Descripción:** Alfombra de gran grosor tejida a cuatro lizos. Ideal para livings rústicos. Su pelo natural sin teñir presenta un veteado entre grises, blancos y marrones oscuros.
- **Materiales:** 100% Lana de Llama gruesa.
- **Precio Referencial:** $$$ (Alto)
- **Actor a vincular:** Taller de Alfombras "La Rueca"
- **Estado:** Aprobado

### Producto 5: Camino de Mesa "Andino"
- **Nombre:** Camino de Mesa "Andino"
- **Categoría:** Textil Hogar
- **Descripción:** Camino de mesa tejido con trama fina, destacando guardas simétricas a color. Representa figuras de flora y fauna local como suris (ñandúes) y llamas estilizadas.
- **Materiales:** Lana de oveja fina, teñida artesanalmente.
- **Precio Referencial:** $$ (Medio)
- **Actor a vincular:** Familia Artesana "Los Cardones"
- **Estado:** Aprobado

### Producto 6: Ruana de Llama Color Natural
- **Nombre:** Ruana de Llama Color Natural
- **Categoría:** Textil Indumentaria
- **Descripción:** Prenda tipo poncho abierto en el frente, elegante y muy abrigada. No utiliza ningún tinte; el diseño se logra intercalando vellones de distintos colores naturales del animal.
- **Materiales:** Lana de Llama hilada en huso.
- **Precio Referencial:** $$-$$$ (Medio-Alto)
- **Actor a vincular:** Taller "Tierra Adentro"
- **Estado:** Aprobado

### Producto 7: Alforja Tradicional
- **Nombre:** Alforja Tradicional
- **Categoría:** Accesorios
- **Descripción:** Bolsos dobles tradicionalmente usados sobre caballos o mulas, adaptados hoy como accesorio decorativo o bolso de uso diario. Colores intensos con terminaciones en flecos.
- **Materiales:** Lana gruesa y tintes vivos.
- **Precio Referencial:** $$ (Medio)
- **Actor a vincular:** Taller Textil "El Nogal"
- **Estado:** Aprobado

### Producto 8: Faja Pampa
- **Nombre:** Faja Pampa
- **Categoría:** Accesorios
- **Descripción:** Cinturón tejido en telar de cintura (faz de urdimbre) que cuenta historias a través de sus símbolos geométricos ininterrumpidos.
- **Materiales:** Hilo de algodón mercerizado y lana fina.
- **Precio Referencial:** $ (Accesible)
- **Actor a vincular:** Cooperativa "Arañitas Hilanderas"
- **Estado:** Aprobado

---

## 4. EXPERIENCIAS

Actividades turísticas e interactivas ofrecidas por los actores.

### Experiencia 1: Taller Práctico de Tintes Naturales
- **Nombre:** Taller Práctico de Tintes Naturales
- **Descripción:** Una jornada inmersiva donde aprenderás a recolectar plantas tintóreas en el monte, preparar los mordientes y teñir tus propias madejas de lana al calor del fuego a leña. Incluye almuerzo tradicional.
- **Duración:** 4 horas (Media jornada)
- **Dificultad:** Baja
- **Precio:** $$
- **Actor a vincular:** Taller Textil "El Nogal" (Londres)
- **Estado:** Aprobado

### Experiencia 2: El Camino del Vellón al Poncho
- **Nombre:** El Camino del Vellón al Poncho
- **Descripción:** Demostración completa del proceso textil catamarqueño. Las maestras artesanas muestran el escarmentado, el hilado en huso, el torcido y el urdido en el telar criollo. Los visitantes pueden intentar hilar su propio hilo.
- **Duración:** 2 horas
- **Dificultad:** Baja
- **Precio:** $
- **Actor a vincular:** Asociación de Hilanderas y Tejedoras de Vicuña (Belén)
- **Estado:** Aprobado

### Experiencia 3: Hilando Historias en el Telar
- **Nombre:** Hilando Historias en el Telar
- **Descripción:** Actividad interactiva enfocada en el urdido. Los visitantes ayudan a armar la estructura base de un telar y conocen las historias y leyendas que cada diseño de guarda encierra.
- **Duración:** 3 horas
- **Dificultad:** Media
- **Precio:** $$
- **Actor a vincular:** Taller de Alfombras "La Rueca" (Belén)
- **Estado:** Aprobado

### Experiencia 4: Arte Diaguita: Cerámica y Telar
- **Nombre:** Arte Diaguita: Cerámica y Telar
- **Descripción:** Taller doble donde por la mañana se amasa arcilla roja para formar vasijas rústicas y por la tarde se experimenta tejiendo una pequeña pieza en telar de cintura. 
- **Duración:** 6 horas (Jornada completa)
- **Dificultad:** Media
- **Precio:** $$$
- **Actor a vincular:** Taller "Tierra Adentro" (Santa María)
- **Estado:** Aprobado

### Experiencia 5: Día de Campo y Costumbres
- **Nombre:** Día de Campo y Costumbres
- **Descripción:** Viví un día entero con la familia artesana. Ayudá en el corral de las ovejas, aprendé a preparar empanadas en horno de barro y compartí una tarde de tejido al sol.
- **Duración:** 8 horas
- **Dificultad:** Baja
- **Precio:** $$$
- **Actor a vincular:** Familia Artesana "Los Cardones" (Londres)
- **Estado:** Aprobado

---

## 5. IMPERDIBLES

Atractivos turísticos, culturales o paisajísticos del territorio. (Se vinculan a la Estación más cercana).

### Imperdible 1: Ruinas Incaicas de El Shincal de Quimivil
- **Nombre:** El Shincal de Quimivil
- **Tipo:** Sitio Arqueológico
- **Descripción:** El asentamiento incaico más importante y extenso de Argentina. Fue una capital administrativa del Tawantinsuyu (Imperio Inca). Recorrer sus plazas, escalinatas y kallancas (edificios rectangulares) es un viaje en el tiempo.
- **Ubicación:** A 5 km del centro de Londres.
- **Estación a vincular:** Londres
- **Estado:** Aprobado

### Imperdible 2: Monumento a la Pachamama
- **Nombre:** Monumento a la Pachamama
- **Tipo:** Monumento / Mirador
- **Descripción:** Imponente escultura erigida en honor a la Madre Tierra, figura central de la cosmovisión andina. Situado en un cerro que funciona como un excelente mirador de todo el Valle Calchaquí.
- **Ubicación:** Cerro El Cerrito, Santa María.
- **Estación a vincular:** Santa María
- **Estado:** Aprobado

### Imperdible 3: Quebrada de Belén
- **Nombre:** Quebrada de Belén
- **Tipo:** Paisaje Natural
- **Descripción:** Un cañadón natural enmarcado por altos paredones rojizos, surcado por el Río Belén. Es la puerta de entrada a la Puna y ofrece un paisaje espectacular de contrastes entre el rojo de la piedra y el verde de los algarrobos.
- **Ubicación:** Ruta 40, al norte de Belén.
- **Estación a vincular:** Belén
- **Estado:** Aprobado

### Imperdible 4: Museo Arqueológico Cóndor Huasi
- **Nombre:** Museo Arqueológico Cóndor Huasi
- **Tipo:** Museo / Centro Cultural
- **Descripción:** Alberga una de las colecciones de cerámica precolombina más destacadas del norte argentino. Sus piezas demuestran la evolución de los pueblos que habitaron el valle de Hualfín a lo largo de milenios.
- **Ubicación:** Pleno centro, frente a la plaza principal de Belén.
- **Estación a vincular:** Belén
- **Estado:** Aprobado

### Imperdible 5: Iglesia de la Inmaculada Concepción
- **Nombre:** Iglesia de la Inmaculada Concepción
- **Tipo:** Patrimonio Histórico
- **Descripción:** Monumento Histórico Nacional construido en adobe crudo y madera de algarrobo. Es uno de los exponentes arquitectónicos más antiguos que sobreviven de la época colonial en la región.
- **Ubicación:** A escasas cuadras de la plaza principal de Londres.
- **Estación a vincular:** Londres
- **Estado:** Aprobado

### Imperdible 6: Fuerte Quemado
- **Nombre:** Fuerte Quemado
- **Tipo:** Sitio Arqueológico
- **Descripción:** Antiguo poblado prehispánico de origen diaguita, situado estratégicamente en la cima de unos cerros. Cuenta con restos de pircas y una inigualable "ventanita" natural en la piedra por donde se asoma el sol.
- **Ubicación:** Ruta 40, a pocos kilómetros del límite con Tucumán.
- **Estación a vincular:** Santa María
- **Estado:** Aprobado
