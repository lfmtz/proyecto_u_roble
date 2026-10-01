import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { TrendingDown, PlusCircle, Filter } from 'lucide-react';

export default function EgresosList() {
  const { monthlyEgresos, metrics, selectedMonth, selectedYear, openModal } = useApp();
  const [filterTipo, setFilterTipo] = useState('todos'); // 'todos', 'fijo', 'variable'

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

  return (
    <div className="space-y-5 pb-24 sm:pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Control de Egresos y Gastos</h2>
          <p className="text-xs text-slate-500">
            {getMonthName(selectedMonth)} {selectedYear} • {monthlyEgresos.length} gastos registrados
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

      {/* Resumen de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs text-slate-500 font-medium">Total Gastos del Mes</div>
          <div className="text-xl font-black text-slate-900 font-mono-numbers mt-1">
            {formatCurrency(metrics.totalEgresos)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs text-slate-500 font-medium">Gastos Fijos (Basura, Limpieza)</div>
          <div className="text-xl font-black text-slate-700 font-mono-numbers mt-1">
            {formatCurrency(fijosTotal)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <div className="text-xs text-slate-500 font-medium">Gastos Variables / Extraordinarios</div>
          <div className="text-xl font-black text-amber-700 font-mono-numbers mt-1">
            {formatCurrency(variablesTotal)}
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
            {tipo}
          </button>
        ))}
      </div>

      {/* Tabla de Egresos */}
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
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {egreso.tipo}
                    </span>
                    <span>• {egreso.mes} {egreso.anio}</span>
                    {egreso.fuente && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        ({egreso.fuente})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-base font-black text-slate-900 font-mono-numbers whitespace-nowrap">
                  {formatCurrency(egreso.monto)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
