export type FlowRule = {
  id: string;
  label: string;
  gpdPerBedroom: number;
  note: string;
};

export const FLOW_RULES: FlowRule[] = [
  {
    id: "ny",
    label: "NY 75-A · post-1994 fixtures",
    gpdPerBedroom: 110,
    note: "Appendix 75-A Table 1. New construction with 1.6 gpf toilets sizes at 110 gpd per bedroom.",
  },
  {
    id: "pre94",
    label: "NY 75-A · pre-1994 fixtures",
    gpdPerBedroom: 130,
    note: "3.5 gpf toilets and 3.0 gpm fixtures. Same bedroom count, higher design flow.",
  },
  {
    id: "pre80",
    label: "NY 75-A · pre-1980 fixtures",
    gpdPerBedroom: 150,
    note: "Older EPA-era loading. Some local codes still use 150 gpd per bedroom for everything.",
  },
  {
    id: "common",
    label: "Common 120 gpd (other states)",
    gpdPerBedroom: 120,
    note: "A frequent Midwest / Plains default (e.g. Missouri). Not a New York number.",
  },
];

export const TABLE3 = [
  { bedrooms: "1–3", n: 3, gal: 1000, surface: 27 },
  { bedrooms: "4", n: 4, gal: 1250, surface: 34 },
  { bedrooms: "5", n: 5, gal: 1500, surface: 40 },
  { bedrooms: "6", n: 6, gal: 1750, surface: 47 },
  { bedrooms: "Each extra", n: 7, gal: 250, surface: 7 },
] as const;

export type PercKind = "trench" | "mound" | "none";

export type PercBand = {
  id: string;
  label: string;
  rate: number | null;
  kind: PercKind;
  note: string;
};

/** Application rates aligned to NY 75-A Table 4A / 6A (gpd/ft²). */
export const PERC_BANDS: PercBand[] = [
  {
    id: "1-5",
    label: "1–5 min/in",
    rate: 1.2,
    kind: "trench",
    note: "Fast soil. Some counties cap the rate so effluent is not under-treated.",
  },
  {
    id: "6-7",
    label: "6–7 min/in",
    rate: 1.0,
    kind: "trench",
    note: "Still fast. Conventional trenches are usually allowed if vertical separation holds.",
  },
  {
    id: "8-10",
    label: "8–10 min/in",
    rate: 0.9,
    kind: "trench",
    note: "A common honest perc on sandy loam.",
  },
  {
    id: "11-15",
    label: "11–15 min/in",
    rate: 0.8,
    kind: "trench",
    note: "Workhorse residential soil.",
  },
  {
    id: "16-20",
    label: "16–20 min/in",
    rate: 0.7,
    kind: "trench",
    note: "Field grows. Watch seasonal saturation.",
  },
  {
    id: "21-30",
    label: "21–30 min/in",
    rate: 0.6,
    kind: "trench",
    note: "Larger laterals. Confirm 2 ft to seasonal high water.",
  },
  {
    id: "31-45",
    label: "31–45 min/in",
    rate: 0.5,
    kind: "trench",
    note: "Often the edge of a comfortable conventional field.",
  },
  {
    id: "46-60",
    label: "46–60 min/in",
    rate: 0.45,
    kind: "trench",
    note: "Slowest conventional trench rate in 75-A. Slowest of two tests governs.",
  },
  {
    id: "61-120",
    label: "61–120 min/in",
    rate: 0.2,
    kind: "mound",
    note: "Not a trench soil. A mound basal area may use 0.2 gpd/ft² on 61–120 min/in native soil.",
  },
  {
    id: "slow",
    label: ">120 min/in or refusal",
    rate: null,
    kind: "none",
    note: "Even a mound is typically off the table. Sand filter, ETU plus a different lot, or a holding tank conversation.",
  },
];

export type Setback = {
  id: string;
  feature: string;
  tankMost: number;
  tankRange: string;
  fieldMost: number;
  fieldRange: string;
  nyTank: number;
  nyField: number;
  nyPit: number;
  source: "table2" | "practice";
  why: string;
};

