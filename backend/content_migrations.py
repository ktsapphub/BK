"""
Versioned content updates that ship with the code. Each runs once per database
(tracked in `content_migrations`), so staging gets it on deploy and production gets
it only when the change is promoted. Later edits made in the admin are never
overwritten, because a migration never runs twice.
"""
import uuid
from datetime import datetime, timezone

# Work history as Bretton wrote it on LinkedIn (exported 2026-10-09): one statement per
# role, no bullets. Companies and organizations only: Date Jar / My Date Jar is excluded.
# (title, org, location, start, end, is_current, statement, bullets)
WORK_HISTORY = [
    ("Team Lead / Product Owner", "Engineering Services Network (ESN)", "Virginia · Hybrid", "2026-03", None, True,
     "I lead test and product efforts for Naval maintenance systems at NIWC Atlantic, where quality and speed both matter to fleet readiness. My team tests the whole family of systems for Naval maintenance applications and validates hundreds of MFOM releases a year, making sure the systems supporting fleet maintenance perform as required before they reach the field. Along the way, I keep program leadership informed on test status, defect trends, and risk so they can make confident release decisions.", []),
    ("Program Manager", "United States Air Force", "Washington, DC · Hybrid", "2024-12", "2026-03", False,
     "I supported the Department of the Air Force Office of the CIO (SAF/CN) at the Pentagon, managing two enterprise compliance programs for Section 508 accessibility and information collection. I drove accessibility testing for more than 200 Air Force applications, bringing them to 90% compliance or higher so Airmen, civilians, and the public could access them equally. I also vetted the HQ Air Force application suite for information collection compliance, processed hundreds of requests each month, and helped update the Air Force regulations governing both programs. Throughout, I helped manage more than 200 compliance personnel across CONUS and OCONUS and delivered briefings and on-demand training to product owners and project managers.", []),
    ("Product Owner", "NATO Allied Command Transformation (ACT)", "United States · Hybrid", "2024-01", "2024-09", False,
     "I served as Product Owner for the NATO ACT Innovation Hub, turning promising ideas into capabilities the Alliance could put to work. I secured funding through business cases worth €200M that delivered 15% operational savings, and I transitioned MVPs into fielded operational capabilities that strengthened NATO readiness. Stood up internal tools and resources to support CAPDEV. I also led strategic communications and knowledge management, producing plans, metrics, and analytics for flag-level briefings while maintaining full OPSEC compliance.", []),
    ("Program Manager", "HCL Technologies", "New York City Metropolitan Area", "2021-10", "2023-12", False,
     "I led business process optimization programs for Fortune 500 and Fortune 50 organizations, connecting C-suite goals to what happens on the ground in operations. Leading global cross-functional teams of engineers and analysts on $10M–$20M projects, I delivered process flows, dashboards, and tools that helped clients recover lost revenue, save time, and streamline their operations. That focus on real results sustained a 92% client satisfaction rate, and the Agile practices I introduced cut delivery time by 30% while keeping projects on scope and budget.", []),
    ("System Analyst", "City of Virginia Beach", "Virginia Beach, VA", "2020-10", "2021-10", False,
     "I kept critical city systems resilient so public services could keep running when it mattered most. By directing disaster recovery operations, I brought city systems to a 95% readiness rate, and the recovery plans I authored and implemented increased recovery efficiency by 40%. I also presented application deliverables to department leadership, keeping IT work aligned with citywide service goals.", []),
    ("Sr. Systems Analyst", "Entrust", "Norfolk, VA · Hybrid", "2019-10", "2021-08", False,
     "I translated government client needs into clear requirements and documentation that kept projects on track and decision-makers informed. My requirements work earned a 90% project acceptance rate, and I developed the systems engineering documentation, including SOPs and disaster recovery plans, that teams relied on. I regularly briefed senior management on project status and strategy to guide investment decisions.", []),
    ("Business Analyst", "CACI International Inc", "", "2018-01", "2019-10", False,
     "I helped shape the direction of a Naval Aviation Maintenance system by getting to the heart of what users and stakeholders needed. By gathering and analyzing requirements, I steered the software development strategy and mapped business processes, data flows, and user experiences so the team could build the right solution. I managed Scrum and Kanban boards in JIRA to give leadership real-time visibility into delivery, and I partnered with business owners on test plans, use cases, and user stories that validated the work.", []),
    ("Business Analyst", "SSI Consulting Solutions", "Norfolk, VA · On-site", "2018-01", "2018-07", False,
     "On a short-term contract with a Norfolk-based client, I brought structured analysis to their business and systems processes. I gathered and documented stakeholder requirements and mapped existing processes to find opportunities to streamline operations.", []),
    ("Business Analyst II", "Anthem, Inc.", "", "2014-06", "2018-01", False,
     "At Anthem Pharmacy Services, I bridged business and IT to turn business needs into software and process improvements for a Fortune 500 health insurer. By streamlining communications processes, I generated $500K in budget savings, and I improved backlog management efficiency by 30% using JIRA. I partnered closely with programming staff, so requirements were built into system design and testing, and I worked with vendors and business partners to reduce customer service issues.", []),
    ("3F0 - Personnel", "U.S. Air Force Reserve", "Dover Air Force Base, DE · On-site", "2013-12", "2025-01", False,
     "I began my Air Force Reserve career in logistics as a 2T2 before finding my stride in personnel as a 3F0, where I spent the rest of my 10 years keeping Airmen and the unit administratively ready to support the mission. I managed HR systems for more than 750 personnel and streamlined administrative processes to speed up personnel actions. Through targeted career advising, I also helped increase re-enlistment rates by 15%, and my start in logistics gave me a practical understanding of how people and resources come together to keep a mission moving.", []),
    ("Business Systems Analyst II", "CACI International Inc", "Norfolk, VA", "2012-02", "2014-05", False,
     "I wore three hats for a government client as Project Test Lead, Quality Assurance Auditor, and Organizational Training Coordinator. As test lead, I built test plans, Requirements Traceability Matrices, and release metrics while classifying and reporting defects. As an auditor, I reviewed work products and processes for government compliance and resolved noncompliance issues from start to finish. I also managed the organizational training plan for more than 100 employees, coordinating with project-level trainers and reporting training metrics to leadership.", []),
    ("Sr. Consultant II", "Booz Allen Hamilton", "Norfolk, VA", "2010-06", "2012-01", False,
     "I supported Commander, Navy Reserve Forces (CNRF) as a Requirements Analyst, Test Case Lead, and Knowledge Manager. I migrated more than 600 users and their documentation to a new system with minimal disruption, and I refined requirements, built traceability matrices, and led test execution and defect reporting. My website mockups, user guides, and handover documentation helped the client sustain its systems independently, and I kept knowledge standards consistent across multiple levels of command.", []),
    ("Help Desk Analyst II", "Amerigroup", "Virginia Beach, VA · Hybrid", "2008-01", "2010-06", False,
     "I kept a multi-state workforce productive through fast, reliable IT support. I supported more than 4,000 employees across 7 states and served as the single point of contact for more than 500 employees in New York. I also helped modernize the service desk through an ITIL-based improvement project that introduced new help desk software, an automated call system, and a knowledge database, and I supported the company-wide rollout of 1,300 BlackBerry devices.", []),
    ("25U Signal Support System Specialist", "Army National Guard", "Hampton, VA", "2007-09", "2013-09", False,
     "I kept soldiers connected by installing, operating, and maintaining the radio and data systems missions depend on. I ran voice and data transmission across SINCGARS radio nets, including EPLRS, FBCB2, and related tactical systems, and performed unit-level maintenance on signal equipment, vehicles, and power generators. I also supported the JISCC disaster response package and developed training for deploying communication systems in austere environments.", []),
    ("Advanced Technical Support Specialist", "Alltel", "", "2005-09", "2008-02", False,
     "I solved complex voice and data problems for internal and external customers, troubleshooting hardware, software, and network issues and walking them through setup and configuration. I tested new data products and cellular devices before release to catch issues early, and I tracked recurring problems and reported them to product development to improve future products.", []),
    ("Lead Web Programmer", "TriDuo", "", "2005-03", "2005-10", False,
     "I owned website creation from start to finish, working directly with clients to define requirements and goals. I led the design, development, deployment, and support of the corporate website, including its icons and branding graphics. Worked company events and photograph repository.", []),
]


