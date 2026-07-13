# Delicias Torriet - Sistema de Pedidos

Sistema web de pedidos para empanadas artesanales con backend en Google Apps Script y Google Sheets.

## 🚀 URL del Despliegue

- **Vista Pública (Clientes):** https://script.google.com/macros/s/AKfycbzA5pjNOI-oMe4fjqXUGnjrd1904Nv0B7oi9yJ8PYhuPMGcK0yiRrge92Bw5GrzKYYR/exec
- **Vista Admin:** https://script.google.com/macros/s/AKfycbzA5pjNOI-oMe4fjqXUGnjrd1904Nv0B7oi9yJ8PYhuPMGcK0yiRrge92Bw5GrzKYYR/exec?view=admin

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
├── styles.css       # Estilos modernos turquesa/celeste
├── script.js        # Lógica del wizard y carrito
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

1. Abrir https://script.google.com/
2. Crear nuevo proyecto
3. Copiar contenido de Code.gs al editor
4. Crear archivos public.html y admin.html
5. Implementar como "Aplicación web"
6. Ejecutar como: "Yo"
7. Quién tiene acceso: "Cualquier persona"
8. Copiar URL generada
