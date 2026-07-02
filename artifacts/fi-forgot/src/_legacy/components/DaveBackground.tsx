const DAVE_IMAGES = [
  "sleeping_on_couch.png", "doghouse.png", "rain_dave.png", "missed_calls.png",
  "sad_dave.png", "broken_vase.png", "couch_sad.png", "wife_list.png",
  "fixing_chair.png", "flowers_store.png", "gas_station_flowers.png", "bbq_dave.png",
  "honey_can_we_talk.png", "pillow_dave.png", "forgot_to_mail.png", "sleeping_with_dog.png",
];

const TILE_ROTATIONS = [
  -8,  4, -3, 10,  -6,  2,  8, -12,
   5, -9,  7, -4,  12,  -2, -7,   6,
  -5,  9, -1,  8, -10,   3,  6,  -8,
   4, -6, 11, -3,   7,  -5,  2,  10,
];

const COLS = 6;
const ROWS = 6;
const TOTAL = COLS * ROWS;

export default function DaveBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        opacity: 0.1,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {Array.from({ length: TOTAL }, (_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px",
          }}
        >
          <img
            src={`/dave/${DAVE_IMAGES[i % DAVE_IMAGES.length]}`}
            alt=""
            draggable={false}
            style={{
              width: "80%",
              height: "80%",
              objectFit: "contain",
              transform: `rotate(${TILE_ROTATIONS[i % TILE_ROTATIONS.length]}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
