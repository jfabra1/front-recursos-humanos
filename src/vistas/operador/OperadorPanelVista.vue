<script setup>
import { computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { PhBuildings, PhPackage, PhSignOut } from "@phosphor-icons/vue";
import BaseInput from "@/componentes/base/BaseInput.vue";
import BaseSelect from "@/componentes/base/BaseSelect.vue";
import BaseBoton from "@/componentes/base/BaseBoton.vue";
import BaseAlerta from "@/componentes/base/BaseAlerta.vue";
import BasePaginacion from "@/componentes/base/BasePaginacion.vue";
import ConmutadorTema from "@/componentes/comunes/ConmutadorTema.vue";
import { useOperadorStore } from "@/stores/operador.store";
import { useOperadorPlanesStore } from "@/stores/operadorPlanes.store";
import { useOperadorEmpresasStore } from "@/stores/operadorEmpresas.store";
import { formatoMoneda } from "@/utils/formato.util";

const operador = useOperadorStore();
const planesStore = useOperadorPlanesStore();
const empresasStore = useOperadorEmpresasStore();
const router = useRouter();

onMounted(() => {
  planesStore.cargarPaginaPlanes();
  planesStore.cargarPlanes();
});

function cerrarSesion() {
  operador.cerrarSesion();
  router.push({ name: "operador-iniciar-sesion" });
}

const opcionesPlanes = computed(() =>
  planesStore.planes.map((plan) => ({ valor: plan._id, texto: `${plan.nombre} — ${formatoMoneda(plan.precio)}/mes` })),
);

const formularioPlan = reactive({ nombre: "", precio: "", maxEmpleados: "", maxSedes: "", maxDispositivos: "" });

async function manejarCrearPlan() {
  const exito = await planesStore.crearPlan({
    nombre: formularioPlan.nombre,
    precio: Number(formularioPlan.precio),
    limitesBase: {
      maxEmpleados: Number(formularioPlan.maxEmpleados),
      maxSedes: Number(formularioPlan.maxSedes),
      maxDispositivos: Number(formularioPlan.maxDispositivos),
    },
  });
  if (exito) Object.assign(formularioPlan, { nombre: "", precio: "", maxEmpleados: "", maxSedes: "", maxDispositivos: "" });
}

const formularioEmpresa = reactive({ nombre: "", nit: "", planId: "", adminEmail: "", adminPassword: "" });

async function manejarCrearEmpresa() {
  const exito = await empresasStore.crearEmpresa({ ...formularioEmpresa });
  if (exito) Object.assign(formularioEmpresa, { nombre: "", nit: "", planId: "", adminEmail: "", adminPassword: "" });
}

const gestionEmpresa = reactive({ empresaId: "", motivo: "" });

async function manejarSuspender() {
  await empresasStore.suspenderEmpresa(gestionEmpresa.empresaId, gestionEmpresa.motivo);
}

async function manejarReactivar() {
  await empresasStore.reactivarEmpresa(gestionEmpresa.empresaId);
}
</script>

<template>
  <div class="min-h-dvh bg-fondo">
    <header class="border-b border-borde px-6 py-5 lg:px-10">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-[0.08em] text-texto-sutil uppercase">Panel de operador</p>
          <h1 class="mt-1 text-xl font-semibold tracking-tight text-texto">{{ operador.operador?.nombre }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <ConmutadorTema />
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-borde-fuerte px-4 py-2 text-sm font-medium text-texto transition-colors hover:bg-fondo-elevado"
            @click="cerrarSesion"
          >
            <PhSignOut class="size-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Planes de suscripción -->
        <section class="rounded-2xl border border-borde bg-fondo-elevado p-6">
          <div class="flex items-center gap-2.5">
            <PhPackage class="size-5 text-acento" weight="bold" />
            <h2 class="text-base font-semibold text-texto">Planes de suscripción</h2>
          </div>

          <div class="mt-4 flex flex-wrap items-end gap-3">
            <BaseInput
              v-model="planesStore.filtros.nombre"
              label="Buscar"
              placeholder="Nombre del plan"
              class="w-56"
              @keyup.enter="planesStore.cargarPaginaPlanes"
            />
            <BaseBoton ancho="auto" variante="secundario" @click="planesStore.cargarPaginaPlanes">Buscar</BaseBoton>
          </div>

          <p v-if="planesStore.cargando" class="mt-4 text-sm text-texto-sutil">Cargando planes…</p>
          <BaseAlerta v-else-if="planesStore.error" tipo="error" class="mt-4">{{ planesStore.error }}</BaseAlerta>
          <p v-else-if="planesStore.planesPagina.length === 0" class="mt-4 text-sm text-texto-sutil">
            Aún no hay planes. Crea el primero abajo.
          </p>
          <ul v-else class="mt-4 flex flex-col divide-y divide-borde">
            <li v-for="plan in planesStore.planesPagina" :key="plan._id" class="flex items-center justify-between gap-4 py-3">
              <div>
                <p class="text-sm font-medium text-texto">{{ plan.nombre }}</p>
                <p class="text-xs text-texto-sutil">
                  {{ plan.limitesBase.maxEmpleados }} empleados · {{ plan.limitesBase.maxSedes }} sedes ·
                  {{ plan.limitesBase.maxDispositivos }} dispositivos
                </p>
              </div>
              <span class="text-sm font-semibold text-texto">{{ formatoMoneda(plan.precio) }}</span>
            </li>
          </ul>

          <BasePaginacion
            v-if="planesStore.paginacionPlanes && planesStore.paginacionPlanes.totalPaginas > 1"
            :paginacion="planesStore.paginacionPlanes"
            @anterior="planesStore.irAPaginaAnteriorPlanes"
            @siguiente="planesStore.irAPaginaSiguientePlanes"
          />

          <form class="mt-6 flex flex-col gap-4 border-t border-borde pt-6" novalidate @submit.prevent="manejarCrearPlan">
            <p class="text-sm font-medium text-texto">Crear plan nuevo</p>
            <BaseAlerta v-if="planesStore.errorCreacion" tipo="error">{{ planesStore.errorCreacion }}</BaseAlerta>
            <BaseInput v-model="formularioPlan.nombre" label="Nombre del plan" placeholder="Pyme" requerido />
            <BaseInput v-model="formularioPlan.precio" type="number" label="Precio mensual (COP)" placeholder="350000" requerido />
            <div class="grid grid-cols-3 gap-3">
              <BaseInput v-model="formularioPlan.maxEmpleados" type="number" label="Máx. empleados" placeholder="50" requerido />
              <BaseInput v-model="formularioPlan.maxSedes" type="number" label="Máx. sedes" placeholder="3" requerido />
              <BaseInput v-model="formularioPlan.maxDispositivos" type="number" label="Máx. dispositivos" placeholder="10" requerido />
            </div>
            <BaseBoton tipo="submit" variante="secundario" :cargando="planesStore.creando">Crear plan</BaseBoton>
          </form>
        </section>

        <!-- Empresas clientes -->
        <section class="rounded-2xl border border-borde bg-fondo-elevado p-6">
          <div class="flex items-center gap-2.5">
            <PhBuildings class="size-5 text-acento" weight="bold" />
            <h2 class="text-base font-semibold text-texto">Empresas clientes</h2>
          </div>

          <form class="mt-5 flex flex-col gap-4" novalidate @submit.prevent="manejarCrearEmpresa">
            <p class="text-sm font-medium text-texto">Dar de alta una empresa</p>
            <BaseAlerta v-if="empresasStore.errorCreacion" tipo="error">{{ empresasStore.errorCreacion }}</BaseAlerta>
            <BaseAlerta v-if="empresasStore.empresaCreada" tipo="exito">
              {{ empresasStore.empresaCreada.empresa.nombre }} creada (slug: {{ empresasStore.empresaCreada.empresa.slug }}).
              Administrador: {{ empresasStore.empresaCreada.administrador.email }}
            </BaseAlerta>

            <BaseInput v-model="formularioEmpresa.nombre" label="Nombre de la empresa" placeholder="Textiles del Valle S.A.S" requerido />
            <BaseInput v-model="formularioEmpresa.nit" label="NIT" placeholder="900123456-7" requerido />
            <BaseSelect
              v-model="formularioEmpresa.planId"
              label="Plan"
              :opciones="opcionesPlanes"
              :placeholder="planesStore.planes.length ? 'Selecciona un plan' : 'Crea un plan primero'"
              requerido
            />
            <BaseInput v-model="formularioEmpresa.adminEmail" type="email" label="Correo del administrador" placeholder="admin@empresa.com" autocomplete="off" requerido />
            <BaseInput
              v-model="formularioEmpresa.adminPassword"
              type="password"
              label="Contraseña inicial del administrador"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
              requerido
            />
            <BaseBoton tipo="submit" :cargando="empresasStore.creando">Crear empresa</BaseBoton>
          </form>

          <div class="mt-6 border-t border-borde pt-6">
            <p class="text-sm font-medium text-texto">Suspender o reactivar</p>
            <p class="mt-1 text-xs text-texto-sutil">
              El backend todavía no expone un listado de empresas: gestiona el estado escribiendo el ID directamente.
            </p>

            <BaseAlerta v-if="empresasStore.errorActualizacion" tipo="error" class="mt-4">{{ empresasStore.errorActualizacion }}</BaseAlerta>
            <BaseAlerta v-if="empresasStore.ultimaActualizacion" tipo="exito" class="mt-4">
              Empresa actualizada. Nuevo estado: {{ empresasStore.ultimaActualizacion.estado }}
            </BaseAlerta>

            <div class="mt-4 flex flex-col gap-4">
              <BaseInput v-model="gestionEmpresa.empresaId" label="ID de la empresa" placeholder="665f1b2c9a1e8e0012ab34cd" requerido />
              <BaseInput v-model="gestionEmpresa.motivo" label="Motivo (opcional, solo para suspender)" placeholder="Mora en el pago" />
              <div class="grid grid-cols-2 gap-3">
                <BaseBoton
                  variante="peligro"
                  :cargando="empresasStore.actualizandoEstado"
                  :deshabilitado="!gestionEmpresa.empresaId"
                  @click="manejarSuspender"
                >
                  Suspender
                </BaseBoton>
                <BaseBoton
                  variante="secundario"
                  :cargando="empresasStore.actualizandoEstado"
                  :deshabilitado="!gestionEmpresa.empresaId"
                  @click="manejarReactivar"
                >
                  Reactivar
                </BaseBoton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
