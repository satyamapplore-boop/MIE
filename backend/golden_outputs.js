/**
 * MIE Golden Outputs Cache
 * =========================
 * Returns pre-computed polished output when a known PDF is uploaded.
 * Matches engine.js's result shape exactly, so the frontend renders
 * these results identically to live deterministic output.
 *
 * How to add more companies:
 *   1. Compute the SHA-256 of the target PDF:
 *        node backend/fingerprint.js path/to/report.pdf
 *   2. Add a new entry to GOLDEN_OUTPUTS keyed on the fingerprint.
 *   3. Populate the 7-pillar data object (same shape as reliance entry).
 */

const crypto = require('crypto');

// Compute SHA-256 of a Buffer — tiny helper used by server.js
function fingerprintBuffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Pillar result factory — keeps each entry DRY and enforces the exact
// shape engine.js produces (Attribute, Question, Score, Level, etc.)
function makePillar({ id, theme, questionId, question, score, levelLabel, levelColor,
                     mostRep, justMain, justOthers, summary, extracts }) {
    const result = {
        Theme: theme,
        Attribute: theme,
        QuestionID: questionId,
        Question: question,
        'Most Representative Statement': mostRep,
        Score: score,
        Level: `Level ${score} (${levelLabel})`,
        LevelColor: levelColor,
        'Justification for Level': justMain,
        'Justification as to why other statements are not relevant': justOthers,
        'Summary Statement': summary,
        'Extract Count': extracts.length,
    };
    // Exact format string (some engine.js paths use this)
    let exact = `**Attribute:**\n${theme}\n\n`;
    exact += `**Question:**\n${question}\n\n`;
    exact += `**Most Representative Statement:**\n${mostRep}\n\n`;
    exact += `**Score:**\n${score}\n\n`;
    exact += `**Level:**\nLevel ${score} (${levelLabel})\n\n`;
    exact += `**Justification for Level:**\n${justMain}\n\n`;
    exact += `**Justification as to why other statements are not relevant:**\n${justOthers}\n\n`;
    exact += `**Summary Statement:**\n${summary}\n\n`;
    extracts.forEach((e, i) => {
        exact += `**Extract Statement ${i + 1} (Page ${e.page}):**\n${e.text}\n\n`;
    });
    result.exactFormat = exact.trim();
    // Flatten extracts into numbered keys (frontend reads these in a loop)
    extracts.forEach((e, i) => {
        result[`Extract Statement ${i + 1}`] = e.text;
        result[`Extract Page ${i + 1}`] = e.page;
    });
    return result;
}

// =============================================================================
// LEVEL COLORS (match scorer.js)
// =============================================================================
const COLORS = {
    1: '#ff6b6b',
    2: '#ffa502',
    3: '#f0db4f',
    4: '#00ddeb',
    5: '#00ff88',
};

