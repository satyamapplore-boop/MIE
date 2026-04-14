/**
 * MIE DETERMINISTIC DIMENSIONS & RUBRICS v3.0
 * HARDENED AUDIT ENGINE DATA (40-QUESTION SUITE)
 */

const DIMENSIONS = [
    // --- THEME 1: PURPOSE, VISION & CULTURE ---
    {
        id: 1,
        theme: "Purpose, Vision & Culture",
        questions: [
            {
                id: "Q1",
                title: "What is the nature and focus of the organization's Purpose / Vision / Mission?",
                rubric: [
                    { l: 1, t: "Linear", d: "The organization doesn't have a well defined Purpose OR the organization is focused on achieving good financial results by delivering products and services to the customers." },
                    { l: 2, t: "Partially Linear", d: "In addition to aiming for good financial results and delivering its products and services, the organization is driven by a set of core values with an emphasis on customer-centricity." },
                    { l: 3, t: "Partially Exponential", d: "Beyond serving end customers and achieving good financial results, the organization's purpose is to bring positive change to its employees as well as suppliers." },
                    { l: 4, t: "Emerging Exponential", d: "The organization's purpose is to create holistic value for different stakeholders: shareholders, customers, employees, suppliers, and society - both regionally and globally. And, the organization aims to do so by cohesively integrating people, profit, and the planet." },
                    { l: 5, t: "Completely Exponential", d: "The organization's purpose is to be a powerful force for global transformation, driving massive, transformative, and sustainable impact across society, the economy, and the environment." }
                ],
                triggers: ["purpose", "vision", "mission", "financial results", "customer-centricity", "positive change", "holistic value", "people, profit, and the planet", "powerful force for global transformation"]
            },
            {
                id: "Q2",
                title: "To what extent are the employees (permanent and non-permanent alike) and other external stakeholders (customers, suppliers, investors, society) inspired by the organization's Purpose as a force for good?",
                rubric: [
                    { l: 1, t: "Linear", d: "The organization doesn't have a clearly defined Purpose, and if it does exist, only a negligible proportion of employees and external stakeholders are aware of and appreciate it." },
                    { l: 2, t: "Partially Linear", d: "A notable portion of the employees and a small fraction of external stakeholders are aware of the Purpose, but there is a lack of widespread understanding and appreciation." },
                    { l: 3, t: "Partially Exponential", d: "The Purpose is widely recognized and valued by employees across the organization and some external stakeholder groups." },
                    { l: 4, t: "Emerging Exponential", d: "The Purpose serves as the guiding force within the organization, and a substantial proportion of the stakeholder groups deeply identify with it." },
                    { l: 5, t: "Completely Exponential", d: "The Purpose serves as the organization's guiding principle and deeply resonates with all stakeholder segments. BHAGs (big, hairy, audacious goals) are pursued." }
                ],
                triggers: ["employees", "stakeholders", "inspired", "force for good", "negligible proportion", "widespread understanding", "widely recognized", "guiding force", "BHAGs", "disruptive innovation"]
            },
            {
                id: "Q3",
                title: "To what extent are the organization's strategic and operational initiatives connected with its' Purpose?",
                rubric: [
                    { l: 1, t: "Linear", d: "A very negligible proportion of initiatives and actions are aligned to it." },
                    { l: 2, t: "Partially Linear", d: "Some of the strategic and operational initiatives are aligned with the organization's Purpose and steered by internal governance." },
                    { l: 3, t: "Partially Exponential", d: "Several strategic and operational initiatives are aligned. Some governance mechanisms established for key external stakeholders." },
                    { l: 4, t: "Emerging Exponential", d: "The majority of initiatives are meticulously aligned and serve as the cornerstone of the organizational approach." },
                    { l: 5, t: "Completely Exponential", d: "Ethos revolves around unwavering alignment in all strategic and operational endeavors. Ingrained in DNA, guiding every decision." }
                ],
                triggers: ["strategic", "operational", "initiatives", "connected", "alignment", "governance", "cornerstone", "ingrained in DNA", "DNA", "decision and action"]
            },
            {
                id: "Q4",
                title: "To what extent is the organization's culture aligned with its Purpose, and the desired behaviours recognized?",
                rubric: [
                    { l: 1, t: "Linear", d: "No defined set of core values, and it does not appreciate the need to build a specific culture." },
                    { l: 2, t: "Partially Linear", d: "Values focused on financial performance, customer-centricity, and safety. Infrequent acknowledgement of behaviors." },
                    { l: 3, t: "Partially Exponential", d: "Values focused on accountability, empowerment, teamwork, and adaptability. Recognition is frequent but inconsistent." },
                    { l: 4, t: "Emerging Exponential", d: "Values focused on employee fulfillment, creativity, integrity, and transparency serve as a guiding force." },
                    { l: 5, t: "Completely Exponential", d: "Values focused on innovation, ethics, compassion, and social responsibility are deeply embedded in DNA." }
                ],
                triggers: ["culture", "behaviors", "core values", "financial performance", "accountability", "empowerment", "creativity", "integrity", "transparency", "compassion", "social responsibility", "deeply embedded"]
            }
        ]
    },
    // --- THEME 2: WORKFORCE & EXTERNAL RESOURCES ---
    {
        id: 2,
        theme: "Workforce & External Resources",
        questions: [
            {
                id: "Q5",
                title: "To what extent does the organization use full time employees vs. contractual/on-demand/non-permanent employees?",
                rubric: [
                    { l: 1, t: "Linear", d: "Predominantly relies on full-time employees. Limited utilization of contractual or non-permanent employees." },
                    { l: 2, t: "Partially Linear", d: "Primarily employs full-time staff, with occasional ad-hoc utilization of contractual employees for specific tasks." },
                    { l: 3, t: "Partially Exponential", d: "Employs a mix of full-time and contractual employees, leveraging them for specialized projects." },
                    { l: 4, t: "Emerging Exponential", d: "Actively embraces a workforce model with a substantial percentage of contractual/on-demand employees." },
                    { l: 5, t: "Completely Exponential", d: "Strongly prefers mostly contractual/on-demand employees in addition to a small full-time core team." }
                ],
                triggers: ["full time", "contractual", "on-demand", "non-permanent", "staff", "workforce model", "flexible workforce", "on-demand employees", "core team"]
            },
            {
                id: "Q6",
                title: "To what extent does the organization use external resources (contractual/on-demand/non-permanent employees) to perform critical business functions?",
                rubric: [
                    { l: 1, t: "Linear", d: "Predominantly relies on internal resources. Minimal utilization of external resources." },
                    { l: 2, t: "Partially Linear", d: "Limited use in administrative and support business functions (e.g., Accounts, Customer Service)." },
                    { l: 3, t: "Partially Exponential", d: "Engages external resources even in critical functions such as Operations/Manufacturing and IT." },
                    { l: 4, t: "Emerging Exponential", d: "Strategically engages external resources across various critical functions, including HR, Legal, Compliance, Finance." },
                    { l: 5, t: "Completely Exponential", d: "External resources deployed across all critical business functions, including Innovation, R&D, and Strategy." }
                ],
                triggers: ["external resources", "internal resources", "critical business functions", "outsourced", "supplement internal capabilities", "Finance", "Sales/Marketing", "R&D", "Strategy"]
            },
            {
                id: "Q7",
                title: "To what extent does the organization integrate the external resources (contractual/on-demand/non-permanent employees) similar to its internal employees?",
                rubric: [
                    { l: 1, t: "Linear", d: "No structured processes or systems in place to onboard, manage, and integrate external resources." },
                    { l: 2, t: "Partially Linear", d: "Arms-length relationship maintained. Focused primarily on performance management." },
                    { l: 3, t: "Partially Exponential", d: "Actively integrates critical external resources through structured mechanisms (meetings, operational decisions)." },
                    { l: 4, t: "Emerging Exponential", d: "Seamlessly extends most policies and processes (e.g., performance assessment) to external resources." },
                    { l: 5, t: "Completely Exponential", d: "All relevant people policies and systems are comprehensively extended to all external resources." }
                ],
                triggers: ["integrate", "onboard", "manage", "arms-length", "performance management", "training programs", "team meetings", "operational decisions", "policies and processes", "extension of policies"]
            }
        ]
    },
    // --- THEME 3: STAKEHOLDER MANAGEMENT & COMMUNITY ---
    {
        id: 3,
        theme: "Stakeholder Management & Community",
        questions: [
            {
                id: "Q8",
                title: "To what extent does the organization identify and segment the stakeholders based on defined criteria?",
                rubric: [
                    { l: 1, t: "Linear", d: "Recognizes stakeholders but relies on a ‘one-size-fits-all’ approach. Small role-based categorizing." },
                    { l: 2, t: "Partially Linear", d: "Segmenting into broad groups based on general characteristics, though uses limited behavioral data." },
                    { l: 3, t: "Partially Exponential", d: "Adopting a structured approach using data-driven insights (influence, needs, capabilities)." },
                    { l: 4, t: "Emerging Exponential", d: "Approach is comprehensive and integrated. Uses real-time data and predictive modeling to dynamically segment." },
                    { l: 5, t: "Completely Exponential", d: "Incorporates ecosystem fit and shared values. Stakeholder management embedded in all operations." }
                ],
                triggers: ["segment the stakeholders", "criteria", "one-size-fits-all", "demographic", "geographic", "data-driven insights", "predictive modeling", "ecosystem fit", "shared values"]
            },
            {
                id: "Q9",
                title: "To what extent does the different internal and external stakeholders (customers, partners and suppliers, internal and external employees, investors, government agencies) have a clear sense of belonging to the organization’s Purpose?",
                rubric: [
                    { l: 1, t: "Linear", d: "Minimal communication about Purpose. Stakeholders not aware and have no participation." },
                    { l: 2, t: "Partially Linear", d: "Inconsistent communication. Limited opportunities for participation. Shared experiences created inconsistently." },
                    { l: 3, t: "Partially Exponential", d: "Actively and consistently communicates. Values becoming aligned. Frequent shared experiences." },
                    { l: 4, t: "Emerging Exponential", d: "Belongingness recognized as imperative. Stakeholders empowered to contribute actively." },
                    { l: 5, t: "Completely Exponential", d: "Feel a profound sense of belonging. Stakeholder voices integrated at every level." }
                ],
                triggers: ["sense of belonging", "belonging", "communication", "participation", "recognition", "shared experiences", "empowered", "profound sense", "integrated at every level"]
            },
            {
                id: "Q10",
                title: "To what extent does the organization actively nurtures a community amongst its Stakeholders (users, customers, partners, fans)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Transactional manner. Focus primarily on day-to-day operations without considering deeper stakeholder needs." },
                    { l: 2, t: "Partially Linear", d: "Recognizes importance, but interactions are limited, mostly reactive, and one-sided." },
                    { l: 3, t: "Partially Exponential", d: "Proactive approach. Dedicated resources for community management. Measures engagement and satisfaction." },
                    { l: 4, t: "Emerging Exponential", d: "Nurturing stakeholders as a strategic priority. Targeted and personalized interactions." },
                    { l: 5, t: "Completely Exponential", d: "Transcends mere management. Actively nurtures and co-creates. Stakeholder led initiatives drive change." }
                ],
                triggers: ["nurtures a community", "Stakeholders", "dedicated resources", "community management", "engagement and satisfaction", "targeted", "personalized", "co-creates", "transformative change"]
            },
            {
                id: "Q11",
                title: "To what extent does the organization communicate and collaborate with its' external stakeholders (customers, partners, suppliers, investors, government agencies, etc.)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Limited, ad-hoc, mostly 'one-way' (newsletters, social media). Low listening or response." },
                    { l: 2, t: "Partially Linear", d: "Inconsistent. 'One-to-many' communication (webinars, town halls). Occasional surveys." },
                    { l: 3, t: "Partially Exponential", d: "Strategic approach. Communication getting decentralized and 'many to many' (online forums)." },
                    { l: 4, t: "Emerging Exponential", d: "Dialogue and collaboration as core strategy. Collaborative 'many-to-many' model. Hosts hackathons." },
                    { l: 5, t: "Completely Exponential", d: "Flows seamlessly in a networked 'many-to-many' model. Collaboration deeply ingrained in ways of working." }
                ],
                triggers: ["communicate and collaborate", "one-way", "one-to-many", "many to many", "forums", "hackathons", "ideation sessions", "networked", "co-creating value"]
            }
        ]
    },
    // --- THEME 4: PRODUCTS, DATA & TECHNOLOGY ---
    {
        id: 4,
        theme: "Products, Data & Technology",
        questions: [
            {
                id: "Q12",
                title: "To what extent are the organization's products and services information-based or information-enabled?",
                rubric: [
                    { l: 1, t: "Linear", d: "Primarily physical/analog. Minimal integration of data into value proposition." },
                    { l: 2, t: "Partially Linear", d: "Physical products, but production/delivery is information-based. Not fully integrated." },
                    { l: 3, t: "Partially Exponential", d: "Investing in integrating data into products and the value chain to optimize performance." },
                    { l: 4, t: "Emerging Exponential", d: "Data, information, and analytics are at the core of value proposition design and delivery." },
                    { l: 5, t: "Completely Exponential", d: "AI integrated into all aspects. Primary drivers of value and differentiation." }
                ],
                triggers: ["information-based", "information-enabled", "physical/analog", "value chain", "analytics", "design and delivery", "Artificial Intelligence", "differentiation"]
            },
            {
                id: "Q13",
                title: "To what extent does the organization use algorithms (artificial intelligence, machine learning, deep learning) to make meaningful decisions and actions?",
                rubric: [
                    { l: 1, t: "Linear", d: "Manual decision-making with minimal use of algorithms. Data analysis is basic." },
                    { l: 2, t: "Partially Linear", d: "Recognizes benefits, but efforts are fragmented and inconsistent. Basic tools generate insights." },
                    { l: 3, t: "Partially Exponential", d: "Leverage algorithms across different processes. Advanced analytics to convert data into insights." },
                    { l: 4, t: "Emerging Exponential", d: "Algorithms as an integral component. Predictive solutions deployed for consistent delivery." },
                    { l: 5, t: "Completely Exponential", d: "Algorithms ingrained in 'ways of working'. Operating at forefront of algorithmic capabilities." }
                ],
                triggers: ["algorithms", "artificial intelligence", "machine learning", "deep learning", "manual decision-making", "advanced analytics", "predictive", "ways of working", "algorithmic capabilities"]
            },
            {
                id: "Q14",
                title: "To what extent does the organization share strategic data assets internally and externally with its community(staff on demand, suppliers and partners, customers)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Operates in a closed manner. Data is siloed within individual departments." },
                    { l: 2, t: "Partially Linear", d: "Efforts to share within the organization, but limited and fragmented. Exchange on need-to-know basis." },
                    { l: 3, t: "Partially Exponential", d: "Exposes relevant data to external ecosystem (APIs). Proactive approach. Growing recognition." },
                    { l: 4, t: "Emerging Exponential", d: "Sharing as a strategic imperative. Seamless and pervasive internal sharing. Co-create value externally." },
                    { l: 5, t: "Completely Exponential", d: "Embraces open data sharing internally and externally. Data becomes a strategic asset driving growth." }
                ],
                triggers: ["share strategic data", "internally and externally", "siloed", "open APIs", "strategic imperative", "co-create value", "trusted and transparent", "data-driven economy"]
            },
            {
                id: "Q15",
                title: "To what extent does the organization leverage different disruptive technologies ((e.g. 3D Printing, IOT, Drones, BlockChain, Crypto, Genome, etc.)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Lack of initiative or investment. Primarily relies on traditional methods and technologies." },
                    { l: 2, t: "Partially Linear", d: "Shows some interest but level of investment and exploration remains limited." },
                    { l: 3, t: "Partially Exponential", d: "Active interest, begins to invest resources. Emergence of pilot projects aimed at testing feasibility." },
                    { l: 4, t: "Emerging Exponential", d: "Significantly ramps up investment. Strong commitment. Dedicated resources for R&D." },
                    { l: 5, t: "Completely Exponential", d: "Pioneers technologies. Investing heavily. Leads industry in adoption (e.g., IoT, Blockchain)." }
                ],
                triggers: ["disruptive technologies", "3D Printing", "IOT", "Drones", "BlockChain", "Crypto", "Genome", "pilot projects", "R&D", "pioneers", "heavy investment"]
            }
        ]
    },
    // --- THEME 5: ASSET STRATEGY ---
    {
        id: 5,
        theme: "Asset Strategy",
        questions: [
            {
                id: "Q16",
                title: "To what extent does the organization own vs. rent/lease the physical and digital assets?",
                rubric: [
                    { l: 1, t: "Linear", d: "Predominantly owns all assets. Hesitant to explore renting/leasing options." },
                    { l: 2, t: "Partially Linear", d: "Ownership remains primary. Some equipment/services accessed on demand (e.g. cloud)." },
                    { l: 3, t: "Partially Exponential", d: "Hybrid approach: owning core assets while renting/leasing supplementary assets." },
                    { l: 4, t: "Emerging Exponential", d: "Ownership no longer default. Embraces renting/leasing as strategic for flexibility." },
                    { l: 5, t: "Completely Exponential", d: "Leveraging external assets even in mission-critical areas. Digital twins used to optimize." }
                ],
                triggers: ["own vs. rent/lease", "ownership", "renting/leasing", "cloud computing", "hybrid approach", "strategic component", "external assets", "predictive analytics"]
            },
            {
                id: "Q17",
                title: "To what extent does the organization maximize the assets (physical and digital) utilization?",
                rubric: [
                    { l: 1, t: "Linear", d: "Limited focus. Little emphasis on efficiency. Lack of tools to track usage effectively." },
                    { l: 2, t: "Partially Linear", d: "Efforts made, but not integrated. Deploying methodologies such as Lean or Six Sigma ad-hoc." },
                    { l: 3, t: "Partially Exponential", d: "Actively seeks to maximize through continuous improvement and monitoring systems." },
                    { l: 4, t: "Emerging Exponential", d: "Culture of continuous improvement. Real-time monitoring and advanced analytics employed." },
                    { l: 5, t: "Completely Exponential", d: "Excels through advanced tech and digital twins. Ecosystem orchestrating for value creation." }
                ],
                triggers: ["assets", "utilization", "efficiency", "maximize", "TPM", "Lean Six Sigma", "Kaizen", "real-time monitoring", "digital twins"]
            },
            {
                id: "Q18",
                title: "To what extent is the organization utilizing assets (physical and digital) as a service ?",
                rubric: [
                    { l: 1, t: "Linear", d: "Traditional ownership models with little consideration for asset-as-a-service." },
                    { l: 2, t: "Partially Linear", d: "Experimenting with leasing under-utilized assets (e.g., workspaces)." },
                    { l: 3, t: "Partially Exponential", d: "Actively embraces asset-as-a-service (e.g., testing equipment, bench staff)." },
                    { l: 4, t: "Emerging Exponential", d: "Fully integrates asset-as-a-service into strategy. Lifecycle management practices established." },
                    { l: 5, t: "Completely Exponential", d: "Paradigm shift. Meticulously tracks lifecycle. Contribution to circular economy sustainable future." }
                ],
                triggers: ["assets as a service", "asset-as-a-service", "usage-based models", "lifecycle management", "circular economy", "sustainable future"]
            }
        ]
    },
    // --- THEME 6: STAKEHOLDER ENGAGEMENT ---
    {
        id: 6,
        theme: "Stakeholder Engagement",
        questions: [
            {
                id: "Q19",
                title: "To what extent does the organization drive strategic engagement with its stakeholders (customers, internal and external employees, business and governing stakeholders, investors, society, and key suppliers and partners) for mutual benefits?",
                rubric: [
                    { l: 1, t: "Linear", d: "Engagement at a very transactional level (sales, mandatory reporting)." },
                    { l: 2, t: "Partially Linear", d: "Some efforts (feedback,regular meetings), but lack consistent approach and integration." },
                    { l: 3, t: "Partially Exponential", d: "Developed robust processes. Formalized engagement strategy focusing on leveraging strengths." },
                    { l: 4, t: "Emerging Exponential", d: "Strategically engages through fully integrated processes for holistic and sustainable impact." },
                    { l: 5, t: "Completely Exponential", d: "Dedicated strategies to nurture relationships. Aligned with Purpose to address global challenges." }
                ],
                triggers: ["strategic engagement", "mutual benefit", "transactional", "career development", "engagement strategy", "holistic", "nurture relationships", "global challenges"]
            },
            {
                id: "Q20",
                title: "To what extent does the organization use gamification and/or incentive competitions to engage with external and internal stakeholders (customers, internal and external employees, business and governing stakeholders, investors, society, and key suppliers and partners)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Does not utilize gamification or incentive competitions." },
                    { l: 2, t: "Partially Linear", d: "Some efforts (loyalty programs, incentives), but not consistently executed or optimized." },
                    { l: 3, t: "Partially Exponential", d: "Growing adoption of gamification to drive engagement. Integrated manner." },
                    { l: 4, t: "Emerging Exponential", d: "Fully integrates incentive competitions. Deeply embedded in 'ways of working'." },
                    { l: 5, t: "Completely Exponential", d: "Part of DNA. Self-sustaining and community-driven. Focus on purpose and participation." }
                ],
                triggers: ["gamification", "incentive competitions", "loyalty programs", "leaderboard", "ways of working", "hackathons", "DNA"]
            },
            {
                id: "Q21",
                title: "To what extent is social functionality a part of the organization's product/service offerings?",
                rubric: [
                    { l: 1, t: "Linear", d: "Simple online presence. Lack of knowledge to leverage social functionality." },
                    { l: 2, t: "Partially Linear", d: "Add-on structures (social media pages). Not critical for customer experience." },
                    { l: 3, t: "Partially Exponential", d: "Social features used actively to enhance offerings. Online forums/communities established." },
                    { l: 4, t: "Emerging Exponential", d: "Seamlessly embedded throughout the customer-experience journey." },
                    { l: 5, t: "Completely Exponential", d: "Integral and differentiating element. User-generated content driving engagement." }
                ],
                triggers: ["social functionality", "social media", "customer experience", "forums", "communities", "embedded", "user-generated content"]
            },
            {
                id: "Q22",
                title: "To what extent does the organization actively convert the broader public into core group of stakeholders (customers, employees, partners, investors, etc.)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Passive spectators. Interactions minimal and unstructured." },
                    { l: 2, t: "Partially Linear", d: "Occasional PR techniques (social media, events). Little emphasis on call to action." },
                    { l: 3, t: "Partially Exponential", d: "Actively implements strategies (crowdsourcing, community spaces) to connect." },
                    { l: 4, t: "Emerging Exponential", d: "Strategic view. Integrated efforts to convert, leveraging data analytics." },
                    { l: 5, t: "Completely Exponential", d: "Excels in converting. Pervasive deep loyalty and commitment. Continuous innovation." }
                ],
                triggers: ["convert the broader public", "core group", "passive", "PR", "crowdsourcing", "community spaces", "data analytics", "loyalty", "conversion initiatives"]
            }
        ]
    },
    // --- THEME 7: SUSTAINABILITY & EXTERNAL INTEGRATION ---
    {
        id: 7,
        theme: "Sustainability & External Integration",
        questions: [
            {
                id: "Q23",
                title: "To what extent does the organization internalize the external growth drivers and sustainable practices into the organization's strategy and manage risks?",
                rubric: [
                    { l: 1, t: "Linear", d: "Minimal interest in monitoring landscape (megatrends). No efforts for SDGs." },
                    { l: 2, t: "Partially Linear", d: "Sporadically scans. Inconsistent analysis. Limited awareness of SDGs." },
                    { l: 3, t: "Partially Exponential", d: "Invests in understanding landscape dynamics and scenario analysis. Early stage sustainable practices." },
                    { l: 4, t: "Emerging Exponential", d: "Scanning and scenario/risk analysis comprehensive and integrated into strategy." },
                    { l: 5, t: "Completely Exponential", d: "Rigorous research on megatrends. Sustainability (SDGs, Circular Economy) deeply embedded." }
                ],
                triggers: ["growth drivers", "sustainable practices", "risks", "landscape", "megatrends", "SDGs", "scenario analysis", "circular economy"]
            },
            {
                id: "Q24",
                title: "To what extent does the organization use specialized processes to integrate the outputs of externalities (external employees, suppliers and partners, customers)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Siloed interactions. Outputs consumed in unstructured/inconsistent manner." },
                    { l: 2, t: "Partially Linear", d: "Structuring but resource-intensive. Inefficient filtering and matching." },
                    { l: 3, t: "Partially Exponential", d: "Established automated processes for filtering and consuming externalities' outputs." },
                    { l: 4, t: "Emerging Exponential", d: "Automated and robust processes. Transparent interactions foster openness and trust." },
                    { l: 5, t: "Completely Exponential", d: "Seamless interactions across various value streams. Remarkable resilience and commitment." }
                ],
                triggers: ["externalities", "integrate", "outputs", "filtering", "matching", "automated processes", "openness and trust", "value streams"]
            },
            {
                id: "Q25",
                title: "To what extent are the key internal and external organizational processes adaptable, scalable, sustainable, and aligned to the purpose and strategic priorities?",
                rubric: [
                    { l: 1, t: "Linear", d: "Predominantly relies on non-standardized manual processes. Inefficiencies." },
                    { l: 2, t: "Partially Linear", d: "Lean Six Sigma efforts underway. Some recognition of value-chain impact." },
                    { l: 3, t: "Partially Exponential", d: "Standardizing and automating processes. Standardized value-chain." },
                    { l: 4, t: "Emerging Exponential", d: "Adopted enterprise architecture. Design and optimize value-streams." },
                    { l: 5, t: "Completely Exponential", d: "Performance through self-provisioning. Scalable digital systems. Holistic sustainability excellence." }
                ],
                triggers: ["processes", "adaptable", "scalable", "sustainable", "manual", "Lean Six Sigma", "value-chain", "enterprise architecture", "self-provisioning", "holistic sustainability"]
            }
        ]
    },
    // --- THEME 8: PLATFORM & PERFORMANCE ---
    {
        id: 8,
        theme: "Platform & Performance",
        questions: [
            {
                id: "Q26",
                title: "To what extent does the organization operate as a platform or an ecosystem?",
                rubric: [
                    { l: 1, t: "Linear", d: "Operates with siloed product and service lines. Minimal awareness of platform model." },
                    { l: 2, t: "Partially Linear", d: "Recognition of potential for platform model, but concrete steps not yet taken." },
                    { l: 3, t: "Partially Exponential", d: "Actively exploring transition into a platform. Ongoing initiatives and investments." },
                    { l: 4, t: "Emerging Exponential", d: "Actively transforming into platform or expanding capabilities." },
                    { l: 5, t: "Completely Exponential", d: "Functions as a dynamic platform/ecosystem. Driving holistic growth for all constituents." }
                ],
                triggers: ["platform", "ecosystem", "siloed", "potential", "transition", "expansion", "dynamic platform", "constituents"]
            },
            {
                id: "Q27",
                title: "To what extent does the organization translate its strategic priorities into transformation objectives and performance targets?",
                rubric: [
                    { l: 1, t: "Linear", d: "Implementation based more on intuition. Targets vague or disconnected." },
                    { l: 2, t: "Partially Linear", d: "Began to developTargets, but process not fully systematic. Lack specificity." },
                    { l: 3, t: "Partially Exponential", d: "Structured approach to setting performance targets, with partial alignment." },
                    { l: 4, t: "Emerging Exponential", d: "Fully integrated data-driven monitoring for precise performance targets." },
                    { l: 5, t: "Completely Exponential", d: "Excels in translating to data-driven targets, leveraging AI and real-time monitoring." }
                ],
                triggers: ["strategic priorities", "transformation objectives", "performance targets", "intuition", "systematic", "data-driven monitoring", "AI", "real-time monitoring"]
            },
            {
                id: "Q28",
                title: "To what extent does the organization track and analyze the overall business performance, specifically the innovation portfolio?",
                rubric: [
                    { l: 1, t: "Linear", d: "Tracks only basic business metrics. archaic IT systems, prone to quality issues." },
                    { l: 2, t: "Partially Linear", d: "Metrics in place for financial / some stakeholder perception, but short-term focus." },
                    { l: 3, t: "Partially Exponential", d: "Financial and non-financial metrics. Enterprise solution leveraged for analysis." },
                    { l: 4, t: "Emerging Exponential", d: "Advanced Innovation metrics (CAC, LTV, NPS). Predictive scenario impact analysis." },
                    { l: 5, t: "Completely Exponential", d: "Balanced suite of metrics. Advanced analytics and visualization to understand cause-and-effect." }
                ],
                triggers: ["track and analyze", "business performance", "innovation portfolio", "metrics", "financial and non-financial", "innovation metrics", "predictive", "cause-and-effect"]
            },
            {
                id: "Q29",
                title: "To what extent are the performance and transformation management systems integrated through Objectives and Key Results (OKRs)?",
                rubric: [
                    { l: 1, t: "Linear", d: "Relies on annual performance reviews. No or little use of OKRs." },
                    { l: 2, t: "Partially Linear", d: "OKRs adopted but used inconsistently or superficially." },
                    { l: 3, t: "Partially Exponential", d: "Started to embrace OKRs systematically. Effort to align goals." },
                    { l: 4, t: "Emerging Exponential", d: "OKRs consistently deployed. Performance tracking systematic and transparent." },
                    { l: 5, t: "Completely Exponential", d: "OKRs fully integrated into 'ways of working'. Cohesively aligned to Purpose and Strategy." }
                ],
                triggers: ["performance and transformation", "management systems", "OKRs", "annual review", "clarity and alignment", "objective tracking", "ways of working"]
            }
        ]
    },
    // --- THEME 9: INNOVATION & EXPERIMENTATION ---
    {
        id: 9,
        theme: "Innovation & Experimentation",
        questions: [
            {
                id: "Q30",
                title: "To what extent does the organization innovate strategically and implements Design Thinking, Lean Startup and Agile or other similar approaches?",
                rubric: [
                    { l: 1, t: "Linear", d: "Focused on existing products. No human-centric innovation approach." },
                    { l: 2, t: "Partially Linear", d: "Appreciation for design methodologies, but deployed only in limited manner." },
                    { l: 3, t: "Partially Exponential", d: "Embracing methodologies actively, but projects are not integrated." },
                    { l: 4, t: "Emerging Exponential", d: "Deeply ingrained methods driving value proposition innovation." },
                    { l: 5, t: "Completely Exponential", d: "Strategically evolves portfolio. Integrated end-to-end SPRINTs across broader organization." }
                ],
                triggers: ["innovate strategically", "Design Thinking", "Lean Startup", "Agile", "SPRINTs", "human-centric", "outside-in", "innovation culture"]
            },
            {
                id: "Q31",
                title: "To what extent does the organization constantly optimize processes through experimentation and short feedback loops? ",
                rubric: [
                    { l: 1, t: "Linear", d: "Relies on adhoc analysis and solutioning. Long feedback loops." },
                    { l: 2, t: "Partially Linear", d: "Occasionally leverages randomized experiments (A/B testing), but unsystematic." },
                    { l: 3, t: "Partially Exponential", d: "Actively and systematically embraces hypothesis design and short feedback loops." },
                    { l: 4, t: "Emerging Exponential", d: "Experimentation integral to 'ways of working'. Agility and resilience." },
                    { l: 5, t: "Completely Exponential", d: "Leveraging AI and synthetic data. Short feedback loops deeply ingrained in DNA." }
                ],
                triggers: ["experimentation", "short feedback loops", "A/B testing", "DOE", "hypothesis design", "ways of working", "AI", "synthetic data", "DNA"]
            },
            {
                id: "Q32",
                title: "To what extent does the organization foster a culture of Innovation and Adaptation ? ",
                rubric: [
                    { l: 1, t: "Linear", d: "No emphasis on testing new ideas. Sporadic adoption of innovative practices." },
                    { l: 2, t: "Partially Linear", d: "Some encouragement, but lacks consistency and alignment." },
                    { l: 3, t: "Partially Exponential", d: "Encouragement becoming widespread. Building culture of 'doing innovation'." },
                    { l: 4, t: "Emerging Exponential", d: "Testing ideas part of 'ways of working'. Pervasive adoption." },
                    { l: 5, t: "Completely Exponential", d: "Strong emphasis on disruptive innovation. Deeply integrated into all dimensions." }
                ],
                triggers: ["culture of Innovation", "Innovation and Adaptation", "doing innovation", "being innovative", "disruptive innovation", "embedded in 'ways of working'"]
            }
        ]
    },
    // --- THEME 10: RISK, CULTURE & DECISION-MAKING ---
    {
        id: 10,
        theme: "Risk, Culture & Decision-Making",
        questions: [
            {
                id: "Q33",
                title: "To what extent does the organization tolerate failure and encourage risk-taking?",
                rubric: [
                    { l: 1, t: "Linear", d: "Minimal learning and innovation. Failure considered career-limiting." },
                    { l: 2, t: "Partially Linear", d: "Some risk-taking present but limited and sporadic. Risk-averse culture." },
                    { l: 3, t: "Partially Exponential", d: "Failure and risk allowed, but sandboxed within boundaries." },
                    { l: 4, t: "Emerging Exponential", d: "Proactive approach to learning. Risk-taking aligned with strategic priorities." },
                    { l: 5, t: "Completely Exponential", d: "Failure and risk-taking expected and celebrated. Empowered bold ideas." }
                ],
                triggers: ["tolerate failure", "risk-taking", "career-limiting", "risk-averse", "sandboxed", "learning from failures", "ways of working", "bold ideas"]
            },
            {
                id: "Q34",
                title: "To what extent does the organization integrate decentralized decision making into its organizational systems?",
                rubric: [
                    { l: 1, t: "Linear", d: "Top-down command and control. No or restricted autonomy." },
                    { l: 2, t: "Partially Linear", d: "Some efforts to adopt, but limited to specialized functions (e.g., R&D)." },
                    { l: 3, t: "Partially Exponential", d: "Decentralized decision-making in customer-facing areas, but not across wider organization." },
                    { l: 4, t: "Emerging Exponential", d: "Norm across wider organization. Empowered and agile teams." },
                    { l: 5, t: "Completely Exponential", d: "Decentralized except Purpose, Vision, Culture. DAOs and smart contracts." }
                ],
                triggers: ["decentralized decision making", "command and control", "autonomy", "empowered", "DAOs", "smart contracts", "autonomous teams"]
            },
            {
                id: "Q35",
                title: "To what extent is the organization and its connection with external agencies, based on self-organizing and multi-disciplinary team structures ? ",
                rubric: [
                    { l: 1, t: "Linear", d: "Hierarchy and silos. Communication flowing top-down." },
                    { l: 2, t: "Partially Linear", d: "Some recognition of multi-disciplinary teams. bureaucratic obstacles." },
                    { l: 3, t: "Partially Exponential", d: "Emphasis on small, self-organizing teams making decisions autonomously." },
                    { l: 4, t: "Emerging Exponential", d: "Embraces self-organizing teams connecting with external networks." },
                    { l: 5, t: "Completely Exponential", d: "Seamlessly connected with external ecosystems. Adaptive teams." }
                ],
                triggers: ["self-organizing", "multi-disciplinary", "hierarchical", "cross-functional silos", "autonomous teams", "external networks", "adaptive"]
            }
        ]
    },
    // --- THEME 11: LEADERSHIP & ECOSYSTEMS ---
    {
        id: 11,
        theme: "Leadership & Ecosystems",
        questions: [
            {
                id: "Q36",
                title: "To what extent is the organization's leadership proactively driving disruptive innovation and transformation initiatives?",
                rubric: [
                    { l: 1, t: "Linear", d: "Satisfied with status quo. No proactive thinking around existential threats." },
                    { l: 2, t: "Partially Linear", d: "Some leaders focus but efforts are isolated and reactive." },
                    { l: 3, t: "Partially Exponential", d: "Focus on detection/response. Constrained by legacy structures." },
                    { l: 4, t: "Emerging Exponential", d: "Leadership actively sponsors innovation. Change imperative." },
                    { l: 5, t: "Completely Exponential", d: "Innovation and transformation to survive. Change part of DNA." }
                ],
                triggers: ["leadership", "disruptive innovation", "transformation initiatives", "status quo", "existential threats", "resilience-building", "sponsors innovation", "change part of DNA", "DNA"]
            },
            {
                id: "Q37",
                title: "To what extent does the organization leverage external ecosystems for innovation?",
                rubric: [
                    { l: 1, t: "Linear", d: "Innovation handled within business units. limited involvement." },
                    { l: 2, t: "Partially Linear", d: "Dedicated R&D team. Importance of cross-functional recognized but constrained." },
                    { l: 3, t: "Partially Exponential", d: "Established an incubator (or partners with one). Cross-functional collaboration promoted." },
                    { l: 4, t: "Emerging Exponential", d: "Collaboration democratized. CVC (corporate venture capital) arm and startups connect." },
                    { l: 5, t: "Completely Exponential", d: "Multiple global incubators. vibrant CVC arm to drive innovation." }
                ],
                triggers: ["external ecosystems", "Innovation", "R&D team", "incubator", "startups", "scale-ups", "CVC", "corporate venture capital"]
            }
        ]
    },
    // --- THEME 12: TECHNOLOGY & KNOWLEDGE ---
    {
        id: 12,
        theme: "Technology & Knowledge",
        questions: [
            {
                id: "Q38",
                title: "To what extent does the organization use technologies for knowledge-sharing, communication, and workflow management?",
                rubric: [
                    { l: 1, t: "Linear", d: "Traditional tools (email). Knowledge-sharing tools non-existent or fragmented." },
                    { l: 2, t: "Partially Linear", d: "Basic sharing tools (SharePoint). Not integrated into workflows." },
                    { l: 3, t: "Partially Exponential", d: "Widely deployed tools (Slack, Discord, Notion) integrated to large extent." },
                    { l: 4, t: "Emerging Exponential", d: "Extensively integrates tools/APIs. Reduced time between obtaining and deciding." },
                    { l: 5, t: "Completely Exponential", d: "State-of-the-art platforms and AI deeply embedded in architecture." }
                ],
                triggers: ["knowledge-sharing", "communication", "workflow management", "email", "SharePoint", "Slack", "Discord", "Notion", "APIs", "embedded in business architecture"]
            },
            {
                id: "Q39",
                title: "To what extent does the organization leverage technologies to gather feedback, co-create solutions with customers and suppliers?",
                rubric: [
                    { l: 1, t: "Linear", d: "Little emphasis on leveraging technology to gather feedback or co-create." },
                    { l: 2, t: "Partially Linear", d: "Sporadically leverages for project-specific tactical feedback." },
                    { l: 3, t: "Partially Exponential", d: "Structured collaborative solution initiatives leveraging crowdsourcing platforms." },
                    { l: 4, t: "Emerging Exponential", d: "Integrated data-driven insights. Cross-sector partnerships and open innovation." },
                    { l: 5, t: "Completely Exponential", d: "Technology-enabled feedback reshaping industry landscape. Systemic impact." }
                ],
                triggers: ["gather feedback", "co-create solutions", "crowdsourcing platforms", "open innovation", "data-driven insights", "systemic impact"]
            },
            {
                id: "Q40",
                title: "To what extent does the organization strategically harness online and offline platforms (app stores, social media, and market places) for networking and influence? ",
                rubric: [
                    { l: 1, t: "Linear", d: "Little emphasis. Lack of cohesive strategy for networking image." },
                    { l: 2, t: "Partially Linear", d: "Transactional/uncoordinated. Basic online presence and offline events." },
                    { l: 3, t: "Partially Exponential", d: "Integrated approach to leveraging platforms. Articulates unique differentiators." },
                    { l: 4, t: "Emerging Exponential", d: "Strategic and integrated networking. Compelling value proposition." },
                    { l: 5, t: "Completely Exponential", d: "Deeply embedded ways of working. Cutting-edge (AR/VR, AI bots) personalized networking." }
                ],
                triggers: ["harness online and offline platforms", "app stores", "social media", "market places", "networking and influence", "differentiators", "AR/VR", "AI bots", "personalized experiences"]
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
