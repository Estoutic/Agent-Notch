"""v7 animatic (gate 3): EEVEE preview plates for the twelve 3D shots, on the film's beat grid.

  node v7_dump.mts                              # cache/v7/plates.json: shot lengths and events in frames
  blender -b --factory-startup -P v7_plates.py -- --shots reveal,swarm [--scale 50] [--samples 16] [--frames 0,40]

Builds on the gate-1 stills (v7_stills.py: desk, lights, night window) and the procedural laptop (build_scene.py).
Every plate has HANDLE extra frames before the shot's frame 0, so a transition can show it already moving: file
<idx>.png is shot frame idx - HANDLE. Writes ../public/blender/v7/<shot>/%04d.png and appends s/frame to _times.json.
"""
import bpy
import json
import math
import os
import sys
import time
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_scene as B  # noqa: E402
import v7_stills as V  # noqa: E402

MM = B.MM
V7 = os.path.join(B.CACHE, "v7")
OUT = os.path.join(B.PROMO, "public", "blender", "v7")
PLAN = json.load(open(os.path.join(V7, "plates.json")))
HANDLE = PLAN["handle"]
STUDIO = ("Key", "RimL", "RimR", "Top", "Kicker")
SIDE = Vector((1, 0, 0))


def opts():
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    o = {"shots": "all", "scale": "50", "samples": "16", "frames": "", "out": OUT}
    for k, v in zip(a[::2], a[1::2]):
        o[k.lstrip("-")] = v
    return o


# ---------------------------------------------------------------- helpers

def ease(t, p=3.0):
    return B.ease_io(t, p)


def ss(a, b, t):
    return B.smoothstep(a, b, t)


def lerp(a, b, t):
    return a + (b - a) * t


def face_path(name):
    if name.startswith("theme-"):
        return os.path.join(B.CACHE, "themes", f"face-{name[6:]}.png")
    return os.path.join(V7, f"face-{name}.png")


class Screen:
    """The lid glass: swaps faces (half-size copies, enough for 960 px plates) and scales the emission."""

    def __init__(self, names):
        mat = bpy.data.materials["Glass"]
        nt = mat.node_tree
        p = nt.nodes["Principled BSDF"]
        self.tex = next(n for n in nt.nodes if n.type == 'TEX_IMAGE' and n.image.colorspace_settings.name != "Non-Color")
        self.mul = p.inputs["Emission Strength"].links[0].from_node
        self.base = self.mul.inputs[1].default_value
        self.faces = {}
        for nm in names:
            img = bpy.data.images.load(face_path(nm))
            img.scale(img.size[0] // 2, img.size[1] // 2)
            self.faces[nm] = img
        self.cur = None

    def show(self, name, strength=1.0):
        if name != self.cur:
            self.tex.image = self.faces[name]
            self.cur = name
        self.mul.inputs[1].default_value = self.base * strength


def scene(face, screen=1.25, key=0.55, fill=0.6, studio=True, samples=16, wall=True):
    o = V.base_opts(face, screen=screen, key=key, fill=fill)
    o["face"] = face_path(face)
    sc, cam, hinge = B.build(o)
    V.eevee(sc, samples)
    V.desk(sc, wall=wall)
    V.world(sc, None, None, hdri_strength=0.06)
    if not studio:
        for nm in STUDIO:
            bpy.data.objects[nm].hide_render = True
    return sc, cam, hinge


def glare(threshold=None, strength=None):
    g = bpy.data.node_groups["Comp"].nodes["Glare"]
    if threshold is not None:
        g.inputs["Threshold"].default_value = threshold
    if strength is not None:
        g.inputs["Strength"].default_value = strength
    return g


def cam_set(cam, loc, tgt, lens, fstop, focus, roll=0.0, shk=None):
    V.camera(cam, loc, tgt, lens, fstop, focus)
    if roll:
        cam.rotation_euler.rotate_axis('Z', math.radians(roll))
    if shk:   # (dx, dy, pitch, yaw): camera-local metres and degrees, from shake()
        dx, dy, rx, ry = shk
        cam.location += cam.rotation_euler.to_matrix() @ Vector((dx, dy, 0.0))
        cam.rotation_euler.rotate_axis('X', math.radians(rx))
        cam.rotation_euler.rotate_axis('Y', math.radians(ry))


def ramp_e(lf, at, pre=12, post=24, slow=0.35):
    """Offset t - lf of one speed ramp. Zero outside [at - pre, at + post] and exactly zero at `at`.
    Speed 1 + e' dips to `slow` at the event, runs ahead of 1x before it and catches up after it."""
    x = lf - at
    u = x / (pre if x < 0 else post)
    if abs(u) >= 1.0:
        return 0.0
    return -(1.0 - slow) * x * (1.0 - u * u) ** 2


def ramp(lf, at, pre=12, post=24, slow=0.35):
    """Shot time for output frame lf around a slow-motion event: t(at) == at, t == lf outside the window."""
    return lf + ramp_e(lf, at, pre, post, slow)


def remap(lf, ramps):
    """Several ramps (windows must not overlap, so every event keeps t(ev) == ev)."""
    return lf + sum(ramp_e(lf, *r) for r in ramps)


# (event key, pre, post, slow) per shot; the event frame comes from PLAN so the ramp follows the timeline
RAMP_SPEC = {"reveal": [("land", 14, 18, 0.5)],
             "approve": [("click", 10, 22, 0.35), ("allow", 8, 14, 0.4)],
             "open": [("click", 10, 22, 0.35)],
             "keys": [("y", 10, 16, 0.35), ("n", 10, 18, 0.35)],
             "question": [("pick", 10, 20, 0.35)],
             "plan": [("approve", 10, 22, 0.35)],
             "risky": [("deny", 10, 24, 0.3)]}


def RAMPS(shot):
    ev = PLAN["shots"][shot]["ev"]
    return [(ev[k], pre, post, slow) for k, pre, post, slow in RAMP_SPEC.get(shot, [])]


def shake(lf, hits, amp=1.0, rot=1.0, dur=10):
    """Camera shake on hits: decays in a few frames. amp in mm, rot scales ~0.3 deg. Returns (dx, dy, pitch, yaw)."""
    dx = dy = rx = ry = 0.0
    for h in hits:
        x = lf - h
        if 0 <= x < dur:
            d = math.exp(-x / 2.4) * (1 - ss(dur - 3, dur, x))
            dx += d * math.sin(x * 2.5 + h * 1.7) * amp * MM
            dy += d * math.cos(x * 3.1 + h * 2.3) * amp * MM
            rx += d * math.sin(x * 2.2 + h) * 0.3 * rot
            ry += d * math.cos(x * 2.7 + h * 0.6) * 0.3 * rot
    return dx, dy, rx, ry


def bump(lf, at, pre=3, post=12):
    """0..1 bump peaking at `at` (a kick / push-in on a hit)."""
    return ss(at - pre, at, lf) * (1 - ss(at, at + post, lf))


def panel_cam(hinge, sx, sy, width_px, lens=50):
    """Straight-on distance that shows `width_px` stage pixels across the frame at `lens`."""
    return (width_px * B.STAGE_MM * MM) / 2 / (18 / lens)


def press(lf, at, down=2, hold=6, up=3):
    """Key travel 0..1 around a press at frame `at`."""
    if lf < at - down or lf > at + hold + up:
        return 0.0
    if lf < at:
        return ss(at - down, at, lf)
    if lf <= at + hold:
        return 1.0
    return 1 - ss(at + hold, at + hold + up, lf)


def tint_card(hinge, sx, sy, w_mm, h_mm, color=(1.0, 0.05, 0.03), name="Tint"):
    """A glow (red by default) sitting a hair in front of the glass over one row: the row lights up."""
    from mathutils import Matrix
    nrm = B.screen_normal(hinge)
    bpy.ops.mesh.primitive_plane_add(size=1)
    ob = bpy.context.active_object
    ob.name = name
    rot = Vector((0, 0, 1)).rotation_difference(nrm)
    ob.matrix_world = Matrix.LocRotScale(B.stage_point(hinge, sx, sy) + nrm * 0.0012, rot, Vector((w_mm * MM, h_mm * MM, 1)))
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for nd in list(nt.nodes):
        nt.nodes.remove(nd)
    em = nt.nodes.new("ShaderNodeEmission")
    em.name = "Emission"
    em.inputs["Color"].default_value = (*color, 1)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    add = nt.nodes.new("ShaderNodeAddShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    # soft edges: fade with the distance from the centre in uv
    tc = nt.nodes.new("ShaderNodeTexCoord")
    grad = nt.nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = 'SPHERICAL'
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Location"].default_value = (-0.5, -0.5, 0)
    mp.inputs["Scale"].default_value = (1.8, 1.8, 1)
    nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], grad.inputs["Vector"])
    mul = nt.nodes.new("ShaderNodeMixRGB")
    mul.blend_type = 'MULTIPLY'
    mul.inputs[0].default_value = 1.0
    nt.links.new(grad.outputs["Fac"], mul.inputs[1])
    mul.inputs[2].default_value = (*color, 1)
    nt.links.new(mul.outputs[0], em.inputs["Color"])
    nt.links.new(em.outputs[0], add.inputs[0])
    nt.links.new(tr.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs["Surface"])
    try:
        m.surface_render_method = 'BLENDED'
    except Exception:
        pass
    ob.data.materials.append(m)
    return ob


