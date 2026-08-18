import { TOOL_SPECS } from "@/lib/tool-specs";
import { TOOL_CONTENT } from "./tool-content";

export type ToolCategory =
  | "Civil & Construction"
  | "Structural"
  | "Masonry"
  | "Finishing"
  | "Infrastructure"
  | "Quality Control"
  | "BOQ"
  | "Real Estate & Finance";

export interface ToolMeta {
  slug: string;
  name: string;
  short: string;
  category: ToolCategory;
  keywords: string[];
  icon: string;

  // Optional SEO metadata
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  longDescription?: string;
  formula?: string;
  faqs?: { q: string; a: string }[];
}

const BASE_FORMULAS: Record<string, string> = {
  "bar-bending-schedule": "Bar weight (kg/m) = d² / 162. Steel quantity = bar length × number of bars × unit weight. Cutting length is adjusted for bends, hooks, laps and cover according to the selected shape inputs.",
  "concrete-mortar": "Wet concrete volume = length × width × depth. Dry-material volume is estimated using the calculator's dry-volume factor, then divided by the selected mix ratio to obtain cement, sand and aggregate quantities.",
  "brickwork": "Wall volume = length × height × thickness. Brick count is estimated from the brick-and-mortar module, with the configured allowance; mortar volume is the wall volume minus brick volume, followed by dry-volume and mix-ratio conversion.",
  "plastering": "Wet mortar volume = plaster area × thickness. The calculator applies its dry-volume and wastage factors, then divides the result according to the selected cement:sand ratio to estimate cement and sand.",
  "excavation": "Excavation volume = length × width × depth × number of excavations. Bulked soil = excavated volume × bulking factor. Truck trips are rounded up from bulked volume ÷ truck capacity, and cost is based on the entered rate.",
  "beam-concrete": "Beam concrete volume = length × breadth × depth × number of beams. Estimated steel = concrete volume × steel percentage × steel density; material quantities follow the selected concrete mix method.",
  "column-concrete": "Column concrete volume is the section area × height × number of columns. For rectangular sections area = breadth × depth; for circular sections area = πd²/4. Steel estimate is based on the selected reinforcement percentage.",
  "slab-concrete": "Slab concrete volume = length × width × thickness. Material quantities are derived from the selected mix, while reinforcement is estimated from slab volume and the entered steel percentage.",
  "footing-concrete": "Footing concrete volume = footing length × footing width × footing thickness × number of footings. Concrete materials are derived from the selected mix and reinforcement is estimated using the entered steel percentage.",
  "land-area-converter": "Converted area = input value × the square-foot conversion factor assigned to the selected source unit. The result is then converted from the common square-foot base into the requested target unit.",
  "stamp-duty": "Stamp duty = property value × applicable state and ownership percentage. Registration fee = property value × registration rate, subject to any configured registration cap.",
  "rental-yield": "Gross rental yield = annual rent ÷ property price × 100. Net operating income subtracts vacancy, maintenance and tax inputs; the calculator then compares the resulting income with the invested capital and financing inputs.",
  "area-valuation": "Built-up area = carpet area × (1 + wall percentage/100). Super built-up area = built-up area × (1 + loading/100). Indicative values are calculated by applying the entered market or circle rate to the relevant area basis.",
  "home-loan-emi": "Monthly EMI = P×i×(1+i)^n / ((1+i)^n−1), where P is principal, i is monthly interest rate and n is total monthly instalments. Each payment is split into interest on opening balance and principal repayment.",
  "construction-cost": "Built-up area = plot/house area × number of floors. Estimated construction cost = built-up area × selected or entered rate per square foot, with the quality level providing a planning reference rate.",
}

