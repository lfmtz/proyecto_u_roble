import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName, MONTH_NAMES } from '../utils/formatters';
import { Printer, ArrowLeft, FileSpreadsheet, CheckCircle2, Loader2, FileText, Layers, Table2 } from 'lucide-react';

// Base histórica de ingresos netos mes a mes (corte real de la administración)
const HISTORICAL_NET_INCOMES = [
  { key: '2025_12', anio: 2025, mes_num: 12, label: 'diciembre', baseNeto: 7642, nota: '' },
  { key: '2026_1', anio: 2026, mes_num: 1, label: 'enero', baseNeto: 6050, nota: '' },
  { key: '2026_2', anio: 2026, mes_num: 2, label: 'febrero', baseNeto: 1635, nota: '' },
  { key: '2026_3', anio: 2026, mes_num: 3, label: 'marzo', baseNeto: 1650, nota: '' },
  { key: '2026_4', anio: 2026, mes_num: 4, label: 'abril', baseNeto: 1650, nota: '' },
  { key: '2026_5', anio: 2026, mes_num: 5, label: 'mayo', baseNeto: 0, nota: '(el ingreso fue de 2,150 y los gastos 2,163 por eso se reporta en ceros)' },
  { key: '2026_6', anio: 2026, mes_num: 6, label: 'junio', baseNeto: 0, nota: '(el ingreso fue de 3,170 y los gastos 4,384 por eso se reporta en ceros)' },
  { key: '2026_7', anio: 2026, mes_num: 7, label: 'julio', baseNeto: 0, nota: '(el ingreso fue de 2,250 y los gastos de 11,045 por eso se reporta en ceros)' },
  { key: '2026_8', anio: 2026, mes_num: 8, label: 'agosto', baseNeto: 0, nota: '(el ingreso fue de 3,100 y los gastos de 5,850 por eso se reporta en ceros)' },
  { key: '2026_9', anio: 2026, mes_num: 9, label: 'septiembre', baseNeto: 570, nota: '' },
  { key: '2026_10', anio: 2026, mes_num: 10, label: 'octubre', baseNeto: 940, nota: '' },
  { key: '2026_11', anio: 2026, mes_num: 11, label: 'noviembre (hasta el día 09 de noviembre)', baseNeto: 360, nota: '' },
  { key: '2026_12', anio: 2026, mes_num: 12, label: 'diciembre 2026 (hasta el día 09 de noviembre)', baseNeto: 70, nota: '' },
];

const RESUMEN_GASTOS_FONDO_BASE = [
  { concepto: 'Cambio del tanque de gas', monto: 48800 },
  { concepto: 'Se toma para cubrir los gastos de mayo', monto: 13 },
  { concepto: 'Se toma para cubrir los gastos del mes de junio', monto: 1214 },
  {
    concepto:
      'Se toma para cubrir los gastos del mes de julio (ultrasonido del tanque de gas, poda de jardín, compra de insumos para limpieza, instalación de electroflotadores incluido el cable de uso rudo, recolección de basura, limpieza de contenedores de basura)',
    monto: 8795,
  },
  {
    concepto:
      'Se toma para cubrir los gastos del mes de agosto (compra de bomba hidráulica, pago de mano de obra para instalación, recolección de basura, lavado de contenedores)',
    monto: 2750,
  },
];

function formatDeptoCode(depto) {
  const str = String(depto || '').trim();
  if (str.length === 1) return str.padStart(3, '0');
  return str;
}

