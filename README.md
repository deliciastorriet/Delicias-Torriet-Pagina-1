# Delicias Torriet - Sistema de Pedidos

Sistema web de pedidos para empanadas artesanales con backend en Google Apps Script y Google Sheets.

## 🚀 URLs

- **Frontend (Clientes):** `https://<usuario>.github.io/<repo>/public.html`
- **Backend (Apps Script):** `https://script.google.com/macros/s/AKfycbybdkKQFsIqDZfVf3p35xu5Le4eTZkjGlWZF0rQIZ06Gh4URt2sKE_Uh3i7qM0eMjfG/exec`
- **Vista Admin:** `https://script.google.com/macros/s/AKfycbybdkKQFsIqDZfVf3p35xu5Le4eTZkjGlWZF0rQIZ06Gh4URt2sKE_Uh3i7qM0eMjfG/exec?view=admin`

## 📋 Características

### Vista Pública
- Catálogo de productos con precios
- Carrito de compras en tiempo real
- Formulario de pedido con validación
- Integración de pago Yappy
- Confirmación con ID de pedido único

### Vista Admin
- Panel de gestión de pedidos
- Filtros por estado de pago y pedido
- Búsqueda por nombre, teléfono o ID
- Actualización de estados en tiempo real
- Contacto directo via WhatsApp
- Acceso protegido por email

## 🛠️ Stack Tecnológico

- **Frontend:** HTML, CSS, JavaScript vanilla
- **Backend:** Google Apps Script
- **Base de datos:** Google Sheets
- **Diseño:** Mobile-first, responsive

## 📦 Catálogo de Productos

| Producto | Precio | Identificación |
|----------|--------|---------------|
| Pollo | $1.00 | 3 puntos verticales |
| Carne | $1.00 | 3 puntos horizontales |
| Bacalao | $1.50 | 1 punto |
| Piña | $1.50 | sin marca de puntos |
| Kekies | $0.90 | producto aparte |

## 💳 Método de Pago

- **Yappy:** 6641-8825

## 🔐 Credenciales Admin

- **Email autorizado:** deliciastorriet@gmail.com
- **Spreadsheet ID:** 1u8R2W6YT6xlB0hWaytk-xARCOOCjg0M4lSqlRpGbSRc

## 📁 Estructura del Proyecto

```
Delicias Torriet/
├── Code.gs          # Backend de Google Apps Script
├── public.html      # Vista de clientes (wizard de 6 fases)
├── styles.html      # Estilos modernos turquesa/celeste (con etiquetas <style>)
├── script.html      # Lógica del wizard y carrito (con etiquetas <script>)
├── admin.html       # Panel de administración
└── README.md        # Documentación
```

## 🔄 Funciones del Backend

### Code.gs
- `doPost(e)` - Recibe y procesa pedidos nuevos
- `doGet(e)` - Sirve vistas según parámetro
- `getPedidosAgrupados()` - Lee y agrupa pedidos del Sheet
- `actualizarEstado()` - Actualiza estados de pedidos
- `verificarAcceso()` - Autenticación de admin
- `generarIdPedido()` - Genera IDs únicos formato DT-{timestamp}-{random}

## 🎨 Diseño

- **Colores:** Turquesa (#40E0D0), Celeste (#87CEEB), Naranja (#FF6B35) - Brand tropical/caribeño
- **Tipografía:** Inter, moderna y legible
- **Responsive:** Mobile-first en vista pública, desktop-friendly en admin
- **Wizard:** Sistema de 6 fases para flujo de pedido optimizado
- **Imágenes:** Fotos reales de empanadas integradas en catálogo

## 📝 Notas

- No usa localStorage/sessionStorage
- Una fila del Sheet = un producto dentro de un pedido
- Múltiples productos del mismo pedido comparten ID Pedido
- Estructura lista para añadir combos/pedidos de fiesta

## 🚀 Despliegue

### Frontend (GitHub Pages)

1. Crear un repositorio en GitHub (si no existe)
2. Subir estos archivos a la raíz del repositorio:
   - `public.html`
   - `styles.css`
   - `script.js`
   - Todas las imágenes (`.jpeg`, `.png`)
3. En GitHub: Settings → Pages → Source: rama `main` / carpeta `root`
4. Guardar y esperar ~1 minuto. La URL será: `https://<usuario>.github.io/<repo>/public.html`

### Backend (Google Apps Script)

1. Abrir https://script.google.com/ y crear un proyecto nuevo
2. Pegar el contenido de `Code.gs` en el editor
3. Crear archivo HTML llamado `admin` (sin extensión `.html`) y pegar el contenido de `admin.html`
4. Implementar como "Aplicación web"
5. Ejecutar como: "Yo"
6. Quién tiene acceso: **"Cualquier persona"** (importante para que CORS funcione)
7. Copiar la URL generada
8. Pegar esa URL en `public.html` en la constante `APPS_SCRIPT_URL` (línea ~1838)

### URL actual del backend

`https://script.google.com/macros/s/AKfycbybdkKQFsIqDZfVf3p35xu5Le4eTZkjGlWZF0rQIZ06Gh4URt2sKE_Uh3i7qM0eMjfG/exec`

### Notas importantes

- El frontend se sirve desde GitHub Pages y envía los pedidos al backend de Apps Script via POST.
- Apps Script responde automáticamente con cabeceras CORS cuando el despliegue es "Cualquier persona".
- El fetch en `public.html` **no debe** incluir `Content-Type: application/json` para evitar preflight OPTIONS (que Apps Script no soporta). El body se envía como `text/plain` automáticamente.
- El panel admin se accede directamente desde la URL del Apps Script con `?view=admin`.
