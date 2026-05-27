import { Router } from "express";
import { supabaseAdmin } from "../supabaseAdmin";

const router = Router();

// GET /api/stats — public dashboard numbers
router.get("/", async (_, res) => {
  const [donations, claims, orgs] = await Promise.all([
    supabaseAdmin.from("donations").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("claims").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  res.json({
    total_donations: donations.count ?? 0,
    total_claims: claims.count ?? 0,
    total_organizations: orgs.count ?? 0,
  });
});

export default router;