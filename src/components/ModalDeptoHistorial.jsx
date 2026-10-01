import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getStatusBadge } from '../utils/formatters';
import { X, PlusCircle, Calendar, Phone, Mail, FileText } from 'lucide-react';

export default function ModalDeptoHistorial() {
  const { data, modalState, closeModal, openModal } = useApp();
  const deptoId = modalState.props?.depto || '1';

  // Buscar información de contacto en vecinos
  const vecinoInfo = data.vecinos.find(
    v => String(v.depto).trim() === String(deptoId).trim()
  ) || {};

  // Historial cronológico de este departamento (ordenado del más reciente al más antiguo)
  const deptoMovimientos = useMemo(() => {
    return data.movimientos
      .filter(m => String(m.depto).trim() === String(deptoId).trim())
      .sort((a, b) => {
        const yA = Number(a.anio) || 0;
        const yB = Number(b.anio) || 0;
        if (yB !== yA) return yB - yA;
        const mA = Number(a.mes_num) || 0;
        const mB = Number(b.mes_num) || 0;
        return mB - mA;
      });
  }, [data.movimientos, deptoId]);

  // Resumen del departamento
  const stats = useMemo(() => {
    const totalPagado = deptoMovimientos.reduce((sum, m) => sum + (Number(m.monto_pagado) || 0), 0);
    const pagados = deptoMovimientos.filter(m => m.estado === 'pagado').length;
    const parciales = deptoMovimientos.filter(m => m.estado === 'parcial').length;
    const pendientes = deptoMovimientos.filter(m => m.estado === 'pendiente').length;

    return { totalPagado, pagados, parciales, pendientes };
  }, [deptoMovimientos]);

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
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Departamento {deptoId}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {vecinoInfo.nombre || 'Residente sin registrar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('pago', { depto: deptoId })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Abonar
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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Historial de Movimientos Registrados ({deptoMovimientos.length})
          </div>

          {deptoMovimientos.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No hay movimientos registrados para este departamento.
            </div>
          ) : (
            deptoMovimientos.map((m, idx) => {
              const badge = getStatusBadge(m.estado);
              return (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">
                      {m.mes} {m.anio}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Cuota: {formatCurrency(m.cuota)} • Fuente: {m.fuente || 'Sheet'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
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
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
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
