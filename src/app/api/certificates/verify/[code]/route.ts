import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const rawCode = decodeURIComponent(params.code).trim();

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certNumber: rawCode },
          { verificationToken: rawCode },
          { id: rawCode },
        ],
      },
      include: {
        company: {
          select: {
            name: true,
            code: true,
            logo: true,
            industry: true,
            website: true,
          },
        },
        user: {
          select: {
            name: true,
            employeeProfile: {
              select: {
                employeeId: true,
                department: { select: { name: true } },
                position: { select: { name: true } },
              },
            },
          },
        },
        exam: {
          select: {
            title: true,
            code: true,
            examType: true,
            subject: {
              select: { name: true, category: true },
            },
          },
        },
        result: {
          select: {
            percentage: true,
            isPassed: true,
            gradedAt: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({
        found: false,
        message: 'No certificate found with the provided credential identifier.',
      }, { status: 404 });
    }

    // Check if expired
    const isExpired = certificate.expiryDate && new Date() > new Date(certificate.expiryDate);
    const effectiveStatus = certificate.status === 'REVOKED' ? 'REVOKED' : (isExpired ? 'EXPIRED' : certificate.status);

    return NextResponse.json({
      found: true,
      certificate: {
        certNumber: certificate.certNumber,
        status: effectiveStatus,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        recipientName: certificate.user.name,
        employeeId: certificate.user.employeeProfile?.employeeId,
        department: certificate.user.employeeProfile?.department?.name,
        position: certificate.user.employeeProfile?.position?.name,
        companyName: certificate.company.name,
        companyLogo: certificate.company.logo,
        companyWebsite: certificate.company.website,
        examTitle: certificate.exam.title,
        subjectName: certificate.exam.subject.name,
        percentageScore: certificate.result.percentage,
        isVerified: effectiveStatus === 'VALID',
      },
    });
  } catch (error: any) {
    console.error('Public certificate verification error:', error);
    return NextResponse.json({ error: 'Server error during certificate verification' }, { status: 500 });
  }
}
