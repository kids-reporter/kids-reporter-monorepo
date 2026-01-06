export default async function Error() {
  return (
    <div
      style={{ width: '95vw' }}
      className="mb-16 flex flex-col items-center justify-center"
    >
      <img
        className="mt-20 mb-16 w-full max-w-72 md:max-w-md lg:max-w-xl"
        src="./assets/images/500_error.png"
        alt="500 Internal Server Error"
        loading="lazy"
      />
      <div className="flex flex-col items-center justify-center gap-2.5">
        <h1 className="text-3xl font-bold md:text-4xl">伺服器遭遇困難⋯⋯</h1>
        <span
          style={{
            fontFamily: 'var(--fontFamily)',
            color: 'var(--paletteColor3)',
          }}
          className="text-base font-medium"
        >
          請稍後或重新整理頁面。
        </span>
      </div>
    </div>
  )
}
