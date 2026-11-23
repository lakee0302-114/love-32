// Sri Lankan G.C.E. Advanced Level (A/L) Question Bank & Formula Cards
// Covers Physical Science (Maths), Bio Science, Commerce, and ICT

export const AL_SUBJECTS = [
  { id: 'all', name: 'All Subjects', icon: '📚', color: 'from-purple-500 to-indigo-600' },
  { id: 'maths', name: 'Combined Maths', icon: '📐', color: 'from-blue-500 to-cyan-600' },
  { id: 'physics', name: 'Physics', icon: '⚡', color: 'from-amber-500 to-rose-600' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'from-emerald-500 to-teal-600' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'from-green-500 to-emerald-700' },
  { id: 'ict', name: 'ICT', icon: '💻', color: 'from-cyan-500 to-blue-700' },
  { id: 'commerce', name: 'Commerce & Econ', icon: '📊', color: 'from-orange-500 to-amber-700' },
];

export const AL_QUESTIONS = [
  // COMBINED MATHS
  {
    id: 'm1',
    subject: 'maths',
    topic: 'Trigonometry',
    difficulty: 'Medium',
    question: 'sin(2θ) හි නිවැරදි ත්‍රිකෝණමිතික ප්‍රසාරණය කුමක්ද? (What is the expansion of sin(2θ)?)',
    options: [
      '2 sin θ cos θ',
      'cos² θ - sin² θ',
      '2 tan θ / (1 - tan² θ)',
      'sin² θ + cos² θ'
    ],
    correct: 0,
    explanation: 'sin(2θ) = 2 sin θ cos θ වේ. cos² θ - sin² θ යනු cos(2θ) හි අගයයි.',
  },
  {
    id: 'm2',
    subject: 'maths',
    topic: 'Calculus / Integration',
    difficulty: 'Medium',
    question: '∫ (1 / x) dx (x > 0) හි අනුකලනය කුමක්ද? (What is the integral of 1/x?)',
    options: [
      'ln(x) + C',
      '-1 / x² + C',
      'x + C',
      'e^x + C'
    ],
    correct: 0,
    explanation: 'd/dx [ln(x)] = 1/x බැවින්, ∫ (1/x) dx = ln(x) + C වේ.',
  },
  {
    id: 'm3',
    subject: 'maths',
    topic: 'Quadratic Equations',
    difficulty: 'Easy',
    question: 'ax² + bx + c = 0 සමීකරණයේ මූල α සහ β නම්, මූලයන්හි ඓක්‍යය (α + β) වන්නේ:',
    options: [
      '-b / a',
      'c / a',
      'b / a',
      '-c / a'
    ],
    correct: 0,
    explanation: 'වර්ගජ සමීකරණයක මූලයන්ගේ ඓක්‍යය α + β = -b / a වන අතර ගුණිතය αβ = c / a වේ.',
  },
  {
    id: 'm4',
    subject: 'maths',
    topic: 'Vectors',
    difficulty: 'Medium',
    question: 'a සහ b ශුන්‍ය නොවන දෛශික දෙකක් නම්, a · b = 0 වන විට දෛශික අතර සම්බන්ධය කුමක්ද?',
    options: [
      'a සහ b එකිනෙකට ලම්බ වේ (Perpendicular)',
      'a සහ b සමාන්තර වේ (Parallel)',
      'a සහ b සමාන වේ',
      'a සහ b ප්‍රතිවිරුද්ධ දිශා වේ'
    ],
    correct: 0,
    explanation: 'අදිශ ගුණිතය a · b = |a||b|cos(θ) වේ. cos(90°) = 0 බැවින් දෛශික දෙක ලම්බ වන විට a · b = 0 වේ.',
  },
  {
    id: 'm5',
    subject: 'maths',
    topic: 'Coordinate Geometry',
    difficulty: 'Hard',
    question: '(x₁, y₁) ලක්ෂ්‍යයේ සිට ax + by + c = 0 සරල රේඛාවට ඇති ලම්බ දුර වන්නේ:',
    options: [
      '|ax₁ + by₁ + c| / √(a² + b²)',
      '|ax₁ + by₁ + c| / (a² + b²)',
      '(ax₁ + by₁) / √(a² + b²)',
      '|a² + b²| / √(ax₁ + by₁ + c)'
    ],
    correct: 0,
    explanation: 'සරල රේඛාවකට ලක්ෂ්‍යයක සිට ලම්බ දුර සූත්‍රය d = |ax₁ + by₁ + c| / √(a² + b²) වේ.',
  },

  // PHYSICS
  {
    id: 'p1',
    subject: 'physics',
    topic: 'Mechanics (චලිතය)',
    difficulty: 'Medium',
    question: 'ප්‍රවේගය v සහ අරය r වන වෘත්තාකාර මාර්ගයක ගමන් කරන ස්කන්ධය m වූ වස්තුවක් මත ක්‍රියාකරන කේන්ද්‍රාභිසාරී බලය කුමක්ද?',
    options: [
      'm v² / r',
      'm v / r²',
      'm v r',
      'm v² r'
    ],
    correct: 0,
    explanation: 'කේන්ද්‍රාභිසාරී ත්වරණය a = v² / r වන බැවින් නිව්ටන්ගේ දෙවන නියමයෙන් F = ma = m v² / r වේ.',
  },
  {
    id: 'p2',
    subject: 'physics',
    topic: 'Current Electricity (ධාරා විද්‍යුතය)',
    difficulty: 'Easy',
    question: 'ප්‍රතිරෝධය R වූ ඒකාකාර සන්නායක කම්බියක දිග දෙගුණ කර හරස්කඩ වර්ගඵලය නොවෙනස්ව තැබූ විට නව ප්‍රතිරෝධය කොපමණද?',
    options: [
      '2R',
      'R / 2',
      '4R',
      'R'
    ],
    correct: 0,
    explanation: 'R = ρ(L / A) බැවින් ප්‍රතිරෝධය සන්නායකයේ දිගට (L) අනුලෝමව සමානුපාතික වේ. දිග දෙගුණ වුවහොත් ප්‍රතිරෝධය 2R වේ.',
  },
  {
    id: 'p3',
    subject: 'physics',
    topic: 'Waves & Optics (තරංග & ආලෝකය)',
    difficulty: 'Medium',
    question: 'නාභීය දුර 20 cm වන උත්තල කාචයක බලය (Power) කොපමණද?',
    options: [
      '+5.0 D (Diopters)',
      '+0.05 D',
      '-5.0 D',
      '+20 D'
    ],
    correct: 0,
    explanation: 'කාචයක බලය P = 1 / f (මීටර් වලින්). f = 20 cm = 0.2 m. එබැවින් P = 1 / 0.2 = +5 D වේ.',
  },
  {
    id: 'p4',
    subject: 'physics',
    topic: 'Thermodynamics (තාපය)',
    difficulty: 'Hard',
    question: 'තාපගති විද්‍යාවේ පළමු නියමය (First Law of Thermodynamics) ප්‍රකාශ කරන්නේ කුමන සංරක්ෂණ නියමයද?',
    options: [
      'ශක්ති සංරක්ෂණ නියමය (Conservation of Energy)',
      'ගම්‍යතා සංරක්ෂණ නියමය',
      'ස්කන්ධ සංරක්ෂණ නියමය',
      'ආරෝපණ සංරක්ෂණ නියමය'
    ],
    correct: 0,
    explanation: 'ΔQ = ΔU + ΔW මගින් පද්ධතියකට සපයන තාපය අභ්‍යන්තර ශක්තිය සහ කරන ලද කාර්යය අතර බෙදී යන ආකාරය විස්තර කරමින් ශක්ති සංරක්ෂණය පෙන්වයි.',
  },
  {
    id: 'p5',
    subject: 'physics',
    topic: 'Viscosity (දුස්ස්‍රාවිතාව)',
    difficulty: 'Medium',
    question: 'දුස්ස්‍රාවී ද්‍රවයක චලනය වන r අරය සහිත කුඩා ගෝලයක අන්ත ප්‍රවේගය (Terminal Velocity) අරය (r) මත රඳා පවතින්නේ කෙසේද?',
    options: [
      'r² ට අනුලෝමව (v_t ∝ r²)',
      'r ට අනුලෝමව (v_t ∝ r)',
      'r ට ප්‍රතිලෝමව (v_t ∝ 1/r)',
      'r³ ට අනුලෝමව (v_t ∝ r³)'
    ],
    correct: 0,
    explanation: 'අන්ත ප්‍රවේගය v_t = 2r²(ρ - σ)g / 9η වේ. එබැවින් v_t ∝ r² වේ.',
  },

  // CHEMISTRY
  {
    id: 'c1',
    subject: 'chemistry',
    topic: 'Chemical Bonding (බන්ධන)',
    difficulty: 'Medium',
    question: 'මීතේන් (CH₄) අණුවේ මධ්‍ය C පරමාණුවේ මුහුම්කරණය සහ අණුවේ හැඩය කුමක්ද?',
    options: [
      'sp³, චතුස්තලීය (Tetrahedral, 109.5°)',
      'sp², ත්‍රිකෝණාකාර තලීය (120°)',
      'sp, රේඛීය (180°)',
      'sp³d, ත්‍රිකෝණාකාර ද්වීපිරමිඩීය'
    ],
    correct: 0,
    explanation: 'CH₄ හි C වටා බන්ධන යුගල 4ක් ඇති අතර තනි යුගල නැත. එබැවින් sp³ මුහුම්කරණය හා චතුස්තලීය හැඩය (109.5°) ගනී.',
  },
  {
    id: 'c2',
    subject: 'chemistry',
    topic: 'Periodic Table (ආවර්තිතා වගුව)',
    difficulty: 'Easy',
    question: 'පෝලිං පරිමාණයේ වැඩිම විද්‍යුත් සෘණතාවක් (Electronegativity) සහිත මූලද්‍රව්‍යය කුමක්ද?',
    options: [
      'ෆ්ලෝරීන් (F - 4.0)',
      'ඔක්සිජන් (O)',
      'ක්ලෝරීන් (Cl)',
      'නයිට්‍රජන් (N)'
    ],
    correct: 0,
    explanation: 'ෆ්ලෝරීන් (F) යනු පෝලිං පරිමාණයේ උපරිම විද්‍යුත් සෘණතාවය (4.0) දරන මූලද්‍රව්‍යය වේ.',
  },
  {
    id: 'c3',
    subject: 'chemistry',
    topic: 'Organic Chemistry (කාබනික රසායනය)',
    difficulty: 'Hard',
    question: 'ප්‍රොපීන් (CH₃-CH=CH₂) වෙත HBr එකතු කිරීමේදී ප්‍රධාන ඵලය කුමක්ද?',
    options: [
      '2-bromopropane (CH₃-CHBr-CH₃)',
      '1-bromopropane (CH₃-CH₂-CH₂Br)',
      '1,2-dibromopropane',
      'Cyclopropane'
    ],
    correct: 0,
    explanation: 'මාර්කොව්නිකොව් නියමය (Markovnikov\'s rule) අනුව හයිඩ්‍රජන් පරමාණුව වැඩිම H සංඛ්‍යාවක් ඇති C පරමාණුවට එකතු වන බැවින් 2-බ්‍රෝමෝප්‍රොපේන් ප්‍රධාන ඵලය වේ.',
  },
  {
    id: 'c4',
    subject: 'chemistry',
    topic: 'Equilibrium (රසායනික සමතුලිතතාව)',
    difficulty: 'Medium',
    question: '25°C දී පිරිසිදු ජලයේ pH අගය 7 වේ. උෂ්ණත්වය 60°C දක්වා වැඩි කළ විට ජලයේ Kw සහ pH වලට සිදුවන්නේ කුමක්ද?',
    options: [
      'Kw වැඩිවේ, pH අගය 7 ට වඩා අඩුවේ (නමුත් ජලය උදාසීනයි)',
      'Kw අඩුවේ, pH වැඩිවේ',
      'Kw සහ pH නොවෙනස්ව පවතී',
      'ජලය භාස්මික වේ'
    ],
    correct: 0,
    explanation: 'ජලයේ ස්වයං අයනීකරණය තාප අවශෝෂක ක්‍රියාවලියකි. උෂ්ණත්වය වැඩි වන විට Kw වැඩි වී [H⁺] වැඩි වන බැවින් pH < 7 වේ, නමුත් [H⁺] = [OH⁻] බැවින් ජලය තවමත් උදාසීන වේ.',
  },

  // BIOLOGY
  {
    id: 'b1',
    subject: 'biology',
    topic: 'Cell Biology (සෛල ජීව විද්‍යාව)',
    difficulty: 'Easy',
    question: 'සෛලීය ශ්වසනය මගින් ATP නිෂ්පාදනය කිරීම සඳහා ප්‍රධාන වශයෙන් දායක වන සෛල ඉන්ද්‍රයිකාව කුමක්ද?',
    options: [
      'මයිටොකොන්ඩ්‍රියා (Mitochondria)',
      'රයිබොසෝම (Ribosomes)',
      'ගොල්ගි දේහ (Golgi apparatus)',
      'හරිතලව (Chloroplasts)'
    ],
    correct: 0,
    explanation: 'මයිටොකොන්ඩ්‍රියාව සෛලයේ බලගාරය (Powerhouse) ලෙස හඳුන්වනු ලබන්නේ එය aerobic respiration මගින් ATP නිපදවන බැවිනි.',
  },
  {
    id: 'b2',
    subject: 'biology',
    topic: 'Genetics (ප්‍රවේණිය)',
    difficulty: 'Medium',
    question: 'මෙන්ඩල්ගේ ඒක මුහුම්කරණයේ (Monohybrid cross) F2 පරම්පරාවේ රූපකාර්ශික අනුපාතය (Phenotypic ratio) කුමක්ද?',
    options: [
      '3 : 1',
      '1 : 2 : 1',
      '9 : 3 : 3 : 1',
      '1 : 1'
    ],
    correct: 0,
    explanation: 'F2 පරම්පරාවේ රූපකාර්ශික අනුපාතය ප්‍රමුඛ : නිලීන = 3 : 1 වන අතර, ප්‍රවේණිකාර්ශික අනුපාතය 1 : 2 : 1 වේ.',
  },
  {
    id: 'b3',
    subject: 'biology',
    topic: 'Human Physiology (වෘක්ක ක්‍රියාකාරීත්වය)',
    difficulty: 'Hard',
    question: 'වෘක්කයේ දුරස්ථ සංවලිත නාලිකාවෙන් සහ සංග්‍රාහක නාලිකාවෙන් ජලය නැවත අවශෝෂණය උත්තේජනය කරන හෝමෝනය කුමක්ද?',
    options: [
      'ADH (වාසොප්‍රෙසින් - Anti-Diuretic Hormone)',
      'ඉන්සියුලින්',
      'තයිරොක්සින්',
      'ග්ලූකොගොන්'
    ],
    correct: 0,
    explanation: 'පසුපස පිටියුටරියෙන් ස්‍රාවය වන ADH හෝමෝනය ජලය නැවත අවශෝෂණය වැඩි කර මුත්‍ර පරිමාව අඩු කරයි.',
  },

  // ICT
  {
    id: 'i1',
    subject: 'ict',
    topic: 'Logic Gates & Boolean Algebra',
    difficulty: 'Medium',
    question: 'ඩිමෝර්ගන්ගේ නියමයට (De Morgan\'s Law) අනුව NOT(A AND B) සමාන වන්නේ:',
    options: [
      'NOT(A) OR NOT(B)  (A\' + B\')',
      'NOT(A) AND NOT(B)  (A\' . B\')',
      'A OR B',
      'A AND B'
    ],
    correct: 0,
    explanation: '(A · B)\' = A\' + B\' සහ (A + B)\' = A\' · B\' යනු ඩිමෝර්ගන්ගේ ප්‍රමේයයන් වේ.',
  },
  {
    id: 'i2',
    subject: 'ict',
    topic: 'Programming / Python',
    difficulty: 'Easy',
    question: 'Python ක්‍රමලේඛන භාෂාවේ ශ්‍රිතයක් (Function) අර්ථ දැක්වීමට භාවිතා කරන නිවැරදි යතුරු පදය (Keyword) කුමක්ද?',
    options: [
      'def',
      'function',
      'func',
      'define'
    ],
    correct: 0,
    explanation: 'Python හි function එකක් ලියන්නේ "def function_name(params):" ආකාරයෙනි.',
  },

  // COMMERCE
  {
    id: 'com1',
    subject: 'commerce',
    topic: 'Accounting Equation',
    difficulty: 'Easy',
    question: 'මූලික ගිණුම්කරණ සමීකරණය (Basic Accounting Equation) නිවැරදිව දක්වා ඇත්තේ කුමන පිළිතුරේද?',
    options: [
      'වත්කම් = වගකීම් + හිමිකම (Assets = Liabilities + Equity)',
      'වත්කම් + වගකීම් = හිමිකම',
      'හිමිකම = වත්කම් + වගකීම්',
      'ලාභය = ආදායම + වියදම'
    ],
    correct: 0,
    explanation: 'ගිණුම්කරණයේ මූලික සමීකරණය වන්නේ වත්කම් (A) = වගකීම් (L) + හිමිකම (E) යන්නයි.',
  },
];

