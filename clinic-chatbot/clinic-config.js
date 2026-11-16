/*
 * CLINIC CONFIGURATION FILE
 * ------------------------------------------------------------------
 * This is the ONLY file you need to edit for each clinic.
 * Change the text between the quotes, save, and upload. No coding needed.
 *
 * Tips:
 *  - Keep every line ending with a comma, exactly like the examples.
 *  - Use **double stars** to make words bold.
 *  - Links: [Text to show](https://example.com)
 *  - New line inside an answer: \n
 *
 * Sample clinic: Bright Smile Dental Clinic (demo data).
 */
window.ClinicBotConfig = {

  /* 1. CLINIC DETAILS ------------------------------------------------ */
  clinic: {
    name: "Bright Smile Dental Clinic",
    phone: "(555) 012-3456",
    emergencyPhone: "(555) 012-3456",
    email: "appointments@brightsmile.example",
    address: "123 Main Street, Suite 200, Springfield, USA",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=123+Main+Street+Springfield",
    parking: "Free parking is available in front of the building.",
    timezone: "America/New_York",        // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    timezoneLabel: "Eastern Time"
  },

  /* 2. OPENING HOURS (24 hour format). Use null for closed days. ----- */
  hours: {
    monday:    ["09:00", "17:00"],
    tuesday:   ["09:00", "17:00"],
    wednesday: ["09:00", "17:00"],
    thursday:  ["09:00", "17:00"],
    friday:    ["09:00", "17:00"],
    saturday:  null,
    sunday:    null
  },

  /* 3. SERVICES ------------------------------------------------------ */
  services: [
    {
      name: "Teeth Cleaning",
      keywords: ["cleaning", "dental cleaning", "checkup", "scale", "tartar", "plaque", "hygiene"],
      description: "A professional cleaning removes plaque and tartar, followed by a polish and a check of your teeth and gums. Most people benefit from a cleaning every 6 months. New patient exam, cleaning and X-rays: $99 before insurance."
    },
    {
      name: "Teeth Whitening",
      keywords: ["whitening", "whiten", "white teeth", "stains", "yellow teeth", "bleaching"],
      description: "Professional whitening safely brightens your smile and removes stains from coffee, tea and more. Our dentist will check that whitening is right for you before treatment. In office whitening: $349. Take home trays: $199."
    },
    {
      name: "Orthodontics",
      keywords: ["braces", "invisalign", "clear aligners", "straighten", "crooked teeth", "orthodontics"],
      description: "We offer traditional braces and clear aligners to straighten teeth and improve your bite, for teens and adults. Your treatment plan starts with a free consultation."
    },
    {
      name: "Dental Implants",
      keywords: ["implants", "implant", "missing tooth", "replace tooth", "missing teeth"],
      description: "Dental implants are a long lasting way to replace missing teeth. They look and work like natural teeth. A free consultation checks if implants are right for you."
    }
  ],

  /* 4. FREQUENTLY ASKED QUESTIONS -------------------------------------
   * question: how a patient might ask it
   * keywords: other words patients might use (helps the bot understand)
   * answer:   the exact answer the bot will give
   */
  faq: [
    {
      id: "insurance",
      question: "Do you accept insurance?",
      keywords: ["insurance", "dental insurance", "ppo", "accept insurance", "covered", "coverage", "medicaid", "delta", "delta dental", "cigna", "aetna", "metlife", "guardian", "in network"],
      answer: "We are in network with **Delta Dental, Cigna, Aetna, MetLife and Guardian** PPO plans, and we accept most other PPO plans as out of network. Share your insurance details when you request an appointment and our team will check your benefits before your visit."
    },
    {
      id: "payment",
      question: "What payment options do you offer?",
      keywords: ["pay", "payment", "credit card", "cash", "financing", "payment plan", "carecredit"],
      answer: "We accept cash, all major credit and debit cards, and we offer flexible payment plans for larger treatments. Our team will explain all costs before any treatment begins."
    },
    {
      id: "price",
      question: "How much does a treatment cost?",
      keywords: ["price", "cost", "how much", "fees", "expensive", "quote", "new patient special", "exam price"],
      answer: "Our prices before insurance:\n• New patient exam, cleaning and X-rays: **$99**\n• Professional teeth whitening (in office): **$349**\n• Take home whitening trays: **$199**\n• Implant or Invisalign consultation: **Free**\nOther treatments are priced after your exam, and our team will check what your insurance covers."
    },
    {
      id: "new-patients",
      question: "Are you accepting new patients?",
      keywords: ["new patient", "new patients", "accepting", "first visit", "register"],
      answer: "Yes! We are happily accepting new patients. You can request your first appointment right here in the chat."
    },
    {
      id: "first-visit",
      question: "What should I bring to my first visit?",
      keywords: ["bring", "first visit", "first appointment", "documents", "id", "what to expect"],
      answer: "Please bring a photo ID, your insurance card (if you have one), and a list of any medications you take. Arriving 10 minutes early helps us complete your paperwork."
    },
    {
      id: "children",
      question: "Do you treat children?",
      keywords: ["children", "kids", "child", "pediatric", "family", "son", "daughter"],
      answer: "Yes, we treat patients of all ages, including children. We recommend a child's first dental visit by their first birthday."
    },
    {
      id: "emergency-appointments",
      question: "Do you offer emergency dental appointments?",
      keywords: ["emergency appointment", "same day", "toothache", "urgent appointment", "walk in", "pain", "hurts", "tooth pain", "tooth hurts"],
      answer: "We do our best to see dental emergencies on the same day during opening hours. Please call us at **(555) 012-3456** so we can find the earliest time for you."
    },
    {
      id: "cancel",
      question: "How do I cancel or reschedule my appointment?",
      keywords: ["cancel", "reschedule", "change appointment", "move appointment", "cancellation", "late", "running late"],
      answer: "To cancel or reschedule, please call us at **(555) 012-3456** at least 24 hours before your appointment, so we can offer the time to another patient."
    },
    {
      id: "duration",
      question: "How long does a cleaning appointment take?",
      keywords: ["appointment length", "duration", "minutes", "how long does a cleaning take", "how long is a cleaning", "how long is the appointment"],
      answer: "A regular cleaning and checkup usually takes 45 to 60 minutes. A first visit may take a little longer."
    },
    {
      id: "whitening-safe",
      question: "Is teeth whitening safe? Does it hurt?",
      keywords: ["whitening safe", "whitening hurt", "sensitive", "sensitivity", "damage"],
      answer: "Professional whitening done by a dentist is safe. Some people feel mild, temporary sensitivity, and our dentist can recommend the best option if your teeth are sensitive."
    },
    {
      id: "languages",
      question: "Do you speak Spanish?",
      keywords: ["spanish", "espanol", "language", "languages", "translator"],
      answer: "Please call us at **(555) 012-3456** and our team will let you know which languages are available."
    }
  ],

  /* 5. APPOINTMENT REQUESTS ------------------------------------------
   * The bot asks one detail at a time: full name, phone, email, preferred day, preferred time.
   * contact: "either" = phone OR email, at least one (each asked separately, the other can be skipped)
   *          "phone" / "email" = that one is required, "both" = both required
   * Days and times come from the opening hours above; closed days and times are refused.
   */
  booking: {
    contact: "either",
    askService: false,          // true = also ask which service (from the services list)
    askNotes: false,            // true = also ask for an optional note
    daysToOffer: 5,             // how many upcoming open days to show as buttons
    maxRequestsPerSession: 3
  },

  /* 5b. AI VERSION (optional) ------------------------------------------
   * enabled: false = Standard version (built in engine, no API key, no running cost).
   * enabled: true  = AI version: understands any wording, still answers ONLY from this file.
   *   It needs YOUR OWN AI API key (Google Gemini, OpenAI or Anthropic Claude), kept on your proxy
   *   server (proxy/worker.js), never in this file. Usage is billed by your AI provider.
   *   If the AI is slow or unavailable, the built in engine answers instantly instead.
   */
  ai: {
    enabled: true,
    endpoint: "https://gemini-proxy.ahmed110hossam.workers.dev/",
    format: "gemini",            // "proxy" for proxy/worker.js (Gemini, OpenAI or Claude), "gemini" for a raw Gemini proxy
    model: "gemini-3.1-flash-lite",
    fallbackModels: ["gemini-3.1-flash-lite"],   // one quick retry if the AI is busy
    timeoutMs: 9000,
    maxCallsPerSession: 40
  },

  /* 5c. WHATSAPP (optional) ---------------------------------------------
   * The same assistant can answer on WhatsApp Business (see README, "WhatsApp").
   * showButton: adds a WhatsApp button in the chat header so visitors can continue on WhatsApp.
   */
  whatsapp: {
    number: "+1 555 012 3456",
    showButton: true,
    link: "whatsapp.html",      // leave empty on real sites: the button then opens wa.me/<number>
    greeting: "Hi Bright Smile!"
  },

  /* 6. WHERE APPOINTMENT REQUESTS ARE SENT -----------------------------
   * method: "web3forms"  -> emails the clinic directly (free, recommended)
   *         "webhook"    -> sends to an n8n / Zapier / Make webhook
   *         "demo"       -> sends nothing, shows a preview of the email
   */
  delivery: {
    method: "demo",
    web3formsAccessKey: "YOUR_WEB3FORMS_ACCESS_KEY",
    webhookUrl: "",
    subjectPrefix: "[Website]",
    showDemoPreview: true
  },

  /* 7. LOOK AND FEEL ------------------------------------------------- */
  branding: {
    botName: "Bright Smile Assistant",
    primaryColor: "#0e7c86",
    logoUrl: "",                 // e.g. "https://yourclinic.com/logo.png" (square image works best)
    position: "right",           // "right" or "left"
    showTeaser: true,
    teaserDelaySeconds: 4
  },

  /* 8. OPTIONAL: CHANGE ANY BOT MESSAGE ------------------------------- */
  messages: {
    teaser: "Hi! 👋 Questions about our services, or want to book a visit?",
    disclaimer: "Automated assistant. Not medical advice. In an emergency call 911."
  }
};
