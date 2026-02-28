import React from "react";
import SolutionStaticPage from "../components/SolutionStaticPage";

export default function TboPlatformPage() {
  return (
    <SolutionStaticPage
      title="TBO Platform"
      leadMaxWidth={760}
      heroImage="https://www.tbo.com/img/tboplatform-img.jpg"
      paragraphs={[
        "TBO Platform is a B2B travel platform that allows the real time booking of flights, hotels and other travel products like car rentals, transfers, and sightseeing packages, backed by cutting-edge technology; it provides a hassle-free booking experience for travel agents. In addition, it also offers a wide range of travel services to its partners- enabling them to serve their customers efficiently with the right pricing and inventory.",
        "From hotel reservations to sightseeing tours, from flight bookings to complete holiday packages, from insurance cover to transit arrangements; we enable thousands of agents to effectively serve the needs of their customers daily.",
        "TBO's experienced and dedicated team ensures that everyone we partner with has round-the-clock support, resulting in quicker bookings, increased productivity, and higher level of customer satisfaction.",
      ]}
      bullets={[
        { text: "Free & easy registration" },
        { text: "Advanced online management tools" },
        { text: "Instant online sales reports" },
        { text: "Multiple payment options" },
        { text: "All leading LCC & full-service domestic carriers available via single XML" },
        { text: "24/7 customer and technical support" },
      ]}
      brands={[
        {
          logo: <><span className="gold">travelboutique</span><span className="blue">online</span></>,
          sub: "For travel buyers in India",
        },
        {
          logo: <><span className="blue">tbo</span><span className="gold">holidays.com</span></>,
          sub: "For global travel buyers",
        },
      ]}
    />
  );
}
