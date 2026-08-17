import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { usePageMeta } from "@/lib/use-page-meta";
import { isSubdomainMode, getAppOrigin, getMarketingOrigin } from "@/lib/subdomain";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronRight,
  Check,
  Clock,
  Calendar,
  FileText,
  Award,
  Users,
  ShieldCheck,
  X,
  TrendingDown,
} from "lucide-react";
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

function LogoMark({ size = 28, color = "#111827" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="shrink-0">
      <circle cx="14" cy="14" r="11.5" stroke={color} strokeWidth="2" />
      <circle cx="14" cy="14" r="4" fill={color} />
    </svg>
  );
}

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerContainerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/** Wraps children with a scroll-triggered fade-up animation */
function FadeUp({
  children,
  className,
  delay = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container that triggers when scrolled into view */
function StaggerFadeUp({
  children,
  className,
  fast = false,
}: {
  children: React.ReactNode;
  className?: string;
  fast?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      variants={fast ? staggerContainerFast : staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Individual stagger child — use inside StaggerFadeUp */
function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

const features = [
  {
    icon: Clock,
    title: "Timesheet management",
    description:
      "Calendar-based monthly time logging. Daily notes, running totals, and one-click submit with a full approval trail.",
  },
  {
    icon: Calendar,
    title: "Leave and OOO requests",
    description: "Submit and track time off in seconds. Managers see team conflicts and approve with one click.",
  },
  {
    icon: FileText,
    title: "Invoice management",
    description: "Upload invoices or generate them from timesheets. Store IBAN and SWIFT once. Finance gets a clean approval queue.",
  },
  {
    icon: Award,
    title: "Performance evaluations",
    description: "Self and peer reviews across a 7-level seniority framework. Invite reviewers, track progress, view history.",
  },
  {
    icon: Users,
    title: "Team oversight",
    description: "Supervisors see the whole team in one view. Pending approvals, who's out, and evaluation status, surfaced automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Admin and compliance",
    description: "Audit logs, role-based access, and org-wide reporting. Bulk CSV import. SSO on enterprise plans.",
  },
];

const steps = [
  {
    number: "01",
    title: "Invite contractors",
    description: "Send an email invite. Contractors set up their profile and start submitting in under 5 minutes.",
    dark: true,
  },
  {
    number: "02",
    title: "Configure workflows",
    description: "Set approval chains and leave policies once. Everything runs automatically from there.",
    dark: true,
  },
  {
    number: "03",
    title: "Approve and pay",
    description: "Review timesheets, approve invoices, and export to payroll, all from one consolidated view.",
    dark: false,
  },
];

const plans = [
  {
    name: "Free",
    tagline: "Try it free — no card needed",
    price: "$0",
    priceNote: "7-day trial",
    seats: "Up to 3 contractors",
    example: "3 ICs = $0",
    cta: "Request access",
    highlight: false,
    enterprise: false,
    features: ["Timesheet management", "Leave tracking", "Basic invoicing", "1 admin seat"],
  },
  {
    name: "Starter",
    tagline: "Growing teams that need structure",
    price: "$9",
    priceNote: "per IC / month",
    seats: "Up to 25 contractors",
    example: "10 ICs = $90/mo",
    cta: "Request access",
    highlight: false,
    enterprise: false,
    features: ["Everything in Free", "Unlimited admin seats", "CSV + PDF exports", "Email notifications"],
  },
  {
    name: "Pro",
    tagline: "Teams that move fast",
    price: "$14",
    priceNote: "per IC / month",
    seats: "Up to 100 contractors",
    example: "25 ICs = $350/mo",
    cta: "Request access",
    highlight: true,
    enterprise: false,
    features: ["Everything in Starter", "Performance evaluations", "Expense tracking", "Audit-ready exports"],
  },
  {
    name: "Enterprise",
    tagline: "Large orgs with compliance needs",
    price: "Custom",
    priceNote: "tailored to your team",
    seats: "100+ contractors",
    example: "Custom for 100+ ICs",
    cta: "Contact sales",
    highlight: false,
    enterprise: true,
    features: ["Everything in Pro", "Dedicated account manager", "SSO / SAML", "Audit API access"],
  },
];

const dotGridBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='11' stroke='%23111827' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3.5' fill='%23111827'/%3E%3C/svg%3E\")";

const darkDotBg =
  "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)";

const PLAN_PRICE_OVERRIDES: Record<string, Record<string, { price: string; example: string }>> = {
  NGN: {
    starter: { price: "₦9k", example: "10 ICs = ₦90k/mo" },
    pro: { price: "₦14k", example: "25 ICs = ₦350k/mo" },
  },
  EUR: {
    starter: { price: "€8", example: "10 ICs = €80/mo" },
    pro: { price: "€13", example: "25 ICs = €325/mo" },
  },
};

const CALCULATOR_CURRENCIES: Record<string, { symbol: string; label: string; axleProUnit: number }> = {
  USD: { symbol: "$", label: "USD", axleProUnit: 14 },
  NGN: { symbol: "₦", label: "NGN", axleProUnit: 14000 },
  EUR: { symbol: "€", label: "EUR", axleProUnit: 13 },
};
const DEEL_USD_UNIT = 49;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [contractorCount, setContractorCount] = useState(25);
  const [detectedCurrency, setDetectedCurrency] = useState<string>("USD");
  const [calculatorCurrency, setCalculatorCurrency] = useState<string>("USD");
  const [calculatorCurrencyTouched, setCalculatorCurrencyTouched] = useState(false);

  useEffect(() => {
    fetch("/api/billing/detect-currency")
      .then((r) => r.json())
      .then((data) => {
        if (data?.currency) {
          setDetectedCurrency(data.currency);
          if (!calculatorCurrencyTouched && CALCULATOR_CURRENCIES[data.currency]) {
            setCalculatorCurrency(data.currency);
          }
        }
      })
      .catch(() => {});
  }, []);

  usePageMeta({
    title: "Axle — Contractor Management Platform",
    description: "Axle helps companies manage independent contractors with timesheets, invoices, leave tracking, and performance reviews — all in one place.",
    canonical: "https://axlehq.app/",
  });

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="h-16 bg-white border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-12 flex items-center">
          <a href="/" className="flex items-center gap-2.5 mr-12 no-underline">
            <LogoMark size={28} color="#111827" />
            <span className="text-gray-900 text-base font-bold tracking-tight">Axle</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-500 text-sm font-medium no-underline hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4 ml-auto md:ml-0">
            <button
              onClick={() => {
                if (isSubdomainMode()) {
                  window.location.href = getAppOrigin();
                } else {
                  setLocation("/login");
                }
              }}
              className="text-gray-500 text-sm font-medium hover:text-gray-900 transition-colors"
              data-testid="button-nav-login"
            >
              Sign in
            </button>
            <Button
              size="sm"
              onClick={() => {
                if (isSubdomainMode()) {
                  window.location.href = `${getMarketingOrigin()}/signup`;
                } else {
                  setLocation("/signup");
                }
              }}
              data-testid="button-nav-signup"
            >
              Get started
            </Button>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-24">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.045]"
          style={{ backgroundImage: dotGridBg, backgroundSize: "60px 60px" }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 border border-gray-200 rounded-full pl-3.5 pr-3 py-1.5 bg-white shadow-sm mb-7"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-gray-700 text-[12.5px] font-medium">New, expense management is live</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif font-normal text-gray-900 text-5xl sm:text-6xl leading-[1.08] tracking-tight mb-6"
            >
              Pure contractor ops.
              <br />
              <em>Not EOR. Not payroll.</em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md"
            >
              Timesheets, invoices, leave, and evaluations — built for teams that manage contractors directly. No EOR overhead, no implementation weeks.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-3 mb-5"
            >
              <Button
                size="lg"
                onClick={() => {
                  if (isSubdomainMode()) {
                    window.location.href = `${getMarketingOrigin()}/signup`;
                  } else {
                    setLocation("/signup");
                  }
                }}
                data-testid="button-hero-get-started"
              >
                Request access
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToHowItWorks} data-testid="button-hero-demo">
                See how it works
              </Button>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-gray-400 text-xs"
            >
              7-day free trial · No credit card required · Up to 3 contractors during the trial.
            </motion.p>
          </motion.div>

          {/* Right: app screenshot mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
              {/* Browser chrome */}
              <div className="h-9 bg-gray-50 border-b border-gray-200 flex items-center px-3.5 gap-2">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 max-w-xs mx-auto bg-white border border-gray-200 rounded-md py-1 px-3 text-center">
                  <span className="text-gray-400 text-[11px]">app.axlehq.app/dashboard</span>
                </div>
              </div>
              {/* Mini app */}
              <div className="flex h-[380px] sm:h-[430px]">
                {/* Mini sidebar */}
                <div className="w-36 bg-sidebar shrink-0 p-2 pt-2.5 hidden sm:block">
                  <div className="flex items-center gap-2 px-1.5 pb-3 mb-2 border-b border-white/[0.06]">
                    <LogoMark size={16} color="white" />
                    <span className="text-gray-50 text-xs font-bold tracking-tight">Axle</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-1" style={{ background: "rgba(5,150,105,0.12)" }}>
                    <div className="w-3 h-3 rounded-sm bg-emerald-400/70" />
                    <span className="text-emerald-400 text-[11px] font-semibold">Dashboard</span>
                  </div>
                  <div className="px-2 pt-2.5 pb-1 text-[8px] font-semibold tracking-widest uppercase text-gray-600">My Work</div>
                  {["Time Off", "Timesheets", "Invoices", "Evaluations"].map((label) => (
                    <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-1">
                      <div className="w-3 h-3 rounded-sm bg-gray-600" />
                      <span className="text-gray-400 text-[11px]">{label}</span>
                    </div>
                  ))}
                </div>
                {/* Mini content */}
                <div className="flex-1 bg-gray-50 overflow-hidden">
                  <div className="h-9 bg-white border-b border-gray-200 flex items-center px-3.5">
                    <span className="text-gray-400 text-[10px]">Dashboard</span>
                  </div>
                  <div className="p-3.5">
                    <div className="text-gray-900 text-xs font-semibold mb-2.5">Good morning, Sarah</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
                      <div className="bg-white border border-gray-200 rounded-md p-2.5">
                        <div className="text-gray-900 text-base font-bold mb-0.5 tabular-nums">142</div>
                        <div className="text-gray-400 text-[8.5px]">Hours logged</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-md p-2.5">
                        <div className="text-gray-900 text-base font-bold mb-0.5">$8,400</div>
                        <div className="text-gray-400 text-[8.5px]">Outstanding</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-md p-2.5 hidden sm:block">
                        <div className="text-gray-900 text-base font-bold mb-0.5">3</div>
                        <div className="text-gray-400 text-[8.5px]">Days OOO</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-md p-2.5 hidden sm:block">
                        <div className="text-gray-900 text-base font-bold mb-0.5">3</div>
                        <div className="text-gray-400 text-[8.5px]">Evaluations</div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-100 text-gray-900 text-[10.5px] font-semibold">
                        Recent activity
                      </div>
                      {[
                        { label: "June timesheet approved", meta: "Jul 1", status: "Approved", tone: "green" },
                        { label: "Invoice #007 submitted", meta: "Jul 2 · $4,200", status: "Pending", tone: "amber" },
                        { label: "OOO Jul 21-23 approved", meta: "Jun 28", status: "Approved", tone: "green" },
                      ].map((row) => (
                        <div key={row.label} className="px-3 py-1.5 flex items-center justify-between border-b border-gray-50 last:border-b-0">
                          <div>
                            <div className="text-gray-700 text-[10px] font-medium">{row.label}</div>
                            <div className="text-gray-400 text-[9px]">{row.meta}</div>
                          </div>
                          <span
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                              row.tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Social proof strip ─────────────────────────────────────────────── */}
      <FadeUp>
        <section className="bg-gray-50 border-y border-gray-100 py-5">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center gap-x-10 gap-y-2">
            <span className="text-gray-400 text-xs font-medium whitespace-nowrap">Built for teams that run on contractors</span>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {[
                { icon: Clock, label: "Timesheets" },
                { icon: FileText, label: "Invoices" },
                { icon: Calendar, label: "Leave tracking" },
                { icon: Award, label: "Evaluations" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                  <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp className="text-center mb-14">
            <div className="inline-block bg-emerald-50 text-primary text-[11px] font-semibold px-3 py-1 rounded-full mb-3.5 tracking-wide">
              FEATURES
            </div>
            <h2 className="font-serif font-normal text-gray-900 text-3xl sm:text-4xl mb-3.5">
              Everything your team needs to run smoothly
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              From first timesheet to final payment, Axle handles the operational layer so your contractors can focus on the work.
            </p>
          </FadeUp>

          <StaggerFadeUp className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden max-w-5xl mx-auto">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  className="bg-white p-8 h-full cursor-default"
                  whileHover={{ backgroundColor: "#fafafa", transition: { duration: 0.15 } }}
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="inline-block mb-4"
                  >
                    <feature.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-gray-900 text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-[13.5px] leading-relaxed">{feature.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerFadeUp>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-50 border-t border-gray-100 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp className="text-center mb-14">
            <div className="inline-block bg-emerald-50 text-primary text-[11px] font-semibold px-3 py-1 rounded-full mb-3.5 tracking-wide">
              HOW IT WORKS
            </div>
            <h2 className="font-serif font-normal text-gray-900 text-3xl sm:text-4xl mb-3.5">Up and running in minutes</h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              No onboarding sessions. No implementation weeks. Invite your team and go.
            </p>
          </FadeUp>

          <div className="relative max-w-4xl mx-auto">
            <FadeUp delay={0.1}>
              <div className="hidden md:block absolute top-[22px] left-[calc(16.7%+22px)] right-[calc(16.7%+22px)] h-px bg-gradient-to-r from-gray-200 via-primary to-gray-200" />
            </FadeUp>
            <StaggerFadeUp className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map((step) => (
                <StaggerItem key={step.number}>
                  <div className="text-center relative z-10">
                    <motion.div
                      className={`w-11 h-11 rounded-[10px] flex items-center justify-center mx-auto mb-4 ${
                        step.dark ? "bg-gray-900" : "bg-primary"
                      }`}
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <span className="text-white text-sm font-bold">{step.number}</span>
                    </motion.div>
                    <h3 className="text-gray-900 text-[17px] font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-[13.5px] leading-relaxed">{step.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerFadeUp>
          </div>
        </div>
      </section>

      {/* ── Why not Deel? ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            <FadeUp className="lg:w-72 shrink-0">
              <div className="inline-block bg-emerald-50 text-primary text-[11px] font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
                WHY NOT DEEL?
              </div>
              <h2 className="font-serif font-normal text-gray-900 text-2xl sm:text-3xl leading-snug mb-3">
                Built for teams that already know who they're hiring
              </h2>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Deel and Remote are great if you need to hire globally and convert contractors to employees. If you already have contractors and just need to run ops cleanly, you're paying for things you'll never use.
              </p>
            </FadeUp>

            <StaggerFadeUp className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: X,
                  label: "No EOR overhead",
                  body: "Deel charges from $49/IC/month to fund EOR infrastructure you don't need. Axle Pro starts at $14/IC.",
                  bad: true,
                },
                {
                  icon: X,
                  label: "No entity fees",
                  body: "No per-country legal entity fees, no compliance seat add-ons. One flat per-IC price covers everything.",
                  bad: true,
                },
                {
                  icon: Check,
                  label: "Up and running today",
                  body: "Axle is self-serve and live in minutes. Deel averages multi-week onboarding for full feature activation.",
                  bad: false,
                },
                {
                  icon: TrendingDown,
                  label: "3–5× lower cost at any scale",
                  body: "25 contractors on Deel: ~$1,225/mo. On Axle Pro: $350/mo. That's $10,500 saved per year.",
                  bad: false,
                },
              ].map((item) => (
                <StaggerItem key={item.label}>
                  <motion.div
                    className="bg-white rounded-xl border border-gray-200 p-5 h-full cursor-default"
                    whileHover={{ y: -3, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)", transition: { duration: 0.2 } }}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-3 ${item.bad ? "bg-red-50" : "bg-emerald-50"}`}>
                      <item.icon className={`w-4 h-4 ${item.bad ? "text-red-500" : "text-primary"}`} strokeWidth={2.5} />
                    </div>
                    <div className="text-gray-900 text-[14px] font-semibold mb-1">{item.label}</div>
                    <p className="text-gray-500 text-[13px] leading-relaxed">{item.body}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerFadeUp>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-white border-t border-gray-100 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FadeUp className="text-center mb-14">
            <div className="inline-block bg-emerald-50 text-primary text-[11px] font-semibold px-3 py-1 rounded-full mb-3.5 tracking-wide">
              PRICING
            </div>
            <h2 className="font-serif font-normal text-gray-900 text-3xl sm:text-4xl mb-3">Pay only for the ICs you have</h2>
            <p className="text-gray-500 text-lg">No seat bundles. No surprises. Start free for 7 days.</p>
          </FadeUp>

          <StaggerFadeUp className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const planKey = plan.name.toLowerCase() as string;
              const override = PLAN_PRICE_OVERRIDES[detectedCurrency]?.[planKey];
              const displayPrice = override?.price ?? plan.price;
              const displayExample = override?.example ?? plan.example;
              return (
                <StaggerItem key={plan.name}>
                  <motion.div
                    className={`relative rounded-2xl p-7 flex flex-col h-full ${
                      plan.highlight
                        ? "bg-gray-900 border border-gray-900"
                        : "bg-white border-[1.5px] border-gray-200"
                    }`}
                    whileHover={
                      plan.highlight
                        ? { scale: 1.02, transition: { duration: 0.2 } }
                        : { y: -4, boxShadow: "0 12px 32px -6px rgba(0,0,0,0.10)", transition: { duration: 0.2 } }
                    }
                  >
                    {plan.highlight && (
                      <div className="absolute top-3.5 right-3.5 bg-emerald-500 text-white text-[9.5px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                        BEST VALUE
                      </div>
                    )}
                    <div className={`text-[15px] font-semibold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {plan.name}
                    </div>
                    <div className={`text-[13px] mb-6 ${plan.highlight ? "text-white/50" : "text-gray-500"}`}>{plan.tagline}</div>
                    <div className={`text-[38px] font-bold mb-0.5 tracking-tight leading-none ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {displayPrice}
                    </div>
                    <div className={`text-xs mb-1 ${plan.highlight ? "text-white/40" : "text-gray-400"}`}>{plan.priceNote}</div>
                    <div className={`text-[11px] mb-1 font-medium ${plan.highlight ? "text-emerald-400" : "text-primary"}`}>{plan.seats}</div>
                    <div className={`text-[11px] mb-4 ${plan.highlight ? "text-white/30" : "text-gray-400"}`}>{displayExample}</div>
                    <Button
                      className="mb-5 w-full"
                      variant={plan.highlight ? "default" : "secondary"}
                      onClick={() => {
                        if (plan.enterprise) {
                          window.open("mailto:sales@axlehq.app");
                        } else if (isSubdomainMode()) {
                          window.location.href =
                            planKey === "free"
                              ? `${getMarketingOrigin()}/signup`
                              : `${getMarketingOrigin()}/signup?plan=${planKey}`;
                        } else {
                          setLocation(planKey === "free" ? "/signup" : `/signup?plan=${planKey}`);
                        }
                      }}
                      data-testid={`button-plan-${planKey}`}
                    >
                      {plan.cta}
                    </Button>
                    <div className="flex flex-col gap-2">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2">
                          <Check className={`w-3.5 h-3.5 shrink-0 ${plan.highlight ? "text-emerald-400" : "text-primary"}`} strokeWidth={2.5} />
                          <span className={`text-[13px] ${plan.highlight ? "text-white/65" : "text-gray-500"}`}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerFadeUp>

          {/* Pricing calculator */}
          {(() => {
            const calc = CALCULATOR_CURRENCIES[calculatorCurrency] ?? CALCULATOR_CURRENCIES.USD;
            const axleTotal = contractorCount * calc.axleProUnit;
            const deelTotalUsd = contractorCount * DEEL_USD_UNIT;
            const isUsd = calculatorCurrency === "USD";

            return (
              <FadeUp delay={0.15}>
                <div className="mt-12 max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <p className="text-gray-900 text-[15px] font-semibold mb-0.5">How much could you save?</p>
                      <p className="text-gray-500 text-[13px]">Compare your cost on Axle vs Deel at your team size.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <label htmlFor="contractor-count" className="text-gray-600 text-[13px] whitespace-nowrap">Number of contractors:</label>
                        <input
                          id="contractor-count"
                          type="number"
                          min={1}
                          max={500}
                          value={contractorCount}
                          onChange={(e) => setContractorCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                          className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                          data-testid="input-contractor-count"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label htmlFor="calculator-currency" className="text-gray-600 text-[13px] whitespace-nowrap">Currency:</label>
                        <select
                          id="calculator-currency"
                          value={calculatorCurrency}
                          onChange={(e) => {
                            setCalculatorCurrency(e.target.value);
                            setCalculatorCurrencyTouched(true);
                          }}
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                          data-testid="select-calculator-currency"
                        >
                          {Object.entries(CALCULATOR_CURRENCIES).map(([code, c]) => (
                            <option key={code} value={code}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Axle Pro</div>
                      <div className="text-2xl font-bold text-gray-900 mb-0.5">{calc.symbol}{axleTotal.toLocaleString()}<span className="text-sm font-normal text-gray-400"> {calc.label}/mo</span></div>
                      <div className="text-[12px] text-gray-500">{contractorCount} ICs × {calc.symbol}{calc.axleProUnit.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Deel</div>
                      <div className="text-2xl font-bold text-gray-400 mb-0.5">${deelTotalUsd.toLocaleString()}<span className="text-sm font-normal text-gray-400"> USD/mo</span></div>
                      <div className="text-[12px] text-gray-500">{contractorCount} ICs × $49</div>
                    </div>
                  </div>
                  {isUsd ? (
                    <div className="mt-4 bg-emerald-50 rounded-xl border border-emerald-100 px-5 py-3 flex items-center justify-between">
                      <span className="text-[13px] text-emerald-800 font-medium">Your annual saving with Axle</span>
                      <span className="text-emerald-700 font-bold text-[17px]">${((deelTotalUsd - axleTotal) * 12).toLocaleString()} USD / year</span>
                    </div>
                  ) : (
                    <div className="mt-4 bg-emerald-50 rounded-xl border border-emerald-100 px-5 py-3">
                      <span className="text-[13px] text-emerald-800 font-medium">Axle's {calc.label} pricing is Axle's real published rate for your region — Deel doesn't publish {calc.label} pricing and bills internationally in USD, so switch to USD above for a direct dollar comparison.</span>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-3 text-center">
                    Axle pricing shown in {calc.label} is Axle's real published rate, not a currency conversion. Deel figures reflect Deel's published $49/IC/month USD price.
                  </p>
                </div>
              </FadeUp>
            );
          })()}
        </div>
      </section>

      {/* ── CTA dark ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-sidebar py-20 sm:py-24 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: darkDotBg, backgroundSize: "28px 28px" }}
        />
        <FadeUp className="relative max-w-2xl mx-auto px-6">
          <h2 className="font-serif font-normal text-gray-50 text-4xl sm:text-5xl mb-4">
            Ready to bring order to contractor ops?
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-9 max-w-lg mx-auto">
            Run your contractor operations without the spreadsheet chaos.
          </p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3.5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px 0px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <Button
              size="lg"
              onClick={() => {
                if (isSubdomainMode()) {
                  window.location.href = `${getMarketingOrigin()}/signup`;
                } else {
                  setLocation("/signup");
                }
              }}
              data-testid="button-cta-signup"
            >
              Start for free
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToHowItWorks}
              className="border-white/10 bg-white/[0.06] text-gray-300 hover:bg-white/10"
              data-testid="button-cta-demo"
            >
              Book a demo
            </Button>
          </motion.div>
          <p className="text-gray-600 text-xs mt-4">No credit card required. 7-day free trial, up to 3 contractors.</p>
        </FadeUp>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0A0D12] border-t border-white/[0.04] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-9">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-3.5">
                <LogoMark size={22} color="white" />
                <span className="text-gray-50 text-[15px] font-bold tracking-tight">Axle</span>
              </div>
              <p className="text-gray-600 text-[13px] leading-relaxed max-w-xs">
                The modern platform for managing independent contractors, from first timesheet to final payment.
              </p>
            </div>
            <div>
              <div className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-3">Product</div>
              <div className="flex flex-col gap-2">
                <a href="#features" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Pricing
                </a>
                <a href="/blog" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Changelog
                </a>
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-3">Resources</div>
              <div className="flex flex-col gap-2">
                <a href="/blog" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Blog
                </a>
                <a href="mailto:support@axlehq.app" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Support
                </a>
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-[10px] font-bold tracking-widest uppercase mb-3">Legal</div>
              <div className="flex flex-col gap-2">
                <a href="/privacy" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Privacy
                </a>
                <a href="/terms" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Terms
                </a>
                <a href="/cookies" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  Cookies
                </a>
                <a href="/dpa" className="text-gray-500 text-[13px] no-underline hover:text-gray-300 transition-colors">
                  DPA
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-gray-600 text-xs">© {new Date().getFullYear()} Axle. All rights reserved.</span>
            <span className="text-gray-600 text-xs">Built for teams that run on contractors</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
