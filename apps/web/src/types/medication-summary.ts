export interface LabVitalValue {
  value: string;
  date: string;
}

export interface LabVital {
  name: string;
  values: LabVitalValue[];
  trend: string;
}

export interface Medication {
  name: string;
  dose: string;
  route: string;
  sig: string;
  status: string;
  drug_class: string | null;
  ordered_date: string | null;
  last_filled: string | null;
  fills_allowed: number | null;
  fills_remaining: number | null;
  provider_name: string | null;
}

export interface ProblemGroup {
  group_number: number;
  treatment_indication: string;
  medications: Medication[];
  problem_list_match_type: 'Exact' | 'Approximate' | 'Not on Problem List';
  reasoning: string;
  relevant_labs: LabVital[];
  relevant_vitals: LabVital[];
}

export interface MedicationSummary {
  groups: ProblemGroup[];
}

export const TEST_DATA = `
{
  "groups": [
    {
      "group_number": 1,
      "treatment_indication": "Smoking Cessation",
      "medications": [
        {
          "name": "VARENICLINE TAB",
          "dose": "0.5 MG",
          "route": "PO",
          "sig": "TAKE ONE TABLET BY MOUTH THREE TIMES A DAY",
          "status": "ACTIVE",
          "drug_class": "ANTIDOTES/DETERRENTS,OTHER",
          "ordered_date": "2025-07-14",
          "last_filled": "2025-07-14",
          "fills_allowed": 3,
          "fills_remaining": 3,
          "provider_name": "HENDRY,MIKE"
        }
      ],
      "problem_list_match_type": "Exact",
      "reasoning": "Varenicline is used for smoking cessation, matching the problem list entry 'Personal history of nicotine dependence'.",
      "relevant_labs": [],
      "labs_recommendation": [],
      "relevant_vitals": [],
      "vitals_recommendation": []
    },
    {
      "group_number": 2,
      "treatment_indication": "Pain Relief",
      "medications": [
        {
          "name": "ASPIRIN BUFFERED TAB",
          "dose": "325 MG",
          "route": "PO",
          "sig": "TAKE ONE TABLET BY MOUTH AT ONSET SICK",
          "status": "ACTIVE",
          "drug_class": "NON-OPIOID ANALGESICS",
          "ordered_date": "2024-12-24",
          "last_filled": "2025-07-11",
          "fills_allowed": 0,
          "fills_remaining": 0,
          "provider_name": "EFIMOV,NIKOLAI"
        }
      ],
      "problem_list_match_type": "Not on Problem List",
      "reasoning": "Aspirin is generally used for pain relief or cardiovascular protection, neither of which are explicitly listed on the problem list.",
      "relevant_labs": [
        {
          "name": "CREATININE",
          "values": [
            {
              "value": "1.4 mg/dL",
              "date": "2025-06-09"
            },
            {
              "value": "1.1 mg/dL",
              "date": "2025-05-27"
            },
            {
              "value": "1.1 mg/dL",
              "date": "2025-05-27"
            }
          ],
          "trend": "last 3 CREATININE values stable"
        },
        {
          "name": "UREA NITROGEN",
          "values": [
            {
              "value": "10 mg/dL",
              "date": "2025-05-27"
            },
            {
              "value": "10 mg/dL",
              "date": "2025-05-27"
            },
            {
              "value": "18 mg/dL",
              "date": "2025-05-15"
            }
          ],
          "trend": "last 3 UREA NITROGEN values stable"
        }
      ],
      "labs_recommendation": [
        "AST",
        "ALT",
        "BILIRUBIN",
        "CBC",
        "PLATELETS"
      ],
      "relevant_vitals": [
        {
          "name": "PAIN",
          "values": [
            {
              "value": "1",
              "date": "2023-10-25"
            },
            {
              "value": "1",
              "date": "2010-03-05"
            },
            {
              "value": "2",
              "date": "2009-12-01"
            }
          ],
          "trend": "last 3 PAIN values stable"
        }
      ],
      "vitals_recommendation": []
    },
    {
      "group_number": 3,
      "treatment_indication": "Hyperlipidemia",
      "medications": [
        {
          "name": "ROSUVASTATIN TAB",
          "dose": "10 MG",
          "route": "PO",
          "sig": "TAKE ONE-HALF TABLET BY MOUTH WEEKLY",
          "status": "ACTIVE",
          "drug_class": "ANTILIPEMIC AGENTS",
          "ordered_date": "2025-04-14",
          "last_filled": null,
          "fills_allowed": null,
          "fills_remaining": null,
          "provider_name": "PROVIDER,EIGHTY"
        }
      ],
      "problem_list_match_type": "Exact",
      "reasoning": "Rosuvastatin is used to treat hyperlipidemia, which matches the problem list entry 'Hyperlipidemia (ICD-9-CM 272.4)'.",
      "relevant_labs": [
        {
          "name": "CHOLESTEROL",
          "values": [
            {
              "value": "178 mg/dL",
              "date": "2025-07-14"
            },
            {
              "value": "110 mg/dL",
              "date": "2023-12-19"
            },
            {
              "value": "120 mg/dL",
              "date": "2023-05-09"
            }
          ],
          "trend": "last 3 CHOLESTEROL values uptrending"
        },
        {
          "name": "LDL CHOLESTEROL",
          "values": [
            {
              "value": "146 MG/DL",
              "date": "2025-07-14"
            },
            {
              "value": "77 MG/DL",
              "date": "2023-12-19"
            },
            {
              "value": "77 MG/DL",
              "date": "2010-03-23"
            }
          ],
          "trend": "last 3 LDL CHOLESTEROL values uptrending"
        },
        {
          "name": "HDL",
          "values": [
            {
              "value": "67 MG/DL",
              "date": "2025-07-14"
            },
            {
              "value": "57 MG/DL",
              "date": "2023-12-19"
            },
            {
              "value": "58 MG/DL",
              "date": "2010-03-23"
            }
          ],
          "trend": "last 3 HDL values stable"
        }
      ],
      "labs_recommendation": [
        "TRIGLYCERIDES",
        "AST",
        "ALT",
        "BILIRUBIN",
        "CK",
        "A1C"
      ],
      "relevant_vitals": [],
      "vitals_recommendation": []
    },
    {
      "group_number": 4,
      "treatment_indication": "Seizure Disorder",
      "medications": [
        {
          "name": "CARBAMAZEPINE TAB",
          "dose": "400 MG",
          "route": "PO",
          "sig": "TAKE TWO TABLETS BY MOUTH THREE TIMES A DAY",
          "status": "ACTIVE",
          "drug_class": "ANTICONVULSANTS",
          "ordered_date": "2025-02-27",
          "last_filled": "2025-02-27",
          "fills_allowed": 6,
          "fills_remaining": 6,
          "provider_name": "ELKIN,PETER"
        }
      ],
      "problem_list_match_type": "Not on Problem List",
      "reasoning": "Carbamazepine is used for seizure disorders, which is not explicitly listed on the problem list.",
      "relevant_labs": [],
      "labs_recommendation": [
        "CBC",
        "LIVER FUNCTION TESTS",
        "ELECTROLYTES"
      ],
      "relevant_vitals": [],
      "vitals_recommendation": []
    }
  ]
}`;
