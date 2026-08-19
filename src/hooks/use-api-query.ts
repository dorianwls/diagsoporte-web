import { useCallback, useEffect, useRef, useState } from "react"

interface QueryState<T> {
  key: string
  data?: T
  error?: unknown
  isLoading: boolean
  isFetching: boolean
}

export function useApiQuery<T>(
  key: string,
  loader: (signal: AbortSignal) => Promise<T>,
) {
  const loaderRef = useRef(loader)
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<QueryState<T>>({
    key,
    isLoading: true,
    isFetching: true,
  })

  loaderRef.current = loader

  useEffect(() => {
    const controller = new AbortController()

    setState((current) => ({
      key,
      data: current.key === key ? current.data : undefined,
      error: undefined,
      isLoading: current.key !== key || current.data === undefined,
      isFetching: true,
    }))

    void loaderRef.current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ key, data, isLoading: false, isFetching: false })
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ key, error, isLoading: false, isFetching: false })
        }
      })

    return () => controller.abort()
  }, [key, revision])

  const reload = useCallback(() => setRevision((value) => value + 1), [])

  return { ...state, reload }
}
