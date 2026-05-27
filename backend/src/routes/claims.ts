import { Router } from "express";
import { supabaseAdmin } from "../supabaseAdmin";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/claims — NGO claims a donation
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { donation_id } = req.body;
  if (!donation_id) return res.status(400).json({ error: "donation_id is required" });

  // Mark donation as claimed
  const { error: updateError } = await supabaseAdmin
    .from("donations")
    .update({ status: "claimed", claimed_by: req.userId, claimed_at: new Date().toISOString() })
    .eq("id", donation_id)
    .eq("status", "available");

  if (updateError) return res.status(500).json({ error: updateError.message });

  // Record in claims table
  const { data, error } = await supabaseAdmin.from("claims").insert({
    donation_id,
    ngo_id: req.userId,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// GET /api/claims/mine — fetch claims for logged-in user
router.get("/mine", requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from("claims")
    .select("*, donations(*)")
    .eq("ngo_id", req.userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;