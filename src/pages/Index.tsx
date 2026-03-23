import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";

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

const Index = () => {
  const [search, setSearch] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut } = useAuth();

  const filteredRegions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return REGIONS;
    const result: Record<string, string[]> = {};
    for (const [region, towns] of Object.entries(REGIONS)) {
      const filtered = towns.filter((t) => t.toLowerCase().includes(q));
      if (filtered.length > 0) result[region] = filtered;
    }
    return result;
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-section-bg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
          <Link to="/" className="font-display font-bold text-xl tracking-tight text-foreground shrink-0">
            uganda classifieds
          </Link>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find your city..."
              className="w-full h-8 pl-8 pr-3 text-sm border border-border bg-background font-body rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="shrink-0">
            {user ? (
              <button
                onClick={() => signOut()}
                className="text-xs font-body text-link hover:text-link-hover hover:underline"
              >
                Log out ({user.email})
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-xs font-body text-link hover:text-link-hover hover:underline"
              >
                Log in / Sign up
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(filteredRegions).map(([region, towns]) => (
            <section key={region}>
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-foreground bg-section-bg px-2 py-1.5 mb-1">
                {region} Region
              </h2>
              <ul className="space-y-0">
                {towns.map((town) => (
                  <li key={town} className="px-2">
                    <Link
                      to={`/city/${town.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm font-body leading-6 text-link hover:text-link-hover hover:underline"
                    >
                      {town}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {Object.keys(filteredRegions).length === 0 && (
          <p className="text-center text-muted-foreground py-12 font-body">
            No cities found matching "{search}"
          </p>
        )}
      </main>

      <footer className="border-t border-border mt-8 py-4 text-center text-xs text-muted-foreground font-body">
        © {new Date().getFullYear()} Uganda Classifieds
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default Index;
