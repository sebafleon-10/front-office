import { INPUT_RANGES, PAR_VALUES } from "./assumptions";
import { formatMoney } from "./format";

export type LeverKey =
  | "wages"
  | "academy"
  | "marketing"
  | "facilities"
  | "commercial"
  | "price";

export interface LeverMeta {
  key: LeverKey;
  label: string;
  short: string;
  min: number;
  max: number;
  step: number;
  par: number;
  format: (n: number) => string;
  feeds: string;
  /** The business meaning, plain English: shown before the math. */
  plain: string;
  /** The formula behind it: shown after the plain meaning, in muted text. */
  rule: string;
  example: string;
}

const money = (n: number) => formatMoney(n);
const price = (n: number) => `$${n}`;

export const LEVERS: LeverMeta[] = [
  {
    key: "wages",
    label: "Player wages",
    short: "Wages",
    min: INPUT_RANGES.wages.min,
    max: INPUT_RANGES.wages.max,
    step: INPUT_RANGES.wages.step,
    par: PAR_VALUES.wages,
    format: money,
    feeds: "Squad quality, placement",
    plain:
      "Better players win more games, but each extra dollar buys less quality than the last, and wages are your single biggest cost.",
    rule: "Quality = 50 × √(wages ÷ par) + academy bump. The square root is the diminishing returns.",
    example:
      "At par, wages set quality to 50. Doubling to $1.2M lifts it to about 71; halving to $300K drops it to about 35.",
  },
  {
    key: "academy",
    label: "Academy investment",
    short: "Academy",
    min: INPUT_RANGES.academy.min,
    max: INPUT_RANGES.academy.max,
    step: INPUT_RANGES.academy.step,
    par: PAR_VALUES.academy,
    format: money,
    feeds: "Quality bump, player trading",
    plain:
      "Develops young players: a modest boost on the pitch that tops out, and sale revenue that keeps growing: the profit engine for clubs at this level.",
    rule: "Quality bump maxes at +9 (3× par, $450K); player-trading revenue keeps scaling past that with no cap.",
    example:
      "At par it adds +3 quality and roughly $230K of player sales. Push it to $420K and sales clear $550K: how these clubs actually profit.",
  },
  {
    key: "marketing",
    label: "Marketing & community",
    short: "Marketing",
    min: INPUT_RANGES.marketing.min,
    max: INPUT_RANGES.marketing.max,
    step: INPUT_RANGES.marketing.step,
    par: PAR_VALUES.marketing,
    format: money,
    feeds: "Fanbase size",
    plain:
      "Grows the fanbase, and the fanbase multiplies everything: more people at the gate, bigger sponsor deals, more merchandise.",
    rule: "Fan lift = (√(marketing ÷ par) − 1) × 0.5 on a base of 8,000 fans.",
    example:
      "At par, no lift. Doubling marketing to $240K grows the fanbase about 21%, which then flows into three revenue lines at once.",
  },
  {
    key: "facilities",
    label: "Matchday & facilities",
    short: "Facilities",
    min: INPUT_RANGES.facilities.min,
    max: INPUT_RANGES.facilities.max,
    step: INPUT_RANGES.facilities.step,
    par: PAR_VALUES.facilities,
    format: money,
    feeds: "Attendance conversion",
    plain:
      "A better matchday turns casual fans into attendees: it raises the share of your fanbase that actually shows up.",
    rule: "Conversion lift = (√(facilities ÷ par) − 1) × 0.4 on a base 45% conversion.",
    example:
      "At par, no lift. Doubling to $240K raises conversion about 17%, putting more bodies in a 6,000-seat ground.",
  },
  {
    key: "commercial",
    label: "Sponsorship sales",
    short: "Commercial",
    min: INPUT_RANGES.commercial.min,
    max: INPUT_RANGES.commercial.max,
    step: INPUT_RANGES.commercial.step,
    par: PAR_VALUES.commercial,
    format: money,
    feeds: "Sponsorship",
    plain:
      "A stronger sales operation lands bigger sponsor deals, and sponsors pay more when you win and the fanbase grows.",
    rule: "Sponsorship lift = (√(commercial ÷ par) − 1) × 0.6 on a $400K base, times finish and fanbase multipliers.",
    example:
      "At par, no lift. Doubling to $180K adds about 25% to the base before the success and fanbase multipliers stack on top.",
  },
  {
    key: "price",
    label: "Ticket price",
    short: "Ticket price",
    min: INPUT_RANGES.price.min,
    max: INPUT_RANGES.price.max,
    step: INPUT_RANGES.price.step,
    par: PAR_VALUES.price,
    format: price,
    feeds: "Conversion, tickets, concessions",
    plain:
      "Higher prices thin the crowd less than you'd fear (fans are loyal) so matchday revenue usually rises even as attendance dips.",
    rule: "Conversion scales by (price ÷ $18)^−0.6: inelastic demand.",
    example:
      "Cheaper seats fill the ground and lift concessions, but earn less per head. Filling it cheap is a multi-season bet this one-season model barely rewards.",
  },
];
