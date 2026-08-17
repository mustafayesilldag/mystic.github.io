const MYSTIC_LANGS = [ "tr", "en", "it", "fr", "de" ];

const MYSTIC_LANG_STORAGE_KEY = "mystic-lang";

const MYSTIC_FLAGS = {
    tr: "🇹🇷",
    en: "🇬🇧",
    it: "🇮🇹",
    fr: "🇫🇷",
    de: "🇩🇪"
};

const MYSTIC_I18N = {
    tr: {
        "nav.ariaLabel": "Ana gezinme",
        "nav.about": "Hakkımda",
        "nav.skills": "Yetenekler",
        "nav.projects": "Projeler",
        "nav.contact": "İletişim",
        "nav.toggleLabel": "Menüyü aç/kapat",
        "lang.selectLabel": "Dil seçin",
        "brandToggle.toEarth": "Dünya moduna dön",
        "brandToggle.toGalaxy": "Galaksi moduna geç",
        "brandToggle.toUniverse": "Evren moduna geç",
        "brandHint.text": "Farklı bir evren dene",
        "backToTop.label": "Başa dön",
        "hero.tagline": "Uçtan uca yazılım sistemleri, yalnızca sana özel kurulur.",
        "hero.btnProjects": "Projelerim",
        "hero.btnContact": "İletişim",
        "hero.scrollHint": "Aşağı kaydır",
        "about.title": "Hakkımda",
        "about.subtitle": "Şablon değil, projenin her katmanına özel kurulan sistemler.",
        "about.text1": "Ben <strong>MISTIK</strong>. 21 yaşındayım ve yazılıma olan merakım çocukluğuma kadar uzanıyor. Bu merakı son 1 yılda TrackDesk gibi gerçek, üretimde çalışan sistemlere dönüştürdüm; karmaşık iş süreçlerini sezgisel, sinematik dijital deneyimlere çeviren bir full-stack geliştirici ve sistem mimarıyım. Bir projenin fikrinden son kullanıcı ekranına kadar her katmanını tek başıma kurarım.",
        "about.text2": "Sahada çalışan satış ekipleri için gerçek zamanlı takip panelleri, kapsamlı bir e-ticaret altyapısı, özel bütçe yönetimi ve ekran paylaşım sistemleri geliştirdim. Hiçbiri hazır şablon değildi; her biri, o projenin gerçek ihtiyacına göre sıfırdan inşa edildi. Kendimi geliştirmeye ve bu birikimi her projeyle büyütmeye devam ediyorum.",
        "vision.label": "Vizyonum",
        "vision.text1": "Her müşteriye özel kurulan sistemleri, en iyi şekilde tasarlamak ve hayata geçirmek.",
        "vision.text2": "Müşteri memnuniyetini seçenek değil, işin temeli saymak.",
        "vision.text3": "Hızlı, güvenilir ve arkasında durulan bir iş teslim etmek.",
        "statement.text": "Bir projeyi sıfırdan mı kuruyoruz, yoksa yarım kalmış ya da hayal kırıklığına uğratmış birini mi yeniden inşa ediyoruz — fark etmez. Tek hedef var: <strong>ödediğin ücretin karşılığını gerçekten alman.</strong>",
        "skills.title": "Yetenekler",
        "skills.subtitle": "Modern teknolojilerle güçlendirilmiş uçtan uca çözümler.",
        "skills.frontend.title": "Frontend",
        "skills.frontend.desc": "HTML5, CSS3, JavaScript ES6+ ve React ile piksel hassasiyetinde, hızlı ve sezgisel arayüzler kurarım: animasyon, micro-interaction ve responsive tasarım dahil.",
        "skills.backend.title": "Backend",
        "skills.backend.desc": "PHP 8, MySQL ve PDO ile güvenli oturum yönetimi kurarım. REST API entegrasyonları, ödeme akışları ve çok kullanıcılı sistem altyapısı bu işin doğal parçası — TrackDesk'te, 4 milyon TL'yi aşan kazancı gerçek zamanlı takip eden bir sistemle bunu kanıtladım.",
        "skills.systems.title": "Sistemler",
        "skills.systems.desc": "E-ticaret platformları, CRM ve satış panelleri, bütçe takip uygulamaları, WebRTC gerçek zamanlı iletişim, AI entegrasyonları ve PWA.",
        "skills.approach.title": "Yaklaşım",
        "skills.approach.desc": "Her proje sıfırdan, o projenin gerçek ihtiyacına özel kurulur. Hazır şablon yok; sadece senin işine biçilmiş, ölçeklenebilir bir sistem var.",
        "projects.title": "Öne Çıkan Projeler",
        "projects.trackdesk.badge": "Canlı",
        "projects.trackdesk.desc": "Sahada satış yapan işletmeler için baştan sona geliştirdiğim bir web paneli — müşteri bakiyesi, sipariş ve tahsilat takibini tek ekranda topluyor. Şu an gerçek bir işletmede kullanılıyor: 4 milyon TL'yi aşan kazancı, 1.000'den fazla işlemle gerçek zamanlı takip ediyor.",
        "projects.trackdesk.linkDisabled": "Domain bekleniyor",
        "projects.sinava.badge": "Canlı",
        "projects.sinava.desc": "Bir müşterim için baştan sona geliştirip teslim ettiğim, LGS/YKS hazırlığa odaklı birebir online özel ders platformu. Öğretmen pazaryeri, canlı video dersler, motivasyon ve sınav kaygısı koçluğuyla uçtan uca bir eğitim deneyimi sunuyor — eğitime yeni adım atmış olmasına rağmen şimdiden 6'dan fazla öğretmen, 3 koç, 50'yi aşkın öğrenci ve 500 bin TL'yi aşan kazançla büyüyor.",
        "projects.sinava.tagVideo": "Video Ders",
        "projects.sinava.tagMarketplace": "Öğretmen Pazaryeri",
        "projects.sinava.linkText": "Siteyi Ziyaret Et",
        "projects.moreComing.title": "Daha fazlası hazırlanıyor",
        "projects.moreComing.desc": "Yeni projeler düzenli olarak eklenir — bu vitrin büyümeye devam edecek.",
        "contact.title": "İletişime Geçin",
        "contact.subtitle": "Bir projeniz mi var, yoksa sadece merhaba mı demek istiyorsunuz? Dijital dünyayı birlikte şekillendirebiliriz.",
        "contact.emailLabel": "E-posta",
        "contact.responseNote": "Genellikle 24 saat içinde dönüş yapıyorum.",
        "footer.tagline": "Özel inşa edilmiş, sağlam dijital sistemler.",
        "footer.copy": "© 2026 Mustafa Yeşildağ. Tüm hakları saklıdır.",
        "meta.title": "MYSTIC — Mustafa Yeşildağ | Full-Stack Web Geliştirici",
        "meta.description": "MYSTIC — Mustafa (MISTIK) tarafından kurulan, sinematik web deneyimleri ve sağlam sistemler üreten full-stack geliştirme markası. Özel panel, CRM ve satış sistemleri.",
        "meta.ogTitle": "MYSTIC — Sinematik web deneyimleri ve sağlam sistemler",
        "meta.ogDescription": "Küçük işletmeler ve markalar için, kalıp tasarımların ötesinde özel arayüzler ve satış sistemleri."
    },
    en: {
        "nav.ariaLabel": "Main navigation",
        "nav.about": "About",
        "nav.skills": "Skills",
        "nav.projects": "Projects",
        "nav.contact": "Contact",
        "nav.toggleLabel": "Open/close menu",
        "lang.selectLabel": "Select language",
        "brandToggle.toEarth": "Return to Earth Mode",
        "brandToggle.toGalaxy": "Switch to Galaxy Mode",
        "brandToggle.toUniverse": "Switch to Universe Mode",
        "brandHint.text": "Try a different universe",
        "backToTop.label": "Back to top",
        "hero.tagline": "End-to-end software systems, built exclusively for you.",
        "hero.btnProjects": "My Projects",
        "hero.btnContact": "Contact",
        "hero.scrollHint": "Scroll down",
        "about.title": "About Me",
        "about.subtitle": "Not a template — systems built for every layer of your project.",
        "about.text1": "I'm <strong>MISTIK</strong>. I'm 21, and my curiosity about software goes back to childhood. In the last year I turned that curiosity into real, production-grade systems like TrackDesk — I'm a full-stack developer and systems architect who turns complex business processes into intuitive, cinematic digital experiences. I build every layer of a project myself, from the first idea to the final screen.",
        "about.text2": "I've built real-time tracking dashboards for field sales teams, a full-featured e-commerce platform, custom budget management tools, and screen-sharing systems. None of them were off-the-shelf templates; each one was built from scratch for that project's real need. I keep growing this skill set with every new project.",
        "vision.label": "My Vision",
        "vision.text1": "Designing and building systems tailored to each client, in the best way possible.",
        "vision.text2": "Treating client satisfaction as the foundation of the work, not an option.",
        "vision.text3": "Delivering work that's fast, reliable, and built to stand behind.",
        "statement.text": "Whether we're building a project from scratch or rebuilding one that was left unfinished or fell short — it doesn't matter. There's one goal: <strong>making sure you actually get what you paid for.</strong>",
        "skills.title": "Skills",
        "skills.subtitle": "End-to-end solutions powered by modern technology.",
        "skills.frontend.title": "Frontend",
        "skills.frontend.desc": "I build pixel-perfect, fast, and intuitive interfaces with HTML5, CSS3, JavaScript ES6+ and React — including animation, micro-interactions, and responsive design.",
        "skills.backend.title": "Backend",
        "skills.backend.desc": "I build secure session management with PHP 8, MySQL, and PDO. REST API integrations, payment flows, and multi-user system architecture are all part of the job — I proved it with TrackDesk, a system tracking over 4 million TL in earnings in real time.",
        "skills.systems.title": "Systems",
        "skills.systems.desc": "E-commerce platforms, CRM and sales dashboards, budget-tracking apps, real-time WebRTC communication, AI integrations, and PWAs.",
        "skills.approach.title": "Approach",
        "skills.approach.desc": "Every project is built from scratch, tailored to its real need. No off-the-shelf templates — just a scalable system cut precisely to your business.",
        "projects.title": "Featured Projects",
        "projects.trackdesk.badge": "Live",
        "projects.trackdesk.desc": "A web panel I built end-to-end for field sales businesses — bringing customer balances, orders, and collections together in one screen. It's in active use at a real business right now, tracking over 4 million TL in earnings across 1,000+ transactions in real time.",
        "projects.trackdesk.linkDisabled": "Domain pending",
        "projects.sinava.badge": "Live",
        "projects.sinava.desc": "An online 1-on-1 tutoring platform I built and delivered end-to-end for a client, focused on exam prep for grades 5-8. A teacher marketplace, live video lessons, and motivation/exam-anxiety coaching add up to a complete learning experience — though newly launched, it's already growing with 6+ teachers, 3 coaches, 50+ students, and over 500,000 TL in revenue.",
        "projects.sinava.tagVideo": "Video Lessons",
        "projects.sinava.tagMarketplace": "Teacher Marketplace",
        "projects.sinava.linkText": "Visit Site",
        "projects.moreComing.title": "More on the way",
        "projects.moreComing.desc": "New projects are added regularly — this showcase keeps growing.",
        "contact.title": "Get in Touch",
        "contact.subtitle": "Have a project in mind, or just want to say hello? Let's shape the digital world together.",
        "contact.emailLabel": "Email",
        "contact.responseNote": "I usually reply within 24 hours.",
        "footer.tagline": "Custom-built, robust digital systems.",
        "footer.copy": "© 2026 Mustafa Yeşildağ. All rights reserved.",
        "meta.title": "MYSTIC — Mustafa Yeşildağ | Full-Stack Web Developer",
        "meta.description": "MYSTIC — a full-stack development brand founded by Mustafa (MISTIK), crafting cinematic web experiences and robust systems. Custom dashboards, CRM, and sales systems.",
        "meta.ogTitle": "MYSTIC — Cinematic web experiences and robust systems",
        "meta.ogDescription": "For small businesses and brands: custom interfaces and sales systems that go beyond templates."
    },
    it: {
        "nav.ariaLabel": "Navigazione principale",
        "nav.about": "Chi sono",
        "nav.skills": "Competenze",
        "nav.projects": "Progetti",
        "nav.contact": "Contatti",
        "nav.toggleLabel": "Apri/chiudi menu",
        "lang.selectLabel": "Seleziona lingua",
        "brandToggle.toEarth": "Torna alla modalità Terra",
        "brandToggle.toGalaxy": "Passa alla modalità Galassia",
        "brandToggle.toUniverse": "Passa alla modalità Universo",
        "brandHint.text": "Prova un altro universo",
        "backToTop.label": "Torna su",
        "hero.tagline": "Sistemi software end-to-end, costruiti esclusivamente per te.",
        "hero.btnProjects": "I miei progetti",
        "hero.btnContact": "Contatti",
        "hero.scrollHint": "Scorri in basso",
        "about.title": "Chi sono",
        "about.subtitle": "Non un modello — sistemi costruiti per ogni livello del progetto.",
        "about.text1": "Sono <strong>MISTIK</strong>. Ho 21 anni e la mia curiosità per il software risale all'infanzia. Nell'ultimo anno ho trasformato questa curiosità in sistemi reali e in produzione come TrackDesk — sono uno sviluppatore full-stack e architetto di sistemi che trasforma processi aziendali complessi in esperienze digitali intuitive e cinematografiche. Costruisco da solo ogni livello di un progetto, dall'idea alla schermata finale.",
        "about.text2": "Ho sviluppato dashboard di monitoraggio in tempo reale per team di vendita sul campo, una piattaforma e-commerce completa, strumenti di gestione budget su misura e sistemi di condivisione schermo. Nessuno era un modello preconfezionato; ognuno è stato costruito da zero per l'esigenza reale di quel progetto. Continuo a crescere con ogni nuovo progetto.",
        "vision.label": "La mia visione",
        "vision.text1": "Progettare e costruire sistemi su misura per ogni cliente, nel miglior modo possibile.",
        "vision.text2": "Considerare la soddisfazione del cliente il fondamento del lavoro, non un'opzione.",
        "vision.text3": "Consegnare un lavoro veloce, affidabile e di cui essere garante.",
        "statement.text": "Che si tratti di costruire un progetto da zero o di ricostruirne uno rimasto incompleto o deludente — non importa. C'è un solo obiettivo: <strong>che tu ottenga davvero ciò per cui hai pagato.</strong>",
        "skills.title": "Competenze",
        "skills.subtitle": "Soluzioni end-to-end basate su tecnologie moderne.",
        "skills.frontend.title": "Frontend",
        "skills.frontend.desc": "Costruisco interfacce pixel-perfect, veloci e intuitive con HTML5, CSS3, JavaScript ES6+ e React, incluse animazioni, micro-interazioni e design responsive.",
        "skills.backend.title": "Backend",
        "skills.backend.desc": "Costruisco una gestione delle sessioni sicura con PHP 8, MySQL e PDO. Integrazioni REST API, flussi di pagamento e architetture multiutente fanno parte del lavoro — l'ho dimostrato con TrackDesk, un sistema che traccia in tempo reale oltre 4 milioni di TL di incassi.",
        "skills.systems.title": "Sistemi",
        "skills.systems.desc": "Piattaforme e-commerce, CRM e dashboard di vendita, app per il monitoraggio del budget, comunicazione in tempo reale WebRTC, integrazioni AI e PWA.",
        "skills.approach.title": "Approccio",
        "skills.approach.desc": "Ogni progetto è costruito da zero, su misura per la sua reale necessità. Nessun modello preconfezionato: solo un sistema scalabile ritagliato sulla tua attività.",
        "projects.title": "Progetti in evidenza",
        "projects.trackdesk.badge": "In diretta",
        "projects.trackdesk.desc": "Un pannello web che ho sviluppato interamente per aziende di vendita sul campo — riunisce saldi clienti, ordini e incassi in un'unica schermata. È attualmente in uso presso un'azienda reale, con oltre 4 milioni di TL di incassi tracciati attraverso più di 1.000 transazioni in tempo reale.",
        "projects.trackdesk.linkDisabled": "Dominio in attesa",
        "projects.sinava.badge": "In diretta",
        "projects.sinava.desc": "Una piattaforma di lezioni private online che ho sviluppato e consegnato interamente per un cliente, focalizzata sulla preparazione agli esami per studenti dalla 5ª all'8ª classe. Un marketplace di insegnanti, lezioni video dal vivo e coaching su motivazione e ansia da esame formano un'esperienza di apprendimento completa — pur essendo appena lanciata, sta già crescendo con oltre 6 insegnanti, 3 coach, oltre 50 studenti e oltre 500.000 TL di fatturato.",
        "projects.sinava.tagVideo": "Lezioni Video",
        "projects.sinava.tagMarketplace": "Marketplace Insegnanti",
        "projects.sinava.linkText": "Visita il Sito",
        "projects.moreComing.title": "Altri progetti in arrivo",
        "projects.moreComing.desc": "Nuovi progetti vengono aggiunti regolarmente — questa vetrina continua a crescere.",
        "contact.title": "Contattami",
        "contact.subtitle": "Hai un progetto in mente, o vuoi semplicemente dire ciao? Possiamo plasmare insieme il mondo digitale.",
        "contact.emailLabel": "Email",
        "contact.responseNote": "Di solito rispondo entro 24 ore.",
        "footer.tagline": "Sistemi digitali robusti, costruiti su misura.",
        "footer.copy": "© 2026 Mustafa Yeşildağ. Tutti i diritti riservati.",
        "meta.title": "MYSTIC — Mustafa Yeşildağ | Sviluppatore Full-Stack",
        "meta.description": "MYSTIC — un marchio di sviluppo full-stack fondato da Mustafa (MISTIK), che crea esperienze web cinematografiche e sistemi robusti. Pannelli su misura, CRM e sistemi di vendita.",
        "meta.ogTitle": "MYSTIC — Esperienze web cinematografiche e sistemi robusti",
        "meta.ogDescription": "Per piccole imprese e brand: interfacce su misura e sistemi di vendita oltre i modelli preconfezionati."
    },
    fr: {
        "nav.ariaLabel": "Navigation principale",
        "nav.about": "À propos",
        "nav.skills": "Compétences",
        "nav.projects": "Projets",
        "nav.contact": "Contact",
        "nav.toggleLabel": "Ouvrir/fermer le menu",
        "lang.selectLabel": "Choisir la langue",
        "brandToggle.toEarth": "Revenir au mode Terre",
        "brandToggle.toGalaxy": "Passer en mode Galaxie",
        "brandToggle.toUniverse": "Passer en mode Univers",
        "brandHint.text": "Essaie un autre univers",
        "backToTop.label": "Retour en haut",
        "hero.tagline": "Des systèmes logiciels de bout en bout, conçus uniquement pour vous.",
        "hero.btnProjects": "Mes projets",
        "hero.btnContact": "Contact",
        "hero.scrollHint": "Défiler vers le bas",
        "about.title": "À propos de moi",
        "about.subtitle": "Pas un modèle — des systèmes conçus pour chaque couche du projet.",
        "about.text1": "Je suis <strong>MISTIK</strong>. J'ai 21 ans et ma curiosité pour l'informatique remonte à l'enfance. Au cours de la dernière année, j'ai transformé cette curiosité en systèmes réels, en production, comme TrackDesk — je suis un développeur full-stack et architecte de systèmes qui transforme des processus métier complexes en expériences numériques intuitives et cinématographiques. Je construis seul chaque couche d'un projet, de l'idée à l'écran final.",
        "about.text2": "J'ai développé des tableaux de bord de suivi en temps réel pour des équipes de vente terrain, une plateforme e-commerce complète, des outils de gestion budgétaire sur mesure et des systèmes de partage d'écran. Aucun n'était un modèle préfabriqué ; chacun a été construit à partir de zéro pour le besoin réel de ce projet. Je continue à progresser avec chaque nouveau projet.",
        "vision.label": "Ma vision",
        "vision.text1": "Concevoir et construire des systèmes sur mesure pour chaque client, de la meilleure façon possible.",
        "vision.text2": "Considérer la satisfaction du client comme le fondement du travail, pas une option.",
        "vision.text3": "Livrer un travail rapide, fiable et dont on peut se porter garant.",
        "statement.text": "Qu'il s'agisse de construire un projet à partir de zéro ou d'en reconstruire un resté inachevé ou décevant — peu importe. Il n'y a qu'un seul objectif : <strong>que vous obteniez vraiment ce pour quoi vous avez payé.</strong>",
        "skills.title": "Compétences",
        "skills.subtitle": "Des solutions de bout en bout propulsées par des technologies modernes.",
        "skills.frontend.title": "Frontend",
        "skills.frontend.desc": "Je conçois des interfaces pixel-perfect, rapides et intuitives avec HTML5, CSS3, JavaScript ES6+ et React — animations, micro-interactions et design responsive inclus.",
        "skills.backend.title": "Backend",
        "skills.backend.desc": "Je mets en place une gestion de session sécurisée avec PHP 8, MySQL et PDO. Intégrations d'API REST, flux de paiement et architecture multi-utilisateurs font partie intégrante du travail — je l'ai prouvé avec TrackDesk, un système qui suit en temps réel plus de 4 millions de TL d'encaissements.",
        "skills.systems.title": "Systèmes",
        "skills.systems.desc": "Plateformes e-commerce, CRM et tableaux de bord commerciaux, applications de suivi budgétaire, communication en temps réel WebRTC, intégrations IA et PWA.",
        "skills.approach.title": "Approche",
        "skills.approach.desc": "Chaque projet est construit à partir de zéro, sur mesure pour son besoin réel. Aucun modèle préfabriqué — juste un système évolutif taillé pour votre activité.",
        "projects.title": "Projets phares",
        "projects.trackdesk.badge": "En ligne",
        "projects.trackdesk.desc": "Un panneau web que j'ai développé de bout en bout pour des entreprises de vente terrain — il regroupe soldes clients, commandes et encaissements sur un seul écran. Il est actuellement utilisé par une vraie entreprise, suivant en temps réel plus de 4 millions de TL d'encaissements à travers plus de 1 000 transactions.",
        "projects.trackdesk.linkDisabled": "Domaine en attente",
        "projects.sinava.badge": "En ligne",
        "projects.sinava.desc": "Une plateforme de cours particuliers en ligne que j'ai développée et livrée de bout en bout pour un client, centrée sur la préparation aux examens pour les élèves de la 5e à la 8e. Une marketplace d'enseignants, des cours vidéo en direct et un coaching sur la motivation et le stress des examens forment une expérience d'apprentissage complète — bien que récemment lancée, elle compte déjà plus de 6 enseignants, 3 coachs, plus de 50 élèves et plus de 500 000 TL de chiffre d'affaires.",
        "projects.sinava.tagVideo": "Cours Vidéo",
        "projects.sinava.tagMarketplace": "Marketplace d'Enseignants",
        "projects.sinava.linkText": "Visiter le Site",
        "projects.moreComing.title": "D'autres projets arrivent",
        "projects.moreComing.desc": "De nouveaux projets sont ajoutés régulièrement — cette vitrine continue de grandir.",
        "contact.title": "Contactez-moi",
        "contact.subtitle": "Vous avez un projet en tête, ou vous voulez simplement dire bonjour ? Façonnons ensemble le monde numérique.",
        "contact.emailLabel": "E-mail",
        "contact.responseNote": "Je réponds généralement sous 24 heures.",
        "footer.tagline": "Des systèmes numériques robustes, construits sur mesure.",
        "footer.copy": "© 2026 Mustafa Yeşildağ. Tous droits réservés.",
        "meta.title": "MYSTIC — Mustafa Yeşildağ | Développeur Full-Stack",
        "meta.description": "MYSTIC — une marque de développement full-stack fondée par Mustafa (MISTIK), créant des expériences web cinématographiques et des systèmes robustes. Panneaux sur mesure, CRM et systèmes de vente.",
        "meta.ogTitle": "MYSTIC — Expériences web cinématographiques et systèmes robustes",
        "meta.ogDescription": "Pour les petites entreprises et les marques : des interfaces sur mesure et des systèmes de vente au-delà des modèles préfabriqués."
    },
    de: {
        "nav.ariaLabel": "Hauptnavigation",
        "nav.about": "Über mich",
        "nav.skills": "Fähigkeiten",
        "nav.projects": "Projekte",
        "nav.contact": "Kontakt",
        "nav.toggleLabel": "Menü öffnen/schließen",
        "lang.selectLabel": "Sprache wählen",
        "brandToggle.toEarth": "Zurück zum Erde-Modus",
        "brandToggle.toGalaxy": "Zum Galaxie-Modus wechseln",
        "brandToggle.toUniverse": "Zum Universum-Modus wechseln",
        "brandHint.text": "Probier ein anderes Universum",
        "backToTop.label": "Nach oben",
        "hero.tagline": "Durchdachte Softwaresysteme, ausschließlich für dich gebaut.",
        "hero.btnProjects": "Meine Projekte",
        "hero.btnContact": "Kontakt",
        "hero.scrollHint": "Nach unten scrollen",
        "about.title": "Über mich",
        "about.subtitle": "Keine Vorlage — Systeme, gebaut für jede Ebene deines Projekts.",
        "about.text1": "Ich bin <strong>MISTIK</strong>. Ich bin 21 Jahre alt, und meine Neugier für Software reicht bis in meine Kindheit zurück. Im letzten Jahr habe ich diese Neugier in echte, produktiv laufende Systeme wie TrackDesk verwandelt — ich bin ein Full-Stack-Entwickler und Systemarchitekt, der komplexe Geschäftsprozesse in intuitive, kinoreife digitale Erlebnisse verwandelt. Ich baue jede Ebene eines Projekts allein auf — von der ersten Idee bis zum letzten Bildschirm.",
        "about.text2": "Ich habe Echtzeit-Tracking-Dashboards für Außendienstteams, eine umfassende E-Commerce-Plattform, individuelle Budgetverwaltung und Bildschirmfreigabe-Systeme entwickelt. Keines davon war eine fertige Vorlage; jedes wurde von Grund auf für den tatsächlichen Bedarf des jeweiligen Projekts gebaut. Mit jedem neuen Projekt wachse ich weiter.",
        "vision.label": "Meine Vision",
        "vision.text1": "Für jeden Kunden maßgeschneiderte Systeme entwerfen und auf bestmögliche Weise umsetzen.",
        "vision.text2": "Kundenzufriedenheit als Grundlage der Arbeit betrachten, nicht als Option.",
        "vision.text3": "Schnelle, zuverlässige Arbeit liefern, für die man geradesteht.",
        "statement.text": "Ob wir ein Projekt von Grund auf neu aufbauen oder eines, das unfertig oder enttäuschend geblieben ist, neu gestalten — das spielt keine Rolle. Es gibt nur ein Ziel: <strong>dass du wirklich das bekommst, wofür du bezahlt hast.</strong>",
        "skills.title": "Fähigkeiten",
        "skills.subtitle": "Durchgängige Lösungen, angetrieben von moderner Technologie.",
        "skills.frontend.title": "Frontend",
        "skills.frontend.desc": "Ich baue pixelgenaue, schnelle und intuitive Oberflächen mit HTML5, CSS3, JavaScript ES6+ und React — inklusive Animationen, Mikro-Interaktionen und responsivem Design.",
        "skills.backend.title": "Backend",
        "skills.backend.desc": "Ich implementiere sichere Sitzungsverwaltung mit PHP 8, MySQL und PDO. REST-API-Integrationen, Zahlungsabläufe und Mehrbenutzer-Systemarchitektur gehören selbstverständlich dazu — bewiesen mit TrackDesk, einem System, das in Echtzeit über 4 Millionen TL an Umsatz verfolgt.",
        "skills.systems.title": "Systeme",
        "skills.systems.desc": "E-Commerce-Plattformen, CRM- und Vertriebs-Dashboards, Budget-Tracking-Apps, WebRTC-Echtzeitkommunikation, KI-Integrationen und PWAs.",
        "skills.approach.title": "Ansatz",
        "skills.approach.desc": "Jedes Projekt wird von Grund auf gebaut, exakt auf den tatsächlichen Bedarf zugeschnitten. Keine Vorlagen von der Stange — nur ein skalierbares System, maßgeschneidert für dein Geschäft.",
        "projects.title": "Ausgewählte Projekte",
        "projects.trackdesk.badge": "Live",
        "projects.trackdesk.desc": "Ein Webpanel, das ich komplett für Außendienst-Unternehmen entwickelt habe — es vereint Kundensalden, Bestellungen und Zahlungseingänge auf einem Bildschirm. Es wird derzeit bei einem echten Unternehmen eingesetzt und verfolgt in Echtzeit über 4 Millionen TL an Umsatz über mehr als 1.000 Transaktionen.",
        "projects.trackdesk.linkDisabled": "Domain ausstehend",
        "projects.sinava.badge": "Live",
        "projects.sinava.desc": "Eine Online-Einzelnachhilfeplattform, die ich für einen Kunden komplett entwickelt und ausgeliefert habe, mit Fokus auf Prüfungsvorbereitung für die 5. bis 8. Klasse. Ein Lehrer-Marktplatz, Live-Videounterricht sowie Motivations- und Prüfungsangst-Coaching ergeben ein durchgängiges Lernerlebnis — obwohl gerade erst gestartet, wächst sie bereits mit über 6 Lehrkräften, 3 Coaches, über 50 Schülern und über 500.000 TL Umsatz.",
        "projects.sinava.tagVideo": "Videounterricht",
        "projects.sinava.tagMarketplace": "Lehrer-Marktplatz",
        "projects.sinava.linkText": "Website Besuchen",
        "projects.moreComing.title": "Weitere Projekte in Arbeit",
        "projects.moreComing.desc": "Neue Projekte werden laufend hinzugefügt — diese Übersicht wächst weiter.",
        "contact.title": "Kontakt aufnehmen",
        "contact.subtitle": "Hast du ein Projekt im Kopf, oder möchtest du einfach nur Hallo sagen? Lass uns gemeinsam die digitale Welt gestalten.",
        "contact.emailLabel": "E-Mail",
        "contact.responseNote": "Ich antworte in der Regel innerhalb von 24 Stunden.",
        "footer.tagline": "Individuell gebaute, robuste digitale Systeme.",
        "footer.copy": "© 2026 Mustafa Yeşildağ. Alle Rechte vorbehalten.",
        "meta.title": "MYSTIC — Mustafa Yeşildağ | Full-Stack-Webentwickler",
        "meta.description": "MYSTIC — eine von Mustafa (MISTIK) gegründete Full-Stack-Entwicklungsmarke, die kinoreife Web-Erlebnisse und robuste Systeme schafft. Individuelle Dashboards, CRM- und Vertriebssysteme.",
        "meta.ogTitle": "MYSTIC — Kinoreife Web-Erlebnisse und robuste Systeme",
        "meta.ogDescription": "Für kleine Unternehmen und Marken: individuelle Oberflächen und Vertriebssysteme, die über Vorlagen hinausgehen."
    }
};

