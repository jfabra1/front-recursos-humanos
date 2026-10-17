import { createRouter, createWebHistory } from "vue-router";
import { useOperadorStore } from "@/stores/operador.store";
import { useAutenticacionStore } from "@/stores/autenticacion.store";
import { usePermisos } from "@/composables/usePermisos";
import { MODULOS, ACCIONES } from "@/utils/permisos.util";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "inicio",
      component: () => import("@/vistas/marketing/LandingVista.vue"),
    },
    {
      path: "/iniciar-sesion",
      name: "iniciar-sesion",
      component: () => import("@/vistas/autenticacion/IniciarSesionVista.vue"),
      meta: { soloInvitado: true },
    },
    {
      // Pública a propósito (sin requiereAutenticacion): la usa alguien sin cuenta en la
      // plataforma, vía QR/enlace de correo — ver SolicitudFirmaService en el backend.
      path: "/firmar/:empresaSlug/:token",
      name: "firma-publica",
      component: () => import("@/vistas/publico/FirmaPublicaVista.vue"),
    },
    {
      path: "/plataforma/acceso",
      name: "operador-iniciar-sesion",
      component: () => import("@/vistas/operador/OperadorIniciarSesionVista.vue"),
      meta: { soloOperadorInvitado: true },
    },
    {
      path: "/plataforma",
      component: () => import("@/vistas/operador/OperadorShellVista.vue"),
      meta: { requiereOperador: true },
      children: [
        { path: "", name: "operador-panel", component: () => import("@/vistas/operador/OperadorPanelVista.vue") },
        { path: "empresas", name: "operador-empresas", component: () => import("@/vistas/operador/OperadorEmpresasVista.vue") },
        { path: "planes", name: "operador-planes", component: () => import("@/vistas/operador/OperadorPlanesVista.vue") },
        { path: "reglas-legales", name: "operador-reglas-legales", component: () => import("@/vistas/operador/OperadorReglasLegalesVista.vue") },
      ],
    },
    {
      path: "/app",
      component: () => import("@/vistas/app/AppShellVista.vue"),
      meta: { requiereAutenticacion: true },
      children: [
        { path: "", name: "panel-inicio", component: () => import("@/vistas/app/PanelInicioVista.vue") },
        {
          // Autoservicio del propio usuario autenticado: no se gatea con `meta.modulo` porque no
          // depende de un único módulo (cada pestaña interna de la vista lo chequea por su cuenta).
          path: "mi-perfil",
          name: "mi-perfil",
          component: () => import("@/vistas/autogestion/MiPerfilVista.vue"),
        },
        {
          path: "organizacion/sedes",
          name: "sedes-listado",
          component: () => import("@/vistas/organizacion/SedesVista.vue"),
          meta: { modulo: MODULOS.SEDE },
        },
        {
          path: "organizacion/areas",
          name: "areas-listado",
          component: () => import("@/vistas/organizacion/AreasVista.vue"),
          meta: { modulo: MODULOS.AREA },
        },
        {
          path: "organizacion/cargos",
          name: "cargos-listado",
          component: () => import("@/vistas/organizacion/CargosVista.vue"),
          meta: { modulo: MODULOS.CARGO },
        },
        {
          path: "personas/empleados",
          name: "empleados-listado",
          component: () => import("@/vistas/personas/EmpleadosVista.vue"),
          meta: { modulo: MODULOS.EMPLEADO },
        },
        {
          path: "personas/contratos-por-vencer",
          name: "contratos-por-vencer",
          component: () => import("@/vistas/personas/ContratosPorVencerVista.vue"),
          meta: { modulo: MODULOS.CONTRATO },
        },
        {
          path: "instrumentos-colectivos",
          name: "instrumentos-colectivos-listado",
          component: () => import("@/vistas/laboral/InstrumentosColectivosVista.vue"),
          meta: { modulo: MODULOS.INSTRUMENTO_COLECTIVO },
        },
        {
          path: "personas/plantillas-contrato",
          name: "plantillas-contrato-listado",
          component: () => import("@/vistas/personas/PlantillasContratoVista.vue"),
          meta: { modulo: MODULOS.PLANTILLA_CONTRATO },
        },
        {
          path: "personas/cartas-renuncia",
          name: "cartas-renuncia-listado",
          component: () => import("@/vistas/personas/CartasRenunciaVista.vue"),
          meta: { modulo: MODULOS.CARTA_RENUNCIA },
        },
        {
          path: "configuracion/empresa",
          name: "empresa-configuracion",
          component: () => import("@/vistas/configuracion/EmpresaConfiguracionVista.vue"),
          meta: { modulo: MODULOS.EMPRESA },
        },
        {
          path: "roles",
          name: "roles-listado",
          component: () => import("@/vistas/roles/RolesVista.vue"),
          meta: { modulo: MODULOS.ROL },
        },
        {
          path: "usuarios",
          name: "usuarios-listado",
          component: () => import("@/vistas/usuarios/UsuariosVista.vue"),
          meta: { modulo: MODULOS.USUARIO },
        },
        {
          path: "auditoria",
          name: "auditoria-listado",
          component: () => import("@/vistas/auditoria/AuditoriaVista.vue"),
          meta: { modulo: MODULOS.AUDITORIA },
        },
        {
          path: "jornada/horarios",
          name: "horarios-listado",
          component: () => import("@/vistas/jornada/HorariosVista.vue"),
          meta: { modulo: MODULOS.HORARIO },
        },
        {
          path: "jornada/turnos",
          name: "turnos-listado",
          component: () => import("@/vistas/jornada/TurnosVista.vue"),
          meta: { modulo: MODULOS.TURNO },
        },
        {
          path: "jornada/asignaciones-horario",
          name: "asignaciones-horario-listado",
          component: () => import("@/vistas/jornada/AsignacionesHorarioVista.vue"),
          meta: { modulo: MODULOS.TURNO },
        },
        {
          path: "jornada/asistencia",
          name: "asistencia-listado",
          component: () => import("@/vistas/jornada/AsistenciaVista.vue"),
          meta: { modulo: MODULOS.ASISTENCIA },
        },
        {
          path: "jornada/correcciones-marcacion",
          name: "correcciones-marcacion-listado",
          component: () => import("@/vistas/jornada/CorreccionesMarcacionVista.vue"),
          meta: { modulo: MODULOS.INCIDENCIA_ASISTENCIA },
        },
        {
          path: "jornada/incidencias",
          name: "incidencias-asistencia-listado",
          component: () => import("@/vistas/jornada/IncidenciasAsistenciaVista.vue"),
          meta: { modulo: MODULOS.INCIDENCIA_ASISTENCIA },
        },
        {
          path: "jornada/cierres",
          name: "cierres-asistencia-listado",
          component: () => import("@/vistas/jornada/CierresAsistenciaVista.vue"),
          meta: { modulo: MODULOS.CIERRE_ASISTENCIA },
        },
        {
          path: "jornada/horas-extra",
          name: "horas-extra-listado",
          component: () => import("@/vistas/jornada/SolicitudesHoraExtraVista.vue"),
          meta: { modulo: MODULOS.HORA_EXTRA },
        },
        {
          path: "jornada/dispositivos-pendientes",
          name: "dispositivos-pendientes",
          component: () => import("@/vistas/jornada/DispositivosPendientesVista.vue"),
          // GET /pendientes exige EDITAR en el backend, no LEER (ver nota en CONVENCIONES_DESARROLLO_FRONTEND.md)
          meta: { modulo: MODULOS.DISPOSITIVO, accion: ACCIONES.EDITAR },
        },
        {
          path: "ausencias/vacaciones",
          name: "vacaciones-listado",
          component: () => import("@/vistas/ausencias/VacacionesVista.vue"),
          meta: { modulo: MODULOS.VACACION },
        },
        {
          path: "ausencias/permisos",
          name: "permisos-listado",
          component: () => import("@/vistas/ausencias/PermisosVista.vue"),
          meta: { modulo: MODULOS.PERMISO },
        },
        {
          path: "ausencias/incapacidades",
          name: "incapacidades-listado",
          component: () => import("@/vistas/ausencias/IncapacidadesVista.vue"),
          meta: { modulo: MODULOS.INCAPACIDAD },
        },
        {
          path: "notificaciones",
          name: "notificaciones-listado",
          component: () => import("@/vistas/notificaciones/NotificacionesVista.vue"),
          meta: { modulo: MODULOS.NOTIFICACION },
        },
        {
          path: "reportes",
          name: "reportes-listado",
          component: () => import("@/vistas/reportes/ReportesVista.vue"),
          meta: { modulo: MODULOS.REPORTE },
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: { name: "inicio" } },
  ],
});

