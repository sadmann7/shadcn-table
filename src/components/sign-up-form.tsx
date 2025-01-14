"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  email: z.string().email({
    message: "Неправильний формат електронної пошти",
  }),
  password: z.string().min(8, {
    message: "Пароль повинен містити мінімум 8 символів",
  }),
  name: z.string().min(3, {
    message: "Ім'я повинно містити мінімум 3 символи",
  }),
  // password: z.string(),
  // name: z.string(),
  // role: z.string(),
})

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values)
    // await signIn.email({
    //   email: values.email,
    //   password: values.password,
    // })
    // if (form.formState.errors) {
    //   console.log(form.formState.errors)
    //   return
    // }
    // console.log(1111, values)
    const { data, error } = await signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        // image: undefined,
      },
      {
        onRequest: () => {
          //show loading
          setIsLoading(true)
        },
        onSuccess: () => {
          //redirect to dashboard
          router.push("/dashboard")
        },
        onError: (ctx) => {
          console.log(2222, ctx)
          setIsLoading(false)
          // alert(ctx.error.message)
        },
      }
    )
    // console.log(2222, data, error)
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Зареєструватися</CardTitle>
        <CardDescription>
          Введіть свою електронну пошту нижче, щоб зареєструватися
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Електронна пошта</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  // required
                  //  className={
                  //   form.formState.errors.email ? "border-red-500" : ""
                  // }
                  {...form.register("email")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  // required
                  {...form.register("password")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Ім'я</Label>
                <Input id="name" required {...form.register("name")} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                Зареєструватися
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
