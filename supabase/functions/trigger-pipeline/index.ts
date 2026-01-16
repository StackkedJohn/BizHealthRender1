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

    // Add job to the pipeline queue (removed priority field)
    const { data: job, error: insertError } = await supabase
      .from("pipeline_queue")
      .insert({
        questionnaire_id,
        user_id,
        status: "pending",
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
