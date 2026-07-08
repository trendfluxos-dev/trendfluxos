/**
 * Structured Bdjobs profile schema — mirrors the real Bdjobs.com CV export
 * (career objective, special qualification, structured tables, grouped
 * accomplishments, etc). Rendered on `/bdjobs-profile` and edited by admins
 * on `/bdjobs-profile/edit`. Persisted in `site_profile_data`
 * (slug = "bdjobs") so edits sync instantly to the public page.
 */

export type BdjobsContact = {
  location: string;
  phones: string;
  emails: string;
  linkedin: string;
  github: string;
};

export type BdjobsExperienceRole = {
  title: string;
  period: string;
  org: string;
  location: string;
  areasOfExpertise: string[];
  duties: string;
};

export type BdjobsEducationRow = {
  exam: string;
  concentration: string;
  institute: string;
  result: string;
  year: string;
  duration: string;
  achievement: string;
};

export type BdjobsTrainingRow = {
  title: string;
  topic: string;
  institute: string;
  country: string;
  location: string;
  year: string;
  duration: string;
};

export type BdjobsCertificationRow = {
  name: string;
  institute: string;
  location: string;
  from: string;
  to: string;
};

export type BdjobsAccomplishment = {
  title: string;
  url?: string;
  description: string;
};

export type BdjobsAccomplishments = {
  portfolio: BdjobsAccomplishment[];
  awards: BdjobsAccomplishment[];
  projects: BdjobsAccomplishment[];
  others: BdjobsAccomplishment[];
};

export type BdjobsLanguageRow = {
  name: string;
  reading: string;
  writing: string;
  speaking: string;
};

export type BdjobsDetailRow = { label: string; value: string };

export type BdjobsReference = {
  name: string;
  organization: string;
  designation: string;
  address: string;
  phoneOffice: string;
  mobile?: string;
  email: string;
  relation: string;
};

