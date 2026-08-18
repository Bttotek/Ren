import type { ToolCategory } from "@/lib/tools";

export type SpecField = {
  key: string;
  label: string;
  unit?: string;
  default: number | string;
  options?: { value: string; label: string }[];
  hint?: string;
};

export type SpecResult = { label: string; value: string; hint?: string; highlight?: boolean };

// Editorial note: calculator copy is written for original, useful explanatory content.
// Avoid claims of guaranteed compliance; users should verify current local codes, rates and approvals.

export type ToolSpec = {
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

  fields: SpecField[];

  compute: (
    v: Record<string, number | string>,
  ) => SpecResult[];

  guide: string[];
};

const n = (v: number | string | undefined) => {
  const x = typeof v === "number" ? v : parseFloat(String(v ?? 0));
  return Number.isFinite(x) ? x : 0;
};
const f = (x: number, d = 2) =>
  Number.isFinite(x) ? x.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const inr = (x: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number.isFinite(x) ? x : 0,
  );

const guide = (topic: string, body: string[]) => [
  `This ${topic} tool is intended for preliminary planning and quantity checks. It explains the calculation method and the assumptions used by the calculator so you can review the result before using it in a drawing, estimate, quotation or purchase decision.`,
  ...body,
  "The result is an estimate, not a structural design, statutory approval, tax opinion or procurement specification. Actual values depend on project drawings, site conditions, product data, contract terms and the rules applicable at the project location. Verify important inputs with the relevant engineer, architect, authority, manufacturer or tax professional before relying on the result.",
];

export const TOOL_CONTENT_NOTICE =
  "These calculators provide general, preliminary estimates. Results depend on the inputs and assumptions shown. Verify current local codes, specifications, prices, tax rules and professional requirements before making a design, construction, financial or procurement decision.";

