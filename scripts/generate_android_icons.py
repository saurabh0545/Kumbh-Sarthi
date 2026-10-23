import os
from PIL import Image

BASE_ICON = "assets/images/kumbh_sarthi_clean_circle.png"
EMBLEM = "assets/images/kumbh_sarthi_clean_circle.png"
RES_DIR = "android/app/src/main/res"

DENSITIES = {
    "mipmap-mdpi": (48, 108),
    "mipmap-hdpi": (72, 162),
    "mipmap-xhdpi": (96, 216),
    "mipmap-xxhdpi": (144, 324),
    "mipmap-xxxhdpi": (192, 432),
}

def generate_icons():
    if not os.path.exists(BASE_ICON):
        print(f"Error: {BASE_ICON} not found")
        return

    icon_img = Image.open(BASE_ICON).convert("RGBA")
    emblem_img = Image.open(EMBLEM).convert("RGBA")

    for folder, (icon_sz, fg_sz) in DENSITIES.items():
        out_folder = os.path.join(RES_DIR, folder)
        os.makedirs(out_folder, exist_ok=True)

        # 1. Full launcher icon (legacy & fallback)
        resized_icon = icon_img.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
        resized_icon.save(os.path.join(out_folder, "ic_launcher.webp"), "WEBP")
        resized_icon.save(os.path.join(out_folder, "ic_launcher_round.webp"), "WEBP")

        # 2. Foreground adaptive icon (emblem centered on transparent canvas with safe margin)
        fg_canvas = Image.new("RGBA", (fg_sz, fg_sz), (0, 0, 0, 0))
        # Emblem sized at 70% of fg_sz for adaptive icon safe zone
        emb_target = int(fg_sz * 0.70)
        resized_emblem = emblem_img.resize((emb_target, emb_target), Image.Resampling.LANCZOS)
        offset = ((fg_sz - emb_target) // 2, (fg_sz - emb_target) // 2)
        fg_canvas.paste(resized_emblem, offset, resized_emblem)

        fg_canvas.save(os.path.join(out_folder, "ic_launcher_foreground.webp"), "WEBP")

        # 3. Background adaptive icon (dark navy #07090E matching the theme)
        bg_canvas = Image.new("RGBA", (fg_sz, fg_sz), (7, 9, 14, 255))
        bg_canvas.save(os.path.join(out_folder, "ic_launcher_background.webp"), "WEBP")

        # Remove any lingering .png to prevent duplicate resource collision
        for legacy in ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png", "ic_launcher_background.png"]:
            legacy_p = os.path.join(out_folder, legacy)
            if os.path.exists(legacy_p):
                os.remove(legacy_p)

        print(f"Generated WebP icons for {folder}: icon {icon_sz}x{icon_sz}, fg {fg_sz}x{fg_sz}")

if __name__ == "__main__":
    generate_icons()
