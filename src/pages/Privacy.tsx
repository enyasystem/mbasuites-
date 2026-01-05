import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        MBA Suites ("we", "us", "our") respects your privacy and is committed to protecting
        the personal data you share with us. This Privacy Policy explains what information we
        collect, how we use it, and the choices you have regarding your information when you
        use our website, mobile apps and services (collectively, the "Services").
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
      <p className="mb-2">We collect information you provide directly and information collected automatically:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Contact & account information: name, email address, phone number, billing details.</li>
        <li>Booking & stay details: reservation dates, room preferences, special requests.</li>
        <li>Identification and documents: government ID or passport images when required for check-in or regulatory purposes.</li>
        <li>Usage data: pages visited, device and browser information, IP address, and analytics.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>To provide and manage reservations and your stay.</li>
        <li>To communicate booking confirmations, receipts, and important notices.</li>
        <li>To comply with legal and regulatory requirements (for example, retention of guest registration data).</li>
        <li>To improve and personalize our Services, and to analyze usage and performance.</li>
        <li>To detect and prevent fraud or other unlawful activity.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">3. Sharing & Third Parties</h2>
      <p className="mb-4">
        We share data with service providers who help operate the Services (payment processors, analytics providers,
        cloud hosting such as Supabase, and email delivery services). We require these providers to protect your data and
        not use it for other purposes. We may also disclose information to comply with legal obligations or to protect
        our rights, property or safety.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">4. Cookies & Tracking</h2>
      <p className="mb-4">
        We use cookies and similar technologies to operate the site, provide features, and analyze traffic. You can manage
        cookie preferences via your browser settings; note that disabling cookies may limit functionality.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">5. Data Retention & Security</h2>
      <p className="mb-4">
        We retain personal data only as long as necessary to provide the Services, comply with legal obligations, resolve
        disputes, and enforce our agreements. We maintain administrative, technical and physical safeguards designed to
        protect personal data. However, no transmission or storage system is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">6. Your Rights</h2>
      <p className="mb-4">
        Depending on your jurisdiction, you may have rights to access, correct, delete, port, or restrict processing of your
        personal data. To exercise these rights, contact us at the address below. We may need to verify your identity before
        responding to requests.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">7. Children's Privacy</h2>
      <p className="mb-4">Our Services are not directed to children under 16. We do not knowingly collect personal data from children.</p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">8. Changes to this Policy</h2>
      <p className="mb-4">
        We may update this policy periodically. We will post the updated policy on our website with a revision date. Continued
        use of the Services after changes indicates acceptance of the updated policy.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">9. Contact Us</h2>
      <p className="mb-8">
        For questions, data requests, or privacy concerns, contact us at:
      </p>
      <address className="not-italic">
        MBA Suites<br />
        Email: <a href="mailto:info@mbasuites.com" className="text-accent">info@mbasuites.com</a>
      </address>
      </main>
      <Footer />
    </>
  );
};
export default Privacy;
