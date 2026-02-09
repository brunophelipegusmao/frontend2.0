"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  CalendarCheck,
  Wallet,
  Settings,
  BadgeCheck,
  CreditCard,
  Globe,
  Clock,
  CheckCircle2,
  LogOut,
  Pencil,
  MessageCircle,
  Stethoscope,
  Trash2,
  Power,
  Menu,
} from "lucide-react";

type TabId = "users" | "events" | "financial" | "admin" | "system";

const tabs: { id: TabId; label: string; description: string; icon: JSX.Element }[] =
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

const mockEvents = [
  {
    id: "ev-01",
    title: "Open Day Premium",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
    description: "Dia aberto com treinos premium, desafios e networking.",
    date: "2026-03-12",
    time: "18:30",
    endTime: "21:00",
    location: "Studio Principal",
    hideLocation: false,
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
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    description: "Sessao intensa de HIIT com coach convidado.",
    date: "2026-03-20",
    time: "07:00",
    endTime: "08:00",
    location: "Arena",
    hideLocation: false,
    access: "open",
    capacity: null,
    paid: false,
    price: "Gratuito",
    paymentMethod: "-",
    allowGuests: false,
    requiresConfirmation: false,
    status: "rascunho",
  },
  {
    id: "ev-03",
    title: "Workshop Mobilidade",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=800&auto=format&fit=crop",
    description: "Workshop focado em mobilidade e prevencao de lesoes.",
    date: "2026-01-20",
    time: "09:00",
    endTime: "11:00",
    location: "Studio B",
    hideLocation: false,
    access: "registered_only",
    capacity: 20,
    paid: false,
    price: "Gratuito",
    paymentMethod: "-",
    allowGuests: true,
    requiresConfirmation: false,
    status: "publicado",
  },
  {
    id: "ev-04",
    title: "Festival Fitness Noturno",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    description: "Festival com aulas tematicas, DJ e areas de recovery.",
    date: "2026-03-05",
    time: "19:30",
    endTime: "22:00",
    location: "Arena",
    hideLocation: false,
    access: "open",
    capacity: 60,
    paid: true,
    price: "R$ 180,00",
    paymentMethod: "Cartao",
    allowGuests: true,
    requiresConfirmation: true,
    status: "cancelado",
  },
  {
    id: "ev-05",
    title: "Treino Funcional Open",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop",
    description: "Treino funcional aberto para todos os niveis.",
    date: "2026-02-12",
    time: "07:30",
    endTime: "08:30",
    location: "Studio Principal",
    hideLocation: false,
    access: "open",
    capacity: 35,
    paid: false,
    price: "Gratuito",
    paymentMethod: "-",
    allowGuests: true,
    requiresConfirmation: false,
    status: "publicado",
  },
  {
    id: "ev-06",
    title: "Aula Mobility Flow",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    description: "Sequencia guiada de mobilidade e respiracao.",
    date: "2026-02-14",
    time: "09:00",
    endTime: "10:00",
    location: "Studio B",
    hideLocation: false,
    access: "registered_only",
    capacity: 20,
    paid: false,
    price: "Gratuito",
    paymentMethod: "-",
    allowGuests: true,
    requiresConfirmation: true,
    status: "publicado",
  },
  {
    id: "ev-07",
    title: "Bootcamp Premium",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501af?q=80&w=800&auto=format&fit=crop",
    description: "Bootcamp com desafios de alta intensidade.",
    date: "2026-02-18",
    time: "18:00",
    endTime: "19:30",
    location: "Arena",
    hideLocation: false,
    access: "registered_only",
    capacity: 30,
    paid: true,
    price: "R$ 90,00",
    paymentMethod: "PIX",
    allowGuests: false,
    requiresConfirmation: true,
    status: "publicado",
  },
  {
    id: "ev-08",
    title: "Yoga Sunset",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=800&auto=format&fit=crop",
    description: "Yoga relaxante ao por do sol.",
    date: "2026-02-21",
    time: "17:30",
    endTime: "18:30",
    location: "Rooftop",
    hideLocation: false,
    access: "open",
    capacity: 25,
    paid: false,
    price: "Gratuito",
    paymentMethod: "-",
    allowGuests: true,
    requiresConfirmation: false,
    status: "publicado",
  },
  {
    id: "ev-09",
    title: "Desafio 5K Indoor",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    description: "Desafio indoor com ranking ao vivo.",
    date: "2026-02-25",
    time: "19:00",
    endTime: "20:30",
    location: "Arena",
    hideLocation: false,
    access: "registered_only",
    capacity: 40,
    paid: true,
    price: "R$ 120,00",
    paymentMethod: "Cartao",
    allowGuests: true,
    requiresConfirmation: true,
    status: "publicado",
  },
  {
    id: "ev-10",
    title: "Aulão Carnaval",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
    description: "Aula tematica com playlist especial de carnaval.",
    date: "2026-02-28",
    time: "10:00",
    endTime: "11:30",
    location: "Studio Principal",
    hideLocation: false,
    access: "open",
    capacity: 50,
    paid: false,
    price: "Gratuito",
    paymentMethod: "-",
    allowGuests: true,
    requiresConfirmation: false,
    status: "publicado",
  },
];

