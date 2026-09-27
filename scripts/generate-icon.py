import os
from PIL import Image, ImageDraw, ImageFilter

def create_agentos_icon(output_dir):
    size = 512
    # Create high-res canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Base Squircle (Apple Rounded Rectangle)
    pad = 24
    r = 96
    
    # Outer glow shadow
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow)
    s_draw.rounded_rectangle(
        [pad + 8, pad + 16, size - pad - 8, size - pad],
        radius=r,
        fill=(0, 0, 0, 160)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    img.paste(shadow, (0, 0), shadow)

    # 2. Main squircle background with subtle gradient
    bg_card = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_card)
    
    # Gradient background from top-left (#1a1b26) to bottom-right (#0a0a10)
    bg_draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(14, 15, 23, 255),
        outline=(255, 255, 255, 45),
        width=3
    )

    # Inner subtle glow at top-left
    inner_glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ig_draw = ImageDraw.Draw(inner_glow)
    ig_draw.ellipse([pad + 20, pad + 20, pad + 260, pad + 200], fill=(94, 92, 230, 40))
    inner_glow = inner_glow.filter(ImageFilter.GaussianBlur(30))
    
    bg_card.paste(inner_glow, (0, 0), inner_glow)
    img.paste(bg_card, (0, 0), bg_card)

    # 3. Agent Robot / Shield Symbol
    symbol = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sym_draw = ImageDraw.Draw(symbol)

    # Antenna
    antenna_color = (255, 255, 255, 240)
    # Stem
    sym_draw.line([(256, 116), (256, 175)], fill=antenna_color, width=12)
    # Antenna Orb with glow
    sym_draw.ellipse([234, 90, 278, 134], fill=(48, 209, 88, 255), outline=(255, 255, 255, 255), width=4)

    # Robot Head / Core Frame (rounded box)
    head_box = [118, 178, 394, 406]
    sym_draw.rounded_rectangle(head_box, radius=48, fill=(24, 26, 38, 255), outline=(94, 92, 230, 220), width=8)

    # Visor Screen
    visor_box = [148, 218, 364, 366]
    sym_draw.rounded_rectangle(visor_box, radius=28, fill=(10, 11, 16, 255), outline=(255, 255, 255, 30), width=3)

    # Glowing Cyan Eyes / Sensors
    eye_glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    eg_draw = ImageDraw.Draw(eye_glow)
    # Left eye
    eg_draw.ellipse([186, 268, 230, 312], fill=(0, 229, 255, 255))
    # Right eye
    eg_draw.ellipse([282, 268, 326, 312], fill=(0, 229, 255, 255))
    eye_blur = eye_glow.filter(ImageFilter.GaussianBlur(10))
    symbol.paste(eye_blur, (0, 0), eye_blur)

    # Sharp eye dots (inner bright white core)
    sym_draw.ellipse([192, 274, 224, 306], fill=(255, 255, 255, 255))
    sym_draw.ellipse([288, 274, 320, 306], fill=(255, 255, 255, 255))

    # Center mouth / data bus indicator (pulse dots)
    sym_draw.rounded_rectangle([216, 332, 296, 342], radius=4, fill=(48, 209, 88, 230))

    # Left and right ear nodes
    sym_draw.rounded_rectangle([98, 264, 118, 320], radius=8, fill=(94, 92, 230, 240))
    sym_draw.rounded_rectangle([394, 264, 414, 320], radius=8, fill=(94, 92, 230, 240))

    img.paste(symbol, (0, 0), symbol)

    # Save PNG
    png_path = os.path.join(output_dir, "icon.png")
    img.save(png_path, format="PNG")
    print(f"Generated {png_path}")

    # Save ICO with multiple standard Windows sizes
    ico_path = os.path.join(output_dir, "icon.ico")
    icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    img.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"Generated {ico_path}")

if __name__ == "__main__":
    assets_dir = os.path.abspath(r"C:\Users\LOL\Desktop\AIOS\assets")
    desktop_dir = os.path.abspath(r"C:\Users\LOL\Desktop\AIOS\desktop")
    create_agentos_icon(assets_dir)
    create_agentos_icon(desktop_dir)
