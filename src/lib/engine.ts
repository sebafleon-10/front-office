import {
  ACADEMY_BENCHMARK,
  ACADEMY_BUMP_CAP,
  ACADEMY_BUMP_FACTOR,
  ACADEMY_YIELD,
  AVG_POINTS,
  AVG_QUALITY,
  BASE_CONVERSION,
  BASE_FANBASE,
  BASE_PPG,
  BASE_PRICE,
  BASE_QUALITY,
  BASE_SPONSOR,
  BASE_TRADING,
  BUDGET,
  CAPACITY,
  COMMERCIAL_BENCHMARK,
  COMMERCIAL_SPON_FACTOR,
  CONCESSIONS_PER_HEAD,
  ELASTICITY,
  FACILITIES_BENCHMARK,
  FACILITIES_CONV_FACTOR,
  FANBASE_FLOOR_MULT,
  FIN_SCORE_SCALE,
  FIXED_OVERHEAD,
  FORM_ATT_FACTOR,
  FORM_FLOOR,
  GAMES,
  HOME,
  MARKETING_BENCHMARK,
  MARKETING_FAN_FACTOR,
  MATCHDAY_COST_PER_HEAD,
  MAX_CONVERSION,
  MAX_PPG,
  MAX_QUALITY,
  MERCH_FORM_FACTOR,
  MERCH_FORM_FLOOR,
  MERCH_PER_FAN,
  MIN_CONVERSION,
  MIN_PPG,
  MIN_QUALITY,
  PPG_PER_QUALITY,
  PRIZE_STEP,
  RIVAL_NAMES,
  RIVAL_POINTS,
  SPON_FAN_FACTOR,
  SPON_SUCCESS_FACTOR,
  SPON_SUCCESS_FLOOR,
  SUCCESS_FAN_FACTOR,
  SUCCESS_FLOOR,
  TEAMS,
  WAGE_BENCHMARK,
  YOUR_CLUB_NAME,
} from "./assumptions";

export interface SeasonInputs {
  wages: number;
  academy: number;
  marketing: number;
  facilities: number;
  commercial: number;
  price: number;
  weightSport: number;
  weightFinance: number;
}

export interface LeagueRow {
  name: string;
  points: number;
  isYourClub: boolean;
}

export type PositionLabel =
  | "Champion"
  | "Playoff places"
  | "Mid-table"
  | "Relegation zone";

export interface SeasonResult {
  quality: number;
  ppg: number;
  points: number;
  position: number;
  positionLabel: PositionLabel;
  fanbase: number;
  conversion: number;
  attendance: number;
  playerSales: number;
  matchday: number;
  concessions: number;
  sponsorship: number;
  merch: number;
  prize: number;
  totalRevenue: number;
  matchdayCost: number;
  controllable: number;
  fixedOverhead: number;
  totalCost: number;
  net: number;
  budgetRemaining: number;
  overBudget: boolean;
  sportScore: number;
  finScore: number;
  health: number;
  table: LeagueRow[];
}

const clamp = (x: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, x));

export function positionLabel(position: number): PositionLabel {
  if (position === 1) return "Champion";
  if (position >= 2 && position <= 4) return "Playoff places";
  if (position >= 5 && position <= 9) return "Mid-table";
  return "Relegation zone";
}

export function buildLeagueTable(yourPoints: number): LeagueRow[] {
  const rivals = RIVAL_POINTS.map((p, i) => ({
    name: RIVAL_NAMES[i],
    points: p,
    isYourClub: false,
  }));
  const rows: LeagueRow[] = [
    ...rivals,
    { name: YOUR_CLUB_NAME, points: yourPoints, isYourClub: true },
  ];
  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.isYourClub) return 1;
    if (b.isYourClub) return -1;
    return 0;
  });
  return rows;
}

