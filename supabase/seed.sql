-- =============================================================================
-- Upstream Seed Data: 18 AI Consulting Prompts Across 6 Categories
-- Per CONTEXT.md D-10: each prompt has 200-500 words of realistic content
-- Per CONTEXT.md D-11: varied metadata with 2026-era model names
-- NOTE: created_by is NULL — no admin user exists yet in profiles table
-- Categories: Discovery, Solution Design, Build, Enablement, Delivery, Internal Ops
-- =============================================================================

INSERT INTO prompts (
  title,
  description,
  content,
  category,
  capability_type,
  industry_tags,
  use_case_tags,
  target_model,
  complexity,
  avg_effectiveness,
  total_checkouts,
  total_ratings,
  last_tested_date,
  last_tested_model,
  status,
  created_by
) VALUES

-- =============================================================================
-- CATEGORY 1: Discovery (3 prompts)
-- =============================================================================

(
  'Stakeholder Interview Synthesis',
  'Analyze meeting transcripts and extract key themes, decisions, pain points, and action items for executive reporting.',
  E'You are an expert AI strategy consultant working with {{client_name}} in the {{industry}} sector.\n\n## Objective\nAnalyze the provided stakeholder interview transcripts and synthesize the key findings into a structured report that surfaces themes, tensions, and strategic opportunities.\n\n## Context\n- Client: {{client_name}}\n- Industry: {{industry}}\n- Engagement scope: {{project_scope}}\n- Number of interviews: {{interview_count}}\n- Interviewees: {{interviewee_titles}}\n\n## Instructions\n1. **Theme Extraction**: Identify the 3-5 most prominent themes across all interviews. For each theme, note frequency, intensity of concern, and which stakeholder groups raised it.\n2. **Pain Point Mapping**: List specific pain points mentioned by multiple stakeholders. Distinguish between operational pain (day-to-day friction) and strategic pain (longer-term concerns).\n3. **Decision Landscape**: Note any existing decisions that have been made, decisions that are actively contested, and decisions that stakeholders feel are overdue.\n4. **Alignment Gaps**: Identify where different stakeholder groups hold contradictory views or have misaligned expectations about the engagement scope or outcomes.\n5. **Quick Wins**: Surface any low-effort, high-visibility opportunities mentioned by stakeholders that could build momentum early in the engagement.\n6. **Risk Signals**: Flag any concerns that could derail the engagement — organizational resistance, unrealistic timelines, resource constraints, or political dynamics.\n\n## Output Format\nProduce a structured report with these sections:\n- **Executive Summary** (3-5 bullets, C-suite ready)\n- **Key Themes** (table with theme, frequency, stakeholder groups, implication)\n- **Pain Points** (operational vs. strategic, ranked by frequency)\n- **Alignment Gaps** (who disagrees, on what, why it matters)\n- **Quick Wins** (effort vs. impact matrix as text)\n- **Risk Signals** (risk, source, mitigation suggestion)\n- **Recommended Next Steps** (3-5 concrete actions for the engagement team)\n\n## Quality Criteria\n- Every finding must be traceable to at least one specific interview\n- Avoid editorializing — report what stakeholders said, not what you think they should have said\n- Flag your confidence level for any inference that goes beyond direct quotation\n- Keep executive summary at a reading level appropriate for a Managing Director',
  'Discovery',
  'extraction',
  ARRAY['cross-industry'],
  ARRAY['meeting-synthesis', 'stakeholder-analysis', 'executive-reporting'],
  'Claude Sonnet 4',
  'moderate',
  4.5,
  38,
  22,
  '2026-03-15',
  'Claude Sonnet 4',
  'active',
  NULL
),

(
  'Technology Landscape Assessment',
  'Map the current technology stack and identify AI automation opportunities with effort/impact scoring.',
  E'You are a senior AI technology consultant conducting a landscape assessment for {{client_name}}, a {{company_size}} organization in the {{industry}} sector.\n\n## Objective\nAnalyze the provided technology documentation, system diagrams, and stakeholder inputs to produce a comprehensive technology landscape map and identify high-value AI integration opportunities.\n\n## Context\n- Client: {{client_name}}\n- Industry: {{industry}}\n- Company size: {{company_size}}\n- Primary tech stack documentation: {{tech_doc_summary}}\n- Current AI maturity level: {{ai_maturity}} (scale: 1 = no AI, 5 = AI-native)\n\n## Instructions\n1. **System Inventory**: Catalog all systems mentioned — categorize as core (mission-critical), supporting (important but not critical), and peripheral (nice-to-have). Note the approximate age of each system.\n2. **Data Flow Mapping**: Trace how data moves between systems. Identify where data is siloed, duplicated, or manually transferred — these are often the highest-value AI opportunity areas.\n3. **AI Readiness Assessment**: For each core system, assess: (a) data availability and quality, (b) API accessibility or integration feasibility, (c) organizational readiness for AI augmentation.\n4. **Opportunity Identification**: Generate a list of 8-12 specific AI use cases. For each, provide:\n   - Use case title and one-sentence description\n   - Primary system(s) involved\n   - AI capability required (classification, generation, extraction, prediction, etc.)\n   - Estimated implementation effort (S/M/L/XL)\n   - Expected business impact (cost reduction, revenue, speed, quality)\n5. **Prioritization Matrix**: Rank opportunities using a 2x2 effort vs. impact framework. Clearly identify the top 3 "quick win" opportunities.\n6. **Risk and Dependency Analysis**: Note any technical dependencies, data privacy concerns, or compliance considerations that could affect implementation.\n\n## Output Format\n- **Landscape Summary** (paragraph overview of technology maturity)\n- **System Inventory Table** (name, category, age, AI readiness score 1-5)\n- **Data Flow Observations** (bullet list of key flows and gaps)\n- **AI Opportunity Catalog** (table with all 8-12 opportunities)\n- **Priority Matrix** (text-based 2x2 with quadrant placement)\n- **Top 3 Recommendations** (detailed description with next steps)\n\n## Quality Criteria\n- Prioritization must be based on stated business objectives, not technical elegance\n- Flag any assumptions made due to missing information\n- All effort estimates should include a brief rationale',
  'Discovery',
  'analysis',
  ARRAY['technology', 'saas', 'financial-services'],
  ARRAY['tech-assessment', 'ai-readiness', 'opportunity-identification'],
  'GPT-4o',
  'advanced',
  4.2,
  29,
  17,
  '2026-02-28',
  'GPT-4o',
  'active',
  NULL
),

(
  'Process Mining from Documentation',
  'Extract workflow patterns, decision points, and automation opportunities from SOPs and process documentation.',
  E'You are an AI process analyst working with {{client_name}} to extract structured workflow intelligence from unstructured documentation.\n\n## Objective\nAnalyze the provided process documentation (SOPs, runbooks, training guides, or informal wikis) and produce a structured process map with automation opportunity annotations.\n\n## Context\n- Client: {{client_name}}\n- Process domain: {{process_domain}} (e.g., "client onboarding", "invoice processing", "compliance reporting")\n- Documentation type: {{doc_type}}\n- Current team size handling this process: {{team_size}}\n- Approximate time per process cycle: {{cycle_time}}\n\n## Instructions\n1. **Step Extraction**: Identify every discrete action step in the documented process. Number them sequentially. Note the role responsible for each step.\n2. **Decision Point Identification**: Mark every point where a human makes a judgment call or selects between two or more paths. These are high-value AI targets.\n3. **Handoff Mapping**: Identify every point where work passes from one person, team, or system to another. Handoffs are primary sources of delay and error.\n4. **Data Input/Output Analysis**: For each step, identify what data or information is consumed and what is produced. Flag steps where data is entered manually from another source.\n5. **Automation Classification**: For each step, classify automation potential:\n   - **Full automation**: AI or RPA can handle end-to-end with high confidence\n   - **Augmentation**: AI can draft/suggest, human confirms\n   - **Human-essential**: Requires judgment, relationships, or accountability that cannot be delegated\n6. **Exception Handling**: Note how the documented process handles errors, edge cases, or exceptions. Gaps here often become production incidents.\n7. **Metrics Gaps**: Identify what the process measures (if anything) and what key metrics are conspicuously absent.\n\n## Output Format\n- **Process Overview** (one paragraph: purpose, scope, primary actors)\n- **Process Flow Table** (step #, action, responsible role, inputs, outputs, automation classification)\n- **Decision Point Log** (step #, decision type, criteria used, AI potential)\n- **Handoff Risk Register** (step #, from, to, typical delay, failure mode)\n- **Automation Opportunity Summary** (count by category, top 3 highest-value opportunities)\n- **Recommended Metrics** (what to measure to know if the process is healthy)\n\n## Quality Criteria\n- Do not invent steps not present in the documentation — flag gaps explicitly\n- Automation classifications must be justified with a one-sentence rationale\n- Output should be usable as input to a process redesign workshop',
  'Discovery',
  'extraction',
  ARRAY['cross-industry', 'financial-services', 'healthcare'],
  ARRAY['process-analysis', 'automation-assessment', 'workflow-mapping'],
  'Claude Sonnet 4',
  'moderate',
  4.0,
  21,
  13,
  '2026-03-01',
  'Claude Sonnet 4',
  'active',
  NULL
),

