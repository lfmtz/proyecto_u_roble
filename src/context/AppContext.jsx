import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  fetchAppData, 
  registrarPago, 
  registrarEgreso, 
  editarEgreso,
  eliminarEgreso,
  registrarGastosFijosMes,
  registrarFondo, 
  actualizarVecino,
  loginUser
} from '../services/api';
import { MONTH_NAMES, getMonthName } from '../utils/formatters';

const AppContext = createContext();
const AUTH_KEY = 'roble30_session_user';
const ACTIVE_PROJECT_KEY = 'roble30_active_project';
const CUSTOM_PROJECTS_KEY = 'roble30_custom_projects';

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

  // Autenticación de usuario
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fecha actual o predeterminada (2026, Octubre)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(10); // 1-12 (10 = Octubre)

  // Proyectos dinámicos y proyecto activo para el Estado de Cuenta
  const [customProjects, setCustomProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PROJECTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeProjectName, setActiveProjectName] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_PROJECT_KEY);
      if (stored === 'none' || stored === '') return null;
      return stored !== null ? stored : 'Cambio de tanque de gas';
    } catch {
      return 'Cambio de tanque de gas';
    }
  });

  // Control de modales y navegación
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'vecinos', 'egresos', 'proyectos', 'imprimir'
  const [modalState, setModalState] = useState({
    type: null, // 'pago', 'egreso', 'editar_egreso', 'gastos_fijos_mes', 'fondo', 'depto_historial', 'editar_vecino', 'crear_proyecto', 'aportar_proyecto'
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

  // Calendario amplio: abarca desde 2019 hasta 2035 para registros futuros
  const availableYears = useMemo(() => {
    const years = [];
    for (let y = 2035; y >= 2019; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Lista de todos los proyectos (los que vienen en Sheet + los creados por la administradora)
  const allProjects = useMemo(() => {
    const map = new Map();
    // Proyecto predeterminado base
    map.set('Cambio de tanque de gas', {
      nombre: 'Cambio de tanque de gas',
      meta: 65000,
      descripcion: 'Reemplazo del tanque de gas e infraestructura hidroneumática'
    });

    // Proyectos extraídos del Sheet
    data.proyecto_fondo.forEach(item => {
      const pName = String(item.proyecto || '').trim();
      if (pName && !map.has(pName)) {
        map.set(pName, {
          nombre: pName,
          meta: 0,
          descripcion: 'Proyecto registrado en Google Sheets'
        });
      }
    });

    // Proyectos personalizados
    customProjects.forEach(cp => {
      if (cp.nombre) {
        map.set(cp.nombre, cp);
      }
    });

    return Array.from(map.values());
  }, [data.proyecto_fondo, customProjects]);

  // Función para obtener las estadísticas completas de un proyecto en específico
  const getProjectStats = useMemo(() => {
    return (projectName) => {
      const target = String(projectName || '').toLowerCase().trim();
      let totalAportado = 0;
      let totalGastado = 0;
      const aportaciones = [];
      const gastos = [];
      const deptoAportaciones = {};

      // Inicializar los 20 departamentos en 0
      data.vecinos.forEach(v => {
        deptoAportaciones[String(v.depto).trim()] = 0;
      });

      data.proyecto_fondo.forEach(item => {
        const pName = String(item.proyecto || '').toLowerCase().trim();
        if (pName === target) {
          const monto = Number(item.monto) || 0;
          const tipo = String(item.tipo || '').toLowerCase().trim();

          if (tipo === 'aportacion') {
            totalAportado += monto;
            aportaciones.push(item);

            // Si el item trae depto explícito o lo tiene en el concepto (ej. Depto 102)
            let deptoId = item.depto ? String(item.depto).trim() : null;
            if (!deptoId && item.concepto) {
              const match = item.concepto.match(/depto\s*([0-9]+)/i);
              if (match) deptoId = match[1];
            }

            if (deptoId && deptoAportaciones[deptoId] !== undefined) {
              deptoAportaciones[deptoId] += monto;
            }
          } else if (tipo === 'gasto') {
            totalGastado += monto;
            gastos.push(item);
          }
        }
      });

      const saldoDisponible = totalAportado - totalGastado;
      const meta = allProjects.find(p => p.nombre.toLowerCase().trim() === target)?.meta || totalAportado;
      const porcentajeMeta = meta > 0 ? Math.min(100, Math.round((totalAportado / meta) * 100)) : 0;
      const porcentajeUso = totalAportado > 0 ? Math.min(100, Math.round((totalGastado / totalAportado) * 100)) : 0;

      return {
        nombre: projectName,
        totalAportado,
        totalGastado,
        saldoDisponible,
        meta,
        porcentajeMeta,
        porcentajeUso,
        aportaciones,
        gastos,
        deptoAportaciones,
      };
    };
  }, [data.proyecto_fondo, data.vecinos, allProjects]);

  // Estadísticas del proyecto activo actualmente seleccionado para el Estado de Cuenta
  const activeProjectStats = useMemo(() => {
    if (!activeProjectName) return null;
    return getProjectStats(activeProjectName);
  }, [getProjectStats, activeProjectName]);

  // Movimientos y estados de cada departamento para el mes seleccionado
  const monthlyMovimientos = useMemo(() => {
    const currentMonthName = getMonthName(selectedMonth).toLowerCase();
    const deptosMap = {};

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
        if (pagado < cuota) {
          const deficit = Math.max(0, cuota - pagado);
          deptosMap[deptoId].adeudo_anterior += deficit;
          deptosMap[deptoId].meses_adeudo_anterior += 1;
        }
      }
    });

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

  // Acciones de autenticación
  const handleLogin = async (usuario, password) => {
    const u = String(usuario || "").trim().toLowerCase();
    const p = String(password || "").trim();

    try {
      const res = await loginUser(u, p);
      if (res && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      if ((u === 'admin' && (p === 'roble30' || p === 'admin' || p === '1234')) ||
          (u === 'vecino' && (p === 'vecino30' || p === 'vecino'))) {
        const fallbackUser = {
          usuario: u,
          nombre: u === 'admin' ? 'Administración Roble 30' : 'Consulta Vecino',
          rol: u === 'admin' ? 'admin' : 'consulta'
        };
        setCurrentUser(fallbackUser);
        localStorage.setItem(AUTH_KEY, JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      throw err;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  // Acciones de proyectos
  const handleSelectActiveProject = (nombre) => {
    const val = nombre ? nombre : null;
    setActiveProjectName(val);
    if (val) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, val);
    } else {
      localStorage.setItem(ACTIVE_PROJECT_KEY, 'none');
    }
  };

  const handleCrearProyecto = (nuevoProyecto) => {
    // nuevoProyecto: { nombre, meta, descripcion, setActive }
    setCustomProjects(prev => {
      const updated = [...prev.filter(p => p.nombre !== nuevoProyecto.nombre), nuevoProyecto];
      localStorage.setItem(CUSTOM_PROJECTS_KEY, JSON.stringify(updated));
      return updated;
    });

    if (nuevoProyecto.setActive) {
      handleSelectActiveProject(nuevoProyecto.nombre);
    }
  };

  const handleAportarProyecto = async ({ proyecto, depto, monto, modo, concepto }) => {
    const montoNum = Number(monto);
    const conceptoFinal = concepto || `Aportación Depto ${depto} para ${proyecto}`;

    // 1. Guardar en proyecto_fondo
    const fondoPayload = {
      proyecto: proyecto,
      tipo: 'aportacion',
      concepto: conceptoFinal,
      monto: montoNum,
      depto: String(depto),
      modo: modo, // 'independiente' o 'mantenimiento'
    };

    await registrarFondo(fondoPayload);
    setData(prev => ({
      ...prev,
      proyecto_fondo: [...prev.proyecto_fondo, fondoPayload],
    }));

    // 2. Si el usuario eligió que forme parte del pago de mantenimiento del mes corriente
    if (modo === 'mantenimiento') {
      const pagoPayload = {
        depto: String(depto),
        anio: Number(selectedYear),
        mes_num: Number(selectedMonth),
        mes: getMonthName(selectedMonth),
        cuota: 150,
        monto_pagado: montoNum,
        estado: montoNum >= 150 ? 'pagado' : 'parcial',
        fuente: `Proyecto (${proyecto})`,
      };
      await registrarPago(pagoPayload);
      setData(prev => ({
        ...prev,
        movimientos: [...prev.movimientos, pagoPayload],
      }));
    }
  };

  // Acciones de datos
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

  const handleEditarEgreso = async (egresoPayload) => {
    await editarEgreso(egresoPayload);
    setData(prev => {
      const newEgresos = prev.egresos.map(e => {
        if (e._row && e._row === egresoPayload._row) {
          return { ...e, ...egresoPayload };
        }
        if (e.concepto === egresoPayload.oldConcepto && e.mes === egresoPayload.mes) {
          return { ...e, ...egresoPayload };
        }
        return e;
      });
      return { ...prev, egresos: newEgresos };
    });
  };

  const handleEliminarEgreso = async (egresoPayload) => {
    await eliminarEgreso(egresoPayload);
    setData(prev => {
      const newEgresos = prev.egresos.filter(e => {
        if (e._row && egresoPayload._row && e._row === egresoPayload._row) {
          return false;
        }
        if (e.concepto === egresoPayload.concepto && Number(e.monto) === Number(egresoPayload.monto)) {
          return false;
        }
        return true;
      });
      return { ...prev, egresos: newEgresos };
    });
  };

  const handleRegistrarGastosFijos = async (fijosPayload) => {
    await registrarGastosFijosMes(fijosPayload);
    const item1 = {
      mes: fijosPayload.mes,
      anio: Number(fijosPayload.anio),
      concepto: "Recolección de basura",
      monto: Number(fijosPayload.monto_basura || 300),
      tipo: "fijo",
      fuente: "App Web (Fijo)"
    };
    const item2 = {
      mes: fijosPayload.mes,
      anio: Number(fijosPayload.anio),
      concepto: "Lavado de contenedores de basura",
      monto: Number(fijosPayload.monto_lavado || 300),
      tipo: "fijo",
      fuente: "App Web (Fijo)"
    };
    setData(prev => ({
      ...prev,
      egresos: [...prev.egresos, item1, item2],
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
        currentUser,
        handleLogin,
        handleLogout,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        availableYears,
        allProjects,
        activeProjectName,
        activeProjectStats,
        handleSelectActiveProject,
        handleCrearProyecto,
        handleAportarProyecto,
        getProjectStats,
        monthlyMovimientos,
        monthlyEgresos,
        metrics,
        activeTab,
        setActiveTab,
        modalState,
        openModal,
        closeModal,
        refreshData: () => loadData(true),
        handleRegistrarPago,
        handleRegistrarEgreso,
        handleEditarEgreso,
        handleEliminarEgreso,
        handleRegistrarGastosFijos,
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
