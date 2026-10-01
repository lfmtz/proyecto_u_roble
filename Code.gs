/**
 * Google Apps Script - API para Edificio Roble 30
 * Permite lectura (doGet), escritura, edición, eliminación y autenticación (doPost).
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
    const data = payload.data || {};

    let targetSheet;

    // 1. REGISTRAR PAGO
    if (action === "registrar_pago") {
      targetSheet = ss.getSheetByName("movimientos");
      const rowData = [
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

    // 2. REGISTRAR EGRESO
    } else if (action === "registrar_egreso") {
      targetSheet = ss.getSheetByName("egresos");
      const rowData = [
        data.mes,
        Number(data.anio),
        data.concepto,
        Number(data.monto),
        data.tipo, // 'fijo' o 'variable'
        data.fuente || "App Web"
      ];
      targetSheet.appendRow(rowData);

    // 3. EDITAR EGRESO
    } else if (action === "editar_egreso") {
      targetSheet = ss.getSheetByName("egresos");
      let rowNum = Number(data._row);
      if (rowNum && rowNum > 1 && rowNum <= targetSheet.getLastRow()) {
        targetSheet.getRange(rowNum, 1, 1, 5).setValues([[
          data.mes,
          Number(data.anio),
          data.concepto,
          Number(data.monto),
          data.tipo
        ]]);
      } else {
        // Búsqueda por coincidencia
        const sData = targetSheet.getDataRange().getValues();
        for (let i = 1; i < sData.length; i++) {
          if (sData[i][2] === data.oldConcepto || (sData[i][0] === data.mes && sData[i][1] == data.anio)) {
            targetSheet.getRange(i + 1, 1, 1, 5).setValues([[
              data.mes,
              Number(data.anio),
              data.concepto,
              Number(data.monto),
              data.tipo
            ]]);
            break;
          }
        }
      }

    // 4. ELIMINAR EGRESO
    } else if (action === "eliminar_egreso") {
      targetSheet = ss.getSheetByName("egresos");
      let rowNum = Number(data._row);
      if (rowNum && rowNum > 1 && rowNum <= targetSheet.getLastRow()) {
        targetSheet.deleteRow(rowNum);
      } else {
        // Fallback: buscar por coincidencia de concepto y monto
        const sData = targetSheet.getDataRange().getValues();
        for (let i = sData.length - 1; i >= 1; i--) {
          if (sData[i][2] === data.concepto && Number(sData[i][3]) === Number(data.monto)) {
            targetSheet.deleteRow(i + 1);
            break;
          }
        }
      }

    // 5. REGISTRAR GASTOS FIJOS EN BLOQUE (BASURA Y LIMPIEZA)
    } else if (action === "registrar_gastos_fijos_mes") {
      targetSheet = ss.getSheetByName("egresos");
      const montoBasura = Number(data.monto_basura || 300);
      const montoLavado = Number(data.monto_lavado || 300);

      targetSheet.appendRow([
        data.mes,
        Number(data.anio),
        "Recolección de basura",
        montoBasura,
        "fijo",
        "App Web (Fijo)"
      ]);
      targetSheet.appendRow([
        data.mes,
        Number(data.anio),
        "Lavado de contenedores de basura",
        montoLavado,
        "fijo",
        "App Web (Fijo)"
      ]);

    // 6. REGISTRAR EN FONDO ESPECIAL
    } else if (action === "registrar_fondo") {
      targetSheet = ss.getSheetByName("proyecto_fondo");
      const rowData = [
        data.proyecto || "Cambio de tanque de gas",
        data.tipo,
        data.concepto,
        Number(data.monto)
      ];
      targetSheet.appendRow(rowData);

    // 7. ACTUALIZAR DATOS DE VECINO
    } else if (action === "actualizar_vecino") {
      targetSheet = ss.getSheetByName("vecinos");
      if (!targetSheet) throw new Error("No se encontró la hoja vecinos");
      
      const sheetData = targetSheet.getDataRange().getValues();
      const targetDepto = String(data.depto).trim();
      let rowIndex = -1;

      for (let i = 1; i < sheetData.length; i++) {
        if (String(sheetData[i][0]).trim() === targetDepto) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        targetSheet.getRange(rowIndex, 2).setValue(data.nombre || "");
        targetSheet.getRange(rowIndex, 3).setValue(data.correo || "");
        targetSheet.getRange(rowIndex, 4).setValue(data.telefono || "");
        targetSheet.getRange(rowIndex, 5).setValue(data.nota || "");
      } else {
        targetSheet.appendRow([
          data.depto,
          data.nombre || "",
          data.correo || "",
          data.telefono || "",
          data.nota || ""
        ]);
      }

    // 8. AUTENTICACIÓN / LOGIN DE USUARIOS
    } else if (action === "login") {
      let userSheet = ss.getSheetByName("usuarios");
      // Si la pestaña usuarios aún no existe, crearla con usuario inicial
      if (!userSheet) {
        userSheet = ss.insertSheet("usuarios");
        userSheet.appendRow(["usuario", "password", "nombre", "rol"]);
        userSheet.appendRow(["admin", "roble30", "Administración Roble 30", "admin"]);
        userSheet.appendRow(["vecino", "vecino30", "Consulta Vecino", "consulta"]);
      }

      const uData = userSheet.getDataRange().getValues();
      const inputUser = String(data.usuario || "").trim().toLowerCase();
      const inputPass = String(data.password || "").trim();
      let foundUser = null;

      for (let i = 1; i < uData.length; i++) {
        const u = String(uData[i][0]).trim().toLowerCase();
        const p = String(uData[i][1]).trim();
        if (u === inputUser && p === inputPass) {
          foundUser = {
            usuario: String(uData[i][0]),
            nombre: String(uData[i][2] || uData[i][0]),
            rol: String(uData[i][3] || "admin")
          };
          break;
        }
      }

      if (!foundUser) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Inicio de sesión exitoso",
        user: foundUser
      })).setMimeType(ContentService.MimeType.JSON);

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
 * tomando la fila 1 como nombres de propiedad y guardando _row con la fila física.
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
    
    const obj = { _row: i + 1 };
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
