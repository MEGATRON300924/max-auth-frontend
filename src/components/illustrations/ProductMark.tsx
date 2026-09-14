import type { SVGProps } from "react";

const paths: Record<string, string> = {
  "MAX AI": "M6 18L10.5 6 15 18 19.5 6 24 18M8.2 14h15.6",
  "MAX Cloud": "M7 18h13a4 4 0 0 0 .5-8 6.5 6.5 0 0 0-12.4-1.8A4.8 4.8 0 0 0 7 18Z",
  "MAX Home": "M5 12l7-6 7 6v7h-5v-5h-4v5H5v-7Z",
  "MAX Music": "M9 18V7l9-2v11M9 18a3 3 0 1 0 0 0M18 16a3 3 0 1 0 0 0",
  "MAX Browser": "M5 7h14M5 11h14M8 16h8M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  "MAX Studio": "M8 6h8l3 3v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm8 0v4h4",
  "MAX Security": "M12 4l7 3v5c0 4.5-3 7.4-7 9-4-1.6-7-4.5-7-9V7l7-3Zm-3 8 2 2 4-4",
  "MAX Pay": "M5 8h14v10H5zM5 11h14M9 15h4",
};

export function ProductMark({ name, ...props }: SVGProps<SVGSVGElement> & { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d={paths[name] || paths["MAX AI"]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