export const SETBACKS: Setback[] = [
  {
    id: "house",
    feature: "House / foundation",
    tankMost: 10,
    tankRange: "5–10",
    fieldMost: 20,
    fieldRange: "10–20",
    nyTank: 10,
    nyField: 20,
    nyPit: 20,
    source: "table2",
    why: "Table 2: tank 10 ft from the dwelling; absorption field, D-box, seepage pit, and mound 20 ft. Access for pumping is the practical reason.",
  },
  {
    id: "well",
    feature: "Private drinking well",
    tankMost: 50,
    tankRange: "50–100",
    fieldMost: 100,
    fieldRange: "50–100+",
    nyTank: 50,
    nyField: 100,
    nyPit: 150,
    source: "table2",
    why: "Table 2, well or suction line: tank 50 ft, absorption field 100 ft, seepage pit 150 ft. Upgrade and in the drainage path to a well: 200 ft (note a).",
  },
  {
    id: "public-well",
    feature: "Public water-supply well",
    tankMost: 200,
    tankRange: "100–300",
    fieldMost: 200,
    fieldRange: "100–300",
    nyTank: 200,
    nyField: 200,
    nyPit: 200,
    source: "table2",
    why: "Table 2’s well column is private wells and suction lines. Public supply wells and the upgrade-drainage footnote both land at 200 ft. Confirm with the water utility.",
  },
  {
    id: "property",
    feature: "Property line",
    tankMost: 10,
    tankRange: "5–10",
    fieldMost: 10,
    fieldRange: "5–20",
    nyTank: 10,
    nyField: 10,
    nyPit: 10,
    source: "table2",
    why: "Table 2: 10 ft for tank, field, pit, and mound. Measure the replacement area too — a reserve that crosses the line is not a reserve.",
  },
  {
    id: "stream",
    feature: "Stream, lake, wetland",
    tankMost: 50,
    tankRange: "25–50",
    fieldMost: 100,
    fieldRange: "50–100",
    nyTank: 50,
    nyField: 100,
    nyPit: 100,
    source: "table2",
    why: "Measured from the mean high-water mark: tank 50 ft, field / pit / mound 100 ft. Fill systems measure from the toe of the slope.",
  },
  {
    id: "drive",
    feature: "Driveway / parking",
    tankMost: 10,
    tankRange: "5–10",
    fieldMost: 10,
    fieldRange: "10",
    nyTank: 10,
    nyField: 10,
    nyPit: 10,
    source: "practice",
    why: "Not a Table 2 line — a construction reality. Loads crush pipe and compact laterals. Parking on a field is a design failure.",
  },
  {
    id: "pool",
    feature: "Swimming pool",
    tankMost: 20,
    tankRange: "15–25",
    fieldMost: 20,
    fieldRange: "15–35",
    nyTank: 20,
    nyField: 35,
    nyPit: 35,
    source: "practice",
    why: "Handbook practice, not Table 2. Excavation, liner, and a wet yard do not mix. Counties often want ~20–35 ft.",
  },
  {
    id: "waterline",
    feature: "Pressurized water line",
    tankMost: 10,
    tankRange: "10",
    fieldMost: 10,
    fieldRange: "10",
    nyTank: 10,
    nyField: 10,
    nyPit: 10,
    source: "table2",
    why: "Table 2 note (e): 10 ft from any water service line. If a sewer crosses a water line, 18 in vertical separation and a sleeve.",
  },
];

export const TABLE2 = [
  {
    component: "House sewer (watertight joints)",
    well: "25 / 50",
    stream: 25,
    dwelling: 3,
    property: 10,
  },
  {
    component: "Septic tank or watertight ETU",
    well: 50,
    stream: 50,
    dwelling: 10,
    property: 10,
  },
  {
    component: "Effluent line to D-box",
    well: 50,
    stream: 50,
    dwelling: 10,
    property: 10,
  },
  {
    component: "Distribution box",
    well: 100,
    stream: 100,
    dwelling: 20,
    property: 10,
  },
  {
    component: "Absorption field",
    well: 100,
    stream: 100,
    dwelling: 20,
    property: 10,
  },
  {
    component: "Seepage pit",
    well: 150,
    stream: 100,
    dwelling: 20,
    property: 10,
  },
  {
    component: "Raised or mound system",
    well: 100,
    stream: 100,
    dwelling: 20,
    property: 10,
  },
  {
    component: "Intermittent sand filter",
    well: 100,
    stream: 100,
    dwelling: 20,
    property: 10,
  },
] as const;

export const TABLE2_NOTES = [
  "Well column is a private well or suction line. Cast-iron house sewer: 25 ft; other pipe: 50 ft.",
  "Upgrade and in the direct path of surface drainage to a well: 200 ft from the closest part of the system (note a).",
  "Streams measured from mean high water. Fill systems measured from the toe of the slope.",
  "Distances also apply to the 100% replacement area.",
  "Watertight sand filter that collects all effluent may drop to 50 ft (note f).",
];

