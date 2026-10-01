import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMonthName, formatCurrency } from '../utils/formatters';
import { X, Check, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ModalGastosFijosMes() {
  const { closeModal, handleRegistrarGastosFijos, selectedMonth, selectedYear, monthlyEgresos } = useApp();

  const [montoBasura, setMontoBasura] = useState(300);
  const [montoLavado, setMontoLavado] = useState(300);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mesNombre = getMonthName(selectedMonth);

  // Verificar si ya existen gastos fijos en este mes
  const yaTieneFijos = monthlyEgresos.some(
    e => String(e.tipo).toLowerCase().trim() === 'fijo'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const b = Number(montoBasura);
    const l = Number(montoLavado);
    if (isNaN(b) || b <= 0 || isNaN(l) || l <= 0) {
      setErrorMsg('Ingresa montos válidos mayores a 0.');
      return;
    }

    const payload = {
      mes: mesNombre,
      anio: Number(selectedYear),
      monto_basura: b,
      monto_lavado: l,
    };

    try {
      setSaving(true);
      await handleRegistrarGastosFijos(payload);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al registrar gastos fijos en Google Sheets.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Gastos Fijos Recurrentes</h3>
            <p className="text-xs text-slate-500">
              Aplicar servicios del mes: <span className="font-bold text-slate-800">{mesNombre} {selectedYear}</span>
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {yaTieneFijos && (
          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
            <span>⚠️ Este mes ya tiene gastos fijos registrados. Si aplicas estos, se agregarán nuevamente.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">
                  1. Recolección de basura
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Servicio mensual</span>
              </div>
              <input
                type="number"
                value={montoBasura}
                onChange={(e) => setMontoBasura(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">
                  2. Lavado de contenedores de basura
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Servicio mensual</span>
              </div>
              <input
                type="number"
                value={montoLavado}
                onChange={(e) => setMontoLavado(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-semibold">Total Gastos Fijos a Registrar:</span>
            <span className="text-emerald-800 font-black text-sm font-mono-numbers">
              {formatCurrency(Number(montoBasura || 0) + Number(montoLavado || 0))}
            </span>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Registrando fijos...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Aplicar Gastos Fijos ({mesNombre})
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
