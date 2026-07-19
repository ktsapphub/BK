"""
Seed script: populates the CMS with Bretton J. Key's REAL content extracted
from his resume + old personal site, plus clearly-marked draft placeholders
for testimonials (kept unverified per spec so nothing fake renders publicly)
and stock imagery placeholders (to be replaced later via the media library).

Run with: python scripts/seed_content.py
Idempotent-ish: clears existing content collections before reseeding.
"""
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_URL = "http://localhost:8001/api"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    raise SystemExit(
        "ADMIN_EMAIL / ADMIN_PASSWORD not set. Add them to backend/.env before running this script."
    )

# ---------------------------------------------------------------------------
# Stock imagery placeholders (Unsplash) - replace later via CMS media library
# ---------------------------------------------------------------------------
IMG_HERO_PORTRAIT = "https://images.unsplash.com/photo-1616805765352-beedbad46b2a?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_INTRO_PORTRAIT = "https://images.unsplash.com/photo-1617244147299-5ef406921c35?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_FOUNDER_JAR = "https://images.unsplash.com/photo-1640622789977-a60b46992a97?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_FOUNDER_SKETCH = "https://images.unsplash.com/photo-1531346878377-a5be20888e57?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_FOUNDER_APP = "https://images.unsplash.com/photo-1643639779491-96c7cf18b762?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_SERVICES = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_PERSONAL = "https://images.unsplash.com/photo-1648221350871-e3ae3c8d0f58?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_IMPACT_SPEAKING = "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_GALLERY_CORRIDOR = "https://images.unsplash.com/photo-1761403889267-d84d181db828?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_GALLERY_VETERAN = "https://images.unsplash.com/photo-1682623763188-804d15be0267?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_GALLERY_NORFOLK = "https://images.unsplash.com/photo-1748381837257-9d6a3b53122f?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_GALLERY_NOTEBOOK = "https://images.unsplash.com/photo-1623697899811-f2403f50685e?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_PROJECT_DATEJAR = "https://images.unsplash.com/photo-1643639779309-1ae5675511ae?crop=entropy&cs=srgb&fm=jpg&q=85"
IMG_PROJECT_KEYTECH = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=srgb&fm=jpg&q=85"

session = requests.Session()


