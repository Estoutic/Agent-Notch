# Credits for the 3D laptop shots

- **HDRI:** "Studio Small 09" by Sergej Majboroda, Poly Haven, CC0 1.0 (public domain).
  https://polyhaven.com/a/studio_small_09. The 2K `.hdr` comes from
  `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_09_2k.hdr`. `render.sh` downloads it into
  `cache/`, which is not committed.
- **Laptop model:** built in code by `build_scene.py` with bpy and bmesh. No downloaded meshes, no logo, no product
  name.
- **Screen image:** drawn by `make_desktop.swift` with CoreGraphics. It shows the app's notch marks in the Dots style
  with the default theme colours, plus terminal windows set in Menlo and SF Pro (macOS system fonts, used only to draw
  pixels).