-- =============================================================================
-- CATEGORY 2: Solution Design (3 prompts)
-- =============================================================================

(
  'AI Use Case Prioritization Matrix',
  'Score and rank candidate AI use cases across value, feasibility, and strategic alignment dimensions.',
  E'You are a senior AI strategy consultant helping {{client_name}} prioritize a portfolio of AI use cases for their {{year}} implementation roadmap.\n\n## Objective\nEvaluate the provided list of AI use case candidates and produce a scored, ranked prioritization matrix with a recommended phased implementation roadmap.\n\n## Context\n- Client: {{client_name}}\n- Industry: {{industry}}\n- Available AI budget: {{budget_range}}\n- Implementation team capacity: {{team_capacity}}\n- Strategic priorities this year: {{strategic_priorities}}\n- Constraints: {{constraints}}\n\n## Scoring Framework\nEvaluate each use case on 5 dimensions (score 1-5 each):\n\n**Value Dimensions:**\n1. **Business Impact** — Revenue increase, cost reduction, or risk mitigation potential. 5 = transformative, 1 = marginal.\n2. **Strategic Alignment** — Fit with stated strategic priorities. 5 = directly addresses a priority, 1 = tangential.\n\n**Feasibility Dimensions:**\n3. **Data Readiness** — Quality and availability of data required. 5 = clean data available today, 1 = significant data work required.\n4. **Technical Complexity** — How hard is the AI implementation? 5 = simple API call or RAG, 1 = novel model development required.\n5. **Change Readiness** — Organizational capacity to adopt. 5 = team is eager and capable, 1 = significant training or resistance expected.\n\n## Instructions\n1. Score each use case on all 5 dimensions with brief justification for each score.\n2. Calculate a **Value Score** (Impact + Alignment) and **Feasibility Score** (Data + Technical + Change).\n3. Place each use case in a 2x2 matrix: Value (y-axis) vs. Feasibility (x-axis).\n4. Assign each use case to a phase: Phase 1 (Quick Wins), Phase 2 (Strategic Bets), Phase 3 (Future State), or Deprioritized.\n5. Write a recommendation narrative (2-3 paragraphs) explaining the top 3 use cases and the rationale for your phasing.\n\n## Output Format\n- **Scoring Table** (use case, all 5 dimension scores, Value Score, Feasibility Score, quadrant)\n- **Prioritization Matrix** (text-based 2x2 with use cases placed in quadrants)\n- **Phased Roadmap** (Phase 1-3 use cases with target quarter and key dependency)\n- **Recommendation Narrative** (top 3 use cases, rationale, critical success factors)\n\n## Quality Criteria\n- Each score must have a 1-sentence justification\n- Phase 1 should not exceed team capacity — respect the {{team_capacity}} constraint\n- Flag any use cases with ethical or compliance concerns that need legal review',
  'Solution Design',
  'analysis',
  ARRAY['cross-industry'],
  ARRAY['use-case-prioritization', 'roadmap-planning', 'portfolio-management'],
  'model-agnostic',
  'moderate',
  4.7,
  45,
  28,
  '2026-03-10',
  'Claude Sonnet 4',
  'active',
  NULL
),

(
  'Build vs Buy Analysis',
  'Evaluate custom AI solution development against vendor product options with total cost of ownership modeling.',
  E'You are an AI solutions architect advising {{client_name}} on whether to build a custom AI solution or purchase/license an existing vendor product for their {{use_case}} initiative.\n\n## Objective\nConduct a structured Build vs. Buy analysis that accounts for total cost of ownership, strategic fit, technical risk, and organizational capability.\n\n## Context\n- Client: {{client_name}}\n- Use case: {{use_case}}\n- Industry: {{industry}}\n- Internal engineering capacity: {{engineering_capacity}}\n- Time to value requirement: {{time_requirement}}\n- Identified vendor options: {{vendor_list}}\n- Internal data sensitivity: {{data_sensitivity}} (low/medium/high)\n\n## Analysis Framework\n\n### BUILD Option Analysis\n1. **Development Cost Estimate**: Engineer-months × loaded cost. Include design, development, testing, deployment, and documentation phases.\n2. **Maintenance Burden**: Annual cost of ongoing model monitoring, retraining, infrastructure, and engineering support.\n3. **Time to Value**: Realistic timeline from start to production-ready deployment.\n4. **Competitive Differentiation**: Will this solution be a defensible competitive advantage, or is it undifferentiated infrastructure?\n5. **Data Control**: Assess the value of keeping proprietary data fully internal.\n\n### BUY Option Analysis (for each vendor)\n1. **Total Cost of Ownership**: License fees, implementation costs, integration work, training, and support over 3 years.\n2. **Feature Fit Score**: How well does the vendor solution address the core use case requirements? (Percentage, with gaps listed)\n3. **Integration Complexity**: Effort required to connect vendor solution to existing systems.\n4. **Vendor Risk**: Assess vendor stability, contract terms, lock-in risk, and support quality.\n5. **Time to Value**: Realistic time from contract to productive deployment.\n\n## Instructions\n1. Complete the Build analysis section\n2. Complete the Buy analysis for each vendor in {{vendor_list}}\n3. Create a comparative summary table\n4. Identify the top recommendation with explicit reasoning\n5. Note any conditions that would change your recommendation\n\n## Output Format\n- **Requirement Summary** (5 bullet points defining what success looks like)\n- **Build Analysis** (structured per framework above)\n- **Buy Analysis** (one section per vendor, structured per framework above)\n- **Comparison Matrix** (table: criterion, build score, vendor A score, vendor B score)\n- **Recommendation** (choice + rationale + conditions that would change it)\n- **Next Steps** (3-5 concrete actions to advance the decision)\n\n## Quality Criteria\n- Cost estimates must include a range (optimistic/realistic/pessimistic) not a point estimate\n- Feature fit scores must reference specific requirements, not be arbitrary\n- Recommendation must acknowledge the strongest counter-argument',
  'Solution Design',
  'analysis',
  ARRAY['technology', 'financial-services', 'healthcare'],
  ARRAY['vendor-evaluation', 'build-vs-buy', 'cost-modeling'],
  'GPT-4o',
  'advanced',
  4.3,
  19,
  12,
  '2026-02-15',
  'GPT-4o',
  'active',
  NULL
),

(
  'Change Impact Assessment',
  'Assess organizational readiness and resistance to AI adoption, and produce a change management plan.',
  E'You are an organizational change consultant specializing in AI adoption at {{client_name}}, a {{company_size}} organization in {{industry}}.\n\n## Objective\nAssess the organizational readiness for the proposed AI initiative and produce a structured change impact assessment with a stakeholder engagement plan.\n\n## Context\n- Client: {{client_name}}\n- AI initiative: {{initiative_name}}\n- Impacted departments: {{impacted_departments}}\n- Impacted roles: {{impacted_roles}}\n- Timeline for rollout: {{rollout_timeline}}\n- Executive sponsor: {{executive_sponsor}}\n\n## Assessment Framework\n\n### 1. Impact Dimensions\nFor each impacted role/department, assess impact across:\n- **Process Change**: How significantly do day-to-day workflows change? (1-5)\n- **Skill Gap**: How much new learning is required? (1-5)\n- **Job Security Perception**: How likely are employees to perceive a threat to their role? (1-5)\n- **Volume of Change**: How many people are affected? (absolute count)\n\n### 2. Readiness Factors\n- **Leadership Alignment**: Are all relevant leaders visibly supportive? (Yes/Partial/No)\n- **Historical Change Success**: How successfully has this organization managed major changes in the past? (Strong/Mixed/Weak)\n- **Communication Infrastructure**: Does the organization have effective channels for change communication? (Yes/No)\n- **Available Training Capacity**: Can the organization deliver the training needed within the timeline? (Yes/No)\n\n### 3. Resistance Risk Assessment\nIdentify likely sources of resistance and classify each as:\n- **Rational resistance** (legitimate concern that needs to be addressed)\n- **Fear-based resistance** (concern rooted in uncertainty, addressable through communication)\n- **Political resistance** (stakeholder protecting their position or budget)\n\n## Instructions\n1. Complete all three assessment framework sections\n2. Calculate an overall Change Complexity Score (low/medium/high/critical)\n3. Design a 4-phase stakeholder engagement plan (Awareness, Understanding, Acceptance, Commitment)\n4. Identify the top 3 change risks and mitigation strategies\n5. Recommend a communication plan cadence\n\n## Output Format\n- **Impact Heat Map** (table: role, process change, skill gap, job security perception, volume)\n- **Readiness Dashboard** (table: readiness factor, current status, gap, action required)\n- **Resistance Risk Register** (stakeholder group, resistance type, intensity, mitigation)\n- **Stakeholder Engagement Plan** (phase, activities, timeline, owner)\n- **Change Complexity Score** (rating with justification)\n- **Top 3 Change Risks** (risk, likelihood, impact, mitigation)\n\n## Quality Criteria\n- Distinguish clearly between change risks that threaten project success vs. those that reduce adoption quality\n- Mitigation strategies must be specific — avoid generic advice like "communicate more"\n- Flag if the {{rollout_timeline}} is unrealistic given the complexity score',
  'Solution Design',
  'analysis',
  ARRAY['cross-industry', 'healthcare'],
  ARRAY['change-management', 'organizational-readiness', 'stakeholder-engagement'],
  'Claude Sonnet 4',
  'moderate',
  3.9,
  14,
  9,
  '2026-01-20',
  'Claude Sonnet 4',
  'active',
  NULL
),

