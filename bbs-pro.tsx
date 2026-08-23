import React, { useState, useEffect } from 'react';
import { useSheets } from '@/lib/sheet-context';
import { EstimateActions } from '@/components/estimate-actions';

export interface BarEntry {
  id: string;
  sectionHeading: string;
  barName: string;
  straightLength: number;
  leftHook: number;
  rightHook: number;
  diameter: number;
  clearSpan: number;
  spacingMode: 'L/1' | 'L/3' | 'L/4';
  spacingText: string;
  memberCount: number;
  barsPerMember: number;
  totalCutLength: number;
}

export const BBSProfessionalTool: React.FC<{ toolName?: string }> = ({
  toolName = 'Bar Bending Schedule (BBS)',
}) => {
  // Project Init State
  const [projectName, setProjectName] = useState('Shivam');
  const [billingDate, setBillingDate] = useState('2026-08-23');
  const [sectionHeading, setSectionHeading] = useState('Footing');

  // Input Bar Data State
  const [straightLength, setStraightLength] = useState<number>(3);
  const [leftHook, setLeftHook] = useState<number>(0.3);
  const [rightHook, setRightHook] = useState<number>(0.3);
  const [barName, setBarName] = useState('Bottom');
  const [diameter, setDiameter] = useState<number>(32);
  const [clearSpan, setClearSpan] = useState<number>(3000);
  const [spacingText, setSpacingText] = useState('100/150/100 mm');
  const [memberCount, setMemberCount] = useState<number>(1);
  const [barsPerMember, setBarsPerMember] = useState<number>(28);
  const [totalCutLength, setTotalCutLength] = useState<number>(3.6);

  // Search & Rate Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [steelRate, setSteelRate] = useState<number>(65);

  // Auto Spacing Modal State
  const [showAutoSpacingModal, setShowAutoSpacingModal] = useState(false);
  const [modalSpanMeter, setModalSpanMeter] = useState<number>(3);
  const [modalDivideMode, setModalDivideMode] = useState<'L/1' | 'L/3' | 'L/4'>('L/3');
  const [singleSpacing, setSingleSpacing] = useState<number>(150);
  const [zone1, setZone1] = useState<number>(100);
  const [zone2, setZone2] = useState<number>(150);
  const [zone3, setZone3] = useState<number>(100);

  // Live Sheet Data
  const [liveEntries, setLiveEntries] = useState<BarEntry[]>([
    {
      id: '1',
      sectionHeading: 'Footing',
      barName: 'Bottom',
      straightLength: 3,
      leftHook: 0.5,
      rightHook: 0.5,
      diameter: 32,
      clearSpan: 3000,
      spacingMode: 'L/3',
      spacingText: '100/150/100 mm',
      memberCount: 1,
      barsPerMember: 28,
      totalCutLength: 4,
    },
    {
      id: '2',
      sectionHeading: 'Footing',
      barName: 'Bottom',
      straightLength: 3,
      leftHook: 0.3,
      rightHook: 0.3,
      diameter: 8,
      clearSpan: 3000,
      spacingMode: 'L/3',
      spacingText: '100/150/100 mm',
      memberCount: 1,
      barsPerMember: 28,
      totalCutLength: 3.6,
    },
    {
      id: '3',
      sectionHeading: 'Footing',
      barName: 'Bottom',
      straightLength: 3,
      leftHook: 0.3,
      rightHook: 0.3,
      diameter: 8,
      clearSpan: 3000,
      spacingMode: 'L/1',
      spacingText: '150 mm',
      memberCount: 1,
      barsPerMember: 21,
      totalCutLength: 3.6,
    },
  ]);

  useEffect(() => {
    const cutLen = (Number(straightLength) || 0) + (Number(leftHook) || 0) + (Number(rightHook) || 0);
    setTotalCutLength(Number(cutLen.toFixed(3)));
  }, [straightLength, leftHook, rightHook]);

  const handleOpenAutoSpacing = () => {
    setModalSpanMeter(clearSpan > 0 ? clearSpan / 1000 : 3);
    setShowAutoSpacingModal(true);
  };

  const handleApplyAutoSpacing = () => {
    const spanMM = modalSpanMeter * 1000;
    setClearSpan(spanMM);

    let calculatedBars = 0;
    let formattedSpacing = '';

    if (modalDivideMode === 'L/1') {
      const s = singleSpacing || 150;
      formattedSpacing = `${s} mm`;
      calculatedBars = Math.floor(spanMM / s) + 1;
    } else if (modalDivideMode === 'L/3') {
      const z1 = zone1 || 100;
      const z2 = zone2 || 150;
      const z3 = zone3 || 100;
      formattedSpacing = `${z1}/${z2}/${z3} mm`;

      const zoneSpan = spanMM / 3;
      const barsZ1 = Math.floor(zoneSpan / z1);
      const barsZ2 = Math.floor(zoneSpan / z2);
      const barsZ3 = Math.floor(zoneSpan / z3);
      calculatedBars = barsZ1 + barsZ2 + barsZ3 + 1;
    } else if (modalDivideMode === 'L/4') {
      const z1 = zone1 || 100;
      const z2 = zone2 || 150;
      const z3 = zone3 || 100;
      formattedSpacing = `${z1}/${z2}/${z3} mm`;

      const endZone = spanMM / 4;
      const midZone = spanMM / 2;
      const barsZ1 = Math.floor(endZone / z1);
      const barsZ2 = Math.floor(midZone / z2);
      const barsZ3 = Math.floor(endZone / z3);
      calculatedBars = barsZ1 + barsZ2 + barsZ3 + 1;
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

    setLiveEntries([...liveEntries, newEntry]);
  };

  const handleDeleteEntry = (id: string) => {
    setLiveEntries(liveEntries.filter((item) => item.id !== id));
  };

  // Live Sheet Inline Edit & Auto Correct
  const handleUpdateEntry = (id: string, field: keyof BarEntry, value: any) => {
    setLiveEntries(
      liveEntries.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'straightLength' || field === 'leftHook' || field === 'rightHook') {
            updated.totalCutLength = Number(
              ((Number(updated.straightLength) || 0) + (Number(updated.leftHook) || 0) + (Number(updated.rightHook) || 0)).toFixed(3)
            );
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Filtered entries for search
  const filteredEntries = liveEntries.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      item.sectionHeading.toLowerCase().includes(term) ||
      item.barName.toLowerCase().includes(term) ||
      item.diameter.toString().includes(term) ||
      item.spacingText.toLowerCase().includes(term)
    );
  });

  // Diameter-wise Total Weight Calculations
  const availableDias = [8, 10, 12, 16, 20, 25, 32, 40];
  const totalWeightByDia: Record<number, number> = {};
  let overallTotalWeightKg = 0;

  availableDias.forEach((d) => (totalWeightByDia[d] = 0));

  liveEntries.forEach((item) => {
    const totalBars = (Number(item.memberCount) || 0) * (Number(item.barsPerMember) || 0);
    const unitWeight = (item.diameter * item.diameter) / 162.2;
    const itemTotalWeight = totalBars * (item.totalCutLength || 0) * unitWeight;

    if (totalWeightByDia[item.diameter] !== undefined) {
      totalWeightByDia[item.diameter] += itemTotalWeight;
    } else {
      totalWeightByDia[item.diameter] = itemTotalWeight;
    }
    overallTotalWeightKg += itemTotalWeight;
  });

  const overallTotalWeightMT = overallTotalWeightKg / 1000;
  const totalCostEstimate = overallTotalWeightKg * (steelRate || 0);

  // Publish the live BBS as a normal site sheet.
  // This makes Workspace/PDF/Excel use the exact same
  // central EstimateActions system as every other tool.
  const sheetCtx = useSheets();

  useEffect(() => {
    const columns = [
      'Sl No',
      'Description',
      'Dia',
      'Clear Span (mm)',
      'Spacing (mm)',
      'Members',
      'Bars',
      'Cut Length (mm)',
      'Total Length (m)',
      '8mm',
      '10mm',
      '12mm',
      '16mm',
      '20mm',
      '25mm',
      '32mm',
      '40mm',
    ];

    const rows: Array<Array<string | number>> = liveEntries.map((item, index) => {
      const totalBars =
        (Number(item.memberCount) || 0) *
        (Number(item.barsPerMember) || 0);
      const totalLen =
        totalBars * (Number(item.totalCutLength) || 0);
      const unitWeight =
        (Number(item.diameter) * Number(item.diameter)) / 162.2;
      const rowWeightKg = totalLen * unitWeight;

      return [
        index + 1,
        item.sectionHeading
          ? `${item.sectionHeading} — ${item.barName}`
          : item.barName,
        item.diameter,
        item.clearSpan || '-',
        item.spacingText || '-',
        item.memberCount || 0,
        totalBars,
        ((Number(item.totalCutLength) || 0) * 1000).toFixed(0),
        totalLen.toFixed(1),
        ...availableDias.map((d) =>
          item.diameter === d ? rowWeightKg.toFixed(1) : '-',
        ),
      ];
    });

    rows.push([
      '',
      'TOTAL WEIGHT BY DIAMETER (KG)',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ...availableDias.map((d) =>
        totalWeightByDia[d] > 0
          ? totalWeightByDia[d].toFixed(2)
          : '-',
      ),
    ]);

    rows.push([
      '',
      'NET SUMMARY',
      '',
      '',
      '',
      '',
      '',
      '',
      `${overallTotalWeightKg.toFixed(2)} Kg`,
      `${overallTotalWeightMT.toFixed(4)} M.T.`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);

    sheetCtx?.publishSheet({
      id: 'bbs-live-schedule',
      title: 'BBS Schedule',
      columns,
      rows,
    });
  }, [
    sheetCtx,
    liveEntries,
    availableDias,
    totalWeightByDia,
    overallTotalWeightKg,
    overallTotalWeightMT,
  ]);

  return (
    <div className="w-full max-w-[98%] mx-auto p-2 sm:p-4 space-y-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">BAR BENDING SCHEDULE (BBS)</h1>
          <p className="text-xs sm:text-sm text-gray-500">Live Bar Bending Schedule Engine with Auto Spacing & Instant Excel Generation</p>
        </div>
      </div>

      {/* 1. Project Init Section */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-700 flex items-center gap-2">
          <span>1. PROJECT INIT</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">PROJECT NAME</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Metro Project"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">BILLING DATE</label>
            <input
              type="date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">SECTION HEADING</label>
          <input
            type="text"
            value={sectionHeading}
            onChange={(e) => setSectionHeading(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
            placeholder="e.g. BEAM PIER 12"
          />
        </div>
      </div>

      {/* 2. Input Bar Data Section */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-700">2. INPUT BAR DATA</h2>

        {/* Straight & Hooks */}
        <div className="grid grid-cols-3 gap-2 bg-teal-50/50 p-3 rounded-md border border-teal-100">
          <div>
            <label className="text-[10px] sm:text-[11px] font-bold text-teal-800 block mb-1">STRAIGHT LENGTH (M)</label>
            <input
              type="number"
              step="0.01"
              value={straightLength}
              onChange={(e) => setStraightLength(Number(e.target.value))}
              className="w-full p-2 bg-white border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] sm:text-[11px] font-bold text-teal-800 block mb-1">LEFT L-HOOK (M)</label>
            <input
              type="number"
              step="0.01"
              value={leftHook}
              onChange={(e) => setLeftHook(Number(e.target.value))}
              className="w-full p-2 bg-white border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] sm:text-[11px] font-bold text-teal-800 block mb-1">RIGHT L-HOOK (M)</label>
            <input
              type="number"
              step="0.01"
              value={rightHook}
              onChange={(e) => setRightHook(Number(e.target.value))}
              className="w-full p-2 bg-white border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Bar Name & Diameter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">BAR NAME</label>
            <input
              type="text"
              value={barName}
              onChange={(e) => setBarName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g. Bottom"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">DIAMETER (MM)</label>
            <select
              value={diameter}
              onChange={(e) => setDiameter(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
            >
              {[8, 10, 12, 16, 20, 25, 32, 40].map((d) => (
                <option key={d} value={d}>
                  {d} mm
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Span & Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">CLEAR SPAN (MM)</label>
            <input
              type="number"
              value={clearSpan}
              onChange={(e) => setClearSpan(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">SPACING (MM)</label>
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

        {/* Member Count & Bars per Member */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">MEMBERS COUNT</label>
            <input
              type="number"
              value={memberCount}
              onChange={(e) => setMemberCount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">BARS PER MEMBER</label>
            <input
              type="number"
              value={barsPerMember}
              onChange={(e) => setBarsPerMember(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Total Cut Length Display & Action */}
        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">TOTAL CUT LENGTH (M)</label>
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

      {/* 3. Live Excel BBS Grid Sheet */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-700">3. EXCEL GRID</h2>

        {/* Search, Total Weight & Rate Header Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">🔍 Live Search Filter</label>
            <input
              type="text"
              placeholder="Search by section, bar, dia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-white border border-gray-300 rounded text-xs"
            />
          </div>
          <div className="flex justify-between items-center px-3 py-2 bg-white border border-gray-300 rounded">
            <div>
              <span className="text-[10px] font-bold text-gray-500 block uppercase">Total Entries</span>
              <span className="text-sm font-bold text-gray-800">{liveEntries.length} Items</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-teal-700 block uppercase">Net Weight</span>
              <span className="text-sm font-extrabold text-teal-800">
                {overallTotalWeightKg.toFixed(2)} KG ({overallTotalWeightMT.toFixed(3)} MT)
              </span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">⚡ Steel Rate (per KG)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={steelRate}
                onChange={(e) => setSteelRate(Number(e.target.value))}
                className="w-1/2 p-2 bg-white border border-gray-300 rounded text-xs font-bold"
                placeholder="e.g. 65"
              />
              <div className="w-1/2 p-2 bg-teal-50 border border-teal-200 rounded text-right">
                <span className="text-[9px] text-teal-700 block font-bold">Est. Cost</span>
                <span className="text-xs font-black text-teal-900">₹{totalCostEstimate.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Sheet Title Bar */}
        <div className="flex justify-between items-center bg-teal-900 text-white px-4 py-2 rounded-t-md text-xs font-bold">
          <span>📊 CURRENT SHEET: {projectName.toUpperCase()} ({billingDate})</span>
        </div>

        {/* Editable Live Sheet Excel Table */}
        <div className="overflow-x-auto border border-gray-300 rounded-b-md">
          <table className="w-full text-[11px] text-left text-gray-800 border-collapse">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center w-8">Sl No</th>
                <th rowSpan={2} className="p-2 border border-slate-700 min-w-[140px]">Description</th>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center">Dia</th>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center">Clear Span (mm)</th>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center min-w-[100px]">Spacing (mm)</th>
                <th colSpan={2} className="p-1 border border-slate-700 text-center bg-slate-800">Nos</th>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center">Cut Length (m)</th>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center">Total Length (m)</th>
                <th colSpan={8} className="p-1 border border-slate-700 text-center bg-teal-800">Diameter Wise Breakdowns (KG)</th>
                <th rowSpan={2} className="p-2 border border-slate-700 text-center">Action</th>
              </tr>
              <tr>
                <th className="p-1 border border-slate-700 text-center bg-slate-800">Members</th>
                <th className="p-1 border border-slate-700 text-center bg-slate-800">Bars</th>
                {availableDias.map((d) => (
                  <th key={d} className="p-1 border border-slate-700 text-center bg-teal-800 w-10">
                    {d}mm
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center py-6 text-gray-400 font-medium border border-gray-200">
                    No matching records found in sheet.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item, idx) => {
                  const totalBars = (Number(item.memberCount) || 0) * (Number(item.barsPerMember) || 0);
                  const totalLen = totalBars * (item.totalCutLength || 0);
                  const unitW = (item.diameter * item.diameter) / 162.2;
                  const rowWeightKg = totalLen * unitW;

                  return (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition">
                      <td className="p-2 border border-gray-200 text-center font-bold text-gray-500">{idx + 1}</td>
                      <td className="p-1 border border-gray-200">
                        <input
                          type="text"
                          value={item.sectionHeading}
                          onChange={(e) => handleUpdateEntry(item.id, 'sectionHeading', e.target.value)}
                          className="w-full text-xs font-bold text-gray-800 border-none bg-transparent focus:ring-1 focus:ring-teal-500 rounded p-0.5"
                          placeholder="Section"
                        />
                        <input
                          type="text"
                          value={item.barName}
                          onChange={(e) => handleUpdateEntry(item.id, 'barName', e.target.value)}
                          className="w-full text-[10px] text-gray-500 border-none bg-transparent focus:ring-1 focus:ring-teal-500 rounded p-0.5"
                          placeholder="Bar Name"
                        />
                      </td>
                      <td className="p-1 border border-gray-200 text-center font-bold">
                        <select
                          value={item.diameter}
                          onChange={(e) => handleUpdateEntry(item.id, 'diameter', Number(e.target.value))}
                          className="bg-transparent border-none text-xs font-bold p-0 text-center"
                        >
                          {availableDias.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1 border border-gray-200 text-center">
                        <input
                          type="number"
                          value={item.clearSpan}
                          onChange={(e) => handleUpdateEntry(item.id, 'clearSpan', Number(e.target.value))}
                          className="w-16 text-center text-xs border-none bg-transparent p-0"
                        />
                      </td>
                      <td className="p-1 border border-gray-200 text-center">
                        <input
                          type="text"
                          value={item.spacingText}
                          onChange={(e) => handleUpdateEntry(item.id, 'spacingText', e.target.value)}
                          className="w-20 text-center text-xs border-none bg-transparent p-0"
                        />
                      </td>
                      <td className="p-1 border border-gray-200 text-center">
                        <input
                          type="number"
                          value={item.memberCount}
                          onChange={(e) => handleUpdateEntry(item.id, 'memberCount', Number(e.target.value))}
                          className="w-10 text-center text-xs border-none bg-transparent p-0"
                        />
                      </td>
                      <td className="p-1 border border-gray-200 text-center font-bold">
                        <input
                          type="number"
                          value={item.barsPerMember}
                          onChange={(e) => handleUpdateEntry(item.id, 'barsPerMember', Number(e.target.value))}
                          className="w-10 text-center text-xs font-bold border-none bg-transparent p-0"
                        />
                      </td>
                      <td className="p-1 border border-gray-200 text-center font-semibold">
                        <input
                          type="number"
                          step="0.01"
                          value={item.totalCutLength}
                          onChange={(e) => handleUpdateEntry(item.id, 'totalCutLength', Number(e.target.value))}
                          className="w-12 text-center text-xs font-semibold border-none bg-transparent p-0"
                        />
                      </td>
                      <td className="p-2 border border-gray-200 text-center font-bold text-teal-800">{totalLen.toFixed(1)}</td>

                      {/* Diameter Breakdown Columns */}
                      {availableDias.map((d) => (
                        <td key={d} className="p-1 border border-gray-200 text-center text-[10px]">
                          {item.diameter === d ? <span className="font-bold text-blue-700">{rowWeightKg.toFixed(1)}</span> : '-'}
                        </td>
                      ))}

                      <td className="p-1 border border-gray-200 text-center">
                        <button
                          onClick={() => handleDeleteEntry(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded text-[10px]"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Summary Row */}
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                <td colSpan={9} className="p-2 text-right uppercase tracking-wider border border-gray-300">
                  TOTAL WEIGHT BY DIAMETER (KG):
                </td>
                {availableDias.map((d) => (
                  <td key={d} className="p-1 border border-gray-300 text-center text-[10px] text-teal-900 font-black">
                    {totalWeightByDia[d] > 0 ? totalWeightByDia[d].toFixed(1) : '-'}
                  </td>
                ))}
                <td className="p-1 border border-gray-300"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Save / PDF / Excel — use the same central site-wide action system */}
        <EstimateActions
          toolSlug="bar-bending-schedule"
          toolName={toolName}
        />
      </div>

      {/* Auto Spacing Solver Modal */}
      {showAutoSpacingModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-1 text-sm">
                <span>📐</span> Spacing Auto Solver
              </h3>
              <button onClick={() => setShowAutoSpacingModal(false)} className="text-red-500 font-bold text-lg">
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">TOTAL SPAN (METER)</label>
              <input
                type="number"
                value={modalSpanMeter}
                onChange={(e) => setModalSpanMeter(Number(e.target.value))}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">DIVIDE MODE</label>
              <select
                value={modalDivideMode}
                onChange={(e) => setModalDivideMode(e.target.value as any)}
                className="w-full p-2 border rounded text-sm bg-white"
              >
                <option value="L/1">L/1 (Uniform Spacing)</option>
                <option value="L/3">L/3 (3-Zone Split)</option>
                <option value="L/4">L/4 (4-Zone Split)</option>
              </select>
            </div>

            {modalDivideMode === 'L/1' ? (
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">CENTER-TO-CENTER SPACING (MM)</label>
                <input
                  type="number"
                  value={singleSpacing}
                  onChange={(e) => setSingleSpacing(Number(e.target.value))}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="e.g. 150"
                />
              </div>
            ) : (
              <div className="space-y-2 bg-gray-50 p-3 rounded border">
                <span className="text-[11px] font-bold text-teal-800 block">ZONE-WISE SPLIT SPACING (MM)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block">ZONE 1</label>
                    <input
                      type="number"
                      value={zone1}
                      onChange={(e) => setZone1(Number(e.target.value))}
                      className="w-full p-1.5 border rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">ZONE 2</label>
                    <input
                      type="number"
                      value={zone2}
                      onChange={(e) => setZone2(Number(e.target.value))}
                      className="w-full p-1.5 border rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">ZONE 3</label>
                    <input
                      type="number"
                      value={zone3}
                      onChange={(e) => setZone3(Number(e.target.value))}
                      className="w-full p-1.5 border rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
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

export const BBSProSheet = BBSProfessionalTool;
export default BBSProfessionalTool;
