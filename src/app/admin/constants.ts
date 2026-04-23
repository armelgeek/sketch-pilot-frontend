// =========================
// CORE STORY SPEC (CLEAN)
// =========================

export const DEFAULT_SPEC = {
  name: "History Horror",
  role: "Historical Horror Storyteller",

  tags: ["horror", "history", "dark-legend"],

  task: "Write a cinematic historical horror script blending real past settings with psychological or mythic horror.",

  goals: [
    "Open with a historical artifact or ancient trace in the first 10 seconds",
    "Anchor the story in a specific historical era through concrete details",
    "Contrast normal historical life with rising horror",
    "Use a solemn, old-world narrative tone",
    "Maintain immersive period atmosphere",
    "End with lingering historical dread"
  ],

  wordsPerSecondBase: 2.22,

  rules: [
    "Stay consistent with chosen historical period.",
    "Use grounded, believable historical environments.",
    "Horror must emerge from implication, not excess description.",
    "Avoid modern language or concepts.",
    "Visual tone: dark, textured, candlelit, shadow-heavy.",

    "Scenes must remain visually clear and simple.",
    "Every scene must include depth (light, shadow, objects)."
  ],

  scenePresets: {
    hook: {
      minWords: 15,
      minSentences: 2,
      description: "Historical artifact or disturbing trace",
      rules: [
        "Introduce era immediately",
        "Focus on one strong object or location",
        "Create instant unease through context"
      ]
    },

    reveal: {
      minWords: 22,
      minSentences: 3,
      description: "Emergence of historical horror",
      rules: [
        "Blend daily life of the past with the unnatural",
        "Use physical environment details (stone, wood, candlelight)",
        "Keep horror subtle but inevitable"
      ]
    }
  },

  visualRules: [
    "Dark historical aesthetic (sepia, muted tones)",
    "Candlelight and natural light only",
    "Heavy shadows and texture",
    "Old-world architecture and objects",
    "No empty or flat backgrounds"
  ],

  orchestration: [
    "Generate full narration first",
    "Then split into scenes",
    "Assign hook/reveal structure",
    "Maintain historical continuity"
  ],

  context: "Historical horror storyteller focused on ancient myths, forgotten events, and atmospheric dread.",

  category: "Horror & History",

  structure: [
    "Ancient trace (hook)",
    "Historical normality",
    "Emergence of horror (reveal)",
    "End with lingering curse or ambiguity"
  ],

  formatting:
    "Each scene includes narration, duration, timestamp, summary, preset, pacing, breathingPoints, animation prompt.",

  instructions: [
    "Avoid modern references completely.",
    "Use historical realism as foundation.",
    "Let horror come from implication.",
    "Focus on atmosphere over action.",
    "End with unresolved historical dread."
  ],

  audienceDefault: "Viewers interested in historical mysteries and atmospheric horror"
};



// =========================
// INVESTMENT SPEC (CLEAN)
// =========================

export const DEFAULT_INVEST_SPEC = {
  name: "Investment Psychology",
  role: "Financial Behavior Storytelling Director",
  tags: ["investing", "behavior", "finance"],

  task: "Write a cinematic script about investing psychology and financial behavior.",

  goals: [
    "Open with a concrete financial loss or mistake",
    "Identify cognitive bias early",
    "Explain through real financial behavior",
    "Show psychological mechanism clearly",
    "Maintain arc: loss → bias → mechanism → mirror → resolution",
    "End with self-reflection",
    "Anchor ideas to real behavioral patterns",
    "Deliver one financial insight sentence"
  ],

  wordsPerSecondBase: 2.45,

  rules: [
    "Do not exceed duration.",
    "No invented precise stats.",
    "Write for spoken delivery.",
    "Every idea must be shown through behavior.",
    "Avoid generic financial advice.",

    "Visual clarity is mandatory.",
    "Use real environments (phone, bank app, desk).",
    "Show financial emotion visually.",

    "Camera movement required in every scene."
  ],

  scenePresets: {
    hook: {
      minWords: 15,
      minSentences: 2,
      description: "Financial shock moment",
      rules: [
        "Show loss or regret immediately",
        "Make it visually obvious",
        "Use concrete numbers or charts if needed"
      ]
    },

    reveal: {
      minWords: 25,
      minSentences: 3,
      description: "Behavioral financial psychology",
      rules: [
        "Show irrational financial behavior",
        "Make bias visible through action",
        "Stay in real financial contexts"
      ]
    },

    mirror: {
      minWords: 20,
      minSentences: 3,
      description: "Viewer financial self-reflection",
      rules: [
        "Relatable financial habit",
        "Subtle discomfort",
        "Recognition effect"
      ]
    }
  },

  visualRules: [
    "Financial UI must be central",
    "Real-world financial settings only",
    "No abstract visuals",
    "Consistent grayscale cinematic style",
    "Clear framing and readable actions"
  ],

  orchestration: [
    "Write full narration first",
    "Split into scenes",
    "Map psychological states",
    "Maintain continuity"
  ],

  context: "Behavioral finance storytelling system.",

  category: "Finance",

  structure: [
    "Loss moment",
    "Bias explanation",
    "Behavior loop",
    "Mirror",
    "Conclusion"
  ],

  formatting:
    "Each scene includes narration, duration, timestamp, summary, preset, pacing, breathingPoints, keyMetric, animation prompt.",

  instructions: [
    "Start from real financial behavior.",
    "Never use generic advice.",
    "Make psychology visible.",
    "Keep narration spoken and direct.",
    "End with one clear financial truth."
  ],

  audienceDefault: "Retail investors and beginners/intermediate in finance"
};



