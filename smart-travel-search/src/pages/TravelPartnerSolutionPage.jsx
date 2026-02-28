import React from "react";
import SolutionStaticPage from "../components/SolutionStaticPage";

export default function TravelPartnerSolutionPage() {
  return (
    <SolutionStaticPage
      title="Travel Partner Solution\n(TPS)"
      lead="Up-sell travel products (Flight + hotel, Hotel, Packages, Transport, Insurance) without investing your time and money in technology development."
      heroImage="https://www.tbo.com/img/tpm-img.jpg"
      paragraphs={[
        "TBO's partner module enables businesses to sell travel products globally, without investing in the technology. This platform gives access to a large inventory of flights, hotels, and other travel products. Partner can opt for self-managed or TBO assisted deployment approaches. With the same traffic and without any incremental marketing costs, partners can increase their revenue-offering travel products.",
      ]}
      bullets={[
        { text: "Hotel inventory of 1 MN+ suppliers across the globe" },
        { text: "Full customization support as per your business needs" },
        { text: "Comprehensive backend (CMS/Admin module) to manage the businesses better" },
        { text: "Reports, markup management, ROE management, SEO, staff creation with robust access control" },
        { text: "Support from technical/domain experts to launch good quality B2C websites" },
        { text: "Global payment solutions" },
        { text: "Multilingual and multi-currency support" },
        { text: "Customizable tech infrastructure to power B2C sites (White label solutions)" },
      ]}
      ctaLabel="Agent Partner"
    />
  );
}
