import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, getMonthName } from '../utils/formatters';
import { X, Check, Loader2 } from 'lucide-react';

export default function ModalRegistrarEgreso() {
  const { closeModal, handleRegistrarEgreso, selectedMonth, selectedYear } = useApp();

  const [mes, setMes] = useState(getMonthName(selectedMonth));
  const [anio, setAnio] = useState(selectedYear);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [tipo, setTipo] = useState('variable'); // 'fijo' o 'variable'
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sugerencias rápidas de conceptos comunes
  const sugerencias = [
    { text: 'Recolección de basura', tipo: 'fijo', monto: '300' },
    { text: 'Lavado de contenedores de basura', tipo: 'fijo', monto: '300' },
    { text: 'Poda completa de jardín', tipo: 'variable', monto: '1000' },
    { text: 'Cambio de foco', tipo: 'variable', monto: '50' },
    { text: 'Compra de jabón y cloro', tipo: 'variable', monto: '58' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const montoNum = Number(monto);
    if (!concepto.trim()) {
      setErrorMsg('Debes especificar un concepto.');
      return;
    }
    if (isNaN(montoNum) || montoNum <= 0) {
      setErrorMsg('Ingresa un monto de gasto válido mayor a 0.');
      return;
    }

    const payload = {
      mes: mes,
      anio: Number(anio),
      concepto: concepto.trim(),
      monto: montoNum,
      tipo: tipo,
      fuente: 'App Web',
    };

    try {
      setSaving(true);
      await handleRegistrarEgreso(payload);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al registrar el gasto en Google Sheets.');
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
            <h3 className="text-lg font-bold text-slate-900">Registrar Nuevo Gasto</h3>
            <p className="text-xs text-slate-500">Agrega un egreso fijo o extraordinario del edificio</p>
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
          
          {/* Período */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mes del Gasto
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {MONTH_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Año
              </label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Sugerencias Rápidas */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-1">
              Sugerencias comunes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sugerencias.map((sug, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setConcepto(sug.text);
                    setTipo(sug.tipo);
                    if (sug.monto) setMonto(sug.monto);
                  }}
                  className="px-2 py-1 rounded-md text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  {sug.text}
                </button>
              ))}
            </div>
          </div>

          {/* Concepto del Gasto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Concepto / Detalle del Gasto
            </label>
            <input
              type="text"
              placeholder="Ej. Cambio de foco de pasillo piso 2"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Monto y Tipo */}
          <div className="grid grid-cols-2 gap-3">
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Gasto
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="fijo">Fijo (Servicio recurrente)</option>
                <option value="variable">Variable / Extraordinario</option>
              </select>
            </div>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando en Sheet...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Guardar Gasto
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
