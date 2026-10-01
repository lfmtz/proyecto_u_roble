import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import VecinosDirectory from './components/VecinosDirectory';
import EgresosList from './components/EgresosList';
import FondoEspecial from './components/FondoEspecial';
import MonthlyStatementPrint from './components/MonthlyStatementPrint';
import ModalRegistrarPago from './components/ModalRegistrarPago';
import ModalRegistrarEgreso from './components/ModalRegistrarEgreso';
import ModalRegistrarFondo from './components/ModalRegistrarFondo';
import ModalDeptoHistorial from './components/ModalDeptoHistorial';
import { 
  Building2, 
  RotateCw, 
  AlertCircle, 
  LayoutDashboard, 
  Users, 
  TrendingDown, 
  Flame, 
  Printer, 
  Plus 
} from 'lucide-react';

function MainContent() {
  const { activeTab, setActiveTab, loading, error, refreshData, modalState, openModal } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-200 animate-pulse mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Cargando datos de Roble 30...</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Conectando en tiempo real con Google Sheets para traer estados de cuenta e historial.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Error de conexión</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{error}</p>
        <button
          onClick={refreshData}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Barra superior de navegación */}
      <Header />

      {/* Contenido principal según la pestaña activa */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'vecinos' && <VecinosDirectory />}
        {activeTab === 'egresos' && <EgresosList />}
        {activeTab === 'fondo' && <FondoEspecial />}
        {activeTab === 'imprimir' && <MonthlyStatementPrint />}
      </main>

      {/* Barra inferior fija para celulares (Mobile TabBar) - Oculta al imprimir */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-3 py-2 flex items-center justify-around no-print shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Resumen</span>
        </button>

        <button
          onClick={() => setActiveTab('vecinos')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'vecinos' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Deptos</span>
        </button>

        {/* Botón flotante central de captura rápida */}
        <button
          onClick={() => openModal('pago')}
          className="w-11 h-11 -mt-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-95 transition-transform"
          title="Abonar cuota"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('egresos')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'egresos' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <TrendingDown className="w-5 h-5" />
          <span>Gastos</span>
        </button>

        <button
          onClick={() => setActiveTab('imprimir')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            activeTab === 'imprimir' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <Printer className="w-5 h-5" />
          <span>Imprimir</span>
        </button>
      </div>

      {/* Renderizado Condicional de Modales */}
      {modalState.type === 'pago' && <ModalRegistrarPago />}
      {modalState.type === 'egreso' && <ModalRegistrarEgreso />}
      {modalState.type === 'fondo' && <ModalRegistrarFondo />}
      {modalState.type === 'depto_historial' && <ModalDeptoHistorial />}
    </div>
  );
}

export default function App() {
  return <MainContent />;
}
