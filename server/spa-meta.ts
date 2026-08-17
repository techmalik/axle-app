import { CANONICAL_ORIGIN } from "./ssrShared";

const SITE_URL = CANONICAL_ORIGIN;
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
}

const PUBLIC_ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Axle — Contractor Management Platform",
    description:
      "Axle helps companies manage independent contractors with timesheets, invoices, leave tracking, and performance reviews — all in one place.",
    canonical: `${SITE_URL}/`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/login": {
    title: "Log in — Axle",
    description:
      "Log in to your Axle account to manage timesheets, invoices, leave requests, and more.",
    canonical: `${SITE_URL}/login`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/signup": {
    title: "Request access — Axle",
    description:
      "Request access to Axle and get your account set up by our team. Manage independent contractors with timesheets, invoices, and performance reviews.",
    canonical: `${SITE_URL}/signup`,
    ogImage: DEFAULT_OG_IMAGE,
  },
  "/competitive-analysis": {
    title: "Axle vs. Competitors — Contractor Management Comparison",
    description:
      "See how Axle compares to Deel, Remote, Rippling, Worksuite, and other contractor management platforms across features, pricing, and market positioning.",
    canonical: `${SITE_URL}/competitive-analysis`,
    ogImage: DEFAULT_OG_IMAGE,
  },
};

function buildMetaTags(meta: RouteMeta): string {
  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${meta.description}">`,
    `<link rel="canonical" href="${meta.canonical}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${meta.title}">`,
    `<meta property="og:description" content="${meta.description}">`,
    `<meta property="og:url" content="${meta.canonical}">`,
    `<meta property="og:image" content="${meta.ogImage}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${meta.title}">`,
    `<meta name="twitter:description" content="${meta.description}">`,
    `<meta name="twitter:image" content="${meta.ogImage}">`,
  ].join("\n    ");
}

export function injectRouteMeta(html: string, pathname: string): string {
  const meta = PUBLIC_ROUTE_META[pathname];
  if (!meta) return html;

  const tags = buildMetaTags(meta);

  return html
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<meta name="description"[^>]*>/, "")
    .replace("</head>", `    ${tags}\n  </head>`);
}

export function isPublicSpaRoute(pathname: string): boolean {
  return pathname in PUBLIC_ROUTE_META;
}
