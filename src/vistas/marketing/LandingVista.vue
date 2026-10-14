<script setup>
import { RouterLink } from "vue-router";
import {
  PhArchiveBox,
  PhArrowRight,
  PhChartLineUp,
  PhClockCountdown,
  PhEye,
  PhFileText,
  PhFingerprint,
  PhLockKey,
  PhScales,
  PhUmbrella,
  PhUsersThree,
} from "@phosphor-icons/vue";
import EncabezadoPublico from "@/componentes/comunes/EncabezadoPublico.vue";
import RevelarAlEntrar from "@/componentes/comunes/RevelarAlEntrar.vue";

// TODO: reemplazar por el correo de contacto comercial real antes de publicar.
const correoVentas = "mailto:ventas@sgth.co";

const modulos = [
  { icono: PhFingerprint, titulo: "Asistencia y marcación", descripcion: "Entrada y salida con geocerca y verificación biométrica local: el dato nunca sale del teléfono." },
  { icono: PhClockCountdown, titulo: "Turnos y horarios", descripcion: "Programación por sede, con control de horas extra y jornadas abiertas." },
  { icono: PhUmbrella, titulo: "Vacaciones e incapacidades", descripcion: "Saldos, proporcionalidad y radicación, calculados según la ley vigente en cada fecha." },
  { icono: PhFileText, titulo: "Contratos y documentos", descripcion: "Historial de vinculación por persona, con alertas de vencimiento." },
  { icono: PhUsersThree, titulo: "Roles y permisos", descripcion: "Aprobaciones multinivel: jefe de sede, gerente de área, RRHH." },
  { icono: PhChartLineUp, titulo: "Panel de riesgo laboral", descripcion: "Incidencias, vencimientos y saldos en una sola vista ejecutiva." },
];

const puntosConfianza = [
  { icono: PhScales, texto: "Reglas de jornada, recargos y vacaciones versionadas por vigencia legal, nunca hardcodeadas." },
  { icono: PhArchiveBox, texto: "Las marcaciones de asistencia son inmutables: toda corrección queda registrada junto al dato original." },
  { icono: PhEye, texto: "Portal de transparencia: cada empleado ve qué datos propios se almacenan y por cuánto tiempo." },
  { icono: PhLockKey, texto: "Aislamiento estricto de datos entre empresas, incluso dentro de la misma plataforma." },
];
</script>

