# Tempo Lab — SEO keyword deployment map (V2.5)

**Source:** user-supplied Semrush US database research (November 18–20, 2026). The V1.1 research workbook contains 600 original competitor ranking records, 570 deduped competitor+keyword+URL records, and 462 distinct keyword strings. These **are competitor estimates, not site traffic**. Search volume across synonymous queries is **not additive**, and a keyword's KD is not proof a new domain will rank.

## Indexable tool landing pages — *only after real-domain launch*

| Intended page | US keyword | US monthly search volume | KD and date/source | Intent and deployment |
|---|---|---:|---|---|
| `/` | tap tempo | 18,100 | 23; Nov 20 keyword overview | Primary manual tap tempo tool: title, H1, and clear on-page explanation |
| `/` | tap bpm | 12,100 | 27; Nov 20 keyword overview | Same manual tapping intent; no duplicate page |
| `/` | bpm tapper | 12,100 | 31; Nov 20 keyword overview (10 on Nov 18 Positions) | Same tool, supporting copy; do not treat old KD as current |
| `/` | tap for bpm | 9,900 | 6; Nov 18 ranking export only | Supporting term, not a separate page |
| `/` | bpm counter | 12,100 | 52; Nov 18 ranking export only | Related term for manual counter, not a new page |
| `/` | tempo counter | 5,400 | 47; Nov 18 ranking export only | Supporting term |
| `/` | tempo tap | 2,900 | 24; Nov 18 ranking export only | Same tap intent |
| `/delay-reverb-calculator/` | reverb calculator | 3,600 | 23; Nov 18 ranking export only | Ambiguous RT60/music intent; only musical tempo-based reverb guidance is offered |
| `/delay-reverb-calculator/` | delay calculator | 2,400 | 17; Nov 18 ranking export only | Ambiguous generic intent; target **music timing** with BPM context |
| `/delay-reverb-calculator/` | delay time calculator | 480 | 15; Nov 18 ranking export only | Supporting, music-specific |
| `/delay-reverb-calculator/` | reverb time calculator | 590 | 17; Nov 18 ranking export only | Avoid implying acoustic RT60 calculation |

## Explicitly excluded

- `/bpm-finder/`: **not created**. `bpm finder` (49,500 US searches in historical ranking data) may be seeking automatic song/audio BPM detection. Manual tapping does **not** satisfy upload/audio analysis intent.
- `/metronome/`: **not created**. The V1.1 research has insufficient standalone SERP validation for a real metronome; `tap metronome` does not automatically establish metronome search demand.
- `slowed reverb`, pitch editing, audio effects generation and competitor brand queries: **not targeted**; the current tool does not do these operations.
- No bulk creation of synonymous thin landing pages or generated keyword stuffing.

## Implementation checks

- Homepage: title + descriptive H1 include “Tap Tempo”; body explains a BPM tapper, manual counting, examples and limitations. Canonical `/` on production.
- Calculator: title + H1 explicitly address BPM delay/reverb timing; user can calculate musical subdivisions, change time signature, copy values, and share a reproducible URL. Canonical `/delay-reverb-calculator/` on production.
- `/about/`, `/privacy/`, `/contact/`: legitimate support pages, **not** keyword landing pages.
- Preview output: still noindex. Formal SEO deployment requires production build (`SITE_URL`, `CONTACT_EMAIL`), valid own domain, real hosting and Search Console verification. GitHub push does not prove indexing or rankings.

## Measurement after launch

Group GSC US nonbrand impressions/clicks for Tap Tempo, BPM Counter, and BPM Delay into separate intent clusters; examine exact landing URLs and CTR rather than reporting summed competitor volumes as reachable visits. Reevaluate 30/90/180 days after first indexed impressions, and check whether ads obscure the mobile tap target before enabling monetization.
