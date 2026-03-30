import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Search, Filter, ExternalLink, Eye, ChevronDown } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "premium";
  wishesCreated: number;
  joined: string;
  lastActive: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Priya Sharma", email: "priya@example.com", plan: "premium", wishesCreated: 47, joined: "2024-01-15", lastActive: "2 min ago" },
  { id: "2", name: "Rahul Mehta", email: "rahul@example.com", plan: "free", wishesCreated: 12, joined: "2024-02-20", lastActive: "1 hr ago" },
  { id: "3", name: "Ananya Kumar", email: "ananya@example.com", plan: "premium", wishesCreated: 89, joined: "2023-11-05", lastActive: "5 min ago" },
  { id: "4", name: "Vikram Patel", email: "vikram@example.com", plan: "free", wishesCreated: 3, joined: "2024-03-10", lastActive: "2 days ago" },
  { id: "5", name: "Sneha Reddy", email: "sneha@example.com", plan: "premium", wishesCreated: 156, joined: "2023-08-22", lastActive: "10 min ago" },
  { id: "6", name: "Amit Desai", email: "amit@example.com", plan: "free", wishesCreated: 8, joined: "2024-04-01", lastActive: "3 hrs ago" },
  { id: "7", name: "Kavita Nair", email: "kavita@example.com", plan: "premium", wishesCreated: 34, joined: "2024-01-30", lastActive: "30 min ago" },
  { id: "8", name: "Rohan Gupta", email: "rohan@example.com", plan: "free", wishesCreated: 21, joined: "2023-12-12", lastActive: "1 day ago" },
];

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "premium">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = mockUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || u.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="sub-label mb-1">User Management</p>
          <h1 className="section-header text-3xl">Users</h1>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {(["all", "free", "premium"] as const).map(plan => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                filterPlan === plan
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1.2fr_0.6fr_0.6fr_0.8fr_0.5fr] gap-4 px-5 py-3 border-b border-border/50">
            {["Name", "Email", "Plan", "Wishes", "Last Active", ""].map(h => (
              <span key={h} className="sub-label">{h}</span>
            ))}
          </div>
          {filtered.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <div
                className="grid grid-cols-[1fr_1.2fr_0.6fr_0.6fr_0.8fr_0.5fr] gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer items-center"
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${user.plan === "premium" ? "text-amber-600" : "text-muted-foreground"}`}>
                  {user.plan}
                </span>
                <span className="text-sm font-semibold text-foreground">{user.wishesCreated}</span>
                <span className="text-xs text-muted-foreground">{user.lastActive}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedUser === user.id ? "rotate-180" : ""}`} />
              </div>

              {/* Expanded: Wish history */}
              {expandedUser === user.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-4 overflow-hidden"
                >
                  <div className="ml-11 p-4 rounded-xl bg-muted/40 space-y-2">
                    <p className="sub-label mb-2">Recent Wishes</p>
                    {[
                      { title: "Birthday Blessing for Mom", date: "Mar 15, 2024", link: "#" },
                      { title: "Diwali Greeting", date: "Nov 12, 2023", link: "#" },
                      { title: "Anniversary Wish", date: "Oct 5, 2023", link: "#" },
                    ].map((wish, wi) => (
                      <div key={wi} className="flex items-center justify-between p-2 rounded-lg hover:bg-card transition-colors">
                        <div>
                          <p className="text-sm font-medium text-foreground">{wish.title}</p>
                          <p className="text-xs text-muted-foreground">{wish.date}</p>
                        </div>
                        <button className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary/80">
                          <ExternalLink className="w-3 h-3" /> View
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;
