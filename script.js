// Delicias Torriet - JavaScript para Wizard de Pedidos

// Product catalog with image paths
const productos = [
  { id: 'pollo', nombre: 'Pollo', precio: 1.00, marca: '••• (vertical)', imagen: 'WhatsApp Image 2026-07-12 at 13.58.43.jpeg' },
  { id: 'carne', nombre: 'Carne', precio: 1.00, marca: '••• (horizontal)', imagen: 'WhatsApp Image 2026-07-12 at 13.58.43 (1).jpeg' },
  { id: 'bacalao', nombre: 'Bacalao', precio: 1.50, marca: '• (1 punto)', imagen: 'WhatsApp Image 2026-07-12 at 13.58.43 (2).jpeg' },
  { id: 'pina', nombre: 'Piña', precio: 1.50, marca: 'sin puntos', imagen: 'WhatsApp Image 2026-07-12 at 13.58.44.jpeg' },
  { id: 'kekies', nombre: 'Kekies', precio: 0.90, marca: 'producto aparte', imagen: 'WhatsApp Image 2026-07-12 at 13.58.44 (1).jpeg' }
];

// Cart state
let carrito = {};
let currentStep = 1;
const totalSteps = 6;
let isAnimating = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initProducts();
  updateProgress();
  updateStepIndicators();
});

// Initialize products
function initProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = productos.map(prod => `
    <div class="product-card" id="card-${prod.id}" onclick="selectProduct('${prod.id}')">
      <div class="product-image" style="background-image: url('${prod.imagen}');">
      </div>
      <div class="product-info">
        <h3 class="product-name">${prod.nombre}</h3>
        <p class="product-price">$${prod.precio.toFixed(2)}</p>
        <div class="product-quantity">
          <button class="qty-btn" onclick="event.stopPropagation(); updateCantidad('${prod.id}', -1)">−</button>
          <span class="qty-display" id="qty-${prod.id}">0</span>
          <button class="qty-btn" onclick="event.stopPropagation(); updateCantidad('${prod.id}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Select product
function selectProduct(id) {
  if (!carrito[id]) carrito[id] = 0;
  if (carrito[id] === 0) {
    carrito[id] = 1;
    document.getElementById(`qty-${id}`).textContent = '1';
    updateCardSelection(id);
  }
}

// Update quantity
function updateCantidad(id, delta) {
  if (!carrito[id]) carrito[id] = 0;
  carrito[id] = Math.max(0, carrito[id] + delta);
  document.getElementById(`qty-${id}`).textContent = carrito[id];
  updateCardSelection(id);
}

// Update card selection visual
function updateCardSelection(id) {
  const card = document.getElementById(`card-${id}`);
  if (carrito[id] > 0) {
    card.classList.add('selected');
  } else {
    card.classList.remove('selected');
  }
}

// Calculate totals
function calculateTotals() {
  let totalUnits = 0;
  let totalPrice = 0;

  productos.forEach(prod => {
    const qty = carrito[prod.id] || 0;
    totalUnits += qty;
    totalPrice += qty * prod.precio;
  });

  return { totalUnits, totalPrice };
}

// Update summary
function updateSummary() {
  const { totalUnits, totalPrice } = calculateTotals();
  
  const summaryList = document.getElementById('summaryList');
  if (summaryList) {
    const productosOrden = productos.filter(p => carrito[p.id] > 0);
    
    if (productosOrden.length === 0) {
      summaryList.innerHTML = '<p style="text-align: center; color: #6C757D;">No hay productos seleccionados</p>';
    } else {
      summaryList.innerHTML = productosOrden.map(p => `
        <div class="summary-item">
          <span>${p.nombre} x${carrito[p.id]}</span>
          <span>$${(carrito[p.id] * p.precio).toFixed(2)}</span>
        </div>
      `).join('');
    }
  }

  const totalAmount = document.getElementById('totalAmount');
  if (totalAmount) {
    totalAmount.textContent = `$${totalPrice.toFixed(2)}`;
  }

  const totalUnitsDisplay = document.getElementById('totalUnits');
  if (totalUnitsDisplay) {
    totalUnitsDisplay.textContent = totalUnits;
  }

  return totalPrice > 0;
}

// Navigation
function nextStep() {
  if (isAnimating || currentStep >= totalSteps) return;
  if (!validateStep(currentStep)) return;

  isAnimating = true;
  const oldStep = currentStep;
  currentStep++;

  const oldEl = document.getElementById(`step${oldStep}`);
  const newEl = document.getElementById(`step${currentStep}`);

  if (oldEl) {
    oldEl.classList.remove('active');
    oldEl.classList.add('exiting');
  }

  setTimeout(() => {
    if (oldEl) oldEl.classList.remove('exiting');
    if (newEl) newEl.classList.add('active');
    updateProgress();
    updateStepIndicators();
    if (currentStep === 3) updateSummary();
    isAnimating = false;
  }, 350);
}

function prevStep() {
  if (isAnimating || currentStep <= 1) return;

  isAnimating = true;
  const oldStep = currentStep;
  currentStep--;

  const oldEl = document.getElementById(`step${oldStep}`);
  const newEl = document.getElementById(`step${currentStep}`);

  if (oldEl) {
    oldEl.classList.remove('active');
    oldEl.classList.add('exiting-back');
  }

  setTimeout(() => {
    if (oldEl) oldEl.classList.remove('exiting-back');
    if (newEl) {
      newEl.classList.add('entering-back');
      setTimeout(() => newEl.classList.remove('entering-back'), 450);
    }
    updateProgress();
    updateStepIndicators();
    isAnimating = false;
  }, 350);
}

function showStep(step) {
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('active', 'exiting', 'exiting-back', 'entering-back');
  });
  const stepElement = document.getElementById(`step${step}`);
  if (stepElement) stepElement.classList.add('active');
}

function updateProgress() {
  const progressFill = document.getElementById('progressFill');
  if (progressFill) {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${progress}%`;
  }
}

