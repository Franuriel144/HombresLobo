# La mesa de Castronegro

Una primera herramienta para el narrador: añade y elimina personajes para representar su orden alrededor de una mesa, con una abertura reservada para el narrador. La lista se guarda en el navegador del dispositivo. Se pueden añadir varias copias del mismo personaje.

Arrastra una carta sobre otra para cambiar su posición, o utiliza las flechas de la lista. Pulsa una carta o el lápiz de la lista para cambiar el personaje del asiento.

Al comenzar el primer día puedes asignar los cargos de alcalde y guardia con los selectores o arrastrar sus insignias sobre una carta. Sus insignias también pueden arrastrarse desde la mesa para transferirlos. Los cargos acompañan al asiento cuando se reorganiza y quedan libres si se elimina a su ocupante.

Desde el día se puede comenzar una noche y avanzar por una guía de llamadas. Marca manualmente los jugadores vivos o convertidos y actualiza los poderes y variantes en la guía. La guía ofrece recordatorios, pero no calcula automáticamente las acciones, muertes encadenadas ni todas las interacciones especiales: consulta el reglamento para resolverlas.

La aplicación avisa de las condiciones de victoria que puede deducir de los estados registrados: bandos, Ángel, Flautista, enamorados de bandos distintos, lobo albino y objetivo del sectario al terminar. Registra enamorados, hechizados y causa de eliminación del Ángel cuando corresponda. Los grupos del sectario se calculan automáticamente: asientos pares al grupo A e impares al B; se actualizan al cambiar el orden de los asientos. Los efectos encadenados y cambios especiales aún requieren resolución manual, por lo que el aviso debe comprobarse antes de anunciar el resultado. Reiniciar borra la partida guardada en el navegador.

En los turnos compatibles, pulsa una carta o escoge un asiento y utiliza los botones de acción. Los ataques y pociones se guardan y las víctimas se resuelven al comenzar el día; el defensor, la infección y la primera mordedura del anciano se tienen en cuenta. Cupido, el niño salvaje, el zorro y el flautista también permiten registrar sus elecciones. Algunas habilidades, como el comediante, el cazador y otros efectos especiales, siguen requiriendo intervención manual.

Durante el día, selecciona el resultado de la votación y aplícalo. El contador indica la mayoría absoluta de los votos posibles, incluyendo el voto doble del alcalde vivo; la casilla «Puede votar» permite reflejar restricciones. La votación puede resolverse por mayoría relativa según las reglas de la mesa: la aplicación no cuenta los votos individuales.

Se aplica la regla de mesa de victoria de la manada cuando los lobos vivos igualan o superan al resto de supervivientes. El narrador debe comprobar antes los poderes y efectos especiales pendientes que puedan cambiar el resultado.

Abre `dist/index.html` en un navegador para usarla. No requiere instalación ni servidor.

Para publicar en GitHub Pages, selecciona «GitHub Actions» como origen de Pages en la configuración del repositorio. El flujo incluido publica `dist` al subir cambios a la rama `main` o al ejecutarlo manualmente.

Las imágenes de las cartas de `dist/share/cartas` proceden de [La Aldea de Castronegro](https://laaldeadecastronegro.blogspot.com/p/personajes.html). El Alguacil y el Guardia son cargos adicionales y sus imágenes se utilizan para sus insignias.