export type BdjobsProfileData = {
  fullName: string;
  headline: string;
  contact: BdjobsContact;
  careerObjective: string;
  careerSummary: string;
  specialQualification: string;
  totalExperience: string;
  experience: BdjobsExperienceRole[];
  education: BdjobsEducationRow[];
  training: BdjobsTrainingRow[];
  certifications: BdjobsCertificationRow[];
  careerInfo: BdjobsDetailRow[];
  skills: string[];
  skillDescription: string;
  accomplishments: BdjobsAccomplishments;
  extraCurricular: BdjobsDetailRow[];
  languages: BdjobsLanguageRow[];
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
  careerObjective:
    "I am particularly drawn to roles that integrate cloud technologies, digital transformation, and tech-enabled solutions for real-world challenges.",
  careerSummary:
    "AI-powered Digital Growth Operator & Brand Architect. I build scalable digital ecosystems that turn audience attention into ROI. Proven success managing US/UK brands and driving massive organic growth (e.g., 4.85 Lakh+ views with 82% organic reach). My expertise lies at the intersection of data-driven performance, creative storytelling, and smart automation to maximize brand visibility.",
  specialQualification:
    "B.Sc. in IT (Jahangirnagar University) with expertise in AI marketing, brand identity & KPI tracking. Proven leader in executing end-to-end content workflows & community building. Proactive, dependable & focused on data-driven ROI.",
  totalExperience: "0.8 yrs",
  experience: [
    {
      title: "Brand",
      period: "13 Nov, 2025 - 10 Feb, 2026",
      org: "Pabna Nagarik Committee (PNC)",
      location: "Pabna",
      areasOfExpertise: [
        "Brand Promotion (2 months)",
        "Digital Marketing (2 months)",
        "Political Analysis (2 months)",
        "Social Media Management (2 months)",
      ],
      duties:
        "Delivered executed digital campaigns with strong brand positioning. Achieved 4.85L+ views and 1.54L+ users in no time. Reached 82% organic reach without spending any money on ads. Created 166 designs and 22 high-performing reels.",
    },
    {
      title: "Assistant Manager",
      period: "01 Sep, 2025 - 31 Dec, 2025",
      org: "H&B EduVerse",
      location: "Dhaka",
      areasOfExpertise: [
        "Content Creation (3 months)",
        "Digital Marketing (3 months)",
        "Social Media Management (3 months)",
      ],
      duties:
        "Directed digital marketing efforts, which included content creation, scripting, editing, and publication, in the area of educational consulting. Developed a modern, student-friendly brand and handled communications. Implemented short-form videos and infographics to increase student engagement, thus enhancing visibility.",
    },
    {
      title: "Social Media Manager",
      period: "01 Mar, 2025 - 30 Jun, 2025",
      org: "Originate Marketing",
      location: "Dhaka",
      areasOfExpertise: [
        "Content Marketing (3 months)",
        "Digital Content Editing Tools (3 months)",
        "Social Media Management (3 months)",
      ],
      duties:
        "Managed comprehensive digital marketing strategies for 5 different international brands within the US and UK markets. This included weekly content calendars, short-form video creation, and community engagement. Utilize cutting-edge data analytics to enhance the effectiveness of the content to increase ROI.",
    },
  ],
  education: [
    {
      exam: "Bachelor of Science (BSc)",
      concentration: "Information Technology",
      institute: "Jahangirnagar University",
      result: "Pass",
      year: "2022",
      duration: "4",
      achievement:
        "Strong IT foundation in data & networking, paired with active campus leadership.",
    },
    {
      exam: "HSC",
      concentration: "Science",
      institute: "Govt. Shaheed Bulbul College, Pabna",
      result: "Pass",
      year: "2016",
      duration: "2",
      achievement:
        "Achieved GPA 5.00 with 1176/1300 (Highest Marks in College History)",
    },
    {
      exam: "SSC",
      concentration: "Science",
      institute: "Pabna Zilla School",
      result: "Pass",
      year: "2014",
      duration: "2",
      achievement:
        "Achieved GPA 5.00. BTV Debater & youth leader; established and organized debate clubs.",
    },
  ],
  training: [
    {
      title: "Basics of Management",
      topic:
        "Business Strategy, Workflow Optimization, Effective Planning, Problem Solving & Decision Making.",
      institute: "10 Minute School",
      country: "Bangladesh",
      location: "Bangladesh (Online)",
      year: "2025",
      duration: "7 Days",
    },
    {
      title: "Mobile Photography and Videography",
      topic:
        "Visual Storytelling, Short-form Video (Reels) Production, Editing, Lighting & Composition.",
      institute: "10 Minute School",
      country: "Bangladesh",
      location: "Bangladesh (Online)",
      year: "2024",
      duration: "7 Days",
    },
    {
      title: "Graphic Design Foundation",
      topic:
        "Visual Communication, Brand Identity, Layout & Typography, Social Media Creatives.",
      institute: "10 Minute School",
      country: "Bangladesh",
      location: "Bangladesh (Online)",
      year: "2024",
      duration: "1 Month",
    },
    {
      title: "Affiliate Marketing & Digital Strategy",
      topic:
        "Performance Marketing, Digital Growth Strategy, ROI Optimization, Market Analysis.",
      institute: "10 Minute School",
      country: "Bangladesh",
      location: "Bangladesh (Online)",
      year: "2024",
      duration: "7 Days",
    },
    {
      title: "2nd NDF BD Debate & Leadership Workshop",
      topic:
        "Speaking, Persuasive Communication, Critical Thinking, Team Leadership.",
      institute: "National Debate Federation Bangladesh (NDF BD)",
      country: "Bangladesh",
      location: "Bangladesh (Kushtia Gov. College)",
      year: "2019",
      duration: "7 Days",
    },
    {
      title: "Business Genius Bangladesh",
      topic: "Business Strategy, Entrepreneurship, Leadership.",
      institute: "Notre Dame Business Club",
      country: "Bangladesh",
      location: "Notre Dame College, Dhaka",
      year: "2014",
      duration: "1 Month",
    },
  ],
  certifications: [
    {
      name: "Basics of Management",
      institute: "10 Minute School",
      location: "Bangladesh (Online)",
      from: "27 Dec, 2024",
      to: "03 Jan, 2025",
    },
    {
      name: "Graphic Design Foundation",
      institute: "10 Minute School",
      location: "Bangladesh (Online)",
      from: "01 Nov, 2024",
      to: "23 Nov, 2024",
    },
    {
      name: "Affiliate Marketing",
      institute: "10 Minute School",
      location: "Bangladesh (Online)",
      from: "15 May, 2024",
      to: "15 Jun, 2024",
    },
  ],
  careerInfo: [
    {
      label: "Preferred Job Category",
      value:
        "Marketing/Sales, Media/Advertisement/Event Mgt., Hospitality/Travel/Tourism, Data Entry/Computer Operator, Graphic Designer, Other Special Skilled Jobs",
    },
    { label: "Looking For", value: "Mid Level Job" },
    { label: "Present Salary", value: "Tk. 30000" },
    { label: "Expected Salary", value: "Tk. 35000" },
    { label: "Preferred District", value: "Cox's Bazar, Dhaka, Pabna, Rangamati" },
    {
      label: "Preferred Country",
      value:
        "Australia, Canada, Malaysia, Singapore, United Arab Emirates, United States",
    },
    {
      label: "Preferred Organization Types",
      value:
        "Advertising Agency, Software Company, IT Enabled Service, Multinational Companies, Consulting Firms, Hotel, Bar/Pub, Club, E-commerce, Educational Technology (Edtech) Startup",
    },
  ],
  skills: [
    "Social Media Management",
    "Digital Marketing (Social Media Marketing)",
    "Content Creation",
    "Graphic Design",
    "Branding",
    "Performance Management System",
    "Public Speaking",
    "Artificial intelligence (AI)",
    "ChatGPT",
    "Community management",
  ],
  skillDescription:
    "AI-driven digital growth specialist and brand architect. Highly skilled in leveraging AI tools, performance marketing, and creative storytelling to build scalable content ecosystems. Proven ability to drive massive organic reach, build engaged communities, and deliver measurable ROI for both local and global brands.",
  accomplishments: {
    portfolio: [
      {
        title: "Digital Campaign & Brand Growth — Pabna Nagarik Committee",
        url: "https://www.facebook.com/pncpabna",
        description:
          "Architected and executed an end-to-end digital campaign strategy. Successfully achieved 4.85 Lakh+ total views, 1.54 Lakh+ unique viewers, and a massive 82% organic reach. Handled the entire content creation pipeline, achieving 166 static designs and 22 high retention reels.",
      },
      {
        title: "Lifestyle & Emotional Branding — My Little Outlier",
        url: "https://www.facebook.com/MyLittleOutlier",
        description:
          "Developed emotionally resonant visual communication and narrative-driven content for a global community. Created strategic storytelling that deeply connected with the target audience, boosting emotional engagement.",
      },
    ],
    awards: [
      {
        title: "Special Scholarship for Outstanding Debate",
        description:
          "Awarded a special scholarship by BSB Foundation and Cambrian School & College for exceptional performance and success in the regional debate festival.",
      },
      {
        title: "1st Place — Extempore Speech & Debate",
        description:
          "Secured 1st place in the regional seasonal competition organized by Bangladesh Shishu Academy, showcasing outstanding public speaking and analytical skills.",
      },
    ],
    projects: [
      {
        title: "Emon IT — Tech & Digital Solutions",
        url: "https://www.facebook.com/emonit.tech",
        description:
          "Designed cloud architecture supporting digital transformation. Built a complete digital identity and AI-driven content workflow, resulting in consistent and personalized content output and enhanced brand credibility.",
      },
      {
        title: "TrendFlux Digital — AI-Driven Brand Growth",
        url: "https://www.facebook.com/trendflux.digital/",
        description:
          "Founded a boutique digital agency specializing in AI-driven marketing systems. Architected multi-brand identity systems and implemented AI-driven growth strategies, delivering 45%+ growth in engagement for multiple brands through content optimization.",
      },
      {
        title: "Debate Emon — Youth Engagement Platform",
        url: "https://www.facebook.com/DebateEmonOfficial",
        description:
          "Built an interactive educational short-form video platform engaging 50,000+ youth in debates. Utilized polls and short-form content to drive 65%+ growth in platform interactions among Gen Z audiences.",
      },
    ],
    others: [
      {
        title: "President — Pabna Zilla Chhatra Kallyan Samiti",
        url: "https://www.facebook.com/share/p/1CwtXCbKUA/",
        description:
          "Served as the President at Jahangirnagar University. Led the committee in representing the student community, organizing welfare initiatives, and coordinating large-scale developmental and cultural activities.",
      },
      {
        title: "Advisor & Life Member — Pabna Debate Society",
        url: "https://www.facebook.com/share/p/14Yj9Se4Yeu/",
        description:
          "Recognized as a Life Member and Advisor of the Pabna Debate Society (PDS). Actively contributing to youth leadership development, mentoring emerging debaters, and shaping intellectual discourse and communication skills within the community.",
      },
      {
        title: "Activism, Integrity & Social Courage",
        url: "https://www.kalbela.com/ajkerpatrika/khobor/26832",
        description:
          "Publicly stood against campus torture cells and extortion at Jahangirnagar University. Demonstrated strong ethical principles by holding a press conference and reporting to authorities, ensuring accountability despite facing severe abuse.",
      },
    ],
  },
  extraCurricular: [
    {
      label: "Leadership",
      value:
        "President of Pabna Zilla Chhatra Kallyan Samiti, JU (2021) & Advisor at Pabna Debate Society, organising youth summits.",
    },
    {
      label: "Volunteering",
      value:
        "COVID-19 Frontline Volunteer, leading public health campaigns and PPE distribution.",
    },
    {
      label: "Activism",
      value:
        "Publicly stood against campus violence and advocated for student rights, demonstrating strong ethical principles and social courage.",
    },
  ],
  languages: [
    { name: "Bangla", reading: "High", writing: "High", speaking: "High" },
    { name: "English", reading: "Medium", writing: "Medium", speaking: "Medium" },
  ],
  personalDetails: [
    { label: "Father's Name", value: "Md. Mujahedul Islam" },
    { label: "Mother's Name", value: "Sharmin Akter Lucky" },
    { label: "Date of Birth", value: "24 Dec, 1999" },
    { label: "Gender", value: "Male" },
    { label: "Marital Status", value: "Unmarried" },
    { label: "Nationality", value: "Bangladeshi" },
    { label: "National Id No.", value: "4656819267" },
    { label: "Religion", value: "Islam" },
    { label: "Passport No", value: "A18512306" },
    { label: "Passport Issue Date", value: "25 Apr, 2025" },
    {
      label: "Permanent Address",
      value:
        "Chalkdublia, Pabna Sadar, Pabna-6600, Pabna Sadar, Pabna Sadar, Pabna 6600",
    },
    { label: "Current Location", value: "Dhaka - 1214, Shahbag, Dhaka" },
    { label: "Blood Group", value: "AB+" },
    { label: "Height (Meter)", value: "1.65" },
    { label: "Weight (Kg)", value: "68" },
  ],
  references: [
    {
      name: "Dr. M. Mesbahuddin Sarker",
      organization: "IIT, Jahangirnagar University",
      designation: "Professor",
      address:
        "Institute of Information Technology Jahangirnagar University, Savar, Dhaka-1342, Bangladesh.",
      phoneOffice: "880-1716091920",
      email: "sarker@juniv.edu",
      relation: "Academic",
    },
    {
      name: "Jannatul Ferdaus Esha",
      organization: "Motijheel Govt Girls' High School, Motijheel, Dhaka",
      designation: "Assistant Teacher",
      address: "Motijheel, Dhaka, Bangladesh",
      phoneOffice: "01515202801",
      mobile: "01515202801",
      email: "eshafineartju42@gmail.com",
      relation: "Relative",
    },
  ],
};