export const GEOMETRY = [
  {
    title: "Liquid depth",
    body: "Minimum 30 in. Maximum 60 in for design-volume credit. Deeper tanks store sludge; they do not buy extra gallons on Table 3.",
  },
  {
    title: "Inlet to outlet",
    body: "At least 6 ft. Rectangular tanks: effective length 2–4× effective width. Surface area must still meet Table 3.",
  },
  {
    title: "Two compartments",
    body: "Recommended on long tanks. Required with a garbage grinder (or two tanks in series). First compartment 60–75% of volume. Outlet invert ~3 in below inlet.",
  },
  {
    title: "Garbage grinder",
    body: "Counts as an extra bedroom: +250 gal and +7 ft² of liquid surface. Outlet needs a listed filter or gas-deflection baffle.",
  },
  {
    title: "Trench geometry",
    body: "24 in maximum width — extras are still sized as 24 in. Gravity laterals 60 ft max; pressure or dosing 100 ft. Dose if total length ≥ 500 ft.",
  },
  {
    title: "Between trenches",
    body: "At least 4 ft of undisturbed soil. Run parallel to contours with level bottoms. Aggregate 6 in under the pipe, 2 in over.",
  },
  {
    title: "Vertical separation",
    body: "2 ft from trench bottom to seasonal high water. 4 ft of usable soil above bedrock or an impermeable layer.",
  },
  {
    title: "Replacement area",
    body: "Leave a 100% reserve of equal soil vacant where the lot allows. Fill, driveways, and sheds on the reserve are how permits go stale.",
  },
];

export type FitStatus = "fits" | "alt" | "no";

export type SystemKind = {
  id: string;
  title: string;
  section: string;
  summary: string;
};

export const SYSTEMS: SystemKind[] = [
  {
    id: "trench",
    title: "Conventional absorption trenches",
    section: "75-A.8",
    summary:
      "The default. Perc 1–60 min/in, 2 ft from trench bottom to seasonal high water, 4 ft of usable soil above rock, slope not more than 15%.",
  },
  {
    id: "pit",
    title: "Seepage pit",
    section: "75-A.8",
    summary:
      "Sidewall area, not trench bottom. Same perc table, 150 ft from a well. Needs deep unsaturated soil. Counties often treat this as last-resort geometry, not a preference.",
  },
  {
    id: "raised",
    title: "Raised system (fill)",
    section: "75-A.9",
    summary:
      "When original soil is only 1–2 ft of usable material. Seasonal high water at least 1 ft below original grade. Slope ≤ 15%. Perc the fill at the borrow pit and again after placement — slower rate governs.",
  },
  {
    id: "mound",
    title: "Mound",
    section: "75-A.9",
    summary:
      "Native perc faster than 120 min/in, water table ≥ 1 ft down, bedrock ≥ 2 ft down, slope ≤ 12%. Basal area uses native soil (0.2 gpd/ft² on 61–120 min/in).",
  },
  {
    id: "sand",
    title: "Intermittent sand filter",
    section: "75-A.8 / 75-A.9",
    summary:
      "A treatment bed when the lot will not take a conventional field. Watertight units that collect all effluent may drop some Table 2 distances to 50 ft.",
  },
  {
    id: "etu",
    title: "ETU / aerobic unit",
    section: "75-A.6",
    summary:
      "NSF/ANSI 40 (or 245 with nitrogen). Rated ≥ 400 gpd or the Table 1 flow, whichever is larger. Still needs an absorption area. A 33% trench-length reduction is allowed only where 75-A says so.",
  },
];

export type SystemFit = {
  id: string;
  title: string;
  section: string;
  status: FitStatus;
  reasons: string[];
};

export type SiteInput = {
  perc: PercBand;
  shwtFt: number;
  rockFt: number;
  slopePct: number;
};

const TRENCH_BOTTOM_FT = 2;
const TRENCH_TO_WATER = 2;
const TRENCH_TO_ROCK = 4;

