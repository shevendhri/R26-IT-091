import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import "./green-assessment.css";

const navItems = [
  { href: "/green-assessment", label: "Dashboard" },
  { href: "/green-assessment/projects", label: "Projects" },
  { href: "/green-assessment/projects/create", label: "Create Project" },
  { href: "/green-assessment/criteria", label: "UDA Criteria" },
];

export default function GreenAssessmentLayout({ children }) {
  return (
    <div className="ga-app-frame">
      <Header />
      <div className="workspace-frame">
        <aside className="sidebar" aria-label="Green Assessment navigation">
          <h2 className="sidebar-section-title">GREEN BUILDING CERTIFICATION PRE-ASSESSMENT</h2>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
          <h2 className="sidebar-section-title admin-title">ADMIN</h2>
          <nav className="sidebar-nav">
            <Link href="/green-assessment/dataset">Dataset Annotation</Link>
          </nav>
        </aside>
        <main className="main-frame">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
