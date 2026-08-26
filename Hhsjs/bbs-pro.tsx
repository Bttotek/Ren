import React, { useEffect, useMemo, useState } from "react";
import { useSheets } from "@/lib/sheet-context";
import { supabase } from "@/integrations/supabase/client";
import { getBBSSettings } from "@/lib/bbs-settings";

export interface BarEntry {
  id: string;
  sectionHeading: string;
  barName: string;
  straightLength: number;
  leftHook: number;
  rightHook: number;
  diameter: number;
  clearSpan: number;
  spacingMode: "L/1" | "L/3" | "L/4";
  spacingText: string;
  memberCount: number;
  barsPerMember: number;
  totalCutLength: number;
}

type AdminBBSConfig = {
  name?: string;
  description?: string;
  long_description?: string;
  category?: string;
  project_name?: string;
  billing_date?: string;
  section_heading?: string;
  steel_rate?: number;
  straight_length?: number;
  left_hook?: number;
  right_hook?: number;
  bar_name?: string;
  diameter?: number;
  clear_span?: number;
  spacing_text?: string;
  member_count?: number;
  bars_per_member?: number;
  total_cut_length?: number;
  spacing_mode?: "L/1" | "L/3" | "L/4";
  modal_span_meter?: number;
  modal_divide_mode?: "L/1" | "L/3" | "L/4";
  single_spacing?: number;
  zone1?: number;
  zone2?: number;
  zone3?: number;
};

type AdminToolRow = Record<string, unknown>;

const DEFAULT_BBS_CONFIG: Required<AdminBBSConfig> = {
  name: "Bar Bending Schedule (BBS)",
  description:
    "Live Bar Bending Schedule Engine with Auto Spacing & Instant Excel Generation",
  long_description: "",
  category: "Civil & Construction",
  project_name: "Shivam",
  billing_date: "2026-08-23",
  section_heading: "Footing",
  steel_rate: 65,
  straight_length: 3,
  left_hook: 0.3,
  right_hook: 0.3,
  bar_name: "Bottom",
  diameter: 32,
  clear_span: 3000,
  spacing_text: "100/150/100 mm",
  member_count: 1,
  bars_per_member: 28,
  total_cut_length: 3.6,
  spacing_mode: "L/3",
  modal_span_meter: 3,
  modal_divide_mode: "L/3",
  single_spacing: 150,
  zone1: 100,
  zone2: 150,
  zone3: 100,
};

const AVAILABLE_DIAS = [8, 10, 12, 16, 20, 25, 32, 40];

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asSpacingMode(
  value: unknown,
  fallback: "L/1" | "L/3" | "L/4",
): "L/1" | "L/3" | "L/4" {
  return value === "L/1" || value === "L/3" || value === "L/4"
    ? value
    : fallback;
}

function getNestedConfig(row: AdminToolRow): AdminBBSConfig {
  const possibleKeys = [
    "config",
    "settings",
    "calculator_config",
    "default_settings",
    "metadata",
  ];

  for (const key of possibleKeys) {
    const value = row[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as AdminBBSConfig;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          return parsed as AdminBBSConfig;
        }
      } catch {
        // Ignore invalid JSON and continue.
      }
    }
  }

  return {};
}

function findAdminBBSRow(rows: AdminToolRow[]): AdminToolRow | null {
  const candidates = [
    "bbs",
    "bar-bending-schedule-bbs",
    "bar-bending-schedule",
    "bar bending schedule (bbs)",
    "bar bending schedule",
  ];

  const normalize = (value: unknown) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-");

  for (const row of rows) {
    const slug = normalize(row.slug);
    const name = normalize(row.name);
    const title = normalize(row.title);
    const toolName = normalize(row.tool_name);

    if (
      candidates.includes(slug) ||
      candidates.includes(name) ||
      candidates.includes(title) ||
      candidates.includes(toolName)
    ) {
      return row;
    }
  }

  const containsBBS = rows.find((row) => {
    const text = [
      row.slug,
      row.name,
      row.title,
      row.tool_name,
      row.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      text.includes("bar bending schedule") ||
      /\bbbs\b/.test(text)
    );
  });

  return containsBBS ?? null;
}

