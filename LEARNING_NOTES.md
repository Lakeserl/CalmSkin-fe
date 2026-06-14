# CalmSkin FE Session — Learning Checklist

Living doc. Each item moves from `[ ]` → `[~]` (in progress) → `[x]` (mastered) only after you've demonstrated understanding by restating + answering quiz questions.

---

## Stage 1 — The Problem (and its branches)

### Big picture
- [ ] 1.1 Why does FE↔BE integration drift in microservice projects? What does "drift" look like in practice?
- [ ] 1.2 What's the difference between *"feature missing"* and *"feature wired wrong"*? Give examples we hit.

### Specific branches we tackled
- [ ] 1.3 **Review service** — what was the gap? (Hint: BE was 100% ready, FE was 0%.)
- [ ] 1.4 **N+1 review summary calls** — describe the symptom on a product list of 9 cards.
- [ ] 1.5 **Mock fallbacks** — why is `catch → set(mockData)` worse than `catch → set([])`?
- [ ] 1.6 **Half-wired web push** — what does "preference toggled, but browser never subscribed" actually mean for the user?
- [ ] 1.7 **Spoofed security headers** — why is FE attaching `X-User-Id` a security bug?
- [ ] 1.8 **Subscription service "done"** — what did "done" mean to BE, vs what FE actually saw? (Rule 12 — Fail Loud.)
- [ ] 1.9 **Routine / Compare / Shipments** — these were *blocked by BE not existing*, not by FE mistakes. Understand the distinction.

---

## Stage 2 — The Solutions (and the design decisions)

### Patterns we used (Angular-specific)
- [ ] 2.1 Why **OnPush + signals** instead of default change detection?
- [ ] 2.2 Why `takeUntilDestroyed(this.destroyRef)` on every subscribe in component code?
- [ ] 2.3 Why **URL-driven state** for `/products/compare?ids=1,2,3` instead of an in-memory list?
- [ ] 2.4 Why `@Input() summary` on `<app-product-reviews>` instead of fetching inside the component?

### Cross-cutting decisions
- [ ] 2.5 Why we **refused** BE's `ResponseUnwrapInterceptor` proposal (Rule 7).
- [ ] 2.6 Why the JWT interceptor must **bypass** absolute URLs for S3 presigned PUT.
- [ ] 2.7 Why de-dup `addAllToCart()` in routine page by `productId`.
- [ ] 2.8 Why we removed mock fallbacks *with a visible retry button* instead of just removing them.

### Edge cases
- [ ] 2.9 What happens if user denies push permission? How does the toggle revert?
- [ ] 2.10 What happens if compare URL has 1 product? 5 products? Invalid ids?
- [ ] 2.11 What happens if reviewSummary is `undefined` on a product? (Stars display path.)

---

## Stage 3 — Broader context (why this matters)

- [ ] 3.1 The compounding cost of bad design decisions — why "refactor later" rarely happens.
- [ ] 3.2 How proper type contracts (`ApiResponse<T>`, `SpringPage<T>`) prevent whole classes of bug.
- [ ] 3.3 What "Fail Loud" (Rule 12) buys you in a multi-team project.
- [ ] 3.4 How FE choices ripple to BE asks (e.g., why we asked BE for denormalized summary instead of batch endpoint).
- [ ] 3.5 The shape of "done" in a customer-facing feature — code merged ≠ feature shipped.

---

## Stage 4 — Apply it (the subscription wiring)

We'll use the freshly-completed subscription-service as a graded exercise:

- [ ] 4.1 Predict the FE shape *before* I show you BE — what files do we need? What conventions apply?
- [ ] 4.2 Spot the design decisions as we build (signals? URL state? cron timing?).
- [ ] 4.3 Identify at least one edge case I missed.

---

## How we'll move

Each stage:
1. **You restate** in your own words what you think the item means.
2. **I quiz you** with concrete scenarios (multiple choice or open-ended).
3. We only mark `[x]` after you've correctly handled the scenario.

No stage skips. If you get stuck, ask for `ELI5`, `ELI14`, or `ELII` (intern) and I'll re-pitch.
