import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { Printer, ArrowLeft, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';

export default function MonthlyStatementPrint() {
  const { 
    selectedYear, 
    selectedMonth, 
    monthlyMovimientos, 
    monthlyEgresos, 
    metrics, 
    activeProjectStats,
    handleSincronizarResumenSheet,
    setActiveTab 
  } = useApp();

  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const mesNombre = getMonthName(selectedMonth);
  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSyncToSheet = async () => {
    try {
      setSyncing(true);
      setSyncSuccess(false);
      await handleSincronizarResumenSheet();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.error('Error al sincronizar resumen:', err);
      alert('Para guardar la pestaña resumen_entrega en Google Sheets, asegúrate de haber actualizado el código de Code.gs en Extensiones > Apps Script.');
    } finally {
      setSyncing(false);
    }
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
            <p className="text-xs text-slate-500">Diseñado para imprimir en el pizarrón o respaldar en Google Sheets para entrega de administración</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncToSheet}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
            title="Guarda este corte mensual en una pestaña 'resumen_entrega' dentro de tu Google Sheet"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                Guardando en Sheet...
              </>
            ) : syncSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡Reflejado en Sheets!
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Reflejar Resumen en Sheets
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Contenedor Hoja Tamaño Carta (816 x 1056 px) */}
      <div className="flex justify-center">
        <div 
          className="print-page bg-white w-full max-w-[816px] min-h-[1056px] p-7 sm:p-9 shadow-lg sm:border sm:border-slate-300 rounded-sm text-slate-900 text-xs flex flex-col justify-between"
          style={{ boxSizing: 'border-box' }}
        >
          
          <div>
            {/* Encabezado Formal */}
            <div className="border-b-2 border-slate-900 pb-3 mb-3">
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
                  <div className="inline-block px-3 py-0.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded">
                    Estado de Cuenta
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 uppercase">
                    {mesNombre} {selectedYear}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Emisión: {fechaHoy}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Ejecutivo Superior */}
            <div className="grid grid-cols-4 gap-2 mb-3 bg-slate-50 border border-slate-200 p-2 rounded">
              <div className="text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Ingresos</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono-numbers">
                  {formatCurrency(metrics.totalIngresos)}
                </span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Egresos</span>
                <span className="text-sm font-extrabold text-rose-700 font-mono-numbers">
                  {formatCurrency(metrics.totalEgresos)}
                </span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Saldo del Mes</span>
                <span className={`text-sm font-extrabold font-mono-numbers ${metrics.saldoMes >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                  {formatCurrency(metrics.saldoMes)}
                </span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Cobranza</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono-numbers">
                  {metrics.pagados} / {metrics.totalDeptos} ({metrics.porcCobranza}%)
                </span>
              </div>
            </div>

            {/* Tablas lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              
              {/* Tabla de 20 Departamentos (7 columnas) - Sin columna Previo/Estatus que cause molestia */}
              <div className="md:col-span-7">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-800">
                    Desglose de Cuotas por Departamento
                  </h3>
                  <span className="text-[9px] text-slate-500 font-medium">Cuota Mensual: $150.00</span>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[9px]">
                      <th className="border border-slate-300 px-1 py-1 text-center font-bold w-10">Depto</th>
                      <th className="border border-slate-300 px-1.5 py-1 text-left font-bold">Residente</th>
                      <th className="border border-slate-300 px-1.5 py-1 text-right font-bold w-20">Abono</th>
                      <th className="border border-slate-300 px-1.5 py-1 text-center font-bold w-28">Situación del Mes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyMovimientos.map((d) => {
                      const pagadoMes = d.ingreso_efectivo_mes !== undefined ? d.ingreso_efectivo_mes : d.monto_pagado;
                      const restanMes = Math.max(0, (d.cuota || 150) - (d.monto_pagado || 0));

                      return (
                        <tr key={d.depto} className="hover:bg-slate-50">
                          <td className="border border-slate-300 px-1 py-0.5 text-center font-bold font-mono-numbers text-[10px]">
                            {d.depto}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-0.5 truncate max-w-[140px] text-[10px]">
                            {d.nombre || '-'}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-0.5 text-right font-mono-numbers font-semibold text-[10px]">
                            {d.es_cubierto_anual ? (
                              <span className="text-slate-400 font-normal text-[9px]">—</span>
                            ) : (
                              formatCurrency(pagadoMes)
                            )}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-0.5 text-center text-[9px] font-semibold">
                            {d.es_anual ? (
                              <span className="text-teal-800 font-bold">Pago Anual</span>
                            ) : d.estado === 'pagado' ? (
                              <span className="text-emerald-700 font-bold">Cubierto</span>
                            ) : d.estado === 'parcial' ? (
                              <span className="text-amber-700 font-bold">
                                Abono Parcial (Restan {formatCurrency(restanMes)})
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">Por cubrir</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-[10px]">
                      <td colSpan={2} className="border border-slate-300 px-2 py-1 text-right">
                        Total Ingresos del Mes:
                      </td>
                      <td className="border border-slate-300 px-1.5 py-1 text-right font-mono-numbers text-emerald-800">
                        {formatCurrency(metrics.totalIngresos)}
                      </td>
                      <td className="border border-slate-300 px-1.5 py-1"></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Nota informativa discreta de pagos anuales */}
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[8.5px] text-slate-600">
                  <strong>Nota sobre Pago Anual:</strong> Los departamentos con modalidad de <strong>Pago Anual</strong> se encuentran cubiertos durante todo el año; su aportación se contabilizó íntegramente en el mes en que realizaron su pago anual, por lo que no se duplica en la suma de ingresos en efectivo de este mes.
                </div>
              </div>

              {/* Columna Derecha: Gastos y Fondo Especial */}
              <div className="md:col-span-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-800 mb-1">
                    Gastos Realizados en el Mes
                  </h3>

                  <table className="w-full border-collapse border border-slate-300 text-[10px] mb-3">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[9px]">
                        <th className="border border-slate-300 px-1.5 py-1 text-left font-bold">Concepto</th>
                        <th className="border border-slate-300 px-1 py-1 text-center font-bold w-12">Tipo</th>
                        <th className="border border-slate-300 px-1.5 py-1 text-right font-bold w-16">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyEgresos.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="border border-slate-300 px-2 py-3 text-center text-slate-400 italic text-[9px]">
                            Sin gastos registrados en el mes
                          </td>
                        </tr>
                      ) : (
                        monthlyEgresos.map((e, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 px-1.5 py-0.5 leading-tight text-[9px]">
                              {e.concepto}
                            </td>
                            <td className="border border-slate-300 px-1 py-0.5 text-center capitalize text-slate-500 text-[8.5px]">
                              {e.tipo}
                            </td>
                            <td className="border border-slate-300 px-1.5 py-0.5 text-right font-mono-numbers font-semibold text-[9.5px]">
                              {formatCurrency(e.monto)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-[9.5px]">
                        <td colSpan={2} className="border border-slate-300 px-1.5 py-0.5 text-right">
                          Total Gastos:
                        </td>
                        <td className="border border-slate-300 px-1.5 py-0.5 text-right font-mono-numbers">
                          {formatCurrency(metrics.totalEgresos)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Estado del Proyecto Activo Seleccionado (solo si está activo) */}
                  {activeProjectStats && (
                    <div className="bg-orange-50/70 border border-orange-200 p-2 rounded text-[9px] mb-3">
                      <div className="font-bold text-orange-950 uppercase mb-0.5 flex justify-between items-center">
                        <span className="truncate pr-2">Proyecto: {activeProjectStats.nombre}</span>
                        {activeProjectStats.meta > 0 && (
                          <span className="text-orange-700 font-semibold text-[8px] whitespace-nowrap">
                            Meta: {formatCurrency(activeProjectStats.meta)}
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5 text-slate-700">
                        <div className="flex justify-between">
                          <span>Total Aportado:</span>
                          <span className="font-mono-numbers font-semibold">{formatCurrency(activeProjectStats.totalAportado)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Gastado / Ejercido:</span>
                          <span className="font-mono-numbers font-semibold">{formatCurrency(activeProjectStats.totalGastado)}</span>
                        </div>
                        <div className="flex justify-between border-t border-orange-200 pt-0.5 font-bold text-orange-900">
                          <span>Saldo en Fondo:</span>
                          <span className="font-mono-numbers">{formatCurrency(activeProjectStats.saldoDisponible)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nota Institucional */}
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[8.5px] text-slate-600 leading-tight">
                  <p className="font-bold text-slate-700 uppercase mb-0.5">Nota de la Administración:</p>
                  Agradecemos a todos los vecinos su puntualidad. El pago puntual de los servicios de recolección de basura, limpieza y bombeo de agua depende del cumplimiento de las cuotas de los 20 departamentos. En caso de dudas con sus aportaciones, favor de comunicarse con la administración.
                </div>
              </div>

            </div>
          </div>

          {/* Firmas al pie de la página */}
          <div className="pt-4 mt-4 border-t border-slate-300">
            <div className="grid grid-cols-2 gap-8 text-center text-[9.5px]">
              <div>
                <div className="h-9 border-b border-slate-400 mx-auto w-40"></div>
                <div className="font-bold text-slate-900 mt-1">Administración Roble 30</div>
                <div className="text-slate-500 text-[8.5px]">Representante del Condominio</div>
              </div>
              <div>
                <div className="h-9 border-b border-slate-400 mx-auto w-40"></div>
                <div className="font-bold text-slate-900 mt-1">Comité de Vigilancia</div>
                <div className="text-slate-500 text-[8.5px]">Revisión y Conformidad</div>
              </div>
            </div>
            <div className="text-center text-[7.5px] text-slate-400 mt-3">
              Documento informativo oficial para transparencia comunitaria de Roble 30 A 2.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