export const BBSProfessionalTool: React.FC<{
  toolName?: string;
}> = ({ toolName = "Bar Bending Schedule (BBS)" }) => {
  const sheetCtx = useSheets();

  /*
   * ---------------------------------------------------------
   * ADMIN DATA
   * ---------------------------------------------------------
   *
   * BBS now reads its configuration from the same `tools`
   * table used by the Admin panel.
   *
   * We intentionally use select("*") here so this component
   * remains compatible with the existing tools schema even
   * when optional CMS columns are added later.
   */
  const [adminTool, setAdminTool] = useState<AdminToolRow | null>(
    null,
  );
  const [adminConfig, setAdminConfig] =
    useState<Required<AdminBBSConfig>>(DEFAULT_BBS_CONFIG);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getBBSSettings().then((settings) => {
      if (cancelled) return;
      setAdminConfig((current) => ({
        ...current,
        steel_rate: settings.steel_rate,
        diameter: settings.default_diameter,
        member_count: settings.default_member_count,
        bars_per_member: settings.default_bars_per_member,
        spacing_text: `${settings.default_spacing} mm`,
      }));
      if (!settings.enabled) console.warn("BBS is disabled by administrator.");
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAdminBBS() {
      setAdminLoading(true);

      const { data, error } = await supabase
        .from("tools")
        .select("*");

      if (cancelled) return;

      if (error) {
        console.error("BBS Admin data load failed:", error);
        setAdminLoading(false);
        return;
      }

      const rows = (data ?? []) as unknown as AdminToolRow[];
      const found = findAdminBBSRow(rows);

      if (found) {
        setAdminTool(found);

        const nested = getNestedConfig(found);

        const merged: Required<AdminBBSConfig> = {
          ...DEFAULT_BBS_CONFIG,
          ...nested,

          name: asString(
            found.name ?? found.title ?? found.tool_name ?? nested.name,
            DEFAULT_BBS_CONFIG.name,
          ),

          description: asString(
            found.description ?? nested.description,
            DEFAULT_BBS_CONFIG.description,
          ),

          long_description: asString(
            found.long_description ??
              found.content ??
              found.body ??
              nested.long_description,
            DEFAULT_BBS_CONFIG.long_description,
          ),

          category: asString(
            found.category ?? nested.category,
            DEFAULT_BBS_CONFIG.category,
          ),

          project_name: asString(
            nested.project_name,
            DEFAULT_BBS_CONFIG.project_name,
          ),

          billing_date: asString(
            nested.billing_date,
            DEFAULT_BBS_CONFIG.billing_date,
          ),

          section_heading: asString(
            nested.section_heading,
            DEFAULT_BBS_CONFIG.section_heading,
          ),

          steel_rate: asNumber(
            nested.steel_rate,
            DEFAULT_BBS_CONFIG.steel_rate,
          ),

          straight_length: asNumber(
            nested.straight_length,
            DEFAULT_BBS_CONFIG.straight_length,
          ),

          left_hook: asNumber(
            nested.left_hook,
            DEFAULT_BBS_CONFIG.left_hook,
          ),

          right_hook: asNumber(
            nested.right_hook,
            DEFAULT_BBS_CONFIG.right_hook,
          ),

          bar_name: asString(
            nested.bar_name,
            DEFAULT_BBS_CONFIG.bar_name,
          ),

          diameter: asNumber(
            nested.diameter,
            DEFAULT_BBS_CONFIG.diameter,
          ),

          clear_span: asNumber(
            nested.clear_span,
            DEFAULT_BBS_CONFIG.clear_span,
          ),

          spacing_text: asString(
            nested.spacing_text,
            DEFAULT_BBS_CONFIG.spacing_text,
          ),

          member_count: asNumber(
            nested.member_count,
            DEFAULT_BBS_CONFIG.member_count,
          ),

          bars_per_member: asNumber(
            nested.bars_per_member,
            DEFAULT_BBS_CONFIG.bars_per_member,
          ),

          total_cut_length: asNumber(
            nested.total_cut_length,
            DEFAULT_BBS_CONFIG.total_cut_length,
          ),

          spacing_mode: asSpacingMode(
            nested.spacing_mode,
            DEFAULT_BBS_CONFIG.spacing_mode,
          ),

          modal_span_meter: asNumber(
            nested.modal_span_meter,
            DEFAULT_BBS_CONFIG.modal_span_meter,
          ),

          modal_divide_mode: asSpacingMode(
            nested.modal_divide_mode,
            DEFAULT_BBS_CONFIG.modal_divide_mode,
          ),

          single_spacing: asNumber(
            nested.single_spacing,
            DEFAULT_BBS_CONFIG.single_spacing,
          ),

          zone1: asNumber(
            nested.zone1,
            DEFAULT_BBS_CONFIG.zone1,
          ),

          zone2: asNumber(
            nested.zone2,
            DEFAULT_BBS_CONFIG.zone2,
          ),

          zone3: asNumber(
            nested.zone3,
            DEFAULT_BBS_CONFIG.zone3,
          ),
        };

        setAdminConfig(merged);
      }

      setAdminLoading(false);
    }

    void loadAdminBBS();

    return () => {
      cancelled = true;
    };
  }, [toolName]);

  /*
   * ---------------------------------------------------------
   * PROJECT INIT STATE
   * ---------------------------------------------------------
   */

  const [projectName, setProjectName] = useState(
    DEFAULT_BBS_CONFIG.project_name,
  );

  const [billingDate, setBillingDate] = useState(
    DEFAULT_BBS_CONFIG.billing_date,
  );

  const [sectionHeading, setSectionHeading] = useState(
    DEFAULT_BBS_CONFIG.section_heading,
  );

  /*
   * Apply Admin defaults after Admin data arrives.
   *
   * This only initializes the calculator. It does not overwrite
   * rows already entered by the user.
   */
  const [adminDefaultsApplied, setAdminDefaultsApplied] =
    useState(false);

  useEffect(() => {
    if (adminLoading || adminDefaultsApplied) return;

    setProjectName(adminConfig.project_name);
    setBillingDate(adminConfig.billing_date);
    setSectionHeading(adminConfig.section_heading);

    setStraightLength(adminConfig.straight_length);
    setLeftHook(adminConfig.left_hook);
    setRightHook(adminConfig.right_hook);
    setBarName(adminConfig.bar_name);
    setDiameter(
      AVAILABLE_DIAS.includes(adminConfig.diameter)
        ? adminConfig.diameter
        : DEFAULT_BBS_CONFIG.diameter,
    );
    setClearSpan(adminConfig.clear_span);
    setSpacingText(adminConfig.spacing_text);
    setMemberCount(adminConfig.member_count);
    setBarsPerMember(adminConfig.bars_per_member);
    setSteelRate(adminConfig.steel_rate);

    setModalSpanMeter(adminConfig.modal_span_meter);
    setModalDivideMode(adminConfig.modal_divide_mode);
    setSingleSpacing(adminConfig.single_spacing);
    setZone1(adminConfig.zone1);
    setZone2(adminConfig.zone2);
    setZone3(adminConfig.zone3);

    setAdminDefaultsApplied(true);
  }, [
    adminLoading,
    adminDefaultsApplied,
    adminConfig,
  ]);

  /*
   * ---------------------------------------------------------
   * INPUT BAR DATA
   * ---------------------------------------------------------
   */

  const [straightLength, setStraightLength] = useState<number>(
    DEFAULT_BBS_CONFIG.straight_length,
  );

  const [leftHook, setLeftHook] = useState<number>(
    DEFAULT_BBS_CONFIG.left_hook,
  );

  const [rightHook, setRightHook] = useState<number>(
    DEFAULT_BBS_CONFIG.right_hook,
  );

  const [barName, setBarName] = useState(
    DEFAULT_BBS_CONFIG.bar_name,
  );

  const [diameter, setDiameter] = useState<number>(
    DEFAULT_BBS_CONFIG.diameter,
  );

  const [clearSpan, setClearSpan] = useState<number>(
    DEFAULT_BBS_CONFIG.clear_span,
  );

  const [spacingText, setSpacingText] = useState(
    DEFAULT_BBS_CONFIG.spacing_text,
  );

  const [memberCount, setMemberCount] = useState<number>(
    DEFAULT_BBS_CONFIG.member_count,
  );

  const [barsPerMember, setBarsPerMember] = useState<number>(
    DEFAULT_BBS_CONFIG.bars_per_member,
  );

  const [totalCutLength, setTotalCutLength] = useState<number>(
    DEFAULT_BBS_CONFIG.total_cut_length,
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [steelRate, setSteelRate] = useState<number>(
    DEFAULT_BBS_CONFIG.steel_rate,
  );

  /*
   * ---------------------------------------------------------
   * AUTO SPACING
   * ---------------------------------------------------------
   */

  const [showAutoSpacingModal, setShowAutoSpacingModal] =
    useState(false);

  const [modalSpanMeter, setModalSpanMeter] = useState<number>(
    DEFAULT_BBS_CONFIG.modal_span_meter,
  );

  const [modalDivideMode, setModalDivideMode] = useState<
    "L/1" | "L/3" | "L/4"
  >(DEFAULT_BBS_CONFIG.modal_divide_mode);

  const [singleSpacing, setSingleSpacing] = useState<number>(
    DEFAULT_BBS_CONFIG.single_spacing,
  );

  const [zone1, setZone1] = useState<number>(
    DEFAULT_BBS_CONFIG.zone1,
  );

  const [zone2, setZone2] = useState<number>(
    DEFAULT_BBS_CONFIG.zone2,
  );

  const [zone3, setZone3] = useState<number>(
    DEFAULT_BBS_CONFIG.zone3,
  );

  /*
   * ---------------------------------------------------------
   * LIVE SHEET
   * ---------------------------------------------------------
   */

  const [liveEntries, setLiveEntries] = useState<BarEntry[]>([]);

  useEffect(() => {
    const cutLen =
      (Number(straightLength) || 0) +
      (Number(leftHook) || 0) +
      (Number(rightHook) || 0);

    setTotalCutLength(Number(cutLen.toFixed(3)));
  }, [straightLength, leftHook, rightHook]);

  const handleOpenAutoSpacing = () => {
    setModalSpanMeter(
      clearSpan > 0 ? clearSpan / 1000 : 3,
    );

    setShowAutoSpacingModal(true);
  };

  const handleApplyAutoSpacing = () => {
    const spanMM = modalSpanMeter * 1000;

    setClearSpan(spanMM);

    let calculatedBars = 0;
    let formattedSpacing = "";

    if (modalDivideMode === "L/1") {
      const s = singleSpacing || 150;

      formattedSpacing = `${s} mm`;

      calculatedBars =
        Math.floor(spanMM / s) + 1;
    } else if (modalDivideMode === "L/3") {
      const z1 = zone1 || 100;
      const z2 = zone2 || 150;
      const z3 = zone3 || 100;

      formattedSpacing =
        `${z1}/${z2}/${z3} mm`;

      const zoneSpan = spanMM / 3;

      const barsZ1 = Math.floor(zoneSpan / z1);
      const barsZ2 = Math.floor(zoneSpan / z2);
      const barsZ3 = Math.floor(zoneSpan / z3);

      calculatedBars =
        barsZ1 +
        barsZ2 +
        barsZ3 +
        1;
    } else {
      const z1 = zone1 || 100;
      const z2 = zone2 || 150;
      const z3 = zone3 || 100;

      formattedSpacing =
        `${z1}/${z2}/${z3} mm`;

      const endZone = spanMM / 4;
      const midZone = spanMM / 2;

      const barsZ1 = Math.floor(endZone / z1);
      const barsZ2 = Math.floor(midZone / z2);
      const barsZ3 = Math.floor(endZone / z3);

      calculatedBars =
        barsZ1 +
        barsZ2 +
        barsZ3 +
        1;
    }

    setSpacingText(formattedSpacing);
    setBarsPerMember(calculatedBars);
    setShowAutoSpacingModal(false);
  };

  const handleInsertBar = () => {
    const newEntry: BarEntry = {
      id: Date.now().toString(),
      sectionHeading,
      barName,
      straightLength,
      leftHook,
      rightHook,
      diameter,
      clearSpan,
      spacingMode: modalDivideMode,
      spacingText,
      memberCount: memberCount || 1,
      barsPerMember: barsPerMember || 1,
      totalCutLength,
    };

    setLiveEntries((current) => [
      ...current,
      newEntry,
    ]);
  };

  const handleDeleteEntry = (id: string) => {
    setLiveEntries((current) =>
      current.filter((item) => item.id !== id),
    );
  };

  const handleUpdateEntry = (
    id: string,
    field: keyof BarEntry,
    value: any,
  ) => {
    setLiveEntries((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const updated = {
          ...item,
          [field]: value,
        };

        if (
          field === "straightLength" ||
          field === "leftHook" ||
          field === "rightHook"
        ) {
          updated.totalCutLength = Number(
            (
              (Number(updated.straightLength) || 0) +
              (Number(updated.leftHook) || 0) +
              (Number(updated.rightHook) || 0)
            ).toFixed(3),
          );
        }

        return updated;
      }),
    );
  };

  const filteredEntries = useMemo(() => {
    const term = searchQuery
      .trim()
      .toLowerCase();

    if (!term) return liveEntries;

    return liveEntries.filter((item) => {
      return (
        item.sectionHeading
          .toLowerCase()
          .includes(term) ||
        item.barName
          .toLowerCase()
          .includes(term) ||
        item.diameter
          .toString()
          .includes(term) ||
        item.spacingText
          .toLowerCase()
          .includes(term)
      );
    });
  }, [liveEntries, searchQuery]);

  /*
   * ---------------------------------------------------------
   * CALCULATIONS
   * ---------------------------------------------------------
   */

  const totalWeightByDia = useMemo(() => {
    const result: Record<number, number> = {};

    AVAILABLE_DIAS.forEach(
      (dia) => {
        result[dia] = 0;
      },
    );

    liveEntries.forEach((item) => {
      const totalBars =
        (Number(item.memberCount) || 0) *
        (Number(item.barsPerMember) || 0);

      const unitWeight =
        (item.diameter * item.diameter) /
        162.2;

      const itemTotalWeight =
        totalBars *
        (item.totalCutLength || 0) *
        unitWeight;

      if (result[item.diameter] === undefined) {
        result[item.diameter] = 0;
      }

      result[item.diameter] +=
        itemTotalWeight;
    });

    return result;
  }, [liveEntries]);

  const overallTotalWeightKg = useMemo(
    () =>
      Object.values(totalWeightByDia).reduce(
        (sum, value) => sum + value,
        0,
      ),
    [totalWeightByDia],
  );

  const overallTotalWeightMT =
    overallTotalWeightKg / 1000;

  const totalCostEstimate =
    overallTotalWeightKg *
    (steelRate || 0);

  /*
   * ---------------------------------------------------------
   * CENTRAL SHEET
   * ---------------------------------------------------------
   *
   * BBS continues publishing its real live sheet.
   * PDF/Excel/Workspace systems can consume this sheet.
   */

  useEffect(() => {
    const columns = [
      "Sl No",
      "Description",
      "Dia",
      "Clear Span (mm)",
      "Spacing (mm)",
      "Members",
      "Bars",
      "Cut Length (mm)",
      "Total Length (m)",
      "8mm",
      "10mm",
      "12mm",
      "16mm",
      "20mm",
      "25mm",
      "32mm",
      "40mm",
    ];

    const rows: Array<
      Array<string | number>
    > = liveEntries.map(
      (item, index) => {
        const totalBars =
          (Number(item.memberCount) || 0) *
          (Number(item.barsPerMember) || 0);

        const totalLen =
          totalBars *
          (Number(item.totalCutLength) || 0);

        const unitWeight =
          (Number(item.diameter) *
            Number(item.diameter)) /
          162.2;

        const rowWeightKg =
          totalLen * unitWeight;

        return [
          index + 1,

          item.sectionHeading
            ? `${item.sectionHeading} — ${item.barName}`
            : item.barName,

          item.diameter,

          item.clearSpan || "-",

          item.spacingText || "-",

          item.memberCount || 0,

          totalBars,

          (
            (Number(item.totalCutLength) || 0) *
            1000
          ).toFixed(0),

          totalLen.toFixed(1),

          ...AVAILABLE_DIAS.map(
            (dia) =>
              item.diameter === dia
                ? rowWeightKg.toFixed(1)
                : "-",
          ),
        ];
      },
    );

    rows.push([
      "",
      "TOTAL WEIGHT BY DIAMETER (KG)",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ...AVAILABLE_DIAS.map(
        (dia) =>
          totalWeightByDia[dia] > 0
            ? totalWeightByDia[dia].toFixed(2)
            : "-",
      ),
    ]);

    rows.push([
      "",
      "NET SUMMARY",
      "",
      "",
      "",
      "",
      "",
      "",
      `${overallTotalWeightKg.toFixed(2)} Kg`,
      `${overallTotalWeightMT.toFixed(4)} M.T.`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

    sheetCtx?.publishSheet({
      id: "bbs-live-schedule",
      title:
        adminConfig.name ||
        "BBS Schedule",
      columns,
      rows,
    });
  }, [
    sheetCtx,
    liveEntries,
    totalWeightByDia,
    overallTotalWeightKg,
    overallTotalWeightMT,
    adminConfig.name,
  ]);

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="w-full max-w-[98%] mx-auto p-2 sm:p-4 space-y-6 bg-gray-50 min-h-screen text-gray-800">

      {/* ADMIN-CONTROLLED HEADER */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {adminConfig.name}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500">
            {adminConfig.description}
          </p>

          {adminTool && (
            <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-teal-50 px-2 py-1 font-semibold text-teal-700">
                {adminConfig.category}
              </span>

              <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-600">
                Admin Controlled
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 1. PROJECT INIT */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-700">
          1. PROJECT INIT
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              PROJECT NAME
            </label>

            <input
              type="text"
              value={projectName}
              onChange={(e) =>
                setProjectName(e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Metro Project"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              BILLING DATE
            </label>

            <input
              type="date"
              value={billingDate}
              onChange={(e) =>
                setBillingDate(e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">
            SECTION HEADING
          </label>

          <input
            type="text"
            value={sectionHeading}
            onChange={(e) =>
              setSectionHeading(e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
            placeholder="e.g. BEAM PIER 12"
          />
        </div>
      </div>

      {/* 2. INPUT BAR DATA */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-700">
          2. INPUT BAR DATA
        </h2>

        <div className="grid grid-cols-3 gap-2 bg-teal-50/50 p-3 rounded-md border border-teal-100">
          <div>
            <label className="text-[10px] sm:text-[11px] font-bold text-teal-800 block mb-1">
              STRAIGHT LENGTH (M)
            </label>

            <input
              type="number"
              step="0.01"
              value={straightLength}
              onChange={(e) =>
                setStraightLength(
                  Number(e.target.value),
                )
              }
              className="w-full p-2 bg-white border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-bold text-teal-800 block mb-1">
              LEFT L-HOOK (M)
            </label>

            <input
              type="number"
              step="0.01"
              value={leftHook}
              onChange={(e) =>
                setLeftHook(
                  Number(e.target.value),
                )
              }
              className="w-full p-2 bg-white border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-bold text-teal-800 block mb-1">
              RIGHT L-HOOK (M)
            </label>

            <input
              type="number"
              step="0.01"
              value={rightHook}
              onChange={(e) =>
                setRightHook(
                  Number(e.target.value),
                )
              }
              className="w-full p-2 bg-white border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              BAR NAME
            </label>

            <input
              type="text"
              value={barName}
              onChange={(e) =>
                setBarName(e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g. Bottom"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              DIAMETER (MM)
            </label>

            <select
              value={diameter}
              onChange={(e) =>
                setDiameter(
                  Number(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
            >
              {AVAILABLE_DIAS.map((d) => (
                <option
                  key={d}
                  value={d}
                >
                  {d} mm
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              CLEAR SPAN (MM)
            </label>

            <input
              type="number"
              value={clearSpan}
              onChange={(e) =>
                setClearSpan(
                  Number(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              SPACING (MM)
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={spacingText}
                className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50"
              />

              <button
                type="button"
                onClick={handleOpenAutoSpacing}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded whitespace-nowrap"
              >
                Auto Spacing
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              MEMBERS COUNT
            </label>

            <input
              type="number"
              value={memberCount}
              onChange={(e) =>
                setMemberCount(
                  Number(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              BARS PER MEMBER
            </label>

            <input
              type="number"
              value={barsPerMember}
              onChange={(e) =>
                setBarsPerMember(
                  Number(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">
            TOTAL CUT LENGTH (M)
          </label>

          <input
            type="number"
            readOnly
            value={totalCutLength}
            className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-100 font-bold"
          />
        </div>

        <button
          type="button"
          onClick={handleInsertBar}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded shadow transition tracking-wide uppercase text-sm"
        >
          INSERT BAR
        </button>
      </div>

      {/* 3. LIVE EXCEL GRID */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-700">
          3. EXCEL GRID
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">
              🔍 Live Search Filter
            </label>

            <input
              type="text"
              placeholder="Search by section, bar, dia..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full p-2 bg-white border border-gray-300 rounded text-xs"
            />
          </div>

          <div className="flex justify-between items-center px-3 py-2 bg-white border border-gray-300 rounded">
            <div>
              <span className="text-[10px] font-bold text-gray-500 block uppercase">
                Total Entries
              </span>

              <span className="text-sm font-bold text-gray-800">
                {liveEntries.length} Items
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-teal-700 block uppercase">
                Net Weight
              </span>

              <span className="text-sm font-extrabold text-teal-800">
                {overallTotalWeightKg.toFixed(2)} KG (
                {overallTotalWeightMT.toFixed(3)} MT)
              </span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">
              ⚡ Steel Rate (per KG)
            </label>

            <div className="flex gap-2">
              <input
                type="number"
                value={steelRate}
                onChange={(e) =>
                  setSteelRate(
                    Number(e.target.value),
                  )
                }
                className="w-1/2 p-2 bg-white border border-gray-300 rounded text-xs font-bold"
                placeholder="e.g. 65"
              />

              <div className="w-1/2 p-2 bg-teal-50 border border-teal-200 rounded text-right">
                <span className="text-[9px] text-teal-700 block font-bold">
                  Est. Cost
                </span>

                <span className="text-xs font-black text-teal-900">
                  ₹
                  {totalCostEstimate.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 0,
                    },
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-teal-900 text-white px-4 py-2 rounded-t-md text-xs font-bold">
          <span>
            📊 CURRENT SHEET:{" "}
            {projectName.toUpperCase()} (
            {billingDate})
          </span>
        </div>

        <div className="overflow-x-auto border border-gray-300 rounded-b-md">
          <table className="w-full text-[11px] text-left text-gray-800 border-collapse">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center w-8">
                  Sl No
                </th>

                <th rowSpan={2} className="p-2 border border-slate-700 min-w-[140px]">
                  Description
                </th>

                <th rowSpan={2} className="p-2 border border-slate-700 text-center">
                  Dia
                </th>

                <th rowSpan={2} className="p-2 border border-slate-700 text-center">
                  Clear Span (mm)
                </th>

                <th rowSpan={2} className="p-2 border border-slate-700 text-center min-w-[100px]">
                  Spacing (mm)
                </th>

                <th colSpan={2} className="p-1 border border-slate-700 text-center bg-slate-800">
                  Nos
                </th>

                <th rowSpan={2} className="p-2 border border-slate-700 text-center">
                  Cut Length (m)
                </th>

                <th rowSpan={2} className="p-2 border border-slate-700 text-center">
                  Total Length (m)
                </th>

                <th colSpan={8} className="p-1 border border-slate-700 text-center bg-teal-800">
                  Diameter Wise Breakdowns (KG)
                </th>

                <th rowSpan={2} className="p-2 border border-slate-700 text-center">
                  Action
                </th>
              </tr>

              <tr>
                <th className="p-1 border border-slate-700 text-center bg-slate-800">
                  Members
                </th>

                <th className="p-1 border border-slate-700 text-center bg-slate-800">
                  Bars
                </th>

                {AVAILABLE_DIAS.map((d) => (
                  <th
                    key={d}
                    className="p-1 border border-slate-700 text-center bg-teal-800 w-10"
                  >
                    {d}mm
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={18}
                    className="text-center py-6 text-gray-400 font-medium border border-gray-200"
                  >
                    No matching records found in sheet.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(
                  (item, idx) => {
                    const totalBars =
                      (Number(item.memberCount) || 0) *
                      (Number(item.barsPerMember) || 0);

                    const totalLen =
                      totalBars *
                      (item.totalCutLength || 0);

                    const unitW =
                      (item.diameter *
                        item.diameter) /
                      162.2;

                    const rowWeightKg =
                      totalLen * unitW;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-amber-50/40 transition"
                      >
                        <td className="p-2 border border-gray-200 text-center font-bold text-gray-500">
                          {idx + 1}
                        </td>

                        <td className="p-1 border border-gray-200">
                          <input
                            type="text"
                            value={item.sectionHeading}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "sectionHeading",
                                e.target.value,
                              )
                            }
                            className="w-full text-xs font-bold text-gray-800 border-none bg-transparent focus:ring-1 focus:ring-teal-500 rounded p-0.5"
                            placeholder="Section"
                          />

                          <input
                            type="text"
                            value={item.barName}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "barName",
                                e.target.value,
                              )
                            }
                            className="w-full text-[10px] text-gray-500 border-none bg-transparent focus:ring-1 focus:ring-teal-500 rounded p-0.5"
                            placeholder="Bar Name"
                          />
                        </td>

                        <td className="p-1 border border-gray-200 text-center font-bold">
                          <select
                            value={item.diameter}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "diameter",
                                Number(
                                  e.target.value,
                                ),
                              )
                            }
                            className="bg-transparent border-none text-xs font-bold p-0 text-center"
                          >
                            {AVAILABLE_DIAS.map(
                              (d) => (
                                <option
                                  key={d}
                                  value={d}
                                >
                                  {d}
                                </option>
                              ),
                            )}
                          </select>
                        </td>

                        <td className="p-1 border border-gray-200 text-center">
                          <input
                            type="number"
                            value={item.clearSpan}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "clearSpan",
                                Number(
                                  e.target.value,
                                ),
                              )
                            }
                            className="w-16 text-center text-xs border-none bg-transparent p-0"
                          />
                        </td>

                        <td className="p-1 border border-gray-200 text-center">
                          <input
                            type="text"
                            value={item.spacingText}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "spacingText",
                                e.target.value,
                              )
                            }
                            className="w-20 text-center text-xs border-none bg-transparent p-0"
                          />
                        </td>

                        <td className="p-1 border border-gray-200 text-center">
                          <input
                            type="number"
                            value={item.memberCount}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "memberCount",
                                Number(
                                  e.target.value,
                                ),
                              )
                            }
                            className="w-10 text-center text-xs border-none bg-transparent p-0"
                          />
                        </td>

                        <td className="p-1 border border-gray-200 text-center font-bold">
                          <input
                            type="number"
                            value={item.barsPerMember}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "barsPerMember",
                                Number(
                                  e.target.value,
                                ),
                              )
                            }
                            className="w-10 text-center text-xs font-bold border-none bg-transparent p-0"
                          />
                        </td>

                        <td className="p-1 border border-gray-200 text-center font-semibold">
                          <input
                            type="number"
                            step="0.01"
                            value={item.totalCutLength}
                            onChange={(e) =>
                              handleUpdateEntry(
                                item.id,
                                "totalCutLength",
                                Number(
                                  e.target.value,
                                ),
                              )
                            }
                            className="w-12 text-center text-xs font-semibold border-none bg-transparent p-0"
                          />
                        </td>

                        <td className="p-2 border border-gray-200 text-center font-bold text-teal-800">
                          {totalLen.toFixed(1)}
                        </td>

                        {AVAILABLE_DIAS.map(
                          (d) => (
                            <td
                              key={d}
                              className="p-1 border border-gray-200 text-center text-[10px]"
                            >
                              {item.diameter ===
                              d ? (
                                <span className="font-bold text-blue-700">
                                  {rowWeightKg.toFixed(
                                    1,
                                  )}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          ),
                        )}

                        <td className="p-1 border border-gray-200 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteEntry(
                                item.id,
                              )
                            }
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded text-[10px]"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )
              )}

              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                <td
                  colSpan={9}
                  className="p-2 text-right uppercase tracking-wider border border-gray-300"
                >
                  TOTAL WEIGHT BY DIAMETER (KG):
                </td>

                {AVAILABLE_DIAS.map(
                  (d) => (
                    <td
                      key={d}
                      className="p-1 border border-gray-300 text-center text-[10px] text-teal-900 font-black"
                    >
                      {totalWeightByDia[d] >
                      0
                        ? totalWeightByDia[
                            d
                          ].toFixed(1)
                        : "-"}
                    </td>
                  ),
                )}

                <td className="p-1 border border-gray-300" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN CONTENT */}
      {adminConfig.long_description && (
        <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            About {adminConfig.name}
          </h2>

          <div className="text-sm leading-7 text-gray-600 whitespace-pre-line">
            {adminConfig.long_description}
          </div>
        </section>
      )}

      {/* AUTO SPACING MODAL */}
      {showAutoSpacingModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-1 text-sm">
                <span>📐</span>
                Spacing Auto Solver
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowAutoSpacingModal(false)
                }
                className="text-red-500 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                TOTAL SPAN (METER)
              </label>

              <input
                type="number"
                value={modalSpanMeter}
                onChange={(e) =>
                  setModalSpanMeter(
                    Number(e.target.value),
                  )
                }
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                DIVIDE MODE
              </label>

              <select
                value={modalDivideMode}
                onChange={(e) =>
                  setModalDivideMode(
                    e.target.value as
                      | "L/1"
                      | "L/3"
                      | "L/4",
                  )
                }
                className="w-full p-2 border rounded text-sm bg-white"
              >
                <option value="L/1">
                  L/1 (Uniform Spacing)
                </option>

                <option value="L/3">
                  L/3 (3-Zone Split)
                </option>

                <option value="L/4">
                  L/4 (4-Zone Split)
                </option>
              </select>
            </div>

            {modalDivideMode ===
            "L/1" ? (
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  CENTER-TO-CENTER SPACING (MM)
                </label>

                <input
                  type="number"
                  value={singleSpacing}
                  onChange={(e) =>
                    setSingleSpacing(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                  className="w-full p-2 border rounded text-sm"
                  placeholder="e.g. 150"
                />
              </div>
            ) : (
              <div className="space-y-2 bg-gray-50 p-3 rounded border">
                <span className="text-[11px] font-bold text-teal-800 block">
                  ZONE-WISE SPLIT SPACING (MM)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block">
                      ZONE 1
                    </label>

                    <input
                      type="number"
                      value={zone1}
                      onChange={(e) =>
                        setZone1(
                          Number(
                            e.target.value,
                          ),
                        )
                      }
                      className="w-full p-1.5 border rounded text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block">
                      ZONE 2
                    </label>

                    <input
                      type="number"
                      value={zone2}
                      onChange={(e) =>
                        setZone2(
                          Number(
                            e.target.value,
                          ),
                        )
                      }
                      className="w-full p-1.5 border rounded text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block">
                      ZONE 3
                    </label>

                    <input
                      type="number"
                      value={zone3}
                      onChange={(e) =>
                        setZone3(
                          Number(
                            e.target.value,
                          ),
                        )
                      }
                      className="w-full p-1.5 border rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyAutoSpacing}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded text-xs tracking-wider uppercase"
            >
              APPLY DATA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const BBSProSheet =
  BBSProfessionalTool;

export default BBSProfessionalTool;
