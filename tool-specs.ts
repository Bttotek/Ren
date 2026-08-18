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
  formula?: string;
  longDescription?: string;

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
  `The ${topic} calculator below follows standard Indian construction practice and the relevant IS-code conventions. Enter the site dimensions exactly as measured, press Calculate Now, then refine the quantities line by line in the live sheet before you export.`,
  ...body,
  "Treat every output as an indicative pre-tender estimate. Site conditions, wastage allowances, specification changes and local market rates all move the final figure, so validate against your drawings and approved rate analysis before procurement.",
];

export const TOOL_SPECS: ToolSpec[] = [
  /* ---------------- Civil & Construction ---------------- */
  {
    slug: "tile-flooring",
    name: "Tile & Flooring Calculator",
    short: "Tile count, wastage, adhesive and grout for any floor or wall area.",
    category: "Finishing",
    keywords: ["tile", "flooring", "vitrified", "adhesive", "grout", "skirting"],
    icon: "Grid3x3",
    seoTitle: "Tile & Flooring Calculator – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online tile & flooring calculator for quick calculation, quantity estimation and project planning. Tile count, wastage, adhesive and grout for any...",
    seoKeywords: ["tile", "flooring", "vitrified", "adhesive", "grout", "skirting"],
    formula: "Tile quantity is derived by dividing the net floor area by the effective area of a single tile, then adding a wastage factor. Seven percent suits straight-lay 600×600 vitrified tiles; raise it to 10–12% for diagonal patterns, small mosaics or rooms with many cut edges.",
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
    seoTitle: "Paint & Putty Calculator – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online paint & putty calculator for quick calculation, quantity estimation and project planning. Litres of primer, putty and finish paint for...",
    seoKeywords: ["paint", "putty", "primer", "emulsion", "coats", "coverage"],
    formula: "Coverage is the single largest variable. Premium interior emulsions cover 10–12 m² per litre per coat on a puttied surface, while the same paint on rough plaster may drop to 7 m². Exterior textured finishes can fall below 5 m² per litre.",
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
    seoTitle: "Waterproofing Estimator – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online waterproofing estimator for quick calculation, quantity estimation and project planning. Membrane, coating and chemical quantity for roofs,...",
    seoKeywords: ["waterproofing", "membrane", "app", "coating", "basement", "terrace"],
    formula: "Measure the treatment area including the vertical upturn at parapets and around drains — usually 300 mm minimum, and 150 mm above the finished floor level in wet areas. Skipping the upturn is the most common cause of early failure.",
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
    seoTitle: "False Ceiling Calculator – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online false ceiling calculator for quick calculation, quantity estimation and project planning. Gypsum board, channels, screws and jointing compound...",
    seoKeywords: ["false ceiling", "gypsum", "pop", "channel", "grid", "ceiling"],
    formula: "Gypsum ceilings are quantified in square feet of finished surface. A standard 1200×2400 mm board covers 2.88 m²; add 8% for cutting around light fittings, diffusers and level changes.",
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
      "Gypsum ceilings are quantified in square feet of finished surface. A standard 1200×2400 mm board covers 2.88 m²; add 8% for cutting around light fittings, diffusers and level changes.",
      "The framing grid drives half the cost: ceiling sections at 450 mm centres, intermediate channels at 1200 mm and soffit cleats at 900–1200 mm, all suspended from the slab with adjustable hangers.",
      "Jointing tape, compound and two coats of putty are consumables that add roughly 10% to the board cost and must be shown separately in the BOQ.",
    ]),
  },
  {
    slug: "wall-putty",
    name: "Wall Putty Coverage",
    short: "Putty bags, coats and cost for smooth wall finishing.",
    category: "Finishing",
    keywords: ["putty", "wall finish", "birla", "coverage", "smoothing"],
    icon: "Brush",
    seoTitle: "Wall Putty Coverage – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online wall putty coverage for quick calculation, quantity estimation and project planning. Putty bags, coats and cost for smooth wall finishing.",
    seoKeywords: ["putty", "wall finish", "birla", "coverage", "smoothing"],
    formula: "White cement based putty covers roughly 16–18 m² per kg-coat depending on plaster roughness; a practical planning figure is 0.6 kg/m² per coat, giving about 1.2 kg/m² for the standard two-coat system.",
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
      "White cement based putty covers roughly 16–18 m² per kg-coat depending on plaster roughness; a practical planning figure is 0.6 kg/m² per coat, giving about 1.2 kg/m² for the standard two-coat system.",
      "Mix with 38–40% water by weight and use the paste within 2–3 hours. Over-watering causes chalking and poor paint adhesion.",
      "Putty is not a waterproofing layer. On external faces use an exterior-grade acrylic putty or skip putty entirely and apply a high-build exterior emulsion.",
    ]),
  },
  {
    slug: "road-pavement",
    name: "Road & Pavement Quantity",
    short: "GSB, WMM, DBM and BC layer volumes and bitumen for a road stretch.",
    category: "Infrastructure",
    keywords: ["road", "pavement", "gsb", "wmm", "dbm", "bitumen", "bc", "highway"],
    icon: "Route",
    seoTitle: "Road & Pavement Quantity – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online road & pavement quantity for quick calculation, quantity estimation and project planning. GSB, WMM, DBM and BC layer volumes and bitumen for a...",
    seoKeywords: ["road", "pavement", "gsb", "wmm", "dbm", "bitumen"],
    formula: "Flexible pavement quantities follow the MORTH layer stack: granular sub-base, wet mix macadam, dense bituminous macadam and a bituminous concrete wearing course, each specified as a compacted thickness.",
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
      "Flexible pavement quantities follow the MORTH layer stack: granular sub-base, wet mix macadam, dense bituminous macadam and a bituminous concrete wearing course, each specified as a compacted thickness.",
      "Bituminous layers are procured by weight, not volume. Compacted DBM and BC both weigh close to 2.4 t/m³, and binder content runs about 4.5% for DBM and 5.5% for BC by mix weight.",
      "Add tack coat at 0.20–0.30 kg/m² between bituminous layers and prime coat at 0.6–1.0 kg/m² over the granular base. These small items are frequently missed and can be several lakh rupees on a kilometre of road.",
    ]),
  },
  {
    slug: "culvert-quantity",
    name: "Box Culvert Quantity",
    short: "Concrete and steel for RCC box culverts including wing walls.",
    category: "Infrastructure",
    keywords: ["culvert", "box", "hume pipe", "drain", "crossing", "rcc"],
    icon: "Waves",
    seoTitle: "Box Culvert Quantity – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online box culvert quantity for quick calculation, quantity estimation and project planning. Concrete and steel for RCC box culverts including wing...",
    seoKeywords: ["culvert", "box", "hume pipe", "drain", "crossing", "rcc"],
    formula: "A box culvert is quantified as the difference between the outer and inner cross-sectional areas multiplied by the barrel length. Wing walls, aprons and cut-off walls are measured separately.",
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
      "A box culvert is quantified as the difference between the outer and inner cross-sectional areas multiplied by the barrel length. Wing walls, aprons and cut-off walls are measured separately.",
      "Reinforcement in box culverts typically runs 110–140 kg/m³ because of the two-way haunched moment reinforcement at the corners; heavily loaded highway boxes can exceed 160 kg/m³.",
      "Shuttering is measured on both internal and external faces. Internal shuttering is the costlier item since it must be struck through the barrel after the concrete has gained strength.",
    ]),
  },
  {
    slug: "drainage-pipe",
    name: "Drainage & Sewer Line",
    short: "Trench excavation, bedding, pipe count and backfill for a pipeline.",
    category: "Infrastructure",
    keywords: ["drainage", "sewer", "pipe", "trench", "bedding", "manhole"],
    icon: "Pipette",
    seoTitle: "Drainage & Sewer Line – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online drainage & sewer line for quick calculation, quantity estimation and project planning. Trench excavation, bedding, pipe count and backfill for...",
    seoKeywords: ["drainage", "sewer", "pipe", "trench", "bedding", "manhole"],
    formula: "Trench width is fixed by the pipe outside diameter plus a working space of about 300 mm on each side. Deeper trenches also need shoring or battered sides, which increases the excavated volume substantially.",
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
      "Trench width is fixed by the pipe outside diameter plus a working space of about 300 mm on each side. Deeper trenches also need shoring or battered sides, which increases the excavated volume substantially.",
      "Bedding is a 150 mm compacted granular layer under the barrel, with haunching brought up to the pipe springing line so the load is carried evenly rather than on the socket.",
      "Backfill is the excavated volume less the bedding and the displaced pipe volume. Selected excavated material can usually be reused above the crown, but the first 300 mm surround should be imported granular fill.",
    ]),
  },
  {
    slug: "septic-tank",
    name: "Septic Tank Sizing",
    short: "Tank capacity, dimensions and soak pit sizing per IS 2470.",
    category: "Infrastructure",
    keywords: ["septic tank", "soak pit", "sewage", "is 2470", "capacity", "users"],
    icon: "Container",
    seoTitle: "Septic Tank Sizing – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online septic tank sizing for quick calculation, quantity estimation and project planning. Tank capacity, dimensions and soak pit sizing per IS 2470.",
    seoKeywords: ["septic tank", "soak pit", "sewage", "is 2470", "capacity", "users"],
    formula: "IS 2470 sizes a septic tank from the daily sewage flow multiplied by the detention period, plus a sludge storage allowance based on the desludging interval — typically two years for a domestic tank.",
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
      "IS 2470 sizes a septic tank from the daily sewage flow multiplied by the detention period, plus a sludge storage allowance based on the desludging interval — typically two years for a domestic tank.",
      "Keep the length-to-width ratio between 2:1 and 4:1 and the liquid depth between 1.0 m and 2.0 m. Add 300 mm of freeboard above the liquid level and provide a baffle wall at one-third of the length.",
      "The effluent still needs disposal. A soak pit or dispersion trench must be sized from the percolation rate of the soil and kept at least 15 m away from any drinking water source.",
    ]),
  },
  {
    slug: "water-tank-capacity",
    name: "Water Tank Capacity",
    short: "Litres, dimensions and demand check for overhead or underground tanks.",
    category: "Infrastructure",
    keywords: ["water tank", "capacity", "litres", "overhead", "sump", "demand"],
    icon: "Droplets",
    seoTitle: "Water Tank Capacity – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online water tank capacity for quick calculation, quantity estimation and project planning. Litres, dimensions and demand check for overhead or...",
    seoKeywords: ["water tank", "capacity", "litres", "overhead", "sump", "demand"],
    formula: "One cubic metre holds exactly 1000 litres, so tank capacity is simply length × width × liquid depth × 1000. Always quote the liquid depth, not the internal height, because 150–300 mm of freeboard is not usable storage.",
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
      "One cubic metre holds exactly 1000 litres, so tank capacity is simply length × width × liquid depth × 1000. Always quote the liquid depth, not the internal height, because 150–300 mm of freeboard is not usable storage.",
      "CPHEEO recommends 135 litres per capita per day for a domestic connection with full flushing. Design for one day of overhead storage plus one to two days of underground sump storage in areas with intermittent supply.",
      "A full tank is heavy: a 5000-litre overhead tank imposes five tonnes plus its own weight on the supporting structure, which must be checked in the column and beam design.",
    ]),
  },
  {
    slug: "compaction-density",
    name: "Field Compaction & Density",
    short: "Degree of compaction from field dry density against Proctor MDD.",
    category: "Quality Control",
    keywords: ["compaction", "proctor", "mdd", "omc", "field density", "core cutter"],
    icon: "Gauge",
    seoTitle: "Field Compaction & Density – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online field compaction & density for quick calculation, quantity estimation and project planning. Degree of compaction from field dry density...",
    seoKeywords: ["compaction", "proctor", "mdd", "omc", "field density", "core cutter"],
    formula: "Field dry density is the wet density divided by one plus the moisture content as a fraction. Comparing it with the laboratory maximum dry density from the modified Proctor test gives the degree of compaction.",
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
      "Field dry density is the wet density divided by one plus the moisture content as a fraction. Comparing it with the laboratory maximum dry density from the modified Proctor test gives the degree of compaction.",
      "Embankment layers are normally accepted at 95% of MDD and sub-grade at 97%; granular sub-base and WMM demand 98% or higher. Moisture at the time of rolling should be within ±2% of OMC.",
      "Take at least one core-cutter or sand-replacement test per 500 m² per layer, and always test the layer edges — the outer metre of an embankment is where compaction failures concentrate.",
    ]),
  },
  {
    slug: "concrete-cube-strength",
    name: "Concrete Cube Test Result",
    short: "Compressive strength from cube load with IS 456 acceptance check.",
    category: "Quality Control",
    keywords: ["cube test", "compressive strength", "is 456", "7 day", "28 day", "acceptance"],
    icon: "TestTube",
    seoTitle: "Concrete Cube Test Result – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online concrete cube test result for quick calculation, quantity estimation and project planning. Compressive strength from cube load with IS 456...",
    seoKeywords: ["cube test", "compressive strength", "is 456", "7 day", "28 day", "acceptance"],
    formula: "Compressive strength is the failure load divided by the loaded cross-sectional area. A 150 mm cube has 22 500 mm² of area, so a 700 kN failure corresponds to 31.1 MPa.",
    fields: [
      { key: "load", label: "Failure load", unit: "kN", default: 700 },
      { key: "size", label: "Cube size", unit: "mm", default: 150 },
      { key: "grade", label: "Design grade (fck)", unit: "MPa", default: 25 },
      { key: "age", label: "Age at test", unit: "days", default: 28 },
    ],
    compute: (v) => {
      const area = Math.pow(n(v["size"]), 2);
      const str = area > 0 ? (n(v["load"]) * 1000) / area : 0;
      const target = n(v["grade"]) + 0.825 * 4;
      const expected = n(v["age"]) <= 7 ? n(v["grade"]) * 0.65 : n(v["grade"]);
      return [
        { label: "Compressive strength", value: `${f(str, 2)} MPa`, highlight: true },
        { label: "Cube area", value: `${f(area, 0)} mm²` },
        { label: "Target mean strength", value: `${f(target, 2)} MPa`, hint: "fck + 1.65σ, σ = 4 for M25" },
        {
          label: `Acceptance at ${f(n(v["age"]), 0)} days`,
          value: str >= expected ? "PASS" : "BELOW EXPECTED",
          hint: `expected ≥ ${f(expected, 1)} MPa`,
        },
      ];
    },
    guide: guide("concrete cube testing", [
      "Compressive strength is the failure load divided by the loaded cross-sectional area. A 150 mm cube has 22 500 mm² of area, so a 700 kN failure corresponds to 31.1 MPa.",
      "IS 456 accepts a grade when the mean of any four consecutive test results exceeds fck + 0.825 times the established standard deviation (or fck + 4 MPa, whichever is greater), and no individual result falls more than 4 MPa below fck.",
      "Seven-day results are an early indicator only — expect around 65% of the 28-day strength for OPC concrete. Never reject a batch on a 7-day result alone; wait for the 28-day set or run accelerated curing tests.",
    ]),
  },
  {
    slug: "slump-workability",
    name: "Slump & Workability Guide",
    short: "Slump target, water demand check and workability class per placement.",
    category: "Quality Control",
    keywords: ["slump", "workability", "water cement ratio", "admixture", "cone"],
    icon: "FlaskConical",
    seoTitle: "Slump & Workability Guide – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online slump & workability guide for quick calculation, quantity estimation and project planning. Slump target, water demand check and workability...",
    seoKeywords: ["slump", "workability", "water cement ratio", "admixture", "cone"],
    formula: "The slump cone measures consistency, not strength. IS 456 links slump ranges to placement: 25–75 mm for mass concrete, 50–100 mm for lightly reinforced slabs, 75–125 mm for beams and columns, and 100–150 mm for pumped concrete.",
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
      "The slump cone measures consistency, not strength. IS 456 links slump ranges to placement: 25–75 mm for mass concrete, 50–100 mm for lightly reinforced slabs, 75–125 mm for beams and columns, and 100–150 mm for pumped concrete.",
      "Never add water on site to recover lost slump. Every extra 10 litres per cubic metre raises the water-cement ratio by roughly 0.03 and cuts 28-day strength by around 5%. Use a plasticiser instead.",
      "IS 456 caps the free water-cement ratio at 0.55 for moderate exposure, 0.50 for severe and 0.45 for very severe and marine conditions, regardless of what the strength calculation permits.",
    ]),
  },
  {
    slug: "steel-weight-chart",
    name: "Steel Weight & Section Chart",
    short: "Unit weight and total weight for rebar and structural steel sections.",
    category: "Structural",
    keywords: ["steel weight", "unit weight", "d2/162", "rebar", "section", "ismb"],
    icon: "Weight",
    seoTitle: "Steel Weight & Section Chart – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online steel weight & section chart for quick calculation, quantity estimation and project planning. Unit weight and total weight for rebar and...",
    seoKeywords: ["steel weight", "unit weight", "d2/162", "rebar", "section", "ismb"],
    formula: "The d²/162.2 relation comes straight from the density of steel: a bar of diameter d millimetres has a cross-sectional area of πd²/4 mm² and steel weighs 7850 kg/m³, which reduces to d²/162.2 kilograms per metre.",
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
      "The d²/162.2 relation comes straight from the density of steel: a bar of diameter d millimetres has a cross-sectional area of πd²/4 mm² and steel weighs 7850 kg/m³, which reduces to d²/162.2 kilograms per metre.",
      "Common unit weights worth memorising: 8 mm = 0.395, 10 mm = 0.617, 12 mm = 0.888, 16 mm = 1.578, 20 mm = 2.466, 25 mm = 3.854 and 32 mm = 6.313 kg/m.",
      "Rebar is supplied in 12 m standard lengths. Cutting schedules that ignore stock length generate offcuts; nesting bar marks against the 12 m length typically recovers 3–5% of the steel budget.",
    ]),
  },
  {
    slug: "lap-length-development",
    name: "Lap & Development Length",
    short: "Tension/compression lap and Ld for a given bar, grade and concrete.",
    category: "Structural",
    keywords: ["lap length", "development length", "ld", "anchorage", "splice", "is 456"],
    icon: "Link2",
    seoTitle: "Lap & Development Length – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online lap & development length for quick calculation, quantity estimation and project planning. Tension/compression lap and Ld for a given bar,...",
    seoKeywords: ["lap length", "development length", "ld", "anchorage", "splice", "is 456"],
    formula: "IS 456 clause 26.2.1 gives Ld = φ·σs / (4·τbd), where σs is 0.87fy at the design stress and τbd is the design bond stress for the concrete grade, increased by 60% for deformed bars.",
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
      "IS 456 clause 26.2.1 gives Ld = φ·σs / (4·τbd), where σs is 0.87fy at the design stress and τbd is the design bond stress for the concrete grade, increased by 60% for deformed bars.",
      "For Fe500 steel in M25 concrete this works out to roughly 47 diameters in tension, which is why the site rule of thumb of 50d is safe for most residential work.",
      "Stagger laps so that no more than 50% of bars are spliced at one section, keep laps out of high-moment zones, and never lap in a region where the section is in maximum tension unless the design specifically permits it.",
    ]),
  },
  {
    slug: "shuttering-formwork",
    name: "Shuttering / Formwork Area",
    short: "Contact area, plywood sheets and props for slabs, beams and columns.",
    category: "Structural",
    keywords: ["shuttering", "formwork", "plywood", "props", "contact area", "centering"],
    icon: "SquareStack",
    seoTitle: "Shuttering / Formwork Area – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online shuttering / formwork area for quick calculation, quantity estimation and project planning. Contact area, plywood sheets and props for slabs,...",
    seoKeywords: ["shuttering", "formwork", "plywood", "props", "contact area", "centering"],
    formula: "Formwork is measured as the contact area with concrete. A slab is measured on the soffit only, a beam on both sides plus the soffit, and a column on all four faces over its clear height.",
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
      "Formwork is measured as the contact area with concrete. A slab is measured on the soffit only, a beam on both sides plus the soffit, and a column on all four faces over its clear height.",
      "A standard 8'×4' film-faced plywood sheet covers 2.97 m². Sheets survive 8–12 repetitions with careful de-shuttering and release agent, which is what makes the per-use rate viable.",
      "IS 456 sets minimum striking times: 16–24 hours for vertical faces, 7 days for slab soffits with props left in, and 14–21 days for beam soffits spanning over 6 m. Early striking is the leading cause of slab deflection defects.",
    ]),
  },
  {
    slug: "staircase-design",
    name: "Staircase Quantity & Riser Check",
    short: "Riser/tread geometry, concrete volume and steel for a flight.",
    category: "Structural",
    keywords: ["staircase", "riser", "tread", "waist slab", "flight", "landing"],
    icon: "Footprints",
    seoTitle: "Staircase Quantity & Riser Check – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online staircase quantity & riser check for quick calculation, quantity estimation and project planning. Riser/tread geometry, concrete volume and...",
    seoKeywords: ["staircase", "riser", "tread", "waist slab", "flight", "landing"],
    formula: "The riser count is fixed first: divide the floor-to-floor height by the target riser and round to a whole number, then recompute the actual riser so every step in the flight is identical. Unequal risers are a trip hazard and a code violation.",
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
      "The riser count is fixed first: divide the floor-to-floor height by the target riser and round to a whole number, then recompute the actual riser so every step in the flight is identical. Unequal risers are a trip hazard and a code violation.",
      "The comfort rule 2R + T should land between 550 and 700 mm. A 165 mm riser with a 280 mm tread gives 610 mm, which is comfortable for residential use; public buildings favour a shallower 150/300 combination.",
      "Concrete volume is the inclined waist slab plus the triangular step volumes. Reinforcement runs about 100–120 kg/m³, with the main bars along the span of the waist and distribution steel across the width.",
    ]),
  },
  {
    slug: "retaining-wall",
    name: "Retaining Wall Estimator",
    short: "Concrete, steel and earth pressure check for a cantilever wall.",
    category: "Structural",
    keywords: ["retaining wall", "cantilever", "earth pressure", "stem", "heel", "toe"],
    icon: "Fence",
    seoTitle: "Retaining Wall Estimator – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online retaining wall estimator for quick calculation, quantity estimation and project planning. Concrete, steel and earth pressure check for a...",
    seoKeywords: ["retaining wall", "cantilever", "earth pressure", "stem", "heel", "toe"],
    formula: "A cantilever retaining wall is proportioned before it is analysed: base width 0.5–0.7 times the retained height, base thickness roughly H/12, stem thickness H/12 at the base tapering to 200–250 mm at the top.",
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
      "A cantilever retaining wall is proportioned before it is analysed: base width 0.5–0.7 times the retained height, base thickness roughly H/12, stem thickness H/12 at the base tapering to 200–250 mm at the top.",
      "Rankine active pressure uses Ka = tan²(45 − φ/2). For a granular backfill at φ = 30° this gives Ka = 0.333, and the resultant thrust acts at one-third of the height above the base.",
      "Drainage decides whether the wall survives. Weep holes at 1.5–2 m centres, a granular filter behind the stem and a perforated drain at the heel prevent hydrostatic pressure, which can double the design thrust.",
    ]),
  },
  {
    slug: "pile-foundation",
    name: "Pile Foundation Capacity",
    short: "Concrete volume, steel and indicative bearing capacity per pile.",
    category: "Structural",
    keywords: ["pile", "bored pile", "capacity", "skin friction", "end bearing", "cap"],
    icon: "Anchor",
    seoTitle: "Pile Foundation Capacity – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online pile foundation capacity for quick calculation, quantity estimation and project planning. Concrete volume, steel and indicative bearing...",
    seoKeywords: ["pile", "bored pile", "capacity", "skin friction", "end bearing", "cap"],
    formula: "Ultimate pile capacity is the sum of skin friction along the shaft and end bearing at the toe. In cohesive soils the adhesion factor α is taken as 0.4–0.7 of the undrained cohesion depending on stiffness.",
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
      "Ultimate pile capacity is the sum of skin friction along the shaft and end bearing at the toe. In cohesive soils the adhesion factor α is taken as 0.4–0.7 of the undrained cohesion depending on stiffness.",
      "A factor of safety of 2.5 on the ultimate capacity is standard for bored cast-in-situ piles, and the result must always be confirmed by an initial load test to 2.5 times the working load per IS 2911.",
      "Add 3–5% to the theoretical concrete volume for bore overbreak in loose strata, and remember the pile cap, lean concrete and pile cut-off wastage when preparing the BOQ.",
    ]),
  },
  {
    slug: "soil-bearing-capacity",
    name: "Safe Bearing Capacity",
    short: "Terzaghi ultimate and safe bearing capacity for shallow footings.",
    category: "Quality Control",
    keywords: ["sbc", "bearing capacity", "terzaghi", "footing", "soil", "settlement"],
    icon: "Mountain",
    seoTitle: "Safe Bearing Capacity – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online safe bearing capacity for quick calculation, quantity estimation and project planning. Terzaghi ultimate and safe bearing capacity for shallow...",
    seoKeywords: ["sbc", "bearing capacity", "terzaghi", "footing", "soil", "settlement"],
    formula: "Terzaghi's equation adds three contributions: cohesion times Nc, surcharge from the overburden times Nq, and the footing width term with Nγ. The bearing capacity factors depend only on the angle of internal friction.",
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
      "Terzaghi's equation adds three contributions: cohesion times Nc, surcharge from the overburden times Nq, and the footing width term with Nγ. The bearing capacity factors depend only on the angle of internal friction.",
      "A factor of safety of 2.5–3.0 is applied to the ultimate value. For most design work the net safe bearing capacity — safe capacity minus the overburden pressure — is the number that goes on the drawing.",
      "Bearing capacity is rarely the governing criterion in fine-grained soils; settlement usually is. Always check that the differential settlement stays within 1/500 of the span for framed structures.",
    ]),
  },
  {
    slug: "bill-of-quantities",
    name: "BOQ Rate Analysis",
    short: "Line-item rate build-up with material, labour, overhead and profit.",
    category: "Real Estate & Finance",
    keywords: ["boq", "rate analysis", "overhead", "profit", "tender", "line item"],
    icon: "ClipboardList",
    seoTitle: "BOQ Rate Analysis – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online boq rate analysis for quick calculation, quantity estimation and project planning. Line-item rate build-up with material, labour, overhead and...",
    seoKeywords: ["boq", "rate analysis", "overhead", "profit", "tender", "line item"],
    formula: "Every BOQ rate is built from four blocks: material at delivered cost including wastage, labour from the standard output per day, plant and tools, and then overhead and profit as percentages on the direct cost.",
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
      "Every BOQ rate is built from four blocks: material at delivered cost including wastage, labour from the standard output per day, plant and tools, and then overhead and profit as percentages on the direct cost.",
      "CPWD analysis of rates adds 15% for contractor's overhead and profit combined; competitive private tenders typically split it as 8–10% overhead and 8–12% profit depending on risk and payment terms.",
      "Keep GST outside the rate unless the tender explicitly asks for an inclusive quote. Mixing tax into the item rate makes comparison across bidders impossible and complicates variation pricing.",
    ]),
  },
  {
    slug: "labour-productivity",
    name: "Labour & Manpower Planner",
    short: "Crew size, man-days and wage cost from output norms.",
    category: "Real Estate & Finance",
    keywords: ["labour", "manpower", "productivity", "man-days", "crew", "wages"],
    icon: "Users",
    seoTitle: "Labour & Manpower Planner – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online labour & manpower planner for quick calculation, quantity estimation and project planning. Crew size, man-days and wage cost from output norms.",
    seoKeywords: ["labour", "manpower", "productivity", "man-days", "crew", "wages"],
    formula: "Man-days are the quantity divided by the productivity norm. Typical Indian site norms: 3–4 m² of 12 mm plaster per mason-day, 500 bricks per mason-day in 230 mm walls, and 100 kg of rebar cut and fixed per fitter-day.",
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
      "Man-days are the quantity divided by the productivity norm. Typical Indian site norms: 3–4 m² of 12 mm plaster per mason-day, 500 bricks per mason-day in 230 mm walls, and 100 kg of rebar cut and fixed per fitter-day.",
      "Crew size is man-days divided by the available working days, rounded up. Always add a 10–15% allowance for absenteeism, festivals and weather days in the monsoon months.",
      "Productivity falls sharply above four storeys without a hoist, in congested reinforcement, and in the last hour of a shift. Programme critical pours in the first half of the day.",
    ]),
  },
  {
    slug: "project-cash-flow",
    name: "Project Cash Flow (S-Curve)",
    short: "Monthly billing, retention and net cash position across a project.",
    category: "Real Estate & Finance",
    keywords: ["cash flow", "s-curve", "retention", "billing", "milestone", "project"],
    icon: "LineChart",
    seoTitle: "Project Cash Flow (S-Curve) – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online project cash flow (s-curve) for quick calculation, quantity estimation and project planning. Monthly billing, retention and net cash position...",
    seoKeywords: ["cash flow", "s-curve", "retention", "billing", "milestone", "project"],
    formula: "Construction billing follows an S-curve: slow in the mobilisation phase, steepest through the structural period, and flattening during finishing and snagging. Straight-line monthly billing overstates early cash inflow.",
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
      "Construction billing follows an S-curve: slow in the mobilisation phase, steepest through the structural period, and flattening during finishing and snagging. Straight-line monthly billing overstates early cash inflow.",
      "Retention of 5–10% is deducted from every running account bill and released half on practical completion and half after the defects liability period, so plan a year of blocked capital on it.",
      "Peak working capital typically equals two to three months of the run-rate spend. Sanction the overdraft before the structural peak, not after payments start slipping.",
    ]),
  },
  {
    slug: "gst-on-property",
    name: "GST on Property & Works",
    short: "GST payable on under-construction property and works contracts.",
    category: "Real Estate & Finance",
    keywords: ["gst", "works contract", "affordable housing", "input tax credit", "property"],
    icon: "Receipt",
    seoTitle: "GST on Property & Works – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online gst on property & works for quick calculation, quantity estimation and project planning. GST payable on under-construction property and works...",
    seoKeywords: ["gst", "works contract", "affordable housing", "input tax credit", "property"],
    formula: "GST applies only to under-construction property. Once the occupancy certificate is issued, a sale is treated as an immovable property transaction and attracts stamp duty but no GST.",
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
      "GST applies only to under-construction property. Once the occupancy certificate is issued, a sale is treated as an immovable property transaction and attracts stamp duty but no GST.",
      "Since April 2019 residential projects pay 1% on affordable housing and 5% on other residential units, both without input tax credit. Commercial construction and pure works contracts remain at 18% with ITC available.",
      "The affordable-housing threshold is a carpet area of 60 m² in metros or 90 m² elsewhere, with a value cap of ₹45 lakh. Missing either limit moves the whole unit to the 5% slab.",
    ]),
  },
  {
    slug: "property-tax",
    name: "Property Tax Estimator",
    short: "Annual municipal tax from unit area value and usage factors.",
    category: "Real Estate & Finance",
    keywords: ["property tax", "municipal", "unit area", "annual value", "rebate"],
    icon: "Building",
    seoTitle: "Property Tax Estimator – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online property tax estimator for quick calculation, quantity estimation and project planning. Annual municipal tax from unit area value and usage...",
    seoKeywords: ["property tax", "municipal", "unit area", "annual value", "rebate"],
    formula: "Most Indian municipalities have moved to the unit area system: annual value equals built-up area times a notified per-square-foot rate, adjusted by occupancy, age, structure and usage factors.",
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
      "Most Indian municipalities have moved to the unit area system: annual value equals built-up area times a notified per-square-foot rate, adjusted by occupancy, age, structure and usage factors.",
      "Self-occupied residential property attracts a lower occupancy factor than tenanted property, and buildings older than 20 years usually get a depreciation factor between 0.6 and 0.9.",
      "Rebates of 5–15% for payment within the first quarter are common and are the cheapest saving available to a property owner. Arrears typically attract 1–2% interest per month.",
    ]),
  },
  {
    slug: "loan-eligibility",
    name: "Home Loan Eligibility",
    short: "Maximum loan from income, FOIR and tenure with affordability check.",
    category: "Real Estate & Finance",
    keywords: ["eligibility", "foir", "income", "loan amount", "affordability", "ltv"],
    icon: "BadgeIndianRupee",
    seoTitle: "Home Loan Eligibility – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online home loan eligibility for quick calculation, quantity estimation and project planning. Maximum loan from income, FOIR and tenure with...",
    seoKeywords: ["eligibility", "foir", "income", "loan amount", "affordability", "ltv"],
    formula: "Lenders cap the fixed obligation to income ratio between 40% and 55% depending on income band. Your EMI capacity is that percentage of net income minus every existing EMI, including credit card minimums.",
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
      "Lenders cap the fixed obligation to income ratio between 40% and 55% depending on income band. Your EMI capacity is that percentage of net income minus every existing EMI, including credit card minimums.",
      "The eligible principal is the present value of that EMI stream at the offered rate over the chosen tenure. Extending tenure raises eligibility but the total interest paid rises faster than most borrowers expect.",
      "Loan-to-value is capped by RBI at 90% below ₹30 lakh, 80% between ₹30 and ₹75 lakh and 75% above that — and the cap applies to the property value excluding stamp duty and registration.",
    ]),
  },
  {
    slug: "rent-vs-buy",
    name: "Rent vs Buy Analyser",
    short: "Compare total cost of renting against owning over a holding period.",
    category: "Real Estate & Finance",
    keywords: ["rent vs buy", "opportunity cost", "appreciation", "holding period"],
    icon: "Scale",
    seoTitle: "Rent vs Buy Analyser – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online rent vs buy analyser for quick calculation, quantity estimation and project planning. Compare total cost of renting against owning over a...",
    seoKeywords: ["rent vs buy", "opportunity cost", "appreciation", "holding period"],
    formula: "The honest comparison is not EMI against rent. It is the total cost of ownership — down payment, interest, maintenance, tax and transaction cost — against rent paid plus the return your down payment would have earned elsewhere.",
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
      const nM = 240;
      const emi = r > 0 ? (loan * r * Math.pow(1 + r, nM)) / (Math.pow(1 + r, nM) - 1) : loan / nM;
      const yrs = n(v["years"]);
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
      "The honest comparison is not EMI against rent. It is the total cost of ownership — down payment, interest, maintenance, tax and transaction cost — against rent paid plus the return your down payment would have earned elsewhere.",
      "Buying wins when the holding period is long, appreciation beats the loan rate, and the rent-to-price yield in the market is above 3.5%. In most Indian metros the gross rental yield sits at 2.5–3%, which favours renting on pure arithmetic.",
      "Non-financial factors legitimately override the maths: security of tenure, the discipline of forced saving, and freedom to renovate are worth real money to most families.",
    ]),
  },
  {
    slug: "fsi-far-calculator",
    name: "FSI / FAR & Coverage",
    short: "Permissible built-up area, ground coverage and setback check.",
    category: "Real Estate & Finance",
    keywords: ["fsi", "far", "ground coverage", "setback", "byelaws", "buildable"],
    icon: "LayoutGrid",
    seoTitle: "FSI / FAR & Coverage – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online fsi / far & coverage for quick calculation, quantity estimation and project planning. Permissible built-up area, ground coverage and setback...",
    seoKeywords: ["fsi", "far", "ground coverage", "setback", "byelaws", "buildable"],
    formula: "Floor space index is the ratio of total built-up area to plot area. A 300 m² plot with FSI 1.8 permits 540 m² of construction, distributed across any number of floors subject to height and coverage limits.",
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
      "Floor space index is the ratio of total built-up area to plot area. A 300 m² plot with FSI 1.8 permits 540 m² of construction, distributed across any number of floors subject to height and coverage limits.",
      "Ground coverage limits the footprint independently of FSI. Even with generous FSI, a 60% coverage rule forces you to build taller rather than wider, and setbacks further reduce the usable footprint.",
      "Most municipalities exclude stilt parking, staircases, lift wells and service ducts from FSI, and several allow premium or TDR-based FSI above the base entitlement at a fee. Check the current development control regulations before you finalise the plan.",
    ]),
  },
  {
    slug: "brick-block-comparison",
    name: "Brick vs AAC Block Comparison",
    short: "Cost, weight and thermal comparison for a wall in brick or AAC.",
    category: "Civil & Construction",
    keywords: ["aac", "block", "brick", "comparison", "dead load", "insulation"],
    icon: "Blocks",
    seoTitle: "Brick vs AAC Block Comparison – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online brick vs aac block comparison for quick calculation, quantity estimation and project planning. Cost, weight and thermal comparison for a wall...",
    seoKeywords: ["aac", "block", "brick", "comparison", "dead load", "insulation"],
    formula: "AAC blocks weigh roughly one third of clay brick masonry — 550–650 kg/m³ against 1800–1950 kg/m³. On a multi-storey frame that reduction flows straight into smaller beams, columns and foundations.",
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
      "AAC blocks weigh roughly one third of clay brick masonry — 550–650 kg/m³ against 1800–1950 kg/m³. On a multi-storey frame that reduction flows straight into smaller beams, columns and foundations.",
      "Thermal conductivity of AAC is about 0.16 W/mK against 0.81 for burnt clay brick, which cuts the cooling load noticeably in hot climates and can help with energy code compliance.",
      "AAC needs thin-bed adhesive rather than thick cement mortar, and the labour output per mason-day is two to three times higher because of block size. Factor both into the comparison, not just the material rate.",
    ]),
  },
  {
    slug: "cement-bag-converter",
    name: "Cement Bag & Volume Converter",
    short: "Convert between bags, kilograms, cubic metres and cubic feet.",
    category: "Civil & Construction",
    keywords: ["cement", "bag", "conversion", "1440", "cubic feet", "kg"],
    icon: "Package",
    seoTitle: "Cement Bag & Volume Converter – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online cement bag & volume converter for quick calculation, quantity estimation and project planning. Convert between bags, kilograms, cubic metres...",
    seoKeywords: ["cement", "bag", "conversion", "1440", "cubic feet", "kg"],
    formula: "Loose cement has a bulk density of 1440 kg/m³, so one 50 kg bag occupies 0.0347 m³ or 1.226 cubic feet. That single figure underpins almost every mix-design conversion on site.",
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
        { label: "Volume", value: `${f((kg / 1440) * 35.3147, 3)} cu.ft` },
      ];
    },
    guide: guide("cement conversion", [
      "Loose cement has a bulk density of 1440 kg/m³, so one 50 kg bag occupies 0.0347 m³ or 1.226 cubic feet. That single figure underpins almost every mix-design conversion on site.",
      "Head-pans and farmas are still used for volumetric batching of small works. A standard farma of 350×250×400 mm holds exactly 0.035 m³ — one bag of cement — which is why it is sized that way.",
      "Volumetric batching is permitted only up to M20 nominal mixes. Above that, IS 456 requires weigh batching because the bulking of damp sand can distort volume proportions by 20–30%.",
    ]),
  },
  {
    slug: "aggregate-sand-volume",
    name: "Sand & Aggregate Volume",
    short: "Convert between tonnes, cubic metres, cubic feet and truck loads.",
    category: "Civil & Construction",
    keywords: ["sand", "aggregate", "tonne", "brass", "truck", "tipper", "cft"],
    icon: "Mountain",
    seoTitle: "Sand & Aggregate Volume – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online sand & aggregate volume for quick calculation, quantity estimation and project planning. Convert between tonnes, cubic metres, cubic feet and...",
    seoKeywords: ["sand", "aggregate", "tonne", "brass", "truck", "tipper"],
    formula: "A brass is 100 cubic feet, or 2.832 cubic metres — the traditional trade unit across western India. River sand is normally billed by brass, crushed aggregate by tonne, and both by cubic metre in formal contracts.",
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
    seoTitle: "Wall Load on Beam – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online wall load on beam for quick calculation, quantity estimation and project planning. Dead load per running metre from masonry and plaster on a beam.",
    seoKeywords: ["wall load", "dead load", "udl", "beam", "masonry", "load calculation"],
    formula: "Wall load per running metre is thickness × height × unit weight. A 230 mm brick wall three metres high delivers about 13.1 kN/m before plaster — the single largest dead load a typical residential beam carries.",
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
      "Wall load per running metre is thickness × height × unit weight. A 230 mm brick wall three metres high delivers about 13.1 kN/m before plaster — the single largest dead load a typical residential beam carries.",
      "Add 12 mm plaster on both faces at 20.4 kN/m³, which contributes roughly 1.5 kN/m on a 3 m wall. It is small individually but adds up across a whole floor plate.",
      "Switching to AAC blocks cuts the same wall to about 4.1 kN/m. On a large frame, that reduction alone can drop one bar diameter from most beams and shrink the foundation loads meaningfully.",
    ]),
  },
  {
    slug: "beam-deflection-check",
    name: "Beam Span / Depth Check",
    short: "Serviceability depth check against IS 456 span-to-depth limits.",
    category: "Structural",
    keywords: ["deflection", "span depth ratio", "serviceability", "is 456", "beam depth"],
    icon: "Ruler",
    seoTitle: "Beam Span / Depth Check – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online beam span / depth check for quick calculation, quantity estimation and project planning. Serviceability depth check against IS 456...",
    seoKeywords: ["deflection", "span depth ratio", "serviceability", "is 456", "beam depth"],
    formula: "IS 456 clause 23.2 controls deflection indirectly through basic span-to-effective-depth ratios: 7 for cantilevers, 20 for simply supported and 26 for continuous members, all for spans up to 10 m.",
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
    seoTitle: "Curing Water Requirement – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online curing water requirement for quick calculation, quantity estimation and project planning. Water volume and duration for proper concrete curing.",
    seoKeywords: ["curing", "water", "ponding", "duration", "hydration", "is 456"],
    formula: "IS 456 requires a minimum of seven days of moist curing for OPC concrete and ten to fourteen days for concrete with mineral admixtures such as fly ash or GGBS, which hydrate more slowly.",
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
    seoTitle: "Rooftop Solar Sizing – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online rooftop solar sizing for quick calculation, quantity estimation and project planning. Panel count, roof area, generation and payback for a...",
    seoKeywords: ["solar", "rooftop", "kwp", "panels", "payback", "net metering"],
    formula: "System size in kilowatt-peak is the daily energy requirement divided by peak sun hours and the system performance ratio, which is typically 0.75–0.80 after inverter, temperature, soiling and wiring losses.",
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
      const annualSaving = n(v["units"]) * 12 * n(v["tariff"]);
      return [
        { label: "System size", value: `${f(kwp, 2)} kWp`, highlight: true },
        { label: "Panels required", value: `${panels} nos` },
        { label: "Roof area needed", value: `${f(kwp * 9, 0)} m²`, hint: "≈9 m² per kWp" },
        { label: "Capital cost", value: inr(capex) },
        { label: "Annual saving", value: inr(annualSaving) },
        { label: "Simple payback", value: annualSaving > 0 ? `${f(capex / annualSaving, 1)} years` : "—" },
      ];
    },
    guide: guide("rooftop solar", [
      "System size in kilowatt-peak is the daily energy requirement divided by peak sun hours and the system performance ratio, which is typically 0.75–0.80 after inverter, temperature, soiling and wiring losses.",
      "Most of India receives 4.0–5.5 peak sun hours per day averaged annually. A 1 kWp system therefore generates roughly 1400–1600 kWh a year and needs about 9 m² of shade-free roof.",
      "Net metering makes the economics work: exported units offset imported units at the retail tariff. With tariffs above ₹8/kWh, simple payback commonly lands between four and six years against a 25-year panel warranty.",
    ]),
  },
  {
    slug: "rainwater-harvesting",
    name: "Rainwater Harvesting Potential",
    short: "Harvestable volume, tank sizing and recharge pit capacity.",
    category: "Infrastructure",
    keywords: ["rainwater", "harvesting", "recharge", "runoff coefficient", "catchment"],
    icon: "CloudDrizzle",
    seoTitle: "Rainwater Harvesting Potential – Free Online Calculator | BTTOTEK",
    seoDescription: "Free online rainwater harvesting potential for quick calculation, quantity estimation and project planning. Harvestable volume, tank sizing and recharge...",
    seoKeywords: ["rainwater", "harvesting", "recharge", "runoff coefficient", "catchment"],
    formula: "Harvestable volume is catchment area × rainfall depth × runoff coefficient. Use 0.85 for a clean RCC or tiled roof, 0.5–0.6 for paved courtyards and as low as 0.15 for unpaved ground.",
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
      "Harvestable volume is catchment area × rainfall depth × runoff coefficient. Use 0.85 for a clean RCC or tiled roof, 0.5–0.6 for paved courtyards and as low as 0.15 for unpaved ground.",
      "Size the storage tank for the yield of one or two heavy months rather than the full annual volume — beyond that, the marginal tank capacity sits empty for most of the year.",
      "Always fit a first-flush diverter to discard the initial 1–2 mm of rainfall carrying roof dust and bird droppings, followed by a filter before either the storage tank or the recharge pit.",
    ]),
  },
];

export const SPEC_MAP: Record<string, ToolSpec> = Object.fromEntries(TOOL_SPECS.map((s) => [s.slug, s]));