-- =============================================================================
-- CATEGORY 3: Build (3 prompts)
-- =============================================================================

(
  'Prompt Engineering Review',
  'Evaluate existing AI prompts against quality criteria and produce improved versions with rationale.',
  E'You are a senior prompt engineer conducting a quality review of AI prompts used by {{client_name}} for {{use_case}}.\n\n## Objective\nEvaluate the provided prompt(s) against established quality criteria, identify specific weaknesses, and produce improved versions with clear explanations of each change.\n\n## Context\n- Client: {{client_name}}\n- Target model: {{target_model}}\n- Use case: {{use_case}}\n- Current performance issues: {{performance_issues}} (if known)\n- Success criteria: {{success_criteria}}\n\n## Evaluation Dimensions\nScore each dimension 1-5:\n\n1. **Clarity of Objective**: Is the task unambiguously defined? Does the model know exactly what "done" looks like?\n2. **Context Completeness**: Does the prompt provide all context the model needs to succeed? Are there implicit assumptions the model might not share?\n3. **Output Specification**: Is the desired output format, length, and structure explicitly defined?\n4. **Constraint Clarity**: Are there explicit constraints on what the model should NOT do?\n5. **Failure Mode Coverage**: Does the prompt handle edge cases and instruct the model on how to handle uncertainty?\n6. **Token Efficiency**: Is the prompt achieving its goal without unnecessary verbosity that adds cost and latency?\n7. **Model Alignment**: Is the prompt written for the capabilities and limitations of {{target_model}} specifically?\n\n## Instructions\n1. Score the original prompt on all 7 dimensions with specific evidence from the prompt text.\n2. Identify the 3 highest-priority improvements (lowest scores or highest impact).\n3. Write an improved version of the prompt.\n4. Annotate the improved prompt with inline comments explaining each change (use [CHANGE: reason] notation).\n5. Write 3 test cases the improved prompt should handle correctly — include the input and expected output characteristics.\n\n## Output Format\n- **Original Prompt** (quoted verbatim)\n- **Quality Scorecard** (table: dimension, score, evidence, improvement priority)\n- **Improvement Summary** (3 highest-priority improvements with rationale)\n- **Improved Prompt** (full text with inline annotations)\n- **Test Cases** (3 cases: input scenario, expected output characteristics, pass/fail criteria)\n\n## Quality Criteria\n- Score justifications must reference specific text from the original prompt\n- Improved prompt must not change the core intent — only improve execution\n- Test cases must be executable — they should be usable to actually test the prompt',
  'Build',
  'analysis',
  ARRAY['technology', 'cross-industry'],
  ARRAY['prompt-engineering', 'quality-review', 'model-optimization'],
  'model-agnostic',
  'advanced',
  4.6,
  33,
  21,
  '2026-03-18',
  'Claude Sonnet 4',
  'active',
  NULL
),

(
  'Test Case Generation',
  'Create comprehensive test scenarios for AI outputs covering happy paths, edge cases, and failure modes.',
  E'You are a QA engineer specializing in AI system testing, generating test cases for {{client_name}}''s {{system_name}} AI feature.\n\n## Objective\nGenerate a comprehensive test case suite for the described AI feature, covering functional correctness, edge cases, failure modes, and safety considerations.\n\n## Context\n- Client: {{client_name}}\n- System/feature: {{system_name}}\n- AI model used: {{ai_model}}\n- Input types: {{input_types}}\n- Expected output: {{expected_output}}\n- Known edge cases (if any): {{known_edge_cases}}\n- Performance requirements: {{performance_requirements}}\n\n## Test Case Categories\n\n### Category 1: Happy Path Tests\nTests that verify the system works correctly under normal, expected conditions.\n- Standard inputs that represent 80% of real-world usage\n- Representative samples from each input segment\n\n### Category 2: Boundary Tests\nTests at the edges of defined input ranges.\n- Maximum and minimum input lengths\n- Inputs with special characters, Unicode, mixed languages\n- Inputs that are technically valid but unusual\n\n### Category 3: Adversarial Tests\nTests designed to break the system or elicit undesired behavior.\n- Prompt injection attempts\n- Jailbreak patterns relevant to this use case\n- Inputs designed to produce incorrect but confident-sounding outputs\n\n### Category 4: Regression Tests\nTests for known failure modes from {{known_edge_cases}} or similar systems.\n\n### Category 5: Performance Tests\nTests that assess latency, throughput, and degradation under load.\n\n## Instructions\n1. Generate 5 test cases for each category (25 total)\n2. For each test case provide: ID, category, description, input, expected output, pass/fail criteria, priority (P1/P2/P3)\n3. Identify the 5 highest-priority test cases across all categories and explain why\n4. Write a test execution checklist for a human reviewer\n\n## Output Format\n- **Test Case Table** (25 rows: ID, category, description, input, expected output, priority)\n- **Top 5 Critical Tests** (detailed writeup of highest-priority cases)\n- **Test Execution Checklist** (step-by-step instructions for running and evaluating the test suite)\n- **Coverage Analysis** (which input scenarios are NOT covered and why)\n\n## Quality Criteria\n- Every test case must have unambiguous pass/fail criteria\n- Adversarial tests must be specific to this use case, not generic\n- Coverage analysis must be honest about gaps',
  'Build',
  'generation',
  ARRAY['technology', 'saas'],
  ARRAY['qa-testing', 'test-generation', 'ai-quality'],
  'GPT-4o',
  'moderate',
  4.1,
  18,
  11,
  '2026-02-10',
  'GPT-4o',
  'active',
  NULL
),

(
  'API Integration Specification',
  'Define the integration contract between an AI service and client systems, including error handling and fallback behavior.',
  E'You are a technical architect designing the integration specification between an AI service and {{client_name}}''s existing systems for the {{use_case}} project.\n\n## Objective\nProduce a complete API integration specification document that can be handed to development teams for implementation without further clarification.\n\n## Context\n- Client: {{client_name}}\n- AI service: {{ai_service_name}} (e.g., OpenAI API, Claude API, internal model)\n- Client system(s) to integrate: {{client_systems}}\n- Use case: {{use_case}}\n- Expected request volume: {{request_volume}} per day\n- Latency requirement: {{latency_requirement}}\n- Data sensitivity: {{data_sensitivity}}\n\n## Specification Sections\n\n### 1. Integration Architecture\nDescribe the integration pattern: synchronous API call, async queue, webhook, streaming, or batch processing. Justify the choice.\n\n### 2. Request Specification\n- Endpoint(s) and HTTP methods\n- Authentication method (API key, OAuth, JWT)\n- Request body schema with all fields, types, and constraints\n- Required vs. optional parameters\n- Request size limits\n\n### 3. Response Specification\n- Response body schema\n- Success response codes and body structure\n- Partial success handling (if applicable)\n- Response caching strategy (if applicable)\n\n### 4. Error Handling Matrix\nFor each error type, specify: error code, description, client action, retry strategy.\nError types to cover: rate limiting, authentication failures, malformed requests, model errors, timeouts, service unavailability.\n\n### 5. Fallback Behavior\nDefine what the client system should do when the AI service is unavailable or returns an error:\n- Immediate fallback (cached response, rule-based fallback, human queue)\n- Graceful degradation strategy\n- Circuit breaker configuration\n\n### 6. Data Privacy and Security\n- PII handling requirements\n- Data retention policies for request/response logs\n- Encryption requirements in transit and at rest\n\n### 7. Monitoring and Observability\n- Required metrics (latency p50/p95/p99, error rate, token usage)\n- Alert thresholds\n- Logging requirements\n\n## Output Format\nProduce a complete specification document following the 7 sections above. Include:\n- A one-page integration summary at the top\n- Code examples (pseudocode or real) for key integration patterns\n- A checklist for implementation sign-off\n\n## Quality Criteria\n- Every error type must have an explicit client action — "handle appropriately" is not acceptable\n- Latency requirements must be realistic given {{ai_service_name}}''s typical response times\n- Security section must specifically address {{data_sensitivity}} data requirements',
  'Build',
  'generation',
  ARRAY['technology', 'financial-services'],
  ARRAY['api-integration', 'technical-specification', 'architecture'],
  'model-agnostic',
  'moderate',
  3.8,
  12,
  7,
  '2026-01-15',
  'Claude Sonnet 4',
  'active',
  NULL
),

-- =============================================================================
-- CATEGORY 4: Enablement (3 prompts)
-- =============================================================================