def area_light(name, loc, target, energy, color, size, size_y):
    return V.light(name, 'AREA', tuple(loc), tuple(target), energy, color, size=size, size_y=size_y)


# ---------------------------------------------------------------- shots
# Each returns (scene, per-frame function lf -> None). lf runs from -HANDLE to len - 1.

def shot_cascade(S):
    """4 -> 8 -> 12 terminal windows standing over a dark desk; the camera pulls back through the wall of them."""
    sc, cam, hinge = scene("bar-one", studio=False, samples=S)
    keep = {"Floor", "Wall"}
    for ob in bpy.data.objects:
        if ob.type == 'MESH' and ob.name not in keep:
            ob.hide_render = True
    ev = PLAN["shots"]["cascade"]["ev"]
    n = PLAN["shots"]["cascade"]["len"]
    # (x, depth y, z, appears at): layer A in the back, B and C nearer, so the pull-back passes them
    h0 = -HANDLE - 4
    slots = [(-0.13, 0.42, 0.105, h0), (0.13, 0.42, 0.105, h0), (-0.13, 0.42, 0.275, h0), (0.13, 0.42, 0.275, h0),
             (-0.40, 0.24, 0.09, ev["cut2"]), (0.40, 0.24, 0.09, ev["cut2"]), (-0.40, 0.24, 0.26, ev["cut2"]), (0.40, 0.24, 0.26, ev["cut2"]),
             (-0.66, 0.02, 0.12, ev["cut3"]), (0.66, 0.02, 0.12, ev["cut3"]), (0.0, 0.18, 0.44, ev["cut3"]), (-0.28, 0.0, 0.44, ev["cut3"])]
    wins = []
    for i, (x, y, z, at) in enumerate(slots):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x, y, z), rotation=(math.radians(90), 0, math.radians(-x * 22)))
        ob = bpy.context.active_object
        ob.name = f"Term{i}"
        ob.scale = (0.24, 0.156, 1)
        m = bpy.data.materials.new(f"Term{i}")
        m.use_nodes = True
        nt = m.node_tree
        for nd in list(nt.nodes):
            nt.nodes.remove(nd)
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(os.path.join(V7, f"term-{i}.png"))
        em = nt.nodes.new("ShaderNodeEmission")
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(tex.outputs["Color"], em.inputs["Color"])
        nt.links.new(em.outputs[0], out.inputs["Surface"])
        ob.data.materials.append(m)
        wins.append((ob, em, at))
    glare(0.8, 0.5)

    def frame(lf):
        for ob, em, at in wins:
            k = 0.0 if lf < at else ss(at, at + 4, lf)
            ob.hide_render = k <= 0.001
            em.inputs["Strength"].default_value = 1.4 * k
            ob.scale = (0.24 * (0.94 + 0.06 * k), 0.156 * (0.94 + 0.06 * k), 1)
        t = (lf + HANDLE) / (n + HANDLE)
        e = ease(t, 1.8) * 0.8 + t * 0.2
        kick = bump(lf, ev["cut2"], 2, 10) + bump(lf, ev["cut3"], 2, 10)   # each new row of windows shoves the camera back
        loc = Vector((0.045 * math.sin(2.2 * t) - 0.02, lerp(0.02, -0.55, e) - 0.03 * kick, lerp(0.19, 0.25, e)))
        tgt = Vector((0.0, 0.40, lerp(0.19, 0.20, e)))
        cam_set(cam, loc, tgt, lerp(32, 38, e), 5.6, Vector((0, 0.40, 0.19)), roll=lerp(-2.0, 1.5, e),
                shk=shake(lf, [ev["cut2"], ev["cut3"]], 1.2, 1.0))
    return sc, frame


