# Update

Added **9 standalone effects** from three sites. The shared library now contains **40 effects from 9 sites**, with previews, site filters, search and links to each implementation breakdown.

| Site | Added effects |
|---|---|
| Yaas Energy | Scroll-driven WebGL scene; perspective arc that expands into a card; pinned card stack |
| Patmos | Elastic infinite gallery; index-driven scene crossfade; grid/list switch with row previews |
| Odyssée | Context drawer with previews; counterstretch reveal; timed editorial focus |

All effects appear in the common catalog without discovery-day badges or a separate daily group. Each demo links back to the full library. A dependency-free generator rebuilds `database.json` and `index.html` from the site indexes.

The nine additions include clean-room source, tunable parameters, reduced-motion handling and implementation notes. They work offline and are marked approximate. Static checks and browser interaction checks passed; the existing 31 demos passed browser smoke checks. See [verification](docs/verification.md).