function mysticGetStoredLang() {
    try {
        const stored = localStorage.getItem(MYSTIC_LANG_STORAGE_KEY);
        if (stored && MYSTIC_LANGS.includes(stored)) return stored;
    } catch (e) {}
    return "tr";
}

function mysticApplyLanguage(lang) {
    if (!MYSTIC_LANGS.includes(lang)) lang = "tr";
    const dict = MYSTIC_I18N[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const key = el.getAttribute("data-i18n-html");
        if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
        const key = el.getAttribute("data-i18n-aria");
        if (dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
    });
    const titleEl = document.getElementById("page-title");
    if (titleEl && dict["meta.title"]) {
        titleEl.textContent = dict["meta.title"];
        document.title = dict["meta.title"];
    }
    const metaDesc = document.getElementById("meta-description");
    if (metaDesc && dict["meta.description"]) metaDesc.setAttribute("content", dict["meta.description"]);
    const ogTitle = document.getElementById("og-title");
    if (ogTitle && dict["meta.ogTitle"]) ogTitle.setAttribute("content", dict["meta.ogTitle"]);
    const ogDesc = document.getElementById("og-description");
    if (ogDesc && dict["meta.ogDescription"]) ogDesc.setAttribute("content", dict["meta.ogDescription"]);
    const flagCurrent = document.getElementById("lang-flag-current");
    const codeCurrent = document.getElementById("lang-code-current");
    if (flagCurrent) flagCurrent.textContent = MYSTIC_FLAGS[lang];
    if (codeCurrent) codeCurrent.textContent = lang.toUpperCase();
    document.querySelectorAll("#lang-menu li[data-lang]").forEach(li => {
        const isActive = li.getAttribute("data-lang") === lang;
        li.setAttribute("aria-selected", String(isActive));
        li.classList.toggle("is-active", isActive);
    });
    try {
        localStorage.setItem(MYSTIC_LANG_STORAGE_KEY, lang);
    } catch (e) {}
    if (typeof window.mysticRefreshBrandLabel === "function") window.mysticRefreshBrandLabel();
}

const langSwitcher = document.getElementById("lang-switcher");

const langToggle = document.getElementById("lang-toggle");

const langMenu = document.getElementById("lang-menu");

if (langSwitcher && langToggle && langMenu) {
    const closeLangMenu = () => {
        langSwitcher.classList.remove("is-open");
        langToggle.setAttribute("aria-expanded", "false");
    };
    langToggle.addEventListener("click", e => {
        e.stopPropagation();
        const isOpen = langSwitcher.classList.toggle("is-open");
        langToggle.setAttribute("aria-expanded", String(isOpen));
    });
    langMenu.querySelectorAll("li[data-lang]").forEach(li => {
        li.addEventListener("click", () => {
            mysticApplyLanguage(li.getAttribute("data-lang"));
            closeLangMenu();
        });
    });
    document.addEventListener("click", e => {
        if (!langSwitcher.contains(e.target)) closeLangMenu();
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeLangMenu();
    });
}

mysticApplyLanguage(mysticGetStoredLang());