(
  'Training Workshop Agenda Builder',
  'Design AI training sessions for client teams, with exercises, timings, and facilitator notes.',
  E'You are a learning experience designer creating an AI training program for {{client_name}}''s {{target_audience}} team.\n\n## Objective\nDesign a comprehensive, interactive training workshop that builds practical AI fluency and confidence for the specified audience, grounded in their actual work context.\n\n## Context\n- Client: {{client_name}}\n- Target audience: {{target_audience}}\n- Current AI familiarity: {{ai_familiarity}} (none/basic/intermediate)\n- Workshop duration: {{workshop_duration}}\n- Format: {{workshop_format}} (in-person/virtual/hybrid)\n- Tools they will use: {{ai_tools}}\n- Primary use cases to train on: {{use_cases_to_train}}\n\n## Design Principles\n1. **70/30 rule**: 70% of time should be hands-on exercises, 30% concepts/theory\n2. **Contextual examples**: All examples must use real scenarios from {{target_audience}}''s actual work\n3. **Failure-safe**: Include exercises where AI gives wrong/hallucinated answers — teach them to verify\n4. **Confidence arc**: Structure sessions to move from simple to complex, building momentum\n\n## Instructions\n1. Design a full workshop agenda with timed sections\n2. For each section, provide: title, duration, objective, facilitator notes, and materials needed\n3. Create 3 hands-on exercises specific to {{use_cases_to_train}}\n4. Design an opening "AI Myth vs. Reality" segment that addresses the most common fears for {{target_audience}}\n5. Create a pre-workshop assessment (5 questions) to gauge current knowledge\n6. Create a post-workshop assessment (5 questions) to measure learning\n7. Write a facilitator guide section on handling common objections\n\n## Output Format\n- **Workshop Overview** (title, audience, duration, objectives, prerequisites)\n- **Detailed Agenda** (table: time, section, duration, objective, notes)\n- **Exercise Specifications** (3 exercises, each with: title, context, instructions, expected outcome, debrief questions)\n- **Assessment Questions** (pre and post, with answer keys)\n- **Facilitator Guide** (objection handling, common questions, technical contingencies)\n\n## Quality Criteria\n- Every exercise must be completable within its allotted time by someone with {{ai_familiarity}} level skills\n- Facilitator notes must include what to do if the AI gives an unexpected response during live demos\n- Post-workshop assessment must test skills, not just recall of facts',
  'Enablement',
  'generation',
  ARRAY['cross-industry'],
  ARRAY['training-design', 'ai-adoption', 'workshop-facilitation'],
  'Claude Sonnet 4',
  'moderate',
  4.4,
  27,
  16,
  '2026-03-05',
  'Claude Sonnet 4',
  'active',
  NULL
),

(
  'Adoption Playbook Generator',
  'Create a step-by-step AI rollout plan with milestones, owner assignments, and success metrics.',
  E'You are an AI adoption specialist creating a rollout playbook for {{client_name}}''s {{initiative_name}} initiative.\n\n## Objective\nProduce a comprehensive adoption playbook that guides {{client_name}}''s internal team through successful AI rollout from pilot to full deployment.\n\n## Context\n- Client: {{client_name}}\n- Initiative: {{initiative_name}}\n- AI tool/system being deployed: {{ai_tool}}\n- Target user group: {{user_group}} (count: {{user_count}})\n- Rollout timeline: {{rollout_timeline}}\n- Executive sponsor: {{executive_sponsor}}\n- Change management resources available: {{change_resources}}\n\n## Playbook Structure\n\n### Phase 1: Foundation (Weeks 1-4)\n- Stakeholder alignment and governance setup\n- Pilot group selection criteria and recruitment\n- Technical readiness verification\n- Baseline metrics capture\n\n### Phase 2: Pilot (Weeks 5-12)\n- Pilot launch and early adopter onboarding\n- Feedback loops and rapid iteration\n- Success metrics tracking\n- Issue escalation process\n\n### Phase 3: Scaled Rollout (Weeks 13-24)\n- Wave-based deployment strategy\n- Training program delivery\n- Manager enablement\n- Communication cadence\n\n### Phase 4: Sustain and Optimize (Ongoing)\n- Adoption measurement and reporting\n- Power user community\n- Continuous improvement process\n- ROI reporting\n\n## Instructions\n1. Customize the 4-phase structure for {{client_name}}''s specific context\n2. For each phase, define: milestones, activities, owners, success criteria, and risks\n3. Create a RACI matrix for key rollout activities\n4. Design a metrics dashboard (what to measure and how frequently)\n5. Write a communication plan with sample messages for each phase\n6. Create a "Go/No-Go" checklist for Phase 2 to Phase 3 transition\n\n## Output Format\n- **Playbook Summary** (1-page executive overview)\n- **Phase-by-Phase Plan** (for each of 4 phases: milestones table, activity details, risks)\n- **RACI Matrix** (activity, responsible, accountable, consulted, informed)\n- **Metrics Dashboard** (metric, definition, target, measurement method, frequency)\n- **Communication Plan** (phase, audience, message, channel, frequency, owner)\n- **Phase 2→3 Go/No-Go Checklist** (criteria, current status, owner)\n\n## Quality Criteria\n- All milestones must be specific and measurable\n- RACI matrix must not have multiple "Accountable" owners for any single activity\n- Metrics must be measurable with tools {{client_name}} actually has access to',
  'Enablement',
  'generation',
  ARRAY['cross-industry', 'technology'],
  ARRAY['adoption-planning', 'change-management', 'rollout-strategy'],
  'GPT-4o',
  'advanced',
  3.6,
  9,
  5,
  '2026-01-30',
  'GPT-4o',
  'active',
  NULL
),

(
  'Quick Reference Card Creator',
  'Generate concise, role-specific cheat sheets for AI tool usage with common prompts and tips.',
  E'You are a technical writer creating quick reference materials for {{client_name}}''s {{target_role}} team on using {{ai_tool}}.\n\n## Objective\nCreate a single-page quick reference card that {{target_role}} professionals can use daily without needing to refer to longer documentation.\n\n## Context\n- Client: {{client_name}}\n- Target role: {{target_role}}\n- AI tool: {{ai_tool}}\n- Primary use cases for this role: {{primary_use_cases}}\n- User AI familiarity: {{ai_familiarity}}\n- Desired format: {{output_format}} (print-ready PDF layout description OR markdown)\n\n## Content Requirements\n\n### Section 1: Getting Started (5 essentials)\nThe 5 most important things to know before your first prompt. Keep each tip to one sentence.\n\n### Section 2: Prompt Templates (4-6 templates)\nReady-to-use prompt templates for the most common {{target_role}} tasks. Each template should:\n- Have a descriptive title\n- Include the full prompt text with {{placeholders}} clearly marked\n- Include a brief note on when to use it\n- Include one example of a filled-in version\n\n### Section 3: Do''s and Don''ts (3 each)\nBrief, specific guidance on common mistakes and best practices for {{target_role}} work.\n\n### Section 4: When to Use AI vs. When Not To\nClear guidance on 3 scenarios where AI adds value and 3 scenarios where human judgment is essential. Specific to {{target_role}} work.\n\n### Section 5: Getting Better Results (3 tips)\nAdvanced tips for users who want to level up their prompting skills.\n\n## Instructions\n1. Write all 5 sections as described above\n2. Keep language at a reading level appropriate for busy professionals\n3. Use bullet points and tables rather than paragraphs wherever possible\n4. Include at least 4 complete, ready-to-use prompt templates\n5. Make the "When Not To" section honest and specific — not generic safety theater\n\n## Output Format\n- Full reference card content structured by the 5 sections above\n- Note any sections where you made assumptions about {{target_role}} work patterns\n\n## Quality Criteria\n- Every prompt template must be immediately usable without modification for its stated purpose\n- Do''s and Don''ts must be specific to {{ai_tool}} and {{target_role}}, not generic AI advice\n- The card must fit on one printed page (approximately 800-1000 words total)',
  'Enablement',
  'generation',
  ARRAY['cross-industry'],
  ARRAY['training-materials', 'quick-reference', 'enablement'],
  'Gemini 2.0 Flash',
  'simple',
  4.8,
  41,
  25,
  '2026-03-20',
  'Gemini 2.0 Flash',
  'active',
  NULL
),

-- =============================================================================
-- CATEGORY 5: Delivery (3 prompts)
-- =============================================================================

