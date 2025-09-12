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
  last_filled: string | null;
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

export const test_data = JSON.parse(`
{
  "groups": [
    {
      "group_number": 1,
      "treatment_indication": "Smoking Cessation",
      "medications": [
        {
          "name": "VARENICLINE TAB",
          "dose": "0.5 MG",
          "route": null,
          "sig": "TAKE ONE TABLET BY MOUTH THREE TIMES A DAY",
          "status": "ACTIVE",
          "last_filled": "2025-07-14"
        }
      ],
      "problem_list_match_type": "Exact",
      "reasoning": "Varenicline is used for smoking cessation and the problem list includes 'Former heavy tobacco smoker'.",
      "relevant_labs": [],
      "relevant_vitals": []
    },
    {
      "group_number": 2,
      "treatment_indication": "Pain Relief",
      "medications": [
        {
          "name": "ASPIRIN BUFFERED TAB",
          "dose": "325 MG",
          "route": null,
          "sig": "TAKE ONE TABLET BY MOUTH AT ONSET SICK",
          "status": "ACTIVE",
          "last_filled": "2025-07-11"
        }
      ],
      "problem_list_match_type": "Not on Problem List",
      "reasoning": "Aspirin is often used for pain relief, but there is no corresponding active problem in the list.",
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
          "trend": "last 3 creatinine values stable"
        },
        {
          "name": "PLATELET COUNT",
          "values": [
            {
              "value": "300",
              "date": "2022-08-25"
            }
          ],
          "trend": "only one platelet count value"
        }
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
              "value": "2",
              "date": "2024-10-25"
            }
          ],
          "trend": "pain uptrending"
        }
      ]
    },
    {
      "group_number": 3,
      "treatment_indication": "Hyperlipidemia",
      "medications": [
        {
          "name": "ROSUVASTATIN TAB",
          "dose": "10 MG",
          "route": null,
          "sig": "TAKE ONE-HALF TABLET BY MOUTH WEEKLY",
          "status": "ACTIVE",
          "last_filled": null
        }
      ],
      "problem_list_match_type": "Approximate",
      "reasoning": "Rosuvastatin is used to lower cholesterol levels, which can be related to cardiovascular health but no direct match in active problems.",
      "relevant_labs": [
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
            }
          ],
          "trend": "last 2 HDL values downtrending"
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
            }
          ],
          "trend": "last 2 LDL cholesterol values uptrending"
        },
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
          "trend": "last 3 cholesterol values stable"
        }
      ],
      "relevant_vitals": []
    },
    {
      "group_number": 4,
      "treatment_indication": "Seizure Disorder",
      "medications": [
        {
          "name": "CARBAMAZEPINE TAB",
          "dose": "400 MG",
          "route": null,
          "sig": "TAKE TWO TABLETS BY MOUTH THREE TIMES A DAY",
          "status": "ACTIVE",
          "last_filled": "2025-02-27"
        }
      ],
      "problem_list_match_type": "Not on Problem List",
      "reasoning": "Carbamazepine is typically used to treat seizure disorders, but there is no corresponding active problem in the list.",
      "relevant_labs": [],
      "relevant_vitals": []
    }
  ]
}
`);
