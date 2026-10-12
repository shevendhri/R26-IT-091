"use client";

import Link from "next/link";
import ModuleHeroBanner from "@/components/ui/ModuleHeroBanner";

const workflowCards = [
  {
    title: "Projects",
    text: "Create or open a design-stage assessment project and manage uploaded evidence documents.",
    href: "/green-assessment/projects",
    action: "Open Projects",
  },
  {
    title: "Create Project",
    text: "Start a new UDA Blue Green Sri Lanka pre-assessment record for a building project.",
    href: "/green-assessment/projects/create",
    action: "Create Project",
  },
  {
    title: "UDA Criteria",
    text: "Review the Green Building Certification Pre-Assessment criteria and scoring structure.",
    href: "/green-assessment/criteria",
    action: "View Criteria",
  },
];

export default function GreenAssessmentPage() {
  return (
    <main className="page-shell">
      <ModuleHeroBanner
        track="02 / SUSTAINABILITY BENCHMARK"
        kicker="GREENSL & UDA BLUE-GREEN CERTIFICATION"
        title="GREEN BUILDING PRE-ASSESSMENT & SUSTAINABILITY AUDIT"
        subtitle="UDA Blue Green Sri Lanka design-stage pre-assessment for uploaded building documents, evidence review, deterministic scoring, and recommendation support."
        imageSrc="/green_architecture.jpg"
        imageAlt="Green Building Architecture & Biophilic Design"
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link className="button primary" href="/green-assessment/projects">View Projects</Link>
            <Link className="button" href="/green-assessment/projects/create">Create Project</Link>
          </div>
        }
      />

      <section className="card-grid three-column">
        {workflowCards.map((card) => (
          <article className="feature-card" key={card.href}>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <Link className="button" href={card.href}>{card.action}</Link>
          </article>
        ))}
      </section>

      <section className="notice" role="note">
        This is a preliminary assessment and is not an official UDA certification.
      </section>
    </main>
  );
}
