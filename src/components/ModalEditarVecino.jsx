import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Loader2, UserCheck } from 'lucide-react';

export default function ModalEditarVecino() {
  const { data, modalState, closeModal, handleActualizarVecino } = useApp();
  const deptoId = modalState.props?.depto || '1';

  // Buscar información actual del vecino
  const currentVecino = data.vecinos.find(
    v => String(v.depto).trim() === String(deptoId).trim()
  ) || {};

  const [nombre, setNombre] = useState(currentVecino.nombre || '');
  const [telefono, setTelefono] = useState(currentVecino.telefono || '');
  const [correo, setCorreo] = useState(currentVecino.correo || '');
  const [nota, setNota] = useState(currentVecino.nota || '');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      depto: String(deptoId),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      nota: nota.trim(),
    };

    try {
      setSaving(true);
      await handleActualizarVecino(payload);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al actualizar en Google Sheets. Revisa tu conexión.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm font-mono-numbers">
              {deptoId}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Editar Datos de Departamento {deptoId}
              </h3>
              <p className="text-xs text-slate-500">Actualiza residente, contacto y notas</p>
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Completo del Residente / Propietario
            </label>
            <input
              type="text"
              placeholder="Ej. Milton Andre Gamba"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="5512345678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota Interna de Administración
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Inquilino actual, dueño vive fuera, etc."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  Actualizando...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