function buildToolLongDescription(tool: {
  name: string;
  short: string;
  category: string;
  keywords?: string[];
  formula?: string;
  guide?: string[];
}) {
  const dedicated =
    (TOOL_CONTENT as Record<string, {
      intro: string;
      keyChecks: readonly string[];
      method: string;
      bestFor: readonly string[];
      limitations: readonly string[];
    }>) [(tool as any).slug] ?? null;

  const topic = tool.name.trim();
  const category = tool.category.trim();
  const keywords = (tool.keywords || []).filter(Boolean).slice(0, 8);
  const keywordText =
    keywords.length > 0
      ? keywords.join(", ")
      : "online calculation, quantity estimation and project planning";
  const formula =
    tool.formula?.trim() ||
    "The calculator uses the inputs displayed on this page and the calculation method implemented for the selected tool.";
  const guideText = (tool.guide || [])
    .filter(Boolean)
    .map((item) => `<li>${item}</li>`)
    .join("");

  return `
<section>
  <h2>About the ${topic}</h2>
  <p>
    ${dedicated?.intro || `The <strong>${topic}</strong> is a practical BTTOTEK calculator for ${category.toLowerCase()} work.`} It is designed to make repetitive
    calculations easier to check by keeping the important inputs, units and
    results visible in one place. It can be useful for preliminary estimating,
    quantity take-off, budgeting, comparison of alternatives, site discussions
    and independent arithmetic checks.
  </p>
  <p>
    This page is relevant to searches such as ${keywordText}. The calculator
    should be used with the actual project drawings, specifications,
    measurements, quotations and applicable rules. A mathematically correct
    result can still be unsuitable if an input, unit or real-world assumption
    is wrong.
  </p>

  <h2>How the calculator works</h2>
  <p>
    Enter the values requested by the form and keep every dimension, quantity,
    rate and percentage in the unit shown beside the field. The calculator
    processes those inputs using the method described below and then presents
    the resulting quantity, cost, ratio or planning value. Change one input at
    a time when comparing scenarios so that you can understand which assumption
    caused the result to change.
  </p>
  <p>
    <strong>Calculation method:</strong> ${dedicated?.method || formula}
  </p>

  ${
    dedicated?.keyChecks?.length
      ? `<h2>Key project checks</h2><ul>${dedicated.keyChecks.map((item) => `<li>${item}</li>`).join("")}</ul>`
      : ""
  }

  <h2>Inputs and units to verify</h2>
  <p>
    Before calculating, verify the source of every input. Check whether a
    dimension is in mm, cm, m or ft; whether an area is in sq ft or sq m; and
    whether a quantity is in kg, tonnes, litres, bags or another unit. For
    rates, confirm the currency, rate basis and date. For percentages, enter
    the percentage in the format requested by the field rather than converting
    it to a decimal unless the form specifically asks for a decimal.
  </p>
  <p>
    For engineering calculations, also confirm material grade, geometry,
    support or site conditions and other project-specific assumptions. For
    property and finance calculations, confirm the applicable state, authority,
    lender, tax rule, rate and date because these can vary by location and
    change over time.
  </p>

  <h2>Understanding the result</h2>
  <p>
    The displayed result is an estimate based on the inputs and assumptions
    entered. Always read the result together with its unit. If a result looks
    unusually high or low, stop and check the dimensions, conversion factors,
    selected options, wastage allowances and rates before using it in a BOQ,
    estimate, purchase decision or report.
  </p>
  <p>
    Real projects may require additional allowances for cutting losses, laps,
    overlaps, breakage, wastage, transportation, storage, access, workmanship,
    site conditions and design details. Where the calculator provides an
    allowance input, use a project-appropriate value rather than assuming that
    one percentage is suitable for every site.
  </p>

  <h2>Practical workflow</h2>
  <ol>
    <li>Collect the latest drawing, measurement, specification, quotation or other source document.</li>
    <li>Convert the source values into the units shown in the calculator.</li>
    <li>Enter the project-specific inputs and review them before calculating.</li>
    <li>Check the result, unit and order of magnitude.</li>
    <li>Record the inputs, assumptions, rate source and calculation date for future verification.</li>
    <li>For safety-critical, statutory or professional decisions, obtain the required qualified review.</li>
  </ol>

  ${
    guideText
      ? `<h2>Calculation guidance and assumptions</h2><ul>${guideText}</ul>`
      : ""
  }

  <h2>How to independently verify the answer</h2>
  <p>
    A simple independent check can catch many input and unit mistakes. Rework
    the main arithmetic in a spreadsheet or by hand, compare the order of
    magnitude with a known quantity, and confirm that the final unit makes
    sense. When a result depends on a standard, drawing, laboratory value,
    government rate or lender rule, verify that source separately instead of
    relying only on the calculator.
  </p>

  <h2>Why use BTTOTEK?</h2>
  <p>
    BTTOTEK focuses on practical calculators for construction, engineering,
    estimating and property-related tasks. The aim is to make repetitive
    arithmetic faster while showing the inputs and calculation context needed
    for sensible checking. Related calculators can be used together when a
    project requires several connected quantities.
  </p>

  <h2>Frequently asked questions</h2>
  <h3>Is the calculator result exact?</h3>
  <p>
    The arithmetic is deterministic for the values entered, but the result is
    only as reliable as the inputs, assumptions and calculation method. Actual
    project quantities may differ because of drawings, site conditions,
    material properties, workmanship, wastage, local rates or applicable rules.
  </p>

  <h3>Can I use the result directly in a BOQ or purchase order?</h3>
  <p>
    Use it as a preliminary estimating and checking aid. Before issuing a final
    BOQ, tender, purchase order or measurement statement, verify the quantity
    against the latest drawings, specifications, measurements, rates and
    project requirements.
  </p>

  <h3>What should I do if my project uses different assumptions?</h3>
  <p>
    Enter project-specific values wherever the calculator provides an input.
    If an important condition is not represented by the form, treat the output
    as a preliminary estimate and complete the detailed calculation separately.
  </p>

  <h3>Why are units so important?</h3>
  <p>
    A unit mistake can change a result by a very large factor. For example,
    confusing millimetres with metres or square feet with square metres can
    materially change a quantity. Always check the unit printed beside each
    input and the unit shown beside the final result.
  </p>

  <h3>How should I keep a record of a calculation?</h3>
  <p>
    Save the input values, units, assumptions, source of rates or technical
    data, and the date of calculation. This creates a useful audit trail and
    makes it easier to reproduce or update the estimate later.
  </p>

  <h2>Important professional-use note</h2>
  <p>
    This calculator provides calculation assistance and planning information.
    It does not provide engineering certification, structural approval, legal
    advice, tax advice, financial advice or a substitute for professional
    judgement. For construction and structural work, follow the applicable
    Indian Standards, approved drawings, specifications and site instructions.
    For property, taxation and finance calculations, confirm current
    requirements, charges and rates with the relevant authority or qualified
    professional before making a decision.
  </p>
</section>
`;
}

