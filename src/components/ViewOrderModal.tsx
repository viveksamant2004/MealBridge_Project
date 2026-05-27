import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShoppingBag, MapPin, Users, Phone, User,
  MessageSquare, Clock, CheckCircle2, XCircle, Loader2,
  Navigation, Home, CreditCard, ChevronDown, ChevronUp,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FoodOrder {
  id: string;
  listing_id: string;
  hotel_name: string;
  food_type: string;
  quantity_servings: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  pickup_or_delivery: "pickup" | "delivery";
  special_instructions?: string | null;
  ordered_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface ViewOrdersModalProps {
  open: boolean;
  onClose: () => void;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="w-3 h-3" />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const ViewOrdersModal = ({ open, onClose }: ViewOrdersModalProps) => {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetchOrders();
  }, [open]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("food_orders")
        .select("*")
        .order("ordered_at", { ascending: false });

      if (fetchError) throw fetchError;
      setOrders((data as FoodOrder[]) || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="orders-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="orders-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base leading-tight">Your Orders</h2>
                    <p className="text-xs text-gray-400">Food orders you've placed</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-1 px-5 py-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-gray-400">Loading your orders...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <XCircle className="w-8 h-8 text-rose-400" />
                    <p className="text-sm text-rose-500">{error}</p>
                    <button
                      onClick={fetchOrders}
                      className="text-xs text-primary font-semibold underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No orders yet</p>
                    <p className="text-xs text-gray-400 text-center max-w-[200px]">
                      When you place a food order, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orders.map((order, i) => {
                      const status = statusConfig[order.status] ?? statusConfig.pending;
                      const isExpanded = expandedId === order.id;

                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border border-gray-100 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
                        >
                          {/* Order card top */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(order.id)}
                            className="w-full text-left px-4 py-3.5 flex items-start gap-3"
                          >
                            {/* Icon */}
                            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ShoppingBag className="w-4 h-4 text-primary" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-gray-900 text-sm truncate">
                                  {order.hotel_name}
                                </p>
                                <span
                                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${status.color}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {order.food_type} · {order.quantity_servings} serving{order.quantity_servings !== 1 ? "s" : ""}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-1">
                                {formatDate(order.ordered_at)}
                              </p>
                            </div>

                            {/* Expand toggle */}
                            <div className="flex-shrink-0 mt-1 text-gray-400">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </button>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1 border-t border-gray-50">
                                  <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">

                                    {/* Customer */}
                                    <div className="flex items-center gap-2">
                                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">Name</span>
                                      <span className="text-xs font-semibold text-gray-800">{order.customer_name}</span>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">Phone</span>
                                      <span className="text-xs font-semibold text-gray-800">{order.customer_phone}</span>
                                    </div>

                                    {/* Pickup / Delivery */}
                                    <div className="flex items-center gap-2">
                                      {order.pickup_or_delivery === "pickup"
                                        ? <Navigation className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                        : <Home className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">Type</span>
                                      <span className="text-xs font-semibold text-gray-800 capitalize">
                                        {order.pickup_or_delivery}
                                      </span>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-2">
                                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">Address</span>
                                      <span className="text-xs font-semibold text-gray-800 leading-relaxed">
                                        {order.customer_address}
                                      </span>
                                    </div>

                                    {/* Servings */}
                                    <div className="flex items-center gap-2">
                                      <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">Servings</span>
                                      <span className="text-xs font-semibold text-gray-800">
                                        {order.quantity_servings}
                                      </span>
                                    </div>

                                    {/* Special instructions */}
                                    {order.special_instructions && (
                                      <div className="flex items-start gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs text-gray-500 w-20 flex-shrink-0">Notes</span>
                                        <span className="text-xs text-gray-700 italic leading-relaxed">
                                          {order.special_instructions}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loading && orders.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} total
                  </p>
                  <button
                    onClick={fetchOrders}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ViewOrdersModal;