export function siteFit(site: SiteInput): SystemFit[] {
  const { perc, shwtFt, rockFt, slopePct } = site;
  const trenchWaterOk = shwtFt >= TRENCH_BOTTOM_FT + TRENCH_TO_WATER;
  const trenchRockOk = rockFt >= TRENCH_BOTTOM_FT + TRENCH_TO_ROCK;
  const trenchPerc = perc.kind === "trench";
  const moundPerc = perc.kind === "trench" || perc.kind === "mound";

  const trenchReasons: string[] = [];
  if (!trenchPerc) trenchReasons.push("Perc slower than 60 min/in — Table 4A will not size a trench.");
  if (slopePct > 15) trenchReasons.push(`Slope ${slopePct}% is over the 15% conventional / raised cap.`);
  if (!trenchWaterOk) {
    trenchReasons.push(
      `Seasonal high water at ${shwtFt} ft does not leave 2 ft under a 24-in trench bottom.`,
    );
  }
  if (!trenchRockOk) {
    trenchReasons.push(`Bedrock at ${rockFt} ft is short of 4 ft of usable soil under a 24-in trench.`);
  }

  const pitReasons: string[] = [];
  if (!trenchPerc) pitReasons.push("Perc slower than 60 min/in — a pit uses the same application table.");
  if (shwtFt < 8) pitReasons.push("A pit needs several feet of unsaturated sidewall. Water at this depth is not enough.");
  if (rockFt < 10) pitReasons.push("Bedrock this shallow will not take a legal pit wall.");

  const shallowSite = shwtFt < TRENCH_BOTTOM_FT + TRENCH_TO_WATER || rockFt < TRENCH_BOTTOM_FT + TRENCH_TO_ROCK;
  const raisedReasons: string[] = [];
  if (!trenchPerc) raisedReasons.push("Fill still has to perc faster than 60 min/in.");
  if (slopePct > 15) raisedReasons.push(`Slope ${slopePct}% exceeds 15%.`);
  if (shwtFt < 1) raisedReasons.push("Seasonal high water must sit at least 1 ft below original grade.");
  if (rockFt < 1) raisedReasons.push("Need at least 1 ft of original soil above rock or an impermeable layer.");
  if (trenchPerc && !shallowSite) {
    raisedReasons.push("Conventional trenches already fit — a raised bed is the shallow-soil path, not a preference.");
  }

  const moundReasons: string[] = [];
  if (!moundPerc) moundReasons.push("Native perc slower than 120 min/in — 75-A will not mound this soil.");
  if (slopePct > 12) moundReasons.push(`Slope ${slopePct}% exceeds the 12% mound cap.`);
  if (shwtFt < 1) moundReasons.push("Seasonal high water must be at least 1 ft below original grade.");
  if (rockFt < 2) moundReasons.push("Bedrock must be at least 2 ft below original grade.");

  const trenchFits = trenchReasons.length === 0;
  const pitFits = pitReasons.length === 0;
  const raisedHardFail = raisedReasons.some((r) => !r.startsWith("Conventional"));
  const raisedFits = !raisedHardFail && shallowSite && trenchPerc && slopePct <= 15 && shwtFt >= 1 && rockFt >= 1;
  const moundFits = moundReasons.length === 0;

  return [
    {
      id: "trench",
      title: "Conventional absorption trenches",
      section: "75-A.8",
      status: trenchFits ? "fits" : "no",
      reasons: trenchFits ? ["Perc, slope, and vertical separation all clear Table 4A / 75-A.8."] : trenchReasons,
    },
    {
      id: "pit",
      title: "Seepage pit",
      section: "75-A.8",
      status: pitFits ? "alt" : "no",
      reasons: pitFits
        ? ["Deep unsaturated soil and a legal perc. Still 150 ft from a well. Ask the county before drawing one."]
        : pitReasons,
    },
    {
      id: "raised",
      title: "Raised system (fill)",
      section: "75-A.9",
      status: raisedFits ? "fits" : raisedHardFail ? "no" : "alt",
      reasons: raisedFits
        ? ["Shallow original soil with 1 ft to water and a legal perc. Size the fill; slower of borrow-pit and placed tests governs."]
        : raisedReasons,
    },
    {
      id: "mound",
      title: "Mound",
      section: "75-A.9",
      status: moundFits ? (trenchFits ? "alt" : "fits") : "no",
      reasons: moundFits
        ? [
            trenchFits
              ? "A mound would be legal, but conventional trenches already fit."
              : perc.kind === "mound"
                ? "Native soil is a 61–120 min/in mound case. Basal area at 0.2 gpd/ft²."
                : "Water table / rock / slope allow a mound. Basal area follows native perc.",
          ]
        : moundReasons,
    },
    {
      id: "sand",
      title: "Intermittent sand filter",
      section: "75-A.8 / .9",
      status: "alt",
      reasons: [
        "Available when the lot will not take a conventional field. Watertight collecting filters may use the 50 ft footnote.",
      ],
    },
    {
      id: "etu",
      title: "ETU / aerobic unit",
      section: "75-A.6",
      status: "alt",
      reasons: [
        "Pretreatment, not a substitute for soil. NSF 40 (245 if nitrogen). A 33% trench cut is conditional — not automatic.",
      ],
    },
  ];
}

