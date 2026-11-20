"""
Seven-button Samsung-style remote overlay for Windows.
- Uses only Python's standard library (Tkinter + ctypes).
- Shows: Up, Down, Left, Right, Pause, OK, Back.
- Keyboard mapping:
    Arrow keys = directions
    Space      = Pause (Tizen 4.0)
    Enter      = OK (Tizen 4.0)
    Escape     = Back (Tizen 4.0)
- It only reads key state; it does not block or record keystrokes.
- Right-click and drag the overlay to reposition it.
- F9 hides/shows the overlay; F10 exits.
"""

import ctypes
import tkinter as tk

user32 = ctypes.windll.user32

# Windows virtual-key codes
KEYS = {
    "Up": 0x26,
    "Down": 0x28,
    "Left": 0x25,
    "Right": 0x27,
    "Pause": 0x20,  # Space
    "OK": 0x0D,     # Enter
    "Back": 0x1B,   # Escape
}

BG = "#ff00ff"       # transparent window color on Windows
NORMAL = "#252a30"
ACTIVE = "#24a6ff"
TEXT = "#ffffff"
MUTED = "#aeb8c2"
OUTLINE = "#59636e"

root = tk.Tk()
root.title("Tizen 4.0 Remote Overlay")
root.overrideredirect(True)
root.attributes("-topmost", True)
root.configure(bg=BG)
root.attributes("-transparentcolor", BG)
# Place the overlay at the bottom-right of the primary screen.
# The 24px margins keep it away from the screen edges.
root.update_idletasks()
screen_w = root.winfo_screenwidth()
screen_h = root.winfo_screenheight()
overlay_w, overlay_h = 270, 350
margin = 24
pos_x = max(0, screen_w - overlay_w - margin)
pos_y = max(0, screen_h - overlay_h - margin)
root.geometry(f"{overlay_w}x{overlay_h}+{pos_x}+{pos_y}")
root.resizable(False, False)

canvas = tk.Canvas(
    root, width=270, height=350,
    bg=BG, highlightthickness=0, bd=0
)
canvas.pack()

# Direction pad layout, with Pause / OK / Back underneath.
buttons = {
    "Up":    (98, 10, 172, 68),
    "Left":  (18, 76, 92, 134),
    "OK":    (98, 76, 172, 134),
    "Right": (178, 76, 252, 134),
    "Down":  (98, 142, 172, 200),
    "Pause": (18, 218, 92, 276),
    "Back":  (98, 218, 172, 276),
}

def rounded_rect(x1, y1, x2, y2, radius=12, **kwargs):
    points = [
        x1 + radius, y1, x2 - radius, y1,
        x2, y1, x2, y1 + radius,
        x2, y2 - radius, x2, y2,
        x2 - radius, y2, x1 + radius, y2,
        x1, y2, x1, y2 - radius,
        x1, y1 + radius, x1, y1
    ]
    return canvas.create_polygon(points, smooth=True, **kwargs)

shapes = {}
labels = {}

symbols = {
    "Up": "▲",
    "Down": "▼",
    "Left": "◀",
    "Right": "▶",
    "Pause": "Pause",
    "OK": "OK",
    "Back": "BACK",
}

for name, (x1, y1, x2, y2) in buttons.items():
    shapes[name] = rounded_rect(
        x1, y1, x2, y2, radius=12,
        fill=NORMAL, outline=OUTLINE, width=2
    )
    labels[name] = canvas.create_text(
        (x1 + x2) / 2, (y1 + y2) / 2,
        text=symbols[name],
        fill=TEXT,
        font=("Segoe UI", 17 if name not in ("Back", "Pause") else 13, "bold")
    )

# Drag the overlay with the right mouse button.
drag = {"x": 0, "y": 0}

def start_drag(event):
    drag["x"] = event.x_root - root.winfo_x()
    drag["y"] = event.y_root - root.winfo_y()

def move_drag(event):
    root.geometry(f"+{event.x_root - drag['x']}+{event.y_root - drag['y']}")

canvas.bind("<Button-3>", start_drag)
canvas.bind("<B3-Motion>", move_drag)

canvas.create_text(
    135, 316, text="TIZEN 4.0 REMOTE", fill=MUTED,
    font=("Segoe UI", 8, "bold")
)
canvas.create_text(
    135, 333, text="Right-click + drag to move", fill=MUTED,
    font=("Segoe UI", 7)
)

# F9 toggles visibility; F10 closes the overlay.
def hotkey_action():
    if user32.GetAsyncKeyState(0x78) & 0x8000:  # F9
        if not getattr(root, "_f9_was_down", False):
            if root.state() == "withdrawn":
                root.deiconify()
            else:
                root.withdraw()
        root._f9_was_down = True
    else:
        root._f9_was_down = False

    if user32.GetAsyncKeyState(0x79) & 0x8000:  # F10
        root.destroy()
        return

    root.after(35, hotkey_action)

def update_buttons():
    for name, vk_code in KEYS.items():
        is_down = bool(user32.GetAsyncKeyState(vk_code) & 0x8000)
        canvas.itemconfigure(
            shapes[name],
            fill=ACTIVE if is_down else NORMAL,
            outline=ACTIVE if is_down else OUTLINE
        )
    root.after(15, update_buttons)

update_buttons()
hotkey_action()
root.mainloop()
