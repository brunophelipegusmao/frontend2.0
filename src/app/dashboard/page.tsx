"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Users,
  CalendarCheck,
  Wallet,
  Settings,
  BadgeCheck,
  Globe,
  Clock,
  CheckCircle2,
  LogOut,
  Pencil,
  MessageCircle,
  Stethoscope,
  Menu,
} from "lucide-react";

type TabId = "users" | "events" | "financial" | "admin" | "system";

type SystemSectionId = "studio" | "system" | "homepage";
type SystemDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
type SystemOperatingHour = {
  day: SystemDay;
  start: string;
  end: string;
};
type SystemSettingsApiRecord = {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  operatingHours: Array<{
    day: string;
    segments: Array<{
      start: string;
      end: string;
    }>;
  }>;
  contact: {
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    phone: string | null;
    whatsappLink: string | null;
  };
  socialLinks: Record<string, string | null>;
  carouselImages: Array<{
    imageUrl: string;
    altText?: string | null;
  }>;
};
type SystemSettingsForm = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  operatingHours: SystemOperatingHour[];
  contact: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    whatsappLink: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    youtube: string;
    tiktok: string;
    other: string;
  };
  carouselImages: Array<{
    imageUrl: string;
    altText: string;
  }>;
};

const tabs: { id: TabId; label: string; description: string; icon: ReactNode }[] =
  [
    {
      id: "users",
      label: "Gerenciamento de Usuarios",
      description: "Editar dados de todos os usuários.",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "events",
      label: "Gerenciamento de Eventos",
      description: "Criação, publicação, vagas, pagamentos e confirmações.",
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      id: "financial",
      label: "Gerenciamento Financeiro",
      description: "Assinaturas, recebíveis, pagamentos e planos.",
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      id: "admin",
      label: "Administrativo",
      description: "Relatórios e indicadores estratégicos.",
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    {
      id: "system",
      label: "Configurações do Sistema",
      description: "Operação, contatos, carrossel e modo manutenção.",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

const systemSections: Array<{
  id: SystemSectionId;
  label: string;
  description: string;
}> = [
  {
    id: "studio",
    label: "Studio",
    description: "Horarios, contatos e redes sociais.",
  },
  {
    id: "system",
    label: "Sistema",
    description: "Modo manutencao e mensagem de indisponibilidade.",
  },
  {
    id: "homepage",
    label: "Homepage",
    description: "Carrossel da home com imagem e texto opcional.",
  },
];

const systemDays: SystemDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const systemDayLabel: Record<SystemDay, string> = {
  monday: "Segunda",
  tuesday: "Terca",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sabado",
  sunday: "Domingo",
};

const systemDefaultHourByDay: Record<
  SystemDay,
  {
    start: string;
    end: string;
  }
> = {
  monday: { start: "06:00", end: "22:00" },
  tuesday: { start: "06:00", end: "22:00" },
  wednesday: { start: "06:00", end: "22:00" },
  thursday: { start: "06:00", end: "22:00" },
  friday: { start: "06:00", end: "22:00" },
  saturday: { start: "08:00", end: "18:00" },
  sunday: { start: "08:00", end: "14:00" },
};

const createDefaultSystemSettingsForm = (): SystemSettingsForm => ({
  maintenanceMode: false,
  maintenanceMessage: "",
  operatingHours: systemDays.map((day) => ({
    day,
    start: systemDefaultHourByDay[day].start,
    end: systemDefaultHourByDay[day].end,
  })),
  contact: {
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    whatsappLink: "",
  },
  socialLinks: {
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    other: "",
  },
  carouselImages: [],
});

type EventItem = {
  id: string;
  title: string;
  thumbnailUrl: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  hideLocation: boolean;
  access: "open" | "registered_only";
  capacity: number | null;
  confirmedRegistrations: number;
  paid: boolean;
  price: string;
  priceCents: number | null;
  paymentMethod: string;
  allowGuests: boolean;
  requiresConfirmation: boolean;
  isFeatured: boolean;
  status: "rascunho" | "publicado" | "cancelado";
};

type EventApiRecord = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string | null;
  location: string;
  hideLocation: boolean;
  accessMode: "open" | "registered_only";
  capacity: number | null;
  confirmedRegistrations?: number;
  allowGuests: boolean;
  requiresConfirmation: boolean;
  isPaid: boolean;
  priceCents: number | null;
  paymentMethod: string | null;
  thumbnailUrl: string | null;
  isFeatured?: boolean;
  status: "draft" | "published" | "cancelled";
  isPublished?: boolean;
};

type EventRegistrationApiRecord = {
  id: string;
  status: "confirmed" | "cancelled" | "waitlisted" | "pending";
  userId: string | null;
  name: string | null;
  email: string | null;
  userName?: string | null;
  userEmail?: string | null;
  confirmedByUserId: string | null;
  paymentMethod: string | null;
  paymentAmountCents: number | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

type FinancialSubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "finished";
type FinancialReceivableStatus =
  | "open"
  | "paid"
  | "overdue"
  | "cancelled"
  | "renegotiated";
type FinancialReceivableKind = "regular" | "prorated" | "adjustment";
type FinancialPaymentMethod = "pix" | "card" | "cash" | "transfer" | "other";
type FinancialExpenseStatus = "planned" | "approved" | "paid" | "cancelled";
type FinancialExpenseCategory =
  | "rent"
  | "payroll"
  | "utilities"
  | "marketing"
  | "software"
  | "equipment"
  | "maintenance"
  | "taxes"
  | "other";

type FinancialDashboardApiRecord = {
  competence: string;
  receivablesCents: number;
  receivedCents: number;
  expensesCents: number;
};

type FinancialSubscriptionApiRecord = {
  id: string;
  userId: string;
  planId: string;
  status: FinancialSubscriptionStatus;
  dueDateMode: "fixed_day" | "custom_date";
  billingDay: number | null;
  customDueDay: number | null;
  customDueDate: string | null;
  startsAt: string;
  endsAt: string | null;
  monthlyAmountCentsSnapshot: number;
  prorationMode: "first_month_prorated" | "none" | "full_first_month";
  prorationBase: "calendar_month" | "30_days";
  planNameSnapshot: string;
  planSlugSnapshot: string;
  planPriceCentsSnapshot: number;
  planPromoPriceCentsSnapshot: number | null;
  notes: string | null;
};

type FinancialReceivableApiRecord = {
  id: string;
  userId: string;
  subscriptionId: string;
  competence: string;
  dueDate: string;
  amountCents: number;
  status: FinancialReceivableStatus;
  kind: FinancialReceivableKind;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidTotal: number;
};

type FinancialExpenseTemplateApiRecord = {
  id: string;
  name: string;
  category: FinancialExpenseCategory;
  defaultAmountCents: number;
  billingDay: number;
  active: boolean;
  notes: string | null;
};

type FinancialExpenseApiRecord = {
  id: string;
  templateId: string | null;
  category: FinancialExpenseCategory;
  description: string;
  competence: string;
  dueDate: string;
  amountCents: number;
  status: FinancialExpenseStatus;
  paidAt: string | null;
  notes: string | null;
};

type FinancialSubscriptionForm = {
  userId: string;
  planId: string;
  startsAt: string;
  dueDateMode: "fixed_day" | "custom_date";
  billingDay: string;
  customDueDay: string;
  customDueDate: string;
  replaceActive: boolean;
  notes: string;
};

type FinancialExpenseTemplateForm = {
  name: string;
  category: FinancialExpenseCategory;
  defaultAmount: string;
  billingDay: string;
  active: boolean;
  notes: string;
};

type FinancialExpenseForm = {
  templateId: string;
  category: FinancialExpenseCategory;
  description: string;
  dueDate: string;
  amount: string;
  status: FinancialExpenseStatus;
  notes: string;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  cpf: string | null;
  phone: string | null;
  role: "MASTER" | "ADMIN" | "STAFF" | "COACH" | "STUDENT" | "GUEST";
  active: boolean;
  planId: string | null;
  planName?: string | null;
  planSlug?: string | null;
  address: string | null;
  image: string | null;
  avatarUrl: string | null;
  birthDate?: string | null;
};

type CheckinRecord = {
  id: number;
  checkedInAt: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

const roleLabelMap: Record<AdminUser["role"], string> = {
  MASTER: "Administrador (Master)",
  ADMIN: "Administrador",
  STAFF: "Equipe",
  COACH: "Coach",
  STUDENT: "Aluno",
  GUEST: "Convidado",
};

const filterOptions = [
  { value: "ALL" as const, label: "Todos" },
  { value: "ADMIN" as const, label: "Administrador" },
  { value: "STAFF" as const, label: "Equipe" },
  { value: "COACH" as const, label: "Coach" },
  { value: "STUDENT" as const, label: "Aluno" },
  { value: "GUEST" as const, label: "Convidado" },
] as const;

type HealthProfile = {
  heightCm?: string | number | null;
  weightKg?: string | number | null;
  bloodType?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  injuries?: string | null;
  skinfoldChest?: string | number | null;
  skinfoldAbdomen?: string | number | null;
  skinfoldThigh?: string | number | null;
  skinfoldTriceps?: string | number | null;
  skinfoldSubscapular?: string | number | null;
  skinfoldSuprailiac?: string | number | null;
  skinfoldMidaxillary?: string | number | null;
  takesMedication?: boolean | null;
  medications?: string | null;
  exercisesRegularly?: boolean | null;
  usesSupplementation?: boolean | null;
  supplements?: string | null;
  dailyRoutine?: string | null;
  foodRoutine?: string | null;
  notesPublic?: string | null;
  notesPrivate?: string | null;
};

type BodyCompositionResult = {
  protocol: "pollock-3-siri";
  sex: "MALE" | "FEMALE";
  age: number;
  weightKg: number;
  bmi?: number;
  bmiCategory?: string;
  sumSkinfoldsMm: number;
  bodyDensity: number;
  bodyFatPct: number;
  fatMassKg: number;
  leanMassKg: number;
  goal?: {
    goalBodyFatPct: number;
    targetBodyWeightKg: number;
    excessWeightKg: number;
    kcalToGoal: number;
  };
};

type HealthForm = {
  heightCm: string;
  weightKg: string;
  bloodType: string;
  sex: string;
  birthDate: string;
  injuries: string;
  skinfoldChest: string;
  skinfoldAbdomen: string;
  skinfoldThigh: string;
  skinfoldTriceps: string;
  skinfoldSubscapular: string;
  skinfoldSuprailiac: string;
  skinfoldMidaxillary: string;
  takesMedication: boolean;
  medications: string;
  exercisesRegularly: boolean;
  usesSupplementation: boolean;
  supplements: string;
  dailyRoutine: string;
  foodRoutine: string;
  notesPublic: string;
  notesPrivate: string;
};

type PlanOption = {
  id: string;
  name: string;
  slug?: string | null;
  active?: boolean | null;
  priceCents?: number | null;
};

const emptyHealthForm: HealthForm = {
  heightCm: "",
  weightKg: "",
  bloodType: "",
  sex: "",
  birthDate: "",
  injuries: "",
  skinfoldChest: "",
  skinfoldAbdomen: "",
  skinfoldThigh: "",
  skinfoldTriceps: "",
  skinfoldSubscapular: "",
  skinfoldSuprailiac: "",
  skinfoldMidaxillary: "",
  takesMedication: false,
  medications: "",
  exercisesRegularly: false,
  usesSupplementation: false,
  supplements: "",
  dailyRoutine: "",
  foodRoutine: "",
  notesPublic: "",
  notesPrivate: "",
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type AuthenticatedUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
};

const parseApiError = async (response: Response, fallback: string) => {
  try {
    const data = (await response.json()) as {
      message?: string | string[];
      error?: string;
      errors?: {
        fieldErrors?: Record<string, string[] | undefined>;
        formErrors?: string[];
      };
    };
    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }
    if (Array.isArray(data?.errors?.formErrors) && data.errors.formErrors.length) {
      return data.errors.formErrors[0];
    }
    if (data?.errors?.fieldErrors) {
      const firstField = Object.entries(data.errors.fieldErrors).find(
        ([, messages]) => Array.isArray(messages) && messages.length > 0,
      );
      if (firstField) {
        const [fieldName, messages] = firstField;
        return `${fieldName}: ${messages?.[0] ?? "valor inválido"}`;
      }
    }
    return data?.message || data?.error || fallback;
  } catch {
    return fallback;
  }
};

const isSystemDay = (value: string): value is SystemDay =>
  systemDays.includes(value as SystemDay);

const mapSystemSettingsToForm = (
  payload: SystemSettingsApiRecord,
): SystemSettingsForm => {
  const scheduleByDay = new Map<SystemDay, { start: string; end: string }>();
  payload.operatingHours.forEach((entry) => {
    if (!isSystemDay(entry.day)) {
      return;
    }
    const firstSegment = Array.isArray(entry.segments) ? entry.segments[0] : null;
    if (!firstSegment?.start || !firstSegment?.end) {
      return;
    }
    scheduleByDay.set(entry.day, {
      start: firstSegment.start,
      end: firstSegment.end,
    });
  });

  return {
    maintenanceMode: payload.maintenanceMode,
    maintenanceMessage: payload.maintenanceMessage ?? "",
    operatingHours: systemDays.map((day) => ({
      day,
      start: scheduleByDay.get(day)?.start ?? systemDefaultHourByDay[day].start,
      end: scheduleByDay.get(day)?.end ?? systemDefaultHourByDay[day].end,
    })),
    contact: {
      address: payload.contact?.address ?? "",
      city: payload.contact?.city ?? "",
      state: payload.contact?.state ?? "",
      zipCode: payload.contact?.zipCode ?? "",
      phone: payload.contact?.phone ?? "",
      whatsappLink: payload.contact?.whatsappLink ?? "",
    },
    socialLinks: {
      instagram: payload.socialLinks?.instagram ?? "",
      facebook: payload.socialLinks?.facebook ?? "",
      youtube: payload.socialLinks?.youtube ?? "",
      tiktok: payload.socialLinks?.tiktok ?? "",
      other: payload.socialLinks?.other ?? "",
    },
    carouselImages: Array.isArray(payload.carouselImages)
      ? payload.carouselImages.slice(0, 5).map((image) => ({
          imageUrl: image.imageUrl ?? "",
          altText: image.altText ?? "",
        }))
      : [],
  };
};

const EVENT_STATUS_LABEL_MAP: Record<EventApiRecord["status"], EventItem["status"]> = {
  draft: "rascunho",
  published: "publicado",
  cancelled: "cancelado",
};

const REGISTRATION_STATUS_LABEL_MAP: Record<
  EventRegistrationApiRecord["status"],
  string
> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  waitlisted: "Lista de espera",
  cancelled: "Cancelado",
};

const FINANCIAL_PAYMENT_METHOD_LABEL_MAP: Record<FinancialPaymentMethod, string> = {
  pix: "PIX",
  card: "Cartao",
  cash: "Dinheiro",
  transfer: "Transferencia",
  other: "Outro",
};

const FINANCIAL_SUBSCRIPTION_STATUS_LABEL_MAP: Record<
  FinancialSubscriptionStatus,
  string
> = {
  active: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
  finished: "Finalizada",
};

const FINANCIAL_RECEIVABLE_STATUS_LABEL_MAP: Record<
  FinancialReceivableStatus,
  string
> = {
  open: "Aberto",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
  renegotiated: "Renegociado",
};

const FINANCIAL_EXPENSE_STATUS_LABEL_MAP: Record<FinancialExpenseStatus, string> = {
  planned: "Planejada",
  approved: "Aprovada",
  paid: "Paga",
  cancelled: "Cancelada",
};

const FINANCIAL_EXPENSE_CATEGORY_LABEL_MAP: Record<
  FinancialExpenseCategory,
  string
> = {
  rent: "Aluguel",
  payroll: "Folha",
  utilities: "Utilidades",
  marketing: "Marketing",
  software: "Software",
  equipment: "Equipamentos",
  maintenance: "Manutencao",
  taxes: "Impostos",
  other: "Outros",
};

const FINANCIAL_EXPENSE_CATEGORY_OPTIONS: FinancialExpenseCategory[] = [
  "rent",
  "payroll",
  "utilities",
  "marketing",
  "software",
  "equipment",
  "maintenance",
  "taxes",
  "other",
];

const FINANCIAL_PAYMENT_METHOD_OPTIONS: FinancialPaymentMethod[] = [
  "pix",
  "card",
  "cash",
  "transfer",
  "other",
];

const FINANCIAL_SUBSCRIPTION_STATUS_OPTIONS: FinancialSubscriptionStatus[] = [
  "active",
  "paused",
  "cancelled",
  "finished",
];

const FINANCIAL_EXPENSE_STATUS_OPTIONS: FinancialExpenseStatus[] = [
  "planned",
  "approved",
  "paid",
  "cancelled",
];

const toMonthValue = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const toCompetenceDateValue = (monthValue: string) => {
  const normalized = monthValue.trim();
  if (!/^\d{4}-\d{2}$/.test(normalized)) {
    return `${toMonthValue(new Date())}-01`;
  }
  return `${normalized}-01`;
};

const formatDatePtBr = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  const raw = value.includes("T") ? value : `${value}T00:00:00`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(parsed);
};

const formatDateTimePtBr = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
};

const getReceivableOutstandingCents = (
  receivable: Pick<FinancialReceivableApiRecord, "amountCents" | "paidTotal">,
) =>
  Math.max(
    0,
    Number(receivable.amountCents ?? 0) - Number(receivable.paidTotal ?? 0),
  );

const mapApiStatusToUiStatus = (status: EventApiRecord["status"]) =>
  EVENT_STATUS_LABEL_MAP[status] ?? "rascunho";

const formatEventPrice = (isPaid: boolean, priceCents?: number | null) => {
  if (!isPaid) {
    return "Gratuito";
  }
  if (!priceCents || priceCents < 1) {
    return "Pago";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
};

const mapApiEventToItem = (event: EventApiRecord): EventItem => ({
  id: event.id,
  title: event.title,
  thumbnailUrl: event.thumbnailUrl ?? "",
  description: event.description,
  date: event.date,
  time: event.time,
  endTime: event.endTime ?? "",
  location: event.location,
  hideLocation: event.hideLocation,
  access: event.accessMode,
  capacity: event.capacity,
  confirmedRegistrations: Number(event.confirmedRegistrations ?? 0),
  paid: event.isPaid,
  price: formatEventPrice(event.isPaid, event.priceCents),
  priceCents: event.priceCents,
  paymentMethod: event.isPaid ? event.paymentMethod ?? "-" : "-",
  allowGuests: event.allowGuests,
  requiresConfirmation: event.requiresConfirmation,
  isFeatured: event.isFeatured === true,
  status: mapApiStatusToUiStatus(event.status),
});

const formatCurrencyFromCents = (value?: number | null) => {
  if (!value || value < 1) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
};

const parseReaisToCents = (value: string) => {
  const cleaned = value.trim().replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  if (!cleaned) {
    return null;
  }
  const normalized =
    cleaned.includes(",") && cleaned.includes(".")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.includes(",")
        ? cleaned.replace(",", ".")
        : cleaned;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed * 100);
};

const toLocalDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toCheckinDateKey = (value?: string | Date | null) => {
  if (!value) {
    return "";
  }
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return toLocalDateKey(parsed);
};

const parseBirthDateForAge = (value: string) => {
  const normalized = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  const isValidDate =
    !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;
  if (!isValidDate) {
    return null;
  }

  return parsed;
};

const calculateAgeFromBirthDate = (value: string) => {
  const birthDate = parseBirthDateForAge(value);
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hadBirthdayThisYear) {
    age -= 1;
  }

  if (age < 0 || age > 130) {
    return null;
  }
  return age;
};

