import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMonthName, formatCurrency } from '../utils/formatters';
import { X, Check, Loader2, DollarSign, HelpCircle } from 'lucide-react';

export default function ModalAportarProyecto() {
  const { 
    data, 
    allProjects, 
    modalState, 
    closeModal, 
    handleAportarProyecto, 
    selectedMonth, 
    selectedYear 
  } = useApp();

  const defaultProject = modalState.props?.proyecto || allProjects[0]?.nombre || 'Cambio de tanque de gas';
  const defaultDepto = modalState.props?.depto || '1';

  const [proyecto, setProyecto] = useState(defaultProject);
  const [depto, setDepto] = useState(defaultDepto);
  const [monto, setMonto] = useState('');
  const [modo, setModo] = useState('independiente'); // 'independiente' o 'mantenimiento'
  const [concepto, setConcepto] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mesActual = getMonthName(selectedMonth);

  const vecinoInfo = data.vecinos.find(
    v => String(v.depto).trim() === String(depto).trim()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0.');
      return;
    }

    try {
      setSaving(true);
      await handleAportarProyecto({
        proyecto,
        depto,
        monto: montoNum,
        modo,
        concepto: concepto.trim(),
      });
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al registrar la aportación en Google Sheets.');
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
            <h3 className="text-base font-bold text-slate-900">Abonar a Proyecto Especial</h3>
            <p className="text-xs text-slate-500">Registra un aporte de vecino para obras o mejoras</p>
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          
          {/* Selector de Proyecto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Proyecto Destino
            </label>
            <select
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {allProjects.map((p) => (
                <option key={p.nombre} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Departamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Departamento Aportante
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
            {vecinoInfo?.nombre && (
              <div className="mt-1 text-[11px] text-slate-500">
                Residente: <span className="font-semibold text-slate-800">{vecinoInfo.nombre}</span>
              </div>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monto del Abono ($)
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* BOTONES DE OPCIÓN: ¿Independiente o Vinculado a Mantenimiento? */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>¿Cómo se acredita este abono?</span>
              <span className="text-[10px] text-slate-400 font-normal">Decisión por abono</span>
            </label>
            
            <div className="space-y-2">
              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                modo === 'independiente'
                  ? 'bg-orange-50 border-orange-300 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="modo_abono"
                  value="independiente"
                  checked={modo === 'independiente'}
                  onChange={() => setModo('independiente')}
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="text-xs font-bold block">
                    Aportación Extraordinaria Independiente
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    No afecta su cuota de mantenimiento mensual. Es dinero extra exclusivo para el proyecto.
                  </span>
                </div>
              </label>

              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                modo === 'mantenimiento'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="modo_abono"
                  value="mantenimiento"
                  checked={modo === 'mantenimiento'}
                  onChange={() => setModo('mantenimiento')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold block">
                    Financiado con Cuota de Mantenimiento ({mesActual})
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    Se acredita como pago de mantenimiento del mes en curso y se suma a la recaudación del proyecto.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Concepto opcional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota o Concepto Adicional (opcional)
            </label>
            <input
              type="text"
              placeholder={`Ej. Abono 1 de 3 para ${proyecto}`}
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  Guardar Aporte
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