def shot_reveal(S):
    """The amber period is the mark in the notch: macro on the notch, then the pull-back to the laptop on the drop."""
    sc, cam, hinge = scene("bar-ask", screen=1.5, samples=S)
    scr = Screen(["bar-ask", "ask"])
    n = PLAN["shots"]["reveal"]["len"]
    ev = PLAN["shots"]["reveal"]["ev"]
    rp = RAMPS("reveal")

    def frame(lf):
        scr.show("bar-ask" if lf < 16 else "ask", 1.5)  # the panel drops open on the pull-back
        tt = remap(lf, rp)   # pull-back runs ahead, then settles into the hero pose on the drop
        loc, tgt, lens, fstop, focus = B.shot_reveal(max(0, tt), n, hinge)
        cam_set(cam, loc, tgt, lens, fstop, focus, shk=shake(lf, [ev["pull"], ev["land"]], 1.0, 1.0))
    return sc, frame


def hero(hinge):
    """Where reveal lands (its last frame)."""
    n = PLAN["shots"]["reveal"]["len"]
    return B.shot_reveal(n - 1, n, hinge)


def shot_approve(S):
    """From the hero pose the camera dives into the notch as it opens; Allow; the agent goes back to work."""
    sc, cam, hinge = scene("bar-ask", samples=S)
    scr = Screen(["bar-ask", "ask", "sub"])
    ev = PLAN["shots"]["approve"]["ev"]
    n = PLAN["shots"]["approve"]["len"]
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    h_loc, h_tgt, _, _, h_focus = hero(hinge)
    end_tgt = B.stage_point(hinge, 760, 330)
    end_loc = end_tgt + nrm * panel_cam(hinge, 760, 330, 1250) + SIDE * 0.05 + Vector((0, 0, -0.03))

    rp = RAMPS("approve")

    def frame(lf):
        face = "bar-ask" if lf < ev["open"] else "ask" if lf < ev["allow"] + 2 else "sub"
        scr.show(face)
        tt = remap(lf, rp)
        d = ease(ss(ev["click"] - 5, ev["click"] + 16, tt), 2.6)
        drift = ss(ev["click"] + 16, n, tt)
        loc = h_loc.lerp(end_loc, d) + nrm * (-0.02 * drift - 0.012 * bump(tt, ev["allow"], 4, 12))
        loc += Vector((math.sin(math.pi * d) * 0.07, 0, math.sin(math.pi * d) * 0.03)) + SIDE * (-0.02 * drift)
        tgt = h_tgt.lerp(end_tgt, min(1.0, d * 1.05))
        cam_set(cam, loc, tgt, 50, lerp(11.0, 4.0, d), h_focus.lerp(end_tgt, d),
                shk=shake(lf, [ev["click"], ev["allow"]], 0.9, 1.0))
    return sc, frame


