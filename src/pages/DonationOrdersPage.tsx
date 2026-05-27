import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Clock, XCircle, Phone, Mail, 
         Building2, MapPin, UtensilsCrossed, Users } from "lucide-react";

interface DonationOrder {
  id: string;
  donation_id: string;
  donor_name: string;
  phone: string;
  email: string;
  ngo_name: string | null;
  servings_claimed: number;
  pickup_address: string;
  message: string | null;
  claim_type: string;
  claimed_at: string;
  status: string;
  // joined from donations
  donations: {
    food_name: string;
    food_type: string;
    quantity_servings: number;
    pickup_time: string;
  } | null;
}

const statusConfig = {
  pending:  { icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200", label: "Pending"  },
  approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Approved" },
  rejected: { icon: XCircle,      color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",   label: "Rejected" },
};

export default function DonationOrdersPage() {
  const [orders, setOrders] = useState<DonationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("donation_claims")
        .select(`
          *,
          donations (
            food_name,
            food_type,
            quantity_servings,
            pickup_time
          )
        `)
        .order("claimed_at", { ascending: false });

      if (error) setError(error.message);
      else setOrders(data ?? []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16 container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Donation Orders</h1>
          <p className="text-gray-500 mt-1">All submitted donation claims and their current status.</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-400">Loading orders...</div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
            Error: {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-bold text-gray-700 text-lg">No donation orders yet</p>
            <p className="text-gray-400 text-sm mt-1">Claims will appear here once submitted.</p>
          </div>
        )}

        {/* Orders List */}
        <div className="flex flex-col gap-5">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] 
                           ?? statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div key={order.id} 
                   className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                
                {/* Status bar */}
                <div className={`px-5 py-3 flex items-center justify-between 
                                 ${status.bg} border-b ${status.border}`}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-sm font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(order.claimed_at).toLocaleString("en-IN", {
                      dateStyle: "medium", timeStyle: "short"
                    })}
                  </span>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Food Info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase 
                                  tracking-wide mb-2">Food Details</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">
                          {order.donations?.food_name ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4 text-emerald-400" />
                        {order.servings_claimed} servings claimed
                        {order.donations?.quantity_servings && 
                          ` of ${order.donations.quantity_servings} available`}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        {order.pickup_address}
                      </div>
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase 
                                  tracking-wide mb-2">Donor Details</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">{order.donor_name}</span>
                        {order.ngo_name && 
                          <span className="text-gray-400">· {order.ngo_name}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        {order.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        {order.email}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {order.message && (
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-xl 
                                    text-sm text-gray-500 italic border border-gray-100">
                      "{order.message}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}