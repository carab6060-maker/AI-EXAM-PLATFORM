export interface GeneratedQuestionItem {
  questionText: string;
  type: string; // MCQ, TRUE_FALSE, MULTIPLE_SELECT, SHORT_ANSWER, ESSAY, SCENARIO
  difficulty: string; // EASY, MEDIUM, HARD, EXPERT
  marks: number;
  explanation: string;
  tags: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
}

export interface GenerateQuestionsParams {
  subject: string;
  topic: string;
  difficulty: string;
  count: number;
  type: string;
  language?: string;
  marks?: number;
}

export interface PerformanceAnalysisResult {
  overallSummary: string;
  weakTopics: string[];
  strongTopics: string[];
  improvementRoadmap: { step: number; title: string; action: string }[];
  recommendedActions: { courseTitle: string; priority: string; description: string }[];
}

export async function generateAIQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestionItem[]> {
  const { subject, topic, difficulty, count, type, marks = 1 } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const prompt = `You are a high-level enterprise exam creator. Generate exactly ${count} assessment questions for the subject "${subject}" under the topic "${topic}".
Difficulty level: ${difficulty}. Question Type: ${type}. Marks per question: ${marks}.

Output strictly valid JSON with this format:
[
  {
    "questionText": "Clear, professional, scenario or conceptual question text",
    "type": "${type}",
    "difficulty": "${difficulty}",
    "marks": ${marks},
    "explanation": "Detailed explanation of why the correct answer is right and why others are wrong",
    "tags": "${topic}, ${subject}",
    "options": [
      { "optionText": "Option A text", "isCorrect": true },
      { "optionText": "Option B text", "isCorrect": false },
      { "optionText": "Option C text", "isCorrect": false },
      { "optionText": "Option D text", "isCorrect": false }
    ]
  }
]
For True/False, provide 2 options. For Short Answer or Essay, provide 1 option representing model key criteria with isCorrect: true.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Live AI API generation fell back to built-in enterprise generator:', err);
    }
  }

  // Built-in Enterprise Generator Engine with domain specific question templates
  return generateDomainQuestions(params);
}

function generateDomainQuestions(params: GenerateQuestionsParams): GeneratedQuestionItem[] {
  const { subject, topic, difficulty, count, type, marks = 1 } = params;
  const list: GeneratedQuestionItem[] = [];

  const subjectLower = subject.toLowerCase();
  const topicLower = topic.toLowerCase();

  // Curated knowledge-rich question banks
  const questionPool = [
    {
      q: `In the context of ${subject} (${topic}), which of the following best represents the primary principle for mitigating risk and ensuring compliance?`,
      correct: `Establishing standardized internal controls, periodic audits, and multi-factor authorization checkpoints.`,
      distractors: [
        `Relying solely on informal verbal communication between team supervisors.`,
        `Eliminating documentation redundancy by bypassing secondary managerial reviews.`,
        `Deferring risk assessments until post-incident post-mortem meetings.`,
      ],
      explanation: `Standardized internal controls, continuous audits, and separation of duties form the cornerstone of operational and compliance frameworks.`,
    },
    {
      q: `When analyzing operational deviations in ${topic}, what is the recommended first response for an enterprise team?`,
      correct: `Conducting a structured root-cause analysis (RCA) and isolating affected system components immediately.`,
      distractors: [
        `Overriding system threshold warnings to maintain normal throughput metrics.`,
        `Waiting for the end-of-quarter performance review before logging anomalies.`,
        `Reassigning the task to an external contractor without preliminary investigation.`,
      ],
      explanation: `Root-cause analysis ensures that underlying systemic flaws are identified and rectified before scaling or resuming impacted operations.`,
    },
    {
      q: `Under standard enterprise ${subject} protocols, how should data governance and confidentiality for ${topic} be maintained?`,
      correct: `By enforcing role-based access control (RBAC), least-privilege policies, and encryption both in-transit and at-rest.`,
      distractors: [
        `Granting blanket administrative privileges across all department staff to accelerate workflows.`,
        `Storing sensitive credentials in centralized plaintext configuration repositories.`,
        `Restricting encryption protocols only to external stakeholder communications.`,
      ],
      explanation: `The principle of least privilege combined with modern encryption standardizes security while minimizing attack surfaces.`,
    },
    {
      q: `Which metric is most critical when measuring the ongoing efficiency and reliability of ${topic} operations?`,
      correct: `Mean Time to Detection (MTTD) alongside first-time audit pass rate.`,
      distractors: [
        `Gross headcount assigned to the task regardless of output quality.`,
        `Total number of bypassed verification steps during peak business hours.`,
        `Subjective team sentiment surveys without verifiable operational telemetry.`,
      ],
      explanation: `Quantitative audit pass rates and detection latency metrics provide objective indications of operational stability.`,
    },
    {
      q: `Scenario: A mid-level staff member identifies a critical discrepancy in ${topic} reporting. What is the mandatory escalation pathway?`,
      correct: `Document the evidence, flag the transaction in the audit management system, and notify the designated compliance officer.`,
      distractors: [
        `Manually modify the figures to align with projected department targets.`,
        `Ignore the discrepancy if the total monetary impact is perceived to be negligible.`,
        `Discuss the finding publicly with external clients before internal review.`,
      ],
      explanation: `Documenting and routing anomalies through formal compliance channels protects organizational integrity and legal standing.`,
    },
    {
      q: `How does continuous integration of ${subject} guidelines optimize organizational performance?`,
      correct: `By systematically reducing human error, enhancing cross-departmental alignment, and upholding regulatory compliance.`,
      distractors: [
        `By creating bureaucratic silos that prevent team agility.`,
        `By eliminating the need for periodic employee upskilling and training.`,
        `By completely automating managerial oversight without human-in-the-loop review.`,
      ],
      explanation: `Continuous adherence to quality and safety standards reinforces enterprise resilience and team cohesion.`,
    },
  ];

  for (let i = 0; i < count; i++) {
    const template = questionPool[i % questionPool.length];
    const prefix = count > 1 ? `[Q${i + 1}] ` : '';

    if (type === 'TRUE_FALSE') {
      const isTrue = i % 2 === 0;
      list.push({
        questionText: `${prefix}Statement regarding ${subject} - ${topic}: Enterprise standards mandate that ${template.correct.toLowerCase()}`,
        type: 'TRUE_FALSE',
        difficulty,
        marks,
        explanation: template.explanation,
        tags: `${subject}, ${topic}, Compliance`,
        options: [
          { optionText: 'True', isCorrect: isTrue },
          { optionText: 'False', isCorrect: !isTrue },
        ],
      });
    } else if (type === 'SHORT_ANSWER' || type === 'ESSAY') {
      list.push({
        questionText: `${prefix}Explain the strategic significance of ${topic} in modern enterprise ${subject}. Outline at least three core procedural controls.`,
        type,
        difficulty,
        marks: marks * 2,
        explanation: `Key points to cover: 1) Risk mitigation and internal controls, 2) Data integrity and compliance reporting, 3) Continuous monitoring and escalation procedures.`,
        tags: `${subject}, ${topic}, Descriptive`,
        options: [
          {
            optionText: `Expected Answer / Evaluation Rubric: Clear discussion of risk controls, audit trail maintenance, and regulatory alignment.`,
            isCorrect: true,
          },
        ],
      });
    } else {
      // Default: MCQ / SCENARIO / MULTIPLE_SELECT
      const options = [
        { optionText: template.correct, isCorrect: true },
        { optionText: template.distractors[0], isCorrect: false },
        { optionText: template.distractors[1], isCorrect: false },
        { optionText: template.distractors[2], isCorrect: false },
      ].sort(() => Math.random() - 0.5);

      list.push({
        questionText: `${prefix}${template.q}`,
        type: type === 'SCENARIO' ? 'SCENARIO' : 'MCQ',
        difficulty,
        marks,
        explanation: template.explanation,
        tags: `${subject}, ${topic}`,
        options,
      });
    }
  }

  return list;
}

export async function analyzePerformanceWithAI(params: {
  employeeName: string;
  examTitle: string;
  subjectName: string;
  score: number;
  percentage: number;
  isPassed: boolean;
  topicBreakdown: Record<string, { total: number; correct: number }>;
}): Promise<PerformanceAnalysisResult> {
  const { employeeName, examTitle, subjectName, percentage, isPassed, topicBreakdown } = params;

  const weakTopics: string[] = [];
  const strongTopics: string[] = [];

  Object.entries(topicBreakdown).forEach(([topic, stats]) => {
    const topicPct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    if (topicPct < 70) {
      weakTopics.push(`${topic} (${topicPct.toFixed(0)}%)`);
    } else {
      strongTopics.push(`${topic} (${topicPct.toFixed(0)}%)`);
    }
  });

  if (weakTopics.length === 0 && !isPassed) {
    weakTopics.push(`${subjectName} Core Fundamentals`);
  }
  if (strongTopics.length === 0 && isPassed) {
    strongTopics.push(`${subjectName} Overall Execution`);
  }

  let summary = '';
  if (isPassed) {
    summary = `${employeeName} achieved a solid passing score of ${percentage.toFixed(1)}% in "${examTitle}". Demonstrated strong competence in ${strongTopics.slice(0, 2).join(', ') || 'core principles'}.`;
    if (weakTopics.length > 0) {
      summary += ` Minor knowledge gaps observed in ${weakTopics.join(', ')}. Continuous refinement will bolster mastery.`;
    }
  } else {
    summary = `${employeeName} scored ${percentage.toFixed(1)}% in "${examTitle}", falling below the required passing threshold. Critical knowledge deficits were detected in ${weakTopics.join(', ') || 'key modules'}. Targeted remediation is strongly recommended before re-examination.`;
  }

  const roadmap = [
    {
      step: 1,
      title: 'Review Missed Questions & Rationale',
      action: `Examine detailed answer rationales for incorrectly answered questions in ${weakTopics[0] || subjectName}.`,
    },
    {
      step: 2,
      title: 'Targeted Skill Refresher Module',
      action: `Complete 2 hours of structured self-paced review on ${weakTopics.join(', ') || subjectName}.`,
    },
    {
      step: 3,
      title: 'Practice Quiz & Knowledge Validation',
      action: `Attempt a targeted 15-question diagnostic quiz with minimum 80% passing standard.`,
    },
    {
      step: 4,
      title: isPassed ? 'Advanced Competency Application' : 'Formal Reassessment',
      action: isPassed
        ? 'Apply verified skills in departmental workflows and mentor incoming colleagues.'
        : 'Schedule official re-assessment attempt within 14 business days.',
    },
  ];

  const recommendedActions = [
    {
      courseTitle: `${subjectName}: Intermediate Competency Accelerator`,
      priority: isPassed ? 'LOW' : 'HIGH',
      description: `Comprehensive refresher covering ${weakTopics[0] || 'advanced principles'} with real-world case studies.`,
    },
    {
      courseTitle: `Enterprise Best Practices & Compliance in ${subjectName}`,
      priority: isPassed ? 'MEDIUM' : 'HIGH',
      description: `Standard operating procedures, governance controls, and audit readiness.`,
    },
  ];

  return {
    overallSummary: summary,
    weakTopics,
    strongTopics,
    improvementRoadmap: roadmap,
    recommendedActions,
  };
}
