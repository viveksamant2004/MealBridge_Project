import { Router } from "express";
import { supabaseAdmin } from "../supabaseAdmin";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/donations — list all active donations
router.get("/", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("donations")
    .select("*, profiles(org_name, role)")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/donations — hotel/restaurant creates a donation
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { title, description, servings, food_type, expires_at, address } = req.body;

  if (!title || !servings) {
    return res.status(400).json({ error: "title and servings are required" });
  }

  const { data, error } = await supabaseAdmin.from("donations").insert({
    donor_id: req.userId,
    title,
    description,
    servings,
    food_type,
    expires_at,
    address,
    status: "available",
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/donations/:id — donor can remove their own listing
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const { error } = await supabaseAdmin
    .from("donations")
    .delete()
    .eq("id", req.params.id)
    .eq("donor_id", req.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;