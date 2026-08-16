import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# Core Color Palette (matching HTML CSS)
DARK_BLUE = RGBColor(26, 54, 93)      # #1a365d (deep navy blue for Title/Thank You)
BLUE = RGBColor(37, 99, 235)          # #2563eb (accent blue)
WHITE = RGBColor(255, 255, 255)       # #ffffff
DARK_TEXT = RGBColor(26, 32, 44)      # #1a202c
GRAY_TEXT = RGBColor(74, 85, 104)     # #4a5568
LIGHT_GRAY = RGBColor(240, 244, 248)  # #f0f4f8 (slide background / card labels)
BORDER_GRAY = RGBColor(226, 232, 240) # #e2e8f0

# Highlight Colors
GREEN = RGBColor(16, 185, 129)        # #10b981
ORANGE = RGBColor(245, 158, 11)       # #f59e0b

IMG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'project picture')

def add_dark_bg(slide):
    """Add solid deep navy background (like HTML title/thank you slides)"""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = DARK_BLUE

def add_light_bg(slide):
    """Add light gray background (matching HTML secondary background)"""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = LIGHT_GRAY

def add_content_card(slide, left, top, width, height, bg_color=WHITE, border_color=BORDER_GRAY):
    """Add rounded rectangle card shape matching HTML CSS cards"""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)
    card.adjustments[0] = 0.04  # Sleek, soft rounded corners (matching border-radius: 12px)
    return card

def add_title_bar(slide, title_text, icon="", slide_num=""):
    """Add consistent clean top header bar matching slides.html"""
    # Title textbox
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(8.5), Inches(0.6))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
    p = tf.paragraphs[0]
    run = p.add_run()
    run.text = title_text
    run.font.size = Pt(26)
    run.font.bold = True
    run.font.color.rgb = DARK_TEXT
    run.font.name = "Outfit"

    # Bottom border line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.95), Inches(9), Emu(36000))
    line.fill.solid()
    line.fill.fore_color.rgb = BLUE
    line.line.fill.background()

    # Slide number
    if slide_num:
        num_box = slide.shapes.add_textbox(Inches(8.8), Inches(0.4), Inches(0.8), Inches(0.4))
        tf2 = num_box.text_frame
        tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0)
        p2 = tf2.paragraphs[0]
        p2.alignment = PP_ALIGN.RIGHT
        run2 = p2.add_run()
        run2.text = slide_num
        run2.font.size = Pt(12)
        run2.font.color.rgb = GRAY_TEXT
        run2.font.name = "Inter"

def add_description(slide, text, top=Inches(1.1)):
    """Add description text below header"""
    desc_box = slide.shapes.add_textbox(Inches(0.5), top, Inches(9), Inches(0.5))
    tf = desc_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
    p = tf.paragraphs[0]
    run = p.add_run()
    run.text = text
    run.font.size = Pt(13)
    run.font.color.rgb = GRAY_TEXT
    run.font.name = "Inter"

def add_bullet_points(slide, points, left, top, width, height, font_size=12, color=GRAY_TEXT, use_checkmark=True):
    """Add styled bullet points with custom symbols"""
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
    for i, point in enumerate(points):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(6)
        
        if use_checkmark:
            run_bullet = p.add_run()
            run_bullet.text = "✓  "
            run_bullet.font.bold = True
            run_bullet.font.color.rgb = GREEN
            run_bullet.font.size = Pt(font_size)
            run_bullet.font.name = "Inter"
            
        run = p.add_run()
        run.text = point
        run.font.size = Pt(font_size)
        run.font.color.rgb = color
        run.font.name = "Inter"

def add_image_safe(slide, img_name, left, top, width=None, height=None):
    """Add image with standard thin border"""
    img_path = os.path.join(IMG_DIR, img_name)
    if os.path.exists(img_path):
        kwargs = {'image_file': img_path, 'left': left, 'top': top}
        if width: kwargs['width'] = width
        if height: kwargs['height'] = height
        pic = slide.shapes.add_picture(**kwargs)
        
        # Add thin elegant border around screenshots (like HTML cards)
        pic.line.color.rgb = BORDER_GRAY
        pic.line.width = Pt(1)
        return True
    else:
        print(f"[WARN] Image not found: {img_name}")
        return False

