import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { 
  FolderKanban, 
  PlusCircle, 
  FolderPlus, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  ArrowDownRight, 
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function ProyectosManager() {
  const { 
    data, 
    allProjects, 
    activeProjectName, 
    handleSelectActiveProject, 
    getProjectStats, 
    openModal 
  } = useApp();

  const [selectedProjectName, setSelectedProjectName] = useState(
    activeProjectName || allProjects[0]?.nombre || 'Cambio de tanque de gas'
  );

  const currentStats = getProjectStats(selectedProjectName);
  const esElActivoEnEstadoCuenta = activeProjectName === selectedProjectName;

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-orange-100 text-orange-700">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Proyectos y Fondos Especiales</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administración de obras, compras extraordinarias y aportaciones por departamento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('crear_proyecto')}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
          >
            <FolderPlus className="w-4 h-4 text-emerald-600" />
            Nuevo Proyecto
          </button>

          <button
            onClick={() => openModal('aportar_proyecto', { proyecto: selectedProjectName })}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Abonar a Proyecto
          </button>
        </div>
      </div>

      {/* Selector de Proyectos (Pestañas horizontales) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allProjects.map((p) => {
          const isSelected = p.nombre === selectedProjectName;
          const isActiveOnStatement = p.nombre === activeProjectName;

          return (
            <button
              key={p.nombre}
              onClick={() => setSelectedProjectName(p.nombre)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{p.nombre}</span>
              {isActiveOnStatement && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                  isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Pizarrón
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Control: Checkbox para decidir qué proyecto se muestra en el Estado de Cuenta */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <input
            type="checkbox"
            id="checkbox-active-project"
            checked={esElActivoEnEstadoCuenta}
            onChange={(e) => {
              if (e.target.checked) {
                handleSelectActiveProject(selectedProjectName);
              }
            }}
            className="w-4 h-4 mt-0.5 sm:mt-0 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="checkbox-active-project" className="text-xs cursor-pointer">
            <span className="font-bold text-emerald-950 block">
              Mostrar "{selectedProjectName}" en el Estado de Cuenta Oficial del mes
            </span>
            <span className="text-emerald-800/80 text-[11px] block mt-0.5">
              Al marcar esta casilla, este proyecto será el que aparezca destacado en la hoja impresa para el pizarrón.
            </span>
          </label>
        </div>

        {esElActivoEnEstadoCuenta && (
          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Activo en Estado de Cuenta
          </span>
        )}
      </div>

      {/* Tarjetas de Métricas del Proyecto Seleccionado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Recaudado</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers mt-2">
            {formatCurrency(currentStats.totalAportado)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {currentStats.aportaciones.length} aportaciones registradas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Ejercido / Gastos</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers mt-2">
            {formatCurrency(currentStats.totalGastado)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {currentStats.gastos.length} gastos aplicados a este proyecto
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-orange-200 bg-gradient-to-br from-white to-orange-50/40 shadow-xs">
          <div className="flex items-center justify-between text-orange-900 text-xs font-semibold">
            <span>Saldo Remanente</span>
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-950 font-mono-numbers mt-2">
            {formatCurrency(currentStats.saldoDisponible)}
          </div>
          <div className="text-[11px] text-orange-800/80 mt-1">
            Disponible para continuar el proyecto
          </div>
        </div>

      </div>

      {/* Desglose de los 20 Departamentos: Cuánto ha aportado cada uno a este proyecto */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Aportaciones por Departamento a "{selectedProjectName}"
            </h3>
            <p className="text-xs text-slate-500">
              Control de cuánto ha entregado cada departamento específicamente para este proyecto
            </p>
          </div>

          <button
            onClick={() => openModal('aportar_proyecto', { proyecto: selectedProjectName })}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-xs hover:bg-emerald-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Registrar Abono
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 divide-x divide-y divide-slate-100 text-xs">
          {data.vecinos.map((v) => {
            const deptoId = String(v.depto).trim();
            const totalAportado = currentStats.deptoAportaciones[deptoId] || 0;

            return (
              <div
                key={deptoId}
                onClick={() => openModal('aportar_proyecto', { proyecto: selectedProjectName, depto: deptoId })}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-numbers font-black text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                    {deptoId}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold hover:underline">
                    + Aportar
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 truncate font-medium" title={v.nombre}>
                  {v.nombre || `Depto ${deptoId}`}
                </div>

                <div className="mt-2 font-mono-numbers font-bold text-sm text-slate-900">
                  {formatCurrency(totalAportado)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablas Detalladas: Movimientos de este Proyecto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Aportaciones Recibidas */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-emerald-50/40 flex items-center justify-between">
            <h3 className="font-bold text-sm text-emerald-950">Aportaciones Registradas ({currentStats.aportaciones.length})</h3>
            <button
              onClick={() => openModal('aportar_proyecto', { proyecto: selectedProjectName })}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              + Agregar
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {currentStats.aportaciones.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay aportaciones registradas aún en este proyecto.
              </div>
            ) : (
              currentStats.aportaciones.map((ap, idx) => (
                <div key={idx} className="p-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 leading-snug">{ap.concepto}</div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                      {ap.depto && <span className="font-bold text-slate-600">Depto {ap.depto}</span>}
                      {ap.modo && (
                        <span className={`px-1.5 py-0.2 rounded text-[9.5px] uppercase font-semibold ${
                          ap.modo === 'mantenimiento' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ap.modo}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-bold text-emerald-700 font-mono-numbers text-sm whitespace-nowrap">
                    {formatCurrency(ap.monto)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gastos del Proyecto */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-rose-50/40 flex items-center justify-between">
            <h3 className="font-bold text-sm text-rose-950">Gastos Realizados ({currentStats.gastos.length})</h3>
            <button
              onClick={() => openModal('fondo')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900"
            >
              + Registrar Gasto
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {currentStats.gastos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay gastos registrados para este proyecto.
              </div>
            ) : (
              currentStats.gastos.map((gasto, idx) => (
                <div key={idx} className="p-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 leading-snug">{gasto.concepto}</div>
                  </div>
                  <div className="font-bold text-slate-900 font-mono-numbers text-sm whitespace-nowrap">
                    {formatCurrency(gasto.monto)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
