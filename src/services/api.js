const API_URL = "https://script.google.com/macros/s/AKfycbyYQRkVJalWeWfr3LrWF0XUd4gZQFZuvg2Br7_25pwwCLdC4FabfNP7CEFa2EJMhjdlhw/exec";

const CACHE_KEY = "roble30_data_cache";

/**
 * Obtiene todos los datos del Google Sheet (vecinos, movimientos, egresos, proyecto_fondo)
 */
export async function fetchAppData() {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Error en servidor: ${res.statusText}`);
    }

    const json = await res.json();
    if (json.status === "success" && json.data) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
      } catch (e) {
        console.warn("No se pudo guardar en localStorage", e);
      }
      return json.data;
    } else {
      throw new Error(json.message || "Respuesta inválida del servidor");
    }
  } catch (error) {
    console.error("Fallo al obtener datos de Google Sheets:", error);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      console.info("Usando datos de caché local");
      return JSON.parse(cached);
    }
    throw error;
  }
}

/**
 * Envía una petición POST al Google Apps Script
 */
async function sendPost(action, data) {
  const payload = { action, data };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message || "Error al procesar la solicitud");
  }
  return json;
}

export async function registrarPago(data) {
  return await sendPost("registrar_pago", data);
}

export async function registrarEgreso(data) {
  return await sendPost("registrar_egreso", data);
}

export async function editarEgreso(data) {
  return await sendPost("editar_egreso", data);
}

export async function eliminarEgreso(data) {
  return await sendPost("eliminar_egreso", data);
}

export async function registrarGastosFijosMes(data) {
  return await sendPost("registrar_gastos_fijos_mes", data);
}

export async function registrarFondo(data) {
  return await sendPost("registrar_fondo", data);
}

export async function actualizarVecino(data) {
  return await sendPost("actualizar_vecino", data);
}

export async function loginUser(usuario, password) {
  return await sendPost("login", { usuario, password });
}
