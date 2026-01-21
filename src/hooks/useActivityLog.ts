import { supabase } from "@/integrations/supabase/client";

interface LogActivityParams {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  userId?: string;
}

// Standalone function for use outside of React components
export const logActivityEvent = async ({
  action,
  entityType,
  entityId,
  details,
  userId
}: LogActivityParams) => {
  try {
    let logUserId = userId;
    
    if (!logUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      logUserId = user?.id;
    }
    
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: logUserId || null,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || null
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Hook for use in React components
export function useActivityLog() {
  const logActivity = async (params: Omit<LogActivityParams, 'userId'>) => {
    await logActivityEvent(params);
  };

  return { logActivity };
}
