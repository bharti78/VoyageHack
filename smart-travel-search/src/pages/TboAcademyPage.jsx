import React from "react";
import SolutionStaticPage from "../components/SolutionStaticPage";

export default function TboAcademyPage() {
  return (
    <SolutionStaticPage
      title="TBO Academy"
      lead="TBO Academy is an exclusive online-learning platform for travel agents and travel trade partners. The platform is an empowering tool for TBO Group partners and available free of charge."
      heroImage="https://www.tbo.com/img/academy-img.jpg"
      paragraphs={[
        "It is an online learning platform for 159,000 travel partners associated with TBO. It works as a unique learning platform for travel partners and internal employees across the globe. The platform educates travel agents about various destinations and hotels, enhances their soft skills and industry-specific knowledge through e-learning programs.",
        "It uses videos and presentations to enhance the user experience and improve knowledge retention. Quizzes at the end of each module tests the travel agent's learning and acts as an assessment tool.",
      ]}
      bullets={[
        { text: "Learning at any time of the day from any part of the world without having to worry about a trainer and his/her availability" },
        { text: "Sharing knowledge/information with travel agents about destinations like things to avoid when traveling to any particular country, things to do, places to visit & eat at and even the demographics of the destination" },
        { text: "Providing travel agents with knowledge/information on hotels and their facilities" },
        { text: "Enabling travel agents with knowledge on how to sell better and giving agents skills through training to help them do their daily jobs better" },
        { text: "Creating a very impactful experience for the end-user (Agent's customers) through videos and provide printable notes which can come in handy when on the move" },
      ]}
      ctaLabel="View More"
    />
  );
}
