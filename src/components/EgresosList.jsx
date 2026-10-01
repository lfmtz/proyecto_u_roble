import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { TrendingDown, PlusCircle, Filter, Edit3, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function EgresosList() {
  const { monthlyEgresos, metrics, selectedMonth, selectedYear, openModal, handleEliminarEgreso } = useApp();
  const [filterTipo, setFilterTipo] = useState('todos'); // 'todos', 'fijo', 'variable'
  const [deletingId, setDeletingId] = useState(null);

  const mesNombre = getMonthName(selectedMonth);

  const filteredEgresos = monthlyEgresos.filter(e => {
    if (filterTipo === 'todos') return true;
    return String(e.tipo).toLowerCase().trim() === filterTipo;
  });

  const fijosTotal = monthlyEgresos
    .filter(e => String(e.tipo).toLowerCase().trim() === 'fijo')
    .reduce((s, e) => s + (Number(e.monto) || 0), 0);

  const variablesTotal = monthlyEgresos
    .filter(e => String(e.tipo).toLowerCase().trim() === 'variable')
    .reduce((s, e) => s + (Number(e.monto) || 0), 0);

  const handleDeleteQuick = async (egreso) => {
    if (window.confirm(`¿Estás seguro de eliminar el gasto "${egreso.concepto}" por ${formatCurrency(egreso.monto)}?`)) {
      try {
        setDeletingId(egreso.concepto);
        await handleEliminarEgreso(egreso);
      } catch (err) {
        alert('Error al eliminar el gasto. Intenta nuevamente.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-5 pb-24 sm:pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Control de Egresos y Gastos</h2>
          <p className="text-xs text-slate-500">
            {mesNombre} {selectedYear} • {monthlyEgresos.length} gastos registrados
          </p>
        </div>

        <button
          onClick={() => openModal('egreso')}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Nuevo Gasto
        </button>
      </div>

      {/* Resumen de Categorías con Acceso Rápido a Gastos Fijos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* 1. Total Gastos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs text-slate-500 font-medium">Total Gastos del Mes</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers mt-1">
            {formatCurrency(metrics.totalEgresos)}
          </div>
        </div>

        {/* 2. Gastos Fijos (Basura, Limpieza) - Interactivo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Gastos Fijos (Basura, Limpieza)</span>
              {fijosTotal > 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Aplicados
                </span>
              ) : null}
            </div>
            <div className="text-xl font-black text-slate-700 font-mono-numbers mt-1">
              {formatCurrency(fijosTotal)}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100">
            {fijosTotal === 0 ? (
              <button
                onClick={() => openModal('gastos_fijos_mes')}
                className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Aplicar Fijos de {mesNombre} ($600)
              </button>
            ) : (
              <button
                onClick={() => openModal('gastos_fijos_mes')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                ⚙️ Ajustar o agregar gastos fijos
              </button>
            )}
          </div>
        </div>

        {/* 3. Gastos Variables / Extraordinarios */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs text-slate-500 font-medium">Gastos Variables / Extraordinarios</div>
          <div className="text-xl font-black text-amber-700 font-mono-numbers mt-1">
            {formatCurrency(variablesTotal)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Focos, bombas, jardinería, etc.
          </div>
        </div>

      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        {['todos', 'fijo', 'variable'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFilterTipo(tipo)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filterTipo === tipo
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tipo === 'variable' ? 'Extraordinarios' : tipo}
          </button>
        ))}
      </div>

      {/* Tabla de Egresos con Acciones de Editar y Eliminar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredEgresos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No se encontraron gastos en este período con el filtro seleccionado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEgresos.map((egreso, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50/80 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {egreso.concepto}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      egreso.tipo === 'fijo' 
                        ? 'bg-slate-100 text-slate-600' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                    }`}>
                      {egreso.tipo === 'variable' ? 'Extraordinario' : 'Fijo'}
                    </span>
                    <span>• {egreso.mes} {egreso.anio}</span>
                    {egreso.fuente && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        ({egreso.fuente})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-base font-black text-slate-900 font-mono-numbers whitespace-nowrap">
                    {formatCurrency(egreso.monto)}
                  </div>

                  {/* Botones Editar y Eliminar */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal('editar_egreso', { egreso })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Editar gasto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuick(egreso)}
                      disabled={deletingId === egreso.concepto}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar gasto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
