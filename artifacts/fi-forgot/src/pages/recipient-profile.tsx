import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import {
  getRecipient,
  saveRecipient,
  defaultDelivery,
  RELATIONSHIPS,
  TONES,
  Recipient,
  Relationship,
  Tone,
  DeliveryPreference,
} from "@/lib/data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.enum(RELATIONSHIPS as [Relationship, ...Relationship[]]),
  birthday: z.string().optional(),
  anniversaryDate: z.string().optional(),
  needsMothersDay: z.boolean(),
  needsValentinesDay: z.boolean(),
  needsChristmasHanukkah: z.boolean(),
  tonePreference: z.enum(TONES as [Tone, ...Tone[]]),
  personalityNotes: z.string(),
  kidsNames: z.string(),
  favoriteMemories: z.string(),
  insideJokes: z.string(),
  thingsToAvoid: z.string(),
  emotionalLevel: z.number().min(1).max(5),
  deliveryPreference: z.enum(["Mail it to me", "Mail it directly to her"] as [DeliveryPreference, DeliveryPreference]),
});

type FormData = z.infer<typeof schema>;

export default function RecipientProfilePage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isNew = params.id === "new";
  const [saved, setSaved] = useState(false);

  const existing = isNew ? undefined : getRecipient(params.id);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          name: existing.name,
          relationship: existing.relationship,
          birthday: existing.birthday ?? "",
          anniversaryDate: existing.anniversaryDate ?? "",
          needsMothersDay: existing.needsMothersDay,
          needsValentinesDay: existing.needsValentinesDay,
          needsChristmasHanukkah: existing.needsChristmasHanukkah,
          tonePreference: existing.tonePreference,
          personalityNotes: existing.personalityNotes,
          kidsNames: existing.kidsNames ?? "",
          favoriteMemories: existing.favoriteMemories,
          insideJokes: existing.insideJokes,
          thingsToAvoid: existing.thingsToAvoid,
          emotionalLevel: existing.emotionalLevel,
          deliveryPreference: existing.deliveryPreference,
        }
      : {
          name: "",
          relationship: "Wife",
          birthday: "",
          anniversaryDate: "",
          needsMothersDay: false,
          needsValentinesDay: false,
          needsChristmasHanukkah: false,
          tonePreference: "Sweet",
          personalityNotes: "",
          kidsNames: "",
          favoriteMemories: "",
          insideJokes: "",
          thingsToAvoid: "",
          emotionalLevel: 3,
          deliveryPreference: "Mail it to me",
        },
  });

  const watchRelationship = form.watch("relationship");

  useEffect(() => {
    if (isNew) {
      form.setValue("deliveryPreference", defaultDelivery(watchRelationship));
    }
  }, [watchRelationship, isNew]);

  function onSubmit(data: FormData) {
    const recipient: Recipient = {
      id: isNew ? Date.now().toString() : params.id,
      ...data,
      birthday: data.birthday || undefined,
      anniversaryDate: data.anniversaryDate || undefined,
      kidsNames: data.kidsNames ?? "",
      customDates: existing?.customDates ?? [],
    };
    saveRecipient(recipient);
    setSaved(true);
    setTimeout(() => {
      setLocation("/recipients");
    }, 1200);
  }

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/recipients">
            <button className="p-2 text-[hsl(221,20%,60%)] hover:text-[hsl(221,47%,20%)] hover:bg-[hsl(40,20%,90%)] rounded-lg transition-colors" data-testid="button-back-recipients">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[hsl(221,47%,20%)]">
              {isNew ? "Add recipient" : `Edit ${existing?.name ?? "recipient"}`}
            </h1>
            <p className="text-sm text-[hsl(221,20%,50%)]">
              {isNew ? "Tell us about her so we can write something she'll actually love." : "Keep this profile current so cards stay on point."}
            </p>
          </div>
        </div>

        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-3 text-sm font-semibold">
            Saved. Redirecting you back to recipients...
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic info */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Basic information</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sarah" data-testid="input-recipient-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-relationship">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RELATIONSHIPS.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-birthday" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="anniversaryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anniversary date (if applicable)</FormLabel>
                      <FormControl>
                        <Input type="date" data-testid="input-anniversary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Occasions */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Card occasions</h2>
              {[
                { name: "needsMothersDay" as const, label: "Mother's Day card needed" },
                { name: "needsValentinesDay" as const, label: "Valentine's Day card needed" },
                { name: "needsChristmasHanukkah" as const, label: "Christmas or Hanukkah card needed" },
              ].map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="cursor-pointer">{label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid={`switch-${name}`}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Tone */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)]">Card personality</h2>
              <FormField
                control={form.control}
                name="tonePreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone preference</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tone">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TONES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emotionalLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How emotional should the card be? ({field.value}/5)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={([v]) => field.onChange(v)}
                        className="mt-2"
                        data-testid="slider-emotional-level"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-[hsl(221,20%,60%)] mt-1">
                      <span>Dignified nod</span>
                      <span>Full waterworks</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="personalityNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personality notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What makes her laugh? What does she care about? How does she show love?"
                        rows={3}
                        data-testid="textarea-personality"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kidsNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Her children <span className="font-normal text-[hsl(221,20%,60%)]">(if she's a mom — names & ages)</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Emma (8), Jake (5), Lily (2)"
                        data-testid="input-kids-names"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-[hsl(221,20%,60%)]">This helps us write cards that speak to her as a mom — and know how long she's been one.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="favoriteMemories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite memories together</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Trips, milestones, inside moments..."
                        rows={3}
                        data-testid="textarea-memories"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insideJokes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inside jokes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Things only you two would get..."
                        rows={2}
                        data-testid="textarea-jokes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thingsToAvoid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Things to avoid</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Topics, phrases, or references that won't land well..."
                        rows={2}
                        data-testid="textarea-avoid"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl border border-[hsl(40,20%,85%)] p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[hsl(221,47%,20%)] mb-4">Delivery preference</h2>
              <FormField
                control={form.control}
                name="deliveryPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3"
                        data-testid="radio-delivery"
                      >
                        <div className="flex items-center space-x-3 p-4 border rounded-lg border-[hsl(40,20%,85%)] hover:bg-[hsl(40,20%,97%)] cursor-pointer">
                          <RadioGroupItem value="Mail it to me" id="mail-me" data-testid="radio-mail-to-me" />
                          <Label htmlFor="mail-me" className="cursor-pointer">
                            <div className="font-semibold text-[hsl(221,47%,20%)]">Mail it to me</div>
                            <div className="text-sm text-[hsl(221,20%,50%)]">So you can hand it to her like a hero.</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg border-[hsl(40,20%,85%)] hover:bg-[hsl(40,20%,97%)] cursor-pointer">
                          <RadioGroupItem value="Mail it directly to her" id="mail-her" data-testid="radio-mail-to-her" />
                          <Label htmlFor="mail-her" className="cursor-pointer">
                            <div className="font-semibold text-[hsl(221,47%,20%)]">Mail it directly to her</div>
                            <div className="text-sm text-[hsl(221,20%,50%)]">She gets it straight from us. You get the credit.</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[hsl(6,64%,46%)] hover:bg-[hsl(6,64%,40%)] text-white font-bold py-4 text-base rounded-xl flex items-center justify-center gap-2"
              data-testid="button-save-recipient"
            >
              <Save size={18} /> Save recipient
            </Button>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
