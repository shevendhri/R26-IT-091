import Link from "next/link";

import { fetchFromApi } from "@/lib/green-assessment/api";

export const dynamic = "force-dynamic";

export default async function CriteriaPage() {
  let categories = [];
  let criterionDetails = {};
  let error = null;

  try {
    categories = await fetchFromApi("/uda/criteria/grouped");
    const details = await Promise.all(
      categories
        .flatMap((category) => category.criteria)
        .map((criterion) => fetchFromApi(`/uda/criteria/${criterion.criterion_code}`)),
    );
    criterionDetails = Object.fromEntries(
      details.map((criterion) => [criterion.criterion_code, criterion]),
    );
  } catch (requestError) {
    error = requestError.message;
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <Link className="back-link" href="/green-assessment">
          Back
        </Link>
        <p className="eyebrow">UDA Blue Green Sri Lanka</p>
        <h1>UDA Criteria by Category</h1>
        <p className="lede">
          Review the UDA Blue Green Sri Lanka green building guideline
          master-data grouped by category, with source traceability and manual
          review warnings where scoring rules are ambiguous.
        </p>
      </header>

      {error ? (
        <div className="notice error">
          Could not load UDA criteria. Confirm the backend is running at{" "}
          <code>the Green Assessment API</code>.
        </div>
      ) : (
        <section className="category-list">
          {categories.map((category) => (
            <article className="category-card" key={category.category_code}>
              <div className="category-heading">
                <div>
                  <p className="category-code">{category.category_code}</p>
                  <h2>{category.category_name}</h2>
                </div>
                <span>{category.criteria.length} criteria</span>
              </div>

              <div className="criteria-list">
                {category.criteria.length === 0 ? (
                  <p className="empty">No UDA criteria seeded yet.</p>
                ) : (
                  category.criteria.map((criterion) => {
                    const detail = criterionDetails[criterion.criterion_code];
                    return (
                      <details className="criterion-detail" key={criterion.id}>
                        <summary>
                          <div>
                            <p className="criterion-code">
                              {criterion.criterion_code}
                            </p>
                            <h3>{criterion.criterion_name}</h3>
                            <p>
                              Maximum marks: {criterion.maximum_marks} | Scoring
                              status: {criterion.scoring_status}
                            </p>
                          </div>
                          <span>{criterion.maximum_marks} marks</span>
                        </summary>

                        {detail ? (
                          <div className="criterion-detail-body">
                            {detail.scoring_status === "requires_review" ? (
                              <div className="notice error">
                                Review required before automation. The source
                                guideline contains ambiguous, incomplete, or
                                manually assessed scoring information.
                              </div>
                            ) : null}

                            <section>
                              <h4>Objective</h4>
                              <p>{detail.objective || "Not specified."}</p>
                            </section>

                            <section>
                              <h4>Methodology</h4>
                              <p>{detail.methodology || "Not specified."}</p>
                            </section>

                            <section>
                              <h4>Scoring Rules</h4>
                              {detail.scoring_rules.length === 0 ? (
                                <p>No scoring rules captured.</p>
                              ) : (
                                <div className="rule-list">
                                  {detail.scoring_rules.map((rule) => (
                                    <article className="rule-card" key={rule.id}>
                                      <div className="gap-heading">
                                        <strong>Rule {rule.rule_order}</strong>
                                        <span>
                                          {rule.marks ?? "Review"} marks
                                        </span>
                                      </div>
                                      <p>{rule.condition_text}</p>
                                      {rule.requires_manual_review ? (
                                        <p className="review-warning">
                                          Manual review required before this
                                          condition becomes a machine rule.
                                        </p>
                                      ) : null}
                                    </article>
                                  ))}
                                </div>
                              )}
                            </section>

                            <section>
                              <h4>Design Assessment (DA) Documents</h4>
                              <RequirementList
                                requirements={detail.da_required_documents}
                              />
                            </section>

                            <section>
                              <h4>
                                Completion Verification Assessment (CVA)
                                Documents
                              </h4>
                              <RequirementList
                                requirements={detail.cva_required_documents}
                              />
                            </section>

                            <dl className="detail-facts">
                              <div>
                                <dt>Automation type</dt>
                                <dd>{detail.automation_type}</dd>
                              </div>
                              <div>
                                <dt>Source page</dt>
                                <dd>{detail.source_page ?? "Not specified"}</dd>
                              </div>
                              <div>
                                <dt>Review notes</dt>
                                <dd>{detail.notes || "None"}</dd>
                              </div>
                            </dl>
                          </div>
                        ) : null}
                      </details>
                    );
                  })
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function RequirementList({ requirements }) {
  if (!requirements.length) {
    return <p>No required documents captured.</p>;
  }

  return (
    <ol className="requirement-list">
      {requirements.map((requirement) => (
        <li key={requirement.id}>{requirement.requirement_text}</li>
      ))}
    </ol>
  );
}
