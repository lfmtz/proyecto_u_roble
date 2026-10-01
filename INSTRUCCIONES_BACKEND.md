# Guía de Configuración del Backend (Google Sheets + Apps Script)

Esta guía es para quien configurará la base de datos en Google Sheets. Toma menos de 5 minutos.

---

### Paso 1: Subir los datos al Google Sheet

1. Abre Google Drive y crea una hoja de cálculo nueva (nombre sugerido: **Roble 30 - Mantenimiento**).
2. Ve a **Archivo** > **Importar** > pestaña **Subir**.
3. Selecciona el archivo `roble-30a2-datos-consolidados.xlsx`.
4. En "Ubicación de importación", elige **Reemplazar hoja de cálculo**.
5. Haz clic en **Importar datos**.
6. Confirma que la hoja tenga exactamente 4 pestañas con estos nombres en minúsculas:
   - `vecinos`
   - `movimientos`
   - `egresos`
   - `proyecto_fondo`

---

### Paso 2: Pegar el código en Apps Script

1. En la misma hoja de cálculo, abre el menú **Extensiones** > **Apps Script**.
2. Borra el código de ejemplo que aparece (`function myFunction() {...}`).
3. Abre el archivo [`Code.gs`](./Code.gs), copia todo su contenido y pégalo en el editor de Apps Script.
4. Haz clic en el ícono de **Guardar** (el disquete 💾) o presiona `Ctrl + S`.

---

### Paso 3: Publicar como Web App

1. Arriba a la derecha, haz clic en el botón azul **Implementar** > **Nueva implementación**.
2. En el engrane ⚙️ ("Seleccionar tipo"), elige **Aplicación web**.
3. Configura estos campos:
   - **Descripción:** `API Roble 30 v1`
   - **Ejecutar como:** `Yo (tu cuenta de correo)`
   - **Quién tiene acceso:** **`Cualquier usuario`** *(⚠️ Muy importante: debe decir "Cualquier usuario" para que la app web pueda consultar y registrar sin requerir login de Google a los vecinos).*
4. Haz clic en **Implementar**.
5. Si Google te pide autorizar permisos:
   - Selecciona tu cuenta de Google.
   - Haz clic en *Opciones avanzadas* (Advanced) > *Ir a Proyecto (no seguro)*.
   - Presiona *Permitir*.
6. Al finalizar, Google te mostrará una ventana con la **URL de la aplicación web** (termina en `/exec`).

---

### Lo que nos deben entregar

Simplemente copia esa URL generada:
```text
https://script.google.com/macros/s/AKfycb.../exec
```

Con esa URL conectamos de inmediato la aplicación web frontend.
