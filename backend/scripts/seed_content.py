"""
Seed script: populates the CMS with Bretton J. Key's REAL content extracted
from his resume + old personal site, plus clearly-marked draft placeholders
for testimonials (kept unverified per spec so nothing fake renders publicly)
and stock imagery placeholders (to be replaced later via the media library).

Run with: python scripts/seed_content.py
Idempotent-ish: clears existing content collections before reseeding.
"""
import requests

BASE_URL = "http://localhost:8001/api"
ADMIN_EMAIL = "brettonjkey@icloud.com"
ADMIN_PASSWORD = "#Test1234"

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
    create_section(page_id, "values", "Values", "Values", 3, "pale_blue", "fade", {
        "heading": "What Drives Me",
        "intro": "Long ago I realized achieving the life you desire takes faith, focus, and a clear sense of purpose.",
        "items": [
            {"title": "Faith", "image": "https://images.unsplash.com/photo-1618255037265-ed4e83cf3323?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "God is good — my commitment to purpose starts here."},
            {"title": "Community", "image": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "I believe in discovering solutions together, using our unique talents and gifts."},
            {"title": "Service", "image": "https://images.unsplash.com/photo-1461532257246-777de18cd58b?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "What gets me out of bed each day is a deep commitment to personal growth and helping others."},
            {"title": "Simplicity", "image": "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=srgb&fm=jpg&q=85", "description": "I really enjoy simplifying complex processes and collaborating to reach the best outcome."},
        ],
    })

    # -------------------------------------------------------------- RESUME
    create_section(page_id, "resume", "Résumé", "Résumé", 5, "soft_white", "fade", {
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

    # ------------------------------------------------------------ SERVICES
    create_section(page_id, "services", "Services", "Services", 6, "deep_royal_blue", "fade", {
        "heading": "How I Can Help",
        "intro": "Through KeyTech Solutions, I bring the same delivery discipline I use on mission-critical programs to organizations of any size.",
    })
    services_data = [
        dict(title="Agile Delivery Leadership", description="Program and project rescue, scope/schedule/risk management, and stakeholder communication systems that keep delivery on track.",
             image_url=IMG_SERVICES, capabilities=["Program & project rescue", "Scope/schedule/risk management", "Stakeholder communication systems"],
             cta_label="Discuss a Delivery Challenge", cta_href="contact", is_published=True, display_order=1),
        dict(title="Product Ownership & Strategy", description="Roadmapping, backlog and release planning, and cross-functional alignment for teams shipping complex products.",
             capabilities=["Roadmapping", "Backlog & release planning", "Cross-functional alignment"],
             cta_label="Talk Product Strategy", cta_href="contact", is_published=True, display_order=2),
        dict(title="Mentorship & Public Speaking", description="Career mentorship for veterans and early-career project leaders, plus conference and panel speaking engagements.",
             capabilities=["Career mentorship for veterans & early-career PMs", "Conference & panel speaking", "Workshop facilitation"],
             cta_label="Book a Session", cta_href="contact", is_published=True, display_order=3),
    ]
    for s in services_data:
        create_service(**s)
    print(f"Created {len(services_data)} services.")

    # ----------------------------------------------------------- PROJECTS
    create_section(page_id, "projects", "Projects", "Projects", 7, "true_white", "slide", {
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
    for p in projects_data:
        create_project(**p)
    print(f"Created {len(projects_data)} projects.")

    # ---------------------------------------------------------- TESTIMONIALS
    create_section(page_id, "testimonials", "Testimonials", "Testimonials", 8, "pale_blue", "soft-focus-reveal", {
        "heading": "Voices",
        "intro": "What colleagues and partners say about working with Bretton.",
    })
    # NOTE: seeded as DRAFT + verified=False placeholders on purpose (per spec,
    # only verified testimonials render publicly). Bretton should replace with
    # real quotes and mark verified=True via the admin CMS.
    testimonials_data = [
        dict(name="[Placeholder — Replace with real reference]", title="Title", org="Organization",
             full_quote="This is placeholder testimonial text. Replace with a real quote from a colleague or client, then mark it verified in the admin CMS to publish it.",
             verified=False, status="draft", display_order=1),
        dict(name="[Placeholder — Replace with real reference]", title="Title", org="Organization",
             full_quote="This is placeholder testimonial text. Replace with a real quote from a colleague or client, then mark it verified in the admin CMS to publish it.",
             verified=False, status="draft", display_order=2),
    ]
    for t in testimonials_data:
        create_testimonial(**t)
    print(f"Created {len(testimonials_data)} DRAFT/unverified testimonial placeholders (won't render publicly).")

    # ------------------------------------------------------------- THOUGHTS
    create_section(page_id, "thoughts", "Thoughts", "Thoughts", 9, "soft_white", "fade", {
        "heading": "Thoughts",
        "intro": "Notes on delivery, leadership, and building things that ship.",
    })

    # ------------------------------------------------------------- IMPACT
    create_section(page_id, "impact", "Media & Impact", "In the Field", 10, "true_white", "fade", {
        "heading": "Where You May Have Seen Me",
        "intro": "Highlights from federal programs, allied operations, and independent ventures.",
    })
    impact_data = [
        dict(title="Purpose-Driven Entrepreneur", org="Personal Platform", date="2026", category="Feature",
             image_url=IMG_IMPACT_SPEAKING, description="Reflections on building ventures driven by service rather than just profit.",
             external_link="https://brettonjkey.com", role="Founder", featured=True, is_published=True, display_order=1),
        dict(title="HQ Air Force Compliance Initiative", org="HQ Air Force", date="2025", category="Program Highlight",
             description="Raised HQ-wide compliance from 82% to 95% in Q1 FY25 through Agile release-train checkpoints.",
             role="Information Access Manager", featured=False, is_published=True, display_order=2),
        dict(title="NATO ACT Innovation Vetting", org="NATO Allied Command Transformation", date="2024", category="Program Highlight",
             description="Led vetting and approval of high-impact innovation projects, authoring business cases worth hundreds of millions of euros.",
             role="Product Owner", featured=False, is_published=True, display_order=3),
    ]
    for i in impact_data:
        create_impact(**i)
    print(f"Created {len(impact_data)} impact/media items.")

    # ------------------------------------------------------------ PERSONAL
    create_section(page_id, "personal", "Personal", "Beyond the Work", 11, "deep_royal_blue", "fade", {
        "heading": "Beyond the Work",
        "themes": ["Faith", "Family", "Community"],
        "statement": "I'm a Norfolk native, a self-described super nerd, and above all a devoted father of three. I don't have all the answers, but I believe in showing up — for my family, my faith, and the people I get to serve.",
        "image": IMG_PERSONAL,
    })

    # ------------------------------------------------------------- GALLERY
    create_section(page_id, "gallery", "Gallery", "Field Notes", 12, "soft_white", "fade", {
        "title": "Field Notes",
        "description": "Moments from two decades of service, leadership, and building.",
        "images": [
            {"url": IMG_GALLERY_CORRIDOR, "caption": "Every program is a room to walk through, one milestone at a time.", "alt": "Modern blue-lit corridor"},
            {"url": IMG_GALLERY_VETERAN, "caption": "Service before self — from the Guard to the Pentagon.", "alt": "American flag on military uniform"},
            {"url": IMG_GALLERY_NORFOLK, "caption": "Norfolk, VA — home base.", "alt": "Norfolk Virginia waterfront"},
            {"url": IMG_GALLERY_NOTEBOOK, "caption": "Every venture starts on a blank page.", "alt": "Open notebook on desk"},
        ],
    })

    # ------------------------------------------------------------- CONTACT
    create_section(page_id, "contact", "Contact", "Contact", 13, "deep_royal_blue", "fade", {
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
