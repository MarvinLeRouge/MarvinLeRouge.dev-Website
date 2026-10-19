import type { SpelledOutWords } from '../scripts/email-reveal';
import type { Locale } from './locales';

/** Text with inline emphasis, rendered by the RichText component. */
export type RichText = readonly (string | { readonly strong: string } | { readonly em: string })[];

interface HomeStrings {
  readonly warningTape: string;
  readonly jobTitle: string;
  readonly zone: string;
  readonly pitch: RichText;
  readonly warningLabel: string;
  readonly warningIntro: RichText;
  readonly warningEffects: RichText;
  readonly warningOutro: string;
  readonly githubLink: string;
  readonly linkedinLink: string;
  /** Text introducing the contact address. */
  readonly emailPrefix: string;
  /** Separator words of the address shown when JavaScript is off. */
  readonly emailWords: SpelledOutWords;
  readonly footerSite: string;
  readonly footerHarm: string;
  readonly footerDeadCodeBefore: string;
  readonly footerDeadCodeStruck: string;
  readonly footerDeadCodeAfter: string;
}

/** Labels of the project sheet pages. */
interface SheetStrings {
  /** Accessible name of the view tabs. */
  readonly viewSwitcherLabel: string;
  readonly recruiterView: string;
  readonly leadDevView: string;
  readonly problem: string;
  readonly built: string;
  readonly result: string;
  readonly stack: string;
  readonly keywords: string;
  readonly repo: string;
  readonly adrs: string;
  readonly demo: string;
  /** Shown on draft sheets, which only exist in development. */
  readonly draftNotice: string;
}

/** Document metadata, for search engines and link previews. */
export interface PageMeta {
  readonly title: string;
  readonly description: string;
  /** Text alternative of the link preview image. */
  readonly imageAlt: string;
}

interface UiStrings {
  /** Accessible name of the language switcher. */
  readonly languageSwitcherLabel: string;
  /** Native name of the language, shown to visitors switching to it. */
  readonly languageName: string;
  readonly homeMeta: PageMeta;
  readonly home: HomeStrings;
  readonly sheet: SheetStrings;
}

/** Every user-facing string of the site, per locale. */
export const UI: Readonly<Record<Locale, UiStrings>> = {
  fr: {
    languageSwitcherLabel: 'Langue',
    languageName: 'Français',
    homeMeta: {
      title: 'Jean Ceugniet, développeur backend / Data Engineer',
      description:
        '15+ ans de backend, et un faible pour les traitements trop lents et les données en désordre. Pipelines de données fiables, Python, SQL. Toulon / Remote.',
      imageAlt: 'MarvinLeRouge, Jean Ceugniet, développeur backend / Data Engineer',
    },
    home: {
      warningTape: 'PERSONNEL AUTORISÉ UNIQUEMENT',
      jobTitle: 'Développeur backend / Data Engineer',
      zone: 'Zone expérimentale',
      pitch: [
        { strong: '15+ ans de backend' },
        ", et un faible pour les traitements trop lents et les données en désordre. J'ai notamment ramené ",
        { strong: 'de plus de 3 minutes à moins de 5 secondes' },
        " un module qu'on croyait cassé, alors qu'il était juste désespérément lent. Je construis des ",
        { strong: 'pipelines de données fiables' },
        ', et je monte en compétences sur la ',
        { strong: 'stack Data Engineering moderne' },
        ' (orchestration, modélisation analytique).',
      ],
      warningLabel: '// ATTENTION',
      warningIntro: [
        'Vous êtes entré dans un ',
        { em: 'environnement de développement actif' },
        '.',
      ],
      warningEffects: [
        'Effets secondaires possibles : ',
        { em: 'logiciels qui fonctionnent' },
        ', ',
        { em: 'architecture propre' },
        ', ',
        { em: 'tests automatisés' },
        ', et une obsession malsaine pour la ',
        { em: 'qualité du code' },
        '.',
      ],
      warningOutro: 'Poursuivez à vos risques et périls',
      githubLink: 'GitHub',
      linkedinLink: 'LinkedIn',
      emailPrefix: 'Écrivez-moi :',
      emailWords: { at: 'arobase', dot: 'point' },
      footerSite: 'marvinlerouge.dev',
      footerHarm: "aucun humain n'a été maltraité pendant la fabrication de cette page",
      footerDeadCodeBefore: 'aucun',
      footerDeadCodeStruck: 'corps',
      footerDeadCodeAfter: 'code mort trouvé.',
    },
    sheet: {
      viewSwitcherLabel: 'Vue de la fiche',
      recruiterView: 'Vue recruteur',
      leadDevView: 'Vue lead dev',
      problem: 'Problème',
      built: 'Ce qui a été construit',
      result: 'Résultat',
      stack: 'Stack',
      keywords: 'Compétences',
      repo: 'Code source sur GitHub',
      adrs: "Décisions d'architecture (ADR)",
      demo: 'Démo',
      draftNotice: 'Brouillon, non publié',
    },
  },
  en: {
    languageSwitcherLabel: 'Language',
    languageName: 'English',
    homeMeta: {
      title: 'Jean Ceugniet, Backend Developer / Data Engineer',
      description:
        '15+ years of backend development, and a soft spot for slow processes and messy data. Reliable data pipelines, Python, SQL. Toulon / Remote.',
      imageAlt: 'MarvinLeRouge, Jean Ceugniet, Backend Developer / Data Engineer',
    },
    home: {
      warningTape: 'AUTHORIZED PERSONNEL ONLY',
      jobTitle: 'Backend Developer / Data Engineer',
      zone: 'Experimental zone',
      pitch: [
        { strong: '15+ years of backend development' },
        ', and a soft spot for slow processes and messy data. Among other things, I took a module thought to be broken, when it was just painfully slow, ',
        { strong: 'from over 3 minutes down to under 5 seconds' },
        '. I build ',
        { strong: 'reliable data pipelines' },
        ", and I'm currently upskilling on the ",
        { strong: 'modern Data Engineering stack' },
        ' (orchestration, analytical modeling).',
      ],
      warningLabel: '// WARNING',
      warningIntro: ['You have entered a ', { em: 'live development environment' }, '.'],
      warningEffects: [
        'Side effects may include: ',
        { em: 'working software' },
        ', ',
        { em: 'clean architecture' },
        ', ',
        { em: 'automated tests' },
        ', and an unhealthy obsession with ',
        { em: 'code quality' },
        '.',
      ],
      warningOutro: 'Proceed at your own risk',
      githubLink: 'GitHub',
      linkedinLink: 'LinkedIn',
      emailPrefix: 'Write to me:',
      emailWords: { at: 'at', dot: 'dot' },
      footerSite: 'marvinlerouge.dev',
      footerHarm: 'no humans were harmed in the making of this page',
      footerDeadCodeBefore: 'no',
      footerDeadCodeStruck: 'remains',
      footerDeadCodeAfter: 'dead code found.',
    },
    sheet: {
      viewSwitcherLabel: 'Sheet view',
      recruiterView: 'Recruiter view',
      leadDevView: 'Lead dev view',
      problem: 'Problem',
      built: 'What was built',
      result: 'Result',
      stack: 'Stack',
      keywords: 'Skills',
      repo: 'Source code on GitHub',
      adrs: 'Architecture decisions (ADR)',
      demo: 'Demo',
      draftNotice: 'Draft, not published',
    },
  },
};
