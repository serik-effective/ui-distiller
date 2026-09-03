# Warped display type

Source:
https://www.sashamartynchuk.com/

## What is interesting

The headline is not a font doing a transform — it is a picture of a font on a mesh, bent by a vertex shader that *integrates* a curvature profile down the glyph height. Each horizontal slice turns a little more than the one above it, and the vertex's position is the running sum of the sines and cosines of that accumulated angle, so the type curves away like a sheet rather than tilting like a card. The bend also varies across the width — a cosine term keyed to horizontal distance from centre — which is what stops it reading as a rigid cylinder. Then the element's own CSS transform is multiplied back in, so a WebGL effect still sits inside ordinary layout.

## Behavior

The display line bends away from the reader, curving harder toward its baseline, breathing gently in and out. Straighten the bend and it resolves into ordinary type.

## Trigger

scroll position in the original; a live control and an idle breathe here

## Implementation

`title-warp.js` draws the headline into a 2D canvas character by character (with 2% letter-spacing), measures the ink box via `actualBoundingBoxAscent/Descent`, and uploads that canvas as an alpha texture. The mesh is 6 columns by 320 rows — narrow horizontally, dense vertically, because that is the axis the bend varies along. The vertex shader walks 24 steps down the distance from the ink top: `t = clamp(s/height)`, `th = A · pow(t, uEase)`, accumulating `cos(th)` into Y and `sin(th)` into Z, then applies a perspective divide `sc = uPersp / (uPersp − z)` about the centre, a `uRise` lift, and finally a 2D affine matrix assembled from the element's computed `translate`, `rotate`, `scale` and `transform`. The bend angle itself is `A = uAngle · uK · (1 + uVary · cos((x − cx)/half · 1.9 + 0.7))`. The fragment shader is a single line: read the texture's alpha and output it as both colour and alpha.

Measured properties: `--warp-angle` 78, `--warp-ease` 1.7, `--warp-persp` 420, `--warp-vary` 0.09, `--warp-rise` 1.2 and 3. It only runs when the GPU probe (pattern 04) says the renderer is not software.

## Distilled implementation

The same pipeline: canvas text → alpha texture → 6×320 mesh → integrating vertex shader → perspective divide. The element-transform matrix is dropped, since a standalone demo has no CSS transform to honour, and the scroll coupling is replaced by a slider plus an optional breathe so the shape can be studied at rest. A "show the mesh" switch renders the grid over the glyphs, which makes the integration visible: the lines bunch where the curve is turning fastest. Text is editable, so you can watch the ink metrics reflow.

Needs WebGL2. Without it the canvas is hidden and an explanation takes its place rather than a blank frame.

## Key techniques

- rendering text to a canvas and using it as an alpha texture, so any font warps
- integrating a curvature profile in the vertex shader instead of applying one rotation
- an easing exponent on the accumulation, so the bend arrives gradually and then bites
- horizontal variation of the bend angle via a cosine of distance from centre
- a mesh that is dense on the axis the deformation varies along and sparse on the other
- perspective as an explicit divide about the type's own centre
- ink metrics from `actualBoundingBox*`, so the bend is anchored to the glyphs, not the line box

## Parameters worth tuning

- `--warp-angle` — 78 on the original, 46 as the demo default
- `--warp-ease` — 1.7 (raise it to keep the top straighter for longer)
- `--warp-vary` — 0.09 of horizontal variation
- `--warp-persp` — 420
- mesh rows — 320 (drop it and the curve facets visibly)
- integration steps — 24

## Fidelity

approximate

The maths, mesh and pipeline are reproduced from the original's shader; the typeface, the scroll coupling and the CSS-matrix composition are not. The curve shape and its response to the easing exponent match; the exact glyph forms of the original's display face do not.

## Difficulty

Hard

## Tags

typography, webgl, canvas, motion
