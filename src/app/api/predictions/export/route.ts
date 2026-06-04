import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json({ message: 'Falta participantId' }, { status: 400 });
    }

    const participant = await prisma.participant.findFirst({
      where: { id: participantId, userId: (session.user as any).id },
      include: {
        user: true,
        tournament: true,
        predictions: {
          include: {
            match: {
              include: { localTeam: true, visitorTeam: true },
            },
          },
          orderBy: { match: { dateTime: 'asc' } },
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ message: 'Participante no encontrado' }, { status: 404 });
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Mis Pronósticos', 14, 22);

    doc.setFontSize(10);
    doc.text(`Participante: ${participant.user.name}`, 14, 32);
    doc.text(`Código: ${participant.code || '—'}`, 14, 38);
    doc.text(`Torneo: ${participant.tournament.name}`, 14, 44);

    const rows = participant.predictions.map((p, i) => [
      i + 1,
      `${p.match.localTeam.shortName || p.match.localTeam.name} vs ${p.match.visitorTeam.shortName || p.match.visitorTeam.name}`,
      `${p.localPred}-${p.visitorPred}`,
      p.match.status === 'FINISHED' ? `${p.match.localGoals ?? '?'}-${p.match.visitorGoals ?? '?'}` : '—',
      p.points ?? 0,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['#', 'Partido', 'Pronóstico', 'Resultado', 'Pts']],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pronosticos-${participant.code || participant.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ message: 'Error al generar PDF' }, { status: 500 });
  }
}