export const CERTS = [
  {
    id: "epa",
    mark: "EPA",
    title: "OWTS Manual (EPA/625/R-00/008)",
    body: "Federal guidance, not a permit. Siting, tanks, fields, and performance boundaries. States write the enforceable numbers.",
  },
  {
    id: "ny75a",
    mark: "NY 75-A",
    title: "Appendix 75-A + Design Handbook",
    body: "Statewide floor for residential systems under 1,000 gpd. County health departments issue the permit and may be stricter. Watersheds (NYC, Suffolk, Nassau) add nitrogen rules.",
  },
  {
    id: "nsf40",
    mark: "NSF/ANSI 40",
    title: "Residential treatment — Class I",
    body: "Aerobic and similar units, 400–1,500 gpd. Class I: 30-day average CBOD₅ ≤ 25 mg/L and TSS ≤ 30 mg/L. Many counties require the label for ATUs.",
  },
  {
    id: "nsf245",
    mark: "NSF/ANSI 245",
    title: "Nitrogen reduction",
    body: "Same Class I effluent, plus ≥ 50% total-nitrogen reduction. Must also meet NSF 40. Used where wells and coastal nitrogen caps bite.",
  },
  {
    id: "nsf46",
    mark: "NSF/ANSI 46",
    title: "Effluent filters & components",
    body: "Filters on the tank outlet. NY wants a listed filter (or an ETU with one built in) before the field when a grinder is expected.",
  },
  {
    id: "nsf350",
    mark: "NSF/ANSI 350",
    title: "Onsite water reuse",
    body: "Stricter than 40: CBOD and TSS around 10 mg/L, plus E. coli limits. For systems that irrigate or recycle, not a standard trench.",
  },
];

export const TIERS = [
  {
    n: "01",
    title: "Federal",
    body: "EPA researches and funds. The Clean Water Act leaves onsite systems to the states. There is no national setback statute.",
  },
  {
    n: "02",
    title: "State",
    body: "In New York that is Appendix 75-A and the Residential OWTS Design Handbook. Tank gallons, 110 gpd/bedroom, vertical separation, listed units.",
  },
  {
    n: "03",
    title: "County",
    body: "The local health department stamps the plan and often tightens the state floor. Neighboring counties can disagree. Always call theirs.",
  },
];

export function designFlow(bedrooms: number, gpdPerBedroom: number): number {
  return Math.max(1, bedrooms) * gpdPerBedroom;
}

export function tankGallons(bedrooms: number, disposal: boolean): number {
  const br = Math.max(1, bedrooms) + (disposal ? 1 : 0);
  if (br <= 3) return 1000;
  if (br === 4) return 1250;
  if (br === 5) return 1500;
  if (br === 6) return 1750;
  return 1750 + (br - 6) * 250;
}

export function tankSurface(bedrooms: number, disposal: boolean): number {
  const br = Math.max(1, bedrooms) + (disposal ? 1 : 0);
  if (br <= 3) return 27;
  if (br === 4) return 34;
  if (br === 5) return 40;
  if (br === 6) return 47;
  return 47 + (br - 6) * 7;
}

export function table3Row(bedrooms: number, disposal: boolean): number {
  return Math.max(1, bedrooms) + (disposal ? 1 : 0);
}

export function twoTimesFlow(flow: number): number {
  return Math.max(1000, 2 * flow);
}

export function fieldArea(flow: number, rate: number | null): number | null {
  if (!rate || rate <= 0) return null;
  return Math.ceil(flow / rate);
}

export function trenchLength(area: number | null, widthFt: number): number | null {
  if (!area) return null;
  return Math.ceil(area / widthFt);
}

export function laterals(lengthFt: number | null, maxFt = 60): { count: number; each: number } | null {
  if (!lengthFt) return null;
  const count = Math.max(1, Math.ceil(lengthFt / maxFt));
  return { count, each: Math.ceil(lengthFt / count) };
}

export function etuReducedLength(lengthFt: number | null): number | null {
  if (!lengthFt) return null;
  return Math.ceil(lengthFt * 0.67);
}

export function setbackFeet(setback: Setback, useNy: boolean, part: "tank" | "field" | "pit"): number {
  if (useNy) {
    if (part === "tank") return setback.nyTank;
    if (part === "pit") return setback.nyPit;
    return setback.nyField;
  }
  if (part === "tank") return setback.tankMost;
  return setback.fieldMost;
}
