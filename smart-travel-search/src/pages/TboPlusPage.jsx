import React from "react";
import SolutionStaticPage from "../components/SolutionStaticPage";

export default function TboPlusPage() {
  return (
    <SolutionStaticPage
      title="TBO+"
      lead="TBO+ is an all-new distinctive Booker Rewards Program, enabling you to earn and redeem reward points seamlessly with many local lifestyle and travel options through an online website linked to your TBO Rewards. It has four tiers that ensure that the more you book, the more you earn through each tier."
      heroImage="https://www.tbo.com/img/tboplus-img.jpg"
      paragraphs={[
        "TBO+ Program is a comprehensive rewards program designed exclusively for our booking partners. The program's objective is to make your booking experience delightful and allows you to earn reward points for each transaction on the TBO Platform. Bookers may then redeem these reward points to procure a wide variety of lifestyle and travel products, vouchers, airline miles and more.",
        "As an extension of your TBO holidays account, all bookers are automatically enrolled to this loyalty program & the enrolment is completely FREE!!!",
        "As you move up the tiers, you will earn more reward points for each booking as illustrated below",
      ]}
      bullets={[
        { bold: "Silver", text: "Earn up to 2.5x rewards on every booking" },
        { bold: "Gold", text: "Earn up to 3x reward points" },
        { bold: "Platinum", text: "Earn up to 4x reward points" },
        { bold: "All Star", text: "Earn up to 5x reward points" },
      ]}
      ctaLabel="Agent Partner"
    />
  );
}
