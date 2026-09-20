import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { studentUid, resolveCourse, present } from "../core/context.js";
import { c, log } from "../core/ui.js";

export function register(program: Command): void {
  const chat = program.command("chat").description("Course AI assistant");

  chat
    .command("ask <idOrCode> <message...>")
    .description("Ask the course assistant a question")
    .action(
      action(async function (this: Command, idOrCode: string, message: string[]) {
        const { json } = opts(this);
        const uid = studentUid();
        const co = await resolveCourse(idOrCode);
        const text = message.join(" ");
        const reply = await api.post<any>(`/student/${uid}/course/${co.id}/chat`, { message: text });
        present(json, reply, () => {
          const answer = reply?.reply ?? reply?.message ?? reply?.answer ?? JSON.stringify(reply);
          log.info(c.cyan("assistant: ") + answer);
        });
      })
    );

  chat
    .command("history <idOrCode>")
    .description("Show the assistant chat history")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const uid = studentUid();
        const co = await resolveCourse(idOrCode);
        const data = await api.get<{ messages: any[] }>(`/student/${uid}/course/${co.id}/chat/history`);
        const msgs = data.messages ?? [];
        present(json, msgs, () => {
          if (!msgs.length) return log.warn("No chat history.");
          for (const m of msgs) {
            const who = m.role === "user" ? c.bold("you") : c.cyan("assistant");
            log.info(`${who}: ${m.content ?? m.text ?? ""}`);
          }
        });
      })
    );
}
