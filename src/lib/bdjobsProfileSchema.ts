/**
 * Runtime validation for the Bdjobs profile payload. Fails fast when the
 * required sections (career summary, experience, education, references) are
 * missing or empty so we never render a broken CV page.
 */
import { z } from "zod";
import type { BdjobsProfileData } from "@/data/bdjobsProfileDefault";

const nonEmpty = (label: string) =>
  z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`);

const experienceSchema = z.object({
  title: nonEmpty("Experience.title"),
  period: nonEmpty("Experience.period"),
  org: nonEmpty("Experience.org"),
  location: z.string().optional().default(""),
  areasOfExpertise: z.array(z.string()).optional().default([]),
  duties: nonEmpty("Experience.duties"),
});

const educationSchema = z.object({
  exam: nonEmpty("Education.exam"),
  concentration: z.string().optional().default(""),
  institute: nonEmpty("Education.institute"),
  result: z.string().optional().default(""),
  year: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  achievement: z.string().optional().default(""),
});

const referenceSchema = z.object({
  name: nonEmpty("Reference.name"),
  organization: nonEmpty("Reference.organization"),
  designation: nonEmpty("Reference.designation"),
  address: z.string().optional().default(""),
  phoneOffice: z.string().optional().default(""),
  mobile: z.string().optional(),
  email: nonEmpty("Reference.email"),
  relation: z.string().optional().default(""),
});

/**
 * Only the four sections the app treats as required are strictly checked.
 * Everything else is passthrough — we don't want editor freedom to trigger
 * validation errors on optional fields.
 */
export const bdjobsProfileSchema = z
  .object({
    careerSummary: nonEmpty("careerSummary"),
    experience: z
      .array(experienceSchema, { required_error: "experience is required" })
      .min(1, "experience must have at least one entry"),
    education: z
      .array(educationSchema, { required_error: "education is required" })
      .min(1, "education must have at least one entry"),
    references: z
      .array(referenceSchema, { required_error: "references is required" })
      .min(1, "references must have at least one entry"),
  })
  .passthrough();

export class BdjobsProfileValidationError extends Error {
  issues: string[];
  constructor(issues: string[]) {
    super(`Bdjobs profile validation failed: ${issues.join("; ")}`);
    this.name = "BdjobsProfileValidationError";
    this.issues = issues;
  }
}

/**
 * Runs the schema and throws {@link BdjobsProfileValidationError} on failure.
 * Returns the original payload (typed) on success — we don't want zod's
 * default-filling to reshape the object.
 */
export function assertValidBdjobsProfile(payload: unknown): BdjobsProfileData {
  const parsed = bdjobsProfileSchema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => {
      const path = i.path.join(".") || "(root)";
      return `${path}: ${i.message}`;
    });
    throw new BdjobsProfileValidationError(issues);
  }
  return payload as BdjobsProfileData;
}