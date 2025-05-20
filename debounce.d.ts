declare module 'debounce' {
  function debounce<T extends (...args: any[]) => any>(
    fn: T,
    wait?: number
  ): T & {
    clear(): void
    flush(): ReturnType<T>
  }

  export default debounce
}