(
  'Executive Summary Generator',
  'Create C-suite ready project summaries from raw status updates, meeting notes, and deliverable drafts.',
  E'You are a senior consultant preparing executive communications for {{client_name}}''s {{project_name}} AI initiative.\n\n## Objective\nTransform the provided raw project materials (status updates, meeting notes, deliverable drafts, data) into a polished executive summary suitable for a C-suite audience.\n\n## Context\n- Client: {{client_name}}\n- Project: {{project_name}}\n- Reporting period: {{reporting_period}}\n- Audience: {{audience}} (e.g., "CEO and CTO", "Board of Directors", "Steering Committee")\n- Key decisions needed this period: {{decisions_needed}}\n- Sentiment: {{current_sentiment}} (on track / at risk / in recovery)\n\n## Executive Summary Principles\n1. **Lead with status**: Executives read the first two sentences. Make them count.\n2. **Quantify everything possible**: Replace "significant progress" with specific metrics\n3. **Surface decisions, not just updates**: Every status report should tell executives what they need to decide or know\n4. **Honest about risk**: Executives distrust summaries with no red flags\n5. **One page maximum**: If it needs more, it''s a deck, not a summary\n\n## Instructions\n1. Write a one-paragraph status summary (3-5 sentences) with a clear RAG status (Red/Amber/Green) and brief justification\n2. Extract 3-5 key accomplishments from the provided materials (quantified where possible)\n3. Identify 2-3 items requiring executive attention or decision\n4. Write a risk section covering the top 2 active risks (description, likelihood, impact, mitigation)\n5. Describe the next 2-week sprint (3-5 upcoming milestones with owners and dates)\n6. If relevant, include a financial summary (budget consumed, forecast, variance)\n\n## Output Format\n- **Project Status** (RAG indicator, one-paragraph summary, reporting period)\n- **Key Accomplishments** (bulleted, quantified, 3-5 items)\n- **Executive Attention Required** (2-3 items: issue, what''s needed, deadline)\n- **Risk Register** (2 risks: description, likelihood/impact, mitigation, owner)\n- **Next 2 Weeks** (milestone, owner, due date, dependency)\n- **Financial Summary** (optional, only if data provided)\n\n## Quality Criteria\n- Every accomplishment must be specific and measurable — no vague progress statements\n- RAG status must be justified with evidence, not instinct\n- "Executive Attention Required" items must include a clear ask, not just a notification',
  'Delivery',
  'generation',
  ARRAY['cross-industry'],
  ARRAY['executive-reporting', 'status-reporting', 'stakeholder-communication'],
  'Claude Sonnet 4',
  'simple',
  4.6,
  35,
  20,
  '2026-03-12',
  'Claude Sonnet 4',
  'active',
  NULL
),

(
  'Weekly Status Report Compiler',
  'Transform raw project updates and meeting notes into structured weekly status reports with consistent formatting.',
  E'You are a project manager compiling the weekly status report for {{client_name}}''s {{project_name}} engagement.\n\n## Objective\nCompile the provided raw inputs (team updates, meeting notes, task tracker data, blockers) into a structured, consistently formatted weekly status report.\n\n## Context\n- Client: {{client_name}}\n- Project: {{project_name}}\n- Week ending: {{week_ending_date}}\n- Report audience: {{report_audience}}\n- Raw inputs provided: {{raw_inputs_description}}\n- Previous week''s status: {{previous_week_summary}}\n\n## Instructions\n1. **Week Summary**: Write a 2-3 sentence summary of the week''s overall progress. Include one sentence on the most significant accomplishment and one sentence on the most significant challenge.\n2. **Progress Against Plan**: Review provided task data and classify each active workstream as: On Track (green), At Risk (amber), or Blocked (red). For Amber/Red items, include a brief reason.\n3. **Completed This Week**: List all tasks/deliverables completed, with the responsible team member.\n4. **In Progress**: List all active tasks, with expected completion date and percent complete.\n5. **Blocked / At Risk**: For each blocker, document: what is blocked, why it''s blocked, what action is needed, who owns the action, and the resolution deadline.\n6. **Decisions Made**: List any decisions made during the week and who made them.\n7. **Next Week Plan**: List the top 5 planned activities for next week with owners and target dates.\n8. **Key Metrics**: Report on 3-5 project health metrics (on-time delivery rate, open blocker count, budget variance, etc.) if data is available.\n\n## Output Format\n- **Week Summary** (paragraph with RAG status badge)\n- **Workstream Status Table** (workstream, RAG status, notes)\n- **Completed This Week** (bulleted list with owners)\n- **In Progress** (table: task, owner, % complete, due date)\n- **Blockers and Risks** (table: issue, reason, action needed, owner, deadline)\n- **Decisions Log** (decision, made by, date)\n- **Next Week Plan** (table: activity, owner, target date)\n- **Project Metrics** (table: metric, this week, last week, trend)\n\n## Quality Criteria\n- Every Amber/Red status must have a specific reason and a named owner\n- Blockers section must distinguish between "hard blockers" (work cannot continue) and "soft risks" (work may slow)\n- Next week plan must be realistic given current blockers',
  'Delivery',
  'generation',
  ARRAY['cross-industry'],
  ARRAY['status-reporting', 'project-management', 'weekly-reporting'],
  'Gemini 2.0 Flash',
  'simple',
  3.7,
  16,
  10,
  '2026-02-20',
  'Gemini 2.0 Flash',
  'active',
  NULL
),

(
  'Risk Assessment Synthesizer',
  'Aggregate and prioritize project risks from multiple sources into an executive risk register with mitigation plans.',
  E'You are a risk analyst synthesizing project risks for {{client_name}}''s {{project_name}} initiative.\n\n## Objective\nAgggregate risk inputs from multiple sources (interview notes, technical assessments, financial models, stakeholder inputs) and produce a comprehensive, prioritized risk register with actionable mitigation plans.\n\n## Context\n- Client: {{client_name}}\n- Project: {{project_name}}\n- Project phase: {{project_phase}}\n- Risk input sources: {{risk_sources}}\n- Risk appetite: {{risk_appetite}} (conservative/moderate/aggressive)\n- Key project constraints: {{key_constraints}}\n\n## Risk Assessment Framework\n\n### Risk Dimensions\nScore each risk on two dimensions:\n1. **Likelihood** (1-5): 1 = rare (< 5% probability), 5 = near-certain (> 80% probability)\n2. **Impact** (1-5): 1 = negligible, 5 = project-ending or major client relationship damage\n\n### Risk Categories\n- **Technical Risk**: Technology, integration, performance, security\n- **Organizational Risk**: Stakeholder resistance, resource availability, skills gaps\n- **Schedule Risk**: Timeline, dependencies, external factors\n- **Financial Risk**: Budget, scope creep, vendor costs\n- **Data Risk**: Quality, availability, privacy, compliance\n- **Vendor/Third-Party Risk**: Dependencies on external parties\n\n## Instructions\n1. Catalog all risks from the provided input sources — do not filter at this stage\n2. Deduplicate risks that appear in multiple sources (note the source count as a signal of importance)\n3. Score each risk on Likelihood and Impact, compute Risk Score (L × I) and assign priority (P1 = score 15-25, P2 = score 8-14, P3 = score 1-7)\n4. For P1 and P2 risks, develop a mitigation plan: prevent (reduce likelihood), mitigate (reduce impact), transfer (insure/contract), or accept (monitor)\n5. Identify any risks that are correlated — if Risk A occurs, Risk B becomes more likely\n6. Write an executive narrative on the top 3 risks\n\n## Output Format\n- **Risk Summary Dashboard** (total risks by priority, top risk category, overall risk level)\n- **Risk Register** (table: ID, description, category, likelihood, impact, score, priority, mitigation strategy, owner, due date)\n- **P1 Risk Deep Dives** (for each P1 risk: detailed description, root causes, indicators, mitigation plan, residual risk)\n- **Risk Correlations** (any identified risk clusters)\n- **Executive Narrative** (2-3 paragraphs on top 3 risks, written for a CFO/COO audience)\n\n## Quality Criteria\n- All risk scores must be justified — "5/5 because it always happens" is not acceptable\n- Mitigation plans must be specific to this project''s context, not generic\n- Executive narrative must recommend a specific action, not just describe the problem',
  'Delivery',
  'analysis',
  ARRAY['cross-industry', 'financial-services'],
  ARRAY['risk-management', 'project-risk', 'executive-reporting'],
  'model-agnostic',
  'moderate',
  4.3,
  22,
  14,
  '2026-03-08',
  'Claude Sonnet 4',
  'active',
  NULL
),

-- =============================================================================
-- CATEGORY 6: Internal Ops (3 prompts)
-- =============================================================================

(
  'Proposal Section Drafter',
  'Draft specific sections of consulting proposals from project brief and client context inputs.',
  E'You are a senior consultant drafting sections of a consulting proposal for {{client_name}} for the {{project_name}} engagement.\n\n## Objective\nDraft the specified section(s) of a consulting proposal that are compelling, accurate, and tailored to {{client_name}}''s context. The output should require minimal editing before submission.\n\n## Context\n- Client: {{client_name}}\n- Opportunity: {{project_name}}\n- Sections to draft: {{sections_to_draft}}\n- Client''s key pain points: {{client_pain_points}}\n- Our firm''s relevant experience: {{firm_experience}}\n- Proposed approach summary: {{approach_summary}}\n- Key differentiators: {{key_differentiators}}\n- Commercial constraints (if any): {{commercial_constraints}}\n\n## Proposal Writing Principles\n1. **Client language**: Use the client''s own words and framing from {{client_pain_points}} — it signals that you listened\n2. **Problem before solution**: Lead every section by reinforcing the problem before presenting the solution\n3. **Specificity over generality**: "We will conduct 3 stakeholder workshops over 2 weeks" beats "We will engage key stakeholders"\n4. **Evidence, not assertion**: Support every capability claim with a reference to {{firm_experience}}\n5. **Executive reading level**: Proposals are read by buyers, not users — keep it strategic\n\n## Section Guidelines\n\n### Executive Summary\n3-5 paragraphs: (1) client''s situation and problem, (2) our understanding of what success looks like, (3) our proposed approach in one paragraph, (4) why us (differentiation), (5) call to action.\n\n### Understanding of Requirements\nDemonstrate that you understand the client''s problem better than they articulated it. Add observations they didn''t include. Show insight.\n\n### Proposed Approach\nPhase-by-phase description of the engagement: objective, activities, deliverables, timeline, and team for each phase.\n\n### Team and Qualifications\nBiographies adapted to this specific engagement. Highlight only relevant experience.\n\n### Investment Summary\n(Only if commercial details provided) Clear, transparent pricing with brief rationale.\n\n## Instructions\nDraft only the section(s) specified in {{sections_to_draft}}. For each section:\n1. Write the full draft\n2. Highlight in [BRACKETS] any placeholder where specific information is still needed\n3. Add a brief note at the end of each section on the strongest assumption you made\n\n## Quality Criteria\n- No section should contain generic consulting boilerplate that could apply to any client\n- Every differentiator claim must be backed by a specific experience reference\n- Call out if {{approach_summary}} seems misaligned with {{client_pain_points}}',
  'Internal Ops',
  'generation',
  ARRAY['cross-industry'],
  ARRAY['proposal-writing', 'business-development', 'sales-enablement'],
  'Claude Sonnet 4',
  'moderate',
  4.2,
  31,
  18,
  '2026-03-17',
  'Claude Sonnet 4',
  'active',
  NULL
),

