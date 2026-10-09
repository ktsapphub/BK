"""
Versioned content updates that ship with the code. Each runs once per database
(tracked in `content_migrations`), so staging gets it on deploy and production gets
it only when the change is promoted. Later edits made in the admin are never
overwritten, because a migration never runs twice.
"""
import uuid
from datetime import datetime, timezone

# Work history from Bretton's official resume (approved 2026-09-29).
# Companies and organizations only: no personal ventures.
WORK_HISTORY = [
    ("Test Lead / Product Owner", "NIWC Atlantic (via Engineering Services Network, Inc.)", "Norfolk, VA", "2026-03", None, True,
     "Leads testing for the applications that keep Navy fleet maintenance and readiness running.",
     ["Lead testing for 14 Naval maintenance applications, verifying that systems supporting fleet maintenance and readiness perform as required before fielding.",
      "Process and validate 100+ releases a year for MFOM, keeping a high-tempo release pipeline moving without compromising quality.",
      "Brief program leadership on test status, defect trends, and risk, directly informing release go/no-go decisions."]),
    ("Program Manager, Section 508 & Information Collection", "U.S. Air Force, SAF/CN (Office of the CIO)", "The Pentagon, Washington, DC", "2024-12", "2026-03", False,
     "Ran accessibility and information-collection compliance across the Air Force application portfolio.",
     ["Drove Section 508 accessibility testing for 200+ Air Force applications, bringing them to 90%+ compliance and ensuring equal access for Airmen, civilians, and the public.",
      "Vetted the HQ Air Force application suite for information collection compliance, processing hundreds of requests a month, and helped update Air Force regulations governing both Section 508 and information collection.",
      "Helped manage 200+ compliance personnel across CONUS and OCONUS, and delivered briefings and on-demand training to product owners and project managers."]),
    ("Product Owner", "NATO ACT Innovation Hub", "Norfolk, VA", "2024-01", "2024-09", False,
     "Turned innovation work into fielded capability for the Alliance.",
     ["Secured funding through business cases worth €200M, delivering 15% operational savings across Alliance initiatives.",
      "Transitioned MVPs into fielded operational capabilities, strengthening NATO readiness.",
      "Produced project plans, metrics, and analytics for flag-level briefings while maintaining full OPSEC compliance."]),
    ("Program Manager", "HCL Technologies", "New York, NY", "2021-10", "2023-12", False,
     "Delivered business process optimization programs for Fortune 500 and Fortune 50 clients.",
     ["Led global cross-functional teams of engineers and analysts on $10M–$20M projects, delivering Business Process Optimization tools to Fortune 500 and Fortune 50 organizations.",
      "Sustained a 92% client satisfaction rate by delivering process flows, dashboards, and tools spanning the C-suite down to operations.",
      "Implemented Agile practices that cut delivery time by 30% while consistently meeting scope and budget targets."]),
    ("IT Systems Analyst", "City of Virginia Beach", "Virginia Beach, VA", "2020-10", "2021-10", False,
     "Kept city systems recoverable and aligned IT work with citywide service goals.",
     ["Directed disaster recovery operations for city systems, achieving a 95% readiness rate.",
      "Authored and implemented DR plans that increased recovery efficiency by 40%.",
      "Presented application deliverables to department leadership, aligning IT work with citywide service goals."]),
    ("Senior Systems Analyst", "Entrust Government Solutions", "Norfolk, VA", "2019-10", "2021-07", False,
     "Led requirements and systems documentation for government programs.",
     ["Led requirements elicitation that earned a 90% project acceptance rate.",
      "Developed systems engineering documentation, including SOPs and disaster recovery plans.",
      "Briefed senior management on project status and strategy to guide investment decisions."]),
    ("Business Analyst II", "CACI International", "Norfolk, VA", "2018-01", "2019-10", False,
     "Improved delivery visibility and system processes for a U.S. Navy client.",
     ["Streamlined system processes for a U.S. Navy client, improving operational efficiency.",
      "Managed Scrum and Kanban boards in JIRA, giving leadership real-time delivery visibility.",
      "Conducted stakeholder interviews to capture requirements that shaped system design."]),
    ("Business Analyst", "Anthem", "Indianapolis, IN", "2014-06", "2018-01", False,
     "Cut cost and service issues for a Fortune 500 health insurer.",
     ["Generated $500K in budget savings by streamlining communications processes.",
      "Improved backlog management efficiency by 30% using JIRA.",
      "Partnered with vendors to reduce customer service issues for a Fortune 500 health insurer."]),
    ("Senior Consultant", "Booz Allen Hamilton", "Norfolk, VA", "2010-06", "2012-01", False,
     "Delivered and handed over platforms for NATO clients.",
     ["Reduced reporting delays by 75% on NATO projects.",
      "Migrated 600+ global users to a new platform with minimal disruption.",
      "Delivered handover documentation and training that enabled NATO clients to sustain systems independently."]),
    ("Personnel Specialist (3F0)", "U.S. Air Force Reserve", "Dover AFB, DE", "2013-12", "2025-01", False,
     "Kept a 750-person unit administratively ready to deploy.",
     ["Managed HR systems for 750+ personnel, keeping the unit administratively ready to deploy.",
      "Increased re-enlistment rates by 15% through targeted career advising.",
      "Optimized administrative processes to reduce personnel-action turnaround."]),
    ("Communications Specialist (25U)", "U.S. Army National Guard", "Hampton, VA", "2007-09", "2013-09", False,
     "Sustained mission-critical communications in the field.",
     ["Installed and maintained radio distribution systems, sustaining mission-critical communications.",
      "Developed training for deploying communication systems in austere environments.",
      "Supported field operations where reliable communications were essential to mission success."]),
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


MIGRATIONS = [("2026-10-09-work-history", _work_history_2026_10)]


async def run_content_migrations(db, log):
    for key, fn in MIGRATIONS:
        if await db.content_migrations.find_one({"key": key}):
            continue
        n = await fn(db)
        await db.content_migrations.insert_one({"key": key, "applied_at": datetime.now(timezone.utc).isoformat(), "count": n})
        log.info(f"Content migration {key} applied ({n} items)")
