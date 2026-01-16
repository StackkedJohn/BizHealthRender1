// ============================================================================
// COPY THIS ENTIRE FILE INTO SUPABASE EDGE FUNCTION EDITOR
// ============================================================================
// Function name: trigger-pipeline
//
// Instructions:
// 1. Go to Supabase Dashboard → Edge Functions
// 2. Find "trigger-pipeline" function (or create new one)
// 3. Click Edit
// 4. Delete ALL existing code
// 5. Copy and paste THIS ENTIRE FILE
// 6. Click Deploy
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { questionnaire_id, user_id } = await req.json();

    if (!questionnaire_id || !user_id) {
      throw new Error("questionnaire_id and user_id are required");
    }

    // Check if job already exists for this questionnaire
    const { data: existingJob } = await supabase
      .from("pipeline_queue")
      .select("id, status")
      .eq("questionnaire_id", questionnaire_id)
      .single();

    if (existingJob) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Job already queued",
          job_id: existingJob.id,
          status: existingJob.status
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fetch the questionnaire data to include as payload
    const { data: questionnaireData, error: fetchError } = await supabase
      .from("questionnaires")
      .select("*")
      .eq("id", questionnaire_id)
      .single();

    if (fetchError || !questionnaireData) {
      throw new Error(`Failed to fetch questionnaire: ${fetchError?.message || 'Not found'}`);
    }

    // Add job to the pipeline queue
    // NOTE: Removed "priority" field - column doesn't exist in pipeline_queue table
    const { data: job, error: insertError } = await supabase
      .from("pipeline_queue")
      .insert({
        questionnaire_id,
        user_id,
        status: "pending",
        payload: questionnaireData,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update questionnaire status to processing
    await supabase
      .from("questionnaires")
      .update({ status: "processing" })
      .eq("id", questionnaire_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Pipeline job queued successfully",
        job_id: job.id,
        estimated_time: "30-45 minutes"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Trigger pipeline error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

// ============================================================================
// DEPLOYMENT CHECKLIST:
// ============================================================================
// ✓ Copied entire file
// ✓ Pasted into Supabase Edge Function editor
// ✓ Clicked Deploy
// ✓ Tested by submitting a questionnaire
// ✓ Checked Edge Function logs for success
// ✓ Verified job appeared in pipeline_queue table
// ============================================================================
