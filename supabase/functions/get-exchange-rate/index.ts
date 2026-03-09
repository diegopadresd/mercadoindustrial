import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cache the exchange rate in memory (edge function instances can cache)
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check cache first
    if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
      return new Response(
        JSON.stringify({ 
          rate: cachedRate.rate, 
          cached: true,
          source: 'frankfurter',
          lastUpdated: new Date(cachedRate.timestamp).toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from Frankfurter API (free, no API key required)
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=MXN"
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    const rate = data.rates?.MXN;

    if (!rate) {
      throw new Error("Invalid exchange rate response");
    }

    // Cache the result
    cachedRate = { rate, timestamp: Date.now() };

    return new Response(
      JSON.stringify({ 
        rate, 
        cached: false,
        source: 'frankfurter',
        lastUpdated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    
    // Return fallback rate if API fails
    // Updated March 2026 — review periodically if Frankfurter stays down
    const fallbackRate = 19.5;
    return new Response(
      JSON.stringify({ 
        rate: fallbackRate, 
        cached: false,
        source: 'fallback',
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
