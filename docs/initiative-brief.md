# Initiative Brief: VA AI Assist

Last updated: June 25, 2025

## Overview

We will deliver a generative AI-enabled chat tool that helps VA clinical staff with summarizing clinical documentation from the electronic health record (EHR) to support pre-encounter chart review and drafting of documentation. 

## Product overview

### Problem statement
VA physicians, nurses, and other clinical staff have expressed interest in using AI to conduct tasks like:

- Summarize large volumes of patient information 
- Summarize prior cardiac testing procedures and clinical visits 
- Improve accuracy and completeness in coding
- Identify social work service needs through chart review when evaluating a new patient

Looking through all the records takes time because they contain information you don’t need, aren’t always labeled clearly and can take multiple clicks to open. And physicians who currently use LLMs to support their work need to constantly switch systems and copy-paste, requiring additional time and effort.

**How can we utilize a Large Language Model (LLM) to help VA clinical staff improve patient outcomes, save time per task, enhance productivity, and foster collaboration?**

### Solution narrative

- A lean application focused initially on providing value to Primary Care Physicians (PCP). This will likely have the following features:
  - Generate and make available summaries from patient notes and medical history for PCPs. Some VA physicians have developed prompts that we can use to base.
  - Make patient notes and medical history available to the LLM/GPT so PCPs can ask questions, generate ad hoc summaries, or investigate trends through a chat interface.
- We still need to complete technical discovery, but a potential solution could be:
  1. Create a Model Context Protocol (MCP) server that connects to VA’s Vista EHR and makes medical records and patient notes available. MCP is an industry standard for making data available to LLMs, and we’d make our MCP server for any other applications.
  2. Connect the MCP server to the Coforma-built GPT application to allow access to patient data (this will likely require agents to consume the MCP server).
  3. Create automatic summaries and allow ad hoc prompts.
  4. Customize the existing Coforma-built VA GPT application interface to workflows and the needs of VA physicians and other clinical staff.

### Target audience

Our target audience is primary care physicians and their teams.

## Goals and metrics for success

- Reduce the time PCPs spend preparing for an appointment with a patient
- Customer satisfaction score (CSAT) meets or exceeds organizational standards

### Short-term goals through end of Phase 3

- Connect patient notes and medical records to an LLM in a pre-production environment
- Provide a chat interface that supports clinician specific workflows
- Implement summaries to support pre-appointment preparation

## Timelines and milestones

### Phase 1 - Discovery and feasibility for summarization

**Goals:**
- Understand physician needs and define workflows, including which automatic or canned summaries are most useful
- Understand technical feasibility and evaluate ease of access to data

**Duration:** 2 sprints (17, 18)

| |Activities|Deliverables|
|:--|:--|:--|
|1|Research with primary care physicians|Synthesis from user research that includes:<br>- a list of top tasks physicians need to do to prepare for an appointment<br>- a list of tasks that would benefit from automatic summarization<br>- an understanding of format preferences<br><br>We will also define key physician workflows to provide a clear picture of the tasks (or features) we’re designing for in the next phase.|
|2|Technical discovery and feasibility analysis|Implementation plan that outlines:<br>- access to VistA data<br>- deployment environments<br>- ATO boundaries<br>- system architecture showing the data flow between an LLM and the EHR|
|3|Define evaluation framework for summarization|Clear plan for which evaluations we want to run and an understanding of which evaluation framework we can use in a VA environment.|

### Phase 2 - Validating the technical feasibility

**Goals:**
- Build a test MCP and test with scripts
- Validate that LLM-generated summaries are of an acceptable quality
- Physician-specific workflows are well defined at low-fidelity

**Duration:** 2 sprints (19, 20)

| |Activities|Deliverables|
|:--|:--|:--|
|1|Build a minimal Model Context Protocol (MCP) server|Server that provides access to at least one type of patient record deployed in a test environment|
|2|Test the MCP server with scripts|Scripts, perhaps using the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)|
|3|Validate that LLM-generated summaries are of an acceptable quality|Evaluation framework has been configured to our application and list of optimized prompts that generates summaries that are useful to physicians and in an acceptable format|
|4|Design low-fidelity workflows and screens|Wireframes|

### Phase 3 - Iterate towards a minimum viable product (MVP)

**Goals:**
- Deploy an MVP in a pre-environment
- Test with primary care physicians

**Duration:** 4 sprints (21, 22, 23, 24)

| |Activities|Deliverables|
|:--|:--|:--|
|1|Design high-fidelity workflows and screens|Designs ready in Figma|
|2|Expand the MCP server to provide more patient information|MCP server deployed in a production environment, alongside code and documentation|
|3|Build agentic flows to consume the MCP|Agentic framework has been added and we’ve build agentic flows that consume the MCP and understand the context of what the user is asking for, alongside code and documentation|
|4|Build interfaces for MVP|Application deployed in pre-production environment|
|5|Usability test with 5 to 10 primary care physicians|Synthesis from user research that includes recommendations for future usability improvements|

#### Phase 4 - Iterate towards expanded use

> [!NOTE]
> Phase 4 would be executed in an option period for the contract. 

**Goals:**
- Deploy MVP to production
- Increase maturity of UI in production, including updates from usability findings
- Integrate with VistA Imaging or other data sources
- Additional features for verification
- Citations for information that comes from VistA and is output via LLM

## Achievable 30,000 ft milestones

- **Access to notes and records.** Build an MCP server to get patient notes and medical records from VistA (in a pre-production environment).
- **Design patient summaries that provide value.** Design, prototype, and usability test patient notes and medical records summaries that are useful for PCPs and related staff.
- **Workflows designed for clinicians.** Design, prototype, and usability test clinician workflows. 
- **Implement at least one type of summary.** Implement a simplified workflow and summary in a pre-production environment (MVP).
- **Test MVP with clinicians.** User research with clinicians to test the application.

## Risks and mitigations

- **Risk:** Patient notes and medical records from Vista are not as comprehensive as those in Joint Longitudinal Viewer (JLV). JLV includes records from military service and community care clinics, for example. However, there is no publicly available API to access JLV data. This could be limiting for physicians.
  - **Mitigation:** We’re going to learn more about this in research with physicians. We’ll also have a document upload feature that allows physicians to add additional data from other systems. 
- **Risk:** It’s possible that getting patient notes and medical records from Vista is difficult through Vista-API-X.
  - **Mitigation:** We’ll undertake a comprehensive technical discovery and feasibility analysis, followed by delivering a proof of concept demonstrating key functionality.
- **Risk:** There are inherent risks in feeding medical information into LLMs.
  - **Mitigation:** We can leverage techniques to do this work safely. For example, using gatekeeper agents, as well as, feedback collection and continuous evaluation by data engineers. We should also confirm there are not any established standards that a chatbot needs to meet in order to assist doctors with summarization. 
