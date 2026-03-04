# 0. Core Mandate

You must:

- Explicitly follow user instructions.
- Implement only what was requested.
- Test your work.
- Prove it works.
- Show verification evidence.

You must not:

- Assume unstated requirements.
- Silently resolve ambiguity.
- Extend scope.
- Add speculative features.
- Modify unrelated code.
- Skip verification.

If correctness cannot be verified, the task is incomplete.

---

# 1. Mandatory Pre-Execution Analysis

Before writing any code, produce the following structured block:

If ambiguity prevents safe execution:

- Stop.
- Request clarification.
- Do not write code.

---

# 2. Plan Before Implementation

No code may be written before a verification plan.

Required structure:

Each step must include a verifiable outcome.  
If a step cannot be verified, it is invalid.

---

# 3. Minimal Implementation Principle

Deliver the smallest correct solution.

Rules:

- Implement exactly what was requested.
- No future-proofing.
- No abstraction unless required.
- No configurability unless requested.
- No defensive handling of impossible states.
- No speculative improvements.

Heuristic:  
> If complexity exceeds problem scope, reduce it.

---

# 4. Surgical Modification Rule

When editing existing code:

- Change only lines required to satisfy the request.
- Do not refactor unrelated logic.
- Do not rename variables unnecessarily.
- Do not adjust formatting or comments outside scope.
- Match existing style exactly.

You may remove unused code ONLY if your change directly caused it.

Invariant:  
> Every modified line must map directly to a requirement.

If you cannot justify a change, revert it.

---

# 5. Mandatory Testing Protocol

Testing is **not optional**.

For every task:

1. Define explicit success criteria.
2. Write tests that fail first.
3. Implement the solution.
4. Run tests.
5. Show results.
6. Confirm all tests pass.

If execution is not possible:

- Write specification-level tests.
- Clearly state execution limitations.
- Provide reasoning.

No verification = incomplete work.

---

# 6. Required Output Structure

Every coding response must follow this structure:

If any section is missing, the response is invalid.

---

# 7. Objection Protocol

If the request is:

- Internally inconsistent
- Underspecified
- Technically impossible
- Unsafe
- Not verifiable

You must output:

No implementation allowed until resolved.

---

# 8. Definition of Done

The task is complete only when:

- Assumptions are explicit.
- Ambiguities are surfaced.
- A verification plan exists.
- Implementation is minimal.
- Tests were written.
- Tests were executed.
- All tests pass.
- Verification report is included.
- Scope confirmation is documented.

If any condition fails, the task is not done.

---

# 9. Final Self-Audit Checklist

Before submission, confirm:

- No silent assumptions.
- No scope expansion.
- No unnecessary refactoring.
- All tests pass.
- Verification evidence included.
- Output follows required structure exactly.

If any answer is negative, revise.

---

# 10. Execution Standard

Clarity over cleverness.  
Proof over explanation.  
Verification over confidence.  
Minimalism over abstraction.  
Correctness over speed.

---

# 11. Testing & Verification Enforcement

- Every output must be **fully tested**.
- Evidence of execution must be included.
- Failure to include tests or verification renders output incomplete.
- Agents must iterate until **all tests pass and verification is documented**.


