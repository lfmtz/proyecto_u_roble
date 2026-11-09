import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getStatusBadge } from '../utils/formatters';
import { X, PlusCircle, Phone, Mail, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ModalDeptoHistorial() {
  const { data, consolidatedMovimientos, modalState, closeModal, openModal, selectedMonth, selectedYear } = useApp();
  const deptoId = modalState.props?.depto || '1';

  // Buscar información de contacto en vecinos
  const vecinoInfo = data.vecinos.find(
    v => String(v.depto).trim() === String(deptoId).trim()
  ) || {};

  // Historial cronológico consolidado (sin meses duplicados) de este departamento
  const deptoMovimientos = useMemo(() => {
    return consolidatedMovimientos
      .filter(m => String(m.depto).trim() === String(deptoId).trim())
      .sort((a, b) => {
        const yA = Number(a.anio) || 0;
        const yB = Number(b.anio) || 0;
        if (yB !== yA) return yB - yA;
        const mA = Number(a.mes_num) || 0;
        const mB = Number(b.mes_num) || 0;
        return mB - mA;
      });
  }, [consolidatedMovimientos, deptoId]);

  // Detectar si existe algún mes parcial o pendiente más reciente para sugerirlo al hacer clic en "+ Abonar"
  const mesConAdeudoReciente = useMemo(() => {
    return deptoMovimientos.find(m => m.estado === 'parcial' || m.estado === 'pendiente') || null;
  }, [deptoMovimientos]);

  // Resumen del departamento
  const stats = useMemo(() => {
    const totalPagado = deptoMovimientos.reduce((sum, m) => sum + (Number(m.monto_pagado) || 0), 0);
    const pagados = deptoMovimientos.filter(m => m.estado === 'pagado').length;
    const parciales = deptoMovimientos.filter(m => m.estado === 'parcial').length;
    const pendientes = deptoMovimientos.filter(m => m.estado === 'pendiente').length;
    const totalAdeudo = deptoMovimientos.reduce((sum, m) => sum + (Number(m.saldo_restante) || 0), 0);

    return { totalPagado, pagados, parciales, pendientes, totalAdeudo };
  }, [deptoMovimientos]);

  // Abrir modal de pago apuntando a un mes específico (para abonar el restante o editar)
  const handleSelectMes = (m, modo = 'sumar') => {
    openModal('pago', {
      depto: deptoId,
      anio: m.anio,
      mes_num: m.mes_num,
      cuota: m.cuota,
      monto_existente: m.monto_pagado,
      monto_sugerido: modo === 'reemplazar' ? m.monto_pagado : (m.saldo_restante > 0 ? m.saldo_restante : m.cuota),
      modo_registro: modo,
    });
  };

  // Botón superior "+ Abonar": si hay un mes parcial o pendiente, lo abre directo; si todo está pagado, abre el mes activo
  const handleAbonarSuperior = () => {
    if (mesConAdeudoReciente) {
      handleSelectMes(mesConAdeudoReciente, 'sumar');
    } else {
      openModal('pago', {
        depto: deptoId,
        anio: selectedYear,
        mes_num: selectedMonth,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Encabezado */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg font-mono-numbers shadow-sm shadow-emerald-200">
              {deptoId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Departamento {deptoId}
                </h3>
                {stats.totalAdeudo === 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Al corriente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <AlertCircle className="w-3 h-3" /> Restante: {formatCurrency(stats.totalAdeudo)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {vecinoInfo.nombre || 'Residente sin registrar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAbonarSuperior}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
              title={mesConAdeudoReciente ? `Abonar a ${mesConAdeudoReciente.mes} ${mesConAdeudoReciente.anio}` : 'Registrar nuevo abono'}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {mesConAdeudoReciente ? `Saldar ${mesConAdeudoReciente.mes}` : 'Abonar'}
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contacto y Notas Rápidas */}
        {(vecinoInfo.telefono || vecinoInfo.correo || vecinoInfo.nota) && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {vecinoInfo.telefono && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {String(vecinoInfo.telefono)}
              </span>
            )}
            {vecinoInfo.correo && (
              <span className="flex items-center gap-1 truncate max-w-xs">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {String(vecinoInfo.correo)}
              </span>
            )}
            {vecinoInfo.nota && (
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                {String(vecinoInfo.nota)}
              </span>
            )}
          </div>
        )}

        {/* Resumen Superior */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-slate-100 text-center text-xs bg-white">
          <div className="p-2 rounded-lg bg-slate-50">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Aportado</span>
            <span className="font-mono-numbers font-black text-slate-900 text-sm">{formatCurrency(stats.totalPagado)}</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
            <span className="block text-[10px] uppercase font-bold text-emerald-600">Meses Pagados</span>
            <span className="font-mono-numbers font-black text-sm">{stats.pagados}</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
            <span className="block text-[10px] uppercase font-bold text-amber-600">Meses Parciales</span>
            <span className="font-mono-numbers font-black text-sm">{stats.parciales}</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-800">
            <span className="block text-[10px] uppercase font-bold text-rose-600">Meses Pendientes</span>
            <span className="font-mono-numbers font-black text-sm">{stats.pendientes}</span>
          </div>
        </div>

        {/* Lista / Tabla de Historial */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Historial Consolidado por Mes ({deptoMovimientos.length})
            </div>
            <span className="text-[11px] text-slate-400">
              Haz clic en cualquier mes para abonar o corregir
            </span>
          </div>

          {deptoMovimientos.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No hay movimientos registrados para este departamento.
            </div>
          ) : (
            deptoMovimientos.map((m, idx) => {
              const badge = getStatusBadge(m.estado, m.es_anual);
              const esIncompleto = m.estado === 'parcial' || m.estado === 'pendiente';

              return (
                <div
                  key={`${m.anio}_${m.mes_num}_${idx}`}
                  onClick={() => handleSelectMes(m, esIncompleto ? 'sumar' : 'reemplazar')}
                  className="py-2.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer group transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{m.mes} {m.anio}</span>
                      {esIncompleto && m.saldo_restante > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Faltan {formatCurrency(m.saldo_restante)}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {m.es_cubierto_anual ? (
                        <span className="text-teal-700 font-medium">
                          Cubierto por Pago Anual (No suma ingreso a {m.mes})
                        </span>
                      ) : (
                        <>Cuota: {formatCurrency(m.cuota)} • Fuente: {m.fuente || 'Sheet'}</>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {esIncompleto ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMes(m, 'sumar');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Liquidar {formatCurrency(m.saldo_restante)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMes(m, 'reemplazar');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-opacity"
                        title="Editar o ajustar monto de este mes"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="text-right min-w-[65px]">
                      <div className="font-bold text-slate-900 font-mono-numbers">
                        {formatCurrency(m.monto_pagado)}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie de modal */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => openModal('pago', { depto: deptoId, anio: selectedYear, mes_num: selectedMonth })}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-2 py-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Abonar otro mes diferente
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
