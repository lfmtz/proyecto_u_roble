import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { fetchAppData, registrarPago, registrarEgreso, registrarFondo, actualizarVecino } from '../services/api';
import { MONTH_NAMES, getMonthName } from '../utils/formatters';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [data, setData] = useState({
    vecinos: [],
    movimientos: [],
    egresos: [],
    proyecto_fondo: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fecha actual o predeterminada (2026, Octubre)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(10); // 1-12 (10 = Octubre)

  // Control de modales y navegación
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'vecinos', 'egresos', 'fondo', 'imprimir'
  const [modalState, setModalState] = useState({
    type: null, // 'pago', 'egreso', 'fondo', 'depto_historial', 'editar_vecino'
    props: null,
  });

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetchAppData();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Revisa tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lista de años disponibles en los datos
  const availableYears = useMemo(() => {
    const years = new Set([2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019]);
    data.movimientos.forEach(m => {
      if (m.anio) years.add(Number(m.anio));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [data.movimientos]);

  // Movimientos y estados de cada departamento para el mes seleccionado,
  // con cálculo de adeudos anteriores acumulados.
  const monthlyMovimientos = useMemo(() => {
    const currentMonthName = getMonthName(selectedMonth).toLowerCase();
    const deptosMap = {};

    // 1. Inicializar departamentos según catálogo de vecinos
    data.vecinos.forEach(v => {
      const deptoId = String(v.depto).trim();
      deptosMap[deptoId] = {
        depto: deptoId,
        nombre: v.nombre || `Depto ${deptoId}`,
        telefono: v.telefono || '',
        correo: v.correo || '',
        nota: v.nota || '',
        cuota: 150,
        monto_pagado: 0,
        estado: 'pendiente',
        historial_mes: [],
        adeudo_anterior: 0,
        meses_adeudo_anterior: 0,
      };
    });

    // 2. Calcular cuota y abonos del mes corriente + adeudos de meses anteriores
    data.movimientos.forEach(m => {
      const deptoId = String(m.depto).trim();
      const mAnio = Number(m.anio);
      const mMesNum = Number(m.mes_num);
      const mMes = String(m.mes || '').toLowerCase().trim();
      const cuota = Number(m.cuota || 150);
      const pagado = Number(m.monto_pagado || 0);

      if (!deptosMap[deptoId]) {
        deptosMap[deptoId] = {
          depto: deptoId,
          nombre: `Depto ${deptoId}`,
          telefono: '',
          correo: '',
          nota: '',
          cuota: cuota,
          monto_pagado: 0,
          estado: 'pendiente',
          historial_mes: [],
          adeudo_anterior: 0,
          meses_adeudo_anterior: 0,
        };
      }

      const esMesActual = mAnio === selectedYear && (mMesNum === selectedMonth || mMes === currentMonthName);
      const esMesAnterior = mAnio < selectedYear || (mAnio === selectedYear && mMesNum < selectedMonth);

      if (esMesActual) {
        deptosMap[deptoId].monto_pagado += pagado;
        deptosMap[deptoId].cuota = cuota;
        deptosMap[deptoId].historial_mes.push(m);
      } else if (esMesAnterior) {
        // Si en un mes anterior no cubrió la cuota completa
        if (pagado < cuota) {
          const deficit = Math.max(0, cuota - pagado);
          deptosMap[deptoId].adeudo_anterior += deficit;
          deptosMap[deptoId].meses_adeudo_anterior += 1;
        }
      }
    });

    // 3. Determinar estado y totales finales
    return Object.values(deptosMap).map(d => {
      let estado = 'pendiente';
      if (d.monto_pagado >= d.cuota && d.cuota > 0) {
        estado = 'pagado';
      } else if (d.monto_pagado > 0) {
        estado = 'parcial';
      }

      const saldoPendienteMes = Math.max(0, d.cuota - d.monto_pagado);
      const tieneAdeudoAnterior = d.adeudo_anterior > 0;
      const adeudoTotal = saldoPendienteMes + d.adeudo_anterior;

      return {
        ...d,
        estado,
        saldo_pendiente: saldoPendienteMes,
        tiene_adeudo_anterior: tieneAdeudoAnterior,
        adeudo_total: adeudoTotal,
      };
    }).sort((a, b) => {
      const numA = parseInt(a.depto, 10) || 0;
      const numB = parseInt(b.depto, 10) || 0;
      return numA - numB;
    });
  }, [data.vecinos, data.movimientos, selectedYear, selectedMonth]);

  // Egresos del mes seleccionado
  const monthlyEgresos = useMemo(() => {
    const currentMonthName = getMonthName(selectedMonth).toLowerCase();

    return data.egresos.filter(e => {
      const eAnio = Number(e.anio);
      const eMes = String(e.mes || '').toLowerCase().trim();
      return eAnio === selectedYear && eMes === currentMonthName;
    });
  }, [data.egresos, selectedYear, selectedMonth]);

  // Métricas financieras del mes
  const metrics = useMemo(() => {
    const totalIngresos = monthlyMovimientos.reduce((sum, d) => sum + (d.monto_pagado || 0), 0);
    const totalEgresos = monthlyEgresos.reduce((sum, e) => sum + (Number(e.monto) || 0), 0);
    const saldoMes = totalIngresos - totalEgresos;

    const totalDeptos = monthlyMovimientos.length || 20;
    const pagados = monthlyMovimientos.filter(d => d.estado === 'pagado').length;
    const parciales = monthlyMovimientos.filter(d => d.estado === 'parcial').length;
    const pendientes = monthlyMovimientos.filter(d => d.estado === 'pendiente').length;
    const conAdeudoAnterior = monthlyMovimientos.filter(d => d.tiene_adeudo_anterior).length;

    const porcCobranza = totalDeptos > 0 ? Math.round((pagados / totalDeptos) * 100) : 0;

    return {
      totalIngresos,
      totalEgresos,
      saldoMes,
      totalDeptos,
      pagados,
      parciales,
      pendientes,
      conAdeudoAnterior,
      porcCobranza,
    };
  }, [monthlyMovimientos, monthlyEgresos]);

  // Métricas del Fondo Especial
  const fondoMetrics = useMemo(() => {
    let totalAportado = 0;
    let totalGastado = 0;
    const aportaciones = [];
    const gastos = [];

    data.proyecto_fondo.forEach(item => {
      const monto = Number(item.monto) || 0;
      const tipo = String(item.tipo || '').toLowerCase().trim();

      if (tipo === 'aportacion') {
        totalAportado += monto;
        aportaciones.push(item);
      } else if (tipo === 'gasto') {
        totalGastado += monto;
        gastos.push(item);
      }
    });

    const saldoDisponible = totalAportado - totalGastado;
    const porcentajeUso = totalAportado > 0 ? Math.min(100, Math.round((totalGastado / totalAportado) * 100)) : 0;

    return {
      totalAportado,
      totalGastado,
      saldoDisponible,
      porcentajeUso,
      aportaciones,
      gastos,
    };
  }, [data.proyecto_fondo]);

  // Acciones
  const handleRegistrarPago = async (pagoPayload) => {
    await registrarPago(pagoPayload);
    setData(prev => ({
      ...prev,
      movimientos: [...prev.movimientos, pagoPayload],
    }));
  };

  const handleRegistrarEgreso = async (egresoPayload) => {
    await registrarEgreso(egresoPayload);
    setData(prev => ({
      ...prev,
      egresos: [...prev.egresos, egresoPayload],
    }));
  };

  const handleRegistrarFondo = async (fondoPayload) => {
    await registrarFondo(fondoPayload);
    setData(prev => ({
      ...prev,
      proyecto_fondo: [...prev.proyecto_fondo, fondoPayload],
    }));
  };

  const handleActualizarVecino = async (vecinoPayload) => {
    await actualizarVecino(vecinoPayload);
    setData(prev => {
      const targetDepto = String(vecinoPayload.depto).trim();
      const existingIdx = prev.vecinos.findIndex(v => String(v.depto).trim() === targetDepto);
      let newVecinos = [...prev.vecinos];

      if (existingIdx >= 0) {
        newVecinos[existingIdx] = { ...newVecinos[existingIdx], ...vecinoPayload };
      } else {
        newVecinos.push(vecinoPayload);
      }

      return {
        ...prev,
        vecinos: newVecinos,
      };
    });
  };

  const openModal = (type, props = {}) => {
    setModalState({ type, props });
  };

  const closeModal = () => {
    setModalState({ type: null, props: null });
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        refreshing,
        error,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        availableYears,
        monthlyMovimientos,
        monthlyEgresos,
        metrics,
        fondoMetrics,
        activeTab,
        setActiveTab,
        modalState,
        openModal,
        closeModal,
        refreshData: () => loadData(true),
        handleRegistrarPago,
        handleRegistrarEgreso,
        handleRegistrarFondo,
        handleActualizarVecino,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}
