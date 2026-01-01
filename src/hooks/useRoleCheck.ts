import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "staff" | "guest";

interface UseRoleCheckResult {
  role: AppRole | null;
  isAdmin: boolean;
  isStaff: boolean;
  isGuest: boolean;
  isLoading: boolean;
  locationId: string | null;
  hasRole: (role: AppRole) => boolean;
  refetch: () => void;
}

export function useRoleCheck(): UseRoleCheckResult {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      setLocationId(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Query may return multiple rows for a user (e.g., multiple locations/roles).
      // Handle arrays and pick the highest-precedence role available.
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, location_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching role:", error);
        setRole("guest");
        setLocationId(null);
      } else if (Array.isArray(data) && data.length > 0) {
        // Determine precedence: admin > staff > guest
        const roles = data.map((r: any) => r.role) as string[];
        if (roles.includes("admin")) {
          setRole("admin");
        } else if (roles.includes("staff")) {
          setRole("staff");
        } else {
          setRole("guest");
        }
        // If multiple, prefer the first non-null location_id
        const loc = data.find((r: any) => r.location_id)?.location_id ?? data[0].location_id ?? null;
        setLocationId(loc ?? null);
      } else {
        setRole("guest");
        setLocationId(null);
      }
    } catch (err) {
      console.error("Error in role check:", err);
      setRole("guest");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const hasRole = useCallback((checkRole: AppRole): boolean => {
    if (!role) return checkRole === "guest";
    if (role === "admin") return true; // Admin has all roles
    if (role === "staff") return checkRole === "staff" || checkRole === "guest";
    return checkRole === "guest"; // Guests can only access guest roles
  }, [role]);

  return {
    role,
    isAdmin: role === "admin",
    isStaff: role === "staff" || role === "admin",
    isGuest: role === "guest" || role === null,
    isLoading,
    locationId,
    hasRole,
    refetch: fetchRole,
  };
}

/**
 * Hook to protect routes based on roles
 */
export function useRequireRole(requiredRole: AppRole, redirectPath = "/") {
  const { isLoading, hasRole } = useRoleCheck();
  const { user, loading: authLoading } = useAuth();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading || isLoading) {
      setCanAccess(null);
      return;
    }

    if (!user) {
      setCanAccess(false);
      return;
    }

    setCanAccess(hasRole(requiredRole));
  }, [user, authLoading, isLoading, hasRole, requiredRole]);

  return {
    canAccess,
    isLoading: authLoading || isLoading || canAccess === null,
    redirectPath,
  };
}
