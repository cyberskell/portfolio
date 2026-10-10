const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType,
  ImageRun, ExternalHyperlink, convertInchesToTwip
} = require("docx");
const fs = require("fs");
const path = require("path");
const ASSETS = path.join(__dirname, "..", "assets");

const NAVY = "13233A";
const SLATE = "3D4C61";
const AMBER = "B4741E";
const LIGHT = "6B7686";

const FONT_HEAD = "IBM Plex Sans";
const FONT_BODY = "IBM Plex Sans";

function hr() {
  return new Paragraph({
    spacing: { before: 60, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D8DCE2" } },
  });
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 38, after: 22 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, color: NAVY, size: 20, font: FONT_HEAD, characterSpacing: 20 }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 11 },
    children: [new TextRun({ text, size: 17, color: "23262B", font: FONT_BODY })],
  });
}

function skillLine(label, text) {
  return new Paragraph({
    spacing: { after: 19 },
    children: [
      new TextRun({ text: label + "  ", bold: true, size: 18, color: NAVY, font: FONT_BODY }),
      new TextRun({ text, size: 18, color: "23262B", font: FONT_BODY }),
    ],
  });
}

const NOBORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NOBORDERS = { top: NOBORDER, bottom: NOBORDER, left: NOBORDER, right: NOBORDER, insideHorizontal: NOBORDER, insideVertical: NOBORDER };

function roleHeader(title, dates) {
  if (!dates) {
    return new Paragraph({
      spacing: { before: 38, after: 5 },
      children: [new TextRun({ text: title, bold: true, size: 19, color: "1A1D21", font: FONT_HEAD })],
    });
  }
  // Two-column borderless table guarantees the date never collides with a long title,
  // since each column wraps independently instead of relying on a fixed tab stop.
  return new Table({
    width: { size: 10940, type: WidthType.DXA },
    columnWidths: [8200, 2740],
    borders: NOBORDERS,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 8200, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [new Paragraph({
              spacing: { before: 38, after: 5 },
              children: [new TextRun({ text: title, bold: true, size: 19, color: "1A1D21", font: FONT_HEAD })],
            })],
          }),
          new TableCell({
            width: { size: 2740, type: WidthType.DXA },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            verticalAlign: "center",
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 38, after: 5 },
              children: [new TextRun({ text: dates, size: 17, color: LIGHT, font: FONT_BODY })],
            })],
          }),
        ],
      }),
    ],
  });
}

function subLine(text) {
  return new Paragraph({
    spacing: { after: 24 },
    children: [new TextRun({ text, italics: true, size: 17, color: SLATE, font: FONT_BODY })],
  });
}

