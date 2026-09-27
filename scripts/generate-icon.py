import os
from PIL import Image

def generate_icons():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(root_dir, "assets")
    desktop_dir = os.path.join(root_dir, "desktop")
    
    src_png = os.path.join(assets_dir, "icon.png")
    if not os.path.exists(src_png):
        raise FileNotFoundError(f"Source icon not found at {src_png}")
        
    img = Image.open(src_png).convert("RGBA")
    
    # Save standard Windows multi-size ICO
    icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    
    # 1. Update assets/icon.ico
    assets_ico = os.path.join(assets_dir, "icon.ico")
    img.save(assets_ico, format="ICO", sizes=icon_sizes)
    print(f"Generated {assets_ico}")
    
    # 2. Sync to desktop/icon.png and desktop/icon.ico
    os.makedirs(desktop_dir, exist_ok=True)
    desktop_png = os.path.join(desktop_dir, "icon.png")
    desktop_ico = os.path.join(desktop_dir, "icon.ico")
    
    img.save(desktop_png, format="PNG")
    img.save(desktop_ico, format="ICO", sizes=icon_sizes)
    print(f"Generated {desktop_png} and {desktop_ico}")

if __name__ == "__main__":
    generate_icons()
