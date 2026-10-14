"""v7 key stills (gate 1), EEVEE: the request on the screen, the swarm fly-over, the night.

  blender -b --factory-startup -P v7_stills.py -- --stills request,swarm,night [--scale 100] [--out DIR]
    [--variant N]   camera variant per still, for picking a frame at low scale

Reuses the procedural laptop from build_scene.py and adds a desk, a back wall and (night) a window. Screen faces come
from make_v7_faces.py (cache/v7/face-<name>.png). Writes <out>/<still>.png and <out>/_times.json (seconds per frame).
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

HERE = B.HERE
V7 = os.path.join(B.CACHE, "v7")
MM = B.MM


def opts():
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    o = {"stills": "request,swarm,night", "scale": "100", "out": os.path.join(B.CACHE, "v7", "stills"), "variant": "0",
         "samples": "64"}
    for k, v in zip(a[::2], a[1::2]):
        o[k.lstrip("-")] = v
    return o


def base_opts(face, screen=1.0, key=1.0, fill=1.0):
    return {"shots": "none", "samples": 64, "frames": None, "scale": 100, "out": B.PUBLIC, "save_blend": None,
            "engine": "BLENDER_EEVEE", "face": os.path.join(V7, f"face-{face}.png"),
            "mask": os.path.join(B.CACHE, "mask-noglow.png"), "screen": screen, "key": key, "fill": fill}


def eevee(sc, samples):
    e = sc.eevee
    e.taa_render_samples = samples
    e.use_raytracing = True
    e.ray_tracing_method = 'SCREEN'
    e.use_shadows = True
    e.shadow_ray_count = 2
    e.shadow_step_count = 8
    e.use_fast_gi = True
    e.fast_gi_method = 'GLOBAL_ILLUMINATION'
    e.bokeh_max_size = 60
    e.use_volumetric_shadows = True
    try:
        e.ray_tracing_options.resolution_scale = '1'
    except Exception:
        pass
    sc.render.film_transparent = False


def desk(sc, color=(0.030, 0.024, 0.020), rough=0.42, wall=True, wall_color=(0.018, 0.018, 0.020)):
    """Turns the shadow-catcher floor into a dark oiled-wood desk; adds a back wall far behind for depth."""
    floor = bpy.data.objects["Floor"]
    floor.is_shadow_catcher = False
    floor.scale = (1.5, 1.0, 1.0)
    m, nt, p = B.node_mat("Desk")
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.4
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (2.0, 60.0, 2.0)     # grain runs along x
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    wave = nt.nodes.new("ShaderNodeTexNoise")
    wave.inputs["Scale"].default_value = 3.0
    wave.inputs["Detail"].default_value = 8.0
    wave.inputs["Distortion"].default_value = 1.5
    nt.links.new(mp.outputs["Vector"], wave.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (color[0] * 0.55, color[1] * 0.55, color[2] * 0.55, 1)
    ramp.color_ramp.elements[1].color = (*color, 1)
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    floor.data.materials.clear()
    floor.data.materials.append(m)
    if wall:
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 1.6, 1.0), rotation=(math.radians(90), 0, 0))
        w = bpy.context.active_object
        w.name = "Wall"
        w.scale = (8, 2, 1)
        wm = B.plastic("Wall", wall_color, 0.9)
        w.data.materials.append(wm)
        w.visible_shadow = False   # the window is in this wall: it must not shadow its own light
    return floor


def world(sc, color, strength, hdri_strength=None):
    wn = sc.world.node_tree
    bg = wn.nodes["Background"]
    if hdri_strength is not None:
        bg.inputs["Strength"].default_value = hdri_strength
        return
    for l in list(bg.inputs["Color"].links):
        wn.links.remove(l)
    bg.inputs["Color"].default_value = (*color, 1)
    bg.inputs["Strength"].default_value = strength


def light(name, kind, loc, target, energy, color, size=0.1, size_y=None, spread=None, spot=None):
    sc = bpy.context.scene
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = color
    if kind == 'AREA':
        ld.shape = 'RECTANGLE'
        ld.size = size
        ld.size_y = size_y or size
        if spread is not None:
            ld.spread = math.radians(spread)
    elif kind == 'SPOT':
        ld.spot_size = math.radians(spot or 45)
        ld.spot_blend = 0.6
        ld.shadow_soft_size = size
    elif kind == 'SUN':
        ld.angle = math.radians(size)
    ob = bpy.data.objects.new(name, ld)
    sc.collection.objects.link(ob)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return ob


def camera(cam, loc, tgt, lens, fstop, focus):
    B.look_at(cam, Vector(loc), Vector(tgt))
    cam.data.lens = lens
    cam.data.sensor_fit = 'HORIZONTAL'
    cam.data.sensor_height = 24
    cam.data.dof.use_dof = fstop is not None
    if fstop:
        cam.data.dof.aperture_fstop = fstop
        cam.data.dof.focus_distance = (Vector(focus) - Vector(loc)).length


# ---------------------------------------------------------------- the stills

def still_request(variant, samples):
    """Beat 2: the amber period has landed in the notch; macro on the notch, the request panel below it in
    perspective, the pull-back just starting. Screen: snap4/ask (two requests, one risky)."""
    sc, cam, hinge = B.build(base_opts("ask", screen=1.25, key=0.55, fill=0.6))
    eevee(sc, samples)
    desk(sc)
    world(sc, None, None, hdri_strength=0.06)
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    # stage px: the hardware notch centre is x 976; the request rows sit at x 420..1150, y 110..560
    notch = B.stage_point(hinge, 976, 20)
    req = B.stage_point(hinge, 760, 300)
    side = Vector((1, 0, 0))
    v = [
        # 0: from low-left, the panel recedes up toward the notch; both requests and the risky line readable
        dict(loc=req + nrm * 0.17 - side * 0.06 + Vector((0, 0, -0.06)), tgt=req.lerp(notch, 0.22), lens=50, f=5.6, focus=req),
        # 1: from the right, notch top-right, wallpaper falls off left
        dict(loc=req + nrm * 0.27 + side * 0.11 + Vector((0, 0, -0.10)), tgt=req.lerp(notch, 0.10), lens=50, f=5.6,
             focus=B.stage_point(hinge, 700, 490)),
        # 2: closer macro on the notch with the request under it (the end of the dive)
        dict(loc=req + nrm * 0.11 - side * 0.03 + Vector((0, 0, -0.03)), tgt=req.lerp(notch, 0.45), lens=50, f=4.0, focus=req.lerp(notch, 0.3)),
    ][variant]
    camera(cam, v["loc"], v["tgt"], v["lens"], v["f"], v["focus"])
    return sc


def still_swarm(variant, samples):
    """Swarm: the camera flies low over the panel like over a city at night, 11 projects, 55 agents."""
    sc, cam, hinge = B.build(base_opts("swarm", screen=2.2, key=0.35, fill=0.4))
    # at grazing angles the glass mirrors every studio light: the screen is the only light here
    for nm in ("Key", "RimL", "RimR", "Top", "Kicker"):
        bpy.data.objects[nm].hide_render = True
    eevee(sc, samples)
    desk(sc)
    world(sc, None, None, hdri_strength=0.04)
    B.set_lid(hinge, 110)
    nrm = B.screen_normal(hinge)
    up = (hinge.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()   # along the lid, toward the notch
    side = Vector((1, 0, 0))
    v = [
        # 0: low over the bottom rows, looking up the list to the notch; rows recede like streets
        dict(base=(1080, 1400), h=0.026, back=0.020, look=(640, 760), lens=24, f=11.0, focus=(820, 1000)),
        # 1: higher, a bit more readable
        dict(base=(640, 1250), h=0.034, back=0.050, look=(780, 420), lens=28, f=4.0, focus=(760, 820)),
        # 2: diagonal across the panel from the lower left
        dict(base=(470, 1300), h=0.026, back=0.035, look=(900, 380), lens=24, f=4.0, focus=(720, 900)),
    ][variant]
    loc = B.stage_point(hinge, *v["base"]) + nrm * v["h"] - up * v["back"]
    tgt = B.stage_point(hinge, *v["look"])
    camera(cam, loc, tgt, v["lens"], v["f"], B.stage_point(hinge, *v["focus"]))
    # roll a touch so the flight banks
    cam.rotation_euler.rotate_axis('Z', math.radians([6, -2, -8][variant]))
    glare = bpy.data.node_groups["Comp"].nodes["Glare"]
    glare.inputs["Threshold"].default_value = 0.55
    glare.inputs["Strength"].default_value = 0.9
    return sc


def still_night(variant, samples):
    """Night: the lid is almost shut on Keep awake; the screen's light is a line on the desk; blue room, moonlight
    through a window. Dramatisation."""
    sc, cam, hinge = B.build(base_opts("awake", screen=0.22, key=0.0, fill=0.0))
    eevee(sc, samples)
    sc.eevee.use_volumetric_shadows = True
    desk(sc, color=(0.05, 0.04, 0.034), rough=0.38, wall_color=(0.05, 0.055, 0.07))
    # studio rigs off: the room is lit by the night and the screen
    for nm in ("Key", "RimL", "RimR", "Top", "Kicker"):
        bpy.data.objects[nm].hide_render = True
    world(sc, (0.010, 0.018, 0.045), 1.0)
    lid_deg = [4.0, 7.0, 3.0, 7.0][variant]
    # the studio hinge sits inside the base (fine at 100-110 degrees); a nearly shut lid must pivot at key height
    hinge.location.z = (B.DECK + 0.9) * MM
    B.set_lid(hinge, lid_deg)
    # screen light leaking from the gap: a thin warm-white strip at the front edge, aimed down the desk
    gap_y = -B.D / 2 * MM - 0.002
    gap_y = -B.D / 2 * MM + 0.003
    gap_z = (B.DECK + 5.0) * MM
    light("Leak", 'AREA', (0, gap_y, gap_z), (0, gap_y - 0.05, 0.0), 0.04, (0.85, 0.90, 1.0), size=0.28, size_y=0.001, spread=12)
    _light_line(gap_y)
    # moonlight through a four-pane window, left and behind; the frame is a gobo plane between sun and desk
    sun = light("Moon", 'SUN', (-1.2, 0.9, 1.2), (0.1, -0.1, 0.0), 14.0, (0.55, 0.68, 1.0), size=1.2)
    sdir = (Vector((0.1, -0.1, 0.0)) - Vector((-1.2, 0.9, 1.2))).normalized()
    gobo_center = Vector((-0.08, 0.05, 0.0)) - sdir * 0.9
    _gobo(gobo_center, sun)
    # cold fill so the aluminium edges read in the dark
    light("Edge", 'AREA', (0.9, 0.6, 0.35), (0, 0.1, 0.05), 1.5, (0.45, 0.58, 1.0), size=0.6, size_y=0.6)
    # no world haze: in EEVEE a world volume swallows the sun entirely
    v = [
        dict(loc=(0.42, -0.58, 0.10), tgt=(0.0, -0.05, 0.015), lens=40, f=4.0, focus=(0, -0.12, 0.012)),
        dict(loc=(-0.30, -0.66, 0.12), tgt=(0.02, -0.08, 0.02), lens=40, f=4.0, focus=(0, -0.12, 0.012)),
        dict(loc=(0.0, -0.75, 0.22), tgt=(0.0, -0.04, 0.03), lens=45, f=5.6, focus=(0, -0.12, 0.012)),
        dict(loc=(0.0, -0.05, 2.2), tgt=(0.0, 0.0, 0.0), lens=35, f=None, focus=(0, 0, 0)),   # debug: top view
    ][variant]
    camera(cam, v["loc"], v["tgt"], v["lens"], v["f"], v["focus"])
    sc.view_settings.exposure = 0.4
    return sc


def _light_line(gap_y):
    """The screen's light on the desk: a thin cool line hugging the front edge, fading fast forward and at the ends."""
    import bmesh
    bm = bmesh.new()
    x0, x1, y0, y1 = -0.15, 0.15, -B.D / 2 * MM - 0.003, -B.D / 2 * MM - 0.028
    vs = [bm.verts.new(p) for p in ((x0, y0, 0.0003), (x1, y0, 0.0003), (x1, y1, 0.0003), (x0, y1, 0.0003))]
    bm.faces.new(vs)
    me = bpy.data.meshes.new("LightLine")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("LightLine", me)
    bpy.context.scene.collection.objects.link(ob)
    m = bpy.data.materials.new("LightLine")
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.78, 0.86, 1.0, 1)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeAddShader")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    # forward falloff: 1 at the edge, gone by 4.5 cm; ends fade over the last 4 cm
    fy = B.math_node(nt, "POWER", B.math_node(nt, "SUBTRACT", 1.0, B.math_node(nt, "DIVIDE", B.math_node(nt, "SUBTRACT", y0, sep.outputs[1]), y0 - y1), True), 3.0)
    fx = B.math_node(nt, "MINIMUM", 1.0, B.math_node(nt, "DIVIDE", B.math_node(nt, "SUBTRACT", 0.15, B.math_node(nt, "ABSOLUTE", sep.outputs[0])), 0.04))
    k = B.math_node(nt, "MULTIPLY", B.math_node(nt, "MULTIPLY", fy, fx), 3.0)
    nt.links.new(k, em.inputs["Strength"])
    nt.links.new(em.outputs[0], mix.inputs[0])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    try:
        m.surface_render_method = 'BLENDED'
    except Exception:
        pass
    me.materials.append(m)
    return ob


