export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.ishalrabeehbuhsm.online/";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Ishal Rabeeh '26 - Islamic Art & Cultural Festival",
    "description": "A premier festival platform for students to showcase their talents and highlight the rich art forms of Islamic culture. Features live scoreboards, program results, and candidate profiles.",
    "startDate": "2026-01-01T09:00:00+05:30",
    "endDate": "2026-01-05T21:00:00+05:30",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
    "url": baseUrl,
    "image": [
      `${baseUrl}img/assets/logo-new.png`
    ],
    "location": {
      "@type": "Place",
      "name": "Ishal Rabeeh Festival Main Campus",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kerala",
        "addressCountry": "IN"
      }
    },
    "organizer": {
      "@type": "EducationalOrganization",
      "name": "Ishal Rabeeh '26 Committee",
      "url": baseUrl
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
