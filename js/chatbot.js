/**
 * Rule-based FAQ chatbot for the portfolio.
 *
 * How it works (see README for the full write-up):
 * Each entry below has a list of trigger keywords/phrases and a canned
 * answer. On every message, we lowercase the input and score each entry by
 * how many of its triggers appear as substrings of the message. The
 * highest-scoring entry above zero wins; ties go to whichever is listed
 * first. This is intentionally simple — no external API, no network call,
 * works instantly and offline — while still handling paraphrased questions
 * ("what tech do you know" and "your stack?" both hit the skills entry)
 * rather than requiring an exact match.
 */
(function () {
  "use strict";

  var KB = [
    {
      id: "greeting",
      triggers: ["hello", "hi", "hey", "yo", "sup", "good morning", "good afternoon"],
      answer: "Hey! I'm a small FAQ bot trained on Ethan's resume. Ask me about his skills, projects, experience, education, or how to get in touch."
    },
    {
      id: "skills",
      triggers: ["skill", "tech stack", "technologies", "what do you know", "stack", "languages", "programming", "know how to", "monitoring tool", "ticketing", "switch", "router"],
      answer: "Ethan's core areas: systems &amp; support (Windows, Windows Server 2022, Linux, Active Directory, Group Policy, AD CS, NPS/RADIUS, Entra ID), virtualization &amp; cloud (Proxmox, Docker, VMware, VirtualBox, Microsoft Azure), networking (TCP/IP, DNS, DHCP, WireGuard VPN, switch &amp; router configuration, firewalls, network monitoring tools), IT ticketing/helpdesk systems, and tools like Git, Python, SQL, and Java. See the <a href=\"#about\">About</a> section for the full breakdown."
    },
    {
      id: "projects",
      triggers: ["project", "built", "portfolio work", "home lab", "homelab", "cluster", "raspberry pi", "server"],
      answer: "A few highlights: a hybrid identity and disaster recovery lab in Microsoft Azure, a self-hosted WireGuard VPN for remote Proxmox access, a Proxmox home lab running Docker services and a personal DNS server, a self-hosted Ubuntu/Apache web server, and a 6-node Raspberry Pi cluster emulating an HPC system. Full details are in <a href=\"#projects\">Projects</a>."
    },
    {
      id: "azure",
      triggers: ["azure", "cloud", "entra", "active directory", "domain controller", "pki", "certificate", "radius", "nps", "site recovery", "backup", "disaster recovery", "file sync", "hybrid"],
      answer: "In his Azure cloud lab (CTEC405, Bowie State), Ethan built a segmented Azure network with a jumpbox and private domain controller, an Active Directory forest synced to Microsoft Entra ID, a PKI with AD CS and Group Policy auto-enrollment, NPS/RADIUS with EAP-TLS, Azure File Sync with cloud tiering, and Azure Backup plus a cross-region Site Recovery test failover. See <a href=\"#projects\">Projects</a>."
    },
    {
      id: "vpn",
      triggers: ["vpn", "wireguard", "remote access", "proxmox", "port forward", "iptables"],
      answer: "Ethan runs a self-hosted WireGuard VPN on his Proxmox host: a dedicated 10.10.10.0/24 VPN subnet, key-based peer authentication, iptables NAT rules, and router port forwarding that exposes only the VPN endpoint, not the Proxmox web UI. He debugged it through handshake status and logs, fixing a Wintun adapter error and mismatched peer keys."
    },
    {
      id: "experience",
      triggers: ["experience", "internship", "job", "work history", "baltimore", "comptroller", "intern", "supreme court", "nag", "wag", "network administration", "workstation", "government", "federal"],
      answer: "Ethan's most recent internship is as an IT Operations Intern with the Supreme Court of the United States, supporting both the Network Administration Group (NAG) and Workstation Administration Group (WAG) — network monitoring, switch/router configuration, and end-user support. Before that, he was a Full-Stack Database &amp; Software Development Intern with the City of Baltimore, Office of the Comptroller (May–Aug 2025), leading development of a dashboard that automated manual daily reporting for city staff."
    },
    {
      id: "education",
      triggers: ["education", "school", "university", "degree", "gpa", "bowie", "college", "major"],
      answer: "Ethan is completing a B.S. in Networking Infrastructure with a focus in Cybersecurity at Bowie State University (expected Dec. 2026), GPA 3.2/4.0."
    },
    {
      id: "certifications",
      triggers: ["certification", "cert", "comptia", "network+", "security+", "ccna", "cisco"],
      answer: "He's currently working toward CompTIA Network+ and Security+ certifications."
    },
    {
      id: "leadership",
      triggers: ["eagle scout", "scout", "volunteer", "leadership", "bdpa", "community"],
      answer: "Ethan is an Eagle Scout who led a multi-volunteer community service project from planning through completion. He's also a Charter Member of BDPA Baltimore Metro (2023–Present), a Project Coordinator for the BSU Collegiate Chapter, and Election Chair for HSCC."
    },
    {
      id: "contact",
      triggers: ["contact", "email", "phone", "reach", "hire", "available", "linkedin", "get in touch"],
      answer: "Best ways to reach Ethan: email at ehas2026@gmail.com, phone at 410-940-7116, or <a href=\"https://linkedin.com/in/ethan-h-2745282a6\" target=\"_blank\" rel=\"noopener\">LinkedIn</a> — or just use the <a href=\"#contact\">contact form</a> on this page."
    },
    {
      id: "resume",
      triggers: ["resume", "résumé", "cv", "download"],
      answer: "You can view and download it in the <a href=\"#resume\">Resume</a> section — both PDF and Word formats are available."
    },
    {
      id: "location",
      triggers: ["location", "where", "based", "live", "maryland"],
      answer: "Ethan is based in Ellicott City, Maryland."
    }
  ];

  var FALLBACK = "I'm not sure about that one — I only know what's on Ethan's resume. Try asking about his skills, projects, experience, education, or how to contact him.";

  // Match triggers as whole words (allowing simple endings like "skills" or
  // "certs"), so a short trigger like "hi" doesn't fire inside "him".
  function triggerMatches(t, msg) {
    var escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var endings = t.length > 3 ? "(s|es|ed|ing)?" : "";
    var re = new RegExp("(^|[^a-z0-9])" + escaped + endings + "([^a-z0-9]|$)");
    return re.test(msg);
  }

  function scoreEntry(entry, msg) {
    var score = 0;
    entry.triggers.forEach(function (t) {
      if (triggerMatches(t, msg)) score += t.split(" ").length; // multi-word matches count more
    });
    return score;
  }

  function getAnswer(raw) {
    var msg = raw.toLowerCase().trim();
    if (!msg) return FALLBACK;
    var best = null, bestScore = 0;
    KB.forEach(function (entry) {
      var s = scoreEntry(entry, msg);
      if (s > bestScore) { bestScore = s; best = entry; }
    });
    return best ? best.answer : FALLBACK;
  }

  /* ---------------- UI wiring ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var launcher = document.getElementById("chatLauncher");
    var panel = document.getElementById("chatPanel");
    var closeBtn = document.getElementById("chatClose");
    var body = document.getElementById("chatBody");
    var suggestWrap = document.getElementById("chatSuggest");
    var form = document.getElementById("chatForm");
    var input = document.getElementById("chatInput");

    var SUGGESTIONS = ["Skills", "Projects", "Experience", "Certifications", "Contact"];
    var hasGreeted = false;

    function addMessage(text, who) {
      var div = document.createElement("div");
      div.className = "msg " + who;
      div.innerHTML = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function showTyping(cb) {
      var div = document.createElement("div");
      div.className = "msg bot";
      div.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      setTimeout(function () {
        div.remove();
        cb();
      }, 420 + Math.random() * 380);
    }

    function renderSuggestions() {
      suggestWrap.innerHTML = "";
      SUGGESTIONS.forEach(function (label) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = label;
        chip.addEventListener("click", function () { handleUserMessage(label); });
        suggestWrap.appendChild(chip);
      });
    }

    function handleUserMessage(text) {
      addMessage(escapeHtml(text), "user");
      input.value = "";
      showTyping(function () {
        addMessage(getAnswer(text), "bot");
      });
    }

    function escapeHtml(s) {
      var d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    }

    function openPanel() {
      panel.classList.add("is-open");
      input.focus();
      if (!hasGreeted) {
        hasGreeted = true;
        showTyping(function () {
          addMessage("Hi, I'm Ethan's portfolio assistant. Ask me anything about his skills, projects, or experience — or tap a suggestion below.", "bot");
        });
      }
    }
    function closePanel() { panel.classList.remove("is-open"); }

    launcher.addEventListener("click", function () {
      panel.classList.contains("is-open") ? closePanel() : openPanel();
    });
    closeBtn.addEventListener("click", closePanel);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      handleUserMessage(text);
    });

    renderSuggestions();
  });
})();
