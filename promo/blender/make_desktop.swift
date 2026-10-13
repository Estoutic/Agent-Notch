// Builds the screen texture for the Blender MacBook from plain CoreGraphics + CoreText.
// Usage: xcrun swift make_desktop.swift <outDir> <publicDir>
//   <outDir>/face.png     lid glass, 20 px/mm: black bezel + desktop in the active area + notch
//   <outDir>/mask.png     R = active screen area, G = glow boost (the amber "waiting" mark)
//   <publicDir>/desktop.png  the desktop alone at 3024x1964 (what Remotion sees under the overlays)
// Geometry (mm, lid space) must match build_scene.py: glass 310.6 x 219.2, active 302.4 x 196.4,
// active area 4.1 mm from the glass top/sides, notch 36 x 6.4 mm centred at the top.
import AppKit
import CoreText
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let outDir = URL(fileURLWithPath: args.count > 1 ? args[1] : "cache")
let publicDir = URL(fileURLWithPath: args.count > 2 ? args[2] : "../public/blender")
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
try? FileManager.default.createDirectory(at: publicDir, withIntermediateDirectories: true)

// Screen in points (a 14" panel at "looks like 1512 x 982").
let ptW: CGFloat = 1512, ptH: CGFloat = 982
let notchW: CGFloat = 180, notchH: CGFloat = 32, menuH: CGFloat = 32
let amber = CGColor(red: 1, green: 0.69, blue: 0.12, alpha: 1)   // Theme default .waiting
let green = CGColor(red: 0.19, green: 0.82, blue: 0.35, alpha: 1)  // Theme default .working

func rgb(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat, _ a: CGFloat = 1) -> CGColor { CGColor(red: r, green: g, blue: b, alpha: a) }

func makeContext(_ w: Int, _ h: Int, gray: Bool = false) -> CGContext {
    let cs = gray ? CGColorSpaceCreateDeviceGray() : CGColorSpace(name: CGColorSpace.sRGB)!
    let info = gray ? CGImageAlphaInfo.none.rawValue : CGImageAlphaInfo.premultipliedLast.rawValue
    let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0, space: cs, bitmapInfo: info)!
    // y-down coordinates like a screen.
    ctx.translateBy(x: 0, y: CGFloat(h)); ctx.scaleBy(x: 1, y: -1)
    ctx.interpolationQuality = .high
    ctx.setShouldAntialias(true)
    return ctx
}

func save(_ ctx: CGContext, _ url: URL) {
    let img = ctx.makeImage()!
    let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, img, nil)
    CGImageDestinationFinalize(dest)
    print("wrote \(url.path) \(img.width)x\(img.height)")
}

func font(_ name: String, _ size: CGFloat) -> CTFont { CTFontCreateWithName(name as CFString, size, nil) }

/// Draws one line of text with its baseline at (x, y) in the y-down context.
@discardableResult
func text(_ ctx: CGContext, _ s: String, x: CGFloat, y: CGFloat, font f: CTFont, color: CGColor, kern: CGFloat = 0) -> CGFloat {
    let attrs: [NSAttributedString.Key: Any] = [.font: f, .foregroundColor: color, .kern: kern]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: s, attributes: attrs))
    ctx.saveGState()
    ctx.textMatrix = CGAffineTransform(scaleX: 1, y: -1)
    ctx.textPosition = CGPoint(x: x, y: y)
    CTLineDraw(line, ctx)
    ctx.restoreGState()
    return CGFloat(CTLineGetTypographicBounds(line, nil, nil, nil))
}

/// Text made of coloured runs on one line.
func runs(_ ctx: CGContext, _ parts: [(String, CGColor)], x: CGFloat, y: CGFloat, font f: CTFont) {
    var cx = x
    for (s, c) in parts { cx += text(ctx, s, x: cx, y: y, font: f, color: c) }
}

func roundRect(_ r: CGRect, _ rad: CGFloat) -> CGPath { CGPath(roundedRect: r, cornerWidth: rad, cornerHeight: rad, transform: nil) }