const formatCheckinDateTime = (value: string | Date) => {
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return "Data invalida";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const toFormValue = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const parsePositive = (value: string) => {
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const parseNonNegative = (value: string) => {
  const parsed = Number(value.trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
};

const normalizeHeightCm = (value: string) => {
  const parsed = parsePositive(value);
  if (parsed === null) {
    return null;
  }
  if (parsed > 0 && parsed < 3.5) {
    return parsed * 100;
  }
  return parsed;
};

const bmiCategoryFromAdult = (bmi: number) => {
  if (bmi < 18.5) return "Baixo peso";
  if (bmi < 25) return "Peso adequado (eutrofia)";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidade grau I";
  if (bmi < 40) return "Obesidade grau II";
  return "Obesidade grau III (obesidade grave/mórbida)";
};

const formatNumber = (value?: number | null, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return value.toFixed(digits);
};

const mapHealthToForm = (profile?: HealthProfile | null): HealthForm => ({
  heightCm: toFormValue(profile?.heightCm),
  weightKg: toFormValue(profile?.weightKg),
  bloodType: profile?.bloodType ?? "",
  sex: profile?.sex ?? "",
  birthDate: profile?.birthDate ?? "",
  injuries: profile?.injuries ?? "",
  skinfoldChest: toFormValue(profile?.skinfoldChest),
  skinfoldAbdomen: toFormValue(profile?.skinfoldAbdomen),
  skinfoldThigh: toFormValue(profile?.skinfoldThigh),
  skinfoldTriceps: toFormValue(profile?.skinfoldTriceps),
  skinfoldSubscapular: toFormValue(profile?.skinfoldSubscapular),
  skinfoldSuprailiac: toFormValue(profile?.skinfoldSuprailiac),
  skinfoldMidaxillary: toFormValue(profile?.skinfoldMidaxillary),
  takesMedication: profile?.takesMedication ?? false,
  medications: profile?.medications ?? "",
  exercisesRegularly: profile?.exercisesRegularly ?? false,
  usesSupplementation: profile?.usesSupplementation ?? false,
  supplements: profile?.supplements ?? "",
  dailyRoutine: profile?.dailyRoutine ?? "",
  foodRoutine: profile?.foodRoutine ?? "",
  notesPublic: profile?.notesPublic ?? "",
  notesPrivate: profile?.notesPrivate ?? "",
});

const getInitials = (value: string) => {
  const clean = value.trim();
  if (!clean) {
    return "JM";
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const [isTabMenuOpen, setIsTabMenuOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersStatus, setUsersStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [usersError, setUsersError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [plansStatus, setPlansStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [plansError, setPlansError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsStatus, setEventsStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [checkinUser, setCheckinUser] = useState<AdminUser | null>(null);
  const [checkinHistoryByUser, setCheckinHistoryByUser] = useState<
    Record<string, CheckinRecord[]>
  >({});
  const [checkinSelectedDate, setCheckinSelectedDate] = useState<string | null>(
    null,
  );
  const [checkinHistoryStatus, setCheckinHistoryStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [checkinHistoryError, setCheckinHistoryError] = useState<string | null>(
    null,
  );
  const [checkinMonth, setCheckinMonth] = useState<Date>(() => new Date());
  const [eventMonth, setEventMonth] = useState<Date>(() => new Date());
  const [selectedEventDate, setSelectedEventDate] = useState<string | null>(
    null,
  );
  const [managedEvent, setManagedEvent] = useState<EventItem | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<
    EventRegistrationApiRecord[]
  >([]);
  const [eventRegistrationsStatus, setEventRegistrationsStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [eventRegistrationsError, setEventRegistrationsError] = useState<
    string | null
  >(null);
  const [confirmingPaymentRegistrationId, setConfirmingPaymentRegistrationId] =
    useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventStatus, setEditingEventStatus] =
    useState<EventItem["status"] | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    hideLocation: false,
    accessMode: "registered_only" as "open" | "registered_only",
    capacity: "",
    allowGuests: true,
    requiresConfirmation: false,
    isPaid: false,
    priceCents: "",
    paymentMethod: "",
    isFeatured: false,
    publish: false,
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [isCancellingEvent, setIsCancellingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [eventFilter, setEventFilter] = useState<
    "FUTUROS" | "CANCELADOS" | "REALIZADOS"
  >("FUTUROS");
  const [financialCompetenceMonth, setFinancialCompetenceMonth] = useState(
    () => toMonthValue(new Date()),
  );
  const [financialStatus, setFinancialStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [financialError, setFinancialError] = useState<string | null>(null);
  const [financialDashboard, setFinancialDashboard] =
    useState<FinancialDashboardApiRecord | null>(null);
  const [financialSubscriptions, setFinancialSubscriptions] = useState<
    FinancialSubscriptionApiRecord[]
  >([]);
  const [financialReceivables, setFinancialReceivables] = useState<
    FinancialReceivableApiRecord[]
  >([]);
  const [financialExpenseTemplates, setFinancialExpenseTemplates] = useState<
    FinancialExpenseTemplateApiRecord[]
  >([]);
  const [financialExpenses, setFinancialExpenses] = useState<
    FinancialExpenseApiRecord[]
  >([]);
  const [isGeneratingReceivables, setIsGeneratingReceivables] = useState(false);
  const [isGeneratingExpenses, setIsGeneratingExpenses] = useState(false);
  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [updatingSubscriptionId, setUpdatingSubscriptionId] = useState<
    string | null
  >(null);
  const [isSavingPaymentId, setIsSavingPaymentId] = useState<string | null>(
    null,
  );
  const [isSavingExpenseTemplate, setIsSavingExpenseTemplate] = useState(false);
  const [updatingExpenseTemplateId, setUpdatingExpenseTemplateId] = useState<
    string | null
  >(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [updatingExpenseId, setUpdatingExpenseId] = useState<string | null>(
    null,
  );
  const [financialSubscriptionStatusFilter, setFinancialSubscriptionStatusFilter] =
    useState<FinancialSubscriptionStatus | "all">("all");
  const [financialReceivableStatusFilter, setFinancialReceivableStatusFilter] =
    useState<FinancialReceivableStatus | "all">("all");
  const [financialExpenseStatusFilter, setFinancialExpenseStatusFilter] =
    useState<FinancialExpenseStatus | "all">("all");
  const [financialSubscriptionForm, setFinancialSubscriptionForm] =
    useState<FinancialSubscriptionForm>({
      userId: "",
      planId: "",
      startsAt: "",
      dueDateMode: "fixed_day",
      billingDay: "5",
      customDueDay: "",
      customDueDate: "",
      replaceActive: true,
      notes: "",
    });
  const [paymentDraftsByReceivable, setPaymentDraftsByReceivable] = useState<
    Record<
      string,
      {
        amount: string;
        method: FinancialPaymentMethod;
        notes: string;
      }
    >
  >({});
  const [financialExpenseTemplateForm, setFinancialExpenseTemplateForm] =
    useState<FinancialExpenseTemplateForm>({
      name: "",
      category: "other",
      defaultAmount: "",
      billingDay: "5",
      active: true,
      notes: "",
    });
  const [financialExpenseForm, setFinancialExpenseForm] =
    useState<FinancialExpenseForm>({
      templateId: "",
      category: "other",
      description: "",
      dueDate: toLocalDateKey(new Date()),
      amount: "",
      status: "planned",
      notes: "",
    });
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [currentUserStatus, setCurrentUserStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [messageText, setMessageText] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userSaveError, setUserSaveError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    open: boolean;
    status: "success" | "error";
    title: string;
    message: string;
  }>({
    open: false,
    status: "success",
    title: "",
    message: "",
  });
  const [saveFeedbackTimer, setSaveFeedbackTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [userBirthDateInitial, setUserBirthDateInitial] = useState("");
  const [isLoadingUserBirthDate, setIsLoadingUserBirthDate] = useState(false);
  const [userBirthDateError, setUserBirthDateError] = useState<string | null>(
    null,
  );
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    birthDate: "",
    role: "STUDENT" as AdminUser["role"],
    planId: "",
    address: "",
    image: "",
    active: true,
  });
  const [healthUser, setHealthUser] = useState<AdminUser | null>(null);
  const [healthForm, setHealthForm] = useState<HealthForm>(emptyHealthForm);
  const [healthInitial, setHealthInitial] =
    useState<HealthForm>(emptyHealthForm);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isSavingHealth, setIsSavingHealth] = useState(false);
  const [compositionResult, setCompositionResult] =
    useState<BodyCompositionResult | null>(null);
  const [compositionStatus, setCompositionStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [compositionError, setCompositionError] = useState<string | null>(null);
  const [healthFieldErrors, setHealthFieldErrors] = useState<
    Partial<
      Record<
        | "heightCm"
        | "weightKg"
        | "bloodType"
        | "sex"
        | "birthDate"
        | "injuries"
        | "medications"
        | "supplements"
        | "dailyRoutine",
        string
      >
    >
  >({});
  const [userFilter, setUserFilter] = useState<
    "ALL" | "ADMIN" | "STAFF" | "COACH" | "STUDENT" | "GUEST"
  >("ALL");
  const [systemSection, setSystemSection] = useState<SystemSectionId>("studio");
  const [systemSettingsForm, setSystemSettingsForm] =
    useState<SystemSettingsForm>(() => createDefaultSystemSettingsForm());
  const [systemSettingsStatus, setSystemSettingsStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [systemSettingsError, setSystemSettingsError] = useState<string | null>(
    null,
  );
  const [isSavingStudioSettings, setIsSavingStudioSettings] = useState(false);
  const [isSavingMaintenanceSettings, setIsSavingMaintenanceSettings] =
    useState(false);
  const [isSavingHomepageSettings, setIsSavingHomepageSettings] =
    useState(false);
  const [uploadingCarouselSlot, setUploadingCarouselSlot] = useState<
    number | null
  >(null);
  const [carouselImageFiles, setCarouselImageFiles] = useState<
    Array<File | null>
  >([]);

  const currentTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTab),
    [activeTab],
  );

  useEffect(() => {
    return () => {
      if (saveFeedbackTimer) {
        clearTimeout(saveFeedbackTimer);
      }
    };
  }, [saveFeedbackTimer]);

  useEffect(() => {
    setCarouselImageFiles((prev) => {
      const nextLength = systemSettingsForm.carouselImages.length;
      return Array.from({ length: nextLength }, (_, index) => prev[index] ?? null);
    });
  }, [systemSettingsForm.carouselImages.length]);

  const showSaveFeedback = (
    status: "success" | "error",
    title: string,
    message: string,
  ) => {
    if (saveFeedbackTimer) {
      clearTimeout(saveFeedbackTimer);
    }
    setSaveFeedback({ open: true, status, title, message });
    setSaveFeedbackTimer(
      setTimeout(() => {
        setSaveFeedback((prev) => ({ ...prev, open: false }));
      }, 5000),
    );
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel sair."),
        );
      }
      window.location.href = "/users/login";
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao sair da conta.";
      showSaveFeedback("error", "Erro ao sair", message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const loadUsers = useCallback(async () => {
    setUsersStatus("loading");
    setUsersError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel carregar usuarios."),
        );
      }
      const data = (await response.json()) as AdminUser[];
      setUsers(Array.isArray(data) ? data : []);
      setUsersStatus("ready");
    } catch (err) {
      setUsers([]);
      setUsersStatus("error");
      setUsersError(
        err instanceof Error ? err.message : "Falha ao carregar usuarios.",
      );
    }
  }, []);

  const loadPlans = useCallback(async () => {
    setPlansStatus("loading");
    setPlansError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/plans?includeInactive=true`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel carregar planos."),
        );
      }
      const data = (await response.json()) as PlanOption[];
      setPlans(Array.isArray(data) ? data : []);
      setPlansStatus("ready");
    } catch (err) {
      setPlans([]);
      setPlansStatus("error");
      setPlansError(
        err instanceof Error ? err.message : "Falha ao carregar planos.",
      );
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setEventsStatus("loading");
    setEventsError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel carregar eventos."),
        );
      }
      const data = (await response.json()) as EventApiRecord[];
      const nextEvents = Array.isArray(data) ? data.map(mapApiEventToItem) : [];
      setEvents(nextEvents);
      setEventsStatus("ready");
    } catch (err) {
      setEvents([]);
      setEventsStatus("error");
      setEventsError(
        err instanceof Error ? err.message : "Falha ao carregar eventos.",
      );
    }
  }, []);

  const loadFinancial = useCallback(async () => {
    setFinancialStatus("loading");
    setFinancialError(null);
    try {
      const competence = toCompetenceDateValue(financialCompetenceMonth);
      const [dashboardResponse, subscriptionsResponse, receivablesResponse, templatesResponse, expensesResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/financial/dashboard?competence=${encodeURIComponent(
              competence,
            )}`,
            { credentials: "include" },
          ),
          fetch(`${API_BASE_URL}/financial/subscriptions`, {
            credentials: "include",
          }),
          fetch(
            `${API_BASE_URL}/financial/receivables?competence=${encodeURIComponent(
              competence,
            )}`,
            { credentials: "include" },
          ),
          fetch(`${API_BASE_URL}/financial/expense-templates`, {
            credentials: "include",
          }),
          fetch(
            `${API_BASE_URL}/financial/expenses?competence=${encodeURIComponent(
              competence,
            )}`,
            { credentials: "include" },
          ),
        ]);

      if (!dashboardResponse.ok) {
        throw new Error(
          await parseApiError(
            dashboardResponse,
            "Nao foi possivel carregar o resumo financeiro.",
          ),
        );
      }
      if (!subscriptionsResponse.ok) {
        throw new Error(
          await parseApiError(
            subscriptionsResponse,
            "Nao foi possivel carregar assinaturas.",
          ),
        );
      }
      if (!receivablesResponse.ok) {
        throw new Error(
          await parseApiError(
            receivablesResponse,
            "Nao foi possivel carregar recebiveis.",
          ),
        );
      }
      if (!templatesResponse.ok) {
        throw new Error(
          await parseApiError(
            templatesResponse,
            "Nao foi possivel carregar templates de despesas.",
          ),
        );
      }
      if (!expensesResponse.ok) {
        throw new Error(
          await parseApiError(
            expensesResponse,
            "Nao foi possivel carregar despesas.",
          ),
        );
      }

      const [dashboardPayload, subscriptionsPayload, receivablesPayload, templatesPayload, expensesPayload] =
        await Promise.all([
          dashboardResponse.json() as Promise<FinancialDashboardApiRecord>,
          subscriptionsResponse.json() as Promise<FinancialSubscriptionApiRecord[]>,
          receivablesResponse.json() as Promise<FinancialReceivableApiRecord[]>,
          templatesResponse.json() as Promise<FinancialExpenseTemplateApiRecord[]>,
          expensesResponse.json() as Promise<FinancialExpenseApiRecord[]>,
        ]);

      setFinancialDashboard(dashboardPayload ?? null);
      setFinancialSubscriptions(
        Array.isArray(subscriptionsPayload) ? subscriptionsPayload : [],
      );
      setFinancialReceivables(
        Array.isArray(receivablesPayload) ? receivablesPayload : [],
      );
      setFinancialExpenseTemplates(
        Array.isArray(templatesPayload) ? templatesPayload : [],
      );
      setFinancialExpenses(Array.isArray(expensesPayload) ? expensesPayload : []);
      setFinancialStatus("ready");
    } catch (err) {
      setFinancialDashboard(null);
      setFinancialSubscriptions([]);
      setFinancialReceivables([]);
      setFinancialExpenseTemplates([]);
      setFinancialExpenses([]);
      setFinancialStatus("error");
      setFinancialError(
        err instanceof Error ? err.message : "Falha ao carregar financeiro.",
      );
    }
  }, [financialCompetenceMonth]);

  const loadSystemSettings = useCallback(async () => {
    setSystemSettingsStatus("loading");
    setSystemSettingsError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/system-settings`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel carregar as configuracoes do sistema.",
          ),
        );
      }
      const payload = (await response.json()) as SystemSettingsApiRecord;
      setSystemSettingsForm(mapSystemSettingsToForm(payload));
      setSystemSettingsStatus("ready");
    } catch (err) {
      setSystemSettingsStatus("error");
      setSystemSettingsError(
        err instanceof Error
          ? err.message
          : "Falha ao carregar configuracoes do sistema.",
      );
    }
  }, []);

  const loadCheckinHistory = useCallback(async (userId: string) => {
    setCheckinHistoryStatus("loading");
    setCheckinHistoryError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/checkin/user/${userId}/history`,
        { credentials: "include" },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel carregar o historico de check-in.",
          ),
        );
      }
      const data = (await response.json()) as CheckinRecord[];
      const history = Array.isArray(data) ? data : [];
      setCheckinHistoryByUser((prev) => ({ ...prev, [userId]: history }));
      setCheckinHistoryStatus("ready");
    } catch (err) {
      setCheckinHistoryByUser((prev) => ({ ...prev, [userId]: [] }));
      setCheckinHistoryStatus("error");
      setCheckinHistoryError(
        err instanceof Error
          ? err.message
          : "Falha ao carregar historico de check-in.",
      );
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadPlans();
    loadEvents();
    loadSystemSettings();
  }, [loadUsers, loadPlans, loadEvents, loadSystemSettings]);

  useEffect(() => {
    if (activeTab !== "financial") {
      return;
    }
    void loadFinancial();
  }, [activeTab, loadFinancial]);

  useEffect(() => {
    if (!checkinUser) {
      setCheckinHistoryStatus("idle");
      setCheckinHistoryError(null);
      setCheckinSelectedDate(null);
      return;
    }
    const todayKey = toCheckinDateKey(new Date());
    setCheckinSelectedDate(todayKey || null);
    setCheckinMonth(new Date());
    loadCheckinHistory(checkinUser.id);
  }, [checkinUser, loadCheckinHistory]);

  useEffect(() => {
    let canceled = false;
    const loadUser = async () => {
      setCurrentUserStatus("loading");
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("unauthorized");
        }
        const data = (await response.json()) as AuthenticatedUser;
        if (!canceled) {
          setCurrentUser(data);
          setCurrentUserStatus("ready");
        }
      } catch {
        if (!canceled) {
          setCurrentUser(null);
          setCurrentUserStatus("error");
        }
      }
    };
    loadUser();
    return () => {
      canceled = true;
    };
  }, []);

  const openUserModal = (user: AdminUser) => {
    setSelectedUser(user);
    setUserSaveError(null);
    setUserBirthDateInitial("");
    setIsLoadingUserBirthDate(true);
    setUserBirthDateError(null);
    setUserForm({
      name: user.name ?? "",
      email: user.email ?? "",
      cpf: user.cpf ?? "",
      phone: user.phone ?? "",
      birthDate: "",
      role: user.role,
      planId: user.planId ?? "",
      address: user.address ?? "",
      image: user.image ?? "",
      active: user.active ?? true,
    });
    const display = user.name?.trim() || user.email || "usuario";
    setMessageText(
      `Ola ${display}, precisamos atualizar alguns dados do seu cadastro.`,
    );

    void (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/health/${user.id}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response,
              "Nao foi possivel carregar a data de nascimento.",
            ),
          );
        }

        const healthData = (await response.json()) as HealthProfile | null;
        const birthDate = healthData?.birthDate ?? "";
        setUserBirthDateInitial(birthDate);
        setUserForm((prev) =>
          prev.birthDate.trim()
            ? prev
            : {
                ...prev,
                birthDate,
              },
        );
      } catch (err) {
        setUserBirthDateError(
          err instanceof Error
            ? err.message
            : "Falha ao carregar data de nascimento.",
        );
      } finally {
        setIsLoadingUserBirthDate(false);
      }
    })();
  };

  const openHealthModal = async (user: AdminUser) => {
    setHealthUser(user);
    setHealthLoading(true);
    setHealthError(null);
    setHealthFieldErrors({});
    setHealthForm(emptyHealthForm);
    setHealthInitial(emptyHealthForm);
    setCompositionResult(null);
    setCompositionStatus("idle");
    setCompositionError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/health/${user.id}`,
        {
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel carregar os dados de saude.",
          ),
        );
      }
      const data = (await response.json()) as HealthProfile | null;
      const nextForm = mapHealthToForm(data);
      setHealthForm(nextForm);
      setHealthInitial(nextForm);
    } catch (err) {
      const fallback =
        err instanceof Error
          ? err.message
          : "Falha ao carregar dados de saude.";
      setHealthError(fallback);
      setHealthForm(emptyHealthForm);
      setHealthInitial(emptyHealthForm);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (!healthUser) {
      setCompositionResult(null);
      setCompositionStatus("idle");
      setCompositionError(null);
      return;
    }

    const sex = healthForm.sex as "MALE" | "FEMALE" | "";
    const weightKg = parsePositive(healthForm.weightKg);
    const birthDate = healthForm.birthDate;
    const thighMm = parsePositive(healthForm.skinfoldThigh);

    if (!sex || !weightKg || !birthDate || !thighMm) {
      setCompositionResult(null);
      setCompositionStatus("idle");
      setCompositionError(null);
      return;
    }

    const chestMm = parsePositive(healthForm.skinfoldChest);
    const abdominalMm = parsePositive(healthForm.skinfoldAbdomen);
    const tricepsMm = parsePositive(healthForm.skinfoldTriceps);
    const suprailiacMm = parsePositive(healthForm.skinfoldSuprailiac);

    if (sex === "MALE" && (!chestMm || !abdominalMm)) {
      setCompositionResult(null);
      setCompositionStatus("idle");
      setCompositionError(null);
      return;
    }

    if (sex === "FEMALE" && (!tricepsMm || !suprailiacMm)) {
      setCompositionResult(null);
      setCompositionStatus("idle");
      setCompositionError(null);
      return;
    }

    const payload: Record<string, number | string> = {
      sex,
      birthDate,
      weightKg,
      thighMm,
    };

    const heightCm = normalizeHeightCm(healthForm.heightCm);
    if (heightCm) {
      payload.heightCm = heightCm;
    }

    if (sex === "MALE") {
      payload.chestMm = chestMm!;
      payload.abdominalMm = abdominalMm!;
    } else {
      payload.tricepsMm = tricepsMm!;
      payload.suprailiacMm = suprailiacMm!;
    }

    const controller = new AbortController();
    setCompositionStatus("loading");
    setCompositionError(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/admin/health/body-composition/compute`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response,
              "Não foi possível calcular a composição corporal.",
            ),
          );
        }
        const data = (await response.json()) as BodyCompositionResult;
        setCompositionResult(data);
        setCompositionStatus("ready");
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        setCompositionResult(null);
        setCompositionStatus("error");
        setCompositionError(
          err instanceof Error
            ? err.message
            : "Falha ao calcular composição corporal.",
        );
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    healthUser,
    healthForm.sex,
    healthForm.weightKg,
    healthForm.birthDate,
    healthForm.heightCm,
    healthForm.skinfoldChest,
    healthForm.skinfoldAbdomen,
    healthForm.skinfoldThigh,
    healthForm.skinfoldTriceps,
    healthForm.skinfoldSuprailiac,
  ]);

  const validateHealthForm = (form: HealthForm) => {
    const nextErrors: Partial<
      Record<
        | "heightCm"
        | "weightKg"
        | "bloodType"
        | "sex"
        | "birthDate"
        | "injuries"
        | "medications"
        | "supplements"
        | "dailyRoutine",
        string
      >
    > = {};

    if (!form.heightCm.trim()) {
      nextErrors.heightCm = "Altura é obrigatória.";
    }
    if (!form.weightKg.trim()) {
      nextErrors.weightKg = "Peso é obrigatório.";
    }
    if (!form.bloodType.trim()) {
      nextErrors.bloodType = "Tipo sanguíneo é obrigatório.";
    }
    if (!form.sex.trim()) {
      nextErrors.sex = "Sexo é obrigatório.";
    }
    if (!form.birthDate.trim()) {
      nextErrors.birthDate = "Data de nascimento é obrigatória.";
    }
    if (!form.injuries.trim()) {
      nextErrors.injuries = 'Informe lesões ou "nenhuma".';
    }
    if (form.takesMedication && !form.medications.trim()) {
      nextErrors.medications = "Informe as medicações utilizadas.";
    }
    if (form.usesSupplementation && !form.supplements.trim()) {
      nextErrors.supplements = "Informe os suplementos utilizados.";
    }
    if (form.exercisesRegularly && !form.dailyRoutine.trim()) {
      nextErrors.dailyRoutine = "Descreva sua rotina de exercícios.";
    }

    setHealthFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return "Preencha os campos obrigatórios destacados.";
    }
    return null;
  };

  const handleSaveHealth = async () => {
    if (!healthUser) {
      return;
    }
    setHealthFieldErrors({});
    const validation = validateHealthForm(healthForm);
    if (validation) {
      setHealthError(validation);
      return;
    }
    setIsSavingHealth(true);
    setHealthError(null);
    try {
      const heightCm = normalizeHeightCm(healthForm.heightCm);
      const weightKg = parsePositive(healthForm.weightKg);
      if (!heightCm || !weightKg) {
        throw new Error("Altura e peso precisam ser informados.");
      }

      const payload: Record<string, unknown> = {
        heightCm,
        weightKg,
        bloodType: healthForm.bloodType,
        sex: healthForm.sex,
        birthDate: healthForm.birthDate,
        injuries: healthForm.injuries.trim(),
        takesMedication: healthForm.takesMedication,
        medications: healthForm.takesMedication
          ? healthForm.medications.trim()
          : "",
        exercisesRegularly: healthForm.exercisesRegularly,
        usesSupplementation: healthForm.usesSupplementation,
        supplements: healthForm.usesSupplementation
          ? healthForm.supplements.trim()
          : "",
        dailyRoutine: healthForm.exercisesRegularly
          ? healthForm.dailyRoutine.trim()
          : "",
        foodRoutine: healthForm.foodRoutine.trim(),
        notesPublic: healthForm.notesPublic.trim(),
      };

      const optionalNumericFields = [
        ["skinfoldChest", healthForm.skinfoldChest],
        ["skinfoldAbdomen", healthForm.skinfoldAbdomen],
        ["skinfoldThigh", healthForm.skinfoldThigh],
        ["skinfoldTriceps", healthForm.skinfoldTriceps],
        ["skinfoldSubscapular", healthForm.skinfoldSubscapular],
        ["skinfoldSuprailiac", healthForm.skinfoldSuprailiac],
        ["skinfoldMidaxillary", healthForm.skinfoldMidaxillary],
      ] as const;

      optionalNumericFields.forEach(([key, value]) => {
        const parsed = parsePositive(value);
        if (parsed !== null) {
          payload[key] = parsed;
        }
      });
      const payloadWithPrivateNotes = canViewPrivateNotes
        ? { ...payload, notesPrivate: healthForm.notesPrivate.trim() }
        : payload;
      const response = await fetch(
        `${API_BASE_URL}/admin/health/${healthUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payloadWithPrivateNotes),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel salvar os dados de saude.",
          ),
        );
      }
      const data = (await response.json()) as HealthProfile | null;
      const nextForm = mapHealthToForm(data);
      setHealthForm(nextForm);
      setHealthInitial(nextForm);
      setHealthUser(null);
      showSaveFeedback(
        "success",
        "Dados de saúde salvos",
        "As informações foram atualizadas com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao salvar dados de saude.";
      setHealthError(message);
      showSaveFeedback("error", "Erro ao salvar saúde", message);
    } finally {
      setIsSavingHealth(false);
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) {
      return;
    }
    setIsSavingUser(true);
    setUserSaveError(null);
    try {
      const payload: Record<string, unknown> = {};
      const currentName = selectedUser.name?.trim() ?? "";
      const nextName = userForm.name.trim();
      if (nextName && nextName !== currentName) {
        payload.name = nextName;
      }
      const currentEmail = (selectedUser.email ?? "").trim().toLowerCase();
      const nextEmail = userForm.email.trim().toLowerCase();
      if (nextEmail && nextEmail !== currentEmail) {
        payload.email = nextEmail;
      }
      const currentPhone = selectedUser.phone?.trim() ?? "";
      const nextPhone = userForm.phone.trim();
      if (nextPhone && nextPhone !== currentPhone) {
        payload.phone = nextPhone;
      }
      const currentAddress = selectedUser.address?.trim() ?? "";
      const nextAddress = userForm.address.trim();
      if (nextAddress && nextAddress !== currentAddress) {
        payload.address = nextAddress;
      }
      const currentImage = selectedUser.image?.trim() ?? "";
      const nextImage = userForm.image.trim();
      if (nextImage && nextImage !== currentImage) {
        payload.image = nextImage;
      }
      if (userForm.active !== (selectedUser.active ?? true)) {
        payload.active = userForm.active;
      }
      if (userForm.role !== selectedUser.role) {
        payload.role = userForm.role;
      }

      const requiresPlanLock = [
        "MASTER",
        "ADMIN",
        "STAFF",
        "COACH",
        "GUEST",
      ].includes(
        userForm.role,
      );
      if (
        !requiresPlanLock &&
        userForm.planId &&
        userForm.planId !== (selectedUser.planId ?? "")
      ) {
        payload.planId = userForm.planId;
      }
      const currentBirthDate = userBirthDateInitial.trim();
      const nextBirthDate = userForm.birthDate.trim();
      const birthDateChanged = nextBirthDate !== currentBirthDate;

      if (Object.keys(payload).length === 0 && !birthDateChanged) {
        showSaveFeedback(
          "success",
          "Sem alterações",
          "Nenhuma alteração para salvar.",
        );
        return;
      }

      if (Object.keys(payload).length > 0) {
        const response = await fetch(
          `${API_BASE_URL}/admin/users/${selectedUser.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response,
              "Nao foi possivel salvar as alteracoes.",
            ),
          );
        }
        await response.json();
      }

      if (birthDateChanged) {
        if (!nextBirthDate) {
          throw new Error("Data de nascimento é obrigatória.");
        }
        const healthResponse = await fetch(
          `${API_BASE_URL}/admin/health/${selectedUser.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ birthDate: nextBirthDate }),
          },
        );
        if (!healthResponse.ok) {
          const errorMessage = await parseApiError(
            healthResponse,
            "Nao foi possivel atualizar a data de nascimento.",
          );
          if (errorMessage.includes("Perfil de saúde não encontrado")) {
            throw new Error(
              'Perfil de saúde não encontrado. Use "Editar saúde" para cadastrar os dados de saúde primeiro.',
            );
          }
          throw new Error(errorMessage);
        }
      }

      await loadUsers();
      setSelectedUser(null);
      showSaveFeedback(
        "success",
        "Usuário salvo",
        "As informações do usuário foram atualizadas.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao salvar alteracoes.";
      setUserSaveError(message);
      showSaveFeedback("error", "Erro ao salvar usuário", message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(checkinMonth);

  const eventMonthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(eventMonth);

  const monthDays = useMemo(() => {
    const year = checkinMonth.getFullYear();
    const month = checkinMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days: Array<{ date: string; day: number | null }> = [];
    for (let i = 0; i < startWeekday; i += 1) {
      days.push({ date: "", day: null });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day);
      days.push({ date: toLocalDateKey(date), day });
    }
    return days;
  }, [checkinMonth]);

  const eventMonthDays = useMemo(() => {
    const year = eventMonth.getFullYear();
    const month = eventMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days: Array<{
      date: string;
      day: number | null;
      inMonth: boolean;
    }> = [];

    for (let i = 0; i < startWeekday; i += 1) {
      days.push({ date: "", day: null, inMonth: false });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(year, month, day);
      days.push({
        date: toLocalDateKey(date),
        day,
        inMonth: true,
      });
    }

    const remainder = days.length % 7;
    if (remainder !== 0) {
      const missing = 7 - remainder;
      for (let i = 0; i < missing; i += 1) {
        days.push({ date: "", day: null, inMonth: false });
      }
    }
    return days;
  }, [eventMonth]);

  const checkinHistory = useMemo(() => {
    if (!checkinUser) {
      return [];
    }
    return checkinHistoryByUser[checkinUser.id] ?? [];
  }, [checkinUser, checkinHistoryByUser]);

  const checkinDates = useMemo(() => {
    if (!checkinUser) {
      return new Set<string>();
    }
    return new Set(
      checkinHistory
        .map((item) => toCheckinDateKey(item.checkedInAt))
        .filter(Boolean),
    );
  }, [checkinUser, checkinHistory]);

  const checkinsForSelectedDay = useMemo(() => {
    if (!checkinSelectedDate) {
      return [];
    }
    const [year, month, day] = checkinSelectedDate
      .split("-")
      .map((value) => Number(value));
    if (!year || !month || !day) {
      return [];
    }
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day + 1);
    return checkinHistory.filter((item) => {
      const parsed =
        typeof item.checkedInAt === "string"
          ? new Date(item.checkedInAt)
          : item.checkedInAt;
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      return parsed >= startOfDay && parsed < endOfDay;
    });
  }, [checkinHistory, checkinSelectedDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    events.forEach((event) => {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    });
    return map;
  }, [events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedEventDate) {
      return [];
    }
    return eventsByDate.get(selectedEventDate) ?? [];
  }, [eventsByDate, selectedEventDate]);

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((user) => {
      const display =
        user.name?.trim() || user.email?.trim() || `Usuario ${user.id.slice(0, 8)}`;
      map.set(user.id, display);
    });
    return map;
  }, [users]);

  const planNameById = useMemo(() => {
    const map = new Map<string, string>();
    plans.forEach((plan) => {
      map.set(plan.id, plan.name);
    });
    return map;
  }, [plans]);

  const filteredFinancialSubscriptions = useMemo(() => {
    return financialSubscriptions.filter((subscription) => {
      if (financialSubscriptionStatusFilter === "all") {
        return true;
      }
      return subscription.status === financialSubscriptionStatusFilter;
    });
  }, [financialSubscriptionStatusFilter, financialSubscriptions]);

  const filteredFinancialReceivables = useMemo(() => {
    return financialReceivables.filter((receivable) => {
      if (financialReceivableStatusFilter === "all") {
        return true;
      }
      return receivable.status === financialReceivableStatusFilter;
    });
  }, [financialReceivableStatusFilter, financialReceivables]);

  const filteredFinancialExpenses = useMemo(() => {
    return financialExpenses.filter((expense) => {
      if (financialExpenseStatusFilter === "all") {
        return true;
      }
      return expense.status === financialExpenseStatusFilter;
    });
  }, [financialExpenseStatusFilter, financialExpenses]);

  const financialSummary = useMemo(() => {
    const receivablesCents = Number(financialDashboard?.receivablesCents ?? 0);
    const receivedCents = Number(financialDashboard?.receivedCents ?? 0);
    const expensesCents = Number(financialDashboard?.expensesCents ?? 0);
    const pendingCents = Math.max(0, receivablesCents - receivedCents);
    const expectedBalanceCents = receivablesCents - expensesCents;
    const realizedBalanceCents = receivedCents - expensesCents;
    return {
      receivablesCents,
      receivedCents,
      expensesCents,
      pendingCents,
      expectedBalanceCents,
      realizedBalanceCents,
    };
  }, [financialDashboard]);

  const activeSubscriptionsCount = useMemo(
    () =>
      financialSubscriptions.filter((subscription) => subscription.status === "active")
        .length,
    [financialSubscriptions],
  );

  const parsePriceToReais = (price: string) => {
    const digits = price.replace(/\D/g, "");
    if (!digits) {
      return "";
    }
    const value = Number(digits) / 100;
    return Number.isFinite(value) ? String(value) : "";
  };

  const openEventModal = (
    mode: "create" | "edit",
    event?: EventItem,
    prefillDate?: string,
  ) => {
    const baseDate =
      prefillDate ||
      event?.date ||
      selectedEventDate ||
      new Date().toISOString().split("T")[0];
    setEventModalMode(mode);
    setEditingEventId(event?.id ?? null);
    setEditingEventStatus(event?.status ?? null);
    setEventForm({
      title: event?.title ?? "",
      description: event?.description ?? "",
      date: baseDate,
      time: event?.time ?? "",
      endTime: event?.endTime ?? "",
      location: event?.location ?? "",
      hideLocation: event?.hideLocation ?? false,
      accessMode: event?.access ?? "registered_only",
      capacity:
        event?.capacity !== null && event?.capacity !== undefined
          ? String(event.capacity)
          : "",
      allowGuests: event?.allowGuests ?? true,
      requiresConfirmation: event?.requiresConfirmation ?? false,
      isPaid: event?.paid ?? false,
      priceCents: event?.paid ? parsePriceToReais(event.price ?? "") : "",
      paymentMethod: event?.paid ? event?.paymentMethod ?? "" : "",
      isFeatured: event?.isFeatured ?? false,
      publish: event?.status === "publicado",
    });
    setEventImageFile(null);
    setIsEventModalOpen(true);
  };

  const buildEventPayloadFromForm = () => {
    const accessMode = eventForm.accessMode;
    const parsedCapacity = Number(eventForm.capacity);
    const capacity =
      accessMode === "open"
        ? null
        : Number.isFinite(parsedCapacity) && parsedCapacity > 0
          ? Math.trunc(parsedCapacity)
          : null;
    const priceCents = eventForm.isPaid
      ? parseReaisToCents(eventForm.priceCents)
      : null;
    const paymentMethod = eventForm.isPaid
      ? eventForm.paymentMethod.trim() || null
      : null;
    const endTime = eventForm.endTime.trim() || null;

    return {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      date: eventForm.date,
      time: eventForm.time,
      endTime,
      location: eventForm.location.trim(),
      hideLocation: eventForm.hideLocation,
      accessMode,
      capacity,
      allowGuests: eventForm.allowGuests,
      requiresConfirmation: eventForm.requiresConfirmation,
      isPaid: eventForm.isPaid,
      priceCents,
      paymentMethod,
      isFeatured: eventForm.isFeatured,
    };
  };

  const validateEventPayload = (
    payload: ReturnType<typeof buildEventPayloadFromForm>,
  ) => {
    if (payload.title.length < 3) {
      return "Titulo deve ter pelo menos 3 caracteres.";
    }
    if (payload.description.length < 3) {
      return "Descricao deve ter pelo menos 3 caracteres.";
    }
    if (!payload.date) {
      return "Data obrigatoria.";
    }
    if (!payload.time) {
      return "Horario obrigatorio.";
    }
    if (payload.location.length < 3) {
      return "Local deve ter pelo menos 3 caracteres.";
    }

    if (payload.accessMode === "registered_only") {
      if (!payload.capacity || payload.capacity < 1) {
        return "Capacidade obrigatoria para eventos com inscricao.";
      }
    } else if (payload.capacity !== null) {
      return "Capacidade deve ser vazia para eventos abertos.";
    }

    if (payload.isPaid) {
      if (!payload.priceCents || payload.priceCents < 1) {
        return "Valor do evento e obrigatorio.";
      }
      if (!payload.paymentMethod || payload.paymentMethod.trim().length < 2) {
        return "Forma de pagamento e obrigatoria.";
      }
      if (!payload.requiresConfirmation) {
        return "Eventos pagos exigem confirmacao de presenca.";
      }
    }

    return null;
  };

  const handleSaveEvent = async () => {
    if (isSavingEvent) {
      return;
    }

    const payload = buildEventPayloadFromForm();
    const validationError = validateEventPayload(payload);
    if (validationError) {
      showSaveFeedback("error", "Erro ao salvar evento", validationError);
      return;
    }

    setIsSavingEvent(true);
    try {
      const isEditMode = eventModalMode === "edit" && Boolean(editingEventId);
      const response = await fetch(
        isEditMode
          ? `${API_BASE_URL}/events/${editingEventId}`
          : `${API_BASE_URL}/events`,
        {
          method: isEditMode ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            isEditMode
              ? "Nao foi possivel atualizar o evento."
              : "Nao foi possivel criar o evento.",
          ),
        );
      }

      const savedEvent = (await response.json()) as EventApiRecord;

      if (eventImageFile) {
        const formData = new FormData();
        formData.append("file", eventImageFile);
        const uploadResponse = await fetch(
          `${API_BASE_URL}/events/${savedEvent.id}/thumbnail`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          },
        );
        if (!uploadResponse.ok) {
          throw new Error(
            await parseApiError(
              uploadResponse,
              "Evento salvo, mas nao foi possivel enviar a imagem.",
            ),
          );
        }
      }

      const shouldPublish = eventForm.publish;
      const currentlyPublished =
        savedEvent.status === "published" || savedEvent.isPublished === true;
      if (shouldPublish !== currentlyPublished) {
        const publishAction = shouldPublish ? "publish" : "unpublish";
        const publishActionLabel = shouldPublish ? "publicar" : "despublicar";
        const publishResponse = await fetch(
          `${API_BASE_URL}/events/${savedEvent.id}/${publishAction}`,
          {
            method: "POST",
            credentials: "include",
          },
        );
        if (!publishResponse.ok) {
          throw new Error(
            await parseApiError(
              publishResponse,
              `Evento salvo, mas nao foi possivel ${publishActionLabel}.`,
            ),
          );
        }
      }

      await loadEvents();
      setIsEventModalOpen(false);
      setEditingEventId(null);
      setEditingEventStatus(null);
      setEventImageFile(null);
      showSaveFeedback(
        "success",
        isEditMode ? "Evento atualizado" : "Evento criado",
        isEditMode
          ? "As alteracoes do evento foram salvas."
          : "O evento foi criado com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao salvar o evento.";
      showSaveFeedback("error", "Erro ao salvar evento", message);
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleCancelEvent = async (eventId?: string | null) => {
    const targetId = eventId ?? editingEventId;
    if (!targetId || isCancellingEvent) {
      return;
    }
    setIsCancellingEvent(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${targetId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel cancelar o evento."),
        );
      }
      await loadEvents();
      setIsEventModalOpen(false);
      setEditingEventId(null);
      setEditingEventStatus(null);
      showSaveFeedback(
        "success",
        "Evento cancelado",
        "O evento foi cancelado com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao cancelar evento.";
      showSaveFeedback("error", "Erro ao cancelar evento", message);
    } finally {
      setIsCancellingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId?: string | null) => {
    const targetId = eventId ?? selectedEvent?.id ?? null;
    if (!targetId || isDeletingEvent) {
      return;
    }
    setIsDeletingEvent(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${targetId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel apagar o evento."),
        );
      }
      const result = (await response.json()) as {
        status?: EventApiRecord["status"];
        deletedAt?: string | null;
      };
      const wasCancelled = result.status === "cancelled" && !result.deletedAt;
      await loadEvents();
      setIsEventModalOpen(false);
      setEditingEventId(null);
      setEditingEventStatus(null);
      showSaveFeedback(
        "success",
        wasCancelled ? "Evento cancelado" : "Evento apagado",
        wasCancelled
          ? "O evento ja foi publicado anteriormente e foi cancelado."
          : "O evento foi apagado com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao apagar evento.";
      showSaveFeedback("error", "Erro ao apagar evento", message);
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleTogglePublishEvent = async (event: EventItem) => {
    const action = event.status === "publicado" ? "unpublish" : "publish";
    const actionLabel = action === "publish" ? "publicar" : "despublicar";
    try {
      const response = await fetch(`${API_BASE_URL}/events/${event.id}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            `Nao foi possivel ${actionLabel} o evento.`,
          ),
        );
      }
      await loadEvents();
      showSaveFeedback(
        "success",
        action === "publish" ? "Evento publicado" : "Evento despublicado",
        action === "publish"
          ? "O evento foi publicado com sucesso."
          : "O evento voltou para rascunho.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Falha ao ${actionLabel} evento.`;
      showSaveFeedback("error", "Erro no evento", message);
    }
  };

  const getReceivablePaymentDraft = (receivable: FinancialReceivableApiRecord) => {
    const existing = paymentDraftsByReceivable[receivable.id];
    if (existing) {
      return existing;
    }
    const outstanding = getReceivableOutstandingCents(receivable);
    return {
      amount: outstanding > 0 ? (outstanding / 100).toFixed(2) : "",
      method: "pix" as FinancialPaymentMethod,
      notes: "",
    };
  };

  const updateReceivablePaymentDraft = (
    receivableId: string,
    updates: Partial<{
      amount: string;
      method: FinancialPaymentMethod;
      notes: string;
    }>,
  ) => {
    setPaymentDraftsByReceivable((prev) => {
      const current = prev[receivableId] ?? {
        amount: "",
        method: "pix" as FinancialPaymentMethod,
        notes: "",
      };
      return {
        ...prev,
        [receivableId]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  const handleGenerateReceivables = async () => {
    if (isGeneratingReceivables) {
      return;
    }
    setIsGeneratingReceivables(true);
    try {
      const response = await fetch(`${API_BASE_URL}/financial/receivables/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          competence: toCompetenceDateValue(financialCompetenceMonth),
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel gerar recebiveis."),
        );
      }
      const payload = (await response.json()) as {
        created?: Array<unknown>;
        skipped?: number;
      };
      await loadFinancial();
      const createdCount = Array.isArray(payload.created)
        ? payload.created.length
        : 0;
      showSaveFeedback(
        "success",
        "Recebiveis gerados",
        `${createdCount} recebiveis criados. ${Number(payload.skipped ?? 0)} ja existiam.`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao gerar recebiveis.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setIsGeneratingReceivables(false);
    }
  };

  const handleGenerateExpenses = async () => {
    if (isGeneratingExpenses) {
      return;
    }
    setIsGeneratingExpenses(true);
    try {
      const response = await fetch(`${API_BASE_URL}/financial/expenses/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          competence: toCompetenceDateValue(financialCompetenceMonth),
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel gerar despesas."),
        );
      }
      const payload = (await response.json()) as {
        created?: Array<unknown>;
        skipped?: number;
      };
      await loadFinancial();
      const createdCount = Array.isArray(payload.created)
        ? payload.created.length
        : 0;
      showSaveFeedback(
        "success",
        "Despesas geradas",
        `${createdCount} despesas criadas. ${Number(payload.skipped ?? 0)} ja existiam.`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao gerar despesas.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setIsGeneratingExpenses(false);
    }
  };

  const handleSaveFinancialSubscription = async () => {
    if (isSavingSubscription) {
      return;
    }
    if (!financialSubscriptionForm.userId) {
      showSaveFeedback(
        "error",
        "Dados incompletos",
        "Selecione o usuario da assinatura.",
      );
      return;
    }
    if (!financialSubscriptionForm.planId) {
      showSaveFeedback(
        "error",
        "Dados incompletos",
        "Selecione o plano da assinatura.",
      );
      return;
    }
    const billingDay = Number(financialSubscriptionForm.billingDay);
    const customDueDay = Number(financialSubscriptionForm.customDueDay);
    if (
      financialSubscriptionForm.dueDateMode === "fixed_day" &&
      (!Number.isFinite(billingDay) || billingDay < 1 || billingDay > 31)
    ) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Informe o dia de vencimento entre 1 e 31.",
      );
      return;
    }
    if (
      financialSubscriptionForm.dueDateMode === "custom_date" &&
      (!financialSubscriptionForm.customDueDate &&
        (!Number.isFinite(customDueDay) || customDueDay < 1 || customDueDay > 31))
    ) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Informe uma data customizada ou dia customizado (1 a 31).",
      );
      return;
    }

    setIsSavingSubscription(true);
    try {
      const payload: Record<string, unknown> = {
        userId: financialSubscriptionForm.userId,
        planId: financialSubscriptionForm.planId,
        dueDateMode: financialSubscriptionForm.dueDateMode,
        replaceActive: financialSubscriptionForm.replaceActive,
      };
      if (financialSubscriptionForm.startsAt) {
        payload.startsAt = `${financialSubscriptionForm.startsAt}T00:00:00`;
      }
      if (financialSubscriptionForm.notes.trim()) {
        payload.notes = financialSubscriptionForm.notes.trim();
      }
      if (financialSubscriptionForm.dueDateMode === "fixed_day") {
        payload.billingDay = Math.trunc(billingDay);
      } else {
        if (financialSubscriptionForm.customDueDate) {
          payload.customDueDate = `${financialSubscriptionForm.customDueDate}T00:00:00`;
        }
        if (Number.isFinite(customDueDay) && customDueDay > 0) {
          payload.customDueDay = Math.trunc(customDueDay);
        }
      }

      const response = await fetch(`${API_BASE_URL}/financial/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel criar a assinatura financeira.",
          ),
        );
      }

      await Promise.all([loadFinancial(), loadUsers()]);
      setFinancialSubscriptionForm((prev) => ({
        ...prev,
        startsAt: "",
        notes: "",
      }));
      showSaveFeedback(
        "success",
        "Assinatura criada",
        "A assinatura foi criada e vinculada ao usuario.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao criar assinatura.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setIsSavingSubscription(false);
    }
  };

  const handleUpdateSubscriptionStatus = async (
    subscriptionId: string,
    status: FinancialSubscriptionStatus,
  ) => {
    if (updatingSubscriptionId) {
      return;
    }
    setUpdatingSubscriptionId(subscriptionId);
    try {
      const response = await fetch(
        `${API_BASE_URL}/financial/subscriptions/${subscriptionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel atualizar status da assinatura.",
          ),
        );
      }
      await Promise.all([loadFinancial(), loadUsers()]);
      showSaveFeedback(
        "success",
        "Assinatura atualizada",
        "Status da assinatura atualizado com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao atualizar status da assinatura.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setUpdatingSubscriptionId(null);
    }
  };

  const handleCreatePayment = async (receivable: FinancialReceivableApiRecord) => {
    if (isSavingPaymentId) {
      return;
    }
    const draft = getReceivablePaymentDraft(receivable);
    const amountCents = parseReaisToCents(draft.amount);
    if (!amountCents || amountCents < 1) {
      showSaveFeedback(
        "error",
        "Pagamento invalido",
        "Informe um valor de pagamento valido.",
      );
      return;
    }
    setIsSavingPaymentId(receivable.id);
    try {
      const response = await fetch(`${API_BASE_URL}/financial/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receivableId: receivable.id,
          amountCents,
          method: draft.method,
          notes: draft.notes.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel registrar pagamento do recebivel.",
          ),
        );
      }

      await loadFinancial();
      setPaymentDraftsByReceivable((prev) => {
        const next = { ...prev };
        delete next[receivable.id];
        return next;
      });
      showSaveFeedback(
        "success",
        "Pagamento registrado",
        "Pagamento registrado no recebivel.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao registrar pagamento.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setIsSavingPaymentId(null);
    }
  };

  const handleSaveExpenseTemplate = async () => {
    if (isSavingExpenseTemplate) {
      return;
    }
    const name = financialExpenseTemplateForm.name.trim();
    const defaultAmount = parseNonNegative(financialExpenseTemplateForm.defaultAmount);
    const billingDay = Number(financialExpenseTemplateForm.billingDay);
    if (name.length < 2) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Informe um nome para o template.",
      );
      return;
    }
    if (defaultAmount === null) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Valor padrao do template e invalido.",
      );
      return;
    }
    if (!Number.isFinite(billingDay) || billingDay < 1 || billingDay > 31) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Dia de vencimento deve estar entre 1 e 31.",
      );
      return;
    }

    setIsSavingExpenseTemplate(true);
    try {
      const response = await fetch(`${API_BASE_URL}/financial/expense-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          category: financialExpenseTemplateForm.category,
          defaultAmountCents: Math.round(defaultAmount * 100),
          billingDay: Math.trunc(billingDay),
          active: financialExpenseTemplateForm.active,
          notes: financialExpenseTemplateForm.notes.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel criar o template de despesa.",
          ),
        );
      }
      await loadFinancial();
      setFinancialExpenseTemplateForm({
        name: "",
        category: "other",
        defaultAmount: "",
        billingDay: "5",
        active: true,
        notes: "",
      });
      showSaveFeedback(
        "success",
        "Template salvo",
        "Template de despesa criado com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao criar template de despesa.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setIsSavingExpenseTemplate(false);
    }
  };

  const handleToggleExpenseTemplate = async (
    template: FinancialExpenseTemplateApiRecord,
  ) => {
    if (updatingExpenseTemplateId) {
      return;
    }
    setUpdatingExpenseTemplateId(template.id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/financial/expense-templates/${template.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ active: !template.active }),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel atualizar o template de despesa.",
          ),
        );
      }
      await loadFinancial();
      showSaveFeedback(
        "success",
        "Template atualizado",
        template.active
          ? "Template desativado com sucesso."
          : "Template ativado com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao atualizar template de despesa.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setUpdatingExpenseTemplateId(null);
    }
  };

  const handleSaveExpense = async () => {
    if (isSavingExpense) {
      return;
    }
    const amount = parseNonNegative(financialExpenseForm.amount);
    if (financialExpenseForm.description.trim().length < 2) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Informe a descricao da despesa.",
      );
      return;
    }
    if (!financialExpenseForm.dueDate) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Informe a data de vencimento da despesa.",
      );
      return;
    }
    if (amount === null) {
      showSaveFeedback(
        "error",
        "Dados invalidos",
        "Valor da despesa invalido.",
      );
      return;
    }

    setIsSavingExpense(true);
    try {
      const response = await fetch(`${API_BASE_URL}/financial/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          templateId: financialExpenseForm.templateId || null,
          category: financialExpenseForm.category,
          description: financialExpenseForm.description.trim(),
          competence: toCompetenceDateValue(financialCompetenceMonth),
          dueDate: `${financialExpenseForm.dueDate}T00:00:00`,
          amountCents: Math.round(amount * 100),
          status: financialExpenseForm.status,
          notes: financialExpenseForm.notes.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Nao foi possivel criar a despesa."),
        );
      }
      await loadFinancial();
      setFinancialExpenseForm((prev) => ({
        ...prev,
        description: "",
        amount: "",
        notes: "",
      }));
      showSaveFeedback("success", "Despesa criada", "Despesa registrada.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao criar despesa.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleUpdateExpenseStatus = async (
    expense: FinancialExpenseApiRecord,
    status: FinancialExpenseStatus,
  ) => {
    if (updatingExpenseId) {
      return;
    }
    setUpdatingExpenseId(expense.id);
    try {
      const payload: Record<string, unknown> = { status };
      if (status === "paid" && !expense.paidAt) {
        payload.paidAt = new Date().toISOString();
      }
      if (status !== "paid" && expense.paidAt) {
        payload.paidAt = null;
      }

      const response = await fetch(
        `${API_BASE_URL}/financial/expenses/${expense.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel atualizar status da despesa.",
          ),
        );
      }
      await loadFinancial();
      showSaveFeedback(
        "success",
        "Despesa atualizada",
        "Status da despesa atualizado.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao atualizar despesa.";
      showSaveFeedback("error", "Erro financeiro", message);
    } finally {
      setUpdatingExpenseId(null);
    }
  };

  const loadEventRegistrations = useCallback(async (eventId: string) => {
    setEventRegistrationsStatus("loading");
    setEventRegistrationsError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/registrations`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel carregar os inscritos do evento.",
          ),
        );
      }
      const payload = (await response.json()) as EventRegistrationApiRecord[];
      setEventRegistrations(payload);
      setEventRegistrationsStatus("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao carregar inscritos.";
      setEventRegistrations([]);
      setEventRegistrationsStatus("error");
      setEventRegistrationsError(message);
    }
  }, []);

  const openEventManagementModal = (event: EventItem) => {
    setManagedEvent(event);
    setConfirmingPaymentRegistrationId(null);
    void loadEventRegistrations(event.id);
  };

  const closeEventManagementModal = () => {
    setManagedEvent(null);
    setEventRegistrations([]);
    setEventRegistrationsStatus("idle");
    setEventRegistrationsError(null);
    setConfirmingPaymentRegistrationId(null);
  };

  const isRegistrationPaid = (registration: EventRegistrationApiRecord) =>
    registration.status !== "cancelled" &&
    Boolean(registration.paymentAmountCents && registration.paymentAmountCents > 0);

  const handleConfirmRegistrationPayment = async (
    registration: EventRegistrationApiRecord,
  ) => {
    if (!managedEvent || confirmingPaymentRegistrationId) {
      return;
    }

    const paymentMethod =
      registration.paymentMethod?.trim() ||
      (managedEvent.paymentMethod !== "-" ? managedEvent.paymentMethod : null);
    const paymentAmountCents =
      registration.paymentAmountCents && registration.paymentAmountCents > 0
        ? registration.paymentAmountCents
        : managedEvent.priceCents;

    if (managedEvent.paid) {
      if (!paymentMethod) {
        showSaveFeedback(
          "error",
          "Pagamento não confirmado",
          "Defina a forma de pagamento no evento antes de confirmar.",
        );
        return;
      }
      if (!paymentAmountCents || paymentAmountCents < 1) {
        showSaveFeedback(
          "error",
          "Pagamento não confirmado",
          "Defina o valor do evento antes de confirmar o pagamento.",
        );
        return;
      }
    }

    setConfirmingPaymentRegistrationId(registration.id);
    try {
      const response = await fetch(
        `${API_BASE_URL}/events/${managedEvent.id}/registrations/${registration.id}/confirm`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            managedEvent.paid
              ? {
                  paymentMethod,
                  paymentAmountCents,
                }
              : {},
          ),
        },
      );
      if (!response.ok) {
        throw new Error(
          await parseApiError(
            response,
            "Nao foi possivel confirmar o pagamento do inscrito.",
          ),
        );
      }

      await loadEventRegistrations(managedEvent.id);
      showSaveFeedback(
        "success",
        managedEvent.paid ? "Pagamento confirmado" : "Inscrição confirmada",
        managedEvent.paid
          ? "O pagamento do inscrito foi confirmado com sucesso."
          : "A inscrição foi confirmada com sucesso.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao confirmar pagamento do inscrito.";
      showSaveFeedback("error", "Erro ao confirmar pagamento", message);
    } finally {
      setConfirmingPaymentRegistrationId(null);
    }
  };

  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event) => {
      const eventDate = new Date(`${event.date}T00:00:00`);
      const isPast = eventDate < today;
      const isCancelled = event.status === "cancelado";
      if (eventFilter === "CANCELADOS") {
        return isCancelled;
      }
      if (eventFilter === "REALIZADOS") {
        return isPast && !isCancelled;
      }
      return !isPast && !isCancelled;
    });
  }, [eventFilter, events]);

  const selectedEvent = useMemo(
    () => selectedDayEvents[0] ?? filteredEvents[0] ?? null,
    [selectedDayEvents, filteredEvents],
  );
  const paidRegistrationsCount =
    managedEvent?.paid === true
      ? eventRegistrations.filter((registration) => isRegistrationPaid(registration))
          .length
      : 0;
  const unpaidRegistrationsCount =
    managedEvent?.paid === true
      ? eventRegistrations.filter(
          (registration) =>
            registration.status !== "cancelled" && !isRegistrationPaid(registration),
        ).length
      : 0;
  const cancelledRegistrationsCount = eventRegistrations.filter(
    (registration) => registration.status === "cancelled",
  ).length;

  const handleTabSelect = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsTabMenuOpen(false);
  };

  const patchSystemSettings = useCallback(
    async (payload: Record<string, unknown>, fallbackError: string) => {
      const response = await fetch(`${API_BASE_URL}/system-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, fallbackError));
      }
      const data = (await response.json()) as SystemSettingsApiRecord;
      setSystemSettingsForm(mapSystemSettingsToForm(data));
      setSystemSettingsStatus("ready");
      setSystemSettingsError(null);
      return data;
    },
    [],
  );

  const parseOptionalUrlField = (value: string, fieldLabel: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    try {
      return new URL(trimmed).toString();
    } catch {
      throw new Error(`${fieldLabel}: informe uma URL valida.`);
    }
  };

  const parseCloudinaryUrlField = (value: string, fieldLabel: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error(`${fieldLabel}: envie uma imagem para o Cloudinary.`);
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new Error(`${fieldLabel}: URL invalida.`);
    }

    if (parsed.hostname !== "res.cloudinary.com") {
      throw new Error(`${fieldLabel}: use apenas imagens enviadas ao Cloudinary.`);
    }

    return parsed.toString();
  };

  const handleOperatingHourChange = (
    day: SystemDay,
    field: "start" | "end",
    value: string,
  ) => {
    setSystemSettingsForm((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((entry) =>
        entry.day === day ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const handleSystemContactChange = (
    field: keyof SystemSettingsForm["contact"],
    value: string,
  ) => {
    setSystemSettingsForm((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  const handleSystemSocialChange = (
    field: keyof SystemSettingsForm["socialLinks"],
    value: string,
  ) => {
    setSystemSettingsForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  const handleCarouselCountChange = (nextCount: number) => {
    const safeCount = Math.max(0, Math.min(5, Math.trunc(nextCount)));
    setSystemSettingsForm((prev) => {
      const nextImages = prev.carouselImages.slice(0, safeCount);
      while (nextImages.length < safeCount) {
        nextImages.push({ imageUrl: "", altText: "" });
      }
      return {
        ...prev,
        carouselImages: nextImages,
      };
    });
  };

  const handleCarouselFieldChange = (
    index: number,
    field: "imageUrl" | "altText",
    value: string,
  ) => {
    setSystemSettingsForm((prev) => {
      const nextImages = [...prev.carouselImages];
      if (!nextImages[index]) {
        nextImages[index] = { imageUrl: "", altText: "" };
      }
      nextImages[index] = {
        ...nextImages[index],
        [field]: value,
      };
      return {
        ...prev,
        carouselImages: nextImages,
      };
    });
  };

  const handleCarouselFileChange = (index: number, file?: File) => {
    setCarouselImageFiles((prev) => {
      const next = [...prev];
      next[index] = file ?? null;
      return next;
    });
  };

  const uploadCarouselImageFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/system-settings/carousel/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(
        await parseApiError(
          response,
          "Nao foi possivel enviar a imagem do carrossel.",
        ),
      );
    }
    const payload = (await response.json()) as { imageUrl?: string | null };
    const imageUrl = payload.imageUrl?.trim() ?? "";
    if (!imageUrl) {
      throw new Error("Cloudinary nao retornou a URL da imagem.");
    }
    return imageUrl;
  };

  const handleSaveStudioSettings = async () => {
    if (isSavingStudioSettings) {
      return;
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    const invalidHour = systemSettingsForm.operatingHours.find(
      (entry) =>
        !timeRegex.test(entry.start) ||
        !timeRegex.test(entry.end) ||
        entry.start >= entry.end,
    );
    if (invalidHour) {
      showSaveFeedback(
        "error",
        "Horario invalido",
        `${systemDayLabel[invalidHour.day]}: use HH:MM com inicio menor que fim.`,
      );
      return;
    }

    let whatsappLink: string | undefined;
    let instagram: string | undefined;
    let facebook: string | undefined;
    let youtube: string | undefined;
    let tiktok: string | undefined;
    let other: string | undefined;
    try {
      whatsappLink = parseOptionalUrlField(
        systemSettingsForm.contact.whatsappLink,
        "WhatsApp",
      );
      instagram = parseOptionalUrlField(
        systemSettingsForm.socialLinks.instagram,
        "Instagram",
      );
      facebook = parseOptionalUrlField(
        systemSettingsForm.socialLinks.facebook,
        "Facebook",
      );
      youtube = parseOptionalUrlField(
        systemSettingsForm.socialLinks.youtube,
        "YouTube",
      );
      tiktok = parseOptionalUrlField(
        systemSettingsForm.socialLinks.tiktok,
        "TikTok",
      );
      other = parseOptionalUrlField(
        systemSettingsForm.socialLinks.other,
        "Outro link",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Uma URL informada e invalida.";
      showSaveFeedback("error", "Dados invalidos", message);
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (instagram) socialLinks.instagram = instagram;
    if (facebook) socialLinks.facebook = facebook;
    if (youtube) socialLinks.youtube = youtube;
    if (tiktok) socialLinks.tiktok = tiktok;
    if (other) socialLinks.other = other;

    const payload: Record<string, unknown> = {
      operatingHours: systemSettingsForm.operatingHours.map((entry) => ({
        day: entry.day,
        segments: [
          {
            start: entry.start,
            end: entry.end,
          },
        ],
      })),
      contact: {
        address: systemSettingsForm.contact.address.trim(),
        city: systemSettingsForm.contact.city.trim(),
        state: systemSettingsForm.contact.state.trim(),
        zipCode: systemSettingsForm.contact.zipCode.trim(),
        phone: systemSettingsForm.contact.phone.trim(),
        ...(whatsappLink ? { whatsappLink } : {}),
      },
    };

    if (Object.keys(socialLinks).length > 0) {
      payload.socialLinks = socialLinks;
    }

    setIsSavingStudioSettings(true);
    try {
      await patchSystemSettings(
        payload,
        "Nao foi possivel salvar as configuracoes do studio.",
      );
      showSaveFeedback(
        "success",
        "Studio atualizado",
        "Horarios, contatos e redes sociais foram salvos.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao salvar studio.";
      showSaveFeedback("error", "Erro ao salvar", message);
    } finally {
      setIsSavingStudioSettings(false);
    }
  };

  const handleSaveMaintenanceSettings = async () => {
    const normalizedRole = (currentUser?.role ?? "").trim().toUpperCase();
    if (normalizedRole !== "MASTER") {
      showSaveFeedback(
        "error",
        "Permissao insuficiente",
        "Somente MASTER pode ativar o modo manutencao.",
      );
      return;
    }

    if (isSavingMaintenanceSettings) {
      return;
    }
    setIsSavingMaintenanceSettings(true);
    try {
      await patchSystemSettings(
        {
          maintenanceMode: systemSettingsForm.maintenanceMode,
          maintenanceMessage: systemSettingsForm.maintenanceMessage.trim() || null,
        },
        "Nao foi possivel salvar o modo manutencao.",
      );
      showSaveFeedback(
        "success",
        "Sistema atualizado",
        "Configuracoes de manutencao foram salvas.",
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao salvar configuracoes do sistema.";
      showSaveFeedback("error", "Erro ao salvar", message);
    } finally {
      setIsSavingMaintenanceSettings(false);
    }
  };

  const handleDisableMaintenance = async () => {
    const normalizedRole = (currentUser?.role ?? "").trim().toUpperCase();
    if (normalizedRole !== "MASTER" && normalizedRole !== "ADMIN") {
      showSaveFeedback(
        "error",
        "Permissao insuficiente",
        "Somente MASTER ou ADMIN podem desativar o modo manutencao.",
      );
      return;
    }
    if (isSavingMaintenanceSettings) {
      return;
    }

    setIsSavingMaintenanceSettings(true);
    try {
      await patchSystemSettings(
        {
          maintenanceMode: false,
          maintenanceMessage: systemSettingsForm.maintenanceMessage.trim() || null,
        },
        "Nao foi possivel desativar o modo manutencao.",
      );
      showSaveFeedback(
        "success",
        "Manutencao desativada",
        "Sistema liberado novamente para todos os usuarios.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao desativar manutencao.";
      showSaveFeedback("error", "Erro ao desativar", message);
    } finally {
      setIsSavingMaintenanceSettings(false);
    }
  };

  const handleSaveHomepageSettings = async () => {
    if (isSavingHomepageSettings) {
      return;
    }

    setIsSavingHomepageSettings(true);
    try {
      const normalizedImages: Array<{ imageUrl: string; altText?: string }> = [];
      for (
        let index = 0;
        index < systemSettingsForm.carouselImages.length;
        index += 1
      ) {
        const image = systemSettingsForm.carouselImages[index];
        let imageUrl = image.imageUrl;
        const selectedFile = carouselImageFiles[index] ?? null;

        if (selectedFile) {
          setUploadingCarouselSlot(index);
          imageUrl = await uploadCarouselImageFile(selectedFile);
          handleCarouselFieldChange(index, "imageUrl", imageUrl);
        }

        try {
          const normalizedUrl = parseCloudinaryUrlField(
            imageUrl,
            `Slide ${index + 1}`,
          );
          normalizedImages.push({
            imageUrl: normalizedUrl,
            ...(image.altText.trim() ? { altText: image.altText.trim() } : {}),
          });
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : `Slide ${index + 1}: URL invalida.`;
          showSaveFeedback("error", "Imagem invalida", message);
          return;
        } finally {
          setUploadingCarouselSlot(null);
        }
      }

      await patchSystemSettings(
        { carouselImages: normalizedImages },
        "Nao foi possivel salvar o carrossel da homepage.",
      );
      setCarouselImageFiles(
        Array.from(
          { length: systemSettingsForm.carouselImages.length },
          () => null,
        ),
      );
      showSaveFeedback(
        "success",
        "Homepage atualizada",
        "As imagens do carrossel foram salvas.",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao salvar a homepage.";
      showSaveFeedback("error", "Erro ao salvar", message);
    } finally {
      setUploadingCarouselSlot(null);
      setIsSavingHomepageSettings(false);
    }
  };

  useEffect(() => {
    const year = eventMonth.getFullYear();
    const month = eventMonth.getMonth();
    const todayIso = toLocalDateKey(new Date());
    const todayDate = new Date(`${todayIso}T00:00:00`);
    const isTodayInMonth =
      todayDate.getFullYear() === year && todayDate.getMonth() === month;
    const monthEvents = events.filter((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    if (isTodayInMonth) {
      setSelectedEventDate(todayIso);
      return;
    }
    if (monthEvents.length > 0) {
      setSelectedEventDate(monthEvents[0].date);
      return;
    }
    const fallback = toLocalDateKey(new Date(year, month, 1));
    setSelectedEventDate(fallback);
  }, [eventMonth, events]);

  const cancelUserEdit = () => {
    setUserSaveError(null);
    setSelectedUser(null);
  };

  const displayName =
    currentUser?.name?.trim() ||
    currentUser?.email?.split("@")[0] ||
    "Visitante";
  const displayRole =
    currentUser?.role && roleLabelMap[currentUser.role as AdminUser["role"]]
      ? roleLabelMap[currentUser.role as AdminUser["role"]]
      : "Convidado";
  const avatarSrc = currentUser?.avatarUrl || currentUser?.image || "";
  const avatarLabel =
    currentUserStatus === "loading" ? "Carregando" : displayName;
  const userBirthAge = useMemo(
    () => calculateAgeFromBirthDate(userForm.birthDate),
    [userForm.birthDate],
  );
  const whatsappNumber = userForm.phone.replace(/\D/g, "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`
    : "#";
  const whatsappDisabled = !whatsappNumber;
  const selectedUserDisplayName = selectedUser
    ? userForm.name?.trim() ||
      selectedUser.name?.trim() ||
      selectedUser.email ||
      "Usuário"
    : "";
  const selectedUserAvatar = selectedUser
    ? userForm.image || selectedUser.avatarUrl || selectedUser.image || ""
    : "";
  const selectedUserEmail = selectedUser ? selectedUser.email : "";
  const healthUserDisplayName = healthUser
    ? healthUser.name?.trim() || healthUser.email || "Usuário"
    : "";
  const healthUserAvatar = healthUser
    ? healthUser.avatarUrl || healthUser.image || ""
    : "";
  const normalizedCurrentRole = (currentUser?.role ?? "").trim().toUpperCase();
  const canViewPrivateNotes = ["MASTER", "ADMIN", "COACH"].includes(
    normalizedCurrentRole,
  );
  const isCurrentUserMaster = normalizedCurrentRole === "MASTER";
  const isCurrentUserAdmin = normalizedCurrentRole === "ADMIN";
  const canManageMaintenanceToggle = isCurrentUserMaster;
  const canDisableMaintenance = isCurrentUserMaster || isCurrentUserAdmin;
  const modalLabelClass =
    "space-y-2 text-sm font-medium text-[var(--foreground)]";
  const modalInputClass =
    "w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition focus:border-[var(--gold-tone-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--border-glow)]";
  const modalErrorClass =
    "border-red-400 focus:border-red-400 focus:ring-red-400/40";
  const bmiFallback = useMemo(() => {
    const weightKg = parsePositive(healthForm.weightKg);
    const heightCm = normalizeHeightCm(healthForm.heightCm);
    if (!weightKg || !heightCm) {
      return null;
    }
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }, [healthForm.heightCm, healthForm.weightKg]);
  const bmiLabelFallback =
    bmiFallback !== null ? bmiCategoryFromAdult(bmiFallback) : null;

  return (
    <section className="relative flex min-h-screen flex-col gap-6 rounded-2xl border border-[color:var(--border-dim)] bg-gradient-to-br from-[var(--gradient-top)] via-[var(--background)] to-[var(--gradient-bottom)] p-4 text-[var(--foreground)] shadow-[0_20px_60px_var(--shadow)] sm:gap-8 sm:rounded-[32px] sm:p-6 font-[var(--font-roboto)]">
      <header className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-full items-start gap-3 sm:w-auto sm:items-center">
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-sm font-semibold text-[var(--foreground)] aspect-square">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={`Avatar de ${avatarLabel}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(displayName)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                  Usuario autenticado
                </p>
                <p className="mt-1 truncate text-base font-semibold text-[var(--foreground)]">
                  {currentUserStatus === "loading"
                    ? "Carregando..."
                    : displayName}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {currentUserStatus === "error"
                    ? "Sessao indisponivel"
                    : displayRole}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsTabMenuOpen((prev) => !prev)}
              aria-label="Menu do dashboard"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] text-[var(--foreground)] shadow-[0_4px_12px_-2px_var(--shadow),inset_0_1px_2px_rgba(255,255,255,0.1)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(194,165,55,0.2),inset_0_1px_2px_rgba(255,255,255,0.2)] sm:hidden"
            >
              <Menu className="h-5 w-5 text-[var(--gold-tone-dark)]" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 text-xs font-semibold uppercase tracking-[0.2rem] text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-70 sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isLoggingOut ? "Saindo..." : "Sair"}
              </span>
            </button>
          </div>
        </div>

        <nav className="hidden w-full items-center gap-2 overflow-x-auto rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-2 text-[0.65rem] font-semibold uppercase tracking-[0.3rem] sm:flex sm:flex-wrap sm:gap-4 sm:p-3 sm:text-xs font-[var(--font-roboto)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 transition sm:px-4 ${
                activeTab === tab.id
                  ? "border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)] shadow-[0_10px_24px_-18px_var(--gold-tone)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:border-[color:var(--border-dim)] hover:text-[var(--gold-tone-dark)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {currentTab && (
          <div className="hidden rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 text-sm text-[var(--muted-foreground)] sm:block">
            {currentTab.description}
          </div>
        )}

        {isTabMenuOpen && (
          <div className="w-full rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-3 text-xs font-semibold uppercase tracking-[0.25rem] text-[var(--foreground)] sm:hidden font-[var(--font-roboto)]">
            <div className="grid gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    activeTab === tab.id
                      ? "border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)] shadow-[0_10px_24px_-18px_var(--gold-tone)]"
                      : "border-transparent text-[var(--muted-foreground)] hover:border-[color:var(--border-dim)] hover:text-[var(--gold-tone-dark)]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

      </header>

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold">Usuarios cadastrados</h2>
            <button className="rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]">
              Novo usuario
            </button>
          </div>

          <div className="flex w-full items-center gap-2 overflow-x-auto rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-2 sm:flex-wrap sm:gap-3 sm:p-3">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setUserFilter(option.value)}
                className={`shrink-0 rounded-full border px-3 py-2 text-[0.55rem] uppercase tracking-[0.25em] transition sm:px-4 sm:text-xs sm:tracking-[0.35em] ${
                  userFilter === option.value
                    ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone)]"
                    : "border-[color:var(--border-dim)] text-[var(--muted-foreground)] hover:border-[color:var(--gold-tone-dark)] hover:text-[var(--foreground)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--border-dim)]">
            <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr_0.9fr] gap-2 bg-[color:var(--card)] px-4 py-3 text-[0.6rem] uppercase tracking-[0.35em] text-[var(--muted-foreground)] md:grid">
              <span>Nome</span>
              <span>Email</span>
              <span>CPF</span>
              <span>Telefone</span>
              <span>Perfil</span>
              <span className="text-right">Ações</span>
            </div>
            <div className="divide-y divide-[color:var(--border-dim)]">
              {usersStatus === "loading" && (
                <div className="bg-[color:var(--card)] px-4 py-6 text-sm text-[var(--muted-foreground)]">
                  Carregando usuarios...
                </div>
              )}
              {usersStatus === "error" && (
                <div className="bg-[color:var(--card)] px-4 py-6 text-sm text-[var(--muted-foreground)]">
                  {usersError || "Nao foi possivel carregar usuarios."}
                </div>
              )}
              {usersStatus === "ready" && users.length === 0 && (
                <div className="bg-[color:var(--card)] px-4 py-6 text-sm text-[var(--muted-foreground)]">
                  Nenhum usuario encontrado.
                </div>
              )}
              {users
                .filter((user) => {
                  if (userFilter === "ALL") {
                    return true;
                  }
                  if (userFilter === "ADMIN") {
                    return user.role === "ADMIN" || user.role === "MASTER";
                  }
                  return user.role === userFilter;
                })
                .map((user) => {
                  const displayName =
                    user.name?.trim() || user.email || "Sem nome";
                  const avatarUrl = user.avatarUrl || user.image || "";
                  const roleLabel = roleLabelMap[user.role];
                  return (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 bg-[color:var(--card)] px-4 py-4 text-sm text-[var(--foreground)] md:grid md:grid-cols-[1.4fr_1.4fr_1fr_1fr_1fr_0.9fr] md:items-center md:gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-xs font-semibold text-[var(--foreground)] aspect-square">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={`Foto de ${displayName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{getInitials(displayName)}</span>
                          )}
                        </div>
                        <span className="font-semibold">{displayName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-[var(--muted-foreground)] md:contents">
                        <div className="space-y-1 text-xs text-[var(--muted-foreground)] md:text-sm">
                          <span className="block uppercase tracking-[0.3em] md:hidden">
                            Email
                          </span>
                          <span className="text-sm md:text-[var(--muted-foreground)]">
                            {user.email}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-[var(--muted-foreground)] md:text-sm">
                          <span className="block uppercase tracking-[0.3em] md:hidden">
                            CPF
                          </span>
                          <span className="text-sm md:text-[var(--muted-foreground)]">
                            {user.cpf || "-"}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-[var(--muted-foreground)] md:text-sm">
                          <span className="block uppercase tracking-[0.3em] md:hidden">
                            Telefone
                          </span>
                          <span className="text-sm md:text-[var(--muted-foreground)]">
                            {user.phone || "-"}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-[var(--muted-foreground)] md:text-sm">
                          <span className="block uppercase tracking-[0.3em] md:hidden">
                            Perfil
                          </span>
                          <span className="text-sm md:text-[var(--muted-foreground)]">
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-start gap-2 pt-1 md:justify-end md:pt-0">
                        <button
                          onClick={() => openUserModal(user)}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-3 py-2 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--gold-tone)]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold">Eventos cadastrados</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openEventModal("create")}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)]"
              >
                Novo evento
              </button>
              <button
                onClick={() =>
                  selectedEvent ? openEventModal("edit", selectedEvent) : undefined
                }
                disabled={!selectedEvent}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--muted-foreground)] hover:text-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Editar evento
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent?.id)}
                disabled={!selectedEvent || isDeletingEvent}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-4 text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingEvent ? "Apagando..." : "Apagar evento"}
              </button>
              <button
                onClick={() => handleCancelEvent(selectedEvent?.id)}
                disabled={
                  !selectedEvent ||
                  selectedEvent.status === "cancelado" ||
                  isCancellingEvent
                }
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar evento
              </button>
            </div>
          </div>

          {eventsStatus === "loading" && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Carregando eventos...
            </p>
          )}
          {eventsStatus === "error" && (
            <p className="text-sm text-[color:var(--danger)]">
              {eventsError ?? "Nao foi possivel carregar eventos."}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <section className="relative w-full overflow-hidden rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--gold-tone)]/10 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-[var(--gold-tone-dark)]/10 blur-3xl animate-[float_10s_ease-in-out_infinite]" />

              <div className="relative flex items-center justify-center gap-3 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--gold-tone-dark)]">
                  {eventMonthLabel}
                </p>
                <div className="absolute right-4 flex items-center gap-2">
                  <button
                    onClick={() =>
                      setEventMonth(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-dim)] text-[var(--gold-tone-dark)] transition hover:border-[var(--gold-tone)] hover:text-[var(--gold-tone)]"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() =>
                      setEventMonth(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-dim)] text-[var(--gold-tone-dark)] transition hover:border-[var(--gold-tone)] hover:text-[var(--gold-tone)]"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="mt-4 w-full">
                <div className="grid grid-cols-7 gap-2 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(
                    (label) => (
                      <span
                        key={label}
                        className={`text-center ${
                          label === "Dom" || label === "Sab"
                            ? "text-[var(--gold-tone-dark)]"
                            : ""
                        }`}
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {eventMonthDays.map((day, index) => {
                    if (!day.inMonth || !day.day) {
                      return <div key={`empty-${index}`} className="h-12 w-full" />;
                    }
                    const events = eventsByDate.get(day.date) ?? [];
                    const hasEvent = events.length > 0;
                    const weekdayIndex = index % 7;
                    const isWeekend = weekdayIndex === 0 || weekdayIndex === 6;
                    const isSelected = selectedEventDate === day.date;
                    return (
                      <button
                        type="button"
                        key={day.date}
                        onClick={() => setSelectedEventDate(day.date)}
                        className={`group relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition duration-200 ease-out ${
                          day.inMonth
                            ? "bg-[color:var(--calendar-day-bg)] text-[color:var(--calendar-day-text)]"
                            : "bg-[color:var(--calendar-day-muted-bg)] text-[color:var(--calendar-day-muted-text)]"
                        } ${
                          isWeekend && day.inMonth
                            ? "text-[var(--calendar-weekend-text)]"
                            : ""
                        } ${
                          hasEvent
                            ? "ring-1 ring-[var(--gold-tone)]/50 shadow-[0_10px_22px_-16px_var(--gold-tone)]"
                            : ""
                        } ${
                          isSelected
                            ? "outline outline-2 outline-[var(--gold-tone)] outline-offset-2"
                            : ""
                        } hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_12px_24px_-16px_var(--gold-tone)]`}
                      >
                        {hasEvent && (
                          <span className="pointer-events-none absolute inset-1 rounded-xl bg-gradient-to-br from-[var(--gold-tone)]/20 via-transparent to-[var(--gold-tone-dark)]/20 opacity-0 transition duration-200 group-hover:opacity-100" />
                        )}
                        {day.day}
                        {hasEvent && (
                          <span className="absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--gold-tone)] animate-[float_4s_ease-in-out_infinite] transition group-hover:scale-125" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="w-full rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                Eventos do dia
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {selectedEventDate
                  ? new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "full",
                    }).format(new Date(`${selectedEventDate}T00:00:00`))
                  : "Selecione uma data"}
              </p>
              <div className="mt-4 space-y-3">
                {selectedDayEvents.length === 0 && (
                  <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
                    <p>Nada foi agendado para este dia.</p>
                    <button
                      onClick={() =>
                        openEventModal(
                          "create",
                          undefined,
                          selectedEventDate ?? undefined,
                        )
                      }
                      className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-xs uppercase tracking-[0.3em] text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)]"
                    >
                      Criar evento
                    </button>
                  </div>
                )}
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                  >
                    {event.thumbnailUrl ? (
                      <img
                        src={event.thumbnailUrl}
                        alt={`Imagem do evento ${event.title}`}
                        className="h-36 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                        Sem imagem
                      </div>
                    )}
                    <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      {event.date} • {event.time}
                      {event.endTime ? ` - ${event.endTime}` : ""} •{" "}
                      {event.location}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                      {event.title}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {event.description}
                    </p>
                    <div className="mt-3 grid gap-2 text-xs text-[var(--muted-foreground)]">
                      <span>
                        Status:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.status === "cancelado"
                            ? "Cancelado"
                            : event.status}
                        </strong>
                      </span>
                      <span>
                        Acesso:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.access === "open"
                            ? "Aberto"
                            : "Com inscricao"}
                        </strong>
                      </span>
                      <span>
                        Capacidade:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.capacity ?? "Livre"}
                        </strong>
                      </span>
                      <span>
                        Confirmadas:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.access === "open"
                            ? "-"
                            : `${event.confirmedRegistrations}${
                                event.capacity !== null ? ` / ${event.capacity}` : ""
                              }`}
                        </strong>
                      </span>
                      <span>
                        Confirmacao:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.requiresConfirmation ? "Obrigatoria" : "Nao"}
                        </strong>
                      </span>
                      <span>
                        Pagamento:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.paid ? event.price : "Gratuito"}
                        </strong>
                      </span>
                      {event.paid && (
                        <span>
                          Forma de pagamento:{" "}
                          <strong className="text-[var(--foreground)]">
                            {event.paymentMethod}
                          </strong>
                        </span>
                      )}
                      <span>
                        Convidados:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.allowGuests ? "Permitidos" : "Somente alunos"}
                        </strong>
                      </span>
                      <span>
                        Destaque:{" "}
                        <strong className="text-[var(--foreground)]">
                          {event.isFeatured ? "Sim" : "Nao"}
                        </strong>
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openEventModal("edit", event)}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--muted-foreground)] hover:text-[var(--gold-tone-dark)]"
                      >
                        Editar evento
                      </button>
                      <button
                        onClick={() => openEventManagementModal(event)}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--gold-tone)]"
                      >
                        Gerenciar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["FUTUROS", "CANCELADOS", "REALIZADOS"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setEventFilter(status)}
                className={`rounded-full border px-4 py-2 text-[0.6rem] uppercase tracking-[0.3em] transition ${
                  eventFilter === status
                    ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                    : "border-[color:var(--border-dim)] text-[var(--muted-foreground)] hover:text-[var(--gold-tone-dark)]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                      {event.status === "cancelado"
                        ? "Cancelado"
                        : event.status}
                    </p>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {event.date} • {event.time} • {event.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.isFeatured && (
                      <div className="rounded-xl border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone-dark)]">
                        Destaque
                      </div>
                    )}
                    <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      {event.paid ? "Pago" : "Gratuito"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-5">
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Vagas
                    </p>
                    <p className="mt-1 text-[var(--foreground)]">
                      {event.capacity ?? "Livre"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Confirmadas
                    </p>
                    <p className="mt-1 text-[var(--foreground)]">
                      {event.access === "open"
                        ? "-"
                        : `${event.confirmedRegistrations}${
                            event.capacity !== null ? ` / ${event.capacity}` : ""
                          }`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Confirmacao
                    </p>
                    <p className="mt-1 text-[var(--foreground)]">
                      {event.requiresConfirmation ? "Obrigatoria" : "Nao"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Pagamento
                    </p>
                    <p className="mt-1 text-[var(--foreground)]">{event.price}</p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Convidados
                    </p>
                    <p className="mt-1 text-[var(--foreground)]">
                      {event.allowGuests ? "Permitidos" : "Somente alunos"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => openEventModal("edit", event)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => openEventManagementModal(event)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-tone)]/40 bg-[color:var(--card)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone-dark)]"
                  >
                    Gerenciar
                  </button>
                  <button
                    onClick={() => handleTogglePublishEvent(event)}
                    disabled={
                      event.status === "cancelado" || eventsStatus === "loading"
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {event.status === "publicado" ? "Despublicar" : "Publicar"}
                  </button>
                </div>
              </article>
            ))}
            {filteredEvents.length === 0 && (
              <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 text-sm text-[var(--muted-foreground)]">
                Nenhum evento encontrado para este filtro.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "financial" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">Gerenciamento financeiro</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Assinaturas, recebiveis, pagamentos e despesas por competencia.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                  Competencia
                </label>
                <input
                  type="month"
                  value={financialCompetenceMonth}
                  onChange={(event) =>
                    setFinancialCompetenceMonth(event.target.value)
                  }
                  className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                />
                <button
                  onClick={() => void loadFinancial()}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]"
                >
                  Atualizar
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => void handleGenerateReceivables()}
                disabled={isGeneratingReceivables}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingReceivables ? "Gerando..." : "Gerar recebiveis"}
              </button>
              <button
                onClick={() => void handleGenerateExpenses()}
                disabled={isGeneratingExpenses}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingExpenses ? "Gerando..." : "Gerar despesas"}
              </button>
              <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                Competencia ativa: {formatDatePtBr(toCompetenceDateValue(financialCompetenceMonth))}
              </span>
            </div>
          </section>

          {financialStatus === "loading" && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Carregando financeiro...
            </p>
          )}

          {financialStatus === "error" && (
            <div className="space-y-3 rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4">
              <p className="text-sm text-[color:var(--danger)]">
                {financialError ?? "Nao foi possivel carregar o financeiro."}
              </p>
              <button
                onClick={() => void loadFinancial()}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--danger-border)] px-4 text-xs uppercase tracking-[0.3em] text-[color:var(--danger)]"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {financialStatus === "ready" && (
            <>
              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Recebiveis
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {formatCurrencyFromCents(financialSummary.receivablesCents)}
                  </p>
                </article>
                <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Recebido
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {formatCurrencyFromCents(financialSummary.receivedCents)}
                  </p>
                </article>
                <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Pendente
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {formatCurrencyFromCents(financialSummary.pendingCents)}
                  </p>
                </article>
                <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Despesas
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {formatCurrencyFromCents(financialSummary.expensesCents)}
                  </p>
                </article>
                <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Resultado realizado
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {formatCurrencyFromCents(financialSummary.realizedBalanceCents)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Previsto: {formatCurrencyFromCents(financialSummary.expectedBalanceCents)}
                  </p>
                </article>
              </section>

              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold">Recebiveis e pagamentos</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setFinancialReceivableStatusFilter("all")}
                      className={`rounded-full border px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] ${
                        financialReceivableStatusFilter === "all"
                          ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                          : "border-[color:var(--border-dim)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      Todos
                    </button>
                    {(["open", "overdue", "paid"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFinancialReceivableStatusFilter(status)}
                        className={`rounded-full border px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] ${
                          financialReceivableStatusFilter === status
                            ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                            : "border-[color:var(--border-dim)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {FINANCIAL_RECEIVABLE_STATUS_LABEL_MAP[status]}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredFinancialReceivables.length === 0 && (
                  <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
                    Nenhum recebivel encontrado para o filtro selecionado.
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-2">
                  {filteredFinancialReceivables.map((receivable) => {
                    const draft = getReceivablePaymentDraft(receivable);
                    const outstanding = getReceivableOutstandingCents(receivable);
                    const canRegisterPayment =
                      ["open", "overdue"].includes(receivable.status) &&
                      outstanding > 0;
                    const userLabel =
                      userNameById.get(receivable.userId) ||
                      `Usuario ${receivable.userId.slice(0, 8)}`;
                    return (
                      <article
                        key={receivable.id}
                        className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                              {FINANCIAL_RECEIVABLE_STATUS_LABEL_MAP[receivable.status]}
                            </p>
                            <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                              {userLabel}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Vencimento: {formatDatePtBr(receivable.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                              Aberto
                            </p>
                            <p className="text-base font-semibold text-[var(--foreground)]">
                              {formatCurrencyFromCents(outstanding)}
                            </p>
                          </div>
                        </div>

                        {canRegisterPayment ? (
                          <>
                            <div className="mt-4 grid gap-2 md:grid-cols-2">
                              <input
                                value={draft.amount}
                                onChange={(event) =>
                                  updateReceivablePaymentDraft(receivable.id, {
                                    amount: event.target.value,
                                  })
                                }
                                placeholder="Valor (ex: 120.00)"
                                className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                              />
                              <select
                                value={draft.method}
                                onChange={(event) =>
                                  updateReceivablePaymentDraft(receivable.id, {
                                    method: event.target.value as FinancialPaymentMethod,
                                  })
                                }
                                className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                              >
                                {FINANCIAL_PAYMENT_METHOD_OPTIONS.map((method) => (
                                  <option key={method} value={method}>
                                    {FINANCIAL_PAYMENT_METHOD_LABEL_MAP[method]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <textarea
                              value={draft.notes}
                              onChange={(event) =>
                                updateReceivablePaymentDraft(receivable.id, {
                                  notes: event.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Observacoes do pagamento (opcional)"
                              className="mt-2 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                            />
                            <button
                              onClick={() => void handleCreatePayment(receivable)}
                              disabled={isSavingPaymentId === receivable.id}
                              className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-4 text-xs uppercase tracking-[0.3em] text-[color:var(--success)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isSavingPaymentId === receivable.id
                                ? "Registrando..."
                                : "Registrar pagamento"}
                            </button>
                          </>
                        ) : (
                          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                            Recebivel sem saldo pendente para pagamento.
                          </p>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-4 xl:grid-cols-2">
                <article className="space-y-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xl font-semibold">Assinaturas</h3>
                    <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                      Ativas: {activeSubscriptionsCount}
                    </span>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <select
                      value={financialSubscriptionForm.userId}
                      onChange={(event) =>
                        setFinancialSubscriptionForm((prev) => ({
                          ...prev,
                          userId: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    >
                      <option value="">Selecione o usuario</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name?.trim() || user.email}
                        </option>
                      ))}
                    </select>
                    <select
                      value={financialSubscriptionForm.planId}
                      onChange={(event) =>
                        setFinancialSubscriptionForm((prev) => ({
                          ...prev,
                          planId: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    >
                      <option value="">Selecione o plano</option>
                      {plans
                        .filter((plan) => plan.active !== false)
                        .map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                    </select>
                    <input
                      type="date"
                      value={financialSubscriptionForm.startsAt}
                      onChange={(event) =>
                        setFinancialSubscriptionForm((prev) => ({
                          ...prev,
                          startsAt: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                    <select
                      value={financialSubscriptionForm.dueDateMode}
                      onChange={(event) =>
                        setFinancialSubscriptionForm((prev) => ({
                          ...prev,
                          dueDateMode: event.target.value as "fixed_day" | "custom_date",
                        }))
                      }
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    >
                      <option value="fixed_day">Dia fixo</option>
                      <option value="custom_date">Data customizada</option>
                    </select>
                    {financialSubscriptionForm.dueDateMode === "fixed_day" ? (
                      <input
                        value={financialSubscriptionForm.billingDay}
                        onChange={(event) =>
                          setFinancialSubscriptionForm((prev) => ({
                            ...prev,
                            billingDay: event.target.value,
                          }))
                        }
                        placeholder="Dia vencimento (1-31)"
                        className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                      />
                    ) : (
                      <>
                        <input
                          type="date"
                          value={financialSubscriptionForm.customDueDate}
                          onChange={(event) =>
                            setFinancialSubscriptionForm((prev) => ({
                              ...prev,
                              customDueDate: event.target.value,
                            }))
                          }
                          className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                        />
                        <input
                          value={financialSubscriptionForm.customDueDay}
                          onChange={(event) =>
                            setFinancialSubscriptionForm((prev) => ({
                              ...prev,
                              customDueDay: event.target.value,
                            }))
                          }
                          placeholder="Ou dia customizado (1-31)"
                          className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                        />
                      </>
                    )}
                  </div>
                  <textarea
                    value={financialSubscriptionForm.notes}
                    onChange={(event) =>
                      setFinancialSubscriptionForm((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Observacoes da assinatura"
                    className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <input
                      type="checkbox"
                      checked={financialSubscriptionForm.replaceActive}
                      onChange={(event) =>
                        setFinancialSubscriptionForm((prev) => ({
                          ...prev,
                          replaceActive: event.target.checked,
                        }))
                      }
                    />
                    Substituir assinatura ativa automaticamente
                  </label>
                  <button
                    onClick={() => void handleSaveFinancialSubscription()}
                    disabled={isSavingSubscription}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-xs uppercase tracking-[0.3em] text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingSubscription ? "Salvando..." : "Criar assinatura"}
                  </button>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => setFinancialSubscriptionStatusFilter("all")}
                      className={`rounded-full border px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] ${
                        financialSubscriptionStatusFilter === "all"
                          ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                          : "border-[color:var(--border-dim)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      Todos
                    </button>
                    {FINANCIAL_SUBSCRIPTION_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => setFinancialSubscriptionStatusFilter(status)}
                        className={`rounded-full border px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] ${
                          financialSubscriptionStatusFilter === status
                            ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                            : "border-[color:var(--border-dim)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {FINANCIAL_SUBSCRIPTION_STATUS_LABEL_MAP[status]}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    {filteredFinancialSubscriptions.map((subscription) => {
                      const userLabel =
                        userNameById.get(subscription.userId) ||
                        `Usuario ${subscription.userId.slice(0, 8)}`;
                      const planLabel =
                        subscription.planNameSnapshot ||
                        planNameById.get(subscription.planId) ||
                        `Plano ${subscription.planId.slice(0, 8)}`;
                      return (
                        <article
                          key={subscription.id}
                          className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {userLabel}
                            </p>
                            <span className="rounded-full border border-[color:var(--border-dim)] px-2 py-1 text-[0.6rem] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                              {FINANCIAL_SUBSCRIPTION_STATUS_LABEL_MAP[subscription.status]}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            {planLabel} •{" "}
                            {formatCurrencyFromCents(
                              subscription.monthlyAmountCentsSnapshot,
                            )}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Inicio: {formatDateTimePtBr(subscription.startsAt)}
                            {" • "}
                            Fim: {formatDateTimePtBr(subscription.endsAt)}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {subscription.status !== "active" && (
                              <button
                                onClick={() =>
                                  void handleUpdateSubscriptionStatus(
                                    subscription.id,
                                    "active",
                                  )
                                }
                                disabled={updatingSubscriptionId === subscription.id}
                                className="rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-[color:var(--success)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Ativar
                              </button>
                            )}
                            {subscription.status === "active" && (
                              <button
                                onClick={() =>
                                  void handleUpdateSubscriptionStatus(
                                    subscription.id,
                                    "paused",
                                  )
                                }
                                disabled={updatingSubscriptionId === subscription.id}
                                className="rounded-full border border-[color:var(--border-dim)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Pausar
                              </button>
                            )}
                            {subscription.status !== "cancelled" && (
                              <button
                                onClick={() =>
                                  void handleUpdateSubscriptionStatus(
                                    subscription.id,
                                    "cancelled",
                                  )
                                }
                                disabled={updatingSubscriptionId === subscription.id}
                                className="rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-[color:var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                    {filteredFinancialSubscriptions.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Nenhuma assinatura encontrada para o filtro selecionado.
                      </p>
                    )}
                  </div>
                </article>

                <article className="space-y-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
                  <h3 className="text-xl font-semibold">Templates de despesas</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      value={financialExpenseTemplateForm.name}
                      onChange={(event) =>
                        setFinancialExpenseTemplateForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Nome do template"
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                    <select
                      value={financialExpenseTemplateForm.category}
                      onChange={(event) =>
                        setFinancialExpenseTemplateForm((prev) => ({
                          ...prev,
                          category: event.target.value as FinancialExpenseCategory,
                        }))
                      }
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    >
                      {FINANCIAL_EXPENSE_CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {FINANCIAL_EXPENSE_CATEGORY_LABEL_MAP[category]}
                        </option>
                      ))}
                    </select>
                    <input
                      value={financialExpenseTemplateForm.defaultAmount}
                      onChange={(event) =>
                        setFinancialExpenseTemplateForm((prev) => ({
                          ...prev,
                          defaultAmount: event.target.value,
                        }))
                      }
                      placeholder="Valor padrao (ex: 100.00)"
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                    <input
                      value={financialExpenseTemplateForm.billingDay}
                      onChange={(event) =>
                        setFinancialExpenseTemplateForm((prev) => ({
                          ...prev,
                          billingDay: event.target.value,
                        }))
                      }
                      placeholder="Dia de vencimento (1-31)"
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                  </div>
                  <textarea
                    value={financialExpenseTemplateForm.notes}
                    onChange={(event) =>
                      setFinancialExpenseTemplateForm((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Observacoes do template"
                    className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <input
                      type="checkbox"
                      checked={financialExpenseTemplateForm.active}
                      onChange={(event) =>
                        setFinancialExpenseTemplateForm((prev) => ({
                          ...prev,
                          active: event.target.checked,
                        }))
                      }
                    />
                    Template ativo
                  </label>
                  <button
                    onClick={() => void handleSaveExpenseTemplate()}
                    disabled={isSavingExpenseTemplate}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-xs uppercase tracking-[0.3em] text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingExpenseTemplate ? "Salvando..." : "Criar template"}
                  </button>

                  <div className="grid gap-3">
                    {financialExpenseTemplates.map((template) => (
                      <article
                        key={template.id}
                        className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {template.name}
                          </p>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {template.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {FINANCIAL_EXPENSE_CATEGORY_LABEL_MAP[template.category]} •{" "}
                          {formatCurrencyFromCents(template.defaultAmountCents)} • dia{" "}
                          {template.billingDay}
                        </p>
                        <button
                          onClick={() => void handleToggleExpenseTemplate(template)}
                          disabled={updatingExpenseTemplateId === template.id}
                          className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-3 text-[0.6rem] uppercase tracking-[0.25em] text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingExpenseTemplateId === template.id
                            ? "Atualizando..."
                            : template.active
                              ? "Desativar"
                              : "Ativar"}
                        </button>
                      </article>
                    ))}
                    {financialExpenseTemplates.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Nenhum template cadastrado.
                      </p>
                    )}
                  </div>
                </article>
              </section>

              <section className="space-y-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold">Despesas da competencia</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setFinancialExpenseStatusFilter("all")}
                      className={`rounded-full border px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] ${
                        financialExpenseStatusFilter === "all"
                          ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                          : "border-[color:var(--border-dim)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      Todas
                    </button>
                    {FINANCIAL_EXPENSE_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        onClick={() => setFinancialExpenseStatusFilter(status)}
                        className={`rounded-full border px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] ${
                          financialExpenseStatusFilter === status
                            ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                            : "border-[color:var(--border-dim)] text-[var(--muted-foreground)]"
                        }`}
                      >
                        {FINANCIAL_EXPENSE_STATUS_LABEL_MAP[status]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <select
                    value={financialExpenseForm.templateId}
                    onChange={(event) => {
                      const templateId = event.target.value;
                      const template = financialExpenseTemplates.find(
                        (item) => item.id === templateId,
                      );
                      setFinancialExpenseForm((prev) => ({
                        ...prev,
                        templateId,
                        category: template?.category ?? prev.category,
                        description: template ? template.name : prev.description,
                        amount: template
                          ? (template.defaultAmountCents / 100).toFixed(2)
                          : prev.amount,
                      }));
                    }}
                    className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                  >
                    <option value="">Sem template</option>
                    {financialExpenseTemplates
                      .filter((template) => template.active)
                      .map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                  </select>
                  <select
                    value={financialExpenseForm.category}
                    onChange={(event) =>
                      setFinancialExpenseForm((prev) => ({
                        ...prev,
                        category: event.target.value as FinancialExpenseCategory,
                      }))
                    }
                    className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                  >
                    {FINANCIAL_EXPENSE_CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {FINANCIAL_EXPENSE_CATEGORY_LABEL_MAP[category]}
                      </option>
                    ))}
                  </select>
                  <select
                    value={financialExpenseForm.status}
                    onChange={(event) =>
                      setFinancialExpenseForm((prev) => ({
                        ...prev,
                        status: event.target.value as FinancialExpenseStatus,
                      }))
                    }
                    className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                  >
                    {FINANCIAL_EXPENSE_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {FINANCIAL_EXPENSE_STATUS_LABEL_MAP[status]}
                      </option>
                    ))}
                  </select>
                  <input
                    value={financialExpenseForm.description}
                    onChange={(event) =>
                      setFinancialExpenseForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Descricao da despesa"
                    className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)] md:col-span-2"
                  />
                  <input
                    type="date"
                    value={financialExpenseForm.dueDate}
                    onChange={(event) =>
                      setFinancialExpenseForm((prev) => ({
                        ...prev,
                        dueDate: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                  <input
                    value={financialExpenseForm.amount}
                    onChange={(event) =>
                      setFinancialExpenseForm((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="Valor (ex: 100.00)"
                    className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                  <textarea
                    value={financialExpenseForm.notes}
                    onChange={(event) =>
                      setFinancialExpenseForm((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    rows={2}
                    placeholder="Observacoes"
                    className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)] md:col-span-2"
                  />
                  <button
                    onClick={() => void handleSaveExpense()}
                    disabled={isSavingExpense}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-xs uppercase tracking-[0.3em] text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingExpense ? "Salvando..." : "Criar despesa"}
                  </button>
                </div>

                <div className="grid gap-3">
                  {filteredFinancialExpenses.map((expense) => (
                    <article
                      key={expense.id}
                      className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {expense.description}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {FINANCIAL_EXPENSE_CATEGORY_LABEL_MAP[expense.category]} •
                            vencimento {formatDatePtBr(expense.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {formatCurrencyFromCents(expense.amountCents)}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {FINANCIAL_EXPENSE_STATUS_LABEL_MAP[expense.status]}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {expense.status !== "approved" && (
                          <button
                            onClick={() => void handleUpdateExpenseStatus(expense, "approved")}
                            disabled={updatingExpenseId === expense.id}
                            className="rounded-full border border-[color:var(--border-dim)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Aprovar
                          </button>
                        )}
                        {expense.status !== "paid" && (
                          <button
                            onClick={() => void handleUpdateExpenseStatus(expense, "paid")}
                            disabled={updatingExpenseId === expense.id}
                            className="rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-[color:var(--success)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Marcar paga
                          </button>
                        )}
                        {expense.status !== "planned" && (
                          <button
                            onClick={() => void handleUpdateExpenseStatus(expense, "planned")}
                            disabled={updatingExpenseId === expense.id}
                            className="rounded-full border border-[color:var(--border-dim)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Voltar planejada
                          </button>
                        )}
                        {expense.status !== "cancelled" && (
                          <button
                            onClick={() => void handleUpdateExpenseStatus(expense, "cancelled")}
                            disabled={updatingExpenseId === expense.id}
                            className="rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-3 py-2 text-[0.6rem] uppercase tracking-[0.25em] text-[color:var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                  {filteredFinancialExpenses.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Nenhuma despesa cadastrada na competencia.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === "admin" && (
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold">Relatorios administrativos</h2>
            <button className="rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]">
              Gerar relatorios
            </button>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
              Selecione os relatorios
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                "Faturamento por periodo",
                "Recebiveis pendentes",
                "Check-ins por usuario",
                "Frequencia mensal",
                "Eventos pagos",
                "Planos ativos vs inativos",
              ].map((label) => {
                const selected = selectedReports.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() =>
                      setSelectedReports((prev) =>
                        prev.includes(label)
                          ? prev.filter((item) => item !== label)
                          : [...prev, label],
                      )
                    }
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                      selected
                        ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                        : "border-[color:var(--border-dim)] text-[var(--muted-foreground)] hover:text-[var(--gold-tone-dark)]"
                    }`}
                  >
                    <span className="font-semibold">{label}</span>
                    <span className="text-xs uppercase tracking-[0.3em]">
                      {selected ? "Selecionado" : "Selecionar"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-xs uppercase tracking-[0.3em] text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)]">
                Gerar agora
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-5 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                Limpar selecao
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "system" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
            <h2 className="text-2xl font-semibold">Configurações do sistema</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Studio, Sistema e Homepage com persistência no backend.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {systemSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSystemSection(section.id)}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                    systemSection === section.id
                      ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/10 text-[var(--gold-tone-dark)]"
                      : "border-[color:var(--border-dim)] text-[var(--muted-foreground)] hover:text-[var(--gold-tone-dark)]"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
              {systemSections.find((section) => section.id === systemSection)
                ?.description ?? ""}
            </p>
          </section>

          {systemSettingsStatus === "loading" && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Carregando configurações...
            </p>
          )}

          {systemSettingsStatus === "error" && (
            <div className="space-y-3 rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4">
              <p className="text-sm text-[color:var(--danger)]">
                {systemSettingsError ??
                  "Nao foi possivel carregar as configuracoes do sistema."}
              </p>
              <button
                onClick={() => void loadSystemSettings()}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--danger-border)] px-4 text-xs uppercase tracking-[0.3em] text-[color:var(--danger)]"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {systemSettingsStatus !== "loading" && (
            <>
              {systemSection === "studio" && (
                <section className="grid gap-4 lg:grid-cols-2">
                  <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                      <Clock className="h-4 w-4" /> Horarios de operacao
                    </div>
                    <div className="mt-3 grid gap-3">
                      {systemSettingsForm.operatingHours.map((entry) => (
                        <div
                          key={entry.day}
                          className="grid gap-2 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-3 sm:grid-cols-[110px_1fr_1fr] sm:items-center"
                        >
                          <span className="text-sm text-[var(--muted-foreground)]">
                            {systemDayLabel[entry.day]}
                          </span>
                          <input
                            type="time"
                            value={entry.start}
                            onChange={(event) =>
                              handleOperatingHourChange(
                                entry.day,
                                "start",
                                event.target.value,
                              )
                            }
                            className="rounded-lg border border-[color:var(--border-dim)] bg-[color:var(--card)] px-2 py-2 text-sm text-[var(--foreground)]"
                          />
                          <input
                            type="time"
                            value={entry.end}
                            onChange={(event) =>
                              handleOperatingHourChange(
                                entry.day,
                                "end",
                                event.target.value,
                              )
                            }
                            className="rounded-lg border border-[color:var(--border-dim)] bg-[color:var(--card)] px-2 py-2 text-sm text-[var(--foreground)]"
                          />
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                      <Globe className="h-4 w-4" /> Contato e redes sociais
                    </div>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                      <input
                        value={systemSettingsForm.contact.phone}
                        onChange={(event) =>
                          handleSystemContactChange("phone", event.target.value)
                        }
                        placeholder="Telefone"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.contact.whatsappLink}
                        onChange={(event) =>
                          handleSystemContactChange(
                            "whatsappLink",
                            event.target.value,
                          )
                        }
                        placeholder="Link WhatsApp (https://...)"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.contact.address}
                        onChange={(event) =>
                          handleSystemContactChange("address", event.target.value)
                        }
                        placeholder="Endereco"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)] md:col-span-2"
                      />
                      <input
                        value={systemSettingsForm.contact.city}
                        onChange={(event) =>
                          handleSystemContactChange("city", event.target.value)
                        }
                        placeholder="Cidade"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.contact.state}
                        onChange={(event) =>
                          handleSystemContactChange("state", event.target.value)
                        }
                        placeholder="Estado"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.contact.zipCode}
                        onChange={(event) =>
                          handleSystemContactChange("zipCode", event.target.value)
                        }
                        placeholder="CEP"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.socialLinks.instagram}
                        onChange={(event) =>
                          handleSystemSocialChange("instagram", event.target.value)
                        }
                        placeholder="Instagram (https://...)"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.socialLinks.facebook}
                        onChange={(event) =>
                          handleSystemSocialChange("facebook", event.target.value)
                        }
                        placeholder="Facebook (https://...)"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.socialLinks.youtube}
                        onChange={(event) =>
                          handleSystemSocialChange("youtube", event.target.value)
                        }
                        placeholder="YouTube (https://...)"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.socialLinks.tiktok}
                        onChange={(event) =>
                          handleSystemSocialChange("tiktok", event.target.value)
                        }
                        placeholder="TikTok (https://...)"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                      />
                      <input
                        value={systemSettingsForm.socialLinks.other}
                        onChange={(event) =>
                          handleSystemSocialChange("other", event.target.value)
                        }
                        placeholder="Outro link (https://...)"
                        className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)] md:col-span-2"
                      />
                    </div>
                  </article>

                  <div className="lg:col-span-2">
                    <button
                      onClick={() => void handleSaveStudioSettings()}
                      disabled={isSavingStudioSettings}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-xs uppercase tracking-[0.3em] text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingStudioSettings ? "Salvando..." : "Salvar studio"}
                    </button>
                  </div>
                </section>
              )}

              {systemSection === "system" && (
                <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
                  <h3 className="text-xl font-semibold">Modo manutencao</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Quando ativo, o backend aplica as regras de manutenção para as
                    rotas configuradas.
                  </p>
                  {currentUser?.role && !isCurrentUserMaster && (
                    <p className="mt-2 text-sm text-[color:var(--danger)]">
                      Somente MASTER pode ativar o modo manutenção. MASTER e ADMIN
                      podem desativar.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() =>
                        setSystemSettingsForm((prev) => ({
                          ...prev,
                          maintenanceMode: !prev.maintenanceMode,
                        }))
                      }
                      disabled={!canManageMaintenanceToggle}
                      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] ${
                        systemSettingsForm.maintenanceMode
                          ? "border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
                          : "border-[color:var(--border-dim)] bg-[color:var(--card)] text-[var(--muted-foreground)]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {systemSettingsForm.maintenanceMode ? "Ativado" : "Desativado"}
                    </button>
                  </div>
                  <textarea
                    value={systemSettingsForm.maintenanceMessage}
                    onChange={(event) =>
                      setSystemSettingsForm((prev) => ({
                        ...prev,
                        maintenanceMessage: event.target.value,
                      }))
                    }
                    disabled={!canManageMaintenanceToggle}
                    placeholder="Mensagem exibida durante manutenção"
                    rows={4}
                    className="mt-4 w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-3 text-sm text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    onClick={() => void handleSaveMaintenanceSettings()}
                    disabled={
                      !canManageMaintenanceToggle || isSavingMaintenanceSettings
                    }
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-xs uppercase tracking-[0.3em] text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingMaintenanceSettings
                      ? "Salvando..."
                      : "Salvar sistema"}
                  </button>
                  <button
                    onClick={() => void handleDisableMaintenance()}
                    disabled={
                      !canDisableMaintenance ||
                      isSavingMaintenanceSettings
                    }
                    className="mt-3 inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-5 text-xs uppercase tracking-[0.3em] text-[color:var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingMaintenanceSettings
                      ? "Desativando..."
                      : "Desativar manutencao"}
                  </button>
                </section>
              )}

              {systemSection === "homepage" && (
                <section className="space-y-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
                  <h3 className="text-xl font-semibold">Carousel da homepage</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Defina quantidade de slides, envie arquivos de imagem para o
                    Cloudinary e adicione texto opcional.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Quantidade de imagens
                    </label>
                    <select
                      value={systemSettingsForm.carouselImages.length}
                      onChange={(event) =>
                        handleCarouselCountChange(Number(event.target.value))
                      }
                      className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                    >
                      {[0, 1, 2, 3, 4, 5].map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </div>

                  {systemSettingsForm.carouselImages.length === 0 && (
                    <p className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      Nenhum slide configurado.
                    </p>
                  )}

                  <div className="grid gap-4 lg:grid-cols-2">
                    {systemSettingsForm.carouselImages.map((image, index) => (
                      <article
                        key={`carousel-slot-${index}`}
                        className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                          Slide {index + 1}
                        </p>
                        {image.imageUrl ? (
                          <img
                            src={image.imageUrl}
                            alt={image.altText || `Slide ${index + 1}`}
                            className="mt-3 h-36 w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="mt-3 flex h-36 w-full items-center justify-center rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                            Sem imagem
                          </div>
                        )}
                        <div className="mt-3 space-y-3">
                          <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                            {image.imageUrl ? (
                              <>
                                <p className="font-semibold text-[var(--foreground)]">
                                  URL gerada pelo Cloudinary
                                </p>
                                <p className="mt-1 break-all">{image.imageUrl}</p>
                              </>
                            ) : (
                              <p>Nenhuma imagem enviada para este slide.</p>
                            )}
                          </div>
                          <input
                            value={image.altText}
                            onChange={(event) =>
                              handleCarouselFieldChange(
                                index,
                                "altText",
                                event.target.value,
                              )
                            }
                            placeholder="Texto da imagem (opcional)"
                            className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
                          />
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={isSavingHomepageSettings}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                handleCarouselFileChange(index, file);
                              }}
                              className={`${modalInputClass} file:mr-3 file:rounded-full file:border-0 file:bg-[var(--gold-tone)]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--gold-tone-dark)] disabled:cursor-not-allowed disabled:opacity-60`}
                            />
                            {carouselImageFiles[index] ? (
                              <p className="text-xs text-[var(--muted-foreground)]">
                                Arquivo selecionado: {carouselImageFiles[index]?.name}
                              </p>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-2">
                              {uploadingCarouselSlot === index ? (
                                <span className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 text-xs uppercase tracking-[0.3em] text-[var(--gold-tone)]">
                                  Enviando...
                                </span>
                              ) : null}
                              {image.imageUrl ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCarouselFieldChange(index, "imageUrl", "");
                                    handleCarouselFileChange(index, undefined);
                                  }}
                                  disabled={uploadingCarouselSlot === index}
                                  className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-4 text-xs uppercase tracking-[0.3em] text-[color:var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Remover
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  <button
                    onClick={() => void handleSaveHomepageSettings()}
                    disabled={isSavingHomepageSettings}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-xs uppercase tracking-[0.3em] text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingHomepageSettings ? "Salvando..." : "Salvar homepage"}
                  </button>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {managedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_20px_60px_var(--shadow)] sm:p-6 scrollbar-none">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Gerenciamento de inscrições
                </p>
                <h3 className="text-2xl font-semibold">{managedEvent.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {managedEvent.date} • {managedEvent.time}
                  {managedEvent.endTime ? ` - ${managedEvent.endTime}` : ""}
                </p>
              </div>
              <button
                onClick={closeEventManagementModal}
                className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em]">
              <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-1 text-[var(--foreground)]">
                {eventRegistrations.length} inscritos
              </span>
              <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-1 text-[var(--foreground)]">
                {cancelledRegistrationsCount} cancelados
              </span>
              {managedEvent.paid && (
                <>
                  <span className="rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-3 py-1 text-[color:var(--success)]">
                    {paidRegistrationsCount} pagos
                  </span>
                  <span className="rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-3 py-1 text-[color:var(--danger)]">
                    {unpaidRegistrationsCount} não pagos
                  </span>
                </>
              )}
            </div>

            {!managedEvent.paid && (
              <p className="mt-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                Evento gratuito: não há confirmação de pagamento para os inscritos.
              </p>
            )}

            {eventRegistrationsStatus === "loading" && (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                Carregando inscritos...
              </p>
            )}

            {eventRegistrationsStatus === "error" && (
              <div className="mt-4 space-y-3 rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4">
                <p className="text-sm text-[color:var(--danger)]">
                  {eventRegistrationsError ?? "Não foi possível carregar os inscritos."}
                </p>
                <button
                  onClick={() => void loadEventRegistrations(managedEvent.id)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--danger-border)] px-4 text-xs uppercase tracking-[0.3em] text-[color:var(--danger)]"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {eventRegistrationsStatus === "ready" && eventRegistrations.length === 0 && (
              <p className="mt-4 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                Este evento ainda não possui inscritos.
              </p>
            )}

            {eventRegistrationsStatus === "ready" && eventRegistrations.length > 0 && (
              <div className="mt-4 grid gap-3">
                {eventRegistrations.map((registration) => {
                  const displayName =
                    registration.name?.trim() ||
                    registration.userName?.trim() ||
                    registration.userEmail?.trim() ||
                    registration.email?.trim() ||
                    (registration.userId
                      ? `Usuário ${registration.userId.slice(0, 8)}`
                      : "Inscrito");
                  const displayEmail =
                    registration.email?.trim() || registration.userEmail?.trim() || "-";
                  const registrationStatusLabel =
                    REGISTRATION_STATUS_LABEL_MAP[registration.status] ||
                    registration.status;
                  const registrationPaid = isRegistrationPaid(registration);
                  const paymentStatusLabel = managedEvent.paid
                    ? registration.status === "cancelled"
                      ? "Cancelado"
                      : registrationPaid
                        ? "Pago"
                        : "Não pago"
                    : "Não se aplica";
                  const canConfirmPayment =
                    managedEvent.paid &&
                    registration.status === "pending" &&
                    !registrationPaid;
                  const isConfirmingThisRegistration =
                    confirmingPaymentRegistrationId === registration.id;
                  const fallbackPaymentMethod =
                    managedEvent.paymentMethod !== "-" ? managedEvent.paymentMethod : "-";
                  const displayPaymentMethod =
                    registration.paymentMethod?.trim() || fallbackPaymentMethod;
                  const displayPaymentAmount = registrationPaid
                    ? formatCurrencyFromCents(registration.paymentAmountCents)
                    : formatCurrencyFromCents(managedEvent.priceCents);

                  return (
                    <article
                      key={registration.id}
                      className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-[var(--foreground)]">
                            {displayName}
                          </h4>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {displayEmail}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-[var(--foreground)]">
                            {registrationStatusLabel}
                          </span>
                          <span
                            className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] ${
                              managedEvent.paid
                                ? registrationPaid
                                  ? "border-[color:var(--success-border)] bg-[color:var(--success-soft)] text-[color:var(--success)]"
                                  : "border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]"
                                : "border-[color:var(--border-dim)] bg-[color:var(--muted)] text-[var(--muted-foreground)]"
                            }`}
                          >
                            {paymentStatusLabel}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)] md:grid-cols-3">
                        <p>
                          <span className="font-semibold text-[var(--foreground)]">
                            Valor:
                          </span>{" "}
                          {managedEvent.paid ? displayPaymentAmount : "-"}
                        </p>
                        <p>
                          <span className="font-semibold text-[var(--foreground)]">
                            Método:
                          </span>{" "}
                          {managedEvent.paid ? displayPaymentMethod : "-"}
                        </p>
                        <p>
                          <span className="font-semibold text-[var(--foreground)]">
                            Inscrição:
                          </span>{" "}
                          {new Intl.DateTimeFormat("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(new Date(registration.createdAt))}
                        </p>
                      </div>

                      {managedEvent.paid && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() =>
                              void handleConfirmRegistrationPayment(registration)
                            }
                            disabled={
                              !canConfirmPayment || confirmingPaymentRegistrationId !== null
                            }
                            className="inline-flex h-10 items-center justify-center rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-4 text-xs uppercase tracking-[0.3em] text-[color:var(--success)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isConfirmingThisRegistration
                              ? "Confirmando..."
                              : registrationPaid
                                ? "Pagamento confirmado"
                                : canConfirmPayment
                                  ? "Confirmar pagamento"
                                  : registration.status === "waitlisted"
                                    ? "Lista de espera"
                                    : registration.status === "cancelled"
                                      ? "Inscrição cancelada"
                                      : "Aguardando confirmação"}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_20px_60px_var(--shadow)] sm:p-6 scrollbar-none">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-sm font-semibold text-[var(--foreground)] shadow-[0_8px_18px_-10px_var(--shadow)]">
                  {selectedUserAvatar ? (
                    <img
                      src={selectedUserAvatar}
                      alt={`Foto de ${selectedUserDisplayName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(selectedUserDisplayName)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Editar usuário
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {selectedUserDisplayName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>{selectedUserEmail}</span>
                    <span className="rounded-full border border-[color:var(--border-dim)] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--gold-tone-dark)]">
                      {roleLabelMap[userForm.role]}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
                onClick={() => setCheckinUser(selectedUser)}
              >
                <Clock className="h-4 w-4" />
                Histórico de check-in
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className={modalLabelClass}>
                Nome
                <input
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className={modalLabelClass}>
                Email
                <input
                  value={userForm.email}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className={modalLabelClass}>
                CPF (bloqueado)
                <input
                  value={userForm.cpf}
                  disabled
                  className={`${modalInputClass} disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
                />
              </label>
              <label className={modalLabelClass}>
                Telefone
                <input
                  value={userForm.phone}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className={modalLabelClass}>
                Data de nascimento
                <input
                  type="date"
                  value={userForm.birthDate}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      birthDate: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
                {isLoadingUserBirthDate ? (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Carregando data de nascimento do perfil de saúde...
                  </span>
                ) : null}
                {userBirthDateError ? (
                  <span className="text-xs text-[color:var(--danger)]">
                    {userBirthDateError}
                  </span>
                ) : null}
                {userForm.birthDate.trim() ? (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {userBirthAge === null
                      ? "Data de nascimento inválida."
                      : `Idade: ${userBirthAge} anos`}
                  </span>
                ) : (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Informe a data para exibir a idade.
                  </span>
                )}
              </label>
              <label className={modalLabelClass}>
                Perfil
                <select
                  value={userForm.role}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      role: event.target.value as AdminUser["role"],
                    }))
                  }
                  className={modalInputClass}
                >
                  {(
                    [
                      "MASTER",
                      "ADMIN",
                      "STAFF",
                      "COACH",
                      "STUDENT",
                      "GUEST",
                    ] as const
                  ).map((role) => (
                    <option key={role} value={role}>
                      {roleLabelMap[role]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={modalLabelClass}>
                Plano
                <select
                  value={userForm.planId}
                  disabled={
                    ["MASTER", "ADMIN", "STAFF", "COACH", "GUEST"].includes(
                      userForm.role,
                    ) ||
                    plansStatus === "loading"
                  }
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      planId: event.target.value,
                    }))
                  }
                  className={`${modalInputClass} disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
                >
                  <option value="">Selecione</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                      {plan.active === false ? " (inativo)" : ""}
                    </option>
                  ))}
                </select>
                {plansStatus === "loading" && (
                  <span className="text-[0.6rem] normal-case text-[var(--muted-foreground)]">
                    Carregando planos...
                  </span>
                )}
                {plansError && (
                  <span className="text-xs text-[color:var(--danger)]">
                    {plansError}
                  </span>
                )}
                {["MASTER", "ADMIN", "STAFF", "COACH", "GUEST"].includes(
                  userForm.role,
                ) && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Plano definido automaticamente para este perfil.
                  </span>
                )}
              </label>
              <label className={`${modalLabelClass} md:col-span-2`}>
                Endereço
                <input
                  value={userForm.address}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className={`${modalLabelClass} md:col-span-2`}>
                Imagem (URL)
                <input
                  value={userForm.image}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      image: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={userForm.active}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      active: event.target.checked,
                    }))
                  }
                />
                Usuário ativo
              </label>
            </div>

            <div className="mt-6 space-y-4">
              <label className={modalLabelClass}>
                Mensagem WhatsApp
                <textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  rows={3}
                  className={modalInputClass}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={cancelUserEdit}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
                >
                  Cancelar
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={whatsappDisabled}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-4 text-sm font-semibold text-[color:var(--success)] ${
                    whatsappDisabled ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar WhatsApp
                </a>
                <button
                  onClick={() => openHealthModal(selectedUser)}
                  disabled={healthLoading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--gold-tone)]/60 bg-[color:var(--card)] px-4 text-sm font-semibold text-[var(--gold-tone-dark)] transition hover:bg-[var(--gold-tone)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Stethoscope className="h-4 w-4" />
                  Editar saúde
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={isSavingUser}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-4 text-sm font-semibold text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSavingUser ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
              {userSaveError && (
                <p className="text-xs text-[color:var(--danger)]">
                  {userSaveError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {checkinUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_20px_60px_var(--shadow)] sm:p-6 scrollbar-none">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Histórico de check-in
                </p>
                <h3 className="text-2xl font-semibold">
                  {checkinUser.name || checkinUser.email || "Usuário"}
                </h3>
              </div>
              <button
                onClick={() => setCheckinUser(null)}
                className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCheckinMonth(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                      )
                    }
                    className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
                  >
                    Anterior
                  </button>
                  <p className="text-sm font-semibold capitalize">
                    {monthLabel}
                  </p>
                  <button
                    onClick={() =>
                      setCheckinMonth(
                        (prev) =>
                          new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                      )
                    }
                    className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
                  >
                    Próximo
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-2 text-[0.6rem] tracking-[0.2em] text-[var(--muted-foreground)]">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(
                    (label) => (
                      <span key={label} className="text-center">
                        {label}
                      </span>
                    ),
                  )}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
                  {monthDays.map((day, index) => {
                    if (!day.day) {
                      return <div key={`empty-${index}`} />;
                    }
                    const isChecked = checkinDates.has(day.date);
                    const isSelected = checkinSelectedDate === day.date;
                    return (
                      <button
                        type="button"
                        key={day.date}
                        onClick={() => setCheckinSelectedDate(day.date)}
                        className={`flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition ${
                          isChecked
                            ? "border-[var(--gold-tone)] bg-[var(--gold-tone)]/15 text-[var(--gold-tone-dark)]"
                            : "border-[color:var(--border-dim)] text-[var(--muted-foreground)]"
                        } ${
                          isSelected
                            ? "ring-2 ring-[var(--gold-tone)]/60"
                            : "hover:border-[var(--gold-tone-dark)]/60"
                        }`}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Lista de check-ins
                </p>
                <div className="mt-4 space-y-3">
                  {checkinHistoryStatus === "loading" && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Carregando histórico...
                    </p>
                  )}
                  {checkinHistoryStatus === "error" && (
                    <p className="text-sm text-[color:var(--danger)]">
                      {checkinHistoryError ??
                        "Nao foi possivel carregar o historico."}
                    </p>
                  )}
                  {checkinHistoryStatus === "ready" &&
                    checkinsForSelectedDay
                      .slice()
                      .sort((a, b) => {
                        const aTime = new Date(a.checkedInAt).getTime();
                        const bTime = new Date(b.checkedInAt).getTime();
                        return bTime - aTime;
                      })
                      .map((checkin) => (
                        <div
                          key={`${checkin.id}-${checkin.checkedInAt}`}
                          className="flex items-center justify-between rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm"
                        >
                          <span className="font-semibold text-[var(--foreground)]">
                            {formatCheckinDateTime(checkin.checkedInAt)}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            Confirmado
                          </span>
                        </div>
                      ))}
                  {checkinHistoryStatus === "ready" &&
                    checkinSelectedDate &&
                    checkinsForSelectedDay.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Nenhum check-in registrado para este dia.
                    </p>
                  )}
                  {checkinHistoryStatus === "ready" && !checkinSelectedDate && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Selecione um dia no calendário para ver os check-ins.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {healthUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_20px_60px_var(--shadow)] sm:w-[80%] sm:max-w-none sm:p-6 scrollbar-none">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--border-dim)] bg-[color:var(--muted)] text-sm font-semibold text-[var(--foreground)] shadow-[0_8px_18px_-10px_var(--shadow)]">
                  {healthUserAvatar ? (
                    <img
                      src={healthUserAvatar}
                      alt={`Foto de ${healthUserDisplayName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(healthUserDisplayName)}</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Dados de saúde
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {healthUserDisplayName}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {healthUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setHealthForm(healthInitial);
                  setHealthError(null);
                  setHealthUser(null);
                }}
                className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Fechar
              </button>
            </div>
            {healthLoading && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Carregando dados...
              </p>
            )}
            {healthError && (
              <p className="mt-3 text-xs text-[color:var(--danger)]">
                {healthError}
              </p>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className={modalLabelClass}>
                Altura (cm)
                <input
                  value={healthForm.heightCm}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      heightCm: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      heightCm: undefined,
                    }))
                  }
                  className={`${modalInputClass} ${
                    healthFieldErrors.heightCm ? modalErrorClass : ""
                  }`}
                />
                {healthFieldErrors.heightCm ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.heightCm}
                  </span>
                ) : null}
              </label>
              <label className={modalLabelClass}>
                Peso (kg)
                <input
                  value={healthForm.weightKg}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      weightKg: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      weightKg: undefined,
                    }))
                  }
                  className={`${modalInputClass} ${
                    healthFieldErrors.weightKg ? modalErrorClass : ""
                  }`}
                />
                {healthFieldErrors.weightKg ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.weightKg}
                  </span>
                ) : null}
              </label>
              <label className={modalLabelClass}>
                Tipo sanguíneo
                <select
                  value={healthForm.bloodType}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      bloodType: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      bloodType: undefined,
                    }))
                  }
                  className={`${modalInputClass} ${
                    healthFieldErrors.bloodType ? modalErrorClass : ""
                  }`}
                >
                  <option value="">Selecione</option>
                  {[
                    { value: "A_POSITIVE", label: "A+" },
                    { value: "A_NEGATIVE", label: "A-" },
                    { value: "B_POSITIVE", label: "B+" },
                    { value: "B_NEGATIVE", label: "B-" },
                    { value: "AB_POSITIVE", label: "AB+" },
                    { value: "AB_NEGATIVE", label: "AB-" },
                    { value: "O_POSITIVE", label: "O+" },
                    { value: "O_NEGATIVE", label: "O-" },
                  ].map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {healthFieldErrors.bloodType ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.bloodType}
                  </span>
                ) : null}
              </label>
              <label className={modalLabelClass}>
                Sexo
                <select
                  value={healthForm.sex}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      sex: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      sex: undefined,
                    }))
                  }
                  className={`${modalInputClass} ${
                    healthFieldErrors.sex ? modalErrorClass : ""
                  }`}
                >
                  <option value="">Selecione</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Feminino</option>
                </select>
                {healthFieldErrors.sex ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.sex}
                  </span>
                ) : null}
              </label>
              <label className={modalLabelClass}>
                Data de nascimento
                <input
                  type="date"
                  value={healthForm.birthDate}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      birthDate: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      birthDate: undefined,
                    }))
                  }
                  className={`${modalInputClass} ${
                    healthFieldErrors.birthDate ? modalErrorClass : ""
                  }`}
                />
                {healthFieldErrors.birthDate ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.birthDate}
                  </span>
                ) : null}
              </label>
              <label className={modalLabelClass}>
                Lesões
                <input
                  value={healthForm.injuries}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      injuries: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      injuries: undefined,
                    }))
                  }
                  className={`${modalInputClass} ${
                    healthFieldErrors.injuries ? modalErrorClass : ""
                  }`}
                />
                {healthFieldErrors.injuries ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.injuries}
                  </span>
                ) : null}
              </label>
            </div>

            <div className="mt-6 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                Dobras cutâneas (mm)
              </p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <label className={modalLabelClass}>
                  Peitoral
                  <input
                    value={healthForm.skinfoldChest}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        skinfoldChest: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
                <label className={modalLabelClass}>
                  Abdômen
                  <input
                    value={healthForm.skinfoldAbdomen}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        skinfoldAbdomen: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
                <label className={modalLabelClass}>
                  Coxa
                  <input
                    value={healthForm.skinfoldThigh}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        skinfoldThigh: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
                <label className={modalLabelClass}>
                  Tríceps
                  <input
                    value={healthForm.skinfoldTriceps}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        skinfoldTriceps: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
                <label className={modalLabelClass}>
                  Subescapular
                  <input
                    value={healthForm.skinfoldSubscapular}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        skinfoldSubscapular: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
                <label className={modalLabelClass}>
                  Supra-ilíaca
                  <input
                    value={healthForm.skinfoldSuprailiac}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        skinfoldSuprailiac: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
                <label className={modalLabelClass}>
                  Axilar média
                  <input
                    value={healthForm.skinfoldMidaxillary}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        skinfoldMidaxillary: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                    Resultado Pollock
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Preencha peso, sexo, data de nascimento e dobras necessárias.
                  </p>
                </div>
                {compositionStatus === "loading" && (
                  <span className="text-xs text-[var(--gold-tone-dark)]">
                    Calculando...
                  </span>
                )}
              </div>

              {compositionStatus === "error" && compositionError ? (
                <p className="mt-3 text-xs text-[color:var(--danger)]">
                  {compositionError}
                </p>
              ) : null}

              {compositionStatus === "ready" && compositionResult ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                    <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                      % Gordura corporal
                    </p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatNumber(compositionResult.bodyFatPct, 2)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                    <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                      Massa gorda
                    </p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatNumber(compositionResult.fatMassKg, 2)} kg
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                    <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                      Massa magra
                    </p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatNumber(compositionResult.leanMassKg, 2)} kg
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                    <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                      Soma das dobras
                    </p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatNumber(compositionResult.sumSkinfoldsMm, 1)} mm
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                    <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                      Densidade corporal
                    </p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatNumber(compositionResult.bodyDensity, 4)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] px-3 py-2">
                    <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                      IMC
                    </p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatNumber(
                        compositionResult.bmi ?? bmiFallback,
                        1,
                      )}
                    </p>
                    {compositionResult.bmiCategory || bmiLabelFallback ? (
                      <p className="text-[0.65rem] text-[var(--muted-foreground)]">
                        {compositionResult.bmiCategory || bmiLabelFallback}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {compositionStatus === "idle" && !compositionResult ? (
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Para masculino: peitoral, abdômen e coxa. Para feminino:
                  tríceps, supra-ilíaca e coxa.
                </p>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={healthForm.takesMedication}
                  onChange={(event) => {
                    setHealthForm((prev) => ({
                      ...prev,
                      takesMedication: event.target.checked,
                    }));
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      medications: undefined,
                    }));
                  }}
                />
                Usa medicação
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={healthForm.exercisesRegularly}
                  onChange={(event) => {
                    setHealthForm((prev) => ({
                      ...prev,
                      exercisesRegularly: event.target.checked,
                    }));
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      dailyRoutine: undefined,
                    }));
                  }}
                />
                Exercita regularmente
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={healthForm.usesSupplementation}
                  onChange={(event) => {
                    setHealthForm((prev) => ({
                      ...prev,
                      usesSupplementation: event.target.checked,
                    }));
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      supplements: undefined,
                    }));
                  }}
                />
                Usa suplementação
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className={modalLabelClass}>
                Medicações
                <input
                  value={healthForm.medications}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      medications: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      medications: undefined,
                    }))
                  }
                  disabled={!healthForm.takesMedication}
                  className={`${modalInputClass} ${
                    healthFieldErrors.medications ? modalErrorClass : ""
                  } disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
                />
                {healthFieldErrors.medications ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.medications}
                  </span>
                ) : null}
              </label>
              <label className={modalLabelClass}>
                Suplementos
                <input
                  value={healthForm.supplements}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      supplements: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      supplements: undefined,
                    }))
                  }
                  disabled={!healthForm.usesSupplementation}
                  className={`${modalInputClass} ${
                    healthFieldErrors.supplements ? modalErrorClass : ""
                  } disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
                />
                {healthFieldErrors.supplements ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.supplements}
                  </span>
                ) : null}
              </label>
            </div>

            <div className="mt-4">
              <label className={modalLabelClass}>
                Rotina de exercícios
                <textarea
                  value={healthForm.dailyRoutine}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      dailyRoutine: event.target.value,
                    }))
                  }
                  onInput={() =>
                    setHealthFieldErrors((prev) => ({
                      ...prev,
                      dailyRoutine: undefined,
                    }))
                  }
                  rows={3}
                  disabled={!healthForm.exercisesRegularly}
                  className={`${modalInputClass} ${
                    healthFieldErrors.dailyRoutine ? modalErrorClass : ""
                  } disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
                />
                {healthFieldErrors.dailyRoutine ? (
                  <span className="text-xs text-red-400">
                    {healthFieldErrors.dailyRoutine}
                  </span>
                ) : null}
              </label>
            </div>

            <div className="mt-4">
              <label className={modalLabelClass}>
                Rotina alimentar
                <textarea
                  value={healthForm.foodRoutine}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      foodRoutine: event.target.value,
                    }))
                  }
                  rows={3}
                  className={modalInputClass}
                />
              </label>
            </div>

            <div className="mt-4">
              <label className={modalLabelClass}>
                Anotações públicas
                <textarea
                  value={healthForm.notesPublic}
                  onChange={(event) =>
                    setHealthForm((prev) => ({
                      ...prev,
                      notesPublic: event.target.value,
                    }))
                  }
                  rows={3}
                  className={modalInputClass}
                />
              </label>
            </div>

            {canViewPrivateNotes ? (
              <div className="mt-4">
                <label className={modalLabelClass}>
                  Anotações privadas
                  <textarea
                    value={healthForm.notesPrivate}
                    onChange={(event) =>
                      setHealthForm((prev) => ({
                        ...prev,
                        notesPrivate: event.target.value,
                      }))
                    }
                    rows={3}
                    className={modalInputClass}
                  />
                </label>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => {
                  setHealthForm(healthInitial);
                  setHealthError(null);
                  setHealthUser(null);
                }}
                className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHealth}
                disabled={isSavingHealth}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-tone)]/40 bg-[var(--gold-tone)]/10 px-4 py-2 text-sm font-semibold text-[var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSavingHealth ? "Salvando..." : "Salvar saúde"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5 shadow-[0_20px_60px_var(--shadow)] sm:p-6 scrollbar-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {eventModalMode === "edit" ? "Editar evento" : "Novo evento"}
                </p>
                <h3 className="text-2xl font-semibold">
                  {eventModalMode === "edit"
                    ? "Atualizar dados do evento"
                    : "Cadastro de evento"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEventModalOpen(false);
                  setEditingEventId(null);
                  setEditingEventStatus(null);
                  setEventImageFile(null);
                }}
                className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className={`${modalLabelClass} md:col-span-2`}>
                Título
                <input
                  value={eventForm.title}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>

              <label className={`${modalLabelClass} md:col-span-2`}>
                Imagem do evento
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setEventImageFile(event.target.files?.[0] ?? null)
                  }
                  className={`${modalInputClass} file:mr-3 file:rounded-full file:border-0 file:bg-[var(--gold-tone)]/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[var(--gold-tone-dark)]`}
                />
              </label>

              <label className={`${modalLabelClass} md:col-span-2`}>
                Descrição
                <textarea
                  value={eventForm.description}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  className={modalInputClass}
                />
              </label>

              <label className={modalLabelClass}>
                Data
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className={modalLabelClass}>
                Horário
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      time: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className={modalLabelClass}>
                Horário fim (opcional)
                <input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      endTime: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className={modalLabelClass}>
                Local
                <input
                  value={eventForm.location}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                  className={modalInputClass}
                />
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={eventForm.hideLocation}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      hideLocation: event.target.checked,
                    }))
                  }
                />
                Ocultar local
              </label>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className={modalLabelClass}>
                Acesso
                <select
                  value={eventForm.accessMode}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      accessMode: event.target.value as "open" | "registered_only",
                      capacity:
                        event.target.value === "open" ? "" : prev.capacity,
                    }))
                  }
                  className={modalInputClass}
                >
                  <option value="open">Aberto</option>
                  <option value="registered_only">Com inscrição</option>
                </select>
              </label>
              <label className={modalLabelClass}>
                Capacidade
                <input
                  type="number"
                  min={1}
                  value={eventForm.capacity}
                  disabled={eventForm.accessMode === "open"}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      capacity: event.target.value,
                    }))
                  }
                  className={`${modalInputClass} disabled:bg-[color:var(--card)] disabled:text-[var(--muted-foreground)]`}
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={eventForm.allowGuests}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      allowGuests: event.target.checked,
                    }))
                  }
                />
                Permitir convidados
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={eventForm.requiresConfirmation}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      requiresConfirmation: event.target.checked,
                    }))
                  }
                />
                Exige confirmação
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={eventForm.isPaid}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      isPaid: event.target.checked,
                      requiresConfirmation:
                        event.target.checked || prev.requiresConfirmation,
                    }))
                  }
                />
                Evento pago
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={eventForm.publish}
                  disabled={editingEventStatus === "cancelado"}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      publish: event.target.checked,
                    }))
                  }
                />
                Publicar ao salvar
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={eventForm.isFeatured}
                  onChange={(event) =>
                    setEventForm((prev) => ({
                      ...prev,
                      isFeatured: event.target.checked,
                    }))
                  }
                />
                Definir como destaque
              </label>
            </div>

            {eventForm.isPaid && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className={modalLabelClass}>
                  Valor (R$)
                  <input
                    type="number"
                    min={1}
                    value={eventForm.priceCents}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        priceCents: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
                <label className={modalLabelClass}>
                  Forma de pagamento
                  <input
                    value={eventForm.paymentMethod}
                    onChange={(event) =>
                      setEventForm((prev) => ({
                        ...prev,
                        paymentMethod: event.target.value,
                      }))
                    }
                    className={modalInputClass}
                  />
                </label>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              {eventModalMode === "edit" && (
                <button
                  onClick={() => handleCancelEvent(editingEventId)}
                  disabled={isCancellingEvent}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-5 text-sm font-semibold text-[color:var(--danger)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCancellingEvent ? "Cancelando..." : "Cancelar evento"}
                </button>
              )}
              <button
                onClick={() => {
                  setIsEventModalOpen(false);
                  setEditingEventId(null);
                  setEditingEventStatus(null);
                  setEventImageFile(null);
                }}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={isSavingEvent}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingEvent
                  ? "Salvando..."
                  : eventModalMode === "edit"
                    ? "Salvar alterações"
                    : "Salvar evento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {saveFeedback.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-6 text-[var(--foreground)] shadow-[0_24px_60px_-24px_var(--shadow)]">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  saveFeedback.status === "success"
                    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                    : "border-red-400/40 bg-red-500/15 text-red-300"
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{saveFeedback.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Esta mensagem fecha automaticamente em 5 segundos.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--muted)] p-4 text-sm text-[var(--foreground)]">
              {saveFeedback.message}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
