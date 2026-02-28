import React from "react";
import SolutionStaticPage from "../components/SolutionStaticPage";

export default function RoamerAppPage() {
  return (
    <SolutionStaticPage
      title="Roamer App"
      lead="Roamer is your personal e-planner for your trip management. It organizes all your reservations based on bookings pushed on to it."
      heroImage="https://www.tbo.com/img/roamer-img.jpg"
      paragraphs={[
        "The Roamer App is the E-travel pocketbook for travel agents and travellers around the world. Roamer makes it possible for customers to access all the essential information like E-ticket & hotel vouchers, gate, terminal info & online check-in, flight reschedule alerts, destination guides, easy navigation, weather updates etc. about their upcoming and ongoing trips.",
      ]}
      bullets={[
        { bold: "Flights information", text: "flight delays, gate, terminals, e-tickets & web check-in available on the app" },
        { bold: "Hotels information", text: "hotel voucher, navigation, weather updates etc. are available on the app" },
        { bold: "Instant addition of services", text: "manually add flights & hotels to stay updated on the go" },
        { bold: "Destination guide", text: "rich information of attractions within the app" },
        { bold: "Add bookings via e-mail", text: "instantly add booking(s) by sending booking mails to us" },
        { bold: "Share on whatsApp instantly", text: "share bookings with your customers on Whatsapp" },
      ]}
      ctaLabel="Agent Partner"
    />
  );
}
