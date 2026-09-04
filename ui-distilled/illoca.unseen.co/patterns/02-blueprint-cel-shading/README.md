# Blueprint cel shading

Source:
https://illoca.unseen.co/

## What is interesting

The 3D on this site does not look like 3D. It looks like an architect's marker rendering: two flat tones per surface, drawn edges, a shadow that breaks up into stipple rather than fading, and a paper grain over everything. All of that is one material, and each part of it is a small, legible idea rather than a post-processing stack.

The best detail is the shadow. A clean smoothstep terminator would read as computer graphics; the site multiplies it through a voronoi mask, so the boundary between lit and shaded dissolves into spray the way an airbrushed marker drawing does.

## Behavior

Surfaces are lit in two steps with no gradient between them. The pointer opens a soft circular window in which the surface becomes its blueprint version. A wipe can sweep the whole material away along its own UV axis, its edge roughened by noise.

## Trigger

ambient, pointer move (the reveal), and a progress value for the wipe

## Implementation in the original

One `ShaderMaterial` layered on Three's lighting chunks. The parts that matter, from the shipped shader:

```glsl
float diffuseFactor = max(dot(geometryNormal, directLight.direction), 0.0);
diffuseFactor = smoothstep(uDiffuseThreshold, uDiffuseThreshold + uDiffuseSmoothness, diffuseFactor);
color = mix(shadowColor * 0.5, color, diffuseFactor);

float sprayMask = smoothstep(uSprayRamp.x, uSprayRamp.y,
                             texture2D(tVoronoi, (vUv - 0.5 + 0.23459558) * uSprayScale * 0.8 + 0.5).r);
float shadow = getCustomShadowMask(sprayMask);
gl_FragColor.rgb = blendDarken(gl_FragColor.rgb, shadowColor, (1.0 - shadow) * uShadowIntensity);

vec3 noise = texture2D(tNoise, (vUv - 0.5) * uNoiseScale + 0.5).rgb;
float noiseStrength = smoothstep(uNoiseGradientRamp.x, uNoiseGradientRamp.y, vWorldPosition.y / uSize.y);
gl_FragColor.rgb = blendOverlay(gl_FragColor.rgb, noise, noiseStrength * uNoiseIntensity);
```

A second variant handles the hero surface, with a video texture, a blueprint "details" texture and a grid texture, plus the pointer reveal and the wipe:

```glsl
float dist = distance(vWorldPosition, uMouseHitPos);
float revealNoise = cnoise(vUv * 15.0) * 0.5 + 1.0;
float radius = uRadius + revealNoise * 0.05 + uRadiusExpand;
radius = mix(0.0, radius, uRadiusReveal);
float interaction = smoothstep(radius, radius - uRadiusSmoothness, dist);
color = mix(color, detailsColor * uVideoAiColor, interaction);

float mappedX = map(vUv.x, -0.3, 1.3, 0.0, 1.0);
float wipeFactor = clamp(smoothstep(1.0 - uWipeProgress + 0.1 + revealNoise * 0.04,
                                    1.0 - uWipeProgress - 0.1 - revealNoise * 0.04, mappedX) + 0.5, 0.0, 1.0);
```

Outlines are separate geometry: Three's fat-line material (`Line2`) with `linewidth` and colour exposed, so the drawn edges keep their weight regardless of distance. Every threshold, ramp and scale is a Theatre.js-tunable uniform, which is why the look could be dialled in rather than guessed.

## Distilled implementation

The same five ideas in one raw WebGL2 fragment shader, with the textures replaced by procedural equivalents: value noise for the grain, a proper voronoi for the spray mask, and a ruled-paper generator for the blueprint state. The reveal takes a pointer position projected onto the model's plane instead of a raycast hit, and the wipe uses the source's exact expression, noise term included.

Every parameter from the original is a slider — threshold, smoothness, spray ramp and scale, grain, reveal radius, wipe — and the spray mask can be displayed on its own, because the mask is the part that is hard to believe until you see it isolated.

One deliberate difference: the source writes `mix(shadowColor * 0.5, color, d)` because its `shadowColor` already carries the texture's luminance. With no texture, the shaded tone is passed in directly — the same curve with one less multiply.

## Key techniques

- two-step diffuse: `smoothstep(threshold, threshold + smoothness, N·L)` and a `mix` between exactly two tones
- a voronoi mask multiplied into the shadow so the terminator breaks into spray instead of fading
- pointer reveal by world-space distance, its radius perturbed by noise so the window has a hand-cut edge
- a wipe driven by one remapped UV axis, its two smoothstep edges pushed apart by the same noise
- overlay grain whose strength is ramped by world height, so the lower parts of the scene read warmer
- outlines as separate line geometry rather than a screen-space edge filter — a drawn line, not a detected one

## Parameters worth tuning

- `uDiffuseThreshold` / `uDiffuseSmoothness` — 0.36 / 0.04
- `uSprayRamp` — 0.50 / 0.47, `uSprayScale` — 30
- `uNoiseIntensity` and its vertical ramp
- `uRadius` 0.1–1.4, `uRadiusSmoothness` 0.01–0.06, `uRadiusReveal` 0 → 1
- `uWipeProgress` 0 → 1

## Verification

Measured live with `gl.readPixels` at 1440×900: the pointer reveal changes the sampled surface from `rgb(229,224,211)` to `rgb(202,212,225)` and back; the wipe at 0.95 lifts a shaded pixel from `rgb(37,80,224)` to `rgb(155,167,222)` and restores it exactly at 0; the spray-mask debug view renders the mask alone. No console errors.

## Fidelity

high for the shading maths, which is taken from the shipped shader; approximate for the source's textures, which are replaced by procedural noise, voronoi and ruled paper.

## Difficulty

Hard

## Tags

webgl, 3d, image-effect, background, cursor