<template>
  <div class="relative overflow-hidden bg-fondo">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-[-16rem] right-[-10rem] size-[620px] rounded-full bg-acento/20 blur-3xl"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-[55rem] left-[-16rem] size-[520px] rounded-full bg-acento/10 blur-3xl"
    />

    <div class="relative">
      <EncabezadoPublico />

      <main>
        <!-- Hero + módulos: una sola composición, no "hero" y "features" como bloques separados -->
        <section class="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:px-12 lg:pt-28">
          <div class="grid gap-16 lg:grid-cols-[1.3fr_0.85fr] lg:items-start lg:gap-12">
            <div>
              <RevelarAlEntrar>
                <h1 class="max-w-xl text-[2.75rem] leading-[1.05] font-semibold tracking-[-0.02em] text-texto text-balance sm:text-6xl lg:text-[4.25rem]">
                  Talento humano, <span class="text-acento">sin fricción</span>
                </h1>
              </RevelarAlEntrar>
              <RevelarAlEntrar :retraso="80">
                <p class="mt-6 max-w-md text-lg leading-relaxed text-texto-sutil">
                  Asistencia, turnos, vacaciones e incapacidades de tu empresa multi-sede, con las reglas laborales de Colombia siempre
                  vigentes.
                </p>
              </RevelarAlEntrar>
              <RevelarAlEntrar :retraso="160">
                <div class="mt-9 flex flex-wrap items-center gap-4">
                  <RouterLink
                    :to="{ name: 'iniciar-sesion' }"
                    class="group inline-flex items-center gap-2 rounded-xl bg-acento px-5 py-3 text-sm font-medium text-acento-texto shadow-[var(--sombra-panel)] transition-[background-color,transform] duration-150 hover:bg-acento-hover active:scale-[0.98]"
                  >
                    Iniciar sesión
                    <PhArrowRight class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" weight="bold" />
                  </RouterLink>
                  <a
                    :href="correoVentas"
                    class="inline-flex items-center justify-center rounded-xl border border-borde-fuerte px-5 py-3 text-sm font-medium text-texto transition-colors duration-150 hover:bg-fondo-elevado"
                  >
                    Agendar una demo
                  </a>
                </div>
              </RevelarAlEntrar>
            </div>

            <div id="modulos" class="lg:pt-3">
              <RevelarAlEntrar :retraso="120">
                <p class="text-xs font-semibold tracking-[0.08em] text-texto-sutil uppercase">Qué incluye</p>
              </RevelarAlEntrar>
              <ul class="mt-5 flex flex-col divide-y divide-borde">
                <RevelarAlEntrar v-for="(modulo, indice) in modulos" :key="modulo.titulo" :retraso="160 + indice * 60">
                  <li class="group flex items-start gap-4 py-4">
                    <span class="pt-0.5 font-mono text-xs text-texto-sutil/50 tabular-nums">{{ String(indice + 1).padStart(2, "0") }}</span>
                    <component :is="modulo.icono" class="mt-0.5 size-[18px] shrink-0 text-acento" weight="bold" />
                    <div>
                      <h3 class="text-[15px] font-semibold text-texto">{{ modulo.titulo }}</h3>
                      <p class="mt-1 text-sm leading-relaxed text-texto-sutil">{{ modulo.descripcion }}</p>
                    </div>
                  </li>
                </RevelarAlEntrar>
              </ul>
            </div>
          </div>
        </section>

        <!-- Cumplimiento legal: declaración editorial, no grid de "benefits" -->
        <section id="cumplimiento" class="mx-auto max-w-4xl px-6 py-20 lg:px-12">
          <RevelarAlEntrar>
            <p class="text-2xl leading-snug font-medium text-texto text-balance sm:text-3xl">
              Cumplimiento laboral <span class="text-acento">vivo</span>, no un parche anual. Las reglas de jornada, recargos y
              vacaciones se actualizan por vigencia legal dentro del sistema, sin esperar un cambio de versión.
            </p>
          </RevelarAlEntrar>

          <ul class="mt-14 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <RevelarAlEntrar v-for="(punto, indice) in puntosConfianza" :key="punto.texto" :retraso="indice * 80">
              <li class="flex items-start gap-3">
                <component :is="punto.icono" class="mt-0.5 size-[18px] shrink-0 text-acento" weight="bold" />
                <span class="text-sm leading-relaxed text-texto-sutil">{{ punto.texto }}</span>
              </li>
            </RevelarAlEntrar>
          </ul>
        </section>
      </main>

      <!-- Cierre: CTA de planes integrado al footer, no una caja de CTA aislada -->
      <footer id="planes" class="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <RevelarAlEntrar>
          <div class="flex flex-col gap-12 border-t border-borde pt-14 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-md">
              <h2 class="text-3xl font-semibold tracking-tight text-texto text-balance">Planes a la medida de tu empresa</h2>
              <p class="mt-3 text-base leading-relaxed text-texto-sutil">
                El número de empleados, sedes y dispositivos varía mucho entre empresas medianas y grandes. Conversemos sobre tu caso y
                te proponemos un plan ajustado, sin pagar por lo que no necesitas.
              </p>
              <a
                :href="correoVentas"
                class="mt-7 inline-flex items-center gap-2 rounded-xl bg-acento px-5 py-3 text-sm font-medium text-acento-texto shadow-[var(--sombra-panel)] transition-[background-color,transform] duration-150 hover:bg-acento-hover active:scale-[0.98]"
              >
                Hablar con ventas
                <PhArrowRight class="size-4" weight="bold" />
              </a>
            </div>

            <div class="flex flex-col items-start gap-4 lg:items-end">
              <div class="flex items-center gap-2.5">
                <span class="flex size-7 items-center justify-center rounded-[8px] bg-acento text-sm font-bold text-acento-texto" aria-hidden="true">S</span>
                <span class="text-sm font-semibold tracking-tight text-texto">SGTH</span>
              </div>
              <div class="flex items-center gap-5 text-sm text-texto-sutil">
                <span>© {{ new Date().getFullYear() }} SGTH SaaS</span>
                <RouterLink :to="{ name: 'operador-iniciar-sesion' }" class="text-texto-sutil/70 transition-colors hover:text-texto-sutil">
                  Acceso operador
                </RouterLink>
              </div>
            </div>
          </div>
        </RevelarAlEntrar>
      </footer>
    </div>
  </div>
</template>
