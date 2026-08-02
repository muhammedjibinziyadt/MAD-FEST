"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "./modal";
import { Button } from "./button";
import { Printer, Download, FileText } from "lucide-react";

export interface ReportColumn<T = any> {
  header: string;
  key?: string;
  render: (item: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface ReportConfig<T = any> {
  title: string;
  subtitle?: string;
  columns: ReportColumn<T>[];
  data: T[];
  filename?: string;
}

interface ReportPrintModalProps<T = any> {
  open: boolean;
  onClose: () => void;
  config: ReportConfig<T>;
}

export function ReportPrintModal<T = any>({
  open,
  onClose,
  config,
}: ReportPrintModalProps<T>) {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { title, subtitle, columns, data, filename = "report" } = config;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = columns.map((c) => c.header).join(",");
    const rows = data.map((item, index) => {
      return columns
        .map((col) => {
          const val = col.render(item, index);
          const str = typeof val === "string" || typeof val === "number" ? String(val) : "";
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!open) return null;

  const reportDocumentContent = (
    <div id="printable-report-area" className="w-full bg-white text-slate-900 font-sans">
      {/* Header Title */}
      <div className="text-center mb-6 pb-4 border-b-2 border-slate-900">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg font-bold text-slate-700 mt-1 uppercase tracking-wide">
            {subtitle}
          </p>
        )}
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="print-table w-full border-collapse border-2 border-slate-900 text-slate-900">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className={`border-2 border-slate-900 px-4 py-3 font-bold text-xs uppercase tracking-wider text-slate-900 whitespace-nowrap ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border border-slate-700 px-5 py-8 text-center text-slate-500 italic text-sm"
                >
                  No records found for this report.
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={rowIdx % 2 === 1 ? "bg-slate-50/70" : "bg-white"}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`border border-slate-700 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 leading-normal ${
                        col.align === "center"
                          ? "text-center whitespace-nowrap"
                          : col.align === "right"
                          ? "text-right whitespace-nowrap"
                          : "text-left"
                      }`}
                    >
                      {col.render(item, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer timestamp */}
      <div className="mt-6 flex items-center justify-between text-xs font-semibold text-slate-700 border-t-2 border-slate-900 pt-3">
        <span>Total Records: {data.length}</span>
        <span>Report Generated: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Report Preview & Print"
        size="xl"
        actions={
          <div className="flex items-center gap-3 w-full justify-between sm:justify-end">
            <Button variant="secondary" onClick={handleDownloadCSV} className="gap-2">
              <Download className="h-4 w-4" /> CSV Export
            </Button>
            <Button onClick={handlePrint} className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg">
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
          </div>
        }
      >
        <style>{`
          @media print {
            @page {
              size: portrait;
              margin: 10mm 12mm 12mm 12mm;
            }
            html, body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }
            body > *:not(#report-print-portal) {
              display: none !important;
            }
            #report-print-portal {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              visibility: visible !important;
            }
            #report-print-portal * {
              visibility: visible !important;
            }
            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            .print-table th {
              background-color: #f1f5f9 !important;
              padding: 10px 14px !important;
              font-size: 11px !important;
              font-weight: 800 !important;
              letter-spacing: 0.05em !important;
              text-transform: uppercase !important;
              border: 2px solid #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-table td {
              padding: 10px 14px !important;
              font-size: 12px !important;
              font-weight: 600 !important;
              border: 1px solid #334155 !important;
              line-height: 1.4 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-table tr:nth-child(even) {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>

        {/* Modal Preview Body */}
        <div className="space-y-4">
          <p className="text-xs text-white/60">
            Preview of your report document below. Click <strong>Print / Save PDF</strong> to print or download as vector PDF.
          </p>

          {/* Report Canvas Container */}
          <div className="overflow-x-auto rounded-xl border border-white/20 bg-white p-6 sm:p-10 text-slate-900 shadow-2xl">
            {reportDocumentContent}
          </div>
        </div>
      </Modal>

      {/* Portal rendered directly under document.body for Print */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div id="report-print-portal" className="hidden print:block">
          {reportDocumentContent}
        </div>,
        document.body
      )}
    </>
  );
}
