/**
 * Structured Bdjobs profile schema + canonical default payload.
 *
 * This is the single source of truth rendered on `/bdjobs-profile` and edited
 * by admins on `/bdjobs-profile/edit`. Admin edits are persisted into
 * `site_profile_data` (slug = "bdjobs") and hydrate the public page. If the
 * table is empty (e.g. fresh environment), the page falls back to this file.
 */

export type BdjobsContact = {
  location: string;
  phones: string;
  emails: string;
  linkedin: string;
  github: string;
};

export type BdjobsCompetency = { title: string; description: string };

export type BdjobsVenture = { title: string; bullets: string[] };

export type BdjobsRole = {
  org: string;
  role: string;
  period: string;
  bullets: string[];
};

export type BdjobsEducation = { title: string; bullets: string[] };

export type BdjobsAchievement = { title: string; description: string };

export type BdjobsLanguage = { name: string; level: string };

export type BdjobsDetailRow = { label: string; value: string };

export type BdjobsReference = { name: string; rows: BdjobsDetailRow[] };

export type BdjobsProfileData = {
  fullName: string;
  headline: string;
  contact: BdjobsContact;
  summary: string;
  competencies: BdjobsCompetency[];
  ventures: BdjobsVenture[];
  experience: BdjobsRole[];
  education: BdjobsEducation[];
  achievements: BdjobsAchievement[];
  awards: string[];
  training: string;
  languages: BdjobsLanguage[];
  personalDetails: BdjobsDetailRow[];
  references: BdjobsReference[];
};

export const BDJOBS_PROFILE_SLUG = "bdjobs";

