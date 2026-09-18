/**
 * chatbot-data.js
 * -----------------------------------------------------------------------
 * Knowledge base for the portfolio's FAQ assistant.
 *
 * Each intent has:
 *   - id: internal name
 *   - keywords: words/phrases that should trigger this intent (lowercase)
 *   - weight: optional boost for stronger signal words (default 1)
 *   - response: what the bot says, plain text (HTML-escaped by script.js)
 *
 * To teach the bot something new: add an intent object to CHATBOT_INTENTS.
 * No other code needs to change — script.js scores every intent against
 * the visitor's message and replies with the best match.
 * -----------------------------------------------------------------------
 */

const CHATBOT_INTENTS = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "yo", "sup", "good morning", "good afternoon"],
    response: "Hey! I'm a small FAQ bot trained on Ethan's resume. Ask me about his skills, projects, experience, education, or how to get in touch.",
  },
  {
    id: "skills",
    keywords: ["skill", "skills", "know", "good at", "tech stack", "technologies", "tools", "languages", "proficient"],
    response: "Ethan works across systems administration (Windows, Windows Server, Linux/Ubuntu, Active Directory), virtualization & cloud (Proxmox, Docker, VMware, VirtualBox, Azure), networking (TCP/IP, DNS, DHCP, WireGuard VPN, firewalls, wireless), and tools like Git, Python, SQL, Java, Excel, and Power BI.",
  },
  {
    id: "networking",
    keywords: ["network", "networking", "cisco", "network+", "security+", "comptia", "tcp/ip", "dns", "dhcp", "vpn", "firewall", "router", "switch"],
    weight: 1.3,
    response: "Networking is Ethan's core focus — he's currently working to complete his CompTIA Network+ and Security+ certifications and has hands-on experience with TCP/IP, DNS, DHCP, firewall configuration, wireless networking, and WireGuard VPN, including running his own DNS server for network-level traffic monitoring.",
  },
  {
    id: "cybersecurity",
    keywords: ["cybersecurity", "security", "cyber", "infosec", "hacking", "pentest"],
    weight: 1.2,
    response: "Ethan is a Computer Technology student concentrating in Cybersecurity at Bowie State University (expected Dec 2026), with coursework in Foundations of Computer & Network Security and hands-on practice securing his own home lab — firewall rules, access control, and VPN-based remote access.",
  },
  {
    id: "virtualization",
    keywords: ["virtualization", "proxmox", "docker", "vmware", "virtualbox", "azure", "cloud", "container", "containers"],
    response: "Ethan runs a multi-service Proxmox home lab with Docker-containerized applications, and has experience with VMware, VirtualBox, and Microsoft Azure.",
  },
  {
    id: "projects",
    keywords: ["project", "projects", "built", "build", "home lab", "homelab", "cluster", "raspberry pi", "web server", "portfolio", "apache"],
    response: "Ethan's three main technical projects: a Personal Home Lab (Proxmox + Docker + WireGuard VPN + a self-run DNS server), a Self-Hosted Web Server (Ubuntu Server running Apache with a custom domain and IP-based access control), and a Mock Supercomputer — a 6-node Raspberry Pi cluster emulating an HPC system. Scroll down to the Projects section for details and GitHub links.",
  },
  {
    id: "experience",
    keywords: ["experience", "internship", "intern", "job", "work", "baltimore", "comptroller", "career"],
    response: "Ethan interned as a Full-Stack Database & Software Development Intern with the Baltimore City Fellows Internship (City of Baltimore, Office of the Comptroller) in summer 2025, building a dashboard that automated manual daily data updates for city staff.",
  },
  {
    id: "education",
    keywords: ["education", "school", "university", "degree", "bowie", "gpa", "study", "major", "coursework"],
    response: "Ethan is pursuing a B.S. in Computer Technology, Cybersecurity concentration, at Bowie State University, Maryland — expected December 2026, GPA 3.2/4.0. Coursework includes Windows Server Administration, Computer Networking, and Foundations of Computer & Network Security.",
  },
  {
    id: "certifications",
    keywords: ["certification", "certifications", "certified", "network+", "security+", "comptia", "cert", "certs"],
    response: "Ethan is currently working to complete his CompTIA Network+ and Security+ certifications.",
  },
  {
    id: "volunteer",
    keywords: ["eagle scout", "scout", "bdpa", "volunteer", "volunteering", "leadership", "hscc", "community"],
    response: "Ethan is an Eagle Scout who led a multi-volunteer service project from planning through completion. He's a Charter Member of BDPA Baltimore Metro (2023–present), was Project Coordinator for the BSU Collegiate Chapter (2025), and served as Election Chair and Student Volunteer with HSCC.",
  },
  {
    id: "resume",
    keywords: ["resume", "cv", "download resume", "print"],
    response: "You can download or view Ethan's resume as a PDF in the Resume section above — it includes everything in this chat plus full formatting for printing.",
  },
  {
    id: "contact",
    keywords: ["contact", "email", "reach", "hire", "linkedin", "phone", "get in touch", "available", "availability", "job opportunity"],
    response: "Best way to reach Ethan is by email at ehas2026@gmail.com or via LinkedIn (linked in the Contact section). He's currently open to full-time job and co-op opportunities.",
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank you", "appreciate", "cool", "nice", "awesome"],
    response: "Anytime! Let me know if you want details on a specific project or skill.",
  },
  {
    id: "who",
    keywords: ["who are you", "what are you", "are you a bot", "are you real", "chatbot"],
    response: "I'm a simple rule-based FAQ assistant built in plain JavaScript for this site — I match your message against a set of keyword-scored intents about Ethan's background. No external AI service involved. Check the README in the GitHub repo for how I work.",
  },
];

const CHATBOT_FALLBACK =
  "I don't have an answer for that yet — try asking about Ethan's skills, projects, experience, education, certifications, or how to contact him.";

const CHATBOT_SUGGESTIONS = [
  "What are your skills?",
  "Tell me about your projects",
  "What's your experience?",
  "How do I contact you?",
];
