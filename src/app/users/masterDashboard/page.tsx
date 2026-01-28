"use client";

import { useMemo, useState } from "react";
import { Sparkles, Settings, Activity } from "lucide-react";

const tabs = [
  { id: "guests", label: "Guests", subtitle: "Novas visitas e convites" },
  { id: "students-plan", label: "Alunos S/Plano", subtitle: "Pendências de matrícula" },
  { id: "students", label: "Alunos", subtitle: "Assinaturas ativas" },
  { id: "staff", label: "Staff & Coach", subtitle: "Equipe operacional" },
  { id: "plans", label: "Planos", subtitle: "Status e promoções" },
  { id: "contacts", label: "Contacts", subtitle: "Interações recentes" },
  { id: "system", label: "Sistema", subtitle: "Configurações & alerts" },
] as const;

const tabDetailMap: Record<string, { count: number; items: string[] }> = {
  guests: {
    count: 12,
    items: [
      "Tour guiado agendado para 18h",
      "Feedback recebido pelo WhatsApp",
      "VIP visitando sábado",
    ],
  },
  "students-plan": {
    count: 8,
    items: [
      "Contrato sem assinatura digital",
      "Financeiro aguardando confirmação",
      "Trial expirando em 3 dias",
    ],
  },
  students: {
    count: 183,
    items: [
      "Contratos renovados esta semana",
      "Checklist de recepção revisado",
      "Enquetes de satisfação: 96% positivas",
    ],
  },
  staff: {
    count: 22,
    items: [
      "Coach Mariana focada no HIIT",
      "Staff orientado para eventos",
      "Feedback de liderança enviado",
    ],
  },
  plans: {
    count: 5,
    items: [
      "Plano Intensivo com promo de 20%",
      "Plano Compact 30% ocupação",
      "Novo plano Corporate em preparação",
    ],
  },
  contacts: {
    count: 46,
    items: [
      "Emails respondidos nas últimas 2h",
      "Lead do Instagram esperando follow-up",
      "Hubspot sincronizado com notifications",
    ],
  },
  system: {
    count: 3,
    items: [
      "Deploy agendado para domingo",
      "Backups automáticos OK",
      "Login social: monitorando latência",
    ],
  },
};

const kanbanColumns = [
  {
    name: "Backlog",
    items: [
      { title: "Planejar evento open day", meta: "Equipe comercial" },
      { title: "Revisar campanhas do plano intensivo", meta: "Marketing" },
    ],
  },
  {
    name: "Em andamento",
    items: [
      { title: "Onboarding de novos coaches", meta: "People Ops" },
      { title: "Ajustar trilhas do app de treinos", meta: "Tech" },
    ],
  },
  {
    name: "Finalizado",
    items: [
      { title: "Checklist de abertura matinal", meta: "Operações" },
      { title: "Relatório de retenção de alunos", meta: "Financeiro" },
    ],
  },
];

const highlights = [
  { label: "NPS Mensal", value: "82", description: "Clientes em visita" },
  { label: "Planos ativos", value: "193", description: "Atualizados este mês" },
  { label: "Eventos semanais", value: "4", description: "Experiências premium" },
];

export default function MasterDashboard() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const detail = useMemo(() => tabDetailMap[activeTab], [activeTab]);

  return (
    <section className="relative flex min-h-screen w-full flex-col gap-8 rounded-3xl bg-gradient-to-br from-[#0f0f0f] via-[#120f1d] to-[#1b1b1b] p-6 text-white shadow-[0_30px_80px_rgba(3,13,22,0.6)]">
      <div className="pointer-events-none absolute inset-x-12 bottom-10 h-40 bg-gradient-to-r from-[#bb8b5d]/40 via-[#ffffff]/20 to-[#bb8b5d]/00 blur-3xl opacity-70" />
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.6em] text-[var(--gold-tone)]">
          <Sparkles className="h-4 w-4" /> Master Dashboard
        </p>
        <h1 className="text-4xl font-semibold">Controle do dia a dia</h1>
        <p className="max-w-2xl text-sm text-[var(--muted-foreground)]">
          Uma visão panorâmica delicada e interativa para o Master acompanhar
          eventos, alunos, equipe e o sistema, com toques suaves e animações
          sutis.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 transition hover:border-[var(--gold-tone)] hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
              {item.label}
            </p>
            <p className="text-4xl font-bold">{item.value}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{item.description}</p>
            <div className="pointer-events-none absolute left-4 top-2 h-1 w-12 rounded-full bg-[var(--gold-tone-dark)] opacity-80" />
            <div className="pointer-events-none absolute right-3 bottom-4 h-6 w-6 rounded-full bg-[var(--gold-tone)]/30 blur-3xl" />
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-1 text-xs uppercase tracking-[0.4em] transition ${
                activeTab === tab.id
                  ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone)] shadow-[0_0_30px_rgba(187,139,93,0.3)]"
                  : "border-white/10 text-white/80 hover:border-white/30 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-black/20 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </p>
              <p className="text-lg font-semibold text-white/90">
                {detail.count} alertas conectados
              </p>
            </div>
            <Settings className="h-6 w-6 text-[var(--gold-tone)]" />
          </div>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            {detail.items.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 transition hover:border-[var(--gold-tone)]/50 hover:bg-[var(--gold-tone)]/10"
              >
                <div className="mt-1 h-1 w-1 rounded-full bg-[var(--gold-tone)]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Kanban diário</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {kanbanColumns.map((column) => (
            <article
              key={column.name}
              className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/50"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                  {column.name}
                </p>
                <Activity className="h-4 w-4 text-[var(--gold-tone)]" />
              </div>
              <div className="space-y-3">
                {column.items.map((task) => (
                  <div
                    key={task.title}
                    className="rounded-xl border border-white/5 bg-black/30 p-3 text-sm text-white/80 transition hover:border-[var(--gold-tone)]/50 hover:bg-[#12070d]"
                  >
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-[0.7rem] uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                      {task.meta}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
