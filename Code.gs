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

/**
 * Sirve la vista pública o admin según parámetro view
 */
function doGet(e) {
  const view = e.parameter.view;
  
  if (view === 'admin') {
    return servirVistaAdmin();
  }
  
  return servirVistaPublica();
}

/**
 * Sirve la vista pública de pedidos
 */
function servirVistaPublica() {
  const html = HtmlService.createHtmlOutputFromFile('public')
    .setTitle('Delicias Torriet - Pedidos')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  
  return html;
}

/**
 * Sirve la vista admin protegida
 */
function servirVistaAdmin() {
  if (!verificarAcceso()) {
    return HtmlService.createHtmlOutput('Acceso denegado. Email no autorizado.')
      .setTitle('Acceso Denegado');
  }
  
  const html = HtmlService.createHtmlOutputFromFile('admin')
    .setTitle('Delicias Torriet - Panel Admin')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  
  return html;
}

/**
 * Recibe y procesa un nuevo pedido via POST
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Generar ID de pedido único
    const idPedido = generarIdPedido();
    const fecha = new Date().toISOString();
    
    const sheet = getSheet();
    const productos = data.productos;
    
    // Insertar una fila por producto
    productos.forEach(prod => {
      if (prod.cantidad > 0) {
        const fila = [
          fecha,
          idPedido,
          data.nombre,
          data.telefono,
          prod.nombre,
          prod.cantidad,
          prod.cantidad,
          prod.precio,
          prod.cantidad * prod.precio,
          data.tipoEntrega,
          data.direccion || '',
          data.fechaEntrega || '',
          data.notas || '',
          'Pendiente',
          'Recibido',
          data.comprobante || ''
        ];
        sheet.appendRow(fila);
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      idPedido: idPedido,
      total: data.total
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lee el Sheet y devuelve pedidos agrupados por ID
 */
function getPedidosAgrupados() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  // Saltar cabecera
  const filas = data.slice(1);
  
  const pedidos = {};
  
  filas.forEach(fila => {
    const idPedido = fila[COL_ID_PEDIDO];
    
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
      subtotal: fila[COL_TOTAL]
    });
    
    pedidos[idPedido].total += fila[COL_TOTAL];
  });
  
  return Object.values(pedidos);
}

/**
 * Actualiza estado de pago y pedido para un ID específico
 */
function actualizarEstado(idPedido, estadoPago, estadoPedido) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  let actualizadas = 0;
  
  // Empezar desde fila 2 (saltar cabecera)
  for (let i = 1; i < data.length; i++) {
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

/**
 * Verifica si el usuario actual tiene acceso admin
 */
function verificarAcceso() {
  const email = Session.getActiveUser().getEmail();
  return email === ADMIN_EMAIL;
}

/**
 * Genera un ID de pedido único
 */
function generarIdPedido() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `DT-${timestamp}-${random}`;
}

/**
 * Obtiene la hoja de cálculos
 */
function getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
}
