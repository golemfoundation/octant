## Description

## Definition of Done

1. [ ] If required, the desciption of your change is added to the [QA changelog](https://www.notion.so/octantapp/Changelog-for-the-QA-d96fa3b411cf488bb1d8d9a598d88281) 
2. [ ] Acceptance criteria are met.
3. [ ] PR is manually tested before the merge by developer(s).
    - [ ] Happy path is manually checked.
4. [ ] PR is manually tested by QA when their assistance is required (1).
    - [ ] Octant Areas & Test Cases are checked for impact and updated if required (2).
5. [ ] Unit tests are added unless there is a reason to omit them.
6. [ ] Automated tests are added when required.
7. [ ] The code is merged.
8. [ ] Tech documentation is added / updated, reviewed and approved (including mandatory approval by a code owner, should such exist for changed files).
    - [ ] BE: Swagger documentation is updated.
9. [ ] When required by QA:
    - [ ] Deployed to the relevant environment.
    - [ ] Passed system tests.

---

(1) Developer(s) in coordination with QA decide whether it's required. For small tickets introducing small changes QA assistance is most probably not required.

(2) [Octant Areas & Test Cases](https://docs.google.com/spreadsheets/d/1cRe6dxuKJV3a4ZskAwWEPvrFkQm6rEfyUCYwLTYw_Cc).
