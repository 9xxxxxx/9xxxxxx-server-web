"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendEmail } from "@/app/actions";
import { useEffect, useRef } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const initialState = {
  success: false,
  error: "",
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-indigo-200 dark:shadow-none"
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          Send Message
          <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(sendEmail, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Let's create something together.
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Have a project in mind or just want to chat? Drop me a line below and I'll get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/50 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]">
          <form ref={formRef} action={formAction} className="space-y-6">
            
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="w-full px-6 py-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
                {state.fieldErrors?.name && (
                  <p className="text-red-500 text-xs ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {state.fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  className="w-full px-6 py-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
                {state.fieldErrors?.email && (
                  <p className="text-red-500 text-xs ml-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {state.fieldErrors.email[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Project Inquiry..."
                required
                className="w-full px-6 py-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
              {state.fieldErrors?.subject && (
                <p className="text-red-500 text-xs ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {state.fieldErrors.subject[0]}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Tell me about your project..."
                required
                className="w-full px-6 py-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
              />
              {state.fieldErrors?.message && (
                <p className="text-red-500 text-xs ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {state.fieldErrors.message[0]}
                </p>
              )}
            </div>

            {/* Status Messages */}
            {state.error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {state.error}
                </div>
            )}

            {state.success && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    Message sent successfully! I'll be in touch soon.
                </div>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </section>
  );
}
