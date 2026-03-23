import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type ListingCategory = Database["public"]["Enums"]["listing_category"];

const CATEGORY_LABELS: Record<ListingCategory, string> = {
  jobs: "Jobs",
  housing: "Housing",
  for_sale: "For Sale",
  services: "Services",
  community: "Community",
  gigs: "Gigs",
};

type Props = {
  city: string;
  region: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export const CreateListingForm = ({ city, region, onSuccess, onCancel }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ListingCategory>("for_sale");
  const [price, setPrice] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("listings").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      city,
      region,
      price: price ? parseFloat(price) : null,
      contact_email: contactEmail.trim() || null,
      contact_phone: contactPhone.trim() || null,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Posted!", description: "Your listing is live." });
      onSuccess();
    }
  };

  const inputClass =
    "w-full h-8 px-2 text-sm border border-border bg-background font-body rounded-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="border border-border bg-background p-4 mb-4">
      <h3 className="font-display font-bold text-sm mb-3">
        Post a listing in {city}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ListingCategory)}
          className={inputClass}
        >
          {Constants.public.Enums.listing_category.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className={inputClass}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={2000}
          rows={4}
          className={`${inputClass} h-auto py-2`}
        />
        <input
          type="number"
          placeholder="Price (optional)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Contact email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="tel"
          placeholder="Contact phone (optional)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className={inputClass}
        />
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="h-8 px-4 text-sm font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-8 px-4 text-sm font-body border border-border hover:bg-section-bg rounded-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
