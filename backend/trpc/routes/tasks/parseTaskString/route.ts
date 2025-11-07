import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { generateObject } from "@rork/toolkit-sdk";
import { MOCK_FUND_TARGETS } from "@/mocks/data";
import { TRPCError } from "@trpc/server";

const outputSchema = z.object({
  title: z.string().min(1),
  due_date: z.string().min(1),
  stake_amount: z.number().nonnegative(),
  fund_goal_name: z.string().min(1),
});

const inputSchema = z.object({
  user_input_string: z.string().min(1, "Eingabe darf nicht leer sein."),
});

export default publicProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    const { user_input_string } = input;

    const fundGoalsList: string[] = MOCK_FUND_TARGETS.map((f) => f.name).filter(Boolean);

    const currentDate = new Date().toISOString();
    const fundGoalsString = fundGoalsList.length > 0 ? fundGoalsList.join(", ") : "Keine";

    const systemText = `Du bist ein Aufgaben-Parser. Analysiere den folgenden Text: "${user_input_string}".
Das heutige Datum ist ${currentDate}.
Die verfügbaren Sparziele des Nutzers sind: ${fundGoalsString}.
Gib ein JSON-Objekt mit diesen Schlüsseln zurück: "title" (string), "due_date" (ISO 8601 string), "stake_amount" (number), "fund_goal_name" (string).
Beispiel: Für 'Morgen 18 Uhr Fitness für 10€ ins Urlaubsziel' und heutigem Datum ${currentDate.slice(0,10)}, gib zurück:
{ "title": "Fitness", "due_date": "${currentDate.slice(0,10)}T18:00:00", "stake_amount": 10, "fund_goal_name": "Urlaubsziel" }`;

    try {
      const result = await generateObject({
        messages: [
          { role: "user", content: systemText },
        ],
        schema: outputSchema,
      });

      return result;
    } catch (e) {
      console.error("Fehler bei der KI-Analyse (parseTaskString)", e);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI-Analyse fehlgeschlagen. Bitte versuche es manuell." });
    }
  });
