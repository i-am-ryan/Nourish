export type Recipient = {
  name: string;
  category: "Orphanage" | "Old Age Home" | "Shelter" | "Food NGO" | "Clinic" | "Community Org";
  website: string;
  location: string; // suburb, city
};

const RECIPIENTS: Record<"Johannesburg" | "Pretoria", Recipient[]> = {
  Johannesburg: [
    { name: "Afrika Tikkun (Alexandra)", category: "Food NGO", website: "https://afrikatikkun.org", location: "Alexandra, Johannesburg" },
    { name: "Rays of Hope", category: "Community Org", website: "https://raysofhope.co.za", location: "Alexandra, Johannesburg" },
    { name: "MES (Mould Empower Serve)", category: "Shelter", website: "https://mes.org.za", location: "Hillbrow, Johannesburg" },
    { name: "Door of Hope", category: "Orphanage", website: "https://doorofhope.co.za", location: "Glenvista, Johannesburg" },
    { name: "Botshabelo", category: "Community Org", website: "https://botshabelo.co.za", location: "Midrand, Johannesburg" },
    { name: "HospiceWits", category: "Clinic", website: "https://hospicewits.co.za", location: "Houghton, Johannesburg" },
    { name: "Salvation Army Johannesburg City Corps", category: "Shelter", website: "https://www.salvationarmy.org.za", location: "Braamfontein, Johannesburg" },
  ],
  Pretoria: [
    { name: "Viva Foundation", category: "Community Org", website: "https://viva-sa.co.za", location: "Mamelodi, Pretoria" },
    { name: "Tshwane Leadership Foundation", category: "Community Org", website: "https://www.tlf.org.za", location: "Inner City, Pretoria" },
    { name: "SOS Children’s Village Pretoria", category: "Orphanage", website: "https://www.sos.org.za", location: "Pretoria" },
    { name: "SA Cares for Life", category: "Community Org", website: "https://sacares.co.za", location: "Centurion, Pretoria" },
    { name: "Mamelodi Initiative", category: "Community Org", website: "https://mamelodi.org", location: "Mamelodi, Pretoria" },
  ],
};

export function pickRecipients(city: "Johannesburg" | "Pretoria", count = 2): Recipient[] {
  const pool = RECIPIENTS[city] ?? RECIPIENTS.Johannesburg;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
