// Moteur de génération IA simulé avec contenus réalistes pour le marché africain

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateFicheProduit(data: {
  nom: string;
  caracteristiques: string;
  prix: string;
  cible: string;
}): Promise<string> {
  await delay(1800);
  return `🛍️ **${data.nom.toUpperCase()}**

━━━━━━━━━━━━━━━━━━━━━━━

✨ **Description**
${data.nom} est exactement ce qu'il vous faut si vous cherchez qualité et valeur. Conçu pour ${data.cible}, ce produit répond à vos besoins avec excellence.

📋 **Caractéristiques principales**
${data.caracteristiques
  .split(",")
  .map((c) => `• ${c.trim()}`)
  .join("\n")}

💎 **Pourquoi choisir ${data.nom} ?**
• Qualité garantie et vérifiée
• Rapport qualité-prix imbattable
• Livraison rapide disponible
• Service client réactif

💰 **Prix : ${data.prix} FCFA**

⚡ **Offre limitée — commandez maintenant !**

📲 Pour commander, envoyez "JE VEUX ${data.nom.toUpperCase()}" en message privé ou contactez-nous sur WhatsApp.

🏆 Des milliers de clients satisfaits nous font confiance. Rejoignez la famille !

#${data.nom.replace(/\s+/g, "")} #Qualité #${data.cible.replace(/\s+/g, "")} #MadeInAfrica`;
}

export async function generatePublicite(data: {
  produit: string;
  audience: string;
  prix: string;
  objectif: string;
  plateforme: string;
}): Promise<string> {
  await delay(2000);
  const variants = `🔥 **PUBLICITÉ FACEBOOK — Variante 1 (Accroche émotionnelle)**

Vous en avez assez de chercher ${data.produit} de qualité sans jamais trouver ?

Bonne nouvelle : ${data.produit} est maintenant disponible à seulement **${data.prix} FCFA** !

✅ Pour ${data.audience}
✅ ${data.objectif}
✅ Stock limité — ne ratez pas cette opportunité

👉 Cliquez sur "En savoir plus" pour commander dès maintenant !

━━━━━━━━━━━━━━━━━━

📢 **PUBLICITÉ INSTAGRAM — Variante 2 (Lifestyle)**

Imaginez votre vie avec ${data.produit}... ✨

${data.audience} méritent le meilleur.
Et le meilleur, c'est ${data.produit}.

💫 Seulement ${data.prix} FCFA
🚀 ${data.objectif}
📦 Livraison disponible

Commentez "JE VEUX" ou envoyez un DM ! 👇

━━━━━━━━━━━━━━━━━━

💬 **MESSAGE WHATSAPP — Variante 3 (Direct & persuasif)**

Bonjour ! 👋

Je vous présente ${data.produit} — le choix n°1 pour ${data.audience}.

🎯 Prix spécial : ${data.prix} FCFA
⚡ ${data.objectif}

Intéressé(e) ? Répondez OUI et je vous envoie tous les détails ! 😊`;
  return variants as string;
}

export async function generatePublicationSociale(data: {
  plateforme: string;
  sujet: string;
  ton: string;
  cta: string;
}): Promise<string> {
  await delay(1600);
  const platformEmoji: Record<string, string> = {
    facebook: "📘",
    instagram: "📸",
    whatsapp: "💬",
    tiktok: "🎵",
    linkedin: "💼",
  };
  const emoji = platformEmoji[data.plateforme.toLowerCase()] || "📱";

  return `${emoji} **PUBLICATION ${data.plateforme.toUpperCase()}**

━━━━━━━━━━━━━━━━━━

🎯 **Accroche**
${getAccroche(data.sujet, data.ton)}

📝 **Corps du message**
${getCorps(data.sujet, data.ton)}

💡 **Valeur ajoutée**
Voici pourquoi cela change tout pour vous :
→ Plus de temps perdu
→ Résultats garantis
→ Simple et efficace

📣 **Appel à l'action**
${data.cta || "Envoyez-nous un message maintenant !"}

━━━━━━━━━━━━━━━━━━

#Business #Afrique #Entrepreneur #${data.sujet.split(" ")[0]} #Succès #AfriTools`;
}

function getAccroche(sujet: string, ton: string): string {
  const accroches = [
    `❗ ATTENTION ${ton === "urgent" ? "DERNIÈRE CHANCE" : ""} : Ce que vous ne savez pas sur ${sujet} vous coûte de l'argent !`,
    `🚀 ${sujet} — La solution que des milliers d'Africains attendaient !`,
    `💥 ARRÊTEZ DE PERDRE DU TEMPS et découvrez ${sujet} maintenant !`,
  ];
  return accroches[Math.floor(Math.random() * accroches.length)];
}

function getCorps(sujet: string, ton: string): string {
  return `Chaque jour, des entrepreneurs africains réussissent grâce à ${sujet}.

${ton === "professionnel" ? "Notre approche professionnelle garantit" : "Notre solution simple vous garantit"} :
✓ Des résultats rapides et mesurables
✓ Une méthode éprouvée et adaptée à l'Afrique
✓ Un accompagnement personnalisé

Ne laissez plus vos concurrents prendre de l'avance !`;
}

