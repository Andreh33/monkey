import assert from "node:assert/strict";
import test from "node:test";
import { productSchema, productVideoSchema } from "../src/lib/schema";

const product = {
  slug: "test", name: "Test", description: "Product description", shortDesc: "Review",
  price: 100, stock: 1, images: [], youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
};

test("videos without a verified publication date do not emit incomplete rich-result markup", () => {
  assert.equal(productVideoSchema(product), null);
  assert.ok(!("subjectOf" in productSchema(product)));
});

test("known YouTube reviews retain video markup with their actual upload dates", () => {
  for (const [id, date] of [
    ["PRnabWrVOBg", "2023-06-06T02:01:29-07:00"],
    ["mIlPirZU_lo", "2025-08-06T06:10:11-07:00"],
    ["ANVAuzyyFCU", "2024-07-01T06:20:58-07:00"],
  ]) {
    const p = { ...product, youtubeUrl: `https://www.youtube.com/watch?v=${id}` };
    const video = productVideoSchema(p) as Record<string, unknown>;
    assert.equal(video.uploadDate, date);
    assert.equal(video.embedUrl, `https://www.youtube.com/embed/${id}`);
    assert.ok("subjectOf" in productSchema(p));
    assert.ok(!("publisher" in video));
    assert.ok(!("contentUrl" in video)); // a watch page is not a video file
  }
});
