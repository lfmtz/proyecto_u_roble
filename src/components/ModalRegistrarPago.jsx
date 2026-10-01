import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, getMonthName } from '../utils/formatters';
import { X, Check, Loader2 } from 'lucide-react';

export default function ModalRegistrarPago() {
  const { data, modalState, closeModal, handleRegistrarPago, selectedMonth, selectedYear } = useApp();
  const defaultDepto = modalState.props?.depto || '1';

  const [depto, setDepto] = useState(defaultDepto);
  const [anio, setAnio] = useState(selectedYear);
  const [mesNum, setMesNum] = useState(selectedMonth);
  const [cuota, setCuota] = useState(150);
  const [montoPagado, setMontoPagado] = useState(150);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Encontrar el nombre del vecino seleccionado
  const vecinoSeleccionado = data.vecinos.find(
    v => String(v.depto).trim() === String(depto).trim()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cuotaNum = Number(cuota);
    const montoNum = Number(montoPagado);

    if (isNaN(montoNum) || montoNum < 0) {
      setErrorMsg('Ingresa un monto válido.');
      return;
    }

    let estado = 'pendiente';
    if (montoNum >= cuotaNum && cuotaNum > 0) {
      estado = 'pagado';
    } else if (montoNum > 0) {
      estado = 'parcial';
    }

    const payload = {
      depto: String(depto),
      anio: Number(anio),
      mes_num: Number(mesNum),
      mes: getMonthName(mesNum),
      cuota: cuotaNum,
      monto_pagado: montoNum,
      estado: estado,
      fuente: 'App Web',
    };

    try {
      setSaving(true);
      await handleRegistrarPago(payload);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al guardar en Google Sheets. Intenta nuevamente.');
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
            <h3 className="text-lg font-bold text-slate-900">Registrar Pago de Cuota</h3>
            <p className="text-xs text-slate-500">Agrega un nuevo abono o pago completo a la base de datos</p>
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
          
          {/* Selector de Departamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Departamento
            </label>
            <select
              value={depto}
              onChange={(e) => setDepto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {data.vecinos.map((v) => (
                <option key={v.depto} value={v.depto}>
                  Depto {v.depto} {v.nombre ? `— ${v.nombre}` : ''}
                </option>
              ))}
            </select>
            {vecinoSeleccionado && vecinoSeleccionado.nombre && (
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Residente: <span className="text-slate-800 font-semibold">{vecinoSeleccionado.nombre}</span>
              </div>
            )}
          </div>

          {/* Período a abonar (Mes y Año) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mes del Pago
              </label>
              <select
                value={mesNum}
                onChange={(e) => setMesNum(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Cuota y Monto Pagado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cuota Regular ($)
              </label>
              <input
                type="number"
                value={cuota}
                onChange={(e) => setCuota(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monto Abonado ($)
              </label>
              <input
                type="number"
                step="any"
                value={montoPagado}
                onChange={(e) => setMontoPagado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Previsualización del Estado */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Estado resultante:</span>
            <span className={`font-bold px-2 py-0.5 rounded uppercase text-[11px] ${
              Number(montoPagado) >= Number(cuota)
                ? 'bg-emerald-100 text-emerald-800'
                : Number(montoPagado) > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {Number(montoPagado) >= Number(cuota) ? 'Pagado' : Number(montoPagado) > 0 ? 'Parcial' : 'Pendiente'}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando en Sheet...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Guardar Pago
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
