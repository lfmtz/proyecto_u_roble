import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName, getStatusBadge } from '../utils/formatters';
import { Printer, ArrowLeft, Download, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MonthlyStatementPrint() {
  const { 
    selectedYear, 
    selectedMonth, 
    monthlyMovimientos, 
    monthlyEgresos, 
    metrics, 
    fondoMetrics,
    setActiveTab 
  } = useApp();

  const mesNombre = getMonthName(selectedMonth);
  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Barra de Controles Superior (Oculta al imprimir) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Regresar
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Vista Imprimible Oficial (Tamaño Carta)</h2>
            <p className="text-xs text-slate-500">Diseñado para imprimir y colocar en el pizarrón de avisos</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar como PDF
        </button>
      </div>

      {/* Contenedor Hoja Tamaño Carta (816 x 1056 px) */}
      <div className="flex justify-center">
        <div 
          className="print-page bg-white w-full max-w-[816px] min-h-[1056px] p-8 sm:p-10 shadow-lg sm:border sm:border-slate-300 rounded-sm text-slate-900 text-xs flex flex-col justify-between"
          style={{ boxSizing: 'border-box' }}
        >
          
          <div>
            {/* Encabezado Formal */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight uppercase text-slate-900">
                    Edificio Roble 30 A 2
                  </h1>
                  <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                    Comité de Administración y Mantenimiento
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    Estado de Cuenta
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1 uppercase">
                    {mesNombre} {selectedYear}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Emisión: {fechaHoy}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Ejecutivo Superior */}
            <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-50 border border-slate-200 p-2.5 rounded">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Ingresos</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono-numbers">
                  {formatCurrency(metrics.totalIngresos)}
                </span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Egresos</span>
                <span className="text-sm font-extrabold text-rose-700 font-mono-numbers">
                  {formatCurrency(metrics.totalEgresos)}
                </span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Saldo del Mes</span>
                <span className={`text-sm font-extrabold font-mono-numbers ${metrics.saldoMes >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                  {formatCurrency(metrics.saldoMes)}
                </span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cobranza</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono-numbers">
                  {metrics.pagados} / {metrics.totalDeptos} ({metrics.porcCobranza}%)
                </span>
              </div>
            </div>

            {/* Tablas lado a lado o apiladas */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Tabla de 20 Departamentos (7 columnas) */}
              <div className="md:col-span-7">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Desglose de Cuotas por Depto</span>
                  <span className="text-[10px] text-slate-500 font-normal">Cuota estándar: $150.00</span>
                </h3>

                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border border-slate-300 px-1.5 py-1 text-center font-bold w-10">Depto</th>
                      <th className="border border-slate-300 px-1.5 py-1 text-left font-bold">Residente</th>
                      <th className="border border-slate-300 px-1.5 py-1 text-right font-bold w-14">Abono</th>
                      <th className="border border-slate-300 px-1.5 py-1 text-center font-bold w-16">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyMovimientos.map((d) => (
                      <tr key={d.depto} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-1.5 py-0.5 text-center font-bold font-mono-numbers">
                          {d.depto}
                        </td>
                        <td className="border border-slate-300 px-1.5 py-0.5 truncate max-w-[120px]">
                          {d.nombre || '-'}
                        </td>
                        <td className="border border-slate-300 px-1.5 py-0.5 text-right font-mono-numbers font-semibold">
                          {formatCurrency(d.monto_pagado)}
                        </td>
                        <td className="border border-slate-300 px-1.5 py-0.5 text-center font-semibold">
                          <span className={`inline-block px-1 rounded text-[9px] uppercase ${
                            d.estado === 'pagado' ? 'text-emerald-700 font-bold' :
                            d.estado === 'parcial' ? 'text-amber-700 font-bold' :
                            'text-rose-700 font-bold'
                          }`}>
                            {d.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabla de Egresos y Fondo Especial (5 columnas) */}
              <div className="md:col-span-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 mb-1.5">
                    Gastos Realizados en el Mes
                  </h3>

                  <table className="w-full border-collapse border border-slate-300 text-[10px] mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-300 px-1.5 py-1 text-left font-bold">Concepto</th>
                        <th className="border border-slate-300 px-1.5 py-1 text-center font-bold w-12">Tipo</th>
                        <th className="border border-slate-300 px-1.5 py-1 text-right font-bold w-16">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyEgresos.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="border border-slate-300 px-2 py-3 text-center text-slate-400 italic">
                            Sin gastos registrados en el mes
                          </td>
                        </tr>
                      ) : (
                        monthlyEgresos.map((e, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 px-1.5 py-0.5 leading-tight">
                              {e.concepto}
                            </td>
                            <td className="border border-slate-300 px-1.5 py-0.5 text-center capitalize text-slate-500 text-[9px]">
                              {e.tipo}
                            </td>
                            <td className="border border-slate-300 px-1.5 py-0.5 text-right font-mono-numbers font-semibold">
                              {formatCurrency(e.monto)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={2} className="border border-slate-300 px-1.5 py-1 text-right">
                          Total Gastos:
                        </td>
                        <td className="border border-slate-300 px-1.5 py-1 text-right font-mono-numbers">
                          {formatCurrency(metrics.totalEgresos)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Estado del Fondo Especial de Gas */}
                  <div className="bg-orange-50/60 border border-orange-200 p-2.5 rounded text-[10px]">
                    <div className="font-bold text-orange-950 uppercase mb-1">
                      Fondo Especial: Tanque de Gas
                    </div>
                    <div className="space-y-0.5 text-slate-700">
                      <div className="flex justify-between">
                        <span>Total Aportado:</span>
                        <span className="font-mono-numbers font-semibold">{formatCurrency(fondoMetrics.totalAportado)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Ejercido / Gastos:</span>
                        <span className="font-mono-numbers font-semibold">{formatCurrency(fondoMetrics.totalGastado)}</span>
                      </div>
                      <div className="flex justify-between border-t border-orange-200 pt-1 font-bold text-orange-900">
                        <span>Saldo Disponible en Fondo:</span>
                        <span className="font-mono-numbers">{formatCurrency(fondoMetrics.saldoDisponible)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas adicionales */}
                <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded text-[9px] text-slate-600 leading-tight">
                  <p className="font-bold text-slate-700 uppercase mb-0.5">Aviso Importante:</p>
                  Agradecemos a todos los vecinos puntuales en sus aportaciones. El mantenimiento de áreas comunes, contenedores de basura y servicios depende de la cuota mensual de cada departamento.
                </div>
              </div>

            </div>
          </div>

          {/* Firmas al pie de la página */}
          <div className="pt-6 mt-6 border-t border-slate-300">
            <div className="grid grid-cols-2 gap-8 text-center text-[10px]">
              <div>
                <div className="h-10 border-b border-slate-400 mx-auto w-44"></div>
                <div className="font-bold text-slate-900 mt-1">Administración Roble 30</div>
                <div className="text-slate-500 text-[9px]">Representante del Condominio</div>
              </div>
              <div>
                <div className="h-10 border-b border-slate-400 mx-auto w-44"></div>
                <div className="font-bold text-slate-900 mt-1">Comité de Vigilancia</div>
                <div className="text-slate-500 text-[9px]">Revisión y Conformidad</div>
              </div>
            </div>
            <div className="text-center text-[8px] text-slate-400 mt-4">
              Documento emitido para transparencia de la comunidad de propietarios e inquilinos de Roble 30 A 2.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