def _gobo(center, sun):
    """A window with 4 x 3 panes facing the sun; an opaque surround so only the panes let light through."""
    import bmesh
    bm = bmesh.new()
    cols, rows, pane, t = 4, 3, 0.11, 0.022
    W, H = cols * pane + (cols + 1) * t, rows * pane + (rows + 1) * t

    def quad(x0, y0, x1, y1):
        bm.faces.new([bm.verts.new(p) for p in ((x0, y0, 0), (x1, y0, 0), (x1, y1, 0), (x0, y1, 0))])
    for i in range(cols + 1):
        x = -W / 2 + i * (pane + t)
        quad(x, -H / 2, x + t, H / 2)
    for j in range(rows + 1):
        y = -H / 2 + j * (pane + t)
        quad(-W / 2, y, W / 2, y + t)
    R = 3.0
    quad(-R, -R, -W / 2, R); quad(W / 2, -R, R, R); quad(-W / 2, H / 2, W / 2, R); quad(-W / 2, -R, W / 2, -H / 2)
    me = bpy.data.meshes.new("Gobo")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("Gobo", me)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = center
    ob.rotation_euler = sun.rotation_euler
    ob.visible_camera = False
    ob.visible_glossy = False
    ob.visible_diffuse = False
    return ob


STILLS = {"request": still_request, "swarm": still_swarm, "night": still_night}