// ---------------------------------------------------------------------------
// PROJECT LIBRARY
// Every project lives here. To tailor the resume for a job posting, change
// SELECTED_PROJECTS below (order = print order). Projects not selected stay in
// the library for next time and still appear on the website.
// ---------------------------------------------------------------------------
const PROJECTS = {
  homelab: {
    title: "Personal Home Lab — System Administration & Troubleshooting",
    bullets: [
      "Built and maintain a multi-service server environment on Proxmox, deploying and supporting Docker-containerized applications (media server, game server) — including installs, updates, backups, and diagnosing service outages.",
      "Run a personal DNS server to monitor incoming network traffic and block unwanted applications at the network level, backed by custom firewall rules.",
    ],
  },
  wireguard: {
    title: "Self-Hosted WireGuard VPN for Remote Proxmox Access | Home Lab",
    bullets: [
      "Deployed a WireGuard VPN server on a Proxmox VE host for encrypted remote access to the hypervisor's management interface, with a dedicated VPN subnet (10.10.10.0/24), key-based peer authentication, IP forwarding, and iptables NAT/masquerade rules.",
      "Configured UDP port forwarding and firewall rules on a Verizon router to expose only the VPN endpoint rather than the Proxmox web UI; set up a Windows WireGuard client and tested remote connectivity over a mobile hotspot.",
      "Troubleshot connection failures using handshake status, client logs, and key verification, resolving a Wintun virtual adapter error and mismatched public keys between peers.",
    ],
  },
  webserver: {
    title: "Self-Hosted Web Server (github.com/cyberskell/cyberskell-web-dns-server)",
    bullets: [
      "Deployed an Ubuntu Server running the Apache HTTP Server, configured with a custom domain and IP-based access control to restrict incoming connections.",
      "Set up Apache virtual hosts and DNS routing, then hardened the server against unauthorized access with firewall rules on top of Apache's own access controls; perform ongoing maintenance and patching.",
    ],
  },
  azure: {
    title: "Hybrid Identity, Cloud Infrastructure & Disaster Recovery Lab | Azure, Windows Server 2022, AD",
    bullets: [
      "Designed a segmented Azure network with an IP-restricted jumpbox, private domain controller, and NAT Gateway; built an AD forest, joined VMs to the domain, and synced users to Microsoft Entra ID with Entra Connect.",
      "Built an AD CS Enterprise Root CA with Group Policy auto-enrollment and NPS/RADIUS with EAP-TLS, verified end to end in NPS audit logs; configured Azure File Sync with cloud tiering.",
      "Implemented Azure Backup and Azure Site Recovery with a cross-region test failover; resolved Azure Policy, SKU, and quota blockers with Azure CLI.",
    ],
  },
  hpc: {
    title: "Mock Supercomputer / Virtual Cluster Build",
    bullets: [
      "Built a 6-node Raspberry Pi cluster wired over a dedicated switch, configured to emulate a small HPC environment with static IP addressing and SSH-based cluster management.",
      "Diagnosed connectivity and configuration issues across the networked systems, from physical cabling to service-level configuration.",
    ],
  },
};

// Projects printed on the resume, in order.
const SELECTED_PROJECTS = ["homelab", "webserver", "azure"];

function projectBlocks(ids) {
  const out = [];
  ids.forEach((id) => {
    const p = PROJECTS[id];
    if (!p) throw new Error("Unknown project id: " + id);
    out.push(roleHeader(p.title, ""));
    p.bullets.forEach((b) => out.push(bullet(b)));
  });
  return out;
}

