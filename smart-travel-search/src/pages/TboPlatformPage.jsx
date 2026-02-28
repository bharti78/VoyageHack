import { useEffect } from "react";

export default function TboPlatformPage() {
  useEffect(() => {
    window.location.replace("/tbo-platform.html");
  }, []);

  return null;
}
