export const features = [
  {
    icon: "🎭",
    title: "Cohérence Personnage",
    desc: "Vos personnages restent identiques d'une scène à l'autre, même sur des vidéos de 30 minutes.",
  },
  {
    icon: "🎨",
    title: "Styles Artistiques",
    desc: "Choisissez parmi 12 styles visuels distincts : sketch, cartoon, réaliste, minimaliste et plus.",
  },
  {
    icon: "⏱️",
    title: "Long-Form Ready",
    desc: "Générez des vidéos éducatives complètes, des cours en ligne, sans limite de durée.",
  },
  {
    icon: "🎙️",
    title: "Narration Humaine",
    desc: "Voix synthétiques ultra-réalistes en 8 langues avec synchronisation labiale parfaite.",
  },
];

export const steps = [
  {
    n: "01",
    title: "Décrivez votre histoire",
    desc: "Entrez votre script ou décrivez votre sujet. Notre IA génère un storyboard complet.",
  },
  {
    n: "02",
    title: "Personnalisez chaque scène",
    desc: "Ajustez les personnages, les décors, le style visuel et la narration selon votre vision.",
  },
  {
    n: "03",
    title: "Exportez et partagez",
    desc: "Téléchargez votre vidéo en HD ou partagez directement sur vos plateformes.",
  },
];

export const mockVideos = [
  { id: 1, title: "La Révolution Industrielle", genre: "Éducatif", duration: "12:30" },
  { id: 2, title: "Comment fonctionne Bitcoin ?", genre: "Tech", duration: "8:45" },
  { id: 3, title: "L'histoire de Marie Curie", genre: "Biographie", duration: "15:20" },
  { id: 4, title: "Les bases de la programmation", genre: "Tutoriel", duration: "22:10" },
  { id: 5, title: "Le changement climatique", genre: "Science", duration: "10:05" },
  { id: 6, title: "Marketing Digital en 2026", genre: "Business", duration: "18:55" },
];

export const pricingPlans = [
  {
    name: "Creator",
    price: 49,
    highlighted: false,
    features: [
      "500 crédits / mois",
      "Vidéos jusqu'à 10 min",
      "3 styles visuels",
      "Export HD 1080p",
      "Support email",
    ],
  },
  {
    name: "Professional",
    price: 149,
    highlighted: true,
    features: [
      "2 000 crédits / mois",
      "Vidéos illimitées",
      "12 styles visuels",
      "Export 4K",
      "Personnages personnalisés",
      "Support prioritaire",
    ],
  },
  {
    name: "Business",
    price: 399,
    highlighted: false,
    features: [
      "8 000 crédits / mois",
      "Accès API",
      "Marque blanche",
      "Rendu prioritaire",
      "Manager dédié",
      "SLA garanti",
    ],
  },
];

export const testimonials = [
  {
    name: "Sophie Martin",
    role: "Créatrice de contenu",
    text: "Sketch Pilot a transformé ma façon de créer des vidéos éducatives. En 30 minutes, j'ai une vidéo professionnelle prête à publier.",
    avatar: "SM",
  },
  {
    name: "Thomas Leclerc",
    role: "Formateur en ligne",
    text: "La cohérence des personnages entre les scènes est bluffante. Mes élèves adorent le style visuel unique de mes cours.",
    avatar: "TL",
  },
  {
    name: "Amina Diallo",
    role: "Marketing Manager",
    text: "ROI impressionnant. On a réduit notre budget vidéo de 70% tout en doublant notre production de contenu.",
    avatar: "AD",
  },
];

export const faqs = [
  {
    q: "Combien de temps faut-il pour générer une vidéo ?",
    a: "Selon la longueur et la complexité, entre 2 et 15 minutes pour une vidéo de 10 minutes.",
  },
  {
    q: "Puis-je utiliser mes propres personnages ?",
    a: "Oui, avec les plans Professional et Business vous pouvez importer vos propres assets et personnages.",
  },
  {
    q: "Quelles langues sont supportées ?",
    a: "8 langues : Français, Anglais, Espagnol, Allemand, Portugais, Arabe, Chinois, Japonais.",
  },
  {
    q: "Les vidéos sont-elles libres de droits ?",
    a: "Oui, toutes les vidéos générées avec votre compte vous appartiennent entièrement.",
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Oui, sans frais ni engagement. Votre abonnement reste actif jusqu'à la fin de la période payée.",
  },
  {
    q: "Y a-t-il une version gratuite ?",
    a: "Nous offrons un essai gratuit de 14 jours avec 50 crédits pour tester toutes les fonctionnalités.",
  },
];
