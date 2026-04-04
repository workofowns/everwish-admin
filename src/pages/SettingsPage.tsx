import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Globe, Bell, Shield, Palette } from "lucide-react";

const sections = [
  { icon: Globe, title: "General", desc: "App name, logo, default language", fields: [
    { label: "App Name", value: "EverWish", type: "text" },
    { label: "Default Template", value: "Standard Wish", type: "text" },
    { label: "Support Email", value: "support@everwish.com", type: "text" },
  ]},
  { icon: Bell, title: "Notifications", desc: "Email and push notification preferences", fields: [
    { label: "New User Alerts", value: true, type: "toggle" },
    { label: "Daily Analytics Report", value: true, type: "toggle" },
    { label: "Template Approval Requests", value: false, type: "toggle" },
  ]},
  { icon: Shield, title: "Security", desc: "Authentication and access control", fields: [
    { label: "Two-Factor Authentication", value: true, type: "toggle" },
    { label: "Session Timeout (min)", value: "30", type: "text" },
  ]},
];

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="sub-label mb-1">Configuration</p>
          <h1 className="section-header text-3xl">Settings</h1>
        </div>

        <div className="space-y-5">
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{section.title}</h3>
                  <p className="text-xs text-muted-foreground">{section.desc}</p>
                </div>
              </div>
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{field.label}</label>
                    {field.type === "text" ? (
                      <input
                        defaultValue={field.value as string}
                        className="w-56 px-3 py-2 rounded-xl bg-muted text-sm outline-none focus:ring-2 focus:ring-primary/30 text-right"
                      />
                    ) : (
                      <div className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${field.value ? "bg-primary" : "bg-muted"}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${field.value ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
