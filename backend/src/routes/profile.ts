import { Router } from "express";
import { supabaseAdmin } from "../supabaseAdmin";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/profile/me
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", req.userId)
    .single();

  if (error) return res.status(404).json({ error: "Profile not found" });
  res.json(data);
});

// PATCH /api/profile/me
router.patch("/me", requireAuth, async (req: AuthRequest, res) => {
  const { org_name, full_name, address, phone } = req.body;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ org_name, full_name, address, phone, updated_at: new Date().toISOString() })
    .eq("id", req.userId)
    .select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;