export function runSeason(inputs: SeasonInputs): SeasonResult {
  const {
    wages,
    academy,
    marketing,
    facilities,
    commercial,
    price,
    weightSport,
    weightFinance,
  } = inputs;

  const wageRatio = wages / WAGE_BENCHMARK;
  const academyRatio = academy / ACADEMY_BENCHMARK;
  const marketingRatio = marketing / MARKETING_BENCHMARK;
  const facilitiesRatio = facilities / FACILITIES_BENCHMARK;
  const commercialRatio = commercial / COMMERCIAL_BENCHMARK;

  const academyBump =
    Math.min(academyRatio, ACADEMY_BUMP_CAP) * ACADEMY_BUMP_FACTOR;

  const quality = clamp(
    BASE_QUALITY * Math.sqrt(wageRatio) + academyBump,
    MIN_QUALITY,
    MAX_QUALITY,
  );

  const ppg = clamp(
    BASE_PPG + (quality - AVG_QUALITY) * PPG_PER_QUALITY,
    MIN_PPG,
    MAX_PPG,
  );

  const points = Math.round(ppg * GAMES);

  const position =
    1 + RIVAL_POINTS.reduce((n, p) => (p > points ? n + 1 : n), 0);

  const marketingLift =
    (Math.sqrt(marketingRatio) - 1) * MARKETING_FAN_FACTOR;

  const successLift = Math.max(
    ((points - AVG_POINTS) / AVG_POINTS) * SUCCESS_FAN_FACTOR,
    SUCCESS_FLOOR,
  );

  const fanbase = Math.max(
    BASE_FANBASE * (1 + marketingLift + successLift),
    BASE_FANBASE * FANBASE_FLOOR_MULT,
  );

  const facilitiesLift =
    (Math.sqrt(facilitiesRatio) - 1) * FACILITIES_CONV_FACTOR;

  const priceFactor = Math.pow(price / BASE_PRICE, -ELASTICITY);

  const formLift = Math.max(
    ((points - AVG_POINTS) / AVG_POINTS) * FORM_ATT_FACTOR,
    FORM_FLOOR,
  );

  const conversion = clamp(
    BASE_CONVERSION *
      (1 + facilitiesLift) *
      priceFactor *
      (1 + formLift),
    MIN_CONVERSION,
    MAX_CONVERSION,
  );

  const attendance = Math.min(fanbase * conversion, CAPACITY);

  const qualityFactor = quality / AVG_QUALITY;
  const playerSales =
    BASE_TRADING + academyRatio * ACADEMY_YIELD * qualityFactor;

  const matchday = attendance * price * HOME;
  const concessions = attendance * CONCESSIONS_PER_HEAD * HOME;

  const commercialLift =
    (Math.sqrt(commercialRatio) - 1) * COMMERCIAL_SPON_FACTOR;

  const sponSuccessMult = Math.max(
    1 + ((points - AVG_POINTS) / AVG_POINTS) * SPON_SUCCESS_FACTOR,
    SPON_SUCCESS_FLOOR,
  );

  const sponFanMult = 1 + (fanbase / BASE_FANBASE - 1) * SPON_FAN_FACTOR;

  const sponsorship =
    BASE_SPONSOR * (1 + commercialLift) * sponSuccessMult * sponFanMult;

  const merchFormMult = Math.max(
    1 + ((points - AVG_POINTS) / AVG_POINTS) * MERCH_FORM_FACTOR,
    MERCH_FORM_FLOOR,
  );

  const merch = fanbase * MERCH_PER_FAN * merchFormMult;

  const prize = (TEAMS + 1 - position) * PRIZE_STEP;

  const totalRevenue =
    matchday + concessions + sponsorship + merch + prize + playerSales;

  const matchdayCost = attendance * MATCHDAY_COST_PER_HEAD * HOME;
  const controllable = wages + academy + marketing + facilities + commercial;
  const totalCost = controllable + matchdayCost + FIXED_OVERHEAD;
  const net = totalRevenue - totalCost;
  const budgetRemaining = BUDGET - controllable;
  const overBudget = controllable > BUDGET;

  const sportScore = clamp(
    ((TEAMS - position) / (TEAMS - 1)) * 100,
    0,
    100,
  );
  const finScore = clamp(50 + (net / FIN_SCORE_SCALE) * 50, 0, 100);

  const health = weightSport * sportScore + weightFinance * finScore;

  return {
    quality,
    ppg,
    points,
    position,
    positionLabel: positionLabel(position),
    fanbase,
    conversion,
    attendance,
    playerSales,
    matchday,
    concessions,
    sponsorship,
    merch,
    prize,
    totalRevenue,
    matchdayCost,
    controllable,
    fixedOverhead: FIXED_OVERHEAD,
    totalCost,
    net,
    budgetRemaining,
    overBudget,
    sportScore,
    finScore,
    health,
    table: buildLeagueTable(points),
  };
}
