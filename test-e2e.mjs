// Comprehensive End-to-End Enterprise Testing Suite
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting Enterprise Examination Platform E2E Test Suite...\n');
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Authenticate as Super Admin
  console.log('--- 1. Testing Super Admin Authentication ---');
  const superAdminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@platform.com', password: 'SuperAdmin123!' }),
  });
  assert(superAdminLoginRes.status === 200, 'Super Admin login successful');
  const superAdminData = await superAdminLoginRes.json();
  const superAdminToken = superAdminData.token;
  assert(superAdminData.user.role === 'SUPER_ADMIN', 'Super Admin role verified');

  // 2. Authenticate as Company Admin (Apex)
  console.log('\n--- 2. Testing Company Admin Authentication ---');
  const apexAdminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@apexfinance.com', password: 'Password123!' }),
  });
  assert(apexAdminLoginRes.status === 200, 'Company Admin login successful');
  const apexAdminData = await apexAdminLoginRes.json();
  const apexAdminToken = apexAdminData.token;
  assert(apexAdminData.user.role === 'COMPANY_ADMIN', 'Apex Admin role verified');

  // 3. Test Multi-Tenant Company Creation (Super Admin)
  console.log('\n--- 3. Testing Tenant Provisioning ---');
  const newCompanyRes = await fetch(`${BASE_URL}/api/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({
      name: 'Vanguard Cyber Defense',
      code: 'VCD',
      industry: 'Cybersecurity',
      email: 'info@vanguardcyber.demo',
      plan: 'ENTERPRISE',
    }),
  });
  assert(newCompanyRes.status === 201, 'Super Admin successfully provisioned new company');
  const newCompanyData = await newCompanyRes.json();
  const testCompanyId = newCompanyData.company.id;

  // 4. Test Department Creation
  console.log('\n--- 4. Testing Department & Team Creation ---');
  const deptRes = await fetch(`${BASE_URL}/api/departments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      name: 'Cloud Security Operations',
      code: 'SECOPS',
      description: 'Zero Trust architecture and security incident response',
      teams: ['SOC Tier 1', 'Threat Hunting', 'Cloud Arch'],
    }),
  });
  assert(deptRes.status === 201, 'Department and teams created');
  const deptData = await deptRes.json();
  const testDeptId = deptData.department.id;

  // 5. Test Employee Creation
  console.log('\n--- 5. Testing Employee Registration ---');
  const empRes = await fetch(`${BASE_URL}/api/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      name: 'Marcus Vance',
      email: 'marcus.vance@apexfinance.com',
      password: 'Employee123!',
      employeeId: 'EMP-AFG-9021',
      departmentId: testDeptId,
      role: 'EMPLOYEE',
      phone: '+1 (555) 492-8811',
    }),
  });
  assert(empRes.status === 201, 'New staff employee created');
  const empData = await empRes.json();
  const testEmpUserId = empData.employee.userId;

  // 6. Test CSV Employee Import
  console.log('\n--- 6. Testing Bulk CSV Import ---');
  const csvRes = await fetch(`${BASE_URL}/api/employees/import-csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      employees: [
        { name: 'Diana Prince', email: 'diana.p@apexfinance.com', employeeId: 'EMP-AFG-9022', departmentCode: 'SECOPS' },
        { name: 'Bruce Wayne', email: 'bruce.w@apexfinance.com', employeeId: 'EMP-AFG-9023', departmentCode: 'SECOPS' },
      ],
    }),
  });
  assert(csvRes.status === 200, 'CSV Import endpoint returned 200');
  const csvData = await csvRes.json();
  assert(csvData.summary.successCount === 2, 'Successfully imported 2 employees via CSV');

  // 7. Test Subject Creation
  console.log('\n--- 7. Testing Subject Creation ---');
  const subjRes = await fetch(`${BASE_URL}/api/subjects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      name: 'Zero Trust Cloud Architecture & Compliance',
      code: 'ZT-500',
      description: 'Identity perimeter, least privilege enforcement, and continuous verification.',
      departmentId: testDeptId,
      category: 'Information Security',
      difficulty: 'ADVANCED',
      topics: ['Micro-segmentation', 'Continuous Authorization', 'Incident Escalation'],
    }),
  });
  assert(subjRes.status === 201, 'Subject created');
  const subjData = await subjRes.json();
  const testSubjectId = subjData.subject.id;

  // 8. Test AI Question Generator
  console.log('\n--- 8. Testing AI Question Generator Engine ---');
  const aiGenRes = await fetch(`${BASE_URL}/api/ai/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      subject: 'Zero Trust Cloud Architecture & Compliance',
      topic: 'Micro-segmentation',
      difficulty: 'HARD',
      count: 4,
      type: 'MCQ',
      marks: 2,
    }),
  });
  assert(aiGenRes.status === 200, 'AI Question generator returned 200');
  const aiGenData = await aiGenRes.json();
  assert(aiGenData.questions.length === 4, 'AI synthesized exactly 4 draft questions');

  // 9. Batch Save AI Questions to Question Bank
  console.log('\n--- 9. Approving & Saving AI Questions into Question Bank ---');
  const batchSaveRes = await fetch(`${BASE_URL}/api/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      batchQuestions: aiGenData.questions.map((q) => ({
        ...q,
        subjectId: testSubjectId,
      })),
    }),
  });
  assert(batchSaveRes.status === 201, 'Approved AI questions imported into Question Bank');

  // 10. Fetch Questions to build Exam
  const qListRes = await fetch(`${BASE_URL}/api/questions?subjectId=${testSubjectId}`, {
    headers: { 'Authorization': `Bearer ${apexAdminToken}` },
  });
  const qListData = await qListRes.json();
  const createdQuestionIds = qListData.questions.map((q) => q.id);
  assert(createdQuestionIds.length >= 4, 'Question Bank populated');

  // 11. Test Exam Builder
  console.log('\n--- 11. Testing Exam Builder with Anti-Cheating & Certification Eligibility ---');
  const examCreateRes = await fetch(`${BASE_URL}/api/exams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      title: 'Zero Trust Certified Cloud Security Specialist (2026)',
      code: 'EXAM-ZT-2026-01',
      subjectId: testSubjectId,
      description: 'Official corporate certification testing Zero Trust least-privilege architecture.',
      examType: 'CERTIFICATION',
      durationMinutes: 30,
      passScorePercent: 70,
      selectedQuestionIds: createdQuestionIds,
      fullScreenRequired: true,
      tabSwitchDetect: true,
      copyPasteRestrict: true,
      isCertEligible: true,
    }),
  });
  assert(examCreateRes.status === 201, 'Exam builder created certified exam');
  const examData = await examCreateRes.json();
  const testExamId = examData.exam.id;

  // 12. Test Exam Assignment
  console.log('\n--- 12. Testing Exam Assignment with Automated Notifications ---');
  const assignRes = await fetch(`${BASE_URL}/api/exams/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apexAdminToken}`,
    },
    body: JSON.stringify({
      examId: testExamId,
      targetType: 'INDIVIDUAL',
      employeeProfileIds: [empData.employee.id],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  });
  assert(assignRes.status === 200, 'Exam assigned to employee');

  // 13. Login as Employee Marcus Vance
  console.log('\n--- 13. Testing Employee Login & Assigned Exams View ---');
  const empLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'marcus.vance@apexfinance.com', password: 'Employee123!' }),
  });
  assert(empLoginRes.status === 200, 'Employee Marcus Vance logged in');
  const empSession = await empLoginRes.json();
  const empToken = empSession.token;

  // 14. Start Live Exam Attempt
  console.log('\n--- 14. Testing Secure Exam Start (Answer Key Shielding) ---');
  const startExamRes = await fetch(`${BASE_URL}/api/exam-session/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`,
    },
    body: JSON.stringify({ examId: testExamId }),
  });
  assert(startExamRes.status === 200, 'Live exam session started');
  const sessionData = await startExamRes.json();
  const testAttemptId = sessionData.attemptId;
  assert(sessionData.exam.questions.length >= 4, 'Exam questions delivered to student');
  assert(sessionData.exam.questions[0].options[0].isCorrect === undefined, 'Answer keys properly shielded from student');

  // 15. Autosave Answers
  console.log('\n--- 15. Testing Real-time Answer Autosave ---');
  const firstQ = sessionData.exam.questions[0];
  const firstOpt = firstQ.options[0];
  const saveAnsRes = await fetch(`${BASE_URL}/api/exam-session/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`,
    },
    body: JSON.stringify({
      attemptId: testAttemptId,
      questionId: firstQ.id,
      selectedOptionIds: [firstOpt.id],
      isFlaggedForReview: true,
    }),
  });
  assert(saveAnsRes.status === 200, 'Candidate answer autosaved to database');

  // Answer the remaining questions as well
  for (let i = 1; i < sessionData.exam.questions.length; i++) {
    const q = sessionData.exam.questions[i];
    await fetch(`${BASE_URL}/api/exam-session/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        attemptId: testAttemptId,
        questionId: q.id,
        selectedOptionIds: [q.options[0].id],
      }),
    });
  }

  // 16. Log Anti-Cheat Incident
  console.log('\n--- 16. Testing Anti-Cheating Telemetry Logging ---');
  const incidentRes = await fetch(`${BASE_URL}/api/exam-session/incident`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`,
    },
    body: JSON.stringify({
      attemptId: testAttemptId,
      incidentType: 'TAB_SWITCH',
      details: 'Candidate switched window focus during timed exam.',
    }),
  });
  assert(incidentRes.status === 200, 'Anti-cheat telemetry incident logged');

  // 17. Submit Exam
  console.log('\n--- 17. Testing Automated Grading & Instant Submission ---');
  const submitRes = await fetch(`${BASE_URL}/api/exam-session/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`,
    },
    body: JSON.stringify({ attemptId: testAttemptId }),
  });
  assert(submitRes.status === 200, 'Exam submitted and graded');
  const submitData = await submitRes.json();
  const testResultId = submitData.resultId;
  assert(testResultId !== undefined, 'Result ID generated');
  console.log(`Candidate Score: ${submitData.percentage.toFixed(1)}% | Passed: ${submitData.isPassed}`);

  // 18. Verify Result Record & Topic Diagnostics
  console.log('\n--- 18. Testing Detailed Result Breakdown & AI Diagnostics ---');
  const resultRes = await fetch(`${BASE_URL}/api/results/${testResultId}`, {
    headers: { 'Authorization': `Bearer ${empToken}` },
  });
  assert(resultRes.status === 200, 'Result retrieved');
  const resultData = await resultRes.json();
  assert(resultData.result.totalScore !== undefined, 'Score verified');
  assert(resultData.result.aiAnalysis !== null, 'AI Performance Analysis generated for result');

  // 19. Verify Certificate & Public QR Verification
  console.log('\n--- 19. Testing Public Certificate QR Verification API ---');
  const publicVerifyRes = await fetch(`${BASE_URL}/api/certificates/verify/CERT-APEX-2026-00042`);
  assert(publicVerifyRes.status === 200, 'Public certificate verification endpoint returned 200');
  const publicVerifyData = await publicVerifyRes.json();
  assert(publicVerifyData.found === true, 'Public certificate verified as authentic');
  assert(publicVerifyData.certificate.status === 'VALID', 'Certificate status is VALID');
  assert(publicVerifyData.certificate.recipientName === 'Ahmed Khan', 'Certified candidate name verified');

  // 20. Verify Executive Reports & Analytics
  console.log('\n--- 20. Testing Executive Analytics & Department Reports ---');
  const reportRes = await fetch(`${BASE_URL}/api/reports`, {
    headers: { 'Authorization': `Bearer ${apexAdminToken}` },
  });
  assert(reportRes.status === 200, 'Executive report returned 200');
  const reportData = await reportRes.json();
  assert(reportData.departmentStats.length > 0, 'Department competency statistics generated');

  // 21. Verify Security Audit Logs
  console.log('\n--- 21. Testing Security Audit Logs ---');
  const auditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
    headers: { 'Authorization': `Bearer ${apexAdminToken}` },
  });
  assert(auditRes.status === 200, 'Audit logs retrieved');
  const auditData = await auditRes.json();
  assert(auditData.logs.length > 0, 'Audit log events recorded');

  console.log(`\n======================================================`);
  console.log(`🎉 ALL ${passedCount}/${totalTests} ENTERPRISE TEST CASES PASSED PERFECTLY!`);
  console.log(`======================================================\n`);
}

runTests().catch((e) => {
  console.error('\n❌ Test Suite Aborted with Error:', e);
  process.exit(1);
});