def shot_swarm(S):
    """Low over the panel like over a city at night, along the 11 projects; then up to the whole panel."""
    sc, cam, hinge = scene("swarm", screen=2.2, key=0.35, fill=0.4, studio=False, samples=S)
    V.world(sc, None, None, hdri_strength=0.04)
    scr = Screen(["swarm"])
    ev = PLAN["shots"]["swarm"]["ev"]
    n = PLAN["shots"]["swarm"]["len"]
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    up = (hinge.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
    glare(0.55, 0.9)

    def frame(lf):
        scr.show("swarm")
        t = (lf + HANDLE) / (ev["rise"] + HANDLE)
        bx, by = lerp(1180, 780, t) + 40 * math.sin(t * 5.0), lerp(1460, 960, t)   # faster track along the projects, with a weave
        low = B.stage_point(hinge, bx, by) + nrm * 0.026 - up * 0.020
        low_t = B.stage_point(hinge, bx - 420, by - 640)
        r = ease(ss(ev["rise"] - 8, n, lf), 2.4)
        high = B.stage_point(hinge, 760, 820) + nrm * 0.20 + SIDE * 0.03 - up * 0.05
        high_t = B.stage_point(hinge, 760, 760)
        cam_set(cam, low.lerp(high, r), low_t.lerp(high_t, r), lerp(24, 35, r), lerp(11.0, 8.0, r),
                B.stage_point(hinge, bx - 260, by - 380).lerp(high_t, r), roll=lerp(lerp(9, 3, t), 0, r),
                shk=shake(lf, [ev["flip"]], 0.8, 1.0))
    return sc, frame


def shot_open(S):
    """Click the notch: the projects panel unfolds; the camera eases from the notch down the list."""
    sc, cam, hinge = scene("bar-projects", samples=S)
    scr = Screen(["bar-projects", "projects"])
    ev = PLAN["shots"]["open"]["ev"]
    n = PLAN["shots"]["open"]["len"]
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    a_t = B.stage_point(hinge, 1020, 150)
    a_l = a_t + nrm * panel_cam(hinge, 0, 0, 900) - SIDE * 0.04 + Vector((0, 0, 0.02))
    b_t = B.stage_point(hinge, 1060, 520)
    b_l = b_t + nrm * panel_cam(hinge, 0, 0, 1500) - SIDE * 0.07 + Vector((0, 0, 0.03))

    rp = RAMPS("open")

    def frame(lf):
        scr.show("bar-projects" if lf < ev["click"] + 1 else "projects")
        tt = remap(lf, rp)
        e = ease(ss(ev["pan"] - 4, ev["pan"] + 20, tt), 2.6)
        creep = (lf + HANDLE) / (n + HANDLE)
        push = 1 - ease(ss(-HANDLE, ev["click"], tt), 2.0)   # pushes in on the notch, the click lands at the end of it
        loc = a_l.lerp(b_l, e) + nrm * (-0.01 * creep + 0.035 * push)
        cam_set(cam, loc, a_t.lerp(b_t, e), 50, 5.6, B.stage_point(hinge, 760, lerp(150, 480, e)),
                shk=shake(lf, [ev["click"]], 0.8, 1.0))
    return sc, frame


KEY_IDX = {"ctrl": 68, "opt": 69, "y": 34, "n": 61}


def split_keys():
    """Rebuilds the key mesh without ⌃ ⌥ Y N and gives those four keys their own objects, so they can travel."""
    rects = B.key_rects()
    keycap = bpy.data.materials["Keycap"]
    old = bpy.data.objects["Keys"]
    bpy.data.objects.remove(old, do_unlink=True)
    skip = set(KEY_IDX.values())
    B.boxes("Keys", [r for i, r in enumerate(rects) if i not in skip], B.DECK + 0.05, B.DECK + 0.75, 0.9, keycap, seg=3)
    keys = {}
    font = bpy.data.fonts.load(os.path.join(B.PROMO, "node_modules", "geist", "dist", "fonts", "geist-sans", "Geist-Medium.ttf"))
    sym = bpy.data.fonts.load("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")  # Geist has no ⌥
    ink = bpy.data.materials.new("KeyInk")
    ink.use_nodes = True
    pb = ink.node_tree.nodes["Principled BSDF"]
    pb.inputs["Base Color"].default_value = (0.75, 0.75, 0.77, 1)
    pb.inputs["Emission Color"].default_value = (1, 1, 1, 1)
    pb.inputs["Emission Strength"].default_value = 0.08
    for nm, i in KEY_IDX.items():
        ob = B.boxes(f"Key_{nm}", [rects[i]], B.DECK + 0.05, B.DECK + 0.75, 0.9, keycap, seg=3)
        keys[nm] = ob
        own = ink.copy()  # each key's legend lights up while it is down
        own.name = f"KeyInk_{nm}"
        ob["ink"] = own.name
        cx, cy, w, h = rects[i]
        for txt, size, dx, dy in LEGENDS[nm]:
            cu = bpy.data.curves.new(f"Leg_{nm}_{txt}", 'FONT')
            cu.body = txt
            cu.font = font if txt.isascii() else sym
            cu.size = size * MM
            cu.align_x = 'CENTER'
            cu.align_y = 'CENTER'
            to = bpy.data.objects.new(cu.name, cu)
            bpy.context.scene.collection.objects.link(to)
            to.location = ((cx + dx * w) * MM, (cy + dy * h) * MM, (B.DECK + 0.76) * MM)
            to.parent = ob
            cu.materials.append(ob.get("ink") and bpy.data.materials[ob["ink"]] or ink)
    return keys, rects


# (text, size mm, dx, dy as a fraction of the key): words like the real modifier keys, letters centred
LEGENDS = {"ctrl": [("control", 2.4, 0.0, -0.28), ("^", 3.6, 0.28, 0.22)], "opt": [("option", 2.4, 0.0, -0.28), ("⌥", 3.4, 0.28, 0.22)],
           "y": [("Y", 5.5, 0.0, 0.0)], "n": [("N", 5.5, 0.0, 0.0)]}


def shot_keys(S):
    """Macro of the keyboard: ⌃⌥Y goes down on the kick, then ⌃⌥N; the request screen glows out of focus behind."""
    sc, cam, hinge = scene("ask", screen=1.1, key=0.5, fill=0.5, samples=S)
    scr = Screen(["ask", "sub"])
    keys, rects = split_keys()
    ev = PLAN["shots"]["keys"]["ev"]
    n = PLAN["shots"]["keys"]["len"]
    B.set_lid(hinge, 110)
    fpb = PLAN["shots"]["keys"]["fpb"]
    pos = {nm: Vector((rects[i][0] * MM, rects[i][1] * MM, (B.DECK + 0.75) * MM)) for nm, i in KEY_IDX.items()}
    c = (pos["ctrl"] + pos["opt"] + pos["y"] + pos["n"]) / 4
    rp = RAMPS("keys")

    def frame(lf):
        scr.show("ask" if lf < ev["y"] + 6 else "sub")
        tt = remap(lf, rp)   # keys travel in shot time: slow through each press, same frame for the hit
        travel = {"ctrl": max(press(tt, ev["y"] - 0.2 * fpb), press(tt, ev["n"] - 0.2 * fpb)),
                  "opt": max(press(tt, ev["y"] - 0.1 * fpb), press(tt, ev["n"] - 0.1 * fpb)),
                  "y": press(tt, ev["y"]), "n": press(tt, ev["n"])}
        for nm, ob in keys.items():
            ob.location.z = -0.6 * MM * travel[nm]  # keys stand 0.75 mm proud of the deck
            bpy.data.materials[ob["ink"]].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 0.08 + 4.0 * travel[nm]
        t = ease((tt + HANDLE) / (n + HANDLE), 1.8)
        mods = (pos["ctrl"] + pos["opt"]) / 2
        aim = mods.lerp((pos["y"] + pos["n"]) / 2, 0.56)
        aim += (pos["n"] - pos["y"]) * 0.12 * ease(ss(ev["y"] + 8, ev["n"] - 6, tt), 2.0)   # tracks from Y over to N
        hit = bump(tt, ev["y"], 3, 12) + bump(tt, ev["n"], 3, 12)
        loc = aim + Vector((lerp(-0.030, -0.020, t), lerp(-0.130, -0.108, t), lerp(0.150, 0.128, t))) * (1 - 0.06 * hit)
        cam_set(cam, loc, aim, 45, 11.0, aim, roll=0, shk=shake(lf, [ev["y"], ev["n"]], 0.7, 1.0))
    return sc, frame


def shot_question(S):
    """The pressed key becomes the option: macro on 'On the client', pull back to the panel; one click answers."""
    sc, cam, hinge = scene("question", samples=S)
    scr = Screen(["question", "sub"])
    ev = PLAN["shots"]["question"]["ev"]
    n = PLAN["shots"]["question"]["len"]
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    opt = B.stage_point(hinge, 640, 330)
    req = B.stage_point(hinge, 760, 360)
    notch = B.stage_point(hinge, 976, 20)
    a_l = opt + nrm * 0.07 + SIDE * 0.02 + Vector((0, 0, -0.02))
    b_l = req + nrm * 0.27 + SIDE * 0.11 + Vector((0, 0, -0.10))

    pick = tint_card(hinge, 783, 339, 66, 6.6, color=(1.0, 0.62, 0.08), name="Pick")
    rp = RAMPS("question")

    def frame(lf):
        scr.show("question" if lf < ev["pick"] + 10 else "sub")
        on = ss(ev["pick"] - 2, ev["pick"], lf) * (1 - ss(ev["pick"] + 8, ev["pick"] + 10, lf))
        pick.data.materials[0].node_tree.nodes["Emission"].inputs["Strength"].default_value = 0.5 * on
        tt = remap(lf, rp)
        e = ease(ss(-HANDLE, 30, tt), 2.6)
        creep = ss(30, n, tt)
        loc = a_l.lerp(b_l, e) + (req - b_l) * 0.12 * creep
        tgt = opt.lerp(req.lerp(notch, 0.10), e)
        # once answered the panel shrinks to the bar: follow it up to the notch so the shot never ends on a tiny card
        c2 = ease(ss(ev["pick"] + 8, ev["pick"] + 34, tt), 2.0)
        loc = loc.lerp(B.stage_point(hinge, 900, 120) + nrm * 0.15 + SIDE * 0.05 + Vector((0, 0, -0.035)), c2)
        tgt = tgt.lerp(B.stage_point(hinge, 900, 110), c2)
        cam_set(cam, loc, tgt, 50, lerp(4.0, 5.6, e), opt.lerp(B.stage_point(hinge, 700, 360), e),
                shk=shake(lf, [ev["pick"]], 0.9, 1.0))
    return sc, frame


def shot_plan(S):
    """A plan arrives in the notch; read it along the rows; Approve."""
    sc, cam, hinge = scene("plan", samples=S)
    scr = Screen(["plan", "sub"])
    ev = PLAN["shots"]["plan"]["ev"]
    n = PLAN["shots"]["plan"]["len"]
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    req = B.stage_point(hinge, 720, 330)
    notch = B.stage_point(hinge, 976, 20)
    rp = RAMPS("plan")

    def frame(lf):
        scr.show("plan" if lf < ev["approve"] + 3 else "sub")
        tt = remap(lf, rp)
        t = ease((tt + HANDLE) / (n + HANDLE), 1.8)
        go = ease(ss(ev["approve"] - 26, ev["approve"], tt), 2.0)   # leans in on Approve
        loc = req + nrm * (lerp(0.215, 0.17, t) - 0.012 * go) - SIDE * lerp(0.11, 0.0, t) + Vector((0, 0, -0.06))
        tgt = req.lerp(notch, 0.18) + SIDE * lerp(-0.02, 0.005, t)
        cam_set(cam, loc, tgt, 50, 5.6, B.stage_point(hinge, lerp(520, 740, t), 330),
                shk=shake(lf, [ev["approve"]], 0.9, 1.0))
    return sc, frame


def shot_risky(S):
    """The red row lights the desk and the aluminium; nothing else is lit; Deny; the pull-back."""
    sc, cam, hinge = scene("ask", screen=0.9, key=0.25, fill=0.25, samples=S)
    scr = Screen(["ask", "sub"])
    ev = PLAN["shots"]["risky"]["ev"]
    n = PLAN["shots"]["risky"]["len"]
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    row = B.stage_point(hinge, 700, 500)
    req = B.stage_point(hinge, 760, 300)
    notch = B.stage_point(hinge, 976, 20)
    red = area_light("RedSpill", row + nrm * 0.004, row + nrm, 0.0, (1.0, 0.07, 0.04), 0.07, 0.014)
    red_low = area_light("RedDesk", B.stage_point(hinge, 760, 1500) + nrm * 0.01, B.stage_point(hinge, 760, 1500) + nrm - Vector((0, 0, 0.6)),
                         0.0, (1.0, 0.08, 0.05), 0.25, 0.03)
    glare(0.7, 0.8)
    base_l = req + nrm * 0.27 + SIDE * 0.11 + Vector((0, 0, -0.10))
    base_t = req.lerp(notch, 0.10)
    focus = B.stage_point(hinge, 700, 490)
    wide_l = Vector((0.17, -0.36, 0.10))
    wide_t = B.stage_point(hinge, 760, 760)
    tint = tint_card(hinge, 633, 493, 32, 4.5)
    dpt = B.stage_point(hinge, 601, 533)
    deny = tint_card(hinge, 601, 533, 10, 4.0, color=(1.0, 0.85, 0.8), name="DenyHot")
    loc_d = dpt + nrm * 0.16 + SIDE * 0.05 + Vector((0, 0, -0.05))
    rp = RAMPS("risky")

    def frame(lf):
        on = ss(-HANDLE, 6, lf) * (1 - ss(ev["deny"] + 2, ev["deny"] + 14, lf))
        hot = ss(ev["deny"] - 3, ev["deny"], lf) * (1 - ss(ev["deny"], ev["deny"] + 2, lf))
        row_on = on * (1 - ss(ev["deny"], ev["deny"] + 2, lf))  # the row glow goes with the panel
        deny.data.materials[0].node_tree.nodes["Emission"].inputs["Strength"].default_value = 0.6 * hot
        pulse = 0.85 + 0.15 * math.sin(lf / 30 * 2 * math.pi * 1.0)
        red.data.energy = 40.0 * on * pulse * (1 - ss(ev["deny"], ev["deny"] + 2, lf))
        red_low.data.energy = 55.0 * on * pulse
        scr.show("ask" if lf < ev["deny"] + 2 else "sub", 1.0 - 0.25 * on)
        tint.data.materials[0].node_tree.nodes["Emission"].inputs["Strength"].default_value = 0.22 * row_on * pulse
        tt = remap(lf, rp)
        push = ease(ss(-HANDLE, ev["tryKey"] + 8, tt), 1.8)
        m = ease(ss(ev["move"] - 6, ev["move"] + 18, tt), 2.6)
        wide = ease(ss(ev["deny"] + 4, ev["deny"] + 28, tt), 2.6)
        loc = (focus + (base_l - focus) * lerp(1.0, 0.85, push)).lerp(loc_d, m).lerp(wide_l, wide)
        tgt = base_t.lerp(dpt, m).lerp(wide_t, wide)
        loc += (focus - loc) * (0.05 * bump(lf, ev["tryKey"], 2, 10))
        cam_set(cam, loc, tgt, lerp(50, 40, wide), lerp(5.6, 8.0, wide), focus.lerp(dpt, m).lerp(wide_t, wide),
                shk=shake(lf, [ev["tryKey"], ev["deny"]], 0.9, 1.0))
    return sc, frame


def shot_night(S):
    """Keep awake: the real lid closes, its light narrows to a line and goes out; a blue night, the window shadow
    sweeps; morning sun; the lid opens on done. Dramatisation."""
    sc, cam, hinge = B.build(V.base_opts("awake", screen=0.6, key=0.0, fill=0.0))
    V.eevee(sc, S)
    V.desk(sc, color=(0.05, 0.04, 0.034), rough=0.38, wall_color=(0.05, 0.055, 0.07))
    for nm in STUDIO:
        bpy.data.objects[nm].hide_render = True
    V.world(sc, (0.010, 0.018, 0.045), 1.0)
    wn = sc.world.node_tree.nodes["Background"]
    scr = Screen(["awake", "awake-sub"])
    ev = PLAN["shots"]["night"]["ev"]
    n = PLAN["shots"]["night"]["len"]
    gap_y = -B.D / 2 * MM + 0.003
    gap_z = (B.DECK + 5.0) * MM
    leak = V.light("Leak", 'AREA', (0, gap_y, gap_z), (0, gap_y - 0.05, 0.0), 0.0, (0.85, 0.90, 1.0), size=0.28, size_y=0.001, spread=12)
    line = V._light_line(gap_y)
    line_k = next(nd for nd in line.data.materials[0].node_tree.nodes if nd.type == 'MATH' and nd.operation == 'MULTIPLY'
                  and not nd.inputs[1].is_linked and abs(nd.inputs[1].default_value - 3.0) < 1e-6)
    sun = V.light("Moon", 'SUN', (-1.2, 0.9, 1.2), (0.1, -0.1, 0.0), 0.0, (0.55, 0.68, 1.0), size=1.2)
    gobo = V._gobo(Vector((0, 0, 0)), sun)
    V.light("Edge", 'AREA', (0.9, 0.6, 0.35), (0, 0.1, 0.05), 1.5, (0.45, 0.58, 1.0), size=0.6, size_y=0.6)
    # the evening before: one warm lamp, gone when the lid shuts
    lamp = V.light("Lamp", 'AREA', (0.7, -0.2, 0.6), (0, 0, 0.05), 25.0, (1.0, 0.78, 0.55), size=0.5, size_y=0.5)
    sc.view_settings.exposure = 0.4
    hz0, hz1 = B.HINGE_Z * MM, (B.DECK + 0.9) * MM
    ghosts = ghost_terms(ev)

    def lid_at(lf):
        if lf < ev["open"]:
            return lerp(108, 0, ease(ss(-4, ev["shut"], lf), 2.4))   # shut all the way
        return lerp(0, 34, ease(ss(ev["open"], n + 6, lf), 2.0))

    def frame(lf):
        a = lid_at(lf)
        hinge.location.z = lerp(hz1, hz0, ss(6, 40, a))
        B.set_lid(hinge, a)
        morning = ss(ev["dawn"] - 8, ev["dawn"] + 10, lf)
        night = ss(ev["shut"] - 6, ev["out"], lf)
        scr.show("awake" if lf < ev["open"] else "awake-sub", 1.0 if lf < ev["open"] else lerp(0.3, 1.0, ss(ev["open"], n, lf)))
        # the light of the screen under the lid: a line that narrows and goes out, back when the lid opens
        gapk = 1 - ss(3, 12, a)
        out = 1 - ss(ev["shut"] + 2, ev["out"] + 6, lf)
        opening = ss(ev["open"], ev["open"] + 10, lf)
        k = gapk * (max(out, 0.12) if lf < ev["open"] else 0.0) + opening * (1 - ss(14, 34, a)) * 0.8
        leak.data.energy = 0.04 * k
        line_k.inputs[1].default_value = 3.0 * k
        line.scale = (1.0, max(0.05, lerp(0.35, 1.0, out)), 1.0)
        line.hide_render = k < 0.01
        lamp.data.energy = 25.0 * (1 - night)
        # moonlight sweeps through the window across the desk; then the sun comes in warm, from lower
        t = ss(ev["out"], ev["dawn"], lf)
        az = lerp(-35, 10, t) if lf < ev["dawn"] else lerp(10, 25, ss(ev["dawn"], n, lf))
        el = lerp(42, 30, t) if lf < ev["dawn"] else lerp(30, 18, morning)
        src = Vector((-1.6 * math.cos(math.radians(az)), 1.6 * math.sin(math.radians(az)) + 0.9, 0))
        src.z = 1.7 * math.tan(math.radians(el))
        sun.location = src
        d = (Vector((0.0, -0.05, 0.0)) - src)
        sun.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        gobo.location = Vector((-0.08, 0.05, 0.0)) - d.normalized() * 0.9
        gobo.rotation_euler = sun.rotation_euler
        sun.data.energy = lerp(0.0, 14.0, night) * (1 - morning) + 24.0 * morning
        sun.data.color = Vector((0.55, 0.68, 1.0)).lerp(Vector((1.0, 0.74, 0.48)), morning)
        wn.inputs["Color"].default_value = (*Vector((0.010, 0.018, 0.045)).lerp(Vector((0.05, 0.040, 0.034)), morning), 1)
        ghosts(lf)
        # with the lid shut the camera rises and pulls back to hold the ghosts above the Mac; it settles at dawn
        up = ss(ev["out"] - 6, ev["out"] + 14, lf) * (1 - ss(ev["dawn"] - 4, ev["open"] + 6, lf))
        tt = (lf + HANDLE) / (n + HANDLE)
        loc = Vector((lerp(0.06, 0.0, tt), lerp(-0.80, -0.70, tt) - 0.30 * up, lerp(0.24, 0.21, tt) + 0.10 * up))
        tgt = Vector((0.0, -0.04 + 0.06 * up, lerp(0.10, 0.03, ss(-4, ev["shut"], lf)) + 0.12 * up))
        cam_set(cam, loc, tgt, 45, lerp(5.6, 8.0, up), Vector((0, -0.12 + 0.12 * up, 0.02 + 0.13 * up)))
    return sc, frame


def ghost_terms(ev):
    """Night: with the lid shut, translucent terminals float up out of the closed Mac and their logs keep running.
    Dramatisation of Keep awake."""
    # (x, y, top z, tilt deg, rise delay, scroll speed)
    spots = [(-0.25, 0.05, 0.25, 9, 0, 1.0), (0.24, 0.07, 0.27, -8, 3, 1.3), (0.0, 0.14, 0.33, 0, 6, 0.8),
             (-0.13, -0.02, 0.15, 5, 9, 1.6), (0.14, -0.01, 0.17, -5, 12, 1.1)]
    W, H, BAR = 0.20, 0.14, 0.009
    out = []
    for i, (x, y, z, tilt, dl, sp) in enumerate(spots):
        parts = []
        for kind, h, img in (("log", H, f"ghostlog-{i}.png"), ("bar", BAR, f"ghostbar-{i}.png")):
            bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0), rotation=(math.radians(90), 0, 0))
            ob = bpy.context.active_object
            ob.name = f"Ghost{i}-{kind}"
            ob.scale = (W, h, 1)
            m = bpy.data.materials.new(ob.name)
            m.use_nodes = True
            m.surface_render_method = 'BLENDED'
            nt = m.node_tree
            for nd in list(nt.nodes):
                nt.nodes.remove(nd)
            tc = nt.nodes.new("ShaderNodeTexCoord")
            mp = nt.nodes.new("ShaderNodeMapping")
            tex = nt.nodes.new("ShaderNodeTexImage")
            tex.image = bpy.data.images.load(os.path.join(V7, img))
            tex.extension = 'REPEAT'
            nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
            nt.links.new(mp.outputs["Vector"], tex.inputs["Vector"])
            if kind == "log":   # show 19 of the 40 log rows; offset scrolls them
                mp.inputs["Scale"].default_value = (1, 19 / 40, 1)
            tint = nt.nodes.new("ShaderNodeMixRGB")
            tint.blend_type = 'MULTIPLY'
            tint.inputs["Fac"].default_value = 0.55
            tint.inputs["Color2"].default_value = (0.55, 0.85, 1.0, 1)
            nt.links.new(tex.outputs["Color"], tint.inputs["Color1"])
            em = nt.nodes.new("ShaderNodeEmission")
            nt.links.new(tint.outputs["Color"], em.inputs["Color"])
            tr = nt.nodes.new("ShaderNodeBsdfTransparent")
            mix = nt.nodes.new("ShaderNodeMixShader")
            nt.links.new(tr.outputs[0], mix.inputs[1])
            nt.links.new(em.outputs[0], mix.inputs[2])
            mo = nt.nodes.new("ShaderNodeOutputMaterial")
            nt.links.new(mix.outputs[0], mo.inputs["Surface"])
            # ghostly: the window body is a faint veil, the text glows through it
            bw = nt.nodes.new("ShaderNodeRGBToBW")
            nt.links.new(tex.outputs["Color"], bw.inputs["Color"])
            op = nt.nodes.new("ShaderNodeMapRange")
            op.inputs["From Max"].default_value = 0.35
            op.inputs["To Min"].default_value = 0.22 if kind == "log" else 0.6
            nt.links.new(bw.outputs[0], op.inputs["Value"])
            fac = nt.nodes.new("ShaderNodeMath")
            fac.operation = 'MULTIPLY'
            nt.links.new(op.outputs[0], fac.inputs[0])
            nt.links.new(fac.outputs[0], mix.inputs["Fac"])
            ob.data.materials.append(m)
            parts.append((ob, kind, h, mp, em, fac))
        out.append((parts, x, y, z, tilt, dl, sp))

    def frame(lf):
        for parts, x, y, z, tilt, dl, sp in out:
            a0 = ev["out"] - 4 + dl
            k = ss(a0, a0 + 12, lf) * (1 - ss(ev["dawn"] - 2 + dl * 0.3, ev["dawn"] + 10, lf))
            rise = ease(ss(a0, a0 + 22, lf), 2.2)
            zc = lerp(0.02, z - H / 2, rise) + 0.004 * math.sin(lf * 0.12 + x * 20)
            for ob, kind, h, mp, em, fac in parts:
                ob.hide_render = k < 0.01
                zz = zc + (H / 2 + h / 2 if kind == "bar" else 0.0)
                ob.location = (x, y, zz)
                ob.rotation_euler = (math.radians(90 - 6 * (1 - rise)), 0, math.radians(tilt))
                s_ = lerp(0.6, 1.0, rise)
                ob.scale = (W * s_, h * s_, 1)
                fac.inputs[1].default_value = 0.9 * k
                em.inputs["Strength"].default_value = 2.2 * k
                if kind == "log":
                    mp.inputs["Location"].default_value = (0, -(lf * sp * 0.012) % 1.0, 0)
    return frame