export async function generateMessageWhatsApp(data: {
  produit: string;
  situation: string;
  prenom?: string;
}): Promise<string> {
  await delay(1400);
  const messages: Record<string, string> = {
    "premier-contact": `Bonjour ${data.prenom || ""} ! 👋

Je me permets de vous contacter concernant **${data.produit}**.

Je suis convaincu(e) que ce produit pourrait vraiment vous intéresser. Il est conçu pour vous faciliter la vie et vous faire économiser du temps et de l'argent.

Seriez-vous disponible pour que je vous en parle en quelques minutes ? Je reste à votre disposition.

Bonne journée ! 😊`,

    reponse: `Merci pour votre message ! 🙏

Oui, **${data.produit}** est bien disponible ! Voici les informations :

📦 Produit : ${data.produit}
✅ Disponibilité : En stock
🚚 Livraison : Disponible dans toute la ville

Pour finaliser votre commande, j'ai besoin de :
1️⃣ Votre nom complet
2️⃣ Votre adresse de livraison
3️⃣ Votre numéro de téléphone

Quand souhaitez-vous être livré(e) ? 📲`,

    relance: `Bonjour ! 😊

Je reviens vers vous concernant **${data.produit}** dont nous avions parlé.

Je voulais m'assurer que vous avez bien reçu mes informations et voir si vous avez des questions.

💡 Bonne nouvelle : nous avons encore quelques unités disponibles, mais le stock s'écoule rapidement !

N'hésitez pas à me donner votre décision. Je suis là pour vous aider à faire le meilleur choix. 🤝`,

    promotion: `🎉 **OFFRE SPÉCIALE — ${data.produit}**

Bonjour ! Je vous contacte pour vous annoncer une promotion exceptionnelle !

🔥 Pour une durée limitée seulement :
✨ ${data.produit} à prix réduit !
🎁 Des cadeaux offerts avec votre commande
⚡ Livraison express offerte

Cette offre est réservée à nos clients fidèles comme vous !

Répondez OUI maintenant pour en profiter avant qu'il ne soit trop tard ! ⏰`,

    fidelisation: `Bonjour ${data.prenom || ""} ! 😊

Merci infiniment pour votre confiance et votre fidélité !

Nous espérons que **${data.produit}** vous donne entière satisfaction. Votre avis compte beaucoup pour nous.

🌟 En tant que client(e) fidèle, vous bénéficiez :
• D'un accès prioritaire à nos nouveautés
• De remises exclusives sur vos prochaines commandes
• D'un service client dédié

Encore merci pour votre confiance ! À très bientôt 🙏`,
  };

  return messages[data.situation] || messages["premier-contact"];
}

export async function generateOffreCommerciale(data: {
  produit: string;
  ancienPrix: string;
  nouveauPrix: string;
  duree: string;
  avantages?: string;
}): Promise<string> {
  await delay(1900);
  const economie = parseInt(data.ancienPrix) - parseInt(data.nouveauPrix);
  const pourcentage = Math.round((economie / parseInt(data.ancienPrix)) * 100);

  return `🔥 **OFFRE EXCEPTIONNELLE — ${data.produit.toUpperCase()}**

━━━━━━━━━━━━━━━━━━━━━━━

⏰ **DURÉE LIMITÉE : ${data.duree}**

━━━━━━━━━━━━━━━━━━━━━━━

**VARIANTE 1 — Urgence et économie**

❌ ~~${data.ancienPrix} FCFA~~
✅ **${data.nouveauPrix} FCFA seulement !**

💰 Vous économisez **${economie} FCFA** (${pourcentage}% de réduction !)

Ne manquez pas cette opportunité unique ! Stock limité. ⚡

━━━━━━━━━━━━━━━━━━━━━━━

**VARIANTE 2 — Storytelling**

🎯 ${data.produit} — le produit dont vous avez besoin, enfin à votre portée !

Nous savons que chaque centime compte. C'est pourquoi nous avons décidé de vous offrir ${data.produit} au prix exceptionnel de **${data.nouveauPrix} FCFA** (au lieu de ${data.ancienPrix} FCFA).

${data.avantages ? `✨ Ce que vous obtenez :\n${data.avantages.split(",").map((a) => `• ${a.trim()}`).join("\n")}` : ""}

⏳ Offre valable ${data.duree} — après ça, le prix normal reprend !

━━━━━━━━━━━━━━━━━━━━━━━

**VARIANTE 3 — WhatsApp direct**

👋 Bonjour ! Profitez de notre PROMO sur ${data.produit} !

💥 ${pourcentage}% de réduction — seulement ${data.nouveauPrix} FCFA !
⏰ Valable pendant ${data.duree} uniquement
📦 Commandez maintenant, soyez livré rapidement

Envoyez "PROMO" pour commander ! 🛒`;
}
