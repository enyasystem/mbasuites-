import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Gift, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface LoyaltyPointsProps {
  totalPoints: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

const tierInfo = {
  Bronze: { min: 0, max: 1000, color: "bg-amber-600", benefits: ["5% discount on bookings", "Early check-in subject to availability"] },
  Silver: { min: 1000, max: 2500, color: "bg-gray-400", benefits: ["10% discount on bookings", "Late check-out", "Welcome drink"] },
  Gold: { min: 2500, max: 5000, color: "bg-yellow-500", benefits: ["15% discount on bookings", "Room upgrade", "Complimentary breakfast"] },
  Platinum: { min: 5000, max: Infinity, color: "bg-purple-600", benefits: ["20% discount on bookings", "Priority support", "Spa vouchers", "Airport transfer"] },
};

export function LoyaltyPoints({ totalPoints, tier }: LoyaltyPointsProps) {
  const currentTier = tierInfo[tier];
  const nextTier = tier === "Platinum" ? null : 
    tier === "Gold" ? "Platinum" : 
    tier === "Silver" ? "Gold" : "Silver";
  
  const pointsToNextTier = nextTier ? tierInfo[nextTier].min - totalPoints : 0;
  const progressPercentage = nextTier 
    ? ((totalPoints - currentTier.min) / (tierInfo[nextTier].min - currentTier.min)) * 100
    : 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-accent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Loyalty Rewards</CardTitle>
                <CardDescription>Your membership benefits and points</CardDescription>
              </div>
              <Award className="h-12 w-12 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Tier</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${currentTier.color} text-white px-3 py-1 text-lg`}>
                    {tier}
                  </Badge>
                  <Star className="h-5 w-5 text-accent fill-accent" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold text-accent">{totalPoints.toLocaleString()}</p>
              </div>
            </div>

            {nextTier && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress to {nextTier}</span>
                  <span className="font-medium">{pointsToNextTier.toLocaleString()} points needed</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentTier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Room booking</span>
                <span className="font-medium text-accent">10 points per $1</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Write a review</span>
                <span className="font-medium text-accent">50 points</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Refer a friend</span>
                <span className="font-medium text-accent">200 points</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