func notchPath(_ r: CGRect, bottomRadius br: CGFloat) -> CGPath {
    let p = CGMutablePath()
    p.move(to: CGPoint(x: r.minX, y: r.minY))
    p.addLine(to: CGPoint(x: r.maxX, y: r.minY))
    p.addLine(to: CGPoint(x: r.maxX, y: r.maxY - br))
    p.addArc(tangent1End: CGPoint(x: r.maxX, y: r.maxY), tangent2End: CGPoint(x: r.maxX - br, y: r.maxY), radius: br)
    p.addLine(to: CGPoint(x: r.minX + br, y: r.maxY))
    p.addArc(tangent1End: CGPoint(x: r.minX, y: r.maxY), tangent2End: CGPoint(x: r.minX, y: r.maxY - br), radius: br)
    p.closeSubpath()
    return p
}

// MARK: terminal windows

struct Term {
    var frame: CGRect
    var title: String
    var lines: [[(String, CGColor)]]
    var fontSize: CGFloat
    var dim: CGFloat = 1
}

let fg = rgb(0.86, 0.87, 0.88), mute = rgb(0.52, 0.53, 0.56), faint = rgb(0.36, 0.37, 0.40)
let tick = rgb(0.40, 0.84, 0.52), cyan = rgb(0.45, 0.72, 0.95), orange = rgb(0.85, 0.47, 0.34)

func drawTerm(_ ctx: CGContext, _ t: Term) {
    let r = t.frame
    ctx.saveGState()
    ctx.setShadow(offset: CGSize(width: 0, height: 18), blur: 50, color: rgb(0, 0, 0, 0.75))
    ctx.addPath(roundRect(r, 11)); ctx.setFillColor(rgb(0.075, 0.077, 0.085, 1)); ctx.fillPath()
    ctx.restoreGState()
    ctx.saveGState()
    ctx.addPath(roundRect(r, 11)); ctx.clip()
    // title bar
    ctx.setFillColor(rgb(0.115, 0.118, 0.13)); ctx.fill(CGRect(x: r.minX, y: r.minY, width: r.width, height: 30))
    ctx.setFillColor(rgb(0, 0, 0, 0.6)); ctx.fill(CGRect(x: r.minX, y: r.minY + 30, width: r.width, height: 1))
    for (i, c) in [rgb(1, 0.37, 0.34), rgb(1, 0.74, 0.18), rgb(0.16, 0.78, 0.25)].enumerated() {
        ctx.setFillColor(c); ctx.fillEllipse(in: CGRect(x: r.minX + 13 + CGFloat(i) * 20, y: r.minY + 9, width: 12, height: 12))
    }
    let tf = font("SFProText-Medium", 13)
    let tw = CGFloat(CTLineGetTypographicBounds(CTLineCreateWithAttributedString(NSAttributedString(string: t.title, attributes: [.font: tf])), nil, nil, nil))
    text(ctx, t.title, x: r.midX - tw / 2, y: r.minY + 20, font: tf, color: mute)
    let mono = font("Menlo-Regular", t.fontSize)
    var y = r.minY + 30 + t.fontSize * 1.9
    for line in t.lines {
        runs(ctx, line, x: r.minX + 20, y: y, font: mono)
        y += t.fontSize * 1.5
    }
    if t.dim < 1 { ctx.setFillColor(rgb(0, 0, 0, 1 - t.dim)); ctx.fill(r) }
    ctx.restoreGState()
    ctx.addPath(roundRect(r.insetBy(dx: 0.5, dy: 0.5), 11)); ctx.setStrokeColor(rgb(1, 1, 1, 0.10)); ctx.setLineWidth(1); ctx.strokePath()
}

// MARK: desktop content in points

