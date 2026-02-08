"use client";

import { useMemo, useState } from "react";
import {
  Users,
  CalendarCheck,
  Wallet,
  Settings,
  ShieldCheck,
  BadgeCheck,
  CreditCard,
  Globe,
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  Power,
} from "lucide-react";

type TabId = "users" | "events" | "financial" | "system";

const tabs: { id: TabId; label: string; description: string; icon: JSX.Element }[] =
  [
    {
      id: "users",
      label: "Gerenciamento de Usuarios",
      description: "Editar dados de todos os usuarios (CPF bloqueado).",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "events",
      label: "Gerenciamento de Eventos",
      description: "Criacao, publicacao, vagas, pagamentos e confirmacoes.",
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      id: "financial",
      label: "Gerenciamento Financeiro",
      description: "Assinaturas, recebiveis, pagamentos e planos.",
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      id: "system",
      label: "Configuracoes do Sistema",
      description: "Operacao, contatos, carrossel e modo manutencao.",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

const mockUsers = [
  {
    id: "u-01",
    name: "Ana Souza",
    email: "ana@jm.com",
    cpf: "12345678901",
    phone: "(21) 99999-1234",
    role: "STUDENT",
    plan: "Plano Intensivo",
    active: true,
  },
  {
    id: "u-02",
    name: "Rafael Lima",
    email: "rafa@jm.com",
    cpf: "98765432100",
    phone: "(21) 98888-2222",
    role: "COACH",
    plan: "Plano Coach",
    active: true,
  },
  {
    id: "u-03",
    name: "Leticia Alves",
    email: "leticia@jm.com",
    cpf: "11122233344",
    phone: "(21) 97777-3030",
    role: "GUEST",
    plan: "Plano Guest",
    active: false,
  },
];

const mockEvents = [
  {
    id: "ev-01",
    title: "Open Day Premium",
    date: "2026-03-12",
    time: "18:30",
    location: "Studio Principal",
    access: "registered_only",
    capacity: 40,
    paid: true,
    price: "R$ 120,00",
    paymentMethod: "PIX",
    allowGuests: true,
    requiresConfirmation: true,
    status: "publicado",
  },
  {
    id: "ev-02",
    title: "Aula Especial HIIT",
    date: "2026-03-20",
    time: "07:00",
    location: "Arena",
    access: "open",
    capacity: null,
    paid: false,
    price: "Gratuito",
    paymentMethod: "-",
    allowGuests: false,
    requiresConfirmation: false,
    status: "rascunho",
  },
];

const mockPayments = [
  { id: "p-01", user: "Carla Mendes", amount: "R$ 120,00", method: "PIX" },
  { id: "p-02", user: "Julio Costa", amount: "R$ 90,00", method: "Cartao" },
];

const mockPlans = [
  { id: "pl-01", name: "Plano Free", price: "R$ 0", active: true },
  { id: "pl-02", name: "Plano Intensivo", price: "R$ 249", active: true },
  { id: "pl-03", name: "Plano Guest", price: "R$ 0", active: true },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users");

  const currentTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTab),
    [activeTab],
  );

  return (
    <section className="relative flex min-h-screen flex-col gap-8 rounded-[32px] border border-white/5 bg-gradient-to-br from-[#0f0f0f] via-[#120f1d] to-[#1b1b1b] p-6 text-white shadow-[0_30px_80px_rgba(3,13,22,0.6)]">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.6em] text-[var(--gold-tone)]">
              <ShieldCheck className="h-4 w-4" /> Dashboard Geral
            </p>
            <h1 className="text-4xl font-semibold">Controle centralizado</h1>
            <p className="max-w-2xl text-sm text-[var(--muted-foreground)]">
              Painel com abas que representam as areas do sistema. Cada aba
              consolida as acoes principais do Master.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
              Status geral
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">100%</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Permissoes Master ativas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.4em] transition ${
                activeTab === tab.id
                  ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone)]"
                  : "border-white/10 text-white/70 hover:border-white/30 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {currentTab && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted-foreground)]">
            {currentTab.description}
          </div>
        )}
      </header>

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Usuarios cadastrados</h2>
            <button className="rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]">
              Novo usuario
            </button>
          </div>

          <div className="grid gap-4">
            {mockUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="grid gap-4 lg:grid-cols-6">
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Nome
                    <input
                      defaultValue={user.name}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Email
                    <input
                      defaultValue={user.email}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    CPF (bloqueado)
                    <input
                      value={user.cpf}
                      disabled
                      className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-sm text-white/40"
                    />
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Telefone
                    <input
                      defaultValue={user.phone}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Perfil
                    <select className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white">
                      {["MASTER", "ADMIN", "STAFF", "COACH", "STUDENT", "GUEST"].map(
                        (role) => (
                          <option key={role} value={role} selected={role === user.role}>
                            {role}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Plano
                    <input
                      defaultValue={user.plan}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Salvar
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                    {user.active ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Eventos cadastrados</h2>
            <button className="rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]">
              Novo evento
            </button>
          </div>
          <div className="grid gap-4">
            {mockEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                      {event.status}
                    </p>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {event.date} • {event.time} • {event.location}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                    {event.paid ? "Pago" : "Gratuito"}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Vagas
                    </p>
                    <p className="mt-1 text-white">
                      {event.capacity ?? "Livre"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Confirmacao
                    </p>
                    <p className="mt-1 text-white">
                      {event.requiresConfirmation ? "Obrigatoria" : "Nao"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Pagamento
                    </p>
                    <p className="mt-1 text-white">{event.price}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Convidados
                    </p>
                    <p className="mt-1 text-white">
                      {event.allowGuests ? "Permitidos" : "Somente alunos"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                    Publicar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Pagamentos pendentes</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {mockPayments.map((payment) => (
                <article
                  key={payment.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                    {payment.method}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {payment.user}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {payment.amount}
                  </p>
                  <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
                    <BadgeCheck className="h-4 w-4" />
                    Confirmar
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Planos (criar/editar)</h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {mockPlans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                    {plan.active ? "Ativo" : "Inativo"}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {plan.name}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {plan.price}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                      <Power className="h-4 w-4" />
                      {plan.active ? "Desativar" : "Ativar"}
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-red-300">
                      <Trash2 className="h-4 w-4" />
                      Apagar
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]">
              <CreditCard className="h-4 w-4" />
              Criar novo plano
            </button>
          </section>
        </div>
      )}

      {activeTab === "system" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <h2 className="text-2xl font-semibold">Modo manutencao</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Ative para bloquear o sistema e exibir uma mensagem personalizada.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                Ativar
              </button>
              <input
                placeholder="Mensagem de manutencao"
                className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                <Clock className="h-4 w-4" /> Horario de operacao
              </div>
              <div className="mt-3 grid gap-3">
                {["Segunda", "Terca", "Quarta", "Quinta", "Sexta"].map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  >
                    <span className="w-24 text-white/70">{day}</span>
                    <input
                      defaultValue="06:00 - 22:00"
                      className="flex-1 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                <Globe className="h-4 w-4" /> Contato e redes
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <input
                  placeholder="Telefone principal"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
                />
                <input
                  placeholder="WhatsApp"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
                />
                <input
                  placeholder="Instagram"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
                />
                <input
                  placeholder="Endereco"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
                />
              </div>
            </article>
          </section>
        </div>
      )}
    </section>
  );
}