const BASE_TOOLS: ToolMeta[] = [
  {
    slug: "bar-bending-schedule",
    name: "Bar Bending Schedule (BBS) Pro",
    short:
      "Rebar cutting length, shape codes and total steel weight in kg/ton.",
    category: "Civil & Construction",
    keywords: [
      "bbs",
      "rebar",
      "steel",
      "stirrup",
      "cranked",
      "lap length",
      "hook",
      "bar bending",
    ],
    icon: "Ruler",

    seoTitle:
      "BBS Calculator – Bar Bending Schedule & Steel Weight | BTTOTEK",

    seoDescription:
      "Free BBS calculator for rebar cutting length, bar bending schedule, shape codes and total steel weight in kg and tonnes.",

    seoKeywords: [
      "BBS calculator",
      "bar bending schedule calculator",
      "rebar calculator",
      "steel weight calculator",
      "bar cutting length",
    ],
  },

  {
    slug: "concrete-mortar",
    name: "Concrete & Mortar Estimator",
    short:
      "M5–M30 mix design: dry volume, cement bags, sand, aggregate and water.",
    category: "Civil & Construction",
    keywords: [
      "concrete",
      "mortar",
      "m20",
      "cement bags",
      "aggregate",
      "mix ratio",
      "dry volume",
    ],
    icon: "Boxes",

    seoTitle:
      "Concrete & Mortar Calculator – Cement, Sand & Aggregate | BTTOTEK",

    seoDescription:
      "Free concrete and mortar calculator for cement bags, sand, aggregate, water and dry-volume material estimates for common mixes.",

    seoKeywords: [
      "concrete calculator",
      "mortar calculator",
      "cement calculator",
      "sand calculator",
      "aggregate calculator",
      "M20 concrete",
    ],
  },

  {
    slug: "brickwork",
    name: "Brickwork Calculator",
    short:
      "Number of bricks, mortar volume, cement and sand for any wall.",
    category: "Civil & Construction",
    keywords: [
      "brick",
      "masonry",
      "wall",
      "mortar",
      "blockwork",
    ],
    icon: "Brick",

    seoTitle:
      "Brickwork Calculator – Bricks, Mortar, Cement & Sand | BTTOTEK",

    seoDescription:
      "Calculate bricks, masonry mortar, cement and sand quantities for wall construction with this free brickwork calculator.",

    seoKeywords: [
      "brickwork calculator",
      "brick calculator",
      "masonry calculator",
      "brick mortar calculator",
      "cement sand calculator",
    ],
  },

  {
    slug: "plastering",
    name: "Plastering Calculator",
    short:
      "Mortar, cement bags and sand for internal/external plaster.",
    category: "Civil & Construction",
    keywords: [
      "plaster",
      "render",
      "cement mortar",
      "wall finish",
    ],
    icon: "PaintRoller",

    seoTitle:
      "Plastering Calculator – Cement, Sand & Mortar Quantity | BTTOTEK",

    seoDescription:
      "Calculate plaster area, mortar volume, cement bags and sand quantity for internal and external wall plastering.",

    seoKeywords: [
      "plastering calculator",
      "plaster calculator",
      "cement sand calculator",
      "wall plaster calculator",
      "mortar calculator",
    ],
  },

  {
    slug: "excavation",
    name: "Earthwork & Excavation",
    short:
      "Excavation volume, bulked soil, trips and total earthwork cost.",
    category: "Civil & Construction",
    keywords: [
      "excavation",
      "earthwork",
      "cutting",
      "filling",
      "soil",
      "trench",
    ],
    icon: "Shovel",

    seoTitle:
      "Excavation Calculator – Earthwork Volume, Soil & Cost | BTTOTEK",

    seoDescription:
      "Calculate excavation volume, bulking soil, truck trips and estimated earthwork cost for trenches and site excavation.",

    seoKeywords: [
      "excavation calculator",
      "earthwork calculator",
      "soil volume calculator",
      "trench calculator",
      "excavation cost",
    ],
  },

  {
    slug: "beam-concrete",
    name: "Beam Concrete & Steel",
    short:
      "RCC beam volume, cement/sand/aggregate and steel estimate.",
    category: "Structural",
    keywords: [
      "beam",
      "rcc",
      "structural",
      "steel percentage",
    ],
    icon: "Rows3",

    seoTitle:
      "RCC Beam Calculator – Concrete, Steel & Material Quantity | BTTOTEK",

    seoDescription:
      "Estimate RCC beam concrete volume, cement, sand, aggregate and reinforcement steel quantity from beam dimensions.",

    seoKeywords: [
      "beam calculator",
      "RCC beam calculator",
      "beam concrete calculator",
      "beam steel calculator",
      "RCC quantity",
    ],
  },

  {
    slug: "column-concrete",
    name: "Column Concrete & Steel",
    short:
      "RCC column volume with rectangular or circular sections.",
    category: "Structural",
    keywords: [
      "column",
      "rcc",
      "pillar",
      "structural",
    ],
    icon: "Columns3",

    seoTitle:
      "RCC Column Calculator – Concrete & Steel Quantity | BTTOTEK",

    seoDescription:
      "Calculate RCC column concrete volume and estimate reinforcement steel for rectangular or circular columns.",

    seoKeywords: [
      "column calculator",
      "RCC column calculator",
      "pillar calculator",
      "column concrete calculator",
      "column steel calculator",
    ],
  },

  {
    slug: "slab-concrete",
    name: "Slab Concrete Estimator",
    short:
      "Slab volume, materials and steel for one-way/two-way slabs.",
    category: "Structural",
    keywords: [
      "slab",
      "roof",
      "rcc",
      "deck",
    ],
    icon: "Square",

    seoTitle:
      "Slab Concrete Calculator – RCC Volume, Materials & Steel | BTTOTEK",

    seoDescription:
      "Calculate RCC slab concrete volume, cement, sand, aggregate and estimated reinforcement for one-way and two-way slabs.",

    seoKeywords: [
      "slab calculator",
      "RCC slab calculator",
      "slab concrete calculator",
      "slab steel calculator",
      "roof slab calculator",
    ],
  },

  {
    slug: "footing-concrete",
    name: "Footing / Foundation Estimator",
    short:
      "Isolated footing (PCC + sloped/rectangular pad) concrete quantity.",
    category: "Structural",
    keywords: [
      "footing",
      "foundation",
      "pcc",
      "pad",
      "isolated",
    ],
    icon: "Layers",

    seoTitle:
      "Footing Calculator – Foundation Concrete & Material Quantity | BTTOTEK",

    seoDescription:
      "Calculate isolated footing concrete quantity and estimate PCC, concrete materials and foundation quantities.",

    seoKeywords: [
      "footing calculator",
      "foundation calculator",
      "isolated footing calculator",
      "PCC calculator",
      "foundation concrete",
    ],
  },

  {
    slug: "land-area-converter",
    name: "Plot & Land Area Converter",
    short:
      "Sq.Ft, Gaj, Acre, Hectare, Bigha, Biswa, Guntha, Marla, Sq.M.",
    category: "Real Estate & Finance",
    keywords: [
      "land",
      "area",
      "bigha",
      "gaj",
      "acre",
      "hectare",
      "guntha",
      "marla",
      "biswa",
    ],
    icon: "Map",

    seoTitle:
      "Land Area Converter – Sq Ft, Gaj, Acre, Bigha & Hectare | BTTOTEK",

    seoDescription:
      "Convert land and plot areas between square feet, gaj, acre, hectare, bigha, biswa, guntha, marla and square metres.",

    seoKeywords: [
      "land area converter",
      "plot area converter",
      "square feet to gaj",
      "acre to bigha",
      "land calculator",
    ],
  },

  {
    slug: "stamp-duty",
    name: "Stamp Duty & Registration Fee",
    short:
      "State and gender dependent stamp duty with registration charges.",
    category: "Real Estate & Finance",
    keywords: [
      "stamp duty",
      "registration",
      "property tax",
      "conveyance",
      "gender",
    ],
    icon: "Stamp",

    seoTitle:
      "Stamp Duty & Registration Calculator – Property Charges | BTTOTEK",

    seoDescription:
      "Estimate property stamp duty and registration charges using the available state and property inputs. Verify rates with the local authority.",

    seoKeywords: [
      "stamp duty calculator",
      "registration fee calculator",
      "property registration",
      "property charges",
      "stamp duty India",
    ],
  },

  {
    slug: "rental-yield",
    name: "Rental Yield & Property ROI",
    short:
      "Gross yield, net yield, cash-on-cash return and payback period.",
    category: "Real Estate & Finance",
    keywords: [
      "rental yield",
      "roi",
      "cash on cash",
      "investment",
      "cap rate",
    ],
    icon: "TrendingUp",

    seoTitle:
      "Rental Yield Calculator – Gross Yield, Net Yield & Property ROI | BTTOTEK",

    seoDescription:
      "Calculate gross rental yield, net rental yield, cash-on-cash return and property payback period.",

    seoKeywords: [
      "rental yield calculator",
      "property ROI calculator",
      "rental return calculator",
      "cash on cash return",
      "property investment calculator",
    ],
  },

  {
    slug: "area-valuation",
    name: "Carpet / Built-Up & Circle Rate",
    short:
      "Carpet, built-up, super built-up areas and circle rate valuation.",
    category: "Real Estate & Finance",
    keywords: [
      "carpet area",
      "built up",
      "super built up",
      "circle rate",
      "loading",
      "valuation",
    ],
    icon: "Scaling",

    seoTitle:
      "Carpet Area & Built-Up Area Calculator – Property Valuation | BTTOTEK",

    seoDescription:
      "Calculate carpet, built-up and super built-up area and estimate property value using area and rate inputs.",

    seoKeywords: [
      "carpet area calculator",
      "built up area calculator",
      "super built up calculator",
      "property valuation calculator",
      "circle rate",
    ],
  },

  {
    slug: "home-loan-emi",
    name: "Home Loan EMI & Amortization",
    short:
      "EMI, total interest and a year-by-year amortization chart.",
    category: "Real Estate & Finance",
    keywords: [
      "emi",
      "home loan",
      "amortization",
      "interest",
      "mortgage",
    ],
    icon: "Landmark",

    seoTitle:
      "Home Loan EMI Calculator – EMI, Interest & Amortization | BTTOTEK",

    seoDescription:
      "Calculate home loan EMI, total interest, principal repayment and year-by-year amortization from loan amount, rate and tenure.",

    seoKeywords: [
      "home loan EMI calculator",
      "EMI calculator",
      "loan amortization calculator",
      "home loan interest calculator",
      "mortgage calculator",
    ],
  },

  {
    slug: "construction-cost",
    name: "House Construction Cost / Sq.Ft",
    short:
      "Material, labour and contractor breakdown for turnkey construction.",
    category: "Real Estate & Finance",
    keywords: [
      "construction cost",
      "per sqft",
      "budget",
      "turnkey",
      "labour",
      "material",
    ],
    icon: "Building2",

    seoTitle:
      "House Construction Cost Calculator – Cost Per Sq Ft | BTTOTEK",

    seoDescription:
      "Estimate house construction cost per square foot with material, labour and contractor cost breakdown for a project budget.",

    seoKeywords: [
      "house construction cost calculator",
      "construction cost per sq ft",
      "building cost calculator",
      "construction budget calculator",
      "home construction estimate",
    ],
  },
];

