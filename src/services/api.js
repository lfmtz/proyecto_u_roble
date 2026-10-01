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
      // Guardar en caché local para arranque instantáneo y modo offline
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
    // Intentar recuperar de caché si falla la red
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

/**
 * Registra un pago en la hoja 'movimientos'
 */
export async function registrarPago(data) {
  // data: { depto, anio, mes_num, mes, cuota, monto_pagado, estado, fuente }
  return await sendPost("registrar_pago", data);
}

/**
 * Registra un gasto en la hoja 'egresos'
 */
export async function registrarEgreso(data) {
  // data: { mes, anio, concepto, monto, tipo, fuente }
  return await sendPost("registrar_egreso", data);
}

/**
 * Registra un movimiento en la hoja 'proyecto_fondo'
 */
export async function registrarFondo(data) {
  // data: { proyecto, tipo, concepto, monto }
  return await sendPost("registrar_fondo", data);
}
