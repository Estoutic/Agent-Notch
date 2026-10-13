"""Procedural laptop for the Agent Notch launch film: builds the scene, animates the shots, renders them and
exports per-frame screen-corner JSON for Remotion.

Run through render.sh, or directly:
  blender -b -P build_scene.py -- --shots reveal,orbit --samples 64 [--frames 0,mid,last] [--scale 50] [--out DIR]
  blender -b -P build_scene.py -- --save-blend macbook.blend --shots none

No logo, no product name anywhere on the model. Units are metres; the model is a 14-inch class laptop.
"""
import bpy
import bmesh
import json
import math
import os
import sys
import time
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

HERE = os.path.dirname(os.path.abspath(__file__))
PROMO = os.path.dirname(HERE)
CACHE = os.path.join(HERE, "cache")
PUBLIC = os.path.join(PROMO, "public", "blender")
MM = 0.001

# ---------------------------------------------------------------- dimensions (mm unless noted)
W, D = 312.6, 221.2          # base footprint
TB = 10.4                    # base thickness
FEET = 0.6                   # base sits this high above the floor
DECK = FEET + TB             # deck top z
TL = 4.8                     # lid thickness
HL = 221.2                   # lid height
GLASS_W, GLASS_H, GLASS_Y0 = 310.6, 219.2, 1.0   # glass on the lid face; texture face.png covers exactly this
ACTIVE_W, ACTIVE_H, INSET = 302.4, 196.4, 4.1
ACTIVE_TOP = GLASS_Y0 + GLASS_H - INSET          # 216.1
ACTIVE_BOT = ACTIVE_TOP - ACTIVE_H               # 19.7
NOTCH_W, NOTCH_H = 36.0, 6.4
NOTCH_Z = ACTIVE_TOP - NOTCH_H / 2
HINGE_Y = D / 2 + 1.2        # pivot sits just behind the base
HINGE_Z = 3.6


def args():
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    o = {"shots": "all", "samples": 64, "frames": None, "scale": 100, "out": PUBLIC, "save_blend": None, "engine": "CYCLES",
         "face": None, "mask": None, "screen": 1.0, "key": 1.0, "fill": 1.0}
    i = 0
    while i < len(a):
        k = a[i].lstrip("-").replace("-", "_")
        o[k] = a[i + 1]
        i += 2
    o["samples"] = int(o["samples"])
    o["scale"] = int(o["scale"])
    o["screen"] = float(o["screen"])
    o["key"] = float(o["key"])
    o["fill"] = float(o["fill"])
    return o


# ---------------------------------------------------------------- geometry helpers

def rrect_points(w, h, r, seg=10, cx=0.0, cy=0.0, radii=None):
    """Rounded rectangle outline (counter-clockwise) in the plane, per-corner radii (bl, br, tr, tl)."""
    rb = radii or (r, r, r, r)
    pts = []
    corners = [(cx + w / 2 - rb[1], cy - h / 2 + rb[1], -90, rb[1]),
               (cx + w / 2 - rb[2], cy + h / 2 - rb[2], 0, rb[2]),
               (cx - w / 2 + rb[3], cy + h / 2 - rb[3], 90, rb[3]),
               (cx - w / 2 + rb[0], cy - h / 2 + rb[0], 180, rb[0])]
    for x0, y0, a0, rr in corners:
        if rr <= 0:
            # sharp corner
            pts.append((x0 + rr * math.cos(math.radians(a0 + 45)) * 0, y0))
            continue
        for s in range(seg + 1):
            a = math.radians(a0 + 90 * s / seg)
            pts.append((x0 + rr * math.cos(a), y0 + rr * math.sin(a)))
    return pts


def slab(name, pts, z0, z1, bevel_top=0.0, bevel_bot=0.0, seg=3, mat=None, transform=None):
    """Extrudes an outline (mm, xy) from z0 to z1 (mm) and rounds the top/bottom rims."""
    bm = bmesh.new()
    bot = [bm.verts.new((x * MM, y * MM, z0 * MM)) for x, y in pts]
    top = [bm.verts.new((x * MM, y * MM, z1 * MM)) for x, y in pts]
    n = len(pts)
    bm.faces.new(list(reversed(bot)))
    bm.faces.new(top)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((bot[i], bot[j], top[j], top[i]))
    bm.edges.ensure_lookup_table()
    topset, botset = set(top), set(bot)
    if bevel_top > 0:
        edges = [e for e in bm.edges if e.verts[0] in topset and e.verts[1] in topset]
        bmesh.ops.bevel(bm, geom=edges, offset=bevel_top * MM, segments=seg, profile=0.5, affect='EDGES', clamp_overlap=True)
    if bevel_bot > 0:
        edges = [e for e in bm.edges if all(abs(v.co.z - z0 * MM) < 1e-7 for v in e.verts)]
        bmesh.ops.bevel(bm, geom=edges, offset=bevel_bot * MM, segments=seg, profile=0.5, affect='EDGES', clamp_overlap=True)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(40))
    if transform is not None:
        me.transform(transform)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if mat:
        me.materials.append(mat)
    return ob


