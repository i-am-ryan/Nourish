// src/pages/auth/EmailConfirmation.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle, Mail } from "lucide-react";

type Status = "loading" | "success" | "error";

const REDIRECT_AFTER_SUCCESS = "/volunteer";

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("Verifying your session…");

  // read params from callback URL
  const params = useMemo(() => {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    const qs = new URLSearchParams(location.search);
    return {
      access_token: hash.get("access_token") ?? qs.get("access_token"),
      error: hash.get("error") ?? qs.get("error"),
      error_description:
        hash.get("error_description") ?? qs.get("error_description"),
    };
  }, [location.hash, location.search]);

  // try to set session (if tokens are present on the URL)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // handle explicit error from provider
        if (params.error) {
          setStatus("error");
          setMessage(
            params.error_description ||
              "The confirmation link is invalid or expired."
          );
          return;
        }

        if (params.access_token) {
          // Supabase JS will read access_token from URL hash automatically on page load,
          // but we also call getSession to ensure the session exists.
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            setStatus("error");
            setMessage(
              "We couldn’t create a session from your link. Please sign in again."
            );
            return;
          }

          if (!cancelled) {
            setStatus("success");
            setMessage("You’re all set! Redirecting you to your account.");
            // small delay so users see the success state
            setTimeout(() => {
              navigate(REDIRECT_AFTER_SUCCESS, { replace: true });
            }, 800);
          }
          return;
        }

        // No token and no explicit error – treat it as an error
        setStatus("error");
        setMessage("Missing authentication information. Please sign in again.");
      } catch (e) {
        setStatus("error");
        setMessage("Something went wrong while verifying your session.");
      }
    }

    run();

    // safety net: if still loading after 10s, show error prompt
    const t = setTimeout(() => {
      if (!cancelled && status === "loading") {
        setStatus("error");
        setMessage(
          "This is taking longer than expected. Please sign in again."
        );
      }
    }, 10_000);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [navigate, params, status]);

  const getStatusContent = () => {
    if (status === "loading") {
      return (
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing your request…
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait while we verify your information.
          </p>

          {/* NEW: let users bail out if it’s stuck */}
          <Button
            variant="outline"
            onClick={() => navigate("/signin")}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(REDIRECT_AFTER_SUCCESS, { replace: true })}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          </div>
        </div>
      );
    }

    // error
    return (
      <div className="text-center">
        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Please sign in
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => navigate("/signin")}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Mail className="h-7 w-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-center mb-2">
                Authentication Complete
              </h1>
              {getStatusContent()}
              <p className="text-xs text-center text-gray-500 mt-8">
                If this page doesn’t proceed automatically,{" "}
                <Link to="/signin" className="underline">
                  return to Sign In
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