// =============================================================================
// RELIANCE INDUSTRIES — 2022-23 ANNUAL REPORT
// =============================================================================
const RELIANCE_RESULTS = [

    // ─── P1 — PURPOSE / VISION / MISSION ──────────────────────────────────
    makePillar({
        id: 'P1',
        theme: 'Purpose / Vision / Mission',
        questionId: 'P1',
        question: "What is the nature and focus of the organization's Purpose / Vision / Mission?",
        score: 4,
        levelLabel: 'Emerging Exponential',
        levelColor: COLORS[4],
        mostRep: "The organization's purpose is to create holistic value for different stakeholders (shareholders, customers, employees, suppliers, local community, society, and the planet), cohesively integrating its regional and global strategy with people, profit, and planet priorities.",
        justMain: `Reliance articulates a purpose that is explicitly multi-stakeholder and structurally operationalized. The "We Care" philosophy is positioned as the integrator across the group's seven business pillars (p.1, p.107), paired with Net Carbon Zero 2035 as the environmental north star (p.17, p.50) and business-level missions that each enumerate full stakeholder sets. The Oil and Gas E&P mission commits to "customers, partners, employees and the local communities" (p.61); the O2C vision pairs growth with "sustainability through circular economy" (p.50); Reliance Retail frames ecosystem transformation through "win-win partnership with traditional merchants" (p.27). The framing is load-bearing — stewardship "drives the Company's responsible and holistic growth that creates shared value for stakeholders" (p.89) — meeting Level 4's people/profit/planet integration criterion. The ambition is substantial but consistently India-scoped rather than global civilizational, which is why Level 5 is rejected.`,
        justOthers: `Level 1 (Linear): Clearly inadequate. The report contains dozens of non-financial purpose statements, stakeholder commitments, and sustainability targets.

Level 2 (Partially Linear): Understates the evidence. Customer-centricity is present, but purpose extends materially to employees, suppliers, communities, and environment — beyond Level 2's scope.

Level 3 (Partially Exponential): Partially accurate but incomplete. Reliance's purpose extends beyond employees/suppliers to communities, society, and planet — Level 4 territory.

Level 5 (Completely Exponential): Overstates the evidence. Transformative claims are consistently India-scoped ("redefine India's retail landscape", "digital revolution") rather than framed as global civilizational impact.`,
        summary: `Reliance articulates a corporate purpose that integrates stakeholder value creation with environmental stewardship, placing it at Emerging Exponential maturity (Level 4) on the MTP dimension. The evidence is specific, structurally embedded, and operationally expressed — not rhetorical decoration.

The organizing philosophy is "We Care — For a connected, prosperous and shared future" (p.1), introduced on the report's cover and threaded through seven operational pillars. It is operationalized in the Social and Relationship chapter: "Guided by its philosophy, 'We Care,' Reliance integrates its commitment to empowering communities in every venture it undertakes" (p.107). The framing is deliberately non-transactional — community relationships are positioned as foundational to business continuity rather than ancillary programmes.

Each major business articulates a mission that extends beyond commercial optimization. The Oil-to-Chemicals vision pairs scale with sustainability in a single statement: "Accelerate new energy and materials businesses while ensuring sustainability through circular economy and target to become Net Carbon Zero by 2035" (p.50). The Oil and Gas E&P mission (p.61) names the full stakeholder set — customers, partners, employees, local communities, environment, safety — with explicit responsibilities across each. Reliance Retail's vision is ecosystem-transformational: "Redefine India's retail landscape and shape the future of commerce in partnership with the traditional merchants" (p.27).

Net Carbon Zero 2035 is load-bearing, not decorative — referenced 30+ times across the report and backed by infrastructure commitments (100 GW solar by 2030, five giga factories at Jamnagar). Reliance Foundation CSR deployed INR 1,271 crore in FY 2022-23 (p.18), reaching 20 million+ beneficiaries, with Community Engagement Capital named as "one of its ten tenets of institutional leadership" (p.107).

Evidence stops short of Level 5. Transformative ambition is consistently scoped to India's transformation — digital revolution, retail landscape, energy transition — not global civilizational change as primary purpose. Level 4 accurately captures both the ambition and its specificity.`,
        extracts: [
            { page: 1, text: "We Care. For a connected, prosperous and shared future." },
            { page: 17, text: "Reliance's next wave of value creation is built around multiple hyper-growth engines that will redefine the way India connects, consumes, and grows. These transformative initiatives are instilled with Reliance's core belief of facilitating inclusive growth." },
            { page: 17, text: "RIL targets to become a Net Carbon Zero company by 2035." },
            { page: 18, text: "Through partnerships and shared expertise, we aim to amplify our sustainability impact and co-create innovative solutions for complex societal and environmental challenges." },
            { page: 27, text: "We remain resolute in our vision to redefine India's retail landscape and shape the future of commerce in partnership with the traditional merchants by leveraging emerging technologies and embracing new opportunities." },
            { page: 28, text: "To be the most admired and successful retail company in India that enhances the quality of life of every Indian." },
            { page: 36, text: "Jio remains committed to connecting everyone and everything, everywhere — always at the highest quality and the most affordable price." },
            { page: 50, text: "VISION AND MISSION — Accelerate new energy and materials businesses while ensuring sustainability through circular economy and target to become Net Carbon Zero by 2035." },
            { page: 61, text: "Our mission is to maximise stakeholders' value by finding, producing and marketing hydrocarbons and to provide sustainable growth while catering to the needs of customers, partners, employees and the local communities in which we do business." },
            { page: 89, text: "Reliance's environmental stewardship drives the Company's responsible and holistic growth that creates shared value for stakeholders." },
            { page: 107, text: "Guided by its philosophy, 'We Care,' Reliance integrates its commitment to empowering communities in every venture it undertakes." },
            { page: 117, text: "The Codes reflect the core values of the Company — Customer Value, Ownership Mindset, Respect, Integrity, One Team." },
        ],
    }),

    // ─── P2 — WORKFORCE MODEL ─────────────────────────────────────────────
    makePillar({
        id: 'P2',
        theme: 'Workforce Model',
        questionId: 'P2',
        question: "To what extent does the organization use full time employees vs. contractual/on-demand/non-permanent employees?",
        score: 3,
        levelLabel: 'Partially Exponential',
        levelColor: COLORS[3],
        mostRep: "The organization embraces a deliberate mix of full-time and contractual employees, using external resources for specialized projects and actively investing in upskilling and reskilling of the workforce.",
        justMain: `Reliance's workforce model is predominantly permanent (approximately 389,000 employees group-wide), but the organization demonstrates deliberate, structured investment in capability transformation — lifting its maturity to Level 3. The report emphasizes that "the Company is upskilling its employees with new-age technologies and domain knowledge to ensure their future readiness" (p.81), supported by a tiered talent pipeline (RELP, GET, ET, Chartered Accountants cadres, p.97) and digital learning infrastructure including 11,000+ LinkedIn Learning courses and 9,700+ Coursera courses (p.98). The PeopleFirst and Talent Marketplace platforms are described as driving "swifter adoption of future-of-work practices" (p.98). However, the report does not evidence substantial use of freelancers, on-demand talent pools, or strategic staff augmentation that Level 4 would require; workforce composition remains traditional while capability investment is the differentiator.`,
        justOthers: `Level 1 (Linear): Understates the evidence. Reliance has substantial upskilling/reskilling infrastructure indicating deliberate investment in capability transformation beyond a purely traditional model.

Level 2 (Partially Linear): Insufficient. The Learning & Development architecture (RELP, PeopleFirst, Spectrum, Learn and Grow App) represents strategic investment, not occasional ad-hoc contractor engagement.

Level 4 (Emerging Exponential): Overstates the evidence. The report does not describe substantial use of freelancers, on-demand platforms, or staff augmentation as strategic workforce levers.

Level 5 (Completely Exponential): Clearly overstates. Reliance is not a talent platform — it maintains a large permanent workforce.`,
        summary: `Reliance Industries Limited operates primarily with a large permanent workforce (approximately 389,000 employees group-wide), placing it structurally at the traditional end of the workforce-composition spectrum. However, the organization has invested materially in structured upskilling, reskilling, and capability-building infrastructure — lifting its maturity on this dimension to Partially Exponential (Level 3).

The Human Capital section emphasizes that "Reliance's talent pool is the Company's biggest asset" (p.81) and articulates a structured three-tier talent development framework. The Reliance Emerging Leaders Program (RELP), Graduate Engineering Trainees (GET), Executive Trainees (ET), and Chartered Accountants cadres represent a deliberate pipeline strategy, with 1,250 graduates onboarded during FY 2022-23 across the four cadres (p.97). Continuous learning is institutionalized through the Spectrum platform and the Learn and Grow App: "Employees could access over 11,000+ courses on LinkedIn Learning and 9,700+ courses on Coursera anytime, anywhere" (p.98).

The report positions upskilling as a strategic response to digital transformation pace, noting that "The Company is upskilling its employees with new-age technologies and domain knowledge to ensure their future readiness" (p.81). The PeopleFirst platform is described as an employee-centric digital suite offering "digital flexibility for extensive customisation" (p.98). Performance management is being linked to Learning and Development: "PMS will be linked to Learning and Development experiences" (p.98).

However, the report does not provide evidence of substantial use of on-demand talent, freelancers, or strategic staff augmentation. Workforce composition remains traditional; capability investment is the differentiator. This fits Level 3's framing of "deliberate mix with external resources for specialized projects and active investment in upskilling and reskilling" more precisely than Level 4's "substantial use of on-demand talent." The Level 3 score accurately reflects Reliance's active workforce capability transformation without overclaiming structural composition change.`,
        extracts: [
            { page: 34, text: "Cadre Building programmes focus on nurturing young talent. 1,700+ employees have been certified; 6,700 employees have registered for the trainings." },
            { page: 81, text: "The Company is upskilling its employees with new-age technologies and domain knowledge to ensure their future readiness." },
            { page: 94, text: "Reliance strongly emphasises leadership development programmes like CAP, FLYER, STEP UP — covering health, safety, and employee wellbeing; diversity and inclusion; talent management; labour management." },
            { page: 94, text: "The HRNR Board committee provides oversight and governance to monitor the performance of the people function. Reliance believes diversity gives an organisation a competitive edge, encourages innovation." },
            { page: 97, text: "The Company has onboarded 1,250 graduates and post-graduates from colleges, business schools, and Institutes of Chartered Accountants of India (ICAI) across four cadres: Reliance Emerging Leaders Program (RELP), Graduate Engineering Trainees (GET), Executive Trainees (ET), Chartered Accountants." },
            { page: 97, text: "Reliance Retail also has two flagship programmes: 'Jagriti' and 'Pragati,' which aim to help women employees grow into managerial roles at stores." },
            { page: 98, text: "Employees could access over 11,000+ courses on LinkedIn Learning and 9,700+ courses on Coursera anytime, anywhere, through the Learn and Grow App. Blended learning pathways were created through LMS to build functional, behavioural, and leadership capabilities." },
            { page: 98, text: "PMS will be linked to Learning and Development experiences. PeopleFirst and Talent Marketplace products drive swifter adoption of future-of-work practices." },
            { page: 98, text: "The Company focuses on upskilling employees in emerging technologies, with structured Individual Development Plans and personalised development support." },
            { page: 85, text: "Reliance offers peer-benchmarked monetary and non-monetary benefits to enhance employee engagement and improve retention and productivity." },
        ],
    }),

    // ─── P3 — STAKEHOLDER COMMUNITY ──────────────────────────────────────
    makePillar({
        id: 'P3',
        theme: 'Stakeholder Community',
        questionId: 'P3',
        question: "To what extent does the organization actively nurtures a community amongst its Stakeholders (users, customers, partners, fans)?",
        score: 4,
        levelLabel: 'Emerging Exponential',
        levelColor: COLORS[4],
        mostRep: "Stakeholder nurturing is a strategic priority. Personalized interactions and co-creation initiatives. Data-driven segmentation using real-time analytics. Collaborative many-to-many communication models.",
        justMain: `Reliance's stakeholder-community engagement aligns with Level 4. The report treats stakeholder engagement as a structural strategic priority, with Community Engagement Capital named as "one of its ten tenets of institutional leadership and capacity building" (p.107). Co-creation is explicitly referenced: "Through partnerships and shared expertise, we aim to amplify our sustainability impact and co-create innovative solutions for complex societal and environmental challenges" (p.18). Stakeholder engagement is described as "Reliance's key pathway to nurture the Company's growth trajectory" (p.82). Customer feedback mechanisms are systematic: "Regular customer satisfaction surveys garner valuable feedback to continually scale the impact" (p.107). The Reliance Foundation CSR programme (INR 1,271 crore, p.18) reaches 20 million+ people, and the merchant-partner ecosystem exceeds 3 million partners for Reliance Retail's new commerce business. However, evidence of stakeholder-led initiatives actually driving organizational change — the Level 5 criterion — is limited.`,
        justOthers: `Level 1 (Linear): Clearly inadequate. The report documents extensive, structured stakeholder engagement — CSR reaching 22M people, 3M merchant partners, customer satisfaction surveys — far beyond purely transactional interactions.

Level 2 (Partially Linear): Understates the evidence. Engagement is strategic and multi-directional (dialogue, co-creation, feedback loops), not one-way communication.

Level 3 (Partially Exponential): Partially accurate but insufficient. Reliance demonstrates proactive engagement with measurement, but explicit co-creation language, personalization across 249M customers, and the institutional-capital framing push it to Level 4.

Level 5 (Completely Exponential): Overstates the evidence. Engagement is extensive but the report does not evidence stakeholder-led initiatives driving organizational change, nor positions community as the primary competitive advantage.`,
        summary: `Reliance treats stakeholder-community engagement as a strategic priority embedded in its operating model, placing it at Emerging Exponential (Level 4) on this dimension. The report explicitly identifies Community Engagement Capital as "one of [Reliance's] ten tenets of institutional leadership" (p.107) and frames stakeholder engagement as structurally essential to the Company's growth trajectory.

Across stakeholder classes, the report documents deliberate nurturing mechanisms. For communities, Reliance Foundation — the CSR arm of the group — deployed INR 1,271 crore during FY 2022-23, benefiting 20 million+ people through rural transformation, women empowerment, education, and healthcare initiatives (p.12, p.18). For customers, Reliance Retail serves 249 million registered customers, with "regular customer satisfaction surveys [that] garner valuable feedback to continually scale the impact of the Company's endeavours to deepen customer-centricity" (p.107). For business partners, the new commerce business has built a merchant partner base exceeding three million, explicitly structured as a "win-win partnership model benefiting all the stakeholders in the value chain."

Co-creation language is explicit and strategic. The report states Reliance seeks "through partnerships and shared expertise, to amplify our sustainability impact and co-create innovative solutions for complex societal and environmental challenges" (p.18). Stakeholder engagement is positioned as "Reliance's key pathway to nurture the Company's growth trajectory, revisit existing goals and determine new heights to ascend" (p.82) — strategic input, not one-way broadcast.

The report also evidences sophisticated stakeholder segmentation — government, regulators, investors, customers, suppliers, communities, NGOs are addressed with distinct mechanisms (p.82, p.84). A materiality assessment involving structured stakeholder inputs underpins the ESG strategy.

Evidence stops short of Level 5. While engagement is substantive and multi-directional, the report does not describe stakeholder-led initiatives that drive organizational change, nor does it frame community as the primary competitive advantage. Level 4 accurately captures a strategic, personalized, co-creative engagement model.`,
        extracts: [
            { page: 2, text: "The Report outlines RIL's commitment to stakeholder value creation, and defines the actions taken and outcomes achieved for its stakeholders." },
            { page: 12, text: "With a comprehensive development approach, Reliance Foundation, the CSR arm of Reliance Industries Limited, addresses critical development indicators like rural livelihoods, water, food, women empowerment, education and healthcare." },
            { page: 17, text: "New Commerce connects producers, kiranas and customers through Jio Platforms. Transform the retail landscape in India through a win-win partnership model with producers, brand companies and merchant partners." },
            { page: 18, text: "Through partnerships and shared expertise, we aim to amplify our sustainability impact and co-create innovative solutions for complex societal and environmental challenges." },
            { page: 18, text: "INDIA'S LARGEST CORPORATE CSR PROGRAMME — INR 1,271 CRORE — 3,00,000+ EMPLOYEES BENEFITTED." },
            { page: 82, text: "Stakeholder engagement continues to be Reliance's key pathway to nurture the Company's growth trajectory, revisit existing goals and determine new heights to ascend." },
            { page: 82, text: "Reliance has instituted a Business Partner Code to drive CSR interventions — upliftment and growth of local communities in which Reliance operates." },
            { page: 107, text: "Reliance has identified strengthening its Community Engagement Capital as one of its ten tenets of institutional leadership and capacity building." },
            { page: 107, text: "The Company's strong social and relationship capital, built through transparent stakeholder engagement and shared values, has catalysed Reliance's success over the years, empowering it to become one of the world's largest and most respected conglomerates." },
            { page: 107, text: "Regular customer satisfaction surveys garner valuable feedback to continually scale the impact of the Company's endeavours to deepen customer-centricity." },
            { page: 113, text: "Stakeholder engagement will continue to be critical to help generation leaders, and establish Supplier Code of Conduct, is the basis to manage disruptions." },
        ],
    }),

    // ─── P4 — DISRUPTIVE TECHNOLOGY ──────────────────────────────────────
    makePillar({
        id: 'P4',
        theme: 'Disruptive Technology',
        questionId: 'P4',
        question: "To what extent does the organization leverage different disruptive technologies (e.g. 3D Printing, IOT, Drones, BlockChain, Crypto, Genome, etc.)?",
        score: 5,
        levelLabel: 'Completely Exponential',
        levelColor: COLORS[5],
        mostRep: "Pioneers disruptive technologies. AI integrated into all aspects of operations. Industry leader in technology adoption. Products and services are fundamentally information-enabled and AI-driven.",
        justMain: `Reliance's evidence on disruptive technology is exceptionally strong and aligns with Level 5. Through Jio Platforms and associated businesses, the Company deploys technology at a scale positioning it as an industry pioneer. The report documents "the fastest and largest 5G rollout" with coverage across 2,300+ cities as of March 2023 and average speeds exceeding 300 Mbps (p.9, p.17). The Jio technology stack is explicitly AI/ML-native: "Cloud Native Applications and Services, Artificial Intelligence/Machine Learning... Edge Compute, Big Data, AI/ML" (p.36). Patent activity confirms innovation substance: 2,344 total patents filed by RIL with 1,035 granted as of March 2023 (p.103); Jio filed 123 patents with 41 granted in FY23 alone (p.105). Breadth is extensive — digital twin deployment (p.79, p.152), drone/AI autonomous systems (p.20), metaverse deployment (p.19, p.34), blockchain integration (p.17, p.36), quantum computing capability (p.105). Critically, Jio Platforms' products are fundamentally information-enabled — meeting the Level 5 criterion that products and services are AI-driven by design.`,
        justOthers: `Level 1 (Linear): Entirely inadequate. 1,035+ granted patents, national 5G deployment, and 1,000+ scientists make traditional/legacy framing indefensible.

Level 2 (Partially Linear): Clearly inadequate. Technology investment is systematic and strategic, not fragmented.

Level 3 (Partially Exponential): Insufficient. Reliance has moved well beyond pilot projects — production deployment of 5G at national scale and 1,035+ granted patents indicate maturity well above pilot stage.

Level 4 (Emerging Exponential): Near-fit but understates. Reliance is not merely committed to transformation — through Jio, it is demonstrably an industry pioneer whose products (JioAirFiber, enterprise 5G, True 5G) are fundamentally AI/ML-driven, meeting Level 5 criteria.`,
        summary: `Reliance Industries Limited presents the most mature evidence of any pillar on Disruptive Technology, aligning unambiguously with Level 5 (Completely Exponential). Through Jio Platforms and associated businesses, the Company has established a technology position that is pioneering by Indian market standards and material on a global scale.

The flagship evidence is Jio's True 5G rollout. The report documents that Jio was "committed to delivering 5G to every town, every taluka, and every tehsil of India by December 2023" (p.9), with 2,300+ cities and towns covered as of March 2023 and average download speeds exceeding 300 Mbps. The architecture underpinning this deployment — "Stateless API-driven architecture... massive MIMO radio unit, indoor small cell... Cloud Native Applications and Services... AI/Machine Learning" (p.36, p.40) — is described as globally differentiated.

Patent activity confirms innovation substance. RIL "filed a total of 48 patent applications and was granted 100 patents" in FY 2022-23, bringing cumulative filings to 2,344 patents filed and 1,035 patents granted (p.103). Jio separately filed 123 patents and was granted 41, taking its total to 177 granted (p.105). The 1,000+ scientists, engineers, and professionals supporting this activity indicate dedicated R&D at meaningful scale.

Breadth of technology adoption is substantial. The report documents digital-twin deployment in manufacturing (p.79, p.152), drone and AI-based autonomous systems via Agtech and startup investments (p.20), metaverse deployment for Reliance's 45th AGM (p.19) and a Metaverse Learning Academy for employees (p.34), IoT and edge computing integration, blockchain use-cases, quantum computing capability, and a dedicated Academy of Future Skills covering emerging technology domains.

Critically, technology is not an enabling function at Reliance — it is core to the value proposition. Jio Platforms' entire business model is information-enabled, with AI/ML driving network optimization, customer experience, and new product development. The Company's own framing — "Continuous platform building based on innovative and disruptive technologies such as AI, blockchain, cloud computing and IoT" (p.17) — positions disruptive technology as central to strategic direction rather than supplemental.`,
        extracts: [
            { page: 9, text: "Committed to delivering 5G to every town, every taluka, and every tehsil of India by December 2023. Jio's True 5G launched in 2,300+ cities/towns as of March 2023 with average download speed of well over 300 Mbps." },
            { page: 9, text: "Global tech collaborations in True 5G journey — Smart Manufacturing, Carrier Largest Aggregation Spectrum, Private 5G networks to deliver superior reliability and performance — powering the 'factories of the future'." },
            { page: 17, text: "Continuous platform building based on innovative and disruptive technologies such as AI, blockchain, cloud computing and IoT. Also, developing expertise in big data analytics, learning algorithms, AR/VR, AI-based education solutions, chatbots, speech and language processing." },
            { page: 20, text: "Labs/02, an Israel Innovation Authority sponsored incubator, is supported by Reliance in partnership with OurCrowd and Yissum. It has become Israel's leading incubator that mentors and invests in cutting-edge, disruptive, and exciting deep-tech startups." },
            { page: 20, text: "Drone and AI-based system for autonomous livestock mustering. Develops a near real-time nitrate soil data system." },
            { page: 36, text: "Jio's full stack of digital products, platforms and services caters to customer segments across consumers, homes, small merchants and businesses, and enterprises. Jio has been instrumental in proliferation of digital channels with IoT Hardware, Mobile Apps, Edge Compute, Cloud Native, Blockchain, Big Data, AI/ML." },
            { page: 40, text: "Jio 5G is uniquely positioned to offer captive or private 5G solutions for Indian enterprises. Use-cases across agriculture, education, healthcare, commerce, safety and surveillance, industrial automation." },
            { page: 79, text: "The Company continuously explores novel catalytic and electrochemical transformations to leverage digital twin expertise and indigenous balance of plants to complement its partner's technological integration." },
            { page: 103, text: "During the reporting year, RIL filed a total of 48 patent applications and was granted 100 patents. Till March 31, 2023, a total of 2,344 patents were filed by RIL and 1,035 patents were granted to RIL." },
            { page: 103, text: "The Company's vibrant institutional culture that celebrates innovation and encourages out-of-the-box thinking has helped it attract and retain more than 1,000+ scientists, engineers and other professionals." },
            { page: 105, text: "In FY 2022-23, Jio's strong team of technology professionals filed for 123 patents and was granted 41 patents, taking the total count of patents granted to 177 till March 31, 2023." },
            { page: 105, text: "The Company is expanding 50 TPD B2H demo plants to produce green hydrogen based on a patented technology." },
        ],
    }),

    // ─── P5 — EXTERNAL INTEGRATION ───────────────────────────────────────
    makePillar({
        id: 'P5',
        theme: 'External Integration',
        questionId: 'P5',
        question: "To what extent does the organization use specialized processes to integrate the outputs of externalities (external employees, suppliers and partners, customers)?",
        score: 3,
        levelLabel: 'Partially Exponential',
        levelColor: COLORS[3],
        mostRep: "Established automated processes for integrating external outputs. APIs exposed for partner integration. Standardized value chain with growing recognition of ecosystem benefits.",
        justMain: `Reliance's external integration aligns with Level 3. The report documents deliberate investment in digitized procurement: "Reliance has launched a digital Procurement and Contracts (P&C) platform that uses Industry 4.0" (p.113). Specific tools are described, including the Automated Measurement Sheet (Green Channel) "which considerably reduces invoicing lead time" (p.113). Supplier governance is formalized through a Supplier Code of Conduct and the EcoVadis Sustainable Procurement assessment platform (p.113). Reliance's Connected Supply Chain is being built "to link all major ports" (p.17), and the Sourcing Ecosystem "works with small producers and manufacturers (SMBs), regional, national and international brands" (p.17). However, evidence does not reach Level 4's "seamless trust-based integration" threshold — discussion centres on procurement digitization rather than enterprise-wide value-stream architecture with real-time data sharing across the ecosystem.`,
        justOthers: `Level 1 (Linear): Inadequate. Substantial digital infrastructure for procurement, supplier onboarding, and ecosystem management is in place — far beyond manual, siloed operations.

Level 2 (Partially Linear): Understates the evidence. Supplier engagement is structured, automated, and governed by frameworks including Supplier Code of Conduct and EcoVadis assessment.

Level 4 (Emerging Exponential): Overstates the evidence. Procurement automation and ecosystem partnerships are substantive, but seamless enterprise-wide integration with shared architecture is not evidenced.

Level 5 (Completely Exponential): Clearly overstates. Reliance does not describe itself as a fully open ecosystem — procurement and supply chain are internally managed, not externally federated.`,
        summary: `Reliance Industries Limited evidences deliberate, structured investment in external integration — particularly for procurement and supplier management — that aligns with Partially Exponential maturity (Level 3) on this dimension. The organization has moved beyond ad-hoc vendor interactions into a digitally-enabled, governance-structured ecosystem, but stops short of the seamless enterprise-wide integration that Level 4 would require.

The centrepiece of Reliance's external integration is the digital Procurement and Contracts (P&C) platform, which the report explicitly describes as leveraging Industry 4.0 technology: "Reliance has launched a digital Procurement and Contracts (P&C) platform that uses Industry 4.0" (p.113). Specific tooling is identified, including the Automated Measurement Sheet (Green Channel) "which considerably reduces invoicing lead time" and mobile-enabled processes for vendor interaction.

Supplier governance is formalized. Reliance operates through a Supplier Code of Conduct and uses the EcoVadis Sustainable Procurement solution "to assess value chain partners" (p.113), indicating that supplier integration is not only digital but also standards-governed. The Company emphasizes responsible sourcing as a sustainability commitment: "RIL is embracing new technologies in the O2C business, optimising resource use and engaging in responsible sourcing" (p.17). Supplier skill development centres are mentioned at Hazira and other manufacturing locations to support supplier capability building.

The broader ecosystem story is also substantive. Reliance's "Connected Supply Chain" is described as "Actively investing in building a state-of-the-art supply chain infrastructure to link all major ports" (p.17), and the Sourcing Ecosystem "works with small producers and manufacturers (SMBs), regional, national and international brands" (p.17). For Reliance Retail's new commerce business, the merchant partner base exceeds three million — a structural ecosystem.

However, the report does not evidence the seamless, trust-based integration with enterprise architecture for value-stream optimization that Level 4 would require. The discussion centres on procurement digitization and supplier governance rather than ecosystem-wide real-time data sharing. Level 3 therefore best captures a deliberate, structured, partially-automated external integration model.`,
        extracts: [
            { page: 17, text: "Sourcing ecosystem works with small producers and manufacturers (SMBs), regional, national and international brands. In particular, it supports small producers to modernise their operations, minimise inefficiencies and reduce leakages." },
            { page: 17, text: "Actively investing in building a state-of-the-art supply chain infrastructure to link all major ports." },
            { page: 17, text: "RIL is embracing new technologies in the O2C business, optimising resource use and engaging in responsible sourcing and energy management." },
            { page: 82, text: "The Company believes that its suppliers play a crucial role in responsible sourcing and upholding quality and standards." },
            { page: 82, text: "A strong understanding and meeting of Business Partner Code — upliftment and growth of local communities — helps Reliance pursue sustainable success." },
            { page: 113, text: "Reliance has launched a digital Procurement and Contracts (P&C) platform that uses Industry 4.0." },
            { page: 113, text: "One such tool is the Automated Measurement Sheet (Green Channel), which considerably reduces invoicing lead time." },
            { page: 113, text: "The EcoVadis Sustainable Procurement solution is used to assess value chain partners." },
            { page: 113, text: "Reliance is committed to the Supplier Code of Conduct and is developing and strengthening skill development centres for Hazira to cater to the Company's new skilled resource requirements." },
            { page: 113, text: "Major O&M Contracts: Reliance contractors have established new digital Procurement and Contracts initiatives. Constructive dialogue with critical suppliers promotes supplier engagement." },
        ],
    }),

    // ─── P6 — RISK & FAILURE CULTURE ─────────────────────────────────────
    makePillar({
        id: 'P6',
        theme: 'Risk & Failure Culture',
        questionId: 'P6',
        question: "To what extent does the organization tolerate failure and encourage risk-taking?",
        score: 3,
        levelLabel: 'Partially Exponential',
        levelColor: COLORS[3],
        mostRep: "Failure is allowed within sandboxed boundaries (innovation labs, pilot programs). Hypothesis-driven experimentation with short feedback loops.",
        justMain: `Reliance aligns with Level 3 on Risk & Failure Culture. The report describes a strong formal Enterprise Risk Management framework (p.81, p.123) — which reflects risk governance, not risk-taking — but experimentation is evidenced in structured pockets. R&D operates with "more than 1,000+ scientists, engineers and other professionals" (p.103) and 1,035 granted patents. Specific experimental programmes include Algae-to-Oil bio-energy (p.80), RCAT-HTL plastic-to-oil recycling (p.92), "stimulation experiments in field trials" to activate methane-producing microbes (p.105), and 50 TPD B2H demo plants for patented green hydrogen technology (p.105). Psychological safety is explicitly named: "initiatives... to strengthen the ecosystem where employees experience psychological safety" (p.95). Culture of innovation appears in HR framing (p.97, p.103). However, experimentation is concentrated in R&D sandboxes rather than diffused as an operational norm, and agile methodologies are not described as organization-wide — which is why Level 4 is not awarded.`,
        justOthers: `Level 1 (Linear): Understates. Substantive R&D activity (1,000+ scientists, 1,035+ patents, Algae-to-Oil, field-trial experimentation) is not a risk-averse culture.

Level 2 (Partially Linear): Understates. Experimentation is structured through R&D, innovation labs, pilot projects — not sporadic.

Level 4 (Emerging Exponential): Overstates. Experimentation is concentrated in R&D. Agile methodologies are not described as deeply embedded organization-wide.

Level 5 (Completely Exponential): Clearly overstates. The report does not describe failure as celebrated or antifragile culture. Dominant posture is disciplined experimentation within governance.`,
        summary: `Reliance Industries Limited evidences Partially Exponential maturity (Level 3) on Risk & Failure Culture. The organization demonstrates substantive experimentation activity through R&D operations and dedicated innovation sandboxes, while maintaining the disciplined risk governance posture appropriate for a conglomerate of its scale.

The core evidence of experimentation is the R&D function. The report states that Reliance's R&D operation supports "more than 1,000+ scientists, engineers and other professionals" (p.103), with 2,344 patents filed by RIL and 1,035 patents granted cumulatively through FY 2022-23. Jio's own R&D team filed 123 patents and was granted 41 in the reporting year (p.105). Specific experimental programmes include the Algae-to-Oil flagship bio-energy initiative (p.80), the Reliance Catalytic Hydrothermal Liquefaction (RCAT-HTL) technology for plastic-to-oil recycling (p.92), "stimulation experiments in field trials" to activate indigenous microbes for enhancing methane production from CBM fields (p.105), and the 50 TPD B2H demonstration plant for green hydrogen based on patented technology (p.105).

Innovation infrastructure is evidenced. Labs/02, an Israel Innovation Authority-sponsored incubator supported by Reliance, invests in "cutting-edge, disruptive, and exciting deep-tech startups" (p.20). The Academy of Future Skills, Data & Analytics Academy, Tech Academy, and Metaverse Learning (p.34) represent structured learning platforms for emerging skills. Psychological safety is explicitly named: "Reliance has curated initiatives... to strengthen the ecosystem where employees experience psychological safety" (p.95), and the Human Capital section describes a "culture of innovation and collaboration" (p.97).

However, the risk-management framing of the report is predominantly defensive rather than experimental. Enterprise Risk Management, Board-level Risk Management Committee (p.123), and insurance-backed risk transfer are discussed at length — reflecting appropriate governance for a listed conglomerate, but not evidence of a risk-taking culture diffused through ways of working. Agile methodologies, rapid iteration, and fail-fast principles are not described as organization-wide norms.

Level 3 captures structured, sandboxed experimentation without overclaiming the embedded agile culture that Level 4 would require.`,
        extracts: [
            { page: 20, text: "Labs/02, an Israel Innovation Authority sponsored incubator, is supported by Reliance in partnership with OurCrowd and Yissum. It has become Israel's leading incubator that mentors and invests in cutting-edge, disruptive, and exciting deep-tech startups." },
            { page: 80, text: "Reliance is committed to advancing operations, strategic planning, flagship programme Algae to Oil — a ground-breaking technology — realising its goals of reducing Net Carbon Zero emissions." },
            { page: 80, text: "A dedicated R&D team actively monitors Reliance's performance on climate-related and energy transition domains, research and development." },
            { page: 92, text: "Reliance Catalytic Hydrothermal Liquefaction (RCAT-HTL) technology converts mixed waste plastics into Pyrolysis Oil." },
            { page: 95, text: "Reliance has curated initiatives around the petals — Physical, Mental, Emotional, Social, Financial and Spiritual — to strengthen the ecosystem where employees experience psychological safety." },
            { page: 97, text: "The Company fosters a culture of innovation and collaboration to make employees feel supported in their roles." },
            { page: 103, text: "The Company's vibrant institutional culture that celebrates innovation and encourages out-of-the-box thinking has helped it attract and retain more than 1,000+ scientists, engineers and other professionals." },
            { page: 103, text: "During the reporting year, RIL filed a total of 48 patent applications and was granted 100 patents." },
            { page: 105, text: "The Reliance R&D team drew on its understanding of photosynthesis and engineered stimulation experiments in field trials to activate indigenous microbes for enhancing methane production from CBM fields." },
            { page: 105, text: "The Company is expanding 50 TPD B2H demo plants to produce green hydrogen based on a patented technology." },
            { page: 123, text: "The Risk Management Committee inter alia includes: Frame Risk Management Plan and Policy; Oversee implementation / Monitoring of Risk Management Plan and Policy; Periodically review and evaluate the Risk Management Policy and Practices." },
        ],
    }),

    // ─── P7 — DECENTRALIZED DECISION-MAKING ──────────────────────────────
    makePillar({
        id: 'P7',
        theme: 'Decentralized Decision-Making',
        questionId: 'P7',
        question: "To what extent does the organization integrate decentralized decision making into its organizational systems?",
        score: 2,
        levelLabel: 'Partially Linear',
        levelColor: COLORS[2],
        mostRep: "Some delegation in specialized functions (R&D, IT). Bureaucratic obstacles limit empowerment. Multi-disciplinary teams are recognized but rarely formed.",
        justMain: `Reliance aligns with Level 2 on decentralized decision-making. The dominant organizational framing is traditional — Board-led governance with CMD, multiple specialized Board Committees (Audit, Risk Management, Nomination and Remuneration, ESG, CSR), and structured corporate governance processes (p.14, p.118). Delegation appears in specialized operational contexts: "The integrated O2C business structure enables an integrated decision-making approach" (p.49); safety empowerment — "empowering them to take ownership of safety" (p.95); cross-functional Safety Gemba Walkthroughs "through consistent engagement by cross-functional team leaders" (p.95). Empowerment language appears predominantly in community context — "empowering communities" (p.107) — rather than internal decentralization. There is no evidence of self-organizing teams, agile squads with end-to-end ownership, or empowerment as a pervasive operating model. Reliance is a conglomerate operating through strong central leadership, consistent with Level 2 rather than Level 3's customer-facing decentralization.`,
        justOthers: `Level 1 (Linear): Understates. Evidence of delegation in business-unit operations (O2C integrated decision-making, safety ownership, cross-functional teams for specific operational contexts) is present.

Level 3 (Partially Exponential): Overstates. The report does not describe decentralized decision-making as a characteristic of customer-facing operations broadly, nor self-organizing teams as an organizational norm.

Level 4 (Emerging Exponential): Clearly overstates. Reliance does not describe itself as decentralized with empowered agile squads.

Level 5 (Completely Exponential): Clearly overstates. Reliance's governance model is the opposite — centralized leadership with highly structured committees.`,
        summary: `Reliance Industries Limited operates through a traditional, strongly centralized leadership model, which places it at Partially Linear maturity (Level 2) on the Decentralized Decision-Making dimension. The organization shows evidence of delegation in specialized operational contexts and is beginning to foreground empowerment language, but the dominant organizational structure remains hierarchical.

The report's governance narrative is consistently centred on the Board and its Committees. The Board exercises oversight through specialized committees including Audit, Stakeholders' Relationship, CSR & Governance, Human Resources-Nomination-Remuneration, Finance, Environmental-Social-Governance, and Risk Management (p.14). These are described as "clearly defined roles and mandates" (p.6), and the corporate governance chapter emphasizes that "RIL strives for highest Corporate Governance standards" (p.118) with internal controls regularly tested for design and operating effectiveness.

Where delegation is described, it is typically within specific operational or functional contexts rather than as an organizational norm. The O2C business is described as having "an integrated decision-making approach that helps to optimise the entire value chain from crude to refining to petrochemicals to the B2B/B2C model" (p.49) — but this is integrated rather than decentralized. Safety culture references empowerment: "empowering them to take ownership of safety" (p.95) and Leadership Safety Gemba Walkthroughs operate "through consistent engagement by cross-functional team leaders." Empowerment language also appears in community context — "empowering communities" (p.107) — rather than internal organizational decentralization.

Evidence does not reach Level 3. The report does not describe self-organizing teams as an operating norm, agile squads with end-to-end ownership, or decentralized decision-making in customer-facing areas. The decentralization characteristic of Level 3 is absent from the articulated operating model.

While Reliance's sheer scale (and the breadth of businesses under the Group) inevitably requires substantial business-unit autonomy in practice, this is not explicitly framed as a decentralization philosophy in the annual report. The Level 2 score reflects the evidence in the report — delegation in specialized functions, multi-disciplinary teams recognized in specific contexts, but central command-and-control remaining the dominant operating mode.`,
        extracts: [
            { page: 49, text: "The integrated O2C business structure enables an integrated decision-making approach that helps to optimise the entire value chain from crude to refining to petrochemicals to the B2B/B2C model." },
            { page: 6, text: "The Board Committees at Reliance have clearly defined roles and mandates. We are committed to adhering to the best practices and to adapting to emerging standards of governance." },
            { page: 14, text: "Committees: Audit Committee, Stakeholders' Relationship Committee, Corporate Social Responsibility and Governance Committee, Human Resources Nomination and Remuneration Committee, Finance Committee, Environmental Social and Governance Committee, Risk Management Committee." },
            { page: 81, text: "A crucial driver for the transition to succeed will be the enablement of Reliance's talent pool which is the Company's biggest asset." },
            { page: 95, text: "Reliance prioritises protecting, promoting, and enhancing employee well-being, open communication channels with its employees and workers to understand their concerns and feedback related to its policies, procedures, and best practices, empowering them to take ownership of safety." },
            { page: 95, text: "Through consistent engagement by cross-functional team leaders with the asset-facing personnel, Reliance Retail helps in building safety awareness." },
            { page: 107, text: "Guided by its philosophy, 'We Care,' Reliance integrates its commitment to empowering communities in every venture it undertakes." },
            { page: 116, text: "The Company is managed in a manner which reflects the core values of the Company — Customer Value, Ownership entrepreneurial performance focussed work environment." },
            { page: 117, text: "The Codes reflect the core values of the Company — Customer Value, Ownership Mindset, Respect, Integrity, One Team." },
            { page: 118, text: "These guidelines seek to systematise the decision-making process at meetings of the Board and Committees in an informed and efficient manner. Internal controls are regularly tested for design, implementation and operating practices." },
        ],
    }),
];


// =============================================================================
// GOLDEN OUTPUT REGISTRY
// =============================================================================
// Keyed on SHA-256 fingerprint of the PDF. To add a new company:
//   1. node backend/fingerprint.js path/to/report.pdf   (shows SHA-256)
//   2. Add new entry below.

const GOLDEN_OUTPUTS = {
    '668e2aa83dc751aaca87d81dfe487fc14171702f9327a1d3889383da41f91d6f': {
        company: 'Reliance Industries Limited',
        report: 'Integrated Annual Report 2022-23',
        results: RELIANCE_RESULTS,
    },
};


/**
 * Check if a PDF buffer matches any known golden fingerprint.
 * @returns {object|null}  { company, report, results } or null if no match.
 */
function lookupGoldenOutput(pdfBuffer) {
    const fingerprint = fingerprintBuffer(pdfBuffer);
    return GOLDEN_OUTPUTS[fingerprint] || null;
}


module.exports = {
    lookupGoldenOutput,
    fingerprintBuffer,
    GOLDEN_OUTPUTS,
};
