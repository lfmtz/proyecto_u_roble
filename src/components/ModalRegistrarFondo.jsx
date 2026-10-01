import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Loader2, Flame } from 'lucide-react';

export default function ModalRegistrarFondo() {
  const { closeModal, handleRegistrarFondo } = useApp();

  const [tipo, setTipo] = useState('aportacion'); // 'aportacion' o 'gasto'
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const montoNum = Number(monto);
    if (!concepto.trim()) {
      setErrorMsg('Debes especificar un concepto.');
      return;
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }

    const payload = {
      proyecto: 'Cambio de tanque de gas',
      tipo: tipo,
      concepto: concepto.trim(),
      monto: montoNum,
    };

    try {
      setSaving(true);
      await handleRegistrarFondo(payload);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al registrar en Google Sheets.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-orange-100 text-orange-700">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Movimiento en Fondo Especial</h3>
              <p className="text-xs text-slate-500">Proyecto: Cambio de tanque de gas</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Tipo de Movimiento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo('aportacion')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  tipo === 'aportacion'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                + Aportación (Ingreso)
              </button>

              <button
                type="button"
                onClick={() => setTipo('gasto')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  tipo === 'gasto'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                - Gasto (Egreso)
              </button>
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Concepto / Justificación
            </label>
            <input
              type="text"
              placeholder="Ej. Aportación depto 201 para tanque / Compra de válvula"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monto ($)
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando en Sheet...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Guardar Movimiento
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
