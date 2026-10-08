# Autonomous AI CFO(Chief Financial Officer) Agent 🤖💳

An autonomous financial governance and policy evaluation agent that manages corporate SaaS subscription renewals, auto-executes low-value payouts via PayPal, and escalates high-value expenses for human CFO review.

---

## 🌟 Key Features

- **Policy-Driven Decision Engine:** Evaluates software renewals against corporate spending rules.
- **Automated Payout Execution:** Subscriptions $\le \$50.00$ are automatically approved and processed via the PayPal REST API.
- **Human-in-the-Loop (HITL) Oversight:** Subscriptions $> \$50.00$ are flagged as `PENDING_REVIEW` for manual CFO authorization.
- **Interactive Dashboard:** Powered by React and AG Grid with real-time decision updates and single-click manual override buttons.
- **Local Storage Persistence:** Keeps decision logs intact across page refreshes.

---

## 🏗️ Architecture & Decision Flow

```text
                     ┌──────────────────────────────┐
                     │   Simulate Invoice Renewal   │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │ Express Agent Policy Engine  │
                     └──────────────┬───────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
              [ Amount ≤ $50 ]              [ Amount > $50 ]
                     │                             │
                     ▼                             ▼
             Status: AUTO_APPROVED         Status: PENDING_REVIEW
                     │                             │
                     ▼                             ▼
           Generate PayPal Order           Escalate to CFO UI
                     │                             │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │ AG Grid Decision Log (React) │
                     └──────────────────────────────┘
🛠️ Tech Stack
Frontend: React (Vite), AG Grid Community, Axios
Backend: Node.js, Express.js, CORS, Dotenv
Payments: PayPal Sandbox REST API
Persistence: Local Storage / Mongoose (MongoDB) Schema

🚦 Getting Started
Prerequisites
Node.js (v18+)
npm

1. Clone the Repository
Bash
git clone [https://github.com/YOUR-USERNAME/paypal-cfo-agent.git](https://github.com/YOUR-USERNAME/paypal-cfo-agent.git)
cd paypal-cfo-agent
2. Backend Setup
Bash
cd backend
npm install
node server.js
The server starts on http://localhost:5000.

3. Frontend Setup
In a second terminal window:

Bash
cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.

📸 Demo Workflow
Auto-Approval Path (≤ $50):

Service: Vercel Pro | Amount: $20.00

Result: AUTO_APPROVED with instant PayPal order generation.

Flagged Policy Path (> $50):

Service: AWS Cloud Infrastructure | Amount: $150.00

Result: PENDING_REVIEW flagged for CFO action.

CFO Manual Override:

Click Approve (>$50) on the AG Grid row to transition status to APPROVED_BY_CFO.

📄 License
Built for hackathon demonstration.


---

### Command to Overwrite and Commit

Run this directly in your terminal to write the clean text to `README.md` and push it to GitHub:

```cmd
cd C:\Users\Raj\paypal-cfo-agent
git add README.md
git commit -m "Docs: Complete untruncated README"
git push