def main():
    o = opts()
    os.makedirs(o["out"], exist_ok=True)
    times = {}
    for name in o["stills"].split(","):
        variant = int(o["variant"])
        sc = STILLS[name](variant, int(o["samples"]))
        for nm in filter(None, os.environ.get("HIDE", "").split(",")):   # debugging: hide objects by name
            bpy.data.objects[nm].hide_render = True
        sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
        sc.render.resolution_percentage = int(o["scale"])
        sc.render.image_settings.color_mode = 'RGB'
        suffix = "" if o["scale"] == "100" else f"-s{o['scale']}"
        sc.render.filepath = os.path.join(o["out"], f"{name}-v{variant}{suffix}.png")
        # first render warms shaders; time the second, which is what every frame of a sequence costs
        t0 = time.time()
        bpy.ops.render.render(write_still=True)
        t1 = time.time()
        bpy.ops.render.render(write_still=True)
        t2 = time.time()
        times[f"{name}-v{variant}"] = {"first_s": round(t1 - t0, 2), "warm_s_per_frame": round(t2 - t1, 2),
                                       "scale": int(o["scale"]), "samples": int(o["samples"])}
        print(f"STILL {name} v{variant}: first {t1 - t0:.2f}s, warm {t2 - t1:.2f}s/frame", flush=True)
    with open(os.path.join(o["out"], "_times.json"), "a") as fh:
        fh.write(json.dumps(times) + "\n")


if __name__ == "__main__":
    main()
