import { useEffect } from "react";

// The old site had one <title> per HTML file; this keeps that behaviour per route.
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
