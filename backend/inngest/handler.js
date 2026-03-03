import { serve } from "inngest/express";
import { inngest, functions } from "./index.js";

export const inngestHandler = serve({
  client: inngest,
  functions,
});