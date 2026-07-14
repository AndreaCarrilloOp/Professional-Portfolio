import {
  FaCode,
  FaDatabase,
  FaCloud,
  FaTools,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaAward,
  FaHome,
  FaUser,
  FaLayerGroup,
  FaBriefcase,
  FaCertificate,
  FaBug,
} from "react-icons/fa";
import {
  SiReact,
  SiTailwindcss,
  SiJavascript,
  SiLaravel,
  SiPhp,
  SiPython,
  SiMysql,
  SiGit,
} from "react-icons/si";
import { TbBrandCpp } from "react-icons/tb";
import responsiveImages from "./assets/responsive-images.json";

const BASE_URL_PREFIX = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const withBaseUrl = (url) => {
  if (/^https?:\/\//i.test(url)) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL_PREFIX}${normalized}`;
};

const toSrcSet = (variants) =>
  variants
    .map((variant) => `${withBaseUrl(variant.url)} ${variant.width}w`)
    .join(", ");

const buildResponsiveImage = (key, sizes) => {
  const image = responsiveImages[key];
  const fallback = image.webp[image.webp.length - 1];

  return {
    kind: "responsive",
    fallback: withBaseUrl(fallback.url),
    width: fallback.width,
    height: fallback.height,
    sizes,
    avifSrcSet: image.avif?.length ? toSrcSet(image.avif) : null,
    webpSrcSet: toSrcSet(image.webp),
  };
};

const PROFILE_IMAGE_SIZES = "(max-width: 480px) 90vw, (max-width: 900px) 420px, (max-width: 1280px) 500px, 560px";

const profileImageLight = buildResponsiveImage("profileLight", PROFILE_IMAGE_SIZES);
const profileImageDark = buildResponsiveImage("profileDark", PROFILE_IMAGE_SIZES);

export const PROFILE_IMAGE_LIGHT = {
  ...profileImageLight,
  errorFallback: withBaseUrl("/images/responsive/profile-light-720.webp"),
};

export const PROFILE_IMAGE_DARK = {
  ...profileImageDark,
  errorFallback: withBaseUrl("/images/responsive/profile-dark-720.webp"),
};

export const GITHUB_URL = "https://github.com/AndreaCarrilloOp";
export const LINKEDIN_URL = "https://www.linkedin.com/in/andrea-carrillo-vlk/";
export const EMAIL = "valkstack@gmail.com";
export const EMAIL_URL = `mailto:${EMAIL}`;
export const COPYRIGHT_NAME = "Andrea Carrillo";

export const NAV_ITEMS = [
  { id: "home", labelKey: "nav.home", href: "#home", icon: FaHome },
  { id: "about", labelKey: "nav.about", href: "#about", icon: FaUser },
  { id: "skills", labelKey: "nav.skills", href: "#skills", icon: FaLayerGroup },
  {
    id: "projects",
    labelKey: "nav.projects",
    href: "#projects",
    icon: FaBriefcase,
  },
  {
    id: "certifications",
    labelKey: "nav.certifications",
    href: "#certifications",
    icon: FaCertificate,
  },
  {
    id: "contact",
    labelKey: "nav.contact",
    href: "#contact",
    icon: FaEnvelope,
  },
];

export const SOCIAL_LINKS = [
  { id: "github", label: "GitHub", href: GITHUB_URL, icon: FaGithub },
  { id: "linkedin", label: "LinkedIn", href: LINKEDIN_URL, icon: FaLinkedin },
  { id: "email", label: "Email", href: EMAIL_URL, icon: FaEnvelope },
];

export const TECH_STACK = [
  { id: "react", label: "React", icon: SiReact },
  { id: "tailwind", label: "Tailwind CSS", icon: SiTailwindcss },
  { id: "javascript", label: "JavaScript", icon: SiJavascript },
  { id: "laravel", label: "Laravel", icon: SiLaravel },
  { id: "php", label: "PHP", icon: SiPhp },
  { id: "python", label: "Python", icon: SiPython },
  { id: "cpp", label: "C++", icon: TbBrandCpp },
  { id: "mysql", label: "MySQL", icon: SiMysql },
  { id: "git", label: "Git", icon: SiGit },
  { id: "azure", label: "Azure", icon: FaCloud },
];

export const SKILLS = [
  {
    id: "frontend",
    icon: FaCode,
    titleKey: "skills.frontend.title",
    items: ["React", "Tailwind", "JavaScript", "HTML", "CSS"],
  },
  {
    id: "backend",
    icon: FaCode,
    titleKey: "skills.backend.title",
    items: ["Laravel", "PHP", "Python", "Java", "C#", "C++"],
  },
  {
    id: "databases",
    icon: FaDatabase,
    titleKey: "skills.databases.title",
    items: ["MySQL", "SQL Server", "PostgreSQL"],
  },
  {
    id: "testing",
    icon: FaBug,
    titleKey: "skills.testing.title",
    items: ["API testing", "Postman", "Test cases", "Functional QA"],
  },
  {
    id: "cloud",
    icon: FaCloud,
    titleKey: "skills.cloud.title",
    items: ["Microsoft Azure", "AZ-900", "GitHub Foundations"],
  },
  {
    id: "tools",
    icon: FaTools,
    titleKey: "skills.tools.title",
    items: ["Git", "GitHub", "VS Code", "GitHub Pages"],
  },
];

export const PROJECTS = [
  {
    id: "petshop",
    titleKey: "projects.petshop.title",
    descriptionKey: "projects.petshop.description",
    problemKey: "projects.petshop.problem",
    contributionKey: "projects.petshop.contribution",
    outcomeKey: "projects.petshop.outcome",
    image: buildResponsiveImage("petshop", "(max-width: 1024px) 100vw, 56vw"),
    repo: "https://github.com/AndreaCarrilloOp/PetShop",
    demo: "https://andreacarrilloop.github.io/PetShop/",
    year: "2025",
    roleKey: "projects.roles.frontend",
    techs: ["Bootstrap", "HTML", "CSS", "JavaScript"],
    featured: true,
    statusKey: "projects.status.published",
  },
  {
    id: "tallest-buildings",
    titleKey: "projects.tallestBuildings.title",
    descriptionKey: "projects.tallestBuildings.description",
    problemKey: "projects.tallestBuildings.problem",
    contributionKey: "projects.tallestBuildings.contribution",
    outcomeKey: "projects.tallestBuildings.outcome",
    image: buildResponsiveImage(
      "tallestBuildings",
      "(max-width: 1024px) 100vw, 44vw",
    ),
    repo: "https://github.com/AndreaCarrilloOp/tallest-buildings",
    demo: "https://tallestbuildings.netlify.app/",
    year: "2025",
    roleKey: "projects.roles.frontend",
    techs: ["Nuxt.js 3", "Vue.js 3", "JSON", "Netlify"],
    statusKey: "projects.status.published",
  },
  {
    id: "scrabble",
    titleKey: "projects.scrabble.title",
    descriptionKey: "projects.scrabble.description",
    problemKey: "projects.scrabble.problem",
    contributionKey: "projects.scrabble.contribution",
    outcomeKey: "projects.scrabble.outcome",
    image: buildResponsiveImage("scrabble", "(max-width: 1024px) 100vw, 44vw"),
    repo: "https://github.com/AndreaCarrilloOp/SCRABBLE",
    demo: null,
    year: "2024",
    roleKey: "projects.roles.backend",
    techs: ["C++", "POO", "Algoritmos", "Consola"],
    statusKey: "projects.status.completed",
  },
];

export const CERTIFICATIONS = [
  {
    id: "az900",
    icon: FaAward,
    title: "Microsoft Azure Fundamentals",
    code: "AZ-900",
    statusKey: "certifications.approved",
    credentialUrl:
      "https://learn.microsoft.com/api/credentials/share/es-es/ANDREACARRILLOOPORTO-6553/79C80AEA4FDDB812?sharingId=4B17552443EC43C4",
  },
  {
    id: "gh900",
    icon: FaAward,
    title: "GitHub Foundations",
    code: "GH-900",
    statusKey: "certifications.approved",
    credentialUrl:
      "https://learn.microsoft.com/api/credentials/share/es-es/ANDREACARRILLOOPORTO-6553/730444074E386CBE?sharingId=4B17552443EC43C4",
  },
];
