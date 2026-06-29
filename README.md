# HR Analytics Dashboard

**Live demo:** [hr-analytics-dashboard-sigma.vercel.app](https://hr-analytics-dashboard-sigma.vercel.app)

An interactive people-analytics dashboard that analyzes employee attrition drivers,
audits pay equity, and flags flight-risk employees across a 1,470-person workforce.
Built end-to-end: synthetic data generation → statistical analysis → interactive
React dashboard.

## Overview

This project simulates a real People Analytics workflow: starting from raw employee
records, it computes attrition rates, compensation breakdowns, and a flight-risk
score, then presents the findings in a dashboard built for an HR decision-maker to
actually use — not just a chart for chart's sake.

## Key findings

- **23.6% overall attrition**, concentrated in Research Scientist, Lab Technician,
  and Sales Executive roles (28–32%)
- **Overtime is the strongest single driver**: 31.7% attrition among employees
  logging overtime vs. 20.3% without
- **First-year risk is highest** (27.7%) and tapers steadily after the five-year
  mark (15.7%)
- **Gender pay gap is statistically flat** (~1%) — department and job level explain
  pay far better than gender
- **153 active employees** flagged on a composite flight-risk score (overtime +
  low satisfaction + long promotion gap + long commute)

## Tech stack

| Layer | Tools |
|---|---|
| Data generation | Python, NumPy, Pandas |
| Analysis | Pandas (groupby aggregations, logistic-style risk scoring) |
| Dashboard | React, Recharts |
| Build / deploy | Vite, Vercel |

## Project structure

```
├── generate_data.py        # Generates the synthetic 1,470-employee dataset
├── analyze.py               # Pandas pipeline computing all dashboard metrics
├── hr_employee_data.csv     # The generated dataset (31 columns)
├── dashboard_data.json      # Output of analyze.py, consumed by the dashboard
├── src/
│   ├── Dashboard.jsx         # Main dashboard component (4 sections, Recharts)
│   └── main.jsx              # React entry point
├── index.html
├── package.json
└── vite.config.js
```

## Dashboard sections

1. **Overview** — headcount, attrition rate, average tenure, and department-level
   attrition split
2. **Attrition Analysis** — attrition cut by overtime, tenure, job satisfaction,
   work-life balance, and job role
3. **Compensation** — pay by job level, department, and a gender pay gap audit
4. **Flight-Risk Register** — active employees ranked by a five-factor composite
   risk score

## Running locally

```bash
git clone https://github.com/AKSHAYYBISHNOII/hr-analytics-dashboard.git
cd hr-analytics-dashboard
npm install
npm run dev
```

To regenerate the dataset and metrics from scratch:

```bash
pip install pandas numpy
python3 generate_data.py   # writes hr_employee_data.csv
python3 analyze.py         # writes dashboard_data.json
```

## Notes on the data

The dataset is synthetic, generated with a logistic risk function so attrition
correlates realistically with overtime, tenure, satisfaction, and promotion gaps —
not randomly assigned labels. This makes the findings defensible and internally
consistent, the same way real HR data would behave.

## Possible extensions

- Train a logistic regression or random forest model on the dataset to validate
  the flight-risk score against actual departure outcomes
- Swap in a real-world dataset (e.g. the IBM HR Attrition dataset on Kaggle) by
  matching column names in `analyze.py`
- Add a Power BI / Excel version using the same CSV for a non-technical audience
