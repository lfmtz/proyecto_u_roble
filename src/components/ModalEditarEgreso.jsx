import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, getMonthName } from '../utils/formatters';
import { X, Check, Trash2, Loader2, AlertCircle } from 'lucide-react';

export default function ModalEditarEgreso() {
  const { modalState, closeModal, handleEditarEgreso, handleEliminarEgreso } = useApp();
  const egreso = modalState.props?.egreso || {};

  const [mes, setMes] = useState(egreso.mes || '');
  const [anio, setAnio] = useState(egreso.anio || 2026);
  const [concepto, setConcepto] = useState(egreso.concepto || '');
  const [monto, setMonto] = useState(egreso.monto || '');
  const [tipo, setTipo] = useState(egreso.tipo || 'variable');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      _row: egreso._row,
      oldConcepto: egreso.concepto,
      mes: mes,
      anio: Number(anio),
      concepto: concepto.trim(),
      monto: montoNum,
      tipo: tipo,
      fuente: egreso.fuente || 'App Web',
    };

    try {
      setSaving(true);
      await handleEditarEgreso(payload);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al actualizar el gasto en Google Sheets.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await handleEliminarEgreso(egreso);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al eliminar el gasto en Google Sheets.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Editar o Eliminar Gasto</h3>
            <p className="text-xs text-slate-500">Modifica los detalles o retira este registro del balance</p>
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
          
          {/* Clasificación */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Gasto
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo('fijo')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                  tipo === 'fijo'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Gasto Fijo (Recurrente)
              </button>

              <button
                type="button"
                onClick={() => setTipo('variable')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                  tipo === 'variable'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Extraordinario / Imprevisto
              </button>
            </div>
          </div>

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

          {/* Concepto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Concepto del Gasto
            </label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monto Pagado ($)
            </label>
            <input
              type="number"
              step="any"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Zona de Peligro / Eliminar */}
          {confirmDelete ? (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                ¿Seguro que deseas eliminar este gasto por completo?
              </div>
              <p className="text-[11px] text-rose-600">
                Esta acción borrará la fila del Google Sheet y recalculará el saldo del mes.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar gasto'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 bg-white border border-rose-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : null}

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {!confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving || deleting}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Actualizar Gasto
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