func drawDesktop(_ ctx: CGContext, glowOnly: Bool = false) {
    let cs = CGColorSpace(name: CGColorSpace.sRGB)!
    if glowOnly {
        ctx.setFillColor(gray: 0, alpha: 1); ctx.fill(CGRect(x: 0, y: 0, width: ptW, height: ptH))
    } else {
        // Wallpaper: neutral graphite with two soft light pools, no purple.
        ctx.setFillColor(rgb(0.030, 0.031, 0.034)); ctx.fill(CGRect(x: 0, y: 0, width: ptW, height: ptH))
        let g1 = CGGradient(colorsSpace: cs, colors: [rgb(0.16, 0.15, 0.14, 1), rgb(0.16, 0.15, 0.14, 0)] as CFArray, locations: [0, 1])!
        ctx.drawRadialGradient(g1, startCenter: CGPoint(x: 1180, y: 860), startRadius: 0, endCenter: CGPoint(x: 1180, y: 860), endRadius: 760, options: [])
        let g2 = CGGradient(colorsSpace: cs, colors: [rgb(0.09, 0.105, 0.12, 1), rgb(0.09, 0.105, 0.12, 0)] as CFArray, locations: [0, 1])!
        ctx.drawRadialGradient(g2, startCenter: CGPoint(x: 260, y: 140), startRadius: 0, endCenter: CGPoint(x: 260, y: 140), endRadius: 680, options: [])

        // Agents in their terminals: one blocked on a permission prompt, two working.
        drawTerm(ctx, Term(frame: CGRect(x: 880, y: 96, width: 560, height: 300), title: "docs — claude — docs/upload", lines: [
            [("> ", mute), ("document the new upload limits", fg)],
            [],
            [("⏺ ", tick), ("Write(docs/upload.md)", fg)],
            [("  ⎿  ", faint), ("Wrote 64 lines", mute)],
            [],
            [("✻ ", orange), ("Polishing examples… ", orange), ("(esc to interrupt)", faint)],
        ], fontSize: 15, dim: 0.8))
        drawTerm(ctx, Term(frame: CGRect(x: 930, y: 450, width: 520, height: 420), title: "wedding-app — codex — CONF-360", lines: [
            [("• ", cyan), ("Running pnpm test --filter web", fg)],
            [("  ✓ ", tick), ("upload.spec.ts ", fg), ("(12)", mute)],
            [("  ✓ ", tick), ("media.spec.ts ", fg), ("(8)", mute)],
            [("  ✓ ", tick), ("exif.spec.ts ", fg), ("(5)", mute)],
            [("• ", cyan), ("Editing web/src/upload/Preview.tsx", fg)],
            [("  +18 ", tick), ("−4", rgb(0.95, 0.4, 0.4))],
            [("• ", cyan), ("Running pnpm lint", fg)],
            [("  ✓ ", tick), ("0 problems", mute)],
            [],
            [("▌", fg)],
        ], fontSize: 15, dim: 0.85))
        drawTerm(ctx, Term(frame: CGRect(x: 70, y: 150, width: 800, height: 480), title: "wedding-app — claude — fix/upload-compress", lines: [
            [("> ", mute), ("compress uploads before S3, keep EXIF", fg)],
            [],
            [("⏺ ", tick), ("Read(src/routes/upload.ts)", fg)],
            [("  ⎿  ", faint), ("Read 142 lines", mute)],
            [("⏺ ", tick), ("Update(src/services/media.ts)", fg)],
            [("  ⎿  ", faint), ("18 additions, 4 removals", mute)],
            [],
            [("⏺ ", amber), ("Bash(pnpm --filter api exec vitest", fg)],
            [("       related --run src/routes/upload.ts)", fg)],
            [],
            [(" Do you want to proceed?", fg)],
            [(" ❯ 1. Yes", amber)],
            [("   2. Yes, don’t ask again for this command", mute)],
            [("   3. No, tell Claude what to do (esc)", mute)],
        ], fontSize: 19))
        // amber frame around the prompt block
        ctx.addPath(roundRect(CGRect(x: 82, y: 474, width: 776, height: 126), 8))
        ctx.setStrokeColor(rgb(1, 0.69, 0.12, 0.55)); ctx.setLineWidth(1.5); ctx.strokePath()

        // Menu bar (no logo, no product names).
        ctx.setFillColor(rgb(0.15, 0.155, 0.165, 0.92)); ctx.fill(CGRect(x: 0, y: 0, width: ptW, height: menuH))
        let mb = font("SFProText-Bold", 14), mr = font("SFProText-Regular", 14)
        var x: CGFloat = 22
        x += text(ctx, "Terminal", x: x, y: 21, font: mb, color: rgb(1, 1, 1, 0.92)) + 22
        for item in ["Shell", "Edit", "View", "Window", "Help"] {
            x += text(ctx, item, x: x, y: 21, font: mr, color: rgb(1, 1, 1, 0.88)) + 22
        }
        let clock = "Tue 13 Oct  9:41"
        let cw = CGFloat(CTLineGetTypographicBounds(CTLineCreateWithAttributedString(NSAttributedString(string: clock, attributes: [.font: mr])), nil, nil, nil))
        text(ctx, clock, x: ptW - 18 - cw, y: 21, font: mr, color: rgb(1, 1, 1, 0.88))
        // battery + wifi-ish glyphs as plain shapes
        let bx = ptW - 18 - cw - 52
        ctx.addPath(roundRect(CGRect(x: bx, y: 10, width: 26, height: 12), 3.5)); ctx.setStrokeColor(rgb(1, 1, 1, 0.55)); ctx.setLineWidth(1); ctx.strokePath()
        ctx.setFillColor(rgb(1, 1, 1, 0.88)); ctx.fill(CGRect(x: bx + 2, y: 12, width: 18, height: 8))
        ctx.fill(CGRect(x: bx + 27, y: 14, width: 1.6, height: 4))
        for (i, w) in [CGFloat(6), 12, 18].enumerated() {
            ctx.addArc(center: CGPoint(x: bx - 22, y: 23), radius: w / 1.6, startAngle: -.pi * 0.75, endAngle: -.pi * 0.25, clockwise: false)
            ctx.setStrokeColor(rgb(1, 1, 1, i == 2 ? 0.5 : 0.88)); ctx.setLineWidth(1.8); ctx.strokePath()
        }
    }

    // Notch + left wing with the agent marks in the app's Dots style (circle = Claude, rounded square = Codex),
    // default theme colours; the app blinks the waiting mark, here it is caught at full opacity.
    let nx = (ptW - notchW) / 2
    let marks: [(CGColor, Bool)] = [(amber, false), (green, false), (green, true)]
    let d: CGFloat = 11, gap: CGFloat = 8
    let wingW = 12 + CGFloat(marks.count) * d + CGFloat(marks.count - 1) * gap + 12
    if !glowOnly {
        ctx.addPath(notchPath(CGRect(x: nx - wingW, y: 0, width: wingW + notchW, height: notchH), bottomRadius: 9))
        ctx.setFillColor(rgb(0, 0, 0)); ctx.fillPath()
    }
    var mx = nx - wingW + 12
    for (i, (c, square)) in marks.enumerated() {
        let r = CGRect(x: mx, y: (notchH - d) / 2, width: d, height: d)
        if glowOnly {
            if i == 0 {
                let g = CGGradient(colorsSpace: CGColorSpaceCreateDeviceGray(), colors: [CGColor(gray: 1, alpha: 1), CGColor(gray: 1, alpha: 1), CGColor(gray: 0, alpha: 1)] as CFArray, locations: [0, 0.5, 1])!
                ctx.drawRadialGradient(g, startCenter: CGPoint(x: r.midX, y: r.midY), startRadius: 0, endCenter: CGPoint(x: r.midX, y: r.midY), endRadius: d * 0.62, options: [])
            }
        } else {
            ctx.setFillColor(c)
            if square { ctx.addPath(roundRect(r, 3)); ctx.fillPath() } else { ctx.fillEllipse(in: r) }
        }
        mx += d + gap
    }
}