function updateStepIndicators() {
  const dots = document.querySelectorAll('.step-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i + 1 < currentStep) dot.classList.add('completed');
    else if (i + 1 === currentStep) dot.classList.add('active');
  });
}

// Toast notification
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-100px);background:#1E293B;color:#fff;padding:14px 24px;border-radius:14px;font-size:0.9rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.2);transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);max-width:90%;text-align:center;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-100px)';
  }, 3000);
}

// Validate step
function validateStep(step) {
  switch(step) {
    case 2:
      const { totalUnits } = calculateTotals();
      if (totalUnits === 0) {
        showToast('Por favor selecciona al menos un producto');
        return false;
      }
      return true;
    case 4:
      const nombre = document.getElementById('nombre')?.value.trim();
      const telefono = document.getElementById('telefono')?.value.trim();
      const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked')?.value;
      
      if (!nombre || !telefono) {
        showToast('Por favor completa nombre y teléfono');
        return false;
      }
      
      if (tipoEntrega === 'Delivery') {
        const direccion = document.getElementById('direccion')?.value.trim();
        if (!direccion) {
          showToast('Por favor ingresa la dirección de entrega');
          return false;
        }
      }
      return true;
    case 5:
      const referencia = document.getElementById('referencia')?.value.trim();
      if (!referencia) {
        showToast('Por favor ingresa la referencia de pago');
        return false;
      }
      return true;
    default:
      return true;
  }
}

// Toggle delivery address
function toggleDireccion() {
  const isDelivery = document.getElementById('delivery')?.checked;
  const direccionGroup = document.getElementById('direccionGroup');
  if (direccionGroup) {
    direccionGroup.style.display = isDelivery ? 'block' : 'none';
  }
}

// Confirm order
async function confirmarPedido() {
  const nombre = document.getElementById('nombre')?.value.trim();
  const telefono = document.getElementById('telefono')?.value.trim();
  const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked')?.value;
  const direccion = document.getElementById('direccion')?.value.trim();
  const fechaEntrega = document.getElementById('fechaEntrega')?.value;
  const notas = document.getElementById('notas')?.value.trim();
  const referencia = document.getElementById('referencia')?.value.trim();

  // Build order
  const productosOrden = productos
    .filter(p => carrito[p.id] > 0)
    .map(p => ({
      nombre: p.nombre,
      cantidad: carrito[p.id],
      precio: p.precio
    }));

  const total = productosOrden.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);

  const orderData = {
    nombre,
    telefono,
    tipoEntrega,
    direccion: tipoEntrega === 'Delivery' ? direccion : '',
    fechaEntrega,
    notas,
    comprobante: referencia,
    productos: productosOrden,
    total
  };

  try {
    const response = await fetch(window.location.href, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success) {
      showConfirmation(result.idPedido, result.total);
    } else {
      showToast('Error al procesar el pedido: ' + result.error);
    }
  } catch (error) {
    showToast('Error de conexión: ' + error.message);
  }
}

// Show confirmation
function showConfirmation(id, total) {
  const orderIdDisplay = document.getElementById('orderIdDisplay');
  if (orderIdDisplay) {
    orderIdDisplay.textContent = id;
  }
  
  const finalTotal = document.getElementById('finalTotal');
  if (finalTotal) {
    finalTotal.textContent = `$${total.toFixed(2)}`;
  }
  
  currentStep = 6;
  showStep(6);
  updateProgress();
  updateStepIndicators();
}

// Make another order
function hacerOtroPedido() {
  // Reset cart
  carrito = {};
  productos.forEach(p => {
    carrito[p.id] = 0;
    const qtyElement = document.getElementById(`qty-${p.id}`);
    if (qtyElement) qtyElement.textContent = '0';
    const card = document.getElementById(`card-${p.id}`);
    if (card) card.classList.remove('selected');
  });
  
  // Reset form
  const nombre = document.getElementById('nombre');
  const telefono = document.getElementById('telefono');
  const direccion = document.getElementById('direccion');
  const fechaEntrega = document.getElementById('fechaEntrega');
  const notas = document.getElementById('notas');
  const referencia = document.getElementById('referencia');
  
  if (nombre) nombre.value = '';
  if (telefono) telefono.value = '';
  if (direccion) direccion.value = '';
  if (fechaEntrega) fechaEntrega.value = '';
  if (notas) notas.value = '';
  if (referencia) referencia.value = '';
  
  // Reset delivery toggle
  const recoger = document.getElementById('recoger');
  if (recoger) recoger.checked = true;
  toggleDireccion();
  
  // Go to step 1
  currentStep = 1;
  showStep(1);
  updateProgress();
  updateStepIndicators();
}