THEME_LIGHT = {"terminal": (0.25, 1.0, 0.45), "glass": (0.7, 0.78, 1.0), "paper": (1.0, 0.93, 0.8), "midnight": (0.3, 0.42, 1.0),
               "console": (0.85, 0.9, 1.0), "phosphor": (0.35, 1.0, 0.35), "synthwave": (1.0, 0.18, 0.8), "blueprint": (0.2, 0.5, 1.0),
               "brutal": (1.0, 0.9, 0.2), "hologram": (0.3, 1.0, 1.0), "wasteland": (1.0, 0.55, 0.2), "pixel": (0.6, 0.4, 1.0),
               "ducks": (1.0, 0.85, 0.1)}


def shot_themes(S):
    """One low arc; each theme recolours the room through the screen's own light."""
    ev = PLAN["shots"]["themes"]["ev"]
    order = ev["order"]
    sc, cam, hinge = scene(f"theme-{order[0]}", screen=0.6, key=0.3, fill=0.35, samples=S)
    scr = Screen([f"theme-{t}" for t in order])
    n = PLAN["shots"]["themes"]["len"]
    B.set_lid(hinge, 108)
    nrm = B.screen_normal(hinge)
    mid = B.lid_point(hinge, 0, B.ACTIVE_TOP - B.ACTIVE_H / 2)
    spill = area_light("Spill", mid + nrm * 0.03, mid + nrm * 1.0 - Vector((0, 0, 0.25)), 0.0, (1, 1, 1), 0.30, 0.20)

    def frame(lf):
        i = max([k for k, s in enumerate(ev["starts"]) if lf >= s] or [0])
        tid = order[i]
        scr.show(f"theme-{tid}")
        prev = THEME_LIGHT[order[max(0, i - 1)]]
        k = ss(ev["starts"][i], ev["starts"][i] + 3, lf) if i else 1.0
        spill.data.color = Vector(prev).lerp(Vector(THEME_LIGHT[tid]), k)
        spill.data.energy = 0.6
        u = (lf + HANDLE) / (n + HANDLE)
        f = (u + 0.07 * math.sin(2 * math.pi * u)) * (n + HANDLE)   # the arc surges and eases, same end pose
        loc, tgt, lens, fstop, focus = B.shot_themes(max(0, f), n + HANDLE, hinge)
        loc = tgt + (loc - tgt) * (1 - 0.10 * math.sin(math.pi * u) ** 2)   # one dolly-in through the middle
        cam_set(cam, loc, tgt, lens, fstop, focus)
    return sc, frame


