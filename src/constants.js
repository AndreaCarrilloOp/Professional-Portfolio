import {
  FaCode,
  FaDatabase,
  FaCloud,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaUser,
  FaLayerGroup,
  FaBriefcase,
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
  const fallbackVariants = image.webp?.length ? image.webp : image.png;
  const fallback = fallbackVariants[fallbackVariants.length - 1];

  return {
    kind: "responsive",
    fallback: withBaseUrl(fallback.url),
    width: fallback.width,
    height: fallback.height,
    sizes,
    avifSrcSet: image.avif?.length ? toSrcSet(image.avif) : null,
    webpSrcSet: image.webp?.length ? toSrcSet(image.webp) : null,
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
export const EMAIL = "acarrillo.vlk@gmail.com";
export const EMAIL_URL = `mailto:${EMAIL}`;
export const COPYRIGHT_NAME = "Andrea Carrillo";

export const NAV_ITEMS = [
  { id: "projects", labelKey: "nav.projects", href: "#projects", icon: FaBriefcase },
  { id: "skills", labelKey: "nav.skills", href: "#skills", icon: FaLayerGroup },
  { id: "about", labelKey: "nav.about", href: "#about", icon: FaUser },
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
    descriptionKey: "skills.frontend.description",
    items: ["React", "Vue", "HTML", "CSS", "Vite", "Figma"],
  },
  {
    id: "backend",
    icon: FaCode,
    titleKey: "skills.backend.title",
    descriptionKey: "skills.backend.description",
    items: ["Python", "FastAPI", "C++", "SQLAlchemy", "API testing", "CTest"],
  },
  {
    id: "databases",
    icon: FaDatabase,
    titleKey: "skills.databases.title",
    descriptionKey: "skills.databases.description",
    items: ["PostgreSQL", "MySQL", "MongoDB", "SQL Server"],
  },
  {
    id: "cloud",
    icon: FaCloud,
    titleKey: "skills.cloud.title",
    descriptionKey: "skills.cloud.description",
    items: ["Docker", "Azure", "GitHub Actions", "Netlify", "pytest", "Postman", "Git", "GitHub"],
    groups: [
      { labelKey: "skills.cloud.delivery", items: ["Docker", "Azure", "Netlify", "GitHub Actions"] },
      { labelKey: "skills.cloud.testing", items: ["pytest", "Postman"] },
      { labelKey: "skills.cloud.versionControl", items: ["Git", "GitHub"] },
    ],
  },
];

export const PROJECTS = [
  {
    id: "scrabble",
    titleKey: "projects.scrabble.title",
    descriptionKey: "projects.scrabble.description",
    problemKey: "projects.scrabble.problem",
    contributionKey: "projects.scrabble.contribution",
    outcomeKey: "projects.scrabble.outcome",
    image: buildResponsiveImage("scrabble", "(max-width: 1024px) 100vw, 65vw"),
    imageAltKey: "projects.scrabble.imageAlt",
    repo: "https://github.com/AndreaCarrilloOp/SCRABBLE",
    demo: "https://andreacarrilloop.github.io/SCRABBLE/",
    year: "2024–2026",
    roleKey: "projects.roles.wasm",
    techs: ["C++17", "WebAssembly", "Emscripten", "JavaScript"],
    featured: true,
    statusKey: "projects.status.published",
  },
  {
    id: "petshop",
    titleKey: "projects.petshop.title",
    descriptionKey: "projects.petshop.description",
    problemKey: "projects.petshop.problem",
    contributionKey: "projects.petshop.contribution",
    outcomeKey: "projects.petshop.outcome",
    image: buildResponsiveImage("petshop", "(max-width: 1024px) 100vw, 44vw"),
    repo: "https://github.com/AndreaCarrilloOp/PetShop",
    demo: "https://andreacarrilloop.github.io/PetShop/",
    year: "2025",
    roleKey: "projects.roles.frontend",
    techs: ["Bootstrap", "HTML", "CSS", "JavaScript"],
    statusKey: "projects.status.published",
  },
  {
    id: "distributed-library",
    titleKey: "projects.distributedLibrary.title",
    descriptionKey: "projects.distributedLibrary.description",
    problemKey: "projects.distributedLibrary.problem",
    contributionKey: "projects.distributedLibrary.contribution",
    outcomeKey: "projects.distributedLibrary.outcome",
    image: buildResponsiveImage(
      "distributedLibrary",
      "(max-width: 1024px) 100vw, 44vw",
    ),
    imageAltKey: "projects.distributedLibrary.imageAlt",
    repo: "https://github.com/AndreaCarrilloOp/library-microfrontends-microservices",
    demo: "https://iframe-shell.vercel.app/",
    year: "2026",
    roleKey: "projects.roles.distributed",
    techs: ["Vue 3", "Microservices", "PostgreSQL", "Cloudflare D1"],
    statusKey: "projects.status.published",
  },];

export const CERTIFICATIONS = [
  {
    id: "az900",
    title: "Microsoft Azure Fundamentals",
    code: "AZ-900",
    badgeImage: "https://images.credly.com/images/be8fcaeb-c769-4858-b567-ffaaa73ce8cf/image.png",
    credentialUrl:
      "https://learn.microsoft.com/api/credentials/share/es-es/ANDREACARRILLOOPORTO-6553/79C80AEA4FDDB812?sharingId=4B17552443EC43C4",
  },
  {
    id: "gh900",
    title: "GitHub Foundations",
    code: "GH-900",
    badgeImage: "https://images.credly.com/images/024d0122-724d-4c5a-bd83-cfe3c4b7a073/image.png",
    credentialUrl:
      "https://learn.microsoft.com/api/credentials/share/es-es/ANDREACARRILLOOPORTO-6553/730444074E386CBE?sharingId=4B17552443EC43C4",
  },
  {
    id: "sc900",
    title: "Microsoft Security, Compliance, and Identity Fundamentals",
    code: "SC-900",
    badgeImage: "https://images.credly.com/images/fc1352af-87fa-4947-ba54-398a0e63322e/security-compliance-and-identity-fundamentals-600x600.png",
    credentialUrl:
      "https://learn.microsoft.com/es-es/users/andreacarrillooporto-6553/credentials/2dc1174f7d2f1f1b?ref=https%3A%2F%2Fgithub.com%2F",
  },
];
