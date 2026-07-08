import { forwardRef } from "react";
import type {
  BdjobsAccomplishment,
  BdjobsProfileData,
} from "@/data/bdjobsProfileDefault";

/**
 * Renders the Bdjobs profile from structured data in the exact visual pattern
 * of the Bdjobs.com CV export — career objective, career summary, special
 * qualification, structured experience blocks, tabular education/training/
 * certification, grouped accomplishments (portfolio/awards/projects/others),
 * language proficiency table, and personal details.
 *
 * This DOM is also the source for the one-click PDF download — the on-page
 * view IS the printable artifact.
 */
interface Props {
  data: BdjobsProfileData;
}

const AccomplishmentGroup = ({
  label,
  items,
}: {
  label: string;
  items: BdjobsAccomplishment[];
}) => {
  if (!items?.length) return null;
  return (
    <div className="acc-group">
      <p className="acc-group-title">{label}</p>
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            <span className="acc-title">{it.title}</span>
            {it.url && (
              <>
                <br />
                <span className="acc-url">URL: </span>
                <a href={it.url} target="_blank" rel="noopener noreferrer">
                  {it.url}
                </a>
              </>
            )}
            <br />
            <span className="acc-desc">{it.description}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export const BdjobsProfileView = forwardRef<HTMLDivElement, Props>(
  function BdjobsProfileView({ data }, ref) {
    return (
      <div
        ref={ref}
        className="bdjobs-cv"
        style={{
          fontFamily: "Arial, sans-serif",
          color: "#000",
          background: "#fff",
          padding: "24px",
          fontSize: "13px",
          lineHeight: 1.55,
        }}
      >
        <style>{`
          .bdjobs-cv h1 { font-size: 24px; font-weight: 700; color: #333399; margin: 0 0 4px; letter-spacing: 0.2px; }
          .bdjobs-cv h2 { font-size: 15px; font-weight: 700; color: #333399; border-bottom: 1px solid #333399; padding-bottom: 4px; margin: 22px 0 10px; text-transform: uppercase; letter-spacing: 0.6px; }
          .bdjobs-cv h3 { font-size: 13.5px; font-weight: 700; color: #111; margin: 12px 0 2px; }
          .bdjobs-cv p { margin: 4px 0; }
          .bdjobs-cv ul, .bdjobs-cv ol { margin: 4px 0 8px 20px; padding: 0; }
          .bdjobs-cv li { margin: 4px 0; }
          .bdjobs-cv .contact { font-size: 12.5px; color: #222; margin: 2px 0; }
          .bdjobs-cv .contact a { color: #333399; text-decoration: underline; }
          .bdjobs-cv .contact-block { margin-bottom: 6px; }

          .bdjobs-cv .exp-block { margin: 10px 0 14px; }
          .bdjobs-cv .exp-title { font-weight: 700; color: #111; font-size: 13.5px; }
          .bdjobs-cv .exp-period { color: #444; font-style: italic; font-size: 12.5px; margin-left: 6px; }
          .bdjobs-cv .exp-org { color: #333; font-size: 13px; }
          .bdjobs-cv .exp-loc { color: #666; font-size: 12px; }
          .bdjobs-cv .exp-sub { font-weight: 700; font-size: 12.5px; color: #333; margin-top: 6px; }
          .bdjobs-cv .exp-duties { font-size: 12.5px; color: #222; margin-top: 4px; }

          .bdjobs-cv table.data { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 12px; }
          .bdjobs-cv table.data th, .bdjobs-cv table.data td { border: 1px solid #c8c8d6; padding: 5px 7px; text-align: left; vertical-align: top; }
          .bdjobs-cv table.data th { background: #eef0fa; color: #333399; font-weight: 700; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.4px; }

          .bdjobs-cv table.details { width: 100%; border-collapse: collapse; margin-top: 6px; }
          .bdjobs-cv table.details td { padding: 4px 6px; vertical-align: top; font-size: 12.5px; border-bottom: 1px dotted #ccc; }
          .bdjobs-cv table.details td:first-child { font-weight: 600; color: #333; width: 38%; }

          .bdjobs-cv .skills-wrap { display: grid; grid-template-columns: 200px 1fr; gap: 12px; align-items: start; }
          .bdjobs-cv .skills-list { margin: 0; padding: 0; list-style: none; font-size: 12.5px; }
          .bdjobs-cv .skills-list li { margin: 2px 0; }
          .bdjobs-cv .skills-list li::before { content: "• "; color: #333399; font-weight: 700; }
          .bdjobs-cv .skills-desc { font-size: 12.5px; color: #222; }

          .bdjobs-cv .acc-group { margin: 10px 0 14px; }
          .bdjobs-cv .acc-group-title { font-weight: 700; color: #111; font-size: 13px; margin-bottom: 2px; }
          .bdjobs-cv .acc-title { font-weight: 600; color: #111; font-size: 12.5px; }
          .bdjobs-cv .acc-url { color: #666; font-size: 11.5px; }
          .bdjobs-cv .acc-desc { font-size: 12.5px; color: #333; }

          .bdjobs-cv .ref-block { margin: 8px 0 14px; }
        `}</style>

        <h1>{data.fullName}</h1>
        <div className="contact-block">
          <p className="contact">{data.contact.location}</p>
          <p className="contact">{data.contact.phones}</p>
          <p className="contact">{data.contact.emails}</p>
          {data.contact.linkedin && (
            <p className="contact">
              <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer">
                {data.contact.linkedin}
              </a>
            </p>
          )}
          {data.contact.github && (
            <p className="contact">
              <a href={data.contact.github} target="_blank" rel="noopener noreferrer">
                {data.contact.github}
              </a>
            </p>
          )}
        </div>

        {data.careerObjective && (
          <>
            <h2>Career Objective</h2>
            <p>{data.careerObjective}</p>
          </>
        )}

        {data.careerSummary && (
          <>
            <h2>Career Summary</h2>
            <p>{data.careerSummary}</p>
          </>
        )}

        {data.specialQualification && (
          <>
            <h2>Special Qualification</h2>
            <p>{data.specialQualification}</p>
          </>
        )}

        <h2>Experience</h2>
        {data.totalExperience && (
          <p><strong>Total Year of Experience:</strong> {data.totalExperience}</p>
        )}
        {data.experience.map((r, i) => (
          <div key={i} className="exp-block">
            <p>
              <span className="exp-title">
                {i + 1}. {r.title}
              </span>
              {r.period && <span className="exp-period">({r.period})</span>}
            </p>
            {r.org && <p className="exp-org">{r.org}</p>}
            {r.location && <p className="exp-loc">{r.location}</p>}
            {r.areasOfExpertise.length > 0 && (
              <>
                <p className="exp-sub">Area of Expertise</p>
                <p style={{ fontSize: 12.5, color: "#222" }}>
                  {r.areasOfExpertise.join(", ")}
                </p>
              </>
            )}
            {r.duties && (
              <>
                <p className="exp-sub">Duties/Responsibilities</p>
                <p className="exp-duties">{r.duties}</p>
              </>
            )}
          </div>
        ))}

        <h2>Academic / Education</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Exam Title</th>
              <th>Concentration / Major</th>
              <th>Institute</th>
              <th>Result</th>
              <th>Pas. Year</th>
              <th>Duration</th>
              <th>Achievement</th>
            </tr>
          </thead>
          <tbody>
            {data.education.map((e, i) => (
              <tr key={i}>
                <td>{e.exam}</td>
                <td>{e.concentration}</td>
                <td>{e.institute}</td>
                <td>{e.result}</td>
                <td>{e.year}</td>
                <td>{e.duration}</td>
                <td>{e.achievement}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Training</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Training Title</th>
              <th>Topic</th>
              <th>Institute</th>
              <th>Country</th>
              <th>Location</th>
              <th>Year</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {data.training.map((t, i) => (
              <tr key={i}>
                <td>{t.title}</td>
                <td>{t.topic}</td>
                <td>{t.institute}</td>
                <td>{t.country}</td>
                <td>{t.location}</td>
                <td>{t.year}</td>
                <td>{t.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Professional Qualification</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Certification</th>
              <th>Institute</th>
              <th>Location</th>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
          <tbody>
            {data.certifications.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.institute}</td>
                <td>{c.location}</td>
                <td>{c.from}</td>
                <td>{c.to}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Career and Application Information</h2>
        <table className="details">
          <tbody>
            {data.careerInfo.map((row, i) => (
              <tr key={i}>
                <td>{row.label}</td>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Skill</h2>
        <div className="skills-wrap">
          <ul className="skills-list">
            {data.skills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <p className="skills-desc">{data.skillDescription}</p>
        </div>

        <h2>Accomplishment</h2>
        <AccomplishmentGroup label="Portfolio" items={data.accomplishments.portfolio} />
        <AccomplishmentGroup label="Awards" items={data.accomplishments.awards} />
        <AccomplishmentGroup label="Projects" items={data.accomplishments.projects} />
        <AccomplishmentGroup label="Others" items={data.accomplishments.others} />

        {data.extraCurricular.length > 0 && (
          <>
            <h2>Extra Curricular Activities</h2>
            {data.extraCurricular.map((row, i) => (
              <p key={i} style={{ fontSize: 12.5 }}>
                <strong>{row.label}:</strong> {row.value}
              </p>
            ))}
          </>
        )}

        <h2>Language Proficiency</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Language</th>
              <th>Reading</th>
              <th>Writing</th>
              <th>Speaking</th>
            </tr>
          </thead>
          <tbody>
            {data.languages.map((l, i) => (
              <tr key={i}>
                <td>{l.name}</td>
                <td>{l.reading}</td>
                <td>{l.writing}</td>
                <td>{l.speaking}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Personal Details</h2>
        <table className="details">
          <tbody>
            {data.personalDetails.map((row, i) => (
              <tr key={i}>
                <td>{row.label}</td>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Reference</h2>
        {data.references.map((ref, i) => (
          <div key={i} className="ref-block">
            <table className="details">
              <tbody>
                <tr>
                  <td>Name</td>
                  <td><strong>{ref.name}</strong></td>
                </tr>
                <tr><td>Organization</td><td>{ref.organization}</td></tr>
                <tr><td>Designation</td><td>{ref.designation}</td></tr>
                <tr><td>Address</td><td>{ref.address}</td></tr>
                <tr><td>Phone (Office)</td><td>{ref.phoneOffice}</td></tr>
                {ref.mobile && <tr><td>Mobile</td><td>{ref.mobile}</td></tr>}
                <tr>
                  <td>Email</td>
                  <td>
                    <a href={`mailto:${ref.email}`}>{ref.email}</a>
                  </td>
                </tr>
                <tr><td>Relation</td><td>{ref.relation}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  },
);
