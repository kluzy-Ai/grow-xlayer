# AirdropFlow → X Layer BuildX Hackathon Plan
**Deadline: Aug 21, 23:59 UTC (9 days from Aug 12). Target: AI-RWA Liquidity Grant (50K USDT) + Hackathon Grant top 3.**

---

## 0. The Elon Algorithm applied to the original spec

1. **Question every requirement.** The original 48-section spec is a Series A product, not a hackathon demo. Sybil detection, audit logs, full test suites, opportunity marketplace, email subscriptions, payroll/bounty/ambassador campaign types — none of these win a hackathon. They dilute the 9 days you have.
2. **Delete the part.** Cut list below. If you're tempted to build it "because it's in the spec," don't — the spec was written for a company, not a submission deadline.
3. **Simplify / optimize what's left.** One campaign type. One token. One chain. One AI command, not a full agent orchestrator with 6 sub-agents.
4. **Accelerate cycle time.** Build in vertical slices (one full flow working end-to-end) not horizontal layers (all of auth, then all of DB, then all of UI). Judges see a demo, not your architecture diagram.
5. **Automate last.** Get the manual flow working with real data first. Only then let AI auto-fill the distribution plan.

---

## 1. What actually wins this specific hackathon

Re-reading the rules: it's judged on **AI baked into the product + deployed independently on X Layer + dedicated X account**, with a dedicated **50K "AI-RWA" liquidity grant** on top of the 30/15/5K placings. AI-RWA = AI + real-world-asset-flavored onchain value movement. AirdropFlow qualifies naturally: it's an AI agent that plans and executes real token distributions with real treasury balances — that's "AI-powered onchain application" in one sentence.

