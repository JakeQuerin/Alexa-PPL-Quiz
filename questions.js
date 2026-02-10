const QUESTION_BANK = [
  {
    id: "att_pitch_axis",
    topic: "Attitudes & Movements",
    difficulty: "easy",
    type: "mcq",
    prompt: "Pitch is rotation around which axis?",
    choices: ["Lateral axis", "Longitudinal axis", "Vertical axis", "Propeller axis"],
    answer: "Lateral axis",
    explanation: "Pitch is nose up/down about the lateral axis (wingtip-to-wingtip)."
  },
  {
    id: "att_roll_axis",
    topic: "Attitudes & Movements",
    difficulty: "easy",
    type: "mcq",
    prompt: "Roll is controlled primarily by:",
    choices: ["Ailerons", "Rudder", "Elevator", "Flaps"],
    answer: "Ailerons",
    explanation: "Ailerons increase lift on one wing and decrease it on the other to create roll."
  },
  {
    id: "att_adverse_yaw_fix",
    topic: "Attitudes & Movements",
    difficulty: "medium",
    type: "short",
    prompt: "During aileron roll-in to a left turn, the nose yaws right. Name the effect and the control fix.",
    context: "Use a short phrase.",
    answers: ["adverse yaw and coordinated left rudder", "adverse yaw + left rudder", "adverse yaw with left rudder"],
    explanation: "Adverse yaw is expected. Add coordinated rudder in the direction of turn."
  },
  {
    id: "att_left_turning_tendencies",
    topic: "Attitudes & Movements",
    difficulty: "hard",
    type: "multi",
    prompt: "At high power/high AOA in a C172S, which effects can contribute to left yaw tendency?",
    choices: ["P-factor", "Spiraling slipstream", "Torque reaction", "Ground effect"],
    answers: ["P-factor", "Spiraling slipstream", "Torque reaction"],
    explanation: "Left-turning tendencies are a combination of several propeller effects."
  },
  {
    id: "att_control_to_movement",
    topic: "Attitudes & Movements",
    difficulty: "easy",
    type: "matching",
    prompt: "Match control input to primary movement.",
    pairs: [
      { left: "Elevator", right: "Pitch" },
      { left: "Aileron", right: "Roll" },
      { left: "Rudder", right: "Yaw" },
      { left: "Trim wheel", right: "Relieves control pressure" }
    ],
    explanation: "This mapping is core to early handling and trim discipline."
  },

  {
    id: "man_straight_level_scan",
    topic: "Flight Maneuvers",
    difficulty: "medium",
    type: "sequence",
    prompt: "Put this straight-and-level correction flow in the best order.",
    items: [
      "Apply smooth control pressure",
      "Cross-check attitude and performance instruments",
      "Trim off pressure",
      "Re-scan and confirm stable altitude/heading/airspeed"
    ],
    correctOrder: [
      "Cross-check attitude and performance instruments",
      "Apply smooth control pressure",
      "Trim off pressure",
      "Re-scan and confirm stable altitude/heading/airspeed"
    ],
    explanation: "Instrument confirmation before and after correction avoids chasing needles."
  },
  {
    id: "man_climb_to_level",
    topic: "Flight Maneuvers",
    difficulty: "medium",
    type: "mcq",
    prompt: "In a normal climb transitioning to cruise, what is the best control sequence?",
    choices: [
      "Pitch to level attitude, set cruise power, then trim",
      "Trim first, then reduce power",
      "Leave climb power and lower nose aggressively",
      "Reduce power only and wait"
    ],
    answer: "Pitch to level attitude, set cruise power, then trim",
    explanation: "Attitude, power, trim keeps transition smooth and prevents large altitude deviations."
  },
  {
    id: "man_descend_for_speed",
    topic: "Flight Maneuvers",
    difficulty: "medium",
    type: "mcq",
    prompt: "To increase descent rate while keeping the same airspeed, the primary change is:",
    choices: ["Reduce power and adjust pitch to hold speed", "Push nose only", "Add flaps only", "Add rudder"],
    answer: "Reduce power and adjust pitch to hold speed",
    explanation: "For a target descent speed, pitch controls speed and power controls rate."
  },
  {
    id: "man_turn_coordination",
    topic: "Flight Maneuvers",
    difficulty: "medium",
    type: "short",
    prompt: "Ball is displaced to the right in a level left turn. What rudder correction is needed?",
    answers: ["right rudder", "apply right rudder", "more right rudder"],
    explanation: "Use the slip/skid rule: step on the ball. Ball right calls for right rudder to re-center."
  },
  {
    id: "man_scan_priority",
    topic: "Flight Maneuvers",
    difficulty: "easy",
    type: "multi",
    prompt: "During basic maneuver practice, which instrument/performance cues should be monitored continuously?",
    choices: ["Attitude", "Airspeed", "Altitude trend", "Oil pressure only"],
    answers: ["Attitude", "Airspeed", "Altitude trend"],
    explanation: "The outside horizon and attitude are primary, supported by airspeed and altitude trend."
  },

  {
    id: "perf_best_glide",
    topic: "Performance",
    difficulty: "easy",
    type: "mcq",
    prompt: "Typical C172S best glide speed near max gross is:",
    choices: ["68 KIAS", "55 KIAS", "85 KIAS", "105 KIAS"],
    answer: "68 KIAS",
    explanation: "68 KIAS is the common POH value for best glide in many C172S configs."
  },
  {
    id: "perf_range_endurance",
    topic: "Performance",
    difficulty: "medium",
    type: "matching",
    prompt: "Match objective to speed concept.",
    pairs: [
      { left: "Maximum gliding distance", right: "Best glide / best L/D" },
      { left: "Maximum time aloft", right: "Minimum power required" },
      { left: "Best climb over obstacle", right: "Vx" },
      { left: "Best climb per minute", right: "Vy" }
    ],
    explanation: "Range and endurance are different optimization targets."
  },
  {
    id: "perf_density_altitude",
    topic: "Performance",
    difficulty: "medium",
    type: "multi",
    prompt: "High density altitude usually causes which outcomes?",
    choices: ["Longer takeoff roll", "Reduced climb performance", "Higher true airspeed for same IAS", "Shorter landing roll always"],
    answers: ["Longer takeoff roll", "Reduced climb performance", "Higher true airspeed for same IAS"],
    explanation: "Hot/high conditions reduce performance and increase ground run risk."
  },
  {
    id: "perf_turning_error",
    topic: "Performance",
    difficulty: "hard",
    type: "mcq",
    prompt: "In a steepening level turn, if back pressure is not increased, what occurs first?",
    choices: ["Altitude loss", "Instant stall", "Engine overspeed", "Heading gyro failure"],
    answer: "Altitude loss",
    explanation: "More bank increases load factor and required lift. Without added back pressure, the aircraft descends."
  },
  {
    id: "perf_accel_compass",
    topic: "Performance",
    difficulty: "hard",
    type: "mcq",
    prompt: "On easterly or westerly headings in the northern hemisphere, accelerating causes the magnetic compass to indicate a turn toward:",
    choices: ["North", "South", "East", "West"],
    answer: "North",
    explanation: "ANDS: Accelerate North, Decelerate South."
  },

  {
    id: "c172_v_speeds",
    topic: "C172S Specific",
    difficulty: "easy",
    type: "matching",
    prompt: "Match each common C172S speed to its use (verify in your POH).",
    pairs: [
      { left: "Vr 55 KIAS", right: "Rotation speed" },
      { left: "Vx 62 KIAS", right: "Best angle climb" },
      { left: "Vy 74 KIAS", right: "Best rate climb" },
      { left: "Vg 68 KIAS", right: "Best glide" }
    ],
    explanation: "Speeds vary with weight/configuration. Confirm against your own aircraft and checklist."
  },
  {
    id: "c172_flap_limits",
    topic: "C172S Specific",
    difficulty: "medium",
    type: "mcq",
    prompt: "Typical flap operating limits in many C172S models are:",
    choices: ["10 deg up to 110 KIAS; >10 deg up to 85 KIAS", "All flap settings up to 129 KIAS", "10 deg up to 85 KIAS only", "No speed limits for flaps"],
    answer: "10 deg up to 110 KIAS; >10 deg up to 85 KIAS",
    explanation: "Use POH and placards as final authority for your specific aircraft."
  },
  {
    id: "c172_stall_recovery",
    topic: "C172S Specific",
    difficulty: "medium",
    type: "sequence",
    prompt: "Order a basic stall recovery flow for training context.",
    items: [
      "Reduce angle of attack",
      "Apply full power smoothly",
      "Level wings with coordinated controls",
      "Retract flaps incrementally as recommended",
      "Return to desired flight path"
    ],
    correctOrder: [
      "Reduce angle of attack",
      "Apply full power smoothly",
      "Level wings with coordinated controls",
      "Retract flaps incrementally as recommended",
      "Return to desired flight path"
    ],
    explanation: "Priority is reducing AOA and regaining controlled flight."
  },
  {
    id: "c172_slow_flight_focus",
    topic: "C172S Specific",
    difficulty: "medium",
    type: "multi",
    prompt: "In slow flight practice, which cues should prompt immediate correction?",
    choices: ["Mushy controls", "Buffet or stall warning", "Uncoordinated slip/skid", "Cabin noise change only"],
    answers: ["Mushy controls", "Buffet or stall warning", "Uncoordinated slip/skid"],
    explanation: "Slow flight is a control and coordination exercise close to stall margins."
  },
  {
    id: "c172_takeoff_abort",
    topic: "C172S Specific",
    difficulty: "hard",
    type: "short",
    prompt: "Before rotation, you lose expected acceleration. What is the practical action?",
    answers: ["abort takeoff", "reject takeoff", "close throttle and stop"],
    explanation: "If performance is not as expected before liftoff, reject on runway while runway remains."
  },

  {
    id: "canadian_vfr_altitudes",
    topic: "Canadian PPL Ops",
    difficulty: "medium",
    type: "mcq",
    prompt: "For VFR cruising above 3000 AGL in Canada, easterly magnetic tracks generally use:",
    choices: ["Odd thousands + 500 ft", "Even thousands + 500 ft", "Any altitude at pilot discretion", "Only odd thousands exact"],
    answer: "Odd thousands + 500 ft",
    explanation: "Semicircular cruising altitude rule applies by magnetic track direction."
  },
  {
    id: "canadian_vfr_code",
    topic: "Canadian PPL Ops",
    difficulty: "easy",
    type: "mcq",
    prompt: "Typical VFR transponder code in Canada (unless assigned otherwise):",
    choices: ["1200", "2000", "7500", "7700"],
    answer: "1200",
    explanation: "Use assigned codes when instructed; otherwise 1200 is common VFR squawk."
  },
  {
    id: "canadian_docs",
    topic: "Canadian PPL Ops",
    difficulty: "medium",
    type: "multi",
    prompt: "Which aircraft documents should be on board and valid for normal private operations?",
    choices: ["Certificate of Registration", "Certificate of Airworthiness", "Journey log (as required)", "Commercial operating certificate"],
    answers: ["Certificate of Registration", "Certificate of Airworthiness", "Journey log (as required)"],
    explanation: "Commercial operating certificate is not part of private training ops."
  },
  {
    id: "canadian_circuit_radio",
    topic: "Canadian PPL Ops",
    difficulty: "hard",
    type: "short",
    prompt: "At an uncontrolled aerodrome, what is the core radio behavior in circuit?",
    context: "Short practical phrase.",
    answers: ["broadcast position and intentions clearly on the proper frequency", "make clear position and intention calls", "clear position and intentions"],
    explanation: "Predictability and clear calls reduce collision risk in the circuit."
  },
  {
    id: "canadian_commercial_exclusion",
    topic: "Canadian PPL Ops",
    difficulty: "easy",
    type: "mcq",
    prompt: "This trainer is designed for PPL practical knowledge. Which topic should be excluded?",
    choices: ["Commercial revenue flight planning regulations", "Basic controlled/uncontrolled airspace awareness", "Takeoff and climb technique", "Pilot decision-making in training"],
    answer: "Commercial revenue flight planning regulations",
    explanation: "Your requested scope excludes commercial pilot knowledge."
  },

  {
    id: "practical_takeoff_brief",
    topic: "Practical Flying",
    difficulty: "medium",
    type: "sequence",
    prompt: "Order a concise takeoff briefing flow for training flights.",
    items: [
      "Runway and departure path",
      "Rotation/climb speeds",
      "Abort point and rejected takeoff plan",
      "Engine failure actions after liftoff",
      "Any local threat or weather note"
    ],
    correctOrder: [
      "Runway and departure path",
      "Rotation/climb speeds",
      "Abort point and rejected takeoff plan",
      "Engine failure actions after liftoff",
      "Any local threat or weather note"
    ],
    explanation: "A short, repeatable briefing improves reaction speed under stress."
  },
  {
    id: "practical_go_around",
    topic: "Practical Flying",
    difficulty: "medium",
    type: "mcq",
    prompt: "If approach becomes unstable, the safest default action is:",
    choices: ["Go around early", "Force the landing", "Slip aggressively below limits", "Delay decision until flare"],
    answer: "Go around early",
    explanation: "A timely go-around is a strong airmanship decision, not a failure."
  },
  {
    id: "practical_trim",
    topic: "Practical Flying",
    difficulty: "easy",
    type: "short",
    prompt: "Finish the phrase: Attitude, power, ______.",
    answers: ["trim"],
    explanation: "This sequence supports stable control and low workload."
  },
  {
    id: "practical_checklist_discipline",
    topic: "Practical Flying",
    difficulty: "medium",
    type: "multi",
    prompt: "Good checklist discipline includes:",
    choices: ["Challenge-response verification", "Rushing to avoid delaying others", "Using flows then checklist backup", "Stopping if interrupted and re-anchoring"],
    answers: ["Challenge-response verification", "Using flows then checklist backup", "Stopping if interrupted and re-anchoring"],
    explanation: "Checklist discipline is a major threat-management tool."
  },
  {
    id: "practical_workload",
    topic: "Practical Flying",
    difficulty: "hard",
    type: "mcq",
    prompt: "During high workload in circuit, what should be prioritized first?",
    choices: ["Aviate, navigate, communicate", "Talk first to reduce pressure", "Tune avionics menus", "Recalculate fuel burn"],
    answer: "Aviate, navigate, communicate",
    explanation: "Control and flight path always come first."
  },

  {
    id: "perf_turn_radius",
    topic: "Performance",
    difficulty: "hard",
    type: "mcq",
    prompt: "At the same true airspeed, increasing bank angle generally causes turn radius to:",
    choices: ["Decrease", "Increase", "Stay unchanged", "Become random"],
    answer: "Decrease",
    explanation: "More bank increases horizontal lift component, tightening the turn."
  },
  {
    id: "man_power_pitch_relationship",
    topic: "Flight Maneuvers",
    difficulty: "medium",
    type: "mcq",
    prompt: "In many training contexts, a practical memory aid is:",
    choices: ["Pitch for speed, power for altitude/rate", "Pitch for heading, power for trim", "Rudder for climb, aileron for descent", "Flaps for cruise performance"],
    answer: "Pitch for speed, power for altitude/rate",
    explanation: "Use this as a teaching model, while respecting exact phase-of-flight technique from your instructor."
  },
  {
    id: "c172_stall_types",
    topic: "C172S Specific",
    difficulty: "medium",
    type: "matching",
    prompt: "Match stall context to typical setup cue.",
    pairs: [
      { left: "Power-off approach stall", right: "Landing-like configuration, decelerating" },
      { left: "Power-on departure stall", right: "Takeoff-like attitude with higher power" },
      { left: "Accelerated stall", right: "Higher load factor (e.g., steep turn)" }
    ],
    explanation: "Different triggers, same core recovery priority: reduce AOA and regain control."
  },
  {
    id: "canadian_metar_read",
    topic: "Canadian PPL Ops",
    difficulty: "hard",
    type: "short",
    prompt: "In a METAR, what does the altimeter group beginning with 'A' represent?",
    answers: ["altimeter setting in inches of mercury", "altimeter setting", "pressure setting"],
    explanation: "In Canadian METAR format, A2992 means 29.92 inHg altimeter setting."
  },
  {
    id: "practical_pre_takeoff",
    topic: "Practical Flying",
    difficulty: "easy",
    type: "multi",
    prompt: "Before takeoff roll, confirm at minimum:",
    choices: ["Runway identification", "Engine instruments in range", "Takeoff briefing complete", "Cabin music playlist"],
    answers: ["Runway identification", "Engine instruments in range", "Takeoff briefing complete"],
    explanation: "Final before-takeoff checks prevent high-consequence errors."
  }
];
