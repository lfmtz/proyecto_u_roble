export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function getMonthName(monthNum) {
  const idx = Number(monthNum) - 1;
  return MONTH_NAMES[idx] || monthNum;
}

export function getMonthNumber(monthName) {
  if (!monthName) return 1;
  const idx = MONTH_NAMES.findIndex(
    m => m.toLowerCase() === String(monthName).toLowerCase().trim()
  );
  return idx >= 0 ? idx + 1 : 1;
}

export function getStatusBadge(estado) {
  const status = String(estado || '').toLowerCase().trim();
  switch (status) {
    case 'pagado':
      return {
        label: 'Pagado',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-500',
        text: 'text-emerald-700'
      };
    case 'parcial':
      return {
        label: 'Parcial',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-500',
        text: 'text-amber-700'
      };
    case 'pendiente':
    default:
      return {
        label: 'Pendiente',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'bg-rose-500',
        text: 'text-rose-700'
      };
  }
}
