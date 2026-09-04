# Scroll-scrubbed camera sequence

Source:
https://illoca.unseen.co/

## What is interesting

This is the site's principal act, and it is not "an animation that plays on scroll". There is exactly **one** camera animation, baked in the 3D file with a handful of keyframes. The page reads those keyframes, cuts the animation into the segments between them, and hands segment *i* to section *i*. Scrolling through a section scrubs its segment and nothing else.

That inversion is what makes it good. The page never plays the animation — it addresses it. The cuts are not written in the page's code; they come from the animation's own keyframes, so adding a keyframe in the 3D file adds a segment for a section to take, with no scroll code to change. And because the camera flies continuously, the reader never experiences the sections as separate scenes: the drafting desk becomes an over-the-shoulder view of a blueprint, and then a top-down of the massing model, without a single cut.

## Behavior

Scroll and the camera travels a fixed path through the scene. Each section owns one leg of the journey. Scrolling back walks it in reverse exactly. Moving the pointer tilts and rolls the camera slightly around wherever the track has put it.

## Trigger

scroll (scrubbed, not played), plus pointer move for the parallax

## Implementation in the original

A GLTF scene carries camera animations named `main_camera*`. They are loaded into a `THREE.AnimationMixer` bound to a dummy object, and every clip is played but **paused** with weight 0 — the mixer is used as a pose evaluator, not a player. Each clip's normalised time (`action.time / clip.duration`) is registered as a Theatre.js number prop in range `[0, 1]`.

The wiring is then five lines:

```js
const kf = sequence.__experimental_getKeyframes(objects["Cameras / Camera 1 / Animation"].props.main_camera_action);
for (let i = 0; i < kf.length - 1; i++) {
  const tween = gsap.fromTo(sequence, { position: kf[i].position },
                                      { position: kf[i + 1].position, ease: "none", paused: true });
  on(`scrollProgress:${i}`, p => mq.lg.value && tween.progress(p));
}
```

`scrollProgress:i` is emitted by that section's own ScrollTrigger (`scrub: true`, `start: "top bottom"`, `end: "bottom bottom"`). A second identical loop is built from `main_camera_action_mobile` and gated on the opposite breakpoint, so desktop and mobile run different camera paths through the same machinery.

Per frame, `updateCameras()` copies the mixer's dummy position and quaternion onto the real camera, applies fixed `translateX/Y/Z` offsets, then `updateCameraPivotMovement()` adds the pointer parallax (`cameraPivotAngle.x/y`, `cameraPivotRollAmount`, two `pointerLerpSpeed` values) before `updateProjectionMatrix()`. Other scenes in the same codebase steer a camera along a `CatmullRomCurve3` with `getPointAt(_pathProgress)` instead of a baked clip.

## Distilled implementation

Raw WebGL2, no library, no model file, no network. A `TRACK` array stands in for the baked clip — five keyframes, each with a position, a look-at target and a playhead time — and the demo derives its segments from that array exactly as the original derives them from the animation's keyframes. Each section reports its own progress over the source's own trigger window (`top bottom` → `bottom bottom`), the playhead is the concatenation of the segments, and the camera pose is sampled from the track: Catmull-Rom through the keyframe positions by default, with a switch to plain linear so the difference a baked path makes is visible rather than asserted.

The pointer pivot is applied to the sampled pose, never to the track, which is why it cannot fight the scroll. A transport readout prints the current segment, the local `t` inside it, and the playhead position, and the keyframe times can be drawn onto the transport bar.

The scene itself is procedural — a desk, a sheet and a stepped massing model built from boxes — shaded with the site's own two-step diffuse and drawn with edge lines, so the demo looks like the thing it came from without shipping any of its assets.

## Key techniques

- one animation, cut into segments at its own keyframes; sections consume segments rather than owning animations
- an `AnimationMixer` used as a pose evaluator: every action `paused` with weight 0, addressed by normalised time
- the segment boundaries read from the data (`getKeyframes`), so the page structure follows the track and not the other way round
- ScrollTrigger `scrub` on `top bottom` → `bottom bottom`, per section, recomputed from geometry so reversing is exact
- pointer parallax applied *after* the track pose — a lerped tilt plus roll on the up vector
- two camera actions (desktop and mobile) through one mechanism, chosen by media query
- Catmull-Rom through the keys rather than a straight lerp; a baked path is smooth through its keyframes and a lerp visibly is not

## Parameters worth tuning

- `TRACK` — keyframe times and poses; the number of keyframes is the number of sections
- pivot — 0.09 rad on Y, 0.06 on X
- roll — 0.035 rad at the extremes
- follow — 0.06 lerp on the pointer
- fov — 38°
- Catmull-Rom vs linear interpolation between keys

## Verification

Measured live at 1440×900: the playhead runs 0.000 → 1.000 monotonically across the page, segments reported in order (1/4 at the top, 4/4 at the end), returning to 0.000 exactly on scrolling back to the top; `gl.readPixels` at the centre returns rendered geometry rather than the clear colour. Reference frames of the original at four scroll positions are in `.work/refs/sw-*.png`, and the demo's own at `.work/refs/demo-seq-*.png`.

## Fidelity

approximate — the mechanism, the trigger window, the segment-per-section mapping and the pointer pivot are reconstructed from the source; the scene, the camera track and the model are the demo's own, because the original's are a GLTF asset and a Theatre.js project state.

## Difficulty

Hard

## Tags

scroll, 3d, webgl, motion, layout
