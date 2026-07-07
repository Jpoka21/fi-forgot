import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cards = [
  {
    id: "lord_fluffington_v2",
    title: "Lord Fluffington",
    prompt: `A premium greeting card front. A grand museum-quality oil painting in the style of 18th-century Dutch Masters. A regal orange tabby cat sits with perfect aristocratic composure on a velvet throne at the head of an opulent banquet table. With one paw — utterly casual, without even looking — the cat is in the act of sweeping an enormous gilded vase off the edge of the table. Three human servants in full royal livery are frozen mid-lunge, faces twisted in horror, desperately diving to catch it. The cat's expression is one of serene, complete indifference. Dramatic chiaroscuro lighting, deep jewel tones — burgundy, gold, dark mahogany. No text, no numbers. Portrait orientation. Print-quality fine art.`,
  },
  {
    id: "coffee_before_humanity_v2",
    title: "Coffee Before Humanity",
    prompt: `A premium greeting card front. A Renaissance altarpiece-style oil painting. At the center on a raised golden throne sits an enormous, ornate ceramic coffee mug radiating divine golden light. Surrounding the base of the throne, five disheveled courtiers in full period dress — rumpled wigs, velvet jackets, stockings — are prostrated face-down on the marble floor in absolute reverence, arms outstretched. One figure kneels and weeps openly. Another holds up an offering of a tiny sugar cube on a velvet pillow. The scene is painted with total earnestness — no irony in the brushwork, only reverence. Rich baroque palette: deep shadow, heavenly gold light, royal crimson. No text, no numbers. Portrait orientation. Print-quality fine art.`,
  },
  {
    id: "golf_goose_v2",
    title: "Golf Goose",
    prompt: `A premium greeting card front. A museum-quality oil painting in the grand English sporting tradition. In the foreground, a Canada goose stands with its wings fully spread in a stance of absolute territorial fury, neck stretched low and aggressive, hissing directly at the viewer. Beneath the goose: a meticulously arranged nest made of golf balls, twigs, and a bent golf club. In the middle distance, three golfers in full traditional golf attire — pastel polos, white gloves, visors — are sprinting away in full panic across a manicured green fairway. One golfer has dropped their entire bag of clubs mid-flight. The goose is unmoved. Painted with the gravity of a Constable landscape — sweeping sky, dramatic clouds, lush green. No text, no numbers. Portrait orientation. Print-quality fine art.`,
  },
];

const outDir = path.join(process.cwd(), "../../artifacts/fi-forgot/public/humor-v2");
fs.mkdirSync(outDir, { recursive: true });

function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

(async () => {
  for (const card of cards) {
    console.log(`\nGenerating: ${card.title}...`);
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: card.prompt,
      size: "1024x1536",
      quality: "high",
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("Image generation returned no data");
    }
    const imgData = response.data[0];
    const filePath = path.join(outDir, `${card.id}.png`);

    if (imgData.b64_json) {
      const buf = Buffer.from(imgData.b64_json, "base64");
      fs.writeFileSync(filePath, buf);
      console.log(`  Saved: ${filePath}`);
    } else if (imgData.url) {
      await downloadImage(imgData.url, filePath);
      console.log(`  Downloaded: ${filePath}`);
    }
  }
  console.log("\nDone. All 3 images saved to artifacts/fi-forgot/public/humor-v2/");
})();
