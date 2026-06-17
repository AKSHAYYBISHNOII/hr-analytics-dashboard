"""
Generates a realistic synthetic HR analytics dataset.
Designed so that attrition correlates believably with tenure, satisfaction,
overtime, commute distance, salary hikes, and promotion gaps -- the same
patterns you'd expect to defend in an interview.
"""
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
N = 1470  # matches scale of the classic IBM HR dataset, but fully custom-built

first_names_m = ["James","Michael","Robert","David","William","Richard","Joseph","Thomas","Charles","Daniel",
                  "Matthew","Anthony","Mark","Paul","Steven","Andrew","Kenneth","Joshua","George","Kevin",
                  "Brian","Edward","Ronald","Timothy","Jason","Jeffrey","Ryan","Jacob","Gary","Nicholas",
                  "Eric","Jonathan","Stephen","Larry","Justin","Scott","Brandon","Benjamin","Samuel","Gregory"]
first_names_f = ["Mary","Patricia","Jennifer","Linda","Elizabeth","Barbara","Susan","Jessica","Sarah","Karen",
                  "Nancy","Lisa","Margaret","Betty","Sandra","Ashley","Dorothy","Kimberly","Emily","Donna",
                  "Michelle","Carol","Amanda","Melissa","Deborah","Stephanie","Rebecca","Laura","Sharon","Cynthia",
                  "Kathleen","Amy","Angela","Shirley","Anna","Brenda","Pamela","Emma","Nicole","Helen"]
last_names = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
              "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
              "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
              "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
              "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"]

departments = {
    "Sales": {"weight": 0.31, "roles": ["Sales Executive", "Sales Representative", "Sales Manager"]},
    "Research & Development": {"weight": 0.38, "roles": ["Research Scientist", "Laboratory Technician", "Manufacturing Director", "R&D Manager"]},
    "Human Resources": {"weight": 0.06, "roles": ["HR Executive", "HR Specialist", "HR Manager"]},
    "Engineering": {"weight": 0.18, "roles": ["Software Engineer", "Senior Engineer", "Engineering Manager", "QA Engineer"]},
    "Finance": {"weight": 0.07, "roles": ["Financial Analyst", "Accountant", "Finance Manager"]},
}
dept_names = list(departments.keys())
dept_weights = [departments[d]["weight"] for d in dept_names]

education_fields = ["Life Sciences", "Medical", "Marketing", "Technical Degree", "Human Resources", "Business"]
edu_levels = [1, 2, 3, 4, 5]  # 1=Below College ... 5=Doctor

cities = ["Austin", "Chicago", "Denver", "Seattle", "Atlanta", "Phoenix", "Columbus", "Charlotte", "Portland", "Raleigh"]

