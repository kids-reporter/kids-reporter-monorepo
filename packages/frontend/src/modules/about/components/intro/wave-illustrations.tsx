function WaveIllustrations() {
  return (
    <div className="absolute bottom-0 left-1/2 z-3 w-screen -translate-x-1/2">
      <div
        role="presentation"
        className="h-16 w-full bg-[url('/assets/images/about/intro/wave_s.svg')] bg-center bg-repeat-x tablet:hidden"
      ></div>
      <div
        role="presentation"
        className="hidden h-27 w-full bg-[url('/assets/images/about/intro/wave_m.svg')] bg-center bg-repeat-x tablet:block desktop:hidden"
      ></div>
      <div
        role="presentation"
        className="hidden h-30 w-full bg-[url('/assets/images/about/intro/wave_l.svg')] bg-center bg-repeat-x desktop:block hd:hidden"
      ></div>
      <div
        role="presentation"
        className="hidden h-30 w-full bg-[url('/assets/images/about/intro/wave_xl.svg')] bg-center bg-repeat-x hd:block"
      ></div>
    </div>
  )
}

export default WaveIllustrations
