"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn, signOut, useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SubmitButton from "@/components/submit-button"

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })
  const router = useRouter()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const toastId = toast.loading("Входимо...", {
      duration: 2500,
    })
    // console.log(6666, values)
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    })
    // console.log(55555, result)

    if (result?.status === 200) {
      router.push("/dashboard/tasks")
      router.refresh()
      toast.success("Вхід успішний!", {
        id: toastId,
      })
    } else {
      toast.error("Не вдалося увійти. Перевірте дані!", {
        id: toastId,
      })
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Авторизація</CardTitle>
        <CardDescription>
          Введіть ваш юзернейм нижче для авторизації до вашого облікового запису
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Юзернейм</Label>
            <Input id="email" type="email" placeholder="" required />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Пароль</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Забули пароль?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Авторизуватися
          </Button>
          <Button variant="outline" className="w-full">
            Авторизуватися через Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Не маєте облікового запису?{" "}
          <Link href="#" className="underline">
            Зареєструватися
          </Link>
        </div> */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Юзернейм</FormLabel>
                    <FormControl>
                      <Input placeholder="joehndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SubmitButton className="mt-6 w-full">Увійти</SubmitButton>
            {/* <div>dsfsf</div> */}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
