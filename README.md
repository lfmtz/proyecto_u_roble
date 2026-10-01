# Datos consolidados — Edificio Roble 30 A 2

Generado a partir de los archivos en la carpeta `ROBLE 30 A 2`. Estos 4 archivos son
la base de datos lista para que Antigravity construya la app sobre ellos (o para
subirlos directo a Google Sheets, una pestaña por archivo).

## Archivos

### `vecinos.csv`
Un renglón por departamento. Viene de `DIRECTORIO VECINOS` (archivo 2026, el más reciente).
Columnas: `depto, nombre, correo, telefono, nota`.

### `movimientos.csv`
**1,858 renglones.** Un renglón por depto × año × mes, de 2019 a 2026. Viene de la hoja
`BASE DE DATOS DE MOVIMIENTOS` de `PAGOS MANTENIMIENTO 2025.xlsx` (2019–2025) y
`PAGOS MANTENIMIENTO 2026.xlsx` (2026) — cuando un mismo mes aparece en ambos archivos
se usó el valor del archivo 2026 por ser el más actualizado.

Columnas: `depto, anio, mes_num, mes, cuota, monto_pagado, estado, fuente`.
`estado` se calculó así: `monto_pagado <= 0` → pendiente · `0 < monto_pagado < 150` → parcial
· `monto_pagado >= 150` → pagado. La cuota mensual estándar es **$150**, no los montos de
ejemplo que usamos en el diseño — hay que corregir eso en la maqueta.

**No se usaron los 18 archivos de la carpeta por departamento** (001 a 404): son una copia
de los mismos datos, pero quedaron sin actualizar desde 2025 (sus filas de 2025 están en
cero). Una vez migrado esto a la base de datos real, esos archivos ya no hacen falta.

### `egresos.csv`
**13 renglones**, los únicos meses con gasto detallado por concepto: diciembre 2025, enero
2026 (de `ESTADOS DE CUENTA MENSUALES.xlsx`) y agosto 2026 (del documento que se pega en el
pizarrón, que ya trae los gastos separados en fijos/variables). El resto de los meses solo
existen como total anual en `INGRESOS Y EGRESOS 2019_2025`, sin desglose — no hay manera de
reconstruir esos renglones, quedan fuera.

Columnas: `mes, anio, concepto, monto, tipo, fuente`. `tipo` es `fijo` o `variable`: para
diciembre y enero se clasificó por nombre (recolección y lavado de contenedores = fijo,
siguiendo el mismo criterio que ya usa el documento de agosto).

### `proyecto_fondo.csv`
El fondo especial para el **cambio de tanque de gas**, tomado tal cual del documento que se
pega en el pizarrón (corte al 16 de septiembre de 2026): de dónde salió el dinero
(`aportacion`) y en qué se ha gastado (`gasto`), más los dos renglones de `TOTAL` tal como
los reportó el documento. Este es el ejemplo real que debe usar el "fondo de proyecto
especial" de la app — ya no es necesario inventar datos de ejemplo para esa parte.

## Pendientes para cuando se conecte la app de verdad

- **Pagos anuales y adeudos acumulados de años anteriores no quedaron en `movimientos.csv`
  tal cual se explican.** El documento del pizarrón los maneja con notas de texto libre
  ("pagó anual", "paga adeudos de 2022 a octubre 2025") en vez de un dato estructurado. La
  hoja `BASE DE DATOS DE MOVIMIENTOS` sí reparte esos pagos mes por mes correctamente, así
  que `movimientos.csv` ya tiene el dato bien aplicado — pero si se quiere mostrar "pagó
  anual" como etiqueta en la app, ese texto no existe como campo y habría que agregarlo a mano.
- El depto **202** no tiene su propio archivo individual como los demás (sí aparece en
  `vecinos.csv` y en `movimientos.csv`), solo para que no se busque por accidente.
- Antes de octubre 2026 solo hay 3 meses con gasto desglosado. Para que el estado de cuenta
  mensual funcione desde el primer mes real, lo más fácil es empezar a capturar los gastos
  del mes corriente directo en la hoja nueva, sin intentar reconstruir el historial completo.