(
  'Knowledge Base Article Writer',
  'Convert project learnings and post-mortems into structured knowledge base articles for institutional reuse.',
  E'You are a knowledge management specialist converting {{client_name}} project experience from {{project_name}} into a reusable knowledge base article.\n\n## Objective\nTransform raw project documentation (post-mortems, lessons learned, deliverable examples, consultant notes) into a structured knowledge base article that future consultants can use to accelerate similar engagements.\n\n## Context\n- Source engagement: {{project_name}}\n- Client industry: {{industry}}\n- Engagement type: {{engagement_type}}\n- Key challenge addressed: {{key_challenge}}\n- Outcome: {{engagement_outcome}}\n- Consultant(s) who ran this work: {{consultant_names}} (for attribution, not publication)\n\n## Article Structure\n\n### 1. Article Header\n- Title (descriptive, search-optimized)\n- One-sentence summary\n- Tags: industry, engagement type, AI capability, complexity\n- Confidence level (battle-tested / field-tested / experimental)\n\n### 2. When to Use This\n- The specific situation this applies to (3-5 bullet points)\n- Signals that this approach is right for the engagement\n- When NOT to use this (the counter-indications)\n\n### 3. The Situation\nBrief, anonymized description of the client context and challenge. Remove all identifying details.\n\n### 4. The Approach\nStep-by-step description of what was done. Write at a level of specificity that a consultant who wasn''t there could reproduce it.\n\n### 5. What Worked\n- Specific tactics that had outsized impact\n- Reasons they worked (so future consultants can adapt, not just copy)\n\n### 6. What Didn''t Work\n- Approaches that were tried and failed\n- Root cause analysis\n- What to do instead\n\n### 7. Reusable Assets\n- List any templates, frameworks, or prompts that were created during this engagement that should be added to the library\n- Brief description and link/location\n\n### 8. Client Verbatims\n(Optional) 1-3 anonymized client quotes that capture the business value.\n\n## Instructions\n1. Write a complete knowledge base article following the 8-section structure\n2. Ensure all client-identifying information is removed or generalized\n3. Write the "What Didn''t Work" section with brutal honesty — sanitized lessons learned have no value\n4. Identify 2-3 specific assets from this engagement that should be added to the prompt/template library\n\n## Output Format\nFull article following the 8-section structure. Use markdown formatting.\n\n## Quality Criteria\n- The article must be usable by a consultant who has never met the client\n- "What Didn''t Work" must be substantive — at least 2 real failures with root causes\n- Reusable assets section must be specific enough to actually locate or recreate the asset',
  'Internal Ops',
  'generation',
  ARRAY['cross-industry'],
  ARRAY['knowledge-management', 'institutional-learning', 'documentation'],
  'model-agnostic',
  'moderate',
  3.4,
  8,
  5,
  '2026-02-05',
  'GPT-4o',
  'active',
  NULL
),

(
  'Client Feedback Analyzer',
  'Extract themes, sentiment, and actionable improvements from NPS surveys and qualitative client feedback.',
  E'You are a client success analyst synthesizing feedback from {{client_name}}''s {{feedback_source}} for the {{project_name}} engagement.\n\n## Objective\nAnalyze the provided client feedback data and produce a structured analysis with actionable improvement recommendations for the engagement team.\n\n## Context\n- Client: {{client_name}}\n- Project: {{project_name}}\n- Feedback source: {{feedback_source}} (e.g., NPS survey, exit interviews, mid-engagement pulse, informal feedback)\n- Response count: {{response_count}}\n- Collection period: {{collection_period}}\n- Team size for this engagement: {{team_size}}\n\n## Analysis Framework\n\n### Quantitative Analysis (if NPS or scored data provided)\n1. **NPS Score**: Calculate promoter %, passive %, detractor %, and final NPS score\n2. **Score Distribution**: Visualize as text chart\n3. **Trend**: If prior period data available, calculate trend\n\n### Qualitative Theme Analysis\n1. **Theme Extraction**: Identify all distinct themes mentioned. Count frequency (how many respondents mentioned each).\n2. **Sentiment Classification**: For each theme, classify as positive, neutral, or negative.\n3. **Intensity Assessment**: Distinguish between themes that are mentioned in passing vs. those expressed with strong emotion or urgency.\n\n### Signal vs. Noise\nDistinguish between:\n- **Strong signals**: Mentioned by 3+ respondents or expressed with high intensity\n- **Moderate signals**: Mentioned by 2 respondents or one respondent with high intensity\n- **Noise**: Single mention with low intensity\n\n## Instructions\n1. Complete quantitative analysis if score data is provided\n2. Extract and categorize all themes from qualitative feedback\n3. Build a signal vs. noise classification\n4. Identify the top 3 actionable improvements the team should make\n5. Write a "what went well" section to reinforce positive patterns\n6. Flag any feedback that suggests a relationship risk that needs immediate attention\n\n## Output Format\n- **Feedback Summary** (response count, NPS if applicable, one-sentence overall sentiment)\n- **Theme Analysis Table** (theme, frequency, sentiment, intensity, signal level)\n- **Quantitative Summary** (NPS breakdown and score if applicable)\n- **Top 3 Improvement Recommendations** (issue, evidence, recommended action, owner, timeline)\n- **What Went Well** (2-3 positive themes to reinforce)\n- **Relationship Risk Flags** (any themes requiring urgent attention)\n\n## Quality Criteria\n- Every improvement recommendation must cite specific feedback, not just general themes\n- Distinguish clearly between feedback about the project deliverables vs. feedback about the team/relationship\n- If response count is low (< 5), note the statistical limitations explicitly',
  'Internal Ops',
  'analysis',
  ARRAY['cross-industry'],
  ARRAY['client-feedback', 'nps-analysis', 'client-success'],
  'Gemini 2.0 Flash',
  'simple',
  3.2,
  5,
  3,
  '2026-01-10',
  'GPT-4o',
  'active',
  NULL
);

-- =============================================================================
-- Update existing seed prompts with varied total_checkouts for dashboard data
-- =============================================================================
UPDATE prompts SET total_checkouts =
  CASE title
    WHEN 'Stakeholder Interview Synthesis'  THEN 38
    WHEN 'Technology Landscape Assessment'  THEN 29
    WHEN 'Process Mining from Documentation' THEN 21
    WHEN 'AI Use Case Prioritization Matrix' THEN 45
    WHEN 'Build vs Buy Analysis'            THEN 19
    WHEN 'Change Impact Assessment'         THEN 14
    WHEN 'Prompt Engineering Review'        THEN 33
    WHEN 'Test Case Generation'             THEN 18
    WHEN 'API Integration Specification'    THEN 12
    WHEN 'Training Workshop Agenda Builder' THEN 27
    WHEN 'Adoption Playbook Generator'      THEN 9
    WHEN 'Quick Reference Card Creator'     THEN 41
    WHEN 'Executive Summary Generator'      THEN 35
    WHEN 'Weekly Status Report Compiler'    THEN 16
    WHEN 'Risk Assessment Synthesizer'      THEN 22
    WHEN 'Proposal Section Drafter'         THEN 31
    WHEN 'Knowledge Base Article Writer'    THEN 8
    WHEN 'Client Feedback Analyzer'         THEN 5
    ELSE total_checkouts
  END;

-- =============================================================================
-- PHASE 5: Demo Seed Data
-- Two demo profiles (placeholder — claimed by signInAsDemo on login),
-- 5 community profiles for upvote simulation,
-- 2 engagements, 5 forks (varied ratings + merge statuses),

-- Stub auth.users entries for placeholder profiles (profiles.id FK → auth.users)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo-consultant@placeholder.local', '', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'demo-admin@placeholder.local', '', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'community-01@placeholder.local', '', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'community-02@placeholder.local', '', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'community-03@placeholder.local', '', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'community-04@placeholder.local', '', NOW(), NOW(), NOW(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'community-05@placeholder.local', '', NOW(), NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;
-- 7 prompt requests (all statuses represented), upvote rows.
-- =============================================================================