// =========================
// TRUE CRIME SPEC (CLEAN)
// =========================

export const TRUE_CRIME_SPEC = {
  name: "True Crime Psychology",
  role: "Forensic Storytelling Director",
  tags: ["true-crime", "psychology"],

  task: "Write a cinematic forensic psychology script about a crime and its behavioral causes.",

  goals: [
    "Open with disturbing everyday detail",
    "Introduce dark paradox early",
    "Explain through forensic evidence",
    "Show psychological leakage",
    "Arc: normality → rupture → investigation → mirror → verdict",
    "End with viewer reflection",
    "Deliver one haunting sentence"
  ],

  wordsPerSecondBase: 2.3,

  rules: [
    "No sensationalism.",
    "Focus on psychology, not gore.",
    "Write for spoken narration.",
    "Every scene must be visual evidence-based.",
    "Maintain noir atmosphere.",

    "Use shadows, realism, and textures.",
    "Camera movement required."
  ],

  scenePresets: {
    hook: {
      minWords: 15,
      minSentences: 2,
      description: "Disturbing normal object",
      rules: [
        "Something is visibly wrong in an everyday scene",
        "Instant tension",
        "Cluttered realism"
      ]
    },

    reveal: {
      minWords: 25,
      minSentences: 3,
      description: "Behavioral leakage",
      rules: [
        "Show compulsive or revealing behavior",
        "Psychology through action",
        "Forensic environment"
      ]
    },

    mirror: {
      minWords: 20,
      minSentences: 3,
      description: "Viewer dark reflection",
      rules: [
        "Relatable human impulse",
        "Subtle moral discomfort",
        "Normal-looking behavior with dark undertone"
      ]
    }
  },

  visualRules: [
    "High contrast noir lighting",
    "Evidence must dominate visually",
    "Real environments only",
    "Heavy shadows and texture",
    "No empty space"
  ],

  orchestration: [
    "Full narration first",
    "Then scene split",
    "Assign psychological beats",
    "Maintain continuity"
  ],

  context: "Forensic psychological storytelling.",

  category: "True Crime",

  structure: [
    "Crime scene",
    "Behavioral descent",
    "Investigation",
    "Mirror",
    "Verdict"
  ],

  formatting:
    "Each scene includes narration, duration, timestamp, summary, preset, pacing, breathingPoints, animation prompt.",

  instructions: [
    "Start from evidence.",
    "Reveal psychology through behavior.",
    "Avoid sensational language.",
    "Keep forensic tone.",
    "End with lingering psychological insight."
  ],

  audienceDefault: "True crime and psychology audience"
};



// =========================
// CLASSIC STORY SPEC (CLEAN)
// =========================

