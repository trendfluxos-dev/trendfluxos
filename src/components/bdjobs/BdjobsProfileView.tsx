import { forwardRef } from "react";
import type { BdjobsProfileData } from "@/data/bdjobsProfileDefault";

/**
 * Renders the Bdjobs profile from structured data using the same visual
 * language as the previous static export (serif-adjacent sans, #333399
 * section headings, dotted-underline details tables). The output is the
 * exact DOM node handed to `html2pdf.js` for the PDF download, so the
 * on-page view IS the printable artifact — no divergence between preview
 * and PDF.
 */
interface Props {
  data: BdjobsProfileData;
}

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
          .bdjobs-cv h1 { font-size: 22px; font-weight: 700; color: #333399; margin: 0 0 4px; letter-spacing: 0.2px; }
          .bdjobs-cv h2 { font-size: 15px; font-weight: 700; color: #333399; border-bottom: 1px solid #333399; padding-bottom: 4px; margin: 22px 0 10px; text-transform: uppercase; letter-spacing: 0.6px; }
          .bdjobs-cv h3 { font-size: 13.5px; font-weight: 700; color: #111; margin: 12px 0 2px; }
          .bdjobs-cv p { margin: 4px 0; }
          .bdjobs-cv ul { margin: 4px 0 8px 18px; padding: 0; }
          .bdjobs-cv li { margin: 2px 0; }
          .bdjobs-cv .headline { color: #444; font-size: 13px; margin: 2px 0 8px; }
          .bdjobs-cv .contact { font-size: 12px; color: #222; }
          .bdjobs-cv .contact a { color: #333399; text-decoration: underline; }
          .bdjobs-cv .role-meta { display: flex; justify-content: space-between; gap: 12px; font-size: 12.5px; color: #333; font-style: italic; }
          .bdjobs-cv table.details { width: 100%; border-collapse: collapse; margin-top: 6px; }
          .bdjobs-cv table.details td { padding: 4px 6px; vertical-align: top; font-size: 12.5px; border-bottom: 1px dotted #ccc; }
          .bdjobs-cv table.details td:first-child { font-weight: 600; color: #333; width: 38%; }
          .bdjobs-cv .ref-block { margin: 6px 0 12px; }
          .bdjobs-cv .ref-name { font-weight: 700; color: #111; }
        `}</style>

        <h1>{data.fullName}</h1>
        <p className="headline">{data.headline}</p>
        <p className="contact">
          📍 {data.contact.location} &nbsp;|&nbsp; 📞 {data.contact.phones} &nbsp;|&nbsp; ✉️{" "}
          {data.contact.emails.split(",").map((e, i, arr) => {
            const email = e.trim();
            return (
              <span key={email}>
                <a href={`mailto:${email}`}>{email}</a>
                {i < arr.length - 1 ? ", " : ""}
              </span>
            );
          })}
        </p>
        <p className="contact">
          🔗 <a href={data.contact.linkedin}>{data.contact.linkedin.replace(/^https?:\/\//, "")}</a>{" "}
          &nbsp;|&nbsp; 💻 <a href={data.contact.github}>{data.contact.github.replace(/^https?:\/\//, "")}</a>
        </p>

        <h2>Career Summary</h2>
        <p>{data.summary}</p>

        <h2>Core Competencies &amp; AI Skills</h2>
        <ul>
          {data.competencies.map((c) => (
            <li key={c.title}>
              <strong>{c.title}:</strong> {c.description}
            </li>
          ))}
        </ul>

        <h2>Entrepreneurial Ventures &amp; Projects</h2>
        {data.ventures.map((v) => (
          <div key={v.title}>
            <h3>{v.title}</h3>
            <ul>
              {v.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        <h2>Professional Experience</h2>
        {data.experience.map((r) => (
          <div key={`${r.org}-${r.period}`}>
            <h3>{r.org} — {r.role}</h3>
            <p className="role-meta">
              <span>{r.role}</span>
              <span>{r.period}</span>
            </p>
            <ul>
              {r.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        <h2>Academic Background</h2>
        {data.education.map((e) => (
          <div key={e.title}>
            <h3>{e.title}</h3>
            <ul>
              {e.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}

        <h2>Key Achievements, Training &amp; Leadership</h2>
        <ul>
          {data.achievements.map((a) => (
            <li key={a.title}>
              <strong>{a.title}:</strong> {a.description}
            </li>
          ))}
          {data.awards.length > 0 && (
            <li>
              <strong>Awards &amp; Formal Recognition:</strong>
              <ul>
                {data.awards.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </li>
          )}
          {data.training && (
            <li>
              <strong>Professional Training &amp; Certifications:</strong> {data.training}
            </li>
          )}
        </ul>

        <h2>Language Proficiency</h2>
        <table className="details">
          <tbody>
            {data.languages.map((l) => (
              <tr key={l.name}>
                <td>{l.name}</td>
                <td>{l.level}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Personal Details</h2>
        <table className="details">
          <tbody>
            {data.personalDetails.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>References</h2>
        {data.references.map((ref) => (
          <div key={ref.name} className="ref-block">
            <p className="ref-name">{ref.name}</p>
            <table className="details">
              <tbody>
                {ref.rows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>
                      {row.label.toLowerCase().includes("email") ? (
                        <a href={`mailto:${row.value}`}>{row.value}</a>
                      ) : (
                        row.value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  },
);
