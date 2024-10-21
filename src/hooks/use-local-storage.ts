import * as React from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Use a ref to store the initial value
  const initialValueRef = React.useRef(initialValue)

  const [storedValue, setStoredValue] = React.useState<T>(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return initialValueRef.current
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValueRef.current
    } catch (error) {
      console.error(error)
      return initialValueRef.current
    }
  })

  // Use useEffect to update localStorage after initial render
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue))
      } catch (error) {
        console.error(error)
      }
    }
  }, [key, storedValue])

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === "undefined") {
        return
      }
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}