-- Demo profiles (placeholder UUIDs — overwritten by signInAsDemo upsert claim)
INSERT INTO profiles (id, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Consultant', 'consultant'),
  ('00000000-0000-0000-0000-000000000002', 'Demo Admin',      'admin')
ON CONFLICT (id) DO NOTHING;

-- Community profiles for simulating upvotes from other consultants
INSERT INTO profiles (id, name, role) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Alex Rivera',    'consultant'),
  ('00000000-0000-0000-0000-000000000011', 'Sam Chen',       'consultant'),
  ('00000000-0000-0000-0000-000000000012', 'Jordan Blake',   'consultant'),
  ('00000000-0000-0000-0000-000000000013', 'Taylor Singh',   'consultant'),
  ('00000000-0000-0000-0000-000000000014', 'Morgan Kim',     'consultant')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Engagements (2): owned by demo consultant placeholder
-- =============================================================================
INSERT INTO engagements (id, name, client_name, industry, status, created_by, created_at) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Acme Corp — Apr 2026',
    'Acme Corp',
    'Financial Services',
    'active',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '10 weeks'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'TechStart — Jan 2026',
    'TechStart',
    'Technology',
    'completed',
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '18 weeks'
  );

-- =============================================================================
-- Forked Prompts (5): linked to engagements above, referencing seed prompts
-- forked_at timestamps spread over 10 weeks to create chart data
-- =============================================================================
INSERT INTO forked_prompts (
  id,
  source_prompt_id,
  source_version,
  engagement_id,
  original_content,
  adapted_content,
  adaptation_notes,
  effectiveness_rating,
  usage_count,
  feedback_notes,
  issues,
  merge_status,
  merge_suggestion,
  contains_client_context,
  forked_by,
  forked_at,
  last_used
) VALUES
  -- Fork 1: Acme Corp, Stakeholder Interview Synthesis, pending merge
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    (SELECT id FROM prompts WHERE title = 'Stakeholder Interview Synthesis' LIMIT 1),
    1,
    'aaaaaaaa-0000-0000-0000-000000000001',
    (SELECT content FROM prompts WHERE title = 'Stakeholder Interview Synthesis' LIMIT 1),
    E'You are an expert AI strategy consultant working with Acme Corp in the Financial Services sector.\n\n## Objective\nAnalyze the provided stakeholder interview transcripts and synthesize key findings for Acme''s digital transformation initiative. Pay particular attention to regulatory compliance concerns and legacy system integration challenges that are unique to FSI clients.\n\n## Context\n- Client: Acme Corp\n- Industry: Financial Services\n- Engagement scope: AI Readiness Assessment\n- Number of interviews: 12\n- Interviewees: C-suite, VP Operations, Compliance Lead\n\n## Instructions\n1. **Theme Extraction**: Identify the 3-5 most prominent themes, with special attention to compliance risk framing — FSI stakeholders will be more conservative than tech clients.\n2. **Pain Point Mapping**: List specific pain points. For Acme, distinguish between regulatory pain (compliance-driven friction) and operational pain (day-to-day inefficiency).\n3. **Decision Landscape**: Note existing decisions, contested decisions, and overdue decisions — especially any involving vendor lock-in or data residency.\n4. **Alignment Gaps**: Identify contradictions between C-suite ambitions and operational constraints.\n5. **Quick Wins**: Surface low-effort, high-visibility opportunities that can be delivered before the Q2 board presentation.\n6. **Risk Signals**: Flag organizational resistance, unrealistic timelines, data governance gaps.\n\n## Output Format\nProduce a structured report with these sections:\n- **Executive Summary** (3-5 bullets, suitable for Acme''s CFO)\n- **Key Themes** (table with theme, frequency, stakeholder groups, implication)\n- **Pain Points** (regulatory vs. operational, ranked by frequency)\n- **Alignment Gaps** (who disagrees, on what, why it matters)\n- **Quick Wins** (effort vs. impact matrix)\n- **Risk Signals** (risk, source, mitigation suggestion)',
    'Added FSI-specific framing: distinguished regulatory pain from operational pain, added compliance risk angle throughout. Removed generic "cross-industry" language. Added Q2 board presentation as a deadline anchor for quick wins.',
    5,
    3,
    'Excellent results in exec readiness session — CFO specifically called out the regulatory risk framing as exactly what they needed. Will suggest merging the FSI adaptations back.',
    '{}',
    'pending',
    'The FSI-specific adaptations to this prompt significantly improved exec buy-in during the Acme engagement. Specifically: (1) distinguishing regulatory pain from operational pain is a reusable pattern for all FSI clients, (2) the compliance risk framing in the Risk Signals section caught issues that the generic version misses. Recommend adding a {{client_risk_profile}} variable and FSI-specific instructions as a configurable section.',
    false,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '8 weeks',
    NOW() - INTERVAL '3 weeks'
  ),
  -- Fork 2: Acme Corp, Technology Landscape Assessment, needs work
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    (SELECT id FROM prompts WHERE title = 'Technology Landscape Assessment' LIMIT 1),
    1,
    'aaaaaaaa-0000-0000-0000-000000000001',
    (SELECT content FROM prompts WHERE title = 'Technology Landscape Assessment' LIMIT 1),
    E'You are a senior AI technology consultant conducting a landscape assessment for Acme Corp, a large enterprise in the Financial Services sector.\n\n## Objective\nAnalyze the provided technology documentation and identify high-value AI integration opportunities, with particular focus on compliance-safe automation patterns.\n\n## Context\n- Client: Acme Corp\n- Industry: Financial Services\n- Company size: Enterprise (5,000+ employees)\n- Current AI maturity level: 2 (basic automation, no generative AI in production)\n\n## Instructions\n1. **System Inventory**: Catalog all systems — core (mission-critical), supporting, and peripheral. Note age and vendor support status.\n2. **Data Flow Mapping**: Trace data flows, identify silos and manual handoffs.\n3. **AI Readiness Assessment**: For core systems, assess data quality, API accessibility, and organizational readiness. Flag any systems with PII/regulated data that require additional governance review.\n4. **Opportunity Identification**: Generate 8-10 AI use cases. Exclude any that would require regulated data in model training without explicit compliance approval.\n5. **Prioritization**: Rank by effort vs. impact, flagging compliance dependencies.\n6. **Risk Analysis**: Include data privacy, vendor SLA risks, and change readiness.\n\n## Output Format\n- Landscape Summary, System Inventory Table, Data Flow Observations\n- AI Opportunity Catalog, Priority Matrix, Top 3 Recommendations',
    'Added compliance filter to opportunity identification — excludes use cases requiring regulated data in model training. Added PII flag to AI readiness assessment. Reduced from 12 to 8-10 opportunities to keep scope realistic for FSI client.',
    3,
    2,
    'Too verbose for the client''s comfort level. They wanted a shorter, more executive-friendly output. The compliance additions were correct but the overall prompt still generates walls of text.',
    '{"too_verbose"}',
    'none',
    NULL,
    true,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '5 weeks'
  ),
  -- Fork 3: Acme Corp, AI Use Case Prioritization Matrix, good rating
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    (SELECT id FROM prompts WHERE title = 'AI Use Case Prioritization Matrix' LIMIT 1),
    1,
    'aaaaaaaa-0000-0000-0000-000000000001',
    (SELECT content FROM prompts WHERE title = 'AI Use Case Prioritization Matrix' LIMIT 1),
    E'You are a senior AI strategy consultant helping Acme Corp prioritize a portfolio of AI use cases for their 2026 implementation roadmap.\n\n## Objective\nEvaluate the provided list of AI use case candidates and produce a scored, ranked prioritization matrix with a recommended phased implementation roadmap. Account for Acme''s conservative risk appetite and Q3 delivery constraints.\n\n## Context\n- Client: Acme Corp\n- Industry: Financial Services\n- Available AI budget: $2-3M for year 1\n- Implementation team capacity: 4 engineers + 2 AI consultants (Human Agency)\n- Strategic priorities: (1) Reduce manual compliance review workload by 40%, (2) Accelerate client onboarding from 14 days to 5 days, (3) Improve analyst productivity\n- Constraints: No generative AI in customer-facing flows until Q4 board approval. Internal tools only for H1.\n\n## Scoring Framework\n(same as standard)\n\n## Instructions\n1-5 standard\n\n## Output Format\n(standard)',
    'Added Acme-specific strategic priorities and constraint: no customer-facing GenAI until Q4. Added Q3 delivery constraint. This changes the Phase 1 recommendations significantly — shifts from highest-impact to highest-feasibility.',
    4,
    4,
    'Very effective. The constraint-aware prioritization prevented the team from over-committing to H1 and gave execs a cleaner story for the board.',
    '{}',
    'none',
    NULL,
    true,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '4 weeks',
    NOW() - INTERVAL '1 week'
  ),
  -- Fork 4: TechStart, Executive Summary Generator, approved merge
  (
    'bbbbbbbb-0000-0000-0000-000000000004',
    (SELECT id FROM prompts WHERE title = 'Executive Summary Generator' LIMIT 1),
    1,
    'aaaaaaaa-0000-0000-0000-000000000002',
    (SELECT content FROM prompts WHERE title = 'Executive Summary Generator' LIMIT 1),
    E'You are a senior consultant preparing executive communications for TechStart''s AI Velocity program.\n\n## Objective\nTransform the provided raw project materials into a polished executive summary for a startup audience — concise, metric-driven, and VC-readable. TechStart''s exec team expects shorter, faster summaries than enterprise clients. Target: 300-400 words maximum.\n\n## Context\n- Client: TechStart\n- Project: AI Velocity Program\n- Audience: CEO, CTO, and Board Observer\n- Sentiment: On track\n\n## Executive Summary Principles\n1. **Lead with numbers** — startup execs respond to metrics more than narrative\n2. **Be direct about blockers** — no softening language\n3. **Keep it short** — 300-400 words maximum\n4. **One decision per summary** — don''t list 5 items needing attention, prioritize the most important one\n\n## Output Format\n- Status (1 line, RAG), Key Wins (3 bullets, each with a metric), One Decision Needed, Top Risk (1 item), Next 2 Weeks (3 milestones)',
    'Compressed format significantly for startup context — removed financial summary section, reduced to single decision, shortened output to 300-400 words. Startup execs don''t want the full enterprise template.',
    5,
    6,
    'Perfect for TechStart''s weekly board updates. CEO said it was the first status report he actually read end-to-end.',
    '{}',
    'approved',
    NULL,
    false,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '10 weeks',
    NOW() - INTERVAL '6 weeks'
  ),
  -- Fork 5: TechStart, Training Workshop Agenda Builder, good rating
  (
    'bbbbbbbb-0000-0000-0000-000000000005',
    (SELECT id FROM prompts WHERE title = 'Training Workshop Agenda Builder' LIMIT 1),
    1,
    'aaaaaaaa-0000-0000-0000-000000000002',
    (SELECT content FROM prompts WHERE title = 'Training Workshop Agenda Builder' LIMIT 1),
    E'You are a learning experience designer creating an AI training program for TechStart''s engineering and product teams.\n\n## Objective\nDesign a half-day (4-hour) workshop that builds practical AI prompting skills for technical professionals who are already familiar with AI tools but have inconsistent prompting quality.\n\n## Context\n- Client: TechStart\n- Target audience: Engineers and PMs (mixed technical backgrounds)\n- Current AI familiarity: intermediate (use Copilot and ChatGPT daily, no formal prompt training)\n- Workshop duration: 4 hours (half-day)\n- Format: in-person\n- Tools they use: GitHub Copilot, ChatGPT Plus, Claude\n- Primary use cases: code review assistance, spec writing, debugging, customer feedback synthesis\n\n## Design Principles\n(standard 4 principles)\n\n## Instructions\n1-7 standard, adapted for technical audience with intermediate familiarity\n\n## Output Format\n(standard)',
    'Condensed to half-day format for TechStart''s time-constrained team. Focused on technical use cases (code review, debugging) rather than general prompting. Assumes intermediate familiarity so skipped basics section.',
    4,
    3,
    'Good results. Would benefit from more hands-on debugging exercises. Team was most engaged during the live coding segment.',
    '{"needs_more_exercises"}',
    'none',
    NULL,
    false,
    '00000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '2 weeks'
  );

