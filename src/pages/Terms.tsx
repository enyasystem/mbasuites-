import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        These Terms of Service ("Terms") govern your access to and use of the MBA Suites website and services.
        By using our Services you agree to these Terms. If you do not agree, do not use the Services.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Booking & Payments</h2>
      <p className="mb-4">
        All bookings are subject to availability and confirmation. Prices displayed are as provided at the time of booking.
        Payment terms, pricing, and any taxes or fees will be shown during checkout. We may use third-party payment
        processors; their terms also apply.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">2. Cancellations & Refunds</h2>
      <p className="mb-4">
        Cancellation policies vary by rate and property. Refund eligibility is determined by the policy shown at booking.
        Please review the cancellation policy before you confirm a reservation.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">3. Guest Responsibilities</h2>
      <p className="mb-4">
        Guests must comply with property rules and local laws, provide accurate information during booking and check-in,
        and reimburse MBA Suites for any loss or damage caused by negligence or willful misconduct.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">4. Availability & Errors</h2>
      <p className="mb-4">
        We strive to display accurate information, but errors may occur. We reserve the right to correct errors and
        to cancel confirmed bookings in the case of obvious errors or where we reasonably believe a booking to be
        fraudulent or in bad faith.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">5. Intellectual Property</h2>
      <p className="mb-4">
        All content on the Services (text, images, logos, trademarks) is owned or licensed by MBA Suites and protected
        by intellectual property laws. You may not use our trademarks or content without prior written permission.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">6. Disclaimers & Limitation of Liability</h2>
      <p className="mb-4">
        The Services are provided "as is" without warranties of any kind. To the fullest extent permitted by law,
        MBA Suites will not be liable for indirect, incidental, special or consequential damages arising out of or
        in connection with use of the Services or your stay.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">7. Governing Law</h2>
      <p className="mb-4">These Terms are governed by the laws of the jurisdictions where the property is located, unless otherwise required by applicable law.</p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">8. Changes to Terms</h2>
      <p className="mb-4">
        We may update these Terms from time to time. Changes will be posted on this page with an updated effective date.
        Continued use after changes constitutes acceptance of the updated Terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">9. Contact</h2>
      <p className="mb-8">
        For questions about these Terms or your booking, contact us at <a href="mailto:info@mbasuites.com" className="text-accent">info@mbasuites.com</a>.
      </p>
      </main>
      <Footer />
    </>
  );
};



export default Terms;
