import { getUserCV } from "@/features/portfolio/actions/cv";
import { CVBuilderClient } from "./cv-builder-client";
import { CVData } from "@/features/portfolio/types/cv";

export default async function CVBuilderPage() {
  const initialCV = await getUserCV();
  
  // Default data if none exists
  const defaultData: CVData = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: [
      {
        id: "1",
        title: "",
        company: "",
        location: "",
        years: "",
        description: "",
      },
    ],
    education: [
      {
        id: "1",
        degree: "",
        school: "",
        location: "",
        years: "",
        description: "",
      },
    ],
    skills: "",
    languages: "",
  };

  return (
    <CVBuilderClient 
      initialData={initialCV?.data || defaultData} 
    />
  );
}
