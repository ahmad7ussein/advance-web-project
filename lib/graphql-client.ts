"use client"

import { useState, useEffect } from "react"

// Simple GraphQL client
export async function fetchGraphQL(query: string, variables = {}) {
  try {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const { data, errors } = await response.json()

    if (errors) {
      throw new Error(errors.map((e: any) => e.message).join("\n"))
    }

    return data
  } catch (error) {
    console.error("Error fetching GraphQL:", error)
    throw error
  }
}

// Custom hook for GraphQL queries
export function useQuery(query: string, variables = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await fetchGraphQL(query, variables)
        if (isMounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [query, JSON.stringify(variables)])

  return { data, loading, error }
}

// Custom hook for GraphQL mutations
export function useMutation(query: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const executeMutation = async (variables = {}) => {
    try {
      setLoading(true)
      const data = await fetchGraphQL(query, variables)
      setError(null)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { executeMutation, loading, error }
}