-- =============================================================================
-- Prompt Requests (7): full status lifecycle for demo
-- =============================================================================
INSERT INTO prompt_requests (
  id,
  title,
  description,
  category,
  urgency,
  status,
  decline_reason,
  requested_by,
  resolved_by_prompt,
  resolved_at,
  created_at
) VALUES
  -- 1. Open, urgent, high upvotes
  (
    'cccccccc-0000-0000-0000-000000000001',
    'Competitive landscape analysis prompt',
    'We need a structured prompt for generating competitive landscape analyses from publicly available information. Currently our consultants are writing these ad-hoc and the quality is wildly inconsistent. A strong template would save 3-4 hours per engagement during the discovery phase and ensure we''re covering the right dimensions (market positioning, pricing strategy, technology differentiation, go-to-market motions).',
    'Discovery',
    'urgent',
    'open',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    NULL,
    NULL,
    NOW() - INTERVAL '3 weeks'
  ),
  -- 2. Open, medium, moderate upvotes
  (
    'cccccccc-0000-0000-0000-000000000002',
    'Client stakeholder mapping template',
    'A prompt that helps consultants build a comprehensive stakeholder map at the start of an engagement. Should identify key decision-makers, influencers, blockers, and champions, and output a structured map with recommended engagement strategies for each stakeholder type. The Stakeholder Interview Synthesis prompt is great for analysis but we need something for the initial mapping step.',
    'Discovery',
    'medium',
    'open',
    NULL,
    '00000000-0000-0000-0000-000000000010',
    NULL,
    NULL,
    NOW() - INTERVAL '5 weeks'
  ),
  -- 3. Open, nice_to_have, low upvotes
  (
    'cccccccc-0000-0000-0000-000000000003',
    'ROI calculator prompt for AI initiatives',
    'A structured prompt for building ROI models for AI initiatives. Clients always ask "what''s the business case?" and we need a rigorous, defensible framework that covers cost reduction, productivity gains, risk reduction, and revenue impact. Should generate a 3-year model with conservative, base, and optimistic scenarios.',
    'Solution Design',
    'nice_to_have',
    'open',
    NULL,
    '00000000-0000-0000-0000-000000000011',
    NULL,
    NULL,
    NOW() - INTERVAL '7 weeks'
  ),
  -- 4. Open, medium, very low upvotes
  (
    'cccccccc-0000-0000-0000-000000000004',
    'Data migration risk assessment framework',
    'For engagements that involve migrating data to AI-ready platforms, we need a structured risk assessment prompt. Should cover data quality, lineage, compliance/PII risks, and migration sequencing. Currently borrowing from the general Risk Assessment Synthesizer but a migration-specific version would be much more useful.',
    'Build',
    'medium',
    'open',
    NULL,
    '00000000-0000-0000-0000-000000000012',
    NULL,
    NULL,
    NOW() - INTERVAL '2 weeks'
  ),
  -- 5. Planned, medium upvotes
  (
    'cccccccc-0000-0000-0000-000000000005',
    'Change management communication template',
    'A prompt that generates a change management communication plan for AI rollout projects. Should produce a multi-channel communication calendar with templates for email, town hall talking points, and manager briefings. We have the Adoption Playbook Generator but need more granular communication templates that account for different stakeholder anxiety levels.',
    'Enablement',
    'medium',
    'planned',
    NULL,
    '00000000-0000-0000-0000-000000000013',
    NULL,
    NULL,
    NOW() - INTERVAL '6 weeks'
  ),
  -- 6. Resolved, linked to Executive Summary Generator
  (
    'cccccccc-0000-0000-0000-000000000006',
    'Executive summary generator for AI projects',
    'We need a standardized way to produce executive summaries for AI initiative status updates. Format should be C-suite ready, RAG-status driven, and under one page. Our PMs are spending too much time formatting these manually.',
    'Delivery',
    'urgent',
    'resolved',
    NULL,
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM prompts WHERE title = 'Executive Summary Generator' LIMIT 1),
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '10 weeks'
  ),
  -- 7. Declined
  (
    'cccccccc-0000-0000-0000-000000000007',
    'Generic email writer',
    'A general-purpose email drafting prompt for writing professional emails.',
    'Internal Ops',
    'nice_to_have',
    'declined',
    'Too generic for our AI consulting context. Our prompt library focuses on specialized AI strategy, delivery, and enablement prompts — not general office productivity tools. Plenty of AI email assistants already exist. We should keep the library focused on what differentiates Human Agency''s delivery.',
    '00000000-0000-0000-0000-000000000014',
    NULL,
    NULL,
    NOW() - INTERVAL '8 weeks'
  );

-- =============================================================================
-- Request Upvotes: simulate community voting
-- Request 1 (competitive landscape): 14 upvotes
-- Request 2 (stakeholder mapping): 8 upvotes
-- Request 3 (ROI calculator): 5 upvotes
-- Request 4 (data migration): 2 upvotes
-- Request 5 (change management): 6 upvotes
-- Request 6 (exec summary) and 7 (email writer): no upvotes (resolved/declined)
-- =============================================================================

-- Request 1: 14 upvotes — use all 7 demo profiles
INSERT INTO request_upvotes (request_id, user_id) VALUES
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013'),
  ('cccccccc-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000014');

-- Request 2: 8 upvotes — but we only have 7 profiles, use 5
INSERT INTO request_upvotes (request_id, user_id) VALUES
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000013'),
  ('cccccccc-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000014');

-- Request 3: 5 upvotes
INSERT INTO request_upvotes (request_id, user_id) VALUES
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013'),
  ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000014');

-- Request 4: 2 upvotes
INSERT INTO request_upvotes (request_id, user_id) VALUES
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010'),
  ('cccccccc-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011');

-- Request 5: 6 upvotes
INSERT INTO request_upvotes (request_id, user_id) VALUES
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000012'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000013'),
  ('cccccccc-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000014');
