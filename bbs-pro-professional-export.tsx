import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { canDownloadService } from '@/lib/download-access';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const BBSProfessionalTool: React.FC = () => {
  // Project Init State
  const navigate = useNavigate();
  const [savingWorkspace, setSavingWorkspace] = useState(false);
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

  // Professional BBS export helpers. Access remains controlled by the
  // same global Download Services system used by the rest of the site.
  const getBbsRows = () => {
    return liveEntries.map((item, idx) => {
      const totalBars = (Number(item.memberCount) || 0) * (Number(item.barsPerMember) || 0);
      const totalLen = totalBars * (Number(item.totalCutLength) || 0);
      const unitW = (Number(item.diameter) * Number(item.diameter)) / 162.2;
      const rowWeight = totalLen * unitW;

      return {
        sl: idx + 1,
        section: item.sectionHeading || 'GENERAL',
        description: item.barName || '-',
        diameter: Number(item.diameter) || 0,
        clearSpan: Number(item.clearSpan) || 0,
        spacing: item.spacingText || '-',
        members: Number(item.memberCount) || 0,
        bars: totalBars,
        cutLength: Number(item.totalCutLength) || 0,
        totalLength: totalLen,
        rowWeight,
      };
    });
  };

  const buildBbsExportRows = () => {
    const rows = getBbsRows();
    const headers = [
      'Sl No',
      'Description',
      'Dia (mm)',
      'Clear Span (mm)',
      'Spacing (mm)',
      'Members',
      'Bars',
      'Cut Length (m)',
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

    const body: string[][] = [];
    let currentSection = '';

    for (const row of rows) {
      if (row.section !== currentSection) {
        currentSection = row.section;
        body.push([`SECTION: ${currentSection.toUpperCase()}`]);
      }

      body.push([
        String(row.sl),
        row.description,
        String(row.diameter),
        row.clearSpan ? String(row.clearSpan) : '-',
        row.spacing,
        String(row.members),
        String(row.bars),
        row.cutLength.toFixed(3),
        row.totalLength.toFixed(2),
        ...availableDias.map((d) => row.diameter === d ? row.rowWeight.toFixed(2) : '-'),
      ]);
    }

    body.push([
      'TOTAL',
      'TOTAL LENGTH BY DIAMETER (m)',
      '', '', '', '', '', '', '',
      ...availableDias.map((d) => {
        const total = rows
          .filter((row) => row.diameter === d)
          .reduce((sum, row) => sum + row.totalLength, 0);
        return total > 0 ? total.toFixed(2) : '-';
      }),
    ]);

    body.push([
      'WEIGHT',
      'TOTAL WEIGHT BY DIAMETER (kg)',
      '', '', '', '', '', '', '',
      ...availableDias.map((d) => totalWeightByDia[d] > 0 ? totalWeightByDia[d].toFixed(2) : '-'),
    ]);

    body.push([
      'NET',
      'NET STEEL WEIGHT',
      '', '', '', '', '', '', '',
      `${overallTotalWeightKg.toFixed(2)} kg`,
      '', '', '', '', '', '', `${overallTotalWeightMT.toFixed(3)} MT`,
    ]);

    return { headers, body, rows };
  };

  const escapeExcelHtml = (value: unknown) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const generateExcelHTML = () => {
    const { headers, body } = buildBbsExportRows();
    const totalColumns = headers.length;

    const widths = [
      48, 180, 62, 95, 105, 65, 60, 88, 90,
      58, 58, 58, 58, 58, 58, 58, 58,
    ];

    const colHtml = widths.map((width) => `<col style="width:${width}px">`).join('');

    const rowsHtml = body.map((row) => {
      if (row.length === 1) {
        return `<tr class="section-row"><td colspan="${totalColumns}">${escapeExcelHtml(row[0])}</td></tr>`;
      }

      const kind = row[0];
      const rowClass = kind === 'TOTAL' ? 'summary-row' : kind === 'WEIGHT' ? 'weight-row' : kind === 'NET' ? 'net-row' : 'data-row';
      const cells = Array.from({ length: totalColumns }, (_, i) => row[i] ?? '');
      return `<tr class="${rowClass}">${cells.map((value, i) => `<td class="${i === 1 ? 'left' : 'center'}">${escapeExcelHtml(value)}</td>`).join('')}</tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
<meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>BBS Schedule</x:Name><x:WorksheetOptions><x:PageSetup><x:Layout x:Orientation="Landscape"/></x:PageSetup><x:FitToPage/><x:Print><x:FitWidth>1</x:FitWidth><x:FitHeight>0</x:FitHeight></x:Print><x:ShowGridLines>False</x:ShowGridLines></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
@page { size: A4 landscape; margin: 0.35in; }
* { box-sizing: border-box; }
body { font-family: Calibri, Arial, sans-serif; color: #172033; margin: 0; background: #fff; }
.report { width: 100%; }
.meta { border: 1px solid #b8c2cf; border-collapse: collapse; width: 100%; margin-bottom: 8px; }
.meta td { border: 1px solid #b8c2cf; padding: 5px 7px; font-size: 9pt; }
.brand { background: #0f5b52; color: #fff; font-weight: 700; font-size: 13pt; padding: 9px 12px; text-align: left; }
.brand small { display: block; font-size: 8pt; font-weight: 400; margin-top: 2px; opacity: .9; }
.title { background: #172033; color: #fff; font-size: 13pt; font-weight: 700; text-align: center; padding: 7px; }
.table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.table th, .table td { border: 1px solid #8e9aaa; padding: 4px 3px; font-size: 8pt; vertical-align: middle; text-align: center; }
.table th { background: #172033; color: #fff; font-weight: 700; height: 28px; }
.data-row:nth-child(even) td { background: #f7f9fb; }
.data-row td.left { text-align: left; }
.section-row td { background: #dcebe8; color: #0f5b52; font-weight: 700; text-align: left; font-size: 8.5pt; border-top: 2px solid #0f5b52; }
.summary-row td { background: #eef3f8; font-weight: 700; border-top: 2px solid #7f8c9a; }
.weight-row td { background: #e7eef7; font-weight: 700; }
.net-row td { background: #dff3ea; color: #0b5d3b; font-weight: 800; border-top: 2px solid #4b8f72; }
.footer { margin-top: 10px; font-size: 8pt; color: #667085; border-top: 1px solid #cbd5e1; padding-top: 5px; }
</style>
</head>
<body>
<div class="report">
  <div class="brand">BTTOTEK Solutions<small>Professional Bar Bending Schedule • IS 2502 workflow</small></div>
  <table class="meta">
    <tr><td><b>Project</b></td><td>${escapeExcelHtml(projectName || 'Untitled Project')}</td><td><b>Date</b></td><td>${escapeExcelHtml(billingDate.split('-').reverse().join('/'))}</td></tr>
    <tr><td><b>Steel Rate</b></td><td>₹${escapeExcelHtml(steelRate)}/kg</td><td><b>Prepared By</b></td><td>BTTOTEK Solutions</td></tr>
  </table>
  <div class="title">BAR BENDING SCHEDULE (BBS)</div>
  <table class="table"><colgroup>${colHtml}</colgroup><thead><tr>${headers.map((h) => `<th>${escapeExcelHtml(h)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table>
  <div class="footer">Generated by BTTOTEK Solutions • Grid is limited to the actual schedule and summary data • Project: ${escapeExcelHtml(projectName || 'Untitled Project')}</div>
</div>
</body></html>`;
  };

  const handleExportExcel = async () => {
    const access = await canDownloadService('excel');
    if (!access.allowed) {
      toast.info(access.reason);
      return;
    }

    try {
      const htmlData = generateExcelHTML();
      const blob = new Blob([htmlData], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `BTTOTEK-BBS-${projectName || 'Project'}-${billingDate}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Professional BBS Excel exported.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Excel export failed.');
    }
  };

  const handlePrintPDF = async () => {
    const access = await canDownloadService('pdf');
    if (!access.allowed) {
      toast.info(access.reason);
      return;
    }

    try {
      const { headers, body } = buildBbsExportRows();
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const addHeader = () => {
        doc.setFillColor(15, 91, 82);
        doc.rect(0, 0, pageWidth, 18, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('BTTOTEK Solutions', 9, 8);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Professional Bar Bending Schedule • IS 2502 workflow', 9, 13);
        doc.setFont('helvetica', 'bold');
        doc.text('BBS REPORT', pageWidth - 9, 8, { align: 'right' });
      };

      const addFooter = () => {
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.2);
        doc.line(9, pageHeight - 8, pageWidth - 9, pageHeight - 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Project: ${projectName || 'Untitled Project'} • Generated ${new Date().toLocaleString('en-IN')}`, 9, pageHeight - 4);
        doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 9, pageHeight - 4, { align: 'right' });
      };

      addHeader();
      doc.setTextColor(23, 32, 51);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('BAR BENDING SCHEDULE', 9, 27);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Project: ${projectName || 'Untitled Project'}`, 9, 33);
      doc.text(`Date: ${billingDate.split('-').reverse().join('/')}`, 110, 33);
      doc.text(`Steel Rate: ₹${steelRate}/kg`, pageWidth - 9, 33, { align: 'right' });

      const tableBody = body.map((row) => {
        if (row.length === 1) return [row[0], ...Array(headers.length - 1).fill('')];
        return Array.from({ length: headers.length }, (_, i) => row[i] ?? '');
      });

      autoTable(doc, {
        startY: 38,
        head: [headers],
        body: tableBody,
        theme: 'grid',
        margin: { left: 9, right: 9, top: 38, bottom: 12 },
        tableWidth: pageWidth - 18,
        showHead: 'everyPage',
        styles: {
          font: 'helvetica',
          fontSize: 5.4,
          cellPadding: 1.4,
          lineWidth: 0.18,
          lineColor: [148, 163, 184],
          textColor: [23, 32, 51],
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [23, 32, 51],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          fontSize: 5.3,
        },
        columnStyles: {
          0: { cellWidth: 9 },
          1: { cellWidth: 35, halign: 'left' },
          2: { cellWidth: 11 },
          3: { cellWidth: 19 },
          4: { cellWidth: 25 },
          5: { cellWidth: 13 },
          6: { cellWidth: 13 },
          7: { cellWidth: 18 },
          8: { cellWidth: 19 },
        },
        didParseCell(data) {
          if (data.section !== 'body') return;
          const first = String(data.row.raw?.[0] ?? '');
          if (first.startsWith('SECTION:')) {
            data.cell.styles.fillColor = [220, 235, 232];
            data.cell.styles.textColor = [15, 91, 82];
            data.cell.styles.fontStyle = 'bold';
          } else if (first === 'TOTAL') {
            data.cell.styles.fillColor = [238, 243, 248];
            data.cell.styles.fontStyle = 'bold';
          } else if (first === 'WEIGHT') {
            data.cell.styles.fillColor = [231, 238, 247];
            data.cell.styles.fontStyle = 'bold';
          } else if (first === 'NET') {
            data.cell.styles.fillColor = [223, 243, 234];
            data.cell.styles.textColor = [11, 93, 59];
            data.cell.styles.fontStyle = 'bold';
          } else if (data.row.index % 2 === 1) {
            data.cell.styles.fillColor = [248, 250, 252];
          }
        },
        didDrawPage() {
          addHeader();
          addFooter();
        },
      });

      const fileName = `BTTOTEK-BBS-${(projectName || 'Project').replace(/[^a-z0-9-_]+/gi, '-')}-${billingDate}.pdf`;
      doc.save(fileName);
      toast.success('Professional BBS PDF exported.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'PDF export failed.');
    }
  };

  const handleSaveWorkspace = async () => {
    if (liveEntries.length === 0) {
      toast.info('Add at least one BBS row before saving.');
      return;
    }

    setSavingWorkspace(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        toast.error('Could not verify your login.', { description: authError.message });
        return;
      }

      const currentUser = authData.user;
      if (!currentUser) {
        toast.info('Create an account or sign in to save BBS to your workspace.');
        void navigate({ to: '/auth' });
        return;
      }

      const project = `${projectName} — ${new Date().toLocaleDateString('en-IN')}`;
      const { error } = await supabase.from('saved_estimates').insert({
        user_id: currentUser.id,
        tool_slug: 'bar-bending-schedule',
        project_name: project,
        inputs: {
          projectName,
          billingDate,
          sectionHeading,
          steelRate,
        },
        results: {
          entries: liveEntries,
          totalWeightByDia,
          overallTotalWeightKg,
          overallTotalWeightMT,
          totalCostEstimate,
        },
      });

      if (error) {
        toast.error('Could not save this estimate.', { description: error.message });
        return;
      }

      toast.success('Saved to your workspace.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save this estimate.');
    } finally {
      setSavingWorkspace(false);
    }
  };

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

        {/* Enabled Actions Bar (Live Bottom Buttons) */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => void handleSaveWorkspace()}
            disabled={savingWorkspace}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded text-xs flex items-center gap-1.5 shadow transition disabled:opacity-60"
          >
            {savingWorkspace ? 'Saving...' : '📁 Save to workspace'}
          </button>
          <button
            type="button"
            onClick={() => void handlePrintPDF()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded text-xs flex items-center gap-1.5 shadow transition"
          >
            📥 Export PDF
          </button>
          <button
            type="button"
            onClick={() => void handleExportExcel()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow transition"
          >
            📊 Export Excel
          </button>
        </div>
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