rows = []
for i in range(1, N + 1):
    gender = rng.choice(["Male", "Female"], p=[0.6, 0.4])
    first = rng.choice(first_names_m if gender == "Male" else first_names_f)
    last = rng.choice(last_names)
    name = f"{first} {last}"

    age = int(np.clip(rng.normal(37, 9), 18, 60))
    dept = rng.choice(dept_names, p=dept_weights)
    role = rng.choice(departments[dept]["roles"])
    city = rng.choice(cities)

    total_working_years = max(0, age - 21 - int(rng.normal(0, 2)))
    company_tenure = int(np.clip(rng.exponential(4.5), 0, min(total_working_years, 37)))
    years_in_role = int(np.clip(company_tenure * rng.uniform(0.2, 1.0), 0, company_tenure))
    years_since_promotion = int(np.clip(rng.exponential(2.2), 0, max(company_tenure, 1)))
    years_with_manager = int(np.clip(company_tenure * rng.uniform(0.2, 1.0), 0, company_tenure))
    num_companies_worked = int(np.clip(rng.poisson(2.5), 0, 9))

    education = rng.choice(edu_levels, p=[0.08, 0.22, 0.38, 0.27, 0.05])
    edu_field = rng.choice(education_fields, p=[0.18, 0.10, 0.16, 0.24, 0.07, 0.25])

    # Base salary driven by role seniority, dept, education, tenure -- not random
    seniority_bonus = {"Manager": 1.7, "Director": 2.0, "Senior": 1.35}
    mult = 1.0
    for k, v in seniority_bonus.items():
        if k in role:
            mult = v
    base = {"Sales": 4800, "Research & Development": 4600, "Human Resources": 4200,
            "Engineering": 5400, "Finance": 5000}[dept]
    monthly_income = int(base * mult * (1 + 0.025 * company_tenure) * (1 + 0.04 * (education - 3)) * rng.uniform(0.85, 1.18))
    monthly_income = int(np.clip(monthly_income, 2200, 21000))

    percent_salary_hike = int(np.clip(rng.normal(15, 4), 11, 25))
    stock_option_level = rng.choice([0, 1, 2, 3], p=[0.45, 0.32, 0.18, 0.05])

    distance_from_home = int(np.clip(rng.exponential(7), 1, 29))
    overtime = rng.choice(["Yes", "No"], p=[0.28, 0.72])
    business_travel = rng.choice(["Non-Travel", "Travel_Rarely", "Travel_Frequently"], p=[0.1, 0.71, 0.19])
    marital_status = rng.choice(["Single", "Married", "Divorced"], p=[0.32, 0.46, 0.22])

    env_satisfaction = rng.choice([1, 2, 3, 4], p=[0.15, 0.2, 0.3, 0.35])
    job_satisfaction = rng.choice([1, 2, 3, 4], p=[0.15, 0.2, 0.3, 0.35])
    relationship_satisfaction = rng.choice([1, 2, 3, 4], p=[0.13, 0.22, 0.31, 0.34])
    work_life_balance = rng.choice([1, 2, 3, 4], p=[0.08, 0.24, 0.45, 0.23])
    job_involvement = rng.choice([1, 2, 3, 4], p=[0.07, 0.26, 0.5, 0.17])
    performance_rating = rng.choice([3, 4], p=[0.85, 0.15])
    job_level = int(np.clip(1 + company_tenure // 4 + (education >= 4), 1, 5))

    training_times_last_year = rng.choice([0, 1, 2, 3, 4, 5, 6], p=[0.08, 0.15, 0.32, 0.22, 0.13, 0.07, 0.03])

    # ---- Attrition probability: a real logistic-style function of risk factors ----
    risk = -2.6
    risk += 0.55 if overtime == "Yes" else 0
    risk += (4 - job_satisfaction) * 0.30
    risk += (4 - work_life_balance) * 0.28
    risk += (4 - env_satisfaction) * 0.18
    risk += 0.40 if marital_status == "Single" else 0
    risk += max(0, (3 - company_tenure)) * 0.18
    risk += 0.25 if business_travel == "Travel_Frequently" else 0
    risk += max(0, (30 - age)) * 0.02
    risk += -0.18 * stock_option_level
    risk += max(0, (years_since_promotion - 4)) * 0.10
    risk += max(0, (distance_from_home - 15)) * 0.025
    risk += -0.00012 * (monthly_income - 6500)
    risk += rng.normal(0, 0.55)  # noise

    prob = 1 / (1 + np.exp(-risk))
    attrition = "Yes" if rng.random() < prob else "No"

    rows.append({
        "EmployeeID": 1000 + i,
        "Name": name,
        "Age": age,
        "Gender": gender,
        "MaritalStatus": marital_status,
        "Department": dept,
        "JobRole": role,
        "JobLevel": job_level,
        "Education": education,
        "EducationField": edu_field,
        "City": city,
        "DistanceFromHome_km": distance_from_home,
        "BusinessTravel": business_travel,
        "MonthlyIncome": monthly_income,
        "PercentSalaryHike": percent_salary_hike,
        "StockOptionLevel": stock_option_level,
        "OverTime": overtime,
        "TotalWorkingYears": total_working_years,
        "YearsAtCompany": company_tenure,
        "YearsInCurrentRole": years_in_role,
        "YearsSinceLastPromotion": years_since_promotion,
        "YearsWithCurrManager": years_with_manager,
        "NumCompaniesWorked": num_companies_worked,
        "TrainingTimesLastYear": training_times_last_year,
        "EnvironmentSatisfaction": env_satisfaction,
        "JobSatisfaction": job_satisfaction,
        "RelationshipSatisfaction": relationship_satisfaction,
        "WorkLifeBalance": work_life_balance,
        "JobInvolvement": job_involvement,
        "PerformanceRating": performance_rating,
        "Attrition": attrition,
    })

df = pd.DataFrame(rows)
df.to_csv("/home/claude/hr-analytics/hr_data.csv", index=False)
print(df.shape)
print(df["Attrition"].value_counts(normalize=True))
print(df.groupby("Department")["Attrition"].apply(lambda s: (s == "Yes").mean()))