export default function MonthlyStatementPrint() {
  const { 
    data,
    consolidatedMovimientos,
    selectedYear, 
    selectedMonth, 
    monthlyMovimientos, 
    monthlyEgresos, 
    metrics, 
    activeProjectStats,
    handleSincronizarResumenSheet,
    setActiveTab 
  } = useApp();

  // 'depto' = Hoja 1 (Estado de Cuenta por Depto)
  // 'corte_general' = Hoja 2 (Balance y Corte General estilo pizarrón de la administración)
  // 'ambas' = Las dos hojas listas para imprimir juntas
  const [printMode, setPrintMode] = useState('ambas');
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

  // Cálculo estructurado para la Hoja 2 (Corte General estilo tabla de la administradora)
  const corteData = useMemo(() => {
    // 1. Gastos Fijos y Variables del mes seleccionado
    let gastosFijos = monthlyEgresos.filter(e => String(e.tipo).toLowerCase() === 'fijo');
    let gastosVariables = monthlyEgresos.filter(e => String(e.tipo).toLowerCase() !== 'fijo');

    // Si es Septiembre 2026 y aún no han capturado los 3 gastos en Google Sheets, mostrar los reales del corte
    if (selectedYear === 2026 && selectedMonth === 9 && monthlyEgresos.length === 0) {
      gastosFijos = [
        { concepto: 'Recolección de basura', monto: 300, tipo: 'fijo' },
        { concepto: 'Lavado de contenedores de basura', monto: 300, tipo: 'fijo' },
      ];
      gastosVariables = [
        {
          concepto:
            'Se le entregó un pago adicional a Don Fede por la instalación de la nueva bomba me comentó que tuvo que ir a comprar las nuevas conexiones, desmontar y montar la nueva y que sería otro pago adicional al que ya se le había entregado.',
          monto: 1000,
          tipo: 'variable',
        },
      ];
    }

    const totalGastosMes = [...gastosFijos, ...gastosVariables].reduce(
      (sum, g) => sum + (Number(g.monto) || 0),
      0
    );

    // 2. Clasificación de departamentos del mes seleccionado (excluyendo los cubiertos por pago anual en otro mes)
    const pagadosCompletos = [];
    const abonadosParciales = [];
    const sinPago = [];
    const cubiertosAnual = [];

    monthlyMovimientos.forEach(d => {
      if (d.es_cubierto_anual) {
        cubiertosAnual.push(d);
      } else if (d.estado === 'pagado') {
        pagadosCompletos.push(d);
      } else if (d.estado === 'parcial') {
        abonadosParciales.push(d);
      } else {
        sinPago.push(d);
      }
    });

    // En Septiembre 2026, asegurar que si 303 y 403 se liquidaron según el corte de la administradora,
    // reflejen los 14 departamentos pagados ($2,100) + Dep. 404 ($70) = $2,170 si aún no están editados en Sheet
    const montoPagadosCompletos = pagadosCompletos.reduce((s, d) => s + (Number(d.ingreso_efectivo_mes) || 0), 0);
    const montoParciales = abonadosParciales.reduce((s, d) => s + (Number(d.ingreso_efectivo_mes) || 0), 0);
    const ingresosDelMesActivo = montoPagadosCompletos + montoParciales;

    // 3. Pagos y abonos adelantados de meses posteriores dentro del mismo año (ej. Octubre, Noviembre, Diciembre)
    const mesesPosteriores = [];
    for (let m = selectedMonth + 1; m <= 12; m++) {
      const movsMes = consolidatedMovimientos
        .filter(item => Number(item.anio) === Number(selectedYear) && Number(item.mes_num) === m && !item.es_cubierto_anual)
        .sort((a, b) => (parseInt(a.depto, 10) || 0) - (parseInt(b.depto, 10) || 0));

      const completos = movsMes.filter(item => item.estado === 'pagado' && item.ingreso_efectivo_mes > 0);
      const parciales = movsMes.filter(item => item.estado === 'parcial' && item.ingreso_efectivo_mes > 0);

      if (completos.length > 0 || parciales.length > 0) {
        const sumaCompletos = completos.reduce((s, x) => s + x.ingreso_efectivo_mes, 0);
        const sumaParciales = parciales.reduce((s, x) => s + x.ingreso_efectivo_mes, 0);
        mesesPosteriores.push({
          mes_num: m,
          mesNombre: getMonthName(m).toUpperCase(),
          completos,
          parciales,
          sumaCompletos,
          sumaParciales,
        });
      }
    }

    const totalAdelantos = mesesPosteriores.reduce(
      (s, mp) => s + mp.sumaCompletos + mp.sumaParciales,
      0
    );

    const granTotalIngresosTabla = ingresosDelMesActivo + totalAdelantos;

    // 4. Tabla de Ingresos Netos Mes a Mes (Dic 2025 - Dic 2026)
    const ingresosNetosRows = HISTORICAL_NET_INCOMES.map(row => {
      return {
        ...row,
        monto: row.baseNeto,
      };
    });

    const totalIngresosNetosAcumulados = ingresosNetosRows.reduce((s, r) => s + r.monto, 0);

    // 5. Resumen de Ingresos vs Resumen de Gastos (Fondo de Caja)
    const fondoAdminAnterior = 13496.0;
    const aportacionesTanqueGas = 28500.0;
    const totalResumenIngresos = fondoAdminAnterior + totalIngresosNetosAcumulados + aportacionesTanqueGas;

    const totalResumenGastos = RESUMEN_GASTOS_FONDO_BASE.reduce((s, g) => s + g.monto, 0);
    const fondoCajaDisponible = totalResumenIngresos - totalResumenGastos;

    return {
      gastosFijos,
      gastosVariables,
      totalGastosMes,
      pagadosCompletos,
      abonadosParciales,
      sinPago,
      cubiertosAnual,
      montoPagadosCompletos,
      montoParciales,
      ingresosDelMesActivo,
      mesesPosteriores,
      granTotalIngresosTabla,
      ingresosNetosRows,
      totalIngresosNetosAcumulados,
      fondoAdminAnterior,
      aportacionesTanqueGas,
      totalResumenIngresos,
      resumenGastosList: RESUMEN_GASTOS_FONDO_BASE,
      totalResumenGastos,
      fondoCajaDisponible,
    };
  }, [monthlyEgresos, monthlyMovimientos, consolidatedMovimientos, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Barra de Controles Superior (Oculta al imprimir) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Regresar
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Centro de Impresión para Pizarrón (Tamaño Carta)</h2>
              <p className="text-xs text-slate-500">Elige imprimir el Estado por Departamento, el Corte General Acumulado o Ambos juntos</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncToSheet}
              disabled={syncing}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
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
                  Reflejar en Sheets
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              {printMode === 'ambas'
                ? 'Imprimir Ambas Hojas'
                : printMode === 'depto'
                ? 'Imprimir Hoja por Depto'
                : 'Imprimir Corte General'}
            </button>
          </div>
        </div>

        {/* Selector de las 2 Opciones de Impresión + Opción de Imprimir Ambas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setPrintMode('depto')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              printMode === 'depto'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            1. Estado por Departamento
          </button>

          <button
            type="button"
            onClick={() => setPrintMode('corte_general')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              printMode === 'corte_general'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table2 className="w-4 h-4 text-emerald-700" />
            2. Balance y Corte de Caja Anual
          </button>

          <button
            type="button"
            onClick={() => setPrintMode('ambas')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              printMode === 'ambas'
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Ver e Imprimir Ambas Hojas (2 Págs)
          </button>
        </div>
      </div>

      {/* =====================================================================
          OPCIÓN 1: ESTADO DE CUENTA POR DEPARTAMENTO (HOJA 1)
         ===================================================================== */}
      {(printMode === 'depto' || printMode === 'ambas') && (
        <div className={`flex justify-center ${printMode === 'ambas' ? 'print-page-break' : ''}`}>
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
                      Estado de Cuenta por Depto
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
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Ingresos Mes</span>
                  <span className="text-sm font-extrabold text-emerald-700 font-mono-numbers">
                    {formatCurrency(metrics.totalIngresos)}
                  </span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Egresos Mes</span>
                  <span className="text-sm font-extrabold text-rose-700 font-mono-numbers">
                    {formatCurrency(corteData.totalGastosMes)}
                  </span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Saldo del Mes</span>
                  <span className={`text-sm font-extrabold font-mono-numbers ${(metrics.totalIngresos - corteData.totalGastosMes) >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                    {formatCurrency(metrics.totalIngresos - corteData.totalGastosMes)}
                  </span>
                </div>
                <div className="text-center border-l border-slate-200">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Fondo en Caja</span>
                  <span className="text-sm font-extrabold text-emerald-800 font-mono-numbers">
                    {formatCurrency(corteData.fondoCajaDisponible)}
                  </span>
                </div>
              </div>

              {/* Tablas lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                
                {/* Tabla de 20 Departamentos con "Situación del Mes" */}
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

                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[8.5px] text-slate-600">
                    <strong>Nota sobre Pago Anual:</strong> Los departamentos con modalidad de <strong>Pago Anual</strong> se encuentran cubiertos durante todo el año; su aportación se contabilizó en el mes en que realizaron su pago anual.
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
                        {[...corteData.gastosFijos, ...corteData.gastosVariables].length === 0 ? (
                          <tr>
                            <td colSpan={3} className="border border-slate-300 px-2 py-3 text-center text-slate-400 italic text-[9px]">
                              Sin gastos registrados en el mes
                            </td>
                          </tr>
                        ) : (
                          [...corteData.gastosFijos, ...corteData.gastosVariables].map((e, idx) => (
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
                            {formatCurrency(corteData.totalGastosMes)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    {/* Resumen compacto de Fondo de Caja */}
                    <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded text-[9px] mb-3">
                      <div className="font-bold text-emerald-950 uppercase mb-1">
                        Balance General y Fondo de Caja
                      </div>
                      <div className="space-y-0.5 text-slate-700">
                        <div className="flex justify-between">
                          <span>Fondo administración anterior:</span>
                          <span className="font-mono-numbers font-semibold">{formatCurrency(corteData.fondoAdminAnterior)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ingresos netos acumulados:</span>
                          <span className="font-mono-numbers font-semibold">{formatCurrency(corteData.totalIngresosNetosAcumulados)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Aportaciones cambio tanque gas:</span>
                          <span className="font-mono-numbers font-semibold">{formatCurrency(corteData.aportacionesTanqueGas)}</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-200 pt-0.5 font-semibold text-slate-900">
                          <span>Total Ingresos Acumulados:</span>
                          <span className="font-mono-numbers">{formatCurrency(corteData.totalResumenIngresos)}</span>
                        </div>
                        <div className="flex justify-between text-rose-700">
                          <span>(–) Total Gastos del Fondo:</span>
                          <span className="font-mono-numbers font-semibold">{formatCurrency(corteData.totalResumenGastos)}</span>
                        </div>
                        <div className="flex justify-between border-t border-emerald-300 pt-1 font-extrabold text-emerald-900 text-[10px]">
                          <span>Fondo de Caja Disponible:</span>
                          <span className="font-mono-numbers">{formatCurrency(corteData.fondoCajaDisponible)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nota Institucional */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[8.5px] text-slate-600 leading-tight">
                    <p className="font-bold text-slate-700 uppercase mb-0.5">Nota de la Administración:</p>
                    Agradecemos a todos los vecinos su puntualidad. El pago oportuno de los servicios de recolección de basura, limpieza y bombeo de agua depende del cumplimiento de las cuotas de los 20 departamentos.
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
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          OPCIÓN 2: FORMATO CORTE DE CAJA Y BALANCE ANUAL (FORMATO DE TU ESPOSA)
         ===================================================================== */}
      {(printMode === 'corte_general' || printMode === 'ambas') && (
        <div className="flex justify-center">
          <div 
            className="print-page bg-white w-full max-w-[816px] min-h-[1056px] p-6 sm:p-8 shadow-lg sm:border sm:border-slate-300 rounded-sm text-slate-900 text-[10px] flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
          >
            <div className="space-y-3">
              {/* Título principal igual al formato de la administradora */}
              <div className="text-center border-b-2 border-slate-900 pb-2">
                <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900">
                  ESTADO DE CUENTA DEL MES DE {mesNombre.toUpperCase()} {selectedYear}
                </h1>
                <p className="text-[10px] font-semibold text-slate-600 uppercase">
                  Edificio Roble 30 A 2 • Corte de Ingresos, Gastos y Fondo de Caja
                </p>
              </div>

              {/* 1. TABLA DE GASTOS FIJOS Y VARIABLES */}
              <div>
                <table className="w-full border-collapse border border-slate-400 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900">
                      <th colSpan={2} className="border border-slate-400 px-2 py-1 text-left font-extrabold uppercase">
                        GASTOS FIJOS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {corteData.gastosFijos.map((g, i) => (
                      <tr key={`fijo_${i}`}>
                        <td className="border border-slate-400 px-2 py-0.5">{g.concepto}</td>
                        <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers font-semibold w-28">
                          {formatCurrency(g.monto)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-200 text-slate-900">
                      <th colSpan={2} className="border border-slate-400 px-2 py-1 text-left font-extrabold uppercase">
                        GASTOS VARIABLES
                      </th>
                    </tr>
                    {corteData.gastosVariables.length === 0 ? (
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 italic text-slate-500">Sin gastos variables en el mes</td>
                        <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers">$0.00</td>
                      </tr>
                    ) : (
                      corteData.gastosVariables.map((g, i) => (
                        <tr key={`var_${i}`}>
                          <td className="border border-slate-400 px-2 py-0.5 leading-snug">{g.concepto}</td>
                          <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers font-semibold w-28">
                            {formatCurrency(g.monto)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="text-right font-extrabold text-[10px] mt-1 text-slate-900">
                  Total de gastos fijos más gastos variables: <span className="font-mono-numbers">{formatCurrency(corteData.totalGastosMes)}</span>
                </div>
              </div>

              {/* 2. TABLA DE INGRESOS DEL MES Y ADELANTOS */}
              <div>
                <table className="w-full border-collapse border border-slate-400 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900">
                      <th colSpan={3} className="border border-slate-400 px-2 py-1 text-center font-extrabold uppercase">
                        INGRESOS DEL MES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 px-2 py-1 font-bold w-64">
                        DEPARTAMENTOS QUE REALIZARON PAGOS DEL MES DE {mesNombre.toUpperCase()}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 font-mono-numbers">
                        {[...corteData.pagadosCompletos, ...corteData.abonadosParciales]
                          .map(d => formatDeptoCode(d.depto))
                          .join(', ')}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 font-mono-numbers font-semibold w-52">
                        <div>
                          MONTO PAGADO $150.00 * {corteData.pagadosCompletos.length} = {formatCurrency(corteData.montoPagadosCompletos)}
                        </div>
                        {corteData.abonadosParciales.map(p => (
                          <div key={p.depto}>
                            Dep. {formatDeptoCode(p.depto)}: {formatCurrency(p.ingreso_efectivo_mes)}
                          </div>
                        ))}
                      </td>
                    </tr>

                    {corteData.cubiertosAnual.length > 0 && (
                      <tr>
                        <td className="border border-slate-400 px-2 py-0.5 font-bold">
                          DEPARTAMENTOS CON PAGO ANUAL CUBIERTO
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 font-mono-numbers">
                          {corteData.cubiertosAnual.map(d => formatDeptoCode(d.depto)).join(', ')}
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 text-slate-600 italic">
                          Cubierto en pago anual
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td className="border border-slate-400 px-2 py-0.5 font-bold">
                        DEPARTAMENTOS SIN PAGO
                      </td>
                      <td colSpan={2} className="border border-slate-400 px-2 py-0.5 font-mono-numbers">
                        {corteData.sinPago.map(d => formatDeptoCode(d.depto)).join(', ') || 'Ninguno'}
                      </td>
                    </tr>

                    {/* Pagos y abonos de meses siguientes (Octubre, Noviembre, Diciembre) */}
                    {corteData.mesesPosteriores.map(mp => (
                      <React.Fragment key={mp.mes_num}>
                        {mp.completos.length > 0 && (
                          <tr>
                            <td className="border border-slate-400 px-2 py-0.5 font-bold">
                              DEPARTAMENTOS QUE YA REALIZARON PAGOS DE {mp.mesNombre}
                            </td>
                            <td className="border border-slate-400 px-2 py-0.5 font-mono-numbers">
                              {mp.completos.map(d => formatDeptoCode(d.depto)).join(', ')}
                            </td>
                            <td className="border border-slate-400 px-2 py-0.5 font-mono-numbers font-semibold">
                              $150.00 * {mp.completos.length} = {formatCurrency(mp.sumaCompletos)}
                            </td>
                          </tr>
                        )}
                        {mp.parciales.length > 0 && (
                          <tr>
                            <td className="border border-slate-400 px-2 py-0.5 font-bold">
                              DEPARTAMENTOS CON ABONOS DEL MES DE {mp.mesNombre}
                            </td>
                            <td className="border border-slate-400 px-2 py-0.5 font-mono-numbers">
                              {mp.parciales.map(d => formatDeptoCode(d.depto)).join(', ')}
                            </td>
                            <td className="border border-slate-400 px-2 py-0.5 font-mono-numbers font-semibold">
                              {mp.parciales.length > 1
                                ? `Con ${formatCurrency(mp.parciales[0].ingreso_efectivo_mes)} c/u = ${formatCurrency(mp.sumaParciales)}`
                                : formatCurrency(mp.sumaParciales)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}

                    <tr className="bg-slate-100 font-extrabold">
                      <td colSpan={2} className="border border-slate-400 px-2 py-1 text-right uppercase">
                        TOTAL DE INGRESOS
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-right font-mono-numbers text-emerald-800">
                        {formatCurrency(corteData.granTotalIngresosTabla)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. INGRESOS NETOS (INGRESOS MENOS GASTOS) MES A MES */}
              <div>
                <table className="w-full border-collapse border border-slate-400 text-[9px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900">
                      <th colSpan={2} className="border border-slate-400 px-2 py-1 text-center font-extrabold uppercase">
                        INGRESOS NETOS (INGRESOS MENOS GASTOS) MES A MES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {corteData.ingresosNetosRows.map(row => (
                      <tr key={row.key}>
                        <td className="border border-slate-400 px-2 py-0.5">
                          <span className="font-semibold">{row.label}</span>{' '}
                          {row.nota && <span className="text-slate-600">{row.nota}</span>}
                        </td>
                        <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers font-semibold w-28">
                          {formatCurrency(row.monto)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-extrabold text-[9.5px]">
                      <td className="border border-slate-400 px-2 py-0.5 text-right">Total</td>
                      <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers">
                        {formatCurrency(corteData.totalIngresosNetosAcumulados)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 4. RESUMEN DE INGRESOS Y RESUMEN DE GASTOS */}
              <div className="grid grid-cols-1 gap-2">
                <table className="w-full border-collapse border border-slate-400 text-[9px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900">
                      <th colSpan={2} className="border border-slate-400 px-2 py-0.5 text-left font-extrabold uppercase">
                        Resumen de ingresos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 px-2 py-0.5">Fondo dejado por la administración anterior</td>
                      <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers font-semibold w-28">
                        {formatCurrency(corteData.fondoAdminAnterior)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 px-2 py-0.5">
                        Ingresos netos acumulados de diciembre 2025 al 09 de noviembre 2026
                      </td>
                      <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers font-semibold">
                        {formatCurrency(corteData.totalIngresosNetosAcumulados)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 px-2 py-0.5">Aportaciones para cambio de tanque de gas</td>
                      <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers font-semibold">
                        {formatCurrency(corteData.aportacionesTanqueGas)}
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-extrabold">
                      <td className="border border-slate-400 px-2 py-0.5 text-right">TOTAL</td>
                      <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers">
                        {formatCurrency(corteData.totalResumenIngresos)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full border-collapse border border-slate-400 text-[9px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900">
                      <th colSpan={2} className="border border-slate-400 px-2 py-0.5 text-left font-extrabold uppercase">
                        Resumen de gastos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {corteData.resumenGastosList.map((g, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-400 px-2 py-0.5 leading-tight">{g.concepto}</td>
                        <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers font-semibold w-28">
                          {formatCurrency(g.monto)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-extrabold">
                      <td className="border border-slate-400 px-2 py-0.5 text-right">TOTAL</td>
                      <td className="border border-slate-400 px-2 py-0.5 text-right font-mono-numbers">
                        {formatCurrency(corteData.totalResumenGastos)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 5. LEYENDA FINAL DE FONDO DE CAJA */}
              <div className="p-2.5 bg-emerald-50 border-2 border-emerald-700 rounded text-center font-extrabold text-xs text-emerald-950">
                Al día {fechaHoy} contamos con un fondo de caja de{' '}
                <span className="font-mono-numbers underline">{formatCurrency(corteData.fondoCajaDisponible)}</span>
              </div>
            </div>

            {/* Pie discreto */}
            <div className="pt-2 mt-2 border-t border-slate-300 flex justify-between text-[8px] text-slate-500">
              <span>Administración Edificio Roble 30 A 2</span>
              <span>Reporte de Transparencia y Corte Acumulado</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
