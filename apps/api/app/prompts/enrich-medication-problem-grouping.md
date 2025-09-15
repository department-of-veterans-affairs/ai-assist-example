## Task
Given an input JSON with medication grouping in the `data` field and a PatientDFN in the `patient_dfn` field, use the provided PatientDFN and an MCP Server with tools to retrieve up to 1825 days of labs and vitals, and the `n_most_recent` flag to request the 3 most recent labs and vitals per type. Integrate relevant labs and vitals into the input json.

 Return a valid JSON with labs and vitals added to each medication group.

## Input Data
- **patient_dfn** - The patient's DFN
- **data** - Contains medication groups organized by treatment indication, with each group containing medications that treat the same condition or serve the same therapeutic purpose
- **MCP Server** - An MCP Server with tools to retrieve labs and vitals for the given PatientDFN. Note that the tools return paged results. Make as many tool requests as needed to retrieve all labs and vitals. Use the `days_back` flag to request labs and vitals from the last 1825 days and the `limit` flag to request up to 200 results at a time.

## Lab and Vital Indication Reference Map
Use this to guide when linking lab and vital results to indication groups. Use loose matching and medical reasoning to match these conditions to indication groups. For indications not listed in this map, use medical reasoning to determine whether input labs/vitals are relevant.

- **Indication: Blood pressure** | Labs/vitals: creatinine, eGFR, potassium, sodium, chloride, BUN, magnesium, blood pressure, pulse, albumin, microalbumin, urinalysis
- **Indication: Diabetes** | Labs/vitals: A1C, glucose, fructosamine, creatinine, eGFR, BUN, microalbumin, urinalysis, lipid panel, cholesterol, triglycerides, HDL, LDL, blood pressure
- **Indication: Mental health/Mood/Dementia/Antipsychotics** | Labs/vitals: lipid panel, cholesterol, triglycerides, HDL, LDL, A1C, glucose, weight, TSH, prolactin, CBC
- **Indication: Anticoagulation** | Labs/vitals: creatinine, eGFR, AST, ALT, bilirubin, HGB, HCT, platelets, INR, PT, PTT, CBC
- **Indication: Lipid management** | Labs/vitals: lipid panel, cholesterol, triglycerides, HDL, LDL, AST, ALT, bilirubin, CK, A1C
- **Indication: Nutritional support** | Labs/vitals: weight, albumin, prealbumin, vitamin D, vitamin B12, folate, iron studies, transferrin, CBC
- **Indication: Thyroid** | Labs/vitals: TSH, T3, T4, free T3, free T4, reverse T3, thyroglobulin, anti-TPO
- **Indication: Renal adjustment needs** | Labs/vitals: creatinine, eGFR, BUN, creatinine clearance, urinalysis, microalbumin, electrolytes
- **Indication: GERD** | Labs/vitals: creatinine, eGFR, magnesium, B12, iron studies, CBC
- **Indication: COPD** | Labs/vitals: eosinophils, CBC, ABG, CO2, oxygen saturation, alpha-1 antitrypsin
- **Indication: Pain** | Labs/vitals: creatinine, eGFR, AST, ALT, bilirubin, CBC, platelets
- **Indication: Heart failure** | Labs/vitals: BNP, NT-proBNP, creatinine, eGFR, electrolytes, albumin, CBC, TSH, magnesium
- **Indication: Infection/Antibiotics** | Labs/vitals: CBC, WBC, neutrophils, bands, CRP, ESR, procalcitonin, creatinine, eGFR, AST, ALT
- **Indication: Osteoporosis** | Labs/vitals: calcium, phosphorus, magnesium, vitamin D, PTH, alkaline phosphatase, creatinine
- **Indication: Anemia** | Labs/vitals: CBC, HGB, HCT, iron studies, ferritin, transferrin, B12, folate, reticulocyte count

## Integration Rules

1. **Clinical Reasoning**: Use loose matching between medication group treatment indications and the reference map categories
2. **Lab and Vital Format**: Reproduce lab and vitals values in the same format as input, including capitalization. Treat lab structure as fixed data.
3. **Blood Pressure and Pulse**: Include all available values, each on its own line.
4. **Include Dates**: All lab values and vitals must include their associated dates.
5. **3 Most Recent Values**: For each lab type and vital type, include 3 most recent values with dates, organized chronologically (most recent first).
6. **Trend Analysis**: For each lab type and vital type, provide a clinical trend assessment (e.g., "last 3 A1C values stable", "last 3 potassium values uptrending")

## Required Output Format

**You must return valid JSON in exactly this structure:**

{
  "groups": [
    {
      "group_number": 1,
      "treatment_indication": "string",
      "medications": [
        {
          "name": "string",
          "dose": "string or null",
          "route": "string or null", 
          "sig": "string or null",
          "status": "string or null"
        }
      ],
      "problem_list_match_type": "Exact | Approximate | Not on Problem List",
      "reasoning": "string",
      "relevant_labs": [
        {
          "name": "string",
          "values": [
            {
              "value": "string - preserve exact format from input",
              "date": "string - YYYY-MM-DD format"
            }
          ],
          "trend": "string - describe trend over time (e.g., 'last 3 A1C values stable', 'last 3 potassium values uptrending')"
        }
      ],
      "relevant_vitals": [
        {
          "name": "string",
          "values": [
            {
              "value": "string - preserve exact format from input",
              "date": "string - YYYY-MM-DD format"
            }
          ],
          "trend": "string - describe trend over time (e.g., 'last 3 blood pressure values uptrending', 'last 3 weight values stable')"
        }
      ]
    }
  ]
}

**CRITICAL: Return only the JSON object. Do not include any explanatory text, markdown formatting, or code blocks. The response must be pure, valid JSON that can be parsed directly.**
