import type { Metadata } from "next";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UiFeedbackProvider } from "@/components/providers/UiFeedbackProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qrew — Multi-Tenant Access Control Platform",
  description:
    "Enterprise multi-tenant management and hierarchical access-control platform.",
  icons: {
    icon: "/assets/logo.png",
  },
};

const ANTI_FOWC_STYLE = `
  html {
    background-color: #0B1220;
  }
  html:not([data-theme="dark"]) {
    background-color: #F8FAFC;
  }
  body {
    background-color: inherit;
    color: inherit;
  }
`;

const ANTI_FOWC_SCRIPT = `
  (function() {
    try {
      var sp = new URLSearchParams(window.location.search);
      var urlTheme = sp.get('theme');
      var theme = urlTheme || localStorage.getItem('qrew_ui_theme') || 'system';
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var root = document.documentElement;
      if (isDark) {
        root.setAttribute('data-theme', 'dark');
        root.style.backgroundColor = '#0B1220';
        root.style.colorScheme = 'dark';
      } else {
        root.removeAttribute('data-theme');
        root.style.backgroundColor = '#F8FAFC';
        root.style.colorScheme = 'light';
      }

      var p = (window.location.pathname || '/').replace(/\\/+$/, '') || '/';
      var seg = p === '/' ? '' : decodeURIComponent(p.slice(1).split('/')[0] || '');
      var ws = 'platform';
      if (!seg) {
        ws = 'landing';
      } else if (seg === 'tenant-landing') {
        ws = 'tenant-landing';
      } else if (seg === 'profile') {
        ws = sp.get('ws') || sp.get('workspace') || sp.get('from') || (window.sessionStorage && sessionStorage.getItem('qrew_active_workspace')) || 'platform';
      } else if (
        seg === 'platform' || seg === 'super-admin' || seg === 'tenant' ||
        seg === 'tenant-super-admin' || seg === 'office-config' || seg === 'office-admin' ||
        seg === 'office' || seg === 'department' || seg === 'member'
      ) {
        ws = seg;
      }

      var THEMES = {
        platform: { p: '#2563EB', d: '#60A5FA', l: '#EFF6FF', h: '#DBEAFE', dl: 'rgba(96, 165, 250, 0.18)', dh: 'rgba(96, 165, 250, 0.30)' },
        'super-admin': { p: '#2563EB', d: '#60A5FA', l: '#EFF6FF', h: '#DBEAFE', dl: 'rgba(96, 165, 250, 0.18)', dh: 'rgba(96, 165, 250, 0.30)' },
        tenant: { p: '#7C3AED', d: '#A78BFA', l: '#F5F3FF', h: '#EDE9FE', dl: 'rgba(167, 139, 250, 0.18)', dh: 'rgba(167, 139, 250, 0.30)' },
        'tenant-landing': { p: '#7C3AED', d: '#A78BFA', l: '#F5F3FF', h: '#EDE9FE', dl: 'rgba(167, 139, 250, 0.18)', dh: 'rgba(167, 139, 250, 0.30)' },
        'tenant-super-admin': { p: '#7C3AED', d: '#A78BFA', l: '#F5F3FF', h: '#EDE9FE', dl: 'rgba(167, 139, 250, 0.18)', dh: 'rgba(167, 139, 250, 0.30)' },
        office: { p: '#0F766E', d: '#2DD4BF', l: '#F0FDFA', h: '#CCFBF1', dl: 'rgba(45, 212, 191, 0.18)', dh: 'rgba(45, 212, 191, 0.30)' },
        department: { p: '#0F766E', d: '#2DD4BF', l: '#F0FDFA', h: '#CCFBF1', dl: 'rgba(45, 212, 191, 0.18)', dh: 'rgba(45, 212, 191, 0.30)' },
        member: { p: '#0F766E', d: '#2DD4BF', l: '#F0FDFA', h: '#CCFBF1', dl: 'rgba(45, 212, 191, 0.18)', dh: 'rgba(45, 212, 191, 0.30)' },
        'office-admin': { p: '#EA580C', d: '#FB923C', l: '#FFF7ED', h: '#FFEDD5', dl: 'rgba(251, 146, 60, 0.18)', dh: 'rgba(251, 146, 60, 0.30)' },
        'office-config': { p: '#EA580C', d: '#FB923C', l: '#FFF7ED', h: '#FFEDD5', dl: 'rgba(251, 146, 60, 0.18)', dh: 'rgba(251, 146, 60, 0.30)' }
      };
      var HOVER = {
        '#2563EB': ['#1D4ED8', '#3B82F6'], '#60A5FA': ['#2563EB', '#93C5FD'],
        '#7C3AED': ['#6D28D9', '#8B5CF6'], '#A78BFA': ['#7C3AED', '#C4B5FD'],
        '#0F766E': ['#115E59', '#14B8A6'], '#0D9488': ['#0F766E', '#14B8A6'],
        '#2DD4BF': ['#0F766E', '#5EEAD4'], '#EA580C': ['#C2410C', '#FB923C'],
        '#F97316': ['#EA580C', '#FB923C'], '#FB923C': ['#EA580C', '#FDBA74'],
        '#059669': ['#047857', '#10B981']
      };
      function getHover(hex) {
        var u = String(hex || '').toUpperCase();
        if (HOVER[u]) return isDark ? HOVER[u][1] : HOVER[u][0];
        var c = hex.replace('#', '');
        if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        var n = parseInt(c, 16);
        if (isNaN(n)) return isDark ? '#3B82F6' : '#1D4ED8';
        var f = isDark ? 28 : -28;
        var r = Math.min(255, Math.max(0, ((n >> 16) & 255) + f));
        var g = Math.min(255, Math.max(0, ((n >> 8) & 255) + f));
        var b = Math.min(255, Math.max(0, (n & 255) + f));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      }
      function hexRgb(hex) {
        var c = String(hex || '').replace('#', '');
        if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
        var n = parseInt(c, 16);
        if (isNaN(n)) return '37, 99, 235';
        return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
      }

      var secondary = localStorage.getItem('qrew_ui_secondary') || localStorage.getItem('qrew_ui_accent');
      if (secondary && secondary !== 'default') {
        var rgb = hexRgb(secondary);
        root.style.setProperty('--color-secondary', secondary);
        root.style.setProperty('--panel-accent', secondary);
        root.style.setProperty('--panel-accent-light', isDark ? 'rgba(' + rgb + ', 0.2)' : 'rgba(' + rgb + ', 0.12)');
        root.style.setProperty('--panel-accent-hover', isDark ? 'rgba(' + rgb + ', 0.32)' : 'rgba(' + rgb + ', 0.2)');
        root.style.setProperty('--color-accent', secondary);
        root.style.setProperty('--color-accent-hover', getHover(secondary));
      } else {
        var t = THEMES[ws] || THEMES.platform;
        var acc = isDark ? (t.d || t.p) : t.p;
        root.style.removeProperty('--color-secondary');
        root.style.setProperty('--panel-accent', acc);
        root.style.setProperty('--panel-accent-light', isDark ? t.dl : t.l);
        root.style.setProperty('--panel-accent-hover', isDark ? t.dh : t.h);
        root.style.setProperty('--color-accent', acc);
        root.style.setProperty('--color-accent-hover', getHover(acc));
      }

      var sw = parseInt(localStorage.getItem('qrew_sidebar_width') || '', 10);
      if (sw >= 180 && sw <= 500) {
        root.style.setProperty('--sidebar-width', sw + 'px');
      }
      if (localStorage.getItem('qrew_sidebar_collapsed') === 'true') {
        root.setAttribute('data-sidebar-collapsed', 'true');
      } else {
        root.removeAttribute('data-sidebar-collapsed');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: ANTI_FOWC_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOWC_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider>
            <UiFeedbackProvider>{children}</UiFeedbackProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
