// ===== i18n =====
const translations = {
  fr: {
    'meta.title': "Studio Initiative — Cabinet de conseil data & IA, consultants augmentés",
    'meta.description': "Studio Initiative — cabinet de conseil en data et intelligence artificielle. Des consultants seniors augmentés par des agents IA, pour cadrer, livrer et industrialiser vos produits data. Spécialisation Palantir Foundry. Toulouse, France et Europe.",
    'nav.model': "Le modèle",
    'nav.product': "Le produit",
    'nav.interventions': "Interventions",
    'nav.cabinet': "Le cabinet",
    'nav.contact': "Contact",
    'nav.toggleAria': "Ouvrir le menu",
    'hero.badge': "Cabinet de conseil · Toulouse · France & Europe",
    'hero.h1': 'Le conseil data et IA,<br>porté par des consultants <em>augmentés</em>.',
    'hero.lead': `Studio Initiative est un cabinet de conseil en data et intelligence artificielle. Nos consultants seniors
        s'appuient sur des agents IA qui absorbent les tâches répétitives du delivery.
        <strong>Le volume aux agents, les décisions au consultant.</strong>`,
    'hero.cta1': "Prendre contact",
    'hero.cta2': "Comprendre le modèle",
    'modele.kicker': "Le modèle",
    'modele.h2': 'Des consultants seniors,<br>augmentés par des agents IA',
    'modele.intro': `Chaque mission est portée par un consultant senior, épaulé par quatre familles d'agents couvrant les
          piliers du delivery. Un dispositif développé par le cabinet et rodé mission après mission.`,
    'diagram.center.label': 'Consultant<br>senior',
    'diagram.center.sub': "conception · décision · relation",
    'agent.pipelines': '<em>Agent</em>Pipelines<small>génère · teste · déploie</small>',
    'agent.quality': '<em>Agent</em>Qualité data<small>contrôle · alerte · corrige</small>',
    'agent.documentation': '<em>Agent</em>Documentation<small>rédige · met à jour</small>',
    'agent.governance': '<em>Agent</em>Gouvernance<small>cartographie · trace</small>',
    'principle1.title': "L'humain garde la main",
    'principle1.desc': "Le consultant conçoit l'architecture, arbitre les choix techniques et porte la relation client. Les agents proposent, le consultant décide — rien n'est livré sans sa validation.",
    'principle2.title': "Vos données, vos règles",
    'principle2.desc': "Le socle d'agents est opéré par le cabinet, sur son infrastructure. Quand vos contraintes l'exigent — confidentialité, conformité, données sensibles — il se déploie dans votre environnement, sous vos règles de sécurité.",
    'principle3.title': "Le workflow est repensé",
    'principle3.desc': "L'IA ne se superpose pas à l'existant : on refond le processus de delivery lui-même. C'est là que se crée l'écart de productivité — pas dans l'outil pris isolément.",
    'produit.kicker': "Le produit",
    'produit.tag': "L'incarnation logicielle du modèle",
    'produit.h2': 'DataFlow Canvas —<br>voir le pipeline avant de le construire',
    'produit.intro': "Les quatre familles d'agents du cabinet ne sont pas une abstraction. DataFlow Canvas en est la vitrine publique : un atelier visuel où l'on dessine un pipeline en glisser-déposer, où chaque étape est prévisualisée et auditée en continu, puis exportée en livrables prêts pour la production.",
    'produit.feat1.title': "Canvas visuel",
    'produit.feat1.desc': "Sources, transformations et destinations en glisser-déposer. Un architecte IA transforme un besoin décrit en mots en pipeline prêt à affiner.",
    'produit.feat2.title': "Audit de conformité continu",
    'produit.feat2.desc': "Un score A–E affiché en permanence : complétude, cohérence, qualité, maintenabilité, sécurité et PII. La gouvernance intégrée au geste de conception.",
    'produit.feat3.title': "Livrables production",
    'produit.feat3.desc': "Transform PySpark/Foundry, projet dbt, specs data product (ODPS/DPDS) et classeur de mission — le code exécutable comme documentation.",
    'produit.cta': "Essayer l'outil",
    'produit.free': "Gratuit · sans installation",
    'produit.canvas.score': "Conformité",
    'produit.canvas.source': "Source",
    'produit.canvas.transform': "Transformations",
    'produit.canvas.audit': "Audit conformité",
    'produit.canvas.deliver': "Livrables",
    'interventions.kicker': "Interventions",
    'interventions.h2': "Ce que le cabinet livre",
    'service1.title': "Produits data",
    'service1.desc': "Cadrage, conception et industrialisation de data products. De la définition du besoin à la mise en production, sur Palantir Foundry notamment.",
    'service2.title': "Automatisation par l'IA",
    'service2.desc': "Refonte de workflows métiers avec des agents IA. Priorisation des cas d'usage, passage du pilote à la production, contrôle humain à chaque étape.",
    'service3.title': "Gouvernance des données",
    'service3.desc': "Qualité, traçabilité et conformité des données (AI Act, RGPD). Le socle sans lequel les projets IA plafonnent au stade du pilote.",
    'foundry.kicker': "Spécialisation",
    'foundry.intro': `Foundry est devenu la colonne vertébrale data des grands groupes industriels — et les profils seniors
          qui la maîtrisent restent rares. Studio Initiative en a fait sa spécialité, avec une pratique construite
          sur l'un des plus vastes déploiements de la plateforme en Europe, dans l'aéronautique.`,
    'foundry1.title': "Modéliser le métier",
    'foundry1.desc': "Objets, liens, actions : le socle sémantique qui rend les données exploitables par les équipes métier — et par les agents IA.",
    'foundry2.title': "Industrialiser les flux",
    'foundry2.desc': "Des données brutes aux datasets prêts à l'usage : des pipelines maintenables, documentés et surveillés en production.",
    'foundry3.title': "Déployer l'IA sur vos données",
    'foundry3.desc': "Brancher modèles et agents directement sur l'ontologie de l'entreprise — du cas d'usage pilote au passage à l'échelle.",
    'foundry.note': `Et au-delà de Foundry : les méthodes — data product management, gouvernance, industrialisation —
        se transposent à votre plateforme, quelle qu'elle soit. Databricks, Snowflake ou stack interne.`,
    'cabinet.kicker': "Le cabinet",
    'cabinet.h2': "Un collectif qui monte en charge",
    'cabinet.text': `Studio Initiative réunit des consultants data indépendants, seniors, partageant le même socle d'agents et
          la même exigence de delivery. La capacité s'ajuste à votre besoin — d'un expert à une équipe — avec un seul
          interlocuteur.`,
    'method.capacity.label': "Capacité",
    'method.capacity.value': "D'un expert à une équipe",
    'method.format.label': "Format",
    'method.format.value': "Régie ou forfait",
    'method.interlocutor.label': "Interlocuteur",
    'method.interlocutor.value': "Unique",
    'method.zone.label': "Zone",
    'method.zone.value': "France et Europe, à distance ou sur site",
    'contact.kicker': "Contact",
    'contact.h2': "Parlons de votre projet",
    'contact.lead': "Pour un cadrage, une mission ou la constitution d'une équipe.",
    'form.name.label': "Nom",
    'form.name.placeholder': "Votre nom",
    'form.company.label': "Entreprise",
    'form.company.placeholder': "Votre entreprise",
    'form.email.label': "Email",
    'form.email.placeholder': "vous@entreprise.com",
    'form.message.label': "Votre projet",
    'form.message.placeholder': "En quelques mots",
    'form.submit': "Envoyer",
    'contact.card1.title': "Coordonnées",
    'contact.card2.title': "Le cabinet",
    'contact.card2.text': "Studio Initiative — fondé par Michael Lozano, quinze ans dans la data industrielle.",
    'footer.note': "Studio Initiative — Cabinet de conseil data & IA, Toulouse.",
    'mail.subject': "Contact Studio Initiative",
    'mail.name': "Nom",
    'mail.company': "Entreprise",
    'mail.email': "Email",
  },
  en: {
    'meta.title': "Studio Initiative — Data & AI consulting firm, augmented consultants",
    'meta.description': "Studio Initiative — a data and artificial intelligence consulting firm. Senior consultants augmented by AI agents, to scope, deliver and industrialize your data products. Palantir Foundry specialists. Toulouse, France & Europe.",
    'nav.model': "The model",
    'nav.product': "The product",
    'nav.interventions': "Services",
    'nav.cabinet': "The firm",
    'nav.contact': "Contact",
    'nav.toggleAria': "Open menu",
    'hero.badge': "Consulting firm · Toulouse · France & Europe",
    'hero.h1': 'Data and AI consulting,<br>led by <em>augmented</em> consultants.',
    'hero.lead': `Studio Initiative is a data and artificial intelligence consulting firm. Our senior consultants
        work alongside AI agents that absorb the repetitive work of delivery.
        <strong>Volume to the agents, decisions to the consultant.</strong>`,
    'hero.cta1': "Get in touch",
    'hero.cta2': "See how it works",
    'modele.kicker': "The model",
    'modele.h2': 'Senior consultants,<br>augmented by AI agents',
    'modele.intro': `Every engagement is led by a senior consultant, backed by four families of agents covering the
          pillars of delivery. A system built in-house and refined mission after mission.`,
    'diagram.center.label': 'Senior<br>consultant',
    'diagram.center.sub': "design · decisions · relationship",
    'agent.pipelines': '<em>Agent</em>Pipelines<small>generates · tests · deploys</small>',
    'agent.quality': '<em>Agent</em>Data quality<small>checks · flags · fixes</small>',
    'agent.documentation': '<em>Agent</em>Documentation<small>writes · updates</small>',
    'agent.governance': '<em>Agent</em>Governance<small>maps · tracks</small>',
    'principle1.title': "The human stays in control",
    'principle1.desc': "The consultant designs the architecture, arbitrates technical choices and owns the client relationship. Agents propose, the consultant decides — nothing ships without their sign-off.",
    'principle2.title': "Your data, your rules",
    'principle2.desc': "The agent stack is operated by the firm, on its own infrastructure. When your constraints require it — confidentiality, compliance, sensitive data — it deploys into your environment, under your security rules.",
    'principle3.title': "The workflow gets redesigned",
    'principle3.desc': "AI isn't bolted onto the existing process — the delivery process itself is redesigned. That's where the productivity gap is created, not in the tool taken in isolation.",
    'produit.kicker': "The product",
    'produit.tag': "The model, made software",
    'produit.h2': 'DataFlow Canvas —<br>see the pipeline before you build it',
    'produit.intro': "The firm's four families of agents aren't an abstraction. DataFlow Canvas is their public showcase: a visual workshop where you design a pipeline by drag-and-drop, preview and continuously audit every step, then export it as production-ready deliverables.",
    'produit.feat1.title': "Visual canvas",
    'produit.feat1.desc': "Sources, transformations and destinations by drag-and-drop. An AI architect turns a need described in words into a pipeline ready to refine.",
    'produit.feat2.title': "Continuous compliance audit",
    'produit.feat2.desc': "An A–E score shown at all times: completeness, consistency, quality, maintainability, security and PII. Governance built into the act of design.",
    'produit.feat3.title': "Production deliverables",
    'produit.feat3.desc': "PySpark/Foundry transforms, dbt project, data product specs (ODPS/DPDS) and mission workbook — executable code as documentation.",
    'produit.cta': "Try the tool",
    'produit.free': "Free · no install",
    'produit.canvas.score': "Compliance",
    'produit.canvas.source': "Source",
    'produit.canvas.transform': "Transforms",
    'produit.canvas.audit': "Compliance audit",
    'produit.canvas.deliver': "Deliverables",
    'interventions.kicker': "Services",
    'interventions.h2': "What the firm delivers",
    'service1.title': "Data products",
    'service1.desc': "Scoping, design and industrialization of data products. From defining the need to production, on Palantir Foundry in particular.",
    'service2.title': "AI automation",
    'service2.desc': "Redesigning business workflows with AI agents. Use-case prioritization, moving from pilot to production, human control at every step.",
    'service3.title': "Data governance",
    'service3.desc': "Data quality, traceability and compliance (AI Act, GDPR). The foundation without which AI projects plateau at the pilot stage.",
    'foundry.kicker': "Specialization",
    'foundry.intro': `Foundry has become the data backbone of large industrial groups — and senior profiles who
          master it remain scarce. Studio Initiative has made it a specialty, with a practice built on one of the
          largest deployments of the platform in Europe, in aerospace.`,
    'foundry1.title': "Modeling the business",
    'foundry1.desc': "Objects, links, actions: the semantic layer that makes data usable by business teams — and by AI agents.",
    'foundry2.title': "Industrializing data flows",
    'foundry2.desc': "From raw data to production-ready datasets: pipelines that are maintainable, documented and monitored in production.",
    'foundry3.title': "Deploying AI on your data",
    'foundry3.desc': "Connecting models and agents directly to the enterprise ontology — from pilot use case to full scale.",
    'foundry.note': `Beyond Foundry: the methods — data product management, governance, industrialization —
        transfer to your platform, whatever it is. Databricks, Snowflake, or an in-house stack.`,
    'cabinet.kicker': "The firm",
    'cabinet.h2': "A collective that scales with you",
    'cabinet.text': `Studio Initiative brings together senior independent data consultants, sharing the same agent
          stack and the same delivery standard. Capacity adjusts to your need — from one expert to a full team —
          with a single point of contact.`,
    'method.capacity.label': "Capacity",
    'method.capacity.value': "From one expert to a full team",
    'method.format.label': "Engagement",
    'method.format.value': "Time & materials or fixed price",
    'method.interlocutor.label': "Point of contact",
    'method.interlocutor.value': "Single",
    'method.zone.label': "Coverage",
    'method.zone.value': "France and Europe, remote or on-site",
    'contact.kicker': "Contact",
    'contact.h2': "Let's talk about your project",
    'contact.lead': "For a scoping session, an engagement, or building out a team.",
    'form.name.label': "Name",
    'form.name.placeholder': "Your name",
    'form.company.label': "Company",
    'form.company.placeholder': "Your company",
    'form.email.label': "Email",
    'form.email.placeholder': "you@company.com",
    'form.message.label': "Your project",
    'form.message.placeholder': "A few words",
    'form.submit': "Send",
    'contact.card1.title': "Contact details",
    'contact.card2.title': "The firm",
    'contact.card2.text': "Studio Initiative — founded by Michael Lozano, fifteen years in industrial data.",
    'footer.note': "Studio Initiative — Data & AI consulting firm, Toulouse.",
    'mail.subject': "Contact Studio Initiative",
    'mail.name': "Name",
    'mail.company': "Company",
    'mail.email': "Email",
  },
};

const LANG_KEY = 'si-lang';
let currentLang = localStorage.getItem(LANG_KEY) || (navigator.language.startsWith('en') ? 'en' : 'fr');

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.setAttribute('lang', lang);

  const dict = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });

  document.title = dict['meta.title'];
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', dict['meta.description']);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang')));
});

applyLang(currentLang);

// Header scroll state
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => io.observe(el));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form -> mailto
const form = document.getElementById('contact-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const company = form.company.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const dict = translations[currentLang];

  const subject = `${dict['mail.subject']} — ${name}`;
  const bodyLines = [
    `${dict['mail.name']} : ${name}`,
    company ? `${dict['mail.company']} : ${company}` : null,
    `${dict['mail.email']} : ${email}`,
    '',
    message,
  ].filter(Boolean);

  const mailto = `mailto:contact@studioinitiative.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

  window.location.href = mailto;
});
