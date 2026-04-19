import type { VocabCard } from './types';

export const sampleCards: VocabCard[] = [
  // ========== G10 S1 — Basics & Greetings ==========
  {
    id: 'g10s1_01', french: 'bonjour', english: 'hello / good morning',
    partOfSpeech: 'phrase', grade: 'G10S1', unit: 1, tags: ['greetings', 'basic'],
    exampleSentences: [
      { french: 'Bonjour, comment allez-vous ?', english: 'Hello, how are you?' },
      { french: 'Bonjour à tous !', english: 'Good morning everyone!' },
    ],
    examUsage: 'Formal greeting used in written and oral exams as opening.',
  },
  {
    id: 'g10s1_02', french: 'la famille', english: 'the family',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G10S1', unit: 1, tags: ['family', 'basic'],
    exampleSentences: [
      { french: 'Ma famille est très grande.', english: 'My family is very large.' },
      { french: 'La famille est importante dans la culture française.', english: 'Family is important in French culture.' },
    ],
    examUsage: 'Common topic in descriptive essays about personal life.',
  },
  {
    id: 'g10s1_03', french: 'travailler', english: 'to work',
    partOfSpeech: 'verb', grade: 'G10S1', unit: 2, tags: ['work', 'verbs'],
    exampleSentences: [
      { french: 'Je travaille tous les jours.', english: 'I work every day.' },
      { french: 'Elle travaille dans un hôpital.', english: 'She works in a hospital.' },
    ],
    examUsage: 'Regular -er verb, frequently tested in conjugation exercises.',
  },
  {
    id: 'g10s1_04', french: 'l\'école', english: 'the school',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G10S1', unit: 2, tags: ['school', 'education'],
    exampleSentences: [
      { french: 'Je vais à l\'école à huit heures.', english: 'I go to school at eight o\'clock.' },
      { french: 'L\'école est près de la maison.', english: 'The school is near the house.' },
    ],
    examUsage: 'Essential for describing daily routine and school life topics.',
  },
  {
    id: 'g10s1_05', french: 'habiter', english: 'to live (reside)',
    partOfSpeech: 'verb', grade: 'G10S1', unit: 3, tags: ['housing', 'verbs'],
    exampleSentences: [
      { french: 'J\'habite à Paris.', english: 'I live in Paris.' },
      { french: 'Où habitez-vous ?', english: 'Where do you live?' },
    ],
    examUsage: 'Used in oral exams when describing where you live.',
  },
  {
    id: 'g10s1_06', french: 'aimer', english: 'to like / to love',
    partOfSpeech: 'verb', grade: 'G10S1', unit: 3, tags: ['emotions', 'verbs'],
    exampleSentences: [
      { french: 'J\'aime le chocolat.', english: 'I like chocolate.' },
      { french: 'Il aime beaucoup sa mère.', english: 'He loves his mother very much.' },
    ],
    examUsage: 'Key verb for expressing preferences and opinions in essays.',
  },
  {
    id: 'g10s1_07', french: 'un ami', english: 'a friend (male)',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G10S1', unit: 4, tags: ['relationships', 'basic'],
    exampleSentences: [
      { french: 'Mon meilleur ami s\'appelle Lucas.', english: 'My best friend is called Lucas.' },
      { french: 'J\'ai beaucoup d\'amis à l\'école.', english: 'I have many friends at school.' },
    ],
    examUsage: 'Used in descriptive writing about friendships and social life.',
  },
  {
    id: 'g10s1_08', french: 'comprendre', english: 'to understand',
    partOfSpeech: 'verb', grade: 'G10S1', unit: 4, tags: ['communication', 'irregular-verbs'],
    exampleSentences: [
      { french: 'Je ne comprends pas la question.', english: 'I don\'t understand the question.' },
      { french: 'Comprenez-vous le français ?', english: 'Do you understand French?' },
    ],
    examUsage: 'Irregular verb tested frequently. Essential for comprehension tasks.',
  },

  // ========== G10 S2 — Daily Life & Environment ==========
  {
    id: 'g10s2_01', french: 'la nourriture', english: 'food',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G10S2', unit: 1, tags: ['food', 'daily-life'],
    exampleSentences: [
      { french: 'La nourriture française est délicieuse.', english: 'French food is delicious.' },
      { french: 'Il faut manger de la nourriture saine.', english: 'One must eat healthy food.' },
    ],
    examUsage: 'Central to topics on French cuisine and healthy eating essays.',
  },
  {
    id: 'g10s2_02', french: 'acheter', english: 'to buy',
    partOfSpeech: 'verb', grade: 'G10S2', unit: 1, tags: ['shopping', 'verbs'],
    exampleSentences: [
      { french: 'Je vais acheter du pain.', english: 'I\'m going to buy some bread.' },
      { french: 'Elle achète des vêtements au marché.', english: 'She buys clothes at the market.' },
    ],
    examUsage: 'Stem-changing verb (-eter). Tested in shopping role-play scenarios.',
  },
  {
    id: 'g10s2_03', french: 'le quartier', english: 'the neighborhood',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G10S2', unit: 2, tags: ['city', 'places'],
    exampleSentences: [
      { french: 'Mon quartier est très calme.', english: 'My neighborhood is very quiet.' },
      { french: 'Il y a un parc dans notre quartier.', english: 'There is a park in our neighborhood.' },
    ],
    examUsage: 'Used in describing your area. Common in written production tasks.',
  },
  {
    id: 'g10s2_04', french: 'le temps', english: 'the weather / time',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G10S2', unit: 2, tags: ['weather', 'time'],
    exampleSentences: [
      { french: 'Quel temps fait-il aujourd\'hui ?', english: 'What\'s the weather like today?' },
      { french: 'Je n\'ai pas le temps de sortir.', english: 'I don\'t have time to go out.' },
    ],
    examUsage: 'Dual meaning tested in reading comprehension. Weather is a key oral topic.',
  },
  {
    id: 'g10s2_05', french: 'voyager', english: 'to travel',
    partOfSpeech: 'verb', grade: 'G10S2', unit: 3, tags: ['travel', 'verbs'],
    exampleSentences: [
      { french: 'J\'adore voyager en train.', english: 'I love traveling by train.' },
      { french: 'Nous voyageons en France chaque été.', english: 'We travel to France every summer.' },
    ],
    examUsage: 'Key verb for travel and holiday topics. Note spelling change with -ger verbs.',
  },
  {
    id: 'g10s2_06', french: 'content(e)', english: 'happy / pleased',
    partOfSpeech: 'adjective', grade: 'G10S2', unit: 3, tags: ['emotions', 'adjectives'],
    exampleSentences: [
      { french: 'Je suis très content de te voir.', english: 'I\'m very happy to see you.' },
      { french: 'Elle est contente de son résultat.', english: 'She is pleased with her result.' },
    ],
    examUsage: 'Common adjective in expressing feelings. Agreement tested in grammar.',
  },
  {
    id: 'g10s2_07', french: 'la santé', english: 'health',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G10S2', unit: 4, tags: ['health', 'wellbeing'],
    exampleSentences: [
      { french: 'La santé est plus importante que l\'argent.', english: 'Health is more important than money.' },
      { french: 'Il faut prendre soin de sa santé.', english: 'One must take care of one\'s health.' },
    ],
    examUsage: 'Central to health and wellbeing essay prompts.',
  },
  {
    id: 'g10s2_08', french: 'le magasin', english: 'the shop / store',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G10S2', unit: 4, tags: ['shopping', 'places'],
    exampleSentences: [
      { french: 'Le magasin ferme à dix-huit heures.', english: 'The shop closes at six o\'clock.' },
      { french: 'Il y a un grand magasin en ville.', english: 'There is a department store in town.' },
    ],
    examUsage: 'Used in shopping dialogues and describing town features.',
  },

  // ========== G11 S1 — Media & Technology ==========
  {
    id: 'g11s1_01', french: 'les médias', english: 'the media',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G11S1', unit: 1, tags: ['media', 'society'],
    exampleSentences: [
      { french: 'Les médias influencent l\'opinion publique.', english: 'The media influence public opinion.' },
      { french: 'Il faut être critique envers les médias.', english: 'One must be critical towards the media.' },
    ],
    examUsage: 'Key topic for argumentative essays on media influence.',
  },
  {
    id: 'g11s1_02', french: 'l\'environnement', english: 'the environment',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G11S1', unit: 1, tags: ['environment', 'nature'],
    exampleSentences: [
      { french: 'Nous devons protéger l\'environnement.', english: 'We must protect the environment.' },
      { french: 'L\'environnement est menacé par la pollution.', english: 'The environment is threatened by pollution.' },
    ],
    examUsage: 'Essential for environmental discussion essays and debates.',
  },
  {
    id: 'g11s1_03', french: 'développer', english: 'to develop',
    partOfSpeech: 'verb', grade: 'G11S1', unit: 2, tags: ['progress', 'verbs'],
    exampleSentences: [
      { french: 'Il faut développer les énergies renouvelables.', english: 'We must develop renewable energies.' },
      { french: 'La ville se développe rapidement.', english: 'The city is developing rapidly.' },
    ],
    examUsage: 'Used in essays about development and progress.',
  },
  {
    id: 'g11s1_04', french: 'la technologie', english: 'technology',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G11S1', unit: 2, tags: ['technology', 'modern'],
    exampleSentences: [
      { french: 'La technologie change notre vie quotidienne.', english: 'Technology changes our daily life.' },
      { french: 'Les jeunes utilisent beaucoup la technologie.', english: 'Young people use technology a lot.' },
    ],
    examUsage: 'Central to technology and society discussion topics.',
  },
  {
    id: 'g11s1_05', french: 'protéger', english: 'to protect',
    partOfSpeech: 'verb', grade: 'G11S1', unit: 3, tags: ['environment', 'verbs'],
    exampleSentences: [
      { french: 'Il est important de protéger la nature.', english: 'It is important to protect nature.' },
      { french: 'Le gouvernement protège les droits des citoyens.', english: 'The government protects citizens\' rights.' },
    ],
    examUsage: 'Stem-changing verb. Frequently appears in environment topics.',
  },
  {
    id: 'g11s1_06', french: 'un réseau social', english: 'a social network',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G11S1', unit: 3, tags: ['technology', 'media'],
    exampleSentences: [
      { french: 'Les réseaux sociaux sont très populaires.', english: 'Social networks are very popular.' },
      { french: 'Il passe trop de temps sur les réseaux sociaux.', english: 'He spends too much time on social networks.' },
    ],
    examUsage: 'Modern vocabulary tested in discussions about digital culture.',
  },
  {
    id: 'g11s1_07', french: 'cependant', english: 'however',
    partOfSpeech: 'adverb', grade: 'G11S1', unit: 4, tags: ['connectors', 'essay-writing'],
    exampleSentences: [
      { french: 'La technologie est utile, cependant elle peut être dangereuse.', english: 'Technology is useful, however it can be dangerous.' },
      { french: 'Cependant, il existe des solutions.', english: 'However, there are solutions.' },
    ],
    examUsage: 'Essential connector for argumentative writing. Shows sophistication.',
  },
  {
    id: 'g11s1_08', french: 'selon', english: 'according to',
    partOfSpeech: 'other', grade: 'G11S1', unit: 4, tags: ['connectors', 'essay-writing'],
    exampleSentences: [
      { french: 'Selon les experts, le climat change.', english: 'According to experts, the climate is changing.' },
      { french: 'Selon moi, c\'est une bonne idée.', english: 'In my opinion, it\'s a good idea.' },
    ],
    examUsage: 'Key expression for citing sources and expressing opinions.',
  },

  // ========== G11 S2 — Culture & Heritage ==========
  {
    id: 'g11s2_01', french: 'la culture', english: 'culture',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G11S2', unit: 1, tags: ['culture', 'society'],
    exampleSentences: [
      { french: 'La culture française est riche et diversifiée.', english: 'French culture is rich and diverse.' },
      { french: 'Il faut respecter toutes les cultures.', english: 'One must respect all cultures.' },
    ],
    examUsage: 'Central to cultural identity and diversity essay topics.',
  },
  {
    id: 'g11s2_02', french: 'le patrimoine', english: 'heritage',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G11S2', unit: 1, tags: ['culture', 'history'],
    exampleSentences: [
      { french: 'Le patrimoine culturel doit être préservé.', english: 'Cultural heritage must be preserved.' },
      { french: 'Paris possède un patrimoine architectural exceptionnel.', english: 'Paris has an exceptional architectural heritage.' },
    ],
    examUsage: 'Advanced vocabulary for discussing French heritage and monuments.',
  },
  {
    id: 'g11s2_03', french: 'découvrir', english: 'to discover',
    partOfSpeech: 'verb', grade: 'G11S2', unit: 2, tags: ['exploration', 'irregular-verbs'],
    exampleSentences: [
      { french: 'J\'ai découvert un nouveau restaurant.', english: 'I discovered a new restaurant.' },
      { french: 'Voyager permet de découvrir d\'autres cultures.', english: 'Traveling allows one to discover other cultures.' },
    ],
    examUsage: 'Irregular verb (like ouvrir). Used in travel and culture contexts.',
  },
  {
    id: 'g11s2_04', french: 'apprécier', english: 'to appreciate / to enjoy',
    partOfSpeech: 'verb', grade: 'G11S2', unit: 2, tags: ['opinions', 'verbs'],
    exampleSentences: [
      { french: 'J\'apprécie beaucoup la musique classique.', english: 'I greatly appreciate classical music.' },
      { french: 'Les touristes apprécient la cuisine locale.', english: 'Tourists enjoy the local cuisine.' },
    ],
    examUsage: 'Used to express nuanced appreciation. Higher register than "aimer".',
  },
  {
    id: 'g11s2_05', french: 'l\'égalité', english: 'equality',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G11S2', unit: 3, tags: ['society', 'values'],
    exampleSentences: [
      { french: 'L\'égalité est un principe fondamental.', english: 'Equality is a fundamental principle.' },
      { french: 'Liberté, égalité, fraternité.', english: 'Liberty, equality, fraternity.' },
    ],
    examUsage: 'Core French Republican value. Essential for society and politics topics.',
  },
  {
    id: 'g11s2_06', french: 'en revanche', english: 'on the other hand',
    partOfSpeech: 'phrase', grade: 'G11S2', unit: 3, tags: ['connectors', 'essay-writing'],
    exampleSentences: [
      { french: 'Le film est beau. En revanche, l\'histoire est faible.', english: 'The film is beautiful. On the other hand, the story is weak.' },
      { french: 'En revanche, certains pensent le contraire.', english: 'On the other hand, some think the opposite.' },
    ],
    examUsage: 'Sophisticated connector that impresses examiners in argumentative writing.',
  },
  {
    id: 'g11s2_07', french: 'la diversité', english: 'diversity',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G11S2', unit: 4, tags: ['society', 'values'],
    exampleSentences: [
      { french: 'La diversité culturelle enrichit la société.', english: 'Cultural diversity enriches society.' },
      { french: 'Il faut promouvoir la diversité.', english: 'We must promote diversity.' },
    ],
    examUsage: 'Key term for multicultural society discussion topics.',
  },
  {
    id: 'g11s2_08', french: 'appartenir', english: 'to belong',
    partOfSpeech: 'verb', grade: 'G11S2', unit: 4, tags: ['identity', 'irregular-verbs'],
    exampleSentences: [
      { french: 'Ce livre appartient à Marie.', english: 'This book belongs to Marie.' },
      { french: 'Il est important d\'appartenir à une communauté.', english: 'It is important to belong to a community.' },
    ],
    examUsage: 'Irregular verb (like tenir). Used in identity and belonging essays.',
  },

  // ========== G12 — Advanced Topics ==========
  {
    id: 'g12_01', french: 'la mondialisation', english: 'globalization',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G12', unit: 1, tags: ['global', 'economics'],
    exampleSentences: [
      { french: 'La mondialisation a transformé l\'économie mondiale.', english: 'Globalization has transformed the world economy.' },
      { french: 'Les effets de la mondialisation sont controversés.', english: 'The effects of globalization are controversial.' },
    ],
    examUsage: 'High-frequency exam term. Central to global issues discussion.',
  },
  {
    id: 'g12_02', french: 'l\'inégalité', english: 'inequality',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G12', unit: 1, tags: ['society', 'politics'],
    exampleSentences: [
      { french: 'L\'inégalité sociale reste un problème majeur.', english: 'Social inequality remains a major problem.' },
      { french: 'Il faut lutter contre les inégalités.', english: 'We must fight against inequalities.' },
    ],
    examUsage: 'Essential for discussing social justice and societal issues.',
  },
  {
    id: 'g12_03', french: 'analyser', english: 'to analyze',
    partOfSpeech: 'verb', grade: 'G12', unit: 2, tags: ['academic', 'verbs'],
    exampleSentences: [
      { french: 'Il faut analyser ce texte en détail.', english: 'One must analyze this text in detail.' },
      { french: 'Analysez les arguments de l\'auteur.', english: 'Analyze the author\'s arguments.' },
    ],
    examUsage: 'Command verb in exam questions. Critical for literary analysis.',
  },
  {
    id: 'g12_04', french: 'argumenter', english: 'to argue / to make a case',
    partOfSpeech: 'verb', grade: 'G12', unit: 2, tags: ['academic', 'debate'],
    exampleSentences: [
      { french: 'Il faut savoir argumenter de manière logique.', english: 'One must know how to argue logically.' },
      { french: 'L\'auteur argumente en faveur de la liberté.', english: 'The author argues in favor of freedom.' },
    ],
    examUsage: 'Key skill tested in essay writing. Shows critical thinking ability.',
  },
  {
    id: 'g12_05', french: 'le progrès', english: 'progress',
    gender: 'masculine', partOfSpeech: 'noun', grade: 'G12', unit: 3, tags: ['science', 'society'],
    exampleSentences: [
      { french: 'Le progrès scientifique avance rapidement.', english: 'Scientific progress advances rapidly.' },
      { french: 'Le progrès n\'est pas toujours positif.', english: 'Progress is not always positive.' },
    ],
    examUsage: 'Core exam theme. Often paired with science and ethics debates.',
  },
  {
    id: 'g12_06', french: 'néanmoins', english: 'nevertheless',
    partOfSpeech: 'adverb', grade: 'G12', unit: 3, tags: ['connectors', 'advanced'],
    exampleSentences: [
      { french: 'Le projet est ambitieux, néanmoins réalisable.', english: 'The project is ambitious, nevertheless achievable.' },
      { french: 'Néanmoins, des défis importants persistent.', english: 'Nevertheless, significant challenges persist.' },
    ],
    examUsage: 'High-register connector. Demonstrates advanced writing proficiency.',
  },
  {
    id: 'g12_07', french: 'la conscience', english: 'consciousness / awareness',
    gender: 'feminine', partOfSpeech: 'noun', grade: 'G12', unit: 4, tags: ['philosophy', 'advanced'],
    exampleSentences: [
      { french: 'La prise de conscience écologique est nécessaire.', english: 'Ecological awareness is necessary.' },
      { french: 'Il faut avoir la conscience de ses actes.', english: 'One must be aware of one\'s actions.' },
    ],
    examUsage: 'Philosophical term used in literature and ethics discussions.',
  },
  {
    id: 'g12_08', french: 'en fin de compte', english: 'ultimately / in the end',
    partOfSpeech: 'phrase', grade: 'G12', unit: 4, tags: ['connectors', 'conclusion'],
    exampleSentences: [
      { french: 'En fin de compte, c\'est une question de choix.', english: 'Ultimately, it\'s a matter of choice.' },
      { french: 'En fin de compte, la solution dépend de nous.', english: 'In the end, the solution depends on us.' },
    ],
    examUsage: 'Conclusion phrase that elevates essay quality. Use in final paragraph.',
  },
];
