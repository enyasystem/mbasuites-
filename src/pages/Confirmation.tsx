import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, Mail, Phone } from "lucide-react";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingReference, guestInfo, bookingData } = location.state || {};

  // Redirect if no booking data
  if (!bookingReference || !guestInfo || !bookingData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">No Booking Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find your booking confirmation.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your reservation has been successfully confirmed
            </p>
          </div>

          {/* Booking Reference Card */}
          <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                Booking Reference
              </p>
              <p className="text-2xl font-bold font-mono">{bookingReference}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Please save this reference number for your records
              </p>
            </div>
          </Card>

          {/* Booking Details */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

            <div className="space-y-4">
              {/* Room Details */}
              <div className="flex gap-4">
                <img
                  src={bookingData.room.images[0]}
                  alt={bookingData.room.name}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{bookingData.room.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.room.category}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.room.bedType}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Stay Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {format(bookingData.checkIn, "EEEE, MMMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">After 2:00 PM</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {format(bookingData.checkOut, "EEEE, MMMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground">Before 12:00 PM</p>
                </div>
              </div>

              <Separator />

              {/* Guest Information */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Guest Details</p>
                <p className="font-medium">
                  {guestInfo.firstName} {guestInfo.lastName}
                </p>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {guestInfo.email}
                </p>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {guestInfo.phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Guests</p>
                <p className="font-medium">
                  {bookingData.guests.adults} adult
                  {bookingData.guests.adults !== 1 ? "s" : ""}
                  {bookingData.guests.children > 0 &&
                    `, ${bookingData.guests.children} child${
                      bookingData.guests.children !== 1 ? "ren" : ""
                    }`}
                </p>
              </div>

              {guestInfo.specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground">Special Requests</p>
                  <p className="text-sm">{guestInfo.specialRequests}</p>
                </div>
              )}

              <Separator />

              {/* Payment Summary */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Payment Summary
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      ₦{bookingData.room.price.toLocaleString()} × {bookingData.nights}{" "}
                      nights
                    </span>
                    <span>
                      ₦
                      {(bookingData.room.price * bookingData.nights).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service fee</span>
                    <span>₦0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span>₦{bookingData.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>
                  A confirmation email has been sent to {guestInfo.email}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>
                  Please arrive at the hotel after 2:00 PM on your check-in date
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>
                  Bring a valid ID and your booking reference number
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span>
                  Contact us at reservations@hotel.com if you need to modify your
                  booking
                </span>
              </li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
