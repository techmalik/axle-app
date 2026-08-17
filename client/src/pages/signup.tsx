import { useState } from "react";
import { usePageMeta } from "@/lib/use-page-meta";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

function LogoMark({ size = 28, color = "white" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="shrink-0">
      <circle cx="14" cy="14" r="11.5" stroke={color} strokeWidth="2" />
      <circle cx="14" cy="14" r="4" fill={color} />
    </svg>
  );
}

const COMPANY_SIZE_OPTIONS = ["1–10", "11–50", "51–200", "200+"] as const;

const requestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid work email is required"),
  orgName: z.string().min(1, "Organization name is required"),
  companySize: z.enum(COMPANY_SIZE_OPTIONS, { required_error: "Please select a company size" }),
  message: z.string().optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

export default function SignupPage() {
  usePageMeta({
    title: "Request access — Axle",
    description: "Request access to Axle and get your account set up by our team. Manage independent contractors with timesheets, invoices, and performance reviews.",
    canonical: "https://axlehq.app/signup",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      orgName: "",
      companySize: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: RequestForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const body = await res.json().catch(() => ({}));
        toast({
          title: "Something went wrong",
          description: body?.error || "We couldn't send your request. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "We couldn't send your request. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex bg-sidebar relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='11' stroke='white' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3.5' fill='white'/%3E%3C/svg%3E\")",
            backgroundSize: "60px 60px",
          }}
        />
        <a href="/" className="relative flex items-center gap-2.5 no-underline">
          <LogoMark size={28} color="white" />
          <span className="text-gray-50 text-lg font-bold tracking-tight">Axle</span>
        </a>

        <div className="relative">
          <h2 className="text-4xl font-serif font-normal text-gray-50 leading-[1.12] mb-5">
            Contractor ops,
            <br />
            <em>without the spreadsheets.</em>
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-10 max-w-[360px]">
            We'll set up your organization and send you login details within 24 hours. No card needed during setup.
          </p>
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-[22px] py-5">
            <p className="text-sm text-gray-400 leading-relaxed mb-3.5">
              "Axle cut our timesheet approval process from two days to about ten minutes. I can't imagine going back."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-full bg-[#1C2230] border border-[#2A3545] flex items-center justify-center shrink-0">
                <span className="text-[#8DAFC8] text-[10.5px] font-bold">MR</span>
              </div>
              <div>
                <div className="text-[12.5px] font-semibold text-gray-200">Marcus Rivera</div>
                <div className="text-[11.5px] text-gray-600">Head of Operations, Meridian</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative text-[11.5px] text-gray-700">axlehq.app</div>
      </div>

      {/* Right: form or confirmation */}
      <div className="bg-white flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[400px]">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-5" strokeWidth={1.5} />
              <h1 className="text-[24px] font-bold text-gray-900 tracking-tight mb-3">Request received</h1>
              <p className="text-[15px] text-gray-500 leading-relaxed">
                We'll set up your account and send login details within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-1.5">Request access</h1>
              <p className="text-sm text-gray-500 mb-8">Tell us about your team and we'll get you set up.</p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-[18px]">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-gray-700">First name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="h-auto border-[1.5px] rounded-lg px-3.5 py-2.5 text-sm text-gray-900"
                              {...field}
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-gray-700">Last name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="h-auto border-[1.5px] rounded-lg px-3.5 py-2.5 text-sm text-gray-900"
                              {...field}
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-gray-700">Work email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@company.com"
                            className="h-auto border-[1.5px] rounded-lg px-3.5 py-2.5 text-sm text-gray-900"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="orgName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-gray-700">Organization name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Inc."
                            className="h-auto border-[1.5px] rounded-lg px-3.5 py-2.5 text-sm text-gray-900"
                            {...field}
                            data-testid="input-organization"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-gray-700">Company size</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-auto border-[1.5px] rounded-lg px-3.5 py-2.5 text-sm text-gray-900" data-testid="select-company-size">
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COMPANY_SIZE_OPTIONS.map((size) => (
                              <SelectItem key={size} value={size}>{size} employees</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-gray-700">
                          Anything else? <span className="text-gray-400 font-normal">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your team or any specific needs…"
                            className="border-[1.5px] rounded-lg px-3.5 py-2.5 text-sm text-gray-900 resize-none min-h-[80px]"
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading} data-testid="button-submit">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending request…
                      </>
                    ) : (
                      "Request access"
                    )}
                  </Button>
                </form>
              </Form>

              <p className="text-[12.5px] text-gray-400 text-center mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-primary font-medium no-underline">
                  Sign in
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
