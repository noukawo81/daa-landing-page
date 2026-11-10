(function (global) {
  global.DAASiteConfig = Object.freeze({
    whatsapp: Object.freeze({
      number: '2250544188155',
      baseUrl: 'https://wa.me/2250544188155',
      shareUrl: 'https://wa.me/?text=',
      links: Object.freeze({
        direct: 'https://wa.me/2250544188155',
        diagnostic: 'https://wa.me/2250544188155?text=Bonjour%20DAA%2C%20je%20souhaite%20b%C3%A9n%C3%A9ficier%20d%27un%20diagnostic%20digital%20gratuit.',
        corporateQuote: 'https://wa.me/2250544188155?text=Bonjour%20Mr.%20TEKEU,%20je%20repr%C3%A9sente%20une%20entreprise%20et%20souhaite%20un%20devis%20ainsi%20qu\'un%20audit%20pour%20une%20solution%20digitale%20sur-mesure.',
        vipGroup: 'https://chat.whatsapp.com/HE27sT0Ub6lDinv1FR3SW8?s=cl&p=a&ilr=1',
        studioSupport: 'https://wa.me/2250544188155?text=Bonjour%20l%27%C3%A9quipe%20DAA%2C%20j%27utilise%20le%20Studio%20IA%20et%20j%27ai%20besoin%20d%27assistance%20technique.',
        invitation: 'https://api.whatsapp.com/send?text=Salut%20!%20Je%20viens%20de%20r%C3%A9server%20ma%20place%20pour%20la%20formation%20offerte%20de%20la%20Digital%20Artisans%20Academy%20sur%20l%27automatisation%20WhatsApp%20et%20l%27IA.%20Ils%20offrent%20quelques%20acc%C3%A8s%20pour%20les%20commer%C3%A7ants.%20Profites-en%20aussi%20ici%20:%20https://digitalartisansacademy.vercel.app'
      }),
      messages: Object.freeze({
        order: 'Bonjour DAA, je souhaite commander le produit : {produit} au prix de {prix} FCFA',
        diagnostic: "Bonjour DAA, je souhaite bénéficier d'un diagnostic digital gratuit.",
        videoNotice: 'Bonjour Digital Artisans Academy ! Prévenez-moi dès le lancement de la Vidéo Promo IA (V2) du Studio DAA.'
      })
    }),
    creditCosts: Object.freeze({
      photo: 1,
      description: 2,
      video: 5
    }),
    prices: Object.freeze({
      currency: 'FCFA',
      services: Object.freeze({
        cataloguesWhatsappPro: 15000,
        videoTikTokReels: 25000,
        fichesGoogleMaps: 15000,
        retouchePhotosProduits: 10000,
        logosProfessionnels: 25000,
        cartesVisiteVirtuelles: 15000,
        bannieresAffichesPublicitaires: 15000,
        pagesVitrines: 50000,
        applicationsWebMobile: 100000,
        boutiquesEnLigne: 80000,
        agentsIaWhatsappInstallation: 75000,
        reponsesAutomatiquesTunnels: 35000,
        menuQrCommandeWhatsapp: 40000,
        generateurFacturesRecus: 30000,
        formulaireCommandeLivraison: 30000
      }),
      packs: Object.freeze({ depart: 30000, pro: 60000, empire: 150000 }),
      corporate: 'Sur devis',
      subscriptionLaunchDeadline: '[DATE À COMPLÉTER]',
      subscriptions: Object.freeze([
        Object.freeze({
          name: 'Contenu Starter',
          features: Object.freeze(['4 visuels', '4 textes de vente', 'Calendrier éditorial']),
          launchPrice: 20000,
          normalPrice: 35000,
          period: 'mois'
        }),
        Object.freeze({
          name: 'Contenu Standard',
          features: Object.freeze(['8 visuels', '1 vidéo courte', 'Calendrier éditorial']),
          launchPrice: 45000,
          normalPrice: 75000,
          period: 'mois'
        }),
        Object.freeze({
          name: 'Contenu Pro',
          features: Object.freeze(['12 visuels', '2 vidéos']),
          launchPrice: 90000,
          normalPrice: 150000,
          period: 'mois'
        }),
        Object.freeze({
          name: 'Suivi Agent IA',
          features: Object.freeze(['Corrections', 'Mises à jour']),
          launchPrice: 10000,
          normalPrice: 15000,
          period: null,
          periodicity: '[À COMPLÉTER]'
        }),
        Object.freeze({
          name: 'Suivi Agent IA+',
          features: Object.freeze(['Modifications du catalogue', 'Rapport mensuel']),
          launchPrice: 20000,
          normalPrice: 30000,
          period: null,
          periodicity: '[À COMPLÉTER]'
        })
      ]),
      studioCreditPacks: Object.freeze({
        decouverte: Object.freeze({ credits: 20, price: 3000 }),
        pro: Object.freeze({ credits: 100, price: 10000 }),
        business: Object.freeze({ credits: 500, price: 45000 })
      })
    }),
    testimonials: Object.freeze([])
  });
})(window);