export const TOOL_SPECS: ToolSpec[] = [
  /* ---------------- Civil & Construction ---------------- */
  {
    slug: "tile-flooring",
    name: "Tile & Flooring Calculator",
    short: "Tile count, wastage, adhesive and grout for any floor or wall area.",
    category: "Finishing",
    keywords: ["tile", "flooring", "vitrified", "adhesive", "grout", "skirting"],
    icon: "Grid3x3",
    seoTitle: "Tile & Flooring Calculator | Free Online Calculator",
    seoDescription: "Tile count, wastage, adhesive and grout for any floor or wall area.",
    fields: [
      { key: "l", label: "Room length", unit: "m", default: 4 },
      { key: "b", label: "Room width", unit: "m", default: 3.5 },
      { key: "tl", label: "Tile length", unit: "mm", default: 600 },
      { key: "tb", label: "Tile width", unit: "mm", default: 600 },
      { key: "waste", label: "Wastage", unit: "%", default: 7 },
      { key: "rate", label: "Tile rate", unit: "₹/sqft", default: 65 },
    ],
    compute: (v) => {
      const area = n(v["l"]) * n(v["b"]);
      const tileArea = (n(v["tl"]) / 1000) * (n(v["tb"]) / 1000);
      const tiles = tileArea > 0 ? Math.ceil((area / tileArea) * (1 + n(v["waste"]) / 100)) : 0;
      const sqft = area * 10.7639;
      return [
        { label: "Floor area", value: `${f(area)} m² / ${f(sqft)} sq.ft`, highlight: true },
        { label: "Tiles required", value: `${tiles} nos`, hint: `incl. ${f(n(v["waste"]), 0)}% wastage` },
        { label: "Tile adhesive", value: `${f(area * 4.5, 0)} kg`, hint: "at 4.5 kg/m², 3 mm bed" },
        { label: "Grout", value: `${f(area * 0.35, 1)} kg` },
        { label: "Material cost", value: inr(sqft * n(v["rate"])) },
      ];
    },
    guide: guide("tile and flooring", [
      "Tile quantity is derived by dividing the net floor area by the effective area of a single tile, then adding a wastage factor. Seven percent suits straight-lay 600×600 vitrified tiles; raise it to 10–12% for diagonal patterns, small mosaics or rooms with many cut edges.",
      "Adhesive consumption depends on bed thickness. A 3 mm notch trowel bed consumes roughly 4.5 kg/m² of cementitious adhesive; a thick 12 mm mortar bed for natural stone consumes proportionally more and should be estimated as mortar volume instead.",
      "Remember to add skirting separately: perimeter length multiplied by skirting height, again with a cutting allowance. Deduct door openings from the skirting run but not from the floor area.",
    ]),
  },
  {
    slug: "paint-quantity",
    name: "Paint & Putty Calculator",
    short: "Litres of primer, putty and finish paint for interior or exterior walls.",
    category: "Finishing",
    keywords: ["paint", "putty", "primer", "emulsion", "coats", "coverage"],
    icon: "PaintBucket",
    seoTitle: "Paint & Putty Calculator | Free Online Calculator",
    seoDescription: "Litres of primer, putty and finish paint for interior or exterior walls.",
    fields: [
      { key: "area", label: "Wall area", unit: "m²", default: 100 },
      { key: "coats", label: "Finish coats", default: 2 },
      { key: "cover", label: "Coverage per litre", unit: "m²", default: 10 },
      { key: "rate", label: "Paint rate", unit: "₹/litre", default: 320 },
    ],
    compute: (v) => {
      const area = n(v["area"]);
      const paint = (area * n(v["coats"])) / Math.max(1, n(v["cover"]));
      const primer = area / 12;
      const putty = area * 1.2;
      return [
        { label: "Finish paint", value: `${f(paint, 1)} litres`, highlight: true },
        { label: "Primer (1 coat)", value: `${f(primer, 1)} litres` },
        { label: "Wall putty", value: `${f(putty, 0)} kg`, hint: "2 coats at ~1.2 kg/m²" },
        { label: "Paint cost", value: inr(paint * n(v["rate"])) },
      ];
    },
    guide: guide("paint and putty", [
      "Coverage is the single largest variable. Premium interior emulsions cover 10–12 m² per litre per coat on a puttied surface, while the same paint on rough plaster may drop to 7 m². Exterior textured finishes can fall below 5 m² per litre.",
      "Always price two finish coats over one primer coat as the minimum specification. New masonry additionally needs two coats of wall putty at roughly 1.2 kg/m² total to level the surface before priming.",
      "Deduct only openings larger than 0.5 m². Small windows are normally ignored because the extra cutting-in effort offsets the saved area.",
    ]),
  },
  {
    slug: "roof-waterproofing",
    name: "Waterproofing Estimator",
    short: "Membrane, coating and chemical quantity for roofs, basements and toilets.",
    category: "Finishing",
    keywords: ["waterproofing", "membrane", "app", "coating", "basement", "terrace"],
    icon: "Umbrella",
    seoTitle: "Waterproofing Estimator | Free Online Calculator",
    seoDescription: "Membrane, coating and chemical quantity for roofs, basements and toilets.",
    fields: [
      { key: "area", label: "Treatment area", unit: "m²", default: 80 },
      {
        key: "system",
        label: "System",
        default: "coating",
        options: [
          { value: "coating", label: "Acrylic / PU coating" },
          { value: "membrane", label: "APP torch-on membrane" },
          { value: "crystalline", label: "Crystalline slurry" },
        ],
      },
      { key: "rate", label: "Applied rate", unit: "₹/m²", default: 260 },
    ],
    compute: (v) => {
      const area = n(v["area"]);
      const sys = String(v["system"]);
      const overlap = sys === "membrane" ? 1.15 : 1;
      const consumption = sys === "coating" ? 1.5 : sys === "crystalline" ? 2.2 : 0;
      return [
        { label: "Net area", value: `${f(area)} m²`, highlight: true },
        {
          label: sys === "membrane" ? "Membrane with overlaps" : "Chemical consumption",
          value: sys === "membrane" ? `${f(area * overlap)} m²` : `${f(area * consumption, 1)} kg`,
          hint: sys === "membrane" ? "15% overlap and side-lap allowance" : "two coats",
        },
        { label: "Primer", value: `${f(area * 0.25, 1)} litres` },
        { label: "Applied cost", value: inr(area * n(v["rate"])) },
      ];
    },
    guide: guide("waterproofing", [
      "Measure the treatment area including the vertical upturn at parapets and around drains — usually 300 mm minimum, and 150 mm above the finished floor level in wet areas. Skipping the upturn is the most common cause of early failure.",
      "Torch-applied APP membranes need a 15% allowance for side and end laps. Liquid-applied acrylic or PU systems are quantified by consumption: roughly 1.5 kg/m² over two coats for a 1 mm dry film.",
      "Always include surface preparation and a fillet at every wall-slab junction in the rate, and specify a 24-hour ponding test before the protective screed is laid.",
    ]),
  },
  {
    slug: "false-ceiling",
    name: "False Ceiling Calculator",
    short: "Gypsum board, channels, screws and jointing compound per ceiling area.",
    category: "Finishing",
    keywords: ["false ceiling", "gypsum", "pop", "channel", "grid", "ceiling"],
    icon: "PanelTop",
    seoTitle: "False Ceiling Calculator | Free Online Calculator",
    seoDescription: "Gypsum board, channels, screws and jointing compound per ceiling area.",
    fields: [
      { key: "l", label: "Ceiling length", unit: "m", default: 5 },
      { key: "b", label: "Ceiling width", unit: "m", default: 4 },
      { key: "rate", label: "Applied rate", unit: "₹/sqft", default: 95 },
    ],
    compute: (v) => {
      const area = n(v["l"]) * n(v["b"]);
      const sqft = area * 10.7639;
      return [
        { label: "Ceiling area", value: `${f(area)} m² / ${f(sqft)} sq.ft`, highlight: true },
        { label: "Gypsum boards (1200×2400)", value: `${Math.ceil((area / 2.88) * 1.08)} nos` },
        { label: "Ceiling section", value: `${f(area / 0.45, 0)} rm`, hint: "at 450 mm centres" },
        { label: "Perimeter channel", value: `${f(2 * (n(v["l"]) + n(v["b"])), 1)} rm` },
        { label: "Drywall screws", value: `${f(area * 16, 0)} nos` },
        { label: "Applied cost", value: inr(sqft * n(v["rate"])) },
      ];
    },
    guide: guide("false ceiling", [
      "Calculate the finished ceiling area first, then allow for board cuts and openings. Board size, layout and wastage can change the final sheet count.",
      "Framing quantities depend on the selected ceiling system, spacing, suspension height and loading. The calculator uses a planning assumption; the final framing layout should follow the approved system details.",
      "Keep boards, framing, fasteners, joint treatment and access panels visible as separate estimate components so the cost can be reviewed easily.",
    ]),
  },
  {
    slug: "wall-putty",
    name: "Wall Putty Coverage",
    short: "Putty bags, coats and cost for smooth wall finishing.",
    category: "Finishing",
    keywords: ["putty", "wall finish", "birla", "coverage", "smoothing"],
    icon: "Brush",
    seoTitle: "Wall Putty Coverage | Free Online Calculator",
    seoDescription: "Putty bags, coats and cost for smooth wall finishing.",
    fields: [
      { key: "area", label: "Wall area", unit: "m²", default: 120 },
      { key: "coats", label: "Coats", default: 2 },
      { key: "rate", label: "Putty rate", unit: "₹/kg", default: 26 },
    ],
    compute: (v) => {
      const kg = n(v["area"]) * 0.6 * n(v["coats"]);
      return [
        { label: "Putty required", value: `${f(kg, 0)} kg`, highlight: true },
        { label: "Bags (40 kg)", value: `${Math.ceil(kg / 40)} nos` },
        { label: "Water", value: `${f(kg * 0.38, 0)} litres` },
        { label: "Material cost", value: inr(kg * n(v["rate"])) },
      ];
    },
    guide: guide("wall putty", [
      "Putty consumption varies with plaster flatness and the product used. Use the manufacturer's coverage and the number of coats specified for the project rather than treating one kg-per-square-metre figure as universal.",
      "Mixing water should follow the product instructions. Excess water can change workability and finished-surface performance.",
      "Putty is a finishing material, not a substitute for a waterproofing system. Exterior surfaces should use a compatible exterior-grade system where required.",
    ]),
  },
  {
    slug: "road-pavement",
    name: "Road & Pavement Quantity",
    short: "GSB, WMM, DBM and BC layer volumes and bitumen for a road stretch.",
    category: "Infrastructure",
    keywords: ["road", "pavement", "gsb", "wmm", "dbm", "bitumen", "bc", "highway"],
    icon: "Route",
    seoTitle: "Road & Pavement Quantity | Free Online Calculator",
    seoDescription: "GSB, WMM, DBM and BC layer volumes and bitumen for a road stretch.",
    fields: [
      { key: "len", label: "Road length", unit: "m", default: 1000 },
      { key: "width", label: "Carriageway width", unit: "m", default: 7 },
      { key: "gsb", label: "GSB thickness", unit: "mm", default: 200 },
      { key: "wmm", label: "WMM thickness", unit: "mm", default: 250 },
      { key: "dbm", label: "DBM thickness", unit: "mm", default: 50 },
      { key: "bc", label: "BC thickness", unit: "mm", default: 40 },
    ],
    compute: (v) => {
      const a = n(v["len"]) * n(v["width"]);
      const vol = (t: number) => (a * t) / 1000;
      const dbm = vol(n(v["dbm"]));
      const bc = vol(n(v["bc"]));
      return [
        { label: "Pavement area", value: `${f(a, 0)} m²`, highlight: true },
        { label: "GSB volume", value: `${f(vol(n(v["gsb"])), 1)} m³` },
        { label: "WMM volume", value: `${f(vol(n(v["wmm"])), 1)} m³` },
        { label: "DBM", value: `${f(dbm * 2.4, 1)} ton`, hint: "at 2.4 t/m³" },
        { label: "BC", value: `${f(bc * 2.4, 1)} ton` },
        { label: "Bitumen (approx.)", value: `${f((dbm * 2.4 * 4.5 + bc * 2.4 * 5.5) / 100, 2)} ton` },
      ];
    },
    guide: guide("road and pavement", [
      "Estimate each pavement layer from its compacted dimensions and the specification for the project. Keep granular and bituminous layers as separate items so density and material assumptions remain visible.",
      "Bituminous material is commonly ordered by mass, so convert volume using the approved mix density. Binder content, tack coat and prime coat should come from the mix and project specifications rather than one universal percentage.",
      "Include ancillary work such as shoulders, drainage, edge treatment and testing where they form part of the scope. These items can materially affect the final road estimate.",
    ]),
  },
  {
    slug: "culvert-quantity",
    name: "Box Culvert Quantity",
    short: "Concrete and steel for RCC box culverts including wing walls.",
    category: "Infrastructure",
    keywords: ["culvert", "box", "hume pipe", "drain", "crossing", "rcc"],
    icon: "Waves",
    seoTitle: "Box Culvert Quantity | Free Online Calculator",
    seoDescription: "Concrete and steel for RCC box culverts including wing walls.",
    fields: [
      { key: "span", label: "Clear span", unit: "m", default: 3 },
      { key: "height", label: "Clear height", unit: "m", default: 2.5 },
      { key: "len", label: "Culvert length", unit: "m", default: 12 },
      { key: "t", label: "Wall / slab thickness", unit: "mm", default: 300 },
      { key: "steel", label: "Steel ratio", unit: "kg/m³", default: 120 },
    ],
    compute: (v) => {
      const t = n(v["t"]) / 1000;
      const outerA = (n(v["span"]) + 2 * t) * (n(v["height"]) + 2 * t);
      const innerA = n(v["span"]) * n(v["height"]);
      const conc = (outerA - innerA) * n(v["len"]);
      const steel = conc * n(v["steel"]);
      return [
        { label: "Concrete volume", value: `${f(conc, 2)} m³`, highlight: true },
        { label: "Cement (M30)", value: `${f((conc * 1.54 * 1440) / 3.25 / 50, 0)} bags` },
        { label: "Reinforcement", value: `${f(steel, 0)} kg`, hint: `${f(steel / 1000, 2)} ton` },
        { label: "Shuttering area", value: `${f((2 * (n(v["span"]) + n(v["height"])) * n(v["len"])) * 2, 1)} m²` },
      ];
    },
    guide: guide("box culvert", [
      "Separate the barrel concrete from wing walls, aprons, headwalls, cut-off walls and other ancillary work. The final quantity should follow the approved drawings and measurement rules.",
      "Reinforcement varies substantially with span, cover, loading, soil conditions and detailing. Use the reinforcement schedule for procurement rather than applying a single percentage to all culverts.",
      "Formwork should reflect the actual faces that require support and the construction sequence. Access and stripping constraints can change the practical cost.",
    ]),
  },
  {
    slug: "drainage-pipe",
    name: "Drainage & Sewer Line",
    short: "Trench excavation, bedding, pipe count and backfill for a pipeline.",
    category: "Infrastructure",
    keywords: ["drainage", "sewer", "pipe", "trench", "bedding", "manhole"],
    icon: "Pipette",
    seoTitle: "Drainage & Sewer Line | Free Online Calculator",
    seoDescription: "Trench excavation, bedding, pipe count and backfill for a pipeline.",
    fields: [
      { key: "len", label: "Pipeline length", unit: "m", default: 200 },
      { key: "dia", label: "Pipe diameter", unit: "mm", default: 300 },
      { key: "depth", label: "Trench depth", unit: "m", default: 1.5 },
      { key: "pipeLen", label: "Pipe unit length", unit: "m", default: 2.5 },
    ],
    compute: (v) => {
      const width = n(v["dia"]) / 1000 + 0.6;
      const exc = n(v["len"]) * width * n(v["depth"]);
      const bedding = n(v["len"]) * width * 0.15;
      const pipeVol = Math.PI * Math.pow(n(v["dia"]) / 2000, 2) * n(v["len"]);
      return [
        { label: "Trench width", value: `${f(width, 2)} m`, hint: "dia + 300 mm each side" },
        { label: "Excavation", value: `${f(exc, 2)} m³`, highlight: true },
        { label: "Granular bedding", value: `${f(bedding, 2)} m³`, hint: "150 mm layer" },
        { label: "Pipes required", value: `${Math.ceil(n(v["len"]) / Math.max(0.1, n(v["pipeLen"])))} nos` },
        { label: "Backfill", value: `${f(Math.max(0, exc - bedding - pipeVol), 2)} m³` },
      ];
    },
    guide: guide("drainage and sewer", [
      "Trench volume depends on pipe outside diameter, working width, depth and side slopes or shoring. Use the excavation method specified for the site.",
      "Provide the specified bedding and surround around the pipe, taking care not to use a generic thickness where the project specification requires another value.",
      "Backfill quantity is obtained from excavation less the permanent displaced volumes and specified bedding/surround. Reuse of excavated material depends on its suitability and the approval criteria.",
    ]),
  },
  {
    slug: "septic-tank",
    name: "Septic Tank Sizing",
    short: "Tank capacity, dimensions and soak pit sizing per IS 2470.",
    category: "Infrastructure",
    keywords: ["septic tank", "soak pit", "sewage", "is 2470", "capacity", "users"],
    icon: "Container",
    seoTitle: "Septic Tank Sizing | Free Online Calculator",
    seoDescription: "Tank capacity, dimensions and soak pit sizing per IS 2470.",
    fields: [
      { key: "users", label: "Number of users", default: 10 },
      { key: "flow", label: "Sewage per person", unit: "litre/day", default: 120 },
      { key: "retention", label: "Retention", unit: "days", default: 1 },
      { key: "sludge", label: "Sludge storage", unit: "litre/person", default: 60 },
    ],
    compute: (v) => {
      const liquid = n(v["users"]) * n(v["flow"]) * n(v["retention"]);
      const sludge = n(v["users"]) * n(v["sludge"]);
      const total = liquid + sludge;
      const m3 = total / 1000;
      const depth = 1.5;
      const area = m3 / depth;
      const width = Math.sqrt(area / 2.5);
      return [
        { label: "Required capacity", value: `${f(m3, 2)} m³`, hint: `${f(total, 0)} litres`, highlight: true },
        { label: "Liquid volume", value: `${f(liquid / 1000, 2)} m³` },
        { label: "Sludge volume", value: `${f(sludge / 1000, 2)} m³` },
        {
          label: "Suggested size (L×B×D)",
          value: `${f(width * 2.5, 2)} × ${f(width, 2)} × ${f(depth, 2)} m`,
          hint: "2.5:1 length to width, 300 mm freeboard extra",
        },
      ];
    },
    guide: guide("septic tank", [
      "Tank sizing should be based on the expected wastewater flow, detention requirement and sludge storage period specified for the project. Local sanitation requirements may change the inputs.",
      "Provide practical access for inspection and desludging, along with the required freeboard and internal compartments. The calculator's proportions are only a preliminary geometry suggestion.",
      "Effluent disposal needs a separate assessment of soil conditions, groundwater and setback requirements. A soakaway or dispersion system should not be selected from tank volume alone.",
    ]),
  },
  {
    slug: "water-tank-capacity",
    name: "Water Tank Capacity",
    short: "Litres, dimensions and demand check for overhead or underground tanks.",
    category: "Infrastructure",
    keywords: ["water tank", "capacity", "litres", "overhead", "sump", "demand"],
    icon: "Droplets",
    seoTitle: "Water Tank Capacity | Free Online Calculator",
    seoDescription: "Litres, dimensions and demand check for overhead or underground tanks.",
    fields: [
      { key: "l", label: "Length", unit: "m", default: 2 },
      { key: "b", label: "Width", unit: "m", default: 1.5 },
      { key: "d", label: "Liquid depth", unit: "m", default: 1.2 },
      { key: "persons", label: "Persons served", default: 8 },
      { key: "lpcd", label: "Demand", unit: "lpcd", default: 135 },
    ],
    compute: (v) => {
      const m3 = n(v["l"]) * n(v["b"]) * n(v["d"]);
      const litres = m3 * 1000;
      const demand = n(v["persons"]) * n(v["lpcd"]);
      return [
        { label: "Capacity", value: `${f(litres, 0)} litres`, hint: `${f(m3, 2)} m³`, highlight: true },
        { label: "Daily demand", value: `${f(demand, 0)} litres`, hint: `${f(n(v["lpcd"]), 0)} lpcd` },
        { label: "Days of storage", value: demand > 0 ? `${f(litres / demand, 1)} days` : "—" },
        { label: "Water weight (full)", value: `${f(litres / 1000, 2)} ton` },
      ];
    },
    guide: guide("water tank", [
      "Tank capacity is the internal liquid volume. Keep freeboard separate so the usable storage is not overstated.",
      "Daily demand is an input assumption and can vary with occupancy, building use and the local water-supply standard. Use the project-approved demand figure for design.",
      "A full tank adds significant dead load to the supporting structure. Structural members, supports and foundations should be checked for the actual filled condition.",
    ]),
  },
  {
    slug: "compaction-density",
    name: "Field Compaction & Density",
    short: "Degree of compaction from field dry density against Proctor MDD.",
    category: "Quality Control",
    keywords: ["compaction", "proctor", "mdd", "omc", "field density", "core cutter"],
    icon: "Gauge",
    seoTitle: "Field Compaction & Density | Free Online Calculator",
    seoDescription: "Degree of compaction from field dry density against Proctor MDD.",
    fields: [
      { key: "wet", label: "Field wet density", unit: "g/cc", default: 2.05 },
      { key: "mc", label: "Field moisture content", unit: "%", default: 9 },
      { key: "mdd", label: "Lab MDD", unit: "g/cc", default: 2.0 },
      { key: "omc", label: "Lab OMC", unit: "%", default: 10 },
    ],
    compute: (v) => {
      const dry = n(v["wet"]) / (1 + n(v["mc"]) / 100);
      const deg = n(v["mdd"]) > 0 ? (dry / n(v["mdd"])) * 100 : 0;
      return [
        { label: "Field dry density", value: `${f(dry, 3)} g/cc`, highlight: true },
        { label: "Degree of compaction", value: `${f(deg, 1)} %` },
        { label: "Moisture deviation", value: `${f(n(v["mc"]) - n(v["omc"]), 1)} % from OMC` },
        {
          label: "Verdict",
          value: deg >= 95 ? "PASS (≥95%)" : deg >= 90 ? "Marginal" : "FAIL — recompact",
        },
      ];
    },
    guide: guide("field compaction", [
      "Dry density is obtained from wet density and measured moisture content. Degree of compaction is then compared with the laboratory reference density for the relevant material and test method.",
      "Acceptance limits vary by layer, material and project specification. Do not treat 95% or any other threshold as a universal pass value.",
      "Test frequency and test method should follow the quality plan and applicable specification. Edge zones and transitions deserve attention because compaction can be less uniform there.",
    ]),
  },
  {
    slug: "concrete-cube-strength",
    name: "Concrete Cube Test Result",
    short: "Compressive strength from cube load with IS 456 acceptance check.",
    category: "Quality Control",
    keywords: ["cube test", "compressive strength", "is 456", "7 day", "28 day", "acceptance"],
    icon: "TestTube",
    seoTitle: "Concrete Cube Test Result | Free Online Calculator",
    seoDescription: "Compressive strength from cube load with IS 456 acceptance check.",
    fields: [
      { key: "load", label: "Failure load", unit: "kN", default: 700 },
      { key: "size", label: "Cube size", unit: "mm", default: 150 },
      { key: "grade", label: "Design grade (fck)", unit: "MPa", default: 25 },
      { key: "age", label: "Age at test", unit: "days", default: 28 },
    ],
    compute: (v) => {
      const area = Math.pow(n(v["size"]), 2);
      const str = area > 0 ? (n(v["load"]) * 1000) / area : 0;
      const target = n(v["grade"]) + Math.max(1.65 * 4, 4);
      return [
        { label: "Compressive strength", value: `${f(str, 2)} MPa`, highlight: true },
        { label: "Cube area", value: `${f(area, 0)} mm²` },
        { label: "Illustrative target mean", value: `${f(target, 2)} MPa`, hint: "illustration using assumed standard deviation of 4 MPa" },
        {
          label: `Test age`,
          value: `${f(n(v["age"]), 0)} days`,
          hint: "Use the project's specified acceptance procedure; a single cube is not a batch acceptance decision.",
        },
      ];
    },
    guide: guide("concrete cube testing", [
      "Cube strength is calculated from failure load divided by the loaded face area, with consistent units. The result is one test observation and should be interpreted with the project's sampling and acceptance procedure.",
      "Concrete acceptance is normally based on a set of results and the applicable standard, not on this calculator's single-cube comparison. The required statistical check depends on the available test history and grade.",
      "Early-age strength can be useful for monitoring, but it should not automatically be treated as the final acceptance result. Follow the specified test age and quality-control procedure.",
    ]),
  },
  {
    slug: "slump-workability",
    name: "Slump & Workability Guide",
    short: "Slump target, water demand check and workability class per placement.",
    category: "Quality Control",
    keywords: ["slump", "workability", "water cement ratio", "admixture", "cone"],
    icon: "FlaskConical",
    seoTitle: "Slump & Workability Guide | Free Online Calculator",
    seoDescription: "Slump target, water demand check and workability class per placement.",
    fields: [
      { key: "slump", label: "Measured slump", unit: "mm", default: 100 },
      { key: "cement", label: "Cement content", unit: "kg/m³", default: 340 },
      { key: "water", label: "Water added", unit: "litre/m³", default: 170 },
      {
        key: "element",
        label: "Element",
        default: "beam",
        options: [
          { value: "foundation", label: "Mass / foundation concrete" },
          { value: "slab", label: "Slab and lightly reinforced" },
          { value: "beam", label: "Beams and columns" },
          { value: "pump", label: "Pumped / congested sections" },
        ],
      },
    ],
    compute: (v) => {
      const wc = n(v["cement"]) > 0 ? n(v["water"]) / n(v["cement"]) : 0;
      const targets: Record<string, [number, number]> = {
        foundation: [25, 75],
        slab: [50, 100],
        beam: [75, 125],
        pump: [100, 150],
      };
      const t = targets[String(v["element"])] ?? [75, 125];
      const s = n(v["slump"]);
      return [
        { label: "Water–cement ratio", value: f(wc, 3), highlight: true },
        { label: "Recommended slump", value: `${t[0]}–${t[1]} mm` },
        {
          label: "Slump verdict",
          value: s < t[0] ? "Too stiff" : s > t[1] ? "Too wet" : "Within range",
        },
        { label: "Durability check", value: wc <= 0.55 ? "OK for moderate exposure" : "Exceeds 0.55 — reduce water" },
      ];
    },
    guide: guide("slump and workability", [
      "Slump describes the consistency of fresh concrete; it does not directly measure compressive strength. The acceptable range should come from the mix design and placement requirements.",
      "Water-cement ratio is calculated from the entered water and cement quantities. Do not use the displayed ratio as a substitute for the approved mix design or durability limits.",
      "If workability needs adjustment, use the admixture and batching procedure approved for the mix. Avoid adding uncontrolled water at site because it changes the designed proportions.",
    ]),
  },
  {
    slug: "steel-weight-chart",
    name: "Steel Weight & Section Chart",
    short: "Unit weight and total weight for rebar and structural steel sections.",
    category: "Structural",
    keywords: ["steel weight", "unit weight", "d2/162", "rebar", "section", "ismb"],
    icon: "Weight",
    seoTitle: "Steel Weight & Section Chart | Free Online Calculator",
    seoDescription: "Unit weight and total weight for rebar and structural steel sections.",
    fields: [
      { key: "dia", label: "Bar diameter", unit: "mm", default: 16 },
      { key: "len", label: "Total length", unit: "m", default: 100 },
      { key: "rate", label: "Steel rate", unit: "₹/kg", default: 72 },
    ],
    compute: (v) => {
      const unit = (n(v["dia"]) * n(v["dia"])) / 162.2;
      const w = unit * n(v["len"]);
      return [
        { label: "Unit weight", value: `${f(unit, 3)} kg/m`, hint: "d² / 162.2", highlight: true },
        { label: "Total weight", value: `${f(w, 2)} kg`, hint: `${f(w / 1000, 3)} ton` },
        { label: "Bars of 12 m", value: `${f(n(v["len"]) / 12, 1)} nos` },
        { label: "Steel cost", value: inr(w * n(v["rate"])) },
      ];
    },
    guide: guide("steel weight", [
      "The approximate unit weight of a round bar can be calculated from its diameter and steel density. The result is useful for estimating; final procurement should follow the bar schedule and actual supplied weights.",
      "Standard bar lengths and cutting plans affect the number of pieces and wastage. Nesting bars against the available stock lengths can reduce offcuts.",
      "For structural steel sections, use the manufacturer's or section-table mass rather than applying the rebar formula to a non-round section.",
    ]),
  },
  {
    slug: "lap-length-development",
    name: "Lap & Development Length",
    short: "Tension/compression lap and Ld for a given bar, grade and concrete.",
    category: "Structural",
    keywords: ["lap length", "development length", "ld", "anchorage", "splice", "is 456"],
    icon: "Link2",
    seoTitle: "Lap & Development Length | Free Online Calculator",
    seoDescription: "Tension/compression lap and Ld for a given bar, grade and concrete.",
    fields: [
      { key: "dia", label: "Bar diameter", unit: "mm", default: 16 },
      {
        key: "grade",
        label: "Concrete grade",
        default: "M25",
        options: ["M20", "M25", "M30", "M35", "M40"].map((g) => ({ value: g, label: g })),
      },
      {
        key: "steel",
        label: "Steel grade",
        default: "Fe500",
        options: ["Fe415", "Fe500", "Fe550"].map((g) => ({ value: g, label: g })),
      },
    ],
    compute: (v) => {
      const tbd: Record<string, number> = { M20: 1.2, M25: 1.4, M30: 1.5, M35: 1.7, M40: 1.9 };
      const fy: Record<string, number> = { Fe415: 415, Fe500: 500, Fe550: 550 };
      const d = n(v["dia"]);
      const bond = (tbd[String(v["grade"])] ?? 1.4) * 1.6; // deformed bars in tension
      const sigma = 0.87 * (fy[String(v["steel"])] ?? 500);
      const ld = (d * sigma) / (4 * bond);
      return [
        { label: "Development length Ld", value: `${f(ld, 0)} mm`, hint: `${f(ld / d, 0)}d`, highlight: true },
        { label: "Tension lap", value: `${f(ld, 0)} mm`, hint: "or 30d, whichever is greater" },
        { label: "Compression lap", value: `${f(ld * 0.8, 0)} mm`, hint: "or 24d minimum" },
        { label: "Design bond stress τbd", value: `${f(bond, 2)} MPa`, hint: "1.6× for deformed bars" },
      ];
    },
    guide: guide("lap and development length", [
      "Development length depends on bar diameter, steel stress, concrete grade, bond conditions and the applicable design standard. The calculator uses simplified assumptions and should not replace the reinforcement drawing.",
      "Lap length is not always equal to development length. Location, bar arrangement, stress condition, splice percentage and code provisions can change the required value.",
      "Keep laps, anchorage and curtailment consistent with the approved reinforcement detailing. High-stress regions may require special treatment.",
    ]),
  },
  {
    slug: "shuttering-formwork",
    name: "Shuttering / Formwork Area",
    short: "Contact area, plywood sheets and props for slabs, beams and columns.",
    category: "Structural",
    keywords: ["shuttering", "formwork", "plywood", "props", "contact area", "centering"],
    icon: "SquareStack",
    seoTitle: "Shuttering / Formwork Area | Free Online Calculator",
    seoDescription: "Contact area, plywood sheets and props for slabs, beams and columns.",
    fields: [
      {
        key: "member",
        label: "Member",
        default: "slab",
        options: [
          { value: "slab", label: "Slab (soffit)" },
          { value: "beam", label: "Beam (2 sides + soffit)" },
          { value: "column", label: "Column (4 faces)" },
        ],
      },
      { key: "l", label: "Length", unit: "m", default: 5 },
      { key: "b", label: "Width / breadth", unit: "m", default: 4 },
      { key: "d", label: "Depth / height", unit: "m", default: 0.45 },
      { key: "rate", label: "Shuttering rate", unit: "₹/m²", default: 240 },
    ],
    compute: (v) => {
      const m = String(v["member"]);
      const L = n(v["l"]);
      const B = n(v["b"]);
      const D = n(v["d"]);
      const area = m === "slab" ? L * B : m === "beam" ? L * (B + 2 * D) : 2 * (B + D) * L;
      return [
        { label: "Contact area", value: `${f(area, 2)} m²`, hint: `${f(area * 10.7639, 0)} sq.ft`, highlight: true },
        { label: "Plywood sheets (8'×4')", value: `${Math.ceil(area / 2.97)} nos` },
        { label: "Props / supports", value: m === "slab" ? `${Math.ceil(area / 1.2)} nos` : "as per design" },
        { label: "Shuttering cost", value: inr(area * n(v["rate"])) },
      ];
    },
    guide: guide("shuttering and formwork", [
      "Formwork quantity is based on the concrete faces that actually contact the shuttering. Slabs, beams and columns therefore use different measurement approaches.",
      "Sheet count depends on the panel size, cutting pattern and reuse strategy. Props and supports must be designed for the loads and construction sequence rather than estimated from area alone.",
      "Stripping time depends on concrete strength, span, temperature, member type and the approved method statement. Do not use a fixed day count as permission for early removal.",
    ]),
  },
  {
    slug: "staircase-design",
    name: "Staircase Quantity & Riser Check",
    short: "Riser/tread geometry, concrete volume and steel for a flight.",
    category: "Structural",
    keywords: ["staircase", "riser", "tread", "waist slab", "flight", "landing"],
    icon: "Footprints",
    seoTitle: "Staircase Quantity & Riser Check | Free Online Calculator",
    seoDescription: "Riser/tread geometry, concrete volume and steel for a flight.",
    fields: [
      { key: "height", label: "Floor to floor height", unit: "m", default: 3.2 },
      { key: "riser", label: "Target riser", unit: "mm", default: 165 },
      { key: "tread", label: "Tread", unit: "mm", default: 280 },
      { key: "width", label: "Stair width", unit: "m", default: 1.1 },
      { key: "waist", label: "Waist slab thickness", unit: "mm", default: 150 },
    ],
    compute: (v) => {
      const H = n(v["height"]) * 1000;
      const risers = Math.max(1, Math.round(H / Math.max(1, n(v["riser"]))));
      const actualRiser = H / risers;
      const treads = risers - 1;
      const going = (treads * n(v["tread"])) / 1000;
      const slope = Math.sqrt(Math.pow(going, 2) + Math.pow(H / 1000, 2));
      const waistVol = slope * n(v["width"]) * (n(v["waist"]) / 1000);
      const stepVol = 0.5 * (actualRiser / 1000) * (n(v["tread"]) / 1000) * n(v["width"]) * risers;
      const total = waistVol + stepVol;
      return [
        { label: "Number of risers", value: `${risers} nos`, highlight: true },
        { label: "Actual riser", value: `${f(actualRiser, 0)} mm`, hint: "keep 150–175 mm" },
        { label: "Treads", value: `${treads} nos`, hint: `going ${f(going, 2)} m` },
        { label: "Concrete volume", value: `${f(total, 3)} m³` },
        { label: "Reinforcement (approx.)", value: `${f(total * 110, 0)} kg`, hint: "110 kg/m³" },
        { label: "2R + T check", value: `${f(2 * actualRiser + n(v["tread"]), 0)} mm`, hint: "comfort range 550–700" },
      ];
    },
    guide: guide("staircase", [
      "Choose a target riser and tread, then calculate a whole-number riser count so the finished flight has uniform steps. Final geometry must satisfy the applicable building and accessibility requirements.",
      "The 2R + T relationship is a useful comfort check, but it is not the only stair-safety requirement. Landing size, headroom, width, handrails and local rules also matter.",
      "Concrete and reinforcement quantities depend on the actual stair geometry and structural system. Treat the reinforcement output as a rough planning allowance only.",
    ]),
  },
  {
    slug: "retaining-wall",
    name: "Retaining Wall Estimator",
    short: "Concrete, steel and earth pressure check for a cantilever wall.",
    category: "Structural",
    keywords: ["retaining wall", "cantilever", "earth pressure", "stem", "heel", "toe"],
    icon: "Fence",
    seoTitle: "Retaining Wall Estimator | Free Online Calculator",
    seoDescription: "Concrete, steel and earth pressure check for a cantilever wall.",
    fields: [
      { key: "h", label: "Retained height", unit: "m", default: 3 },
      { key: "len", label: "Wall length", unit: "m", default: 10 },
      { key: "stem", label: "Stem thickness (avg)", unit: "mm", default: 300 },
      { key: "base", label: "Base thickness", unit: "mm", default: 400 },
      { key: "soil", label: "Soil density", unit: "kN/m³", default: 18 },
      { key: "phi", label: "Angle of friction", unit: "°", default: 30 },
    ],
    compute: (v) => {
      const h = n(v["h"]);
      const baseW = 0.6 * h;
      const stemVol = (n(v["stem"]) / 1000) * h * n(v["len"]);
      const baseVol = (n(v["base"]) / 1000) * baseW * n(v["len"]);
      const total = stemVol + baseVol;
      const ka = Math.pow(Math.tan((45 - n(v["phi"]) / 2) * (Math.PI / 180)), 2);
      const pa = 0.5 * ka * n(v["soil"]) * h * h;
      return [
        { label: "Suggested base width", value: `${f(baseW, 2)} m`, hint: "0.5–0.7 × H", highlight: true },
        { label: "Concrete volume", value: `${f(total, 2)} m³` },
        { label: "Active pressure coeff. Ka", value: f(ka, 3) },
        { label: "Lateral thrust per metre", value: `${f(pa, 2)} kN/m`, hint: `acting at H/3 = ${f(h / 3, 2)} m` },
        { label: "Reinforcement (approx.)", value: `${f(total * 100, 0)} kg` },
      ];
    },
    guide: guide("retaining wall", [
      "A preliminary cantilever wall check starts with geometry and soil parameters, but the final design also depends on surcharge, groundwater, backfill slope, seismic effects and foundation conditions.",
      "Active earth pressure coefficients are model-dependent. The simple result shown here assumes idealised granular backfill conditions and should not be used where those assumptions do not apply.",
      "Drainage is an important part of retaining-wall design. Water pressure, filters, drains and outlet details should be designed and maintained as part of the wall system.",
    ]),
  },
  {
    slug: "pile-foundation",
    name: "Pile Foundation Capacity",
    short: "Concrete volume, steel and indicative bearing capacity per pile.",
    category: "Structural",
    keywords: ["pile", "bored pile", "capacity", "skin friction", "end bearing", "cap"],
    icon: "Anchor",
    seoTitle: "Pile Foundation Capacity | Free Online Calculator",
    seoDescription: "Concrete volume, steel and indicative bearing capacity per pile.",
    fields: [
      { key: "dia", label: "Pile diameter", unit: "mm", default: 600 },
      { key: "len", label: "Pile length", unit: "m", default: 15 },
      { key: "nos", label: "Number of piles", default: 4 },
      { key: "cohesion", label: "Avg. cohesion", unit: "kPa", default: 60 },
      { key: "nq", label: "End bearing capacity", unit: "kPa", default: 900 },
    ],
    compute: (v) => {
      const d = n(v["dia"]) / 1000;
      const area = Math.PI * Math.pow(d / 2, 2);
      const vol = area * n(v["len"]);
      const skin = Math.PI * d * n(v["len"]) * 0.6 * n(v["cohesion"]);
      const end = area * n(v["nq"]);
      const ult = skin + end;
      return [
        { label: "Concrete per pile", value: `${f(vol, 2)} m³`, highlight: true },
        { label: "Total concrete", value: `${f(vol * n(v["nos"]), 2)} m³`, hint: `${f(n(v["nos"]), 0)} piles` },
        { label: "Skin friction", value: `${f(skin, 0)} kN`, hint: "α = 0.6" },
        { label: "End bearing", value: `${f(end, 0)} kN` },
        { label: "Safe capacity", value: `${f(ult / 2.5, 0)} kN`, hint: "FoS 2.5" },
        { label: "Reinforcement", value: `${f(vol * n(v["nos"]) * 100, 0)} kg` },
      ];
    },
    guide: guide("pile foundation", [
      "Pile capacity depends on the soil profile, pile construction method, diameter, length and groundwater conditions. A single cohesion and end-bearing input cannot represent every soil layer.",
      "The calculator provides an indicative capacity using simplified assumptions. Final working capacity requires the applicable design method, group effects and project testing.",
      "Include pile overbreak, reinforcement, pile caps, cut-off, concrete wastage and testing as separate estimate items where they are within the project scope.",
    ]),
  },
  {
    slug: "soil-bearing-capacity",
    name: "Safe Bearing Capacity",
    short: "Terzaghi ultimate and safe bearing capacity for shallow footings.",
    category: "Quality Control",
    keywords: ["sbc", "bearing capacity", "terzaghi", "footing", "soil", "settlement"],
    icon: "Mountain",
    seoTitle: "Safe Bearing Capacity | Free Online Calculator",
    seoDescription: "Terzaghi ultimate and safe bearing capacity for shallow footings.",
    fields: [
      { key: "c", label: "Cohesion", unit: "kPa", default: 20 },
      { key: "gamma", label: "Soil density", unit: "kN/m³", default: 18 },
      { key: "depth", label: "Foundation depth", unit: "m", default: 1.5 },
      { key: "width", label: "Footing width", unit: "m", default: 1.5 },
      { key: "phi", label: "Angle of friction", unit: "°", default: 25 },
      { key: "fos", label: "Factor of safety", default: 3 },
    ],
    compute: (v) => {
      const phi = (n(v["phi"]) * Math.PI) / 180;
      const nq = Math.exp(Math.PI * Math.tan(phi)) * Math.pow(Math.tan(Math.PI / 4 + phi / 2), 2);
      const nc = n(v["phi"]) === 0 ? 5.14 : (nq - 1) / Math.tan(phi);
      const ng = 2 * (nq + 1) * Math.tan(phi);
      const q = n(v["gamma"]) * n(v["depth"]);
      const qu = n(v["c"]) * nc + q * nq + 0.5 * n(v["gamma"]) * n(v["width"]) * ng;
      const safe = qu / Math.max(1, n(v["fos"]));
      return [
        { label: "Ultimate bearing capacity", value: `${f(qu, 0)} kPa`, highlight: true },
        { label: "Net safe bearing capacity", value: `${f(safe - q, 0)} kPa` },
        { label: "Safe bearing pressure", value: `${f(safe, 0)} kPa`, hint: `${f(safe / 9.81, 1)} t/m²` },
        { label: "Bearing factors", value: `Nc ${f(nc, 1)} · Nq ${f(nq, 1)} · Nγ ${f(ng, 1)}` },
      ];
    },
    guide: guide("bearing capacity", [
      "Shallow-foundation bearing capacity depends on soil strength, density, footing geometry, depth and groundwater. The simplified calculation is intended for preliminary checks.",
      "Safety factors and net/gross bearing pressure conventions must follow the design basis used for the project. Do not treat the displayed value as a geotechnical approval.",
      "Settlement can govern even when a bearing-capacity calculation appears satisfactory. A site investigation and settlement assessment are needed for final foundation design.",
    ]),
  },
  {
    slug: "bill-of-quantities",
    name: "BOQ Rate Analysis",
    short: "Line-item rate build-up with material, labour, overhead and profit.",
    category: "Real Estate & Finance",
    keywords: ["boq", "rate analysis", "overhead", "profit", "tender", "line item"],
    icon: "ClipboardList",
    seoTitle: "BOQ Rate Analysis | Free Online Calculator",
    seoDescription: "Line-item rate build-up with material, labour, overhead and profit.",
    fields: [
      { key: "qty", label: "Quantity", default: 100 },
      { key: "mat", label: "Material cost", unit: "₹/unit", default: 4200 },
      { key: "lab", label: "Labour cost", unit: "₹/unit", default: 900 },
      { key: "plant", label: "Plant & tools", unit: "₹/unit", default: 150 },
      { key: "oh", label: "Overhead", unit: "%", default: 10 },
      { key: "profit", label: "Profit", unit: "%", default: 10 },
      { key: "gst", label: "GST", unit: "%", default: 18 },
    ],
    compute: (v) => {
      const direct = n(v["mat"]) + n(v["lab"]) + n(v["plant"]);
      const withOh = direct * (1 + n(v["oh"]) / 100);
      const rate = withOh * (1 + n(v["profit"]) / 100);
      const amount = rate * n(v["qty"]);
      return [
        { label: "Direct cost / unit", value: inr(direct) },
        { label: "Quoted rate / unit", value: inr(rate), highlight: true },
        { label: "Line amount", value: inr(amount) },
        { label: "GST", value: inr((amount * n(v["gst"])) / 100) },
        { label: "Amount incl. GST", value: inr(amount * (1 + n(v["gst"]) / 100)) },
      ];
    },
    guide: guide("BOQ rate analysis", [
      "A practical unit rate normally separates materials, labour, plant, overheads, profit and applicable taxes. Keeping these components visible makes revisions and tender comparisons easier.",
      "Overhead and profit percentages are commercial inputs, not universal statutory values. Use the contract, company policy and current tender conditions for the final rate.",
      "Tax treatment should be shown separately unless the tender explicitly requires an inclusive rate. Confirm the applicable tax treatment for the specific supply or works contract.",
    ]),
  },
  {
    slug: "labour-productivity",
    name: "Labour & Manpower Planner",
    short: "Crew size, man-days and wage cost from output norms.",
    category: "Real Estate & Finance",
    keywords: ["labour", "manpower", "productivity", "man-days", "crew", "wages"],
    icon: "Users",
    seoTitle: "Labour & Manpower Planner | Free Online Calculator",
    seoDescription: "Crew size, man-days and wage cost from output norms.",
    fields: [
      { key: "qty", label: "Total quantity", default: 500 },
      { key: "output", label: "Output per man-day", default: 4 },
      { key: "days", label: "Target duration", unit: "days", default: 20 },
      { key: "wage", label: "Daily wage", unit: "₹", default: 750 },
    ],
    compute: (v) => {
      const manDays = n(v["output"]) > 0 ? n(v["qty"]) / n(v["output"]) : 0;
      const crew = n(v["days"]) > 0 ? manDays / n(v["days"]) : 0;
      return [
        { label: "Total man-days", value: `${f(manDays, 1)}`, highlight: true },
        { label: "Crew size required", value: `${Math.ceil(crew)} workers` },
        { label: "Wage cost", value: inr(manDays * n(v["wage"])) },
        { label: "Cost per unit", value: inr(n(v["qty"]) > 0 ? (manDays * n(v["wage"])) / n(v["qty"]) : 0) },
      ];
    },
    guide: guide("labour planning", [
      "Man-days are estimated by dividing the required quantity by the selected productivity rate. Productivity is affected by crew skill, access, material handling, weather, rework and site congestion.",
      "Crew size should be rounded to a practical working team and checked against the programme. A small allowance for expected non-productive time can improve planning.",
      "Use recent site records for the best local productivity rates. Generic productivity figures are starting assumptions, not guarantees of output.",
    ]),
  },
  {
    slug: "project-cash-flow",
    name: "Project Cash Flow (S-Curve)",
    short: "Monthly billing, retention and net cash position across a project.",
    category: "Real Estate & Finance",
    keywords: ["cash flow", "s-curve", "retention", "billing", "milestone", "project"],
    icon: "LineChart",
    seoTitle: "Project Cash Flow (S-Curve) | Free Online Calculator",
    seoDescription: "Monthly billing, retention and net cash position across a project.",
    fields: [
      { key: "value", label: "Contract value", unit: "₹", default: 20000000 },
      { key: "months", label: "Duration", unit: "months", default: 12 },
      { key: "advance", label: "Mobilisation advance", unit: "%", default: 10 },
      { key: "retention", label: "Retention", unit: "%", default: 5 },
      { key: "margin", label: "Gross margin", unit: "%", default: 12 },
    ],
    compute: (v) => {
      const value = n(v["value"]);
      const months = Math.max(1, n(v["months"]));
      const monthly = value / months;
      const cost = value * (1 - n(v["margin"]) / 100);
      return [
        { label: "Average monthly billing", value: inr(monthly), highlight: true },
        { label: "Mobilisation advance", value: inr((value * n(v["advance"])) / 100) },
        { label: "Retention held", value: inr((value * n(v["retention"])) / 100) },
        { label: "Projected cost", value: inr(cost) },
        { label: "Gross profit", value: inr(value - cost) },
        { label: "Peak working capital (est.)", value: inr(monthly * 2.2), hint: "≈ 2 months of run-rate" },
      ];
    },
    guide: guide("project cash flow", [
      "Construction cash flow depends on billing milestones, certification time, mobilisation, retention, payment delays and the spending pattern. An average monthly value is useful for planning but does not reproduce a real project S-curve.",
      "Retention, advances and deductions should follow the contract. Their timing can materially change working-capital requirements.",
      "Working capital should be tested against the project's actual payment and procurement schedule. Arrange funding before the period when cumulative cash outflow is expected to peak.",
    ]),
  },
  {
    slug: "gst-on-property",
    name: "GST on Property & Works",
    short: "GST payable on under-construction property and works contracts.",
    category: "Real Estate & Finance",
    keywords: ["gst", "works contract", "affordable housing", "input tax credit", "property"],
    icon: "Receipt",
    seoTitle: "GST on Property & Works | Free Online Calculator",
    seoDescription: "GST payable on under-construction property and works contracts.",
    fields: [
      { key: "value", label: "Consideration", unit: "₹", default: 6000000 },
      {
        key: "type",
        label: "Category",
        default: "residential",
        options: [
          { value: "affordable", label: "Affordable housing (1%)" },
          { value: "residential", label: "Other residential (5%)" },
          { value: "commercial", label: "Commercial / works contract (18%)" },
          { value: "ready", label: "Ready with OC (nil)" },
        ],
      },
    ],
    compute: (v) => {
      const rates: Record<string, number> = { affordable: 1, residential: 5, commercial: 18, ready: 0 };
      const r = rates[String(v["type"])] ?? 5;
      const gst = (n(v["value"]) * r) / 100;
      return [
        { label: "Applicable GST rate", value: `${r}%`, highlight: true },
        { label: "GST payable", value: inr(gst) },
        { label: "Total outgo", value: inr(n(v["value"]) + gst) },
        {
          label: "Input tax credit",
          value: r === 18 ? "Available" : "Not available",
          hint: "1% and 5% schemes are without ITC",
        },
      ];
    },
    guide: guide("GST on property", [
      "Tax treatment depends on the type of transaction, project status, applicable notification and the facts of the supply. This calculator is a preliminary illustration, not tax advice.",
      "Rates and input-tax-credit treatment can change through government notifications and may differ by category. Verify the current rules before using the result for a purchase or filing.",
      "For a property transaction, confirm whether the consideration, construction status and buyer/seller circumstances match the category selected in the tool.",
    ]),
  },
  {
    slug: "property-tax",
    name: "Property Tax Estimator",
    short: "Annual municipal tax from unit area value and usage factors.",
    category: "Real Estate & Finance",
    keywords: ["property tax", "municipal", "unit area", "annual value", "rebate"],
    icon: "Building",
    seoTitle: "Property Tax Estimator | Free Online Calculator",
    seoDescription: "Annual municipal tax from unit area value and usage factors.",
    fields: [
      { key: "area", label: "Built-up area", unit: "sq.ft", default: 1200 },
      { key: "uav", label: "Unit area value", unit: "₹/sqft/yr", default: 24 },
      { key: "occupancy", label: "Occupancy factor", default: 1 },
      { key: "age", label: "Age factor", default: 0.9 },
      { key: "rate", label: "Tax rate", unit: "%", default: 12 },
      { key: "rebate", label: "Early payment rebate", unit: "%", default: 5 },
    ],
    compute: (v) => {
      const av = n(v["area"]) * n(v["uav"]) * n(v["occupancy"]) * n(v["age"]);
      const tax = (av * n(v["rate"])) / 100;
      return [
        { label: "Annual value", value: inr(av), highlight: true },
        { label: "Property tax", value: inr(tax) },
        { label: "After rebate", value: inr(tax * (1 - n(v["rebate"]) / 100)) },
        { label: "Per month provision", value: inr(tax / 12) },
      ];
    },
    guide: guide("property tax", [
      "Municipal property-tax systems differ by city and may use annual rental value, unit-area value, capital value or another local method. The calculator uses the inputs you provide rather than applying one national formula.",
      "Occupancy, age, use, location and rebates can affect the assessment. Enter the factors used by the relevant municipal authority.",
      "Use the latest municipal assessment or bill for a payment decision. A calculator estimate should not override an official demand notice.",
    ]),
  },
  {
    slug: "loan-eligibility",
    name: "Home Loan Eligibility",
    short: "Maximum loan from income, FOIR and tenure with affordability check.",
    category: "Real Estate & Finance",
    keywords: ["eligibility", "foir", "income", "loan amount", "affordability", "ltv"],
    icon: "BadgeIndianRupee",
    seoTitle: "Home Loan Eligibility | Free Online Calculator",
    seoDescription: "Maximum loan from income, FOIR and tenure with affordability check.",
    fields: [
      { key: "income", label: "Net monthly income", unit: "₹", default: 120000 },
      { key: "obligations", label: "Existing EMIs", unit: "₹", default: 15000 },
      { key: "foir", label: "FOIR limit", unit: "%", default: 50 },
      { key: "rate", label: "Interest rate", unit: "% p.a.", default: 8.6 },
      { key: "years", label: "Tenure", unit: "years", default: 20 },
      { key: "ltv", label: "Loan to value", unit: "%", default: 80 },
    ],
    compute: (v) => {
      const capacity = (n(v["income"]) * n(v["foir"])) / 100 - n(v["obligations"]);
      const r = n(v["rate"]) / 1200;
      const nMonths = n(v["years"]) * 12;
      const principal = r > 0 ? (capacity * (Math.pow(1 + r, nMonths) - 1)) / (r * Math.pow(1 + r, nMonths)) : capacity * nMonths;
      const property = n(v["ltv"]) > 0 ? (principal * 100) / n(v["ltv"]) : 0;
      return [
        { label: "EMI capacity", value: inr(Math.max(0, capacity)), highlight: true },
        { label: "Eligible loan amount", value: inr(Math.max(0, principal)) },
        { label: "Supportable property value", value: inr(Math.max(0, property)) },
        { label: "Own contribution needed", value: inr(Math.max(0, property - principal)) },
      ];
    },
    guide: guide("loan eligibility", [
      "Eligibility is influenced by income, existing obligations, lender policy, credit profile, interest rate, tenure and property value. The calculator provides a mathematical estimate from the values entered.",
      "An EMI-based estimate is not a loan sanction. Lenders may apply their own FOIR, LTV, minimum-income and documentation rules.",
      "Interest rates and lending policies change. Check the lender's current terms and include processing fees, insurance and other charges when comparing offers.",
    ]),
  },
  {
    slug: "rent-vs-buy",
    name: "Rent vs Buy Analyser",
    short: "Compare total cost of renting against owning over a holding period.",
    category: "Real Estate & Finance",
    keywords: ["rent vs buy", "opportunity cost", "appreciation", "holding period"],
    icon: "Scale",
    seoTitle: "Rent vs Buy Analyser | Free Online Calculator",
    seoDescription: "Compare total cost of renting against owning over a holding period.",
    fields: [
      { key: "price", label: "Property price", unit: "₹", default: 8000000 },
      { key: "down", label: "Down payment", unit: "%", default: 20 },
      { key: "rate", label: "Loan rate", unit: "% p.a.", default: 8.6 },
      { key: "years", label: "Holding period", unit: "years", default: 10 },
      { key: "rent", label: "Monthly rent", unit: "₹", default: 25000 },
      { key: "appr", label: "Appreciation", unit: "% p.a.", default: 6 },
      { key: "alt", label: "Alternative return", unit: "% p.a.", default: 9 },
    ],
    compute: (v) => {
      const price = n(v["price"]);
      const dp = (price * n(v["down"])) / 100;
      const loan = price - dp;
      const r = n(v["rate"]) / 1200;
      const yrs = Math.max(1, n(v["years"]));
      const nM = yrs * 12;
      const emi = r > 0 ? (loan * r * Math.pow(1 + r, nM)) / (Math.pow(1 + r, nM) - 1) : loan / nM;
      const ownCost = dp + emi * 12 * yrs + price * 0.01 * yrs;
      const future = price * Math.pow(1 + n(v["appr"]) / 100, yrs);
      const rentTotal = n(v["rent"]) * 12 * ((Math.pow(1.05, yrs) - 1) / 0.05);
      const invested = dp * Math.pow(1 + n(v["alt"]) / 100, yrs);
      return [
        { label: "EMI", value: inr(emi), highlight: true },
        { label: "Total cost of owning", value: inr(ownCost), hint: "down payment + EMIs + upkeep" },
        { label: "Property value after term", value: inr(future) },
        { label: "Net position — buy", value: inr(future - ownCost) },
        { label: "Total rent paid", value: inr(rentTotal), hint: "5% annual escalation" },
        { label: "Net position — rent + invest", value: inr(invested - rentTotal) },
      ];
    },
    guide: guide("rent versus buy", [
      "A useful comparison includes the purchase price, financing cost, down payment, maintenance, taxes, transaction costs and the opportunity cost of invested cash. Rent should be compared over the same time horizon.",
      "Future appreciation, rent growth and investment returns are assumptions, not guaranteed outcomes. Change them to match a realistic scenario and test more than one case.",
      "Non-financial factors such as mobility, security of tenure and intended holding period can be important even when the numerical result is close.",
    ]),
  },
  {
    slug: "fsi-far-calculator",
    name: "FSI / FAR & Coverage",
    short: "Permissible built-up area, ground coverage and setback check.",
    category: "Real Estate & Finance",
    keywords: ["fsi", "far", "ground coverage", "setback", "byelaws", "buildable"],
    icon: "LayoutGrid",
    seoTitle: "FSI / FAR & Coverage | Free Online Calculator",
    seoDescription: "Permissible built-up area, ground coverage and setback check.",
    fields: [
      { key: "plot", label: "Plot area", unit: "m²", default: 300 },
      { key: "fsi", label: "Permissible FSI", default: 1.8 },
      { key: "coverage", label: "Ground coverage", unit: "%", default: 60 },
      { key: "floors", label: "Proposed floors", default: 4 },
    ],
    compute: (v) => {
      const plot = n(v["plot"]);
      const buildable = plot * n(v["fsi"]);
      const footprint = (plot * n(v["coverage"])) / 100;
      const needed = n(v["floors"]) > 0 ? buildable / n(v["floors"]) : 0;
      return [
        { label: "Permissible built-up", value: `${f(buildable, 1)} m²`, hint: `${f(buildable * 10.7639, 0)} sq.ft`, highlight: true },
        { label: "Max ground footprint", value: `${f(footprint, 1)} m²` },
        { label: "Floor plate for target floors", value: `${f(needed, 1)} m²` },
        {
          label: "Coverage check",
          value: needed <= footprint ? "Within coverage" : "Exceeds ground coverage",
        },
      ];
    },
    guide: guide("FSI and FAR", [
      "FSI/FAR is generally the ratio between the counted floor area and the plot area, but the definition of counted area varies by local development rules.",
      "Coverage controls the footprint separately from total permissible floor area. Setbacks, height limits, parking and fire requirements can further restrict what can actually be built.",
      "Always verify the current local development-control rules before treating the calculated area as a building entitlement.",
    ]),
  },
  {
    slug: "brick-block-comparison",
    name: "Brick vs AAC Block Comparison",
    short: "Cost, weight and thermal comparison for a wall in brick or AAC.",
    category: "Civil & Construction",
    keywords: ["aac", "block", "brick", "comparison", "dead load", "insulation"],
    icon: "Blocks",
    seoTitle: "Brick vs AAC Block Comparison | Free Online Calculator",
    seoDescription: "Cost, weight and thermal comparison for a wall in brick or AAC.",
    fields: [
      { key: "area", label: "Wall area", unit: "m²", default: 100 },
      { key: "thk", label: "Wall thickness", unit: "mm", default: 200 },
      { key: "brickRate", label: "Brick rate", unit: "₹/1000", default: 7500 },
      { key: "aacRate", label: "AAC rate", unit: "₹/m³", default: 4200 },
    ],
    compute: (v) => {
      const area = n(v["area"]);
      const vol = (area * n(v["thk"])) / 1000;
      const bricks = Math.ceil(vol / 0.002);
      const brickCost = (bricks / 1000) * n(v["brickRate"]) + vol * 0.3 * 6000;
      const aacCost = vol * n(v["aacRate"]);
      return [
        { label: "Wall volume", value: `${f(vol, 2)} m³`, highlight: true },
        { label: "Clay bricks", value: `${bricks} nos`, hint: inr(brickCost) },
        { label: "AAC blocks", value: `${f(vol, 2)} m³`, hint: inr(aacCost) },
        { label: "Dead load — brick", value: `${f(vol * 1.9, 2)} ton`, hint: "1900 kg/m³" },
        { label: "Dead load — AAC", value: `${f(vol * 0.6, 2)} ton`, hint: "600 kg/m³" },
        { label: "Saving with AAC", value: inr(brickCost - aacCost) },
      ];
    },
    guide: guide("brick versus AAC", [
      "Material density, wall thickness, mortar or adhesive, labour and transport all affect the comparison. Lower-density blocks can reduce wall dead load, but the actual saving depends on the complete wall system.",
      "Thermal performance depends on block density, thickness, joints, plaster and climate. Use declared product properties when an energy calculation is required.",
      "Compare installed wall cost rather than unit material price alone. Include adhesive or mortar, reinforcement, lintels, wastage and finishing.",
    ]),
  },
  {
    slug: "cement-bag-converter",
    name: "Cement Bag & Volume Converter",
    short: "Convert between bags, kilograms, cubic metres and cubic feet.",
    category: "Civil & Construction",
    keywords: ["cement", "bag", "conversion", "1440", "cubic feet", "kg"],
    icon: "Package",
    seoTitle: "Cement Bag & Volume Converter | Free Online Calculator",
    seoDescription: "Convert between bags, kilograms, cubic metres and cubic feet.",
    fields: [
      { key: "qty", label: "Quantity", default: 10 },
      {
        key: "unit",
        label: "Input unit",
        default: "bags",
        options: [
          { value: "bags", label: "Bags (50 kg)" },
          { value: "kg", label: "Kilograms" },
          { value: "m3", label: "Cubic metres" },
          { value: "cft", label: "Cubic feet" },
        ],
      },
    ],
    compute: (v) => {
      const q = n(v["qty"]);
      const u = String(v["unit"]);
      const kg = u === "bags" ? q * 50 : u === "kg" ? q : u === "m3" ? q * 1440 : q * 1440 * 0.0283168;
      return [
        { label: "Weight", value: `${f(kg, 1)} kg`, highlight: true },
        { label: "Bags of 50 kg", value: `${f(kg / 50, 2)} bags` },
        { label: "Volume", value: `${f(kg / 1440, 4)} m³` },
        { label: "Volume", value: `${f((kg / 1440) * 35.3147, 3)} cu.ft`, hint: "cubic feet" },
      ];
    },
    guide: guide("cement conversion", [
      "A 50 kg cement bag can be converted to an approximate loose volume using an assumed bulk density. Actual packed and loose volume can vary with storage and handling.",
      "Volumetric batching should only be used where the mix and project specification permit it. For controlled structural concrete, follow the approved batching and mix-design procedure.",
      "Use the cement manufacturer's stated bag weight and the project's batching method for procurement and production records.",
    ]),
  },
  {
    slug: "aggregate-sand-volume",
    name: "Sand & Aggregate Volume",
    short: "Convert between tonnes, cubic metres, cubic feet and truck loads.",
    category: "Civil & Construction",
    keywords: ["sand", "aggregate", "tonne", "brass", "truck", "tipper", "cft"],
    icon: "Mountain",
    seoTitle: "Sand & Aggregate Volume | Free Online Calculator",
    seoDescription: "Convert between tonnes, cubic metres, cubic feet and truck loads.",
    fields: [
      { key: "qty", label: "Quantity", default: 100 },
      {
        key: "unit",
        label: "Input unit",
        default: "cft",
        options: [
          { value: "cft", label: "Cubic feet" },
          { value: "m3", label: "Cubic metres" },
          { value: "ton", label: "Tonnes" },
          { value: "brass", label: "Brass (100 cft)" },
        ],
      },
      { key: "density", label: "Bulk density", unit: "kg/m³", default: 1550 },
    ],
    compute: (v) => {
      const q = n(v["qty"]);
      const u = String(v["unit"]);
      const d = n(v["density"]) || 1550;
      const m3 = u === "m3" ? q : u === "cft" ? q * 0.0283168 : u === "brass" ? q * 2.83168 : (q * 1000) / d;
      return [
        { label: "Volume", value: `${f(m3, 3)} m³`, highlight: true },
        { label: "Cubic feet", value: `${f(m3 * 35.3147, 1)} cft` },
        { label: "Brass", value: `${f(m3 / 2.83168, 3)}` },
        { label: "Weight", value: `${f((m3 * d) / 1000, 2)} ton` },
        { label: "Tipper loads (6 m³)", value: `${f(m3 / 6, 2)} nos` },
      ];
    },
    guide: guide("sand and aggregate", [
      "A brass is 100 cubic feet, or 2.832 cubic metres — the traditional trade unit across western India. River sand is normally billed by brass, crushed aggregate by tonne, and both by cubic metre in formal contracts.",
      "Bulk densities differ: river sand about 1550 kg/m³, M-sand 1750, 20 mm coarse aggregate 1500 and 10 mm aggregate 1600. Always confirm which figure the supplier used before converting a tonnage quote.",
      "Damp sand bulks by up to 30% in volume, so a volumetric purchase during monsoon can deliver significantly less dry material than the invoice suggests. Weigh-bridge receipts avoid the dispute.",
    ]),
  },
  {
    slug: "wall-load-calculation",
    name: "Wall Load on Beam",
    short: "Dead load per running metre from masonry and plaster on a beam.",
    category: "Structural",
    keywords: ["wall load", "dead load", "udl", "beam", "masonry", "load calculation"],
    icon: "ArrowDownToLine",
    seoTitle: "Wall Load on Beam | Free Online Calculator",
    seoDescription: "Dead load per running metre from masonry and plaster on a beam.",
    fields: [
      { key: "thk", label: "Wall thickness", unit: "mm", default: 230 },
      { key: "h", label: "Wall height", unit: "m", default: 3 },
      {
        key: "material",
        label: "Masonry",
        default: "brick",
        options: [
          { value: "brick", label: "Burnt clay brick (19 kN/m³)" },
          { value: "aac", label: "AAC block (6 kN/m³)" },
          { value: "concrete", label: "Concrete block (24 kN/m³)" },
        ],
      },
      { key: "plaster", label: "Plaster both faces", unit: "mm", default: 12 },
    ],
    compute: (v) => {
      const dens: Record<string, number> = { brick: 19, aac: 6, concrete: 24 };
      const d = dens[String(v["material"])] ?? 19;
      const wall = (n(v["thk"]) / 1000) * n(v["h"]) * d;
      const plaster = ((2 * n(v["plaster"])) / 1000) * n(v["h"]) * 20.4;
      const total = wall + plaster;
      return [
        { label: "Masonry load", value: `${f(wall, 2)} kN/m`, highlight: true },
        { label: "Plaster load", value: `${f(plaster, 2)} kN/m` },
        { label: "Total UDL on beam", value: `${f(total, 2)} kN/m` },
        { label: "Factored (1.5×)", value: `${f(total * 1.5, 2)} kN/m` },
      ];
    },
    guide: guide("wall load", [
      "Wall load on a beam is based on wall thickness, height and material unit weight. Plaster or finishes should be added separately using their own thickness and density assumptions.",
      "The result is a service-load estimate unless the project design basis states otherwise. Load combinations and factors must be applied by the structural designer.",
      "Openings, bands, lintels and partial-height walls can reduce or redistribute the actual load. Use the architectural and structural drawings for the final load model.",
    ]),
  },
  {
    slug: "beam-deflection-check",
    name: "Beam Span / Depth Check",
    short: "Serviceability depth check against IS 456 span-to-depth limits.",
    category: "Structural",
    keywords: ["deflection", "span depth ratio", "serviceability", "is 456", "beam depth"],
    icon: "Ruler",
    seoTitle: "Beam Span / Depth Check | Free Online Calculator",
    seoDescription: "Serviceability depth check against IS 456 span-to-depth limits.",
    fields: [
      { key: "span", label: "Effective span", unit: "m", default: 5 },
      {
        key: "type",
        label: "Support condition",
        default: "simply",
        options: [
          { value: "cantilever", label: "Cantilever (7)" },
          { value: "simply", label: "Simply supported (20)" },
          { value: "continuous", label: "Continuous (26)" },
        ],
      },
      { key: "provided", label: "Provided depth", unit: "mm", default: 450 },
      { key: "mf", label: "Modification factor", default: 1 },
    ],
    compute: (v) => {
      const base: Record<string, number> = { cantilever: 7, simply: 20, continuous: 26 };
      const ratio = (base[String(v["type"])] ?? 20) * (n(v["mf"]) || 1);
      const required = (n(v["span"]) * 1000) / ratio;
      const prov = n(v["provided"]);
      return [
        { label: "Allowable span/depth", value: f(ratio, 1), highlight: true },
        { label: "Minimum effective depth", value: `${f(required, 0)} mm` },
        { label: "Provided depth", value: `${f(prov, 0)} mm` },
        { label: "Verdict", value: prov >= required ? "PASS — deflection OK" : "FAIL — increase depth" },
      ];
    },
    guide: guide("span to depth", [
      "IS 456 clause 23.2 controls deflection indirectly through basic span-to-effective-depth ratios: 7 for cantilevers, 20 for simply supported and 26 for continuous members, all for spans up to 10 m.",
      "The basic ratio is adjusted by a modification factor for tension reinforcement (up to about 1.4 for lightly stressed sections), compression reinforcement, and flanged beams.",
      "Passing the ratio check satisfies the code without an explicit deflection calculation. For spans above 10 m, or where finishes are deflection-sensitive, run the full short-term plus long-term deflection computation.",
    ]),
  },
  {
    slug: "curing-water",
    name: "Curing Water Requirement",
    short: "Water volume and duration for proper concrete curing.",
    category: "Quality Control",
    keywords: ["curing", "water", "ponding", "duration", "hydration", "is 456"],
    icon: "CloudRain",
    seoTitle: "Curing Water Requirement | Free Online Calculator",
    seoDescription: "Water volume and duration for proper concrete curing.",
    fields: [
      { key: "area", label: "Surface area", unit: "m²", default: 200 },
      { key: "days", label: "Curing period", unit: "days", default: 14 },
      {
        key: "method",
        label: "Method",
        default: "ponding",
        options: [
          { value: "ponding", label: "Ponding (slab)" },
          { value: "wet", label: "Wet covering / hessian" },
          { value: "compound", label: "Curing compound" },
        ],
      },
    ],
    compute: (v) => {
      const area = n(v["area"]);
      const per: Record<string, number> = { ponding: 5, wet: 2.5, compound: 0 };
      const daily = area * (per[String(v["method"])] ?? 5);
      const total = daily * n(v["days"]);
      return [
        { label: "Daily water", value: `${f(daily, 0)} litres`, highlight: true },
        { label: "Total water", value: `${f(total, 0)} litres`, hint: `${f(total / 1000, 2)} m³` },
        {
          label: "Curing compound",
          value: String(v["method"]) === "compound" ? `${f(area * 0.2, 1)} litres` : "not applicable",
        },
        { label: "Minimum period", value: "7 days OPC · 10–14 days blended cement" },
      ];
    },
    guide: guide("concrete curing", [
      "IS 456 requires a minimum of seven days of moist curing for OPC concrete and ten to fourteen days for concrete with mineral admixtures such as fly ash or GGBS, which hydrate more slowly.",
      "Ponding a slab consumes roughly 5 litres per square metre per day in Indian summer conditions; hessian covering with periodic wetting uses about half that. Curing compounds eliminate water use but must be applied at 0.2 litres/m² immediately after finishing.",
      "The first 24 hours matter most. Concrete that dries out early loses up to 30% of its potential strength and develops plastic shrinkage cracking that no later curing can repair.",
    ]),
  },
  {
    slug: "solar-rooftop",
    name: "Rooftop Solar Sizing",
    short: "Panel count, roof area, generation and payback for a rooftop plant.",
    category: "Infrastructure",
    keywords: ["solar", "rooftop", "kwp", "panels", "payback", "net metering"],
    icon: "Sun",
    seoTitle: "Rooftop Solar Sizing | Free Online Calculator",
    seoDescription: "Panel count, roof area, generation and payback for a rooftop plant.",
    fields: [
      { key: "units", label: "Monthly consumption", unit: "kWh", default: 500 },
      { key: "sun", label: "Peak sun hours", unit: "hrs/day", default: 4.5 },
      { key: "panel", label: "Panel rating", unit: "Wp", default: 545 },
      { key: "cost", label: "System cost", unit: "₹/kWp", default: 52000 },
      { key: "tariff", label: "Grid tariff", unit: "₹/kWh", default: 8.5 },
    ],
    compute: (v) => {
      const daily = n(v["units"]) / 30;
      const kwp = daily / (Math.max(0.1, n(v["sun"])) * 0.78);
      const panels = Math.ceil((kwp * 1000) / Math.max(1, n(v["panel"])));
      const capex = kwp * n(v["cost"]);
      const annualGeneration = kwp * Math.max(0.1, n(v["sun"])) * 365 * 0.78;
      const annualSaving = Math.min(n(v["units"]) * 12, annualGeneration) * n(v["tariff"]);
      return [
        { label: "System size", value: `${f(kwp, 2)} kWp`, highlight: true },
        { label: "Panels required", value: `${panels} nos` },
        { label: "Roof area needed", value: `${f(kwp * 9, 0)} m²`, hint: "planning allowance; layout varies" },
        { label: "Estimated annual generation", value: `${f(annualGeneration, 0)} kWh` },
        { label: "Capital cost", value: inr(capex) },
        { label: "Estimated annual saving", value: inr(annualSaving) },
        { label: "Simple payback", value: annualSaving > 0 ? `${f(capex / annualSaving, 1)} years` : "—" },
      ];
    },
    guide: guide("rooftop solar", [
      "PV sizing starts with energy use, local solar resource and a realistic performance ratio. Roof orientation, shading, temperature, inverter losses and system availability affect generation.",
      "Panel count and roof area depend on the chosen module rating and installation layout. Keep clearances, access paths and structural loading in the site assessment.",
      "Financial results are scenario estimates. Tariffs, export rules, subsidies, system cost and generation vary by location and change over time.",
    ]),
  },
  {
    slug: "rainwater-harvesting",
    name: "Rainwater Harvesting Potential",
    short: "Harvestable volume, tank sizing and recharge pit capacity.",
    category: "Infrastructure",
    keywords: ["rainwater", "harvesting", "recharge", "runoff coefficient", "catchment"],
    icon: "CloudDrizzle",
    seoTitle: "Rainwater Harvesting Potential | Free Online Calculator",
    seoDescription: "Harvestable volume, tank sizing and recharge pit capacity.",
    fields: [
      { key: "roof", label: "Catchment area", unit: "m²", default: 150 },
      { key: "rain", label: "Annual rainfall", unit: "mm", default: 900 },
      { key: "coeff", label: "Runoff coefficient", default: 0.85 },
      { key: "persons", label: "Household size", default: 4 },
    ],
    compute: (v) => {
      const vol = n(v["roof"]) * (n(v["rain"]) / 1000) * n(v["coeff"]);
      const litres = vol * 1000;
      const demand = n(v["persons"]) * 135 * 365;
      return [
        { label: "Harvestable water", value: `${f(litres, 0)} litres/yr`, hint: `${f(vol, 1)} m³`, highlight: true },
        { label: "Share of annual demand", value: demand > 0 ? `${f((litres / demand) * 100, 1)} %` : "—" },
        { label: "Suggested storage tank", value: `${f(litres / 12, 0)} litres`, hint: "one month of yield" },
        { label: "Recharge pit volume", value: `${f(vol * 0.1, 2)} m³` },
      ];
    },
    guide: guide("rainwater harvesting", [
      "Harvestable rainwater is estimated from catchment area, rainfall and a runoff coefficient. The coefficient should reflect the actual roof or paved surface.",
      "Storage size should consider rainfall distribution, demand, available space, overflow and the intended reuse. Annual yield alone does not determine the best tank size.",
      "First-flush and filtration arrangements should suit the roof, water-use purpose and local conditions. Recharge systems also require soil and groundwater assessment.",
    ]),
  },
];

export const SPEC_MAP: Record<string, ToolSpec> = Object.fromEntries(TOOL_SPECS.map((s) => [s.slug, s]));
