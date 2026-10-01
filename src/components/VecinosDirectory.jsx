import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getStatusBadge } from '../utils/formatters';
import { Search, Phone, Mail, FileText, PlusCircle, MessageCircle, Edit3, AlertTriangle } from 'lucide-react';

export default function VecinosDirectory() {
  const { data, monthlyMovimientos, openModal, selectedMonth, selectedYear } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const vecinosList = useMemo(() => {
    return monthlyMovimientos.filter(item => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        item.depto.toLowerCase().includes(q) ||
        (item.nombre && item.nombre.toLowerCase().includes(q)) ||
        (item.telefono && item.telefono.includes(q))
      );
    });
  }, [monthlyMovimientos, searchTerm]);

  return (
    <div className="space-y-5 pb-24 sm:pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Directorio de Departamentos</h2>
          <p className="text-xs text-slate-500">
            20 departamentos • Haz clic en el lápiz para editar datos de contacto y nombre
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por depto o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid de Departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {vecinosList.map((vecino) => {
          const badge = getStatusBadge(vecino.estado);
          const rawVecino = data.vecinos.find(v => String(v.depto).trim() === String(vecino.depto).trim()) || {};
          const telefonoLimpio = (vecino.telefono || rawVecino.telefono || '').replace(/\D/g, '');

          return (
            <div
              key={vecino.depto}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm font-mono-numbers">
                      {vecino.depto}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {vecino.nombre || `Depto ${vecino.depto}`}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {vecino.tiene_adeudo_anterior && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Debe {formatCurrency(vecino.adeudo_anterior)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón Editar Vecino */}
                  <button
                    onClick={() => openModal('editar_vecino', { depto: vecino.depto })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Editar residente y contactos"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info de contacto */}
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  {vecino.telefono || rawVecino.telefono ? (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vecino.telefono || rawVecino.telefono}</span>
                    </div>
                  ) : null}

                  {vecino.correo || rawVecino.correo ? (
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{vecino.correo || rawVecino.correo}</span>
                    </div>
                  ) : null}

                  {rawVecino.nota ? (
                    <div className="text-[11px] text-amber-700 bg-amber-50/70 rounded p-1.5 mt-1 border border-amber-100">
                      Nota: {rawVecino.nota}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Botones de acción inferior */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openModal('depto_historial', { depto: vecino.depto })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Historial
                </button>

                <div className="flex items-center gap-1.5">
                  {telefonoLimpio && (
                    <a
                      href={`https://wa.me/52${telefonoLimpio}?text=Hola,%20le%20escribo%20de%20la%20administración%20de%20Roble%2030`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => openModal('pago', { depto: vecino.depto })}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Abonar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