def boxes(name, rects, z0, z1, bevel, mat, seg=2):
    """Many small rounded boxes in one mesh (keys). rects: (cx, cy, w, h) in mm."""
    bm = bmesh.new()
    for cx, cy, w, h in rects:
        res = bmesh.ops.create_cube(bm, size=1.0)
        m = Matrix.Translation(((cx) * MM, (cy) * MM, (z0 + z1) / 2 * MM)) @ Matrix.Diagonal((w * MM, h * MM, (z1 - z0) * MM, 1))
        bmesh.ops.transform(bm, matrix=m, verts=res["verts"])
    bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel * MM, segments=seg, profile=0.5, affect='EDGES', clamp_overlap=True)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(50))
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    me.materials.append(mat)
    return ob


def flat(name, pts, z, mat, uv=None, transform=None):
    """A flat n-gon (mm) at height z, optional uv function (x, y) -> (u, v)."""
    bm = bmesh.new()
    vs = [bm.verts.new((x * MM, y * MM, z * MM)) for x, y in pts]
    f = bm.faces.new(vs)
    bmesh.ops.triangulate(bm, faces=[f]) if False else None
    if uv:
        layer = bm.loops.layers.uv.new("UVMap")
        for face in bm.faces:
            for loop in face.loops:
                x, y = loop.vert.co.x / MM, loop.vert.co.y / MM
                loop[layer].uv = uv(x, y)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if transform is not None:
        me.transform(transform)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    me.materials.append(mat)
    return ob


# ---------------------------------------------------------------- materials

