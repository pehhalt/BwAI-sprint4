---
theme: default
title: "lab-deck — index"
class: text-center
transition: none
---

# lab-deck

Decks live in `slides/`, one file per lab. This entry is just a pointer.

<div class="text-left inline-block mt-8 text-sm">

```bash
# preview one
pnpm exec slidev slides/<lab-slug>.md --open

# export one
pnpm exec slidev export slides/<lab-slug>.md \
  --output "../<lab-slug>.pdf"
```

</div>
