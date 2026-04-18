/**
 * MIE DIMENSIONS v4.0 — 7 CORE PARAMETERS
 * Restored to original 7-parameter maturity model with industrial-grade rubrics.
 */

const DIMENSIONS = [
    // ─── PARAMETER 1: PURPOSE / VISION / MISSION ───
    {
        id: 1,
        theme: "Purpose / Vision / Mission",
        triggers: ["purpose", "vision", "mission", "values", "culture", "ESG", "sustainability", "societal impact", "why we exist", "belief", "aspiration", "stewardship", "equity", "planet", "transforming the world"],
        questions: [
            {
                id: "P1",
                title: "What is the nature and focus of the organization's Purpose / Vision / Mission?",
                rubric: [
                    { l: 1, t: "Linear", d: "The organization lacks a clearly defined Purpose, or it is focused exclusively on achieving financial results through products and services. No reference to broader societal or environmental impact." },
                    { l: 2, t: "Partially Linear", d: "In addition to financial targets, the organization references core values such as customer-centricity, integrity, or safety. However, purpose statements remain internally focused with limited connection to external impact." },
                    { l: 3, t: "Partially Exponential", d: "The organization's purpose extends beyond customers and shareholders to encompass employees, suppliers, and broader society. Sustainability and responsible business practices are referenced in strategy documents." },
                    { l: 4, t: "Emerging Exponential", d: "The organization articulates a purpose of creating holistic value for all stakeholders — shareholders, customers, employees, suppliers, and society. It cohesively integrates people, profit, and the planet into strategic decision-making." },
                    { l: 5, t: "Completely Exponential", d: "The organization positions itself as a force for global transformation, driving massive, sustainable impact across society, economy, and environment. BHAGs (Big Hairy Audacious Goals) are pursued with transformational ambition." }
                ],
                triggers: ["purpose", "vision", "mission", "values", "culture", "why we exist", "reason for being", "raison d'être", "north star", "guiding principle", "ESG", "sustainability", "societal impact", "environmental", "social responsibility", "corporate responsibility", "SDGs", "sustainable development", "stakeholder value", "shared value", "triple bottom line", "people profit planet", "force for good", "positive change", "global transformation", "BHAG", "audacious", "transformative", "impact investing", "responsible business", "ethical", "stewardship", "equity", "inclusion", "diversity", "carbon neutral", "net zero", "climate", "circular economy"],
                antiPatterns: ["table of contents", "page number", "copyright", "all rights reserved", "disclaimer", "forward-looking statements", "board of directors", "audit committee", "stakeholders' relationship committee", "nomination and remuneration committee", "chairman of", "former chairman", "harvard business school alumnus"]
            }
        ]
    },

    // ─── PARAMETER 2: WORKFORCE MODEL ───
    {
        id: 2,
        theme: "Workforce Model",
        triggers: ["workforce", "talent", "employees", "contractors", "gig workers", "flexible workforce", "on-demand", "people strategy", "hybrid work", "talent strategy"],
        questions: [
            {
                id: "P2",
                title: "To what extent does the organization use full time employees vs. contractual/on-demand/non-permanent employees?",
                rubric: [
                    { l: 1, t: "Linear", d: "The organization predominantly relies on full-time permanent employees. There is limited or no utilization of contractual, freelance, or on-demand workers. Traditional hierarchical employment model." },
                    { l: 2, t: "Partially Linear", d: "Primarily full-time staff with occasional ad-hoc use of contractors for specific tasks or projects. Some recognition of alternative workforce models but no strategic approach." },
                    { l: 3, t: "Partially Exponential", d: "A deliberate mix of full-time and contractual employees. External resources actively used for specialized projects. Upskilling, reskilling, and talent development programs are in place." },
                    { l: 4, t: "Emerging Exponential", d: "The organization embraces a strategic blended workforce model. Substantial use of on-demand talent, freelancers, and staff augmentation. Policies extend equitably to non-permanent staff." },
                    { l: 5, t: "Completely Exponential", d: "A small core team supplemented by a predominantly on-demand workforce. Full integration of external talent into culture and systems. The organization operates as a talent platform." }
                ],
                triggers: ["workforce", "talent", "employees", "headcount", "FTE", "full-time", "part-time", "contractual", "contractors", "gig workers", "freelance", "on-demand", "staff augmentation", "outsourcing", "offshoring", "nearshoring", "flexible workforce", "hybrid work", "remote work", "people strategy", "talent strategy", "talent acquisition", "recruitment", "retention", "attrition", "turnover", "upskilling", "reskilling", "learning and development", "L&D", "training", "capability building", "skills", "competencies", "wellbeing", "well-being", "DEI", "diversity", "inclusion", "belonging", "employee engagement", "employee experience", "human capital", "human resources"],
                antiPatterns: ["table of contents", "page number", "copyright", "all rights reserved"]
            }
        ]
    },

    // ─── PARAMETER 3: STAKEHOLDER COMMUNITY ───
    {
        id: 3,
        theme: "Stakeholder Community",
        triggers: ["community", "partners", "ecosystem", "customers", "society", "NPS", "surveys", "co-creation", "co-design", "stakeholder engagement"],
        questions: [
            {
                id: "P3",
                title: "To what extent does the organization actively nurtures a community amongst its Stakeholders (users, customers, partners, fans)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Stakeholder interactions are purely transactional. Focus is on day-to-day operations with no structured community engagement. One-size-fits-all approach to all external parties." },
                    { l: 2, t: "Partially Linear", d: "Some segmentation of stakeholders exists. Occasional surveys and feedback mechanisms. Interactions are largely one-way (newsletters, social media posts) with limited listening." },
                    { l: 3, t: "Partially Exponential", d: "Proactive stakeholder engagement with dedicated resources. Online forums and communities established. Regular measurement of engagement and satisfaction metrics (NPS, CSAT)." },
                    { l: 4, t: "Emerging Exponential", d: "Stakeholder nurturing is a strategic priority. Personalized interactions and co-creation initiatives. Data-driven segmentation using real-time analytics. Collaborative many-to-many communication models." },
                    { l: 5, t: "Completely Exponential", d: "The organization co-creates with stakeholders at every level. Stakeholder-led initiatives drive change. Deep loyalty and sense of belonging. Community is a core competitive advantage." }
                ],
                triggers: ["stakeholder", "community", "customer", "client", "partner", "supplier", "vendor", "investor", "shareholder", "society", "engagement", "satisfaction", "NPS", "net promoter", "CSAT", "feedback", "survey", "listening", "voice of customer", "co-creation", "co-design", "collaboration", "advisory board", "customer panel", "forum", "community management", "loyalty", "retention", "advocacy", "brand ambassador", "ecosystem", "network effect", "platform", "marketplace", "value chain", "supply chain", "procurement", "segmentation", "personalization"],
                antiPatterns: ["table of contents", "page number", "copyright"]
            }
        ]
    },

    // ─── PARAMETER 4: DISRUPTIVE TECHNOLOGY ───
    {
        id: 4,
        theme: "Disruptive Technology",
        triggers: ["AI", "artificial intelligence", "blockchain", "IoT", "digital transformation", "innovation lab", "patents", "deep tech", "generative AI", "machine learning"],
        questions: [
            {
                id: "P4",
                title: "To what extent does the organization leverage different disruptive technologies (e.g. 3D Printing, IOT, Drones, BlockChain, Crypto, Genome, etc.)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Primarily relies on traditional methods and legacy systems. Minimal investment in new technologies. Manual decision-making with basic data analysis. Products are predominantly physical/analog." },
                    { l: 2, t: "Partially Linear", d: "Shows interest in technology but efforts are fragmented. Basic digital tools deployed. Some data collection but limited use for strategic decisions. Early-stage digitization." },
                    { l: 3, t: "Partially Exponential", d: "Active investment in technology. Pilot projects for AI, IoT, or other disruptive technologies. Advanced analytics converting data into actionable insights. Information increasingly integrated into products." },
                    { l: 4, t: "Emerging Exponential", d: "Significant commitment to technology-driven transformation. Dedicated R&D and innovation resources. Predictive algorithms deployed at scale. Data and analytics are core to the value proposition." },
                    { l: 5, t: "Completely Exponential", d: "Pioneers disruptive technologies. AI integrated into all aspects of operations. Industry leader in technology adoption. Products and services are fundamentally information-enabled and AI-driven." }
                ],
                triggers: ["artificial intelligence", "AI", "machine learning", "ML", "deep learning", "generative AI", "GenAI", "large language model", "LLM", "natural language processing", "NLP", "computer vision", "automation", "robotic process automation", "RPA", "blockchain", "distributed ledger", "cryptocurrency", "crypto", "smart contract", "IoT", "internet of things", "sensors", "connected devices", "3D printing", "additive manufacturing", "drones", "UAV", "quantum computing", "quantum", "genomics", "biotechnology", "augmented reality", "AR", "virtual reality", "VR", "metaverse", "digital twin", "cloud computing", "edge computing", "5G", "cybersecurity", "data analytics", "big data", "data science", "predictive analytics", "algorithm", "digital transformation", "digitization", "digitalization", "innovation", "R&D", "research and development", "patent", "intellectual property", "technology", "platform", "API", "open source", "SaaS"],
                antiPatterns: ["table of contents", "page number", "copyright"]
            }
        ]
    },

    // ─── PARAMETER 5: EXTERNAL INTEGRATION ───
    {
        id: 5,
        theme: "External Integration",
        triggers: ["supply chain", "API integration", "procurement", "vendor management", "partner portal", "shared platform", "open ecosystem", "supply chain resilience", "value chain"],
        questions: [
            {
                id: "P5",
                title: "To what extent does the organization use specialized processes to integrate the outputs of externalities (external employees, suppliers and partners, customers)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Operates in a closed, siloed manner. Interactions with suppliers and partners are manual and unstructured. Data is not shared. Processes are non-standardized and inefficient." },
                    { l: 2, t: "Partially Linear", d: "Some structured interactions with key suppliers. Limited automation in procurement. Basic vendor management processes. Data exchange on a need-to-know basis." },
                    { l: 3, t: "Partially Exponential", d: "Established automated processes for integrating external outputs. APIs exposed for partner integration. Standardized value chain with growing recognition of ecosystem benefits." },
                    { l: 4, t: "Emerging Exponential", d: "Seamless, trust-based integration with external ecosystem. Robust automated processes. Transparent interactions. Enterprise architecture adopted for optimizing value streams." },
                    { l: 5, t: "Completely Exponential", d: "Fully open ecosystem model. Seamless data and process integration across all value streams. Remarkable resilience across supplier and partner networks. Holistic sustainability excellence embedded." }
                ],
                triggers: ["supply chain", "value chain", "procurement", "vendor", "supplier", "partner", "outsourcing", "integration", "API", "interoperability", "ecosystem", "network", "alliance", "joint venture", "merger", "acquisition", "M&A", "collaboration", "co-development", "open platform", "shared services", "portal", "EDI", "electronic data interchange", "automation", "process automation", "enterprise architecture", "value stream", "lean", "six sigma", "continuous improvement", "standardization", "scalability", "resilience", "agility", "adaptability", "flexibility", "circular economy", "sustainable supply chain"],
                antiPatterns: ["table of contents", "page number", "copyright"]
            }
        ]
    },

    // ─── PARAMETER 6: RISK & FAILURE CULTURE ───
    {
        id: 6,
        theme: "Risk & Failure Culture",
        triggers: ["innovation lab", "fail fast", "test and learn", "agile", "celebrated failures", "culture of learning", "psychological safety", "experimentation"],
        questions: [
            {
                id: "P6",
                title: "To what extent does the organization tolerate failure and encourage risk-taking?",
                rubric: [
                    { l: 1, t: "Linear", d: "Risk-averse culture. Failure is considered career-limiting. No emphasis on testing new ideas. Minimal learning from mistakes. Sporadic or no adoption of innovative practices." },
                    { l: 2, t: "Partially Linear", d: "Some risk-taking present but limited and sporadic. Occasional experiments (A/B testing) but unsystematic. Learning from failure is informal and inconsistent." },
                    { l: 3, t: "Partially Exponential", d: "Failure is allowed within sandboxed boundaries (innovation labs, pilot programs). Hypothesis-driven experimentation with short feedback loops. Growing culture of 'doing innovation'." },
                    { l: 4, t: "Emerging Exponential", d: "Proactive approach to risk-taking aligned with strategic priorities. Experimentation integral to ways of working. Agile methodologies deeply embedded. Pervasive adoption of design thinking and lean startup." },
                    { l: 5, t: "Completely Exponential", d: "Failure and risk-taking are expected and celebrated. Antifragile culture. AI and synthetic data used for experimentation. Bold disruptive ideas empowered at every level. Short feedback loops deeply ingrained in DNA." }
                ],
                triggers: ["risk", "failure", "experiment", "experimentation", "learning", "test and learn", "fail fast", "fail forward", "trial and error", "innovation lab", "incubator", "accelerator", "hackathon", "ideation", "prototype", "proof of concept", "POC", "pilot", "MVP", "minimum viable product", "agile", "scrum", "sprint", "design thinking", "lean startup", "lean", "continuous improvement", "kaizen", "feedback loop", "iteration", "pivot", "A/B testing", "hypothesis", "psychological safety", "safe to fail", "tolerance", "courage", "bold", "disruptive", "resilience", "antifragile", "growth mindset", "learning culture", "knowledge sharing"],
                antiPatterns: ["table of contents", "page number", "copyright"]
            }
        ]
    },

    // ─── PARAMETER 7: DECENTRALIZED DECISION-MAKING ───
    {
        id: 7,
        theme: "Decentralized Decision-Making",
        triggers: ["empowerment", "team autonomy", "agile squads", "OKRs", "flat org", "self-managing teams", "distributed authority", "decentralized governance"],
        questions: [
            {
                id: "P7",
                title: "To what extent does the organization integrate decentralized decision making into its organizational systems?",
                rubric: [
                    { l: 1, t: "Linear", d: "Top-down command and control. Strict hierarchical structure. No or severely restricted employee autonomy. Communication flows exclusively top-down." },
                    { l: 2, t: "Partially Linear", d: "Some delegation in specialized functions (R&D, IT). Bureaucratic obstacles limit empowerment. Multi-disciplinary teams recognized but rarely formed." },
                    { l: 3, t: "Partially Exponential", d: "Decentralized decision-making in customer-facing areas. Emphasis on small, self-organizing teams. Cross-functional collaboration promoted. OKRs being adopted." },
                    { l: 4, t: "Emerging Exponential", d: "Decentralization is the norm across the wider organization. Empowered agile squads with end-to-end ownership. Self-organizing teams connecting with external networks." },
                    { l: 5, t: "Completely Exponential", d: "Fully decentralized except for Purpose, Vision, and Culture. DAO-like governance and smart contracts. Seamlessly connected with external ecosystems. Adaptive, self-managing teams at every level." }
                ],
                triggers: ["decentralized", "decentralization", "autonomy", "autonomous", "empowerment", "empowered", "self-organizing", "self-managing", "agile squads", "agile teams", "cross-functional", "multi-disciplinary", "flat", "flatter hierarchy", "flat organization", "hierarchy", "hierarchical", "top-down", "bottom-up", "delegation", "authority", "ownership", "accountability", "distributed", "distributed teams", "OKR", "objectives and key results", "DAO", "decentralized autonomous", "smart contract", "governance", "decision-making", "decision making", "consensus", "collaborative leadership", "servant leadership", "team lead", "squad", "tribe", "chapter", "guild", "matrix organization"],
                antiPatterns: ["table of contents", "page number", "copyright"]
            }
        ]
    }
];

const getDimensions = () => DIMENSIONS.flatMap(d =>
    d.questions.map(q => ({
        id: d.id,
        theme: d.theme,
        title: d.theme,
        question: q.title,
        questionId: q.id,
        rubric: q.rubric,
        triggers: q.triggers
    }))
);

module.exports = { DIMENSIONS, getDimensions };
