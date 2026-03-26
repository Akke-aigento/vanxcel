import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCustomerApi } from "@/integrations/sellqo/useCustomerApi";
import { Loader2, Package, ChevronDown, ChevronUp } from "lucide-react";

const OrdersTab = () => {
  const { t } = useTranslation();
  const api = useCustomerApi();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.getOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">{t("account.noOrders")}</p>
      </div>
    );
  }

  const statusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "completed" || s === "delivered") return "bg-emerald-500/20 text-emerald-400";
    if (s === "processing" || s === "shipped") return "bg-primary/20 text-primary";
    if (s === "cancelled") return "bg-destructive/20 text-destructive";
    return "bg-accent/20 text-accent";
  };

  return (
    <div className="space-y-3 max-w-2xl">
      {orders.map((order: any) => (
        <div key={order.id} className="bg-secondary/30 border border-border/30 rounded-xl overflow-hidden hover:border-primary/20 transition-colors">
          <button
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            className="w-full p-5 flex justify-between items-center text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">#{order.order_number}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("nl-BE")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-foreground">€{Number(order.total || 0).toFixed(2)}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              {expanded === order.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>
          </button>

          {expanded === order.id && order.line_items && (
            <div className="border-t border-border/20 px-5 py-4 space-y-2">
              {order.line_items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}× {item.name || item.product_name}</span>
                  <span className="text-foreground">€{Number(item.total || item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersTab;
