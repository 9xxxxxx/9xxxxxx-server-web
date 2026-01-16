import { About } from "@/components/About";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "关于我 | Garry's Portfolio",
  description: "Learn more about Garry and his background.",
};

export default function AboutPage() {
  return (
    <div className="pt-10">
      <About />
      <ContactForm />
    </div>
  );
}
