import React from 'react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, formatCurrency } from '../utils/formatters';
import { 
  Building2, 
  RotateCw, 
  Plus, 
  FileText, 
  Printer, 
  Users, 
  TrendingDown, 
  Flame, 
  LayoutDashboard,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function Header() {
  const { 
    selectedYear, 
    setSelectedYear, 
    selectedMonth, 
    setSelectedMonth, 
    availableYears,
    refreshData, 
    refreshing,
    activeTab,
    setActiveTab,
    openModal,
    currentUser,
    handleLogout
  } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      {/* Barra superior con branding y controles principales */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Roble 30</h1>
              <p className="text-xs text-slate-500 font-medium">Control de Mantenimiento</p>
            </div>
          </div>

          {/* Selectores de Período, Botón de Recarga y Usuario */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Selector de Mes */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Seleccionar mes"
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            {/* Selector de Año */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Seleccionar año"
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            {/* Botón Sincronizar */}
            <button
              onClick={refreshData}
              disabled={refreshing}
              title="Sincronizar con Google Sheets"
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Botón rápido "+ Registrar" (visible en pantallas medianas/grandes) */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => openModal('pago')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Pago
              </button>
              <button
                onClick={() => openModal('egreso')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Gasto
              </button>
            </div>

            {/* Usuario y Cerrar Sesión */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <span className="hidden lg:inline text-xs font-semibold text-slate-700 max-w-[130px] truncate" title={currentUser.nombre}>
                  {currentUser.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Pestañas de Navegación */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 border-t border-slate-100 text-xs sm:text-sm font-medium scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Resumen
          </button>

          <button
            onClick={() => setActiveTab('vecinos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'vecinos'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Departamentos
          </button>

          <button
            onClick={() => setActiveTab('egresos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'egresos'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Egresos
          </button>

          <button
            onClick={() => setActiveTab('fondo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'fondo'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            Fondo Gas
          </button>

          <button
            onClick={() => setActiveTab('imprimir')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'imprimir'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Printer className="w-4 h-4 text-blue-600" />
            Hoja Imprimible
          </button>
        </nav>
      </div>
    </header>
  );
}
