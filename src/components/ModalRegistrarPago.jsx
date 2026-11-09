import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, getMonthName, formatCurrency } from '../utils/formatters';
import { X, Check, Loader2, Info, Calendar, CalendarCheck } from 'lucide-react';

export default function ModalRegistrarPago() {
  const {
    data,
    consolidatedMovimientos,
    annualPayers,
    modalState,
    closeModal,
    handleRegistrarPago,
    handleRegistrarPagoAnual,
    selectedMonth,
    selectedYear,
  } = useApp();

  const props = modalState.props || {};
  const defaultDepto = props.depto || '1';
  const defaultAnio = props.anio !== undefined ? Number(props.anio) : selectedYear;
  const defaultMesNum = props.mes_num !== undefined ? Number(props.mes_num) : selectedMonth;

  const [depto, setDepto] = useState(defaultDepto);
  const [tipoPeriodicidad, setTipoPeriodicidad] = useState('mensual'); // 'mensual' o 'anual'
  const [anio, setAnio] = useState(defaultAnio);
  const [mesNum, setMesNum] = useState(defaultMesNum);
  const [cuota, setCuota] = useState(props.cuota || 150);
  const [modoRegistro, setModoRegistro] = useState(props.modo_registro || 'sumar'); // 'sumar' o 'reemplazar'
  const [montoPagado, setMontoPagado] = useState(props.monto_sugerido !== undefined ? props.monto_sugerido : 150);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Buscar el registro consolidado actual para el (depto + año + mes) seleccionado
  const registroExistente = useMemo(() => {
    return consolidatedMovimientos.find(
      m =>
        String(m.depto).trim() === String(depto).trim() &&
        Number(m.anio) === Number(anio) &&
        Number(m.mes_num) === Number(mesNum)
    ) || null;
  }, [consolidatedMovimientos, depto, anio, mesNum]);

  const yaEsAnual = useMemo(() => {
    return Boolean(annualPayers?.[`${String(depto).trim()}_${Number(anio)}`]);
  }, [annualPayers, depto, anio]);

  // Cuando el usuario cambia de depto, mes o año dentro del modal, ajustar sugerencia inteligentemente
  useEffect(() => {
    if (tipoPeriodicidad === 'anual') return;

    if (registroExistente) {
      const pagadoPrevio = Number(registroExistente.monto_pagado) || 0;
      const cuotaPrevia = Number(registroExistente.cuota) || 150;
      setCuota(cuotaPrevia);

      if (pagadoPrevio > 0 && pagadoPrevio < cuotaPrevia) {
        // Mes parcial: sugerir sumar el saldo restante
        setModoRegistro('sumar');
        setMontoPagado(cuotaPrevia - pagadoPrevio);
      } else if (pagadoPrevio >= cuotaPrevia) {
        // Mes ya pagado: poner en modo reemplazar por si desean ajustar/corregir el total
        setModoRegistro('reemplazar');
        setMontoPagado(pagadoPrevio);
      } else {
        setModoRegistro('sumar');
        setMontoPagado(cuotaPrevia);
      }
    } else {
      setCuota(150);
      setModoRegistro('sumar');
      setMontoPagado(150);
    }
  }, [depto, anio, mesNum, registroExistente, tipoPeriodicidad]);

  // Encontrar el nombre del vecino seleccionado
  const vecinoSeleccionado = data.vecinos.find(
    v => String(v.depto).trim() === String(depto).trim()
  );

  const pagadoAnterior = registroExistente ? Number(registroExistente.monto_pagado || 0) : 0;
  const montoNumActual = Number(montoPagado) || 0;
  const cuotaNumActual = Number(cuota) || 150;

  const totalFinalMes = modoRegistro === 'reemplazar'
    ? montoNumActual
    : pagadoAnterior + montoNumActual;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cuotaNum = Number(cuota) || 150;

    if (tipoPeriodicidad === 'anual') {
      try {
        setSaving(true);
        await handleRegistrarPagoAnual({
          depto: String(depto),
          anio: Number(anio),
          mes_cobro: Number(mesNum),
          cuota: cuotaNum,
        });
        closeModal();
      } catch (err) {
        console.error(err);
        setErrorMsg('Error al guardar el pago anual. Intenta nuevamente.');
      } finally {
        setSaving(false);
      }
      return;
    }

    const montoNum = Number(montoPagado);

    if (isNaN(montoNum) || montoNum < 0) {
      setErrorMsg('Ingresa un monto válido.');
      return;
    }

    let estado = 'pendiente';
    if (totalFinalMes >= cuotaNum && cuotaNum > 0) {
      estado = 'pagado';
    } else if (totalFinalMes > 0) {
      estado = 'parcial';
    }

    const payload = {
      depto: String(depto),
      anio: Number(anio),
      mes_num: Number(mesNum),
      mes: getMonthName(mesNum),
      cuota: cuotaNum,
      monto_pagado: modoRegistro === 'reemplazar' ? totalFinalMes : montoNum,
      modo_registro: modoRegistro,
      estado: estado,
      fuente: 'App Web',
    };

    try {
      setSaving(true);
      await handleRegistrarPago(payload);
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al guardar en Google Sheets. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registrar / Abonar Cuota</h3>
            <p className="text-xs text-slate-500">Elige pago mensual o pago anual para todo el año</p>
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Selector de Modalidad: Pago Mensual vs Pago Anual */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTipoPeriodicidad('mensual')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                tipoPeriodicidad === 'mensual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Pago Mensual
            </button>
            <button
              type="button"
              onClick={() => setTipoPeriodicidad('anual')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                tipoPeriodicidad === 'anual'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Pago Anual (12 meses)
            </button>
          </div>

          {/* Selector de Departamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Departamento
            </label>
            <select
              value={depto}
              onChange={(e) => setDepto(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {data.vecinos.map((v) => (
                <option key={v.depto} value={v.depto}>
                  Depto {v.depto} {v.nombre ? `— ${v.nombre}` : ''}
                </option>
              ))}
            </select>
            {vecinoSeleccionado && vecinoSeleccionado.nombre && (
              <div className="mt-1 text-xs text-slate-500 font-medium flex items-center justify-between">
                <span>Residente: <strong className="text-slate-800">{vecinoSeleccionado.nombre}</strong></span>
                {yaEsAnual && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    Ya tiene Pago Anual en {anio}
                  </span>
                )}
              </div>
            )}
          </div>

          {tipoPeriodicidad === 'anual' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Año que cubre
                  </label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mes en que pagó la anualidad
                  </label>
                  <select
                    value={mesNum}
                    onChange={(e) => setMesNum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl space-y-1.5 text-xs text-teal-950">
                <div className="font-bold flex items-center justify-between">
                  <span>Cobertura Anual Completa ({anio}):</span>
                  <span className="font-mono-numbers text-sm">{formatCurrency(cuotaNumActual * 12)}</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  • Los 12 meses de <strong>{anio}</strong> quedarán marcados como <strong>Pagado (Anual)</strong> en su historial.<br />
                  • En los meses posteriores a <strong>{getMonthName(mesNum)}</strong> aparecerá al corriente pero <strong>no sumará $150 extra</strong> a los ingresos de cada mes para que tu corte de caja cuadre exacto.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Período a abonar (Mes y Año) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mes del Pago
                  </label>
                  <select
                    value={mesNum}
                    onChange={(e) => setMesNum(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Aviso si ya existe un abono en ese mes */}
              {pagadoAnterior > 0 && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-amber-900 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-600" />
                      Ya tiene registrado en {getMonthName(mesNum)}:
                    </span>
                    <span className="font-mono-numbers font-bold">{formatCurrency(pagadoAnterior)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setModoRegistro('sumar');
                        const rest = Math.max(0, cuotaNumActual - pagadoAnterior);
                        setMontoPagado(rest > 0 ? rest : cuotaNumActual);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border transition-all ${
                        modoRegistro === 'sumar'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Sumar abono al mes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModoRegistro('reemplazar');
                        setMontoPagado(cuotaNumActual);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] border transition-all ${
                        modoRegistro === 'reemplazar'
                          ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Fijar total del mes
                    </button>
                  </div>
                </div>
              )}

              {/* Cuota y Monto Pagado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cuota Regular ($)
                  </label>
                  <input
                    type="number"
                    value={cuota}
                    onChange={(e) => setCuota(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {modoRegistro === 'reemplazar' ? 'Monto Total del Mes ($)' : 'Monto a Abonar ($)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono-numbers text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Previsualización del Estado */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 font-medium block">Total acumulado en {getMonthName(mesNum)}:</span>
                  <span className="font-mono-numbers font-black text-slate-900 text-sm">{formatCurrency(totalFinalMes)}</span>
                </div>
                <span className={`font-bold px-2.5 py-1 rounded uppercase text-[11px] ${
                  totalFinalMes >= cuotaNumActual
                    ? 'bg-emerald-100 text-emerald-800'
                    : totalFinalMes > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {totalFinalMes >= cuotaNumActual ? 'Pagado' : totalFinalMes > 0 ? 'Parcial' : 'Pendiente'}
                </span>
              </div>
            </>
          )}

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
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-sm disabled:opacity-50 ${
                tipoPeriodicidad === 'anual' ? 'bg-teal-700 hover:bg-teal-800' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando en Sheet...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {tipoPeriodicidad === 'anual' ? 'Aplicar Pago Anual' : 'Guardar Pago'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
