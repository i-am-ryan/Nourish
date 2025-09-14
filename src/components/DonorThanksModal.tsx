// src/components/DonorThanksModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, HeartHandshake, MapPin, Building2, Phone } from "lucide-react";

type Org = {
  name?: string;
  city?: string;
  suburb?: string | null;
  phone?: string;
  website?: string;
};

type HubPreview = {
  id?: string;
  name?: string;
  city?: string;
  suburb?: string | null;
  address?: string;
  is_active?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  org?: Org | null;
  /** Newly added: show the user’s selected Food Hub details */
  hub?: HubPreview | null;
};

const DonorThanksModal: React.FC<Props> = ({ open, onClose, org, hub }) => {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-full sm:max-w-lg mx-3 sm:mx-0"
            role="dialog"
            aria-modal="true"
          >
            <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-5 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Thank you for your donation!</h3>
                  <p className="text-white/80 text-sm">
                    We’ll route it via your selected Food Hub to a vetted organisation.
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Featured organisation */}
                {org && (org.name || org.city || org.phone || org.website) && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-semibold">Matched Organisation (Gauteng)</h4>
                    </div>
                    <div className="rounded-lg border p-3">
                      {org.name && <div className="text-base font-medium">{org.name}</div>}
                      {(org.city || org.suburb) && (
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {org.city}
                            {org.suburb ? ` • ${org.suburb}` : ""}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {org.phone && (
                          <Badge variant="secondary" className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {org.phone}
                          </Badge>
                        )}
                        {org.website && (
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-sm underline decoration-emerald-500/70 underline-offset-4"
                          >
                            Visit organisation site
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Selected hub preview */}
                {hub && (hub.name || hub.address || hub.city) && (
                  <section className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-semibold">Your Selected Food Hub</h4>
                    </div>
                    <div className="rounded-lg border p-3">
                      {hub.name && <div className="text-base font-medium">{hub.name}</div>}
                      {(hub.city || hub.suburb) && (
                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {hub.city}
                            {hub.suburb ? ` • ${hub.suburb}` : ""}
                          </span>
                        </div>
                      )}
                      {hub.address && (
                        <div className="text-sm text-gray-700 mt-1">{hub.address}</div>
                      )}
                      {hub.is_active === false && (
                        <div className="text-xs text-red-600 mt-2">
                          Note: This hub is currently marked inactive.
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <p className="text-xs text-gray-500">
                  
                </p>

                <div className="pt-2 flex justify-end">
                  <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DonorThanksModal;