router.beforeEach(async (hacia) => {
  const operador = useOperadorStore();
  const autenticacion = useAutenticacionStore();

  if (hacia.meta.requiereOperador && !operador.estaAutenticado) {
    return { name: "operador-iniciar-sesion" };
  }
  if (hacia.meta.soloOperadorInvitado && operador.estaAutenticado) {
    return { name: "operador-panel" };
  }

  // El access token de usuario vive solo en memoria: tras un refresh de página se
  // intenta recuperar la sesión con la cookie httpOnly antes de decidir si hay que
  // mandar al login o dejar pasar.
  if ((hacia.meta.requiereAutenticacion || hacia.meta.soloInvitado) && !autenticacion.estaAutenticado) {
    await autenticacion.restaurarSesion();
  }

  if (hacia.meta.requiereAutenticacion && !autenticacion.estaAutenticado) {
    return { name: "iniciar-sesion" };
  }
  if (hacia.meta.soloInvitado && autenticacion.estaAutenticado) {
    return { name: "panel-inicio" };
  }

  // Segunda capa, además de ocultar el enlace en el sidebar: si alguien entra por URL
  // directa a una pantalla que su rol no puede ver, lo mandamos a Inicio en vez de
  // dejarlo llegar a una vista que solo va a mostrar errores 403 de la API.
  if (hacia.meta.modulo) {
    const { puede } = usePermisos();
    if (!puede(hacia.meta.modulo, hacia.meta.accion || ACCIONES.LEER)) {
      return { name: "panel-inicio" };
    }
  }
});

export default router;
