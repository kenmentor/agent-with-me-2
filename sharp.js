import sharp from "sharp";
sharp({
  create: { width: 100, height: 100, channels: 3, background: "red" },
})
  .png()
  .toFile("test.png")
  .then(() => console.log("Sharp works!"))
  .catch(console.error);