async def _work_history_2026_10(db):
    old = await db.career_entries.find({}, {"_id": 0, "org": 1, "logo_url": 1, "skills": 1}).to_list(200)
    logos = {(o.get("org") or "").lower(): o for o in old}
    now = datetime.now(timezone.utc).isoformat()
    docs = []
    for i, (title, org, loc, start, end, current, desc, bullets) in enumerate(WORK_HISTORY):
        prev = next((v for k, v in logos.items() if k and (k in org.lower() or org.lower().split(" (")[0] in k)), {})
        docs.append({
            "id": str(uuid.uuid4()), "title": title, "org": org, "location": loc,
            "start_date": start, "end_date": end, "is_current": current, "description": desc,
            "achievements": bullets, "skills": prev.get("skills") or [], "logo_url": prev.get("logo_url"),
            "display_order": i + 1, "is_visible": True, "created_at": now, "updated_at": now,
        })
    await db.career_entries.delete_many({})
    await db.career_entries.insert_many(docs)
    return len(docs)


# v2 replaces v1 (bullets) with the LinkedIn statements; a fresh database runs both, same result.
MIGRATIONS = [("2026-10-09-work-history", _work_history_2026_10), ("2026-10-09-work-history-v2", _work_history_2026_10)]


async def run_content_migrations(db, log):
    for key, fn in MIGRATIONS:
        if await db.content_migrations.find_one({"key": key}):
            continue
        n = await fn(db)
        await db.content_migrations.insert_one({"key": key, "applied_at": datetime.now(timezone.utc).isoformat(), "count": n})
        log.info(f"Content migration {key} applied ({n} items)")
