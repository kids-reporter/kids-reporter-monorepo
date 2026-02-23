function WaveIllustrations() {
  return (
    <>
      <div
        className="absolute bottom-0 left-0 z-1 h-[116px] w-full bg-[url(/assets/images/home/topic_wave_back_s.svg)] bg-size-[100%_100%] tablet:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-3px] left-0 z-3 h-[104px] w-full bg-[url(/assets/images/home/topic_wave_front_s.svg)] bg-size-[100%_100%] tablet:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 z-1 hidden h-[120px] w-full -translate-x-[47%] bg-[url(/assets/images/home/topic_wave_back_m.svg)] bg-[length:768px_120px] bg-center bg-repeat-x tablet:block desktop:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-2 left-1/2 z-3 hidden h-[108px] w-full -translate-x-1/2 bg-[url(/assets/images/home/topic_wave_front_m.svg)] bg-[length:768px_108px] bg-center bg-repeat-x tablet:block desktop:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 z-1 hidden h-[144px] w-full -translate-x-1/2 bg-[url(/assets/images/home/topic_wave_back_l.svg)] bg-[length:1024px_144px] bg-center bg-repeat-x desktop:block hd:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-2 left-1/2 z-3 hidden h-[144px] w-full -translate-x-1/2 bg-[url(/assets/images/home/topic_wave_front_l.svg)] bg-[length:1024px_144px] bg-center bg-repeat-x desktop:block hd:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 z-1 hidden h-[240px] w-full -translate-x-1/2 bg-[url(/assets/images/home/topic_wave_back_xl.svg)] bg-[length:1440px_240px] bg-center bg-repeat-x hd:block"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/2 z-3 hidden h-[200px] w-full -translate-x-1/2 bg-[url(/assets/images/home/topic_wave_front_xl.svg)] bg-[length:1440px_200px] bg-center bg-repeat-x hd:block"
        aria-hidden="true"
      />
    </>
  )
}

export default WaveIllustrations
