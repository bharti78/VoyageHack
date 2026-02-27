import { useEffect } from "react";

export default function CareersPage() {
  useEffect(() => {
    window.location.replace("/careers.html");
  }, []);

  return null;
}
