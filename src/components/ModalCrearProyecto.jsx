import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, FolderPlus, Sparkles } from 'lucide-react';

export default function ModalCrearProyecto() {
  const { closeModal, handleCrearProyecto } = useApp();

  const [nombre, setNombre] = useState('');
  const [meta, setMeta] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [setActive, setSetActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const sugerencias = [
    { nombre: 'Impermeabilización de azotea', meta: '45000', desc: 'Trabajo preventivo y correctivo para temporada de lluvias' },
    { nombre: 'Mantenimiento de cisterna y tinacos', meta: '12000', desc: 'Lavado, desinfección y sustitución de flotadores' },
    { nombre: 'Automatización de portón eléctrico', meta: '22000', desc: 'Motor nuevo y controles remotos para los 20 departamentos' },
    { nombre: 'Pintura de fachada y pasillos', meta: '35000', desc: 'Pintura vinílica y esmalte para herrería' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMsg('Ingresa un nombre para el proyecto.');
      return;
    }

    handleCrearProyecto({
      nombre: nombre.trim(),
      meta: Number(meta) || 0,
      descripcion: descripcion.trim(),
      setActive,
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <FolderPlus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dar de Alta Nuevo Proyecto</h3>
              <p className="text-xs text-slate-500">Crea un fondo especial para obras o mejoras del edificio</p>
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

        {/* Sugerencias Rápidas */}
        <div className="mt-3">
          <span className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Ideas comunes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sugerencias.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNombre(s.nombre);
                  setMeta(s.meta);
                  setDescripcion(s.desc);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium transition-colors"
              >
                {s.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              placeholder="Ej. Impermeabilización de azotea"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meta Estimada o Cotización ($)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción u Objetivo
            </label>
            <textarea
              rows={2}
              placeholder="Breve explicación para los vecinos..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Checkbox para mostrar en estado de cuenta */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
              <input
                type="checkbox"
                checked={setActive}
                onChange={(e) => setSetActive(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-950 block">
                  Mostrar este proyecto en el Estado de Cuenta del mes
                </span>
                <span className="text-emerald-800 text-[11px]">
                  Aparecerá en el cuadro destacado de la hoja del pizarrón para que los vecinos vean su avance.
                </span>
              </div>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Crear Proyecto
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
