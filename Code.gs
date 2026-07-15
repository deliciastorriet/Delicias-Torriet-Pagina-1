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
const COL_P_UNIT = 6;
const COL_TOTAL = 7;
const COL_TIPO_ENTREGA = 8;
const COL_DIRECCION = 9;
const COL_FECHA_ENTREGA = 10;
const COL_NOTAS = 11;
const COL_ESTADO_PAGO = 12;
const COL_ESTADO_PEDIDO = 13;
const COL_COMPROBANTE = 14;
const COL_NOTA_PRODUCTO = 15;

/**
 * Sirve la vista pública o admin según parámetro view
 */
function doGet(e) {
  const view = e.parameter.view;

  if (view === 'admin') {
    return servirVistaAdmin();
  }

  // Frontend está en GitHub Pages — redirigir allí
  return HtmlService.createHtmlOutput('<meta http-equiv="refresh" content="0;url=https://deliciastorriet.github.io/Delicias-Torriet-Pagina-1/public.html">')
    .setTitle('Delicias Torriet');
}

/**
 * Sirve la vista admin protegida
 */
function servirVistaAdmin() {
  if (!verificarAcceso()) {
    return HtmlService.createHtmlOutput('Acceso denegado. Email no autorizado.')
      .setTitle('Acceso Denegado');
  }

  const template = HtmlService.createTemplateFromFile('admin');
  const html = template.evaluate()
    .setTitle('Delicias Torriet - Panel Admin')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return html;
}

/**
 * Incluye un archivo HTML en el template
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Recibe y procesa un nuevo pedido via POST
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No se recibieron datos en la solicitud');
    }

    const data = JSON.parse(e.postData.contents);

    if (!data || !Array.isArray(data.productos) || data.productos.length === 0) {
      throw new Error('El pedido no contiene productos');
    }

    if (!data.nombre || !data.telefono) {
      throw new Error('Faltan datos del cliente');
    }

    // Generar ID de pedido único
    const idPedido = generarIdPedido();
    const fecha = new Date().toISOString();

    const sheet = getSheet();
    const productos = data.productos;
    let totalPedido = 0;

    // Insertar una fila por producto
    productos.forEach(prod => {
      if (prod.cantidad > 0) {
        const isPack = prod.tipo === 'pack';
        const precio = prod.precio || 0;
        const qty = prod.cantidad;

        let precioUnit = 0;
        let subtotal = 0;

        if (isPack) {
          // El precio del payload ya es el total del pack
          subtotal = precio;
          precioUnit = qty > 0 ? precio / qty : 0;
        } else {
          // Individuales y fee: precio unitario, cantidad * precio
          precioUnit = precio;
          subtotal = qty * precio;
        }

        totalPedido += subtotal;

        const fila = [
          fecha,
          idPedido,
          data.nombre || '',
          data.telefono || '',
          prod.nombre,
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
        sheet.appendRow(fila);
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

    if (!idPedido) {
      return;
    }

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

/**
 * Actualiza estado de pago y pedido para un ID específico
 */
function actualizarEstado(idPedido, estadoPago, estadoPedido) {
  if (!idPedido) {
    throw new Error('ID de pedido requerido');
  }

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
