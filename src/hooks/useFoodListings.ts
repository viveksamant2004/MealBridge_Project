// src/hooks/useFoodListings.ts
// Place this file at: src/hooks/useFoodListings.ts

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FoodListing {
  id: string;
  created_at: string;
  updated_at: string;
  hotel_id: string | null;
  title: string;
  description: string | null;
  food_type: string;
  cuisine: string | null;
  quantity_servings: number;
  pickup_address: string;
  pickup_city: string;
  image_url: string | null;
  status: string | null;
  hotel_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  additional_notes: string | null;
}

export function useFoodListings() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const { data, error: sbError } = await supabase
        .from("food_listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbError) {
        setError(sbError.message);
      } else {
        setListings((data as FoodListing[]) ?? []);
      }
      setLoading(false);
    };

    fetchListings();
  }, []);

  // Call this from onSuccess in AddListingModal to instantly show the new listing
  // without waiting for a refetch
  const addListing = (newListing: FoodListing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  const refetch = async () => {
    setLoading(true);
    const { data, error: sbError } = await supabase
      .from("food_listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!sbError) setListings((data as FoodListing[]) ?? []);
    setLoading(false);
  };

  return { listings, loading, error, addListing, refetch };
}