// MARK: outputs

// 1. desktop.png at 2x for Remotion.
do {
    let ctx = makeContext(3024, 1964)
    ctx.scaleBy(x: 2, y: 2)
    drawDesktop(ctx)
    save(ctx, publicDir.appendingPathComponent("desktop.png"))
}

// 2. face.png + mask.png at 20 px/mm.
let pxPerMM: CGFloat = 20
let glassW: CGFloat = 310.6, glassH: CGFloat = 219.2
let activeW: CGFloat = 302.4, activeH: CGFloat = 196.4, inset: CGFloat = 4.1
let fw = Int(glassW * pxPerMM), fh = Int(glassH * pxPerMM)
let active = CGRect(x: inset * pxPerMM, y: inset * pxPerMM, width: activeW * pxPerMM, height: activeH * pxPerMM)
let toPx = activeW * pxPerMM / ptW   // 4.0
func activeShape(_ ctx: CGContext) {
    // Display corners: rounded top (2 mm), slightly rounded bottom (1 mm) like the real panel.
    let p = CGMutablePath(), r = active, t: CGFloat = 2 * pxPerMM, b: CGFloat = 1 * pxPerMM
    p.move(to: CGPoint(x: r.minX + t, y: r.minY))
    p.addLine(to: CGPoint(x: r.maxX - t, y: r.minY))
    p.addArc(tangent1End: CGPoint(x: r.maxX, y: r.minY), tangent2End: CGPoint(x: r.maxX, y: r.minY + t), radius: t)
    p.addLine(to: CGPoint(x: r.maxX, y: r.maxY - b))
    p.addArc(tangent1End: CGPoint(x: r.maxX, y: r.maxY), tangent2End: CGPoint(x: r.maxX - b, y: r.maxY), radius: b)
    p.addLine(to: CGPoint(x: r.minX + b, y: r.maxY))
    p.addArc(tangent1End: CGPoint(x: r.minX, y: r.maxY), tangent2End: CGPoint(x: r.minX, y: r.maxY - b), radius: b)
    p.addLine(to: CGPoint(x: r.minX, y: r.minY + t))
    p.addArc(tangent1End: CGPoint(x: r.minX, y: r.minY), tangent2End: CGPoint(x: r.minX + t, y: r.minY), radius: t)
    ctx.addPath(p)
}
do {
    let ctx = makeContext(fw, fh)
    ctx.setFillColor(rgb(0, 0, 0)); ctx.fill(CGRect(x: 0, y: 0, width: fw, height: fh))
    ctx.saveGState()
    activeShape(ctx); ctx.clip()
    ctx.translateBy(x: active.minX, y: active.minY); ctx.scaleBy(x: toPx, y: toPx)
    drawDesktop(ctx)
    ctx.restoreGState()
    save(ctx, outDir.appendingPathComponent("face.png"))
}
do {
    // R: active area minus notch, G: glow boost, B: 0.
    let m = makeContext(fw, fh)
    m.setFillColor(rgb(0, 0, 0)); m.fill(CGRect(x: 0, y: 0, width: fw, height: fh))
    m.saveGState(); activeShape(m); m.clip()
    m.setFillColor(rgb(1, 0, 0)); m.fill(active)
    m.translateBy(x: active.minX, y: active.minY); m.scaleBy(x: toPx, y: toPx)
    m.addPath(notchPath(CGRect(x: (ptW - notchW) / 2, y: -1, width: notchW, height: notchH + 1), bottomRadius: 9))
    m.setFillColor(rgb(0, 0, 0)); m.fillPath()
    m.restoreGState()
    // glow channel drawn separately in gray, then copied into G.
    let g = makeContext(fw, fh, gray: true)
    g.translateBy(x: active.minX, y: active.minY); g.scaleBy(x: toPx, y: toPx)
    drawDesktop(g, glowOnly: true)
    let gi = g.makeImage()!
    m.saveGState()
    m.setBlendMode(.lighten)
    // tint the gray glow into the green channel (undo the y-flip so the mask is not mirrored)
    m.translateBy(x: 0, y: CGFloat(fh)); m.scaleBy(x: 1, y: -1)
    m.clip(to: CGRect(x: 0, y: 0, width: fw, height: fh), mask: gi)
    m.setFillColor(rgb(0, 1, 0)); m.fill(CGRect(x: 0, y: 0, width: fw, height: fh))
    m.restoreGState()
    save(m, outDir.appendingPathComponent("mask.png"))
}
