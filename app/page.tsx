import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  // `?stale` tells proxy.ts to drop the session cookie. Without it, a cookie
  // this check rejected can still decode in the middleware, which would send
  // the request back here forever.
  if (!session || !session.user) {
    redirect("/login?stale=1")
  }

  const role = session.user.role
  if (role === "SUPER_ADMIN") {
    redirect("/admin")
  } else if (role === "PERSONAL_TRAINER") {
    redirect("/trainer")
  } else if (role === "GYM_OWNER") {
    redirect("/owner")
  } else {
    // Members have a portal too; the old branch sent them to /login with an
    // error param nothing rendered, which then bounced them back here.
    redirect("/member")
  }
}
