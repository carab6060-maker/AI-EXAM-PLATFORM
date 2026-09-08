import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function runDatabaseSeed() {
  const defaultPasswordHash = await bcrypt.hash('Password123!', 12);
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin123!', 12);

  // 1. Super Admin (Guled Abdi Warsame)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@platform.com' },
    update: {},
    create: {
      email: 'superadmin@platform.com',
      passwordHash: superAdminPasswordHash,
      name: 'Guled Abdi Warsame',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 2. Somali Companies
  const dahabshiilCompany = await prisma.company.upsert({
    where: { code: 'DAHAB' },
    update: {},
    create: {
      name: 'Dahabshiil Bank International',
      code: 'DAHAB',
      email: 'contact@dahabshiil.so',
      phone: '+252 (61) 555-4010',
      address: 'Maka Al-Mukarama Street, Hodan District, Mogadishu, Somalia',
      website: 'https://dahabshiil.so.demo',
      industry: 'Banking & Financial Services',
      registrationNo: 'SOM-MOG-2015-8841',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120',
    },
  });

  const banadirHospital = await prisma.company.upsert({
    where: { code: 'BANADIR' },
    update: {},
    create: {
      name: 'Banadir Health & Medical Center',
      code: 'BANADIR',
      email: 'hr@banadirhealth.so',
      phone: '+252 (61) 888-2920',
      address: 'Digfeer Road, Warta Nabada District, Mogadishu, Somalia',
      website: 'https://banadirhealth.so.demo',
      industry: 'Healthcare & Hospital Systems',
      registrationNo: 'SOM-MED-99420',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120',
    },
  });

  const hormuudTelecom = await prisma.company.upsert({
    where: { code: 'HORMUUD' },
    update: {},
    create: {
      name: 'Hormuud Telecom & Cloud Solutions',
      code: 'HORMUUD',
      email: 'enterprise@hormuud.so',
      phone: '+252 (61) 777-9000',
      address: 'KPP Junction, KM4 Area, Mogadishu, Somalia',
      website: 'https://hormuud.so.demo',
      industry: 'Telecommunications & Cloud Technology',
      registrationNo: 'SOM-TEL-77412',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120',
    },
  });

  // 3. Dahabshiil Admin
  const dahabAdmin = await prisma.user.upsert({
    where: { email: 'admin@dahabshiil.so' },
    update: {},
    create: {
      companyId: dahabshiilCompany.id,
      email: 'admin@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Fadumo Ahmed Ali',
      role: 'COMPANY_ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  // 4. Somali Staff Profiles
  const employeeAhmed = await prisma.user.upsert({
    where: { email: 'ahmed.k@dahabshiil.so' },
    update: {},
    create: {
      companyId: dahabshiilCompany.id,
      email: 'ahmed.k@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Ahmed Hassan Nur',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: employeeAhmed.id },
    update: {},
    create: {
      userId: employeeAhmed.id,
      companyId: dahabshiilCompany.id,
      employeeId: 'EMP-DBI-1042',
      phone: '+252 (61) 523-4567',
      hireDate: new Date('2023-04-15'),
      skillsJson: JSON.stringify(['Financial Modeling', 'Treasury Reconciliation', 'Tax Compliance', 'Oracle/SAP ERP']),
      certificationsJson: JSON.stringify(['CPA Certified (2023)', 'IFRS Banking Specialist']),
    },
  });

  const employeeDeeqa = await prisma.user.upsert({
    where: { email: 'deeqa.m@dahabshiil.so' },
    update: {},
    create: {
      companyId: dahabshiilCompany.id,
      email: 'deeqa.m@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Deeqa Mohamed Jama',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: employeeDeeqa.id },
    update: {},
    create: {
      userId: employeeDeeqa.id,
      companyId: dahabshiilCompany.id,
      employeeId: 'EMP-DBI-1088',
      phone: '+252 (61) 589-1234',
      hireDate: new Date('2022-09-01'),
      skillsJson: JSON.stringify(['AML/CFT Due Diligence', 'Sanctions Screening', 'Central Bank Regulatory Reporting']),
      certificationsJson: JSON.stringify(['Certified Anti-Money Laundering Specialist (ACAMS)']),
    },
  });

  // 5. Enterprise Subjects
  const subjectAML = await prisma.subject.upsert({
    where: { id: 'subj-aml-compliance-01' },
    update: {},
    create: {
      id: 'subj-aml-compliance-01',
      companyId: dahabshiilCompany.id,
      createdById: dahabAdmin.id,
      code: 'FIN-AML-101',
      name: 'Anti-Money Laundering (AML) & CFT Compliance',
      description: 'Comprehensive regulatory framework, suspicious activity reporting (SAR), and international sanction compliance standards.',
      category: 'Financial Regulation',
      status: 'ACTIVE',
    },
  });

  const subjectCyber = await prisma.subject.upsert({
    where: { id: 'subj-cyber-security-01' },
    update: {},
    create: {
      id: 'subj-cyber-security-01',
      companyId: dahabshiilCompany.id,
      createdById: dahabAdmin.id,
      code: 'SEC-ZERO-202',
      name: 'Zero-Trust Cybersecurity & Information Protection',
      description: 'Enterprise threat detection, multi-factor credential governance, phishing defense, and customer data privacy compliance.',
      category: 'Information Security',
      status: 'ACTIVE',
    },
  });

  // 6. Enterprise Exam
  await prisma.exam.upsert({
    where: { id: 'exam-aml-cert-2026' },
    update: {},
    create: {
      id: 'exam-aml-cert-2026',
      companyId: dahabshiilCompany.id,
      createdById: dahabAdmin.id,
      subjectId: subjectAML.id,
      code: 'EXAM-AML-2026',
      title: 'Annual AML & Financial Crime Risk Certification (2026)',
      description: 'Mandatory annual enterprise certification evaluating regulatory compliance, KYC/CDD protocols, and suspicious transaction escalation procedures.',
      instructions: '1. Total Questions: 10.\n2. Passing Threshold: 75%.\n3. Complete within 30 minutes.\n4. AI proctoring and tab-switching monitoring active.',
      durationMinutes: 30,
      passScorePercent: 75,
      maxAttempts: 3,
      randomQuestions: true,
      randomOptions: true,
      fullScreenRequired: true,
      tabSwitchDetect: true,
      copyPasteRestrict: true,
      isCertEligible: true,
      status: 'PUBLISHED',
      totalMarks: 100,
    },
  });

  return {
    success: true,
    message: 'Database initialized successfully with Somali companies & users!',
    counts: {
      superAdmin: superAdmin.email,
      admin: dahabAdmin.email,
      sampleEmployee: employeeAhmed.email,
    },
  };
}
