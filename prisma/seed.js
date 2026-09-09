const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Seed (Somali Companies & Staff with English Enterprise Content)...');

  // Clean existing records if any
  try {
    await prisma.assessmentSubmission.deleteMany().catch(() => {});
    await prisma.assessment.deleteMany().catch(() => {});
    await prisma.trainingEnrollment.deleteMany().catch(() => {});
    await prisma.trainingCourse.deleteMany().catch(() => {});
    await prisma.userRole.deleteMany().catch(() => {});
    await prisma.rolePermission.deleteMany().catch(() => {});
    await prisma.permission.deleteMany().catch(() => {});
    await prisma.role.deleteMany().catch(() => {});
    await prisma.attemptAnswer.deleteMany().catch(() => {});
    await prisma.certificate.deleteMany().catch(() => {});
    await prisma.aIAnalysis.deleteMany().catch(() => {});
    await prisma.trainingRecommendation.deleteMany().catch(() => {});
    await prisma.result.deleteMany().catch(() => {});
    await prisma.examAttempt.deleteMany().catch(() => {});
    await prisma.examAssignment.deleteMany().catch(() => {});
    await prisma.examQuestion.deleteMany().catch(() => {});
    await prisma.questionOption.deleteMany().catch(() => {});
    await prisma.question.deleteMany().catch(() => {});
    await prisma.topic.deleteMany().catch(() => {});
    await prisma.exam.deleteMany().catch(() => {});
    await prisma.subject.deleteMany().catch(() => {});
    await prisma.employeeProfile.deleteMany().catch(() => {});
    await prisma.position.deleteMany().catch(() => {});
    await prisma.team.deleteMany().catch(() => {});
    await prisma.department.deleteMany().catch(() => {});
    await prisma.notification.deleteMany().catch(() => {});
    await prisma.auditLog.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    await prisma.company.deleteMany().catch(() => {});
  } catch (e) {
    console.log('Initial clean skipped or table does not exist yet');
  }

  const defaultPasswordHash = await bcrypt.hash('Password123!', 12);
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin123!', 12);

  // 1. Super Admin (Guled Abdi Warsame)
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@platform.com',
      passwordHash: superAdminPasswordHash,
      name: 'Guled Abdi Warsame',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });
  console.log('✅ Super Admin created: superadmin@platform.com (Guled Abdi Warsame)');

  // 2. Somali Companies (with full English corporate profiles)
  const dahabshiilCompany = await prisma.company.create({
    data: {
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

  const banadirHospital = await prisma.company.create({
    data: {
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

  const hormuudTelecom = await prisma.company.create({
    data: {
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

  console.log('✅ Somali Companies created: Dahabshiil Bank, Banadir Health & Hormuud Telecom');

  // 3. Dahabshiil Admin & Departments (English names)
  const dahabAdmin = await prisma.user.create({
    data: {
      companyId: dahabshiilCompany.id,
      email: 'admin@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Fadumo Ahmed Ali',
      role: 'COMPANY_ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const deptFinance = await prisma.department.create({
    data: {
      companyId: dahabshiilCompany.id,
      name: 'Finance & Treasury',
      code: 'FIN',
      description: 'Capital management, banking reconciliation, corporate budgeting, and fiscal forecasting.',
    },
  });

  const deptCompliance = await prisma.department.create({
    data: {
      companyId: dahabshiilCompany.id,
      name: 'Risk & Regulatory Compliance',
      code: 'COMP',
      description: 'Anti-Money Laundering (AML/CFT), central bank statutory compliance, and enterprise risk controls.',
    },
  });

  const deptTech = await prisma.department.create({
    data: {
      companyId: dahabshiilCompany.id,
      name: 'IT & Information Security',
      code: 'TECH',
      description: 'Core banking systems, zero-trust infrastructure, cloud security, and network monitoring.',
    },
  });

  const posAccountant = await prisma.position.create({
    data: {
      companyId: dahabshiilCompany.id,
      departmentId: deptFinance.id,
      name: 'Senior Financial Analyst',
    },
  });

  const posComplianceOfficer = await prisma.position.create({
    data: {
      companyId: dahabshiilCompany.id,
      departmentId: deptCompliance.id,
      name: 'AML Compliance Specialist',
    },
  });

  const posSecOps = await prisma.position.create({
    data: {
      companyId: dahabshiilCompany.id,
      departmentId: deptTech.id,
      name: 'Cloud SecOps Analyst',
    },
  });

  // 4. Somali Staff Profiles (English designations & skills)
  const employeeAhmed = await prisma.user.create({
    data: {
      companyId: dahabshiilCompany.id,
      email: 'ahmed.k@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Ahmed Hassan Nur',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const profileAhmed = await prisma.employeeProfile.create({
    data: {
      userId: employeeAhmed.id,
      companyId: dahabshiilCompany.id,
      employeeId: 'EMP-DBI-1042',
      departmentId: deptFinance.id,
      positionId: posAccountant.id,
      phone: '+252 (61) 523-4567',
      hireDate: new Date('2023-04-15'),
      skillsJson: JSON.stringify(['Financial Modeling', 'Treasury Reconciliation', 'Tax Compliance', 'Oracle/SAP ERP']),
      certificationsJson: JSON.stringify(['CPA Certified (2023)', 'IFRS Banking Specialist']),
    },
  });

  const employeeDeeqa = await prisma.user.create({
    data: {
      companyId: dahabshiilCompany.id,
      email: 'deeqa.m@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Deeqa Mohamed Jama',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: employeeDeeqa.id,
      companyId: dahabshiilCompany.id,
      employeeId: 'EMP-DBI-1088',
      departmentId: deptCompliance.id,
      positionId: posComplianceOfficer.id,
      phone: '+252 (61) 589-1234',
      hireDate: new Date('2022-09-01'),
      skillsJson: JSON.stringify(['AML/CFT Due Diligence', 'Sanctions Screening', 'Central Bank Regulatory Reporting']),
      certificationsJson: JSON.stringify(['Certified Anti-Money Laundering Specialist (ACAMS)']),
    },
  });

  const employeeLiiban = await prisma.user.create({
    data: {
      companyId: dahabshiilCompany.id,
      email: 'liiban.v@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Liban Farah Warsame',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: employeeLiiban.id,
      companyId: dahabshiilCompany.id,
      employeeId: 'EMP-DBI-1095',
      departmentId: deptTech.id,
      positionId: posSecOps.id,
      phone: '+252 (61) 599-8833',
      hireDate: new Date('2023-01-10'),
      skillsJson: JSON.stringify(['Zero Trust Architecture', 'Cloud Infrastructure Security', 'Incident Response']),
      certificationsJson: JSON.stringify(['CompTIA Security+', 'AWS Certified Security Specialty']),
    },
  });

  const employeeHodan = await prisma.user.create({
    data: {
      companyId: dahabshiilCompany.id,
      email: 'hodan.a@dahabshiil.so',
      passwordHash: defaultPasswordHash,
      name: 'Hodan Abdi Shire',
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  await prisma.employeeProfile.create({
    data: {
      userId: employeeHodan.id,
      companyId: dahabshiilCompany.id,
      employeeId: 'EMP-DBI-1102',
      departmentId: deptFinance.id,
      phone: '+252 (61) 511-2244',
      hireDate: new Date('2023-08-20'),
      skillsJson: JSON.stringify(['Cash Management', 'Fixed Asset Ledger']),
    },
  });

  // 5. English Subject & Topics for Dahabshiil
  const subjectFinance = await prisma.subject.create({
    data: {
      companyId: dahabshiilCompany.id,
      name: 'Corporate Financial Governance & Risk Controls',
      code: 'FIN-401',
      description: 'Comprehensive professional assessment covering banking reconciliation, treasury security, zero-based budgeting, and anti-fraud procedures.',
      departmentId: deptFinance.id,
      category: 'Finance & Accounting',
      difficulty: 'ADVANCED',
      status: 'ACTIVE',
      createdById: dahabAdmin.id,
    },
  });

  const topicCash = await prisma.topic.create({
    data: {
      subjectId: subjectFinance.id,
      name: 'Cash Management & Bank Reconciliation',
      description: 'Daily cash pooling, suspense account controls, and ledger variance tracking.',
    },
  });

  const topicBudget = await prisma.topic.create({
    data: {
      subjectId: subjectFinance.id,
      name: 'Budget Variance & Forecast Modeling',
      description: 'Variance tolerance thresholds, rolling forecasts, and capital expenditure controls.',
    },
  });

  const topicAudit = await prisma.topic.create({
    data: {
      subjectId: subjectFinance.id,
      name: 'Internal Audit & Fraud Prevention',
      description: 'Segregation of duties (SoD), transaction verification, and whistle-blowing protocols.',
    },
  });

  // 6. Professional English Questions
  const q1 = await prisma.question.create({
    data: {
      companyId: dahabshiilCompany.id,
      subjectId: subjectFinance.id,
      topicId: topicCash.id,
      questionText: 'When performing daily cash reconciliations, an unexplained positive variance of $45,000 is discovered across ledger accounts. What is the standard operating protocol?',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      marks: 2.0,
      explanation: 'Unidentified variance amounts must be immediately isolated into a suspense holding account, logged into the audit ledger, and reported to the Treasury Controller before any ledger adjustments.',
      tags: 'Cash Management, Treasury, Reconciliation',
      status: 'ACTIVE',
      createdById: dahabAdmin.id,
      options: {
        create: [
          { optionText: 'Immediately transfer the funds into operating cash to boost liquidity metrics.', isCorrect: false, orderIndex: 0 },
          { optionText: 'Isolate the variance into a designated suspense ledger, log an audit incident, and escalate to Treasury Controller.', isCorrect: true, orderIndex: 1 },
          { optionText: 'Distribute the sum evenly across quarterly department miscellaneous expense accounts.', isCorrect: false, orderIndex: 2 },
          { optionText: 'Ignore the discrepancy if total end-of-month cash balances remain within 2% margin.', isCorrect: false, orderIndex: 3 },
        ],
      },
    },
  });

  const q2 = await prisma.question.create({
    data: {
      companyId: dahabshiilCompany.id,
      subjectId: subjectFinance.id,
      topicId: topicBudget.id,
      questionText: 'Which budgeting methodology requires every corporate expenditure to be justified from scratch for each new fiscal cycle regardless of previous allocations?',
      type: 'MCQ',
      difficulty: 'EASY',
      marks: 1.0,
      explanation: 'Zero-Based Budgeting (ZBB) requires managers to justify all proposed expenses from a zero baseline rather than incrementally adjusting prior budgets.',
      tags: 'Budgeting, Financial Planning',
      status: 'ACTIVE',
      createdById: dahabAdmin.id,
      options: {
        create: [
          { optionText: 'Incremental Baseline Budgeting', isCorrect: false, orderIndex: 0 },
          { optionText: 'Zero-Based Budgeting (ZBB)', isCorrect: true, orderIndex: 1 },
          { optionText: 'Static Variance Budgeting', isCorrect: false, orderIndex: 2 },
          { optionText: 'Activity-Based Capitalization', isCorrect: false, orderIndex: 3 },
        ],
      },
    },
  });

  const q3 = await prisma.question.create({
    data: {
      companyId: dahabshiilCompany.id,
      subjectId: subjectFinance.id,
      topicId: topicAudit.id,
      questionText: 'Enterprise internal control frameworks mandate that individuals who authorize financial disbursements MUST NOT also possess permissions to reconcile bank statements (Segregation of Duties).',
      type: 'TRUE_FALSE',
      difficulty: 'EASY',
      marks: 1.0,
      explanation: 'Segregation of duties (SoD) is essential to prevent unauthorized disbursements and concealments in corporate treasury.',
      tags: 'Internal Audit, Controls, Compliance',
      status: 'ACTIVE',
      createdById: dahabAdmin.id,
      options: {
        create: [
          { optionText: 'True', isCorrect: true, orderIndex: 0 },
          { optionText: 'False', isCorrect: false, orderIndex: 1 },
        ],
      },
    },
  });

  const q4 = await prisma.question.create({
    data: {
      companyId: dahabshiilCompany.id,
      subjectId: subjectFinance.id,
      topicId: topicAudit.id,
      questionText: 'Scenario: A vendor requests an urgent update to their remittance bank account details via an email from a recognized contact name. Which verification procedures are mandatory before releasing invoice payments?',
      type: 'SCENARIO',
      difficulty: 'HARD',
      marks: 3.0,
      explanation: 'To defeat Business Email Compromise (BEC) fraud, accounts payable must conduct out-of-band telephone verification using independently registered directory phone numbers before altering wire details.',
      tags: 'Fraud Prevention, Wire Transfer, BEC',
      status: 'ACTIVE',
      createdById: dahabAdmin.id,
      options: {
        create: [
          { optionText: 'Reply directly to the email requesting an attached scanned PDF signed invoice copy.', isCorrect: false, orderIndex: 0 },
          { optionText: 'Conduct out-of-band voice authentication using primary registered contact numbers on file before updating banking records.', isCorrect: true, orderIndex: 1 },
          { optionText: 'Approve the change immediately if the invoice amount is under $10,000 threshold.', isCorrect: false, orderIndex: 2 },
          { optionText: 'Update the records and wait for the automated bank clearing house confirmation report.', isCorrect: false, orderIndex: 3 },
        ],
      },
    },
  });

  const q5 = await prisma.question.create({
    data: {
      companyId: dahabshiilCompany.id,
      subjectId: subjectFinance.id,
      topicId: topicBudget.id,
      questionText: 'Which of the following factors would produce an unfavorable Direct Material Price Variance? (Select all that apply)',
      type: 'MULTIPLE_SELECT',
      difficulty: 'ADVANCED',
      marks: 2.0,
      explanation: 'Purchasing higher-grade materials, sudden raw material tariff increases, or expedited freight charges increase actual purchase prices above standard costs.',
      tags: 'Variance Analysis, Cost Accounting',
      status: 'ACTIVE',
      createdById: dahabAdmin.id,
      options: {
        create: [
          { optionText: 'Unexpected supply chain tariffs increasing per-unit raw material costs', isCorrect: true, orderIndex: 0 },
          { optionText: 'Purchasing in bulk quantities to negotiate volume supplier discounts', isCorrect: false, orderIndex: 1 },
          { optionText: 'Incurring rush shipping fees due to emergency supplier stockouts', isCorrect: true, orderIndex: 2 },
          { optionText: 'Decreased waste during production machinery operation', isCorrect: false, orderIndex: 3 },
        ],
      },
    },
  });

  // 7. English Certified Exam
  const exam = await prisma.exam.create({
    data: {
      companyId: dahabshiilCompany.id,
      subjectId: subjectFinance.id,
      title: 'Annual Corporate Financial Governance & Compliance Certification 2026',
      code: 'EXAM-DAHAB-FIN-2026',
      description: 'Mandatory annual qualification exam assessing treasury security, zero-based budgeting, internal audit controls, and anti-fraud vigilance.',
      instructions: 'You have 45 minutes to complete this examination. Read every scenario carefully. Full-screen mode is required. Do not switch browser tabs. Autosave is active.',
      examType: 'CERTIFICATION',
      durationMinutes: 45,
      passScorePercent: 70.0,
      totalMarks: 9.0,
      questionCount: 5,
      randomQuestions: false,
      randomOptions: true,
      allowRetakes: true,
      maxAttempts: 3,
      isCertEligible: true,
      fullScreenRequired: true,
      tabSwitchDetect: true,
      copyPasteRestrict: true,
      status: 'PUBLISHED',
      createdById: dahabAdmin.id,
      examQuestions: {
        create: [
          { questionId: q1.id, orderIndex: 0, marks: 2.0 },
          { questionId: q2.id, orderIndex: 1, marks: 1.0 },
          { questionId: q3.id, orderIndex: 2, marks: 1.0 },
          { questionId: q4.id, orderIndex: 3, marks: 3.0 },
          { questionId: q5.id, orderIndex: 4, marks: 2.0 },
        ],
      },
    },
  });

  // 8. Assign Exam
  await prisma.examAssignment.create({
    data: {
      companyId: dahabshiilCompany.id,
      examId: exam.id,
      targetType: 'DEPARTMENT',
      departmentId: deptFinance.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'ASSIGNED',
    },
  });

  await prisma.examAssignment.create({
    data: {
      companyId: dahabshiilCompany.id,
      examId: exam.id,
      targetType: 'INDIVIDUAL',
      employeeProfileId: profileAhmed.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
    },
  });

  // 9. Sample Completed Attempt, Result, AI Analysis & Verified Certificate for Ahmed Hassan Nur
  const attempt = await prisma.examAttempt.create({
    data: {
      companyId: dahabshiilCompany.id,
      examId: exam.id,
      userId: employeeAhmed.id,
      attemptNumber: 1,
      startedAt: new Date(Date.now() - 3600 * 1000),
      submittedAt: new Date(Date.now() - 1200 * 1000),
      durationSeconds: 1680,
      status: 'SUBMITTED',
      totalMarksEarned: 8.0,
      maxMarks: 9.0,
      percentage: 88.89,
      isPassed: true,
      currentQuestionIndex: 4,
      antiCheatIncidentsJson: JSON.stringify([]),
    },
  });

  const sampleResult = await prisma.result.create({
    data: {
      companyId: dahabshiilCompany.id,
      attemptId: attempt.id,
      examId: exam.id,
      userId: employeeAhmed.id,
      totalScore: 8.0,
      maxScore: 9.0,
      percentage: 88.89,
      isPassed: true,
      correctCount: 4,
      wrongCount: 1,
      unansweredCount: 0,
      timeSpentSeconds: 1680,
      gradedAt: new Date(Date.now() - 1200 * 1000),
      topicBreakdownJson: JSON.stringify({
        'Cash Management & Bank Reconciliation': { total: 1, correct: 1 },
        'Budget Variance & Forecast Modeling': { total: 2, correct: 1 },
        'Internal Audit & Fraud Prevention': { total: 2, correct: 2 },
      }),
    },
  });

  const certNumber = 'CERT-DAHAB-2026-00042';
  const cert = await prisma.certificate.create({
    data: {
      companyId: dahabshiilCompany.id,
      resultId: sampleResult.id,
      userId: employeeAhmed.id,
      examId: exam.id,
      certNumber: certNumber,
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'VALID',
      verificationToken: 'vtok_dahab_ahmed_889241',
      metadataJson: JSON.stringify({
        honors: 'Distinction',
        authorizedSignatory: 'Fadumo Ahmed Ali, VP of Finance & HR',
      }),
    },
  });

  await prisma.aIAnalysis.create({
    data: {
      companyId: dahabshiilCompany.id,
      resultId: sampleResult.id,
      userId: employeeAhmed.id,
      overallSummary: 'Ahmed Hassan Nur demonstrated advanced mastery across Corporate Financial Governance (88.9%). Superb performance in Internal Audit Controls and Suspense Cash Management.',
      weakTopicsJson: JSON.stringify(['Budget Variance & Forecast Modeling (50%)']),
      strongTopicsJson: JSON.stringify(['Internal Audit & Fraud Prevention (100%)', 'Cash Management & Bank Reconciliation (100%)']),
      improvementRoadmapJson: JSON.stringify([
        { step: 1, title: 'Variance Formula Deep Dive', action: 'Review cost accounting variance equations for Direct Material & Overhead margins.' },
        { step: 2, title: 'Interactive Practical Scenario', action: 'Execute 3 practice forecast models in the internal ERP training sandbox.' },
      ]),
      recommendedActionsJson: JSON.stringify([
        { courseTitle: 'Advanced Variance Analysis & Rolling Forecasts', priority: 'MEDIUM', description: '2-hour module on dynamic budgeting in volatile banking environments.' },
      ]),
    },
  });

  await prisma.trainingRecommendation.create({
    data: {
      companyId: dahabshiilCompany.id,
      userId: employeeAhmed.id,
      topicTitle: 'Budget Variance & Forecast Modeling',
      courseTitle: 'Advanced Variance Analysis & Rolling Forecasts',
      description: 'Targeted self-paced module with practical exercises on variance thresholds.',
      priority: 'MEDIUM',
      status: 'PENDING',
    },
  });

  await prisma.notification.create({
    data: {
      userId: employeeAhmed.id,
      companyId: dahabshiilCompany.id,
      title: 'Certificate Issued: Financial Governance 2026',
      message: `Congratulations! Your professional certificate (${certNumber}) has been generated and is ready for download.`,
      type: 'CERTIFICATE_ISSUED',
      linkUrl: `/dashboard/certificates`,
    },
  });

  // Log Audit trail
  await prisma.auditLog.create({
    data: {
      companyId: dahabshiilCompany.id,
      userId: dahabAdmin.id,
      userEmail: dahabAdmin.email,
      action: 'PUBLISH_EXAM',
      entity: 'EXAM',
      entityId: exam.id,
      detailsJson: JSON.stringify({ examTitle: exam.title, totalMarks: 9.0 }),
      ipAddress: '197.220.12.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });

  // 10. Seed System Roles & Permissions
  console.log('🌱 Seeding Roles, Permissions, Training Courses, and Assessments...');
  const permissionsList = [
    { code: 'exams.create', name: 'Create Exams', category: 'EXAMS', description: 'Can design and publish new exams' },
    { code: 'exams.grade', name: 'Grade & Review Exams', category: 'EXAMS', description: 'Can manually evaluate essays and review attempts' },
    { code: 'employees.manage', name: 'Manage Staff', category: 'EMPLOYEES', description: 'Can invite, edit, and deactivate employees' },
    { code: 'certs.issue', name: 'Issue Certificates', category: 'CERTIFICATES', description: 'Can generate and sign verified credentials' },
    { code: 'training.manage', name: 'Manage Training', category: 'TRAINING', description: 'Can create and assign training roadmaps' },
    { code: 'system.audit', name: 'View Audit Trail', category: 'SYSTEM', description: 'Can review security logs and user activities' },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  const companyAdminRole = await prisma.role.create({
    data: {
      companyId: dahabshiilCompany.id,
      name: 'COMPANY_ADMIN',
      description: 'Full organizational administrative control over company tenant',
      isSystem: true,
    },
  });

  const employeeRole = await prisma.role.create({
    data: {
      companyId: dahabshiilCompany.id,
      name: 'EMPLOYEE',
      description: 'Standard staff member with exam taking and cert access',
      isSystem: true,
    },
  });

  // Assign user roles
  await prisma.userRole.create({
    data: {
      userId: dahabAdmin.id,
      roleId: companyAdminRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: employeeAhmed.id,
      roleId: employeeRole.id,
    },
  });

  // 11. Seed Training Course & Enrollment
  const course1 = await prisma.trainingCourse.create({
    data: {
      companyId: dahabshiilCompany.id,
      title: 'Corporate Financial Risk & Anti-Fraud Compliance 2026',
      code: 'TRN-FIN-001',
      description: 'Comprehensive enterprise training course on financial controls, AML compliance, and audit reconciliation.',
      category: 'Finance & Compliance',
      difficulty: 'INTERMEDIATE',
      durationHours: 12.5,
      status: 'PUBLISHED',
      createdById: dahabAdmin.id,
      syllabusJson: JSON.stringify([
        { module: 1, title: 'AML & Know Your Customer (KYC) Regulations', hours: 3 },
        { module: 2, title: 'Suspense Account Controls & Daily Bank Reconciliation', hours: 4.5 },
        { module: 3, title: 'Variance Analysis & Dynamic Forecasting in ERP', hours: 5 },
      ]),
    },
  });

  await prisma.trainingEnrollment.create({
    data: {
      companyId: dahabshiilCompany.id,
      courseId: course1.id,
      userId: employeeAhmed.id,
      status: 'IN_PROGRESS',
      progressPercent: 65.0,
      score: 88.5,
    },
  });

  // 12. Seed Assessment & Submission
  const assessment1 = await prisma.assessment.create({
    data: {
      companyId: dahabshiilCompany.id,
      title: 'Senior Financial Analyst Competency Assessment',
      code: 'ASM-FIN-2026',
      description: 'Annual skills evaluation assessing ledger auditing, cash control, and budget forecasting accuracy.',
      type: 'PROMOTION',
      passingScore: 75.0,
      status: 'ACTIVE',
      examId: exam.id,
    },
  });

  await prisma.assessmentSubmission.create({
    data: {
      assessmentId: assessment1.id,
      userId: employeeAhmed.id,
      score: 88.89,
      isPassed: true,
      feedback: 'Outstanding technical score in cash reconciliations and treasury governance.',
    },
  });

  console.log('✅ Roles, Permissions, Training Courses, and Assessments seeded successfully');
  console.log('✅ Sample Exam, Attempt, Result, AI Analysis & Certificate created for Ahmed Hassan Nur');
  console.log('🎉 Enterprise Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
