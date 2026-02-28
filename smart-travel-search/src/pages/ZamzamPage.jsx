import React from "react";
import SolutionStaticPage from "../components/SolutionStaticPage";

export default function ZamzamPage() {
  return (
    <SolutionStaticPage
      title="Zamzam & Kizan"
      lead="Zamzam.com is approved OTA [Online Travel Agency] by the Ministry of Hajj & Umrah (MoHU), Saudi Arabia. It is an online portal for completing the full process of Umrah booking including hotel bookings, transfers, meet and assist followed by ground handling to smoothen the spiritual journey. Kizan, a registered Destination Management Company in Saudi Arabia, collaborates closely with the Saudi Tourism Authority, specializing in curated inbound and domestic tourism experiences that showcase the diverse offerings of Saudi Arabia."
      heroImage="https://www.tbo.com/img/zamzam-img.jpg"
      paragraphs={[
        "ZamZam.com focuses on religious travel in the Kingdom of Saudi Arabia and has an online portal for completing the full process of Umrah booking including but not limited to hotel bookings, transfers, ground assistance, meet & greet services at the airport as well as various value added services. ZamZam.com is approved OTA by the Ministry of Hajj and Umrah, Kingdom of Saudi Arabia.",
        "Kizan is an inbound Destination Management Company [DMC] commercially registered in Saudi Arabia. As staunch partner of Saudi Tourism Authority, Kizan promotes inbound and domestic tourism whereby offering experiences to explore Saudi as destination. With variety of itineraries covering all major destinations in Saudi Arabia, Kizan offers exquisite experiences to explore the heritage, culture, nature, adventure and spiritual experiences that Saudi has to offer.",
        "Our outstanding features include:",
      ]}
      bullets={[
        { text: "Direct contracts with majority of hotels in Saudi Arabia at competitive rates" },
        { text: "Transfers & Ground handling team" },
        { text: "DMC Services" },
        { text: "VIP Meet & Assist" },
        { text: "Curated & special request based itineraries" },
      ]}
      ctaLabel="Agent Partner"
    />
  );
}