// High-Yield Formula Cards for Flash Revision
export const AL_FORMULA_CARDS = [
  {
    id: 'fc1',
    subject: 'physics',
    title: 'රේඛීය චලිත සමීකරණ (Linear Motion)',
    badge: 'Mechanics',
    front: 'ඒකාකාර ත්වරණයෙන් චලිත වන වස්තුවක මූලික චලිත සමීකරණ 4 මොනවාද?',
    back: [
      '1. v = u + at',
      '2. s = ut + ½ at²',
      '3. v² = u² + 2as',
      '4. s = [(u + v) / 2] t'
    ],
    tip: 'ත්වරණය (a) නියත වූ විට පමණක් වලංගු වේ.'
  },
  {
    id: 'fc2',
    subject: 'physics',
    title: 'ධාරා විද්‍යුතය - ඕම්ගේ නියමය සහ බලය',
    badge: 'Electricity',
    front: 'විද්‍යුත් විභව අන්තරය (V), ධාරාව (I), සහ ප්‍රතිරෝධය (R) අතර සම්බන්ධතා සහ විද්‍යුත් ක්ෂමතාවය (P):',
    back: [
      '• V = I R',
      '• R = ρ (L / A)',
      '• P = V I = I² R = V² / R',
      '• ශක්තිය E = P t = V I t'
    ],
    tip: 'ρ යනු සන්නායකයේ ප්‍රතිරෝධකතාවයි. උෂ්ණත්වය වැඩි වන විට ලෝහවල ρ වැඩිවේ.'
  },
  {
    id: 'fc3',
    subject: 'maths',
    title: 'ත්‍රිකෝණමිතික මූලික සූත්‍ර (Trig Identities)',
    badge: 'Pure Maths',
    front: 'sin(A ± B), cos(A ± B) සහ tan(A ± B) ප්‍රසාරණ:',
    back: [
      '• sin(A ± B) = sin A cos B ± cos A sin B',
      '• cos(A ± B) = cos A cos B ∓ sin A sin B',
      '• tan(A ± B) = (tan A ± tan B) / (1 ∓ tan A tan B)',
      '• sin² θ + cos² θ = 1, sec² θ - tan² θ = 1'
    ],
    tip: 'cos(A + B) හි මැද සලකුණ සෘණ (-) වන බව විශේෂයෙන් මතක තබා ගන්න.'
  },
  {
    id: 'fc4',
    subject: 'maths',
    title: 'අවකලන ප්‍රධාන රීති (Differentiation Rules)',
    badge: 'Calculus',
    front: 'ගුණිත රීතිය, භාග රීතිය සහ දාම රීතිය:',
    back: [
      '• Product Rule: d/dx(uv) = u(dv/dx) + v(du/dx)',
      '• Quotient Rule: d/dx(u/v) = [v(du/dx) - u(dv/dx)] / v²',
      '• Chain Rule: dy/dx = (dy/du) · (du/dx)',
      '• d/dx(sin x) = cos x, d/dx(cos x) = -sin x'
    ],
    tip: 'Quotient rule හි හරය v² වන අතර ලවයේ v(du/dx) මුලින්ම ලියන්න.'
  },
  {
    id: 'fc5',
    subject: 'chemistry',
    title: 'වායු නියම සහ මවුල ගණනය (Gas Laws)',
    badge: 'Physical Chem',
    front: 'පරිපූර්ණ වායු සමීකරණය සහ සාන්ද්‍රණ සූත්‍ර:',
    back: [
      '• P V = n R T  (R = 8.314 J K⁻¹ mol⁻¹)',
      '• මවුල ගණන n = m / M = N / N_A',
      '• සාන්ද්‍රණය C = n / V = m / (M · V)',
      '• pH = -log₁₀[H⁺], pOH = -log₁₀[OH⁻]',
      '• pH + pOH = 14 (25°C දී)'
    ],
    tip: 'PV = nRT භාවිතා කිරීමේදී T නිරපේක්ෂ උෂ්ණත්වය කෙල්වින් (K) වලින් ආදේශ කරන්න (K = °C + 273.15).'
  },
  {
    id: 'fc6',
    subject: 'biology',
    title: 'සෛලීය ශ්වසනයේ ප්‍රධාන අදියර (Cellular Respiration)',
    badge: 'Physiology',
    front: 'වායුගෝලීය ශ්වසනයේ (Aerobic Respiration) අදියර 4 සහ සිදුවන ස්ථාන:',
    back: [
      '1. ග්ලයිකොලිසිය (Glycolysis) - සෛල ප්ලාස්මයේදී (ATP 2, NADH 2)',
      '2. සබැඳි ප්‍රතික්‍රියාව (Link Reaction) - මයිටොකොන්ඩ්‍රියා පූරකයේදී',
      '3. ක්‍රෙබ්ස් චක්‍රය (Krebs Cycle) - මයිටොකොන්ඩ්‍රියා පූරකයේදී',
      '4. ඉලෙක්ට්‍රෝන ප්‍රවාහන දාමය - මයිටොකොන්ඩ්‍රියා ඇතුළු පටලයේදී (ක්‍රිස්ටේ)'
    ],
    tip: 'ග්ලයිකොලිසිය සඳහා ඔක්සිජන් (O₂) අවශ්‍ය නොවේ.'
  }
];
