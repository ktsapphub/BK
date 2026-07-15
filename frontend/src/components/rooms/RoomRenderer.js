import HeroRoom from "./HeroRoom";
import IntroductionRoom from "./IntroductionRoom";
import ValuesRoom from "./ValuesRoom";
import LogosRoom from "./LogosRoom";
import ResumeRoom from "./ResumeRoom";
import ServicesRoom from "./ServicesRoom";
import ProjectsRoom from "./ProjectsRoom";
import TestimonialsRoom from "./TestimonialsRoom";
import ImpactRoom from "./ImpactRoom";
import PersonalRoom from "./PersonalRoom";
import GalleryRoom from "./GalleryRoom";
import ContactRoom from "./ContactRoom";
import ThoughtsRoom from "./ThoughtsRoom";
import CustomRoom from "./CustomRoom";

// Renders a single CMS section based on its section_type, wiring in the
// relevant supplementary collection data. Unknown types gracefully fall
// back to CustomRoom (which itself renders nothing if empty).
export default function RoomRenderer({ section, data, onSkipIntro }) {
  switch (section.section_type) {
    case "hero":
      return <HeroRoom section={section} onSkipIntro={onSkipIntro} settings={data.settings} />;
    case "introduction":
      return <IntroductionRoom section={section} />;
    case "values":
      return <ValuesRoom section={section} />;
    case "logos":
      return <LogosRoom section={section} />;
    case "founder_story":
      return null;
    case "resume":
      return <ResumeRoom section={section} careerEntries={data.careerEntries} settings={data.settings} />;
    case "services":
      return <ServicesRoom section={section} services={data.services} settings={data.settings} />;
    case "projects":
      return <ProjectsRoom section={section} projects={data.projects} />;
    case "testimonials":
      return <TestimonialsRoom section={section} testimonials={data.testimonials} />;
    case "media":
    case "impact":
      return <ImpactRoom section={section} impactItems={data.impactItems} />;
    case "personal":
      return <PersonalRoom section={section} />;
    case "gallery":
      return <GalleryRoom section={section} />;
    case "contact":
      return <ContactRoom section={section} settings={data.settings} projects={data.projects} />;
    case "thoughts":
      return <ThoughtsRoom section={section} thoughts={data.thoughts} />;
    default:
      return <CustomRoom section={section} />;
  }
}
