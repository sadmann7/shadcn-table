import * as React from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { UserAuthForm } from '@/components/user-auth-form'
import { Checkbox } from '@/components/ui/checkbox'

import Link from 'next/link'

export const metadata = {
  title: 'Реєстрація',
  description:
    'Створіть обліковий запис, щоб отримати доступ до всіх можливостей',
}

export default function RegisterPage() {
  // const [isAgryWithPrivacy, setIsAgryWithPrivacy] =
  //   React.useState<boolean>(false)
  // const [isAgryWithTerms, setIsAgryWithTerms] = React.useState<boolean>(false)

  return (
    <div className="container mt-8 grid w-screen flex-col items-center justify-center lg:max-w-none lg:px-0">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8',
        )}
      >
        Увійти
      </Link>
      <div className="hidden h-full bg-muted lg:block" />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Icons.logo className="mx-auto h-6 w-6" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Створити обліковий запис
            </h1>
            {/* <p className="text-sm text-muted-foreground">
              Реєструючи ваш акаунт, Ви підтверджуєте, що ознайомились та
              погодились з
            </p> */}
            {/* <div className="flex cursor-pointer items-center text-sm text-muted-foreground">
              <Link
                target="_blank"
                className="flex items-center underline underline-offset-4"
                href="https://docs.google.com/document/d/e/2PACX-1vSQk54CIrG0gAqMxhYbiu5JRcRkKYEsFjAQXLXQ6APVBvZDovHZMoOvUgbILoTkKmHVXaKVPNMhUA0g/pub"
              >
                <Checkbox id="privacy" />
                <label htmlFor="privacy" className="ml-2 cursor-pointer">
                  Політикою конфіденційності
                </label>
              </Link>
            </div>
            <div className="my-2 flex cursor-pointer items-center text-sm text-muted-foreground">
              <Link
                target="_blank"
                className="flex items-center underline underline-offset-4"
                href="https://docs.google.com/document/d/e/2PACX-1vSQk54CIrG0gAqMxhYbiu5JRcRkKYEsFjAQXLXQ6APVBvZDovHZMoOvUgbILoTkKmHVXaKVPNMhUA0g/pub"
              >
                <Checkbox id="terms" />
                <label className="ml-2 cursor-pointer" htmlFor="terms">
                  Умовами користування
                </label>
              </Link>
            </div> */}
          </div>
          <UserAuthForm type="register" />
        </div>
      </div>
    </div>
  )
}
