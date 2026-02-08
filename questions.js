const questionBank = [
  // ==========================================
  // TOPIC: SPEEDS (MEMORY ITEMS) - C172S
  // ==========================================
  {
    id: "v_vr",
    category: "C172s Specs",
    type: "input",
    difficulty: "easy",
    question: "What is the rotation speed (Vr) in KIAS?",
    correctAnswer: ["55", "55 kias"],
    explanation: "Rotate at 55 KIAS."
  },
  {
    id: "v_vx",
    category: "C172s Specs",
    type: "input",
    difficulty: "medium",
    question: "What is the Best Angle of Climb speed (Vx) in KIAS?",
    correctAnswer: ["62", "62 kias"],
    explanation: "Vx (62 KIAS) gives the most altitude gain over a given distance."
  },
  {
    id: "v_vy",
    category: "C172s Specs",
    type: "input",
    difficulty: "medium",
    question: "What is the Best Rate of Climb speed (Vy) in KIAS?",
    correctAnswer: ["74", "74 kias"],
    explanation: "Vy (74 KIAS) gives the most altitude gain over a given time."
  },
  {
    id: "v_vbg",
    category: "C172s Specs",
    type: "input",
    difficulty: "medium",
    question: "What is the Best Glide speed (Vbg) in KIAS?",
    correctAnswer: ["68", "68 kias"],
    explanation: "68 KIAS provides the maximum gliding distance."
  },
  {
    id: "v_vfe_10",
    category: "C172s Specs",
    type: "input",
    difficulty: "hard",
    question: "What is the maximum speed for Flaps 10 (Vfe 10 deg)?",
    correctAnswer: ["110", "110 kias"],
    explanation: "Flaps 10 can be deployed below 110 KIAS."
  },
  {
    id: "v_vfe_full",
    category: "C172s Specs",
    type: "input",
    difficulty: "hard",
    question: "What is the maximum speed for Flaps 20-30 (Vfe)?",
    correctAnswer: ["85", "85 kias"],
    explanation: "Flaps greater than 10 degrees are limited to 85 KIAS."
  },
  {
    id: "v_va",
    category: "C172s Specs",
    type: "input",
    difficulty: "hard",
    question: "What is the Maneuvering Speed (Va) at 2550 lbs (Max Gross)?",
    correctAnswer: ["105", "105 kias"],
    explanation: "Va is 105 KIAS at max gross weight, decreasing as weight decreases."
  },
   {
    id: "v_vno",
    category: "C172s Specs",
    type: "input",
    difficulty: "hard",
    question: "What is the top of the green arc (Vno)?",
    correctAnswer: ["129", "129 kias"],
    explanation: "Max structural cruising speed is 129 KIAS."
  },
  {
    id: "v_vne",
    category: "C172s Specs",
    type: "input",
    difficulty: "hard",
    question: "What is the Never Exceed speed (Vne)?",
    correctAnswer: ["163", "163 kias"],
    explanation: "Red line is 163 KIAS."
  },

  // ==========================================
  // TOPIC: ATTITUDES & MOVEMENTS
  // ==========================================
  {
    id: "am_yaw",
    category: "Attitudes & Movements",
    type: "mcq",
    difficulty: "easy",
    question: "Yaw is movement about the ______ axis.",
    options: ["Vertical", "Lateral", "Longitudinal", "Horizontal"],
    correctAnswer: "Vertical",
    explanation: "Yaw rotates the nose left/right around the vertical axis."
  },
  {
    id: "am_roll",
    category: "Attitudes & Movements",
    type: "mcq",
    difficulty: "easy",
    question: "Roll is movement about the ______ axis.",
    options: ["Longitudinal", "Lateral", "Vertical", "Normal"],
    correctAnswer: "Longitudinal",
    explanation: "Roll rotates the wings around the longitudinal axis (nose to tail)."
  },
  {
    id: "am_pitch",
    category: "Attitudes & Movements",
    type: "mcq",
    difficulty: "easy",
    question: "Pitch is movement about the ______ axis.",
    options: ["Lateral", "Longitudinal", "Vertical", "Normal"],
    correctAnswer: "Lateral",
    explanation: "Pitch moves the nose up/down around the lateral axis (wingtip to wingtip)."
  },
  {
    id: "am_adverse",
    category: "Attitudes & Movements",
    type: "mcq",
    difficulty: "medium",
    question: "When rolling into a left turn, the aircraft initially yaws to the right. This is called:",
    options: ["Adverse Yaw", "Torque", "P-Factor", "Slipstream"],
    correctAnswer: "Adverse Yaw",
    explanation: "The up-going aileron (left) creates less drag than the down-going aileron (right), pulling the nose right."
  },
  {
    id: "am_controls",
    category: "Attitudes & Movements",
    type: "matching",
    difficulty: "easy",
    question: "Match the control surface to the movement.",
    pairs: [
        { item: "Elevator", match: "Pitch" },
        { item: "Ailerons", match: "Roll" },
        { item: "Rudder", match: "Yaw" },
        { item: "Trim Tab", match: "Relieve Pressure" }
    ]
  },

  // ==========================================
  // TOPIC: INSTRUMENTS (PITOT-STATIC & GYRO)
  // ==========================================
  {
    id: "inst_vacuum",
    category: "Instruments",
    type: "mcq",
    difficulty: "medium",
    question: "Which two instruments rely on the Vacuum System in a C172s?",
    options: ["Attitude Indicator & Heading Indicator", "Turn Coordinator & Attitude Indicator", "Heading Indicator & VSI", "Altimeter & ASI"],
    correctAnswer: "Attitude Indicator & Heading Indicator",
    explanation: "The AI and HI are vacuum gyros. The Turn Coordinator is usually electric."
  },
  {
    id: "inst_blocked_pitot",
    category: "Instruments",
    type: "mcq",
    difficulty: "hard",
    question: "Blocked Pitot Tube but Open Drain Hole. What does the ASI read?",
    options: ["Zero", "Freezes", "Acts like Altimeter", "Fluctuates"],
    correctAnswer: "Zero",
    explanation: "Ram air is blocked, but pressure drains out to static pressure (via drain), so differential is zero."
  },
  {
    id: "inst_blocked_static",
    category: "Instruments",
    type: "mcq",
    difficulty: "hard",
    question: "Blocked Static Port. What happens to the Altimeter?",
    options: ["Freezes at the altitude of blockage", "Drops-to-Zero", "Acts like ASI", "Reads Lower"],
    correctAnswer: "Freezes at the altitude of blockage",
    explanation: "Trapped static pressure keeps the instrument reading constant regardless of actual altitude change."
  },
  {
    id: "inst_alt_temp",
    category: "Instruments",
    type: "fill_blank",
    difficulty: "hard",
    question: "From High to Low, look out below. If you fly from warm air to cold air without adjusting the altimeter, you are ______ than indicated.",
    correctAnswer: ["lower"],
    explanation: "Cold air is denser. The pressure levels are compressed downwards, so you are lower than the altimeter indicates."
  },

  // ==========================================
  // TOPIC: TURNS (UNOS/ANDS)
  // ==========================================
  {
    id: "turn_rate",
    category: "Turns",
    type: "mcq",
    difficulty: "medium",
    question: "A standard rate turn is ____ degrees per second.",
    options: ["3", "2", "6", "4"],
    correctAnswer: "3",
    explanation: "3 degrees per second completes a 360 turn in 2 minutes."
  },
  {
    id: "turn_load_60",
    category: "Turns",
    type: "input",
    difficulty: "hard",
    question: "In a stable 60-degree bank turn, the load factor is ______ Gs.",
    correctAnswer: ["2", "2.0"],
    explanation: "Load factor doubles at 60 degrees bank (1 / cos 60)."
  },
  {
    id: "err_unos_n",
    category: "Compass Errors",
    type: "fill_blank",
    difficulty: "medium",
    question: "UNOS: When turning from North, the compass initially indicates a turn in the ______ direction.",
    correctAnswer: ["opposite", "wrong"],
    explanation: "Undershoot North / Opposite indication."
  },
  {
    id: "err_ands_e",
    category: "Compass Errors",
    type: "mcq",
    difficulty: "medium",
    question: "ANDS: You are heading East and decelerate. The compass dips to the:",
    options: ["South", "North", "West", "East"],
    correctAnswer: "South",
    explanation: "Decelerate South (ANDS)."
  },

  // ==========================================
  // TOPIC: CLIMBS & DESCENTS
  // ==========================================
  {
    id: "climb_service_ceiling",
    category: "Climbs",
    type: "mcq",
    difficulty: "hard",
    question: "The Service Ceiling is the altitude where the aircraft can maintain a climb rate of:",
    options: ["100 fpm", "50 fpm", "0 fpm", "500 fpm"],
    correctAnswer: "100 fpm",
    explanation: "Service Ceiling = 100 fpm. Absolute Ceiling = 0 fpm."
  },
  {
    id: "climb_factor",
    category: "Climbs",
    type: "mcq",
    difficulty: "medium",
    question: "Is Vx (Best Angle) affected by wind?",
    options: ["Yes, groundspeed changes climb angle relative to ground", "No, it is an airspeed", "Only headwinds affect it", "Only tailwinds affect it"],
    correctAnswer: "Yes, groundspeed changes climb angle relative to ground",
    explanation: "While the IAS for Vx doesn't change much, the *resultant* angle relative to the ground (obstacle clearance) is highly dependent on groundspeed/wind."
  },
  {
    id: "desc_power_off",
    category: "Descents",
    type: "mcq",
    difficulty: "easy",
    question: "In a power-off descent, if you pitch down to increase airspeed, your rate of descent will:",
    options: ["Increase", "Decrease", "Stay same", "Depend on wind"],
    correctAnswer: "Increase",
    explanation: "Diving increases airspeed but drastically increases descent rate (sink)."
  },

  // ==========================================
  // TOPIC: SLOW FLIGHT & STALLS
  // ==========================================
  {
    id: "stall_spin",
    category: "Stalls",
    type: "mcq",
    difficulty: "hard",
    question: "A spin is an aggravated stall where one wing is ______ more than the other.",
    options: ["Stalled", "Lifted", "Powered", "Angled"],
    correctAnswer: "Stalled",
    explanation: "Both wings are stalled in a spin, but one is MORE stalled than the other, causing autorotation."
  },
  {
    id: "sf_recovery",
    category: "Slow Flight",
    type: "mcq",
    difficulty: "medium",
    question: "To recover from slow flight to cruise:",
    options: ["Add full power, lower nose, clean up flaps (if any)", "Lower nose then add power", "Retract flaps then power", "Just level off"],
    correctAnswer: "Add full power, lower nose, clean up flaps (if any)",
    explanation: "Power is needed to accelerate. Lower nose to maintain altitude while accelerating."
  },
  {
    id: "stall_spiral",
    category: "Stalls",
    type: "mcq",
    difficulty: "hard",
    question: "Is the airspeed low or high in a spiral dive?",
    options: ["High and increasing", "Low and decreasing", "Constant", "Stalled"],
    correctAnswer: "High and increasing",
    explanation: "A spiral dive is NOT a stall. The wing is flying, airspeed is increasing rapidly, G-load is high."
  },

  // ==========================================
  // TOPIC: PERFORMANCE (General)
  // ==========================================
  {
    id: "perf_density",
    category: "Performance",
    type: "mcq",
    difficulty: "medium",
    question: "High Density Altitude (Hot/High/Humid) has what effect on takeoff distance?",
    options: ["Increases distance", "Decreases distance", "No effect", "Improves climb"],
    correctAnswer: "Increases distance",
    explanation: "Less dense air reduces engine power, thrust, and lift."
  },
  {
    id: "perf_ground_effect",
    category: "Performance",
    type: "mcq",
    difficulty: "medium",
    question: "Ground effect is caused by:",
    options: ["Reduction of induced drag near the surface", "Increased air density near ground", "Wind shear", "Tire friction"],
    correctAnswer: "Reduction of induced drag near the surface",
    explanation: "Wingtip vortices are disrupted by the ground, reducing induced drag and increasing lift."
  },
  
  // ==========================================
  // TOPIC: ACRONYMS & PROCEDURES
  // ==========================================
  {
    id: "acro_hasel",
    category: "Procedures",
    type: "input",
    difficulty: "medium",
    question: "HASEL Check: H stands for ______.",
    correctAnswer: ["height"],
    explanation: "Height: Ensure sufficient altitude for recovery (usually 2000' AGL min)."
  },
  {
    id: "acro_clpat",
    category: "Procedures",
    type: "input",
    difficulty: "medium",
    question: "Pre-landing Check: CLPAT. P stands for ______.",
    correctAnswer: ["power"],
    explanation: "Power: Set for descent/approach."
  }, 
  {
    id: "acro_freda",
    category: "Procedures",
    type: "input",
    difficulty: "medium",
    question: "Enroute Check: FREDA. F stands for ______.",
    correctAnswer: ["fuel"],
    explanation: "Fuel: Quantity, tank selection, balance."
  },

  // ==========================================
  // TOPIC: STRAIGHT & LEVEL
  // ==========================================
  {
    id: "sl_trim",
    category: "Straight & Level",
    type: "mcq",
    difficulty: "medium",
    question: "You are holding constant back pressure to maintain altitude. You should trim:",
    options: ["Nose Up", "Nose Down", "Rudder Left", "Rudder Right"],
    correctAnswer: "Nose Up",
    explanation: "If you are pulling back, the nose is too heavy. Trim nose up to relieve that pressure."
  },
  {
    id: "sl_speed",
    category: "Straight & Level",
    type: "mcq",
    difficulty: "medium",
    question: "To increase airspeed in straight and level flight, you add power. What else must you do?",
    options: ["Apply forward pressure (lower nose) to maintain altitude", "Apply back pressure", "Trim nose up", "Nothing"],
    correctAnswer: "Apply forward pressure (lower nose) to maintain altitude",
    explanation: "Added power creates lift (and torque). To stop climbing, you must lower the pitch attitude."
  },

  // ==========================================
  // TOPIC: RANGE & ENDURANCE
  // ==========================================
  {
    id: "re_glide",
    category: "Performance",
    type: "mcq",
    difficulty: "medium",
    question: "Gliding for Range means using which speed?",
    options: ["Best Glide (68)", "Minimum Sink Speed", "Stall Speed", "Vne"],
    correctAnswer: "Best Glide (68)",
    explanation: "Best Glide gives the best L/D ratio, meaning maximum horizontal distance for altitude lost."
  },
  {
    id: "re_endure",
    category: "Performance",
    type: "mcq",
    difficulty: "medium",
    question: "Flying for Endurance means flying at the speed for:",
    options: ["Minimum Power Required", "Minimum Drag", "Maximum Lift", "Maximum RPM"],
    correctAnswer: "Minimum Power Required",
    explanation: "Minimum power creates the lowest fuel flow per hour."
  },

  // ==========================================
  // TOPIC: FORCE & LOAD
  // ==========================================
  {
    id: "lf_spin",
    category: "General Knowledge",
    type: "input",
    difficulty: "easy",
    question: "The ratio of Lift to Weight is known as the ______ factor.",
    correctAnswer: ["load"],
    explanation: "Load Factor (G-Force)."
  },
  {
    id: "lf_stall_speed",
    category: "General Knowledge",
    type: "mcq",
    difficulty: "hard",
    question: "As bank angle increases, stall speed:",
    options: ["Increases", "Decreases", "Stays same", "Is zero"],
    correctAnswer: "Increases",
    explanation: "Load factor increases in a turn. Stall speed increases with the square root of the load factor."
  },
  
  // ==========================================
  // TOPIC: TAKEOFF BRIEFING
  // ==========================================
  {
    id: "to_brief",
    category: "Takeoff",
    type: "matching",
    difficulty: "medium",
    question: "Match the emergency action to the phase of takeoff.",
    pairs: [
      { item: "Engine failure before rotation", match: "Idle, Brakes, Stop" },
      { item: "Engine failure after rotation (runway remaining)", match: "Nose down, Land straight ahead" },
      { item: "Engine failure at 500' AGL (no runway)", match: "Pick field 30deg either side of nose" }
    ]
  },
  // Adding more simple fill-ins
  {
    id: "fill_asi_color",
    category: "Instruments",
    type: "input",
    difficulty: "easy",
    question: "The white arc on the ASI indicates the ______ operating range.",
    correctAnswer: ["flap", "flaps"],
    explanation: "White arc = Flap operating range (Vso to Vfe)."
  },
  {
    id: "fill_asi_green",
    category: "Instruments",
    type: "input",
    difficulty: "easy",
    question: "The green arc on the ASI indicates the ______ operating range.",
    correctAnswer: ["normal"],
    explanation: "Green arc = Normal operating range (Vs to Vno)."
  },
  {
    id: "fill_asi_yellow",
    category: "Instruments",
    type: "input",
    difficulty: "easy",
    question: "The yellow arc on the ASI indicates the ______ range. (Only in smooth air)",
    correctAnswer: ["caution"],
    explanation: "Yellow arc = Caution range."
  },
   {
    id: "fill_suction",
    category: "Instruments",
    type: "input",
    difficulty: "medium",
    question: "Normal suction range for the vacuum system is usually between ______ and 5.4 in Hg.",
    correctAnswer: ["4.5", "4.6", "4.8"], // Depending on manual, usually 4.5 or 4.8. Let's accept 4.5.
    explanation: "Green arc on suction gauge is typically 4.5 to 5.4."
  },
  
  // ==========================================
  // TOPIC: YAW FACTORS (Propeller)
  // ==========================================
  {
    id: "yaw_p_factor",
    category: "Attitudes & Movements",
    type: "mcq",
    difficulty: "medium",
    question: "P-Factor (Asymmetric Thrust) is most prominent when the aircraft is at:",
    options: ["High AOA", "Low AOA", "High Speed", "Low Power"],
    correctAnswer: "High AOA",
    explanation: "At high AOA, the descending blade (right) takes a bigger bite of air than the ascending blade, creating left yaw."
  },
  {
    id: "yaw_slipstream",
    category: "Attitudes & Movements",
    type: "mcq",
    difficulty: "medium",
    question: "Slipstream Effect pushes the tail to the right and nose to the left due to:",
    options: ["Corkscrewing air hitting the vertical fin", "Torque of the engine", "Gyroscopic Precession", "Wind"],
    correctAnswer: "Corkscrewing air hitting the vertical fin",
    explanation: "The prop wash spirals around the fuselage and strikes the left side of the vertical fin."
  },
   {
    id: "yaw_gyro",
    category: "Attitudes & Movements",
    type: "mcq",
    difficulty: "hard",
    question: "Gyroscopic Precession effects are mostly noticed in:",
    options: ["Taildraggers on takeoff (lifting tail)", "C172s in cruise", "Gliders", "Jets"],
    correctAnswer: "Taildraggers on takeoff (lifting tail)",
    explanation: "Lifting the tail changes the plane of rotation, creating a force 90 degrees later. Less noticeable in tricycle gear aircraft."
  }
];
