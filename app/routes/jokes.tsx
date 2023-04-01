import { Link, Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import { ActionArgs, LinksFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";
import { openai } from "~/utils/ai.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const loader = async () => {
  const jokes = await db.joke.findMany();
  return json({ jokes: jokes });
};

export const action = async ({ request }: ActionArgs) => {
  const data = await request.formData();
  const action = data.get("action");
  if (action === "generate-joke") {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Generate a joke about something. Example format:
        Frisbee:I was wondering why the frisbee was getting bigger, then it hit me.
        Skeletons:Why don't skeletons ride roller coasters? They don't have the stomach for it.
      `,
    });
    const aiContent = completion.data.choices[0].text;
    if (aiContent) {
      const [name, content] = aiContent.split(":");
      const newJoke = await db.joke.create({
        data: {
          name: name,
          content: content,
        },
      });
      return redirect("/jokes/" + newJoke.id, { status: 303 });
    }
  }
};

export default function Jokes() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div className="jokes-layout">
      <h1 className="jokes-header">
        {" "}
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
        </div>
      </h1>
      <div className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>

            <ul>
              {data.jokes.map((joke) => (
                <li key={joke.id}>
                  <Link to={`/jokes/${joke.id}`}>{joke.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
            <form method="POST" action="/jokes">
              <button name="action" value="generate-joke" className="button">
                Add random joke
              </button>
            </form>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
