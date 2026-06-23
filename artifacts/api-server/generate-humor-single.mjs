import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync, writeFileSync, createWriteStream } from "fs";
import { get } from "https";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const OpenAI = require("./node_modules/openai/index.js");

const client = new OpenAI.default({ apiKey: process.env.OPENAI_API_KEY });

const [id, title, ...promptParts] = process.argv.slice(2);
const prompt = promptParts.join(" ");

const outDir = join(__dirname, "../../fi-forgot/public/humor-v2");
mkdirSync(outDir, { recursive: true });

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, (res) => { res.pipe(file); file.on("finish", () => { file.close(); resolve(); }); }).on("error", reject);
  });
}

console.log(`Generating: ${title}...`);
const response = await client.images.generate({
  model: "gpt-image-1",
  prompt,
  size: "1024x1536",
  quality: "high",
  n: 1,
});

const imgData = response.data[0];
const filePath = join(outDir, `${id}.png`);
if (imgData.b64_json) {
  writeFileSync(filePath, Buffer.from(imgData.b64_json, "base64"));
} else if (imgData.url) {
  await downloadImage(imgData.url, filePath);
}
console.log(`Done: ${filePath}`);