Judges are (per OKX's own hackathon pattern) scoring on: **working onchain demo > polish > narrative**, with an AI judge pass first. That means: **the demo must actually execute a real testnet transaction live**, not a mockup. Everything else is secondary.

---

## 2. THE CUT — what you are NOT building

Delete these entirely from scope (add back only if you finish everything else with days to spare):

- Multi-campaign types (Giveaway, Payroll, Bounty, Referral, Ambassador) → **keep only "Giveaway/Airdrop"**
- Opportunity Marketplace + email subscriptions
- Wallet Intelligence risk scoring / Sybil detection → keep only "already submitted?" duplicate check
- Support Agent as a separate AI agent → fold into one command bar
- Full audit log system → console logs + one `events` table is enough
- Multi-chain abstraction → hardcode X Layer only
- Campaign states beyond Draft → Active → Completed
- Distribution types beyond "equal amount to N random eligible wallets"
- Full test suite → 3-4 smoke tests max, only on the money-moving code
- Demo mode toggle complexity → just clearly label testnet everywhere

## 3. THE ONE FLOW (this is your entire MVP)

```
Creator connects wallet (RainbowKit) → sees OKB/USDT balance on X Layer testnet
   → creates a campaign (name, token, amount per wallet, # of spots)
   → gets a Telegram deep link: t.me/YourBot?start=cmp_XXXX
   → community member taps link, bot asks for wallet address, validates it, saves to Supabase
   → creator dashboard shows wallets arriving in real time (Supabase realtime subscription)
   → creator opens AI command bar, types: "distribute 5 USDT to 20 random eligible wallets"
   → AI (Claude via tool-calling) parses this into a structured plan — does NOT touch chain directly
   → backend validates plan against treasury balance
   → creator clicks Approve → wallet signs a batch transfer → broadcasts to X Layer testnet
   → transaction list updates with real hashes, links to X Layer explorer
   → campaign marked Completed with success/fail counts
```

That's it. That is the whole demo. Build nothing else until this works end-to-end with a real testnet transaction.

---

## 4. Stack decisions (locked, don't relitigate mid-build)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router + TypeScript | your existing skillset |
| Hosting | Vercel | zero-config, instant preview URLs for judges |
| DB + Auth + Realtime | **Supabase** (Postgres + Row Level Security + Realtime) | replaces Prisma+raw Postgres+custom auth from the original spec — one less system to hallucinate over |
| Wallet / Web3 | **wagmi + viem + RainbowKit** | X Layer is EVM-equivalent (Chain ID 196 mainnet / 1952 testnet), so standard EVM tooling works out of the box |
| Chain | X Layer **Testnet** for build/demo (Chain ID 1952, RPC `https://testrpc.xlayer.tech/terigon`), deploy identical contract config to Mainnet (196) only at the end for the Launch Grant | don't touch mainnet until testnet flow is proven |
| Token transfer | A simple `Multisend`/batch-transfer smart contract you deploy yourself (Solidity, OpenZeppelin `SafeERC20`), OR sequential single transfers if you don't have time for a contract | batch = more impressive to judges, but sequential transfers are the fallback if day 5 is tight |
| Telegram bot | Telegram Bot API via **webhook**, hosted as a Vercel serverless route (`/api/telegram/webhook`) | no long-polling needed, works natively on Vercel |
| AI | Claude (Anthropic API) with **structured tool calls only** — `create_distribution_plan`, `get_treasury_balance`, `select_random_recipients` | never let the model touch the DB or chain directly — this is the one piece of the original spec worth keeping as-is, it's genuinely good practice and judges will notice if you skip it |
| Repo | GitHub, one repo, `main` branch protected, feature branches per module | for the "commit history" signal judges/graders often check |

---

## 5. Day-by-day build order (feed Antigravity ONE step at a time)

**Rule for every step below: paste only that step's prompt into Antigravity. Tell it explicitly "implement only this, do not scaffold future modules." Run the app, verify it works, commit to GitHub, THEN move to the next step.**

### Day 1 — Foundation + Repo
- `npx create-next-app` (TS, App Router, Tailwind)
- Push empty scaffold to GitHub immediately
- Supabase project created, connect env vars, `.env.example` committed
- Deploy blank scaffold to Vercel (get your URL working day 1, not day 8)
- **Check:** Vercel URL loads. Repo has first commit.

### Day 2 — Auth + DB schema
- Supabase Auth (email or wallet-based — wallet-based is more Web3-native, use SIWE if time allows, otherwise simple email magic link)
- Tables: `campaigns`, `wallet_submissions`, `distributions`, `distribution_recipients`, `events`
- **Check:** you can sign up, sign in, and see an empty dashboard shell.

### Day 3 — Wallet connect + treasury balance
- Integrate RainbowKit + wagmi, configure X Layer testnet as the chain
- Dashboard shows connected wallet's OKB + test-USDT balance read live from chain
- **Check:** real balance shown from a real testnet wallet, not a mock number.

### Day 4 — Campaign creation + editor
- Simple form: name, token contract address, amount per wallet, number of spots, end date
- Save to Supabase, generate unique `campaign_id` (short slug)
- Campaign detail page shows the generated Telegram deep link
- **Check:** create a campaign, see it saved, see the link generated.

### Day 5 — Telegram bot
- Register bot with BotFather, set webhook to `/api/telegram/webhook`
- Bot flow: `/start cmp_XXXX` → explain campaign → ask for wallet address → validate (`viem` `isAddress`) → check not already submitted for this campaign → save to `wallet_submissions` → confirm
- **Check:** message the bot for real, watch a row appear in Supabase.

### Day 6 — Live dashboard + realtime
- Supabase Realtime subscription on `wallet_submissions` so the creator dashboard updates live as people join via Telegram, no refresh
- **Check:** submit a wallet via Telegram on your phone, watch it appear on the dashboard on your laptop instantly. This single moment is a strong demo beat — don't skip realtime for a polling fallback if you can help it.

### Day 7 — AI command bar + distribution plan
- One input box, one Claude API call with tool definitions: `get_eligible_wallets`, `select_random_recipients(n)`, `get_treasury_balance`, `create_distribution_plan`
- Model must return a structured plan (JSON), never free text used to move money
- UI renders the plan: recipients, amount each, total, treasury sufficient y/n
- **Check:** type "distribute 5 USDT to 20 random wallets," see a correct structured preview.

### Day 8 — Distribution engine (the money-moving code — build this deterministically, no AI here)
- Approve button → backend re-validates plan against current treasury (protects against stale AI output)
- Sign + broadcast batch (or sequential) transfer on X Layer testnet via connected wallet
- Idempotency: mark each recipient `paid` only after confirmed tx hash recorded — never re-pay on retry
- Transaction list with live status (pending/confirmed/failed) and link to X Layer explorer
- **Check:** a real testnet transaction hash you can open on X Layer's explorer.

### Day 9 — Polish, demo video, mainnet deploy, submission
- Campaign completion summary screen (X sent, Y failed, success rate)
- Record a 90-second demo video following the script below
- Deploy the same flow to X Layer **Mainnet** (small real amount) to satisfy "deploy independently on X Layer"
- Set up the dedicated X account, post the demo, tag @XLayerOfficial
- Submit via `web3.okx.com/xlayer/build-x-series`

If you're behind schedule at any point, cut Day 6 realtime (poll every 5s instead) and Day 8's batch contract (do sequential transfers) before cutting anything else — those two are the most time-expensive and least demo-critical relative to their cost.

---

## 6. The rewritten Antigravity prompt (Day 1, paste this first)

```
You are building AirdropFlow MVP — a single end-to-end flow, not a platform.

STACK: Next.js 14 (App Router, TypeScript), Tailwind, Supabase (Postgres+Auth+Realtime),
wagmi + viem + RainbowKit for wallet connection to X Layer (EVM, testnet chain ID 1952,
RPC https://testrpc.xlayer.tech/terigon; mainnet chain ID 196, RPC https://rpc.xlayer.tech).

RULE: Implement ONLY the step I specify in each prompt. Do not scaffold future modules,
do not create placeholder pages for features we haven't built yet, do not invent
functionality. If something is ambiguous, stop and ask me rather than guessing.

STEP 1 (today, nothing else): 
- Scaffold the Next.js app with TypeScript + Tailwind
- Set up Supabase client with env vars (create .env.example with placeholders, never commit real keys)
- Create a minimal landing page: "AirdropFlow" + a "Connect Wallet" button (no logic yet)
- Push to GitHub with a clean initial commit
- Confirm it deploys on Vercel

Do not build auth, campaigns, telegram, or AI yet. Stop after this step and wait for my review.
```

Then feed Days 2-9 as separate prompts the same way, each referencing what already exists ("the campaigns table already exists, add the creation form that writes to it").

---

## 7. 90-second demo script (what judges actually remember)

1. (0:00) "AirdropFlow lets any Web3 creator run a token giveaway without spreadsheets or manual wallet collection." Show landing page.
2. (0:10) Connect wallet → real treasury balance appears on X Layer testnet.
3. (0:20) Create a campaign in 10 seconds — name, token, amount, spots.
4. (0:30) Show the generated Telegram link, tap it on phone, submit a wallet in the bot.
5. (0:40) Cut back to dashboard — the wallet appears live, no refresh.
6. (0:50) Type into AI command bar: "distribute 5 USDT to 20 random eligible wallets." Plan appears instantly.
7. (1:05) Click Approve — sign in wallet — broadcast.
8. (1:15) Show the real transaction hash, open it on X Layer's explorer live.
9. (1:25) Campaign complete screen: success rate, total distributed.
10. (1:30) "Built end-to-end on X Layer, AI-native by design." End on X Layer + your project logo.

This is the story from the original spec's section 46 — keep that part, it's genuinely the right demo arc. Everything else in that 48-section doc, cut.
