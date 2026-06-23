const cards = [
  { title: "Lord Fluffington", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/95a18f181c_cover_34d4efb3c8.png" },
  { title: "Holy Coffee", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/664789cfa0_cover_d8cfb9a2d3.png" },
  { title: "Too Many Candles", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/0b9484ae30_cover_0263efb571.png" },
  { title: "Champion of Later", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/8286ecdeef_cover_252bda3bc3.png" },
  { title: "I Did Nothing", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/d483201895_cover_3b530ea56b.png" },
  { title: "Wine O'Clock", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/855672dffd_cover_240b96a51b.png" },
  { title: "Aged to Perfection", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/7afc669b05_cover_769a6b54dd.png" },
  { title: "Inbox Zero (Never)", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/564cce80b4_cover_1dbf32131f.png" },
  { title: "I Tried", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/423d5bd635_cover_54fa2afe08.png" },
  { title: "Both Valid Points", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/e29914b452_cover_90151b5937.png" },
  { title: "Ambitious Reading List", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/0b772905e1_cover_923d6e9c76.png" },
  { title: "Peak Productivity", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/260c8ff0a0_cover_72977632f9.png" },
  { title: "Getting Warmer", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/1f363684bc_cover_02999c6865.png" },
  { title: "A Portrait of Monday", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/e76fb9574a_cover_2c356e75ea.png" },
  { title: "Nailed It", url: "https://d3e924qpzqov0g.cloudfront.net/cardimages/customCards/84163a16ff_cover_50949d6d9f.png" },
];

export default function CardGallery() {
  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", padding: "32px 24px", fontFamily: "sans-serif" }}>
      <h2 style={{ fontFamily: "serif", fontSize: 28, margin: "0 0 24px", color: "#1F1F1F" }}>
        Funny Batch 1 — All 15 Cards
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {cards.map(c => (
          <div key={c.title} style={{ borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.10)" }}>
            <img src={c.url} alt={c.title} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
            <div style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#444", textAlign: "center" }}>{c.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