const doc = new Document({
  creator: "Ethan Haskell",
  lastModifiedBy: "Ethan Haskell",
  title: "Ethan Haskell — Resume",
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 150, bottom: 150, left: 560, right: 560 },
        },
      },
      children: [
        // Header block: name/title left, QR code right
        new Table({
          width: { size: 10940, type: WidthType.DXA },
          columnWidths: [9440, 1500],
          borders: NOBORDERS,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 9440, type: WidthType.DXA },
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  children: [
                    new Paragraph({
                      spacing: { after: 15 },
                      children: [
                        new TextRun({ text: "ETHAN HASKELL", bold: true, size: 40, color: NAVY, font: FONT_HEAD, characterSpacing: 10 }),
                      ],
                    }),
                    new Paragraph({
                      spacing: { after: 0 },
                      children: [
                        new TextRun({ text: "Cybersecurity & Network Systems", size: 21, color: "000000", font: FONT_HEAD }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 1500, type: WidthType.DXA },
                  margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  verticalAlign: "center",
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new ImageRun({
                          type: "png",
                          data: fs.readFileSync(path.join(ASSETS, "qr-code.png")),
                          transformation: { width: 62, height: 62 },
                        }),
                      ],
                    }),
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      spacing: { before: 20 },
                      children: [
                        new TextRun({ text: "scan for portfolio", size: 13, color: LIGHT, italics: true, font: FONT_BODY }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({
          spacing: { before: 65, after: 5 },
          children: [
            new TextRun({ text: "Ellicott City, Maryland  |  410-940-7116  |  ehas2026@gmail.com", size: 18, color: SLATE, font: FONT_BODY }),
          ],
        }),
        new Paragraph({
          spacing: { after: 28 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D8DCE2" } },
          children: [
            new TextRun({ text: "linkedin.com/in/ethan-h-2745282a6  |  github.com/cyberskell  |  cyberskell.com", size: 18, color: SLATE, font: FONT_BODY }),
          ],
        }),

        sectionHeading("Summary"),
        new Paragraph({
          spacing: { after: 40 },
          children: [new TextRun({
            text: "Networking infrastructure student with a focus in cybersecurity at Bowie State University, with hands-on experience in enterprise network administration, workstation support, and self-hosted servers; pursuing the Cisco CCNA (target Jan. 2027) and CompTIA Network+ and Security+. Experienced resolving issues for non-technical staff and end users through IT internships with the Supreme Court of the United States and the City of Baltimore. Eagle Scout known for reliability, professionalism, and clear communication.",
            size: 17, color: "23262B", font: FONT_BODY,
          })],
        }),

        sectionHeading("Education"),
        roleHeader("B.S. Networking Infrastructure, Focus in Cybersecurity — Bowie State University", "Expected Dec. 2026"),
        subLine("GPA: 3.2 / 4.0"),
        skillLine("Relevant Coursework:", "Client Operating Systems, Windows Server Administration, PC Architecture, Computer Networking, Foundations of Computer and Network Security, Internet Technology, Database Development"),
        skillLine("Certifications:", "Cisco Certified Network Associate (CCNA) — target Jan. 2027  |  CompTIA Network+ and Security+ — in progress"),

        sectionHeading("Skills"),
        skillLine("Systems & Support:", "Windows, Windows Server, Linux (Ubuntu), Active Directory administration, account and access management, hardware/software troubleshooting, PC architecture, system maintenance and updates"),
        skillLine("Virtualization & Cloud:", "Proxmox, Docker, VMware, VirtualBox, Azure"),
        skillLine("Networking:", "TCP/IP, DNS, DHCP, VPN (WireGuard), switch and router configuration, firewall configuration, network monitoring tools, wireless networking, connectivity troubleshooting"),
        skillLine("Tools & Productivity:", "Microsoft Excel, Power BI, Git, command-line utilities, Python, SQL, Java, IT ticketing/helpdesk systems"),
        skillLine("Professional:", "Customer support & service-desk best practices, technical documentation, cross-team collaboration, issue escalation and follow-through"),

        sectionHeading("Technical Projects"),
        ...projectBlocks(SELECTED_PROJECTS),

        sectionHeading("Work Experience"),
        roleHeader("IT Operations Intern — Network Administration & Workstation Administration Groups", "Sept. 2026 – Jan. 2027"),
        subLine("Supreme Court of the United States"),
        bullet("Supported both the Network Administration Group (NAG) and Workstation Administration Group (WAG), gaining hands-on exposure to enterprise networking environments, system monitoring, hardware deployments, and end-user technical support."),
        bullet("Split time between proactive network monitoring and operational tasks within NAG — including switch and router configuration and troubleshooting using network monitoring tools — and direct, user-facing technical support within WAG."),
        bullet("Tracked and resolved issues through IT ticketing systems, applying customer service best practices and following documentation standards for hardware deployments and support requests."),

        roleHeader("Full-Stack Database & Software Development Intern", "May 2025 – Aug. 2025"),
        subLine("Baltimore City Fellows Internship — City of Baltimore, Office of the Comptroller"),
        bullet("Worked directly with non-technical staff across IT and operations teams to translate their needs into technical requirements and deliver a dashboard that departments used daily."),
        bullet("Led full-stack development of an interactive dashboard that automated previously manual daily data updates, reducing repetitive reporting work and improving data quality across departmental records; documented the build for staff handoff and training."),

        sectionHeading("Leadership & Volunteer Experience"),
        bullet("Eagle Scout — Boy Scouts of America: led and documented a multi-volunteer service project from planning through completion."),
        bullet("BDPA Baltimore Metro, Charter Member (2023–Present)  |  BSU Collegiate Chapter, Project Coordinator (2025)  |  HSCC, Election Chair (2025) & Student Volunteer (2023–Present)"),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(ASSETS, "Ethan_Haskell_Resume.docx"), buffer);
  console.log("done");
});