export const DEFAULT_BDJOBS_PROFILE: BdjobsProfileData = {
  fullName: "Zahid Hasan Emon",
  headline:
    "Founder of TrendFlux Digital · AI-Powered Growth Operator & Brand Architect",
  contact: {
    location: "Dhaka - 1214, Shahbag, Dhaka",
    phones: "01756004037, 01712007139",
    emails: "zhemon.sm123@gmail.com, hello@emonit.tech",
    linkedin: "https://www.linkedin.com/in/zhemon-it/",
    github: "https://github.com/ZahidDigitalHQ",
  },
  summary:
    "AI-powered Digital Growth Operator and Brand Architect focused on building scalable digital ecosystems that turn audience attention into measurable ROI. As the Founder of TrendFlux Digital, my methodology transcends traditional marketing by treating growth as an engineered, auditable infrastructure. I am particularly drawn to roles that integrate cloud technologies, digital transformation, and tech-enabled solutions for real-world challenges. My expertise lies at the precise intersection of data-driven performance, creative storytelling, and smart automation to maximize brand visibility. By replacing disconnected systems with cohesive AI-driven growth frameworks, I drive massive organic growth for both local and international brands across the US and UK markets.",
  competencies: [
    {
      title: "AI & Advanced Automation",
      description:
        "Extensive implementation of Artificial Intelligence (AI) and ChatGPT for optimizing complex business workflows. Developing AI-Driven Marketing Systems and leveraging technology to execute comprehensive Digital Transformation strategies.",
    },
    {
      title: "Digital Growth & Performance",
      description:
        "Proven track record as an AI-driven digital growth specialist. Highly skilled in utilizing Performance Management Systems, ROI Optimization, Market Analysis, and scaling organic reach without heavy ad dependencies.",
    },
    {
      title: "Brand Ecosystems & Storytelling",
      description:
        "Deep expertise in Branding, Graphic Design Foundation, and constructing emotionally resonant visual communication. Proficient in comprehensive Content Creation, strategic short-form video production, and building engaged communities.",
    },
    {
      title: "Leadership & Community Organizing",
      description:
        "Exceptional capabilities in Community Management, Public Speaking, and Cross-functional Team Leadership. Demonstrated success in independently organizing large-scale developmental, welfare, and cultural initiatives within academic and civic environments.",
    },
  ],
  ventures: [
    {
      title: "Founder — TrendFlux Digital · AI-Driven Brand Growth",
      bullets: [
        "Founded a boutique digital agency specifically specialized in architecting AI-driven marketing systems.",
        "Built multi-brand identity systems from the ground up, moving far beyond standard commodity service provision.",
        "Implemented comprehensive AI-driven growth strategies that delivered a 45%+ growth in engagement through rigorous content optimization.",
      ],
    },
    {
      title: "Founder — Emon IT · Tech & Digital Solutions",
      bullets: [
        "Designed robust cloud architecture specifically intended to support comprehensive digital transformation for organizations.",
        "Built complete digital identities alongside highly structured, AI-driven content workflows.",
        "Ensured consistent and highly personalized content output, significantly enhancing overall brand credibility and market positioning.",
      ],
    },
    {
      title: "Founder — Debate Emon · Youth Engagement Platform",
      bullets: [
        "Built a dynamic, interactive educational platform centered around engaging short-form video content.",
        "Captured and engaged a community of 50,000+ youth in structured debates and critical educational discourse.",
        "Utilized targeted polls and short-form content to drive 65%+ growth in platform interactions, dominating Gen Z audiences.",
      ],
    },
  ],
  experience: [
    {
      org: "Pabna Nagarik Committee (PNC)",
      role: "Brand Promotion & Digital Marketing",
      period: "13 Nov 2025 – 10 Feb 2026",
      bullets: [
        "Architected and flawlessly executed comprehensive digital campaigns with exceptionally strong brand positioning.",
        "Rapidly achieved 4.85 Lakh+ total views alongside engaging 1.54 Lakh+ unique viewers in an extremely short timeframe.",
        "Reached an unprecedented 82% organic reach entirely without spending on paid advertisements.",
        "Personally handled the entire content creation pipeline — 166 static designs and 22 high-retention, high-performing reels.",
      ],
    },
    {
      org: "H&B EduVerse",
      role: "Assistant Manager",
      period: "01 Sep 2025 – 31 Dec 2025",
      bullets: [
        "Directed and oversaw all strategic digital marketing efforts within the specialized area of educational consulting.",
        "Managed end-to-end content workflows — scripting, professional editing, and consistent publication schedules.",
        "Developed a modern, student-friendly brand identity and handled all internal and external corporate communications.",
        "Strategically implemented short-form videos and data-driven infographics to substantially increase student engagement.",
      ],
    },
    {
      org: "Originate Marketing",
      role: "Social Media Manager",
      period: "01 Mar 2025 – 30 Jun 2025",
      bullets: [
        "Autonomously managed multi-channel digital marketing strategies simultaneously for 5 prominent international brands.",
        "Targeted and successfully penetrated highly competitive digital markets specifically within the US and UK.",
        "Provided strict oversight of weekly content calendars, editing tools, short-form video creation, and community engagement.",
        "Utilized cutting-edge data analytics to directly enhance content effectiveness and systematically increase ROI.",
      ],
    },
  ],
  education: [
    {
      title: "B.Sc. in Information Technology — Jahangirnagar University (2022)",
      bullets: [
        "Built a strong IT foundation heavily focused on data infrastructure and networking.",
        "Paired technical academic excellence with highly active, visible campus leadership roles.",
      ],
    },
    {
      title: "HSC (Science) — Govt. Shaheed Bulbul College, Pabna (2016)",
      bullets: [
        "Achieved a perfect GPA 5.00 in the rigorous Science curriculum.",
        "Officially recognized for securing the highest marks in the college's entire recorded history.",
      ],
    },
    {
      title: "SSC (Science) — Pabna Zilla School (2014)",
      bullets: [
        "Achieved a perfect GPA 5.00 in the Science curriculum.",
        "Established early as a prominent BTV Debater and youth leader, organizing debate clubs during academic tenure.",
      ],
    },
  ],
  achievements: [
    {
      title: "Civic Activism, Integrity & Social Courage",
      description:
        "Publicly and courageously stood against violent campus torture cells and systemic extortion at Jahangirnagar University. Demonstrated strong ethical principles and social courage by independently holding a press conference and officially reporting incidents to authorities, ensuring strict institutional accountability despite facing severe personal abuse.",
    },
    {
      title: "Student Leadership",
      description:
        "Served with distinction as the President of the Pabna Zilla Chhatra Kallyan Samiti at Jahangirnagar University. Led the committee in representing the broader student community, organizing welfare initiatives, and coordinating large-scale developmental and cultural activities.",
    },
    {
      title: "Debate & Youth Mentorship",
      description:
        "Recognized formally as a Life Member and distinguished Advisor of the Pabna Debate Society (PDS). Actively contributing to regional youth leadership development, mentoring emerging debaters, and shaping intellectual discourse.",
    },
  ],
  awards: [
    "Awarded a special scholarship by the BSB Foundation and Cambrian School & College for exceptional performance in the regional debate festival.",
    "Secured 1st place in the competitive regional seasonal competition organized by Bangladesh Shishu Academy — showcasing outstanding analytical and public speaking skills.",
  ],
  training:
    "Completed intensive certified training programs through 10 Minute School — Basics of Management, Mobile Photography and Videography, Graphic Design Foundation, and Affiliate Marketing & Digital Strategy.",
  languages: [
    { name: "Bangla", level: "Reading (High) · Writing (High) · Speaking (High)" },
    { name: "English", level: "Reading (Medium) · Writing (Medium) · Speaking (Medium)" },
  ],
  personalDetails: [
    { label: "Father's Name", value: "Md. Mujahedul Islam" },
    { label: "Mother's Name", value: "Sharmin Akter Lucky" },
    { label: "Date of Birth", value: "24 Dec, 1999" },
    { label: "Gender", value: "Male" },
    { label: "Marital Status", value: "Unmarried" },
    { label: "Nationality", value: "Bangladeshi" },
    { label: "National ID No", value: "4656819267" },
    { label: "Religion", value: "Islam" },
    { label: "Passport No", value: "A18512306 (Issue Date: 25 Apr, 2025)" },
    { label: "Permanent Address", value: "Chalkdublia, Pabna Sadar, Pabna-6600" },
    { label: "Current Location", value: "Dhaka - 1214, Shahbag, Dhaka" },
    { label: "Blood Group", value: "AB+" },
    { label: "Height & Weight", value: "1.65 Meter · 68 Kg" },
  ],
  references: [
    {
      name: "1. Dr. M. Mesbahuddin Sarker",
      rows: [
        { label: "Designation", value: "Professor, Institute of Information Technology (IIT)" },
        { label: "Organization", value: "Jahangirnagar University, Savar, Dhaka-1342, Bangladesh" },
        { label: "Phone (Office)", value: "880-1716091920" },
        { label: "Email", value: "sarker@juniv.edu" },
        { label: "Relation", value: "Academic" },
      ],
    },
    {
      name: "2. Jannatul Ferdaus Esha",
      rows: [
        { label: "Designation", value: "Assistant Teacher" },
        { label: "Organization", value: "Motijheel Govt Girls' High School, Motijheel, Dhaka, Bangladesh" },
        { label: "Phone & Mobile", value: "01515202801" },
        { label: "Email", value: "eshafineartju42@gmail.com" },
        { label: "Relation", value: "Relative" },
      ],
    },
  ],
};
