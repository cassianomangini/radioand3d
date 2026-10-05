import assert from "node:assert/strict";
import test from "node:test";
import { studioProducts } from "../src/features/studio/catalog.ts";

test("public studio catalog contains only explainable Shopee products", () => {
  assert.ok(studioProducts.length >= 8);

  for (const product of studioProducts) {
    assert.ok(product.slug);
    assert.ok(product.title);
    assert.ok(product.summary);
    assert.ok(product.description);
    assert.ok(product.images.length >= 3);
    assert.ok(product.measurements.length >= 1);
    assert.ok(product.specs.length >= 3);
    assert.ok(Number.isFinite(Date.parse(product.lastVerifiedAt)));
    assert.match(product.shopeeUrl ?? "", /^https:\/\/shopee\.com\.br\/product\//);
    assert.equal("price" in product, false);
    assert.equal("stock" in product, false);
  }
});

test("product variants never require synthetic media", () => {
  for (const product of studioProducts) {
    for (const variant of product.variants) {
      assert.ok(variant.name);
      if (variant.image) {
        assert.match(variant.image.src, /^https:\/\/cf\.shopee\.com\.br\/file\//);
      }
    }
  }
});
