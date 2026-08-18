import { TOOL_SPECS } from "@/lib/tool-specs";

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

function buildToolLongDescription(tool: { name: string; short: string; category: string; keywords?: string[]; formula?: string; guide?: string[] }) {
  const topic = tool.name;
  const kws = (tool.keywords || []).slice(0, 6).join(", ");
  const formula = tool.formula || "The calculation is performed from the inputs shown in the calculator and follows the calculation method implemented in the BTTOTEK tool. Keep all dimensions and rates in the units displayed by the form.";
  const guide = (tool.guide || []).join(" ");
  return `
<h2>About the ${topic}</h2>
<p>The ${topic} is an online estimation tool created for users who need a quick, transparent way to work with project quantities, rates, dimensions or financial values. It is intended to reduce repetitive manual arithmetic while keeping the important inputs visible. The calculator is useful for early planning, quantity checking, preliminary costing, site discussions and scenario comparison. It is not a substitute for approved drawings, project specifications, statutory requirements, laboratory reports, professional design or current quotations. The result should always be reviewed in the context of the actual project.</p>
<p>This tool is especially relevant to the ${tool.category.toLowerCase()} category. Common search topics connected with it include ${kws || "online calculator, quantity estimation and project planning"}. Instead of hiding the calculation behind a single number, the page is designed to help the user understand which values affect the result and why changing an input changes the output.</p>

<h2>How the calculator works</h2>
<p>The calculator starts with the values entered in its form. Depending on the tool, these can include dimensions, quantities, rates, percentages, material properties, dates or financial assumptions. Each input has a defined unit or meaning. The calculation engine then applies the relationships used by the tool and presents the resulting quantities or values. Because the calculation is input-driven, a small change in a dimension, rate or percentage can change the final estimate. This makes the tool useful for comparing alternative project scenarios without repeating the arithmetic manually.</p>
<p>The main calculation method for this tool can be summarised as follows: <strong>${formula}</strong> This formula is a planning-level description of the calculation. The exact result also depends on the values entered, rounding, configured allowances and the assumptions built into the calculator.</p>

<h2>Inputs you should check</h2>
<p>Before pressing calculate, check every input carefully. Confirm the length, width, height, thickness, quantity, rate or percentage against the source document you are using. For engineering work, distinguish between millimetres and metres, square metres and square feet, kilograms and tonnes, and wet volume and dry-material volume. For property or finance calculations, confirm whether a value represents the property price, loan amount, annual cost, monthly payment or another basis. A calculator cannot detect an incorrect real-world assumption merely because the number is mathematically valid.</p>
<p>Where a percentage is requested, enter the percentage rather than its decimal equivalent unless the field explicitly says otherwise. Where a selection such as grade, support condition, material type or ownership category is provided, choose the option that matches the project. If a rate is local or market-dependent, use a current verified rate rather than relying on an old quotation or a generic internet figure.</p>

<h2>Understanding the result</h2>
<p>The result should be read as an estimate based on the stated inputs. Some outputs represent physical quantities such as cubic metres, kilograms, bags, square metres or truck trips. Other outputs may represent money, ratios, percentages or planning checks. Review the units alongside the number before transferring it to a BOQ, estimate, spreadsheet or report. If the result looks unusually high or low, do not simply accept it; check the dimensions, conversion factors, wastage assumptions, rates and selected options first.</p>
<p>For procurement, add project-specific allowances where appropriate. Material wastage, cutting losses, laps, overlaps, transportation, storage, breakage, access constraints, labour productivity and site conditions can all affect the final quantity or cost. A calculator result can therefore be a strong starting point without being the final purchase quantity.</p>

<h2>Practical uses</h2>
<p>Users can apply this calculator during preliminary planning, quantity take-off, rate comparison, contractor discussions, site measurement review, budget preparation and internal checking. Students and trainees can also use it to understand the relationship between inputs and outputs. Contractors may use it to test different rates or dimensions, while engineers and estimators can use it as a quick independent arithmetic check before preparing a detailed calculation sheet.</p>
<p>For a BOQ workflow, the best practice is to record the input basis beside the calculated quantity. That makes later verification easier. For example, note the dimensions, mix or rate used, the date of the rate, the applicable drawing reference and any wastage allowance. This creates an audit trail instead of treating the calculator result as an unexplained figure.</p>

<h2>Units and consistency</h2>
<p>Unit consistency is one of the most important parts of any quantity calculator. A dimension entered in millimetres when the formula expects metres can change a volume by a factor of one thousand. Similarly, confusing square feet with square metres can produce a large valuation or quantity error. Always use the unit printed next to the input field. If you are converting values from a drawing or another spreadsheet, convert them before entering them and then review the displayed result for reasonableness.</p>

<h2>Assumptions and limitations</h2>
<p>Every calculator is based on assumptions. Some assumptions are numerical, such as a dry-volume factor, density, wastage percentage, productivity rate, interest rate or reinforcement percentage. Others are practical, such as a standard material size or a simplified geometry. Real projects can differ because of workmanship, material supplier data, soil conditions, weather, design details, local regulations and construction methods. When the project requires a code-specific or engineered result, use the applicable standard and project documents as the controlling source.</p>
<p>${guide}</p>

<h2>How to verify the answer</h2>
<p>A useful verification method is to calculate the same quantity using a simple independent check. For example, estimate the order of magnitude mentally, compare the output with a known unit quantity, or reproduce the arithmetic in a spreadsheet. Check whether the final unit is correct and whether the result is sensible for the project size. For structural, safety-critical, tax or financial decisions, have the result reviewed by an appropriately qualified person and use the current applicable requirements.</p>

<h2>Why use BTTOTEK for this calculation?</h2>
<p>BTTOTEK is designed around practical online calculators that expose the important inputs and results instead of presenting an unexplained answer. The goal is to make repetitive calculation faster while encouraging users to check units, assumptions and source documents. The tool can be accessed from a modern browser and is intended to be convenient on both mobile and desktop devices. Related calculators on the site can also help when a project requires several connected quantities.</p>

<h2>Frequently asked questions</h2>
<h3>Is the result exact?</h3>
<p>The arithmetic is deterministic for the values entered, but the estimate is only as reliable as the inputs and assumptions. Real-world quantities may require adjustments for drawings, site conditions, material properties, wastage, rates or applicable standards.</p>
<h3>Can I use the result in a BOQ?</h3>
<p>Yes, as a preliminary estimating aid. Before issuing a final BOQ, tender, purchase order or payment measurement, verify the calculation against drawings, specifications, measurements, rates and project-specific requirements.</p>
<h3>Can I use this calculator on a phone?</h3>
<p>Yes. The calculator is intended for modern mobile and desktop browsers. Enter the values carefully and review the units and result before using the output.</p>
<h3>What if my project uses different assumptions?</h3>
<p>Use project-specific values where the calculator provides the relevant input. If an important project condition is not represented by the form, treat the result as a preliminary estimate and perform the detailed calculation separately.</p>
<h3>Why should I keep a record of the inputs?</h3>
<p>Recording the inputs, units, rate source and calculation date makes the estimate easier to audit and update. It also helps another person reproduce the result without guessing which assumptions were used.</p>

<h2>Important professional-use note</h2>
<p>This online calculator provides calculation assistance and planning information. It does not provide engineering certification, statutory approval, legal advice, tax advice, financial advice or a substitute for professional judgement. For safety-critical construction and structural work, follow the applicable Indian Standards, approved drawings, specifications and site instructions. For property, taxation and finance calculations, confirm current rules, charges and lender or authority requirements before making a decision.</p>
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
  formula: BASE_FORMULAS[t.slug] || "Use the displayed inputs and the implemented calculation method for this tool.",
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
  formula: (s as any).formula || s.guide?.[0] || "Use the displayed inputs and the implemented calculation method for this tool.",
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
