import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/react";
import { BookOpen, BotMessageSquare, ChartNoAxesCombined, ChevronLeft, LayoutDashboard, LineChart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

type LearningShellProps = {
  children: React.ReactNode;
};

export function LearningShell({ children }: LearningShellProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, startSignIn } = useAuth();

  const closeMenu = () => setMenuOpen(false);
  const links = [
    { href: "/", label: "الرئيسية", icon: BookOpen },
    { href: "/results", label: "النتائج", icon: ChartNoAxesCombined },
    { href: "/visualize", label: "المختبر", icon: LineChart },
    { href: "/assistant", label: "المساعد", icon: BotMessageSquare },
  ];

  return (
    <div className="site-shell" dir="rtl">
      <div className="shape shape--blue" aria-hidden="true" />
      <div className="shape shape--pink" aria-hidden="true" />
      <header className="site-header">
        <Link href="/" className="brand" onClick={closeMenu} aria-label="العودة إلى الصفحة الرئيسية">
          <span className="brand-mark" aria-hidden="true">ن</span>
          <span>
            <strong>نُقطة</strong>
            <small>للطرق العددية</small>
          </span>
        </Link>

        <button className="menu-toggle" type="button" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="التنقل الرئيسي">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? "nav-link--active" : ""}`} onClick={closeMenu}>
              <Icon size={16} strokeWidth={2.2} />
              {label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/teacher" className={`nav-link ${location === "/teacher" ? "nav-link--active" : ""}`} onClick={closeMenu}>
              <LayoutDashboard size={16} strokeWidth={2.2} /> لوحة المدرس
            </Link>
          )}
          <Link href="/units/errors-rounding" className="nav-cta" onClick={closeMenu}>
            ابدأ الدراسة <ChevronLeft size={16} />
          </Link>
          {!isAuthenticated && <button type="button" className="auth-button" onClick={startSignIn}>تسجيل الدخول</button>}
          {isAuthenticated && <UserButton />}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <span>منصة تفاعلية للطرق العددية</span>
        <span className="footer-dot" aria-hidden="true" />
        <span>محتوى مستخلص من ملفات المقرر المرفقة</span>
      </footer>
    </div>
  );
}