type EventItem = (typeof mockEvents)[number];

const mockPayments = [
  { id: "p-01", user: "Carla Mendes", amount: "R$ 120,00", method: "PIX" },
  { id: "p-02", user: "Julio Costa", amount: "R$ 90,00", method: "Cartao" },
];

const mockPlans = [
  { id: "pl-01", name: "Plano Free", price: "R$ 0", active: true },
  { id: "pl-02", name: "Plano Intensivo", price: "R$ 249", active: true },
  { id: "pl-03", name: "Plano Guest", price: "R$ 0", active: true },
];

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
    };
    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }
    return data?.message || data?.error || fallback;
  } catch {
    return fallback;
  }
};

const toCheckinDateKey = (value: string | Date) => {
  const parsed = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
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
  const [events, setEvents] = useState(mockEvents);
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
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    hideLocation: false,
    accessMode: "registered_only",
    capacity: "",
    allowGuests: true,
    requiresConfirmation: false,
    isPaid: false,
    priceCents: "",
    paymentMethod: "",
  });
  const [eventFilter, setEventFilter] = useState<
    "FUTUROS" | "CANCELADOS" | "REALIZADOS"
  >("FUTUROS");
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
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
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
  }, [loadUsers, loadPlans]);

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
    setUserForm({
      name: user.name ?? "",
      email: user.email ?? "",
      cpf: user.cpf ?? "",
      phone: user.phone ?? "",
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
      if (userForm.name.trim()) {
        payload.name = userForm.name.trim();
      }
      if (userForm.email.trim()) {
        payload.email = userForm.email.trim().toLowerCase();
      }
      if (userForm.phone.trim()) {
        payload.phone = userForm.phone.trim();
      }
      if (userForm.address.trim()) {
        payload.address = userForm.address.trim();
      }
      if (userForm.image.trim()) {
        payload.image = userForm.image.trim();
      }
      payload.active = userForm.active;
      payload.role = userForm.role;

      const requiresPlanLock = ["MASTER", "ADMIN", "GUEST"].includes(
        userForm.role,
      );
      if (!requiresPlanLock && userForm.planId) {
        payload.planId = userForm.planId;
      }

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
      const iso = date.toISOString().split("T")[0];
      days.push({ date: iso, day });
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
        date: date.toISOString().split("T")[0],
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
    return checkinHistory.filter(
      (item) => toCheckinDateKey(item.checkedInAt) === checkinSelectedDate,
    );
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
    });
    setIsEventModalOpen(true);
  };

  const cancelEvent = () => {
    if (!editingEventId) {
      return;
    }
    setEvents((prev) =>
      prev.map((event) =>
        event.id === editingEventId
          ? {
              ...event,
              status: "cancelado",
            }
          : event,
      ),
    );
    setIsEventModalOpen(false);
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

  const handleTabSelect = (tabId: TabId) => {
    setActiveTab(tabId);
    setIsTabMenuOpen(false);
  };

  useEffect(() => {
    const year = eventMonth.getFullYear();
    const month = eventMonth.getMonth();
    const todayIso = new Date().toISOString().split("T")[0];
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
    const fallback = new Date(year, month, 1).toISOString().split("T")[0];
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
  const canViewPrivateNotes = ["MASTER", "ADMIN", "COACH"].includes(
    (currentUser?.role ?? "").toUpperCase(),
  );
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
              <span className="text-right">Acoes</span>
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
                  openEventModal(
                    "edit",
                    selectedDayEvents[0] ?? filteredEvents[0],
                  )
                }
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--muted-foreground)] hover:text-[var(--gold-tone-dark)]"
              >
                Editar evento
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-4 text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--danger)]">
                Apagar evento
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                Cancelar evento
              </button>
            </div>
          </div>

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
                    </div>
                    <button
                      onClick={() => openEventModal("edit", event)}
                      className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-[color:var(--border-dim)] px-4 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--muted-foreground)] hover:text-[var(--gold-tone-dark)]"
                    >
                      Editar evento
                    </button>
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
                  <div className="rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    {event.paid ? "Pago" : "Gratuito"}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
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
                  <button className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Publicar
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
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Pagamentos pendentes</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {mockPayments.map((payment) => (
                <article
                  key={payment.id}
                  className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                    {payment.method}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {payment.user}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {payment.amount}
                  </p>
                  <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-[color:var(--success-border)] bg-[color:var(--success-soft)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--success)]">
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
                  className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                    {plan.active ? "Ativo" : "Inativo"}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {plan.name}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {plan.price}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      <Power className="h-4 w-4" />
                      {plan.active ? "Desativar" : "Ativar"}
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-3 py-2 text-xs uppercase tracking-[0.3em] text-[color:var(--danger)]">
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
            <h2 className="text-2xl font-semibold">Modo manutencao</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Ative para bloquear o sistema e exibir uma mensagem personalizada.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                Ativar
              </button>
              <input
                placeholder="Mensagem de manutencao"
                className="min-w-[220px] flex-1 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                <Clock className="h-4 w-4" /> Horario de operacao
              </div>
              <div className="mt-3 grid gap-3">
                {["Segunda", "Terca", "Quarta", "Quinta", "Sexta"].map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-3 rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-sm"
                  >
                    <span className="w-24 text-[var(--muted-foreground)]">{day}</span>
                    <input
                      defaultValue="06:00 - 22:00"
                      className="flex-1 rounded-lg border border-[color:var(--border-dim)] bg-[color:var(--card)] px-2 py-1 text-xs text-[var(--foreground)]"
                    />
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-5">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-[var(--muted-foreground)]">
                <Globe className="h-4 w-4" /> Contato e redes
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <input
                  placeholder="Telefone principal"
                  className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                />
                <input
                  placeholder="WhatsApp"
                  className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                />
                <input
                  placeholder="Instagram"
                  className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                />
                <input
                  placeholder="Endereco"
                  className="w-full rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] px-3 py-2 text-[var(--foreground)]"
                />
              </div>
            </article>
          </section>
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
                    ["MASTER", "ADMIN", "GUEST"].includes(userForm.role) ||
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
                {["MASTER", "ADMIN", "GUEST"].includes(userForm.role) && (
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
                onClick={() => setIsEventModalOpen(false)}
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
                      accessMode: event.target.value,
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
                  onClick={cancelEvent}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] px-5 text-sm font-semibold text-[color:var(--danger)]"
                >
                  Cancelar evento
                </button>
              )}
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] px-5 text-sm font-medium text-[var(--muted-foreground)] transition hover:border-[var(--gold-tone-dark)] hover:text-[var(--gold-tone-dark)]"
              >
                Cancelar
              </button>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] px-5 text-sm font-semibold text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)]"
              >
                {eventModalMode === "edit"
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
