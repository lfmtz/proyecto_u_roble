/**
 * Google Apps Script - API para Edificio Roble 30
 * Permite lectura (doGet) y escritura (doPost) sobre el Google Sheet.
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const response = {
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        vecinos: getSheetRows(ss.getSheetByName("vecinos")),
        movimientos: getSheetRows(ss.getSheetByName("movimientos")),
        egresos: getSheetRows(ss.getSheetByName("egresos")),
        proyecto_fondo: getSheetRows(ss.getSheetByName("proyecto_fondo"))
      }
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data;

    let targetSheet;
    let rowData = [];

    if (action === "registrar_pago") {
      targetSheet = ss.getSheetByName("movimientos");
      // Columnas: depto, anio, mes_num, mes, cuota, monto_pagado, estado, fuente
      rowData = [
        data.depto,
        Number(data.anio),
        Number(data.mes_num),
        data.mes,
        Number(data.cuota || 150),
        Number(data.monto_pagado),
        data.estado,
        data.fuente || "App Web"
      ];
    } else if (action === "registrar_egreso") {
      targetSheet = ss.getSheetByName("egresos");
      // Columnas: mes, anio, concepto, monto, tipo, fuente
      rowData = [
        data.mes,
        Number(data.anio),
        data.concepto,
        Number(data.monto),
        data.tipo, // 'fijo' o 'variable'
        data.fuente || "App Web"
      ];
    } else if (action === "registrar_fondo") {
      targetSheet = ss.getSheetByName("proyecto_fondo");
      // Columnas: proyecto, tipo, concepto, monto
      rowData = [
        data.proyecto || "Cambio de tanque de gas",
        data.tipo, // 'aportacion' o 'gasto'
        data.concepto,
        Number(data.monto)
      ];
    } else {
      throw new Error("Acción no reconocida: " + action);
    }

    if (!targetSheet) {
      throw new Error("No se encontró la hoja correspondiente");
    }

    targetSheet.appendRow(rowData);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registro guardado correctamente",
      action: action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Convierte el contenido de una hoja en un arreglo de objetos JSON
 * tomando la fila 1 como nombres de propiedad.
 */
function getSheetRows(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0].map(h => String(h).trim());
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Ignorar filas totalmente vacías
    if (row.every(cell => cell === "" || cell === null)) continue;
    
    const obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[header] = val;
    });
    rows.push(obj);
  }

  return rows;
}