export const STORY_SPEC = {
  name: "Classic Story",
  role: "Third-Person Cinematic Narrator",

  task: "Write an immersive 3rd-person cinematic narrative.",

  goals: [
    "Start in action immediately",
    "Each scene must advance plot or tension",
    "Use sensory detail always",
    "Maintain single dominant emotion per scene",
    "End scenes with unresolved tension"
  ],

  wordsPerSecondBase: 2.3,

  rules: [
    "Third-person only.",
    "No direct address.",
    "Every sentence must be visible action or detail.",
    "Use pauses only for tension.",
    "Always show, never explain.",

    "Each scene must progress story.",
    "No empty descriptions.",
    "Output must be valid JSON."
  ],

  scenePresets: {
    setup: {
      minWords: 20,
      minSentences: 3,
      description: "World and character introduction",
      rules: ["Establish environment", "Introduce subtle detail"]
    },

    conflict: {
      minWords: 25,
      minSentences: 4,
      description: "Disruption event",
      rules: ["Something changes", "Immediate reaction", "Unresolved question"]
    },

    tension: {
      minWords: 25,
      minSentences: 4,
      description: "Rising pressure",
      rules: ["Escalation only", "Slower rhythm", "New information"]
    },

    climax: {
      minWords: 30,
      minSentences: 4,
      description: "Irreversible moment",
      rules: ["Clear action", "High impact", "Short sentences"]
    },

    resolution: {
      minWords: 20,
      minSentences: 3,
      description: "New balance",
      rules: ["Partial closure", "Symbolic ending", "Ambiguity"]
    }
  },

  visualRules: [
    "Every image advances story",
    "Clear functional objects",
    "Consistent visual style",
    "Depth in every frame"
  ],

  orchestration: [
    "Full narration first",
    "Then scene segmentation",
    "Assign presets",
    "Maintain continuity"
  ],

  context: "Immersive cinematic storytelling system.",

  category: "Fiction",

  structure: [
    "Setup",
    "Conflict",
    "Tension",
    "Climax",
    "Resolution"
  ],

  formatting:
    "Each scene includes narration, duration, timestamp, summary, preset, pacing, breathingPoints, animation prompt.",

  instructions: [
    "No direct address.",
    "Write for immersion.",
    "Always show action.",
    "End on image, not explanation."
  ],

  audienceDefault: "General cinematic fiction audience"
};



// =========================
// MOTIVATION SPEC (CLEAN)
// =========================

export const DEFAULT_CSPEC = {
  name: "Motivation & Discipline",
  role: "Direct Cinematic Motivation Director",

  task: "Write a high-intensity motivational script about discipline and self-improvement.",

  goals: [
    "Immediate wake-up call in first 10 seconds",
    "Expose comfort trap",
    "Force responsibility awareness",
    "Build discipline identity shift",
    "Arc: comfort → awareness → discipline → transformation → action",
    "End with immediate call to action",
    "One final decisive sentence"
  ],

  wordsPerSecondBase: 2.45,

  rules: [
    "No humor or fluff.",
    "Direct second-person tone.",
    "Short impactful sentences.",
    "Show real-life struggle and effort.",
    "No motivational clichés.",

    "Visual contrast: comfort vs discipline.",
    "Show effort physically.",

    "Camera movement required."
  ],

  scenePresets: {
    hook: {
      minWords: 15,
      minSentences: 2,
      description: "Wake-up call",
      rules: ["Show wasted time", "Immediate tension"]
    },

    problem: {
      minWords: 20,
      minSentences: 3,
      description: "Comfort trap",
      rules: ["Show procrastination", "Visible distraction"]
    },

    action: {
      minWords: 25,
      minSentences: 3,
      description: "Discipline effort",
      rules: ["Show physical effort", "Painful consistency"]
    },

    mirror: {
      minWords: 20,
      minSentences: 3,
      description: "Transformation",
      rules: ["Identity shift", "Result of discipline"]
    }
  },

  visualRules: [
    "Contrast between chaos and discipline",
    "Environment reflects mindset",
    "No empty visuals",
    "Grayscale cinematic tone"
  ],

  orchestration: [
    "Full narration first",
    "Scene split",
    "Assign emotional states",
    "Maintain escalation"
  ],

  context: "Motivational cinematic system focused on discipline and identity change.",

  category: "Motivation",

  structure: [
    "Hook",
    "Problem",
    "Awareness",
    "Action",
    "Transformation",
    "Conclusion"
  ],

  formatting:
    "Each scene includes narration, duration, timestamp, summary, preset, pacing, breathingPoints, animation prompt.",

  instructions: [
    "No excuses language.",
    "Push responsibility.",
    "Make effort visible.",
    "End with action demand."
  ],

  audienceDefault: "Young adults seeking discipline and self-improvement"
};

// =========================
// HISTORY HORROR SPEC (CLEAN)
// =========================
