export type HeroSlide = {
  src: string;
  title: string;
  description: string;
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    src: "/banner-01.png",
    title: "Energia, disciplina e força interior",
    description:
      "Treinos personalizados, música envolvente e o apoio de profissionais para você sair do comum.",
  },
  {
    src: "/banner-02.png",
    title: "Mais movimento, menos desculpas",
    description:
      "Corpo e mente sincronizados em um ambiente premium, com foco no resultado e na experiência.",
  },
  {
    src: "/banner-03.png",
    title: "Ritmo acelerado com atendimento boutique",
    description:
      "Aulas em pequenos grupos, acompanhamentos contínuos e atmosfera que inspira superação.",
  },
  {
    src: "/banner-04.png",
    title: "Transformação além do físico",
    description:
      "Eventos exclusivos, workshops de nutrição e um calendário repleto de novas possibilidades.",
  },
];

export const PLAN_PERKS_BY_KEY: Record<string, string[]> = {
  compact: [
    "10 aulas mensais (pilates, hiit e funcional)",
    "1 sessão consultiva com coach por mês",
    "Acesso ao app de treinos e playlist exclusiva",
  ],
  intensivo: [
    "Treinos ilimitados em horários flexíveis",
    "Avaliações quinzenais com feedback personalizado",
    "Convites VIP para eventos e workshops",
  ],
  personal: [
    "2 sessões individuais semanais",
    "Plano alimentar assinado pela equipe",
    "Check-ins semanais com relatórios digitais",
  ],
};
