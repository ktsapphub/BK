from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

VALID_SECTION_TYPES = {
    "hero", "introduction", "values", "logos", "thoughts", "resume", "services",
    "projects", "founder_story", "testimonials", "media", "impact",
    "personal", "gallery", "contact", "custom"
}
VALID_STATUS = {"draft", "published", "archived"}
VALID_PROJECT_STATUS = {"Live", "In Development", "Concept", "Archived", "Private", "Case Study Available"}


class LoginRequest(BaseModel):
    email: str
    password: str


class PageCreate(BaseModel):
    slug: str
    title: str
    is_published: bool = True


class SectionCreate(BaseModel):
    page_id: str
    section_type: str
    internal_name: str
    navigation_label: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True
    status: str = "draft"
    theme: Optional[str] = "true_white"
    layout: Optional[str] = None
    transition_style: Optional[str] = "fade"
    content: Dict[str, Any] = Field(default_factory=dict)


class SectionUpdate(BaseModel):
    section_type: Optional[str] = None
    internal_name: Optional[str] = None
    navigation_label: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None
    status: Optional[str] = None
    theme: Optional[str] = None
    layout: Optional[str] = None
    transition_style: Optional[str] = None
    content: Optional[Dict[str, Any]] = None


class CareerEntryCreate(BaseModel):
    title: str
    org: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    logo_url: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True


class TestimonialCreate(BaseModel):
    name: str
    title: Optional[str] = None
    org: Optional[str] = None
    relationship: Optional[str] = None
    full_quote: str
    short_quote: Optional[str] = None
    portrait_url: Optional[str] = None
    portrait_alt: Optional[str] = None
    linkedin_url: Optional[str] = None
    org_logo_url: Optional[str] = None
    related_project_id: Optional[str] = None
    verified: bool = False
    status: str = "draft"
    display_order: int = 0


class ProjectCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    role: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    outcomes: List[str] = Field(default_factory=list)
    status: str = "Concept"
    thumbnail_url: Optional[str] = None
    screenshots: List[str] = Field(default_factory=list)
    video_url: Optional[str] = None
    live_url: Optional[str] = None
    case_study_url: Optional[str] = None
    repo_url: Optional[str] = None
    featured: bool = False
    available_for_inquiry: bool = False
    is_published: bool = False
    display_order: int = 0


class ServiceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    capabilities: List[str] = Field(default_factory=list)
    cta_label: Optional[str] = None
    cta_href: Optional[str] = None
    related_project_id: Optional[str] = None
    is_published: bool = False
    display_order: int = 0


class ThoughtCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    category: Optional[str] = None
    featured_image: Optional[str] = None
    video_url: Optional[str] = None
    publish_date: Optional[str] = None
    reading_time: Optional[str] = None
    external_url: Optional[str] = None
    featured: bool = False
    is_published: bool = False
    display_order: int = 0


class ImpactItemCreate(BaseModel):
    title: str
    org: Optional[str] = None
    date: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    description: Optional[str] = None
    external_link: Optional[str] = None
    role: Optional[str] = None
    featured: bool = False
    is_published: bool = False
    display_order: int = 0


class NavigationItemCreate(BaseModel):
    label: str
    section_id: Optional[str] = None
    href: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True


class GlobalSettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    site_tagline: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_location: Optional[str] = None
    scheduling_url: Optional[str] = None
    social_instagram: Optional[str] = None
    social_threads: Optional[str] = None
    social_linkedin: Optional[str] = None
    footer_text: Optional[str] = None
    seo_default_title: Optional[str] = None
    seo_default_description: Optional[str] = None
    seo_og_image: Optional[str] = None
    resume_pdf_url: Optional[str] = None
    connect_dialog_heading: Optional[str] = None
    connect_dialog_copy: Optional[str] = None
    contact_consent_text: Optional[str] = None
    contact_consent_supporting_text: Optional[str] = None
    contact_consent_version: Optional[str] = None
    marketing_consent_text: Optional[str] = None
    newsletter_enabled: Optional[bool] = None
    privacy_policy_url: Optional[str] = None


class InquiryCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    reason: str
    project_type: Optional[str] = None
    project_stage: Optional[str] = None
    pick_brain_topic: Optional[str] = None
    speaking_org: Optional[str] = None
    speaking_event: Optional[str] = None
    speaking_date: Optional[str] = None
    speaking_location: Optional[str] = None
    speaking_mode: Optional[str] = None
    speaking_audience_size: Optional[str] = None
    speaking_topic: Optional[str] = None
    use_app_project_id: Optional[str] = None
    partnership_type: Optional[str] = None
    message: str
    preferred_contact_method: Optional[str] = None
    contact_consent: bool = False
    contact_consent_text: Optional[str] = None
    contact_consent_version: Optional[str] = None
    marketing_consent: bool = False
    marketing_consent_text: Optional[str] = None
    source_page: Optional[str] = None
    source_section: Optional[str] = None
    source_channel: Optional[str] = None
    related_project_id: Optional[str] = None
    submission_id: Optional[str] = None
    hp: Optional[str] = None


class NewsletterSignup(BaseModel):
    email: str


class ReorderItem(BaseModel):
    id: str
    display_order: int


class ReorderRequest(BaseModel):
    items: List[ReorderItem]
