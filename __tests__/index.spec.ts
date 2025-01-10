import { OpenAPI } from "openapi-types";
import { test } from "vitest";

import { codeGenByConfigForTesting } from "@/index";

import doc1 from "../examples/3.0/json/uspto.json";

test("codegen", async () => {
  await codeGenByConfigForTesting(doc1 as unknown as OpenAPI.Document);
});
