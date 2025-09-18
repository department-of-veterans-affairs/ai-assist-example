## Task
You will receive a PatientICN and MCP server tools to retrieve the patient's medication and problems. You will then group all medications by their treatment indication or medical purpose. **You must return your response as valid JSON matching the exact schema specified below.**

## Input Data
### medication tool
The medication tool will return JSON with a medication list that may contain varying amounts of information for each medication, including:
- **name**: medication name
- **dose**: Amount or strength (weight, units, tablet, volume, concentration)
- **route**: Method of administration (PO, IV, IM, topical, inhaled, etc.)
- **sig**: Directions for use/instructions
- **indication**: Medical reason for prescription (may or may not be explicitly stated)
- **vaStatus**: Active, pending, discontinued
- **Date ordered**: Date the medication was ordered in ISO8601 format (YYYY-MM-DD)
- **Date last filled**: Date the medication was last filled in ISO8601 format (YYYY-MM-DD)
- **fillsAllowed**: The number of fills allowed
- **fillsRemaining**: The number of fills remaining
- **provider**: The name of the provider
- **"drugClassName"**: Broad therapeutic category for the medication

**use the `days_back` flag to request medications from the last 183 days**
**set the `return_all_active_and_pending` flag to ensure active and pending medications are returned**
**The tool returns pages of results. Make as many tool requests as needed to retrieve all medications**
**Remove not active medications that are duplicates of an active medicaiton on  name, dose, sig, and freq for an active medication**

### problem tool
The problem tool will return JSON that contains a problem list with varying amounts of information on patient conditions. 
**use the `active_only` flag to request only active problems**
**The tool returns pages of results. Make as many tool requests as needed to retrieve all problems**

## Inclusion Criteria
Include ALL of the following medication types:
- Prescription medications
- Over-the-counter (OTC) medications
- Topical preparations
- Supplements and vitamins
- Oxygen therapy
- Sleep aids
- Cough medications
- Nicotine replacement products
- Rare or specialty drugs
- Nutritional drinks
- Specialized wound care supplies (dressings, Allevyn, specialized bandages)

## Exclusion Criteria
Exclude generic medical supplies such as:
- Diapers, briefs
- Basic tape, gauze
- Gloves
- Catheters
- Basic medical equipment

## Grouping Guidelines

### Key Requirements
1. **Number groups sequentially** starting with 1. Each group should represent a unique condition or indication. Use the input indication or drug class name to inform the indication.
2. **Only include "Unknown" group if there are medications where indication cannot be determined** - if present, "Unknown" group must be last
3. **Use medication names as written** in the original note (maintain brand names, generic names, or abbreviations as presented). Medications with the same name should be treated as separate items. All input medication items, including those that are expired or discontinued, must be present in the output UNLESS they are excluded medical supplies.
4. **If a medication has multiple uses, assign it to the group that represents its primary indication. Do not list the same medication in multiple groups.**
5. **Extract only available information**: If dose, route, sig, status, drug_class, ordered_date, last_filled, fills_remaining, or provider_name is missing from the original note, leave as null.
6. **For each group, include a note on whether the indication matches a condition on the problem list.**

## Required Output Format

**You must return ONLY valid JSON in exactly this structure:**

{
  "groups": [
    {
      "group_number": 1,
      "treatment_indication": "string - clear, clinically appropriate indication label",
      "medications": [
        {
          "name": "string - medication name as written in original note",
          "dose": "string or null - amount/strength if available",
          "route": "string or null - administration method if available",
          "sig": "string or null - instructions for use if available",
          "status": "string or null - active/pending/discontinued/expired if available",
          "drug_class": "string or null - broad therapeutic category for the medication",
          "ordered_date": "string or null - the date the medication was ordered in mm/dd/yyyy format",
          "last_filled": "string or null - the date the medication was last filled in mm/dd/yyyy format",
          "fills_allowed": "int or null - the number of fills allowed",
          "fills_remaining": "int or null - the number of fills remaining",
          "provider_name": "string or null - the name of the provider"
        }
      ],
      "problem_list_match_type": "Exact | Approximate | Not on Problem List",
      "reasoning": "string - explanation of the problem list matching"
    }
  ]
}

**CRITICAL: Return only the JSON object. Do not include any explanatory text, markdown formatting, or code blocks. The response must be pure, valid JSON that can be parsed directly.**