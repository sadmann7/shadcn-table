import { admin } from "@/lib/auth-client"
import { SignInForm } from "@/components/sign-in-form"

export default async function Page() {
  // const user = await admin.createUser({
  //   name: "Alex",
  //   email: "test@example.com",
  //   password: "passworD123456",
  //   role: "admin",
  //   data: {
  //     // any additional on the user table including plugin fields and custom fields
  //     customField: "customValue",
  //   },
  // })
  // console.log(1111, user)
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <SignInForm />
    </div>
  )
}