const BASE_TOOLS_ENRICHED: ToolMeta[] = BASE_TOOLS.map((t) => ({
  ...t,
  formula: BASE_FORMULAS[t.slug] || "The calculation uses the inputs displayed on this page and the calculation method implemented for this BTTOTEK tool. Review the assumptions and units shown with the form before using the result.",
  longDescription: buildToolLongDescription({
    name: t.name, short: t.short, category: t.category, keywords: t.keywords,
    formula: BASE_FORMULAS[t.slug],
  }),
}));

const SPEC_TOOLS: ToolMeta[] = TOOL_SPECS.map((s) => ({
  slug: s.slug,
  name: s.name,
  short: s.short,
  category: s.category,
  keywords: s.keywords,
  icon: s.icon,

  seoTitle:
    "seoTitle" in s
      ? s.seoTitle
      : undefined,

  seoDescription:
    "seoDescription" in s
      ? s.seoDescription
      : undefined,

  seoKeywords:
    "seoKeywords" in s
      ? s.seoKeywords
      : undefined,
  formula: (s as any).formula || s.guide?.[0] || "The calculation uses the inputs displayed on this page and the calculation method implemented for this BTTOTEK tool. Review the assumptions and units shown with the form before using the result.",
  longDescription: buildToolLongDescription({
    name: s.name, short: s.short, category: s.category, keywords: s.keywords,
    formula: (s as any).formula || s.guide?.[0], guide: s.guide,
  }),
}));

export const TOOLS: ToolMeta[] = [
  ...BASE_TOOLS_ENRICHED,
  ...SPEC_TOOLS.filter(
    (s) => !BASE_TOOLS.some((b) => b.slug === s.slug),
  ),
];

const ALL_CATEGORIES: ToolCategory[] = [
  "Civil & Construction",
  "Structural",
  "Masonry",
  "Finishing",
  "Infrastructure",
  "Quality Control",
  "BOQ",
  "Real Estate & Finance",
];

export const CATEGORIES: ToolCategory[] =
  ALL_CATEGORIES.filter((c) =>
    TOOLS.some((t) => t.category === c),
  );

export function findTool(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}

export function searchTools(query: string) {
  const q = query.trim().toLowerCase();

  if (!q) return [];

  return TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.short.toLowerCase().includes(q) ||
      t.keywords.some((k) =>
        k.toLowerCase().includes(q),
      ) ||
      t.seoKeywords?.some((k) =>
        k.toLowerCase().includes(q),
      ),
  ).slice(0, 8);
}
