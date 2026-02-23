"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import logoLight from "./logo-bl.svg";
import logoDark from "./logo-wt.svg";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { InstallAppButton } from "@/components/PWA/InstallAppButton";

const navItems = [
  { label: "INICIO", href: "/" },
  { label: "CHECKIN", href: "/checkin" },
  { label: "LOGIN", href: "/users/login" },
  { label: "CADASTRO", href: "/users/register" },
  { label: "EVENTOS", href: "/events" },
  { label: "CONTATO", href: "/contacts" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="safe-area-top fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border-dim)] bg-[color:var(--card)] font-[var(--font-roboto)] backdrop-blur-xl">
      <div className="safe-area-x mx-auto flex w-full max-w-6xl items-center gap-3 py-2 text-[0.65rem] uppercase tracking-[0.16rem] text-[var(--foreground)] sm:gap-4 sm:py-3 sm:text-sm sm:tracking-[0.3rem]">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[0.35rem] text-[var(--gold-tone)] sm:tracking-[0.6rem]"
        >
          <Image
            src={theme === "light" ? logoLight : logoDark}
            alt="JM Studio Logo"
            width={160}
            height={40}
            className={`h-7 w-auto sm:h-10${theme === "light" ? " origin-left scale-x-[1.55]" : ""}`}
          />
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-4 font-semibold md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-xs transition hover:text-[var(--gold-tone-dark)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <InstallAppButton
              iconOnly
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--gold-tone)] bg-[var(--gold-tone)] text-[var(--background)] shadow-[0_10px_24px_-12px_var(--gold-tone)] sm:h-10 sm:w-10"
            />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border-dim)] bg-[color:var(--card)] text-[var(--foreground)] transition hover:border-[var(--gold-tone-dark)] sm:h-10 sm:w-10"
            >
              <span className="sr-only">Alternar tema</span>
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-[var(--gold-tone-dark)]" />
              ) : (
                <Moon className="h-4 w-4 text-[var(--gold-tone-dark)]" />
              )}
            </button>

            <motion.button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Menu"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-dim)] bg-[color:var(--card)] p-2.5 shadow-[0_4px_12px_-2px_var(--shadow),inset_0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(194,165,55,0.2),inset_0_1px_2px_rgba(255,255,255,0.2)] md:hidden"
            >
              <motion.div
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  scale: isMenuOpen ? 1.1 : 1,
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                className="relative flex h-6 w-6 flex-col items-center justify-center"
              >
              <svg
                width="26"
                height="26"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[var(--gold-tone-dark)]"
              >
                <defs>
                  <linearGradient
                    id="barbell-metal"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#E5E7EB" />
                    <stop offset="50%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#6B7280" />
                  </linearGradient>
                  <linearGradient
                    id="barbell-gold"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#C2A537" />
                    <stop offset="100%" stopColor="#92400E" />
                  </linearGradient>
                  <radialGradient id="highlight" cx="30%" cy="30%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                </defs>
                <motion.g fill="url(#barbell-gold)" transition={{ duration: 0.5, ease: "easeInOut" }}>
                  <rect
                    x="10"
                    y="15"
                    width="12"
                    height="2.5"
                    rx="1.25"
                    fill="currentColor"
                  />
                  <rect
                    x="10.5"
                    y="15.3"
                    width="11"
                    height="0.8"
                    rx="0.4"
                    fill="url(#highlight)"
                    opacity="0.7"
                  />
                  <rect
                    x="9"
                    y="14.5"
                    width="2"
                    height="3.5"
                    rx="1"
                    fill="currentColor"
                  />
                  <rect
                    x="21"
                    y="14.5"
                    width="2"
                    height="3.5"
                    rx="1"
                    fill="currentColor"
                  />
                  <ellipse
                    cx="7"
                    cy="16.25"
                    rx="4"
                    ry="5.5"
                    fill="currentColor"
                  />
                  <ellipse
                    cx="7"
                    cy="16.25"
                    rx="3.2"
                    ry="4.7"
                    fill="url(#highlight)"
                    opacity="0.3"
                  />
                  <circle
                    cx="7"
                    cy="16.25"
                    r="1.8"
                    fill="none"
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="0.3"
                  />
                  <ellipse
                    cx="4.5"
                    cy="16.25"
                    rx="2.5"
                    ry="4"
                    fill="currentColor"
                  />
                  <ellipse
                    cx="4.5"
                    cy="16.25"
                    rx="2"
                    ry="3.3"
                    fill="url(#highlight)"
                    opacity="0.4"
                  />
                  <ellipse
                    cx="25"
                    cy="16.25"
                    rx="4"
                    ry="5.5"
                    fill="currentColor"
                  />
                  <ellipse
                    cx="25"
                    cy="16.25"
                    rx="3.2"
                    ry="4.7"
                    fill="url(#highlight)"
                    opacity="0.3"
                  />
                  <circle
                    cx="25"
                    cy="16.25"
                    r="1.8"
                    fill="none"
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="0.3"
                  />
                  <ellipse
                    cx="27.5"
                    cy="16.25"
                    rx="2.5"
                    ry="4"
                    fill="currentColor"
                  />
                  <ellipse
                    cx="27.5"
                    cy="16.25"
                    rx="2"
                    ry="3.3"
                    fill="url(#highlight)"
                    opacity="0.4"
                  />
                </motion.g>
                <motion.g
                  animate={{ opacity: isMenuOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <circle
                    cx="7"
                    cy="14"
                    r="1"
                    fill="var(--gold-tone-dark)"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      values="0.5;1.5;0.5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="25"
                    cy="18.5"
                    r="0.8"
                    fill="var(--gold-tone-dark)"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      values="0.3;1.2;0.3"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </motion.g>
              </svg>
            </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="safe-area-x max-h-[65vh] space-y-2 overflow-y-auto border-t border-[color:var(--border-dim)] bg-[color:var(--card)] py-3 text-center">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-2xl border border-[color:var(--border-dim)] px-4 py-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2rem] text-[var(--gold-tone-dark)] transition hover:bg-[#C2A537]/10"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