def shot_end(S):
    """One slow orbit of the laptop on the desk; the type sits above it in 2D."""
    sc, cam, hinge = scene("one", screen=1.6, studio=False, samples=S)
    sc.view_settings.exposure += 0.6
    area_light("EndSoft", Vector((0.0, 0.15, 1.0)), Vector((0, -0.05, 0.0)), 30.0, (1.0, 0.97, 0.93), 1.2, 0.8)  # broad, no floor spot
    scr = Screen(["one"])
    n = PLAN["shots"]["end"]["len"]

    def frame(lf):
        scr.show("one")
        t = (lf + HANDLE) / (n + HANDLE)
        e = B.ease_sine(t) * 0.6 + (1 - (1 - t) ** 1.7) * 0.4   # quicker first half of the orbit, still settles
        B.set_lid(hinge, lerp(110, 104, e))
        tgt = Vector((0, 0.03, 0.21))
        hit = bump(lf, PLAN["shots"]["end"]["ev"]["hit"], 3, 14)
        loc = B.orbit(tgt, lerp(28, -10, e), 7, lerp(1.52, 1.38, e) - 0.05 * hit)   # push-in kick on the hit
        loc.z = lerp(0.36, 0.34, t)
        cam_set(cam, loc, tgt, 50, 11, Vector((0, 0.03, 0.08)),
                shk=shake(lf, [PLAN["shots"]["end"]["ev"]["hit"]], 1.0, 1.0))
    return sc, frame


