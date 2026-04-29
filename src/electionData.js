export const electionStages = [
    {
        id: "registration",
        title: "Voter Registration (Matdata Panjikaran)",
        description: "The foundation of democracy. Citizens register to ensure their voice is heard.",
        details: [
            "Eligibility: Indian citizens aged 18 and above.",
            "Form 6: Used for first-time voters to enroll in the electoral roll.",
            "Scale: India has over 960+ million registered voters, making it the world's largest democracy.",
            "EPIC: Voters are issued an Electors Photo Identity Card (Voter ID) to prevent fraud."
        ],
        quiz: {
            question: "What is the minimum age to register as a voter in India?",
            options: ["16 Years", "18 Years", "21 Years", "25 Years"],
            answer: 1 // 18 Years
        },
        scrollPos: 0
    },
    {
        id: "nomination",
        title: "Candidate Nomination",
        description: "Parties and individuals officially file their candidacy to contest the elections.",
        details: [
            "Affidavits: Candidates must publicly declare their criminal records, assets, and liabilities.",
            "Scrutiny: The Returning Officer checks papers for validity and can reject them if rules are broken.",
            "Security Deposit: Required to discourage non-serious candidates (forfeited if they get less than 1/6th of valid votes)."
        ],
        quiz: {
            question: "Can a candidate be rejected if they hide their criminal records in the affidavit?",
            options: ["No, it's personal", "Only if it's a minor crime", "Yes, absolute rejection", "Only after the election"],
            answer: 2
        },
        scrollPos: 25
    },
    {
        id: "campaigning",
        title: "Election Campaigning",
        description: "Rallies, speeches, and manifestos to win the hearts and minds of the public.",
        details: [
            "Model Code of Conduct (MCC): Strict rules enforced by the ECI to ensure a level playing field.",
            "Silence Period: Campaigning must stop 48 hours before polling begins.",
            "Expenditure Limits: Strict caps on how much a candidate can spend on their campaign."
        ],
        quiz: {
            question: "When must the 'Silence Period' begin before polling starts?",
            options: ["12 Hours", "24 Hours", "48 Hours", "72 Hours"],
            answer: 2
        },
        scrollPos: 50
    },
    {
        id: "voting",
        title: "The Polling Day (Matdan)",
        description: "Citizens cast their votes. The most critical day in the democratic process.",
        details: [
            "EVMs: Electronic Voting Machines ensure fast, secure, and accurate voting.",
            "VVPAT: Voter Verifiable Paper Audit Trail provides a printed slip for voters to verify their choice.",
            "Secrecy: Voting is completely secret. No one can find out who you voted for.",
            "NOTA: 'None of the Above' allows voters to formally reject all candidates."
        ],
        quiz: {
            question: "What does VVPAT provide to the voter?",
            options: ["A cash reward", "A printed confirmation slip", "A free meal", "A list of candidates"],
            answer: 1
        },
        scrollPos: 75
    },
    {
        id: "counting",
        title: "Results & Counting",
        description: "Votes are tallied securely, and the will of the people is revealed.",
        details: [
            "Strong Rooms: EVMs are kept under heavy 24/7 security before counting day.",
            "Process: Counting is done in the presence of candidate agents to ensure transparency.",
            "FPTP System: India follows the 'First Past The Post' system—the candidate with the highest votes wins, even without an absolute majority."
        ],
        quiz: {
            question: "Who is allowed to witness the counting process to ensure transparency?",
            options: ["Only the winner", "Anyone from the public", "Candidate agents", "Foreign observers only"],
            answer: 2
        },
        scrollPos: 100
    }
];

export const sampleScenarios = [
    "What happens if there is a tie in a constituency?",
    "Can a candidate contest from two seats simultaneously?",
    "What is the role of NOTA (None of the Above)?",
    "How does the model code of conduct work?"
];
