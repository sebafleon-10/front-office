# Front Office

A single season business simulation for running a lower league soccer club, built as a portfolio piece and an interview demonstration.

## What it is

Front Office puts you in charge of a USL League Two or NPSL level club for one season. You set six decisions, player wages, academy investment, marketing, facilities and matchday, commercial and sponsorship, and a ticket price, plus a weighting for how much you value sporting success versus financial success. The app then shows where you finish in a twelve team table, the full season profit and loss, and a single club health score that blends the table and the books. Every number updates live as you move a lever.

The teaching point is tradeoffs. Spending big on wages buys a high finish but usually loses money. Developing and selling players is how these clubs actually turn a profit. Filling the ground with cheap tickets is a multi season bet that can lose money in year one. The model makes all of that visible.

## How it is built

Three layers, separating the reasoning from the execution.

The model. The economics started as a financial model in Excel, with the causal chain wired as live formulas, wages drive squad quality, quality drives points, points decide the table, and winning plus marketing grow the fanbase, which feeds attendance, sponsorship, and merchandise. The whole thing was validated numerically across three strategy archetypes before anything was built on top of it.

The engine. The model is ported to a pure TypeScript function that takes the six decisions and returns the full season result. It is covered by a gold set of unit tests that assert the TypeScript reproduces the Excel model to the dollar across all four reference scenarios. That parity is the point. The playable app and the spreadsheet tell the exact same story, so nothing is hand waved.

The interface. A premium command center built in Next.js, designed to an Apple grade bar and deliberately steered away from the generic AI generated look. One restrained accent, semantic green and red reserved for money, tabular figures so numbers never jitter, a signature club health gauge, and a profit and loss panel that reads like a real season statement. An opening hero frames it as a product before you enter the command center.

The coach. A typed route is in place for an AI debrief that reads a player's decisions and outcome and writes a consultant style readout of the strategy and the tradeoffs they accepted. This is the next build.

## Why I built it

It does double duty. It is a portfolio centerpiece, and it is built to map directly onto the BTS Strategy and Business Modeling role I am interviewing for.

That role wants three things at once, building with agentic AI, business and financial modeling, and presenting and facilitating for senior audiences. Most candidates have one. Front Office is proof of all three in a single artifact. It is a business model made playable, it builds AI into the experience, and the coach debrief mirrors what a BTS facilitator does after a simulation.

It also sits on my longer term thesis. My goal is a data and analytics consultancy for lower league soccer clubs, USL League One and Two and NPSL, using my work with Ghost FC as the proof of concept. Front Office is that thesis made tangible, a simulation of the exact club economics that consultancy would advise on.

And it reflects how I build with AI generally, probabilistic reasoning on top, deterministic code underneath, because when an agent tries to handle every step directly the accuracy compounds downward fast. The deterministic engine with a gold test harness around it is that principle in practice, and it is the same workflow mindset the role screens for, the idea that AI only creates value when the workflow around it changes.

## How I would describe it in one line

I built a playable simulation of lower league club economics, with a financial engine that provably matches an underlying model, a premium interface, and an AI coach that debriefs your season the way a strategy consultant would.

## Talking points for the interview

- The engine matching the model to the dollar is an eval harness instinct applied to a port. It is what makes the demo credible rather than a toy.
- The coach debrief is the same job a BTS simulation facilitator does, surfacing the tradeoffs a leader made and what a different strategy would have produced.
- The whole thing is a business model made personal, which is the SBM craft, translating how a business works into something a decision maker can feel.
- I treated the design like a client deliverable, because the look is what signals whether work is high end or not.
