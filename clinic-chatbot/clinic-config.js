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
      description: "A professional cleaning removes plaque and tartar, followed by a polish and a check of your teeth and gums. Most people benefit from a cleaning every 6 months."
    },
    {
      name: "Teeth Whitening",
      keywords: ["whitening", "whiten", "white teeth", "stains", "yellow teeth", "bleaching"],
      description: "Professional whitening safely brightens your smile and removes stains from coffee, tea and more. Our dentist will check that whitening is right for you before treatment."
    },
    {
      name: "Orthodontics",
      keywords: ["braces", "invisalign", "clear aligners", "straighten", "crooked teeth", "orthodontics"],
      description: "We offer traditional braces and clear aligners to straighten teeth and improve your bite, for teens and adults. Your treatment plan starts with a consultation."
    },
    {
      name: "Dental Implants",
      keywords: ["implants", "implant", "missing tooth", "replace tooth", "missing teeth"],
      description: "Dental implants are a long lasting way to replace missing teeth. They look and work like natural teeth. A consultation is needed to check if implants are right for you."
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
      keywords: ["insurance", "dental insurance", "ppo", "accept insurance", "covered", "coverage", "medicaid"],
      answer: "We accept most major PPO dental insurance plans. Coverage depends on your plan, so please share your insurance details when you request an appointment and our team will verify your benefits before your visit."
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
      keywords: ["price", "cost", "how much", "fees", "expensive", "quote"],
      answer: "Costs depend on your needs and your insurance, so we give an exact price after your exam. Our team is happy to give you an estimate when they contact you to confirm your appointment."
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

  /* 5. APPOINTMENT REQUESTS ------------------------------------------ */
  booking: {
    timeOptions: ["Weekday morning (9 AM to 12 PM)", "Weekday afternoon (12 PM to 5 PM)", "As soon as possible"],
    askNotes: true,
    maxRequestsPerSession: 3
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
