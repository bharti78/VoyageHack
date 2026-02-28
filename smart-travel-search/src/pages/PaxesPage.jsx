import React from "react";
import SolutionStaticPage from "../components/SolutionStaticPage";

export default function PaxesPage() {
  return (
    <SolutionStaticPage
      title="Paxes"
      lead="Empowering corporates and TMCs with technology, content, and payment solutions in the business travel space."
      heroImage="https://www.tbo.com/img/paxes-img.jpg"
      paragraphs={[
        "Paxes is a web and mobile based platform for corporates and TMCs to manage business travel globally. Paxes supports corporates and TMCs with technology, content, and payment solution in the business travel space.",
      ]}
      bullets={[
        { text: "Mobile application on iOS and Android platform for corporate employees to manage bookings, approvals, flight notifications, and post-booking support" },
        { text: "Corporate employees can complete their personal bookings" },
        { text: "Corporate administrators can set-up multiple policies and approvals" },
        { text: "TMCs manage the entire gambit of functionalities starting corporate profiling, implementation, inventory type and form of payments." },
        { text: "corporate administrators can create multiple invoice profiles, undertake return on investment calculations on the budget compared with amount spent, create dynamic custom fields for granular reporting and analyze expenses through the spend analyzer" },
      ]}
      ctaLabel="View More"
    />
  );
}