def add_screenshot_card(slide, img_name, caption, left, top, width, height, caption_height=Inches(0.5)):
    """Add screenshot card with title/image at top and gray label strip at bottom (matching HTML)"""
    # Card background
    add_content_card(slide, left, top, width, height + caption_height)
    
    # Image
    img_top = top + Inches(0.1)
    img_left = left + Inches(0.1)
    img_width = width - Inches(0.2)
    img_height = height - Inches(0.1)
    add_image_safe(slide, img_name, img_left, img_top, width=img_width, height=img_height)
    
    # Caption container background band at the bottom
    cap_bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top + height, width, caption_height)
    cap_bg.fill.solid()
    cap_bg.fill.fore_color.rgb = LIGHT_GRAY
    cap_bg.line.fill.background()
    
    # Caption text
    cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.08), width, caption_height - Inches(0.1))
    tf = cap_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = caption.upper()
    run.font.size = Pt(10)
    run.font.bold = True
    run.font.color.rgb = GRAY_TEXT
    run.font.name = "Inter"

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    # ===== SLIDE 1: TITLE =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_dark_bg(slide)

    badge_box = slide.shapes.add_textbox(Inches(2), Inches(1.4), Inches(6), Inches(0.4))
    tf = badge_box.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = "SOFTWARE DEVELOPMENT PROJECT 400"
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor(200, 220, 255)
    run.font.name = "Inter"
    run.font.bold = True

    title_box = slide.shapes.add_textbox(Inches(1), Inches(2.0), Inches(8), Inches(1.5))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = "Smart Campus Bus\nTracking System"
    run.font.size = Pt(42)
    run.font.bold = True
    run.font.color.rgb = WHITE
    run.font.name = "Outfit"

    sub_box = slide.shapes.add_textbox(Inches(1.5), Inches(3.7), Inches(7), Inches(0.8))
    tf = sub_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = "A real-time GPS-based bus tracking web application\nfor university campus transportation"
    run.font.size = Pt(16)
    run.font.color.rgb = RGBColor(200, 220, 255)
    run.font.name = "Inter"

    info_items = [
        "Supervisor: Humayra Ahmed, Assistant Professor",
        "Intake 51 | Section 3",
        "",
        "Md Arif Khan  |  Karnia Binte Rafique  |  Suraiya Karim",
        "Prosenjit Biswas  |  Proshanta Saha"
    ]
    info_box = slide.shapes.add_textbox(Inches(1.5), Inches(4.8), Inches(7), Inches(2.5))
    tf = info_box.text_frame
    tf.word_wrap = True
    for i, item in enumerate(info_items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.CENTER
        p.space_after = Pt(3)
        run = p.add_run()
        run.text = item
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(180, 200, 230)
        run.font.name = "Inter"
        if i == 0:
            run.font.bold = True

    # ===== SLIDE 2: PROBLEM & SOLUTION =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Problem Statement & Our Solution", "", "02")

    # Problem box card
    add_content_card(slide, Inches(0.5), Inches(1.3), Inches(4.3), Inches(2.6), bg_color=RGBColor(255, 251, 235), border_color=RGBColor(253, 230, 138))
    ptitle = slide.shapes.add_textbox(Inches(0.7), Inches(1.4), Inches(3.9), Inches(0.4))
    run = ptitle.text_frame.paragraphs[0].add_run()
    run.text = "The Problem"
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = DARK_TEXT
    run.font.name = "Outfit"

    add_bullet_points(slide, [
        "Students have no idea where the campus bus is",
        "No real-time location tracking or ETA info",
        "No centralized schedule or route system",
        "No communication channel between riders",
        "Admin has zero fleet visibility or analytics"
    ], Inches(0.7), Inches(1.85), Inches(3.9), Inches(1.9), font_size=11, color=GRAY_TEXT, use_checkmark=False)

    # Solution box card
    add_content_card(slide, Inches(0.5), Inches(4.1), Inches(4.3), Inches(3.0), bg_color=RGBColor(236, 253, 245), border_color=RGBColor(167, 243, 208))
    stitle = slide.shapes.add_textbox(Inches(0.7), Inches(4.2), Inches(3.9), Inches(0.4))
    run = stitle.text_frame.paragraphs[0].add_run()
    run.text = "Our Solution — SmartBus"
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = DARK_TEXT
    run.font.name = "Outfit"

    add_bullet_points(slide, [
        "Live GPS tracking with interactive map & ETA",
        "Haversine formula for distance calculation",
        "3 roles: Student, Driver, Admin",
        "Bus-wise group chat (Firebase Firestore)",
        "Full admin dashboard with analytics",
        "Bilingual support (English & বাংলা)",
        "Push notifications for trip events"
    ], Inches(0.7), Inches(4.65), Inches(3.9), Inches(2.3), font_size=11, color=GRAY_TEXT, use_checkmark=True)

    add_image_safe(slide, "Screenshot 2026-08-16 110344.png", Inches(5.1), Inches(1.3), width=Inches(4.4))

    # ===== SLIDE 3: LANDING PAGE =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Landing Page & Role Selection", "", "03")
    add_screenshot_card(slide, "Screenshot 2026-08-16 110407.png", "Feature Highlights & How It Works", Inches(0.5), Inches(1.3), Inches(4.3), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 110246.png", "Role Selection — Student / Driver / Admin", Inches(5.2), Inches(1.3), Inches(4.3), Inches(5.0))

    # ===== SLIDE 4: ONBOARDING =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Onboarding & Multi-Role Access", "", "04")
    add_description(slide, "Three-step onboarding: Pick your role > Sign up > Start moving. Custom features for each user type.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 110420.png", "Onboarding & Role System Guide", Inches(0.5), Inches(1.7), Inches(9.0), Inches(4.8))

    # ===== SLIDE 5: STUDENT LOGIN & REGISTRATION =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Student Login & Registration", "", "05")
    add_description(slide, "Secure OTP email verification via Brevo API. JWT bearer tokens. Badges for user roles.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 110301.png", "Student Login (Dark Mode)", Inches(0.5), Inches(1.7), Inches(4.3), Inches(4.8))
    add_screenshot_card(slide, "Screenshot 2026-08-16 110319.png", "Student Registration", Inches(5.2), Inches(1.7), Inches(4.3), Inches(4.8))

    # ===== SLIDE 6: STUDENT DASHBOARD =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Student Dashboard", "", "06")
    add_description(slide, "Personalized welcome portal, real-time stats, and sidebar navigation controls.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 105144.png", "Student Portal Dashboard with Real-Time Stats", Inches(0.5), Inches(1.7), Inches(9.0), Inches(4.8))

    # ===== SLIDE 7: LIVE GPS TRACKING =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Real-Time GPS Bus Tracking", "", "07")
    add_description(slide, "Live Leaflet map. Position updates every 5s. Haversine distance engine. Shows stops and ETA.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 105418.png", "Live Map Bus Tracking with ETA & Distance Calculations", Inches(0.5), Inches(1.7), Inches(9.0), Inches(4.8))

    # ===== SLIDE 8: AVAILABLE BUSES & NOTIFICATIONS =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Available Buses & Push Notifications", "", "08")
    add_description(slide, "View status of all active buses. Real-time push notifications for trip events.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 105133.png", "Available Buses List", Inches(0.5), Inches(1.7), Inches(6.0), Inches(4.8))
    add_screenshot_card(slide, "Screenshot 2026-08-16 105153.png", "Real-Time Notifications Panel", Inches(7.0), Inches(1.7), Inches(2.5), Inches(4.8))

    # ===== SLIDE 9: STUDENT ROUTES & SCHEDULES =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Student: Routes & Schedules", "", "09")
    add_screenshot_card(slide, "Screenshot 2026-08-16 105122.png", "Routes & Stops (Student View)", Inches(0.5), Inches(1.3), Inches(4.3), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 105106.png", "Schedules & Departure Times (Student View)", Inches(5.2), Inches(1.3), Inches(4.3), Inches(5.0))

    # ===== SLIDE 10: STUDENT ANNOUNCEMENTS & SETTINGS =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Student: Announcements & Settings", "", "10")
    add_screenshot_card(slide, "Screenshot 2026-08-16 105057.png", "Campus Announcements & Notices", Inches(0.5), Inches(1.3), Inches(4.3), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 105046.png", "Student Profile & Security Settings", Inches(5.2), Inches(1.3), Inches(4.3), Inches(5.0))

    # ===== SLIDE 11: BUS CHAT =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Bus-Wise Group Chat", "", "11")
    add_description(slide, "Firebase Firestore real-time group chat by bus. Messages with timestamps and read receipts.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 110042.png", "Bus Chat - Student View", Inches(0.5), Inches(1.7), Inches(4.3), Inches(4.8))
    add_screenshot_card(slide, "Screenshot 2026-08-16 110050.png", "Bus Chat - Driver View", Inches(5.2), Inches(1.7), Inches(4.3), Inches(4.8))

    # ===== SLIDE 12: REPORT SYSTEM =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Report Management System", "", "12")
    add_description(slide, "Categorized reporting workflow (Bug, Driver behavior, Bus issue). Admin reply view.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 104456.png", "Submit Report to Admin", Inches(0.5), Inches(1.7), Inches(4.3), Inches(4.8))
    add_screenshot_card(slide, "Screenshot 2026-08-16 105036.png", "Previous Reports & Admin Responses", Inches(5.2), Inches(1.7), Inches(4.3), Inches(4.8))

    # ===== SLIDE 13: ADMIN REPORTS =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Admin: Student Reports Dashboard", "", "13")
    add_screenshot_card(slide, "Screenshot 2026-08-16 104738.png", "Admin Reports List & Status Management", Inches(0.5), Inches(1.3), Inches(5.8), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 104110.png", "Report Topic Selection Categories", Inches(6.6), Inches(1.5), Inches(2.9), Inches(4.8))

    # ===== SLIDE 14: DRIVER DASHBOARD =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Driver Dashboard & Trip Controls", "", "14")
    add_description(slide, "Bilingual interface. START button, GPS location broadcaster, and STOP/DELAY alerts.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 104822.png", "Driver Dashboard - Ready State", Inches(0.5), Inches(1.7), Inches(4.3), Inches(4.8))
    add_screenshot_card(slide, "Screenshot 2026-08-16 104846.png", "Driver Settings (Bangla Interface)", Inches(5.2), Inches(1.7), Inches(4.3), Inches(4.8))

    # ===== SLIDE 15: DRIVER MOBILE =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Driver Mobile Experience - Responsive", "", "15")
    add_description(slide, "Mobile-first layouts: Onboarding > Setup Trip > GPS Connecting > Live Trip Active.")
    add_screenshot_card(slide, "WhatsApp Image 2026-08-16 at 10.55.42 AM.jpeg", "Ready State", Inches(0.4), Inches(1.7), Inches(1.7), Inches(4.5))
    add_screenshot_card(slide, "WhatsApp Image 2026-08-16 at 10.55.42 AM (1).jpeg", "Setup Trip", Inches(2.2), Inches(1.7), Inches(1.7), Inches(4.5))
    add_screenshot_card(slide, "WhatsApp Image 2026-08-16 at 10.55.43 AM.jpeg", "GPS Connecting", Inches(4.0), Inches(1.7), Inches(1.7), Inches(4.5))
    add_screenshot_card(slide, "WhatsApp Image 2026-08-16 at 10.55.43 AM (1).jpeg", "Active (EN)", Inches(5.8), Inches(1.7), Inches(1.7), Inches(4.5))
    add_screenshot_card(slide, "WhatsApp Image 2026-08-16 at 10.56.11 AM.jpeg", "Active (BN)", Inches(7.6), Inches(1.7), Inches(1.7), Inches(4.5))

    # ===== SLIDE 16: ADMIN USER MANAGEMENT =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Admin: User Management Dashboard", "", "16")
    add_description(slide, "Total User lists, promotion systems, search filters, and block/unblock actions.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 101700.png", "Admin Panel - Student, Driver, and Co-Admin Users List", Inches(0.5), Inches(1.7), Inches(9.0), Inches(4.8))

    # ===== SLIDE 17: ADMIN & DRIVER APPROVALS =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Admin: Co-Admin & Driver Approvals", "", "17")
    add_screenshot_card(slide, "Screenshot 2026-08-16 101839.png", "Co-Admin Permissions & Access Management", Inches(0.5), Inches(1.3), Inches(4.3), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 102136.png", "Driver Registration Application Review", Inches(5.2), Inches(1.3), Inches(4.3), Inches(5.0))

    # ===== SLIDE 18: BUS & ROUTE MANAGEMENT =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Admin: Bus & Route Management", "", "18")
    add_screenshot_card(slide, "Screenshot 2026-08-16 102304.png", "Bus Fleet Management", Inches(0.5), Inches(1.3), Inches(4.3), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 103430.png", "Routes & Stoppages Management", Inches(5.2), Inches(1.3), Inches(4.3), Inches(5.0))

    # ===== SLIDE 19: MAP ROUTE BUILDER =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Interactive Map Route Builder", "", "19")
    add_description(slide, "Interactive map picker utilizing Leaflet + OpenStreetMap coordinates sequence builder.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 103443.png", "Interactive Leaflet Map - Coordinate Selection & Stop Sequencing", Inches(2.2), Inches(1.7), Inches(5.6), Inches(4.8))

    # ===== SLIDE 20: SCHEDULE & ANNOUNCEMENTS =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Admin: Schedule & Announcements", "", "20")
    add_screenshot_card(slide, "Screenshot 2026-08-16 103643.png", "Schedules & Assignments Management", Inches(0.5), Inches(1.3), Inches(3.6), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 103459.png", "Add Schedule Modal Window", Inches(4.3), Inches(1.3), Inches(2.4), Inches(5.0))
    add_screenshot_card(slide, "Screenshot 2026-08-16 103851.png", "Broadcast Notices & Urgencies Panel", Inches(6.9), Inches(1.3), Inches(2.6), Inches(5.0))

    # ===== SLIDE 21: ANALYTICS =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Admin: Analytics Dashboard", "", "21")
    add_description(slide, "Charts powered by Chart.js showing role distributions and driver status analytics.")
    add_screenshot_card(slide, "Screenshot 2026-08-16 103910.png", "Admin Charts - User Roles Distribution & Active Driver Status", Inches(0.5), Inches(1.7), Inches(9.0), Inches(4.8))

    # ===== SLIDE 22: TECH STACK =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "Technology Stack & Architecture", "", "22")

    tech_items = [
        ("Frontend", "HTML, CSS, JavaScript (Vanilla UI)"),
        ("Backend API", "ASP.NET Core (C# .NET 8)"),
        ("Real-Time Data", "Firebase Cloud Firestore"),
        ("Interactive Maps", "Leaflet.js + OpenStreetMap"),
        ("Authentication", "JWT + Email OTP Security"),
        ("Notifications", "Brevo SMTP & Sendinblue API"),
        ("Visualizations", "Chart.js Analytics Charts"),
        ("Deployment", "Vercel Frontend + Cloud API"),
    ]

    for i, (name, desc) in enumerate(tech_items):
        col = i % 4
        row = i // 4
        x = Inches(0.5 + col * 2.3)
        y = Inches(1.3 + row * 1.5)

        # Card
        add_content_card(slide, x, y, Inches(2.1), Inches(1.2))

        # Title
        name_box = slide.shapes.add_textbox(x + Inches(0.1), y + Inches(0.15), Inches(1.9), Inches(0.35))
        tf = name_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = name
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = DARK_TEXT
        run.font.name = "Outfit"

        # Desc
        desc_box = slide.shapes.add_textbox(x + Inches(0.1), y + Inches(0.5), Inches(1.9), Inches(0.6))
        tf2 = desc_box.text_frame
        tf2.word_wrap = True
        tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0)
        p2 = tf2.paragraphs[0]
        p2.alignment = PP_ALIGN.CENTER
        run2 = p2.add_run()
        run2.text = desc
        run2.font.size = Pt(10)
        run2.font.color.rgb = GRAY_TEXT
        run2.font.name = "Inter"

    # Architecture boxes (exactly matching slides.html colors & design)
    arch_items = [
        ("Frontend Layer", "HTML, CSS, JS, Leaflet.js", Inches(0.8), Inches(4.6), RGBColor(239, 246, 255), BLUE),
        ("Backend API", "ASP.NET Core, JWT, Haversine", Inches(3.8), Inches(4.6), RGBColor(236, 253, 245), GREEN),
        ("Data Layer", "Firebase Firestore, Brevo SMTP", Inches(6.8), Inches(4.6), RGBColor(255, 251, 235), ORANGE),
    ]
    for label, tech, x, y, fill_color, border_color in arch_items:
        add_content_card(slide, x, y, Inches(2.6), Inches(1.2), bg_color=fill_color, border_color=border_color)

        lb = slide.shapes.add_textbox(x + Inches(0.1), y + Inches(0.15), Inches(2.4), Inches(0.3))
        tf = lb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = label
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = DARK_TEXT
        run.font.name = "Outfit"

        tb = slide.shapes.add_textbox(x + Inches(0.1), y + Inches(0.5), Inches(2.4), Inches(0.6))
        tf2 = tb.text_frame
        tf2.word_wrap = True
        tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0)
        p2 = tf2.paragraphs[0]
        p2.alignment = PP_ALIGN.CENTER
        run2 = p2.add_run()
        run2.text = tech
        run2.font.size = Pt(11)
        run2.font.color.rgb = GRAY_TEXT
        run2.font.name = "Inter"

    # Arrow connector labels
    arr_box = slide.shapes.add_textbox(Inches(0.5), Inches(6.0), Inches(9.0), Inches(0.4))
    tf_arr = arr_box.text_frame
    p_arr = tf_arr.paragraphs[0]
    p_arr.alignment = PP_ALIGN.CENTER
    run_arr = p_arr.add_run()
    run_arr.text = "FRONTEND  ↔  REST API + WEBSOCKET  ↔  BACKEND API  ↔  DATA/SERVICES"
    run_arr.font.size = Pt(9)
    run_arr.font.bold = True
    run_arr.font.color.rgb = GRAY_TEXT
    run_arr.font.name = "Inter"

    # ===== SLIDE 23: WHAT MAKES US DIFFERENT =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_light_bg(slide)
    add_title_bar(slide, "What Makes SmartBus Different", "", "23")

    diff_items = [
        ("Haversine Formula ETA", "Accurate distance & arrival using real GPS lat/lng coordinates.", RGBColor(236, 253, 245), GREEN),
        ("Bus-Wise Group Chat", "Firebase Firestore real-time group chat grouped by active bus.", RGBColor(239, 246, 255), BLUE),
        ("Bilingual (EN/Bangla)", "Full interface localization for student and driver accessibility.", RGBColor(255, 251, 235), ORANGE),
        ("Push Notifications", "Instant real-time notifications for trip start, delay and completion.", RGBColor(239, 246, 255), BLUE),
        ("Admin Analytics", "Interactive Chart.js visual dashboard showing data-driven metrics.", RGBColor(236, 253, 245), GREEN),
        ("Report Workflow", "Categorized reports with direct admin response and status tracking pipeline.", RGBColor(255, 251, 235), ORANGE),
    ]

    for i, (title, desc, bg, border) in enumerate(diff_items):
        col = i % 2
        row = i // 2
        x = Inches(0.5 + col * 4.8)
        y = Inches(1.3 + row * 1.9)

        add_content_card(slide, x, y, Inches(4.5), Inches(1.6), bg_color=bg, border_color=border)

        ttl = slide.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), Inches(4.1), Inches(0.4))
        tf = ttl.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0)
        run = tf.paragraphs[0].add_run()
        run.text = title
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = DARK_TEXT
        run.font.name = "Outfit"

        dsc = slide.shapes.add_textbox(x + Inches(0.2), y + Inches(0.65), Inches(4.1), Inches(0.8))
        tf2 = dsc.text_frame
        tf2.word_wrap = True
        tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0)
        run2 = tf2.paragraphs[0].add_run()
        run2.text = desc
        run2.font.size = Pt(12)
        run2.font.color.rgb = GRAY_TEXT
        run2.font.name = "Inter"

    # ===== SLIDE 24: THANK YOU =====
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_dark_bg(slide)

    ty_box = slide.shapes.add_textbox(Inches(1), Inches(2.2), Inches(8), Inches(1))
    tf = ty_box.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = "Thank You!"
    run.font.size = Pt(48)
    run.font.bold = True
    run.font.color.rgb = WHITE
    run.font.name = "Outfit"

    sub_box = slide.shapes.add_textbox(Inches(2), Inches(3.3), Inches(6), Inches(0.6))
    tf = sub_box.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = "Smart Campus Bus Tracking System"
    run.font.size = Pt(20)
    run.font.color.rgb = RGBColor(200, 220, 255)
    run.font.name = "Inter"

    info_lines = [
        "Software Development Project 400",
        "Intake 51 | Section 3",
        "Supervised by Humayra Ahmed, Assistant Professor",
        "",
        "Md Arif Khan  |  Karnia Binte Rafique  |  Suraiya Karim",
        "Prosenjit Biswas  |  Proshanta Saha",
        "",
        "Questions & Feedback Welcome!"
    ]
    info_box = slide.shapes.add_textbox(Inches(1.5), Inches(4.2), Inches(7), Inches(3))
    tf = info_box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(info_lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.CENTER
        p.space_after = Pt(4)
        run = p.add_run()
        run.text = line
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(180, 200, 230)
        run.font.name = "Inter"

    # Save
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Smart_Campus_Bus_Tracking_System.pptx')
    prs.save(output_path)
    print(f"[OK] Presentation saved to: {output_path}")
    print(f"[INFO] Total slides: {len(prs.slides)}")

if __name__ == '__main__':
    create_presentation()
