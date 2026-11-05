# Voice

## Rule 0

Above every other rule, for every message, product, screen and communication, with clients and with the team: simple, predictable, clear, action led, client first, machinery hidden. When another rule conflicts, Rule 0 wins.

### 1. Simple: one idea at a time, in plain words

| Before | After |
|---|---|
| We assessed your intake, scheduling and billing workflows and identified several optimization opportunities across departments. | Your billing step is where work waits longest. We start there. |
| Please find attached the deliverables, the revised timeline and some notes on scope. | The new timeline is attached. Scope and deliverables follow in a separate note. |
| Our solution integrates multiple systems to streamline end to end operations. | Your requests and your invoices now live in one place. |

### 2. Predictable: the same shape every time

Every status update to a client has the same four parts, in this order: where we are, what is done, what is next, what we need from you.

| Before | After |
|---|---|
| Quick update! Things are moving along well, a few small hiccups but nothing major. More soon. | Where we are: step 3 of 5, Build. Done: the intake form. Next: the approval step, by Friday. From you: nothing this week. |
| A different layout for every proposal. | Every proposal: the problem, the flow, the price, the next step. |

### 3. Clear: understood on the first read, literally

| Before | After |
|---|---|
| We should have something for you soon. | You will have the draft on Thursday, 12 November. |
| The issue may be related to some configuration on your side. | Your form sends to an old email address. Change it to orders@ and the requests will arrive. |
| Pricing is flexible depending on needs. | Fixed price: 4,000 dollars. Extra work after sign off is hourly. |

(The amounts and dates in these examples are illustrations, not prices or commitments.)

### 4. Action led: end with the next step, who does what, and when

| Before | After |
|---|---|
| Let us know your thoughts. | Reply yes by Wednesday and we start Monday. |
| Happy to chat further if useful. | Book 30 minutes this week: [link]. We will bring the first flow. |
| Thanks for the meeting today. | Thanks for today. Next: you send the three sample invoices by Friday, we send the flow on Tuesday. |

### 5. Client first: start from what the client needs

| Before | After |
|---|---|
| IssueSolved builds AI process flows with forward deployed agents. | Get your team's time back from the work that piles up. |
| We have completed phase 2 of our methodology. | Your team no longer types each order in twice. |
| Our team is excited to share our latest work. | Your invoices go out the day the job is signed off. |

### 6. Machinery hidden: the client sees the result and the next step

| Before | After |
|---|---|
| Our orchestrator agent, running on a large language model, routes your tickets through three sub agents. | Each request is checked and sent to the right person within the hour. |
| We pushed the fix to the repo and redeployed. | The form works again. |
| Claude drafted this proposal from your notes. | Here is the proposal. |

Never name, to a client, our tools, agents, models, prompts, repos, branches or internal steps. Inside the team the same rule holds for anything a client could see.

---

Trust over excitement. Simplicity over cleverness. Stability over trend. Say it once.

These rules apply to every word: page copy, flows, documents, code comments, commit messages.

## Rules

- No em dashes. Use a period, a comma or a colon.
- No exclamation marks.
- None of the banned words below.
- Speak as IssueSolved, never as a chatbot. No "I", no "As an AI".
- Say it once. Cut any line that could go with nothing lost.
- Plain words a person would say aloud to the person next to them.
- Do not claim results, clients or numbers that are not real yet. No client names, no testimonials, no stats, no "trusted by".
- The name is IssueSolved, one word. No tagline after it.
- Name things by what a person does or gets, not by how the system works.

## Banned words

leverage, seamless, cutting edge, unlock, empower, revolutionize, revolutionise, robust, synergy, state of the art, game changing.

In the website repo the list in `scripts/check-voice.mjs` is the source of truth, and the check runs before every commit:

```bash
npm run check:voice
```

It scans the code and `DESIGN.md`, not this guide, which is why the list can be written here. Any repo that holds brand text should run the same check.

## Plain way to say it

| Instead of | Say |
|---|---|
| Seamless end to end automation | A workflow that runs from start to finish, and that we keep running |
| We leverage cutting edge AI | We build AI into the work your team already does |
| Trusted by leading firms | (say nothing until it is true) |

## Words in use

- Headline: "Transform your Business with AI, / Reclaim your Time."
- Services row, one node per word: Process flow / Implementation, Cloud and On premise / Deployment, AI / Transformation.
- Get started row: Define your priorities, Assess your environment, Transform.
- People at the end of a flow: the Team.
- Contact: a form, with the email link.

## Where care goes

Spend warmth where something went wrong, was lost, or is being waited on. Everywhere else, care means getting out of the way.
