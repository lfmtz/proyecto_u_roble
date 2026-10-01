import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName, getStatusBadge } from '../utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Users, 
  PlusCircle, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Flame,
  ArrowUpRight
} from 'lucide-react';

export default function Dashboard() {
  const { 
    selectedYear, 
    selectedMonth, 
    monthlyMovimientos, 
    monthlyEgresos, 
    metrics, 
    fondoMetrics, 
    activeProjectStats,
    openModal, 
    setActiveTab 
  } = useApp();

  const mesActual = getMonthName(selectedMonth);

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      
      {/* Banner de Bienvenida y Período Activo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-5 text-white shadow-sm">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/60 border border-emerald-500/30 text-emerald-100 mb-2">
            Período Activo
          </span>
          <h2 className="text-2xl font-black tracking-tight">{mesActual} {selectedYear}</h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
            Corte de caja y estado financiero del condominio
          </p>
        </div>

        {/* Acciones Rápidas Móviles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <button
            onClick={() => openModal('pago')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Abonar Cuota
          </button>

          <button
            onClick={() => openModal('egreso')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 border border-white/15"
          >
            <TrendingDown className="w-4 h-4" />
            Registrar Gasto
          </button>

          <button
            onClick={() => setActiveTab('imprimir')}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-sm"
            title="Ver formato imprimible para el pizarrón"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Pizarrón</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. Ingresos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ingresos Cobrados</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
              {formatCurrency(metrics.totalIngresos)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] sm:text-xs text-emerald-700 font-medium">
              <span>{metrics.pagados} de {metrics.totalDeptos} deptos al 100%</span>
            </div>
          </div>
        </div>

        {/* 2. Egresos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Egresos del Mes</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
              {formatCurrency(metrics.totalEgresos)}
            </div>
            <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium">
              {monthlyEgresos.length} concepto{monthlyEgresos.length !== 1 ? 's' : ''} registrado{monthlyEgresos.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* 3. Saldo Neto del Mes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Saldo del Mes</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              metrics.saldoMes >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-xl sm:text-2xl font-black font-mono-numbers ${
              metrics.saldoMes >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {formatCurrency(metrics.saldoMes)}
            </div>
            <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium">
              {metrics.saldoMes >= 0 ? 'Superávit mensual' : 'Déficit mensual'}
            </div>
          </div>
        </div>

        {/* 4. Fondo de Proyecto Activo */}
        <div 
          onClick={() => setActiveTab('proyectos')}
          className="bg-white p-4 rounded-xl border border-orange-100 hover:border-orange-300 shadow-xs flex flex-col justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span className="flex items-center gap-1 text-orange-700 font-semibold truncate pr-1">
              <Flame className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{activeProjectStats ? activeProjectStats.nombre : 'Proyectos del Edificio'}</span>
            </span>
            <ArrowUpRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600 transition-colors flex-shrink-0" />
          </div>
          <div className="mt-3">
            {activeProjectStats ? (
              <>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono-numbers">
                  {formatCurrency(activeProjectStats.saldoDisponible)}
                </div>
                <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  {activeProjectStats.meta 
                    ? `Meta: ${formatCurrency(activeProjectStats.meta)}` 
                    : `Aportado: ${formatCurrency(activeProjectStats.totalAportado)}`
                  }
                </div>
              </>
            ) : (
              <>
                <div className="text-base sm:text-lg font-bold text-slate-400">
                  Sin proyecto activo
                </div>
                <div className="mt-1 text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  Inactivo en estado de cuenta
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Barra de Progreso de Cobranza */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
          <span className="text-slate-800">Avance de Cobranza del Mes</span>
          <span className="text-emerald-700 font-bold">{metrics.porcCobranza}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${(metrics.pagados / metrics.totalDeptos) * 100}%` }}
            title={`Pagados: ${metrics.pagados}`}
          />
          <div 
            className="bg-amber-400 h-full transition-all duration-500" 
            style={{ width: `${(metrics.parciales / metrics.totalDeptos) * 100}%` }}
            title={`Parciales: ${metrics.parciales}`}
          />
          <div 
            className="bg-rose-400 h-full transition-all duration-500" 
            style={{ width: `${(metrics.pendientes / metrics.totalDeptos) * 100}%` }}
            title={`Pendientes: ${metrics.pendientes}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 mt-2.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            {metrics.pagados} Pagados
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            {metrics.parciales} Parciales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            {metrics.pendientes} Pendientes
          </span>
        </div>
      </div>

      {/* Grid de 2 Columnas: Estado de Departamentos y Egresos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna 1 y 2: Lista de Departamentos (20 Deptos) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Estado por Departamento</h3>
              <p className="text-xs text-slate-500">Haz clic en cualquier departamento para ver historial o registrar abono</p>
            </div>
            <button
              onClick={() => setActiveTab('vecinos')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Directorio <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {monthlyMovimientos.map((item) => {
              const badge = getStatusBadge(item.estado);
              return (
                <div
                  key={item.depto}
                  onClick={() => openModal('depto_historial', { depto: item.depto })}
                  className="p-3 sm:p-4 hover:bg-slate-50/80 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm font-mono-numbers">
                      {item.depto}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {item.nombre || `Departamento ${item.depto}`}
                      </div>
                      <div className="text-xs text-slate-500 font-mono-numbers">
                        Cuota: {formatCurrency(item.cuota)} • Pagado: {formatCurrency(item.monto_pagado)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna 3: Egresos del Mes */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Egresos del Mes</h3>
                <p className="text-xs text-slate-500">{mesActual} {selectedYear}</p>
              </div>
              <button
                onClick={() => openModal('egreso')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Registrar nuevo gasto"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {monthlyEgresos.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No hay gastos registrados en {mesActual} {selectedYear}
                </div>
              ) : (
                monthlyEgresos.map((egreso, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-slate-800">
                        {egreso.concepto}
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                        egreso.tipo === 'fijo' 
                          ? 'bg-slate-100 text-slate-600' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {egreso.tipo === 'fijo' ? 'Fijo' : 'Variable'}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono-numbers whitespace-nowrap">
                      {formatCurrency(egreso.monto)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Total Gastos:</span>
            <span className="font-mono-numbers text-sm">{formatCurrency(metrics.totalEgresos)}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
