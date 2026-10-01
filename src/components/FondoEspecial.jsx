import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { Flame, PlusCircle, ArrowDownRight, ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FondoEspecial() {
  const { fondoMetrics, openModal } = useApp();

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Encabezado del Proyecto Especial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-orange-100 text-orange-700">
              <Flame className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Proyecto Especial: Cambio de Tanque de Gas</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fondo extraordinario para reemplazo de tanque e infraestructura hidroneumática
          </p>
        </div>

        <button
          onClick={() => openModal('fondo')}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Aportación o Gasto
        </button>
      </div>

      {/* Tarjetas de Métricas del Fondo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Recaudado</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-2">
            {formatCurrency(fondoMetrics.totalAportado)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {fondoMetrics.aportaciones.length} fuentes / aportaciones
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Ejercido / Gastos</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers mt-2">
            {formatCurrency(fondoMetrics.totalGastado)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {fondoMetrics.gastos.length} gastos aplicados
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-200 bg-gradient-to-br from-white to-orange-50/50 shadow-xs">
          <div className="flex items-center justify-between text-orange-800 text-xs font-semibold">
            <span>Saldo Remanente</span>
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-950 font-mono-numbers mt-2">
            {formatCurrency(fondoMetrics.saldoDisponible)}
          </div>
          <div className="text-xs text-orange-700/80 mt-1">
            Disponible para imprevistos
          </div>
        </div>

      </div>

      {/* Barra Visual de Ejercicio del Fondo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
          <span className="text-slate-800">Porcentaje Ejercido del Fondo</span>
          <span className="text-slate-900 font-bold">{fondoMetrics.porcentajeUso}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
          <div
            className="bg-orange-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${fondoMetrics.porcentajeUso}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Gastado: {formatCurrency(fondoMetrics.totalGastado)}</span>
          <span>Recaudado: {formatCurrency(fondoMetrics.totalAportado)}</span>
        </div>
      </div>

      {/* Tablas Detalladas: Aportaciones y Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Aportaciones */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-emerald-50/40">
            <h3 className="font-bold text-sm text-emerald-950">Aportaciones e Ingresos del Proyecto</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {fondoMetrics.aportaciones.map((ap, idx) => (
              <div key={idx} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{ap.concepto}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{ap.proyecto}</div>
                </div>
                <div className="font-bold text-emerald-700 font-mono-numbers text-sm whitespace-nowrap">
                  {formatCurrency(ap.monto)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gastos Realizados */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-rose-50/40">
            <h3 className="font-bold text-sm text-rose-950">Gastos Realizados con el Fondo</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto">
            {fondoMetrics.gastos.map((gasto, idx) => (
              <div key={idx} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 leading-snug">{gasto.concepto}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{gasto.proyecto}</div>
                </div>
                <div className="font-bold text-slate-900 font-mono-numbers text-sm whitespace-nowrap">
                  {formatCurrency(gasto.monto)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
