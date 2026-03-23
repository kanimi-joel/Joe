import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { CreateListingForm } from "@/components/CreateListingForm";
import type { Database } from "@/integrations/supabase/types";
import { ArrowLeft } from "lucide-react";

type Listing = Database["public"]["Tables"]["listings"]["Row"];
type ListingCategory = Database["public"]["Enums"]["listing_category"];

const CATEGORY_LABELS: Record<ListingCategory, string> = {
  jobs: "Jobs",
  housing: "Housing",
  for_sale: "For Sale",
  services: "Services",
  community: "Community",
  gigs: "Gigs",
};

const REGIONS: Record<string, string[]> = {
  Central: [
    "Buikwe", "Bukomansimbi", "Butambala", "Buvuma", "Gomba",
    "Kalangala", "Kalungu", "Kampala", "Kayunga", "Kiboga",
    "Kyankwanzi", "Luweero", "Lwengo", "Lyantonde", "Masaka",
    "Mityana", "Mpigi", "Mubende", "Mukono", "Nakaseke",
    "Nakasongola", "Nansana", "Entebbe", "Wakiso", "Rakai",
    "Sembabule", "Kira", "Makindye Ssabagabo",
  ],
  Western: [
    "Buhweju", "Buliisa", "Bundibugyo", "Bushenyi", "Fort Portal",
    "Hoima", "Ibanda", "Isingiro", "Kabale", "Kabarole",
    "Kamwenge", "Kanungu", "Kasese", "Kibaale", "Kiruhura",
    "Kisoro", "Kyegegwa", "Kyenjojo", "Masindi", "Mbarara",
    "Mitooma", "Ntoroko", "Ntungamo", "Rubanda", "Rubirizi",
    "Rukiga", "Rukungiri", "Sheema",
  ],
  Eastern: [
    "Amuria", "Budaka", "Bududa", "Bugiri", "Bugweri",
    "Bukedea", "Bukwo", "Bulambuli", "Busia", "Butaleja",
    "Buyende", "Iganga", "Jinja", "Kaliro", "Kamuli",
    "Kapchorwa", "Katakwi", "Kibuku", "Kumi", "Kween",
    "Luuka", "Manafwa", "Mayuge", "Mbale", "Namayingo",
    "Namutumba", "Ngora", "Pallisa", "Serere", "Sironko",
    "Soroti", "Tororo",
  ],
  Northern: [
    "Abim", "Adjumani", "Agago", "Alebtong", "Amolatar",
    "Amudat", "Amuru", "Apac", "Arua", "Dokolo",
    "Gulu", "Kaabong", "Kitgum", "Koboko", "Kole",
    "Kotido", "Lamwo", "Lira", "Maracha", "Moroto",
    "Moyo", "Nakapiripirit", "Napak", "Nebbi", "Nwoya",
    "Omoro", "Otuke", "Oyam", "Pader", "Pakwach",
    "Yumbe", "Zombo",
  ],
};

function findRegion(citySlug: string): { city: string; region: string } | null {
  for (const [region, cities] of Object.entries(REGIONS)) {
    const found = cities.find(
      (c) => c.toLowerCase().replace(/\s+/g, "-") === citySlug
    );
    if (found) return { city: found, region };
  }
  return null;
}

const CityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState<ListingCategory | "all">("all");

  const match = citySlug ? findRegion(citySlug) : null;

  const { data: listings, refetch } = useQuery({
    queryKey: ["listings", match?.city],
    queryFn: async () => {
      if (!match) return [];
      let q = supabase
        .from("listings")
        .select("*")
        .eq("city", match.city)
        .order("created_at", { ascending: false });
      if (filterCat !== "all") {
        q = q.eq("category", filterCat);
      }
      const { data } = await q;
      return (data ?? []) as Listing[];
    },
    enabled: !!match,
  });

  if (!match) {
    return (
      <div className="min-h-screen bg-background p-8 text-center font-body">
        <p className="text-muted-foreground">City not found.</p>
        <Link to="/" className="text-link hover:text-link-hover hover:underline text-sm">
          ← Back to directory
        </Link>
      </div>
    );
  }

  const handlePostClick = () => {
    if (!user) {
      setAuthOpen(true);
    } else {
      setShowForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-section-bg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-link hover:text-link-hover">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="font-display font-bold text-lg">{match.city}</h1>
              <span className="text-xs text-muted-foreground font-body">
                {match.region} Region
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={handlePostClick}
                className="h-8 px-3 text-sm font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm"
              >
                + Post
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="h-8 px-3 text-sm font-body text-link hover:text-link-hover hover:underline"
              >
                Log in to post
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs font-body">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-2 py-1 rounded-sm border ${filterCat === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-section-bg"}`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setFilterCat(key as ListingCategory); }}
              className={`px-2 py-1 rounded-sm border ${filterCat === key ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-section-bg"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {showForm && user && (
          <CreateListingForm
            city={match.city}
            region={match.region}
            onSuccess={() => { setShowForm(false); refetch(); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Listings */}
        {listings && listings.length === 0 && (
          <p className="text-sm text-muted-foreground font-body py-8 text-center">
            No listings yet in {match.city}. Be the first to post!
          </p>
        )}

        <div className="space-y-0 divide-y divide-border">
          {listings?.map((listing) => (
            <div key={listing.id} className="py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-body text-muted-foreground uppercase">
                  {CATEGORY_LABELS[listing.category]}
                </span>
                {listing.price != null && (
                  <span className="text-xs font-bold font-body text-foreground">
                    UGX {listing.price.toLocaleString()}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-display font-bold text-foreground">
                {listing.title}
              </h3>
              <p className="text-sm font-body text-foreground mt-0.5 whitespace-pre-wrap">
                {listing.description}
              </p>
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground font-body">
                {listing.contact_email && <span>{listing.contact_email}</span>}
                {listing.contact_phone && <span>{listing.contact_phone}</span>}
                <span>{new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default CityPage;
