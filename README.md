# Off-Line Human Resource Information System (HRIS)

### K-Holdings | MIS Course Project

---

## Project Overview

K-Holdings is a small-to-medium sized company with approximately **200 employees** across **5 departments**. They currently rely on manual methods (paper forms and spreadsheets) for HR operations. This project delivers a **fully offline-capable, client-side web application** to modernize their HR processes. No server, no internet required after the initial load.

---

## Table of Contents

- [Functional Areas](#functional-areas)
- [Technical Requirements](#technical-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Out of Scope](#out-of-scope)
- [Milestone Structure](#milestone-structure)
- [Evaluation Breakdown](#evaluation-breakdown)
- [Weekly Duties](#weekly-duties)
- [Accountability Checkpoints](#accountability-checkpoints)
- [Assumptions Log](#assumptions-log)
- [Academic Integrity Policy](#academic-integrity-policy)
- [Late and Team Policies](#late-and-team-policies)

---

## Functional Areas

| #   | Module                              | Description                                                                                                                                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Organizational Structure**        | Represent and maintain departments, positions, and reporting relationships including matrix reporting (direct + dotted-line managers). Must prevent logically inconsistent configurations. |
| 2   | **Employee Information Management** | Store comprehensive employee records. Manage the full employee lifecycle from hire to termination. Track skills and certifications with expiration dates.                                  |
| 3   | **Leave Management**                | Full leave request workflow with approval chains, entitlement rules, leave balances, audit trails, and a calendar view showing team availability.                                          |
| 4   | **Attendance Tracking**             | Capture and report employee attendance, handle exceptions, and provide management summaries. Integrates with payroll.                                                                      |
| 5   | **Compensation Processing**         | Basic payroll processing for both hourly and salaried employees. Overtime calculations for hourly staff based on attendance. Generates pay stubs.                                          |
| 6   | **Reporting and Analytics**         | Workforce reports for HR managers and executive decision makers.                                                                                                                           |

---

## Technical Requirements

| Requirement           | Specification                                         |
| --------------------- | ----------------------------------------------------- |
| **Languages**         | HTML, CSS, JavaScript                                 |
| **Frameworks**        | Team's choice, must be justified in documentation     |
| **Data Storage**      | Browser-based only (IndexedDB, localStorage, etc.)    |
| **Offline Support**   | Full functionality without network after initial load |
| **Browser Support**   | Current versions of Chrome and Firefox (minimum)      |
| **Responsive Design** | Desktop and tablet screen sizes                       |

---

## Non-Functional Requirements

- Employee data must **not be lost** during normal operation
- Must remain **responsive with 200+ employee records**
- All user interactions must provide **suitable feedback**
- Navigation must be accessible to users with **basic computer literacy**
- Input validation must **prevent data corruption** and invalid states

---

## Out of Scope

- Integration with external systems
- Multi-device synchronization
- User authentication / authorization _(single-user access assumed)_
- Email or notification services
- Actual financial transactions

---

## Milestone Structure

### Milestone 1 - Foundation (Weeks 1–4) | 10%

> **Goal:** Research, planning, and project setup.

**Deliverables:**

- [ ] Field Research Report (2 HR practitioner interviews, min 20 min each, signed consent forms, written summary)
- [ ] Requirements Analysis Document (entity-relationship mapping, business rules catalog, prioritized feature list)
- [ ] Development Environment Evidence (version control repo screenshot, initial project structure, min 3 commits per member)
- [ ] Team Charter (roles, communication protocols, conflict resolution, signed by all members)

**Gate:** All deliverables complete and authentic interviews required to proceed.

---

### Milestone 2 - Design and Core Build (Weeks 5–8) | 15%

> **New Requirements revealed at Week 5:**
>
> - Organizational structure must support **matrix reporting** (direct + dotted-line managers)
> - Track **employee skills and certifications** with expiration dates

**Deliverables:**

- [ ] Design Specification (data model/schema, UI mockups for ALL screens, state diagrams, design decision log)
- [ ] Working Prototype V1:
  - Organizational Structure Module: **COMPLETE**
  - Employee Management Module: **COMPLETE**
  - At least **50 sample employee records** loaded
  - Live 15-minute demo to instructor
- [ ] Prototype Testing Evidence (2 non-team testers, min 10 min screen+audio recordings each, usability issue list + prioritized fix list)
- [ ] Min 30 total commits across team with code review evidence
- [ ] Written response to Milestone 1 feedback with evidence of changes made

**Gate:** Live demo required, no exceptions. Teams not demonstrating cannot proceed.

---

### Milestone 3 - Feature Completion (Weeks 9–12) | 20%

> **New Requirements revealed at Week 9:**
>
> - Leave management must include a **calendar view** showing team availability (who is out per day/week)
> - Payroll supports **hourly and salaried** employees with **overtime** calculated from attendance records
> - Test dataset: approximately **40 employees** with **6 months** of historical attendance and leave data

**Deliverables:**

- [ ] Feature-complete application (all 6 modules, calendar view, integrated payroll + attendance, test dataset loaded)
- [ ] Live 25-minute demo covering:
  - Full employee lifecycle
  - Leave request through approval
  - Payroll run for one pay period
  - Reporting capabilities
  - Ad-hoc instructor scenarios
- [ ] User Acceptance Testing (3 external testers, task list released Week 10, screen recordings of ALL sessions, documented issues + resolution status)
- [ ] Technical Debt Register (known issues, shortcuts, prioritized remediation plan)
- [ ] Individual Technical Interviews (10 minutes each, scheduled separately per member)

**Gate:** All members must pass individual technical interview. App must complete standard scenario without critical failures.

---

### Milestone 4 - Final Delivery (Weeks 13–16) | 25%

> **New Requirements revealed at Week 13:**
>
> - Expand dataset to **200 employees, 5 departments, 12 months** of historical data. System must remain responsive.
> - IT department requires **video documentation** of the codebase for maintainability.

#### Documentation Deliverables — Due Week 15

- [ ] User Manual (task-based, annotated screenshots, printable quick reference guide max 2 pages)
- [ ] Technical Documentation Package:
  - Architecture overview document
  - Data dictionary with field-level descriptions
  - 4 codebase walkthrough videos (8–12 min each, a different team member per video):
    - Video 1: Data Layer Explanation
    - Video 2: UI Components Explanation
    - Video 3: Business Logic Explanation
    - Video 4: Integration and Testing
- [ ] Full test dataset: 200 employees, 12 months attendance + leave data, realistic distribution (new hires, terminations, etc.)

#### Final Deliverables — Due Week 16

- [ ] Final application (all technical debt addressed or justified, performance validated, tested on required browsers)
- [ ] Individual Reflection Report (4–5 pages per person: personal contributions, challenges, learnings, team dynamics, retrospective)
- [ ] Final Presentation and Defense (30 min: 15 min presentation + 15 min Q&A, dress professionally)

---

## Evaluation Breakdown

### Team Grade — 70% of Overall Grade

| Criteria              | Weight | Key Questions                                                                                                                          |
| --------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Functionality**     | 30%    | Were all functional areas addressed? Are business rules correct? Were edge cases handled? Were new requirements incorporated?          |
| **Technical Quality** | 25%    | Is the code organized and maintainable? Are technologies used appropriately? Was data integrity maintained? Is performance acceptable? |
| **Design Quality**    | 20%    | Is the UI clear and consistent? Are workflows logically designed? Was usability testing responded to?                                  |
| **Documentation**     | 15%    | Is documentation complete and accurate? Are videos well-presented? Are design decisions clearly articulated?                           |
| **Process Evidence**  | 10%    | Were weekly submissions consistent? Does commit history show good activity? Was feedback responded to positively?                      |

### Individual Grade — 30% of Overall Grade

| Criteria                       | Weight |
| ------------------------------ | ------ |
| Individual Technical Interview | 8%     |
| Individual Codebase Video      | 6%     |
| Individual Reflection Report   | 6%     |
| Peer Evaluation Results        | 5%     |
| Evidence of Participation      | 5%     |

> **Note:** Individual grades may be adjusted to reflect a team grade of 85–100 based on demonstrated contribution and competence.

---

## Weekly Duties

Every team submits the following **each week by Friday at 5:00 PM:**

| Duty               | Requirement                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Stand-up Video** | 2–3 minutes; all members on camera; each member states what they finished, what they are working on, and what they need help with |
| **Commit History** | Min 5 commits per team per week; every member must have at least 1 commit                                                         |
| **Hours Log**      | Time logged per task; reviewed at milestone submissions for equitable contribution                                                |

---

## Accountability Checkpoints

| Week | Checkpoint                     | Details                                                                                                          |
| ---- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 6    | Code Contribution Audit        | Members with less than 15% of total commits must submit a written explanation; individual grades may be adjusted |
| 10   | Peer Evaluation #1             | Confidential; significant disparities trigger instructor intervention                                            |
| 12   | Individual Technical Interview | Must explain personally authored code and articulate design rationale                                            |
| 14   | Peer Evaluation #2             | Used to calculate final individual team member grades                                                            |

### Physical Evidence Requirements

The following **cannot be artificially created** and require direct evidence:

- Audio/video recordings of HR practitioner interviews (faces and voices)
- Screen recordings of user testing sessions
- Weekly stand-up videos with all members participating
- Individual codebase walkthrough videos (you speaking, code on screen)
- Live demonstrations (real-time, scheduled)
- Final presentation (live, in-person)
- Individual technical interviews (live, in-person)

> **If required physical evidence is missing from a submission, it is worth 0 credits.**

---

## Assumptions Log

All undocumented business rules must be logged in a dedicated document. Each entry must include:

| Field        | Description                                     |
| ------------ | ----------------------------------------------- |
| **ID**       | Unique identifier for tracking purposes         |
| **Gap**      | The ambiguity or missing rule identified        |
| **Decision** | What the team decided                           |
| **Source**   | Interview insight, research, or team assumption |
| **Date**     | When the decision was made                      |
| **Impact**   | How it affects implementation                   |

> This document is proof of your team's decision-making process and will be reviewed at every milestone. Poor documentation results in point deductions.

---

## Academic Integrity Policy

### AI Tool Usage

| Action                                | Status      |
| ------------------------------------- | ----------- |
| Generate application code             | NOT ALLOWED |
| Write documentation                   | NOT ALLOWED |
| Create design artifacts               | NOT ALLOWED |
| Record and submit all AI interactions | REQUIRED    |

### Additional Requirements

- All code must be **original work** developed by team members
- External libraries must be **declared and justified** in documentation
- Version control history must show **incremental, human-made changes**
- All team members must be able to **explain any part of the submission**

### Consequences

| Violation        | Penalty                                                  |
| ---------------- | -------------------------------------------------------- |
| First violation  | Zero on affected deliverable + Academic Integrity Report |
| Second violation | F in course + Academic Integrity Report                  |

---

## Late and Team Policies

### Late Policy

| Scenario              | Penalty                                                        |
| --------------------- | -------------------------------------------------------------- |
| Milestone deliverable | 10% deduction per day, maximum 3 days                          |
| Weekly requirements   | No late submissions accepted                                   |
| Missed demonstration  | Must reschedule within 48 hours or receive zero credit         |
| Emergency exception   | Requires prior approval from Dean's Office before the deadline |

### Team Dispute Resolution

1. Disputes must first follow the **team charter** resolution process
2. Unresolved disputes are **escalated to the instructor** with documentation
3. Last resort: team dissolution, members continue individually
4. Removing a member requires team documentation + instructor approval; the removed member receives an **Incomplete** and must appeal to continue independently

---

> _"You will succeed if you consistently put forth the effort necessary to accomplish something worthwhile, develop skills that are genuinely needed, authentically acquire those skills, and execute professionally. There is NO shortcut."_
> `