def login():
    r = session.post(f"{BASE_URL}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    r.raise_for_status()
    token = r.json()["token"]
    session.headers.update({"Authorization": f"Bearer {token}"})
    print("Logged in as admin.")


def wipe_content():
    from pymongo import MongoClient
    c = MongoClient("mongodb://localhost:27017")
    db = c["test_database"]
    for coll in ["sections", "career_entries", "testimonials", "projects", "services",
                 "thoughts", "impact_items", "navigation_items", "content_versions"]:
        db[coll].delete_many({})
    print("Wiped existing content collections.")


def get_home_page_id():
    r = session.get(f"{BASE_URL}/admin/pages")
    r.raise_for_status()
    pages = r.json()
    home = next((p for p in pages if p["slug"] == "home"), None)
    if not home:
        r = session.post(f"{BASE_URL}/admin/pages", json={"slug": "home", "title": "Home", "is_published": True})
        home = r.json()
    return home["id"]


def create_section(page_id, section_type, internal_name, nav_label, order, theme, transition, content):
    body = {
        "page_id": page_id,
        "section_type": section_type,
        "internal_name": internal_name,
        "navigation_label": nav_label,
        "display_order": order,
        "is_visible": True,
        "status": "published",
        "theme": theme,
        "transition_style": transition,
        "content": content,
    }
    r = session.post(f"{BASE_URL}/admin/sections", json=body)
    r.raise_for_status()
    print(f"Created section: {internal_name}")
    return r.json()


def create_career_entry(**kwargs):
    r = session.post(f"{BASE_URL}/admin/career-entries", json=kwargs)
    r.raise_for_status()
    return r.json()


def create_project(**kwargs):
    r = session.post(f"{BASE_URL}/admin/projects", json=kwargs)
    r.raise_for_status()
    return r.json()


def create_service(**kwargs):
    r = session.post(f"{BASE_URL}/admin/services", json=kwargs)
    r.raise_for_status()
    return r.json()


def create_thought(**kwargs):
    r = session.post(f"{BASE_URL}/admin/thoughts", json=kwargs)
    r.raise_for_status()
    return r.json()


def create_impact(**kwargs):
    r = session.post(f"{BASE_URL}/admin/impact-items", json=kwargs)
    r.raise_for_status()
    return r.json()


def create_testimonial(**kwargs):
    r = session.post(f"{BASE_URL}/admin/testimonials", json=kwargs)
    r.raise_for_status()
    return r.json()


def main():
    login()
    wipe_content()
    page_id = get_home_page_id()

    # -------------------------------------------------------------- HERO
    create_section(page_id, "hero", "Home Hero", "Home", 1, "deep_royal_blue", "mask-reveal", {
        "eyebrow": "Twenty Years in Motion",
        "heading": "Bretton J. Key",
        "rotating_words": ["Delivery Leader", "Product Owner", "Builder", "Veteran", "Father"],
        "subheading": "PMP-certified delivery leader turning 20+ years of mission-critical experience into shipped outcomes — for the Pentagon, NATO, and the ventures he builds himself.",
        "bg_image_url": IMG_HERO_PORTRAIT,
        "primary_cta": {"label": "See the Work", "href": "projects"},
        "secondary_cta": {"label": "Let's Talk", "href": "https://calendly.com/bretton-j-key"},
        "alignment": "left",
        "availability_badge": "Open to select engagements",
    })

    # -------------------------------------------------------- INTRODUCTION
    create_section(page_id, "introduction", "Introduction", "Introduction", 2, "true_white", "fade", {
        "portrait_url": IMG_INTRO_PORTRAIT,
        "heading": "Allow Me to Introduce Myself",
        "body": "Hi, I'm Bretton Key — a person passionate about leveraging technology, finding solutions, and helping others win in their endeavors. For nearly 20 years I've led projects and teams across the Pentagon, NATO, and the private sector, always looking for ways to simplify the complex and deliver what matters.",
        "identity_words": ["Norfolk Native", "Super Nerd", "Father of 3", "Believer"],
        "badge": "PMP Certified",
        "image_position": "right",
        "layout_direction": "ltr",
        "metrics": [
            {"label": "Years Delivering", "value": "20+"},
            {"label": "Projects Led", "value": "35+"},
            {"label": "Value Delivered", "value": "$200M+"},
        ],
    })

    # -------------------------------------------------------------- VALUES
    create_section(page_id, "values", "Values", "Values", 3, "deep_royal_blue", "fade", {
        "heading": "What Drives Me",
        "intro": "Long ago I realized achieving the life you desire takes faith, focus, and a clear sense of purpose.",
        "items": [
            {"title": "Faith", "image": "https://images.unsplash.com/photo-1618255037265-ed4e83cf3323?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "God is good — my commitment to purpose starts here."},
            {"title": "Connection", "image": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "I believe in discovering solutions together, building genuine connection through our unique talents and gifts."},
            {"title": "Service", "image": "https://images.unsplash.com/photo-1461532257246-777de18cd58b?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "What gets me out of bed each day is a deep commitment to personal growth and helping others."},
            {"title": "Growth", "image": "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "I'm committed to continuous growth — pushing myself and everyone around me to learn, adapt, and become better than we were yesterday."},
        ],
    })

    # -------------------------------------------------------------- LOGOS
    logos_orgs = [
        "Pentagon / HQ Air Force", "NATO ACT", "CACI", "HCL Technologies",
        "City of Virginia Beach", "Entrust Government Solutions", "U.S. Air Force Reserves",
        "U.S. Army National Guard", "Engineering Services Network", "Date Jar",
        "KeyTech Solutions",
    ]
    while len(logos_orgs) < 21:
        logos_orgs.append(f"Organization {len(logos_orgs) + 1:02d}")
    create_section(page_id, "logos", "Organizations", "Organizations", 4, "true_white", "fade", {
        "heading": "Trusted Across Mission-Critical Teams",
        "intro": "A sample of the organizations and ventures Bretton has delivered for. Logos to be finalized in the CMS.",
        "items": [{"name": name, "logo_url": None} for name in logos_orgs],
    })

    # -------------------------------------------------------------- RESUME
    create_section(page_id, "resume", "Résumé", "Résumé", 5, "true_white", "fade", {
        "heading": "Career Timeline",
        "intro": "Twenty-plus years leading mission-critical programs — from the Pentagon to NATO to city government.",
    })

    career_entries_data = [
        dict(title="Test Lead Manager / Product Owner", org="Engineering Services Network", location="Chesapeake, VA",
             start_date="2026-03", end_date=None, is_current=True,
             description="Lead test delivery for Naval Maintenance Software, planning and tracking work across the investment and sustainment lifecycle to keep releases on schedule.",
             achievements=[
                 "Drive Agile execution in Jira/Confluence — breaking agreed features into Epics, Stories, and Enablers while managing scope, dependencies, and sprint progress.",
                 "Define and enforce acceptance criteria, coordinating the test team to validate feature readiness before release.",
                 "Produce status reports and brief upper management and government leads on milestones, risks, and corrective actions.",
             ], skills=["Agile", "Scrum", "Jira", "Confluence", "Test Delivery"], display_order=1, is_visible=True),
        dict(title="Information Access Manager", org="HQ Air Force", location="Pentagon, DC",
             start_date="2024-10", end_date="2026-03", is_current=False,
             description="Raised HQ-wide compliance and cleared systems for ATO across eight MAJCOMs under active release schedules.",
             achievements=[
                 "Raised HQ-wide compliance from 82% to 95% in Q1 FY25 by embedding checkpoints in Agile release trains and leading a monthly sync for 90+ installation reps.",
                 "Reviewed 50+ systems quarterly and cleared 200+ artifacts for ATO, shaving two weeks off accreditation timelines via a single integrated assessment flow.",
                 "Advised product owners and cyber teams across eight MAJCOMs, cutting late-stage rework 30% and meeting mission-critical mandates on first pass.",
                 "Authored and published force-wide policy updates, SOPs, and implementation guides under active release schedules.",
             ], skills=["Compliance", "ATO", "Policy", "Agile Governance"], display_order=2, is_visible=True),
        dict(title="Product Owner", org="NATO ACT", location="Norfolk, VA",
             start_date="2024-01", end_date="2024-09", is_current=False,
             description="Led vetting and approval of high-impact innovation projects for NATO Allied Command Transformation.",
             achievements=[
                 "Led vetting and approval of high-impact innovation projects, securing funding and authoring business cases worth hundreds of millions of euros.",
                 "Oversaw transition of MVPs into operational capabilities, strengthening NATO readiness and interoperability with allied forces.",
                 "Built detailed project plans, success criteria, and analytics to support decisions, briefing high-level government officials and stakeholders.",
             ], skills=["Product Ownership", "Business Cases", "NATO Interoperability"], display_order=3, is_visible=True),
        dict(title="Program Manager", org="HCL Technologies", location="New York, NY",
             start_date="2021-10", end_date="2023-12", is_current=False,
             description="Led a global team delivering business-process monitoring and observability projects for industry-specific clients.",
             achievements=[
                 "Led a global team delivering projects valued $1M-$4M, consistently hitting targets within scope and budget.",
                 "Managed a portfolio focused on business-process monitoring and observability for industry-specific clients.",
                 "Developed training and warranty materials and applied data analytics to cut delivery times, improving client satisfaction 25%.",
             ], skills=["Program Management", "Observability", "Client Delivery"], display_order=4, is_visible=True),
        dict(title="IT System Analyst", org="City of Virginia Beach", location="Virginia Beach, VA",
             start_date="2020-10", end_date="2021-10", is_current=False,
             description="Led cross-functional IT, Fire, and Police teams on disaster-recovery operations.",
             achievements=[
                 "Led cross-functional IT, Fire, and Police teams on disaster-recovery operations, achieving a 95% readiness rate.",
                 "Authored and implemented disaster-recovery plans and process improvements, raising operational efficiency 40%.",
                 "Built and presented business cases prioritizing public safety, including systems to monitor high-traffic zones.",
             ], skills=["Disaster Recovery", "Public Safety Systems"], display_order=5, is_visible=True),
        dict(title="Sr. System Analyst", org="Entrust Government Solutions", location="Norfolk, VA",
             start_date="2019-10", end_date="2021-07", is_current=False,
             description="Spearheaded requirement elicitation and software-development strategy across key government projects.",
             achievements=[
                 "Spearheaded requirement elicitation across key projects, achieving an 85% project-acceptance rate.",
                 "Partnered with stakeholders to guide software-development strategy and ensure alignment with business needs.",
                 "Authored acquisition and systems-engineering artifacts — SOPs, CONOPS, DR plans, training — and briefed upper management on status.",
             ], skills=["Requirements Elicitation", "Systems Engineering", "Acquisition"], display_order=6, is_visible=True),
        dict(title="Personnel / Admin", org="U.S. Air Force Reserves", location=None,
             start_date="2013-12", end_date="2025-01", is_current=False,
             description="Managed HR systems and in/out-processing for 750+ personnel across 10 units.",
             achievements=[
                 "Managed HR systems and in/out-processing for 750+ personnel across 10 units, sustaining Wing readiness.",
                 "Delivered career-advisory services that lifted re-enlistment rates 15%.",
             ], skills=["HR Systems", "Career Advising"], display_order=7, is_visible=True),
        dict(title="Communications", org="U.S. Army National Guard", location=None,
             start_date="2007-09", end_date="2013-09", is_current=False,
             description="Operated and maintained NIPR/SIPR communications systems for joint operations.",
             achievements=[
                 "Operated and maintained NIPR/SIPR communications systems for joint operations, ensuring reliable data distribution.",
             ], skills=["NIPR/SIPR", "Joint Operations"], display_order=8, is_visible=True),
    ]
    for entry in career_entries_data:
        create_career_entry(**entry)
    print(f"Created {len(career_entries_data)} career entries.")

    # ---------------------------------------------------- VOICES & IMPACT
    create_section(page_id, "testimonials", "Voices and Impact", "Voices and Impact", 6, "deep_royal_blue", "soft-focus-reveal", {
        "heading": "Voices and Impact",
        "intro": "What colleagues and partners say about working with Bretton.",
    })
    testimonials_data = [
        dict(name="Michael W.", title=None, org=None, relationship=None,
             full_quote="Brett's exceptional leadership, commitment, and expertise have left a lasting impact on our organization. He has consistently proven himself as a dedicated and knowledgeable leader who goes above and beyond to support and nurture the professional development of our Airmen. I have no doubt that he will continue to excel in any future endeavors, and I wholeheartedly recommend him for any leadership or advisory role.",
             verified=True, status="published", display_order=1),
        dict(name="Carolyn K.", title="PMP, ITIL, PMC", org="CACI", relationship="Colleague",
             full_quote="I had the pleasure of partnering with Bretton while working at CACI. He was designated as a leader of one of the process areas. Bretton was willing to take on additional responsibilities and be the leader of that area. He took on the responsibility with zeal and interest and was a key delivery for the CMMI Level 5 assessment. He was a pleasure to work with.",
             verified=True, status="published", display_order=2),
        dict(name="Peter W.", title="PMP", org=None, relationship="Colleague",
             full_quote="Bretton was a most diligent and helpful information technology specialist on our team supporting a NATO client bringing innovation and process to a complex area. His work was very thorough and structured and at the end of the task he made sure to leave a comprehensive set of documentation. Would like to work with him again.",
             verified=True, status="published", display_order=3),
        dict(name="Stefanie M.", title=None, org=None, relationship=None,
             full_quote="Brett's boundless passion fuels his dedication and commitment to any project, and his innovative thinking consistently leads to groundbreaking solutions and advancements. His unique combination of vision, leadership, passion, and innovation makes him an invaluable asset to any team or organization.",
             verified=True, status="published", display_order=4),
    ]
    for t in testimonials_data:
        create_testimonial(**t)
    print(f"Created {len(testimonials_data)} verified testimonials.")

    # ------------------------------------------------------------ SERVICES
    create_section(page_id, "services", "Services", "Services", 7, "deep_royal_blue", "fade", {
        "heading": "How I Can Help",
        "intro": "Through KeyTech Solutions, I bring the same delivery discipline I use on mission-critical programs to organizations of any size.",
    })
    services_data = [
        dict(title="Agile Delivery Leadership",
             description="Is your program stalled, over budget, or losing the confidence of stakeholders? Delivery teams often lose momentum when scope, schedule, and risk aren't managed with discipline — and by the time it's visible, trust has already eroded. I step into stuck or at-risk programs and rebuild the delivery engine so leadership can see real progress again.",
             image_url="https://images.unsplash.com/photo-1568992687947-868a62a9f521?crop=entropy&cs=srgb&fm=jpg&q=85",
             capabilities=[
                 "A clear-eyed audit of what is actually blocking delivery",
                 "A realistic, re-baselined schedule and risk register",
                 "Stakeholder communication rhythms that rebuild trust",
                 "Hands-on coaching for your delivery team through recovery",
             ],
             cta_label="Discuss a Delivery Challenge", cta_href="contact", is_published=True, display_order=1),
        dict(title="Product Ownership & Strategy",
             description="Struggling to turn a big product vision into a backlog your team can actually ship? Too many teams stall between strategy and execution — priorities shift weekly, releases slip, and cross-functional teams pull in different directions. I bring structure that turns ambiguity into a roadmap people can rally around.",
             image_url="https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?crop=entropy&cs=srgb&fm=jpg&q=85",
             capabilities=[
                 "A prioritized roadmap tied to real business outcomes",
                 "A groomed, release-ready backlog",
                 "Cross-functional alignment across eng, design, and stakeholders",
                 "A repeatable release planning cadence",
             ],
             cta_label="Talk Product Strategy", cta_href="contact", is_published=True, display_order=2),
        dict(title="Mentorship & Public Speaking",
             description="Are you a veteran or early-career leader trying to find your footing in project or product management? Breaking into delivery leadership can feel like an uphill climb without someone who has walked the path. I offer direct mentorship and speak at conferences and panels to help others translate discipline and experience into career growth.",
             image_url="https://images.pexels.com/photos/8761514/pexels-photo-8761514.jpeg",
             capabilities=[
                 "One-on-one career mentorship sessions",
                 "Practical guidance translating military/ops experience into PM careers",
                 "Conference, panel, and workshop speaking engagements",
                 "An honest sounding board for career decisions",
             ],
             cta_label="Book a Session", cta_href="contact", is_published=True, display_order=3),
        dict(title="Tech Solutions, Built Around You",
             description="I simplify the process of creating technology solutions by helping you clarify your vision, explore proven platforms, and map out a custom solution built around your goals.",
             image_url="https://images.unsplash.com/photo-1498050108023-c5249f4df085?crop=entropy&cs=srgb&fm=jpg&q=85",
             capabilities=[
                 "A clarified vision and requirements you can act on",
                 "An evaluation of proven platforms and tools that fit your goals",
                 "A custom solution roadmap built around your budget and timeline",
                 "Ongoing guidance as your solution takes shape",
             ],
             cta_label="Map Out a Solution", cta_href="contact", is_published=True, display_order=4),
    ]
    for s in services_data:
        create_service(**s)
    print(f"Created {len(services_data)} services.")

    # ----------------------------------------------------------- PROJECTS
    create_section(page_id, "projects", "Projects", "Projects", 8, "true_white", "slide", {
        "heading": "Solutions",
        "intro": "A mix of mission-critical delivery and independent ventures.",
    })
    projects_data = [
        dict(title="Date Jar", slug="date-jar", category="Consumer App / Founder",
             summary="An app that turns 'what should we do tonight?' into a two-minute decision for couples and singles alike. Planning meaningful time together often stalls at the decision stage, so Date Jar packages curated date ideas into a simple pick-and-go experience. It's live on app stores today, conceived, designed, and shipped independently.",
             problem="Planning meaningful time together often stalls at the decision-making stage — too many options, not enough momentum.",
             solution="Date Jar packages curated date ideas into a simple pick-and-go experience, removing decision fatigue from spontaneity.",
             role="Founder / Product Lead",
             technologies=["Mobile App", "Product Design", "Growth"],
             features=["Curated date idea decks", "Instant adventure generator", "Save & share favorites"],
             outcomes=["Live on app stores", "Independent venture conceived, designed, and shipped solo"],
             status="Live", thumbnail_url=IMG_PROJECT_DATEJAR, live_url="https://mydatejar.com/",
             featured=True, available_for_inquiry=False, is_published=True, display_order=1),
        dict(title="KeyTech Solutions", slug="keytech-solutions", category="IT & Delivery Consulting",
             summary="Independent consulting practice bringing federal-grade Agile delivery discipline to organizations of any size. Many teams struggle to translate strategy into shippable, well-governed technical delivery — KeyTech applies 20 years of program leadership across scope, schedule, risk, and stakeholders to help them ship reliably. Multiple engagements delivered on schedule and within budget.",
             problem="Many organizations struggle to translate strategy into shippable, well-governed technical delivery.",
             solution="KeyTech Solutions applies 20 years of Agile program leadership — scope, schedule, risk, stakeholders — to help teams ship reliably.",
             role="Founder / Principal Consultant",
             technologies=["Agile/Scrum", "Jira/Confluence", "Process Design"],
             features=["Delivery audits", "Agile coaching", "Program stand-up & recovery"],
             outcomes=["Multiple engagements delivered on schedule and within budget"],
             status="Live", thumbnail_url=IMG_PROJECT_KEYTECH,
             featured=True, available_for_inquiry=True, is_published=True, display_order=2),
        dict(title="Independent App Ventures", slug="independent-app-ventures", category="Product / Concept",
             summary="Additional app concepts exploring practical tools for everyday life, currently in development.",
             role="Founder", status="In Development",
             featured=False, available_for_inquiry=False, is_published=False, display_order=3),
    ]
    placeholder_project_images = [
        "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?crop=entropy&cs=srgb&fm=jpg&q=85",
        "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?crop=entropy&cs=srgb&fm=jpg&q=85",
        "https://images.unsplash.com/photo-1490093158370-1a6be674437b?crop=entropy&cs=srgb&fm=jpg&q=85",
        "https://images.unsplash.com/photo-1689443111130-6e9c7dfd8f9e?crop=entropy&cs=srgb&fm=jpg&q=85",
        "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?crop=entropy&cs=srgb&fm=jpg&q=85",
    ]
    for i in range(5):
        projects_data.append(dict(
            title=f"New Venture {i + 1:02d}", slug=f"new-venture-{i + 1:02d}", category="Concept",
            summary="Placeholder — details coming soon. Update this project with real content via the Admin CMS.",
            role="Founder", status="Concept", thumbnail_url=placeholder_project_images[i],
            featured=False, available_for_inquiry=False, is_published=True, display_order=4 + i,
        ))
    for p in projects_data:
        create_project(**p)
    print(f"Created {len(projects_data)} projects.")

    # ------------------------------------------------------------- THOUGHTS
    create_section(page_id, "thoughts", "Thoughts", "Thoughts", 9, "true_white", "fade", {
        "heading": "Thoughts",
        "intro": "Notes on delivery, leadership, and building things that ship.",
    })

    # ------------------------------------------------------------- IMPACT
    create_section(page_id, "impact", "Media & Impact", "In the Field", 10, "deep_royal_blue", "fade", {
        "heading": "Where You May Have Seen Me",
        "intro": "Press features, podcast conversations, and broadcast appearances covering my ventures and career.",
    })
    impact_data = [
        # ---- Features (digital publications) ----
        dict(category="Feature", title="The Elevator Pitch: My Date Jar Featured in StartVirginia 2025", org="Virginia Business", date="Jun 2025",
             description="A feature in the \"Elevator Pitch\" roundup of the 2025 StartVirginia issue, covering the My Date Jar multichannel model, SWaM certification, and business traction.",
             external_link="https://virginiabusiness.com/startups-the-elevator-pitch-3/", is_published=True, display_order=1),
        dict(category="Feature", title="Begin Locally to Build Globally — A ValiantCEO Interview", org="ValiantCEO", date=None,
             description="A feature interview detailing the origins of My Date Jar, advice for transitioning from corporate IT to entrepreneurship, and future plans.",
             external_link="https://valiantceo.com/bretton-key/", is_published=True, display_order=2),
        dict(category="Feature", title="Meet Bretton Key", org="Canvas Rebel", date=None,
             description="A profile tracing the growth of My Date Jar from a mason jar of ideas to an app and companion product, including the Amazon Black Business Accelerator.",
             external_link="https://canvasrebels.com/meet-bretton-key/", is_published=True, display_order=3),
        dict(category="Feature", title="12 Best Outdoor Date Ideas in 2024", org="Best Life", date="Apr 2024",
             description="A roundup of expert-recommended outdoor date ideas where My Date Jar was included with a suggestion for a drive-in movie experience.",
             external_link="https://bestlifeonline.com/best-outdoor-date-ideas/", is_published=True, display_order=4),
        dict(category="Feature", title="Meet Bretton Key | Tech Founder & App Designer", org="Shoutout Atlanta", date="Mar 2024",
             description="A profile covering the founding story of Date Jar and early support from the Norfolk State University Innovation Center and 1863 Ventures.",
             external_link="https://shoutoutatlanta.com/meet-bretton-key-tech-founder-app-designer/", is_published=True, display_order=5),
        dict(category="Feature", title="My Date Jar — Client Case Study", org="BuildFire", date=None,
             description="A case study covering the technical development of the My Date Jar mobile app, its growth trajectory, and nationwide rollout strategy.",
             external_link="https://buildfire.com/customer-stories/my-date-jar/", is_published=True, display_order=6),
        dict(category="Feature", title="An Entertainment Platform Is About to Shake Up 'Date Night' This Valentine's Day", org="EIN Presswire", date="Feb 2024",
             description="A Valentine's Day press release on reimagining date night and introducing Date Cards Vol. 1 — picked up by outlets including KXAN, KSNT, and WGN Radio 720.",
             external_link="https://www.ksnt.com/business/press-releases/ein-presswire/686728176/an-entertainment-platform-is-about-to-shake-up-date-night-this-valentines-day/", is_published=True, display_order=7),
        dict(category="Feature", title="The Dating App to End All Dating Apps: Introducing Date Jar", org="The NYC Times", date=None,
             description="Covers the founding and April 2022 launch of Date Jar, framing it as a tool for both singles and couples.",
             external_link="https://www.thenyctimes.com/the-dating-app-to-end-all-dating-apps-introducing-date-jar/", is_published=True, display_order=8),
        dict(category="Feature", title="The New Dating App Set to Change the Game: MyDateJar", org="Times LA", date=None,
             description="A city-lifestyle feature covering how My Date Jar revolutionizes dating with curated ideas rather than swipe-based models.",
             external_link="https://www.timesla.com/the-new-dating-app-set-to-change-the-game-mydatejar/", is_published=True, display_order=9),
        dict(category="Feature", title="FBI Says Keep Your ID Badges Covered", org="13News Now (WVEC)", date="2012",
             description="A security-awareness segment where Bretton Key was quoted on the importance of workplace ID badge safety.",
             external_link="https://www.13newsnow.com/article/news/fbi-says-keep-your-id-badges-covered/291-418124553", is_published=True, display_order=10),
        dict(category="Feature", title="Downtown Norfolk's 757 Startup Studios Attracts 18 More Startups", org="The Virginian-Pilot", date="Dec 2022",
             description="Coverage of the 757 Startup Studios cohort which supported My Date Jar.",
             external_link="https://www.pilotonline.com/2022/12/01/downtown-norfolks-757-startup-studios-attracts-18-more-startups/", is_published=True, display_order=11),
        # ---- Podcasts ----
        dict(category="Podcast", title="Founder Runs an Entertainment Platform That Redefines Dating Experiences", org="I AM CEO Podcast", date="May 2024",
             description="Hosted by Gresham Harkless Jr., the episode discusses the origins of My Date Jar and defines the CEO role as accountability, intention, and value.",
             external_link="https://cbnation.tv/founder-runs-an-entertainment-platform-that-redefines-dating-experiences/", is_published=True, display_order=12),
        dict(category="Podcast", title="Ep. 243: Bretton Key — My Date Jar Mobile App", org="Kickin' It Kool Kard", date=None,
             description="Discusses building the My Date Jar mobile app for singles and couples.",
             external_link="https://podcasts.apple.com/nz/podcast/ep-243-bretton-key-my-date-jar-mobile-app/id1605498818?i=1000665163694", is_published=True, display_order=13),
        dict(category="Podcast", title="Episode 132", org="Fervent Four — Innovate Hampton Roads", date=None,
             description="Interview with Tim Ryan and Zack Miller on building My Date Jar and the founder journey.",
             video_url="https://www.youtube.com/watch?v=1p_5fk8y8kU", is_published=True, display_order=14),
        dict(category="Podcast", title="How Did I Get Here — Season 1, Episode 8", org="Here We Are Podcast", date=None,
             description="Hosted by Teka Johnson, LCSW, a candid conversation on the entrepreneurial path.",
             video_url="https://www.youtube.com/watch?v=IVDClVVmHmU", is_published=True, display_order=15),
        # ---- TV & Video ----
        dict(category="TV & Video", title="The Art of Dating with 'Date Jar' on Coast Live", org="Coast Live — WTKR News 3", date="Jul 2022",
             description="A discussion on how the My Date Jar app coaches users through dating by focusing on shared experiences.",
             external_link="https://www.wtkr.com/coast-live/the-art-of-dating-with-date-jar-on-coast-live", is_published=True, display_order=16),
        dict(category="TV & Video", title="Get Creative with Your Dating Life with the Date Jar App on Coast Live", org="Coast Live — WTKR News 3", date=None,
             description="A second Coast Live segment on the My Date Jar app and its approach to modern dating.",
             external_link="https://www.wtkr.com/coast-live/get-creative-with-your-dating-life-with-the-date-jar-app-on-coast-live", is_published=True, display_order=17),
        dict(category="TV & Video", title="Coast Live, Part 2", org="Coast Live on 3 (Facebook)", date=None,
             description="A Facebook video segment welcoming the founder back to the show to discuss upcoming plans.",
             external_link="https://www.facebook.com/CoastLiveon3/videos/we-were-thrilled-today-to-welcome-bretton-j-key-to-the-show-to-discuss-the-upcom/3192754887651034/?locale=ms_MY", is_published=True, display_order=18),
        dict(category="TV & Video", title="Feature Appearance", org="Legit TV — Amazon Prime Video", date=None,
             description="A segment hosted by Stefanie Magness featuring Bretton Key.", is_published=True, display_order=19),
        dict(category="TV & Video", title="I Survived", org="YouTube", date=None,
             description="A video appearance discussing lessons learned from building and launching a venture.",
             video_url="https://www.youtube.com/watch?v=Qcby6IDIy34", is_published=True, display_order=20),
        dict(category="TV & Video", title="Ride Along Conversations", org="YouTube", date=None,
             description="A casual video conversation covering entrepreneurship and the My Date Jar journey.",
             video_url="https://youtu.be/a7iL2LxmZTg", is_published=True, display_order=21),
        dict(category="TV & Video", title="Love In The Digital Age", org="YouTube", date=None,
             description="A video discussion on modern dating, technology, and how My Date Jar fits into the picture.",
             video_url="https://www.youtube.com/watch?v=cY7OXLPBMgU", is_published=True, display_order=22),
    ]
    for i in impact_data:
        create_impact(**i)
    print(f"Created {len(impact_data)} impact/media items.")

    # ------------------------------------------------------------ PERSONAL
    create_section(page_id, "personal", "Personal", "Beyond the Work", 11, "true_white", "fade", {
        "heading": "Beyond the Work",
        "themes": ["Faith", "Family", "Community"],
        "statement": "I'm a Norfolk native, a self-described super nerd, and above all a devoted father of three. I don't have all the answers, but I believe in showing up — for my family, my faith, and the people I get to serve.",
        "image": IMG_PERSONAL,
    })

    # ------------------------------------------------------------- GALLERY
    create_section(page_id, "gallery", "Gallery", "Field Notes", 12, "deep_royal_blue", "fade", {
        "title": "Through My Eyes",
        "description": "Moments that shape and mold me.",
        "images": [
            {"url": IMG_GALLERY_CORRIDOR, "caption": "Every program is a room to walk through, one milestone at a time.", "alt": "Modern blue-lit corridor"},
            {"url": IMG_GALLERY_VETERAN, "caption": "Service before self — from the Guard to the Pentagon.", "alt": "American flag on military uniform"},
            {"url": IMG_GALLERY_NORFOLK, "caption": "Norfolk, VA — home base.", "alt": "Norfolk Virginia waterfront"},
            {"url": IMG_GALLERY_NOTEBOOK, "caption": "Every venture starts on a blank page.", "alt": "Open notebook on desk"},
        ],
    })

    # ------------------------------------------------------------- CONTACT
    create_section(page_id, "contact", "Contact", "Contact", 13, "true_white", "fade", {
        "heading": "Build Together",
        "description": "Accomplish your goals and find your keys to success — let's connect.",
        "email": "brettonjkey@icloud.com",
        "phone": "(757) 589-4148",
        "location": "Norfolk, VA",
        "scheduling_url": "https://calendly.com/bretton-j-key",
        "confirmation_message": "Thank you — your message has been received. Bretton will follow up soon.",
    })

    # -------------------------------------------------------------- THOUGHTS
    thoughts_data = [
        dict(title="What Twenty Years of Program Delivery Taught Me About Trust", slug="twenty-years-of-trust",
             excerpt="Schedules and budgets matter, but the programs that actually ship are the ones where trust was built first.",
             body="Every program I've led — from federal IT systems to a self-funded mobile app — succeeds or fails on the same variable: trust. Not process, not tooling, not even budget. Trust.\n\nWhen stakeholders trust the plan, they stop re-litigating scope every sprint. When teams trust their lead, they surface risk early instead of hiding it until it's a crisis. When a Product Owner trusts their engineers, decisions get made in hours instead of weeks.\n\nBuilding that trust starts with radical clarity: say what you're going to do, do it, and when you can't, say so immediately and explain why. Over 35+ programs and $200M+ in delivered value, that discipline has mattered more than any framework I've used.\n\nAgile, Waterfall, SAFe — they're all just scaffolding. Trust is the structure underneath.",
             category="Leadership", reading_time="5 min read", featured=True, is_published=True, display_order=1),
        dict(title="The Agile Team Nobody Talks About: Compliance Under Pressure", slug="compliance-under-pressure",
             excerpt="Compliance and accreditation teams rarely get credit for shipping — but they're often the real bottleneck worth fixing first.",
             body="When I took on HQ-wide compliance across eight MAJCOMs, the instinct was to treat it as a checklist problem. It isn't. It's a delivery problem wearing a compliance costume.\n\nThe fix that raised our compliance rate from 82% to 95% in a single quarter wasn't a new policy — it was embedding compliance checkpoints directly into the Agile release trains teams were already using. Instead of a separate gate at the end, compliance became a Definition of Done.\n\nThe lesson generalizes: whenever a 'non-technical' function feels like it's slowing delivery down, the answer is rarely more oversight. It's usually integration — pulling that function into the same cadence, tools, and visibility as the rest of the team.",
             category="Delivery", reading_time="6 min read", featured=False, is_published=True, display_order=2),
        dict(title="Why I Still Believe in the Jar: Small Ideas, Shipped Well", slug="why-i-still-believe-in-the-jar",
             excerpt="You don't need a $200M budget to prove you can ship. Sometimes the smallest idea is the best training ground.",
             body="Date Jar started as a literal jar of paper slips on a kitchen counter. It's now an app. In between, nothing about the discipline changed — only the scale.\n\nDefine the real problem (decision fatigue, not 'we need an app'). Talk to the people who'll use it. Build the smallest version that solves the actual problem. Ship it. Watch what happens. Adjust.\n\nThat's the same process I use leading eight-figure federal programs. The size of the budget changes; the discipline doesn't. If you're sitting on a small idea, that's not a reason to wait — it's the best place to practice shipping well.",
             category="Product", reading_time="4 min read", featured=False, is_published=True, display_order=3),
    ]
    for t in thoughts_data:
        create_thought(**t)
    print(f"Created {len(thoughts_data)} thought-leadership articles.")

    print("\n=== SEED COMPLETE ===")


if __name__ == "__main__":
    main()
