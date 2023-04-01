import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const action = async (args: ActionArgs) => {
  const formData = await args.request.formData();
  const name = formData.get("name");
  const content = formData.get("joke");
  if (
    typeof name !== "string" ||
    typeof content !== "string" ||
    !name.trim() ||
    !content.trim()
  ) {
    return new Response("Missing name or joke", { status: 400 });
  }

  const joke = await db.joke.create({
    data: {
      name: name,
      content: content,
    },
  });

  return json({ joke: joke }, { status: 201 });
};
export default function NewJoke() {
  return (
    <form method="POST">
      <legend>Add your own hilarious joke</legend>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "10px" }}>
        <label>
          <span>Name:</span>
          <input type="text" name="name" />
        </label>
        <label>
          <span>Joke:</span>
          <textarea name="joke" />
        </label>
      </div>
      <button type="submit">Add</button>
    </form>
  );
}
