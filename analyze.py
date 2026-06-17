import pandas as pd
import numpy as np
import json

df = pd.read_csv("/home/claude/hr-analytics/hr_data.csv")

def attr_rate(d):
    return round((d["Attrition"] == "Yes").mean() * 100, 1)

out = {}

# ---- Headline KPIs ----
out["kpis"] = {
    "totalEmployees": int(len(df)),
    "attritionRate": attr_rate(df),
    "avgMonthlyIncome": int(df["MonthlyIncome"].mean()),
    "avgTenure": round(df["YearsAtCompany"].mean(), 1),
    "avgJobSatisfaction": round(df["JobSatisfaction"].mean(), 2),
    "highRiskCount": int(((df["OverTime"] == "Yes") & (df["JobSatisfaction"] <= 2)).sum()),
}

# ---- Attrition by department ----
dept = df.groupby("Department").apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
    "avgIncome": int(d["MonthlyIncome"].mean()),
})).reset_index().rename(columns={"Department": "name"})
out["byDepartment"] = dept.to_dict(orient="records")

# ---- Attrition by job role (top contributors) ----
role = df.groupby("JobRole").apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"JobRole": "name"})
role = role.sort_values("attritionRate", ascending=False)
out["byJobRole"] = role.to_dict(orient="records")

# ---- Attrition by age band ----
bins = [17, 25, 30, 35, 40, 45, 50, 61]
labels = ["18-25", "26-30", "31-35", "36-40", "41-45", "46-50", "51-60"]
df["AgeBand"] = pd.cut(df["Age"], bins=bins, labels=labels)
age = df.groupby("AgeBand", observed=True).apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"AgeBand": "name"})
out["byAgeBand"] = age.to_dict(orient="records")

# ---- Attrition by tenure band ----
tbins = [-1, 1, 3, 5, 10, 40]
tlabels = ["0-1 yrs", "2-3 yrs", "4-5 yrs", "6-10 yrs", "10+ yrs"]
df["TenureBand"] = pd.cut(df["YearsAtCompany"], bins=tbins, labels=tlabels)
tenure = df.groupby("TenureBand", observed=True).apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"TenureBand": "name"})
out["byTenureBand"] = tenure.to_dict(orient="records")

# ---- OverTime impact ----
ot = df.groupby("OverTime").apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"OverTime": "name"})
out["byOvertime"] = ot.to_dict(orient="records")

# ---- Job satisfaction impact ----
js = df.groupby("JobSatisfaction").apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"JobSatisfaction": "name"})
js["name"] = js["name"].map({1: "1 - Low", 2: "2 - Medium", 3: "3 - High", 4: "4 - Very High"})
out["byJobSatisfaction"] = js.to_dict(orient="records")

# ---- Work life balance impact ----
wlb = df.groupby("WorkLifeBalance").apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"WorkLifeBalance": "name"})
wlb["name"] = wlb["name"].map({1: "1 - Bad", 2: "2 - Good", 3: "3 - Better", 4: "4 - Best"})
out["byWorkLifeBalance"] = wlb.to_dict(orient="records")

# ---- Salary by job level / department (for salary insights) ----
sal_level = df.groupby("JobLevel").apply(lambda d: pd.Series({
    "headcount": len(d),
    "avgIncome": int(d["MonthlyIncome"].mean()),
    "minIncome": int(d["MonthlyIncome"].min()),
    "maxIncome": int(d["MonthlyIncome"].max()),
})).reset_index().rename(columns={"JobLevel": "name"})
out["salaryByLevel"] = sal_level.to_dict(orient="records")

sal_gender = df.groupby(["Department", "Gender"]).apply(lambda d: pd.Series({
    "avgIncome": int(d["MonthlyIncome"].mean()),
})).reset_index()
out["salaryByDeptGender"] = sal_gender.to_dict(orient="records")

# ---- Gender pay gap overall ----
gp = df.groupby("Gender")["MonthlyIncome"].mean()
out["genderPayGap"] = {
    "maleAvg": int(gp.get("Male", 0)),
    "femaleAvg": int(gp.get("Female", 0)),
    "gapPercent": round((1 - gp.get("Female", 0) / gp.get("Male", 1)) * 100, 1),
}

# ---- Performance distribution by department ----
perf = df.groupby(["Department", "PerformanceRating"]).size().unstack(fill_value=0)
out["performanceByDept"] = [
    {"department": idx, **{f"rating{col}": int(val) for col, val in row.items()}}
    for idx, row in perf.iterrows()
]

# ---- Distance from home vs attrition ----
dbins = [0, 5, 10, 15, 20, 30]
dlabels = ["0-5 km", "6-10 km", "11-15 km", "16-20 km", "21+ km"]
df["DistBand"] = pd.cut(df["DistanceFromHome_km"], bins=dbins, labels=dlabels)
dist = df.groupby("DistBand", observed=True).apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"DistBand": "name"})
out["byDistance"] = dist.to_dict(orient="records")

# ---- Years since promotion vs attrition ----
pbins = [-1, 0, 1, 2, 4, 16]
plabels = ["0 yrs", "1 yr", "2 yrs", "3-4 yrs", "5+ yrs"]
df["PromoBand"] = pd.cut(df["YearsSinceLastPromotion"], bins=pbins, labels=plabels)
promo = df.groupby("PromoBand", observed=True).apply(lambda d: pd.Series({
    "headcount": len(d),
    "attritionRate": attr_rate(d),
})).reset_index().rename(columns={"PromoBand": "name"})
out["byPromotionGap"] = promo.to_dict(orient="records")

# ---- Headcount by department & gender (org composition) ----
comp = df.groupby(["Department", "Gender"]).size().unstack(fill_value=0).reset_index()
out["genderCompByDept"] = comp.to_dict(orient="records")

# ---- Top flight-risk employees (high risk factors, still active) ----
active = df[df["Attrition"] == "No"].copy()
active["riskScore"] = (
    (active["OverTime"] == "Yes").astype(int) * 2
    + (active["JobSatisfaction"] <= 2).astype(int) * 2
    + (active["WorkLifeBalance"] <= 2).astype(int) * 1.5
    + (active["YearsSinceLastPromotion"] >= 4).astype(int) * 1.5
    + (active["DistanceFromHome_km"] >= 15).astype(int) * 1
)
top_risk = active.sort_values("riskScore", ascending=False).head(8)[
    ["Name", "Department", "JobRole", "YearsAtCompany", "JobSatisfaction", "OverTime", "riskScore"]
]
out["flightRisk"] = top_risk.to_dict(orient="records")

with open("/home/claude/hr-analytics/dashboard_data.json", "w") as f:
    json.dump(out, f, indent=2, default=str)

print("KPIs:", out["kpis"])
print()
print("By department:", out["byDepartment"])
print()
print("Gender pay gap:", out["genderPayGap"])