def node_mat(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    p = nt.nodes.get("Principled BSDF")
    return m, nt, p


def link(nt, a, b):
    nt.links.new(a, b)


def math_node(nt, op, a=None, b=None, clamp=False):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = op
    n.use_clamp = clamp
    for idx, v in ((0, a), (1, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[idx].default_value = v
        else:
            link(nt, v, n.inputs[idx])
    return n.outputs[0]


def aluminium(name, color, grille=False):
    m, nt, p = node_mat(name)
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = 0.30
    p.inputs["Anisotropic"].default_value = 0.15
    # bead-blasted micro grain
    tc = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 9000.0
    noise.inputs["Detail"].default_value = 2.0
    link(nt, tc.outputs["Object"], noise.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.025
    bump.inputs["Distance"].default_value = 0.00002
    link(nt, noise.outputs["Fac"], bump.inputs["Height"])
    link(nt, bump.outputs["Normal"], p.inputs["Normal"])
    # anisotropy follows x (the long axis), like a machined part
    tan = nt.nodes.new("ShaderNodeTangent")
    tan.direction_type = 'RADIAL'
    tan.axis = 'Z'
    link(nt, tan.outputs["Tangent"], p.inputs["Tangent"])
    if grille:
        # speaker perforations on the deck beside the keyboard
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        link(nt, tc.outputs["Object"], sep.inputs[0])
        geo = nt.nodes.new("ShaderNodeNewGeometry")
        nsep = nt.nodes.new("ShaderNodeSeparateXYZ")
        link(nt, geo.outputs["Normal"], nsep.inputs[0])
        ax = math_node(nt, "ABSOLUTE", sep.outputs[0])
        in_x = math_node(nt, "MULTIPLY", math_node(nt, "GREATER_THAN", ax, 0.1385), math_node(nt, "LESS_THAN", ax, 0.1495))
        in_y = math_node(nt, "MULTIPLY", math_node(nt, "GREATER_THAN", sep.outputs[1], KB_FRONT * MM), math_node(nt, "LESS_THAN", sep.outputs[1], KB_BACK * MM))
        up = math_node(nt, "GREATER_THAN", nsep.outputs[2], 0.9)
        pitch = 0.00085
        fx = math_node(nt, "SUBTRACT", math_node(nt, "FRACT", math_node(nt, "DIVIDE", sep.outputs[0], pitch)), 0.5)
        fy = math_node(nt, "SUBTRACT", math_node(nt, "FRACT", math_node(nt, "DIVIDE", sep.outputs[1], pitch)), 0.5)
        dist = math_node(nt, "SQRT", math_node(nt, "ADD", math_node(nt, "MULTIPLY", fx, fx), math_node(nt, "MULTIPLY", fy, fy)))
        hole = math_node(nt, "LESS_THAN", dist, 0.27)
        mask = math_node(nt, "MULTIPLY", math_node(nt, "MULTIPLY", in_x, in_y), math_node(nt, "MULTIPLY", up, hole))
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = 'RGBA'
        link(nt, mask, mix.inputs["Factor"])
        mix.inputs[6].default_value = (*color, 1)
        mix.inputs[7].default_value = (0.01, 0.01, 0.011, 1)
        link(nt, mix.outputs[2], p.inputs["Base Color"])
        rough = math_node(nt, "ADD", math_node(nt, "MULTIPLY", mask, 0.5), 0.30)
        link(nt, rough, p.inputs["Roughness"])
    return m


def plastic(name, color, rough):
    m, nt, p = node_mat(name)
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Specular IOR Level"].default_value = 0.45
    return m


def glass_face(name, face_img, mask_img, screen_strength, glow_boost):
    m, nt, p = node_mat(name)
    p.inputs["Roughness"].default_value = 0.06
    p.inputs["Specular IOR Level"].default_value = 0.5
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = face_img
    tex.interpolation = 'Cubic'
    msk = nt.nodes.new("ShaderNodeTexImage")
    msk.image = mask_img
    msk.image.colorspace_settings.name = "Non-Color"
    msk.interpolation = 'Linear'
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    link(nt, msk.outputs["Color"], sep.inputs[0])
    # LCD black is a hair lighter than the bezel ink
    base = nt.nodes.new("ShaderNodeMix")
    base.data_type = 'RGBA'
    link(nt, sep.outputs[0], base.inputs["Factor"])
    base.inputs[6].default_value = (0.0015, 0.0015, 0.0017, 1)
    base.inputs[7].default_value = (0.006, 0.0062, 0.0068, 1)
    link(nt, base.outputs[2], p.inputs["Base Color"])
    link(nt, tex.outputs["Color"], p.inputs["Emission Color"])
    strength = math_node(nt, "MULTIPLY", math_node(nt, "ADD", math_node(nt, "MULTIPLY", sep.outputs[1], glow_boost), 1.0), screen_strength)
    link(nt, strength, p.inputs["Emission Strength"])
    return m


# ---------------------------------------------------------------- keyboard layout

U = 18.1     # key pitch
GAP = 1.75
KB_BACK = D / 2 - 15.5
KB_FRONT = KB_BACK - (0.58 + 5) * U
TP_W, TP_H = 136.0, 84.0
TP_CY = KB_FRONT - 11.5 - TP_H / 2


def key_rects():
    rows = [
        [1] * 13 + [1.5],
        [1.5] + [1] * 13,
        [1.8] + [1] * 11 + [1.7],
        [2.35] + [1] * 10 + [2.15],
    ]
    rects = []
    total = 14.5 * U
    x0 = -total / 2
    y = KB_BACK
    # function row: 14 equal half-height keys
    fh = 0.58 * U
    fw = total / 14
    for i in range(14):
        rects.append((x0 + fw * (i + 0.5), y - fh / 2, fw - GAP, fh - GAP))
    y -= fh
    for row in rows:
        x = x0
        for wu in row:
            rects.append((x + wu * U / 2, y - U / 2, wu * U - GAP, U - GAP))
            x += wu * U
        y -= U
    # bottom row
    x = x0
    for wu in [1, 1, 1, 1.25, 5.0, 1.25, 1]:
        rects.append((x + wu * U / 2, y - U / 2, wu * U - GAP, U - GAP))
        x += wu * U
    hh = U / 2
    rects.append((x + U / 2, y - U + hh / 2, U - GAP, hh - GAP))          # left arrow
    rects.append((x + U * 1.5, y - hh / 2, U - GAP, hh - GAP))            # up
    rects.append((x + U * 1.5, y - U + hh / 2, U - GAP, hh - GAP))        # down
    rects.append((x + U * 2.5, y - U + hh / 2, U - GAP, hh - GAP))        # right
    return rects


# ---------------------------------------------------------------- scene

def build(o):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'

    # --face/--mask swap the screen (v5: a theme per shot); --screen scales its emission, --key the key light
    face_img = bpy.data.images.load(os.path.abspath(o["face"]) if o["face"] else os.path.join(CACHE, "face.png"))
    mask_img = bpy.data.images.load(os.path.abspath(o["mask"]) if o["mask"] else os.path.join(CACHE, "mask.png"))

    alu = aluminium("Aluminium", (0.80, 0.805, 0.815), grille=True)
    alu_lid = aluminium("AluminiumLid", (0.80, 0.805, 0.815))
    keycap = plastic("Keycap", (0.012, 0.012, 0.013), 0.42)
    well = plastic("KeyWell", (0.006, 0.006, 0.007), 0.6)
    pad = aluminium("Trackpad", (0.74, 0.745, 0.755))
    pad.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.3
    pad.node_tree.nodes["Principled BSDF"].inputs["Anisotropic"].default_value = 0.0
    hinge_mat = plastic("Hinge", (0.010, 0.010, 0.011), 0.35)
    hinge_mat.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.6
    rubber = plastic("Rubber", (0.008, 0.008, 0.008), 0.8)
    port = plastic("Port", (0.004, 0.004, 0.0045), 0.5)
    glass = glass_face("Glass", face_img, mask_img, screen_strength=o["screen"], glow_boost=1.8)
    lens = plastic("Lens", (0.002, 0.003, 0.006), 0.05)
    lens.node_tree.nodes["Principled BSDF"].inputs["Coat Weight"].default_value = 1.0
    lens_ring = plastic("LensRing", (0.03, 0.03, 0.035), 0.25)

    # base
    base = slab("Base", rrect_points(W, D, 9.5, 12), FEET, DECK, bevel_top=0.9, bevel_bot=2.6, seg=4, mat=alu)
    # feet
    for sx in (-1, 1):
        for sy in (-1, 1):
            slab("Foot", rrect_points(9, 9, 4.5, 8, sx * (W / 2 - 22), sy * (D / 2 - 20)), 0.0, FEET + 0.4, mat=rubber)
    # side ports (shallow dark inlays just proud of the side walls)
    for side, items in ((-1, [(D / 2 - 30, 11, 2.6), (D / 2 - 48, 8.6, 2.7), (D / 2 - 62, 8.6, 2.7), (-D / 2 + 28, 3.6, 3.6)]),
                        (1, [(D / 2 - 32, 14.5, 3.2), (D / 2 - 52, 8.6, 2.7), (-D / 2 + 40, 24, 1.8)])):
        for cy, ln, ht in items:
            m = Matrix.Translation((side * (W / 2 + 0.03) * MM, cy * MM, (FEET + TB * 0.45) * MM)) @ Matrix.Rotation(math.radians(90 * side), 4, 'Y')
            pts = rrect_points(ht, ln, min(ht, ln) / 2 - 0.01, 6)
            flat("Port", pts, 0, port, transform=m)
    # keyboard well, keys, trackpad
    margin = 2.2
    kb_w = 14.5 * U + margin * 2
    kb_h = (KB_BACK - KB_FRONT) + margin * 2
    flat("KeyWell", rrect_points(kb_w, kb_h, 4, 6, 0, (KB_BACK + KB_FRONT) / 2), DECK + 0.03, well)
    boxes("Keys", key_rects(), DECK + 0.05, DECK + 0.75, 0.9, keycap, seg=3)
    flat("TrackpadGap", rrect_points(TP_W + 0.6, TP_H + 0.6, 6.3, 8, 0, TP_CY), DECK + 0.02, well)
    slab("Trackpad", rrect_points(TP_W, TP_H, 6, 8, 0, TP_CY), DECK - 0.4, DECK + 0.05, bevel_top=0.25, seg=2, mat=pad)

    # hinge pivot + lid
    hinge = bpy.data.objects.new("Hinge", None)
    sc.collection.objects.link(hinge)
    hinge.location = (0, HINGE_Y * MM, HINGE_Z * MM)
    # hinge barrel (dark cover between deck and the display chin)
    barrel = bpy.data.meshes.new("Barrel")
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=3.6 * MM, radius2=3.6 * MM, depth=(W - 60) * MM,
                          matrix=Matrix.Rotation(math.radians(90), 4, 'Y'))
    bm.to_mesh(barrel)
    bm.free()
    barrel.shade_smooth()
    bo = bpy.data.objects.new("Barrel", barrel)
    sc.collection.objects.link(bo)
    bo.location = (0, (D / 2 + 2.0) * MM, 8.6 * MM)
    barrel.materials.append(hinge_mat)

    # lid in its own frame: x right, z up along the lid, display face toward -y at y = 0, back at y = TL.
    to_lid = Matrix.Rotation(math.radians(90), 4, 'X')   # maps mesh (x, y, z) -> (x, -z, y): outline in xy, thickness along z
    # slab outline lives in (x, z_lid); extrusion axis becomes -y, so extrude from -TL..0 and flip
    lid = slab("Lid", rrect_points(W, HL, 9.5, 12, 0, HL / 2), -TL, 0.0, bevel_top=1.1, bevel_bot=1.3, seg=4, mat=alu_lid,
               transform=to_lid)
    # after to_lid: mesh z in [-TL, 0] -> y in [0, TL]; front face (z=0) -> y = 0. Good.
    lid.parent = hinge
    uvf = lambda x, y: ((x + GLASS_W / 2) / GLASS_W, (y - GLASS_Y0) / GLASS_H)
    gl = flat("Glass", rrect_points(GLASS_W, GLASS_H, 8.6, 12, 0, GLASS_Y0 + GLASS_H / 2), 0.0, glass, uv=uvf,
              transform=Matrix.Translation((0, -0.04 * MM, 0)) @ to_lid @ Matrix.Diagonal((1, 1, 1, 1)))
    gl.parent = hinge
    # glass sits in front of the face: to_lid maps z -> y, so z = 0 is y = 0; nudge in front done by the translation
    # camera inside the notch
    for nm, r, mat, dy in (("LensRing", 1.25, lens_ring, -0.06), ("Lens", 0.75, lens, -0.075)):
        ob = flat(nm, rrect_points(2 * r, 2 * r, r - 0.001, 10, 0, NOTCH_Z), 0.0, mat,
                  transform=Matrix.Translation((0, dy * MM, 0)) @ to_lid)
        ob.parent = hinge
    # flip the mesh orientation of flat lid parts so normals face the viewer (-y)
    for ob in hinge.children:
        if ob.type == 'MESH' and ob.name != "Lid":
            me = ob.data
            bm = bmesh.new(); bm.from_mesh(me)
            for f in bm.faces:
                if f.normal.y > 0:
                    f.normal_flip()
            bm.to_mesh(me); bm.free()

    # floor shadow catcher
    bpy.ops.mesh.primitive_plane_add(size=6)
    floor = bpy.context.active_object
    floor.name = "Floor"
    floor.is_shadow_catcher = True

    # world: CC0 studio HDRI, kept low so the rim lights shape the metal
    world = bpy.data.worlds.new("World")
    sc.world = world
    try:
        world.use_nodes = True
    except Exception:
        pass
    wn = world.node_tree
    bg = wn.nodes.get("Background") or wn.nodes.new("ShaderNodeBackground")
    env = wn.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(os.path.join(CACHE, "studio_small_09_2k.hdr"))
    mapn = wn.nodes.new("ShaderNodeMapping")
    mapn.inputs["Rotation"].default_value = (0, 0, math.radians(-98))   # main octabox behind-left: rim on the lid, out of the screen
    tcw = wn.nodes.new("ShaderNodeTexCoord")
    link(wn, tcw.outputs["Generated"], mapn.inputs["Vector"])
    link(wn, mapn.outputs["Vector"], env.inputs["Vector"])
    link(wn, env.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 0.12
    out = wn.nodes.get("World Output") or wn.nodes.new("ShaderNodeOutputWorld")
    link(wn, bg.outputs[0], out.inputs[0])

    def area(name, loc, target, size, power, color=(1, 1, 1), shape='RECTANGLE', size_y=None):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy = power
        ld.color = color
        ld.shape = shape
        ld.size = size
        if size_y:
            ld.size_y = size_y
        ob = bpy.data.objects.new(name, ld)
        sc.collection.objects.link(ob)
        ob.location = loc
        d = Vector(target) - Vector(loc)
        ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        return ob

    # big soft key above-front for the deck gradient, two rims behind for the lid edges, a low kicker for the base edge
    area("Key", (-0.10, 0.10, 1.10), (0, 0.0, 0.0), 0.9, 7 * o["key"], (1.0, 0.98, 0.96))
    area("RimL", (-0.75, 0.45, 0.55), (0.0, 0.12, 0.18), 0.10, 14, (0.96, 0.98, 1.0), size_y=0.8)
    # --fill scales everything but the key and the left rim (v5 themes: the screen is the light)
    area("RimR", (0.85, 0.30, 0.45), (0.0, 0.14, 0.17), 0.10, 5 * o["fill"], (1.0, 0.97, 0.94), size_y=0.8)
    area("Top", (0.0, 0.55, 0.75), (0.0, 0.15, 0.24), 0.9, 6 * o["fill"], (1, 1, 1), size_y=0.06)
    area("Kicker", (0.0, -0.9, 0.04), (0, 0, 0.01), 1.2, 1.2 * o["fill"], (1, 1, 1), size_y=0.12)

    for nm in filter(None, os.environ.get("LIGHTS_OFF", "").split(",")):
        if nm == "World":
            bg.inputs["Strength"].default_value = 0.0
        elif nm == "Screen":
            glass.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 0.0
            for l in list(glass.node_tree.links):
                if l.to_socket.name == "Emission Strength":
                    glass.node_tree.links.remove(l)
        else:
            bpy.data.objects[nm].hide_render = True

    cam_data = bpy.data.cameras.new("Camera")
    cam = bpy.data.objects.new("Camera", cam_data)
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam_data.sensor_width = 36
    cam_data.clip_start = 0.002
    cam_data.clip_end = 20
    cam_data.dof.use_dof = True
    cam_data.dof.aperture_blades = 7
    cam_data.dof.aperture_ratio = 1.0

    # render
    r = sc.render
    r.fps = 30
    r.film_transparent = True
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGBA'
    r.image_settings.color_depth = '8'
    r.use_persistent_data = True
    try:
        sc.view_settings.view_transform = 'Khronos PBR Neutral'
    except TypeError:
        sc.view_settings.view_transform = 'AgX'
    sc.view_settings.exposure = 0.0
    if o["engine"] == "CYCLES":
        r.engine = 'CYCLES'
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for dev in prefs.devices:
            dev.use = dev.type != 'CPU'   # GPU only: hybrid CPU+GPU is slower on Apple Silicon
        sc.cycles.device = 'GPU'
        sc.cycles.samples = o["samples"]
        sc.cycles.use_adaptive_sampling = True
        sc.cycles.adaptive_threshold = 0.04
        sc.cycles.use_denoising = True
        sc.cycles.denoiser = 'OPENIMAGEDENOISE'
        sc.cycles.denoising_use_gpu = True
        sc.cycles.max_bounces = 4
        sc.cycles.glossy_bounces = 3
        sc.cycles.transmission_bounces = 2
        sc.cycles.diffuse_bounces = 2
        sc.cycles.caustics_reflective = False
        sc.cycles.caustics_refractive = False
        sc.cycles.blur_glossy = 1.0
        sc.cycles.sample_clamp_indirect = 4.0
    else:
        r.engine = 'BLENDER_EEVEE'

    # compositor: bloom on the boosted amber mark only
    ng = bpy.data.node_groups.new("Comp", "CompositorNodeTree")
    ng.interface.new_socket("Image", in_out='OUTPUT', socket_type='NodeSocketColor')
    rl = ng.nodes.new("CompositorNodeRLayers")
    gl_ = ng.nodes.new("CompositorNodeGlare")
    gl_.inputs["Type"].default_value = 'Bloom'
    gl_.inputs["Quality"].default_value = 'High'
    gl_.inputs["Threshold"].default_value = 1.15
    gl_.inputs["Strength"].default_value = 0.6
    gl_.inputs["Size"].default_value = 0.35
    outn = ng.nodes.new("NodeGroupOutput")
    ng.links.new(rl.outputs["Image"], gl_.inputs["Image"])
    ng.links.new(gl_.outputs[0], outn.inputs[0])
    if not os.environ.get("NO_GLARE"):
        sc.compositing_node_group = ng
    try:
        r.use_compositing = True
    except Exception:
        pass
    return sc, cam, hinge


# ---------------------------------------------------------------- camera language

def lid_point(hinge, x_mm, z_mm, y_mm=-0.04):
    return hinge.matrix_world @ Vector((x_mm * MM, y_mm * MM, z_mm * MM))


def set_lid(hinge, angle_deg):
    # angle between deck and display; 90 = upright. Lean back past vertical for > 90.
    hinge.rotation_euler = (-math.radians(angle_deg - 90), 0, 0)
    bpy.context.view_layer.update()


def ease_io(t, p=3.0):
    t = max(0.0, min(1.0, t))
    return 0.5 * (2 * t) ** p if t < 0.5 else 1 - 0.5 * (2 - 2 * t) ** p


def ease_sine(t):
    t = max(0.0, min(1.0, t))
    return 0.5 - 0.5 * math.cos(math.pi * t)


def smoothstep(a, b, t):
    t = max(0.0, min(1.0, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def vlerp(a, b, t):
    return Vector(a).lerp(Vector(b), t)


def orbit(target, az_deg, el_deg, dist):
    az, el = math.radians(az_deg), math.radians(el_deg)
    return Vector(target) + dist * Vector((-math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))


HERO_T = Vector((0.0, 0.045, 0.065))


def screen_normal(hinge):
    return (hinge.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized()


def shot_reveal(f, n, hinge, vertical=False):
    set_lid(hinge, 110)
    t = f / (n - 1)
    mark = lid_point(hinge, -28.0, NOTCH_Z)
    notch = lid_point(hinge, -8.0, NOTCH_Z - 1.0)
    nrm = screen_normal(hinge)
    side = Vector((1, 0, 0))
    # macro: close, slightly from the left and below, looking up the glass at the mark and the notch
    macro_dist = 0.075 if not vertical else 0.11
    macro_cam = notch + nrm * macro_dist - side * 0.012 + Vector((0, 0, -0.006))
    hero_dist = 0.92 if not vertical else 0.95
    hero_cam = orbit(HERO_T, 34, 21, hero_dist)
    # 0..0.27 hold + creep, 0.27..0.88 decisive pull, then settle
    creep = smoothstep(0.0, 0.3, t) * 0.08
    pull = ease_io(smoothstep(0.24, 0.9, t) ** 0.85, 3.2)
    cam_hold = macro_cam + nrm * (macro_dist * 0.35 * creep)
    # pull back along an arc: blend in a sideways swing so it reads as 3D, not a zoom
    loc = vlerp(cam_hold, hero_cam, pull)
    swing = math.sin(math.pi * pull) * 0.10
    loc += Vector((-swing, -swing * 0.4, swing * 0.25))
    tgt = vlerp(mark.lerp(notch, 0.45), HERO_T, ease_io(smoothstep(0.24, 0.92, t), 2.4))
    focal = lerp(50, 50, pull)
    fstop = lerp(1.8, 11.0, smoothstep(0.35, 0.95, t))
    focus = mark.lerp(notch, 0.45).lerp(Vector((0.0, 0.12, 0.13)), smoothstep(0.24, 0.92, t))
    return loc, tgt, focal, fstop, focus


def shot_orbit(f, n, hinge, vertical=False):
    set_lid(hinge, 110)
    t = ease_sine(f / (n - 1))
    az = lerp(36, 16, t)
    tgt = HERO_T + Vector((0, 0.02, 0.0))
    loc = orbit(tgt, az, lerp(21, 18, t), lerp(0.86, 0.90, t))
    return loc, tgt, 50, 8.0, Vector((0, 0.13, 0.12))


def shot_push(f, n, hinge, vertical=False):
    set_lid(hinge, 110)
    t = f / (n - 1)
    e = ease_io(t, 3.6)
    nrm = screen_normal(hinge)
    vis_w = ACTIVE_W / 4 * MM
    end_dist = vis_w / 2 / math.tan(math.atan(18 / 50))
    # frame the top centre: the notch sits at the top of the frame
    end_tgt = lid_point(hinge, 0, ACTIVE_TOP + 3.0 - vis_w * 9 / 16 / 2 / MM)
    end_cam = end_tgt + nrm * end_dist
    start_cam = orbit(HERO_T, 34, 21, 0.92)
    loc = vlerp(start_cam, end_cam, e)
    # curve in from the side so the final approach is straight-on
    side = math.sin(math.pi * e) * 0.05
    loc += Vector((side * 0.6, 0, side * 0.3))
    tgt = vlerp(HERO_T, end_tgt, ease_io(t, 2.6))
    focus = vlerp(Vector((0.0, 0.12, 0.13)), end_tgt, ease_io(t, 2.6))
    return loc, tgt, 50, 5.6, focus


def shot_endcard(f, n, hinge, vertical=False):
    t = f / (n - 1)
    set_lid(hinge, lerp(110, 100, ease_sine(t)))
    if vertical:
        dist = lerp(0.86, 0.80, ease_sine(t))
        tgt = Vector((0, 0.03, 0.27))
        loc = orbit(tgt, 0, 8, dist)
        loc.z = lerp(0.30, 0.29, t)
        return loc, tgt, 50, 11, Vector((0, 0.03, 0.08))
    dist = lerp(1.22, 1.12, ease_sine(t))
    tgt = Vector((0, 0.03, 0.205))
    loc = orbit(tgt, 0, 6, dist)
    loc.z = lerp(0.33, 0.31, t)
    return loc, tgt, 50, 11, Vector((0, 0.03, 0.08))


# ---------------------------------------------------------------- v5 "Slowest Process"
# Stage pixels (the app's @2x snapshots, 3024 x 1964 screen) map 0.1 mm each onto the lid; x from the notch centre.
STAGE_MM = 0.1
STAGE_NOTCH_CX = 976


def stage_point(hinge, sx, sy):
    return lid_point(hinge, (sx - STAGE_NOTCH_CX) * STAGE_MM, ACTIVE_TOP - sy * STAGE_MM)


def shot_dive(f, n, hinge, vertical=False):
    """B: three-quarter hero to square-on, ending on the panel area at 2.4x stage (1920 px = 800 stage px)."""
    set_lid(hinge, 110)
    t = f / (n - 1)
    # 18 fast frames, 27 settling
    e = 1 - (1 - min(1.0, t * (n - 1) / 18)) ** 3 if f < 18 else 1 - 0.03 * (1 - smoothstep(18, n - 1, f)) ** 2
    nrm = screen_normal(hinge)
    end_tgt = stage_point(hinge, 780, 250)
    end_dist = (1920 / 2.4 * STAGE_MM * MM) / 2 / (18 / 50)
    end_cam = end_tgt + nrm * end_dist
    start_cam = orbit(HERO_T, 34, 21, 0.92)
    loc = vlerp(start_cam, end_cam, e)
    side = math.sin(math.pi * e) * 0.06
    loc += Vector((side * 0.6, 0, side * 0.3))
    tgt = vlerp(HERO_T, end_tgt, min(1.0, e * 1.08))
    return loc, tgt, 50, 5.6, tgt


def shot_themes(f, n, hinge, vertical=False):
    """E: 80 degree low arc on black, 35 mm; the screen lights the metal."""
    set_lid(hinge, 108)
    t = ease_io(f / (n - 1), 2.2)
    tgt = HERO_T + Vector((0, 0.01, -0.01))
    loc = orbit(tgt, lerp(55, -25, t), lerp(12, 22, t), 0.70)
    return loc, tgt, 35, 8.0, tgt


SHOTS = {
    "dive": (45, (1920, 1080), shot_dive, False),
    "themes": (195, (1920, 1080), shot_themes, False),
    "reveal": (90, (1920, 1080), shot_reveal, False),
    "orbit": (60, (1920, 1080), shot_orbit, False),
    "push": (45, (1920, 1080), shot_push, False),
    "endcard": (120, (1920, 1080), shot_endcard, False),
    "reveal-v": (90, (1080, 1920), shot_reveal, True),
    "endcard-v": (120, (1080, 1920), shot_endcard, True),
}


def look_at(cam, loc, tgt):
    cam.location = loc
    d = Vector(tgt) - Vector(loc)
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def animate(sc, cam, hinge, name):
    n, (w, h), fn, vertical = SHOTS[name]
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.frame_start, sc.frame_end = 0, n - 1
    cam.animation_data_clear()
    cam.data.animation_data_clear()
    hinge.animation_data_clear()
    cam.data.sensor_fit = 'HORIZONTAL' if not vertical else 'VERTICAL'
    cam.data.sensor_height = 36 if vertical else 24
    prev_rot = None
    for f in range(n):
        loc, tgt, focal, fstop, focus = fn(f, n, hinge, vertical)
        bpy.context.view_layer.update()
        look_at(cam, loc, tgt)
        if prev_rot is not None:
            cam.rotation_euler.make_compatible(prev_rot)
        prev_rot = cam.rotation_euler.copy()
        cam.data.lens = focal * (1.0 if not vertical else 0.75)
        cam.data.dof.aperture_fstop = fstop
        cam.data.dof.focus_distance = (Vector(focus) - Vector(loc)).length
        for ob, path in ((cam, "location"), (cam, "rotation_euler"), (hinge, "rotation_euler")):
            ob.keyframe_insert(path, frame=f)
        for path in ("lens", "dof.aperture_fstop", "dof.focus_distance"):
            cam.data.keyframe_insert(path, frame=f)
    return n, w, h


def export_json(sc, cam, hinge, name, n, w, h, out):
    corners = {"tl": (-ACTIVE_W / 2, ACTIVE_TOP), "tr": (ACTIVE_W / 2, ACTIVE_TOP),
               "br": (ACTIVE_W / 2, ACTIVE_BOT), "bl": (-ACTIVE_W / 2, ACTIVE_BOT)}
    frames = []
    for f in range(n):
        sc.frame_set(f)
        rec = {"frame": f, "corners": {}, "inFront": True}
        for k, (x, z) in corners.items():
            p = world_to_camera_view(sc, cam, lid_point(hinge, x, z))
            rec["corners"][k] = [round(p.x * w, 2), round((1 - p.y) * h, 2)]
            rec["inFront"] = rec["inFront"] and p.z > 0
        p = world_to_camera_view(sc, cam, lid_point(hinge, 0, NOTCH_Z))
        rec["notch"] = [round(p.x * w, 2), round((1 - p.y) * h, 2)]
        rec["notchDepth"] = round(p.z, 4)
        frames.append(rec)
    data = {
        "shot": name, "width": w, "height": h, "fps": 30, "frameCount": n,
        "frames_dir": f"blender/{name}/", "frame_pattern": "%04d.png",
        "screen": {"texture": "blender/desktop.png", "pixels": [3024, 1964],
                   "notchUV": [0.5, round(NOTCH_H / 2 / ACTIVE_H, 5)],
                   "note": "corners are the active display area (desktop.png maps tl,tr,br,bl); origin top-left, y down, px"},
        "frames": frames,
    }
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, f"{name}.json"), "w") as fh:
        json.dump(data, fh, indent=1)


def main():
    o = args()
    sc, cam, hinge = build(o)
    names = list(SHOTS) if o["shots"] == "all" else ([] if o["shots"] == "none" else o["shots"].split(","))
    report = {}
    for name in names:
        n, w, h = animate(sc, cam, hinge, name)
        export_json(sc, cam, hinge, name, n, w, h, o["out"])
        sc.render.resolution_percentage = o["scale"]
        outdir = os.path.join(o["out"], name)
        os.makedirs(outdir, exist_ok=True)
        if o["frames"]:
            pick = []
            for tok in o["frames"].split(","):
                pick.append({"first": 0, "mid": n // 2, "last": n - 1}.get(tok, None) if not tok.isdigit() else int(tok))
            frames = [p for p in pick if p is not None]
        else:
            frames = list(range(n))
        t0 = time.time()
        for f in frames:
            sc.frame_set(f)
            sc.render.filepath = os.path.join(outdir, f"{f:04d}.png")
            bpy.ops.render.render(write_still=True)
        dt = time.time() - t0
        report[name] = {"frames": len(frames), "seconds": round(dt, 1), "per_frame": round(dt / max(1, len(frames)), 2)}
        print(f"SHOT {name}: {len(frames)} frames in {dt:.1f}s ({dt / max(1, len(frames)):.2f}s/frame)", flush=True)
    if o["save_blend"]:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(o["save_blend"]), relative_remap=True, compress=True)
    with open(os.path.join(o["out"], "_render_times.json") if names else os.devnull, "a") as fh:
        fh.write(json.dumps({"samples": o["samples"], "scale": o["scale"], "shots": report}) + "\n")


main()
