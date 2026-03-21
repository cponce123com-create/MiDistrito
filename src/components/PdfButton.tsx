"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

interface Prediction {
  match: {
    localTeam: { name: string };
    visitorTeam: { name: string };
    dateTime: string;
  };
  localPred: number;
  visitorPred: number;
}

interface PdfButtonProps {
  participantName: string;
  tournamentName: string;
  predictions: Prediction[];
}

export const PdfButton = ({ participantName, tournamentName, predictions }: PdfButtonProps) => {
  const generatePdf = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Polla Deportiva", 105, 15, { align: "center" });
    doc.setFontSize(14);
    doc.text(tournamentName, 105, 25, { align: "center" });

    // Participant Info
    doc.setFontSize(11);
    doc.text(`Participante: ${participantName}`, 14, 40);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleString()}`, 14, 47);

    // Predictions Table
    const tableData = predictions.map((p) => [
      new Date(p.match.dateTime).toLocaleDateString(),
      p.match.localTeam.name,
      `${p.localPred} - ${p.visitorPred}`,
      p.match.visitorTeam.name,
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["Fecha", "Local", "Pronóstico", "Visitante"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        "Este documento sirve como comprobante de tus jugadas.",
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(`pronosticos_${participantName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <button
      onClick={generatePdf}
      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
    >
      <Download className="h-5 w-5" />
      <span>Descargar PDF</span>
    </button>
  );
};