SHOTS = {"cascade": shot_cascade, "reveal": shot_reveal, "approve": shot_approve, "swarm": shot_swarm, "open": shot_open,
         "keys": shot_keys, "question": shot_question, "plan": shot_plan, "risky": shot_risky, "night": shot_night,
         "themes": shot_themes, "end": shot_end}


def main():
    o = opts()
    names = list(SHOTS) if o["shots"] == "all" else o["shots"].split(",")
    times = {}
    for name in names:
        S = int(o["samples"])
        sc, frame = SHOTS[name](S)
        for r in RAMPS(name):
            ts = [remap(r[0], RAMPS(name))]
            print(f"RAMP {name}: t(ev {r[0]}) = {ts[0]:.6f} == ev: {abs(ts[0] - r[0]) < 1e-9}; "
                  f"min speed {min(remap(x / 10 + 0.1, RAMPS(name)) - remap(x / 10, RAMPS(name)) for x in range(-120, 1500)) * 10:.2f}", flush=True)
        sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
        sc.render.resolution_percentage = int(o["scale"])
        sc.render.image_settings.color_mode = 'RGB'
        sc.render.film_transparent = False
        total = PLAN["shots"][name]["len"] + HANDLE
        pick = [int(x) for x in o["frames"].split(",") if x] or list(range(total))
        outdir = os.path.join(o["out"], name)
        os.makedirs(outdir, exist_ok=True)
        t0 = time.time()
        for idx in pick:
            frame(idx - HANDLE)
            bpy.context.view_layer.update()
            sc.render.filepath = os.path.join(outdir, f"{idx:04d}.png")
            bpy.ops.render.render(write_still=True)
        dt = time.time() - t0
        times[name] = {"frames": len(pick), "seconds": round(dt, 1), "s_per_frame": round(dt / max(1, len(pick)), 3),
                       "scale": int(o["scale"]), "samples": S}
        print(f"PLATE {name}: {len(pick)} frames in {dt:.1f}s ({dt / max(1, len(pick)):.2f}s/frame)", flush=True)
    with open(os.path.join(o["out"], "_times.json"), "a") as fh:
        fh.write(json.dumps(times) + "\n")


if __name__ == "__main__":
    main()
