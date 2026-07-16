// Delicias Torriet - Google Apps Script Backend
// Spreadsheet ID: 1u8R2W6YT6xlB0hWaytk-xARCOOCjg0M4lSqlRpGbSRc
// Admin email: deliciastorriet@gmail.com

const SPREADSHEET_ID = '1u8R2W6YT6xlB0hWaytk-xARCOOCjg0M4lSqlRpGbSRc';
const ADMIN_EMAIL = 'deliciastorriet@gmail.com';

// Columnas del Sheet (índices 0-based)
const COL_FECHA = 0;
const COL_ID_PEDIDO = 1;
const COL_NOMBRE = 2;
const COL_TEL = 3;
const COL_PRODUCTO = 4;
const COL_CANTIDAD = 5;
const COL_UDS = 6;
const COL_P_UNIT = 7;
const COL_TOTAL = 8;
const COL_TIPO_ENTREGA = 9;
const COL_DIRECCION = 10;
const COL_FECHA_ENTREGA = 11;
const COL_NOTAS = 12;
const COL_ESTADO_PAGO = 13;
const COL_ESTADO_PEDIDO = 14;
const COL_COMPROBANTE = 15;
const COL_NOTA_PRODUCTO = 16;

function doGet(e) {
  var view = e.parameter.view;
  if (view === 'admin') {
    return servirVistaAdmin();
  }
  return HtmlService.createHtmlOutput('<meta http-equiv="refresh" content="0;url=https://deliciastorriet.github.io/Delicias-Torriet-Pagina-1/">')
    .setTitle('Delicias Torriet');
}

function servirVistaAdmin() {
  if (!verificarAcceso()) {
    return HtmlService.createHtmlOutput('Acceso denegado. Email no autorizado.')
      .setTitle('Acceso Denegado');
  }
  var template = HtmlService.createTemplateFromFile('admin');
  var html = template.evaluate()
    .setTitle('Delicias Torriet - Panel Admin')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos en la solicitud');
    }
    var data = JSON.parse(e.postData.contents);
    if (!data || !Array.isArray(data.productos) || data.productos.length === 0) {
      throw new Error('El pedido no contiene productos');
    }
    if (!data.nombre || !data.telefono) {
      throw new Error('Faltan datos del cliente');
    }
    var idPedido = generarIdPedido();
    var fecha = new Date().toISOString();
    var sheet = getSheet();
    var productos = data.productos;
    var totalPedido = 0;

    productos.forEach(function(prod) {
      if (prod.cantidad > 0) {
        var isPack = prod.tipo === 'pack';
        var precio = prod.precio || 0;
        var qty = prod.cantidad;
        var precioUnit = 0;
        var subtotal = 0;

        if (isPack) {
          subtotal = precio;
          precioUnit = qty > 0 ? precio / qty : 0;
        } else {
          precioUnit = precio;
          subtotal = qty * precio;
        }

        totalPedido += subtotal;

        var fila = [
          fecha,
          idPedido,
          data.nombre || '',
          data.telefono || '',
          prod.nombre,
          qty,
          qty,
          precioUnit,
          subtotal,
          data.tipoEntrega || '',
          data.direccion || '',
          data.fechaEntrega || '',
          data.notas || '',
          'Pendiente',
          'Recibido',
          data.comprobante || '',
          prod.nota || ''
        ];

        var lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, 1, 17).setValues([fila]);
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      idPedido: idPedido,
      total: totalPedido
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getPedidosAgrupados() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var filas = data.slice(1);
  var pedidos = {};

  filas.forEach(function(fila) {
    var idPedido = fila[COL_ID_PEDIDO];
    if (!idPedido) return;

    if (!pedidos[idPedido]) {
      pedidos[idPedido] = {
        idPedido: idPedido,
        fecha: fila[COL_FECHA],
        nombre: fila[COL_NOMBRE],
        telefono: fila[COL_TEL],
        tipoEntrega: fila[COL_TIPO_ENTREGA],
        direccion: fila[COL_DIRECCION],
        fechaEntrega: fila[COL_FECHA_ENTREGA],
        notas: fila[COL_NOTAS],
        estadoPago: fila[COL_ESTADO_PAGO],
        estadoPedido: fila[COL_ESTADO_PEDIDO],
        comprobante: fila[COL_COMPROBANTE],
        productos: [],
        total: 0
      };
    }

    pedidos[idPedido].productos.push({
      producto: fila[COL_PRODUCTO],
      cantidad: fila[COL_CANTIDAD],
      precioUnitario: fila[COL_P_UNIT],
      subtotal: fila[COL_TOTAL],
      nota: fila[COL_NOTA_PRODUCTO]
    });

    pedidos[idPedido].total += Number(fila[COL_TOTAL]) || 0;
  });

  return Object.values(pedidos);
}

function actualizarEstado(idPedido, estadoPago, estadoPedido) {
  if (!idPedido) {
    throw new Error('ID de pedido requerido');
  }
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var actualizadas = 0;

  for (var i = 1; i < data.length; i++) {
    if (data[i][COL_ID_PEDIDO] === idPedido) {
      if (estadoPago) {
        sheet.getRange(i + 1, COL_ESTADO_PAGO + 1).setValue(estadoPago);
      }
      if (estadoPedido) {
        sheet.getRange(i + 1, COL_ESTADO_PEDIDO + 1).setValue(estadoPedido);
      }
      actualizadas++;
    }
  }
  return { success: true, actualizadas: actualizadas };
}

function verificarAcceso() {
  var email = Session.getActiveUser().getEmail();
  return email === ADMIN_EMAIL;
}

function generarIdPedido() {
  var timestamp = Date.now().toString(36).toUpperCase();
  var random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return 'DT-' + timestamp + '-' + random;
}

function getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
}
