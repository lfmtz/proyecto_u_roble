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
      targetSheet.appendRow(rowData);

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
      targetSheet.appendRow(rowData);

    } else if (action === "registrar_fondo") {
      targetSheet = ss.getSheetByName("proyecto_fondo");
      // Columnas: proyecto, tipo, concepto, monto
      rowData = [
        data.proyecto || "Cambio de tanque de gas",
        data.tipo, // 'aportacion' o 'gasto'
        data.concepto,
        Number(data.monto)
      ];
      targetSheet.appendRow(rowData);

    } else if (action === "actualizar_vecino") {
      // Actualizar datos de contacto y nombre en la pestaña vecinos
      targetSheet = ss.getSheetByName("vecinos");
      if (!targetSheet) throw new Error("No se encontró la hoja vecinos");
      
      const sheetData = targetSheet.getDataRange().getValues();
      const targetDepto = String(data.depto).trim();
      let rowIndex = -1;

      // Buscar la fila por número de depto (columna 0)
      for (let i = 1; i < sheetData.length; i++) {
        if (String(sheetData[i][0]).trim() === targetDepto) {
          rowIndex = i + 1; // 1-indexed para SpreadsheetApp
          break;
        }
      }

      if (rowIndex !== -1) {
        // Columnas: depto, nombre, correo, telefono, nota
        targetSheet.getRange(rowIndex, 2).setValue(data.nombre || "");
        targetSheet.getRange(rowIndex, 3).setValue(data.correo || "");
        targetSheet.getRange(rowIndex, 4).setValue(data.telefono || "");
        targetSheet.getRange(rowIndex, 5).setValue(data.nota || "");
      } else {
        // Si no existe, agregarlo como nuevo vecino
        targetSheet.appendRow([
          data.depto,
          data.nombre || "",
          data.correo || "",
          data.telefono || "",
          data.nota || ""
        ]);
      }

    } else {
      throw new Error("Acción no reconocida: " + action);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Operación realizada correctamente",
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
